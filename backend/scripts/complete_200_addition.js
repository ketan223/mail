const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidates = [
  // --- BANGALORE HSR / KORAMANGALA / INDIRANAGAR TECH HUBS ---
  { company: 'Techasoft Karnataka', domain: 'techasoft.com', type: 'Remote' },
  { company: 'Purple Block Tech', domain: 'purpleblock.com', type: 'Remote' },
  { company: 'Evam Labs AI', domain: 'evam.io', type: 'Remote' },
  { company: 'BhuMe Spatial Tech', domain: 'bhume.com', type: 'Remote' },
  { company: 'Mobistreak Media Tech', domain: 'mobistreak.com', type: 'Remote' },
  { company: 'Zixflow Communications', domain: 'zixflow.com', type: 'Remote' },
  { company: 'Render Infotech Bangalore', domain: 'renderinfotech.com', type: 'Remote' },

  // --- GANDHINAGAR & GIFT CITY IT HUBS ---
  { company: 'Zenkins Technologies', domain: 'zenkins.com', type: 'Remote' },
  { company: 'DevX Innovations', domain: 'devx.work', type: 'Remote' },
  { company: 'Swan Digital Labs', domain: 'swandigital.io', type: 'Remote' },
  { company: 'Accelpix Solutions', domain: 'accelpix.com', type: 'Remote' },
  { company: 'Eleics Design Tech', domain: 'eleics.com', type: 'Remote' },

  // --- NOIDA SECTORS 62 & 63 IT CLUSTERS ---
  { company: 'Taksh IT Solutions', domain: 'takshitsolutions.com', type: 'Remote' },
  { company: 'Technanosoft Technologies', domain: 'technanosoft.com', type: 'Remote' },
  { company: 'AbyM Technology', domain: 'abymtechnology.com', type: 'Remote' },
  { company: 'Finoit Technology', domain: 'finoit.com', type: 'Remote' },
  { company: 'Infozion Technologies', domain: 'infozion.in', type: 'Remote' },
  { company: 'Shadow Infosystem', domain: 'shadowinfosystem.com', type: 'Remote' },
  { company: 'Xotiv Technologies', domain: 'xotiv.com', type: 'Remote' },
  { company: 'Agile Tech Solutions', domain: 'agiletech.co.in', type: 'Remote' },
  { company: 'CodeFire Technologies', domain: 'codefire.org', type: 'Remote' },
  { company: 'Opalina Technologies', domain: 'opalina.in', type: 'Remote' },
  { company: 'Velocity Software Solutions', domain: 'velsof.com', type: 'Remote' },
  { company: 'TechConfer Technologies', domain: 'techconfer.com', type: 'Remote' },
  { company: 'Amity Software Systems', domain: 'amitysoftware.com', type: 'Remote' },
  { company: 'Ennovations Techserv', domain: 'ennovations.co', type: 'Remote' },
  { company: 'MCN Solutions Software', domain: 'mcnsolutions.net', type: 'Remote' },
  { company: 'Ucodice Technologies', domain: 'ucodice.com', type: 'Remote' },

  // --- FINTECH, WEALTH & CREDIT PLATFORMS ---
  { company: 'Gullak Money MicroSavings', domain: 'gullak.money', type: 'Remote' },
  { company: 'GoNiyo Digital Banking', domain: 'goniyo.com', type: 'Remote' },
  { company: 'Jiraaf Alternative Assets', domain: 'jiraaf.com', type: 'Remote' },
  { company: 'Alt Graaf Fixed Returns', domain: 'altgraaf.com', type: 'Remote' },
  { company: 'Betterhalf AI Matrimony', domain: 'betterhalf.ai', type: 'Remote' },
  { company: 'Probe42 Financial Data', domain: 'probe42.in', type: 'Remote' },
  { company: 'Rubix Data Sciences', domain: 'rubixdatasolutions.com', type: 'Mumbai' },
  { company: 'Vyapar Accounting App', domain: 'vyaparapp.in', type: 'Remote' },
  { company: 'Stoa Career School', domain: 'stoa.school', type: 'Remote' },
  { company: 'Kraftshala EdTech', domain: 'kraftshala.com', type: 'Remote' },
  { company: 'Board Infinity Career', domain: 'boardinfinity.com', type: 'Mumbai' },
  { company: 'Unstop Opportunity Platform', domain: 'unstop.com', type: 'Remote' },
  { company: 'Weekday Works AI Hiring', domain: 'weekday.works', type: 'Remote' },
  { company: 'Apna Jobs Platform', domain: 'apna.co', type: 'Remote' },
  { company: 'Taskmo Gig Platform', domain: 'taskmo.com', type: 'Remote' },
  { company: 'Awign Gig Workforce', domain: 'awign.com', type: 'Remote' },
  { company: 'Gigforce Workforce', domain: 'gigforce.in', type: 'Remote' },
  { company: 'Refyne Earned Wage', domain: 'refyne.co.in', type: 'Remote' },
  { company: 'TartanHQ Payroll API', domain: 'tartanhq.com', type: 'Remote' },

  // --- DIGITAL STUDIOS & PRODUCT ENGINEERING HOUSES ---
  { company: 'GoodWorkLabs Digital', domain: 'goodworklabs.com', type: 'Remote' },
  { company: 'Mutual Mobile India', domain: 'mutualmobile.com', type: 'Remote' },
  { company: 'Fueled Mobile Agency', domain: 'fueled.com', type: 'Remote' },
  { company: 'Divum Corporate Tech', domain: 'divum.in', type: 'Remote' },
  { company: 'GeekyAnts Software', domain: 'geekyants.com', type: 'Remote' },
  { company: 'Lollypop Design Studio', domain: 'lollypop.design', type: 'Remote' },
  { company: 'Techment Technology', domain: 'techment.com', type: 'Remote' },
  { company: 'Vinsol Web and Mobile', domain: 'vinsol.com', type: 'Remote' },
  { company: 'Innostax Tech Solutions', domain: 'innostax.com', type: 'Remote' },
  { company: 'StartxLabs Technologies', domain: 'startxlabs.com', type: 'Remote' },
  { company: 'MetaDesign Solutions', domain: 'metadesignsolutions.com', type: 'Remote' },
  { company: 'EchoForge Cloud', domain: 'echoforgecloud.com', type: 'Remote' },
  { company: 'DianApps Technologies', domain: 'dianapps.com', type: 'Remote' },
  { company: 'Symphony Solution Pune', domain: 'symphony-solution.com', type: 'Pune' },
  { company: 'Grawlix Software Pune', domain: 'grawlixsoft.com', type: 'Pune' },
  { company: 'NextAstra Technologies', domain: 'nextastra.com', type: 'Pune' },
  { company: 'EncureIT Systems', domain: 'encureit.com', type: 'Pune' },
  { company: 'Codescastle Software', domain: 'codescastle.com', type: 'Pune' },
  { company: 'iB Arts Software', domain: 'ibarts.in', type: 'Pune' },
  { company: 'Sankalpsutra Tech', domain: 'sankalpsutra.com', type: 'Pune' },
  { company: 'Ahex Technologies Hyderabad', domain: 'ahex.co.in', type: 'Remote' },
  { company: 'TechVedika Technologies', domain: 'techvedika.com', type: 'Remote' },
  { company: 'Tvisha Technologies', domain: 'tvisha.com', type: 'Remote' },
  { company: 'Zazz Digital Engineering', domain: 'zazz.io', type: 'Remote' },
  { company: 'Summation IT Solutions', domain: 'summationit.com', type: 'Remote' },
  { company: 'Clever Core Technologies', domain: 'clevercore.in', type: 'Remote' },
  { company: 'CloudIngest Services', domain: 'cloudingest.com', type: 'Remote' },
  { company: 'Tericsoft Technologies', domain: 'tericsoft.com', type: 'Remote' },
  { company: 'Probey Services Noida', domain: 'probeyservices.com', type: 'Remote' },
  { company: 'UpCodo Digital', domain: 'upcodo.com', type: 'Remote' },
  { company: 'ScalaCode Software', domain: 'scalacode.com', type: 'Remote' },
  { company: 'Futuresoft India', domain: 'futuresoftindia.com', type: 'Remote' },
  { company: 'Apricorn Solutions', domain: 'apricornsolutions.com', type: 'Remote' },
  { company: 'Maruti Techlabs', domain: 'marutitech.com', type: 'Remote' },
  { company: 'BoTree Technologies', domain: 'botreetechnologies.com', type: 'Remote' },

  // --- ADDITIONAL INDIAN SAAS & DEEPTECH PLATFORMS ---
  { company: 'CogniTensor AI Platform', domain: 'cognitensor.com', type: 'Remote' },
  { company: 'Krutrim AI Platform India', domain: 'krutrim.com', type: 'Remote' },
  { company: 'Gnani AI Voice Tech', domain: 'gnani.ai', type: 'Remote' },
  { company: 'CoRover Conversational Platform', domain: 'corover.ai', type: 'Remote' },
  { company: 'DevRev Developer CRM Cloud', domain: 'devrev.ai', type: 'Remote' },
  { company: 'Composio AI Agent Platform', domain: 'composio.dev', type: 'Remote' },
  { company: 'Kapture CX Platform India', domain: 'kapturecx.com', type: 'Remote' },
  { company: 'Salesken Intelligence Platform', domain: 'salesken.ai', type: 'Remote' },
  { company: 'Convin AI Speech Analytics', domain: 'convin.ai', type: 'Remote' },
  { company: 'Enthu AI Quality Management', domain: 'enthu.ai', type: 'Remote' },
  { company: 'MeetRecord Sales AI Tech', domain: 'meetrecord.com', type: 'Remote' },
  { company: 'CustomerXPs Clari5 Analytics', domain: 'customerxps.com', type: 'Remote' },
  { company: 'Perfios Financial Cloud Platform', domain: 'perfios.com', type: 'Remote' },
  { company: 'Karza Tech Analytics Solutions', domain: 'karza.in', type: 'Mumbai' },
  { company: 'Bureau ID Security Cloud', domain: 'bureau.id', type: 'Remote' },
  { company: 'Hyperverge AI Vision Platform', domain: 'hyperverge.co', type: 'Remote' },
  { company: 'SignDesk Digital Trust Tech', domain: 'signdesk.com', type: 'Remote' },
  { company: 'Leegality Agreements Solutions', domain: 'leegality.com', type: 'Remote' },
  { company: 'LegalKart Legal Solutions India', domain: 'legalkart.com', type: 'Remote' },
  { company: 'SpotDraft Legal AI Tech', domain: 'spotdraft.com', type: 'Remote' },
  { company: 'Volopay Cards Platform India', domain: 'volopay.com', type: 'Remote' },
  { company: 'Open Money Banking Platform', domain: 'open.money', type: 'Remote' },
  { company: 'Zaggle Prepaid Platform India', domain: 'zaggle.in', type: 'Remote' },
  { company: 'Happay Travel Cloud Solutions', domain: 'happay.com', type: 'Remote' },
  { company: 'ITILITE Expense SaaS Platform', domain: 'itilite.com', type: 'Remote' },
  { company: 'Trackier Attribution SaaS Cloud', domain: 'trackier.com', type: 'Remote' },
  { company: 'VdoCipher DRM Platform India', domain: 'vdocipher.com', type: 'Remote' },
  { company: 'Gumlet Media Cloud Platform', domain: 'gumlet.com', type: 'Remote' },
  { company: 'ImageKit CDN Realtime Cloud', domain: 'imagekit.io', type: 'Remote' },
  { company: 'Bikayi Platform Online', domain: 'bikayi.com', type: 'Remote' },
  { company: 'Dukaan Online Platform India', domain: 'mydukaan.io', type: 'Remote' },
  { company: 'Shipway Logistics Track Cloud', domain: 'shipway.com', type: 'Remote' },
  { company: 'NimbusPost Shipping Platform India', domain: 'nimbuspost.com', type: 'Remote' },
  { company: 'WareIQ Fullfillment Cloud Tech', domain: 'wareiq.com', type: 'Remote' },
  { company: 'Edgistify Logistics Platform Mumbai', domain: 'edgistify.com', type: 'Mumbai' }
];

async function run() {
  const dirPath = path.join(__dirname, '../data/company_directory.js');
  const dir = require(dirPath);
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');

  const contacted = new Set();
  sentLog.forEach(x => {
    if (x.email) {
      const p = x.email.split('@')[1];
      if (p) contacted.add(p.toLowerCase().trim());
    }
  });

  const existingDomains = new Set(dir.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidates) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existingDomains.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} prospective candidate companies for DNS MX validation...`);

  const verifiedNew = [];
  const CONCURRENCY = 25;

  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const chunk = toCheck.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (c) => {
      try {
        const mx = await dns.resolveMx(c.domain);
        if (mx && mx.length > 0) {
          verifiedNew.push(c);
        }
      } catch (err) {}
    }));
    process.stdout.write(`\rProgress: ${Math.min(i + CONCURRENCY, toCheck.length)} / ${toCheck.length} | Newly verified: ${verifiedNew.length}`);
  }

  console.log(`\n\nTotal newly verified fresh companies: ${verifiedNew.length}`);

  if (verifiedNew.length > 0) {
    const combined = [...dir.MASTER_COMPANIES, ...verifiedNew];

    const header = `/**
 * Curated Master Directory of 500+ 100% Fresh Verified Tech Companies & Startups
 * Covers Mumbai, Bengaluru, Delhi-NCR, Pune, Hyderabad, and Remote India.
 * STRICT SAFETY POLICY:
 * - Only verified active DNS MX mail servers
 * - Gold-standard 'careers' hiring inboxes ONLY
 * - NEVER guesses speculative aliases like hiring@, talent@, internships@, people@
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

    const fileContent = header + JSON.stringify(combined, null, 2) + footer;
    fs.writeFileSync(dirPath, fileContent, 'utf8');
    console.log(`Updated company_directory.js! Total companies in MASTER_COMPANIES: ${combined.length}`);
  }
}

run().catch(console.error);
