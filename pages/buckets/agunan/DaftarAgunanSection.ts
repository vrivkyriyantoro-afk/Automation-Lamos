// Manual (bukan generated). Section "Data agunan" > "Daftar agunan": kartu agunan beserta ikonnya.
// Dipakai step Gherkin S2CML-6018 (features/steps/agunan-icon.steps.ts). Selector dipindah dari
// tests/bucketAgunan/S2CML-6018/validasi-icon-agunan.spec.ts supaya locator hanya ada di pages/.
import { Locator, Page } from '@playwright/test';

export interface AssetIkon {
  name: string;
  category: string;
  figmaIcon: string;
  example: string;
}

/** Matriks ikon agunan menurut desain Figma (S2CML-6018). */
export const ASSET_IKON: AssetIkon[] = [
  { name: 'housing.svg', category: 'Housing', figmaIcon: 'Rumah', example: 'Tanah, Ruko, Rumah, Gudang, dll.' },
  { name: 'vehicle.svg', category: 'Kendaraan', figmaIcon: 'Truk', example: 'Kendaraan, Mesin, Alat Berat, Kapal, Pesawat' },
  { name: 'document.svg', category: 'Dokumen', figmaIcon: 'Kertas / Dokumen', example: 'Reksadana, Saham, Persediaan, AR, Bancassurance' },
  { name: 'cash.svg', category: 'Cash', figmaIcon: 'Koin Emas', example: 'Giro, Tabungan, Deposito, Setoran Jaminan' },
];

const GALLERY_ID = 'qa-figma-icon-matrix-gallery';

export class DaftarAgunanSection {
  constructor(readonly page: Page) {}

  private get baseUrl() {
    return (process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/').replace(/\/$/, '');
  }

  /** Buka bucket Agunan debitur perseorangan lalu pastikan accordion "Data agunan" terbuka. */
  async bukaBucketAgunan(appId: string) {
    await this.page.setViewportSize({ width: 1366, height: 900 });
    await this.page.goto(`${this.baseUrl}/lamos/credit-application/${appId}/create?bucket=agunan&debtorType=individual`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForTimeout(3000);
    await this.pastikanDataAgunanTerbuka();
  }

  async pastikanDataAgunanTerbuka() {
    const header = this.page
      .locator('[class*="Collapsible-module_div_as_button"], [role="button"]')
      .filter({ hasText: /^Data agunan$/i })
      .first();
    if (await header.isVisible({ timeout: 5000 }).catch(() => false)) {
      const isiTampil = await this.page
        .locator('text=/Daftar agunan|Draf agunan|Total nilai/i')
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (!isiTampil) {
        await header.click();
        await this.page.waitForTimeout(1500);
      }
    }
  }

  /** Kartu agunan berdasarkan teks label, mis. "F041401 - Reksadana". */
  kartu(label: string): Locator {
    const pola = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.page
      .locator('text=' + String(pola))
      .locator('xpath=ancestor::div[contains(@class, "Card") or contains(@class, "border")][1]');
  }

  ikon(kartu: Locator): Locator {
    return kartu.locator('img').first();
  }

  /** Semua ikon kartu agunan di Daftar agunan. */
  semuaIkonKartu(): Locator {
    return this.page
      .locator('div[class*="Card"], div[class*="border"]')
      .filter({ has: this.page.locator('text=/ID:\\s*[A-Z0-9]+/i') })
      .locator('img[src*="/assets/agunan-image/"]');
  }

  async gulirKeDaftarAgunan() {
    const section = this.page
      .locator('text=/Daftar agunan \\(\\d+\\)/i')
      .locator('xpath=ancestor::div[contains(@class, "Collapsible") or contains(@class, "flex-1") or contains(@class, "p-")][1]');
    await section.scrollIntoViewIfNeeded();
  }

  /** Ambil asset ikon langsung dari frontend. */
  async ambilAsset(nama: string) {
    const res = await this.page.request.get(`${this.baseUrl}/assets/agunan-image/${nama}`);
    return { status: res.status(), body: await res.text() };
  }

  /** Suntik galeri pembuktian visual 4 ikon vs Figma ke DOM (hanya untuk screenshot eviden). */
  async tampilkanMatriksIkon(assets: AssetIkon[] = ASSET_IKON): Promise<Locator> {
    await this.page.evaluate(
      ({ assets, id }) => {
        const container = document.createElement('div');
        container.id = id;
        Object.assign(container.style, {
          position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', width: '900px',
          backgroundColor: '#ffffff', border: '2px solid #2563eb', borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: '999999', padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        });
        const rows = assets
          .map(
            (a) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: bold; color: #1f2937;">${a.category}</td>
          <td style="padding: 12px; text-align: center;"><img src="/assets/agunan-image/${a.name}" width="54" height="54" style="vertical-align: middle;" /></td>
          <td style="padding: 12px; color: #4b5563;">${a.figmaIcon}</td>
          <td style="padding: 12px; font-family: monospace; font-size: 12px; color: #059669;">/assets/agunan-image/${a.name}</td>
          <td style="padding: 12px; color: #6b7280; font-size: 13px;">${a.example}</td>
        </tr>`,
          )
          .join('');
        container.innerHTML = `
        <div style="margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">
          <h3 style="margin: 0; font-size: 18px; color: #1e3a8a;">Matriks Validasi 4 Ikon Agunan LAMOS vs Desain Figma</h3>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Environment: SIT (Build Frontend Assets) — Story S2CML-6018</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
          <thead><tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
            <th style="padding: 10px;">Tipe</th><th style="padding: 10px; text-align: center;">Render Icon FE</th>
            <th style="padding: 10px;">Icon Figma</th><th style="padding: 10px;">Path Asset SVG</th><th style="padding: 10px;">Contoh Agunan</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
        document.body.appendChild(container);
      },
      { assets, id: GALLERY_ID },
    );
    await this.page.waitForTimeout(1000);
    return this.page.locator(`#${GALLERY_ID}`);
  }

  async sembunyikanMatriksIkon() {
    await this.page.evaluate((id) => document.getElementById(id)?.remove(), GALLERY_ID);
  }
}
