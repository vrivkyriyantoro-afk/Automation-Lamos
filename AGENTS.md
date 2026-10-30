# AGENTS.md — aturan untuk semua LLM / AI agent

Berlaku untuk Claude, Gemini, GPT/Codex, Copilot, Cursor, dan agent lain yang mengerjakan repo ini.

## 1. Sebelum mulai

1. Baca **`PROJECT_HISTORY.md`** sampai habis. Isinya konteks proyek, konvensi DOM aplikasi LAMOS, arsitektur, gotcha, dan TODO.
2. Cek kondisi nyata, jangan hanya percaya history: `git status`, `git log -5`, dan file yang akan disentuh.
   Kalau history tidak cocok dengan kode, **kode yang benar**; perbaiki history-nya.
3. Ambil pekerjaan dari bagian **Status & TODO** kecuali user meminta hal lain.

## 2. Aturan kerja

- **Selector** wajib mengikuti tabel "Konvensi DOM" di `PROJECT_HISTORY.md` (pakai atribut `name`, bukan `id` ber-suffix `-r..`). Kalau menemukan pola DOM baru, tambahkan ke tabel itu.
- **Page object** hasil generate (diawali `// AUTO-GENERATED`) diubah lewat `scripts/generate-pages.js` lalu regenerate. Jangan diedit manual kecuali header-nya dihapus (file jadi manual).
- Jangan menimpa / menghapus file buatan user (`pages/bucketIdentitas/*Page.ts`, `pages/bucketDokumen/DocumentBucketPage.ts`) tanpa izin user.
- Explore aplikasi harus **read-only**: jangan klik `Simpan`, `Kirim`, `Lanjutkan`, `Hapus`, atau upload file di lingkungan SIT kecuali user meminta.
- Jangan menulis isi `.env` (kredensial) ke file, log, commit, atau prompt.
- Folder bucket: ikuti nama yang sudah ada (case-sensitive di CI Linux), mis. `bucketCovenantTBO`.
- Keputusan user yang tercatat di history (mis. Agunan di-skip) tetap berlaku sampai user mengubahnya.

## 3. Wajib update `PROJECT_HISTORY.md` di akhir setiap sesi

1. Ubah tanggal **"Terakhir diperbarui"**.
2. Tambahkan entri di bagian **6. Riwayat**, entri terbaru di paling atas, dengan template ini:

   ```markdown
   ### YYYY-MM-DD — <judul singkat> (<nama model/tool>, mis. "Gemini 2.5 Pro via Gemini CLI")
   - Dikerjakan: <apa yang diubah, sebut path file>
   - Verifikasi: <perintah yang dijalankan + hasilnya, mis. "smoke test data_usaha: 3/3 lolos">
   - Belum selesai / gagal: <jujur; tulis "-" bila tidak ada>
   - Keputusan user: <arahan baru dari user; "-" bila tidak ada>
   ```

3. Perbarui **2.1 tabel bucket**, **5. Gotcha**, dan **7. Status & TODO** bila berubah: hapus TODO yang selesai, tambahkan yang baru.

## 4. Kejujuran status

- Tulis "✅ terverifikasi" **hanya** bila test/typecheck benar-benar dijalankan dan lolos. Sebutkan perintahnya.
- Yang hanya ditulis tapi belum dijalankan: tandai "🟡 belum diverifikasi".
- Proses yang terhenti / gagal dicatat apa adanya, beserta output error yang relevan.
- Jangan menghapus entri riwayat milik model lain. Koreksi dengan entri baru.

## 5. Verifikasi standar

```bash
# typecheck (TypeScript tidak terpasang di project)
npx -y -p typescript@5 tsc --noEmit --strict --target es2022 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck --types node <files...>

# locator generated vs aplikasi asli (read-only)
npx playwright test tests/sections-locator-smoke.spec.ts --project=chromium --workers=2
```
