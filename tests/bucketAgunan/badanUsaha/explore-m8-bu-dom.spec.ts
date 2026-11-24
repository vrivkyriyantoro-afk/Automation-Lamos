import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_BU_TARGET || '01M482PRSVH5ZMTVZX5QH0VDNZ';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=business`;

test('Explore DOM Badan Usaha: form setelah kategori 005 / 006 / 007', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 1000 });

  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(btnTambah).toBeVisible({ timeout: 45000 });
  await btnTambah.click();

  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
  await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
  await listbox.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

  await page.locator('input[placeholder*="nomor" i]').first().fill('EXPLORE_BUDOM_' + Date.now());
  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  await page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first().click();
  await page.waitForTimeout(1500);

  async function dump(tag: string) {
    const combos = await page.locator('[role="combobox"]:visible').evaluateAll((els) =>
      els.map((el) => ((el as HTMLElement).innerText || '').trim().slice(0, 60))
    );
    const labels = await page.locator('label:visible').allInnerTexts();
    const inputs = await page.locator('input:visible').evaluateAll((els) =>
      els.map((el) => {
        const i = el as HTMLInputElement;
        return { ph: i.placeholder, v: i.value, d: i.disabled };
      })
    );
    console.log(`DUMP_${tag}=` + JSON.stringify({ combos, labels: labels.map(l => l.trim()).filter(Boolean), inputs }));
  }

  await dump('INITIAL');

  for (const kode of ['005', '006', '007']) {
    const combo = page.locator('[role="combobox"]:visible').filter({ hasText: /kategori pemilik|pilih kategori|^\d{3}/i }).first();
    await combo.click();
    await page.waitForTimeout(1000);

    const opt = page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
      .filter({ hasText: new RegExp(kode) }).first();
    const ok = await opt.isVisible().catch(() => false);
    console.log(`OPT_${kode}_VISIBLE=${ok}`);
    if (!ok) {
      // tutup dropdown tanpa Escape (Escape menutup modal)
      await combo.click();
      await page.waitForTimeout(500);
      continue;
    }

    await opt.click({ timeout: 15000 });
    await page.waitForTimeout(2500);
    await dump(`AFTER_${kode}`);

    // Buka dropdown kedua (tipe kepemilikan) jika ada, lihat opsinya
    const combosAll = page.locator('[role="combobox"]:visible');
    const count = await combosAll.count();
    console.log(`COMBO_COUNT_${kode}=${count}`);
    if (count > 1) {
      const second = combosAll.nth(1);
      const secondText = (await second.innerText()).trim();
      console.log(`SECOND_COMBO_${kode}="${secondText}"`);
      await second.click();
      await page.waitForTimeout(1000);
      const opts = await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
        .allInnerTexts();
      console.log(`SECOND_OPTIONS_${kode}=` + JSON.stringify(opts.map(o => o.trim()).filter(Boolean)));
      await second.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: `explore-output/bu-dom-${kode}.png`, fullPage: true });
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
});
