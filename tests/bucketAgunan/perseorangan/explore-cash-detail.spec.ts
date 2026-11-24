import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Sifat Agunan & Radio Ya/Tidak di SIT', () => {
  test('Inspeksi Dropdown Sifat & Radio Bank Sinarmas', async ({ page }) => {
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

    // 2. Pilih F11 - Deposito
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: /F11 - Deposito/i }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('EXPLORE_DETAIL_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(1500);

    // Ke Tab Data Tambahan Agunan
    const tabDataTambahan = page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first();
    await tabDataTambahan.click();
    await page.waitForTimeout(1500);

    // 1. Cek Dropdown Sifat Agunan Jaminan
    console.log('--- 1. CEK DROPDOWN SIFAT AGUNAN ---');
    const sifatCombobox = page.locator('[role="combobox"]').filter({ hasText: /sifat agunan jaminan/i }).first();
    console.log('Sifat combobox visible:', await sifatCombobox.isVisible());
    await sifatCombobox.click();
    await page.waitForTimeout(500);

    // Ambil opsi yang muncul
    const optionsSifat = await page.locator('[role="listbox"]:visible [role="option"], ul:visible li, div[role="listbox"]:visible div').allInnerTexts();
    console.log('Opsi Sifat Agunan:', optionsSifat.map(o => o.trim()).filter(o => o.length > 0));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 2. Cek Radio Group Bank Sinarmas
    console.log('--- 2. CEK RADIO BANK SINARMAS ---');
    const radiogroup = page.locator('[role="radiogroup"]').first();
    console.log('Radiogroup visible:', await radiogroup.isVisible());

    const radioButtons = await radiogroup.locator('[role="radio"], input[type="radio"]').all();
    console.log('Jumlah radio button di radiogroup:', radioButtons.length);
    for (let i = 0; i < radioButtons.length; i++) {
      const isChecked = await radioButtons[i].isChecked().catch(() => false);
      const ariaChecked = await radioButtons[i].getAttribute('aria-checked').catch(() => '');
      console.log(`Radio ${i}: checked=${isChecked}, aria-checked=${ariaChecked}`);
    }

    // 3. Klik Radio "Tidak"
    console.log('--- 3. KLIK RADIO TIDAK ---');
    const labelTidak = radiogroup.locator('div, span, label').filter({ hasText: /^Tidak$/i }).first();
    await labelTidak.click();
    await page.waitForTimeout(1000);

    // Screenshot setelah klik Tidak
    await page.screenshot({ path: 'explore-output/probes/radio-tidak-clicked.png' });

    const labelsAfterTidak = await page.locator('label, [role="heading"], h3, h4, h5, div > span').allInnerTexts();
    console.log('Labels setelah Tidak:', labelsAfterTidak.map(l => l.trim()).filter(l => l.length > 0 && l.length < 60));

    // Tutup modal
    await page.locator('button:has-text("Batal")').last().click();
  });
});
