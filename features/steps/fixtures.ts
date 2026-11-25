import { test as base, createBdd } from 'playwright-bdd';
import { Locator } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/base/LoginPage';
import { DaftarAgunanSection } from '../../pages/buckets/agunan/DaftarAgunanSection';

/** Keadaan bersama antar step dalam SATU skenario (dibuat ulang tiap skenario). */
export interface ScenarioContext {
  kartu?: Locator;
}

/** Fixture bersama untuk semua step. Tambahkan page object bucket di sini (mis. dataPribadi, agunan). */
export const test = base.extend<{
  loginPage: LoginPage;
  daftarAgunan: DaftarAgunanSection;
  ctx: ScenarioContext;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  daftarAgunan: async ({ page }, use) => {
    await use(new DaftarAgunanSection(page));
  },
  ctx: async ({}, use) => {
    await use({});
  },
});

export const { Given, When, Then } = createBdd(test);
