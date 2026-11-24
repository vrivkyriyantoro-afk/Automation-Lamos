import { test, Locator } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/base/LoginPage';
import { CreditApplicationForm } from '../../pages/base/BucketSection';
import { DataPenjaminForm } from '../../pages/buckets/identitas/PenjaminForms';

// Probe READ-ONLY #3: (C) centang radio lalu TUNGGU lama baru klik organ; (D) pilih organ DULU baru centang radio.
// Modal selalu dibatalkan, tidak ada yang disimpan.
const APP_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe organ urutan 2', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 1280, height: 1800 }); // dugaan: popup di sisi atas + guliran otomatis Playwright menutupnya
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await new CreditApplicationForm(page).goto(APP_ID, 'identitas_pengecekan');
  const corp = new DataPenjaminForm(page, 0);
  await corp.open();
  await page.waitForTimeout(3000);
  const out: Record<string, unknown> = {};

  const listboxes = () => page.evaluate(() => Array.from(document.querySelectorAll('[role="listbox"]')).map(l => ({
    id: l.id, visible: (l as HTMLElement).getBoundingClientRect().width > 0, text: (l as HTMLElement).innerText.slice(0, 120),
  })));
  const radio = (root: Locator) => root.locator('input[name="tipeOrganBadanUsaha"]');

  // C: radio, tunggu 6 detik, klik organ
  let modal = await corp.openTambahPengurus();
  await page.waitForTimeout(1500);
  await radio(modal.root).first().check({ force: true });
  await page.waitForTimeout(6000);
  let cb = modal.root.locator('[role="combobox"][id^="organBadanUsaha"]').first();
  await cb.click();
  await page.waitForTimeout(4000);
  out.C_radio_tunggu6s = { id: await cb.getAttribute('id'), expanded: await cb.getAttribute('aria-expanded'), listbox: await listboxes() };
  await page.screenshot({ path: 'explore-output/identitas/probe-organ3-C.png' });
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-organ3-01M83.json', JSON.stringify(out, null, 2)); // tulis bertahap
  await page.keyboard.press('Escape');
  await modal.batalkan().catch(() => {});
  await page.waitForTimeout(1500);

  // D: pilih organ dulu, baru centang radio
  modal = await corp.openTambahPengurus();
  await page.waitForTimeout(1500);
  cb = modal.root.locator('[role="combobox"][id^="organBadanUsaha"]').first();
  await cb.click();
  const opsi = page.locator('[role="listbox"]:visible li button').filter({ hasText: /^\s*Pemegang Saham\s*$/ }).first();
  await opsi.waitFor({ state: 'visible', timeout: 8000 });
  // listbox di modal bisa di luar viewport -> klik biasa menggantung; fallback klik via DOM (seperti selectWilayah)
  await opsi.click({ timeout: 5000 }).catch(() => opsi.dispatchEvent('click', undefined, { timeout: 5000 }));
  await page.waitForTimeout(1000);
  const textSebelumRadio = ((await modal.root.locator('[role="combobox"][id^="organBadanUsaha"]').first().innerText()) || '').trim();
  await radio(modal.root).first().check({ force: true });
  await page.waitForTimeout(2500);
  const cb2 = modal.root.locator('[role="combobox"][id^="organBadanUsaha"]').first();
  out.D_organ_dulu = {
    organSebelumRadio: textSebelumRadio,
    organSetelahRadio: ((await cb2.innerText()) || '').trim(),
    radioChecked: await radio(modal.root).evaluateAll(els => els.map(e => (e as HTMLInputElement).checked)),
    kewarganegaraanTampil: await modal.root.locator('input[type="radio"]').count(),
  };
  await page.screenshot({ path: 'explore-output/identitas/probe-organ3-D.png' });
  await modal.batalkan().catch(() => {});

  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-organ3-01M83.json', JSON.stringify(out, null, 2));
});
