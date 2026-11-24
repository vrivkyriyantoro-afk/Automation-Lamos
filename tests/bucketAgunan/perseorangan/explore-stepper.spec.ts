import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Stepper Modal Tambah Agunan', () => {
  test('Inspeksi Tab / Stepper Tambah Agunan', async ({ page }) => {
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

    // 2. Pilih F11 - Deposito & Cari dummy
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: /F11 - Deposito/i }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('EXPLORE_STEP_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik Tambah Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // Ambil semua button / tabs di dalam modal
    const buttons = await page.locator('button, [role="tab"]').allInnerTexts();
    console.log('Buttons/Tabs in modal:', buttons.map(b => b.trim()).filter(b => b.length > 0));

    // Periksa apakah ada teks "Data tambahan agunan" atau "Informasi kepemilikan"
    const stepElements = page.locator('span, div, p, button').filter({ hasText: /tambahan|kepemilikan|agunan/i });
    const countSteps = await stepElements.count();
    console.log('Count text containing tambahan/kepemilikan:', countSteps);
    const stepTexts = [];
    for (let i = 0; i < countSteps; i++) {
      const text = await stepElements.nth(i).innerText().catch(() => '');
      if (text.length > 0 && text.length < 80) {
        stepTexts.push(text.trim());
      }
    }
    console.log('Sample Step Texts:', Array.from(new Set(stepTexts)));

    // Tutup modal
    const btnBatal = page.locator('button:has-text("Batal")').last();
    if (await btnBatal.isVisible()) {
      await btnBatal.click();
    }
  });
});
