# PLAN: [Nama Fitur / Bucket Pengujian]

## 1. Komponen & Berkas yang Disentuh
- **Page Object**: `pages/[namaBucketFolder]/[PageName].ts`
  *(Catatan: Jika diawali `// AUTO-GENERATED`, ubah via `scripts/generate-pages.js` atau hapus header jika ingin dikonversi ke manual)*
- **Test File**: `tests/[namaBucketFolder]/[test-name].spec.ts`
- **Helpers / Fixtures**: `fixtures/...` (jika ada)

## 2. Pemetaan Selector DOM (Wajib Sesuai Konvensi LAMOS)
> **Aturan**: Gunakan atribut `name` (react-hook-form). DILARANG menggunakan `id` dinamis (akhiran `-r0`, `-r1b`).

| Kontrol UI | Selector Stabil | Keterangan / Fallback |
| :--- | :--- | :--- |
| **Tab Bucket** | `[role="tab"]#[bucket_id]` | Identifikasi bucket aktif |
| **Section Accordion** | `[class*="Collapsible-module_container__"]` | Filter dengan teks judul section |
| **Input / Textarea** | `input[name="..."]`, `textarea[name="..."]` | Atribut `name` stabil |
| **Select / Dropdown** | `button[name="..."]` / `.select__control` | Portal options di `body > div` |
| **Radio / Checkbox** | `input[type="radio"][name="..."]` | Wrapper label jika tersembunyi |

## 3. Desain Method Page Object
Rencana method baru yang akan ditambahkan ke Page Object:
- `navigateTo[SectionName]()`: Memastikan tab aktif dan collapsible section terbuka.
- `waitForLoaded()`: Menunggu skeleton loader (`.skeleton` / `[class*="Skeleton"]`) hilang sebelum aksi.
- `fill[FormSection](data)`: Mengisi data input secara aman.
- `get[FieldName]Value()`: Mengambil nilai field untuk assertions.

## 4. Strategi Eksekusi & Penanganan Khusus
- **Accordion Single-Open**: Membuka satu section menutup section lain. Navigasi harus sequential.
- **Skeleton Wait**: Gunakan auto-waiting locator Playwright (`toBeVisible()` / `waitFor({ state: 'visible' })`), hindari `count()` instan saat data masih loading.
- **Verifikasi Perintah**:
  ```bash
  npx playwright test tests/[namaBucketFolder]/[test-name].spec.ts --project=chromium
  ```

