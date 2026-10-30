# TASKS: S2CML-4889 - [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 1

> **Prinsip TDD & Superpowers**: Kerjakan berurutan, verifikasi secara nyata dengan Playwright.

- [x] **1. Persiapan Skenario & Data**
  - [x] Review User Story dan Acceptance Criteria di `specs/bucket-agunan/S2CML-4889/spec.md`.
  - [x] Memetakan 82 Test Cases dari `fixtures/TemplateAutomateLamos - Sheet1.csv`.

- [x] **2. Implementasi Test Automation Playwright**
  - [x] Buat file test: `tests/bucketAgunan/s2cml-4889.spec.ts`.
  - [x] Mengotomasi Modul 1 (Search Agunan): TC-04-01, TC-04-02, TC-04-03, TC-04-05, TC-04-06.
  - [x] Verifikasi test listing: `npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts --list` (5/5 tests valid).

- [x] **3. Eksekusi & Verifikasi (Verification-Before-Completion)**
  - [x] Eksekusi penuh seluruh Test Case Modul 1 (Search Agunan) di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/s2cml-4889.spec.ts --project=chromium
    ```
    Hasil: **5 passed (2.2m)** ✅.
    - `TC - 04 - 01`: Modal dan stepper Tambah Agunan berhasil dibuka & ditutup aman (21.7s) ✅
    - `TC - 04 - 02`: Tombol Cari tetap disabled jika Jenis Agunan belum dipilih (21.5s) ✅
    - `TC - 04 - 03`: Tombol Cari aktif saat kriteria wajib terisi (27.5s) ✅
    - `TC - 04 - 05`: Tombol "+ Agunan Baru" belum muncul sebelum tombol Cari diklik (22.7s) ✅
    - `TC - 04 - 06`: Tombol "+ Agunan Baru" & pesan "Data tidak ditemukan" tampil (30.5s) ✅
  - [x] Eksekusi penuh seluruh Test Case Modul 2 (Informasi Umum Agunan) di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/modul2-informasi-umum.spec.ts --project=chromium
    ```
    Hasil: **4 passed (1.2m)** ✅ (mencakup 7 TC: TC-04-20 s.d TC-04-26).
    - `TC - 04 - 20`: Urutan opsi Jenis Agunan sesuai master data (58 opsi UI) ✅
    - `TC - 04 - 21`: Detail isian Jenis agunan Housing status Tersedia ✅
    - `TC - 04 - 22 & 23`: Validasi kondisional field Lembaga Pemeringkat pada status Tersedia vs Indent ✅
    - `TC - 04 - 24, 25, 26`: Dropdown Lembaga Pemeringkat, opsi rating agunan, dan placeholder warning ✅
  - [x] Eksekusi penuh seluruh Test Case Modul 3 (Pengikatan Agunan) di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/modul3-pengikatan.spec.ts --project=chromium
    ```
    Hasil: **4 passed (1.3m)** ✅ (TC-04-27 s.d TC-04-30).
    - `TC - 04 - 30`: Status Tersedia menampilkan field Jenis & Tanggal Pengikatan ✅
    - `TC - 04 - 29`: Status Indent menyembunyikan field Jenis & Tanggal Pengikatan ✅
    - `TC - 04 - 27`: Tanggal pengikatan wajib bila jenis pengikatan ≠ 06 (Hak Tanggungan) ✅
    - `TC - 04 - 28`: Tanggal pengikatan opsional bila jenis pengikatan = 06 (Belum diikat) ✅
  - [x] Eksekusi penuh seluruh Test Case Modul 4 (Alamat Agunan) di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/modul4-alamat.spec.ts --project=chromium
    ```
    Hasil: **5 passed (2.0m)** ✅ (TC-04-31 s.d TC-04-35).
    - `TC - 04 - 32`: Sub-location (Kota/Kecamatan) tidak menampilkan data saat parent location belum dipilih ✅
    - `TC - 04 - 31`: List dropdown Kecamatan berurutan secara alfabetis (A-Z) ✅
    - `TC - 04 - 33`: Mengubah Provinsi otomatis me-reset pilihan Kota dan Kecamatan kembali ke placeholder awal ✅
    - `TC - 04 - 34`: Validasi Kode Pos non-angka memicu alert error ✅
    - `TC - 04 - 35`: Validasi input Kode Pos angka valid (10110) lolos tanpa error ✅
  - [ ] Lanjut ke Modul 5: Data Pembanding Agunan (`TC - 04 - 36` s.d `TC - 04 - 43`).

- [x] **4. Dokumentasi & Living Memory**
  - [x] Update `PROJECT_HISTORY.md` sesuai aturan `AGENTS.md`.
