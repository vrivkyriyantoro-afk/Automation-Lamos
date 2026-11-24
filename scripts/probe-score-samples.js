require('dotenv').config();

/** Probe READ-ONLY: contoh judul Defect per nilai Defect Score, untuk kalibrasi skala. */

const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const auth = 'Basic ' + Buffer.from(`${process.env.ATLASSIAN_EMAIL.trim()}:${process.env.ATLASSIAN_API_TOKEN.trim()}`).toString('base64');
const headers = { Authorization: auth, Accept: 'application/json' };

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} :: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

(async () => {
  for (const score of [0, 1, 2, 3, 5]) {
    const jql = encodeURIComponent(`project = S2CML AND issuetype = Defect AND "Defect Score" = ${score} ORDER BY created DESC`);
    const res = await get(`https://${domain}/rest/api/3/search/jql?jql=${jql}&maxResults=6&fields=summary`);
    console.log(`\n=== SCORE ${score} ===`);
    for (const i of res.issues || []) {
      console.log(`  ${i.key} | ${i.fields.summary.replace(/\s+/g, ' ').slice(0, 95)}`);
    }
  }
})().catch((e) => console.error('Gagal:', e.message));
