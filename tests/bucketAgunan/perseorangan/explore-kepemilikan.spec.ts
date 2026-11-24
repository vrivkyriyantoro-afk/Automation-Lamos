import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Eksplorasi Tab Kepemilikan Agunan SIT', async ({ page }) => {
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
  await listbox.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

  const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
  await inputNomor.fill('EXPLORE_KEPEMILIKAN_' + Date.now());

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  // Ambil semua tab yang ada di modal
  const tabs = await page.locator('[role="tab"], button').filter({ hasText: /informasi|data|kepemilikan/i }).allInnerTexts();
  console.log('Tabs visible di modal:', tabs.map(t => t.trim()).filter(t => t.length > 0));

  // Cari tab yang berkaitan dengan Kepemilikan
  const tabKepemilikan = page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first();
  const isTabVisible = await tabKepemilikan.isVisible().catch(() => false);
  console.log('Tab Kepemilikan visible:', isTabVisible);

  if (isTabVisible) {
    const isTabDisabled = await tabKepemilikan.isDisabled().catch(() => false);
    const ariaDisabled = await tabKepemilikan.getAttribute('aria-disabled').catch(() => '');
    console.log(`Tab Kepemilikan isDisabled=${isTabDisabled}, ariaDisabled=${ariaDisabled}`);

    console.log('Klik Tab Kepemilikan...');
    await tabKepemilikan.click().catch(() => {});
    await page.waitForTimeout(1500);

    // Screenshot setelah klik tab kepemilikan
    await page.screenshot({ path: 'explore-output/probes/tab-kepemilikan.png' });

    // Cek dropdown / field di tab kepemilikan
    const labels = await page.locator('label, div > span, [role="combobox"]').allInnerTexts();
    console.log('Labels/Fields di Tab Kepemilikan:', labels.map(l => l.trim()).filter(l => l.length > 0 && l.length < 50));
  }

  // Tutup modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
  }
});
