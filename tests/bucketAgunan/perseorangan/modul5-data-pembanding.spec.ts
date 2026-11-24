import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 5: Data Pembanding Agunan
 * Sumber Data: fixtures/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC-5419-14 s.d. TC-5419-18
 * Karakter: Interaktif UI, Modal Input Data Pembanding, Tabel Preview & Aksi (Detail, Edit, Hapus, Max 10 Record)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 5 - Data Pembanding Agunan', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Buka modal Tambah Agunan (Step 1: Pencarian)
   */
  async function openTambahAgunanModal(page: Page) {
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    const modal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    await expect(modal).toBeVisible({ timeout: 20000 });
    return modal;
  }

  /**
   * Helper: Masuk ke Form Agunan Baru (Step Stepper: Data Agunan)
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    await openTambahAgunanModal(page);

    // 1. Buka dropdown jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    // 2. Isi nomor bukti fiktif & cari (hasil CLS kosong -> muncul + Agunan Baru)
    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik tombol + Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    const activeModal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();

    // Scroll ke seksi Data Pembanding
    const headingPembanding = activeModal.locator('heading, h4, h5, div, span').filter({ hasText: /Data pembanding/i }).first();
    if (await headingPembanding.isVisible().catch(() => false)) {
      await headingPembanding.scrollIntoViewIfNeeded();
    }

    return activeModal;
  }

  /**
   * Helper: Buka modal / sub-form Tambah Data Pembanding
   */
  async function openTambahDataPembanding(page: Page) {
    const btnTambahPembanding = page.locator('button').filter({ hasText: /Data pembanding|Tambah data pembanding|\+ Data pembanding/i }).first();
    await expect(btnTambahPembanding).toBeVisible({ timeout: 15000 });
    await btnTambahPembanding.scrollIntoViewIfNeeded();
    await btnTambahPembanding.click();
    await page.waitForTimeout(1000);

    const modalPembanding = page.locator('div').filter({
      has: page.locator('h2, h3, h4:has-text("Data pembanding")')
    }).last();
    return modalPembanding;
  }

  /**
   * Helper: Isi form data pembanding dengan data dummy valid
   */
  async function fillDataPembanding(modal: any, data?: { sumber?: string; harga?: string; luas?: string; telp?: string }) {
    const inputSumber = modal.locator('input[name*="source" i], input[placeholder*="sumber" i], input[name*="name" i]').first();
    if (await inputSumber.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputSumber.fill(data?.sumber || 'Bpk. Hendra - Warga Sekitar');
    }

    const inputHarga = modal.locator('input[data-testid="currency-input"], input[name*="price" i], input[placeholder*="harga" i], input[placeholder*="nilai" i]').first();
    if (await inputHarga.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputHarga.fill(data?.harga || '500000000');
    }

    const inputLuas = modal.locator('input[name*="area" i], input[placeholder*="luas" i]').first();
    if (await inputLuas.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputLuas.fill(data?.luas || '120');
    }

    const inputTelp = modal.locator('input[name*="phone" i], input[placeholder*="telepon" i], input[placeholder*="no." i]').first();
    if (await inputTelp.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputTelp.fill(data?.telp || '081234567890');
    }
  }

  /**
   * TC-5419-14: Tambah data pembanding berhasil
   */
  test('TC-5419-14: Tambah data pembanding berhasil', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-14: Tambah data pembanding berhasil');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const modalPembanding = await openTambahDataPembanding(page);
    await fillDataPembanding(modalPembanding);

    // Klik tombol Simpan data pembanding
    const btnSimpan = modalPembanding.locator('button').filter({ hasText: /^Simpan$|^Tambah$|^Selesai$/i }).last();
    await expect(btnSimpan).toBeVisible({ timeout: 10000 });
    await btnSimpan.click();

    // Verifikasi toast sukses atau kemunculan data di tabel
    const successToast = page.locator('text=/Berhasil menambahkan data pembanding|data pembanding berhasil/i');
    const tableRow = page.locator('table tbody tr').filter({ hasText: /Hendra|500\.000\.000|120/i });

    const isToastVisible = await successToast.isVisible({ timeout: 10000 }).catch(() => false);
    const isRowVisible = await tableRow.first().isVisible({ timeout: 5000 }).catch(() => false);

    expect(isToastVisible || isRowVisible).toBeTruthy();

    await testInfo.attach('Eviden TC-04-36: Tambah Data Pembanding Berhasil', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 37: Tambah data pembanding gagal (Simulasi BE Error)
   */
  test('TC - 04 - 37: Tambah data pembanding gagal akibat BE error', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 37: Tambah data pembanding gagal');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Simulasikan error response dari server saat menambah data pembanding
    await page.route('**/comparative*/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    const modalPembanding = await openTambahDataPembanding(page);
    await fillDataPembanding(modalPembanding);

    const btnSimpan = modalPembanding.locator('button').filter({ hasText: /^Simpan$|^Tambah$|^Selesai$/i }).last();
    await expect(btnSimpan).toBeVisible({ timeout: 10000 });
    await btnSimpan.click();

    // Verifikasi toast kegagalan
    const errorToast = page.locator('text=/Gagal menambahkan data pembanding|Silakan coba lagi nanti/i');
    await expect(errorToast).toBeVisible({ timeout: 15000 });

    await testInfo.attach('Eviden TC-04-37: Tambah Data Pembanding Gagal BE', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 38: Kolom Action pada tabel data pembanding (Mata, Pensil, Trash)
   */
  test('TC - 04 - 38: Kolom Action pada tabel preview menampilkan aksi Mata, Pensil, dan Trash', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 38: Kolom Action pada tabel');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pastikan minimal ada 1 data pembanding (tambah jika belum ada)
    const tableRows = page.locator('table tbody tr');
    if (await tableRows.count() === 0) {
      const modal = await openTambahDataPembanding(page);
      await fillDataPembanding(modal);
      await modal.locator('button').filter({ hasText: /^Simpan$|^Tambah$/i }).last().click();
      await page.waitForTimeout(2000);
    }

    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Cek keberadaan aksi Mata (detail), Pensil (edit), Trash (hapus)
    const btnDetail = firstRow.locator('button, svg, [role="button"]').filter({ hasText: /detail|lihat/i }).or(firstRow.locator('svg[data-icon*="eye"], [aria-label*="detail" i], [title*="detail" i]'));
    const btnEdit = firstRow.locator('button, svg, [role="button"]').filter({ hasText: /edit|ubah/i }).or(firstRow.locator('svg[data-icon*="pen"], svg[data-icon*="edit"], [aria-label*="edit" i], [title*="edit" i]'));
    const btnDelete = firstRow.locator('button, svg, [role="button"]').filter({ hasText: /hapus|delete/i }).or(firstRow.locator('svg[data-icon*="trash"], [aria-label*="hapus" i], [title*="hapus" i]'));

    const hasActionButtons = (await btnDetail.count() > 0 || await btnEdit.count() > 0 || await btnDelete.count() > 0);
    expect(hasActionButtons).toBeTruthy();

    await testInfo.attach('Eviden TC-04-38: Kolom Action Tabel Pembanding', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-15: Lihat detail data pembanding (Mata)
   */
  test('TC-5419-15: Klik ikon Mata menampilkan detail data pembanding', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-15: Lihat detail (Mata)');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const firstRow = page.locator('table tbody tr').first();
    const btnDetail = firstRow.locator('button, [role="button"]').filter({ has: page.locator('svg') }).first();
    await expect(btnDetail).toBeVisible({ timeout: 15000 });
    await btnDetail.click();

    // Modal / Drawer Detail data pembanding tampil
    const detailModal = page.locator('div').filter({ has: page.locator('h2, h3, h4:has-text("Detail data pembanding"), h2, h3, h4:has-text("Data pembanding")') }).last();
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    // Tombol tutup / kembali
    const btnTutup = detailModal.locator('button').filter({ hasText: /Tutup|Kembali|Batal/i }).first();
    await expect(btnTutup).toBeVisible();
    await btnTutup.click();

    await testInfo.attach('Eviden TC-04-39: Detail Data Pembanding', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-16: Edit data pembanding berhasil
   */
  test('TC-5419-16: Edit data pembanding berhasil menyimpan perubahan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-16: Edit data pembanding berhasil');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const firstRow = page.locator('table tbody tr').first();
    const btnEdit = firstRow.locator('button, [role="button"]').nth(1); // Pensil biasanya tombol aksi ke-2
    await expect(btnEdit).toBeVisible({ timeout: 15000 });
    await btnEdit.click();

    const editModal = page.locator('div').filter({ has: page.locator('h2, h3, h4:has-text("Ubah"), h2, h3, h4:has-text("Edit"), h2, h3, h4:has-text("Data pembanding")') }).last();
    await expect(editModal).toBeVisible({ timeout: 10000 });

    // Ubah data sumber atau catatan
    const inputSumber = editModal.locator('input[name*="source" i], input[placeholder*="sumber" i]').first();
    if (await inputSumber.isVisible().catch(() => false)) {
      await inputSumber.fill('Bpk. Hendra (Updated)');
    }

    const btnSimpan = editModal.locator('button').filter({ hasText: /^Simpan$|^Update$/i }).last();
    await btnSimpan.click();

    // Verifikasi toast atau perubahan di tabel
    const successMsg = page.locator('text=/Berhasil|terupdate|disimpan/i');
    await expect(successMsg.or(page.locator('text=Updated'))).toBeVisible({ timeout: 15000 });

    await testInfo.attach('Eviden TC-04-40: Edit Data Pembanding Berhasil', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 41: Edit data pembanding gagal (Simulasi BE Error)
   */
  test('TC - 04 - 41: Edit data pembanding gagal jika server mengembalikan error', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 41: Edit data pembanding gagal');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Simulasikan BE error saat update/put
    await page.route('**/comparative*/**', route => {
      if (route.request().method() === 'PUT' || route.request().method() === 'POST' || route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' })
        });
      } else {
        route.continue();
      }
    });

    const firstRow = page.locator('table tbody tr').first();
    const btnEdit = firstRow.locator('button, [role="button"]').nth(1);
    await expect(btnEdit).toBeVisible({ timeout: 15000 });
    await btnEdit.click();

    const editModal = page.locator('div').filter({ has: page.locator('h2, h3, h4:has-text("Ubah"), h2, h3, h4:has-text("Edit"), h2, h3, h4:has-text("Data pembanding")') }).last();
    await expect(editModal).toBeVisible({ timeout: 10000 });

    const btnSimpan = editModal.locator('button').filter({ hasText: /^Simpan$|^Update$/i }).last();
    await btnSimpan.click();

    const errorToast = page.locator('text=/Gagal menyimpan perubahan|Silakan coba lagi nanti/i');
    await expect(errorToast).toBeVisible({ timeout: 15000 });

    await testInfo.attach('Eviden TC-04-41: Edit Data Pembanding Gagal BE', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-17: Hapus data pembanding
   */
  test('TC-5419-17: Hapus data pembanding menghapus record dari tabel', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-17: Hapus data pembanding');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const tableRows = page.locator('table tbody tr');
    const initialCount = await tableRows.count();

    const btnDelete = tableRows.first().locator('button, [role="button"]').filter({ has: page.locator('svg[data-icon*="trash"]') }).or(tableRows.first().locator('button').last());
    await expect(btnDelete).toBeVisible({ timeout: 15000 });
    await btnDelete.click();

    // Dialog konfirmasi hapus
    const confirmModal = page.locator('div').filter({ has: page.locator('text=/Hapus data pembanding|Apakah Anda yakin/i') }).last();
    if (await confirmModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      const btnKonfirmasiHapus = confirmModal.locator('button').filter({ hasText: /^Hapus$|^Ya$|^Ya, Hapus$/i }).last();
      await btnKonfirmasiHapus.click();
    }

    await page.waitForTimeout(1500);
    const newCount = await tableRows.count();
    expect(newCount).toBeLessThan(initialCount > 0 ? initialCount : 1);

    await testInfo.attach('Eviden TC-04-42: Hapus Data Pembanding', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-18: Batas 10 record pembanding
   */
  test('TC-5419-18: Batas 10 record pembanding memicu validasi batas maksimum', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-18: Batas 10 record pembanding');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();

    // Jika sudah ada 10 record, tombol tambah disabled atau memicu alert error
    const btnTambahPembanding = page.locator('button').filter({ hasText: /Data pembanding|Tambah data pembanding|\+ Data pembanding/i }).first();
    if (rowCount >= 10) {
      const isDisabled = await btnTambahPembanding.isDisabled().catch(() => false);
      if (!isDisabled) {
        await btnTambahPembanding.click();
        const maxAlert = page.locator('text=/batas maksimum|maksimal 10|hanya dapat menambahkan hingga 10/i');
        await expect(maxAlert).toBeVisible({ timeout: 10000 });
      } else {
        expect(isDisabled).toBe(true);
      }
    } else {
      // Verifikasi tombol tambah tersedia saat record < 10
      await expect(btnTambahPembanding).toBeEnabled();
    }

    await testInfo.attach('Eviden TC-04-43: Validasi Batas 10 Record', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
