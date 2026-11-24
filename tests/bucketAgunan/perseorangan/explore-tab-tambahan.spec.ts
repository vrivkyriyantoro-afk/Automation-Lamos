import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Tab Data Tambahan Agunan', () => {
  test('Inspeksi Step 2 Data Tambahan Agunan', async ({ page }) => {
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
    await inputNomor.fill('EXPLORE_DATA_TAMBAHAN_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik Tambah Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // 4. Klik Tab "Data tambahan agunan"
    const tabDataTambahan = page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first();
    console.log('Klik Tab Data tambahan agunan...');
    await tabDataTambahan.click();
    await page.waitForTimeout(2000);

    // Ambil semua teks label, heading, input di Tab Data Tambahan Agunan
    const labels = await page.locator('label, [role="heading"], h3, h4, h5').allInnerTexts();
    console.log('Labels di Data tambahan agunan (F11 - Deposito):', labels.map(l => l.trim()).filter(l => l.length > 0));

    const inputs = await page.locator('input').all();
    console.log('Total input fields:', inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const ph = await inputs[i].getAttribute('placeholder').catch(() => '');
      const name = await inputs[i].getAttribute('name').catch(() => '');
      const type = await inputs[i].getAttribute('type').catch(() => '');
      console.log(`Input ${i}: name="${name}" type="${type}" placeholder="${ph}"`);
    }

    // Ambil screenshot untuk inspeksi visual
    await page.screenshot({ path: 'explore-output/probes/tab-data-tambahan-f11.png' });

    // Tutup modal
    const btnBatal = page.locator('button:has-text("Batal")').last();
    if (await btnBatal.isVisible()) {
      await btnBatal.click();
    }
  });
});
