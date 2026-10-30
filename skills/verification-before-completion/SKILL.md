---
name: verification-before-completion
description: Protokol wajib verifikasi eksekusi nyata sebelum AI menutup tugas atau menandai selesai
---

# Skill: Verification Before Completion

## Aturan Non-Negotiable
**TIDAK ADA ASUMSI.** Kode yang hanya ditulis atau dikompilasi TIDAK BOLEH diklaim sebagai selesai atau berhasil.

## Syarat Wajib Sebelum Menutup Tugas:

1. **Jalankan Perintah Verifikasi Nyata**:
   - Untuk test Playwright:
     ```bash
     npx playwright test <path-to-test> --project=chromium
     ```
   - Untuk kompilasi / typecheck:
     ```bash
     npx playwright test <path-to-test> --list
     ```
2. **Lampirkan Bukti Log**:
   - Wajib mencantumkan ringkasan output eksekusi nyata (contoh: `1 passed (15.9s)`).
3. **Kejujuran Status**:
   - Jika perintah lolos: Tandai "✅ terverifikasi".
   - Jika hanya ditulis tanpa run ke SIT: Tandai "🟡 belum diverifikasi".
   - Jika gagal: Jelaskan penyebab kegagalan secara transparan.
4. **Catat ke Living Memory**:
   - Perbarui entri riwayat di `PROJECT_HISTORY.md` sesuai template di `AGENTS.md`.

