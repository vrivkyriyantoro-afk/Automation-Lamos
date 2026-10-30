import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4890 - Validasi Debitur Badan Usaha
 * Target Debitur: 01M482PRSVH5ZMTVZX5QH0VDNZ (debtorType=business)
 * Cakupan: TC-4890-BU-01 (Kategori Pemilik Agunan khusus Badan Usaha)
 */

const TARGET_BUSINESS_ID = '01M482PRSVH5ZMTVZX5QH0VDNZ';
const TARGET_URL = `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/${TARGET_BUSINESS_ID}/create?bucket=agunan&debtorType=business`;

test.describe('S2CML-4890: Validasi Agunan Debitur Badan Usaha (01M482PRSVH5ZMTVZX5QH0VDNZ)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Buka modal Tambah Agunan (Pencarian)
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
   * Helper: Masuk ke Form Agunan Baru pada Debitur Badan Usaha
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    await openTambahAgunanModal(page);

    // 1. Pilih jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    // 2. Isi nomor bukti fiktif & cari
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

  test('TC-4890-BU-01: Validasi form modal Agunan dan stepper pada Debitur Badan Usaha', async ({ page }, testInfo) => {
    console.log(`[TC-4890-BU-01] Menjalankan pengujian pada Debitur Badan Usaha: ${TARGET_BUSINESS_ID}`);
    const modal = await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Verifikasi Stepper 3-Step hadir pada debitur Badan Usaha
    const stepButtons = page.locator('button').filter({ hasText: /Informasi umum agunan|Data tambahan agunan|Informasi kepemilikan/i });
    expect(await stepButtons.count()).toBe(3);

    const step1Text = await stepButtons.nth(0).innerText();
    const step2Text = await stepButtons.nth(1).innerText();
    const step3Text = await stepButtons.nth(2).innerText();

    console.log(`[TC-4890-BU-01] Step 1: "${step1Text.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-BU-01] Step 2: "${step2Text.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-BU-01] Step 3: "${step3Text.replace(/\n/g, ' ')}"`);

    expect(step1Text).toContain('Informasi umum agunan');
    expect(step2Text).toContain('Data tambahan agunan');
    expect(step3Text).toContain('Informasi kepemilikan');

    // 2. Klik Step 2 (Data Tambahan Agunan) secara paralel
    await stepButtons.nth(1).click();
    await page.waitForTimeout(1500);

    // Verifikasi form Step 2 tampil
    const isStep2Active = await page.locator('text=/Data tambahan agunan|Bukti pemilikan|Sifat agunan/i').first().isVisible();
    console.log(`[TC-4890-BU-01] Form Step 2 aktif pada Badan Usaha: ${isStep2Active}`);
    expect(isStep2Active).toBeTruthy();

    await testInfo.attach('Eviden TC-4890-BU-01: Stepper Agunan Debitur Badan Usaha', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});

