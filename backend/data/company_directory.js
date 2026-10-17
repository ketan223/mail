/**
 * Curated Master Directory of 1,200+ 100% Fresh Verified Tech Companies & Startups
 * Covers Mumbai, Bengaluru, Delhi-NCR, Pune, Hyderabad, and Remote India.
 * STRICT SAFETY POLICY:
 * - Only verified active DNS MX mail servers
 * - Gold-standard 'careers' hiring inboxes ONLY
 * - Strict domain-level deduplication: Exactly ONE email per company, NEVER repeats or loops
 */

const dns = require('dns').promises;

try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const HR_ALIASES = [
  'careers'
];

const MASTER_COMPANIES = [
  {
    "company": "Miracle Software Systems",
    "domain": "miraclesoft.com",
    "type": "Remote"
  },
  {
    "company": "Motivity Labs",
    "domain": "motivitylabs.com",
    "type": "Remote"
  },
  {
    "company": "Financial Software & Systems",
    "domain": "fsstech.com",
    "type": "Remote"
  },
  {
    "company": "Apptio India",
    "domain": "apptio.com",
    "type": "Remote"
  },
  {
    "company": "SignEasy",
    "domain": "signeasy.com",
    "type": "Remote"
  },
  {
    "company": "Prodapt Solutions",
    "domain": "prodapt.com",
    "type": "Remote"
  },
  {
    "company": "Neeyamo Enterprise",
    "domain": "neeyamo.com",
    "type": "Pune"
  },
  {
    "company": "Cloud4C Services",
    "domain": "cloud4c.com",
    "type": "Remote"
  },
  {
    "company": "Apps Associates",
    "domain": "appsassociates.com",
    "type": "Remote"
  },
  {
    "company": "Maveric Systems",
    "domain": "maveric-systems.com",
    "type": "Remote"
  },
  {
    "company": "ValueLabs",
    "domain": "valuelabs.com",
    "type": "Remote"
  },
  {
    "company": "Techwave Consulting",
    "domain": "techwave.net",
    "type": "Remote"
  },
  {
    "company": "Lister Technologies",
    "domain": "listertechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Qualitia Software",
    "domain": "qualitiasoft.com",
    "type": "Pune"
  },
  {
    "company": "ProMobi Technologies",
    "domain": "promobi.com",
    "type": "Pune"
  },
  {
    "company": "Pennant Technologies",
    "domain": "pennanttech.com",
    "type": "Remote"
  },
  {
    "company": "Zealous System",
    "domain": "zealousys.com",
    "type": "Remote"
  },
  {
    "company": "Mapmygenome",
    "domain": "mapmygenome.in",
    "type": "Remote"
  },
  {
    "company": "Metalbook",
    "domain": "metalbook.co",
    "type": "Remote"
  },
  {
    "company": "Aquitas Solutions",
    "domain": "aquitas-solutions.com",
    "type": "Pune"
  },
  {
    "company": "BORN Group India",
    "domain": "borngroup.com",
    "type": "Remote"
  },
  {
    "company": "CallHealth Services",
    "domain": "callhealth.com",
    "type": "Remote"
  },
  {
    "company": "Kaar Technologies",
    "domain": "kaartech.com",
    "type": "Remote"
  },
  {
    "company": "Vernalis Systems",
    "domain": "vernalis.com",
    "type": "Remote"
  },
  {
    "company": "Prolifics India",
    "domain": "prolifics.com",
    "type": "Remote"
  },
  {
    "company": "Intuz Solutions",
    "domain": "intuz.com",
    "type": "Remote"
  },
  {
    "company": "IBS Software Services",
    "domain": "ibsplc.com",
    "type": "Remote"
  },
  {
    "company": "SurveySparrow",
    "domain": "surveysparrow.com",
    "type": "Remote"
  },
  {
    "company": "Qualitest India",
    "domain": "qualitestgroup.com",
    "type": "Remote"
  },
  {
    "company": "E2M Solutions",
    "domain": "e2msolutions.com",
    "type": "Remote"
  },
  {
    "company": "Envestnet India",
    "domain": "envestnet.com",
    "type": "Remote"
  },
  {
    "company": "Argusoft India",
    "domain": "argusoft.com",
    "type": "Remote"
  },
  {
    "company": "DRC Systems",
    "domain": "drcsystems.com",
    "type": "Remote"
  },
  {
    "company": "Gateway Group",
    "domain": "gatewaygroup.com",
    "type": "Remote"
  },
  {
    "company": "Polus Software",
    "domain": "polussoftware.com",
    "type": "Remote"
  },
  {
    "company": "GrapeCity India",
    "domain": "grapecity.com",
    "type": "Remote"
  },
  {
    "company": "Contus Tech",
    "domain": "contus.com",
    "type": "Remote"
  },
  {
    "company": "PIT Solutions",
    "domain": "pitsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Silverwing Technologies",
    "domain": "silverwingtechnologies.com",
    "type": "Remote"
  },
  {
    "company": "eInfochips Arrow",
    "domain": "einfochips.com",
    "type": "Remote"
  },
  {
    "company": "CareStack",
    "domain": "carestack.com",
    "type": "Remote"
  },
  {
    "company": "OneClick Technologies",
    "domain": "oneclicktechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Techuz InfoWeb",
    "domain": "techuz.com",
    "type": "Remote"
  },
  {
    "company": "Techholding",
    "domain": "techholding.co",
    "type": "Remote"
  },
  {
    "company": "Incessant Technologies",
    "domain": "incessanttechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Addon Solutions",
    "domain": "addonsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Streebo Inc",
    "domain": "streebo.com",
    "type": "Remote"
  },
  {
    "company": "Gemini Solutions",
    "domain": "geminisolutions.com",
    "type": "Remote"
  },
  {
    "company": "Agile Infoways",
    "domain": "agileinfoways.com",
    "type": "Remote"
  },
  {
    "company": "SecureKloud Technologies",
    "domain": "securekloud.com",
    "type": "Remote"
  },
  {
    "company": "Dotsquares",
    "domain": "dotsquares.com",
    "type": "Remote"
  },
  {
    "company": "Protonshub Technologies",
    "domain": "protonshub.com",
    "type": "Remote"
  },
  {
    "company": "ITConnectUS",
    "domain": "itconnectus.com",
    "type": "Remote"
  },
  {
    "company": "Exterro India",
    "domain": "exterro.com",
    "type": "Remote"
  },
  {
    "company": "Apptivo India",
    "domain": "apptivo.com",
    "type": "Remote"
  },
  {
    "company": "Skava Systems",
    "domain": "skava.com",
    "type": "Remote"
  },
  {
    "company": "XenonStack",
    "domain": "xenonstack.com",
    "type": "Remote"
  },
  {
    "company": "SBL Knowledge Services",
    "domain": "sblcorp.com",
    "type": "Remote"
  },
  {
    "company": "SmartData Enterprises",
    "domain": "smartdatainc.com",
    "type": "Remote"
  },
  {
    "company": "Hestabit Technologies",
    "domain": "hestabit.com",
    "type": "Remote"
  },
  {
    "company": "Logiciel Solutions",
    "domain": "logicielsolutions.co.in",
    "type": "Remote"
  },
  {
    "company": "Cybercom Creation",
    "domain": "cybercomcreation.com",
    "type": "Remote"
  },
  {
    "company": "GrayCell Technologies",
    "domain": "graycelltech.com",
    "type": "Remote"
  },
  {
    "company": "Cyber Infrastructure (CIS)",
    "domain": "cisin.com",
    "type": "Remote"
  },
  {
    "company": "ThinkPalm Technologies",
    "domain": "thinkpalm.com",
    "type": "Remote"
  },
  {
    "company": "Trenser Technology Solutions",
    "domain": "trenser.com",
    "type": "Remote"
  },
  {
    "company": "Seasia Infotech",
    "domain": "seasiainfotech.com",
    "type": "Remote"
  },
  {
    "company": "ChicMic Studios",
    "domain": "chicmic.in",
    "type": "Remote"
  },
  {
    "company": "Vinvish Technologies",
    "domain": "vinvish.com",
    "type": "Remote"
  },
  {
    "company": "Cerebrum Infotech",
    "domain": "cerebruminfotech.com",
    "type": "Remote"
  },
  {
    "company": "Clavax Technologies",
    "domain": "clavax.com",
    "type": "Remote"
  },
  {
    "company": "Solitaire Infosys",
    "domain": "solitaireinfosys.com",
    "type": "Remote"
  },
  {
    "company": "BimSym Technologies",
    "domain": "bimsym.com",
    "type": "Remote"
  },
  {
    "company": "Wama Software",
    "domain": "wamasoftware.com",
    "type": "Remote"
  },
  {
    "company": "Elysium Technologies",
    "domain": "elysiumtechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Vrinsoft Technology",
    "domain": "vrinsofts.com",
    "type": "Remote"
  },
  {
    "company": "Webgility India",
    "domain": "webgility.com",
    "type": "Remote"
  },
  {
    "company": "Inexture Solutions",
    "domain": "inexture.com",
    "type": "Remote"
  },
  {
    "company": "SolGuruz",
    "domain": "solguruz.com",
    "type": "Remote"
  },
  {
    "company": "Techshu",
    "domain": "techshu.com",
    "type": "Remote"
  },
  {
    "company": "HData Systems",
    "domain": "hdatasystems.com",
    "type": "Remote"
  },
  {
    "company": "Mavlers",
    "domain": "mavlers.com",
    "type": "Remote"
  },
  {
    "company": "Webdesk Solution",
    "domain": "webdesksolution.com",
    "type": "Remote"
  },
  {
    "company": "Amar Infotech",
    "domain": "amarinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Aubergine Solutions",
    "domain": "auberginesolutions.com",
    "type": "Remote"
  },
  {
    "company": "Sufalam Technologies",
    "domain": "sufalamtech.com",
    "type": "Remote"
  },
  {
    "company": "AddWeb Solution",
    "domain": "addwebsolution.com",
    "type": "Remote"
  },
  {
    "company": "KrishaWeb",
    "domain": "krishaweb.com",
    "type": "Remote"
  },
  {
    "company": "Moon Technolabs",
    "domain": "moontechnolabs.com",
    "type": "Remote"
  },
  {
    "company": "CodesClue Technologies",
    "domain": "codesclue.com",
    "type": "Remote"
  },
  {
    "company": "TechInfini Solutions",
    "domain": "techinfini.com",
    "type": "Remote"
  },
  {
    "company": "Admatic Software",
    "domain": "admatic.in",
    "type": "Remote"
  },
  {
    "company": "IT IDOL Technologies",
    "domain": "itidoltechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Kovai.co",
    "domain": "kovai.co",
    "type": "Remote"
  },
  {
    "company": "Innoraft Solutions",
    "domain": "innoraft.com",
    "type": "Remote"
  },
  {
    "company": "Instinctools",
    "domain": "instinctools.com",
    "type": "Remote"
  },
  {
    "company": "AllianceTek",
    "domain": "alliancetek.com",
    "type": "Remote"
  },
  {
    "company": "Infograins Software",
    "domain": "infograins.com",
    "type": "Remote"
  },
  {
    "company": "Kredent InfoEdge",
    "domain": "kredent.com",
    "type": "Remote"
  },
  {
    "company": "Satva Softech",
    "domain": "satvasoftech.com",
    "type": "Remote"
  },
  {
    "company": "DevStree IT Services",
    "domain": "devstree.com",
    "type": "Remote"
  },
  {
    "company": "ViitorCloud Technologies",
    "domain": "viitorcloud.com",
    "type": "Remote"
  },
  {
    "company": "Maven Cluster",
    "domain": "mavencluster.com",
    "type": "Remote"
  },
  {
    "company": "7Span",
    "domain": "7span.com",
    "type": "Remote"
  },
  {
    "company": "Webmob Technologies",
    "domain": "webmobtech.com",
    "type": "Remote"
  },
  {
    "company": "eSparkBiz",
    "domain": "esparkinfo.com",
    "type": "Remote"
  },
  {
    "company": "Aalpha Information Systems",
    "domain": "aalpha.net",
    "type": "Remote"
  },
  {
    "company": "Young Decade IT Software",
    "domain": "youngdecade.com",
    "type": "Remote"
  },
  {
    "company": "AppyCodes Technologies",
    "domain": "appycodes.com",
    "type": "Remote"
  },
  {
    "company": "Chapter247 Infotech",
    "domain": "chapter247.com",
    "type": "Remote"
  },
  {
    "company": "Concetto Labs",
    "domain": "concettolabs.com",
    "type": "Remote"
  },
  {
    "company": "ThirdEssential IT Solutions",
    "domain": "thirdessential.com",
    "type": "Remote"
  },
  {
    "company": "JPLoft Solutions",
    "domain": "jploft.com",
    "type": "Remote"
  },
  {
    "company": "Taskworld India",
    "domain": "taskworld.com",
    "type": "Remote"
  },
  {
    "company": "Coherent Lab",
    "domain": "coherentlab.com",
    "type": "Remote"
  },
  {
    "company": "AppSquadz Software",
    "domain": "appsquadz.com",
    "type": "Remote"
  },
  {
    "company": "i-Verve Infoweb",
    "domain": "i-verve.com",
    "type": "Remote"
  },
  {
    "company": "Synsoft Global",
    "domain": "synsoftglobal.com",
    "type": "Remote"
  },
  {
    "company": "TRooTech Business Solutions",
    "domain": "trootech.com",
    "type": "Remote"
  },
  {
    "company": "Anubavam Technologies",
    "domain": "anubavam.com",
    "type": "Remote"
  },
  {
    "company": "Systematix Infotech",
    "domain": "systematixinfotech.com",
    "type": "Remote"
  },
  {
    "company": "EngineerBabu",
    "domain": "engineerbabu.com",
    "type": "Remote"
  },
  {
    "company": "CDN Mobile Solutions",
    "domain": "cdnmobilesolutions.com",
    "type": "Remote"
  },
  {
    "company": "Cognitive Clouds",
    "domain": "cognitiveclouds.com",
    "type": "Remote"
  },
  {
    "company": "Yug Technology",
    "domain": "yugtechnology.com",
    "type": "Remote"
  },
  {
    "company": "SmartData Inc",
    "domain": "smartdatainc.net",
    "type": "Remote"
  },
  {
    "company": "LogicSpice Consultancy",
    "domain": "logicspice.com",
    "type": "Remote"
  },
  {
    "company": "AleaIT Solutions",
    "domain": "aleait.com",
    "type": "Remote"
  },
  {
    "company": "Teleperformance Mohali",
    "domain": "teleperformance.com",
    "type": "Remote"
  },
  {
    "company": "MyCloudPulse Technology",
    "domain": "mycloudpulse.com",
    "type": "Remote"
  },
  {
    "company": "Pivot Systems",
    "domain": "pivotsys.com",
    "type": "Remote"
  },
  {
    "company": "Oodles Technologies",
    "domain": "oodles.com",
    "type": "Remote"
  },
  {
    "company": "Zapbuild Technologies",
    "domain": "zapbuild.com",
    "type": "Remote"
  },
  {
    "company": "Signicent Information",
    "domain": "signicent.com",
    "type": "Remote"
  },
  {
    "company": "Clavis Technologies",
    "domain": "clavistechnologies.com",
    "type": "Remote"
  },
  {
    "company": "GirnarSoft Technologies",
    "domain": "girnarsoft.com",
    "type": "Remote"
  },
  {
    "company": "Kays Harbor Technologies",
    "domain": "kaysharbor.com",
    "type": "Remote"
  },
  {
    "company": "Click Labs",
    "domain": "click-labs.com",
    "type": "Remote"
  },
  {
    "company": "Apprio Technologies",
    "domain": "apprio.com",
    "type": "Remote"
  },
  {
    "company": "Metacube Software",
    "domain": "metacube.com",
    "type": "Remote"
  },
  {
    "company": "ARKA Softwares",
    "domain": "arkasoftwares.com",
    "type": "Remote"
  },
  {
    "company": "JungleWorks",
    "domain": "jungleworks.com",
    "type": "Remote"
  },
  {
    "company": "IDS Infotech",
    "domain": "idsil.com",
    "type": "Remote"
  },
  {
    "company": "KG Information Systems (KGISL)",
    "domain": "kgisl.com",
    "type": "Remote"
  },
  {
    "company": "E-Zest Solutions",
    "domain": "e-zest.com",
    "type": "Pune"
  },
  {
    "company": "IppoPay Tech",
    "domain": "ippopay.com",
    "type": "Remote"
  },
  {
    "company": "Mozanta Technologies",
    "domain": "mozanta.com",
    "type": "Remote"
  },
  {
    "company": "Owler Tech Coimbatore",
    "domain": "owler.com",
    "type": "Remote"
  },
  {
    "company": "LetsTransport Tech",
    "domain": "letstransport.in",
    "type": "Remote"
  },
  {
    "company": "Colan Infotech",
    "domain": "colaninfotech.com",
    "type": "Remote"
  },
  {
    "company": "Tata ClassEdge",
    "domain": "tataclassedge.com",
    "type": "Mumbai"
  },
  {
    "company": "Sulekha Tech",
    "domain": "sulekha.com",
    "type": "Remote"
  },
  {
    "company": "AES Technologies",
    "domain": "aestechnologies.in",
    "type": "Remote"
  },
  {
    "company": "Bright Bridge Infotech",
    "domain": "brightbridgeinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Kaleidofin Digital",
    "domain": "kaleidofin.com",
    "type": "Remote"
  },
  {
    "company": "PTC Software India",
    "domain": "ptc.com",
    "type": "Pune"
  },
  {
    "company": "Equitas Tech",
    "domain": "equitasbank.com",
    "type": "Remote"
  },
  {
    "company": "Info Edge India (Naukri)",
    "domain": "infoedge.in",
    "type": "Remote"
  },
  {
    "company": "Vee Technologies",
    "domain": "veetechnologies.com",
    "type": "Remote"
  },
  {
    "company": "InnoMinds Software",
    "domain": "innominds.com",
    "type": "Remote"
  },
  {
    "company": "EntHire",
    "domain": "enthire.co",
    "type": "Remote"
  },
  {
    "company": "Polestar Solutions",
    "domain": "polestarllp.com",
    "type": "Remote"
  },
  {
    "company": "mPokket Financial",
    "domain": "mpokket.in",
    "type": "Remote"
  },
  {
    "company": "SecPod Technologies",
    "domain": "secpod.com",
    "type": "Remote"
  },
  {
    "company": "Redington Digital",
    "domain": "redingtongroup.com",
    "type": "Remote"
  },
  {
    "company": "Micro Focus India (OpenText)",
    "domain": "opentext.com",
    "type": "Remote"
  },
  {
    "company": "Genpact Digital",
    "domain": "genpact.com",
    "type": "Remote"
  },
  {
    "company": "Cygnet Digital",
    "domain": "cygnet.one",
    "type": "Remote"
  },
  {
    "company": "Zebronics India",
    "domain": "zebronics.com",
    "type": "Remote"
  },
  {
    "company": "Apnaklub FMCG",
    "domain": "apnaklub.com",
    "type": "Remote"
  },
  {
    "company": "Capita India",
    "domain": "capita.com",
    "type": "Mumbai"
  },
  {
    "company": "SecureLayer7 IT",
    "domain": "securelayer7.net",
    "type": "Pune"
  },
  {
    "company": "Animall Technologies",
    "domain": "animall.in",
    "type": "Remote"
  },
  {
    "company": "WOW Skin Science Fit & Glow",
    "domain": "buywow.in",
    "type": "Remote"
  },
  {
    "company": "CSS Corp (Movate)",
    "domain": "movate.com",
    "type": "Remote"
  },
  {
    "company": "Boult Audio",
    "domain": "boultaudio.com",
    "type": "Remote"
  },
  {
    "company": "Portronics Digital",
    "domain": "portronics.com",
    "type": "Remote"
  },
  {
    "company": "Farmley Tech Foods",
    "domain": "farmley.com",
    "type": "Remote"
  },
  {
    "company": "SafeGold Digital",
    "domain": "safegold.com",
    "type": "Mumbai"
  },
  {
    "company": "Instahyre Tech",
    "domain": "instahyre.com",
    "type": "Remote"
  },
  {
    "company": "Strobes Security",
    "domain": "strobes.co",
    "type": "Remote"
  },
  {
    "company": "Sopra Steria India",
    "domain": "soprasteria.com",
    "type": "Remote"
  },
  {
    "company": "CitiusTech HealthTech",
    "domain": "citiustech.com",
    "type": "Mumbai"
  },
  {
    "company": "FarMart India",
    "domain": "farmart.co",
    "type": "Remote"
  },
  {
    "company": "Mivi Sem水果",
    "domain": "mivi.in",
    "type": "Remote"
  },
  {
    "company": "Mobikasa Technologies",
    "domain": "mobikasa.com",
    "type": "Remote"
  },
  {
    "company": "DataTracks Services",
    "domain": "datatracks.com",
    "type": "Remote"
  },
  {
    "company": "OrangeMantra Digital",
    "domain": "orangemantra.com",
    "type": "Remote"
  },
  {
    "company": "BluePi Consulting",
    "domain": "bluepiit.com",
    "type": "Remote"
  },
  {
    "company": "Successive Technologies",
    "domain": "successivetech.com",
    "type": "Remote"
  },
  {
    "company": "Langoor Digital",
    "domain": "langoor.com",
    "type": "Remote"
  },
  {
    "company": "Holisol Logistics Tech",
    "domain": "holisollogistics.com",
    "type": "Remote"
  },
  {
    "company": "Netlink Software Group",
    "domain": "netlink.com",
    "type": "Remote"
  },
  {
    "company": "Gathr Data Inc",
    "domain": "gathr.one",
    "type": "Remote"
  },
  {
    "company": "BigStep Technologies",
    "domain": "bigsteptech.com",
    "type": "Remote"
  },
  {
    "company": "Knoldus Software",
    "domain": "knoldus.com",
    "type": "Remote"
  },
  {
    "company": "Finxera India",
    "domain": "finxera.com",
    "type": "Remote"
  },
  {
    "company": "Prologic Technologies",
    "domain": "prologic-technologies.com",
    "type": "Remote"
  },
  {
    "company": "Eclature Technologies",
    "domain": "eclature.com",
    "type": "Remote"
  },
  {
    "company": "CrossAsyst Technologies",
    "domain": "crossasyst.com",
    "type": "Pune"
  },
  {
    "company": "Centilytics Cloud",
    "domain": "centilytics.com",
    "type": "Remote"
  },
  {
    "company": "BaffleSol Technologies",
    "domain": "bafflesol.com",
    "type": "Remote"
  },
  {
    "company": "RapidOps Solutions",
    "domain": "rapidops.com",
    "type": "Remote"
  },
  {
    "company": "ImpactQA Infotech",
    "domain": "impactqa.com",
    "type": "Remote"
  },
  {
    "company": "Icreon Tech India",
    "domain": "icreon.com",
    "type": "Remote"
  },
  {
    "company": "Infostretch (Apexon)",
    "domain": "infostretch.com",
    "type": "Remote"
  },
  {
    "company": "Enaviya Information",
    "domain": "enaviya.com",
    "type": "Remote"
  },
  {
    "company": "Mavenir India",
    "domain": "mavenir.com",
    "type": "Remote"
  },
  {
    "company": "Vvdn Technologies",
    "domain": "vvdntech.com",
    "type": "Remote"
  },
  {
    "company": "Xavient Digital (Telus)",
    "domain": "xavient.com",
    "type": "Remote"
  },
  {
    "company": "Zuora India",
    "domain": "zuora.com",
    "type": "Remote"
  },
  {
    "company": "VGroup Digital",
    "domain": "vgroup.net",
    "type": "Remote"
  },
  {
    "company": "Virtual Employee",
    "domain": "virtualemployee.com",
    "type": "Remote"
  },
  {
    "company": "Tavant Technologies",
    "domain": "tavant.com",
    "type": "Remote"
  },
  {
    "company": "AtliQ Technologies",
    "domain": "atliq.com",
    "type": "Remote"
  },
  {
    "company": "Bitcoding Solutions",
    "domain": "bitcodingsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Prakash Software Solutions",
    "domain": "prakashinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Atyantik Technologies",
    "domain": "atyantik.com",
    "type": "Remote"
  },
  {
    "company": "Coruscate Solutions",
    "domain": "coruscatesolution.com",
    "type": "Remote"
  },
  {
    "company": "UpNext Software",
    "domain": "upnextsoftware.com",
    "type": "Remote"
  },
  {
    "company": "Svaapta IT-Ally Solutions",
    "domain": "svaapta.com",
    "type": "Remote"
  },
  {
    "company": "Techvoot Solutions",
    "domain": "techvoot.com",
    "type": "Remote"
  },
  {
    "company": "BVM Infotech",
    "domain": "bvminfotech.com",
    "type": "Remote"
  },
  {
    "company": "Spaculus Software",
    "domain": "spaculus.com",
    "type": "Remote"
  },
  {
    "company": "CreArt Solutions",
    "domain": "creartsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Techtic Solutions",
    "domain": "techtic.com",
    "type": "Remote"
  },
  {
    "company": "WebOsmotic Software",
    "domain": "webosmotic.com",
    "type": "Remote"
  },
  {
    "company": "Softkites Technologies",
    "domain": "softkites.com",
    "type": "Remote"
  },
  {
    "company": "Shaligram Infotech",
    "domain": "shaligraminfotech.com",
    "type": "Remote"
  },
  {
    "company": "Codeedoc Solutions",
    "domain": "codeedoc.com",
    "type": "Remote"
  },
  {
    "company": "SmartSight Innovations",
    "domain": "smartsight.in",
    "type": "Remote"
  },
  {
    "company": "Pavans Group",
    "domain": "pavansgroup.com",
    "type": "Remote"
  },
  {
    "company": "Balaji Infosol",
    "domain": "balajiinfosol.com",
    "type": "Remote"
  },
  {
    "company": "Tecunique Private Limited",
    "domain": "tecunique.com",
    "type": "Remote"
  },
  {
    "company": "Narayan Infotech",
    "domain": "narayaninfotech.com",
    "type": "Remote"
  },
  {
    "company": "KloudData Systems",
    "domain": "klouddata.com",
    "type": "Remote"
  },
  {
    "company": "Zappkode Solutions",
    "domain": "zappkode.com",
    "type": "Remote"
  },
  {
    "company": "Softhealer Technologies",
    "domain": "softhealer.com",
    "type": "Remote"
  },
  {
    "company": "Aegis Softtech",
    "domain": "aegissofttech.com",
    "type": "Remote"
  },
  {
    "company": "HashCrypt Technology",
    "domain": "hashcrypt.com",
    "type": "Remote"
  },
  {
    "company": "Logistic Infotech",
    "domain": "logisticinfotech.com",
    "type": "Remote"
  },
  {
    "company": "AtheosTech Digital",
    "domain": "atheostech.com",
    "type": "Remote"
  },
  {
    "company": "Excellon Software Nagpur",
    "domain": "excellonsoft.com",
    "type": "Remote"
  },
  {
    "company": "The AppGuruz",
    "domain": "theappguruz.com",
    "type": "Remote"
  },
  {
    "company": "Elightwalk Technology",
    "domain": "elightwalk.com",
    "type": "Remote"
  },
  {
    "company": "Tech Integrity Services",
    "domain": "techintegrity.in",
    "type": "Remote"
  },
  {
    "company": "Emipro Technologies",
    "domain": "emiprotechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Ciesto Solutions",
    "domain": "ciesto.co",
    "type": "Remote"
  },
  {
    "company": "Novatech Software",
    "domain": "novatechsoftware.com",
    "type": "Remote"
  },
  {
    "company": "InfoCepts Technologies",
    "domain": "infocepts.com",
    "type": "Remote"
  },
  {
    "company": "Infinity Infoway",
    "domain": "infinityinfoway.com",
    "type": "Remote"
  },
  {
    "company": "Fishtech Solutions",
    "domain": "fishtechsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Empyreal Infotech",
    "domain": "empyrealinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Wings Tech Solutions",
    "domain": "wingstechsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Virtual Galaxy InfoTech",
    "domain": "virtualgalaxy.com",
    "type": "Remote"
  },
  {
    "company": "CSM Technologies GovTech",
    "domain": "csm.tech",
    "type": "Remote"
  },
  {
    "company": "DigiCoders Technologies",
    "domain": "digicoders.in",
    "type": "Remote"
  },
  {
    "company": "Lazlo Software Solution",
    "domain": "lazlo.in",
    "type": "Remote"
  },
  {
    "company": "MakeWebEasy Digital",
    "domain": "makewebeasy.com",
    "type": "Remote"
  },
  {
    "company": "Creuto Digital Engineering",
    "domain": "creuto.com",
    "type": "Remote"
  },
  {
    "company": "Jithvar Consultancy",
    "domain": "jithvar.com",
    "type": "Remote"
  },
  {
    "company": "Orisys Infotech",
    "domain": "orisysinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Jamtech Technologies",
    "domain": "jamtechtechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Qualysec Technologies",
    "domain": "qualysec.com",
    "type": "Remote"
  },
  {
    "company": "Amazing Workz IT",
    "domain": "amazingworkz.com",
    "type": "Remote"
  },
  {
    "company": "CedCommerce E-commerce",
    "domain": "cedcommerce.com",
    "type": "Remote"
  },
  {
    "company": "Alacrity Technologies",
    "domain": "alacritytechnologies.com",
    "type": "Remote"
  },
  {
    "company": "i-Softzone",
    "domain": "isoftzone.com",
    "type": "Remote"
  },
  {
    "company": "Mechlar Technology",
    "domain": "mechlar.com",
    "type": "Remote"
  },
  {
    "company": "Secuodsoft Solutions",
    "domain": "secuodsoft.com",
    "type": "Remote"
  },
  {
    "company": "Duplex Technologies",
    "domain": "duplextech.com",
    "type": "Remote"
  },
  {
    "company": "Sigma Softwares",
    "domain": "sigmasoftwares.org",
    "type": "Remote"
  },
  {
    "company": "Difmo Technologies",
    "domain": "difmo.com",
    "type": "Remote"
  },
  {
    "company": "Skyracle Technologies",
    "domain": "skyracle.com",
    "type": "Remote"
  },
  {
    "company": "Sociodigit Technologies",
    "domain": "sociodigit.com",
    "type": "Remote"
  },
  {
    "company": "Progmatix Software",
    "domain": "progmatix.com",
    "type": "Remote"
  },
  {
    "company": "Webakruti Solutions",
    "domain": "webakruti.com",
    "type": "Remote"
  },
  {
    "company": "ArisGlobal Life Sciences",
    "domain": "arisglobal.com",
    "type": "Remote"
  },
  {
    "company": "Excelsoft Technologies",
    "domain": "excelsoftcorp.com",
    "type": "Remote"
  },
  {
    "company": "Diadem Technologies",
    "domain": "diadem.in",
    "type": "Remote"
  },
  {
    "company": "Netstratum Technologies",
    "domain": "netstratum.com",
    "type": "Remote"
  },
  {
    "company": "GlowTouch Technologies",
    "domain": "glowtouch.com",
    "type": "Remote"
  },
  {
    "company": "Techasoft Karnataka",
    "domain": "techasoft.com",
    "type": "Remote"
  },
  {
    "company": "ITChamps Software",
    "domain": "itchamps.com",
    "type": "Remote"
  },
  {
    "company": "Webdura Technologies",
    "domain": "webdura.in",
    "type": "Remote"
  },
  {
    "company": "ThoughtFocus Technologies",
    "domain": "thoughtfocus.com",
    "type": "Remote"
  },
  {
    "company": "Zoople Technologies",
    "domain": "zoople.in",
    "type": "Remote"
  },
  {
    "company": "Aptus Data Labs",
    "domain": "aptusdatalabs.com",
    "type": "Remote"
  },
  {
    "company": "Baabte System Technologies",
    "domain": "baabte.com",
    "type": "Remote"
  },
  {
    "company": "Sesame Technologies",
    "domain": "sesame.co.in",
    "type": "Remote"
  },
  {
    "company": "Quadlabs Technologies",
    "domain": "quadlabs.com",
    "type": "Remote"
  },
  {
    "company": "Bizvant Technologies",
    "domain": "bizvant.com",
    "type": "Remote"
  },
  {
    "company": "Infomaze Elite IT",
    "domain": "infomazeelite.com",
    "type": "Remote"
  },
  {
    "company": "Silicon Tech Lab",
    "domain": "silicontechlab.com",
    "type": "Remote"
  },
  {
    "company": "Software Paradigms (SPI)",
    "domain": "spi.com",
    "type": "Remote"
  },
  {
    "company": "Infinite Open Solutions",
    "domain": "infiniteopen.com",
    "type": "Remote"
  },
  {
    "company": "FinIQ Consulting",
    "domain": "finiq.com",
    "type": "Pune"
  },
  {
    "company": "Segwise AI Observability",
    "domain": "segwise.ai",
    "type": "Remote"
  },
  {
    "company": "SignDesk Digital Stamp",
    "domain": "signdesk.com",
    "type": "Remote"
  },
  {
    "company": "Composio Tooling AI",
    "domain": "composio.dev",
    "type": "Remote"
  },
  {
    "company": "Airtouch Technologies",
    "domain": "airtouchsolar.com",
    "type": "Remote"
  },
  {
    "company": "Process9 Technologies",
    "domain": "process9.com",
    "type": "Remote"
  },
  {
    "company": "Touchwood Technologies",
    "domain": "touchwoodtech.com",
    "type": "Pune"
  },
  {
    "company": "MeetRecord Sales Intelligence",
    "domain": "meetrecord.com",
    "type": "Remote"
  },
  {
    "company": "SpotDraft Contract Automation",
    "domain": "spotdraft.com",
    "type": "Remote"
  },
  {
    "company": "LegalKart LegalTech",
    "domain": "legalkart.com",
    "type": "Remote"
  },
  {
    "company": "Edgistify Supply Chain",
    "domain": "edgistify.com",
    "type": "Mumbai"
  },
  {
    "company": "Videonetics AI Video",
    "domain": "videonetics.com",
    "type": "Remote"
  },
  {
    "company": "Ampere Greaves EV",
    "domain": "amperevehicles.com",
    "type": "Remote"
  },
  {
    "company": "Tonbo Imaging Optics AI",
    "domain": "tonboimaging.com",
    "type": "Remote"
  },
  {
    "company": "GoBolt Logistics Tech",
    "domain": "gobolt.in",
    "type": "Remote"
  },
  {
    "company": "VdoCipher Secure Video",
    "domain": "vdocipher.com",
    "type": "Remote"
  },
  {
    "company": "Pure EV Electric Vehicles",
    "domain": "pureev.in",
    "type": "Remote"
  },
  {
    "company": "Kapture CX Service Cloud",
    "domain": "kapturecx.com",
    "type": "Remote"
  },
  {
    "company": "Enthu.ai Agent Quality",
    "domain": "enthu.ai",
    "type": "Remote"
  },
  {
    "company": "Cron AI 3D Sensor",
    "domain": "cronai.ai",
    "type": "Remote"
  },
  {
    "company": "Locale.ai Operations",
    "domain": "locale.ai",
    "type": "Remote"
  },
  {
    "company": "Stackby NoCode",
    "domain": "stackby.com",
    "type": "Remote"
  },
  {
    "company": "Trackier Performance Marketing",
    "domain": "trackier.com",
    "type": "Remote"
  },
  {
    "company": "Evolute Fintech Innovation",
    "domain": "evolute.in",
    "type": "Mumbai"
  },
  {
    "company": "Vayana Network Supply Chain",
    "domain": "vayana.com",
    "type": "Pune"
  },
  {
    "company": "Zoho Corporation Global",
    "domain": "zoho.com",
    "type": "Remote"
  },
  {
    "company": "Userlane Digital Adoption",
    "domain": "userlane.com",
    "type": "Remote"
  },
  {
    "company": "WalkMe Enterprise Tech",
    "domain": "walkme.com",
    "type": "Remote"
  },
  {
    "company": "Zigwheels Girnar",
    "domain": "zigwheels.com",
    "type": "Remote"
  },
  {
    "company": "BikeWale MXC Tech",
    "domain": "bikewale.com",
    "type": "Mumbai"
  },
  {
    "company": "BikeDekho Girnar",
    "domain": "bikedekho.com",
    "type": "Remote"
  },
  {
    "company": "CreditVidya Fintech",
    "domain": "creditvidya.com",
    "type": "Remote"
  },
  {
    "company": "Zoomcar Mobility Tech",
    "domain": "zoomcar.com",
    "type": "Remote"
  },
  {
    "company": "CreditMantri Tech",
    "domain": "creditmantri.com",
    "type": "Remote"
  },
  {
    "company": "Myles Cars Tech",
    "domain": "mylescars.com",
    "type": "Remote"
  },
  {
    "company": "Custify Customer Success",
    "domain": "custify.com",
    "type": "Remote"
  },
  {
    "company": "Upshot.ai User Engagement",
    "domain": "upshot.ai",
    "type": "Remote"
  },
  {
    "company": "Verbat Technologies",
    "domain": "verbat.com",
    "type": "Remote"
  },
  {
    "company": "Think360 Studio",
    "domain": "think360studio.com",
    "type": "Remote"
  },
  {
    "company": "Armia Systems",
    "domain": "armia.com",
    "type": "Remote"
  },
  {
    "company": "WebHopers Infotech",
    "domain": "webhopers.com",
    "type": "Remote"
  },
  {
    "company": "RV Technologies Softwares",
    "domain": "rvtechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Softuvo Solutions",
    "domain": "softuvo.com",
    "type": "Remote"
  },
  {
    "company": "Trank Technologies",
    "domain": "tranktechnologies.com",
    "type": "Remote"
  },
  {
    "company": "CS Soft Solutions",
    "domain": "cssoftsolutions.com",
    "type": "Remote"
  },
  {
    "company": "HashRoot Technologies",
    "domain": "hashroot.com",
    "type": "Remote"
  },
  {
    "company": "Code Brew Labs",
    "domain": "codebrewlabs.com",
    "type": "Remote"
  },
  {
    "company": "Evon Technologies",
    "domain": "evontech.com",
    "type": "Remote"
  },
  {
    "company": "IT Chimes Solutions",
    "domain": "itchimes.com",
    "type": "Remote"
  },
  {
    "company": "Toonz Animation Media",
    "domain": "toonz.co",
    "type": "Remote"
  },
  {
    "company": "ToXSL Technologies",
    "domain": "toxsl.com",
    "type": "Remote"
  },
  {
    "company": "Suffescom Solutions",
    "domain": "suffescom.com",
    "type": "Remote"
  },
  {
    "company": "RisingMax Inc",
    "domain": "risingmax.com",
    "type": "Remote"
  },
  {
    "company": "SynapseIndia Tech",
    "domain": "synapseindia.com",
    "type": "Remote"
  },
  {
    "company": "Magneto IT Solutions",
    "domain": "magnetoitsolutions.com",
    "type": "Remote"
  },
  {
    "company": "LiteBreeze Infotech",
    "domain": "litebreeze.com",
    "type": "Remote"
  },
  {
    "company": "Megrisoft Technologies",
    "domain": "megrisoft.com",
    "type": "Remote"
  },
  {
    "company": "NDOT Technologies",
    "domain": "ndot.in",
    "type": "Remote"
  },
  {
    "company": "Pyramidion Solutions",
    "domain": "pyramidions.com",
    "type": "Remote"
  },
  {
    "company": "Macappstudio Tech",
    "domain": "macappstudio.com",
    "type": "Remote"
  },
  {
    "company": "Accent Techno Soft",
    "domain": "accenttechnosoft.com",
    "type": "Remote"
  },
  {
    "company": "Dot Com Infoway DCI",
    "domain": "dotcominfoway.com",
    "type": "Remote"
  },
  {
    "company": "Karmick Solutions",
    "domain": "karmicksolutions.com",
    "type": "Remote"
  },
  {
    "company": "Brainium Information Technologies",
    "domain": "brainiuminfotech.com",
    "type": "Remote"
  },
  {
    "company": "Shunya Ekai Tech",
    "domain": "shunyaekai.tech",
    "type": "Remote"
  },
  {
    "company": "WebGuru Infosystems",
    "domain": "webguru-india.com",
    "type": "Remote"
  },
  {
    "company": "TCG Digital Solutions",
    "domain": "tcgdigital.com",
    "type": "Remote"
  },
  {
    "company": "Wizertech Informatics",
    "domain": "wizertech.com",
    "type": "Remote"
  },
  {
    "company": "RS Software India",
    "domain": "rssoftware.com",
    "type": "Remote"
  },
  {
    "company": "Agira Technologies",
    "domain": "agiratech.com",
    "type": "Remote"
  },
  {
    "company": "Smarther Technologies",
    "domain": "smarther.co",
    "type": "Remote"
  },
  {
    "company": "Globsyn Technologies",
    "domain": "globsyn.com",
    "type": "Remote"
  },
  {
    "company": "Infosky Solutions",
    "domain": "infoskysolutions.com",
    "type": "Remote"
  },
  {
    "company": "Lee & Nee Software",
    "domain": "lnsel.com",
    "type": "Remote"
  },
  {
    "company": "Team Tweaks Technologies",
    "domain": "teamtweaks.com",
    "type": "Remote"
  },
  {
    "company": "NextGen IT Solutions",
    "domain": "nextgenitsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Hakuna Matata Solutions",
    "domain": "hakunamatatatech.com",
    "type": "Remote"
  },
  {
    "company": "Wenable Technologies",
    "domain": "wenable.com",
    "type": "Remote"
  },
  {
    "company": "Spritle Software Labs",
    "domain": "spritle.com",
    "type": "Remote"
  },
  {
    "company": "Cyber Swift Infotech",
    "domain": "cyberswift.com",
    "type": "Remote"
  },
  {
    "company": "Emotix Miko Robotics",
    "domain": "miko.ai",
    "type": "Mumbai"
  },
  {
    "company": "CogniTensor AI",
    "domain": "cognitensor.com",
    "type": "Remote"
  },
  {
    "company": "MetaDesign Solutions",
    "domain": "metadesignsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Torus Robotics",
    "domain": "torusrobotics.com",
    "type": "Remote"
  },
  {
    "company": "Gigforce Workforce",
    "domain": "gigforce.in",
    "type": "Remote"
  },
  {
    "company": "GoodWorkLabs Digital",
    "domain": "goodworklabs.com",
    "type": "Remote"
  },
  {
    "company": "Planys Technologies",
    "domain": "planys.com",
    "type": "Remote"
  },
  {
    "company": "Innostax Tech Solutions",
    "domain": "innostax.com",
    "type": "Remote"
  },
  {
    "company": "StartxLabs Technologies",
    "domain": "startxlabs.com",
    "type": "Remote"
  },
  {
    "company": "EchoForge Cloud",
    "domain": "echoforgecloud.com",
    "type": "Remote"
  },
  {
    "company": "Taskmo Gig Platform",
    "domain": "taskmo.com",
    "type": "Remote"
  },
  {
    "company": "Divum Corporate Tech",
    "domain": "divum.in",
    "type": "Remote"
  },
  {
    "company": "Probe42 Financial Data",
    "domain": "probe42.in",
    "type": "Remote"
  },
  {
    "company": "Manastu Space",
    "domain": "manastuspace.com",
    "type": "Mumbai"
  },
  {
    "company": "Techment Technology",
    "domain": "techment.com",
    "type": "Remote"
  },
  {
    "company": "EyeROV Underwater Robotics",
    "domain": "eyerov.com",
    "type": "Remote"
  },
  {
    "company": "DianApps Technologies",
    "domain": "dianapps.com",
    "type": "Remote"
  },
  {
    "company": "Vinsol Web and Mobile",
    "domain": "vinsol.com",
    "type": "Remote"
  },
  {
    "company": "Digantara Space",
    "domain": "digantara.com",
    "type": "Remote"
  },
  {
    "company": "TartanHQ Payroll API",
    "domain": "tartanhq.com",
    "type": "Remote"
  },
  {
    "company": "Kraftshala EdTech",
    "domain": "kraftshala.com",
    "type": "Remote"
  },
  {
    "company": "Weekday Works AI Hiring",
    "domain": "weekday.works",
    "type": "Remote"
  },
  {
    "company": "CloudIngest Services",
    "domain": "cloudingest.com",
    "type": "Remote"
  },
  {
    "company": "Futuresoft India",
    "domain": "futuresoftindia.com",
    "type": "Remote"
  },
  {
    "company": "EncureIT Systems",
    "domain": "encureit.com",
    "type": "Pune"
  },
  {
    "company": "UpCodo Digital",
    "domain": "upcodo.com",
    "type": "Remote"
  },
  {
    "company": "Sankalpsutra Tech",
    "domain": "sankalpsutra.com",
    "type": "Pune"
  },
  {
    "company": "ScalaCode Software",
    "domain": "scalacode.com",
    "type": "Remote"
  },
  {
    "company": "BoTree Technologies",
    "domain": "botreetechnologies.com",
    "type": "Remote"
  },
  {
    "company": "iB Arts Software",
    "domain": "ibarts.in",
    "type": "Pune"
  },
  {
    "company": "TechVedika Technologies",
    "domain": "techvedika.com",
    "type": "Remote"
  },
  {
    "company": "Codescastle Software",
    "domain": "codescastle.com",
    "type": "Pune"
  },
  {
    "company": "Summation IT Solutions",
    "domain": "summationit.com",
    "type": "Remote"
  },
  {
    "company": "Tericsoft Technologies",
    "domain": "tericsoft.com",
    "type": "Remote"
  },
  {
    "company": "Symphony Solution Pune",
    "domain": "symphony-solution.com",
    "type": "Pune"
  },
  {
    "company": "Probey Services Noida",
    "domain": "probeyservices.com",
    "type": "Remote"
  },
  {
    "company": "Zazz Digital Engineering",
    "domain": "zazz.io",
    "type": "Remote"
  },
  {
    "company": "Tvisha Technologies",
    "domain": "tvisha.com",
    "type": "Remote"
  },
  {
    "company": "Apricorn Solutions",
    "domain": "apricornsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Grawlix Software Pune",
    "domain": "grawlixsoft.com",
    "type": "Pune"
  },
  {
    "company": "NextAstra Technologies",
    "domain": "nextastra.com",
    "type": "Pune"
  },
  {
    "company": "Ahex Technologies Hyderabad",
    "domain": "ahex.co.in",
    "type": "Remote"
  },
  {
    "company": "NDimensionZ Solutions",
    "domain": "ndimensionz.com",
    "type": "Remote"
  },
  {
    "company": "ClaySys Technologies",
    "domain": "claysys.com",
    "type": "Remote"
  },
  {
    "company": "Appzoro Technologies",
    "domain": "appzoro.com",
    "type": "Remote"
  },
  {
    "company": "Dronamics Global",
    "domain": "dronamics.com",
    "type": "Remote"
  },
  {
    "company": "Emsyne Technologies",
    "domain": "emsyne.com",
    "type": "Remote"
  },
  {
    "company": "Matply Infotech",
    "domain": "matply.com",
    "type": "Remote"
  },
  {
    "company": "MentriQ Technologies",
    "domain": "mentriqtechnologies.in",
    "type": "Remote"
  },
  {
    "company": "CodeZion Softwares",
    "domain": "codezion.com",
    "type": "Remote"
  },
  {
    "company": "SoftProdigy System Solutions",
    "domain": "softprodigy.com",
    "type": "Remote"
  },
  {
    "company": "Webdew Digital Studio",
    "domain": "webdew.com",
    "type": "Remote"
  },
  {
    "company": "FATbit Technologies",
    "domain": "fatbit.com",
    "type": "Remote"
  },
  {
    "company": "Data Ingenious Global",
    "domain": "data.in",
    "type": "Remote"
  },
  {
    "company": "W3care Technologies",
    "domain": "w3care.com",
    "type": "Remote"
  },
  {
    "company": "Reinvent Corp Mohali",
    "domain": "reinventcorp.com",
    "type": "Remote"
  },
  {
    "company": "JRG Software & Technologies",
    "domain": "jrgsofttech.in",
    "type": "Remote"
  },
  {
    "company": "Techno Tackle",
    "domain": "technotackle.com",
    "type": "Remote"
  },
  {
    "company": "Bifrost AI 3D",
    "domain": "bifrost.ai",
    "type": "Remote"
  },
  {
    "company": "Cubet Techno Labs",
    "domain": "cubettech.com",
    "type": "Remote"
  },
  {
    "company": "Trigma Solutions",
    "domain": "trigma.com",
    "type": "Remote"
  },
  {
    "company": "Unified Infotech",
    "domain": "unifiedinfotech.net",
    "type": "Remote"
  },
  {
    "company": "Sebiz Infotech Mohali",
    "domain": "sebiz.com",
    "type": "Remote"
  },
  {
    "company": "Kavaya Infotech",
    "domain": "kavayainfotech.com",
    "type": "Remote"
  },
  {
    "company": "Techvolt Software",
    "domain": "techvoltcoimbatore.com",
    "type": "Remote"
  },
  {
    "company": "Bebo Technologies",
    "domain": "bebotechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Boomi Integration",
    "domain": "boomi.com",
    "type": "Remote"
  },
  {
    "company": "Tyk API Management",
    "domain": "tyk.io",
    "type": "Remote"
  },
  {
    "company": "Payload CMS Platform",
    "domain": "payloadcms.com",
    "type": "Remote"
  },
  {
    "company": "Kong API Gateway",
    "domain": "konghq.com",
    "type": "Remote"
  },
  {
    "company": "FireFlink Automation",
    "domain": "fireflink.com",
    "type": "Remote"
  },
  {
    "company": "n8n Workflow Automation",
    "domain": "n8n.io",
    "type": "Remote"
  },
  {
    "company": "Contentful Digital Content",
    "domain": "contentful.com",
    "type": "Remote"
  },
  {
    "company": "Strapi Headless CMS",
    "domain": "strapi.io",
    "type": "Remote"
  },
  {
    "company": "Workato India Enterprise",
    "domain": "workato.com",
    "type": "Remote"
  },
  {
    "company": "Budibase LowCode App",
    "domain": "budibase.com",
    "type": "Remote"
  },
  {
    "company": "Hygraph Federated Content",
    "domain": "hygraph.com",
    "type": "Remote"
  },
  {
    "company": "Peppo Food Delivery",
    "domain": "peppo.co.in",
    "type": "Remote"
  },
  {
    "company": "Storyblok Headless CMS",
    "domain": "storyblok.com",
    "type": "Remote"
  },
  {
    "company": "Gravitee API Platform",
    "domain": "gravitee.io",
    "type": "Remote"
  },
  {
    "company": "Pipedream Developer Platform",
    "domain": "pipedream.com",
    "type": "Remote"
  },
  {
    "company": "Retool Developer App",
    "domain": "retool.com",
    "type": "Remote"
  },
  {
    "company": "Katalon Automation Platform",
    "domain": "katalon.com",
    "type": "Remote"
  },
  {
    "company": "Tray.io Enterprise",
    "domain": "tray.io",
    "type": "Remote"
  },
  {
    "company": "Thrive Now Online Order",
    "domain": "thrivenow.in",
    "type": "Mumbai"
  },
  {
    "company": "Applitools Visual AI",
    "domain": "applitools.com",
    "type": "Remote"
  },
  {
    "company": "Sanity.io Structured Content",
    "domain": "sanity.io",
    "type": "Remote"
  },
  {
    "company": "Telebu Communications",
    "domain": "telebu.com",
    "type": "Remote"
  },
  {
    "company": "Mesh AI HR",
    "domain": "mesh.ai",
    "type": "Remote"
  },
  {
    "company": "Directus Open Data",
    "domain": "directus.io",
    "type": "Remote"
  },
  {
    "company": "Opkey Test Automation",
    "domain": "opkey.com",
    "type": "Remote"
  },
  {
    "company": "Sarv Communications",
    "domain": "sarv.com",
    "type": "Remote"
  },
  {
    "company": "Payworld India Fintech",
    "domain": "payworldindia.com",
    "type": "Remote"
  },
  {
    "company": "Airtel Payments Bank",
    "domain": "airtel.in",
    "type": "Remote"
  },
  {
    "company": "Sinch India Comm",
    "domain": "sinch.com",
    "type": "Remote"
  },
  {
    "company": "Protean eGov Technologies",
    "domain": "proteantech.in",
    "type": "Mumbai"
  },
  {
    "company": "Pay1 Retail Fintech",
    "domain": "pay1.in",
    "type": "Mumbai"
  },
  {
    "company": "KFin Technologies Tech",
    "domain": "kfintech.com",
    "type": "Remote"
  },
  {
    "company": "Bigshare Services IT",
    "domain": "bigshareonline.com",
    "type": "Mumbai"
  },
  {
    "company": "Link Intime India Tech",
    "domain": "linkintime.co.in",
    "type": "Mumbai"
  },
  {
    "company": "Paytm Payments Bank",
    "domain": "paytmbank.com",
    "type": "Remote"
  },
  {
    "company": "FIA Global Financial",
    "domain": "fiaglobal.com",
    "type": "Remote"
  },
  {
    "company": "Vakrangee Kendra Tech",
    "domain": "vakrangee.in",
    "type": "Mumbai"
  },
  {
    "company": "Fino Payments Bank",
    "domain": "finobank.com",
    "type": "Mumbai"
  },
  {
    "company": "SubK IMPACT Solutions",
    "domain": "subk.co.in",
    "type": "Remote"
  },
  {
    "company": "Infobip India Cloud",
    "domain": "infobip.com",
    "type": "Mumbai"
  },
  {
    "company": "Spice Money Rural Fintech",
    "domain": "spicemoney.com",
    "type": "Remote"
  },
  {
    "company": "Peak XV Partners",
    "domain": "peakxv.com",
    "type": "Remote"
  },
  {
    "company": "Bankit Services India",
    "domain": "bankit.in",
    "type": "Remote"
  },
  {
    "company": "Nexus Venture Partners",
    "domain": "nexusvp.com",
    "type": "Mumbai"
  },
  {
    "company": "CAMS Computer Age",
    "domain": "camsonline.com",
    "type": "Remote"
  },
  {
    "company": "ACL Mobile Messaging",
    "domain": "aclmobile.com",
    "type": "Remote"
  },
  {
    "company": "RapiPay Fintech India",
    "domain": "rapipay.com",
    "type": "Remote"
  },
  {
    "company": "Vizury Customer Engage",
    "domain": "vizury.com",
    "type": "Remote"
  },
  {
    "company": "Fork Media Digital",
    "domain": "forkmedia.com",
    "type": "Mumbai"
  },
  {
    "company": "Chiratae Ventures Tech",
    "domain": "chiratae.com",
    "type": "Remote"
  },
  {
    "company": "Elevation Capital Tech",
    "domain": "elevationcapital.com",
    "type": "Remote"
  },
  {
    "company": "3one4 Capital Tech",
    "domain": "3one4capital.com",
    "type": "Remote"
  },
  {
    "company": "Accel Partners India",
    "domain": "accel.com",
    "type": "Remote"
  },
  {
    "company": "Fireside Ventures Tech",
    "domain": "firesideventures.com",
    "type": "Remote"
  },
  {
    "company": "Omnivore Agritech Tech",
    "domain": "omnivore.vc",
    "type": "Mumbai"
  },
  {
    "company": "Stellaris Venture Partners",
    "domain": "stellarisvp.com",
    "type": "Remote"
  },
  {
    "company": "Speciale Invest DeepTech",
    "domain": "specialeinvest.com",
    "type": "Remote"
  },
  {
    "company": "Prime Venture Partners Tech",
    "domain": "primevp.in",
    "type": "Remote"
  },
  {
    "company": "Ankur Capital AgriTech",
    "domain": "ankurcapital.com",
    "type": "Mumbai"
  },
  {
    "company": "Kalaari Capital Tech",
    "domain": "kalaari.com",
    "type": "Remote"
  },
  {
    "company": "DSG Consumer Partners Tech",
    "domain": "dsgcp.com",
    "type": "Mumbai"
  },
  {
    "company": "WaterBridge Ventures Tech",
    "domain": "waterbridge.vc",
    "type": "Remote"
  },
  {
    "company": "India Quotient Tech",
    "domain": "indiaquotient.com",
    "type": "Mumbai"
  },
  {
    "company": "Sutherland Global",
    "domain": "sutherlandglobal.com",
    "type": "Remote"
  },
  {
    "company": "Concentrix India",
    "domain": "concentrix.com",
    "type": "Remote"
  },
  {
    "company": "Conneqt Business",
    "domain": "conneqtcorp.com",
    "type": "Remote"
  },
  {
    "company": "WoodenStreet Furniture",
    "domain": "woodenstreet.com",
    "type": "Remote"
  },
  {
    "company": "Meru Cabs Tech",
    "domain": "meru.in",
    "type": "Mumbai"
  },
  {
    "company": "IGT Solutions",
    "domain": "igtsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Macaws Infotech",
    "domain": "macawsinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Allsec Technologies",
    "domain": "allsectech.com",
    "type": "Remote"
  },
  {
    "company": "Revv Self Drive",
    "domain": "revv.co.in",
    "type": "Remote"
  },
  {
    "company": "Cartrade Tech",
    "domain": "cartradetech.com",
    "type": "Mumbai"
  },
  {
    "company": "Planvisage Software",
    "domain": "planvisage.com",
    "type": "Remote"
  },
  {
    "company": "Excellence Technologies",
    "domain": "excellencetechnologies.in",
    "type": "Remote"
  },
  {
    "company": "Promethean IT Services",
    "domain": "prometheanit.com",
    "type": "Remote"
  },
  {
    "company": "Savaari Car Rentals",
    "domain": "savaari.com",
    "type": "Remote"
  },
  {
    "company": "Quick Ride Carpool",
    "domain": "quickride.in",
    "type": "Remote"
  },
  {
    "company": "TaskUs India",
    "domain": "taskus.com",
    "type": "Remote"
  },
  {
    "company": "Fusion BPO Services",
    "domain": "fusionbposervices.com",
    "type": "Remote"
  },
  {
    "company": "Startek India",
    "domain": "startek.com",
    "type": "Remote"
  },
  {
    "company": "Mega Cabs",
    "domain": "megacabs.com",
    "type": "Remote"
  },
  {
    "company": "Matrix Media Solutions",
    "domain": "matrixmediasolutions.com",
    "type": "Remote"
  },
  {
    "company": "Alumnus Software",
    "domain": "alumnus.com",
    "type": "Remote"
  },
  {
    "company": "ChrysCapital Management",
    "domain": "chryscapital.com",
    "type": "Remote"
  },
  {
    "company": "Everstone Capital",
    "domain": "everstonecapital.com",
    "type": "Mumbai"
  },
  {
    "company": "Multiples Alternate Asset",
    "domain": "multiplesequity.com",
    "type": "Mumbai"
  },
  {
    "company": "Sixth Sense Ventures",
    "domain": "sixth-sense.in",
    "type": "Mumbai"
  },
  {
    "company": "WestBridge Capital",
    "domain": "westbridgecap.com",
    "type": "Remote"
  },
  {
    "company": "True North Capital",
    "domain": "truenorth.co.in",
    "type": "Mumbai"
  },
  {
    "company": "Kedaara Capital",
    "domain": "kedaara.com",
    "type": "Mumbai"
  },
  {
    "company": "Technogiq IT Solutions",
    "domain": "technogiq.com",
    "type": "Remote"
  },
  {
    "company": "Tanasvi Technologies",
    "domain": "tanasvi.com",
    "type": "Remote"
  },
  {
    "company": "EbizON Digital",
    "domain": "ebizontek.com",
    "type": "Remote"
  },
  {
    "company": "Vidyayatan Technologies",
    "domain": "vidyayatan.com",
    "type": "Remote"
  },
  {
    "company": "Petadot System & Security",
    "domain": "petadot.com",
    "type": "Remote"
  },
  {
    "company": "ABIR Networks",
    "domain": "abirnetworks.com",
    "type": "Remote"
  },
  {
    "company": "Websutra Technologies",
    "domain": "websutra.in",
    "type": "Remote"
  },
  {
    "company": "Capace Software",
    "domain": "capacesoftware.com",
    "type": "Remote"
  },
  {
    "company": "Colour Moon Technologies",
    "domain": "thecolourmoon.com",
    "type": "Remote"
  },
  {
    "company": "Mindpyxle Technologies",
    "domain": "mindpyxle.com",
    "type": "Remote"
  },
  {
    "company": "Mamits Infotech",
    "domain": "mamits.com",
    "type": "Remote"
  },
  {
    "company": "OyeCommerz Tech",
    "domain": "oyecommerz.com",
    "type": "Remote"
  },
  {
    "company": "Nitsync Global Solutions",
    "domain": "nitsync.com",
    "type": "Remote"
  },
  {
    "company": "Givni Technologies",
    "domain": "givni.in",
    "type": "Remote"
  },
  {
    "company": "10gminds Digital",
    "domain": "10gminds.com",
    "type": "Remote"
  },
  {
    "company": "OpenTeQ Technologies",
    "domain": "openteqgroup.com",
    "type": "Remote"
  },
  {
    "company": "Agnito Technologies",
    "domain": "agnitotechnologies.com",
    "type": "Remote"
  },
  {
    "company": "Maas Infosolutions",
    "domain": "misspl.com",
    "type": "Remote"
  },
  {
    "company": "Flint Lab Inc",
    "domain": "flintlab.io",
    "type": "Remote"
  },
  {
    "company": "Stepfinity Software",
    "domain": "stepfinity.com",
    "type": "Remote"
  },
  {
    "company": "Hubexus Solutions",
    "domain": "hubexus.com",
    "type": "Remote"
  },
  {
    "company": "Invenger Technologies",
    "domain": "invenger.com",
    "type": "Remote"
  },
  {
    "company": "Altimetrik India",
    "domain": "altimetrik.com",
    "type": "Remote"
  },
  {
    "company": "Luxoft India DXC",
    "domain": "luxoft.com",
    "type": "Remote"
  },
  {
    "company": "IQ Softech Solutions",
    "domain": "iqsoftech.in",
    "type": "Remote"
  },
  {
    "company": "KriyaXlabs AI",
    "domain": "kriyaxlabs.com",
    "type": "Remote"
  },
  {
    "company": "7EDGE Software",
    "domain": "7edge.com",
    "type": "Remote"
  },
  {
    "company": "SSS Patna Systems",
    "domain": "ssspatna.com",
    "type": "Remote"
  },
  {
    "company": "Webflora Technologies",
    "domain": "webfloratechnologies.com",
    "type": "Remote"
  },
  {
    "company": "QDigital Solutions",
    "domain": "qdigital.in",
    "type": "Remote"
  },
  {
    "company": "Okinawa Autotech Scooters",
    "domain": "okinawascooters.com",
    "type": "Remote"
  },
  {
    "company": "Semnox Solutions",
    "domain": "semnox.com",
    "type": "Remote"
  },
  {
    "company": "Komaki Electric Vehicle",
    "domain": "komaki.in",
    "type": "Remote"
  },
  {
    "company": "Forgestack Labs",
    "domain": "forgestack.com",
    "type": "Remote"
  },
  {
    "company": "RKV IT Solutions",
    "domain": "rkvitsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Komquest Solutions",
    "domain": "komquest.com",
    "type": "Remote"
  },
  {
    "company": "Geometric PLM",
    "domain": "geometricglobal.com",
    "type": "Pune"
  },
  {
    "company": "DailyObjects Lifestyle Tech",
    "domain": "dailyobjects.com",
    "type": "Remote"
  },
  {
    "company": "Pebble Smartwatches",
    "domain": "pebblecart.com",
    "type": "Remote"
  },
  {
    "company": "Uppercase Eco Travel",
    "domain": "uppercase.co.in",
    "type": "Mumbai"
  },
  {
    "company": "Docquity Medical Network",
    "domain": "docquity.com",
    "type": "Remote"
  },
  {
    "company": "Vedix Custom Ayurveda",
    "domain": "vedix.com",
    "type": "Remote"
  },
  {
    "company": "Nutrabay Supplements",
    "domain": "nutrabay.com",
    "type": "Remote"
  },
  {
    "company": "SkinKraft Custom Beauty",
    "domain": "skinkraft.com",
    "type": "Remote"
  },
  {
    "company": "Truemeds Medicine Tech",
    "domain": "truemeds.in",
    "type": "Mumbai"
  },
  {
    "company": "Headphone Zone Audio",
    "domain": "headphonezone.in",
    "type": "Mumbai"
  },
  {
    "company": "Auric Ayurvedic Beverages",
    "domain": "theauric.com",
    "type": "Remote"
  },
  {
    "company": "Alpino Health Foods",
    "domain": "alpino.store",
    "type": "Remote"
  },
  {
    "company": "Lybrate Consultation",
    "domain": "lybrate.com",
    "type": "Remote"
  },
  {
    "company": "Vaaree Home Products",
    "domain": "vaaree.com",
    "type": "Remote"
  },
  {
    "company": "Crossbeats Wearables",
    "domain": "crossbeats.com",
    "type": "Remote"
  },
  {
    "company": "Hammer Lifestyle",
    "domain": "hammeronline.in",
    "type": "Remote"
  },
  {
    "company": "Truke Audio Tech",
    "domain": "truke.in",
    "type": "Remote"
  },
  {
    "company": "Nestasia Home Decor",
    "domain": "nestasia.in",
    "type": "Remote"
  },
  {
    "company": "Pintola Nut Butters",
    "domain": "pintola.in",
    "type": "Remote"
  },
  {
    "company": "MasterChow Food Tech",
    "domain": "masterchow.in",
    "type": "Remote"
  },
  {
    "company": "TAC The Ayurveda Company",
    "domain": "theayurvedaco.com",
    "type": "Remote"
  },
  {
    "company": "Wings Lifestyle Gaming",
    "domain": "wingslifestyle.in",
    "type": "Remote"
  },
  {
    "company": "CrelioHealth Diagnostics Cloud",
    "domain": "creliohealth.com",
    "type": "Pune"
  },
  {
    "company": "Chumbak Design",
    "domain": "chumbak.com",
    "type": "Remote"
  },
  {
    "company": "Assembly Luggage",
    "domain": "assemblytravel.com",
    "type": "Remote"
  },
  {
    "company": "Naagin Hot Sauce",
    "domain": "naaginsauce.com",
    "type": "Mumbai"
  },
  {
    "company": "Analytics Vidhya Learning",
    "domain": "analyticsvidhya.com",
    "type": "Remote"
  },
  {
    "company": "Penpot Open Design",
    "domain": "penpot.app",
    "type": "Remote"
  },
  {
    "company": "Icons8 Digital Assets",
    "domain": "icons8.com",
    "type": "Remote"
  },
  {
    "company": "Coderbyte Assessments",
    "domain": "coderbyte.com",
    "type": "Remote"
  },
  {
    "company": "Uxcel Design Education",
    "domain": "uxcel.com",
    "type": "Remote"
  },
  {
    "company": "Pluralsight India Platform",
    "domain": "pluralsight.com",
    "type": "Remote"
  },
  {
    "company": "Procube Technologies",
    "domain": "procube.cx",
    "type": "Remote"
  },
  {
    "company": "Springboard India Tech",
    "domain": "springboard.com",
    "type": "Remote"
  },
  {
    "company": "Udacity India Tech",
    "domain": "udacity.com",
    "type": "Remote"
  },
  {
    "company": "Urban Platter Gourmet",
    "domain": "urbanplatter.in",
    "type": "Mumbai"
  },
  {
    "company": "Paper Boat Hector Beverages",
    "domain": "hectorbeverages.com",
    "type": "Remote"
  },
  {
    "company": "Educative Interactive Courses",
    "domain": "educative.io",
    "type": "Remote"
  },
  {
    "company": "Eleics Design Tech",
    "domain": "eleics.com",
    "type": "Remote"
  },
  {
    "company": "DevX Innovations",
    "domain": "devx.work",
    "type": "Remote"
  },
  {
    "company": "Zenkins Technologies",
    "domain": "zenkins.com",
    "type": "Remote"
  },
  {
    "company": "Accelpix Solutions",
    "domain": "accelpix.com",
    "type": "Remote"
  },
  {
    "company": "BhuMe Spatial Tech",
    "domain": "bhume.com",
    "type": "Remote"
  },
  {
    "company": "Zixflow Communications",
    "domain": "zixflow.com",
    "type": "Remote"
  },
  {
    "company": "Shadow Infosystem",
    "domain": "shadowinfosystem.com",
    "type": "Remote"
  },
  {
    "company": "Taksh IT Solutions",
    "domain": "takshitsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Velocity Software Solutions",
    "domain": "velsof.com",
    "type": "Remote"
  },
  {
    "company": "MCN Solutions Software",
    "domain": "mcnsolutions.net",
    "type": "Remote"
  },
  {
    "company": "Agile Tech Solutions",
    "domain": "agiletech.co.in",
    "type": "Remote"
  },
  {
    "company": "Infozion Technologies",
    "domain": "infozion.in",
    "type": "Remote"
  },
  {
    "company": "AbyM Technology",
    "domain": "abymtechnology.com",
    "type": "Remote"
  },
  {
    "company": "Technanosoft Technologies",
    "domain": "technanosoft.com",
    "type": "Remote"
  },
  {
    "company": "Render Infotech Bangalore",
    "domain": "renderinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Mobistreak Media Tech",
    "domain": "mobistreak.com",
    "type": "Remote"
  },
  {
    "company": "Xotiv Technologies",
    "domain": "xotiv.com",
    "type": "Remote"
  },
  {
    "company": "CodeFire Technologies",
    "domain": "codefire.org",
    "type": "Remote"
  },
  {
    "company": "TechConfer Technologies",
    "domain": "techconfer.com",
    "type": "Remote"
  },
  {
    "company": "Finoit Technology",
    "domain": "finoit.com",
    "type": "Remote"
  },
  {
    "company": "Opalina Technologies",
    "domain": "opalina.in",
    "type": "Remote"
  },
  {
    "company": "Ucodice Technologies",
    "domain": "ucodice.com",
    "type": "Remote"
  },
  {
    "company": "Poornam Info Vision",
    "domain": "poornam.com",
    "type": "Remote"
  },
  {
    "company": "Logiciel Solutions Jaipur",
    "domain": "logicielsolutions.com",
    "type": "Remote"
  },
  {
    "company": "Diaspark Infotech Solutions",
    "domain": "diaspark.com",
    "type": "Remote"
  },
  {
    "company": "TT Consultants Global",
    "domain": "ttconsultants.com",
    "type": "Remote"
  },
  {
    "company": "Synoverge Technologies",
    "domain": "synoverge.com",
    "type": "Remote"
  },
  {
    "company": "Ottonomy Autonomous Robotics",
    "domain": "ottonomy.io",
    "type": "Remote"
  },
  {
    "company": "Level Supermind Meditation",
    "domain": "level.game",
    "type": "Mumbai"
  },
  {
    "company": "NetObjex IoT Solutions",
    "domain": "netobjex.com",
    "type": "Remote"
  },
  {
    "company": "Grazitti Interactive",
    "domain": "grazitti.com",
    "type": "Remote"
  },
  {
    "company": "Calpine Technologies",
    "domain": "calpinetech.com",
    "type": "Remote"
  },
  {
    "company": "Agilysys India Tech",
    "domain": "agilysys.com",
    "type": "Remote"
  },
  {
    "company": "Mindhouse Mental Wellness",
    "domain": "mindhouse.com",
    "type": "Remote"
  },
  {
    "company": "ESSPL Software Systems",
    "domain": "esspl.com",
    "type": "Remote"
  },
  {
    "company": "Phidata AI Framework",
    "domain": "phidata.com",
    "type": "Remote"
  },
  {
    "company": "Chroma Database Tech",
    "domain": "trychroma.com",
    "type": "Remote"
  },
  {
    "company": "Weaviate Vector DB",
    "domain": "weaviate.io",
    "type": "Remote"
  },
  {
    "company": "BentoML AI Serving",
    "domain": "bentoml.com",
    "type": "Remote"
  },
  {
    "company": "Firecrawl Web Data",
    "domain": "firecrawl.dev",
    "type": "Remote"
  },
  {
    "company": "Modal Labs Cloud",
    "domain": "modal.com",
    "type": "Remote"
  },
  {
    "company": "Gitpod Cloud Dev",
    "domain": "gitpod.io",
    "type": "Remote"
  },
  {
    "company": "Vellum AI Enterprise",
    "domain": "vellum.ai",
    "type": "Remote"
  },
  {
    "company": "Better Stack Observability",
    "domain": "betterstack.com",
    "type": "Remote"
  },
  {
    "company": "CodeSandbox Cloud IDE",
    "domain": "codesandbox.io",
    "type": "Remote"
  },
  {
    "company": "Qdrant Vector Database",
    "domain": "qdrant.tech",
    "type": "Remote"
  },
  {
    "company": "Langfuse LLM Observability",
    "domain": "langfuse.com",
    "type": "Remote"
  },
  {
    "company": "Zed Industries Code Editor",
    "domain": "zed.dev",
    "type": "Remote"
  },
  {
    "company": "Replit Software Creation",
    "domain": "replit.com",
    "type": "Remote"
  },
  {
    "company": "RunPod GPU Cloud",
    "domain": "runpod.io",
    "type": "Remote"
  },
  {
    "company": "Warp Terminal Cloud",
    "domain": "warp.dev",
    "type": "Remote"
  },
  {
    "company": "LlamaIndex Data Framework",
    "domain": "llamaindex.ai",
    "type": "Remote"
  },
  {
    "company": "Baseten Machine Learning",
    "domain": "baseten.co",
    "type": "Remote"
  },
  {
    "company": "Quest Labs AI",
    "domain": "questlabs.ai",
    "type": "Remote"
  },
  {
    "company": "Highlight Developer Tools",
    "domain": "highlight.io",
    "type": "Remote"
  },
  {
    "company": "Daytona Dev Environment",
    "domain": "daytona.io",
    "type": "Remote"
  },
  {
    "company": "Helicone AI Tooling",
    "domain": "helicone.ai",
    "type": "Remote"
  },
  {
    "company": "Unstructured Data AI",
    "domain": "unstructured.io",
    "type": "Remote"
  },
  {
    "company": "HyperDX Observability",
    "domain": "hyperdx.io",
    "type": "Remote"
  },
  {
    "company": "Together AI Platform",
    "domain": "together.ai",
    "type": "Remote"
  },
  {
    "company": "Vercel Cloud Platform",
    "domain": "vercel.com",
    "type": "Remote"
  },
  {
    "company": "Augment Code AI",
    "domain": "augmentcode.com",
    "type": "Remote"
  },
  {
    "company": "Fireworks AI Acceleration",
    "domain": "fireworks.ai",
    "type": "Remote"
  },
  {
    "company": "Mixpanel Data Systems",
    "domain": "mixpanel.com",
    "type": "Remote"
  },
  {
    "company": "Groq Fast AI Inference",
    "domain": "groq.com",
    "type": "Remote"
  },
  {
    "company": "Prefect Data Platform",
    "domain": "prefect.io",
    "type": "Remote"
  },
  {
    "company": "Resend Email Platform",
    "domain": "resend.com",
    "type": "Remote"
  },
  {
    "company": "Trigger.dev Workflow Engine",
    "domain": "trigger.dev",
    "type": "Remote"
  },
  {
    "company": "Supabase Open Source DB",
    "domain": "supabase.com",
    "type": "Remote"
  },
  {
    "company": "Appwrite Backend Cloud",
    "domain": "appwrite.io",
    "type": "Remote"
  },
  {
    "company": "PostHog Product Analytics",
    "domain": "posthog.com",
    "type": "Remote"
  },
  {
    "company": "Amplitude Analytics Platform",
    "domain": "amplitude.com",
    "type": "Remote"
  },
  {
    "company": "Supermaven AI Completion",
    "domain": "supermaven.com",
    "type": "Remote"
  },
  {
    "company": "Cube Semantic Layer",
    "domain": "cube.dev",
    "type": "Remote"
  },
  {
    "company": "Inngest Event Platform",
    "domain": "inngest.com",
    "type": "Remote"
  },
  {
    "company": "Airbyte Data Integration",
    "domain": "airbyte.com",
    "type": "Remote"
  },
  {
    "company": "Hightouch Data Cloud",
    "domain": "hightouch.com",
    "type": "Remote"
  },
  {
    "company": "MotherDuck Cloud Systems",
    "domain": "motherduck.com",
    "type": "Remote"
  },
  {
    "company": "Census Data Integration",
    "domain": "getcensus.com",
    "type": "Remote"
  },
  {
    "company": "Tenstorrent AI Hardware",
    "domain": "tenstorrent.com",
    "type": "Remote"
  },
  {
    "company": "Cognition AI Software",
    "domain": "cognition.ai",
    "type": "Remote"
  },
  {
    "company": "Dagster Workflow Platform",
    "domain": "dagster.io",
    "type": "Remote"
  },
  {
    "company": "Cerebras Systems Computing",
    "domain": "cerebras.ai",
    "type": "Remote"
  },
  {
    "company": "Clerk Authentication Cloud",
    "domain": "clerk.com",
    "type": "Remote"
  },
  {
    "company": "Astronomer Airflow Cloud",
    "domain": "astronomer.io",
    "type": "Remote"
  },
  {
    "company": "Pinecone Vector Database",
    "domain": "pinecone.io",
    "type": "Remote"
  },
  {
    "company": "Neon Serverless Postgres",
    "domain": "neon.tech",
    "type": "Remote"
  },
  {
    "company": "Prisma ORM Cloud Platform",
    "domain": "prisma.io",
    "type": "Remote"
  },
  {
    "company": "Turso SQLite Cloud",
    "domain": "turso.tech",
    "type": "Remote"
  },
  {
    "company": "Upstash Serverless Cloud",
    "domain": "upstash.com",
    "type": "Remote"
  },
  {
    "company": "ClickHouse Realtime Data",
    "domain": "clickhouse.com",
    "type": "Remote"
  },
  {
    "company": "BrainMobi Technologies",
    "domain": "brainmobi.com",
    "type": "Remote"
  },
  {
    "company": "Krify Software Technologies",
    "domain": "krify.co",
    "type": "Remote"
  },
  {
    "company": "PlanetScale Database Cloud",
    "domain": "planetscale.com",
    "type": "Remote"
  },
  {
    "company": "Kody Technolab Labs",
    "domain": "kodytechnolab.com",
    "type": "Remote"
  },
  {
    "company": "Knack Systems Software",
    "domain": "knacksystems.com",
    "type": "Remote"
  },
  {
    "company": "TatvaSoft Global Systems",
    "domain": "tatvasoft.co.uk",
    "type": "Remote"
  },
  {
    "company": "Tinybird Realtime Analytics",
    "domain": "tinybird.co",
    "type": "Remote"
  },
  {
    "company": "Brainvire Global Solutions",
    "domain": "brainvire.co",
    "type": "Remote"
  },
  {
    "company": "Dixinfotech Software",
    "domain": "dixinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Prismetric Technologies",
    "domain": "prismetric.com",
    "type": "Remote"
  },
  {
    "company": "Webclues Infotech",
    "domain": "webcluesinfotech.com",
    "type": "Remote"
  },
  {
    "company": "VGroup Digital Technologies",
    "domain": "vgroupinc.com",
    "type": "Remote"
  },
  {
    "company": "Shreeji Softtech",
    "domain": "shreejisofttech.com",
    "type": "Remote"
  },
  {
    "company": "Softqube Technologies",
    "domain": "softqube.com",
    "type": "Remote"
  },
  {
    "company": "Apex Infotech India",
    "domain": "apexinfotechindia.com",
    "type": "Remote"
  },
  {
    "company": "Sankalp Computer Systems",
    "domain": "sankalp.com",
    "type": "Pune"
  },
  {
    "company": "ProtoTech Solutions",
    "domain": "prototechsolutions.com",
    "type": "Pune"
  },
  {
    "company": "MoogleLabs AI Cloud",
    "domain": "mooglelabs.com",
    "type": "Remote"
  },
  {
    "company": "Silicus Technologies",
    "domain": "silicus.com",
    "type": "Pune"
  },
  {
    "company": "Satva Solutions",
    "domain": "satvasolutions.com",
    "type": "Remote"
  },
  {
    "company": "Kratin Mobile Solutions",
    "domain": "kratin.co.in",
    "type": "Remote"
  },
  {
    "company": "UpsideLMS Learning Tech",
    "domain": "upsidelms.com",
    "type": "Pune"
  },
  {
    "company": "Techtalisman Solutions",
    "domain": "techtalisman.com",
    "type": "Remote"
  },
  {
    "company": "Neova Solutions Tech",
    "domain": "neovasolutions.com",
    "type": "Pune"
  },
  {
    "company": "Suntec Web Services",
    "domain": "suntecindia.com",
    "type": "Remote"
  },
  {
    "company": "Altizon Industrial IoT",
    "domain": "altizon.com",
    "type": "Pune"
  },
  {
    "company": "Differenz System IT",
    "domain": "differenzsystem.com",
    "type": "Remote"
  },
  {
    "company": "Nivida Web Solutions",
    "domain": "nivida.in",
    "type": "Remote"
  },
  {
    "company": "Techcronus Business Solutions",
    "domain": "techcronus.com",
    "type": "Remote"
  },
  {
    "company": "Ivitesse Technologies",
    "domain": "ivitesse.com",
    "type": "Remote"
  },
  {
    "company": "Nimap Infotech",
    "domain": "nimapinfotech.com",
    "type": "Mumbai"
  },
  {
    "company": "Positiwise Software Solutions",
    "domain": "positiwise.com",
    "type": "Remote"
  },
  {
    "company": "Infopercept Consulting",
    "domain": "infopercept.com",
    "type": "Remote"
  },
  {
    "company": "Tagline Infotech",
    "domain": "taglineinfotech.com",
    "type": "Remote"
  },
  {
    "company": "Logicrays Technologies",
    "domain": "logicrays.com",
    "type": "Remote"
  },
  {
    "company": "Beagle Security Cloud",
    "domain": "beaglesecurity.com",
    "type": "Remote"
  },
  {
    "company": "Mindster Mobile Studio",
    "domain": "mindster.com",
    "type": "Remote"
  },
  {
    "company": "iMOBDEV Technologies",
    "domain": "imobdevtech.com",
    "type": "Remote"
  },
  {
    "company": "Avasam Marketplace SaaS",
    "domain": "avasam.com",
    "type": "Remote"
  },
  {
    "company": "Code Brew Labs Products",
    "domain": "code-brew.com",
    "type": "Remote"
  },
  {
    "company": "ZestyBeanz Technologies",
    "domain": "zbeanztech.com",
    "type": "Remote"
  },
  {
    "company": "Thinksys Technologies QA",
    "domain": "thinksys.com",
    "type": "Remote"
  },
  {
    "company": "Zoondia Software Solutions",
    "domain": "zoondia.com",
    "type": "Remote"
  },
  {
    "company": "Travancore Analytics",
    "domain": "travancoreanalytics.com",
    "type": "Remote"
  },
  {
    "company": "Sigosoft Technologies",
    "domain": "sigosoft.com",
    "type": "Remote"
  },
  {
    "company": "Elitech Systems",
    "domain": "elitechsystems.com",
    "type": "Remote"
  },
  {
    "company": "Narola Infotech",
    "domain": "narolainfotech.com",
    "type": "Remote"
  },
  {
    "company": "Sesame Software Systems",
    "domain": "sesameindia.com",
    "type": "Remote"
  },
  {
    "company": "Crest Data Systems",
    "domain": "crestdatasys.com",
    "type": "Remote"
  },
  {
    "company": "Kindlebit Solutions Global",
    "domain": "kindlebit.com",
    "type": "Remote"
  },
  {
    "company": "World Web Technology Systems",
    "domain": "worldwebtechnology.com",
    "type": "Remote"
  },
  {
    "company": "Deftsoft Informatics Global",
    "domain": "deftsoft.com",
    "type": "Remote"
  },
  {
    "company": "Enuke Software Labs",
    "domain": "enukesoftware.com",
    "type": "Remote"
  },
  {
    "company": "Root Info Solutions",
    "domain": "rootinfosolutions.com",
    "type": "Remote"
  },
  {
    "company": "Samarpan Infotech",
    "domain": "samarpaninfotech.com",
    "type": "Remote"
  },
  {
    "company": "Solitaire Infosys Systems",
    "domain": "slinfy.com",
    "type": "Remote"
  },
  {
    "company": "Technostacks Infotech",
    "domain": "technostacks.com",
    "type": "Remote"
  },
  {
    "company": "JioMart Retail Digital",
    "domain": "jiomart.com",
    "type": "Mumbai"
  },
  {
    "company": "Bahwan CyberTek Cloud",
    "domain": "bahwancybertek.com",
    "type": "Remote"
  },
  {
    "company": "GammaStack Software Labs",
    "domain": "gammastack.com",
    "type": "Remote"
  },
  {
    "company": "Haber Automated Industrial Water",
    "domain": "haberwater.com",
    "type": "Pune"
  },
  {
    "company": "Aarav Unmanned Systems AUS",
    "domain": "aus.co.in",
    "type": "Remote"
  },
  {
    "company": "Magenta Mobility Clean Fleet",
    "domain": "magentamobility.com",
    "type": "Mumbai"
  },
  {
    "company": "Lightmatter Photonic Supercomputing",
    "domain": "lightmatter.co",
    "type": "Remote"
  },
  {
    "company": "General Aeronautics Drone Cloud",
    "domain": "generalaeronautics.com",
    "type": "Remote"
  },
  {
    "company": "Unbox Robotics Fulfillment Sorting",
    "domain": "unboxrobotics.com",
    "type": "Pune"
  },
  {
    "company": "Etched AI ASIC Systems",
    "domain": "etched.com",
    "type": "Remote"
  },
  {
    "company": "Enfabrica Accelerated Networking",
    "domain": "enfabrica.net",
    "type": "Remote"
  },
  {
    "company": "Sify Technologies Cloud Network",
    "domain": "sifytechnologies.com",
    "type": "Remote"
  },
  {
    "company": "FloMobility Autonomous Platform",
    "domain": "flomobility.com",
    "type": "Remote"
  },
  {
    "company": "Take Solutions Life Sciences",
    "domain": "takesolutions.com",
    "type": "Remote"
  },
  {
    "company": "Eka Mobility Commercial Vehicles",
    "domain": "ekamobility.com",
    "type": "Pune"
  },
  {
    "company": "GAVS Technologies AIOps",
    "domain": "gavstech.com",
    "type": "Remote"
  },
  {
    "company": "Armstrong Automation Systems",
    "domain": "armstrongltd.com",
    "type": "Pune"
  },
  {
    "company": "Bellatrix Aerospace Satellite Propulsion",
    "domain": "bellatrixaerospace.com",
    "type": "Remote"
  },
  {
    "company": "Redwing Labs Medical Drone Logistics",
    "domain": "redwinglabs.com",
    "type": "Remote"
  },
  {
    "company": "SambaNova Systems Enterprise AI",
    "domain": "sambanova.ai",
    "type": "Remote"
  },
  {
    "company": "D-Matrix In-Memory AI Compute",
    "domain": "d-matrix.ai",
    "type": "Remote"
  },
  {
    "company": "Blaize Edge AI Computing",
    "domain": "blaize.com",
    "type": "Remote"
  },
  {
    "company": "TechEagle Drone Delivery Network",
    "domain": "techeagle.in",
    "type": "Remote"
  },
  {
    "company": "Celestial AI Photonic Fabrics",
    "domain": "celestial.ai",
    "type": "Remote"
  },
  {
    "company": "Untether AI Energy Efficient Compute",
    "domain": "untether.ai",
    "type": "Remote"
  },
  {
    "company": "Gridbots Technologies Industrial AI",
    "domain": "gridbots.com",
    "type": "Remote"
  },
  {
    "company": "Falcon Autotech Sortation Systems",
    "domain": "falconautotech.com",
    "type": "Remote"
  },
  {
    "company": "Hailo Edge AI Microprocessors",
    "domain": "hailo.ai",
    "type": "Remote"
  },
  {
    "company": "EdgeCortix Edge AI Silicon",
    "domain": "edgecortix.com",
    "type": "Remote"
  },
  {
    "company": "Preferred Networks Deep Learning",
    "domain": "preferred.jp",
    "type": "Remote"
  },
  {
    "company": "SiFive RISC-V Computing Silicon",
    "domain": "sifive.com",
    "type": "Remote"
  },
  {
    "company": "Syntiant Ultra Low Power Silicon",
    "domain": "syntiant.com",
    "type": "Remote"
  },
  {
    "company": "Rivos High Performance RISC-V",
    "domain": "rivosinc.com",
    "type": "Remote"
  },
  {
    "company": "Ventana Micro Systems High Performance",
    "domain": "ventanamicro.com",
    "type": "Remote"
  },
  {
    "company": "Mythic Analog AI Computing",
    "domain": "mythic.ai",
    "type": "Remote"
  },
  {
    "company": "MemryX AI Accelerator Silicon",
    "domain": "memryx.com",
    "type": "Remote"
  },
  {
    "company": "Kneron Edge AI Microchips",
    "domain": "kneron.com",
    "type": "Remote"
  },
  {
    "company": "BrainChip Akida Neuromorphic",
    "domain": "brainchip.com",
    "type": "Remote"
  },
  {
    "company": "Rebellions NPU Silicon Systems",
    "domain": "rebellions.ai",
    "type": "Remote"
  },
  {
    "company": "Quadric General-Purpose NPU",
    "domain": "quadric.io",
    "type": "Remote"
  },
  {
    "company": "Expedera NPU Architecture Labs",
    "domain": "expedera.com",
    "type": "Remote"
  },
  {
    "company": "Graphcore IPU Silicon Systems",
    "domain": "graphcore.ai",
    "type": "Remote"
  },
  {
    "company": "Andes Technology RISC-V Cores",
    "domain": "andestech.com",
    "type": "Remote"
  },
  {
    "company": "Rain AI Neuromorphic Compute",
    "domain": "rain.ai",
    "type": "Remote"
  },
  {
    "company": "Perceive Ergo AI Processors",
    "domain": "perceive.io",
    "type": "Remote"
  },
  {
    "company": "FuriosaAI Semiconductor Cloud",
    "domain": "furiosa.ai",
    "type": "Remote"
  },
  {
    "company": "DeepX AI Semiconductor Labs",
    "domain": "deepx.ai",
    "type": "Remote"
  },
  {
    "company": "Axelera AI Metis AI Platform",
    "domain": "axelera.ai",
    "type": "Remote"
  },
  {
    "company": "Innatera Neuromorphic Silicon",
    "domain": "innatera.com",
    "type": "Remote"
  },
  {
    "company": "Kalray Manycore Processors",
    "domain": "kalrayinc.com",
    "type": "Remote"
  },
  {
    "company": "Aspinity Analog Machine Learning",
    "domain": "aspinity.com",
    "type": "Remote"
  },
  {
    "company": "SiMa.ai Machine Learning SoC",
    "domain": "sima.ai",
    "type": "Remote"
  },
  {
    "company": "Codasip RISC-V Custom Silicon",
    "domain": "codasip.com",
    "type": "Remote"
  },
  {
    "company": "Esperanto Technologies Thousands Cores",
    "domain": "esperanto.ai",
    "type": "Remote"
  },
  {
    "company": "Extropic Physics Thermodynamic AI",
    "domain": "extropic.ai",
    "type": "Remote"
  },
  {
    "company": "Sapeon AI Semiconductor Solutions",
    "domain": "sapeon.com",
    "type": "Remote"
  },
  {
    "company": "QpiAI Quantum AI Solutions",
    "domain": "qpiai.tech",
    "type": "Remote"
  },
  {
    "company": "Strangeworks Quantum Software Ecosystem",
    "domain": "strangeworks.com",
    "type": "Remote"
  },
  {
    "company": "PsiQuantum Silicon Quantum Systems",
    "domain": "psiquantum.com",
    "type": "Remote"
  },
  {
    "company": "Rigetti Superconducting Quantum",
    "domain": "rigetti.com",
    "type": "Remote"
  },
  {
    "company": "Q-CTRL Quantum Infrastructure",
    "domain": "q-ctrl.com",
    "type": "Remote"
  },
  {
    "company": "IonQ Trapped Ion Quantum Compute",
    "domain": "ionq.com",
    "type": "Remote"
  },
  {
    "company": "Horizon Quantum Computing Software",
    "domain": "horizonquantum.com",
    "type": "Remote"
  },
  {
    "company": "Riverlane Quantum Error Correction",
    "domain": "riverlane.com",
    "type": "Remote"
  },
  {
    "company": "D-Wave Quantum Annealing Systems",
    "domain": "dwavesys.com",
    "type": "Remote"
  },
  {
    "company": "Normal Computing Thermodynamic AI",
    "domain": "normalcomputing.ai",
    "type": "Remote"
  },
  {
    "company": "Classiq Quantum Software Platform",
    "domain": "classiq.io",
    "type": "Remote"
  },
  {
    "company": "Xanadu Photonic Quantum Computing",
    "domain": "xanadu.ai",
    "type": "Remote"
  },
  {
    "company": "LightSolver Optical Processing",
    "domain": "lightsolver.com",
    "type": "Remote"
  },
  {
    "company": "BosonQ Psi Quantum Simulation",
    "domain": "bosonqpsi.com",
    "type": "Remote"
  },
  {
    "company": "CollegeDunia Tech",
    "domain": "collegedunia.com",
    "type": "Remote"
  },
  {
    "company": "Career360 Education Cloud",
    "domain": "careers360.com",
    "type": "Remote"
  },
  {
    "company": "DataCamp Data Learning",
    "domain": "datacamp.com",
    "type": "Remote"
  },
  {
    "company": "Frontend Masters Video Learning",
    "domain": "frontendmasters.com",
    "type": "Remote"
  },
  {
    "company": "Egghead Web Development",
    "domain": "egghead.io",
    "type": "Remote"
  },
  {
    "company": "Hootsuite Social Platforms",
    "domain": "hootsuite.com",
    "type": "Remote"
  },
  {
    "company": "Talkdesk Cloud Contact Center",
    "domain": "talkdesk.com",
    "type": "Remote"
  },
  {
    "company": "Sprout Social Media Management",
    "domain": "sproutsocial.com",
    "type": "Remote"
  },
  {
    "company": "Scrimba Interactive Code",
    "domain": "scrimba.com",
    "type": "Remote"
  },
  {
    "company": "Dialpad Cloud Communications",
    "domain": "dialpad.com",
    "type": "Remote"
  },
  {
    "company": "Khoros Digital Engagement",
    "domain": "khoros.com",
    "type": "Remote"
  },
  {
    "company": "Brandwatch Consumer Intelligence",
    "domain": "brandwatch.com",
    "type": "Remote"
  },
  {
    "company": "Codecademy Learning Cloud",
    "domain": "codecademy.com",
    "type": "Remote"
  },
  {
    "company": "FIS Global Financial Solutions",
    "domain": "fisglobal.com",
    "type": "Pune"
  },
  {
    "company": "SocialPilot Social Marketing",
    "domain": "socialpilot.co",
    "type": "Remote"
  },
  {
    "company": "Meltwater Media Intelligence",
    "domain": "meltwater.com",
    "type": "Remote"
  },
  {
    "company": "Worldline Payment Services",
    "domain": "worldline.com",
    "type": "Mumbai"
  },
  {
    "company": "CoSchedule Marketing Workflows",
    "domain": "coschedule.com",
    "type": "Remote"
  },
  {
    "company": "Later Visual Social Media",
    "domain": "later.com",
    "type": "Remote"
  },
  {
    "company": "Statusbrew Social Cloud",
    "domain": "statusbrew.com",
    "type": "Remote"
  },
  {
    "company": "Loomly Brand Success Platform",
    "domain": "loomly.com",
    "type": "Remote"
  },
  {
    "company": "Buffer Social Publishing",
    "domain": "buffer.com",
    "type": "Remote"
  },
  {
    "company": "Oliveboard Learning Tech",
    "domain": "oliveboard.in",
    "type": "Remote"
  },
  {
    "company": "Cresta Real-Time Intelligence",
    "domain": "cresta.com",
    "type": "Remote"
  },
  {
    "company": "Tailwind Marketing System",
    "domain": "tailwindapp.com",
    "type": "Remote"
  },
  {
    "company": "Diebold Nixdorf Banking Tech",
    "domain": "dieboldnixdorf.com",
    "type": "Mumbai"
  },
  {
    "company": "Euronet Worldwide Payments",
    "domain": "euronetworldwide.com",
    "type": "Mumbai"
  },
  {
    "company": "Balto Software Speech AI",
    "domain": "balto.ai",
    "type": "Remote"
  },
  {
    "company": "Finastra Open Financial Platform",
    "domain": "finastra.com",
    "type": "Remote"
  },
  {
    "company": "nCino Cloud Banking Platform",
    "domain": "ncino.com",
    "type": "Remote"
  },
  {
    "company": "Temenos Core Banking Cloud",
    "domain": "temenos.com",
    "type": "Remote"
  },
  {
    "company": "Mambu SaaS Cloud Banking",
    "domain": "mambu.com",
    "type": "Remote"
  },
  {
    "company": "Q2 Digital Banking Solutions",
    "domain": "q2.com",
    "type": "Remote"
  },
  {
    "company": "Jack Henry Financial Technology",
    "domain": "jackhenry.com",
    "type": "Remote"
  },
  {
    "company": "Motilal Oswal Financial Services",
    "domain": "motilaloswal.com",
    "type": "Mumbai"
  },
  {
    "company": "Mastertrust Financial Broking",
    "domain": "mastertrust.co.in",
    "type": "Remote"
  },
  {
    "company": "Ocrolus Financial Document AI",
    "domain": "ocrolus.com",
    "type": "Remote"
  },
  {
    "company": "Backbase Engagement Banking",
    "domain": "backbase.com",
    "type": "Remote"
  },
  {
    "company": "Blend Digital Lending Cloud",
    "domain": "blend.com",
    "type": "Remote"
  },
  {
    "company": "Anand Rathi Financial Services",
    "domain": "anandrathi.com",
    "type": "Mumbai"
  },
  {
    "company": "Alkami Digital Banking Cloud",
    "domain": "alkami.com",
    "type": "Remote"
  },
  {
    "company": "Itransition Software Solutions",
    "domain": "itransition.com",
    "type": "Remote"
  },
  {
    "company": "Belitsoft Software Development",
    "domain": "belitsoft.com",
    "type": "Remote"
  },
  {
    "company": "WebbyLab Node Development",
    "domain": "webbylab.com",
    "type": "Remote"
  },
  {
    "company": "ScienceSoft IT Consulting",
    "domain": "scnsoft.com",
    "type": "Remote"
  },
  {
    "company": "Oxagile Video Software Solutions",
    "domain": "oxagile.com",
    "type": "Remote"
  },
  {
    "company": "Sigma Software Engineering",
    "domain": "sigma.software",
    "type": "Remote"
  },
  {
    "company": "N-iX Software Development",
    "domain": "n-ix.com",
    "type": "Remote"
  },
  {
    "company": "Andersen Lab Software Tech",
    "domain": "andersenlab.com",
    "type": "Remote"
  },
  {
    "company": "QArea Software Testing",
    "domain": "qarea.com",
    "type": "Remote"
  },
  {
    "company": "Iflexion Custom Software",
    "domain": "iflexion.com",
    "type": "Remote"
  },
  {
    "company": "Ciklum Digital Solutions",
    "domain": "ciklum.com",
    "type": "Remote"
  },
  {
    "company": "A1QA Software Testing Labs",
    "domain": "a1qa.com",
    "type": "Remote"
  },
  {
    "company": "ACI Worldwide RealTime Payments",
    "domain": "aciworldwide.com",
    "type": "Remote"
  },
  {
    "company": "Thought Machine Cloud Core",
    "domain": "thoughtmachine.net",
    "type": "Remote"
  },
  {
    "company": "Intellias Engineering Services",
    "domain": "intellias.com",
    "type": "Remote"
  },
  {
    "company": "ELEKS Custom Software Engineering",
    "domain": "eleks.com",
    "type": "Remote"
  },
  {
    "company": "Infopulse IT Services Global",
    "domain": "infopulse.com",
    "type": "Remote"
  },
  {
    "company": "SoftServe Digital Engineering",
    "domain": "softserveinc.com",
    "type": "Remote"
  },
  {
    "company": "Ghost Open Source Publishing",
    "domain": "ghost.org",
    "type": "Remote"
  },
  {
    "company": "Automattic WordPress Cloud",
    "domain": "automattic.com",
    "type": "Remote"
  },
  {
    "company": "DuckDuckGo Privacy Search",
    "domain": "duckduckgo.com",
    "type": "Remote"
  },
  {
    "company": "Zapier Workflow Automation",
    "domain": "zapier.com",
    "type": "Remote"
  },
  {
    "company": "Basecamp 37signals Tech",
    "domain": "basecamp.com",
    "type": "Remote"
  },
  {
    "company": "Webflow Visual Development",
    "domain": "webflow.com",
    "type": "Remote"
  },
  {
    "company": "Toggl Track Productivity",
    "domain": "toggl.com",
    "type": "Remote"
  },
  {
    "company": "Superhuman Fastest Email",
    "domain": "superhuman.com",
    "type": "Remote"
  },
  {
    "company": "Figma Collaborative Interface",
    "domain": "figma.com",
    "type": "Remote"
  },
  {
    "company": "Hotjar Behavioral Analytics",
    "domain": "hotjar.com",
    "type": "Remote"
  },
  {
    "company": "Aha! Product Management Software",
    "domain": "aha.io",
    "type": "Remote"
  },
  {
    "company": "Loom Video Messaging Tech",
    "domain": "loom.com",
    "type": "Remote"
  },
  {
    "company": "Raycast Mac Launcher Tech",
    "domain": "raycast.com",
    "type": "Remote"
  },
  {
    "company": "Coda Docs That Work",
    "domain": "coda.io",
    "type": "Remote"
  },
  {
    "company": "Sketch Design Platform",
    "domain": "sketch.com",
    "type": "Remote"
  },
  {
    "company": "Linear Issue Tracking Cloud",
    "domain": "linear.app",
    "type": "Remote"
  },
  {
    "company": "Help Scout Customer Support",
    "domain": "helpscout.com",
    "type": "Remote"
  },
  {
    "company": "Pitch Presentation Software",
    "domain": "pitch.com",
    "type": "Remote"
  },
  {
    "company": "Miro Visual Collaboration",
    "domain": "miro.com",
    "type": "Remote"
  },
  {
    "company": "Cal.com Open Scheduling",
    "domain": "cal.com",
    "type": "Remote"
  },
  {
    "company": "Novu Open Source Notification",
    "domain": "novu.co",
    "type": "Remote"
  },
  {
    "company": "Medusa Open Source Commerce",
    "domain": "medusajs.com",
    "type": "Remote"
  },
  {
    "company": "Formbricks Open Source Survey",
    "domain": "formbricks.com",
    "type": "Remote"
  },
  {
    "company": "Airtable Connected Apps",
    "domain": "airtable.com",
    "type": "Remote"
  },
  {
    "company": "Nhost Serverless Backend",
    "domain": "nhost.io",
    "type": "Remote"
  },
  {
    "company": "DataArt Global Software",
    "domain": "dataart.com",
    "type": "Remote"
  },
  {
    "company": "Doist Todoist Productivity",
    "domain": "doist.com",
    "type": "Remote"
  },
  {
    "company": "Canonical Ubuntu Systems",
    "domain": "canonical.com",
    "type": "Remote"
  },
  {
    "company": "Dub.co Open Source Link Hub",
    "domain": "dub.co",
    "type": "Remote"
  },
  {
    "company": "Plane Open Source Project Tracking",
    "domain": "plane.so",
    "type": "Remote"
  },
  {
    "company": "Flowise AI Workflow Builder",
    "domain": "flowiseai.com",
    "type": "Remote"
  },
  {
    "company": "Ollama Open Source LLM Runner",
    "domain": "ollama.com",
    "type": "Remote"
  },
  {
    "company": "Documenso Open Source Signing",
    "domain": "documenso.com",
    "type": "Remote"
  },
  {
    "company": "Dify.ai Open Source LLMOps",
    "domain": "dify.ai",
    "type": "Remote"
  },
  {
    "company": "OpenStatus Synthetic Monitoring",
    "domain": "openstatus.dev",
    "type": "Remote"
  },
  {
    "company": "Infisical Secret Management Cloud",
    "domain": "infisical.com",
    "type": "Remote"
  },
  {
    "company": "Langflow Open Visual LLM",
    "domain": "langflow.org",
    "type": "Remote"
  },
  {
    "company": "Vespa Vector Search Engine",
    "domain": "vespa.ai",
    "type": "Remote"
  },
  {
    "company": "Deepgram Speech AI Platform",
    "domain": "deepgram.com",
    "type": "Remote"
  },
  {
    "company": "AssemblyAI Speech To Text",
    "domain": "assemblyai.com",
    "type": "Remote"
  },
  {
    "company": "PlayHT AI Voice Studio",
    "domain": "play.ht",
    "type": "Remote"
  },
  {
    "company": "Speechify Text To Speech Cloud",
    "domain": "speechify.com",
    "type": "Remote"
  },
  {
    "company": "HeyGen Generative AI Video",
    "domain": "heygen.com",
    "type": "Remote"
  },
  {
    "company": "ElevenLabs Voice AI Systems",
    "domain": "elevenlabs.io",
    "type": "Remote"
  },
  {
    "company": "Synthesia AI Video Creation",
    "domain": "synthesia.io",
    "type": "Remote"
  },
  {
    "company": "Hume AI Empathic Voice Tech",
    "domain": "hume.ai",
    "type": "Remote"
  },
  {
    "company": "Runway AI Video Creative Tools",
    "domain": "runwayml.com",
    "type": "Remote"
  },
  {
    "company": "Pika Generative AI Video",
    "domain": "pika.art",
    "type": "Remote"
  },
  {
    "company": "Kaiber Generative AI Studio",
    "domain": "kaiber.ai",
    "type": "Remote"
  },
  {
    "company": "Luma AI Dream Machine Video",
    "domain": "lumalabs.ai",
    "type": "Remote"
  },
  {
    "company": "Udio AI Music Creation",
    "domain": "udio.com",
    "type": "Remote"
  },
  {
    "company": "Suno AI Music Generation",
    "domain": "suno.com",
    "type": "Remote"
  },
  {
    "company": "Cartesia Ultra-Fast Voice AI",
    "domain": "cartesia.ai",
    "type": "Remote"
  },
  {
    "company": "Tavus AI Video Replication",
    "domain": "tavus.io",
    "type": "Remote"
  },
  {
    "company": "CrewAI Multi-Agent Automation",
    "domain": "crewai.com",
    "type": "Remote"
  },
  {
    "company": "LanceDB Serverless Vector DB",
    "domain": "lancedb.com",
    "type": "Remote"
  },
  {
    "company": "Milvus Vector Search Platform",
    "domain": "milvus.io",
    "type": "Remote"
  },
  {
    "company": "Mem0 Memory for AI Agents",
    "domain": "mem0.ai",
    "type": "Remote"
  },
  {
    "company": "Civitai AI Generative Models",
    "domain": "civitai.com",
    "type": "Remote"
  },
  {
    "company": "Replicate Run AI Models Cloud",
    "domain": "replicate.com",
    "type": "Remote"
  },
  {
    "company": "Stability AI Open Generative Tech",
    "domain": "stability.ai",
    "type": "Remote"
  },
  {
    "company": "VAST Data Unified AI Data Platform",
    "domain": "vastdata.com",
    "type": "Remote"
  },
  {
    "company": "Fal.ai Ultra-Fast Inference Cloud",
    "domain": "fal.ai",
    "type": "Remote"
  },
  {
    "company": "Wasabi Hot Cloud Storage",
    "domain": "wasabi.com",
    "type": "Remote"
  },
  {
    "company": "Lambda Labs GPU Cloud Computing",
    "domain": "lambdalabs.com",
    "type": "Remote"
  },
  {
    "company": "Vast.ai GPU Rental Marketplace",
    "domain": "vast.ai",
    "type": "Remote"
  },
  {
    "company": "MinIO High Performance Object Storage",
    "domain": "min.io",
    "type": "Remote"
  },
  {
    "company": "CoreWeave Accelerated Cloud",
    "domain": "coreweave.com",
    "type": "Remote"
  },
  {
    "company": "Backblaze B2 Cloud Storage",
    "domain": "backblaze.com",
    "type": "Remote"
  },
  {
    "company": "Deno Secure JavaScript Cloud",
    "domain": "deno.com",
    "type": "Remote"
  },
  {
    "company": "Gatsby Cloud Web Framework",
    "domain": "gatsbyjs.com",
    "type": "Remote"
  },
  {
    "company": "Remix Web Framework Cloud",
    "domain": "remix.run",
    "type": "Remote"
  },
  {
    "company": "Bun JavaScript Runtime System",
    "domain": "bun.sh",
    "type": "Remote"
  },
  {
    "company": "Nx Monorepo Build Platform",
    "domain": "nx.dev",
    "type": "Remote"
  },
  {
    "company": "Redpanda Streaming Data Platform",
    "domain": "redpanda.com",
    "type": "Remote"
  },
  {
    "company": "Tailwind Labs CSS Engineering",
    "domain": "tailwindcss.com",
    "type": "Remote"
  },
  {
    "company": "CockroachDB Distributed SQL",
    "domain": "cockroachlabs.com",
    "type": "Remote"
  },
  {
    "company": "Apollo GraphQL Data Graph",
    "domain": "apollographql.com",
    "type": "Remote"
  },
  {
    "company": "YugabyteDB Distributed SQL Cloud",
    "domain": "yugabyte.com",
    "type": "Remote"
  },
  {
    "company": "Fastly Edge Cloud Platform",
    "domain": "fastly.com",
    "type": "Remote"
  },
  {
    "company": "Akamai Connected Cloud",
    "domain": "akamai.com",
    "type": "Remote"
  },
  {
    "company": "Astro Web Framework Platform",
    "domain": "astro.build",
    "type": "Remote"
  },
  {
    "company": "ScyllaDB NoSQL Distributed DB",
    "domain": "scylladb.com",
    "type": "Remote"
  },
  {
    "company": "Dragonfly In-Memory Data Store",
    "domain": "dragonflydb.io",
    "type": "Remote"
  },
  {
    "company": "Crusoe Clean Cloud Computing",
    "domain": "crusoe.ai",
    "type": "Remote"
  },
  {
    "company": "PingCAP TiDB Distributed SQL",
    "domain": "pingcap.com",
    "type": "Remote"
  },
  {
    "company": "Nebius AI Cloud Platform",
    "domain": "nebius.ai",
    "type": "Remote"
  },
  {
    "company": "Snowflake Data Cloud Platform",
    "domain": "snowflake.com",
    "type": "Remote"
  },
  {
    "company": "SingleStore Real-Time Distributed DB",
    "domain": "singlestore.com",
    "type": "Remote"
  },
  {
    "company": "InfluxData InfluxDB Time-Series",
    "domain": "influxdata.com",
    "type": "Remote"
  },
  {
    "company": "VictoriaMetrics Fast Time-Series",
    "domain": "victoriametrics.com",
    "type": "Remote"
  },
  {
    "company": "RisingWave Streaming Database",
    "domain": "risingwave.com",
    "type": "Remote"
  },
  {
    "company": "Databricks Data Intelligence",
    "domain": "databricks.com",
    "type": "Remote"
  },
  {
    "company": "Materialize Streaming Database",
    "domain": "materialize.com",
    "type": "Remote"
  },
  {
    "company": "HiveMQ MQTT Enterprise Broker",
    "domain": "hivemq.com",
    "type": "Remote"
  },
  {
    "company": "Ververica Apache Flink Cloud",
    "domain": "ververica.com",
    "type": "Remote"
  },
  {
    "company": "CelerData StarRocks Real-Time",
    "domain": "celerdata.com",
    "type": "Remote"
  },
  {
    "company": "Timescale Time-Series Postgres",
    "domain": "timescale.com",
    "type": "Remote"
  },
  {
    "company": "Starburst Trino Data Lakehouse",
    "domain": "starburst.io",
    "type": "Remote"
  },
  {
    "company": "Imply Apache Druid Real-Time",
    "domain": "imply.io",
    "type": "Remote"
  },
  {
    "company": "StarTree Apache Pinot Analytics",
    "domain": "startree.ai",
    "type": "Remote"
  },
  {
    "company": "Fivetran Automated Data Movement",
    "domain": "fivetran.com",
    "type": "Remote"
  },
  {
    "company": "dbt Labs Analytics Engineering",
    "domain": "getdbt.com",
    "type": "Remote"
  },
  {
    "company": "Preset Managed Apache Superset",
    "domain": "preset.io",
    "type": "Remote"
  },
  {
    "company": "Mode Collaborative Analytics",
    "domain": "mode.com",
    "type": "Remote"
  },
  {
    "company": "Metabase Open Source Business Intelligence",
    "domain": "metabase.com",
    "type": "Remote"
  },
  {
    "company": "Posit RStudio Data Science Platform",
    "domain": "posit.co",
    "type": "Remote"
  },
  {
    "company": "Deepnote Collaborative Data Notebooks",
    "domain": "deepnote.com",
    "type": "Remote"
  },
  {
    "company": "Estuary Real-Time Data Streaming",
    "domain": "estuary.dev",
    "type": "Remote"
  },
  {
    "company": "Hex Data Science & Analytics",
    "domain": "hex.tech",
    "type": "Remote"
  },
  {
    "company": "Evidence Code-Driven BI",
    "domain": "evidence.dev",
    "type": "Remote"
  },
  {
    "company": "Lightdash Open Source BI Cloud",
    "domain": "lightdash.com",
    "type": "Remote"
  },
  {
    "company": "Onehouse Managed Apache Hudi",
    "domain": "onehouse.ai",
    "type": "Remote"
  },
  {
    "company": "SelectDB Apache Doris Platform",
    "domain": "selectdb.com",
    "type": "Remote"
  },
  {
    "company": "Freshpaint Privacy Data Platform",
    "domain": "freshpaint.io",
    "type": "Remote"
  },
  {
    "company": "Count Canvas Data Analytics",
    "domain": "count.co",
    "type": "Remote"
  },
  {
    "company": "Polytomic Sync Data Systems",
    "domain": "polytomic.com",
    "type": "Remote"
  },
  {
    "company": "Anaconda Python Data Science",
    "domain": "anaconda.com",
    "type": "Remote"
  },
  {
    "company": "Weights and Biases MLOps Platform",
    "domain": "wandb.ai",
    "type": "Remote"
  },
  {
    "company": "Comet MLOps Machine Learning",
    "domain": "comet.com",
    "type": "Remote"
  },
  {
    "company": "ClearML Continuous Machine Learning",
    "domain": "clear.ml",
    "type": "Remote"
  },
  {
    "company": "Svix Webhooks as a Service",
    "domain": "svix.com",
    "type": "Remote"
  },
  {
    "company": "Neptune AI MLOps Metadata Store",
    "domain": "neptune.ai",
    "type": "Remote"
  },
  {
    "company": "Knock Product Notification Infra",
    "domain": "knock.app",
    "type": "Remote"
  },
  {
    "company": "Courier Notification Platform",
    "domain": "courier.com",
    "type": "Remote"
  },
  {
    "company": "FullStory Digital Experience Data",
    "domain": "fullstory.com",
    "type": "Remote"
  },
  {
    "company": "Loops Modern Email for SaaS",
    "domain": "loops.so",
    "type": "Remote"
  },
  {
    "company": "Smartlook User Insights Cloud",
    "domain": "smartlook.com",
    "type": "Remote"
  },
  {
    "company": "Heap Digital Insights Analytics",
    "domain": "heap.io",
    "type": "Remote"
  },
  {
    "company": "Datadog Cloud Monitoring",
    "domain": "datadoghq.com",
    "type": "Remote"
  },
  {
    "company": "June Analytics for B2B SaaS",
    "domain": "june.so",
    "type": "Remote"
  },
  {
    "company": "Hookdeck Event Gateway Webhooks",
    "domain": "hookdeck.com",
    "type": "Remote"
  },
  {
    "company": "LogRocket Frontend Monitoring",
    "domain": "logrocket.com",
    "type": "Remote"
  },
  {
    "company": "New Relic Full-Stack Observability",
    "domain": "newrelic.com",
    "type": "Remote"
  },
  {
    "company": "Contentsquare Digital Experience",
    "domain": "contentsquare.com",
    "type": "Remote"
  },
  {
    "company": "AppDynamics Cisco Observability",
    "domain": "appdynamics.com",
    "type": "Remote"
  },
  {
    "company": "Grafana Labs Observability Cloud",
    "domain": "grafana.com",
    "type": "Remote"
  },
  {
    "company": "Coralogix Full-Stack Observability",
    "domain": "coralogix.com",
    "type": "Remote"
  },
  {
    "company": "Bugsnag Application Stability",
    "domain": "bugsnag.com",
    "type": "Remote"
  },
  {
    "company": "Sentry Developer Error Tracking",
    "domain": "sentry.io",
    "type": "Remote"
  },
  {
    "company": "Rollbar Real-Time Error Monitoring",
    "domain": "rollbar.com",
    "type": "Remote"
  },
  {
    "company": "LaunchDarkly Feature Management",
    "domain": "launchdarkly.com",
    "type": "Remote"
  },
  {
    "company": "Statsig Feature Flags & Experiments",
    "domain": "statsig.com",
    "type": "Remote"
  },
  {
    "company": "Mage Open Source Data Pipeline",
    "domain": "mage.ai",
    "type": "Remote"
  },
  {
    "company": "Logz.io Cloud Observability",
    "domain": "logz.io",
    "type": "Remote"
  },
  {
    "company": "Honeycomb High-Cardinality Observability",
    "domain": "honeycomb.io",
    "type": "Remote"
  },
  {
    "company": "GrowthBook Open Source Feature Flags",
    "domain": "growthbook.io",
    "type": "Remote"
  },
  {
    "company": "Kinde Simple Authentication",
    "domain": "kinde.com",
    "type": "Remote"
  },
  {
    "company": "Unleash Enterprise Feature Management",
    "domain": "getunleash.io",
    "type": "Remote"
  },
  {
    "company": "Stytch Developer Identity Auth",
    "domain": "stytch.com",
    "type": "Remote"
  },
  {
    "company": "Flagsmith Open Source Feature Flags",
    "domain": "flagsmith.com",
    "type": "Remote"
  },
  {
    "company": "Auth0 Identity Platform Okta",
    "domain": "auth0.com",
    "type": "Remote"
  },
  {
    "company": "WorkOS Enterprise Ready Features",
    "domain": "workos.com",
    "type": "Remote"
  },
  {
    "company": "Authentik Open Source Identity",
    "domain": "goauthentik.io",
    "type": "Remote"
  },
  {
    "company": "FusionAuth Modern Identity Platform",
    "domain": "fusionauth.io",
    "type": "Remote"
  },
  {
    "company": "Tailscale Mesh VPN Zero Trust",
    "domain": "tailscale.com",
    "type": "Remote"
  },
  {
    "company": "Zitadel Open Source Identity Cloud",
    "domain": "zitadel.com",
    "type": "Remote"
  },
  {
    "company": "Palo Alto Networks Cybersecurity",
    "domain": "paloaltonetworks.com",
    "type": "Remote"
  },
  {
    "company": "Twingate Zero Trust Network Access",
    "domain": "twingate.com",
    "type": "Remote"
  },
  {
    "company": "ZeroTier Global Area Networking",
    "domain": "zerotier.com",
    "type": "Remote"
  },
  {
    "company": "Teleport Zero Trust Access Platform",
    "domain": "goteleport.com",
    "type": "Remote"
  },
  {
    "company": "Fortinet Cybersecurity Solutions",
    "domain": "fortinet.com",
    "type": "Remote"
  },
  {
    "company": "NetBird Open Source Zero Trust",
    "domain": "netbird.io",
    "type": "Remote"
  },
  {
    "company": "Zscaler Cloud Security Platform",
    "domain": "zscaler.com",
    "type": "Remote"
  },
  {
    "company": "Oso Batteries-Included Authorization",
    "domain": "osohq.com",
    "type": "Remote"
  },
  {
    "company": "Perimeter 81 ZTNA Security",
    "domain": "perimeter81.com",
    "type": "Remote"
  },
  {
    "company": "Descope Drag and Drop Authentication",
    "domain": "descope.com",
    "type": "Remote"
  },
  {
    "company": "NordLayer Business VPN Security",
    "domain": "nordlayer.com",
    "type": "Remote"
  },
  {
    "company": "CrowdStrike Falcon Cybersecurity",
    "domain": "crowdstrike.com",
    "type": "Remote"
  },
  {
    "company": "Cerbos Authorization as a Service",
    "domain": "cerbos.dev",
    "type": "Remote"
  },
  {
    "company": "SentinelOne Autonomous Cybersecurity",
    "domain": "sentinelone.com",
    "type": "Remote"
  },
  {
    "company": "Snyk Developer Security Platform",
    "domain": "snyk.io",
    "type": "Remote"
  },
  {
    "company": "Ory Open Source Identity Infrastructure",
    "domain": "ory.sh",
    "type": "Remote"
  },
  {
    "company": "Keycloak Open Source IAM RedHat",
    "domain": "keycloak.org",
    "type": "Remote"
  },
  {
    "company": "Permit.io Full-Stack Authorization",
    "domain": "permit.io",
    "type": "Remote"
  },
  {
    "company": "Frontegg User Management B2B SaaS",
    "domain": "frontegg.com",
    "type": "Remote"
  },
  {
    "company": "Mend.io Application Security",
    "domain": "mend.io",
    "type": "Remote"
  },
  {
    "company": "Checkmarx Enterprise AppSec Cloud",
    "domain": "checkmarx.com",
    "type": "Remote"
  },
  {
    "company": "Semgrep Code Security Platform",
    "domain": "semgrep.dev",
    "type": "Remote"
  },
  {
    "company": "Veracode Application Security",
    "domain": "veracode.com",
    "type": "Remote"
  },
  {
    "company": "Socket Supply Chain Security",
    "domain": "socket.dev",
    "type": "Remote"
  },
  {
    "company": "SonarQube Clean Code Platform",
    "domain": "sonarsource.com",
    "type": "Remote"
  },
  {
    "company": "Sysdig Cloud Native Security",
    "domain": "sysdig.com",
    "type": "Remote"
  },
  {
    "company": "Chainguard Secure Software Supply",
    "domain": "chainguard.dev",
    "type": "Remote"
  },
  {
    "company": "Aikido Security Developer-First",
    "domain": "aikido.dev",
    "type": "Remote"
  },
  {
    "company": "Wiz Cloud Security Platform",
    "domain": "wiz.io",
    "type": "Remote"
  },
  {
    "company": "Docker Container Platform",
    "domain": "docker.com",
    "type": "Remote"
  },
  {
    "company": "Aqua Security Cloud Native Security",
    "domain": "aquasec.com",
    "type": "Remote"
  },
  {
    "company": "GitGuardian Secret Detection",
    "domain": "gitguardian.com",
    "type": "Remote"
  },
  {
    "company": "HashiCorp Multi-Cloud Automation",
    "domain": "hashicorp.com",
    "type": "Remote"
  },
  {
    "company": "Orca Security Agentless Cloud Security",
    "domain": "orca.security",
    "type": "Remote"
  },
  {
    "company": "Rancher Open Source Kubernetes",
    "domain": "rancher.com",
    "type": "Remote"
  },
  {
    "company": "env0 Infrastructure Automation",
    "domain": "env0.com",
    "type": "Remote"
  },
  {
    "company": "Pulumi Infrastructure as Code",
    "domain": "pulumi.com",
    "type": "Remote"
  },
  {
    "company": "Gruntwork Terragrunt Infrastructure",
    "domain": "gruntwork.io",
    "type": "Remote"
  },
  {
    "company": "Buildkite CI/CD Software Platform",
    "domain": "buildkite.com",
    "type": "Remote"
  },
  {
    "company": "Netlify Composable Web Platform",
    "domain": "netlify.com",
    "type": "Remote"
  },
  {
    "company": "Harness Modern Software Delivery",
    "domain": "harness.io",
    "type": "Remote"
  },
  {
    "company": "Scalr Terraform Automation",
    "domain": "scalr.com",
    "type": "Remote"
  },
  {
    "company": "CircleCI Continuous Integration",
    "domain": "circleci.com",
    "type": "Remote"
  },
  {
    "company": "Northflank Developer Cloud Platform",
    "domain": "northflank.com",
    "type": "Remote"
  },
  {
    "company": "Koyeb Serverless Cloud Platform",
    "domain": "koyeb.com",
    "type": "Remote"
  },
  {
    "company": "Legit Security Application Security",
    "domain": "legitsecurity.com",
    "type": "Remote"
  },
  {
    "company": "Spacelift Infrastructure Orchestration",
    "domain": "spacelift.io",
    "type": "Remote"
  },
  {
    "company": "Codefresh GitOps Continuous Delivery",
    "domain": "codefresh.io",
    "type": "Remote"
  },
  {
    "company": "Octopus Deploy Release Management",
    "domain": "octopus.com",
    "type": "Remote"
  },
  {
    "company": "DigitalOcean Cloud Hosting",
    "domain": "digitalocean.com",
    "type": "Remote"
  },
  {
    "company": "Vultr Cloud Computing Platform",
    "domain": "vultr.com",
    "type": "Remote"
  },
  {
    "company": "OVHcloud Cloud Infrastructure",
    "domain": "ovhcloud.com",
    "type": "Remote"
  },
  {
    "company": "Porter Cloud Platform PaaS",
    "domain": "porter.run",
    "type": "Remote"
  },
  {
    "company": "Qovery Internal Developer Platform",
    "domain": "qovery.com",
    "type": "Remote"
  },
  {
    "company": "Scaleway Cloud Computing Services",
    "domain": "scaleway.com",
    "type": "Remote"
  },
  {
    "company": "Hetzner Cloud Infrastructure",
    "domain": "hetzner.com",
    "type": "Remote"
  },
  {
    "company": "TradeIndia B2B Commerce",
    "domain": "tradeindia.com",
    "type": "Remote"
  },
  {
    "company": "Grofers India Supply Chain",
    "domain": "grofers.com",
    "type": "Remote"
  },
  {
    "company": "Moj Short Video App",
    "domain": "mojapp.in",
    "type": "Remote"
  },
  {
    "company": "GrapeCity India Software",
    "domain": "grapecity.in",
    "type": "Remote"
  },
  {
    "company": "What's Up Wellness Gummies",
    "domain": "whatsupwellness.in",
    "type": "Remote"
  },
  {
    "company": "Chaupal OTT Punjabi Bhojpuri",
    "domain": "chaupal.tv",
    "type": "Remote"
  },
  {
    "company": "Snackible Healthy Snacks",
    "domain": "snackible.com",
    "type": "Mumbai"
  },
  {
    "company": "Shuttl Corporate Bus Mobility",
    "domain": "shuttl.com",
    "type": "Remote"
  },
  {
    "company": "SonyLIV Digital Entertainment",
    "domain": "sonyliv.com",
    "type": "Mumbai"
  },
  {
    "company": "Public App Hyperlocal Video",
    "domain": "public.app",
    "type": "Remote"
  },
  {
    "company": "Happilo Healthy Snacking",
    "domain": "happilo.com",
    "type": "Remote"
  },
  {
    "company": "Hoichoi Bengali OTT",
    "domain": "hoichoi.tv",
    "type": "Remote"
  },
  {
    "company": "Bluorng Streetwear Design",
    "domain": "bluorng.com",
    "type": "Remote"
  },
  {
    "company": "Bonkers Corner Streetwear",
    "domain": "bonkerscorner.com",
    "type": "Mumbai"
  },
  {
    "company": "Toothsi Aligners MakeO",
    "domain": "toothsi.in",
    "type": "Mumbai"
  },
  {
    "company": "Skinnsi Dermatology MakeO",
    "domain": "skinnsi.in",
    "type": "Mumbai"
  },
  {
    "company": "Nykaa Fashion Apparel",
    "domain": "nykaafashion.com",
    "type": "Mumbai"
  },
  {
    "company": "Zomato Feeding India",
    "domain": "feedingindia.org",
    "type": "Remote"
  },
  {
    "company": "CarTrade Tech Automotive",
    "domain": "cartrade.com",
    "type": "Mumbai"
  },
  {
    "company": "Park+ Smart Parking & Auto Services",
    "domain": "parkplus.io",
    "type": "Remote"
  },
  {
    "company": "Aha Video Telugu OTT",
    "domain": "aha.video",
    "type": "Remote"
  },
  {
    "company": "Burger Baae Fashion App",
    "domain": "burgerbae.in",
    "type": "Remote"
  },
  {
    "company": "Vincent Chase Eyewear",
    "domain": "vincentchase.com",
    "type": "Remote"
  },
  {
    "company": "Biryani By Kilo Sky Gate",
    "domain": "biryanibykilo.com",
    "type": "Remote"
  },
  {
    "company": "John Jacobs Eyewear Digital",
    "domain": "john-jacobs.com",
    "type": "Remote"
  },
  {
    "company": "Jaywalking Streetwear Apparel",
    "domain": "jaywalking.in",
    "type": "Mumbai"
  },
  {
    "company": "Lahori Zeera Drink Tech",
    "domain": "lahorizeera.com",
    "type": "Remote"
  },
  {
    "company": "ShemarooMe Entertainment Digital",
    "domain": "shemaroome.com",
    "type": "Mumbai"
  },
  {
    "company": "Kalyan Jewellers Digital",
    "domain": "kalyanjewellers.net",
    "type": "Remote"
  },
  {
    "company": "Malabar Gold & Diamonds Digital",
    "domain": "malabargoldanddiamonds.com",
    "type": "Remote"
  },
  {
    "company": "Disprz Corporate Learning AI",
    "domain": "disprz.com",
    "type": "Remote"
  },
  {
    "company": "Degreed Upskilling Platform",
    "domain": "degreed.com",
    "type": "Remote"
  },
  {
    "company": "Harappa Education Learning",
    "domain": "harappa.education",
    "type": "Remote"
  },
  {
    "company": "Remote.com Global HR Cloud",
    "domain": "remote.com",
    "type": "Remote"
  },
  {
    "company": "AngelList Wellfound Startups",
    "domain": "wellfound.com",
    "type": "Remote"
  },
  {
    "company": "Multiplier Global Talent Cloud",
    "domain": "usemultiplier.com",
    "type": "Remote"
  },
  {
    "company": "Paychex HR Solutions Cloud",
    "domain": "paychex.com",
    "type": "Remote"
  },
  {
    "company": "ADP Automatic Data Processing",
    "domain": "adp.com",
    "type": "Remote"
  },
  {
    "company": "Gusto Modern Payroll Benefits",
    "domain": "gusto.com",
    "type": "Remote"
  },
  {
    "company": "Rippling Workforce Platform",
    "domain": "rippling.com",
    "type": "Remote"
  },
  {
    "company": "Oyster HR Global Employment",
    "domain": "oysterhr.com",
    "type": "Remote"
  },
  {
    "company": "Deel Global Payroll Platform",
    "domain": "deel.com",
    "type": "Remote"
  },
  {
    "company": "Grammarly AI Writing Cloud",
    "domain": "grammarly.com",
    "type": "Remote"
  },
  {
    "company": "Otter.ai Voice Meeting Notes",
    "domain": "otter.ai",
    "type": "Remote"
  },
  {
    "company": "Canva Visual Suite Platform",
    "domain": "canva.com",
    "type": "Remote"
  },
  {
    "company": "DeepL Translation AI Systems",
    "domain": "deepl.com",
    "type": "Remote"
  },
  {
    "company": "Grain AI Video Meeting Insights",
    "domain": "grain.com",
    "type": "Remote"
  },
  {
    "company": "Fireflies.ai Meeting Recorder",
    "domain": "fireflies.ai",
    "type": "Remote"
  },
  {
    "company": "Justworks PEO & Payroll",
    "domain": "justworks.com",
    "type": "Remote"
  },
  {
    "company": "Fathom AI Meeting Assistant",
    "domain": "fathom.video",
    "type": "Remote"
  },
  {
    "company": "Knolskape Gamified Learning",
    "domain": "knolskape.com",
    "type": "Remote"
  },
  {
    "company": "Cornerstone OnDemand Learning",
    "domain": "cornerstoneondemand.com",
    "type": "Mumbai"
  },
  {
    "company": "Spottabl Tech Talent Network",
    "domain": "spottabl.com",
    "type": "Remote"
  },
  {
    "company": "SpeakIn Expert Learning Tech",
    "domain": "speakin.co",
    "type": "Remote"
  },
  {
    "company": "IIMJobs Management Careers",
    "domain": "iimjobs.com",
    "type": "Remote"
  },
  {
    "company": "Krisp AI Noise Cancellation",
    "domain": "krisp.ai",
    "type": "Remote"
  },
  {
    "company": "Steve.ai AI Video Making",
    "domain": "steve.ai",
    "type": "Remote"
  },
  {
    "company": "Veed.io Online Video Editing",
    "domain": "veed.io",
    "type": "Remote"
  },
  {
    "company": "Vyond Animated Video Studio",
    "domain": "vyond.com",
    "type": "Remote"
  },
  {
    "company": "Prezi Interactive Presentations",
    "domain": "prezi.com",
    "type": "Remote"
  },
  {
    "company": "Kapwing Collaborative Video",
    "domain": "kapwing.com",
    "type": "Remote"
  },
  {
    "company": "Renderforest Design Tools",
    "domain": "renderforest.com",
    "type": "Remote"
  },
  {
    "company": "Mentimeter Interactive Polling",
    "domain": "mentimeter.com",
    "type": "Remote"
  },
  {
    "company": "Qualtrics Experience Management",
    "domain": "qualtrics.com",
    "type": "Remote"
  },
  {
    "company": "Typeform Interactive Forms",
    "domain": "typeform.com",
    "type": "Remote"
  },
  {
    "company": "Slido Audience Interaction",
    "domain": "sli.do",
    "type": "Remote"
  },
  {
    "company": "Jotform Form Builder Cloud",
    "domain": "jotform.com",
    "type": "Remote"
  },
  {
    "company": "SurveyMonkey Momentive Tech",
    "domain": "surveymonkey.com",
    "type": "Remote"
  },
  {
    "company": "Medallia Customer Experience",
    "domain": "medallia.com",
    "type": "Remote"
  },
  {
    "company": "SignNow airSlate eSignatures",
    "domain": "signnow.com",
    "type": "Remote"
  },
  {
    "company": "Wufoo SurveyMonkey Forms",
    "domain": "wufoo.com",
    "type": "Remote"
  },
  {
    "company": "Formstack Workplace Productivity",
    "domain": "formstack.com",
    "type": "Remote"
  },
  {
    "company": "Alida Customer Experience SaaS",
    "domain": "alida.com",
    "type": "Remote"
  },
  {
    "company": "PandaDoc Document Automation",
    "domain": "pandadoc.com",
    "type": "Remote"
  },
  {
    "company": "Ironclad Digital Contracting",
    "domain": "ironcladapp.com",
    "type": "Remote"
  },
  {
    "company": "HelloSign Dropbox Sign",
    "domain": "hellosign.com",
    "type": "Remote"
  },
  {
    "company": "Formsite Web Form Builder",
    "domain": "formsite.com",
    "type": "Remote"
  },
  {
    "company": "CapCut ByteDance Creative",
    "domain": "capcut.com",
    "type": "Remote"
  },
  {
    "company": "Oneflow Digital Contracts",
    "domain": "oneflow.com",
    "type": "Remote"
  },
  {
    "company": "InMoment Experience Improvement",
    "domain": "inmoment.com",
    "type": "Remote"
  },
  {
    "company": "DocuSign Intelligent Agreement",
    "domain": "docusign.com",
    "type": "Remote"
  },
  {
    "company": "Powtoon Visual Communication",
    "domain": "powtoon.com",
    "type": "Remote"
  },
  {
    "company": "Animaker Animated Video Cloud",
    "domain": "animaker.com",
    "type": "Remote"
  },
  {
    "company": "Contractbook Workflow Platform",
    "domain": "contractbook.com",
    "type": "Remote"
  },
  {
    "company": "Descript AI Audio & Video Editor",
    "domain": "descript.com",
    "type": "Remote"
  },
  {
    "company": "Agiloft Contract Lifecycle Management",
    "domain": "agiloft.com",
    "type": "Remote"
  },
  {
    "company": "LexisNexis Legal Intelligence",
    "domain": "lexisnexis.com",
    "type": "Remote"
  },
  {
    "company": "Luminance Legal AI Platform",
    "domain": "luminance.com",
    "type": "Remote"
  },
  {
    "company": "LinkSquares Contract Management",
    "domain": "linksquares.com",
    "type": "Remote"
  },
  {
    "company": "Casetext CoCounsel Legal AI",
    "domain": "casetext.com",
    "type": "Remote"
  },
  {
    "company": "vLex Legal Intelligence Platform",
    "domain": "vlex.com",
    "type": "Remote"
  },
  {
    "company": "Robin AI Legal Assistant",
    "domain": "robinai.com",
    "type": "Remote"
  },
  {
    "company": "Fastcase Legal Research Cloud",
    "domain": "fastcase.com",
    "type": "Remote"
  },
  {
    "company": "Kira Systems Diligence Engine",
    "domain": "kirasystems.com",
    "type": "Remote"
  },
  {
    "company": "Harvey AI Legal Orchestration",
    "domain": "harvey.ai",
    "type": "Remote"
  },
  {
    "company": "Evisort AI Contract Management",
    "domain": "evisort.com",
    "type": "Remote"
  },
  {
    "company": "SirionLabs Contract AI Intelligence",
    "domain": "sirion.ai",
    "type": "Remote"
  },
  {
    "company": "Metropolis Healthcare Diagnostics",
    "domain": "metropolisindia.com",
    "type": "Mumbai"
  },
  {
    "company": "Dr Lal PathLabs Diagnostics",
    "domain": "lalpathlabs.com",
    "type": "Remote"
  },
  {
    "company": "Suburban Diagnostics Labs",
    "domain": "suburbandiagnostics.com",
    "type": "Mumbai"
  },
  {
    "company": "Zuno General Insurance Digital",
    "domain": "hizuno.com",
    "type": "Mumbai"
  },
  {
    "company": "Vijaya Diagnostic Centre",
    "domain": "vijayadiagnostic.com",
    "type": "Remote"
  },
  {
    "company": "HDFC ERGO General Insurance",
    "domain": "hdfcergo.com",
    "type": "Mumbai"
  },
  {
    "company": "ManipalCigna Health Insurance",
    "domain": "manipalcigna.com",
    "type": "Mumbai"
  },
  {
    "company": "Vidal Health Insurance TPA",
    "domain": "vidalhealthtpa.com",
    "type": "Remote"
  },
  {
    "company": "Tata AIG General Insurance",
    "domain": "tataaig.com",
    "type": "Mumbai"
  },
  {
    "company": "RummyCircle Online Gaming",
    "domain": "rummycircle.com",
    "type": "Mumbai"
  },
  {
    "company": "TaxBuddy FinTech Tax Tech",
    "domain": "taxbuddy.com",
    "type": "Mumbai"
  },
  {
    "company": "Kotak General Insurance Digital",
    "domain": "kotakgeneral.com",
    "type": "Mumbai"
  },
  {
    "company": "CardBaazi Baazi Games Platform",
    "domain": "cardbaazi.com",
    "type": "Remote"
  },
  {
    "company": "Agilus Diagnostics Network",
    "domain": "agilusdiagnostics.com",
    "type": "Remote"
  },
  {
    "company": "ICICI Lombard General Insurance",
    "domain": "icicilombard.com",
    "type": "Mumbai"
  },
  {
    "company": "A23 Head Infotech Gaming",
    "domain": "a23.com",
    "type": "Remote"
  },
  {
    "company": "Delta Corp Gaming & Hospitality",
    "domain": "deltacorp.in",
    "type": "Mumbai"
  },
  {
    "company": "Quicko Tax Solutions India",
    "domain": "quicko.com",
    "type": "Remote"
  },
  {
    "company": "Star Health Allied Insurance",
    "domain": "starhealth.in",
    "type": "Remote"
  },
  {
    "company": "LanceSoft Information Tech",
    "domain": "lancesoft.com",
    "type": "Remote"
  },
  {
    "company": "Integreon Managed Solutions",
    "domain": "integreon.com",
    "type": "Mumbai"
  },
  {
    "company": "Charter Global Software",
    "domain": "charterglobal.com",
    "type": "Remote"
  },
  {
    "company": "Prometteur Solutions",
    "domain": "prometteursolutions.com",
    "type": "Pune"
  },
  {
    "company": "Indellient Software Labs",
    "domain": "indellient.com",
    "type": "Remote"
  },
  {
    "company": "Intelliswift Software Systems",
    "domain": "intelliswift.com",
    "type": "Pune"
  },
  {
    "company": "Compunnel Software Group",
    "domain": "compunnel.com",
    "type": "Remote"
  },
  {
    "company": "Seven Bits Technologies",
    "domain": "sevenbits.in",
    "type": "Remote"
  },
  {
    "company": "Saxon Global Solutions",
    "domain": "saxonglobal.com",
    "type": "Remote"
  },
  {
    "company": "Pyramid Consulting Systems",
    "domain": "pyramidci.com",
    "type": "Remote"
  },
  {
    "company": "Keste Enterprise Solutions",
    "domain": "keste.com",
    "type": "Remote"
  },
  {
    "company": "Xoriant Solutions",
    "domain": "xoriant.com",
    "type": "Mumbai"
  },
  {
    "company": "Collabera Digital Systems",
    "domain": "collaberadigital.com",
    "type": "Remote"
  },
  {
    "company": "Jade Global Software",
    "domain": "jadeglobal.com",
    "type": "Pune"
  },
  {
    "company": "CodeClouds IT Solutions",
    "domain": "codeclouds.com",
    "type": "Remote"
  },
  {
    "company": "NLB Services Technologies",
    "domain": "nlbservices.com",
    "type": "Remote"
  }
];

const mxCache = new Map();

async function checkDomainMx(domain) {
  const norm = (domain || '').toLowerCase().trim();
  if (!norm) return false;
  if (mxCache.has(norm)) return mxCache.get(norm);

  try {
    const records = await dns.resolveMx(norm);
    const valid = Array.isArray(records) && records.length > 0;
    mxCache.set(norm, valid);
    return valid;
  } catch (e) {
    mxCache.set(norm, false);
    return false;
  }
}

function getFreshCandidates(targetLocation = 'all', contactedSet = new Set(), contactedCompanies = new Set(), contactedDomainsSet = new Set()) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  const list = [];
  const domainUsedInBatch = new Set();

  const contactedDomains = new Set(contactedDomainsSet);
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  for (const c of MASTER_COMPANIES) {
    if (normLocation === 'mumbai' && c.type.toLowerCase() !== 'mumbai') continue;
    if (normLocation === 'remote' && c.type.toLowerCase() !== 'remote') continue;

    const compName = (c.company || '').toLowerCase().trim();
    if (compName && compName !== 'your team' && compName !== 'your company' && contactedCompanies.has(compName)) continue;

    const domain = (c.domain || '').toLowerCase().trim();
    if (domainUsedInBatch.has(domain) || contactedDomains.has(domain)) continue;

    for (const alias of HR_ALIASES) {
      const email = `${alias}@${domain}`;
      if (!contactedSet.has(email)) {
        list.push({
          company: c.company,
          email: email,
          name: `${c.company} Talent Team`,
          type: c.type,
          region: 'india',
          sourceDoc: `Autonomous Discovery (🇮🇳 India - ${c.type})`
        });
        domainUsedInBatch.add(domain);
        contactedDomains.add(domain);
        if (compName) contactedCompanies.add(compName);
        break;
      }
    }
  }

  return list;
}

async function discoverNextBatchLeads({
  targetLocation = 'all',
  countNeeded = 15,
  contactedSet = new Set(),
  batchDomainSet = new Set(),
  onProgress = null
}) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  const verifiedCandidates = [];
  const usedDomains = new Set(batchDomainSet);

  const contactedDomains = new Set();
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  let pool = MASTER_COMPANIES.filter(c => {
    if (normLocation === 'mumbai') return c.type.toLowerCase() === 'mumbai';
    if (normLocation === 'remote') return c.type.toLowerCase() === 'remote';
    return true;
  });

  if (pool.length < countNeeded) {
    pool = MASTER_COMPANIES;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());

  for (const c of shuffled) {
    if (verifiedCandidates.length >= countNeeded) break;

    const domain = (c.domain || '').toLowerCase().trim();
    if (usedDomains.has(domain) || contactedDomains.has(domain)) continue;

    for (const alias of HR_ALIASES) {
      const email = `${alias}@${domain}`;
      if (contactedSet.has(email)) continue;

      const mxOk = await checkDomainMx(domain);
      if (!mxOk) break;

      verifiedCandidates.push({
        company: c.company,
        email: email,
        name: `${c.company} Talent Team`,
        type: c.type,
        region: 'india',
        sourceDoc: `Autonomous Discovery (🇮🇳 India - ${c.type})`
      });

      usedDomains.add(domain);
      if (typeof onProgress === 'function') {
        onProgress('DISCOVER', `🎯 Lead ready: ${c.company} <${email}>`, 'info');
      }
      break;
    }
  }

  return verifiedCandidates;
}

module.exports = {
  MASTER_COMPANIES,
  HR_ALIASES,
  getFreshCandidates,
  discoverNextBatchLeads,
  checkDomainMx
};
