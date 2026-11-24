const fs = require('fs');
const path = require('path');

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

const dir = 'exports';
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.csv'))) {
  const rows = parseCSV(fs.readFileSync(path.join(dir, f), 'utf8'));
  const header = rows[0].map(h => h.replace(/^﻿+/, '').trim());
  const tcRows = rows.filter(r => /^TC-\d+-\d+$/.test((r[0] || '').trim()));

  const titleIdx = header.findIndex(h => /judul|title|description/i.test(h));
  const titles = tcRows.map(r => (r[titleIdx] || '').trim());
  const withValidasi = titles.filter(t => /^Validasi/i.test(t)).length;

  console.log(`\n=== ${f} ===`);
  console.log(`header: ${JSON.stringify(header)}`);
  console.log(`total TC: ${tcRows.length} | judul diawali "Validasi": ${withValidasi}/${tcRows.length}`);
  const bad = titles.filter(t => !/^Validasi/i.test(t));
  if (bad.length) console.log(`  TIDAK diawali Validasi (${bad.length}): ${JSON.stringify(bad.slice(0, 5))}`);
}
