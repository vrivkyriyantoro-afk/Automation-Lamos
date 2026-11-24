import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  // ponytail: perkiraan kasar ~200 aksi per test; naikkan faktor bila test lebih panjang.
  timeout: 60000 + (Number(process.env.SLOWMO) || 0) * 200,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    // Arsip per run (tidak tertimpa) untuk metrik durasi & pass/fail
    ['json', { outputFile: `run-history/${new Date().toISOString().replace(/[:.]/g, '-')}.json` }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/',
    ignoreHTTPSErrors: true,
    screenshot: 'on',
    video: 'on',
    trace: 'off',
    // Opsional: SLOWMO=500 (ms) agar aksi browser mudah diikuti saat --headed. Default 0 = cepat.
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
