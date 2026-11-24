# KARTU BUCKET — Dokumen (`dokumen`)

> Pemilik: `qa-step-mapper`. **Status: BELUM DIPETAKAN.** Gunakan `_TEMPLATE.md` saat dipetakan.

Terakhir diperbarui: **2026-11-24** (stub).

## Yang diketahui (dari `PROJECT_HISTORY.md` 2.1 dan 2.3)
- Bucket id `dokumen`, folder page object `pages/bucketDokumen/` (manual, pohon dokumen parsial).
- Upload file: `input[type="file"]` dengan **id dinamis** (`:r0:`), bukan `id="ktpFiles"` seperti bucket lain.
- Spec `tests/bucketDokumen/explore-dokumen.spec.ts` ada (eksplorasi); belum ada flow terverifikasi (registry: "baru lolos typecheck").

## Tidak terbukti
Peta section, rule form, jenis dokumen wajib, gate, kaitan dengan bucket lain.

Bucket lain (`struktur_kredit`, `penilaian_kelayakan`, `data_usaha`, `analisa_keuangan`, `legal_risk_compliance`, `covenant_tbo`, `penyimpangan_pihak_terkait`, `catatan_anda`): belum ada kartu; page object ada (generated), flow belum ada.
