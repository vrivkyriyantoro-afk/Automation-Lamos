---
name: test-driven-development
description: Protokol TDD (Test-Driven Development) untuk penulisan skrip otomasi Playwright di LAMOS
---

# Skill: Test-Driven Development (TDD)

## Filosofi
Jangan pernah menulis implementasi form filler atau page object secara membabi buta tanpa mendefinisikan skenario dan ekspektasi test terlebih dahulu.

## Protokol Kerja AI Agent:

1. **Definisikan Ekspektasi (Spec First)**:
   - Tentukan kontrol apa yang akan diuji berdasarkan dokumen di `specs/<nama-bucket>/spec.md` atau desain Figma / Excel acuan.
2. **Tulis File Test Terlebih Dahulu (Red Phase)**:
   - Buat test di `tests/<namaBucket>/<nama-test>.spec.ts`.
   - Tuliskan assertion awal (misalnya: cek keberadaan field, cek opsi dropdown, atau cek validasi mandatory).
3. **Implementasikan / Lengkapi Page Object (Green Phase)**:
   - Tambahkan locator yang stabil (`input[name="..."]`, `button[name="..."]`).
   - Tambahkan helper method yang menangani skeleton loader.
4. **Verifikasi Nyata**:
   - Jalankan `npx playwright test <path-test>` sampai lolos (Green).
5. **Refactor**:
   - Rapikan kode tanpa mengubah perilaku test yang sudah lolos.

