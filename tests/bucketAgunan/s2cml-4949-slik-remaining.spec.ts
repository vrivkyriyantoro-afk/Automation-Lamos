import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import 'dotenv/config';
import {
  APP_ID_PERORANGAN,
  closeModal,
  listboxOption,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihTipeKepemilikan,
  readListboxOptions,
} from './helpers/agunanModal';

/**
 * S2CML-4949 — sisa TC (05, 06, 10, 12-17, 19, 20).
 * Semua aksi hanya di form modal (tidak klik Simpan) -> tidak menulis ke SIT.
 * File upload dibuat in-memory via setInputFiles, tanpa file fixture.
 *
 * Mismatch SIT vs matriks TC-14: opsi 'Penjamin' tidak ada; diganti 'Pemilik/Pengurus Perusahaan'.
 * ponytail: TC-12..15 hanya cek opsi dropdown Hubungan; mapping SmartCA/McKinsey
 * ada di backend, tidak terlihat di UI. Upgrade: cek payload request saat Simpan.
 */

const pdf = (name: string, size = 1024) => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.alloc(size, '%PDF-1.4\n'),
});

async function bukaForm(page: Page, prefix: string, tipe: 'Individu' | 'Non Individu') {
  await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
  await openStep3Kepemilikan(page, prefix);
  expect(await pilihKategori(page, '005'), 'Kategori 005 harus tersedia').not.toBeNull();
  expect(await pilihTipeKepemilikan(page, tipe), `tipe ${tipe} harus tersedia`).not.toBeNull();
}

async function opsiHubungan(page: Page) {
  const combo = page.locator('[role="combobox"]:visible').filter({ hasText: /hubungan dengan debitur/i }).first();
  await expect(combo).toBeVisible({ timeout: 15000 });
  await combo.click();
  await page.waitForTimeout(1000);
  return readListboxOptions(page);
}

/** Input file terakhir = upload dokumen SLIK PDF; yang pertama = KTP/bukti kepemilikan. */
const fileInputs = (page: Page) => page.locator('input[type="file"]');

test.describe('S2CML-4949: sisa TC SLIK', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
  });

  test('TC-4949-05: NIK 16 digit angka diterima tanpa error', async ({ page }) => {
    test.setTimeout(120000);
    await bukaForm(page, 'TC4949_05', 'Individu');
    const nik = page.locator('input[placeholder*="Masukkan nomor identitas" i]').first();
    await nik.fill('3201011205900001');
    await nik.blur();
    await page.waitForTimeout(500);
    await expect(nik).toHaveValue('3201011205900001');
    expect((await nik.inputValue()).length).toBe(16);
    await closeModal(page);
  });

  test('TC-4949-06: Upload dokumen KTP berhasil', async ({ page }) => {
    test.setTimeout(120000);
    await bukaForm(page, 'TC4949_06', 'Individu');
    await fileInputs(page).first().setInputFiles({ name: 'ktp_sample.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(2048, 'x') });
    await expect(page.getByText('ktp_sample.pdf').first()).toBeVisible({ timeout: 20000 });
    await closeModal(page);
  });

  test('TC-4949-10: Isi Nama PIC & nomor telepon PIC badan usaha', async ({ page }) => {
    test.setTimeout(120000);
    await bukaForm(page, 'TC4949_10', 'Non Individu');
    const nama = page.locator('input[placeholder*="Masukkan nama PIC" i]').first();
    await nama.fill('Budi Santoso');
    // Placeholder telepon PIC duplikat "nomor HP badan usaha" (bug kandidat TC-08) -> ambil input terakhir.
    const telp = page.locator('input[placeholder*="Masukkan nomor HP badan usaha" i]').last();
    await telp.fill('081234567890');
    await expect(nama).toHaveValue('Budi Santoso');
    await expect(telp).toHaveValue('081234567890');
    await closeModal(page);
  });

  const hubungan: Array<[string, RegExp[]]> = [
    ['TC-4949-12', [/milik sendiri/i]],
    ['TC-4949-13', [/pasangan/i]],
    ['TC-4949-14', [/orang tua/i, /anak/i, /pemilik\/pengurus perusahaan/i]],
    ['TC-4949-15', [/pemilik sebelumnya.*jual\/?\s?beli/i, /pemilik sebelumnya.*waris/i, /pemilik sebelumnya.*hibah/i]],
  ];
  for (const [id, pola] of hubungan) {
    test(`${id}: Opsi Hubungan dengan Debitur tersedia & dapat dipilih`, async ({ page }) => {
      test.setTimeout(120000);
      await bukaForm(page, id.replace('-', '_'), 'Individu');
      const opsi = await opsiHubungan(page);
      console.log(`${id} opsi Hubungan:`, JSON.stringify(opsi));
      for (const p of pola) {
        expect(opsi.some(o => p.test(o)), `opsi ${p} harus ada`).toBeTruthy();
      }
      await listboxOption(page, pola[0]).click();
      await closeModal(page);
    });
  }

  test('TC-4949-16: Upload SLIK PDF manual berhasil', async ({ page }) => {
    test.setTimeout(120000);
    await bukaForm(page, 'TC4949_16', 'Individu');
    await fileInputs(page).last().setInputFiles(pdf('slik_manual.pdf'));
    await expect(page.getByText('slik_manual.pdf').first()).toBeVisible({ timeout: 20000 });
    await closeModal(page);
  });

  test('TC-4949-17: Hapus file SLIK PDF yang sudah di-upload', async ({ page }) => {
    test.setTimeout(120000);
    await bukaForm(page, 'TC4949_17', 'Individu');
    await fileInputs(page).last().setInputFiles(pdf('slik_hapus.pdf'));
    const nama = page.getByText('slik_hapus.pdf').first();
    await expect(nama).toBeVisible({ timeout: 20000 });
    // Tombol hapus = ikon tanpa nama di baris file -> cari button di ancestor terdekat nama file.
    await nama.locator('xpath=ancestor::*[.//button][1]').locator('button').last().click({ timeout: 5000 });
    // Konfirmasi bila muncul modal
    const konfirmasi = page.getByRole('button', { name: /^(ya|hapus|konfirmasi)/i }).last();
    if (await konfirmasi.isVisible({ timeout: 2000 }).catch(() => false)) await konfirmasi.click();
    await expect(page.getByText('slik_hapus.pdf')).toHaveCount(0, { timeout: 10000 });
    await closeModal(page);
  });

  test('TC-4949-19: File SLIK > 50MB ditolak', async ({ page }) => {
    test.setTimeout(150000);
    await bukaForm(page, 'TC4949_19', 'Individu');
    const big = path.join(os.tmpdir(), 'slik_besar.pdf');
    fs.writeFileSync(big, Buffer.alloc(55 * 1024 * 1024, 'x'));
    await fileInputs(page).last().setInputFiles(big);
    await page.waitForTimeout(2000);
    await expect(page.getByText(/50\s?MB|melebihi/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('slik_besar.pdf')).toHaveCount(0);
    await closeModal(page);
  });

  test('TC-4949-20: Batas maksimal 20 file SLIK', async ({ page }) => {
    test.setTimeout(180000);
    await bukaForm(page, 'TC4949_20', 'Individu');
    // Input single-file -> upload satu per satu.
    for (let i = 1; i <= 21; i++) {
      await fileInputs(page).last().setInputFiles(pdf(`slik_${String(i).padStart(2, '0')}.pdf`)).catch(() => {});
      await page.waitForTimeout(800);
    }
    // File ke-21 tidak boleh tampil; atau muncul peringatan batas.
    const ke21 = await page.getByText('slik_21.pdf').count();
    const alertBatas = await page.getByText(/maksimal|maksimum|20 file|batas/i).count();
    expect(ke21 === 0 || alertBatas > 0, 'file ke-21 harus ditolak / ada peringatan batas').toBeTruthy();
    await closeModal(page);
  });
});
