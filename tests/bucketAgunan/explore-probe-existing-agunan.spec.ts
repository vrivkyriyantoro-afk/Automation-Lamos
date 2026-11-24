import { test, Page } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Script Probe Read-Only untuk memeriksa ketersediaan kartu agunan tersimpan (Draft / Final)
 * pada Application ID kandidat:
 * 1. 01M4F7TNSCSHEDB5G3WTSP7HDY (individual)
 * 2. 01M22NAB4RXT92Y56AJ5VBQT75 (individual, dari .env)
 * 3. 01M482PRSVH5ZMTVZX5QH0VDNZ (business)
 */

interface AppCandidate {
  id: string;
  type: 'individual' | 'business';
  label: string;
}

const CANDIDATES: AppCandidate[] = [
  { id: '01M4F7TNSCSHEDB5G3WTSP7HDY', type: 'individual', label: 'Perseorangan (Default Spec Agunan)' },
  { id: process.env.DEBITUR_TARGET || '01M22NAB4RXT92Y56AJ5VBQT75', type: 'individual', label: 'Perseorangan (.env DEBITUR_TARGET)' },
  { id: '01M482PRSVH5ZMTVZX5QH0VDNZ', type: 'business', label: 'Badan Usaha (Default Spec BU)' },
];

test.describe('Probe Ketersediaan Agunan Existing untuk S2CML-4941', () => {
  test.setTimeout(180000);

  test('Periksa keberadaan kartu agunan Draft & Final pada kandidat App ID', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    // Deduplikasi kandidat jika DEBITUR_TARGET sama dengan default
    const uniqueCandidates = CANDIDATES.filter((c, idx, arr) => 
      arr.findIndex(item => item.id === c.id && item.type === c.type) === idx
    );

    for (const cand of uniqueCandidates) {
      console.log(`\n==================================================`);
      console.log(`MEMERIKSA: ${cand.label} [${cand.id}] (${cand.type})`);
      console.log(`==================================================`);

      const url = `https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application/${cand.id}/create?bucket=agunan&debtorType=${cand.type}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Pastikan accordion "Data agunan" terbuka
      const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
        .filter({ hasText: /^Data agunan$/i }).first();
      
      if (await headerBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
        const isContentVisible = await page.locator('text=/Daftar agunan|Draf agunan|Total nilai/i').first()
          .isVisible({ timeout: 3000 }).catch(() => false);
        if (!isContentVisible) {
          await headerBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      // Ambil screenshot full page
      await page.screenshot({
        path: `explore-output/probes/probe-4941-${cand.id}.png`,
        fullPage: true,
      });

      // Deteksi teks seputar Agunan
      const bodyText = await page.locator('body').innerText();

      const matchDraf = bodyText.match(/Draf agunan\s*(?:\((\d+)\))?/i);
      const matchDaftar = bodyText.match(/Daftar agunan\s*(?:\((\d+)\))?/i);
      const adaTombolAgunan = await page.getByRole('button', { name: /Agunan/i }).count();

      console.log(`- Header Draf Agunan: ${matchDraf ? matchDraf[0] : 'TIDAK DITEMUKAN'}`);
      console.log(`- Header Daftar Agunan (Final): ${matchDaftar ? matchDaftar[0] : 'TIDAK DITEMUKAN'}`);

      // Deteksi menu titik 3 / tombol aksi pada kartu agunan
      const actionButtons = page.locator('button').filter({
        has: page.locator('svg, span[class*="icon"], [class*="more"], [class*="dots"]')
      });
      const totalActionButtons = await actionButtons.count();
      console.log(`- Indikasi tombol icon/aksi: ${totalActionButtons}`);

      // Cari elemen spesifik kartu agunan atau menu popover
      const threeDotButtons = page.locator('[aria-haspopup="menu"], button[aria-label*="menu" i], button:has-text("..."), [class*="action-menu"], [data-testid*="menu"]');
      const threeDotCount = await threeDotButtons.count();
      console.log(`- Tombol menu titik 3 teridentifikasi: ${threeDotCount}`);

      // Periksa apakah ada teks status DRAFT / FINAL di halaman
      const draftBadge = await page.locator('text=/\\bDraft\\b|\\bDraf\\b/i').count();
      const finalBadge = await page.locator('text=/\\bFinal\\b|\\bSelesai\\b/i').count();
      console.log(`- Badge / kata Draft ditemukan: ${draftBadge}`);
      console.log(`- Badge / kata Final ditemukan: ${finalBadge}`);

      // Jika ada menu titik 3, coba klik (read-only) untuk melihat opsi menu popover
      if (threeDotCount > 0) {
        console.log(`  Mencoba membuka menu aksi pertama untuk melihat opsi...`);
        const firstBtn = threeDotButtons.first();
        await firstBtn.click();
        await page.waitForTimeout(1000);

        const popoverText = await page.locator('[role="menu"], [role="listbox"], [class*="popover"], [class*="menu"]').allInnerTexts().catch(() => []);
        console.log(`  Opsi menu popover yang muncul: ${JSON.stringify(popoverText)}`);

        await page.screenshot({
          path: `explore-output/probes/probe-4941-${cand.id}-menu.png`,
        });

        // Tutup kembali popover dengan klik di luar atau escape
        await page.keyboard.press('Escape');
      }
    }
  });
});

