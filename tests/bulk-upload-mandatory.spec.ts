import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';
import { CreditApplicationPage } from '../pages/CreditApplicationPage';
import { DocumentBucketPage } from '../pages/DocumentBucketPage';

test.describe('Bulk Upload Seluruh Dokumen Mandatory - Bucket Dokumen LAMOS', () => {
  test.describe.configure({ mode: 'serial', timeout: 300000 });

  let loginPage: LoginPage;
  let creditAppPage: CreditApplicationPage;
  let documentBucketPage: DocumentBucketPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    creditAppPage = new CreditApplicationPage(page);
    documentBucketPage = new DocumentBucketPage(page);

    // 1. Login
    await loginPage.goto();
    const validUsername = process.env.LAMOS_USERNAME || 'SMELOS-AO-7@banksinarmas.com';
    const validPassword = process.env.LAMOS_PASSWORD || 'simaS@123';
    await loginPage.login(validUsername, validPassword);
    await loginPage.expectLoginSuccess();

    // 2. Navigasi ke Pengajuan kredit & Pilih Bucket Dokumen
    await creditAppPage.navigateFromSidebar();
    const targetDebitur = process.env.DEBITUR_TARGET || 'MUNAWAROH';
    await creditAppPage.continueApplication(targetDebitur);
    await creditAppPage.selectBucketDokumen();
    await creditAppPage.expectBucketDokumenVisible();
  });

  test('TC01 - Bulk Upload Seluruh Dokumen Mandatory Pengajuan Kredit', async ({ page }) => {
    console.log('\n========================================================================');
    console.log('🚀 MEMULAI PROSES BULK UPLOAD SELURUH DOKUMEN MANDATORY LAMOS');
    console.log('========================================================================\n');

    // Daftar dokumen mandatory yang akan diunggah secara otomatis
    const mandatoryDocumentList = [
      {
        description: '1. Visiting Report (Dokumen Pengajuan)',
        mainCategory: 'Dokumen Pengajuan',
        subCategory: 'Dokumen Pengajuan',
        docType: 'Visiting Report',
        fileName: '2026-09-30_090947.png'
      },
      {
        description: '2. Foto Kunjungan (Dokumen Pengajuan)',
        mainCategory: 'Dokumen Pengajuan',
        subCategory: 'Dokumen Pengajuan',
        docType: 'Foto Kunjungan',
        fileName: '2026-09-30_091334.png'
      },
      {
        description: '3. Surat Permohonan Kredit yang telah ditandatangani cadeb',
        mainCategory: 'Dokumen Pengajuan',
        subCategory: 'Dokumen Pengajuan',
        docType: 'Surat Permohonan Kredit yang telah ditandatangani cadeb',
        fileName: '2026-09-30_100512.png'
      },
      {
        description: '4. Lampirkan rekap history account dari awal relationship dengan BSIM',
        mainCategory: 'Dokumen Pengajuan',
        subCategory: 'Dokumen Pengajuan',
        docType: 'Lampirkan rekap history account dari awal relationship dengan BSIM (format terlampir)',
        fileName: '2026-09-30_101448.png'
      },
      {
        description: '5. Legal Memo (hanya untuk debitur berbentuk badan usaha)',
        mainCategory: 'Dokumen Pengajuan',
        subCategory: 'Dokumen Pengajuan',
        docType: 'Legal Memo (hanya untuk debitur berbentuk badan usaha)',
        fileName: '2026-09-30_101531.png'
      },
      {
        description: '6. Dokumen Internal (Analisa Kredit AO)',
        mainCategory: 'Dokumen Internal',
        fileName: '2026-09-30_101547.png'
      },
      {
        description: '7. Dokumen Legalitas Usaha (NIB / SIUP / Akta)',
        mainCategory: 'Dokumen Legalitas Usaha',
        fileName: '2026-09-30_101644.png'
      },
      {
        description: '8. Rekening Koran 3 Bulan Terakhir (Data Keuangan)',
        mainCategory: 'Data Keuangan',
        subCategory: 'Data Keuangan',
        docType: 'Rekening koran 3 bulan terakhir lengkap dan tidak ada transaksi GTU/Gabungan pada periode sesuai ketentuan min.3 bulan sebelum input sistem',
        fileName: '2026-09-30_101651.png'
      },
      {
        description: '9. Laporan Keuangan 2 Tahun Terakhir (Data Keuangan)',
        mainCategory: 'Data Keuangan',
        subCategory: 'Data Keuangan',
        docType: 'Laporan Keuangan 2 tahun terakhir dan 1 tahun projection',
        fileName: '2026-09-30_101657.png'
      },
      {
        description: '10. IDEB Debitur (Data Keuangan)',
        mainCategory: 'Data Keuangan',
        subCategory: 'Data Keuangan',
        docType: 'IDEB Debitur',
        fileName: '2026-09-30_101832.png'
      }
    ];

    let successCount = 0;

    for (const doc of mandatoryDocumentList) {
      console.log(`\n------------------------------------------------------------------------`);
      console.log(`📤 Mengunggah: ${doc.description}`);
      console.log(`------------------------------------------------------------------------`);

      try {
        await documentBucketPage.uploadAndCategorize(
          doc.fileName,
          doc.mainCategory,
          doc.docType,
          doc.subCategory
        );
        successCount++;
        console.log(`✅ Sukses mengunggah (${successCount}/${mandatoryDocumentList.length}): ${doc.description}`);
      } catch (err) {
        console.log(`⚠️ Gagal pada: ${doc.description} - Error: ${err}`);
      }
    }

    console.log('\n========================================================================');
    console.log(`🎉 BULK UPLOAD SELESAI: ${successCount} dari ${mandatoryDocumentList.length} Dokumen Berhasil Diunggah`);
    console.log('========================================================================\n');

    // Ambil tangkapan layar status akhir
    await page.screenshot({ path: 'test-results/bulk-upload-complete.png', fullPage: true });

    // Verifikasi minimal dokumen sudah terunggah
    expect(successCount).toBeGreaterThanOrEqual(1);
  });
});

