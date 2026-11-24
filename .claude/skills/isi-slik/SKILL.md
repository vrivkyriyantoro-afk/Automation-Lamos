---
name: isi-slik
description: Buat file SLIK mock (NIK_<nik>.txt / NPWP_<npwp>.txt) otomatis dari data entitas pengajuan (debitur, penjamin, pasangan, pengurus/pemegang saham), lalu unggah di modal "Lengkapi file SLIK" SIT LAMOS dan proses impornya. Pakai saat user minta "isi/upload SLIK", "buat file NIK txt", atau Pengecekan SLIK belum lengkap. Skill ini DESTRUKTIF bila memakai Hapus semua file.
---

Argumen: `<APP_ID> [--hapus] [--tanpa-proses]`

Skill MENULIS ke SIT. Pemanggilan = izin mengunggah file mock untuk App ID itu. `--hapus` (Hapus semua file) menghapus SEMUA file SLIK yang sudah ada, termasuk yang sudah diproses: konfirmasi ke user sebelum memakainya. Jangan menekan Kirim/Lanjutkan.

## 0. Siapkan
1. Baca `docs/buckets/identitas.md` (rule tombol "Proses file .txt") dan entri `GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD` + `GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD` di `docs/GREEN_FLOWS.md`.
2. PowerShell dari root repo, `--headed`, jangan run SIT paralel, run panjang `run_in_background`. Jangan cetak `.env`.
3. PDF pendamping: `C:/Users/V50324/Downloads/document-10mb.pdf` (di luar repo; pakai garis miring biasa). Bila tidak ada, minta user.

## 1. Daftar entitas
`fixtures/entities/slik-entities.json` berisi entitas urut baris modal (type NIK/NPWP, id, nama, gender, tanggal lahir; NPWP berisi daftar pengurus/pemilik). Untuk App ID baru, ISI ULANG dari data aplikasi, jangan karang:
- Baca halaman lewat spec read-only: `tests/bucketIdentitas/read-data-debitur.spec.ts`, `read-data-penjamin.spec.ts`, `read-pengurus-penjamin.spec.ts` (env `APP_ID`; output `explore-output/identitas/*.json`).
- Debitur dan penjamin memakai NIK dari halaman (autofill leads terkunci); pasangan, pengurus ikut daftar pengurus. Urutan baris = urutan di modal (lihat `slik-modal.json` / modal itu sendiri). Gunakan nama entitas, bukan "Penjamin N", karena label modal bisa berbeda dari halaman.
- Nomor identitas di DALAM file harus sama dengan entitas baris (SIT menolak: "No ID Entitas ... tidak sesuai").

## 2. Generate file
```powershell
node scripts/generators/gen-slik.js --out exports/slik/slik-<APP_ID>
```
Struktur diklon dari template `exports/slik/NIK_3276020602850001.txt` (Windows-1252) dan `exports/slik/NPWP_3210077012810002.txt` (UTF-8); data fasilitas = salinan template, bukan data nyata. File yang sudah ada tidak ditimpa tanpa `--force`. Folder baru, jangan menimpa `exports/` lain.

## 3. Upload + proses
```powershell
$env:DIR='exports/slik/slik-<APP_ID>'; $env:APP_ID='<APP_ID>'; $env:PROSES='1'
# $env:HAPUS='1'   # hanya bila App ID sudah pernah diproses (tombol Proses abu-abu); destruktif
npx playwright test tests/bucketIdentitas/upload-semua-slik.spec.ts --project=chromium --headed --reporter=line
```
Spec: buka modal, (opsional Hapus semua), per baris Kelola file -> .txt + .pdf -> Simpan, cek tombol "Proses file .txt" (biru = aktif), klik bila `PROSES=1`, lalu buka ulang modal dan tulis `explore-output/identitas/upload-semua-verifikasi.txt`. Bila tombol tetap abu-abu: berhenti, laporkan (kemungkinan App ID sudah diproses; perlu `HAPUS=1` dengan izin user).

## 4. Verifikasi (impor butuh beberapa menit)
Tunggu ~3 menit, lalu: `npx playwright test tests/bucketIdentitas/read-slik-status.spec.ts --reporter=line` (read-only) dan baca `explore-output/identitas/slik-status-check.txt`. Harapan: semua baris "Berhasil diimpor", bucket "Pengecekan SLIK" Lengkap. "Sedang mengimpor..." = ulangi baca nanti. Error "No ID Entitas ... tidak sesuai" = file salah baris.

## 5. Lapor dan catat
Laporkan tabel baris -> file -> status. Setelah run passed baru, panggil agen `qa-step-mapper` (GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD/REUPLOAD, kartu identitas) dan tambah entri `PROJECT_HISTORY.md`.

## Gotcha ringkas
- Overlay modal aria-hidden: pakai `getByText(..., {exact:true})` + `force`.
- Memilih file baru MENAMBAH kartu; "Simpan" di dialog hanya mengubah state klien sampai "Proses file .txt".
- Baris 7 pernah menampilkan dua kartu (ERIN+PIPIT) setelah Hapus semua + upload: asal tidak terjelaskan.
- Run dengan PDF 10 MB bisa lama (3-11 mnt).
