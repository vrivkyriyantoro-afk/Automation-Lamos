require('dotenv').config();
const authHeader = 'Basic ' + Buffer.from(process.env.ATLASSIAN_EMAIL.trim() + ':' + process.env.ATLASSIAN_API_TOKEN.trim()).toString('base64');
const RIVKY_ID = '712020:039e96a0-8aab-4afa-b30e-4e9c1376056f';

async function jqlSearch(jql, fields = ['summary', 'status', 'issuetype', 'parent', 'resolutiondate', 'updated', 'created', 'subtasks', 'assignee']) {
  let nextPageToken = null;
  let allIssues = [];

  while (true) {
    const res = await fetch('https://bank-sinarmas.atlassian.net/rest/api/3/search/jql', {
      method: 'POST',
      headers: { Authorization: authHeader, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jql,
        maxResults: 100,
        fields,
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
  return allIssues;
}

async function run() {
  console.log('=== CHECKING ALL RIVKY QA TASKS ===');
  const allRivkyTasks = await jqlSearch(`assignee = "${RIVKY_ID}"`);
  console.log(`Total Rivky tasks: ${allRivkyTasks.length}`);

  const parentKeys = Array.from(new Set(allRivkyTasks.map(t => t.fields.parent?.key).filter(Boolean)));
  console.log(`Unique parent keys: ${parentKeys.length}`);

  // Batch fetch all parents
  const parentMap = {};
  for (let i = 0; i < parentKeys.length; i += 50) {
    const batch = parentKeys.slice(i, i + 50);
    const parentIssues = await jqlSearch(`key in (${batch.join(',')})`);
    parentIssues.forEach(p => {
      parentMap[p.key] = p;
    });
  }

  console.log(`Fetched ${Object.keys(parentMap).length} parent issues.`);

  const matches = [];

  for (const task of allRivkyTasks) {
    const pKey = task.fields.parent?.key;
    const parent = pKey ? parentMap[pKey] : null;

    const tRes = task.fields.resolutiondate;
    const tUpd = task.fields.updated;
    const pStatus = parent?.fields?.status?.name;
    const pRes = parent?.fields?.resolutiondate;
    const pUpd = parent?.fields?.updated;
    const pType = parent?.fields?.issuetype?.name;

    // Check if parent or task is October
    const isOct = (d) => d && (d.slice(5, 7) === '10');

    // Scenario A: Story is Done, resolved in October
    // Scenario B: QA Task is Done, resolved in October
    // Scenario C: Story is Done, QA task resolved in October
    if ((pStatus === 'Done' || pStatus === 'Closed') && (isOct(pRes) || isOct(tRes))) {
      matches.push({ task, parent, reason: 'Story Done & (Story/Task resolved in October)' });
    } else if (pStatus === 'Done' && isOct(pUpd)) {
      matches.push({ task, parent, reason: 'Story Done & Story updated in October' });
    } else if (isOct(tRes) && task.fields.status?.name === 'Done') {
      matches.push({ task, parent, reason: 'Task Done & Task resolved in October' });
    }
  }

  console.log(`\n=== MATCHES FOUND (${matches.length}) ===`);
  matches.forEach(({ task, parent, reason }) => {
    console.log(`\n[REASON: ${reason}]`);
    console.log(`  Story    : [${parent?.key || 'NO-PARENT'}] (${parent?.fields?.issuetype?.name}) - Status: ${parent?.fields?.status?.name}`);
    console.log(`  Summary  : ${parent?.fields?.summary}`);
    console.log(`  Resolved : ${parent?.fields?.resolutiondate} | Updated: ${parent?.fields?.updated}`);
    console.log(`  Parent/Epic: ${parent?.fields?.parent?.key || '-'}`);
    console.log(`  QA Task  : [${task.key}] (${task.fields.issuetype.name}) - Status: ${task.fields.status?.name}`);
    console.log(`  Summary  : ${task.fields.summary}`);
    console.log(`  Resolved : ${task.fields.resolutiondate} | Updated: ${task.fields.updated}`);
  });
}

run().catch(console.error);
