const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');

const candidates = [
  { company: 'Radixweb', domain: 'radixweb.com', type: 'Remote' },
  { company: 'Bacancy Technology', domain: 'bacancytechnology.com', type: 'Remote' },
  { company: 'TatvaSoft', domain: 'tatvasoft.com', type: 'Remote' },
  { company: 'Mindfire Solutions', domain: 'mindfiresolutions.com', type: 'Remote' },
  { company: 'Kellton Tech', domain: 'kellton.com', type: 'Remote' },
  { company: 'Cyient', domain: 'cyient.com', type: 'Remote' },
  { company: 'Nucleus Software', domain: 'nucleussoftware.com', type: 'Remote' },
  { company: 'Sasken Technologies', domain: 'sasken.com', type: 'Remote' },
  { company: 'Newgen Software', domain: 'newgensoft.com', type: 'Remote' },
  { company: 'Ramco Systems', domain: 'ramco.com', type: 'Remote' },
  { company: 'Subex', domain: 'subex.com', type: 'Remote' },
  { company: 'Aurionpro Solutions', domain: 'aurionpro.com', type: 'Mumbai' },
  { company: 'Tanla Platforms', domain: 'tanla.com', type: 'Remote' },
  { company: 'Route Mobile', domain: 'routemobile.com', type: 'Mumbai' },
  { company: 'Affle', domain: 'affle.com', type: 'Remote' },
  { company: 'InfoBeans Technologies', domain: 'infobeans.com', type: 'Remote' },
  { company: 'OnMobile Global', domain: 'onmobile.com', type: 'Remote' },
  { company: 'R Systems', domain: 'rsystems.com', type: 'Remote' },
  { company: 'Intellect Design Arena', domain: 'intellectdesign.com', type: 'Remote' },
  { company: 'Zen Technologies', domain: 'zentechnologies.com', type: 'Remote' },
  { company: 'Allied Digital', domain: 'allieddigital.net', type: 'Mumbai' },
  { company: 'Datamatics', domain: 'datamatics.com', type: 'Mumbai' },
  { company: 'Ksolves India', domain: 'ksolves.com', type: 'Remote' },
  { company: 'Silver Touch Technologies', domain: 'silvertouch.com', type: 'Remote' },
  { company: 'eClerx Services', domain: 'eclerx.com', type: 'Mumbai' },
  { company: 'eMudhra', domain: 'emudhra.com', type: 'Remote' },
  { company: 'Tracxn', domain: 'tracxn.com', type: 'Remote' },
  { company: 'RateGain', domain: 'rategain.com', type: 'Remote' },
  { company: 'IdeaForge', domain: 'ideaforge.co.in', type: 'Mumbai' },
  { company: 'Zaggle', domain: 'zaggle.in', type: 'Remote' },
  { company: 'CMS Info Systems', domain: 'cms.com', type: 'Mumbai' },
  { company: 'Trigyn Technologies', domain: 'trigyn.com', type: 'Mumbai' },
  { company: 'Dynacons Systems', domain: 'dynacons.com', type: 'Mumbai' },
  { company: 'Inspirisys Solutions', domain: 'inspirisys.com', type: 'Remote' },
  { company: 'Accelya Solutions', domain: 'accelya.com', type: 'Mumbai' },
  { company: 'Saksoft', domain: 'saksoft.com', type: 'Remote' },
  { company: 'Cigniti Technologies', domain: 'cigniti.com', type: 'Remote' },
  { company: 'ASM Technologies', domain: 'asmltd.com', type: 'Remote' },
  { company: 'Intense Technologies', domain: 'inscripts.com', type: 'Remote' },
  { company: 'SoftTech Engineers', domain: 'softtech-engr.com', type: 'Pune' },
  { company: 'Cybertech Systems', domain: 'cybertech.com', type: 'Mumbai' },
  { company: 'Iris Business Services', domain: 'irisbusiness.com', type: 'Mumbai' },
  
  // Software Dev Agencies & Product Studios
  { company: 'Appinventiv', domain: 'appinventiv.com', type: 'Remote' },
  { company: 'Simform', domain: 'simform.com', type: 'Remote' },
  { company: 'Net Solutions', domain: 'netsolutions.com', type: 'Remote' },
  { company: 'Classic Informatics', domain: 'classicinformatics.com', type: 'Remote' },
  { company: 'Hidden Brains', domain: 'hiddenbrains.com', type: 'Remote' },
  { company: 'Fingent', domain: 'fingent.com', type: 'Remote' },
  { company: 'Experion Technologies', domain: 'experionglobal.com', type: 'Remote' },
  { company: 'PixelCrayons', domain: 'pixelcrayons.com', type: 'Remote' },
  { company: 'ValueCoders', domain: 'valuecoders.com', type: 'Remote' },
  { company: 'SoluLab', domain: 'solulab.com', type: 'Remote' },
  { company: 'Prompt Softech', domain: 'promptsoftech.com', type: 'Remote' },
  { company: 'Space-O Technologies', domain: 'spaceotechnologies.com', type: 'Remote' },
  { company: 'Hyperlink InfoSystem', domain: 'hyperlinkinfosystem.com', type: 'Remote' },
  { company: 'OpenXcell', domain: 'openxcell.com', type: 'Remote' },
  { company: 'Konstant Infosolutions', domain: 'konstantinfo.com', type: 'Remote' },
  { company: 'TechAhead', domain: 'techaheadcorp.com', type: 'Remote' },
  { company: 'Emizen Tech', domain: 'emizentech.com', type: 'Remote' },
  { company: 'Octal IT Solution', domain: 'octalsoftware.com', type: 'Remote' },
  { company: 'Dev Technosys', domain: 'devtechnosys.com', type: 'Remote' },
  { company: 'RipenApps Technologies', domain: 'ripenapps.com', type: 'Remote' },
  { company: 'Debut Infotech', domain: 'debutinfotech.com', type: 'Remote' },
  { company: 'AgileCockpit', domain: 'agilecockpit.com', type: 'Remote' },
  { company: 'Mobiloitte', domain: 'mobiloitte.com', type: 'Remote' },
  { company: 'A3logics', domain: 'a3logics.com', type: 'Remote' },
  { company: 'Damco Solutions', domain: 'damcogroup.com', type: 'Remote' },
  { company: 'Cheesecake Labs India', domain: 'cheesecakelabs.com', type: 'Remote' },
  { company: 'Mutual Mobile India', domain: 'mutualmobile.com', type: 'Remote' },
  { company: 'Fueled India', domain: 'fueled.com', type: 'Remote' },
  { company: 'SourceFuse', domain: 'sourcefuse.com', type: 'Remote' },
  { company: 'Qburst', domain: 'qburst.com', type: 'Remote' },
  { company: 'Cabot Technology', domain: 'cabotsolutions.com', type: 'Remote' },
  { company: 'SayOne Technologies', domain: 'sayonetech.com', type: 'Remote' },
  { company: 'Gadgeon Systems', domain: 'gadgeon.com', type: 'Remote' },
  { company: 'Suyati Technologies', domain: 'suyati.com', type: 'Remote' },
  { company: 'Toobler Technologies', domain: 'toobler.com', type: 'Remote' },
  { company: 'RapidValue', domain: 'rapidvalue.com', type: 'Remote' },
  { company: 'Techversant Infotech', domain: 'techversantinfotech.com', type: 'Remote' },
  { company: 'Calpine Group', domain: 'calpine.com', type: 'Remote' },
  { company: 'Nuventure Connect', domain: 'nuventure.in', type: 'Remote' },
  { company: 'Perfomatix Solutions', domain: 'perfomatix.com', type: 'Remote' },
  { company: 'Nuware Technology', domain: 'nuware.com', type: 'Remote' },
  { company: 'Innovature Software', domain: 'innovaturesoftware.com', type: 'Remote' },
  { company: 'Reubro International', domain: 'reubro.com', type: 'Remote' },
  { company: 'Bridge Global', domain: 'bridge-global.com', type: 'Remote' },
  { company: 'Speridian Technologies', domain: 'speridian.com', type: 'Remote' }
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

  const verified = [];
  console.log(`Checking ${candidates.length} candidate IT companies...`);

  for (const c of candidates) {
    const domain = c.domain.toLowerCase().trim();
    if (contactedDomains.has(domain)) {
      continue;
    }

    try {
      const records = await dns.resolveMx(domain);
      if (records && records.length > 0) {
        verified.push(c);
        console.log(`[MX OK] ${c.company} (${domain})`);
      }
    } catch (e) {
      console.log(`[MX FAIL] ${c.company} (${domain}): ${e.message}`);
    }
  }

  console.log(`\nTotal verified uncontacted IT companies found: ${verified.length}`);
  fs.writeFileSync(path.join(__dirname, 'fresh_it_pool.json'), JSON.stringify(verified, null, 2), 'utf8');
}

run();
