import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Inspeksi Interaksi Radio Ya SIT', async ({ page }) => {
  test.setTimeout(120000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(btnTambah).toBeVisible({ timeout: 45000 });
  await btnTambah.click();

  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
  await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
  await listbox.locator('li button, li').filter({ hasText: /F11 - Deposito/i }).first().click();

  const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
  await inputNomor.fill('INSPECT_' + Date.now());

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  const tabDataTambahan = page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first();
  await expect(tabDataTambahan).toBeVisible({ timeout: 15000 });
  await tabDataTambahan.click();
  await page.waitForTimeout(1500);

  // Ambil input awal di modal
  const inputsBefore = await page.locator('input:visible').all();
  console.log('Jumlah input visible sebelum klik Ya:', inputsBefore.length);
  for (let i = 0; i < inputsBefore.length; i++) {
    const ph = await inputsBefore[i].getAttribute('placeholder').catch(() => '');
    console.log(`Input Before ${i}: placeholder="${ph}"`);
  }

  // Klik radio Ya
  const radiogroup = page.locator('[role="radiogroup"]').first();
  const labelYa = radiogroup.locator('div, span, label').filter({ hasText: /^Ya$/i }).first();
  console.log('Klik Ya...');
  await labelYa.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'explore-output/after-click-ya.png' });

  // Ambil input setelah klik Ya
  const inputsAfter = await page.locator('input:visible').all();
  console.log('Jumlah input visible setelah klik Ya:', inputsAfter.length);
  for (let i = 0; i < inputsAfter.length; i++) {
    const ph = await inputsAfter[i].getAttribute('placeholder').catch(() => '');
    const name = await inputsAfter[i].getAttribute('name').catch(() => '');
    console.log(`Input After ${i}: placeholder="${ph}", name="${name}"`);
  }

  // Ambil semua button visible
  const buttonsAfter = await page.locator('button:visible').allInnerTexts();
  console.log('Buttons visible setelah Ya:', buttonsAfter.map(b => b.trim()).filter(b => b.length > 0));

  await page.keyboard.press('Escape');
});
