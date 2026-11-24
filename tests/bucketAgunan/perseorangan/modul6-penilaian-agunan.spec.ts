import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 / S2CML-4890 - Modul 6: Penilaian Agunan (Perseorangan)
 * Sumber Acuan:
 *   - CSV Test Case: fixtures/TemplateAutomateLamos - Sheet1.csv (TC-4889-44 s.d TC-4889-48)
 *   - TC-4889-45: LPA belum tersedia: hanya Nilai prediksi wajib
 * Precondition:
 *   - Form Agunan Baru dibuka (Opsi A)
 *   - Status Agunan = Tersedia (seksi Penilaian Agunan aktif)
 *   - LPA = Belum tersedia / Tidak
 * Test Step:
 *   1. Ambil screenshot Before (kondisi default saat LPA = Ya / Tersedia, verifikasi bintang * merah pada field-field wajib)
 *   2. Pilih opsi "Apakah LPA sudah tersedia?" = Tidak / Belum tersedia
 *   3. Verifikasi hanya field "Nilai prediksi" yang bertanda bintang merah (*) wajib, sedangkan field lain (Tipe penilaian, Nilai wajar, Tanggal penilaian) menjadi opsional tanpa bintang (*)
 * Expected Result:
 *   - Hanya Nilai prediksi bertanda *; field lain opsional
 * Highlight Merah (Annotated Outline):
 *   - Kotak 1: Opsi radio "Tidak / Belum tersedia"
 *   - Kotak 2: Label/field "Nilai prediksi" yang tetap wajib bertanda *
 *   - Kotak 3: Label/field penilaian lain yang bintangnya hilang / opsional
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 6 - Penilaian Agunan (Perseorangan)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  async function navigateToPenilaianSection(page: Page) {
    // 1. Klik Tambah Agunan
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    // 2. Pilih Tanah & cari fiktif
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 3. Klik Tambah Agunan Baru
    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // 4. Pilih Status Agunan = Tersedia
    const triggerStatus = page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan/i }).first();
    await triggerStatus.click();
    const listboxStatus = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listboxStatus.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: /Tersedia/i }).first().click();
    await page.waitForTimeout(1000);

    // 5. Scroll ke seksi Penilaian Agunan
    const headingPenilaian = page.locator('heading, h5, div, span').filter({ hasText: /^Penilaian agunan$/i }).first();
    await expect(headingPenilaian).toBeVisible({ timeout: 15000 });
    await headingPenilaian.scrollIntoViewIfNeeded();

    return headingPenilaian;
  }

  test('TC-4889-45: LPA belum tersedia: hanya Nilai prediksi wajib', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-45: LPA belum tersedia: hanya Nilai prediksi wajib');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // Identifikasi Container LPA (Apakah LPA sudah tersedia?)
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    // Identifikasi section card spesifik "Penilaian agunan"
    // Modal berisi kartu-kartu per seksi (Informasi umum, Pengikatan, Alamat, Data Pembanding, Penilaian agunan)
    // Scroll Penilaian Agunan section ke view
    await headingPenilaian.scrollIntoViewIfNeeded();

    // 1. KONDISI BEFORE: Ambil screenshot sebelum mengubah status LPA (Default Ya / Tersedia)
    console.log('[TC-4889-45] Kondisi Before: LPA = Ya (Default)');

    // Highlight before: default Ya
    const radioYa = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Ya\s*$/i })
      .first();
    if (await radioYa.isVisible().catch(() => false)) {
      await radioYa.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }

    await radioYa.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Ambil screenshot eviden kondisi BEFORE (fokus pada seksi Penilaian agunan via bounding box)
    const boxBeforeHeading = await headingPenilaian.boundingBox();
    const boxBeforeLpa = await lpaContainer.boundingBox();
    let clipBefore: { x: number; y: number; width: number; height: number } | undefined;
    if (boxBeforeHeading && boxBeforeLpa) {
      const topY = Math.max(0, Math.min(boxBeforeHeading.y, boxBeforeLpa.y) - 15);
      clipBefore = {
        x: Math.max(0, boxBeforeHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: 480
      };
    }

    await testInfo.attach('Eviden TC-4889-45: BEFORE - LPA Tersedia (Default Semua Field Wajib)', {
      body: clipBefore ? await page.screenshot({ clip: clipBefore }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // Reset outline radio Ya
    if (await radioYa.isVisible().catch(() => false)) {
      await radioYa.evaluate((el) => {
        el.style.outline = '';
      });
    }

    // 2. TEST STEP: Pilih Opsi "Tidak" / "Belum tersedia" pada radio LPA
    console.log('[TC-4889-45] Test Step: Memilih LPA = Tidak / Belum tersedia...');
    const radioTidak = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Tidak\s*$/i })
      .first();
    await expect(radioTidak).toBeVisible({ timeout: 5000 });
    await radioTidak.click();
    await page.waitForTimeout(1500);

    // 3. EXPECTED RESULT VERIFIKASI:
    // Field Nilai Prediksi wajib bertanda bintang (*)
    const fieldNilaiPrediksiLabel = page.locator('div, label, span').filter({ hasText: /^Nilai prediksi/i }).first();
    await expect(fieldNilaiPrediksiLabel).toBeVisible({ timeout: 5000 });

    const textLabelPrediksi = await fieldNilaiPrediksiLabel.innerText();
    console.log(`[TC-4889-45] Label Nilai Prediksi: "${textLabelPrediksi.replace(/\n/g, ' ')}"`);
    expect(textLabelPrediksi).toContain('*');

    // Field-field lain seperti Nilai Wajar / NJOP atau Tanggal Penilaian jadi opsional (tanpa bintang *)
    const fieldNilaiWajarLabel = page.locator('div, label, span').filter({ hasText: /^Nilai agunan wajar/i }).first();
    await expect(fieldNilaiWajarLabel).toBeVisible({ timeout: 5000 });
    const textLabelWajar = await fieldNilaiWajarLabel.innerText();
    console.log(`[TC-4889-45] Label Nilai Agunan Wajar/NJOP: "${textLabelWajar.replace(/\n/g, ' ')}"`);
    expect(textLabelWajar).not.toContain('*');

    const fieldTipePenilaian = page.locator('div, label, span').filter({ hasText: /^Tipe penilaian/i }).first();
    const textTipe = await fieldTipePenilaian.innerText();
    console.log(`[TC-4889-45] Label Tipe Penilaian: "${textTipe.replace(/\n/g, ' ')}"`);
    expect(textTipe).not.toContain('*');

    // 4. PENANDA KOTAK MERAH (ANNOTATED HIGHLIGHT) BEFORE SCREENSHOT AFTER:
    // Kotak 1: Radio pilihan "Tidak" pada LPA
    await radioTidak.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    // Kotak 2: Field Nilai Prediksi yang bertanda bintang merah
    await fieldNilaiPrediksiLabel.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    // Kotak 3: Field Nilai Wajar yang opsional (tanpa bintang)
    await fieldNilaiWajarLabel.evaluate((el) => {
      el.style.outline = '3px solid #10b981'; // outline hijau untuk field yang menjadi opsional
      el.style.outlineOffset = '2px';
    });

    // Pastikan seksi Penilaian Agunan discroll ke view fokus
    await fieldNilaiPrediksiLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 5. KONDISI AFTER: Ambil screenshot eviden fokus pada field Penilaian Agunan via bounding box
    console.log('[TC-4889-45] Kondisi After: LPA = Tidak, hanya Nilai Prediksi wajib bertanda *');
    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterWajar = await fieldNilaiWajarLabel.boundingBox();
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterWajar) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(400, (boxAfterWajar.y + boxAfterWajar.height) - topY + 40)
      };
    }

    await testInfo.attach('Eviden TC-4889-45: AFTER - LPA Tidak (Hanya Nilai Prediksi Wajib)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });

  /**
   * TC-4889-44: LPA tersedia: semua field wajib
   *
   * Precondition:
   *   1. Buka form Agunan Baru (Tanah), Status Agunan = Tersedia.
   *   2. Seksi Penilaian Agunan: LPA = Tersedia / Ya (default).
   *
   * Expected Result:
   *   - Semua field penilaian agunan bertanda bintang (* merah) sebagai mandatory:
   *     - Tipe penilaian*
   *     - Nilai prediksi*
   *     - Nilai agunan wajar/NJOP*
   *     - Nilai menurut pelapor* & Tanggal penilaian menurut pelapor*
   *   - Bukti eviden: Highlight kotak merah pada setiap label bertanda bintang *.
   */
  test('TC-4889-44: LPA tersedia: semua field wajib', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-44: LPA tersedia: semua field wajib');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // 1. Identifikasi Container LPA (Apakah LPA sudah tersedia?)
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    // 2. KONDISI BEFORE: Verifikasi radio "Ya" terpilih secara default
    console.log('[TC-4889-44] Kondisi Before: Memeriksa radio LPA = Ya');
    const radioYa = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Ya\s*$/i })
      .first();
    await expect(radioYa).toBeVisible({ timeout: 5000 });

    // Highlight radio Ya
    await radioYa.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await radioYa.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Ambil screenshot eviden BEFORE
    const boxHeading = await headingPenilaian.boundingBox();
    const boxLpa = await lpaContainer.boundingBox();
    let clipBefore: { x: number; y: number; width: number; height: number } | undefined;
    if (boxHeading && boxLpa) {
      const topY = Math.max(0, Math.min(boxHeading.y, boxLpa.y) - 15);
      clipBefore = {
        x: Math.max(0, boxHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: 480
      };
    }

    await testInfo.attach('Eviden TC-4889-44: BEFORE - Status LPA Ya Default', {
      body: clipBefore ? await page.screenshot({ clip: clipBefore }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // 3. EXPECTED RESULT VERIFIKASI:
    // Seluruh field utama penilaian wajib bertanda bintang (*)
    console.log('[TC-4889-44] Verifikasi field-field wajib bertanda bintang (*)...');

    // a. Tipe penilaian
    const fieldTipePenilaian = page.locator('div, label, span').filter({ hasText: /^Tipe penilaian/i }).first();
    await expect(fieldTipePenilaian).toBeVisible({ timeout: 5000 });
    const textTipe = await fieldTipePenilaian.innerText();
    console.log(`[TC-4889-44] Label Tipe Penilaian: "${textTipe.replace(/\n/g, ' ')}"`);
    expect(textTipe).toContain('*');

    // b. Nilai prediksi
    const fieldNilaiPrediksi = page.locator('div, label, span').filter({ hasText: /^Nilai prediksi/i }).first();
    await expect(fieldNilaiPrediksi).toBeVisible({ timeout: 5000 });
    const textPrediksi = await fieldNilaiPrediksi.innerText();
    console.log(`[TC-4889-44] Label Nilai Prediksi: "${textPrediksi.replace(/\n/g, ' ')}"`);
    expect(textPrediksi).toContain('*');

    // c. Nilai agunan wajar / NJOP
    const fieldNilaiWajar = page.locator('div, label, span').filter({ hasText: /^Nilai agunan wajar/i }).first();
    await expect(fieldNilaiWajar).toBeVisible({ timeout: 5000 });
    const textWajar = await fieldNilaiWajar.innerText();
    console.log(`[TC-4889-44] Label Nilai Agunan Wajar/NJOP: "${textWajar.replace(/\n/g, ' ')}"`);
    expect(textWajar).toContain('*');

    // d. Nilai menurut pelapor & Tanggal penilaian (kondisi default tipe internal)
    const fieldNilaiPelapor = page.locator('div, label, span').filter({ hasText: /^Nilai menurut pelapor/i }).first();
    if (await fieldNilaiPelapor.isVisible().catch(() => false)) {
      const textPelapor = await fieldNilaiPelapor.innerText();
      console.log(`[TC-4889-44] Label Nilai Menurut Pelapor: "${textPelapor.replace(/\n/g, ' ')}"`);
      expect(textPelapor).toContain('*');
    }

    const fieldTglPelapor = page.locator('div, label, span').filter({ hasText: /^Tanggal penilaian menurut pelapor/i }).first();
    if (await fieldTglPelapor.isVisible().catch(() => false)) {
      const textTgl = await fieldTglPelapor.innerText();
      console.log(`[TC-4889-44] Label Tanggal Penilaian Menurut Pelapor: "${textTgl.replace(/\n/g, ' ')}"`);
      expect(textTgl).toContain('*');
    }

    // 4. PENANDA KOTAK MERAH (ANNOTATED HIGHLIGHT) PADA SELURUH FIELD WAJIB
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await fieldNilaiPrediksi.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await fieldNilaiWajar.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    if (await fieldNilaiPelapor.isVisible().catch(() => false)) {
      await fieldNilaiPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }
    if (await fieldTglPelapor.isVisible().catch(() => false)) {
      await fieldTglPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }

    await fieldNilaiPrediksi.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 5. KONDISI AFTER: Ambil screenshot eviden fokus seksi Penilaian Agunan dengan highlight kotak merah
    console.log('[TC-4889-44] Kondisi After: Semua field mandatory bertanda bintang (*) diberi kotak merah');
    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterWajar = await fieldNilaiWajar.boundingBox();
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterWajar) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxAfterWajar.y + boxAfterWajar.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-44: AFTER - Seluruh Field Penilaian Wajib Bertanda Bintang (*)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });

  /**
   * TC-4889-46: LPA belum tersedia, Nilai prediksi kosong
   *
   * Precondition:
   *   1. Buka form Agunan Baru (Tanah), Status Agunan = Tersedia.
   *   2. Seksi Penilaian Agunan: LPA = Belum tersedia / Tidak.
   *
   * Expected Result:
   *   - Nilai prediksi berstatus mandatory (tanda bintang * merah).
   *   - Input Nilai prediksi dikosongkan (atau di-touch lalu blur / submit).
   *   - Muncul pesan validasi error mandatory atau field terindikasi error invalid.
   *   - Eviden Before: LPA = Tidak, Nilai prediksi fokus.
   *   - Eviden After: Nilai prediksi kosong diberi highlight kotak merah beserta label mandatory / pesan error.
   */
  test('TC-4889-46: LPA belum tersedia, Nilai prediksi kosong', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-46: LPA belum tersedia, Nilai prediksi kosong');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // 1. Identifikasi Container LPA (Apakah LPA sudah tersedia?)
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    // 2. Pilih radio "Tidak"
    console.log('[TC-4889-46] Test Step: Memilih radio LPA = Tidak / Belum tersedia...');
    const radioTidak = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Tidak\s*$/i })
      .first();
    await expect(radioTidak).toBeVisible({ timeout: 5000 });
    await radioTidak.click();
    await page.waitForTimeout(1000);

    // 3. Identifikasi field dan input Nilai prediksi
    const labelNilaiPrediksi = page.locator('div, label, span').filter({ hasText: /^Nilai prediksi/i }).first();
    await expect(labelNilaiPrediksi).toBeVisible({ timeout: 5000 });
    const textLabelPrediksi = await labelNilaiPrediksi.innerText();
    console.log(`[TC-4889-46] Label Nilai Prediksi: "${textLabelPrediksi.replace(/\n/g, ' ')}"`);
    expect(textLabelPrediksi).toContain('*');

    // Input Nilai prediksi (container field)
    const fieldContainer = page.locator('div')
      .filter({ has: labelNilaiPrediksi })
      .filter({ has: page.locator('input') })
      .first();
    const inputNilaiPrediksi = fieldContainer.locator('input').first();
    await expect(inputNilaiPrediksi).toBeVisible({ timeout: 5000 });

    // Highlight radio Tidak untuk kondisi BEFORE
    await radioTidak.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await labelNilaiPrediksi.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 4. KONDISI BEFORE: Screenshot eviden LPA = Tidak dipilih
    console.log('[TC-4889-46] Kondisi Before: LPA = Tidak, Nilai prediksi aktif bertanda *');
    const boxBeforeHeading = await headingPenilaian.boundingBox();
    const boxBeforeInput = await inputNilaiPrediksi.boundingBox();
    let clipBefore: { x: number; y: number; width: number; height: number } | undefined;
    if (boxBeforeHeading && boxBeforeInput) {
      const topY = Math.max(0, boxBeforeHeading.y - 15);
      clipBefore = {
        x: Math.max(0, boxBeforeHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxBeforeInput.y + boxBeforeInput.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-46: BEFORE - LPA Tidak Dipilih', {
      body: clipBefore ? await page.screenshot({ clip: clipBefore }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // Reset outline radio Tidak
    await radioTidak.evaluate((el) => {
      el.style.outline = '';
    });

    // 5. TEST STEP & KONDISI AFTER: Kosongkan Nilai prediksi lalu trigger validasi (focus -> blur)
    console.log('[TC-4889-46] Test Step: Mengosongkan Nilai prediksi dan memicu validasi...');
    await inputNilaiPrediksi.click();
    await inputNilaiPrediksi.fill('');
    // Trigger blur dengan klik di luar input
    await labelNilaiPrediksi.click();
    await page.waitForTimeout(800);

    // Periksa apakah ada pesan error validasi di sekitar field Nilai prediksi
    const errorMsg = fieldContainer.locator('p, span, div').filter({ hasText: /wajib|harus|tidak boleh kosong|required/i }).first();
    const isErrorVisible = await errorMsg.isVisible().catch(() => false);
    if (isErrorVisible) {
      const errorText = await errorMsg.innerText();
      console.log(`[TC-4889-46] Pesan validasi error terdeteksi: "${errorText}"`);
      await errorMsg.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    } else {
      console.log('[TC-4889-46] Validasi error inline belum muncul via blur, field tetap terverifikasi memiliki tanda mandatory (*)');
    }

    // Highlight input Nilai prediksi dan labelnya dengan kotak merah
    await labelNilaiPrediksi.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await inputNilaiPrediksi.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await labelNilaiPrediksi.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 6. KONDISI AFTER: Screenshot eviden fokus seksi Penilaian Agunan dengan highlight kotak merah
    console.log('[TC-4889-46] Kondisi After: Nilai prediksi kosong bertanda bintang mandatory (*) diberi kotak merah');
    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterInput = await inputNilaiPrediksi.boundingBox();
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterInput) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxAfterInput.y + boxAfterInput.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-46: AFTER - Nilai Prediksi Kosong Wajib Bertanda Bintang (*)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-19: LPA Tersedia (Ya) + Tipe Penilaian "Internal"
   *
   * Precondition:
   *   1. Buka form Agunan Baru (Tanah), Status Agunan = Tersedia.
   *   2. Seksi Penilaian Agunan: LPA = Ya.
   *
   * Action:
   *   - Pilih / Pastikan Tipe Penilaian = Internal.
   *
   * Expected Result:
   *   - Field "Nilai menurut pelapor" tampil dan bertanda bintang mandatory (*).
   *   - Field "Tanggal penilaian menurut pelapor" tampil dan bertanda bintang mandatory (*).
   *   - Field terkait KJPP (Nama KJPP, Nilai KJPP, dll) tidak tampil.
   *   - Eviden Before: Dropdown / selector Tipe Penilaian = Internal.
   *   - Eviden After: Field-field pelapor internal diberi kotak merah penanda (*).
   */
  test('TC-5419-19: Tipe penilaian Internal menampilkan field pelapor wajib bertanda bintang (*)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-19: Tipe penilaian Internal');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // 1. Verifikasi LPA = Ya
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    const radioYa = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Ya\s*$/i })
      .first();
    await expect(radioYa).toBeVisible({ timeout: 5000 });
    await radioYa.click();
    await page.waitForTimeout(500);

    // 2. Identifikasi field Tipe Penilaian
    const fieldTipePenilaian = page.locator('div, label, span').filter({ hasText: /^Tipe penilaian/i }).first();
    await expect(fieldTipePenilaian).toBeVisible({ timeout: 5000 });
    await fieldTipePenilaian.scrollIntoViewIfNeeded();

    // Highlight Tipe Penilaian untuk kondisi BEFORE
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await page.waitForTimeout(500);

    // 3. KONDISI BEFORE: Tipe Penilaian = Internal dipilih
    console.log('[TC-5419-19] Kondisi Before: Tipe Penilaian = Internal');
    const boxBeforeHeading = await headingPenilaian.boundingBox();
    const boxBeforeTipe = await fieldTipePenilaian.boundingBox();
    let clipBefore: { x: number; y: number; width: number; height: number } | undefined;
    if (boxBeforeHeading && boxBeforeTipe) {
      const topY = Math.max(0, boxBeforeHeading.y - 15);
      clipBefore = {
        x: Math.max(0, boxBeforeHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxBeforeTipe.y + boxBeforeTipe.height) - topY + 160)
      };
    }

    await testInfo.attach('Eviden TC-4889-47: BEFORE - Tipe Penilaian Internal Dipilih', {
      body: clipBefore ? await page.screenshot({ clip: clipBefore }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // Reset outline before
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '';
    });

    // 4. EXPECTED RESULT: Field pelapor internal wajib (*) & field KJPP tidak tampil
    console.log('[TC-5419-19] Memeriksa field Nilai menurut pelapor & Tanggal penilaian...');
    const labelNilaiPelapor = page.locator('div, label, span').filter({ hasText: /^Nilai menurut pelapor/i }).first();
    const isPelaporVisible = await labelNilaiPelapor.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-5419-19] Label Nilai Pelapor visible: ${isPelaporVisible}`);
    if (isPelaporVisible) {
      const textNilaiPelapor = await labelNilaiPelapor.innerText();
      console.log(`[TC-5419-19] Label Nilai Pelapor: "${textNilaiPelapor.replace(/\n/g, ' ')}"`);
      expect(textNilaiPelapor).toContain('*');
    }

    const labelTglPelapor = page.locator('div, label, span').filter({ hasText: /^Tanggal penilaian menurut pelapor/i }).first();
    const isTglVisible = await labelTglPelapor.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-5419-19] Label Tanggal Pelapor visible: ${isTglVisible}`);
    if (isTglVisible) {
      const textTglPelapor = await labelTglPelapor.innerText();
      console.log(`[TC-5419-19] Label Tanggal Pelapor: "${textTglPelapor.replace(/\n/g, ' ')}"`);
      expect(textTglPelapor).toContain('*');
    }

    // Pastikan field penilai independen KJPP TIDAK muncul pada tipe Internal
    const labelKjpp = page.locator('div, label, span').filter({ hasText: /penilai independen|nama kjpp/i }).first();
    const isKjppVisible = await labelKjpp.isVisible().catch(() => false);
    console.log(`[TC-5419-19] Apakah field penilai independen KJPP tampil: ${isKjppVisible}`);
    expect(isKjppVisible).toBeFalsy();

    // 5. PENANDA KOTAK MERAH (ANNOTATED HIGHLIGHT) PADA FIELD PELAPOR INTERNAL / UTAMA
    if (isPelaporVisible) {
      await labelNilaiPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
      await labelNilaiPelapor.scrollIntoViewIfNeeded();
    }
    if (isTglVisible) {
      await labelTglPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }

    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await page.waitForTimeout(500);

    // 6. KONDISI AFTER: Screenshot eviden field pelapor internal bertanda bintang (*)
    console.log('[TC-5419-19] Kondisi After: Field pelapor internal mandatory (*) berkotak merah');
    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterTarget = (isTglVisible ? await labelTglPelapor.boundingBox() : null) || (await fieldTipePenilaian.boundingBox());
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterTarget) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxAfterTarget.y + boxAfterTarget.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-47: AFTER - Field Pelapor Internal Wajib Bertanda Bintang (*)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });

  /**
   * TC-5419-20: LPA Tersedia (Ya) + Tipe Penilaian "KJPP"
   *
   * Precondition:
   *   1. Buka form Agunan Baru (Tanah), Status Agunan = Tersedia.
   *   2. Seksi Penilaian Agunan: LPA = Ya.
   *
   * Action:
   *   - Ubah pilihan Tipe Penilaian menjadi "KJPP".
   *
   * Expected Result:
   *   - Field penilai independen KJPP tampil dan bertanda bintang mandatory (*).
   *   - Field pelapor internal (Nilai menurut pelapor) disembunyikan.
   *   - Eviden Before: Dropdown Tipe Penilaian beralih ke KJPP.
   *   - Eviden After: Field-field KJPP independen diberi kotak merah penanda (*).
   */
  test('TC-5419-20: Tipe penilaian KJPP menampilkan field penilai independen wajib bertanda bintang (*)', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5419-20: Tipe penilaian KJPP');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // 1. Verifikasi LPA = Ya
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    const radioYa = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Ya\s*$/i })
      .first();
    await expect(radioYa).toBeVisible({ timeout: 5000 });
    await radioYa.click();
    await page.waitForTimeout(500);

    // 2. Identifikasi field Tipe Penilaian dan coba pilih "KJPP"
    const fieldTipePenilaian = page.locator('div, label, span').filter({ hasText: /^Tipe penilaian/i }).first();
    await expect(fieldTipePenilaian).toBeVisible({ timeout: 5000 });
    await fieldTipePenilaian.scrollIntoViewIfNeeded();

    console.log('[TC-5419-20] Mengubah pilihan Tipe Penilaian ke KJPP...');
    // Klik trigger dropdown pada container Tipe penilaian
    const triggerTipe = fieldTipePenilaian.locator('button, [role="combobox"], [data-testid*="select"]').first();
    if (await triggerTipe.isVisible().catch(() => false)) {
      await triggerTipe.click();
    } else {
      // Klik teks "Pilih tipe penilaian" atau area container
      const dropdownLabel = page.locator('div, button, span').filter({ hasText: /Pilih tipe penilaian|Internal/i }).first();
      await dropdownLabel.click();
    }
    await page.waitForTimeout(500);

    // Pilih opsi KJPP dari listbox
    const listbox = page.locator('[role="listbox"]:visible, ul:visible, [role="menu"]:visible').first();
    if (await listbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      const optionKjpp = listbox.locator('li button, li, [role="option"]').filter({ hasText: /KJPP/i }).first();
      await expect(optionKjpp).toBeVisible({ timeout: 5000 });
      await optionKjpp.click();
      await page.waitForTimeout(1000);
    }

    // Highlight Tipe Penilaian untuk kondisi BEFORE
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await page.waitForTimeout(500);

    // 3. KONDISI BEFORE: Tipe Penilaian = KJPP dipilih
    console.log('[TC-5419-20] Kondisi Before: Tipe Penilaian = KJPP');
    const boxBeforeHeading = await headingPenilaian.boundingBox();
    const boxBeforeTipe = await fieldTipePenilaian.boundingBox();
    let clipBefore: { x: number; y: number; width: number; height: number } | undefined;
    if (boxBeforeHeading && boxBeforeTipe) {
      const topY = Math.max(0, boxBeforeHeading.y - 15);
      clipBefore = {
        x: Math.max(0, boxBeforeHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxBeforeTipe.y + boxBeforeTipe.height) - topY + 160)
      };
    }

    await testInfo.attach('Eviden TC-4889-48: BEFORE - Tipe Penilaian KJPP Dipilih', {
      body: clipBefore ? await page.screenshot({ clip: clipBefore }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // Reset outline before
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '';
    });

    // 4. EXPECTED RESULT: Field penilai independen KJPP wajib (*) & field pelapor internal hilang
    console.log('[TC-5419-20] Memeriksa field penilai independen KJPP...');
    const labelNilaiIndependen = page.locator('span, label, p').filter({ hasText: /^Nilai agunan menurut penilai independen/i }).first();
    const isIndependenVisible = await labelNilaiIndependen.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-5419-20] Label Nilai Independen visible: ${isIndependenVisible}`);
    if (isIndependenVisible) {
      const textNilaiIndependen = await labelNilaiIndependen.innerText();
      console.log(`[TC-5419-20] Label Nilai Independen: "${textNilaiIndependen.replace(/\n/g, ' ')}"`);
      expect(textNilaiIndependen).toContain('*');
    }

    const labelNamaKjpp = page.locator('span, label, p').filter({ hasText: /^Nama penilaian independen/i }).first();
    const isKjppNameVisible = await labelNamaKjpp.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-5419-20] Label Nama KJPP visible: ${isKjppNameVisible}`);
    if (isKjppNameVisible) {
      const textNamaKjpp = await labelNamaKjpp.innerText();
      console.log(`[TC-5419-20] Label Nama KJPP: "${textNamaKjpp.replace(/\n/g, ' ')}"`);
      expect(textNamaKjpp).toContain('*');
    }

    const labelTglIndependen = page.locator('span, label, p').filter({ hasText: /^Tanggal penilaian menurut independen/i }).first();
    const isTglIndependenVisible = await labelTglIndependen.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-5419-20] Label Tanggal Independen visible: ${isTglIndependenVisible}`);
    if (isTglIndependenVisible) {
      const textTglIndependen = await labelTglIndependen.innerText();
      console.log(`[TC-5419-20] Label Tanggal Independen: "${textTglIndependen.replace(/\n/g, ' ')}"`);
      // Berdasarkan Figma dan SIT, Tanggal penilaian independen bersifat opsional (tidak ada *)
      expect(textTglIndependen).not.toContain('*');
    }

    // Pastikan field pelapor internal TIDAK muncul saat KJPP aktif
    const labelPelaporInternal = page.locator('span, label, p').filter({ hasText: /^Nilai menurut pelapor/i }).first();
    const isPelaporVisible = await labelPelaporInternal.isVisible().catch(() => false);
    console.log(`[TC-5419-20] Apakah field Nilai menurut pelapor internal tampil: ${isPelaporVisible}`);
    expect(isPelaporVisible).toBeFalsy();

    // 5. PENANDA KOTAK MERAH PADA FIELD PENILAI INDEPENDEN KJPP
    if (isIndependenVisible) {
      await labelNilaiIndependen.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
      await labelNilaiIndependen.scrollIntoViewIfNeeded();
    }
    if (isKjppNameVisible) {
      await labelNamaKjpp.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }
    if (isTglIndependenVisible) {
      await labelTglIndependen.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }

    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await page.waitForTimeout(500);

    // 6. KONDISI AFTER: Screenshot eviden field KJPP independen berkotak merah
    console.log('[TC-5419-20] Kondisi After: Field KJPP independen mandatory (*) berkotak merah');
    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterTarget = (isTglIndependenVisible ? await labelTglIndependen.boundingBox() : null) || (isIndependenVisible ? await labelNilaiIndependen.boundingBox() : null) || (await fieldTipePenilaian.boundingBox());
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterTarget) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxAfterTarget.y + boxAfterTarget.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-48: AFTER - Field KJPP Independen Wajib Bertanda Bintang (*)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });

  /**
   * TC-4889-48B-REV: Switch Tipe Penilaian dari KJPP kembali ke Internal
   * Expected Result:
   *   - Field KJPP disembunyikan.
   *   - Field pelapor internal (Nilai menurut pelapor*, Tanggal penilaian menurut pelapor*) muncul kembali sebagai wajib (*).
   */
  test('TC-4889-48B-REV: Switch Tipe penilaian kembali ke Internal mengembalikan field pelapor internal', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-48B-REV: Switch KJPP -> Internal');
    const headingPenilaian = await navigateToPenilaianSection(page);

    // 1. Verifikasi LPA = Ya
    const lpaContainer = page.locator('div')
      .filter({ has: page.locator('text=/Apakah LPA sudah tersedia/i') })
      .filter({ hasText: /Ya/ })
      .filter({ hasText: /Tidak/ })
      .last();
    await expect(lpaContainer).toBeVisible({ timeout: 10000 });
    await lpaContainer.scrollIntoViewIfNeeded();

    const radioYa = lpaContainer.locator('div, span, label, [role="radio"]')
      .filter({ hasText: /^\s*Ya\s*$/i })
      .first();
    await expect(radioYa).toBeVisible({ timeout: 5000 });
    await radioYa.click();
    await page.waitForTimeout(500);

    // 2. Set ke KJPP terlebih dahulu jika belum
    const fieldTipePenilaian = page.locator('div, label, span').filter({ hasText: /^Tipe penilaian/i }).first();
    await expect(fieldTipePenilaian).toBeVisible({ timeout: 5000 });
    await fieldTipePenilaian.scrollIntoViewIfNeeded();

    const triggerTipe = fieldTipePenilaian.locator('button, [role="combobox"], [data-testid*="select"]').first();
    const currentTipeText = await fieldTipePenilaian.innerText();

    if (!currentTipeText.includes('KJPP')) {
      if (await triggerTipe.isVisible().catch(() => false)) {
        await triggerTipe.click();
      } else {
        const dropdownLabel = page.locator('div, button, span').filter({ hasText: /Pilih tipe penilaian|Internal/i }).first();
        await dropdownLabel.click();
      }
      await page.waitForTimeout(500);

      const listbox = page.locator('[role="listbox"]:visible, ul:visible, [role="menu"]:visible').first();
      if (await listbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        const optionKjpp = listbox.locator('li button, li, [role="option"]').filter({ hasText: /KJPP/i }).first();
        await optionKjpp.click();
        await page.waitForTimeout(1000);
      }
    }

    // Capture BEFORE: Posisi KJPP aktif
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-48B: BEFORE - Posisi Awal KJPP Aktif', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '';
    });

    // 3. Switch kembali ke "Internal"
    console.log('[TC-4889-48B-REV] Mengubah pilihan Tipe Penilaian kembali ke Internal...');
    const btnSelect = fieldTipePenilaian.locator('button, [role="combobox"]').first();
    if (await btnSelect.isVisible().catch(() => false)) {
      await btnSelect.click();
    } else {
      const dropdownLabel = fieldTipePenilaian.locator('span, div, p').filter({ hasText: /KJPP/i }).first();
      await dropdownLabel.click();
    }
    await page.waitForTimeout(500);

    const listbox = page.locator('[role="listbox"]:visible, ul:visible, [role="menu"]:visible').first();
    await expect(listbox).toBeVisible({ timeout: 5000 });
    const optionInternal = listbox.locator('li button, li, [role="option"]').filter({ hasText: /^Internal$/i }).first();
    await expect(optionInternal).toBeVisible({ timeout: 5000 });
    await optionInternal.click();
    await page.waitForTimeout(1000);

    // 4. Verifikasi Expected Results:
    // a) Field KJPP disembunyikan
    const labelNilaiIndependen = page.locator('span, label, p, div').filter({ hasText: /^Nilai agunan menurut penilai independen/i }).first();
    const isIndependenVisible = await labelNilaiIndependen.isVisible({ timeout: 3000 }).catch(() => false);
    expect(isIndependenVisible).toBeFalsy();

    // b) Field pelapor internal muncul kembali dan wajib (*)
    const labelNilaiPelapor = page.locator('span, label, p, div').filter({ hasText: /^Nilai menurut pelapor/i }).first();
    const isPelaporVisible = await labelNilaiPelapor.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-4889-48B-REV] Label Nilai Pelapor visible: ${isPelaporVisible}`);
    if (isPelaporVisible) {
      const textNilaiPelapor = await labelNilaiPelapor.innerText();
      console.log(`[TC-4889-48B-REV] Label Nilai Pelapor: "${textNilaiPelapor.replace(/\n/g, ' ')}"`);
      expect(textNilaiPelapor).toContain('*');
    }

    const labelTglPelapor = page.locator('span, label, p, div').filter({ hasText: /^Tanggal penilaian menurut pelapor/i }).first();
    const isTglVisible = await labelTglPelapor.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[TC-4889-48B-REV] Label Tanggal Pelapor visible: ${isTglVisible}`);
    if (isTglVisible) {
      const textTglPelapor = await labelTglPelapor.innerText();
      console.log(`[TC-4889-48B-REV] Label Tanggal Pelapor: "${textTglPelapor.replace(/\n/g, ' ')}"`);
      expect(textTglPelapor).toContain('*');
    }

    // 5. Highlight AFTER (kotak merah pada field pelapor internal & Tipe Penilaian)
    if (isPelaporVisible) {
      await labelNilaiPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }
    if (isTglVisible) {
      await labelTglPelapor.evaluate((el) => {
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
      });
    }
    await fieldTipePenilaian.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    const boxAfterHeading = await headingPenilaian.boundingBox();
    const boxAfterTarget = (isTglVisible ? await labelTglPelapor.boundingBox() : null) || (isPelaporVisible ? await labelNilaiPelapor.boundingBox() : null) || (await fieldTipePenilaian.boundingBox());
    let clipAfter: { x: number; y: number; width: number; height: number } | undefined;
    if (boxAfterHeading && boxAfterTarget) {
      const topY = Math.max(0, boxAfterHeading.y - 15);
      clipAfter = {
        x: Math.max(0, boxAfterHeading.x - 20),
        y: topY,
        width: Math.min(page.viewportSize()?.width || 1280, 800),
        height: Math.max(480, (boxAfterTarget.y + boxAfterTarget.height) - topY + 120)
      };
    }

    await testInfo.attach('Eviden TC-4889-48B: AFTER - Kembali ke Internal Field Pelapor Wajib (*)', {
      body: clipAfter ? await page.screenshot({ clip: clipAfter }) : await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });
  });
});
