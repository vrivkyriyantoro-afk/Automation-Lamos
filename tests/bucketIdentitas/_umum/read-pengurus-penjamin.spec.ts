import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../../pages/base/LoginPage';

// Read-only: membaca daftar & detail (ikon mata = lihat) pengurus/pemegang saham Penjamin korporasi.
// TIDAK klik ikon pensil (edit) atau tempat sampah (hapus).
const APP_ID = process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z';
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=identitas_pengecekan&debtorType=individual`;

test('Baca pengurus & pemegang saham penjamin korporasi (read-only)', async ({ page }) => {
  test.setTimeout(480000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  const openPage = async (pg: number) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const menu = page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
    if (await menu.isVisible().catch(() => false)) { await menu.click(); await page.waitForTimeout(3000); }
    if (pg > 1) {
      await page.getByText(String(pg), { exact: true }).last().click();
      await page.waitForTimeout(1500);
    }
  };
  const rowsLoc = () => page.locator('tr').filter({ hasText: /Perseorangan|Badan Usaha/ }).filter({ hasText: /Pemegang Saham|Pengurus/ });
  const snapshot = () => page.locator('input:not([type="hidden"]), textarea').evaluateAll(els =>
    els.filter(e => (e as HTMLElement).offsetParent !== null).map(e => ({
      name: e.getAttribute('name') || '', placeholder: e.getAttribute('placeholder') || '',
      value: (e as HTMLInputElement).value || '', type: (e as HTMLInputElement).type, checked: (e as HTMLInputElement).checked,
    })));

  const out: any[] = [];
  for (let pg = 1; pg <= 1; pg++) {
    console.log('halaman', pg);
    await openPage(pg);
    const n = await rowsLoc().count();
    for (let i = 0; i < n; i++) {
      if (i > 0) await openPage(pg);
      const row = rowsLoc().nth(i);
      await row.scrollIntoViewIfNeeded();
      const cells = (await row.locator('td').allInnerTexts()).map(s => s.trim());
      const before = new Set((await snapshot()).map(x => x.name + '|' + x.value));
      await row.locator('svg').first().click(); // ikon mata
      await page.waitForTimeout(6000);
      const after = await snapshot();
      const modalInputs = after.filter(x => !before.has(x.name + '|' + x.value));
      await page.screenshot({ path: `test-results/pengurus-p${pg}-${i}.png` });
      out.push({ page: pg, cells, modalInputs, bodyTail: (await page.locator('body').innerText()).slice(-1800) });
    }
  }
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/pengurus-penjamin-read.json', JSON.stringify(out, null, 2));
});
