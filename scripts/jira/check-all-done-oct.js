require('dotenv').config();
const authHeader = 'Basic ' + Buffer.from(process.env.ATLASSIAN_EMAIL.trim() + ':' + process.env.ATLASSIAN_API_TOKEN.trim()).toString('base64');

async function run() {
  const jql = 'parent in (S2CML-6793, S2CML-6359, S2CML-6317, S2CML-6051, S2CML-5902, S2CML-3302, LP-5685, CRA-5637, APTD-9) AND status in (Done, Closed) AND resolutiondate >= "2026-10-01" AND resolutiondate <= "2026-10-31"';
  
  const res = await fetch('https://bank-sinarmas.atlassian.net/rest/api/3/search/jql', {
    method: 'POST',
    headers: { Authorization: authHeader, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jql,
      maxResults: 50,
      fields: ['summary', 'status', 'issuetype', 'parent', 'resolutiondate', 'subtasks']
    })
  });
  const data = await res.json();
  console.log('Total Done stories in Oct under NPWOW62-1394:', data.issues?.length);
  for (const s of (data.issues || [])) {
    console.log(`\nStory: [${s.key}] ${s.fields.summary}`);
    console.log(`  Resolved: ${s.fields.resolutiondate} | Epic: ${s.fields.parent?.key}`);
    const subtasks = s.fields.subtasks || [];
    for (const st of subtasks) {
      console.log(`    - Subtask: [${st.key}] ${st.fields.summary} [${st.fields.status.name}]`);
    }
  }
}

run().catch(console.error);

