import { test } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_PERORANGAN,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihTipeKepemilikan,
} from '../_shared/agunanModal';

/**
 * BUG-01: tentukan apakah placeholder "Nomor telepon PIC" berasal dari BE
 * (master data / config) atau di-hardcode di bundle FE.
 */
test('Asal placeholder "Nomor telepon PIC"', async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 1000 });

  const apiMemuat: string[] = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/|\/v\d+\//i.test(url)) return;
    if (/\.(js|css|png|jpg|svg|woff2?)(\?|$)/i.test(url)) return;
    try {
      const body = await res.text();
      if (/Masukkan nomor|placeholder/i.test(body)) {
        apiMemuat.push(`[${res.status()}] ${url.slice(0, 140)}\n${body.slice(0, 800)}`);
      }
    } catch { /* abaikan */ }
  });

  // Bundle JS yang memuat string placeholder -> bukti hardcode FE
  const bundleMemuat: string[] = [];
  page.on('response', async (res) => {
    if (!/\.js(\?|$)/i.test(res.url())) return;
    try {
      const body = await res.text();
      if (body.includes('Masukkan nomor HP badan usaha')) {
        const idx = body.indexOf('Masukkan nomor HP badan usaha');
        bundleMemuat.push(`${res.url().slice(0, 120)}\n  ...${body.slice(Math.max(0, idx - 260), idx + 160)}...`);
      }
    } catch { /* abaikan */ }
  });

  await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
  await openStep3Kepemilikan(page, 'PLACEHOLDER');
  await pilihKategori(page, '005');
  await pilihTipeKepemilikan(page, 'Non Individu');
  await page.waitForTimeout(2000);

  console.log(`\n=== RESPONSE API memuat placeholder (${apiMemuat.length}) ===`);
  apiMemuat.slice(0, 3).forEach((t) => console.log(t + '\n'));
  if (apiMemuat.length === 0) console.log('TIDAK ADA — placeholder tidak datang dari API.');

  console.log(`\n=== BUNDLE JS memuat string placeholder (${bundleMemuat.length}) ===`);
  bundleMemuat.slice(0, 3).forEach((t) => console.log(t + '\n'));
  if (bundleMemuat.length === 0) console.log('TIDAK ADA di bundle yang termuat pada sesi ini.');
});
