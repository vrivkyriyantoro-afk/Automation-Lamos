import { test, expect } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Probe read-only: daftar lengkap opsi "Jenis agunan" di modal "+ Agunan" (scroll listbox sampai habis).
 * Tidak klik "Cari" / simpan. Output: explore-output/agunan/jenis-agunan.json
 */
const TARGET = process.env.EXPLORE_URL
  || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M482PRSVH5ZMTVZX5QH0VDNZ/create?bucket=agunan&debtorType=business';

test('probe opsi Jenis agunan', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first().click();
  const dialog = page.locator('[role="dialog"]:visible').last();
  await expect(dialog).toBeVisible();
  const combo = dialog.locator('[id^="collateral-type"]').first();
  await dialog.getByText('Pilih jenis agunan').click();
  const listbox = page.locator('[role="listbox"]:visible').first();
  await listbox.locator('li button').first().waitFor({ timeout: 15000 });

  const read = () => listbox.locator('li:not(.sticky) button').allInnerTexts();
  const seen = new Set<string>();
  let stable = 0;
  // ponytail: scroll sampai 3x berturut-turut tidak ada opsi baru; cukup untuk lazy-load/virtual list biasa
  while (stable < 3) {
    const before = seen.size;
    (await read()).map(o => o.replace(/\s+/g, ' ').trim()).filter(o => o && o !== 'Clear').forEach(o => seen.add(o));
    await listbox.evaluate(el => {
      const s = [el, ...Array.from(el.querySelectorAll('*'))].find(e => e.scrollHeight > e.clientHeight + 2) || el;
      s.scrollTop = s.scrollHeight;
    });
    await page.waitForTimeout(800);
    stable = seen.size === before ? stable + 1 : 0;
  }
  const hasSearch = await combo.locator('[data-testid="dropdownsearch-input-search"]').count() > 0;
  const options = [...seen];
  fs.mkdirSync('explore-output/agunan', { recursive: true });
  fs.writeFileSync('explore-output/agunan/jenis-agunan.json', JSON.stringify({ count: options.length, hasSearch, options }, null, 2));
  console.log(`Jenis agunan: ${options.length} opsi, search=${hasSearch}\n` + options.join('\n'));
  await page.keyboard.press('Escape');
});
