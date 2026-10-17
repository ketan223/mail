const tls = require('tls');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PURGE_LOG_FILE = path.join(DATA_DIR, 'bounce_purge_log.json');
const SENT_LOG_FILE = path.join(DATA_DIR, 'sent_log.json');
const suppressionService = require('./suppressionService');

// Helper to decode MIME headers
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

// Decode Quoted-Printable
function decodeQuotedPrintable(str) {
  if (!str) return '';
  return str
    .replace(/=\r?\n/g, '')
    .replace(/=([A-Fa-f0-9]{2})/g, (m, h) => {
      try {
        return String.fromCharCode(parseInt(h, 16));
      } catch (e) {
        return m;
      }
    });
}

// Clean HTML snippet
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

// Extract readable body snippet from IMAP chunk
function extractBodySnippet(rawChunk) {
  if (!rawChunk) return '';
  let body = '';
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

  const imapHeaderCut = body.search(/BODY\[HEADER/i);
  if (imapHeaderCut >= 0) {
    body = body.substring(0, imapHeaderCut);
  }

  return cleanHtmlSnippet(body).substring(0, 500);
}

// Get credentials for account
function getAccountCredentials(targetEmail) {
  const accounts = [];
  const u1 = (process.env.GMAIL_USER_1 || process.env.GMAIL_USER || '').toLowerCase().trim();
  const p1 = (process.env.GMAIL_APP_PASSWORD_1 || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (u1 && p1) accounts.push({ user: u1, pass: p1, label: u1.split('@')[0] });

  const u2 = (process.env.GMAIL_USER_2 || '').toLowerCase().trim();
  const p2 = (process.env.GMAIL_APP_PASSWORD_2 || '').replace(/\s+/g, '');
  if (u2 && p2) accounts.push({ user: u2, pass: p2, label: u2.split('@')[0] });

  const u3 = (process.env.GMAIL_USER_3 || '').toLowerCase().trim();
  const p3 = (process.env.GMAIL_APP_PASSWORD_3 || '').replace(/\s+/g, '');
  if (u3 && p3) accounts.push({ user: u3, pass: p3, label: u3.split('@')[0] });

  const u4 = (process.env.GMAIL_USER_4 || '').toLowerCase().trim();
  const p4 = (process.env.GMAIL_APP_PASSWORD_4 || '').replace(/\s+/g, '');
  if (u4 && p4) accounts.push({ user: u4, pass: p4, label: u4.split('@')[0] });

  if (accounts.length === 0) return null;
  if (!targetEmail) return accounts[0];
  const normalized = targetEmail.toLowerCase().trim();
  const found = accounts.find(a => a.user === normalized || a.label === normalized);
  return found || accounts[0];
}

// Detect trash folder name ([Gmail]/Bin or [Gmail]/Trash)
function detectTrashFolder(listBuffer) {
  const lines = listBuffer.split('\r\n');
  for (const line of lines) {
    if (line.includes('\\Trash')) {
      const m = line.match(/"([^"]+)"$/);
      if (m) return m[1];
    }
  }
  return '[Gmail]/Bin';
}

// Detect sent folder name ([Gmail]/Sent Mail or [Gmail]/Sent)
function detectSentFolder(listBuffer) {
  const lines = listBuffer.split('\r\n');
  for (const line of lines) {
    if (line.includes('\\Sent')) {
      const m = line.match(/"([^"]+)"$/);
      if (m) return m[1];
    }
  }
  return '[Gmail]/Sent Mail';
}

// Build batched IMAP OR query for recipients (e.g. OR (TO "a") (TO "b"))
function buildImapOrToQuery(recipients) {
  if (!recipients || recipients.length === 0) return '';
  const clean = recipients.map(r => (r || '').toLowerCase().trim()).filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return `TO "${clean[0]}"`;
  let query = `TO "${clean[0]}"`;
  for (let i = 1; i < clean.length; i++) {
    query = `OR (${query}) (TO "${clean[i]}")`;
  }
  return query;
}

// Collect historical failed/bounced recipients from suppression_list and sent_log
function getHistoricalFailedRecipients() {
  const set = new Set();
  try {
    const suppPath = path.join(DATA_DIR, 'suppression_list.json');
    if (fs.existsSync(suppPath)) {
      const supp = JSON.parse(fs.readFileSync(suppPath, 'utf8') || '[]');
      for (const s of supp) {
        if (s.email && s.email.includes('@')) set.add(s.email.toLowerCase().trim());
      }
    }
  } catch (e) {}
  try {
    if (fs.existsSync(SENT_LOG_FILE)) {
      const sent = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
      for (const s of sent) {
        if (s.email && s.email.includes('@')) {
          const hasBounce = s.bouncedAt || (s.error && s.error.toLowerCase().includes('bounce'));
          if (hasBounce) set.add(s.email.toLowerCase().trim());
        }
      }
    }
  } catch (e) {}
  return Array.from(set);
}

// Strict classifier for bounce emails vs recruiter replies
function classifyBounceEmail(rawChunk) {
  const fromM = rawChunk.match(/From:\s*([^\r\n]+)/i);
  const subM = rawChunk.match(/Subject:\s*([^\r\n]+)/i);
  const dateM = rawChunk.match(/Date:\s*([^\r\n]+)/i);
  const uidM = rawChunk.match(/\bUID\s+(\d+)\b/i);

  const fromRaw = fromM ? fromM[1].trim() : '';
  const subRaw = subM ? subM[1].trim() : '';
  const dateStr = dateM ? dateM[1].trim() : '';
  const uid = uidM ? parseInt(uidM[1], 10) : null;

  const fromClean = decodeQuotedPrintable(decodeMimeHeader(fromRaw));
  const subjectClean = decodeQuotedPrintable(decodeMimeHeader(subRaw));
  const snippet = extractBodySnippet(rawChunk);

  const combined = (fromClean + ' ' + subjectClean + ' ' + snippet).toLowerCase();

  // HARD GATE 1: SENDER MUST EXPLICITLY BE A SYSTEM DAEMON / BOUNCE AGENT
  const isDaemonSender = /mailer-daemon|postmaster|delivery\s*subsystem|mail\s*delivery\s*system|microsoftexchange|microsoft\s*outlook|onmicrosoft\.com/i.test(fromClean) ||
                         /mailer-daemon|postmaster|microsoftexchange|microsoft\s*outlook/i.test(rawChunk.substring(0, 500));
  if (!isDaemonSender) {
    return {
      uid,
      fromClean,
      subjectClean,
      dateStr,
      snippet,
      classification: 'PROTECTED_NON_DAEMON',
      isSafeToDelete: false,
      reason: 'Sender is not a mail delivery daemon (100% PROTECTED HUMAN/RECRUITER/ATS EMAIL)'
    };
  }

  // HARD GATE 2: CRITICAL SAFETY CHECK - NEVER DELETE ANY REAL RECRUITER OR ATS RESPONSE
  const isAtsSystem = /greenhouse|lever\.co|myworkday|workday|bamboohr|smartrecruiters|ashbyhq|icims|jobvite|workable|taleo|recruitee|rippling|breezy|pinpointhq|personio|freshteam|successfactors|brassring|cornerstone|zoho|talent|hire/i.test(fromClean) ||
                      /greenhouse|lever\.co|myworkday|workday|bamboohr|smartrecruiters|ashbyhq|icims|jobvite|workable/i.test(combined);
  const isHumanReply = /^(?:re|fwd):\s*application|interview|assessment|scheduling|ctc|resume\s*received|offer|candidate|shortlist|phone\s*screen|next\s*steps/i.test(subjectClean) &&
                       !/failure|rejected|not\s*found|delivery|subsystem|daemon|postmaster|undeliverable|undelivered/i.test(subjectClean);

  if (isAtsSystem || isHumanReply) {
    return {
      uid,
      fromClean,
      subjectClean,
      dateStr,
      snippet,
      classification: 'PROTECTED_RECRUITER_RESPONSE',
      isSafeToDelete: false,
      reason: 'Recruiter or ATS response (100% PROTECTED - WILL NEVER TOUCH)'
    };
  }

  // Extract failed recipient email (Google NDR, Microsoft Exchange, Office 365, Postmaster)
  const recipMatch = rawChunk.match(/Delivery has failed to these recipients or groups:\s*[\r\n\s]*<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i) ||
                     rawChunk.match(/Your message to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\s+couldn['’]?t be delivered/i) ||
                     rawChunk.match(/(?:message to|wasn['’]t delivered to|failed to deliver to)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                     rawChunk.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                     rawChunk.match(/Final-Recipient:\s*rfc822;\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                     rawChunk.match(/The affected recipients are:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                     rawChunk.match(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>[\s\S]*?(?:550|User unknown|Address not found|couldn't be found|blocked)/i);
  
  let failedRecipient = recipMatch ? recipMatch[1].toLowerCase().trim() : '';

  if (!failedRecipient) {
    const splitMatch = rawChunk.match(/['’]([a-zA-Z0-9._%+-]+)['’]\s+wasn['’]?t found at\s+['’]([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['’]/i);
    if (splitMatch) {
      failedRecipient = `${splitMatch[1]}@${splitMatch[2]}`.toLowerCase().trim();
    }
  }

  const hasDeliveryFailureSubject = /delivery\s*status\s*notification|undelivered\s*mail|failure\s*notice|mail\s*delivery\s*failed|returned\s*mail|undeliverable|delivery\s*has\s*failed|couldn['’]?t\s*be\s*delivered|failed\s*to\s*deliver/i.test(subjectClean);
  const hasHardFailureSignal = /address\s*not\s*found|550\s*5\.1\.1|550\s*5\.4\.1|550\s*5\.4\.310|552\s*5\.7\.1|5\.1\.10|message\s*blocked|access\s*denied|domain\s*couldn['’]?t\s*be\s*found|user\s*unknown|recipient\s*address\s*rejected|mailbox\s*unavailable|the\s*email\s*account\s*that\s*you\s*tried\s*to\s*reach\s*does\s*not\s*exist|does\s*not\s*exist|dead|couldn['’]?t\s*be\s*delivered|wasn['’]?t\s*found\s*at|unknown\s*to\s*address|office\s*365|delivery\s*has\s*failed|dns\s*reported/i.test(combined);

  // 1. Confirmed "Address not found" / "Message blocked" / Mail Subsystem / Outlook NDR failure (Clear to delete)
  if (isDaemonSender && (hasDeliveryFailureSubject || hasHardFailureSignal)) {
    let failureReason = 'Address not found / Delivery failure';
    if (/domain\s*(?:does\s*not\s*exist|couldn['’]?t\s*be\s*found)|dead|dns\s*reported/i.test(combined)) {
      failureReason = 'Domain does not exist / Dead domain';
    } else if (/wasn['’]?t\s*found\s*at|unknown\s*to\s*address|5\.1\.10/i.test(combined)) {
      failureReason = 'User unknown / Not found at recipient domain (Office 365 5.1.10)';
    } else if (/delivery\s*has\s*failed/i.test(combined)) {
      failureReason = 'Delivery has failed to recipients (Microsoft Exchange NDR)';
    } else if (/550\s*5\.4\.1|message\s*blocked|access\s*denied/i.test(combined)) {
      failureReason = 'Message blocked / Recipient access denied (550 5.4.1)';
    } else if (/550\s*5\.1\.1|user\s*unknown/i.test(combined)) {
      failureReason = '550 5.1.1 User Unknown / Address does not exist';
    } else if (/mailbox\s*unavailable/i.test(combined)) {
      failureReason = 'Mailbox unavailable / disabled';
    } else if (/address\s*not\s*found/i.test(combined)) {
      failureReason = 'Address not found (Mail Delivery Subsystem)';
    }

    return {
      uid,
      fromClean,
      subjectClean,
      dateStr,
      failedRecipient,
      snippet,
      classification: 'clear_to_delete',
      isSafeToDelete: true,
      reason: failureReason,
      tag: '🔴 CLEAR TO DELETE - ADDRESS NOT FOUND / BLOCKED'
    };
  }

  // 2. Doubtful: Mention of error/failure but sender or body is not standard Mail Delivery Subsystem
  if (/failure|undelivered|rejected|delivery\s*error|bounce/i.test(combined)) {
    return {
      uid,
      fromClean,
      subjectClean,
      dateStr,
      failedRecipient,
      snippet,
      classification: 'doubt_review',
      isSafeToDelete: false,
      reason: 'Ambiguous sender or non-standard failure format (100% PROTECTED - NOT DELETED)',
      tag: '⚠️ REVIEW NEEDED (DOUBTFUL - PROTECTED)'
    };
  }

  return {
    uid,
    fromClean,
    subjectClean,
    snippet,
    classification: 'ignored',
    isSafeToDelete: false,
    reason: 'Not a recognized delivery failure report (100% PROTECTED)'
  };
}

// -------------------------------------------------------------
// 1. SCAN BOUNCES IN INBOX (PREVIEW)
// -------------------------------------------------------------
async function scanBouncesInInbox(targetAccountEmail, { previewLimit = 60 } = {}) {
  const acc = getAccountCredentials(targetAccountEmail);
  if (!acc.pass) {
    throw new Error(`No app password found for account ${acc.user}`);
  }

  return new Promise((resolve, reject) => {
    let socket;
    try {
      socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
      socket.setEncoding('utf8');
      socket.setTimeout(30000);
    } catch (e) {
      return reject(e);
    }

    let buf = '';
    let step = 'WAIT_GREETING';
    let trashFolder = '[Gmail]/Bin';
    let sentFolder = '[Gmail]/Sent Mail';
    let allBounceUids = [];
    const previewItems = [];
    const doubtfulItems = [];
    let isFinished = false;

    function safeClose(result) {
      if (isFinished) return;
      isFinished = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
      try { socket.write('X LOGOUT\r\n'); } catch (e) {}
      try { socket.destroy(); } catch (e) {}
      resolve(result);
    }

    const timeoutTimer = setTimeout(() => {
      // NEVER delete anything if timed out - zero risk
      safeClose({
        account: acc.user,
        label: acc.label,
        trashFolder,
        sentFolder,
        totalBouncesFound: allBounceUids.length,
        clearToDeleteUids: [],
        clearToDeleteCount: 0,
        failedRecipients: [],
        previewItems,
        doubtfulItems,
        timedOut: true
      });
    }, 32000);

    socket.on('data', (chunk) => {
      buf += chunk;

      if (step === 'WAIT_GREETING' && buf.includes('* OK')) {
        buf = '';
        step = 'LOGIN';
        socket.write(`A1 LOGIN "${acc.user}" "${acc.pass}"\r\n`);
      } else if (step === 'LOGIN' && buf.includes('A1 ')) {
        if (!buf.includes('A1 OK')) {
          return safeClose({ error: 'Login failed for ' + acc.user });
        }
        buf = '';
        step = 'LIST';
        socket.write(`A2 LIST "" "*"\r\n`);
      } else if (step === 'LIST' && buf.includes('A2 OK')) {
        trashFolder = detectTrashFolder(buf);
        sentFolder = detectSentFolder(buf);
        buf = '';
        step = 'SELECT';
        socket.write(`A3 SELECT INBOX\r\n`);
      } else if (step === 'SELECT' && buf.includes('A3 OK')) {
        buf = '';
        step = 'SEARCH';
        // Comprehensive bounce search: mailer-daemon, postmaster, MicrosoftExchange, Microsoft Outlook, or failure notification subjects
        socket.write(`A4 UID SEARCH OR (FROM "mailer-daemon") (OR (FROM "postmaster") (OR (FROM "MicrosoftExchange") (OR (FROM "Microsoft Outlook") (OR (SUBJECT "Delivery Status Notification") (OR (SUBJECT "Undeliverable") (OR (SUBJECT "Delivery has failed") (OR (SUBJECT "couldn't be delivered") (SUBJECT "Failure notice"))))))))\r\n`);
      } else if (step === 'SEARCH' && buf.includes('A4 OK')) {
        const match = buf.match(/\* SEARCH ([\d\s]+)/);
        buf = '';
        if (match && match[1].trim()) {
          allBounceUids = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
        }

        if (allBounceUids.length === 0) {
          return safeClose({
            account: acc.user,
            label: acc.label,
            trashFolder,
            sentFolder,
            totalBouncesFound: 0,
            clearToDeleteUids: [],
            clearToDeleteCount: 0,
            failedRecipients: [],
            previewItems: [],
            doubtfulItems: []
          });
        }

        // Fetch preview for items (up to previewLimit)
        const recentSlice = allBounceUids.slice(-previewLimit);
        step = 'FETCH_PREVIEW';
        socket.write(`A5 UID FETCH ${recentSlice.join(',')} (UID BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT]<0.800>)\r\n`);
      } else if (step === 'FETCH_PREVIEW' && buf.includes('A5 OK')) {
        const rawItems = buf.split(/\*\s+\d+\s+FETCH\s+/i).slice(1);
        buf = '';

        for (const item of rawItems) {
          const classified = classifyBounceEmail(item);
          if (classified.classification === 'clear_to_delete' && classified.isSafeToDelete === true) {
            previewItems.push(classified);
            if (classified.failedRecipient) {
              // Permanently suppress so outreach engine NEVER emails this address or company again!
              suppressionService.addSuppressed(classified.failedRecipient, {
                reason: `Hard bounce: ${classified.reason || 'Address not found'}`,
                bounceType: 'hard',
                source: 'gmail_ndr_purge'
              });
              registerFailedRecipientInSentLog(classified.failedRecipient, classified.reason);
            }
          } else if (classified.classification === 'doubt_review') {
            doubtfulItems.push(classified);
          }
        }

        // Sort preview items newest first
        previewItems.reverse();
        doubtfulItems.reverse();

        // STRICT SAFETY LOCK: clearToDeleteUids contains ONLY explicitly verified UIDs
        const verifiedClearUids = previewItems
          .filter(p => p.isSafeToDelete === true && p.classification === 'clear_to_delete' && p.uid)
          .map(p => p.uid);

        const verifiedFailedRecipients = Array.from(new Set(
          previewItems
            .filter(p => p.isSafeToDelete === true && p.failedRecipient)
            .map(p => p.failedRecipient.toLowerCase().trim())
            .filter(Boolean)
        ));

        safeClose({
          account: acc.user,
          label: acc.label,
          trashFolder,
          sentFolder,
          totalBouncesFound: allBounceUids.length,
          clearToDeleteUids: verifiedClearUids,
          clearToDeleteCount: verifiedClearUids.length,
          failedRecipients: verifiedFailedRecipients,
          doubtReviewCount: doubtfulItems.length,
          previewItems,
          doubtfulItems
        });
      }
    });

    socket.on('error', (err) => {
      safeClose({ account: acc.user, error: err.message, previewItems: [], doubtfulItems: [] });
    });
    socket.on('timeout', () => {
      safeClose({ account: acc.user, error: 'IMAP socket timeout', previewItems: [], doubtfulItems: [] });
    });
  });
}

// -------------------------------------------------------------
// 2. PURGE FAILED SENT EMAILS FROM GMAIL SENT MAIL FOLDER
// (Bidirectional purge: removes original sent emails to bounced addresses)
// -------------------------------------------------------------
async function purgeSentMailsForRecipients(targetAccountEmail, { recipientEmails = [], sweepAllHistorical = false, onProgress = null } = {}) {
  const acc = getAccountCredentials(targetAccountEmail);
  if (!acc.pass) {
    throw new Error(`No app password found for account ${acc.user}`);
  }

  let targets = Array.isArray(recipientEmails) && recipientEmails.length > 0 && !sweepAllHistorical
    ? recipientEmails
    : getHistoricalFailedRecipients();

  targets = Array.from(new Set(targets.map(e => (e || '').toLowerCase().trim()))).filter(Boolean);

  if (targets.length === 0) {
    return {
      success: true,
      account: acc.user,
      purgedSentCount: 0,
      sentFolder: '[Gmail]/Sent Mail',
      trashFolder: '[Gmail]/Bin',
      message: 'Zero target failed recipients to search in Sent Mail.'
    };
  }

  return new Promise((resolve, reject) => {
    let socket;
    try {
      socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
      socket.setEncoding('utf8');
      socket.setTimeout(90000);
    } catch (e) {
      return reject(e);
    }

    let mainBuf = '';
    let step = 'WAIT_GREETING';
    let sentFolder = '[Gmail]/Sent Mail';
    let trashFolder = '[Gmail]/Bin';
    const matchedUids = new Set();
    const CHUNK_SIZE = 15;
    let chunkIndex = 0;
    const totalChunks = Math.ceil(targets.length / CHUNK_SIZE);
    let isFinished = false;

    function safeClose(res) {
      if (isFinished) return;
      isFinished = true;
      try { socket.write('X LOGOUT\r\n'); } catch (e) {}
      try { socket.destroy(); } catch (e) {}

      if (res && res.purgedSentCount > 0) {
        recordPurgeHistory({
          timestamp: new Date().toISOString(),
          account: acc.user,
          action: 'purge_sent_mail',
          purgedCount: 0,
          purgedSentCount: res.purgedSentCount,
          totalPurged: res.purgedSentCount,
          trashFolder,
          sentFolder,
          recipientsChecked: targets.length
        });
      }
      resolve(res);
    }

    function mainDataHandler(d) {
      mainBuf += d;
      if (step === 'WAIT_GREETING' && mainBuf.includes('* OK')) {
        mainBuf = ''; step = 'LOGIN';
        socket.write(`A1 LOGIN "${acc.user}" "${acc.pass}"\r\n`);
      } else if (step === 'LOGIN' && mainBuf.includes('A1 ')) {
        if (!mainBuf.includes('A1 OK')) return safeClose({ error: 'Login failed: ' + mainBuf, purgedSentCount: 0 });
        mainBuf = ''; step = 'LIST';
        socket.write(`A2 LIST "" "*"\r\n`);
      } else if (step === 'LIST' && mainBuf.includes('A2 OK')) {
        sentFolder = detectSentFolder(mainBuf);
        trashFolder = detectTrashFolder(mainBuf);
        mainBuf = ''; step = 'SELECT';
        socket.write(`A3 SELECT "${sentFolder}"\r\n`);
      } else if (step === 'SELECT' && mainBuf.includes('A3 OK')) {
        socket.removeListener('data', mainDataHandler);
        searchNextChunk();
      }
    }

    socket.on('data', mainDataHandler);

    function searchNextChunk() {
      if (chunkIndex >= totalChunks) {
        moveFoundUids();
        return;
      }
      const chunk = targets.slice(chunkIndex * CHUNK_SIZE, (chunkIndex + 1) * CHUNK_SIZE);
      const query = buildImapOrToQuery(chunk);
      const tag = `S${chunkIndex}`;
      let chunkBuf = '';

      function onChunkData(d) {
        chunkBuf += d;
        if (chunkBuf.includes(`${tag} OK`)) {
          socket.removeListener('data', onChunkData);
          const m = chunkBuf.match(/\* SEARCH ([\d\s]+)/);
          if (m && m[1].trim()) {
            const found = m[1].trim().split(/\s+/).map(Number).filter(Boolean);
            found.forEach(u => matchedUids.add(u));
          }
          chunkIndex++;
          if (typeof onProgress === 'function') {
            onProgress(chunkIndex, totalChunks, matchedUids.size);
          }
          searchNextChunk();
        } else if (chunkBuf.includes(`${tag} NO`) || chunkBuf.includes(`${tag} BAD`)) {
          socket.removeListener('data', onChunkData);
          chunkIndex++;
          searchNextChunk();
        }
      }

      socket.on('data', onChunkData);
      socket.write(`${tag} UID SEARCH ${query}\r\n`);
    }

    function moveFoundUids() {
      const uids = Array.from(matchedUids);
      if (uids.length === 0) {
        return safeClose({
          success: true,
          account: acc.user,
          sentFolder,
          trashFolder,
          purgedSentCount: 0,
          message: 'Zero matching sent emails found in Sent Mail. Already clean!'
        });
      }

      const MOVE_BATCH = 100;
      let moveIdx = 0;

      function executeMoveSlice() {
        const start = moveIdx * MOVE_BATCH;
        if (start >= uids.length) {
          return safeClose({
            success: true,
            account: acc.user,
            sentFolder,
            trashFolder,
            purgedSentCount: uids.length,
            message: `Successfully moved ${uids.length} failed sent email(s) from Sent Mail to Trash!`
          });
        }

        const slice = uids.slice(start, start + MOVE_BATCH);
        const tag = `M${moveIdx}`;
        let moveBuf = '';

        function onMoveData(d) {
          moveBuf += d;
          if (moveBuf.includes(`${tag} OK`)) {
            socket.removeListener('data', onMoveData);
            moveIdx++;
            executeMoveSlice();
          } else if (moveBuf.includes(`${tag} NO`) || moveBuf.includes(`${tag} BAD`)) {
            socket.removeListener('data', onMoveData);
            moveIdx++;
            executeMoveSlice();
          }
        }

        socket.on('data', onMoveData);
        socket.write(`${tag} UID MOVE ${slice.join(',')} "${trashFolder}"\r\n`);
      }

      executeMoveSlice();
    }

    socket.on('error', e => safeClose({ error: e.message, purgedSentCount: 0 }));
    socket.on('timeout', () => safeClose({ error: 'Timeout while sweeping Sent Mail', purgedSentCount: 0 }));
  });
}

// -------------------------------------------------------------
// 3. PURGE BOUNCES (BIDIRECTIONAL: INBOX NOTICES + SENT MAIL)
// -------------------------------------------------------------
async function purgeBouncesFromInbox(targetAccountEmail, { uids = [], deleteAllConfirmed = false, purgeSentMail = true, failedRecipients = [], onProgress = null } = {}) {
  const acc = getAccountCredentials(targetAccountEmail);
  if (!acc.pass) {
    throw new Error(`No app password found for account ${acc.user}`);
  }

  let targetUids = uids;
  let trashFolder = '[Gmail]/Bin';
  let sentFolder = '[Gmail]/Sent Mail';
  let recipientsToClean = Array.isArray(failedRecipients) ? [...failedRecipients] : [];

  if (targetUids.length === 0 || deleteAllConfirmed) {
    const scanRes = await scanBouncesInInbox(acc.user, { previewLimit: 200 });
    targetUids = scanRes.clearToDeleteUids || [];
    trashFolder = scanRes.trashFolder || '[Gmail]/Bin';
    sentFolder = scanRes.sentFolder || '[Gmail]/Sent Mail';
    if (recipientsToClean.length === 0 && Array.isArray(scanRes.failedRecipients)) {
      recipientsToClean = scanRes.failedRecipients;
    }
  }

  let purgedInboxCount = 0;

  if (targetUids.length > 0) {
    const inboxMoveRes = await new Promise((resolve, reject) => {
      let socket;
      try {
        socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
        socket.setEncoding('utf8');
        socket.setTimeout(60000);
      } catch (e) {
        return reject(e);
      }

      let buf = '';
      let step = 'WAIT_GREETING';
      const BATCH_SIZE = 100;
      let batchIndex = 0;
      let count = 0;
      let isFinished = false;

      function safeClose(result) {
        if (isFinished) return;
        isFinished = true;
        try { socket.write('X LOGOUT\r\n'); } catch (e) {}
        try { socket.destroy(); } catch (e) {}
        resolve(result);
      }

      socket.on('data', (chunk) => {
        buf += chunk;

        if (step === 'WAIT_GREETING' && buf.includes('* OK')) {
          buf = '';
          step = 'LOGIN';
          socket.write(`A1 LOGIN "${acc.user}" "${acc.pass}"\r\n`);
        } else if (step === 'LOGIN' && buf.includes('A1 ')) {
          if (!buf.includes('A1 OK')) {
            return safeClose({ error: 'Login failed: ' + buf, purgedCount: count });
          }
          buf = '';
          step = 'LIST';
          socket.write(`A2 LIST "" "*"\r\n`);
        } else if (step === 'LIST' && buf.includes('A2 OK')) {
          trashFolder = detectTrashFolder(buf);
          sentFolder = detectSentFolder(buf);
          buf = '';
          step = 'SELECT';
          socket.write(`A3 SELECT INBOX\r\n`);
        } else if (step === 'SELECT' && buf.includes('A3 OK')) {
          buf = '';
          step = 'MOVE_BATCHES';
          executeNextMoveBatch();
        }
      });

      function executeNextMoveBatch() {
        const start = batchIndex * BATCH_SIZE;
        if (start >= targetUids.length) {
          return safeClose({
            success: true,
            account: acc.user,
            purgedCount: count,
            trashFolder,
            sentFolder
          });
        }

        const slice = targetUids.slice(start, start + BATCH_SIZE);
        const tag = `M${batchIndex}`;
        buf = '';

        function onMoveData(d) {
          buf += d;
          if (buf.includes(`${tag} OK`)) {
            socket.removeListener('data', onMoveData);
            count += slice.length;
            batchIndex++;
            if (typeof onProgress === 'function') {
              onProgress(count, targetUids.length);
            }
            executeNextMoveBatch();
          } else if (buf.includes(`${tag} NO`) || buf.includes(`${tag} BAD`)) {
            socket.removeListener('data', onMoveData);
            batchIndex++;
            executeNextMoveBatch();
          }
        }

        socket.on('data', onMoveData);
        socket.write(`${tag} UID MOVE ${slice.join(',')} "${trashFolder}"\r\n`);
      }

      socket.on('error', (err) => {
        safeClose({ error: err.message, purgedCount: count });
      });
      socket.on('timeout', () => {
        safeClose({ error: 'Timeout while purging bounces', purgedCount: count });
      });
    });

    purgedInboxCount = inboxMoveRes.purgedCount || 0;
  }

  // 🧹 BIDIRECTIONAL PURGE: Also remove original outgoing emails from Gmail "Sent Mail"
  let purgedSentCount = 0;
  if (purgeSentMail) {
    try {
      const sentRes = await purgeSentMailsForRecipients(acc.user, {
        recipientEmails: recipientsToClean
      });
      purgedSentCount = sentRes.purgedSentCount || 0;
    } catch (e) {
      console.warn(`[PURGE] Notice during sent mail purge for ${acc.user}:`, e.message);
    }
  }

  const totalPurged = purgedInboxCount + purgedSentCount;

  // Record audit history
  recordPurgeHistory({
    timestamp: new Date().toISOString(),
    account: acc.user,
    action: 'bidirectional_purge',
    purgedCount: purgedInboxCount,
    purgedSentCount,
    totalPurged,
    trashFolder,
    sentFolder,
    requestedCount: targetUids.length
  });

  return {
    success: true,
    account: acc.user,
    purgedCount: purgedInboxCount,
    purgedSentCount,
    totalPurged,
    trashFolder,
    sentFolder,
    message: totalPurged > 0
      ? `Bro, successfully moved ${purgedInboxCount} bounce notification(s) from INBOX and ${purgedSentCount} original email(s) from Sent Mail to Trash! Zero trace left in Gmail.`
      : 'Inbox and Sent Mail are already clean. Zero failed emails found to delete!'
  };
}

// Record purge history for auditing
function recordPurgeHistory(entry) {
  try {
    let history = [];
    if (fs.existsSync(PURGE_LOG_FILE)) {
      history = JSON.parse(fs.readFileSync(PURGE_LOG_FILE, 'utf8') || '[]');
    }
    history.unshift(entry);
    if (history.length > 100) history = history.slice(0, 100);
    fs.writeFileSync(PURGE_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write bounce_purge_log.json:', e.message);
  }
}

function getPurgeHistory() {
  try {
    if (fs.existsSync(PURGE_LOG_FILE)) {
      return JSON.parse(fs.readFileSync(PURGE_LOG_FILE, 'utf8') || '[]');
    }
  } catch (e) {}
  return [];
}

function clearPurgeHistory() {
  try {
    fs.writeFileSync(PURGE_LOG_FILE, JSON.stringify([], null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to clear bounce_purge_log.json:', e.message);
    return false;
  }
}

// Permanently empty Gmail Trash / Bin folder
async function emptyTrashPermanently(targetAccountEmail) {
  const acc = getAccountCredentials(targetAccountEmail);
  if (!acc.pass) throw new Error(`No app password found for account ${acc.user}`);

  return new Promise((resolve, reject) => {
    let socket;
    try {
      socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });
      socket.setEncoding('utf8');
      socket.setTimeout(35000);
    } catch (e) {
      return reject(e);
    }

    let buf = '';
    let step = 'WAIT_GREETING';
    let trashFolder = '[Gmail]/Bin';
    let isFinished = false;

    function safeClose(result) {
      if (isFinished) return;
      isFinished = true;
      try { socket.write('X LOGOUT\r\n'); } catch (e) {}
      try { socket.destroy(); } catch (e) {}
      resolve(result);
    }

    socket.on('data', (chunk) => {
      buf += chunk;
      if (step === 'WAIT_GREETING' && buf.includes('* OK')) {
        buf = '';
        step = 'LOGIN';
        socket.write(`A1 LOGIN "${acc.user}" "${acc.pass}"\r\n`);
      } else if (step === 'LOGIN' && buf.includes('A1 ')) {
        if (!buf.includes('A1 OK')) return safeClose({ error: 'Login failed: ' + buf });
        buf = '';
        step = 'LIST';
        socket.write(`A2 LIST "" "*"\r\n`);
      } else if (step === 'LIST' && buf.includes('A2 OK')) {
        trashFolder = detectTrashFolder(buf);
        buf = '';
        step = 'SELECT_TRASH';
        socket.write(`A3 SELECT "${trashFolder}"\r\n`);
      } else if (step === 'SELECT_TRASH' && buf.includes('A3 OK')) {
        buf = '';
        step = 'STORE_DELETED';
        socket.write(`A4 STORE 1:* +FLAGS (\\Deleted)\r\n`);
      } else if (step === 'STORE_DELETED' && buf.includes('A4 ')) {
        buf = '';
        step = 'EXPUNGE';
        socket.write(`A5 EXPUNGE\r\n`);
      } else if (step === 'EXPUNGE' && buf.includes('A5 OK')) {
        safeClose({ success: true, account: acc.user, trashFolder, message: `Permanently emptied ${trashFolder}` });
      }
    });

    socket.on('error', (err) => safeClose({ error: err.message }));
    socket.on('timeout', () => safeClose({ error: 'Timeout emptying trash' }));
  });
}

function registerFailedRecipientInSentLog(failedEmail, reason = 'Address not found') {
  if (!failedEmail || !failedEmail.includes('@')) return;
  const normEmail = failedEmail.toLowerCase().trim();
  const domain = normEmail.split('@')[1];
  try {
    let history = [];
    if (fs.existsSync(SENT_LOG_FILE)) {
      history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    }
    const idx = history.findIndex(h => (h.email || '').toLowerCase().trim() === normEmail);
    if (idx >= 0) {
      if (history[idx].status !== 'skipped_invalid_domain') {
        history[idx].status = 'skipped_invalid_domain';
        history[idx].error = `Bounced: ${reason} (Permanent Hard Bounce)`;
        fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
      }
    } else {
      history.push({
        email: normEmail,
        company: domain ? (domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)) : 'Unknown',
        status: 'skipped_invalid_domain',
        error: `Bounced: ${reason} (Hard NDR detected in Gmail)`,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(SENT_LOG_FILE, JSON.stringify(history, null, 2), 'utf8');
    }
  } catch (e) {
    console.warn('[BOUNCE PURGE] Failed to update sent_log for bounce:', e.message);
  }
}

// -------------------------------------------------------------
// 3. FULL AUTONOMOUS MULTI-INBOX PURGE (DURING BREAKS & PERIODICALLY)
// -------------------------------------------------------------
async function autoPurgeAllAccounts({ onLog = null, purgeSent = true, sweepHistorical = false } = {}) {
  const accounts = [
    (process.env.GMAIL_USER_1 || process.env.GMAIL_USER || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_2 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_3 || '').toLowerCase().trim(),
    (process.env.GMAIL_USER_4 || '').toLowerCase().trim()
  ].filter(Boolean);

  const results = {
    totalPurged: 0,
    totalInboxPurged: 0,
    totalSentPurged: 0,
    byAccount: {},
    timestamp: new Date().toISOString()
  };

  for (const acc of accounts) {
    try {
      if (typeof onLog === 'function') {
        onLog(`Scanning ${acc} for confirmed "Address not found" / Mail Subsystem failures...`);
      }
      // Scan account INBOX
      const scanRes = await scanBouncesInInbox(acc, { previewLimit: 200 });
      const targetUids = scanRes.clearToDeleteUids || [];
      const failedRecipients = scanRes.failedRecipients || [];

      let accountInboxPurged = 0;
      let accountSentPurged = 0;

      if (targetUids.length > 0) {
        if (typeof onLog === 'function') {
          onLog(`Auto-purging ${targetUids.length} bounce notifications from ${acc} INBOX & matching Sent emails to Trash...`);
        }
        // Bidirectional purge (removes from INBOX and removes original outgoing from Sent Mail)
        const purgeRes = await purgeBouncesFromInbox(acc, {
          uids: targetUids,
          purgeSentMail: Boolean(purgeSent),
          failedRecipients
        });
        accountInboxPurged = purgeRes.purgedCount || 0;
        accountSentPurged = purgeRes.purgedSentCount || 0;
      } else if (purgeSent && sweepHistorical) {
        if (typeof onLog === 'function') {
          onLog(`Sweeping historical failed emails from ${acc} Sent Mail...`);
        }
        const sentRes = await purgeSentMailsForRecipients(acc);
        accountSentPurged = sentRes.purgedSentCount || 0;
      }

      const accountTotal = accountInboxPurged + accountSentPurged;
      results.totalInboxPurged += accountInboxPurged;
      results.totalSentPurged += accountSentPurged;
      results.totalPurged += accountTotal;
      results.byAccount[acc] = {
        inbox: accountInboxPurged,
        sent: accountSentPurged,
        total: accountTotal
      };
    } catch (err) {
      console.warn(`[AUTO-PURGE] Notice for account ${acc}:`, err.message);
      results.byAccount[acc] = { inbox: 0, sent: 0, total: 0, error: err.message };
    }
  }

  return results;
}

module.exports = {
  scanBouncesInInbox,
  purgeBouncesFromInbox,
  purgeSentMailsForRecipients,
  detectSentFolder,
  detectTrashFolder,
  getHistoricalFailedRecipients,
  getPurgeHistory,
  clearPurgeHistory,
  emptyTrashPermanently,
  getAccountCredentials,
  registerFailedRecipientInSentLog,
  autoPurgeAllAccounts
};
