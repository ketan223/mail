const dns = require('dns').promises;
const suppressionService = require('./suppressionService');

// RFC 5321 & standard email validation regex
const EMAIL_SYNTAX_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * In-memory Domain DNS Cache with TTL (default 1 hour = 3600000 ms)
 */
class DomainDnsCache {
  constructor(defaultTtlMs = 60 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(domain) {
    const key = (domain || '').toLowerCase().trim();
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(domain, data, ttlMs = this.defaultTtlMs) {
    const key = (domain || '').toLowerCase().trim();
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }
}

const domainDnsCache = new DomainDnsCache();

/**
 * 1. SYNTAX VALIDATION & NORMALIZATION
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return trimmed;
  const localPart = trimmed.substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1).toLowerCase();
  return `${localPart}@${domain}`;
}

function validateSyntax(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is empty or not a string' };
  }

  const trimmed = email.trim();

  // Overall length limit (RFC 5321: 254 chars max)
  if (trimmed.length > 254) {
    return { valid: false, reason: 'Email address exceeds maximum length of 254 characters' };
  }

  // Check @ presence
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { valid: false, reason: atCount === 0 ? 'Missing @ symbol' : 'Multiple @ symbols found' };
  }

  const [localPart, domain] = trimmed.split('@');

  // Local-part checks (RFC 5321: 64 chars max)
  if (!localPart || localPart.length === 0) {
    return { valid: false, reason: 'Local-part before @ is empty' };
  }
  if (localPart.length > 64) {
    return { valid: false, reason: 'Local-part exceeds maximum length of 64 characters' };
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valid: false, reason: 'Local-part cannot start or end with a dot' };
  }
  if (localPart.includes('..')) {
    return { valid: false, reason: 'Local-part cannot contain consecutive dots (..)' };
  }

  // Domain checks
  if (!domain || domain.length === 0) {
    return { valid: false, reason: 'Domain after @ is empty' };
  }
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, reason: 'Domain cannot start or end with a dot' };
  }
  if (domain.includes('..')) {
    return { valid: false, reason: 'Domain cannot contain consecutive dots (..)' };
  }

  // Domain must contain at least one dot separating name and TLD
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { valid: false, reason: 'Domain must contain a valid TLD (e.g. .com, .org)' };
  }

  // TLD check: must be at least 2 characters, alphabetic only
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { valid: false, reason: `Invalid TLD '.${tld}': TLD must be at least 2 letters` };
  }

  // Label checks (RFC 1035: labels up to 63 chars, alphanumeric with hyphens, not starting or ending with hyphen)
  for (const part of domainParts) {
    if (part.length === 0) {
      return { valid: false, reason: 'Domain contains empty label' };
    }
    if (part.length > 63) {
      return { valid: false, reason: 'Domain label exceeds 63 characters' };
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      return { valid: false, reason: 'Domain label cannot start or end with a hyphen' };
    }
  }

  // Regex check for allowed characters
  if (!EMAIL_SYNTAX_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Email contains invalid characters' };
  }

  return {
    valid: true,
    normalized: normalizeEmail(trimmed),
    localPart,
    domain: domain.toLowerCase()
  };
}

/**
 * 2. DOMAIN VALIDATION (DNS MX + A/AAAA FALLBACK + NXDOMAIN + ERROR DIFFERENTIATION)
 */
async function resolveDomainDns(domain, { bypassCache = false, dnsResolver = dns } = {}) {
  const normDomain = (domain || '').toLowerCase().trim();
  if (!normDomain) {
    return {
      isDeliverable: false,
      hasMx: false,
      hasImplicitMx: false,
      isTemporaryFailure: false,
      status: 'invalid',
      reason: 'Empty domain'
    };
  }

  if (!bypassCache) {
    const cached = domainDnsCache.get(normDomain);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  // 1. First attempt: MX records
  try {
    const mxRecords = await dnsResolver.resolveMx(normDomain);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      // Sort MX by preference (lowest number = highest priority)
      const sortedMx = mxRecords.sort((a, b) => a.preference - b.preference);
      const result = {
        isDeliverable: true,
        hasMx: true,
        hasImplicitMx: false,
        isTemporaryFailure: false,
        status: 'valid',
        reason: `MX records found (${sortedMx.length} servers configured, primary: ${sortedMx[0].exchange})`,
        mxRecords: sortedMx
      };
      domainDnsCache.set(normDomain, result);
      return result;
    }
  } catch (err) {
    const code = err.code || '';

    // Handle Temporary DNS Failures separately: SERVFAIL, TIMEOUT, ETIMEOUT, EREFUSED
    if (code === 'ETIMEOUT' || code === 'SERVFAIL' || code === 'ECONNREFUSED' || code === 'EREFUSED' || /timeout/i.test(err.message)) {
      return {
        isDeliverable: false,
        hasMx: false,
        hasImplicitMx: false,
        isTemporaryFailure: true,
        status: 'inconclusive',
        reason: `Temporary DNS failure querying MX for ${normDomain} (${code || err.message}). Deferring validation.`
      };
    }

    // NXDOMAIN: Domain itself does not exist in DNS
    if (code === 'ENOTFOUND') {
      const result = {
        isDeliverable: false,
        hasMx: false,
        hasImplicitMx: false,
        isTemporaryFailure: false,
        status: 'invalid',
        reason: `Domain does not exist in DNS (NXDOMAIN: ${normDomain})`
      };
      // Cache NXDOMAIN for a shorter period (e.g. 10 minutes)
      domainDnsCache.set(normDomain, result, 10 * 60 * 1000);
      return result;
    }

    // NODATA / ENODATA: Domain exists, but no MX record. Proceed to RFC 5321 A/AAAA fallback check!
  }

  // 2. Second attempt (RFC 5321 Fallback): If MX is missing, check A or AAAA records for implicit MX routing
  try {
    let aRecords = [];
    let aaaaRecords = [];

    try {
      aRecords = await dnsResolver.resolve4(normDomain);
    } catch (e) {
      if (e.code === 'ETIMEOUT' || e.code === 'SERVFAIL') {
        return {
          isDeliverable: false,
          hasMx: false,
          hasImplicitMx: false,
          isTemporaryFailure: true,
          status: 'inconclusive',
          reason: `Temporary DNS failure querying A record for ${normDomain} (${e.code}). Deferring validation.`
        };
      }
    }

    try {
      aaaaRecords = await dnsResolver.resolve6(normDomain);
    } catch (e) {
      if (e.code === 'ETIMEOUT' || e.code === 'SERVFAIL') {
        return {
          isDeliverable: false,
          hasMx: false,
          hasImplicitMx: false,
          isTemporaryFailure: true,
          status: 'inconclusive',
          reason: `Temporary DNS failure querying AAAA record for ${normDomain} (${e.code}). Deferring validation.`
        };
      }
    }

    const hasA = Array.isArray(aRecords) && aRecords.length > 0;
    const hasAaaa = Array.isArray(aaaaRecords) && aaaaRecords.length > 0;

    if (hasA || hasAaaa) {
      // RFC 5321 Section 5.1: Valid implicit MX routing
      const result = {
        isDeliverable: true,
        hasMx: false,
        hasImplicitMx: true,
        isTemporaryFailure: false,
        status: 'valid',
        reason: `No MX records found, but valid implicit MX routing exists via RFC 5321 (A/AAAA records: ${[...aRecords, ...aaaaRecords].slice(0, 2).join(', ')})`,
        ipRecords: { ipv4: aRecords, ipv6: aaaaRecords }
      };
      domainDnsCache.set(normDomain, result);
      return result;
    }

    // Neither MX nor A/AAAA records found
    const invalidResult = {
      isDeliverable: false,
      hasMx: false,
      hasImplicitMx: false,
      isTemporaryFailure: false,
      status: 'invalid',
      reason: `Domain ${normDomain} has no MX records and no A/AAAA fallback mail routing.`
    };
    domainDnsCache.set(normDomain, invalidResult);
    return invalidResult;
  } catch (err) {
    const code = err.code || '';
    if (code === 'ETIMEOUT' || code === 'SERVFAIL') {
      return {
        isDeliverable: false,
        hasMx: false,
        hasImplicitMx: false,
        isTemporaryFailure: true,
        status: 'inconclusive',
        reason: `Temporary DNS failure during A/AAAA fallback query for ${normDomain} (${code}). Deferring validation.`
      };
    }
    return {
      isDeliverable: false,
      hasMx: false,
      hasImplicitMx: false,
      isTemporaryFailure: false,
      status: 'invalid',
      reason: `DNS lookup failed for ${normDomain}: ${err.message}`
    };
  }
}

/**
 * 3. MAILBOX VALIDATION PROVIDER INTERFACE & ADAPTERS
 */

/**
 * Base Abstract Provider Interface
 */
class EmailVerificationProvider {
  constructor(name = 'base') {
    this.name = name;
  }

  /**
   * Verify an email address with the provider
   * @param {string} email
   * @returns {Promise<{ isConfigured: boolean, status: 'valid'|'invalid'|'inconclusive', reason: string, details?: any }>}
   */
  async verifyMailbox(email) {
    throw new Error('verifyMailbox must be implemented by subclass');
  }
}

/**
 * Default No-op / Local DNS Provider (when no external verification API key is provided)
 * Adheres strictly to the requirement: "Never claim that MX records alone prove that a mailbox exists."
 */
class LocalDnsOnlyProvider extends EmailVerificationProvider {
  constructor() {
    super('local_dns');
  }

  async verifyMailbox(email) {
    return {
      isConfigured: false,
      status: 'inconclusive',
      reason: 'No third-party mailbox verification API configured. DNS MX/A routing confirms domain-level deliverability, but mailbox existence cannot be proven without an external verification provider.',
      isMailboxConfirmed: false
    };
  }
}

/**
 * Abstract API Email Validation Adapter
 * https://www.abstractapi.com/api/email-verification-validation-api
 */
class AbstractApiProvider extends EmailVerificationProvider {
  constructor(apiKey) {
    super('abstract');
    this.apiKey = apiKey;
  }

  async verifyMailbox(email) {
    if (!this.apiKey) {
      return { isConfigured: false, status: 'inconclusive', reason: 'Abstract API key missing' };
    }
    try {
      const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(this.apiKey)}&email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          return { isConfigured: true, status: 'inconclusive', reason: 'Abstract API rate limit reached. Deferring validation.' };
        }
        return { isConfigured: true, status: 'inconclusive', reason: `Abstract API HTTP error ${res.status}` };
      }
      const data = await res.json();
      // deliverability: 'DELIVERABLE', 'UNDELIVERABLE', 'RISKY', 'UNKNOWN'
      const deliverability = (data.deliverability || '').toUpperCase();
      const isSmtpValid = data.is_smtp_valid && data.is_smtp_valid.value;

      if (deliverability === 'DELIVERABLE' && isSmtpValid) {
        return { isConfigured: true, status: 'valid', reason: 'Abstract API confirmed mailbox deliverable', details: data };
      } else if (deliverability === 'UNDELIVERABLE' || isSmtpValid === false) {
        return { isConfigured: true, status: 'invalid', reason: 'Abstract API reported mailbox undeliverable', details: data };
      } else {
        return { isConfigured: true, status: 'inconclusive', reason: `Abstract API status: ${deliverability || 'RISKY'}`, details: data };
      }
    } catch (err) {
      return { isConfigured: true, status: 'inconclusive', reason: `Abstract API request failed: ${err.message}` };
    }
  }
}

/**
 * ZeroBounce Provider Adapter
 * https://www.zerobounce.net/docs/
 */
class ZeroBounceProvider extends EmailVerificationProvider {
  constructor(apiKey) {
    super('zerobounce');
    this.apiKey = apiKey;
  }

  async verifyMailbox(email) {
    if (!this.apiKey) {
      return { isConfigured: false, status: 'inconclusive', reason: 'ZeroBounce API key missing' };
    }
    try {
      const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(this.apiKey)}&email=${encodeURIComponent(email)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          return { isConfigured: true, status: 'inconclusive', reason: 'ZeroBounce rate limit reached. Deferring validation.' };
        }
        return { isConfigured: true, status: 'inconclusive', reason: `ZeroBounce HTTP error ${res.status}` };
      }
      const data = await res.json();
      // status: 'valid', 'invalid', 'catch-all', 'unknown', 'spamtrap', 'abuse', 'do_not_mail'
      const status = (data.status || '').toLowerCase();

      if (status === 'valid') {
        return { isConfigured: true, status: 'valid', reason: 'ZeroBounce verified mailbox active', details: data };
      } else if (status === 'invalid' || status === 'spamtrap' || status === 'do_not_mail') {
        return { isConfigured: true, status: 'invalid', reason: `ZeroBounce marked mailbox ${status} (${data.sub_status || ''})`, details: data };
      } else {
        return { isConfigured: true, status: 'inconclusive', reason: `ZeroBounce inconclusive status: ${status}`, details: data };
      }
    } catch (err) {
      return { isConfigured: true, status: 'inconclusive', reason: `ZeroBounce request failed: ${err.message}` };
    }
  }
}

/**
 * Hunter.io Provider Adapter
 * https://hunter.io/api-documentation/v2#email-verifier
 */
class HunterProvider extends EmailVerificationProvider {
  constructor(apiKey) {
    super('hunter');
    this.apiKey = apiKey;
  }

  async verifyMailbox(email) {
    if (!this.apiKey) {
      return { isConfigured: false, status: 'inconclusive', reason: 'Hunter API key missing' };
    }
    try {
      const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${encodeURIComponent(this.apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 429) {
          return { isConfigured: true, status: 'inconclusive', reason: 'Hunter rate limit reached. Deferring validation.' };
        }
        return { isConfigured: true, status: 'inconclusive', reason: `Hunter HTTP error ${res.status}` };
      }
      const json = await res.json();
      const data = json.data || {};
      // result: 'deliverable', 'undeliverable', 'risky'
      const result = (data.result || '').toLowerCase();

      if (result === 'deliverable') {
        return { isConfigured: true, status: 'valid', reason: 'Hunter verified mailbox deliverable', details: data };
      } else if (result === 'undeliverable') {
        return { isConfigured: true, status: 'invalid', reason: 'Hunter marked mailbox undeliverable', details: data };
      } else {
        return { isConfigured: true, status: 'inconclusive', reason: `Hunter status: ${result}`, details: data };
      }
    } catch (err) {
      return { isConfigured: true, status: 'inconclusive', reason: `Hunter request failed: ${err.message}` };
    }
  }
}

/**
 * Provider Factory
 */
function getVerificationProvider() {
  const providerType = (process.env.EMAIL_VERIFICATION_PROVIDER || '').toLowerCase().trim();
  const apiKey = process.env.EMAIL_VERIFICATION_API_KEY || '';

  if (providerType === 'abstract' || process.env.ABSTRACT_API_KEY) {
    return new AbstractApiProvider(apiKey || process.env.ABSTRACT_API_KEY);
  }
  if (providerType === 'zerobounce' || process.env.ZEROBOUNCE_API_KEY) {
    return new ZeroBounceProvider(apiKey || process.env.ZEROBOUNCE_API_KEY);
  }
  if (providerType === 'hunter' || process.env.HUNTER_API_KEY) {
    return new HunterProvider(apiKey || process.env.HUNTER_API_KEY);
  }

  return new LocalDnsOnlyProvider();
}

/**
 * 4. MASTER RECIPIENT VALIDATOR
 * Executes the complete validation pipeline:
 * Syntax -> Normalization -> Suppression check -> Domain DNS check -> Mailbox Verification Provider
 * 
 * Enforces rule:
 * "If validation is inconclusive, defer the email rather than treating it as valid."
 */
async function validateRecipient(rawEmail, {
  customDnsResolver = dns,
  customProvider = null,
  bypassCache = false
} = {}) {
  // Step 1: Syntax Validation & Normalization
  const syntaxCheck = validateSyntax(rawEmail);
  if (!syntaxCheck.valid) {
    const record = suppressionService.logAudit({
      email: rawEmail || '',
      validation_status: 'invalid',
      validation_reason: syntaxCheck.reason,
      bounce_type: null,
      suppression_status: false
    });
    return {
      email: rawEmail,
      normalizedEmail: rawEmail,
      canSend: false,
      isValid: false,
      isSuppressed: false,
      isInconclusive: false,
      status: 'invalid',
      reason: syntaxCheck.reason
    };
  }

  const normalizedEmail = syntaxCheck.normalized;
  const domain = syntaxCheck.domain;

  // Step 2: Suppression Check
  if (suppressionService.isSuppressed(normalizedEmail)) {
    const suppRecord = suppressionService.getSuppressionRecord(normalizedEmail);
    const reason = `Email is in suppression list: ${suppRecord?.reason || 'Suppressed due to previous bounce'}`;
    return {
      email: rawEmail,
      normalizedEmail,
      canSend: false,
      isValid: false,
      isSuppressed: true,
      isInconclusive: false,
      status: 'suppressed',
      reason,
      suppressionRecord: suppRecord
    };
  }

  // Step 3: Domain DNS Check (MX + A/AAAA RFC 5321 fallback)
  const dnsResult = await resolveDomainDns(domain, { bypassCache, dnsResolver: customDnsResolver });

  // Handle temporary DNS errors: must be deferred, NOT permanently rejected!
  if (dnsResult.isTemporaryFailure) {
    suppressionService.logAudit({
      email: normalizedEmail,
      validation_status: 'inconclusive',
      validation_reason: dnsResult.reason,
      bounce_type: 'soft',
      suppression_status: false
    });
    return {
      email: rawEmail,
      normalizedEmail,
      canSend: false,
      isValid: false,
      isSuppressed: false,
      isInconclusive: true,
      status: 'inconclusive',
      reason: dnsResult.reason,
      dnsResult
    };
  }

  // Handle permanent domain errors (e.g. NXDOMAIN, no MX and no A/AAAA)
  if (!dnsResult.isDeliverable) {
    suppressionService.logAudit({
      email: normalizedEmail,
      validation_status: 'invalid',
      validation_reason: dnsResult.reason,
      bounce_type: 'hard',
      suppression_status: false
    });
    return {
      email: rawEmail,
      normalizedEmail,
      canSend: false,
      isValid: false,
      isSuppressed: false,
      isInconclusive: false,
      status: 'invalid',
      reason: dnsResult.reason,
      dnsResult
    };
  }

  // Step 4: Mailbox Verification Provider Check
  const provider = customProvider || getVerificationProvider();
  const providerResult = await provider.verifyMailbox(normalizedEmail);

  if (providerResult.isConfigured) {
    if (providerResult.status === 'invalid') {
      suppressionService.logAudit({
        email: normalizedEmail,
        validation_status: 'invalid',
        validation_reason: providerResult.reason,
        bounce_type: 'hard',
        suppression_status: false,
        details: providerResult.details
      });
      return {
        email: rawEmail,
        normalizedEmail,
        canSend: false,
        isValid: false,
        isSuppressed: false,
        isInconclusive: false,
        status: 'invalid',
        reason: providerResult.reason,
        providerResult
      };
    } else if (providerResult.status === 'inconclusive') {
      // Inconclusive policy: Defer email rather than treating it as valid!
      suppressionService.logAudit({
        email: normalizedEmail,
        validation_status: 'inconclusive',
        validation_reason: providerResult.reason,
        bounce_type: null,
        suppression_status: false,
        details: providerResult.details
      });
      return {
        email: rawEmail,
        normalizedEmail,
        canSend: false,
        isValid: false,
        isSuppressed: false,
        isInconclusive: true,
        status: 'inconclusive',
        reason: providerResult.reason,
        providerResult
      };
    }
  }

  // Valid domain with verified deliverability!
  const finalReason = dnsResult.hasMx
    ? `Domain MX records confirmed (${dnsResult.mxRecords.length} mail servers). Deliverable.`
    : dnsResult.reason;

  suppressionService.logAudit({
    email: normalizedEmail,
    validation_status: 'valid',
    validation_reason: finalReason,
    bounce_type: null,
    suppression_status: false,
    details: { dnsResult, provider: provider.name }
  });

  return {
    email: rawEmail,
    normalizedEmail,
    canSend: true,
    isValid: true,
    isSuppressed: false,
    isInconclusive: false,
    status: 'valid',
    reason: finalReason,
    dnsResult,
    provider: provider.name
  };
}

module.exports = {
  normalizeEmail,
  validateSyntax,
  resolveDomainDns,
  validateRecipient,
  domainDnsCache,
  EmailVerificationProvider,
  LocalDnsOnlyProvider,
  AbstractApiProvider,
  ZeroBounceProvider,
  HunterProvider,
  getVerificationProvider
};
