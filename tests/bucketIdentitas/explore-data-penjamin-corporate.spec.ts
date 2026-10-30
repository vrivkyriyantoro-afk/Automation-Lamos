import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Eksplorasi Tipe Penjamin Badan Usaha (Corporate Guarantee)', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;

  test('TC01 - Pilih Tipe Penjamin Badan Usaha dan petakan seluruh field', async ({ page }) => {
    loginPage = new LoginPage(page);

    // 1. Login
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Akses halaman
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47F0YVNQHW3NZC59V3ZFR1Y/create?bucket=identitas_pengecekan&debtorType=individual';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // 3. Klik menu Data penjamin
    const penjaminMenuItem = page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
    await penjaminMenuItem.scrollIntoViewIfNeeded();
    await penjaminMenuItem.click();
    await page.waitForTimeout(2000);

    // 4. Buka dropdown Tipe Penjamin
    console.log('\n--- Membuka dropdown Tipe Penjamin ---');
    const tipePenjaminCombobox = page.locator('div, button, [role="combobox"]').filter({ hasText: /Pilih tipe penjamin|Perorangan|Badan Usaha|Corporate/i }).first();
    await tipePenjaminCombobox.scrollIntoViewIfNeeded();
    await tipePenjaminCombobox.click();
    await page.waitForTimeout(1000);

    // List semua opsi di listbox
    const options = await page.locator('[role="listbox"] [role="option"], [role="listbox"] li, [role="listbox"] span, [role="listbox"] p').allInnerTexts();
    console.log('Opsi Tipe Penjamin:', options);

    // Pilih opsi Badan Usaha / Corporate
    const badanUsahaOpt = page.locator('[role="listbox"]').getByText(/Badan Usaha|Corporate/i).first();
    if (await badanUsahaOpt.isVisible()) {
      await badanUsahaOpt.click();
      console.log('✅ Berhasil memilih Tipe Penjamin: Badan Usaha');
      await page.waitForTimeout(2000);
    }

    // 5. Analisis semua field yang muncul untuk Badan Usaha
    const inputs = await page.locator('input:not([type="hidden"]), textarea, select, [role="combobox"]').all();
    console.log(`\nTotal Input/Combobox untuk Badan Usaha: ${inputs.length}`);
    for (let i = 0; i < inputs.length; i++) {
      const tag = await inputs[i].evaluate(el => el.tagName.toLowerCase());
      const placeholder = await inputs[i].getAttribute('placeholder') || '';
      const name = await inputs[i].getAttribute('name') || '';
      const ariaLabel = await inputs[i].getAttribute('aria-label') || '';
      const parentLabel = await inputs[i].evaluate(el => {
        const container = el.closest('div.flex-col, div.grid, label, .form-group') || el.parentElement;
        return container?.querySelector('label, p, span')?.textContent?.trim() || '';
      });
      console.log(`Input #${i + 1} [${tag}] name="${name}" placeholder="${placeholder}" aria="${ariaLabel}" label="${parentLabel}"`);
    }

    // Screenshot tampilan form Badan Usaha
    await page.screenshot({ path: 'test-results/data-penjamin-badan-usaha.png', fullPage: true });
    console.log('✅ Screenshot disimpan di test-results/data-penjamin-badan-usaha.png');
  });
});

