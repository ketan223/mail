const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidatePool3 = [
  // --- NOIDA & GREATER NOIDA TECH COMPANIES ---
  { company: 'PureSoftware Technology Services', domain: 'puresoftware.com', type: 'Remote' },
  { company: 'GrapeCity India Software', domain: 'grapecity.in', type: 'Remote' },
  { company: 'Vakilsearch Legal Tech', domain: 'vakilsearch.com', type: 'Remote' },
  { company: 'IndiaMART InterMESH Tech', domain: 'indiamart.com', type: 'Remote' },
  { company: 'Justdial Local Search', domain: 'justdial.com', type: 'Mumbai' },
  { company: 'TradeIndia B2B Commerce', domain: 'tradeindia.com', type: 'Remote' },
  { company: 'Info Edge India Tech', domain: 'infoedge.in', type: 'Remote' },
  { company: 'Naukri.com Career Tech', domain: 'naukri.com', type: 'Remote' },
  { company: 'Jeevansathi Matchmaking Tech', domain: 'jeevansathi.com', type: 'Remote' },
  { company: '99acres Realty Platform', domain: '99acres.com', type: 'Remote' },
  { company: 'Shiksha Education Solutions', domain: 'shiksha.com', type: 'Remote' },
  { company: 'Zomato Feeding India', domain: 'feedingindia.org', type: 'Remote' },
  { company: 'Blink Commerce Quick Delivery', domain: 'blinkit.com', type: 'Remote' },
  { company: 'Grofers India Supply Chain', domain: 'grofers.com', type: 'Remote' },
  { company: 'Moglix Industrial B2B', domain: 'moglix.com', type: 'Remote' },
  { company: 'OfBusiness SME Financing & Commerce', domain: 'ofbusiness.com', type: 'Remote' },
  { company: 'Infra.Market Construction Tech', domain: 'infra.market', type: 'Mumbai' },
  { company: 'Zetwerk Manufacturing Network', domain: 'zetwerk.com', type: 'Remote' },
  { company: 'Bizongo Packaging & Supply Chain', domain: 'bizongo.com', type: 'Mumbai' },
  { company: 'Captain Fresh Seafood B2B', domain: 'captainfresh.in', type: 'Remote' },

  // --- GURGAON & DELHI TECH SCALEUPS ---
  { company: 'Cars24 Auto Tech Platform', domain: 'cars24.com', type: 'Remote' },
  { company: 'Spinny Pre-Owned Cars Tech', domain: 'spinny.com', type: 'Remote' },
  { company: 'CarDekho Girnar Software', domain: 'cardekho.com', type: 'Remote' },
  { company: 'ZigWheels Auto Platform', domain: 'zigwheels.com', type: 'Remote' },
  { company: 'BikeDekho Auto Platform', domain: 'bikedekho.com', type: 'Remote' },
  { company: 'CarTrade Tech Automotive', domain: 'cartrade.com', type: 'Mumbai' },
  { company: 'CarWale Automotive Digital', domain: 'carwale.com', type: 'Mumbai' },
  { company: 'BikeWale Two Wheeler Digital', domain: 'bikewale.com', type: 'Mumbai' },
  { company: 'Droom Technology AI Marketplace', domain: 'droom.in', type: 'Remote' },
  { company: 'Park+ Smart Parking & Auto Services', domain: 'parkplus.io', type: 'Remote' },
  { company: 'Chalo Public Transport Mobility', domain: 'chalo.com', type: 'Mumbai' },
  { company: 'Cityflo Commute Bus Tech', domain: 'cityflo.com', type: 'Mumbai' },
  { company: 'Shuttl Corporate Bus Mobility', domain: 'shuttl.com', type: 'Remote' },
  { company: 'Inshorts 60-Word News Tech', domain: 'inshorts.com', type: 'Remote' },
  { company: 'Public App Hyperlocal Video', domain: 'public.app', type: 'Remote' },
  { company: 'Dailyhunt VerSe Innovation', domain: 'dailyhunt.in', type: 'Remote' },
  { company: 'Josh Short Video Platform', domain: 'myjosh.in', type: 'Remote' },
  { company: 'ShareChat Mohalla Tech', domain: 'sharechat.co', type: 'Remote' },
  { company: 'Moj Short Video App', domain: 'mojapp.in', type: 'Remote' },
  { company: 'Koo India Microblogging', domain: 'kooapp.com', type: 'Remote' },
  { company: 'Pratilipi Storytelling Platform', domain: 'pratilipi.com', type: 'Remote' },
  { company: 'Pocket FM Audio Series', domain: 'pocketfm.com', type: 'Remote' },
  { company: 'Kuku FM Audio Content', domain: 'kukufm.com', type: 'Mumbai' },
  { company: 'Headfone Audio Community', domain: 'headfone.com', type: 'Remote' },
  { company: 'STAGE OTT Regional Content', domain: 'stage.in', type: 'Remote' },
  { company: 'Chaupal OTT Punjabi Bhojpuri', domain: 'chaupal.tv', type: 'Remote' },
  { company: 'Aha Video Telugu OTT', domain: 'aha.video', type: 'Remote' },
  { company: 'Hoichoi Bengali OTT', domain: 'hoichoi.tv', type: 'Remote' },
  { company: 'ShemarooMe Entertainment Digital', domain: 'shemaroome.com', type: 'Mumbai' },
  { company: 'SonyLIV Digital Entertainment', domain: 'sonyliv.com', type: 'Mumbai' },
  { company: 'ZEE5 Global Entertainment', domain: 'zee5.com', type: 'Mumbai' },

  // --- HEALTH & WELLNESS PLATFORMS ---
  { company: 'HealthKart Nutrition Tech', domain: 'healthkart.com', type: 'Remote' },
  { company: 'MuscleBlaze Fitness Nutrition', domain: 'muscleblaze.com', type: 'Remote' },
  { company: 'Oziva Clean Plant Nutrition', domain: 'oziva.in', type: 'Mumbai' },
  { company: 'Kapiva Ayurveda Wellness', domain: 'kapiva.in', type: 'Mumbai' },
  { company: 'Fast&Up Active Nutrition', domain: 'fastandup.in', type: 'Mumbai' },
  { company: 'Plix Plant Based Nutrition', domain: 'plixlife.com', type: 'Mumbai' },
  { company: 'Wellbeing Nutrition Organic', domain: 'wellbeingnutrition.com', type: 'Mumbai' },
  { company: 'What\'s Up Wellness Gummies', domain: 'whatsupwellness.in', type: 'Remote' },
  { company: 'Power Gummies Chewable Care', domain: 'powergummies.com', type: 'Remote' },
  { company: 'Toothsi Aligners MakeO', domain: 'toothsi.in', type: 'Mumbai' },
  { company: 'Skinnsi Dermatology MakeO', domain: 'skinnsi.in', type: 'Mumbai' },
  { company: 'Snackible Healthy Snacks', domain: 'snackible.com', type: 'Mumbai' },
  { company: 'The Whole Truth Foods', domain: 'thewholetruthfoods.com', type: 'Mumbai' },
  { company: 'Yoga Bar Sproutlife Foods', domain: 'yogabar.in', type: 'Remote' },
  { company: 'Slurrp Farm Millet Foods', domain: 'slurrpfarm.com', type: 'Remote' },
  { company: 'Open Secret Healthy Snacks', domain: 'opensecret.in', type: 'Mumbai' },
  { company: 'True Elements Clean Foods', domain: 'true-elements.com', type: 'Pune' },
  { company: 'Farmley Dry Fruits Snacking', domain: 'farmley.com', type: 'Remote' },
  { company: 'Happilo Healthy Snacking', domain: 'happilo.com', type: 'Remote' },
  { company: 'Epigamia Greek Yogurt Drumroll', domain: 'epigamia.com', type: 'Mumbai' },
  { company: 'ID Fresh Food Tech', domain: 'idfreshfood.com', type: 'Remote' },
  { company: 'Paper Boat Hector Beverages', domain: 'paperboatdrinks.com', type: 'Remote' },
  { company: 'Raw Pressery Cold Pressed', domain: 'rawpressery.com', type: 'Mumbai' },
  { company: 'Lahori Zeera Drink Tech', domain: 'lahorizeera.com', type: 'Remote' },
  { company: 'Bira 91 B9 Beverages Tech', domain: 'bira91.com', type: 'Remote' },
  { company: 'Sleepy Owl Coffee Brews', domain: 'sleepyowl.co', type: 'Remote' },
  { company: 'Blue Tokai Coffee Roasters', domain: 'bluetokaicoffee.com', type: 'Remote' },
  { company: 'Third Wave Coffee Roasters', domain: 'thirdwavecoffeeroasters.com', type: 'Remote' },
  { company: 'Chaayos Sunshine Teahouse', domain: 'chaayos.com', type: 'Remote' },
  { company: 'Chai Point Mountain Trail', domain: 'chaipoint.com', type: 'Remote' },
  { company: 'Rebel Foods Cloud Kitchens', domain: 'rebelfoods.com', type: 'Mumbai' },
  { company: 'EatClub Box8 Moyo Kitchens', domain: 'eatclub.com', type: 'Mumbai' },
  { company: 'Biryani By Kilo Sky Gate', domain: 'biryanibykilo.com', type: 'Remote' },

  // --- FASHION, APPAREL & D2C BRANDS ---
  { company: 'Snitch Menswear Fashion', domain: 'snitch.co.in', type: 'Remote' },
  { company: 'Bewakoof Apparel Digital', domain: 'bewakoof.com', type: 'Mumbai' },
  { company: 'The Souled Store Pop Culture', domain: 'thesouledstore.com', type: 'Mumbai' },
  { company: 'Bonkers Corner Streetwear', domain: 'bonkerscorner.com', type: 'Mumbai' },
  { company: 'Burger Baae Fashion App', domain: 'burgerbae.in', type: 'Remote' },
  { company: 'Bluorng Streetwear Design', domain: 'bluorng.com', type: 'Remote' },
  { company: 'Jaywalking Streetwear Apparel', domain: 'jaywalking.in', type: 'Mumbai' },
  { company: 'Bummer Comfort Underwear', domain: 'bummer.in', type: 'Remote' },
  { company: 'Freecultr Eco Fashion', domain: 'freecultr.com', type: 'Remote' },
  { company: 'DaMENSCH Men\'s Essential Wear', domain: 'damensch.com', type: 'Remote' },
  { company: 'XYXX Apparels Innerwear', domain: 'xyxxcrew.com', type: 'Mumbai' },
  { company: 'Clovia Purple Panda Fashions', domain: 'clovia.com', type: 'Remote' },
  { company: 'Zivame Actoserba Active Retail', domain: 'zivame.com', type: 'Remote' },
  { company: 'Nykaa Fashion Apparel', domain: 'nykaafashion.com', type: 'Mumbai' },
  { company: 'Ajio Reliance Retail Tech', domain: 'ajio.com', type: 'Mumbai' },
  { company: 'Tata CLiQ Luxury E-Commerce', domain: 'tatacliq.com', type: 'Mumbai' },
  { company: 'Myntra Flipkart Fashion Tech', domain: 'myntra.com', type: 'Remote' },
  { company: 'Lenskart Eyewear Solutions', domain: 'lenskart.com', type: 'Remote' },
  { company: 'John Jacobs Eyewear Digital', domain: 'john-jacobs.com', type: 'Remote' },
  { company: 'Vincent Chase Eyewear', domain: 'vincentchase.com', type: 'Remote' },
  { company: 'Giva Silver Jewellery Tech', domain: 'giva.co', type: 'Remote' },
  { company: 'Bluestone Jewellery & Lifestyle', domain: 'bluestone.com', type: 'Remote' },
  { company: 'CaratLane Tanishq Digital', domain: 'caratlane.com', type: 'Remote' },
  { company: 'Melorra Jewellery Tech', domain: 'melorra.com', type: 'Remote' },
  { company: 'Clara Jewels Silver Care', domain: 'clarajewels.com', type: 'Remote' },
  { company: 'Kalyan Jewellers Digital', domain: 'kalyanjewellers.net', type: 'Remote' },
  { company: 'Malabar Gold & Diamonds Digital', domain: 'malabargoldanddiamonds.com', type: 'Remote' },
  { company: 'Joyalukkas India Digital', domain: 'joyalukkas.in', type: 'Remote' },

  // --- HR TECH, RECRUITMENT & WORKFORCE PLATFORMS ---
  { company: 'Keka HR Payroll Software', domain: 'keka.com', type: 'Remote' },
  { company: 'ZingHR Cloud HCM Solutions', domain: 'zinghr.com', type: 'Mumbai' },
  { company: 'HROne Human Capital Cloud', domain: 'hrone.cloud', type: 'Remote' },
  { company: 'greytHR Greytip Software', domain: 'greythr.com', type: 'Remote' },
  { company: 'Pocket HRMS Cloud Payroll', domain: 'pockethrms.com', type: 'Mumbai' },
  { company: 'PeopleStrong Alt Worklife', domain: 'peoplestrong.com', type: 'Remote' },
  { company: 'SumTotal Systems Skillsoft', domain: 'sumtotalsystems.com', type: 'Remote' },
  { company: 'Cornerstone OnDemand Learning', domain: 'cornerstoneondemand.com', type: 'Mumbai' },
  { company: 'Degreed Upskilling Platform', domain: 'degreed.com', type: 'Remote' },
  { company: 'Disprz Corporate Learning AI', domain: 'disprz.com', type: 'Remote' },
  { company: 'Knolskape Gamified Learning', domain: 'knolskape.com', type: 'Remote' },
  { company: 'Harappa Education Learning', domain: 'harappa.education', type: 'Remote' },
  { company: 'SpeakIn Expert Learning Tech', domain: 'speakin.co', type: 'Remote' },
  { company: 'BetterPlace Blue Collar Workforce', domain: 'betterplace.co.in', type: 'Remote' },
  { company: 'WorkIndia Blue Collar Hiring', domain: 'workindia.in', type: 'Mumbai' },
  { company: 'Spottabl Tech Talent Network', domain: 'spottabl.com', type: 'Remote' },
  { company: 'Instahyre AI Recruiter Platform', domain: 'instahyre.com', type: 'Remote' },
  { company: 'Cutshort AI Talent Matching', domain: 'cutshort.io', type: 'Pune' },
  { company: 'Hirist Tech Jobs Platform', domain: 'hirist.com', type: 'Remote' },
  { company: 'IIMJobs Management Careers', domain: 'iimjobs.com', type: 'Remote' },
  { company: 'Hasjob Tech Jobs Community', domain: 'hasjob.co', type: 'Remote' },
  { company: 'AngelList Wellfound Startups', domain: 'wellfound.com', type: 'Remote' },
  { company: 'Remote.com Global HR Cloud', domain: 'remote.com', type: 'Remote' },
  { company: 'Deel Global Payroll Platform', domain: 'deel.com', type: 'Remote' },
  { company: 'Oyster HR Global Employment', domain: 'oysterhr.com', type: 'Remote' },
  { company: 'Multiplier Global Talent Cloud', domain: 'usemultiplier.com', type: 'Remote' },
  { company: 'Rippling Workforce Platform', domain: 'rippling.com', type: 'Remote' },
  { company: 'Gusto Modern Payroll Benefits', domain: 'gusto.com', type: 'Remote' },
  { company: 'Justworks PEO & Payroll', domain: 'justworks.com', type: 'Remote' },
  { company: 'Paychex HR Solutions Cloud', domain: 'paychex.com', type: 'Remote' },
  { company: 'ADP Automatic Data Processing', domain: 'adp.com', type: 'Remote' },

  // --- GLOBAL HIGH-GROWTH SAAS & TECH PLATFORMS ---
  { company: 'Canva Visual Suite Platform', domain: 'canva.com', type: 'Remote' },
  { company: 'Grammarly AI Writing Cloud', domain: 'grammarly.com', type: 'Remote' },
  { company: 'DeepL Translation AI Systems', domain: 'deepl.com', type: 'Remote' },
  { company: 'Otter.ai Voice Meeting Notes', domain: 'otter.ai', type: 'Remote' },
  { company: 'Fireflies.ai Meeting Recorder', domain: 'fireflies.ai', type: 'Remote' },
  { company: 'Fathom AI Meeting Assistant', domain: 'fathom.video', type: 'Remote' },
  { company: 'Grain AI Video Meeting Insights', domain: 'grain.com', type: 'Remote' },
  { company: 'Krisp AI Noise Cancellation', domain: 'krisp.ai', type: 'Remote' },
  { company: 'Descript AI Audio & Video Editor', domain: 'descript.com', type: 'Remote' },
  { company: 'CapCut ByteDance Creative', domain: 'capcut.com', type: 'Remote' },
  { company: 'InVideo AI Video Generator', domain: 'invideo.io', type: 'Mumbai' },
  { company: 'Steve.ai AI Video Making', domain: 'steve.ai', type: 'Remote' },
  { company: 'Animaker Animated Video Cloud', domain: 'animaker.com', type: 'Remote' },
  { company: 'Veed.io Online Video Editing', domain: 'veed.io', type: 'Remote' },
  { company: 'Kapwing Collaborative Video', domain: 'kapwing.com', type: 'Remote' },
  { company: 'Renderforest Design Tools', domain: 'renderforest.com', type: 'Remote' },
  { company: 'Vyond Animated Video Studio', domain: 'vyond.com', type: 'Remote' },
  { company: 'Powtoon Visual Communication', domain: 'powtoon.com', type: 'Remote' },
  { company: 'Prezi Interactive Presentations', domain: 'prezi.com', type: 'Remote' },
  { company: 'Mentimeter Interactive Polling', domain: 'mentimeter.com', type: 'Remote' },
  { company: 'Slido Audience Interaction', domain: 'sli.do', type: 'Remote' },
  { company: 'Typeform Interactive Forms', domain: 'typeform.com', type: 'Remote' },
  { company: 'Jotform Form Builder Cloud', domain: 'jotform.com', type: 'Remote' },
  { company: 'SurveyMonkey Momentive Tech', domain: 'surveymonkey.com', type: 'Remote' },
  { company: 'Qualtrics Experience Management', domain: 'qualtrics.com', type: 'Remote' },
  { company: 'Medallia Customer Experience', domain: 'medallia.com', type: 'Remote' },
  { company: 'InMoment Experience Improvement', domain: 'inmoment.com', type: 'Remote' },
  { company: 'Alida Customer Experience SaaS', domain: 'alida.com', type: 'Remote' },
  { company: 'QuestionPro Research Cloud', domain: 'questionpro.com', type: 'Remote' },
  { company: 'Formsite Web Form Builder', domain: 'formsite.com', type: 'Remote' },
  { company: 'Wufoo SurveyMonkey Forms', domain: 'wufoo.com', type: 'Remote' },
  { company: 'Formstack Workplace Productivity', domain: 'formstack.com', type: 'Remote' },
  { company: 'PandaDoc Document Automation', domain: 'pandadoc.com', type: 'Remote' },
  { company: 'SignNow airSlate eSignatures', domain: 'signnow.com', type: 'Remote' },
  { company: 'HelloSign Dropbox Sign', domain: 'hellosign.com', type: 'Remote' },
  { company: 'Adobe Acrobat Sign Cloud', domain: 'adobe.com', type: 'Remote' },
  { company: 'DocuSign Intelligent Agreement', domain: 'docusign.com', type: 'Remote' },
  { company: 'Oneflow Digital Contracts', domain: 'oneflow.com', type: 'Remote' },
  { company: 'Ironclad Digital Contracting', domain: 'ironcladapp.com', type: 'Remote' },
  { company: 'Contractbook Workflow Platform', domain: 'contractbook.com', type: 'Remote' },
  { company: 'Agiloft Contract Lifecycle Management', domain: 'agiloft.com', type: 'Remote' },
  { company: 'SirionLabs Contract AI Intelligence', domain: 'sirion.ai', type: 'Remote' },
  { company: 'Evisort AI Contract Management', domain: 'evisort.com', type: 'Remote' },
  { company: 'LinkSquares Contract Management', domain: 'linksquares.com', type: 'Remote' },
  { company: 'Kira Systems Diligence Engine', domain: 'kirasystems.com', type: 'Remote' },
  { company: 'Luminance Legal AI Platform', domain: 'luminance.com', type: 'Remote' },
  { company: 'Robin AI Legal Assistant', domain: 'robinai.com', type: 'Remote' },
  { company: 'Harvey AI Legal Orchestration', domain: 'harvey.ai', type: 'Remote' },
  { company: 'Casetext CoCounsel Legal AI', domain: 'casetext.com', type: 'Remote' },
  { company: 'LexisNexis Legal Intelligence', domain: 'lexisnexis.com', type: 'Remote' },
  { company: 'vLex Legal Intelligence Platform', domain: 'vlex.com', type: 'Remote' },
  { company: 'Fastcase Legal Research Cloud', domain: 'fastcase.com', type: 'Remote' }
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
  b1.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));
  b2.forEach(c => existing.add((c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidatePool3) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existing.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} prospective candidate companies in Batch 3 for DNS MX validation...`);

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

  console.log(`\n\nTotal newly verified in Batch 3: ${verified.length}`);
  fs.writeFileSync(path.join(__dirname, 'batch3_verified.json'), JSON.stringify(verified, null, 2), 'utf8');

  // Calculate cumulative verified total
  const grandTotal = b1.length + b2.length + verified.length;
  console.log(`Cumulative Verified Companies Across Batches 1, 2, 3: ${grandTotal}`);
}

run().catch(console.error);
