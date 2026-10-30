/**
 * Generator page object per section dari hasil explore (explore-output/<bucket>.json).
 *
 *   node scripts/generate-pages.js            # tulis file yang belum ada
 *   node scripts/generate-pages.js --force    # timpa file hasil generate sebelumnya
 *   node scripts/generate-pages.js --only=data_usaha,struktur_kredit
 *
 * Output: pages/bucket<Nama>/<Section>Section.ts, <Trigger>Modal.ts, dan sections.ts (index).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IN_DIR = path.join(ROOT, process.env.EXPLORE_OUT || 'explore-output');
const PAGES_DIR = path.join(ROOT, 'pages');
const FORCE = process.argv.includes('--force');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);

/** bucket id -> folder. Bucket tanpa entri tidak di-generate. */
const BUCKET_FOLDERS = {
  identitas_pengecekan: 'bucketIdentitas',
  struktur_kredit: 'bucketStrukturKredit',
  penilaian_kelayakan: 'bucketPenilaianKelayakan',
  data_usaha: 'bucketDataUsaha',
  analisa_keuangan: 'bucketAnalisaKeuangan',
  legal_risk_compliance: 'bucketLegalRiskCompliance',
  covenant_tbo: 'bucketCovenantTBO',
  penyimpangan_pihak_terkait: 'bucketPenyimpanganPihakTerkait',
  catatan_anda: 'bucketCatatanAnda',
  // collateral (Agunan): di-skip sementara
  // dokumen: ditulis manual dari explore-output/dokumen-tree.json
};

const INPUT_KINDS = ['text', 'textarea', 'currency', 'date', 'dropdown', 'radio', 'file', 'checkbox', 'richtext'];
const RESERVED = new Set(['page', 'root', 'form', 'title', 'bucket', 'header', 'open', 'button', 'fill', 'sidebarTitle', 'isExpanded', 'constructor', 'criteria']);
const CASCADE = /(province|city|district|subdistrict|regency|village)$/i;
const MAX_UNION = 40;

const words = s => String(s || '')
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[^A-Za-z0-9]+/g, ' ')
  .trim().split(/\s+/).filter(Boolean);
const pascal = s => words(s).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
const camel = s => { const p = pascal(s); return p ? p[0].toLowerCase() + p.slice(1) : ''; };
const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const safeIdent = s => (/^[0-9]/.test(s) ? `f${s}` : s);

function fieldKey(f) {
  if (f.kind === 'radio' || f.kind === 'richtext' || f.kind === 'checkbox') return camel(words(f.label).slice(0, 6).join(' '));
  if (f.kind === 'file') return camel(f.id || f.label);
  return camel(f.name || f.key || f.label);
}

function tsType(f) {
  switch (f.kind) {
    case 'currency': return 'number | string';
    case 'file': return 'string | string[]';
    case 'checkbox': return 'boolean';
    case 'radio': return f.options?.length ? f.options.map(o => q(o.label)).join(' | ') : 'string';
    case 'dropdown': {
      const opts = f.options || [];
      if (!opts.length || opts.length > MAX_UNION || CASCADE.test(f.key || '')) return 'string';
      return [...new Set(opts)].map(q).join(' | ');
    }
    default: return 'string';
  }
}

function control(f) {
  switch (f.kind) {
    case 'text': case 'textarea': return { cls: 'TextInput', arg: q(f.name) };
    case 'currency': return { cls: 'CurrencyInput', arg: q(f.name) };
    case 'date': return { cls: 'DateInput', arg: q(f.name) };
    case 'dropdown': return { cls: 'Dropdown', arg: q(f.key) };
    case 'radio': return { cls: 'RadioGroup', arg: q(f.label) };
    case 'file': return { cls: 'FileUpload', arg: q(f.id) };
    case 'checkbox': return { cls: 'Checkbox', arg: q(f.label) };
    case 'richtext': return { cls: 'RichTextEditor', arg: q(f.id || 'rich-text-editor') };
  }
}

function action(f, prop) {
  switch (f.kind) {
    case 'dropdown': case 'radio': return `await this.${prop}.select(data.${prop});`;
    case 'file': return `await this.${prop}.upload(data.${prop});`;
    case 'checkbox': return `await this.${prop}.set(data.${prop});`;
    default: return `await this.${prop}.fill(data.${prop});`;
  }
}

function doc(f) {
  const bits = [`${f.label || '(tanpa label)'}${f.required ? '*' : ''}`, `[${f.kind}]`];
  if (f.subsection) bits.push(`- ${f.subsection}`);
  if (f.disabled) bits.push('(disabled saat explore / auto-fill)');
  if (f.kind === 'date') bits.push('format "DD MMM YYYY", mis. "01 Jan 1990"');
  if (f.suffix) bits.push(`satuan: ${f.suffix}`);
  if (f.kind === 'dropdown' && f.options?.length > MAX_UNION) bits.push(`${f.options.length}+ opsi, contoh: ${f.options.slice(0, 3).join(', ')}`);
  if (f.kind === 'dropdown' && CASCADE.test(f.key || '')) bits.push('opsi bergantung dropdown sebelumnya');
  if (f.kind === 'file' && f.accept) bits.push(`accept: ${f.accept}`);
  return bits.join(' ');
}

/** Normalisasi field dari JSON explore: buang tombol/tabel, field tanpa identitas, duplikat */
function inputFields(fields) {
  const seen = new Set();
  const out = [];
  for (const f of fields || []) {
    if (!INPUT_KINDS.includes(f.kind)) continue;
    if (f.kind === 'dropdown' && /^react-select/.test(f.key || '')) continue; // ditangani CriteriaTable
    if (['text', 'textarea', 'currency', 'date'].includes(f.kind) && !f.name) continue;
    if (f.kind === 'dropdown' && !f.key) continue;
    if (f.kind === 'radio' && !f.label) continue;
    const ident = `${f.kind}:${f.name || f.key || f.id || f.label}`;
    if (seen.has(ident)) continue;
    seen.add(ident);
    out.push(f);
  }
  return out;
}

function assignProps(fields) {
  const used = new Set();
  return fields.map(f => {
    let base = safeIdent(fieldKey(f) || f.kind);
    if (RESERVED.has(base)) base = `field${base[0].toUpperCase()}${base.slice(1)}`;
    let name = base, i = 2;
    while (used.has(name)) name = `${base}${i++}`;
    used.add(name);
    return { f, prop: name };
  });
}

/**
 * Field berulang per baris (nama berindeks), mis. "usahaArray.0.dataUsaha.1.name" atau "supplierType-1".
 * Indeks TERAKHIR dianggap nomor baris.
 */
function indexInfo(f) {
  const id = f.name || f.key || '';
  let m = id.match(/^(.*)\.(\d+)\.(.+)$/);
  if (m) {
    const arrayName = m[1].split('.').pop();
    return { arrayName, tail: m[3], template: `${m[1]}.\${this.index}.${m[3]}` };
  }
  m = id.match(/^(.*)-(\d+)$/);
  if (m && f.kind === 'dropdown') return { arrayName: m[1], tail: m[1], template: `${m[1]}-\${this.index}` };
  return null;
}

/** Kelompokkan field berindeks menjadi row group; tombol tambah inline jadi trigger-nya */
function buildRowGroups(baseFields, inlineEntries) {
  const indexed = [...baseFields, ...inlineEntries.flatMap(e => e.newFields)].map(f => ({ f, info: indexInfo(f) })).filter(x => x.info);
  const groups = [];
  for (const e of inlineEntries) {
    const names = e.newFields.map(indexInfo).filter(Boolean).map(i => i.arrayName);
    if (!names.length) continue;
    const freq = {}; names.forEach(n => (freq[n] = (freq[n] || 0) + 1));
    const main = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    groups.push({ name: main, arrayNames: new Set(names), trigger: e.trigger, items: [] });
  }
  for (const x of indexed) {
    let g = groups.find(g => g.arrayNames.has(x.info.arrayName));
    if (!g) { g = { name: x.info.arrayName, arrayNames: new Set([x.info.arrayName]), items: [] }; groups.push(g); }
    g.items.push(x);
  }
  for (const g of groups) {
    const seen = new Set();
    g.items = g.items.filter(x => {
      if (x.f.kind === 'radio') return false; // radio tidak punya name berindeks
      const k = `${x.f.kind}:${x.info.template}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    // label sel tabel sering tidak akurat (diambil dari baris lain) -> pakai nama field bila label ganda
    const labelCount = {}; g.items.forEach(x => (labelCount[x.f.label] = (labelCount[x.f.label] || 0) + 1));
    g.items.forEach(x => { if (!x.f.label || labelCount[x.f.label] > 1) x.f = { ...x.f, label: x.info.tail }; });
  }
  return groups.filter(g => g.items.length);
}

function renderRowClass(lines, rowClass, rowData, g) {
  const used = new Set();
  const props = g.items.map(x => {
    let base = safeIdent(camel(x.info.tail) || x.f.kind);
    if (['root', 'index', 'fill', 'exists'].includes(base)) base = `field${base[0].toUpperCase()}${base.slice(1)}`;
    let name = base, i = 2;
    while (used.has(name)) name = `${base}${i++}`;
    used.add(name);
    return { ...x, prop: name };
  });
  lines.push(`export interface ${rowData} {`);
  for (const { f, prop } of props) {
    lines.push(`  /** ${doc(f)} */`);
    lines.push(`  ${prop}?: ${tsType(f)};`);
  }
  lines.push('}');
  lines.push('');
  lines.push(`/** Satu baris "${g.name}" (indeks 0-based)${g.trigger ? `; baris baru via tombol "${g.trigger}"` : ''} */`);
  lines.push(`export class ${rowClass} {`);
  lines.push('  constructor(readonly root: Locator, readonly index: number) {}');
  lines.push('');
  for (const { f, prop, info } of props) {
    const c = control(f);
    lines.push(`  /** ${doc(f)} */`);
    lines.push(`  get ${prop}() { return new ${c.cls}(this.root, \`${info.template}\`); }`);
  }
  lines.push('');
  lines.push('  /** true jika baris ini sudah ada di UI */');
  lines.push(`  async exists() { return (await this.${props[0].prop}.locator.count()) > 0; }`);
  lines.push('');
  lines.push(`  async fill(data: ${rowData}) {`);
  for (const { f, prop } of props) lines.push(`    if (data.${prop} !== undefined) ${action(f, prop)}`);
  lines.push('  }');
  lines.push('}');
  lines.push('');
  return props;
}

function renderClass({ className, dataName, baseClass, bucket, title, sidebarTitle, fields, hasCriteria, note, source, rowGroups = [] }) {
  const props = assignProps(fields.filter(f => !indexInfo(f)));
  const rowProps = rowGroups.map(g => {
    let prop = safeIdent(camel(g.name));
    if (RESERVED.has(prop) || props.some(p => p.prop === prop)) prop = `${prop}Row`;
    return { g, prop, rowClass: `${className.replace(/(Section|Modal)$/, '')}${pascal(g.name)}Row` };
  });
  const classes = [...new Set([...props.map(p => control(p.f).cls), ...rowGroups.flatMap(g => g.items.map(x => control(x.f).cls))])];
  if (hasCriteria) classes.push('CriteriaTable');
  const lines = [];
  lines.push(`// AUTO-GENERATED oleh scripts/generate-pages.js dari ${source}.`);
  lines.push(`// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.`);
  lines.push(`import { ${rowGroups.length ? 'Locator, ' : ''}Page } from '@playwright/test';`);
  lines.push(`import { ${baseClass}${baseClass === 'BucketSection' ? ', BucketId' : ''} } from '../components/BucketSection';`);
  if (classes.length) lines.push(`import { ${classes.sort().join(', ')} } from '../components/FormControls';`);
  lines.push('');
  for (const r of rowProps) renderRowClass(lines, r.rowClass, `${r.rowClass}Data`, r.g);
  if (props.length || rowProps.length) {
    lines.push(`export interface ${dataName} {`);
    for (const { f, prop } of props) {
      lines.push(`  /** ${doc(f)} */`);
      lines.push(`  ${prop}?: ${tsType(f)};`);
    }
    for (const r of rowProps) {
      lines.push(`  /** Baris "${r.g.name}"; elemen ke-i mengisi baris ke-i${r.g.trigger ? ` (otomatis klik "${r.g.trigger}" bila baris belum ada)` : ''} */`);
      lines.push(`  ${r.prop}?: ${r.rowClass}Data[];`);
    }
    lines.push('}');
    lines.push('');
  }
  lines.push('/**');
  lines.push(` * ${baseClass === 'ModalForm' ? 'Modal' : 'Section'} "${title}"${bucket ? ` - bucket ${bucket}` : ''}`);
  if (note) lines.push(` * ${note}`);
  lines.push(' */');
  lines.push(`export class ${className} extends ${baseClass} {`);
  if (baseClass === 'BucketSection') lines.push(`  readonly bucket: BucketId = ${q(bucket)};`);
  lines.push(`  readonly title = ${q(title)};`);
  if (sidebarTitle) lines.push(`  readonly sidebarTitle = ${q(sidebarTitle)};`);
  if (props.length || hasCriteria || rowProps.length) lines.push('');
  for (const { f, prop } of props) {
    const c = control(f);
    lines.push(`  /** ${doc(f)} */`);
    lines.push(`  get ${prop}() { return new ${c.cls}(this.root, ${c.arg}); }`);
  }
  for (const r of rowProps) {
    lines.push(`  /** Baris "${r.g.name}" ke-index (0-based) */`);
    lines.push(`  ${r.prop}(index: number) { return new ${r.rowClass}(this.root, index); }`);
  }
  if (hasCriteria) {
    lines.push('  /** Tabel kriteria Pass/fail (react-select per baris) */');
    lines.push('  get criteria() { return new CriteriaTable(this.root); }');
  }
  lines.push('');
  lines.push('  constructor(page: Page) {');
  lines.push('    super(page);');
  lines.push('  }');
  if (props.length || rowProps.length) {
    lines.push('');
    lines.push(`  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */`);
    lines.push(`  async fill(data: ${dataName}) {`);
    for (const { f, prop } of props) {
      lines.push(`    if (data.${prop} !== undefined) ${action(f, prop)}`);
    }
    for (const r of rowProps) {
      lines.push(`    for (const [i, row] of (data.${r.prop} ?? []).entries()) {`);
      if (r.g.trigger) lines.push(`      if (!(await this.${r.prop}(i).exists())) await this.button(${q(r.g.trigger)}).click();`);
      lines.push(`      await this.${r.prop}(i).fill(row);`);
      lines.push('    }');
    }
    lines.push('  }');
  }
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

function writeFile(file, content, written) {
  if (fs.existsSync(file) && !FORCE) {
    const existing = fs.readFileSync(file, 'utf8');
    if (!existing.startsWith('// AUTO-GENERATED')) {
      console.warn(`  ! lewati ${path.relative(ROOT, file)} (file manual, tidak ditimpa)`);
      return false;
    }
    if (existing === content) { written.push(path.basename(file)); return true; }
    console.warn(`  ! lewati ${path.relative(ROOT, file)} (sudah ada; pakai --force untuk menimpa)`);
    written.push(path.basename(file));
    return false;
  }
  fs.writeFileSync(file, content);
  written.push(path.basename(file));
  console.log(`  + ${path.relative(ROOT, file)}`);
  return true;
}

function main() {
  for (const [bucket, folder] of Object.entries(BUCKET_FOLDERS)) {
    if (ONLY.length && !ONLY.includes(bucket)) continue;
    const src = path.join(IN_DIR, `${bucket}.json`);
    if (!fs.existsSync(src)) { console.warn(`(tidak ada ${src}, lewati)`); continue; }
    const json = JSON.parse(fs.readFileSync(src, 'utf8'));
    const dir = path.join(PAGES_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`\n[${bucket}] -> pages/${folder}`);
    const sidebarTitles = (json.sidebar || []).map(s => s.title);
    const written = [];
    const usedClass = new Set();
    const baseBySection = {};
    for (const s of json.sections || []) if (!s.trigger && s.section) baseBySection[s.section] = s.fields || [];
    const inlineBySection = {};
    for (const s of json.sections || []) {
      if (!s.trigger || s.modal !== false) continue;
      const parent = s.section.split(' > ')[0];
      const baseIds = new Set((baseBySection[parent] || []).map(f => `${f.kind}:${f.name || f.key || f.label}`));
      const newFields = inputFields(s.fields).filter(f => !baseIds.has(`${f.kind}:${f.name || f.key || f.label}`));
      (inlineBySection[parent] = inlineBySection[parent] || []).push({ trigger: s.trigger, newFields });
    }

    for (const s of json.sections || []) {
      if (s.skipped || !s.section || s.section === '(content)') continue;
      const isModal = !!s.trigger;
      if (isModal && s.modal === false) continue; // tombol tambah tanpa modal: tidak ada form terpisah
      const leaf = isModal ? (s.title || s.trigger) : s.section.split(' > ').pop();
      let className = pascal(leaf.replace(/^\+\s*/, '')) + (isModal ? 'Modal' : 'Section');
      while (usedClass.has(className)) className = className.replace(/(Section|Modal)$/, '2$1');
      usedClass.add(className);
      const fields = inputFields(s.fields);
      const hasCriteria = (s.fields || []).some(f => f.kind === 'dropdown' && /^react-select/.test(f.key || ''));
      const sidebarTitle = isModal ? undefined : sidebarTitles.find(t => t.toLowerCase() === leaf.toLowerCase());
      let note;
      if (isModal) note = `Dibuka dari tombol "${s.trigger}" di section "${s.section.split(' > ')[0]}".`;
      else if (!fields.length && !hasCriteria) note = 'Belum ada field input saat explore (konten bergantung data / list kosong).';
      const content = renderClass({
        className,
        dataName: className.replace(/(Section|Modal)$/, '') + (isModal ? 'ModalData' : 'Data'),
        baseClass: isModal ? 'ModalForm' : 'BucketSection',
        bucket,
        title: isModal ? (s.title || s.trigger) : leaf,
        sidebarTitle,
        fields,
        hasCriteria,
        note,
        source: `explore-output/${bucket}.json`,
        rowGroups: isModal ? [] : buildRowGroups(fields, inlineBySection[s.section] || []),
      });
      writeFile(path.join(dir, `${className}.ts`), content, written);
    }

    const index = '// AUTO-GENERATED oleh scripts/generate-pages.js\n'
      + written.map(f => `export * from './${f.replace(/\.ts$/, '')}';`).join('\n') + '\n';
    const indexFile = path.join(dir, 'sections.ts');
    if (!fs.existsSync(indexFile) || FORCE || fs.readFileSync(indexFile, 'utf8').startsWith('// AUTO-GENERATED')) {
      fs.writeFileSync(indexFile, index);
      console.log(`  + ${path.relative(ROOT, indexFile)}`);
    }
  }
}

main();
