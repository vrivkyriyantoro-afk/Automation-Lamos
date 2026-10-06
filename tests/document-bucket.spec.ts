import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';
import { CreditApplicationPage } from '../pages/CreditApplicationPage';
import { DocumentBucketPage } from '../pages/DocumentBucketPage';

test.describe('Bucket Dokumen - Otomatisasi Unggah Dokumen Pengajuan Kredit', () => {
  test.describe.configure({ mode: 'serial' });

  let loginPage: LoginPage;
  let creditAppPage: CreditApplicationPage;
  let documentBucketPage: DocumentBucketPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    creditAppPage = new CreditApplicationPage(page);
    documentBucketPage = new DocumentBucketPage(page);

    // 1. Tahap Login & Persiapan
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-5@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Navigasi ke Pengajuan kredit & Lanjutkan pengajuan debitur ke Bucket Dokumen
    await creditAppPage.navigateFromSidebar();
    const targetDebitur = process.env.DEBITUR_TARGET || 'MUNAWAROH';
    await creditAppPage.continueApplication(targetDebitur);
    await creditAppPage.selectBucketDokumen();
    await creditAppPage.expectBucketDokumenVisible();
  });

  test('TC01 - Unggah Dokumen pada Kategori Dokumen Pengajuan (Visiting Report)', async ({ page }) => {
    // Tahap 2: Ekspansi Kategori Utama "Dokumen Pengajuan"
    await documentBucketPage.expandCategory('Dokumen Pengajuan');

    // Tahap 2: Ekspansi Sub-kategori / Folder "Dokumen Pengajuan*"
    await documentBucketPage.expandSubCategory('Dokumen Pengajuan*');

    // Tahap 3: Pemilihan Slot Dokumen spesifik ("Visiting Report*")
    await documentBucketPage.selectDocumentSlot('Visiting Report*');

    // Tahap 4 & 5: Injeksi File dari folder lokal & Simpan Dokumen
    const sampleFileName = '2026-09-30_090947.png';
    await documentBucketPage.uploadAndCategorize(sampleFileName, 'Dokumen Pengajuan', 'Visiting Report');

    // Tahap 6: Verifikasi Hasil Unggah Dokumen
    await documentBucketPage.expectUploadSuccess();
  });
});
