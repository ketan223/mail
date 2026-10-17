const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const net = require('net');
const tls = require('tls');
const dns = require('dns').promises;
require('dns').setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MASTER_COMPANIES, getFreshCandidates, discoverNextBatchLeads } = require('./data/company_directory');
const { FOREIGN_MASTER_COMPANIES, getFreshForeignCandidates } = require('./data/foreign_company_directory');
const { discoverCompaniesViaMistral } = require('./services/aiCompanyDiscovery');
const { syncInboxResponses, getCachedResponses } = require('./services/inboxTracker');
const bouncePurgeService = require('./services/bouncePurgeService');
const { validateRecipient, normalizeEmail, validateSyntax, resolveDomainDns } = require('./services/emailValidator');
const suppressionService = require('./services/suppressionService');

const app = express();
const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONTACTS_FILE = path.join(DATA_DIR, 'hr_contacts.json');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent_log.json');
const CAMPAIGN_STATE_FILE = path.join(DATA_DIR, 'campaign_state.json');
const VAULT_METADATA_FILE = path.join(DATA_DIR, 'vault_history.json');

// Initialize files if they don't exist
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(SENT_LOG_FILE)) {
  fs.writeFileSync(SENT_LOG_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(VAULT_METADATA_FILE)) {
  fs.writeFileSync(VAULT_METADATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Vault history helper with auto-seeding of initial campaigns
function getVaultHistory() {
  if (!fs.existsSync(VAULT_METADATA_FILE)) {
    fs.writeFileSync(VAULT_METADATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  try {
    let list = JSON.parse(fs.readFileSync(VAULT_METADATA_FILE, 'utf8') || '[]');
    if (list.length === 0) {
      let sentHistory = [];
      if (fs.existsSync(SENT_LOG_FILE)) {
        sentHistory = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
      }
      const sentCount = sentHistory.filter(s => s.status === 'sent').length;
      if (sentCount > 0) {
        const initialDoc = {
          id: 'pdf-1',
          docNum: 1,
          label: 'PDF 1',
          filename: 'Initial HR Database',
          sourceDoc: 'PDF 1: Initial HR Database',
          uploadedAt: '2026-09-05T10:00:00.000Z',
          totalExtracted: 1528,
          totalSent: sentCount
        };
        list.push(initialDoc);
        fs.writeFileSync(VAULT_METADATA_FILE, JSON.stringify(list, null, 2), 'utf8');
      }
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve frontend statically
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean Gmail App Password
const getAppPassword = () => (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

// Quad Sender Accounts Configuration
function getSenderAccounts() {
  const accounts = [];
  
  // Account 1
  const u1 = process.env.GMAIL_USER_1 || process.env.GMAIL_USER || '';
  const p1 = (process.env.GMAIL_APP_PASSWORD_1 || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (u1) {
    accounts.push({
      id: 'account1',
      user: u1,
      pass: p1,
      active: Boolean(u1 && p1),
      label: u1.split('@')[0]
    });
  }

  // Account 2
  const u2 = process.env.GMAIL_USER_2 || '';
  const p2 = (process.env.GMAIL_APP_PASSWORD_2 || '').replace(/\s+/g, '');
  if (u2) {
    accounts.push({
      id: 'account2',
      user: u2,
      pass: p2,
      active: Boolean(u2 && p2),
      label: u2.split('@')[0]
    });
  }

  // Account 3
  const u3 = process.env.GMAIL_USER_3 || '';
  const p3 = (process.env.GMAIL_APP_PASSWORD_3 || '').replace(/\s+/g, '');
  if (u3) {
    accounts.push({
      id: 'account3',
      user: u3,
      pass: p3,
      active: Boolean(u3 && p3),
      label: u3.split('@')[0]
    });
  }

  // Account 4
  const u4 = process.env.GMAIL_USER_4 || '';
  const p4 = (process.env.GMAIL_APP_PASSWORD_4 || '').replace(/\s+/g, '');
  if (u4) {
    accounts.push({
      id: 'account4',
      user: u4,
      pass: p4,
      active: Boolean(u4 && p4),
      label: u4.split('@')[0]
    });
  }

  return accounts;
}

// Create Nodemailer transporter for specific account or fallback
function createTransporter(account = null) {
  let user, pass;
  if (account && account.user && account.pass) {
    user = account.user;
    pass = account.pass;
  } else {
    user = process.env.GMAIL_USER_1 || process.env.GMAIL_USER;
    pass = (process.env.GMAIL_APP_PASSWORD_1 || getAppPassword()).replace(/\s+/g, '');
  }

  if (!user || !pass) {
    throw new Error(`Gmail credentials are not configured for ${user || 'sender account'}`);
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Multer storage
const storage = multer.memoryStorage();
const pdfFileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF documents (.pdf) are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: pdfFileFilter
});

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper to find preloaded default resume
const getDefaultResumePath = () => {
  const pActive = path.join(DATA_DIR, 'active_resume.pdf');
  if (fs.existsSync(pActive)) return pActive;
  const p1 = path.join(__dirname, '../Ketan_Resume.pdf');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(__dirname, 'Ketan_Resume.pdf');
  if (fs.existsSync(p2)) return p2;
  return null;
};

// Check Domain MX and deliverability via emailValidator
async function checkDomainMx(email) {
  try {
    const domain = (email || '').split('@')[1];
    if (!domain) return false;
    const res = await resolveDomainDns(domain);
    return res.isDeliverable;
  } catch (err) {
    return false;
  }
}

// Full Recipient Validation wrapper (Syntax, Normalization, Suppression, DNS MX, A/AAAA fallback, Provider)
async function verifyMailboxExists(email) {
  try {
    const res = await validateRecipient(email);
    return {
      valid: res.canSend,
      reason: res.reason,
      status: res.status,
      isSuppressed: res.isSuppressed,
      isInconclusive: res.isInconclusive,
      details: res
    };
  } catch (err) {
    return { valid: false, reason: 'Validation error: ' + err.message, status: 'inconclusive' };
  }
}

// Random delay generator: 4 to 8 seconds (safer spread for 50-email batches)
const getRandomDelay = (minMs = 4000, maxMs = 8000) => {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
};

// -------------------------------------------------------------
// CAMPAIGN ENGINE (Stateful 50-Email Batches + 30-Min Automated Pause)
// -------------------------------------------------------------
class CampaignEngine {
  constructor() {
    this.status = 'idle'; // 'idle', 'running_batch', 'waiting_pause', 'paused', 'completed', 'daily_limit_reached'
    this.isAutonomous = false;
    this.targetLocation = 'all'; // 'mumbai', 'remote', 'all'
    this.batchSize = 60; // 60 emails per batch
    this.pauseDurationMs = 6 * 60 * 1000; // 6-minute cooldown break (Ketan constraint: strictly 6 min)
    this.dailyLimitIndia = 250; // User target: 250 Indian tech companies / HRs
    this.dailyLimitForeign = 150; // User target: 150 Foreign tech companies / HRs
    this.dailyLimit = 400; // Total safe daily quota (100/account across 4 active senders)
    this.currentAccountIndex = 0;
    this.activePayload = null; // { resume: { filename, buffer }, senderName, subject, message }
    this.queue = [];
    this.currentBatchNumber = 0;
    this.sentInCurrentBatch = 0;
    this.totalBatches = 0;
    this.nextBatchRunTime = null;
    this.timerId = null;
    this.isCancelled = false;
    this.stats = {
      totalQueued: 0,
      sent: 0,
      failed: 0,
      skippedMx: 0
    };
    this.recentLogs = [];
    this.liveLogs = [];
  }

  // Determine if lead is Indian vs Foreign
  isIndianLead(lead) {
    if (!lead) return false;
    if (lead.region === 'india') return true;
    if (lead.region === 'foreign') return false;
    const type = (lead.type || '').toLowerCase();
    const sourceDoc = (lead.sourceDoc || '').toLowerCase();
    const domain = ((lead.email || '').split('@')[1] || '').toLowerCase();
    const company = (lead.company || '').toLowerCase();

    if (domain.endsWith('.in') || domain.endsWith('.co.in') || domain.endsWith('.org.in')) return true;
    if (/mumbai|pune|bangalore|bengaluru|delhi|ncr|hyderabad|chennai|gurgaon|gurugram|noida|ahmedabad|kolkata|india/i.test(type)) return true;
    if (/mumbai|pune|bangalore|bengaluru|delhi|ncr|hyderabad|chennai|gurgaon|gurugram|noida|ahmedabad|kolkata|india/i.test(sourceDoc)) return true;
    if (/mumbai|pune|bangalore|bengaluru|delhi|ncr|hyderabad|chennai|gurgaon|gurugram|noida|ahmedabad|kolkata|india/i.test(company)) return true;
    return false;
  }

  // Count emails sent today broken down by 🇮🇳 India (250 goal) vs 🌍 Foreign (150 goal)
  getTodaySentCountsByRegion(accountUser = null) {
    let india = 0;
    let foreign = 0;
    let total = 0;
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const startMs = todayStart.getTime();

        for (const h of history) {
          if (h.status !== 'sent' || !h.timestamp || new Date(h.timestamp).getTime() < startMs) continue;
          if (accountUser && (h.senderAccount || '').toLowerCase() !== accountUser.toLowerCase()) continue;
          total++;
          const reg = h.region || (this.isIndianLead(h) ? 'india' : 'foreign');
          if (reg === 'india') {
            india++;
          } else {
            foreign++;
          }
        }
      }
    } catch (e) {}
    return { india, foreign, total };
  }

  addLiveLog(tag, message, level = 'info') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const logItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      time: timeStr,
      tag: tag.toUpperCase(),
      message,
      level // 'info', 'success', 'warning', 'danger', 'cooldown'
    };
    this.liveLogs.push(logItem);
    if (this.liveLogs.length > 200) {
      this.liveLogs.shift();
    }
    console.log(`[${timeStr}] [${tag.toUpperCase()}] ${message}`);
  }

  // Count emails sent today (calendar day starting at local midnight 00:00:00), optionally filtered by sender account
  getTodaySentCount(accountUser = null) {
    return this.getTodaySentCountsByRegion(accountUser).total;
  }

  // Count emails sent in the last 24 hours to enforce Google's 500/day safety ceiling, optionally filtered by sender account
  get24hSentCount(accountUser = null) {
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        return history.filter(h => {
          if (h.status !== 'sent' || !h.timestamp || new Date(h.timestamp).getTime() <= cutoff) return false;
          if (accountUser) {
            return (h.senderAccount || process.env.GMAIL_USER || '').toLowerCase() === accountUser.toLowerCase();
          }
          return true;
        }).length;
      }
    } catch (e) {}
    return 0;
  }

  // Get set of contacted companies and domains across ALL accounts to guarantee zero duplicate company outreach
  getContactedCompaniesAndDomains() {
    const companies = new Set();
    const domains = new Set();
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        for (const item of history) {
          // ANY attempted email (sent, bounced, skipped_invalid_domain, or failed) permanently locks company and domain!
          if (item.company) {
            const compClean = item.company.toLowerCase().trim();
            if (compClean && compClean !== 'your team' && compClean !== 'your company') {
              companies.add(compClean);
            }
          }
          if (item.email && item.email.includes('@')) {
            const d = item.email.split('@')[1].toLowerCase().trim();
            if (d && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(d)) {
              domains.add(d);
            }
          }
        }
      }
    } catch (e) {}
    return { companies, domains };
  }

  // Get set of already processed emails (sent, bounced, or confirmed dead) to permanently prevent duplicate outreach
  getSentEmailsSet() {
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        return new Set(
          history
            .map(item => (item.email || '').toLowerCase().trim())
            .filter(Boolean)
        );
      }
    } catch (e) {}
    return new Set();
  }

  // Append a log entry to disk (deduplicating by email)
  logResult(entry) {
    entry.timestamp = new Date().toISOString();
    if (!entry.sourceDoc) {
      entry.sourceDoc = 'PDF 1: Initial HR Database';
    }
    if (!entry.region) {
      entry.region = this.isIndianLead(entry) ? 'india' : 'foreign';
    }
    this.recentLogs.unshift(entry);
    if (this.recentLogs.length > 100) this.recentLogs.pop();

    try {
      let history = [];
      if (fs.existsSync(SENT_LOG_FILE)) {
        history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
      }
      const cleanEmail = (entry.email || '').toLowerCase().trim();
      const existingIdx = history.findIndex(h => (h.email || '').toLowerCase().trim() === cleanEmail);
      if (existingIdx >= 0) {
        if (!entry.sourceDoc && history[existingIdx].sourceDoc) {
          entry.sourceDoc = history[existingIdx].sourceDoc;
        }
        if (!entry.region && history[existingIdx].region) {
          entry.region = history[existingIdx].region;
        }
        history[existingIdx] = entry;
      } else {
        history.push(entry);
      }
      fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to update sent_log.json:', e);
    }
  }

  // Start Campaign (Manual Contact List)
  start(payload, recipientsList, batchSize = 60, pauseMinutes = 6, options = {}) {
    if (this.status === 'running_batch' || this.status === 'waiting_pause') {
      throw new Error('A campaign is already actively running. Pause or stop it first.');
    }

    if (!payload.resume || !payload.resume.buffer) {
      throw new Error('Resume PDF attachment is required.');
    }

    this.isAutonomous = false;
    this.dryRun = Boolean(options.dryRun);
    const alreadySent = this.getSentEmailsSet();
    
    // Filter out already sent contacts and suppressed contacts
    const unsentList = recipientsList.filter(r => {
      const email = (r.email || '').toLowerCase().trim();
      return EMAIL_REGEX.test(email) && !alreadySent.has(email) && !suppressionService.isSuppressed(email);
    });

    if (unsentList.length === 0) {
      throw new Error('All selected contacts have already been sent emails or are suppressed! No unsent recipients.');
    }

    this.activePayload = payload;
    this.queue = unsentList;
    this.batchSize = parseInt(batchSize, 10) || 60;
    this.pauseDurationMs = (parseInt(pauseMinutes, 10) || 6) * 60 * 1000;
    this.currentBatchNumber = 0;
    this.totalBatches = Math.ceil(this.queue.length / this.batchSize);
    this.isCancelled = false;
    this.stats = {
      totalQueued: this.queue.length,
      sent: 0,
      failed: 0,
      skippedMx: 0,
      suppressed: 0,
      deferred: 0,
      dryRunSent: 0
    };
    this.nextBatchRunTime = null;
    if (this.timerId) clearTimeout(this.timerId);

    this.addLiveLog('START', `Manual campaign started! ${this.dryRun ? '🧪 [DRY-RUN MODE: ZERO EMAILS SENT] ' : ''}Queue: ${this.queue.length}, Batch size: ${this.batchSize}, Total batches: ${this.totalBatches}`, 'success');
    this.runNextBatch();
  }

  // Autonomously replenish the queue with Indian (250 quota) and Foreign (150 quota) leads
  async replenishAutonomousQueue(countNeeded = 60) {
    try {
      const alreadySent = this.getSentEmailsSet();
      const inQueueEmails = new Set(this.queue.map(q => (q.email || '').toLowerCase().trim()));
      const combinedContacted = new Set([...alreadySent, ...inQueueEmails]);
      const regionCounts = this.getTodaySentCountsByRegion();

      const { companies: contactedComps, domains: contactedDoms } = this.getContactedCompaniesAndDomains();
      const inQueueDomains = new Set(this.queue.map(q => (q.email || '').split('@')[1]?.toLowerCase().trim()).filter(Boolean));
      const inQueueCompanies = new Set(this.queue.map(q => (q.company || '').toLowerCase().trim()).filter(Boolean));

      const allContactedDomains = new Set([...contactedDoms, ...inQueueDomains]);
      const allContactedCompanies = new Set([...contactedComps, ...inQueueCompanies]);

      const isCandidateFresh = (lead) => {
        if (!lead || !lead.email) return false;
        const em = (lead.email || '').toLowerCase().trim();
        const d = (em.split('@')[1] || '').toLowerCase().trim();
        const comp = (lead.company || '').toLowerCase().trim();
        if (combinedContacted.has(em)) return false;
        if (d && allContactedDomains.has(d)) return false;
        if (comp && comp !== 'your team' && comp !== 'your company' && allContactedCompanies.has(comp)) return false;
        if (suppressionService.isSuppressed(em)) return false;
        return true;
      };

      let newLeads = [];
      const acceptLead = (lead) => {
        newLeads.push(lead);
        const em = (lead.email || '').toLowerCase().trim();
        const d = (em.split('@')[1] || '').toLowerCase().trim();
        const comp = (lead.company || '').toLowerCase().trim();
        combinedContacted.add(em);
        if (d) allContactedDomains.add(d);
        if (comp && comp !== 'your team' && comp !== 'your company') allContactedCompanies.add(comp);
      };

      const inQueueIndia = this.queue.filter(q => this.isIndianLead(q)).length;
      const inQueueForeign = this.queue.filter(q => !this.isIndianLead(q)).length;

      const remainingIndia = Math.max(0, this.dailyLimitIndia - regionCounts.india);
      const remainingForeign = Math.max(0, this.dailyLimitForeign - regionCounts.foreign);

      let targetIndia = 0;
      let targetForeign = 0;

      if (remainingIndia > 0 && inQueueIndia < 45) {
        targetIndia = Math.min(remainingIndia - inQueueIndia, 45);
      }
      if (remainingForeign > 0 && inQueueForeign < 30) {
        targetForeign = Math.min(remainingForeign - inQueueForeign, 30);
      }

      // 1. Gather Foreign leads from foreign directory
      if (targetForeign > 0) {
        const foreignCandidates = getFreshForeignCandidates(combinedContacted, targetForeign * 2, allContactedCompanies, allContactedDomains);
        for (const f of foreignCandidates) {
          if (newLeads.filter(l => !this.isIndianLead(l)).length >= targetForeign) break;
          if (isCandidateFresh(f)) {
            acceptLead(f);
          }
        }
      }

      // 2. Gather Indian leads from company directory
      if (targetIndia > 0) {
        const indianCandidates = getFreshCandidates(this.targetLocation || 'all', combinedContacted, allContactedCompanies, allContactedDomains);
        for (const ind of indianCandidates) {
          if (newLeads.filter(l => this.isIndianLead(l)).length >= targetIndia) break;
          if (isCandidateFresh(ind)) {
            acceptLead(ind);
          }
        }
      }

      // 3. Fallback to Mistral AI if directories needed more leads
      const currentIndiaCount = newLeads.filter(l => this.isIndianLead(l)).length;
      const currentForeignCount = newLeads.filter(l => !this.isIndianLead(l)).length;
      const needMoreIndia = targetIndia - currentIndiaCount;
      const needMoreForeign = targetForeign - currentForeignCount;

      if ((needMoreIndia > 0 || needMoreForeign > 0) && (remainingIndia > 0 || remainingForeign > 0)) {
        try {
          const regionToDiscover = (needMoreIndia > 0 && needMoreForeign > 0)
            ? 'all'
            : (needMoreIndia > 0 ? 'india' : 'foreign');
          const aiLeads = await discoverCompaniesViaMistral({
            countNeeded: Math.max(25, needMoreIndia + needMoreForeign),
            region: regionToDiscover,
            onProgress: (tag, msg, style) => this.addLiveLog(tag, msg, style)
          });
          if (aiLeads && aiLeads.length > 0) {
            for (const lead of aiLeads) {
              if (isCandidateFresh(lead)) {
                acceptLead(lead);
              }
            }
          }
        } catch (aiErr) {
          console.warn('Mistral AI discovery replenish warning:', aiErr.message);
        }
      }

      // 4. Interleave Indian & Foreign leads for balanced batch distribution (~62.5% India, ~37.5% Foreign)
      const ind = newLeads.filter(l => this.isIndianLead(l));
      const frg = newLeads.filter(l => !this.isIndianLead(l));
      const interleaved = [];
      let i = 0, j = 0;
      while (i < ind.length || j < frg.length) {
        for (let k = 0; k < 5 && i < ind.length; k++) interleaved.push(ind[i++]);
        for (let k = 0; k < 3 && j < frg.length; k++) interleaved.push(frg[j++]);
      }

      this.queue.push(...interleaved);
      const totalAdded = interleaved.length;
      if (totalAdded > 0) {
        this.totalBatches = Math.max(1, Math.ceil(this.queue.length / this.batchSize)) + this.currentBatchNumber;
        this.saveState();
        return totalAdded;
      }
    } catch (err) {
      console.error('Autonomous replenish error:', err.message);
    }
    return 0;
  }

  // Background discovery executed during cooldown breaks: Guarantees fresh verified leads
  async runCooldownDiscovery() {
    try {
      const nextBatchNum = this.currentBatchNumber + 1;
      this.addLiveLog('DISCOVER', `🔍 Cooldown Deep Discovery Active: Preparing verified Indian (250 cap) & Foreign (150 cap) HR mailboxes during break for Batch ${nextBatchNum}...`, 'info');
      const added = await this.replenishAutonomousQueue(60);
      const counts = this.getTodaySentCountsByRegion();
      if (added > 0) {
        this.addLiveLog('DISCOVER', `🎯 Prepared ${added} fresh verified targets! Queue now holds ${this.queue.length} ready contacts (Sent today: 🇮🇳 ${counts.india}/${this.dailyLimitIndia} India, 🌍 ${counts.foreign}/${this.dailyLimitForeign} Foreign).`, 'success');
      } else {
        this.addLiveLog('DISCOVER', `🎯 Queue already has ${this.queue.length} ready contacts. Standing by for cooldown to complete.`, 'info');
      }
    } catch (e) {
      console.warn('Cooldown discovery warning:', e.message);
    }
  }

  // Start Autonomous Outreach (Hands-Free Discovery, Verification & 12-Min Looping)
  async startAutonomous(payload, options = {}) {
    if (this.status === 'running_batch' || this.status === 'waiting_pause') {
      throw new Error('An outreach campaign is already actively running. Pause or stop it first.');
    }

    if (!payload.resume || !payload.resume.buffer) {
      throw new Error('Resume PDF attachment is required.');
    }

    this.isAutonomous = true;
    this.dryRun = Boolean(options.dryRun);
    this.targetLocation = options.location || 'all';
    this.batchSize = parseInt(options.batchSize, 10) || 60;
    this.pauseDurationMs = (parseInt(options.pauseMinutes, 10) || 6) * 60 * 1000;
    const activeAccs = getSenderAccounts().filter(a => a.active);
    const safeDailyQuota = Math.max(400, (activeAccs.length || 1) * 100);
    this.dailyLimit = options.dailyLimit && parseInt(options.dailyLimit, 10) >= safeDailyQuota ? parseInt(options.dailyLimit, 10) : safeDailyQuota;
    this.dailyLimitIndia = 250;
    this.dailyLimitForeign = 150;
    this.activePayload = payload;
    const regionCounts = this.getTodaySentCountsByRegion();
    const sentToday = regionCounts.total;
    const isContinuingToday = this.currentBatchNumber > 0 && sentToday > 0;
    if (!isContinuingToday) {
      this.currentBatchNumber = 0;
    }
    this.sentInCurrentBatch = 0;
    this.isCancelled = false;
    this.liveLogs = [];
    if (this.timerId) clearTimeout(this.timerId);

    const alreadySent = this.getSentEmailsSet();
    const { companies: contactedComps, domains: contactedDoms } = this.getContactedCompaniesAndDomains();
    const freshIndian = getFreshCandidates(this.targetLocation, alreadySent, contactedComps, contactedDoms)
      .filter(r => !suppressionService.isSuppressed(r.email))
      .slice(0, 50);

    const freshForeign = getFreshForeignCandidates(alreadySent, 35, contactedComps, contactedDoms)
      .filter(r => !suppressionService.isSuppressed(r.email));

    // Interleave initial queue
    const initialQueue = [];
    let indIdx = 0, frgIdx = 0;
    while (indIdx < freshIndian.length || frgIdx < freshForeign.length) {
      for (let k = 0; k < 5 && indIdx < freshIndian.length; k++) initialQueue.push(freshIndian[indIdx++]);
      for (let k = 0; k < 3 && frgIdx < freshForeign.length; k++) initialQueue.push(freshForeign[frgIdx++]);
    }
    this.queue = initialQueue;

    // If initial queue has fewer than batchSize, proactively discover fresh leads immediately
    if (this.queue.length < this.batchSize) {
      this.addLiveLog('DISCOVER', `🔍 Autonomously preparing Dual-Stream tech HR contacts (🇮🇳 India 250 + 🌍 Foreign 150)...`, 'info');
      await this.replenishAutonomousQueue(this.batchSize * 2);
    }

    this.totalBatches = this.currentBatchNumber + Math.max(1, Math.ceil(this.queue.length / this.batchSize));
    const nextBatchNum = this.currentBatchNumber + 1;
    this.addLiveLog('START', `🚀 Autonomous Dual-Engine outreach started! ${this.dryRun ? '🧪 [DRY-RUN MODE: ZERO EMAILS SENT] ' : ''}Targets: 🇮🇳 ${regionCounts.india}/${this.dailyLimitIndia} India + 🌍 ${regionCounts.foreign}/${this.dailyLimitForeign} Foreign (Total Cap: ${this.dailyLimit}). Batch: ${this.batchSize}, Pause: ${Math.round(this.pauseDurationMs / 60000)}m. Starting Batch ${nextBatchNum} immediately!`, 'success');
    this.runNextBatch();
  }

  // Run next batch of valid deliverable emails
  async runNextBatch() {
    // If autonomous and queue has fewer than batchSize candidates, replenish from directory
    if (this.isAutonomous && this.queue.length < this.batchSize) {
      const added = await this.replenishAutonomousQueue(this.batchSize);
      if (added > 0) {
        this.addLiveLog('DISCOVER', `Found and pre-verified ${added} additional fresh startup targets. Added to queue.`, 'info');
      }
    }

    if (this.isCancelled || (!this.isAutonomous && this.queue.length === 0)) {
      this.status = 'completed';
      this.nextBatchRunTime = null;
      this.addLiveLog('FINISH', 'Outreach queue finished.', 'info');
      console.log('[CAMPAIGN FINISHED] All queued recipients processed.');
      return;
    }

    this.status = 'running_batch';
    this.currentBatchNumber++;
    this.sentInCurrentBatch = 0;
    this.nextBatchRunTime = null;

    let transporter;
    try {
      transporter = createTransporter();
    } catch (err) {
      console.error('Transporter creation failed:', err.message);
      this.addLiveLog('ERROR', `SMTP Transporter failed: ${err.message}`, 'danger');
      this.status = 'paused';
      return;
    }

    let sentInThisBatch = 0;
    let consecutiveEmptyReplenish = 0;
    this.addLiveLog('BATCH', `Starting Batch ${this.currentBatchNumber}: Targeting ${this.batchSize} verified sends...`, 'info');

    while ((this.queue.length > 0 || this.isAutonomous) && sentInThisBatch < this.batchSize) {
      if (this.isCancelled) {
        this.addLiveLog('STOP', 'Campaign cancelled by user.', 'warning');
        this.status = 'stopped';
        return;
      }

      // Safety guard 1: Strictly enforce today's calendar-day quota across accounts & Dual Targets (250 India + 150 Foreign = 400 Total)
      const activeAccounts = getSenderAccounts().filter(a => a.active);
      const effectiveDailyLimit = Math.max(this.dailyLimit || 400, (activeAccounts.length || 1) * 100);
      const regCounts = this.getTodaySentCountsByRegion();
      const sentToday = regCounts.total;

      if (sentToday >= effectiveDailyLimit || (regCounts.india >= this.dailyLimitIndia && regCounts.foreign >= this.dailyLimitForeign)) {
        this.status = 'daily_limit_reached';
        this.addLiveLog('LIMIT', `🛑 Today's safe goal of ${effectiveDailyLimit} emails (🇮🇳 ${regCounts.india}/${this.dailyLimitIndia} India + 🌍 ${regCounts.foreign}/${this.dailyLimitForeign} Foreign) reached across ${activeAccounts.length} sender accounts. Pausing to preserve Gmail account health.`, 'success');
        this.saveState();
        return;
      }

      // Safety guard 2: Hard rolling 24-hour ceiling per account
      const sent24h = this.get24hSentCount();
      const ROLLING_24H_HARD_LIMIT = Math.max(400, (activeAccounts.length || 1) * 350);
      if (sent24h >= ROLLING_24H_HARD_LIMIT) {
        this.status = 'daily_limit_reached';
        this.addLiveLog('LIMIT', `🛑 Rolling 24-hour safety ceiling reached (${sent24h}/${ROLLING_24H_HARD_LIMIT} in last 24h). Pausing engine until older sends roll off.`, 'warning');
        this.saveState();
        return;
      }

      // If queue is empty in autonomous mode, attempt to refill dynamically
      if (this.queue.length === 0 && this.isAutonomous) {
        this.addLiveLog('DISCOVER', `🔍 Queue reached 0. Autonomously discovering next fresh tech startup targets...`, 'info');
        const added = await this.replenishAutonomousQueue(this.batchSize);
        if (added === 0) {
          consecutiveEmptyReplenish++;
          if (consecutiveEmptyReplenish >= 2) {
            this.addLiveLog('BREAK', 'All currently available candidate targets have been processed. Scheduling cooldown break before next discovery sweep...', 'info');
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        } else {
          consecutiveEmptyReplenish = 0;
        }
      }

      if (this.queue.length === 0) break;

      // Select candidate that fits remaining quota for India (<250) vs Foreign (<150)
      const canSendIndia = regCounts.india < this.dailyLimitIndia;
      const canSendForeign = regCounts.foreign < this.dailyLimitForeign;

      let leadIndex = -1;
      for (let idx = 0; idx < this.queue.length; idx++) {
        const item = this.queue[idx];
        const isInd = this.isIndianLead(item);
        if (isInd && canSendIndia) {
          leadIndex = idx;
          break;
        }
        if (!isInd && canSendForeign) {
          leadIndex = idx;
          break;
        }
      }

      if (leadIndex === -1) {
        if (this.isAutonomous) {
          const added = await this.replenishAutonomousQueue(this.batchSize);
          if (added > 0) {
            for (let idx = 0; idx < this.queue.length; idx++) {
              const item = this.queue[idx];
              const isInd = this.isIndianLead(item);
              if ((isInd && canSendIndia) || (!isInd && canSendForeign)) {
                leadIndex = idx;
                break;
              }
            }
          }
        }
        if (leadIndex === -1) {
          this.addLiveLog('LIMIT', `🎯 Dual quotas reached or no matching leads available (🇮🇳 India: ${regCounts.india}/${this.dailyLimitIndia}, 🌍 Foreign: ${regCounts.foreign}/${this.dailyLimitForeign}).`, 'info');
          break;
        }
      }

      const r = this.queue.splice(leadIndex, 1)[0]; // Pull selected contact from queue
      const email = (r.email || '').toLowerCase().trim();
      const displayName = r.name || 'Hiring Manager';
      const displayCompany = r.company || 'your team';
      const isInd = this.isIndianLead(r);
      const leadRegion = isInd ? 'india' : 'foreign';
      const sourceDoc = r.sourceDoc || (this.isAutonomous ? `Autonomous Engine (${isInd ? '🇮🇳 India' : '🌍 Foreign'})` : 'PDF 1: Initial HR Database');

      // 0. Zero-Overlap Cross-Account Deduplication Guard (No duplicate company outreach)
      const { companies: contactedComps, domains: contactedDoms } = this.getContactedCompaniesAndDomains();
      const compLower = (displayCompany || '').toLowerCase().trim();
      const domLower = (email.split('@')[1] || '').toLowerCase().trim();

      const isCompDuplicate = compLower && compLower !== 'your team' && compLower !== 'your company' && contactedComps.has(compLower);
      const isDomDuplicate = domLower && contactedDoms.has(domLower);

      if (isCompDuplicate || isDomDuplicate) {
        this.addLiveLog('DEDUP', `🏢 Zero-overlap skip: ${displayCompany} (${domLower}) was already contacted by an outreach account! Skipping duplicate company.`, 'warning');
        await new Promise(res => setTimeout(res, 50));
        continue;
      }

      // 1. Pre-flight Validation: Syntax, Normalization, Suppression, DNS MX, A/AAAA fallback, Mailbox verification
      this.addLiveLog('VERIFY', `Pre-flight checking: ${email} (${displayCompany})...`, 'info');
      const valRes = await validateRecipient(email);
      if (!valRes.canSend) {
        if (valRes.isSuppressed) {
          this.stats.suppressed = (this.stats.suppressed || 0) + 1;
          this.addLiveLog('SUPPRESS', `🛡️ Suppressed address skipped: ${email} (${valRes.reason}) - Send blocked`, 'warning');
          this.logResult({
            email,
            name: displayName,
            company: displayCompany,
            sourceDoc,
            status: 'skipped_suppressed',
            error: valRes.reason
          });
        } else if (valRes.isInconclusive) {
          this.stats.deferred = (this.stats.deferred || 0) + 1;
          this.addLiveLog('DEFER', `⏳ Inconclusive validation deferred: ${email} (${valRes.reason})`, 'warning');
          this.logResult({
            email,
            name: displayName,
            company: displayCompany,
            sourceDoc,
            status: 'deferred_inconclusive',
            error: valRes.reason
          });
        } else {
          this.stats.skippedMx++;
          this.addLiveLog('SKIP', `❌ Pre-check rejected: ${email} (${valRes.reason}) - Bounce prevented`, 'warning');
          this.logResult({
            email,
            name: displayName,
            company: displayCompany,
            sourceDoc,
            status: 'skipped_invalid_domain',
            error: valRes.reason
          });
        }
        this.saveState();
        // Automatically pull next candidate without counting toward sentInThisBatch
        continue;
      }

      // 2. Select next active sender account that hasn't hit its 100/day quota today
      let selectedAccount = null;
      for (let attempt = 0; attempt < activeAccounts.length; attempt++) {
        const candidate = activeAccounts[(this.currentAccountIndex + attempt) % activeAccounts.length];
        const candidateSentToday = this.getTodaySentCount(candidate.user);
        if (candidateSentToday < 100) {
          selectedAccount = candidate;
          this.currentAccountIndex = (this.currentAccountIndex + attempt + 1) % activeAccounts.length;
          break;
        }
      }

      if (!selectedAccount) {
        this.status = 'daily_limit_reached';
        this.addLiveLog('LIMIT', `🛑 All active sender accounts have reached their individual 100/day limit (${sentToday}/${effectiveDailyLimit} sent today). Pausing until tomorrow.`, 'success');
        this.saveState();
        return;
      }

      // 3. Dry-Run Check: Validate and log simulation without sending real emails
      if (this.dryRun) {
        this.stats.dryRunSent = (this.stats.dryRunSent || 0) + 1;
        sentInThisBatch++;
        this.sentInCurrentBatch = sentInThisBatch;
        this.logResult({
          email: valRes.normalizedEmail || email,
          name: displayName,
          company: displayCompany,
          sourceDoc,
          senderAccount: selectedAccount.user,
          status: 'dry_run_sent',
          region: leadRegion,
          messageId: `DRY-RUN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        });
        const regBadge = leadRegion === 'india' ? '🇮🇳 India' : '🌍 Foreign';
        this.addLiveLog('DRY-RUN', `🧪 [Dry-Run ${sentInThisBatch}/${this.batchSize} | ${regBadge} via ${selectedAccount.label}] Validated & Simulated: ${displayCompany} <${valRes.normalizedEmail || email}> (Zero emails sent)`, 'info');
        this.saveState();
        if (sentInThisBatch < this.batchSize && (this.queue.length > 0 || this.isAutonomous) && !this.isCancelled) {
          await new Promise(res => setTimeout(res, 500));
        }
        continue;
      }

      let senderTransporter;
      try {
        senderTransporter = createTransporter(selectedAccount);
      } catch (e) {
        senderTransporter = transporter;
      }

      // 4. Personalize subject and message
      let personalizedSubject = this.activePayload.subject
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany)
        .replace(/{{\s*title\s*}}/gi, r.title || 'Role');

      let personalizedMessage = this.activePayload.message
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*title\s*}}/gi, r.title || 'the open role');

      const allKnownSenders = getSenderAccounts().map(a => a.user).filter(Boolean);
      allKnownSenders.forEach(u => {
        personalizedMessage = personalizedMessage.split(u).join(selectedAccount.user);
      });
      personalizedMessage = personalizedMessage
        .replace(/{{\s*(sender_email|email|my_email)\s*}}/gi, selectedAccount.user)
        .replace(
          /(Ketan Tiwari\s*\n\s*)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
          `$1${selectedAccount.user}`
        );

      if (displayName && displayName !== 'Hiring Manager') {
        personalizedMessage = personalizedMessage.replace(/^Dear\s+Hiring\s+Manager,/i, `Dear ${displayName},`);
      }
      if (displayCompany && displayCompany !== 'your team' && displayCompany !== 'your company') {
        personalizedMessage = personalizedMessage.replace(/at\s+your\s+company/gi, `at ${displayCompany}`);
        if (!personalizedSubject.includes(displayCompany) && !personalizedSubject.includes('{{')) {
          personalizedSubject = `${personalizedSubject} - ${displayCompany}`;
        }
      }

      // Always ensure fresh resume buffer directly from disk
      const dynamicResumePath = getDefaultResumePath();
      const resumeBufferToSend = (dynamicResumePath && fs.existsSync(dynamicResumePath))
        ? fs.readFileSync(dynamicResumePath)
        : (this.activePayload?.resume?.buffer || null);

      const mailOptions = {
        from: this.activePayload.senderName 
          ? `"${this.activePayload.senderName}" <${selectedAccount.user}>`
          : selectedAccount.user,
        replyTo: selectedAccount.user,
        to: email,
        subject: personalizedSubject,
        text: personalizedMessage,
        html: personalizedMessage.replace(/\n/g, '<br/>'),
        attachments: [
          {
            filename: this.activePayload.resume?.filename || 'Ketan_Resume.pdf',
            content: resumeBufferToSend,
            contentType: 'application/pdf'
          }
        ]
      };

      // 5. Send email individually
      try {
        const info = await senderTransporter.sendMail(mailOptions);
        this.stats.sent++;
        sentInThisBatch++;
        this.sentInCurrentBatch = sentInThisBatch;
        this.logResult({
          email: email,
          name: displayName,
          company: displayCompany,
          sourceDoc: sourceDoc,
          senderAccount: selectedAccount.user,
          status: 'sent',
          region: leadRegion,
          messageId: info.messageId
        });
        const liveCounts = this.getTodaySentCountsByRegion();
        const regBadge = leadRegion === 'india' ? '🇮🇳 India' : '🌍 Foreign';
        const curRegCount = leadRegion === 'india' ? liveCounts.india : liveCounts.foreign;
        const curRegLimit = leadRegion === 'india' ? this.dailyLimitIndia : this.dailyLimitForeign;
        this.addLiveLog('SENT', `🚀 [Sent ${sentInThisBatch}/${this.batchSize} | ${regBadge} (${curRegCount}/${curRegLimit}) | Total ${liveCounts.total}/${this.dailyLimit} via ${selectedAccount.label}] ${displayCompany} <${email}>`, 'success');
        this.saveState();
      } catch (err) {
        // Google SMTP Daily Sending Limit Circuit Breaker
        if (err.message && (err.message.includes('550-5.4.5') || err.message.includes('Daily user sending limit exceeded') || err.message.includes('550 5.4.5'))) {
          this.status = 'daily_limit_reached';
          this.addLiveLog('LIMIT', `🛑 Gmail Daily SMTP Sending Limit Exceeded (550-5.4.5)! Google has capped sends for this rolling 24-hour window. Pausing engine to protect your account.`, 'danger');
          // Re-insert uncontacted lead back to the front of queue so it is not lost
          this.queue.unshift(r);
          this.saveState();
          return; // Halt batch immediately!
        }

        const parseResult = suppressionService.parseSmtpError(err);
        if (parseResult.isHardBounce) {
          suppressionService.addSuppressed(email, {
            reason: parseResult.reason,
            bounceType: 'hard',
            source: 'smtp_response'
          });
          this.stats.failed++;
          this.logResult({
            email: email,
            name: displayName,
            company: displayCompany,
            sourceDoc: sourceDoc,
            status: 'failed_hard_bounce',
            error: parseResult.reason
          });
          this.addLiveLog('HARD-BOUNCE', `🚫 Hard bounce for ${email}: ${parseResult.reason}. Permanently suppressed.`, 'danger');
        } else if (parseResult.isSoftBounce) {
          suppressionService.handleTemporaryFailure(email, parseResult.reason);
          this.stats.failed++;
          this.logResult({
            email: email,
            name: displayName,
            company: displayCompany,
            sourceDoc: sourceDoc,
            status: 'failed_temporary',
            error: parseResult.reason
          });
          this.addLiveLog('SOFT-BOUNCE', `⚠️ Temporary soft bounce for ${email}: ${parseResult.reason}. Queued for retry.`, 'warning');
        } else {
          this.stats.failed++;
          this.logResult({
            email: email,
            name: displayName,
            company: displayCompany,
            sourceDoc: sourceDoc,
            status: 'failed',
            error: err.message
          });
          this.addLiveLog('FAIL', `❌ Failed sending to ${email}: ${err.message}`, 'danger');
        }
      }

      // 4. Ultra-Safe human pacing delay (8s - 14s) to eliminate bot patterns
      if (sentInThisBatch < this.batchSize && (this.queue.length > 0 || this.isAutonomous) && !this.isCancelled) {
        const delay = getRandomDelay(8000, 14000);
        await new Promise(res => setTimeout(res, delay));
      }
    }

    // If no emails were sent and queue is completely empty:
    if (sentInThisBatch === 0 && this.queue.length === 0) {
      if (this.isAutonomous) {
        await this.replenishAutonomousQueue(this.batchSize);
        if (this.queue.length > 0) {
          return this.runNextBatch();
        }
      }
      this.status = 'idle';
      this.nextBatchRunTime = null;
      this.addLiveLog('IDLE', 'All candidate targets contacted.', 'info');
      this.saveState();
      return;
    }

    // After batch completion:
    if (!this.isCancelled && (this.isAutonomous || this.queue.length > 0)) {
      this.status = 'waiting_pause';
      this.nextBatchRunTime = Date.now() + this.pauseDurationMs;
      const pauseMinutes = Math.round(this.pauseDurationMs / 60000);
      this.addLiveLog('BREAK', `☕ Batch ${this.currentBatchNumber} complete (${sentInThisBatch} sent). Taking a ${pauseMinutes}-minute cooldown break... Next batch starts automatically at ${new Date(this.nextBatchRunTime).toLocaleTimeString()}`, 'cooldown');
      this.saveState();

      // Autonomous discovery running in background during cooldown break
      if (this.isAutonomous) {
        this.runCooldownDiscovery();
      }

      // 🧹 AUTONOMOUS MULTI-INBOX PURGE: Automatically clean all sender inboxes during the 15m break (Zero permission needed)
      try {
        const activeAccCount = getSenderAccounts().filter(a => a.active).length;
        this.addLiveLog('PURGE', `🧹 [AUTONOMOUS INBOX CLEANER] Automatically scanning & cleaning delivery failures across all ${activeAccCount} sender inboxes during break...`, 'info');
        bouncePurgeService.autoPurgeAllAccounts({
          onLog: (msg) => this.addLiveLog('PURGE', msg, 'info'),
          purgeSent: true
        }).then(cleanRes => {
          if (cleanRes && cleanRes.totalPurged > 0) {
            this.addLiveLog('PURGE', `✅ Auto-clean complete: Purged ${cleanRes.totalInboxPurged || 0} inbox bounces and ${cleanRes.totalSentPurged || 0} sent emails across inboxes to Trash! Zero trace in Gmail.`, 'success');
          } else {
            this.addLiveLog('PURGE', `✅ Inboxes & Sent folders verified clean: Zero dead delivery failures detected.`, 'info');
          }
        }).catch(e => {
          console.warn('Auto-purge warning:', e.message);
        });
      } catch (e) {
        console.warn('Auto-purge trigger warning:', e.message);
      }

      this.timerId = setTimeout(() => {
        this.runNextBatch();
      }, this.pauseDurationMs);
    } else {
      this.status = 'completed';
      this.nextBatchRunTime = null;
      this.addLiveLog('FINISH', 'Campaign run finished.', 'info');
      this.saveState();
    }
  }

  // Pause
  pause() {
    if (this.status === 'waiting_pause') {
      if (this.timerId) clearTimeout(this.timerId);
      this.status = 'paused';
      this.nextBatchRunTime = null;
      this.addLiveLog('PAUSE', 'Campaign paused during break by user.', 'warning');
      this.saveState();
      return true;
    } else if (this.status === 'running_batch') {
      this.status = 'paused';
      this.addLiveLog('PAUSE', 'Campaign paused by user.', 'warning');
      this.saveState();
      return true;
    }
    return false;
  }

  // Resume
  resume(sendImmediately = false) {
    if (this.status !== 'paused' && this.status !== 'waiting_pause' && this.status !== 'idle') {
      throw new Error(`Campaign cannot be resumed in current state: ${this.status}`);
    }
    if (this.timerId) clearTimeout(this.timerId);

    if (sendImmediately || this.status === 'paused' || this.status === 'idle') {
      this.addLiveLog('RESUME', `Resuming outreach immediately at Batch ${this.currentBatchNumber + 1}...`, 'info');
      this.saveState();
      this.runNextBatch();
    } else {
      this.status = 'waiting_pause';
      this.nextBatchRunTime = Date.now() + this.pauseDurationMs;
      this.addLiveLog('RESUME', `Resuming pause timer (${Math.round(this.pauseDurationMs / 60000)}m)...`, 'info');
      this.saveState();
      this.timerId = setTimeout(() => this.runNextBatch(), this.pauseDurationMs);
    }
  }

  // Enter Cooldown Break
  enterCooldown(minutes = null) {
    if (this.timerId) clearTimeout(this.timerId);
    const duration = minutes ? (minutes * 60 * 1000) : (this.pauseDurationMs || 360000);
    this.status = 'waiting_pause';
    this.nextBatchRunTime = Date.now() + duration;
    const pauseMinutes = Math.round(duration / 60000);
    const activeAccCount = getSenderAccounts().filter(a => a.active).length;
    this.addLiveLog('BREAK', `☕ Test batch complete across all ${activeAccCount} sender accounts. Entering ${pauseMinutes}-minute cooldown break... Next batch starts automatically at ${new Date(this.nextBatchRunTime).toLocaleTimeString()}`, 'cooldown');
    this.saveState();
    if (this.isAutonomous) {
      this.runCooldownDiscovery();
    }
    // 🧹 Trigger autonomous multi-inbox cleaner during break (all active inboxes)
    bouncePurgeService.autoPurgeAllAccounts({ purgeSent: true }).then(cleanRes => {
      if (cleanRes && cleanRes.totalPurged > 0) {
        this.addLiveLog('PURGE', `🧹 [BREAK CLEANER] Auto-purged ${cleanRes.totalInboxPurged || 0} inbox bounces and ${cleanRes.totalSentPurged || 0} sent emails across inboxes to Trash! Zero trace in Gmail.`, 'success');
      }
    }).catch(() => {});
    this.timerId = setTimeout(() => this.runNextBatch(), duration);
    return true;
  }

  // Stop
  stop() {
    this.isCancelled = true;
    if (this.timerId) clearTimeout(this.timerId);
    this.status = 'stopped';
    this.queue = [];
    this.nextBatchRunTime = null;
    this.addLiveLog('STOP', 'Campaign halted by user.', 'warning');
    this.saveState();
  }

  saveState() {
    try {
      const stateData = {
        status: this.status,
        isAutonomous: this.isAutonomous,
        targetLocation: this.targetLocation,
        batchSize: this.batchSize,
        pauseDurationMs: this.pauseDurationMs,
        dailyLimitIndia: this.dailyLimitIndia || 250,
        dailyLimitForeign: this.dailyLimitForeign || 150,
        dailyLimit: this.dailyLimit,
        currentBatchNumber: this.currentBatchNumber,
        sentInCurrentBatch: this.sentInCurrentBatch,
        totalBatches: this.totalBatches,
        nextBatchRunTime: this.nextBatchRunTime,
        stats: this.stats,
        senderName: this.activePayload ? this.activePayload.senderName : '',
        subject: this.activePayload ? this.activePayload.subject : '',
        message: this.activePayload ? this.activePayload.message : ''
      };
      fs.writeFileSync(CAMPAIGN_STATE_FILE, JSON.stringify(stateData, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save campaign_state.json:', e);
    }
  }

  loadState() {
    try {
      if (fs.existsSync(CAMPAIGN_STATE_FILE)) {
        const raw = fs.readFileSync(CAMPAIGN_STATE_FILE, 'utf8').replace(/^\uFEFF/, '').trim();
        const saved = JSON.parse(raw || '{}');
        if (saved.status === 'waiting_pause' || saved.status === 'running_batch' || saved.status === 'paused' || saved.status === 'daily_limit_reached') {
          const defaultResume = getDefaultResumePath();
          if (defaultResume && fs.existsSync(defaultResume)) {
            this.activePayload = {
              resume: { filename: 'Ketan_Resume.pdf', buffer: fs.readFileSync(defaultResume) },
              senderName: saved.senderName || 'Ketan Tiwari',
              subject: saved.subject || 'Application: Software Engineering & AI Intern - Ketan Tiwari - {{company}}',
              message: saved.message || ''
            };
            this.isAutonomous = saved.isAutonomous !== undefined ? saved.isAutonomous : true;
            this.targetLocation = saved.targetLocation || 'all';
            this.batchSize = saved.batchSize || 60;
            this.pauseDurationMs = saved.pauseDurationMs || 6 * 60 * 1000;
            const activeAccs = getSenderAccounts().filter(a => a.active);
            this.dailyLimit = Math.max((activeAccs.length || 1) * 100, saved.dailyLimit || 400);
            this.dailyLimitIndia = saved.dailyLimitIndia || 250;
            this.dailyLimitForeign = saved.dailyLimitForeign || 150;
            this.currentBatchNumber = saved.currentBatchNumber || 0;
            this.stats = saved.stats || this.stats;
            this.sentInCurrentBatch = saved.sentInCurrentBatch || 0;

            const sentToday = this.getTodaySentCount();
            if (sentToday === 0) {
              this.currentBatchNumber = 0;
              this.sentInCurrentBatch = 0;
            }

            const alreadySent = this.getSentEmailsSet();
            const { companies: contactedComps, domains: contactedDoms } = this.getContactedCompaniesAndDomains();
            if (this.isAutonomous) {
              const freshInd = getFreshCandidates(this.targetLocation, alreadySent, contactedComps, contactedDoms);
              const freshFrg = getFreshForeignCandidates(alreadySent, 60, contactedComps, contactedDoms);
              const queueMerged = [];
              let idxI = 0, idxF = 0;
              while (idxI < freshInd.length || idxF < freshFrg.length) {
                for (let k = 0; k < 5 && idxI < freshInd.length; k++) queueMerged.push(freshInd[idxI++]);
                for (let k = 0; k < 3 && idxF < freshFrg.length; k++) queueMerged.push(freshFrg[idxF++]);
              }
              this.queue = queueMerged;
              this.totalBatches = this.currentBatchNumber + Math.max(1, Math.ceil(this.queue.length / this.batchSize));
            } else {
              const allContacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
              this.queue = allContacts.filter(c => c.email && EMAIL_REGEX.test(c.email) && !alreadySent.has(c.email.toLowerCase().trim()));
              this.totalBatches = this.currentBatchNumber + Math.ceil(this.queue.length / this.batchSize);
            }

            const remainingMs = (saved.nextBatchRunTime || 0) - Date.now();
            if (saved.status === 'waiting_pause') {
              if (remainingMs > 1000) {
                this.status = 'waiting_pause';
                this.nextBatchRunTime = saved.nextBatchRunTime;
                this.addLiveLog('RESUME', `Resuming cooldown break (${Math.round(remainingMs / 60000)}m remaining). Batch ${this.currentBatchNumber + 1} will start automatically.`, 'info');
                this.timerId = setTimeout(() => this.runNextBatch(), remainingMs);
              } else {
                // Cooldown break already completed while offline! Resume next batch automatically
                this.status = 'waiting_pause';
                this.nextBatchRunTime = Date.now() + 2000;
                this.addLiveLog('RESUME', `Cooldown break finished while offline. Starting Batch ${this.currentBatchNumber + 1} automatically...`, 'info');
                this.timerId = setTimeout(() => this.runNextBatch(), 2000);
              }
            } else if (saved.status === 'paused') {
              this.status = 'paused';
              this.addLiveLog('PAUSE', `Loaded paused campaign state at Batch ${this.currentBatchNumber}. Ready to resume where it stopped.`, 'warning');
            } else if (saved.status === 'running_batch') {
              // Interrupted mid-batch: seamlessly continue with next batch
              this.status = 'waiting_pause';
              this.nextBatchRunTime = Date.now() + 2000;
              this.addLiveLog('RESUME', `Resuming interrupted campaign at Batch ${this.currentBatchNumber + 1}...`, 'info');
              this.timerId = setTimeout(() => this.runNextBatch(), 2000);
            } else if (saved.status === 'daily_limit_reached') {
              const sentToday = this.getTodaySentCount();
              const limit = saved.dailyLimit || 400;
              if (sentToday < limit) {
                this.currentBatchNumber = 0;
                this.sentInCurrentBatch = 0;
                this.status = 'waiting_pause';
                this.nextBatchRunTime = Date.now() + 2000;
                this.addLiveLog('RESUME', `🌞 New day detected! Daily quota reset (${sentToday}/${limit} sent today). Starting today's Batch 1 automatically...`, 'info');
                this.timerId = setTimeout(() => this.runNextBatch(), 2000);
              } else {
                this.status = 'daily_limit_reached';
                this.addLiveLog('PAUSE', `Daily safe quota reached (${sentToday}/${limit}). Standing by for tomorrow.`, 'warning');
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load campaign_state.json:', e);
    }
  }

  // Status for Frontend Polling
  getStatus() {
    let secondsUntilNext = 0;
    if (this.nextBatchRunTime && this.status === 'waiting_pause') {
      secondsUntilNext = Math.max(0, Math.round((this.nextBatchRunTime - Date.now()) / 1000));
    }

    let lifetimeSent = 0;
    let lifetimeFiltered = 0;
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        lifetimeSent = history.filter(h => h.status === 'sent').length;
        lifetimeFiltered = history.filter(h => h.status === 'skipped_invalid_domain').length;
      }
    } catch (e) {}

    const regionCounts = this.getTodaySentCountsByRegion();

    return {
      status: this.status,
      isAutonomous: this.isAutonomous,
      targetLocation: this.targetLocation,
      currentBatch: this.currentBatchNumber,
      totalBatches: this.totalBatches,
      batchSize: this.batchSize,
      pauseMinutes: Math.round(this.pauseDurationMs / 60000),
      sentInCurrentBatch: this.sentInCurrentBatch,
      remainingInQueue: this.queue.length,
      nextBatchRunTime: this.nextBatchRunTime,
      secondsUntilNext: secondsUntilNext,
      sentToday: this.getTodaySentCount(),
      sentTodayIndia: regionCounts.india,
      sentTodayForeign: regionCounts.foreign,
      dailyLimitIndia: this.dailyLimitIndia || 250,
      dailyLimitForeign: this.dailyLimitForeign || 150,
      sent24h: this.get24hSentCount(),
      dailyLimit: Math.max(this.dailyLimit || 400, (getSenderAccounts().filter(a => a.active).length || 1) * 100),
      activeAccounts: getSenderAccounts().filter(a => a.active).map(a => ({
        user: a.user,
        label: a.label,
        sentToday: this.getTodaySentCount(a.user),
        limit: 100,
        status: this.getTodaySentCount(a.user) >= 100 ? 'capped' : 'active'
      })),
      lifetimeSent,
      lifetimeFiltered,
      stats: this.stats,
      liveLogs: this.liveLogs.slice(-60),
      recentLogs: this.recentLogs.slice(0, 30)
    };
  }

  // Reset engine to clean idle state
  reset() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.status = 'idle';
    this.queue = [];
    this.currentBatchNumber = 0;
    this.sentInCurrentBatch = 0;
    this.totalBatches = 0;
    this.nextBatchRunTime = null;
    this.isCancelled = false;
    this.activePayload = null;
    this.stats = {
      totalQueued: 0,
      sent: 0,
      failed: 0,
      skippedMx: 0
    };
    this.saveState();
  }
}

const campaignEngine = new CampaignEngine();
campaignEngine.loadState();

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    configuredUser: process.env.GMAIL_USER || null
  });
});

// Verify All Active Gmail SMTP Accounts
app.get('/api/verify-smtp', async (req, res) => {
  try {
    const allAccounts = getSenderAccounts();
    const activeAccounts = allAccounts.filter(a => a.active);
    const verifiedList = [];

    for (const acc of activeAccounts) {
      try {
        const tr = createTransporter(acc);
        await tr.verify();
        verifiedList.push({ user: acc.user, label: acc.label, status: 'online' });
      } catch (err) {
        verifiedList.push({ user: acc.user, label: acc.label, status: 'error', error: err.message });
      }
    }

    const onlineCount = verifiedList.filter(a => a.status === 'online').length;
    res.json({
      success: onlineCount > 0,
      activeCount: onlineCount,
      totalCount: activeAccounts.length,
      accounts: verifiedList,
      summary: `${onlineCount}/${activeAccounts.length} Senders Active`,
      user: verifiedList.map(a => a.label).join(', ')
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get HR contacts
app.get('/api/contacts', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
    const { search, limit, page } = req.query;

    let filtered = data;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q))
      );
    }

    if (limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 50;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(startIndex, startIndex + limitNum);

      return res.json({
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / limitNum),
        contacts: paginated
      });
    }

    res.json({
      total: filtered.length,
      contacts: filtered
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read contacts: ' + err.message });
  }
});

// Save or update contacts
app.post('/api/contacts', (req, res) => {
  try {
    const { contacts, overwrite } = req.body;
    if (!Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts must be an array.' });
    }

    let existing = [];
    if (!overwrite && fs.existsSync(CONTACTS_FILE)) {
      existing = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
    }

    const emailMap = new Map();
    existing.forEach(c => emailMap.set(c.email.toLowerCase(), c));
    contacts.forEach(c => {
      if (c.email && EMAIL_REGEX.test(c.email)) {
        emailMap.set(c.email.toLowerCase(), c);
      }
    });

    const merged = Array.from(emailMap.values());
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(merged, null, 2), 'utf8');

    res.json({
      success: true,
      message: `Saved ${merged.length} contacts.`,
      total: merged.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contacts: ' + err.message });
  }
});

// Sent history log
app.get('/api/history', (req, res) => {
  try {
    const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    res.json({ total: history.length, history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read sent history: ' + err.message });
  }
});

// Clean bounced emails (from pasted Gmail failure text or email list)
app.post('/api/clean-bounces', (req, res) => {
  try {
    const rawText = req.body.text || req.body.bouncedEmails || '';
    const inlineEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
    const matches = rawText.match(inlineEmailRegex) || [];
    
    // Ignore sender's own email and Google system addresses
    const cleanList = Array.from(new Set(matches.map(e => e.toLowerCase().trim())))
      .filter(e => e !== (process.env.GMAIL_USER || '').toLowerCase().trim() && !e.includes('googlemail.com') && !e.includes('gmail.com'));

    if (cleanList.length === 0) {
      return res.status(400).json({ error: 'No recipient email addresses found in the provided text.' });
    }

    let history = [];
    if (fs.existsSync(SENT_LOG_FILE)) {
      history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    }

    let cleanedCount = 0;
    cleanList.forEach(bouncedEmail => {
      suppressionService.addSuppressed(bouncedEmail, {
        reason: 'Bounced: Address not found / Deactivated (550 5.1.1)',
        bounceType: 'hard',
        source: 'clean_bounces_api'
      });

      const idx = history.findIndex(h => (h.email || '').toLowerCase().trim() === bouncedEmail);
      if (idx >= 0) {
        history[idx].status = 'skipped_invalid_domain';
        history[idx].error = 'Bounced: Address not found / Deactivated (550 5.1.1)';
        history[idx].bouncedAt = new Date().toISOString();
        cleanedCount++;
      } else {
        history.push({
          email: bouncedEmail,
          status: 'skipped_invalid_domain',
          error: 'Bounced: Address not found / Deactivated (550 5.1.1)',
          timestamp: new Date().toISOString()
        });
        cleanedCount++;
      }
    });

    fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');

    // Update campaign_state stats
    if (fs.existsSync(CAMPAIGN_STATE_FILE)) {
      try {
        const state = JSON.parse(fs.readFileSync(CAMPAIGN_STATE_FILE, 'utf8') || '{}');
        if (state.stats) {
          state.stats.sent = history.filter(h => h.status === 'sent').length;
          state.stats.skippedMx = history.filter(h => h.status === 'skipped_invalid_domain').length;
          fs.writeFileSync(CAMPAIGN_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: `Cleaned ${cleanedCount} bounced email(s) from database!`,
      cleanedEmails: cleanList
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clean bounces: ' + err.message });
  }
});

// =============================================================
// EMAIL VALIDATION, SUPPRESSION LIST & AUDIT LOG API ENDPOINTS
// =============================================================

// Validate a single recipient with full RFC 5321 breakdown
app.post('/api/validate-recipient', async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const result = await validateRecipient(email);
    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validation dashboard stats (counts for valid, invalid, suppressed, pendingVerification, temporaryFailures)
app.get('/api/validation/stats', (req, res) => {
  try {
    const stats = suppressionService.getDashboardStats();
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all suppressed email addresses
app.get('/api/suppression-list', (req, res) => {
  try {
    const list = suppressionService.getAllSuppressed();
    res.json({
      success: true,
      count: list.length,
      items: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually add an email to the suppression list
app.post('/api/suppression-list', (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const reason = (req.body.reason || 'Manual administrative suppression').trim();
    const bounceType = req.body.bounceType || 'hard';
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const record = suppressionService.addSuppressed(email, {
      reason,
      bounceType,
      source: 'manual_api'
    });
    res.json({
      success: true,
      message: `Suppressed ${email}`,
      record
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove an email from the suppression list
app.delete('/api/suppression-list/:email', (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email || '').trim();
    const deleted = suppressionService.removeSuppressed(email);
    res.json({
      success: true,
      deleted,
      message: deleted ? `Removed ${email} from suppression list` : `Email not found in suppression list`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent email validation audit logs
app.get('/api/validation/audit-logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = suppressionService.getAuditLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Automatic IMAP Scanner to detect and clean all bounces from Gmail Inbox directly
function autoCleanGmailBounces() {
  return new Promise((resolve) => {
    let isDone = false;
    function safeFinish(result = { totalFound: 0, updatedCount: 0, bouncedEmails: [] }) {
      if (isDone) return;
      isDone = true;
      resolve(result);
    }

    // 5-second hard timeout
    const hardTimer = setTimeout(() => {
      safeFinish();
    }, 5000);

    const user = process.env.GMAIL_USER;
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!user || !pass) {
      clearTimeout(hardTimer);
      return safeFinish();
    }

    let socket;
    try {
      socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
      socket.setEncoding('utf8');
      socket.setTimeout(4000);
    } catch (e) {
      clearTimeout(hardTimer);
      return safeFinish();
    }

    let buffer = '';
    const detectedBounces = new Set();
    let messageIds = [];
    let currentIdx = 0;
    let step = 'WAIT_GREETING';

    function finishClean() {
      clearTimeout(hardTimer);
      try { socket.write('X LOGOUT\r\n'); } catch (e) {}
      try { socket.destroy(); } catch (e) {}

      // Update sent_log.json with all detected bounces
      const bounceList = Array.from(detectedBounces);
      let history = [];
      try {
        if (fs.existsSync(SENT_LOG_FILE)) {
          history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        }
      } catch (e) {}

      let updatedCount = 0;
      bounceList.forEach(bEmail => {
        const clean = bEmail.toLowerCase().trim();
        suppressionService.addSuppressed(clean, {
          reason: 'Bounced: Address not found / Deactivated (550 5.1.1) [Auto-synced from Gmail]',
          bounceType: 'hard',
          source: 'auto_clean_gmail'
        });

        const idx = history.findIndex(h => (h.email || '').toLowerCase().trim() === clean);
        if (idx >= 0) {
          history[idx].status = 'skipped_invalid_domain';
          history[idx].error = 'Bounced: Address not found / Deactivated (550 5.1.1) [Auto-synced from Gmail]';
          history[idx].bouncedAt = new Date().toISOString();
          updatedCount++;
        } else {
          history.push({
            email: clean,
            status: 'skipped_invalid_domain',
            error: 'Bounced: Address not found / Deactivated (550 5.1.1) [Auto-synced from Gmail]',
            timestamp: new Date().toISOString()
          });
          updatedCount++;
        }
      });

      try {
        fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
        if (fs.existsSync(CAMPAIGN_STATE_FILE)) {
          const state = JSON.parse(fs.readFileSync(CAMPAIGN_STATE_FILE, 'utf8') || '{}');
          if (state.stats) {
            state.stats.sent = history.filter(h => h.status === 'sent').length;
            state.stats.skippedMx = history.filter(h => h.status === 'skipped_invalid_domain').length;
            fs.writeFileSync(CAMPAIGN_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
          }
        }
      } catch (e) {}

      safeFinish({
        totalFound: bounceList.length,
        updatedCount: updatedCount,
        bouncedEmails: bounceList
      });
    }

    socket.on('data', (chunk) => {
      buffer += chunk;

      if (step === 'WAIT_GREETING' && buffer.includes('* OK')) {
        buffer = '';
        step = 'LOGGING_IN';
        socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
      } else if (step === 'LOGGING_IN' && buffer.includes('A1 ')) {
        if (!buffer.includes('A1 OK')) {
          return finishClean();
        }
        buffer = '';
        step = 'SELECTING';
        socket.write('A2 SELECT INBOX\r\n');
      } else if (step === 'SELECTING' && buffer.includes('A2 ')) {
        if (!buffer.includes('A2 OK')) {
          return finishClean();
        }
        buffer = '';
        step = 'SEARCHING';
        socket.write('A3 SEARCH FROM "mailer-daemon@googlemail.com"\r\n');
      } else if (step === 'SEARCHING' && buffer.includes('A3 ')) {
        const match = buffer.match(/\* SEARCH ([\d\s]+)/);
        buffer = '';
        if (match && match[1].trim()) {
          messageIds = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
          if (messageIds.length > 50) messageIds = messageIds.slice(-50);
          if (messageIds.length > 0) {
            step = 'FETCHING';
            currentIdx = 0;
            socket.write(`F${currentIdx} FETCH ${messageIds[currentIdx]} BODY[TEXT]\r\n`);
          } else {
            finishClean();
          }
        } else {
          finishClean();
        }
      } else if (step === 'FETCHING') {
        const tag = `F${currentIdx} `;
        if (buffer.includes(tag)) {
          const p1 = /wasn['’]t delivered to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
          const p2 = /Final-Recipient:\s*rfc822;\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
          const m1 = buffer.match(p1);
          const m2 = buffer.match(p2);
          if (m1) detectedBounces.add(m1[1].toLowerCase().trim());
          if (m2) detectedBounces.add(m2[1].toLowerCase().trim());

          if (!m1 && !m2) {
            const allEmails = buffer.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi) || [];
            allEmails.forEach(e => {
              const c = e.toLowerCase().trim();
              if (c !== user.toLowerCase() && !c.includes('googlemail.com') && !c.includes('google.com') && !c.includes('gmail.com')) {
                detectedBounces.add(c);
              }
            });
          }

          buffer = '';
          currentIdx++;
          if (currentIdx < messageIds.length) {
            socket.write(`F${currentIdx} FETCH ${messageIds[currentIdx]} BODY[TEXT]\r\n`);
          } else {
            finishClean();
          }
        }
      }
    });

    socket.on('error', () => finishClean());
    socket.on('timeout', () => finishClean());
    socket.on('end', () => finishClean());
    socket.on('close', () => finishClean());
  });
}

// 1-Click Auto-Scan Endpoint
app.post('/api/auto-sync-gmail-bounces', async (req, res) => {
  try {
    const result = await autoCleanGmailBounces();
    res.json({
      success: true,
      message: `Cleaned ${result.updatedCount} bounced email(s) directly from your Gmail Inbox!`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: 'Auto-sync failed: ' + err.message });
  }
});

// Extract candidate details from uploaded Resume PDF
app.post('/api/extract-resume', upload.single('resume'), async (req, res) => {
  try {
    let buffer = null;
    let originalName = 'Resume.pdf';

    if (req.file) {
      buffer = req.file.buffer;
      originalName = req.file.originalname;
    } else {
      const defaultPath = getDefaultResumePath();
      if (defaultPath && fs.existsSync(defaultPath)) {
        buffer = fs.readFileSync(defaultPath);
        originalName = path.basename(defaultPath);
      }
    }

    if (!buffer) {
      return res.status(400).json({ error: 'No resume PDF provided.' });
    }

    // Persist as active_resume.pdf for zero-manual campaign runs
    const activeResumePath = path.join(DATA_DIR, 'active_resume.pdf');
    fs.writeFileSync(activeResumePath, buffer);

    const parsedData = await pdfParse(buffer);
    const text = parsedData.text || '';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let candidateName = 'Ketan Tiwari';
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const l = lines[i];
      if (/resume|curriculum|vitae|education|profile|portfolio|linkedin|github/i.test(l)) continue;
      if (l.includes('@') || /^\+?\d/.test(l) || l.length > 35) continue;
      if (/^[A-Za-z\s.]{3,30}$/.test(l)) {
        candidateName = l.trim();
        break;
      }
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const candidateEmail = emailMatch ? emailMatch[0].trim() : (process.env.GMAIL_USER || (getSenderAccounts().find(a => a.active) || {}).user || '');
    const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6-9]\d{9}|(?:\+?\d{1,3}[\s-]?)?\(?\d{3,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
    const candidatePhone = phoneMatch ? phoneMatch[0].trim() : '';

    const skillKeywords = [
      'Generative AI', 'Full-Stack', 'Large Language', 'LLM', 'RAG', 'Python', 'Node.js', 'React', 'Next.js',
      'FastAPI', 'Express', 'TypeScript', 'JavaScript', 'Docker', 'Kubernetes', 'AWS',
      'PostgreSQL', 'NoSQL', 'MongoDB', 'LangChain', 'LlamaIndex', 'Machine Learning', 'Deep Learning',
      'PyTorch', 'TensorFlow', 'REST APIs', 'GraphQL', 'Java', 'Git'
    ];
    const detectedSkills = [];
    for (const skill of skillKeywords) {
      if (new RegExp('\\b' + skill.toLowerCase() + '\\b', 'i').test(text.toLowerCase())) {
        detectedSkills.push(skill === 'Large Language' ? 'LLMs' : skill);
      }
    }

    const primarySkills = detectedSkills.length > 0 ? detectedSkills.slice(0, 5) : ['Full-Stack', 'Generative AI', 'LLM/RAG', 'Python', 'Node.js'];
    const skillsString = primarySkills.join(', ');

    const suggestedSubject = `Application: Software Engineering & AI Intern - ${candidateName} - {{company}}`;
    const suggestedMessage = `Dear {{name}},

I hope you are doing well.

I am writing to inquire about Software Engineering and AI/ML Internship opportunities at {{company}}.

I am a passionate developer with hands-on experience in ${skillsString}. I have built production-ready full-stack applications, autonomous agentic workflows, scalable backend APIs, and modern AI/LLM pipelines. I am keen to join {{company}} as an engineering intern to contribute directly to impactful projects and learn from your talented engineering team.

Please find my resume attached for your review. I would welcome the opportunity for a brief conversation to discuss how I can add value to your team.

Thank you for your time and consideration.

Best regards,
${candidateName}
${candidateEmail}
${candidatePhone}`.trim();

    res.json({
      success: true,
      filename: originalName,
      candidate: {
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        skills: detectedSkills
      },
      suggested: {
        senderName: candidateName,
        subject: suggestedSubject,
        message: suggestedMessage
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract resume details: ' + err.message });
  }
});

// Extract contacts from uploaded HR PDF & auto-save to queue with source tracking
app.post('/api/extract-contacts', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const parsedData = await pdfParse(req.file.buffer);
    const text = parsedData.text || '';
    
    // Vault tracking
    const vaultList = getVaultHistory();
    const nextDocNum = vaultList.length + 1;
    const docLabel = `PDF ${nextDocNum}`;
    const sourceDoc = `${docLabel}: ${req.file.originalname}`;

    // Parse contacts from text
    const lines = text.split('\n');
    const contacts = [];
    const seenEmails = new Set();
    const inlineEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

    const knownCorps = {
      'tcs': 'TCS',
      'ibm': 'IBM',
      'hcl': 'HCL Technologies',
      'wipro': 'Wipro',
      'infosys': 'Infosys',
      'cognizant': 'Cognizant',
      'capgemini': 'Capgemini',
      'accenture': 'Accenture',
      'amazon': 'Amazon',
      'google': 'Google',
      'microsoft': 'Microsoft',
      'oracle': 'Oracle'
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const match = line.match(inlineEmailRegex);
      if (!match) continue;

      const email = match[1].toLowerCase().trim();
      if (seenEmails.has(email)) continue;

      const emailIdx = line.indexOf(match[0]);
      const beforeEmail = line.substring(0, emailIdx).trim();
      const afterEmail = line.substring(emailIdx + match[0].length).trim();

      let name = beforeEmail.replace(/^\d+[\s.-]+/, '').trim();
      if (!name) {
        name = email.split('@')[0].replace(/[._]/g, ' ');
      }

      let company = '';
      const domainParts = email.split('@')[1].split('.');
      if (domainParts.length >= 2) {
        const mainDomain = domainParts[0].toLowerCase();
        if (knownCorps[mainDomain]) {
          company = knownCorps[mainDomain];
        } else if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'rediffmail', 'protonmail', 'icloud'].includes(mainDomain)) {
          company = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
        }
      }

      contacts.push({
        email,
        name,
        title: afterEmail || 'HR / Talent Partner',
        company: company || 'your team',
        sourceDoc: sourceDoc
      });
      seenEmails.add(email);
    }

    // Auto-save & merge to CONTACTS_FILE (Zero-manual step)
    let existingContacts = [];
    if (fs.existsSync(CONTACTS_FILE)) {
      try {
        existingContacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
      } catch (e) {
        existingContacts = [];
      }
    }
    const existingEmails = new Set(existingContacts.map(c => (c.email || '').toLowerCase().trim()));
    let addedCount = 0;

    for (const c of contacts) {
      if (!existingEmails.has(c.email)) {
        existingContacts.push({
          id: existingContacts.length + 1,
          name: c.name,
          email: c.email,
          title: c.title,
          company: c.company,
          sourceDoc: c.sourceDoc
        });
        existingEmails.add(c.email);
        addedCount++;
      }
    }

    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(existingContacts, null, 2), 'utf8');

    // Record document in vault metadata
    vaultList.push({
      id: `pdf-${nextDocNum}`,
      docNum: nextDocNum,
      label: docLabel,
      filename: req.file.originalname,
      sourceDoc: sourceDoc,
      uploadedAt: new Date().toISOString(),
      totalExtracted: contacts.length,
      totalSent: 0
    });
    fs.writeFileSync(VAULT_METADATA_FILE, JSON.stringify(vaultList, null, 2), 'utf8');

    res.json({
      success: true,
      pages: parsedData.numpages,
      sourceDoc: sourceDoc,
      docLabel: docLabel,
      count: contacts.length,
      addedCount: addedCount,
      totalInDb: existingContacts.length,
      contacts: contacts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract contacts from PDF: ' + err.message });
  }
});

// Check for preloaded default resume
app.get('/api/default-resume', (req, res) => {
  const defaultPath = getDefaultResumePath();
  if (defaultPath && fs.existsSync(defaultPath)) {
    const stat = fs.statSync(defaultPath);
    return res.json({
      exists: true,
      filename: path.basename(defaultPath),
      size: stat.size
    });
  }
  res.json({ exists: false });
});

// ---------------- AUTONOMOUS 100% HANDS-FREE OUTREACH ENDPOINTS ----------------

// Start Autonomous Outreach (Auto-Find HRs, SMTP pre-check, 30 emails/batch, 5-min cooldown)
app.post('/api/autonomous/start', upload.single('resume'), async (req, res) => {
  try {
    let resumeFileBuffer = req.file ? req.file.buffer : null;
    let resumeFileName = req.file ? req.file.originalname : 'Ketan_Resume.pdf';

    if (!resumeFileBuffer) {
      const defaultPdfPath = getDefaultResumePath();
      if (defaultPdfPath && fs.existsSync(defaultPdfPath)) {
        resumeFileBuffer = fs.readFileSync(defaultPdfPath);
        resumeFileName = 'Ketan_Resume.pdf';
      } else {
        return res.status(400).json({ error: 'Resume PDF is required to start autonomous outreach.' });
      }
    }

    const senderName = (req.body.senderName || req.body.name || 'Ketan Tiwari').trim();
    const subject = (req.body.subject || 'Application: Software Engineering & AI Intern - Ketan Tiwari - {{company}}').trim();
    const message = (req.body.message || `Dear {{name}},

I hope you are doing well.

I am writing to express my strong interest in Software Engineering, Full-Stack, and AI Internship opportunities at {{company}}.

I am a Full-Stack & Generative AI Engineer with hands-on experience building production-ready LLM/RAG pipelines, autonomous agentic workflows, scalable backend APIs, and modern web applications with React and Node.js. I am eager to contribute directly to impactful projects and learn from your talented engineering team.

Please find my updated resume attached for your review. I would welcome the opportunity for a brief conversation to discuss how I can add immediate value to your team.

Thank you for your time and consideration.

Best regards,
Ketan Tiwari
{{sender_email}}`).trim();

    const batchSize = parseInt(req.body.batchSize, 10) || 60;
    const pauseMinutes = parseInt(req.body.pauseMinutes, 10) || 6;
    const activeAccounts = getSenderAccounts().filter(a => a.active);
    const safeDailyQuota = Math.max(100, (activeAccounts.length || 1) * 100);
    const dailyLimit = req.body.dailyLimit && parseInt(req.body.dailyLimit, 10) >= safeDailyQuota ? parseInt(req.body.dailyLimit, 10) : safeDailyQuota;

    const payload = {
      resume: {
        filename: resumeFileName,
        buffer: resumeFileBuffer
      },
      senderName,
      subject,
      message
    };

    const location = req.body.location || 'all';
    const dryRun = req.body.dryRun === 'true' || req.body.dryRun === true;
    await campaignEngine.startAutonomous(payload, { batchSize, pauseMinutes, location, dailyLimit, dryRun });

    res.json({
      success: true,
      dryRun,
      message: `Autonomous Dual-Engine started! ${dryRun ? '🧪 [DRY-RUN MODE: ZERO EMAILS SENT] ' : ''}Targeting 250 Indian Startups + 150 Foreign HRs in safe batches of ${batchSize} with ${pauseMinutes}-min cooldown breaks.`,
      status: campaignEngine.getStatus()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pause Autonomous Outreach
app.post('/api/autonomous/pause', (req, res) => {
  try {
    campaignEngine.pause();
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resume Autonomous Outreach (optional immediate send)
app.post('/api/autonomous/resume', (req, res) => {
  try {
    const immediate = req.body.immediate === true;
    campaignEngine.resume(immediate);
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Explicit Cooldown Break Trigger
app.post('/api/autonomous/cooldown', (req, res) => {
  try {
    const minutes = req.body.minutes ? parseInt(req.body.minutes, 10) : null;
    campaignEngine.enterCooldown(minutes);
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stop Autonomous Outreach
app.post('/api/autonomous/stop', (req, res) => {
  try {
    campaignEngine.stop();
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Autonomous Outreach status (polled by frontend)
app.get('/api/autonomous/status', (req, res) => {
  res.json(campaignEngine.getStatus());
});

// Trigger Mistral AI dynamic startup discovery on demand
app.post('/api/autonomous/ai-discover', async (req, res) => {
  try {
    const count = parseInt(req.body.count, 10) || 50;
    const leads = await discoverCompaniesViaMistral({
      countNeeded: count,
      onProgress: (tag, msg, style) => campaignEngine.addLiveLog(tag, msg, style)
    });
    if (leads && leads.length > 0) {
      const existingInQueue = new Set(campaignEngine.queue.map(q => (q.email || '').toLowerCase().trim()));
      const newLeads = leads.filter(l => !existingInQueue.has((l.email || '').toLowerCase().trim()));
      campaignEngine.queue.push(...newLeads);
      campaignEngine.totalBatches = Math.max(1, Math.ceil(campaignEngine.queue.length / campaignEngine.batchSize)) + campaignEngine.currentBatchNumber;
      campaignEngine.saveState();
    }
    res.json({
      success: true,
      count: leads.length,
      queueLength: campaignEngine.queue.length,
      leads: leads
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- INBOX RESPONSE RADAR ENDPOINTS ----------------
// Get cached classified responses
app.get('/api/inbox/responses', (req, res) => {
  try {
    const data = getCachedResponses();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger live IMAP inbox synchronization
app.post('/api/inbox/sync', async (req, res) => {
  try {
    const maxMessages = parseInt(req.body.maxMessages, 10) || 150;
    const result = await syncInboxResponses({ maxMessages });
    res.json({
      success: true,
      message: `Inbox synced! Discovered ${result.stats.genuineCount} genuine recruiter responses and ${result.stats.automatedCount} automated acks (${result.bouncesFiltered} bounces filtered).`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync inbox: ' + err.message });
  }
});

// ---------------- GMAIL INBOX BOUNCE & GHOST PURGE ENDPOINTS ----------------
// Helper to get active default account
const getDefaultSenderAccount = () => (getSenderAccounts().find(a => a.active) || {}).user || '';

// Preview bounces in INBOX (strict classification: clear_to_delete vs doubt_review)
app.get('/api/bounces/preview', async (req, res) => {
  try {
    const targetAccount = req.query.account || getDefaultSenderAccount();
    const previewLimit = parseInt(req.query.previewLimit, 10) || 60;
    const result = await bouncePurgeService.scanBouncesInInbox(targetAccount, { previewLimit });
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to scan inbox bounces: ' + err.message });
  }
});

// Purge confirmed bounces from INBOX and Sent Mail (Bidirectional: moves to [Gmail]/Bin / Trash)
app.post('/api/bounces/purge', async (req, res) => {
  try {
    const targetAccount = req.body.account || getDefaultSenderAccount();
    const uids = Array.isArray(req.body.uids) ? req.body.uids : [];
    const deleteAllConfirmed = Boolean(req.body.deleteAllConfirmed);
    const purgeSentMail = req.body.purgeSentMail !== false;
    const failedRecipients = Array.isArray(req.body.failedRecipients) ? req.body.failedRecipients : [];

    const result = await bouncePurgeService.purgeBouncesFromInbox(targetAccount, {
      uids,
      deleteAllConfirmed,
      purgeSentMail,
      failedRecipients
    });

    // Also notify live campaign logger if available
    try {
      campaignEngine.addLiveLog(
        'PURGE',
        `🧹 Moved ${result.purgedCount || 0} inbox bounces and ${result.purgedSentCount || 0} sent emails to Trash in ${targetAccount}! Zero trace in Gmail.`,
        'success'
      );
    } catch (e) {}

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge bounces: ' + err.message });
  }
});

// Purge failed outgoing emails from Gmail "Sent Mail" folder on demand
app.post('/api/bounces/purge-sent', async (req, res) => {
  try {
    const targetAccount = req.body.account || getDefaultSenderAccount();
    const recipientEmails = Array.isArray(req.body.recipientEmails) ? req.body.recipientEmails : [];
    const sweepAllHistorical = Boolean(req.body.sweepAllHistorical);

    const result = await bouncePurgeService.purgeSentMailsForRecipients(targetAccount, {
      recipientEmails,
      sweepAllHistorical
    });

    try {
      campaignEngine.addLiveLog(
        'PURGE',
        `🧹 Moved ${result.purgedSentCount || 0} failed sent emails from Sent Mail to Trash in ${targetAccount}!`,
        'success'
      );
    } catch (e) {}

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge sent emails: ' + err.message });
  }
});

// Trigger full autonomous multi-inbox sweep across ALL sender accounts (Inbox + Sent Mail)
app.post('/api/bounces/auto-sweep', async (req, res) => {
  try {
    const sweepHistorical = req.body.sweepHistorical !== false;
    const result = await bouncePurgeService.autoPurgeAllAccounts({
      purgeSent: true,
      sweepHistorical
    });
    try {
      if (result && result.totalPurged > 0) {
        campaignEngine.addLiveLog(
          'PURGE',
          `🧹 [AUTONOMOUS SWEEP] Auto-purged ${result.totalInboxPurged || 0} inbox bounces and ${result.totalSentPurged || 0} sent emails across inboxes to Trash!`,
          'success'
        );
      }
    } catch (e) {}
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run auto-sweep: ' + err.message });
  }
});

// Purge single bounce UID (e.g. for doubtful item review)
app.post('/api/bounces/purge-single', async (req, res) => {
  try {
    const targetAccount = req.body.account || getDefaultSenderAccount();
    const uid = parseInt(req.body.uid, 10);
    if (!uid) {
      return res.status(400).json({ error: 'Invalid UID specified' });
    }

    const result = await bouncePurgeService.purgeBouncesFromInbox(targetAccount, {
      uids: [uid]
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to purge email: ' + err.message });
  }
});

// Get bounce purge audit log history
app.get('/api/bounces/history', (req, res) => {
  try {
    const history = bouncePurgeService.getPurgeHistory();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear bounce purge audit history
app.delete('/api/bounces/history', (req, res) => {
  try {
    bouncePurgeService.clearPurgeHistory();
    res.json({ success: true, message: 'Purge audit history cleared successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Permanently empty Gmail Trash folder via IMAP EXPUNGE
app.post('/api/bounces/empty-trash', async (req, res) => {
  try {
    const account = req.body.account;
    if (account) {
      const result = await bouncePurgeService.emptyTrashPermanently(account);
      return res.json(result);
    }
    // All active accounts
    const accounts = getSenderAccounts().filter(a => a.active);
    const results = [];
    for (const acc of accounts) {
      try {
        const r = await bouncePurgeService.emptyTrashPermanently(acc.user);
        results.push(r);
      } catch (e) {
        results.push({ account: acc.user, error: e.message });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Autonomous 5-Minute Sweeper Status & Interval
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastAutoPurgeAt = null;
let nextAutoPurgeAt = Date.now() + 10 * 1000;
let lastAutoPurgeSummary = null;

// Get autonomous 5-min sweeper status & countdown
app.get('/api/bounces/auto-status', (req, res) => {
  const remainingMs = Math.max(0, nextAutoPurgeAt - Date.now());
  res.json({
    active: true,
    intervalMs: AUTO_SYNC_INTERVAL_MS,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    lastAutoPurgeAt,
    nextAutoPurgeAt: new Date(nextAutoPurgeAt).toISOString(),
    lastSummary: lastAutoPurgeSummary
  });
});

// ---------------- AUTOPILOT CAMPAIGN ENDPOINTS ----------------

// Start automated campaign (13 emails per batch, 30-min pause, 2-5s random intra-batch delay)
app.post('/api/campaign/start', upload.single('resume'), (req, res) => {
  try {
    let resumeFileBuffer = req.file ? req.file.buffer : null;
    let resumeFileName = req.file ? req.file.originalname : 'Ketan_Resume.pdf';

    if (!resumeFileBuffer) {
      const defaultPdfPath = getDefaultResumePath();
      if (defaultPdfPath && fs.existsSync(defaultPdfPath)) {
        resumeFileBuffer = fs.readFileSync(defaultPdfPath);
        resumeFileName = 'Ketan_Resume.pdf';
      } else {
        return res.status(400).json({ error: 'Resume PDF is required to start a campaign.' });
      }
    }

    const senderName = (req.body.senderName || req.body.name || '').trim();
    const subject = (req.body.subject || '').trim();
    const message = (req.body.message || '').trim();
    const batchSize = parseInt(req.body.batchSize, 10) || 60;
    const pauseMinutes = parseInt(req.body.pauseMinutes, 10) || 6;

    if (!subject) return res.status(400).json({ error: 'Subject line is required.' });
    if (!message) return res.status(400).json({ error: 'Cover message body is required.' });

    let recipients = [];
    if (req.body.recipients) {
      try {
        recipients = typeof req.body.recipients === 'string' 
          ? JSON.parse(req.body.recipients) 
          : req.body.recipients;
      } catch (e) {
        // comma or newline separated
        recipients = req.body.recipients.split(/[\r\n,;]+/)
          .map(e => ({ email: e.trim() }))
          .filter(r => r.email);
      }
    } else {
      // Default to all saved contacts in hr_contacts.json
      recipients = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
    }

    const payload = {
      resume: {
        filename: resumeFileName,
        buffer: resumeFileBuffer
      },
      senderName,
      subject,
      message
    };

    const dryRun = req.body.dryRun === 'true' || req.body.dryRun === true;
    campaignEngine.start(payload, recipients, batchSize, pauseMinutes, { dryRun });

    res.json({
      success: true,
      dryRun,
      message: `Autopilot campaign started! ${dryRun ? '🧪 [DRY-RUN MODE: ZERO EMAILS SENT] ' : ''}Batch size: ${batchSize}, Pause: ${pauseMinutes}m.`,
      status: campaignEngine.getStatus()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Pause campaign
app.post('/api/campaign/pause', (req, res) => {
  try {
    campaignEngine.pause();
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resume campaign (optional immediate)
app.post('/api/campaign/resume', (req, res) => {
  try {
    const immediate = req.body.immediate === true;
    campaignEngine.resume(immediate);
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stop campaign
app.post('/api/campaign/stop', (req, res) => {
  try {
    campaignEngine.stop();
    res.json({ success: true, status: campaignEngine.getStatus() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update campaign config dynamically (batchSize, pauseMinutes, subject, message, senderName)
app.post('/api/campaign/update-config', (req, res) => {
  try {
    const { batchSize, pauseMinutes, subject, message, senderName } = req.body;
    if (batchSize && parseInt(batchSize, 10) > 0) {
      campaignEngine.batchSize = parseInt(batchSize, 10);
      campaignEngine.totalBatches = Math.ceil(campaignEngine.queue.length / campaignEngine.batchSize) + campaignEngine.currentBatchNumber;
    }
    if (pauseMinutes && parseInt(pauseMinutes, 10) > 0) {
      campaignEngine.pauseDurationMs = parseInt(pauseMinutes, 10) * 60 * 1000;
    }
    if (subject && subject.trim()) {
      if (!campaignEngine.activePayload) campaignEngine.activePayload = {};
      campaignEngine.activePayload.subject = subject.trim();
    }
    if (message && message.trim()) {
      if (!campaignEngine.activePayload) campaignEngine.activePayload = {};
      campaignEngine.activePayload.message = message.trim();
    }
    if (senderName && senderName.trim()) {
      if (!campaignEngine.activePayload) campaignEngine.activePayload = {};
      campaignEngine.activePayload.senderName = senderName.trim();
    }
    campaignEngine.saveState();
    res.json({
      success: true,
      message: 'Campaign configuration updated successfully.',
      status: campaignEngine.getStatus()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get campaign status (polled by frontend)
app.get('/api/campaign/status', (req, res) => {
  res.json(campaignEngine.getStatus());
});

// Retrieve Source History Vault (All delivered HRs grouped by original PDF document)
app.get('/api/campaign/vault', (req, res) => {
  try {
    const vaultDocs = getVaultHistory();
    let sentLog = [];
    if (fs.existsSync(SENT_LOG_FILE)) {
      sentLog = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    }

    const sentOnly = sentLog.filter(s => s.status === 'sent');
    const docMap = new Map();

    // Initialize map from known vault documents
    for (const doc of vaultDocs) {
      docMap.set(doc.sourceDoc, {
        id: doc.id,
        label: doc.label,
        filename: doc.filename,
        sourceDoc: doc.sourceDoc,
        uploadedAt: doc.uploadedAt,
        totalSent: 0,
        companies: new Set(),
        contacts: []
      });
    }

    // Default group for initial campaign
    const defaultSourceDoc = 'PDF 1: Initial HR Database';
    if (!docMap.has(defaultSourceDoc)) {
      docMap.set(defaultSourceDoc, {
        id: 'pdf-1',
        label: 'PDF 1',
        filename: 'Initial HR Database',
        sourceDoc: defaultSourceDoc,
        uploadedAt: '2026-09-05T10:00:00.000Z',
        totalSent: 0,
        companies: new Set(),
        contacts: []
      });
    }

    // Group sent contacts by sourceDoc
    for (const item of sentOnly) {
      const src = item.sourceDoc || defaultSourceDoc;
      if (!docMap.has(src)) {
        docMap.set(src, {
          id: `pdf-custom-${docMap.size + 1}`,
          label: src.split(':')[0] || 'PDF',
          filename: src.split(':')[1] ? src.split(':')[1].trim() : src,
          sourceDoc: src,
          uploadedAt: item.timestamp || new Date().toISOString(),
          totalSent: 0,
          companies: new Set(),
          contacts: []
        });
      }

      const group = docMap.get(src);
      group.totalSent++;
      if (item.company) group.companies.add(item.company);
      group.contacts.push({
        email: item.email,
        name: item.name || '',
        company: item.company || '',
        status: item.status,
        timestamp: item.timestamp,
        messageId: item.messageId
      });
    }

    const vaultGroups = Array.from(docMap.values()).map(g => ({
      id: g.id,
      label: g.label,
      filename: g.filename,
      sourceDoc: g.sourceDoc,
      uploadedAt: g.uploadedAt,
      totalSent: g.totalSent,
      uniqueCompaniesCount: g.companies.size,
      contacts: g.contacts
    }));

    res.json({
      success: true,
      totalDelivered: sentOnly.length,
      totalDocuments: vaultGroups.length,
      vault: vaultGroups
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve vault: ' + err.message });
  }
});

// Modular Post-Campaign Cleanup Endpoint
app.post('/api/campaign/cleanup', (req, res) => {
  try {
    const { clearContacts, clearResume, resetCampaignState } = req.body;
    const actionsDone = [];

    // 1. Modular option: Clear active HR contacts queue
    if (clearContacts) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf8');
      actionsDone.push('Active HR contacts queue cleared');
    }

    // 2. Modular option: Clear uploaded resume
    if (clearResume) {
      const activeResumePath = path.join(DATA_DIR, 'active_resume.pdf');
      if (fs.existsSync(activeResumePath)) {
        fs.unlinkSync(activeResumePath);
        actionsDone.push('Uploaded active resume removed');
      }
      if (campaignEngine.activePayload) {
        campaignEngine.activePayload.resume = null;
      }
    }

    // 3. Reset Campaign State to idle
    if (resetCampaignState || clearContacts) {
      campaignEngine.reset();
      actionsDone.push('Campaign state reset to idle');
    }

    res.json({
      success: true,
      message: actionsDone.join(', ') || 'No actions performed.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Cleanup failed: ' + err.message });
  }
});

// Legacy POST /api/send (with DNS MX pre-check)
app.post('/api/send', upload.single('resume'), async (req, res) => {
  try {
    let resumeFileBuffer = req.file ? req.file.buffer : null;
    let resumeFileName = req.file ? req.file.originalname : 'Ketan_Resume.pdf';

    if (!resumeFileBuffer) {
      const defaultPdfPath = getDefaultResumePath();
      if (defaultPdfPath && fs.existsSync(defaultPdfPath)) {
        resumeFileBuffer = fs.readFileSync(defaultPdfPath);
        resumeFileName = 'Ketan_Resume.pdf';
      } else {
        return res.status(400).json({ error: 'Resume PDF is required.' });
      }
    }

    const senderName = (req.body.senderName || req.body.name || '').trim();
    const subjectTemplate = (req.body.subject || '').trim();
    const messageTemplate = (req.body.message || '').trim();
    const rawRecipients = req.body.recipients || req.body.emails || req.body.to;
    const delayMs = parseInt(req.body.delayMs, 10) || 1500;

    let recipients = [];
    if (rawRecipients) {
      if (Array.isArray(rawRecipients)) {
        recipients = rawRecipients;
      } else if (typeof rawRecipients === 'string') {
        try {
          const parsed = JSON.parse(rawRecipients);
          recipients = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          recipients = rawRecipients.split(/[\r\n,;]+/).map(e => ({ email: e.trim() }));
        }
      } else if (typeof rawRecipients === 'object') {
        recipients = [rawRecipients];
      }
    }

    const validRecipients = (recipients || [])
      .map(r => typeof r === 'string' ? { email: r } : r)
      .filter(r => r && r.email && EMAIL_REGEX.test(r.email.trim()));

    if (validRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipient email addresses found.' });
    }

    const isDryRun = req.body.dryRun === 'true' || req.body.dryRun === true;
    const transporter = isDryRun ? null : createTransporter();
    const results = [];
    let sentCount = 0;
    let failedCount = 0;
    let suppressedCount = 0;
    let deferredCount = 0;

    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      const rawEmail = recipient.email;
      const displayName = recipient.name || 'Hiring Manager';
      const displayCompany = recipient.company || 'your team';

      // 1. Full Recipient Validation Pipeline (Syntax, Suppression, DNS MX, A/AAAA fallback, Provider)
      const valRes = await validateRecipient(rawEmail);
      if (!valRes.canSend) {
        if (valRes.isSuppressed) {
          suppressedCount++;
          results.push({
            email: rawEmail,
            name: displayName,
            company: displayCompany,
            status: 'skipped_suppressed',
            error: valRes.reason,
            timestamp: new Date().toISOString()
          });
        } else if (valRes.isInconclusive) {
          deferredCount++;
          results.push({
            email: rawEmail,
            name: displayName,
            company: displayCompany,
            status: 'deferred_inconclusive',
            error: valRes.reason,
            timestamp: new Date().toISOString()
          });
        } else {
          failedCount++;
          results.push({
            email: rawEmail,
            name: displayName,
            company: displayCompany,
            status: 'failed',
            error: valRes.reason,
            timestamp: new Date().toISOString()
          });
        }
        continue;
      }

      const email = valRes.normalizedEmail;

      // 2. Dry-Run Check
      if (isDryRun) {
        sentCount++;
        results.push({
          email,
          name: displayName,
          company: displayCompany,
          status: 'dry_run_sent',
          messageId: `DRY-RUN-${Date.now()}-${i}`,
          reason: 'Validation passed. Simulated send in dry-run mode (Zero real emails dispatched).',
          timestamp: new Date().toISOString()
        });
        continue;
      }

      // 3. Real Send Dispatch
      const personalizedSubject = subjectTemplate
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany);

      const currentSenderUser = process.env.GMAIL_USER || getDefaultSenderAccount();
      let personalizedMessage = messageTemplate
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany);

      const allKnownSenders = getSenderAccounts().map(a => a.user).filter(Boolean);
      allKnownSenders.forEach(u => {
        personalizedMessage = personalizedMessage.split(u).join(currentSenderUser);
      });
      personalizedMessage = personalizedMessage
        .replace(/{{\s*(sender_email|email|my_email)\s*}}/gi, currentSenderUser)
        .replace(
          /(Ketan Tiwari\s*\n\s*)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
          `$1${currentSenderUser}`
        );

      const mailOptions = {
        from: senderName ? `"${senderName}" <${process.env.GMAIL_USER}>` : process.env.GMAIL_USER,
        to: email,
        subject: personalizedSubject,
        text: personalizedMessage,
        html: personalizedMessage.replace(/\n/g, '<br/>'),
        attachments: [
          {
            filename: resumeFileName || 'Resume.pdf',
            content: resumeFileBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        sentCount++;
        results.push({
          email,
          name: displayName,
          company: displayCompany,
          status: 'sent',
          messageId: info.messageId,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        failedCount++;
        const parseResult = suppressionService.parseSmtpError(err);
        if (parseResult.isHardBounce) {
          suppressionService.addSuppressed(email, {
            reason: parseResult.reason,
            bounceType: 'hard',
            source: 'smtp_send_api'
          });
          results.push({
            email,
            name: displayName,
            company: displayCompany,
            status: 'failed_hard_bounce',
            error: parseResult.reason,
            timestamp: new Date().toISOString()
          });
        } else if (parseResult.isSoftBounce) {
          suppressionService.handleTemporaryFailure(email, parseResult.reason);
          results.push({
            email,
            name: displayName,
            company: displayCompany,
            status: 'failed_temporary',
            error: parseResult.reason,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            email,
            name: displayName,
            company: displayCompany,
            status: 'failed',
            error: err.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (i < validRecipients.length - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }

    res.json({
      success: true,
      dryRun: isDryRun,
      summary: { total: validRecipients.length, sent: sentCount, failed: failedCount, suppressed: suppressedCount, deferred: deferredCount },
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multer error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Fallback to frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
  const accounts = getSenderAccounts();
  const activeCount = accounts.filter(a => a.active).length;
  console.log(`===========================================`);
  console.log(`🚀 Resume Blaster with Quad Autopilot on PORT ${PORT}`);
  console.log(`📧 Senders Configured (${activeCount}/${accounts.length} Active):`);
  accounts.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.user} [${a.active ? 'ACTIVE' : 'PENDING APP PASSWORD'}]`);
  });
  console.log(`🛡️ Cross-Account Zero-Overlap Deduplication: ENABLED`);
  console.log(`🌍 Target Reach: WORLDWIDE (US, EU, UK, Canada, APAC, India, Remote)`);
  console.log(`⏱️ Autopilot Engine: 60 Emails/Batch + 6-Min Pause`);
  console.log(`🎯 Daily Goal: ${Math.max(100, activeCount * 100)} Emails (100/account safe cap, up to 400)`);
  console.log(`🌐 Web UI: http://localhost:${PORT}`);
  console.log(`===========================================`);
});

// -------------------------------------------------------------
// 5-MINUTE AUTOMATED INBOX & BOUNCE SYNC DAEMON
// -------------------------------------------------------------
let isAutoSyncRunning = false;

async function runPeriodicInboxSync(reason = '5-min cycle') {
  if (isAutoSyncRunning) return;
  isAutoSyncRunning = true;
  try {
    const activeAccs = getSenderAccounts().filter(a => a.active);
    if (activeAccs.length === 0) return;

    const timeStr = new Date().toLocaleTimeString();
    console.log(`[AUTO-SYNC] [${timeStr}] Starting background multi-inbox scan for all ${activeAccs.length} senders (${reason})...`);
    campaignEngine.addLiveLog('SYNC', `📥 Auto-syncing all ${activeAccs.length} Gmail inboxes (${activeAccs.map(a => a.label).join(', ')})...`, 'info');

    const result = await syncInboxResponses({ maxMessages: 120 });
    if (result && result.stats) {
      const gCount = result.stats.genuineCount || 0;
      const aCount = result.stats.automatedCount || 0;
      const bCount = result.bouncesFiltered || 0;

      console.log(`[AUTO-SYNC] [${timeStr}] Completed: ${gCount} genuine HR replies, ${aCount} automated acks, ${bCount} delivery failures updated.`);
      campaignEngine.addLiveLog('SYNC', `✅ Auto-sync completed: ${gCount} genuine recruiter replies, ${aCount} automated acks, ${bCount} delivery failures updated.`, 'success');

      if (gCount > 0) {
        campaignEngine.addLiveLog('REPLY', `🎯 ${gCount} genuine HR response(s) available in your Inbox Radar!`, 'success');
      }

      // 🧹 AUTONOMOUS MULTI-INBOX PURGE: Automatically sweep & clean delivery failures across all inboxes every 5 mins (Zero permission needed)
      try {
        const autoCleanRes = await bouncePurgeService.autoPurgeAllAccounts({ purgeSent: true, sweepHistorical: true });
        lastAutoPurgeAt = new Date().toISOString();
        nextAutoPurgeAt = Date.now() + AUTO_SYNC_INTERVAL_MS;
        lastAutoPurgeSummary = autoCleanRes;
        if (autoCleanRes && autoCleanRes.totalPurged > 0) {
          console.log(`[AUTO-SYNC] Automatically purged ${autoCleanRes.totalInboxPurged || 0} inbox bounces and ${autoCleanRes.totalSentPurged || 0} sent emails across inboxes into Trash.`);
          campaignEngine.addLiveLog('PURGE', `🧹 [5-MIN AUTONOMOUS SWEEP] Cleaned ${autoCleanRes.totalInboxPurged || 0} inbox bounces and ${autoCleanRes.totalSentPurged || 0} sent emails across all ${activeAccs.length} inboxes to Trash! Zero trace in Gmail.`, 'success');
        }
      } catch (cleanErr) {
        console.warn('[AUTO-SYNC] Auto-clean notice:', cleanErr.message);
      }
    }
  } catch (err) {
    console.warn(`[AUTO-SYNC] Warning: ${err.message}`);
  } finally {
    isAutoSyncRunning = false;
  }
}

// Initial auto-sync 10 seconds after boot
setTimeout(() => {
  runPeriodicInboxSync('initial boot');
}, 10 * 1000);

// Auto-sync every 5 minutes continuously
setInterval(() => {
  nextAutoPurgeAt = Date.now() + AUTO_SYNC_INTERVAL_MS;
  runPeriodicInboxSync('5-min recurring cycle');
}, AUTO_SYNC_INTERVAL_MS);


