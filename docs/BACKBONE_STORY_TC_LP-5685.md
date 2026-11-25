# Backbone Story & Peta Kepemilikan Test Case — Epic LP-5685

**Tanggal:** 2 November 2026
**Epic:** [LP-5685](https://bank-sinarmas.atlassian.net/browse/LP-5685) — Bucket Agunan
**Sumber status:** Jira REST API live (`scripts/jira/crawl-agunan-graph.js`)
**Sumber jumlah TC:** kolom `Test Case ID` pada `tests/<bucket>/<story>/TC_*.csv`
**Audit redundansi:** `scripts/export-tc/audit_tc_redundancy.py`

Dokumen ini memetakan **satu skenario = satu story pemilik**, supaya tidak ada test case yang ditulis dua kali di story berbeda.

---

## 1. Aturan Kepemilikan Test Case

| Aturan | Penjelasan |
|---|---|
| **Satu skenario satu pemilik** | Tiap skenario hanya boleh punya TC di story yang Acceptance Criteria-nya memuat skenario itu. |
| **Acuan = AC Jira** | Kepemilikan ditentukan dari AC, bukan dari kemiripan judul atau kedekatan modul. |
| **Penomoran ikut pemilik** | ID wajib `TC-<StoryKey>-<NoUrut>`. Pindah story = wajib renomori. |
| **Story Dropped bukan pemilik** | TC yang mengacu story Dropped dipindah ke story penggantinya. |
| **Batas antar-step jelas** | Mekanik stepper milik `S2CML-4890`; isi form tiap step milik story detailing masing-masing. |

---

## 2. Backbone Story + Kepemilikan TC

```
LAPIS 0 — DESIGN (12 task PDR, Done)
   tidak punya TC (acuan Expected Result saja)
        │
LAPIS 1 — SERVICE EKSTERNAL
   S2CRL-3124 · S2CRL-3831 · S2CRL-3836   (CLS, Done)
   S2CML-3553 (Done) · S2CML-4406 (In SIT)  (Pengecekan debitur)
   S2LMS-4302 (Backlog)                     (LMS Cash Collateral)
        │   tidak punya TC sendiri — diuji lewat story konsumen
        ▼
LAPIS 2 — LANDING PAGE
   S2CML-4757 [Dropped] ──> S2CML-6017 [Done]          ❌ 0 TC
        │
        ▼
LAPIS 3 — ADD AGUNAN
   S2CML-4889 Part 1 — Search CLS      [In Dev]        ✅ 19 TC
        │     pemilik: pencarian agunan, paripasu, hasil CLS
        ▼
   S2CML-4890 Part 2 — Stepper & Save  [In Dev]        ✅ 25 TC
              pemilik: mekanik stepper, gating, draft/submit, indikator
        │
        ├─── LAPIS 4 STEP 1 — INFORMASI UMUM
        │    S2CML-5419  [In SIT]                      ✅ 21 TC
        │       pemilik: pengikatan, pemeringkat, alamat, data pembanding, penilaian
        │    S2CML-5665 Hasil Penilaian [In SIT]       ❌ 0 TC
        │
        ├─── LAPIS 4 STEP 2 — DATA TAMBAHAN
        │    S2CML-5420 non Cash Collateral [Ready]    ✅ 16 TC
        │       pemilik: sifat agunan, bukti kepemilikan, upload dokumen, indikator step
        │    S2CML-5445 Cash Collateral     [Ready]    ✅ 14 TC
        │       pemilik: CIF, inquiry rekening, aturan Deposito F11
        │    S2CML-4981 Auto get by CIF     [Ready]    → tercakup S2CML-5445
        │
        └─── LAPIS 4 STEP 3 — INFORMASI KEPEMILIKAN
             S2CML-5454 [Dropped] ──dipecah──┐
             S2CML-4948 Load Bucket Identity [In Dev]  ✅ 20 TC
                pemilik: kategori pemilik, auto-fill dari Bucket Identitas
             S2CML-4949 New Data Identitas   [In SIT]  ✅ 20 TC
                pemilik: form SLIK identitas baru, tipe kepemilikan
        │
        ▼
LAPIS 5 — LOGIC KELENGKAPAN
   S2CML-4983 [Dropped] ──> S2CML-6019 [Ready]         ❌ 0 TC
   S2CML-4991 [Ready] ──> S2CML-5382 [Ready]           ❌ 0 TC
        │
        ▼
LAPIS 6 — SUMMARY & LOAD
   S2CML-4758 [Dropped] ──> S2CML-6018 [In SIT] ★hub   ❌ 0 TC
   S2CML-4765 [Dropped] ──> S2CML-6020 [In SIT]        ✅ 6 TC
        │
        ▼
LAPIS 7 — CRUD LANJUTAN
   S2CML-4940 Lihat Details  [In Dev]                  ❌ 0 TC
   S2CML-4941 Edit Existing  [In SIT]                  ✅ 12 TC
   S2CML-4944 Soft Delete    [Done]                    ❌ 0 TC
        │
        ▼
LAPIS 8 — PENGIKATAN & TAMPILAN
   S2CML-5817 Pengikatan ke Fasilitas [In SIT]         ❌ 0 TC
   S2CML-5772 Detail Tab Agunan       [In SIT]         ❌ 0 TC
        │
        ▼
LAPIS 9 — ENHANCEMENT
   S2CML-5905 Edge Cases    [On Hold]                  ❌ 0 TC
   S2CML-6022 ──> S2CML-6091 Struktur Kredit [Ready]   ❌ 0 TC
```

---

## 3. Batas Kepemilikan per Story

| Story | Lapis | TC | Pemilik skenario | **Bukan** pemilik |
|---|---|---|---|---|
| `S2CML-4889` | 3 | 19 | Pencarian agunan CLS, nomor bukti pemilikan, paripasu, hasil pencarian | Isi form step mana pun |
| `S2CML-4890` | 3 | 25 | Mekanik stepper, gating Step 3, draft/submit, indikator kelengkapan | Isi field detail tiap step |
| `S2CML-5419` | 4·1 | 21 | Pengikatan, pemeringkat, alamat, data pembanding, hasil penilaian | Data tambahan, kepemilikan |
| `S2CML-5420` | 4·2 | 16 | Sifat agunan, bukti kepemilikan, upload dokumen, indikator Step 2 | **Apa pun soal Cash Collateral / CIF** |
| `S2CML-5445` | 4·2 | 14 | CIF, inquiry rekening, Deposito F11, Instansi Penerbit | Upload dokumen umum, sifat agunan |
| `S2CML-4948` | 4·3 | 20 | Kategori pemilik, auto-fill dari Bucket Identitas | Form SLIK identitas baru |
| `S2CML-4949` | 4·3 | 20 | Form SLIK identitas baru, tipe kepemilikan, jenis badan usaha | Auto-fill dari Bucket Identitas |
| `S2CML-4941` | 7 | 12 | Menu titik 3, prefill edit, Draft vs Final, kalkulasi ulang | Pembuatan agunan baru |
| `S2CML-6020` | 6 | 6 | Retensi data antar bucket, reload, re-login | Pengisian form |
| | | **162** | | |

---

## 4. Hasil Audit Redundansi

```
Total test case ter-audit: 162 dari 9 story (diperbarui 2026-11-13; audit awal 169)

1. ID DUPLIKAT ............... ✅ tidak ada
2. JUDUL MIRIP ANTAR STORY ... ✅ 2 pasang, keduanya sah (beda konteks)
3. TC DI LUAR SCOPE .......... ✅ tidak ada (7 flag = false positive)
```

### 4.1 Redundansi yang Sudah Ditindak

| Pasangan | Kemiripan awal | Putusan |
|---|---|---|
| `TC-4890-06` vs `TC-4948-17` | 76% | **Bukan redundansi isi — judul yang salah.** Pemeriksaan spec otomasi menunjukkan `TC-4948-17` sebenarnya menguji field Bukti Kepemilikan disabled + stepper "Belum Lengkap" + Simpan disabled (asal `TC-4889-62` & `-63`), bukan gating. Hanya judul dan Expected Result-nya yang keliru menyalin skenario gating. **Tindakan 2026-11-02:** judul & Expected `TC-4948-17` dikoreksi agar cocok dengan isi tes; gating Bucket Identitas tetap milik tunggal `TC-4890-06`. Tidak ada TC yang dibuang, tidak ada renomori berantai. |

### 4.2 Mirip tapi Sah (bukan redundansi)

| Pasangan | Kemiripan | Alasan dipertahankan |
|---|---|---|
| `TC-4890-11` vs `TC-4949-18` | 82% | `4890-11` menguji tombol Simpan disabled untuk mandatory **lintas Step 1/2/3**; `4949-18` khusus field **SLIK Perorangan** di Step 3. Prekondisi berbeda. |
| `TC-4949-06` vs `TC-5420-09` | 81% | `4949-06` upload **KTP** di form SLIK (Step 3); `5420-09` upload **dokumen kepemilikan agunan** (Step 2). Komponen dan step berbeda. |

### 4.3 False Positive Audit

Tujuh TC ditandai "di luar scope" oleh heuristik kata kunci, tetapi seluruhnya punya referensi AC yang benar:

| TC | Alasan tetap di story-nya |
|---|---|
| `TC-4890-14` | Ref `S2CML-6756`, linked issue milik `S2CML-4890` |
| `TC-4948-13`, `TC-4948-19` | Ref `S2CML-4948 AC-4` |
| `TC-4949-01`, `TC-4949-02`, `TC-4949-14` | Ref AC `S2CML-4949` (kategori 005/008 & tabel mapping) |
| `TC-5419-02` | Ref AC `S2CML-5419` (tombol Kembali di Step 1) |
| `TC-5420-01` | Ref AC `S2CML-5420` (Entry Data Point Step 2) |

---

## 5. Riwayat Koreksi Kepemilikan

| Tanggal | TC | Dari | Ke | Sebab |
|---|---|---|---|---|
| 2026-11-02 | `TC-4889-54` s.d `-61` (8) | `S2CML-4889` | `TC-5445-01` s.d `-08` | Skenario CIF adalah AC `S2CML-5445`, bukan Search CLS |
| 2026-11-02 | `TC-5420-15` s.d `-25` (11) | `S2CML-5420` | `S2CML-5445` (6 masuk, 5 dibuang duplikat) | Judul story eksplisit *non* Cash Collateral |
| 2026-11-02 | `TC-4948-17` (judul saja) | — | tetap `S2CML-4948` | Judul & Expected dikoreksi agar cocok isi tes; gating tetap `TC-4890-06` |
| 2026-11-01 | Modul 2–8 | `S2CML-4889` | `4890` / `4948` / `4949` | Perampingan scope Part 1 |

Skrip migrasi: `scripts/export-tc/fix-cif-tc-mapping.js`, `scripts/export-tc/split_5420_cash_collateral.py`, `scripts/export-tc/dedupe_5445.py`.

---

## 6. Celah Coverage

**Sudah `In SIT`, belum ada TC — prioritas tertinggi:**

| Story | Modul | Catatan |
|---|---|---|
| `S2CML-6018` | Summary Agunan | Hub terbesar epic (30 koneksi) |
| `S2CML-5665` | Input Data Hasil Penilaian | Bersinggungan `S2CML-5419` — tentukan batas sebelum menulis TC |
| `S2CML-5817` | Pengikatan Agunan ke Fasilitas | Prasyarat `TC-4941-10..12` |
| `S2CML-5772` | Lihat Pengajuan Detail Tab Agunan | — |

**`Ready to SIT`, belum ada TC:** `S2CML-6019`, `S2CML-4991`, `S2CML-5382`, `S2CML-6022`, `S2CML-6091`

**`Done`, belum ada TC:** `S2CML-6017` Landing Page, `S2CML-4944` Soft Delete

**Belum bisa diuji:** `S2CML-4940` (In Development), `S2CML-5905` (On Hold)

> ⚠️ Saat menulis TC untuk `S2CML-5665`, periksa tumpang tindih dengan `TC-5419-19` s.d `TC-5419-21` yang sudah mencakup hasil penilaian Internal vs KJPP.

---

## 7. Cara Memeriksa Ulang

```powershell
node scripts/jira/crawl-agunan-graph.js        # tarik ulang status story dari Jira
python -I scripts/export-tc/audit_tc_redundancy.py  # audit ID duplikat, judul mirip, TC nyasar
```

Jalankan audit setiap kali menambah suite TC baru, sebelum mengekspor ke CSV/Excel.
