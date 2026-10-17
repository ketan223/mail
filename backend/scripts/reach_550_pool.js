const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

// 1. Load existing verified pool (currently 333 companies)
let existingVerified = [];
try {
  existingVerified = JSON.parse(fs.readFileSync(path.join(__dirname, 'final_verified_pool.json'), 'utf8') || '[]');
} catch (e) {
  try {
    existingVerified = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified_massive_pool.json'), 'utf8') || '[]');
  } catch (e2) {}
}

console.log(`Starting with ${existingVerified.length} previously verified uncontacted companies.`);

const newCandidates = [
  // --- KERALA TECHNOPARK / INFOPARK IT FIRMS ---
  { company: 'InApp Information Technologies', domain: 'inapp.com', type: 'Remote' },
  { company: 'Speridian Technologies', domain: 'speridian.com', type: 'Remote' },
  { company: 'Toonz Animation Media', domain: 'toonz.co', type: 'Remote' },
  { company: 'LiteBreeze Infotech', domain: 'litebreeze.com', type: 'Remote' },
  { company: 'Applexus Technologies', domain: 'applexus.com', type: 'Remote' },
  { company: 'SayOne Technologies', domain: 'sayonetech.com', type: 'Remote' },
  { company: 'Artin Dynamics', domain: 'artindynamics.com', type: 'Remote' },
  { company: 'TechVersant Infotech', domain: 'techversantinfotech.com', type: 'Remote' },
  { company: 'Verbat Technologies', domain: 'verbat.com', type: 'Remote' },
  { company: 'Cabot Technology Solutions', domain: 'cabot-tech.com', type: 'Remote' },
  { company: 'Armia Systems', domain: 'armia.com', type: 'Remote' },
  { company: 'HashRoot Technologies', domain: 'hashroot.com', type: 'Remote' },
  { company: 'Bridge Global IT', domain: 'bridge-global.com', type: 'Remote' },
  { company: 'Aufait Technologies', domain: 'aufait.com', type: 'Remote' },
  { company: 'Codilar Technologies', domain: 'codilar.com', type: 'Remote' },
  { company: 'Experion Global', domain: 'experionglobal.com', type: 'Remote' },
  { company: 'Fingent Software', domain: 'fingent.com', type: 'Remote' },
  { company: 'QBurst Technologies', domain: 'qburst.com', type: 'Remote' },
  { company: 'Perfomatix Solutions', domain: 'perfomatix.com', type: 'Remote' },
  { company: 'Reflections Info Systems', domain: 'reflectionsinfos.com', type: 'Remote' },

  // --- PUNJAB / CHANDIGARH / MOHALI TECH STUDIOS ---
  { company: 'WebHopers Infotech', domain: 'webhopers.com', type: 'Remote' },
  { company: 'ToXSL Technologies', domain: 'toxsl.com', type: 'Remote' },
  { company: 'Debut Infotech', domain: 'debutinfotech.com', type: 'Remote' },
  { company: 'Softobiz Technologies', domain: 'softobiz.com', type: 'Remote' },
  { company: 'Megrisoft Technologies', domain: 'megrisoft.com', type: 'Remote' },
  { company: 'Softuvo Solutions', domain: 'softuvo.com', type: 'Remote' },
  { company: 'RV Technologies Softwares', domain: 'rvtechnologies.com', type: 'Remote' },
  { company: 'Think360 Studio', domain: 'think360studio.com', type: 'Remote' },
  { company: 'Code Brew Labs', domain: 'codebrewlabs.com', type: 'Remote' },
  { company: 'CS Soft Solutions', domain: 'cssoftsolutions.com', type: 'Remote' },
  { company: 'Suffescom Solutions', domain: 'suffescom.com', type: 'Remote' },
  { company: 'RisingMax Inc', domain: 'risingmax.com', type: 'Remote' },
  { company: 'MobileCoderz Technologies', domain: 'mobilecoderz.com', type: 'Remote' },
  { company: 'Trank Technologies', domain: 'tranktechnologies.com', type: 'Remote' },
  { company: 'MindInventory Mohali', domain: 'mindinventory.com', type: 'Remote' },
  { company: 'Net Solutions Global', domain: 'netsolutions.com', type: 'Remote' },
  { company: 'Zapbuild Technologies', domain: 'zapbuild.com', type: 'Remote' },
  { company: 'Click Labs Global', domain: 'click-labs.com', type: 'Remote' },
  { company: 'JungleWorks SaaS', domain: 'jungleworks.com', type: 'Remote' },
  { company: 'Signicent Information', domain: 'signicent.com', type: 'Remote' },

  // --- RAJASTHAN / JAIPUR TECH FIRMS ---
  { company: 'Konstant Infosolutions', domain: 'konstantinfo.com', type: 'Remote' },
  { company: 'TechAhead Software', domain: 'techaheadcorp.com', type: 'Remote' },
  { company: 'SynapseIndia Tech', domain: 'synapseindia.com', type: 'Remote' },
  { company: 'PixelCrayons Infotech', domain: 'pixelcrayons.com', type: 'Remote' },
  { company: 'ValueCoders Solutions', domain: 'valuecoders.com', type: 'Remote' },
  { company: 'IndiaNIC Infotech', domain: 'indianic.com', type: 'Remote' },
  { company: 'Magneto IT Solutions', domain: 'magnetoitsolutions.com', type: 'Remote' },
  { company: 'Brainvire Infotech', domain: 'brainvire.com', type: 'Remote' },
  { company: 'Startbit IT Solutions', domain: 'startbitit.com', type: 'Remote' },
  { company: 'AleaIT Solutions', domain: 'aleait.com', type: 'Remote' },
  { company: 'DreamSoft4u Pvt', domain: 'dreamsoft4u.com', type: 'Remote' },
  { company: 'LogicSpice Consultancy', domain: 'logicspice.com', type: 'Remote' },
  { company: 'Metacube Software', domain: 'metacube.com', type: 'Remote' },
  { company: 'Damco Solutions', domain: 'damcogroup.com', type: 'Remote' },
  { company: 'Oodles Technologies', domain: 'oodles.com', type: 'Remote' },

  // --- CENTRAL INDIA / INDORE / BHOPAL FIRMS ---
  { company: 'PureSoftware Technology', domain: 'puresoftware.com', type: 'Remote' },
  { company: 'Evon Technologies', domain: 'evontech.com', type: 'Remote' },
  { company: 'Vvdn Technologies Tech', domain: 'vvdntech.com', type: 'Remote' },
  { company: 'IT Chimes Solutions', domain: 'itchimes.com', type: 'Remote' },
  { company: 'Shunya Ekai Tech', domain: 'shunyaekai.tech', type: 'Remote' },
  { company: 'Oasis Inventor IT', domain: 'oasisis.com', type: 'Remote' },
  { company: 'Yuvasoft Technologies', domain: 'yuvasoft.com', type: 'Remote' },
  { company: 'CDN Solutions Group', domain: 'cdnsol.com', type: 'Remote' },
  { company: 'Webgility India Tech', domain: 'webgility.com', type: 'Remote' },
  { company: 'Infograins Software', domain: 'infograins.com', type: 'Remote' },

  // --- TAMIL NADU / COIMBATORE / MADURAI FIRMS ---
  { company: 'KGISL Group', domain: 'kgisl.com', type: 'Remote' },
  { company: 'Bright Bridge Infotech', domain: 'brightbridgeinfotech.com', type: 'Remote' },
  { company: 'AES Technologies India', domain: 'aestechnologies.in', type: 'Remote' },
  { company: 'Vee Technologies Global', domain: 'veetechnologies.com', type: 'Remote' },
  { company: 'Colan Infotech Tech', domain: 'colaninfotech.com', type: 'Remote' },
  { company: 'Wavicle Data Solutions', domain: 'wavicledata.com', type: 'Remote' },
  { company: 'Avanze Group Tech', domain: 'avanzegroup.com', type: 'Remote' },
  { company: 'Accent Techno Soft', domain: 'accenttechnosoft.com', type: 'Remote' },
  { company: 'Hakuna Matata Solutions', domain: 'hakunamatatatech.com', type: 'Remote' },
  { company: 'Macappstudio Tech', domain: 'macappstudio.com', type: 'Remote' },
  { company: 'Spritle Software Labs', domain: 'spritle.com', type: 'Remote' },
  { company: 'Agira Technologies', domain: 'agiratech.com', type: 'Remote' },
  { company: 'DCKAP Digital Commerce', domain: 'dckap.com', type: 'Remote' },
  { company: 'NDOT Technologies', domain: 'ndot.in', type: 'Remote' },
  { company: 'Crave InfoTech Global', domain: 'craveinfotech.com', type: 'Remote' },
  { company: 'Softura Software', domain: 'softura.com', type: 'Remote' },
  { company: 'Team Tweaks Technologies', domain: 'teamtweaks.com', type: 'Remote' },
  { company: 'Smarther Technologies', domain: 'smarther.co', type: 'Remote' },
  { company: 'Dot Com Infoway DCI', domain: 'dotcominfoway.com', type: 'Remote' },
  { company: 'Pyramidion Solutions', domain: 'pyramidions.com', type: 'Remote' },
  { company: 'Wenable Technologies', domain: 'wenable.com', type: 'Remote' },

  // --- EAST INDIA / KOLKATA / ODISHA FIRMS ---
  { company: 'WebGuru Infosystems', domain: 'webguru-india.com', type: 'Remote' },
  { company: 'Karmick Solutions', domain: 'karmicksolutions.com', type: 'Remote' },
  { company: 'NextGen IT Solutions', domain: 'nextgenitsolutions.com', type: 'Remote' },
  { company: 'Infosky Solutions', domain: 'infoskysolutions.com', type: 'Remote' },
  { company: 'Cyber Swift Infotech', domain: 'cyberswift.com', type: 'Remote' },
  { company: 'Brainium Information Technologies', domain: 'brainiuminfotech.com', type: 'Remote' },
  { company: 'Lee & Nee Software', domain: 'lnsel.com', type: 'Remote' },
  { company: 'Globsyn Technologies', domain: 'globsyn.com', type: 'Remote' },
  { company: 'RS Software India', domain: 'rssoftware.com', type: 'Remote' },
  { company: 'TCG Digital Solutions', domain: 'tcgdigital.com', type: 'Remote' },
  { company: 'Wizertech Informatics', domain: 'wizertech.com', type: 'Remote' },
  { company: 'Tatwa Technologies East', domain: 'tatwa.info', type: 'Remote' },
  { company: 'Silicon Tech Lab Tech', domain: 'silicontechlab.com', type: 'Remote' },
  { company: 'Aptus Data Labs Analytics', domain: 'aptusdatalabs.com', type: 'Remote' },

  // --- DELHI NCR / NOIDA / GURGAON AGENCIES & PRODUCT STUDIOS ---
  { company: 'OrangeMantra Digital', domain: 'orangemantra.com', type: 'Remote' },
  { company: 'Prologic Technologies', domain: 'prologic-technologies.com', type: 'Remote' },
  { company: 'RapidOps Solutions', domain: 'rapidops.com', type: 'Remote' },
  { company: 'Srijan Technologies', domain: 'srijan.net', type: 'Remote' },
  { company: 'Tavant Technologies', domain: 'tavant.com', type: 'Remote' },
  { company: 'Virtual Employee India', domain: 'virtualemployee.com', type: 'Remote' },
  { company: 'Xavient Digital Solutions', domain: 'xavient.com', type: 'Remote' },
  { company: 'Zuora Software India', domain: 'zuora.com', type: 'Remote' },
  { company: 'BaffleSol Technologies', domain: 'bafflesol.com', type: 'Remote' },
  { company: 'BluePi Consulting', domain: 'bluepiit.com', type: 'Remote' },
  { company: 'Centilytics Cloud Ops', domain: 'centilytics.com', type: 'Remote' },
  { company: 'CrossAsyst Technologies', domain: 'crossasyst.com', type: 'Pune' },
  { company: 'DataTracks Services Global', domain: 'datatracks.com', type: 'Remote' },
  { company: 'Edifecs Healthcare IT', domain: 'edifecs.com', type: 'Remote' },
  { company: 'Finxera India Software', domain: 'finxera.com', type: 'Remote' },
  { company: 'Holisol Logistics Tech', domain: 'holisollogistics.com', type: 'Remote' },
  { company: 'Icreon Tech Global', domain: 'icreon.com', type: 'Remote' },
  { company: 'ImpactQA Infotech', domain: 'impactqa.com', type: 'Remote' },
  { company: 'Knoldus Software Systems', domain: 'knoldus.com', type: 'Remote' },
  { company: 'Mavenir Telecom Software', domain: 'mavenir.com', type: 'Remote' },
  { company: 'Mobikasa Digital Studio', domain: 'mobikasa.com', type: 'Remote' },
  { company: 'Netlink Software Group', domain: 'netlink.com', type: 'Remote' },

  // --- INDIAN SAAS, FINTECH & CLOUD PLATFORMS ---
  { company: 'AppyPie App Builder', domain: 'appypie.com', type: 'Remote' },
  { company: 'Muvi Video Streaming', domain: 'muvi.com', type: 'Remote' },
  { company: 'Videonetics AI Security', domain: 'videonetics.com', type: 'Remote' },
  { company: 'Tonbo Imaging Optics', domain: 'tonboimaging.com', type: 'Remote' },
  { company: 'Cron AI Perception', domain: 'cronai.ai', type: 'Remote' },
  { company: 'Playment Data Intelligence', domain: 'playment.io', type: 'Remote' },
  { company: 'NextBillion.ai Spatial', domain: 'nextbillion.ai', type: 'Remote' },
  { company: 'Locale.ai Logistics Analytics', domain: 'locale.ai', type: 'Remote' },
  { company: 'Reverie Language AI', domain: 'reverieinc.com', type: 'Remote' },
  { company: 'Process9 Indic Tech', domain: 'process9.com', type: 'Remote' },
  { company: 'SquadStack Tech', domain: 'squadstack.com', type: 'Remote' },
  { company: 'Upshot.ai Engagement', domain: 'upshot.ai', type: 'Remote' },
  { company: 'Smartkarrot Customer Success', domain: 'smartkarrot.com', type: 'Remote' },
  { company: 'Custify Customer Success', domain: 'custify.com', type: 'Remote' },
  { company: 'Userlane Digital Adoption', domain: 'userlane.com', type: 'Remote' },
  { company: 'WalkMe Enterprise Cloud', domain: 'walkme.com', type: 'Remote' },
  { company: 'Spinny Valuedrive', domain: 'spinny.com', type: 'Remote' },
  { company: 'Droom Technology', domain: 'droom.in', type: 'Remote' },
  { company: 'CreditMantri Fintech', domain: 'creditmantri.com', type: 'Remote' },
  { company: 'CreditVidya Alternative Data', domain: 'creditvidya.com', type: 'Remote' },
  { company: 'FinBox Credit Intelligence', domain: 'finbox.in', type: 'Remote' },
  { company: 'Setu Open Banking APIs', domain: 'setu.co', type: 'Remote' },
  { company: 'Hyperface Modern Card Issuance', domain: 'hyperface.co', type: 'Remote' },
  { company: 'KredX Invoice Discounting', domain: 'kredx.com', type: 'Remote' },
  { company: 'Vayana Network Financing', domain: 'vayana.com', type: 'Pune' },
  { company: 'ClearTax Clear Invoicing', domain: 'clear.in', type: 'Remote' },
  { company: 'Innovaccer Health Platform', domain: 'innovaccer.com', type: 'Remote' },
  { company: 'Amagi Media Cloud', domain: 'amagi.com', type: 'Remote' },
  { company: 'Turtlemint Insurance', domain: 'turtlemint.com', type: 'Mumbai' },
  { company: 'Daffodil Software Gurgaon', domain: 'daffodilsw.com', type: 'Remote' },
  { company: 'Wingify VWO Testing', domain: 'wingify.com', type: 'Remote' },
  { company: 'RateGain Travel Technologies', domain: 'rategain.com', type: 'Remote' },
  { company: 'Polestar Solutions Analytics', domain: 'polestarllp.com', type: 'Remote' },
  { company: 'Nucleus Software Exports', domain: 'nucleussoftware.com', type: 'Remote' },
  { company: 'Newgen Software Tech', domain: 'newgensoft.com', type: 'Remote' },
  { company: 'TO THE NEW Cloud Digital', domain: 'tothenew.com', type: 'Remote' }
];

async function run() {
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');
  const contactedDomains = new Set();
  sentLog.forEach(x => {
    if (x.email) {
      const p = x.email.split('@')[1];
      if (p) contactedDomains.add(p.toLowerCase().trim());
    }
  });

  const knownDomains = new Set();
  const mergedPool = [];

  for (const c of existingVerified) {
    const d = (c.domain || '').toLowerCase().trim();
    if (d && !contactedDomains.has(d) && !knownDomains.has(d)) {
      knownDomains.add(d);
      mergedPool.push(c);
    }
  }

  const toCheck = [];
  for (const c of newCandidates) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || knownDomains.has(d) || contactedDomains.has(d)) continue;
    knownDomains.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking MX records for ${toCheck.length} candidates...`);

  const CONCURRENCY = 25;
  let newAdded = 0;
  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const chunk = toCheck.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (c) => {
      try {
        const mx = await dns.resolveMx(c.domain);
        if (mx && mx.length > 0) {
          mergedPool.push(c);
          newAdded++;
        }
      } catch (err) {}
    }));
    process.stdout.write(`\rProgress: ${Math.min(i + CONCURRENCY, toCheck.length)} / ${toCheck.length} | Newly verified: ${newAdded} | Total pool: ${mergedPool.length}`);
  }

  console.log(`\n\nTotal Verified Fresh Directory: ${mergedPool.length}`);
  fs.writeFileSync(path.join(__dirname, 'final_verified_pool.json'), JSON.stringify(mergedPool, null, 2), 'utf8');

  return mergedPool;
}

run().catch(console.error);
