import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Eksplorasi Dropdown Kategori Pemilik Agunan SIT', async ({ page }) => {
  test.setTimeout(120000);
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

  const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
  await inputNomor.fill('EXPLORE_KATEGORI_' + Date.now());

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  // Klik Tab Informasi kepemilikan
  const tabKepemilikan = page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first();
  await tabKepemilikan.click();
  await page.waitForTimeout(1000);

  // Cek field Bukti kepemilikan & Kategori pemilik agunan
  console.log('--- CEK DROPDOWN KATEGORI PEMILIK AGUNAN ---');
  const comboboxKategori = page.locator('[role="combobox"]').filter({ hasText: /kategori pemilik/i }).first();
  console.log('Combobox kategori visible:', await comboboxKategori.isVisible());

  // Klik combobox kategori
  await comboboxKategori.click();
  await page.waitForTimeout(1000);

  // Ambil opsi yang tampil di listbox
  const optionsKategori = await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li').allInnerTexts();
  console.log('Opsi Kategori Pemilik Agunan:', optionsKategori.map(o => o.trim()).filter(o => o.length > 0));

  await page.screenshot({ path: 'explore-output/probes/opsi-kategori-pemilik.png' });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Tutup modal
  const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
  }
});
