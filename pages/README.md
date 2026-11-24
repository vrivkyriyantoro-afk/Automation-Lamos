# pages/ — sumber tunggal locator komponen LAMOS

Tujuan: semua selector/xpath komponen ada **di sini saja**, konsisten, dan bisa dijadikan **knowledge** untuk
menyusun test case. Spec (`tests/`) dan step Gherkin (`features/`) hanya **memanggil** page object, tidak menulis selector.

```
pages/
  base/        LoginPage, CreditApplicationPage, BucketSection (+ CreditApplicationForm, navigasi bucket/sidebar)
  controls/    FormControls: TextInput, CurrencyInput, DateInput, Dropdown, RadioGroup, FileUpload, Checkbox,
               RichTextEditor, CriteriaTable. Rumus locator tiap kontrol didefinisikan SATU kali di sini.
  buckets/<bucket>/   page object per bucket (kebab-case): *Section.ts, sections.ts (indeks), form manual
    agunan/    belum dimigrasi (lihat README di dalamnya)
    identitas/legacy/  DataPenjaminPage (deprecated, masih dipakai 2 spec; pakai DataPenjaminSection/PenjaminForms)
  catalog/     CATALOG.md + catalog.json: daftar bucket > section > field > tipe > locator (DIGENERATE)
```

## Alur kerja
1. **Eksplorasi** UI (read-only): `tests/explore/explore-all-buckets.spec.ts` -> `explore-output/buckets/<bucket>.json`.
2. **Generate page object**: `node scripts/generators/generate-pages.js [--only=<bucket>] [--force]`
   (file `// AUTO-GENERATED` boleh diedit manual; `--force` menimpa).
3. **Bangun katalog**: `npm run catalog:build` (`npm run catalog:check` untuk memastikan tidak basi).
4. **Pakai**: spec/step memanggil getter, mis. `new DataPribadiSection(page).maritalStatus.select('Menikah')`.

## Aturan
- Selector baru ditambah di page object (atau kontrol di `controls/`), bukan di spec.
- Prioritas selector: atribut `name` (react-hook-form) > `data-testid` > role/label > xpath (hindari).
- Kontrol baru: tambah class di `controls/FormControls.ts` dan satu baris di `CONTROLS` pada `scripts/generators/build-catalog.js`.
- Jangan edit `catalog/*` manual.

## Untuk menyusun TC dari katalog
Buka `pages/catalog/CATALOG.md` (manusia) atau `catalog.json` (mesin). Per field tersedia label, wajib/tidak (`*`),
tipe, dan locator, cukup untuk skenario positif, negatif, boundary, dan wajib-isi. Opsi dropdown tidak ikut
terdaftar karena diambil dari UI saat runtime (`Dropdown.options()`).

## Gherkin (playwright-bdd)
`features/**/*.feature` (Bahasa Indonesia, `# language: id`) + `features/steps/*.ts` (memakai fixture di
`features/steps/fixtures.ts`). Jalankan `npm run bdd:test`. Config terpisah: `playwright.bdd.config.ts`.
