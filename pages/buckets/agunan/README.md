# Agunan (bucket id `agunan`)

Folder ini **sengaja belum berisi page object**. Selector Agunan masih tersebar di `tests/bucketAgunan/**`
(sekitar 1.257 baris selector di 80 spec). Dipindahkan bertahap, satu modul per sesi, dan diverifikasi tiap modul.

Urutan migrasi yang disarankan (lihat `docs/buckets/agunan.md`): Step 1 Informasi umum, Step 2 Pengikatan,
Step 3 Kepemilikan, lalu Data tambahan, Penilaian, Cash collateral.
Setiap modul menjadi `pages/buckets/agunan/<Modul>Section.ts` dengan kontrol dari `pages/controls/FormControls.ts`,
lalu `npm run catalog:build` agar field-nya masuk katalog.
