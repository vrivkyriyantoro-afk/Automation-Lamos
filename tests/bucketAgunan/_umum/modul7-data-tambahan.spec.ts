import { test, expect, Page, Locator } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

/**
 * Test Suite: Story S2CML-4889 / S2CML-4890 - Modul 7: Data Tambahan Agunan (Perseorangan)
 * Target Debitur: Individual / Perseorangan (debtorType=individual)
 * Application ID: 01M4F7TNSCSHEDB5G3WTSP7HDY
 * Sumber Acuan:
 *   - CSV Test Case: fixtures/sources/TemplateAutomateLamos - Sheet1.csv
 *     (TC-4889-49 s.d TC-4889-53 milik S2CML-4889; TC-5445-01 s.d TC-5445-08 milik S2CML-5445 / S2CML-4981)
 *   - Figma: Node 6124:461698 (hayDfdzm40LHECLlcVsebo)
 * Skenario:
 *   1. TC-4889-49: Sifat agunan Housing -> Step 2 "Data tambahan agunan", dropdown "Sifat agunan jaminan*" -> opsi [Eligible, Non Eligible]
 *   2. TC-4889-50: Sifat agunan Kendaraan -> Step 2, dropdown "Sifat agunan jaminan*" -> opsi [Eligible, Non Eligible]
 *   3. TC-4889-51: Sifat agunan Cash -> Step 2, dropdown "Sifat agunan jaminan*" -> opsi [Eligible, Non Eligible]
 *   4. TC-4889-52: Cash F09/F10/F11/F15 field informasi -> Bukti pemilikan* & pertanyaan Bank Sinarmas (Ya/Tidak) tampil
 *   5. TC-4889-53: Cash selain F09/F10/F11/F15 -> Hanya Bukti pemilikan*, pertanyaan Bank Sinarmas tidak tampil
 *   6. TC-5445-01 & TC-5445-02: CIF default state (kosong, placeholder, Cek nonaktif) & CIF filled (Cek aktif biru)
 *   7. TC-5445-08: Agunan tidak tersimpan di Bank Sinarmas (Pilih "Tidak" -> field CIF hilang, muncul input manual "Instansi penerbit*" mandatory)
 * Visual Evidence:
 *   - Kotak merah: outline: 3px solid red, outlineOffset: 2px
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const TARGET_URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4889: Modul 7 - Data Tambahan Agunan (Perseorangan)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  // Helper navigasi ke Step 2 (Data tambahan agunan) untuk jenis agunan tertentu
  async function navigateToStep2(page: Page, jenisText: string) {
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    // Pilih jenis agunan
    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    await listbox.locator('li button, li').filter({ hasText: new RegExp(jenisText, 'i') }).first().click();

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('MODUL7_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    // Klik Step 2: Tab Data tambahan agunan
    const tabDataTambahan = page.locator('button, [role="tab"]').filter({ hasText: /Data tambahan agunan/i }).first();
    await expect(tabDataTambahan).toBeVisible({ timeout: 15000 });
    await tabDataTambahan.click();
    await page.waitForTimeout(1500);

    return tabDataTambahan;
  }

  // Helper tutup modal secara aman dengan Escape atau tombol Batal/Kembali
  async function closeModalSafely(page: Page) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali")').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press('Escape');
    }
  }

  test('TC-4889-49: Sifat agunan Housing - Opsi Eligible / Non Eligible', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-49: Sifat agunan Housing');
    await navigateToStep2(page, 'Tanah');

    // 1. Kondisi BEFORE: Cari dropdown Sifat agunan jaminan
    const sifatCombobox = page.locator('[role="combobox"]').filter({ hasText: /sifat agunan jaminan/i }).first();
    await expect(sifatCombobox).toBeVisible({ timeout: 15000 });

    // Highlight Before
    await sifatCombobox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-49: BEFORE - Dropdown Sifat Agunan Housing Ditutup', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // 2. Kondisi AFTER: Buka dropdown dan verifikasi opsi
    await sifatCombobox.click();
    await page.waitForTimeout(800);

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await expect(listbox).toBeVisible({ timeout: 10000 });

    const rawOptions = await listbox.locator('li, [role="option"]').allInnerTexts();
    const cleanOptions = rawOptions.map(t => t.trim()).filter(t => t.length > 0);
    console.log('[TC-4889-49] Opsi Sifat Housing:', cleanOptions);

    expect(cleanOptions).toContain('Eligible');
    expect(cleanOptions).toContain('Non Eligible');

    // Highlight After
    await listbox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-49: AFTER - Opsi Dropdown Sifat Housing Tampil [Eligible, Non Eligible]', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-4889-50: Sifat agunan Vehicle - Opsi Eligible / Non Eligible', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-50: Sifat agunan Vehicle');
    await navigateToStep2(page, 'Kendaraan');

    // 1. Kondisi BEFORE: Dropdown Sifat agunan jaminan pada Kendaraan
    const sifatCombobox = page.locator('[role="combobox"]').filter({ hasText: /sifat agunan jaminan/i }).first();
    await expect(sifatCombobox).toBeVisible({ timeout: 15000 });

    await sifatCombobox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-50: BEFORE - Dropdown Sifat Agunan Vehicle Ditutup', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // 2. Kondisi AFTER: Buka dropdown dan verifikasi opsi
    await sifatCombobox.click();
    await page.waitForTimeout(800);

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await expect(listbox).toBeVisible({ timeout: 10000 });

    const rawOptions = await listbox.locator('li, [role="option"]').allInnerTexts();
    const cleanOptions = rawOptions.map(t => t.trim()).filter(t => t.length > 0);
    console.log('[TC-4889-50] Opsi Sifat Vehicle:', cleanOptions);

    expect(cleanOptions).toContain('Eligible');
    expect(cleanOptions).toContain('Non Eligible');

    await listbox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-50: AFTER - Opsi Dropdown Sifat Vehicle Tampil [Eligible, Non Eligible]', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-4889-51: Sifat agunan Cash - Opsi Eligible / Non Eligible', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-51: Sifat agunan Cash');
    await navigateToStep2(page, 'F11 - Deposito');

    // 1. Kondisi BEFORE: Dropdown Sifat agunan jaminan pada Cash (F11 Deposito)
    const sifatCombobox = page.locator('[role="combobox"]').filter({ hasText: /sifat agunan jaminan/i }).first();
    await expect(sifatCombobox).toBeVisible({ timeout: 15000 });

    await sifatCombobox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-51: BEFORE - Dropdown Sifat Agunan Cash Ditutup', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // 2. Kondisi AFTER: Buka dropdown dan verifikasi opsi
    await sifatCombobox.click();
    await page.waitForTimeout(800);

    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await expect(listbox).toBeVisible({ timeout: 10000 });

    const rawOptions = await listbox.locator('li, [role="option"]').allInnerTexts();
    const cleanOptions = rawOptions.map(t => t.trim()).filter(t => t.length > 0);
    console.log('[TC-4889-51] Opsi Sifat Cash:', cleanOptions);

    expect(cleanOptions).toContain('Eligible');
    expect(cleanOptions).toContain('Non Eligible');

    await listbox.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-4889-51: AFTER - Opsi Dropdown Sifat Cash Tampil [Eligible, Non Eligible]', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-4889-52: Cash F09/F10/F11/F15: Field Informasi Cash Collateral & Pertanyaan Bank Sinarmas', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-52: Cash F09/F10/F11/F15 field informasi');
    await navigateToStep2(page, 'F11 - Deposito');

    // Verifikasi field Bukti pemilikan* mandatory dan section Informasi cash collateral
    const labelBukti = page.locator('label, div > span').filter({ hasText: /^Bukti pemilikan/i }).first();
    await expect(labelBukti).toBeVisible({ timeout: 15000 });
    const textBukti = await labelBukti.innerText();
    expect(textBukti).toContain('*');

    // Verifikasi pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?*"
    const radiogroupBankSinarmas = page.locator('[role="radiogroup"]').first();
    await expect(radiogroupBankSinarmas).toBeVisible({ timeout: 15000 });

    const radioYa = radiogroupBankSinarmas.locator('div, span, label').filter({ hasText: /^Ya$/i }).first();
    const radioTidak = radiogroupBankSinarmas.locator('div, span, label').filter({ hasText: /^Tidak$/i }).first();
    await expect(radioYa).toBeVisible({ timeout: 10000 });
    await expect(radioTidak).toBeVisible({ timeout: 10000 });

    // Highlight Bukti pemilikan & Radio Group
    await labelBukti.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await radiogroupBankSinarmas.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await testInfo.attach('Eviden TC-4889-52: Section Informasi Cash Collateral (Bukti Pemilikan* & Radio Bank Sinarmas Tampil)', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-4889-53: Cash selain F09/F10/F11/F15: Pertanyaan Bank Sinarmas Tidak Tampil', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-4889-53: Cash selain F09/F10/F11/F15 (mis. F041401 - Reksadana)');
    // F041401 - Reksadana adalah cash collateral non F09/F10/F11/F15
    await navigateToStep2(page, 'F041401 - Reksadana');

    // Bukti pemilikan* tetap tampil
    const labelBukti = page.locator('label, div > span').filter({ hasText: /^Bukti pemilikan/i }).first();
    await expect(labelBukti).toBeVisible({ timeout: 15000 });

    // Pertanyaan Apakah agunan tersimpan di Bank Sinarmas? TIDAK tampil
    const radiogroupBankSinarmas = page.locator('[role="radiogroup"]').filter({ hasText: /Apakah agunan tersimpan di Bank Sinarmas/i });
    const isRadiogroupVisible = await radiogroupBankSinarmas.isVisible().catch(() => false);
    console.log('[TC-4889-53] Radiogroup Bank Sinarmas visible pada Reksadana:', isRadiogroupVisible);
    expect(isRadiogroupVisible).toBeFalsy();

    // Highlight Bukti Pemilikan
    await labelBukti.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });

    await testInfo.attach('Eviden TC-4889-53: Cash Non F09-F15 (Hanya Bukti Pemilikan, Radio Bank Sinarmas Tidak Tampil)', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-5445-01 & TC-5445-02: CIF Default State & Tombol Cek Aktif Saat Diisi Angka', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5445-01 & TC-5445-02: CIF Default State & Filled State');
    await navigateToStep2(page, 'F11 - Deposito');

    const radiogroup = page.locator('[role="radiogroup"]').first();
    const radioYa = radiogroup.locator('div, span, label').filter({ hasText: /^Ya$/i }).first();
    await page.locator('input[name="isCollateralStoredAtBsim"][value="true"]').check({ force: true });
    await page.waitForTimeout(800);

    // TC-5445-01: Cek field CIF default state
    const cifInput = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await expect(cifInput).toBeVisible({ timeout: 15000 });
    const placeholder = await cifInput.getAttribute('placeholder');
    const initialVal = await cifInput.inputValue();
    console.log('[TC-5445-01] CIF Placeholder:', placeholder, 'Value:', initialVal);
    expect(placeholder).toMatch(/masukkan cif/i);
    expect(initialVal).toBe('');

    const btnCek = page.locator('button').filter({ hasText: /^Cek$/i }).first();
    await expect(btnCek).toBeVisible({ timeout: 10000 });
    expect(await btnCek.isEnabled()).toBeFalsy();

    // Highlight BEFORE (TC-5445-01: CIF kosong & Tombol Cek Disabled)
    await cifInput.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await btnCek.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-5445-01: BEFORE - CIF Kosong & Tombol Cek Disabled', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // TC-5445-02: Isi angka pada field CIF (mis. 11111111) -> Tombol Cek aktif
    await cifInput.fill('11111111');
    await page.waitForTimeout(500);

    expect(await btnCek.isEnabled()).toBeTruthy();

    // Highlight AFTER (TC-5445-02: CIF Terisi & Tombol Cek Aktif)
    await btnCek.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-5445-02: AFTER - CIF Terisi Angka & Tombol Cek Aktif (Biru)', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  test('TC-5445-08: Agunan Tidak Tersimpan di Bank Sinarmas - Field CIF Hilang & Muncul Instansi Penerbit*', async ({ page }, testInfo) => {
    console.log('Menjalankan TC-5445-08: Agunan Tidak Tersimpan di Bank Sinarmas (Opsi "Tidak")');
    await navigateToStep2(page, 'F11 - Deposito');

    const radiogroup = page.locator('[role="radiogroup"]').first();
    const radioYa = radiogroup.locator('div, span, label').filter({ hasText: /^Ya$/i }).first();
    const radioTidak = radiogroup.locator('div, span, label').filter({ hasText: /^Tidak$/i }).first();

    // 1. Kondisi BEFORE: Saat opsi Ya aktif (Field CIF tampil)
    await page.locator('input[name="isCollateralStoredAtBsim"][value="true"]').check({ force: true });
    await page.waitForTimeout(800);
    const cifInputBefore = page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
    await expect(cifInputBefore).toBeVisible({ timeout: 10000 });

    await radioYa.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await cifInputBefore.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-5445-08: BEFORE - Opsi Ya Aktif & Field CIF Tampil', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    // 2. Kondisi AFTER: Pilih radio "Tidak"
    await page.locator('input[name="isCollateralStoredAtBsim"][value="false"]').check({ force: true });
    await page.waitForTimeout(1000);

    // Verifikasi field CIF hilang
    const isCifVisibleAfter = await page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first().isVisible().catch(() => false);
    console.log('[TC-5445-08] CIF visible setelah pilih Tidak:', isCifVisibleAfter);
    expect(isCifVisibleAfter).toBeFalsy();

    // Verifikasi field manual "Instansi penerbit*" mandatory muncul
    const labelInstansi = page.locator('label, div > span').filter({ hasText: /^Instansi penerbit/i }).first();
    await expect(labelInstansi).toBeVisible({ timeout: 15000 });
    const textInstansi = await labelInstansi.innerText();
    expect(textInstansi).toContain('*');

    // Highlight AFTER: Radio Tidak & Label Instansi Penerbit*
    await radioTidak.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await labelInstansi.evaluate((el) => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
    await testInfo.attach('Eviden TC-5445-08: AFTER - Opsi Tidak Aktif, Field CIF Hilang & Muncul Instansi Penerbit*', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png'
    });

    await closeModalSafely(page);
  });

  // --- TC-5445-04..07: inquiry CIF. Pakai F15 (CIF_VALID_1/2 punya rekening di F09/F15, tidak di F10/F11) ---
  const CIF_1 = process.env.CIF_VALID_1!;
  const CIF_2 = process.env.CIF_VALID_2!;
  const CIF_INVALID = '99999999';
  const CIF_URL = '**/lossvc/v1/cif**';
  const cifInputLoc = (page: Page) => page.locator('input[placeholder*="CIF" i], input[name*="cif" i]').first();
  const toastLoc = (page: Page) => page.getByText(/kesalahan konektivitas|Gagal memilih rekening/i).first();

  async function cekCif(page: Page, cif: string) {
    await cifInputLoc(page).fill(cif);
    await page.locator('button').filter({ hasText: /^Cek$/i }).first().click();
  }

  async function openCashYa(page: Page) {
    await navigateToStep2(page, 'F15 - Setoran Jaminan');
    await page.locator('input[name="isCollateralStoredAtBsim"][value="true"]').check({ force: true });
    await page.waitForTimeout(800);
  }

  // Screenshot eviden selalu dibuat. Kotak merah HANYA bila ada defect (defect=true, yaitu assert gagal)
  async function evidence(page: Page, testInfo: any, title: string, targets: Locator[], defect = false, scrollTo?: Locator) {
    await page.setViewportSize({ width: 1600, height: 1000 }); // layar lebih lebar agar modal tidak terpotong
    await page.waitForTimeout(600);
    const vis: Locator[] = [];
    for (const t of targets) if (await t.first().isVisible().catch(() => false)) vis.push(t.first());
    // scroll ke elemen terakhir yang bukan toast (toast fixed) agar hasil Cek ikut terlihat
    const scrollTarget = vis.filter((_, i) => i < vis.length).slice(-1)[0];
    if (defect) for (const t of vis) await t.evaluate((el: HTMLElement) => { el.style.outline = '3px solid red'; el.style.outlineOffset = '2px'; }).catch(() => {});
    const st = scrollTo && (await scrollTo.first().isVisible().catch(() => false)) ? scrollTo.first() : scrollTarget;
    if (st) await st.evaluate((el: HTMLElement) => el.scrollIntoView({ block: 'center' })).catch(() => {});
    await page.waitForTimeout(500);
    // Screenshot Playwright tidak memuat address bar browser -> tampilkan URL sebagai banner overlay
    await page.evaluate(([u, t]) => {
      const d = document.createElement('div');
      d.id = '__evidence_url';
      d.textContent = 'URL: ' + u + '   |   ' + t;
      d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#111;color:#fff;font:12px monospace;padding:6px 10px;word-break:break-all';
      document.body.appendChild(d);
    }, [page.url(), new Date().toLocaleString('id-ID')]);
    const body = await page.screenshot({ fullPage: false });
    await page.evaluate(() => document.getElementById('__evidence_url')?.remove());
    await testInfo.attach(title, { body, contentType: 'image/png' });
    const fs = await import('fs');
    fs.mkdirSync('tests/bucketAgunan/S2CML-5445/eviden', { recursive: true });
    fs.writeFileSync('tests/bucketAgunan/S2CML-5445/eviden/' + title.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 80) + '.png', body);
  }

  test('TC-5445-03: Indikator Loading pada Tombol Cek saat Inquiry Berjalan', async ({ page }, testInfo) => {
    // Respons inquiry ditahan 5 detik (delay) agar state loading sempat teramati
    await page.route(CIF_URL, async (r) => { await new Promise((res) => setTimeout(res, 5000)); await r.continue(); });
    await openCashYa(page);
    const btn = page.locator('button').filter({ hasText: /Cek/i }).first();
    const before = await btn.innerHTML();
    await cifInputLoc(page).fill(CIF_1 || CIF_INVALID);
    await btn.click();
    await page.waitForTimeout(1500);
    const during = await page.locator('button').filter({ hasText: /Cek/i }).first().innerHTML().catch(() => '');
    const loader = await page.locator('button [class*="loader" i], button [class*="spin" i], button[data-loading], button[aria-busy="true"], button:disabled svg').count();
    console.log('[TC-5445-03] loader elemen:', loader, '| html berubah:', before !== during);
    let ok = false;
    try {
      expect(loader > 0 || before !== during, 'Spinner/indikator loading tidak teramati pada tombol Cek').toBeTruthy();
      ok = true;
    } finally {
      await evidence(page, testInfo, 'Eviden TC-5445-03: tombol Cek saat proses inquiry (respons ditahan 5 detik)', [btn], !ok, cifInputLoc(page));
    }
    await closeModalSafely(page);
  });

  test('TC-5445-04: CIF Ditemukan -> Dropdown Rekening Cash Collateral', { annotation: {type: 'defect',description: 'DEFECT-5445-02 (docs/LAPORAN_DEFECT_S2CML-5445_CASH_COLLATERAL_CIF.md)'} }, async ({ page }, testInfo) => {
    test.skip(!CIF_1, 'CIF_VALID_1 belum di .env');
    await openCashYa(page);
    await cekCif(page, CIF_1);
    const found = page.getByText(/^CIF ditemukan$/i);
    const ubah = page.locator('button').filter({ hasText: /^Ubah$/i }).first();
    const rek = page.getByText(/Rekening cash collateral/i).first();
    let ok = false;
    try {
      await expect(found).toBeVisible({ timeout: 30000 });
      await expect(ubah).toBeVisible();
      await expect(rek).toBeVisible();
      ok = true;
    } finally {
      await evidence(page, testInfo, 'Eviden TC-5445-04: CIF ditemukan, tombol Ubah, dropdown Rekening cash collateral', [cifInputLoc(page), found, ubah, rek, toastLoc(page)], !ok);
    }
    await closeModalSafely(page);
  });

  test('TC-5445-05: CIF Tidak Ditemukan -> Silang Merah', { annotation: {type: 'defect',description: 'DEFECT-5445-01 (docs/LAPORAN_DEFECT_S2CML-5445_CASH_COLLATERAL_CIF.md)'} }, async ({ page }, testInfo) => {
    await openCashYa(page);
    await cekCif(page, CIF_INVALID);
    const notFound = page.getByText(/CIF tidak ditemukan/i);
    let ok = false;
    try {
      await expect(notFound).toBeVisible({ timeout: 30000 });
      // AC S2CML-5445: "Jika Gagal akan muncul notif CIF gagal ditemukan". Toast "kesalahan konektivitas" tidak diharapkan
      // (service membalas 400, bukan gangguan koneksi) -> dugaan defect bila muncul. Toast hilang sendiri +-12 detik.
      await expect(toastLoc(page), 'Dugaan defect: toast konektivitas muncul untuk CIF tidak valid (service 400)').toHaveCount(0);
      ok = true;
    } finally {
      await evidence(page, testInfo, 'Eviden TC-5445-05: CIF tidak ditemukan disertai toast konektivitas (dugaan defect)', [toastLoc(page), notFound], !ok, cifInputLoc(page));
    }
    await closeModalSafely(page);
  });

  test('TC-5445-06: Service Inquiry Gagal -> Pesan Kegagalan', async ({ page }, testInfo) => {
    await page.route(CIF_URL, (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"errorMessage":"simulated failure"}' }));
    await openCashYa(page);
    const resp = page.waitForResponse((r) => /\/lossvc\/v1\/cif\?/.test(r.url()), { timeout: 30000 });
    await cekCif(page, CIF_1 || CIF_INVALID);
    expect((await resp).status()).toBe(500); // simulasi benar-benar kena
    const msg = page.getByText(/gagal|kesalahan|coba lagi/i).first();
    let ok = false;
    try {
      await expect(msg).toBeVisible({ timeout: 15000 });
      ok = true;
    } finally {
      await evidence(page, testInfo, 'Eviden TC-5445-06: service inquiry 500 (simulasi) -> pesan kegagalan', [cifInputLoc(page), toastLoc(page), msg], !ok);
    }
    await closeModalSafely(page);
  });

  test('TC-5445-07: Ubah CIF -> Inquiry Ulang', async ({ page }, testInfo) => {
    test.skip(!CIF_1 || !CIF_2, 'CIF_VALID_1/2 belum di .env');
    await openCashYa(page);
    await cekCif(page, CIF_1);
    await expect(page.getByText(/^CIF ditemukan$/i)).toBeVisible({ timeout: 30000 });
    const ubah = page.locator('button').filter({ hasText: /^Ubah$/i }).first();
    await ubah.click();
    const dlg = page.getByText(/Ubah CIF\?/);
    await expect(dlg).toBeVisible({ timeout: 10000 });
    await evidence(page, testInfo, 'Eviden TC-5445-07 (langkah 1): dialog konfirmasi Ubah CIF', [dlg, page.locator('button').filter({ hasText: /Lanjutkan Edit/i })]);
    await page.locator('button').filter({ hasText: /Lanjutkan Edit/i }).click();
    const req = page.waitForRequest((r) => r.url().includes('/lossvc/v1/cif') && r.url().includes(CIF_2), { timeout: 30000 });
    await cekCif(page, CIF_2);
    let ok = false;
    try {
      await req;
      await expect(page.getByText(/^CIF ditemukan$/i)).toBeVisible({ timeout: 30000 });
      ok = true;
    } finally {
      await evidence(page, testInfo, 'Eviden TC-5445-07: setelah Ubah, inquiry ulang dengan CIF baru', [cifInputLoc(page), page.getByText(/^CIF ditemukan$/i), toastLoc(page)], !ok);
    }
    await closeModalSafely(page);
  });

  test('TC-5445-09..12: Section Informasi Cash Collateral (F11 tampil, mandatory, radio; Reksadana tanpa pertanyaan)', async ({ page }, testInfo) => {
    await navigateToStep2(page, 'F11 - Deposito');
    await expect(page.getByText(/Informasi cash collateral/i).first()).toBeVisible({ timeout: 15000 }); // 09
    const q = page.locator('[role="radiogroup"]').first();
    const label = page.getByText(/Apakah agunan tersimpan di Bank Sinarmas/i).first();
    await expect(label).toBeVisible();
    expect(await label.locator('xpath=ancestor::*[self::div][1]').innerText()).toContain('*'); // 10
    await expect(q.locator('input[type="radio"]')).toHaveCount(2); // 11
    await expect(q.getByText(/^Ya$/)).toBeVisible();
    await expect(q.getByText(/^Tidak$/)).toBeVisible();
    await testInfo.attach('Eviden TC-5445-09..11', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await closeModalSafely(page);
  });

  test('TC-5445-12: Reksadana tanpa pertanyaan Bank Sinarmas', async ({ page }, testInfo) => {
    await navigateToStep2(page, 'F041401 - Reksadana');
    await expect(page.getByText(/Bukti pemilikan/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Apakah agunan tersimpan di Bank Sinarmas/i)).toHaveCount(0);
    await testInfo.attach('Eviden TC-5445-12', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await closeModalSafely(page);
  });

  test('TC-5445-13 & 14: Nominal disabled & Periode deposito F11', async () => {
    test.skip(true, 'Butuh pilih rekening deposito via inquiry CIF; FE CIF belum deploy.');
  });
});
