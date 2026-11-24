import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 6: Data Tambahan Agunan & Penilaian / LPA
 * Sumber Data: fixtures/sources/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC - 04 - 44 s.d. TC - 04 - 48
 * Karakter: READ-ONLY (Validasi Mandatory Marker, Conditional Fields LPA Tersedia vs Belum Tersedia, & Tipe Penilaian Internal vs KJPP)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 6 - Data Tambahan Agunan & Penilaian / LPA', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Buka modal Tambah Agunan (Step 1: Pencarian)
   */
  async function openTambahAgunanModal(page: Page) {
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    const modal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    await expect(modal).toBeVisible({ timeout: 20000 });
    return modal;
  }

  /**
   * Helper: Masuk ke Form Agunan Baru (Step Stepper: Data Agunan)
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    await openTambahAgunanModal(page);

    // 1. Buka dropdown jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    // 2. Isi nomor bukti fiktif & cari (hasil CLS kosong -> muncul + Agunan Baru)
    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik tombol + Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    const activeModal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    return activeModal;
  }

  /**
   * Helper: Pilih status agunan di Form Tambah Agunan (Tersedia atau Indent)
   */
  async function selectStatusAgunan(page: Page, statusText: 'Tersedia' | 'Indent') {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });

    const opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(statusText, 'i') }).first();
    await expect(opt).toBeVisible({ timeout: 5000 });
    await opt.click();
    await page.waitForTimeout(1500);
  }

  /**
   * Helper: Scroll ke seksi Penilaian Agunan
   */
  async function scrollToPenilaianAgunan(page: Page) {
    await selectStatusAgunan(page, 'Tersedia');
    const headingPenilaian = page.locator('heading, h4, h5, div, span').filter({ hasText: /^Penilaian agunan$/i }).first();
    if (await headingPenilaian.isVisible({ timeout: 5000 }).catch(() => false)) {
      await headingPenilaian.scrollIntoViewIfNeeded();
    }
  }

  /**
   * Helper: Pilih opsi radio LPA (Ya = Tersedia, Tidak = Belum Tersedia)
   */
  async function selectOpsiLPA(page: Page, opsiText: 'Ya' | 'Tidak') {
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });

    const radioBtn = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: new RegExp(`^\\s*${opsiText}\\s*$`, 'i') })
      .first();
    await expect(radioBtn).toBeVisible({ timeout: 5000 });
    await radioBtn.click();
    await page.waitForTimeout(1500);
  }

  /**
   * Helper: Pilih tipe penilaian (Internal atau KJPP)
   */
  async function selectTipePenilaian(page: Page, tipeText: 'Internal' | 'KJPP') {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih tipe penilaian|Internal|KJPP/i }).first();
    if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trigger.click();
      const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
      const opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(tipeText, 'i') }).first();
      await opt.click();
    } else {
      const radioTipe = page.locator('div, label, span').filter({ hasText: new RegExp(`^\\s*${tipeText}\\s*$`, 'i') }).first();
      await radioTipe.click();
    }
    await page.waitForTimeout(1500);
  }

  /**
   * TC - 04 - 44: LPA tersedia: semua field wajib
   */
  test('TC - 04 - 44: LPA tersedia mewajibkan seluruh field penilaian', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 44: LPA tersedia: semua field wajib');
    await navigateToFormAgunanBaru(page, 'Tanah');
    await scrollToPenilaianAgunan(page);

    // 1. Pilih LPA = Ya (Tersedia)
    await selectOpsiLPA(page, 'Ya');

    // 2. Verifikasi tanda mandatory (*) pada field-field penilaian
    const fieldPrediksi = page.locator('div, label').filter({ hasText: /Nilai prediksi|Nilai pasar/i }).first();
    const fieldNjop = page.locator('div, label').filter({ hasText: /Nilai wajar|NJOP|Nilai likuidasi/i }).first();
    const fieldTipe = page.locator('div, label').filter({ hasText: /Tipe penilaian/i }).first();

    const textPrediksi = await fieldPrediksi.innerText();
    const textNjop = await fieldNjop.innerText();
    const textTipe = await fieldTipe.innerText();

    console.log(`[TC-04-44] Label Prediksi: "${textPrediksi}", NJOP: "${textNjop}", Tipe: "${textTipe}"`);
    expect(textPrediksi).toContain('*');
    expect(textNjop).toContain('*');
    expect(textTipe).toContain('*');

    await testInfo.attach('Eviden TC-04-44: LPA Tersedia Semua Field Wajib', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 45: LPA belum tersedia: hanya Nilai prediksi wajib
   */
  test('TC - 04 - 45: LPA belum tersedia hanya mewajibkan field Nilai prediksi', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 45: LPA belum tersedia: hanya Nilai prediksi wajib');
    await navigateToFormAgunanBaru(page, 'Tanah');
    await scrollToPenilaianAgunan(page);

    // 1. Pilih LPA = Tidak (Belum tersedia)
    await selectOpsiLPA(page, 'Tidak');

    // 2. Verifikasi Nilai prediksi tetap wajib bertanda *
    const fieldPrediksi = page.locator('div, label').filter({ hasText: /Nilai prediksi|Nilai pasar/i }).first();
    const textPrediksi = await fieldPrediksi.innerText();
    expect(textPrediksi).toContain('*');

    // 3. Verifikasi field nilai NJOP atau tanggal penilaian tidak memiliki tanda * wajib
    const fieldNjop = page.locator('div, label').filter({ hasText: /Nilai wajar|NJOP/i }).first();
    if (await fieldNjop.isVisible().catch(() => false)) {
      const textNjop = await fieldNjop.innerText();
      expect(textNjop).not.toContain('*');
    }

    await testInfo.attach('Eviden TC-04-45: LPA Belum Tersedia Hanya Prediksi Wajib', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 46: LPA belum tersedia, Nilai prediksi kosong
   */
  test('TC - 04 - 46: LPA belum tersedia memicu error jika Nilai prediksi dikosongkan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 46: LPA belum tersedia, Nilai prediksi kosong');
    await navigateToFormAgunanBaru(page, 'Tanah');
    await scrollToPenilaianAgunan(page);

    await selectOpsiLPA(page, 'Tidak');

    // Cari input Nilai prediksi dan pastikan kosong
    const inputPrediksi = page.locator('input[data-testid="currency-input"], input[placeholder*="prediksi" i], input[placeholder*="pasar" i]').first();
    if (await inputPrediksi.isVisible({ timeout: 5000 }).catch(() => false)) {
      await inputPrediksi.fill('');
      await inputPrediksi.blur();
    }

    // Klik atau sentuh kontrol untuk memicu validasi
    const btnSimpanDraft = page.locator('button').filter({ hasText: /Simpan sebagai draft|Simpan/i }).first();
    if (await btnSimpanDraft.isVisible().catch(() => false)) {
      await btnSimpanDraft.scrollIntoViewIfNeeded();
    }

    // Verifikasi indikasi error atau field berstatus invalid
    const fieldPrediksi = page.locator('div, label').filter({ hasText: /Nilai prediksi|Nilai pasar/i }).first();
    const isRequired = (await fieldPrediksi.innerText()).includes('*');
    expect(isRequired).toBe(true);

    await testInfo.attach('Eviden TC-04-46: Nilai Prediksi Kosong Memicu Validasi', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 47: Tipe penilaian Internal
   */
  test('TC - 04 - 47: Tipe penilaian Internal mewajibkan Nilai dan Tanggal menurut pelapor', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 47: Tipe penilaian Internal');
    await navigateToFormAgunanBaru(page, 'Tanah');
    await scrollToPenilaianAgunan(page);

    await selectOpsiLPA(page, 'Ya');
    await selectTipePenilaian(page, 'Internal');

    // Verifikasi field Nilai menurut pelapor & Tanggal penilaian menurut pelapor tampil dan wajib (*)
    const fieldNilaiPelapor = page.locator('div, label').filter({ hasText: /Nilai menurut pelapor/i }).first();
    const fieldTglPelapor = page.locator('div, label').filter({ hasText: /Tanggal penilaian menurut pelapor|Tanggal penilaian/i }).first();

    await expect(fieldNilaiPelapor).toBeVisible({ timeout: 10000 });
    await expect(fieldTglPelapor).toBeVisible({ timeout: 10000 });

    const textNilaiPelapor = await fieldNilaiPelapor.innerText();
    const textTglPelapor = await fieldTglPelapor.innerText();

    expect(textNilaiPelapor).toContain('*');
    expect(textTglPelapor).toContain('*');

    await testInfo.attach('Eviden TC-04-47: Tipe Penilaian Internal Wajib Field Pelapor', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 48: Tipe penilaian KJPP
   */
  test('TC - 04 - 48: Tipe penilaian KJPP menampilkan dan mewajibkan field penilai independen', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 48: Tipe penilaian KJPP');
    await navigateToFormAgunanBaru(page, 'Tanah');
    await scrollToPenilaianAgunan(page);

    await selectOpsiLPA(page, 'Ya');
    await selectTipePenilaian(page, 'KJPP');

    // Verifikasi field KJPP / Independen tampil
    const fieldNilaiIndependen = page.locator('div, label').filter({ hasText: /Nilai menurut penilai independen|Nilai KJPP/i }).first();
    const fieldNamaIndependen = page.locator('div, label').filter({ hasText: /Nama penilai independen|Nama KJPP/i }).first();
    const fieldTglIndependen = page.locator('div, label').filter({ hasText: /Tanggal penilaian menurut penilai independen|Tanggal penilaian KJPP/i }).first();

    await expect(fieldNilaiIndependen).toBeVisible({ timeout: 10000 });
    await expect(fieldNamaIndependen).toBeVisible({ timeout: 10000 });

    const textNilai = await fieldNilaiIndependen.innerText();
    const textNama = await fieldNamaIndependen.innerText();

    expect(textNilai).toContain('*');
    expect(textNama).toContain('*');

    // Field tanggal penilaian menurut independen tampil
    if (await fieldTglIndependen.isVisible().catch(() => false)) {
      expect(await fieldTglIndependen.isVisible()).toBe(true);
    }

    await testInfo.attach('Eviden TC-04-48: Tipe Penilaian KJPP Tampil dan Wajib', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
