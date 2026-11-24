const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_EMAIL;
const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';

if (!apiToken || !email) {
  console.error('❌ Error: ATLASSIAN_API_TOKEN dan ATLASSIAN_EMAIL wajib diset di .env!');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');
const headers = { Authorization: authHeader, Accept: 'application/json' };

async function api(url) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return { ok: false, status: res.status, text: await res.text() };
    }
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function jqlSearch(jql, fields = ['summary', 'status', 'issuetype', 'parent', 'assignee', 'resolutiondate', 'updated', 'subtasks', 'issuelinks']) {
  let nextPageToken = null;
  let allIssues = [];

  while (true) {
    let url = `https://${domain}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=50&fields=${fields.join(',')}`;
    if (nextPageToken) {
      url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
    }
    const res = await api(url);
    if (!res.ok) {
      // Try POST /rest/api/3/search/jql if GET fails
      console.log(`GET /rest/api/3/search/jql failed (${res.status}), trying POST /rest/api/3/search/jql...`);
      const postRes = await fetch(`https://${domain}/rest/api/3/search/jql`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jql,
          maxResults: 50,
          fields,
          nextPageToken: nextPageToken || undefined
        })
      });
      if (!postRes.ok) {
        console.error(`POST failed: ${postRes.status} - ${await postRes.text()}`);
        break;
      }
      const data = await postRes.json();
      const issues = data.issues || [];
      allIssues.push(...issues);
      if (data.nextPageToken) {
        nextPageToken = data.nextPageToken;
      } else {
        break;
      }
      continue;
    }

    const issues = res.data.issues || [];
    allIssues.push(...issues);
    if (res.data.nextPageToken) {
      nextPageToken = res.data.nextPageToken;
    } else {
      break;
    }
  }
  return allIssues;
}

async function main() {
  console.log('🔍 1. Mencari user Rivky Riyantoro di Jira...');
  const userRes = await api(`https://${domain}/rest/api/3/user/search?query=Rivky`);
  let rivkyAccount = null;
  if (userRes.ok && userRes.data && userRes.data.length > 0) {
    console.log('User ditemukan:');
    userRes.data.forEach(u => {
      console.log(`- ${u.displayName} (${u.emailAddress || 'no-email'}) [accountId: ${u.accountId}]`);
      if (u.displayName.toLowerCase().includes('rivky')) {
        rivkyAccount = u;
      }
    });
  } else {
    console.log('User search result:', userRes);
  }

  console.log('\n🔍 2. Mencari semua task/sub-task yang di-assign ke Rivky Riyantoro...');
  let jqlAssignee = 'assignee = "Rivky Riyantoro"';
  if (rivkyAccount) {
    jqlAssignee = `assignee = "${rivkyAccount.accountId}"`;
  }
  
  // Cari semua issue Rivky
  const rivkyIssues = await jqlSearch(`${jqlAssignee} ORDER BY updated DESC`);
  console.log(`Ditemukan ${rivkyIssues.length} issue assigned ke Rivky Riyantoro.`);

  // Simpan raw issue Rivky untuk referensi
  fs.writeFileSync('explore-output/atlassian/rivky-issues.json', JSON.stringify(rivkyIssues, null, 2));

  // Filter issue yang updated/resolved di bulan Oktober 2026 atau memiliki parent story Done di Oktober 2026
  console.log('\n🔍 3. Menganalisis parent stories dan tanggal resolusi/update Oktober 2026...');
  
  const results = [];
  
  for (const issue of rivkyIssues) {
    const f = issue.fields;
    const key = issue.key;
    const summary = f.summary;
    const status = f.status?.name;
    const issueType = f.issuetype?.name;
    const parent = f.parent;
    const resDate = f.resolutiondate;
    const updated = f.updated;

    // Check if issue is a sub-task or task
    let parentKey = parent ? parent.key : null;
    let parentData = null;

    if (parentKey) {
      // Ambil data parent
      const pRes = await api(`https://${domain}/rest/api/3/issue/${parentKey}?fields=summary,status,issuetype,resolutiondate,updated,parent`);
      if (pRes.ok) {
        parentData = pRes.data;
      }
    }

    results.push({
      key,
      summary,
      issueType,
      status,
      resDate,
      updated,
      parentKey,
      parentSummary: parentData?.fields?.summary || parent?.fields?.summary || null,
      parentStatus: parentData?.fields?.status?.name || null,
      parentResDate: parentData?.fields?.resolutiondate || null,
      parentUpdated: parentData?.fields?.updated || null,
      parentParentKey: parentData?.fields?.parent?.key || null
    });
  }

  // Tampilkan hasil
  console.log('\n=== HASIL PEMETAAN QA TASK RIVKY RIYANTORO ===');
  results.forEach(r => {
    console.log(`\n[${r.key}] (${r.issueType}) - Status: ${r.status}`);
    console.log(`  Summary : ${r.summary}`);
    console.log(`  Updated : ${r.updated} | Resolved: ${r.resDate}`);
    if (r.parentKey) {
      console.log(`  Parent  : [${r.parentKey}] ${r.parentSummary} (Status: ${r.parentStatus})`);
      console.log(`  Parent ResDate: ${r.parentResDate} | Parent Updated: ${r.parentUpdated}`);
    }
  });

  fs.writeFileSync('explore-output/atlassian/rivky-mapped.json', JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error('Error execution:', err);
});
