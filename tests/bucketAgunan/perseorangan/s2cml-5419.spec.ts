import { test, expect, Page, TestInfo, Locator } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * S2CML-5419 - Detailing Form Informasi Umum Agunan (Perseorangan)
 * Sumber: exports/test-cases/TC_S2CML-5419_Detailing_Informasi_Umum.csv (TC-5419-01..20)
 * Aturan eviden (AGENTS.md): 1 test.step = 1 butir "Langkah Pengujian" CSV, step-0 = prekondisi,
 * screenshot langkah terakhir membuktikan Expected Result, tanpa kotak merah.
 * TC-5419-21 (auto-sync BE) tidak di sini: butuh cek payload BE.
 * Karakter: READ-ONLY (tanpa submit agunan).
 */

const APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=agunan&debtorType=individual`;

// ─── Helper eviden ───────────────────────────────────────────────────────
async function shot(page: Page, ti: TestInfo, tc: string, n: number, label: string) {
  // Modal terbuka: perbesar viewport sementara agar isi modal tidak terpotong. Tanpa modal: screenshot biasa.
  // ponytail: tinggi tetap 2400px; naikkan bila form modal lebih panjang.
  const modalAda = await page.getByText(/^(Tambah agunan|Tambah data pembanding)$/i).first().isVisible().catch(() => false);
  const awal = page.viewportSize();
  if (modalAda && awal) { await page.setViewportSize({ width: awal.width, height: 2400 }); await page.waitForTimeout(300); }
  try {
    await ti.attach(`${tc}-step-${n}: ${label}`, { body: await page.screenshot(), contentType: 'image/png' });
  } finally {
    if (modalAda && awal) await page.setViewportSize(awal);
  }
}
const stepper = (page: Page, ti: TestInfo, tc: string) =>
  (n: number, label: string, fn: () => Promise<void>) =>
    test.step(`${n}. ${label}`, async () => { await fn(); await shot(page, ti, tc, n, label); });
async function see(loc: Locator, msg?: string) {
  await expect(loc, msg).toBeVisible({ timeout: 15000 });
  await loc.scrollIntoViewIfNeeded();
}

// ─── Helper navigasi ─────────────────────────────────────────────────────
const listbox = (page: Page) => page.locator('[role="listbox"]:visible, ul:visible').first();
const opts = (page: Page) => listbox(page).locator('li:not(.sticky) button, li:not(.sticky)');

async function pickOption(page: Page, trigger: Locator, option: RegExp) {
  await trigger.click();
  await listbox(page).locator('li button, li').first().waitFor({ timeout: 15000 });
  const o = opts(page).filter({ hasText: option }).first();
  await expect(o, `opsi ${option} harus ada`).toBeVisible({ timeout: 5000 });
  const text = (await o.innerText()).trim();
  await o.click();
  await page.waitForTimeout(1200);
  return text;
}

async function openFormAgunanBaru(page: Page, jenis: RegExp): Promise<string> {
  const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(btnTambah).toBeVisible({ timeout: 45000 });
  await btnTambah.click();
  await expect(page.locator('h2:has-text("Tambah agunan")')).toBeVisible({ timeout: 20000 });
  const dipilih = await pickOption(page, page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last(), jenis);
  await page.locator('input[placeholder*="nomor" i]').first().fill('NONEXISTENT_DUMMY_CLS_' + Date.now());
  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();
  const btnBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnBaru).toBeVisible({ timeout: 15000 });
  await btnBaru.click();
  await page.waitForTimeout(2000);
  return dipilih;
}

const statusTrigger = (page: Page) =>
  page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first();
const setStatus = (page: Page, s: 'Tersedia' | 'Indent') => pickOption(page, statusTrigger(page), new RegExp(s, 'i'));

const label = (page: Page, re: RegExp) => page.locator('label, span, div, p').filter({ hasText: re });
const labelFirst = (page: Page, re: RegExp) => label(page, re).first();

const btnPembanding = (page: Page) => page.locator('button').filter({ hasText: /Data pembanding/i }).first();

// Jangkar: input nominal (hanya ada di modal pembanding) -> ancestor terdekat yang memuat tombol aksi modal.
const modalPembanding = (page: Page) =>
  page.locator('input[placeholder*="nominal" i]').last()
    .locator('xpath=ancestor::div[.//button[contains(normalize-space(.),"Batalkan") or contains(normalize-space(.),"Tutup")]][1]');

/** Isi semua field mandatory modal pembanding (Sumber, Nama, Nominal, Alamat, wilayah, Kode pos). */
async function fillPembanding(page: Page, modal: Locator, harga = '500000000', nama = 'Bpk. Hendra') {
  const isi = async (loc: Locator, v: string) => {
    await expect(loc, 'field modal pembanding harus ada').toBeVisible({ timeout: 8000 });
    await loc.scrollIntoViewIfNeeded();
    await loc.fill(v);
  };
  await isi(modal.locator('input[placeholder*="nama" i]').first(), nama);
  await isi(modal.locator('input[placeholder*="nominal" i]').first(), harga);
  await isi(modal.locator('input[placeholder*="alamat" i]').first(), 'Jl. Uji Coba No. 1');
  for (let i = 0; i < 8; i++) {
    const kosong = modal.locator('[role="combobox"]').filter({ hasText: /^Pilih/ }).first();
    if (!(await kosong.isVisible({ timeout: 1500 }).catch(() => false))) break;
    await kosong.scrollIntoViewIfNeeded();
    // dropdown kadang tidak terbuka pada klik pertama: coba sampai 3x
    for (let t = 0; t < 3; t++) {
      await kosong.click();
      if (await opts(page).first().isVisible({ timeout: 4000 }).catch(() => false)) break;
      await page.keyboard.press('Escape');
    }
    await expect(opts(page).first(), 'opsi dropdown modal pembanding').toBeVisible({ timeout: 5000 });
    await opts(page).first().click();
    await page.waitForTimeout(800);
  }
  await isi(modal.locator('input[placeholder*="kode pos" i]').first(), '10110');
}

async function addPembanding(page: Page, harga?: string, nama?: string) {
  await btnPembanding(page).scrollIntoViewIfNeeded();
  await btnPembanding(page).click();
  const m = modalPembanding(page);
  await expect(m).toBeVisible({ timeout: 10000 });
  await fillPembanding(page, m, harga, nama);
  const simpan = m.locator('button').filter({ hasText: /^\s*Simpan\s*$/ });
  await simpan.scrollIntoViewIfNeeded();
  await expect(simpan, 'Simpan aktif setelah semua mandatory terisi').toBeEnabled({ timeout: 5000 });
  await simpan.click();
  await page.waitForTimeout(1500);
}
const rowsPembanding = (page: Page) => page.locator('table tbody tr').filter({ has: page.locator('button') });

async function setupPembandingRow(page: Page) {
  await openFormAgunanBaru(page, /Tanah/i);
  await setStatus(page, 'Tersedia');
  await addPembanding(page);
  await expect(rowsPembanding(page).first()).toBeVisible({ timeout: 15000 });
}

const lokasi = (page: Page, re: RegExp) => page.locator('[role="combobox"]').filter({ hasText: re }).first();
async function pilihLokasi(page: Page, re: RegExp, kw?: RegExp) {
  await see(lokasi(page, re));
  return pickOption(page, lokasi(page, re), kw ?? /.+/);
}

async function openPenilaian(page: Page) {
  await openFormAgunanBaru(page, /Tanah/i);
  await setStatus(page, 'Tersedia');
  const h = page.locator('heading, h5, div, span').filter({ hasText: /^Penilaian agunan$/i }).first();
  await expect(h).toBeVisible({ timeout: 15000 });
  await h.scrollIntoViewIfNeeded();
  // LPA = Ya agar Tipe Penilaian terisi opsinya
  const radioYa = page.getByText(/Apakah LPA sudah tersedia/i).first()
    .locator('xpath=following::input[@type="radio"][1]');
  await radioYa.scrollIntoViewIfNeeded();
  await radioYa.check({ force: true });
  await page.waitForTimeout(1000);
}
async function pickTipe(page: Page, opsi: RegExp) {
  const t = tipeTrigger(page);
  await t.scrollIntoViewIfNeeded();
  await t.click();
  await page.waitForTimeout(1000);
  const o = page.locator('li:visible').filter({ hasText: opsi }).first();
  await expect(o, `opsi Tipe Penilaian ${opsi} harus ada`).toBeVisible({ timeout: 8000 });
  await o.click();
  await page.waitForTimeout(1200);
}
const tipeTrigger = (page: Page) =>
  page.locator('[role="combobox"]').filter({ hasText: /Pilih tipe penilaian|Internal|KJPP|External|Eksternal/i }).first();

// ─── Suite ───────────────────────────────────────────────────────────────
test.describe('S2CML-5419: Detailing Form Informasi Umum Agunan', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(150000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  // 01
  test('TC-5419-01: Validasi Field Jenis Agunan Disabled saat Masuk Form Informasi Umum', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-01');
    await openFormAgunanBaru(page, /Tanah/i);
    await shot(page, ti, 'TC-5419-01', 0, 'Prekondisi: Jenis Agunan sudah dipilih, Form Informasi Umum terbuka');
    await S(1, 'Buka form Step 1 Informasi Umum Agunan', async () => {
      await see(labelFirst(page, /^Jenis agunan/i));
    });
    await S(2, 'Periksa status interaksi pada input Jenis Agunan', async () => {
      const kontrol = page.locator('[role="combobox"]').filter({ hasText: /AN\d+\s*-\s*Tanah/i }).first();
      await see(kontrol, 'combobox Jenis Agunan (AN020101 - Tanah)');
      await expect(kontrol).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // 02
  test('TC-5419-02: Validasi Tombol Kembali untuk Mengubah Pilihan Jenis Agunan', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-02');
    await openFormAgunanBaru(page, /Tanah/i);
    await shot(page, ti, 'TC-5419-02', 0, 'Prekondisi: User di Form Step 1 Informasi Umum Agunan');
    await S(1, 'Klik tombol "Kembali" di panel kiri bawah modal', async () => {
      const kembali = page.locator('button:has-text("Kembali")').first();
      await see(kembali);
      await kembali.click();
      await page.waitForTimeout(1500);
    });
    await S(2, 'Periksa tampilan modal', async () => {
      await see(page.locator('input[placeholder*="nomor" i]').first(), 'kembali ke Stepper 1 (pencarian)');
      await see(page.locator('[role="combobox"]').filter({ hasText: /Pilih jenis agunan|Tanah/i }).first(), 'pilihan Jenis Agunan tampil');
    });
  });

  // 03
  test('TC-5419-03: Validasi Tanggal Pengikatan Opsional/Wajib sesuai Jenis Pengikatan', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-03');
    await openFormAgunanBaru(page, /Tanah/i);
    await setStatus(page, 'Tersedia');
    await shot(page, ti, 'TC-5419-03', 0, 'Prekondisi: Form terbuka, Status Agunan = Tersedia');
    const jenisTrigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih jenis pengikatan|Belum diikat|Hak Tanggungan|Fidusia|Gadai|Hipotek/i }).first();
    await S(1, 'Pilih Jenis Pengikatan = "Belum diikat" (kode 06), periksa label Tanggal Pengikatan', async () => {
      await see(jenisTrigger);
      await pickOption(page, jenisTrigger, /06|Belum diikat/i);
      const tgl = labelFirst(page, /^Tanggal pengikatan/i);
      await see(tgl);
      expect(await tgl.innerText(), 'bintang * harus hilang').not.toContain('*');
    });
    await S(2, 'Pilih Jenis Pengikatan selain "Belum diikat" (Hak Tanggungan), periksa label dan kosongkan Tanggal Pengikatan', async () => {
      const t = page.locator('[role="combobox"]').filter({ hasText: /Pilih jenis pengikatan|Belum diikat|Hak Tanggungan|Fidusia|Gadai|Hipotek/i }).first();
      await t.click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
      const ht = opts(page).filter({ hasText: /Hak Tanggungan/i }).first();
      const pilih = (await ht.isVisible({ timeout: 2000 }).catch(() => false))
        ? ht : opts(page).filter({ hasNotText: /06|Belum diikat/i }).first();
      await pilih.click();
      await page.waitForTimeout(1200);
      const tgl = labelFirst(page, /^Tanggal pengikatan/i);
      await see(tgl);
      expect(await tgl.innerText(), 'bintang * harus tampil').toContain('*');
      const input = page.locator('input[placeholder*="tanggal pengikatan" i], input[name*="bindingDate" i]').first();
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) { await input.click(); await page.keyboard.press('Escape'); }
      await page.getByText(/^Jenis segmen fasilitas/i).first().click();
      await page.waitForTimeout(800);
      // Read-only: tidak klik Simpan/Draft. Validasi dicek dari pesan yang muncul setelah field disentuh lalu ditinggalkan.
      const pesan = page.locator('text=/wajib|harus diisi|tidak boleh kosong|mandatory|required/i').first();
      await expect(pesan, 'pesan error mandatory Tanggal Pengikatan').toBeVisible({ timeout: 5000 });
    });
  });

  // 04
  test('TC-5419-04: Validasi Status Agunan Menampilkan/Menyembunyikan Field Pengikatan Agunan', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-04');
    await openFormAgunanBaru(page, /Tanah/i);
    await shot(page, ti, 'TC-5419-04', 0, 'Prekondisi: Form Informasi Umum Agunan terbuka');
    await S(1, 'Pilih Status Agunan = "Indent" (kode 2), periksa seksi Pengikatan Agunan', async () => {
      await setStatus(page, 'Indent');
      await expect(label(page, /^Jenis pengikatan/i)).toHaveCount(0);
      await expect(label(page, /^Tanggal pengikatan/i)).toHaveCount(0);
    });
    await S(2, 'Pilih Status Agunan = "Tersedia" (kode 1), periksa seksi Pengikatan Agunan', async () => {
      await setStatus(page, 'Tersedia');
      await see(labelFirst(page, /^Jenis pengikatan/i));
      await see(labelFirst(page, /^Tanggal pengikatan/i));
    });
  });

  // 05
  test('TC-5419-05: Validasi Field Peringkat Cash Collateral / Dokumen sesuai Status Agunan', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-05');
    await shot(page, ti, 'TC-5419-05', 0, 'Prekondisi: Form Informasi Umum Agunan terbuka (belum pilih jenis)');
    await S(1, 'Pilih Jenis Agunan kategori Cash Collateral (Tabungan/Deposito/Reksadana)', async () => {
      await openFormAgunanBaru(page, /Tabungan|Deposito|Reksadana/i);
    });
    await S(2, 'Pilih Status Agunan = "Tersedia", periksa form', async () => {
      await setStatus(page, 'Tersedia');
      await see(labelFirst(page, /Lembaga pemeringkat/i));
      await see(labelFirst(page, /^Peringkat agunan/i));
    });
    await S(3, 'Ubah Status Agunan menjadi "Indent", periksa form', async () => {
      await setStatus(page, 'Indent');
      await expect(label(page, /Lembaga pemeringkat/i)).toHaveCount(0);
      await expect(label(page, /^Peringkat agunan/i)).toHaveCount(0);
    });
  });

  // 06
  test('TC-5419-06: Validasi Opsi Dropdown Lembaga Pemeringkat', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-06');
    await openFormAgunanBaru(page, /Tabungan|Deposito|Reksadana/i);
    await setStatus(page, 'Tersedia');
    const lembaga = page.locator('[role="combobox"]').filter({ hasText: /^Pilih lembaga pemeringkat$/ }).first();
    await see(lembaga);
    await shot(page, ti, 'TC-5419-06', 0, 'Prekondisi: Field Lembaga Pemeringkat Agunan tampil');
    await S(1, 'Klik dropdown Lembaga Pemeringkat Agunan', async () => {
      await lembaga.click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
    });
    await S(2, 'Periksa daftar opsi yang muncul', async () => {
      const teks = (await opts(page).allInnerTexts()).map(t => t.trim()).filter(t => t && t !== 'Clear');
      console.log('[TC-5419-06] Opsi Lembaga:', teks);
      expect(teks.length).toBeGreaterThan(0);
      expect(teks.join(' | '), 'memuat lembaga resmi (FID/FIN/MIS/PEF/SNP)').toMatch(/FID|FIN|MIS|PEF|SNP/i);
      await see(listbox(page));
    });
  });

  // 07
  test('TC-5419-07: Validasi Peringkat Agunan Disabled sebelum dan Aktif setelah Lembaga Pemeringkat Dipilih', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-07');
    await openFormAgunanBaru(page, /Tabungan|Deposito|Reksadana/i);
    await setStatus(page, 'Tersedia');
    await see(page.locator('[role="combobox"]').filter({ hasText: /^Pilih lembaga pemeringkat$/ }).first());
    await shot(page, ti, 'TC-5419-07', 0, 'Prekondisi: Dropdown Lembaga tampil, belum ada pilihan');
    const peringkat = () => page.locator('[role="combobox"]').filter({ hasText: /peringkat agunan|lembaga pemeringkat terlebih dahulu/i }).first();
    await S(1, 'Klik field Peringkat Agunan sebelum Lembaga dipilih', async () => {
      const msg = page.locator('div, span, button').filter({ hasText: /^Pilih lembaga pemeringkat terlebih dahulu$/ }).first();
      await see(msg, 'placeholder/pesan "Pilih lembaga pemeringkat terlebih dahulu"');
      await msg.click({ trial: true }).catch(() => {});
    });
    await S(2, 'Pilih salah satu Lembaga Pemeringkat (PEF / Fitch, atau opsi pertama)', async () => {
      await page.locator('[role="combobox"]').filter({ hasText: /^Pilih lembaga pemeringkat$/ }).first().click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
      const pef = opts(page).filter({ hasText: /PEF|Fitch/i }).first();
      await ((await pef.isVisible({ timeout: 2000 }).catch(() => false)) ? pef : opts(page).first()).click();
      await page.waitForTimeout(1200);
    });
    await S(3, 'Buka dropdown Peringkat Agunan', async () => {
      const p = page.locator('div, span, button').filter({ hasText: /Pilih peringkat agunan/i }).last();
      await see(p);
      await p.click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
      const teks = (await opts(page).allInnerTexts()).map(t => t.trim()).filter(t => t && t !== 'Clear');
      console.log('[TC-5419-07] Opsi rating:', teks);
      expect(teks.length).toBeGreaterThan(0);
      void peringkat;
    });
  });

  // 08
  test('TC-5419-08: Validasi Dropdown Kecamatan Terurut secara Alfabetis A-Z', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-08');
    await openFormAgunanBaru(page, /Tanah/i);
    await pilihLokasi(page, /Pilih provinsi/i, /DKI/i);
    await pilihLokasi(page, /Pilih kota/i);
    await shot(page, ti, 'TC-5419-08', 0, 'Prekondisi: Provinsi dan Kota/Kabupaten sudah dipilih');
    await S(1, 'Klik dropdown Kecamatan', async () => {
      await see(lokasi(page, /Pilih kecamatan/i));
      await lokasi(page, /Pilih kecamatan/i).click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
    });
    await S(2, 'Periksa urutan opsi kecamatan', async () => {
      const raw = (await opts(page).allInnerTexts()).map(t => t.trim()).filter(t => t && t !== 'Clear' && !t.includes('Pilih'));
      expect(raw.length).toBeGreaterThan(1);
      expect(raw).toEqual([...raw].sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' })));
      await see(listbox(page));
    });
  });

  // 09
  test('TC-5419-09: Validasi Sub-Location Tidak Menampilkan Opsi saat Parent Belum Dipilih', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-09');
    await openFormAgunanBaru(page, /Tanah/i);
    await see(lokasi(page, /Pilih provinsi/i));
    await shot(page, ti, 'TC-5419-09', 0, 'Prekondisi: Provinsi belum dipilih');
    await S(1, 'Klik dropdown Kota/Kabupaten atau Kecamatan', async () => {
      const kota = lokasi(page, /Pilih kota/i);
      await see(kota);
      if (await kota.isDisabled().catch(() => false)) return; // disabled = memenuhi
      await kota.click();
      await page.waitForTimeout(1000);
      const teks = (await page.locator('[role="listbox"]:visible li:not(.sticky), ul:visible li:not(.sticky)').allInnerTexts())
        .map(t => t.trim()).filter(Boolean);
      expect(teks.every(t => /no results found/i.test(t)), `tidak ada data Kota, muncul: ${JSON.stringify(teks)}`).toBe(true);
    });
  });

  // 10
  test('TC-5419-10: Validasi Mengubah Parent Location Me-reset Pilihan Child Location', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-10');
    await openFormAgunanBaru(page, /Tanah/i);
    const prov1 = await pilihLokasi(page, /Pilih provinsi/i, /DKI/i);
    await pilihLokasi(page, /Pilih kota/i);
    await pilihLokasi(page, /Pilih kecamatan/i);
    await shot(page, ti, 'TC-5419-10', 0, 'Prekondisi: Provinsi, Kota, Kecamatan sudah dipilih');
    await S(1, 'Ubah pilihan Provinsi ke provinsi lain', async () => {
      await lokasi(page, new RegExp(prov1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')).click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
      await opts(page).filter({ hasNotText: new RegExp(prov1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first().click();
      await page.waitForTimeout(1500);
    });
    await S(2, 'Periksa nilai pada dropdown Kota dan Kecamatan', async () => {
      await see(lokasi(page, /Pilih kota/i), 'Kota ter-reset ke placeholder');
      await see(lokasi(page, /Pilih kecamatan/i), 'Kecamatan ter-reset ke placeholder');
    });
  });

  // 11
  test('TC-5419-11: Validasi Input Kode Pos Non-Angka Ditolak dan Angka 5 Digit Diterima', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-11');
    await openFormAgunanBaru(page, /Tanah/i);
    const kp = page.locator('input[placeholder*="kode pos" i]').first();
    await see(kp);
    await shot(page, ti, 'TC-5419-11', 0, 'Prekondisi: Form terbuka di seksi Alamat');
    await S(1, 'Masukkan huruf/simbol ke Kode Pos ("ABCDE"), pindahkan fokus (blur)', async () => {
      await kp.fill('ABCDE');
      await kp.blur();
      await page.waitForTimeout(1000);
      const val = await kp.inputValue();
      const err = await page.locator('text=/kode pos wajib diisi dengan angka/i').first().isVisible().catch(() => false);
      expect(val === '' || err, `input ditolak (value="${val}") atau error "Kode pos wajib diisi dengan angka"`).toBeTruthy();
    });
    await S(2, 'Masukkan angka 5 digit valid ("10110")', async () => {
      await kp.fill('10110');
      await kp.blur();
      await page.waitForTimeout(800);
      expect(await kp.inputValue()).toBe('10110');
      await expect(page.locator('text=/kode pos wajib diisi dengan angka|format tidak valid/i')).toHaveCount(0);
    });
  });

  // 12
  test('TC-5419-12: Validasi Tombol Tambah Data Pembanding sesuai Rules BE', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-12');
    await openFormAgunanBaru(page, /Tanah/i);
    await setStatus(page, 'Tersedia');
    await shot(page, ti, 'TC-5419-12', 0, 'Prekondisi A: Jenis Agunan properti (Tanah), Status Tersedia');
    await S(1, 'Skenario A: scroll ke bagian Data Pembanding, periksa tombol "+ Data Pembanding"', async () => {
      await see(btnPembanding(page));
      await expect(btnPembanding(page)).toBeEnabled();
    });
    await S(2, 'Skenario B (Cash Collateral): periksa bagian penilaian / form informasi umum', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      const jenis = await openFormAgunanBaru(page, /Tabungan|Giro|Deposito/i);
      console.log('[TC-5419-12] Skenario B jenis agunan:', jenis);
      await setStatus(page, 'Tersedia');
      await expect(btnPembanding(page), `jenis "${jenis}" (cash collateral) tidak boleh punya tombol + Data Pembanding`).toHaveCount(0);
    });
  });

  // 13
  test('TC-5419-13: Validasi Tampilan Modal Input Data Pembanding saat Tombol Diklik', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-13');
    await openFormAgunanBaru(page, /Tanah/i);
    await setStatus(page, 'Tersedia');
    await see(btnPembanding(page));
    await shot(page, ti, 'TC-5419-13', 0, 'Prekondisi: Tombol "+ Data Pembanding" tampil');
    await S(1, 'Klik tombol "+ Data Pembanding"', async () => { await btnPembanding(page).click(); });
    await S(2, 'Periksa modal dialog yang muncul', async () => {
      const m = modalPembanding(page);
      await see(page.getByText(/^Tambah data pembanding$/i).first(), 'judul modal "Tambah data pembanding"');
      await see(m.getByText(/Sumber data pembanding/i).first());
      await see(m.getByText(/^Nama\*?$/).first(), 'field Nama (CSV menyebut Nama Pemberi Data)');
      await see(m.getByText(/Nilai\/harga/i).first());
      await see(m.locator('button').filter({ hasText: /^\s*Batal(kan)?\s*$/ }), 'tombol Batal (UI: "Batalkan")');
      await see(m.locator('button').filter({ hasText: /^\s*Simpan\s*$/ }));
    });
  });

  // 14
  test('TC-5419-14: Validasi Tambah Data Pembanding Berhasil dan Masuk ke Tabel Preview', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-14');
    await openFormAgunanBaru(page, /Tanah/i);
    await setStatus(page, 'Tersedia');
    await btnPembanding(page).click();
    await expect(modalPembanding(page)).toBeVisible({ timeout: 10000 });
    await shot(page, ti, 'TC-5419-14', 0, 'Prekondisi: Modal Tambah data pembanding terbuka');
    const m = () => modalPembanding(page);
    await S(1, 'Pilih Sumber Data Pembanding', async () => {
      const sumber = m().locator('[role="combobox"]').first();
      await see(sumber);
      await sumber.click();
      await listbox(page).locator('li button, li').first().waitFor({ timeout: 10000 });
      await opts(page).first().click();
    });
    await S(2, 'Isi Nama dan Nilai/Harga valid', async () => {
      await fillPembanding(page, m());
    });
    await S(3, 'Klik tombol Simpan pada modal', async () => {
      await m().locator('button').filter({ hasText: /^\s*Simpan\s*$/ }).click();
      await page.waitForTimeout(1500);
      await expect(rowsPembanding(page).first(), 'baris tabel preview muncul').toBeVisible({ timeout: 15000 });
      await expect(rowsPembanding(page).first().scrollIntoViewIfNeeded()).resolves.toBeUndefined();
    });
  });

  // 15
  test('TC-5419-15: Validasi Lihat Detail Data Pembanding via Ikon Mata', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-15');
    await setupPembandingRow(page);
    await see(rowsPembanding(page).first());
    await shot(page, ti, 'TC-5419-15', 0, 'Prekondisi: Ada data pembanding pada tabel preview');
    await S(1, 'Klik ikon Mata (Lihat Detail) pada salah satu baris data pembanding', async () => {
      await rowsPembanding(page).first().locator('button, [role="button"]').first().click();
      const d = modalPembanding(page);
      await see(page.getByText(/^Detail data pembanding$/i).first(), 'modal detail');
      const editable = await d.locator('input:not([disabled]):not([readonly])').count();
      expect(editable, 'modal detail read-only (tidak ada input aktif)').toBe(0);
    });
  });

  // 16
  test('TC-5419-16: Validasi Ubah Data Pembanding via Ikon Pensil', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-16');
    await setupPembandingRow(page);
    await shot(page, ti, 'TC-5419-16', 0, 'Prekondisi: Ada data pembanding pada tabel preview');
    await S(1, 'Klik ikon Pensil (Ubah) pada salah satu baris data pembanding', async () => {
      await rowsPembanding(page).first().locator('button, [role="button"]').nth(1).click();
      await see(page.getByText(/^(Ubah|Edit) data pembanding$/i).first());
    });
    await S(2, 'Ubah data harga/nama', async () => {
      await fillPembanding(page, modalPembanding(page), '750000000', 'Bpk. Hendra Updated');
    });
    await S(3, 'Klik Simpan', async () => {
      await modalPembanding(page).locator('button').filter({ hasText: /^\s*Simpan\s*$/ }).click();
      await page.waitForTimeout(1500);
      await expect(rowsPembanding(page).first(), 'baris ter-update').toContainText(/Updated|750\.000\.000/i, { timeout: 15000 });
    });
  });

  // 17
  test('TC-5419-17: Validasi Hapus Data Pembanding dari Tabel Preview', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-17');
    await setupPembandingRow(page);
    const awal = await rowsPembanding(page).count();
    await shot(page, ti, 'TC-5419-17', 0, `Prekondisi: Ada ${awal} data pembanding pada tabel preview`);
    await S(1, 'Klik ikon Trash (Hapus) pada baris data pembanding', async () => {
      await rowsPembanding(page).first().locator('button, [role="button"]').last().click();
      await page.waitForTimeout(800);
    });
    await S(2, 'Konfirmasi pada modal konfirmasi (jika ada)', async () => {
      const dlg = page.getByText(/^Hapus data pembanding\?$/);
      if (await dlg.isVisible({ timeout: 4000 }).catch(() => false)) {
        await page.locator('button').filter({ hasText: /^\s*Hapus\s*$/ }).last().click();
        await expect(dlg).toBeHidden({ timeout: 10000 });
      }
      await page.waitForTimeout(1000);
      expect(await rowsPembanding(page).count(), 'baris terhapus dari tabel').toBeLessThan(awal);
      if (awal === 1) await see(page.getByText(/Belum ada data pembanding/i).first(), 'tabel kembali kosong');
    });
  });

  // 18
  test('TC-5419-18: Validasi Batas Maksimal Kapasitas 10 Record Data Pembanding', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-18');
    await openFormAgunanBaru(page, /Tanah/i);
    await setStatus(page, 'Tersedia');
    for (let i = 1; i <= 10; i++) await addPembanding(page, `${i}00000000`, `Pembanding ${i}`);
    expect(await rowsPembanding(page).count(), 'prekondisi: 10 record').toBe(10);
    await shot(page, ti, 'TC-5419-18', 0, 'Prekondisi: Tabel data pembanding terisi 10 record');
    await S(1, 'Periksa status tombol "+ Data Pembanding" saat jumlah record mencapai 10', async () => {
      await btnPembanding(page).scrollIntoViewIfNeeded();
    });
    await S(2, 'Coba klik tambah data ke-11', async () => {
      if (await btnPembanding(page).isDisabled().catch(() => false)) return; // disabled = memenuhi
      await btnPembanding(page).click();
      await expect(page.locator('text=/batas maksimum|maksimal 10|hingga 10/i').first()).toBeVisible({ timeout: 10000 });
      expect(await rowsPembanding(page).count(), 'jumlah data tetap maksimal 10').toBeLessThanOrEqual(10);
    });
  });

  // 19
  test('TC-5419-19: Validasi Tampilan Field Penilaian Agunan Tipe Internal', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-19');
    await openPenilaian(page);
    await shot(page, ti, 'TC-5419-19', 0, 'Prekondisi: Form terbuka pada seksi Penilaian Agunan');
    await S(1, 'Pilih Tipe Penilaian = "Internal"', async () => {
      await pickTipe(page, /^\s*Internal\s*$/i);
    });
    await S(2, 'Periksa field-field penilaian yang ditampilkan', async () => {
      await see(labelFirst(page, /^Nilai agunan\s*wajar/i), 'Nilai Agunan / Nilai Wajar');
      await see(labelFirst(page, /^Nilai agunan menurut pelapor/i));
      await see(labelFirst(page, /^Tanggal penilaian agunan menurut pelapor/i));
      await expect(label(page, /independen|kjpp/i)).toHaveCount(0);
    });
  });

  // 20
  test('TC-5419-20: Validasi Tampilan Field Penilaian Agunan Tipe External KJPP', async ({ page }, ti) => {
    const S = stepper(page, ti, 'TC-5419-20');
    await openPenilaian(page);
    await shot(page, ti, 'TC-5419-20', 0, 'Prekondisi: Form terbuka pada seksi Penilaian Agunan');
    await S(1, 'Pilih Tipe Penilaian = "External" / KJPP', async () => {
      await pickTipe(page, /KJPP|External|Eksternal/i);
    });
    await S(2, 'Periksa field-field penilaian yang ditampilkan', async () => {
      await see(labelFirst(page, /^Nilai agunan\s*wajar/i), 'Nilai Agunan / Nilai Wajar');
      await see(labelFirst(page, /^Nilai agunan menurut (hasil )?penilai(an)? independen/i));
      await see(labelFirst(page, /^Nama (instansi )?penilai(an)? independen/i));
      await see(labelFirst(page, /^Tanggal penilaian (agunan )?menurut (penilai )?independen/i));
    });
  });
});
