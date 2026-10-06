import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';

test.describe('Pengajuan Kredit - Lanjutkan Pengajuan & Bucket Dokumen', () => {
  test.describe.configure({ mode: 'serial' });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    // Langkah 1: Login ke LAMOS
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-5@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();
  });

  test('TC01 - Lanjutkan pengajuan dan pilih bucket Dokumen', async ({ page }) => {
    // 1. Klik menu LAMOS
    await page.locator('div').filter({ hasText: 'LAMOS' }).nth(1).click();

    // 2. Klik sub menu Pengajuan kredit
    await page.getByRole('link', { name: 'Pengajuan kredit' }).nth(1).click();
    await page.waitForURL(/.*lamos\/credit-application.*/i);

    // 3. Cari baris debitur yang sesuai (berdasarkan ID atau nama atau baris pertama)
    const targetRow = page.getByRole('row', { name: '01M3VAJ3NVWGMD8X7HVJE2Y2J4' })
      .or(page.getByRole('row', { name: '01M3VB6MN3CPX4244JB75RE2PV' }))
      .or(page.getByRole('row', { name: 'MUNAWAROH' }))
      .or(page.locator('tbody tr').first());

    await expect(targetRow.first()).toBeVisible({ timeout: 15000 });

    // Klik icon button titik 3
    const iconBtn = targetRow.first().getByLabel('icon button').or(targetRow.first().locator('button').last());
    await iconBtn.click();

    // 4. Klik Lanjutkan pengajuan
    await page.getByRole('link', { name: 'Lanjutkan pengajuan' }).first().click();
    await page.waitForURL(/.*create\?bucket=.*/i);

    // 5. Klik tab Dokumen
    const dokumenTab = page.locator('#dokumen').getByText('Dokumen')
      .or(page.locator('#dokumen'))
      .or(page.locator('text=Dokumen').first());
    await dokumenTab.first().click();

    // 6. Verifikasi halaman bucket Dokumen terbuka
    await expect(page).toHaveURL(/.*bucket=dokumen.*/i);
    await expect(page.locator('text=Kelengkapan dokumen').first()).toBeVisible();
  });
});
