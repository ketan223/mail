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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONTACTS_FILE = path.join(DATA_DIR, 'hr_contacts.json');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent_log.json');
const CAMPAIGN_STATE_FILE = path.join(DATA_DIR, 'campaign_state.json');

// Initialize files if they don't exist
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf8');
}
if (!fs.existsSync(SENT_LOG_FILE)) {
  fs.writeFileSync(SENT_LOG_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve frontend statically
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean Gmail App Password
const getAppPassword = () => (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

// Create Nodemailer transporter
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = getAppPassword();

  if (!user || !pass) {
    throw new Error('Gmail credentials are not configured in backend/.env');
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
  const p1 = path.join(__dirname, '../Ketan_Resume.pdf');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(__dirname, 'Ketan_Resume.pdf');
  if (fs.existsSync(p2)) return p2;
  return null;
};

// Cache for DNS MX lookups to avoid repeated DNS queries
const mxCache = new Map();

async function checkDomainMx(email) {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    if (mxCache.has(domain.toLowerCase())) {
      return mxCache.get(domain.toLowerCase());
    }

    const records = await dns.resolveMx(domain);
    const hasMx = Array.isArray(records) && records.length > 0;
    mxCache.set(domain.toLowerCase(), hasMx);
    return hasMx;
  } catch (err) {
    const domain = email.split('@')[1] || '';
    mxCache.set(domain.toLowerCase(), false);
    return false;
  }
}

// Cache for mailbox verification results
const mailboxCache = new Map();

async function verifyMailboxExists(email) {
  try {
    const trimmedEmail = (email || '').toLowerCase().trim();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return { valid: false, reason: 'Invalid email syntax' };
    }

    if (mailboxCache.has(trimmedEmail)) {
      return mailboxCache.get(trimmedEmail);
    }

    const domain = trimmedEmail.split('@')[1];
    if (!domain) return { valid: false, reason: 'No domain found' };

    let records = [];
    try {
      records = await dns.resolveMx(domain);
    } catch (e) {
      const res = { valid: false, reason: 'Domain has no active MX records' };
      mailboxCache.set(trimmedEmail, res);
      return res;
    }

    if (!Array.isArray(records) || records.length === 0) {
      const res = { valid: false, reason: 'Domain has no active MX records' };
      mailboxCache.set(trimmedEmail, res);
      return res;
    }

    records.sort((a, b) => a.preference - b.preference);
    const host = records[0].exchange;

    const probeResult = await new Promise((resolve) => {
      let step = 0;
      let closed = false;
      let socket = null;

      const finish = (res) => {
        if (closed) return;
        closed = true;
        if (hardTimer) clearTimeout(hardTimer);
        if (socket) {
          try { socket.write('QUIT\r\n'); } catch (e) {}
          try { socket.destroy(); } catch (e) {}
        }
        resolve(res);
      };

      // Balanced Pre-Check Mode:
      // 1. If server explicitly returns 550 5.1.1 / user unknown -> SKIP (100% dead mailbox)
      // 2. If domain has no MX records -> SKIP (100% dead company)
      // 3. If server confirms 250 -> SEND (100% active mailbox)
      // 4. If firewall/timeout on port 25 -> ALLOW SEND so real Google/Microsoft HRs aren't skipped!
      const hardTimer = setTimeout(() => {
        finish({ valid: true, reason: 'Probe timeout (fallback to send)' });
      }, 3500);

      try {
        socket = net.createConnection(25, host);
        socket.setEncoding('utf8');
        socket.setTimeout(3000);

        socket.on('data', (chunk) => {
          const line = chunk.trim();
          if (step === 0 && line.startsWith('220')) {
            step = 1;
            socket.write('HELO mail.check\r\n');
          } else if (step === 1 && line.startsWith('250')) {
            step = 2;
            socket.write('MAIL FROM:<tiwariketan045@gmail.com>\r\n');
          } else if (step === 2 && line.startsWith('250')) {
            step = 3;
            socket.write(`RCPT TO:<${trimmedEmail}>\r\n`);
          } else if (step === 3) {
            if (/^55[0-4]/.test(line) || line.includes('5.1.1') || line.toLowerCase().includes('does not exist')) {
              finish({ valid: false, reason: 'HR Mailbox does not exist / Deactivated (550 5.1.1)' });
            } else if (line.startsWith('250') || line.startsWith('251')) {
              finish({ valid: true, reason: 'Mailbox verified active (250 OK)' });
            } else {
              finish({ valid: true, reason: 'Ambiguous response / Catch-all (Allowed)' });
            }
          }
        });

        socket.on('error', (err) => {
          finish({ valid: true, reason: `Probe unconnectable: ${err.message} (Allowed)` });
        });

        socket.on('timeout', () => {
          finish({ valid: true, reason: 'Probe timeout (Allowed)' });
        });
      } catch (err) {
        finish({ valid: true, reason: `Socket error: ${err.message} (Allowed)` });
      }
    });

    mailboxCache.set(trimmedEmail, probeResult);
    return probeResult;
  } catch (err) {
    return { valid: true, reason: 'Verification bypassed: ' + err.message };
  }
}

// Random delay generator: 2 to 5 seconds
const getRandomDelay = (minMs = 2000, maxMs = 5000) => {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
};

// -------------------------------------------------------------
// CAMPAIGN ENGINE (Stateful 13-Email Batches + 30-Min Automated Pause)
// -------------------------------------------------------------
class CampaignEngine {
  constructor() {
    this.status = 'idle'; // 'idle', 'running_batch', 'waiting_pause', 'paused', 'completed'
    this.batchSize = 15;
    this.pauseDurationMs = 30 * 60 * 1000; // 30 minutes
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
  }

  // Get set of already processed emails (sent or confirmed dead/skipped) to prevent duplicate work
  getSentEmailsSet() {
    try {
      if (fs.existsSync(SENT_LOG_FILE)) {
        const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        return new Set(
          history
            .filter(item => item.status === 'sent' || item.status === 'skipped_invalid_domain')
            .map(item => (item.email || '').toLowerCase().trim())
        );
      }
    } catch (e) {}
    return new Set();
  }

  // Append a log entry to disk (deduplicating by email)
  logResult(entry) {
    entry.timestamp = new Date().toISOString();
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
        history[existingIdx] = entry;
      } else {
        history.push(entry);
      }
      fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to update sent_log.json:', e);
    }
  }

  // Start Campaign
  start(payload, recipientsList, batchSize = 15, pauseMinutes = 30) {
    if (this.status === 'running_batch' || this.status === 'waiting_pause') {
      throw new Error('A campaign is already actively running. Pause or stop it first.');
    }

    if (!payload.resume || !payload.resume.buffer) {
      throw new Error('Resume PDF attachment is required.');
    }

    const alreadySent = this.getSentEmailsSet();
    
    // Filter out already sent contacts
    const unsentList = recipientsList.filter(r => {
      const email = (r.email || '').toLowerCase().trim();
      return EMAIL_REGEX.test(email) && !alreadySent.has(email);
    });

    if (unsentList.length === 0) {
      throw new Error('All selected contacts have already been sent emails! No unsent recipients.');
    }

    this.activePayload = payload;
    this.queue = unsentList;
    this.batchSize = parseInt(batchSize, 10) || 15;
    this.pauseDurationMs = (parseInt(pauseMinutes, 10) || 30) * 60 * 1000;
    this.currentBatchNumber = 0;
    this.totalBatches = Math.ceil(this.queue.length / this.batchSize);
    this.isCancelled = false;
    this.stats = {
      totalQueued: this.queue.length,
      sent: 0,
      failed: 0,
      skippedMx: 0
    };
    this.nextBatchRunTime = null;
    if (this.timerId) clearTimeout(this.timerId);

    console.log(`[CAMPAIGN START] Total unsent: ${this.queue.length}, Batch size: ${this.batchSize}, Total batches: ${this.totalBatches}`);
    
    // Trigger first batch
    this.runNextBatch();
  }

  // Run next batch of 13 valid emails
  async runNextBatch() {
    if (this.isCancelled || this.queue.length === 0) {
      this.status = 'completed';
      this.nextBatchRunTime = null;
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
      this.status = 'paused';
      return;
    }

    let sentInThisBatch = 0;
    console.log(`[CAMPAIGN BATCH ${this.currentBatchNumber}/${this.totalBatches}] Targeting ${this.batchSize} valid sends (Remaining in queue: ${this.queue.length})...`);

    while (this.queue.length > 0 && sentInThisBatch < this.batchSize) {
      if (this.isCancelled) {
        console.log('[CAMPAIGN STOPPED] Cancellation requested during batch.');
        this.status = 'stopped';
        return;
      }

      const r = this.queue.shift(); // Pull next contact from queue
      const email = (r.email || '').toLowerCase().trim();
      const displayName = r.name || 'Hiring Manager';
      const displayCompany = r.company || 'your team';

      // 1. Deep Pre-flight Validation: DNS MX + Mailbox Verification (RCPT TO)
      const mailboxCheck = await verifyMailboxExists(email);
      if (!mailboxCheck.valid) {
        console.log(`[PRE-CHECK SKIPPED] ${email} (${displayCompany}) - ${mailboxCheck.reason}. Automatically pulling next contact...`);
        this.stats.skippedMx++;
        this.logResult({
          email: email,
          name: displayName,
          company: displayCompany,
          status: 'skipped_invalid_domain',
          error: mailboxCheck.reason || 'Mailbox deactivated or domain has no MX mail server.'
        });
        this.saveState();
        // Continue loop to pull next contact without counting toward sentInThisBatch
        continue;
      }

      // 2. Personalize subject and message
      const personalizedSubject = this.activePayload.subject
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany)
        .replace(/{{\s*title\s*}}/gi, r.title || 'Role');

      const personalizedMessage = this.activePayload.message
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany)
        .replace(/{{\s*title\s*}}/gi, r.title || 'the open role');

      const mailOptions = {
        from: this.activePayload.senderName 
          ? `"${this.activePayload.senderName}" <${process.env.GMAIL_USER}>`
          : process.env.GMAIL_USER,
        to: email,
        subject: personalizedSubject,
        text: personalizedMessage,
        html: personalizedMessage.replace(/\n/g, '<br/>'),
        attachments: [
          {
            filename: this.activePayload.resume.filename || 'Resume.pdf',
            content: this.activePayload.resume.buffer,
            contentType: 'application/pdf'
          }
        ]
      };

      // 3. Send email individually
      try {
        const info = await transporter.sendMail(mailOptions);
        this.stats.sent++;
        sentInThisBatch++;
        this.sentInCurrentBatch = sentInThisBatch;
        this.logResult({
          email: email,
          name: displayName,
          company: displayCompany,
          status: 'sent',
          messageId: info.messageId
        });
        console.log(`[SENT ${sentInThisBatch}/${this.batchSize} in Batch ${this.currentBatchNumber}] ${email} (${displayCompany})`);
      } catch (err) {
        this.stats.failed++;
        this.logResult({
          email: email,
          name: displayName,
          company: displayCompany,
          status: 'failed',
          error: err.message
        });
        console.error(`[FAIL] ${email}: ${err.message}`);
      }

      // 4. Random delay between 2-5 seconds if we haven't finished the batch yet
      if (sentInThisBatch < this.batchSize && this.queue.length > 0 && !this.isCancelled) {
        const delay = getRandomDelay(2000, 5000);
        console.log(`Waiting ${delay}ms before next email in batch...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }

    // After attempting/completing 13 valid sends:
    if (this.queue.length > 0 && !this.isCancelled) {
      this.status = 'waiting_pause';
      this.nextBatchRunTime = Date.now() + this.pauseDurationMs;
      const pauseMinutes = Math.round(this.pauseDurationMs / 60000);
      console.log(`[BATCH ${this.currentBatchNumber} COMPLETED] Successfully sent ${sentInThisBatch} emails. Next batch in ${pauseMinutes} minutes at ${new Date(this.nextBatchRunTime).toLocaleTimeString()}`);
      this.saveState();

      this.timerId = setTimeout(() => {
        this.runNextBatch();
      }, this.pauseDurationMs);
    } else {
      this.status = 'completed';
      this.nextBatchRunTime = null;
      this.saveState();
      console.log('[CAMPAIGN FINISHED] All batches completed successfully!');
    }
  }

  // Pause
  pause() {
    if (this.status === 'waiting_pause') {
      if (this.timerId) clearTimeout(this.timerId);
      this.status = 'paused';
      this.nextBatchRunTime = null;
      this.saveState();
      return true;
    } else if (this.status === 'running_batch') {
      this.status = 'paused';
      this.saveState();
      return true;
    }
    return false;
  }

  // Resume
  resume(sendImmediately = false) {
    if (this.status !== 'paused' && this.status !== 'waiting_pause') {
      throw new Error('Campaign is not paused.');
    }
    if (this.timerId) clearTimeout(this.timerId);

    if (sendImmediately || this.status === 'paused') {
      this.saveState();
      this.runNextBatch();
    } else {
      // Continue wait
      this.status = 'waiting_pause';
      this.nextBatchRunTime = Date.now() + this.pauseDurationMs;
      this.saveState();
      this.timerId = setTimeout(() => this.runNextBatch(), this.pauseDurationMs);
    }
  }

  // Stop
  stop() {
    this.isCancelled = true;
    if (this.timerId) clearTimeout(this.timerId);
    this.status = 'stopped';
    this.queue = [];
    this.nextBatchRunTime = null;
    this.saveState();
    console.log('[CAMPAIGN STOPPED] Manually halted by user.');
  }

  saveState() {
    try {
      const stateData = {
        status: this.status,
        batchSize: this.batchSize,
        pauseDurationMs: this.pauseDurationMs,
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
        if (saved.status === 'waiting_pause' || saved.status === 'running_batch') {
          const allContacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8') || '[]');
          const alreadySent = this.getSentEmailsSet();
          const unsent = allContacts.filter(c => c.email && EMAIL_REGEX.test(c.email) && !alreadySent.has(c.email.toLowerCase().trim()));

          const defaultResume = getDefaultResumePath();
          if (defaultResume && fs.existsSync(defaultResume)) {
            this.activePayload = {
              resume: { filename: 'Ketan_Resume.pdf', buffer: fs.readFileSync(defaultResume) },
              senderName: saved.senderName || 'Ketan Tiwari',
              subject: saved.subject || 'Application: Software & AI Engineer - Ketan Tiwari - {{company}}',
              message: saved.message || ''
            };
            this.queue = unsent;
            this.batchSize = saved.batchSize || 15;
            this.pauseDurationMs = saved.pauseDurationMs || 30 * 60 * 1000;
            this.currentBatchNumber = saved.currentBatchNumber || 2;
            this.totalBatches = Math.ceil(this.queue.length / this.batchSize) + this.currentBatchNumber;
            this.stats = saved.stats || this.stats;
            this.sentInCurrentBatch = saved.sentInCurrentBatch || 0;

            const remainingMs = (saved.nextBatchRunTime || 0) - Date.now();
            if (remainingMs > 1000) {
              this.status = 'waiting_pause';
              this.nextBatchRunTime = saved.nextBatchRunTime;
              console.log(`[STATE RESTORED] Resuming pause: ${Math.round(remainingMs / 1000)}s remaining before Batch ${this.currentBatchNumber + 1}`);
              this.timerId = setTimeout(() => this.runNextBatch(), remainingMs);
            } else {
              this.status = 'waiting_pause';
              this.nextBatchRunTime = Date.now() + 5000;
              this.timerId = setTimeout(() => this.runNextBatch(), 5000);
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

    return {
      status: this.status,
      currentBatch: this.currentBatchNumber,
      totalBatches: this.totalBatches,
      batchSize: this.batchSize,
      sentInCurrentBatch: this.sentInCurrentBatch,
      remainingInQueue: this.queue.length,
      nextBatchRunTime: this.nextBatchRunTime,
      secondsUntilNext: secondsUntilNext,
      stats: this.stats,
      recentLogs: this.recentLogs.slice(0, 30)
    };
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

// Verify Gmail SMTP
app.get('/api/verify-smtp', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    res.json({
      success: true,
      message: 'Gmail SMTP authentication successful!',
      user: process.env.GMAIL_USER
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      hint: 'Ensure 2-Step Verification is ON and you are using a 16-character App Password generated from myaccount.google.com/apppasswords'
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

// Automatic IMAP Scanner to detect and clean all bounces from Gmail Inbox directly
function autoCleanGmailBounces() {
  return new Promise((resolve, reject) => {
    const user = process.env.GMAIL_USER;
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!user || !pass) return reject(new Error('Gmail credentials not configured in backend/.env'));

    const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
    socket.setEncoding('utf8');

    let buffer = '';
    let isDone = false;
    const detectedBounces = new Set();
    let messageIds = [];
    let currentIdx = 0;
    let step = 'WAIT_GREETING';

    const hardTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { socket.destroy(); } catch (e) {}
        finishClean();
      }
    }, 15000);

    function finishClean() {
      if (isDone) return;
      isDone = true;
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

      resolve({
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

// Extract contacts from uploaded HR PDF
app.post('/api/extract-contacts', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const parsedData = await pdfParse(req.file.buffer);
    const text = parsedData.text || '';
    
    // Parse contacts from text
    const lines = text.split('\n');
    const contacts = [];
    const seenEmails = new Set();
    const inlineEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

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

      let name = beforeEmail.replace(/^\d+\s+/, '').trim();
      if (!name) {
        name = email.split('@')[0].replace(/[._]/g, ' ');
      }

      contacts.push({
        email,
        name,
        title: afterEmail,
        company: ''
      });
      seenEmails.add(email);
    }

    res.json({
      success: true,
      pages: parsedData.numpages,
      count: contacts.length,
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
      filename: 'Ketan_Resume.pdf',
      size: stat.size
    });
  }
  res.json({ exists: false });
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
    const batchSize = parseInt(req.body.batchSize, 10) || 15;
    const pauseMinutes = parseInt(req.body.pauseMinutes, 10) || 30;

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

    campaignEngine.start(payload, recipients, batchSize, pauseMinutes);

    res.json({
      success: true,
      message: `Autopilot campaign started! Batch size: ${batchSize}, Pause: ${pauseMinutes}m.`,
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

// Get campaign status (polled by frontend)
app.get('/api/campaign/status', (req, res) => {
  res.json(campaignEngine.getStatus());
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
    const rawRecipients = req.body.recipients || req.body.emails;
    const delayMs = parseInt(req.body.delayMs, 10) || 1500;

    let recipients = [];
    try {
      recipients = typeof rawRecipients === 'string' ? JSON.parse(rawRecipients) : rawRecipients;
    } catch (e) {
      recipients = rawRecipients.split(/[\r\n,;]+/).map(e => ({ email: e.trim() }));
    }

    const validRecipients = recipients
      .map(r => typeof r === 'string' ? { email: r } : r)
      .filter(r => r.email && EMAIL_REGEX.test(r.email.trim()));

    if (validRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipient email addresses found.' });
    }

    const transporter = createTransporter();
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      const email = recipient.email.trim().toLowerCase();
      const displayName = recipient.name || 'Hiring Manager';
      const displayCompany = recipient.company || 'your team';

      // DNS / MX & Mailbox pre-check
      const mailboxCheck = await verifyMailboxExists(email);
      if (!mailboxCheck.valid) {
        failedCount++;
        results.push({
          email,
          name: displayName,
          company: displayCompany,
          status: 'failed',
          error: mailboxCheck.reason || 'Mailbox deactivated or domain has no MX mail records.'
        });
        continue;
      }

      const personalizedSubject = subjectTemplate
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany);

      const personalizedMessage = messageTemplate
        .replace(/{{\s*name\s*}}/gi, displayName)
        .replace(/{{\s*company\s*}}/gi, displayCompany);

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
        results.push({
          email,
          name: displayName,
          company: displayCompany,
          status: 'failed',
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }

      if (i < validRecipients.length - 1) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }

    res.json({
      success: true,
      summary: { total: validRecipients.length, sent: sentCount, failed: failedCount },
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
  console.log(`===========================================`);
  console.log(`🚀 Resume Blaster with Autopilot listening on PORT ${PORT}`);
  console.log(`📧 Gmail User: ${process.env.GMAIL_USER || 'NOT CONFIGURED'}`);
  console.log(`🛡️ DNS / MX Record Pre-flight Validation: ENABLED`);
  console.log(`⏱️ Autopilot Engine: 13 Emails/Batch + 30-Min Pause`);
  console.log(`🌐 Web UI: http://localhost:${PORT}`);
  console.log(`===========================================`);
});
