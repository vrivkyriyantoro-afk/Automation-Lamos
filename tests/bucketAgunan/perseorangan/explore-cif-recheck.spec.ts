import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

// Eksplorasi ulang (read-only): apakah klik radio "Ya" benar-benar memilih radio & memunculkan field CIF?
const APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=agunan&debtorType=individual`;

test('recheck: radio Ya -> CIF muncul?', async ({ page }, testInfo) => {
  test.setTimeout(240000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first().click();
  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const lb = page.locator('[role="listbox"]:visible, ul:visible').first();
  await lb.locator('li').first().waitFor({ timeout: 15000 });
  await lb.locator('li button, li').filter({ hasText: /F11 - Deposito/i }).first().click();
  await page.locator('input[placeholder*="nomor" i]').first().fill('RECHECK_' + Date.now());
  await page.locator('button:has-text("Cari")').first().click();
  await page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first().click();
  await page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first().click();
  await page.waitForTimeout(1500);

  const radios = page.locator('[role="radiogroup"]').first().locator('input[type="radio"]');
  console.log('JUMLAH RADIO:', await radios.count());
  console.log('RADIO HTML:', await page.locator('[role="radiogroup"]').first().evaluate((e) => e.outerHTML.slice(0, 1500)));

  const before = await page.locator('input:visible').count();
  await radios.first().check({ force: true });
  await page.waitForTimeout(2500);
  console.log('RADIO YA CHECKED:', await radios.first().isChecked());
  console.log('INPUT VISIBLE before/after:', before, await page.locator('input:visible').count());
  console.log('CIF TERLIHAT:', await page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').count());

  // scroll area modal ke bawah lalu screenshot
  await page.getByText(/Apakah agunan tersimpan/i).first().evaluate((el) => {
    let p: HTMLElement | null = el as HTMLElement;
    while (p && p.scrollHeight <= p.clientHeight + 5) p = p.parentElement;
    if (p) p.scrollTop = p.scrollHeight;
  });
  await page.waitForTimeout(800);
  await testInfo.attach('recheck-after-ya-scrolled', { body: await page.screenshot(), contentType: 'image/png' });
  await page.screenshot({ path: 'explore-output/recheck-cif-after-ya.png' });
  console.log('TEKS MODAL:', (await page.locator('body').innerText()).match(/CIF[^\n]*/gi));
});
