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

async function getIssue(key) {
  const res = await fetch(`https://bank-sinarmas.atlassian.net/rest/api/3/issue/${key}`, {
    headers: { Authorization: authHeader, Accept: 'application/json' }
  });
  return await res.json();
}

async function run() {
  console.log('1. Checking child epics of NPWOW62-1394...');
  const childEpics = await jqlSearch('parent = "NPWOW62-1394"');
  console.log(`Found ${childEpics.length} epics under NPWOW62-1394:`);
  childEpics.forEach(e => console.log(`  - [${e.key}] ${e.fields.summary} (${e.fields.status.name})`));

  const epicKeys = childEpics.map(e => e.key);
  
  console.log('\n2. Fetching all issues whose parent is one of these epics...');
  let epicChildStories = [];
  if (epicKeys.length > 0) {
    const jqlStories = `parent in (${epicKeys.join(',')})`;
    epicChildStories = await jqlSearch(jqlStories);
    console.log(`Found ${epicChildStories.length} stories/issues directly under these epics.`);
  }

  // Also check if any issues have "Epic Link" or parent = NPWOW62-1394
  console.log('\n3. Checking QA Tasks assigned to Rivky in October 2026...');
  // QA tasks assigned to Rivky that were resolved or updated in October 2026
  const rivkyOctTasks = await jqlSearch(`assignee = "${RIVKY_ID}" AND (resolutiondate >= "2026-10-01" AND resolutiondate <= "2026-10-31" OR updated >= "2026-10-01" AND updated <= "2026-10-31")`);
  console.log(`Found ${rivkyOctTasks.length} tasks for Rivky updated/resolved in Oct 2026.`);

  // Let's inspect each QA task of Rivky
  console.log('\n4. Checking parents of Rivky tasks in Oct 2026:');
  for (const t of rivkyOctTasks) {
    const pKey = t.fields.parent?.key;
    let parentStatus = '-';
    let parentSummary = '-';
    let parentType = '-';
    let parentResDate = '-';
    let grandParentKey = '-';

    if (pKey) {
      const p = await getIssue(pKey);
      parentStatus = p.fields?.status?.name;
      parentSummary = p.fields?.summary;
      parentType = p.fields?.issuetype?.name;
      parentResDate = p.fields?.resolutiondate;
      grandParentKey = p.fields?.parent?.key || '-';
    }

    console.log(`Task: [${t.key}] (${t.fields.issuetype.name}) - Status: ${t.fields.status.name} - Res: ${t.fields.resolutiondate?.slice(0,10)} - Upd: ${t.fields.updated?.slice(0,10)}`);
    console.log(`  Summary: ${t.fields.summary}`);
    console.log(`  Parent: [${pKey}] (${parentType}) - Status: ${parentStatus} - Res: ${parentResDate?.slice(0,10)}`);
    console.log(`    Parent Summary: ${parentSummary}`);
    console.log(`    Grandparent: ${grandParentKey}`);
  }

  // Also check all stories under NPWOW62-1394 that are status = Done
  console.log('\n5. Checking all stories under NPWOW62-1394 epics with status = Done:');
  const doneStoriesUnderEpics = epicChildStories.filter(s => s.fields.status.name.toLowerCase() === 'done' || s.fields.status.name.toLowerCase() === 'closed');
  console.log(`Found ${doneStoriesUnderEpics.length} Done stories directly under child epics.`);
  for (const s of doneStoriesUnderEpics) {
    console.log(`  - [${s.key}] ${s.fields.summary} (Resolved: ${s.fields.resolutiondate})`);
    // check subtasks
    const subtasks = s.fields.subtasks || [];
    console.log(`    Subtasks (${subtasks.length}):`);
    for (const st of subtasks) {
      console.log(`      * [${st.key}] ${st.fields.summary} [${st.fields.status.name}]`);
    }
  }
}

run().catch(console.error);

