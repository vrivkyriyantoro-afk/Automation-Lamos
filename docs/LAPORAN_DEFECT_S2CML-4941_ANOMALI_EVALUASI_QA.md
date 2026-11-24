# Laporan Defect & Evaluasi Independen — Bucket Agunan (S2CML-4941)

**Tanggal Evaluasi:** 12 November 2026  
**Peran Auditor:** AI QA Judge & Anomaly Detector  
**Environment:** LAMOS Core Loan SIT — `https://los-fe-lamos-sit.devs.banksinarmas.com/`  
**Story Terkait:** [S2CML-4941](https://bank-sinarmas.atlassian.net/browse/S2CML-4941) (*Edit Agunan/Collaterals - Edit data Existing*)  
**Application ID:** `01M4F7TNSCSHEDB5G3WTSP7HDY` (`debtorType=individual`)  
**Verdict Evaluasi:** ⚠️ **ANOMALY DETECTED** (Ditemukan Bug Visual, Typo Data Master/Dropdown, dan GAP Cakupan Otomasi)

---

## 1. Ringkasan Evaluasi Test Suite S2CML-4941

| Metrik | Hasil | Catatan |
|---|---|---|
| Total Test Cases Terdaftar | 15 | Sesuai matriks `exports/TC_S2CML-4941_Edit_Agunan_Existing.csv` |
| Eksekusi Lolos (Passed) | 13 | 10 benar terverifikasi eviden, 3 terindikasi *False Positive / Placeholder* |
| Eksekusi Diskip (Skipped) | 2 | `TC-4941-07` (GAP data Agunan Draft) & `TC-4941-12` (GAP Fasilitas Terikat) |
| Screenshot Eviden Tersedia | 11 file | Di folder `explore-output/s2cml-4941/` |
| Integritas Kalkulasi Finansial | Valid (Rp 1.6 M = Rp 700 jt + Rp 900 jt) | Tidak ditemukan nilai NaN/Undefined |
| Anomali UI & Data Ditemukan | 2 Temuan Defect | 1 Bug Visual Overlap, 1 Bug Typo String UI |

---

## 2. Rincian Laporan Defect (Standar BSM)

### DEFECT-01: Floating Action Button Navigasi Menutupi (Overlapping) Nominal Nilai Agunan pada Kartu Collateral

- **Issue Type:** Bug / UI Layout Defect
- **Severity:** Low to Medium
- **Priority:** Medium
- **Komponen / Modul:** Bucket Agunan → Halaman Ringkasan Daftar Agunan
- **Test Case Terkait:** `TC-4941-01`, `TC-4941-02`
- **File Eviden:** `explore-output/s2cml-4941/TC-4941-01-step-1.png`

#### Deskripsi Masalah
Pada halaman utama ringkasan Bucket Agunan (`buildup/credit-application`), tombol navigasi melayang (*floating action button*) arah panah kiri (`←`) berposisi absolut di kanan bawah layar tanpa margin proteksi (*padding bottom*) yang cukup terhadap daftar kartu agunan. Ketika terdapat ≥ 2 kartu agunan yang dirender, tombol ini menimpa langsung baris teks informasi finansial *"Nilai appraisal yang dapat diagunkan Rp 900.000.000"* pada kartu kedua (`F15 - Setoran Jaminan`), sehingga nominal nilai terpotong (*truncated*) dan tidak terbaca jelas oleh Account Officer (AO).

#### Langkah Reproduksi
1. Buka pengajuan kredit pada URL:  
   `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`
2. Buka accordion **Data agunan**.
3. Gulir ke bagian **Daftar agunan (2)**.
4. Perhatikan posisi kartu agunan kedua (`F15 - Setoran Jaminan`) di sisi kanan bawah.

#### Expected Result
- Tombol navigasi floating tidak menutupi elemen data agunan.
- Terdapat *safe area* / bottom padding atau kontainer kartu memiliki margin bawah yang memadai sehingga teks nominal `Rp 900.000.000` terbaca utuh 100%.

#### Actual Result
- Tombol lingkaran putih `←` menimpa teks nominal agunan: terbaca `Rp 900.` terpotong oleh bayangan tombol.

---

### DEFECT-02: Saltik (Typo) Kata "Anggunan" pada Opsi Dropdown Kategori Pemilik Agunan

- **Issue Type:** Bug / UI Text & Data Quality Defect
- **Severity:** Low
- **Priority:** Low
- **Komponen / Modul:** Bucket Agunan → Modal Ubah Agunan → Step 3 (Informasi Kepemilikan)
- **Test Case Terkait:** `TC-4941-06`
- **File Eviden:** `explore-output/s2cml-4941/TC-4941-06-step-1.png`

#### Deskripsi Masalah
Pada form edit modal *Ubah agunan* Step 3 (*Informasi kepemilikan*), pilihan opsi dropdown pada field **Kategori pemilik agunan\*** menampilkan nilai `005 - Pemilik Anggunan`. Penulisan kata `Anggunan` mengandung huruf 'g' ganda (saltik), yang menyimpang dari pedoman ejaan baku bahasa Indonesia serta istilah standar perbankan Bank Sinarmas (*Agunan*).

#### Langkah Reproduksi
1. Buka menu titik 3 pada salah satu kartu agunan existing → pilih **Ubah**.
2. Masuk ke tab/stepper **Informasi kepemilikan** (Step 3).
3. Periksa opsi yang terpilih pada field **Kategori pemilik agunan\***.

#### Expected Result
Opsi dropdown tertulis baku: `005 - Pemilik Agunan`.

#### Actual Result
Opsi dropdown tertulis dengan saltik: `005 - Pemilik Anggunan`.

---

## 3. Temuan Anomali Pengujian & Potensi False Positive

1. **TC-4941-06 (Step 3 Retensi Data): False Positive pada Asersi Pemilik Agunan**
   - Skrip `TC-4941-06` memverifikasi nama pemilik dengan: `page.locator('text=/Joko/i').first()`.
   - String `Joko` selalu ada pada komponen header atas modal (`Agunan yang diubah: Pemilik agunan Joko`) di semua step.
   - Skrip **belum memverifikasi** kontrol input kepemilikan yang sebenarnya di dalam body form Step 3 dan **belum memverifikasi** apakah file dokumen kepemilikan terlampir tetap melekat (*attachment retention*).

2. **TC-4941-10 & TC-4941-11 (Kalkulasi Nilai Prediktif & Pelapor): Placeholder Test**
   - Kedua test case tercatat `Passed`, namun tidak memiliki *assertion* verifikasi kalkulasi dan tidak menghasilkan tangkapan layar (*screenshot*) di folder `explore-output/s2cml-4941/`.
   - Hal ini disebabkan oleh mode *Read-Only* di SIT, sehingga perubahan nilai tidak disubmit ke backend. Perlu dibuat mock API atau validasi respon kalkulasi tanpa commit data.

3. **TC-4941-15 (Stepper Status Pasca Edit): Skenario Tidak Dieksekusi**
   - Judul TC adalah *"Validasi Indikator Status Stepper Tetap Akurat saat Field Diedit Menjadi Belum Lengkap"*.
   - Skrip uji hanya memverifikasi kondisi awal ("Lengkap") dan tidak melakukan pengosongan field apapun, sehingga lulus secara semu (*false positive*). Verifikasi pengosongan field sebenarnya telah tercakup pada `TC-4941-14`.

4. **Retensi Dokumen pada Step 2 (Data Tambahan Agunan - TC-4941-05)**
   - Pada screenshot `TC-4941-05-step-1.png`, kontrol *Dokumen bukti pemilikan\** menampilkan tombol kosong *Pilih File* tanpa nama dokumen yang telah diunggah sebelumnya. Perlu konfirmasi apakah data agunan `F041401` di SIT memang belum pernah diupload file atau sistem FE gagal merender nama file existing.

---

## 4. Analisis 2 Test Case yang Diskip (TC-4941-07 & TC-4941-12)

### A. TC-4941-07: Validasi Tombol "Simpan sebagai draft" Aktif pada Agunan DRAFT
- **Akar Masalah:** Ketiadaan Application ID dengan agunan berstatus `DRAFT`. Kedua agunan di `01M4F7TNSCSHEDB5G3WTSP7HDY` sudah berstatus `FINAL`.
- **Dampak Kualitas:** Logika pembeda antara *DRAFT* (boleh simpan draft) dan *FINAL* (simpan draft wajib disabled) baru teruji separuh (`TC-4941-08` teruji, `TC-4941-07` belum teruji).
- **Rekomendasi:** Siapkan 1 pengajuan uji khusus yang memiliki agunan DRAFT atau buat skenario otomasi pembuatan agunan DRAFT terlebih dahulu.

### B. TC-4941-12: Validasi Rasio Kredit (CC, LTV, LM) pada Fasilitas
- **Akar Masalah:** Endpoint `/forms/collateral-facility-mapping` mengembalikan array fasilitas kosong karena agunan belum dipetakan ke fasilitas kredit ([S2CML-5817](https://bank-sinarmas.atlassian.net/browse/S2CML-5817)).
- **Dampak Kualitas:** Fitur kalkulasi otomatis rasio pembiayaan (LTV/CC/LM) adalah komponen paling kritikal pada modul Agunan yang berkaitan langsung dengan limit risiko kredit. Tidak terujinya rasio ini menyisakan risiko defect finansial yang tidak terdeteksi.
- **Rekomendasi:** Gunakan App ID yang sudah memiliki struktur fasilitas komprehensif (misal fasilitas SME Umum / Back to Back) yang terikat agunan.

---

## 5. Rekomendasi Tindak Lanjut

1. **Submit Defect Jira:**
   - Daftarkan **DEFECT-01** (UI Collision FAB) ke tim Front-End (`S2WP-5065`).
   - Daftarkan **DEFECT-02** (Typo "Anggunan") ke tim BE/Data Master.
2. **Penyempurnaan Skrip Otomasi Playwright:**
   - Perbaiki assertion `TC-4941-06` agar mengarah ke input pemilik di dalam container Step 3, bukan top header card.
   - Lengkapi skrip `TC-4941-15` dengan aksi manipulasi field agar benar-benar menguji transisi status stepper ke "Belum Lengkap".
   - Tambahkan screenshot eviden untuk `TC-4941-10` dan `TC-4941-11`.
3. **Penyediaan Test Data:**
   - Koordinasikan penyediaan 2 App ID tambahan: satu dengan agunan berstatus DRAFT, dan satu dengan pengikatan fasilitas kredit aktif.
