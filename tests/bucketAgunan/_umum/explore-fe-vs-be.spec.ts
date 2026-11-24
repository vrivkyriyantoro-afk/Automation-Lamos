import { test } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_BADAN_USAHA,
  APP_ID_PERORANGAN,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  readListboxOptions,
  snapshotComboboxes,
  tipeKepemilikanCombobox,
} from '../_shared/agunanModal';

/**
 * Menentukan layer penyebab tiap temuan: FE atau BE.
 *
 * Metode: tangkap seluruh response API selama interaksi, lalu bandingkan
 * isi payload BE dengan apa yang dirender FE.
 *   - BE mengirim data, FE tidak menampilkan  -> defect FE
 *   - BE tidak mengirim data                  -> defect BE
 */

type Captured = { url: string; status: number; body: string };

function pasangPenangkap(page: import('@playwright/test').Page, bucket: Captured[]) {
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/|\/v\d+\//i.test(url)) return;
    if (/\.(js|css|png|jpg|svg|woff2?)(\?|$)/i.test(url)) return;
    try {
      const body = await res.text();
      bucket.push({ url, status: res.status(), body: body.slice(0, 20000) });
    } catch {
      /* response sudah tidak dapat dibaca */
    }
  });
}

/** Cetak response yang isinya memuat salah satu kata kunci. */
function laporkan(tag: string, bucket: Captured[], kunci: RegExp) {
  console.log(`\n########## ${tag} ##########`);
  const cocok = bucket.filter((c) => kunci.test(c.body) || kunci.test(c.url));
  if (cocok.length === 0) {
    console.log(`TIDAK ADA response yang memuat pola ${kunci}`);
    console.log(`URL yang tertangkap (${bucket.length}):`);
    bucket.slice(-12).forEach((c) => console.log(`  [${c.status}] ${c.url.slice(0, 150)}`));
    return;
  }
  for (const c of cocok.slice(-6)) {
    console.log(`\n[${c.status}] ${c.url.slice(0, 160)}`);
    console.log(c.body.slice(0, 2500));
  }
}

test('FE-vs-BE 01: kode kategori 001 vs 003 pada debitur Badan Usaha', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 1000 });
  const captured: Captured[] = [];
  pasangPenangkap(page, captured);

  await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
  await openStep3Kepemilikan(page, 'FEBE01');

  const combobox = page.locator('[role="combobox"]:visible').filter({ hasText: /kategori pemilik|pilih kategori/i }).first();
  await combobox.click();
  await page.waitForTimeout(2000);

  const opsiFE = await readListboxOptions(page);
  console.log('FE merender opsi:', JSON.stringify(opsiFE));

  // Apakah BE mengirim kode 003 tapi FE menyaringnya?
  laporkan('RESPONSE memuat kategori kepemilikan', captured, /ownership|kepemilikan|collateral-owner|category/i);
});

test('FE-vs-BE 02: dropdown Hubungan dengan debitur pada kategori 006', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 1000 });
  const captured: Captured[] = [];
  pasangPenangkap(page, captured);

  await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
  await openStep3Kepemilikan(page, 'FEBE02');

  // Pembanding: kategori 005 (dropdown Hubungan TAMPIL)
  await pilihKategori(page, '005');
  console.log('Combobox pada 005:', JSON.stringify(await snapshotComboboxes(page)));
  const batas005 = captured.length;

  // Kategori 006 (dropdown Hubungan TIDAK tampil)
  await pilihKategori(page, '006');
  const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama|nama pengurus/i }).first();
  if (await dropdownNama.isVisible().catch(() => false)) {
    await dropdownNama.click();
    await page.waitForTimeout(1500);
    await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
      .first().click({ timeout: 15000 });
    await page.waitForTimeout(2500);
  }
  console.log('Combobox pada 006:', JSON.stringify(await snapshotComboboxes(page)));

  // Apakah BE mengirim daftar opsi "hubungan" untuk kategori 006?
  laporkan('RESPONSE setelah pilih 006', captured.slice(batas005), /hubungan|relation|relationship/i);
});

test('FE-vs-BE 03: label tipe kepemilikan Individu vs Perorangan', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 1000 });
  const captured: Captured[] = [];
  pasangPenangkap(page, captured);

  await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
  await openStep3Kepemilikan(page, 'FEBE03');

  await pilihKategori(page, '005');
  const tipe = tipeKepemilikanCombobox(page);
  await tipe.click();
  await page.waitForTimeout(1500);

  const opsiFE = await readListboxOptions(page);
  console.log('FE merender label tipe kepemilikan:', JSON.stringify(opsiFE));

  // Apakah label "Individu" datang dari BE, atau di-hardcode di FE?
  laporkan('RESPONSE memuat label tipe kepemilikan', captured, /individu|perorangan|ownership.?type|badan usaha/i);
});
