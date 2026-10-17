# 🚀 Autonomous Quad-Engine Resume Blaster & HR Outreach Platform

An enterprise-grade, autonomous cold outreach platform built for software engineers to systematically dispatch highly personalized job applications, internship inquiries, and engineering portfolios directly to Tech HRs, Talent Acquisition Leaders, and Founders worldwide.

Powered by a **Quad-Gmail load-balanced SMTP engine**, **RFC 5321 DNS MX pre-flight mailbox verification**, an **Autonomous Lead Discovery Engine (250 Indian Startups + 150 Foreign Tech Companies/day)**, a **Strict 6-Minute Batch Cooldown Controller**, and an **Autonomous Bidirectional Gmail Bounce & Sent-Mail Purge Service**.

---

## 🌟 Core Highlights & Architectural Features

### 1. 🔄 Quad-Account Multi-Sender Load Balancing
- **Multi-Sender Account Rotation**: Rotates round-robin across configured Gmail accounts:
  - `sender_account_1@gmail.com`
  - `sender_account_2@gmail.com`
  - `sender_account_3@gmail.com`
  - `sender_account_4@gmail.com`
- **Safe Daily Quotas**: Strict cap of 100 emails/account/day (total 400 emails/day), well within Google's safe SMTP threshold.
- **Cross-Account Zero-Overlap Deduplication**: Centralized persistent tracking in `sent_log.json` guarantees that no company, HR contact, or domain is ever emailed twice across any of the sender accounts.

### 2. 🌍 Autonomous Dual-Engine Lead Discovery (400 Emails/Day)
- **Target Distribution**:
  - 🇮🇳 **250 Indian Tech Startups & Product Scaleups / day**: Mumbai, Bengaluru, Pune, Delhi-NCR, Hyderabad, and remote tech hubs.
  - 🌐 **150 Foreign / Global Tech Companies / day**: United States, United Kingdom, European Union, Canada, APAC, and global remote-first engineering teams.
- **Directory Backing**: 1,000+ pre-verified companies and dynamic lead generation with RFC-compliant mailbox pattern resolution (`careers@`, `talent@`, `jobs@`, `engineering-jobs@`).

### 3. ⏱️ Strict 6-Minute Batch Cooldown Engine
- **Micro-Batches**: Dispatches in controlled batches of **60 emails** (15 emails evenly distributed across each of the 4 sender inboxes).
- **Hard 6-Minute Cooldown Ceiling**: Between batches, the engine enters an exact **6-minute cooldown break (360,000 ms)**.
- **Background Break Tasks**: During the 6-minute pause, the engine automatically runs mailbox verification and background purge routines so the next batch is 100% prepared.
- **State Persistence & Crash Recovery**: `campaign_state.json` saves batch numbers, queue position, and timer timestamps; if the server restarts, it automatically resumes from the exact minute left in the break.

### 4. 🧹 Autonomous Bidirectional Gmail Bounce & Sent-Mail Purge Engine
- **Dual-Sided Cleaning**: When a mailbox fails (e.g. `Address not found`, `550 5.1.1`, `User unknown`, or `Mail Delivery Subsystem`):
  1. **Inbox Cleaning**: Automatically purges the non-delivery notice from the Gmail `INBOX` into `[Gmail]/Bin` or `[Gmail]/Trash`.
  2. **Sent Mail Cleaning**: Immediately queries `[Gmail]/Sent Mail` for the original outgoing email to that failed address and moves it to `[Gmail]/Bin` or `[Gmail]/Trash`.
- **Zero Gmail Trace**: Completely eliminates the annoying *"This reply to this message was deleted"* thread ghosting from Gmail.
- **Permanent Suppression**: Appends failed recipients to `suppression_list.json` and marks them in `sent_log.json` so they are never contacted again.
- **Recruiter Safety**: 100% safe — human recruiter replies, assessments, and interview invites are strictly protected and never touched.

### 5. 📥 5-Minute Automated Multi-Inbox Response Tracker & Classifier
- **Background Daemon**: Autonomous 5-minute IMAP sync cycle across all 4 Gmail inboxes simultaneously.
- **Smart Reply Classification**:
  - 🟢 **Interview Invitations / Call Requests**
  - 🟡 **Coding Assessments & Assignment Links**
  - 🔵 **Human Recruiter Inquiries**
  - ⚪ **Automated Acknowledgements & Auto-responders**
- Interactive Inbox tab in the UI displaying full thread snippets, sender badges, and direct 1-click deep links to Gmail search.

### 6. 🛡️ RFC 5321 DNS MX Pre-Flight Mailbox Validation
- Checks DNS MX records, domain syntax, and A/AAAA network records prior to sending.
- Skips dead domains and inactive servers before any email is dispatched, protecting domain reputation.
- Pluggable support for third-party email verification APIs (Abstract, ZeroBounce, Hunter).

### 7. 🎨 High-Performance Reactive Operator UI
- **Live Dispatch Stream**: Real-time log terminal with color-coded tags (`SUCCESS`, `BREAK`, `PURGE`, `DISCOVER`, `SYNC`, `SKIP`).
- **Interactive Email Live Preview**: Type subject and cover message with `{{name}}` and `{{company}}` tags and see an instant real-time rendered preview.
- **Dynamic Config Controls**: 1-click settings for break duration (strictly defaulting to 6 minutes), batch size, target location, and dry-run simulation mode.
- **Vault & PDF Uploader**: Drag & drop resume PDF upload with live preview and history tracking.

---

## 📁 Repository Structure

```
c:/HR_EMAIL/
├── README.md                            # Comprehensive platform documentation
├── MASTER_UPGRADE_BLUEPRINT_FOR_AI.md  # Architectural blueprint & engineering specs
├── Ketan_Resume.pdf                     # Active applicant resume PDF
├── .gitignore                           # Excludes .env, node_modules, logs, and artifacts
├── backend/
│   ├── server.js                        # Master Express server, API routes, and state machine
│   ├── package.json                     # Node.js dependencies and test scripts
│   ├── .env.example                     # Environment variables template
│   ├── Ketan_Resume.pdf                 # Server-side resume asset
│   ├── services/
│   │   ├── bouncePurgeService.js        # Bidirectional Inbox & Sent-Mail IMAP cleaner
│   │   ├── inboxTracker.js              # Multi-inbox IMAP poller & reply classifier
│   │   ├── emailValidator.js            # RFC 5321 DNS MX & syntax validator
│   │   ├── suppressionService.js        # Bounce & opt-out suppression list manager
│   │   └── aiCompanyDiscovery.js        # Lead generation & directory resolution
│   ├── data/
│   │   ├── company_directory.js         # Indian Tech Startups & scaleups dataset
│   │   ├── foreign_company_directory.js # Foreign / Global tech enterprises dataset
│   │   ├── fresh_indian_companies.json  # Supplemental curated startup pool
│   │   ├── campaign_state.json          # Live engine state (queue, timer, pauseMs)
│   │   ├── sent_log.json                # Deduplication audit trail of all sent applications
│   │   ├── suppression_list.json        # Permanent suppression list of failed addresses
│   │   ├── inbox_responses.json         # Synced recruiter replies across all inboxes
│   │   ├── classified_replies.json      # Structured categorized recruiter responses
│   │   ├── bounce_purge_log.json        # Audit log of purged bounces & sent emails
│   │   ├── email_audit_log.json         # Real-time event log of all engine actions
│   │   └── hr_contacts.json             # Preloaded recruiter contacts dataset
│   ├── scripts/                         # Directory builders, scrapers, and IMAP test utilities
│   └── tests/
│       └── emailValidation.test.js      # Unit tests for RFC & MX email verification
└── frontend/
    ├── index.html                       # High-contrast mission control dashboard
    ├── styles.css                       # Responsive dark-theme modern CSS
    └── app.js                           # Frontend controller, polling, and preview renderer
```

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- 1 to 4 Gmail accounts with 2-Step Verification enabled and a 16-character [App Password](https://myaccount.google.com/apppasswords).

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
# Primary Sender Account
GMAIL_USER=your_primary_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Multi-Account Senders (Quad Load-Balanced)
GMAIL_USER_1=your_account1@gmail.com
GMAIL_APP_PASSWORD_1=xxxx xxxx xxxx xxxx
GMAIL_USER_2=your_account2@gmail.com
GMAIL_APP_PASSWORD_2=xxxx xxxx xxxx xxxx
GMAIL_USER_3=your_account3@gmail.com
GMAIL_APP_PASSWORD_3=xxxx xxxx xxxx xxxx
GMAIL_USER_4=your_account4@gmail.com
GMAIL_APP_PASSWORD_4=xxxx xxxx xxxx xxxx

# Server Port
PORT=5000

# Optional Mailbox Verification Provider ('none' uses built-in DNS MX)
EMAIL_VERIFICATION_PROVIDER=none
```

---

## 🚀 Running the Platform

### 1. Start the Backend Server
```powershell
cd c:\HR_EMAIL\backend
npm start
```
The server will initialize on `http://localhost:5000`:
- Connects and verifies SMTP transporters for all active Gmail accounts.
- Restores previous campaign state and deduplication logs from disk.
- Launches the 5-minute automated inbox and bounce purge sync daemon.

### 2. Access the Operator Dashboard
Open your web browser and navigate to:
```
http://localhost:5000
```

### 3. Launching an Outreach Campaign
1. **Upload Resume**: Attach your PDF resume via the Document Vault or upload area.
2. **Review Cover Message**: Customize your subject and message body using dynamic placeholders:
   - `{{name}}`: Recruiter or Hiring Manager Name.
   - `{{company}}`: Target Company Name.
   - `{{sender_email}}`: Active sending Gmail address.
3. **Select Campaign Mode**:
   - **Autonomous Dual-Engine**: Automatically finds and targets **250 Indian Startups + 150 Foreign Tech Companies** with zero manual contact entry.
   - **Manual Extracted Contacts**: Select specific recruiters from the preloaded 1,842 HR contacts database.
4. **Cooldown & Batch Settings**:
   - Default batch size: `60` emails.
   - Default cooldown pause: `6` minutes (strictly locked to safe pacing).
5. **Start Outreach**: Click **"Start Autonomous Outreach"**. Watch the real-time log stream, progress counters, and countdown timer update live.

---

## 🧹 Manual & Automated Bounce Purge Operations

The platform features an on-demand API and UI trigger to clean your Gmail accounts at any time:

- **Automated Trigger**: Runs automatically during every 6-minute batch break and every 5-minute background sync cycle.
- **Manual Trigger**: Click **"Run Inbox Cleaner"** in the UI, or call:
  ```bash
  curl -X POST http://localhost:5000/api/inbox/purge-bounces
  ```
- **What It Does**:
  1. Searches `INBOX` for bounce notices and moves them to Trash/Bin.
  2. Searches `[Gmail]/Sent Mail` for the corresponding failed sent emails and moves them to Trash/Bin.
  3. Updates `suppression_list.json` and records the audit event in `bounce_purge_log.json`.

---

## 🧪 Testing

Run pre-flight DNS MX validation and email verification unit tests:
```powershell
cd c:\HR_EMAIL\backend
npm test
```

---

## 🔒 Security & Privacy Notice
- **App Passwords & Credentials**: Never commit `.env` or plain-text passwords to version control. The root `.gitignore` strictly protects `.env`, `.env.*`, and temporary uploads.
- **Suppression Protection**: Once an address or domain fails, it is permanently locked out to protect Gmail account health and reputation.
