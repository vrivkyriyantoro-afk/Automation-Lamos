import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4890 - Navigasi Stepper pada Debitur Badan Usaha.
 * Target Debitur: 01M7P9WH6PQ1AZ058P0C18QX4Q (debtorType=business)
 * Matriks: exports/TC_S2CML-4890_Bucket_Agunan.csv
 *
 * Cakupan: TC-4890-02 & TC-4890-03 (keduanya bertipe debitur "Perorangan & Badan Usaha";
 * varian Perorangan ada di tests/bucketAgunan/perseorangan/s2cml-4890.spec.ts).
 *
 * Catatan penomoran: test ini sebelumnya memakai ID "TC-4890-BU-01". ID tersebut
 * dikembalikan ke definisi matriks resmi — "Kategori Pemilik Perusahaan (006 & 007)" —
 * yang diotomasi di tests/bucketAgunan/s2cml-4890-badan-usaha.spec.ts.
 */

const TARGET_BUSINESS_ID = '01M7P9WH6PQ1AZ058P0C18QX4Q';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${TARGET_BUSINESS_ID}/create?bucket=agunan&debtorType=business`;

test.describe('S2CML-4890: Navigasi Stepper Agunan - Debitur Badan Usaha', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Buka modal Tambah Agunan (Pencarian)
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
   * Helper: Masuk ke Form Agunan Baru pada Debitur Badan Usaha
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    await openTambahAgunanModal(page);

    // 1. Pilih jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
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

  test('TC-4890-02: Validasi Struktur 3-Step Side Navigation', async ({ page }, testInfo) => {
    console.log(`[TC-4890-02] Menjalankan pengujian pada Debitur Badan Usaha: ${TARGET_BUSINESS_ID}`);
    await navigateToFormAgunanBaru(page, 'Tanah');

    const stepButtons = page.locator('button').filter({ hasText: /Informasi umum agunan|Data tambahan agunan|Informasi kepemilikan/i });
    expect(await stepButtons.count(), 'side navigation harus memuat tepat 3 step').toBe(3);

    const step1Text = await stepButtons.nth(0).innerText();
    const step2Text = await stepButtons.nth(1).innerText();
    const step3Text = await stepButtons.nth(2).innerText();

    console.log(`[TC-4890-02] Step 1: "${step1Text.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-02] Step 2: "${step2Text.replace(/\n/g, ' ')}"`);
    console.log(`[TC-4890-02] Step 3: "${step3Text.replace(/\n/g, ' ')}"`);

    // Urutan step harus sesuai matriks: 1 Informasi umum, 2 Data tambahan, 3 Informasi kepemilikan
    expect(step1Text).toContain('Informasi umum agunan');
    expect(step2Text).toContain('Data tambahan agunan');
    expect(step3Text).toContain('Informasi kepemilikan');

    await testInfo.attach('Eviden TC-4890-02: Struktur 3-Step pada Debitur Badan Usaha', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  test('TC-4890-03: Validasi Navigasi Paralel / Bebas Antar Step', async ({ page }, testInfo) => {
    console.log(`[TC-4890-03] Menjalankan pengujian pada Debitur Badan Usaha: ${TARGET_BUSINESS_ID}`);
    await navigateToFormAgunanBaru(page, 'Tanah');

    const stepButtons = page.locator('button').filter({ hasText: /Informasi umum agunan|Data tambahan agunan|Informasi kepemilikan/i });
    await expect(stepButtons.nth(1)).toBeVisible({ timeout: 15000 });

    // Step 1 belum diisi lengkap, tapi Step 2 harus tetap dapat diakses
    await stepButtons.nth(1).click();
    await page.waitForTimeout(1500);

    const isStep2Active = await page.locator('text=/Data tambahan agunan|Bukti pemilikan|Sifat agunan/i').first().isVisible();
    console.log(`[TC-4890-03] Form Step 2 aktif tanpa menyelesaikan Step 1: ${isStep2Active}`);
    expect(isStep2Active, 'Step 2 harus dapat diakses tanpa menyelesaikan Step 1').toBeTruthy();

    // Kembali ke Step 1 juga harus bebas (unrestricted order)
    await stepButtons.nth(0).click();
    await page.waitForTimeout(1500);

    const isStep1Active = await page.locator('text=/Status agunan/i').first().isVisible();
    console.log(`[TC-4890-03] Kembali ke Step 1 berhasil: ${isStep1Active}`);
    expect(isStep1Active, 'harus bisa kembali ke Step 1 tanpa pembatasan urutan').toBeTruthy();

    await testInfo.attach('Eviden TC-4890-03: Navigasi Paralel pada Debitur Badan Usaha', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});

