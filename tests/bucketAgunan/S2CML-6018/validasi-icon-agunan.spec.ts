import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { LoginPage } from '../../../pages/base/LoginPage';

/**
 * Test Suite: S2CML-6018 - Summary Agunan (Validasi Icon Kartu Agunan vs Desain Figma)
 *
 * Story ID: S2CML-6018
 * Sumber Desain: Figma LAMOS SME : Phase 1.1 - Agunan, 6C, FPPA
 *
 * Matriks Ikon Agunan Figma:
 * - Housing (Tanah, Ruko, Rumah, Gudang)       -> Icon Rumah          (/assets/agunan-image/housing.svg)
 * - Kendaraan (Truk, Kendaraan, Mesin, Kapal)  -> Icon Truk           (/assets/agunan-image/vehicle.svg)
 * - Dokumen (Reksadana, Saham, AR, Asuransi)   -> Icon Kertas/Dokumen (/assets/agunan-image/document.svg)
 * - Cash (Giro, Tabungan, Deposito, Jaminan)   -> Icon Koin Emas      (/assets/agunan-image/cash.svg)
 *
 * Application ID: 01M4F7TNSCSHEDB5G3WTSP7HDY (Perseorangan / individual)
 */

const TARGET_APP_ID = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
const BASE_URL = process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/';
const TARGET_URL = `${BASE_URL.replace(/\/$/, '')}/lamos/credit-application/${TARGET_APP_ID}/create?bucket=agunan&debtorType=individual`;
const EVIDEN_DIR = path.join(__dirname, 'eviden');

test.describe('S2CML-6018: Validasi Icon Kartu Agunan vs Desain Figma', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(EVIDEN_DIR)) {
      fs.mkdirSync(EVIDEN_DIR, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1366, height: 900 });

    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Buka accordion Data Agunan jika tertutup
    await ensureDataAgunanOpen(page);
  });

  /**
   * Helper: Memastikan accordion Data Agunan terbuka
   */
  async function ensureDataAgunanOpen(page: Page) {
    const headerBtn = page.locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
      .filter({ hasText: /^Data agunan$/i }).first();
    if (await headerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const isContentVisible = await page.locator('text=/Daftar agunan|Draf agunan|Total nilai/i').first()
        .isVisible({ timeout: 2000 }).catch(() => false);
      if (!isContentVisible) {
        await headerBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  }

  // =========================================================================
  // TC-6018-01: Validasi Icon Kategori Dokumen (Kertas/Dokumen)
  // =========================================================================
  test('TC-6018-01: Validasi Tampilan dan Kesesuaian Icon Kategori Dokumen (Kertas/Dokumen) pada Kartu Agunan Reksadana', async ({ page }) => {
    // 1. Temukan kartu agunan Reksadana (Kategori Dokumen)
    const cardReksadana = page.locator('text=/F041401 - Reksadana/i')
      .locator('xpath=ancestor::div[contains(@class, "Card") or contains(@class, "border")][1]');
    await expect(cardReksadana).toBeVisible({ timeout: 15000 });
    await cardReksadana.scrollIntoViewIfNeeded();

    // 2. Temukan elemen icon gambar di dalam kartu
    const iconImg = cardReksadana.locator('img').first();
    await expect(iconImg).toBeVisible({ timeout: 10000 });

    // 3. Validasi atribut src memuat asset document.svg sesuai desain Figma
    const src = await iconImg.getAttribute('src');
    expect(src).toContain('/assets/agunan-image/document.svg');

    // 4. Validasi alt text kartu
    const alt = await iconImg.getAttribute('alt');
    expect(alt).toMatch(/Reksadana/i);

    // Eviden Step 1: Screenshot fokus kartu Reksadana yang membuktikan ikon kertas/dokumen
    await cardReksadana.screenshot({
      path: path.join(EVIDEN_DIR, 'TC-6018-01-step-1.png'),
    });
  });

  // =========================================================================
  // TC-6018-02: Validasi Icon Kategori Cash (Koin Emas)
  // =========================================================================
  test('TC-6018-02: Validasi Tampilan dan Kesesuaian Icon Kategori Cash (Koin Emas) pada Kartu Agunan Setoran Jaminan', async ({ page }) => {
    // 1. Temukan kartu agunan Setoran Jaminan (Kategori Cash Collateral)
    const cardCash = page.locator('text=/F15 - Setoran Jaminan/i')
      .locator('xpath=ancestor::div[contains(@class, "Card") or contains(@class, "border")][1]');
    await expect(cardCash).toBeVisible({ timeout: 15000 });
    await cardCash.scrollIntoViewIfNeeded();

    // 2. Temukan elemen icon gambar di dalam kartu
    const iconImg = cardCash.locator('img').first();
    await expect(iconImg).toBeVisible({ timeout: 10000 });

    // 3. Validasi atribut src memuat asset cash.svg sesuai desain Figma (Koin Emas)
    const src = await iconImg.getAttribute('src');
    expect(src).toContain('/assets/agunan-image/cash.svg');

    // 4. Validasi alt text kartu
    const alt = await iconImg.getAttribute('alt');
    expect(alt).toMatch(/Setoran Jaminan/i);

    // Eviden Step 1: Screenshot fokus kartu Setoran Jaminan yang membuktikan ikon koin emas
    await cardCash.screenshot({
      path: path.join(EVIDEN_DIR, 'TC-6018-02-step-1.png'),
    });
  });

  // =========================================================================
  // TC-6018-03: Validasi Ketersediaan Seluruh Asset Icon Agunan di Frontend
  // =========================================================================
  test('TC-6018-03: Validasi Ketersediaan dan Integritas Seluruh Asset Icon Agunan (Housing, Vehicle, Document, Cash) pada Frontend', async ({ page }) => {
    const requiredAssets = [
      { name: 'housing.svg', category: 'Housing', figmaIcon: 'Rumah', example: 'Tanah, Ruko, Rumah, Gudang, dll.' },
      { name: 'vehicle.svg', category: 'Kendaraan', figmaIcon: 'Truk', example: 'Kendaraan, Mesin, Alat Berat, Kapal, Pesawat' },
      { name: 'document.svg', category: 'Dokumen', figmaIcon: 'Kertas / Dokumen', example: 'Reksadana, Saham, Persediaan, AR, Bancassurance' },
      { name: 'cash.svg', category: 'Cash', figmaIcon: 'Koin Emas', example: 'Giro, Tabungan, Deposito, Setoran Jaminan' },
    ];

    for (const asset of requiredAssets) {
      const assetUrl = `${BASE_URL.replace(/\/$/, '')}/assets/agunan-image/${asset.name}`;
      const response = await page.request.get(assetUrl);

      // Pastikan response HTTP 200 OK
      expect(response.status(), `Asset ${asset.name} (${asset.category}) harus tersedia dengan status 200`).toBe(200);

      const body = await response.text();
      expect(body, `Asset ${asset.name} harus berupa markup SVG valid`).toContain('<svg');
      expect(body.length, `Ukuran SVG ${asset.name} harus memadai`).toBeGreaterThan(1000);
    }

    // Suntikkan galeri pembuktian visual 4 ikon sesuai tabel Figma langsung ke DOM
    await page.evaluate((assets) => {
      const container = document.createElement('div');
      container.id = 'qa-figma-icon-matrix-gallery';
      Object.assign(container.style, {
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        backgroundColor: '#ffffff',
        border: '2px solid #2563eb',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        zIndex: '999999',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      });

      let rows = assets.map(a => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: bold; color: #1f2937;">${a.category}</td>
          <td style="padding: 12px; text-align: center;">
            <img src="/assets/agunan-image/${a.name}" width="54" height="54" style="object-contain; vertical-align: middle;" />
          </td>
          <td style="padding: 12px; color: #4b5563;">${a.figmaIcon}</td>
          <td style="padding: 12px; font-family: monospace; font-size: 12px; color: #059669;">/assets/agunan-image/${a.name}</td>
          <td style="padding: 12px; color: #6b7280; font-size: 13px;">${a.example}</td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 18px; color: #1e3a8a;">Matriks Validasi 4 Ikon Agunan LAMOS vs Desain Figma</h3>
            <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Environment: SIT (Build Frontend Assets) — Story S2CML-6018</p>
          </div>
          <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px;">STATUS: 4/4 ASSETS VERIFIED (HTTP 200)</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
              <th style="padding: 10px;">Tipe</th>
              <th style="padding: 10px; text-align: center;">Render Icon FE</th>
              <th style="padding: 10px;">Icon Figma</th>
              <th style="padding: 10px;">Path Asset SVG</th>
              <th style="padding: 10px;">Contoh Agunan</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;

      document.body.appendChild(container);
    }, requiredAssets);

    await page.waitForTimeout(1000);

    // Eviden Step 1: Screenshot tabel perbandingan ke-4 ikon vs Figma
    const gallery = page.locator('#qa-figma-icon-matrix-gallery');
    await gallery.screenshot({
      path: path.join(EVIDEN_DIR, 'TC-6018-03-step-1.png'),
    });

    // Bersihkan overlay
    await page.evaluate(() => {
      const g = document.getElementById('qa-figma-icon-matrix-gallery');
      if (g) g.remove();
    });
  });

  // =========================================================================
  // TC-6018-04: Validasi Dimensi dan Atribut Gambar Icon Agunan
  // =========================================================================
  test('TC-6018-04: Validasi Dimensi dan Atribut Gambar Icon Agunan (48x48 px, Alt Text, Object Contain)', async ({ page }) => {
    // Ambil section daftar agunan yang menampilkan seluruh kartu agunan
    const daftarSection = page.locator('text=/Daftar agunan \\(\\d+\\)/i')
      .locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "flex-1") or contains(@class, "p-")][1]');
    await daftarSection.scrollIntoViewIfNeeded();

    const cardImages = page.locator('div[class*="Card"], div[class*="border"]')
      .filter({ has: page.locator('text=/ID:\\s*[A-Z0-9]+/i') })
      .locator('img[src*="/assets/agunan-image/"]');

    const count = await cardImages.count();
    expect(count, 'Harus ada minimal 1 icon kartu agunan yang ter-render').toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const img = cardImages.nth(i);
      await expect(img).toBeVisible();

      // Periksa atribut width dan height dari Next.js Image
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      expect(width, 'Width icon harus 48px sesuai standar Figma').toBe('48');
      expect(height, 'Height icon harus 48px sesuai standar Figma').toBe('48');

      // Periksa CSS class styling
      const className = await img.getAttribute('class');
      expect(className).toContain('object-contain');
    }

    // Scroll sampai kedua kartu agunan terlihat utuh berdampingan
    const cardReksadana = page.locator('text=/F041401 - Reksadana/i')
      .locator('xpath=ancestor::div[contains(@class, "Card") or contains(@class, "border")][1]');
    await cardReksadana.scrollIntoViewIfNeeded();

    // Eviden Step 1: Screenshot area daftar agunan dengan kedua kartu
    await page.screenshot({
      path: path.join(EVIDEN_DIR, 'TC-6018-04-step-1.png'),
      fullPage: false,
    });
  });
});
