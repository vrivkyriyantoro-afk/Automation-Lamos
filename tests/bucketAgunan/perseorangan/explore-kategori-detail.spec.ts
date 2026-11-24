import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

async function openTabKepemilikan(page: Page) {
  const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(btnTambah).toBeVisible({ timeout: 45000 });
  await btnTambah.click();

  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
  await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
  await listbox.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

  const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
  await inputNomor.fill('EXPLORE_CAT_' + Date.now());

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  const tabKepemilikan = page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first();
  await tabKepemilikan.click();
  await page.waitForTimeout(1000);
}

async function closeModal(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
  }
}

test('Inspect Form untuk tiap Kategori Pemilik Agunan', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  await openTabKepemilikan(page);

  const categories = ['001', '005', '008', '009'];

  for (const cat of categories) {
    console.log(`\n=================== PILIH KATEGORI ${cat} ===================`);
    const comboboxKategori = page.locator('[role="combobox"]').filter({ hasText: /kategori pemilik|pilih kategori|\d{3}/i }).first();
    await comboboxKategori.click();
    await page.waitForTimeout(600);

    const option = page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li').filter({ hasText: new RegExp(cat) }).first();
    await option.click();
    await page.waitForTimeout(1500);

    const modalText = await page.locator('.mantine-Modal-content').innerText();
    const visibleLabels = await page.locator('.mantine-Modal-content label, .mantine-Modal-content [role="combobox"]').allInnerTexts();
    console.log(`Labels untuk kategori ${cat}:`, visibleLabels.map(l => l.trim()).filter(l => l.length > 0 && l.length < 50));

    await page.screenshot({ path: `explore-output/probes/kategori-${cat}.png` });
  }

  await closeModal(page);
});
