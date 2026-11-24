import { test, Page } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import { LoginPage } from '../../../pages/LoginPage';

// Eksplorasi read-only: rekam Network + screenshot hasil Cek CIF (5445). Output: explore-output/stories/s2cml-5445/
const APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=agunan&debtorType=individual`;
const OUT = 'explore-output/stories/s2cml-5445';
const CIFS: Record<string, string> = { valid1: process.env.CIF_VALID_1!, valid2: process.env.CIF_VALID_2!, invalid: '99999999' };

async function openForm(page: Page, jenis: RegExp) {
  await page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first().click();
  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const lb = page.locator('[role="listbox"]:visible, ul:visible').first();
  await lb.locator('li').first().waitFor({ timeout: 15000 });
  await lb.locator('li button, li').filter({ hasText: jenis }).first().click();
  await page.locator('input[placeholder*="nomor" i]').first().fill('NET_' + Date.now());
  await page.locator('button:has-text("Cari")').first().click();
  await page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first().click();
  await page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('input[name="isCollateralStoredAtBsim"][value="true"]').check({ force: true });
  await page.waitForTimeout(800);
}

const JENIS: Record<string, RegExp> = { F10: /F10 - Tabungan/i, F09: /F09 - Giro/i, F15: /F15 - Setoran Jaminan/i };
for (const [jk, jr] of Object.entries(JENIS))
for (const [ck, cif] of Object.entries(CIFS).filter(([k]) => k !== 'invalid')) {
  const key = `${jk}-${ck}`;
  test(`network CIF ${key}`, async ({ page }) => {
    test.setTimeout(240000);
    const log: any[] = [];
    page.on('response', async (r) => {
      if (!['fetch', 'xhr'].includes(r.request().resourceType())) return;
      let body = ''; try { body = (await r.text()).slice(0, 1500); } catch {}
      log.push({ method: r.request().method(), url: r.url(), status: r.status(), req: (r.request().postData() || '').slice(0, 500), body });
    });
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await openForm(page, jr);
    log.length = 0;
    await page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first().fill(cif);
    await page.screenshot({ path: `${OUT}/${key}-1-sebelum-cek.png` });
    await page.locator('button').filter({ hasText: /^Cek$/i }).first().click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: `${OUT}/${key}-2-setelah-cek.png` });
    // scroll modal ke bawah untuk lihat hasil
    await page.getByText(/Apakah agunan tersimpan/i).first().evaluate((el) => {
      let p: HTMLElement | null = el as HTMLElement;
      while (p && p.scrollHeight <= p.clientHeight + 5) p = p.parentElement;
      if (p) p.scrollTop = p.scrollHeight;
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${key}-3-setelah-cek-scroll.png` });
    fs.writeFileSync(`${OUT}/${key}-network.json`, JSON.stringify({ cif: key === 'invalid' ? cif : '(dari .env)', calls: log }, null, 2));
    console.log(key, 'calls:', log.map((l) => `${l.method} ${l.status} ${l.url.replace(/https?:\/\/[^/]+/, '')}`));
  });
}
