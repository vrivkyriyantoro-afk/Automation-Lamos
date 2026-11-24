import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Modul 7 SIT: Cash Collateral Flow', () => {
  test('Inspeksi Dropdown Sifat & Radio Ya/Tidak & CIF Input', async ({ page }) => {
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
    await inputNomor.fill('EXPLORE_CASH_' + Date.now());

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

    console.log('--- TEST F11: CEK SIFAT AGUNAN DI CASH COLLATERAL ---');
    const sifatDropdown = page.locator('div, button, [role="combobox"]').filter({ hasText: /Pilih sifat agunan jaminan/i }).first();
    if (await sifatDropdown.isVisible()) {
      console.log('Dropdown Sifat Agunan TAMPIL di Cash!');
      await sifatDropdown.click();
      await page.waitForTimeout(500);
      const options = await page.locator('[role="listbox"]:visible li, ul:visible li').allInnerTexts();
      console.log('Opsi Sifat Cash:', options.map(o => o.trim()));
      // klik luar
      await page.keyboard.press('Escape');
    } else {
      console.log('Dropdown Sifat Agunan TIDAK TAMPIL di Cash!');
    }

    console.log('--- TEST F11: CEK RADIO YA / TIDAK BANK SINARMAS ---');
    const radioYa = page.locator('label').filter({ hasText: /^Ya$/i }).locator('input[type="radio"]').first();
    const radioTidak = page.locator('label').filter({ hasText: /^Tidak$/i }).locator('input[type="radio"]').first();
    console.log('Radio Ya checked:', await radioYa.isChecked());
    console.log('Radio Tidak checked:', await radioTidak.isChecked());

    // Cek field CIF default saat Ya aktif
    const cifInput = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    console.log('CIF input visible:', await cifInput.isVisible());
    if (await cifInput.isVisible()) {
      console.log('CIF placeholder:', await cifInput.getAttribute('placeholder'));
      console.log('CIF value:', await cifInput.inputValue());
      const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
      console.log('Btn Cek visible:', await btnCek.isVisible(), 'enabled:', await btnCek.isEnabled());

      // Coba isi CIF
      await cifInput.fill('11111111');
      console.log('Setelah diisi angka, Btn Cek enabled:', await btnCek.isEnabled());
    }

    // Coba klik radio "Tidak"
    console.log('--- KLIK RADIO TIDAK ---');
    const labelTidak = page.locator('label').filter({ hasText: /^Tidak$/i }).first();
    await labelTidak.click();
    await page.waitForTimeout(1000);
    console.log('Setelah klik Tidak, CIF input visible:', await cifInput.isVisible());
    const instansiInput = page.locator('input[placeholder*="instansi" i], input[name*="issuer" i], input[name*="institution" i]').first();
    console.log('Instansi penerbit input visible:', await instansiInput.isVisible());
    const allLabelsAfterTidak = await page.locator('label').allInnerTexts();
    console.log('Labels setelah klik Tidak:', allLabelsAfterTidak.map(l => l.trim()).filter(l => l.length > 0));

    // Tutup aman
    await page.locator('button:has-text("Batal")').last().click();
  });
});
