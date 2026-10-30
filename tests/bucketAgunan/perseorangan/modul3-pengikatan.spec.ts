import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 3: Pengikatan Agunan
 * Sumber Data: fixtures/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC - 04 - 27 s.d. TC - 04 - 30
 * Karakter: READ-ONLY (Validasi UI, Mandatory Marker, & Dynamic Conditional Field tanpa submit)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 3 - Pengikatan Agunan', () => {
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
    return activeModal;
  }

  /**
   * Helper: Pilih status agunan di Form Tambah Agunan (Tersedia atau Indent)
   */
  async function selectStatusAgunan(page: Page, statusText: 'Tersedia' | 'Indent') {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });

    const opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(statusText, 'i') }).first();
    await expect(opt).toBeVisible({ timeout: 5000 });
    await opt.click();
    await page.waitForTimeout(1500);
  }

  /**
   * Helper: Pilih jenis pengikatan di Form Tambah Agunan
   */
  async function selectJenisPengikatan(page: Page, keyword: string) {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih jenis pengikatan|06|Belum diikat|Hak Tanggungan|Fidusia|Gadai|Hipotek/i }).first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });

    let opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(keyword, 'i') }).first();
    if (keyword === 'non-06') {
      opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasNotText: /06|Belum diikat/i }).first();
    }
    await expect(opt).toBeVisible({ timeout: 5000 });
    const selectedText = (await opt.innerText()).trim();
    await opt.click();
    await page.waitForTimeout(1500);
    return selectedText;
  }

  /**
   * TC - 04 - 30: Status Tersedia menampilkan form pengikatan
   */
  test('TC - 04 - 30: Status Tersedia menampilkan field Jenis Pengikatan & Tanggal Pengikatan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 30: Status Tersedia menampilkan pengikatan');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pilih Status Agunan = Tersedia
    await selectStatusAgunan(page, 'Tersedia');

    // Verifikasi field Jenis Pengikatan & Tanggal Pengikatan muncul di layar
    const labelJenisPengikatan = page.locator('label, span, div').filter({ hasText: /^Jenis pengikatan/i }).first();
    const labelTanggalPengikatan = page.locator('label, span, div').filter({ hasText: /^Tanggal pengikatan/i }).first();

    await expect(labelJenisPengikatan).toBeVisible({ timeout: 10000 });
    await expect(labelTanggalPengikatan).toBeVisible({ timeout: 10000 });

    console.log('[TC-04-30] Field Jenis Pengikatan & Tanggal Pengikatan berhasil tampil pada Status Tersedia.');

    await testInfo.attach('Eviden TC-04-30: Status Tersedia Menampilkan Pengikatan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 29: Status Indent menyembunyikan pengikatan
   */
  test('TC - 04 - 29: Status Indent menyembunyikan field Jenis Pengikatan & Tanggal Pengikatan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 29: Status Indent menyembunyikan pengikatan');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pilih Status Agunan = Indent
    await selectStatusAgunan(page, 'Indent');

    // Verifikasi field Jenis Pengikatan & Tanggal Pengikatan tidak tampil
    const labelJenisPengikatan = page.locator('label, span, div').filter({ hasText: /^Jenis pengikatan/i });
    const labelTanggalPengikatan = page.locator('label, span, div').filter({ hasText: /^Tanggal pengikatan/i });

    await expect(labelJenisPengikatan).toHaveCount(0);
    await expect(labelTanggalPengikatan).toHaveCount(0);

    console.log('[TC-04-29] Field Pengikatan berhasil tersembunyi pada Status Indent.');

    await testInfo.attach('Eviden TC-04-29: Status Indent Menyembunyikan Pengikatan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 27: Tanggal pengikatan wajib bila jenis pengikatan ≠ 06
   */
  test('TC - 04 - 27: Tanggal pengikatan wajib bila jenis pengikatan ≠ 06 (Belum diikat)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 27: Tanggal pengikatan wajib bila pengikatan ≠ 06');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Status Tersedia
    await selectStatusAgunan(page, 'Tersedia');

    // 2. Pilih Jenis Pengikatan selain 06
    const selectedText = await selectJenisPengikatan(page, 'non-06');
    console.log(`[TC-04-27] Memilih jenis pengikatan: ${selectedText}`);

    // 3. Verifikasi tanda wajib / asterisk (*) pada label Tanggal Pengikatan
    const labelTanggalPengikatan = page.locator('label, span, div').filter({ hasText: /^Tanggal pengikatan/i }).first();
    await expect(labelTanggalPengikatan).toBeVisible({ timeout: 10000 });
    const labelFullText = await labelTanggalPengikatan.innerText();
    
    console.log(`[TC-04-27] Label Tanggal Pengikatan text="${labelFullText}"`);
    expect(labelFullText).toContain('*');

    await testInfo.attach('Eviden TC-04-27: Tanggal Pengikatan Wajib (Non-06)', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 28: Tanggal pengikatan opsional bila jenis pengikatan = 06 (Belum diikat)
   */
  test('TC - 04 - 28: Tanggal pengikatan opsional bila jenis pengikatan = 06 - Belum diikat', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 28: Tanggal pengikatan opsional bila pengikatan = 06');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Status Tersedia
    await selectStatusAgunan(page, 'Tersedia');

    // 2. Pilih Jenis Pengikatan = 06 / Belum diikat
    const selectedText = await selectJenisPengikatan(page, '06|Belum diikat');
    console.log(`[TC-04-28] Memilih jenis pengikatan: ${selectedText}`);

    // 3. Verifikasi apakah label Tanggal Pengikatan opsional (tidak ada tanda bintang *)
    const labelTanggalPengikatan = page.locator('label, span, div').filter({ hasText: /^Tanggal pengikatan/i }).first();
    const labelFullText = await labelTanggalPengikatan.innerText();

    console.log(`[TC-04-28] Label Tanggal Pengikatan text="${labelFullText}"`);
    // Bila opsional, asteriks tidak ada pada label
    expect(labelFullText.includes('*')).toBeFalsy();

    await testInfo.attach('Eviden TC-04-28: Tanggal Pengikatan Opsional (06 Belum Diikat)', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
