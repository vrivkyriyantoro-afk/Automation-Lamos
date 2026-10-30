import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Modul 4: Alamat Agunan
 * Sumber Data: fixtures/TemplateAutomateLamos - Sheet1.csv
 * Cakupan Test Cases: TC - 04 - 31 s.d. TC - 04 - 35
 * Karakter: READ-ONLY (Validasi UI, Cascading Location Dropdowns, Reset Behavior, & Postal Code Validation)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 4 - Alamat Agunan', () => {
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
    // Scroll ke seksi Alamat agunan
    const headingAlamat = activeModal.locator('heading, h5, div, span').filter({ hasText: /^Alamat agunan$/i }).first();
    if (await headingAlamat.isVisible().catch(() => false)) {
      await headingAlamat.scrollIntoViewIfNeeded();
    }
    return activeModal;
  }

  /**
   * Helper: Pilih opsi dari combobox alamat tertentu (Provinsi, Kota, Kecamatan, Kelurahan)
   */
  async function selectLocationDropdown(page: Page, labelPattern: RegExp, targetKeyword?: string) {
    // Cari trigger combobox yang berdekatan dengan label atau memiliki placeholder relevan
    const combobox = page.locator('[role="combobox"]').filter({ hasText: labelPattern }).first();
    await expect(combobox).toBeVisible({ timeout: 15000 });
    await combobox.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });

    let opt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').first();
    if (targetKeyword) {
      const matchOpt = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(targetKeyword, 'i') }).first();
      if (await matchOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
        opt = matchOpt;
      }
    }
    const selectedText = (await opt.innerText()).trim();
    await opt.click();
    await page.waitForTimeout(1500);
    return selectedText;
  }

  /**
   * TC - 04 - 32: Sub-location saat parent belum dipilih
   */
  test('TC - 04 - 32: Sub-location tidak dapat dipilih / tidak ada opsi saat parent belum dipilih', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 32: Sub-location saat parent belum dipilih');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pastikan Provinsi belum dipilih
    const provinsiTrigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih provinsi/i }).first();
    await expect(provinsiTrigger).toBeVisible({ timeout: 10000 });

    // Coba periksa dropdown Kota dan Kecamatan
    const kotaTrigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih kota/i }).first();
    const kecamatanTrigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih kecamatan/i }).first();

    await expect(kotaTrigger).toBeVisible({ timeout: 10000 });
    await expect(kecamatanTrigger).toBeVisible({ timeout: 10000 });

    // Periksa status: bisa disabled secara atribut, atau bila diklik tidak ada item / disabled state
    const isKotaDisabled = await kotaTrigger.isDisabled().catch(() => false);
    const isKecamatanDisabled = await kecamatanTrigger.isDisabled().catch(() => false);

    console.log(`[TC-04-32] Status isDisabled: Kota=${isKotaDisabled}, Kecamatan=${isKecamatanDisabled}`);

    if (!isKotaDisabled) {
      await kotaTrigger.click();
      await page.waitForTimeout(1000);
      const listbox = page.locator('[role="listbox"]:visible, ul:visible');
      const itemCount = await listbox.locator('li:not(.sticky)').count();
      console.log(`[TC-04-32] Jumlah opsi Kota saat Provinsi kosong: ${itemCount}`);
      // Dropdown tidak menampilkan opsi atau menampilkan pesan parent belum dipilih
      expect(itemCount === 0 || !await listbox.isVisible().catch(() => false)).toBeTruthy();
      // Tutup kembali dropdown bila terbuka
      await page.keyboard.press('Escape').catch(() => {});
    } else {
      expect(isKotaDisabled).toBeTruthy();
    }

    await testInfo.attach('Eviden TC-04-32: Sub-location Saat Parent Belum Dipilih', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 31: List kecamatan urut abjad
   */
  test('TC - 04 - 31: List dropdown Kecamatan berurutan secara alfabetis (A-Z)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 31: List kecamatan urut abjad');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Provinsi (misal DKI JAKARTA atau opsi pertama)
    const provSelected = await selectLocationDropdown(page, /Pilih provinsi/i, 'DKI');
    console.log(`[TC-04-31] Provinsi dipilih: ${provSelected}`);

    // 2. Pilih Kota (misal JAKARTA PUSAT atau opsi pertama)
    const kotaSelected = await selectLocationDropdown(page, /Pilih kota/i);
    console.log(`[TC-04-31] Kota dipilih: ${kotaSelected}`);

    // 3. Buka dropdown Kecamatan
    const kecamatanTrigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih kecamatan/i }).first();
    await expect(kecamatanTrigger).toBeVisible({ timeout: 10000 });
    await kecamatanTrigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });

    const rawTexts = await listbox.locator('li:not(.sticky) button, li:not(.sticky)').allInnerTexts();
    const cleanKecamatan = rawTexts.map(t => t.trim()).filter(t => t && t !== 'Clear' && !t.includes('Pilih'));
    console.log(`[TC-04-31] Ditemukan ${cleanKecamatan.length} opsi Kecamatan:`, cleanKecamatan.slice(0, 5));

    expect(cleanKecamatan.length).toBeGreaterThan(1);

    // Verifikasi urutan abjad A-Z
    const sortedKecamatan = [...cleanKecamatan].sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
    expect(cleanKecamatan).toEqual(sortedKecamatan);

    // Pilih salah satu kecamatan untuk menutup
    await listbox.locator('li:not(.sticky) button, li:not(.sticky)').first().click();
    await page.waitForTimeout(1000);

    await testInfo.attach('Eviden TC-04-31: List Kecamatan Urut Abjad', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 33: Ubah parent location mereset child
   */
  test('TC - 04 - 33: Mengubah parent location otomatis me-reset field child (Kota & Kecamatan)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 33: Ubah parent location mereset child');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // 1. Pilih Provinsi pertama
    const prov1 = await selectLocationDropdown(page, /Pilih provinsi/i, 'DKI');
    console.log(`[TC-04-33] Provinsi awal: ${prov1}`);

    // 2. Pilih Kota
    const kota1 = await selectLocationDropdown(page, /Pilih kota/i);
    console.log(`[TC-04-33] Kota awal: ${kota1}`);

    // 3. Pilih Kecamatan
    const kec1 = await selectLocationDropdown(page, /Pilih kecamatan/i);
    console.log(`[TC-04-33] Kecamatan awal: ${kec1}`);

    // 4. Ubah Provinsi ke provinsi lain (misal JAWA BARAT)
    const provTrigger = page.locator('[role="combobox"]').filter({ hasText: new RegExp(prov1, 'i') }).first();
    await provTrigger.click();

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    const otherProv = listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasNotText: new RegExp(prov1, 'i') }).first();
    const prov2 = (await otherProv.innerText()).trim();
    console.log(`[TC-04-33] Mengubah Provinsi ke: ${prov2}`);
    await otherProv.click();
    await page.waitForTimeout(1500);

    // 5. Verifikasi kolom child (Kota & Kecamatan) ter-reset ke placeholder awal
    const kotaTriggerAfter = page.locator('[role="combobox"]').filter({ hasText: /Pilih kota/i }).first();
    const kecTriggerAfter = page.locator('[role="combobox"]').filter({ hasText: /Pilih kecamatan/i }).first();

    await expect(kotaTriggerAfter).toBeVisible({ timeout: 10000 });
    await expect(kecTriggerAfter).toBeVisible({ timeout: 10000 });

    const textKotaAfter = await kotaTriggerAfter.innerText();
    const textKecAfter = await kecTriggerAfter.innerText();
    console.log(`[TC-04-33] Setelah ubah parent: Kota="${textKotaAfter}", Kecamatan="${textKecAfter}"`);

    expect(textKotaAfter).toContain('Pilih kota');
    expect(textKecAfter).toContain('Pilih kecamatan');

    await testInfo.attach('Eviden TC-04-33: Ubah Parent Reset Child Location', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 34: Kode pos diisi non-angka
   */
  test('TC - 04 - 34: Validasi Kode Pos jika diisi huruf/simbol non-angka', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 34: Kode pos diisi non-angka');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const inputKodePos = page.locator('input[placeholder*="kode pos" i]').first();
    await expect(inputKodePos).toBeVisible({ timeout: 10000 });

    // Masukkan karakter non-angka
    await inputKodePos.fill('ABC!@#');
    await inputKodePos.blur();
    await page.waitForTimeout(1000);

    const val = await inputKodePos.inputValue();
    console.log(`[TC-04-34] Nilai input Kode Pos setelah diisi "ABC!@#": "${val}"`);

    // Validasi:
    // Format 1: Sistem memblokir karakter non-angka via masking sehingga value tetap kosong ""
    // Format 2: Menampilkan alert/error message "Kode pos wajib diisi dengan angka"
    const errorMsg = page.locator('text=/kode pos wajib diisi dengan angka|hanya.*angka|format tidak valid/i').first();
    const hasErrorAlert = await errorMsg.isVisible().catch(() => false);

    console.log(`[TC-04-34] Masking blocked input: ${val === ''}, Alert error visible: ${hasErrorAlert}`);
    expect(val === '' || hasErrorAlert).toBeTruthy();

    await testInfo.attach('Eviden TC-04-34: Validasi Kode Pos Non Angka', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC - 04 - 35: Kode pos diisi angka valid
   */
  test('TC - 04 - 35: Input Kode Pos dengan angka valid lolos tanpa error', async ({ page }, testInfo) => {
    console.log('Menjalankan TC - 04 - 35: Kode pos diisi angka valid');
    await navigateToFormAgunanBaru(page, 'Tanah');

    const inputKodePos = page.locator('input[placeholder*="kode pos" i]').first();
    await expect(inputKodePos).toBeVisible({ timeout: 10000 });

    // Masukkan angka valid 5 digit (misal 10110)
    await inputKodePos.fill('10110');
    await inputKodePos.blur();
    await page.waitForTimeout(1000);

    const val = await inputKodePos.inputValue();
    console.log(`[TC-04-35] Nilai input Kode Pos valid: "${val}"`);
    expect(val).toBe('10110');

    // Verifikasi tidak ada error validasi
    const errorMsg = page.locator('text=/kode pos wajib diisi dengan angka|format tidak valid/i');
    await expect(errorMsg).toHaveCount(0);

    await testInfo.attach('Eviden TC-04-35: Validasi Kode Pos Angka Valid', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
});

