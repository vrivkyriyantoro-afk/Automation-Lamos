import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Eksplorasi & Otomasi Form Data Penjamin', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;

  test('TC01 - Eksplorasi Struktur Form Data Penjamin (Badan Usaha & Individu)', async ({ page }) => {
    loginPage = new LoginPage(page);

    // 1. Login
    console.log('[1/4] Login SSO...');
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Akses halaman
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47F0YVNQHW3NZC59V3ZFR1Y/create?bucket=identitas_pengecekan&debtorType=individual';
    console.log(`[2/4] Navigasi ke ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // 3. Cari dan klik menu "Data penjamin" pada sidebar kiri
    console.log('[3/4] Mencari menu "Data penjamin"...');
    const penjaminMenuItem = page.locator('div, button, a, p, span')
      .filter({ hasText: /^Data penjamin$/i })
      .first();

    if (await penjaminMenuItem.isVisible()) {
      await penjaminMenuItem.scrollIntoViewIfNeeded();
      await penjaminMenuItem.click();
      await page.waitForTimeout(2000);
      console.log('✅ Berhasil klik menu "Data penjamin"');
    } else {
      // Coba scroll halaman utama ke bawah
      console.log('Mencari teks Data penjamin di area utama...');
      const penjaminHeader = page.locator('text=/Data penjamin/i').first();
      await penjaminHeader.scrollIntoViewIfNeeded();
    }

    // 4. Analisis input fields, radio buttons, dan button di form Data Penjamin
    console.log('[4/4] Memetakan elemen form Data Penjamin...');
    
    // Ambil semua radio buttons (apakah ada pilihan Badan Usaha / Perorangan?)
    const radios = await page.locator('input[type="radio"], [role="radio"]').all();
    console.log(`Total Radio Buttons ditemukan: ${radios.length}`);
    for (let i = 0; i < radios.length; i++) {
      const radioText = await radios[i].evaluate(el => el.parentElement?.innerText || el.getAttribute('aria-label') || el.getAttribute('value') || '');
      console.log(`Radio #${i + 1}: "${radioText.replace(/\n/g, ' ')}"`);
    }

    // Ambil semua input fields dan labelnya
    const inputs = await page.locator('input:not([type="hidden"]), textarea, select, [role="combobox"]').all();
    console.log(`\nTotal Input/Combobox ditemukan: ${inputs.length}`);
    for (let i = 0; i < Math.min(inputs.length, 30); i++) {
      const tag = await inputs[i].evaluate(el => el.tagName.toLowerCase());
      const placeholder = await inputs[i].getAttribute('placeholder') || '';
      const name = await inputs[i].getAttribute('name') || '';
      const ariaLabel = await inputs[i].getAttribute('aria-label') || '';
      const text = await inputs[i].innerText().catch(() => '');
      const parentLabel = await inputs[i].evaluate(el => {
        const container = el.closest('div.flex-col, div.grid, label, .form-group') || el.parentElement;
        return container?.querySelector('label, p, span')?.textContent?.trim() || '';
      });
      console.log(`Input #${i + 1} [${tag}] name="${name}" placeholder="${placeholder}" aria="${ariaLabel}" label="${parentLabel}"`);
    }

    // Screenshot tampilan Data Penjamin
    await page.screenshot({ path: 'test-results/data-penjamin-form.png', fullPage: true });
    console.log('✅ Screenshot disimpan di test-results/data-penjamin-form.png');
  });
});

