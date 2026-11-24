import { test, expect, Page, TestInfo } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

/**
 * Test Suite: S2CML-6020 - [BE] LAMOS LOS SME - Bucket Agunan - Form Data Agunan > Load Latest data Agunan
 * Sumber:
 *   - Jira: https://bank-sinarmas.atlassian.net/browse/S2CML-6020 (Status: In SIT)
 *   - Matriks Resmi: exports/test-cases/TC_S2CML-6020_Load_Latest_Data_Agunan.csv (6 TC: TC-6020-01 s.d TC-6020-06)
 *   - Aturan Eviden (AGENTS.md bagian 2): test.step dipetakan 1:1 ke butir kolom `Langkah Pengujian` CSV,
 *     screenshot Full Per-Step (tiap langkah 1 eviden), kondisi awal dipisah sebagai Prekondisi,
 *     eviden langkah terakhir wajib menampilkan elemen pada `Expected Result`. Tanpa kotak merah.
 * Debitur: Perseorangan (01M6ZA0CWY9Q33Y031ZRGKFB4E)
 */

// App ID default debitur perseorangan (01M6ZA0CWY9Q33Y031ZRGKFB4E)
const TARGET_APP_ID = process.env.APP_ID_6020 || '01M6ZA0CWY9Q33Y031ZRGKFB4E';
const BASE_HOST = process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/';
const TARGET_URL = `${BASE_HOST.replace(/\/$/, '')}/lamos/credit-application/${TARGET_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-6020: Load Latest Data Agunan - Debitur Perseorangan', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1280, height: 1000 });
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  });

  /** Helper: attach eviden screenshot full page ke laporan Playwright */
  async function shot(page: Page, testInfo: TestInfo, label: string) {
    await testInfo.attach(label, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  }

  async function navigateBucket(page: Page, bucketName: string, bucketKey: string) {
    const tab = page.locator(`[role="tab"][id="${bucketKey}"], [role="tab"]:has-text("${bucketName}")`).first();
    await expect(tab).toBeVisible({ timeout: 30000 });
    await tab.click();
    await page.waitForURL(new RegExp(`bucket=${bucketKey}`), { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  }

  async function ensureDataAgunanOpen(page: Page) {
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

  /**
   * TC-6020-01
   * Prekondisi CSV: Kartu agunan berstatus DRAFT tampil di Bucket Agunan.
   * Langkah CSV:
   *   1. Pada navigasi tab bucket atas, klik bucket lain (misal: "Struktur Kredit" atau "Data Usaha")
   *   2. Tunggu hingga halaman bucket tujuan selesai termuat sempurna
   *   3. Klik kembali tab "Agunan" untuk kembali ke Bucket Agunan
   *   4. Periksa daftar kartu agunan di halaman ringkasan
   * Expected: Kartu DRAFT tetap tampil utuh, badge status tetap "Draft", counter tidak berkurang.
   */
  test('TC-6020-01: Validasi Retensi Data Agunan Berstatus DRAFT saat Navigasi ke Bucket Lain dan Kembali', async ({ page }, testInfo) => {
    const drafHeader = page.locator('text=/Draf agunan \\(\\d+\\)/i').first();
    let initialDrafText = '';
    let draftCardCountBefore = 0;

    await test.step('Prekondisi: Kartu agunan berstatus DRAFT tampil di Bucket Agunan', async () => {
      await ensureDataAgunanOpen(page);
      const hasDraft = await drafHeader.isVisible({ timeout: 5000 }).catch(() => false);
      await shot(page, testInfo, 'Prekondisi: Kartu Agunan DRAFT di Bucket Agunan');
      test.skip(!hasDraft, `[GAP PREKONDISI] Butuh kartu agunan DRAFT. App ID ${TARGET_APP_ID} memiliki 0 agunan draf.`);

      initialDrafText = await drafHeader.innerText();
      draftCardCountBefore = await page.locator('text=Masih menunggu nilai final').count();
    });

    await test.step('1. Pada navigasi tab bucket atas, klik bucket lain ("Struktur Kredit")', async () => {
      await navigateBucket(page, 'Struktur Kredit', 'struktur_kredit');
      await shot(page, testInfo, 'Step 1: Klik Tab Bucket Struktur Kredit');
    });

    await test.step('2. Tunggu hingga halaman bucket tujuan selesai termuat sempurna', async () => {
      await expect(page).toHaveURL(/bucket=struktur_kredit/);
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await shot(page, testInfo, 'Step 2: Halaman Struktur Kredit Termuat Sempurna');
    });

    await test.step('3. Klik kembali tab "Agunan" untuk kembali ke Bucket Agunan', async () => {
      await navigateBucket(page, 'Agunan', 'agunan');
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 3: Kembali ke Tab Bucket Agunan');
    });

    await test.step('4. Periksa daftar kartu agunan di halaman ringkasan', async () => {
      await expect(drafHeader).toBeVisible({ timeout: 30000 });
      expect(await drafHeader.innerText()).toBe(initialDrafText);
      expect(await page.locator('text=Masih menunggu nilai final').count()).toBe(draftCardCountBefore);

      await drafHeader.scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 4: Kartu DRAFT Utuh - Badge Draft dan Counter Tidak Berkurang');
    });
  });

  /**
   * TC-6020-02
   * Prekondisi CSV: Bucket Agunan memiliki lebih dari 1 agunan (1 Final + 1 Draft).
   * Langkah CSV:
   *   1. Catat jumlah dan nama masing-masing agunan yang ada di daftar
   *   2. Klik tab bucket "Analisa Keuangan"
   *   3. Klik kembali tab "Agunan"
   *   4. Bandingkan jumlah dan daftar kartu agunan yang tampil
   * Expected: Tidak ada kartu hilang, urutan konsisten, badge status tetap akurat.
   */
  test('TC-6020-02: Validasi Retensi Multi-Agunan (Kombinasi Draft dan Final) saat Navigasi Antar Bucket', async ({ page }, testInfo) => {
    const daftarHeader = page.locator('text=/Daftar agunan/i').first();
    const drafHeader = page.locator('text=/Draf agunan/i').first();
    let beforeDaftar = '';
    let beforeDraf: string | null = null;
    let hasDraft = false;

    await test.step('Prekondisi: Bucket Agunan memiliki lebih dari 1 agunan (Final dan Draft)', async () => {
      await ensureDataAgunanOpen(page);
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      hasDraft = await drafHeader.isVisible({ timeout: 3000 }).catch(() => false);
      await shot(page, testInfo, 'Prekondisi: Kombinasi Agunan Draft dan Final');
      if (!hasDraft) {
        console.warn(`[GAP PREKONDISI] TC-6020-02 butuh kombinasi Draft + Final. App ID ${TARGET_APP_ID} tidak memiliki agunan draf.`);
      }
    });

    await test.step('1. Catat jumlah dan nama masing-masing agunan yang ada di daftar', async () => {
      beforeDaftar = await daftarHeader.innerText();
      beforeDraf = hasDraft ? await drafHeader.innerText() : null;
      await shot(page, testInfo, 'Step 1: Jumlah dan Nama Agunan Tercatat');
    });

    await test.step('2. Klik tab bucket "Analisa Keuangan"', async () => {
      await navigateBucket(page, 'Analisa Keuangan', 'analisa_keuangan');
      await expect(page).toHaveURL(/bucket=analisa_keuangan/);
      await shot(page, testInfo, 'Step 2: Halaman Bucket Analisa Keuangan');
    });

    await test.step('3. Klik kembali tab "Agunan"', async () => {
      await navigateBucket(page, 'Agunan', 'agunan');
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 3: Kembali ke Tab Bucket Agunan');
    });

    await test.step('4. Bandingkan jumlah dan daftar kartu agunan yang tampil', async () => {
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      expect(await daftarHeader.innerText()).toBe(beforeDaftar);

      if (hasDraft) {
        await expect(drafHeader).toBeVisible({ timeout: 30000 });
        expect(await drafHeader.innerText()).toBe(beforeDraf);
      }

      await daftarHeader.scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 4: Jumlah dan Badge Status Multi-Agunan Konsisten');
    });
  });

  /**
   * TC-6020-03
   * Prekondisi CSV: Agunan tersimpan dengan nilai penilaian (Nilai Prediktif / Nilai Wajar).
   * Langkah CSV:
   *   1. Buka bucket "Struktur Kredit" lalu kembali ke Bucket "Agunan"
   *   2. Periksa nominal ringkasan nilai agunan pada kartu agunan di halaman summary
   * Expected: Nominal Rp tetap presisi, tidak berubah menjadi Rp 0 atau string kosong.
   */
  test('TC-6020-03: Validasi Retensi Nilai Penilaian dan Nilai Wajar Agunan saat Kembali ke Bucket Agunan', async ({ page }, testInfo) => {
    const nominalLocator = page.locator('text=/Rp\\s*[0-9.-]+/i').first();
    let initialNominal = '';

    await test.step('Prekondisi: Agunan tersimpan dengan nilai penilaian / nilai wajar', async () => {
      await ensureDataAgunanOpen(page);
      await expect(nominalLocator).toBeVisible({ timeout: 30000 });
      initialNominal = await nominalLocator.innerText();
      await shot(page, testInfo, 'Prekondisi: Nominal Nilai Penilaian Awal');
      test.skip(
        /Rp\s*-\s*$/.test(initialNominal) || initialNominal.includes('Rp 0'),
        `[GAP PREKONDISI] Butuh agunan bernilai penilaian. App ID ${TARGET_APP_ID} menampilkan "${initialNominal}".`
      );
    });

    await test.step('1. Buka bucket "Struktur Kredit" lalu kembali ke Bucket "Agunan"', async () => {
      await navigateBucket(page, 'Struktur Kredit', 'struktur_kredit');
      await navigateBucket(page, 'Agunan', 'agunan');
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 1: Kembali ke Bucket Agunan dari Struktur Kredit');
    });

    await test.step('2. Periksa nominal ringkasan nilai agunan pada kartu agunan di halaman summary', async () => {
      await expect(nominalLocator).toBeVisible({ timeout: 30000 });
      expect(await nominalLocator.innerText()).toBe(initialNominal);

      await nominalLocator.scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 2: Nominal Ringkasan Nilai Agunan Tetap Presisi');
    });
  });

  /**
   * TC-6020-04
   * Prekondisi CSV: Berada di Bucket Agunan dengan minimal 1 agunan tersimpan (Draft / Final).
   * Langkah CSV:
   *   1. Lakukan refresh / reload pada browser (F5 atau klik tombol reload)
   *   2. Tunggu proses loading initial state dan data fetching dari backend selesai
   *   3. Periksa tampilan daftar kartu agunan
   * Expected: Data agunan ter-retrieve dari backend dan tampil kembali lengkap serta utuh.
   */
  test('TC-6020-04: Validasi Retensi Data Agunan saat Browser Dilakukan Refresh Halaman (F5)', async ({ page }, testInfo) => {
    const daftarHeader = page.locator('text=/Daftar agunan/i').first();
    let textBeforeReload = '';

    await test.step('Prekondisi: Berada di Bucket Agunan dengan minimal 1 agunan tersimpan', async () => {
      await ensureDataAgunanOpen(page);
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      textBeforeReload = await daftarHeader.innerText();
      await shot(page, testInfo, 'Prekondisi: State Daftar Agunan Sebelum Reload');
      test.skip(/\(0\)/.test(textBeforeReload), `[GAP PREKONDISI] Butuh minimal 1 agunan tersimpan. App ID ${TARGET_APP_ID} memiliki "${textBeforeReload}".`);
    });

    await test.step('1. Lakukan refresh / reload pada browser (F5 atau klik tombol reload)', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await shot(page, testInfo, 'Step 1: Browser Di-reload (F5)');
    });

    await test.step('2. Tunggu proses loading initial state dan data fetching dari backend selesai', async () => {
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 2: Data Fetching Backend Selesai');
    });

    await test.step('3. Periksa tampilan daftar kartu agunan', async () => {
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      expect(await daftarHeader.innerText()).toBe(textBeforeReload);

      await daftarHeader.scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 3: Daftar Kartu Agunan Termuat Lengkap Pasca Reload');
    });
  });

  /**
   * TC-6020-05
   * Prekondisi CSV: Data agunan telah tersimpan di server untuk application ID target.
   * Langkah CSV:
   *   1. Lakukan logout dari aplikasi LAMOS
   *   2. Login kembali menggunakan kredensial Account Officer
   *   3. Buka pengajuan kredit target dan masuk ke Bucket Agunan
   *   4. Amati daftar agunan
   * Expected: Data agunan tetap tersedia dan termuat sempurna antar sesi login.
   */
  test('TC-6020-05: Validasi Retensi Data Agunan Pasca Re-Login Sesi Pengguna', async ({ page }, testInfo) => {
    const summaryHeader = page.locator('text=/Daftar agunan|Draf agunan/i').first();
    let countBeforeLogout = '';

    await test.step('Prekondisi: Data agunan telah tersimpan di server untuk application ID target', async () => {
      await ensureDataAgunanOpen(page);
      await expect(summaryHeader).toBeVisible({ timeout: 30000 });
      countBeforeLogout = await summaryHeader.innerText();
      await shot(page, testInfo, 'Prekondisi: State Agunan Tersimpan di Server');
      test.skip(/\(0\)/.test(countBeforeLogout), `[GAP PREKONDISI] Butuh data agunan tersimpan. App ID ${TARGET_APP_ID} memiliki "${countBeforeLogout}".`);
    });

    await test.step('1. Lakukan logout dari aplikasi LAMOS', async () => {
      await page.context().clearCookies();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, 'Step 1: Sesi Pengguna Logout');
    });

    await test.step('2. Login kembali menggunakan kredensial Account Officer', async () => {
      const login = new LoginPage(page);
      await login.goto();
      await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
      await login.expectLoginSuccess();
      await shot(page, testInfo, 'Step 2: Login Ulang Account Officer Berhasil');
    });

    await test.step('3. Buka pengajuan kredit target dan masuk ke Bucket Agunan', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 3: Bucket Agunan Pengajuan Target Terbuka');
    });

    await test.step('4. Amati daftar agunan', async () => {
      await expect(summaryHeader).toBeVisible({ timeout: 30000 });
      expect(await summaryHeader.innerText()).toBe(countBeforeLogout);

      await summaryHeader.scrollIntoViewIfNeeded();
      await shot(page, testInfo, 'Step 4: Daftar Agunan Utuh Pasca Re-Login');
    });
  });

  /**
   * TC-6020-06
   * Prekondisi CSV: Modal Tambah Agunan terbuka dan terisi data, BELUM ditekan "Simpan sebagai draft" / "Simpan".
   * Langkah CSV:
   *   1. Dalam kondisi form terisi tapi belum disimpan, tutup modal atau coba klik link bucket lain
   *   2. Masuk kembali ke modal Tambah Agunan Baru
   * Expected: Data unsaved tidak mengotori daftar agunan di backend.
   */
  test('TC-6020-06: Validasi Penanganan Form yang Belum Disimpan (Unsaved State) saat Pindah Bucket', async ({ page }, testInfo) => {
    const daftarHeader = page.locator('text=/Daftar agunan/i').first();
    const dummyUnsavedNumber = 'UNSAVED_DUMMY_' + Date.now();
    let initialDaftarCount = '';

    await test.step('Prekondisi: Modal Tambah Agunan terbuka dan terisi data, belum ditekan Simpan', async () => {
      await ensureDataAgunanOpen(page);
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      initialDaftarCount = await daftarHeader.innerText();

      const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
      await expect(btnTambah).toBeVisible({ timeout: 30000 });
      await btnTambah.click();

      const modal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
      await expect(modal).toBeVisible({ timeout: 20000 });

      await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
      const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
      await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
      await listbox.locator('li button, li').first().click();

      await page.locator('input[placeholder*="nomor" i]').first().fill(dummyUnsavedNumber);
      await shot(page, testInfo, 'Prekondisi: Form Terisi Namun Belum Disimpan');
    });

    await test.step('1. Dalam kondisi form terisi tapi belum disimpan, tutup modal lalu klik link bucket lain', async () => {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"]').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click().catch(() => {});
      }

      await navigateBucket(page, 'Dokumen', 'dokumen');
      await navigateBucket(page, 'Agunan', 'agunan');
      await ensureDataAgunanOpen(page);
      await shot(page, testInfo, 'Step 1: Modal Ditutup Tanpa Simpan dan Pindah Bucket');
    });

    await test.step('2. Masuk kembali ke modal Tambah Agunan Baru', async () => {
      await expect(daftarHeader).toBeVisible({ timeout: 30000 });
      expect(await daftarHeader.innerText()).toBe(initialDaftarCount);
      expect(await page.locator('body').innerText()).not.toContain(dummyUnsavedNumber);

      const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
      await expect(btnTambah).toBeVisible({ timeout: 30000 });
      await btnTambah.click();

      const modal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
      await expect(modal).toBeVisible({ timeout: 20000 });
      await expect(modal).not.toContainText(dummyUnsavedNumber);

      await shot(page, testInfo, 'Step 2: Modal Tambah Agunan Baru Bersih dari Data Unsaved');
    });
  });
});
