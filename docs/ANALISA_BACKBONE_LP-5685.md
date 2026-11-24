# Rantai Dependensi Inti (Backbone) — Epic LP-5685 Bucket Agunan

**Tanggal analisa:** 2 November 2026
**Sumber data:** Jira REST API live via `scripts/jira/crawl-agunan-graph.js`
**Raw data:** `explore-output/atlassian/graph-LP-5685.json` (435 issue ter-crawl)
**Epic:** [LP-5685](https://bank-sinarmas.atlassian.net/browse/LP-5685) — SLP - LAMOS - Origination SME - Phase 2 - Bucket Agunan (`In Development`)

**Cakupan:** 40 anak langsung epic + 42 tetangga eksternal yang dirujuk.

---

## Ringkasan Status Anak Epic

| Status | Jumlah |
|---|---|
| Done | 14 |
| In SIT | 8 |
| Ready to SIT | 8 |
| Dropped | 5 |
| In Development | 4 |
| On Hold | 1 |
| **Total** | **40** |

---

## Lapis 0 — Design (12 task, seluruhnya `Done`)

Seluruh desain Figma/PRD sudah selesai dan menjadi acuan Expected Result pada matriks test case.

| Key | Judul |
|---|---|
| `PDR-183` | Agunan / Pengikatan agunan ke fasilitas |
| `PDR-184` | Agunan / Daftar Agunan |
| `PDR-376` | Preview agunan di detail pengajuan |
| `PDR-404` | [Copy] LAMOS SME |
| `PDR-502` | Metode pengecekan agunan & Penilaian agunan |
| `PDR-536` | Penilaian 6C (Iteration 2) |
| `PDR-816` | Info LTV/CC/LM, Detailing Select Fasilitas |
| `PDR-840` | Update detail agunan based on perubahan form |
| `PDR-852` | Sweeping copy jenis agunan |
| `PDR-1003` | Predictive Collateral Value |
| `PDR-1004` | Simplify Pemilik Agunan (hilangkan SLIK) |
| `PDR-1058` | Simplify Data Tambahan Agunan |

> ⚠️ `PDR-1004` menghilangkan SLIK dari Pemilik Agunan, sementara matriks TC `S2CML-4949` masih menguji form SLIK. Perlu konfirmasi mana yang berlaku.

---

## Lapis 1 — Service Eksternal (di luar epic)

Pondasi integrasi. Kegagalan di lapis ini memblokir seluruh rantai di atasnya.

| Key | Judul | Status | Dikonsumsi oleh |
|---|---|---|---|
| `S2CRL-3124` | CLS View Collateral List | Done | `4889` |
| `S2CRL-3831` | CLS GET List Master | Done | `4889`, `5419`, `5420` |
| `S2CRL-3836` | CLS Inquiry Data Agunan | Done | `4889` |
| `S2CML-3553` | Pengecekan Perorangan | Done | `4948`, `4949` |
| `S2CML-4406` | Pengecekan Badan Usaha Part 1 | **In SIT** | `4948`, `4949` |
| `S2CML-4623` | Form Struktur Kredit Part 3 | Done | `5817` |
| `S2LMS-4302` | LMS Create Cash Collateral via Facility | **Backlog** | `4981` |

---

## Lapis 2 — Landing Page Bucket

```
S2CML-4757 [Dropped] ──digantikan──> S2CML-6017 [Done]
                                        └── FE: S2WP-4874 [Ready to SIT]
```

| Key | Judul | Status |
|---|---|---|
| `S2CML-4757` | Create Bucket Agunan (Landing Page) — lama | Dropped |
| `S2CML-6017` | Create Bucket Agunan (Landing Page) | Done |
| `S2WP-4874` | [FE] Landing bucket agunan | Ready to SIT |

---

## Lapis 3 — Add Agunan (jantung stepper)

```
S2CML-4889 Part 1 — Search Existing Collateral   [In Development] ⚠️
   ├── FE: S2WP-4876 [In SIT] · S2WP-5192 [In SIT]
   └── konsumsi: S2CRL-3124 / 3831 / 3836
        ↓
S2CML-4890 Part 2 — Stepper & Save               [In Development] ⚠️
   └── FE: S2WP-4878 shell [Ready to SIT] · S2WP-4879 Step1 [Done]
           S2WP-4880 Step2 [Ready to SIT] · S2WP-4881 Step3 [Ready to SIT]
           S2WP-5193 integrasi kepemilikan [Ready to SIT] · S2CML-6756 [Done]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-4889` | Add Agunan/Collaterals Part 1 | **In Development** | 19 TC ✅ |
| `S2CML-4890` | Add Agunan/Collaterals Part 2 | **In Development** | 25 TC ✅ |
| `S2WP-4876` | [FE] Modal Stepper UI & Search Existing Collateral | In SIT | — |
| `S2WP-5192` | [FE/Integration] Search Existing Collateral API dari CLS | In SIT | — |
| `S2WP-4878` | [FE] Collateral Add Modal shell + 3-step side-nav | Ready to SIT | — |
| `S2WP-4879` | [FE] Step 1 UI: Informasi Umum Agunan | Done | — |
| `S2WP-4880` | [FE] Step 2 UI: Data Tambahan Agunan | Ready to SIT | — |
| `S2WP-4881` | [FE] Step 3 UI + Bucket Identity gating + Draft/Submit | Ready to SIT | — |
| `S2WP-5193` | [FE/Integration] Form Informasi Kepemilikan Agunan | Ready to SIT | — |
| `S2CML-6756` | LPA "Tidak" → default Tipe penilaian "Internal" | Done | ✅ `TC-4890-14` |

---

## Lapis 4 — Detailing Form per Step

### Step 1 — Informasi Umum

```
S2CML-5419 [In SIT] ──> S2CML-5665 Hasil Penilaian [In SIT]
    FE: S2WP-5061 [Done] · S2WP-5062 [Done] · S2WP-5064 [Done]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-5419` | Detailing Form Informasi Umum Agunan | In SIT | 21 TC 🟡 penomoran masih `TC-4889-xx` |
| `S2CML-5665` | Input Data Hasil Penilaian Agunan | In SIT | ❌ belum ada |
| `S2WP-5061` | [FE] Master informations from backend | Done | — |
| `S2WP-5062` | [FE] Logic pengisian Detailing Form Informasi Umum | Done | — |
| `S2WP-5064` | [FE] Input Data Hasil Penilaian Agunan | Done | — |

### Step 2 — Data Tambahan

```
S2CML-5420 non-Cash Collateral  [Ready to SIT]
S2CML-5445 Cash Collateral      [Ready to SIT]  ◀── sumber fitur CIF
   └── S2CML-4981 Auto get Deposito/Giro/Tabungan by CIF [Ready to SIT]
          FE: S2WP-4995 [Done] · butuh S2LMS-4302 [Backlog]
FE bersama: S2WP-4880 [Ready to SIT]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-5420` | Detailing Form Informasi Tambahan non Cash Collateral | Ready to SIT | ❌ belum ada |
| `S2CML-5445` | Detailing Form Informasi Tambahan Cash Collateral | Ready to SIT | 8 TC ✅ (`TC-5445-01..08`, NOT TESTABLE YET) |
| `S2CML-4981` | Automation get Deposito, Giro, dan Tabungan by CIF | Ready to SIT | tercakup `S2CML-5445` |
| `S2WP-4995` | [FE] Automation get Deposito, Giro, Tabungan by CIF | Done | — |

### Step 3 — Informasi Kepemilikan

```
S2CML-5454 [Dropped] ──dipecah──> S2CML-4948 Load from Bucket Identity [In Development] ⚠️
                                  S2CML-4949 New Data Identitas       [In SIT]
    FE: S2WP-4992 existing identity [Ready to SIT] · S2WP-4993 new user [Ready to SIT]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-5454` | Detailing Form Informasi Kepemilikan — lama | Dropped | — |
| `S2CML-4948` | Setup Form Kepemilikan Load From Bucket Identity | **In Development** | 20 TC ✅ |
| `S2CML-4949` | Setup Form Kepemilikan New Data Identitas | In SIT | 20 TC ✅ |
| `S2WP-4992` | [FE] Bucket Identity - Existing identity | Ready to SIT | — |
| `S2WP-4993` | [FE] Bucket Identity - New User | Ready to SIT | — |

---

## Lapis 5 — Logic Kelengkapan & Submit

```
S2CML-4983 [Dropped] ──digantikan──> S2CML-6019 DoD Step 1 [Ready to SIT]
                                        FE: S2WP-5066 [Ready to SIT]
S2CML-4991 Submit + Icon Banner [Ready to SIT] ──> S2CML-5382 Banner (2) [Ready to SIT]
                                        └── S2CML-5457 Distribusi Agunan [Backlog]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-4983` | Logic Submit Cek Kelengkapan Step 1 — lama | Dropped | — |
| `S2CML-6019` | Logic Submit Cek Kelengkapan (DoD Bucket Agunan Step 1) | Ready to SIT | ❌ belum ada |
| `S2CML-4991` | Logic Submit Cek Kelengkapan & Impact Icon Banner | Ready to SIT | ❌ belum ada |
| `S2CML-5382` | Logic Submit Cek Kelengkapan — Handling Icon Banner (2) | Ready to SIT | ❌ belum ada |
| `S2CML-5457` | Detailing Form Distribusi Agunan | Backlog | — |
| `S2WP-5066` | [FE] Agunan - Completeness check | Ready to SIT | — |

---

## Lapis 6 — Summary & Load Latest

```
S2CML-4758 [Dropped] ──digantikan──> S2CML-6018 Summary Agunan [In SIT] ★ hub terbesar
                                        FE: S2WP-4835 / 4836 / 4837 / 5195
S2CML-4765 [Dropped] ──digantikan──> S2CML-6020 Load Latest data [In SIT]
```

| Key | Judul | Status | TC di repo |
|---|---|---|---|
| `S2CML-4758` | Summary Agunan — lama | Dropped | — |
| `S2CML-6018` | Summary Agunan | **In SIT** | ❌ belum ada |
| `S2CML-4765` | Load Latest data Agunan — lama | Dropped | — |
| `S2CML-6020` | Load Latest data Agunan | In SIT | 10 TC ✅ (spec saja) |
| `S2WP-4835` | [FE] Get ringkasan agunan | Ready to SIT | — |
| `S2WP-4836` | [FE] Get List data Agunan | Ready to SIT | — |
| `S2WP-4837` | [FE] Get List Draft data Agunan | Ready to SIT | — |
| `S2WP-5195` | [FE/Integration] Collateral Binding Config & Distribution | Ready to SIT | — |

---

## Lapis 7 — CRUD Lanjutan

| Key | Judul | Status | FE Partner | TC di repo |
|---|---|---|---|---|
| `S2CML-4940` | Edit Agunan - Lihat Details | **In Development** | `S2WP-4882`, `S2WP-4883`, `S2WP-4892` (Done) | ❌ belum ada |
| `S2CML-4941` | Edit Agunan - Edit data Existing | In SIT | `S2WP-5065` (Ready to SIT) | 15 TC ✅ (spec saja) |
| `S2CML-4944` | Edit Agunan - Soft Delete Data Existing | Done | `S2WP-4840` (Done) | ❌ belum ada |
| `S2CML-4946` | Historical Agunan/Collaterals | Backlog (luar epic) | — | — |

---

## Lapis 8 — Pengikatan & Tampilan Akhir

| Key | Judul | Status | FE Partner |
|---|---|---|---|
| `S2CML-5817` | Form Pengikatan Agunan ke Fasilitas > Summary Agunan | **In SIT** | `S2WP-5054` (Done), `S2WP-5070` (Ready to SIT), `S2WP-5078` (Done), `S2WP-5194` (Ready to SIT) |
| `S2CML-5772` | Lihat Pengajuan Detail Tab Agunan | **In SIT** | `S2WP-4846` (Done) |

---

## Lapis 9 — Enhancement & Edge Case

| Key | Judul | Status | FE Partner |
|---|---|---|---|
| `S2CML-5905` | Edge Cases Impact From Bucket Identitas | On Hold | `S2WP-5055` (Done) |
| `S2CML-6022` | Struktur Kredit Enhancement Part 1 (Confirmation Dialog) | Ready to SIT | `S2WP-4961` (Ready to SIT) |
| `S2CML-6091` | Struktur Kredit Enhancement Part 2 (Confirmation Dialog) | Ready to SIT | `S2WP-4961` (Ready to SIT) |
| `S2CML-5920` | Struktur Kredit Enhancement (induk) | On Hold (luar epic) | — |

---

## Hub Terbesar (derajat koneksi tertinggi)

| Rank | Key | Status | Total koneksi | In | Out |
|---|---|---|---|---|---|
| 1 | `S2CML-6018` Summary Agunan | In SIT | 30 | 13 | 17 |
| 2 | `S2CML-4758` Summary Agunan (lama) | Dropped | 29 | 13 | 16 |
| 3 | `S2CML-4890` Add Part 2 | In Development | 23 | 8 | 15 |
| 4 | `S2CML-4983` Logic Submit (lama) | Dropped | 20 | 9 | 11 |
| 5 | `S2CML-6019` DoD Step 1 | Ready to SIT | 19 | 9 | 10 |
| 6 | `S2CML-4889` Add Part 1 | In Development | 15 | 5 | 10 |

---

## Temuan Kritis

### 1. Delapan TC CIF salah alamat story — ✅ SUDAH DIKOREKSI 2026-11-02

`TC-4889-54` s.d `TC-4889-61` ditandai `BLOCKED — SIT BUILD DISCREPANCY` di bawah `S2CML-4889`. Pemilik fitur sebenarnya adalah **`S2CML-5445`** (Cash Collateral) dan **`S2CML-4981`** (Auto get Deposito/Giro/Tabungan by CIF), keduanya masih berstatus `Ready to SIT` — belum deploy ke SIT. Hulunya `S2LMS-4302` bahkan masih `Backlog`.

Verifikasi AC Jira memastikan seluruh skenario CIF (field CIF muncul bila "tersimpan di Bank Sinarmas = Ya", tombol Cek, inquiry account, filter rekening per jenis agunan) adalah AC `S2CML-5445`. Catatan koreksi lama yang menunjuk `S2CML-5420` juga keliru — story itu Data Tambahan **non** Cash Collateral.

**Tindakan yang sudah dilakukan:**

| Hal | Sebelum | Sesudah |
|---|---|---|
| ID Test Case | `TC-4889-54` s.d `-61` | `TC-5445-01` s.d `-08` |
| Status | `BLOCKED` | `NOT TESTABLE YET` |
| Status Dokumentasi | `SIT BUILD DISCREPANCY` | `FEATURE NOT DEPLOYED (S2CML-5445 / S2CML-4981 Ready to SIT)` |

File terdampak: `fixtures/sources/TemplateAutomateLamos - Sheet1.csv` (via `scripts/export-tc/fix-cif-tc-mapping.js`), `tests/bucketAgunan/perseorangan/modul7-data-tambahan.spec.ts`, `specs/bucket-agunan/S2CML-4889/tasks.md`. Spec baru: `specs/bucket-agunan/S2CML-5445/`.

### 2. Tiga story pemilik defect berstatus mundur

| Story | Status snapshot lama | Status live 2026-11-02 | Defect terkait |
|---|---|---|---|
| `S2CML-4889` | In SIT | **In Development** | `DEFECT-01` Sisa nilai 0 |
| `S2CML-4890` | In SIT | **In Development** | — |
| `S2CML-4948` | In SIT | **In Development** | `MISMATCH-01`, `MISMATCH-02` |

**Konsekuensi:** kemungkinan dev sudah menarik story untuk perbaikan. Konfirmasi ke dev sebelum mengirim laporan defect atau melakukan retest.

### 3. Lima story Dropped masih jadi acuan matriks TC

| Story Dropped | Pengganti | Status pengganti |
|---|---|---|
| `S2CML-4757` | `S2CML-6017` | Done |
| `S2CML-4758` | `S2CML-6018` | In SIT |
| `S2CML-4765` | `S2CML-6020` | In SIT |
| `S2CML-4983` | `S2CML-6019` | Ready to SIT |
| `S2CML-5454` | `S2CML-4948` + `S2CML-4949` | In Development / In SIT |

**Konsekuensi:** Expected Result pada TC yang mengacu AC story Dropped berisiko tidak valid. Perlu rekonsiliasi ke AC story pengganti.

### 4. Rantai paling rapuh

```
S2CRL-3836 CLS Inquiry Data Agunan
     ↓
S2CML-4889 Part 1  ◀── DEFECT-01 duduk di sini
     ↓
S2CML-4890 Part 2
     ↓
seluruh Lapis 4 (detailing) → Lapis 5 (submit) → Lapis 6 (summary) → Lapis 7 (CRUD)
```

`DEFECT-01` (sisa nilai appraisal Rp 0) memblokir pemakaian agunan existing dari CLS, sehingga menahan verifikasi 30+ story di hilirnya.

### 5. Hub terbesar belum punya coverage

`S2CML-6018` (Summary Agunan) adalah simpul dengan koneksi terbanyak (30) dan sudah berstatus `In SIT`, tetapi belum memiliki satu pun test case di repositori.

---

## Rekomendasi Prioritas

| Prioritas | Tindakan | Alasan |
|---|---|---|
| 1 | Eskalasi `DEFECT-01` ke tim CLS (`S2CRL-3836`) | Blocker pangkal rantai, menahan 30+ story hilir |
| 2 | Konfirmasi status `S2CML-4889`, `4890`, `4948` ke dev | Tiga story pemilik defect sedang `In Development` |
| ~~3~~ | ~~Koreksi parent story 8 TC CIF~~ | ✅ **selesai 2026-11-02** — direnomori ke `TC-5445-01..08` |
| 4 | Buat TC untuk `S2CML-6018` Summary Agunan | Hub terbesar, `In SIT`, tanpa coverage |
| 5 | Rekonsiliasi TC yang mengacu 5 story Dropped | Expected Result berpotensi tidak valid |
| 6 | Sinkronkan penomoran `TC-4889-xx` → `TC-5419-xx` | 5 file modul salah penomoran |
| 7 | Pantau `S2CML-5445` & `S2CML-4981` hingga `In SIT` | 8 TC CIF menunggu deployment fitur |

---

## Story Tanpa Coverage (25 dari 40)

**Sudah `In SIT`, siap diuji:**
`S2CML-5665` Hasil Penilaian · `S2CML-6018` Summary Agunan · `S2CML-5817` Pengikatan ke Fasilitas · `S2CML-5772` Lihat Detail Tab Agunan

**`Ready to SIT`:**
`S2CML-5420` Data Tambahan non-Cash · `S2CML-5445` Cash Collateral · `S2CML-4981` Auto CIF · `S2CML-6019` DoD Step 1 · `S2CML-4991` Icon Banner · `S2CML-5382` Icon Banner (2) · `S2CML-6022` + `S2CML-6091` Struktur Kredit Dialog

**`Done` tanpa coverage:**
`S2CML-6017` Landing Page · `S2CML-4944` Soft Delete · 12 task `PDR-*` (design, tidak perlu TC)

**Belum bisa diuji:**
`S2CML-4940` Lihat Details (In Development) · `S2CML-5905` Edge Cases (On Hold)

**Dropped (tidak perlu coverage):**
`S2CML-4757` · `S2CML-4758` · `S2CML-4765` · `S2CML-4983` · `S2CML-5454`

---

## Cara Memperbarui Analisa Ini

```powershell
node scripts/jira/crawl-agunan-graph.js      # tarik ulang graf dari Jira API
node scripts/jira/analyze-agunan-graph.js    # hasilkan ringkasan struktur
```

Output: `explore-output/atlassian/graph-LP-5685.json` dan `explore-output/atlassian/analisa-LP-5685.md`.
