import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4890 - [BE] LAMOS LOS SME - Bucket Agunan - Data Agunan > Add Agunan/Collaterals Part 2
 * Sumber Acuan:
 *   - Jira Story: https://bank-sinarmas.atlassian.net/browse/S2CML-4890
 *   - Master Matriks TC: exports/TC_S2CML-4890_Bucket_Agunan.csv (22 TCs)
 * Karakter: READ-ONLY (Validasi UI Stepper, Parallel Nav, Gating Identitas, & Business Rules tanpa submit final)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4890: Bucket Agunan - Add Agunan Part 2 (Stepper, Gating, & Form Rules)', () => {
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
   * TC - 4890 - 01: Default Step saat Form Terbuka
   */
  test('TC-4890-01: Default Step saat Form Terbuka adalah Informasi Umum Agunan dengan status Belum Lengkap', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-01: Default Step saat Form Terbuka');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Verifikasi step yang aktif di side navigation kiri adalah "Informasi umum agunan"
    const step1Btn = page.locator('button').filter({ hasText: /Informasi umum agunan/i }).first();
    await expect(step1Btn).toBeVisible({ timeout: 10000 });

    // 2. Verifikasi status indicator awal adalah "Belum Lengkap"
    const statusText = await step1Btn.innerText();
    console.log(`[TC-4890-01] Text Step 1 di side nav: "${statusText.replace(/\n/g, ' ')}"`);
    expect(statusText).toContain('Informasi umum agunan');
    expect(statusText).toContain('Belum Lengkap');

    // 3. Verifikasi form body menampilkan form Informasi Umum (memuat Status agunan)
    const labelStatusAgunan = page.locator('text=/Status agunan/i').first();
    await expect(labelStatusAgunan).toBeVisible({ timeout: 10000 });

    await testInfo.attach('Eviden TC-4890-01: Default Step Informasi Umum Belum Lengkap', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 4890 - 02: Struktur 3-Step Side Navigation
   */
  test('TC-4890-02: Side navigation kiri menampilkan tepat 3 step berurutan', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-02: Struktur 3-Step Side Navigation');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Ambil tombol step di panel navigasi modal
    const stepButtons = page.locator('button').filter({ hasText: /Informasi umum agunan|Data tambahan agunan|Informasi kepemilikan/i });
    const count = await stepButtons.count();
    console.log(`[TC-4890-02] Ditemukan ${count} tombol pada side navigation stepper`);
    expect(count).toBe(3);

    const step1 = await stepButtons.nth(0).innerText();
    const step2 = await stepButtons.nth(1).innerText();
    const step3 = await stepButtons.nth(2).innerText();

    console.log(`[TC-4890-02] Step 1: "${step1.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-02] Step 2: "${step2.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-02] Step 3: "${step3.replace(/\n/g, ' ')}"`);

    expect(step1).toMatch(/Informasi umum agunan/i);
    expect(step2).toMatch(/Data tambahan agunan/i);
    expect(step3).toMatch(/Informasi kepemilikan/i);

    await testInfo.attach('Eviden TC-4890-02: 3-Step Side Navigation Terverifikasi', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 4890 - 03: Navigasi Paralel / Bebas Antar Step
   */
  test('TC-4890-03: Navigasi Paralel bebas berpindah ke Step 2 tanpa menyelesaikan Step 1', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-03: Navigasi Paralel Bebas Antar Step');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const step2Btn = page.locator('button').filter({ hasText: /Data tambahan agunan/i }).first();
    const step1Btn = page.locator('button').filter({ hasText: /Informasi umum agunan/i }).first();

    // 1. Klik Step 2 langsung saat Step 1 masih kosong
    console.log('[TC-4890-03] Mengklik Step 2: Data tambahan agunan...');
    await step2Btn.click();
    await page.waitForTimeout(1500);

    // Verifikasi form Step 2 tampil (memuat section / field Data tambahan agunan atau sertifikat)
    const isStep2Visible = await page.locator('text=/Data tambahan agunan|Bukti pemilikan|Sifat agunan/i').first().isVisible().catch(() => false);
    console.log(`[TC-4890-03] Form Step 2 berhasil aktif: ${isStep2Visible}`);
    expect(isStep2Visible).toBeTruthy();

    // 2. Klik kembali Step 1
    console.log('[TC-4890-03] Mengklik kembali Step 1: Informasi umum agunan...');
    await step1Btn.click();
    await page.waitForTimeout(1500);

    // Verifikasi kembali ke Form Step 1
    const isStep1Visible = await page.locator('text=/Status agunan/i').first().isVisible().catch(() => false);
    console.log(`[TC-4890-03] Kembali ke Step 1 berhasil: ${isStep1Visible}`);
    expect(isStep1Visible).toBeTruthy();

    await testInfo.attach('Eviden TC-4890-03: Navigasi Bebas Antar Step', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 4890 - 06: Gating Validasi Bucket Identitas (Step 3: Informasi Kepemilikan)
   */
  test('TC-4890-06: Validasi Gating Step 3 memblokir akses jika Bucket Identitas belum Lengkap', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-06: Gating Validasi Bucket Identitas');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const step3Btn = page.locator('button').filter({ hasText: /Informasi kepemilikan/i }).first();
    await expect(step3Btn).toBeVisible({ timeout: 10000 });

    // Klik Step 3 pada debitur yang Bucket Identitas-nya belum Lengkap
    console.log('[TC-4890-06] Mengklik Step 3: Informasi kepemilikan...');
    await step3Btn.click();
    await page.waitForTimeout(1500);

    // Verifikasi dialog peringatan / alert gating muncul, atau popup memblokir proses
    const alertGating = page.locator('div, [role="alertdialog"], [role="dialog"]').filter({
      hasText: /identitas.*lengkap|selesaikan.*identitas|belum dapat mengakses|tidak dapat melanjutkan/i
    }).first();

    const isAlertVisible = await alertGating.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-4890-06] Alert Gating Bucket Identitas tampil: ${isAlertVisible}`);

    if (isAlertVisible) {
      const alertMsg = await alertGating.innerText();
      console.log(`[TC-4890-06] Pesan Gating: "${alertMsg.replace(/\n/g, ' ')}"`);
      expect(isAlertVisible).toBeTruthy();
    } else {
      // Jika gating ditangani secara disabled button pada Step 3
      const isStep3Disabled = await step3Btn.isDisabled().catch(() => false);
      const ariaDisabled = await step3Btn.getAttribute('aria-disabled');
      console.log(`[TC-4890-06] Status disabled Step 3: isDisabled=${isStep3Disabled}, ariaDisabled=${ariaDisabled}`);
      expect(isStep3Disabled || ariaDisabled === 'true' || isAlertVisible).toBeTruthy();
    }

    await testInfo.attach('Eviden TC-4890-06: Gating Validasi Bucket Identitas', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 4890 - 11: Validasi Tombol Simpan Disabled saat Mandatory Belum Lengkap
   */
  test('TC-4890-11: Tombol Simpan berstatus disabled dan Simpan sebagai draft aktif saat form belum lengkap', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-11: Tombol Simpan Disabled & Draft Aktif');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Cari tombol "Simpan" di footer modal
    const btnSimpan = page.locator('button').filter({ hasText: /^Simpan$/ }).last();
    const btnDraft = page.locator('button').filter({ hasText: /Simpan sebagai draft/i }).last();

    await expect(btnSimpan).toBeVisible({ timeout: 10000 });
    await expect(btnDraft).toBeVisible({ timeout: 10000 });

    // Verifikasi status tombol Simpan disabled
    const isSimpanDisabled = await btnSimpan.isDisabled();
    console.log(`[TC-4890-11] Tombol Simpan disabled: ${isSimpanDisabled}`);
    expect(isSimpanDisabled).toBeTruthy();

    // Verifikasi tombol "Simpan sebagai draft" enabled
    const isDraftEnabled = await btnDraft.isEnabled();
    console.log(`[TC-4890-11] Tombol Simpan sebagai draft enabled: ${isDraftEnabled}`);
    expect(isDraftEnabled).toBeTruthy();

    await testInfo.attach('Eviden TC-4890-11: Simpan Disabled dan Draft Enabled', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 4890 - 14: Default Tipe Penilaian saat LPA = "Tidak" (S2CML-6756)
   */
  test('TC-4890-14: Opsi "Apakah LPA sudah tersedia? = Tidak" default Tipe Penilaian menjadi "Internal"', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4890-14: Default Tipe Penilaian Internal saat LPA = Tidak');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Status Agunan = Tersedia agar seksi Penilaian agunan muncul di layar
    await selectStatusAgunan(page, 'Tersedia');

    // 2. Scroll ke bagian Penilaian Agunan
    const headingPenilaian = page.locator('heading, h5, div, span').filter({ hasText: /^Penilaian agunan$/i }).first();
    if (await headingPenilaian.isVisible().catch(() => false)) {
      await headingPenilaian.scrollIntoViewIfNeeded();
    }

    // 3. Cari container "Apakah LPA sudah tersedia?" yang memuat opsi Ya dan Tidak
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });

    // 4. Klik opsi radio "Tidak" pada section LPA
    const radioTidak = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Tidak\s*$/i })
      .first();
    await expect(radioTidak).toBeVisible({ timeout: 5000 });
    await radioTidak.click();
    await page.waitForTimeout(1500);

    // 5. Verifikasi dropdown / input Tipe Penilaian menjadi "Internal"
    const tipePenilaianField = page.locator('div').filter({ hasText: /^Tipe penilaian/i }).first();
    const tipeText = await tipePenilaianField.innerText();
    console.log(`[TC-4890-14] Text Tipe Penilaian setelah LPA Tidak: "${tipeText.replace(/\n/g, ' ')}"`);

    expect(tipeText.toLowerCase()).toContain('internal');

    await testInfo.attach('Eviden TC-4890-14: Default Tipe Penilaian Internal saat LPA Tidak', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});
