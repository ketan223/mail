const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');

const candidates = [
  // E-commerce & D2C
  { company: 'Purplle', domain: 'purplle.com', type: 'Mumbai' },
  { company: 'Nykaa', domain: 'nykaa.com', type: 'Mumbai' },
  { company: 'FirstCry', domain: 'firstcry.com', type: 'Pune' },
  { company: 'Pepperfry', domain: 'pepperfry.com', type: 'Mumbai' },
  { company: 'Shiprocket', domain: 'shiprocket.com', type: 'Remote' },
  { company: 'Country Delight', domain: 'countrydelight.in', type: 'Remote' },
  { company: 'MilkBasket', domain: 'milkbasket.com', type: 'Remote' },
  { company: 'Zepto', domain: 'zeptonow.com', type: 'Mumbai' },
  { company: 'Blinkit', domain: 'blinkit.com', type: 'Remote' },
  { company: 'Dunzo', domain: 'dunzo.com', type: 'Remote' },
  { company: 'Shadowfax', domain: 'shadowfax.in', type: 'Remote' },
  { company: 'Delhivery', domain: 'delhivery.com', type: 'Remote' },
  { company: 'Xpressbees', domain: 'xpressbees.com', type: 'Pune' },
  { company: 'BlueDart', domain: 'bluedart.com', type: 'Mumbai' },
  { company: 'Ecom Express', domain: 'ecomexpress.in', type: 'Remote' },
  { company: 'Porter', domain: 'porter.in', type: 'Remote' },
  { company: 'Rapido', domain: 'rapido.bike', type: 'Remote' },
  { company: 'Yulu Bikes', domain: 'yulu.bike', type: 'Remote' },
  { company: 'Bounce', domain: 'bouncefleet.com', type: 'Remote' },

  // FinTech
  { company: 'Razorpay', domain: 'razorpay.com', type: 'Remote' },
  { company: 'Pine Labs', domain: 'pinelabs.com', type: 'Remote' },
  { company: 'Cashfree', domain: 'cashfree.com', type: 'Remote' },
  { company: 'BharatPe', domain: 'bharatpe.com', type: 'Remote' },
  { company: 'CRED', domain: 'cred.club', type: 'Remote' },
  { company: 'Slice', domain: 'sliceit.com', type: 'Remote' },
  { company: 'OneCard', domain: 'getonecard.com', type: 'Pune' },
  { company: 'Navi Technologies', domain: 'navi.com', type: 'Remote' },
  { company: 'Jar App', domain: 'myjar.app', type: 'Remote' },
  { company: 'Fi Money', domain: 'fi.money', type: 'Remote' },
  { company: 'Jupiter Money', domain: 'jupiter.money', type: 'Mumbai' },
  { company: 'Uni Cards', domain: 'uni.cards', type: 'Remote' },
  { company: 'Khatabook', domain: 'khatabook.com', type: 'Remote' },
  { company: 'PayGlocal', domain: 'payglocal.in', type: 'Remote' },
  { company: 'Setu', domain: 'setu.co', type: 'Remote' },
  { company: 'Decentro', domain: 'decentro.tech', type: 'Remote' },
  { company: 'M2P Fintech', domain: 'm2pfintech.com', type: 'Remote' },
  { company: 'Perfios', domain: 'perfios.com', type: 'Remote' },
  { company: 'Signzy', domain: 'signzy.com', type: 'Mumbai' },
  { company: 'IDfy', domain: 'idfy.com', type: 'Mumbai' },
  { company: 'Bureau ID', domain: 'bureau.id', type: 'Remote' },
  { company: 'MoneyView', domain: 'moneyview.in', type: 'Remote' },
  { company: 'KreditBee', domain: 'kreditbee.in', type: 'Remote' },
  { company: 'Cashe', domain: 'cashe.co.in', type: 'Mumbai' },
  { company: 'Kissht', domain: 'kissht.com', type: 'Mumbai' },
  { company: 'Fibe', domain: 'fibe.in', type: 'Pune' },
  { company: 'Axio', domain: 'axio.co.in', type: 'Mumbai' },
  { company: 'Lendingkart', domain: 'lendingkart.com', type: 'Remote' },
  { company: 'InCred', domain: 'incred.com', type: 'Mumbai' },
  { company: 'Aye Finance', domain: 'ayefin.com', type: 'Remote' },
  { company: 'NeoGrowth', domain: 'neogrowth.in', type: 'Mumbai' },
  { company: 'Progcap', domain: 'progcap.com', type: 'Remote' },
  { company: 'FlexiLoans', domain: 'flexiloans.com', type: 'Mumbai' },
  { company: 'Open Financial', domain: 'open.money', type: 'Remote' },
  { company: 'Finarkein Analytics', domain: 'finarkein.com', type: 'Pune' },

  // SaaS & Enterprise Tech
  { company: 'Postman', domain: 'postman.com', type: 'Remote' },
  { company: 'BrowserStack', domain: 'browserstack.com', type: 'Mumbai' },
  { company: 'Chargebee', domain: 'chargebee.com', type: 'Remote' },
  { company: 'Freshworks', domain: 'freshworks.com', type: 'Remote' },
  { company: 'Zoho', domain: 'zohocorp.com', type: 'Remote' },
  { company: 'Kissflow', domain: 'kissflow.com', type: 'Remote' },
  { company: 'CleverTap', domain: 'clevertap.com', type: 'Mumbai' },
  { company: 'MoEngage', domain: 'moengage.com', type: 'Remote' },
  { company: 'WebEngage', domain: 'webengage.com', type: 'Mumbai' },
  { company: 'Netcore Cloud', domain: 'netcorecloud.com', type: 'Mumbai' },
  { company: 'LeadSquared', domain: 'leadsquared.com', type: 'Remote' },
  { company: 'Darwinbox', domain: 'darwinbox.com', type: 'Remote' },
  { company: 'Keka HR', domain: 'keka.com', type: 'Remote' },
  { company: 'GreytHR', domain: 'greythr.com', type: 'Remote' },
  { company: 'ZingHR', domain: 'zinghr.com', type: 'Mumbai' },
  { company: 'PeopleStrong', domain: 'peoplestrong.com', type: 'Remote' },
  { company: 'Locus', domain: 'locus.sh', type: 'Remote' },
  { company: 'FarEye', domain: 'fareye.com', type: 'Remote' },
  { company: 'LogiNext', domain: 'loginextsolutions.com', type: 'Mumbai' },
  { company: 'Sprinto', domain: 'sprinto.com', type: 'Remote' },
  { company: 'Scrut Automation', domain: 'scrut.io', type: 'Remote' },
  { company: 'Securden', domain: 'securden.com', type: 'Remote' },
  { company: 'AccuKnox', domain: 'accuknox.com', type: 'Remote' },
  { company: 'Appknox', domain: 'appknox.com', type: 'Remote' },
  { company: 'LambdaTest', domain: 'lambdatest.com', type: 'Remote' },
  { company: 'Testsigma', domain: 'testsigma.com', type: 'Remote' },
  { company: 'Acceldata', domain: 'acceldata.io', type: 'Remote' },
  { company: 'Hevo Data', domain: 'hevodata.com', type: 'Remote' },
  { company: 'Airmeet', domain: 'airmeet.com', type: 'Remote' },
  { company: 'Hubilo', domain: 'hubilo.com', type: 'Remote' },
  { company: 'Zomentum', domain: 'zomentum.com', type: 'Remote' },
  { company: 'Toplyne', domain: 'toplyne.io', type: 'Remote' },
  { company: 'Factors.ai', domain: 'factors.ai', type: 'Remote' },
  { company: 'Infeedo', domain: 'infeedo.com', type: 'Remote' },
  { company: 'Amber by Infeedo', domain: 'amberstudent.com', type: 'Pune' },
  { company: 'Slintel', domain: 'slintel.com', type: 'Remote' },
  { company: 'Klenty', domain: 'klenty.com', type: 'Remote' },
  { company: 'Salesken', domain: 'salesken.ai', type: 'Remote' },
  { company: 'Convin.ai', domain: 'convin.ai', type: 'Remote' },
  { company: 'Enparadigm', domain: 'enparadigm.com', type: 'Mumbai' },
  { company: 'Upskills', domain: 'upskills.com', type: 'Mumbai' },
  { company: 'EdCast', domain: 'edcast.com', type: 'Mumbai' },
  { company: 'Disprz', domain: 'disprz.ai', type: 'Remote' },
  { company: 'Classplus', domain: 'classplus.co', type: 'Remote' },
  { company: 'Teachmint', domain: 'teachmint.com', type: 'Remote' },

  // AI & Data Tech
  { company: 'Haptik', domain: 'haptik.ai', type: 'Mumbai' },
  { company: 'Yellow.ai', domain: 'yellow.ai', type: 'Remote' },
  { company: 'Gupshup', domain: 'gupshup.io', type: 'Mumbai' },
  { company: 'Uniphore', domain: 'uniphore.com', type: 'Remote' },
  { company: 'Observe.AI', domain: 'observe.ai', type: 'Remote' },
  { company: 'Senseforth.ai', domain: 'senseforth.ai', type: 'Remote' },
  { company: 'Reverie Language Technologies', domain: 'reverieinc.com', type: 'Remote' },
  { company: 'Gnani.ai', domain: 'gnani.ai', type: 'Remote' },
  { company: 'Vernacular.ai', domain: 'skit.ai', type: 'Remote' },
  { company: 'Mad Street Den', domain: 'madstreetden.com', type: 'Remote' },
  { company: 'Vue.ai', domain: 'vue.ai', type: 'Remote' },
  { company: 'Staqu', domain: 'staqu.com', type: 'Remote' },
  { company: 'Innefu Labs', domain: 'innefu.com', type: 'Remote' },
  { company: 'Entropik Tech', domain: 'entropik.io', type: 'Remote' },
  { company: 'Playment', domain: 'playment.io', type: 'Remote' },
  { company: 'Karya', domain: 'karya.in', type: 'Remote' },
  { company: 'Sarvam AI', domain: 'sarvam.ai', type: 'Remote' },
  { company: 'Krutrim', domain: 'krutrim.com', type: 'Remote' },

  // HealthTech
  { company: 'Pharmeasy', domain: 'pharmeasy.in', type: 'Mumbai' },
  { company: 'Practo', domain: 'practo.com', type: 'Remote' },
  { company: '1mg', domain: '1mg.com', type: 'Remote' },
  { company: 'HealthifyMe', domain: 'healthifyme.com', type: 'Remote' },
  { company: 'Cult.fit', domain: 'cult.fit', type: 'Remote' },
  { company: 'Pristyn Care', domain: 'pristyncare.com', type: 'Remote' },
  { company: 'MFine', domain: 'mfine.co', type: 'Remote' },
  { company: 'MediBuddy', domain: 'medibuddy.in', type: 'Remote' },
  { company: 'Innovaccer', domain: 'innovaccer.com', type: 'Remote' },
  { company: 'Qure.ai', domain: 'qure.ai', type: 'Mumbai' },
  { company: 'SigTuple', domain: 'sigtuple.com', type: 'Remote' },
  { company: 'Niramai', domain: 'niramai.com', type: 'Remote' },
  { company: 'Dozee', domain: 'dozee.io', type: 'Remote' },
  { company: 'Tricog Health', domain: 'tricog.com', type: 'Remote' },
  { company: '5c Network', domain: '5cnetwork.com', type: 'Remote' },
  { company: 'BeatO', domain: 'beatoapp.com', type: 'Remote' },
  { company: 'Fitterfly', domain: 'fitterfly.com', type: 'Mumbai' },
  { company: 'Curefoods', domain: 'curefoods.in', type: 'Remote' },

  // Gaming & Media Tech
  { company: 'Dream11', domain: 'dream11.com', type: 'Mumbai' },
  { company: 'Games24x7', domain: 'games24x7.com', type: 'Mumbai' },
  { company: 'MPL', domain: 'mpl.live', type: 'Remote' },
  { company: 'Nazara Technologies', domain: 'nazara.com', type: 'Mumbai' },
  { company: 'WinZO', domain: 'winzogames.com', type: 'Remote' },
  { company: 'Zupee', domain: 'zupee.com', type: 'Remote' },
  { company: 'Glance', domain: 'glance.com', type: 'Remote' },
  { company: 'InMobi', domain: 'inmobi.com', type: 'Remote' },
  { company: 'Pocket FM', domain: 'pocketfm.com', type: 'Remote' },
  { company: 'Kuku FM', domain: 'kukufm.com', type: 'Mumbai' },
  { company: 'ShareChat', domain: 'sharechat.co', type: 'Remote' },
  { company: 'Dailyhunt', domain: 'dailyhunt.in', type: 'Remote' },
  { company: 'Koo', domain: 'kooapp.com', type: 'Remote' },
  { company: 'Pratilipi', domain: 'pratilipi.com', type: 'Remote' },
  { company: 'Stage OTT', domain: 'stage.in', type: 'Remote' },

  // IT & Cloud Services
  { company: 'Searce', domain: 'searce.com', type: 'Pune' },
  { company: 'Blazeclan', domain: 'blazeclan.com', type: 'Pune' },
  { company: 'Minfy Technologies', domain: 'minfytech.com', type: 'Remote' },
  { company: 'Rapyder Cloud', domain: 'rapyder.com', type: 'Remote' },
  { company: 'Comprinno Technologies', domain: 'comprinno.net', type: 'Pune' },
  { company: 'CloudThat', domain: 'cloudthat.com', type: 'Remote' },
  { company: 'Velocis Systems', domain: 'velocis.co.in', type: 'Remote' },
  { company: 'Trimble India', domain: 'trimble.com', type: 'Remote' },
  { company: 'Cybage Software', domain: 'cybage.com', type: 'Pune' },
  { company: 'Zensar Technologies', domain: 'zensar.com', type: 'Pune' },
  { company: 'KPIT Technologies', domain: 'kpit.com', type: 'Pune' },
  { company: 'Birlasoft', domain: 'birlasoft.com', type: 'Pune' },
  { company: 'Sonata Software', domain: 'sonata-software.com', type: 'Remote' },
  { company: 'Tata Elxsi', domain: 'tataelxsi.com', type: 'Remote' },
  { company: 'Persistent Systems', domain: 'persistent.com', type: 'Pune' },
  { company: 'Happiest Minds', domain: 'happiestminds.com', type: 'Remote' },
  { company: 'Coforge', domain: 'coforge.com', type: 'Remote' },
  { company: 'LTIMindtree', domain: 'ltimindtree.com', type: 'Mumbai' },
  { company: 'Hexaware', domain: 'hexaware.com', type: 'Mumbai' },
  { company: 'Mastek', domain: 'mastek.com', type: 'Mumbai' }
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
  fs.writeFileSync(path.join(__dirname, 'fresh_candidates_pool.json'), JSON.stringify(verified, null, 2), 'utf8');
}

run();
