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

  // DOM Elements - Dry Run & RFC 5321 Validation Radar
  const autoDryRunCheckbox = document.getElementById('autoDryRunCheckbox');
  const manualDryRunCheckbox = document.getElementById('manualDryRunCheckbox');
  const refreshValidationStatsBtn = document.getElementById('refreshValidationStatsBtn');
  const vstatValid = document.getElementById('vstatValid');
  const vstatInvalid = document.getElementById('vstatInvalid');
  const vstatSuppressed = document.getElementById('vstatSuppressed');
  const vstatPending = document.getElementById('vstatPending');
  const vstatTempFail = document.getElementById('vstatTempFail');

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

  // Live Email Personalization Preview Elements
  const previewRecipient = document.getElementById('previewRecipient');
  const previewSubject = document.getElementById('previewSubject');
  const previewBody = document.getElementById('previewBody');
  const previewSampleTag = document.getElementById('previewSampleTag');

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
        const label = data.summary || (data.accounts ? `${data.accounts.length}/${data.totalCount || 3} Senders Active` : `Ready: ${data.user}`);
        smtpStatusBadge.querySelector('.status-text').textContent = `Ready: ${label}`;
        smtpStatusBadge.title = `Verified Accounts: ${data.user}`;
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
        updateLivePreview();

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

  // Live Email Personalization Preview Controller
  function updateLivePreview() {
    let sampleName = 'Akanksha Puri';
    let sampleCompany = 'Sourcefuse';
    let sampleEmail = 'akanksha.puri@sourcefuse.com';

    if (Array.isArray(allContacts) && allContacts.length > 0) {
      const firstValid = allContacts.find(c => c && c.email && c.name && c.company && c.name.toLowerCase() !== 'hiring manager') || allContacts[0];
      if (firstValid) {
        sampleName = firstValid.name || sampleName;
        sampleCompany = firstValid.company || sampleCompany;
        sampleEmail = firstValid.email || sampleEmail;
      }
    }

    if (previewSampleTag) {
      previewSampleTag.textContent = `Sample: ${sampleName} (${sampleCompany})`;
    }
    if (previewRecipient) {
      previewRecipient.textContent = `${sampleName} <${sampleEmail}>`;
    }
    if (previewSubject && emailSubjectInput) {
      let sub = emailSubjectInput.value
        .replace(/{{\s*name\s*}}/gi, sampleName)
        .replace(/{{\s*company\s*}}/gi, sampleCompany);
      previewSubject.textContent = sub;
    }
    if (previewBody && emailMessageInput) {
      let msg = emailMessageInput.value
        .replace(/{{\s*name\s*}}/gi, sampleName)
        .replace(/{{\s*company\s*}}/gi, sampleCompany)
        .replace(/{{\s*(sender_email|email|my_email)\s*}}/gi, 'sender@yourdomain.com [Auto-swaps to sending account]')
        .replace(/^Dear\s+Hiring\s+Manager,/i, `Dear ${sampleName},`)
        .replace(/at\s+your\s+company/gi, `at ${sampleCompany}`);
      previewBody.textContent = msg;
    }
  }

  if (emailSubjectInput) emailSubjectInput.addEventListener('input', updateLivePreview);
  if (emailMessageInput) emailMessageInput.addEventListener('input', updateLivePreview);
  if (senderNameInput) senderNameInput.addEventListener('input', updateLivePreview);

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

    const autoResumeName = document.getElementById('autoResumeNameDisplay');
    const autoResumeSize = document.getElementById('autoResumeSizeDisplay');
    if (autoResumeName) autoResumeName.textContent = file.name;
    if (autoResumeSize) autoResumeSize.textContent = `Attached from local upload (${formatBytes(file.size)})`;

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

        const autoResumeName = document.getElementById('autoResumeNameDisplay');
        const autoResumeSize = document.getElementById('autoResumeSizeDisplay');
        if (autoResumeName) autoResumeName.textContent = data.filename;
        if (autoResumeSize) autoResumeSize.textContent = `Pre-loaded from workspace root (${formatBytes(data.size)})`;

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
      updateLivePreview();
    } catch (err) {
      contactsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Error loading contacts: ${err.message}</td></tr>`;
    }
  }

  async function loadValidationStats() {
    try {
      const res = await fetch(`${API_BASE}/api/validation/stats`);
      const data = await res.json();
      if (data && data.success && data.stats) {
        const s = data.stats;
        if (vstatValid) vstatValid.textContent = s.valid || 0;
        if (vstatInvalid) vstatInvalid.textContent = s.invalid || 0;
        if (vstatSuppressed) vstatSuppressed.textContent = s.suppressed || 0;
        if (vstatPending) vstatPending.textContent = s.pendingVerification || 0;
        if (vstatTempFail) vstatTempFail.textContent = s.temporaryFailures || 0;
      }
    } catch (err) {
      console.warn('Failed to load validation stats:', err.message);
    }
  }

  if (refreshValidationStatsBtn) {
    refreshValidationStatsBtn.addEventListener('click', async () => {
      await loadValidationStats();
      showToast('RFC 5321 deliverability stats updated!', 'info');
    });
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
    const isDryRun = manualDryRunCheckbox ? manualDryRunCheckbox.checked : false;
    formData.append('dryRun', isDryRun);

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
      const mins = Math.max(0, Math.floor(status.secondsUntilNext / 60));
      const secs = Math.max(0, status.secondsUntilNext % 60);
      if (status.secondsUntilNext <= 0) {
        countdownTimer.textContent = 'Preparing...';
        if (countdownSubText) countdownSubText.textContent = '🚀 Preparing next batch candidates & verifying DNS MX...';
      } else {
        countdownTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
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
  // 13. Autonomous 100% Hands-Free AI Outreach Controller
  // -------------------------------------------------------------
  const modeAutonomousBtn = document.getElementById('modeAutonomousBtn');
  const modeManualBtn = document.getElementById('modeManualBtn');
  const modeInboxBtn = document.getElementById('modeInboxBtn');
  const modeBouncesBtn = document.getElementById('modeBouncesBtn');
  const autonomousView = document.getElementById('autonomousView');
  const manualWorkspaceGrid = document.getElementById('manualWorkspaceGrid');
  const inboxView = document.getElementById('inboxView');
  const bouncesView = document.getElementById('bouncesView');
  const autoGoToInboxBtn = document.getElementById('autoGoToInboxBtn');

  // Mode Switcher (Autonomous AI, Manual Campaign, Recruiter Responses, Bounce Cleaner)
  function switchToMode(mode) {
    if (mode === 'autonomous') {
      if (modeAutonomousBtn) modeAutonomousBtn.classList.add('active');
      if (modeManualBtn) modeManualBtn.classList.remove('active');
      if (modeInboxBtn) modeInboxBtn.classList.remove('active');
      if (modeBouncesBtn) modeBouncesBtn.classList.remove('active');
      if (autonomousView) autonomousView.classList.remove('hidden');
      if (manualWorkspaceGrid) manualWorkspaceGrid.classList.add('hidden');
      if (inboxView) inboxView.classList.add('hidden');
      if (bouncesView) bouncesView.classList.add('hidden');
    } else if (mode === 'manual') {
      if (modeManualBtn) modeManualBtn.classList.add('active');
      if (modeAutonomousBtn) modeAutonomousBtn.classList.remove('active');
      if (modeInboxBtn) modeInboxBtn.classList.remove('active');
      if (modeBouncesBtn) modeBouncesBtn.classList.remove('active');
      if (manualWorkspaceGrid) manualWorkspaceGrid.classList.remove('hidden');
      if (autonomousView) autonomousView.classList.add('hidden');
      if (inboxView) inboxView.classList.add('hidden');
      if (bouncesView) bouncesView.classList.add('hidden');
    } else if (mode === 'inbox') {
      if (modeInboxBtn) modeInboxBtn.classList.add('active');
      if (modeAutonomousBtn) modeAutonomousBtn.classList.remove('active');
      if (modeManualBtn) modeManualBtn.classList.remove('active');
      if (modeBouncesBtn) modeBouncesBtn.classList.remove('active');
      if (inboxView) inboxView.classList.remove('hidden');
      if (autonomousView) autonomousView.classList.add('hidden');
      if (manualWorkspaceGrid) manualWorkspaceGrid.classList.add('hidden');
      if (bouncesView) bouncesView.classList.add('hidden');
      loadInboxResponses();
    } else if (mode === 'bounces') {
      if (modeBouncesBtn) modeBouncesBtn.classList.add('active');
      if (modeAutonomousBtn) modeAutonomousBtn.classList.remove('active');
      if (modeManualBtn) modeManualBtn.classList.remove('active');
      if (modeInboxBtn) modeInboxBtn.classList.remove('active');
      if (bouncesView) bouncesView.classList.remove('hidden');
      if (autonomousView) autonomousView.classList.add('hidden');
      if (manualWorkspaceGrid) manualWorkspaceGrid.classList.add('hidden');
      if (inboxView) inboxView.classList.add('hidden');
      loadBounceScanner();
    }
  }

  if (modeAutonomousBtn) modeAutonomousBtn.addEventListener('click', () => switchToMode('autonomous'));
  if (modeManualBtn) modeManualBtn.addEventListener('click', () => switchToMode('manual'));
  if (modeInboxBtn) modeInboxBtn.addEventListener('click', () => switchToMode('inbox'));
  if (modeBouncesBtn) modeBouncesBtn.addEventListener('click', () => switchToMode('bounces'));
  if (autoGoToInboxBtn) autoGoToInboxBtn.addEventListener('click', () => switchToMode('inbox'));

  // Autonomous Resume Upload
  const autoChangeResumeBtn = document.getElementById('autoChangeResumeBtn');
  const autoResumeFileInput = document.getElementById('autoResumeFileInput');
  if (autoChangeResumeBtn && autoResumeFileInput) {
    autoChangeResumeBtn.addEventListener('click', () => autoResumeFileInput.click());
    autoResumeFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleResumeSelection(e.target.files[0]);
      }
    });
  }

  // Pitch Collapsible Toggle
  const autoTogglePitchBtn = document.getElementById('autoTogglePitchBtn');
  const autoPitchBody = document.getElementById('autoPitchBody');
  const autoPitchArrow = document.getElementById('autoPitchArrow');
  if (autoTogglePitchBtn && autoPitchBody && autoPitchArrow) {
    autoTogglePitchBtn.addEventListener('click', () => {
      autoPitchBody.classList.toggle('hidden');
      autoPitchArrow.classList.toggle('open');
    });
  }

  // Autonomous Form Controls
  const autoLocationSelect = document.getElementById('autoLocationSelect');
  const autoBatchSizeInput = document.getElementById('autoBatchSizeInput');
  const autoPauseMinutesSelect = document.getElementById('autoPauseMinutesSelect');
  const autoSenderName = document.getElementById('autoSenderName');
  const autoSubject = document.getElementById('autoSubject');
  const autoMessage = document.getElementById('autoMessage');

  // Autonomous Actions & Badges
  const startAutonomousBtn = document.getElementById('startAutonomousBtn');
  const startAutonomousBtnLabel = document.getElementById('startAutonomousBtnLabel');
  const pauseAutonomousBtn = document.getElementById('pauseAutonomousBtn');
  const skipBreakAutonomousBtn = document.getElementById('skipBreakAutonomousBtn');
  const stopAutonomousBtn = document.getElementById('stopAutonomousBtn');

  const autoStatusBadge = document.getElementById('autoStatusBadge');
  const autoStatusText = document.getElementById('autoStatusText');
  const autoClockCard = document.getElementById('autoClockCard');
  const autoClockTimer = document.getElementById('autoClockTimer');
  const autoClockSub = document.getElementById('autoClockSub');

  // Dual Stream Metric Displays
  const autoMetricIndiaSent = document.getElementById('autoMetricIndiaSent');
  const autoIndiaSlash = document.getElementById('autoIndiaSlash');
  const autoIndiaPct = document.getElementById('autoIndiaPct');
  const autoIndiaProgressFill = document.getElementById('autoIndiaProgressFill');
  const autoIndiaRemaining = document.getElementById('autoIndiaRemaining');
  const autoIndiaLimitBadge = document.getElementById('autoIndiaLimitBadge');

  const autoMetricForeignSent = document.getElementById('autoMetricForeignSent');
  const autoForeignSlash = document.getElementById('autoForeignSlash');
  const autoForeignPct = document.getElementById('autoForeignPct');
  const autoForeignProgressFill = document.getElementById('autoForeignProgressFill');
  const autoForeignRemaining = document.getElementById('autoForeignRemaining');
  const autoForeignLimitBadge = document.getElementById('autoForeignLimitBadge');
  const autoBatchProgressFill = document.getElementById('autoBatchProgressFill');

  // Autonomous Metric Displays
  const autoMetricSentToday = document.getElementById('autoMetricSentToday');
  const autoDailyProgressFill = document.getElementById('autoDailyProgressFill');
  const autoMetricBatchProgress = document.getElementById('autoMetricBatchProgress');
  const autoMetricBatchLimit = document.getElementById('autoMetricBatchLimit');
  const autoMetricBatchSub = document.getElementById('autoMetricBatchSub');
  const autoMetricLifetimeDelivered = document.getElementById('autoMetricLifetimeDelivered');
  const autoMetricLifetimeFiltered = document.getElementById('autoMetricLifetimeFiltered');

  // Autonomous Live Terminal
  const autoTerminalBody = document.getElementById('autoTerminalBody');
  const autoTerminalScrollCheck = document.getElementById('autoTerminalScrollCheck');
  const clearAutoTerminalBtn = document.getElementById('clearAutoTerminalBtn');

  let lastRenderedLiveLogCount = 0;

  // Start Autonomous Outreach
  if (startAutonomousBtn) {
    startAutonomousBtn.addEventListener('click', async () => {
      try {
        startAutonomousBtn.disabled = true;
        if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = 'Initializing Autonomous Engine...';

        const formData = new FormData();
        if (resumeFile) {
          formData.append('resume', resumeFile);
        }
        formData.append('senderName', (autoSenderName ? autoSenderName.value : '') || 'Ketan Tiwari');
        formData.append('subject', (autoSubject ? autoSubject.value : '') || 'Application: Software Engineering & AI Intern - Ketan Tiwari - {{company}}');
        formData.append('message', (autoMessage ? autoMessage.value : '') || '');
        formData.append('batchSize', (autoBatchSizeInput ? autoBatchSizeInput.value : '') || 60);
        formData.append('pauseMinutes', (autoPauseMinutesSelect ? autoPauseMinutesSelect.value : '') || 6);
        formData.append('location', (autoLocationSelect ? autoLocationSelect.value : '') || 'all');
        formData.append('dailyLimit', 400);
        const isDryRun = autoDryRunCheckbox ? autoDryRunCheckbox.checked : false;
        formData.append('dryRun', isDryRun);

        const res = await fetch(`${API_BASE}/api/autonomous/start`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          syncAutonomousStatus(data.status);
        } else {
          showToast(data.error || 'Failed to start autonomous engine.', 'error');
          startAutonomousBtn.disabled = false;
          if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = 'Start 100% Autonomous Outreach';
        }
      } catch (err) {
        showToast('Autonomous start failed: ' + err.message, 'error');
        startAutonomousBtn.disabled = false;
        if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = 'Start 100% Autonomous Outreach';
      }
    });
  }

  // Pause
  if (pauseAutonomousBtn) {
    pauseAutonomousBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE}/api/autonomous/pause`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('Autonomous engine paused.', 'info');
          syncAutonomousStatus(data.status);
        }
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  }

  // Skip Break & Send Now / Resume
  if (skipBreakAutonomousBtn) {
    skipBreakAutonomousBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE}/api/autonomous/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ immediate: true })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Triggering next batch immediately!', 'success');
          syncAutonomousStatus(data.status);
        }
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  }

  // Stop Engine
  if (stopAutonomousBtn) {
    stopAutonomousBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to stop the autonomous engine?')) return;
      try {
        const res = await fetch(`${API_BASE}/api/autonomous/stop`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('Autonomous engine stopped.', 'info');
          syncAutonomousStatus(data.status);
        }
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  }

  // Clear Terminal
  if (clearAutoTerminalBtn && autoTerminalBody) {
    clearAutoTerminalBtn.addEventListener('click', () => {
      autoTerminalBody.innerHTML = '<div class="terminal-line terminal-dim">[TERMINAL CLEARED] Standing by for new events...</div>';
      lastRenderedLiveLogCount = 0;
    });
  }

  // Poll Autonomous Status
  async function pollAutonomousStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/autonomous/status`);
      const status = await res.json();
      syncAutonomousStatus(status);
    } catch (e) {}
  }

  function syncAutonomousStatus(status) {
    if (!status) return;

    // 1. Status Badge & Action Controls
    if (autoStatusBadge) autoStatusBadge.className = `auto-status-badge ${status.status}`;
    const isRunning = status.status === 'running_batch';
    const isWaiting = status.status === 'waiting_pause';
    const isPaused = status.status === 'paused';
    const isLimitReached = status.status === 'daily_limit_reached';

    if (isRunning) {
      if (startAutonomousBtn) startAutonomousBtn.disabled = true;
      if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = `🚀 Running Batch ${status.currentBatch}...`;
      if (autoStatusText) autoStatusText.textContent = `Batch ${status.currentBatch}: Dispatched ${status.sentInCurrentBatch}/${status.batchSize} verified emails`;
      if (pauseAutonomousBtn) {
        pauseAutonomousBtn.classList.remove('hidden');
        pauseAutonomousBtn.textContent = '⏸️ Pause';
      }
      if (skipBreakAutonomousBtn) skipBreakAutonomousBtn.classList.add('hidden');
      if (stopAutonomousBtn) stopAutonomousBtn.classList.remove('hidden');
      if (autoClockCard) autoClockCard.classList.add('hidden');
    } else if (isWaiting) {
      if (startAutonomousBtn) startAutonomousBtn.disabled = true;
      if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = `☕ Cooldown Active (${status.pauseMinutes}m)`;
      if (autoStatusText) autoStatusText.textContent = `Batch ${status.currentBatch} Complete (${status.batchSize} sent)! Resting ${status.pauseMinutes}m...`;
      if (pauseAutonomousBtn) {
        pauseAutonomousBtn.classList.remove('hidden');
        pauseAutonomousBtn.textContent = '⏸️ Pause';
      }
      if (skipBreakAutonomousBtn) {
        skipBreakAutonomousBtn.classList.remove('hidden');
        skipBreakAutonomousBtn.textContent = `⚡ Skip Break & Send ${status.batchSize || 60} Now`;
      }
      if (stopAutonomousBtn) stopAutonomousBtn.classList.remove('hidden');
      if (autoClockCard) autoClockCard.classList.remove('hidden');

      const mins = Math.max(0, Math.floor(status.secondsUntilNext / 60));
      const secs = Math.max(0, status.secondsUntilNext % 60);
      if (status.secondsUntilNext <= 0) {
        if (autoClockTimer) autoClockTimer.textContent = '🚀 Preparing...';
        if (autoClockSub) {
          autoClockSub.textContent = `Batch cooldown finished! Autonomously fetching fresh HR leads & validating DNS... Batch ${status.currentBatch + 1 || ''} starting!`;
        }
      } else {
        if (autoClockTimer) autoClockTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        if (autoClockSub) {
          autoClockSub.textContent = `Auto-checking Gmail for bounces via IMAP... Next batch of ${status.batchSize || 60} emails will dispatch automatically.`;
        }
      }
    } else if (isPaused) {
      if (startAutonomousBtn) startAutonomousBtn.disabled = false;
      if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = 'Start 100% Autonomous Outreach';
      if (autoStatusText) autoStatusText.textContent = 'Engine Paused';
      if (pauseAutonomousBtn) pauseAutonomousBtn.classList.add('hidden');
      if (skipBreakAutonomousBtn) {
        skipBreakAutonomousBtn.classList.remove('hidden');
        skipBreakAutonomousBtn.textContent = '▶️ Resume Outreach';
      }
      if (stopAutonomousBtn) stopAutonomousBtn.classList.remove('hidden');
      if (autoClockCard) autoClockCard.classList.add('hidden');
    } else if (isLimitReached) {
      const limit = status.dailyLimit || 300;
      if (startAutonomousBtn) startAutonomousBtn.disabled = true;
      if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = `🛑 Daily Safe Cap Reached (${status.sentToday || 0}/${limit})`;
      if (autoStatusText) autoStatusText.textContent = `Daily Safe Limit Reached (${status.sentToday || 0}/${limit}) — Gmail Health Protected`;
      if (pauseAutonomousBtn) pauseAutonomousBtn.classList.add('hidden');
      if (skipBreakAutonomousBtn) skipBreakAutonomousBtn.classList.add('hidden');
      if (stopAutonomousBtn) stopAutonomousBtn.classList.add('hidden');
      if (autoClockCard) autoClockCard.classList.add('hidden');
    } else {
      // idle, completed, stopped
      if (startAutonomousBtn) startAutonomousBtn.disabled = false;
      if (startAutonomousBtnLabel) startAutonomousBtnLabel.textContent = 'Start 100% Autonomous Outreach';
      if (autoStatusText) {
        autoStatusText.textContent = status.status === 'completed'
          ? 'Directory Outreaches Completed'
          : (status.status === 'stopped' ? 'Engine Stopped' : 'Ready / Standing By');
      }
      if (pauseAutonomousBtn) pauseAutonomousBtn.classList.add('hidden');
      if (skipBreakAutonomousBtn) skipBreakAutonomousBtn.classList.add('hidden');
      if (stopAutonomousBtn) stopAutonomousBtn.classList.add('hidden');
      if (autoClockCard) autoClockCard.classList.add('hidden');
    }

    // 2. Metrics & Dual Progress Bars
    const limitIndia = status.dailyLimitIndia || 250;
    const limitForeign = status.dailyLimitForeign || 150;
    const limitTotal = status.dailyLimit || (limitIndia + limitForeign);

    const sentIndia = status.sentTodayIndia || 0;
    const sentForeign = status.sentTodayForeign || 0;
    const sentTotal = status.sentToday || (sentIndia + sentForeign);

    // India Quota Updates
    if (autoMetricIndiaSent) autoMetricIndiaSent.textContent = sentIndia;
    if (autoIndiaSlash) autoIndiaSlash.textContent = `/ ${limitIndia} sent`;
    if (autoIndiaLimitBadge) autoIndiaLimitBadge.textContent = `Daily Goal: ${limitIndia}`;
    const pctIndia = Math.min(100, Math.round((sentIndia / limitIndia) * 100));
    if (autoIndiaPct) autoIndiaPct.textContent = `${pctIndia}%`;
    if (autoIndiaProgressFill) autoIndiaProgressFill.style.width = `${pctIndia}%`;
    if (autoIndiaRemaining) autoIndiaRemaining.textContent = `${Math.max(0, limitIndia - sentIndia)} remaining`;

    // Foreign Quota Updates
    if (autoMetricForeignSent) autoMetricForeignSent.textContent = sentForeign;
    if (autoForeignSlash) autoForeignSlash.textContent = `/ ${limitForeign} sent`;
    if (autoForeignLimitBadge) autoForeignLimitBadge.textContent = `Daily Goal: ${limitForeign}`;
    const pctForeign = Math.min(100, Math.round((sentForeign / limitForeign) * 100));
    if (autoForeignPct) autoForeignPct.textContent = `${pctForeign}%`;
    if (autoForeignProgressFill) autoForeignProgressFill.style.width = `${pctForeign}%`;
    if (autoForeignRemaining) autoForeignRemaining.textContent = `${Math.max(0, limitForeign - sentForeign)} remaining`;

    // Total Daily Quota
    if (autoMetricSentToday) autoMetricSentToday.textContent = sentTotal;
    const autoDailyLimitBadge = document.getElementById('autoDailyLimitBadge');
    if (autoDailyLimitBadge) autoDailyLimitBadge.textContent = `${limitTotal} Max`;
    const autoDailySlash = document.getElementById('autoDailySlash');
    if (autoDailySlash) autoDailySlash.textContent = `/ ${limitTotal}`;
    if (autoDailyProgressFill) {
      const pct = Math.min(100, Math.round((sentTotal / limitTotal) * 100));
      autoDailyProgressFill.style.width = `${pct}%`;
    }

    // Current Batch Progress
    const curBatchSent = status.sentInCurrentBatch || 0;
    const batchTarget = status.batchSize || 60;
    if (autoMetricBatchProgress) autoMetricBatchProgress.textContent = curBatchSent;
    if (autoMetricBatchLimit) autoMetricBatchLimit.textContent = `Target: ${batchTarget}`;
    const autoMetricBatchSlash = document.getElementById('autoMetricBatchSlash');
    if (autoMetricBatchSlash) autoMetricBatchSlash.textContent = `/ ${batchTarget}`;
    if (autoBatchProgressFill) {
      const batchPct = Math.min(100, Math.round((curBatchSent / batchTarget) * 100));
      autoBatchProgressFill.style.width = `${batchPct}%`;
    }
    if (autoMetricBatchSub) {
      autoMetricBatchSub.textContent = `Batch ${status.currentBatch || 0} · ~38 🇮🇳 / ~22 🌍`;
    }
    if (autoMetricLifetimeDelivered) autoMetricLifetimeDelivered.textContent = (status.lifetimeSent || 0).toLocaleString();
    if (autoMetricLifetimeFiltered) autoMetricLifetimeFiltered.textContent = (status.lifetimeFiltered || 0).toLocaleString();

    // Update Multi-Sender Accounts Live Quotas
    if (status.activeAccounts && Array.isArray(status.activeAccounts)) {
      window.__activeSenderAccounts = status.activeAccounts.map(a => a.user).filter(Boolean);
      const quotaIds = ['quotaVal-tiwari', 'quotaVal-creative', 'quotaVal-devil', 'quotaVal-ketan181'];
      status.activeAccounts.forEach((acc, i) => {
        if (quotaIds[i]) {
          const el = document.getElementById(quotaIds[i]);
          if (el) el.textContent = acc.sentToday || 0;
        }
      });
      const autoSenderCountBadge = document.getElementById('autoSenderCountBadge');
      if (autoSenderCountBadge) {
        autoSenderCountBadge.textContent = `${status.activeAccounts.length}/${status.activeAccounts.length} Online`;
      }
    }

    // 3. Stream Live Terminal Logs
    if (status.liveLogs && status.liveLogs.length > 0) {
      renderLiveTerminalLogs(status.liveLogs);
    }
  }

  function renderLiveTerminalLogs(logs) {
    if (!autoTerminalBody) return;
    if (logs.length === lastRenderedLiveLogCount) return;
    lastRenderedLiveLogCount = logs.length;

    const html = logs.map(l => {
      const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : '';
      let tagClass = 'terminal-tag-sent';
      if (l.tag === 'VERIFY') tagClass = 'terminal-tag-verify';
      else if (l.tag === 'SKIP' || l.tag === 'SUPPRESS') tagClass = 'terminal-tag-skip';
      else if (l.tag === 'DEFER') tagClass = 'terminal-tag-break';
      else if (l.tag === 'DRY-RUN') tagClass = 'terminal-tag-verify';
      else if (l.tag === 'BREAK') tagClass = 'terminal-tag-break';
      else if (l.tag === 'SYNC') tagClass = 'terminal-tag-sync';
      else if (l.tag === 'LIMIT' || l.tag === 'FAIL' || l.tag === 'ERROR') tagClass = 'terminal-tag-limit';

      return `<div class="terminal-line"><span class="terminal-time">[${timeStr}]</span> <span class="${tagClass}">[${escapeHtml(l.tag)}]</span> ${escapeHtml(l.message)}</div>`;
    }).join('');

    autoTerminalBody.innerHTML = html;
    if (autoTerminalScrollCheck && autoTerminalScrollCheck.checked) {
      autoTerminalBody.scrollTop = autoTerminalBody.scrollHeight;
    }
  }

  // -------------------------------------------------------------
  // 14. Recruiter Response Radar & Inbox Classifier Controller
  // -------------------------------------------------------------
  const navGenuineBadge = document.getElementById('navGenuineBadge');
  const syncInboxBtn = document.getElementById('syncInboxBtn');
  const syncInboxBtnText = document.getElementById('syncInboxBtnText');
  const inboxLastSyncedLabel = document.getElementById('inboxLastSyncedLabel');
  const statGenuineCount = document.getElementById('statGenuineCount');
  const statAutomatedCount = document.getElementById('statAutomatedCount');
  const statBouncesFiltered = document.getElementById('statBouncesFiltered');
  const cardFilterGenuine = document.getElementById('cardFilterGenuine');
  const cardFilterAutomated = document.getElementById('cardFilterAutomated');
  const tabNavAll = document.getElementById('tabNavAll');
  const tabNavGenuine = document.getElementById('tabNavGenuine');
  const tabNavAutomated = document.getElementById('tabNavAutomated');
  const countBadgeAll = document.getElementById('countBadgeAll');
  const countBadgeGenuine = document.getElementById('countBadgeGenuine');
  const countBadgeAutomated = document.getElementById('countBadgeAutomated');
  const inboxSearchInput = document.getElementById('inboxSearchInput');
  const autoAlertTitle = document.getElementById('autoAlertTitle');
  const autoAlertSub = document.getElementById('autoAlertSub');

  // Unified Full-Width Email List Elements
  const singleListViewContainer = document.getElementById('singleListViewContainer');
  const responsesList = document.getElementById('responsesList');
  const inboxListSummary = document.getElementById('inboxListSummary');

  // Detail Modal Elements (Fallback)
  const inboxDetailModal = document.getElementById('inboxDetailModal');
  const closeInboxModalBtn = document.getElementById('closeInboxModalBtn');
  const modalTagPill = document.getElementById('modalTagPill');
  const modalPriorityPill = document.getElementById('modalPriorityPill');
  const modalSubject = document.getElementById('modalSubject');
  const modalCompany = document.getElementById('modalCompany');
  const modalSender = document.getElementById('modalSender');
  const modalDate = document.getElementById('modalDate');
  const modalMessageContent = document.getElementById('modalMessageContent');
  const modalCopyEmailBtn = document.getElementById('modalCopyEmailBtn');
  const modalOpenGmailBtn = document.getElementById('modalOpenGmailBtn');

  let currentInboxResponses = { genuine: [], automated: [] };
  let currentActiveInboxTab = 'all'; // Default to 'all' so all emails appear right away
  let currentActiveAccountFilter = 'all';
  let activeModalEmail = '';
  let activeExpandedCardId = null;
  let currentOpenItem = null;

  // DOM Elements for Live Large Scrollable Reader Pane
  const inboxActiveReaderPane = document.getElementById('inboxActiveReaderPane');
  const readerAccountBadge = document.getElementById('readerAccountBadge');
  const readerCategoryPill = document.getElementById('readerCategoryPill');
  const readerPriorityPill = document.getElementById('readerPriorityPill');
  const readerDate = document.getElementById('readerDate');
  const readerCompany = document.getElementById('readerCompany');
  const readerSender = document.getElementById('readerSender');
  const readerSubject = document.getElementById('readerSubject');
  const readerBodyContainer = document.getElementById('readerBodyContainer');
  const readerBodyText = document.getElementById('readerBodyText');
  const readerReplyGmailBtn = document.getElementById('readerReplyGmailBtn');
  const readerCopyEmailBtn = document.getElementById('readerCopyEmailBtn');
  const readerCopySubjectBtn = document.getElementById('readerCopySubjectBtn');
  const closeReaderPaneBtn = document.getElementById('closeReaderPaneBtn');
  const readerCloseBottomBtn = document.getElementById('readerCloseBottomBtn');

  // 5-Minute Auto-Sync State
  let isAutoSyncActive = true;
  let autoSyncRemainingSeconds = 300; // 5 minutes (300 seconds)
  let isSyncingInProgress = false;

  // DOM Elements for Pagination & Auto-Sync
  const autoSyncStatusBox = document.getElementById('autoSyncStatusBox');
  const autoSyncDot = document.getElementById('autoSyncDot');
  const autoSyncStateText = document.getElementById('autoSyncStateText');
  const autoSyncCountdownLabel = document.getElementById('autoSyncCountdownLabel');
  const toggleAutoSyncBtn = document.getElementById('toggleAutoSyncBtn');
  const toggleAutoSyncBtnText = document.getElementById('toggleAutoSyncBtnText');

  const pageRangeStart = document.getElementById('pageRangeStart');
  const pageRangeEnd = document.getElementById('pageRangeEnd');
  const pageTotalCount = document.getElementById('pageTotalCount');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pagePillsTop = document.getElementById('pagePillsTop');
  const pageSizeSelect = document.getElementById('pageSizeSelect');

  const footerCurrentPage = document.getElementById('footerCurrentPage');
  const footerTotalPages = document.getElementById('footerTotalPages');
  const footerPrevPageBtn = document.getElementById('footerPrevPageBtn');
  const footerNextPageBtn = document.getElementById('footerNextPageBtn');
  const pagePillsBottom = document.getElementById('pagePillsBottom');

  function getAccountBadgeHtml(account) {
    const acc = (account || '').toLowerCase();
    let cls = 'acc-tiwari';
    let label = (account || '').split('@')[0] || 'Sender 1';
    if (acc.includes('2') || acc.includes('creative')) {
      cls = 'acc-creative';
    } else if (acc.includes('3') || acc.includes('devil')) {
      cls = 'acc-devil';
    } else if (acc.includes('4') || acc.includes('181')) {
      cls = 'acc-ketan181';
    }
    return `<span class="badge-account-pill ${cls}">📬 ${escapeHtml(label)}</span>`;
  }

  function formatSyncTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateAutoSyncUI() {
    if (autoSyncCountdownLabel) {
      autoSyncCountdownLabel.innerHTML = `Next sync in: <strong>${formatSyncTime(autoSyncRemainingSeconds)}</strong>`;
    }
    if (autoSyncDot) {
      if (!isAutoSyncActive) {
        autoSyncDot.className = 'auto-sync-indicator dot-paused';
      } else if (isSyncingInProgress) {
        autoSyncDot.className = 'auto-sync-indicator dot-syncing';
      } else {
        autoSyncDot.className = 'auto-sync-indicator dot-active';
      }
    }
    if (autoSyncStateText) {
      if (!isAutoSyncActive) {
        autoSyncStateText.textContent = 'PAUSED';
        autoSyncStateText.className = 'auto-sync-status-text paused';
      } else if (isSyncingInProgress) {
        autoSyncStateText.textContent = 'SYNCING...';
        autoSyncStateText.className = 'auto-sync-status-text';
      } else {
        autoSyncStateText.textContent = 'ACTIVE';
        autoSyncStateText.className = 'auto-sync-status-text';
      }
    }
    if (toggleAutoSyncBtnText) {
      toggleAutoSyncBtnText.textContent = isAutoSyncActive ? '⏸️ Pause Auto-Sync' : '▶ Resume Auto-Sync';
    }
  }

  async function triggerInboxSync(isAuto = false) {
    if (isSyncingInProgress) return;
    isSyncingInProgress = true;
    updateAutoSyncUI();

    if (syncInboxBtn) syncInboxBtn.disabled = true;
    if (syncInboxBtnText) syncInboxBtnText.textContent = '⏳ Scanning All 3 Inboxes...';

    try {
      const res = await fetch(`${API_BASE}/api/inbox/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxMessages: 150 })
      });
      const json = await res.json();
      if (json.success && json.data) {
        currentInboxResponses = json.data;
        renderInboxView(json.data);
        autoSyncRemainingSeconds = 300; // Reset 5-minute countdown
        if (!isAuto) {
          showToast(json.message, 'success');
        } else {
          console.log('[AUTO-SYNC 5-MIN]', json.message);
        }
      } else {
        if (!isAuto) showToast(json.error || 'Failed to sync inboxes.', 'danger');
      }
    } catch (err) {
      console.warn('Error syncing inboxes:', err.message);
      if (!isAuto) showToast('Error syncing inboxes: ' + err.message, 'danger');
    } finally {
      isSyncingInProgress = false;
      if (syncInboxBtn) syncInboxBtn.disabled = false;
      if (syncInboxBtnText) syncInboxBtnText.textContent = '🔄 Sync All 3 Now';
      updateAutoSyncUI();
    }
  }

  // Auto-Sync 1-Second Countdown Ticker
  setInterval(() => {
    if (isAutoSyncActive && !isSyncingInProgress) {
      autoSyncRemainingSeconds--;
      if (autoSyncRemainingSeconds <= 0) {
        triggerInboxSync(true);
      } else {
        updateAutoSyncUI();
      }
    }
  }, 1000);

  if (toggleAutoSyncBtn) {
    toggleAutoSyncBtn.addEventListener('click', () => {
      isAutoSyncActive = !isAutoSyncActive;
      if (isAutoSyncActive && autoSyncRemainingSeconds <= 0) {
        autoSyncRemainingSeconds = 300;
      }
      updateAutoSyncUI();
      showToast(`5-Minute Auto-Sync is now ${isAutoSyncActive ? 'ACTIVE (scans every 5 mins)' : 'PAUSED'}`, 'info');
    });
  }

  if (syncInboxBtn) {
    syncInboxBtn.addEventListener('click', () => {
      triggerInboxSync(false);
    });
  }

  async function loadInboxResponses() {
    try {
      const res = await fetch(`${API_BASE}/api/inbox/responses`);
      const data = await res.json();
      currentInboxResponses = data;
      renderInboxView(data);
    } catch (e) {
      console.warn('Failed to load inbox responses:', e.message);
    }
  }

  function renderInboxView(data) {
    if (!data || !data.stats) return;

    // 1. Update Counter Badges on Account Switcher Pills
    const accStats = (data.stats && data.stats.accounts) ? data.stats.accounts : {};
    const accKeys = Object.keys(accStats);

    const pillCountAll = document.getElementById('pillCountAll');
    const totalAll = (data.genuine ? data.genuine.length : 0) + (data.automated ? data.automated.length : 0);
    if (pillCountAll) pillCountAll.textContent = totalAll;

    // Dynamically update the 4 account pill buttons with accurate data-account, label, and total counts
    const pillIds = ['pillCountAcc1', 'pillCountAcc2', 'pillCountAcc3', 'pillCountAcc4'];
    const pillBtns = document.querySelectorAll('#inboxAccountPills .account-pill-btn:not([data-account="all"])');
    pillBtns.forEach((btn, idx) => {
      const email = accKeys[idx];
      if (email && accStats[email]) {
        btn.setAttribute('data-account', email);
        const labelEl = btn.querySelector('.pill-text');
        if (labelEl) {
          labelEl.textContent = accStats[email].label || email.split('@')[0];
        }
        btn.title = email;
        const cntEl = document.getElementById(pillIds[idx]) || btn.querySelector('.pill-counter');
        if (cntEl) cntEl.textContent = accStats[email].totalCount || 0;
      }
    });

    // 2. Filter displayed lists based on selected sender account
    let dispGenuine = data.genuine || [];
    let dispAutomated = data.automated || [];
    if (currentActiveAccountFilter !== 'all') {
      const filterLower = currentActiveAccountFilter.toLowerCase();
      dispGenuine = dispGenuine.filter(x => {
        const acc = (x.recipientAccount || '').toLowerCase();
        return acc === filterLower || acc.includes(filterLower);
      });
      dispAutomated = dispAutomated.filter(x => {
        const acc = (x.recipientAccount || '').toLowerCase();
        return acc === filterLower || acc.includes(filterLower);
      });
    }

    const gCount = dispGenuine.length;
    const aCount = dispAutomated.length;
    const allCount = gCount + aCount;
    const bCount = data.stats.bouncesCount || 0;

    // Update Counts & Badges
    if (statGenuineCount) statGenuineCount.textContent = gCount;
    if (statAutomatedCount) statAutomatedCount.textContent = aCount;
    if (statBouncesFiltered) statBouncesFiltered.textContent = bCount;
    if (countBadgeAll) countBadgeAll.textContent = allCount;
    if (countBadgeGenuine) countBadgeGenuine.textContent = gCount;
    if (countBadgeAutomated) countBadgeAutomated.textContent = aCount;

    if (navGenuineBadge) {
      const totalGenAll = data.stats.genuineCount || 0;
      navGenuineBadge.textContent = totalGenAll > 0 ? `🎯 ${totalGenAll} Leads` : '📬 Inbox';
      navGenuineBadge.className = totalGenAll > 0 ? 'mode-tab-pill tab-pill-highlight' : 'mode-tab-pill';
    }

    if (autoAlertTitle) {
      const totalGenAll = data.stats.genuineCount || 0;
      autoAlertTitle.textContent = totalGenAll > 0 ? `🎯 ${totalGenAll} Genuine Recruiter Responses Detected!` : 'Inbox Clean & Monitored';
    }
    if (autoAlertSub) {
      if (data.genuine && data.genuine.length > 0) {
        const topCompanies = Array.from(new Set(data.genuine.map(g => g.company).filter(Boolean))).slice(0, 4);
        autoAlertSub.textContent = `Active replies received from ${topCompanies.join(', ')} & more across 4 inboxes.`;
      } else {
        autoAlertSub.textContent = 'All delivery failures and newsletter noise are automatically filtered.';
      }
    }

    if (inboxLastSyncedLabel) {
      if (data.lastSyncedAt) {
        inboxLastSyncedLabel.textContent = `Last Synced: ${new Date(data.lastSyncedAt).toLocaleTimeString()}`;
      } else {
        inboxLastSyncedLabel.textContent = 'Last Synced: Not yet synced';
      }
    }

    renderResponseCards();
  }

  function renderResponseCards() {
    const query = (inboxSearchInput ? inboxSearchInput.value : '').toLowerCase().trim();

    // Ensure single full-width list is visible
    if (singleListViewContainer) singleListViewContainer.classList.remove('hidden');

    // Update tab navigation active classes
    if (tabNavAll) tabNavAll.classList.toggle('active', currentActiveInboxTab === 'all');
    if (tabNavGenuine) tabNavGenuine.classList.toggle('active', currentActiveInboxTab === 'genuine');
    if (tabNavAutomated) tabNavAutomated.classList.toggle('active', currentActiveInboxTab === 'automated');
    if (cardFilterGenuine) cardFilterGenuine.classList.toggle('active-metric', currentActiveInboxTab === 'genuine');
    if (cardFilterAutomated) cardFilterAutomated.classList.toggle('active-metric', currentActiveInboxTab === 'automated');

    // 1. Prepare items
    const rawGenuine = (currentInboxResponses.genuine || []).map(x => ({ ...x, isGenuine: true }));
    const rawAutomated = (currentInboxResponses.automated || []).map(x => ({ ...x, isGenuine: false }));

    const filterAccount = (item) => {
      if (currentActiveAccountFilter === 'all') return true;
      const acc = (item.recipientAccount || '').toLowerCase();
      const target = currentActiveAccountFilter.toLowerCase();
      return acc === target || acc.includes(target);
    };

    const filterSearch = (item) => {
      if (!query) return true;
      const text = `${item.company || ''} ${item.senderName || ''} ${item.senderEmail || ''} ${item.subject || ''} ${item.bodySnippet || ''} ${item.recipientAccount || ''}`.toLowerCase();
      return text.includes(query);
    };

    let items = [];
    if (currentActiveInboxTab === 'genuine') {
      items = rawGenuine.filter(filterAccount).filter(filterSearch);
    } else if (currentActiveInboxTab === 'automated') {
      items = rawAutomated.filter(filterAccount).filter(filterSearch);
    } else {
      // 'all': merge genuine and automated, sort by date descending
      const combined = [...rawGenuine, ...rawAutomated].filter(filterAccount).filter(filterSearch);
      combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      items = combined;
    }

    // Update list summary text
    if (inboxListSummary) {
      const accText = currentActiveAccountFilter === 'all' ? 'across all 4 inboxes' : `for ${currentActiveAccountFilter}`;
      const tabText = currentActiveInboxTab === 'all' ? 'all' : (currentActiveInboxTab === 'genuine' ? 'genuine HR' : 'automated');
      inboxListSummary.textContent = `Showing ${items.length} ${tabText} email${items.length === 1 ? '' : 's'} ${accText}`;
    }

    if (!responsesList) return;

    if (items.length === 0) {
      let emptyMsg = 'No emails found matching your filter.';
      let switchBtn = '';
      if (currentActiveInboxTab === 'genuine') {
        const autoCount = rawAutomated.filter(filterAccount).length;
        if (autoCount > 0) {
          emptyMsg = `0 Genuine interview inquiries yet for <strong>${escapeHtml(currentActiveAccountFilter)}</strong>, but <strong>${autoCount} Auto-Replies</strong> received.`;
          switchBtn = `<button type="button" class="btn-tiny btn-accent btn-switch-auto" style="margin-top: 10px; cursor: pointer;">🤖 View ${autoCount} Auto-Replies ➔</button>`;
        }
      }
      responsesList.innerHTML = `
        <div class="inbox-empty-state" style="padding: 36px 20px; text-align: center; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.1);">
          <div style="font-size: 32px; margin-bottom: 10px;">📬</div>
          <p style="color: #cbd5e1; font-size: 14px;">${emptyMsg}</p>
          ${switchBtn}
        </div>
      `;
      const btn = responsesList.querySelector('.btn-switch-auto');
      if (btn) btn.addEventListener('click', () => switchInboxTab('automated'));
      return;
    }

    // Render full-width response cards
    responsesList.innerHTML = items.map(item => {
      const isGen = item.isGenuine;
      const isSelected = activeExpandedCardId && activeExpandedCardId === item.id;
      let cardCls = isGen ? 'genuine-card' : 'automated-card';
      if (isSelected) cardCls += ' selected-reading-card';

      let tagClass = isGen ? (item.tagType === 'warning' ? 'warning' : 'success') : 'info';
      let badgeCategoryHtml = isGen 
        ? `<span class="badge-tag-pill success">🎯 Genuine HR</span>`
        : `<span class="badge-tag-pill info">🤖 Auto-Reply</span>`;

      return `
        <div class="response-card ${cardCls}" data-id="${escapeHtml(item.id)}" title="Click to open & read complete email in the reader box above">
          <div class="response-card-top">
            <div class="response-card-badges">
              ${getAccountBadgeHtml(item.recipientAccount)}
              ${badgeCategoryHtml}
              <span class="badge-tag-pill ${tagClass}">${escapeHtml(item.tag || 'Reply')}</span>
              ${(item.actionPriority && item.actionPriority.includes('HIGH')) ? '<span class="badge-priority-pill">HIGH</span>' : ''}
              ${isSelected ? '<span class="badge-expanded-reading" style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); padding: 2px 7px; border-radius: 4px; font-weight: 700;">📖 READING NOW</span>' : ''}
            </div>
            <div class="response-card-date">${escapeHtml(item.dateFormatted || item.date)}</div>
          </div>
          <div class="response-card-company-row">
            <span class="response-card-company">${escapeHtml(item.company || 'Company')}</span>
            <span class="response-card-sender">• ${escapeHtml(item.senderName || 'Recruiter')} &lt;${escapeHtml(item.senderEmail || '')}&gt;</span>
          </div>
          <div class="response-card-subject"><strong>Subject:</strong> ${escapeHtml(item.subject || 'Application')}</div>
          <div class="response-card-snippet">${escapeHtml(item.bodySnippet || '')}</div>
          <div class="response-card-actions">
            <button type="button" class="btn-tiny btn-subtle btn-trigger-reader" data-id="${escapeHtml(item.id)}" onclick="event.stopPropagation()">📖 Read Complete Email ▾</button>
            <a href="${escapeHtml(item.gmailSearchUrl || '#')}" target="_blank" class="btn-open-gmail" onclick="event.stopPropagation()">📨 Reply in Gmail ↗</a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Live Large Scrollable Reader Pane Controller
  function openEmailInReaderPane(item) {
    if (!item) return;
    currentOpenItem = item;
    activeExpandedCardId = item.id;

    if (inboxActiveReaderPane) {
      if (readerAccountBadge) {
        readerAccountBadge.innerHTML = getAccountBadgeHtml(item.recipientAccount);
      }
      if (readerCategoryPill) {
        const isGen = item.category === 'genuine' || item.isGenuine;
        readerCategoryPill.textContent = isGen ? '🎯 Genuine HR' : '🤖 Auto-Reply';
        readerCategoryPill.className = `reader-category-pill ${isGen ? 'pill-gen' : 'pill-auto'}`;
      }
      if (readerPriorityPill) {
        if (item.actionPriority && item.actionPriority.includes('HIGH')) {
          readerPriorityPill.classList.remove('hidden');
          readerPriorityPill.textContent = item.actionPriority;
        } else {
          readerPriorityPill.classList.add('hidden');
        }
      }
      if (readerDate) readerDate.textContent = item.dateFormatted || item.date;
      if (readerCompany) readerCompany.textContent = item.company || 'Hiring Team';
      if (readerSender) readerSender.textContent = `• ${item.senderName || 'Recruiter'} <${item.senderEmail || ''}>`;
      if (readerSubject) readerSubject.textContent = item.subject || 'Application';
      if (readerBodyText) readerBodyText.textContent = item.bodySnippet || 'No message content available.';
      if (readerReplyGmailBtn) readerReplyGmailBtn.href = item.gmailSearchUrl || '#';

      inboxActiveReaderPane.classList.remove('hidden');

      // Smooth scroll reader into view
      inboxActiveReaderPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderResponseCards();
  }

  function closeReaderPane() {
    if (inboxActiveReaderPane) inboxActiveReaderPane.classList.add('hidden');
    activeExpandedCardId = null;
    currentOpenItem = null;
    renderResponseCards();
  }

  if (closeReaderPaneBtn) closeReaderPaneBtn.addEventListener('click', closeReaderPane);
  if (readerCloseBottomBtn) readerCloseBottomBtn.addEventListener('click', closeReaderPane);

  if (readerCopyEmailBtn) {
    readerCopyEmailBtn.addEventListener('click', () => {
      if (currentOpenItem && currentOpenItem.senderEmail) {
        navigator.clipboard.writeText(currentOpenItem.senderEmail).then(() => {
          showToast(`Copied ${currentOpenItem.senderEmail} to clipboard!`, 'success');
        });
      }
    });
  }

  if (readerCopySubjectBtn) {
    readerCopySubjectBtn.addEventListener('click', () => {
      if (currentOpenItem && currentOpenItem.subject) {
        navigator.clipboard.writeText(currentOpenItem.subject).then(() => {
          showToast(`Copied subject to clipboard!`, 'success');
        });
      }
    });
  }

  // Filter Switcher
  function switchInboxTab(tab) {
    currentActiveInboxTab = tab;
    renderInboxView(currentInboxResponses);
  }

  if (tabNavAll) tabNavAll.addEventListener('click', () => switchInboxTab('all'));
  if (tabNavGenuine) tabNavGenuine.addEventListener('click', () => switchInboxTab('genuine'));
  if (tabNavAutomated) tabNavAutomated.addEventListener('click', () => switchInboxTab('automated'));
  if (cardFilterGenuine) cardFilterGenuine.addEventListener('click', () => switchInboxTab('genuine'));
  if (cardFilterAutomated) cardFilterAutomated.addEventListener('click', () => switchInboxTab('automated'));

  // Account Switcher Pill Listeners
  const accountPillBtns = document.querySelectorAll('#inboxAccountPills .account-pill-btn');
  accountPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      accountPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentActiveAccountFilter = btn.getAttribute('data-account') || 'all';

      // Auto-switch to 'all' if selected account has 0 genuine but has automated replies
      if (currentActiveAccountFilter !== 'all' && currentActiveInboxTab === 'genuine') {
        const stats = (currentInboxResponses.stats && currentInboxResponses.stats.accounts) ? currentInboxResponses.stats.accounts : {};
        const accInfo = stats[currentActiveAccountFilter];
        if (accInfo && accInfo.genuineCount === 0 && accInfo.automatedCount > 0) {
          currentActiveInboxTab = 'all';
        }
      }

      renderInboxView(currentInboxResponses);
    });
  });

  if (inboxSearchInput) {
    inboxSearchInput.addEventListener('input', () => {
      renderResponseCards();
    });
  }

  // Delegated Click: Clicking ANY card opens it in the large scrollable reader pane!
  document.addEventListener('click', (e) => {
    // 1. Trigger reader button on card
    const triggerBtn = e.target.closest('.btn-trigger-reader');
    if (triggerBtn) {
      e.stopPropagation();
      const id = triggerBtn.getAttribute('data-id');
      const allItems = [...(currentInboxResponses.genuine || []), ...(currentInboxResponses.automated || [])];
      const item = allItems.find(x => x.id === id);
      if (item) openEmailInReaderPane(item);
      return;
    }

    // 2. Click directly on response card
    const card = e.target.closest('#responsesList .response-card');
    if (card) {
      const id = card.getAttribute('data-id');
      if (activeExpandedCardId === id && inboxActiveReaderPane && !inboxActiveReaderPane.classList.contains('hidden')) {
        closeReaderPane();
      } else {
        const allItems = [...(currentInboxResponses.genuine || []), ...(currentInboxResponses.automated || [])];
        const item = allItems.find(x => x.id === id);
        if (item) openEmailInReaderPane(item);
      }
      return;
    }
  });

  function openInboxDetailModal(item) {
    if (!inboxDetailModal) return;

    activeModalEmail = item.senderEmail || '';

    const modalAccountPill = document.getElementById('modalAccountPill');
    if (modalAccountPill) {
      modalAccountPill.innerHTML = getAccountBadgeHtml(item.recipientAccount);
    }

    if (modalTagPill) {
      modalTagPill.textContent = item.tag;
      modalTagPill.className = `badge-tag-pill ${item.tagType || 'accent'}`;
    }
    if (modalPriorityPill) {
      if (item.actionPriority && item.actionPriority.includes('HIGH')) {
        modalPriorityPill.classList.remove('hidden');
        modalPriorityPill.textContent = item.actionPriority;
      } else {
        modalPriorityPill.classList.add('hidden');
      }
    }
    if (modalSubject) modalSubject.textContent = item.subject;
    if (modalCompany) modalCompany.textContent = item.company || 'Company';
    if (modalSender) modalSender.textContent = `${item.senderName} <${item.senderEmail}>`;
    if (modalDate) modalDate.textContent = item.dateFormatted || item.date;
    if (modalMessageContent) modalMessageContent.textContent = item.bodySnippet || 'No text content available.';
    if (modalOpenGmailBtn) modalOpenGmailBtn.href = item.gmailSearchUrl || '#';

    inboxDetailModal.classList.remove('hidden');
  }

  if (closeInboxModalBtn) {
    closeInboxModalBtn.addEventListener('click', () => {
      if (inboxDetailModal) inboxDetailModal.classList.add('hidden');
    });
  }

  if (modalCopyEmailBtn) {
    modalCopyEmailBtn.addEventListener('click', () => {
      if (activeModalEmail) {
        navigator.clipboard.writeText(activeModalEmail).then(() => {
          showToast(`Copied ${activeModalEmail} to clipboard!`, 'success');
        });
      }
    });
  }

  if (inboxDetailModal) {
    inboxDetailModal.addEventListener('click', (e) => {
      if (e.target === inboxDetailModal) {
        inboxDetailModal.classList.add('hidden');
      }
    });
  }

  // =============================================================
  // 🧹 GMAIL INBOX BOUNCE & GHOST PURGE CONTROLLER
  // =============================================================
  let activeBounceAccount = '';
  let currentBounceData = null;
  let activeBounceTab = 'clear'; // 'clear' | 'doubt' | 'history'
  let currentSnippetItem = null;

  // DOM Elements
  const bouncesAccountPills = document.getElementById('bouncesAccountPills');
  const rescanBouncesBtn = document.getElementById('rescanBouncesBtn');
  const rescanBouncesBtnText = document.getElementById('rescanBouncesBtnText');
  const sweepSentBouncesBtn = document.getElementById('sweepSentBouncesBtn');
  const sweepSentBtnText = document.getElementById('sweepSentBtnText');
  const openPurgeModalBtn = document.getElementById('openPurgeModalBtn');
  const purgeAllBtnText = document.getElementById('purgeAllBtnText');

  const bouncesIndicationBox = document.getElementById('bouncesIndicationBox');
  const bouncesIndicationIcon = document.getElementById('bouncesIndicationIcon');
  const bouncesIndicationTitle = document.getElementById('bouncesIndicationTitle');
  const bouncesIndicationText = document.getElementById('bouncesIndicationText');
  const bouncesIndicationBadge = document.getElementById('bouncesIndicationBadge');

  const statBouncesClearCount = document.getElementById('statBouncesClearCount');
  const statBouncesDoubtCount = document.getElementById('statBouncesDoubtCount');
  const statBouncesProtectedCount = document.getElementById('statBouncesProtectedCount');
  const statBouncesTotalPurged = document.getElementById('statBouncesTotalPurged');
  const navBounceCountBadge = document.getElementById('navBounceCountBadge');

  const tabBounceClear = document.getElementById('tabBounceClear');
  const tabBounceDoubt = document.getElementById('tabBounceDoubt');
  const tabBounceHistory = document.getElementById('tabBounceHistory');
  const tabCountClear = document.getElementById('tabCountClear');
  const tabCountDoubt = document.getElementById('tabCountDoubt');
  const tabCountHistory = document.getElementById('tabCountHistory');
  const bouncesSearchInput = document.getElementById('bouncesSearchInput');

  const bouncesClearList = document.getElementById('bouncesClearList');
  const bouncesDoubtList = document.getElementById('bouncesDoubtList');
  const bouncesHistoryList = document.getElementById('bouncesHistoryList');

  // Modals
  const bouncePurgeModal = document.getElementById('bouncePurgeModal');
  const closeBouncePurgeModalBtn = document.getElementById('closeBouncePurgeModalBtn');
  const cancelBouncePurgeBtn = document.getElementById('cancelBouncePurgeBtn');
  const confirmBouncePurgeBtn = document.getElementById('confirmBouncePurgeBtn');
  const confirmBouncePurgeBtnText = document.getElementById('confirmBouncePurgeBtnText');
  const purgeModalIndicationTitle = document.getElementById('purgeModalIndicationTitle');
  const purgeModalIndicationSub = document.getElementById('purgeModalIndicationSub');
  const purgeTrashFolderLabel = document.getElementById('purgeTrashFolderLabel');
  const purgeProgressBox = document.getElementById('purgeProgressBox');
  const purgeProgressBarFill = document.getElementById('purgeProgressBarFill');
  const purgeProgressText = document.getElementById('purgeProgressText');
  const purgeProgressPercent = document.getElementById('purgeProgressPercent');

  const bounceSnippetModal = document.getElementById('bounceSnippetModal');
  const closeBounceSnippetModalBtn = document.getElementById('closeBounceSnippetModalBtn');
  const dismissSnippetModalBtn = document.getElementById('dismissSnippetModalBtn');
  const deleteFromSnippetModalBtn = document.getElementById('deleteFromSnippetModalBtn');
  const snippetModalRecipient = document.getElementById('snippetModalRecipient');
  const snippetModalReason = document.getElementById('snippetModalReason');
  const snippetModalDate = document.getElementById('snippetModalDate');
  const snippetModalBodyText = document.getElementById('snippetModalBodyText');

  // Link Recruiter Radar Bounce card directly to this cleaner deck
  const statBouncesCard = document.getElementById('statBouncesFiltered')?.closest('.inbox-metric-card');
  if (statBouncesCard) {
    statBouncesCard.classList.remove('metric-disabled');
    statBouncesCard.style.cursor = 'pointer';
    statBouncesCard.title = 'Click to open Ghost & Bounce Purge Deck';
    statBouncesCard.addEventListener('click', () => switchToMode('bounces'));
  }

  // Account selector pills
  if (bouncesAccountPills) {
    bouncesAccountPills.querySelectorAll('.account-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bouncesAccountPills.querySelectorAll('.account-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeBounceAccount = btn.getAttribute('data-account') || (window.__activeSenderAccounts && window.__activeSenderAccounts[0]) || '';
        loadBounceScanner(activeBounceAccount);
      });
    });
  }

  const clearAuditHistoryBtn = document.getElementById('clearAuditHistoryBtn');
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');

  // Tabs navigation
  function switchBounceTab(tab) {
    activeBounceTab = tab;
    [tabBounceClear, tabBounceDoubt, tabBounceHistory].forEach(t => t && t.classList.remove('active'));
    [bouncesClearList, bouncesDoubtList, bouncesHistoryList].forEach(l => l && l.classList.add('hidden'));

    if (clearAuditHistoryBtn) clearAuditHistoryBtn.classList.toggle('hidden', tab !== 'history');
    if (emptyTrashBtn) emptyTrashBtn.classList.toggle('hidden', tab !== 'history');

    if (tab === 'clear') {
      if (tabBounceClear) tabBounceClear.classList.add('active');
      if (bouncesClearList) bouncesClearList.classList.remove('hidden');
    } else if (tab === 'doubt') {
      if (tabBounceDoubt) tabBounceDoubt.classList.add('active');
      if (bouncesDoubtList) bouncesDoubtList.classList.remove('hidden');
    } else if (tab === 'history') {
      if (tabBounceHistory) tabBounceHistory.classList.add('active');
      if (bouncesHistoryList) bouncesHistoryList.classList.remove('hidden');
      loadBounceHistory();
    }
  }

  if (tabBounceClear) tabBounceClear.addEventListener('click', () => switchBounceTab('clear'));
  if (tabBounceDoubt) tabBounceDoubt.addEventListener('click', () => switchBounceTab('doubt'));
  if (tabBounceHistory) tabBounceHistory.addEventListener('click', () => switchBounceTab('history'));

  if (clearAuditHistoryBtn) {
    clearAuditHistoryBtn.addEventListener('click', async () => {
      try {
        clearAuditHistoryBtn.disabled = true;
        clearAuditHistoryBtn.textContent = '⏳ Clearing...';
        const res = await fetch('/api/bounces/history', { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Audit history log cleared successfully.', 'success');
          loadBounceHistory();
        } else {
          showToast(data.error || 'Failed to clear history', 'danger');
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'danger');
      } finally {
        clearAuditHistoryBtn.disabled = false;
        clearAuditHistoryBtn.textContent = '🗑️ Clear History Log';
      }
    });
  }

  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to permanently empty the Gmail Trash folder? This will delete all messages currently inside Trash/Bin forever.')) return;
      try {
        emptyTrashBtn.disabled = true;
        emptyTrashBtn.textContent = '⏳ Emptying Trash...';
        const res = await fetch('/api/bounces/empty-trash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account: activeBounceAccount })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gmail Trash permanently emptied!', 'success');
          loadBounceScanner(activeBounceAccount);
        } else {
          showToast(data.error || 'Failed to empty trash', 'danger');
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'danger');
      } finally {
        emptyTrashBtn.disabled = false;
        emptyTrashBtn.textContent = '🔥 Empty Gmail Trash';
      }
    });
  }

  // Sweep and clean failed sent mails from Sent Mail folder on demand
  if (sweepSentBouncesBtn) {
    sweepSentBouncesBtn.addEventListener('click', async () => {
      if (!confirm(`Bro, sweep all historical failed/bounced sent emails from Gmail Sent Mail for ${activeBounceAccount}?\n\nThis will remove orphaned threads and 'reply was deleted' messages from your Gmail. All failed records remain safely stored in your local database so our bot will never email them again.`)) {
        return;
      }
      sweepSentBouncesBtn.disabled = true;
      if (sweepSentBtnText) sweepSentBtnText.textContent = '⏳ Sweeping Sent Mail...';
      if (bouncesIndicationTitle) bouncesIndicationTitle.textContent = `Bro, sweeping Sent Mail in ${activeBounceAccount}...`;
      if (bouncesIndicationText) bouncesIndicationText.textContent = 'Searching for sent emails to historical bounced recipients...';
      if (bouncesIndicationBadge) {
        bouncesIndicationBadge.textContent = 'CLEANING SENT';
        bouncesIndicationBadge.className = 'callout-badge fill-danger';
      }

      try {
        const res = await fetch('/api/bounces/purge-sent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: activeBounceAccount,
            sweepAllHistorical: true
          })
        });
        const data = await res.json();
        if (!data.success && data.error) throw new Error(data.error);

        showToast(`🎉 Bro, moved ${data.purgedSentCount || 0} failed sent email(s) from Sent Mail to Trash in ${activeBounceAccount}!`, 'success');
        loadBounceHistory();
        loadBounceScanner(activeBounceAccount);
      } catch (err) {
        showToast(`Sent sweep failed: ${err.message}`, 'error');
      } finally {
        sweepSentBouncesBtn.disabled = false;
        if (sweepSentBtnText) sweepSentBtnText.textContent = '🧹 Clean Sent Mail';
      }
    });
  }

  // Scan bounces function
  async function loadBounceScanner(account = activeBounceAccount, { silent = false } = {}) {
    if (!silent) {
      if (rescanBouncesBtnText) rescanBouncesBtnText.textContent = '⏳ Scanning Inbox...';
      if (rescanBouncesBtn) rescanBouncesBtn.disabled = true;
      if (bouncesClearList) bouncesClearList.innerHTML = '<div class="inbox-loading-placeholder">Scanning INBOX for "Address not found" / Mail Subsystem failure emails via IMAP...</div>';
      if (bouncesIndicationTitle) bouncesIndicationTitle.textContent = `Status: Scanning ${account}...`;
      if (bouncesIndicationText) bouncesIndicationText.textContent = 'Connecting to Gmail IMAP to detect delivery failure reports...';
      if (bouncesIndicationBadge) {
        bouncesIndicationBadge.textContent = 'SCANNING';
        bouncesIndicationBadge.className = 'callout-badge';
      }
    }

    try {
      const res = await fetch(`/api/bounces/preview?account=${encodeURIComponent(account)}&previewLimit=60`);
      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      currentBounceData = data;
      renderBounceView();
      updateBounceStats();
    } catch (err) {
      console.warn('Failed to scan bounces:', err.message);
      if (bouncesClearList) {
        bouncesClearList.innerHTML = `<div class="bounces-empty-notice"><span class="empty-icon">⚠️</span><h4>Failed to scan inbox</h4><p>${err.message}</p></div>`;
      }
      if (bouncesIndicationTitle) bouncesIndicationTitle.textContent = 'Scan encountered a notice';
      if (bouncesIndicationText) bouncesIndicationText.textContent = err.message;
    } finally {
      if (rescanBouncesBtnText) rescanBouncesBtnText.textContent = '🔄 Rescan Inbox';
      if (rescanBouncesBtn) rescanBouncesBtn.disabled = false;
    }
  }

  // Update stats & user indication ("Bro, I'm deleting it")
  function updateBounceStats() {
    if (!currentBounceData) return;
    const clearCount = currentBounceData.clearToDeleteCount || 0;
    const doubtCount = currentBounceData.doubtReviewCount || 0;

    if (statBouncesClearCount) statBouncesClearCount.textContent = clearCount.toLocaleString();
    if (statBouncesDoubtCount) statBouncesDoubtCount.textContent = doubtCount.toLocaleString();
    if (tabCountClear) tabCountClear.textContent = clearCount.toLocaleString();
    if (tabCountDoubt) tabCountDoubt.textContent = doubtCount.toLocaleString();

    // Top Header Badge
    if (navBounceCountBadge) {
      navBounceCountBadge.textContent = clearCount > 0 ? `${clearCount.toLocaleString()} Bounces (Clean)` : `Inbox Clean ✅`;
    }

    // Account pill counter for active account
    const activePillCounter = document.querySelector(`.account-pill-btn[data-account="${activeBounceAccount}"] .pill-counter`);
    if (activePillCounter) {
      activePillCounter.textContent = clearCount.toLocaleString();
    }

    // Prominent Status Callout ("Bro, I'm deleting it")
    if (bouncesIndicationTitle && bouncesIndicationText && bouncesIndicationBadge) {
      if (clearCount > 0) {
        bouncesIndicationTitle.textContent = `Bro, ${clearCount.toLocaleString()} 'Address not found' failure emails detected in ${activeBounceAccount}!`;
        bouncesIndicationText.textContent = `All failed deliveries ready to move to Trash. Recruiter responses and ATS emails are 100% safe & untouched.`;
        bouncesIndicationBadge.textContent = 'READY TO PURGE';
        bouncesIndicationBadge.className = 'callout-badge';
      } else {
        bouncesIndicationTitle.textContent = `Bro, your INBOX in ${activeBounceAccount} is completely clean!`;
        bouncesIndicationText.textContent = `Zero 'Address not found' or Mail Delivery Subsystem failure emails in your inbox.`;
        bouncesIndicationBadge.textContent = 'CLEAN & SAFE';
        bouncesIndicationBadge.className = 'callout-badge tag-danger';
        bouncesIndicationBadge.style.color = '#10b981';
        bouncesIndicationBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        bouncesIndicationBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
      }
    }
  }

  // Render cards
  function renderBounceView() {
    if (!currentBounceData) return;
    const items = currentBounceData.previewItems || [];
    const doubts = currentBounceData.doubtfulItems || [];
    const query = (bouncesSearchInput ? bouncesSearchInput.value : '').toLowerCase().trim();

    // 1. Render Clear to Delete Cards
    const filteredClear = items.filter(it => {
      if (!query) return true;
      const haystack = `${it.failedRecipient} ${it.reason} ${it.snippet} ${it.subjectClean}`.toLowerCase();
      return haystack.includes(query);
    });

    if (bouncesClearList) {
      if (filteredClear.length === 0) {
        if (currentBounceData.clearToDeleteCount === 0) {
          bouncesClearList.innerHTML = `
            <div class="bounces-empty-notice">
              <span class="empty-icon">🎉</span>
              <h4>Your Inbox is Clean!</h4>
              <p>Zero "Address not found" or Mail Delivery Subsystem bounce emails in <strong>${activeBounceAccount}</strong>.</p>
            </div>`;
        } else {
          bouncesClearList.innerHTML = `
            <div class="bounces-empty-notice">
              <span class="empty-icon">🔍</span>
              <h4>No matching failure emails</h4>
              <p>No bounce emails matched your search keyword.</p>
            </div>`;
        }
      } else {
        bouncesClearList.innerHTML = filteredClear.map(it => `
          <div class="bounce-card bounce-card-danger" data-uid="${it.uid}">
            <div class="bounce-card-header">
              <div class="bounce-header-left">
                <span class="bounce-card-tag tag-danger">🔴 CLEAR TO DELETE</span>
                <span class="bounce-failed-recipient">🎯 ${escapeHtml(it.failedRecipient || 'Unknown Recipient')}</span>
              </div>
              <span class="bounce-card-date">${escapeHtml(it.dateStr || '')}</span>
            </div>
            <div class="bounce-card-body">
              <div class="bounce-meta-row">
                <span>From: <strong>${escapeHtml(it.fromClean || 'Mail Delivery Subsystem')}</strong></span>
                <span>•</span>
                <span>Subject: <strong>${escapeHtml(it.subjectClean || '')}</strong></span>
              </div>
              <div class="bounce-snippet-text">${escapeHtml(it.snippet || 'No error transcript snippet')}</div>
            </div>
            <div class="bounce-card-footer">
              <div class="bounce-reason-label">
                <span>⚡ Failure Reason:</span>
                <strong>${escapeHtml(it.reason || 'Address not found')}</strong>
              </div>
              <div class="bounce-footer-actions">
                <button type="button" class="btn-tiny btn-subtle btn-inspect-snippet" data-uid="${it.uid}">👁️ Full Diagnostic</button>
                <button type="button" class="btn-card-delete btn-single-purge" data-uid="${it.uid}" data-recipient="${escapeHtml(it.failedRecipient || '')}">🗑️ Delete to Trash</button>
              </div>
            </div>
          </div>
        `).join('');

        // Wire single purge buttons
        bouncesClearList.querySelectorAll('.btn-single-purge').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = parseInt(btn.getAttribute('data-uid'), 10);
            const recip = btn.getAttribute('data-recipient') || '';
            executeSinglePurge(uid, recip);
          });
        });

        // Wire inspect buttons
        bouncesClearList.querySelectorAll('.btn-inspect-snippet').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = parseInt(btn.getAttribute('data-uid'), 10);
            const item = items.find(i => i.uid === uid);
            if (item) openSnippetModal(item);
          });
        });
      }
    }

    // 2. Render Doubtful Cards
    if (bouncesDoubtList) {
      if (doubts.length === 0) {
        bouncesDoubtList.innerHTML = `
          <div class="bounces-empty-notice">
            <span class="empty-icon">✅</span>
            <h4>Zero Ambiguous Messages</h4>
            <p>Every scanned failure is a confirmed 100% Mail Delivery Subsystem / Postmaster bounce. Recruiter replies are completely protected.</p>
          </div>`;
      } else {
        bouncesDoubtList.innerHTML = doubts.map(it => `
          <div class="bounce-card bounce-card-doubt" data-uid="${it.uid}">
            <div class="bounce-card-header">
              <div class="bounce-header-left">
                <span class="bounce-card-tag tag-warning">⚠️ REVIEW NEEDED (DOUBTFUL)</span>
                <span class="bounce-failed-recipient">❓ ${escapeHtml(it.failedRecipient || it.fromClean || 'Unknown')}</span>
              </div>
              <span class="bounce-card-date">${escapeHtml(it.dateStr || '')}</span>
            </div>
            <div class="bounce-card-body">
              <div class="bounce-meta-row">
                <span>From: <strong>${escapeHtml(it.fromClean || '')}</strong></span>
                <span>•</span>
                <span>Subject: <strong>${escapeHtml(it.subjectClean || '')}</strong></span>
              </div>
              <div class="bounce-snippet-text">${escapeHtml(it.snippet || 'No error transcript snippet')}</div>
            </div>
            <div class="bounce-card-footer">
              <div class="bounce-reason-label" style="color: #fbbf24;">
                <span>⚠️ Note:</span>
                <strong>${escapeHtml(it.reason || 'Manual confirmation needed')}</strong>
              </div>
              <div class="bounce-footer-actions">
                <button type="button" class="btn-tiny btn-subtle btn-inspect-snippet" data-uid="${it.uid}">👁️ Inspect Snippet</button>
                <button type="button" class="btn-tiny btn-subtle btn-keep-item" data-uid="${it.uid}">🛡️ Keep in Inbox</button>
                <button type="button" class="btn-card-delete btn-single-purge" data-uid="${it.uid}" data-recipient="${escapeHtml(it.failedRecipient || '')}">🗑️ Delete to Trash</button>
              </div>
            </div>
          </div>
        `).join('');

        bouncesDoubtList.querySelectorAll('.btn-single-purge').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = parseInt(btn.getAttribute('data-uid'), 10);
            const recip = btn.getAttribute('data-recipient') || '';
            executeSinglePurge(uid, recip);
          });
        });

        bouncesDoubtList.querySelectorAll('.btn-keep-item').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.bounce-card');
            if (card) {
              card.style.opacity = '0.4';
              card.style.pointerEvents = 'none';
              showToast('Marked as Kept in Inbox.', 'info');
            }
          });
        });

        bouncesDoubtList.querySelectorAll('.btn-inspect-snippet').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = parseInt(btn.getAttribute('data-uid'), 10);
            const item = doubts.find(i => i.uid === uid);
            if (item) openSnippetModal(item);
          });
        });
      }
    }
  }

  // Search input filter
  if (bouncesSearchInput) {
    bouncesSearchInput.addEventListener('input', () => {
      renderBounceView();
    });
  }

  // Rescan button
  if (rescanBouncesBtn) {
    rescanBouncesBtn.addEventListener('click', () => {
      loadBounceScanner(activeBounceAccount);
    });
  }

  // Open Purge Modal
  if (openPurgeModalBtn) {
    openPurgeModalBtn.addEventListener('click', () => {
      const clearCount = currentBounceData ? (currentBounceData.clearToDeleteCount || 0) : 0;
      if (clearCount === 0) {
        showToast('Bro, your INBOX has zero bounce emails to delete! It is already clean.', 'info');
        return;
      }

      if (purgeModalIndicationTitle) {
        purgeModalIndicationTitle.textContent = `"Bro, I'm deleting ${clearCount.toLocaleString()} bounce emails!"`;
      }
      if (purgeModalIndicationSub) {
        purgeModalIndicationSub.innerHTML = `These failure emails will be moved directly from <strong>${activeBounceAccount}</strong> INBOX to <code id="purgeTrashFolderLabel">${currentBounceData.trashFolder || '[Gmail]/Bin'}</code>.`;
      }
      if (purgeProgressBox) purgeProgressBox.classList.add('hidden');
      if (confirmBouncePurgeBtn) confirmBouncePurgeBtn.disabled = false;
      if (confirmBouncePurgeBtnText) confirmBouncePurgeBtnText.textContent = 'Yes, Clean My Inbox Now ➔';

      if (bouncePurgeModal) bouncePurgeModal.classList.remove('hidden');
    });
  }

  // Close Purge Modal
  if (closeBouncePurgeModalBtn) closeBouncePurgeModalBtn.addEventListener('click', () => bouncePurgeModal?.classList.add('hidden'));
  if (cancelBouncePurgeBtn) cancelBouncePurgeBtn.addEventListener('click', () => bouncePurgeModal?.classList.add('hidden'));

  // Confirm Purge Execution ("Bro, I'm deleting it")
  if (confirmBouncePurgeBtn) {
    confirmBouncePurgeBtn.addEventListener('click', async () => {
      const clearCount = currentBounceData ? (currentBounceData.clearToDeleteCount || 0) : 0;
      if (confirmBouncePurgeBtn) confirmBouncePurgeBtn.disabled = true;
      if (confirmBouncePurgeBtnText) confirmBouncePurgeBtnText.textContent = '⏳ Bro, deleting bounce emails...';

      if (purgeProgressBox) purgeProgressBox.classList.remove('hidden');
      if (purgeProgressBarFill) purgeProgressBarFill.style.width = '35%';
      if (purgeProgressText) purgeProgressText.textContent = `Moving ${clearCount.toLocaleString()} failure emails to Trash via IMAP...`;
      if (purgeProgressPercent) purgeProgressPercent.textContent = '35%';

      if (bouncesIndicationTitle) bouncesIndicationTitle.textContent = `Bro, I'm deleting ${clearCount.toLocaleString()} bounce emails right now...`;
      if (bouncesIndicationText) bouncesIndicationText.textContent = `Executing IMAP UID MOVE to Trash for ${activeBounceAccount}...`;
      if (bouncesIndicationBadge) {
        bouncesIndicationBadge.textContent = 'PURGING INBOX';
        bouncesIndicationBadge.className = 'callout-badge fill-danger';
      }

      try {
        const res = await fetch('/api/bounces/purge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: activeBounceAccount,
            deleteAllConfirmed: true,
            purgeSentMail: true,
            failedRecipients: currentBounceData ? (currentBounceData.failedRecipients || []) : []
          })
        });

        const data = await res.json();
        if (!data.success && data.error) {
          throw new Error(data.error);
        }

        const inboxCount = data.purgedCount || 0;
        const sentCount = data.purgedSentCount || 0;
        const total = inboxCount + sentCount;

        if (purgeProgressBarFill) purgeProgressBarFill.style.width = '100%';
        if (purgeProgressPercent) purgeProgressPercent.textContent = '100%';
        if (purgeProgressText) {
          purgeProgressText.textContent = sentCount > 0 
            ? `Done! Moved ${inboxCount} inbox notice(s) and ${sentCount} sent email(s) to Trash.`
            : `Done! Moved ${inboxCount} emails to Trash.`;
        }

        const msg = sentCount > 0
          ? `🎉 Bro, successfully moved ${inboxCount} bounce notice(s) from INBOX and ${sentCount} original email(s) from Sent Mail to Trash! Zero trace left in Gmail.`
          : `🎉 Bro, successfully moved ${inboxCount} bounce emails to Trash! Inbox is clean.`;

        showToast(msg, 'success');

        setTimeout(() => {
          if (bouncePurgeModal) bouncePurgeModal.classList.add('hidden');
          loadBounceScanner(activeBounceAccount);
          loadBounceHistory();
        }, 1200);

      } catch (err) {
        console.error('Purge error:', err);
        showToast(`Purge failed: ${err.message}`, 'error');
        if (confirmBouncePurgeBtn) confirmBouncePurgeBtn.disabled = false;
        if (confirmBouncePurgeBtnText) confirmBouncePurgeBtnText.textContent = 'Retry Clean';
      }
    });
  }

  // Single Item Purge
  async function executeSinglePurge(uid, recipient) {
    if (!uid) return;
    const card = document.querySelector(`.bounce-card[data-uid="${uid}"]`);
    if (card) {
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';
    }

    try {
      const res = await fetch('/api/bounces/purge-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: activeBounceAccount,
          uid
        })
      });

      const data = await res.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      showToast(`Moved bounce for ${recipient || 'recipient'} to Trash!`, 'success');
      if (card) card.remove();

      // Decrement count in state
      if (currentBounceData && currentBounceData.clearToDeleteCount > 0) {
        currentBounceData.clearToDeleteCount--;
        updateBounceStats();
      }
    } catch (err) {
      showToast(`Failed to delete message: ${err.message}`, 'error');
      if (card) {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
      }
    }
  }

  // Diagnostic Snippet Modal
  function openSnippetModal(item) {
    currentSnippetItem = item;
    if (snippetModalRecipient) snippetModalRecipient.textContent = item.failedRecipient || 'Unknown Recipient';
    if (snippetModalReason) snippetModalReason.textContent = item.reason || 'Delivery Failure';
    if (snippetModalDate) snippetModalDate.textContent = item.dateStr || 'Unknown Date';
    if (snippetModalBodyText) snippetModalBodyText.textContent = item.snippet || 'No error transcript available.';

    if (bounceSnippetModal) bounceSnippetModal.classList.remove('hidden');
  }

  if (closeBounceSnippetModalBtn) closeBounceSnippetModalBtn.addEventListener('click', () => bounceSnippetModal?.classList.add('hidden'));
  if (dismissSnippetModalBtn) dismissSnippetModalBtn.addEventListener('click', () => bounceSnippetModal?.classList.add('hidden'));
  if (deleteFromSnippetModalBtn) {
    deleteFromSnippetModalBtn.addEventListener('click', () => {
      if (currentSnippetItem && currentSnippetItem.uid) {
        executeSinglePurge(currentSnippetItem.uid, currentSnippetItem.failedRecipient);
        if (bounceSnippetModal) bounceSnippetModal.classList.add('hidden');
      }
    });
  }

  // Load Audit History
  async function loadBounceHistory() {
    if (!bouncesHistoryList) return;
    try {
      const res = await fetch('/api/bounces/history');
      const data = await res.json();
      const list = data.history || [];

      if (tabCountHistory) tabCountHistory.textContent = list.length.toString();

      // Update total purged stat
      const totalPurged = list.reduce((sum, h) => sum + (h.totalPurged || (h.purgedCount || 0) + (h.purgedSentCount || 0)), 0);
      if (statBouncesTotalPurged) statBouncesTotalPurged.textContent = totalPurged.toLocaleString();

      if (list.length === 0) {
        bouncesHistoryList.innerHTML = `<div class="bounces-empty-notice"><span class="empty-icon">📋</span><h4>No Purge History Yet</h4><p>When you delete delivery failure emails, audit records will appear here.</p></div>`;
      } else {
        bouncesHistoryList.innerHTML = list.map(h => {
          const d = new Date(h.timestamp);
          const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          const folder = h.trashFolder || '[Gmail]/Bin';
          const count = h.purgedCount || 0;
          const sentCount = h.purgedSentCount || 0;

          let summaryText = '';
          if (h.action === 'purge_sent_mail') {
            summaryText = `Safely moved <strong>${sentCount}</strong> failed sent email(s) from Sent Mail (<code>${escapeHtml(h.sentFolder || '[Gmail]/Sent Mail')}</code>) into Trash.`;
          } else if (sentCount > 0) {
            summaryText = `Safely moved <strong>${count}</strong> bounce notice(s) from INBOX and <strong>${sentCount}</strong> original email(s) from Sent Mail into Trash. Zero trace left in Gmail.`;
          } else {
            summaryText = `Safely moved <strong>${count}</strong> 'Address not found' delivery failure notices from INBOX into Trash.`;
          }

          return `
            <div class="bounce-history-card">
              <div class="history-card-header">
                <div class="history-badge-group">
                  <span class="history-status-badge">
                    <span class="pulse-dot-red" style="background:#10b981; box-shadow:0 0 6px #10b981; width:5px; height:5px;"></span>
                    PURGE COMPLETED
                  </span>
                  <span class="history-account-chip">
                    <span class="pill-badge-dot" style="background: ${h.account.includes('tiwari') ? '#3b82f6' : h.account.includes('creative') ? '#10b981' : '#a855f7'}; width:6px; height:6px;"></span>
                    ${escapeHtml(h.account)}
                  </span>
                  <span class="history-folder-chip">
                    📁 ${escapeHtml(folder)}
                  </span>
                </div>
                <span class="history-timestamp">${dateFormatted} • ${timeFormatted}</span>
              </div>
              <div class="history-card-body">
                <div class="history-summary-text">
                  ${summaryText}
                </div>
                <div class="history-protection-pill">
                  🛡️ Recruiter replies & ATS: 100% untouched
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('Failed to load history:', e.message);
    }
  }

  // -------------------------------------------------------------
  // Initial Boot
  // -------------------------------------------------------------
  verifySmtpConnection();
  checkDefaultResume();
  loadSavedContacts();
  loadVaultData();
  loadValidationStats(); // Initial fetch of RFC 5321 deliverability stats
  loadInboxResponses(); // Initial fetch of recruiter responses
  loadBounceScanner(activeBounceAccount, { silent: true }); // Pre-fetch bounce count for badge
  loadBounceHistory(); // Fetch audit history
  updateManualDetectedCount();
  updateLivePreview();
  startCampaignPolling(); // Polls manual campaign
  pollAutonomousStatus(); // Initial fetch
  setInterval(pollAutonomousStatus, 1000); // 1-second live polling for autonomous engine!
  setInterval(loadValidationStats, 5000); // Keep RFC 5321 validation stats fresh every 5s!
  setInterval(loadInboxResponses, 30000); // Auto-refresh Inbox Radar responses every 30s!
});
