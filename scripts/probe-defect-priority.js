require('dotenv').config();

/** Probe READ-ONLY: sebaran priority seluruh Defect S2CML + contoh isi tiap score. */

const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const auth = 'Basic ' + Buffer.from(`${process.env.ATLASSIAN_EMAIL.trim()}:${process.env.ATLASSIAN_API_TOKEN.trim()}`).toString('base64');
const headers = { Authorization: auth, Accept: 'application/json' };
const CF_SCORE = 'customfield_10275';
const CF_CLASS = 'customfield_10653';

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} :: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

(async () => {
  // Sebaran priority & classification seluruh Defect
  const jql = encodeURIComponent('project = S2CML AND issuetype = Defect ORDER BY created DESC');
  const res = await get(
    `https://${domain}/rest/api/3/search/jql?jql=${jql}&maxResults=100&fields=priority,${CF_SCORE},${CF_CLASS}`
  );
  const issues = res.issues || [];
  console.log(`Total Defect diperiksa: ${issues.length}\n`);

  const prio = {}, kelas = {}, skor = {};
  for (const i of issues) {
    const p = i.fields.priority?.name || '(kosong)';
    prio[p] = (prio[p] || 0) + 1;

    const s = i.fields[CF_SCORE] ?? '(kosong)';
    skor[s] = (skor[s] || 0) + 1;

    const c = i.fields[CF_CLASS];
    const cv = Array.isArray(c) && c.length ? c.map((x) => x.value).join('+') : '(kosong)';
    kelas[cv] = (kelas[cv] || 0) + 1;
  }

  console.log('PRIORITY      :', JSON.stringify(prio));
  console.log('DEFECT SCORE  :', JSON.stringify(skor));
  console.log('CLASSIFICATION:', JSON.stringify(kelas));
})().catch((e) => console.error('Gagal:', e.message));
