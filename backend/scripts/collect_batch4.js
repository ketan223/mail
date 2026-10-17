const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidatePool4 = [
  // --- HEALTHCARE, PHARMA & DIAGNOSTICS TECH ---
  { company: 'Tata 1mg Healthcare Cloud', domain: '1mg.com', type: 'Remote' },
  { company: 'Netmeds Reliance Digital Pharma', domain: 'netmeds.com', type: 'Remote' },
  { company: 'Apollo 247 Digital Health', domain: 'apollo247.com', type: 'Remote' },
  { company: 'Metropolis Healthcare Diagnostics', domain: 'metropolisindia.com', type: 'Mumbai' },
  { company: 'Dr Lal PathLabs Diagnostics', domain: 'lalpathlabs.com', type: 'Remote' },
  { company: 'Agilus Diagnostics Network', domain: 'agilusdiagnostics.com', type: 'Remote' },
  { company: 'Thyrocare Technologies Diagnostic', domain: 'thyrocare.com', type: 'Mumbai' },
  { company: 'Suburban Diagnostics Labs', domain: 'suburbandiagnostics.com', type: 'Mumbai' },
  { company: 'Vijaya Diagnostic Centre', domain: 'vijayadiagnostic.com', type: 'Remote' },
  { company: 'Redcliffe Labs Diagnostics', domain: 'redcliffelabs.com', type: 'Remote' },
  { company: 'Healthians Home Diagnostic', domain: 'healthians.com', type: 'Remote' },
  { company: 'Medi Assist Healthcare Services', domain: 'mediassist.in', type: 'Remote' },
  { company: 'Vidal Health Insurance TPA', domain: 'vidalhealthtpa.com', type: 'Remote' },
  { company: 'Nova Benefits Employee Health', domain: 'novabenefits.com', type: 'Remote' },
  { company: 'Pazcare Employee Benefits', domain: 'pazcare.com', type: 'Remote' },
  { company: 'SecureNow Insurance Broker', domain: 'securenow.in', type: 'Remote' },
  { company: 'Turtlemint Insurance Distribution', domain: 'turtlemint.com', type: 'Mumbai' },
  { company: 'Coverfox Insurance Broking', domain: 'coverfox.com', type: 'Mumbai' },
  { company: 'RenewBuy Insurance Tech', domain: 'renewbuy.com', type: 'Remote' },
  { company: 'InsuranceDekho Girnar Insurance', domain: 'insurancedekho.com', type: 'Remote' },
  { company: 'Digit Insurance Cloud GoDigit', domain: 'godigit.com', type: 'Pune' },
  { company: 'Acko General Insurance Tech', domain: 'acko.com', type: 'Mumbai' },
  { company: 'Navi Technologies Lending & Health', domain: 'navi.com', type: 'Remote' },
  { company: 'Zuno General Insurance Digital', domain: 'hizuno.com', type: 'Mumbai' },
  { company: 'Kotak General Insurance Digital', domain: 'kotakgeneral.com', type: 'Mumbai' },
  { company: 'HDFC ERGO General Insurance', domain: 'hdfcergo.com', type: 'Mumbai' },
  { company: 'ICICI Lombard General Insurance', domain: 'icicilombard.com', type: 'Mumbai' },
  { company: 'Bajaj Allianz General Insurance', domain: 'bajajallianz.com', type: 'Pune' },
  { company: 'Tata AIG General Insurance', domain: 'tataaig.com', type: 'Mumbai' },
  { company: 'Star Health Allied Insurance', domain: 'starhealth.in', type: 'Remote' },
  { company: 'Care Health Insurance Religare', domain: 'careinsurance.com', type: 'Remote' },
  { company: 'Niva Bupa Health Insurance', domain: 'nivabupa.com', type: 'Remote' },
  { company: 'ManipalCigna Health Insurance', domain: 'manipalcigna.com', type: 'Mumbai' },

  // --- ADDITIONAL INDIAN CLOUD, LOGISTICS & ENGINEERING FIRMS ---
  { company: 'Kale Logistics Solutions', domain: 'kalelogistics.com', type: 'Mumbai' },
  { company: 'Softlink Global Logistics Tech', domain: 'softlinkglobal.com', type: 'Mumbai' },
  { company: 'LogiNext Solutions AI', domain: 'loginextsolutions.com', type: 'Mumbai' },
  { company: 'FourKites India Supply Chain', domain: 'fourkites.com', type: 'Remote' },
  { company: 'ClearTax Defmacro Software', domain: 'cleartax.in', type: 'Remote' },
  { company: 'IndiaFilings Business Platform', domain: 'indiafilings.com', type: 'Remote' },
  { company: 'TaxBuddy FinTech Tax Tech', domain: 'taxbuddy.com', type: 'Mumbai' },
  { company: 'Quicko Tax Solutions India', domain: 'quicko.com', type: 'Remote' },
  { company: 'WinZO Social Gaming Platform', domain: 'winzogames.com', type: 'Remote' },
  { company: 'Games24x7 Digital Entertainment', domain: 'games24x7.com', type: 'Mumbai' },
  { company: 'Mobile Premier League MPL', domain: 'mpl.live', type: 'Remote' },
  { company: 'Zupee Skill Gaming Platform', domain: 'zupee.com', type: 'Remote' },
  { company: 'Nazara Technologies Gaming', domain: 'nazara.com', type: 'Mumbai' },
  { company: 'Nodwin Gaming Esports Tech', domain: 'nodwin.com', type: 'Remote' },
  { company: 'Delta Corp Gaming & Hospitality', domain: 'deltacorp.in', type: 'Mumbai' },
  { company: 'Junglee Games Flutter Tech', domain: 'jungleegames.com', type: 'Remote' },
  { company: 'A23 Head Infotech Gaming', domain: 'a23.com', type: 'Remote' },
  { company: 'RummyCircle Online Gaming', domain: 'rummycircle.com', type: 'Mumbai' },
  { company: 'PokerBaazi Baazi Games Tech', domain: 'pokerbaazi.com', type: 'Remote' },
  { company: 'CardBaazi Baazi Games Platform', domain: 'cardbaazi.com', type: 'Remote' },
  { company: 'Halaplay Technologies Sports', domain: 'halaplay.com', type: 'Remote' },
  { company: 'FanCode Sports Streaming Dream11', domain: 'fancode.com', type: 'Mumbai' },
  { company: 'Dream Sports Tech Ecosystem', domain: 'dreamsports.group', type: 'Mumbai' }
];

async function run() {
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');
  const contacted = new Set();
  sentLog.forEach(x => {
    if (x.email && x.email.includes('@')) {
      const p = x.email.split('@')[1];
      if (p) contacted.add(p.toLowerCase().trim());
    }
  });

  const dir = require('../data/company_directory');
  const existing = new Set(dir.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const b1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch1_verified.json'), 'utf8') || '[]');
  const b2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch2_verified.json'), 'utf8') || '[]');
  const b3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch3_verified.json'), 'utf8') || '[]');
  b1.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));
  b2.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));
  b3.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidatePool4) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existing.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} prospective candidate companies in Batch 4 for DNS MX validation...`);

  const verified = [];
  const CONCURRENCY = 30;

  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const chunk = toCheck.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (c) => {
      try {
        const mx = await dns.resolveMx(c.domain);
        if (mx && mx.length > 0) {
          verified.push(c);
        }
      } catch (err) {}
    }));
    process.stdout.write(`\rProgress: ${Math.min(i + CONCURRENCY, toCheck.length)} / ${toCheck.length} | Verified: ${verified.length}`);
  }

  console.log(`\n\nTotal newly verified in Batch 4: ${verified.length}`);
  fs.writeFileSync(path.join(__dirname, 'batch4_verified.json'), JSON.stringify(verified, null, 2), 'utf8');

  // Total across all 4 batches
  const allNew = [...b1, ...b2, ...b3, ...verified];
  console.log(`\n===========================================`);
  console.log(`GRAND TOTAL VERIFIED NEW UNCONTACTED COMPANIES: ${allNew.length}`);
  console.log(`===========================================`);

  fs.writeFileSync(path.join(__dirname, 'all_500_new_verified.json'), JSON.stringify(allNew, null, 2), 'utf8');
}

run().catch(console.error);
