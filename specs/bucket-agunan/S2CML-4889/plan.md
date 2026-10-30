# PLAN: S2CML-4889 - [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 1

## 1. Berkas & Target Pengujian
- **File Test Target**: `tests/bucketagunan/s2cml-4889.spec.ts`
- **Living Spec**: `specs/bucket-agunan/S2CML-4889/spec.md`
- **Acuan Jira**: [S2CML-4889](https://bank-sinarmas.atlassian.net/browse/S2CML-4889)

## 2. Pemetaan Komponen & Selector DOM (Konvensi LAMOS)
| Kontrol UI | Selector Stabil | Keterangan / Assert |
| :--- | :--- | :--- |
| **Tombol Tambah Agunan** | `button:has-text("Agunan")` | Membuka modal pop-up stepper |
| **Modal Pop-up** | `[role="dialog"]:visible` | Modal stepper Tambah Agunan |
| **Combo Jenis Agunan** | `[id^="collateral-type"]` | Input Jenis Kode Agunan |
| **Input Bukti Kepemilikan** | `input[placeholder="Masukkan nomor"]` | Nomor bukti kepemilikan |
| **Tombol Cari** | `button:has-text("Cari")` | Trigger pencarian ke Core Loan System (CLS) |
| **Tombol Tambah Agunan Baru** | `button:has-text("Tambah Agunan Baru")` | Muncul jika data CLS tidak ditemukan/tidak cocok |

## 3. Strategi Eksekusi Test Playwright
1. **Mode Read-Only**: Melakukan pencarian data eksisting tanpa submit/commit.
2. **Validasi State**:
   - Memastikan stepper tahap 1 (Search Existing Agunan) tampil.
   - Menguji skenario saat hasil pencarian kosong -> tombol "Tambah Agunan Baru" tampil.
   - Menguji skenario saat hasil ditemukan -> memilih salah satu kartu agunan eksisting.
3. **Perintah Verifikasi**:
   ```bash
   npx playwright test tests/bucketagunan/s2cml-4889.spec.ts --project=chromium
   ```
