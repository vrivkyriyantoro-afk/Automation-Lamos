import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/base/LoginPage';
import { CreditApplicationForm } from '../../pages/base/BucketSection';
import { DataPenjaminForm } from '../../pages/buckets/identitas/PenjaminForms';

// Probe READ-ONLY: dropdown "Organ badan usaha" di modal pengurus/pemegang saham (tidak memilih apa pun, modal dibatalkan)
const APP_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe organ badan usaha', async ({ page }) => {
  test.setTimeout(240000);
  const net: string[] = [];
  page.on('response', r => {
    const u = r.url();
    if (/lossvc|master|reference|organ|lookup/i.test(u) && !/auth|session/.test(u)) net.push(`${r.request().method()} ${r.status()} ${u.replace(/^https?:\/\/[^/]+/, '').slice(0, 130)}`);
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
  const modal = await corp.openTambahPengurus();
  await page.waitForTimeout(1500);
  net.length = 0;

  const cb = modal.root.locator('[role="combobox"][id^="organBadanUsaha"]').first();
  out.combobox = { ada: await cb.count(), id: await cb.getAttribute('id'), text: (await cb.innerText()).trim(), disabled: await cb.getAttribute('aria-disabled') };
  await cb.scrollIntoViewIfNeeded();
  await cb.click();
  await page.waitForTimeout(4000);
  out.listboxes = await page.evaluate(() => Array.from(document.querySelectorAll('[role="listbox"]')).map(l => {
    const r = (l as HTMLElement).getBoundingClientRect();
    return { id: l.id, testid: l.getAttribute('data-testid'), visible: r.width > 0 && r.height > 0, text: (l as HTMLElement).innerText.slice(0, 300), html: l.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 600) };
  }));
  out.expanded = await cb.getAttribute('aria-expanded');
  out.searchInput = await cb.locator('[data-testid="dropdownsearch-input-search"]').evaluateAll(els => els.map(e => ({ tag: e.tagName, readOnly: (e as HTMLInputElement).readOnly, disabled: (e as HTMLInputElement).disabled })));
  out.network = [...net];
  await page.screenshot({ path: 'explore-output/identitas/probe-organ.png' });
  await page.keyboard.press('Escape');
  await modal.batalkan().catch(() => {});
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-organ-01M83.json', JSON.stringify(out, null, 2));
});
