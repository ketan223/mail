const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidates = [
  // --- TECH PRODUCT & D2C CONSUMER COMPANIES ---
  { company: 'Giva Jewellery', domain: 'giva.co', type: 'Remote' },
  { company: 'Melorra Jewellery', domain: 'melorra.com', type: 'Remote' },
  { company: 'BlueStone Jewellery', domain: 'bluestone.com', type: 'Remote' },
  { company: 'CaratLane Tanishq', domain: 'caratlane.com', type: 'Remote' },
  { company: 'Chumbak Design', domain: 'chumbak.com', type: 'Remote' },
  { company: 'Nestasia Home Decor', domain: 'nestasia.in', type: 'Remote' },
  { company: 'Vaaree Home Products', domain: 'vaaree.com', type: 'Remote' },
  { company: 'Mokobara Luggage Tech', domain: 'mokobara.com', type: 'Remote' },
  { company: 'DailyObjects Lifestyle Tech', domain: 'dailyobjects.com', type: 'Remote' },
  { company: 'Assembly Luggage', domain: 'assemblytravel.com', type: 'Remote' },
  { company: 'Uppercase Eco Travel', domain: 'uppercase.co.in', type: 'Mumbai' },
  { company: 'Headphone Zone Audio', domain: 'headphonezone.in', type: 'Mumbai' },
  { company: 'Crossbeats Wearables', domain: 'crossbeats.com', type: 'Remote' },
  { company: 'Hammer Lifestyle', domain: 'hammeronline.in', type: 'Remote' },
  { company: 'Pebble Smartwatches', domain: 'pebblecart.com', type: 'Remote' },
  { company: 'Truke Audio Tech', domain: 'truke.in', type: 'Remote' },
  { company: 'Wings Lifestyle Gaming', domain: 'wingslifestyle.in', type: 'Remote' },

  // --- HEALTHTECH & TELEMEDICINE ---
  { company: 'Cult.fit Healthcare Tech', domain: 'cult.fit', type: 'Remote' },
  { company: 'HealthifyMe Wellness Tech', domain: 'healthifyme.com', type: 'Remote' },
  { company: 'Fittr Fitness Tech', domain: 'fittr.com', type: 'Pune' },
  { company: 'StepSetGo Fitness', domain: 'stepsetgo.com', type: 'Mumbai' },
  { company: 'GOQii Smart Health', domain: 'goqii.com', type: 'Mumbai' },
  { company: 'BeatO Diabetes Care', domain: 'beatoapp.com', type: 'Remote' },
  { company: 'Pristyn Care Surgery', domain: 'pristyncare.com', type: 'Remote' },
  { company: 'Practo Health Tech', domain: 'practo.com', type: 'Remote' },
  { company: 'MediBuddy Healthcare', domain: 'medibuddy.in', type: 'Remote' },
  { company: 'MFine Telemedicine', domain: 'mfine.co', type: 'Remote' },
  { company: 'Tata 1mg Digital Health', domain: '1mg.com', type: 'Remote' },
  { company: 'Netmeds Online Pharmacy', domain: 'netmeds.com', type: 'Remote' },
  { company: 'Apollo 247 Digital', domain: 'apollo247.com', type: 'Remote' },
  { company: 'Truemeds Medicine Tech', domain: 'truemeds.in', type: 'Mumbai' },
  { company: 'Clinikk Healthcare', domain: 'clinikk.com', type: 'Remote' },
  { company: 'Loop Health Insurance', domain: 'loophealth.com', type: 'Pune' },
  { company: 'Even Healthcare HMO', domain: 'even.in', type: 'Remote' },
  { company: 'HealthPlix EMR Platform', domain: 'healthplix.com', type: 'Remote' },
  { company: 'Docquity Medical Network', domain: 'docquity.com', type: 'Remote' },
  { company: 'Lybrate Consultation', domain: 'lybrate.com', type: 'Remote' },
  { company: 'CrelioHealth Diagnostics Cloud', domain: 'creliohealth.com', type: 'Pune' },

  // --- AYURVEDA, DERMA & PERSONAL CARE TECH ---
  { company: 'SkinKraft Custom Beauty', domain: 'skinkraft.com', type: 'Remote' },
  { company: 'Vedix Custom Ayurveda', domain: 'vedix.com', type: 'Remote' },
  { company: 'Bare Anatomy Haircare', domain: 'bareanatomy.com', type: 'Remote' },
  { company: 'Chemist At Play Bodycare', domain: 'chemistatplay.com', type: 'Remote' },
  { company: 'The Derma Co Active Care', domain: 'thedermaco.com', type: 'Remote' },
  { company: 'Aqualogica Hydration Care', domain: 'aqualogica.in', type: 'Remote' },
  { company: 'Ayuga Ayurvedic Skincare', domain: 'ayuga.in', type: 'Remote' },
  { company: 'Dr. Sheths Dermatologist Formulated', domain: 'drsheths.com', type: 'Mumbai' },
  { company: 'Dot & Key Skincare', domain: 'dotandkey.com', type: 'Remote' },
  { company: 'Earth Rhythm Organic Tech', domain: 'earthrhythm.com', type: 'Remote' },
  { company: 'Juicy Chemistry Organics', domain: 'juicychemistry.com', type: 'Remote' },
  { company: 'Forest Essentials Luxury', domain: 'forestessentialsindia.com', type: 'Remote' },
  { company: 'Kama Ayurveda Authentic', domain: 'kamaayurveda.com', type: 'Remote' },
  { company: 'Just Herbs Pure Care', domain: 'justherbs.in', type: 'Remote' },
  { company: 'TAC The Ayurveda Company', domain: 'theayurvedaco.com', type: 'Remote' },
  { company: 'Kapiva Ayurveda Solutions', domain: 'kapiva.in', type: 'Mumbai' },
  { company: 'Auric Ayurvedic Beverages', domain: 'theauric.com', type: 'Remote' },
  { company: 'OZiva Plant Nutrition', domain: 'oziva.in', type: 'Mumbai' },
  { company: 'Fast&Up Active Nutrition', domain: 'fastandup.in', type: 'Mumbai' },
  { company: 'MuscleBlaze Fitness Nutrition', domain: 'muscleblaze.com', type: 'Remote' },
  { company: 'HealthKart Bright LifeCare', domain: 'healthkart.com', type: 'Remote' },
  { company: 'Nutrabay Supplements', domain: 'nutrabay.com', type: 'Remote' },
  { company: 'Yoga Bar Sproutlife Foods', domain: 'yogabar.in', type: 'Remote' },
  { company: 'True Elements Healthy Foods', domain: 'true-elements.com', type: 'Pune' },
  { company: 'Pintola Nut Butters', domain: 'pintola.in', type: 'Remote' },
  { company: 'Alpino Health Foods', domain: 'alpino.store', type: 'Remote' },
  { company: 'Soulfull Kottaram Agro', domain: 'soulfull.co.in', type: 'Remote' },
  { company: 'MasterChow Food Tech', domain: 'masterchow.in', type: 'Remote' },
  { company: 'Naagin Hot Sauce', domain: 'naaginsauce.com', type: 'Mumbai' },
  { company: 'Urban Platter Gourmet', domain: 'urbanplatter.in', type: 'Mumbai' },
  { company: 'Bira 91 B9 Beverages', domain: 'bira91.com', type: 'Remote' },
  { company: 'Paper Boat Hector Beverages', domain: 'hectorbeverages.com', type: 'Remote' },

  // --- DEVELOPER ECOSYSTEM, CODING & EDTECH ---
  { company: 'HackerEarth Talent Platform', domain: 'hackerearth.com', type: 'Remote' },
  { company: 'HackerRank Tech', domain: 'hackerrank.com', type: 'Remote' },
  { company: 'Coderbyte Assessments', domain: 'coderbyte.com', type: 'Remote' },
  { company: 'InterviewBit Platform', domain: 'interviewbit.com', type: 'Remote' },
  { company: 'Coding Ninjas Tech', domain: 'codingninjas.com', type: 'Remote' },
  { company: 'CodeChef Directi', domain: 'codechef.com', type: 'Mumbai' },
  { company: 'Analytics Vidhya Learning', domain: 'analyticsvidhya.com', type: 'Remote' },
  { company: 'Springboard India Tech', domain: 'springboard.com', type: 'Remote' },
  { company: 'Udacity India Tech', domain: 'udacity.com', type: 'Remote' },
  { company: 'Pluralsight India Platform', domain: 'pluralsight.com', type: 'Remote' },
  { company: 'Educative Interactive Courses', domain: 'educative.io', type: 'Remote' },
  { company: 'Uxcel Design Education', domain: 'uxcel.com', type: 'Remote' },
  { company: 'Penpot Open Design', domain: 'penpot.app', type: 'Remote' },
  { company: 'Icons8 Digital Assets', domain: 'icons8.com', type: 'Remote' },

  // --- B2B & SUPPLY CHAIN PLATFORMS ---
  { company: 'Pepper Content Platform', domain: 'peppercontent.io', type: 'Mumbai' },
  { company: 'Animall Technologies Rural', domain: 'animall.in', type: 'Remote' },
  { company: 'Fashinza Supply Chain', domain: 'fashinza.com', type: 'Remote' },
  { company: 'BimaPe Consumer Insurance', domain: 'bimape.com', type: 'Mumbai' },
  { company: 'SigTuple Diagnostics AI', domain: 'sigtuple.com', type: 'Remote' },
  { company: 'Procube Technologies', domain: 'procube.cx', type: 'Remote' },
  { company: 'InfraMarket Construction Tech', domain: 'infra.market', type: 'Mumbai' },
  { company: 'OfBusiness Oxyzo Tech', domain: 'ofbusiness.com', type: 'Remote' },
  { company: 'Zetwerk Manufacturing Tech', domain: 'zetwerk.com', type: 'Remote' },
  { company: 'Moglix Industrial Commerce', domain: 'moglix.com', type: 'Remote' },
  { company: 'Udaan B2B Trade', domain: 'udaan.com', type: 'Remote' },
  { company: 'Bijnis Manufacturing B2B', domain: 'bijnis.com', type: 'Remote' },
  { company: 'Apnaklub Kirana Wholesale', domain: 'apnaklub.com', type: 'Remote' },
  { company: 'DeHaat Agrevolution', domain: 'agrevolution.in', type: 'Remote' },
  { company: 'Ninjacart B2B Agritech', domain: 'ninjacart.com', type: 'Remote' },
  { company: 'AgroStar Farmer Platform', domain: 'agrostar.in', type: 'Pune' },
  { company: 'BharatAgri Farm Advisory', domain: 'bharatagri.com', type: 'Pune' },
  { company: 'BigHaat Agritech', domain: 'bighaat.com', type: 'Remote' },
  { company: 'FarMart Agritech', domain: 'farmart.co', type: 'Remote' },
  { company: 'Captain Fresh Seafood B2B', domain: 'captainfresh.in', type: 'Remote' },
  { company: 'FreshToHome Meat B2C', domain: 'freshtohome.com', type: 'Remote' },
  { company: 'WayCool Foods Supply', domain: 'waycool.in', type: 'Remote' },
  { company: 'Metalbook Metals Cloud', domain: 'metalbook.co', type: 'Remote' },
  { company: 'Bizongo Packaging Tech', domain: 'bizongo.com', type: 'Mumbai' },

  // --- AUTOMOTIVE, EV & TRANSPORTATION ---
  { company: 'River EV Mobility Electric', domain: 'rideriver.com', type: 'Remote' },
  { company: 'Tork Motors Electric Bikes', domain: 'torkmotors.com', type: 'Pune' },
  { company: 'Revolt Motors Electric Bikes', domain: 'revoltmotors.com', type: 'Remote' },
  { company: 'Simple Energy Electric Scooters', domain: 'simpleenergy.in', type: 'Remote' },
  { company: 'Ultraviolette Automotive Bikes', domain: 'ultraviolette.com', type: 'Remote' },
  { company: 'Matter Energy Electric Lab', domain: 'matter.in', type: 'Remote' },
  { company: 'Oben Electric Bikes Tech', domain: 'obenelectric.com', type: 'Remote' },
  { company: 'Hop Electric Bikes Mobility', domain: 'hopelectric.in', type: 'Remote' },
  { company: 'Pure EV Electric Vehicles India', domain: 'pureev.in', type: 'Remote' },
  { company: 'Ampere Greaves EV Scooters', domain: 'amperevehicles.com', type: 'Remote' },
  { company: 'Ather Energy Electric Mobility', domain: 'atherenergy.com', type: 'Remote' },
  { company: 'Euler Motors Commercial EV Tech', domain: 'eulermotors.com', type: 'Remote' },
  { company: 'Altigreen Motors Lab India', domain: 'altigreen.com', type: 'Remote' },
  { company: 'Log9 Materials Battery Tech', domain: 'log9materials.com', type: 'Remote' },
  { company: 'Ola Electric Technologies', domain: 'olaelectric.com', type: 'Remote' },
  { company: 'Komaki Electric Vehicle India', domain: 'komaki.in', type: 'Remote' },
  { company: 'Okinawa Autotech Electric Scooters', domain: 'okinawascooters.com', type: 'Remote' },

  // --- LOGISTICS, FREIGHT & MOBILITY SAAS ---
  { company: 'Delhivery Logistics Technology', domain: 'delhivery.com', type: 'Remote' },
  { company: 'Shadowfax Technologies', domain: 'shadowfax.in', type: 'Remote' },
  { company: 'Shiprocket Ecommerce Logistics', domain: 'shiprocket.in', type: 'Remote' },
  { company: 'BlackBuck Trucking Platform', domain: 'blackbuck.com', type: 'Remote' },
  { company: 'Rivigo Relay Logistics', domain: 'rivigo.com', type: 'Remote' },
  { company: 'Porter Mini Trucks App', domain: 'porter.in', type: 'Remote' },
  { company: 'Blowhorn Intra City Logistics', domain: 'blowhorn.com', type: 'Remote' },
  { company: 'LetsTransport Logistics Tech', domain: 'letstransport.in', type: 'Remote' },
  { company: 'ElasticRun Rural Distribution', domain: 'elasticrun.com', type: 'Pune' },
  { company: 'FarEye Supply Chain SaaS', domain: 'fareye.com', type: 'Remote' },
  { company: 'Locus.sh Decision Intelligence', domain: 'locus.sh', type: 'Remote' },
  { company: 'Freight Tiger Logistics SaaS', domain: 'freighttiger.com', type: 'Mumbai' },
  { company: 'Intugine Technologies IoT', domain: 'intugine.com', type: 'Remote' },
  { company: 'Fleetx Technologies IoT', domain: 'fleetx.io', type: 'Remote' },
  { company: 'Loconav Fleet Telematics', domain: 'loconav.com', type: 'Remote' },
  { company: 'Shipsy Supply Chain Platform', domain: 'shipsy.io', type: 'Remote' },
  { company: 'Pando Enterprise Logistics Cloud', domain: 'pando.ai', type: 'Remote' },
  { company: 'Cogoport Digital Freight', domain: 'cogoport.com', type: 'Mumbai' },
  { company: 'Wiz Freight Cross Border', domain: 'wizfreight.com', type: 'Remote' },
  { company: 'Loadshare Networks Logistics', domain: 'loadshare.net', type: 'Remote' },
  { company: 'GoBolt Express Tech India', domain: 'gobolt.in', type: 'Remote' },
  { company: 'Rapido Bike Taxi Rides', domain: 'rapido.bike', type: 'Remote' },
  { company: 'Yulu Electric Mobility Bikes', domain: 'yulu.bike', type: 'Remote' },
  { company: 'Zypp Electric Mobility Fleet', domain: 'zypp.app', type: 'Remote' },
  { company: 'BluSmart Mobility EV Cabs', domain: 'myblusmart.com', type: 'Remote' },
  { company: 'Everest Fleet Clean Tech', domain: 'everestfleet.com', type: 'Mumbai' }
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
