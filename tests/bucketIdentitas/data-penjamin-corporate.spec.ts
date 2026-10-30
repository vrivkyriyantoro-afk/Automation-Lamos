import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';
import { DataPenjaminPage } from '../../pages/bucketIdentitas/DataPenjaminPage';
import { generateBadanUsahaData } from '../../utils/dataGenerator';

test.describe('Otomatisasi Pengisian Form Data Penjamin Badan Usaha (Corporate Guarantee)', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let loginPage: LoginPage;
  let dataPenjaminPage: DataPenjaminPage;

  test('TC01 - Isi Lengkap Form Penjamin Badan Usaha dengan Data Generator', async ({ page }) => {
    loginPage = new LoginPage(page);
    dataPenjaminPage = new DataPenjaminPage(page);

    // 1. Login
    console.log('\n========================================================================');
    console.log('🚀 MEMULAI OTOMASI PENGISIAN FORM DATA PENJAMIN BADAN USAHA');
    console.log('========================================================================\n');
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Akses Halaman Pengajuan Kredit
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47F0YVNQHW3NZC59V3ZFR1Y/create?bucket=identitas_pengecekan&debtorType=individual';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // 3. Buka section Data Penjamin
    await dataPenjaminPage.openDataPenjaminSection();

    // 4. Pastikan Radio "Debitur memiliki penjamin? -> Ya" aktif
    await dataPenjaminPage.setHasPenjamin(true);

    // 5. Generate Data Badan Usaha secara dinamis
    const dummyBadanUsaha = generateBadanUsahaData('PT');
    console.log('\n📊 Data Badan Usaha yang Di-generate:');
    console.log(`- Nama PT: ${dummyBadanUsaha.namaBadanUsaha}`);
    console.log(`- NPWP: ${dummyBadanUsaha.npwpBadanUsaha}`);
    console.log(`- NIB: ${dummyBadanUsaha.nib}`);
    console.log(`- No. Akta: ${dummyBadanUsaha.aktaPendirian.nomorAkta}`);
    console.log(`- Alamat: ${dummyBadanUsaha.alamatDomisili.alamatLengkap}\n`);

    // 6. Isi Form Penjamin Badan Usaha (Penjamin #2 yang merupakan Corporate Guarantee)
    await dataPenjaminPage.fillCorporateGuaranteeData(dummyBadanUsaha);

    // 7. Ambil tangkapan layar bukti form terisi
    await page.screenshot({ path: 'test-results/data-penjamin-corporate-filled.png', fullPage: true });
    console.log('📸 Tangkapan layar form terisi disimpan di test-results/data-penjamin-corporate-filled.png');

    // 8. Verifikasi input telah terisi
    await expect(dataPenjaminPage.inputNamaPerusahaan).toHaveValue(dummyBadanUsaha.namaBadanUsaha);
    await expect(dataPenjaminPage.inputNpwpPerusahaan).toHaveValue(dummyBadanUsaha.npwpBadanUsaha);
    await expect(dataPenjaminPage.inputNib).toHaveValue(dummyBadanUsaha.nib);

    console.log('\n========================================================================');
    console.log('🎉 PENGISIAN FORM DATA PENJAMIN BADAN USAHA BERHASIL & TERVERIFIKASI!');
    console.log('========================================================================\n');
  });
});

