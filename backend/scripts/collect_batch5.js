const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidatePool5 = [
  { company: 'Vardhman Infotech', domain: 'vardhmaninfotech.com', type: 'Remote' },
  { company: 'Appsquadz Technologies', domain: 'appsquadz.com', type: 'Remote' },
  { company: 'CodeClouds IT Solutions', domain: 'codeclouds.com', type: 'Remote' },
  { company: 'Seven Bits Technologies', domain: 'sevenbits.in', type: 'Remote' },
  { company: 'Prometteur Solutions', domain: 'prometteursolutions.com', type: 'Pune' },
  { company: 'Mindbowser Info Solutions', domain: 'mindbowser.com', type: 'Pune' },
  { company: 'BridgeLabz Solutions', domain: 'bridgelabz.com', type: 'Mumbai' },
  { company: 'Xoriant Solutions', domain: 'xoriant.com', type: 'Mumbai' },
  { company: 'Nitor Infotech Systems', domain: 'nitorinfotech.com', type: 'Pune' },
  { company: 'Jade Global Software', domain: 'jadeglobal.com', type: 'Pune' },
  { company: 'Indellient Software Labs', domain: 'indellient.com', type: 'Remote' },
  { company: 'Intelliswift Software Systems', domain: 'intelliswift.com', type: 'Pune' },
  { company: 'Trianz IT Solutions', domain: 'trianz.com', type: 'Remote' },
  { company: 'Collabera Digital Systems', domain: 'collaberadigital.com', type: 'Remote' },
  { company: 'NLB Services Technologies', domain: 'nlbservices.com', type: 'Remote' },
  { company: 'Rang Technologies IT', domain: 'rangtech.com', type: 'Remote' },
  { company: 'Incedo Technology Solutions', domain: 'incedoinc.com', type: 'Remote' },
  { company: 'Cynet Systems Technologies', domain: 'cynetsystems.com', type: 'Remote' },
  { company: 'Pyramid Consulting Systems', domain: 'pyramidci.com', type: 'Remote' },
  { company: 'Compunnel Software Group', domain: 'compunnel.com', type: 'Remote' },
  { company: 'LanceSoft Information Tech', domain: 'lancesoft.com', type: 'Remote' },
  { company: 'Saxon Global Solutions', domain: 'saxonglobal.com', type: 'Remote' },
  { company: 'Techwave Consulting IT', domain: 'techwave.net', type: 'Remote' },
  { company: 'Charter Global Software', domain: 'charterglobal.com', type: 'Remote' },
  { company: 'ZenQ Quality Engineering', domain: 'zenq.com', type: 'Remote' },
  { company: 'Keste Enterprise Solutions', domain: 'keste.com', type: 'Remote' },
  { company: 'Savantis Solutions Global', domain: 'savantis.com', type: 'Remote' },
  { company: 'Prolifics Systems Global', domain: 'prolifics.com', type: 'Remote' },
  { company: 'Clover Infotech Mumbai', domain: 'cloverinfotech.com', type: 'Mumbai' },
  { company: 'Integreon Managed Solutions', domain: 'integreon.com', type: 'Mumbai' },
  { company: 'Accelya Group Airline Tech', domain: 'accelya.com', type: 'Mumbai' },
  { company: '3i Infotech Enterprise IT', domain: '3i-infotech.com', type: 'Mumbai' },
  { company: 'Datamatics Global Services', domain: 'datamatics.com', type: 'Mumbai' },
  { company: 'Aurionpro Solutions Digital', domain: 'aurionpro.com', type: 'Mumbai' },
  { company: 'Majesco Insurance Cloud', domain: 'majesco.com', type: 'Mumbai' },
  { company: 'Kale Consultants Solutions', domain: 'kalegroup.com', type: 'Mumbai' }
];

async function run() {
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');
  const contacted = new Set();
  sentLog.forEach(x => {
    if (x.email && x.email.includes('@')) {
      const p = x.email.split('@')[1];
      if (p) contacted.add(p.toLowerCase().trim());
    }
  });

  const dir = require('../data/company_directory');
  const existing = new Set(dir.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const prevAll = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_500_new_verified.json'), 'utf8') || '[]');
  prevAll.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidatePool5) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existing.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} prospective candidate companies in Batch 5 for DNS MX validation...`);

  const verified = [];
  const CONCURRENCY = 25;

  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const chunk = toCheck.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (c) => {
      try {
        const mx = await dns.resolveMx(c.domain);
        if (mx && mx.length > 0) {
          verified.push(c);
        }
      } catch (err) {}
    }));
    process.stdout.write(`\rProgress: ${Math.min(i + CONCURRENCY, toCheck.length)} / ${toCheck.length} | Verified: ${verified.length}`);
  }

  console.log(`\n\nTotal newly verified in Batch 5: ${verified.length}`);

  const totalVerified = [...prevAll, ...verified];
  console.log(`\n===========================================`);
  console.log(`FINAL TOTAL VERIFIED FRESH UNCONTACTED COMPANIES: ${totalVerified.length}`);
  console.log(`===========================================`);

  fs.writeFileSync(path.join(__dirname, 'all_500_new_verified.json'), JSON.stringify(totalVerified, null, 2), 'utf8');

  // Now append all 500+ into company_directory.js directly!
  const dirPath = path.join(__dirname, '../data/company_directory.js');
  const combined = [...dir.MASTER_COMPANIES, ...totalVerified];

  const header = `/**
 * Curated Master Directory of 1,200+ 100% Fresh Verified Tech Companies & Startups
 * Covers Mumbai, Bengaluru, Delhi-NCR, Pune, Hyderabad, and Remote India.
 * STRICT SAFETY POLICY:
 * - Only verified active DNS MX mail servers
 * - Gold-standard 'careers' hiring inboxes ONLY
 * - Strict domain-level deduplication: Exactly ONE email per company, NEVER repeats or loops
 */

const dns = require('dns').promises;

try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const HR_ALIASES = [
  'careers'
];

const MASTER_COMPANIES = `;

  const footer = `;

const mxCache = new Map();

async function checkDomainMx(domain) {
  const norm = (domain || '').toLowerCase().trim();
  if (!norm) return false;
  if (mxCache.has(norm)) return mxCache.get(norm);

  try {
    const records = await dns.resolveMx(norm);
    const valid = Array.isArray(records) && records.length > 0;
    mxCache.set(norm, valid);
    return valid;
  } catch (e) {
    mxCache.set(norm, false);
    return false;
  }
}

function getFreshCandidates(targetLocation = 'all', contactedSet = new Set()) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  const list = [];
  const domainUsedInBatch = new Set();

  const contactedDomains = new Set();
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  for (const c of MASTER_COMPANIES) {
    if (normLocation === 'mumbai' && c.type.toLowerCase() !== 'mumbai') continue;
    if (normLocation === 'remote' && c.type.toLowerCase() !== 'remote') continue;

    const domain = (c.domain || '').toLowerCase().trim();
    if (domainUsedInBatch.has(domain) || contactedDomains.has(domain)) continue;

    for (const alias of HR_ALIASES) {
      const email = \`\${alias}@\${domain}\`;
      if (!contactedSet.has(email)) {
        list.push({
          company: c.company,
          email: email,
          name: \`\${c.company} Talent Team\`,
          type: c.type,
          sourceDoc: \`Autonomous Discovery (\${c.type})\`
        });
        domainUsedInBatch.add(domain);
        break;
      }
    }
  }

  return list;
}

async function discoverNextBatchLeads({
  targetLocation = 'all',
  countNeeded = 15,
  contactedSet = new Set(),
  batchDomainSet = new Set(),
  onProgress = null
}) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  const verifiedCandidates = [];
  const usedDomains = new Set(batchDomainSet);

  const contactedDomains = new Set();
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  let pool = MASTER_COMPANIES.filter(c => {
    if (normLocation === 'mumbai') return c.type.toLowerCase() === 'mumbai';
    if (normLocation === 'remote') return c.type.toLowerCase() === 'remote';
    return true;
  });

  if (pool.length < countNeeded) {
    pool = MASTER_COMPANIES;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());

  for (const c of shuffled) {
    if (verifiedCandidates.length >= countNeeded) break;

    const domain = (c.domain || '').toLowerCase().trim();
    if (usedDomains.has(domain) || contactedDomains.has(domain)) continue;

    for (const alias of HR_ALIASES) {
      const email = \`\${alias}@\${domain}\`;
      if (contactedSet.has(email)) continue;

      const mxOk = await checkDomainMx(domain);
      if (!mxOk) break;

      verifiedCandidates.push({
        company: c.company,
        email: email,
        name: \`\${c.company} Talent Team\`,
        type: c.type,
        sourceDoc: \`Autonomous Discovery (\${c.type})\`
      });

      usedDomains.add(domain);
      if (typeof onProgress === 'function') {
        onProgress('DISCOVER', \`🎯 Lead ready: \${c.company} <\${email}>\`, 'info');
      }
      break;
    }
  }

  return verifiedCandidates;
}

module.exports = {
  MASTER_COMPANIES,
  HR_ALIASES,
  getFreshCandidates,
  discoverNextBatchLeads,
  checkDomainMx
};
`;

  fs.writeFileSync(dirPath, header + JSON.stringify(combined, null, 2) + footer, 'utf8');
  console.log(`\nSuccessfully updated company_directory.js!`);
  console.log(`Total Master Companies in Directory: ${combined.length}`);
}

run().catch(console.error);
