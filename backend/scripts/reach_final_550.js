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
  // COIMBATORE, KAKKANAD, KERALA IT PARKS
  { company: 'Techvolt Software', domain: 'techvoltcoimbatore.com', type: 'Remote' },
  { company: 'Techno Tackle', domain: 'technotackle.com', type: 'Remote' },
  { company: 'ClaySys Technologies', domain: 'claysys.com', type: 'Remote' },
  { company: 'NDimensionZ Solutions', domain: 'ndimensionz.com', type: 'Remote' },
  { company: 'Cubet Techno Labs', domain: 'cubettech.com', type: 'Remote' },
  { company: 'Emsyne Technologies', domain: 'emsyne.com', type: 'Remote' },
  { company: 'Matply Infotech', domain: 'matply.com', type: 'Remote' },
  { company: 'JRG Software & Technologies', domain: 'jrgsofttech.in', type: 'Remote' },
  { company: 'Kavaya Infotech', domain: 'kavayainfotech.com', type: 'Remote' },
  { company: 'Vedansh Solutions', domain: 'vedanshsolutions.in', type: 'Remote' },
  { company: 'Data Ingenious Global', domain: 'data.in', type: 'Remote' },
  { company: 'MentriQ Technologies', domain: 'mentriqtechnologies.in', type: 'Remote' },
  { company: 'CodeZion Softwares', domain: 'codezion.com', type: 'Remote' },
  { company: 'Trigma Solutions', domain: 'trigma.com', type: 'Remote' },
  { company: 'SoftProdigy System Solutions', domain: 'softprodigy.com', type: 'Remote' },
  { company: 'Sebiz Infotech Mohali', domain: 'sebiz.com', type: 'Remote' },
  { company: 'Bebo Technologies', domain: 'bebotechnologies.com', type: 'Remote' },
  { company: 'Webdew Digital Studio', domain: 'webdew.com', type: 'Remote' },
  { company: 'Reinvent Corp Mohali', domain: 'reinventcorp.com', type: 'Remote' },
  { company: 'Appzoro Technologies', domain: 'appzoro.com', type: 'Remote' },
  { company: 'W3care Technologies', domain: 'w3care.com', type: 'Remote' },
  { company: 'Unified Infotech', domain: 'unifiedinfotech.net', type: 'Remote' },
  { company: 'FATbit Technologies', domain: 'fatbit.com', type: 'Remote' },
  { company: 'Dronamics Global', domain: 'dronamics.com', type: 'Remote' },
  { company: 'Bifrost AI 3D', domain: 'bifrost.ai', type: 'Remote' },
  { company: 'Mesh AI HR', domain: 'mesh.ai', type: 'Remote' },
  { company: 'Mudrex Crypto Asset', domain: 'mudrex.com', type: 'Remote' },
  { company: 'LambdaTest Cloud Testing', domain: 'lambdatest.com', type: 'Remote' },
  { company: 'Testsigma Automation', domain: 'testsigma.com', type: 'Remote' },
  { company: 'ACCELQ Testing Platform', domain: 'accelq.com', type: 'Remote' },
  { company: 'FireFlink Automation', domain: 'fireflink.com', type: 'Remote' },
  { company: 'Opkey Test Automation', domain: 'opkey.com', type: 'Remote' },
  { company: 'Applitools Visual AI', domain: 'applitools.com', type: 'Remote' },
  { company: 'Katalon Automation Platform', domain: 'katalon.com', type: 'Remote' },
  { company: 'Tyk API Management', domain: 'tyk.io', type: 'Remote' },
  { company: 'Kong API Gateway', domain: 'konghq.com', type: 'Remote' },
  { company: 'Gravitee API Platform', domain: 'gravitee.io', type: 'Remote' },
  { company: 'Boomi Integration', domain: 'boomi.com', type: 'Remote' },
  { company: 'Workato India Enterprise', domain: 'workato.com', type: 'Remote' },
  { company: 'Tray.io Enterprise', domain: 'tray.io', type: 'Remote' },
  { company: 'Celigo Integration Cloud', domain: 'celigo.com', type: 'Remote' },
  { company: 'n8n Workflow Automation', domain: 'n8n.io', type: 'Remote' },
  { company: 'Pipedream Developer Platform', domain: 'pipedream.com', type: 'Remote' },
  { company: 'Retool Developer App', domain: 'retool.com', type: 'Remote' },
  { company: 'Budibase LowCode App', domain: 'budibase.com', type: 'Remote' },
  { company: 'Directus Open Data', domain: 'directus.io', type: 'Remote' },
  { company: 'Strapi Headless CMS', domain: 'strapi.io', type: 'Remote' },
  { company: 'Payload CMS Platform', domain: 'payloadcms.com', type: 'Remote' },
  { company: 'Sanity.io Structured Content', domain: 'sanity.io', type: 'Remote' },
  { company: 'Contentful Digital Content', domain: 'contentful.com', type: 'Remote' },
  { company: 'Storyblok Headless CMS', domain: 'storyblok.com', type: 'Remote' },
  { company: 'Hygraph Federated Content', domain: 'hygraph.com', type: 'Remote' },
  { company: 'DotPe Digital Commerce', domain: 'dotpe.in', type: 'Remote' },
  { company: 'Peppo Food Delivery', domain: 'peppo.co.in', type: 'Remote' },
  { company: 'Thrive Now Online Order', domain: 'thrivenow.in', type: 'Mumbai' },
  { company: 'Magicpin Hyperlocal', domain: 'magicpin.in', type: 'Remote' },
  { company: 'EazyDiner Table Booking', domain: 'eazydiner.com', type: 'Remote' },
  { company: 'Knowlarity Cloud Comm', domain: 'knowlarity.com', type: 'Remote' },
  { company: 'Telebu Communications', domain: 'telebu.com', type: 'Remote' },
  { company: 'MyOperator Cloud Call', domain: 'myoperator.com', type: 'Remote' },
  { company: 'Sarv Communications', domain: 'sarv.com', type: 'Remote' },
  { company: 'Kaleyra Communications', domain: 'kaleyra.com', type: 'Remote' },
  { company: 'Infobip India Cloud', domain: 'infobip.com', type: 'Mumbai' },
  { company: 'Sinch India Comm', domain: 'sinch.com', type: 'Remote' },
  { company: 'ValueFirst Digital Comm', domain: 'vfirst.com', type: 'Remote' },
  { company: 'ACL Mobile Messaging', domain: 'aclmobile.com', type: 'Remote' },
  { company: 'Vizury Customer Engage', domain: 'vizury.com', type: 'Remote' },
  { company: 'Affle India Consumer Tech', domain: 'affle.com', type: 'Remote' },
  { company: 'Fork Media Digital', domain: 'forkmedia.com', type: 'Mumbai' },
  { company: 'Vertoz Advertising Tech', domain: 'vertoz.com', type: 'Mumbai' },
  { company: 'SilverPush AI Video Ads', domain: 'silverpush.co', type: 'Remote' },
  { company: 'Radix Domain Registry', domain: 'radix.website', type: 'Mumbai' },
  { company: 'Zeta Banking Tech', domain: 'zeta.tech', type: 'Mumbai' },
  { company: 'Flock Workplace Chat', domain: 'flock.com', type: 'Mumbai' },
  { company: 'Titan Business Email', domain: 'titan.email', type: 'Mumbai' },
  { company: 'RapiPay Fintech India', domain: 'rapipay.com', type: 'Remote' },
  { company: 'Payworld India Fintech', domain: 'payworldindia.com', type: 'Remote' },
  { company: 'Spice Money Rural Fintech', domain: 'spicemoney.com', type: 'Remote' },
  { company: 'Nearby Technologies PayNear', domain: 'paynear.in', type: 'Remote' },
  { company: 'Bankit Services India', domain: 'bankit.in', type: 'Remote' },
  { company: 'Pay1 Retail Fintech', domain: 'pay1.in', type: 'Mumbai' },
  { company: 'FIA Global Financial', domain: 'fiaglobal.com', type: 'Remote' },
  { company: 'SubK IMPACT Solutions', domain: 'subk.co.in', type: 'Remote' },
  { company: 'Fino Payments Bank', domain: 'finobank.com', type: 'Mumbai' },
  { company: 'Airtel Payments Bank', domain: 'airtel.in', type: 'Remote' },
  { company: 'Paytm Payments Bank', domain: 'paytmbank.com', type: 'Remote' },
  { company: 'Vakrangee Kendra Tech', domain: 'vakrangee.in', type: 'Mumbai' },
  { company: 'E-Mudhra Digital Trust', domain: 'emudhra.com', type: 'Remote' },
  { company: 'Protean eGov Technologies', domain: 'proteantech.in', type: 'Mumbai' },
  { company: 'CAMS Computer Age', domain: 'camsonline.com', type: 'Remote' },
  { company: 'KFin Technologies Tech', domain: 'kfintech.com', type: 'Remote' },
  { company: 'Link Intime India Tech', domain: 'linkintime.co.in', type: 'Mumbai' },
  { company: 'Bigshare Services IT', domain: 'bigshareonline.com', type: 'Mumbai' },
  { company: 'Blume Ventures Tech', domain: 'blume.vc', type: 'Mumbai' },
  { company: 'Nexus Venture Partners', domain: 'nexusvp.com', type: 'Mumbai' },
  { company: 'Peak XV Partners', domain: 'peakxv.com', type: 'Remote' },
  { company: 'Accel Partners India', domain: 'accel.com', type: 'Remote' },
  { company: 'Elevation Capital Tech', domain: 'elevationcapital.com', type: 'Remote' },
  { company: 'Kalaari Capital Tech', domain: 'kalaari.com', type: 'Remote' },
  { company: 'Chiratae Ventures Tech', domain: 'chiratae.com', type: 'Remote' },
  { company: 'India Quotient Tech', domain: 'indiaquotient.com', type: 'Mumbai' },
  { company: '3one4 Capital Tech', domain: '3one4capital.com', type: 'Remote' },
  { company: 'Stellaris Venture Partners', domain: 'stellarisvp.com', type: 'Remote' },
  { company: 'Prime Venture Partners Tech', domain: 'primevp.in', type: 'Remote' },
  { company: 'Kae Capital Tech', domain: 'kae-capital.com', type: 'Mumbai' },
  { company: 'WaterBridge Ventures Tech', domain: 'waterbridge.vc', type: 'Remote' },
  { company: 'Titan Capital Tech', domain: 'titancapital.vc', type: 'Remote' },
  { company: 'Speciale Invest DeepTech', domain: 'specialeinvest.com', type: 'Remote' },
  { company: 'Ankur Capital AgriTech', domain: 'ankurcapital.com', type: 'Mumbai' },
  { company: 'Omnivore Agritech Tech', domain: 'omnivore.vc', type: 'Mumbai' },
  { company: 'Fireside Ventures Tech', domain: 'firesideventures.com', type: 'Remote' },
  { company: 'DSG Consumer Partners Tech', domain: 'dsgcp.com', type: 'Mumbai' }
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
