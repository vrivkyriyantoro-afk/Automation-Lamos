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

const file = process.argv[2];
const ids = process.argv.slice(3);
const rows = parseCSV(fs.readFileSync(file, 'utf8'));
const header = rows[0].map(h => h.replace(/^﻿+/, '').trim());

for (const r of rows) {
  const id = (r[0] || '').trim();
  if (!ids.includes(id)) continue;
  console.log(`\n########## ${id} ##########`);
  header.forEach((h, i) => {
    const v = (r[i] || '').trim();
    if (v) console.log(`--- ${h} ---\n${v}`);
  });
}
