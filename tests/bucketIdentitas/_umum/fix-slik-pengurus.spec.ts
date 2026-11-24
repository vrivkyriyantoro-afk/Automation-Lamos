import { test } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../../../pages/base/LoginPage';

// Mengganti file .txt SLIK satu entitas lewat modal "Kelola file SLIK" (mengubah data SIT).
// Env: BARIS (nomor urut baris di modal), TXT (path file .txt pengganti).
const URL = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${process.env.APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z'}/create?bucket=identitas_pengecekan&debtorType=individual`;
const BARIS = Number(process.env.BARIS || 7);
const TXT = path.resolve(process.env.TXT || 'exports/slik/slik-penjamin/NIK_3302265910820003.txt');

test('Ganti file SLIK .txt satu entitas', async ({ page }) => {
  test.setTimeout(120000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(URL, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(7000);
  const trigger = page.getByText(/Klik untuk melengkapi file SLIK/).first();
  await page.getByText('Pengecekan SLIK', { exact: true }).last().click({ force: true });
  await page.waitForTimeout(2000);
  await trigger.scrollIntoViewIfNeeded(); await trigger.click({ force: true });
  await page.waitForTimeout(3000);

  // Baris entitas = nomor urut pada modal (7 = PIPIT NILA WARDANI); tombol Kelola file ke-N
  await page.getByText('Kelola file', { exact: true }).nth(BARIS - 1).click({ force: true });
  await page.waitForTimeout(2000);

  // Dialog Kelola file SLIK: tombol pilih file .txt = yang kedua dari belakang (terakhir = .pdf)
  const pick = page.getByText('Klik untuk pilih file');
  const n = await pick.count();
  console.log('tombol pilih file:', n);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), pick.nth(n - 2).click({ force: true })]);
  await chooser.setFiles(TXT);
  await page.waitForTimeout(3000);
  // Hapus file .txt lama (X pada kartu file lama; ikon X = tombol tanpa atribut title)
  const lama = process.env.TXT_LAMA || 'NIK_3205335802980003.txt';
  const nm = page.getByText(lama, { exact: true }).last();
  const html = await nm.evaluate(e => { let n: HTMLElement = e as HTMLElement; for (let i = 0; i < 3 && n.parentElement; i++) n = n.parentElement; return n.outerHTML.replace(/<path[^>]*><\/path>/g, '<path/>').slice(0, 1800); });
  fs.writeFileSync('explore-output/identitas/slik-card.html', html);
  await nm.evaluate(e => { let n: HTMLElement = e as HTMLElement; for (let i = 0; i < 5 && n.parentElement; i++) { n = n.parentElement; const b = Array.from(n.querySelectorAll('button')).find(x => !x.getAttribute('title')); if (b) { (b as HTMLElement).click(); return; } } });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/slik-fix-dialog.png' });
  await page.getByText('Simpan', { exact: true }).last().click();
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'test-results/slik-fix-after.png' });
  const body = await page.locator('body').innerText();
  fs.writeFileSync('explore-output/identitas/slik-fix-dialog.txt', body.slice(body.lastIndexOf('Lengkapi file SLIK')));
});
