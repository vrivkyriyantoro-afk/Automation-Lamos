import { test } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';

// Env: DIR, ENTITIES, HAPUS=1, PROSES=1, PDF, APP_ID.
// MENGUBAH DATA SIT: upload .txt + .pdf untuk 9 baris modal "Lengkapi file SLIK" (setelah "Hapus semua file"), lalu opsional klik "Proses file .txt" (PROSES=1).
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z'}/create?bucket=identitas_pengecekan&debtorType=individual`;
const PDF = process.env.PDF || 'C:/Users/V50324/Downloads/document-10mb.pdf';
// Daftar file dari fixtures/slik-entities.json (urut baris modal) di folder DIR (hasil `node scripts/generators/gen-slik.js --out <DIR>`).
const DIR = process.env.DIR || 'exports/slik-auto';
const ENT = JSON.parse(fs.readFileSync(process.env.ENTITIES || 'fixtures/slik-entities.json', 'utf8')).entities as { type: string; id: string }[];
const TXT = ENT.map(e => `${DIR}/${e.type}_${e.id}.txt`);

test('Upload semua file SLIK (9 baris)', async ({ page }) => {
  test.setTimeout(420000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(8000);
  const trigger = page.getByText(/Klik untuk melengkapi file SLIK/).first();
  await page.getByText('Pengecekan SLIK', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(2000);
  await trigger.scrollIntoViewIfNeeded(); await trigger.click({ force: true });
  await page.waitForTimeout(4000);

  // HAPUS=1: klik "Hapus semua file" + konfirmasi (wajib bila App ID sudah pernah diproses; menghapus data impor lama).
  if (process.env.HAPUS === '1') {
    const h = page.getByText('Hapus semua file', { exact: true }).last();
    await h.scrollIntoViewIfNeeded(); await h.click({ force: true });
    await page.waitForTimeout(2000);
    await page.getByText('Hapus File', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(6000);
    await page.getByText('Kelola file', { exact: true }).first().scrollIntoViewIfNeeded();
  }

  for (let i = 0; i < TXT.length; i++) {
    await page.getByText('Kelola file', { exact: true }).nth(i).click({ force: true });
    await page.waitForTimeout(2000);
    const pick = page.getByText('Klik untuk pilih file');
    const n = await pick.count();
    const [c1] = await Promise.all([page.waitForEvent('filechooser'), pick.nth(n - 2).click({ force: true })]);
    await c1.setFiles(path.resolve(TXT[i])); await page.waitForTimeout(2500);
    const [c2] = await Promise.all([page.waitForEvent('filechooser'), pick.nth(n - 1).click({ force: true })]);
    await c2.setFiles(PDF); await page.waitForTimeout(3000);
    await page.getByText('Simpan', { exact: true }).last().click();
    await page.waitForTimeout(4000);
    console.log('baris', i + 1, 'selesai');
  }
  await page.screenshot({ path: 'test-results/upload-semua-1.png' });
  const proses = page.getByText('Proses file .txt', { exact: true }).last();
  await proses.scrollIntoViewIfNeeded();
  const disabled = await proses.evaluate(e => ((e.closest('button') || e) as HTMLButtonElement).disabled);
  console.log('PROSES disabled:', disabled);
  await page.screenshot({ path: 'test-results/upload-semua-2-sebelum-proses.png' });
  if (process.env.PROSES === '1' && !disabled) {
    await proses.click();
    await page.waitForTimeout(30000);
    await page.screenshot({ path: 'test-results/upload-semua-3-setelah-proses.png' });
  }
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(8000);
  await page.getByText('Pengecekan SLIK', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(2000);
  const t2 = page.getByText(/Klik untuk melengkapi file SLIK/).first();
  await t2.scrollIntoViewIfNeeded(); await t2.click({ force: true });
  await page.waitForTimeout(6000);
  const body = await page.locator('body').innerText();
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/upload-semua-verifikasi.txt', body.slice(body.lastIndexOf('Lengkapi file SLIK')));
});
