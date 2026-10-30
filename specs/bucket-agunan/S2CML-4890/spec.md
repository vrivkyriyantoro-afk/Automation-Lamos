# SPEC: [S2CML-4890] [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 2

## 1. Ringkasan Tiket Jira
- **Key**: [S2CML-4890](https://bank-sinarmas.atlassian.net/browse/S2CML-4890)
- **Tipe**: Story
- **Status**: In SIT
- **Ringkasan**: [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 2
- **Epic**: LP-5685 (SLP - LAMOS - Origination SME - Phase 2 - Bucket Agunan)
- **Bucket**: `bucket-agunan`

## 2. Deskripsi & Scope
- **User Story**:
  > As an Account Officer (AO), I want to input complete collateral data through a 3-step structured form, save drafts when needed, and submit valid collateral data into the credit application so that the collateral can be bound to credit facilities.
- **Scope**:
  - 3-Step Stepper Navigation: Informasi Umum Agunan, Data Tambahan Agunan, Informasi Kepemilikan.
  - Parallel Form Navigation (bebas pindah step tanpa urutan kaku).
  - Indikator Status Form (Lengkap vs Belum Lengkap).
  - Gating Step 3: Informasi Kepemilikan terhadap kelengkapan Bucket Identitas dan Pengecekan.
  - Batas Maksimal 100 Agunan (Max Entry Gating).
  - Fitur "Simpan sebagai draft" (Bypass mandatory validation).
  - Validasi Tombol "Simpan" & Final Submission ke Core Banking CLS.
  - Penilaian Agunan: LPA "Tidak" default Tipe Penilaian "Internal" (S2CML-6756).

## 3. Matriks Test Cases
Matriks lengkap terdiri dari 22 Test Cases (11 Positive, 11 Negative/Validation) yang tersimpan di:
- [`exports/TC_S2CML-4890_Bucket_Agunan.xlsx`](file:///c:/Users/V50324/Documents/automation-lamos/exports/TC_S2CML-4890_Bucket_Agunan.xlsx)
- [`exports/TC_S2CML-4890_Bucket_Agunan.csv`](file:///c:/Users/V50324/Documents/automation-lamos/exports/TC_S2CML-4890_Bucket_Agunan.csv)

