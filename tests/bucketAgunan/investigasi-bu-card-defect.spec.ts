import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test('Investigasi hilangnya Card Agunan yang Diubah pada Badan Usaha', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1366, height: 900 });

  const login = new LoginPage(page);
  await login.goto();
  await login.usernameInput.waitFor({ state: 'visible', timeout: 45000 });
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  const appId = '01M482PRSVH5ZMTVZX5QH0VDNZ'; // Badan Usaha
  const url = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${appId}/create?bucket=agunan&debtorType=business`;

  const capturedApis: Array<{ url: string; status: number; body: string }> = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('/api/') || u.includes('/lossvc/')) {
      try {
        const body = await res.text();
        capturedApis.push({ url: u, status: res.status(), body });
      } catch {}
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Pastikan section Data agunan terbuka
  const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
    .filter({ hasText: /^Data agunan$/i }).first();
  if (await headerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await headerBtn.click();
    await page.waitForTimeout(1500);
  }

  // Cari kartu agunan pertama di Badan Usaha (AN02010203 - Rumah Toko/Rumah Kantor)
  const cardTitle = page.locator('text=/AN02010203|Rumah Toko|Tanah/i').first();
  await expect(cardTitle).toBeVisible({ timeout: 15000 });

  const cardContainer = cardTitle.locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "Card") or contains(@class, "card") or contains(@class, "Item") or contains(@class, "border")][1]');
  const menuBtn = cardContainer.locator('button').filter({ has: page.locator('svg') }).first();
  await menuBtn.click();
  await page.waitForTimeout(1000);

  const btnUbah = page.locator('button, [role="menuitem"]').filter({ hasText: /^Ubah$/i }).first();
  await btnUbah.click();
  await page.waitForTimeout(2500);

  // Ambil screenshot modal Badan Usaha
  await page.screenshot({
    path: 'explore-output/bug/DEFECT-Card-Agunan-Badan-Usaha-Missing.png',
  });

  // Periksa apakah elemen card "Agunan yang diubah" ada di DOM (walaupun hidden)
  const cardAgunanYangDiubah = page.locator('text=/Agunan yang diubah/i');
  const countCard = await cardAgunanYangDiubah.count();
  const isCardVisible = countCard > 0 ? await cardAgunanYangDiubah.first().isVisible() : false;

  console.log('HASIL PEMERIKSAAN DOM BADAN USAHA:');
  console.log(`- Teks "Agunan yang diubah" count: ${countCard}, visible: ${isCardVisible}`);

  // Simpan payload API terkait ke file investigasi
  const fs = require('fs');
  fs.writeFileSync('explore-output/bug/apis-badan-usaha-ubah.json', JSON.stringify(capturedApis, null, 2));
});

