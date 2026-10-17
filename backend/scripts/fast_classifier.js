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
    socket.write('A3 SEARCH SINCE "01-Sep-2026"\r\n');
  } else if (step === 'SEARCHING' && buf.includes('A3 ')) {
    const match = buf.match(/\* SEARCH ([\d\s]+)/);
    buf = '';
    if (match && match[1].trim()) {
      const allIds = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
      console.log('Total emails since Sep 1:', allIds.length);
      // Take the latest 50
      const recentIds = allIds.slice(-50);
      step = 'FETCHING_BATCH';
      socket.write(`A4 FETCH ${recentIds.join(',')} (BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT]<0.800>)\r\n`);
    } else {
      socket.destroy();
    }
  } else if (step === 'FETCHING_BATCH' && buf.includes('A4 OK')) {
    console.log('Batch fetch completed! Total raw size:', buf.length);
    parseAndClassify(buf);
    socket.write('A5 LOGOUT\r\n');
    setTimeout(() => socket.destroy(), 1000);
  }
});

function parseAndClassify(rawText) {
  // Split raw text by FETCH items: "* <id> FETCH ("
  const items = rawText.split(/\*\s+\d+\s+FETCH\s+/i).slice(1);
  console.log('Parsed raw fetch items:', items.length);

  const parsed = [];

  for (const item of items) {
    const fromM = item.match(/From:\s*([^\r\n]+)/i);
    const subM = item.match(/Subject:\s*([^\r\n]+)/i);
    const dateM = item.match(/Date:\s*([^\r\n]+)/i);

    const fromRaw = fromM ? fromM[1].trim() : '';
    const subjectRaw = subM ? subM[1].trim() : '';
    const date = dateM ? dateM[1].trim() : '';

    if (!fromRaw && !subjectRaw) continue;

    // Filter out standard bounces
    const isBounce = /mailer-daemon|postmaster|delivery\s*subsystem|mail\s*delivery\s*system|failure\s*notice/i.test(fromRaw) ||
                     /failure|rejected|undelivered|returned\s*mail|not\s*found|delivery\s*has\s*failed|diagnostic-code/i.test(subjectRaw);

    if (isBounce) continue;

    // Clean email address
    const emailM = fromRaw.match(/<([^>]+)>/) || fromRaw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const fromEmail = emailM ? emailM[1].toLowerCase().trim() : '';
    const fromDomain = fromEmail.split('@')[1] || '';

    // Ignore marketing newsletters
    if (/unstop|jobleads|linkedin|devpost|coursera|glassdoor|internshala|naukri|foundit|indeed|medium\.com/i.test(fromDomain)) {
      continue;
    }

    // Extract body snippet
    const bodyStart = item.indexOf('BODY[TEXT]');
    let bodySnippet = '';
    if (bodyStart >= 0) {
      bodySnippet = item.substring(bodyStart + 10, bodyStart + 600).replace(/[\r\n]+/g, ' ').trim();
    } else {
      bodySnippet = item.substring(0, 300).replace(/[\r\n]+/g, ' ').trim();
    }

    // Decode MIME subject if encoded
    let cleanSubject = subjectRaw.replace(/=\?UTF-8\?[QB]\?([^?]+)\?=/gi, (m, p) => p.replace(/_/g, ' '));
    let cleanFrom = fromRaw.replace(/=\?UTF-8\?[QB]\?([^?]+)\?=/gi, (m, p) => p.replace(/_/g, ' '));

    // Check if it belongs to outreach:
    const isOurApp = /Application:\s*Software\s*Engineering/i.test(cleanSubject);
    const isSentDomain = sentDomains.has(fromDomain);
    const isSentEmail = sentEmails.has(fromEmail);
    const isReply = /^(Re|Fwd|Automatic reply|Auto-reply):/i.test(cleanSubject);

    // Classification
    let category = 'genuine';
    let subCategory = 'Direct HR Reply';
    const textLower = (cleanSubject + ' ' + bodySnippet).toLowerCase();

    if (/out\s+of\s+office|on\s+leave|away\s+from\s+my\s+desk|annual\s+leave/i.test(textLower)) {
      category = 'automated';
      subCategory = 'Out of Office';
    } else if (/canned\.response|atlassian\.net|zendesk|freshdesk|greenhouse|lever\.co|myworkday|bamboohr|no[-_]?reply/i.test(fromEmail) ||
               /automatic\s*reply|auto-reply|thank\s*you\s*for\s*(your\s*)?(email|application|interest)|this\s*is\s*an\s*automated|we\s*have\s*received\s*your|ticket\s*has\s*been\s*created|we\s*will\s*get\s*back\s*to\s*you\s*if/i.test(textLower)) {
      category = 'automated';
      subCategory = 'Auto-Acknowledgment';
    } else if (/regret\s+to\s+inform|not\s+moving\s+forward|not\s+considering|pursuing\s+other\s+candidates|keep\s+your\s+resume\s+on\s+file|no\s+openings?\s+(at\s+this\s+time|matching)/i.test(textLower)) {
      category = 'automated';
      subCategory = 'Automated Rejection';
    } else if (/ctc|notice\s*period|current\s*location|available\s*for\s*(an?\s*)?(interview|call|discussion)|schedule\s*a\s*call|meet\.google|zoom\.us|calendly|share\s*your\s*(updated\s*)?(cv|resume)|years\s*of\s*experience/i.test(textLower)) {
      category = 'genuine';
      subCategory = 'Screening / Interview / CTC Request';
    } else {
      category = 'genuine';
      subCategory = 'Direct HR Reply';
    }

    parsed.push({
      from: cleanFrom,
      fromEmail,
      subject: cleanSubject,
      date,
      bodySnippet: bodySnippet.substring(0, 180),
      category,
      subCategory,
      isOurApp,
      isSentDomain
    });
  }

  console.log(`\n=== EXTRACTED ${parsed.length} NON-BOUNCE/NON-MARKETING EMAILS ===`);
  const genuine = parsed.filter(p => p.category === 'genuine');
  const automated = parsed.filter(p => p.category === 'automated');

  console.log(`\n🎯 GENUINE REPLIES (${genuine.length}):`);
  genuine.forEach(g => {
    console.log(`[${g.subCategory}] From: ${g.from} <${g.fromEmail}>`);
    console.log(`  Sub: ${g.subject}`);
    console.log(`  Snippet: ${g.bodySnippet}...\n`);
  });

  console.log(`\n🤖 AUTOMATED REPLIES (${automated.length}):`);
  automated.forEach(a => {
    console.log(`[${a.subCategory}] From: ${a.from} <${a.fromEmail}>`);
    console.log(`  Sub: ${a.subject}`);
    console.log(`  Snippet: ${a.bodySnippet}...\n`);
  });
}

socket.on('error', e => console.error('Err:', e));
setTimeout(() => socket.destroy(), 15000);
