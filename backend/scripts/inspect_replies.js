const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const tls = require('tls');

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected to IMAP');
});

let buf = '';
let step = 'WAIT_GREETING';
let msgIds = [];
let fetchIdx = 0;
const results = [];

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
      console.log('Login failed');
      socket.destroy();
    }
  } else if (step === 'SELECTING' && buf.includes('A2 ')) {
    buf = '';
    step = 'SEARCHING';
    // Search for emails since Sep 1, 2026
    socket.write('A3 SEARCH SINCE "01-Sep-2026"\r\n');
  } else if (step === 'SEARCHING' && buf.includes('A3 ')) {
    const match = buf.match(/\* SEARCH ([\d\s]+)/);
    buf = '';
    if (match && match[1].trim()) {
      msgIds = match[1].trim().split(/\s+/).map(Number).filter(Boolean);
      console.log('Total emails found since Sep 1:', msgIds.length);
      // Take the latest 30 emails
      msgIds = msgIds.slice(-30);
      step = 'FETCHING';
      fetchIdx = 0;
      fetchNext();
    } else {
      finish();
    }
  } else if (step === 'FETCHING') {
    const tag = `F${fetchIdx} `;
    if (buf.includes(tag)) {
      // Parse current email chunk
      results.push({
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
  // Fetch RFC822.HEADER and BODY.PEEK[TEXT]<0.1000>
  socket.write(`F${fetchIdx} FETCH ${id} (BODY[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO)] BODY.PEEK[TEXT]<0.1500>)\r\n`);
}

function finish() {
  console.log('Finished fetching', results.length, 'emails.');
  socket.write('A9 LOGOUT\r\n');
  setTimeout(() => socket.destroy(), 1000);

  // Process and print parsed emails
  const parsed = results.map(r => {
    const fromM = r.raw.match(/From:\s*([^\r\n]+)/i);
    const subM = r.raw.match(/Subject:\s*([^\r\n]+)/i);
    const dateM = r.raw.match(/Date:\s*([^\r\n]+)/i);
    const from = fromM ? fromM[1].trim() : 'Unknown';
    const subject = subM ? subM[1].trim() : 'No Subject';
    const date = dateM ? dateM[1].trim() : '';

    // Check if it's a bounce/mailer-daemon
    const isBounce = /mailer-daemon|postmaster|delivery\s*subsystem|mail\s*delivery\s*system|failure\s*notice/i.test(from) ||
                     /failure|rejected|undelivered|returned\s*mail|not\s*found|delivery\s*has\s*failed/i.test(subject);

    return {
      id: r.id,
      from,
      subject,
      date,
      isBounce
    };
  });

  const nonBounces = parsed.filter(p => !p.isBounce);
  console.log(`\nFound ${parsed.length} total emails (${parsed.length - nonBounces.length} bounces, ${nonBounces.length} non-bounces):`);
  nonBounces.forEach(nb => {
    console.log(`- [${nb.date}] FROM: ${nb.from} | SUB: ${nb.subject}`);
  });
}

socket.on('error', (e) => console.error('Socket err:', e.message));
setTimeout(() => socket.destroy(), 25000);
