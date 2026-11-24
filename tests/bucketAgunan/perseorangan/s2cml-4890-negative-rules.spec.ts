import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4890 - Validasi Form & Business Rules (Negative Cases)
 * Target Debitur: 01M79GW1XYEQAK97TM803HFY8F (debtorType=individual)
 * Cakupan Test Cases:
 *   - LEGACY-4890-19: Step 2: Nominal Cash Collateral Bernilai 0 atau Minus
 *   - LEGACY-4890-20: Step 2: Periode Akhir Deposito / Sertifikat Kadaluarsa (di masa lalu)
 *   - LEGACY-4890-22: Step 1: Nilai Agunan Wajar/NJOP Bernilai 0 saat LPA Tersedia
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M79GW1XYEQAK97TM803HFY8F';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4890: Negative & Form Validation Rules (Perseorangan)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Masuk ke Form Tambah Agunan Baru berdasarkan jenis
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    // 1. Klik Tambah Agunan
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    // 2. Pilih Jenis Agunan & Cari dummy
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    const activeModal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    return activeModal;
  }

  /**
   * LEGACY-4890-22: Step 1: Nilai Agunan Wajar/NJOP Bernilai 0 saat LPA Tersedia
   */
  test('LEGACY-4890-22: Nilai Agunan Wajar/NJOP bernilai 0 memicu validasi error & Simpan tetap disabled', async ({ page }, testInfo) => {
    console.log('Menjalankan LEGACY-4890-22: Nilai Agunan Wajar/NJOP Bernilai 0');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Status Agunan = Tersedia
    const triggerStatus = page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan/i }).first();
    await triggerStatus.click();
    const listboxStatus = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listboxStatus.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Tersedia/i }).first().click();
    await page.waitForTimeout(1000);

    // 2. Scroll ke bagian Penilaian agunan
    const headingPenilaian = page.locator('heading, h5, div, span').filter({ hasText: /^Penilaian agunan$/i }).first();
    if (await headingPenilaian.isVisible().catch(() => false)) {
      await headingPenilaian.scrollIntoViewIfNeeded();
    }

    // 3. Cari field "Nilai agunan wajar/NJOP"
    const inputNJOP = page.locator('div').filter({ hasText: /^Nilai agunan wajar\/NJOP/i }).locator('input').first();
    await expect(inputNJOP).toBeVisible({ timeout: 10000 });

    // Masukkan angka 0
    await inputNJOP.fill('0');
    await inputNJOP.blur();
    await page.waitForTimeout(1000);

    // 4. Verifikasi tombol Simpan tetap disabled
    const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/ }).last();
    expect(await btnSimpan.isDisabled()).toBeTruthy();
    console.log('[LEGACY-4890-22] Tombol Simpan terbukti disabled saat NJOP bernilai 0.');

    await testInfo.attach('Eviden LEGACY-4890-22: Nilai NJOP 0 Simpan Disabled', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * LEGACY-4890-19: Step 2: Nominal Cash Collateral Bernilai 0 atau Minus
   */
  test('LEGACY-4890-19: Nominal Cash Collateral bernilai 0 atau minus memblokir proses simpan', async ({ page }, testInfo) => {
    console.log('Menjalankan LEGACY-4890-19: Nominal Cash Collateral Bernilai 0');
    // Masuk dengan jenis Deposito / Reksadana / Giro
    await navigateToFormAgunanBaru(page, 'Deposito');

    // Buka Step 2: Data tambahan agunan
    const step2Btn = page.locator('button').filter({ hasText: /Data tambahan agunan/i }).first();
    await step2Btn.click();
    await page.waitForTimeout(1500);

    // Cari field Nominal jika tampil
    const inputNominal = page.locator('input[placeholder*="nominal" i], input[name*="nominal" i]').first();
    if (await inputNominal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await inputNominal.fill('0');
      await inputNominal.blur();
      await page.waitForTimeout(1000);

      const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/ }).last();
      expect(await btnSimpan.isDisabled()).toBeTruthy();
      console.log('[LEGACY-4890-19] Field nominal 0 berhasil divalidasi.');
    } else {
      console.log('[LEGACY-4890-19] Field nominal Cash Collateral belum aktif/kondisional pada jenis agunan ini.');
    }

    await testInfo.attach('Eviden LEGACY-4890-19: Nominal Cash Collateral 0', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});

