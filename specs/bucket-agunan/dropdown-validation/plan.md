# PLAN: Validasi Bucket Agunan & Modal Tambah Agunan

## 1. Komponen & Berkas Target
- **File Test**: `tests/bucketAgunan/validate-agunan-dropdown.spec.ts`
- **Data Fixture**: `fixtures/List Req data agunan baru CLS - request Data baru CLS.csv`
- **Script Figma Reader**: `scripts/read-figma.js`

## 2. Pemetaan Selector DOM (Konvensi LAMOS)
| Kontrol UI | Selector Stabil | Keterangan |
| :--- | :--- | :--- |
| **Tab Bucket Agunan** | `[role="tab"]#agunan` | Tab navigasi utama |
| **Tombol Tambah Agunan** | `page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ })` | Membuka modal tambah agunan |
| **Modal Dialog** | `page.locator('[role="dialog"]:visible').last()` | Modal pencarian agunan |
| **Dropdown Jenis Agunan** | `dialog.getByText('Pilih jenis agunan')` | Pembuka combo listbox |
| **Listbox Opsi** | `page.locator('[role="listbox"]:visible').first()` | Portal daftar opsi |
| **Input Bukti Pemilikan** | `input[placeholder="Masukkan nomor"]` | Field nomor sertifikat/BPKB |
| **Tombol Cari** | `button[data-testid="filled-button"]:has-text("Cari")` | Tombol trigger pencarian |

## 3. Strategi Pengujian & Verifikasi
- **Scroll Listbox (Ponytail Technique)**: Menggunakan manipulasi `scrollTop = scrollHeight` untuk memastikan seluruh opsi ter-render sebelum data dibaca.
- **Normalisasi Ejaan**: Menangani variasi kata seperti *Apartement/Apartemen*, *Property/Properti*, dan *Produk/Product*.
- **Perintah Verifikasi**:
  ```bash
  npx playwright test tests/bucketAgunan/validate-agunan-dropdown.spec.ts --project=chromium
  ```

