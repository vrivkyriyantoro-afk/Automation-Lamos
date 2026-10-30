# TASKS: [Nama Fitur / Bucket Pengujian]

> **Prinsip Eksekusi (ala Superpowers & Spec-Kit)**:
> 1. Kerjakan tugas secara berurutan. Jangan lompat ke implementasi sebelum persiapan siap.
> 2. Lakukan verifikasi nyata setiap selesai satu langkah (jangan berasumsi lolos).
> 3. Laporkan kegagalan atau kendala secara transparan.

- [ ] **1. Persiapan & Baseline Check**
  - [ ] Periksa typecheck / compile baseline:
    ```bash
    npx -y -p typescript@5 tsc --noEmit --strict --target es2022 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --types node [files...]
    ```
  - [ ] Pastikan tidak ada konflik git pada file target.

- [ ] **2. Implementasi / Penyesuaian Page Object**
  - [ ] Periksa file `pages/[namaBucketFolder]/[PageName].ts`.
  - [ ] Tambahkan locator stabil (`input[name="..."]`, `button[name="..."]`).
  - [ ] Tambahkan helper method navigasi dan penanganan skeleton loader.
  - [ ] Verifikasi typecheck pada file Page Object.

- [ ] **3. Implementasi Test Automation**
  - [ ] Buat file test di `tests/[namaBucketFolder]/[test-name].spec.ts`.
  - [ ] Terapkan Skenario 1 (Navigasi & Pembukaan section).
  - [ ] Terapkan Skenario 2 (Validasi field & assertions).
  - [ ] Pastikan tidak ada hardcoded credentials (gunakan `.env`).

- [ ] **4. Verifikasi Eksekusi (Verification-Before-Completion)**
  - [ ] Jalankan test Playwright di lingkungan target:
    ```bash
    npx playwright test tests/[namaBucketFolder]/[test-name].spec.ts --project=chromium
    ```
  - [ ] Pastikan hasil test 100% passed tanpa flaky/timeout.

- [ ] **5. Finalisasi & Dokumentasi Riwayat**
  - [ ] Perbarui tanggal dan status di `PROJECT_HISTORY.md` (bagian 6. Riwayat & 7. Status & TODO).
  - [ ] Catat temuan baru (bila ada) ke tabel Konvensi DOM / Gotcha di `PROJECT_HISTORY.md`.

