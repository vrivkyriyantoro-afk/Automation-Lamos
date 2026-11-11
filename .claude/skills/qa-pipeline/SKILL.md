---
name: qa-pipeline
description: Jalankan alur QA agent BSM (S1–S7) untuk satu story Jira — spec, plan, gate approval, Playwright, verifikasi, update tracker vault QA-BSM. Pakai saat user minta kerjakan/lanjutkan story QA, susun test case, atau update tracker.
---

Argumen: `<StoryKey> [state awal]` (default `S1_DISPATCH`).

## 1. Temukan vault QA-BSM

Pakai yang pertama ada:
0. Workspace saat ini, bila berisi `References/AGENT_COMMAND_PIPELINE.md` (skill dipanggil dari dalam vault)
1. Env var `QA_BSM_VAULT`
2. `~/Documents/QA BSM` (Windows: `%USERPROFILE%\Documents\QA BSM`)
3. `~/QA-BSM` — jika belum ada: `git clone https://github.com/vrivkyriyantoro-afk/QA-BSM.git ~/QA-BSM`

Sebelum membaca, jalankan `git pull --ff-only` di vault. Jika gagal (konflik / perubahan lokal), lanjut dengan versi lokal dan beri tahu user.

## 2. Baca aturan (wajib, sebelum aksi apa pun)

- `References/00_AGENT_RULES_QA.md` — aturan induk
- `References/AGENT_COMMAND_PIPELINE.md` — state S1–S7 + aturan tracking
- MOC proyek (`MOC/MOC_<Proyek>.md`) → tracker modul (mis. `Projects/LAMOS/Agunan/Stories/Index Story Agunan.md`)

Aturan di vault adalah sumber kebenaran. Jika skill ini bertentangan dengan vault, ikuti vault.

## 3. Jalankan state

- Lapor ke user tiap pindah state: `[S3_PLAN → S4_GATE] <ringkasan>`.
- **S4_GATE: berhenti.** Lanjut ke S5 hanya bila `plan.md` berstatus `final` atau user menyetujui eksplisit.
- **S5–S6** di repo otomasi (mis. `Automation-Lamos`): baca `AGENTS.md` + `PROJECT_HISTORY.md` repo itu dulu. SIT read-only.
- **S6**: tulis `passed` hanya bila test benar-benar dijalankan dan lolos. Gagal → baca trace/screenshot dulu, jangan tebak selector.
- **S7**: update tracker modul + `tasks.md` + `PROJECT_HISTORY.md` repo.

## 4. Simpan ke vault

Commit perubahan vault dengan pesan `qa-pipeline: <StoryKey> <state>`. **Jangan push** — user yang push setelah cek.
