import { test } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_PERORANGAN,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihTipeKepemilikan,
  snapshotComboboxes,
  snapshotInputs,
} from './helpers/agunanModal';

/** Cek apakah Form SLIK Check (S2CML-4949) sudah dirender di build SIT. */
test('Explore: apakah Form SLIK Check ada di Step 3 kategori 005 / 008', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 1000 });
  await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
  await openStep3Kepemilikan(page, 'EXPLORE_SLIK');

  async function dump(tag: string) {
    const combos = await snapshotComboboxes(page);
    const inputs = await snapshotInputs(page);
    const labels = await page.locator('label:visible').allInnerTexts();
    const fileInputs = await page.locator('input[type="file"]').count();
    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const adaSlik = /slik/i.test(bodyText);
    const adaUpload = /unggah|upload|pilih file|seret/i.test(bodyText);

    console.log(`DUMP_${tag}=` + JSON.stringify({
      combos,
      labels: labels.map(l => l.trim()).filter(Boolean),
      inputs,
      fileInputs,
      adaSlik,
      adaUpload,
    }));
  }

  for (const kode of ['005', '008']) {
    const combo = await pilihKategori(page, kode);
    if (!combo) {
      console.log(`KATEGORI_${kode}=tidak tersedia`);
      continue;
    }
    await dump(`KATEGORI_${kode}`);

    for (const label of ['Individu', 'Non Individu'] as const) {
      const tipe = await pilihTipeKepemilikan(page, label);
      if (!tipe) {
        console.log(`TIPE_${kode}_${label}=tidak tersedia`);
        continue;
      }
      await dump(`${kode}_${label.replace(/\s+/g, '')}`);
      await page.screenshot({ path: `explore-output/probes/slik-${kode}-${label.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });
    }
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
});
