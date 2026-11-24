import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../../pages/LoginPage';

/**
 * Test Suite: Story S2CML-4889 - Add Agunan/Collaterals Part 1
 * Epic: LP-5685
 * Sumber Data Test Case: fixtures/TemplateAutomateLamos - Sheet1.csv (Modul 1: Search Agunan)
 * Karakter: READ-ONLY (Pencarian & Eksplorasi Modal Stepper tanpa Commit Data)
 */

const TYPES = [
  { name: 'Perseorangan', debtorType: 'individual', appId: process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY' },
  { name: 'Badan Usaha', debtorType: 'business', appId: process.env.DEBITUR_TARGET || '01M482PRSVH5ZMTVZX5QH0VDNZ' },
];

// Helper parser CSV toleran multiline & tanda kutip
function parseCsvFile(filePath: string): Map<string, any> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  const tcMap = new Map<string, any>();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tcIdRaw = r[0] || '';
    const cleanId = tcIdRaw.replace(/\s+/g, ' ').trim();
    if (cleanId.startsWith('TC-4889') || cleanId.startsWith('TC - 04') || cleanId.startsWith('TC-04')) {
      tcMap.set(cleanId, {
        id: cleanId,
        title: r[1],
        precondition: r[5],
        testStep: r[6],
        expectedResult: r[7]
      });
    }
  }

  return tcMap;
}

for (const { name, debtorType, appId } of TYPES) {
const TARGET_URL = process.env.EXPLORE_URL
  || `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${appId}/create?bucket=agunan&debtorType=${debtorType}`;

test.describe(`S2CML-4889 [${name}]: Modul 1 - Search Agunan Eksisting vs Baru`, () => {
  const csvPath = path.resolve(__dirname, '../../../fixtures/TemplateAutomateLamos - Sheet1.csv');
  let tcData: Map<string, any>;

  test.beforeAll(() => {
    tcData = parseCsvFile(csvPath);
    console.log(`[CSV] Berhasil memuat ${tcData.size} Test Case untuk modul Agunan.`);
  });

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
    // Tombol "+ Agunan" berada di sebelah heading "Daftar agunan"
    const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await expect(btnTambah).toBeVisible({ timeout: 45000 });
    await btnTambah.click();

    const dialog = page.locator('div').filter({ has: page.locator('h2:has-text("Tambah agunan")') }).last();
    await expect(dialog).toBeVisible({ timeout: 20000 });
    return dialog;
  }

  /**
   * Helper: Tutup modal Tambah Agunan secara aman (Read-Only)
   */
  async function closeDialogSafely(page: Page) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
  }

  /**
   * TC-4889-01: Validasi Modal dan Urutan Stepper saat Klik Tambah Agunan
   */
  test('TC-4889-01: Validasi modal dan urutan stepper Tambah Agunan', async ({ page }, testInfo) => {
    const tc = tcData.get('TC-4889-01');
    console.log(`Menjalankan: ${tc?.id} - ${tc?.title}`);

    // Eviden 1: Halaman Summary sebelum buka modal
    await testInfo.attach('Eviden 1: Halaman Collateral Summary & Tombol Agunan', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    const dialog = await openTambahAgunanModal(page);

    // 1. Verifikasi judul modal
    await expect(dialog.getByText(/Tambah agunan/i).first()).toBeVisible({ timeout: 5000 });

    // 2. Verifikasi field wajib awal: Jenis agunan & Nomor bukti pemilikan
    await expect(dialog.getByText(/Jenis agunan/i).first()).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText(/Nomor bukti/i).first()).toBeVisible({ timeout: 5000 });

    // 3. Verifikasi tombol Cari awal dalam status non-aktif (disabled)
    const btnCari = dialog.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeVisible({ timeout: 5000 });
    await expect(btnCari).toBeDisabled();

    // Eviden 2: Modal terbuka dengan field wajib awal
    await testInfo.attach('Eviden 2: Modal Tambah Agunan Terbuka & Tombol Cari Disabled', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    // 4. Tutup dialog dengan aman
    await closeDialogSafely(page);
  });

  /**
   * TC-4889-02 + TC-4889-03: Cari disabled tanpa Jenis Agunan, aktif setelah kriteria wajib lengkap
   */
  test('TC-4889-02/03: Tombol Cari disabled tanpa Jenis Agunan, aktif jika kriteria wajib lengkap', async ({ page }, testInfo) => {
    const tc = tcData.get('TC-4889-03');
    console.log(`Menjalankan: ${tc?.id} - ${tc?.title}`);

    const dialog = await openTambahAgunanModal(page);

    // 0. (TC-02) Hanya nomor bukti terisi, jenis kosong -> Cari disabled
    const btnCari = dialog.locator('button:has-text("Cari")').first();
    await dialog.getByPlaceholder(/nomor/i).first().fill('12345/SHM/2026');
    await expect(btnCari).toBeDisabled();
    await testInfo.attach('Eviden TC-4889-02: Nomor Bukti Terisi, Jenis Agunan Kosong, Cari Tetap Disabled', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    // 1. Pilih Jenis Agunan
    await dialog.getByText(/Pilih jenis agunan/i).first().click();
    const listbox = page.locator('[role="listbox"]:visible').first();
    await listbox.locator('li button').first().waitFor({ timeout: 15000 });
    await listbox.locator('li:not(.sticky) button').first().click();

    // 2. Isi ulang nomor (form bisa reset saat jenis berubah)
    await dialog.getByPlaceholder(/nomor/i).first().fill('12345/SHM/2026');

    // 3. Tombol Cari wajib berubah menjadi aktif (Enabled)
    await expect(btnCari).toBeEnabled({ timeout: 10000 });

    // Eviden: Field wajib lengkap -> tombol Cari aktif
    await testInfo.attach('Eviden TC-4889-03: Kriteria Wajib Lengkap & Tombol Cari Aktif', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    // Tutup dialog
    await closeDialogSafely(page);
  });

  /**
   * TC-4889-05 + TC-4889-06: Validasi Tambah Agunan Baru ketika Hasil Pencarian Kosong
   */
  test('TC-4889-05/06: Tombol Agunan Baru tidak ada sebelum Cari; muncul saat data tidak ditemukan di CLS', async ({ page }, testInfo) => {
    const tc = tcData.get('TC-4889-06');
    console.log(`Menjalankan: ${tc?.id} - ${tc?.title}`);

    const dialog = await openTambahAgunanModal(page);

    // 0. (TC-05) Sebelum Cari, tombol "+ Agunan Baru" tidak ada
    await expect(dialog.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i })).toHaveCount(0);

    // 1. Pilih jenis agunan
    await dialog.getByText(/Pilih jenis agunan/i).first().click();
    const listbox = page.locator('[role="listbox"]:visible').first();
    await listbox.locator('li button').first().waitFor({ timeout: 15000 });
    await listbox.locator('li:not(.sticky) button').first().click();

    // 2. Isi nomor bukti fiktif
    const inputNomor = dialog.getByPlaceholder(/nomor/i).first();
    await inputNomor.fill('NONEXISTENT_999999_DUMMY_CLS');

    // 3. Trigger Cari
    const btnCari = dialog.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    // 4. Verifikasi teks "Data tidak ditemukan" tampil
    await expect(dialog.getByText(/Data tidak ditemukan/i)).toBeVisible({ timeout: 15000 });

    // 5. Tombol "+ Agunan Baru" harus muncul setelah pencarian tidak menemukan hasil
    const btnAgunanBaru = dialog.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
    await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });

    // Tunggu animasi & rendering hasil pencarian stabil
    await page.waitForTimeout(2000);

    // Eviden 1: Screenshot fokus pada modal dialog Tambah Agunan
    await testInfo.attach('Eviden Modal: Hasil Pencarian Kosong & Tombol Agunan Baru', {
      body: await dialog.screenshot(),
      contentType: 'image/png'
    });

    // Eviden 2: Screenshot Full Page
    await testInfo.attach('Eviden Full Page: Hasil Pencarian Kosong & Tombol Agunan Baru', {
      body: await page.screenshot(),
      contentType: 'image/png'
    });

    // Modal sengaja tidak ditutup manual agar screenshot otomatis Playwright (test-finished.png)
    // juga tetap menampilkan modal dalam kondisi terbuka dengan hasil pencarian dan tombol "+ Agunan Baru".
  });

  /**
   * TC-4889-09: Sistem memblokir reuse agunan existing dengan Paripasu = N
   * Data uji: fixtures/Data Agunan CLS - Testing LAMOS.xlsx, sheet "Vehicle" > NON PARIPASU
   * (CLSA202607274780, nomor COL-2026-501, jenis Kendaraan).
   */
  test('TC-4889-09: Reuse agunan existing Paripasu = N diblokir', async ({ page }, testInfo) => {
    const dialog = await openTambahAgunanModal(page);

    await dialog.getByText(/Pilih jenis agunan/i).first().click();
    const listbox = page.locator('[role="listbox"]:visible').first();
    await listbox.locator('li button').first().waitFor({ timeout: 15000 });
    await listbox.locator('li:not(.sticky) button').filter({ hasText: /Kendaraan|Mobil|Motor/i }).first().click();
    await dialog.getByPlaceholder(/nomor/i).first().fill('COL-2026-501');

    const btnCari = dialog.locator('button:has-text("Cari")').first();
    await expect(btnCari).toBeEnabled({ timeout: 10000 });
    await btnCari.click();

    const kartu = dialog.getByText(/COL-2026-501|CLSA202607274780/).first();
    const ada = await kartu.waitFor({ timeout: 15000 }).then(() => true, () => false);
    test.skip(!ada,
      '[GAP DATA CLS] Agunan Paripasu = N (COL-2026-501) tidak ditemukan di SIT.');
    await testInfo.attach('Eviden TC-4889-09: Hasil Pencarian Agunan Paripasu = N', {
      body: await page.screenshot(), contentType: 'image/png'
    });

    await kartu.click();
    // Blokir: banner merah muncul dan tombol Lanjutkan tidak aktif.
    await expect(dialog.getByText(/tidak bisa digunakan/i)).toBeVisible({ timeout: 45000 });
    await testInfo.attach('Eviden TC-4889-09: Banner Blokir Agunan Paripasu = N', {
      body: await page.screenshot(), contentType: 'image/png'
    });
    const btnLanjut = page.locator('button:visible').filter({ hasText: /^\s*Lanjutkan\s*$/ });
    if (await btnLanjut.count()) await expect(btnLanjut.first()).toBeDisabled();
  });
});
}
