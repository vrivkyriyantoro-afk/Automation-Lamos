import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';

// Probe READ-ONLY: buka dropdown LBU (tanpa memilih), catat isi listbox + respons jaringan; baca nama pasangan di Data penjamin
const APP_ID = process.env.APPLICATION_ID_IDENTITAS_LENGKAP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe LBU + penjamin', async ({ page }) => {
  test.setTimeout(240000);
  const net: { url: string; status: number }[] = [];
  page.on('response', r => {
    const u = r.url();
    if (/api|lbu|master|reference|credit/i.test(u) && !/\.(js|css|png|svg|woff2?)(\?|$)/.test(u)) net.push({ url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 140), status: r.status() });
  });
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  const app = new CreditApplicationForm(page);
  await app.goto(APP_ID, 'identitas_pengecekan');
  const out: Record<string, unknown> = {};

  // 1) LBU dropdown pertama
  await page.locator('aside button', { hasText: 'LBU' }).click();
  await page.waitForTimeout(2000);
  net.length = 0;
  const cb = page.locator('[role="combobox"][id^="lbu-credit-nature"]').first();
  await cb.scrollIntoViewIfNeeded();
  await cb.click();
  await page.waitForTimeout(4000);
  const id = await cb.getAttribute('id');
  out.lbuListbox = await page.evaluate((i) => {
    const lb = document.getElementById(`${i}-listbox`);
    return lb ? { html: lb.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 1500), text: (lb as HTMLElement).innerText.slice(0, 300) } : 'listbox tidak ada';
  }, id);
  out.lbuNetwork = [...net];
  await page.screenshot({ path: 'explore-output/identitas/probe-lbu-open.png' });
  await page.keyboard.press('Escape');

  // 2) Data penjamin: nama penjamin & pasangan tiap kartu
  await page.locator('aside button', { hasText: 'Data penjamin' }).click();
  await page.waitForTimeout(4000);
  out.penjamin = await page.evaluate(() => {
    const val = (n: string) => Array.from(document.querySelectorAll(`input[name="${n}"]`)).map(e => (e as HTMLInputElement).value);
    return {
      penjamin: val('personalGuarantee.name'),
      pasangan: val('personalGuarantee.spouse.name'),
      pasanganKtp: val('personalGuarantee.spouse.wni.identityNumber'),
    };
  });
  out.sidebar = await page.locator('aside button').allInnerTexts();
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-lbu-01M83.json', JSON.stringify(out, null, 2));
});
