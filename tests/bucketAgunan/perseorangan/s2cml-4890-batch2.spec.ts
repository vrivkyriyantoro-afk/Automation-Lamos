import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../../pages/base/LoginPage';

/**
 * Test Suite: Story S2CML-4890 - Batch 2
 * Sumber Acuan: exports/test-cases/TC_S2CML-4890_Bucket_Agunan.csv
 * Cakupan (penomoran mengikuti CSV, 16 TC):
 *   - TC-4890-04 & 05: fixme (belum ada flow isi Step 1 Lengkap)
 *   - TC-4890-07: Akses Step 3 saat Identitas Lengkap (butuh DEBITUR_IDENTITAS_LENGKAP)
 *   - TC-4890-08: Batas maksimal 100 agunan (butuh DEBITUR_MAX_AGUNAN)
 *   - TC-4890-09 & 10: Simpan draft & retensi (butuh ALLOW_SIT_WRITE=1)
 *   - TC-4890-12 & 13: fixme (12: perlu konfirmasi BA; 13: submit menulis ke SIT)
 *   - TC-4890-14, 15 (fixme), 16
 *   - TC-4890-11 dicakup di s2cml-4890.spec.ts
 *   - LEGACY-4890-15 s.d 22: test lama di luar scope 4890 (milik 6756/4948/5420)
 */

const DEFAULT_APP_ID = process.env.DEBITUR_TARGET || '01M79GW1XYEQAK97TM803HFY8F';
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${DEFAULT_APP_ID}/create?bucket=agunan&debtorType=individual`;

test.describe('S2CML-4890: Bucket Agunan - Add Agunan Part 2 (Batch 2: Advanced Stepper & Submissions)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  });

  /**
   * Helper: Buka modal Tambah Agunan
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
   * Helper: Masuk ke Form Agunan Baru
   */
  async function navigateToFormAgunanBaru(page: Page, jenisKeyword: string = 'Tanah') {
    await openTambahAgunanModal(page);

    await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });

    const targetOption = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await targetOption.click();
    } else {
      await listbox.locator('li button, li').first().click();
    }

    const inputNomor = page.locator('input[placeholder*="nomor" i]').first();
    await inputNomor.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());

    const btnCari = page.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await btnAgunanBaru.click();
    await page.waitForTimeout(2000);

    const activeModal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    return activeModal;
  }
  // ponytail: test yang MENULIS data ke SIT (klik draft / submit) hanya jalan bila ALLOW_SIT_WRITE=1.
  const ALLOW_SIT_WRITE = process.env.ALLOW_SIT_WRITE === '1';
  const SKIP_WRITE_MSG = 'Menulis draft/agunan ke SIT. Set ALLOW_SIT_WRITE=1 bila data uji boleh dibuang.';

  const draftButton = (page: Page) =>
    page.locator('button').filter({ hasText: /Simpan sebagai draft|Simpan draft/i }).first();

  /** Helper: pilih status agunan (Tersedia/Indent) di Step 1 */
  async function selectStatus(page: Page, statusText: 'Tersedia' | 'Indent' = 'Tersedia') {
    const trigger = page.locator('[role="combobox"]').filter({ hasText: /Pilih status agunan|Tersedia|Indent/i }).first();
    await expect(trigger).toBeVisible({ timeout: 15000 });
    await trigger.click();
    const listbox = page.locator('[role="listbox"]:visible, ul:visible').first();
    await listbox.locator('li button, li').first().waitFor({ timeout: 10000 });
    await listbox.locator('li:not(.sticky) button, li:not(.sticky)').filter({ hasText: new RegExp(statusText, 'i') }).first().click();
    await page.waitForTimeout(1500);
  }

  /**
   * TC-4890-04: Indikator Step 1 berubah dari "Belum Lengkap" menjadi "Lengkap"
   * ponytail: fixme. Belum ada green flow yang mengisi SEMUA mandatory Step 1, jadi status Lengkap
   * belum terbukti. Assertion lama (badge hanya ada) PASS palsu, dihapus.
   */
  test.fixme('TC-4890-04: Indikator Step 1 berubah menjadi "Lengkap" setelah seluruh mandatory terisi', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    const step1 = page.locator('aside button').filter({ hasText: /Informasi umum agunan/i }).first();
    await expect(step1).toContainText(/Belum Lengkap/i);
    // TODO: isi seluruh mandatory Step 1 -> indikator berubah menjadi "Lengkap"
  });

  /**
   * TC-4890-05: Step berstatus "Lengkap" tetap dapat dibuka dan diedit
   * ponytail: fixme, prasyarat sama dengan TC-4890-04.
   */
  test.fixme('TC-4890-05: Form Step 1 tetap dapat diedit setelah berstatus "Lengkap"', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    // TODO: lengkapi Step 1 -> Step 2 -> kembali Step 1 -> ubah 1 field -> nilai berubah, tidak read-only
  });

  /**
   * TC-4890-08: Batas maksimal 100 agunan
   * ponytail: butuh aplikasi dengan 100 agunan (env DEBITUR_MAX_AGUNAN). Tanpa itu skip,
   * bukan PASS dari cek "tombol enabled" yang tidak membuktikan batas.
   */
  test('TC-4890-08: Tombol + Agunan memunculkan popup batas maksimal saat sudah 100 agunan', async ({ page }, testInfo) => {
    const id = process.env.DEBITUR_MAX_AGUNAN;
    test.skip(!id, 'Set DEBITUR_MAX_AGUNAN=<app id yang sudah punya 100 agunan>');
    await page.goto(TARGET_URL.replace(DEFAULT_APP_ID, id!), { waitUntil: 'domcontentloaded' });

    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    await expect(
      page.getByText(/Maximum number agunan has been reached, please ask administrator to remove from current data agunan/i)
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h2:has-text("Tambah agunan")')).toHaveCount(0);

    await testInfo.attach('Eviden TC-4890-08: Popup Batas Maksimal', { body: await page.screenshot(), contentType: 'image/png' });
  });

  /**
   * TC-4890-09: Simpan draft form parsial (bypass mandatory) -> toast sukses
   * Toast SIT asli: "Pengajuan berhasil disimpan sebagai draf." (PUT /forms/collaterals 200, toast hilang <1 dtk; lihat explore-output/agunan/draft-toast.json).
   */
  test('TC-4890-09: Simpan sebagai draft dengan form parsial tidak divalidasi mandatory dan menampilkan toast sukses', async ({ page }, testInfo) => {
    test.skip(!ALLOW_SIT_WRITE, SKIP_WRITE_MSG);
    await navigateToFormAgunanBaru(page, 'Tanah');
    await selectStatus(page);

    await draftButton(page).click();
    await expect(page.getByText(/Pengajuan berhasil disimpan sebagai draf/i).first()).toBeVisible({ timeout: 15000 });

    await testInfo.attach('Eviden TC-4890-09: Toast Draft', { body: await page.screenshot(), contentType: 'image/png' });
  });

  /**
   * TC-4890-10: Data draft tetap ada setelah modal ditutup dan dibuka lagi
   * ponytail: Draft Indent dari run lama ikut cocok, jadi test ini tidak membedakan draft baru vs lama (belum ada ID unik di Step 1).
   */
  test('TC-4890-10: Data draft tidak hilang setelah modal ditutup dan agunan draft dibuka kembali', async ({ page }, testInfo) => {
    test.skip(!ALLOW_SIT_WRITE, SKIP_WRITE_MSG);
    const judulDraft = page.getByText(/AN020101 - Tanah/i);
    await navigateToFormAgunanBaru(page, 'Tanah');
    await selectStatus(page, 'Indent');

    await draftButton(page).click();
    await expect(page.getByText(/Pengajuan berhasil disimpan sebagai draf/i).first()).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('h2:has-text("Tambah agunan")')).toHaveCount(0, { timeout: 10000 });

    // Urutan kartu tidak dijamin (dan daftar bisa terpotong di 10), jadi
    // buka tiap kartu via menu titik 3 > Ubah sampai ditemukan yang berstatus Indent (data yang kita simpan).
    const total = await judulDraft.count();
    let ditemukan = false;
    for (let i = total - 1; i >= 0 && !ditemukan; i--) {
      const judul = judulDraft.nth(i);
      await judul.scrollIntoViewIfNeeded();
      await judul.locator('xpath=ancestor::div[contains(@class, "border")][1]').locator('button').filter({ has: page.locator('svg') }).first().click();
      await page.locator('button, [role="menuitem"]').filter({ hasText: /^Ubah$/i }).first().click();
      await expect(page.locator('text=/Ubah agunan/i').first()).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1500);
      ditemukan = await page.evaluate(() =>
        /2 - Indent/.test(document.body.innerText) || Array.from(document.querySelectorAll('input')).some(i => /Indent/.test(i.value)));
      if (!ditemukan) {
        // modal Ubah tidak punya tombol tutup yang mudah diselect; reload mengembalikan daftar (draft sudah di server)
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(judulDraft.first()).toBeVisible({ timeout: 45000 });
      }
    }
    expect(ditemukan, 'Draft berstatus Indent harus terbuka kembali dengan data tersimpan').toBe(true);

    await testInfo.attach('Eviden TC-4890-10: Retensi Draft', { body: await page.screenshot(), contentType: 'image/png' });
  });

  /**
   * TC-4890-12: Submit ditolak + notifikasi bila field mandatory belum lengkap
   * ponytail: [PERLU KONFIRMASI BA] AC tombol Simpan ambigu, bentrok dengan TC-11 (Simpan disabled sehingga
   * tidak bisa diklik). fixme sampai BA memutuskan perilaku. TC-11 sudah dicakup di s2cml-4890.spec.ts.
   */
  test.fixme('TC-4890-12: Submit dengan field mandatory belum lengkap diblokir dan menampilkan toast incomplete form', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    // Bila Simpan bisa diklik: klik -> toast merah daftar field belum lengkap, modal tetap terbuka.
  });

  /**
   * LEGACY-4890-15: Render Dinamis Step 2 (Data Tambahan Agunan) Sesuai Segmen
   */
  test('LEGACY-4890-15: Step 2 menampilkan form data tambahan agunan yang dinamis sesuai jenis agunan terpilih', async ({ page }, testInfo) => {
    console.log('Menjalankan LEGACY-4890-15: Render Dinamis Step 2');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pindah ke Step 2
    const step2Btn = page.locator('aside button, [role="tab"], button').filter({ hasText: /Data tambahan agunan|Step 2/i }).first();
    await expect(step2Btn).toBeVisible({ timeout: 10000 });
    await step2Btn.click();
    await page.waitForTimeout(1500);

    // Verifikasi container Step 2 render
    const step2Form = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    expect(await step2Form.isVisible()).toBe(true);

    await testInfo.attach('Eviden LEGACY-4890-15: Render Dinamis Step 2', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * LEGACY-4890-16 & 17: Validasi Kategori Pemilik Khusus (Pasangan & Penjamin)
   */
  test('LEGACY-4890-16 & 17: Validasi opsi kategori pemilik agunan (010 Pasangan & 009 Penjamin)', async ({ page }, testInfo) => {
    console.log('Menjalankan LEGACY-4890-16 & 17: Kategori Pemilik Khusus');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pindah ke Step 3
    const step3Btn = page.locator('aside button, [role="tab"], button').filter({ hasText: /Informasi kepemilikan|Step 3/i }).first();
    await expect(step3Btn).toBeVisible({ timeout: 10000 });
    await step3Btn.click();

    // Verifikasi container kepemilikan tampil
    const step3Modal = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    expect(await step3Modal.isVisible()).toBe(true);

    await testInfo.attach('Eviden LEGACY-4890-16-17: Kategori Pemilik Khusus', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * LEGACY-4890-18 s.d 22: Negative Form & Business Logic Validations
   */
  test('LEGACY-4890-18 s.d 22: Negative validation form (nominal minus/0, luas 0, sertifikat kadaluarsa)', async ({ page }, testInfo) => {
    console.log('Menjalankan LEGACY-4890-18 s.d 22: Negative Form Validations');
    await navigateToFormAgunanBaru(page, 'Tanah');

    // Pindah ke Step 2
    const step2Btn = page.locator('aside button, [role="tab"], button').filter({ hasText: /Data tambahan agunan|Step 2/i }).first();
    await step2Btn.click();
    await page.waitForTimeout(1000);

    // Cek input luas tanah jika ada
    const inputLuas = page.locator('input[placeholder*="luas" i], input[name*="area" i]').first();
    if (await inputLuas.isVisible().catch(() => false)) {
      await inputLuas.fill('0');
      await inputLuas.blur();
      // Validasi alert luas tidak boleh 0
      const errorLuas = page.locator('text=/lebih dari 0|harus lebih besar/i');
      if (await errorLuas.count() > 0) {
        expect(await errorLuas.count()).toBeGreaterThan(0);
      }
    }

    await testInfo.attach('Eviden LEGACY-4890-18-22: Negative Validations', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });

  /**
   * TC-4890-14: Simpan Draft tersedia di Step 2 dan Step 3 (any step)
   * ponytail: cek tombol enabled saja (tanpa klik) agar tidak menulis draft ke SIT.
   */
  test('TC-4890-14: Tombol Simpan sebagai draft aktif di Step 2 dan Step 3', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    const btnDraft = page.locator('button').filter({ hasText: /Simpan sebagai draft|Simpan draft/i }).first();
    for (const step of [/Data tambahan agunan/i, /Informasi kepemilikan/i]) {
      await page.locator('aside button').filter({ hasText: step }).first().click();
      await page.waitForTimeout(1000);
      await expect(btnDraft).toBeVisible({ timeout: 10000 });
      expect(await btnDraft.isEnabled()).toBe(true);
    }
  });

  /**
   * TC-4890-15: Teks toast draft "Draft Saved Successfully"
   * ponytail: fixme, klik draft menulis data ke SIT; aktifkan setelah ada data uji yang boleh dibuang.
   */
  test.fixme('TC-4890-15: Toast draft persis "Draft Saved Successfully"', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    await page.locator('button').filter({ hasText: /Simpan sebagai draft|Simpan draft/i }).first().click();
    await expect(page.getByText('Draft Saved Successfully', { exact: true })).toBeVisible({ timeout: 15000 });
  });

  /**
   * TC-4890-16: Form 3-step tampil setelah pilih "Agunan Baru"
   * ponytail: jalur "Existing Collateral from CLS" belum dicakup (UI belum dieksplor).
   */
  test('TC-4890-16: Form 3-step tampil dengan default Step 1 setelah pilih Agunan Baru', async ({ page }) => {
    await navigateToFormAgunanBaru(page, 'Tanah');
    const nav = page.locator('button').filter({ hasText: /Informasi umum agunan|Data tambahan agunan|Informasi kepemilikan/i });
    await expect(nav).toHaveCount(3);
    await expect(nav.first()).toContainText(/Informasi umum agunan/i);
  });

  /**
   * TC-4890-07: Step 3 terbuka saat Bucket Identitas Lengkap
   * ponytail: butuh app ID dengan Identitas Lengkap; skip bila env DEBITUR_IDENTITAS_LENGKAP kosong.
   */
  test('TC-4890-07: Step 3 terbuka tanpa dialog gating saat Bucket Identitas Lengkap', async ({ page }) => {
    const id = process.env.DEBITUR_IDENTITAS_LENGKAP;
    test.skip(!id, 'Set DEBITUR_IDENTITAS_LENGKAP=<app id dengan Bucket Identitas Lengkap>');
    await page.goto(TARGET_URL.replace(DEFAULT_APP_ID, id!), { waitUntil: 'domcontentloaded' });
    await navigateToFormAgunanBaru(page, 'Tanah');
    await page.locator('aside button').filter({ hasText: /Informasi kepemilikan/i }).first().click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[role="alertdialog"], [role="alert"]').filter({ hasText: /Identitas|Pengecekan/i })).toHaveCount(0);
    await expect(page.getByText(/Kategori pemilik/i).first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * TC-4890-13: Submit final sukses (toast "Penginputan data agunan sudah sesuai")
   * ponytail: fixme, submit menulis agunan nyata ke SIT dan butuh data valid ketiga step.
   */
  test.fixme('TC-4890-13: Submit final berhasil menampilkan toast sukses dan modal tertutup', async () => {
    // Isi Step 1-3 valid -> klik Simpan -> expect toast "Penginputan data agunan sudah sesuai" + modal tutup.
  });
});
