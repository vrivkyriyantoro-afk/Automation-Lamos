import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Eksplorasi Modal Input Pengurus dan Pemegang Saham', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;

  test('TC01 - Eksplorasi Modal Tambah Pengurus/Pemegang Saham (Perorangan & Badan Usaha)', async ({ page }) => {
    loginPage = new LoginPage(page);

    // 1. Login
    console.log('[1/4] Login SSO...');
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Navigasi ke URL target
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47GJH55ZVDRE8EB7NXZ2D6W/create?bucket=identitas_pengecekan&debtorType=individual';
    console.log(`[2/4] Navigasi ke ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Pastikan Tab Identitas dan Pengecekan aktif
    const tabIdentitas = page.getByText(/Identitas dan Pengecekan/i).first();
    if (await tabIdentitas.isVisible()) {
      await tabIdentitas.click();
      await page.waitForTimeout(1500);
    }

    // 3. Cari dan klik menu "Data penjamin" pada sidebar kiri
    console.log('[3/4] Mencari menu "Data penjamin"...');
    const penjaminMenuItem = page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
    if (await penjaminMenuItem.isVisible()) {
      await penjaminMenuItem.scrollIntoViewIfNeeded();
      await penjaminMenuItem.click();
      await page.waitForTimeout(1500);
      console.log('✅ Berhasil klik menu "Data penjamin"');
    }

    // 4. Scroll ke bagian "Data pengurus dan pemegang saham"
    console.log('[4/4] Mencari tombol "+ Pengurus/Pemegang Saham"...');
    const btnTambahPengurus = page.locator('button').filter({ hasText: /Pengurus\/Pemegang Saham|\+ Pengurus/i }).first();
    await btnTambahPengurus.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Klik tombol tambah
    await btnTambahPengurus.click();
    await page.waitForTimeout(2000);

    // Ambil screenshot modal / drawer yang terbuka
    await page.screenshot({ path: 'test-results/modal-tambah-pengurus.png', fullPage: true });
    console.log('📸 Modal screenshot disimpan ke test-results/modal-tambah-pengurus.png');

    // Analisis elemen-elemen di dalam modal/drawer
    console.log('\n--- Menganalisis Elemen Modal ---');
    const modalInputs = await page.locator('[role="dialog"] input, [role="dialog"] [role="combobox"], [role="dialog"] select, [role="dialog"] button, .modal input, .drawer input').all();
    console.log(`Total elemen interaktif dalam modal: ${modalInputs.length}`);
    for (let i = 0; i < modalInputs.length; i++) {
      const tag = await modalInputs[i].evaluate(el => el.tagName.toLowerCase());
      const name = await modalInputs[i].getAttribute('name') || '';
      const placeholder = await modalInputs[i].getAttribute('placeholder') || '';
      const text = await modalInputs[i].innerText().catch(() => '');
      const type = await modalInputs[i].getAttribute('type') || '';
      const parentText = await modalInputs[i].evaluate(el => {
        const p = el.closest('div.flex-col, div.grid, label, .form-group') || el.parentElement;
        return p?.querySelector('label, p, span')?.textContent?.trim() || '';
      });
      console.log(`Modal Element #${i + 1} [${tag}|${type}] name="${name}" placeholder="${placeholder}" text="${text.replace(/\n/g, ' ')}" label="${parentText}"`);
    }
  });
});
