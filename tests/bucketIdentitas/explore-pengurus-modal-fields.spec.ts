import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Eksplorasi Detail Form Pengurus/Pemegang Saham', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;

  test('TC01 - Analisis field modal Perseorangan vs Badan Usaha', async ({ page }) => {
    loginPage = new LoginPage(page);

    // 1. Login & Navigasi
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47GJH55ZVDRE8EB7NXZ2D6W/create?bucket=identitas_pengecekan&debtorType=individual';
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const penjaminMenuItem = page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
    await penjaminMenuItem.scrollIntoViewIfNeeded();
    await penjaminMenuItem.click();
    await page.waitForTimeout(1500);

    const btnTambahPengurus = page.locator('button').filter({ hasText: /Pengurus\/Pemegang Saham|\+ Pengurus/i }).first();
    await btnTambahPengurus.scrollIntoViewIfNeeded();
    await btnTambahPengurus.click();
    await page.waitForTimeout(1000);

    // Handle dialog "Edit data ini? -> Lanjutkan Edit" jika muncul
    const btnLanjutkanEdit = page.getByRole('button', { name: 'Lanjutkan Edit' }).or(page.locator('button:has-text("Lanjutkan Edit")')).first();
    if (await btnLanjutkanEdit.isVisible()) {
      console.log('⚠️ Dialog konfirmasi muncul -> Klik "Lanjutkan Edit"...');
      await btnLanjutkanEdit.click();
      await page.waitForTimeout(1500);
    }

    // 2. Klik Radio "Perseorangan"
    console.log('\n================== 1. TIPE ORGAN: PERSEORANGAN ==================');
    const radioPerseorangan = page.locator('div:has-text("Tambah pengurus/pemegang saham") ~ *').getByText('Perseorangan', { exact: true })
      .or(page.getByText('Perseorangan', { exact: true }))
      .last();
    await radioPerseorangan.click({ force: true });
    await page.waitForTimeout(1000);

    // Buka dropdown Organ badan usaha
    const dropdownOrgan = page.locator('div, button, [role="combobox"]').filter({ hasText: /Pilih tipe organ badan usaha/i }).first();
    if (await dropdownOrgan.isVisible()) {
      await dropdownOrgan.click();
      await page.waitForTimeout(500);
      const options = await page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]').allInnerTexts();
      console.log('Opsi Organ Badan Usaha (Perseorangan):', options);
      // Pilih opsi pertama
      const firstOpt = page.locator('[role="listbox"] [role="option"], [role="listbox"] li').first();
      if (await firstOpt.isVisible()) await firstOpt.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-results/modal-perseorangan-fields.png', fullPage: true });

    // Dump semua input field
    const perseoranganInputs = await page.locator('input:not([type="hidden"]), textarea, select, [role="combobox"]').all();
    console.log(`Total input di halaman saat Perseorangan dipilih: ${perseoranganInputs.length}`);
    for (const inp of perseoranganInputs) {
      const name = await inp.getAttribute('name') || '';
      const ph = await inp.getAttribute('placeholder') || '';
      const val = await inp.inputValue().catch(() => '');
      const label = await inp.evaluate(el => el.closest('div.flex-col, div.grid, label, .form-group')?.querySelector('label, p, span')?.textContent?.trim() || '');
      if (ph || name || label) {
        console.log(`  [Perseorangan] label="${label}" name="${name}" ph="${ph}" val="${val}"`);
      }
    }

    // 3. Klik Radio "Badan Usaha"
    console.log('\n================== 2. TIPE ORGAN: BADAN USAHA ==================');
    const radioBadanUsaha = page.locator('div:has-text("Tambah pengurus/pemegang saham") ~ *').getByText('Badan Usaha', { exact: true })
      .or(page.getByText('Badan Usaha', { exact: true }))
      .last();
    await radioBadanUsaha.click({ force: true });
    await page.waitForTimeout(1000);

    // Buka dropdown Organ badan usaha jika perlu
    const dropdownOrganBU = page.locator('div, button, [role="combobox"]').filter({ hasText: /Pilih tipe organ badan usaha/i }).first();
    if (await dropdownOrganBU.isVisible()) {
      await dropdownOrganBU.click();
      await page.waitForTimeout(500);
      const optionsBU = await page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]').allInnerTexts();
      console.log('Opsi Organ Badan Usaha (Badan Usaha):', optionsBU);
      const firstOpt = page.locator('[role="listbox"] [role="option"], [role="listbox"] li').first();
      if (await firstOpt.isVisible()) await firstOpt.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: 'test-results/modal-badan-usaha-fields.png', fullPage: true });

    // Dump semua input field
    const badanUsahaInputs = await page.locator('input:not([type="hidden"]), textarea, select, [role="combobox"]').all();
    console.log(`Total input di halaman saat Badan Usaha dipilih: ${badanUsahaInputs.length}`);
    for (const inp of badanUsahaInputs) {
      const name = await inp.getAttribute('name') || '';
      const ph = await inp.getAttribute('placeholder') || '';
      const val = await inp.inputValue().catch(() => '');
      const label = await inp.evaluate(el => el.closest('div.flex-col, div.grid, label, .form-group')?.querySelector('label, p, span')?.textContent?.trim() || '');
      if (ph || name || label) {
        console.log(`  [Badan Usaha] label="${label}" name="${name}" ph="${ph}" val="${val}"`);
      }
    }
  });
});
