const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Crawl graf dependensi Bucket Agunan (epic LP-5685) secara BFS lewat issuelinks + parent.
 * Output: explore-output/atlassian/graph-LP-5685.json
 *
 * Penggunaan:
 *   node scripts/crawl-agunan-graph.js [seedKey...]
 */

const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_EMAIL;
const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';

if (!apiToken || !email) {
  console.error('❌ ATLASSIAN_API_TOKEN dan ATLASSIAN_EMAIL wajib diset di .env!');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');
const headers = { Authorization: authHeader, Accept: 'application/json' };

const EPIC = 'LP-5685';
const SEEDS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['S2CML-4889', 'S2CML-4890', 'S2CML-4941', 'S2CML-4944', 'S2CML-4948',
     'S2CML-4949', 'S2CML-5419', 'S2CML-5420', 'S2CML-6020', 'S2CML-5133'];

const FIELDS = 'summary,status,issuetype,priority,parent,issuelinks,labels,components,customfield_10014';

async function api(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) return { ok: false, status: res.status, text: await res.text() };
  return { ok: true, data: await res.json() };
}

async function jqlSearch(jql, label) {
  const q = encodeURIComponent(jql);
  for (const endpoint of [
    `https://${domain}/rest/api/3/search/jql?jql=${q}&maxResults=100&fields=${FIELDS}`,
    `https://${domain}/rest/api/3/search?jql=${q}&maxResults=100&fields=${FIELDS}`,
  ]) {
    const r = await api(endpoint);
    if (r.ok) {
      const n = (r.data.issues || []).length;
      console.log(`  JQL [${label}] → ${n} issue`);
      return r.data.issues || [];
    }
  }
  console.log(`  JQL [${label}] → gagal`);
  return [];
}

function compact(issue) {
  const f = issue.fields || {};
  return {
    key: issue.key,
    summary: f.summary || '',
    issueType: f.issuetype?.name || '',
    status: f.status?.name || '',
    statusCategory: f.status?.statusCategory?.name || '',
    priority: f.priority?.name || '',
    parent: f.parent?.key || null,
    parentSummary: f.parent?.fields?.summary || null,
    epicLink: f.customfield_10014 || null,
    components: (f.components || []).map(c => c.name),
    labels: f.labels || [],
    links: (f.issuelinks || []).map(l => {
      const other = l.outwardIssue || l.inwardIssue;
      if (!other) return null;
      const dir = l.outwardIssue ? 'outward' : 'inward';
      return {
        relation: l.type?.[dir] || l.type?.name || 'relates to',
        direction: dir,
        key: other.key,
        summary: other.fields?.summary || '',
        status: other.fields?.status?.name || '',
      };
    }).filter(Boolean),
  };
}

async function fetchIssue(key) {
  const r = await api(`https://${domain}/rest/api/3/issue/${key}?fields=${FIELDS}`);
  if (!r.ok) {
    console.log(`  ⚠️  ${key} gagal (${r.status})`);
    return null;
  }
  return compact(r.data);
}

async function main() {
  const nodes = new Map();

  console.log(`\n📡 Tahap 1 — cari child epic ${EPIC} via JQL`);
  const seen = new Set();
  for (const [jql, label] of [
    [`parent = "${EPIC}" ORDER BY key ASC`, 'parent'],
    [`"Epic Link" = "${EPIC}" ORDER BY key ASC`, 'Epic Link'],
    [`"Parent Link" = "${EPIC}" ORDER BY key ASC`, 'Parent Link'],
    [`issue in linkedIssues("${EPIC}") ORDER BY key ASC`, 'linkedIssues'],
  ]) {
    for (const i of await jqlSearch(jql, label)) {
      if (!seen.has(i.key)) { seen.add(i.key); nodes.set(i.key, compact(i)); }
    }
  }

  console.log(`\n📡 Tahap 2 — BFS dari ${SEEDS.length} seed + ${seen.size} hasil JQL`);
  const queue = [EPIC, ...SEEDS, ...seen];
  const visited = new Set();
  let fetched = 0;

  while (queue.length) {
    const key = queue.shift();
    if (!key || visited.has(key)) continue;
    visited.add(key);

    let node = nodes.get(key);
    if (!node || !node.links) {
      node = await fetchIssue(key);
      fetched++;
      if (!node) continue;
      nodes.set(key, node);
    }
    if (fetched % 10 === 0 && fetched) console.log(`  ...${fetched} issue diambil, antrean ${queue.length}`);

    for (const l of node.links || []) if (!visited.has(l.key)) queue.push(l.key);
    if (node.parent && !visited.has(node.parent)) queue.push(node.parent);
  }

  const all = [...nodes.values()].sort((a, b) => a.key.localeCompare(b.key));
  const outDir = path.resolve(__dirname, '../explore-output/atlassian');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `graph-${EPIC}.json`);
  fs.writeFileSync(outFile, JSON.stringify({ epic: EPIC, total: all.length, issues: all }, null, 2));

  const byProject = {};
  const byStatus = {};
  for (const n of all) {
    const p = n.key.split('-')[0];
    byProject[p] = (byProject[p] || 0) + 1;
    byStatus[n.status] = (byStatus[n.status] || 0) + 1;
  }

  console.log(`\n======================================================`);
  console.log(`✅ SELESAI — ${all.length} issue`);
  console.log(`Output: ${outFile}`);
  console.log(`Per project :`, byProject);
  console.log(`Per status  :`, byStatus);
  console.log(`======================================================\n`);
}

main().catch(e => { console.error('❌ Gagal:', e.message); process.exit(1); });
