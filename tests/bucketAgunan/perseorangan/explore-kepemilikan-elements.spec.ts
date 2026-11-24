import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test('Explore SIT Kepemilikan Tab Elements & Buttons', async ({ page }) => {
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
  await inputNomor.fill('EXPLORE_MODUL8_ERR_' + Date.now());

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  const tabKepemilikan = page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first();
  await tabKepemilikan.click();
  await page.waitForTimeout(1500);

  // Ambil semua tombol di dalam modal
  const modal = page.locator('div[role="dialog"], .mantine-Modal-content, div:has(> h2:has-text("Tambah agunan"))').first();
  const buttons = await modal.locator('button').allInnerTexts();
  console.log('Modal Buttons:', buttons);

  // Ambil semua teks dan label di tab kepemilikan
  const labels = await modal.locator('label, span, p, h1, h2, h3, h4, h5, h6').allInnerTexts();
  const filteredLabels = [...new Set(labels.map(l => l.trim()).filter(l => l.length > 2))];
  console.log('Tab Kepemilikan Text/Labels:', filteredLabels.slice(0, 30));

  await page.screenshot({ path: 'explore-output/probes/modal-tab-kepemilikan-detail.png', fullPage: true });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
});
