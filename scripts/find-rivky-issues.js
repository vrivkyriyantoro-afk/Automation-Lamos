require('dotenv').config();
const authHeader = 'Basic ' + Buffer.from(process.env.ATLASSIAN_EMAIL.trim() + ':' + process.env.ATLASSIAN_API_TOKEN.trim()).toString('base64');

async function search(jql) {
  let nextPageToken = null;
  let allIssues = [];

  while (true) {
    const res = await fetch('https://bank-sinarmas.atlassian.net/rest/api/3/search/jql', {
      method: 'POST',
      headers: { Authorization: authHeader, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jql,
        maxResults: 100,
        fields: ['summary', 'status', 'issuetype', 'parent', 'resolutiondate', 'updated', 'created'],
        nextPageToken: nextPageToken || undefined
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Search failed:', res.status, data);
      break;
    }
    const issues = data.issues || [];
    allIssues.push(...issues);
    if (data.nextPageToken) {
      nextPageToken = data.nextPageToken;
    } else {
      break;
    }
  }

  console.log(`Total found: ${allIssues.length} issues`);
  allIssues.forEach(i => {
    console.log(`${i.key} | ${i.fields.issuetype.name} | ${i.fields.status.name} | Parent: ${i.fields.parent?.key || '-'} | Res: ${i.fields.resolutiondate?.slice(0, 10) || '-'} | Upd: ${i.fields.updated?.slice(0, 10)} | ${i.fields.summary}`);
  });
}

search('assignee = "712020:039e96a0-8aab-4afa-b30e-4e9c1376056f" ORDER BY updated DESC');

