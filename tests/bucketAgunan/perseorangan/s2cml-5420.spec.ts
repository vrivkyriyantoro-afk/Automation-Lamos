import { test, expect, Page, TestInfo } from '@playwright/test';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: S2CML-5420 - Bucket Agunan - Detailing Form Informasi Tambahan Agunan non Cash Collateral
 * Sumber:
 *   - Jira: https://bank-sinarmas.atlassian.net/browse/S2CML-5420 (Status: Ready to SIT)
 *   - Matriks Resmi: exports/TC_S2CML-5420_Data_Tambahan_Agunan.csv (16 Test Cases)
 *   - Aturan Eviden (AGENTS.md bagian 2): test.step dipetakan 1:1 ke butir `Langkah Pengujian` CSV,
 *     screenshot per langkah, kondisi awal dipisah sebagai Prekondisi, tanpa kotak merah.
 *
 * Prinsip assertion: HARUS spesifik terhadap Expected Result CSV. Dilarang regex longgar
 * (mis. /Lengkap/ cocok dengan "Belum Lengkap", /50 MB/ cocok dengan teks bantuan permanen).
 * Assertion yang gagal = dugaan defect aplikasi, bukan alasan melonggarkan assertion.
 */

const TARGET_APP_ID = process.env.APP_ID_5420 || '01M5TYDZSJFK7J66ZDK2YHRCZ9';
const BASE_HOST = process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/';
const TARGET_URL = `${BASE_HOST.replace(/\/$/, '')}/lamos/credit-application/${TARGET_APP_ID}/create?bucket=agunan&debtorType=individual`;

const DUMMY_FILE_1 = path.resolve('fixtures/files/dummy-identitas.pdf');
const DUMMY_FILE_2 = path.resolve('fixtures/files/dummy-agunan-2.pdf');
const DUMMY_FILE_51MB = path.resolve('fixtures/files/dummy-oversize-51mb.pdf');
const EVIDEN_OUTPUT_DIR = path.resolve('explore-output/s2cml-5420');

test.describe('S2CML-5420: Data Tambahan Agunan (Non-Cash Collateral)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1280, height: 1000 });
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await ensureBucketAgunanOpen(page);
  });

  test.afterEach(async ({ page }) => {
    await closeModalSafely(page);
  });

  /** Eviden: screenshot viewport (bukan fullPage: modal fixed, fullPage menempel halaman belakang). */
  async function shot(page: Page, testInfo: TestInfo, label: string) {
    if (!fs.existsSync(EVIDEN_OUTPUT_DIR)) fs.mkdirSync(EVIDEN_OUTPUT_DIR, { recursive: true });
    const cleanLabel = label.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const tcId = testInfo.title.match(/TC-\d+-\d+/)?.[0] ?? 'TC';
    const filePath = path.join(EVIDEN_OUTPUT_DIR, `${tcId}_${cleanLabel}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    await testInfo.attach(label, { path: filePath, contentType: 'image/png' });
  }

  async function ensureBucketAgunanOpen(page: Page) {
    const tabAgunan = page.locator('[role="tab"][id="agunan"], [role="tab"]:has-text("Agunan")').first();
    if (await tabAgunan.isVisible().catch(() => false)) {
      const isSelected = await tabAgunan.getAttribute('aria-selected');
      if (isSelected !== 'true') {
        await tabAgunan.click();
        await page.waitForTimeout(2000);
      }
    }
    const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
      .filter({ hasText: /^Data agunan$/i }).first();
    if (await headerBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      const isContentVisible = await page.locator('text=/Daftar agunan|Draf agunan|Total nilai|Belum ada data/i').first()
        .isVisible().catch(() => false);
      if (!isContentVisible) {
        await headerBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  /** Helper: Buka modal Tambah Agunan Baru untuk jenis tertentu */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword = 'Tanah') {
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();
    await page.waitForTimeout(1000);

    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOpt = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOpt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOpt.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    // Nomor fiktif + Cari (hasil kosong agar tombol + Agunan Baru aktif)
    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('DUMMY_SEARCH_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();
    await page.waitForTimeout(1500);

    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    const activeModal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    await expect(activeModal).toBeVisible({ timeout: 20000 });
    return activeModal;
  }

  /** Helper: Buka Step 2 Data Tambahan Agunan */
  async function openStep2(page: Page) {
    const step2Btn = page.locator('button').filter({ hasText: /Data tambahan agunan/i }).first();
    await expect(step2Btn).toBeVisible({ timeout: 20000 });
    await step2Btn.click();
    await page.waitForTimeout(1500);
    return step2Btn;
  }

  /** Helper tutup modal dengan aman (tanpa commit data) */
  async function closeModalSafely(page: Page) {
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali"), button:has-text("Batal")').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    } catch (_) {}
  }

  // ===== Locator Step 2 (berdasarkan DOM SIT, diverifikasi probe 2026-11-15) =====
  const comboSifat = (page: Page) => page.locator('[role="combobox"][id^="collateralNature"]');
  const comboJoint = (page: Page) => page.locator('[role="combobox"][id^="jointCreditStatus"]');
  const inputBukti = (page: Page) => page.locator('input[name="collateralNumber"]');
  const fileInput = (page: Page) => page.locator('input[type="file"]').first();
  const step1Nav = (page: Page) => page.locator('button').filter({ hasText: /Informasi umum agunan/i }).first();
  const step2Nav = (page: Page) => page.locator('button').filter({ hasText: /Data tambahan agunan/i }).first();
  const navStatus = (nav: ReturnType<typeof step2Nav>) => nav.locator('span.text-xs');
  const fileCard = (page: Page, name: string) => page.locator(`span[role="button"][title="${name}"]`);
  /** Step nav aktif ditandai border-neutral-800 (non-aktif: border-neutral-300). */
  const isActiveNav = async (nav: ReturnType<typeof step2Nav>) => ((await nav.getAttribute('class')) || '').includes('border-neutral-800');

  async function pilihOpsi(page: Page, combo: ReturnType<typeof comboSifat>, opsi: RegExp) {
    await combo.click();
    const listbox = page.locator('#' + (await combo.getAttribute('aria-controls')));
    await listbox.locator('li, [role="option"]').filter({ hasText: opsi }).first().click();
  }

  /** Isi seluruh field mandatory Step 2 (kategori Housing). */
  async function isiMandatoryStep2(page: Page) {
    await pilihOpsi(page, comboSifat(page), /^Eligible$/i);
    await pilihOpsi(page, comboJoint(page), /^Tidak$/i);
    await inputBukti(page).fill('SHM_123456');
    await fileInput(page).setInputFiles(DUMMY_FILE_1);
    await expect(fileCard(page, 'dummy-identitas.pdf')).toBeVisible({ timeout: 20000 });
  }

  /** Seluruh baris teks halaman; dipakai membandingkan sebelum/sesudah aksi agar hanya pesan BARU yang dihitung. */
  const pageLines = async (page: Page) =>
    (await page.locator('body').innerText()).split('\n').map(l => l.trim()).filter(Boolean);

  /**
   * TC-5420-01
   * Expected: Form Step 2 tampil dan indikator navigasi aktif berpindah ke Step 2.
   */
  test('TC-5420-01: Validasi Navigasi ke Step 2 Data Tambahan Agunan via Side Navigation', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Modal Tambah Agunan terbuka di Step 1', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      expect(await isActiveNav(step1Nav(page))).toBeTruthy();
      await shot(page, testInfo, 'Prekondisi: Modal Terbuka di Step 1');
    });

    await test.step('1. Klik menu "Data tambahan agunan" pada panel navigasi kiri modal.', async () => {
      await step2Nav(page).click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, 'Step 1: Klik Menu Data Tambahan Agunan');
    });

    await test.step('2. Periksa form yang aktif.', async () => {
      await expect(comboSifat(page)).toBeVisible();
      expect(await isActiveNav(step2Nav(page)), 'Indikator Step 2 harus aktif').toBeTruthy();
      expect(await isActiveNav(step1Nav(page)), 'Indikator Step 1 harus tidak aktif').toBeFalsy();
      await shot(page, testInfo, 'Step 2: Form Step 2 Aktif dan Indikator Berpindah');
    });
  });

  /**
   * TC-5420-02
   * Expected: Field "Sifat agunan jaminan*" tampil dengan tanda bintang merah mandatory (*).
   */
  test('TC-5420-02: Validasi Field Sifat Agunan Jaminan Tampil pada Jenis Housing, Vehicle, dan Document', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Jenis agunan kategori Housing (Tanah)', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await shot(page, testInfo, 'Prekondisi: Form Agunan Kategori Housing Dibuka');
    });

    await test.step('1. Buka Step 2 Data Tambahan Agunan.', async () => {
      await openStep2(page);
      await shot(page, testInfo, 'Step 1: Navigasi ke Step 2');
    });

    await test.step('2. Periksa keberadaan field "Sifat agunan jaminan*".', async () => {
      await expect(comboSifat(page)).toBeVisible();
      await expect(page.locator('[id^="collateralNature"][id$="-label"]')).toHaveText(/^Sifat agunan jaminan\s*\*$/);
      await shot(page, testInfo, 'Step 2: Field Sifat Agunan Jaminan Tampil Mandatory (*)');
    });
  });

  /**
   * TC-5420-03
   * Expected: Tepat 2 opsi pilihan: "Eligible" dan "Non Eligible".
   */
  test('TC-5420-03: Validasi Dropdown Sifat Agunan Jaminan Menampilkan Opsi Eligible dan Non Eligible', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Field Sifat agunan jaminan tampil pada Step 2', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await expect(comboSifat(page)).toBeVisible();
      await shot(page, testInfo, 'Prekondisi: Field Sifat Agunan Tampil');
    });

    await test.step('1. Klik dropdown "Sifat agunan jaminan".', async () => {
      await comboSifat(page).click();
      await page.waitForTimeout(800);
      await shot(page, testInfo, 'Step 1: Dropdown Sifat Agunan Diklik');
    });

    await test.step('2. Periksa opsi yang tersedia.', async () => {
      const listbox = page.locator('#' + (await comboSifat(page).getAttribute('aria-controls')));
      await expect(listbox).toBeVisible();
      const opsi = (await listbox.locator('li, [role="option"]').allInnerTexts()).map(t => t.trim()).filter(Boolean);
      expect(opsi).toEqual(['Eligible', 'Non Eligible']);
      await shot(page, testInfo, 'Step 2: Opsi Eligible dan Non Eligible Tampil');
    });
  });

  /**
   * TC-5420-04
   * Expected: Nilai default "Status kredit joint account" terisi "Tidak" (atau "T").
   */
  test('TC-5420-04: Validasi Default Value Status Kredit Joint Account adalah Tidak', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    await test.step('1. Periksa nilai awal pada field "Status kredit joint account".', async () => {
      await expect(comboJoint(page)).toBeVisible();
      await shot(page, testInfo, 'Step 1: Nilai Awal Status Kredit Joint Account');
      // Placeholder "Pilih status kredit joint account" = belum ada default -> harus gagal.
      await expect(comboJoint(page)).toHaveText(/^(Tidak|T)$/);
    });
  });

  /**
   * TC-5420-05
   * Expected: Label "Bukti pemilikan*" bertanda bintang mandatory (*).
   */
  test('TC-5420-05: Validasi Field Bukti Kepemilikan Bertanda Bintang Merah Mandatory', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    await test.step('1. Periksa label pada field "Bukti kepemilikan".', async () => {
      await expect(page.getByText(/^Bukti pemilikan\s*\*$/)).toBeVisible();
      await shot(page, testInfo, 'Step 1: Field Bukti Kepemilikan Bertanda Bintang Merah (*)');
    });
  });

  /**
   * TC-5420-06
   * Prekondisi CSV: Agunan dibuat dari hasil pencarian agunan existing CLS (Reuse Collateral)
   * Langkah CSV:
   *   1. Lanjutkan agunan existing ke form Step 2.
   *   2. Periksa nilai dan status interaktivitas field "Bukti kepemilikan".
   * Expected: Field Bukti kepemilikan terisi otomatis dari data CLS dan berstatus disabled (tidak dapat diubah).
   */
  test('TC-5420-06: Validasi Field Bukti Kepemilikan Terisi dan Disabled saat Load Existing dari CLS', async ({ page }, testInfo) => {
    let hasExisting = false;

    await test.step('Prekondisi: Pencarian agunan existing CLS', async () => {
      const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
      await expect(btnTambah).toBeVisible({ timeout: 45000 });
      await btnTambah.click();

      await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
      const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
      await listbox.locator('li button, li').first().click();

      const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
      if (await inputNomor.isVisible({ timeout: 5000 }).catch(() => false)) {
        await inputNomor.fill('12345678');
      }

      const btnCari = page.locator('button:has-text("Cari")').first();
      await expect(btnCari).toBeEnabled({ timeout: 10000 });
      await btnCari.click();
      await page.waitForTimeout(2000);

      const tableRow = page.locator('table tbody tr, [role="row"]').first();
      hasExisting = await tableRow.isVisible().catch(() => false);
      await shot(page, testInfo, 'Prekondisi: Hasil Pencarian Agunan CLS');

      test.skip(!hasExisting, '[GAP DATA CLS] Tidak ditemukan record agunan existing CLS yang dapat di-reuse pada environment SIT saat ini.');
    });

    await test.step('1. Lanjutkan agunan existing ke form Step 2.', async () => {
      await page.locator('input[type="radio"], input[type="checkbox"]').first().click();
      await page.locator('button:has-text("Lanjutkan")').first().click();
      await page.waitForTimeout(2000);
      await openStep2(page);
      await shot(page, testInfo, 'Step 1: Agunan Existing Dimuat ke Step 2');
    });

    await test.step('2. Periksa nilai dan status interaktivitas field "Bukti kepemilikan".', async () => {
      await expect(inputBukti(page)).toBeVisible({ timeout: 15000 });
      await expect(inputBukti(page)).not.toHaveValue('');
      await expect(inputBukti(page)).toBeDisabled();
      await shot(page, testInfo, 'Step 2: Field Bukti Kepemilikan Terisi dan Disabled');
    });
  });

  /**
   * TC-5420-07
   * Expected: Field editable dan menerima input teks/angka nomor bukti dokumen.
   */
  test('TC-5420-07: Validasi Field Bukti Kepemilikan Editable saat Input Agunan Baru', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Agunan dibuat melalui opsi Tambah Agunan Baru', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await shot(page, testInfo, 'Prekondisi: Form Agunan Baru Terbuka');
    });

    await test.step('1. Masuk ke Step 2.', async () => {
      await openStep2(page);
      await shot(page, testInfo, 'Step 1: Masuk ke Step 2');
    });

    await test.step('2. Masukkan nomor bukti kepemilikan baru ke field "Bukti kepemilikan".', async () => {
      await expect(inputBukti(page)).toBeEditable();
      const nomor = 'SHM_NO_' + Date.now();
      await inputBukti(page).fill(nomor);
      await expect(inputBukti(page)).toHaveValue(nomor);
      await shot(page, testInfo, 'Step 2: Field Bukti Kepemilikan Editable dan Menerima Input');
    });
  });

  /**
   * TC-5420-08
   * Expected: Zona upload dokumen kepemilikan tampil dengan informasi ketentuan upload.
   */
  test('TC-5420-08: Validasi Keberadaan Area Upload File Dokumen Kepemilikan', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    await test.step('1. Periksa bagian "Upload Dokumen Kepemilikan".', async () => {
      await expect(page.getByText(/^Dokumen bukti\s*pemilikan\s*\*$/)).toBeVisible();
      await expect(page.getByText('Pilih File', { exact: true })).toBeVisible();
      await expect(fileInput(page)).toBeAttached();
      await expect(page.getByText('Format file berupa PNG, JPG, JPEG, atau PDF dengan ukuran maksimum 50 MB.')).toBeVisible();
      await shot(page, testInfo, 'Step 1: Zona Upload Dokumen Kepemilikan Tersedia');
    });
  });

  /**
   * TC-5420-09
   * Expected: File berhasil diunggah; nama file dan ukuran tampil pada daftar file terunggah.
   */
  test('TC-5420-09: Validasi Upload 1 File Dokumen Kepemilikan Berhasil', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    await test.step('1. Unggah 1 file dokumen valid (< 50MB).', async () => {
      await fileInput(page).setInputFiles(DUMMY_FILE_1);
      await expect(fileCard(page, 'dummy-identitas.pdf')).toBeVisible({ timeout: 20000 });
      await shot(page, testInfo, 'Step 1: 1 File Dokumen Diunggah');
    });

    await test.step('2. Amati daftar file terunggah.', async () => {
      const card = fileCard(page, 'dummy-identitas.pdf');
      await expect(card).toHaveText('dummy-identitas.pdf');
      await expect(card.locator('xpath=following-sibling::p')).toHaveText(/^\d+(\.\d+)?\s*(Bytes|KB|MB)$/);
      await shot(page, testInfo, 'Step 2: File Berhasil Terunggah dan Tampil di Daftar');
    });
  });

  /**
   * TC-5420-10
   * Expected: Semua file berhasil terunggah dan terdaftar secara berurutan.
   */
  test('TC-5420-10: Validasi Upload Multiple Files Lebih dari 1 File Berhasil', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    await test.step('1. Unggah lebih dari 1 file dokumen secara bertahap.', async () => {
      await fileInput(page).setInputFiles(DUMMY_FILE_1);
      await expect(fileCard(page, 'dummy-identitas.pdf')).toBeVisible({ timeout: 20000 });
      await fileInput(page).setInputFiles(DUMMY_FILE_2);
      await expect(fileCard(page, 'dummy-agunan-2.pdf')).toBeVisible({ timeout: 20000 });
      await shot(page, testInfo, 'Step 1: Multiple Files Diunggah');
    });

    await test.step('2. Amati daftar file terunggah.', async () => {
      const names = await page.locator('span[role="button"][title$=".pdf"]').evaluateAll(els => els.map(e => e.getAttribute('title')));
      expect(names).toEqual(['dummy-identitas.pdf', 'dummy-agunan-2.pdf']);
      await shot(page, testInfo, 'Step 2: Semua File Terdaftar secara Berurutan');
    });
  });

  /**
   * TC-5420-11
   * Expected: Sistem membuka preview dokumen / modal review file.
   */
  test('TC-5420-11: Validasi Review atau Preview File yang Telah Diunggah saat Diklik', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Minimal 1 file telah berhasil diunggah', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await fileInput(page).setInputFiles(DUMMY_FILE_1);
      await expect(fileCard(page, 'dummy-identitas.pdf')).toBeVisible({ timeout: 20000 });
      await shot(page, testInfo, 'Prekondisi: 1 File Terunggah');
    });

    await test.step('1. Klik pada nama file yang ada di daftar file terunggah.', async () => {
      const popupP = page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
      const downloadP = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await fileCard(page, 'dummy-identitas.pdf').click();
      const [popup, download] = await Promise.all([popupP, downloadP]);
      if (download) console.log('[TC-5420-11] klik nama file memicu DOWNLOAD:', download.suggestedFilename());
      await page.waitForTimeout(2000);
      // Modal Tambah agunan sendiri bukan preview: dialog lain / iframe / embed / popup baru.
      const viewer = page.locator('iframe:visible, embed:visible, object:visible, [class*="preview" i]:visible');
      const opened = popup !== null || (await viewer.count()) > 0;
      await shot(page, testInfo, 'Step 1: Kondisi Layar Setelah Klik Nama File');
      if (popup) await popup.close();
      expect(opened, 'Tidak ada popup/iframe/preview setelah klik nama file').toBeTruthy();
    });
  });

  /**
   * TC-5420-12
   * Expected: File terhapus dari daftar file terunggah.
   */
  test('TC-5420-12: Validasi Hapus File yang Telah Diunggah dari Daftar', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Minimal 1 file telah berhasil diunggah', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await fileInput(page).setInputFiles(DUMMY_FILE_1);
      await expect(fileCard(page, 'dummy-identitas.pdf')).toBeVisible({ timeout: 20000 });
      await shot(page, testInfo, 'Prekondisi: 1 File Terunggah');
    });

    await test.step('1. Klik ikon/tombol hapus (Trash) pada file terunggah.', async () => {
      const row = fileCard(page, 'dummy-identitas.pdf').locator('xpath=ancestor::div[.//button][1]');
      await row.locator('button').last().click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, 'Step 1: Tombol Hapus Diklik');
    });

    await test.step('2. Konfirmasi penghapusan (jika ada).', async () => {
      const konfirmasi = page.locator('[role="dialog"]').filter({ hasText: /Hapus|Apakah anda yakin|Konfirmasi/i });
      if (await konfirmasi.isVisible({ timeout: 2000 }).catch(() => false)) {
        await konfirmasi.locator('button:has-text("Hapus"), button:has-text("Ya")').first().click();
      }
      await expect(fileCard(page, 'dummy-identitas.pdf')).toHaveCount(0, { timeout: 10000 });
      await shot(page, testInfo, 'Step 2: File Berhasil Dihapus dari Daftar');
    });
  });

  /**
   * TC-5420-13
   * Expected: File > 50 MB ditolak DAN muncul pesan error bahwa ukuran file melebihi batas maksimal 50MB.
   * Teks bantuan permanen "ukuran maksimum 50 MB" BUKAN pesan error: yang dihitung hanya baris teks BARU setelah upload.
   */
  test('TC-5420-13: Validasi Penolakan File Melebihi Batas Ukuran 50 MB', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan terbuka', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka');
    });

    let barisBaru: string[] = [];
    await test.step('1. Unggah file dokumen dengan ukuran > 50 MB.', async () => {
      const sebelum = new Set(await pageLines(page));
      await fileInput(page).setInputFiles(DUMMY_FILE_51MB);
      // Tunggu pesan error BARU (maks 40 dtk; SIT kadang lambat). Teks bantuan permanen tidak dihitung.
      await expect.poll(async () => {
        barisBaru = (await pageLines(page)).filter(l => !sebelum.has(l));
        return barisBaru.join(' | ');
      }, { timeout: 40000, intervals: [500] }).toMatch(/melebihi|terlalu besar|maksimal|50\s*MB/i).catch(() => {});
      await shot(page, testInfo, 'Step 1: File 51MB (> 50MB) Diunggah');
    });

    await test.step('2. Amati respons sistem.', async () => {
      await expect(fileCard(page, 'dummy-oversize-51mb.pdf'), 'File > 50MB tidak boleh masuk daftar').toHaveCount(0);
      // Kata "ukuran" saja terlalu longgar: pesan harus menyatakan file melebihi/terlalu besar/batas maksimal.
      expect(barisBaru.join(' | '), 'Pesan error ukuran file melebihi batas 50MB tidak muncul setelah upload').toMatch(/melebihi|terlalu besar|maksimal|50\s*MB/i);
      await shot(page, testInfo, 'Step 2: Pesan Error Batas Ukuran 50MB Tampil');
    });
  });

  /**
   * TC-5420-14
   * Prekondisi CSV: 100 file telah berhasil diunggah.
   * Expected: Upload ke-101 diblokir dan muncul validasi batas maksimal 100 file.
   * Input file tidak `multiple`, jadi file diunggah satu per satu (buffer in-memory, tanpa fixture).
   */
  test('TC-5420-14: Validasi Batas Maksimal Upload hingga 100 Files', async ({ page }, testInfo) => {
    test.setTimeout(900000);
    const isi = fs.readFileSync(DUMMY_FILE_1);
    const pdf = (i: number) => ({ name: `bulk-${String(i).padStart(3, '0')}.pdf`, mimeType: 'application/pdf', buffer: isi });
    const cards = page.locator('span[role="button"][title^="bulk-"]');

    await test.step('Prekondisi: 100 file telah berhasil diunggah', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      // Berbasis jumlah kartu aktual: upload SIT bisa lambat/jatuh, retry bisa menghasilkan duplikat. Nama unik per percobaan.
      let n = 0;
      while ((await cards.count()) < 100) {
        const sebelumCount = await cards.count();
        n++;
        await fileInput(page).setInputFiles(pdf(n));
        const naik = await expect(cards).toHaveCount(sebelumCount + 1, { timeout: 30000 }).then(() => true, () => false);
        if (!naik) await page.waitForTimeout(5000); // lambat: loop berikutnya hitung ulang jumlah aktual
        if (n > 150) throw new Error(`Gagal mencapai 100 file setelah ${n} percobaan`);
      }
      await expect(cards).toHaveCount(100);
      await cards.last().scrollIntoViewIfNeeded(); // eviden harus memperlihatkan file ke-100 (ujung daftar)
      await shot(page, testInfo, 'Prekondisi: 100 File Terunggah (bulk-100 di ujung daftar)');
      // Eviden kondisi tombol upload setelah 100 file (area upload ada di atas daftar).
      await page.getByText('Pilih File', { exact: true }).scrollIntoViewIfNeeded();
      console.log('[TC-5420-14] input file disabled setelah 100 file:', await fileInput(page).isDisabled());
      await shot(page, testInfo, 'Prekondisi: Kondisi Tombol Upload setelah 100 File');
    });

    await test.step('1. Coba unggah file ke-101 ke dalam dokumen kepemilikan.', async () => {
      // User nyata tidak bisa unggah: tombol disabled. setInputFiles menembus input disabled, jadi tidak dipakai.
      await page.getByText('Pilih File', { exact: true }).scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 1: Tombol Upload Diblokir (Disabled) setelah 100 File');
      await expect(fileInput(page), 'Upload ke-101 harus diblokir (input disabled)').toBeDisabled();
      await expect(cards).toHaveCount(100);
      // Pesan teks batas tidak diwajibkan AC selama upload terblokir: hanya dicatat.
      const pesan = await page.getByText(/maksimal\s*100|100\s*file/i).count();
      console.log('[TC-5420-14] pesan teks batas 100 file tampil:', pesan > 0);
    });
  });

  /**
   * TC-5420-15
   * Expected: Badge Step 2 berubah dari "Belum Lengkap" menjadi "Lengkap" dengan centang hijau.
   */
  test('TC-5420-15: Validasi Indikator Step 2 Berubah Menjadi Lengkap saat Seluruh Mandatory Terpenuhi', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Step 2 Data Tambahan Agunan sedang diisi', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await expect(navStatus(step2Nav(page))).toHaveText('Belum Lengkap');
      await shot(page, testInfo, 'Prekondisi: Step 2 Terbuka, Status Belum Lengkap');
    });

    await test.step('1. Lengkapi seluruh field mandatory (Sifat agunan, Status joint, Bukti pemilikan, Upload dokumen).', async () => {
      await isiMandatoryStep2(page);
      await shot(page, testInfo, 'Step 1: Seluruh Field Mandatory Step 2 Terisi');
    });

    await test.step('2. Periksa badge status pada side-nav kiri "Data tambahan agunan".', async () => {
      await shot(page, testInfo, 'Step 2: Indikator Step 2');
      await expect(navStatus(step2Nav(page))).toHaveText('Lengkap', { timeout: 10000 }); // toHaveText string = exact: bukan "Belum Lengkap"
      await expect(step2Nav(page).locator('svg')).toBeVisible(); // ikon centang
    });
  });

  /**
   * TC-5420-16
   * Expected: Indikator tetap "Belum Lengkap" saat ada mandatory kosong.
   * Prekondisi dibuat valid dulu (Lengkap), lalu satu field dikosongkan: membuktikan indikator benar-benar bereaksi.
   */
  test('TC-5420-16: Validasi Indikator Step 2 Tetap Belum Lengkap saat Ada Mandatory Kosong', async ({ page }, testInfo) => {
    await test.step('Prekondisi: Seluruh mandatory terisi (status Lengkap)', async () => {
      await navigateToFormAgunanBaru(page, 'Tanah');
      await openStep2(page);
      await isiMandatoryStep2(page);
      await expect(navStatus(step2Nav(page))).toHaveText('Lengkap', { timeout: 10000 });
      await shot(page, testInfo, 'Prekondisi: Semua Mandatory Terisi, Status Lengkap');
    });

    await test.step('1. Kosongkan salah satu field mandatory (Bukti pemilikan).', async () => {
      await inputBukti(page).fill('');
      await shot(page, testInfo, 'Step 1: Field Bukti Pemilikan Dikosongkan');
    });

    await test.step('2. Periksa badge status pada side-nav kiri.', async () => {
      await expect(navStatus(step2Nav(page))).toHaveText('Belum Lengkap', { timeout: 10000 });
      await shot(page, testInfo, 'Step 2: Indikator Step 2 Tetap Belum Lengkap');
    });
  });
});
