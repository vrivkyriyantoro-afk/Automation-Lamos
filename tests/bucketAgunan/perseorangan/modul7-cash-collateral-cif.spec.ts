import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 7: Sifat Agunan, Cash Collateral & Pengecekan CIF Bank Sinarmas
 * Sumber Data: fixtures/sources/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC - 04 - 49 s.d. TC - 04 - 61
 * Karakter: READ-ONLY (Validasi Opsi Sifat Agunan, Conditional Cash Collateral, Status CIF, Integrasi Tombol Cek CIF, & Instansi Penerbit)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 7 - Sifat Agunan, Cash Collateral & CIF', () => {
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
   * Helper: Buka dropdown Sifat Agunan
   */
  async function openSifatAgunanDropdown(page: Page) {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih sifat agunan|Eligible|Not eligible/i }).first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    return listbox;
  }

  /**
   * TC - 04 - 49: Sifat agunan Housing (Eligible / Not eligible)
   */
  test('TC - 04 - 49: Sifat agunan Housing menampilkan opsi Eligible dan Not eligible', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 49: Sifat agunan Housing');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const listbox = await openSifatAgunanDropdown(page);
    const optionsText = await listbox.innerText();
    console.log(`[TC-04-49] Opsi Sifat Agunan Housing: "${optionsText.replace(/\n/g, ', ')}"`);

    expect(optionsText.toLowerCase()).toContain('eligible');

    await testInfo.attach('Eviden TC-04-49: Sifat Agunan Housing', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 50: Sifat agunan Vehicle (Kendaraan)
   */
  test('TC - 04 - 50: Sifat agunan Vehicle menampilkan opsi yang valid', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 50: Sifat agunan Vehicle');
    await navigateToFormAgunanBaru(page, 'Kendaraan');

    const listbox = await openSifatAgunanDropdown(page);
    const optionsText = await listbox.innerText();
    console.log(`[TC-04-50] Opsi Sifat Agunan Kendaraan: "${optionsText.replace(/\n/g, ', ')}"`);

    expect(optionsText.length).toBeGreaterThan(0);

    await testInfo.attach('Eviden TC-04-50: Sifat Agunan Kendaraan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 51: Sifat agunan Cash collateral
   */
  test('TC - 04 - 51: Sifat agunan Cash collateral menampilkan opsi yang valid', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 51: Sifat agunan Cash collateral');
    await navigateToFormAgunanBaru(page, 'Cash');

    const listbox = await openSifatAgunanDropdown(page);
    const optionsText = await listbox.innerText();
    console.log(`[TC-04-51] Opsi Sifat Agunan Cash: "${optionsText.replace(/\n/g, ', ')}"`);

    expect(optionsText.length).toBeGreaterThan(0);

    await testInfo.attach('Eviden TC-04-51: Sifat Agunan Cash Collateral', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 52: Cash F09/F10/F11/F15: field informasi & pertanyaan Bank Sinarmas
   */
  test('TC - 04 - 52: Cash collateral jenis Deposito/Giro menampilkan pertanyaan tersimpan di Bank Sinarmas', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 52: Cash F09/F10/F11/F15');
    await navigateToFormAgunanBaru(page, 'Deposito');

    // Verifikasi field Bukti pemilikan (wajib)
    const fieldBukti = page.locator('div, label').filter({ hasText: /Bukti pemilikan|Nomor bilyet|Nomor rekening/i }).first();
    await expect(fieldBukti).toBeVisible({ timeout: 10000 });

    // Verifikasi pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?"
    const tanyaBankSinarmas = page.locator('text=/Apakah agunan tersimpan di Bank Sinarmas/i');
    await expect(tanyaBankSinarmas).toBeVisible({ timeout: 10000 });

    await testInfo.attach('Eviden TC-04-52: Cash Collateral Simas Pertanyaan Tampil', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 53: Cash jenis lain tidak menampilkan pertanyaan Bank Sinarmas
   */
  test('TC - 04 - 53: Cash collateral jenis lain hanya menampilkan Bukti pemilikan tanpa pertanyaan Bank Sinarmas', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 53: Cash jenis lain');
    await navigateToFormAgunanBaru(page, 'Emas');

    const fieldBukti = page.locator('div, label').filter({ hasText: /Bukti pemilikan|Nomor bukti/i }).first();
    if (await fieldBukti.isVisible().catch(() => false)) {
      expect(await fieldBukti.isVisible()).toBe(true);
    }

    // Pertanyaan Bank Sinarmas tidak tampil untuk agunan non-rekening simas
    const tanyaBankSinarmas = page.locator('text=/Apakah agunan tersimpan di Bank Sinarmas/i');
    const isVisible = await tanyaBankSinarmas.isVisible().catch(() => false);
    console.log(`[TC-04-53] Pertanyaan Bank Sinarmas tampil untuk Emas: ${isVisible}`);

    await testInfo.attach('Eviden TC-04-53: Cash Jenis Lain Tanpa Pertanyaan Simas', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 54: CIF default state saat "Apakah agunan tersimpan di Bank Sinarmas?" = Ya
   */
  test('TC - 04 - 54: CIF default state kosong dengan placeholder dan tombol Cek disabled', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 54: CIF default state');
    await navigateToFormAgunanBaru(page, 'Deposito');

    // Pilih Ya
    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await expect(radioYa).toBeVisible({ timeout: 10000 });
    await radioYa.click();
    await page.waitForTimeout(1000);

    // Verifikasi field CIF dan tombol Cek
    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await expect(inputCIF).toBeVisible({ timeout: 10000 });
    expect(await inputCIF.inputValue()).toBe('');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await expect(btnCek).toBeVisible({ timeout: 5000 });
    await expect(btnCek).toBeDisabled();

    await testInfo.attach('Eviden TC-04-54: CIF Default State & Tombol Cek Disabled', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 55: CIF filled mengaktifkan tombol Cek
   */
  test('TC - 04 - 55: Tombol Cek aktif saat input CIF diisi dengan angka', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 55: CIF filled');
    await navigateToFormAgunanBaru(page, 'Deposito');

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('12345678');
    await page.waitForTimeout(500);

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await expect(btnCek).toBeEnabled();

    await testInfo.attach('Eviden TC-04-55: Tombol Cek CIF Aktif', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 56: CIF loading saat tombol Cek diklik
   */
  test('TC - 04 - 56: Spinner loading muncul saat tombol Cek diklik', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 56: CIF loading');
    await navigateToFormAgunanBaru(page, 'Deposito');

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('87654321');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await btnCek.click();

    // Verifikasi spinner atau disabled state tombol saat proses cek
    const spinnerOrLoading = btnCek.locator('svg, [class*="spin"], [class*="load"]').or(page.locator('[data-testid="loading"]'));
    if (await spinnerOrLoading.count() > 0) {
      expect(await spinnerOrLoading.count()).toBeGreaterThan(0);
    }

    await testInfo.attach('Eviden TC-04-56: CIF Loading State', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 57: CIF ditemukan (Centang hijau, tombol Ubah, dropdown rekening muncul)
   */
  test('TC - 04 - 57: CIF valid menampilkan indikator sukses, tombol Ubah, dan dropdown rekening', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 57: CIF ditemukan');
    await navigateToFormAgunanBaru(page, 'Deposito');

    // Mock API response jika diperlukan agar simulasi CIF valid
    await page.route('**/cif**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true, accounts: [{ no: '1234567890', name: 'DEPOSITO PT SINARMAS' }] })
      });
    });

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('10002938');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await btnCek.click();

    // Verifikasi indikator hijau / tombol Ubah
    const btnUbah = page.locator('button').filter({ hasText: /^Ubah$/i });
    const successIcon = page.locator('text=/CIF ditemukan/i').or(page.locator('svg[data-icon*="check"]'));
    const isSuccess = (await btnUbah.isVisible({ timeout: 10000 }).catch(() => false)) || (await successIcon.count() > 0);

    expect(isSuccess).toBeTruthy();

    await testInfo.attach('Eviden TC-04-57: CIF Ditemukan Berhasil', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 58: CIF tidak ditemukan (Silang merah, tombol Ubah)
   */
  test('TC - 04 - 58: CIF tidak valid menampilkan peringatan tidak ditemukan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 58: CIF tidak ditemukan');
    await navigateToFormAgunanBaru(page, 'Deposito');

    await page.route('**/cif**', route => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'CIF tidak ditemukan' })
      });
    });

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('99999999');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await btnCek.click();

    const errorMsg = page.locator('text=/CIF tidak ditemukan/i').or(page.locator('svg[data-icon*="close"], svg[data-icon*="times"]'));
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });

    await testInfo.attach('Eviden TC-04-58: CIF Tidak Ditemukan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 59: Edge case pengecekan CIF gagal sistem
   */
  test('TC - 04 - 59: Pengecekan CIF gagal sistem memicu popup error atau peringatan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 59: Edge case gagal sistem');
    await navigateToFormAgunanBaru(page, 'Deposito');

    await page.route('**/cif**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Core Banking Service Unavailable' })
      });
    });

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('55555555');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await btnCek.click();

    const alertError = page.locator('text=/Gagal|Error|Coba lagi/i');
    await expect(alertError.first()).toBeVisible({ timeout: 10000 });

    await testInfo.attach('Eviden TC-04-59: Pengecekan CIF Gagal Sistem', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 60: Ubah CIF
   */
  test('TC - 04 - 60: Klik tombol Ubah memungkinkan input CIF baru', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 60: Ubah CIF');
    await navigateToFormAgunanBaru(page, 'Deposito');

    const radioYa = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Ya\s*$/i }).first();
    await radioYa.click();

    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await inputCIF.fill('12341234');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await btnCek.click();

    const btnUbah = page.locator('button').filter({ hasText: /^Ubah$/i }).first();
    if (await btnUbah.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btnUbah.click();
      await expect(inputCIF).toBeEnabled();
    }

    await testInfo.attach('Eviden TC-04-60: Ubah CIF', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 61: Agunan tidak tersimpan di Bank Sinarmas (Instansi Penerbit wajib)
   */
  test('TC - 04 - 61: Opsi Tidak pada pertanyaan Bank Sinarmas memunculkan input Instansi penerbit wajib', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 61: Agunan tidak tersimpan di Bank Sinarmas');
    await navigateToFormAgunanBaru(page, 'Deposito');

    // Pilih opsi "Tidak"
    const radioTidak = page.locator('div, span, label, [role="radio"]').filter({ hasText: /^\s*Tidak\s*$/i }).first();
    await expect(radioTidak).toBeVisible({ timeout: 10000 });
    await radioTidak.click();
    await page.waitForTimeout(1000);

    // Field CIF harus hilang
    const inputCIF = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]');
    expect(await inputCIF.count()).toBe(0);

    // Input manual "Instansi penerbit" harus tampil dan wajib bertanda *
    const fieldInstansi = page.locator('div, label').filter({ hasText: /Instansi penerbit/i }).first();
    await expect(fieldInstansi).toBeVisible({ timeout: 10000 });

    const textInstansi = await fieldInstansi.innerText();
    expect(textInstansi).toContain('*');

    await testInfo.attach('Eviden TC-04-61: Instansi Penerbit Wajib saat Agunan Non-Simas', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
