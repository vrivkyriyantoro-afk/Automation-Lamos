import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import { DataPenjaminForm } from '../../pages/bucketIdentitas/PenjaminForms';

// Probe READ-ONLY #2: bandingkan urutan (A) langsung klik organ vs (B) centang radio "Perseorangan" dulu, lalu klik organ.
// Modal selalu dibatalkan, tidak ada yang disimpan.
const APP_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe organ urutan', async ({ page }) => {
  test.setTimeout(300000);
  const net: string[] = [];
  page.on('response', r => {
    if (/lossvc/.test(r.url()) && !/auth|session/.test(r.url()) && (r.request().method() !== 'GET' || r.status() >= 400))
      net.push(`${r.request().method()} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 110)}`);
  });
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await new CreditApplicationForm(page).goto(APP_ID, 'identitas_pengecekan');
  const corp = new DataPenjaminForm(page, 0);
  await corp.open();
  await page.waitForTimeout(3000);
  const out: Record<string, unknown> = {};

  const state = async (modalRoot: ReturnType<Awaited<ReturnType<DataPenjaminForm['openTambahPengurus']>>['root'] extends infer T ? () => T : never>) => 0 as unknown as never; // (tidak dipakai)
  void state;

  const dump = async (label: string, root: import('@playwright/test').Locator, radioFirst: boolean) => {
    const radios = await root.locator('input[name="tipeOrganBadanUsaha"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).checked));
    const cbs = root.locator('[role="combobox"][id^="organBadanUsaha"]');
    const info: Record<string, unknown> = { radioFirst, radiosAwal: radios, jumlahComboOrgan: await cbs.count() };
    if (radioFirst) {
      await root.locator('input[name="tipeOrganBadanUsaha"]').first().check({ force: true });
      await page.waitForTimeout(1500);
      info.radiosSetelahCek = await root.locator('input[name="tipeOrganBadanUsaha"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).checked));
      info.jumlahComboOrganSetelahCek = await cbs.count();
      info.idComboSetelahCek = await cbs.first().getAttribute('id');
    }
    const cb = cbs.first();
    await cb.scrollIntoViewIfNeeded();
    await cb.click();
    await page.waitForTimeout(3000);
    info.expandedSetelahKlik = await cb.getAttribute('aria-expanded');
    info.listbox = await page.evaluate(() => Array.from(document.querySelectorAll('[role="listbox"]')).map(l => ({
      id: l.id, visible: (l as HTMLElement).getBoundingClientRect().width > 0, text: (l as HTMLElement).innerText.slice(0, 120),
    })));
    await page.screenshot({ path: `explore-output/identitas/probe-organ2-${label}.png` });
    await page.keyboard.press('Escape');
    out[label] = info;
  };

  // A: langsung klik organ
  let modal = await corp.openTambahPengurus();
  await page.waitForTimeout(1500);
  await dump('A_langsung', modal.root, false);
  await modal.batalkan().catch(() => {});
  await page.waitForTimeout(1500);

  // B: centang radio dulu (seperti spec)
  modal = await corp.openTambahPengurus();
  await page.waitForTimeout(1500);
  await dump('B_radio_dulu', modal.root, true);
  await modal.batalkan().catch(() => {});

  out.network = net;
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-organ2-01M83.json', JSON.stringify(out, null, 2));
});
