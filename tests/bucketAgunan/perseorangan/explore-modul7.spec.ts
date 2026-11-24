import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('Eksplorasi Modul 7: Data Tambahan Agunan', () => {
  test('Inspeksi UI Data Tambahan Agunan & Sifat Agunan', async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // 1. Klik Tambah Agunan
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    // 2. Pilih Tanah (Housing/Properti) & cari fiktif
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('EXPLORE_MODUL7_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik Tambah Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // Cari teks / heading "Data tambahan" atau "Sifat agunan"
    console.log('--- MENCARI ELEMEN DATA TAMBAHAN AGUNAN ---');
    const sections = await page.locator('h1, h2, h3, h4, h5, h6, [role="heading"]').allInnerTexts();
    console.log('Heading di form:', sections);

    // Cari elemen dengan teks "Sifat agunan"
    const sifatAgunan = page.locator('label, span, div, p').filter({ hasText: /Sifat agunan/i });
    const countSifat = await sifatAgunan.count();
    console.log('Jumlah elemen mengandung "Sifat agunan":', countSifat);
    for (let i = 0; i < countSifat; i++) {
      console.log(`[Sifat agunan ${i}]`, await sifatAgunan.nth(i).innerText().catch(() => ''));
    }

    // Cari form controls di bawah seksi Data Tambahan jika ada
    const allLabels = await page.locator('label').allInnerTexts();
    console.log('Semua label di form:', allLabels.filter(l => l.trim().length > 0));

    // Tutup aman
    const btnBatal = page.locator('button:has-text("Batal")').last();
    if (await btnBatal.isVisible()) {
      await btnBatal.click();
    }
  });
});
