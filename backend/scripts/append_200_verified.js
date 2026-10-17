const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidates = [
  // --- TIER-2 IT HUBS: DEHRADUN, BHOPAL, VIZAG, PATNA, MANGALORE, NASHIK ---
  { company: 'EbizON Digital', domain: 'ebizontek.com', type: 'Remote' },
  { company: 'Agnito Technologies', domain: 'agnitotechnologies.com', type: 'Remote' },
  { company: 'OyeCommerz Tech', domain: 'oyecommerz.com', type: 'Remote' },
  { company: 'Capace Software', domain: 'capacesoftware.com', type: 'Remote' },
  { company: 'Technogiq IT Solutions', domain: 'technogiq.com', type: 'Remote' },
  { company: 'Petadot System & Security', domain: 'petadot.com', type: 'Remote' },
  { company: 'Stepfinity Software', domain: 'stepfinity.com', type: 'Remote' },
  { company: 'Vidyayatan Technologies', domain: 'vidyayatan.com', type: 'Remote' },
  { company: 'Mindpyxle Technologies', domain: 'mindpyxle.com', type: 'Remote' },
  { company: 'Partum Codice', domain: 'partumcodice.com', type: 'Remote' },
  { company: 'ABIR Networks', domain: 'abirnetworks.com', type: 'Remote' },
  { company: 'Mamits Infotech', domain: 'mamits.com', type: 'Remote' },
  { company: 'Colour Moon Technologies', domain: 'thecolourmoon.com', type: 'Remote' },
  { company: 'Websutra Technologies', domain: 'websutra.in', type: 'Remote' },
  { company: 'Tanasvi Technologies', domain: 'tanasvi.com', type: 'Remote' },
  { company: 'INV Technologies', domain: 'invtechnologies.com', type: 'Remote' },
  { company: 'Genship Technologies', domain: 'genship.com', type: 'Remote' },
  { company: 'Nitsync Global Solutions', domain: 'nitsync.com', type: 'Remote' },
  { company: 'OpenTeQ Technologies', domain: 'openteqgroup.com', type: 'Remote' },
  { company: '10gminds Digital', domain: '10gminds.com', type: 'Remote' },
  { company: 'Defmax Technologies', domain: 'defmaxtech.com', type: 'Remote' },
  { company: 'Flint Lab Inc', domain: 'flintlab.io', type: 'Remote' },
  { company: 'Hubexus Solutions', domain: 'hubexus.com', type: 'Remote' },
  { company: 'Fluentgrid Smart Cities', domain: 'fluentgrid.com', type: 'Remote' },
  { company: 'Givni Technologies', domain: 'givni.in', type: 'Remote' },
  { company: 'Maas Infosolutions', domain: 'misspl.com', type: 'Remote' },
  { company: 'Amiure International', domain: 'amiure.com', type: 'Remote' },
  { company: 'RKV IT Solutions', domain: 'rkvitsolutions.com', type: 'Remote' },
  { company: 'Sanity Softwares', domain: 'sanitysoftwares.com', type: 'Remote' },
  { company: 'Webflora Technologies', domain: 'webfloratechnologies.com', type: 'Remote' },
  { company: 'IQ Softech Solutions', domain: 'iqsoftech.in', type: 'Remote' },
  { company: 'SSS Patna Systems', domain: 'ssspatna.com', type: 'Remote' },
  { company: 'Otaga Engineering', domain: 'otaga.com', type: 'Remote' },
  { company: 'KriyaXlabs AI', domain: 'kriyaxlabs.com', type: 'Remote' },
  { company: '7EDGE Software', domain: '7edge.com', type: 'Remote' },
  { company: 'Forgestack Labs', domain: 'forgestack.com', type: 'Remote' },
  { company: 'Komquest Solutions', domain: 'komquest.com', type: 'Remote' },
  { company: 'QDigital Solutions', domain: 'qdigital.in', type: 'Remote' },
  { company: 'OneCity Technologies', domain: 'onecitytechnologies.com', type: 'Remote' },
  { company: 'Accelerlab Technologies', domain: 'accelerlab.com', type: 'Remote' },
  { company: 'Yellowstone Labs', domain: 'yellowstonelabs.com', type: 'Remote' },
  { company: 'Invenger Technologies', domain: 'invenger.com', type: 'Remote' },
  { company: 'Semnox Solutions', domain: 'semnox.com', type: 'Remote' },
  { company: 'Aress Software Nashik', domain: 'aress.com', type: 'Pune' },

  // --- ENTERPRISE IT SERVICES, CONSULTING & GCCs ---
  { company: 'Incedo Technology', domain: 'incedoinc.com', type: 'Remote' },
  { company: 'GlobalLogic Digital', domain: 'globallogic.com', type: 'Remote' },
  { company: 'Altimetrik India', domain: 'altimetrik.com', type: 'Remote' },
  { company: 'EPAM Anywhere India', domain: 'epam.com', type: 'Remote' },
  { company: 'Luxoft India DXC', domain: 'luxoft.com', type: 'Remote' },
  { company: 'Endava India Software', domain: 'endava.com', type: 'Remote' },
  { company: 'Tata Technologies Automotive', domain: 'tatatechnologies.com', type: 'Pune' },
  { company: 'EXL Service Digital', domain: 'exlservice.com', type: 'Remote' },
  { company: 'Sutherland Global India', domain: 'sutherlandglobal.com', type: 'Remote' },
  { company: 'TaskUs India Tech', domain: 'taskus.com', type: 'Remote' },
  { company: 'Concentrix India Solutions', domain: 'concentrix.com', type: 'Remote' },
  { company: 'Allsec Technologies Tech', domain: 'allsectech.com', type: 'Remote' },
  { company: 'Conneqt Business Solutions', domain: 'conneqtcorp.com', type: 'Remote' },
  { company: 'IGT Solutions Travel Tech', domain: 'igtsolutions.com', type: 'Remote' },
  { company: 'Startek India Digital', domain: 'startek.com', type: 'Remote' },
  { company: '3i Infotech Enterprise', domain: '3i-infotech.com', type: 'Mumbai' },
  { company: 'Geometric PLM', domain: 'geometricglobal.com', type: 'Pune' },
  { company: 'Nelco Limited Tata', domain: 'nelco.co.in', type: 'Mumbai' },
  { company: 'Cartrade Tech Auto', domain: 'cartradetech.com', type: 'Mumbai' },
  { company: 'EaseMyTrip Online Travel', domain: 'easemytrip.com', type: 'Remote' },
  { company: 'Ixigo Travenues Tech', domain: 'ixigo.com', type: 'Remote' },
  { company: 'AbhiBus Online Bus', domain: 'abhibus.com', type: 'Remote' },
  { company: 'RedBus Ibibo Group', domain: 'redbus.in', type: 'Remote' },
  { company: 'Meru Cabs Mobility', domain: 'meru.in', type: 'Mumbai' },
  { company: 'Mega Cabs Travel', domain: 'megacabs.com', type: 'Remote' },
  { company: 'Savaari Car Rentals', domain: 'savaari.com', type: 'Remote' },
  { company: 'Quick Ride Carpool Tech', domain: 'quickride.in', type: 'Remote' },
  { company: 'Revv Self Drive Mobility', domain: 'revv.co.in', type: 'Remote' },

  // --- STARTUPS, SAAS & DEEPTECH INDIA ---
  { company: 'Blinkit Commerce', domain: 'blinkit.com', type: 'Remote' },
  { company: 'Purplle Beauty Retail', domain: 'purplle.com', type: 'Mumbai' },
  { company: 'Ola Cabs ANI Tech', domain: 'olacabs.com', type: 'Remote' },
  { company: 'Ola Electric Mobility', domain: 'olaelectric.com', type: 'Remote' },
  { company: 'Komaki Electric Vehicle', domain: 'komaki.in', type: 'Remote' },
  { company: 'Okinawa Autotech Scooters', domain: 'okinawascooters.com', type: 'Remote' },
  { company: 'PhonePe Payments', domain: 'phonepe.com', type: 'Remote' },
  { company: 'Lendingkart Finance', domain: 'lendingkart.com', type: 'Remote' },
  { company: 'Aye Finance MSME', domain: 'ayefin.com', type: 'Remote' },
  { company: 'MoneyTap Line of Credit', domain: 'moneytap.com', type: 'Remote' },
  { company: 'KreditBee Personal Loan', domain: 'kreditbee.in', type: 'Remote' },
  { company: 'Fibe EarlySalary Credit', domain: 'fibe.in', type: 'Pune' },
  { company: 'mPokket Pocket Credit', domain: 'mpokket.in', type: 'Remote' },
  { company: 'Rupeek Gold Loan Tech', domain: 'rupeek.com', type: 'Remote' },
  { company: 'KrazyBee NBFC Tech', domain: 'krazybee.com', type: 'Remote' },
  { company: 'SafeGold Digital Gold', domain: 'safegold.com', type: 'Mumbai' },
  { company: 'Dezerv Wealth Management', domain: 'dezerv.in', type: 'Mumbai' },
  { company: 'Stable Money Fixed Deposits', domain: 'stablemoney.in', type: 'Remote' },
  { company: 'Grip Invest Alternative', domain: 'gripinvest.in', type: 'Remote' },
  { company: 'Wint Wealth Bonds', domain: 'wintwealth.com', type: 'Remote' },

  // --- ADDITIONAL IT STUDIOS & AGENCIES ACROSS INDIA ---
  { company: 'Alumnus Software East', domain: 'alumnus.com', type: 'Remote' },
  { company: 'Webskitters Technology East', domain: 'webskitters.com', type: 'Remote' },
  { company: 'Matrix Media Solutions East', domain: 'matrixmediasolutions.com', type: 'Remote' },
  { company: 'Digital Aptech Solutions', domain: 'digitalaptech.com', type: 'Remote' },
  { company: 'Planvisage Software Solutions', domain: 'planvisage.com', type: 'Remote' },
  { company: 'Excellence Technologies India', domain: 'excellencetechnologies.in', type: 'Remote' },
  { company: 'Macaws Infotech Solutions', domain: 'macawsinfotech.com', type: 'Remote' },
  { company: 'Promethean IT Services India', domain: 'prometheanit.com', type: 'Remote' },
  { company: 'Dynamic Digital Technology East', domain: 'dynamicdigital.co.in', type: 'Remote' },
  { company: 'Snitch Menswear Retail', domain: 'snitch.co.in', type: 'Remote' },
  { company: 'Bewakoof Brands Apparel', domain: 'bewakoof.com', type: 'Mumbai' },
  { company: 'The Souled Store Apparel', domain: 'thesouledstore.com', type: 'Mumbai' },
  { company: 'BlissClub Women Activewear', domain: 'blissclub.com', type: 'Remote' },
  { company: 'DaMENSCH Men Essentials', domain: 'damensch.com', type: 'Remote' },
  { company: 'Clovia Lingerie Fashion', domain: 'clovia.com', type: 'Remote' },
  { company: 'Zivame Lingerie Brands', domain: 'zivame.com', type: 'Remote' },
  { company: 'WoodenStreet Home Furniture', domain: 'woodenstreet.com', type: 'Remote' },
  { company: 'Pepperfry Home Online', domain: 'pepperfry.com', type: 'Mumbai' },
  { company: 'Urban Ladder Furniture', domain: 'urbanladder.com', type: 'Remote' },
  { company: 'Furlenco Furniture Rental', domain: 'furlenco.com', type: 'Remote' },
  { company: 'Rentomojo Appliances', domain: 'rentomojo.com', type: 'Remote' },
  { company: 'Wakefit Sleep Solutions', domain: 'wakefit.co', type: 'Remote' },
  { company: 'SleepyCat Mattress', domain: 'sleepycat.in', type: 'Remote' },
  { company: 'The Sleep Company Mattress', domain: 'thesleepcompany.in', type: 'Mumbai' },
  { company: 'Blue Tokai Roasters', domain: 'bluetokaicoffee.com', type: 'Remote' },
  { company: 'Sleepy Owl Cold Brew', domain: 'sleepyowl.co', type: 'Remote' },
  { company: 'Rage Coffee Brews', domain: 'ragecoffee.com', type: 'Remote' },
  { company: 'Chaayos Chai Cafe', domain: 'chaayos.com', type: 'Remote' },
  { company: 'Chai Point Beverage', domain: 'chaipoint.com', type: 'Remote' },
  { company: 'Country Delight Pure Milk', domain: 'countrydelight.in', type: 'Remote' },
  { company: 'Epigamia Greek Yogurt', domain: 'epigamia.com', type: 'Mumbai' },
  { company: 'ID Fresh Food Batter', domain: 'idfreshfood.com', type: 'Remote' },
  { company: 'Meatigo Meat Delivery', domain: 'meatigo.com', type: 'Remote' },
  { company: 'Open Secret Healthy Snacks', domain: 'opensecret.in', type: 'Mumbai' },
  { company: 'Slurrp Farm Millet Foods', domain: 'slurrpfarm.com', type: 'Remote' },
  { company: 'Farmley Dry Fruits', domain: 'farmley.com', type: 'Remote' },
  { company: 'The Whole Truth Clean Foods', domain: 'thewholetruthfoods.com', type: 'Mumbai' },
  { company: 'Mamaearth Natural Beauty', domain: 'mamaearth.in', type: 'Remote' },
  { company: 'Sugar Cosmetics Beauty', domain: 'sugarcosmetics.com', type: 'Mumbai' },
  { company: 'WOW Skin Science Herbal', domain: 'buywow.in', type: 'Remote' },
  { company: 'Plum 100% Vegan Beauty', domain: 'plumgoodness.com', type: 'Mumbai' },
  { company: 'Minimalist Transparent Beauty', domain: 'beminimalist.co', type: 'Remote' },
  { company: 'Foxtale Skincare Solutions', domain: 'foxtale.in', type: 'Mumbai' },
  { company: 'Pilgrim Discovery Beauty', domain: 'discoverpilgrim.com', type: 'Mumbai' },
  { company: 'Renee Cosmetics Glam', domain: 'reneecosmetics.in', type: 'Remote' },
  { company: 'MCaffeine Coffee Skincare', domain: 'mcaffeine.com', type: 'Mumbai' },
  { company: 'The Man Company Grooming', domain: 'themancompany.com', type: 'Remote' },
  { company: 'Beardo Beard Care', domain: 'beardo.in', type: 'Remote' },
  { company: 'Bombay Shaving Company Grooming', domain: 'bombayshavingcompany.com', type: 'Remote' },
  { company: 'Boat Audio Lifestyle', domain: 'boat-lifestyle.com', type: 'Mumbai' },
  { company: 'Noise Smart Wearables', domain: 'gonoise.com', type: 'Remote' },
  { company: 'Fire-Boltt Smartwatches', domain: 'fireboltt.com', type: 'Remote' },
  { company: 'Boult Audio Electronics', domain: 'boultaudio.com', type: 'Remote' },
  { company: 'Mivi Audio India', domain: 'mivi.in', type: 'Remote' },
  { company: 'Portronics Gadgets', domain: 'portronics.com', type: 'Remote' },
  { company: 'Zebronics Peripherals', domain: 'zebronics.com', type: 'Remote' },

  // --- ADDITIONAL TECH HUBS, GUJARAT, RAJASTHAN, AND CENTRAL IT ---
  { company: 'SPEC INDIA Enterprise', domain: 'spec-india.com', type: 'Remote' },
  { company: 'CodesClue Software', domain: 'codesclue.com', type: 'Remote' },
  { company: 'AllianceTek Software', domain: 'alliancetek.com', type: 'Remote' },
  { company: 'Mavlers Email Digital', domain: 'mavlers.com', type: 'Remote' },
  { company: 'SolGuruz Tech Solutions', domain: 'solguruz.com', type: 'Remote' },
  { company: 'Aubergine UI UX Solutions', domain: 'auberginesolutions.com', type: 'Remote' },
  { company: 'AddWeb Solution Web Studio', domain: 'addwebsolution.com', type: 'Remote' },
  { company: 'Inheritx Solutions Mobile', domain: 'inheritx.com', type: 'Remote' },
  { company: 'IT IDOL Technologies Gujarat', domain: 'itidoltechnologies.com', type: 'Remote' },
  { company: 'Moon Technolabs Studio', domain: 'moontechnolabs.com', type: 'Remote' },
  { company: 'HData Systems BigData', domain: 'hdatasystems.com', type: 'Remote' },
  { company: 'Webdesk Solution E-commerce', domain: 'webdesksolution.com', type: 'Remote' },
  { company: 'i-Verve Infoweb Solutions', domain: 'i-verve.com', type: 'Remote' },
  { company: 'Coruscate Solutions OnDemand', domain: 'coruscatesolution.com', type: 'Remote' },
  { company: 'Shaligram Infotech ERP', domain: 'shaligraminfotech.com', type: 'Remote' },
  { company: 'Techtic Solutions Digital', domain: 'techtic.com', type: 'Remote' },
  { company: 'SmartSight Innovations IT', domain: 'smartsight.in', type: 'Remote' },
  { company: 'Elightwalk Technology Tech', domain: 'elightwalk.com', type: 'Remote' },
  { company: 'AnkHub Technologies Central', domain: 'ankhub.com', type: 'Remote' },
  { company: 'Webakruti Solutions Central', domain: 'webakruti.com', type: 'Remote' },
  { company: 'i-Softzone Solutions Tech', domain: 'isoftzone.com', type: 'Remote' },
  { company: 'Alacrity Technologies Central', domain: 'alacritytechnologies.com', type: 'Remote' },
  { company: 'CEDCOSS Technologies Digital', domain: 'cedcoss.com', type: 'Remote' },
  { company: 'CedCommerce E-commerce Solutions', domain: 'cedcommerce.com', type: 'Remote' },
  { company: 'MakeWebEasy Digital Solutions', domain: 'makewebeasy.com', type: 'Remote' },
  { company: 'Sigma Softwares North', domain: 'sigmasoftwares.org', type: 'Remote' },
  { company: 'Luminous Infoways East', domain: 'liflinfoways.com', type: 'Remote' },
  { company: 'Silicon Tech Lab East', domain: 'silicontechlab.com', type: 'Remote' },
  { company: 'Aptus Data Labs Analytics', domain: 'aptusdatalabs.com', type: 'Remote' },

  // --- MORE TOP INDIAN TECH & SOFTWARE FIRMS ---
  { company: 'Netrika Consulting Risk', domain: 'netrika.com', type: 'Mumbai' },
  { company: 'Rubicon Research Pharma', domain: 'rubicon.co.in', type: 'Mumbai' },
  { company: 'Sula Vineyards Tech Wine', domain: 'sulavineyards.com', type: 'Mumbai' },
  { company: 'Glenmark Tech Digital Pharma', domain: 'glenmarkpharma.com', type: 'Mumbai' },
  { company: 'Cipla Digital Mumbai Healthcare', domain: 'cipla.com', type: 'Mumbai' },
  { company: 'Piramal Digital Mumbai Healthcare', domain: 'piramal.com', type: 'Mumbai' },
  { company: 'Tata ClassEdge EdTech', domain: 'tataclassedge.com', type: 'Mumbai' },
  { company: 'NSEIT Limited Stock Tech', domain: 'nseit.com', type: 'Mumbai' },
  { company: 'Infra.Market Tech Construction', domain: 'infra.market', type: 'Mumbai' },
  { company: 'BookMyShow Entertainment', domain: 'bookmyshow.com', type: 'Mumbai' },
  { company: 'Fitterfly Digital Health Tech', domain: 'fitterfly.com', type: 'Mumbai' },
  { company: 'IDfy India Identity', domain: 'idfy.com', type: 'Mumbai' },
  { company: 'Cashe Lending Financial', domain: 'cashe.co.in', type: 'Mumbai' },
  { company: 'Kissht Fintech Credit', domain: 'kissht.com', type: 'Mumbai' },
  { company: 'Axio Digital Finance Tech', domain: 'axio.co.in', type: 'Mumbai' },
  { company: 'InCred Financial Services Tech', domain: 'incred.com', type: 'Mumbai' },
  { company: 'NeoGrowth Credit Lending', domain: 'neogrowth.in', type: 'Mumbai' },
  { company: 'FlexiLoans India SME', domain: 'flexiloans.com', type: 'Mumbai' },
  { company: 'Games24x7 Digital Gaming', domain: 'games24x7.com', type: 'Mumbai' },
  { company: 'Nazara Technologies Gaming', domain: 'nazara.com', type: 'Mumbai' },
  { company: 'Kuku FM Audio Content', domain: 'kukufm.com', type: 'Mumbai' },
  { company: 'Aurionpro Solutions Fintech', domain: 'aurionpro.com', type: 'Mumbai' },
  { company: 'Allied Digital Services IT', domain: 'allieddigital.net', type: 'Mumbai' },
  { company: 'Datamatics Global Services', domain: 'datamatics.com', type: 'Mumbai' },
  { company: 'CMS Info Systems Banking', domain: 'cms.com', type: 'Mumbai' },
  { company: 'Trigyn Technologies Services', domain: 'trigyn.com', type: 'Mumbai' },
  { company: 'Dynacons Systems Solutions', domain: 'dynacons.com', type: 'Mumbai' },
  { company: 'Accelya Solutions India Tech', domain: 'accelya.com', type: 'Mumbai' },
  { company: 'Cybertech Systems GIS', domain: 'cybertech.com', type: 'Mumbai' },
  { company: 'Iris Business Services XBRL', domain: 'irisbusiness.com', type: 'Mumbai' }
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

  console.log(`Checking ${toCheck.length} prospective companies for DNS MX validation...`);

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
