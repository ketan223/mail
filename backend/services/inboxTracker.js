const tls = require('tls');
const fs = require('fs');
const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

const DATA_DIR = path.join(__dirname, '../data');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent_log.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'inbox_responses.json');
const suppressionService = require('./suppressionService');

// Helper to decode MIME encoded headers: =?UTF-8?B?...?= or =?UTF-8?Q?...?=
function decodeMimeHeader(headerStr) {
  if (!headerStr) return '';
  return headerStr.replace(/=\?([^?]+)\?([QB])\?([^?]+)\?=/gi, (match, charset, encoding, text) => {
    try {
      if (encoding.toUpperCase() === 'B') {
        return Buffer.from(text, 'base64').toString('utf8');
      } else if (encoding.toUpperCase() === 'Q') {
        const unescaped = text.replace(/_/g, ' ').replace(/=([A-Fa-f0-9]{2})/g, (m, h) => {
          return String.fromCharCode(parseInt(h, 16));
        });
        return Buffer.from(unescaped, 'binary').toString('utf8');
      }
    } catch (e) {
      return text;
    }
    return text;
  });
}

// Helper to decode quoted-printable text
function decodeQuotedPrintable(str) {
  if (!str) return '';
  return str
    .replace(/=\r?\n/g, '') // Soft line breaks
    .replace(/=([A-Fa-f0-9]{2})/g, (m, h) => {
      try {
        return String.fromCharCode(parseInt(h, 16));
      } catch (e) {
        return m;
      }
    });
}

// Helper to clean HTML & extract readable text snippet
function cleanHtmlSnippet(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Decode body content from IMAP text chunk (handles Multipart, Base64, Quoted-Printable, and raw text)
function extractBodySnippet(rawChunk) {
  if (!rawChunk) return '';

  let body = '';
  // 1. Look for text/plain section first
  const plainIdx = rawChunk.search(/Content-Type:\s*text\/plain/i);
  if (plainIdx >= 0) {
    const plainSection = rawChunk.substring(plainIdx);
    const headerEnd = plainSection.search(/\r?\n\r?\n/);
    if (headerEnd >= 0) {
      const content = plainSection.substring(headerEnd);
      const nextBoundary = content.search(/--[A-Za-z0-9_-]+/);
      body = nextBoundary >= 0 ? content.substring(0, nextBoundary) : content;
      if (/Content-Transfer-Encoding:\s*base64/i.test(plainSection.substring(0, headerEnd))) {
        try {
          body = Buffer.from(body.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64').toString('utf8');
        } catch (e) {}
      } else {
        body = decodeQuotedPrintable(body);
      }
    }
  }

  // 2. If no plain text found or empty, try text/html
  if (!body.trim()) {
    const htmlIdx = rawChunk.search(/Content-Type:\s*text\/html/i);
    if (htmlIdx >= 0) {
      const htmlSection = rawChunk.substring(htmlIdx);
      const headerEnd = htmlSection.search(/\r?\n\r?\n/);
      if (headerEnd >= 0) {
        const content = htmlSection.substring(headerEnd);
        const nextBoundary = content.search(/--[A-Za-z0-9_-]+/);
        let rawHtml = nextBoundary >= 0 ? content.substring(0, nextBoundary) : content;
        if (/Content-Transfer-Encoding:\s*base64/i.test(htmlSection.substring(0, headerEnd))) {
          try {
            rawHtml = Buffer.from(rawHtml.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64').toString('utf8');
          } catch (e) {}
        } else {
          rawHtml = decodeQuotedPrintable(rawHtml);
        }
        body = cleanHtmlSnippet(rawHtml);
      }
    }
  }

  // 3. Fallback to searching after BODY[TEXT]
  if (!body.trim()) {
    const bodyIdx = rawChunk.indexOf('BODY[TEXT]');
    if (bodyIdx >= 0) {
      const after = rawChunk.substring(bodyIdx);
      const headerEnd = after.search(/\r?\n\r?\n/);
      body = headerEnd >= 0 ? after.substring(headerEnd) : after.substring(15);
      body = decodeQuotedPrintable(body);
    } else {
      body = rawChunk;
    }
  }

  // Cut off any trailing IMAP envelope or header strings
  const imapHeaderCut = body.search(/BODY\[HEADER/i);
  if (imapHeaderCut >= 0) {
    body = body.substring(0, imapHeaderCut);
  }

  let cleanResult = cleanHtmlSnippet(body);
  if (cleanResult.length < 10) {
    const rawClean = cleanHtmlSnippet(decodeQuotedPrintable(rawChunk));
    if (rawClean.length > cleanResult.length) {
      cleanResult = rawClean;
    }
  }

  // If text still contains raw base64 chunks (e.g. PGRpdi or VGhhbms)
  const b64Match = cleanResult.match(/([A-Za-z0-9+/=]{40,})/);
  if (b64Match) {
    try {
      const decodedB64 = Buffer.from(b64Match[1], 'base64').toString('utf8');
      const cleanDecoded = cleanHtmlSnippet(decodedB64);
      if (cleanDecoded.length > 15) {
        cleanResult = cleanDecoded;
      }
    } catch (e) {}
  }

  return cleanResult.substring(0, 450);
}

// Helper to get all active configured Gmail accounts from environment
function getInboxAccounts() {
  const list = [];
  const u1 = process.env.GMAIL_USER_1 || process.env.GMAIL_USER || '';
  const p1 = (process.env.GMAIL_APP_PASSWORD_1 || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (u1 && p1) list.push({ user: u1, pass: p1, label: u1.split('@')[0] });

  const u2 = process.env.GMAIL_USER_2 || '';
  const p2 = (process.env.GMAIL_APP_PASSWORD_2 || '').replace(/\s+/g, '');
  if (u2 && p2) list.push({ user: u2, pass: p2, label: u2.split('@')[0] });

  const u3 = process.env.GMAIL_USER_3 || '';
  const p3 = (process.env.GMAIL_APP_PASSWORD_3 || '').replace(/\s+/g, '');
  if (u3 && p3) list.push({ user: u3, pass: p3, label: u3.split('@')[0] });

  const u4 = process.env.GMAIL_USER_4 || '';
  const p4 = (process.env.GMAIL_APP_PASSWORD_4 || '').replace(/\s+/g, '');
  if (u4 && p4) list.push({ user: u4, pass: p4, label: u4.split('@')[0] });

  return list;
}

// Fetch chunks for a single Gmail account via IMAP
function fetchSingleAccountChunks(acc, maxMessages = 150) {
  return new Promise((resolve) => {
    let socket;
    try {
      socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
      socket.setEncoding('utf8');
      socket.setTimeout(25000);
    } catch (e) {
      return resolve({ user: acc.user, label: acc.label, error: e.message, chunks: [] });
    }

    let buf = '';
    let step = 'WAIT_GREETING';
    const emailChunks = [];
    let isFinished = false;

    function safeClose() {
      if (isFinished) return;
      isFinished = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
      try { socket.write('X LOGOUT\r\n'); } catch (e) {}
      try { socket.destroy(); } catch (e) {}
      resolve({ user: acc.user, label: acc.label, chunks: emailChunks });
    }

    const timeoutTimer = setTimeout(() => {
      safeClose();
    }, 28000);

    socket.on('data', (chunk) => {
      buf += chunk;

      if (step === 'WAIT_GREETING' && buf.includes('* OK')) {
        buf = '';
        step = 'LOGIN';
        socket.write(`A1 LOGIN "${acc.user}" "${acc.pass}"\r\n`);
      } else if (step === 'LOGIN' && buf.includes('A1 ')) {
        if (!buf.includes('A1 OK')) {
          return safeClose();
        }
        buf = '';
        step = 'SELECT';
        socket.write('A2 SELECT INBOX\r\n');
      } else if (step === 'SELECT' && buf.includes('A2 ')) {
        if (!buf.includes('A2 OK')) {
          return safeClose();
        }
        buf = '';
        step = 'SEARCH';
        socket.write('A3 SEARCH SINCE "01-Sep-2026" OR (SUBJECT "Application") (OR (SUBJECT "Intern") (SUBJECT "Re:"))\r\n');
      } else if (step === 'SEARCH' && buf.includes('A3 ')) {
        const match = buf.match(/\* SEARCH ([\d\s]+)/);
        buf = '';
        if (match && match[1].trim()) {
          const allIds = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
          const recentIds = allIds.slice(-maxMessages);
          if (recentIds.length === 0) {
            return safeClose();
          }
          step = 'FETCH';
          batchFetchChunks(socket, recentIds, emailChunks, () => {
            safeClose();
          });
        } else {
          safeClose();
        }
      }
    });

    socket.on('error', () => safeClose());
    socket.on('timeout', () => safeClose());
  });
}

// Fetch in safe batches of 35
function batchFetchChunks(socket, allIds, emailChunks, onDone) {
  const BATCH_SIZE = 35;
  let batchIndex = 0;
  let currentBuf = '';

  function sendNextBatch() {
    if (batchIndex * BATCH_SIZE >= allIds.length) {
      return onDone();
    }

    const slice = allIds.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
    currentBuf = '';
    const tag = `B${batchIndex}`;

    function dataHandler(d) {
      currentBuf += d;
      if (currentBuf.includes(`${tag} OK`)) {
        socket.removeListener('data', dataHandler);
        const rawItems = currentBuf.split(/\*\s+\d+\s+FETCH\s+/i).slice(1);
        rawItems.forEach(item => emailChunks.push(item));
        batchIndex++;
        sendNextBatch();
      }
    }

    socket.on('data', dataHandler);
    socket.write(`${tag} FETCH ${slice.join(',')} (BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)] BODY.PEEK[TEXT]<0.2800>)\r\n`);
  }

  sendNextBatch();
}

// Process raw chunks for a specific account, filter bounces, and classify into Genuine vs Automated
function processAccountChunks(rawChunks, domainToCompanyMap, emailToCompanyMap, sentHistory, acc) {
  const genuineList = [];
  const automatedList = [];
  let bouncesDetected = 0;
  const newBouncedEmails = new Set();

  const myAccounts = new Set([
    (process.env.GMAIL_USER_1 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_2 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_3 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_4 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER || '').toLowerCase().trim()
  ].filter(Boolean));

  const marketingDomains = new Set([
    'linkedin.com', 'jobleads.com', 'unstop.news', 'unstop.com', 'devpost.com',
    'coursera.org', 'glassdoor.com', 'internshala.com', 'naukri.com', 'foundit.in',
    'indeed.com', 'medium.com', 'hackerrank.com', 'leetcode.com', 'github.com',
    'google.com', 'youtube.com', 'twitter.com', 'x.com'
  ]);

  for (const raw of rawChunks) {
    const fromM = raw.match(/From:\s*([^\r\n]+)/i);
    const subM = raw.match(/Subject:\s*([^\r\n]+)/i);
    const dateM = raw.match(/Date:\s*([^\r\n]+)/i);
    const msgIdM = raw.match(/Message-ID:\s*([^\r\n]+)/i);
    const inReplyM = raw.match(/In-Reply-To:\s*([^\r\n]+)/i);

    const fromRaw = fromM ? fromM[1].trim() : '';
    const subRaw = subM ? subM[1].trim() : '';
    const dateStr = dateM ? dateM[1].trim() : '';
    const messageId = msgIdM ? msgIdM[1].trim() : '';
    const inReplyTo = inReplyM ? inReplyM[1].trim() : '';

    if (!fromRaw && !subRaw) continue;

    const fromClean = decodeQuotedPrintable(decodeMimeHeader(fromRaw));
    const subjectClean = decodeQuotedPrintable(decodeMimeHeader(subRaw));

    // Extract sender email
    const emailM = fromClean.match(/<([^>]+)>/) || fromClean.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const senderEmail = emailM ? emailM[1].toLowerCase().trim() : '';
    const senderDomain = senderEmail.split('@')[1] || '';

    // Ignore emails sent by the user themselves across all 3 accounts
    if (myAccounts.has(senderEmail)) {
      continue;
    }

    // Extract sender display name
    let senderName = fromClean.replace(/<[^>]+>/g, '').replace(/["']/g, '').trim();
    if (!senderName) senderName = senderEmail;

    // Extract clean body snippet
    const bodySnippet = extractBodySnippet(raw);

    // Check if it's a delivery failure / bounce / NDR / Google alert / Microsoft Exchange NDR
    const isBounce = /mailer-daemon|postmaster|delivery\s*subsystem|mail\s*delivery\s*system|microsoftexchange|microsoft\s*outlook|failure\s*notice|no-reply@accounts\.google\.com/i.test(fromClean) ||
                     /failure|rejected|undelivered|undeliverable|returned\s*mail|not\s*found|delivery\s*has\s*failed|security\s*alert|could\s*not\s*deliver|couldn['’]?t\s*be\s*delivered/i.test(subjectClean) ||
                     /the\s*group\s*you\s*tried\s*to\s*contact|may\s*not\s*exist|permission\s*to\s*post/i.test(bodySnippet) ||
                     /remote\s*server\s*returned\s*'550|diagnostic\s*information\s*for\s*administrators|generating\s*server|could\s*not\s*deliver\s*an\s*email/i.test(bodySnippet) ||
                     /recipient\s*address\s*rejected|access\s*denied|550\s*5\.[14]\.[10]|user\s*unknown|mailbox\s*unavailable|wasn['’]?t\s*found\s*at|unknown\s*to\s*address|office\s*365|delivery\s*has\s*failed/i.test(bodySnippet) ||
                     senderName.startsWith('dkim-') || senderName.startsWith('Date:') || senderName.startsWith('Message-ID:') ||
                     fromClean.includes('dkim-signature');

    if (isBounce) {
      bouncesDetected++;
      const bounceRecipM = raw.match(/Delivery has failed to these recipients or groups:\s*[\r\n\s]*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i) ||
                           raw.match(/Your message to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s+couldn['’]?t be delivered/i) ||
                           raw.match(/(?:message to|wasn['’]t delivered to|failed to deliver to)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                           raw.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                           raw.match(/Final-Recipient:\s*rfc822;\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                           raw.match(/The affected recipients are:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                           raw.match(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>[\s\S]*?(?:550|User unknown|Access denied|not found)/i);
      if (bounceRecipM) {
        newBouncedEmails.add(bounceRecipM[1].toLowerCase().trim());
      } else {
        const splitM = raw.match(/['’]([a-zA-Z0-9._%+-]+)['’]\s+wasn['’]?t found at\s+['’]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['’]/i);
        if (splitM) {
          newBouncedEmails.add(`${splitM[1]}@${splitM[2]}`.toLowerCase().trim());
        }
      }
      continue;
    }

    // Ignore generic marketing newsletters
    if (marketingDomains.has(senderDomain) || /jobleads|linkedin|unstop|devpost/i.test(senderDomain) || /jobleads/i.test(fromClean) || senderEmail.includes('noreply@linkedin.com') || senderEmail.includes('jobalerts-noreply')) {
      continue;
    }

    // Identify Company Name
    let matchedCompany = domainToCompanyMap.get(senderDomain) || emailToCompanyMap.get(senderEmail) || '';
    if (!matchedCompany) {
      const subCompM = subjectClean.match(/-\s*Ketan(?:\s*Tiwari)?\s*-\s*([^-]+)$/i) ||
                       subjectClean.match(/at\s+([A-Za-z0-9\s.]+)(?:!|\.|$)/i) ||
                       subjectClean.match(/Application:\s*([^-]+)/i);
      if (subCompM && subCompM[1].trim()) {
        matchedCompany = subCompM[1].replace(/Application|Software|Intern|AI|Engineering/gi, '').trim();
      }
    }
    if (!matchedCompany) {
      const domainBase = senderDomain.split('.')[0];
      if (domainBase) {
        matchedCompany = domainBase.charAt(0).toUpperCase() + domainBase.slice(1);
      }
    }

    // Is it connected to our outreach or jobs?
    const isApplicationRelated = /Application|Intern|Software|Developer|Full\s*Stack|AI|Candidate|Interview|Hiring|Opportunity|Next\s*step|Assessment|Job\s*Application/i.test(subjectClean) ||
                                 /Application|Intern|Software|Developer|Full\s*Stack|AI|Candidate|Interview|Hiring|Opportunity|Assessment|CTC|Notice\s*Period/i.test(bodySnippet) ||
                                 domainToCompanyMap.has(senderDomain) ||
                                 emailToCompanyMap.has(senderEmail);

    if (!isApplicationRelated) {
      continue;
    }

    // Smart classification
    const combinedText = (subjectClean + ' ' + bodySnippet).toLowerCase();

    let category = 'genuine';
    let tag = 'Direct HR Reply';
    let tagType = 'success';
    let actionPriority = 'Medium';

    if (/out\s+of\s+office|on\s+leave|away\s+from\s+(my\s+)?desk|annual\s+leave|holiday|vacation/i.test(combinedText)) {
      category = 'automated';
      tag = 'Out of Office';
      tagType = 'info';
      actionPriority = 'None';
    } else if (/regret\s+to\s+inform|not\s+moving\s+forward|not\s+considering|pursuing\s+other\s+candidates|keep\s+your\s+(resume|profile|cv)\s+on\s+file|no\s+openings?\s+(at\s+this\s+time|matching|suitable|currently)|position\s+has\s+been\s+filled|not\s+hiring\s+for\s+this\s+role/i.test(combinedText)) {
      category = 'automated';
      tag = 'No Openings / Kept on File';
      tagType = 'warning';
      actionPriority = 'None';
    } else if (/canned\.response|atlassian\.net|zendesk|freshdesk|greenhouse|lever\.co|myworkday|bamboohr|no[-_]?reply/i.test(senderEmail) ||
               /auto[-_ ]?reply|automatic[-_ ]?reply|auto[-_ ]?response/i.test(subjectClean) ||
               /thank(s)?\s*(you)?\s*(very\s*much\s*)?for\s*(showing\s*)?(your\s*)?(interest|email|application|applying|reaching\s*out|writing\s*to)/i.test(combinedText) ||
               /this\s*is\s*an\s*auto(mated)?/i.test(combinedText) ||
               /we\s*(have\s*)?received\s*(your\s*)?(application|email|cv|resume)/i.test(combinedText) ||
               /our\s*(hr\s*)?team\s*will\s*(review|evaluate|assess|look\s*upon)/i.test(combinedText) ||
               /according\s*to\s*the\s*fitment|ticket\s*(no|number|has\s*been\s*created|id|#)|dear\s*customer|dear\s*user/i.test(combinedText) ||
               /do\s*not\s*reply\s*to\s*this/i.test(combinedText)) {
      category = 'automated';
      tag = 'Default Auto-Acknowledgment';
      tagType = 'info';
      actionPriority = 'Low';
    } else if (/assessment|round\s*[123]|technical\s*(task|test|round|interview)|coding\s*(test|challenge)|schedule\s*a\s*(call|meeting|interview)|meet\.google|zoom\.us|calendly|availability\s*for\s*(a\s*)?(call|meeting|interview)|next\s*step\s*on\s*your\s*application/i.test(combinedText)) {
      category = 'genuine';
      tag = '🎯 Interview / Assessment Invite';
      tagType = 'accent';
      actionPriority = 'HIGH - Action Needed';
    } else if (/ctc|notice\s*period|current\s*location|share\s*your\s*(updated\s*)?(cv|resume)|years\s*of\s*experience|skills\s*and\s*projects|fill\s*(in\s*)?the\s*form/i.test(combinedText)) {
      category = 'genuine';
      tag = '📋 CTC & Resume Details Requested';
      tagType = 'success';
      actionPriority = 'HIGH - Action Needed';
    } else {
      category = 'genuine';
      tag = '💬 Direct Recruiter Response';
      tagType = 'success';
      actionPriority = 'Medium';
    }

    const item = {
      id: messageId || (`${acc.label}_${Math.random().toString(36).substr(2, 9)}`),
      recipientAccount: acc.user,
      recipientLabel: acc.label,
      senderName,
      senderEmail,
      company: matchedCompany,
      subject: subjectClean,
      date: dateStr,
      dateFormatted: formatDate(dateStr),
      bodySnippet: bodySnippet || 'No preview text available.',
      category,
      tag,
      tagType,
      actionPriority,
      inReplyTo,
      gmailSearchUrl: `https://mail.google.com/mail/?authuser=${encodeURIComponent(acc.user)}#search/${encodeURIComponent(senderEmail)}`
    };

    if (category === 'genuine') {
      genuineList.push(item);
    } else {
      automatedList.push(item);
    }
  }

  return {
    genuine: genuineList,
    automated: automatedList,
    bouncesDetected,
    newBouncedEmails
  };
}

// Master Triple-Inbox IMAP Synchronizer
async function syncInboxResponses({ maxMessages = 150 } = {}) {
  const accounts = getInboxAccounts();
  if (accounts.length === 0) {
    throw new Error('No active Gmail accounts configured in .env');
  }

  // Load sent history to match company and domain
  let sentHistory = [];
  try {
    if (fs.existsSync(SENT_LOG_FILE)) {
      sentHistory = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    }
  } catch (e) {}

  const domainToCompanyMap = new Map();
  const emailToCompanyMap = new Map();
  sentHistory.forEach(s => {
    if (s.email) {
      const e = s.email.toLowerCase().trim();
      const comp = s.company || '';
      emailToCompanyMap.set(e, comp);
      const d = e.split('@')[1];
      if (d) domainToCompanyMap.set(d.toLowerCase().trim(), comp);
    }
  });

  const allGenuine = [];
  const allAutomated = [];
  let totalBouncesDetected = 0;
  let totalScanned = 0;
  const allNewBounces = new Set();
  const byAccountStats = {};

  const seenKeys = new Set();

  for (const acc of accounts) {
    try {
      const res = await fetchSingleAccountChunks(acc, maxMessages);
      totalScanned += (res.chunks || []).length;
      const parsed = processAccountChunks(res.chunks || [], domainToCompanyMap, emailToCompanyMap, sentHistory, acc);

      totalBouncesDetected += parsed.bouncesDetected;
      parsed.newBouncedEmails.forEach(b => allNewBounces.add(b));

      let accGenuine = 0;
      let accAutomated = 0;

      for (const item of parsed.genuine) {
        const key = `${item.recipientAccount}:${item.senderEmail}:${item.subject}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allGenuine.push(item);
          accGenuine++;
        }
      }

      for (const item of parsed.automated) {
        const key = `${item.recipientAccount}:${item.senderEmail}:${item.subject}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allAutomated.push(item);
          accAutomated++;
        }
      }

      byAccountStats[acc.user] = {
        user: acc.user,
        label: acc.label,
        genuineCount: accGenuine,
        automatedCount: accAutomated,
        totalCount: accGenuine + accAutomated
      };
    } catch (err) {
      console.warn(`IMAP sync error for account ${acc.user}:`, err.message);
      byAccountStats[acc.user] = {
        user: acc.user,
        label: acc.label,
        genuineCount: 0,
        automatedCount: 0,
        totalCount: 0,
        error: err.message
      };
    }
  }

  // Update sent_log.json and suppressionService if new bounces detected
  if (allNewBounces.size > 0) {
    allNewBounces.forEach(bEmail => {
      suppressionService.addSuppressed(bEmail, {
        reason: 'Permanent hard bounce (Inbound NDR / Delivery failure detected in Gmail)',
        bounceType: 'hard',
        source: 'inbound_ndr'
      });
    });

    if (fs.existsSync(SENT_LOG_FILE)) {
      try {
        let history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
        let updated = false;
        allNewBounces.forEach(bEmail => {
          const idx = history.findIndex(h => (h.email || '').toLowerCase().trim() === bEmail);
          if (idx >= 0 && history[idx].status !== 'skipped_invalid_domain') {
            history[idx].status = 'skipped_invalid_domain';
            history[idx].error = 'Bounced: Delivery failed [Auto-detected by Multi-Inbox Tracker]';
            updated = true;
          }
        });
        if (updated) {
          fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
        }
      } catch (e) {}
    }
  }

  // Sort by date descending (newest first)
  const sortByDate = (a, b) => {
    const tA = new Date(a.date).getTime() || 0;
    const tB = new Date(b.date).getTime() || 0;
    return tB - tA;
  };

  allGenuine.sort(sortByDate);
  allAutomated.sort(sortByDate);

  const resultData = {
    lastSyncedAt: new Date().toISOString(),
    totalScanned,
    bouncesFiltered: totalBouncesDetected,
    stats: {
      genuineCount: allGenuine.length,
      automatedCount: allAutomated.length,
      bouncesCount: totalBouncesDetected,
      accounts: byAccountStats
    },
    accounts: accounts.map(a => a.user),
    genuine: allGenuine,
    automated: allAutomated
  };

  // Cache to disk
  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(resultData, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write inbox_responses.json:', e.message);
  }

  return resultData;
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
}

// Get cached responses without hitting IMAP
function getCachedResponses() {
  try {
    if (fs.existsSync(RESPONSES_FILE)) {
      return JSON.parse(fs.readFileSync(RESPONSES_FILE, 'utf8') || '{}');
    }
  } catch (e) {}
  return {
    lastSyncedAt: null,
    totalScanned: 0,
    bouncesFiltered: 0,
    stats: { genuineCount: 0, automatedCount: 0, bouncesCount: 0 },
    genuine: [],
    automated: []
  };
}

module.exports = {
  syncInboxResponses,
  getCachedResponses
};
