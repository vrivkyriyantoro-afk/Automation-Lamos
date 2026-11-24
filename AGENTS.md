# AGENTS.md — aturan untuk semua LLM / AI agent

Berlaku untuk Claude, Gemini, GPT/Codex, Copilot, Cursor, dan agent lain yang mengerjakan repo ini.

## 1. Sebelum mulai

1. Baca **`PROJECT_HISTORY.md`** secara efisien (hemat token):
   - **Wajib baca**: Konvensi DOM (bagian 2.2), Gotcha penting (bagian 5), dan **Status & TODO (bagian 7)**.
   - **Bagian 6. Riwayat**: **Cukup baca 3–5 entri riwayat terbaru (tanggal paling atas)** untuk memahami konteks sesi terakhir. **Jangan baca seluruh riwayat lama dari awal sampai habis** agar tidak memboroskan token context window.
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
- **Standar format ID Test Case**: Mengikuti pola `TC-<StoryKey>-<NoUrut>` (contoh: `TC-4890-01`, `TC-4944-01`).
- **Cara menghitung jumlah Test Case**: Hitung dari **kolom `Test Case ID`**, JANGAN dari jumlah baris file CSV. Sel pada kolom Prekondisi/Langkah/Expected berisi teks multi-baris sehingga `wc -l` atau `Measure-Object -Line` menghasilkan angka jauh lebih besar dan menyesatkan. Perintah benar: `Import-Csv "exports\<file>.csv" | Where-Object { $_.'Test Case ID' -match '^TC-' } | Measure-Object`. Rekap resmi per story ada di `PROJECT_HISTORY.md` bagian **1.1**.
- **Standar Judul Test Case**: Judul skenario (Title) wajib konsisten menggunakan kata awalan **`Validasi ...`** (misal: *"Validasi Modal dan Urutan Stepper saat Klik Tambah Agunan"*, *"Validasi Tombol Simpan Disabled saat Mandatory Belum Lengkap"*).
- **Konfirmasi Jenis Debitur**: Selalu tanyakan terlebih dahulu jenis debitur yang akan diuji (`individual` / Perseorangan vs `company` / Badan Usaha) serta Application ID target kepada user sebelum menjalankan atau membuat test suite baru, kecuali sudah ditentukan secara eksplisit.
- **Eviden & Tangkapan Layar (Full Per-Step)**: Screenshot eviden wajib **dipetakan 1:1 terhadap kolom `Langkah Pengujian` pada CSV matriks Test Case** — bukan dikarang bebas oleh agent.
  1. **Jumlah & urutan `test.step` = jumlah & urutan butir langkah di CSV.** Kalau CSV punya 4 butir langkah, spec wajib punya 4 `test.step` dengan urutan identik. Dilarang menggabung 2 langkah jadi 1 step atau memotong langkah terakhir.
  2. **Nama `test.step` menyalin teks butir langkah CSV** (boleh dipersingkat, tapi inti aksinya harus sama). Contoh CSV butir 1 `Klik bucket lain (misal: "Struktur Kredit")` → `test.step('1. Klik bucket lain (Struktur Kredit)')`.
  3. **Prekondisi bukan langkah.** Screenshot kondisi awal (sebelum langkah 1 dijalankan) dipisah sebagai `step-0` / `Prekondisi: ...`, jangan dihitung sebagai langkah 1.
  4. **Screenshot pada butir langkah terakhir wajib membuktikan `Expected Result`.** Elemen yang disebut di Expected Result (mis. badge status `Draft`, counter `Daftar agunan (n)`) harus terlihat di frame screenshot tersebut; kalau tidak terlihat, pakai `fullPage: true` atau `locator.screenshot()` pada section target.
  5. Penamaan file: `<TC-ID>-step-N.png`, atau attach via `testInfo.attach('Step N: <teks langkah>', ...)`.
  6. Penanda visual kotak merah (red outline highlight) di-hide / ditiadakan.
- **Push GitHub Harian (Jam 16.00 Sore)**: Setiap pukul 16.00 sore (akhir sesi kerja), ingatkan user untuk melakukan push perubahan ke remote GitHub. **Wajib minta konfirmasi user terlebih dahulu** sebelum menjalankan `git add` / `git commit` / `git push` — jangan push otomatis tanpa persetujuan. Sebelum push, pastikan tidak ada kredensial `.env` atau secret yang ikut ter-commit.
- **Sinkronisasi Obsidian Vault (QA BSM)**: Knowledge base QA proyek ini tersinkronisasi dengan Obsidian Vault di `C:\Users\V50324\Documents\obsidian\QA BSM\Projects\LAMOS\`. Catatan defect dan spesifikasi disinkronkan ke subfolder terkait (mis. `Agunan/`).
- **Standar Format Laporan Defect**: Laporan defect disimpan di `docs/` dengan struktur baku:
  ```markdown
  # Laporan Defect — [Nama Fitur / Modul] ([Nomor Story])

  **Tanggal:** [DD MMMM YYYY]  
  **Environment:** [SIT URL]  
  **Story terkait:** [S2CML-XXXX](URL Jira)  
  **Application ID:** [ID Pengajuan] (`debtorType=individual/business`)  
  **Status:** Open / Ready to Submit to Jira  

  ---

  ## [ID-DEFECT] — [Judul Singkat & Spesifik Masalah]

  - **Components:** [Bucket] → [Nama Form / Section]
  - **Story Points:** [1 / 2 / 3 / ...]
  - **Test Case Terkait:** `TC-XXXX-XX`

  ### 1. Ringkasan Masalah (Summary)
  [Penjelasan singkat inti defect dan dampaknya]

  ### 2. Data Uji (Test Data)
  * Field A: `...`
  * Field B: `...`

  ### 3. Langkah Reproduksi (Steps to Reproduce)
  1. Buka URL: `...`
  2. Klik tombol `...`
  3. Input data `...`
  4. Amati respons sistem.

  ### 4. Expected vs Actual Result
  | Aspek | Expected Result (AC / Figma) | Actual Result (SIT) |
  |---|---|---|
  | [Komponen/Field] | [Ekspektasi] | [Kondisi aktual di SIT] |

  ### 5. Bukti Teknis & Eviden
  - **Screenshot**: Path file screenshot eviden (`explore-output/bug/...`).
  - **cURL Command**: Perintah copy as cURL (bash) dari Network DevTools untuk reproduksi langsung:
    ```bash
    curl 'https://...' \
      -H 'Authorization: Bearer ...' \
      --data-raw '...'
    ```
  - **Payload API / Snippet DOM**: JSON payload request/response atau markup pendukung.
  ```


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

## 6. Token Optimization (RTK — Rust Token Killer)

Jika `rtk` terpasang di sistem, utamakan pembungkusan perintah verbose untuk menghemat context window:
- Test Playwright: `rtk npx playwright test <file> --project=chromium`
- Git verbose: `rtk git diff`, `rtk git status`
- Filter output: Jangan menempelkan log ANSI mentah / ratusan baris skeleton trace ke riwayat atau prompt.

