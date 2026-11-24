# KARTU BUCKET — <Nama bucket> (`<bucket_id>`)

> Pemilik: `qa-step-mapper`. Salin file ini ke `docs/buckets/<bucket>.md` saat memetakan bucket baru. Tanpa bukti = tulis "tidak terbukti".

Terakhir diperbarui: **<tanggal>** (<sumber bukti>)

## 1. Identitas bucket
- Bucket id, judul tab, URL, folder page object, varian (perorangan/badan usaha), App ID uji.

## 2. Peta section / step (urutan, status Lengkap, kelas page object, tanggal bukti)

## 3. Rule form per section / step
Per section: field wajib (`*`) vs opsional, tipe kontrol, autofill/terkunci, field kondisional (kapan muncul),
dropdown berantai, validasi yang terbukti, upload (format/ukuran), perilaku simpan (tombol vs autosave),
tombol aktif/disabled dan syaratnya. Sertakan bukti (file:baris, probe, screenshot).

## 4. Gate dan alur antar section / bucket
Urutan wajib, prasyarat lintas bucket (rujuk ID flow), aksi yang MENULIS final (Kirim/Simpan) dan izin yang dibutuhkan.

## 5. Gotcha khusus bucket

## 6. Konflik dan celah terbuka
Yang tidak terbukti dicatat eksplisit.
