const fs = require('fs');
const path = require('path');

/**
 * Analisa graf LP-5685: pisahkan anak langsung epic (core) dari tetangga (eksternal),
 * lalu cetak rantai dependensi per kelompok modul.
 */

const EPIC = 'LP-5685';
const file = path.resolve(__dirname, `../../explore-output/atlassian/graph-${EPIC}.json`);
const { issues } = JSON.parse(fs.readFileSync(file, 'utf8'));
const byKey = new Map(issues.map(i => [i.key, i]));

// 1. Core = anak langsung epic
const core = issues.filter(i => i.parent === EPIC || i.epicLink === EPIC);
const coreKeys = new Set(core.map(i => i.key));

// 2. Tetangga langsung core yang BUKAN core
const neighborCount = new Map();
for (const c of core) {
  for (const l of c.links || []) {
    if (coreKeys.has(l.key)) continue;
    if (!neighborCount.has(l.key)) neighborCount.set(l.key, { key: l.key, from: [], relation: l.relation });
    neighborCount.get(l.key).from.push(c.key);
  }
}

const out = [];
const P = s => out.push(s);

P(`# Graf Dependensi Epic ${EPIC} — Bucket Agunan\n`);
P(`Total issue ter-crawl: ${issues.length} | Anak langsung epic: ${core.length} | Tetangga eksternal: ${neighborCount.size}\n`);

P(`\n## A. Anak langsung epic ${EPIC} (${core.length})\n`);
const sorted = [...core].sort((a, b) => a.key.localeCompare(b.key));
for (const c of sorted) {
  const deps = (c.links || []).map(l => `${l.key}${coreKeys.has(l.key) ? '' : '*'}`).join(', ');
  P(`- **${c.key}** [${c.issueType}/${c.status}] ${c.summary}`);
  if (deps) P(`    links: ${deps}`);
}

P(`\n## B. Tetangga eksternal (dirujuk core, di luar epic) — ${neighborCount.size}\n`);
const neigh = [...neighborCount.values()]
  .map(n => ({ ...n, node: byKey.get(n.key) }))
  .sort((a, b) => b.from.length - a.from.length);
for (const n of neigh) {
  const st = n.node ? `${n.node.issueType}/${n.node.status}` : '?';
  const sm = n.node ? n.node.summary : '(tidak ter-crawl)';
  P(`- **${n.key}** [${st}] ${sm}`);
  P(`    dirujuk oleh (${n.from.length}): ${n.from.join(', ')}`);
}

// 3. Hub: core dengan derajat tertinggi
P(`\n## C. Hub (core paling banyak terhubung)\n`);
const deg = core.map(c => {
  const inbound = core.filter(o => (o.links || []).some(l => l.key === c.key)).length;
  return { key: c.key, status: c.status, summary: c.summary, out: (c.links || []).length, in: inbound };
}).sort((a, b) => (b.in + b.out) - (a.in + a.out));
for (const d of deg.slice(0, 20)) {
  P(`- ${d.key} [${d.status}] total=${d.in + d.out} (in=${d.in}, out=${d.out}) — ${d.summary.slice(0, 95)}`);
}

// 4. Status rollup core
P(`\n## D. Status anak epic\n`);
const st = {};
for (const c of core) st[c.status] = (st[c.status] || 0) + 1;
for (const [k, v] of Object.entries(st).sort((a, b) => b[1] - a[1])) P(`- ${k}: ${v}`);

const outFile = path.resolve(__dirname, `../../explore-output/atlassian/analisa-${EPIC}.md`);
fs.writeFileSync(outFile, out.join('\n'));
console.log(out.join('\n'));
console.log(`\n→ ${outFile}`);
