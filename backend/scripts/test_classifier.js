const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const tls = require('tls');
const fs = require('fs');

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');
const sentDomains = new Set();
const sentEmails = new Set();
sentLog.forEach(s => {
  if (s.email) {
    const e = s.email.toLowerCase().trim();
    sentEmails.add(e);
    const d = e.split('@')[1];
    if (d) sentDomains.add(d);
  }
});

const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected to IMAP');
});

let buf = '';
let step = 'WAIT_GREETING';
let msgIds = [];
let fetchIdx = 0;
const emailItems = [];

socket.setEncoding('utf8');

socket.on('data', (d) => {
  buf += d;

  if (step === 'WAIT_GREETING' && buf.includes('* OK')) {
    buf = '';
    step = 'LOGGING_IN';
    socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
  } else if (step === 'LOGGING_IN' && buf.includes('A1 ')) {
    if (buf.includes('A1 OK')) {
      buf = '';
      step = 'SELECTING';
      socket.write('A2 SELECT INBOX\r\n');
    } else {
      socket.destroy();
    }
  } else if (step === 'SELECTING' && buf.includes('A2 ')) {
    buf = '';
    step = 'SEARCHING';
    // Search for emails matching "Application" or "Re:" since Sep 1
    socket.write('A3 SEARCH SINCE "01-Sep-2026" OR SUBJECT "Application" SUBJECT "Re:"\r\n');
  } else if (step === 'SEARCHING' && buf.includes('A3 ')) {
    const match = buf.match(/\* SEARCH ([\d\s]+)/);
    buf = '';
    if (match && match[1].trim()) {
      msgIds = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
      console.log('Matched candidate email IDs:', msgIds.length);
      // Let's inspect the latest 60 candidate emails
      msgIds = msgIds.slice(-60);
      step = 'FETCHING';
      fetchIdx = 0;
      fetchNext();
    } else {
      finish();
    }
  } else if (step === 'FETCHING') {
    const tag = `F${fetchIdx} `;
    if (buf.includes(tag)) {
      emailItems.push({
        id: msgIds[fetchIdx],
        raw: buf
      });
      buf = '';
      fetchIdx++;
      if (fetchIdx < msgIds.length) {
        fetchNext();
      } else {
        finish();
      }
    }
  }
});

function fetchNext() {
  const id = msgIds[fetchIdx];
  socket.write(`F${fetchIdx} FETCH ${id} (BODY[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)] BODY.PEEK[TEXT]<0.2500>)\r\n`);
}

function cleanMime(str) {
  if (!str) return '';
  return str.replace(/=\?UTF-8\?[QB]\?([^?]+)\?=/gi, (match, p1) => {
    return p1.replace(/_/g, ' ');
  });
}

function finish() {
  console.log('Finished fetching', emailItems.length, 'emails.');
  socket.write('A9 LOGOUT\r\n');
  setTimeout(() => socket.destroy(), 1000);

  const parsed = [];

  for (const item of emailItems) {
    const raw = item.raw;
    const fromM = raw.match(/From:\s*([^\r\n]+)/i);
    const subM = raw.match(/Subject:\s*([^\r\n]+)/i);
    const dateM = raw.match(/Date:\s*([^\r\n]+)/i);
    const inReplyM = raw.match(/In-Reply-To:\s*([^\r\n]+)/i);

    const fromRaw = fromM ? fromM[1].trim() : 'Unknown';
    const subjectRaw = subM ? subM[1].trim() : 'No Subject';
    const date = dateM ? dateM[1].trim() : '';

    const emailAddrM = fromRaw.match(/<([^>]+)>/) || fromRaw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const fromEmail = emailAddrM ? emailAddrM[1].toLowerCase().trim() : '';
    const fromDomain = fromEmail.split('@')[1] || '';

    // Extract body snippet
    const bodyStart = raw.indexOf('\r\n\r\n');
    let bodySnippet = '';
    if (bodyStart >= 0) {
      bodySnippet = raw.substring(bodyStart).replace(/[\r\n]+/g, ' ').trim();
      // Remove MIME headers/boundary markers if present
      bodySnippet = bodySnippet.replace(/--[a-zA-Z0-9_-]+[--]?/g, '').trim();
      bodySnippet = bodySnippet.substring(0, 300);
    }

    // Is it a bounce?
    const isBounce = /mailer-daemon|postmaster|delivery\s*subsystem|mail\s*delivery\s*system|failure\s*notice/i.test(fromRaw) ||
                     /failure|rejected|undelivered|returned\s*mail|not\s*found|delivery\s*has\s*failed/i.test(subjectRaw);

    if (isBounce) continue;

    // Check if relevant to outreach campaign
    const isOurSubject = /Application:\s*Software\s*Engineering/i.test(subjectRaw);
    const isSentDomain = sentDomains.has(fromDomain);
    const isSentEmail = sentEmails.has(fromEmail);
    const isReply = /^(Re|Fwd|Automatic reply|Auto-reply):/i.test(subjectRaw);

    if (!isOurSubject && !isSentDomain && !isSentEmail && !isReply) {
      continue;
    }

    // Smart Classification
    let category = 'genuine'; // 'genuine' or 'automated'
    let subCategory = 'Inquiry / Next Steps'; // 'Auto-Ack', 'Auto-Reject', 'Out of Office', 'Interview / Screening', 'CTC / Info Request'

    const combinedText = (subjectRaw + ' ' + bodySnippet).toLowerCase();

    // 1. Out of Office
    if (/out\s+of\s+office|on\s+leave|away\s+from\s+my\s+desk|annual\s+leave|holiday/i.test(combinedText)) {
      category = 'automated';
      subCategory = 'Out of Office';
    }
    // 2. Automated tickets & Canned responses
    else if (/canned\.response|atlassian\.net|zendesk|freshdesk|greenhouse|lever\.co|myworkday|bamboohr|no[-_]?reply/i.test(fromEmail) ||
             /automatic\s*reply|auto-reply|thank\s*you\s*for\s*your\s*(email|application|interest)|this\s*is\s*an\s*automated|we\s*have\s*received\s*your|ticket\s*has\s*been\s*created|we\s*will\s*get\s*back\s*to\s*you\s*if/i.test(combinedText)) {
      category = 'automated';
      subCategory = 'Auto-Acknowledgment';
    }
    // 3. Automated Rejections
    else if (/regret\s+to\s+inform|not\s+moving\s+forward|not\s+considering|pursuing\s+other\s+candidates|keep\s+your\s+resume\s+on\s+file|no\s+openings?\s+(at\s+this\s+time|matching)/i.test(combinedText)) {
      category = 'automated';
      subCategory = 'Automated Rejection';
    }
    // 4. Genuine HR responses:
    else if (/ctc|notice\s*period|current\s*location|available\s*for\s*(an?\s*)?(interview|call|discussion)|schedule\s*a\s*call|meet\.google|zoom\.us|calendly|share\s*your\s*(updated\s*)?(cv|resume)|years\s*of\s*experience/i.test(combinedText)) {
      category = 'genuine';
      subCategory = 'CTC & Info / Screening Call';
    } else {
      // Default to genuine if it's a person from a real company writing back!
      category = 'genuine';
      subCategory = 'Direct HR Reply';
    }

    parsed.push({
      id: item.id,
      from: cleanMime(fromRaw),
      fromEmail,
      subject: cleanMime(subjectRaw),
      date,
      bodySnippet,
      category,
      subCategory
    });
  }

  console.log(`\n=== EXTRACTED ${parsed.length} CAMPAIGN REPLIES ===`);
  const genuine = parsed.filter(p => p.category === 'genuine');
  const automated = parsed.filter(p => p.category === 'automated');

  console.log(`\n🎯 GENUINE HR REPLIES (${genuine.length}):`);
  genuine.forEach(g => {
    console.log(`[${g.subCategory}] From: ${g.from}`);
    console.log(`  Sub: ${g.subject}`);
    console.log(`  Snippet: ${g.bodySnippet.substring(0, 150)}...\n`);
  });

  console.log(`\n🤖 AUTOMATED / DEFAULT REPLIES (${automated.length}):`);
  automated.forEach(a => {
    console.log(`[${a.subCategory}] From: ${a.from}`);
    console.log(`  Sub: ${a.subject}`);
    console.log(`  Snippet: ${a.bodySnippet.substring(0, 150)}...\n`);
  });

  fs.writeFileSync(path.join(__dirname, '../data/classified_replies.json'), JSON.stringify(parsed, null, 2), 'utf8');
}

socket.on('error', e => console.error('Socket err:', e.message));
setTimeout(() => socket.destroy(), 35000);
