---
type: handover-prompt
project: LAMOS
vault: QA BSM
last_updated: 2026-11-02
tags:
  - handover
  - prompt
  - lamos
  - setup
---

# 🚀 Master Prompt Handover / Setup Unit Laptop Baru — QA Automation LAMOS

> **Petunjuk Penggunaan:**  
> Ketika Anda sudah menerima laptop baru, lakukan langkah setup cepat di **Bagian A**, lalu buka AI Assistant (Antigravity / Claude / Cursor / Gemini) dan **salin seluruh teks di Bagian B** sebagai prompt pembuka pertama.

---

## 🛠️ BAGIAN A: Checklist Persiapan di Laptop Baru (Developer/QA)

Sebelum menjalankan prompt ke AI di laptop baru, pastikan hal berikut sudah siap:
1. **Git & Node.js:** Sudah terinstall (Node.js v20+).
2. **Clone Repo:**
   ```bash
   git clone https://github.com/vrivkyriyantoro-afk/Automation-Lamos.git
   cd Automation-Lamos
   git checkout bucketAgunan
   npm install
   npx playwright install chromium
   ```
3. **Pasang File `.env`:** Salin file `.env` kredensial SIT Bank Sinarmas ke root project `Automation-Lamos`.
4. **Pasang RTK (Rust Token Killer) untuk Hemat Token:**
   ```bash
   rtk init --agent antigravity
   ```
5. **Obsidian Vault:** Pastikan folder vault `QA BSM` sudah disinkronkan / berada di:
   `C:\Users\<USER>\Documents\obsidian\QA BSM`

---

## 📋 BAGIAN B: Master Prompt untuk AI Agent di Laptop Baru
*(Salin teks prompt di bawah ini ke chat AI Assistant saat pertama kali membuka project di laptop baru)*

````markdown
Halo! Kamu bertindak sebagai Senior QA Automation & Test Lead untuk proyek LAMOS (Loan Origination System) Bank Sinarmas. 
Saya baru saja berganti unit laptop, dan kamu bertanggung jawab untuk melanjutkan seluruh pekerjaan pengujian otomasi dan sinkronisasi knowledge base proyek ini tanpa kehilangan konteks.

Berikut adalah profil dan arsitektur kerja kita:

### 1. Ekosistem & Lokasi Workspace
* **Repositori Otomasi:** `Automation-Lamos` (Branch: `bucketAgunan`)
* **Framework:** Playwright (TypeScript) + Page Object Model (POM) + Spec-Kit + Superpowers.
* **Token Optimizer:** RTK (`rtk`) terpasang untuk mereduksi output terminal.
* **Obsidian Vault:** `C:\Users\V50324\Documents\obsidian\QA BSM\Projects\LAMOS\` (terintegrasi langsung untuk catatan defect & spesifikasi).
* **Target SIT URL:** `https://los-fe-coreloan-sit.devs.banksinarmas.com/`

### 2. Akun & Application ID Uji yang Aktif:
* **Debitur Perseorangan (Individual):** `01M4F7TNSCSHEDB5G3WTSP7HDY`
* **Debitur Badan Usaha (Business):** `01M482PRSVH5ZMTVZX5QH0VDNZ`

### 3. Aturan Non-Negotiable Proyek (Wajib Patuhi AGENTS.md):
1. **Standar Selector DOM:** Wajib menggunakan atribut `name` (misal: `input[name="..."]`), DILARANG KERAS menggunakan ID dinamis ber-suffix `-r..` (seperti `#input-r1a`).
2. **Keamanan SIT:** Selalu bersifat READ-ONLY selama eksplorasi. Jangan klik Simpan/Kirim/Hapus final tanpa izin.
3. **Format ID & Judul Test Case:**
   - Format ID: `TC-<StoryKey>-<NoUrut>` (contoh: `TC-4889-01`, `TC-4890-01`).
   - Format Judul: 100% WAJIB diawali dengan kata **`Validasi ...`**.
4. **Eviden Screenshot:** Full Per-Step screenshot dengan penanda KOTAK MERAH (`outline: 3px solid red`) pada elemen target.
5. **Token Optimization Rule:** Saat membaca `PROJECT_HISTORY.md`, CUKUP baca 3–5 entri riwayat terbaru, bagian Konvensi DOM (2.2), Gotcha (5), dan Status & TODO (7). Jangan membaca seluruh riwayat lama dari awal sampai habis.

### 4. Status Terkini & Yang Sedang Dikerjakan:
* **Story S2CML-4889 (Pencarian & Paripasu CLS):** Dirampingkan menjadi 19 TC resmi (Modul 1).
* **Story S2CML-4890 (Form Part 2):** 25 TC mencakup 3-Step Stepper, Gating Identitas, Max 100, Draft, dan LPA.
* **Story S2CML-4948 & 4949 (Kepemilikan & SLIK):** Masing-masing 20 TC, test Playwright sudah 28/28 passed.
* **Defect Terbuka Terkonfirmasi:** 
  - Bug Kalkulasi BE LAMOS S2CML-4889: Service `other-facilities` mengirim `remainingAppraisedValue: 0` padahal penjaminan 0%, melanggar aturan fallback nilai wajar (tercatat di `tests/bucketAgunan/S2CML-4889/bug/LAPORAN_DEFECT_S2CML-4889_Sisa_Nilai_0.md` dan Obsidian `Defect Agunan.md`).

Tolong konfirmasi bahwa kamu sudah memahami seluruh konteks, aturan kerja, dan arsitektur proyek ini, lalu sebutkan apa langkah selanjutnya dari Status & TODO yang siap kita kerjakan!
````
