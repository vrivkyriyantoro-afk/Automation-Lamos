const fs = require('fs');

const text = fs.readFileSync('fixtures/TemplateAutomateLamos - Sheet1.csv', 'utf8');

// Parser CSV sederhana yang menghormati field berkutip dan newline di dalamnya.
function parseCSV(str) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === '"') {
        if (str[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c !== '\r') field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(text);
const header = rows[0];
console.log('HEADER=' + JSON.stringify(header));

const buckets = {};
for (const r of rows) {
  const id = (r[0] || '').trim();
  if (!/^TC-\d+-\d+$/.test(id)) continue;

  // Cari kolom status: nilai seperti DONE / ON PROGRESS / BLOCKED, dan PASSED / NOT TESTED
  const cells = r.map(c => (c || '').trim());
  const progress = cells.find(c => /^(DONE|ON PROGRESS|BLOCKED)$/i.test(c)) || '?';
  const result = cells.find(c => /^(PASSED|FAILED|NOT TESTED|SIT BUILD DISCREPANCY)$/i.test(c)) || '?';

  const key = `${progress} / ${result}`;
  (buckets[key] = buckets[key] || []).push(id);
}

console.log('\n=== REKAP ===');
for (const [k, v] of Object.entries(buckets)) {
  console.log(`${k}  -> ${v.length} TC`);
  console.log('   ' + v.join(', '));
}
