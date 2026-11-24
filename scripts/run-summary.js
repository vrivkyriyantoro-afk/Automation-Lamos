// Ringkas arsip run Playwright di run-history/: jumlah run, durasi, pass/fail.
// Pakai: node scripts/run-summary.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'run-history');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : [];
if (!files.length) { console.log('Belum ada arsip di run-history/. Jalankan test dulu.'); process.exit(0); }

const t = { runs: 0, ms: 0, expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
const defects = new Map(); // ID defect -> Set TC yang gagal karenanya

// Kumpulkan test gagal yang punya anotasi { type: 'defect' }
function walk(suite) {
  for (const s of suite.suites || []) walk(s);
  for (const spec of suite.specs || []) for (const test of spec.tests || []) {
    if (test.status !== 'unexpected') continue;
    for (const a of test.annotations || []) if (a.type === 'defect') {
      const id = (a.description || '').split(' ')[0];
      if (!defects.has(id)) defects.set(id, new Set());
      defects.get(id).add(spec.title.split(':')[0]);
    }
  }
}
for (const f of files) {
  try {
    const report = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = report.stats;
    // Lewati run tanpa eksekusi (mis. `--list` atau semua skip)
    if (!s || !((s.expected || 0) + (s.unexpected || 0) + (s.flaky || 0))) continue;
    t.runs++; t.ms += s.duration || 0;
    for (const k of ['expected', 'unexpected', 'flaky', 'skipped']) t[k] += s[k] || 0;
    for (const su of report.suites || []) walk(su);
  } catch { console.warn(`Lewati ${f}: JSON tidak valid`); }
}
const total = t.expected + t.unexpected + t.flaky + t.skipped;
console.log(`Run: ${t.runs}  |  Durasi total: ${(t.ms / 3.6e6).toFixed(2)} jam  |  Rata-rata/run: ${(t.ms / 60000 / (t.runs || 1)).toFixed(1)} menit`);
console.log(`Test dieksekusi: ${total}  |  Lolos: ${t.expected}  |  Gagal: ${t.unexpected}  |  Flaky: ${t.flaky}  |  Skip: ${t.skipped}`);
console.log(`Defect terdeteksi lewat run otomatis: ${defects.size}`);
for (const [id, tcs] of defects) console.log(`  ${id}: ${[...tcs].join(', ')}`);
