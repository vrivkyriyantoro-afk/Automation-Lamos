import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Konfigurasi BDD (Gherkin) TERPISAH dari playwright.config.ts agar suite tests/ tidak terpengaruh.
 *   npm run bdd:gen    -> generate spec ke .features-gen/ dari features/**\/*.feature
 *   npm run bdd:test   -> generate + jalankan
 * Step definition hanya boleh memakai page object di pages/ (bukan selector sendiri).
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
});

export default defineConfig({
  testDir,
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report-bdd', open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
});
