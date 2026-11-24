# GREEN FLOWS — Registry Alur Terbukti LAMOS

> **Pemilik:** sub-agent `qa-step-mapper` (satu-satunya agent yang boleh mengubah file ini dan `docs/buckets/*.md`).
> **Pembaca:** semua agent QA (`qa-spec-auditor`, `qa-explorer`, `qa-test-runner`, `qa-anomaly-judge`) dan sesi utama / skill `qa-pipeline`.
> Bila flow yang dibutuhkan belum ada atau berstatus `STALE`/`BLOCKED`, agent pembaca menulis di laporannya: **"butuh qa-step-mapper untuk GF-…"**. Sesi utama yang memanggil `qa-step-mapper`.

Terakhir diperbarui: **2026-11-24** (tambah GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD; catat alur modal SLIK + data baca-saja App ID `01M83AP5FKPHB1D3E2QS8P015Z`). Sebelumnya 2026-11-23 (run Identitas perorangan, penjamin, pengecekan). Sebelumnya 2026-11-22 (audit riwayat, `run-history/`, `explore-output/`).

## Kartu bucket (rule form dan gate per bucket)

Rule form, peta section/step, gate, dan gotcha **per bucket** ada di `docs/buckets/`: [identitas](buckets/identitas.md), [agunan](buckets/agunan.md), [dokumen](buckets/dokumen.md) (stub), template [_TEMPLATE](buckets/_TEMPLATE.md). Baca kartu bucket yang relevan sebelum membaca flow di bawah. File ini menyimpan status flow dan peta dependensi.

## Cakupan saat ini

**Fase 1: Bucket Agunan** (keputusan user 2026-11-22). Pemetaan menyeluruh baru untuk Agunan; Identitas penuh, Dokumen, dll menyusul.

**Pengecualian, berlaku di fase mana pun:** flow di **luar bucket story yang sedang dikerjakan** yang dibutuhkan sebagai prasyarat (mis. story Agunan butuh Identitas `Lengkap`) **selalu dilayani**. Agent QA yang membutuhkannya bertanya ke `qa-step-mapper` dengan format "butuh qa-step-mapper untuk GF-<BUCKET>-…: <tujuan>, dipakai oleh story <KEY>". Flow prasyarat itu lalu didaftarkan di registry pada bagian bucket-nya, dengan catatan "dipakai oleh: <story>".

## Aturan registry

1. **Satu entri = satu flow** dengan ID `GF-<BUCKET>-<NAMA>` (huruf besar, tanda hubung).
2. **Status:**
   - `LOLOS`: ada run passed. Wajib mencantumkan tanggal + perintah/spec + sumber bukti.
   - `BLOCKED`: fitur belum deploy atau prekondisi data tidak tersedia di SIT.
   - `STALE`: pernah lolos, tapi run terbaru gagal atau UI berubah. Jangan dihapus; tulis alasannya.
   - `BELUM DICOBA`: alur diketahui dari AC/Figma, tapi belum pernah dijalankan.
3. **Prasyarat** merujuk ke ID flow lain (boleh lintas bucket). Agent harus memenuhi prasyarat dulu sebelum menjalankan flow.
4. **Tanpa kredensial.** Tulis nama variabel `.env`, jangan nilainya. App ID boleh ditulis.
5. **Konflik** (riwayat vs kode, atau dua run bertentangan) dicatat di kolom Konflik, jangan dipilih diam-diam.
6. Selector mengikuti Konvensi DOM di `PROJECT_HISTORY.md` bagian 2.3. Tulis helper yang dipakai ulang, bukan menyalin kode panjang.
7. **Bukti run:** `run-history/*.json` dengan durasi < 1 detik adalah hasil `--list`, **bukan** eksekusi. Jangan dihitung sebagai bukti LOLOS.

## Fakta data uji (per 2026-11-22)

- `.env` **tidak** berisi `DEBITUR_TARGET`, `DEBITUR_BU_TARGET`, `TARGET_APP_ID_AGUNAN`, `APP_ID_5420`, `APP_ID_6020`, maupun `DEBITUR_IDENTITAS_LENGKAP`. Semua spec memakai nilai default di kodenya. **Nomor pengajuan 14 digit (`0060052026110014`) tampil di daftar tetapi tidak bisa dipakai di URL**; URL tetap memakai ID ULID. Cari ID: `/lamos/credit-application` > titik 3 baris > "Lanjutkan pengajuan" > baca URL.
- | App ID | Tipe | Identitas | Agunan | Dipakai oleh (default) |
  |---|---|---|---|---|
  | `01M4F7TNSCSHEDB5G3WTSP7HDY` | Perseorangan | belum lengkap (probe 2026-11-03) | 2 FINAL (Reksadana, Setoran Jaminan) + kemungkinan 1 Draft | `agunanModal.ts:4`, modul5/6/7, 4890, 4941, 6018 |
  | `01M79GW1XYEQAK97TM803HFY8F` | Perseorangan (no. pengajuan `0060052026110014`, MUCHAMMAD TAUFAN) | Draf Pengajuan 1/4 (belum lengkap) | draft hasil run TC-4890-09/10 | `s2cml-4890*.spec.ts` perorangan (default sejak 2026-11-24) |
  | `01M7P9WH6PQ1AZ058P0C18QX4Q` | Badan Usaha (no. pengajuan `0060052026110020`, PT Bintang Sejahtera) | Draf Pengajuan 1/4 | – | `badanUsaha/s2cml-4890.spec.ts` (default sejak 2026-11-24) |
  | `01M22NAB4RXT92Y56AJ5VBQT75` | Perseorangan | **completed** (`explore-output/logs/run-febe.log:49-51`) | 0 | dulu nilai `DEBITUR_TARGET`; kandidat untuk auto-fill 001 |
  | `01M482PRSVH5ZMTVZX5QH0VDNZ` | Badan Usaha | – | 2 FINAL | `agunanModal.ts:5`, `badanUsaha/s2cml-4890.spec.ts:18` |
  | `01M5TYDZSJFK7J66ZDK2YHRCZ9` | Perseorangan | – | – | `s2cml-5420.spec.ts:20` |
  | `01M6ZA0CWY9Q33Y031ZRGKFB4E` | Perseorangan | – | Draft + Final, ID kartu `QA-xxxx` | `s2cml-6020.spec.ts:17` |
  | `01M83AP5FKPHB1D3E2QS8P015Z` | Perseorangan | **Lengkap** bagian 1 (2026-11-23); Pengecekan: Dukcapil + DHN DHIB Lengkap; SLIK (2026-11-24 setelah GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD): 8 dari 9 baris "Berhasil diimpor", baris 3 RENALDY masih "Sedang mengimpor...", bucket tampil Lengkap, belum final | belum dicek | `tests/bucketIdentitas/*-01M83.spec.ts` |

## Peta dependensi

```
GF-COMMON-LOGIN
 └─ GF-COMMON-BUKA-BUCKET (individual | business)
     ├─ GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH (LOLOS)
     │   └─ GF-IDENTITAS-PENJAMIN-BADAN-USAHA (LOLOS)
     │       └─ GF-IDENTITAS-LENGKAP (LOLOS bagian 1) ── dipakai → GF-AGUNAN-STEP3-AUTOFILL-001
     │           └─ GF-IDENTITAS-PENGECEKAN (SEBAGIAN: SLIK belum; Kirim tidak ditekan)
     │               └─ GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD (SEBAGIAN; butuh GF-IDENTITAS-DATA-BACA-SAJA untuk daftar entitas)
     │                   └─ GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD (SEBAGIAN; varian App ID sudah pernah diproses; hapus semua + upload ulang + Proses)
     ├─ GF-IDENTITAS-DATA-BACA-SAJA (LOLOS, read-only; ikon mata)
     ├─ GF-AGUNAN-TAMBAH-SEARCH
     │   ├─ GF-AGUNAN-EXISTING-CLS (BLOCKED)
     │   └─ GF-AGUNAN-AGUNAN-BARU
     │       ├─ GF-AGUNAN-STEP1-INFORMASI-UMUM
     │       │   ├─ GF-AGUNAN-STEP1-DATA-PEMBANDING
     │       │   └─ GF-AGUNAN-STEP1-PENILAIAN-LPA
     │       ├─ GF-AGUNAN-STEP2-DATA-TAMBAHAN
     │       ├─ GF-AGUNAN-STEP3-KEPEMILIKAN
     │       │   ├─ GF-AGUNAN-STEP3-AUTOFILL-001 (STALE) ← GF-IDENTITAS-LENGKAP
     │       │   └─ GF-AGUNAN-STEP3-SLIK-005-008 (sebagian)
     │       ├─ GF-AGUNAN-BU-STEPPER ── GF-AGUNAN-BU-STEP3-KEPEMILIKAN
     │       └─ GF-AGUNAN-SIMPAN-DRAFT (klik: LOLOS 2026-11-24)
     ├─ GF-AGUNAN-EDIT-EXISTING (agunan FINAL)
     │   ├─ GF-AGUNAN-EDIT-DRAFT (BELUM DICOBA)
     │   └─ GF-AGUNAN-HAPUS (aksi: BELUM DICOBA)
     ├─ GF-AGUNAN-ICON-KARTU (agunan tersimpan)
     └─ GF-AGUNAN-LOAD-LATEST-DATA (agunan tersimpan)
```

---

## COMMON

### GF-COMMON-LOGIN
- **Status:** LOLOS (dipakai semua suite hijau, mis. 4949 `run-history/2026-11-18T01-45-56-960Z.json`)
- **Prasyarat:** `.env` berisi `LAMOS_USERNAME`, `LAMOS_PASSWORD`
- **Langkah:** `new LoginPage(page)` → `goto()` → `login(user, pass)` → `expectLoginSuccess()` | `pages/LoginPage.ts`, `tests/bucketAgunan/helpers/agunanModal.ts:13-19`
- **Catatan:** redirect SSO Kratos + render awal 60–90 detik → `test.setTimeout(180000)` (Gotcha 11). Flaky di `LoginPage.ts:55` (`not.toHaveURL` kratos): TC-4949-08 gagal login (`run-history/2026-11-18T01-45-56-960Z.json`), `login.spec.ts` gagal (`2026-11-13T07-29-29`). Jangan menjalankan dua run SIT paralel.

### GF-COMMON-BUKA-BUCKET
- **Status:** LOLOS
- **Prasyarat:** GF-COMMON-LOGIN
- **Langkah:** `page.goto(<BASE>/lamos/credit-application/<APP_ID>/create?bucket=<bucketId>&debtorType=individual|business)` atau `new CreditApplicationForm(page).goto(appId, bucketId)` | `pages/components/BucketSection.ts:35`. Pindah tab dalam halaman: `[role=tab][id=<bucket>]` + `waitForURL(/bucket=/)` (`s2cml-6020.spec.ts:41-48`).
- **Bucket id:** lihat `PROJECT_HISTORY.md` 2.1. Alias `collateral` → `agunan` (`BucketSection.ts:18-19`).
- **Catatan:** selalu cek `page.url()` sebelum menyimpulkan data SIT kosong (Gotcha 14).

---

## IDENTITAS (prasyarat Agunan + flow perorangan terbukti)

### GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH
- **Status:** LOLOS (2026-11-23, 2 run passed)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET (`identitas_pengecekan`, `debtorType=individual`)
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`. 2 penjamin perorangan dari `automation_config.*.xlsx` sheet Leads: TEGAR JATI WICAKSONO (L) + pasangan NENDEN NUGRAHA; ERIN (P) + pasangan RENALDY KUSUMA.
- **Langkah:** spec `tests/bucketIdentitas/penjamin-menikah-lp-01M83.spec.ts`. Env: `PENJAMIN_COMMIT=1` (tulis ke SIT), `PENJAMIN_ONLY_SPOUSE=<index>` (isi ulang pasangan kartu tertentu), `PENJAMIN_FILE` (file upload). Helper: `pages/bucketIdentitas/PenjaminForms.ts`, `pages/components/FormControls.ts`.
- **Bukti:** run 29,6 dtk passed (2 penjamin + pasangan); run 33,5 dtk passed (isi ulang pasangan kartu 2 + verifikasi muat ulang, sidebar "Data penjamin | Lengkap"). Sumber: log run sesi 2026-11-23. Screenshot `penjamin-1.png`, `penjamin-2.png`, `penjamin-akhir.png` di `test-results/bucketIdentitas-penjamin-m-5a9ab-L-NENDEN-dan-ERIN-P-RENALDY-chromium/` (folder tidak ditemukan saat pencatatan; test-results bisa tertimpa).
- **Gotcha:** autosave section Data Penjamin baru terkirim saat MENINGGALKAN section atau menambah kartu, bukan saat mengetik; verifikasi selalu lewat muat ulang. Data dimuat async (awal: radio kosong, 0 kartu, sidebar sementara "Belum Lengkap"): tunggu data sebelum menghitung kartu.
- **Konflik:** kartu kosong "Penjamin 4" sempat terlihat di satu sesi, hilang pada muat segar; asal tidak diketahui. Flow lama `GF-IDENTITAS-PENJAMIN-PERORANGAN` (App ID `01M483P7DDHBV41Z5QPV0FM8Q9`, `penjamin-perorangan-menikah.spec.ts`, dry run) tetap tercatat di bagian DITUNDA.

### GF-IDENTITAS-PENJAMIN-BADAN-USAHA
- **Status:** LOLOS (2026-11-23, run passed 1,3 menit)
- **Prasyarat:** GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH (2 kartu perorangan dulu)
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`. Kartu ke-3 Corporate Guarantee PT Bintang Sejahtera (`fixtures/entities/penjamin-badan-usaha.json`) + pengurus/pemegang saham PIPIT NILA WARDANI (perorangan WNI) dan CV Makmur Abadi (badan usaha).
- **Langkah:** spec `tests/bucketIdentitas/penjamin-badan-usaha-lp-01M83.spec.ts`; modal "Tambah pengurus/pemegang saham" via `PengurusModal` (`PenjaminForms.ts`).
- **Bukti:** jaringan dua `POST .../data_penjamin/<id>/shareholders` = 201; verifikasi setelah muat ulang; sidebar Data penjamin Lengkap. Screenshot `penjamin-3-akhir.png` di `test-results/bucketIdentitas-penjamin-b-94f7e--Guarantee-3-pemegang-saham-chromium/` (folder tidak ditemukan saat pencatatan).
- **Gotcha:** viewport 1280x1800 (720 terlalu pendek; popup dropdown modal terbuka ke atas dan ditutup scroll otomatis Playwright). Klik di luar form saat menutup datepicker menutup modal: pakai Tab. Tombol dialog/modal tanpa accessible name: pakai CSS + teks, bukan `getByRole`. `Locator.isVisible({timeout})` mengabaikan timeout: pakai `waitFor`. Backend SIT intermiten 500 pada `GET /lossvc/v1/config/dropdowns?type=GUARANTOR_TYPE` dan `type=provinces_lamos` (opsi dropdown kosong).
- **Konflik:** daftar pengurus/pemegang saham di Pengecekan DHN DHIB memuat HANDHIANTO SURYO KENTJONO (perorangan, Pemegang Saham) yang TIDAK ditambahkan spec; kemungkinan ditambah manual (tidak terbukti).

### GF-IDENTITAS-LENGKAP
- **Status:** LOLOS untuk bagian 1 Identitas (2026-11-23). Bagian Pengecekan lihat GF-IDENTITAS-PENGECEKAN (sebagian).
- **Dipakai oleh:** Agunan (GF-AGUNAN-STEP3-AUTOFILL-001, S2CML-4948)
- **Prasyarat:** GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH, GF-IDENTITAS-PENJAMIN-BADAN-USAHA
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z` (perorangan).
- **Langkah:** spec `tests/bucketIdentitas/identitas-lengkap-01M83.spec.ts` (env `IDENTITAS_SUBMIT=1`; `IDENTITAS_CONFIRM=1` hanya untuk konfirmasi dialog).
- **Hasil:** sidebar 8 section Lengkap: Data pribadi, Data pribadi tambahan, Lokasi & kondisi, Data pekerjaan & keuangan, Data kontak darurat, Data penjamin, Referensi (opsional), LBU.
- **Data dummy (disetujui user):** status tempat tinggal Milik Sendiri; Pengalaman industri 12; telp perusahaan 0211234567; kode pos 10140; kontak darurat BUDI SANTOSO (Saudara Kandung), alamat Gambir/Duri Pulo; LBU = opsi pertama tiap dropdown (1 - Kredit...Direstrukturisasi, S131101L, 01 BUMDes, UM, 10, 3211 Aceh Tamiang). Tanggal lahir debitur 20 Nov 2026 adalah autofill leads (terkunci, JANGAN diubah, arahan user).
- **Bukti:** sidebar semua Lengkap pada run terakhir sesi; `explore-output/identitas/probe-pengecekan-01M83.json` (snapshot sidebar).
- **Gotcha:** "Pengalaman di industri terkait" menghapus nilainya ~1,5 dtk setelah diketik bila diisi segera setelah section dibuka; tunggu +-3 dtk lalu ketik dan pastikan bertahan.
- **Konflik/celah:** belum diuji apakah Step 3 Agunan / auto-fill 001 di App ID ini berubah setelah Lengkap (tidak terbukti). Jalan pintas lama `01M22NAB4RXT92Y56AJ5VBQT75` (completed, 0 agunan) tetap ada.
- **Perubahan helper bersama (belum di-commit):** `pages/components/FormControls.ts` (Dropdown.select tahan search tak bisa diisi + fallback listbox terbuka), `pages/bucketIdentitas/PenjaminForms.ts` (`fillDate` tutup kalender dengan Tab; `PengurusModal.base` pilih organ langsung dari listbox). Spec lain yang memakai helper ini belum dijalankan ulang: regresi tidak terbukti.

### GF-IDENTITAS-PENGECEKAN
- **Status:** SEBAGIAN / BELUM LENGKAP (2026-11-23). Bukan LOLOS penuh.
- **Prasyarat:** GF-IDENTITAS-LENGKAP
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`.
- **Hasil:** pengecekan terproses 23 Nov 2026 15:14:08 WIB. Dukcapil Lengkap (lolos). DHN DHIB Lengkap (debitur, 3 penjamin, pasangan penjamin, pengurus/pemegang saham semua Lolos). SLIK Belum Lengkap: butuh upload file SLIK `.txt` dan `.pdf` untuk seluruh entitas; file belum tersedia. Tombol "Kirim" ada, TIDAK ditekan.
- **Bukti:** `explore-output/identitas/probe-pengecekan-01M83.json`, `probe-pengecekan-1.png`, `-2.png`, `-3.png`.
- **Konflik/tidak terbukti:** siapa/apa yang mengonfirmasi dialog "Lanjutkan ke pengecekan?" tidak terbukti. Klik otomatis dari spec tidak pernah berhasil di sesi ini; dugaan user mengklik manual di jendela browser.
- **Gotcha:** login SSO kadang gagal (form login/redirect >60 dtk): ulangi.
- **Pembaruan 2026-11-24:** bagian SLIK dikerjakan lewat GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD; status bucket "Pengecekan SLIK" tetap Belum Lengkap saat terakhir dibaca.

### GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD
- **Status:** SEBAGIAN / BELUM DICOBA penuh (2026-11-24). Bukan LOLOS: status bucket SLIK masih Belum Lengkap; run passed hanya membuktikan alur modal berjalan, bukan impor selesai untuk semua baris. Cek ulang 2026-11-24: perbaikan baris 7 tidak persisten, baris 4 belum berstatus impor.
- **Prasyarat:** GF-IDENTITAS-PENGECEKAN (halaman bucket `identitas_pengecekan`), GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH + GF-IDENTITAS-PENJAMIN-BADAN-USAHA (entitas yang tampil di modal berasal dari data penjamin/pengurus), GF-IDENTITAS-DATA-BACA-SAJA (nomor identitas per entitas).
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`. File SLIK mock (format IDEB/SLIK JSON dari template `exports/slik/NIK_3276020602850001.txt`, Windows-1252; NPWP template UTF-8), dibuat manual user: `exports/slik/slik-debitur/NIK_3200000000000006.txt` (Agus); `exports/slik/slik-penjamin/`: NIK_3373041608960002 (TEGAR), NIK_3211146311760006 (NENDEN), NIK_3205335802980003 (ERIN), NIK_3277010909850013 (RENALDY), NIK_3302265910820003 (PIPIT), NIK_3171030309630002 (HANDHIANTO), NPWP_3578241603710991 (PT Bintang Sejahtera, berisi 3 pengurus/pemilik), NPWP_3578241603710992 (CV Makmur Abadi). Nama file wajib `NIK_<nik>.txt` / `NPWP_<npwp>.txt`, tidak boleh diubah (catatan di modal). File .pdf di modal: `document-10mb.pdf` (10.485.760 byte; sumber lokal user: `C:\Users\V50324\Downloads\document-10mb.pdf`, di luar repo).
- **Langkah (terbukti):**
  1. Buka `.../credit-application/<APP_ID>/create?bucket=identitas_pengecekan&debtorType=individual`.
  2. Klik teks "Pengecekan SLIK" (exact, `.last()`, force) di sidebar: halaman menggulung ke bagian SLIK.
  3. `scrollIntoView` + klik teks "Klik untuk melengkapi file SLIK (.txt dan .pdf)": modal "Lengkapi file SLIK", tabel No | Entitas | File .txt | File .pdf | Kelola file.
  4. Klik teks "Kelola file" ke-N (`nth(N-1)`): dialog "Kelola file SLIK" (radio "Ada riwayat SLIK" Ya, "File .txt*" + "Klik untuk pilih file", "File .pdf*", tombol Tutup / Simpan).
  5. Pilih file, lalu klik teks "Simpan" (exact, `.last()`).
- **Isi modal (9 baris):** 1 Debitur Agus; 2 Penjamin 1 ERIN; 3 Pasangan RENALDY KUSUMA; 4 Penjamin 2 TEGAR JATI WICAKSONO; 5 Pasangan NENDEN NUGRAHA; 6 Penjamin 3 PT Bintang Sejahtera; 7 Pengurus PIPIT NILA WARDANI; 8 Pengurus HANDHIANTO SURYO KENTJONO; 9 Pengurus CV Makmur Abadi.
- **Perilaku:** memilih file baru MENAMBAH kartu file di samping yang lama (tidak mengganti); hapus file lama lewat ikon X (button tanpa atribut `title` pada kartu). SIT (ABIDSU) mencocokkan nomor identitas DI DALAM file .txt dengan entitas baris: baris 7 diunggah file ERIN memunculkan error "No ID Entitas 3302265910820003 tidak sesuai dengan ID pada file SLIK Debitur yang diunggah" (screenshot dari user, tidak tersimpan di repo); setelah diganti `NIK_3302265910820003.txt` error hilang.
- **Hasil terakhir (cek ulang read-only 2026-11-24, `tests/bucketIdentitas/read-slik-status.spec.ts` passed 31 dtk, bukti `explore-output/identitas/slik-status-check.txt`, `test-results/slik-status-check.png`):** baris 1, 2, 3, 5, 6, 8, 9 "Berhasil diimpor". Baris 4 (TEGAR) tetap hanya menampilkan "145.28 KB" tanpa label "Berhasil diimpor" (impor tidak selesai/tidak terbukti). Baris 7 (PIPIT) kembali menampilkan `NIK_3205335802980003.txt` (file ERIN) dengan error "No ID Entitas 3302265910820003 tidak sesuai...": penggantian file lewat fix-slik-pengurus TIDAK tersimpan (atau tertimpa) setelah modal dibuka ulang. Status bucket "Pengecekan SLIK" = Belum Lengkap. Tombol "Kirim" tidak ditekan.
- **Percobaan hapus-semua-lalu-upload-ulang baris 4 (2026-11-24, `tests/bucketIdentitas/reupload-slik-row.spec.ts` passed 1,1 mnt, bukti `test-results/reupload-1..4-*.png`, `explore-output/identitas/reupload-verifikasi.txt`):** hapus .txt + .pdf, upload `NIK_3373041608960002.txt` + `dummy-identitas.pdf` (199 B), Simpan: kartu langsung menampilkan file baru tetapi tanpa label "Berhasil diimpor"; setelah reload halaman + buka ulang modal, baris 4 kembali ke `document-10mb.pdf` dan .txt tetap tanpa label impor. Kesimpulan (dugaan, belum terbukti): "Simpan" di modal hanya mengubah state sisi klien; perubahan tidak tersimpan ke server sampai ada aksi lain (mis. "Kirim"/simpan bucket) yang belum dicoba. Ini juga menjelaskan baris 7 yang kembali ke file ERIN. PENJELASAN USER (2026-11-24): tombol "Proses file .txt" nonaktif (`disabled:true`, dicek sebelum dan sesudah klik) karena App ID `01M83AP5FKPHB1D3E2QS8P015Z` sudah pernah diproses; pada kasus ini impor tidak bisa diulang, dan perubahan file di modal tidak diproses ke server (itu sebabnya baris 4/7 kembali setelah reload). Untuk menguji impor penuh (tombol biru) perlu App ID baru yang belum pernah diproses. Diulang dengan PDF asli 10 MB (bukan dummy): hasil sama (.txt tanpa label impor; setelah reload tampil `document-10mb.pdf`), jadi ukuran PDF bukan penyebab.
- **Varian App ID sudah pernah diproses (tombol "Proses file .txt" nonaktif):** dipindah ke flow **GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD** (di bawah), termasuk alur penuh "Hapus semua file" + upload ulang + Proses. Percobaan ganti per baris di atas terbukti TIDAK cukup untuk kondisi itu.
- **Helper/spec:** `tests/bucketIdentitas/fix-slik-pengurus.spec.ts` (run passed 1,1 mnt, 2026-11-24); `upload-semua-slik.spec.ts` (alur penuh, env PROSES=1); `reupload-slik-row.spec.ts`; `read-slik-status.spec.ts` (read-only).
- **Bukti:** `test-results/slik-kelola.png`, `slik-fix-dialog.png`, `slik-fix-after.png` (test-results bisa tertimpa); `explore-output/identitas/slik-modal.json`.
- **Gotcha:** `getByRole` tidak menemukan tombol di modal (overlay `aria-hidden`): pakai `getByText` exact. Nama entitas juga muncul di halaman di belakang modal: pakai indeks baris / `.last()`.
- **Konflik:** (1) modal melabeli ERIN "Penjamin 1" dan TEGAR "Penjamin 2", sedangkan halaman Data penjamin / flow GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH mengurutkan TEGAR dulu lalu ERIN (urutan modal dan halaman berbeda; penyebab tidak terbukti). Pakai nama entitas, bukan nomor "Penjamin N", untuk memilih baris. (2) Nama file di exports ("NIK_...") vs entri halaman baris: validasi hanya berdasarkan isi file, bukan nama file (nama file saja tidak cukup terbukti).

### GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD
- **Status:** SEBAGIAN (2026-11-24). Bukan LOLOS: belum terbukti 9 dari 9 baris "Berhasil diimpor" + bucket Lengkap final. Tombol "Kirim" tidak pernah ditekan.
- **Kondisi khusus:** App ID sudah pernah diproses; tombol "Proses file .txt" di bawah modal "Lengkapi file SLIK" abu-abu/nonaktif (`disabled:true`, class `disabled:bg-neutral-300`); biru = aktif. Penyebab "nonaktif karena sudah diproses" = keterangan user, tidak diuji mandiri. Dalam kondisi ini "Simpan" di dialog "Kelola file SLIK" hanya mengubah state klien dan kembali ke file lama setelah reload; ganti per baris lewat ikon X TIDAK cukup.
- **Prasyarat:** GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD (modal, file mock, pemetaan entitas), GF-IDENTITAS-PENGECEKAN.
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`. PDF `C:/Users/V50324/Downloads/document-10mb.pdf` (10.485.760 byte, di luar repo; pakai garis miring biasa, backslash rusak di heredoc). Pemetaan baris -> .txt: 1 Agus `exports/slik/slik-debitur/NIK_3200000000000006.txt`; sisanya di `exports/slik/slik-penjamin/`: 2 ERIN NIK_3205335802980003; 3 RENALDY NIK_3277010909850013; 4 TEGAR NIK_3373041608960002; 5 NENDEN NIK_3211146311760006; 6 PT Bintang NPWP_3578241603710991; 7 PIPIT NIK_3302265910820003; 8 HANDHIANTO NIK_3171030309630002; 9 CV Makmur Abadi NPWP_3578241603710992.
- **PERINGATAN destruktif:** "Hapus semua file" menghapus semua file SLIK yang sudah diupload, termasuk yang sedang/sudah diproses (data impor lama hilang). Jalankan hanya dengan izin user.
- **Langkah (terbukti, `tests/bucketIdentitas/upload-semua-slik.spec.ts` passed 3,1 mnt, env PROSES=1):**
  1. Buka modal "Lengkapi file SLIK" (sidebar "Pengecekan SLIK" lalu klik "Klik untuk melengkapi file SLIK").
  2. Klik "Hapus semua file" (exact, `.last()`): konfirmasi "Hapus semua file? Tindakan ini akan menghapus semua file yang sudah diupload, termasuk yang sedang dan sudah selesai diproses." (Batalkan / Hapus File) -> "Hapus File": 9 baris "Belum ada file".
  3. Per baris 1..9: "Kelola file" ke-N; pilih .txt (`Klik untuk pilih file` indeks n-2) dan .pdf (n-1); "Simpan".
  4. Cek "Proses file .txt" aktif (log `PROSES disabled: false`); klik -> modal "Memproses", tombol "Batalkan proses", kartu "Sedang mengimpor..." lalu "Berhasil diimpor" per baris; tunggu menit.
  5. Verifikasi read-only: `tests/bucketIdentitas/read-slik-status.spec.ts` (output `explore-output/identitas/slik-status-check.txt`).
- **Hasil (baca ulang ~3 mnt setelah Proses):** 8 dari 9 baris "Berhasil diimpor" (baris 4 TEGAR dan 7 PIPIT tanpa error); baris 3 RENALDY masih "Sedang mengimpor...", modal masih "Memproses"; indikator bucket "Lengkap" tanpa "Belum Lengkap". Belum final. Sebelum varian ini: log `PROSES sebelum klik: disabled:true` (run `reupload-slik-row.spec.ts`).
- **Helper/spec:** `upload-semua-slik.spec.ts` (alur penuh), `reupload-slik-row.spec.ts` (env ROWS, PROSES, PDF; ganti per baris, terbukti tidak cukup saat tombol nonaktif), `read-slik-status.spec.ts`.
- **Bukti:** `test-results/upload-semua-1..3-*.png`, `upload-semua-2-sebelum-proses.png` (tombol), `explore-output/identitas/upload-semua-verifikasi.txt`, `slik-status-check.txt`, `reupload-verifikasi.txt` (test-results bisa tertimpa).
- **Konflik/gotcha:** (a) baris 7 menampilkan dua kartu (`NIK_3205335802980003.txt` dan `NIK_3302265910820003.txt`), keduanya "Berhasil diimpor"; asal kartu ERIN tidak terjelaskan. (b) teks halaman menampilkan nama file ganda per baris (kemungkinan elemen duplikat di DOM, tidak diselidiki). (c) run `reupload-slik-row.spec.ts` dengan PDF 10 MB pernah 11,2 mnt, penyebab tidak diketahui. (d) "Kirim" tidak ditekan.
- **Naik ke LOLOS bila:** 9 baris "Berhasil diimpor" dan bucket Lengkap terbaca ulang.

### GF-IDENTITAS-DATA-BACA-SAJA
- **Status:** LOLOS (2026-11-24, spec read-only, output JSON tersimpan)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET (`identitas_pengecekan`, `debtorType=individual`), data dari GF-IDENTITAS-PENJAMIN-BADAN-USAHA
- **Data uji:** App ID `01M83AP5FKPHB1D3E2QS8P015Z`. Dipakai oleh: GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD.
- **Langkah:** spec `tests/bucketIdentitas/read-data-penjamin.spec.ts`, `read-pengurus-penjamin.spec.ts`, `read-data-debitur.spec.ts`; output `explore-output/identitas/*.json`. Di kolom Tindakan daftar pengurus: ikon pertama = Edit (memunculkan konfirmasi "Edit data ini?"), ikon mata = Detail; mode baca-saja wajib pakai ikon mata.
- **Isi:** debitur Agus NIK 3200000000000006 (tanggal lahir SIT 20 Nov 2026, laki-laki); penjamin TEGAR 3373041608960002 + pasangan NENDEN 3211146311760006; penjamin ERIN 3205335802980003 + pasangan RENALDY 3277010909850013; penjamin Corporate PT Bintang Sejahtera NPWP 3578241603710991; pengurus/pemegang saham: PIPIT NILA WARDANI (perorangan, 3302265910820003, komisaris 40%), CV Makmur Abadi (badan usaha, NPWP 3578241603710992, 30%), HANDHIANTO SURYO KENTJONO (perorangan, 3171030309630002, CTO 4%).
- **Konflik:** paginasi daftar pengurus menampilkan halaman 1/2/3 tetapi hanya 3 baris di halaman 1 (halaman 2 dan 3 kosong; kemungkinan bug UI SIT, belum diselidiki). HANDHIANTO ada di SIT tetapi tidak ditambahkan spec `penjamin-badan-usaha-lp-01M83.spec.ts`; asal tetap tidak terbukti (sudah dicatat di GF-IDENTITAS-PENJAMIN-BADAN-USAHA).

---

## AGUNAN

### GF-AGUNAN-TAMBAH-SEARCH
- **Status:** LOLOS (2026-10-28 Modul 1 5/5; terbaru 2026-11-18 lewat `openStep3Kepemilikan` di 11 test, `run-history/2026-11-18T01-45-56-960Z.json`; modul7 TC-4889-49..53 `2026-11-18T08-25-41-763Z.json`)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET (`agunan`)
- **Data uji:** Perseorangan `01M4F7TNSCSHEDB5G3WTSP7HDY`, Badan Usaha `01M482PRSVH5ZMTVZX5QH0VDNZ`
- **Langkah:**
  1. Klik `+ Agunan`: `getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ })`
  2. Buka dropdown "Pilih jenis agunan" → pilih opsi (mis. `Tanah`)
  3. Isi `input[placeholder*="nomor" i]` dengan nomor dummy unik
  4. Klik `Cari` (aktif hanya bila jenis + nomor terisi)
- **Helper:** `tests/bucketAgunan/helpers/agunanModal.ts:25-39`
- **Hasil:** nomor fiktif → "Data tidak ditemukan" + tombol `+ Agunan Baru`.
- **Konflik:** tombol Cari pernah tetap disabled di `agunanModal.ts:38` (TC-4948-08, 2026-11-17). `s2cml-4889.spec.ts:16` varian BU memakai `DEBITUR_TARGET||01M482…`; bila env diisi, varian BU membuka App ID perorangan.

### GF-AGUNAN-AGUNAN-BARU
- **Status:** LOLOS (2026-10-28 TC-04-06, `PROJECT_HISTORY.md` ~1053; 2026-11-18 run 4949)
- **Prasyarat:** GF-AGUNAN-TAMBAH-SEARCH (nomor fiktif)
- **Langkah:** klik `button, [role="button"]` berteks `Agunan Baru` → form 3-step terbuka di Step 1 | `agunanModal.ts:41-44`
- **Tutup aman:** Escape lalu `button.mantine-Modal-close` / `Close` / `Kembali` | `agunanModal.ts:51-58`

### GF-AGUNAN-STEP1-INFORMASI-UMUM
- **Status:** LOLOS (2026-10-30, TC-4890-01/02/03/11, path lama `tests/bucketAgunan/s2cml-4890.spec.ts`; App ID run itu tidak terbukti)
- **Prasyarat:** GF-AGUNAN-AGUNAN-BARU
- **Isi:** default step, status `Belum Lengkap`; Simpan disabled & Simpan draft aktif saat belum lengkap. Field per modul: `modul2-informasi-umum`, `modul3-pengikatan`, `modul4-alamat` (`tests/bucketAgunan/perseorangan/`).
- **Helper:** `navigateToFormAgunanBaru` di `tests/bucketAgunan/perseorangan/s2cml-4890.spec.ts:43`

### GF-AGUNAN-STEP1-DATA-PEMBANDING
- **Status:** LOLOS (2026-10-30 `modul5-data-pembanding.spec.ts` 4 passed, `PROJECT_HISTORY.md` ~958; 2026-10-31 TC-04-43 1 passed)
- **Prasyarat:** GF-AGUNAN-STEP1-INFORMASI-UMUM (jenis Tanah)
- **Data uji:** `DEBITUR_TARGET||01M4F7…` (modul5:12); App ID run 10-30 tidak terbukti.
- **Langkah:** `navigateToFormAgunanBaru` modul5:42 → `openTambahDataPembanding` :85-99 → `fillDataPembanding` :101. Alternatif: `addPembanding` `s2cml-5419.spec.ts:112`.
- **Konflik:** suite 5419 **tidak terbukti** jalan: riwayat 2026-11-17 mencatat "18 lulus, 2 gagal" sekaligus "tidak dijalankan di SIT", dan semua `run-history` 5419 hanya `--list`. Defect hapus pembanding tanpa konfirmasi: `docs/LAPORAN_DEFECT_Hapus_Data_Pembanding.md`.

### GF-AGUNAN-STEP1-PENILAIAN-LPA
- **Status:** LOLOS (2026-10-31 `modul6-penilaian-agunan.spec.ts` 6 passed, `PROJECT_HISTORY.md` ~647)
- **Prasyarat:** GF-AGUNAN-AGUNAN-BARU
- **Data uji:** `DEBITUR_TARGET||01M4F7…` (modul6-penilaian-agunan.spec.ts:26)
- **Langkah:** `navigateToPenilaianSection` modul6-penilaian-agunan.spec.ts:39 (Tanah → Cari fiktif → Agunan Baru → seksi Penilaian). Radio LPA Ya/Tidak (Gotcha 13), Tipe penilaian Internal/KJPP.
- **Konflik:** duplikat `modul6-penilaian-lpa.spec.ts` tanpa bukti run → BELUM DICOBA.

### GF-AGUNAN-STEP2-DATA-TAMBAHAN
- **Status:** LOLOS (5420: `run-history/2026-11-16T14-06-25-410Z.json` TC-5420-01 passed; 5445 2026-11-22: hanya riwayat + eviden, tanpa JSON run)
- **Prasyarat:** GF-AGUNAN-AGUNAN-BARU (pilih jenis sesuai skenario)
- **Data uji:** 5420 `APP_ID_5420||01M5TYDZSJFK7J66ZDK2YHRCZ9` (juga pernah `01M79GW1XYEQAK97TM803HFY8F`); 5445 `01M4F7…` (banner URL di `explore-output/stories/s2cml-5445/eviden/`).
- **Langkah:** klik tab `button, [role="tab"]` berteks `Data tambahan agunan` | `navigateToStep2` `modul7-data-tambahan.spec.ts:39-69`; `openStep2` `s2cml-5420.spec.ts:115`.
- **Cabang Cash Collateral (CIF):** jenis F15 → radio `input[name="isCollateralStoredAtBsim"][value="true|false"]` + `check({ force: true })` → `GET /lossvc/v1/cif?number=<CIF>&jenisAgunanCode=…`. CIF uji di `.env` (`CIF_VALID_1`, `CIF_VALID_2`); rekening ada di F09/F15, kosong di F10/F11.
- **BLOCKED:** deposito F11 (TC-5445-13/14) butuh CIF dengan rekening deposito; agunan CLS (TC-5420-06) → lihat GF-AGUNAN-EXISTING-CLS.

### GF-AGUNAN-STEP3-KEPEMILIKAN
- **Status:** LOLOS untuk navigasi + dropdown kategori (2026-11-18 TC-4949-01..04, `run-history/2026-11-18T01-45-56-960Z.json`; 2026-11-17 TC-4948-01/eks05/eks07/eks17/eks18, `run-history/2026-11-17T02-13-35-008Z.json`)
- **Prasyarat:** GF-AGUNAN-AGUNAN-BARU. **GF-IDENTITAS-LENGKAP tidak terbukti diperlukan** untuk membuka Step 3: run 2026-11-17 di `01M4F7` (Identitas belum lengkap) membuka Step 3 tanpa dialog gating.
- **Data uji:** `APP_ID_PERORANGAN = DEBITUR_TARGET || 01M4F7TNSCSHEDB5G3WTSP7HDY` (`agunanModal.ts:4`). Viewport 1280x1000.
- **Langkah:** `loginAndOpen` `agunanModal.ts:13-19` → `openStep3Kepemilikan` :25-49 (selalu jenis Tanah) → `bacaOpsiKategori` :104-110 / `pilihKategori` :113-130.
- **Isi:** opsi perorangan 001, 002, 005 "Pemilik Anggunan" (typo SIT), 008, 009, 010 (`tc-4948-18-options.png`). Bukti kepemilikan disabled "Otomatis terisi dari data tambahan agunan" (`tc-4948-17-after.png`).
- **Konflik:**
  - TC-4890-06 "gating Identitas memblokir Step 3" (2026-10-30): App ID run tidak bisa dipastikan (tanpa eviden tersimpan) dan locator `div, [role=dialog]` + `hasText /identitas.*lengkap/` + `.first()` (`s2cml-4890.spec.ts:202-204`) bisa cocok dengan teks tab/stepper → **dugaan PASS palsu**.
  - Bukti "Modul 8 4/4" merujuk file yang sudah dihapus; `modul8-kepemilikan-agunan.spec.ts` sekarang tanpa bukti run. Klaim "28/28" usang: 4948 = 11 passed / 4 failed (2026-11-17), 4949 = 11 passed / 9 failed-timeout (2026-11-18).
  - TC-4948-10 [eks 15]: keterangan "Pasangan dari …" tidak tampil (2026-11-17).

### GF-AGUNAN-STEP3-AUTOFILL-001
- **Status:** STALE. Lolos 2026-11-01 (`explore-output/logs/run-all3.log:104,180,184`: nama + NIK terisi); gagal 2026-11-17 (TC-4948-08 [eks 19], TC-4948-12 [eks 20], auto-fill `[]`).
- **Prasyarat:** GF-AGUNAN-STEP3-KEPEMILIKAN + GF-IDENTITAS-LENGKAP
- **Data uji:** run lolos kemungkinan di `01M22NAB4RXT92Y56AJ5VBQT75` (Identitas completed; inferensi visual, bukan URL). Run gagal di `01M4F7`.
- **Langkah:** `pilihKategori(page,'001')` → `snapshotInputs` `agunanModal.ts:88-95`.
- **Konflik:** tidak ada env khusus; `DEBITUR_IDENTITAS_LENGKAP` (`s2cml-4890-batch2.spec.ts:280`) tidak ada di `.env`. `01M22NAB` punya 0 agunan, jadi tidak bisa dipakai untuk flow yang butuh agunan tersimpan.

### GF-AGUNAN-STEP3-SLIK-005-008
- **Status:** LOLOS sebagian (2026-11-18, `s2cml-4949-slik-new-identity.spec.ts` + `s2cml-4949-slik-remaining.spec.ts`). Passed: 01–06, 09–11, 16, 18; TC-07 passed setelah fix (`explore-output/logs/run-4949-07.log`). Gagal/timeout: 12, 13, 14 (opsi Penjamin tidak ada), 15 (`Jual/Beli`), 17, 19 (buffer >50MB), 20 (input tidak `multiple`); TC-08 gagal login. Belum ada satu run utuh 20 hijau.
- **Prasyarat:** GF-AGUNAN-STEP3-KEPEMILIKAN
- **Data uji:** `APP_ID_PERORANGAN` (`01M4F7`)
- **Langkah:** `pilihKategori('005'|'008')` → `pilihTipeKepemilikan('Individu'|'Non Individu')` `agunanModal.ts:158-173` | `bukaForm` `s2cml-4949-slik-remaining.spec.ts:33-38`. Eviden: `slik-005-individu.png`, `slik-005-non-individu.png`, `slik-008-*.png`.
- **Konflik:** label SIT `Individu`/`Non Individu` vs matriks `Perorangan`/`Badan Usaha` (MISMATCH-03). Placeholder PIC terduplikasi (kandidat bug).

### GF-AGUNAN-BU-STEPPER
- **Status:** LOLOS (2026-11-01 `tests/bucketAgunan/badanUsaha/s2cml-4890.spec.ts` 2 passed, `explore-output/logs/run-bu-stepper.log`)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET (`agunan`, `debtorType=business`)
- **Data uji:** `01M482PRSVH5ZMTVZX5QH0VDNZ` di-hardcode (`badanUsaha/s2cml-4890.spec.ts:18`)
- **Langkah:** `navigateToFormAgunanBaru` `badanUsaha/s2cml-4890.spec.ts:47` → 3 step (TC-4890-02 :80), navigasi paralel (TC-4890-03 :106).

### GF-AGUNAN-BU-STEP3-KEPEMILIKAN
- **Status:** LOLOS (2026-11-17 TC-4948-04, [eks 08], [eks 09], [eks 13], [eks 16], `run-history/2026-11-17T02-13-35-008Z.json`)
- **Prasyarat:** GF-AGUNAN-BU-STEPPER (helper sama dengan GF-AGUNAN-STEP3-KEPEMILIKAN)
- **Data uji:** `APP_ID_BADAN_USAHA = DEBITUR_BU_TARGET || 01M482PRSVH5ZMTVZX5QH0VDNZ` (`agunanModal.ts:5`)
- **Langkah:** `loginAndOpen(page, APP_ID_BADAN_USAHA, 'business')` → `openStep3Kepemilikan` → `pilihKategori('006'|'007'|'001')`.
- **Isi:** 006/007 tampil; SIT menampilkan `001 - Calon Debitur`, bukan `003 - Debitur` (MISMATCH-01). Kategori 006 tidak merender "Hubungan dengan Debitur" (MISMATCH-02, `run-all3.log:124`).
- **BLOCKED:** skenario "badan usaha tanpa pengurus" (LEGACY-4890-BU-03 / TC-4948-05 [eks 08]); App ID punya 1 pengurus (`run-all3.log:25`).

### GF-AGUNAN-SIMPAN-DRAFT
- **Status tombol:** LOLOS (TC-4890-11 2026-10-30 `s2cml-4890.spec.ts:224`; BU TC-4890-11 `run-4890bu.log`; TC-4941-08 draft disabled pada FINAL 2026-11-12)
- **Status klik Simpan draft:** LOLOS (2026-11-24, TC-4890-09 & 10, `ALLOW_SIT_WRITE=1`, `s2cml-4890-batch2.spec.ts`; App `01M79GW1XYEQAK97TM803HFY8F`). Toast: "Pengajuan berhasil disimpan sebagai draf." (hilang < 1 dtk); `PUT /lossvc/v1/sme/loans/<id>/forms/collaterals` 200; modal tertutup sendiri. TC-4890-15 `test.fixme` (teks CSV "Draft Saved Successfully" tidak sama dengan SIT).
- **Prasyarat:** GF-AGUNAN-AGUNAN-BARU
- **Catatan:** klik draft **menulis data ke SIT**; hanya di App ID khusus uji dan atas izin user.

### GF-AGUNAN-EXISTING-CLS
- **Status:** BLOCKED (TC-5420-06 skip; TC-4889-09 `test.skip` `[GAP DATA CLS]` `s2cml-4889.spec.ts:272-273`; `POST /lossvc/v1/existing-collaterals` → `items: []`, `explore-output/stories/S2CML-5419/summary.txt`)
- **Prasyarat:** GF-AGUNAN-TAMBAH-SEARCH dengan nomor agunan CLS nyata
- **Data uji:** tidak ada; butuh nomor agunan CLS dari tim (COL-2026-501 tidak ditemukan).

### GF-AGUNAN-EDIT-EXISTING
- **Status:** LOLOS (2026-11-12, 11 passed / 1 skipped, 12 TC, `PROJECT_HISTORY.md` ~187)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET + agunan FINAL tersimpan
- **Data uji:** `TARGET_APP_ID_AGUNAN || 01M4F7TNSCSHEDB5G3WTSP7HDY`. Kartu di-hardcode `F041401 - Reksadana|F15 - Setoran Jaminan` (`s2cml-4941.spec.ts:92`).
- **Langkah:** tombol Titik 3 di-scope ke kartu (anchor badge `ID:`, Gotcha 15) → menu `Ubah` → modal "Ubah agunan" 3-step terisi | `bukaMenuTitik3` / `bukaModalUbah` `s2cml-4941.spec.ts:91-112`
- **Catatan:** `qa-anomaly-judge` mencatat TC-4941-06 sebagai PASS palsu.

### GF-AGUNAN-EDIT-DRAFT
- **Status:** BELUM DICOBA (TC-4941-07 `test.skip(true)` `s2cml-4941.spec.ts:270`)
- **Prasyarat:** GF-AGUNAN-EDIT-EXISTING + agunan berstatus Draft
- **Konflik:** komentar skip menyebut "seluruh agunan FINAL", padahal `01M4F7` tampak punya 1 draft (`explore-output/stories/s2cml-6018/TC-6018-04-step-1.png` "Draf agunan (1)"; `GET …/collaterals?status=DRAFT` → 1 HOUSING di `explore-output/stories/S2CML-5419/summary.txt`). Skip tidak pernah dicoba ulang.

### GF-AGUNAN-HAPUS
- **Status:** menu "Hapus agunan" terlihat → LOLOS (TC-4941-02 `s2cml-4941.spec.ts:164-168`, 2026-11-12); aksi hapus → BELUM DICOBA (tidak ada spec)
- **Prasyarat:** GF-AGUNAN-EDIT-EXISTING (menu Titik 3)

### GF-AGUNAN-LOAD-LATEST-DATA
- **Status:** LOLOS (2026-11-12 versi 8 TC: 7 passed + BU 1 passed, `PROJECT_HISTORY.md` ~143). Spec dirampingkan jadi 6 TC pada 2026-11-13 dan belum dijalankan ulang (`run-history` 2026-11-13 hanya `--list`).
- **Prasyarat:** GF-COMMON-BUKA-BUCKET + agunan tersimpan (Draft + Final)
- **Data uji:** `APP_ID_6020 || 01M6ZA0CWY9Q33Y031ZRGKFB4E` (`s2cml-6020.spec.ts:17`). ID kartu berformat `QA-xxxx` tanpa `ID:` → Gotcha 15 tidak berlaku.
- **Langkah:** `navigateBucket` `s2cml-6020.spec.ts:41-48` → `ensureDataAgunanOpen` :50-61.

### GF-AGUNAN-ICON-KARTU
- **Status:** LOLOS (2026-11-12 `validasi-icon-agunan.spec.ts` 4 passed; eviden `explore-output/stories/s2cml-6018/` dari `01M4F7`)
- **Prasyarat:** GF-COMMON-BUKA-BUCKET + kartu Reksadana dan Setoran Jaminan tersimpan
- **Data uji:** `DEBITUR_TARGET||01M4F7…` (`validasi-icon-agunan.spec.ts:21`). Harus `01M4F7`; `01M22NAB` punya 0 agunan.
- **Langkah:** `ensureDataAgunanOpen` `validasi-icon-agunan.spec.ts:52` → `img` `/assets/agunan-image/{housing,vehicle,document,cash}.svg` 48x48.

---

## Celah terbuka (untuk audit berikutnya)

1. Gating Step 3 karena Identitas belum Lengkap **tidak terbukti** di App ID mana pun; TC-4890-06 perlu diperketat dan dijalankan ulang dengan App ID yang jelas.
2. Status Identitas `01M4F7` hanya dari probe 2026-11-03.
3. Spec yang hanya punya bukti riwayat tanpa JSON run: 5419, `modul8-kepemilikan-agunan`, `modul6-penilaian-lpa`, `modul7-cash-collateral-cif`, `s2cml-4890-batch2`.

## DITUNDA (fase berikutnya)

- `GF-IDENTITAS-PENJAMIN-PERORANGAN` (untuk App ID `01M83` digantikan GF-IDENTITAS-PENJAMIN-PERORANGAN-MENIKAH): pernah lolos dry run (App ID `01M483P7DDHBV41Z5QPV0FM8Q9`, `tests/bucketIdentitas/penjamin-perorangan-menikah.spec.ts`, `PROJECT_HISTORY.md` ~baris 1220). Didaftarkan penuh saat fase Identitas.
- Bucket Dokumen: belum ada flow terverifikasi (spec lama baru lolos typecheck).
