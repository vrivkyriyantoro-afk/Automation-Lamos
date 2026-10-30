const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script untuk membaca User Story & Acceptance Criteria (AC) dari Jira atau PRD dari Confluence
 * Penggunaan:
 *   node scripts/read-atlassian.js <Jira_URL_atau_IssueKey_atau_Confluence_URL>
 */

const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_EMAIL;
const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';

if (!apiToken || !email) {
  console.error('❌ Error: ATLASSIAN_API_TOKEN dan ATLASSIAN_EMAIL wajib diset di .env!');
  process.exit(1);
}

const inputUrl = process.argv[2];

if (!inputUrl) {
  console.error('❌ Error: Berikan URL Jira / Confluence atau Issue Key!');
  console.error('Contoh: node scripts/read-atlassian.js LP-5685');
  process.exit(1);
}

function extractTarget(input) {
  const jiraMatch = input.match(/([A-Z0-9]+-[0-9]+)/i);
  if (jiraMatch && !input.includes('/wiki/')) {
    return { type: 'jira', key: jiraMatch[1].toUpperCase() };
  }

  const confMatch = input.match(/pages\/([0-9]+)/);
  if (confMatch || input.includes('/wiki/')) {
    return { type: 'confluence', pageId: confMatch ? confMatch[1] : input.split('/').pop() };
  }

  return { type: 'unknown' };
}

const target = extractTarget(inputUrl);
const authHeader = 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64');

function parseAdfText(node) {
  if (!node) return '';
  let text = '';
  if (node.text) text += node.text;
  if (node.content && Array.isArray(node.content)) {
    node.content.forEach(child => {
      const childText = parseAdfText(child);
      if (node.type === 'listItem') {
        text += `- ${childText.trim()}\n`;
      } else if (node.type === 'paragraph') {
        text += `${childText}\n`;
      } else if (node.type && node.type.startsWith('heading')) {
        text += `\n### ${childText}\n`;
      } else {
        text += childText;
      }
    });
  }
  return text;
}

async function fetchJiraIssue(issueKey) {
  const endpoint = `https://${domain}/rest/api/3/issue/${issueKey}`;
  console.log(`📡 Mengambil data Jira: ${endpoint}...`);

  const res = await fetch(endpoint, {
    headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Jira API Error (${res.status} ${res.statusText}): ${errText}`);
  }

  const data = await res.json();
  const fields = data.fields;
  const summary = fields.summary || '';
  const issueType = fields.issuetype?.name || 'Story';
  const status = fields.status?.name || '';
  const descriptionText = parseAdfText(fields.description);

  // Ambil Linked Issues (Stories terkait, parent/child)
  const linkedIssues = (fields.issuelinks || []).map(link => {
    const other = link.outwardIssue || link.inwardIssue;
    return other ? {
      relation: link.type?.name || 'Related',
      key: other.key,
      summary: other.fields?.summary || '',
      status: other.fields?.status?.name || ''
    } : null;
  }).filter(Boolean);

  // Jika ini adalah EPIC, cari User Stories di bawah Epic ini
  let childStories = [];
  if (issueType.toLowerCase() === 'epic') {
    console.log(`🔍 Mendeteksi EPIC. Mencari Child Stories di bawah ${issueKey}...`);
    try {
      const jql = encodeURIComponent(`parent = "${issueKey}" OR "Epic Link" = "${issueKey}" ORDER BY key ASC`);
      const searchRes = await fetch(`https://${domain}/rest/api/3/search?jql=${jql}&maxResults=50&fields=summary,status,issuetype,priority`, {
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        childStories = (searchData.issues || []).map(i => ({
          key: i.key,
          summary: i.fields.summary,
          type: i.fields.issuetype?.name,
          status: i.fields.status?.name,
          priority: i.fields.priority?.name
        }));
      }
    } catch (err) {
      console.warn(`⚠️ Catatan: Gagal mengambil child stories: ${err.message}`);
    }
  }

  return {
    type: 'Jira Issue',
    key: issueKey,
    summary,
    issueType,
    status,
    description: descriptionText,
    linkedIssues,
    totalChildStories: childStories.length,
    childStories
  };
}

async function fetchConfluencePage(pageId) {
  const endpoint = `https://${domain}/wiki/api/v2/pages/${pageId}?body-format=storage`;
  console.log(`📡 Mengambil data Confluence: ${endpoint}...`);

  const res = await fetch(endpoint, {
    headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Confluence API Error (${res.status} ${res.statusText}): ${errText}`);
  }

  const data = await res.json();
  const rawBody = data.body?.storage?.value || '';
  const cleanBody = rawBody
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n### $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return {
    type: 'Confluence PRD',
    pageId,
    title: data.title,
    status: data.status,
    body: cleanBody
  };
}

async function main() {
  try {
    const outDir = path.resolve(__dirname, '../explore-output/atlassian');
    fs.mkdirSync(outDir, { recursive: true });

    let result = null;
    if (target.type === 'jira') {
      result = await fetchJiraIssue(target.key);
    } else if (target.type === 'confluence') {
      result = await fetchConfluencePage(target.pageId);
    } else {
      throw new Error(`Input tidak dikenali sebagai Jira atau Confluence: ${inputUrl}`);
    }

    const outFile = path.join(outDir, `${target.key || target.pageId}.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

    console.log(`\n======================================================`);
    console.log(`✅ BERHASIL MEMBACA DOKUMEN ATLASSIAN`);
    console.log(`======================================================`);
    console.log(`Tipe        : ${result.type} (${result.issueType || 'Document'})`);
    console.log(`Judul / Key : ${result.summary || result.title} [${target.key || target.pageId}]`);
    console.log(`Status      : ${result.status}`);
    console.log(`Output File : ${outFile}`);
    console.log(`======================================================\n`);

    if (result.linkedIssues && result.linkedIssues.length > 0) {
      console.log(`\n🔗 LINKED ISSUES / STORIES TERKAIT (${result.linkedIssues.length}):`);
      result.linkedIssues.forEach((li, idx) => {
        console.log(`  ${idx + 1}. [${li.relation}] ${li.key}: ${li.summary} (${li.status})`);
      });
    }

    if (result.childStories && result.childStories.length > 0) {
      console.log(`📋 DAFTAR USER STORIES / TASK DI BAWAH EPIC INI (${result.childStories.length}):`);
      result.childStories.forEach((st, idx) => {
        console.log(`  ${idx + 1}. [${st.key}] [${st.status}] ${st.summary}`);
      });
      console.log(`\n💡 Tip: Jalankan 'node scripts/read-atlassian.js <KEY_STORY>' untuk melihat detail & Acceptance Criteria tiap story!`);
    } else {
      console.log(`Deskripsi / Acceptance Criteria:`);
      console.log(result.description || result.body);
    }
    console.log(`\n======================================================\n`);
  } catch (err) {
    console.error('❌ Gagal:', err.message);
    process.exit(1);
  }
}

main();
