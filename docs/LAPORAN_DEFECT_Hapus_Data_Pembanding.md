# Laporan Defect — Bucket Agunan (S2CML-5419)

**Tanggal:** 02 November 2026  
**Environment:** `https://los-fe-coreloan-sit.devs.banksinarmas.com/`  
**Story terkait:** [S2CML-5419](https://bank-sinarmas.atlassian.net/browse/S2CML-5419) (*Detailing Form Informasi Umum Agunan*)  
**Application ID:** `01M4F7TNSCSHEDB5G3WTSP7HDY` (`debtorType=individual`)  
**Status:** Open / Ready to Submit to Jira  

---

## DEFECT-5419-01 — Hapus Data Pembanding Tanpa Modal Konfirmasi dan Tanpa Feedback Toast

- **Components:** Bucket Agunan → Form Informasi Umum Agunan (Tabel Data Pembanding)
- **Story Points:** 2
- **Test Case Terkait:** `TC-5419-17`

### 1. Ringkasan Masalah (Summary)
Pada tabel Data Pembanding di Form Step 1 Informasi Umum Agunan, ketika pengguna mengklik ikon **Trash (Hapus)** pada baris data pembanding, sistem langsung menghapus data dari tabel seketika tanpa menampilkan modal popup konfirmasi (*destructive action without confirmation guard*) dan tidak memunculkan component toast notifikasi berhasil.

### 2. Data Uji (Test Data)
* **Jenis Agunan:** `AN02010101 - Tanah`
* **Status Agunan:** `1 - Tersedia`
* **Sumber Data Pembanding:** `Penjual`
* **Nama Pemberi Data:** `Data Pembanding Test`
* **Nilai / Harga:** `Rp 1.000.000.000`

### 3. Langkah Reproduksi (Steps to Reproduce)
1. Buka URL: `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M4F7TNSCSHEDB5G3WTSP7HDY/create?bucket=agunan&debtorType=individual`
2. Klik tombol **`+ Agunan`** untuk membuka modal stepper Tambah Agunan.
3. Pilih Jenis Agunan `Tanah`, isi nomor bukti dummy, klik **`Cari`**, lalu klik tombol **`+ Agunan Baru`**.
4. Pilih **Status Agunan = Tersedia** untuk mengaktifkan seksi Data Pembanding.
5. Klik tombol **`+ Data Pembanding`**, lengkapi data uji, lalu klik **`Simpan`**.
6. Pada baris tabel preview data pembanding, klik tombol ikon **Hapus (Trash)** pada kolom Action.
7. Amati respons sistem (keberadaan popup konfirmasi dan feedback toast).

### 4. Expected vs Actual Result
| Aspek | Expected Result (AC / Figma) | Actual Result (SIT) |
|---|---|---|
| **Modal Konfirmasi Hapus** | Sistem menampilkan pop-up dialog konfirmasi: *"Apakah Anda yakin ingin menghapus data pembanding ini?"* dengan tombol **Batalkan** dan **Hapus**. | **Tidak muncul**. Baris data langsung terhapus seketika saat ikon trash diklik. |
| **Component Toast Notifikasi** | Sistem menampilkan toast notifikasi hijau/sukses: *"Data pembanding berhasil dihapus"*. | **Tidak muncul**. Tidak ada elemen toast sama sekali di DOM setelah penghapusan. |

### 5. Bukti Teknis & Eviden
- **Screenshot**: `explore-output/bug/DEFECT-5419-01-hapus-pembanding.png` (menampilkan baris tabel pembanding dan ketiadaan pop-up konfirmasi/toast).
- **Snippet DOM**: Elemen tombol hapus pada baris data pembanding langsung mentrigger handler tanpa dialog:
  ```html
  <button type="button" aria-label="Hapus data pembanding" class="...">
    <svg ...><!-- trash icon --></svg>
  </button>
  ```
