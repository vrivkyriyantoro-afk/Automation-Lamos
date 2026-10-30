import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Akses Halaman Identitas Pengecekan', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;

  test('TC01 - Akses langsung halaman identitas_pengecekan setelah login', async ({ page }) => {
    loginPage = new LoginPage(page);

    // 1. Login terlebih dahulu untuk mendapatkan session auth SSO
    console.log('\n[1/3] Melakukan login SSO...');
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Navigasi langsung ke URL target
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47F0YVNQHW3NZC59V3ZFR1Y/create?bucket=identitas_pengecekan&debtorType=individual';
    console.log(`\n[2/3] Mengakses URL: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // 3. Verifikasi halaman termuat
    console.log('\n[3/3] Memverifikasi elemen halaman identitas_pengecekan...');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Ambil tangkapan layar bukti akses
    await page.screenshot({ path: 'test-results/identitas-pengecekan-access.png', fullPage: true });
    console.log('✅ Screenshot disimpan ke test-results/identitas-pengecekan-access.png');

    // Cek header / form yang ada di halaman
    const pageTitle = await page.title();
    console.log(`Page Title: ${pageTitle}`);

    expect(page.url()).toContain('identitas_pengecekan');
  });
});

