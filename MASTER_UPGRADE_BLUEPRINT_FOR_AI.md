# RESUME BLASTER & AUTONOMOUS HR OUTREACH PLATFORM
## END-TO-END MASTER ARCHITECTURE, COMPREHENSIVE AUDIT & CLOUD-AI UPGRADE BLUEPRINT

> **FOR THE RECEIVING AI AGENT (Claude Opus / GPT-4o / Cloud AI):**  
> You are inheriting the codebase of **Resume Blaster**, an automated, stateful, high-deliverability recruiter outreach engine.  
> Read this document completely before modifying or generating code. It details the existing architecture, core mechanisms, bugs, bottlenecks, and the complete end-to-end upgrade roadmap to transform this local prototype into an enterprise-grade, fully automated, cloud-synced platform.

---

## 1. PROJECT EXECUTIVE SUMMARY & CURRENT STATE

### 1.1 What the Platform Does
- **Target User**: Software Engineer (Full-Stack & Generative AI Engineer).
- **Core Function**: Autonomously finds and contacts verified hiring teams (`careers@<domain>`) across India's tech ecosystem (Mumbai, Bangalore, Pune, Delhi-NCR, Hyderabad, Remote startups & scaleups).
- **Core Value Proposition**: **0% Bounce Rate Guarantee**. Protects free Gmail sender reputation through multi-stage pre-flight verification (DNS MX validation + raw TCP socket `RCPT TO` pre-checks) to eliminate `550 5.1.1 User Unknown` failures before an email is ever sent.
- **Cadence & Safety Rules**:
  - **Batch Size**: 15 emails per batch.
  - **Cooldown Break**: 12-minute automated pause between batches.
  - **Humanized Jitter**: 8 to 14 seconds random delay between individual dispatches.
  - **Daily Quota**: Strictly capped at 100 emails/calendar day (midnight reset) to stay well under Google's 500-send/rolling 24h ceiling.
  - **Resume Delivery**: Automatically attaches candidate's PDF (`Ketan_Resume.pdf`).

### 1.2 Codebase Structure
```
c:\HR_EMAIL\
├── Ketan_Resume.pdf                      # Default candidate resume
├── backend\
│   ├── server.js                        # Monolithic Express backend + CampaignEngine
│   ├── package.json                     # express, nodemailer, multer, cors, dotenv, pdf-parse
│   ├── .env                             # GMAIL_USER, GMAIL_APP_PASSWORD, PORT=5000
│   ├── data\
│   │   ├── company_directory.js         # Curated pool of 728+ DNS-verified tech companies
│   │   ├── sent_log.json                # Master database of 5,500+ send/skip logs (3,300+ unique domains)
│   │   ├── campaign_state.json          # Real-time state persistence (batch #, pause timers, daily limit)
│   │   ├── contacts.json                # Legacy manual contacts from uploaded files
│   │   └── vault_metadata.json          # Uploaded document tracking
│   ├── services\
│   │   └── inboxTracker.js              # Raw TLS IMAP listener (imap.gmail.com:993) for bounce detection
│   └── scripts\                         # Utility scripts for lead validation and DNS scanning
└── frontend\
    ├── index.html                       # Single-page control dashboard
    ├── app.js                           # Dashboard logic, log stream polling, action triggers
    └── styles.css                       # Modern dark-mode UI styling
```

---

## 2. DEEP CODE ARCHITECTURE & MECHANISMS

### 2.1 Campaign Engine (`backend/server.js`)
- `CampaignEngine` is a stateful class running inside the Node process.
- **State Machine**:
  - `idle`: Ready to start.
  - `running_batch`: Actively verifying and dispatching a 15-email batch.
  - `waiting_pause`: 12-minute cooldown timer is running (`setTimeout`).
  - `paused`: Halted by user; state preserved.
  - `daily_limit_reached`: 100 sends completed today; automatically hibernating until next day.
  - `completed`: All candidate leads in the directory have been contacted.
- **Pre-flight Socket Verification (`verifyMailboxExists`)**:
  - Connects to recipient domain's primary MX server on TCP port 25.
  - Sends `HELO mail.check` -> `MAIL FROM:<sender@yourdomain.com>` -> `RCPT TO:<careers@domain>`.
  - If server returns `550 5.1.1` (Mailbox does not exist) -> Mark `skipped_invalid_domain` and skip immediately without sending.
  - If firewall/ISP blocks port 25 or probe times out (3.5s) -> Gracefully allows sending to avoid dropping valid corporate mailboxes.
- **State Persistence (`loadState` / `saveState`)**:
  - State is saved to `campaign_state.json`.
  - When the server boots, `loadState()` restores `currentBatchNumber`, `dailyLimit`, and queue. If a cooldown break expired while offline, it seamlessly triggers the next batch automatically within 2 seconds.

### 2.2 Directory Management (`backend/data/company_directory.js`)
- Contains 728+ tech company domains.
- Uses `HR_ALIASES = ['careers']`.
- `getFreshCandidates(targetLocation, contactedSet)` filters out any company whose domain already exists in `sent_log.json`.

### 2.3 Bounce Syncing (`backend/services/inboxTracker.js`)
- Connects directly to `imap.gmail.com:993` via TLS.
- Fetches incoming unread emails, parses headers and multipart body snippets.
- Identifies `mailer-daemon@googlemail.com` and `postmaster` bounce notices, extracts the failed email, and updates `sent_log.json` to mark the record as bounced so it is never re-contacted.

---

## 3. IDENTIFIED PAIN POINTS & ARCHITECTURAL WEAKNESSES

1. **Flat File Concurrency & Corruption Risk (`sent_log.json`)**:
   - `sent_log.json` currently contains over 5,500 records (~1.5 MB).
   - Every email sent, skipped, or bounced calls `JSON.parse` and synchronous `fs.writeFileSync` of the entire file.
   - **Risk**: High CPU spikes, race conditions under rapid verification, and risk of JSON file corruption if power is cut during write.
2. **The "Manual Syncing" Problem (Multi-Machine Divergence)**:
   - When running on multiple laptops or migrating between machines, `sent_log.json`, `campaign_state.json`, and directory lists fall out of sync.
   - The user currently has to manually transfer or sync logs. If desynced, the system could send duplicate emails to the same HR.
3. **Local Machine Dependency (Sleep & Power Management)**:
   - Running on a personal laptop means the outreach stops whenever the laptop goes to sleep, closes the lid, or disconnects from Wi-Fi.
4. **Single Gmail Account Ceiling**:
   - A single free Gmail account has a hard limit of 500 emails/rolling 24h. The safe threshold is 100/day. Scaling beyond 100/day requires multiple account rotation.
5. **Port 25 Residential ISP Throttling**:
   - Some consumer ISPs (e.g. mobile hotspots, college Wi-Fi) block outbound port 25 connections, forcing pre-checks to fall back to timeouts.
6. **Static Email Templates**:
   - Sending identical email copy to hundreds of recipients risks triggering Google's outbound spam heuristics. It lacks dynamic company-specific personalization.
7. **No Real-Time Alerts for HR Responses**:
   - When a recruiter replies with an interview invitation, the user must manually check their inbox or the dashboard.

---

## 4. END-TO-END MASTER UPGRADE ROADMAP ("LAST-TO-LAST" VISION)

The ultimate vision is a **100% Hands-Free, 24/7 Cloud Autonomous Recruiting Platform** that requires **ZERO manual syncing, ZERO manual clicking, and ZERO local machine dependency**.

### Pillar 1: 100% Automated Cloud Database & Bidirectional Sync
- **Target**: Eliminate `sent_log.json` and local JSON files.
- **Solution**:
  - Migrate storage to a managed cloud database (e.g., **Supabase / Neon PostgreSQL** or **MongoDB Atlas** - both have free tiers).
  - Every machine (Ketan's laptop, brother's laptop, cloud server) connects to the **same central cloud database**.
  - All sends, skips, bounces, and state transitions are written with atomic transactions (`INSERT ... ON CONFLICT DO NOTHING`).
  - **Zero Manual Syncing**: Any update from any instance is instantly reflected everywhere in real-time via WebSockets or database triggers.

### Pillar 2: 24/7 Cloud Daemon Deployment (Set-and-Forget)
- **Target**: Free the user from keeping their laptop awake.
- **Solution**:
  - Containerize the entire application with `Dockerfile` and `docker-compose.yml`.
  - Deploy to a free/low-cost cloud runner (**Render**, **Railway**, **Fly.io**, or **AWS EC2 Free Tier**).
  - Use **PM2** process manager (`pm2 start server.js --name hr-blaster`) with auto-restart on crashes and automated memory management.
  - Implement a daily cron trigger (`node-cron` or Cloud Scheduler) that fires at **9:30 AM IST every morning**, runs the day's batches with scheduled pauses, hits the safe quota, and sleeps until the next morning.

### Pillar 3: Multi-Account SMTP Rotation Pool
- **Target**: Scale safely from 100 to 300–500 emails/day without triggering Google account restrictions.
- **Solution**:
  - Support an array of sending mailboxes in `.env` or database:
    ```json
    [
      { "email": "sender1@gmail.com", "dailyLimit": 80, "current": 0 },
      { "email": "sender2@gmail.com", "dailyLimit": 80, "current": 0 },
      { "email": "sender3@gmail.com", "dailyLimit": 80, "current": 0 }
    ]
    ```
  - Implement Round-Robin rotation: Each batch alternates sender accounts.
  - Individual warmup tracking: Gradually scales send limits for new accounts.

### Pillar 4: LLM Dynamic Personalization Engine (AI Copilot)
- **Target**: 100% unique email copy for every single recipient to achieve 0% spam score and 5x recruiter response rates.
- **Solution**:
  - Integrate an LLM call (using Claude 3.5 Sonnet, GPT-4o-mini, or Google Gemini 1.5 Flash).
  - The engine reads the target company's domain, website metadata, or industry tag (e.g., FinTech, LLM Ops, Developer Tools).
  - Dynamically synthesizes a customized 2-sentence opening hook:
    * *Example*: "I have been following {{company}}'s recent push into real-time streaming analytics, and given my background optimizing high-throughput Node.js microservices..."
  - Dynamically aligns Ketan's listed skills with the company's tech stack.

### Pillar 5: Multi-Stage Follow-Up Sequence Engine
- **Target**: Convert cold emails into interviews. Over 60% of positive recruiter responses come from follow-ups.
- **Solution**:
  - Automated 3-stage drip sequence:
    - **Day 0**: Initial outreach email with attached resume.
    - **Day 4**: Gentle thread follow-up (`In-Reply-To` and `References` headers set so it appears in the same email thread).
    - **Day 9**: Final soft touchpoint.
  - **Auto-Stop Trigger**: The instant the IMAP tracker detects a response from that recipient's domain, the follow-up sequence is immediately cancelled.

### Pillar 6: Instant Recruiter Response Notifications (Telegram / WhatsApp)
- **Target**: Respond to recruiter inquiries within 5 minutes.
- **Solution**:
  - Connect a Telegram Bot via webhook (`node-telegram-bot-api`).
  - When `inboxTracker.js` receives an incoming email:
    - Use a fast classifier prompt to determine if it is:
      1. `INTERVIEW_INVITE`
      2. `TECHNICAL_ASSESSMENT`
      3. `APPLICATION_QUESTION`
      4. `REJECTION`
      5. `AUTO_REPLY`
    - If `INTERVIEW_INVITE` or `TECHNICAL_ASSESSMENT`: Instantly ping Ketan's Telegram with company name, recruiter email, and message snippet, along with AI-suggested quick reply options.

### Pillar 7: Modernized Full-Stack UI (Next.js 14 / Vite React + Tailwind)
- **Target**: Replace monolithic vanilla frontend with a clean, responsive dashboard.
- **Features**:
  - Real-time WebSocket connection replacing periodic HTTP polling.
  - Live analytics charts: Total sent, deliverability rate, open rates, recruiter reply rate, location breakdown.
  - Interactive lead explorer: Browse, search, filter, and add candidate companies manually.
  - Template and prompt editor with live preview and variable syntax highlighting.

---

## 5. STEP-BY-STEP IMPLEMENTATION INSTRUCTIONS FOR CLOUD AI

When implementing the upgrades, execute in this priority order:

### Phase 1: Database Migration & Automated Cloud Sync
1. Replace `fs.writeFileSync` in `backend/server.js` and `backend/services/inboxTracker.js` with Prisma ORM / SQLite / PostgreSQL client.
2. Define schema:
   - `Company` (`id`, `name`, `domain`, `location`, `careersEmail`, `verifiedMx`, `status`)
   - `OutreachLog` (`id`, `email`, `companyDomain`, `status`, `messageId`, `sentAt`, `bouncedAt`)
   - `CampaignConfig` (`id`, `dailyLimit`, `batchSize`, `pauseMinutes`, `isActive`)
   - `InboxMessage` (`id`, `fromEmail`, `subject`, `snippet`, `classification`, `receivedAt`)
3. Set up a single connection string (`DATABASE_URL`) so any laptop or cloud container connects to the identical live dataset.

### Phase 2: Autonomous Scheduler Daemon
1. Implement `node-cron` in `backend/server.js`:
   ```javascript
   cron.schedule('30 9 * * 1-5', () => { // Mon-Fri at 9:30 AM IST
     campaignEngine.startAutonomous({ dailyLimit: 100, batchSize: 15, pauseMinutes: 12 });
   });
   ```
2. Wrap the app with PM2 config `ecosystem.config.js` and provide a production `Dockerfile`.

### Phase 3: Telegram Notification Bot
1. Add `backend/services/telegramNotifier.js` using Telegram Bot API.
2. Hook into `inboxTracker.js` so verified HR responses trigger instant push notifications.

### Phase 4: Dynamic AI Personalization
1. Add `backend/services/aiPersonalizer.js`.
2. Generate customized 1-2 sentence contextual hooks per recipient company domain prior to dispatching.

---

## 6. SENSITIVE CREDENTIALS & RUNTIME INSTRUCTIONS
- **Environment File**: `c:\HR_EMAIL\backend\.env`
  - `GMAIL_USER=your_email@gmail.com`
  - `GMAIL_APP_PASSWORD=<16-character-app-password>`
  - `PORT=5000`
- **Starting Current Engine**:
  ```bash
  cd c:\HR_EMAIL\backend
  node server.js
  ```
- **Checking Live Engine Status**:
  `GET http://localhost:5000/api/autonomous/status`
- **Resuming Ongoing Campaign**:
  `POST http://localhost:5000/api/autonomous/resume` with `{ "immediate": true }`
