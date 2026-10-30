# CONSTITUTION: automation-lamos (LAMOS Playwright Automation)

> **Status**: Dokumen Non-Negotiable (Wajib Dipatuhi oleh Semua AI Agent & Developer)
> **Referensi**: Berakar dari `AGENTS.md` dan `PROJECT_HISTORY.md`

---

## 1. Lingkungan & Integritas Data (Safety First)
1. **Target Lingkungan**: Lingkungan SIT Bank Sinarmas (`https://los-fe-coreloan-sit.devs.banksinarmas.com/`).
2. **Kerahasiaan Kredensial**: DILARANG KERAS menyalin kredensial dari `.env` (seperti username, password, token) ke dalam prompt, file kode yang di-commit, atau log publik.
3. **Prinsip READ-ONLY saat Eksplorasi**:
   - DILARANG mengklik tombol **"Simpan"**, **"Kirim"**, **"Lanjutkan"**, atau **"Hapus"** di lingkungan SIT tanpa izin eksplisit dari pengguna.
   - Setiap modal (seperti modal Tambah Agunan) harus ditutup kembali secara aman menggunakan tombol Batal / Escape setelah inspeksi selesai.

---

## 2. Standar DOM Selector (Anti-Fragile Selectors)
1. **Wajib Menggunakan Atribut `name`**:
   - Input teks, number, textarea, dan radio wajib menggunakan selector `[name="..."]` (dari react-hook-form, contoh: `input[name="identityAddress.rt"]`).
2. **DILARANG Menggunakan `id` Dinamis**:
   - Hindari selector dengan suffix dinamis seperti `#input-r0`, `#input-r1b` karena ID ini berubah setiap kali komponen re-render.
3. **Penanganan Skeleton Loader (Asynchronous UI)**:
   - Form di LAMOS sering dimuat dengan *skeleton loading* abu-abu.
   - Jangan gunakan `count()` instan untuk mengecek keberadaan field. Gunakan auto-wait Playwright (`waitFor({ state: 'visible' })` atau `expect(locator).toBeVisible()`).
4. **Accordion Bersifat Single-Open**:
   - Membuka satu section accordion akan menutup section lain. Navigasi antar section harus dilakukan secara sekuensial.

---

## 3. Protokol Eksekusi & Verifikasi (Superpowers TDD)
1. **Verification-Before-Completion**:
   - Status "✅ terverifikasi" HANYA boleh dicantumkan jika perintah test (`npx playwright test ...`) benar-benar dieksekusi dan menghasilkan 100% passed.
   - Jika hanya ditulis tapi belum dieksekusi, tandai sebagai "🟡 belum diverifikasi".
2. **Systematic Debugging**:
   - Saat test gagal, periksa trace (`test-results/.../trace.zip`) atau `error-context.md`. Dilarang menebak-nebak selector tanpa bukti dari DOM snapshot.
3. **Pencatatan Riwayat (Living Memory)**:
   - Setiap akhir sesi kerja, wajib memperbarui tanggal dan menambahkan entri di bagian **6. Riwayat** pada `PROJECT_HISTORY.md` sesuai format standar `AGENTS.md`.

