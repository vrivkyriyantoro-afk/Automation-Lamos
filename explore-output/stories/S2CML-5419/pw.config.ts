import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export default defineConfig({
  testDir: '.', testMatch: 'explore-pembanding.spec.ts', timeout: 900000, workers: 1, reporter: 'list',
  use: { baseURL: process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/', ignoreHTTPSErrors: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
});
