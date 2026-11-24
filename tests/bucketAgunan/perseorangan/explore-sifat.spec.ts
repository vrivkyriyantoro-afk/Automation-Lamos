import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Sifat Agunan pada Housing vs Kendaraan vs Cash', () => {
  test('Inspeksi Dropdown Sifat Agunan pada Housing, Kendaraan, dan F11 Deposito', async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // Helper masuk ke Step 2 Tab Data tambahan agunan
    async function openDataTambahan(jenisText: string) {
      console.log(`\n=== MEMERIKSA JENIS: ${jenisText} ===`);
      const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
      await expect(btnTambah).toBeVisible({ timeout: 45000 });
      await btnTambah.click();

      // Pilih jenis
      await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
      const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
      await listbox.locator('li button, li').filter({ hasText: new RegExp(jenisText, 'i') }).first().click();

      const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
      await inputNomor.fill('EXPLORE_SIFAT_' + Date.now());

      const btnCari = page.locator('button:has-text("Cari")').first();
      await expect(btnCari).toBeEnabled({ timeout: 10000 });
      await btnCari.click();

      const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
      await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
      await btnAgunanBaru.click();
      await page.waitForTimeout(1500);

      // Klik Tab Data tambahan agunan
      const tabDataTambahan = page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first();
      await tabDataTambahan.click();
      await page.waitForTimeout(1500);
    }

    // 1. Cek Housing (Tanah)
    await openDataTambahan('Tanah');
    console.log('[Housing] Membuka dropdown / combobox di Tab Data Tambahan...');
    const comboboxesHousing = await page.locator('[role="combobox"]').allInnerTexts();
    console.log('[Housing] Comboboxes:', comboboxesHousing.map(t => t.trim()));
    const labelsHousing = await page.locator('label, div > span').filter({ hasText: /sifat|bukti|eligible/i }).allInnerTexts();
    console.log('[Housing] Sifat/Bukti labels:', labelsHousing.map(t => t.trim()));

    // Tutup modal
    await page.locator('button:has-text("Batal")').last().click();
    await page.waitForTimeout(1000);

    // 2. Cek Kendaraan (AN020203 - Kendaraan)
    await openDataTambahan('Kendaraan');
    console.log('[Kendaraan] Membuka dropdown / combobox di Tab Data Tambahan...');
    const comboboxesKendaraan = await page.locator('[role="combobox"]').allInnerTexts();
    console.log('[Kendaraan] Comboboxes:', comboboxesKendaraan.map(t => t.trim()));
    const labelsKendaraan = await page.locator('label, div > span').filter({ hasText: /sifat|bukti|eligible/i }).allInnerTexts();
    console.log('[Kendaraan] Sifat/Bukti labels:', labelsKendaraan.map(t => t.trim()));

    // Tutup modal
    await page.locator('button:has-text("Batal")').last().click();
    await page.waitForTimeout(1000);
  });
});
