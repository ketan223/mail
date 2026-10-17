const assert = require('assert');
const {
  validateSyntax,
  normalizeEmail,
  resolveDomainDns,
  validateRecipient,
  EmailVerificationProvider,
  domainDnsCache
} = require('../services/emailValidator');
const suppressionService = require('../services/suppressionService');

console.log('====================================================');
console.log('🧪 RUNNING PRODUCTION EMAIL VALIDATION & BOUNCE SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}\n   ${err.stack}`);
    failedTests++;
  }
}

// -------------------------------------------------------------------
// Mock DNS Resolver for Controlled Offline Unit Testing (Zero Real Net)
// -------------------------------------------------------------------
class MockDnsResolver {
  constructor(domainMap = {}) {
    this.domainMap = domainMap;
  }

  async resolveMx(domain) {
    const entry = this.domainMap[domain.toLowerCase()];
    if (!entry) {
      const err = new Error(`queryMx ENOTFOUND ${domain}`);
      err.code = 'ENOTFOUND';
      throw err;
    }
    if (entry.timeout) {
      const err = new Error(`queryMx ETIMEOUT ${domain}`);
      err.code = 'ETIMEOUT';
      throw err;
    }
    if (entry.servfail) {
      const err = new Error(`queryMx SERVFAIL ${domain}`);
      err.code = 'SERVFAIL';
      throw err;
    }
    if (entry.mx) {
      return entry.mx;
    }
    const err = new Error(`queryMx ENODATA ${domain}`);
    err.code = 'ENODATA';
    throw err;
  }

  async resolve4(domain) {
    const entry = this.domainMap[domain.toLowerCase()];
    if (!entry) {
      const err = new Error(`queryA ENOTFOUND ${domain}`);
      err.code = 'ENOTFOUND';
      throw err;
    }
    if (entry.timeout) {
      const err = new Error(`queryA ETIMEOUT ${domain}`);
      err.code = 'ETIMEOUT';
      throw err;
    }
    if (entry.a) {
      return entry.a;
    }
    const err = new Error(`queryA ENODATA ${domain}`);
    err.code = 'ENODATA';
    throw err;
  }

  async resolve6(domain) {
    const entry = this.domainMap[domain.toLowerCase()];
    if (entry && entry.aaaa) {
      return entry.aaaa;
    }
    const err = new Error(`queryAaaa ENODATA ${domain}`);
    err.code = 'ENODATA';
    throw err;
  }
}

// -------------------------------------------------------------------
// Mock Verification Provider for Pluggable Interface Testing
// -------------------------------------------------------------------
class MockVerificationProvider extends EmailVerificationProvider {
  constructor(resultsMap = {}) {
    super('mock_provider');
    this.resultsMap = resultsMap;
  }

  async verifyMailbox(email) {
    const res = this.resultsMap[email.toLowerCase()];
    if (res) return { isConfigured: true, ...res };
    return {
      isConfigured: true,
      status: 'valid',
      reason: 'Mock mailbox active'
    };
  }
}

async function runAllTests() {
  // Clear caches before tests
  domainDnsCache.clear();

  // =================================================================
  // 1. EMAIL SYNTAX VALIDATION & NORMALIZATION TESTS
  // =================================================================
  await test('Reject malformed email: missing @ symbol', () => {
    const res = validateSyntax('plainaddress.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('Missing @'));
  });

  await test('Reject malformed email: multiple @ symbols', () => {
    const res = validateSyntax('user@@domain.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('Multiple @'));
  });

  await test('Reject malformed email: empty local-part', () => {
    const res = validateSyntax('@domain.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('Local-part'));
  });

  await test('Reject malformed email: consecutive dots in local-part', () => {
    const res = validateSyntax('john..doe@domain.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('consecutive dots'));
  });

  await test('Reject malformed email: leading dot in local-part', () => {
    const res = validateSyntax('.johndoe@domain.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('cannot start or end with a dot'));
  });

  await test('Reject malformed email: trailing dot in local-part', () => {
    const res = validateSyntax('johndoe.@domain.com');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('cannot start or end with a dot'));
  });

  await test('Reject malformed email: missing TLD in domain', () => {
    const res = validateSyntax('john@localhost');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('valid TLD'));
  });

  await test('Reject malformed email: single character TLD', () => {
    const res = validateSyntax('john@domain.c');
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('TLD must be at least 2 letters'));
  });

  await test('Reject malformed email: spaces in email', () => {
    const res = validateSyntax('john doe@domain.com');
    assert.strictEqual(res.valid, false);
  });

  await test('Reject malformed email: local-part exceeding 64 characters', () => {
    const longLocal = 'a'.repeat(65) + '@domain.com';
    const res = validateSyntax(longLocal);
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason.includes('64 characters'));
  });

  await test('Normalize email: trim whitespace and lowercase domain', () => {
    const raw = '   Ketan.Tiwari@AcmeCorp.COM   ';
    const norm = normalizeEmail(raw);
    assert.strictEqual(norm, 'Ketan.Tiwari@acmecorp.com');

    const syntax = validateSyntax(raw);
    assert.strictEqual(syntax.valid, true);
    assert.strictEqual(syntax.normalized, 'Ketan.Tiwari@acmecorp.com');
    assert.strictEqual(syntax.domain, 'acmecorp.com');
  });

  // =================================================================
  // 2. DOMAIN VALIDATION (MX, NXDOMAIN, IMPLICIT MX FALLBACK)
  // =================================================================
  const mockDns = new MockDnsResolver({
    'activecompany.com': {
      mx: [{ exchange: 'mail.activecompany.com', preference: 10 }]
    },
    'legacyhost.com': {
      // Missing MX, but has A record (RFC 5321 implicit MX fallback!)
      a: ['198.51.100.1']
    },
    'emptyrouting.com': {
      // Exists in DNS, but has neither MX nor A nor AAAA
    },
    'slowdns.com': {
      timeout: true
    },
    'failingdns.com': {
      servfail: true
    }
  });

  await test('Domain validation: Active MX records found', async () => {
    const res = await resolveDomainDns('activecompany.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, true);
    assert.strictEqual(res.hasMx, true);
    assert.strictEqual(res.hasImplicitMx, false);
    assert.strictEqual(res.status, 'valid');
    assert.ok(res.reason.includes('MX records found'));
  });

  await test('Domain validation: Nonexistent domain (NXDOMAIN) treated as invalid', async () => {
    const res = await resolveDomainDns('nonexistent-company-404.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, false);
    assert.strictEqual(res.hasMx, false);
    assert.strictEqual(res.status, 'invalid');
    assert.ok(res.reason.includes('NXDOMAIN'));
  });

  await test('Domain validation: RFC 5321 Implicit MX Fallback via A record', async () => {
    const res = await resolveDomainDns('legacyhost.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, true);
    assert.strictEqual(res.hasMx, false);
    assert.strictEqual(res.hasImplicitMx, true);
    assert.strictEqual(res.status, 'valid');
    assert.ok(res.reason.includes('RFC 5321'));
  });

  await test('Domain validation: Missing MX and missing A/AAAA records declared invalid', async () => {
    const res = await resolveDomainDns('emptyrouting.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, false);
    assert.strictEqual(res.hasMx, false);
    assert.strictEqual(res.hasImplicitMx, false);
    assert.strictEqual(res.status, 'invalid');
    assert.ok(res.reason.includes('no MX records and no A/AAAA'));
  });

  await test('Domain validation: DNS timeout handled as temporary failure (NOT permanently rejected)', async () => {
    const res = await resolveDomainDns('slowdns.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, false);
    assert.strictEqual(res.isTemporaryFailure, true);
    assert.strictEqual(res.status, 'inconclusive');
    assert.ok(res.reason.includes('Temporary DNS failure'));
  });

  await test('Domain validation: SERVFAIL handled as temporary failure (NOT permanently rejected)', async () => {
    const res = await resolveDomainDns('failingdns.com', { bypassCache: true, dnsResolver: mockDns });
    assert.strictEqual(res.isDeliverable, false);
    assert.strictEqual(res.isTemporaryFailure, true);
    assert.strictEqual(res.status, 'inconclusive');
  });

  // =================================================================
  // 3. FULL RECIPIENT VALIDATION PIPELINE & DEFERRAL POLICY
  // =================================================================
  await test('Sending policy: Deliverable recipient with MX passes validation', async () => {
    const res = await validateRecipient('recruiter@activecompany.com', {
      customDnsResolver: mockDns,
      bypassCache: true
    });
    assert.strictEqual(res.canSend, true);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.status, 'valid');
  });

  await test('Sending policy: Inconclusive temporary DNS error defers email (do NOT send)', async () => {
    const res = await validateRecipient('hr@slowdns.com', {
      customDnsResolver: mockDns,
      bypassCache: true
    });
    // Inconclusive policy: Defer the email rather than treating it as valid
    assert.strictEqual(res.canSend, false);
    assert.strictEqual(res.isInconclusive, true);
    assert.strictEqual(res.status, 'inconclusive');
  });

  // =================================================================
  // 4. BOUNCE HANDLING, SUPPRESSION LIST & EXPONENTIAL BACKOFF
  // =================================================================
  await test('Bounce parsing: Hard bounce (550 5.1.1 mailbox not found) recognized', () => {
    const err = new Error('550 5.1.1 Recipient address rejected: User unknown');
    err.responseCode = 550;
    const parsed = suppressionService.parseSmtpError(err);
    assert.strictEqual(parsed.isHardBounce, true);
    assert.strictEqual(parsed.isSoftBounce, false);
    assert.strictEqual(parsed.retryable, false);
    assert.strictEqual(parsed.bounceType, 'hard');
  });

  await test('Bounce parsing: Soft bounce (421 try again later) recognized as retryable', () => {
    const err = new Error('421 4.7.0 Service temporarily unavailable, closing transmission channel');
    err.responseCode = 421;
    const parsed = suppressionService.parseSmtpError(err);
    assert.strictEqual(parsed.isHardBounce, false);
    assert.strictEqual(parsed.isSoftBounce, true);
    assert.strictEqual(parsed.retryable, true);
    assert.strictEqual(parsed.bounceType, 'soft');
  });

  await test('Permanent suppression: Hard-bounced address is added to suppression list and blocked on subsequent sends', async () => {
    const bounceEmail = 'defunct.candidate999@activecompany.com';
    suppressionService.addSuppressed(bounceEmail, {
      reason: 'Permanent hard bounce (550 5.1.1 User unknown)',
      bounceType: 'hard',
      source: 'test_suite'
    });

    assert.strictEqual(suppressionService.isSuppressed(bounceEmail), true);

    // Validate recipient check must block it immediately before sending!
    const res = await validateRecipient(bounceEmail, { customDnsResolver: mockDns });
    assert.strictEqual(res.canSend, false);
    assert.strictEqual(res.isSuppressed, true);
    assert.strictEqual(res.status, 'suppressed');

    // Clean up test entry
    suppressionService.removeSuppressed(bounceEmail);
    assert.strictEqual(suppressionService.isSuppressed(bounceEmail), false);
  });

  await test('Soft bounce retry: Exponential backoff and retry limit enforced', () => {
    const softEmail = 'temporary.failure@activecompany.com';
    
    // Attempt 1
    const att1 = suppressionService.handleTemporaryFailure(softEmail, '451 Greylisted');
    assert.strictEqual(att1.retryScheduled, true);
    assert.strictEqual(att1.retryCount, 1);

    // Attempt 2
    const att2 = suppressionService.handleTemporaryFailure(softEmail, '451 Greylisted');
    assert.strictEqual(att2.retryScheduled, true);
    assert.strictEqual(att2.retryCount, 2);

    // Attempt 3
    const att3 = suppressionService.handleTemporaryFailure(softEmail, '451 Greylisted');
    assert.strictEqual(att3.retryScheduled, true);
    assert.strictEqual(att3.retryCount, 3);

    // Attempt 4: Exceeds max retries (3)
    const att4 = suppressionService.handleTemporaryFailure(softEmail, '451 Greylisted');
    assert.strictEqual(att4.retryScheduled, false);
    assert.strictEqual(att4.reason, 'Max retries exceeded');
  });

  // =================================================================
  // 5. PLUGGABLE VERIFICATION PROVIDER INTERFACE
  // =================================================================
  await test('Provider interface: Provider reporting undeliverable marks email invalid', async () => {
    const mockProvider = new MockVerificationProvider({
      'fake.mailbox@activecompany.com': {
        status: 'invalid',
        reason: 'Provider verified: Mailbox does not exist'
      }
    });

    const res = await validateRecipient('fake.mailbox@activecompany.com', {
      customDnsResolver: mockDns,
      customProvider: mockProvider,
      bypassCache: true
    });
    assert.strictEqual(res.canSend, false);
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.status, 'invalid');
    assert.ok(res.reason.includes('Provider verified'));
  });

  await test('Provider interface: Provider reporting inconclusive defers email', async () => {
    const mockProvider = new MockVerificationProvider({
      'risky.mailbox@activecompany.com': {
        status: 'inconclusive',
        reason: 'Provider returned RISKY / CATCH-ALL'
      }
    });

    const res = await validateRecipient('risky.mailbox@activecompany.com', {
      customDnsResolver: mockDns,
      customProvider: mockProvider,
      bypassCache: true
    });
    // Inconclusive must defer rather than sending
    assert.strictEqual(res.canSend, false);
    assert.strictEqual(res.isInconclusive, true);
    assert.strictEqual(res.status, 'inconclusive');
  });

  // =================================================================
  // 6. DASHBOARD & AUDIT STATS
  // =================================================================
  await test('Dashboard reporting: Stats aggregated correctly', () => {
    const stats = suppressionService.getDashboardStats();
    assert.ok(typeof stats.valid === 'number');
    assert.ok(typeof stats.invalid === 'number');
    assert.ok(typeof stats.suppressed === 'number');
    assert.ok(typeof stats.pendingVerification === 'number');
    assert.ok(typeof stats.temporaryFailures === 'number');
  });

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
