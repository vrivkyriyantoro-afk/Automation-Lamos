import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_PERORANGAN,
  btnSimpan,
  closeModal,
  listboxOption,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihTipeKepemilikan,
  readListboxOptions,
  snapshotComboboxes,
  snapshotInputs,
  tipeKepemilikanCombobox,
} from './helpers/agunanModal';

/**
 * S2CML-4949 — Informasi Kepemilikan Agunan: New Data Identitas & SLIK Checking Form.
 * Matriks: exports/TC_S2CML-4949_Informasi_Kepemilikan_New_Identity.csv
 *
 * Catatan label SIT: opsi Tipe kepemilikan berlabel "Individu" / "Non Individu",
 * sedangkan matriks menulis "Perorangan" / "Badan Usaha".
 */

/** Label field yang tampil di form SLIK (label di-render di level page, bukan dalam modal). */
async function labelTeks(page: Page) {
  const labels = await page.locator('label:visible').allInnerTexts();
  return labels.map(l => l.trim()).filter(Boolean);
}

function labelPunyaBintang(labels: string[], namaField: RegExp) {
  const found = labels.find(l => namaField.test(l));
  return { ada: !!found, wajib: !!found && found.includes('*'), teks: found };
}

test.describe('S2CML-4949: Form SLIK Check & New Data Identitas', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
  });

  test('TC-4949-01: Form dinamis saat memilih kategori 005 - Pemilik Agunan', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_01');

    const combo = await pilihKategori(page, '005');
    expect(combo, 'Kategori 005 harus tersedia').not.toBeNull();

    const combos = await snapshotComboboxes(page);
    console.log('TC-4949-01 Comboboxes:', JSON.stringify(combos));

    // 1. Dropdown "Tipe Kepemilikan"
    expect(combos.some(c => /tipe kepemilikan/i.test(c)), 'dropdown Tipe Kepemilikan harus tampil').toBeTruthy();
    // 2. Dropdown "Hubungan dengan Debitur"
    expect(combos.some(c => /hubungan dengan debitur/i.test(c)), 'dropdown Hubungan dengan Debitur harus tampil').toBeTruthy();

    // 3. Card form SLIK muncul setelah tipe kepemilikan dipilih
    const tipe = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipe, 'opsi tipe Individu harus tersedia').not.toBeNull();

    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(/slik/i.test(bodyText), 'section SLIK Check harus tampil').toBeTruthy();

    await page.screenshot({ path: 'explore-output/tc-4949-01-after.png' });
    await closeModal(page);
  });

  test('TC-4949-02: Form dinamis saat memilih kategori 008 - Vendor', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_02');

    const combo = await pilihKategori(page, '008');
    expect(combo, 'Kategori 008 harus tersedia').not.toBeNull();

    const combos = await snapshotComboboxes(page);
    console.log('TC-4949-02 Comboboxes:', JSON.stringify(combos));

    // Komponen identik dengan kategori 005
    expect(combos.some(c => /tipe kepemilikan/i.test(c)), 'dropdown Tipe Kepemilikan harus tampil').toBeTruthy();
    expect(combos.some(c => /hubungan dengan debitur/i.test(c)), 'dropdown Hubungan dengan Debitur harus tampil').toBeTruthy();

    const tipe = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipe, 'opsi tipe Individu harus tersedia').not.toBeNull();

    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(/slik/i.test(bodyText), 'form SLIK Check vendor harus tampil').toBeTruthy();

    await page.screenshot({ path: 'explore-output/tc-4949-02-after.png' });
    await closeModal(page);
  });

  test('TC-4949-03: Dropdown Tipe Kepemilikan menampilkan tepat 2 opsi', { annotation: {type: 'defect',description: 'MISMATCH-03 (docs/LAPORAN_BUG_Bucket_Agunan_2026-11-01.md)'} }, async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_03');

    const combo = await pilihKategori(page, '005');
    expect(combo, 'Kategori 005 harus tersedia').not.toBeNull();

    const tipe = tipeKepemilikanCombobox(page);
    await expect(tipe).toBeVisible({ timeout: 15000 });
    await tipe.click();
    await page.waitForTimeout(1000);

    const opsi = await readListboxOptions(page);
    console.log('TC-4949-03 Opsi Tipe Kepemilikan:', JSON.stringify(opsi));

    // Tepat 2 opsi
    expect(opsi.length, 'harus tepat 2 opsi tipe kepemilikan').toBe(2);

    // MISMATCH TERCATAT: matriks menulis "Perorangan" / "Badan Usaha";
    // build SIT memakai label "Individu" / "Non Individu".
    expect(opsi.some(o => /^Individu$/i.test(o)), 'opsi tipe individu harus ada').toBeTruthy();
    expect(opsi.some(o => /^Non Individu$/i.test(o)), 'opsi tipe non-individu harus ada').toBeTruthy();
    console.log('TC-4949-03 MISMATCH desain -> expected "Perorangan"/"Badan Usaha"; aktual "Individu"/"Non Individu"');

    await page.screenshot({ path: 'explore-output/tc-4949-03-options.png' });
    await closeModal(page);
  });

  test('TC-4949-04: Kelengkapan field form SLIK tipe Perorangan (Individu)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_04');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipe, 'opsi tipe Individu harus tersedia').not.toBeNull();

    const labels = await labelTeks(page);
    const inputs = await snapshotInputs(page);
    const combos = await snapshotComboboxes(page);
    console.log('TC-4949-04 Labels:', JSON.stringify(labels));

    // Mandatory: Nama Lengkap (*)
    const nama = labelPunyaBintang(labels, /^Nama\*?$/i);
    expect(nama.ada, 'field Nama harus tampil').toBeTruthy();
    expect(nama.wajib, 'field Nama harus mandatory (*)').toBeTruthy();

    // Mandatory: Nomor Identitas / NIK (*)
    const nik = labelPunyaBintang(labels, /nomor identitas/i);
    expect(nik.ada, 'field Nomor identitas harus tampil').toBeTruthy();
    expect(nik.wajib, 'field Nomor identitas harus mandatory (*)').toBeTruthy();

    // Mandatory: upload dokumen KTP — tersedia input file
    const fileCount = await page.locator('input[type="file"]').count();
    expect(fileCount, 'harus ada input upload dokumen').toBeGreaterThan(0);

    // Opsional: Tempat / Tanggal Lahir (tanpa *)
    const adaTempatLahir = inputs.some(i => /tempat lahir/i.test(i.placeholder));
    const adaTanggalLahir = inputs.some(i => /tanggal lahir/i.test(i.placeholder));
    expect(adaTempatLahir, 'field Tempat lahir harus tampil').toBeTruthy();
    expect(adaTanggalLahir, 'field Tanggal lahir harus tampil').toBeTruthy();

    // Opsional: Status Perkawinan (tanpa *)
    expect(combos.some(c => /status pernikahan|status perkawinan/i.test(c)), 'dropdown Status pernikahan harus tampil').toBeTruthy();
    const labelStatus = labels.find(l => /status pernikahan|status perkawinan/i.test(l));
    if (labelStatus) {
      expect(labelStatus.includes('*'), 'Status pernikahan harus opsional (tanpa *)').toBeFalsy();
    }

    await page.screenshot({ path: 'explore-output/tc-4949-04-after.png', fullPage: true });
    await closeModal(page);
  });

  test('TC-4949-07: Opsi dropdown Status Perkawinan pada SLIK Perorangan', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_07');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipe, 'opsi tipe Individu harus tersedia').not.toBeNull();

    const statusCombo = page.locator('[role="combobox"]:visible').filter({ hasText: /status pernikahan|status perkawinan/i }).first();
    await expect(statusCombo).toBeVisible({ timeout: 15000 });
    await statusCombo.scrollIntoViewIfNeeded();
    await statusCombo.click();
    await expect.poll(async () => (await readListboxOptions(page)).length, { timeout: 10000 }).toBeGreaterThan(0);

    const opsi = await readListboxOptions(page);
    console.log('TC-4949-07 Opsi Status Perkawinan:', JSON.stringify(opsi));

    expect(opsi.length, 'dropdown Status perkawinan harus punya opsi').toBeGreaterThan(0);
    expect(opsi.some(o => /belum menikah|lajang/i.test(o)), 'harus ada opsi belum menikah').toBeTruthy();
    expect(opsi.some(o => /^menikah/i.test(o)), 'harus ada opsi menikah').toBeTruthy();

    await page.screenshot({ path: 'explore-output/tc-4949-07-options.png' });
    await closeModal(page);
  });

  test('TC-4949-08: Kelengkapan field form SLIK tipe Badan Usaha (Non Individu)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_08');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Non Individu');
    expect(tipe, 'opsi tipe Non Individu harus tersedia').not.toBeNull();

    const labels = await labelTeks(page);
    const inputs = await snapshotInputs(page);
    const combos = await snapshotComboboxes(page);
    console.log('TC-4949-08 Labels:', JSON.stringify(labels));

    // Mandatory: Nama Badan Usaha (*)
    const nama = labelPunyaBintang(labels, /^Nama\*?$/i);
    expect(nama.ada, 'field Nama harus tampil').toBeTruthy();
    expect(nama.wajib, 'field Nama badan usaha harus mandatory (*)').toBeTruthy();

    // Mandatory: Nomor Identitas NPWP / NIB (*)
    const noId = labelPunyaBintang(labels, /nomor identitas/i);
    expect(noId.ada, 'field Nomor identitas harus tampil').toBeTruthy();
    expect(noId.wajib, 'field Nomor identitas harus mandatory (*)').toBeTruthy();

    // Dropdown Jenis Badan Usaha
    expect(combos.some(c => /jenis badan usaha/i.test(c)), 'dropdown Jenis badan usaha harus tampil').toBeTruthy();

    // Opsional: lokasi pendirian, telepon, HP, email, PIC (tanpa *)
    const opsional: Array<[string, RegExp]> = [
      ['Lokasi pendirian badan usaha', /lokasi pendirian badan usaha/i],
      ['Nomor telepon badan usaha', /nomor telepon badan usaha/i],
      ['Nomor HP badan usaha', /nomor hp badan usaha/i],
      ['Email badan usaha', /email badan usaha/i],
      ['Nama PIC', /nama pic/i],
      ['Nomor telepon PIC', /nomor telepon pic/i],
    ];

    for (const [nama, pola] of opsional) {
      const l = labels.find(x => pola.test(x));
      expect(l, `label "${nama}" harus tampil`).toBeTruthy();
      expect(l!.includes('*'), `"${nama}" harus opsional (tanpa *)`).toBeFalsy();
    }

    console.log('TC-4949-08 Inputs:', JSON.stringify(inputs.map(i => i.placeholder)));

    await page.screenshot({ path: 'explore-output/tc-4949-08-after.png', fullPage: true });
    await closeModal(page);
  });

  test('TC-4949-09: Opsi dropdown Jenis Badan Usaha', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_09');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Non Individu');
    expect(tipe, 'opsi tipe Non Individu harus tersedia').not.toBeNull();

    const jenisCombo = page.locator('[role="combobox"]:visible').filter({ hasText: /jenis badan usaha/i }).first();
    await expect(jenisCombo).toBeVisible({ timeout: 15000 });
    await jenisCombo.click();
    await page.waitForTimeout(1000);

    const opsi = await readListboxOptions(page);
    console.log('TC-4949-09 Opsi Jenis Badan Usaha:', JSON.stringify(opsi));

    expect(opsi.length, 'dropdown Jenis badan usaha harus punya opsi').toBeGreaterThan(0);
    expect(opsi.some(o => /\bPT\b|perseroan/i.test(o)), 'harus ada opsi PT / Perseroan').toBeTruthy();

    await page.screenshot({ path: 'explore-output/tc-4949-09-options.png' });
    await closeModal(page);
  });

  test('TC-4949-11: Ganti tipe Perorangan ke Badan Usaha me-reset form SLIK', async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_11');

    await pilihKategori(page, '005');
    const tipeIndividu = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipeIndividu, 'opsi tipe Individu harus tersedia').not.toBeNull();

    // Isi sebagian form SLIK perorangan
    const inputNama = page.locator('input[placeholder*="Masukkan nama" i]').first();
    await expect(inputNama).toBeVisible({ timeout: 15000 });
    await inputNama.fill('UJI RESET SLIK');

    const inputNoId = page.locator('input[placeholder*="Masukkan nomor identitas" i]').first();
    await inputNoId.fill('1234567890123456');

    const sebelum = await snapshotInputs(page);
    console.log('TC-4949-11 Sebelum ganti tipe:', JSON.stringify(sebelum.filter(i => i.value.trim())));
    expect(sebelum.some(i => i.value.includes('UJI RESET SLIK')), 'isian harus tersimpan sebelum ganti tipe').toBeTruthy();

    // Ganti ke Non Individu
    const tipeBU = await pilihTipeKepemilikan(page, 'Non Individu');
    expect(tipeBU, 'opsi tipe Non Individu harus tersedia').not.toBeNull();

    const sesudah = await snapshotInputs(page);
    console.log('TC-4949-11 Sesudah ganti tipe:', JSON.stringify(sesudah.filter(i => i.value.trim())));

    // Form perorangan tertutup, isian lama ter-reset bersih
    expect(sesudah.some(i => i.value.includes('UJI RESET SLIK')), 'isian nama lama harus ter-reset').toBeFalsy();
    expect(sesudah.some(i => i.value.includes('1234567890123456')), 'isian nomor identitas lama harus ter-reset').toBeFalsy();

    // Form badan usaha menggantikan form perorangan
    const combos = await snapshotComboboxes(page);
    expect(combos.some(c => /jenis badan usaha/i.test(c)), 'form badan usaha harus menggantikan form perorangan').toBeTruthy();

    await page.screenshot({ path: 'explore-output/tc-4949-11-after.png', fullPage: true });
    await closeModal(page);
  });

  test('TC-4949-18: Tombol Simpan disabled saat field mandatory SLIK belum lengkap', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4949_18');

    await pilihKategori(page, '005');
    const tipe = await pilihTipeKepemilikan(page, 'Individu');
    expect(tipe, 'opsi tipe Individu harus tersedia').not.toBeNull();

    // Kondisi awal: seluruh mandatory SLIK kosong
    await expect(btnSimpan(page)).toBeDisabled({ timeout: 10000 });

    // Isi sebagian saja (Nama terisi, Nomor identitas & file KTP tetap kosong)
    const inputNama = page.locator('input[placeholder*="Masukkan nama" i]').first();
    await inputNama.fill('UJI GATING SLIK');
    await page.waitForTimeout(1500);

    // Masih ada mandatory kosong -> Simpan tetap diblokir
    await expect(btnSimpan(page)).toBeDisabled({ timeout: 10000 });

    const ariaDisabled = await btnSimpan(page).getAttribute('aria-disabled');
    const isDisabled = await btnSimpan(page).isDisabled();
    console.log(`TC-4949-18 Simpan disabled=${isDisabled} aria-disabled=${ariaDisabled}`);

    await page.screenshot({ path: 'explore-output/tc-4949-18-after.png' });
    await closeModal(page);
  });
});
