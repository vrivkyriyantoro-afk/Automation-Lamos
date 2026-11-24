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

const rows = parseCSV(fs.readFileSync(process.argv[2], 'utf8'));
const header = rows[0].map(h => h.replace(/^﻿+/, '').trim());
const iStatus = header.findIndex(h => /^Status$/i.test(h));
const iDok = header.findIndex(h => /Status Dokumentasi/i.test(h));
const iNotes = header.findIndex(h => /^Notes$/i.test(h));

console.log('HEADER:', JSON.stringify(header));

const tc = rows.filter(r => /^TC-\d+-\d+$/.test((r[0] || '').trim()));
console.log(`Total TC rows: ${tc.length}`);

const byStatus = {};
for (const r of tc) {
  const s = (r[iStatus] || '(kosong)').trim() || '(kosong)';
  byStatus[s] = (byStatus[s] || 0) + 1;
}
console.log('Status:', JSON.stringify(byStatus, null, 2));

// Rentang nomor
const nums = tc.map(r => parseInt(r[0].trim().split('-')[2], 10)).sort((a, b) => a - b);
console.log(`Rentang nomor: ${nums[0]} .. ${nums[nums.length - 1]}`);

console.log('\n--- Baris 62..82 (yang dipindahkan ke story lain) ---');
for (const r of tc) {
  const n = parseInt(r[0].trim().split('-')[2], 10);
  if (n >= 62 && n <= 82) {
    console.log(`${r[0].trim()} | status=${(r[iStatus]||'').trim()} | dok=${(r[iDok]||'').trim()} | ${(r[1]||'').trim().slice(0, 70)}`);
  }
}
