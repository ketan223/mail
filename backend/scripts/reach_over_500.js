const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

let currentVerified = [];
try {
  currentVerified = JSON.parse(fs.readFileSync(path.join(__dirname, 'final_verified_pool.json'), 'utf8') || '[]');
} catch (e) {}

console.log(`Starting with ${currentVerified.length} verified companies.`);

const candidates = [
  // --- DEEPTECH, AEROSPACE & ROBOTICS INDIA ---
  { company: 'Addverb Technologies', domain: 'addverb.com', type: 'Remote' },
  { company: 'Ati Motors', domain: 'atimotors.com', type: 'Remote' },
  { company: 'Emotix Miko Robotics', domain: 'miko.ai', type: 'Mumbai' },
  { company: 'Torus Robotics', domain: 'torusrobotics.com', type: 'Remote' },
  { company: 'Planys Technologies', domain: 'planys.com', type: 'Remote' },
  { company: 'EyeROV Underwater Robotics', domain: 'eyerov.com', type: 'Remote' },
  { company: 'Garuda Aerospace', domain: 'garudaaerospace.com', type: 'Remote' },
  { company: 'Skylark Drones', domain: 'skylarkdrones.com', type: 'Remote' },
  { company: 'Asteria Aerospace', domain: 'asteria.co.in', type: 'Remote' },
  { company: 'Dhruva Space', domain: 'dhruvaspace.com', type: 'Remote' },
  { company: 'Pixxel Space', domain: 'pixxel.space', type: 'Remote' },
  { company: 'Bellatrix Aerospace', domain: 'bellatrix.aero', type: 'Remote' },
  { company: 'Skyroot Aerospace', domain: 'skyroot.in', type: 'Remote' },
  { company: 'Agnikul Cosmos', domain: 'agnikul.in', type: 'Remote' },
  { company: 'Digantara Space', domain: 'digantara.com', type: 'Remote' },
  { company: 'GalaxEye Space', domain: 'galaxeye.space', type: 'Remote' },
  { company: 'Manastu Space', domain: 'manastuspace.com', type: 'Mumbai' },

  // --- DEVTOOLS, LOW-CODE & AI PLATFORMS ---
  { company: 'DhiWise DevPlatform', domain: 'dhiwise.com', type: 'Remote' },
  { company: 'Appsmith OpenSource', domain: 'appsmith.com', type: 'Remote' },
  { company: 'ToolJet LowCode', domain: 'tooljet.com', type: 'Remote' },
  { company: 'SuperTokens Auth', domain: 'supertokens.com', type: 'Remote' },
  { company: 'SigNoz Observability', domain: 'signoz.io', type: 'Remote' },
  { company: 'TrueFoundry MLOps', domain: 'truefoundry.com', type: 'Remote' },
  { company: 'CogniTensor AI', domain: 'cognitensor.com', type: 'Remote' },
  { company: 'Krutrim AI Platform', domain: 'krutrim.com', type: 'Remote' },
  { company: 'Gnani AI Voice', domain: 'gnani.ai', type: 'Remote' },
  { company: 'CoRover Conversational AI', domain: 'corover.ai', type: 'Remote' },
  { company: 'DevRev Developer CRM', domain: 'devrev.ai', type: 'Remote' },
  { company: 'Composio AI Agent Tools', domain: 'composio.dev', type: 'Remote' },

  // --- FINTECH, REGFIN & IDENTITY INFRASTRUCTURE ---
  { company: 'Probe42 Financial Data', domain: 'probe42.in', type: 'Remote' },
  { company: 'Rubix Data Sciences', domain: 'rubixdatasolutions.com', type: 'Mumbai' },
  { company: 'Vyapar Accounting App', domain: 'vyaparapp.in', type: 'Remote' },
  { company: 'GoNiyo Digital Banking', domain: 'goniyo.com', type: 'Remote' },
  { company: 'Gullak Money MicroSavings', domain: 'gullak.money', type: 'Remote' },
  { company: 'Jiraaf Alternative Assets', domain: 'jiraaf.com', type: 'Remote' },
  { company: 'Alt Graaf Fixed Returns', domain: 'altgraaf.com', type: 'Remote' },
  { company: 'Betterhalf AI Matrimony', domain: 'betterhalf.ai', type: 'Remote' },
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
  { company: 'Simform Solutions', domain: 'simform.com', type: 'Remote' },
  { company: 'OpenXcell Technolabs', domain: 'openxcell.com', type: 'Remote' },
  { company: 'Hidden Brains InfoTech', domain: 'hiddenbrains.com', type: 'Remote' },
  { company: 'Bacancy Technology', domain: 'bacancytechnology.com', type: 'Remote' },
  { company: 'Radixweb Technologies', domain: 'radixweb.com', type: 'Remote' },
  { company: 'Aalpha Information Systems', domain: 'aalpha.net', type: 'Remote' },
  { company: 'ZealousWeb Technologies', domain: 'zealousweb.com', type: 'Remote' },
  { company: 'Elsner Technologies', domain: 'elsner.com', type: 'Remote' },
  { company: 'MultiQoS Technologies', domain: 'multiqos.com', type: 'Remote' },
  { company: 'Yudiz Solutions Gujarat', domain: 'yudiz.com', type: 'Remote' },
  { company: 'ViitorCloud Technologies', domain: 'viitorcloud.com', type: 'Remote' },
  { company: 'BrainerHub Solutions', domain: 'brainerhub.com', type: 'Remote' },
  { company: 'Satva Softech', domain: 'satvasoftech.com', type: 'Remote' },
  { company: 'Sufalam Technologies', domain: 'sufalamtech.com', type: 'Remote' },
  { company: 'Inexture Solutions', domain: 'inexture.com', type: 'Remote' },
  { company: 'KrishaWeb Studio', domain: 'krishaweb.com', type: 'Remote' },
  { company: 'Amar Infotech Services', domain: 'amarinfotech.com', type: 'Remote' },
  { company: 'Rishabh Software', domain: 'rishabhsoft.com', type: 'Remote' },
  { company: 'DevStree IT Solutions', domain: 'devstree.com', type: 'Remote' },
  { company: 'TRooTech Business Solutions', domain: 'trootech.com', type: 'Remote' },
  { company: 'Webmob Technologies', domain: 'webmobtech.com', type: 'Remote' },
  { company: 'Concetto Labs Digital', domain: 'concettolabs.com', type: 'Remote' },
  { company: '7Span Software Studio', domain: '7span.com', type: 'Remote' },
  { company: 'eSparkBiz Technologies', domain: 'esparkinfo.com', type: 'Remote' },
  { company: 'TatvaSoft Technologies', domain: 'tatvasoft.com', type: 'Remote' },
  { company: 'RipenApps Technologies', domain: 'ripenapps.com', type: 'Remote' },
  { company: 'Hyperlink InfoSystem', domain: 'hyperlinkinfosystem.com', type: 'Remote' },
  { company: 'Space-O Technologies', domain: 'spaceotechnologies.com', type: 'Remote' },

  // --- ADDITIONAL PRODUCT & E-COMMERCE TECH ---
  { company: 'Plum HQ Tech', domain: 'plumhq.com', type: 'Remote' },
  { company: 'Decentro Tech Platform', domain: 'decentro.tech', type: 'Remote' },
  { company: 'Stackby Technologies', domain: 'stackby.com', type: 'Remote' },
  { company: 'SuperOps Cloud', domain: 'superops.ai', type: 'Remote' },
  { company: 'Rocketlane Customer Platform', domain: 'rocketlane.com', type: 'Remote' },
  { company: 'Sprinto Compliance Cloud', domain: 'sprinto.com', type: 'Remote' },
  { company: 'Toplyne Analytics', domain: 'toplyne.io', type: 'Remote' },
  { company: 'Segwise Mobile AI', domain: 'segwise.ai', type: 'Remote' },
  { company: 'InFeedo HR AI', domain: 'infeedo.com', type: 'Remote' },
  { company: 'Atlan Data Cloud', domain: 'atlan.com', type: 'Remote' },
  { company: 'BrowserStack Enterprise', domain: 'browserstack.com', type: 'Mumbai' },
  { company: 'Entropik Emotion Tech', domain: 'entropik.io', type: 'Remote' },
  { company: 'Acceldata Observability', domain: 'acceldata.io', type: 'Remote' },
  { company: 'Hevo Data Cloud', domain: 'hevodata.com', type: 'Remote' },
  { company: 'Ultrahuman Health Ring', domain: 'ultrahuman.com', type: 'Remote' },
  { company: 'Sarvam AI Labs', domain: 'sarvam.ai', type: 'Remote' },
  { company: 'Kapture CX Platform', domain: 'kapturecx.com', type: 'Remote' },
  { company: 'Salesken Intelligence', domain: 'salesken.ai', type: 'Remote' },
  { company: 'Convin AI Speech', domain: 'convin.ai', type: 'Remote' },
  { company: 'Enthu AI Quality', domain: 'enthu.ai', type: 'Remote' },
  { company: 'MeetRecord Sales AI', domain: 'meetrecord.com', type: 'Remote' },
  { company: 'CustomerXPs Clari5 AI', domain: 'customerxps.com', type: 'Remote' },
  { company: 'Perfios Financial Cloud', domain: 'perfios.com', type: 'Remote' },
  { company: 'Karza Tech Analytics', domain: 'karza.in', type: 'Mumbai' },
  { company: 'Bureau ID Security', domain: 'bureau.id', type: 'Remote' },
  { company: 'Hyperverge AI Vision', domain: 'hyperverge.co', type: 'Remote' },
  { company: 'SignDesk Digital Trust', domain: 'signdesk.com', type: 'Remote' },
  { company: 'Leegality Agreements', domain: 'leegality.com', type: 'Remote' },
  { company: 'LegalKart Legal Solutions', domain: 'legalkart.com', type: 'Remote' },
  { company: 'SpotDraft Legal AI', domain: 'spotdraft.com', type: 'Remote' },
  { company: 'Volopay Cards Platform', domain: 'volopay.com', type: 'Remote' },
  { company: 'Open Money Banking', domain: 'open.money', type: 'Remote' },
  { company: 'Zaggle Prepaid Platform', domain: 'zaggle.in', type: 'Remote' },
  { company: 'Happay Travel Cloud', domain: 'happay.com', type: 'Remote' },
  { company: 'ITILITE Expense SaaS', domain: 'itilite.com', type: 'Remote' },
  { company: 'Trackier Attribution SaaS', domain: 'trackier.com', type: 'Remote' },
  { company: 'VdoCipher DRM Platform', domain: 'vdocipher.com', type: 'Remote' },
  { company: 'Gumlet Media Cloud', domain: 'gumlet.com', type: 'Remote' },
  { company: 'ImageKit CDN', domain: 'imagekit.io', type: 'Remote' },
  { company: 'Bikayi Platform', domain: 'bikayi.com', type: 'Remote' },
  { company: 'Dukaan Online Platform', domain: 'mydukaan.io', type: 'Remote' },
  { company: 'Shipway Logistics Track', domain: 'shipway.com', type: 'Remote' },
  { company: 'NimbusPost Shipping Platform', domain: 'nimbuspost.com', type: 'Remote' },
  { company: 'WareIQ Fullfillment Cloud', domain: 'wareiq.com', type: 'Remote' },
  { company: 'Edgistify Logistics Platform', domain: 'edgistify.com', type: 'Mumbai' },
  { company: 'Loadshare Logistics', domain: 'loadshare.net', type: 'Remote' },
  { company: 'GoBolt Express Tech', domain: 'gobolt.in', type: 'Remote' },
  { company: 'Rapido Bike App', domain: 'rapido.bike', type: 'Remote' },
  { company: 'Yulu Mobility Cloud', domain: 'yulu.bike', type: 'Remote' },
  { company: 'Zypp Electric Fleet', domain: 'zypp.app', type: 'Remote' },
  { company: 'BluSmart EV Mobility', domain: 'myblusmart.com', type: 'Remote' },
  { company: 'Everest Fleet FleetTech', domain: 'everestfleet.com', type: 'Mumbai' },
  { company: 'Euler Motors EV Tech', domain: 'eulermotors.com', type: 'Remote' },
  { company: 'Altigreen Motors Lab', domain: 'altigreen.com', type: 'Remote' },
  { company: 'Matter Energy EV Lab', domain: 'matter.in', type: 'Remote' },
  { company: 'Oben Electric Bikes Tech', domain: 'obenelectric.com', type: 'Remote' },
  { company: 'Hop Electric Bikes Tech', domain: 'hopelectric.in', type: 'Remote' },
  { company: 'Pure EV Electric Vehicles', domain: 'pureev.in', type: 'Remote' },
  { company: 'Ampere Greaves EV Vehicles', domain: 'amperevehicles.com', type: 'Remote' },
  { company: 'Ather Energy Electric Tech', domain: 'atherenergy.com', type: 'Remote' },
  { company: 'River EV Mobility Tech', domain: 'rideriver.com', type: 'Remote' },
  { company: 'Tork Motors Electric Pune', domain: 'torkmotors.com', type: 'Pune' },
  { company: 'Revolt Motors EV Mobility', domain: 'revoltmotors.com', type: 'Remote' },
  { company: 'Simple Energy EV Tech', domain: 'simpleenergy.in', type: 'Remote' },
  { company: 'Ultraviolette Mobility Tech', domain: 'ultraviolette.com', type: 'Remote' },

  // --- ADDITIONAL CHENNAI & SOUTH TECH FIRMS ---
  { company: 'Agira Technologies Chennai', domain: 'agiratech.com', type: 'Remote' },
  { company: 'DCKAP Commerce', domain: 'dckap.com', type: 'Remote' },
  { company: 'NDOT Technologies TN', domain: 'ndot.in', type: 'Remote' },
  { company: 'Crave InfoTech Global', domain: 'craveinfotech.com', type: 'Remote' },
  { company: 'Softura Software India', domain: 'softura.com', type: 'Remote' },
  { company: 'Team Tweaks Mobile', domain: 'teamtweaks.com', type: 'Remote' },
  { company: 'Smarther Mobile Apps', domain: 'smarther.co', type: 'Remote' },
  { company: 'Dot Com Infoway Media', domain: 'dotcominfoway.com', type: 'Remote' },
  { company: 'Pyramidion Solutions App', domain: 'pyramidions.com', type: 'Remote' },
  { company: 'Wenable Technologies App', domain: 'wenable.com', type: 'Remote' },
  { company: 'Hakuna Matata Solutions TN', domain: 'hakunamatatatech.com', type: 'Remote' },
  { company: 'Macappstudio Chennai', domain: 'macappstudio.com', type: 'Remote' },
  { company: 'Spritle Software Labs Chennai', domain: 'spritle.com', type: 'Remote' }
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

  for (const c of currentVerified) {
    const d = (c.domain || '').toLowerCase().trim();
    if (d && !contactedDomains.has(d) && !knownDomains.has(d)) {
      knownDomains.add(d);
      mergedPool.push(c);
    }
  }

  const toCheck = [];
  for (const c of candidates) {
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
