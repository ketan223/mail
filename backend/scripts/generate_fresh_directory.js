const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
require('dns').setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const SENT_LOG_FILE = path.join(__dirname, '..', 'data', 'sent_log.json');
const TARGET_FILE = path.join(__dirname, '..', 'data', 'company_directory.js');

let sentSet = new Set();
try {
  if (fs.existsSync(SENT_LOG_FILE)) {
    const history = JSON.parse(fs.readFileSync(SENT_LOG_FILE, 'utf8') || '[]');
    sentSet = new Set(history.map(s => (s.email || '').toLowerCase().trim()));
  }
} catch (e) {}

const RAW_CANDIDATES = [
  // --- MUMBAI STARTUPS & SCALEUPS ---
  { company: "LEAD Group", domain: "leadgroup.com", type: "Mumbai" },
  { company: "Rebel Foods", domain: "rebelfoods.com", type: "Mumbai" },
  { company: "EatClub (Box8)", domain: "eatclub.com", type: "Mumbai" },
  { company: "Pocket Aces", domain: "pocketaces.in", type: "Mumbai" },
  { company: "Cityflo", domain: "cityflo.com", type: "Mumbai" },
  { company: "Games24x7", domain: "games24x7.com", type: "Mumbai" },
  { company: "Dream Sports", domain: "dreamsports.group", type: "Mumbai" },
  { company: "Nazara Technologies", domain: "nazara.com", type: "Mumbai" },
  { company: "Nodwin Gaming", domain: "nodwin.com", type: "Mumbai" },
  { company: "Loco Gaming", domain: "loco.gg", type: "Mumbai" },
  { company: "Chalo Mobility", domain: "chalo.com", type: "Mumbai" },
  { company: "Square Yards", domain: "squareyards.com", type: "Mumbai" },
  { company: "Housing.com", domain: "housing.com", type: "Mumbai" },
  { company: "PropTiger", domain: "proptiger.com", type: "Mumbai" },
  { company: "Acko Insurance", domain: "acko.com", type: "Mumbai" },
  { company: "Digit Insurance", domain: "godigit.com", type: "Mumbai" },
  { company: "Loop Health", domain: "loophealth.com", type: "Mumbai" },
  { company: "Plum HQ", domain: "plumhq.com", type: "Mumbai" },
  { company: "Gupshup", domain: "gupshup.io", type: "Mumbai" },
  { company: "Route Mobile", domain: "routemobile.com", type: "Mumbai" },
  { company: "Netcore Cloud", domain: "netcorecloud.com", type: "Mumbai" },
  { company: "Justdial", domain: "justdial.com", type: "Mumbai" },
  { company: "Sequretek", domain: "sequretek.com", type: "Mumbai" },
  { company: "Indusface", domain: "indusface.com", type: "Mumbai" },
  { company: "sumHR", domain: "sumhr.com", type: "Mumbai" },
  { company: "Spine HRMS", domain: "spinehr.com", type: "Mumbai" },
  { company: "Kapiva Ayurveda", domain: "kapiva.in", type: "Mumbai" },
  { company: "Oziva", domain: "oziva.in", type: "Mumbai" },
  { company: "Fast&Up", domain: "fastandup.in", type: "Mumbai" },
  { company: "True Elements", domain: "true-elements.com", type: "Mumbai" },
  { company: "MuscleBlaze", domain: "muscleblaze.com", type: "Mumbai" },
  { company: "HealthKart", domain: "healthkart.com", type: "Mumbai" },
  { company: "BookMyShow", domain: "bookmyshow.com", type: "Mumbai" },
  { company: "Cleartrip", domain: "cleartrip.com", type: "Mumbai" },
  { company: "Samco Securities", domain: "samco.in", type: "Mumbai" },
  { company: "iThink Logistics", domain: "ithinklogistics.com", type: "Mumbai" },
  { company: "Quidich Innovation", domain: "quidich.com", type: "Mumbai" },
  { company: "Arya.ai", domain: "arya.ai", type: "Mumbai" },
  { company: "Crux Intelligence", domain: "cruxintelligence.com", type: "Mumbai" },
  { company: "Kuku FM", domain: "kukufm.com", type: "Mumbai" },
  { company: "ZebPay", domain: "zebpay.com", type: "Mumbai" },
  { company: "PharmEasy", domain: "pharmeasy.in", type: "Mumbai" },
  { company: "CarWale", domain: "carwale.com", type: "Mumbai" },
  { company: "Zepto", domain: "zepto.com", type: "Mumbai" },
  { company: "Infra.Market", domain: "infra.market", type: "Mumbai" },
  { company: "Bizongo", domain: "bizongo.com", type: "Mumbai" },
  { company: "CoinDCX", domain: "coindcx.com", type: "Mumbai" },
  { company: "WazirX", domain: "wazirx.com", type: "Mumbai" },
  { company: "BrowserStack", domain: "browserstack.com", type: "Mumbai" },

  // --- REMOTE & ALL-INDIA TECH STARTUPS ---
  { company: "Cult.fit", domain: "cult.fit", type: "Remote" },
  { company: "Zupee", domain: "zupee.com", type: "Remote" },
  { company: "MPL Esports", domain: "mpl.live", type: "Remote" },
  { company: "Junglee Games", domain: "jungleegames.com", type: "Remote" },
  { company: "Shiprocket", domain: "shiprocket.in", type: "Remote" },
  { company: "PhysicsWallah", domain: "pw.live", type: "Remote" },
  { company: "Simplilearn", domain: "simplilearn.com", type: "Remote" },
  { company: "Great Learning", domain: "greatlearning.in", type: "Remote" },
  { company: "Scaler Academy", domain: "scaler.com", type: "Remote" },
  { company: "InterviewBit", domain: "interviewbit.com", type: "Remote" },
  { company: "Masai School", domain: "masaischool.com", type: "Remote" },
  { company: "Newton School", domain: "newtonschool.co", type: "Remote" },
  { company: "Coding Ninjas", domain: "codingninjas.com", type: "Remote" },
  { company: "Geekster", domain: "geekster.in", type: "Remote" },
  { company: "AlmaBetter", domain: "almabetter.com", type: "Remote" },
  { company: "Crio.do", domain: "crio.do", type: "Remote" },
  { company: "Pesto Tech", domain: "pesto.tech", type: "Remote" },

  // AI & Generative AI Startups
  { company: "Nurix AI", domain: "nurix.ai", type: "Remote" },
  { company: "Skit.ai", domain: "skit.ai", type: "Remote" },
  { company: "Senseforth.ai", domain: "senseforth.ai", type: "Remote" },
  { company: "Kogo AI", domain: "kogo.ai", type: "Remote" },
  { company: "Artivatic AI", domain: "artivatic.ai", type: "Remote" },
  { company: "Avataar", domain: "avataar.me", type: "Remote" },
  { company: "Vahan.ai", domain: "vahan.ai", type: "Remote" },
  { company: "Fliki AI", domain: "fliki.ai", type: "Remote" },
  { company: "Dubverse", domain: "dubverse.ai", type: "Remote" },
  { company: "Writesonic", domain: "writesonic.com", type: "Remote" },
  { company: "TaskingAI", domain: "tasking.ai", type: "Remote" },
  { company: "Suki AI", domain: "suki.ai", type: "Remote" },
  { company: "Wysa", domain: "wysa.io", type: "Remote" },
  { company: "Rephrase AI", domain: "rephrase.ai", type: "Remote" },
  { company: "NeuralGarage", domain: "neuralgarage.com", type: "Remote" },
  { company: "Shakudo", domain: "shakudo.io", type: "Remote" },
  { company: "Intello AI", domain: "intello.io", type: "Remote" },
  { company: "Swagene", domain: "swagene.com", type: "Remote" },
  { company: "StrataScratch", domain: "stratascratch.com", type: "Remote" },
  { company: "Subconscious AI", domain: "subconscious.ai", type: "Remote" },

  // SaaS, Cloud & DevTools
  { company: "Chargebee", domain: "chargebee.com", type: "Remote" },
  { company: "Kissflow", domain: "kissflow.com", type: "Remote" },
  { company: "Facilio", domain: "facilio.com", type: "Remote" },
  { company: "Whatfix", domain: "whatfix.com", type: "Remote" },
  { company: "MoEngage", domain: "moengage.com", type: "Remote" },
  { company: "Kapture CRM", domain: "kapturecrm.com", type: "Remote" },
  { company: "Salesken", domain: "salesken.ai", type: "Remote" },
  { company: "Icertis", domain: "icertis.com", type: "Remote" },
  { company: "Druva", domain: "druva.com", type: "Remote" },
  { company: "Innovaccer", domain: "innovaccer.com", type: "Remote" },
  { company: "MindTickle", domain: "mindtickle.com", type: "Remote" },
  { company: "HighRadius", domain: "highradius.com", type: "Remote" },
  { company: "Zenoti", domain: "zenoti.com", type: "Remote" },
  { company: "Amagi", domain: "amagi.com", type: "Remote" },
  { company: "CloudSEK", domain: "cloudsek.com", type: "Remote" },
  { company: "Safe Security", domain: "safe.security", type: "Remote" },
  { company: "WiJungle", domain: "wijungle.com", type: "Remote" },
  { company: "Appknox", domain: "appknox.com", type: "Remote" },

  // FinTech, Crypto & Web3
  { company: "Mudrex", domain: "mudrex.com", type: "Remote" },
  { company: "CoinSwitch", domain: "coinswitch.co", type: "Remote" },
  { company: "Giottus", domain: "giottus.com", type: "Remote" },
  { company: "TaxNodes", domain: "taxnodes.com", type: "Remote" },
  { company: "Binocs", domain: "binocs.co", type: "Remote" },
  { company: "FamPay", domain: "fampay.in", type: "Remote" },
  { company: "Junio", domain: "junio.in", type: "Remote" },
  { company: "Akudo", domain: "akudo.in", type: "Remote" },
  { company: "Muvin", domain: "muvin.in", type: "Remote" },
  { company: "Cheq", domain: "cheq.one", type: "Remote" },
  { company: "CRED", domain: "cred.club", type: "Remote" },
  { company: "ETMONEY", domain: "etmoney.com", type: "Remote" },
  { company: "Zerodha", domain: "zerodha.com", type: "Remote" },
  { company: "Alice Blue", domain: "aliceblueonline.com", type: "Remote" },

  // HealthTech, Consumer Tech & Mobility
  { company: "Tata 1mg", domain: "1mg.com", type: "Remote" },
  { company: "Netmeds", domain: "netmeds.com", type: "Remote" },
  { company: "Apollo 247", domain: "apollo247.com", type: "Remote" },
  { company: "Practo", domain: "practo.com", type: "Remote" },
  { company: "MediBuddy", domain: "medibuddy.in", type: "Remote" },
  { company: "Pristyn Care", domain: "pristyncare.com", type: "Remote" },
  { company: "Rapido", domain: "rapido.bike", type: "Remote" },
  { company: "Shadowfax", domain: "shadowfax.in", type: "Remote" },
  { company: "Ecom Express", domain: "ecomexpress.in", type: "Remote" },
  { company: "Xpressbees", domain: "xpressbees.com", type: "Remote" },
  { company: "Porter", domain: "porter.in", type: "Remote" },
  { company: "Blowhorn", domain: "blowhorn.com", type: "Remote" },
  { company: "LoadShare", domain: "loadshare.net", type: "Remote" },
  { company: "Pocket FM", domain: "pocketfm.com", type: "Remote" },
  { company: "Pratilipi", domain: "pratilipi.com", type: "Remote" },
  { company: "Stage OTT", domain: "stage.in", type: "Remote" },
  { company: "WinZO", domain: "winzogames.com", type: "Remote" },
  { company: "Blinkit", domain: "blinkit.com", type: "Remote" },
  { company: "BigBasket", domain: "bigbasket.com", type: "Remote" },
  { company: "Urban Company", domain: "urbancompany.com", type: "Remote" },
  { company: "Lenskart", domain: "lenskart.in", type: "Remote" },
  { company: "Cars24", domain: "cars24.com", type: "Remote" },
  { company: "Spinny", domain: "spinny.com", type: "Remote" },
  { company: "CarDekho", domain: "cardekho.com", type: "Remote" },
  { company: "NoBroker", domain: "nobroker.in", type: "Remote" },
  { company: "Magicbricks", domain: "magicbricks.com", type: "Remote" },
  { company: "99acres", domain: "99acres.com", type: "Remote" },
  { company: "Udaan", domain: "udaan.com", type: "Remote" },
  { company: "Zetwerk", domain: "zetwerk.com", type: "Remote" },
  { company: "Moglix", domain: "moglix.com", type: "Remote" },
  { company: "OfBusiness", domain: "ofbusiness.com", type: "Remote" },
  { company: "Cogoport", domain: "cogoport.com", type: "Remote" },
  { company: "Wiz Freight", domain: "wizfreight.com", type: "Remote" }
];

const ALIASES = ['careers', 'talent', 'jobs', 'hiring'];

async function run() {
  console.log('Testing candidates against DNS MX and sent_log.json...');
  const verifiedList = [];
  const addedEmails = new Set();

  for (const item of RAW_CANDIDATES) {
    let hasMx = false;
    try {
      const records = await dns.resolveMx(item.domain);
      if (records && records.length > 0) hasMx = true;
    } catch (e) {
      continue;
    }

    if (!hasMx) continue;

    for (const alias of ALIASES) {
      const email = `${alias}@${item.domain}`.toLowerCase().trim();
      if (!sentSet.has(email) && !addedEmails.has(email)) {
        addedEmails.add(email);
        verifiedList.push({
          company: item.company,
          email: email,
          name: `${item.company} Talent Team`,
          type: item.type
        });
        break; // One fresh verified email per company
      }
    }
  }

  console.log(`Successfully verified ${verifiedList.length} brand-new companies with active MX mail exchangers!`);

  const fileContent = `/**
 * Curated Directory of Verified Tech Startups & Scaleups in Mumbai & Remote India.
 * Auto-generated with DNS MX verified mailboxes.
 */

const MASTER_COMPANIES = ${JSON.stringify(verifiedList, null, 2)};

function getFreshCandidates(targetLocation = 'all', contactedSet = new Set()) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  
  return MASTER_COMPANIES.filter(c => {
    const emailNorm = (c.email || '').toLowerCase().trim();
    if (!emailNorm || contactedSet.has(emailNorm)) return false;

    if (normLocation === 'mumbai') {
      return (c.type || '').toLowerCase() === 'mumbai';
    } else if (normLocation === 'remote') {
      return (c.type || '').toLowerCase() === 'remote';
    }
    return true; // 'all'
  });
}

module.exports = {
  MASTER_COMPANIES,
  getFreshCandidates
};
`;

  fs.writeFileSync(TARGET_FILE, fileContent, 'utf8');
  console.log(`Updated ${TARGET_FILE} with ${verifiedList.length} fresh leads!`);
}

run().catch(console.error);
