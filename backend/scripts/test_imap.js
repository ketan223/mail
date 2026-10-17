const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const tls = require('tls');

console.log('Testing IMAP for user:', process.env.GMAIL_USER);
const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected to imap.gmail.com:993');
});

let buf = '';
let step = 0;
socket.setEncoding('utf8');

socket.on('data', (d) => {
  buf += d;
  if (step === 0 && buf.includes('* OK')) {
    console.log('Server Greeting received.');
    step = 1;
    buf = '';
    socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
  } else if (step === 1 && buf.includes('A1 ')) {
    if (buf.includes('A1 OK')) {
      console.log('LOGIN SUCCESS!');
      step = 2;
      buf = '';
      socket.write('A2 SELECT INBOX\r\n');
    } else {
      console.log('LOGIN FAILED:', buf);
      socket.destroy();
    }
  } else if (step === 2 && buf.includes('A2 ')) {
    if (buf.includes('A2 OK')) {
      console.log('SELECT INBOX SUCCESS!');
      const match = buf.match(/\*\s+(\d+)\s+EXISTS/);
      if (match) {
        console.log('Total emails in INBOX:', match[1]);
      }
      step = 3;
      buf = '';
      // Search for recent emails in September 2026 or from Application subjects
      socket.write('A3 SEARCH SUBJECT "Application" SINCE "01-Sep-2026"\r\n');
    } else {
      console.log('SELECT FAILED:', buf);
      socket.destroy();
    }
  } else if (step === 3 && buf.includes('A3 ')) {
    console.log('SEARCH RESULTS:\n', buf);
    socket.write('A4 LOGOUT\r\n');
    setTimeout(() => socket.destroy(), 1000);
  }
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});

setTimeout(() => {
  console.log('Closing timeout.');
  socket.destroy();
}, 15000);
