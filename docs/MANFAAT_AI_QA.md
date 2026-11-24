# Manfaat AI Assistant dalam Proses Testing LAMOS dan Pega

**QA Automation · Bank Sinarmas · per 12 November 2026**

Data kuantitatif dihitung dari repo `Automation-Lamos` dan riwayat kerja proyek periode 8 Oktober – 12 November 2026.

---

## 1. LAMOS: Data Kuantitatif

### Output yang sudah dihasilkan

| Metrik | Jumlah |
|---|---:|
| Story Jira Bucket Agunan yang diuji (epic LP-5685) | 9 |
| Test case resmi di matriks CSV/XLSX | 162 |
| Test Playwright otomatis | 192 (di 66 file spec) |
| File Page Object (bisa dipakai ulang) | 54 |
| Defect terdokumentasi format BSM | 5 (di 4 laporan) |
| Hari kerja tercatat di riwayat proyek | 18 |

### Rincian test case per story

| Story | Topik | Jumlah TC |
|---|---|---:|
| S2CML-4889 | Bucket Agunan (reuse agunan CLS) | 19 |
| S2CML-4890 | Add Agunan Part 2 | 25 |
| S2CML-4941 | Edit Agunan Existing | 12 |
| S2CML-4948 | Informasi Kepemilikan | 20 |
| S2CML-4949 | Informasi Kepemilikan, identitas baru | 20 |
| S2CML-5419 | Detailing Informasi Umum | 21 |
| S2CML-5420 | Data Tambahan Agunan | 16 |
| S2CML-5445 | Data Tambahan Cash Collateral | 14 |
| S2CML-6020 | Load Latest Data Agunan | 6 |
| **Total** | | **162** |

### Estimasi jam kerja manual yang tergantikan

> **Catatan:** angka di bawah adalah **estimasi**, bukan hasil pengukuran. Menit per item dan porsi kerja yang tetap manual adalah asumsi standar dan perlu disesuaikan dengan pengalaman tim.

| Aktivitas | Jumlah | Asumsi menit/item (manual) | Jam manual |
|---|---:|---:|---:|
| Menyusun test case dari acceptance criteria Jira | 162 | 15 | 40,5 |
| Menulis script test Playwright | 192 | 45 | 144,0 |
| Membuat Page Object | 54 | 60 | 54,0 |
| Menulis laporan defect | 5 | 45 | 3,8 |
| Menyusun spec & matriks per story | 9 | 120 | 18,0 |
| **Total jika dikerjakan manual** | | | **260,3** |

Asumsi 35% pekerjaan tetap dilakukan QA (review, koreksi, run SIT). Hasilnya:

| Hasil | Nilai |
|---|---:|
| **Jam dihemat** | **± 169 jam** |
| **Setara hari kerja (8 jam)** | **± 21 hari** |

Rumus: jam dihemat = jam manual × (100% − 35%).

---

## 2. LAMOS: Data Kualitatif

| Manfaat | Penjelasan & contoh nyata |
|---|---|
| **Cakupan test lebih lengkap** | Acceptance criteria Jira dipecah menjadi TC positive, negative, dan boundary per kelompok modul. Contoh: S2CML-5419 menghasilkan 21 TC dari satu story. |
| **Redundansi terdeteksi lintas story** | TC yang tumpang tindih antar story bisa dicek cepat. Contoh: 4 TC S2CML-6020 dihapus (10 menjadi 6) karena sudah dicakup S2CML-4941 atau dikeluarkan dari scope, lalu sisa TC di-renumber konsisten di script test, spec, dan file export. |
| **Laporan defect siap kirim** | Defect ditulis lengkap: langkah reproduksi, expected vs actual, eviden, dan dugaan layer penyebab (FE/BE). Contoh: nilai appraisal Rp 0 di S2CML-4889, tombol mengambang menutupi nominal agunan di S2CML-4941. |
| **Eviden konsisten** | Setiap langkah test menghasilkan screenshot sesuai butir langkah di matriks TC, sehingga eviden SIT seragam dan mudah diaudit. |
| **Pengetahuan tidak hilang** | Konvensi DOM, kendala SIT (mis. redirect SSO 60–90 detik), dan keputusan user tercatat di riwayat proyek. Anggota tim baru bisa langsung melanjutkan pekerjaan. |
| **Kode test lebih mudah dirawat** | Page Object dan helper dipakai ulang di banyak suite. Jika UI berubah, perbaikan cukup di satu tempat. |

---

## 3. LAMOS: Sinkronisasi Requirement Antar Sumber

Requirement LAMOS tersebar di Jira (epic, story BE/FE, task desain), Figma, dan matriks test case. AI dipakai untuk menarik dan mencocokkan semuanya, supaya test case selalu sejalan dengan requirement terbaru.

### Data kuantitatif

| Metrik | Jumlah |
|---|---:|
| Tiket Jira di epic LP-5685 yang dipetakan beserta relasinya | 435 |
| Story yang detailnya ditarik dari Jira untuk acuan test case | 14 |
| Test case yang diaudit silang antar 9 story | 162 (audit awal 169) |
| ID test case duplikat setelah audit | 0 |
| TC S2CML-6020 yang dihapus (duplikat TC-4941 atau di luar scope) | 4 |
| Story `In SIT` / `Ready to SIT` yang terdeteksi **belum punya TC** | 9 |

### Data kualitatif

| Manfaat | Penjelasan & contoh nyata |
|---|---|
| **Satu peta requirement untuk seluruh epic** | 435 tiket epic Bucket Agunan dipetakan beserta status dan relasinya (`docs/ANALISA_BACKBONE_LP-5685.md`). QA tahu story mana yang jadi dasar story lain sebelum menulis test case. |
| **Status test case selalu mengikuti status Jira** | Status story dicek ulang langsung dari Jira, bukan dari ingatan. Contoh: S2CML-4765 berstatus `Dropped` dan digantikan S2CML-6020, sehingga TC disusun untuk story yang benar. |
| **Pasangan BE dan FE tersambung** | Story BE dihubungkan dengan story FE pasangannya. Contoh: S2CML-4941 (BE) dengan S2WP-5065 (FE), sehingga satu TC menguji keduanya. |
| **Batas kepemilikan TC antar story jelas** | Setiap TC punya satu story pemilik (`docs/BACKBONE_STORY_TC_LP-5685.md`). Story yang bersinggungan, misalnya S2CML-5665 dengan S2CML-5419, ditandai supaya TC tidak ditulis dua kali. |
| **Celah coverage terlihat lebih awal** | Story yang sudah masuk SIT tapi belum punya TC langsung muncul. Contoh: S2CML-6018 (Summary Agunan), hub terbesar epic dengan 30 koneksi. |
| **Desain Figma dicocokkan dengan aplikasi** | Elemen UI di SIT dibandingkan dengan desain Figma. Contoh: validasi ikon kartu agunan untuk S2CML-6018. |
| **Perubahan tersebar konsisten** | Saat requirement berubah, ID TC, script test, spec, dan file export diperbarui bersamaan, sehingga tidak ada dokumen yang tertinggal versi lama. |

### Sub-agent pendukung

Tiga sub-agent dibuat pada 12 Nov 2026 (via Antigravity). Semuanya memakai placeholder `<story>`, jadi bisa dipakai untuk story Bucket Agunan mana pun.

| Sub-agent | Fungsi | Kaitan dengan sinkronisasi requirement |
|---|---|---|
| `qa-spec-auditor` | Audit spec fase hulu sebelum test dibuat | **Menyelaraskan informasi dari semua sumber requirement.** Membandingkan nama field, label, opsi dropdown, urutan stepper, dan state UI antara Jira, Figma, dan PRD. Menilai kelengkapan acceptance criteria, mencari celah logika, lalu menghasilkan verdict kesiapan (READY / READY WITH NOTES / BLOCKED BY AMBIGUITY) dan daftar pertanyaan ke BA/PO/UI-UX. |
| `qa-anomaly-judge` | Audit hasil eksekusi test terhadap AC dan spec | Mendeteksi deviasi dari acceptance criteria, test yang lolos padahal UI error (false positive), dan salah hitung rasio agunan. Membuat laporan defect format BSM. Pemakaian pertama: S2CML-4941. |
| `qa-explorer` | Exploratory testing terstruktur | Mencatat dugaan defect dengan format Terjadi vs Seharusnya, langkah, URL, dan bukti. Eksplorasi read-only kecuali diminta submit. |

Batasan: path spec di `qa-anomaly-judge` mengarah ke `specs/bucket-agunan/`, dan perhitungan rasio mengacu ke `Catatan Agunan.md`, sehingga untuk modul non-agunan atau Pega perlu disesuaikan. Belum ada laporan audit dari `qa-spec-auditor` di `docs/`, jadi manfaatnya belum punya angka.

---

## 4. Pega

**Status: belum dimulai.** Belum ada data pengujian Pega, sehingga belum ada angka kuantitatif.

Alur yang sama dapat diterapkan saat proyek Pega dimulai, misalnya untuk tahap underwriting di Pega MSME, KPR, dan SCF:

- Menyusun test case dari story Jira Pega dengan format matriks yang sama seperti LAMOS.
- Membuat script Playwright untuk alur case Pega yang berulang.
- Menulis laporan defect dengan standar yang sama, supaya laporan LAMOS dan Pega seragam.

Data Pega akan ditambahkan ke dokumen ini setelah ada story yang dikerjakan.

---

## 5. Metodologi

- Jumlah story, TC, test, Page Object, dan laporan defect dihitung langsung dari file di repo.
- Hari kerja = jumlah tanggal unik di riwayat proyek (8 Okt – 12 Nov 2026).
- Data sinkronisasi requirement diambil dari hasil crawl Jira (`explore-output/atlassian/graph-LP-5685.json`) dan audit di `docs/BACKBONE_STORY_TC_LP-5685.md`. Audit awal menghitung 169 TC. Setelah 4 TC S2CML-6020 dihapus, matriks resmi dan dokumen backbone berisi 162 TC (per 13 Nov 2026).
- Jam manual = jumlah item × asumsi menit per item.
- Jam dihemat = jam manual × (100% − porsi yang tetap dikerjakan manual).
- **Belum dihitung:** waktu run test di SIT, dan defect yang ditemukan lewat run otomatis tanpa laporan tertulis. Penyebabnya, hasil run Playwright sebelumnya selalu tertimpa dan tidak diarsipkan.
- **Mulai 12 Nov 2026:** setiap run diarsipkan ke `run-history/`. Ringkasan jumlah run, durasi, dan pass/fail bisa diambil dengan `node scripts/reporting/run-summary.js`, lalu dimasukkan ke dokumen ini setelah data terkumpul beberapa minggu.
- **Defect dari run otomatis:** test yang terkait defect diberi label ID defect (anotasi `defect` di Playwright). Saat test itu gagal di run, `run-summary.js` menghitungnya sebagai defect yang terdeteksi otomatis. Saat ini 9 test sudah berlabel, mencakup 6 temuan dari laporan di `docs/` (BUG-01, MISMATCH-01 s.d 03, DEFECT-4941-01 dan 02).
