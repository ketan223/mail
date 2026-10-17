const dns = require('dns').promises;
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const fs = require('fs');
const path = require('path');

const candidates = [
  // --- BENGALURU TECH FIRMS & PRODUCT STUDIOS ---
  { company: 'Hasura', domain: 'hasura.io', type: 'Remote' },
  { company: 'SignEasy', domain: 'signeasy.com', type: 'Remote' },
  { company: 'HackerEarth', domain: 'hackerearth.com', type: 'Remote' },
  { company: 'CropIn Technology', domain: 'cropin.com', type: 'Remote' },
  { company: 'Netradyne', domain: 'netradyne.com', type: 'Remote' },
  { company: 'GreyOrange', domain: 'greyorange.com', type: 'Remote' },
  { company: 'Cynlr', domain: 'cynlr.com', type: 'Remote' },
  { company: 'Detect Technologies', domain: 'detecttechnologies.com', type: 'Remote' },
  { company: 'Intello Labs', domain: 'intellolabs.com', type: 'Remote' },
  { company: 'Stellapps Technologies', domain: 'stellapps.com', type: 'Remote' },
  { company: 'Bijak', domain: 'bijak.in', type: 'Remote' },
  { company: 'Jai Kisan', domain: 'jai-kisan.com', type: 'Remote' },
  { company: 'Captain Fresh', domain: 'captainfresh.in', type: 'Remote' },
  { company: 'FreshToHome', domain: 'freshtohome.com', type: 'Remote' },
  { company: 'WayCool Foods', domain: 'waycool.in', type: 'Remote' },
  { company: 'Metalbook', domain: 'metalbook.co', type: 'Remote' },
  { company: 'Bizongo', domain: 'bizongo.com', type: 'Mumbai' },
  { company: 'River EV', domain: 'rideriver.com', type: 'Remote' },
  { company: 'Tork Motors', domain: 'torkmotors.com', type: 'Pune' },
  { company: 'Revolt Motors', domain: 'revoltmotors.com', type: 'Remote' },
  { company: 'Simple Energy', domain: 'simpleenergy.in', type: 'Remote' },
  { company: 'Ultraviolette Automotive', domain: 'ultraviolette.com', type: 'Remote' },
  { company: 'Apptio India', domain: 'apptio.com', type: 'Remote' },
  { company: 'Whatfix', domain: 'whatfix.com', type: 'Remote' },
  { company: 'Sprinklr India', domain: 'sprinklr.com', type: 'Remote' },
  { company: 'Capillary Technologies', domain: 'capillarytech.com', type: 'Remote' },
  { company: 'Lenskart Tech', domain: 'lenskart.com', type: 'Remote' },
  { company: 'Urban Company', domain: 'urbancompany.com', type: 'Remote' },
  { company: 'Dunzo Digital', domain: 'dunzo.com', type: 'Remote' },
  { company: 'Dailyhunt Tech', domain: 'dailyhunt.in', type: 'Remote' },
  { company: 'InMobi Group', domain: 'inmobi.com', type: 'Remote' },
  { company: 'Glance InMobi', domain: 'glance.com', type: 'Remote' },
  { company: 'Verloop.io', domain: 'verloop.io', type: 'Remote' },
  { company: 'Senseforth.ai', domain: 'senseforth.ai', type: 'Remote' },
  { company: 'Bobble AI', domain: 'bobble.ai', type: 'Remote' },
  { company: 'Mad Street Den', domain: 'madstreetden.com', type: 'Remote' },
  { company: 'Staqu Technologies', domain: 'staqu.com', type: 'Remote' },
  { company: 'Innefu Labs', domain: 'innefu.com', type: 'Remote' },
  { company: 'Crayon Data', domain: 'crayondata.com', type: 'Remote' },
  { company: 'Tredence Analytics', domain: 'tredence.com', type: 'Remote' },
  { company: 'TheMathCompany', domain: 'themathcompany.com', type: 'Remote' },
  { company: 'Quantiphi Analytics', domain: 'quantiphi.com', type: 'Mumbai' },
  { company: 'Course5 Intelligence', domain: 'course5i.com', type: 'Mumbai' },
  { company: 'Fractal Analytics', domain: 'fractal.ai', type: 'Mumbai' },
  { company: 'Ugam Solutions', domain: 'ugamsolutions.com', type: 'Mumbai' },

  // --- PUNE TECH & IT ENTERPRISES ---
  { company: 'PubMatic India', domain: 'pubmatic.com', type: 'Pune' },
  { company: 'Druva Cloud', domain: 'druva.com', type: 'Pune' },
  { company: 'Icertis', domain: 'icertis.com', type: 'Pune' },
  { company: 'Mindstix Software Labs', domain: 'mindstix.com', type: 'Pune' },
  { company: 'Harbinger Group', domain: 'harbingergroup.com', type: 'Pune' },
  { company: 'Synechron Technologies', domain: 'synechron.com', type: 'Pune' },
  { company: 'GS Lab', domain: 'gslab.com', type: 'Pune' },
  { company: 'Bitwise Global', domain: 'bitwiseglobal.com', type: 'Pune' },
  { company: 'Extentia Information Technology', domain: 'extentia.com', type: 'Pune' },
  { company: 'Josh Software', domain: 'joshsoftware.com', type: 'Pune' },
  { company: 'Coditas Technologies', domain: 'coditas.com', type: 'Pune' },
  { company: 'Talentica Software', domain: 'talentica.com', type: 'Pune' },
  { company: 'Mindbowser Technologies', domain: 'mindbowser.com', type: 'Pune' },
  { company: 'ProMobi Technologies', domain: 'promobi.com', type: 'Pune' },
  { company: 'Winjit Technologies', domain: 'winjit.com', type: 'Pune' },
  { company: 'Xento Systems', domain: 'xento.com', type: 'Pune' },
  { company: 'Searce Technologies', domain: 'searce.com', type: 'Pune' },
  { company: 'Blazeclan Technologies', domain: 'blazeclan.com', type: 'Pune' },
  { company: 'Comprinno Technologies', domain: 'comprinno.net', type: 'Pune' },
  { company: 'Qualitia Software', domain: 'qualitiasoft.com', type: 'Pune' },
  { company: 'Nitor Infotech', domain: 'nitorinfotech.com', type: 'Pune' },
  { company: 'Helpshift India', domain: 'helpshift.com', type: 'Pune' },
  { company: 'Ambuja Tech Pune', domain: 'neeyamo.com', type: 'Pune' },
  { company: 'Aquitas Solutions', domain: 'aquitas-solutions.com', type: 'Pune' },
  { company: 'Veritas Technologies India', domain: 'veritas.com', type: 'Pune' },
  { company: 'BMC Software Pune', domain: 'bmc.com', type: 'Pune' },

  // --- HYDERABAD TECH & SAAS COMPANIES ---
  { company: 'ValueLabs', domain: 'valuelabs.com', type: 'Remote' },
  { company: 'ZenQ', domain: 'zenq.com', type: 'Remote' },
  { company: 'Miracle Software Systems', domain: 'miraclesoft.com', type: 'Remote' },
  { company: 'Apps Associates', domain: 'appsassociates.com', type: 'Remote' },
  { company: 'Kastech Workspace', domain: 'kastechssg.com', type: 'Remote' },
  { company: 'Motivity Labs', domain: 'motivitylabs.com', type: 'Remote' },
  { company: 'Bodhtree Consulting', domain: 'bodhtree.com', type: 'Remote' },
  { company: 'Pennant Technologies', domain: 'pennanttech.com', type: 'Remote' },
  { company: 'Prolifics India', domain: 'prolifics.com', type: 'Remote' },
  { company: 'CtrlS Datacenters', domain: 'ctrls.in', type: 'Remote' },
  { company: 'Cloud4C Services', domain: 'cloud4c.com', type: 'Remote' },
  { company: 'CallHealth Services', domain: 'callhealth.com', type: 'Remote' },
  { company: 'Mapmygenome', domain: 'mapmygenome.in', type: 'Remote' },
  { company: 'Techwave Consulting', domain: 'techwave.net', type: 'Remote' },
  { company: 'Pramati Technologies', domain: 'pramati.com', type: 'Remote' },
  { company: 'Incessant Technologies', domain: 'incessanttechnologies.com', type: 'Remote' },
  { company: 'HighRadius India', domain: 'highradius.com', type: 'Remote' },
  { company: 'Zenoti', domain: 'zenoti.com', type: 'Remote' },
  { company: 'Darwinbox HR', domain: 'darwinbox.com', type: 'Remote' },
  { company: 'Keka HR Tech', domain: 'keka.com', type: 'Remote' },

  // --- CHENNAI TECH & IT SERVICES ---
  { company: 'Aspire Systems', domain: 'aspiresys.com', type: 'Remote' },
  { company: 'Kaar Technologies', domain: 'kaartech.com', type: 'Remote' },
  { company: 'BORN Group India', domain: 'borngroup.com', type: 'Remote' },
  { company: 'Lister Technologies', domain: 'listertechnologies.com', type: 'Remote' },
  { company: 'Financial Software & Systems', domain: 'fsstech.com', type: 'Remote' },
  { company: 'Prodapt Solutions', domain: 'prodapt.com', type: 'Remote' },
  { company: 'Contus Tech', domain: 'contus.com', type: 'Remote' },
  { company: 'Ideas2IT Technologies', domain: 'ideas2it.com', type: 'Remote' },
  { company: 'SecureKloud Technologies', domain: 'securekloud.com', type: 'Remote' },
  { company: 'Maveric Systems', domain: 'maveric-systems.com', type: 'Remote' },
  { company: 'Vernalis Systems', domain: 'vernalis.com', type: 'Remote' },
  { company: 'Zuci Systems', domain: 'zucisystems.com', type: 'Remote' },
  { company: 'Kissflow Technologies', domain: 'kissflow.com', type: 'Remote' },
  { company: 'Indium Software', domain: 'indiumsoftware.com', type: 'Remote' },
  { company: 'FourKites India', domain: 'fourkites.com', type: 'Remote' },
  { company: 'BankBazaar Tech', domain: 'bankbazaar.com', type: 'Remote' },
  { company: 'Mad Street Den Chennai', domain: 'madstreetden.com', type: 'Remote' },

  // --- AHMEDABAD & GUJARAT IT HUBS ---
  { company: 'Zealous System', domain: 'zealousys.com', type: 'Remote' },
  { company: 'Agile Infoways', domain: 'agileinfoways.com', type: 'Remote' },
  { company: 'Peerbits', domain: 'peerbits.com', type: 'Remote' },
  { company: 'TOPS Technologies', domain: 'tops-int.com', type: 'Remote' },
  { company: 'DRC Systems', domain: 'drcsystems.com', type: 'Remote' },
  { company: 'Streebo Inc', domain: 'streebo.com', type: 'Remote' },
  { company: 'Volansys Technologies', domain: 'volansys.com', type: 'Remote' },
  { company: 'eInfochips Arrow', domain: 'einfochips.com', type: 'Remote' },
  { company: 'Argusoft India', domain: 'argusoft.com', type: 'Remote' },
  { company: 'Cygnet Infotech', domain: 'cygnetinfotech.com', type: 'Remote' },
  { company: 'Gateway Group', domain: 'gatewaygroup.com', type: 'Remote' },
  { company: 'OneClick Technologies', domain: 'oneclicktechnologies.com', type: 'Remote' },
  { company: 'Techholding', domain: 'techholding.co', type: 'Remote' },
  { company: 'The NineHertz', domain: 'theninehertz.com', type: 'Remote' },
  { company: 'Techuz InfoWeb', domain: 'techuz.com', type: 'Remote' },
  { company: 'Intuz Solutions', domain: 'intuz.com', type: 'Remote' },
  { company: 'WeblineIndia', domain: 'weblineindia.com', type: 'Remote' },
  { company: 'Addon Solutions', domain: 'addonsolutions.com', type: 'Remote' },
  { company: 'Brainvire Infotech', domain: 'brainvire.com', type: 'Mumbai' },
  { company: 'E2M Solutions', domain: 'e2msolutions.com', type: 'Remote' },
  { company: 'Silverwing Technologies', domain: 'silverwingtechnologies.com', type: 'Remote' },

  // --- KOCHI & KERALA INFOPARK / TECHNOPARK ---
  { company: 'CareStack', domain: 'carestack.com', type: 'Remote' },
  { company: 'SurveySparrow', domain: 'surveysparrow.com', type: 'Remote' },
  { company: 'IBS Software Services', domain: 'ibsplc.com', type: 'Remote' },
  { company: 'NeST Digital', domain: 'nestdigital.com', type: 'Remote' },
  { company: 'ThinkPalm Technologies', domain: 'thinkpalm.com', type: 'Remote' },
  { company: 'Vinvish Technologies', domain: 'vinvish.com', type: 'Remote' },
  { company: 'PIT Solutions', domain: 'pitsolutions.com', type: 'Remote' },
  { company: 'Flytxt', domain: 'flytxt.com', type: 'Remote' },
  { company: 'Envestnet India', domain: 'envestnet.com', type: 'Remote' },
  { company: 'SunTec Business Solutions', domain: 'suntecgroup.com', type: 'Remote' },
  { company: 'Trenser Technology Solutions', domain: 'trenser.com', type: 'Remote' },
  { company: 'Zerone Consulting', domain: 'zerone-consulting.com', type: 'Remote' },
  { company: 'KeyValue Software Systems', domain: 'keyvaluesoftware.com', type: 'Remote' },
  { company: 'Neoito Technologies', domain: 'neoito.com', type: 'Remote' },
  { company: 'Accubits Technologies', domain: 'accubits.com', type: 'Remote' },
  { company: 'Polus Software', domain: 'polussoftware.com', type: 'Remote' },
  { company: 'BigBinary India', domain: 'bigbinary.com', type: 'Remote' },

  // --- NOIDA & GURGAON (DELHI-NCR) TECH FIRMS ---
  { company: 'Chetu India', domain: 'chetu.com', type: 'Remote' },
  { company: 'Hestabit Technologies', domain: 'hestabit.com', type: 'Remote' },
  { company: 'Clavax Technologies', domain: 'clavax.com', type: 'Remote' },
  { company: 'Vinove Software', domain: 'vinove.com', type: 'Remote' },
  { company: 'GrapeCity India', domain: 'grapecity.com', type: 'Remote' },
  { company: 'Gemini Solutions', domain: 'geminisolutions.com', type: 'Remote' },
  { company: 'MothersonSumi INgage', domain: 'msingage.com', type: 'Remote' },
  { company: 'Qualitest India', domain: 'qualitestgroup.com', type: 'Remote' },
  { company: 'Nagarro Software', domain: 'nagarro.com', type: 'Remote' },
  { company: 'Successive Digital', domain: 'successive.tech', type: 'Remote' },
  { company: 'Magic EdTech', domain: 'magicedtech.com', type: 'Remote' },
  { company: 'Xebia India', domain: 'xebia.com', type: 'Remote' },
  { company: 'Publicis Sapient', domain: 'publicissapient.com', type: 'Remote' },
  { company: 'Thoughtworks India', domain: 'thoughtworks.com', type: 'Remote' },
  { company: 'Quytech Solutions', domain: 'quytech.com', type: 'Remote' },
  { company: 'Apptunix Technologies', domain: 'apptunix.com', type: 'Remote' },
  { company: 'Webkul Software', domain: 'webkul.com', type: 'Remote' },
  { company: 'Daffodil Software', domain: 'daffodilsw.com', type: 'Remote' },
  { company: 'Mobulous Technologies', domain: 'mobulous.com', type: 'Remote' },
  { company: 'Techugo Technologies', domain: 'techugo.com', type: 'Remote' },
  { company: 'Parangat Technologies', domain: 'parangat.com', type: 'Remote' },
  { company: 'Appinventiv Technology', domain: 'appinventiv.com', type: 'Remote' },
  { company: 'Sparx IT', domain: 'sparxitsolutions.com', type: 'Remote' },
  { company: 'Yugasa Software', domain: 'yugasa.com', type: 'Remote' },

  // --- CHANDIGARH, MOHALI & PANCHKULA ---
  { company: 'ChicMic Studios', domain: 'chicmic.in', type: 'Remote' },
  { company: 'SmartData Enterprises', domain: 'smartdatainc.com', type: 'Remote' },
  { company: 'Seasia Infotech', domain: 'seasiainfotech.com', type: 'Remote' },
  { company: 'GrayCell Technologies', domain: 'graycelltech.com', type: 'Remote' },
  { company: 'Netsmartz Infotech', domain: 'netsmartz.com', type: 'Remote' },
  { company: 'Drish Infotech', domain: 'drishinfo.com', type: 'Remote' },
  { company: 'TestingXperts', domain: 'testingxperts.com', type: 'Remote' },
  { company: 'XenonStack', domain: 'xenonstack.com', type: 'Remote' },
  { company: 'Solitaire Infosys', domain: 'solitaireinfosys.com', type: 'Remote' },
  { company: 'Techlive Solutions', domain: 'techlivesolutions.com', type: 'Remote' },
  { company: 'KMG Infotech', domain: 'kmginfotech.com', type: 'Remote' },
  { company: 'Agnext Technologies', domain: 'agnext.com', type: 'Remote' },

  // --- JAIPUR IT & SAAS AGENCIES ---
  { company: 'Dotsquares', domain: 'dotsquares.com', type: 'Remote' },
  { company: 'SemiDot Infotech', domain: 'semidotinfotech.com', type: 'Remote' },
  { company: 'Logiciel Solutions', domain: 'logicielsolutions.co.in', type: 'Remote' },
  { company: 'Cerebrum Infotech', domain: 'cerebruminfotech.com', type: 'Remote' },
  { company: 'Cybercom Creation', domain: 'cybercomcreation.com', type: 'Remote' },
  { company: 'Algoworks Technologies', domain: 'algoworks.com', type: 'Remote' },
  { company: 'Promatics Technologies', domain: 'promaticsindia.com', type: 'Remote' },
  { company: 'A3logics India', domain: 'a3logics.com', type: 'Remote' },
  { company: 'Dev Technosys India', domain: 'devtechnosys.com', type: 'Remote' },
  { company: 'Octal IT Solution India', domain: 'octalsoftware.com', type: 'Remote' },

  // --- INDORE IT & SOFTWARE FIRMS ---
  { company: 'Systango Technologies', domain: 'systango.com', type: 'Remote' },
  { company: 'Protonshub Technologies', domain: 'protonshub.com', type: 'Remote' },
  { company: 'Cyber Infrastructure (CIS)', domain: 'cisin.com', type: 'Remote' },
  { company: 'Wama Software', domain: 'wamasoftware.com', type: 'Remote' },
  { company: 'ITConnectUS', domain: 'itconnectus.com', type: 'Remote' },
  { company: 'TechInfini Solutions', domain: 'techinfini.com', type: 'Remote' },
  { company: 'Infograins Software', domain: 'infograins.com', type: 'Remote' },
  { company: 'Webgility India', domain: 'webgility.com', type: 'Remote' },
  { company: 'CDN Solutions', domain: 'cdnsol.com', type: 'Remote' },

  // --- COIMBATORE, TRICHY & MADURAI ---
  { company: 'Kovai.co', domain: 'kovai.co', type: 'Remote' },
  { company: 'Skava Systems', domain: 'skava.com', type: 'Remote' },
  { company: 'SBL Knowledge Services', domain: 'sblcorp.com', type: 'Remote' },
  { company: 'Payoda Technologies', domain: 'payoda.com', type: 'Remote' },
  { company: 'Exterro India', domain: 'exterro.com', type: 'Remote' },
  { company: 'Admatic Software', domain: 'admatic.in', type: 'Remote' },
  { company: 'Apptivo India', domain: 'apptivo.com', type: 'Remote' },
  { company: 'BimSym Technologies', domain: 'bimsym.com', type: 'Remote' },

  // --- KOLKATA & BHUBANESWAR TECH COMPANIES ---
  { company: 'FusionCharts', domain: 'fusioncharts.com', type: 'Remote' },
  { company: 'Innoraft Solutions', domain: 'innoraft.com', type: 'Remote' },
  { company: 'Indus Net Technologies', domain: 'indusnet.co.in', type: 'Remote' },
  { company: 'Techshu', domain: 'techshu.com', type: 'Remote' },
  { company: 'Kredent InfoEdge', domain: 'kredent.com', type: 'Remote' },
  { company: 'Elysium Technologies', domain: 'elysiumtechnologies.com', type: 'Remote' },
  { company: 'Odisha Soft', domain: 'odishasoft.com', type: 'Remote' },
  { company: 'Mindfire Solutions East', domain: 'mindfiresolutions.com', type: 'Remote' },

  // --- MUMBAI, THANE & NAVI MUMBAI TECH COMPANIES ---
  { company: 'Directi Media', domain: 'directi.com', type: 'Mumbai' },
  { company: 'Media.net', domain: 'media.net', type: 'Mumbai' },
  { company: 'CleverTap Analytics', domain: 'clevertap.com', type: 'Mumbai' },
  { company: 'WebEngage Automation', domain: 'webengage.com', type: 'Mumbai' },
  { company: 'Netcore Cloud Mumbai', domain: 'netcorecloud.com', type: 'Mumbai' },
  { company: 'LogiNext Solutions', domain: 'loginextsolutions.com', type: 'Mumbai' },
  { company: 'Haptik Jio', domain: 'haptik.ai', type: 'Mumbai' },
  { company: 'Gupshup Messaging', domain: 'gupshup.io', type: 'Mumbai' },
  { company: 'Qure.ai Healthcare', domain: 'qure.ai', type: 'Mumbai' },
  { company: 'Fitterfly Digital', domain: 'fitterfly.com', type: 'Mumbai' },
  { company: 'Jupiter Money Tech', domain: 'jupiter.money', type: 'Mumbai' },
  { company: 'Signzy Technologies', domain: 'signzy.com', type: 'Mumbai' },
  { company: 'IDfy India', domain: 'idfy.com', type: 'Mumbai' },
  { company: 'Cashe Lending', domain: 'cashe.co.in', type: 'Mumbai' },
  { company: 'Kissht Fintech', domain: 'kissht.com', type: 'Mumbai' },
  { company: 'Axio Digital', domain: 'axio.co.in', type: 'Mumbai' },
  { company: 'InCred Financial', domain: 'incred.com', type: 'Mumbai' },
  { company: 'NeoGrowth Credit', domain: 'neogrowth.in', type: 'Mumbai' },
  { company: 'FlexiLoans India', domain: 'flexiloans.com', type: 'Mumbai' },
  { company: 'Pharmeasy Health', domain: 'pharmeasy.in', type: 'Mumbai' },
  { company: 'Games24x7 Digital', domain: 'games24x7.com', type: 'Mumbai' },
  { company: 'Nazara Technologies', domain: 'nazara.com', type: 'Mumbai' },
  { company: 'Kuku FM Audio', domain: 'kukufm.com', type: 'Mumbai' },
  { company: 'Aurionpro Solutions', domain: 'aurionpro.com', type: 'Mumbai' },
  { company: 'Route Mobile Global', domain: 'routemobile.com', type: 'Mumbai' },
  { company: 'Allied Digital Services', domain: 'allieddigital.net', type: 'Mumbai' },
  { company: 'Datamatics Global', domain: 'datamatics.com', type: 'Mumbai' },
  { company: 'eClerx Services', domain: 'eclerx.com', type: 'Mumbai' },
  { company: 'IdeaForge Technology', domain: 'ideaforge.co.in', type: 'Mumbai' },
  { company: 'CMS Info Systems', domain: 'cms.com', type: 'Mumbai' },
  { company: 'Trigyn Technologies', domain: 'trigyn.com', type: 'Mumbai' },
  { company: 'Dynacons Systems', domain: 'dynacons.com', type: 'Mumbai' },
  { company: 'Accelya Solutions India', domain: 'accelya.com', type: 'Mumbai' },
  { company: 'Cybertech Systems', domain: 'cybertech.com', type: 'Mumbai' },
  { company: 'Iris Business Services', domain: 'irisbusiness.com', type: 'Mumbai' },
  { company: 'Netrika Consulting', domain: 'netrika.com', type: 'Mumbai' },
  { company: 'Rubicon Research', domain: 'rubicon.co.in', type: 'Mumbai' },
  { company: 'Sula Vineyards Tech', domain: 'sulavineyards.com', type: 'Mumbai' },
  { company: 'Glenmark Tech Digital', domain: 'glenmarkpharma.com', type: 'Mumbai' },
  { company: 'Lupin Digital Health', domain: 'lupindigitalhealth.com', type: 'Mumbai' },
  { company: 'Cipla Digital Mumbai', domain: 'cipla.com', type: 'Mumbai' },
  { company: 'Piramal Digital Mumbai', domain: 'piramal.com', type: 'Mumbai' },
  { company: 'Godrej Infotech', domain: 'godrejinfotech.com', type: 'Mumbai' }
];

async function scanAndVerify() {
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');
  const contactedDomains = new Set();
  sentLog.forEach(x => {
    if (x.email) {
      const p = x.email.split('@')[1];
      if (p) contactedDomains.add(p.toLowerCase().trim());
    }
  });

  console.log(`Contacted domains in history: ${contactedDomains.size}`);
  console.log(`Checking ${candidates.length} candidate companies for fresh, uncontacted status & MX records...`);

  const uncontacted = [];
  const seenDomains = new Set();

  for (const c of candidates) {
    const domain = (c.domain || '').toLowerCase().trim();
    if (!domain || contactedDomains.has(domain) || seenDomains.has(domain)) {
      continue;
    }
    seenDomains.add(domain);
    uncontacted.push(c);
  }

  console.log(`Uncontacted candidates to check MX: ${uncontacted.length}`);

  const verified = [];
  let checked = 0;

  // Check MX in batches of 15 concurrency
  const CHUNK_SIZE = 15;
  for (let i = 0; i < uncontacted.length; i += CHUNK_SIZE) {
    const chunk = uncontacted.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async (c) => {
      try {
        const records = await dns.resolveMx(c.domain);
        if (records && records.length > 0) {
          verified.push(c);
          console.log(`[MX OK] ${c.company} (${c.domain})`);
        }
      } catch (err) {
        // MX record failed / dead domain
      }
    }));
    checked += chunk.length;
  }

  console.log(`\nVerified uncontacted companies with active MX: ${verified.length}`);
  fs.writeFileSync(path.join(__dirname, 'verified_fresh_500_pool.json'), JSON.stringify(verified, null, 2), 'utf8');
}

scanAndVerify();
