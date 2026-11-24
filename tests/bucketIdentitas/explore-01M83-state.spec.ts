import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/base/LoginPage';

// Probe READ-ONLY: petakan status bucket Identitas & Pengecekan untuk App ID 01M83AP5...
const APP_ID = process.env.PROBE_APP_ID || '01M83AP5FKPHB1D3E2QS8P015Z';
const TARGET = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${APP_ID}/create?bucket=identitas_pengecekan&debtorType=individual`;
const OUT = `explore-output/identitas/${APP_ID}`;

test('probe state identitas_pengecekan', async ({ page }) => {
  test.setTimeout(300000);
  fs.mkdirSync(OUT, { recursive: true });
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const report: any = { url: page.url(), sections: [] };
  await page.screenshot({ path: `${OUT}/00-landing.png`, fullPage: true });
  report.bucketNav = await page.evaluate(() => (document.body.innerText || '').slice(0, 3000));

  const sideButtons = page.locator('aside button');
  const n = await sideButtons.count();
  const names: string[] = [];
  for (let i = 0; i < n; i++) names.push(((await sideButtons.nth(i).innerText()) || '').trim());
  report.sidebar = names;

  for (let i = 0; i < n; i++) {
    const name = names[i];
    try {
      await sideButtons.nth(i).click();
      await page.waitForTimeout(2500);
      const fields = await page.evaluate(() => {
        const out: any[] = [];
        document.querySelectorAll('[data-testid="input-label"]').forEach(l => {
          let row: Element | null = l;
          for (let k = 0; k < 4 && row?.parentElement; k++) row = row.parentElement;
          const input = row?.querySelector('input, textarea, select') as HTMLInputElement | null;
          const err = row?.querySelector('[class*="error"], [role="alert"]')?.textContent?.trim();
          out.push({
            label: (l.textContent || '').trim(),
            value: input ? (input.value || input.getAttribute('placeholder') && '' ) : (row?.textContent || '').replace((l.textContent || ''), '').trim().slice(0, 80),
            disabled: input?.disabled ?? null,
            error: err || null,
          });
        });
        return out;
      });
      const main = await page.evaluate(() => ((document.querySelector('main') as HTMLElement)?.innerText || '').slice(0, 2500));
      report.sections.push({ name, fields, main });
      await page.screenshot({ path: `${OUT}/${String(i + 1).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.png`, fullPage: true });
    } catch (e: any) {
      report.sections.push({ name, error: String(e?.message || e).slice(0, 300) });
    }
  }
  fs.writeFileSync(`${OUT}/state.json`, JSON.stringify(report, null, 2));
});
