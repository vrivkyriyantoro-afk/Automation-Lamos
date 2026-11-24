require('dotenv').config();
const authHeader = 'Basic ' + Buffer.from(process.env.ATLASSIAN_EMAIL.trim() + ':' + process.env.ATLASSIAN_API_TOKEN.trim()).toString('base64');
const RIVKY_ID = '712020:039e96a0-8aab-4afa-b30e-4e9c1376056f';

async function run() {
  const res = await fetch('https://bank-sinarmas.atlassian.net/rest/api/3/search/jql', {
    method: 'POST',
    headers: { Authorization: authHeader, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jql: `assignee = "${RIVKY_ID}"`,
      maxResults: 200,
      fields: ['summary', 'status', 'issuetype', 'parent', 'resolutiondate', 'updated']
    })
  });
  const data = await res.json();
  const octTasks = (data.issues || []).filter(i => {
    const resDate = i.fields.resolutiondate || '';
    const updDate = i.fields.updated || '';
    return resDate.startsWith('2026-10') || updDate.startsWith('2026-10');
  });
  console.log(`Rivky tasks in Oct 2026: ${octTasks.length}`);
  for (const t of octTasks) {
    console.log(`\n[${t.key}] (${t.fields.issuetype.name}) Status: ${t.fields.status.name} | Res: ${t.fields.resolutiondate?.slice(0,10)} | Updated: ${t.fields.updated?.slice(0,10)} | Parent: ${t.fields.parent?.key}`);
    console.log(`  QA-Task Summary: ${t.fields.summary}`);
    if (t.fields.parent?.key) {
      const pRes = await fetch(`https://bank-sinarmas.atlassian.net/rest/api/3/issue/${t.fields.parent.key}`, {
        headers: { Authorization: authHeader, Accept: 'application/json' }
      });
      const pData = await pRes.json();
      console.log(`  -> Parent [${pData.key}] (${pData.fields?.issuetype?.name}): Status = ${pData.fields?.status?.name}, Res = ${pData.fields?.resolutiondate?.slice(0,10)}, Grandparent = ${pData.fields?.parent?.key}`);
      console.log(`     Parent Summary: ${pData.fields?.summary}`);
    }
  }
}
run();
