import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { LoginPage } from '../../pages/LoginPage';

const OUT = __dirname;
const APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const URL_ = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=agunan&debtorType=individual`;
const listbox = (p: Page) => p.locator('[role="listbox"]:visible, ul:visible').first();
const opts = (p: Page) => listbox(p).locator('li:not(.sticky) button, li:not(.sticky)');
const esc = (s: string) => s.split("").map(c => ("[].*+?^${}()|".includes(c) || c === String.fromCharCode(92)) ? String.fromCharCode(92) + c : c).join("");
const btnPembanding = (p: Page) => p.locator('button').filter({ hasText: /Data pembanding/i }).first();
const statusTrigger = (p: Page) => p.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first();

async function pick(page: Page, trigger: Locator, option: RegExp) {
  await trigger.click();
  await listbox(page).locator('li button, li').first().waitFor({ timeout: 15000 });
  const o = opts(page).filter({ hasText: option }).first();
  await expect(o).toBeVisible({ timeout: 5000 });
  const t = (await o.innerText()).trim();
  await o.click(); await page.waitForTimeout(1200); return t;
}
const jenisTrigger = (p: Page) => p.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last();
async function openTambah(page: Page) {
  const b = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(b).toBeVisible({ timeout: 45000 }); await b.click();
  await expect(page.locator('h2:has-text("Tambah agunan")')).toBeVisible({ timeout: 20000 });
}
async function toForm(page: Page) {
  await page.locator('input[placeholder*="nomor" i]').first().fill('NONEXISTENT_DUMMY_CLS_' + Date.now());
  const c = page.locator('button:has-text("Cari")').first();
  await expect(c).toBeEnabled({ timeout: 10000 }); await c.click();
  const n = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(n).toBeVisible({ timeout: 15000 }); await n.click(); await page.waitForTimeout(2000);
}

test('eksplor tombol data pembanding per jenis agunan', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  let bucket: any[] = [];
  page.on('response', async r => {
    const rt = r.request().resourceType();
    if (rt !== 'fetch' && rt !== 'xhr') return;
    let body = ''; try { body = (await r.text()).slice(0, 1500); } catch { body = '<unreadable>'; }
    bucket.push({ method: r.request().method(), status: r.status(), url: r.url(), body });
  });

  // enumerasi semua opsi jenis agunan
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await openTambah(page);
  await jenisTrigger(page).click();
  await listbox(page).locator('li button, li').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1000);
  const all = (await opts(page).allInnerTexts()).map(t => t.trim()).filter(t => t && t !== 'Clear');
  fs.writeFileSync(path.join(OUT, 'all-jenis-agunan.json'), JSON.stringify(all, null, 2));
  console.log('TOTAL OPSI', all.length);
  const cash = all.filter(t => /tabungan|giro|deposito|reksadana|cash|setoran|emas|surat berharga|obligasi|saham/i.test(t));
  const tanah = all.find(t => /tanah/i.test(t));
  const targets = [...cash, ...(tanah ? [tanah] : [])];
  console.log('TARGET', targets);

  const results: any[] = [];
  for (const [i, jenis] of targets.entries()) {
    bucket = [];
    const rec: any = { jenis, tombol: null, error: null, calls: [] };
    try {
      await page.goto(URL_, { waitUntil: 'domcontentloaded' });
      await openTambah(page);
      bucket = [];
      await pick(page, jenisTrigger(page), new RegExp("^" + String.fromCharCode(92) + "s*" + esc(jenis) + String.fromCharCode(92) + "s*$"));
      await toForm(page);
      await pick(page, statusTrigger(page), /Tersedia/i);
      await page.waitForTimeout(2500);
      rec.tombol = await btnPembanding(page).count();
      await page.evaluate(() => document.querySelectorAll('*').forEach(e => { const s = getComputedStyle(e); if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight) e.scrollTop = e.scrollHeight; }));
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT, `${String(i + 1).padStart(2, '0')}-${jenis.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.png`), fullPage: true });
    } catch (e: any) { rec.error = String(e.message).split('\n')[0]; }
    rec.calls = bucket.map(b => ({ ...b }));
    results.push(rec);
    console.log(`[${jenis}] tombol=${rec.tombol} err=${rec.error} calls=${bucket.length}`);
  }
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
});
