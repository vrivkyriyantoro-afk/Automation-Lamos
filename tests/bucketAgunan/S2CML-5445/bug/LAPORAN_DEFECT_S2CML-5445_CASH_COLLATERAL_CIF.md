# Laporan Defect — Data Tambahan Agunan: Cash Collateral & Inquiry CIF (S2CML-5445)

**Tanggal:** 22 November 2026  
**Environment:** LAMOS SIT — `https://los-fe-lamos-sit.devs.banksinarmas.com/`  
**Story terkait:** [S2CML-5445](https://bank-sinarmas.atlassian.net/browse/S2CML-5445) (*Detailing Form Informasi Tambahan Agunan - Cash Collaterals*), terkait [S2CML-4981](https://bank-sinarmas.atlassian.net/browse/S2CML-4981)  
**Application ID:** `01M4F7TNSCSHEDB5G3WTSP7HDY` (`debtorType=individual`) — terlihat pada banner URL di setiap eviden  
**Status:** Open / Ready to Submit to Jira  

Sumber AC: `explore-output/atlassian/S2CML-5445.json` (folder `specs/bucket-agunan/S2CML-5445/` kosong saat audit).  
Run acuan: Playwright 22-11-2026 pukul 23.08–23.11 (`test-results/bucketAgunan-perseorangan--*`), suite `tests/bucketAgunan/_umum/modul7-data-tambahan.spec.ts`.

---

## DEFECT-5445-01 — Toast "kesalahan konektivitas layanan" muncul padahal service tidak gagal koneksi (CIF tidak valid / rekening kosong)

- **Components:** Bucket Agunan → Modal Tambah Agunan → Step 2 Data tambahan agunan → Informasi cash collateral (CIF pemilik agunan)
- **Story Points:** 1
- **Severity / Priority:** Medium / Medium
- **Test Case Terkait:** `TC-5445-05` (gagal pada run 22-11-2026); kasus rekening kosong teramati pada rekaman eksplorasi F10/F11.

### 1. Ringkasan Masalah (Summary)
Setelah tombol **Cek** diklik, UI menampilkan toast merah *"Gagal memilih rekening karena kesalahan konektivitas layanan. Silakan coba lagi."* pada dua kondisi yang bukan gangguan konektivitas:
1. CIF tidak terdaftar: service membalas **HTTP 400** (`errorCode 2000`). UI sudah benar menampilkan "CIF tidak ditemukan", tetapi toast konektivitas ikut muncul (±12 detik).
2. CIF valid tetapi tidak memiliki rekening pada jenis agunan tersebut (F10/F11): service membalas **HTTP 200** dengan `accounts: []`, namun UI tetap memunculkan toast konektivitas yang sama.

AC S2CML-5445 hanya meminta: *"Jika Gagal akan muncul notif CIF gagal ditemukan"*. Pesan konektivitas menyesatkan AO (mendorong "coba lagi" untuk masalah yang tidak akan hilang dengan percobaan ulang) dan isi pesannya ("Gagal memilih rekening") tidak sesuai dengan aksi user (inquiry CIF, belum memilih rekening).

### 2. Data Uji (Test Data)
* Jenis agunan: `F15 - Setoran Jaminan` (kasus 1, TC-5445-05) dan `F11 - Deposito` / `F10 - Tabungan` (kasus 2)
* Apakah agunan tersimpan di Bank Sinarmas: `Ya`
* CIF kasus 1: `99999999` (tidak terdaftar)
* CIF kasus 2: `CIF_VALID_1` / `CIF_VALID_2` dari `.env` (rekening ada di F09/F15, kosong di F10/F11)

### 3. Langkah Reproduksi (Steps to Reproduce)
1. Buka URL: `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`
2. Klik tombol `+ Agunan`, pilih jenis `F15 - Setoran Jaminan`, isi nomor bukti pemilikan acak, klik `Cari`, lalu `Agunan Baru`.
3. Buka tab `Data tambahan agunan`, pilih `Ya` pada "Apakah agunan tersimpan di Bank Sinarmas?".
4. Isi CIF `99999999`, klik `Cek`. Amati respons sistem.
5. Ulangi dengan jenis `F11 - Deposito` dan CIF valid yang tidak memiliki rekening deposito. Amati respons sistem.

### 4. Expected vs Actual Result
| Aspek | Expected Result (AC S2CML-5445) | Actual Result (SIT) |
|---|---|---|
| CIF tidak terdaftar (HTTP 400) | Hanya notifikasi "CIF tidak ditemukan" | "CIF tidak ditemukan" tampil **dan** toast "Gagal memilih rekening karena kesalahan konektivitas layanan. Silakan coba lagi." |
| CIF valid, `accounts: []` (HTTP 200) | Tidak ada pesan gangguan konektivitas; dropdown rekening kosong / pesan "tidak ada rekening" yang sesuai | Toast "kesalahan konektivitas layanan" muncul |
| Pesan untuk gangguan service nyata (HTTP 500, simulasi TC-5445-06) | Pesan kegagalan integrasi | Toast konektivitas yang sama (sesuai) — pembanding bahwa toast ini memang dimaksudkan untuk kegagalan koneksi |

### 5. Bukti Teknis & Eviden
- **Screenshot**:
  - `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_05_CIF_tidak_ditemukan_disertai_toast_konektivitas_dugaan_defect_.png` (22-11-2026 23.10.15)
  - `test-results/bucketAgunan-perseorangan--b0e32-ak-Ditemukan---Silang-Merah-chromium/test-failed-1.png` dan `error-context.md` (assert `toHaveCount(0)` menerima 1)
  - `tests/bucketAgunan/S2CML-5445/eviden/valid1-2-setelah-cek.png` (F11, CIF valid, rekening kosong → toast)
  - Pembanding 500: `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_06_service_inquiry_500_simulasi_pesan_kegagalan.png`
- **Request/Response**:
  - `tests/bucketAgunan/S2CML-5445/eviden/invalid-network.json`
    ```
    GET /lossvc/v1/cif?number=99999999&jenisAgunanCode=F11 -> 400
    {"errorCode":2000,"errorMessage":"Request cannot be fulfilled. Please check your request body.","responseMessage":"Bad Request","statusCode":400}
    ```
  - `tests/bucketAgunan/S2CML-5445/eviden/valid1-network.json`, `valid2-network.json`, `F10-valid1-network.json`, `F10-valid2-network.json`
    ```
    GET /lossvc/v1/cif?number=<CIF>&jenisAgunanCode=F11|F10 -> 200
    {"data":{"accounts":[]},"responseMessage":"OK","statuscode":200}
    ```
- **Catatan BE**: CIF tidak terdaftar dibalas 400 "Bad Request" (bukan 404 / kode bisnis "CIF tidak ditemukan"); perlu dikonfirmasi apakah FE memetakan semua non-2xx dan `accounts` kosong ke toast konektivitas.

---

## DEFECT-5445-02 — Field Nominal, Bunga, Periode, dan Alasan blokir sudah tampil sebelum rekening dipilih; Alasan blokir tetap tampil pada F09/F15

- **Components:** Bucket Agunan → Modal Tambah Agunan → Step 2 Data tambahan agunan → Informasi cash collateral
- **Story Points:** 2
- **Severity / Priority:** Medium / Medium
- **Test Case Terkait:** belum ada TC yang meng-assert aturan ini. Label dipasang sementara pada `TC-5445-04` (skenario F15 "Ya" yang sama); `TC-5445-04` saat ini PASS karena hanya mengecek label "Rekening cash collateral".

### 1. Ringkasan Masalah (Summary)
AC S2CML-5445 menyatakan: *"When User memilih agunan tersedia di bank sinarmas, Then akan muncul field CIF, dan Field lain belum akan muncul"*, lalu field diisi setelah rekening dipilih. Untuk F09 - Giro, F10 - Tabungan, F15 - Setoran Jaminan: *"ARO: set null and hide, Tipe Blokir: set null and hide, Alasan Blokir: set null and hide"*.

Di SIT, segera setelah "Ya" dipilih (bahkan saat inquiry berjalan dan setelah CIF **tidak** ditemukan), field `Nominal*`, `Bunga*`, `Periode mulai*`, `Periode akhir`, dan `Alasan blokir` sudah tampil dan dapat diisi. Pada F09 dan F15, dropdown `Alasan blokir` tetap tampil setelah CIF ditemukan, padahal AC meminta field tersebut disembunyikan untuk jenis ini.

### 2. Data Uji (Test Data)
* Jenis agunan: `F15 - Setoran Jaminan`, `F09 - Giro`
* Apakah agunan tersimpan di Bank Sinarmas: `Ya`
* CIF: `CIF_VALID_1` (2307403), `CIF_VALID_2` (2505501), dan `99999999`

### 3. Langkah Reproduksi (Steps to Reproduce)
1. Buka URL: `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`
2. Tambah agunan baru jenis `F15 - Setoran Jaminan`, buka tab `Data tambahan agunan`.
3. Pilih `Ya` pada "Apakah agunan tersimpan di Bank Sinarmas?". Amati field di bawah CIF.
4. Isi CIF valid, klik `Cek`. Setelah "CIF ditemukan", amati field di bawah dropdown `Rekening cash collateral` (belum memilih rekening).
5. Ulangi dengan jenis `F09 - Giro`.

### 4. Expected vs Actual Result
| Aspek | Expected Result (AC S2CML-5445) | Actual Result (SIT) |
|---|---|---|
| Setelah pilih "Ya", sebelum Cek / saat CIF tidak ditemukan | Hanya field CIF (dan tombol Cek) yang muncul; field lain belum muncul | Nominal*, Bunga*, Periode mulai*, Periode akhir, Alasan blokir sudah tampil |
| F15 / F09 setelah CIF ditemukan | ARO, Tipe blokir, Alasan blokir disembunyikan (set null and hide) | ARO & Tipe blokir tersembunyi, tetapi **Alasan blokir tetap tampil** |

### 5. Bukti Teknis & Eviden
- **Screenshot**:
  - Saat inquiry berjalan (F15): `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_03_tombol_Cek_saat_proses_inquiry_respons_ditahan_5_detik_.png` (23.09.33)
  - CIF tidak ditemukan (F15), field lain tetap tampil: `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_05_CIF_tidak_ditemukan_disertai_toast_konektivitas_dugaan_defect_.png`
  - CIF ditemukan (F15), Alasan blokir tampil: `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_04_CIF_ditemukan_tombol_Ubah_dropdown_Rekening_cash_collateral.png`, `tests/bucketAgunan/S2CML-5445/eviden/Eviden_TC_5445_07_setelah_Ubah_inquiry_ulang_dengan_CIF_baru.png`
  - CIF ditemukan (F09), Alasan blokir tampil: `tests/bucketAgunan/S2CML-5445/eviden/F09-valid2-3-setelah-cek-scroll.png`
- **Request/Response**: `tests/bucketAgunan/S2CML-5445/eviden/F15-valid2-network.json`, `F09-valid2-network.json` (`GET /lossvc/v1/cif?number=2505501&jenisAgunanCode=F15|F09 -> 200`, 4 rekening).
- **Catatan**: Pembanding opsi "Tidak" pada F11 sudah sesuai AC (ARO/Tipe blokir/Alasan blokir tidak tampil; snapshot DOM `test-results/bucketAgunan-perseorangan--8805e-g-Muncul-Instansi-Penerbit--chromium/error-context.md`).
