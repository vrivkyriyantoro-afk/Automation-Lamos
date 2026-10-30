  # PROJECT HISTORY — automation-lamos

> File konteks bersama untuk semua LLM / agent (Claude, Gemini, GPT, Copilot, dll.) dan developer.
> Baca file ini **sebelum** mengubah kode. Aturan update ada di **[AGENTS.md](AGENTS.md)**:
> tambah entri di **6. Riwayat** (template di AGENTS.md bagian 3) dan perbarui **7. Status & TODO** setiap selesai satu sesi.

Terakhir diperbarui: **2026-10-30**

### 2026-10-30 — Sanitasi push GitHub: hapus secret dari branch (Copilot SDK in VS Code)
- Dikerjakan: membersihkan branch `bucketAgunan` dari file `.env` yang terdeteksi sebagai secret oleh GitHub push protection, menambahkan aturan `.env` ke `.gitignore`, dan menyiapkan commit baru tanpa token Figma/Atlassian yang sebelumnya masuk ke commit terakhir.
- Verifikasi: `git push origin HEAD` -> gagal karena GH013 push protection memblokir secret di `.env`; setelah `git reset --soft HEAD~1`, `git rm --cached -f .env`, dan commit ulang, push berikutnya harus bisa lolos bila file sensitif benar-benar dihilangkan dari history/range branch.
- Belum selesai / gagal: menunggu validasi final push setelah commit sanitasi selesai.
- Keputusan user: -

### 2026-10-29 — Validasi Modul 3 Pengikatan Agunan (Copilot SDK in VS Code)
- Dikerjakan: menilai dan memvalidasi [tests/bucketAgunan/modul3-pengikatan.spec.ts](tests/bucketAgunan/modul3-pengikatan.spec.ts) serta pola selector/conditional field untuk status agunan Tersedia vs Indent; tidak ada perubahan kode karena skenario yang diimplementasikan sudah sesuai dengan aturan DOM v2 dan hasil aplikasi SIT.
- Verifikasi: `npx playwright test tests/bucketAgunan/modul3-pengikatan.spec.ts --project=chromium --reporter=line` -> `4 passed (1.3m)` ✅.
- Belum selesai / gagal: -
- Keputusan user: -

---

## 1. Ringkasan proyek

Test automation (Playwright + TypeScript) untuk **LAMOS** (Loan Application Management / Origination System) Bank Sinarmas, lingkungan **SIT**:

- App: `https://los-fe-coreloan-sit.devs.banksinarmas.com/`
- Login SSO (redirect ke `access-sit` / `auth-broker` / `kratos`), ditangani `pages/LoginPage.ts`
- Halaman utama yang diotomasi: **Buat pengajuan kredit**
  `/lamos/credit-application/<applicationId>/create?bucket=<bucketId>&debtorType=individual`
- Application ID yang dipakai saat explore: `01M483P7DDHBV41Z5QPV0FM8Q9` (debitur individual, data sudah sebagian terisi)

Konfigurasi di `.env`: `BASE_URL`, `LAMOS_USERNAME`, `LAMOS_PASSWORD`, `DOC_UPLOAD_DIR`, `DEBITUR_TARGET`.
**Jangan menyalin isi `.env` (kredensial) ke prompt / file lain.**

Stack: `@playwright/test ^1.63`, `dotenv`, TypeScript dikompilasi oleh Playwright (tidak ada `tsconfig.json`; TypeScript tidak terpasang sebagai dependency).

---

## 2. Struktur aplikasi (hasil explore)

### 2.1 Bucket (tab) — `[role="tab"]`, `id` = bucket id

| Bucket id | Judul tab | Folder page object | Status |
|---|---|---|---|
| `identitas_pengecekan` | Identitas dan Pengecekan | `pages/bucketIdentitas/` | ✅ generated + smoke test lolos |
| `struktur_kredit` | Struktur Kredit | `pages/bucketStrukturKredit/` | ✅ generated |
| `penilaian_kelayakan` | Penilaian Kelayakan | `pages/bucketPenilaianKelayakan/` | ✅ generated |
| `data_usaha` | Data Usaha | `pages/bucketDataUsaha/` | ✅ generated |
| `agunan` (dulu tercatat `collateral`) | Agunan | `pages/bucketAgunan/` (kosong) | ⏸️ **di-skip atas permintaan user** |
| `analisa_keuangan` | Analisa Keuangan | `pages/bucketAnalisaKeuangan/` | ✅ generated |
| `legal_risk_compliance` | Legal, Risk, & Compliance | `pages/bucketLegalRiskCompliance/` | ✅ generated |
| `dokumen` | Dokumen | `pages/bucketDokumen/` | 🟡 manual, pohon dokumen parsial |
| `covenant_tbo` | Covenant & TBO | `pages/bucketCovenantTBO/` | ✅ generated |
| `penyimpangan_pihak_terkait` | Penyimpangan & Pihak Terkait | `pages/bucketPenyimpanganPihakTerkait/` | ✅ generated |
| `catatan_anda` | Catatan Anda | `pages/bucketCatatanAnda/` | ✅ generated |

`pages/bucketBankStatementAnalysis/` sengaja **kosong**: bucket itu **belum ada** di aplikasi (disiapkan user untuk nanti). Jangan dipindah isinya ke sana.

### 2.2 Layout halaman

- Kiri: `aside` berisi tombol section + status (`Lengkap`, `Belum Lengkap`, `Sudah diisi (opsional)`, `Belum dapat diakses` = disabled).
- Kanan: `section.min-w-0.flex-1` berisi **Collapsible** per section (`[class*="Collapsible-module_container__"]`, judul `[class*="Collapsible-module_label"]`).
- Accordion bersifat **single-open**: membuka satu section menutup section lain.
- Tombol global: `Lanjutkan`, `Kirim`.
- Field sering dimuat **async (skeleton abu-abu)**. Action Playwright (fill/click) aman karena auto-wait; pengecekan `count()` yang instan tidak aman.

### 2.3 Konvensi DOM (design system) — dasar semua selector

| Kontrol | Selector stabil | Catatan |
|---|---|---|
| Text / textarea | `input[name="..."]` / `textarea[name="..."]` | `name` dari react-hook-form, mis. `identityAddress.rt`. **`id` tidak stabil** (suffix `-r0`, `-r1b`) |
| Currency | `input[data-testid="currency-input"][name=...]` | prefix "Rp", format ribuan otomatis |
| Date | react-datepicker, `input[name=...]` | format tampilan `"01 Jan 1966"` |
| Dropdown | `[role="combobox"][data-testid="dropdownsearch"][id^="<key>-r"]` | opsi: `#<id>-listbox li:not(.sticky) button` (item sticky = "Clear"); search: `[data-testid="dropdownsearch-input-search"]`; disabled: `aria-disabled="true"` |
| Radio | `getByRole('radiogroup', { name: label })` | label via `aria-labelledby`; tanda `*` ber-`aria-hidden` |
| Checkbox | `[data-testid="checkbox-container"]` > `div[role="checkbox"][aria-checked]` + `[data-testid="checkbox-label"]` | custom, `aria-hidden` → **tidak bisa** `getByRole('checkbox')` |
| File upload | `input[type="file"][id="ktpFiles"]` dll. | di bucket Dokumen id dinamis (`:r0:`) |
| Rich text | `[contenteditable="true"]` (label `for="rich-text-editor"`) | Covenant |
| Tabel kriteria | `table[data-testid="table"]` + react-select `knockout-result-select__*` | Pass/Fail per baris; baris "Otomatis terisi" disabled |
| Field berulang | `name` berindeks: `usahaArray.0.dataUsaha.1.name`, dropdown `supplierType-1` | indeks terakhir = nomor baris |
| Field per penjamin | `input[name="personalGuarantee.name"]`, dropdown `[id^="personalGuarantee.gender_"]` | id = `<name>_<guarantorId>-r..`; `name` stabil. Dropdown prefix `key-r` tidak cocok → pakai prefix `key_` |
| Modal pengurus/pemegang saham | `div` yang memuat `h4` "Tambah pengurus/pemegang saham" + tombol "Batalkan" | **tanpa** `role=dialog`; tombol & radiogroup di dalamnya **tidak punya accessible name** → `getByRole` gagal, pakai CSS/teks/`input[name]` |
| Dropdown wilayah | search async | nama master beda format: "DKI Jakarta", "Jakarta Pusat, Wil. Kota". Tunggu hasil search stabil sebelum klik (lihat `selectWilayah` di `PenjaminForms.ts`) |

---

## 3. Arsitektur kode

```
AGENTS.md                       # aturan untuk semua LLM/agent (sumber utama)
GEMINI.md, CLAUDE.md, .github/copilot-instructions.md   # penunjuk ke AGENTS.md
PROJECT_HISTORY.md              # file ini
pages/
  LoginPage.ts                  # login SSO
  CreditApplicationPage.ts      # list pengajuan kredit (lama)
  components/
    FormControls.ts             # TextInput, CurrencyInput, DateInput, Dropdown, RadioGroup,
                                # Checkbox, FileUpload, RichTextEditor, CriteriaTable, escapeRegex, pageOf
    BucketSection.ts            # BucketId, CreditApplicationForm (goto/openBucket/sidebar),
                                # BucketSection (root/open/button), ModalForm
  bucket<Nama>/
    <Section>Section.ts         # AUTO-GENERATED, satu class per section collapsible
    sections.ts                 # AUTO-GENERATED index (export *)
    *Page.ts, index.ts          # (bucketIdentitas) page object LAMA buatan user — selector tebakan, tidak disentuh
  bucketIdentitas/PenjaminForms.ts  # MANUAL: DataPenjaminForm (Personal/Corporate Guarantee + pasangan) & PengurusModal
  bucketDokumen/
    DocumentBucketPage.ts       # page object LAMA buatan user (upload & kategorisasi)
    DokumenSection.ts           # BARU, manual: upload, staging, kategori bertingkat, status pohon dokumen
    dokumenTree.ts              # konstanta pohon dokumen (PARSIAL)
scripts/
  generate-pages.js             # JSON explore -> page object TS
tests/                          # root = lintas bucket; spec khusus bucket di tests/bucket<Nama>/ (nama folder sama dengan pages/)
  explore-all-buckets.spec.ts   # explorer read-only semua bucket (fase 1 + 2)
  explore-probe.spec.ts         # probe sekali pakai (debug DOM), boleh dihapus
  sections-locator-smoke.spec.ts# verifikasi semua locator generated ditemukan di app (read-only)
  login.spec.ts
  bucketIdentitas/              # identitas-pengecekan, penjamin-*, data-penjamin-*, input-pengurus-*, explore-pengurus-*, explore-penjamin-*
  bucketDokumen/                # explore-dokumen, explore-mandatory-docs, inspect-doc-dropdowns, document-bucket, bulk-upload-mandatory, credit-application
  bucketAgunan/                 # explore-agunan-dropdown
explore-output/                 # hasil explore: <bucket>.json, .html, .png, dokumen-tree.json
```

### 3.1 Pola class hasil generate

```ts
export interface DataPribadiData { maritalStatus?: 'Menikah' | 'Belum Menikah' | 'Janda / Duda'; ... }

export class DataPribadiSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data pribadi';            // judul collapsible persis
  readonly sidebarTitle = 'Data pribadi';     // item sidebar (opsional)
  get maritalStatus() { return new Dropdown(this.root, 'maritalStatus'); }
  async fill(data: DataPribadiData) { ... }   // urut sesuai UI, field undefined dilewati
}
```

- Union type opsi dropdown dibuat bila ≤ 40 opsi dan bukan dropdown wilayah bertingkat (province/city/district/subdistrict → `string`).
- Field disabled (auto-fill sistem) dilewati dengan `console.warn`, bukan error.
- Field berulang → class `<Section><Array>Row` + method `section.<array>(index)`; `fill({ <array>: [...] })` otomatis klik tombol tambah ("+ Usaha" / "Tambah baris") bila baris belum ada.
- Tabel Pass/Fail → `section.criteria.setResult(3, 'Pass')`.

### 3.2 Contoh pemakaian

```ts
import { CreditApplicationForm } from '../pages/components/BucketSection';
import { DataPribadiSection } from '../pages/bucketIdentitas/sections';

const form = new CreditApplicationForm(page);
await form.goto(APPLICATION_ID, 'identitas_pengecekan');
const dataPribadi = await new DataPribadiSection(page).open();
await dataPribadi.fill({ maritalStatus: 'Menikah', npwp: '1234567890123456' });
await form.btnLanjutkan.click();
```

---

## 4. Workflow / perintah

```bash
# 1. Explore ulang (read-only; dropdown hanya dibuka lalu Escape, tombol "+ Tambah" dibuka lalu ditutup tanpa simpan)
npx playwright test tests/explore-all-buckets.spec.ts --project=chromium --output=<dir di luar test-results>
#   env: EXPLORE_URL, EXPLORE_BUCKETS=a,b (filter), EXPLORE_OUT (default explore-output), EXPLORE_MODALS=0 (matikan fase 2)
npx playwright test tests/bucketDokumen/explore-dokumen.spec.ts --project=chromium

# 2. Generate page object
node scripts/generate-pages.js                 # tulis file yang belum ada
node scripts/generate-pages.js --force         # timpa file AUTO-GENERATED
node scripts/generate-pages.js --only=data_usaha

# 3. Verifikasi locator ke app asli (read-only)
APPLICATION_ID=<id> npx playwright test tests/sections-locator-smoke.spec.ts --project=chromium --workers=2

# 4. Typecheck (TypeScript tidak terpasang di project)
npx -y -p typescript@5 tsc --noEmit --strict --target es2022 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --types node <files...>
```

Aturan generator: file yang **tidak** diawali `// AUTO-GENERATED` tidak pernah ditimpa. Mapping bucket → folder ada di `BUCKET_FOLDERS` (`scripts/generate-pages.js`).

---

## 5. Gotcha (pelajaran dari sesi sebelumnya)

1. **Playwright menghapus `test-results/` setiap run** → simpan output explore di `explore-output/`, dan jangan menulis log ke dalam `test-results/` (di Windows file terkunci → run macet).
2. Accordion single-open → buka & ekstrak section **satu per satu**.
3. Skeleton loading → tunggu jumlah kontrol stabil / pakai `waitFor`, jangan `count()` instan.
4. Locator di dalam `filter({ has })` harus dibuat dari `page`, bukan dari locator berantai (`root.locator(...)`), kalau tidak selector dicari relatif dua kali.
5. Hindari `eval` di `page.evaluate` (bisa diblok CSP).
6. Selalu beri timeout pada `click()` di explorer; klik tanpa timeout pernah macet 10 menit.
7. Folder case-sensitive di CI Linux: pakai `bucketCovenantTBO` (huruf besar) sesuai folder user.
8. Git Bash di mesin user kadang crash (`add_item ... errno 1`) → pakai PowerShell. PowerShell 5.1: tidak ada `&&`; untuk skrip node multi-baris pakai here-string `@' ... '@ | node -`.
9. **Data Penjamin tersimpan sebagian otomatis**: section ini tidak punya tombol Simpan. Radio "Debitur memiliki penjamin? = Ya" dan tipe penjamin ikut tersimpan di server (terbukti persist antar run); isian field penjamin TIDAK persist tanpa aksi lain. Teks dropdown `typeGuarantee` bisa tidak sinkron dengan form yang tampil → selalu pilih ulang.
10. Field alamat di modal pengurus baru muncul setelah radio Negara dipilih. Simpan modal tetap disabled tanpa upload dokumen identitas.
11. **Timeout SIT Bank Sinarmas**: Proses redirect SSO Kratos dan initial render bundle React bucket pengajuan kredit membutuhkan waktu 60-90 detik. Alokasikan `test.setTimeout(180000)` (3 menit) di `beforeEach` agar tidak terkena `Tearing down context exceeded timeout` pada sesi pengujian.
12. **Locator Combobox Modal Agunan**: Hindari penggunaan `.locator('[role="combobox"], button').last()` pada container yang memiliki teks field karena container luar dapat mencakup modal footer (tombol `Simpan`). Gunakan locator spesifik `[role="combobox"]` yang memfilter teks placeholder awal atau teks label terkait (misal: `page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first()`).
13. **Radio Button Sibling Pattern pada Form Agunan**: Pada grup radio (misal: Apakah LPA sudah tersedia?), label pertanyaan dan opsi Ya/Tidak berada sebagai sibling di dalam satu container. Gunakan container pembungkus yang memfilter teks pertanyaan dan teks opsi (`page.locator('div').filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') }).filter({ hasText: /Ya/ }).filter({ hasText: /Tidak/ }).last()`) dan gunakan regex `/^\s*Tidak\s*$/i` agar tidak salah menargetkan radio button lain di form.

---

## 6. Riwayat

### 2026-10-30 — Reorganisasi Struktur Folder Test Agunan: perseorangan/ dan badanUsaha/ (Gemini via Antigravity)
- Dikerjakan:
  - Memisahkan seluruh berkas pengujian otomatis di `tests/bucketAgunan/` ke dalam 2 folder terpisah sesuai arahan user:
    - `tests/bucketAgunan/perseorangan/`: `s2cml-4889.spec.ts`, `modul2-informasi-umum.spec.ts`, `modul3-pengikatan.spec.ts`, `modul4-alamat.spec.ts`, `s2cml-4890.spec.ts` (Debitur: `01M4F7TNSCSHEDB5G3WTSP7HDY`, `debtorType=individual`).
    - `tests/bucketAgunan/badanUsaha/`: `s2cml-4889.spec.ts`, `s2cml-4890.spec.ts` (Debitur: `01M482PRSVH5ZMTVZX5QH0VDNZ`, `debtorType=business`).
  - Memperbarui path import relatif (`../../../pages/LoginPage`) pada seluruh berkas hasil perpindahan.
- Verifikasi: `npx playwright test tests/bucketAgunan/ --list --project=chromium` -> total 32 tests in 9 files terdeteksi valid dan lolos verifikasi sintaks ✅.
- Belum selesai / gagal: -
- Keputusan user: pengujian diorganisasikan ke dalam 2 folder: perseorangan dan badan usaha.

### 2026-10-30 — Verifikasi Otomasi Agunan Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ) Lolos di SIT (Gemini via Antigravity)
- Dikerjakan:
  - Memperbarui matriks `exports/TC_S2CML-4890_Bucket_Agunan.xlsx` dan `.csv` dengan menambahkan kolom `Tipe Debitur` (`Perorangan`, `Badan Usaha`, atau `Perorangan & Badan Usaha`) mencakup 25 Test Cases.
  - Mengimplementasikan skrip pengujian khusus Debitur Badan Usaha di `tests/bucketAgunan/s2cml-4890-badan-usaha.spec.ts` dengan target application ID `01M482PRSVH5ZMTVZX5QH0VDNZ` (`debtorType=business`).
  - Menguji keselarasan form modal Agunan dan 3-step navigation pada profil perusahaan.
- Verifikasi: `npx playwright test tests/bucketAgunan/s2cml-4890-badan-usaha.spec.ts --project=chromium` -> 1 passed (58.3s) ✅.
  - TC-4890-BU-01: Modal Agunan & Stepper 3-Step terbukti tampil dan navigasi paralel Step 2 aktif pada profil Badan Usaha (44.8s) ✅.
- Belum selesai / gagal: -
- Keputusan user: pengujian debitur badan usaha menggunakan ID 01M482PRSVH5ZMTVZX5QH0VDNZ.

### 2026-10-30 — Otomasi & Verifikasi Penuh 6 TC Story S2CML-4890 (Stepper, Gating Identitas, Rules) Lolos di SIT (Gemini via Antigravity)
- Dikerjakan:
  - Membuat paket living spec `specs/bucket-agunan/S2CML-4890/` (`spec.md`, `tasks.md`).
  - Mengimplementasikan skrip pengujian Playwright `tests/bucketAgunan/s2cml-4890.spec.ts` untuk Story S2CML-4890 mencakup 6 Test Cases: TC-4890-01 (Default step Informasi Umum status Belum Lengkap), TC-4890-02 (3-Step side navigation stepper), TC-4890-03 (Navigasi paralel antar step), TC-4890-06 (Gating validasi Bucket Identitas memblokir akses Step 3), TC-4890-11 (Tombol Simpan disabled & Simpan draft enabled saat form belum lengkap), dan TC-4890-14 (Default Tipe Penilaian Internal saat LPA = Tidak sesuai Jira S2CML-6756).
- Verifikasi:
  - `npx playwright test tests/bucketAgunan/s2cml-4890.spec.ts --project=chromium` -> 6 passed (1.3m) ✅
    - TC-4890-01: Default Step Informasi Umum Belum Lengkap (13.2s) ✅
    - TC-4890-02: 3-Step Side Navigation Terverifikasi (11.7s) ✅
    - TC-4890-03: Navigasi Paralel bebas berpindah ke Step 2 (12.4s) ✅
    - TC-4890-06: Gating Bucket Identitas memblokir Step 3 (14.4s) ✅
    - TC-4890-11: Tombol Simpan disabled dan Draft aktif (12.1s) ✅
    - TC-4890-14: LPA "Tidak" default Tipe Penilaian "Internal" (13.3s) ✅
- Belum selesai / gagal: -
- Keputusan user: menganalisis dan mendokumentasikan kendala data testing (Gating Identitas Lengkap, Max 100 limit, CIF BDS/CLS) sebelum mengeksekusi sisa skenario.

### 2026-10-29 — Pembuatan Matriks Test Case Story S2CML-4890 (22 TCs: 11 Positive, 11 Negative) (Gemini via Antigravity)
- Dikerjakan:
  - Membaca User Story & Acceptance Criteria Jira S2CML-4890 (Part 2: 3-step navigation, indikator status, gating identitas, max 100 entry, simpan draft, final submit) beserta linked issues dan data dictionary Excel.
  - Merancang 22 Test Cases komprehensif mencakup 11 Positive dan 11 Negative & Boundary cases fungsional/logika bisnis (tidak menggunakan simulasi network resilience / failure sesuai arahan user).
  - Mengekspor berkas ke `exports/TC_S2CML-4890_Bucket_Agunan.xlsx` dan `exports/TC_S2CML-4890_Bucket_Agunan.csv`.
- Verifikasi: pembacaan Jira S2CML-4890 via `scripts/read-atlassian.js` 200 OK ✅; ekspor 22 TCs ke berkas .xlsx (8.2KB) dan .csv (5.9KB) terverifikasi valid ✅.
- Belum selesai / gagal: -
- Keputusan user: pengujian resilience/koneksi jaringan pada Simpan/Draft tidak digunakan; fokus pada negative test case fungsional dan aturan bisnis form.

### 2026-10-29 — Otomasi & Verifikasi Penuh Modul 3 (Pengikatan: TC-04-27 s.d 30) & Modul 4 (Alamat: TC-04-31 s.d 35) Lolos di SIT (Gemini via Antigravity)
- Dikerjakan:
  - Membuat `tests/bucketAgunan/modul3-pengikatan.spec.ts` (4 TCs: TC-04-27 s.d TC-04-30).
  - Membuat `tests/bucketAgunan/modul4-alamat.spec.ts` (5 TCs: TC-04-31 s.d TC-04-35).
  - Mengupdate task checklist di `specs/bucket-agunan/S2CML-4889/tasks.md`.
- Verifikasi:
  - `npx playwright test tests/bucketAgunan/modul3-pengikatan.spec.ts --project=chromium` -> 4 passed (1.3m) ✅
    - TC-04-30: Status Tersedia menampilkan field Jenis Pengikatan & Tanggal Pengikatan (17.9s) ✅
    - TC-04-29: Status Indent menyembunyikan field Jenis Pengikatan & Tanggal Pengikatan (14.4s) ✅
    - TC-04-27: Tanggal pengikatan wajib bila jenis pengikatan ≠ 06 (Hak Tanggungan -> label memiliki tanda *) (18.2s) ✅
    - TC-04-28: Tanggal pengikatan opsional bila jenis pengikatan = 06 (Belum diikat -> label tanpa tanda *) (21.9s) ✅
  - `npx playwright test tests/bucketAgunan/modul4-alamat.spec.ts --project=chromium` -> 5 passed (2.0m) ✅
    - TC-04-32: Sub-location (Kota/Kecamatan) tidak menampilkan data saat parent location belum dipilih (21.7s) ✅
    - TC-04-31: List dropdown Kecamatan berurutan secara alfabetis (A-Z) (26.0s) ✅
    - TC-04-33: Mengubah Provinsi otomatis me-reset field child (Kota & Kecamatan) kembali ke placeholder awal (26.2s) ✅
    - TC-04-34: Validasi Kode Pos non-angka ("ABC!@#") menampilkan alert error (19.4s) ✅
    - TC-04-35: Input Kode Pos dengan angka valid ("10110") lolos tanpa error (19.0s) ✅
- Belum selesai / gagal: -
- Keputusan user: menyetujui pengujian otomatis Modul 3 dan Modul 4 pada debitur perorangan (ID: `01M4F7TNSCSHEDB5G3WTSP7HDY`).

### 2026-10-29 — Otomasi & Verifikasi Penuh Modul 2: Informasi Umum Agunan (TC-04-20 s.d TC-04-26) Lolos di SIT (Gemini via Antigravity)
- Dikerjakan:
  - Membuat test suite `tests/bucketAgunan/modul2-informasi-umum.spec.ts` untuk mengotomasi Modul 2 (Informasi Umum Agunan) mencakup 7 test case: TC-04-20 (Urutan jenis agunan master data), TC-04-21 (Detail isian Housing status Tersedia), TC-04-22 & 23 (Kondisional field Lembaga Pemeringkat pada Tersedia vs Indent), dan TC-04-24, 25, 26 (Dropdown Lembaga Pemeringkat, Rating Agunan, dan placeholder warning).
- Verifikasi: `npx playwright test tests/bucketAgunan/modul2-informasi-umum.spec.ts --project=chromium` -> 4 passed (1.2m) ✅.
  - TC-04-20: Berhasil membaca 58 opsi jenis agunan di UI sesuai master data (13.8s) ✅
  - TC-04-21: Memilih status Tersedia dan memvalidasi tampilan pengikatan & alamat (22.0s) ✅
  - TC-04-22 & 23: Field Lembaga Pemeringkat terbukti hilang pada status Indent dan muncul kembali pada status Tersedia (17.6s) ✅
  - TC-04-24, 25, 26: Dropdown Lembaga Pemeringkat (Fitch, Moody's, Pefindo, S&P) berhasil dibaca, rating (AAA, AA, A, BBB, dst.) tervalidasi, dan placeholder "Pilih lembaga pemeringkat terlebih dahulu" terverifikasi saat belum memilih lembaga (17.3s) ✅
- Belum selesai / gagal: -
- Keputusan user: menyetujui pembuatan dan eksekusi skrip otomatisasi untuk Modul 2 terlebih dahulu.

### 2026-10-28 — Penyempurnaan Eviden Screenshot TC-04-06 (Fokus Modal & Stabilisasi) (Gemini via Antigravity)
- Dikerjakan:
  - Menyempurnakan penangkapan eviden pada `TC-04-06` di `tests/bucketAgunan/s2cml-4889.spec.ts` dengan menambahkan jeda 2 detik pasca pencarian selesai.
  - Mengambil screenshot spesifik pada elemen dialog (`dialog.screenshot()`) dan membiarkan modal tetap terbuka di akhir test agar screenshot otomatis bawaan Playwright (`test-finished.png`) menangkap modal aktif beserta tombol `+ Agunan Baru` dan pesan *"Data tidak ditemukan"*.
- Verifikasi: `npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts -g "TC - 04 - 06" --project=chromium` -> 1 passed (41.8s) ✅. Eviden terkonfirmasi menampilkan modal terbuka dan tombol `+ Agunan Baru` dengan jelas.
- Belum selesai / gagal: -
- Keputusan user: memperbaiki timing screenshot eviden TC-04-06 agar modal tidak tertutup sebelum di-capture.

### 2026-10-28 — Eksekusi Penuh & Verifikasi Lolos 5/5 TC Modul 1 Search Agunan di SIT (Gemini via Antigravity)
- Dikerjakan: menjalankan dan memverifikasi seluruh 5 test case pada Modul 1 (Search Agunan) di `tests/bucketAgunan/s2cml-4889.spec.ts` (`TC-04-01`, `TC-04-02`, `TC-04-03`, `TC-04-05`, `TC-04-06`) dari master CSV Story `S2CML-4889`.
- Verifikasi: `npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts --project=chromium` -> 5 passed (2.2m) ✅.
  - TC-04-01: Modal dan stepper Tambah Agunan berhasil dibuka & ditutup aman (21.7s) ✅
  - TC-04-02: Tombol Cari tetap disabled jika Jenis Agunan belum dipilih (21.5s) ✅
  - TC-04-03: Tombol Cari aktif saat kriteria wajib (Jenis + Nomor Bukti) terisi (27.5s) ✅
  - TC-04-05: Tombol "+ Agunan Baru" terbukti tidak muncul sebelum tombol Cari diklik (22.7s) ✅
  - TC-04-06: Tombol "+ Agunan Baru" dan pesan "Data tidak ditemukan" tampil saat data fiktif dicari di CLS (30.5s) ✅
- Belum selesai / gagal: -
- Keputusan user: menyetujui eksekusi bertahap seluruh test case per modul, dimulai dari Modul 1.

### 2026-10-28 — Verifikasi Eksekusi TC-04-01 Story S2CML-4889 Lolos di SIT dengan Eviden Video & Screenshot (Gemini via Antigravity)
- Dikerjakan:
  - Menyempurnakan timeout per-test menjadi 180s di `tests/bucketAgunan/s2cml-4889.spec.ts`.
  - Mengonfirmasi penangkapan artifak eviden bawaan Playwright (`screenshot`, `video`, `trace`) serta custom attachment (`testInfo.attach`) untuk kebutuhan audit/dokumentasi.
- Verifikasi:
  - `npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts -g "TC - 04 - 01" --project=chromium` -> 1 passed (2.0m) ✅.
  - Artifak eviden terverifikasi di folder `test-results/`: `video.webm` (1.8MB), `test-finished-1.png` (103KB), dan `trace.zip` (5MB).
  - Laporan HTML otomatis tersimpan di `playwright-report/index.html`.
- Belum selesai / gagal: -
- Keputusan user: laporan dan eviden menggunakan fitur bawaan Playwright (rekaman video & screenshot).

### 2026-10-28 — Implementasi Otomasi Playwright dari Master CSV TC Story S2CML-4889 (Gemini via Antigravity)
- Dikerjakan:
  - Membaca dan memetakan 82 Test Cases dari file acuan `fixtures/TemplateAutomateLamos - Sheet1.csv` milik PIC Rivky untuk Story `S2CML-4889` (Epic `LP-5685`).
  - Membuat file test Playwright `tests/bucketAgunan/s2cml-4889.spec.ts` yang mengotomasi Modul 1 (Search Agunan): TC-04-01 (Modal & Stepper), TC-04-02 (Validasi mandatory jenis agunan), TC-04-03 (Tombol cari aktif), TC-04-05 (Tombol agunan baru sebelum/sesudah cari), dan TC-04-06 (Hasil kosong CLS).
  - Mengupdate checklist tugas di `specs/bucket-agunan/S2CML-4889/tasks.md`.
- Verifikasi: `npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts --list` → exit 0, 5 test cases terdaftar dan lolos validasi sintaks ✅. Run ke SIT 🟡 belum diverifikasi.
- Belum selesai / gagal: -
- Keputusan user: pengujian menggunakan master test case dari `fixtures/TemplateAutomateLamos - Sheet1.csv`.

### 2026-10-28 — Struktur Spesifikasi Per Story di dalam Folder Bucket (specs/bucket-agunan/S2CML-4889) (Gemini via Antigravity)
- Dikerjakan:
  - Meningkatkan `scripts/specify.js` (`npm run spec:new <JIRA_KEY>`) agar otomatis mengambil User Story, scope, dan Acceptance Criteria langsung dari Jira API ke dalam folder `specs/<JIRA_KEY>/`.
  - Berhasil membuat paket spesifikasi lengkap untuk Story `S2CML-4889` di `specs/bucket-agunan/S2CML-4889/` (`spec.md`, `plan.md`, `tasks.md`).
- Verifikasi: eksekusi `node scripts/specify.js S2CML-4889` exit 0, file `spec.md` memuat GIVEN/WHEN/THEN AC lengkap dari Jira ✅.
- Belum selesai / gagal: -
- Keputusan user: pengelompokan spesifikasi dibuat per folder per Jira Story (contoh: `specs/S2CML-4889/`).

### 2026-10-28 — Integrasi Atlassian Jira Cloud & Injeksi Acceptance Criteria ke Spec (Gemini via Antigravity)
- Dikerjakan:
  - Membuat `scripts/read-atlassian.js` (`npm run atlassian:read`) dengan dukungan Jira REST API v3 & Confluence v2 via Basic Auth.
  - Membaca Epic `LP-5685` ("SLP - LAMOS - Origination SME - Phase 2 - Bucket Agunan") dan Story terkait `S2CML-5133` ("Lembar Kerja AO PK : Step 1 Data Agunan & Pengikatan Agunan ke Fasilitas").
  - Menghubungkan Acceptance Criteria (AC Gherkin) dari Jira ke dalam living spec `specs/bucket-agunan/spec.md`.
- Verifikasi: pembacaan Jira Cloud `bank-sinarmas.atlassian.net` berhasil 200 OK dan mengekstrak description serta linked issues ✅.
- Belum selesai / gagal: -
- Keputusan user: menggunakan akun Atlassian v.rivky.riyantoro@banksinarmas.com untuk membaca PRD dan story/AC.

### 2026-10-28 — Implementasi Penuh Arsitektur Gabungan: Spec-Kit, Superpowers, Figma, dan RTK (Gemini via Antigravity)
- Dikerjakan:
  - Spec-Kit: membuat `.specify/constitution.md` (aturan non-negotiable SIT, selector `name`, auto-wait skeleton), skrip `scripts/specify.js` (`npm run spec:new <nama>`), serta living spec pertama di `specs/bucket-agunan/` (`spec.md`, `plan.md`, `tasks.md`).
  - Superpowers: membuat modul agentic skills di `skills/` (`test-driven-development`, `systematic-debugging`, `verification-before-completion`, `using-git-worktrees`).
  - Figma Reader: membuat `scripts/read-figma.js` (`npm run figma:read`) yang berhasil membaca dokumen Figma `LAMOS SME : Phase 1.1 - Agunan, 6C, FPPA`.
  - Package Scripts: menambahkan shortcut npm di `package.json` (`spec:new`, `figma:read`, `test:agunan`).
- Verifikasi: validasi eksekusi pembuatan spec `node scripts/specify.js test-probe` lolos ✅; verifikasi pembacaan struktur Figma lolos ✅; test Playwright agunan validasi sebelumnya terverifikasi 1 passed (15.9s) ✅.
- Belum selesai / gagal: -
- Keputusan user: menyetujui penggabungan lengkap framework perencanaan (spec-kit), metodologi eksekusi AI (superpowers), sumber desain Figma & data Excel, dengan Playwright tetap sebagai mesin utama.

### 2026-10-27 — Panduan Copilot repository (Copilot SDK in VS Code)
- Dikerjakan: memperluas `.github/copilot-instructions.md` dengan perintah Playwright/typecheck, gambaran arsitektur, konvensi selector/generator, dan pengingat keselamatan SIT; mempertahankan arahan yang sudah ada. Memperbarui tanggal file ini.
- Verifikasi: review dokumentasi dan struktur file; tidak menjalankan test karena perubahan dokumentasi saja.
- Belum selesai / gagal: -
- Keputusan user: -

### 2026-10-26 — Detail Agunan app 01M4F7TNSCSHEDB5G3WTSP7HDY, read-only (Claude via Cline)
- Dikerjakan: spec sementara `tests/bucketAgunan/tmp-detail-agunan.spec.ts` (sudah dihapus): login, buka `.../01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`, klik hanya "Tampilkan informasi lengkap" + item sidebar Pengikatan, dump teks. Output: `explore-output/agunan-detail-2026-10-26/` (`1-awal.txt`, `2-expanded.txt/png`, `3-pengikatan.txt/png`) + `explore-output/agunan-detail-run.log`.
- Verifikasi: run pertama gagal timeout 150s (`toggles.nth(i)` hilang setelah expand karena label tombol berubah jadi "Tampilkan informasi lebih sedikit"). Perbaikan: klik `.first()` + `timeout: 5000`. Run kedua 1 passed (32.0s) ✅.
- Temuan:
  - 3 agunan: `F041401 - Reksadana` (prediksi Rp 234.323, appraisal "Masih menunggu nilai final"), `AN02010203 - Rumah Toko/Rumah Kantor` (appraisal Rp 90.000.000, prediksi Rp 900.000.000), `AN02010301 - Rumah` (appraisal Rp 90.000.000, prediksi Rp 900.000.000).
  - Detail expand: "Nilai lengkap agunan" (appraisal, dari total appraisal, prediksi, dari nilai prediksi) + "Produk dan fasilitas kredit yang diikat" (`Produk : SME Umum`, `DL • Total plafond: Rp 0 • Nilai agunan yang dapat diagunkan: ...`). Tombol berubah jadi "Tampilkan informasi lebih sedikit".
  - Panel "Pengikatan agunan ke fasilitas" tidak bisa diisi: banner "Data struktur kredit belum lengkap" (Tidak dapat mengisi pengikatan... lengkapi data struktur kredit dulu). Ringkasan: total appraisal Rp 0, total plafond Rp 0, "Daftar produk kredit (0)", "Belum ada produk kredit". Progres 1/11 selesai. Ketergantungan: bucket Struktur kredit harus diisi dulu.
  - `locator('body').innerText` bekerja; teks `Rp 0` muncul dengan NBSP (tampil `Â` di console Windows, bukan bug app).
- Belum selesai / gagal: panel Pengikatan dengan data terisi (butuh debitur yang struktur kreditnya lengkap, mis. `01M482PRSVH5ZMTVZX5QH0VDNZ` yang 4/11), menu ⋮ per kartu, form setelah "Cari" di modal "+ Agunan".
- Keputusan user: pakai data debitur `01M4F7TNSCSHEDB5G3WTSP7HDY`.


### 2026-10-26 — Explore menu bucket Agunan (read-only) (Claude via Cline)
- Dikerjakan: jalankan `tests/explore-all-buckets.spec.ts` dengan `EXPLORE_URL=<...01M482PRSVH5ZMTVZX5QH0VDNZ...bucket=agunan&debtorType=business> EXPLORE_BUCKETS=agunan EXPLORE_OUT=explore-output/agunan-2026-10-26 EXPLORE_MODALS=0`. Tidak ada perubahan kode. Output: `explore-output/agunan-2026-10-26/` (json, html, 2 screenshot, `_summary.json`) + `explore-output/agunan-run.log`.
- Verifikasi: 1 passed (1.0m) ✅. Sidebar 2 menu: "Data Agunan" [Lengkap], "Pengikatan agunan ke fasilitas" [Perlu input sebagai penyimpangan]. Explorer hanya menangkap 1 field di "Data agunan" dan 0 di "Pengikatan agunan ke fasilitas".
- Temuan: field yang tertangkap hanya tombol ("Agunan", "Tampilkan informasi lengkap" x2, pagination). Explorer tidak memetakan isi kartu agunan maupun isi panel Pengikatan, jadi hasilnya kurang bermakna untuk bucket berbasis daftar/kartu ini.
- Belum selesai / gagal: isi "Tampilkan informasi lengkap", panel "Pengikatan agunan ke fasilitas", dan modal "+ Agunan" per jenis belum dipetakan. Tidak ada tombol Simpan/Kirim yang diklik (modal dimatikan lewat `EXPLORE_MODALS=0`).
- Keputusan user: -


### 2026-10-26 — Explore menu bucket Identitas (read-only) (Claude via Cline)
- Dikerjakan: jalankan `tests/explore-all-buckets.spec.ts` dengan `EXPLORE_BUCKETS=identitas_pengecekan EXPLORE_OUT=explore-output/identitas-2026-10-26 EXPLORE_MODALS=0` (tanpa klik tombol Tambah/modal). Tidak ada perubahan kode. Output: `explore-output/identitas-2026-10-26/` (json, html, 7 screenshot, `_summary.json`) + `explore-output/identitas-run.log`.
- Verifikasi: 1 passed (2.0m) ✅. Jumlah field per section: Data pribadi 30, Data pribadi tambahan 4, Lokasi & kondisi tempat tinggal 3, Data pekerjaan & keuangan 22, Data kontak darurat 12, Data penjamin 18, Referensi 3.
- Temuan: sidebar punya 10 menu. 7 section di atas bisa dibuka. "Pengecekan Dukcapil", "Pengecekan DHN DHIB", "Pengecekan SLIK" = "Belum dapat diakses" (disabled). Status application id ini: "Data pekerjaan & keuangan" = Belum Lengkap, "Referensi" = Sudah diisi (opsional).
- Belum selesai / gagal: run pertama tanpa `EXPLORE_MODALS=0` saya hentikan paksa setelah ~2 menit tanpa hasil (diduga lambat karena membuka modal; penyebab pasti tidak diperiksa). Explorer melewati tombol bertuliskan simpan/kirim/hapus (baris 243), tapi saya tidak memantau klik selama run itu. Log run menampilkan 11 bucket di baris "Buckets:", namun hanya Identitas yang dieksplor. Field tidak dibandingkan dengan page object yang ada. 3 menu Pengecekan tidak bisa dibuka.
- Keputusan user: -


### 2026-10-26 — Buka bucket Agunan (read-only) di SIT (Claude via Cline)
- Dikerjakan: spec sementara dibuat lalu dihapus (tidak ada file kode baru). Login, `goto` `...credit-application/01M482PRSVH5ZMTVZX5QH0VDNZ/create?bucket=agunan&debtorType=business`, dump teks + screenshot ke `explore-output/agunan/open-bucket.txt` dan `open-bucket.png` (+ `open-run.log`).
- Verifikasi: playwright 1 passed (20.9s) ✅. Run pertama gagal timeout: `locator('main')` tidak ada di halaman; diganti `body`.
- Temuan: halaman "Data Agunan" menampilkan ringkasan (total appraisal Rp 1.320.000.000, total prediksi Rp 1.900.000.000), "Daftar agunan (2)": `AN02010203 - Rumah Toko/Rumah Kantor` dan `AN020101 - Tanah`, tombol "Tampilkan informasi lengkap", panel "Pengikatan agunan ke fasilitas" (4/11 selesai, status "Perlu input sebagai penyimpangan"), tombol "Kirim". Application id ini sudah punya data agunan.
- Belum selesai / gagal: tombol "Tampilkan informasi lengkap" dan "Pengikatan agunan ke fasilitas" belum dibuka/dipetakan.
- Keputusan user: -


### 2026-10-26 — Re-run validasi dropdown Jenis Agunan (Claude via Cline)
- Dikerjakan: tidak ada perubahan kode. Jalankan ulang `tests/bucketAgunan/validate-agunan-dropdown.spec.ts` (read-only) untuk konfirmasi hasil entri Gemini di bawah.
- Verifikasi: `npx playwright test tests/bucketAgunan/validate-agunan-dropdown.spec.ts --project=chromium --workers=1` → 1 passed (21.5s) ✅. 28 opsi UI, 24 unik CSV, 23 cocok, 1 tidak ditemukan: `[F9] Giro`.
- Belum selesai / gagal: `[F9] Giro` tidak ada di dropdown UI. Belum dipastikan apakah bug aplikasi, data CSV salah, atau opsi belum di-deploy di SIT. Test tetap lolos karena hanya assert `uiOptions.length == 28` dan `matched >= 20` (baris 190-191); mismatch hanya di-log. Assert `28` rapuh bila opsi UI berubah.
- Keputusan user: validasi dilanjutkan di bucket Agunan (sebelumnya di-skip). Skip dicabut untuk validasi dropdown ini.


### 2026-10-26 — TC Validasi Dropdown Jenis Agunan vs File CSV Lolos di SIT (Gemini via Antigravity)
- Dikerjakan: membuat file test `tests/bucketAgunan/validate-agunan-dropdown.spec.ts` yang memvalidasi opsi dropdown "Jenis agunan*" pada modal Tambah Agunan di SIT terhadap data acuan CSV `fixtures/List Req data agunan baru CLS - request Data baru CLS.csv` secara otomatis dan read-only.
- Verifikasi: `npx playwright test tests/bucketAgunan/validate-agunan-dropdown.spec.ts --project=chromium` → 1 passed (15.9s) ✅. Hasil: 28 opsi UI ditemukan, 23 dari 24 item CSV cocok, 1 item tidak ada di UI (`[F9] Giro`).
- Belum selesai / gagal: -
- Keputusan user: menggunakan file CSV di `fixtures/` sebagai acuan validasi kode dan jenis agunan.

### 2026-10-25 — Setup template SDD (.specify/templates) hybrid Spec-Kit & Superpowers (Gemini via Antigravity)
- Dikerjakan: membuat folder `.specify/templates/` berisi `spec.md`, `plan.md`, dan `tasks.md` yang disesuaikan khusus untuk arsitektur test automation LAMOS (konvensi selector `name`, auto-wait skeleton loader, single-open accordion, dan verifikasi Playwright ketat).
- Verifikasi: pembuatan 3 file template di `.specify/templates/` lolos dan terverifikasi ✅.
- Belum selesai / gagal: -
- Keputusan user: menyetujui penerapan konsep Spec-Driven Development (github/spec-kit) & disiplin agentic skills (obra/superpowers) secara lightweight (template markdown) tanpa install dependency CLI eksternal.

### 2026-10-21 — `tests/` dipecah per folder bucket (Claude via Cline)
- Dikerjakan: 18 spec dipindah ke `tests/bucketIdentitas/` (11), `tests/bucketDokumen/` (6), `tests/bucketAgunan/` (1); file tracked pakai `git mv`. Spec lintas bucket (`explore-all-buckets`, `sections-locator-smoke`, `login`, `explore-probe`) tetap di root `tests/`. Import relatif `../` → `../../`; import rusak `pages/DataPenjaminPage` / `pages/DocumentBucketPage` diarahkan ke `pages/bucketIdentitas/` / `pages/bucketDokumen/`. Script `package.json` & bagian 3/4 file ini disesuaikan.
- Verifikasi: semua path import di `tests/bucket*/` resolve (cek node) ✅; `npx playwright test --list --project=chromium` → 51 tests in 22 files ✅; typecheck `tsc --noEmit --strict ... --resolveJsonModule` untuk semua `tests/**/*.ts` → exit 0, 0 error ✅. Tidak ada run ke SIT.
- Belum selesai / gagal: - (komentar path di `DokumenSection.ts`, `dokumenTree.ts`, `PenjaminForms.ts`, `explore-penjamin-schemas.spec.ts` ikut diperbarui).
- Keputusan user: test dikelompokkan per folder bucket, mengikuti nama folder `pages/`.

### 2026-10-21 — Cek akses Agunan app 01M4F7TNSCSHEDB5G3WTSP7HDY, individual (Claude via Cline)
- Dikerjakan: tidak ada perubahan kode. Explore read-only `EXPLORE_URL=.../01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`, `EXPLORE_BUCKETS=agunan`, output `explore-output/agunan-01M4F7TN/`.
- Verifikasi: `npx playwright test tests/explore-all-buckets.spec.ts --project=chromium` → 1 passed (59.6s) ✅. Bisa diakses.
- Temuan: debitur individual, Daftar agunan (3): `F041401 - Reksadana` (Rp 234.323, badge "Masih menunggu nilai final"), `AN02010203 - Rumah Toko/Rumah Kantor`, + 1 lagi. Banner "LPA beberapa agunan masih dalam proses penilaian"; Total appraisal "Masih menunggu nilai final", Total prediksi Rp 1.800.234.323. Sidebar: Data Agunan & Pengikatan = Belum Lengkap. Field input tetap hanya di modal "+ Agunan" (`collateral-type`, `collateral-ownership-number`, "Cari"); Pengikatan 0 field.
- Belum selesai / gagal: isi "Tampilkan informasi lengkap", menu ⋮, form lanjutan setelah "Cari" belum di-explore.
- Keputusan user: -

### 2026-10-21 — Explore ulang bucket Agunan, read-only (Claude via Cline)
- Dikerjakan: tidak ada perubahan kode. Menjalankan `tests/explore-all-buckets.spec.ts` dengan `EXPLORE_BUCKETS=agunan`, `EXPLORE_URL=.../01M482PRSVH5ZMTVZX5QH0VDNZ/create?bucket=agunan&debtorType=business`, `EXPLORE_OUT=explore-output/agunan-2026-10-21`. Hasil lama di `explore-output/agunan/` tidak ditimpa.
- Verifikasi: `npx playwright test tests/explore-all-buckets.spec.ts --project=chromium` → 1 passed (53.3s) ✅. Struktur `agunan.json` sama dengan explore sebelumnya; beda hanya status sidebar "Pengikatan agunan ke fasilitas" (`Belum Lengkap` → `Perlu input sebagai penyimpangan`).
- Temuan: (1) Section "Pengikatan agunan ke fasilitas" tetap 0 field input. Isinya hanya ringkasan (Total nilai appraisal, Total plafond) + "Daftar produk kredit" yang bisa di-expand (produk, plafond, nilai agunan, LTV, badge "Dijamin namun berisiko"); isi expand belum di-explore. (2) "Data agunan" berisi ringkasan + kartu per agunan (menu ⋮, "Tampilkan informasi lengkap") + tombol "+ Agunan" (modal: `collateral-type`, `ownershipNumber`, tombol "Cari"). (3) `BucketId` di `pages/components/BucketSection.ts` masih `'collateral'`, padahal bucket id di app `agunan`.
- Belum selesai / gagal: isi kartu agunan (expand), menu ⋮, dan expand produk kredit belum di-explore.
- Keputusan user: -

### 2026-10-20 — TC default Penjamin Perorangan + Badan Usaha satu file (Claude via Cline)
- Dikerjakan: file baru `tests/penjamin-default.spec.ts` (TC01 Perorangan WNI Menikah + pasangan, TC02 Badan Usaha + 3 pemegang saham WNI/WNA/BU). Data default inline (disalin dari `fixtures/penjamin-perorangan-menikah.json` & `fixtures/penjamin-badan-usaha.json`), mode serial. File lama tidak diubah.
- Verifikasi: typecheck `tsc --noEmit --strict ... --resolveJsonModule tests/penjamin-default.spec.ts` exit 0 ✅; `npx playwright test tests/penjamin-default.spec.ts --list` = 2 test ✅. Run ke SIT 🟡 belum diverifikasi (section autosave, menulis data).
- Belum selesai / gagal: run end-to-end belum dilakukan. TC01 & TC02 di APPLICATION_ID + PENJAMIN_INDEX yang sama saling menimpa; pakai `APPLICATION_ID_PENJAMIN_PERORANGAN` / `APPLICATION_ID_PENJAMIN_BADAN_USAHA` berbeda.
- Keputusan user: TC baru dibuat sebagai file baru, file lama tidak diubah.


### 2026-10-20 — Cek akses bucket Agunan (Claude via Cline)
- Dikerjakan: tidak ada perubahan kode. Hanya menjalankan ulang probe read-only `tests/explore-agunan-dropdown.spec.ts`.
- Verifikasi: run 1 → 1 failed, login SSO tertahan di `access-sit.../login/form` (`expectLoginSuccess` timeout 30s). Run 2 (perintah sama, tanpa perubahan) → 1 passed (45.9s), 28 opsi Jenis agunan, sama dengan sesi 2026-10-16.
- Belum selesai / gagal: penyebab gagal login run 1 tidak diketahui (diduga SSO SIT lambat/flaky).
- Keputusan user: -

### 2026-10-16 — Cek lengkap dropdown Jenis agunan (Claude via Cline)
- Dikerjakan: probe baru `tests/explore-agunan-dropdown.spec.ts` (read-only, scroll listbox sampai tidak ada opsi baru), output `explore-output/agunan/jenis-agunan.json`. Combo dibuka lewat teks placeholder "Pilih jenis agunan"; klik `[id^="collateral-type"]` tidak membuka listbox.
- Verifikasi: `npx playwright test tests/explore-agunan-dropdown.spec.ts --project=chromium --workers=1`: 28 opsi setelah scroll habis (sama dengan explorer, jadi tidak ada lazy-load). Input search tidak terdeteksi di dalam combo.
- Belum selesai / gagal: run pertama timeout (salah target klik), sudah diperbaiki. Dropdown pada form per jenis setelah "Cari" belum dicek karena "Cari" tidak diklik (read-only).
- Keputusan user: -


### 2026-10-16 — Explore read-only bucket Agunan (Claude via Cline)
- Dikerjakan: menjalankan `tests/explore-all-buckets.spec.ts` (tanpa ubah kode) untuk app `01M482PRSVH5ZMTVZX5QH0VDNZ` (business), `EXPLORE_BUCKETS=agunan`, output `explore-output/agunan/` (json, html, 3 png).
  - Tab ID bucket sekarang `agunan`, bukan `collateral` (filter `EXPLORE_BUCKETS=collateral` jadi tidak menghasilkan apa pun).
  - Sidebar: "Data Agunan" [Lengkap], "Pengikatan agunan ke fasilitas" [Belum Lengkap].
  - Data Agunan: Ringkasan (Total nilai appraisal / prediksi yang dapat diagunkan), "Daftar agunan (n)" berupa kartu (kode + jenis, menu ⋮, "Tampilkan informasi lengkap"), pagination dan select `aria-label="Tampilan per halaman daftar agunan"`.
  - Modal "+ Agunan" (judul "Tambah agunan"): dropdown `collateral-type` (wajib, `data-testid=dropdownsearch`, 28 opsi), input `collateral-ownership-number` "Nomor bukti pemilikan" (wajib), tombol "Cari" (disabled sampai keduanya terisi). Hasil pencarian tampil di bawah. Form per jenis agunan belum dipetakan karena butuh klik "Cari".
  - Pengikatan agunan ke fasilitas: terkunci dengan banner "Data struktur kredit belum lengkap". "Daftar produk kredit (0)" bergantung pada bucket Struktur kredit.
- Verifikasi: `npx playwright test tests/explore-all-buckets.spec.ts --project=chromium --workers=1` → 1 passed (1.1m).
- Belum selesai / gagal: hasil "Cari", isi "Tampilkan informasi lengkap", menu ⋮ kartu, form pengikatan.
- Keputusan user: -

### 2026-10-12 — Schema & TC Data Penjamin: Perorangan Menikah dan Badan Usaha + 3 pemegang saham (Claude Opus 5.5 via Claude Code)
- Dikerjakan:
  - `tests/explore-penjamin-schemas.spec.ts`: explorer penjamin (tipe Personal/Corporate, status Menikah → field pasangan, modal pengurus Perseorangan WNI/WNA & Badan Usaha). Output `explore-output/penjamin-schemas.json` + `penjamin__*.png`.
  - `pages/bucketIdentitas/PenjaminForms.ts` (manual): `DataPenjaminForm` (`fillPersonal`, `fillSpouse`, `fillCorporate`, `openTambahPengurus`), `PengurusModal` (`fillPerseoranganWni`, `fillPerseoranganWna`, `fillBadanUsaha`, `simpan`, `batalkan`), `selectWilayah` toleran format nama.
  - Fixture data user: `fixtures/penjamin-perorangan-menikah.json`, `fixtures/penjamin-badan-usaha.json`; file dummy `fixtures/files/dummy-identitas.pdf`.
  - TC terpisah (permintaan user): `tests/penjamin-perorangan-menikah.spec.ts`, `tests/penjamin-badan-usaha-shareholder.spec.ts`. Env: `APPLICATION_ID_PENJAMIN_PERORANGAN` / `APPLICATION_ID_PENJAMIN_BADAN_USAHA` (fallback `APPLICATION_ID`), `PENJAMIN_INDEX`, `PENJAMIN_COMMIT=1` (upload file + Simpan modal).
- Verifikasi: ✅ `tsc --strict` lolos untuk 4 file di atas. ✅ `npx playwright test tests/penjamin-perorangan-menikah.spec.ts tests/penjamin-badan-usaha-shareholder.spec.ts --project=chromium` 2/2 lolos dalam mode dry run (tanpa `PENJAMIN_COMMIT`) di app `01M483P7DDHBV41Z5QPV0FM8Q9`.
- Belum selesai / gagal: mode `PENJAMIN_COMMIT=1` 🟡 belum diverifikasi (upload + Simpan modal menulis data ke SIT; tidak dijalankan tanpa izin user). Saat dry run, Simpan modal ketiga pemegang saham masih disabled (dugaan: dokumen identitas wajib). Explorer ikut mengubah state SIT app `01M483P7DDHBV41Z5QPV0FM8Q9`: "Debitur memiliki penjamin?" Tidak → Ya, tipe penjamin sempat tersimpan Corporate, status sidebar "Data penjamin" jadi "Belum Lengkap".
- Keputusan user: status MUCHAMMAD TAUFAN = **Menikah** (data awal tertulis Belum Menikah); kedua skenario dibuat sebagai file TC terpisah. Field yang tidak diberikan user diisi default dan ditandai `_default` di fixture; data yang tidak punya field di form disimpan di `_tidak_terpetakan`.

### 2026-10-09 — Aturan lintas LLM (Claude Opus via Claude Code)
- Dikerjakan: `AGENTS.md` (aturan & template update untuk semua agent), penunjuk `GEMINI.md`, `CLAUDE.md`, `.github/copilot-instructions.md`; header file ini.
- Verifikasi: - (hanya dokumentasi)
- Belum selesai / gagal: -
- Keputusan user: file history harus bisa diisi LLM lain dengan hasil yang tetap konsisten.

### 2026-10-08 — Explore aplikasi & generate component (Claude Opus via Claude Code)
- Dikerjakan:
  - `tests/explore-all-buckets.spec.ts`: explorer read-only. Fase 1: label, `name`, tipe, wajib, disabled, opsi dropdown, screenshot per section. Fase 2: collapsible bersarang, tombol "+ Tambah" (modal/inline), rich text, checkbox custom.
  - `pages/components/FormControls.ts`, `pages/components/BucketSection.ts`: komponen dasar dari DOM nyata.
  - `scripts/generate-pages.js`: menghasilkan **29 class section** + class Row untuk field berulang (DataUsaha, AspekUsaha, AnalisaMutasiRekening, AnalisaKebutuhan, StrukturPengajuanKredit).
  - Dokumen: `tests/explore-dokumen.spec.ts`, `pages/bucketDokumen/DokumenSection.ts` (manual), `pages/bucketDokumen/dokumenTree.ts` (parsial).
  - `tests/sections-locator-smoke.spec.ts`.
- Verifikasi: ✅ `tsc --strict` lolos untuk semua file baru. ✅ smoke test bucket Identitas 7/7 lolos.
- Belum selesai / gagal: smoke test bucket lain 🟡 belum diverifikasi (proses terhenti saat sesi berakhir); explorer Dokumen terhenti setelah 3 dari 11 kategori.
- Keputusan user: Agunan di-skip; Dokumen **tetap** dikerjakan; folder kosong `pages/bucketStruktur Kredit` dihapus; `bucketBankStatementAnalysis` dibiarkan kosong (bucket belum ada di app).

### Sebelumnya (commit `84b929e`, `463dea8`, `306d21d`)
- Implementasi awal upload dokumen (`DocumentBucketPage`), login, list pengajuan kredit; page object `bucketIdentitas/*Page.ts` dengan selector tebakan (rantai fallback).

---

## 7. Status & TODO (prioritas)

1. **Jalankan smoke test untuk semua bucket** (baru Identitas yang terverifikasi) dan perbaiki locator yang gagal.
2. **Lengkapi pohon Dokumen**: jalankan ulang `explore-dokumen.spec.ts`, isi `dokumenTree.ts` untuk 8 kategori sisa. Diff tombol di explorer kadang ikut menangkap tombol filter ("Semua", "Memiliki kategori") — perlu dibersihkan; key dropdown level ≥ 1 di staging (`data.<i>.*`) belum diverifikasi.
3. ~~Import rusak~~ selesai 2026-10-21 (path diperbaiki saat `tests/` dipecah per bucket). Spec lama (`data-penjamin-corporate`, `input-pengurus-penjamin`, `document-bucket`, `bulk-upload-mandatory`) sudah lolos typecheck, tapi belum dijalankan ke SIT.
4. Section yang konten-nya bergantung data (kosong saat explore): `FasilitasKreditObligorSection`, `QcaSection`, `PerubahanHariPiutangYoYSection`, `Pengecekan Dukcapil/DHN DHIB/SLIK` (sidebar disabled). Explore ulang dengan aplikasi yang datanya lebih lengkap.
5. Field kondisional "Joint Income? = Ya" belum dipetakan. (Data Penjamin sudah: lihat `PenjaminForms.ts`.)
5a. **Verifikasi `PENJAMIN_COMMIT=1`** untuk TC penjamin badan usaha (upload + Simpan modal, cek baris di "Daftar nama"), sebaiknya di application id khusus test. Belum dipetakan: penjamin perorangan/pasangan WNA, alamat "Luar Indonesia", lebih dari satu kartu penjamin (`PENJAMIN_INDEX` > 0 belum dicoba).
6. Agunan (`collateral`): modal "+ Agunan" 2 langkah (Jenis agunan 28 opsi, lihat `explore-output/agunan/jenis-agunan.json` + Nomor bukti pemilikan → "Cari" → form per jenis). Skip dicabut sebagian 2026-10-26: validasi dropdown Jenis agunan vs CSV jalan (`tests/bucketAgunan/validate-agunan-dropdown.spec.ts`, 23/24 cocok; `[F9] Giro` tidak ada di UI, perlu diselidiki / assert diperketat). Form per jenis & page object Agunan tetap di-skip. Explore ulang 2026-10-21: `explore-output/agunan-2026-10-21/`. Bucket id di app = `agunan`, tapi `BucketId` di `BucketSection.ts` masih `'collateral'` → ganti sebelum dipakai.
7. Debitur **corporate** (`debtorType` badan usaha) belum di-explore; baru individual.
8. Beberapa label tabel tidak akurat (diambil dari baris lain) → generator memakai nama field sebagai label; cek manual bila perlu.
9. Kredensial default di-hardcode di beberapa spec lama (`process.env.LAMOS_PASSWORD || '...'`) — sebaiknya dihapus.
10. Bersihkan: `tests/explore-probe.spec.ts`, file `probe-*` di `explore-output/`. Pertimbangkan `.gitignore` untuk `explore-output/*.html|png`.
11. **Rencana Integrasi TestRail (Backlog)**: integrasi reporter otomatis hasil test Playwright ke TestRail run (via `playwright-testrail-reporter` atau TestRail API v2) dan sinkronisasi case ID `@C...` dua arah ke dalam living spec.
