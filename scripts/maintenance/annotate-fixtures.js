const fs = require('fs');

function parseCSV(str) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQ) {
      if (c === '"') { if (str[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c !== '\r') field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toCSV(rows) {
  return rows.map(r => r.map(f => {
    const s = String(f ?? '');
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

// Pemetaan nomor lama -> nomor baru setelah S2CML-4889 dirampingkan jadi 19 TC.
const MAP = {
  62: 'TC-4948-17',
  63: 'TC-4948-17',
  64: 'TC-4949-18',
  65: 'TC-4949-18',
  66: 'TC-4948-07',
  67: 'TC-4948-01',
  68: 'TC-4948-11',
  69: 'TC-4948-11',
  70: 'TC-4949-01',
  71: 'TC-4949-02',
  72: 'TC-4948-07',
  73: 'TC-4948-07 / TC-4948-18',
  74: 'TC-4948-03',
  75: 'TC-4948-15 / TC-4948-18',
  76: 'TC-4948-11',
  77: 'TC-4949-04',
  78: 'TC-4949-08',
  79: 'TC-4948-08 / TC-4948-09 / TC-4948-16 / TC-4890-BU-03',
  80: 'TC-4890-BU-01',
  81: 'TC-4948-04 / TC-4890-BU-01',
  82: 'TC-4948-13 / TC-4890-BU-02',
};

// Modul 2-8 di luar scope 4889 setelah perampingan; story payung per rentang nomor.
function storyPayung(n) {
  if (n >= 20 && n <= 35) return 'S2CML-5419 / S2CML-4890';
  if (n >= 36 && n <= 48) return 'S2CML-4890 / S2CML-6756';
  if (n >= 49 && n <= 61) return 'S2CML-5420';
  if (n >= 62) return 'S2CML-4948 / S2CML-4949 / S2CML-4890';
  return null;
}

const file = process.argv[2];
const rows = parseCSV(fs.readFileSync(file, 'utf8'));
const header = rows[0].map(h => h.replace(/^﻿+/, '').trim());
const iNotes = header.findIndex(h => /^Notes$/i.test(h));
if (iNotes < 0) throw new Error('kolom Notes tidak ditemukan');

const PREFIX = '[DILUAR SCOPE S2CML-4889 setelah perampingan 2026-11-01]';
let diubah = 0;

for (const r of rows) {
  const id = (r[0] || '').trim();
  if (!/^TC-4889-\d+$/.test(id)) continue;
  const n = parseInt(id.split('-')[2], 10);
  if (n <= 19) continue; // 19 TC murni scope 4889, biarkan apa adanya

  while (r.length <= iNotes) r.push('');
  const lama = (r[iNotes] || '').trim();
  if (lama.startsWith(PREFIX)) continue; // idempoten

  const anotasi = MAP[n]
    ? `${PREFIX} Dinomori ulang menjadi ${MAP[n]}.`
    : `${PREFIX} Dicakup story payung ${storyPayung(n)}.`;

  r[iNotes] = lama ? `${anotasi} Catatan asli: ${lama}` : anotasi;
  diubah++;
}

// Koreksi klaim yang belum tervalidasi pada TC-4889-62 (toast oranye tidak pernah diverifikasi).
for (const r of rows) {
  if ((r[0] || '').trim() !== 'TC-4889-62') continue;
  r[iNotes] = (r[iNotes] || '').replace(
    'toast oranye tidak dirender di build SIT',
    'toast oranye BELUM TERVALIDASI (frasa hanya ada di CSV ini, tidak di Jira AC maupun Figma; prekondisi "data debitur belum lengkap" belum diverifikasi)'
  );
}

fs.writeFileSync(file, toCSV(rows), 'utf8');
console.log(`Baris dianotasi: ${diubah}`);
