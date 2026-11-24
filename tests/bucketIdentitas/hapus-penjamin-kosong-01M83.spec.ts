import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/base/LoginPage';
import { CreditApplicationForm } from '../../pages/base/BucketSection';
import { DataPenjaminForm } from '../../pages/buckets/identitas/PenjaminForms';

/**
 * Pembersihan: hapus kartu penjamin KOSONG ke-4 yang tidak sengaja dibuat spec penjamin-badan-usaha-lp-01M83
 * (spec menghitung kartu sebelum data selesai dimuat lalu menekan "+ Penjamin" lagi).
 * Pengaman: hanya menghapus bila kartu terakhir benar-benar kosong (nama & nomor KTP kosong) dan jumlah kartu = 4.
 * Penjamin 1-3 tidak disentuh.
 */
const APPLICATION_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';

test('Hapus kartu penjamin kosong ke-4', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 1280, height: 1800 });
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  const app = new CreditApplicationForm(page);
  await app.goto(APPLICATION_ID, 'identitas_pengecekan');
  await new DataPenjaminForm(page, 0).open();

  const tipe = page.locator('[role="combobox"][id^="typeGuarantee"]');
  // tunggu data dimuat & jumlah kartu stabil (3 kali pembacaan sama berturut-turut)
  let prev = -1, stabil = 0;
  for (let i = 0; i < 30 && stabil < 3; i++) {
    await page.waitForTimeout(1000);
    const n = await tipe.count();
    stabil = n === prev && n > 0 ? stabil + 1 : 0;
    prev = n;
  }
  console.log('Jumlah kartu penjamin:', prev);
  expect(prev, 'jumlah kartu harus 4 (3 terisi + 1 kosong) agar aman dihapus').toBe(4);

  // Kartu ke-4 harus kosong
  const namaP = await page.locator('input[name="personalGuarantee.name"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value));
  const ktpP = await page.locator('input[name="personalGuarantee.wni.identityNumber"]').evaluateAll(els => els.map(e => (e as HTMLInputElement).value));
  console.log('Nama penjamin perorangan (urut kartu perorangan):', JSON.stringify(namaP), 'KTP:', JSON.stringify(ktpP));
  const kartuPerorangan = namaP.length; // kartu 1,2 (terisi) + kartu 4 (kosong) = 3 kartu perorangan
  expect(kartuPerorangan).toBe(3);
  expect(namaP[2], 'kartu perorangan terakhir (Penjamin 4) harus kosong').toBe('');
  expect(ktpP[2] ?? '', 'KTP kartu terakhir harus kosong').toBe('');
  expect(namaP[0]).not.toBe('');
  expect(namaP[1]).not.toBe('');

  // Header kartu "Penjamin 4": cari tombol hapus (ikon tempat sampah)
  const header = page.getByText('Penjamin 4', { exact: true }).first();
  await header.scrollIntoViewIfNeeded();
  const headerRow = header.locator('xpath=ancestor::*[.//button][1]');
  const buttons = headerRow.locator('button');
  const nBtn = await buttons.count();
  const info: string[] = [];
  let hapusIdx = -1;
  for (let i = 0; i < nBtn; i++) {
    const html = (await buttons.nth(i).evaluate(e => e.outerHTML)).replace(/\s+/g, ' ').slice(0, 260);
    info.push(`[${i}] ${html}`);
    if (hapusIdx < 0 && /trash|delete|hapus|remove|red-|text-red|danger/i.test(html)) hapusIdx = i;
  }
  console.log('Tombol di header Penjamin 4:\n  ' + info.join('\n  '));
  expect(hapusIdx, 'tombol hapus tidak teridentifikasi, tidak ada yang diklik').toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: test.info().outputPath('01-sebelum-hapus.png') });
  await buttons.nth(hapusIdx).click();
  await page.waitForTimeout(1500);

  // Dialog konfirmasi (bila ada)
  const dlg = page.locator('[role="dialog"], [aria-modal="true"]').last();
  if (await dlg.isVisible().catch(() => false)) {
    console.log('DIALOG hapus:', ((await dlg.innerText()) || '').replace(/\n/g, ' | '));
    await page.screenshot({ path: test.info().outputPath('02-dialog-hapus.png') });
    await dlg.getByRole('button', { name: /^(Hapus|Ya|Ya, hapus|Delete|Konfirmasi)$/i }).first().click();
  } else {
    console.log('Tidak ada dialog konfirmasi hapus');
  }
  await page.waitForTimeout(2500);

  // Picu simpan (pindah section) lalu verifikasi setelah muat ulang
  const saved = page.waitForResponse(r => /forms\/data_penjamin/.test(r.url()) && r.request().method() !== 'GET', { timeout: 20000 }).catch(() => null);
  await page.locator('aside button', { hasText: 'Referensi' }).click();
  const resp = await saved;
  console.log('Simpan/hapus penjamin di server:', resp ? `${resp.request().method()} ${resp.status()}` : 'TIDAK ADA request');
  await page.waitForTimeout(4000);

  await app.goto(APPLICATION_ID, 'identitas_pengecekan');
  await new DataPenjaminForm(page, 0).open();
  prev = -1; stabil = 0;
  for (let i = 0; i < 30 && stabil < 3; i++) {
    await page.waitForTimeout(1000);
    const n = await tipe.count();
    stabil = n === prev && n > 0 ? stabil + 1 : 0;
    prev = n;
  }
  console.log('Jumlah kartu setelah muat ulang:', prev);
  console.log('Status sidebar Data penjamin:', ((await page.locator('aside button', { hasText: 'Data penjamin' }).innerText()) || '').replace(/\n/g, ' | '));
  await page.screenshot({ path: test.info().outputPath('03-akhir.png'), fullPage: true });
  expect(prev).toBe(3);
});
