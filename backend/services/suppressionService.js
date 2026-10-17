const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SUPPRESSION_FILE = path.join(DATA_DIR, 'suppression_list.json');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'email_audit_log.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

class SuppressionService {
  constructor() {
    this.suppressionMap = new Map(); // normalized email -> details
    this.auditLogs = [];
    this.deferredQueue = new Map(); // email -> { email, retryCount, nextRetryAt, error }
    this.maxRetries = 3;
    this.loadSuppressionList();
    this.loadAuditLogs();
  }

  loadSuppressionList() {
    try {
      if (fs.existsSync(SUPPRESSION_FILE)) {
        const raw = fs.readFileSync(SUPPRESSION_FILE, 'utf8');
        const list = JSON.parse(raw || '[]');
        this.suppressionMap.clear();
        list.forEach(item => {
          if (item && item.email) {
            this.suppressionMap.set(item.email.toLowerCase().trim(), item);
          }
        });
      } else {
        this.saveSuppressionList();
      }
    } catch (err) {
      console.warn('[SUPPRESSION] Error loading suppression list:', err.message);
    }
  }

  saveSuppressionList() {
    try {
      const arr = Array.from(this.suppressionMap.values());
      fs.writeFileSync(SUPPRESSION_FILE, JSON.stringify(arr, null, 2), 'utf8');
    } catch (err) {
      console.warn('[SUPPRESSION] Error saving suppression list:', err.message);
    }
  }

  loadAuditLogs() {
    try {
      if (fs.existsSync(AUDIT_LOG_FILE)) {
        const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf8');
        this.auditLogs = JSON.parse(raw || '[]');
      } else {
        this.saveAuditLogs();
      }
    } catch (err) {
      console.warn('[AUDIT] Error loading audit logs:', err.message);
      this.auditLogs = [];
    }
  }

  saveAuditLogs() {
    try {
      // Keep last 5000 audit log entries to prevent excessive file size
      if (this.auditLogs.length > 5000) {
        this.auditLogs = this.auditLogs.slice(-5000);
      }
      fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(this.auditLogs, null, 2), 'utf8');
    } catch (err) {
      console.warn('[AUDIT] Error saving audit logs:', err.message);
    }
  }

  /**
   * Check if an email address is currently suppressed
   */
  isSuppressed(email) {
    if (!email) return false;
    const norm = email.toLowerCase().trim();
    return this.suppressionMap.has(norm);
  }

  /**
   * Get suppression record if present
   */
  getSuppressionRecord(email) {
    if (!email) return null;
    return this.suppressionMap.get(email.toLowerCase().trim()) || null;
  }

  /**
   * Permanently suppress an email address (e.g. on hard bounce or manual suppression)
   */
  addSuppressed(email, { reason = 'Hard bounce', bounceType = 'hard', source = 'system' } = {}) {
    if (!email) return null;
    const norm = email.toLowerCase().trim();
    const record = {
      email: norm,
      reason,
      bounce_type: bounceType,
      source,
      suppressed_at: new Date().toISOString()
    };
    this.suppressionMap.set(norm, record);
    this.saveSuppressionList();

    this.logAudit({
      email: norm,
      validation_status: 'suppressed',
      validation_reason: reason,
      bounce_type: bounceType,
      suppression_status: true
    });

    return record;
  }

  /**
   * Remove an email from suppression list
   */
  removeSuppressed(email) {
    if (!email) return false;
    const norm = email.toLowerCase().trim();
    const deleted = this.suppressionMap.delete(norm);
    if (deleted) {
      this.saveSuppressionList();
    }
    return deleted;
  }

  /**
   * Log an email validation/dispatch check in audit trail
   */
  logAudit({
    email,
    validation_status,
    validation_reason,
    bounce_type = null,
    suppression_status = false,
    details = {}
  }) {
    if (!email) return;
    const record = {
      email: email.toLowerCase().trim(),
      validation_status, // 'valid', 'invalid', 'suppressed', 'pending_verification', 'inconclusive'
      validation_reason,
      checked_at: new Date().toISOString(),
      bounce_type,       // 'hard', 'soft', null
      suppression_status: Boolean(suppression_status),
      details
    };
    this.auditLogs.push(record);
    this.saveAuditLogs();
    return record;
  }

  /**
   * Parse an SMTP or provider error to classify hard vs soft bounce
   */
  parseSmtpError(err) {
    const msg = (err && (err.message || String(err))) || '';
    const code = err && err.responseCode ? err.responseCode : 0;

    // Hard Bounces (5xx permanent failures)
    // 550 5.1.1: Recipient address rejected / User unknown / Mailbox not found
    if (
      code === 550 ||
      code === 551 ||
      code === 552 ||
      code === 553 ||
      code === 554 ||
      /550\s*5\.1\.1/i.test(msg) ||
      /mailbox\s*(not\s*found|unavailable|does\s*not\s*exist)/i.test(msg) ||
      /user\s*(unknown|not\s*found|does\s*not\s*exist)/i.test(msg) ||
      /recipient\s*(address\s*)?rejected/i.test(msg) ||
      /no\s*such\s*(user|recipient|mailbox)/i.test(msg) ||
      /address\s*(does\s*not\s*exist|not\s*found)/i.test(msg) ||
      /invalid\s*recipient/i.test(msg) ||
      /access\s*denied/i.test(msg)
    ) {
      return {
        isHardBounce: true,
        isSoftBounce: false,
        bounceType: 'hard',
        retryable: false,
        reason: msg || 'Permanent hard bounce (550 Mailbox not found)'
      };
    }

    // Soft Bounces (4xx temporary failures or rate limits)
    if (
      (code >= 400 && code < 500) ||
      /421|450|451|452/i.test(msg) ||
      /try\s*again\s*later/i.test(msg) ||
      /temporar(y|ily)\s*(deferred|unavailable|rejected)/i.test(msg) ||
      /rate\s*limit/i.test(msg) ||
      /too\s*many\s*connections/i.test(msg) ||
      /busy|greylist/i.test(msg) ||
      /timeout|etimedout|econnreset/i.test(msg)
    ) {
      return {
        isHardBounce: false,
        isSoftBounce: true,
        bounceType: 'soft',
        retryable: true,
        reason: msg || 'Temporary soft bounce / rate limit'
      };
    }

    return {
      isHardBounce: false,
      isSoftBounce: false,
      bounceType: null,
      retryable: false,
      reason: msg || 'Unknown error'
    };
  }

  /**
   * Schedule or record a soft bounce / temporary failure for retry
   */
  handleTemporaryFailure(email, errorMsg) {
    const norm = email.toLowerCase().trim();
    const existing = this.deferredQueue.get(norm) || { retryCount: 0 };
    const nextRetryCount = existing.retryCount + 1;

    if (nextRetryCount > this.maxRetries) {
      this.deferredQueue.delete(norm);
      this.logAudit({
        email: norm,
        validation_status: 'invalid',
        validation_reason: `Exceeded max retries (${this.maxRetries}) on temporary failures: ${errorMsg}`,
        bounce_type: 'soft',
        suppression_status: false
      });
      return { retryScheduled: false, reason: 'Max retries exceeded' };
    }

    // Exponential backoff: 2^(retryCount) * 15 minutes
    const backoffMs = Math.pow(2, nextRetryCount) * 15 * 60 * 1000;
    const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();

    this.deferredQueue.set(norm, {
      email: norm,
      retryCount: nextRetryCount,
      nextRetryAt,
      lastError: errorMsg
    });

    this.logAudit({
      email: norm,
      validation_status: 'inconclusive',
      validation_reason: `Temporary failure (Attempt ${nextRetryCount}/${this.maxRetries}). Next retry at: ${nextRetryAt}: ${errorMsg}`,
      bounce_type: 'soft',
      suppression_status: false
    });

    return { retryScheduled: true, retryCount: nextRetryCount, nextRetryAt };
  }

  /**
   * Compute aggregated statistics for the dashboard
   */
  getDashboardStats() {
    let valid = 0;
    let invalid = 0;
    let suppressed = this.suppressionMap.size;
    let pendingVerification = 0;
    let temporaryFailures = 0;

    const latestByEmail = new Map();
    this.auditLogs.forEach(entry => {
      latestByEmail.set(entry.email, entry);
    });

    latestByEmail.forEach(entry => {
      if (entry.validation_status === 'valid') valid++;
      else if (entry.validation_status === 'invalid') invalid++;
      else if (entry.validation_status === 'inconclusive' || entry.validation_status === 'pending_verification') {
        pendingVerification++;
      }
      if (entry.bounce_type === 'soft') {
        temporaryFailures++;
      }
    });

    return {
      valid,
      invalid,
      suppressed,
      pendingVerification,
      temporaryFailures,
      totalSuppressed: this.suppressionMap.size,
      totalAuditEntries: this.auditLogs.length,
      deferredQueueSize: this.deferredQueue.size
    };
  }

  getAllSuppressed() {
    return Array.from(this.suppressionMap.values());
  }

  getAuditLogs(limit = 100) {
    return this.auditLogs.slice(-limit).reverse();
  }
}

const suppressionService = new SuppressionService();
module.exports = suppressionService;
