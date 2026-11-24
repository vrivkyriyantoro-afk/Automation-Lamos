const fs = require('fs');
const path = require('path');

/**
 * Koreksi penandaan 8 TC CIF (TC-4889-54 s.d TC-4889-61) pada sheet tracking eksekusi.
 *
 * Alasan koreksi (verifikasi AC Jira 2026-11-02):
 * - Story pemilik fitur CIF Cash Collateral = S2CML-5445 (+ S2CML-4981 untuk inquiry account),
 *   BUKAN S2CML-5420 (itu Data Tambahan *non* Cash Collateral) dan bukan S2CML-4889.
 * - Kedua story masih `Ready to SIT` → fitur belum deploy, jadi bukan "SIT BUILD DISCREPANCY"
 *   (yang berarti build menyimpang dari desain), melainkan NOT TESTABLE YET.
 *
 * Penggunaan:
 *   node scripts/export-tc/fix-cif-tc-mapping.js          # dry-run, tampilkan perubahan
 *   node scripts/export-tc/fix-cif-tc-mapping.js --apply  # tulis perubahan
 */

const APPLY = process.argv.includes('--apply');
const FILE = path.resolve(__dirname, '../../fixtures/TemplateAutomateLamos - Sheet1.csv');
const TARGET = /^TC-4889-(5[4-9]|6[01])$/;

const NOTE_BY_TC = {
  'TC-4889-54': 'Figma 6124:461694 mensyaratkan input CIF muncul saat Ya; field CIF belum dirender di SIT.',
  'TC-4889-55': 'Figma 6124:461694 mensyaratkan tombol Cek aktif saat CIF terisi; field CIF belum dirender di SIT.',
  'TC-4889-56': 'Tergantung flow inquiry CIF yang belum tersedia di SIT.',
  'TC-4889-57': 'Tergantung flow inquiry CIF yang belum tersedia di SIT.',
  'TC-4889-58': 'Tergantung flow inquiry CIF yang belum tersedia di SIT.',
  'TC-4889-59': 'Tergantung flow inquiry CIF yang belum tersedia di SIT.',
  'TC-4889-60': 'Tergantung flow inquiry CIF yang belum tersedia di SIT.',
  'TC-4889-61': 'Figma 6124:461694 mensyaratkan input manual Instansi penerbit* muncul saat Tidak; rendering dinamis belum deploy.',
};

// Renomori ke story pemilik: TC-4889-54..61 -> TC-5445-01..08
const RENUMBER = {
  'TC-4889-54': 'TC-5445-01',
  'TC-4889-55': 'TC-5445-02',
  'TC-4889-56': 'TC-5445-03',
  'TC-4889-57': 'TC-5445-04',
  'TC-4889-58': 'TC-5445-05',
  'TC-4889-59': 'TC-5445-06',
  'TC-4889-60': 'TC-5445-07',
  'TC-4889-61': 'TC-5445-08',
};

const NEW_NOTE = tc =>
  `[RENOMORI 2026-11-02] ID lama: ${tc} (keliru masuk scope S2CML-4889). ` +
  `Story pemilik: S2CML-5445 (Detailing Form Data Tambahan - Cash Collaterals) ` +
  `dan S2CML-4981 (Automation get Deposito/Giro/Tabungan by CIF). Keduanya berstatus "Ready to SIT" per 2026-11-02 ` +
  `-> fitur belum deploy ke SIT, bukan penyimpangan build. Verifikasi AC: field CIF hanya muncul bila ` +
  `"Apakah agunan tersimpan di Bank Sinarmas?" = Ya pada jenis agunan F09/F10/F11/F15. ` +
  `Koreksi atas catatan lama yang menunjuk S2CML-5420 (itu Data Tambahan NON Cash Collateral). ` +
  `Catatan asli: ${NOTE_BY_TC[tc]}`;

// --- CSV parser/serializer minimal yang menghormati quoted field multi-baris ---
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\r') continue;
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const needsQuote = s => /[",\n\r]/.test(s);
const esc = s => (needsQuote(s) ? `"${s.replace(/"/g, '""')}"` : s);
const toCSV = rows => rows.map(r => r.map(esc).join(',')).join('\r\n') + '\r\n';

// --- main ---
const raw = fs.readFileSync(FILE, 'utf8');
const rows = parseCSV(raw);
const header = rows[0];

const idx = {
  tc: 0,
  status: header.findIndex(h => h.trim() === 'Status'),
  dok: header.findIndex(h => h.trim() === 'Status Dokumentasi'),
  notes: header.findIndex(h => h.trim() === 'Notes'),
};
if (idx.status < 0 || idx.dok < 0 || idx.notes < 0) {
  console.error('❌ Kolom Status / Status Dokumentasi / Notes tidak ditemukan.');
  process.exit(1);
}

let changed = 0;
for (const row of rows.slice(1)) {
  const tc = (row[idx.tc] || '').trim();
  if (!TARGET.test(tc)) continue;

  const before = { status: row[idx.status], dok: row[idx.dok] };
  row[idx.tc] = RENUMBER[tc];
  row[idx.status] = 'NOT TESTABLE YET';
  row[idx.dok] = 'FEATURE NOT DEPLOYED (S2CML-5445 / S2CML-4981 Ready to SIT)';
  row[idx.notes] = NEW_NOTE(tc);
  changed++;

  console.log(`${tc} -> ${RENUMBER[tc]}`);
  console.log(`   Status : ${before.status} -> ${row[idx.status]}`);
  console.log(`   Dok    : ${before.dok} -> ${row[idx.dok]}`);
}

console.log(`\n${changed} baris terdampak.`);

if (!APPLY) {
  console.log('DRY-RUN. Jalankan ulang dengan --apply untuk menulis perubahan.');
  process.exit(0);
}

const backup = path.resolve(__dirname, `../../explore-output/TemplateAutomateLamos-backup-before-cif-fix.csv`);
fs.writeFileSync(backup, raw, 'utf8');
fs.writeFileSync(FILE, toCSV(rows), 'utf8');
console.log(`✅ Ditulis. Backup: ${backup}`);
