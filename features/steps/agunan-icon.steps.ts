import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { Given, When, Then } from './fixtures';

// Step untuk S2CML-6018 (Validasi ikon kartu agunan). Locator ada di pages/buckets/agunan/DaftarAgunanSection.ts.
// Debitur uji: env DEBITUR_TARGET (default = App ID perseorangan yang sama dengan spec TypeScript).
const APP_ID = () => process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const EVIDEN_DIR = path.resolve('tests/bucketAgunan/S2CML-6018/eviden/bdd');
const simpan = (tc: string) => {
  fs.mkdirSync(EVIDEN_DIR, { recursive: true });
  return path.join(EVIDEN_DIR, `${tc}-step-1.png`);
};

Given('saya membuka bucket Agunan pada debitur perseorangan uji', async ({ daftarAgunan }) => {
  await daftarAgunan.bukaBucketAgunan(APP_ID());
});

When('saya melihat kartu agunan {string}', async ({ daftarAgunan, ctx }, label: string) => {
  ctx.kartu = daftarAgunan.kartu(label);
  await expect(ctx.kartu).toBeVisible({ timeout: 15000 });
  await ctx.kartu.scrollIntoViewIfNeeded();
});

Then('ikon kartu memakai asset {string}', async ({ daftarAgunan, ctx }, asset: string) => {
  const ikon = daftarAgunan.ikon(ctx.kartu!);
  await expect(ikon).toBeVisible({ timeout: 10000 });
  expect(await ikon.getAttribute('src')).toContain(`/assets/agunan-image/${asset}`);
});

Then('alt text ikon memuat {string}', async ({ daftarAgunan, ctx }, teks: string) => {
  const alt = await daftarAgunan.ikon(ctx.kartu!).getAttribute('alt');
  expect(alt).toMatch(new RegExp(teks, 'i'));
});

Then('bukti kartu agunan {string} tersimpan', async ({ ctx }, tc: string) => {
  await ctx.kartu!.screenshot({ path: simpan(tc) });
});

When('saya mengambil asset ikon agunan dari frontend', async () => {
  // Pengambilan dilakukan pada langkah verifikasi (satu request per asset).
});

Then('asset ikon {string} tersedia sebagai SVG valid', async ({ daftarAgunan }, daftar: string) => {
  for (const nama of daftar.split(',').map((s) => s.trim()).filter(Boolean)) {
    const { status, body } = await daftarAgunan.ambilAsset(nama);
    expect(status, `Asset ${nama} harus status 200`).toBe(200);
    expect(body, `Asset ${nama} harus markup SVG valid`).toContain('<svg');
    expect(body.length, `Ukuran SVG ${nama} harus memadai`).toBeGreaterThan(1000);
  }
});

Then('bukti matriks ikon {string} tersimpan', async ({ daftarAgunan }, tc: string) => {
  const galeri = await daftarAgunan.tampilkanMatriksIkon();
  await galeri.screenshot({ path: simpan(tc) });
  await daftarAgunan.sembunyikanMatriksIkon();
});

When('saya melihat Daftar agunan', async ({ daftarAgunan }) => {
  await daftarAgunan.gulirKeDaftarAgunan();
});

Then('setiap ikon kartu berukuran {int} x {int} piksel dan memakai object-contain', async ({ daftarAgunan }, w: number, h: number) => {
  const ikon = daftarAgunan.semuaIkonKartu();
  // Kartu dirender bertahap setelah accordion terbuka: tunggu ikon pertama muncul sebelum menghitung.
  await expect(ikon.first(), 'Harus ada minimal 1 ikon kartu agunan yang ter-render').toBeVisible({ timeout: 20000 });
  const jumlah = await ikon.count();
  expect(jumlah, 'Harus ada minimal 1 ikon kartu agunan yang ter-render').toBeGreaterThanOrEqual(1);
  for (let i = 0; i < jumlah; i++) {
    const img = ikon.nth(i);
    await expect(img).toBeVisible();
    expect(await img.getAttribute('width'), `Width ikon harus ${w}px sesuai Figma`).toBe(String(w));
    expect(await img.getAttribute('height'), `Height ikon harus ${h}px sesuai Figma`).toBe(String(h));
    expect(await img.getAttribute('class')).toContain('object-contain');
  }
});

Then('bukti daftar agunan {string} tersimpan', async ({ page, daftarAgunan }, tc: string) => {
  await daftarAgunan.kartu('F041401 - Reksadana').scrollIntoViewIfNeeded();
  await page.screenshot({ path: simpan(tc), fullPage: false });
});
