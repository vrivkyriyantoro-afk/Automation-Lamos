import { test } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';
import { isiStep1Tanah, isiStep2Tanah, statusStep } from './bucketAgunan/helpers/greenFlowTanah';
const ID = '01M79GW1XYEQAK97TM803HFY8F';
test('gf', async ({ page }) => {
  test.setTimeout(200000);
  const l = new LoginPage(page); await l.goto(); await l.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!); await l.expectLoginSuccess();
  await page.goto(`https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${ID}/create?bucket=agunan&debtorType=individual`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first().click({ timeout: 45000 });
  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const lb = page.locator('[role="listbox"]:visible, ul:visible').first();
  await lb.locator('li button, li').first().waitFor({ timeout: 15000 });
  await lb.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();
  await page.locator('input[placeholder*="nomor" i]').first().fill('NONEXISTENT_DUMMY_CLS_' + Date.now());
  await page.locator('button:has-text("Cari")').first().click();
  await page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first().click();
  await page.waitForTimeout(2500);
  try { await isiStep1Tanah(page); } catch (e: any) { console.log('STEP1 ERR', String(e.message).split('\n').slice(0, 5).join(' / ')); }
  await page.waitForTimeout(1500);
  console.log('S1:', await statusStep(page, /Informasi umum agunan/i));
  try { await isiStep2Tanah(page); } catch (e: any) { console.log('STEP2 ERR', String(e.message).split('\n').slice(0, 5).join(' / ')); }
  await page.waitForTimeout(1500);
  console.log('S1 akhir:', await statusStep(page, /Informasi umum agunan/i), '| S2:', await statusStep(page, /Data tambahan agunan/i), '| S3:', await statusStep(page, /Informasi kepemilikan/i));
  const simpan = page.locator('button').filter({ hasText: /^Simpan$/ }).last();
  console.log('Simpan disabled:', await simpan.isDisabled());
  await page.screenshot({ path: 'explore-output/agunan/gf-after.png' });
});
