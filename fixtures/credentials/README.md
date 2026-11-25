# Credential per role

1. Salin `roles.example.csv` menjadi `roles.csv` di folder ini, lalu isi username/password asli.
2. `roles.csv` **di-ignore git** (berisi password). Hanya `roles.example.csv` dan README ini yang boleh di-commit.
3. Kolom wajib: `role`, `username`, `password`. Kolom lain (mis. `keterangan`) diabaikan.
4. Pemisah koma (`,`) atau titik koma (`;`) terdeteksi otomatis (Excel Indonesia menyimpan CSV dengan `;`). Baris kosong dan baris berawalan `#` dilewati.
5. Dari Excel: *Save As* > **CSV UTF-8**. Tidak perlu paket tambahan.
6. Lokasi lain: set env `ROLES_FILE=<path>`. Pilih sebagian role: `ROLES=maker,checker`.
7. Tanpa `roles.csv`, hanya role `default` yang tersedia (dari `LAMOS_USERNAME`/`LAMOS_PASSWORD` di `.env`).

Pemakaian di test: lihat `utils/credentials.ts`, `utils/roleSession.ts`, dan contoh `tests/auth/multi-role.spec.ts`.
