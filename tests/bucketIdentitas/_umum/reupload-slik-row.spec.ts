import { test } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../../../pages/base/LoginPage';

// MENGUBAH DATA SIT: hapus semua file (.txt dan .pdf) satu entitas di modal "Kelola file SLIK", upload ulang, Simpan, lalu buka ulang modal untuk verifikasi.
// Env: BARIS (default 4), TXT, PDF.
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z'}/create?bucket=identitas_pengecekan&debtorType=individual`;
const BARIS = Number(process.env.BARIS || 4);
const TXT = path.resolve(process.env.TXT || 'fixtures/slik/slik-penjamin/NIK_3373041608960002.txt');
const PDF = path.resolve(process.env.PDF || 'fixtures/files/dummy-identitas.pdf');

test('Hapus semua file SLIK satu entitas lalu upload ulang', async ({ page }) => {
  test.setTimeout(180000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(8000);
  const openModal = async () => {
    const trigger = page.getByText(/Klik untuk melengkapi file SLIK/).first();
    await page.getByText('Pengecekan SLIK', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(2000);
    await trigger.scrollIntoViewIfNeeded(); await trigger.click({ force: true });
    await page.waitForTimeout(4000);
  };
  await openModal();
  const ROWS = (process.env.ROWS || `${BARIS}:fixtures/slik/slik-penjamin/NIK_3373041608960002.txt`).split(',').map(x => x.split(':'));
  for (const [r, txt] of ROWS) { const row = Number(r);
  await page.getByText('Kelola file', { exact: true }).nth(row - 1).click({ force: true });
  await page.waitForTimeout(2500);

  // Hapus semua kartu file: klik X (button tanpa title) pada nama file yang ada
  for (const nama of [/^NIK_.*\.txt$|^NPWP_.*\.txt$/, /\.pdf$/]) {
    const el = page.getByText(nama).last();
    if (await el.count()) {
      await el.evaluate(e => { let n = e as HTMLElement; for (let i = 0; i < 5 && n.parentElement; i++) { n = n.parentElement; const b = Array.from(n.querySelectorAll('button')).find(x => !x.getAttribute('title')); if (b) { (b as HTMLElement).click(); return; } } });
      await page.waitForTimeout(1500);
    }
  }
  await page.screenshot({ path: 'test-results/reupload-1-kosong.png' });

  const pick = page.getByText('Klik untuk pilih file');
  const [c1] = await Promise.all([page.waitForEvent('filechooser'), pick.nth(await pick.count() - 2).click({ force: true })]);
  await c1.setFiles(path.resolve(txt)); await page.waitForTimeout(3000);
  const [c2] = await Promise.all([page.waitForEvent('filechooser'), pick.nth(await pick.count() - 1).click({ force: true })]);
  await c2.setFiles(PDF); await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/reupload-2-terisi.png' });

  await page.getByText('Simpan', { exact: true }).last().click();
  await page.waitForTimeout(15000);
  }
  await page.screenshot({ path: 'test-results/reupload-3-setelah-simpan.png' });
  // Env PROSES=1: klik tombol "Proses file .txt" di bawah modal "Lengkapi file SLIK" (memulai impor, mengubah data SIT)
  if (process.env.PROSES === '1') {
    const proses = page.getByText('Proses file .txt', { exact: true }).last();
    await proses.scrollIntoViewIfNeeded();
    const info = async () => proses.evaluate(e => { let n = e as HTMLElement; const b = (n.closest('button') || n) as HTMLButtonElement; return { disabled: b.disabled, cls: b.className.slice(0, 200) }; });
    console.log('PROSES sebelum klik:', JSON.stringify(await info()));
    await page.screenshot({ path: 'test-results/reupload-3a-sebelum-proses.png' });
    await proses.click({ force: true });
    console.log('PROSES sesudah klik:', JSON.stringify(await info()));
    await page.waitForTimeout(20000);
    await page.screenshot({ path: 'test-results/reupload-3b-setelah-proses.png' });
  }

  // Verifikasi: reload halaman dan buka ulang modal
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(8000);
  await openModal();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'test-results/reupload-4-verifikasi.png' });
  const body = await page.locator('body').innerText();
  fs.writeFileSync('explore-output/identitas/reupload-verifikasi.txt', body.slice(body.lastIndexOf('Lengkapi file SLIK')));
});
