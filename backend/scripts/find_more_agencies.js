const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');

const candidates = [
  { company: 'Quytech', domain: 'quytech.com', type: 'Remote' },
  { company: 'Apptunix', domain: 'apptunix.com', type: 'Remote' },
  { company: 'Brainvire Infotech', domain: 'brainvire.com', type: 'Mumbai' },
  { company: 'Mindinventory', domain: 'mindinventory.com', type: 'Remote' },
  { company: 'Appy Pie', domain: 'appypie.com', type: 'Remote' },
  { company: 'Algoworks', domain: 'algoworks.com', type: 'Remote' },
  { company: 'Promatics Technologies', domain: 'promaticsindia.com', type: 'Remote' },
  { company: 'Sparx IT', domain: 'sparxitsolutions.com', type: 'Remote' },
  { company: 'Mobulous', domain: 'mobulous.com', type: 'Remote' },
  { company: 'CDN Solutions Group', domain: 'cdnsol.com', type: 'Remote' },
  { company: 'Yugasa Software', domain: 'yugasa.com', type: 'Remote' },
  { company: 'Techugo', domain: 'techugo.com', type: 'Remote' },
  { company: 'Parangat Technologies', domain: 'parangat.com', type: 'Remote' },
  { company: 'Webkul Software', domain: 'webkul.com', type: 'Remote' },
  { company: 'Daffodil Software', domain: 'daffodilsw.com', type: 'Remote' },
  { company: 'Successive Digital', domain: 'successive.tech', type: 'Remote' },
  { company: 'Magic EdTech', domain: 'magicedtech.com', type: 'Remote' },
  { company: 'Xebia India', domain: 'xebia.com', type: 'Remote' },
  { company: 'Publicis Sapient India', domain: 'publicissapient.com', type: 'Remote' },
  { company: 'Globant India', domain: 'globant.com', type: 'Pune' },
  { company: 'Endava India', domain: 'endava.com', type: 'Pune' },
  { company: 'EPAM India', domain: 'epam.com', type: 'Remote' },
  { company: 'Thoughtworks India', domain: 'thoughtworks.com', type: 'Remote' },
  { company: 'Tiger Analytics', domain: 'tigeranalytics.com', type: 'Remote' },
  { company: 'Mu Sigma', domain: 'mu-sigma.com', type: 'Remote' },
  { company: 'LatentView Analytics', domain: 'latentview.com', type: 'Remote' },
  { company: 'Quantiphi', domain: 'quantiphi.com', type: 'Mumbai' },
  { company: 'Course5 Intelligence', domain: 'course5i.com', type: 'Mumbai' },
  { company: 'Tredence', domain: 'tredence.com', type: 'Remote' },
  { company: 'TheMathCompany', domain: 'themathcompany.com', type: 'Remote' },
  { company: 'Crayon Data', domain: 'crayondata.com', type: 'Remote' },
  { company: 'Ugam Solutions', domain: 'ugamsolutions.com', type: 'Mumbai' },
  { company: 'Indegene', domain: 'indegene.com', type: 'Remote' },
  { company: 'Zifo RnD Solutions', domain: 'zifo.com', type: 'Remote' },
  { company: 'Navitas Life Sciences', domain: 'navitaslifesciences.com', type: 'Remote' },
  { company: 'Netrika Consulting', domain: 'netrika.com', type: 'Mumbai' },
  { company: 'Rubicon Research', domain: 'rubicon.co.in', type: 'Mumbai' },
  { company: 'Sula Vineyards Tech', domain: 'sulavineyards.com', type: 'Mumbai' },
  { company: 'Glenmark Tech', domain: 'glenmarkpharma.com', type: 'Mumbai' },
  { company: 'Lupin Digital Health', domain: 'lupindigitalhealth.com', type: 'Mumbai' },
  { company: 'Cipla Digital', domain: 'cipla.com', type: 'Mumbai' },
  { company: 'Piramal Digital', domain: 'piramal.com', type: 'Mumbai' },
  { company: 'Godrej Infotech', domain: 'godrejinfotech.com', type: 'Mumbai' },
  { company: 'Tata Teleservices', domain: 'tatateleservices.com', type: 'Mumbai' }
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
  console.log(`Checking ${candidates.length} candidate companies...`);

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

  console.log(`\nTotal verified uncontacted companies found: ${verified.length}`);
  fs.writeFileSync(path.join(__dirname, 'fresh_agency_pool.json'), JSON.stringify(verified, null, 2), 'utf8');
}

run();
