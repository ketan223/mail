# ⚡ Resume Blaster

A clean, full-stack automated tool for software engineers and job seekers to dispatch tailored resume PDF applications to HR and recruitment leaders individually via Gmail SMTP.

---

## 🌟 Key Features

1. **Direct Gmail SMTP Dispatch**:
   - Authenticated via secure 16-character Gmail App Password with 2-Step Verification.
   - Credentials configured safely via `backend/.env` (gitignored).

2. **Strict Frontend / Backend Separation**:
   - `/backend`: Node.js + Express + Nodemailer + Multer (PDF upload with 10MB limit and PDF-only validation).
   - `/frontend`: Plain HTML5 + CSS3 + Vanilla JavaScript (zero framework bloat).

3. **1,842 Preloaded HR Contacts from 21-Page PDF**:
   - All 1,842 recruiter names, companies, emails, and job titles from your 21-page HR contact list are structured and preloaded into `backend/data/hr_contacts.json`.
   - Real-time search and filter by company, recruiter name, or designation.
   - Quick batch pickers: **"Select Top 50"** (stay within Gmail daily limits), **"Select Top 100"**, or custom selection.

4. **Dynamic Personalization**:
   - Use `{{name}}` and `{{company}}` placeholders in your subject line and email body.
   - Automatically personalizes each email for the respective recruiter and organization with sensible fallbacks.

5. **Anti-Spam Throttling & Gmail Quota Safety**:
   - Configurable delay (default ~1.5s delay between individual emails) to avoid triggering spam filters.
   - Sends each email individually (no blind carbon copy leaks).
   - Real-time live status log showing Sent / Failed per email with error reports.
   - Export results to JSON or CSV for campaign tracking.

6. **On-the-Fly HR PDF Extractor**:
   - Drag & drop any new HR contacts PDF to parse all emails and names on the fly.

---

## 📁 Directory Structure

```
c:/HR_EMAIL/
├── .gitignore               # Root gitignore
├── README.md                # Documentation & usage guide
├── backend/
│   ├── .env                 # Gmail SMTP credentials (gitignored)
│   ├── .env.example         # Credentials template
│   ├── .gitignore
│   ├── package.json
│   ├── server.js            # Express API & Nodemailer transporter
│   └── data/
│       ├── hr_contacts.json # 1,842 parsed HR contacts database
│       └── sent_log.json    # Persistent audit trail of sent applications
└── frontend/
    ├── index.html           # High-contrast operator dashboard
    ├── styles.css           # Clean, responsive styling
    └── app.js               # Reactive state & batch dispatch logic
```

---

## 🚀 How to Run

### Step 1: Start the Backend Server
Open a terminal in `backend` and run:
```powershell
cd c:\HR_EMAIL\backend
npm start
```
*The server will start on port `5000` (or the PORT defined in `.env`).*

### Step 2: Open the Frontend Application
Open your web browser and navigate to:
```
http://localhost:5000
```
*(You can also simply double-click `c:\HR_EMAIL\frontend\index.html` directly in File Explorer).*

---

## 📋 Campaign Workflow

1. **Verify Gmail Status**: Check the top-right indicator badge. It should show a green dot with `Ready: your_email@gmail.com`.
2. **Attach Resume**: Drag & drop your PDF resume into the dropzone (10MB limit).
3. **Customize Email**:
   - Set your sender name.
   - Tailor the subject and cover message with `{{name}}` and `{{company}}` tags.
4. **Choose Recipients**:
   - **Extracted List Tab**: Browse the 1,842 HR contacts, filter by company/title, and click "Select Top 50" (recommended for safe daily quota).
   - **Manual Raw Emails Tab**: Or paste raw email addresses directly.
5. **Dispatch**: Click **"Send Resume to Selected"**.
   - Monitor the progress bar and real-time per-email dispatch log.
   - Download the export report when finished!
