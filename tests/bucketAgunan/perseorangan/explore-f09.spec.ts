import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Modul 7: Jenis Agunan F09 / Kendaraan', () => {
  test('Inspeksi Form Cash F09 & Kendaraan', async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // 1. Klik Tambah Agunan
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    // 2. Pilih F09 - Giro (Cash collateral) & cari fiktif
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: /F09 - Giro/i }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('EXPLORE_F09_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik Tambah Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // Ambil semua heading dan label form untuk jenis F09 - Giro
    console.log('--- FORM F09 - GIRO (CASH COLLATERAL) ---');
    const sectionsF09 = await page.locator('h1, h2, h3, h4, h5, h6, [role="heading"]').allInnerTexts();
    console.log('Headings F09:', sectionsF09);

    const labelsF09 = await page.locator('label, span, div, p').filter({ hasText: /sifat|bukti|cif|tersimpan|bank sinarmas/i }).allInnerTexts();
    console.log('Relevant Texts F09:', Array.from(new Set(labelsF09.map(t => t.trim()))).filter(t => t.length > 0 && t.length < 100));

    // Tutup modal
    const btnBatal = page.locator('button:has-text("Batal")').last();
    if (await btnBatal.isVisible()) {
      await btnBatal.click();
    }
  });
});
