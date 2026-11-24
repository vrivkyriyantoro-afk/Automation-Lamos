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

const files = process.argv.slice(2);
for (const f of files) {
  const rows = parseCSV(fs.readFileSync(f, 'utf8'));
  const header = rows[0].map(h => h.replace(/^﻿+/, '').trim());
  const idIdx = 0;
  const titleIdx = header.findIndex(h => /judul|title|description/i.test(h));
  console.log(`\n=== ${path.basename(f)} ===`);
  for (const r of rows.filter(r => /^TC-\d+/.test((r[idIdx] || '').trim()))) {
    console.log(`${r[idIdx].trim()} | ${(r[titleIdx] || '').trim()}`);
  }
}
