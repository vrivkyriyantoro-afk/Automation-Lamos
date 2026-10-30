import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';

const TARGET = 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M483P7DDHBV41Z5QPV0FM8Q9/create?bucket=identitas_pengecekan&debtorType=individual';

test('probe skeleton', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET, { waitUntil: 'domcontentloaded' });
  await page.locator('aside button', { hasText: 'Data pribadi tambahan' }).click();
  const snaps: string[] = [];
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(400);
    snaps.push(await page.evaluate(() => {
      const lbl = Array.from(document.querySelectorAll('[data-testid="input-label"]')).find(l => /Pendidikan terakhir/.test(l.textContent || ''));
      let row: Element | null | undefined = lbl;
      for (let k = 0; k < 4 && row?.parentElement; k++) row = row.parentElement;
      return row ? row.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 1500) : 'no label';
    }));
  }
  fs.writeFileSync('explore-output/probe-skeleton.txt', snaps.join('\n\n=====\n\n'));
});
