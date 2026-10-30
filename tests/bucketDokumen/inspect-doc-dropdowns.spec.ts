import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationPage } from '../../pages/CreditApplicationPage';
import path from 'path';

test('Inspect Document Dropdown Options', async ({ page }) => {
  test.setTimeout(120000);
  const loginPage = new LoginPage(page);
  const creditAppPage = new CreditApplicationPage(page);

  await loginPage.goto();
  await loginPage.login(process.env.LAMOS_USERNAME || 'SMELOS-AO-5@banksinarmas.com', process.env.LAMOS_PASSWORD || 'simaS@123');
  await loginPage.expectLoginSuccess();

  await creditAppPage.navigateFromSidebar();
  await creditAppPage.continueApplication(process.env.DEBITUR_TARGET || '01M22NAB4RXT92Y56AJ5VBQT75');
  await creditAppPage.selectBucketDokumen();
  await creditAppPage.expectBucketDokumenVisible();

  // Injeksi file dummy
  const filePath = 'C:\\Users\\V50324\\Pictures\\Screenshots\\30 9 26\\2026-09-30_090947.png';
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(2000);

  const item = page.locator('li, [role="listitem"]').last();
  const combobox1 = item.locator('[role="combobox"]').nth(0);
  await combobox1.click({ force: true });
  await page.waitForTimeout(800);

  const opts1 = await page.locator('[role="listbox"] *').allInnerTexts();
  console.log('=== COMBOBOX 1 OPTIONS ===\n', [...new Set(opts1.filter(Boolean).map(s => String(s).trim()).filter(s => s.length > 2))]);

  async function inspectCategory(categoryName: string) {
    console.log(`\n================== INSPECTING: ${categoryName} ==================`);
    const c1 = item.locator('[role="combobox"]').nth(0);
    await c1.click({ force: true });
    await page.waitForTimeout(600);
    const opt = page.locator('[role="listbox"] *').filter({ hasText: new RegExp(`^${categoryName}$`, 'i') }).last();
    await opt.click({ force: true });
    await page.waitForTimeout(1500);

    const combos = await item.locator('[role="combobox"]').all();
    console.log(`Combobox count: ${combos.length}`);
    for (let i = 1; i < combos.length; i++) {
      await combos[i].click({ force: true });
      await page.waitForTimeout(600);
      const opts = await page.locator('[role="listbox"] *').allInnerTexts();
      const cleanOpts = [...new Set(opts.filter(Boolean).map(s => String(s).trim()).filter(s => s.length > 2 && !s.includes('\n')))];
      console.log(`  Combobox [${i}] options:`, cleanOpts);
      if (cleanOpts.length > 0) {
        const first = page.locator('[role="listbox"] *').filter({ hasText: cleanOpts[0] }).last();
        await first.click({ force: true });
        await page.waitForTimeout(1000);
      }
    }
  }

  await inspectCategory('Dokumen Internal');
  await inspectCategory('Dokumen Legalitas Usaha');
  await inspectCategory('Data Keuangan');
});

