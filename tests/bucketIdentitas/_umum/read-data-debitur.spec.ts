import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../../pages/base/LoginPage';

// Read-only: membaca Data pribadi debitur (bagian pertama halaman Identitas dan Pengecekan).
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z'}/create?bucket=identitas_pengecekan&debtorType=individual`;
test('Baca data debitur (read-only)', async ({ page }) => {
  test.setTimeout(180000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000);
  const text = await page.locator('body').innerText();
  const inputs = await page.locator('input:not([type="hidden"]), textarea').evaluateAll(els =>
    els.map(e => ({ name: e.getAttribute('name') || '', placeholder: e.getAttribute('placeholder') || '', value: (e as HTMLInputElement).value || '', type: (e as HTMLInputElement).type, checked: (e as HTMLInputElement).checked })));
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/data-debitur-read.json', JSON.stringify({ text, inputs }, null, 2));
  await page.screenshot({ path: 'test-results/data-debitur.png' });
});
