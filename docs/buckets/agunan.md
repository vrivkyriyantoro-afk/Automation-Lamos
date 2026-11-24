# KARTU BUCKET — Agunan (`agunan`)

> **Pemilik:** `qa-step-mapper`. **Pembaca:** semua agent QA. Baca SEBELUM menulis/menjalankan test Agunan.
> Status flow ada di `docs/GREEN_FLOWS.md` (bagian AGUNAN). Kartu ini menyimpan peta step, rule form, dan gate. Tanpa bukti = "tidak terbukti". Istilah domain (LTV/CC/LM, Titik 3, Draft/Final): skill `anthropic-skills:lending-domain`.

Terakhir diperbarui: **2026-11-24** (disusun dari registry `GREEN_FLOWS.md` bagian AGUNAN dan riwayat; belum ada pemetaan ulang field-per-field baru di sesi ini).

## 1. Identitas bucket

- Bucket id `agunan` (dulu tercatat `collateral`; alias di `pages/components/BucketSection.ts:18-19`). URL: `.../create?bucket=agunan&debtorType=individual|business`.
- Page object: `pages/bucketAgunan/` kosong; test memakai helper `tests/bucketAgunan/helpers/agunanModal.ts` dan helper per spec.
- Varian: **Perorangan** (`01M4F7TNSCSHEDB5G3WTSP7HDY`) dan **Badan Usaha** (`01M482PRSVH5ZMTVZX5QH0VDNZ`). Perilaku keduanya berbeda di Step 3 (lihat 4).
- Story: epic LP-5685; S2CML-4889 (search), 4890 (form Step 1), 4941 (edit), 4948/4949 (Step 3 kepemilikan), 5419/5420/5445 (Step 1 pembanding, Step 2, cash collateral), 6018 (ikon), 6020 (load latest data).

## 2. Alur dan peta step

```
Halaman bucket Agunan → "+ Agunan" (modal pencarian)
  → pilih "Jenis agunan" + isi nomor agunan → "Cari" (aktif hanya bila jenis + nomor terisi)
     ├─ ditemukan di CLS → agunan existing (BLOCKED di SIT, tidak ada data CLS)
     └─ "Data tidak ditemukan" → tombol "+ Agunan Baru" → form 3 step
          Step 1 Informasi umum (+ Data Pembanding, Penilaian LPA)
          Step 2 Data tambahan agunan
          Step 3 Informasi kepemilikan
Kartu agunan tersimpan → Titik 3 → Ubah / Hapus agunan
```

Bukti: `GF-AGUNAN-TAMBAH-SEARCH`, `GF-AGUNAN-AGUNAN-BARU`, `agunanModal.ts:25-44`.

## 3. Rule form

### 3.1 Pencarian (modal "+ Agunan")
- Cari disabled sampai jenis + nomor terisi. Nomor fiktif → "Data tidak ditemukan" + "+ Agunan Baru".
- Konflik: Cari pernah tetap disabled (`agunanModal.ts:38`, TC-4948-08).

### 3.2 Step 1 Informasi umum
- Default step; status **Belum Lengkap**. **Simpan disabled** dan **Simpan draft aktif** selama belum lengkap (TC-4890-01/02/03/11). Klik Simpan draft **menulis ke SIT** → hanya di App ID uji dan atas izin user.
- Field per modul: `tests/bucketAgunan/perseorangan/modul2-informasi-umum`, `modul3-pengikatan`, `modul4-alamat`. Daftar field lengkap tidak diulang di sini (tidak ada probe tersimpan terbaru).
- **Data Pembanding:** tombol `+ Data Pembanding` **disabled setelah 10 record** (TC-04-43, 2026-10-31); jenis Tanah. Hapus pembanding tanpa konfirmasi = defect (`docs/LAPORAN_DEFECT_Hapus_Data_Pembanding.md`).
- **Penilaian:** radio LPA Ya/Tidak (Gotcha 13); Tipe penilaian Internal/KJPP. Rasio agunan (LTV/CC/LM): rumus di skill lending-domain; defect Sisa Nilai 0 di `docs/LAPORAN_DEFECT_S2CML-4889_Sisa_Nilai_0.md`.

### 3.3 Step 2 Data tambahan
- Tab "Data tambahan agunan" (`navigateToStep2`, `modul7-data-tambahan.spec.ts:39-69`). Isi bergantung jenis agunan.
- **Cabang Cash Collateral (jenis F15):** radio `isCollateralStoredAtBsim` true/false → `GET /lossvc/v1/cif?number=<CIF>&jenisAgunanCode=…`. Rekening ada di F09/F15, kosong di F10/F11. CIF uji di `.env` (`CIF_VALID_1`, `CIF_VALID_2`). Deposito F11 BLOCKED (butuh CIF dengan rekening deposito).

### 3.4 Step 3 Informasi kepemilikan
- Dropdown **Kategori** (nama kategori pemilik). Perorangan: 001, 002, 005 ("Pemilik Anggunan" typo SIT), 008, 009, 010. Bukti kepemilikan disabled "Otomatis terisi dari data tambahan agunan".
- Kategori 005/008 → pilih tipe kepemilikan **Individu | Non Individu** (matriks tertulis Perorangan/Badan Usaha: MISMATCH-03). Form SLIK baru muncul untuk entitas baru; file SLIK ada batas ukuran (TC-4949-19 buffer >50MB gagal) dan input tidak `multiple` (TC-4949-20).
- Auto-fill kategori 001 dari Identitas: **STALE** (lolos 2026-11-01, gagal 2026-11-17; tergantung App ID Identitas Lengkap).
- **Badan Usaha:** kategori 006/007 tampil; SIT menampilkan `001 - Calon Debitur`, bukan `003 - Debitur` (MISMATCH-01); kategori 006 tidak merender "Hubungan dengan Debitur" (MISMATCH-02).

## 4. Gate dan aturan lintas bucket

- Step 3 membutuhkan Identitas Lengkap? **Tidak terbukti.** Run 2026-11-17 di `01M4F7` (Identitas belum lengkap) membuka Step 3 tanpa dialog gating. TC-4890-06 dugaan PASS palsu (locator longgar, `s2cml-4890.spec.ts:202-204`).
- Daftar nama pemilik di Step 3 dimuat dari Identitas (S2CML-4948); butuh Identitas berisi entitas. App ID Identitas Lengkap terbukti: `01M83AP5FKPHB1D3E2QS8P015Z` (belum dicek Agunan di sana).
- `01M22NAB4RXT92Y56AJ5VBQT75` Identitas completed tetapi 0 agunan: tidak bisa untuk flow yang butuh agunan tersimpan (edit, ikon, load latest).

## 5. Gotcha khusus bucket

- ID kartu: berformat `ID:` (Gotcha 15, tombol Titik 3 di-scope ke kartu lewat badge `ID:`) atau `QA-xxxx` (tidak berlaku).
- Viewport 1280x1000 untuk Step 3.
- Kartu uji di-hardcode `F041401 - Reksadana` dan `F15 - Setoran Jaminan` (`s2cml-4941.spec.ts:92`).
- `agunanModal.ts` memakai `DEBITUR_TARGET`/`DEBITUR_BU_TARGET`; bila env diisi, varian BU bisa membuka App ID perorangan.
- Spec yang hanya punya bukti riwayat (tanpa JSON run): 5419, `modul8-kepemilikan-agunan`, `modul6-penilaian-lpa`, `modul7-cash-collateral-cif`, `s2cml-4890-batch2`. `run-history/*.json` berdurasi <1 dtk = hasil `--list`, bukan bukti.

## 6. Konflik dan celah terbuka

Lihat `GREEN_FLOWS.md` bagian "Celah terbuka" dan kolom Konflik tiap entri AGUNAN. Tambahan: daftar field per step belum dipetakan ulang secara terstruktur (rule wajib/opsional per field Agunan: **tidak terbukti** di kartu ini; sumber: spec modul2-4).
