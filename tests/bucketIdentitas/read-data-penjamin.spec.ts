import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/base/LoginPage';

// Read-only: membuka aplikasi dan membaca isi bagian "Data penjamin". Tidak mengubah data.
const APP_ID = process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z';
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=identitas_pengecekan&debtorType=individual`;

test('Baca data penjamin (read-only)', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const menu = page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
  if (await menu.isVisible().catch(() => false)) {
    await menu.scrollIntoViewIfNeeded();
    await menu.click();
    await page.waitForTimeout(3000);
  }

  const text = await page.locator('body').innerText();
  const inputs = await page.locator('input:not([type="hidden"]), textarea').evaluateAll(els =>
    els.map(e => ({
      name: e.getAttribute('name') || '',
      placeholder: e.getAttribute('placeholder') || '',
      value: (e as HTMLInputElement).value || '',
    })),
  );

  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync(
    'explore-output/identitas/data-penjamin-read.json',
    JSON.stringify({ url: page.url(), text, inputs }, null, 2),
  );
  await page.screenshot({ path: 'test-results/data-penjamin-read.png', fullPage: true });
});
