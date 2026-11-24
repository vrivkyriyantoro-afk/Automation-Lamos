---
name: isi-identitas
description: Lengkapi bucket 1 (Identitas & Pengecekan) pengajuan perorangan di SIT LAMOS dengan data dummy, termasuk Data penjamin (2 perorangan Menikah + pasangan, 1 badan usaha + pengurus/pemegang saham). Pakai saat user minta "isi/lengkapi bucket identitas", "isi data penjamin", atau memberi URL/App ID credit-application dan minta dilengkapi. Berhenti sebelum Lanjutkan/Kirim.
---

Argumen: `<APP_ID atau URL credit-application> [--penjamin-saja | --tanpa-penjamin]`

Contoh: `/isi-identitas 01M86D9V7VSGWYPHT7TMR3RJ7G`

Skill ini MENULIS data ke SIT. Pemanggilan oleh user = izin mengisi data dummy untuk App ID itu. Tanggal lahir/data autofill leads yang terkunci JANGAN diubah. File upload yang sudah ada JANGAN dihapus.

## 0. Siapkan
1. Ambil App ID dari argumen (26 karakter setelah `/credit-application/`). Tanpa App ID: tanya user.
2. Baca `docs/buckets/identitas.md` (rule form, gate, gotcha) dan bagian IDENTITAS di `docs/GREEN_FLOWS.md`.
3. Semua perintah dari root repo, PowerShell, **selalu `--headed`** supaya user melihat browser. Jangan jalankan dua run SIT paralel. Run >2 menit: `run_in_background`.
4. Jangan cetak isi `.env`; kredensial dari `LAMOS_USERNAME`/`LAMOS_PASSWORD`.

## 1. Section Identitas (selain penjamin)
```powershell
$env:APPLICATION_ID_IDENTITAS_LENGKAP='<APP_ID>'; $env:SKIP_PENJAMIN='1'
npx playwright test tests/bucketIdentitas/identitas-lengkap.spec.ts --project=chromium --headed --reporter=line
```
Spec mengisi hanya field kosong (dropdown opsi pertama, radio "Tidak", teks yang labelnya dikenal), dan mengisi section pasangan hanya bila ada di sidebar (debitur Menikah). Hasil: sidebar + diagnosa field wajib kosong. Label teks yang tidak dikenal dilaporkan `[TIDAK DIISI, label tak dikenal]`, tidak ditebak: laporkan ke user.

## 2. Data penjamin (urutan wajib)
```powershell
$env:APPLICATION_ID_PENJAMIN_LP='<APP_ID>'; $env:PENJAMIN_COMMIT='1'
# 2a. dua penjamin perorangan Menikah + pasangan (TEGAR+NENDEN, ERIN+RENALDY)
npx playwright test tests/bucketIdentitas/penjamin-menikah-lp-01M83.spec.ts --project=chromium --headed --reporter=line
# 2b. penjamin ke-3 badan usaha + pengurus/pemegang saham (PT Bintang Sejahtera, PIPIT, CV Makmur Abadi)
npx playwright test tests/bucketIdentitas/penjamin-badan-usaha-lp-01M83.spec.ts --project=chromium --headed --reporter=line
```
- Lewati bagian yang sudah ada: kartu yang sudah Corporate dilewati; jika sudah ada 3 kartu lengkap, jangan jalankan ulang tanpa sebab.
- Jangan ubah data penjamin lain di App ID yang sudah berisi data user.

## 3. Verifikasi akhir
Jalankan ulang langkah 1 tanpa `SKIP_PENJAMIN` (idempotent, hanya baca + isi yang kosong). Harapan: semua section Identitas **Lengkap**, Referensi "Sudah diisi (opsional)", Pengecekan masih "Belum dapat diakses".

## 4. Berhenti dan lapor
- **Jangan** tekan Lanjutkan, konfirmasi dialog "Lanjutkan ke pengecekan?", maupun Kirim. Tanya user dulu; konfirmasi mengirim data ke Dukcapil/DHN/DHIB dan tidak bisa dibatalkan. Bila user setuju: `IDENTITAS_SUBMIT=1` (buka dialog) dan `IDENTITAS_CONFIRM=1` (konfirmasi), dan Kirim hanya atas izin eksplisit tersendiri.
- Laporkan: tabel status sidebar, section yang gagal + penyebab, field `[TIDAK DIISI]`.
- Bila spec gagal dua kali dengan penyebab sama: **berhenti dan lapor**, jangan mengulang tanpa henti.

## 5. Catat
Setelah run passed baru, panggil agen `qa-step-mapper` untuk mencatat flow (App ID, tanggal, spec) di `docs/GREEN_FLOWS.md` dan `docs/buckets/identitas.md`, lalu tambahkan entri di `PROJECT_HISTORY.md`.

## Gotcha ringkas
- Login SSO flake (>60 dtk): ulangi sekali.
- Autosave penjamin hanya saat pindah section; verifikasi lewat muat ulang.
- Kalender datepicker bisa tetap terbuka dan menutupi dropdown: sudah ditangani `fillDate` (Tab, Escape, klik label); jangan klik di luar form modal.
- Backend SIT intermiten 500 pada dropdown (`GUARANTOR_TYPE`, `provinces_lamos`): ulangi sebelum menyimpulkan bug.
- Spec lama `identitas-lengkap-01M83.spec.ts` dan `identitas-lengkap-01M86.spec.ts` masih ada sebagai rujukan; yang dipakai skill adalah `identitas-lengkap.spec.ts`.
