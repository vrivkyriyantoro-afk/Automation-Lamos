import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import { DataPekerjaanKeuanganSection } from '../../pages/bucketIdentitas/DataPekerjaanKeuanganSection';

// Probe: kenapa "Pengalaman di industri terkait" kosong setelah diketik? Tidak meninggalkan section (tidak memicu simpan).
const APP_ID = process.env.APPLICATION_ID_IDENTITAS_LENGKAP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe pengalaman', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await new CreditApplicationForm(page).goto(APP_ID, 'identitas_pengecekan');
  const s = await new DataPekerjaanKeuanganSection(page).open();
  const exp = s.monthOfRelatedIndustryExp.locator;
  await exp.scrollIntoViewIfNeeded();
  const log: Record<string, unknown> = {};
  const v = async (k: string) => { log[k] = await exp.inputValue(); };
  await v('awal');
  await exp.click();
  await page.keyboard.type('12', { delay: 120 });
  await v('setelah_keyboard_type');
  await page.waitForTimeout(1500);
  await v('setelah_1.5s');
  await page.screenshot({ path: 'explore-output/identitas/probe-pengalaman-1.png' });
  await exp.press('Tab');
  await page.waitForTimeout(1000);
  await v('setelah_tab');
  // Bandingkan dengan field lain yang sejenis
  const lama = s.companyDuration.locator;
  log.lamaBekerja = await lama.inputValue();
  log.pengalamanAttrs = await exp.evaluate(e => ({ inputMode: (e as HTMLInputElement).inputMode, pattern: (e as HTMLInputElement).pattern, readOnly: (e as HTMLInputElement).readOnly }));
  log.errorTextDekat = await exp.evaluate(e => {
    let r: Element | null = e;
    for (let i = 0; i < 4 && r?.parentElement; i++) r = r.parentElement;
    return (r as HTMLElement)?.innerText?.slice(0, 200);
  });
  fs.writeFileSync('explore-output/identitas/probe-pengalaman-01M83.json', JSON.stringify(log, null, 2));
});
