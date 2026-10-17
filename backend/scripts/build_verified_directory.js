const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const SENT_LOG_FILE = path.join(__dirname, '..', 'data', 'sent_log.json');
const TARGET_FILE = path.join(__dirname, '..', 'data', 'company_directory.js');

let loggedDomains = new Set();
let loggedEmails = new Set();
try {
  if (fs.existsSync(SENT_LOG_FILE)) {
    const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    history.forEach(item => {
      const email = (item.email || '').toLowerCase().trim();
      if (email) {
        loggedEmails.add(email);
        const domain = email.split('@')[1];
        if (domain) loggedDomains.add(domain);
      }
    });
  }
} catch (e) {
  console.error('Error reading sent_log:', e.message);
}

console.log(`Loaded ${loggedDomains.size} already attempted domains and ${loggedEmails.size} emails from sent_log.json.`);

// Master list of top tech startups across India
const CURATED_COMPANIES = [
  // --- MUMBAI & MMR TECH STARTUPS & SCALEUPS ---
  { company: "Swiggy", domain: "swiggy.com", type: "Mumbai" },
  { company: "Lenskart", domain: "lenskart.com", type: "Mumbai" },
  { company: "Atomberg Technologies", domain: "atomberg.com", type: "Mumbai" },
  { company: "Drools Pet Food", domain: "drools.com", type: "Mumbai" },
  { company: "Heads Up For Tails", domain: "headsupfortails.com", type: "Mumbai" },
  { company: "SleepyCat", domain: "sleepycat.in", type: "Mumbai" },
  { company: "Flo Mattress", domain: "flomattress.com", type: "Mumbai" },
  { company: "The Man Company", domain: "themancompany.com", type: "Mumbai" },
  { company: "Beardo", domain: "beardo.in", type: "Mumbai" },
  { company: "Ustraa", domain: "ustraa.com", type: "Mumbai" },
  { company: "Foxtale", domain: "foxtale.in", type: "Mumbai" },
  { company: "Minimalist", domain: "beminimalist.co", type: "Mumbai" },
  { company: "Dot & Key Skincare", domain: "dotandkey.com", type: "Mumbai" },
  { company: "Earth Rhythm", domain: "earthrhythm.com", type: "Mumbai" },
  { company: "Juicy Chemistry", domain: "juicychemistry.com", type: "Mumbai" },
  { company: "mCaffeine", domain: "mcaffeine.com", type: "Mumbai" },
  { company: "Renee Cosmetics", domain: "reneecosmetics.in", type: "Mumbai" },
  { company: "Swiss Beauty", domain: "swissbeauty.in", type: "Mumbai" },
  { company: "Snitch", domain: "snitch.co.in", type: "Mumbai" },
  { company: "DaMENSCH", domain: "damensch.com", type: "Mumbai" },
  { company: "XYXX Apparels", domain: "xyxxcrew.com", type: "Mumbai" },
  { company: "Bummer", domain: "bummer.in", type: "Mumbai" },
  { company: "Clovia", domain: "clovia.com", type: "Mumbai" },
  { company: "Zivame", domain: "zivame.com", type: "Mumbai" },
  { company: "Urbanic", domain: "urbanic.com", type: "Mumbai" },
  { company: "Virgio", domain: "virgio.com", type: "Mumbai" },
  { company: "Savana", domain: "savana.com", type: "Mumbai" },
  { company: "Wakefit", domain: "wakefit.co", type: "Mumbai" },
  { company: "Country Delight", domain: "countrydelight.in", type: "Mumbai" },
  { company: "Curefoods", domain: "curefoods.in", type: "Mumbai" },

  // --- LOGISTICS, SUPPLY CHAIN & MOBILITY ---
  { company: "WareIQ", domain: "wareiq.com", type: "Mumbai" },
  { company: "ClickPost", domain: "clickpost.ai", type: "Mumbai" },
  { company: "Shipway", domain: "shipway.com", type: "Mumbai" },
  { company: "Freight Tiger", domain: "freighttiger.com", type: "Mumbai" },
  { company: "Emiza Supply Chain", domain: "emizainc.com", type: "Mumbai" },
  { company: "GoComet", domain: "gocomet.com", type: "Mumbai" },
  { company: "Kale Logistics", domain: "kalelogistics.com", type: "Mumbai" },
  { company: "Fleetx", domain: "fleetx.io", type: "Mumbai" },
  { company: "LocoNav", domain: "loconav.com", type: "Mumbai" },
  { company: "TrackoBit", domain: "trackobit.com", type: "Mumbai" },
  { company: "Roadcast", domain: "roadcast.in", type: "Mumbai" },
  { company: "Elixia Tech", domain: "elixiatech.com", type: "Mumbai" },
  { company: "LogiNext", domain: "loginextsolutions.com", type: "Mumbai" },
  { company: "River Mobility", domain: "rivermobility.com", type: "Remote" },
  { company: "Zypp Electric", domain: "zypp.app", type: "Remote" },
  { company: "Euler Motors", domain: "eulermotors.com", type: "Remote" },
  { company: "Ultraviolette Automotive", domain: "ultraviolette.com", type: "Remote" },
  { company: "Simple Energy", domain: "simpleenergy.in", type: "Remote" },
  { company: "Matter EV", domain: "matter.in", type: "Remote" },
  { company: "Oben Electric", domain: "obenelectric.com", type: "Remote" },
  { company: "Ather Energy", domain: "atherenergy.com", type: "Remote" },

  // --- FINTECH, WEALTH & PAYMENTS ---
  { company: "INDmoney", domain: "indmoney.com", type: "Remote" },
  { company: "Groww", domain: "groww.in", type: "Remote" },
  { company: "Dhan", domain: "dhan.co", type: "Remote" },
  { company: "Angel One", domain: "angelone.in", type: "Remote" },
  { company: "5paisa", domain: "5paisa.com", type: "Remote" },
  { company: "Upstox", domain: "upstox.com", type: "Remote" },
  { company: "Jar App", domain: "myjar.app", type: "Remote" },
  { company: "Gullak Money", domain: "gullak.money", type: "Remote" },
  { company: "Multipl", domain: "multipl.xyz", type: "Remote" },
  { company: "Dezerv", domain: "dezerv.in", type: "Remote" },
  { company: "Scripbox", domain: "scripbox.com", type: "Remote" },
  { company: "Stable Money", domain: "stablemoney.in", type: "Remote" },
  { company: "Grip Invest", domain: "gripinvest.in", type: "Remote" },
  { company: "Wint Wealth", domain: "wintwealth.com", type: "Remote" },
  { company: "Jiraaf", domain: "jiraaf.com", type: "Remote" },
  { company: "Alt Graaf", domain: "altgraaf.com", type: "Remote" },
  { company: "KredX", domain: "kredx.com", type: "Remote" },
  { company: "M2P Fintech", domain: "m2pfintech.com", type: "Remote" },
  { company: "Decentro", domain: "decentro.tech", type: "Remote" },
  { company: "Setu API", domain: "setu.co", type: "Remote" },
  { company: "Hyperface", domain: "hyperface.co", type: "Remote" },
  { company: "Bureau Identity", domain: "bureau.id", type: "Remote" },
  { company: "Slice Cards", domain: "sliceit.com", type: "Remote" },
  { company: "Fi Money", domain: "fi.money", type: "Remote" },
  { company: "Jupiter Money", domain: "jupiter.money", type: "Remote" },
  { company: "Uni Cards", domain: "uni.cards", type: "Remote" },

  // --- AI, GENERATIVE AI & DEEPTECH ---
  { company: "Sarvam AI", domain: "sarvam.ai", type: "Remote" },
  { company: "Krutrim AI", domain: "krutrim.com", type: "Remote" },
  { company: "Gnani.ai", domain: "gnani.ai", type: "Remote" },
  { company: "CoRover.ai", domain: "corover.ai", type: "Remote" },
  { company: "Yellow.ai", domain: "yellow.ai", type: "Remote" },
  { company: "Uniphore", domain: "uniphore.com", type: "Remote" },
  { company: "Observe.ai", domain: "observe.ai", type: "Remote" },
  { company: "Mihup", domain: "mihup.com", type: "Remote" },
  { company: "Reverie Language Tech", domain: "reverieinc.com", type: "Remote" },
  { company: "Wadhwani AI", domain: "wadhwaniai.org", type: "Mumbai" },
  { company: "CropIn Technology", domain: "cropin.com", type: "Remote" },
  { company: "Fasal", domain: "fasal.co", type: "Remote" },
  { company: "Intello Labs", domain: "intellolabs.com", type: "Remote" },
  { company: "AgNext", domain: "agnext.com", type: "Remote" },
  { company: "Stellapps Technologies", domain: "stellapps.com", type: "Remote" },
  { company: "DeHaat", domain: "agrevolution.in", type: "Remote" },
  { company: "BharatAgri", domain: "bharatagri.com", type: "Remote" },
  { company: "Ninjacart", domain: "ninjacart.com", type: "Remote" },
  { company: "WayCool Foods", domain: "waycool.in", type: "Remote" },

  // --- SAAS, CLOUD & DEVTOOLS ---
  { company: "Postman", domain: "postman.com", type: "Remote" },
  { company: "Hasura", domain: "hasura.io", type: "Remote" },
  { company: "LeadSquared", domain: "leadsquared.com", type: "Remote" },
  { company: "VWO (Wingify)", domain: "vwo.com", type: "Remote" },
  { company: "WebEngage", domain: "webengage.com", type: "Mumbai" },
  { company: "Exotel", domain: "exotel.com", type: "Remote" },
  { company: "Knowlarity", domain: "knowlarity.com", type: "Remote" },
  { company: "Ozonetel Communications", domain: "ozonetel.com", type: "Remote" },
  { company: "MyOperator", domain: "myoperator.com", type: "Remote" },
  { company: "SuperOps.ai", domain: "superops.com", type: "Remote" },
  { company: "Squadcast", domain: "squadcast.com", type: "Remote" },
  { company: "SigNoz", domain: "signoz.io", type: "Remote" },
  { company: "Devtron", domain: "devtron.ai", type: "Remote" },
  { company: "Middleware", domain: "middleware.io", type: "Remote" },
  { company: "Chaos Genius", domain: "chaosgenius.io", type: "Remote" },
  { company: "AccuKnox", domain: "accuknox.com", type: "Remote" },

  // --- HEALTHTECH & FITNESS ---
  { company: "BeatO", domain: "beatoapp.com", type: "Remote" },
  { company: "HealthifyMe", domain: "healthifyme.com", type: "Remote" },
  { company: "Fittr", domain: "fittr.com", type: "Remote" },
  { company: "Ultrahuman", domain: "ultrahuman.com", type: "Remote" },
  { company: "GOQii", domain: "goqii.com", type: "Mumbai" },
  { company: "Wellversed", domain: "wellversed.in", type: "Remote" },
  { company: "MyHealthcare", domain: "myhealthcare.co", type: "Remote" },
  { company: "DocOnline", domain: "doconline.com", type: "Remote" },
  { company: "Medi Assist", domain: "mediassist.in", type: "Remote" },

  // --- EDTECH & UPSKILLING ---
  { company: "Unacademy", domain: "unacademy.com", type: "Remote" },
  { company: "Vedantu", domain: "vedantu.com", type: "Remote" },
  { company: "CodeChef", domain: "codechef.com", type: "Mumbai" },
  { company: "GeeksforGeeks", domain: "geeksforgeeks.org", type: "Remote" },
  { company: "HackerEarth", domain: "hackerearth.com", type: "Remote" },
  { company: "UpGrad", domain: "upgrad.com", type: "Mumbai" },
  { company: "Emeritus", domain: "emeritus.org", type: "Mumbai" },
  { company: "PrepBytes", domain: "prepbytes.com", type: "Remote" },

  // --- GAMING & CONSUMER APPS ---
  { company: "WinZO Games", domain: "winzogames.com", type: "Remote" },
  { company: "PokerBaazi", domain: "pokerbaazi.com", type: "Remote" },
  { company: "FanCode", domain: "fancode.com", type: "Mumbai" },
  { company: "Rooter", domain: "rooter.gg", type: "Remote" },
  { company: "Stan", domain: "getstan.app", type: "Remote" },
  { company: "Pratilipi", domain: "pratilipi.com", type: "Remote" },
  { company: "Pocket FM", domain: "pocketfm.com", type: "Remote" },
  { company: "Stage OTT", domain: "stage.in", type: "Remote" }
];

async function checkMx(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log('Filtering fresh companies against sent_log.json & testing DNS MX mail exchangers...');
  
  const freshVerifiedCompanies = [];
  const addedDomains = new Set();

  for (const c of CURATED_COMPANIES) {
    const domain = (c.domain || '').toLowerCase().trim();
    if (!domain || addedDomains.has(domain)) continue;

    // Strict Rule: If domain was EVER attempted in sent_log, SKIP COMPLETELY!
    if (loggedDomains.has(domain)) {
      continue;
    }

    // Verify MX record
    const hasMx = await checkMx(domain);
    if (!hasMx) {
      console.log(`[SKIP] Domain ${domain} has no active MX records.`);
      continue;
    }

    addedDomains.add(domain);
    freshVerifiedCompanies.push({
      company: c.company,
      domain: domain,
      type: c.type
    });
  }

  console.log(`\nVerified ${freshVerifiedCompanies.length} 100% BRAND-NEW companies with active MX mail exchangers!`);

  // Write new company directory
  const content = `/**
 * Curated Master Directory of Verified Tech Startups & Scaleups
 * Covers Mumbai, Bengaluru, Delhi-NCR, Pune, Hyderabad, and Remote India.
 * STRICT POLICY: Only verified active MX domains. Only 'careers' and 'jobs' hiring inboxes.
 * Never multi-attempts dead domains or speculative aliases.
 */

const dns = require('dns').promises;

try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const HR_ALIASES = [
  'careers',
  'jobs'
];

const MASTER_COMPANIES = ${JSON.stringify(freshVerifiedCompanies, null, 2)};

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

  // Extract all domains that have already been contacted or attempted in sent_log
  const contactedDomains = new Set();
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  for (const c of MASTER_COMPANIES) {
    if (normLocation === 'mumbai' && c.type.toLowerCase() !== 'mumbai') continue;
    if (normLocation === 'remote' && c.type.toLowerCase() !== 'remote') continue;

    const domain = (c.domain || '').toLowerCase().trim();
    
    // Strict protection: If domain was EVER contacted or used, SKIP!
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
        break; // Only 1 contact per company domain
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

  fs.writeFileSync(TARGET_FILE, content, 'utf8');
  console.log(`Successfully updated ${TARGET_FILE}!`);
}

run().catch(console.error);
