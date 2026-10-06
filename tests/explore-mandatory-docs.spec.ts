import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';
import { CreditApplicationPage } from '../pages/CreditApplicationPage';
import fs from 'fs';

test.describe('Eksplorasi Dokumen Mandatory pada Bucket Dokumen', () => {
  test.describe.configure({ mode: 'serial', timeout: 180000 });

  let loginPage: LoginPage;
  let creditAppPage: CreditApplicationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    creditAppPage = new CreditApplicationPage(page);

    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    await creditAppPage.navigateFromSidebar();
    const targetDebitur = process.env.DEBITUR_TARGET || 'MUNAWAROH';
    await creditAppPage.continueApplication(targetDebitur);
    await creditAppPage.selectBucketDokumen();
    await creditAppPage.expectBucketDokumenVisible();
  });

  test('Katalog Lengkap Seluruh Kategori, Sub-Kategori, dan Slot Dokumen Mandatory (*)', async ({ page }) => {
    test.setTimeout(180000);
    console.log('\n========================================================================');
    console.log('🔍 EKSTRAKSI KATALOG RESMI SELURUH DOKUMEN & DOKUMEN MANDATORY (*) LAMOS');
    console.log('========================================================================\n');

    await page.waitForTimeout(2000);

    // 1. Injeksi file temporary untuk membuka dropdown seleksi
    const filePath = 'C:\\Users\\V50324\\Pictures\\Screenshots\\30 9 26\\2026-09-30_090947.png';
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(1000);

    // 2. Buka dropdown kategori utama
    const comboboxKategori = page.locator('div, button, [role="combobox"]')
      .filter({ hasText: /^Pilih kategori dokumen$/i })
      .or(page.getByText('Pilih kategori dokumen'))
      .first();

    await expect(comboboxKategori).toBeVisible({ timeout: 15000 });
    await comboboxKategori.click();
    await page.waitForTimeout(500);

    // Ambil semua opsi kategori utama
    const mainCategoryOptions = await page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]')
      .allInnerTexts();

    const uniqueMainCategories = [...new Set(mainCategoryOptions.map(t => t.trim()).filter(t => t.length > 2))];
    console.log(`Ditemukan ${uniqueMainCategories.length} Kategori Utama:\n`, uniqueMainCategories);

    const fullCatalog: {
      category: string;
      subCategories: {
        name: string;
        slots: string[];
      }[];
    }[] = [];

    // Tutup dropdown sementara
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    for (const mainCat of uniqueMainCategories) {
      console.log(`\n========================================================================`);
      console.log(`📂 KATEGORI: "${mainCat}"`);
      console.log(`========================================================================`);

      // Buka dropdown kategori lagi
      const combo = page.locator('[role="combobox"]').first();
      await combo.click();
      await page.waitForTimeout(500);

      // Pilih kategori
      const option = page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]')
        .filter({ hasText: new RegExp(`^${mainCat.replace(/\*/g, '\\*')}$`, 'i') })
        .first();

      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1500);

        // Cek combobox berikutnya
        const currentCombos = await page.locator('[role="combobox"]').all();
        console.log(`   Jumlah combobox aktif untuk kategori ini: ${currentCombos.length}`);

        if (currentCombos.length >= 3) {
          // Ada subkategori dan tipe dokumen
          const subCatText = await currentCombos[1].innerText();
          console.log(`   📁 Folder/Sub-kategori: "${subCatText}"`);

          // Buka combobox tipe dokumen
          await currentCombos[2].click();
          await page.waitForTimeout(500);

          const slotOptions = await page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]').allInnerTexts();
          const uniqueSlots = [...new Set(slotOptions.map(s => s.trim()).filter(Boolean))];

          console.log(`   📄 Slot Dokumen di dalamnya:`);
          for (const slot of uniqueSlots) {
            const isMandatory = slot.includes('*');
            console.log(`      ${isMandatory ? '⭐ [MANDATORY]' : '- [OPTIONAL] '} ${slot}`);
          }

          await page.keyboard.press('Escape');
        } else if (currentCombos.length === 2) {
          // Langsung tipe dokumen
          await currentCombos[1].click();
          await page.waitForTimeout(500);

          const slotOptions = await page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]').allInnerTexts();
          const uniqueSlots = [...new Set(slotOptions.map(s => s.trim()).filter(Boolean))];

          console.log(`   📄 Slot Dokumen di dalamnya:`);
          for (const slot of uniqueSlots) {
            const isMandatory = slot.includes('*');
            console.log(`      ${isMandatory ? '⭐ [MANDATORY]' : '- [OPTIONAL] '} ${slot}`);
          }

          await page.keyboard.press('Escape');
        }
      }
    }
  });
});
