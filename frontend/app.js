// Resume Blaster - Frontend Controller with Autopilot Batch Runner
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000' : '';

  // State
  let resumeFile = null;
  let hasPreloadedResume = false;
  let allContacts = [];
  let filteredContacts = [];
  let sentEmailsSet = new Set();
  let selectedContactEmails = new Set();
  let historyMap = new Map();
  let currentStatusFilter = 'pending';
  let lastHistorySyncCount = -1;
  let currentResults = [];
  let activeTab = 'extractedTab';
  let campaignPollInterval = null;

  // DOM Elements - Header & SMTP
  const smtpStatusBadge = document.getElementById('smtpStatusBadge');
  const recheckSmtpBtn = document.getElementById('recheckSmtpBtn');

  // DOM Elements - Form Fields
  const senderNameInput = document.getElementById('senderName');
  const emailSubjectInput = document.getElementById('emailSubject');
  const emailMessageInput = document.getElementById('emailMessage');

  // DOM Elements - Autopilot Controls
  const batchSizeInput = document.getElementById('batchSizeInput');
  const pauseMinutesInput = document.getElementById('pauseMinutesInput');
  const startCampaignBtn = document.getElementById('startCampaignBtn');
  const campaignBtnLabel = document.getElementById('campaignBtnLabel');
  const autopilotDeck = document.getElementById('autopilotDeck');
  const autopilotStatusBadge = document.getElementById('autopilotStatusBadge');
  const autopilotStatusText = document.getElementById('autopilotStatusText');
  const pauseCampaignBtn = document.getElementById('pauseCampaignBtn');
  const resumeCampaignBtn = document.getElementById('resumeCampaignBtn');
  const stopCampaignBtn = document.getElementById('stopCampaignBtn');
  const countdownContainer = document.getElementById('countdownContainer');
  const countdownTimer = document.getElementById('countdownTimer');
  const countdownSubText = document.getElementById('countdownSubText');
  const metricSent = document.getElementById('metricSent');
  const metricRemaining = document.getElementById('metricRemaining');
  const metricSkipped = document.getElementById('metricSkipped');
  const metricFailed = document.getElementById('metricFailed');

  // DOM Elements - Resume Dropzone
  const resumeDropzone = document.getElementById('resumeDropzone');
  const resumeFileInput = document.getElementById('resumeFileInput');
  const browseResumeBtn = document.getElementById('browseResumeBtn');
  const dropzoneEmpty = document.getElementById('dropzoneEmpty');
  const dropzoneFilled = document.getElementById('dropzoneFilled');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileSizeDisplay = document.getElementById('fileSizeDisplay');
  const removeFileBtn = document.getElementById('removeFileBtn');

  // DOM Elements - Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // DOM Elements - Extracted Contacts Table
  const contactSearchInput = document.getElementById('contactSearchInput');
  const contactsTableBody = document.getElementById('contactsTableBody');
  const masterCheckbox = document.getElementById('masterCheckbox');
  const savedCountBadge = document.getElementById('savedCountBadge');
  const selectedContactCount = document.getElementById('selectedContactCount');
  const selectFirst10Btn = document.getElementById('selectFirst10Btn');
  const selectFirst50Btn = document.getElementById('selectFirst50Btn');
  const selectFirst100Btn = document.getElementById('selectFirst100Btn');
  const selectAllFilteredBtn = document.getElementById('selectAllFilteredBtn');
  const clearSelectionBtn = document.getElementById('clearSelectionBtn');
  const transferToManualBtn = document.getElementById('transferToManualBtn');

  // DOM Elements - Manual Textarea
  const manualEmails = document.getElementById('manualEmails');
  const manualDetectedCount = document.getElementById('manualDetectedCount');
  const cleanManualBtn = document.getElementById('cleanManualBtn');
  const saveManualToDbBtn = document.getElementById('saveManualToDbBtn');

  // DOM Elements - HR PDF Dropzone
  const hrPdfDropzone = document.getElementById('hrPdfDropzone');
  const hrPdfInput = document.getElementById('hrPdfInput');
  const browseHrPdfBtn = document.getElementById('browseHrPdfBtn');
  const hrPdfDropEmpty = document.getElementById('hrPdfDropEmpty');
  const hrPdfDropFilled = document.getElementById('hrPdfDropFilled');
  const hrPdfNameDisplay = document.getElementById('hrPdfNameDisplay');
  const importStatusArea = document.getElementById('importStatusArea');
  const importStatusText = document.getElementById('importStatusText');

  // DOM Elements - Results Log & Stats
  const statSent = document.getElementById('statSent');
  const statFailed = document.getElementById('statFailed');
  const statTotal = document.getElementById('statTotal');
  const progressBarTrack = document.getElementById('progressBarTrack');
  const progressBarFill = document.getElementById('progressBarFill');
  const resultsLog = document.getElementById('resultsLog');
  const exportResultsBtn = document.getElementById('exportResultsBtn');
  const clearResultsBtn = document.getElementById('clearResultsBtn');
  const toast = document.getElementById('toast');

  // DOM Elements - Resume Auto-Extraction
  const resumeParsedBadge = document.getElementById('resumeParsedBadge');
  const parsedCandidateName = document.getElementById('parsedCandidateName');
  const parsedCandidateContact = document.getElementById('parsedCandidateContact');
  const parsedCandidateSkills = document.getElementById('parsedCandidateSkills');
  const reapplyDraftBtn = document.getElementById('reapplyDraftBtn');

  // DOM Elements - Source Document Vault
  const vaultTotalBadge = document.getElementById('vaultTotalBadge');
  const vaultTotalDelivered = document.getElementById('vaultTotalDelivered');
  const vaultTotalDocs = document.getElementById('vaultTotalDocs');
  const vaultSearchInput = document.getElementById('vaultSearchInput');
  const refreshVaultBtn = document.getElementById('refreshVaultBtn');
  const vaultListContainer = document.getElementById('vaultListContainer');

  // DOM Elements - Modular Cleanup Modal
  const cleanupModal = document.getElementById('cleanupModal');
  const cleanupClearContactsCheckbox = document.getElementById('cleanupClearContactsCheckbox');
  const cleanupClearResumeCheckbox = document.getElementById('cleanupClearResumeCheckbox');
  const cleanupDismissBtn = document.getElementById('cleanupDismissBtn');
  const cleanupConfirmBtn = document.getElementById('cleanupConfirmBtn');

  let hasPromptedCleanup = false;
  let cachedResumeDraft = null;
  let cachedVaultData = [];

  // Resume Quick Controls
  const uploadDifferentResumeBtn = document.getElementById('uploadDifferentResumeBtn');
  const changeResumeBtn = document.getElementById('changeResumeBtn');

  // Bracket Explainer Controls
  const removeBracketsBtn = document.getElementById('removeBracketsBtn');
  const restoreBracketsBtn = document.getElementById('restoreBracketsBtn');

  // Step 2 Quick HR PDF Upload Banner
  const hrPdfQuickBanner = document.getElementById('hrPdfQuickBanner');
  const quickUploadHrPdfBtn = document.getElementById('quickUploadHrPdfBtn');
  const quickHrPdfInput = document.getElementById('quickHrPdfInput');
  const quickImportStatusArea = document.getElementById('quickImportStatusArea');
  const quickImportStatusText = document.getElementById('quickImportStatusText');

  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  // -------------------------------------------------------------
  // 1. SMTP Health Check
  // -------------------------------------------------------------
  async function verifySmtpConnection() {
    smtpStatusBadge.className = 'status-indicator checking';
    smtpStatusBadge.querySelector('.status-text').textContent = 'Connecting to Gmail SMTP...';

    try {
      const res = await fetch(`${API_BASE}/api/verify-smtp`);
      const data = await res.json();

      if (data.success) {
        smtpStatusBadge.className = 'status-indicator online';
        smtpStatusBadge.querySelector('.status-text').textContent = `Ready: ${data.user}`;
      } else {
        smtpStatusBadge.className = 'status-indicator offline';
        smtpStatusBadge.querySelector('.status-text').textContent = 'SMTP Auth Failed';
        showToast(data.error || 'Failed to authenticate Gmail SMTP.', 'error');
      }
    } catch (err) {
      smtpStatusBadge.className = 'status-indicator offline';
      smtpStatusBadge.querySelector('.status-text').textContent = 'Backend Offline';
      showToast('Could not reach backend server.', 'error');
    }
  }

  recheckSmtpBtn.addEventListener('click', verifySmtpConnection);

  // -------------------------------------------------------------
  // 2. Resume Dropzone & File Handling
  // -------------------------------------------------------------
  browseResumeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resumeFileInput.click();
  });

  resumeDropzone.addEventListener('click', () => {
    if (!resumeFile) resumeFileInput.click();
  });

  resumeDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeDropzone.classList.add('dragover');
  });

  resumeDropzone.addEventListener('dragleave', () => {
    resumeDropzone.classList.remove('dragover');
  });

  resumeDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    resumeDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleResumeSelection(e.dataTransfer.files[0]);
    }
  });

  resumeFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleResumeSelection(e.target.files[0]);
    }
  });

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resumeFile = null;
    hasPreloadedResume = false;
    resumeFileInput.value = '';
    dropzoneFilled.classList.add('hidden');
    dropzoneEmpty.classList.remove('hidden');
    if (resumeParsedBadge) resumeParsedBadge.classList.add('hidden');
    cachedResumeDraft = null;
    showToast('Resume attachment removed.', 'info');
  });

  async function extractResumeProfile(file = null) {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      }

      const res = await fetch(`${API_BASE}/api/extract-resume`, {
        method: 'POST',
        body: file ? formData : undefined
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        cachedResumeDraft = data.suggested;

        // Auto-fill fields if not already typed or if new file
        if (data.suggested.senderName) {
          senderNameInput.value = data.suggested.senderName;
        }
        if (data.suggested.subject) {
          emailSubjectInput.value = data.suggested.subject;
        }
        if (data.suggested.message) {
          emailMessageInput.value = data.suggested.message;
        }

        // Show parsed badge card
        if (resumeParsedBadge) {
          if (parsedCandidateName) parsedCandidateName.textContent = data.candidate.name || 'Candidate';
          const contactParts = [];
          if (data.candidate.email) contactParts.push(data.candidate.email);
          if (data.candidate.phone) contactParts.push(data.candidate.phone);
          if (parsedCandidateContact) parsedCandidateContact.textContent = contactParts.join(' • ');

          if (parsedCandidateSkills) {
            parsedCandidateSkills.innerHTML = '';
            (data.candidate.skills || []).forEach(skill => {
              const pill = document.createElement('span');
              pill.className = 'skill-pill';
              pill.textContent = skill;
              parsedCandidateSkills.appendChild(pill);
            });
          }
          resumeParsedBadge.classList.remove('hidden');
        }

        showToast(`✨ Resume parsed for ${data.candidate.name}! Pitch auto-drafted.`, 'success');
      }
    } catch (err) {
      console.warn('Resume extraction note:', err);
    }
  }

  if (reapplyDraftBtn) {
    reapplyDraftBtn.addEventListener('click', () => {
      if (cachedResumeDraft) {
        senderNameInput.value = cachedResumeDraft.senderName || senderNameInput.value;
        emailSubjectInput.value = cachedResumeDraft.subject || emailSubjectInput.value;
        emailMessageInput.value = cachedResumeDraft.message || emailMessageInput.value;
        showToast('Auto-generated pitch re-applied to form!', 'info');
      }
    });
  }

  // Resume Quick Action Buttons
  if (uploadDifferentResumeBtn) {
    uploadDifferentResumeBtn.addEventListener('click', () => resumeFileInput.click());
  }
  if (changeResumeBtn) {
    changeResumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resumeFileInput.click();
    });
  }

  // Bracket Explainer / Clean Text Toggles
  if (removeBracketsBtn) {
    removeBracketsBtn.addEventListener('click', () => {
      const name = senderNameInput.value.trim() || 'Ketan Tiwari';
      emailSubjectInput.value = `Application: Software Engineering & AI Intern - ${name}`;
      emailMessageInput.value = `Dear Hiring Team,\n\nI hope you are doing well.\n\nI am writing to inquire about Software Engineering and AI Internship opportunities with your engineering team.\n\nI am a Full-Stack & Generative AI Engineer with hands-on experience building production-ready LLM/RAG pipelines, autonomous agentic workflows, scalable backend APIs, and modern web applications. I am keen to join your engineering team as an intern to contribute directly to impactful projects and learn from your talented engineers.\n\nPlease find my resume attached for your review. I would welcome the opportunity for a brief conversation to discuss how I can add value to your team.\n\nThank you for your time and consideration.\n\nBest regards,\n${name}\ntiwariketan045@gmail.com\n+91-9769997106`;
      showToast('Brackets removed! Plain clean generic text applied.', 'info');
    });
  }

  if (restoreBracketsBtn) {
    restoreBracketsBtn.addEventListener('click', () => {
      const name = senderNameInput.value.trim() || 'Ketan Tiwari';
      emailSubjectInput.value = `Application: Software Engineering & AI Intern - ${name} - {{company}}`;
      emailMessageInput.value = `Dear {{name}},\n\nI hope you are doing well.\n\nI am writing to inquire about Software Engineering and AI Internship opportunities at {{company}}.\n\nI am a Full-Stack & Generative AI Engineer with hands-on experience building production-ready LLM/RAG pipelines, autonomous agentic workflows, scalable backend APIs, and modern web applications. I am keen to join {{company}} as an engineering intern to contribute directly to impactful projects and learn from your talented engineering team.\n\nPlease find my resume attached for your review. I would welcome the opportunity for a brief conversation to discuss how I can add value to your team.\n\nThank you for your time and consideration.\n\nBest regards,\n${name}\ntiwariketan045@gmail.com\n+91-9769997106`;
      showToast('Dynamic tags ({{name}}, {{company}}) restored!', 'info');
    });
  }

  function handleResumeSelection(file) {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showToast('Only PDF files (.pdf) are supported.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    resumeFile = file;
    hasPreloadedResume = true;
    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = formatBytes(file.size);

    dropzoneEmpty.classList.add('hidden');
    dropzoneFilled.classList.remove('hidden');
    showToast(`Attached: ${file.name}`, 'success');

    // Auto-parse candidate details and pitch
    extractResumeProfile(file);
  }

  async function checkDefaultResume() {
    try {
      const res = await fetch(`${API_BASE}/api/default-resume`);
      const data = await res.json();
      if (data.exists) {
        fileNameDisplay.textContent = data.filename;
        fileSizeDisplay.textContent = formatBytes(data.size);
        dropzoneEmpty.classList.add('hidden');
        dropzoneFilled.classList.remove('hidden');
        hasPreloadedResume = true;
        // Auto-extract candidate profile from preloaded resume
        extractResumeProfile();
      }
    } catch (e) {}
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // -------------------------------------------------------------
  // 3. Tag Helper Buttons
  // -------------------------------------------------------------
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-insert') === 'subject' ? 'emailSubject' : 'emailMessage';
      const val = btn.getAttribute('data-val');
      const inputEl = document.getElementById(targetId);

      const start = inputEl.selectionStart || inputEl.value.length;
      const end = inputEl.selectionEnd || inputEl.value.length;
      const text = inputEl.value;

      inputEl.value = text.substring(0, start) + val + text.substring(end);
      inputEl.focus();
      inputEl.selectionStart = inputEl.selectionEnd = start + val.length;
    });
  });

  // -------------------------------------------------------------
  // 4. Tabs Navigation
  // -------------------------------------------------------------
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      document.getElementById(activeTab).classList.add('active');
      updateSendButtonCount();
      if (activeTab === 'vaultTab') {
        loadVaultData();
      }
    });
  });

  // -------------------------------------------------------------
  // 5. Contacts & Sent History Loading
  // -------------------------------------------------------------
  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      const data = await res.json();
      historyMap = new Map();
      sentEmailsSet = new Set();

      (data.history || []).forEach(item => {
        const cleanEmail = (item.email || '').toLowerCase().trim();
        if (cleanEmail) {
          historyMap.set(cleanEmail, item);
          if (item.status === 'sent') {
            sentEmailsSet.add(cleanEmail);
          }
        }
      });
      updateFilterCounts();
    } catch (e) {}
  }

  function updateFilterCounts() {
    let sentCount = 0;
    let skippedCount = 0;
    let pendingCount = 0;

    allContacts.forEach(c => {
      const cleanEmail = (c.email || '').toLowerCase().trim();
      const hist = historyMap.get(cleanEmail);
      if (hist && hist.status === 'sent') {
        sentCount++;
      } else if (hist && hist.status === 'skipped_invalid_domain') {
        skippedCount++;
      } else {
        pendingCount++;
      }
    });

    const chipAll = document.getElementById('chipAllCount');
    const chipSent = document.getElementById('chipSentCount');
    const chipSkipped = document.getElementById('chipSkippedCount');
    const chipPending = document.getElementById('chipPendingCount');

    if (chipAll) chipAll.textContent = allContacts.length;
    if (chipSent) chipSent.textContent = sentCount;
    if (chipSkipped) chipSkipped.textContent = skippedCount;
    if (chipPending) chipPending.textContent = pendingCount;
    if (savedCountBadge) savedCountBadge.textContent = pendingCount;

    // Keep Left Panel metrics 100% in sync with overall database totals
    if (metricSent) metricSent.textContent = sentCount;
    if (metricRemaining) metricRemaining.textContent = pendingCount;
    if (metricSkipped) metricSkipped.textContent = skippedCount;
    if (metricFailed) metricFailed.textContent = 0;
    if (statSent) statSent.textContent = sentCount;
    if (statFailed) statFailed.textContent = 0;
    if (statTotal) statTotal.textContent = allContacts.length;

    updateSendButtonCount();
  }

  async function loadSavedContacts() {
    try {
      await loadHistory();
      const res = await fetch(`${API_BASE}/api/contacts`);
      const data = await res.json();
      allContacts = data.contacts || [];
      updateFilterCounts();
      applyFilter();
    } catch (err) {
      contactsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Error loading contacts: ${err.message}</td></tr>`;
    }
  }

  function applyFilter() {
    const query = (contactSearchInput.value || '').trim().toLowerCase();

    filteredContacts = allContacts.filter(c => {
      const cleanEmail = (c.email || '').toLowerCase().trim();
      const hist = historyMap.get(cleanEmail);

      // Status filter check
      if (currentStatusFilter === 'sent') {
        if (!hist || hist.status !== 'sent') return false;
      } else if (currentStatusFilter === 'skipped') {
        if (!hist || hist.status !== 'skipped_invalid_domain') return false;
      } else if (currentStatusFilter === 'pending') {
        if (hist && (hist.status === 'sent' || hist.status === 'skipped_invalid_domain')) return false;
      }

      // Search query check
      if (query) {
        const matchName = c.name && c.name.toLowerCase().includes(query);
        const matchEmail = c.email && c.email.toLowerCase().includes(query);
        const matchCompany = c.company && c.company.toLowerCase().includes(query);
        const matchTitle = c.title && c.title.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchCompany && !matchTitle) return false;
      }

      return true;
    });

    renderContactsTable();
  }

  contactSearchInput.addEventListener('input', applyFilter);

  // Status Filter Chips Click Handlers
  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.getAttribute('data-status-filter') || 'all';
      applyFilter();
    });
  });

  function renderContactsTable() {
    if (filteredContacts.length === 0) {
      contactsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">No contacts found in this filter view.</td></tr>`;
      masterCheckbox.checked = false;
      return;
    }

    const rowsHtml = filteredContacts.map(c => {
      const cleanEmail = (c.email || '').toLowerCase().trim();
      const isSelected = selectedContactEmails.has(cleanEmail);
      const hist = historyMap.get(cleanEmail);

      let statusBadgeHtml = '<span class="table-status-badge pending">IN QUEUE</span>';
      let subReason = '';

      if (hist) {
        if (hist.status === 'sent') {
          statusBadgeHtml = '<span class="table-status-badge sent">SENT ✅</span>';
          if (hist.timestamp) {
            subReason = new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } else if (hist.status === 'skipped_invalid_domain') {
          statusBadgeHtml = '<span class="table-status-badge skipped">SKIPPED 🚫</span>';
          const err = hist.error || '';
          if (err.includes('550 5.1.1')) {
            subReason = 'Deactivated (550 5.1.1)';
          } else if (err.includes('MX')) {
            subReason = 'Dead Domain';
          } else {
            subReason = err.substring(0, 24);
          }
        } else if (hist.status === 'failed') {
          statusBadgeHtml = '<span class="table-status-badge failed">FAILED ⚠️</span>';
          subReason = (hist.error || 'Failed').substring(0, 24);
        }
      }

      return `
        <tr class="${isSelected ? 'selected' : ''}" data-email="${cleanEmail}">
          <td>
            <input type="checkbox" class="contact-checkbox" data-email="${cleanEmail}" ${isSelected ? 'checked' : ''}>
          </td>
          <td class="col-status">
            ${statusBadgeHtml}
            ${subReason ? `<div class="status-reason" title="${escapeHtml(hist && hist.error ? hist.error : subReason)}">${escapeHtml(subReason)}</div>` : ''}
          </td>
          <td class="col-name">
            <strong>${escapeHtml(c.name || 'Hiring Manager')}</strong>
          </td>
          <td class="col-email"><code>${escapeHtml(c.email)}</code></td>
          <td class="col-company">${escapeHtml(c.company || '—')}</td>
          <td class="col-title">${escapeHtml(c.title || '—')}</td>
        </tr>
      `;
    }).join('');

    contactsTableBody.innerHTML = rowsHtml;

    contactsTableBody.querySelectorAll('.contact-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const email = cb.getAttribute('data-email');
        if (cb.checked) {
          selectedContactEmails.add(email);
        } else {
          selectedContactEmails.delete(email);
        }
        cb.closest('tr').classList.toggle('selected', cb.checked);
        syncMasterCheckboxState();
        updateSendButtonCount();
      });
    });

    syncMasterCheckboxState();
    updateSendButtonCount();
  }

  function syncMasterCheckboxState() {
    if (filteredContacts.length === 0) {
      masterCheckbox.checked = false;
      masterCheckbox.indeterminate = false;
      return;
    }

    const selectedVisible = filteredContacts.filter(c => selectedContactEmails.has(c.email.toLowerCase())).length;
    if (selectedVisible === 0) {
      masterCheckbox.checked = false;
      masterCheckbox.indeterminate = false;
    } else if (selectedVisible === filteredContacts.length) {
      masterCheckbox.checked = true;
      masterCheckbox.indeterminate = false;
    } else {
      masterCheckbox.checked = false;
      masterCheckbox.indeterminate = true;
    }
  }

  masterCheckbox.addEventListener('change', () => {
    const check = masterCheckbox.checked;
    filteredContacts.forEach(c => {
      const email = c.email.toLowerCase();
      if (check) {
        selectedContactEmails.add(email);
      } else {
        selectedContactEmails.delete(email);
      }
    });
    renderContactsTable();
  });

  // Batch Selectors
  selectFirst10Btn.addEventListener('click', () => {
    selectedContactEmails.clear();
    const batch = filteredContacts.filter(c => !sentEmailsSet.has(c.email.toLowerCase())).slice(0, 10);
    batch.forEach(c => selectedContactEmails.add(c.email.toLowerCase()));
    renderContactsTable();
    showToast(`Selected ${batch.length} unsent contacts (Warm-up batch).`, 'info');
  });

  selectFirst50Btn.addEventListener('click', () => {
    selectedContactEmails.clear();
    const batch = filteredContacts.filter(c => !sentEmailsSet.has(c.email.toLowerCase())).slice(0, 50);
    batch.forEach(c => selectedContactEmails.add(c.email.toLowerCase()));
    renderContactsTable();
    showToast(`Selected ${batch.length} unsent contacts (Safe daily batch).`, 'info');
  });

  selectFirst100Btn.addEventListener('click', () => {
    selectedContactEmails.clear();
    const batch = filteredContacts.filter(c => !sentEmailsSet.has(c.email.toLowerCase())).slice(0, 100);
    batch.forEach(c => selectedContactEmails.add(c.email.toLowerCase()));
    renderContactsTable();
    showToast(`Selected ${batch.length} unsent contacts.`, 'info');
  });

  selectAllFilteredBtn.addEventListener('click', () => {
    filteredContacts.forEach(c => selectedContactEmails.add(c.email.toLowerCase()));
    renderContactsTable();
    showToast(`Selected all ${filteredContacts.length} contacts.`, 'info');
  });

  clearSelectionBtn.addEventListener('click', () => {
    selectedContactEmails.clear();
    renderContactsTable();
    showToast('Selection cleared.', 'info');
  });

  transferToManualBtn.addEventListener('click', () => {
    const selected = getSelectedContacts();
    if (selected.length === 0) {
      showToast('Select at least one contact to copy.', 'error');
      return;
    }
    const emailList = selected.map(c => c.email).join('\n');
    manualEmails.value = emailList;
    updateManualDetectedCount();
    tabBtns[1].click();
    showToast(`Copied ${selected.length} emails to manual editor.`, 'success');
  });

  function getSelectedContacts() {
    return allContacts.filter(c => selectedContactEmails.has(c.email.toLowerCase()));
  }

  // -------------------------------------------------------------
  // 6. Manual Textarea Handling
  // -------------------------------------------------------------
  function parseManualEmails() {
    const raw = manualEmails.value;
    const matches = raw.match(EMAIL_REGEX) || [];
    return Array.from(new Set(matches.map(e => e.toLowerCase())));
  }

  function updateManualDetectedCount() {
    const emails = parseManualEmails();
    manualDetectedCount.textContent = emails.length;
    if (activeTab === 'manualTab') {
      updateSendButtonCount();
    }
  }

  manualEmails.addEventListener('input', updateManualDetectedCount);

  cleanManualBtn.addEventListener('click', () => {
    const unique = parseManualEmails();
    manualEmails.value = unique.join('\n');
    updateManualDetectedCount();
    showToast(`Deduplicated: ${unique.length} valid email(s).`, 'info');
  });

  saveManualToDbBtn.addEventListener('click', async () => {
    const emails = parseManualEmails();
    if (emails.length === 0) {
      showToast('No valid emails to save.', 'error');
      return;
    }

    const newContacts = emails.map(email => ({
      email,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      company: '',
      title: 'Hiring Contact'
    }));

    try {
      const res = await fetch(`${API_BASE}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: newContacts, overwrite: false })
      });
      const data = await res.json();
      showToast(data.message || 'Saved contacts.', 'success');
      loadSavedContacts();
    } catch (err) {
      showToast('Failed to save contacts: ' + err.message, 'error');
    }
  });

  // -------------------------------------------------------------
  // 7. HR Contact PDF Importer
  // -------------------------------------------------------------
  browseHrPdfBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hrPdfInput.click();
  });

  hrPdfDropzone.addEventListener('click', () => {
    hrPdfInput.click();
  });

  hrPdfDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    hrPdfDropzone.classList.add('dragover');
  });

  hrPdfDropzone.addEventListener('dragleave', () => {
    hrPdfDropzone.classList.remove('dragover');
  });

  hrPdfDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    hrPdfDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleHrPdfImport(e.dataTransfer.files[0]);
    }
  });

  hrPdfInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleHrPdfImport(e.target.files[0]);
    }
  });

  // Prominent Step 2 HR PDF Quick Banner Listeners
  if (quickUploadHrPdfBtn) {
    quickUploadHrPdfBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      quickHrPdfInput.click();
    });
  }

  if (hrPdfQuickBanner) {
    hrPdfQuickBanner.addEventListener('click', (e) => {
      if (e.target !== quickUploadHrPdfBtn) {
        quickHrPdfInput.click();
      }
    });

    hrPdfQuickBanner.addEventListener('dragover', (e) => {
      e.preventDefault();
      hrPdfQuickBanner.classList.add('dragover');
    });

    hrPdfQuickBanner.addEventListener('dragleave', () => {
      hrPdfQuickBanner.classList.remove('dragover');
    });

    hrPdfQuickBanner.addEventListener('drop', (e) => {
      e.preventDefault();
      hrPdfQuickBanner.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleHrPdfImport(e.dataTransfer.files[0], quickImportStatusArea, quickImportStatusText);
      }
    });
  }

  if (quickHrPdfInput) {
    quickHrPdfInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleHrPdfImport(e.target.files[0], quickImportStatusArea, quickImportStatusText);
      }
    });
  }

  async function handleHrPdfImport(file, statusAreaEl = null, statusTextEl = null) {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showToast('Please upload a valid PDF document.', 'error');
      return;
    }

    const activeStatusArea = statusAreaEl || importStatusArea;
    const activeStatusText = statusTextEl || importStatusText;

    if (hrPdfNameDisplay) hrPdfNameDisplay.textContent = file.name;
    if (hrPdfDropEmpty) hrPdfDropEmpty.classList.add('hidden');
    if (hrPdfDropFilled) hrPdfDropFilled.classList.remove('hidden');
    if (activeStatusArea) activeStatusArea.classList.remove('hidden');
    if (activeStatusText) activeStatusText.textContent = `Parsing ${file.name}... Extracting HR contacts...`;

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch(`${API_BASE}/api/extract-contacts`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.contacts && data.contacts.length > 0) {
        if (activeStatusText) activeStatusText.textContent = `Extracted ${data.count} contacts! Database updated...`;
        showToast(`Extracted ${data.count} HR contacts! Assigned to ${data.docLabel}.`, 'success');
        await loadSavedContacts();
        await loadVaultData();
        if (tabBtns && tabBtns[0]) tabBtns[0].click();
      } else {
        showToast(data.error || 'No email contacts could be extracted from this PDF.', 'error');
      }
    } catch (err) {
      showToast('Failed to parse PDF: ' + err.message, 'error');
    } finally {
      if (activeStatusArea) activeStatusArea.classList.add('hidden');
    }
  }

  // -------------------------------------------------------------
  // 8. Count Helper & Send Button Label
  // -------------------------------------------------------------
  function updateSendButtonCount() {
    let count = 0;
    if (activeTab === 'extractedTab' || activeTab === 'importPdfTab') {
      if (selectedContactEmails.size > 0) {
        count = selectedContactEmails.size;
      } else {
        const pending = allContacts.filter(c => {
          const cleanEmail = (c.email || '').toLowerCase().trim();
          const hist = historyMap.get(cleanEmail);
          return !hist || (hist.status !== 'sent' && hist.status !== 'skipped_invalid_domain');
        });
        count = pending.length;
      }
    } else {
      count = parseManualEmails().length;
    }

    selectedContactCount.textContent = selectedContactEmails.size;
    const batchSize = batchSizeInput.value || 50;
    const pauseMins = pauseMinutesInput.value || 30;
    campaignBtnLabel.textContent = `Start Autopilot Campaign (${count} remaining / ${batchSize} per ${pauseMins}m)`;
  }

  batchSizeInput.addEventListener('input', async () => {
    updateSendButtonCount();
    try {
      const val = parseInt(batchSizeInput.value, 10);
      if (val > 0) {
        await fetch(`${API_BASE}/api/campaign/update-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchSize: val })
        });
      }
    } catch (e) {}
  });

  pauseMinutesInput.addEventListener('change', async () => {
    updateSendButtonCount();
    try {
      const val = parseInt(pauseMinutesInput.value, 10);
      if (val > 0) {
        await fetch(`${API_BASE}/api/campaign/update-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pauseMinutes: val })
        });
      }
    } catch (e) {}
  });

  // -------------------------------------------------------------
  // 9. AUTOPILOT CAMPAIGN ENGINE CONTROLS
  // -------------------------------------------------------------
  startCampaignBtn.addEventListener('click', async () => {
    if (!resumeFile && !hasPreloadedResume) {
      showToast('Please upload your Resume PDF first.', 'error');
      resumeDropzone.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const senderName = senderNameInput.value.trim();
    const subject = emailSubjectInput.value.trim();
    const message = emailMessageInput.value.trim();
    const batchSize = parseInt(batchSizeInput.value, 10) || 50;
    const pauseMinutes = parseInt(pauseMinutesInput.value, 10) || 30;

    if (!subject) {
      showToast('Please enter an email subject line.', 'error');
      emailSubjectInput.focus();
      return;
    }

    if (!message) {
      showToast('Please enter your cover email message.', 'error');
      emailMessageInput.focus();
      return;
    }

    // Determine recipients
    let recipientsList = [];
    if (activeTab === 'extractedTab' || activeTab === 'importPdfTab') {
      recipientsList = selectedContactEmails.size > 0 ? getSelectedContacts() : allContacts;
    } else {
      const rawEmails = parseManualEmails();
      recipientsList = rawEmails.map(email => ({ email }));
    }

    if (recipientsList.length === 0) {
      showToast('No recipients available to send to.', 'error');
      return;
    }

    // Confirmation
    const totalBatches = Math.ceil(recipientsList.length / batchSize);
    const confirmMsg = `Launch Autopilot Outreach Campaign?\n\n` +
      `• Total Target Contacts: ${recipientsList.length}\n` +
      `• Batch Size: ${batchSize} emails per run\n` +
      `• Auto-Pause: ${pauseMinutes} minutes between batches\n` +
      `• Intra-Email Delay: 2 - 5s (Randomized)\n` +
      `• DNS Pre-check: Active (Skips dead domains)\n` +
      `• Total Batches: ~${totalBatches}\n\n` +
      `Proceed with Autopilot?`;

    if (!confirm(confirmMsg)) return;
    hasPromptedCleanup = false;

    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    formData.append('senderName', senderName);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('batchSize', batchSize.toString());
    formData.append('pauseMinutes', pauseMinutes.toString());
    formData.append('recipients', JSON.stringify(recipientsList));

    try {
      startCampaignBtn.disabled = true;
      startCampaignBtn.textContent = 'Launching Campaign...';

      const res = await fetch(`${API_BASE}/api/campaign/start`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start campaign.');
      }

      showToast(`Autopilot launched! Running Batch 1...`, 'success');
      startCampaignPolling();
    } catch (err) {
      showToast(err.message, 'error');
      startCampaignBtn.disabled = false;
      updateSendButtonCount();
    }
  });

  // Pause Campaign
  pauseCampaignBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/campaign/pause`, { method: 'POST' });
      const data = await res.json();
      showToast('Campaign paused.', 'info');
      syncCampaignStatus(data.status);
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  // Resume Campaign
  resumeCampaignBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/campaign/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate: true })
      });
      const data = await res.json();
      showToast('Resuming next batch immediately!', 'success');
      syncCampaignStatus(data.status);
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  // Stop Campaign
  stopCampaignBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to completely stop the campaign queue?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/campaign/stop`, { method: 'POST' });
      const data = await res.json();
      showToast('Campaign stopped and queue cleared.', 'info');
      syncCampaignStatus(data.status);
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  // Polling campaign status every second
  function startCampaignPolling() {
    if (campaignPollInterval) clearInterval(campaignPollInterval);
    pollCampaignStatus();
    campaignPollInterval = setInterval(pollCampaignStatus, 1000);
  }

  async function pollCampaignStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/campaign/status`);
      const status = await res.json();
      syncCampaignStatus(status);
    } catch (e) {}
  }

  function syncCampaignStatus(status) {
    if (!status) return;

    const isActive = ['running_batch', 'waiting_pause', 'paused'].includes(status.status);

    if (isActive) {
      autopilotDeck.classList.remove('hidden');
      startCampaignBtn.disabled = true;
    } else {
      startCampaignBtn.disabled = false;
      updateSendButtonCount();
      if (status.status === 'completed' || status.status === 'stopped') {
        setTimeout(() => {
          autopilotDeck.classList.add('hidden');
        }, 5000);
      }
    }

    // Update status badge
    autopilotStatusBadge.className = `autopilot-badge ${status.status}`;
    if (status.status === 'running_batch') {
      const current = status.sentInCurrentBatch || 0;
      const target = status.batchSize || 50;
      autopilotStatusText.textContent = `Batch ${status.currentBatch}/${status.totalBatches}: Sent ${current}/${target} (Resting 30m after ${target})...`;
      pauseCampaignBtn.classList.remove('hidden');
      resumeCampaignBtn.classList.add('hidden');
      countdownContainer.classList.add('hidden');
    } else if (status.status === 'waiting_pause') {
      const bSize = status.batchSize || 50;
      autopilotStatusText.textContent = `Batch ${status.currentBatch} Done (${bSize} sent)! Resting 30 mins...`;
      pauseCampaignBtn.classList.remove('hidden');
      resumeCampaignBtn.classList.remove('hidden');
      countdownContainer.classList.remove('hidden');
      if (countdownSubText) {
        countdownSubText.textContent = `Domain pre-check will scan next ${bSize} recipients`;
      }

      // Countdown display
      const mins = Math.floor(status.secondsUntilNext / 60);
      const secs = status.secondsUntilNext % 60;
      countdownTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else if (status.status === 'paused') {
      autopilotStatusText.textContent = `Campaign Paused`;
      pauseCampaignBtn.classList.add('hidden');
      resumeCampaignBtn.classList.remove('hidden');
      countdownContainer.classList.add('hidden');
    } else if (status.status === 'completed') {
      autopilotStatusText.textContent = `Campaign Completed!`;
      pauseCampaignBtn.classList.add('hidden');
      resumeCampaignBtn.classList.add('hidden');
      countdownContainer.classList.add('hidden');
      if (!hasPromptedCleanup) {
        hasPromptedCleanup = true;
        showCleanupModal();
      }
    }

    // Update Metrics
    if (status.stats) {
      const chipSent = document.getElementById('chipSentCount');
      const chipPending = document.getElementById('chipPendingCount');
      const chipSkipped = document.getElementById('chipSkippedCount');

      const displaySent = (allContacts && allContacts.length > 0 && chipSent) ? chipSent.textContent : status.stats.sent;
      const displayRemaining = (allContacts && allContacts.length > 0 && chipPending) ? chipPending.textContent : status.remainingInQueue;
      const displaySkipped = (allContacts && allContacts.length > 0 && chipSkipped) ? chipSkipped.textContent : status.stats.skippedMx;

      metricSent.textContent = displaySent;
      metricRemaining.textContent = displayRemaining;
      metricSkipped.textContent = displaySkipped;
      metricFailed.textContent = status.stats.failed || 0;

      statSent.textContent = displaySent;
      statFailed.textContent = status.stats.failed || 0;
      statTotal.textContent = (allContacts && allContacts.length > 0) ? allContacts.length : (status.stats.sent + status.stats.failed + status.stats.skippedMx + status.remainingInQueue);

      const currentProcessed = status.stats.sent + status.stats.skippedMx + status.stats.failed;
      if (currentProcessed !== lastHistorySyncCount) {
        lastHistorySyncCount = currentProcessed;
        loadHistory().then(() => applyFilter());
      }
    }

    // Update Results Log
    if (status.recentLogs && status.recentLogs.length > 0) {
      renderResultsLog(status.recentLogs);
    }
  }

  function renderResultsLog(results) {
    if (!results || results.length === 0) return;
    exportResultsBtn.disabled = false;

    const itemsHtml = results.map(r => {
      const isSent = r.status === 'sent';
      const isSkipped = r.status === 'skipped_invalid_domain';
      const statusClass = isSent ? 'sent' : (isSkipped ? 'failed' : 'failed');
      const statusLabel = isSent ? 'SENT' : (isSkipped ? 'SKIPPED (DEAD DOMAIN)' : 'FAILED');

      return `
        <div class="log-entry ${statusClass}">
          <div>
            <div class="log-email">${escapeHtml(r.email)}</div>
            <div class="log-meta">
              ${r.name ? escapeHtml(r.name) : ''} 
              ${r.company ? '• ' + escapeHtml(r.company) : ''}
              ${r.timestamp ? '• ' + new Date(r.timestamp).toLocaleTimeString() : ''}
            </div>
            ${r.error ? `<div class="log-error-msg">${escapeHtml(r.error)}</div>` : ''}
          </div>
          <span class="log-status ${statusClass}">${statusLabel}</span>
        </div>
      `;
    }).join('');

    resultsLog.innerHTML = itemsHtml;
  }

  // Export Results
  exportResultsBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      const data = await res.json();
      const logs = data.history || [];

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `outreach_results_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      showToast('Exported outreach history.', 'success');
    } catch (e) {
      showToast('Failed to export history: ' + e.message, 'error');
    }
  });

  clearResultsBtn.addEventListener('click', () => {
    resultsLog.innerHTML = `<div class="placeholder-log">Ready to send. Results will stream here in real-time.</div>`;
  });

  // -------------------------------------------------------------
  // 10. Toast Notification Helper
  // -------------------------------------------------------------
  let toastTimer = null;
  function showToast(msg, type = 'info') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 4500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // 11. Source Document Vault Controller
  // -------------------------------------------------------------
  async function loadVaultData() {
    try {
      const res = await fetch(`${API_BASE}/api/campaign/vault`);
      const data = await res.json();
      if (!data.success) return;

      cachedVaultData = data.vault || [];
      if (vaultTotalBadge) vaultTotalBadge.textContent = data.totalDelivered || 0;
      if (vaultTotalDelivered) vaultTotalDelivered.textContent = data.totalDelivered || 0;
      if (vaultTotalDocs) vaultTotalDocs.textContent = data.totalDocuments || 0;

      const currentQuery = vaultSearchInput ? vaultSearchInput.value : '';
      renderVaultList(currentQuery);
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  }

  function renderVaultList(searchQuery = '') {
    if (!vaultListContainer) return;
    const query = searchQuery.toLowerCase().trim();

    let filtered = cachedVaultData;
    if (query) {
      filtered = cachedVaultData.map(doc => {
        const matchingContacts = (doc.contacts || []).filter(c =>
          (c.name || '').toLowerCase().includes(query) ||
          (c.company || '').toLowerCase().includes(query) ||
          (c.email || '').toLowerCase().includes(query)
        );
        const matchesDocHeader = (doc.label || '').toLowerCase().includes(query) ||
                                (doc.filename || '').toLowerCase().includes(query);
        if (matchesDocHeader) return doc;
        if (matchingContacts.length > 0) {
          return { ...doc, contacts: matchingContacts };
        }
        return null;
      }).filter(Boolean);
    }

    if (!filtered || filtered.length === 0) {
      vaultListContainer.innerHTML = '<div class="empty-state">No matching documents or delivered contacts found in vault.</div>';
      return;
    }

    vaultListContainer.innerHTML = '';

    filtered.forEach((doc, idx) => {
      const card = document.createElement('div');
      card.className = `vault-doc-card ${idx === 0 ? 'expanded' : ''}`;

      const dateStr = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'Past batch';

      const contactsCount = (doc.contacts || []).length;
      const sentCount = doc.totalSent || contactsCount;

      card.innerHTML = `
        <div class="vault-card-header">
          <span class="vault-badge">${escapeHtml(doc.label || 'PDF')}</span>
          <div class="vault-title-wrap">
            <div class="vault-doc-title">${escapeHtml(doc.filename || 'HR Document')}</div>
            <div class="vault-doc-meta">${dateStr}</div>
          </div>
          <div class="vault-card-stats">
            <span class="vault-tag-sent">✅ ${sentCount} Sent</span>
            <span class="vault-tag-companies">🏢 ${doc.uniqueCompaniesCount || 0} Companies</span>
          </div>
          <span class="vault-chevron">▼</span>
        </div>
        <div class="vault-card-body">
          <div class="vault-table-wrap">
            <table class="vault-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Recruiter Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Delivered At</th>
                </tr>
              </thead>
              <tbody>
                ${(doc.contacts || []).map(c => `
                  <tr>
                    <td><span class="table-status-badge sent">Sent</span></td>
                    <td><strong>${escapeHtml(c.name || 'Hiring Manager')}</strong></td>
                    <td class="col-mono">${escapeHtml(c.email || '')}</td>
                    <td>${escapeHtml(c.company || '—')}</td>
                    <td>${c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      const header = card.querySelector('.vault-card-header');
      header.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });

      vaultListContainer.appendChild(card);
    });
  }

  if (vaultSearchInput) {
    vaultSearchInput.addEventListener('input', (e) => {
      renderVaultList(e.target.value);
    });
  }

  if (refreshVaultBtn) {
    refreshVaultBtn.addEventListener('click', async () => {
      await loadVaultData();
      showToast('Vault refreshed!', 'info');
    });
  }

  // -------------------------------------------------------------
  // 12. Modular Post-Campaign Cleanup Modal
  // -------------------------------------------------------------
  function showCleanupModal() {
    if (cleanupModal) {
      cleanupModal.classList.remove('hidden');
    }
  }

  function hideCleanupModal() {
    if (cleanupModal) {
      cleanupModal.classList.add('hidden');
    }
  }

  if (cleanupDismissBtn) {
    cleanupDismissBtn.addEventListener('click', hideCleanupModal);
  }

  if (cleanupConfirmBtn) {
    cleanupConfirmBtn.addEventListener('click', async () => {
      const clearContacts = cleanupClearContactsCheckbox ? cleanupClearContactsCheckbox.checked : false;
      const clearResume = cleanupClearResumeCheckbox ? cleanupClearResumeCheckbox.checked : false;

      cleanupConfirmBtn.disabled = true;
      cleanupConfirmBtn.textContent = 'Cleaning Up...';

      try {
        const res = await fetch(`${API_BASE}/api/campaign/cleanup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clearContacts,
            clearResume,
            resetCampaignState: true
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Clean up completed! Ready for your next HR list.', 'success');
          if (clearContacts) {
            allContacts = [];
            selectedContactEmails.clear();
            await loadSavedContacts();
          }
          if (clearResume) {
            if (removeFileBtn) removeFileBtn.click();
          }
          await loadVaultData();
          hideCleanupModal();
        } else {
          showToast(data.error || 'Cleanup failed.', 'error');
        }
      } catch (err) {
        showToast('Cleanup failed: ' + err.message, 'error');
      } finally {
        cleanupConfirmBtn.disabled = false;
        cleanupConfirmBtn.textContent = 'Apply Clean Up';
      }
    });
  }

  // -------------------------------------------------------------
  // Initial Boot
  // -------------------------------------------------------------
  verifySmtpConnection();
  checkDefaultResume();
  loadSavedContacts();
  loadVaultData();
  updateManualDetectedCount();
  startCampaignPolling(); // Immediately syncs if campaign already running on backend!
});
