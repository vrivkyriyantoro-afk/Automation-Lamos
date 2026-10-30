import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';
import { DataPenjaminPage } from '../../pages/bucketIdentitas/DataPenjaminPage';
import { generateBadanUsahaData, generateNik, generateNpwpBadanUsaha } from '../../utils/dataGenerator';

test.describe('Input Data Pengurus dan Pemegang Saham (Perorangan & Badan Usaha)', () => {
  test.describe.configure({ mode: 'serial', timeout: 180000 });

  let loginPage: LoginPage;
  let dataPenjaminPage: DataPenjaminPage;

  test('TC01 - Input Pengurus Tipe Perorangan dan Tipe Badan Usaha pada Data Penjamin', async ({ page }) => {
    loginPage = new LoginPage(page);
    dataPenjaminPage = new DataPenjaminPage(page);

    console.log('\n========================================================================');
    console.log('🚀 MEMULAI INPUT DATA PENGURUS & PEMEGANG SAHAM (PERORANGAN & BADAN USAHA)');
    console.log('========================================================================\n');

    // 1. Login SSO
    console.log('[1/5] Login SSO...');
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Navigasi ke URL Target
    const targetUrl = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M47GJH55ZVDRE8EB7NXZ2D6W/create?bucket=identitas_pengecekan&debtorType=individual';
    console.log(`[2/5] Mengakses URL: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 3. Buka section Data Penjamin
    console.log('[3/5] Membuka sub-menu Data penjamin...');
    await dataPenjaminPage.openDataPenjaminSection();

    // 4. Input Pengurus Tipe PERORANGAN (Perseorangan)
    console.log('\n[4/5] Menginput Data Pengurus Perseorangan...');
    const dummyPT = generateBadanUsahaData('PT');
    const pengurusPerseorangan = {
      organBadanUsaha: 'Pemegang Saham',
      nama: dummyPT.pengurus[0].namaLengkap,
      jenisKelamin: dummyPT.pengurus[0].jenisKelamin,
      npwp: dummyPT.pengurus[0].npwp,
      jabatan: dummyPT.pengurus[0].jabatan,
      alamat: dummyPT.pengurus[0].alamatKtp,
      rt: '003',
      rw: '004',
      provinsi: 'DKI JAKARTA',
      kota: 'KOTA ADM. JAKARTA PUSAT',
      kecamatan: 'TANAH ABANG',
      kelurahan: 'KEBON KACANG',
      kodePos: '10240',
      porsiKepemilikan: 60
    };

    await dataPenjaminPage.addPengurusPerseorangan(pengurusPerseorangan);

    // 5. Input Pengurus Tipe BADAN USAHA
    console.log('\n[5/5] Menginput Data Pengurus Badan Usaha...');
    const pengurusBadanUsaha = {
      organBadanUsaha: 'Pemegang Saham',
      npwpBadanUsaha: generateNpwpBadanUsaha(false),
      namaBadanUsaha: 'CV SUMBER BERKAH UTAMA',
      jenisBadanUsaha: 'CV' as const,
      nomorAktaPendirian: '12',
      tanggalAktaPendirian: '2021-06-15',
      adaAktaPerubahan: false,
      alamat: 'Jl. Cempaka Putih Tengah No. 45',
      rt: '005',
      rw: '008',
      provinsi: 'DKI JAKARTA',
      kota: 'KOTA ADM. JAKARTA PUSAT',
      kecamatan: 'CEMPAKA PUTIH',
      kelurahan: 'CEMPAKA PUTIH TIMUR',
      kodePos: '10510',
      porsiKepemilikan: 40
    };

    await dataPenjaminPage.addPengurusBadanUsaha(pengurusBadanUsaha);

    // Screenshot hasil akhir tabel daftar nama pengurus
    await page.screenshot({ path: 'test-results/daftar-pengurus-penjamin-result.png', fullPage: true });
    console.log('📸 Hasil tabel pengurus disimpan di test-results/daftar-pengurus-penjamin-result.png');

    console.log('\n========================================================================');
    console.log('🎉 SEMUA DATA PENGURUS & PEMEGANG SAHAM TELAH BERHASIL DIINPUT!');
    console.log('========================================================================\n');
  });
});

