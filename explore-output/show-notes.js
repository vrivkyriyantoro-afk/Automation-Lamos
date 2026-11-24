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
const iNotes = header.findIndex(h => /^Notes$/i.test(h));
const iPic = header.findIndex(h => /^PIC$/i.test(h));

for (const r of rows.filter(r => /^TC-\d+-\d+$/.test((r[0] || '').trim()))) {
  const n = parseInt(r[0].trim().split('-')[2], 10);
  if (n >= 60 && n <= 70) {
    console.log(`${r[0].trim()} | PIC=${(r[iPic]||'').trim()} | NOTES="${(r[iNotes]||'').trim().slice(0,160)}"`);
  }
}
