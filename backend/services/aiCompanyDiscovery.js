const https = require('https');
const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const SECTORS_INDIAN = [
  'Indian B2B SaaS, CRM, DevTools and Cloud Startups (Bangalore, Pune, Delhi-NCR, Hyderabad)',
  'Indian Generative AI, Computer Vision, Voice AI, RAG, and LLM Startups (Bangalore, Mumbai, Gurgaon)',
  'Top Tech Startups in Bangalore & Koramangala/HSR Layout hiring Software & AI Engineers',
  'Top Tech Startups in Mumbai & Pune hiring Software & Full Stack Engineers',
  'Top Tech Startups in Delhi-NCR, Gurgaon & Noida hiring Tech & AI Engineers',
  'Top Tech Startups in Hyderabad hiring Cloud, Backend & AI Engineers',
  'Indian FinTech, Payments, Neo-Banking and WealthTech Startups',
  'Indian HealthTech, AgriTech, Logistics & SupplyChain Tech Startups',
  'Indian Digital Engineering Studios, Custom Software Development & Cloud Consultancies (Ahmedabad, Pune, Kochi, Indore)',
  'Emerging Indian DeepTech, DroneTech, Robotics & IoT Startups (Chennai, Bangalore, Hyderabad)',
  'Indian EdTech, HRTech, LegalTech, and Workplace Automation Startups',
  'Y Combinator and Peak XV Backed Indian Early-Stage Startups (Seed & Series A)',
  'Indian Web3, Blockchain Infrastructure, and Crypto Tech Startups',
  'Indian E-Commerce Enablers, QuickCommerce Infra, and D2C Tech Platforms'
];

const SECTORS_FOREIGN = [
  'US Tech Hubs (Silicon Valley, SF Bay Area, NYC, Seattle, Austin) - Generative AI, LLMs, Agents & Cloud Startups',
  'Global 100% Remote Tech Startups Hiring Software & AI Engineers Worldwide',
  'UK & European Tech Startups (London, Berlin, Paris, Amsterdam, Stockholm) - B2B SaaS, DevTools & AI',
  'YC-Backed (Y Combinator) Tech Startups Worldwide (Recent Batches 2023-2025 hiring globally)',
  'Canadian Tech Startups (Toronto, Vancouver, Montreal, Waterloo) - AI, Enterprise Software & Cloud',
  'APAC & Singapore Tech Scaleups (Singapore, Tokyo, Sydney, Melbourne) - FinTech, AI & Cloud',
  'US Enterprise SaaS, CyberSecurity, DevSecOps and Cloud Infrastructure Startups',
  'Global AI Infrastructure, Vector DB, RAG, Open Source AI and Autonomous Agent Companies',
  'Global FinTech, WealthTech, InsurTech, Payments & Web3 Infra Startups (Worldwide / Remote)',
  'Global Developer Tooling, Observability, APIs and Engineering Workflow Startups',
  'Nordic & DACH Region Tech Startups (Sweden, Norway, Germany, Switzerland) - AI & Engineering',
  'High-Growth European Tech Scaleups hiring Remote Software Engineers'
];

const SECTORS = [...SECTORS_INDIAN, ...SECTORS_FOREIGN];

let sectorIndex = 0;
let sectorIndiaIndex = 0;
let sectorForeignIndex = 0;

// Call Mistral Chat Completion with multi-model fallback
async function callMistral(prompt, apiKey) {
  const models = ['codestral-latest', 'ministral-8b-latest', 'open-mistral-7b'];

  for (const model of models) {
    try {
      const result = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite worldwide tech talent and recruitment researcher. Output a raw JSON array of 25 to 30 REAL, OPERATING tech companies and startups. Each object in the array must strictly have: "company" (company name), "domain" (their official internet website domain name like stripe.com, datadog.com, postman.com without https or www), "email" (their actual verified recruiting or jobs email, e.g. jobs@stripe.com, careers@datadog.com, talent@postman.com, recruiting@company.com), and "type" ("Remote", "US", "Europe", "India", "Global", or "Singapore"). Provide real, authentic recruitment mailboxes. Respond with ONLY the raw JSON array, with no markdown code fences and no preamble.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5
        });

        const req = https.request({
          hostname: 'api.mistral.ai',
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 25000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices && parsed.choices[0] && parsed.choices[0].message ? parsed.choices[0].message.content : '';
                resolve(content);
              } catch (e) {
                reject(new Error('Invalid JSON from Mistral: ' + e.message));
              }
            } else {
              reject(new Error(`Mistral HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Mistral request timed out'));
        });

        req.write(payload);
        req.end();
      });

      if (result) return result;
    } catch (err) {
      console.warn(`Mistral model ${model} warning: ${err.message}. Trying next fallback...`);
    }
  }

  throw new Error('All Mistral models failed or rate-limited.');
}

// Clean and extract valid domain string
function sanitizeDomain(domainStr) {
  if (!domainStr) return null;
  let d = domainStr.toLowerCase().trim();
  d = d.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0].split('#')[0];
  d = d.replace(/[^a-z0-9.-]/g, '');
  if (!d.includes('.') || d.endsWith('.') || d.startsWith('.')) return null;
  return d;
}

// Autonomous Lead Discovery via Mistral AI - Deep Loop to fill target verified leads
async function discoverCompaniesViaMistral({ countNeeded = 50, region = 'all', onProgress = null } = {}) {
  const apiKey = (process.env.MISTRAL_API_KEY || '').trim();
  if (!apiKey) {
    if (onProgress) onProgress('AI-DISCOVER', 'Mistral API key not configured in backend/.env', 'warning');
    return [];
  }

  // Load sent_log to never contact previously emailed companies
  const sentLogPath = path.join(__dirname, '../data/sent_log.json');
  const contactedDomains = new Set();
  const contactedCompanies = new Set();
  try {
    const sentLog = JSON.parse(fs.readFileSync(sentLogPath, 'utf8') || '[]');
    sentLog.forEach(x => {
      if (x.company) {
        const c = x.company.toLowerCase().trim();
        if (c && c !== 'your team' && c !== 'your company') contactedCompanies.add(c);
      }
      if (x.email && x.email.includes('@')) {
        const p = x.email.split('@')[1];
        if (p && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(p.toLowerCase().trim())) {
          contactedDomains.add(p.toLowerCase().trim());
        }
      }
    });
  } catch (e) {}

  const directory = require('../data/company_directory');
  const existingDomains = new Set(directory.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const allVerifiedLeads = [];
  const seenInRun = new Set();
  let attempts = 0;
  const maxAttempts = 15; // Loop across up to 15 diverse sectors/niches until verified leads are gathered

  if (onProgress) {
    onProgress('AI-DISCOVER', `🎯 Mistral Target Engine: Commencing deep search to prepare ${countNeeded} verified ${region.toUpperCase()} tech HR leads...`, 'info');
  }

  while (allVerifiedLeads.length < countNeeded && attempts < maxAttempts) {
    attempts++;
    let sector = '';
    let isIndianSector = false;

    if (region === 'india') {
      sector = SECTORS_INDIAN[sectorIndiaIndex % SECTORS_INDIAN.length];
      sectorIndiaIndex++;
      isIndianSector = true;
    } else if (region === 'foreign') {
      sector = SECTORS_FOREIGN[sectorForeignIndex % SECTORS_FOREIGN.length];
      sectorForeignIndex++;
      isIndianSector = false;
    } else {
      sector = SECTORS[sectorIndex % SECTORS.length];
      sectorIndex++;
      isIndianSector = SECTORS_INDIAN.includes(sector);
    }

    if (onProgress) {
      onProgress('AI-DISCOVER', `🤖 Mistral querying [Pass ${attempts}/${maxAttempts}] (${isIndianSector ? '🇮🇳 India' : '🌍 Foreign'}) sector: ${sector} (Progress: ${allVerifiedLeads.length}/${countNeeded})...`, 'info');
    }

    const prompt = `Generate 25 real, active tech startups or software engineering companies operating in the following sector or region: "${sector}".
CRITICAL: For every company, you MUST provide their ACTUAL public hiring / recruiting email inbox (e.g. jobs@domain.com, careers@domain.com, talent@domain.com, recruiting@domain.com).
DO NOT guess or make up fake emails. ONLY provide real, publicly confirmed inboxes that companies list on their websites or job postings.
Output ONLY a valid JSON array of objects with keys: "company", "domain", "email", "type".
Example: [{"company":"Notion","domain":"notion.so","email":"jobs@notion.so","type":"Remote"}].
Ensure domain names are 100% real, operational internet domains without http or www.`;

    let rawOutput = '';
    try {
      rawOutput = await callMistral(prompt, apiKey);
    } catch (e) {
      if (onProgress) onProgress('AI-DISCOVER', `Mistral query warning: ${e.message}`, 'warning');
      continue;
    }

    // Parse JSON
    let parsed = [];
    try {
      const cleaned = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIdx = cleaned.indexOf('[');
      const endIdx = cleaned.lastIndexOf(']');
      if (startIdx >= 0 && endIdx >= 0) {
        parsed = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
      } else {
        parsed = JSON.parse(cleaned);
      }
    } catch (err) {
      continue;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) continue;

    // Filter uncontacted & unvisited domains
    const candidatesToVerify = [];
    for (const item of parsed) {
      const d = sanitizeDomain(item.domain);
      const compName = (item.company || d?.split('.')[0] || '').toLowerCase().trim();
      if (!d || existingDomains.has(d) || contactedDomains.has(d) || seenInRun.has(d)) continue;
      if (compName && compName !== 'your team' && compName !== 'your company' && contactedCompanies.has(compName)) continue;
      seenInRun.add(d);
      
      let verifiedEmail = null;
      if (item.email && typeof item.email === 'string' && item.email.includes('@')) {
        const cleanE = item.email.toLowerCase().trim();
        const emailParts = cleanE.split('@');
        const emailDomain = emailParts[1];
        if (emailDomain === d || emailDomain.endsWith(`.${d}`)) {
          verifiedEmail = cleanE;
        }
      }

      // If email was not explicitly provided or malformed, default to standard careers@ alias
      if (!verifiedEmail) {
        verifiedEmail = `careers@${d}`;
      }

      candidatesToVerify.push({
        company: item.company || d.split('.')[0].toUpperCase(),
        domain: d,
        email: verifiedEmail,
        type: item.type || (isIndianSector ? 'India' : 'Remote')
      });
    }

    if (candidatesToVerify.length === 0) continue;

    // Parallel DNS MX verification
    await Promise.all(candidatesToVerify.map(async (c) => {
      if (allVerifiedLeads.length >= countNeeded) return;
      try {
        const mx = await dns.resolveMx(c.domain);
        if (mx && mx.length > 0) {
          const isInd = (region === 'india') || (region !== 'foreign' && (isIndianSector || (c.type && /india|mumbai|pune|bangalore|bengaluru|delhi|hyderabad|chennai|noida|gurgaon|ahmedabad|kolkata/i.test(c.type)) || c.domain.endsWith('.in')));
          const detectedRegion = (region === 'foreign' || (!isInd && !isIndianSector)) ? 'foreign' : 'india';
          const lead = {
            company: c.company,
            email: c.email,
            name: `${c.company} Talent Team`,
            type: c.type,
            region: detectedRegion,
            sourceDoc: `Mistral AI (${detectedRegion === 'india' ? '🇮🇳 India' : '🌍 Foreign'} - ${c.type})`
          };
          allVerifiedLeads.push(lead);
          existingDomains.add(c.domain);
          contactedDomains.add(c.domain);
          if (c.company) contactedCompanies.add(c.company.toLowerCase().trim());

          // Add to in-memory MASTER_COMPANIES
          directory.MASTER_COMPANIES.push({
            company: c.company,
            domain: c.domain,
            type: c.type,
            region: detectedRegion
          });
        }
      } catch (e) {}
    }));

    if (onProgress) {
      onProgress('AI-DISCOVER', `📊 Progress: ${allVerifiedLeads.length}/${countNeeded} verified tech startup leads collected!`, 'info');
    }

    // Breather between calls
    await new Promise(r => setTimeout(r, 600));
  }

  if (onProgress) {
    onProgress('AI-DISCOVER', `🎯 Mistral AI completed: Successfully prepared ${allVerifiedLeads.length} brand new tech companies! Queue is now loaded.`, 'success');
  }

  return allVerifiedLeads;
}

module.exports = {
  discoverCompaniesViaMistral
};
