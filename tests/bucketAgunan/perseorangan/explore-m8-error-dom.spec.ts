import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Explore DOM Modul 8: tombol Simpan, label, dan form setelah kategori 001', async ({ page }) => {
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

  await page.locator('input[placeholder*="nomor" i]').first().fill('EXPLORE_M8DOM_' + Date.now());
  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  await page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first().click();
  await page.waitForTimeout(1500);

  // 1. Semua tombol di page (modal footer mungkin di luar modalRoot)
  const allButtons = await page.locator('button:visible').evaluateAll((els) =>
    els.map((el) => ({
      text: (el as HTMLElement).innerText.trim(),
      disabled: (el as HTMLButtonElement).disabled,
      ariaDisabled: el.getAttribute('aria-disabled'),
      cls: el.className?.toString().slice(0, 80),
    }))
  );
  console.log('ALL_BUTTONS=' + JSON.stringify(allButtons));

  // 2. Label teks di area Informasi kepemilikan
  const labels = await page.locator('label:visible').allInnerTexts();
  console.log('LABELS=' + JSON.stringify(labels.map(l => l.trim()).filter(Boolean)));

  // 3. Semua input + placeholder + readonly/disabled
  const inputs = await page.locator('input:visible').evaluateAll((els) =>
    els.map((el) => {
      const i = el as HTMLInputElement;
      return { placeholder: i.placeholder, value: i.value, disabled: i.disabled, readOnly: i.readOnly };
    })
  );
  console.log('INPUTS=' + JSON.stringify(inputs));

  // 4. Pilih kategori 001 lalu dump innerText form
  const combobox = page.locator('[role="combobox"]').filter({ hasText: /kategori pemilik|pilih kategori|\d{3}/i }).first();
  await combobox.click();
  await page.waitForTimeout(800);
  await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
    .filter({ hasText: /001/i }).first().click();
  await page.waitForTimeout(2500);

  const modal = page.locator('div[role="dialog"], .mantine-Modal-content, div:has(> h2:has-text("Tambah agunan"))').first();
  const modalText = (await modal.innerText()).replace(/\s+/g, ' ');
  console.log('MODAL_TEXT_AFTER_001=' + modalText.slice(0, 2500));

  const inputsAfter = await page.locator('input:visible').evaluateAll((els) =>
    els.map((el) => {
      const i = el as HTMLInputElement;
      return { placeholder: i.placeholder, value: i.value, disabled: i.disabled, readOnly: i.readOnly };
    })
  );
  console.log('INPUTS_AFTER_001=' + JSON.stringify(inputsAfter));

  await page.screenshot({ path: 'explore-output/probes/m8-dom-after-001.png', fullPage: true });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
});
