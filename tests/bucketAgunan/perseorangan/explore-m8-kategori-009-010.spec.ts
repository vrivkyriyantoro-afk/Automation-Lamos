import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Explore combobox state setelah pilih kategori 009 lalu 010', async ({ page }) => {
  test.setTimeout(180000);
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

  await page.locator('input[placeholder*="nomor" i]').first().fill('EXPLORE_M8_009_' + Date.now());
  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  await page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first().click();
  await page.waitForTimeout(1500);

  async function dumpComboboxes(tag: string) {
    const combos = await page.locator('[role="combobox"]').evaluateAll((els) =>
      els.map((el) => ({
        text: ((el as HTMLElement).innerText || '').trim().slice(0, 60),
        tag: el.tagName,
        visible: !!(el as HTMLElement).offsetParent,
        cls: el.className?.toString().slice(0, 60),
      }))
    );
    console.log(`COMBOS_${tag}=` + JSON.stringify(combos));
  }

  await dumpComboboxes('INITIAL');

  const combobox = page.locator('[role="combobox"]').filter({ hasText: /kategori pemilik|pilih kategori|\d{3}/i }).first();
  await combobox.click();
  await page.waitForTimeout(900);
  await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
    .filter({ hasText: /009/ }).first().click();
  await page.waitForTimeout(2500);
  await dumpComboboxes('AFTER_009');

  // buka lagi, cek listbox options & posisi
  const combo2 = page.locator('[role="combobox"]').filter({ hasText: /kategori pemilik|pilih kategori|\d{3}/i }).first();
  await combo2.click();
  await page.waitForTimeout(1200);

  const optionBoxes = await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
    .evaluateAll((els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { text: (el as HTMLElement).innerText.trim().slice(0, 40), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
    }));
  console.log('OPTION_BOXES=' + JSON.stringify(optionBoxes));
  console.log('VIEWPORT=' + JSON.stringify(page.viewportSize()));

  await page.screenshot({ path: 'explore-output/probes/m8-listbox-009.png' });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
});
