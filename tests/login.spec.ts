import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication - Login Flow LAMOS', () => {
  test.describe.configure({ mode: 'serial' });
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC01 - Login berhasil dengan kredensial valid', async ({ page }) => {
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-5@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';

    await loginPage.login(validUsername, validPassword);

    // Assertion: Pastikan diarahkan keluar dari halaman login / ke dashboard
    await loginPage.expectLoginSuccess();
  });

  test('TC02 - Login gagal dengan password salah', async () => {
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-5@banksinarmas.com';
    const invalidPassword = 'WrongPassword123!';

    await loginPage.login(validUsername, invalidPassword);

    // Assertion: Muncul pesan error
    await loginPage.expectLoginFailed();
  });

  test('TC03 - Validasi form ketika username dan password kosong', async ({ page }) => {
    if (await loginPage.loginButton.isEnabled()) {
      await loginPage.loginButton.click();
    }

    // Assertion: Pastikan sistem tidak mengizinkan login dan tetap berada di halaman login
    await expect(page).not.toHaveURL(/.*dashboard.*/i);
  });
});

