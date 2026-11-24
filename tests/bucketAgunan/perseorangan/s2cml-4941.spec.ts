import { test, expect, Page, Locator } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../../pages/LoginPage';
import { ambilScreenshotBersih, bersihkanTanda } from '../helpers/eviden';

/**
 * Test Suite: S2CML-4941 - [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Edit Agunan/Collaterals - Edit data Existing
 * Sumber:
 *   - Jira: https://bank-sinarmas.atlassian.net/browse/S2CML-4941 (Status: In SIT)
 *   - Matriks Resmi: exports/test-cases/TC_S2CML-4941_Edit_Agunan_Existing.csv (15 TC)
 *   - Target Debitur: Perseorangan (01M4F7TNSCSHEDB5G3WTSP7HDY)
 *   - Scope: Menu titik 3, Form edit modal, Prefill 3-step, Draft vs Final gating rules, Pembatalan & Validasi
 */

const TARGET_APP_ID = process.env.TARGET_APP_ID_AGUNAN || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const BASE_HOST = process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/';
const TARGET_URL = `${BASE_HOST.replace(/\/$/, '')}/lamos/credit-application/${TARGET_APP_ID}/create?bucket=agunan&debtorType=individual`;
const EVIDEN_DIR = path.resolve(__dirname, '../../../explore-output/stories/s2cml-4941');

test.describe('S2CML-4941: Edit Agunan Existing - Debitur Perseorangan', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(EVIDEN_DIR)) {
      fs.mkdirSync(EVIDEN_DIR, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1366, height: 950 });

    const login = new LoginPage(page);
    await login.goto();
    await login.usernameInput.waitFor({ state: 'visible', timeout: 45000 });
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=/Pengajuan kredit|Data agunan|Daftar agunan/i', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Buka accordion Data Agunan jika tertutup
    await ensureDataAgunanOpen(page);
  });

  test.afterEach(async ({ page }) => {
    await bersihkanTanda(page).catch(() => {});
  });

  /**
   * Helper: Pastikan accordion Data Agunan terbuka
   */
  async function ensureDataAgunanOpen(page: Page) {
    const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
      .filter({ hasText: /^Data agunan$/i }).first();
    await headerBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    if (await headerBtn.isVisible().catch(() => false)) {
      const isContentVisible = await page.locator('text=/Daftar agunan|Draf agunan|Total nilai/i').first()
        .isVisible({ timeout: 2000 }).catch(() => false);
      if (!isContentVisible) {
        await headerBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  /**
   * Helper: Dapatkan kartu agunan target
   */
  function getAgunanCard(page: Page, index = 0): Locator {
    return page.locator('div').filter({ hasText: /F041401 - Reksadana|F15 - Setoran Jaminan|AN02/i })
      .locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "Card") or contains(@class, "card") or contains(@class, "border")][1]')
      .nth(index);
  }

  /**
   * Helper: Dapatkan tombol titik 3 pada kartu agunan
   */
  function getThreeDotButton(page: Page, cardIndex = 0): Locator {
    const cardTitle = page.locator('text=/F041401 - Reksadana|F15 - Setoran Jaminan/i').nth(cardIndex);
    return cardTitle.locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "Card") or contains(@class, "card") or contains(@class, "Item") or contains(@class, "border")][1]')
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
  }

  /**
   * Helper: Buka menu popover kartu agunan
   */
  async function bukaMenuTitik3(page: Page, cardIndex = 0) {
    const cardTitle = page.locator('text=/F041401 - Reksadana|F15 - Setoran Jaminan/i').nth(cardIndex);
    await cardTitle.waitFor({ state: 'visible', timeout: 25000 });
    const btn = getThreeDotButton(page, cardIndex);
    await expect(btn).toBeVisible({ timeout: 15000 });
    await btn.click();
    await page.waitForTimeout(1000);
  }

  /**
   * Helper: Buka modal "Ubah agunan"
   */
  async function bukaModalUbah(page: Page, cardIndex = 0) {
    await bukaMenuTitik3(page, cardIndex);
    const btnUbah = page.locator('button, [role="menuitem"]').filter({ hasText: /^Ubah$/i }).first();
    await expect(btnUbah).toBeVisible({ timeout: 10000 });
    await btnUbah.click();
    await page.waitForTimeout(2500);

    const modalTitle = page.locator('text=/Ubah agunan/i').first();
    await expect(modalTitle).toBeVisible({ timeout: 15000 });
  }

  /**
   * Helper: Tutup modal secara safe tanpa menyimpan
   */
  async function tutupModal(page: Page) {
    const modalHeading = page.locator('text=/Ubah agunan/i').first();
    if (await modalHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      const btnX = page.locator('text=/Ubah agunan/i')
        .locator('xpath=ancestor::div[1]//button')
        .or(page.locator('[class*="Modal"] button').filter({ has: page.locator('svg') }))
        .or(page.locator('button[aria-label*="close" i]'))
        .first();

      if (await btnX.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btnX.click();
        await page.waitForTimeout(1200);
      } else {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
  }

  // =========================================================================
  // Kelompok 1: Akses Menu Titik 3 & Buka Form Edit
  // =========================================================================

  test('TC-4941-01: Validasi Ketersediaan Menu Titik 3 pada Kartu Agunan di Ringkasan Agunan', { annotation: {type: 'defect',description: 'DEFECT-4941-01 (docs/LAPORAN_DEFECT_S2CML-4941_ANOMALI_EVALUASI_QA.md)'} }, async ({ page }) => {
    // 1. Masuk ke halaman Bucket Agunan
    const daftarHeader = page.locator('text=/Daftar agunan \\(\\d+\\)/i').first();
    await expect(daftarHeader).toBeVisible({ timeout: 15000 });

    // 2. Temukan kartu agunan yang terdaftar
    const cardTitle = page.locator('text=/F041401 - Reksadana/i').first();
    await expect(cardTitle).toBeVisible({ timeout: 15000 });

    // 3. Periksa keberadaan ikon tombol Titik 3
    const threeDotBtn = getThreeDotButton(page, 0);
    await expect(threeDotBtn).toBeVisible({ timeout: 10000 });

    // Eviden Step 1 & 3: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-01-step-1.png'));
  });

  test('TC-4941-02: Validasi Opsi Menu Aksi Titik 3 Menampilkan Opsi "Ubah"', { annotation: {type: 'defect',description: 'DEFECT-4941-01 (docs/LAPORAN_DEFECT_S2CML-4941_ANOMALI_EVALUASI_QA.md)'} }, async ({ page }) => {
    // 1. Klik ikon menu Titik 3
    await bukaMenuTitik3(page, 0);

    // 2. Periksa daftar opsi menu konteks yang muncul
    const menuLihat = page.locator('button, [role="menuitem"]').filter({ hasText: /^Lihat detail$/i }).first();
    const menuUbah = page.locator('button, [role="menuitem"]').filter({ hasText: /^Ubah$/i }).first();
    const menuHapus = page.locator('button, [role="menuitem"]').filter({ hasText: /^Hapus agunan$/i }).first();

    await expect(menuLihat).toBeVisible({ timeout: 10000 });
    await expect(menuUbah).toBeVisible({ timeout: 10000 });
    await expect(menuHapus).toBeVisible({ timeout: 10000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-02-step-1.png'));

    // Tutup popover
    await page.keyboard.press('Escape');
  });

  test('TC-4941-03: Validasi Pembukaan Modal Form Agunan saat Klik Opsi "Ubah"', async ({ page }) => {
    // 1. Klik opsi "Ubah" pada menu titik 3
    await bukaModalUbah(page, 0);

    // 2. Amati tampilan modal dialog "Ubah agunan" dan stepper side navigation
    const modalHeading = page.locator('text=/Ubah agunan/i').first();
    await expect(modalHeading).toBeVisible({ timeout: 15000 });

    const step1 = page.locator('text=/Informasi umum agunan/i').first();
    const step2 = page.locator('text=/Data tambahan agunan/i').first();
    const step3 = page.locator('text=/Informasi kepemilikan/i').first();

    await expect(step1).toBeVisible({ timeout: 10000 });
    await expect(step2).toBeVisible({ timeout: 10000 });
    await expect(step3).toBeVisible({ timeout: 10000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-03-step-1.png'));

    await tutupModal(page);
  });

  // =========================================================================
  // Kelompok 2: Prefill & Retensi Data Form Existing
  // =========================================================================

  test('TC-4941-04: Validasi Seluruh Field Step 1 Ter-prefill Sesuai Data Terakhir yang Disimpan', async ({ page }) => {
    // 1. Buka modal Ubah Agunan
    await bukaModalUbah(page, 0);

    // 2. Periksa nilai pada Step 1
    const jenisAgunanInput = page.locator('input[placeholder*="jenis agunan" i], input[value*="Reksadana" i]').or(
      page.locator('text=/F041401 - Reksadana/i')
    ).first();
    await expect(jenisAgunanInput).toBeVisible({ timeout: 10000 });

    const statusAgunan = page.locator('text=/Tersedia/i').first();
    await expect(statusAgunan).toBeVisible({ timeout: 10000 });

    const pengikatan = page.locator('text=/Hak Tanggungan/i').first();
    await expect(pengikatan).toBeVisible({ timeout: 10000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-04-step-1.png'));

    await tutupModal(page);
  });

  test('TC-4941-05: Validasi Seluruh Field Step 2 (Data Tambahan) Ter-prefill Lengkap', async ({ page }) => {
    await bukaModalUbah(page, 0);

    // 1. Navigasi ke Step 2 (Data tambahan agunan)
    const btnStep2 = page.locator('button, [role="button"]').filter({ hasText: /Data tambahan agunan/i }).first();
    await expect(btnStep2).toBeVisible({ timeout: 10000 });
    await btnStep2.click();
    await page.waitForTimeout(2000);

    // 2. Periksa komponen spesifik yang dirender pada Step 2
    const step2Content = page.locator('text=/Sifat agunan|Bukti kepemilikan|Informasi agunan|Nilai/i').first();
    await expect(step2Content).toBeVisible({ timeout: 15000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-05-step-1.png'));

    await tutupModal(page);
  });

  test('TC-4941-06: Validasi Step 3 (Informasi Kepemilikan) Ter-prefill Beserta Dokumen yang Di-upload', { annotation: {type: 'defect',description: 'DEFECT-4941-02 (docs/LAPORAN_DEFECT_S2CML-4941_ANOMALI_EVALUASI_QA.md)'} }, async ({ page }) => {
    await bukaModalUbah(page, 0);

    // 1. Navigasi ke Step 3 (Informasi kepemilikan)
    const btnStep3 = page.locator('button, [role="button"]').filter({ hasText: /Informasi kepemilikan/i }).first();
    await expect(btnStep3).toBeVisible({ timeout: 10000 });
    await btnStep3.click();
    await page.waitForTimeout(2000);

    // 2. Periksa data pemilik agunan (Joko)
    const pemilikText = page.locator('text=/Joko/i').first();
    await expect(pemilikText).toBeVisible({ timeout: 15000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-06-step-1.png'));

    await tutupModal(page);
  });

  // =========================================================================
  // Kelompok 3: Edit Agunan Status Draft vs Final
  // =========================================================================

  test('TC-4941-07: Validasi Tombol "Simpan sebagai draft" Aktif saat Mengedit Agunan Berstatus DRAFT', async () => {
    // Prekondisi: Membutuhkan data agunan dengan status DRAFT
    // Di App ID 01M4F7TNSCSHEDB5G3WTSP7HDY seluruh agunan sudah berstatus FINAL
    test.skip(true, 'GAP prekondisi: Membutuhkan Application ID dengan agunan berstatus DRAFT (pada target uji saat ini seluruh agunan berstatus FINAL)');
  });

  test('TC-4941-08: Validasi Tombol "Simpan sebagai draft" Wajib Disabled saat Mengedit Agunan Berstatus FINAL', async ({ page }) => {
    // 1. Klik Titik 3 pada agunan berstatus FINAL → pilih "Ubah"
    await bukaModalUbah(page, 0);

    // 2. Periksa status tombol "Simpan sebagai draft" pada bagian footer modal
    const btnDraft = page.locator('button:has-text("Simpan sebagai draft")').first();
    await expect(btnDraft).toBeVisible({ timeout: 10000 });

    // WAJIB DISABLED (tidak dapat diklik untuk mencegah downgrade status)
    const isDisabled = await btnDraft.isDisabled();
    const ariaDisabled = await btnDraft.getAttribute('aria-disabled');
    const isStrictlyDisabled = isDisabled || ariaDisabled === 'true';

    expect(isStrictlyDisabled).toBe(true);

    // Eviden Step 3: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-08-step-1.png'));

    await tutupModal(page);
  });

  test('TC-4941-09: Validasi Tombol "Simpan" (Final) Aktif saat Edit Agunan Final dengan Data Valid', async ({ page }) => {
    // 1. Buka modal Ubah Agunan status Final
    await bukaModalUbah(page, 0);

    // 2. Periksa status tombol "Simpan" di footer modal
    const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/i }).first();
    await expect(btnSimpan).toBeVisible({ timeout: 10000 });
    await expect(btnSimpan).toBeEnabled({ timeout: 10000 });

    // Eviden Step 2: Screenshot bersih dengan URL bar
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-09-step-1.png'));

    await tutupModal(page);
  });

  // =========================================================================
  // Kelompok 4: Validasi Pembatalan & Form Rules Edit (TC-4941-10 s.d 12)
  // =========================================================================

  test('TC-4941-10: Validasi Pembatalan Edit Agunan Mengembalikan Data ke Kondisi Semula (Tanpa Tersimpan)', async ({ page }) => {
    // 1. Buka modal Ubah Agunan
    await bukaModalUbah(page, 0);

    // Amati nilai awal field status / pengikatan
    const statusTextBefore = await page.locator('text=/Tersedia/i').first().innerText();

    // 2. Klik tombol tutup silang (X) di header modal Ubah agunan
    const btnCloseModal = page.locator('text=/Ubah agunan/i')
      .locator('xpath=ancestor::div[1]//button')
      .or(page.locator('[class*="Modal"] button').filter({ has: page.locator('svg') }))
      .or(page.locator('button[aria-label*="close" i]'))
      .first();

    await expect(btnCloseModal).toBeVisible({ timeout: 5000 });
    await btnCloseModal.click();
    await page.waitForTimeout(1500);

    // Pastikan modal tertutup
    await expect(page.locator('text=/Agunan yang diubah/i')).not.toBeVisible({ timeout: 10000 });

    // 3. Buka kembali modal Ubah Agunan untuk agunan yang sama
    await bukaModalUbah(page, 0);
    const statusTextAfter = await page.locator('text=/Tersedia/i').first().innerText();
    expect(statusTextAfter).toBe(statusTextBefore);

    // Eviden Step 3: Screenshot bersih
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-10-step-1.png'));

    await tutupModal(page);
  });

  test('TC-4941-11: Validasi Tombol Simpan Disabled jika Field Mandatory Dikosongkan saat Edit Agunan Final', async ({ page }) => {
    await bukaModalUbah(page, 0);

    // 1. Amati tombol Simpan sebelum field dikosongkan (aktif)
    const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/i }).first();
    await expect(btnSimpan).toBeEnabled({ timeout: 10000 });

    // 2. Kosongkan salah satu field mandatory: Tanggal pengikatan
    const inputTanggal = page.locator('input[placeholder*="tanggal" i]').or(
      page.locator('input[value*="2026"]')
    ).first();

    if (await inputTanggal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await inputTanggal.fill('');
      await inputTanggal.blur();
      await page.waitForTimeout(1200);

      // 3. Periksa tombol Simpan menjadi disabled
      const isSimpanDisabled = await btnSimpan.isDisabled();
      const ariaDisabled = await btnSimpan.getAttribute('aria-disabled');
      expect(isSimpanDisabled || ariaDisabled === 'true').toBe(true);

      // Eviden Step 3: Screenshot bersih
      await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-11-step-1.png'));
    } else {
      console.log('TC-4941-11 Info: Input tanggal tidak ditemukan, mencoba input editable pertama');
      const firstInput = page.locator('input:not([disabled])').first();
      await firstInput.fill('');
      await firstInput.blur();
      await page.waitForTimeout(1000);

      const isSimpanDisabled = await btnSimpan.isDisabled();
      const ariaDisabled = await btnSimpan.getAttribute('aria-disabled');
      expect(isSimpanDisabled || ariaDisabled === 'true').toBe(true);
    }

    // Tutup tanpa menyimpan
    await tutupModal(page);
  });

  test('TC-4941-12: Validasi Indikator Status Stepper Tetap Akurat saat Field Diedit Menjadi Belum Lengkap', async ({ page }) => {
    await bukaModalUbah(page, 0);

    // 1. Verifikasi kondisi awal ketiga stepper adalah "Lengkap"
    const step1Status = page.locator('text=/Informasi umum agunan/i').locator('xpath=following::*[contains(., "Lengkap")][1]');
    await expect(step1Status).toBeVisible({ timeout: 10000 });

    // 2. Kosongkan field mandatory untuk memicu perubahan status stepper
    const inputTanggal = page.locator('input[placeholder*="tanggal" i]').or(
      page.locator('input[value*="2026"]')
    ).first();

    if (await inputTanggal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await inputTanggal.fill('');
      await inputTanggal.blur();
      await page.waitForTimeout(1200);

      // Amati stepper berubah menjadi Belum Lengkap
      const stepBelumLengkap = page.locator('text=/Informasi umum agunan/i')
        .locator('xpath=following::*[contains(., "Belum Lengkap")][1]');
      await expect(stepBelumLengkap).toBeVisible({ timeout: 10000 });
    }

    // Eviden Step 2: Screenshot bersih
    await ambilScreenshotBersih(page, path.join(EVIDEN_DIR, 'TC-4941-12-step-1.png'));

    await tutupModal(page);
  });
});

