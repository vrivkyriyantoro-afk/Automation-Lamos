import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';

// Probe READ-ONLY: baca isi section Pengecekan (Dukcapil, DHN DHIB, SLIK). Tidak menekan tombol apa pun selain item sidebar.
const APP_ID = process.env.APPLICATION_ID_IDENTITAS_LENGKAP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe pengecekan', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 1800 });
  const net: string[] = [];
  page.on('response', r => {
    if (/lossvc/.test(r.url()) && !/auth|session/.test(r.url()) && r.status() >= 400)
      net.push(`${r.request().method()} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 120)}`);
  });
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await new CreditApplicationForm(page).goto(APP_ID, 'identitas_pengecekan');
  await page.waitForTimeout(4000);
  const out: Record<string, unknown> = {};
  out.sidebar = (await page.locator('aside button').allInnerTexts()).map(t => t.replace(/\n/g, ' | '));
  out.tombolHalaman = (await page.locator('button:visible').allInnerTexts()).map(t => t.trim()).filter(Boolean).slice(-12);
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  for (const [i, nama] of ['Pengecekan Dukcapil', 'Pengecekan DHN DHIB', 'Pengecekan SLIK'].entries()) {
    const item = page.locator('aside button', { hasText: nama }).first();
    if (!(await item.count())) { out[nama] = 'item sidebar tidak ada'; continue; }
    if (await item.isDisabled()) { out[nama] = 'item sidebar disabled'; continue; }
    await item.click({ timeout: 8000 });
    await page.waitForTimeout(3500);
    out[nama] = ((await page.locator('main').innerText({ timeout: 5000 }).catch(() => '')) || (await page.locator('body').innerText()).slice(0, 2500)).slice(0, 2500).replace(/\n+/g, ' | ');
    await page.screenshot({ path: `explore-output/identitas/probe-pengecekan-${i + 1}.png`, fullPage: true });
    fs.writeFileSync('explore-output/identitas/probe-pengecekan-01M83.json', JSON.stringify({ ...out, error4xx5xx: net }, null, 2));
  }
  out.error4xx5xx = net;
  fs.writeFileSync('explore-output/identitas/probe-pengecekan-01M83.json', JSON.stringify(out, null, 2));
});
