const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

// Load previous verified pool (214 companies)
let existingVerified = [];
try {
  existingVerified = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified_massive_pool.json'), 'utf8') || '[]');
} catch (e) {}

console.log(`Loaded ${existingVerified.length} previously verified fresh companies.`);

const newCandidates = [
  // --- SURAT & SOUTH GUJARAT IT FIRMS ---
  { company: 'Vasundhara Infotech', domain: 'vasundharainfotech.com', type: 'Remote' },
  { company: 'Narayan Infotech', domain: 'narayaninfotech.com', type: 'Remote' },
  { company: 'BVM Infotech', domain: 'bvminfotech.com', type: 'Remote' },
  { company: 'Bitcoding Solutions', domain: 'bitcodingsolutions.com', type: 'Remote' },
  { company: 'Atologist Infotech', domain: 'atologist.com', type: 'Remote' },
  { company: 'UpNext Software', domain: 'upnextsoftware.com', type: 'Remote' },
  { company: 'Balaji Infosol', domain: 'balajiinfosol.com', type: 'Remote' },
  { company: 'Codeedoc Solutions', domain: 'codeedoc.com', type: 'Remote' },
  { company: 'HelixWebi IT', domain: 'helixwebi.com', type: 'Remote' },
  { company: 'WebOsmotic Software', domain: 'webosmotic.com', type: 'Remote' },
  { company: 'Softkites Technologies', domain: 'softkites.com', type: 'Remote' },
  { company: 'Techvoot Solutions', domain: 'techvoot.com', type: 'Remote' },
  { company: 'CreArt Solutions', domain: 'creartsolutions.com', type: 'Remote' },
  { company: 'Coruscate Solutions', domain: 'coruscatesolution.com', type: 'Remote' },
  { company: 'Shaligram Infotech', domain: 'shaligraminfotech.com', type: 'Remote' },
  { company: 'Techtic Solutions', domain: 'techtic.com', type: 'Remote' },
  { company: 'SmartSight Innovations', domain: 'smartsight.in', type: 'Remote' },

  // --- VADODARA TECH & ENGINEERING ---
  { company: 'Prakash Software Solutions', domain: 'prakashinfotech.com', type: 'Remote' },
  { company: 'Pavans Group', domain: 'pavansgroup.com', type: 'Remote' },
  { company: 'AtliQ Technologies', domain: 'atliq.com', type: 'Remote' },
  { company: 'Tecunique Private Limited', domain: 'tecunique.com', type: 'Remote' },
  { company: 'Spaculus Software', domain: 'spaculus.com', type: 'Remote' },
  { company: 'Atyantik Technologies', domain: 'atyantik.com', type: 'Remote' },
  { company: 'Svaapta IT-Ally Solutions', domain: 'svaapta.com', type: 'Remote' },
  { company: '7 Cloud InfoTech', domain: '7cloudinfotech.com', type: 'Remote' },
  { company: 'WeblineIndia Tech', domain: 'weblineindia.com', type: 'Remote' },
  { company: 'DevStree IT Services', domain: 'devstree.com', type: 'Remote' },
  { company: 'ViitorCloud Vadodara', domain: 'viitorcloud.com', type: 'Remote' },
  { company: 'Rishabh Software Vadodara', domain: 'rishabhsoft.com', type: 'Remote' },
  { company: 'Inexture Solutions Gujarat', domain: 'inexture.com', type: 'Remote' },
  { company: 'Amar Infotech Vadodara', domain: 'amarinfotech.com', type: 'Remote' },

  // --- RAJKOT & SAURASHTRA IT HUBS ---
  { company: 'Aegis Softtech', domain: 'aegissofttech.com', type: 'Remote' },
  { company: 'Empyreal Infotech', domain: 'empyrealinfotech.com', type: 'Remote' },
  { company: 'Tech Integrity Services', domain: 'techintegrity.in', type: 'Remote' },
  { company: 'NGD Technolabs', domain: 'ngdtechnolabs.com', type: 'Remote' },
  { company: 'Emipro Technologies', domain: 'emiprotechnologies.com', type: 'Remote' },
  { company: 'Ciesto Solutions', domain: 'ciesto.co', type: 'Remote' },
  { company: 'Wings Tech Solutions', domain: 'wingstechsolutions.com', type: 'Remote' },
  { company: 'HashCrypt Technology', domain: 'hashcrypt.com', type: 'Remote' },
  { company: 'Trinity Unicepts', domain: 'trinityunicepts.com', type: 'Remote' },
  { company: 'Jasvi Infotech', domain: 'jasviinfotech.com', type: 'Remote' },
  { company: 'AtheosTech Digital', domain: 'atheostech.com', type: 'Remote' },
  { company: 'Infinity Infoway', domain: 'infinityinfoway.com', type: 'Remote' },
  { company: 'STERP Solutions', domain: 'sterperp.com', type: 'Remote' },
  { company: 'Softhealer Technologies', domain: 'softhealer.com', type: 'Remote' },
  { company: 'The AppGuruz', domain: 'theappguruz.com', type: 'Remote' },
  { company: 'Logistic Infotech', domain: 'logisticinfotech.com', type: 'Remote' },
  { company: 'Elightwalk Technology', domain: 'elightwalk.com', type: 'Remote' },

  // --- NAGPUR & CENTRAL IT HUBS ---
  { company: 'InfoCepts Technologies', domain: 'infocepts.com', type: 'Remote' },
  { company: 'Excellon Software Nagpur', domain: 'excellonsoft.com', type: 'Remote' },
  { company: 'Novatech Software', domain: 'novatechsoftware.com', type: 'Remote' },
  { company: 'Lighthouse Info Systems', domain: 'lighthouseindia.com', type: 'Remote' },
  { company: 'Virtual Galaxy InfoTech', domain: 'virtualgalaxy.com', type: 'Remote' },
  { company: 'Digitron Software', domain: 'digitronsoftware.com', type: 'Remote' },
  { company: 'KloudData Systems', domain: 'klouddata.com', type: 'Remote' },
  { company: 'Zappkode Solutions', domain: 'zappkode.com', type: 'Remote' },
  { company: 'Fishtech Solutions', domain: 'fishtechsolutions.com', type: 'Remote' },
  { company: 'AnkHub Technologies', domain: 'ankhub.com', type: 'Remote' },
  { company: 'Webakruti Solutions', domain: 'webakruti.com', type: 'Remote' },
  { company: 'i-Softzone', domain: 'isoftzone.com', type: 'Remote' },
  { company: 'Alacrity Technologies', domain: 'alacritytechnologies.com', type: 'Remote' },

  // --- LUCKNOW & NORTH IT FIRMS ---
  { company: 'Jamtech Technologies', domain: 'jamtechtechnologies.com', type: 'Remote' },
  { company: 'Jithvar Consultancy', domain: 'jithvar.com', type: 'Remote' },
  { company: 'Skyracle Technologies', domain: 'skyracle.com', type: 'Remote' },
  { company: 'DigiCoders Technologies', domain: 'digicoders.in', type: 'Remote' },
  { company: 'Lazlo Software Solution', domain: 'lazlo.in', type: 'Remote' },
  { company: 'The Webdeb Solutions', domain: 'thewebdeb.com', type: 'Remote' },
  { company: 'Mechlar Technology', domain: 'mechlar.com', type: 'Remote' },
  { company: 'Progmatix Software', domain: 'progmatix.com', type: 'Remote' },
  { company: 'Difmo Technologies', domain: 'difmo.com', type: 'Remote' },
  { company: 'Duplex Technologies', domain: 'duplextech.com', type: 'Remote' },
  { company: 'CEDCOSS Technologies', domain: 'cedcoss.com', type: 'Remote' },
  { company: 'CedCommerce E-commerce', domain: 'cedcommerce.com', type: 'Remote' },
  { company: 'MakeWebEasy Digital', domain: 'makewebeasy.com', type: 'Remote' },
  { company: 'Sigma Softwares', domain: 'sigmasoftwares.org', type: 'Remote' },

  // --- BHUBANESWAR & ODISHA IT HUBS ---
  { company: 'CSM Technologies GovTech', domain: 'csm.tech', type: 'Remote' },
  { company: 'Creuto Digital Engineering', domain: 'creuto.com', type: 'Remote' },
  { company: 'Quacklabs Technologies', domain: 'quacklabs.com', type: 'Remote' },
  { company: 'Orisys Infotech', domain: 'orisysinfotech.com', type: 'Remote' },
  { company: 'Qualysec Technologies', domain: 'qualysec.com', type: 'Remote' },
  { company: 'Amazing Workz IT', domain: 'amazingworkz.com', type: 'Remote' },
  { company: 'Sociodigit Technologies', domain: 'sociodigit.com', type: 'Remote' },
  { company: 'Secuodsoft Solutions', domain: 'secuodsoft.com', type: 'Remote' },
  { company: 'Luminous Infoways', domain: 'liflinfoways.com', type: 'Remote' },
  { company: 'Tatwa Technologies', domain: 'tatwa.info', type: 'Remote' },
  { company: 'Silicon Tech Lab', domain: 'silicontechlab.com', type: 'Remote' },
  { company: 'Aptus Data Labs', domain: 'aptusdatalabs.com', type: 'Remote' },

  // --- MYSORE, MANGALORE & KARNATAKA HUBS ---
  { company: 'ThoughtFocus Technologies', domain: 'thoughtfocus.com', type: 'Remote' },
  { company: 'InvenSoft Solutions', domain: 'invensoft.in', type: 'Remote' },
  { company: 'Software Paradigms (SPI)', domain: 'spi.com', type: 'Remote' },
  { company: 'Infomaze Elite IT', domain: 'infomazeelite.com', type: 'Remote' },
  { company: 'Qwinix Technologies', domain: 'qwinix.io', type: 'Remote' },
  { company: 'Techasoft Karnataka', domain: 'techasoft.com', type: 'Remote' },
  { company: 'Excelsoft Technologies', domain: 'excelsoftcorp.com', type: 'Remote' },
  { company: 'ITChamps Software', domain: 'itchamps.com', type: 'Remote' },
  { company: 'Bizvant Technologies', domain: 'bizvant.com', type: 'Remote' },
  { company: 'ArisGlobal Life Sciences', domain: 'arisglobal.com', type: 'Remote' },
  { company: 'Novigo Solutions Mangalore', domain: 'novigo.com', type: 'Remote' },
  { company: 'GlowTouch Technologies', domain: 'glowtouch.com', type: 'Remote' },
  { company: 'Diadem Technologies', domain: 'diadem.in', type: 'Remote' },
  { company: 'Robosoft Technologies', domain: 'robosoftin.com', type: 'Remote' },

  // --- KOZHIKODE & KERALA TECH PARKS ---
  { company: 'Baabte System Technologies', domain: 'baabte.com', type: 'Remote' },
  { company: 'Infinite Open Solutions', domain: 'infiniteopen.com', type: 'Remote' },
  { company: 'Sesame Technologies', domain: 'sesame.co.in', type: 'Remote' },
  { company: 'Netstratum Technologies', domain: 'netstratum.com', type: 'Remote' },
  { company: 'Quadlabs Technologies', domain: 'quadlabs.com', type: 'Remote' },
  { company: 'Codilar Technologies', domain: 'codilar.com', type: 'Remote' },
  { company: 'Aufait Technologies', domain: 'aufait.com', type: 'Remote' },
  { company: 'Zoople Technologies', domain: 'zoople.in', type: 'Remote' },
  { company: 'Webdura Technologies', domain: 'webdura.in', type: 'Remote' },
  { company: 'Tutee Learn Tech', domain: 'tutee.in', type: 'Remote' },

  // --- NASHIK, AURANGABAD & REST OF MAHARASHTRA ---
  { company: 'ESDS Software Cloud', domain: 'esds.co.in', type: 'Pune' },
  { company: 'Winjit Nashik', domain: 'winjit.com', type: 'Pune' },
  { company: 'Touchwood Technologies', domain: 'touchwoodtech.com', type: 'Pune' },
  { company: 'Mastersoft ERP Solutions', domain: 'iitms.co.in', type: 'Pune' },
  { company: 'Evolute Fintech Innovation', domain: 'evolute.in', type: 'Mumbai' },
  { company: 'FinIQ Consulting', domain: 'finiq.com', type: 'Pune' },
  { company: 'Airtouch Technologies', domain: 'airtouchsolar.com', type: 'Remote' },

  // --- FAST GROWING INDIAN SAAS & DEEPTECH STARTUPS ---
  { company: 'Plum HQ Insurance', domain: 'plumhq.com', type: 'Remote' },
  { company: 'Decentro Fintech API', domain: 'decentro.tech', type: 'Remote' },
  { company: 'Stackby NoCode', domain: 'stackby.com', type: 'Remote' },
  { company: 'SuperOps.ai MSP SaaS', domain: 'superops.ai', type: 'Remote' },
  { company: 'Rocketlane Customer Onboarding', domain: 'rocketlane.com', type: 'Remote' },
  { company: 'Sprinto Security Compliance', domain: 'sprinto.com', type: 'Remote' },
  { company: 'Toplyne Product Analytics', domain: 'toplyne.io', type: 'Remote' },
  { company: 'Segwise AI Observability', domain: 'segwise.ai', type: 'Remote' },
  { company: 'InFeedo Employee Sentiment', domain: 'infeedo.com', type: 'Remote' },
  { company: 'Atlan Data Governance', domain: 'atlan.com', type: 'Remote' },
  { company: 'BrowserStack Cloud Testing', domain: 'browserstack.com', type: 'Mumbai' },
  { company: 'Postman API Platform', domain: 'postman.com', type: 'Remote' },
  { company: 'Entropik Tech Affective AI', domain: 'entropik.io', type: 'Remote' },
  { company: 'Acceldata Data Observability', domain: 'acceldata.io', type: 'Remote' },
  { company: 'Hevo Data Pipeline', domain: 'hevodata.com', type: 'Remote' },
  { company: 'Ultrahuman Health Ring', domain: 'ultrahuman.com', type: 'Remote' },
  { company: 'Sarvam AI LLM', domain: 'sarvam.ai', type: 'Remote' },
  { company: 'Krutrim AI Cloud', domain: 'krutrim.com', type: 'Remote' },
  { company: 'Gnani.ai Conversational Voice', domain: 'gnani.ai', type: 'Remote' },
  { company: 'CoRover.ai Conversational AI', domain: 'corover.ai', type: 'Remote' },
  { company: 'DevRev Developer CRM', domain: 'devrev.ai', type: 'Remote' },
  { company: 'Composio Tooling AI', domain: 'composio.dev', type: 'Remote' },
  { company: 'Kapture CX Service Cloud', domain: 'kapturecx.com', type: 'Remote' },
  { company: 'Exotel Cloud Communications', domain: 'exotel.com', type: 'Remote' },
  { company: 'Ozonetel Cloud Telephony', domain: 'ozonetel.com', type: 'Remote' },
  { company: 'Ameyo Contact Center', domain: 'ameyo.com', type: 'Remote' },
  { company: 'Salesken Conversational Intelligence', domain: 'salesken.ai', type: 'Remote' },
  { company: 'Convin.ai Speech Analytics', domain: 'convin.ai', type: 'Remote' },
  { company: 'Enthu.ai Agent Quality', domain: 'enthu.ai', type: 'Remote' },
  { company: 'MeetRecord Sales Intelligence', domain: 'meetrecord.com', type: 'Remote' },
  { company: 'CustomerXPs Clari5', domain: 'customerxps.com', type: 'Remote' },
  { company: 'Perfios Financial Software', domain: 'perfios.com', type: 'Remote' },
  { company: 'Karza Technologies KYC', domain: 'karza.in', type: 'Mumbai' },
  { company: 'Bureau.id Identity Verification', domain: 'bureau.id', type: 'Remote' },
  { company: 'Hyperverge AI Vision', domain: 'hyperverge.co', type: 'Remote' },
  { company: 'SignDesk Digital Stamp', domain: 'signdesk.com', type: 'Remote' },
  { company: 'Leegality Digital Agreements', domain: 'leegality.com', type: 'Remote' },
  { company: 'LegalKart LegalTech', domain: 'legalkart.com', type: 'Remote' },
  { company: 'SpotDraft Contract Automation', domain: 'spotdraft.com', type: 'Remote' },
  { company: 'Volopay Corporate Cards', domain: 'volopay.com', type: 'Remote' },
  { company: 'Open Financial Technologies', domain: 'open.money', type: 'Remote' },
  { company: 'Zaggle Prepaid Solutions', domain: 'zaggle.in', type: 'Remote' },
  { company: 'Happay Expense Management', domain: 'happay.com', type: 'Remote' },
  { company: 'ITILITE Travel & Expense', domain: 'itilite.com', type: 'Remote' },
  { company: 'Trackier Performance Marketing', domain: 'trackier.com', type: 'Remote' },
  { company: 'VdoCipher Secure Video', domain: 'vdocipher.com', type: 'Remote' },
  { company: 'Gumlet Media Delivery', domain: 'gumlet.com', type: 'Remote' },
  { company: 'ImageKit Realtime CDN', domain: 'imagekit.io', type: 'Remote' },
  { company: 'Bikayi Social Commerce', domain: 'bikayi.com', type: 'Remote' },
  { company: 'Dukaan E-commerce Platform', domain: 'mydukaan.io', type: 'Remote' },
  { company: 'Shipway Order Tracking', domain: 'shipway.com', type: 'Remote' },
  { company: 'NimbusPost Logistics Platform', domain: 'nimbuspost.com', type: 'Remote' },
  { company: 'WareIQ Fullfillment Tech', domain: 'wareiq.com', type: 'Remote' },
  { company: 'Edgistify Supply Chain', domain: 'edgistify.com', type: 'Mumbai' },
  { company: 'Loadshare Networks', domain: 'loadshare.net', type: 'Remote' },
  { company: 'GoBolt Logistics Tech', domain: 'gobolt.in', type: 'Remote' },
  { company: 'Rapido Bike Taxi', domain: 'rapido.bike', type: 'Remote' },
  { company: 'Yulu Mobility Electric', domain: 'yulu.bike', type: 'Remote' },
  { company: 'Zypp Electric Mobility', domain: 'zypp.app', type: 'Remote' },
  { company: 'BluSmart EV Ride', domain: 'myblusmart.com', type: 'Remote' },
  { company: 'Everest Fleet Mobility', domain: 'everestfleet.com', type: 'Mumbai' },
  { company: 'Euler Motors Commercial EV', domain: 'eulermotors.com', type: 'Remote' },
  { company: 'Altigreen Propulsion Labs', domain: 'altigreen.com', type: 'Remote' },
  { company: 'Matter Energy Electric', domain: 'matter.in', type: 'Remote' },
  { company: 'Oben Electric Bikes', domain: 'obenelectric.com', type: 'Remote' },
  { company: 'Hop Electric Mobility', domain: 'hopelectric.in', type: 'Remote' },
  { company: 'Pure EV Electric Vehicles', domain: 'pureev.in', type: 'Remote' },
  { company: 'Ampere Greaves EV', domain: 'amperevehicles.com', type: 'Remote' },
  { company: 'Ather Energy Electric', domain: 'atherenergy.com', type: 'Remote' },

  // --- ADDITIONAL TECH HUBS, ENTERPRISES & CONSULTANCIES ---
  { company: 'AppyPie App Builder', domain: 'appypie.com', type: 'Remote' },
  { company: 'Sourcebits Technologies', domain: 'sourcebits.com', type: 'Remote' },
  { company: 'Muvi Video Streaming SaaS', domain: 'muvi.com', type: 'Remote' },
  { company: 'Videonetics AI Video', domain: 'videonetics.com', type: 'Remote' },
  { company: 'Tonbo Imaging Optics AI', domain: 'tonboimaging.com', type: 'Remote' },
  { company: 'Cron AI 3D Sensor', domain: 'cronai.ai', type: 'Remote' },
  { company: 'Playment Data Annotation', domain: 'playment.io', type: 'Remote' },
  { company: 'NextBillion.ai Spatial', domain: 'nextbillion.ai', type: 'Remote' },
  { company: 'Locale.ai Operations', domain: 'locale.ai', type: 'Remote' },
  { company: 'Reverie Language Tech', domain: 'reverieinc.com', type: 'Remote' },
  { company: 'Process9 Technologies', domain: 'process9.com', type: 'Remote' },
  { company: 'SquadStack Sales Tech', domain: 'squadstack.com', type: 'Remote' },
  { company: 'MoEngage Customer Engagement', domain: 'moengage.com', type: 'Remote' },
  { company: 'WebEngage Retention Cloud', domain: 'webengage.com', type: 'Mumbai' },
  { company: 'Upshot.ai User Engagement', domain: 'upshot.ai', type: 'Remote' },
  { company: 'Smartkarrot Customer Success', domain: 'smartkarrot.com', type: 'Remote' },
  { company: 'Custify Customer Success', domain: 'custify.com', type: 'Remote' },
  { company: 'Userlane Digital Adoption', domain: 'userlane.com', type: 'Remote' },
  { company: 'WalkMe Enterprise Tech', domain: 'walkme.com', type: 'Remote' },
  { company: 'Pando Logistics AI', domain: 'pando.ai', type: 'Remote' },
  { company: 'FarEye Delivery Experience', domain: 'fareye.com', type: 'Remote' },
  { company: 'Vogo Automotive Tech', domain: 'vogo.in', type: 'Remote' },
  { company: 'Drivezy Car Rental Tech', domain: 'drivezy.com', type: 'Remote' },
  { company: 'Zoomcar Mobility Tech', domain: 'zoomcar.com', type: 'Remote' },
  { company: 'Myles Cars Tech', domain: 'mylescars.com', type: 'Remote' },
  { company: 'Cars24 Services Tech', domain: 'cars24.com', type: 'Remote' },
  { company: 'Spinny Valuedrive Tech', domain: 'spinny.com', type: 'Remote' },
  { company: 'Droom Technology Online', domain: 'droom.in', type: 'Remote' },
  { company: 'CarDekho Girnar Software', domain: 'cardekho.com', type: 'Remote' },
  { company: 'BikeDekho Girnar', domain: 'bikedekho.com', type: 'Remote' },
  { company: 'Zigwheels Girnar', domain: 'zigwheels.com', type: 'Remote' },
  { company: 'Carwale MXC Solutions', domain: 'carwale.com', type: 'Mumbai' },
  { company: 'BikeWale MXC Tech', domain: 'bikewale.com', type: 'Mumbai' },
  { company: 'Acko General Insurance', domain: 'acko.com', type: 'Mumbai' },
  { company: 'Digit Insurance GoDigit', domain: 'godigit.com', type: 'Pune' },
  { company: 'Navi General Insurance', domain: 'navi.com', type: 'Remote' },
  { company: 'PolicyBazaar PB Fintech', domain: 'policybazaar.com', type: 'Remote' },
  { company: 'PaisaBazaar Marketing Tech', domain: 'paisabazaar.com', type: 'Remote' },
  { company: 'BankBazaar A & A Duke', domain: 'bankbazaar.com', type: 'Remote' },
  { company: 'CreditMantri Tech', domain: 'creditmantri.com', type: 'Remote' },
  { company: 'CreditVidya Fintech', domain: 'creditvidya.com', type: 'Remote' },
  { company: 'FinBox Credit Infrastructure', domain: 'finbox.in', type: 'Remote' },
  { company: 'Setu Open Banking PineLabs', domain: 'setu.co', type: 'Remote' },
  { company: 'Yap M2P Card Platform', domain: 'm2pfintech.com', type: 'Remote' },
  { company: 'Hyperface Credit Card Infra', domain: 'hyperface.co', type: 'Remote' },
  { company: 'KredX Invoice Discounting', domain: 'kredx.com', type: 'Remote' },
  { company: 'Vayana Network Supply Chain', domain: 'vayana.com', type: 'Pune' },
  { company: 'Clear (ClearTax) B2B', domain: 'clear.in', type: 'Remote' },
  { company: 'Zoho Corporation Global', domain: 'zoho.com', type: 'Remote' },
  { company: 'Freshworks Inc Global', domain: 'freshworks.com', type: 'Remote' },
  { company: 'Chargebee Billing Global', domain: 'chargebee.com', type: 'Remote' },
  { company: 'Icertis Contract Intelligence', domain: 'icertis.com', type: 'Pune' },
  { company: 'Postman API Network', domain: 'postman.com', type: 'Remote' },
  { company: 'Hasura Enterprise', domain: 'hasura.io', type: 'Remote' },
  { company: 'Zenoti Salon Cloud', domain: 'zenoti.com', type: 'Remote' },
  { company: 'Druva Cloud Data', domain: 'druva.com', type: 'Pune' },
  { company: 'Innovaccer Health Cloud', domain: 'innovaccer.com', type: 'Remote' },
  { company: 'Amagi Cloud Broadcast', domain: 'amagi.com', type: 'Remote' },
  { company: 'Fractal Analytics AI', domain: 'fractal.ai', type: 'Mumbai' },
  { company: 'Gupshup Conversational Cloud', domain: 'gupshup.io', type: 'Mumbai' },
  { company: 'LeadSquared Automation', domain: 'leadsquared.com', type: 'Remote' },
  { company: 'OneCard Credit Cards', domain: 'getonecard.app', type: 'Pune' },
  { company: 'Darwinbox Enterprise HR', domain: 'darwinbox.com', type: 'Remote' },
  { company: 'Turtlemint Insurance Tech', domain: 'turtlemint.com', type: 'Mumbai' },
  { company: 'Entropik Emotion AI', domain: 'entropik.io', type: 'Remote' },
  { company: 'MoEngage Insights Cloud', domain: 'moengage.com', type: 'Remote' },
  { company: 'CleverTap Retention Platform', domain: 'clevertap.com', type: 'Mumbai' },
  { company: 'Whatfix DAP Platform', domain: 'whatfix.com', type: 'Remote' },
  { company: 'Sprinklr Unified CXM', domain: 'sprinklr.com', type: 'Remote' },
  { company: 'Capillary Loyalty SaaS', domain: 'capillarytech.com', type: 'Remote' }
];

async function scanAndMerge() {
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

  // Add existing verified
  for (const c of existingVerified) {
    const d = (c.domain || '').toLowerCase().trim();
    if (d && !contactedDomains.has(d) && !knownDomains.has(d)) {
      knownDomains.add(d);
      mergedPool.push(c);
    }
  }

  console.log(`Starting with ${mergedPool.length} verified uncontacted companies.`);

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

  console.log(`Checking MX records for ${toCheck.length} new candidates...`);

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

  console.log(`\n\nFinal Verified Fresh Master Directory Count: ${mergedPool.length}`);

  // Write full merged verified pool
  fs.writeFileSync(path.join(__dirname, 'final_verified_pool.json'), JSON.stringify(mergedPool, null, 2), 'utf8');

  return mergedPool;
}

scanAndMerge().catch(console.error);
