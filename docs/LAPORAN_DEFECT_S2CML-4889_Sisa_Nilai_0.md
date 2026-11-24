# Laporan Defect — Bucket Agunan (S2CML-4889)

**Tanggal:** 1 November 2026  
**Environment:** LAMOS Core Loan SIT — `https://los-fe-coreloan-sit.devs.banksinarmas.com/`  
**Story terkait:** [S2CML-4889](https://bank-sinarmas.atlassian.net/browse/S2CML-4889) (*Add Agunan/Collaterals Part 1*)  
**Application ID:** `01M4F7TNSCSHEDB5G3WTSP7HDY` (`debtorType=individual`)  
**Status:** Open / Ready to Submit to Jira  

---

## DEFECT-01 — Sisa Nilai Appraisal Terhitung Rp 0 & Agunan Terblokir Meski Penggunaan Fasilitas Lain Tercatat 0%

- **Issue Type:** Bug / Defect
- **Severity:** High
- **Priority:** High
- **Komponen / Modul:** Bucket Agunan → Modal Tambah Agunan (Pencarian Agunan CLS)
- **Test Case Terkait:** `TC-4889-08`, `TC-4889-10`, `TC-4889-13`

### Deskripsi Masalah
Saat melakukan pencarian agunan existing dari CLS, sistem menampilkan kalkulasi **Sisa nilai appraisal = Rp 0** dan memunculkan banner pemblokiran merah (*"Agunan tidak bisa digunakan karena tidak ada nilai appraisal yang tersisa"*), padahal pada tabel *Rincian penggunaan agunan di fasilitas lain*, persentase penjaminan tercatat **0%** dan nominal paripasu tercatat **Rp 0**.

Akibatnya, Account Officer (AO) diblokir secara keliru (*false-positive blocking*) dan tidak dapat menggunakan kembali (*reuse*) agunan yang kuotanya masih tersedia.

---

### Data Uji
* **Jenis Agunan:** `F041401 - Reksadana`
* **Nomor Bukti Pemilikan:** `REVAMP-RD01`
* **ID Agunan CLS:** `CLSA202608214139`
* **Pemilik Agunan:** `Reksa Dana Tester`
* **Nilai Wajar:** `Rp 500.000.000`
* **Nilai Appraisal:** `Rp 500.000.000`

---

### Langkah Reproduksi
1. Buka pengajuan kredit pada URL:  
   `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`
2. Masuk ke bucket **Agunan**, klik tombol **`+ Agunan`**.
3. Pada modal *Tambah Agunan*:
   - Pilih **Jenis agunan:** `F041401 - Reksadana`
   - Masukkan **Nomor bukti pemilikan:** `REVAMP-RD01`
4. Klik tombol **`Q Cari`**.
5. Buka detail hasil pencarian pada kartu agunan `CLSA202608214139`.
6. Perhatikan bagian *Rincian penilaian agunan*, alert pemblokiran, dan ketiadaan tombol untuk melanjutkan.

---

### Expected Result
1. Sisa nilai appraisal terkalkulasi secara benar berdasarkan sisa persentase:
   $$\text{Sisa Nilai} = (100\% - 0\%) \times \text{Rp } 500.000.000 = \mathbf{\text{Rp } 500.000.000}$$
2. Sistem **tidak** menampilkan banner error *"Agunan tidak bisa digunakan karena tidak ada nilai appraisal yang tersisa"*.
3. Tombol **`Pilih Agunan Ini` / `Lanjutkan`** ditampilkan aktif (*enabled*) sehingga agunan dapat digunakan.

---

### Actual Result
1. *Sisa nilai appraisal* tertulis **`Rp 0`**.
2. Muncul alert merah:
   > **`! Agunan tidak bisa digunakan karena tidak ada nilai appraisal yang tersisa.`**
3. Tombol **`Pilih Agunan Ini` ditiadakan / diblokir total**.

---

### Bukti Payload API Lengkap

#### 1. Payload `POST existing-collaterals?page=1&limit=5` (Pencarian Agunan):
```json
{
  "clsID": "CLSA202608214139",
  "groupingJenis": "DOCUMENT",
  "isAlreadyAdded": false,
  "ownershipProof": "REVAMP-RD01",
  "pemilikAgunan": "Reksa Dana Tester",
  "details": {
    "dataTambahan": {
      "dokumen": {
        "ownershipProof": "REVAMP-RD01",
        "statusKreditJointAccount": {
          "code": "Y"
        }
      }
    },
    "informasiUmum": {
      "penilaianAgunan": {
        "appraisedValue": 0,
        "nilaiWajar": 500000000
      }
    }
  }
}
```

#### 2. Payload `GET other-facilities` (Data Paripasu & Fasilitas Lain):
```json
{
  "data": {
    "otherFacilities": [
      {
        "applicationID": "CLSATX202608216373",
        "facilityID": "CLSF002037202607020710",
        "paripasuPercentage": 0,
        "paripasuValue": 0,
        "status": "Aktif"
      }
    ],
    "valuation": {
      "appraisalDate": "2026-03-01",
      "appraisedValue": 500000000,
      "nilaiWajar": 500000000,
      "remainingAppraisedValue": 0
    }
  },
  "responseMessage": "Success",
  "statusCode": "200"
}
```

---

### Analisis Teknis & Root Cause (Konfirmasi Pelanggaran Jira AC)

1. **Status Agunan Sah Memenuhi Syarat Reuse:**
   - `statusKreditJointAccount.code`: **`"Y"`** *(Paripasu = Y, diizinkan untuk agunan bersama)*.
   - `paripasuPercentage`: **`0`** *(Belum terpakai di fasilitas lain)*.
   - `isAlreadyAdded`: **`false`** *(Belum pernah ditambahkan ke pengajuan ini)*.

2. **Pelanggaran Aturan Bisnis Jira S2CML-4889 (Fallback Nilai Agunan):**
   Pada Acceptance Criteria Jira S2CML-4889 tertera aturan:
   > *"Apabila nilai appraisal belum ada / 0, maka nilai agunan yang dapat diagunkan adalah:  
   > `(100 - Nilai Paripasu) * Nilai Wajar / Nilai Pelapor`"*
   
   Pada kasus ini:
   - Nilai Appraisal Independen bernilai **`0`** (`appraisedValue: 0`).
   - Nilai Wajar agunan tersedia **`Rp 500.000.000`** (`nilaiWajar: 500000000`).
   - **Backend TIDAK menjalankan aturan fallback tersebut**, melainkan langsung menganggap agunan tidak bernilai sehingga mengembalikan `"remainingAppraisedValue": 0`.
   - Akibatnya, sistem memblokir agunan secara keliru (*false-positive blocking*).



