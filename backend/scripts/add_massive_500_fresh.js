const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

// Curated pool of 750+ tech companies across Indian IT corridors and global tech
const candidateCompanies = [
  // --- GUJARAT IT CORRIDOR (AHMEDABAD / SURAT / VADODARA / RAJKOT) ---
  { company: '7Span Digital', domain: '7span.com', type: 'Remote' },
  { company: 'Simform Solutions', domain: 'simform.com', type: 'Remote' },
  { company: 'Yudiz Solutions', domain: 'yudiz.com', type: 'Remote' },
  { company: 'Crest Data Systems', domain: 'crestdatasys.com', type: 'Remote' },
  { company: 'Tagline Infotech', domain: 'taglineinfotech.com', type: 'Remote' },
  { company: 'Narola Infotech', domain: 'narolainfotech.com', type: 'Remote' },
  { company: 'iMOBDEV Technologies', domain: 'imobdevtech.com', type: 'Remote' },
  { company: 'ViitorCloud Technologies', domain: 'viitorcloud.com', type: 'Remote' },
  { company: 'Positiwise Software Solutions', domain: 'positiwise.com', type: 'Remote' },
  { company: 'Samarpan Infotech', domain: 'samarpaninfotech.com', type: 'Remote' },
  { company: 'Nimap Infotech', domain: 'nimapinfotech.com', type: 'Mumbai' },
  { company: 'WebHopers Infotech', domain: 'webhopers.com', type: 'Remote' },
  { company: 'Codiant Software Technologies', domain: 'codiant.com', type: 'Remote' },
  { company: 'Promact Infotech', domain: 'promactinfo.com', type: 'Remote' },
  { company: 'Magneto IT Solutions', domain: 'magnetoitsolutions.com', type: 'Remote' },
  { company: 'KrishaWeb Technologies', domain: 'krishaweb.com', type: 'Remote' },
  { company: 'Elitech Systems', domain: 'elitechsystems.com', type: 'Remote' },
  { company: 'CreArt Solutions', domain: 'creartsolutions.com', type: 'Remote' },
  { company: 'Technostacks Infotech', domain: 'technostacks.com', type: 'Remote' },
  { company: 'Azilen Technologies', domain: 'azilen.com', type: 'Remote' },
  { company: 'WebDesk Solution', domain: 'webdesksolution.com', type: 'Remote' },
  { company: 'Infopercept Consulting', domain: 'infopercept.com', type: 'Remote' },
  { company: 'Cybercom Creation', domain: 'cybercomcreation.com', type: 'Remote' },
  { company: 'Logicrays Technologies', domain: 'logicrays.com', type: 'Remote' },
  { company: 'W3care Technologies', domain: 'w3care.com', type: 'Remote' },
  { company: 'Avasam Marketplace SaaS', domain: 'avasam.com', type: 'Remote' },
  { company: 'Gateway Digital Systems', domain: 'gatewaydigital.com', type: 'Remote' },
  { company: 'TOPS Technologies Global', domain: 'tops-int.com', type: 'Remote' },

  // --- KERALA IT CORRIDOR (KOCHI INFOPARK / TRIVANDRUM TECHNOPARK / CALICUT) ---
  { company: 'UST Global Technologies', domain: 'ust.com', type: 'Remote' },
  { company: 'IBS Software Enterprise', domain: 'ibsplc.com', type: 'Remote' },
  { company: 'SunTec Business Solutions', domain: 'suntecgroup.com', type: 'Remote' },
  { company: 'SurveySparrow Experience Cloud', domain: 'surveysparrow.com', type: 'Remote' },
  { company: 'Accubits Technologies AI', domain: 'accubits.com', type: 'Remote' },
  { company: 'Beagle Security Cloud', domain: 'beaglesecurity.com', type: 'Remote' },
  { company: 'Appiness Interactive', domain: 'appinessworld.com', type: 'Remote' },
  { company: 'LiteBreeze Software Systems', domain: 'litebreeze.com', type: 'Remote' },
  { company: 'Sesame Software Systems', domain: 'sesameindia.com', type: 'Remote' },
  { company: 'Artin Dynamics AI', domain: 'artindynamics.com', type: 'Remote' },
  { company: 'Perfomatix Product Engineering', domain: 'perfomatix.com', type: 'Remote' },
  { company: 'Toobler IoT & Cloud Technologies', domain: 'toobler.com', type: 'Remote' },
  { company: 'QBurst Technologies Global', domain: 'qburst.com', type: 'Remote' },
  { company: 'Polus Software Systems', domain: 'polussoftware.com', type: 'Remote' },
  { company: 'Mozanta Technologies', domain: 'mozanta.com', type: 'Remote' },
  { company: 'Flytxt Mobile AI Platform', domain: 'flytxt.com', type: 'Remote' },
  { company: 'Claysys Cloud Technologies', domain: 'claysys.com', type: 'Remote' },
  { company: 'KeyValue Software Systems', domain: 'keyvaluesoftware.com', type: 'Remote' },
  { company: 'Aabasoft Technologies Systems', domain: 'aabasoft.com', type: 'Remote' },
  { company: 'Mindster Mobile Studio', domain: 'mindster.com', type: 'Remote' },
  { company: 'Bridge Global Software', domain: 'bridge-global.com', type: 'Remote' },
  { company: 'Zoondia Software Solutions', domain: 'zoondia.com', type: 'Remote' },
  { company: 'Sigosoft Technologies', domain: 'sigosoft.com', type: 'Remote' },
  { company: 'TechVersant Infotech', domain: 'techversantinfotech.com', type: 'Remote' },
  { company: 'ZestyBeanz Technologies', domain: 'zbeanztech.com', type: 'Remote' },
  { company: 'Pivot Systems Global', domain: 'pivotsys.com', type: 'Remote' },
  { company: 'Travancore Analytics', domain: 'travancoreanalytics.com', type: 'Remote' },
  { company: 'Trenser Technology Solutions', domain: 'trenser.com', type: 'Remote' },

  // --- TRICITY IT CORRIDOR (CHANDIGARH / MOHALI / PANCHKULA) ---
  { company: 'Kindlebit Solutions Global', domain: 'kindlebit.com', type: 'Remote' },
  { company: 'Enuke Software Labs', domain: 'enukesoftware.com', type: 'Remote' },
  { company: 'Zapbuild Technologies Cloud', domain: 'zapbuild.com', type: 'Remote' },
  { company: 'Jungleworks Click Labs Tech', domain: 'jungleworks.com', type: 'Remote' },
  { company: 'Solitaire Infosys Systems', domain: 'slinfy.com', type: 'Remote' },
  { company: 'Oodles Technologies AI', domain: 'oodles.com', type: 'Remote' },
  { company: 'Thinksys Technologies QA', domain: 'thinksys.com', type: 'Remote' },
  { company: 'Code Brew Labs Products', domain: 'code-brew.com', type: 'Remote' },
  { company: 'Apptunix Mobile Technologies', domain: 'apptunix.com', type: 'Remote' },
  { company: 'Cerebrum Infotech Software', domain: 'cerebruminfotech.com', type: 'Remote' },
  { company: 'Techugo Mobile App Labs', domain: 'techugo.com', type: 'Remote' },
  { company: 'CS Soft Solutions Global', domain: 'cssoftsolutions.com', type: 'Remote' },
  { company: 'Debut Infotech Systems', domain: 'debutinfotech.com', type: 'Remote' },
  { company: 'RV Technologies Software', domain: 'rvtechnologies.com', type: 'Remote' },
  { company: 'Softobiz Technologies Cloud', domain: 'softobiz.com', type: 'Remote' },
  { company: 'Root Info Solutions', domain: 'rootinfosolutions.com', type: 'Remote' },
  { company: 'Deftsoft Informatics Global', domain: 'deftsoft.com', type: 'Remote' },

  // --- MADHYA PRADESH & RAJASTHAN IT CORRIDOR (INDORE / BHOPAL / JAIPUR / UDAIPUR) ---
  { company: 'World Web Technology Systems', domain: 'worldwebtechnology.com', type: 'Remote' },
  { company: 'Pratiti Technologies Cloud', domain: 'pratititech.com', type: 'Pune' },
  { company: 'GammaStack Software Labs', domain: 'gammastack.com', type: 'Remote' },
  { company: 'ITConnectUS Technologies', domain: 'itconnectus.com', type: 'Remote' },
  { company: 'Mindinventory Digital Engineering', domain: 'mindinventory.com', type: 'Remote' },

  // --- SOUTH INDIA IT HUBS (CHENNAI / COIMBATORE / MADURAI / VIZAG) ---
  { company: 'Aspire Systems Global', domain: 'aspiresys.com', type: 'Remote' },
  { company: 'Prodapt Solutions Telecom', domain: 'prodapt.com', type: 'Remote' },
  { company: 'Birlasoft Enterprise Software', domain: 'birlasoft.com', type: 'Pune' },
  { company: 'Ramco Systems Cloud ERP', domain: 'ramco.com', type: 'Remote' },
  { company: 'Saksoft Information Systems', domain: 'saksoft.com', type: 'Remote' },
  { company: 'Sify Technologies Cloud Network', domain: 'sifytechnologies.com', type: 'Remote' },
  { company: 'Intellect Design Arena FinTech', domain: 'intellectdesign.com', type: 'Remote' },
  { company: 'Take Solutions Life Sciences', domain: 'takesolutions.com', type: 'Remote' },
  { company: 'Bahwan CyberTek Cloud', domain: 'bahwancybertek.com', type: 'Remote' },
  { company: 'GAVS Technologies AIOps', domain: 'gavstech.com', type: 'Remote' },
  { company: 'Financial Software Systems FSS', domain: 'fsstech.com', type: 'Remote' },
  { company: 'Hexaware Technologies Global', domain: 'hexaware.com', type: 'Mumbai' },
  { company: 'Cigniti Technologies Quality', domain: 'cigniti.com', type: 'Remote' },
  { company: 'Zen Technologies Simulation', domain: 'zentechnologies.com', type: 'Remote' },
  { company: 'Tanla Platforms CPaaS Cloud', domain: 'tanla.com', type: 'Remote' },
  { company: 'Route Mobile Communications', domain: 'routemobile.com', type: 'Mumbai' },
  { company: 'Cyient Engineering Technologies', domain: 'cyient.com', type: 'Remote' },
  { company: 'Sonata Software Systems', domain: 'sonata-software.com', type: 'Remote' },
  { company: 'Zensar Technologies Enterprise', domain: 'zensar.com', type: 'Pune' },
  { company: 'KPIT Technologies Automotive', domain: 'kpit.com', type: 'Pune' },
  { company: 'Coforge Digital Services', domain: 'coforge.com', type: 'Remote' },
  { company: 'LTIMindtree Digital Tech', domain: 'ltimindtree.com', type: 'Mumbai' },
  { company: 'Tata Elxsi Design & Tech', domain: 'tataelxsi.com', type: 'Remote' },
  { company: 'L&T Technology Services LTTS', domain: 'ltts.com', type: 'Mumbai' },
  { company: 'Persistent Systems Digital', domain: 'persistent.com', type: 'Pune' },

  // --- INDIAN FINTECH, WEALTHTECH & NEOBANKING ---
  { company: 'Zerodha Broking Platform', domain: 'zerodha.com', type: 'Remote' },
  { company: 'Groww Financial Cloud', domain: 'groww.in', type: 'Remote' },
  { company: 'Upstox Securities Tech', domain: 'upstox.com', type: 'Mumbai' },
  { company: 'AngelOne FinTech Cloud', domain: 'angelone.in', type: 'Mumbai' },
  { company: 'Dhan Super Trading App', domain: 'dhan.co', type: 'Mumbai' },
  { company: 'Smallcase Investment Tech', domain: 'smallcase.com', type: 'Remote' },
  { company: 'INDmoney SuperMoney App', domain: 'indmoney.com', type: 'Remote' },
  { company: 'CRED Members Platform', domain: 'cred.club', type: 'Remote' },
  { company: 'Slice Credit Tech', domain: 'sliceit.com', type: 'Remote' },
  { company: 'Jupiter Digital Banking', domain: 'jupiter.money', type: 'Mumbai' },
  { company: 'Fi Money Neobanking App', domain: 'fi.money', type: 'Remote' },
  { company: 'OneCard Metallic Credit Card', domain: 'getonecard.com', type: 'Pune' },
  { company: 'Uni Cards PayTech', domain: 'uni.cards', type: 'Remote' },
  { company: 'LazyPay Checkout Credit', domain: 'lazypay.in', type: 'Mumbai' },
  { company: 'Simpl 1-Tap Checkout', domain: 'getsimpl.com', type: 'Remote' },
  { company: 'BharatPe Merchant Tech', domain: 'bharatpe.com', type: 'Remote' },
  { company: 'Khatabook Digital Ledger', domain: 'khatabook.com', type: 'Remote' },
  { company: 'OkCredit Digital Khata', domain: 'okcredit.in', type: 'Remote' },
  { company: 'Razorpay Payments Cloud', domain: 'razorpay.com', type: 'Remote' },
  { company: 'Cashfree Payments Gateway', domain: 'cashfree.com', type: 'Remote' },
  { company: 'Instamojo Commerce Platform', domain: 'instamojo.com', type: 'Remote' },
  { company: 'Pine Labs Merchant Fintech', domain: 'pinelabs.com', type: 'Remote' },
  { company: 'Mswipe Mobile POS Systems', domain: 'mswipe.com', type: 'Mumbai' },
  { company: 'PayU India Digital Payments', domain: 'payu.in', type: 'Remote' },
  { company: 'BillDesk Online Payments', domain: 'billdesk.com', type: 'Mumbai' },
  { company: 'CCAvenue Payment Solutions', domain: 'ccavenue.com', type: 'Mumbai' },
  { company: 'FamApp Payments For Teens', domain: 'famapp.in', type: 'Remote' },

  // --- QUICK COMMERCE, LOGISTICS & D2C STARTUPS ---
  { company: 'Zepto Instant Delivery', domain: 'zeptonow.com', type: 'Mumbai' },
  { company: 'Blinkit Quick Delivery', domain: 'blinkit.com', type: 'Remote' },
  { company: 'Swiggy Food & Grocery Tech', domain: 'swiggy.com', type: 'Remote' },
  { company: 'Zomato Delivery Platform', domain: 'zomato.com', type: 'Remote' },
  { company: 'Dunzo Delivery Network', domain: 'dunzo.com', type: 'Remote' },
  { company: 'BigBasket Online Supermarket', domain: 'bigbasket.com', type: 'Remote' },
  { company: 'JioMart Retail Digital', domain: 'jiomart.com', type: 'Mumbai' },
  { company: 'Meesho Reselling Platform', domain: 'meesho.com', type: 'Remote' },
  { company: 'Nykaa Beauty Commerce', domain: 'nykaa.com', type: 'Mumbai' },
  { company: 'Purplle Beauty Platform', domain: 'purplle.com', type: 'Mumbai' },
  { company: 'Sugar Cosmetics Digital', domain: 'sugarcosmetics.com', type: 'Mumbai' },
  { company: 'Mamaearth Honasa Consumer', domain: 'mamaearth.in', type: 'Remote' },
  { company: 'Wow Skin Science Digital', domain: 'buywow.in', type: 'Remote' },
  { company: 'Plum Goodness Beauty Tech', domain: 'plumgoodness.com', type: 'Mumbai' },
  { company: 'MCaffeine Caffeinated Care', domain: 'mcaffeine.com', type: 'Mumbai' },
  { company: 'The Derma Co Skincare', domain: 'thedermaco.com', type: 'Remote' },
  { company: 'boAt Lifestyle Audio Tech', domain: 'boat-lifestyle.com', type: 'Mumbai' },
  { company: 'Noise Smart Wearables', domain: 'gonoise.com', type: 'Remote' },
  { company: 'Fire-Boltt Smartwatch Tech', domain: 'fireboltt.com', type: 'Remote' },
  { company: 'Boult Audio Acoustic Tech', domain: 'boultaudio.com', type: 'Remote' },
  { company: 'Mivi Audio Innovation', domain: 'mivi.in', type: 'Remote' },
  { company: 'Portronics Digital Gadgets', domain: 'portronics.com', type: 'Remote' },
  { company: 'Wakefit Home & Sleep Solutions', domain: 'wakefit.co', type: 'Remote' },
  { company: 'SleepyCat Mattress Platform', domain: 'sleepycat.in', type: 'Mumbai' },
  { company: 'Pepperfry Furniture Cloud', domain: 'pepperfry.com', type: 'Mumbai' },
  { company: 'Urban Ladder Home Decor', domain: 'urbanladder.com', type: 'Remote' },
  { company: 'Furlenco Furniture Subscription', domain: 'furlenco.com', type: 'Remote' },
  { company: 'Rentomojo Rental Solutions', domain: 'rentomojo.com', type: 'Remote' },
  { company: 'WoodenStreet Custom Furniture', domain: 'woodenstreet.com', type: 'Remote' },
  { company: 'Livspace Interior Platform', domain: 'livspace.com', type: 'Remote' },
  { company: 'HomeLane Interior Tech', domain: 'homelane.com', type: 'Remote' },
  { company: 'Design Cafe Home Interiors', domain: 'designcafe.com', type: 'Remote' },
  { company: 'Shiprocket E-Commerce Logistics', domain: 'shiprocket.in', type: 'Remote' },
  { company: 'Pickrr Logistics Platform', domain: 'pickrr.com', type: 'Remote' },
  { company: 'Delhivery Supply Chain Cloud', domain: 'delhivery.com', type: 'Remote' },
  { company: 'Xpressbees Express Logistics', domain: 'xpressbees.com', type: 'Pune' },
  { company: 'Shadowfax OnDemand Logistics', domain: 'shadowfax.in', type: 'Remote' },
  { company: 'Ecom Express Logistics Network', domain: 'ecomexpress.in', type: 'Remote' },
  { company: 'Porter Mini Truck Logistics', domain: 'porter.in', type: 'Mumbai' },
  { company: 'Blowhorn Intralogistics Cloud', domain: 'blowhorn.com', type: 'Remote' },
  { company: 'LoadShare Networks Express', domain: 'loadshare.net', type: 'Remote' },
  { company: 'BlackBuck Freight Network', domain: 'blackbuck.com', type: 'Remote' },
  { company: 'Rivigo Relay Logistics', domain: 'rivigo.com', type: 'Remote' },
  { company: 'WheelsEye Fleet Tech', domain: 'wheelseye.com', type: 'Remote' },
  { company: 'WayCool Food Supply Chain', domain: 'waycool.in', type: 'Remote' },
  { company: 'Otipy Fresh Produce Delivery', domain: 'otipy.com', type: 'Remote' },
  { company: 'Licious Meat Delivery Platform', domain: 'licious.in', type: 'Remote' },
  { company: 'Captain Fresh Seafood Network', domain: 'captainfresh.in', type: 'Remote' },

  // --- MOBILITY, EV & AUTOMOTIVE TECH ---
  { company: 'Rapido Bike Taxi Network', domain: 'rapido.bike', type: 'Remote' },
  { company: 'BluSmart EV Mobility Fleet', domain: 'blu-smart.com', type: 'Remote' },
  { company: 'Ola Cabs Ride Hailing Cloud', domain: 'olacabs.com', type: 'Remote' },
  { company: 'Ather Energy Smart Scooters', domain: 'atherenergy.com', type: 'Remote' },
  { company: 'Ola Electric Vehicle Mobility', domain: 'olaelectric.com', type: 'Remote' },
  { company: 'Simple Energy EV Tech', domain: 'simpleenergy.in', type: 'Remote' },
  { company: 'Ultraviolette Automotive Electric', domain: 'ultraviolette.com', type: 'Remote' },
  { company: 'Revolt Motors AI Motorcycle', domain: 'revoltmotors.com', type: 'Remote' },
  { company: 'Tork Motors Electric Motorcycles', domain: 'torkmotors.com', type: 'Pune' },
  { company: 'Euler Motors Commercial EV', domain: 'eulermotors.com', type: 'Remote' },
  { company: 'Yulu Mobility Shared Electric', domain: 'yulu.bike', type: 'Remote' },
  { company: 'Bounce Infinity Electric Scooters', domain: 'bounceshare.com', type: 'Remote' },
  { company: 'Battery Smart Battery Swapping', domain: 'batterysmart.in', type: 'Remote' },
  { company: 'Sun Mobility Clean Energy EV', domain: 'sunmobility.com', type: 'Remote' },
  { company: 'Kazam EV Charging Network', domain: 'kazam.in', type: 'Remote' },
  { company: 'Statiq EV Charging Infrastructure', domain: 'statiq.in', type: 'Remote' },
  { company: 'Bolt Earth EV Operating System', domain: 'bolt.earth', type: 'Remote' },
  { company: 'Magenta Mobility Clean Fleet', domain: 'magentamobility.com', type: 'Mumbai' },
  { company: 'Exponent Energy Rapid Charging', domain: 'exponent.energy', type: 'Remote' },
  { company: 'Log9 Materials Advanced Battery', domain: 'log9materials.com', type: 'Remote' },
  { company: 'Eka Mobility Commercial Vehicles', domain: 'ekamobility.com', type: 'Pune' },

  // --- SPACETECH, DRONES & ROBOTICS STARTUPS ---
  { company: 'Skyroot Aerospace Launch Vehicles', domain: 'skyroot.in', type: 'Remote' },
  { company: 'Agnikul Cosmos Launch Vehicles', domain: 'agnikul.in', type: 'Remote' },
  { company: 'Pixxel Space Hyperspectral Imaging', domain: 'pixxel.space', type: 'Remote' },
  { company: 'Bellatrix Aerospace Satellite Propulsion', domain: 'bellatrixaerospace.com', type: 'Remote' },
  { company: 'Dhruva Space Satellite Platforms', domain: 'dhruvaspace.com', type: 'Remote' },
  { company: 'Digantara Space Situational Awareness', domain: 'digantara.com', type: 'Remote' },
  { company: 'GalaxEye Space MultiSensor Imagery', domain: 'galaxeye.space', type: 'Remote' },
  { company: 'IdeaForge Autonomous UAVs', domain: 'ideaforge.co.in', type: 'Mumbai' },
  { company: 'Garuda Aerospace Drone Tech', domain: 'garudaaerospace.com', type: 'Remote' },
  { company: 'Skylark Drones Platform Cloud', domain: 'skylarkdrones.com', type: 'Remote' },
  { company: 'Aarav Unmanned Systems AUS', domain: 'aus.co.in', type: 'Remote' },
  { company: 'General Aeronautics Drone Cloud', domain: 'generalaeronautics.com', type: 'Remote' },
  { company: 'Redwing Labs Medical Drone Logistics', domain: 'redwinglabs.com', type: 'Remote' },
  { company: 'TechEagle Drone Delivery Network', domain: 'techeagle.in', type: 'Remote' },
  { company: 'FlytBase Autonomous Drone Software', domain: 'flytbase.com', type: 'Pune' },
  { company: 'UrbanMatrix Drones Enterprise', domain: 'urbanmatrix.co.in', type: 'Remote' },
  { company: 'Asteria Aerospace Drone Solutions', domain: 'asteria.co.in', type: 'Remote' },
  { company: 'Addverb Technologies Warehouse Robotics', domain: 'addverb.com', type: 'Remote' },
  { company: 'GreyOrange Automated Robotics', domain: 'greyorange.com', type: 'Remote' },
  { company: 'Unbox Robotics Fulfillment Sorting', domain: 'unboxrobotics.com', type: 'Pune' },
  { company: 'Falcon Autotech Sortation Systems', domain: 'falconautotech.com', type: 'Remote' },
  { company: 'Armstrong Automation Systems', domain: 'armstrongltd.com', type: 'Pune' },
  { company: 'Gridbots Technologies Industrial AI', domain: 'gridbots.com', type: 'Remote' },
  { company: 'FloMobility Autonomous Platform', domain: 'flomobility.com', type: 'Remote' },
  { company: 'Haber Automated Industrial Water', domain: 'haberwater.com', type: 'Pune' },
  { company: 'CynLr Machine Vision Cybernetics', domain: 'cynlr.com', type: 'Remote' },
  { company: 'Peppermint Autonomous Floor Robotics', domain: 'peppermint.robotics', type: 'Pune' },

  // --- TRAVELTECH, HOSPITALITY & REALTY PLATFORMS ---
  { company: 'MakeMyTrip Travel Bookings', domain: 'makemytrip.com', type: 'Remote' },
  { company: 'Yatra Online Travel Cloud', domain: 'yatra.com', type: 'Remote' },
  { company: 'EaseMyTrip Travel Platform', domain: 'easemytrip.com', type: 'Remote' },
  { company: 'Cleartrip Travel Tech Systems', domain: 'cleartrip.com', type: 'Mumbai' },
  { company: 'Ixigo Intelligent Travel AI', domain: 'ixigo.com', type: 'Remote' },
  { company: 'AbhiBus Online Bus Bookings', domain: 'abhibus.com', type: 'Remote' },
  { company: 'RedBus Intercity Bus Platform', domain: 'redbus.in', type: 'Remote' },
  { company: 'OYO Rooms Hospitality Network', domain: 'oyorooms.com', type: 'Remote' },
  { company: 'Treebo Hotels Quality Stays', domain: 'treebo.com', type: 'Remote' },
  { company: 'FabHotels Budget Stays Cloud', domain: 'fabhotels.com', type: 'Remote' },
  { company: '99acres Real Estate Platform', domain: '99acres.com', type: 'Remote' },
  { company: 'PropTiger Real Estate Advisory', domain: 'proptiger.com', type: 'Remote' },
  { company: 'Colive Shared Living Spaces', domain: 'colive.com', type: 'Remote' },

  // --- GLOBAL AI, SEMICONDUCTOR & DEEPTECH PLATFORMS ---
  { company: 'Etched AI ASIC Systems', domain: 'etched.com', type: 'Remote' },
  { company: 'Lightmatter Photonic Supercomputing', domain: 'lightmatter.co', type: 'Remote' },
  { company: 'Celestial AI Photonic Fabrics', domain: 'celestial.ai', type: 'Remote' },
  { company: 'Enfabrica Accelerated Networking', domain: 'enfabrica.net', type: 'Remote' },
  { company: 'D-Matrix In-Memory AI Compute', domain: 'd-matrix.ai', type: 'Remote' },
  { company: 'SambaNova Systems Enterprise AI', domain: 'sambanova.ai', type: 'Remote' },
  { company: 'Untether AI Energy Efficient Compute', domain: 'untether.ai', type: 'Remote' },
  { company: 'Blaize Edge AI Computing', domain: 'blaize.com', type: 'Remote' },
  { company: 'Hailo Edge AI Microprocessors', domain: 'hailo.ai', type: 'Remote' },
  { company: 'Graphcore IPU Silicon Systems', domain: 'graphcore.ai', type: 'Remote' },
  { company: 'Mythic Analog AI Computing', domain: 'mythic.ai', type: 'Remote' },
  { company: 'SiMa.ai Machine Learning SoC', domain: 'sima.ai', type: 'Remote' },
  { company: 'Kneron Edge AI Microchips', domain: 'kneron.com', type: 'Remote' },
  { company: 'EdgeCortix Edge AI Silicon', domain: 'edgecortix.com', type: 'Remote' },
  { company: 'MemryX AI Accelerator Silicon', domain: 'memryx.com', type: 'Remote' },
  { company: 'DeepX AI Semiconductor Labs', domain: 'deepx.ai', type: 'Remote' },
  { company: 'FuriosaAI Semiconductor Cloud', domain: 'furiosa.ai', type: 'Remote' },
  { company: 'Rebellions NPU Silicon Systems', domain: 'rebellions.ai', type: 'Remote' },
  { company: 'Sapeon AI Semiconductor Solutions', domain: 'sapeon.com', type: 'Remote' },
  { company: 'Preferred Networks Deep Learning', domain: 'preferred.jp', type: 'Remote' },
  { company: 'LeapMind Ultra-Low Power AI', domain: 'leapmind.io', type: 'Remote' },
  { company: 'Axelera AI Metis AI Platform', domain: 'axelera.ai', type: 'Remote' },
  { company: 'Innatera Neuromorphic Silicon', domain: 'innatera.com', type: 'Remote' },
  { company: 'Syntiant Ultra Low Power Silicon', domain: 'syntiant.com', type: 'Remote' },
  { company: 'BrainChip Akida Neuromorphic', domain: 'brainchip.com', type: 'Remote' },
  { company: 'Aspinity Analog Machine Learning', domain: 'aspinity.com', type: 'Remote' },
  { company: 'Perceive Ergo AI Processors', domain: 'perceive.io', type: 'Remote' },
  { company: 'Expedera NPU Architecture Labs', domain: 'expedera.com', type: 'Remote' },
  { company: 'Quadric General-Purpose NPU', domain: 'quadric.io', type: 'Remote' },
  { company: 'Kalray Manycore Processors', domain: 'kalrayinc.com', type: 'Remote' },
  { company: 'SiFive RISC-V Computing Silicon', domain: 'sifive.com', type: 'Remote' },
  { company: 'Codasip RISC-V Custom Silicon', domain: 'codasip.com', type: 'Remote' },
  { company: 'Andes Technology RISC-V Cores', domain: 'andestech.com', type: 'Remote' },
  { company: 'Ventana Micro Systems High Performance', domain: 'ventanamicro.com', type: 'Remote' },
  { company: 'Rivos High Performance RISC-V', domain: 'rivosinc.com', type: 'Remote' },
  { company: 'Esperanto Technologies Thousands Cores', domain: 'esperanto.ai', type: 'Remote' },
  { company: 'Rain AI Neuromorphic Compute', domain: 'rain.ai', type: 'Remote' },
  { company: 'Extropic Physics Thermodynamic AI', domain: 'extropic.ai', type: 'Remote' },
  { company: 'Normal Computing Thermodynamic AI', domain: 'normalcomputing.ai', type: 'Remote' },
  { company: 'LightSolver Optical Processing', domain: 'lightsolver.com', type: 'Remote' },
  { company: 'IonQ Trapped Ion Quantum Compute', domain: 'ionq.com', type: 'Remote' },
  { company: 'Rigetti Superconducting Quantum', domain: 'rigetti.com', type: 'Remote' },
  { company: 'D-Wave Quantum Annealing Systems', domain: 'dwavesys.com', type: 'Remote' },
  { company: 'Xanadu Photonic Quantum Computing', domain: 'xanadu.ai', type: 'Remote' },
  { company: 'PsiQuantum Silicon Quantum Systems', domain: 'psiquantum.com', type: 'Remote' },
  { company: 'Classiq Quantum Software Platform', domain: 'classiq.io', type: 'Remote' },
  { company: 'Q-CTRL Quantum Infrastructure', domain: 'q-ctrl.com', type: 'Remote' },
  { company: 'Strangeworks Quantum Software Ecosystem', domain: 'strangeworks.com', type: 'Remote' },
  { company: 'Horizon Quantum Computing Software', domain: 'horizonquantum.com', type: 'Remote' },
  { company: 'Riverlane Quantum Error Correction', domain: 'riverlane.com', type: 'Remote' },
  { company: 'QpiAI Quantum AI Solutions', domain: 'qpiai.tech', type: 'Remote' },
  { company: 'BosonQ Psi Quantum Simulation', domain: 'bosonqpsi.com', type: 'Remote' }
];

async function run() {
  const dirPath = path.join(__dirname, '../data/company_directory.js');
  const dir = require(dirPath);
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');

  const contacted = new Set();
  sentLog.forEach(x => {
    if (x.email && x.email.includes('@')) {
      const p = x.email.split('@')[1];
      if (p) contacted.add(p.toLowerCase().trim());
    }
  });

  const existingDomains = new Set(dir.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidateCompanies) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existingDomains.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} completely new prospective candidates for DNS MX validation...`);

  const verifiedNew = [];
  const CONCURRENCY = 30;

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

  console.log(`\n\nTotal newly verified uncontacted companies in this batch: ${verifiedNew.length}`);

  // Write newly verified to temporary pool
  fs.writeFileSync(path.join(__dirname, 'batch1_verified.json'), JSON.stringify(verifiedNew, null, 2), 'utf8');
}

run().catch(console.error);
