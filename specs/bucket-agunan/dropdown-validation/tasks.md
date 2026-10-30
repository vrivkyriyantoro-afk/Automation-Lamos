# TASKS: Validasi Bucket Agunan & Modal Tambah Agunan

- [x] **1. Persiapan Data & Acuan Desain**
  - [x] Siapkan file acuan CSV di `fixtures/List Req data agunan baru CLS - request Data baru CLS.csv`.
  - [x] Verifikasi pembacaan desain Figma via `scripts/read-figma.js` untuk dokumen `LAMOS SME : Phase 1.1 - Agunan, 6C, FPPA`.

- [x] **2. Implementasi File Test**
  - [x] Buat file test di `tests/bucketAgunan/validate-agunan-dropdown.spec.ts`.
  - [x] Implementasikan parser CSV acuan untuk mengekstrak kode & jenis agunan unik.
  - [x] Implementasikan scroll otomatis pada listbox dropdown UI.
  - [x] Terapkan algoritma pencocokan kata kunci dan ejaan.

- [x] **3. Verifikasi Eksekusi (Verification-Before-Completion)**
  - [x] Jalankan test di lingkungan SIT:
    ```bash
    npx playwright test tests/bucketAgunan/validate-agunan-dropdown.spec.ts --project=chromium
    ```
  - [x] Hasil: 1 passed (15.9s), 23/24 opsi cocok, 1 opsi missing terdeteksi (`[F9] Giro`).

- [x] **4. Dokumentasi Riwayat**
  - [x] Catat hasil ke `PROJECT_HISTORY.md` bagian 6. Riwayat.

