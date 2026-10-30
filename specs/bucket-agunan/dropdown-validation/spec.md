# SPEC: Validasi Bucket Agunan & Modal Tambah Agunan

## 1. Ringkasan & Konteks
- **Bucket ID**: `agunan` (tab `[role="tab"]#agunan`)
- **Target Halaman**: `/lamos/credit-application/<appId>/create?bucket=agunan&debtorType=business`
- **Sumber Data & Acuan**:
  - **Jira Epic & Story**: `LP-5685` (SLP - Origination SME - Bucket Agunan) & `S2CML-5133` (Data Agunan & Pengikatan ke Fasilitas).
  - **Figma Design**: Document `LAMOS SME : Phase 1.1 - Agunan, 6C, FPPA` (Page 11: Landing Page & Page 12: Flow Tambah Agunan).
  - **Excel / CSV Acuan**: `fixtures/List Req data agunan baru CLS - request Data baru CLS.csv` (24 varian produk & kode agunan).

## 2. Prekondisi & Lingkungan
- Lingkungan: SIT (`https://los-fe-coreloan-sit.devs.banksinarmas.com/`).
- Autentikasi: Login via SSO (`pages/LoginPage.ts`).
- **Prinsip Keamanan**: READ-ONLY. Setiap modal yang dibuka wajib ditutup kembali dengan aman (`Escape`) tanpa submit/simpan.

## 3. Skenario Pengujian (Test Cases)

### Skenario 1: Pembukaan Modal Tambah Agunan
- **Aksi**: Klik tombol `+ Agunan` pada halaman utama bucket Agunan.
- **Ekspektasi**: Modal dialog `[role="dialog"]` dengan judul "Tambah agunan" terbuka dan terlihat jelas.

### Skenario 2: Validasi Kelengkapan Dropdown "Jenis agunan*"
- **Aksi**: Buka combo `Pilih jenis agunan`, scroll seluruh listbox sampai habis.
- **Ekspektasi**:
  - Seluruh master agunan (28 opsi) termuat.
  - Opsi mencakup 23 master agunan dari file acuan Excel/CSV (Tanah, Rumah, Ruko, Gedung, Gudang, Hotel, Mesin, Kendaraan, Deposito, Tabungan, Saham, Reksadana, Bancassurance, AR).
  - Mencatat anomali kode yang tidak tersedia (mis. `[F9] Giro`).

### Skenario 3: Validasi State Tombol "Cari"
- **Aksi**: Periksa tombol `Cari` saat field `Jenis agunan*` atau `Nomor bukti pemilikan*` belum lengkap terisi.
- **Ekspektasi**: Tombol `Cari` wajib berstatus `toBeDisabled()`.

### Skenario 4: Tampilan Ringkasan & Detail Objek Agunan (Jira: S2CML-5133 AC-1)
- **GIVEN**: User telah berada di halaman Bucket Agunan.
- **WHEN**: Section "Data Agunan" dibuka.
- **THEN**: Sistem wajib menampilkan data secara *read-only* dengan ketentuan:
  - Dua card summary nilai kumulatif di bagian atas (Total Nilai Appraisal & Total Nilai Prediksi).
  - Kartu daftar agunan dengan detail objek beserta sub-section "Struktur kredit terhubung" (via tombol *Tampilkan informasi lengkap*).

### Skenario 5: Pengikatan Agunan ke Fasilitas (Jira: S2CML-5133 AC-2)
- **GIVEN**: User berada di section "Pengikatan agunan ke fasilitas".
- **WHEN**: Section dibuka.
- **THEN**: Sistem wajib menampilkan mapping fasilitas produk kredit dengan agunan (atau banner ketergantungan struktur kredit bila belum lengkap).

