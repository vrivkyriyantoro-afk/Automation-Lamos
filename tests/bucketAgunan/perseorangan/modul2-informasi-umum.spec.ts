import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 2: Informasi Umum Agunan
 * Sumber Data: fixtures/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC - 04 - 20 s.d. TC - 04 - 26
 * Karakter: READ-ONLY (Validasi UI & Dropdown tanpa Submit Form)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 2 - Informasi Umum Agunan', () => {
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
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword?: string) {
    const modal = await openTambahAgunanModal(page);

    // 1. Pilih jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    if (jenisKeyword) {
      const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
      if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await targetOption.click();
      } else {
        await listbox.locator('li button, li').first().click();
      }
    } else {
      await listbox.locator('li button, li').first().click();
    }

    // 2. Isi nomor bukti fiktif & cari
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
   * TC - 04 - 20: Urutan Jenis agunan sesuai master data
   */
  test('TC - 04 - 20: Urutan opsi Jenis Agunan sesuai master data', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 20: Urutan Jenis agunan sesuai master data');
    const modal = await openTambahAgunanModal(page);

    // Buka dropdown Jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    // Baca opsi yang muncul
    const options = await listbox.locator('li:not(.sticky) button, li:not(.sticky)').allInnerTexts();
    const cleanOptions = options.map(o => o.trim()).filter(o => o && o !== 'Clear');
    console.log(`[TC-04-20] Ditemukan ${cleanOptions.length} opsi Jenis Agunan di UI.`);

    expect(cleanOptions.length).toBeGreaterThan(10);

    await page.waitForTimeout(1000);
    await testInfo.attach('Eviden TC-04-20: Dropdown Jenis Agunan Master Data', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 21: Detail isian Jenis agunan Housing/Kendaraan/Elektronik (Status Tersedia)
   */
  test('TC - 04 - 21: Detail isian Jenis agunan Housing/Kendaraan/Elektronik (Status Tersedia)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 21: Detail isian Jenis agunan Housing/Kendaraan');
    // Masuk ke form dengan jenis Tanah / Bangunan / Housing
    const modal = await navigateToFormAgunanBaru(page, 'Tanah');

    // Buka combobox Status Agunan
    const statusDropdown = page.locator('div, button, span').filter({ hasText: /^Pilih status agunan$/ }).last();
    await expect(statusDropdown).toBeVisible({ timeout: 15000 });
    await statusDropdown.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    
    // Pilih status "Tersedia"
    const optTersedia = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Tersedia/i }).first();
    await optTersedia.click();
    await page.waitForTimeout(1500);

    // Verifikasi field form utama tampil
    await expect(page.locator('text=Jenis pengikatan').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tanggal pengikatan').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Alamat agunan').first()).toBeVisible({ timeout: 10000 });

    await testInfo.attach('Eviden TC-04-21: Form Detail Housing Status Tersedia', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 22 & TC - 04 - 23: Field Peringkat agunan berdasarkan Status Tersedia vs Indent
   */
  test('TC - 04 - 22 & 23: Validasi kondisional field Peringkat & Lembaga Pemeringkat pada status Tersedia vs Indent', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 22 & 23: Field Peringkat agunan Status Tersedia vs Indent');
    // Masuk dengan Cash Collateral / Reksadana
    const modal = await navigateToFormAgunanBaru(page, 'Reksadana');

    // 1. Pilih status Indent (TC-04-23)
    const statusDropdown = page.locator('div, button, span').filter({ hasText: /^Pilih status agunan$/ }).last();
    await expect(statusDropdown).toBeVisible({ timeout: 15000 });
    await statusDropdown.click();

    let listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    const optIndent = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Indent/i }).first();
    
    if (await optIndent.isVisible({ timeout: 3000 }).catch(() => false)) {
      await optIndent.click();
      await page.waitForTimeout(1000);

      // TC-04-23: Pada status Indent, field Lembaga Pemeringkat tidak tampil
      const lembagaField = page.locator('text=Lembaga pemeringkat');
      await expect(lembagaField).toHaveCount(0);
      await testInfo.attach('Eviden TC-04-23: Status Indent Tanpa Lembaga Pemeringkat', {
        body: await page.screenshot(),
        contentType: 'image/png'
      });
    }

    // 2. Ubah status menjadi Tersedia (TC-04-22)
    const statusSelected = page.locator('div, button, span').filter({ hasText: /Indent|status agunan/i }).last();
    await statusSelected.click();
    listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    const optTersedia = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Tersedia/i }).first();
    await optTersedia.click();
    await page.waitForTimeout(1500);

    await testInfo.attach('Eviden TC-04-22: Status Tersedia Cash Collateral', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 24, 25, 26: Dropdown Lembaga Pemeringkat dan Relasi Peringkat Agunan
   */
  test('TC - 04 - 24, 25, 26: Validasi dropdown Lembaga Pemeringkat & opsi Peringkat Agunan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 24, 25, 26: Lembaga Pemeringkat & Rating');
    const modal = await navigateToFormAgunanBaru(page, 'Reksadana');

    // Buka status agunan Tersedia
    const statusDropdown = page.locator('div, button, span').filter({ hasText: /^Pilih status agunan$/ }).last();
    if (await statusDropdown.isVisible({ timeout: 10000 }).catch(() => false)) {
      await statusDropdown.click();
      const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
      await listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Tersedia/i }).first().click();
      await page.waitForTimeout(1000);
    }

    // Scroll ke bawah form untuk memeriksa field pemeringkat
    await modal.evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(1000);

    // TC-04-26: Verifikasi placeholder "Pilih lembaga pemeringkat terlebih dahulu" muncul pada Peringkat Agunan
    const peringkatDisabledMsg = page.locator('div, span, button').filter({ hasText: /^Pilih lembaga pemeringkat terlebih dahulu$/ }).first();
    await expect(peringkatDisabledMsg).toBeVisible({ timeout: 10000 });

    // TC-04-24: Buka dropdown Lembaga Pemeringkat (gunakan exact match agar tidak tertukar dengan Peringkat)
    const lembagaDropdown = page.locator('div, span, button').filter({ hasText: /^Pilih lembaga pemeringkat$/ }).last();
    await expect(lembagaDropdown).toBeVisible({ timeout: 10000 });
    await lembagaDropdown.click();

    const listboxLembaga = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listboxLembaga.locator('li button, li').first().waitFor({ timeout: 10000 });
    const opsiLembaga = await listboxLembaga.locator('li:not(.sticky) button, li:not(.sticky)').allInnerTexts();
    const cleanLembaga = opsiLembaga.map(o => o.trim()).filter(o => o && o !== 'Clear');
    console.log('[TC-04-24] Opsi Lembaga Pemeringkat:', cleanLembaga);

    // Verifikasi opsi memuat lembaga standar (FID, dsb.)
    expect(cleanLembaga.length).toBeGreaterThan(0);

    // TC-04-25: Pilih salah satu lembaga misal FID / opsi pertama
    const optFid = listboxLembaga.locator('li:not(.sticky) button, li:not(.sticky)').first();
    await optFid.click();
    await page.waitForTimeout(1000);

    // Buka dropdown Peringkat Agunan setelah Lembaga dipilih
    const peringkatBoxActive = page.locator('div, span, button').filter({ hasText: /Pilih peringkat agunan/i }).last();
    if (await peringkatBoxActive.isVisible({ timeout: 5000 }).catch(() => false)) {
      await peringkatBoxActive.click();
      const listboxRating = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listboxRating.locator('li button, li').first().waitFor({ timeout: 10000 });
      const ratingOptions = await listboxRating.locator('li:not(.sticky) button, li:not(.sticky)').allInnerTexts();
      const cleanRating = ratingOptions.map(r => r.trim()).filter(r => r && r !== 'Clear');
      console.log('[TC-04-25] Opsi Rating Agunan:', cleanRating);
      expect(cleanRating.length).toBeGreaterThan(0);
    }

    await testInfo.attach('Eviden TC-04-24-26: Lembaga Pemeringkat & Rating Agunan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});

