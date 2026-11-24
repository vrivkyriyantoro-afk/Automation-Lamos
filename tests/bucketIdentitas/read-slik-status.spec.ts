import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';

// Read-only: membuka modal "Lengkapi file SLIK" dan mencatat status impor tiap baris. Tidak menekan Simpan/Kirim.
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z'}/create?bucket=identitas_pengecekan&debtorType=individual`;

test('Baca status impor SLIK (read-only)', async ({ page }) => {
  test.setTimeout(150000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(10000);
  const trigger = page.getByText(/Klik untuk melengkapi file SLIK/).first();
  await page.getByText('Pengecekan SLIK', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(3000);
  const bucketText = await page.locator('body').innerText();
  await trigger.scrollIntoViewIfNeeded(); await trigger.click({ force: true });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'test-results/slik-status-check.png' });
  const body = await page.locator('body').innerText();
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/slik-status-check.txt',
    'MODAL:\n' + body.slice(body.lastIndexOf('Lengkapi file SLIK')) + '\n\nSTATUS BUCKET (cuplikan):\n' +
    (bucketText.match(/.{0,80}Pengecekan SLIK.{0,120}/gs) || []).join('\n---\n'));
});
