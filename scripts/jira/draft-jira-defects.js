require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Menyusun payload subtask Defect untuk Jira project S2CML.
 *
 * DEFAULT: dry-run — payload hanya ditulis ke explore-output/jira/ dan dicetak,
 * TIDAK ada request tulis ke Jira.
 *
 * Untuk benar-benar membuat issue, jalankan dengan flag --commit secara eksplisit:
 *   node scripts/jira/draft-jira-defects.js --commit
 *   node scripts/jira/draft-jira-defects.js --commit --only BUG-01
 */

const domain = process.env.ATLASSIAN_DOMAIN || 'bank-sinarmas.atlassian.net';
const email = process.env.ATLASSIAN_EMAIL;
const apiToken = process.env.ATLASSIAN_API_TOKEN;

const COMMIT = process.argv.includes('--commit');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

const PROJECT_KEY = 'S2CML';
const ISSUETYPE_DEFECT_ID = '10015'; // Defect (subtask=true)
const CF_ENVIRONMENT = 'customfield_10155';
const CF_DEFECT_SCORE = 'customfield_10275';

/**
 * Konvensi yang terbaca dari 100 Defect S2CML terakhir (probe-defect-score.js):
 *
 *   Priority       : 100/100 memakai "Medium" — jadi seluruh defect di sini juga Medium.
 *   Classification : 100/100 KOSONG — field ini tidak dipakai tim, jadi tidak diisi.
 *   Defect Score   : skala 1-5. Sebaran pada tiket lama: 0(4) 1(11) 2(10) 3(61) 5(5), kosong(9).
 *       1 = kosmetik / wording / tidak sesuai Figma
 *       2 = wording + validasi ringan, mandatory salah
 *       3 = menyimpang dari requirement, logika atau data salah
 *       5 = error 400/500, fitur tidak dapat dipakai
 *
 * Nilai `score` pada tiap entri di bawah DITETAPKAN QA, bukan diturunkan dari pola tiket.
 * Ubah angkanya langsung bila penilaian berbeda.
 */
const PRIORITY_DEFAULT = 'Medium';

/** Teks biasa -> satu paragraf ADF. */
const p = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const h = (text, level = 3) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const code = (text) => ({ type: 'codeBlock', attrs: {}, content: [{ type: 'text', text }] });
const bullets = (items) => ({
  type: 'bulletList',
  content: items.map((t) => ({ type: 'listItem', content: [p(t)] })),
});
const steps = (items) => ({
  type: 'orderedList',
  content: items.map((t) => ({ type: 'listItem', content: [p(t)] })),
});

const APP_PERORANGAN = '01M4F7TNSCSHEDB5G3WTSP7HDY';
const APP_BADAN_USAHA = '01M482PRSVH5ZMTVZX5QH0VDNZ';

const DEFECTS = [
  {
    id: 'BUG-01',
    parent: 'S2CML-4949',
    summary: '[Defect] [FE] Placeholder field "Nomor telepon PIC" tertulis "Masukkan nomor HP badan usaha"',
    // Score 1 (ditetapkan QA): placeholder salah, kosmetik, field opsional.
    score: 1,
    attachments: ['explore-output/bug/BUG-01-placeholder-pic.png'],
    adf: [
      h('Langkah Reproduksi'),
      steps([
        `Buka modal "Tambah agunan" pada debitur perorangan ${APP_PERORANGAN} (debtorType=individual).`,
        'Masuk ke Step 3 "Informasi kepemilikan".',
        'Pilih Kategori pemilik agunan = "005 - Pemilik Anggunan".',
        'Pilih Tipe kepemilikan agunan = "Non Individu".',
        'Gulir ke bawah hingga field "Nomor telepon PIC".',
      ]),
      h('Expected Result'),
      p('Placeholder field "Nomor telepon PIC" berbunyi "Masukkan nomor telepon PIC".'),
      h('Actual Result'),
      p('Placeholder berbunyi "Masukkan nomor HP badan usaha" — identik dengan placeholder field "Nomor HP badan usaha" yang berada 3 baris di atasnya.'),
      h('Data Pendukung'),
      p('Urutan placeholder yang terbaca dari DOM (input:visible); entri terakhir adalah field Nomor telepon PIC:'),
      code(
        '["Otomatis terisi dari data tambahan agunan","Masukkan nama","Masukkan nomor identitas",\n' +
        ' "Masukkan lokasi pendirian badan usaha","Masukkan nomor telepon badan usaha",\n' +
        ' "Masukkan nomor HP badan usaha","Masukkan email badan usaha","Masukkan nama PIC",\n' +
        ' "Masukkan nomor HP badan usaha"]'
      ),
      h('Layer Penyebab: FRONTEND'),
      p('Diverifikasi dengan menangkap seluruh response API selama interaksi: TIDAK ADA satu pun response yang memuat string placeholder tersebut. String-nya hardcode di bundle FE.'),
      p('Lokasi di bundle: /_next/static/chunks/5970-28b82b8013712c73.js'),
      code(
        '{id:"ownership-pic-phone", name:"ownership.picPhoneNumber", label:"Nomor telepon PIC",\n' +
        ' labelPosition:"left", placeholder:"Masukkan nomor HP badan usaha", isPhoneNumber:!0}'
      ),
      p('Field name ("ownership.picPhoneNumber") dan label ("Nomor telepon PIC") sudah benar — hanya nilai placeholder yang ter-copy dari field "Nomor HP badan usaha" di atasnya. Perbaikan cukup mengubah satu string di komponen form, tanpa perubahan BE.'),
      h('Dampak'),
      p('Pengguna dapat salah mengisi nomor HP badan usaha ke kolom PIC. Tidak memblokir penyimpanan karena field ini opsional (tanpa tanda *).'),
      h('Eviden & Reproduksi Otomatis'),
      p('Screenshot terlampir (field bermasalah dan field pembandingnya ditandai kotak merah).'),
      p('Eviden dapat dihasilkan ulang dengan: npx playwright test tests/bucketAgunan/eviden-bug-report.spec.ts --project=chromium'),
    ],
  },
  {
    id: 'MISMATCH-01',
    parent: 'S2CML-4948',
    summary: '[Defect] [BE] Dropdown ownerCategory debitur Badan Usaha mengirim "001 - Calon Debitur", bukan "003 - Debitur"',
    // Score 3 (ditetapkan QA): pemetaan kategori menyimpang dari requirement.
    score: 3,
    attachments: ['explore-output/bug/MISMATCH-01-kode-003-vs-001.png'],
    adf: [
      h('Langkah Reproduksi'),
      steps([
        `Buka modal "Tambah agunan" pada debitur badan usaha ${APP_BADAN_USAHA} (debtorType=business).`,
        'Masuk ke Step 3 "Informasi kepemilikan".',
        'Buka dropdown "Kategori pemilik agunan".',
      ]),
      h('Expected Result (per matriks TC-4948-04 / TC-4948-13 / TC-4890-BU-02)'),
      p('Dropdown memuat opsi "003 - Debitur" untuk debitur badan usaha yang sudah memiliki fasilitas aktif.'),
      h('Actual Result'),
      p('Dropdown memuat "001 - Calon Debitur"; opsi "003" sama sekali tidak muncul. Daftar lengkap:'),
      code('["001 - Calon Debitur","005 - Pemilik Anggunan","006 - Pengurus Perusahaan",\n "007 - Pemilik Perusahaan","008 - Vendor","009 - Penjamin","010 - Pasangan Penjamin"]'),
      h('Layer Penyebab: BACKEND'),
      p('Diverifikasi dengan menangkap response API saat dropdown dibuka. BE sendiri yang mengirim kode 001 dan tidak mengirim 003 — FE hanya merender apa yang diterima.'),
      code('GET /lossvc/v1/sme/loans/01M482PRSVH5ZMTVZX5QH0VDNZ/dropdowns?type=ownerCategory\n\n' +
        '[200] {"data":[{"code":"001","name":"Calon Debitur"},{"code":"005","name":"Pemilik Anggunan"},\n' +
        ' {"code":"006","name":"Pengurus Perusahaan"},{"code":"007","name":"Pemilik Perusahaan"},\n' +
        ' {"code":"008","name":"Vendor"},{"code":"009","name":"Penjamin"},\n' +
        ' {"code":"010","name":"Pasangan Penjamin"}]}'),
      h('Catatan terhadap AC'),
      bullets([
        'AC S2CML-4948 menulis "BE will always give FE all dropdown, need case if FE cannot handle logic to disable based on logic" — namun BE justru sudah memfilter daftarnya, dan hasil filter untuk debitur Badan Usaha ini tidak memuat 003.',
        'Per tabel "Map Pilihan Dropdown" pada AC: 003 - Debitur dimunculkan apabila Debitur SUDAH memiliki Fasilitas aktif di Bank Sinarmas (dilihat dari Struktur Kredit - part Exposure).',
        'Mohon dicek: apakah status Exposure pada App ID ini memang kosong (sehingga 001 benar), atau logika pemetaan 003 di BE yang belum berjalan.',
        'Auto-fill sendiri berjalan normal: nama badan usaha "PT Bintang Sejahtera" dan nomor legalitas "3578241603710991" terisi otomatis dan bersifat read-only.',
      ]),
    ],
  },
  {
    id: 'MISMATCH-02',
    parent: 'S2CML-4948',
    summary: '[Defect] [BE] Dropdown "Hubungan dengan debitur" tidak tersedia pada kategori "006 - Pengurus Perusahaan"',
    // Score 2 (ditetapkan QA): field hilang / mandatory tidak sesuai.
    score: 2,
    attachments: [
      'explore-output/bug/MISMATCH-02a-kategori-005-ada-hubungan.png',
      'explore-output/bug/MISMATCH-02b-kategori-006-tanpa-hubungan.png',
    ],
    adf: [
      h('Langkah Reproduksi'),
      steps([
        `Buka modal "Tambah agunan" pada debitur badan usaha ${APP_BADAN_USAHA} (debtorType=business).`,
        'Masuk ke Step 3 "Informasi kepemilikan".',
        'Pilih Kategori pemilik agunan = "006 - Pengurus Perusahaan".',
        'Pilih salah satu nama pengurus dari dropdown "Nama".',
        'Amati daftar field yang dirender.',
      ]),
      h('Expected Result (per AC S2CML-4948)'),
      p('AC pada bagian "Triggering Kategori Kepemilikan Agunan Pada saat dipilih adalah Pengurus Perusahaan, atau Pemilik Perusahaan" menyatakan:'),
      code('- Tipe Kepimilikan Agunan (Perorangan/Badan Usaha) - sesuai Tipe organ badan usaha\n' +
        '- Hubungan dengan Debitur : Show All Dropdown, Need Choose One Based on Dropdown\n' +
        '- Hubungan dengan Debitur (McKinsey) : Perusahaan\n' +
        '- Status Kepemilikan : Kepemilikan Bersama'),
      p('Perhatikan bahwa "Hubungan dengan Debitur" dan "Hubungan dengan Debitur (McKinsey)" adalah DUA FIELD BERBEDA. Yang di-set otomatis ke "Perusahaan" adalah field McKinsey (internal BE), sedangkan dropdown "Hubungan dengan Debitur" harus tampil dan dipilih manual oleh user.'),
      h('Actual Result'),
      p('Dropdown "Hubungan dengan debitur" tidak dirender sama sekali pada kategori 006. Combobox yang ada hanya:'),
      code('["006 - Pengurus Perusahaan","Individu","123331231233 - 123331231233"]'),
      p('Sebagai pembanding, kategori "005 - Pemilik Anggunan" MENAMPILKAN dropdown tersebut:'),
      code('["005 - Pemilik Anggunan","Pilih tipe kepemilikan agunan","Pilih hubungan dengan debitur"]'),
      h('Layer Penyebab: BACKEND'),
      p('Diverifikasi dengan menangkap seluruh response API setelah kategori 006 dipilih dan nama pengurus dipilih. Hanya SATU request yang dijalankan:'),
      code('GET /lossvc/v1/sme/loans/{id}/dropdowns?type=shareholderPengurusPerseorangan'),
      p('Tidak ada request untuk mengambil daftar opsi "Hubungan dengan Debitur" (tidak ada type=relationship atau sejenisnya). Bandingkan dengan kategori 005 yang dropdown-nya tampil normal. BE tidak menyediakan opsi hubungan untuk kategori 006, sehingga FE tidak punya data untuk dirender.'),
      h('Dampak'),
      bullets([
        'Field yang per AC bersifat wajib dipilih user sama sekali tidak dapat diisi.',
        'Stepper "Informasi kepemilikan" tetap berubah menjadi "Lengkap" (centang hijau) meski field tersebut tidak terisi — data tersimpan tanpa Hubungan dengan Debitur.',
      ]),
      h('Eviden'),
      p('Dua screenshot terlampir: pembanding kategori 005 (dropdown tampil) dan kategori 006 (dropdown tidak ada, stepper sudah "Lengkap").'),
    ],
  },
  {
    id: 'MISMATCH-03',
    parent: 'S2CML-4949',
    summary: '[Defect] [BE] Dropdown Tipe Kepemilikan Agunan memakai master data JENIS_DEBITUR ("Individu"/"Non Individu"), AC mensyaratkan "Perorangan"/"Badan Usaha"',
    // Score 3 (ditetapkan QA): label menyimpang dari requirement, bukan sekadar kosmetik.
    score: 3,
    attachments: ['explore-output/bug/MISMATCH-03-label-tipe-kepemilikan.png'],
    adf: [
      h('Langkah Reproduksi'),
      steps([
        `Buka modal "Tambah agunan" pada debitur perorangan ${APP_PERORANGAN} (debtorType=individual).`,
        'Masuk ke Step 3 "Informasi kepemilikan".',
        'Pilih Kategori pemilik agunan = "005 - Pemilik Anggunan".',
        'Buka dropdown "Tipe kepemilikan agunan".',
      ]),
      h('Expected Result (per AC S2CML-4949)'),
      p('AC menulis eksplisit pada bagian "Kondisi Kategori Pemilikan dipilih 005-Pemilik Agunan, atau 008-Vendor":'),
      code('- Tipe Kepemilikan, Dropdown : Perorangan / Badan Usaha'),
      p('AC S2CML-4948 juga memakai istilah yang sama: "Tipe Kepimilikan Agunan (Perorangan/Badan Usaha)".'),
      h('Actual Result'),
      p('Dua opsi: "Individu" dan "Non Individu". Jumlah opsi sudah benar (tepat 2), hanya labelnya berbeda dari AC.'),
      h('Layer Penyebab: BACKEND (master data)'),
      p('Diverifikasi dengan menangkap response API saat dropdown dibuka. Label datang dari master data BE, bukan hardcode FE:'),
      code('GET /lossvc/v1/config/dropdowns?type=JENIS_DEBITUR&segment=SME&limit=1000\n\n' +
        '[200] {"data":[{"type":"JENIS_DEBITUR","code":"1","value":"Individu","segment":"SME"},\n' +
        '               {"type":"JENIS_DEBITUR","code":"2","value":"Non Individu","segment":"SME"}]}'),
      h('Akar Masalah — perlu keputusan tim'),
      p('FE memanggil master data bertipe JENIS_DEBITUR untuk mengisi field "Tipe Kepemilikan Agunan". Keduanya konsep berbeda: jenis debitur vs tipe kepemilikan agunan. Ada dua kemungkinan perbaikan:'),
      bullets([
        'Opsi A — BE menyediakan tipe dropdown tersendiri untuk Tipe Kepemilikan Agunan dengan value "Perorangan"/"Badan Usaha" sesuai AC, lalu FE diarahkan memanggil tipe tersebut.',
        'Opsi B — value pada master data JENIS_DEBITUR disesuaikan menjadi "Perorangan"/"Badan Usaha". Risiko: master data ini kemungkinan dipakai bucket lain, sehingga perubahannya berdampak luas.',
      ]),
      p('Catatan: "Individu"/"Non Individu" adalah terminologi SLIK/OJK, sedangkan "Perorangan"/"Badan Usaha" dipakai pada AC dan bucket Identitas. Mohon keputusan BA/dev mengenai opsi mana yang diambil.'),
    ],
  },
];

function buildPayload(d) {
  const fields = {
    project: { key: PROJECT_KEY },
    parent: { key: d.parent },
    issuetype: { id: ISSUETYPE_DEFECT_ID },
    summary: d.summary,
    priority: { name: PRIORITY_DEFAULT },
    [CF_ENVIRONMENT]: { value: 'SIT' },
    [CF_DEFECT_SCORE]: d.score,
    description: { type: 'doc', version: 1, content: d.adf },
  };
  return { fields };
}

const auth = 'Basic ' + Buffer.from(`${(email || '').trim()}:${(apiToken || '').trim()}`).toString('base64');

async function createIssue(payload) {
  const res = await fetch(`https://${domain}/rest/api/3/issue`, {
    method: 'POST',
    headers: { Authorization: auth, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create ${res.status} ${res.statusText} :: ${(await res.text()).slice(0, 600)}`);
  return res.json();
}

async function uploadAttachment(issueKey, filePath) {
  const abs = path.resolve(filePath);
  const buf = fs.readFileSync(abs);
  const form = new FormData();
  form.append('file', new Blob([buf], { type: 'image/png' }), path.basename(abs));

  const res = await fetch(`https://${domain}/rest/api/3/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: { Authorization: auth, Accept: 'application/json', 'X-Atlassian-Token': 'no-check' },
    body: form,
  });
  if (!res.ok) throw new Error(`attach ${res.status} ${res.statusText} :: ${(await res.text()).slice(0, 400)}`);
  return res.json();
}

(async () => {
  const terpilih = ONLY ? DEFECTS.filter((d) => d.id === ONLY) : DEFECTS;
  if (terpilih.length === 0) {
    console.error(`Tidak ada defect dengan id "${ONLY}". Pilihan: ${DEFECTS.map((d) => d.id).join(', ')}`);
    process.exit(1);
  }

  const outDir = path.resolve(__dirname, '../../explore-output/jira');
  fs.mkdirSync(outDir, { recursive: true });

  // Validasi berkas eviden ada sebelum apa pun dikirim
  let adaYangHilang = false;
  for (const d of terpilih) {
    for (const a of d.attachments) {
      if (!fs.existsSync(path.resolve(a))) {
        console.error(`Eviden tidak ditemukan: ${a}`);
        adaYangHilang = true;
      }
    }
  }
  if (adaYangHilang) {
    console.error('\nJalankan dulu: npx playwright test tests/bucketAgunan/eviden-bug-report.spec.ts --project=chromium');
    process.exit(1);
  }

  for (const d of terpilih) {
    const payload = buildPayload(d);
    const outFile = path.join(outDir, `${d.id}.json`);
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));

    console.log(`\n=== ${d.id} ===`);
    console.log(`parent    : ${d.parent}`);
    console.log(`summary   : ${d.summary}`);
    console.log(`priority  : ${PRIORITY_DEFAULT} | Environment: SIT | Defect Score: ${d.score}`);
    console.log(`attachment: ${d.attachments.join(', ')}`);
    console.log(`payload   : ${outFile}`);

    if (!COMMIT) continue;

    const issue = await createIssue(payload);
    console.log(`DIBUAT    : ${issue.key} -> https://${domain}/browse/${issue.key}`);
    for (const a of d.attachments) {
      await uploadAttachment(issue.key, a);
      console.log(`  attached: ${path.basename(a)}`);
    }
  }

  if (!COMMIT) {
    console.log('\n--- DRY RUN. Tidak ada yang ditulis ke Jira. ---');
    console.log('Untuk benar-benar membuat issue, tambahkan flag --commit.');
  }
})().catch((err) => {
  console.error('Gagal:', err.message);
  process.exit(1);
});
