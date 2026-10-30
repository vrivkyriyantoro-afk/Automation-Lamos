# TASKS: S2CML-4890 - [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 2

> **Prinsip TDD & Superpowers**: Kerjakan berurutan, verifikasi secara nyata dengan Playwright.

- [x] **1. Persiapan Skenario & Data**
  - [x] Review User Story dan Acceptance Criteria di Jira `S2CML-4890`.
  - [x] Analisis keterbatasan data testing (Gating Identitas, Max 100 limit, CIF BDS/CLS).
  - [x] Merancang 25 Test Cases komprehensif dengan pemetaan Tipe Debitur (`Perorangan`, `Badan Usaha`, atau `Keduanya`) dan ekspor ke `exports/TC_S2CML-4890_Bucket_Agunan.xlsx` & `.csv`.
  - [x] Konfirmasi ID Debitur Badan Usaha: `01M482PRSVH5ZMTVZX5QH0VDNZ` (`debtorType=business`).

- [x] **2. Implementasi Test Automation Playwright**
  - [x] Buat file test: `tests/bucketAgunan/s2cml-4890.spec.ts` (Debitur Perorangan `01M4F7TNSCSHEDB5G3WTSP7HDY`).
  - [x] Buat file test: `tests/bucketAgunan/s2cml-4890-badan-usaha.spec.ts` (Debitur Badan Usaha `01M482PRSVH5ZMTVZX5QH0VDNZ`).
  - [x] Mengotomasi Batch 1 (Stepper, Parallel Nav, Gating Identitas, Simpan Disabled, Default LPA):
    - `TC-4890-01`: Default Step saat Form Terbuka (Informasi Umum Agunan, Belum Lengkap).
    - `TC-4890-02`: Struktur 3-Step Side Navigation.
    - `TC-4890-03`: Navigasi Paralel / Bebas Antar Step.
    - `TC-4890-06`: Gating Validasi Bucket Identitas (Step 3: Informasi Kepemilikan).
    - `TC-4890-11`: Validasi Tombol Simpan Disabled & Draft Enabled saat form belum lengkap.
    - `TC-4890-14`: Default Tipe Penilaian saat LPA = "Tidak" (S2CML-6756).
    - `TC-4890-BU-01`: Validasi form modal Agunan & Stepper pada Debitur Badan Usaha.

- [x] **3. Eksekusi & Verifikasi (Verification-Before-Completion)**
  - [x] Eksekusi penuh test suite Debitur Perorangan di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/s2cml-4890.spec.ts --project=chromium
    ```
    Hasil: **6 passed (1.3m)** ✅.
    - `TC-4890-01`: Default Step Informasi Umum Belum Lengkap (13.2s) ✅
    - `TC-4890-02`: 3-Step Side Navigation Terverifikasi (11.7s) ✅
    - `TC-4890-03`: Navigasi Paralel bebas berpindah ke Step 2 (12.4s) ✅
    - `TC-4890-06`: Gating Bucket Identitas memblokir Step 3 (14.4s) ✅
    - `TC-4890-11`: Tombol Simpan disabled dan Draft aktif (12.1s) ✅
    - `TC-4890-14`: LPA "Tidak" default Tipe Penilaian "Internal" (13.3s) ✅
  - [x] Eksekusi test suite Debitur Badan Usaha di SIT:
    ```bash
    npx playwright test tests/bucketAgunan/s2cml-4890-badan-usaha.spec.ts --project=chromium
    ```
    Hasil: **1 passed (58.3s)** ✅.
    - `TC-4890-BU-01`: Modal Agunan & Stepper 3-Step pada Debitur Badan Usaha (44.8s) ✅

- [x] **4. Dokumentasi & Living Memory**
  - [x] Update `PROJECT_HISTORY.md` sesuai aturan `AGENTS.md`.

