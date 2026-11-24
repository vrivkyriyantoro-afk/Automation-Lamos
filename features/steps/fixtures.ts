import { test as base, createBdd } from 'playwright-bdd';
import 'dotenv/config';
import { LoginPage } from '../../pages/base/LoginPage';

/** Fixture bersama untuk semua step. Tambahkan page object bucket di sini (mis. dataPribadi, agunan). */
export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
