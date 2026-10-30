import { test, expect, Locator } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../pages/LoginPage';
import { BucketSection, CreditApplicationForm } from '../pages/components/BucketSection';
import * as identitas from '../pages/bucketIdentitas/sections';
import * as strukturKredit from '../pages/bucketStrukturKredit/sections';
import * as penilaianKelayakan from '../pages/bucketPenilaianKelayakan/sections';
import * as dataUsaha from '../pages/bucketDataUsaha/sections';
import * as analisaKeuangan from '../pages/bucketAnalisaKeuangan/sections';
import * as legalRiskCompliance from '../pages/bucketLegalRiskCompliance/sections';
import * as covenantTbo from '../pages/bucketCovenantTBO/sections';
import * as penyimpangan from '../pages/bucketPenyimpanganPihakTerkait/sections';
import * as catatanAnda from '../pages/bucketCatatanAnda/sections';

/**
 * Smoke test read-only: setiap locator di page object hasil generate harus ditemukan di aplikasi.
 * Tidak mengisi / menyimpan apa pun.
 *
 *   APPLICATION_ID=<id> npx playwright test tests/sections-locator-smoke.spec.ts --project=chromium
 */
const APPLICATION_ID = process.env.APPLICATION_ID || '01M483P7DDHBV41Z5QPV0FM8Q9';

const modules = { identitas, strukturKredit, penilaianKelayakan, dataUsaha, analisaKeuangan, legalRiskCompliance, covenantTbo, penyimpangan, catatanAnda };

type SectionCtor = new (...args: any[]) => BucketSection;
const sectionClasses = Object.entries(modules).flatMap(([mod, exports]) =>
  Object.entries(exports as Record<string, unknown>)
    .filter(([, v]) => typeof v === 'function' && (v as Function).prototype instanceof BucketSection)
    .map(([name, ctor]) => ({ mod, name, ctor: ctor as SectionCtor })));

/** Ambil semua getter control (yang punya .locator / .container / .box) dari prototype class */
function controlGetters(obj: object): string[] {
  const names: string[] = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== BucketSection.prototype) {
    for (const [k, d] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (d.get && k !== 'root' && k !== 'header') names.push(k);
    }
    proto = Object.getPrototypeOf(proto);
  }
  return names;
}

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
});

for (const { mod, name, ctor } of sectionClasses) {
  test(`${mod} › ${name}: semua locator ditemukan`, async ({ page }) => {
    test.setTimeout(120000);
    const section = new ctor(page);
    await new CreditApplicationForm(page).goto(APPLICATION_ID, section.bucket);
    await section.open();

    const missing: string[] = [];
    for (const getter of controlGetters(section)) {
      const control = (section as any)[getter];
      const loc: Locator | undefined = control?.container ?? control?.locator;
      if (!loc) continue;
      // field bisa masih skeleton loading -> tunggu sampai ter-attach
      const found = await loc.first().waitFor({ state: 'attached', timeout: 15000 }).then(() => true, () => false);
      if (!found) missing.push(getter);
    }
    expect(missing, `locator tidak ditemukan di section "${section.title}"`).toEqual([]);
  });
}
