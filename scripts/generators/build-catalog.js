#!/usr/bin/env node
/**
 * Bangun katalog locator dari page object di pages/buckets/**.
 * Output (deterministik, aman di-commit):
 *   pages/catalog/catalog.json  -> untuk mesin (generate TC, step Gherkin, audit)
 *   pages/catalog/CATALOG.md    -> untuk dibaca manusia
 *
 * Sumber kebenaran tetap page object (*.ts). Katalog TIDAK diedit manual:
 *   node scripts/generators/build-catalog.js           # tulis ulang katalog
 *   node scripts/generators/build-catalog.js --check   # exit 1 bila katalog basi (untuk CI)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const BUCKETS_DIR = path.join(ROOT, 'pages', 'buckets');
const OUT_DIR = path.join(ROOT, 'pages', 'catalog');
const CHECK = process.argv.includes('--check');

/** Rumus locator tiap kontrol (cermin pages/controls/FormControls.ts). {k} = kunci field. */
const CONTROLS = {
  TextInput:      { type: 'text',     locator: 'input[name="{k}"], textarea[name="{k}"]' },
  CurrencyInput:  { type: 'currency', locator: 'input[name="{k}"]  (ketik digit, format ribuan otomatis)' },
  DateInput:      { type: 'date',     locator: 'input[name="{k}"]  (format "DD MMM YYYY", mis. "01 Jan 1990")' },
  Dropdown:       { type: 'dropdown', locator: '[role="combobox"][id^="{k}-r"]  (opsi: #<id>-listbox li button)' },
  RadioGroup:     { type: 'radio',    locator: 'getByRole("radiogroup", { name: "{k}" })' },
  FileUpload:     { type: 'file',     locator: 'input[type="file"][id="{k}"]' },
  Checkbox:       { type: 'checkbox', locator: '[data-testid="checkbox-container"] berlabel "{k}"' },
  RichTextEditor: { type: 'richtext', locator: '[contenteditable="true"][id="{k}"]' },
  CriteriaTable:  { type: 'table',    locator: 'table[data-testid="table"]' },
};

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const stripQuotes = s => s.trim().replace(/^[`'"]|[`'"]$/g, '');

function parseFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const bucketFolder = rel.split('/')[2];
  const text = fs.readFileSync(file, 'utf8');
  const classes = [];
  let cur = null;
  let doc = '';
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    let m;
    if ((m = line.match(/^export class (\w+)/))) {
      const name = m[1];
      const kind = /Row$/.test(name) ? 'row' : /Modal$/.test(name) ? 'modal' : /Form$/.test(name) ? 'form' : 'section';
      cur = { class: name, kind, bucketId: '', title: '', sidebarTitle: '', fields: [] };
      classes.push(cur);
      doc = '';
      continue;
    }
    if (!cur) continue;
    if ((m = line.match(/^readonly bucket: BucketId = '([^']+)'/))) cur.bucketId = m[1];
    else if ((m = line.match(/^readonly title = '(.*)';/))) cur.title = m[1].replace(/\\'/g, "'");
    else if ((m = line.match(/^readonly sidebarTitle = '(.*)';/))) cur.sidebarTitle = m[1].replace(/\\'/g, "'");
    else if ((m = line.match(/^\/\*\*\s*(.*?)\s*\*\/$/))) doc = m[1];
    else if ((m = line.match(/^get (\w+)\(\)\s*\{\s*return new (\w+)\((?:this\.root|this\.page|[^,)]+?)(?:,\s*(.+?))?\)\s*;?\s*\}/))) {
      const [, prop, control, keyExpr = ''] = m;
      const spec = CONTROLS[control];
      if (!spec) { doc = ''; continue; }
      const key = stripQuotes(keyExpr.replace(/,\s*.*$/, ''))
        .replace(/\$\{this\.index\}/g, '{i}');
      const dm = doc.match(/^(.*?)\s*\[(\w+)\](?:\s*-\s*(.*))?$/);
      const label = (dm ? dm[1] : doc).trim();
      cur.fields.push({
        prop,
        label: label.replace(/\*$/, '').trim(),
        required: /\*$/.test(label),
        type: spec.type,
        control,
        key,
        locator: spec.locator.replace(/\{k\}/g, key),
        group: dm && dm[3] ? dm[3].trim() : '',
      });
      doc = '';
    } else if (line && !line.startsWith('*') && !line.startsWith('//')) {
      // komentar doc hanya berlaku untuk getter tepat sesudahnya
      if (!/^get /.test(line)) doc = '';
    }
  }
  return classes
    .filter(c => c.fields.length)
    .map(c => ({ ...c, file: rel, bucketFolder }));
}

function build() {
  const files = walk(BUCKETS_DIR)
    .filter(f => /\.ts$/.test(f) && !/[\\/]sections\.ts$/.test(f) && !/[\\/]legacy[\\/]/.test(f))
    .sort();
  const all = files.flatMap(parseFile);
  const buckets = {};
  for (const c of all) (buckets[c.bucketFolder] ||= []).push(c);
  const catalog = {
    note: 'DIGENERATE oleh scripts/generators/build-catalog.js dari pages/buckets/**. Jangan edit manual.',
    controls: CONTROLS,
    buckets: Object.fromEntries(Object.keys(buckets).sort().map(b => [b, buckets[b].map(c => ({
      class: c.class, kind: c.kind, bucketId: c.bucketId, title: c.title, sidebarTitle: c.sidebarTitle, file: c.file, fields: c.fields,
    }))])),
  };
  return catalog;
}

function toMarkdown(cat) {
  const esc = s => String(s).replace(/\|/g, '\\|');
  const out = [];
  out.push('# Katalog Locator Komponen LAMOS', '');
  out.push('> DIGENERATE oleh `scripts/generators/build-catalog.js` dari `pages/buckets/**`. Jangan edit manual.');
  out.push('> Sumber kebenaran = page object (`*.ts`). Ubah di sana, lalu jalankan `npm run catalog:build`.', '');
  out.push('## Cara pakai untuk menyusun test case', '');
  out.push('- Cari bucket, lalu section, lalu field. Kolom **Wajib** (tanda `*` di UI), **Tipe**, dan **Label** dipakai untuk menulis skenario (positif, negatif, boundary, wajib isi).');
  out.push('- Kolom **Locator** adalah selector yang dipakai otomatisasi. Jangan menulis selector sendiri di spec; pakai getter di kolom **Properti** pada class-nya.');
  out.push('- `{i}` pada kunci = indeks baris (0-based) untuk field berulang (tombol "Tambah baris").', '');
  out.push('## Rumus locator per kontrol', '', '| Kontrol | Tipe | Locator |', '|---|---|---|');
  for (const [k, v] of Object.entries(cat.controls)) out.push(`| \`${k}\` | ${v.type} | \`${esc(v.locator)}\` |`);
  out.push('');
  let total = 0;
  for (const [b, classes] of Object.entries(cat.buckets)) {
    out.push(`## ${b}`, '');
    for (const c of classes) {
      total += c.fields.length;
      const head = c.title || c.class;
      out.push(`### ${head}  \`${c.class}\` (${c.kind})`, '');
      out.push(`File: \`${c.file}\`${c.bucketId ? `  | bucket id: \`${c.bucketId}\`` : ''}`, '');
      out.push('| Properti | Label | Wajib | Tipe | Kunci | Grup |', '|---|---|---|---|---|---|');
      for (const f of c.fields) out.push(`| \`${f.prop}\` | ${esc(f.label)} | ${f.required ? 'ya' : ''} | ${f.type} | \`${esc(f.key)}\` | ${esc(f.group)} |`);
      out.push('');
    }
  }
  out.push('---', `Total: ${Object.values(cat.buckets).reduce((n, a) => n + a.length, 0)} class, ${total} field.`, '');
  return out.join('\n');
}

const cat = build();
const json = JSON.stringify(cat, null, 2) + '\n';
const md = toMarkdown(cat);
const jsonPath = path.join(OUT_DIR, 'catalog.json');
const mdPath = path.join(OUT_DIR, 'CATALOG.md');

if (CHECK) {
  const norm = s => s.replace(/\r\n/g, '\n');
  const same = f => fs.existsSync(f) && norm(fs.readFileSync(f, 'utf8'));
  const ok = same(jsonPath) === norm(json) && same(mdPath) === norm(md);
  console.log(ok ? 'Katalog up-to-date.' : 'Katalog BASI. Jalankan: npm run catalog:build');
  process.exit(ok ? 0 : 1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(jsonPath, json);
fs.writeFileSync(mdPath, md);
const n = Object.values(cat.buckets).flat().reduce((s, c) => s + c.fields.length, 0);
console.log(`Katalog: ${Object.keys(cat.buckets).length} bucket, ${Object.values(cat.buckets).flat().length} class, ${n} field -> pages/catalog/`);
