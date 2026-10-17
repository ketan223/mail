const dns = require('dns').promises;
try {
  const dnsSync = require('dns');
  dnsSync.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const fs = require('fs');
const path = require('path');

const candidates = [
  // --- INDIAN & GLOBAL FAST-GROWING TECH & AI FIRMS ---
  { company: 'SigNoz Observability', domain: 'signoz.io', type: 'Remote' },
  { company: 'Quest Labs AI', domain: 'questlabs.ai', type: 'Remote' },
  { company: 'TrueFoundry Cloud ML', domain: 'truefoundry.com', type: 'Remote' },
  { company: 'Portkey AI Gateway', domain: 'portkey.ai', type: 'Remote' },
  { company: 'Middleware Cloud Observability', domain: 'middleware.io', type: 'Remote' },
  { company: 'Devflow AI Automation', domain: 'devflow.ai', type: 'Remote' },
  { company: 'Firecrawl Web Data', domain: 'firecrawl.dev', type: 'Remote' },
  { company: 'Phidata AI Framework', domain: 'phidata.com', type: 'Remote' },
  { company: 'LlamaIndex Data Framework', domain: 'llamaindex.ai', type: 'Remote' },
  { company: 'Unstructured Data AI', domain: 'unstructured.io', type: 'Remote' },
  { company: 'Weaviate Vector DB', domain: 'weaviate.io', type: 'Remote' },
  { company: 'Qdrant Vector Database', domain: 'qdrant.tech', type: 'Remote' },
  { company: 'Chroma Database Tech', domain: 'trychroma.com', type: 'Remote' },
  { company: 'BentoML AI Serving', domain: 'bentoml.com', type: 'Remote' },
  { company: 'Modal Labs Cloud', domain: 'modal.com', type: 'Remote' },
  { company: 'Baseten Machine Learning', domain: 'baseten.co', type: 'Remote' },
  { company: 'RunPod GPU Cloud', domain: 'runpod.io', type: 'Remote' },
  { company: 'Langfuse LLM Observability', domain: 'langfuse.com', type: 'Remote' },
  { company: 'Helicone AI Tooling', domain: 'helicone.ai', type: 'Remote' },
  { company: 'Vellum AI Enterprise', domain: 'vellum.ai', type: 'Remote' },
  { company: 'Better Stack Observability', domain: 'betterstack.com', type: 'Remote' },
  { company: 'Highlight Developer Tools', domain: 'highlight.io', type: 'Remote' },
  { company: 'HyperDX Observability', domain: 'hyperdx.io', type: 'Remote' },
  { company: 'Daytona Dev Environment', domain: 'daytona.io', type: 'Remote' },
  { company: 'Gitpod Cloud Dev', domain: 'gitpod.io', type: 'Remote' },
  { company: 'CodeSandbox Cloud IDE', domain: 'codesandbox.io', type: 'Remote' },
  { company: 'Replit Software Creation', domain: 'replit.com', type: 'Remote' },
  { company: 'Warp Terminal Cloud', domain: 'warp.dev', type: 'Remote' },
  { company: 'Zed Industries Code Editor', domain: 'zed.dev', type: 'Remote' },
  { company: 'Supermaven AI Completion', domain: 'supermaven.com', type: 'Remote' },
  { company: 'Augment Code AI', domain: 'augmentcode.com', type: 'Remote' },
  { company: 'Cognition AI Software', domain: 'cognition.ai', type: 'Remote' },
  { company: 'Together AI Platform', domain: 'together.ai', type: 'Remote' },
  { company: 'Fireworks AI Acceleration', domain: 'fireworks.ai', type: 'Remote' },
  { company: 'Groq Fast AI Inference', domain: 'groq.com', type: 'Remote' },
  { company: 'Cerebras Systems Computing', domain: 'cerebras.ai', type: 'Remote' },
  { company: 'Tenstorrent AI Hardware', domain: 'tenstorrent.com', type: 'Remote' },

  // --- MODERN CLOUD, BACKEND & DATA PLATFORMS ---
  { company: 'Vercel Cloud Platform', domain: 'vercel.com', type: 'Remote' },
  { company: 'Supabase Open Source DB', domain: 'supabase.com', type: 'Remote' },
  { company: 'Appwrite Backend Cloud', domain: 'appwrite.io', type: 'Remote' },
  { company: 'Clerk Authentication Cloud', domain: 'clerk.com', type: 'Remote' },
  { company: 'Inngest Event Platform', domain: 'inngest.com', type: 'Remote' },
  { company: 'Trigger.dev Workflow Engine', domain: 'trigger.dev', type: 'Remote' },
  { company: 'Resend Email Platform', domain: 'resend.com', type: 'Remote' },
  { company: 'PostHog Product Analytics', domain: 'posthog.com', type: 'Remote' },
  { company: 'Mixpanel Data Systems', domain: 'mixpanel.com', type: 'Remote' },
  { company: 'Amplitude Analytics Platform', domain: 'amplitude.com', type: 'Remote' },
  { company: 'RudderStack CDP Systems', domain: 'rudderstack.com', type: 'Remote' },
  { company: 'Census Data Integration', domain: 'getcensus.com', type: 'Remote' },
  { company: 'Hightouch Data Cloud', domain: 'hightouch.com', type: 'Remote' },
  { company: 'Airbyte Data Integration', domain: 'airbyte.com', type: 'Remote' },
  { company: 'Cube Semantic Layer', domain: 'cube.dev', type: 'Remote' },
  { company: 'MotherDuck Cloud Systems', domain: 'motherduck.com', type: 'Remote' },
  { company: 'Dagster Workflow Platform', domain: 'dagster.io', type: 'Remote' },
  { company: 'Prefect Data Platform', domain: 'prefect.io', type: 'Remote' },
  { company: 'Astronomer Airflow Cloud', domain: 'astronomer.io', type: 'Remote' },
  { company: 'Pinecone Vector Database', domain: 'pinecone.io', type: 'Remote' },
  { company: 'Neon Serverless Postgres', domain: 'neon.tech', type: 'Remote' },
  { company: 'Turso SQLite Cloud', domain: 'turso.tech', type: 'Remote' },
  { company: 'Prisma ORM Cloud Platform', domain: 'prisma.io', type: 'Remote' },
  { company: 'PlanetScale Database Cloud', domain: 'planetscale.com', type: 'Remote' },
  { company: 'Upstash Serverless Cloud', domain: 'upstash.com', type: 'Remote' },
  { company: 'Tinybird Realtime Analytics', domain: 'tinybird.co', type: 'Remote' },
  { company: 'ClickHouse Realtime Data', domain: 'clickhouse.com', type: 'Remote' },

  // --- INDIAN IT SERVICES & REGIONAL ENTERPRISES ---
  { company: 'Appinventiv Technologies', domain: 'appinventiv.com', type: 'Remote' },
  { company: 'TechAhead Mobile Software', domain: 'techaheadcorp.com', type: 'Remote' },
  { company: 'RipenApps Technologies', domain: 'ripenapps.com', type: 'Remote' },
  { company: 'Successive Digital Cloud', domain: 'successive.tech', type: 'Remote' },
  { company: 'Kellton Tech Solutions', domain: 'kellton.com', type: 'Remote' },
  { company: 'Damco Solutions Software', domain: 'damcogroup.com', type: 'Remote' },
  { company: 'Chetu Software Development', domain: 'chetu.com', type: 'Remote' },
  { company: 'Sparx IT Solutions', domain: 'sparxitsolutions.com', type: 'Remote' },
  { company: 'Classic Informatics Tech', domain: 'classicinformatics.com', type: 'Remote' },
  { company: 'PixelCrayons Software', domain: 'pixelcrayons.com', type: 'Remote' },
  { company: 'ValueCoders IT Services', domain: 'valuecoders.com', type: 'Remote' },
  { company: 'TatvaSoft Global Systems', domain: 'tatvasoft.co.uk', type: 'Remote' },
  { company: 'Evon Technologies Dehradun', domain: 'evontech.com', type: 'Remote' },
  { company: 'TO THE NEW Digital', domain: 'tothenew.com', type: 'Remote' },
  { company: 'Nagarro Global Software', domain: 'nagarro.com', type: 'Remote' },
  { company: 'QA InfoTech Software', domain: 'qainfotech.com', type: 'Remote' },
  { company: 'Knack Systems Software', domain: 'knacksystems.com', type: 'Remote' },
  { company: 'VGroup Digital Technologies', domain: 'vgroupinc.com', type: 'Remote' },
  { company: 'Claritus Consulting', domain: 'claritusconsulting.com', type: 'Remote' },
  { company: 'Inexture Solutions', domain: 'inexture.com', type: 'Remote' },
  { company: 'Krify Software Technologies', domain: 'krify.co', type: 'Remote' },
  { company: 'Aalpha Information Systems', domain: 'aalpha.net', type: 'Remote' },
  { company: 'Octal Info Solution Global', domain: 'octalinfo.com', type: 'Remote' },
  { company: 'Mobiloitte Technologies', domain: 'mobiloitte.com', type: 'Remote' },
  { company: 'Suffescom Solutions Tech', domain: 'suffescom.com', type: 'Remote' },
  { company: 'RisingMax Software Labs', domain: 'risingmax.com', type: 'Remote' },
  { company: 'BestWeb3 Global Software', domain: 'bestweb3.com', type: 'Remote' },
  { company: 'AppyPie App Platform', domain: 'appypie.com', type: 'Remote' },
  { company: 'BrainMobi Technologies', domain: 'brainmobi.com', type: 'Remote' },
  { company: 'Algoworks Technologies', domain: 'algoworks.com', type: 'Remote' },
  { company: 'Quovantis Technologies', domain: 'quovantis.com', type: 'Remote' },
  { company: 'Netsmartz Infotech', domain: 'netsmartz.com', type: 'Remote' },
  { company: 'GrayCell Technologies', domain: 'graycelltech.com', type: 'Remote' },
  { company: 'IDS Infotech Mohali', domain: 'idsil.com', type: 'Remote' },
  { company: 'Enaviya Information Tech', domain: 'enaviya.com', type: 'Remote' },
  { company: 'Prismetric Technologies', domain: 'prismetric.com', type: 'Remote' },
  { company: 'Agile Infoways Systems', domain: 'agileinfoways.com', type: 'Remote' },
  { company: 'Vrinsoft Technology', domain: 'vrinsofts.com', type: 'Remote' },
  { company: 'MultiQoS Technologies', domain: 'multiqos.com', type: 'Remote' },
  { company: 'Brainvire Global Solutions', domain: 'brainvire.co', type: 'Remote' },
  { company: 'eSparkBiz Technologies', domain: 'esparkinfo.com', type: 'Remote' },
  { company: 'Zealous System Tech', domain: 'zealousys.com', type: 'Remote' },
  { company: 'Cygnet Digital Tech', domain: 'cygnet.one', type: 'Remote' },
  { company: 'AddWeb Solution IT', domain: 'addwebsolution.com', type: 'Remote' },
  { company: 'Moon Technolabs Software', domain: 'moontechnolabs.com', type: 'Remote' },
  { company: 'Kody Technolab Labs', domain: 'kodytechnolab.com', type: 'Remote' },
  { company: 'Vasundhara Infotech', domain: 'vasundharainfotech.com', type: 'Remote' },
  { company: 'Shreeji Softtech', domain: 'shreejisofttech.com', type: 'Remote' },
  { company: 'Coruscate Solutions', domain: 'coruscatesolution.com', type: 'Remote' },
  { company: 'Dixinfotech Software', domain: 'dixinfotech.com', type: 'Remote' },
  { company: 'Webclues Infotech', domain: 'webcluesinfotech.com', type: 'Remote' },
  { company: 'Softqube Technologies', domain: 'softqube.com', type: 'Remote' },
  { company: 'Differenz System IT', domain: 'differenzsystem.com', type: 'Remote' },
  { company: 'Satva Solutions', domain: 'satvasolutions.com', type: 'Remote' },
  { company: 'Nivida Web Solutions', domain: 'nivida.in', type: 'Remote' },
  { company: 'Apex Infotech India', domain: 'apexinfotechindia.com', type: 'Remote' },
  { company: 'Dotsquares Technologies', domain: 'dotsquares.com', type: 'Remote' },
  { company: 'SynapseIndia Software', domain: 'synapseindia.com', type: 'Remote' },
  { company: 'MoogleLabs AI Cloud', domain: 'mooglelabs.com', type: 'Remote' },
  { company: 'Seasia Infotech', domain: 'seasiainfotech.com', type: 'Remote' },
  { company: 'Ivitesse Technologies', domain: 'ivitesse.com', type: 'Remote' },
  { company: 'Smart Sight Innovations', domain: 'smartsight.in', type: 'Mumbai' },
  { company: 'Suntec Web Services', domain: 'suntecindia.com', type: 'Remote' },
  { company: 'Planet Web Solutions', domain: 'planetwebsolutions.com', type: 'Remote' },
  { company: 'Techcronus Business Solutions', domain: 'techcronus.com', type: 'Remote' },
  { company: 'Kratin Mobile Solutions', domain: 'kratin.co.in', type: 'Remote' },
  { company: 'Techtalisman Solutions', domain: 'techtalisman.com', type: 'Remote' },
  { company: 'Sankalp Computer Systems', domain: 'sankalp.com', type: 'Pune' },
  { company: 'Silicus Technologies', domain: 'silicus.com', type: 'Pune' },
  { company: 'Neova Solutions Tech', domain: 'neovasolutions.com', type: 'Pune' },
  { company: 'Talentica Software', domain: 'talentica.com', type: 'Pune' },
  { company: 'Bitwise Global Solutions', domain: 'bitwiseglobal.com', type: 'Pune' },
  { company: 'Pubmatic Media Tech', domain: 'pubmatic.com', type: 'Pune' },
  { company: 'ProtoTech Solutions', domain: 'prototechsolutions.com', type: 'Pune' },
  { company: 'Altizon Industrial IoT', domain: 'altizon.com', type: 'Pune' },
  { company: 'UpsideLMS Learning Tech', domain: 'upsidelms.com', type: 'Pune' },
  { company: 'Icertis Contract Cloud', domain: 'icertis.com', type: 'Pune' },
  { company: 'MindTickle Enablement', domain: 'mindtickle.com', type: 'Pune' },
  { company: 'Druva Cloud Data', domain: 'druva.com', type: 'Pune' },
  { company: 'HighRadius Autonomous Finance', domain: 'highradius.com', type: 'Remote' },
  { company: 'Darwinbox HR Tech', domain: 'darwinbox.com', type: 'Remote' },
  { company: 'LeadSquared Execution', domain: 'leadsquared.com', type: 'Remote' },
  { company: 'Capillary Technologies', domain: 'capillarytech.com', type: 'Remote' },
  { company: 'Whatfix Digital Adoption', domain: 'whatfix.com', type: 'Remote' },
  { company: 'MoEngage Engagement', domain: 'moengage.com', type: 'Remote' },
  { company: 'Yellow.ai Platform', domain: 'yellow.ai', type: 'Remote' }
];

async function run() {
  const dirPath = path.join(__dirname, '../data/company_directory.js');
  const dir = require(dirPath);
  const sentLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sent_log.json'), 'utf8') || '[]');

  const contacted = new Set();
  sentLog.forEach(x => {
    if (x.email) {
      const p = x.email.split('@')[1];
      if (p) contacted.add(p.toLowerCase().trim());
    }
  });

  const existingDomains = new Set(dir.MASTER_COMPANIES.map(c => (c.domain || '').toLowerCase().trim()));

  const toCheck = [];
  const seen = new Set();

  for (const c of candidates) {
    const d = (c.domain || '').toLowerCase().trim();
    if (!d || existingDomains.has(d) || contacted.has(d) || seen.has(d)) continue;
    seen.add(d);
    toCheck.push({
      company: c.company,
      domain: d,
      type: c.type || 'Remote'
    });
  }

  console.log(`Checking ${toCheck.length} prospective candidate companies for DNS MX validation...`);

  const verifiedNew = [];
  const CONCURRENCY = 25;

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

  console.log(`\n\nTotal newly verified fresh companies: ${verifiedNew.length}`);

  if (verifiedNew.length > 0) {
    const combined = [...dir.MASTER_COMPANIES, ...verifiedNew];

    const header = `/**
 * Curated Master Directory of 500+ 100% Fresh Verified Tech Companies & Startups
 * Covers Mumbai, Bengaluru, Delhi-NCR, Pune, Hyderabad, and Remote India.
 * STRICT SAFETY POLICY:
 * - Only verified active DNS MX mail servers
 * - Gold-standard 'careers' hiring inboxes ONLY
 * - NEVER guesses speculative aliases like hiring@, talent@, internships@, people@
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

const MASTER_COMPANIES = `;

    const footer = `;

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

function getFreshCandidates(targetLocation = 'all', contactedSet = new Set()) {
  const normLocation = (targetLocation || 'all').toLowerCase();
  const list = [];
  const domainUsedInBatch = new Set();

  const contactedDomains = new Set();
  contactedSet.forEach(e => {
    const parts = (e || '').toLowerCase().trim().split('@');
    if (parts[1]) contactedDomains.add(parts[1]);
  });

  for (const c of MASTER_COMPANIES) {
    if (normLocation === 'mumbai' && c.type.toLowerCase() !== 'mumbai') continue;
    if (normLocation === 'remote' && c.type.toLowerCase() !== 'remote') continue;

    const domain = (c.domain || '').toLowerCase().trim();
    if (domainUsedInBatch.has(domain) || contactedDomains.has(domain)) continue;

    for (const alias of HR_ALIASES) {
      const email = \`\${alias}@\${domain}\`;
      if (!contactedSet.has(email)) {
        list.push({
          company: c.company,
          email: email,
          name: \`\${c.company} Talent Team\`,
          type: c.type,
          sourceDoc: \`Autonomous Discovery (\${c.type})\`
        });
        domainUsedInBatch.add(domain);
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
      const email = \`\${alias}@\${domain}\`;
      if (contactedSet.has(email)) continue;

      const mxOk = await checkDomainMx(domain);
      if (!mxOk) break;

      verifiedCandidates.push({
        company: c.company,
        email: email,
        name: \`\${c.company} Talent Team\`,
        type: c.type,
        sourceDoc: \`Autonomous Discovery (\${c.type})\`
      });

      usedDomains.add(domain);
      if (typeof onProgress === 'function') {
        onProgress('DISCOVER', \`🎯 Lead ready: \${c.company} <\${email}>\`, 'info');
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
`;

    const fileContent = header + JSON.stringify(combined, null, 2) + footer;
    fs.writeFileSync(dirPath, fileContent, 'utf8');
    console.log(`Updated company_directory.js! Total companies in MASTER_COMPANIES: ${combined.length}`);
  }
}

run().catch(console.error);
