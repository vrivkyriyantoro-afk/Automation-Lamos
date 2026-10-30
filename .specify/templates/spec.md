# SPEC: [Nama Fitur / Bucket Pengujian]

## 1. Ringkasan & Konteks
- **Bucket ID**: `[mis. identitas_pengecekan | data_usaha | covenant_tbo]`
- **Target Halaman**: `/lamos/credit-application/<appId>/create?bucket=<bucketId>&debtorType=individual`
- **Tujuan**: [Jelaskan apa yang ingin diuji, mis. validasi tampilan form, verifikasi input field, atau kelengkapan data]

## 2. Prekondisi & Lingkungan
- Lingkungan: SIT (`https://los-fe-coreloan-sit.devs.banksinarmas.com/`)
- Autentikasi: Sudah login via SSO (`pages/LoginPage.ts` / stored storageState).
- Data Debitur: Menggunakan ID aplikasi debitur perorangan aktif dari `.env` (`DEBITUR_TARGET`).
- **Batasan Keamanan**: Pengujian bersifat **READ-ONLY**. DILARANG submit/simpan/hapus data pengajuan riil tanpa izin eksplisit.

## 3. Skenario Pengujian (Test Cases)

### Skenario 1: [Navigasi & Pembukaan Bucket/Section]
- **Aksi**: Buka tab bucket `[bucketId]` dan pastikan section `[Nama Section]` terbuka.
- **Ekspektasi**:
  - Tab berstatus aktif.
  - Section menampilkan form (bukan skeleton loading abu-abu).
  - Status section pada aside menu sesuai dengan kondisi form.

### Skenario 2: [Verifikasi Field & Kontrol Input]
- **Aksi**: [mis. isi form / periksa nilai default / periksa opsi dropdown]
- **Ekspektasi**:
  - Field dapat menerima input sesuai format (mis. format nominal mata uang / tanggal).
  - Tidak memicu validasi error yang tidak diinginkan.

## 4. Kriteria Penerimaan (Acceptance Criteria)
- [ ] Semua kontrol yang diuji menggunakan selector stabil (`name`, bukan `id` ber-suffix dinamis).
- [ ] Pengujian menangani transisi asinkron (skeleton loading) dengan auto-wait Playwright yang aman.
- [ ] Test lolos saat dijalankan dengan `npx playwright test`.

