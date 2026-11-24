import { test } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import { DataPribadiTambahanSection } from '../../pages/bucketIdentitas/DataPribadiTambahanSection';
import { DataPekerjaanKeuanganSection } from '../../pages/bucketIdentitas/DataPekerjaanKeuanganSection';

// Probe READ-ONLY: dump struktur combobox & field 'Pengalaman' di tiga section (tanpa mengisi/menyimpan)
const APP_ID = process.env.APPLICATION_ID_IDENTITAS_LENGKAP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('probe dropdown', async ({ page }) => {
  test.setTimeout(180000);
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  const app = new CreditApplicationForm(page);
  await app.goto(APP_ID, 'identitas_pengecekan');

  const dump = async (name: string, open: () => Promise<void>) => {
    await open();
    await page.waitForTimeout(1500);
    return page.evaluate(() => {
      const cbs = Array.from(document.querySelectorAll('[role="combobox"]')).map(c => {
        const r = (c as HTMLElement).getBoundingClientRect();
        return {
          id: c.id, disabled: c.getAttribute('aria-disabled'), expanded: c.getAttribute('aria-expanded'),
          visible: r.width > 0 && r.height > 0,
          text: (c.textContent || '').trim().slice(0, 40),
          placeholderTid: c.querySelector('[data-testid="dropdownsearch-placeholder"]')?.textContent?.trim() ?? null,
        };
      }).filter(x => x.visible);
      const exp = document.querySelector('input[name="monthOfRelatedIndustryExp"]') as HTMLInputElement | null;
      return { cbs, exp: exp ? { value: exp.value, disabled: exp.disabled, type: exp.type, max: exp.max, maxLength: exp.maxLength } : null };
    });
  };

  const out: Record<string, unknown> = {};
  out.tambahan = await dump('tambahan', async () => { await new DataPribadiTambahanSection(page).open(); });
  out.pekerjaan = await dump('pekerjaan', async () => { await new DataPekerjaanKeuanganSection(page).open(); });
  await page.locator('aside button', { hasText: 'LBU' }).click();
  await page.waitForTimeout(2000);
  out.lbu = await page.evaluate(() => Array.from(document.querySelectorAll('[role="combobox"]')).map(c => {
    const r = (c as HTMLElement).getBoundingClientRect();
    return { id: c.id, visible: r.width > 0, text: (c.textContent || '').trim().slice(0, 40), disabled: c.getAttribute('aria-disabled') };
  }).filter(x => x.visible));
  fs.mkdirSync('explore-output/identitas', { recursive: true });
  fs.writeFileSync('explore-output/identitas/probe-dropdown-01M83.json', JSON.stringify(out, null, 2));
});
