---
name: systematic-debugging
description: Protokol investigasi akar masalah (root cause analysis) saat test Playwright gagal atau flaky
---

# Skill: Systematic Debugging

## Aturan Utama
**DILARANG MENEBAK SELECTOR ATAU TIMEOUT SECARA ACAK.**
Jika test Playwright gagal atau timeout, jangan langsung mengubah selector atau menambah `waitForTimeout()` tanpa bukti log.

## Protokol Investigasi Langkah demi Langkah:

1. **Periksa Error Context & DOM Snapshot**:
   - Buka `test-results/<test-folder>/error-context.md`.
   - Periksa pohon snapshot YAML: apakah elemen target ada di DOM? Apakah posisinya tersembunyi, disabled, atau masih dalam skeleton loading?
2. **Periksa Playwright Trace**:
   - Jika trace dihasilkan (`trace.zip`), inspect action log untuk melihat titik exact di mana locator gagal resolve.
3. **Analisis Akar Masalah (Root Cause)**:
   - Apakah karena re-render komponen React (misal form ter-reset)?
   - Apakah karena selektor menggunakan ID dinamis (`-r...`) yang berubah?
   - Apakah karena modal/listbox lain masih menutupi elemen?
4. **Perbaiki Berdasarkan Bukti**:
   - Gunakan selector yang terbukti ada di snapshot (prioritaskan atribut `name` atau role yang unik).
5. **Jalankan Ulang & Buktikan**:
   - Eksekusi kembali test untuk memastikan masalah benar-benar teratasi.

