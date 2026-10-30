const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Spec-Kit Generator: Otomatis membuat folder spesifikasi per Jira Story di dalam subfolder bucket terkait
 * Penggunaan:
 *   node scripts/specify.js <Jira_Key_atau_Nama> [nama_bucket]
 * Contoh:
 *   node scripts/specify.js S2CML-4889 bucket-agunan
 *   node scripts/specify.js S2CML-4890
 */

const input = process.argv[2];
let bucketArg = process.argv[3];

if (!input) {
  console.error('❌ Error: Berikan Issue Key Jira (mis. S2CML-4889) atau nama fitur!');
  console.error('Contoh: node scripts/specify.js S2CML-4889 bucket-agunan');
  process.exit(1);
}

const apiToken = process.env.ATLASSIAN_API_TOKEN;
const email = process.env.ATLASSIAN_EMAIL;
const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const authHeader = (apiToken && email) 
  ? 'Basic ' + Buffer.from(`${email.trim()}:${apiToken.trim()}`).toString('base64') 
  : null;

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
  if (!authHeader) return null;
  const endpoint = `https://${domain}/rest/api/3/issue/${issueKey}`;
  console.log(`📡 Mengambil data spesifikasi dari Jira: ${endpoint}...`);

  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const fields = data.fields;
    return {
      key: issueKey,
      summary: fields.summary || '',
      issueType: fields.issuetype?.name || 'Story',
      status: fields.status?.name || '',
      description: parseAdfText(fields.description)
    };
  } catch (err) {
    console.warn(`⚠️ Warning: Gagal memanggil Jira API (${err.message}). Menggunakan template standar.`);
    return null;
  }
}

function detectBucket(text) {
  const lower = text.toLowerCase();
  if (lower.includes('agunan') || lower.includes('collateral')) return 'bucket-agunan';
  if (lower.includes('identitas') || lower.includes('penjamin')) return 'bucket-identitas';
  if (lower.includes('dokumen')) return 'bucket-dokumen';
  if (lower.includes('usaha')) return 'bucket-data-usaha';
  if (lower.includes('struktur')) return 'bucket-struktur-kredit';
  if (lower.includes('covenant')) return 'bucket-covenant-tbo';
  return null;
}

async function main() {
  const isJiraKey = /^[A-Z0-9]+-[0-9]+$/i.test(input.trim());
  const storyKey = input.trim();

  let jiraData = null;
  if (isJiraKey) {
    jiraData = await fetchJiraIssue(storyKey.toUpperCase());
  }

  // Tentukan folder bucket
  if (!bucketArg && jiraData) {
    bucketArg = detectBucket(`${jiraData.summary} ${jiraData.description}`);
  }
  if (!bucketArg) {
    bucketArg = detectBucket(storyKey) || '';
  }

  const baseSpecsDir = path.resolve(__dirname, '../specs');
  const targetDir = bucketArg 
    ? path.join(baseSpecsDir, bucketArg, storyKey)
    : path.join(baseSpecsDir, storyKey);

  const templateDir = path.resolve(__dirname, '../.specify/templates');

  if (fs.existsSync(targetDir)) {
    console.log(`ℹ️ Folder spesifikasi sudah ada di: ${targetDir}. Memperbarui berkas...`);
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const specRelPath = path.relative(path.resolve(__dirname, '..'), targetDir).replace(/\\/g, '/');
  const testFileName = `${storyKey.toLowerCase()}.spec.ts`;
  const bucketTestFolder = bucketArg ? bucketArg.replace(/^bucket-/, 'bucket').replace(/-([a-z])/g, (_, c) => c.toUpperCase()) : 'bucketAgunan';

  // 1. Generate spec.md
  let specContent = '';
  if (jiraData) {
    specContent = `# SPEC: [${jiraData.key}] ${jiraData.summary}

## 1. Ringkasan Tiket Jira
- **Key**: [${jiraData.key}](https://${domain}/browse/${jiraData.key})
- **Tipe**: ${jiraData.issueType}
- **Status**: ${jiraData.status}
- **Ringkasan**: ${jiraData.summary}
- **Bucket**: \`${bucketArg || 'Unassigned'}\`

## 2. Deskripsi & User Story (Dari Jira)
${jiraData.description || '(Tidak ada deskripsi di Jira)'}

## 3. Kriteria Penerimaan (Acceptance Criteria)
Dokumen ini menjadi acuan utama verifikasi Playwright. Setiap skenario di atas wajib memiliki assertion di file test.

## 4. Prekondisi & Lingkungan Pengujian
- **Lingkungan**: SIT (\`https://los-fe-coreloan-sit.devs.banksinarmas.com/\`)
- **Autentikasi**: SSO Kratos (\`pages/LoginPage.ts\`)
- **Keamanan**: READ-ONLY saat eksplorasi awal.
`;
  } else {
    const baseSpec = fs.existsSync(path.join(templateDir, 'spec.md')) 
      ? fs.readFileSync(path.join(templateDir, 'spec.md'), 'utf-8')
      : `# SPEC: ${storyKey}\n\n(Tuliskan skenario di sini)`;
    specContent = baseSpec.replace(/\[Nama Fitur \/ Bucket Pengujian\]/g, storyKey);
  }
  fs.writeFileSync(path.join(targetDir, 'spec.md'), specContent);

  // 2. Generate plan.md
  let planContent = '';
  if (jiraData) {
    planContent = `# PLAN: ${jiraData.key} - ${jiraData.summary}

## 1. Berkas & Target Pengujian
- **File Test Target**: \`tests/${bucketTestFolder}/${testFileName}\`
- **Living Spec**: \`${specRelPath}/spec.md\`
- **Acuan Jira**: [${jiraData.key}](https://${domain}/browse/${jiraData.key})

## 2. Pemetaan Komponen & Selector DOM (Konvensi LAMOS)
| Kontrol UI | Selector Stabil | Keterangan / Assert |
| :--- | :--- | :--- |
| **Tombol Tambah Agunan** | \`button:has-text("Agunan")\` | Membuka modal pop-up stepper |
| **Modal Pop-up** | \`[role="dialog"]:visible\` | Modal stepper Tambah Agunan |
| **Combo Jenis Agunan** | \`[id^="collateral-type"]\` | Input Jenis Kode Agunan |
| **Input Bukti Kepemilikan** | \`input[placeholder="Masukkan nomor"]\` | Nomor bukti kepemilikan |
| **Tombol Cari** | \`button:has-text("Cari")\` | Trigger pencarian ke Core Loan System (CLS) |
| **Tombol Tambah Agunan Baru** | \`button:has-text("Tambah Agunan Baru")\` | Muncul jika data CLS tidak ditemukan/tidak cocok |

## 3. Strategi Eksekusi Test Playwright
1. **Mode Read-Only**: Melakukan pencarian data eksisting tanpa submit/commit.
2. **Validasi State**:
   - Memastikan stepper tahap 1 (Search Existing Agunan) tampil.
   - Menguji skenario saat hasil pencarian kosong -> tombol "Tambah Agunan Baru" tampil.
   - Menguji skenario saat hasil ditemukan -> memilih salah satu kartu agunan eksisting.
3. **Perintah Verifikasi**:
   \`\`\`bash
   npx playwright test tests/${bucketTestFolder}/${testFileName} --project=chromium
   \`\`\`
`;
  } else {
    const basePlan = fs.existsSync(path.join(templateDir, 'plan.md'))
      ? fs.readFileSync(path.join(templateDir, 'plan.md'), 'utf-8')
      : `# PLAN: ${storyKey}\n\n(Tuliskan rencana teknis di sini)`;
    planContent = basePlan.replace(/\[Nama Fitur \/ Bucket Pengujian\]/g, storyKey);
  }
  fs.writeFileSync(path.join(targetDir, 'plan.md'), planContent);

  // 3. Generate tasks.md
  let tasksContent = '';
  if (jiraData) {
    tasksContent = `# TASKS: ${jiraData.key} - ${jiraData.summary}

> **Prinsip TDD & Superpowers**: Kerjakan berurutan, verifikasi secara nyata dengan Playwright.

- [ ] **1. Persiapan Skenario & Data**
  - [ ] Review User Story dan Acceptance Criteria di \`${specRelPath}/spec.md\`.
  - [ ] Siapkan data debitur dan keyword pencarian di lingkungan SIT.

- [ ] **2. Implementasi Test Automation Playwright**
  - [ ] Buat file test: \`tests/${bucketTestFolder}/${testFileName}\`.
  - [ ] Test Case 1: Tampilkan modal stepper Tambah Agunan saat tombol diklik.
  - [ ] Test Case 2: Input kriteria pencarian dan trigger tombol Cari.
  - [ ] Test Case 3: Verifikasi hasil pencarian (menampilkan list atau opsi "Tambah Agunan Baru").

- [ ] **3. Eksekusi & Verifikasi (Verification-Before-Completion)**
  - [ ] Jalankan test di SIT:
    \`\`\`bash
    npx playwright test tests/${bucketTestFolder}/${testFileName} --project=chromium
    \`\`\`
  - [ ] Pastikan seluruh test lolos tanpa timeout.

- [ ] **4. Dokumentasi & Living Memory**
  - [ ] Update \`PROJECT_HISTORY.md\` sesuai aturan \`AGENTS.md\`.
`;
  } else {
    const baseTasks = fs.existsSync(path.join(templateDir, 'tasks.md'))
      ? fs.readFileSync(path.join(templateDir, 'tasks.md'), 'utf-8')
      : `# TASKS: ${storyKey}\n\n- [ ] Task 1`;
    tasksContent = baseTasks.replace(/\[Nama Fitur \/ Bucket Pengujian\]/g, storyKey);
  }
  fs.writeFileSync(path.join(targetDir, 'tasks.md'), tasksContent);

  console.log(`\n======================================================`);
  console.log(`✅ BERHASIL MEMBUAT SPESIFIKASI STORY JIRA: ${storyKey}`);
  console.log(`======================================================`);
  if (jiraData) {
    console.log(`Judul Story : ${jiraData.summary}`);
    console.log(`Status      : ${jiraData.status}`);
  }
  console.log(`Bucket      : ${bucketArg || '(Root)'}`);
  console.log(`Lokasi      : ${targetDir}`);
  console.log(`Berkas      :`);
  console.log(`  - ${specRelPath}/spec.md   (User Story & Acceptance Criteria resmi)`);
  console.log(`  - ${specRelPath}/plan.md   (Rencana locator & method Playwright)`);
  console.log(`  - ${specRelPath}/tasks.md  (Checklist tugas AI)`);
  console.log(`======================================================\n`);
}

main();
