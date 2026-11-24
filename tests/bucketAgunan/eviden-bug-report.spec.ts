import { test, expect } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_BADAN_USAHA,
  APP_ID_PERORANGAN,
  bacaOpsiKategori,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihTipeKepemilikan,
  readListboxOptions,
  snapshotComboboxes,
  tipeKepemilikanCombobox,
} from './helpers/agunanModal';
import { bersihkanTanda, scrollKeElemen, tandaiKotakMerah } from './helpers/eviden';

/**
 * Pengambilan eviden visual untuk laporan bug & mismatch desain.
 * Setiap screenshot diberi penanda kotak merah pada elemen bermasalah.
 *
 * Output: explore-output/bug/BUG-xx-*.png
 */
test.describe('Eviden Laporan Bug - Bucket Agunan', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
  });

  test('BUG-01: Placeholder "Nomor telepon PIC" tertulis "Masukkan nomor HP badan usaha"', { annotation: {type: 'defect',description: 'BUG-01 (docs/LAPORAN_BUG_Bucket_Agunan_2026-11-01.md)'} }, async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'BUG01');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Non Individu');
    expect(tipe, 'opsi tipe Non Individu harus tersedia').not.toBeNull();

    // Field terakhir pada form = Nomor telepon PIC
    const labelPic = page.locator('label:visible').filter({ hasText: /nomor telepon pic/i }).first();
    await expect(labelPic).toBeVisible({ timeout: 15000 });
    await scrollKeElemen(page, labelPic);

    // Field input di sebelah label tersebut
    const inputPic = page.locator('input:visible').last();
    const placeholderAktual = await inputPic.getAttribute('placeholder');
    console.log(`BUG-01 placeholder aktual pada field "Nomor telepon PIC": "${placeholderAktual}"`);

    expect(placeholderAktual, 'placeholder salah: menduplikasi field Nomor HP badan usaha')
      .toBe('Masukkan nomor HP badan usaha');

    // Pembanding: field Nomor HP badan usaha yang placeholder-nya benar
    const inputHpBU = page.locator('input[placeholder="Masukkan nomor HP badan usaha"]').first();
    await tandaiKotakMerah(page, inputHpBU, 'Nomor HP badan usaha (placeholder benar)');
    await tandaiKotakMerah(page, inputPic, 'BUG: Nomor telepon PIC -> placeholder "Masukkan nomor HP badan usaha"');

    await page.screenshot({ path: 'explore-output/bug/BUG-01-placeholder-pic.png', fullPage: true });
    await bersihkanTanda(page);
  });

  test('MISMATCH-01: Kategori debitur Badan Usaha memakai kode 001, bukan 003', async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'MIS01');

    const options = await bacaOpsiKategori(page);
    console.log('MISMATCH-01 Opsi kategori badan usaha:', JSON.stringify(options));

    expect(options.some(o => o.includes('001')), 'SIT menampilkan 001').toBeTruthy();
    expect(options.some(o => o.includes('003')), 'SIT tidak menampilkan 003').toBeFalsy();

    const opt001 = page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
      .filter({ hasText: /001/ }).first();
    await tandaiKotakMerah(page, opt001, 'SIT: "001 - Calon Debitur" | Expected matriks: "003 - Debitur"');

    await page.screenshot({ path: 'explore-output/bug/MISMATCH-01-kode-003-vs-001.png' });
    await bersihkanTanda(page);
  });

  test('MISMATCH-02: Dropdown "Hubungan dengan Debitur" hilang pada kategori 006', async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'MIS02');

    // Pembanding: kategori 005 MEMUNCULKAN dropdown Hubungan dengan debitur
    await pilihKategori(page, '005');
    const combos005 = await snapshotComboboxes(page);
    console.log('MISMATCH-02 Comboboxes pada kategori 005:', JSON.stringify(combos005));
    expect(combos005.some(c => /hubungan dengan debitur/i.test(c)), 'kategori 005 menampilkan dropdown Hubungan').toBeTruthy();

    const comboHubungan = page.locator('[role="combobox"]:visible').filter({ hasText: /hubungan dengan debitur/i }).first();
    await tandaiKotakMerah(page, comboHubungan, 'Kategori 005: dropdown "Hubungan dengan debitur" TAMPIL');
    await page.screenshot({ path: 'explore-output/bug/MISMATCH-02a-kategori-005-ada-hubungan.png', fullPage: true });
    await bersihkanTanda(page);

    // Kategori 006: dropdown Hubungan TIDAK dirender
    await pilihKategori(page, '006');
    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama|nama pengurus/i }).first();
    await expect(dropdownNama).toBeVisible({ timeout: 15000 });
    await dropdownNama.click();
    await page.waitForTimeout(1500);
    await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
      .first().click({ timeout: 15000 });
    await page.waitForTimeout(2500);

    const combos006 = await snapshotComboboxes(page);
    console.log('MISMATCH-02 Comboboxes pada kategori 006:', JSON.stringify(combos006));
    expect(combos006.some(c => /hubungan dengan debitur/i.test(c)), 'kategori 006 TIDAK menampilkan dropdown Hubungan').toBeFalsy();

    // Tandai combobox terakhir yang ada — setelahnya seharusnya ada Hubungan dengan debitur
    const comboTerakhir = page.locator('[role="combobox"]:visible').last();
    await scrollKeElemen(page, comboTerakhir);
    await tandaiKotakMerah(page, comboTerakhir, 'Kategori 006: dropdown "Hubungan dengan debitur" TIDAK ADA setelah field ini');

    await page.screenshot({ path: 'explore-output/bug/MISMATCH-02b-kategori-006-tanpa-hubungan.png', fullPage: true });
    await bersihkanTanda(page);
  });

  test('MISMATCH-03: Label tipe kepemilikan "Individu/Non Individu", bukan "Perorangan/Badan Usaha"', async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'MIS03');

    await pilihKategori(page, '005');
    const tipe = tipeKepemilikanCombobox(page);
    await expect(tipe).toBeVisible({ timeout: 15000 });
    await tipe.click();
    await page.waitForTimeout(1200);

    const opsi = await readListboxOptions(page);
    console.log('MISMATCH-03 Opsi tipe kepemilikan:', JSON.stringify(opsi));
    expect(opsi.length, 'tepat 2 opsi').toBe(2);

    const listbox = page.locator('[role="listbox"]:visible').first();
    await tandaiKotakMerah(page, listbox, 'SIT: "Individu"/"Non Individu" | Expected matriks: "Perorangan"/"Badan Usaha"');

    await page.screenshot({ path: 'explore-output/bug/MISMATCH-03-label-tipe-kepemilikan.png' });
    await bersihkanTanda(page);
  });
});
