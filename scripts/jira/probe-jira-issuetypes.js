require('dotenv').config();

/**
 * Probe READ-ONLY: cek issue type apa saja yang tersedia pada project sebuah story,
 * dan field apa saja yang wajib saat membuat issue type tersebut.
 *
 * Penggunaan: node scripts/jira/probe-jira-issuetypes.js S2CML-4948
 */

const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_EMAIL;
const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const issueKey = process.argv[2];

if (!apiToken || !email) {
  console.error('ATLASSIAN_API_TOKEN dan ATLASSIAN_EMAIL wajib diset di .env');
  process.exit(1);
}
if (!issueKey) {
  console.error('Berikan issue key. Contoh: node scripts/jira/probe-jira-issuetypes.js S2CML-4948');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');
const headers = { Authorization: auth, Accept: 'application/json' };

async function get(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} :: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

(async () => {
  try {
    // 1. Identitas issue & project-nya
    const issue = await get(`https://${domain}/rest/api/3/issue/${issueKey}?fields=summary,project,issuetype`);
    const projectKey = issue.fields.project.key;
    const projectId = issue.fields.project.id;

    console.log('=== ISSUE TARGET ===');
    console.log(`${issueKey} | ${issue.fields.summary}`);
    console.log(`type=${issue.fields.issuetype.name} | project=${projectKey} (id=${projectId})\n`);

    // 2. Daftar issue type pada project tersebut
    const meta = await get(
      `https://${domain}/rest/api/3/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes.fields`
    );
    const project = (meta.projects || [])[0];
    if (!project) {
      console.log('Tidak ada project yang dapat diakses lewat createmeta (cek permission Create Issue).');
      return;
    }

    console.log('=== ISSUE TYPE TERSEDIA ===');
    for (const it of project.issuetypes || []) {
      console.log(`- ${it.name} (id=${it.id}) subtask=${it.subtask}`);
    }

    // 3. Cari issue type yang mengandung kata "defect" / "bug"
    const kandidat = (project.issuetypes || []).filter(it => /defect|bug/i.test(it.name));
    if (kandidat.length === 0) {
      console.log('\nTidak ada issue type bernama Defect/Bug pada project ini.');
      return;
    }

    for (const it of kandidat) {
      console.log(`\n=== FIELD UNTUK "${it.name}" (id=${it.id}, subtask=${it.subtask}) ===`);
      const fields = it.fields || {};
      for (const [key, f] of Object.entries(fields)) {
        const wajib = f.required ? 'WAJIB' : 'opsional';
        const opsi = Array.isArray(f.allowedValues) && f.allowedValues.length
          ? ` opsi=[${f.allowedValues.slice(0, 8).map(v => v.name || v.value || v.id).join(', ')}${f.allowedValues.length > 8 ? ', ...' : ''}]`
          : '';
        console.log(`  ${wajib.padEnd(8)} ${key} (${f.name}) tipe=${f.schema?.type || '?'}${opsi}`);
      }
    }
  } catch (err) {
    console.error('Gagal:', err.message);
    process.exit(1);
  }
})();
