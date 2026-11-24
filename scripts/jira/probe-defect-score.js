require('dotenv').config();

/**
 * Probe READ-ONLY: cari konvensi nilai Defect Score (customfield_10275)
 * dari Defect/Bug yang sudah ada di project S2CML.
 */

const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const email = process.env.ATLASSIAN_EMAIL;
const apiToken = process.env.ATLASSIAN_API_TOKEN;
const auth = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');
const headers = { Authorization: auth, Accept: 'application/json' };

const CF_SCORE = 'customfield_10275';

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} :: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

(async () => {
  // 1. Metadata field: cek deskripsi / konfigurasi
  try {
    const all = await get(`https://${domain}/rest/api/3/field`);
    const f = all.find((x) => x.id === CF_SCORE);
    console.log('=== METADATA FIELD ===');
    console.log(JSON.stringify(f, null, 2));
  } catch (e) {
    console.log('metadata gagal:', e.message);
  }

  // 2. Defect/Bug yang Defect Score-nya sudah terisi
  const jql = encodeURIComponent(
    `project = S2CML AND issuetype in (Defect, Bug) AND "Defect Score" is not EMPTY ORDER BY created DESC`
  );
  try {
    const res = await get(
      `https://${domain}/rest/api/3/search/jql?jql=${jql}&maxResults=40&fields=summary,issuetype,priority,${CF_SCORE}`
    );
    const issues = res.issues || [];
    console.log(`\n=== DEFECT DENGAN SCORE TERISI (${issues.length}) ===`);

    const byScore = {};
    for (const i of issues) {
      const s = i.fields[CF_SCORE];
      const prio = i.fields.priority?.name || '-';
      byScore[s] = byScore[s] || [];
      byScore[s].push(prio);
      console.log(`${i.key} | score=${String(s).padEnd(6)} | prio=${prio.padEnd(8)} | ${i.fields.summary.slice(0, 70)}`);
    }

    console.log('\n=== SEBARAN SCORE -> PRIORITY ===');
    for (const [score, prios] of Object.entries(byScore).sort((a, b) => Number(a[0]) - Number(b[0]))) {
      const hitung = {};
      prios.forEach((p) => (hitung[p] = (hitung[p] || 0) + 1));
      console.log(`score ${score}: ${JSON.stringify(hitung)}`);
    }

    const nilai = issues.map((i) => i.fields[CF_SCORE]).filter((v) => v != null);
    if (nilai.length) {
      console.log(`\nrentang: ${Math.min(...nilai)} .. ${Math.max(...nilai)}`);
      console.log(`nilai unik: ${[...new Set(nilai)].sort((a, b) => a - b).join(', ')}`);
    }
  } catch (e) {
    console.log('\npencarian gagal:', e.message);
  }
})();
