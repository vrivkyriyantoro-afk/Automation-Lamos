---
name: using-git-worktrees
description: Protokol isolasi cabang kerja menggunakan git worktree agar tidak merusak branch utama
---

# Skill: Using Git Worktrees

## Tujuan
Saat melakukan eksperimen form baru atau exploratory testing di LAMOS, gunakan `git worktree` atau branch terpisah agar branch kerja utama Anda (`rivky.lamos-bulk-dokumen` dsb.) tetap stabil dan bersih.

## Cara Penggunaan:

1. **Buat Worktree Baru untuk Eksplorasi Fitur**:
   ```bash
   git worktree add -b feat/explore-agunan ../automation-lamos-agunan
   ```
2. **Pindah ke Direktori Worktree**:
   - Seluruh eksperimen file test baru dilakukan di sana tanpa mempengaruhi file di workspace utama.
3. **Merge / Hapus setelah Selesai**:
   - Jika test sudah terverifikasi dan stabil, commit dan merge ke branch utama.
   - Hapus worktree setelah tidak digunakan:
     ```bash
     git worktree remove ../automation-lamos-agunan
     ```

