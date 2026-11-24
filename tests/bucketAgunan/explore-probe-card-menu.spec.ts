import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test('Probe card three-dot menu on 01M4F7TNSCSHEDB5G3WTSP7HDY', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1366, height: 900 });

  const login = new LoginPage(page);
  await login.goto();

  // Tunggu form login SSO siap
  await login.usernameInput.waitFor({ state: 'visible', timeout: 45000 });
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  const appId = '01M4F7TNSCSHEDB5G3WTSP7HDY';
  const url = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${appId}/create?bucket=agunan&debtorType=individual`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Pastikan section Data agunan terbuka
  const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
    .filter({ hasText: /^Data agunan$/i }).first();
  if (await headerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const isContentVisible = await page.locator('text=/Daftar agunan|Draf agunan|Total nilai/i').first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (!isContentVisible) {
      await headerBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Cari kartu agunan
  const cardTitle = page.locator('text=/F041401 - Reksadana|F15 - Setoran Jaminan/i').first();
  await expect(cardTitle).toBeVisible({ timeout: 20000 });

  // Cari tombol titik 3 spesifik pada kartu agunan
  // Tombol titik 3 di dalam card: cari tombol di samping judul agunan atau di dalam container kartu
  const cardContainer = cardTitle.locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "Card") or contains(@class, "card") or contains(@class, "Item") or contains(@class, "border")][1]');
  
  let menuBtn = cardContainer.locator('button').filter({ has: page.locator('svg') }).first();
  if (!await menuBtn.isVisible().catch(() => false)) {
    // Alternatif: cari tombol titik 3 terdekat setelah judul kartu
    menuBtn = cardTitle.locator('xpath=following::button[1]');
  }

  console.log('Menemukan tombol titik 3 pada kartu, melakukan klik...');
  await expect(menuBtn).toBeVisible({ timeout: 10000 });
  await menuBtn.click();
  await page.waitForTimeout(1000);

  // Ambil screenshot menu popover
  await page.screenshot({
    path: `explore-output/probe-card-menu-${appId}.png`,
  });

  // Ambil teks seluruh opsi menu
  const menuOptions = await page.locator('[role="menu"] button, [role="menu"] [role="menuitem"], ul[role="menu"] li, [class*="popover"] button, [class*="menu"] button')
    .allInnerTexts()
    .catch(() => []);
  console.log('OPSI MENU KARTU AGUNAN:', JSON.stringify(menuOptions));

  // Periksa apakah opsi "Ubah" tersedia
  const btnUbah = page.locator('button, [role="menuitem"]').filter({ hasText: /^Ubah$/i }).first();
  const adaUbah = await btnUbah.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`- Opsi "Ubah" tersedia? ${adaUbah}`);

  if (adaUbah) {
    console.log('Mengklik "Ubah" untuk melihat Modal Edit Agunan...');
    await btnUbah.click();
    await page.waitForTimeout(2500);

    // Ambil screenshot modal edit agunan
    await page.screenshot({
      path: `explore-output/probe-modal-ubah-${appId}.png`,
      fullPage: true,
    });

    // Cek judul modal dan tombol Simpan
    const dialogTitle = await page.locator('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3, [role="dialog"] [class*="title"]').allInnerTexts().catch(() => []);
    console.log('Judul dialog modal:', JSON.stringify(dialogTitle));

    const btnDraft = page.locator('button:has-text("Simpan sebagai draft")').first();
    const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/i }).first();

    const isDraftVisible = await btnDraft.isVisible().catch(() => false);
    const isDraftDisabled = isDraftVisible ? await btnDraft.isDisabled() : null;
    console.log(`- Tombol "Simpan sebagai draft": visible=${isDraftVisible}, disabled=${isDraftDisabled}`);

    const isSimpanVisible = await btnSimpan.isVisible().catch(() => false);
    const isSimpanDisabled = isSimpanVisible ? await btnSimpan.isDisabled() : null;
    console.log(`- Tombol "Simpan" (Final): visible=${isSimpanVisible}, disabled=${isSimpanDisabled}`);

    // Tutup modal secara safe (Batal)
    const btnBatal = page.locator('button:has-text("Batal"), [role="dialog"] button[aria-label*="close" i]').first();
    if (await btnBatal.isVisible().catch(() => false)) {
      console.log('Menutup modal via tombol Batal...');
      await btnBatal.click();
      await page.waitForTimeout(1000);
    } else {
      await page.keyboard.press('Escape');
    }
  }
});
