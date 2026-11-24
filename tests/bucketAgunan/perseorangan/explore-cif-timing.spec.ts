import { test, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

// Probe read-only: apakah hasil Cek CIF berubah seiring waktu (toast, "CIF tidak ditemukan", tombol Ubah)?
const APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=agunan&debtorType=individual`;

async function state(page: Page) {
  const v = async (l: any) => await l.first().isVisible().catch(() => false);
  return {
    toast: await v(page.getByText(/kesalahan konektivitas/i)),
    tidakDitemukan: await v(page.getByText(/CIF tidak ditemukan/i)),
    ditemukan: await v(page.getByText(/^CIF ditemukan$/i)),
    ubah: await v(page.locator('button').filter({ hasText: /^Ubah$/i })),
    cek: await v(page.locator('button').filter({ hasText: /^Cek$/i })),
    dropdownRekening: await v(page.getByText(/Rekening cash collateral/i)),
  };
}

for (const [k, cif] of [['invalid', '99999999'], ['valid', process.env.CIF_VALID_1!]]) {
  test(`timing ${k}`, async ({ page }) => {
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
    await lb.locator('li button, li').filter({ hasText: /F15 - Setoran Jaminan/ }).first().click();
    await page.locator('input[placeholder*="nomor" i]').first().fill('TIMING_' + Date.now());
    await page.locator('button:has-text("Cari")').first().click();
    await page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first().click();
    await page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first().click();
    await page.waitForTimeout(1500);
    await page.locator('input[name="isCollateralStoredAtBsim"][value="true"]').check({ force: true });
    await page.waitForTimeout(800);
    await page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first().fill(cif);
    const t0 = Date.now();
    await page.locator('button').filter({ hasText: /^Cek$/i }).first().click();
    for (const ms of [300, 1000, 2000, 3000, 5000, 8000, 12000, 20000]) {
      await page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
      console.log(`[${k}] t=${ms}ms`, JSON.stringify(await state(page)));
    }
  });
}
