# Agunan (bucket id `agunan`)

Migrasi selector Agunan dari `tests/bucketAgunan/**` ke sini dilakukan **bertahap, satu modul per sesi**,
dan diverifikasi tiap modul. Selector Agunan tersebar sekitar 1.257 baris di 80 spec saat migrasi dimulai.

## Sudah dimigrasi
- `AgunanModal.ts`: alur pembuka form (`+ Agunan` -> jenis -> nomor -> Cari -> `+ Agunan Baru`).
  Menggantikan salinan helper `openTambahAgunanModal` (10 spec) dan `navigateToFormAgunanBaru` (10 spec).
  Spec memanggil lewat pembungkus tipis dengan nama lama, jadi isi test tidak berubah.

## Belum dimigrasi (urutan disarankan)
1. Field Step 1: Informasi umum (status agunan, peringkat), Pengikatan, Alamat (`modul2-4`). Saat ini selector berbasis teks
   (`text=Jenis pengikatan`), perlu pemetaan field-per-field agar masuk katalog.
2. Data Pembanding dan Penilaian (`modul5`, `modul6-*`).
3. Step 2 Data tambahan, Cash collateral (`modul7-*`).
4. Step 3 Kepemilikan (`modul8-*`, `helpers/agunanModal.ts`: kategori, tipe kepemilikan, SLIK).
5. Edit/Hapus via Titik 3 (`s2cml-4941`, `s2cml-6020`).

## Sengaja belum disatukan
- `navigateToFormAgunanBaru` di `s2cml-4890-negative-rules.spec.ts` dan `s2cml-5420.spec.ts`: urutan langkahnya sedikit berbeda
  (mis. jeda 1 dtk setelah klik `+ Agunan`). Perlu dibandingkan dan diverifikasi ke SIT sebelum disatukan.
- Helper di `tests/bucketAgunan/_shared/` (`agunanModal.ts`, `greenFlowTanah.ts`): masih dipakai 8+ spec.

Setelah modul dipindah ke `pages/buckets/agunan/<Modul>Section.ts` dengan kontrol dari `pages/controls/FormControls.ts`,
jalankan `npm run catalog:build` agar field-nya masuk katalog. `AgunanModal` belum masuk katalog karena belum memakai kontrol bertipe.
