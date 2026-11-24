# KARTU BUCKET — Identitas & Pengecekan (`identitas_pengecekan`)

> **Pemilik:** `qa-step-mapper` (boleh menulis `docs/buckets/*.md` dan `docs/GREEN_FLOWS.md`).
> **Pembaca:** semua agent QA. Baca kartu ini SEBELUM menulis/menjalankan test di bucket ini.
> Flow bertanda LOLOS/BLOCKED ada di `docs/GREEN_FLOWS.md` (bagian IDENTITAS). Kartu ini menyimpan **peta section, rule form, gate, dan perilaku**. Tiap klaim wajib bertanda bukti; tanpa bukti ditulis "tidak terbukti".

Terakhir diperbarui: **2026-11-24** (rule tombol Proses SLIK + varian reupload; dibuat dari bukti sesi 2026-11-23/24 + page object `pages/bucketIdentitas/`).

## 1. Identitas bucket

- Bucket id `identitas_pengecekan`, tab "Identitas dan Pengecekan". URL: `<BASE>/lamos/credit-application/<APP_ID>/create?bucket=identitas_pengecekan&debtorType=individual|business`.
- Folder page object: `pages/bucketIdentitas/` (section di-generate dari `explore-output/buckets/identitas_pengecekan.json`; `PenjaminForms.ts` manual).
- Varian: **perorangan** (`debtorType=individual`) terbukti; **badan usaha** (`business`) tidak terbukti di bucket ini (tidak ada flow Identitas BU).
- App ID uji aktif: `01M83AP5FKPHB1D3E2QS8P015Z` (perorangan, debitur Agus). Daftar App ID lain: `GREEN_FLOWS.md` "Fakta data uji".

## 2. Peta section (urutan sidebar) dan status Lengkap

Sidebar `aside button`; tiap item menampilkan status "Lengkap"/"Belum Lengkap". Section collapsible.

| # | Section | Kelas page object | Terbukti Lengkap |
|---|---|---|---|
| 1 | Data pribadi | `DataPribadiSection` | 2026-11-23 |
| 2 | Data pribadi tambahan | `DataPribadiTambahanSection` | 2026-11-23 |
| 3 | Lokasi & kondisi tempat tinggal | `LokasiKondisiTempatTinggalSection` | 2026-11-23 |
| 4 | Data pekerjaan & keuangan | `DataPekerjaanKeuanganSection` | 2026-11-23 |
| 5 | Data kontak darurat | `DataKontakDaruratSection` | 2026-11-23 |
| 6 | Data penjamin | `DataPenjaminSection` + `PenjaminForms.ts` | 2026-11-23 |
| 7 | Referensi (opsional) | `ReferensiSection` | 2026-11-23 |
| 8 | LBU | (tanpa page object; dummy via spec) | 2026-11-23 |
| – | Pengecekan Dukcapil / DHN DHIB / SLIK | (tanpa page object) | Dukcapil + DHN DHIB Lengkap; SLIK Belum Lengkap (2026-11-24) |

Bukti: `explore-output/identitas/probe-pengecekan-01M83.json`, `tests/bucketIdentitas/identitas-lengkap-01M83.spec.ts`.
Pengecekan Dukcapil/DHN DHIB/SLIK **tidak bisa diklik (disabled) sebelum 8 section Lengkap dan "Lanjutkan" dikonfirmasi** (probe pertama timeout pada item disabled; tidak terbukti ada pesan khusus).

## 3. Rule form per section

Legenda: `*` = wajib (label SIT), [tipe] dari page object. Hanya field yang tercatat di page object; rule validasi di luar ini "tidak terbukti".

### 3.1 Data pribadi
- **Autofill dari leads, terkunci (disabled):** Nomor KTP, Nama lengkap, Jenis kelamin, Tanggal lahir, serta Alamat tempat tinggal saat ini (alamat, RT/RW, provinsi, kota, kecamatan, kelurahan, kode pos). **Jangan diubah** (arahan user; tanggal lahir App ID `01M83` = 20 Nov 2026, apa adanya).
- **Diisi manual (wajib):** Tempat lahir, Status perkawinan (Menikah | Belum Menikah | Janda / Duda), Nama gadis ibu kandung, NPWP, Nomor HP, radio "Apakah debitur merupakan nasabah Bank Sinarmas", Alamat sesuai KTP (alamat, RT/RW, provinsi → kota → kecamatan → kelurahan, kode pos), Status tempat tinggal (Milik Sendiri | Milik Keluarga | Sewa).
- **Dropdown wilayah berantai:** provinsi → kota → kecamatan → kelurahan; opsi bergantung dropdown sebelumnya; search async; format nama master beda ("DKI Jakarta", "Jakarta Pusat, Wil. Kota") → tunggu hasil search stabil (`selectWilayah`, `PenjaminForms.ts`).
- **Upload wajib:** Foto KTP, Form Aplikasi Kredit (`.pdf,.jpg,.jpeg,.png`). File KTP ganda boleh ada; **jangan dihapus** (arahan user).
- Bukti: `DataPribadiSection.ts`, run `identitas-lengkap-01M83.spec.ts`.

### 3.2 Data pribadi tambahan
Wajib: Jumlah keluarga inti sesuai KK [text], Kasus pidana/penipuan [radio], Pendidikan terakhir [dropdown]. Opsional: Pisah harta [radio]. (`DataPribadiTambahanSection.ts`)

### 3.3 Lokasi & kondisi tempat tinggal
Wajib, semua dropdown: Lokasi tempat tinggal, Kondisi tempat tinggal, Kondisi lingkungan sekitar. (`LokasiKondisiTempatTinggalSection.ts`)

### 3.4 Data pekerjaan & keuangan
- Wajib: Pekerjaan [dropdown], Nama perusahaan/usaha, Bidang usaha [dropdown], Pengalaman di industri terkait (bulan), No. Telepon Perusahaan, Lama bekerja/usaha (bulan), Pendapatan (Rp), Jumlah pemasukan lainnya (Rp), Biaya hidup per bulan (Rp), radio "Memiliki pinjaman di Bank/Fintech/BPR/Multifinance?", radio "Memiliki tabungan di Bank/BPR?", Alamat perusahaan (alamat, RT/RW, wilayah berantai, kode pos).
- Opsional: Joint Income? [radio], Sumber pemasukan lainnya [dropdown], Nominal angsuran lainnya (Rp).
- **Perilaku:** "Pengalaman di industri terkait" mengosongkan nilai ±1,5 dtk setelah diketik segera setelah section dibuka → tunggu ±3 dtk, ketik, pastikan bertahan (Gotcha spec `identitas-lengkap-01M83`). Currency: `input[data-testid="currency-input"]`, prefix "Rp", format ribuan otomatis.
- Bukti: `DataPekerjaanKeuanganSection.ts`.

### 3.5 Data kontak darurat
Wajib: Nama lengkap, Hubungan keluarga [dropdown], Nomor HP, Alamat (alamat, RT/RW, wilayah berantai, kode pos). Opsional: No. Telepon Rumah. (`DataKontakDaruratSection.ts`)

### 3.6 Referensi (opsional)
Tipe Referensi [dropdown], Nomor Telpon Referensi, Notes referensi. Ditandai opsional di sidebar; apakah kosong tetap Lengkap tidak diuji terpisah (sidebar Lengkap pada run 2026-11-23). (`ReferensiSection.ts`)

### 3.7 LBU
Tanpa page object. Diisi dengan opsi pertama tiap dropdown dan sidebar menjadi Lengkap (kewajiban per field tidak dipisah, tidak terbukti). Detail field tidak terdokumentasi di repo selain `identitas-lengkap-01M83.spec.ts` (`fillEmptyDropdowns`).

### 3.8 Data penjamin
Radio "Debitur memiliki penjamin?*" (Ya/Tidak). Bila **Ya** → "List penjamin": kartu per penjamin dengan dropdown `typeGuarantee` = Personal Guarantee | Corporate Guarantee.
- **Tidak ada tombol Simpan.** Autosave baru terkirim saat **meninggalkan section** (pindah section) atau menambah kartu, bukan saat mengetik. Verifikasi selalu lewat muat ulang.
- **Data dimuat async:** awal radio kosong, 0 kartu, sidebar sementara "Belum Lengkap" → tunggu jumlah kartu stabil sebelum menghitung/menambah.
- **Personal Guarantee (WNI):** kewarganegaraan (radio), Nomor KTP, Nama, Jenis kelamin, Tempat lahir (opsional), Tanggal lahir (react-datepicker "DD MMM YYYY", tutup dengan Tab), Status perkawinan, Nama ibu kandung, NPWP, Nomor HP, Alamat KTP, Alamat domisili (checkbox "Sama dengan alamat sesuai KTP" atau isi sendiri), upload KTP.
- **Rule kondisional: status perkawinan = Menikah → muncul blok Data pasangan** (kewarganegaraan, KTP, nama, tempat/tanggal lahir, ibu kandung, NPWP, HP, domisili, upload KTP). Tanpa Menikah, blok pasangan tidak ada. Bukti: `fillSpouse` "hanya muncul bila status perkawinan = Menikah", run 2026-11-23.
- **Corporate Guarantee:** Nama perusahaan, NPWP, No/tanggal akta pendirian, No/tanggal akta perubahan, NIB, alamat, upload NPWP. Memunculkan tombol **"+ Pengurus/Pemegang Saham"** → modal.
- **Modal "Tambah pengurus/pemegang saham":** tanpa `role=dialog`; tombol dan radiogroup tanpa accessible name. Organ: Pemegang Saham | Pemegang Saham dari Pemegang Saham | Pengurus | Pengurus dari Pemegang Saham. Jenis pengurus: perorangan WNI (KTP, nama, gender, tgl lahir, ibu kandung, NPWP, jabatan, pangsa %, alamat, file), WNA (paspor + masa berlaku, KITAS opsional, …), badan usaha (NPWP, nama, jenis badan usaha, akta pendirian, "Ada akta perubahan terakhir?"). **Tombol Simpan modal disabled sampai form valid.** Simpan modal menulis ke server (`POST .../data_penjamin/<id>/shareholders` = 201).
- **Tidak terbukti:** batas jumlah penjamin, aturan jumlah/porsi pangsa total 100%, apakah WNA lolos Pengecekan.
- Bukti: `PenjaminForms.ts`, `penjamin-menikah-lp-01M83.spec.ts`, `penjamin-badan-usaha-lp-01M83.spec.ts`; flow `GF-IDENTITAS-PENJAMIN-*`.

## 4. Gate dan alur antar section/bucket

1. **Lanjutkan:** setelah 8 section Lengkap, tombol "Lanjutkan" tersedia → dialog "Lanjutkan ke pengecekan?" → konfirmasi → pengecekan terproses (App ID `01M83`: 2026-11-23 15:14:08 WIB). Tombol dialog tanpa accessible name: pakai CSS+teks.
2. **Pengecekan Dukcapil:** otomatis; Lengkap bila lolos. **DHN DHIB:** otomatis untuk debitur, penjamin, pasangan, pengurus/pemegang saham; Lengkap bila semua Lolos.
3. **Pengecekan SLIK:** manual; wajib unggah `.txt` + `.pdf` per entitas (modal "Lengkapi file SLIK", 9 baris untuk `01M83`). SIT mencocokkan nomor identitas DI DALAM file .txt dengan entitas baris. Detail: `GF-IDENTITAS-PENGECEKAN-SLIK-UPLOAD`.
   - **Tombol "Proses file .txt"** (bawah modal): biru = aktif, abu-abu = nonaktif (`disabled:true`, class `disabled:bg-neutral-300`). Bukti: log `PROSES sebelum klik: disabled:true` (reupload-slik-row.spec.ts), `PROSES disabled: false` (upload-semua-slik.spec.ts), screenshot `upload-semua-2-sebelum-proses.png`. Nonaktif bila App ID sudah pernah diproses (keterangan user, tidak diuji mandiri).
   - **App ID sudah diproses:** "Simpan" di dialog "Kelola file SLIK" hanya mengubah state klien; setelah reload kembali ke file lama (baris 4, 7; `slik-status-check.txt`, `reupload-verifikasi.txt`). Ganti per baris (ikon X) TIDAK cukup. Jalur terbukti: "Hapus semua file" (tautan merah di bawah tabel; konfirmasi "Hapus semua file? ... termasuk yang sedang dan sudah selesai diproses." Batalkan / Hapus File; DESTRUKTIF, hapus data impor lama) -> upload ulang 9 baris -> tombol Proses aktif -> modal "Memproses" (tombol "Batalkan proses", "Sedang mengimpor..." lalu "Berhasil diimpor"). Pembacaan ~3 mnt: 8/9 berhasil, baris 3 masih mengimpor, bucket "Lengkap"; belum final (SEBAGIAN). Detail: `GF-IDENTITAS-PENGECEKAN-SLIK-REUPLOAD`.
4. **Kirim:** muncul setelah pengecekan; **menulis final** → hanya atas izin eksplisit user. Belum pernah ditekan.
5. **Hubungan lintas bucket:** Identitas Lengkap = prasyarat auto-fill Step 3 Agunan (`GF-AGUNAN-STEP3-AUTOFILL-001`, S2CML-4948). **Gating Step 3 oleh Identitas tidak terbukti** (lihat kartu Agunan, celah #1).

## 5. Gotcha khusus bucket

Lihat juga `PROJECT_HISTORY.md` bagian 2.3 dan 5. Ringkas yang berlaku di sini:
- Viewport minimal 1280x1800 untuk modal pengurus (720 px membuat popup dropdown terbuka ke atas dan tertutup scroll).
- `Locator.isVisible({timeout})` mengabaikan timeout → pakai `waitFor`. Klik di luar form menutup modal → pakai Tab.
- id listbox dropdown berubah setelah klik; pilih opsi dari listbox terbuka (`[role="listbox"][data-testid="dropdownsearch-content"]:visible`).
- Backend SIT intermiten 500: `GET /lossvc/v1/config/dropdowns?type=GUARANTOR_TYPE` dan `type=provinces_lamos` (opsi dropdown kosong). Jangan simpulkan "bug form" sebelum ulang.
- Login SSO flake (>60 dtk): ulangi; jangan dua run SIT paralel.
- Checkbox native penjamin: `input[data-testid="checkbox"]` + `isChecked()`, bukan `aria-checked`.
- Ikon di kolom Tindakan pengurus: pertama = Edit (memunculkan konfirmasi), ikon mata = Detail. Mode baca-saja pakai ikon mata.
- `test-results/` dihapus tiap run: screenshot bukti yang penting disalin ke `explore-output/`.

## 6. Konflik dan celah terbuka

- Urutan "Penjamin N" di modal SLIK (ERIN=1, TEGAR=2) beda dengan halaman Data penjamin (TEGAR dulu); pakai nama entitas.
- SLIK reupload: baris 7 punya dua kartu (file ERIN + PIPIT, keduanya "Berhasil diimpor"), asal kartu ERIN tidak terjelaskan; nama file ganda di teks halaman (kemungkinan DOM duplikat, tidak diselidiki); run reupload PDF 10 MB pernah 11,2 mnt (penyebab tidak diketahui); impor 9/9 + bucket Lengkap final belum terbukti.
- HANDHIANTO SURYO KENTJONO ada sebagai pemegang saham tetapi tidak ditambahkan spec; asal tidak terbukti.
- Paginasi daftar pengurus: halaman 2 dan 3 kosong (kemungkinan bug UI SIT, belum diselidiki).
- Kartu kosong "Penjamin 4" sempat terlihat sekali; asal tidak terbukti.
- Rule validasi per field (format NIK 16 digit, NPWP, nomor HP, batas panjang), pesan error, dan perilaku saat field wajib kosong: **tidak terbukti** (belum ada probe validasi).
- Varian badan usaha bucket Identitas: **belum dipetakan**.
- Regresi helper bersama (`FormControls.ts`, `PenjaminForms.ts`) pada spec Identitas lain: belum dijalankan ulang.
