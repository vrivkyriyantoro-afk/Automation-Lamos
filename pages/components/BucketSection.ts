import { Page, Locator, expect } from '@playwright/test';
import { escapeRegex } from './FormControls';

export type BucketId =
  | 'identitas_pengecekan'
  | 'struktur_kredit'
  | 'penilaian_kelayakan'
  | 'data_usaha'
  | 'collateral'
  | 'analisa_keuangan'
  | 'legal_risk_compliance'
  | 'dokumen'
  | 'covenant_tbo'
  | 'penyimpangan_pihak_terkait'
  | 'catatan_anda';

/**
 * Navigasi halaman "Buat pengajuan kredit": tab bucket + sidebar section.
 * URL: /lamos/credit-application/<applicationId>/create?bucket=<bucket>&debtorType=<type>
 */
export class CreditApplicationForm {
  constructor(readonly page: Page) {}

  static url(applicationId: string, bucket: BucketId, debtorType: 'individual' | 'corporate' | string = 'individual') {
    const base = (process.env.BASE_URL || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/').replace(/\/?$/, '/');
    return `${base}lamos/credit-application/${applicationId}/create?bucket=${bucket}&debtorType=${debtorType}`;
  }

  async goto(applicationId: string, bucket: BucketId, debtorType = 'individual') {
    await this.page.goto(CreditApplicationForm.url(applicationId, bucket, debtorType), { waitUntil: 'domcontentloaded' });
    await this.waitReady();
  }

  /** Pindah bucket lewat tab (id tab = id bucket) */
  async openBucket(bucket: BucketId) {
    await this.page.locator(`[role="tab"][id="${bucket}"]`).click();
    await expect(this.page).toHaveURL(new RegExp(`bucket=${bucket}`));
    await this.waitReady();
  }

  async waitReady() {
    await this.page.locator('[role="tab"]').first().waitFor({ timeout: 30000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  /** Item sidebar kiri (judul section) beserta status-nya, mis. "Lengkap" / "Belum Lengkap" */
  sidebarItem(title: string): Locator {
    return this.page.locator('aside button').filter({
      has: this.page.locator('span').filter({ hasText: new RegExp(`^\\s*${escapeRegex(title)}\\s*$`, 'i') }),
    }).first();
  }

  async sidebarStatus(title: string): Promise<string> {
    return ((await this.sidebarItem(title).locator('span').nth(1).textContent()) ?? '').trim();
  }

  get btnLanjutkan() { return this.page.getByRole('button', { name: 'Lanjutkan', exact: true }); }
  get btnKirim() { return this.page.getByRole('button', { name: 'Kirim', exact: true }); }
}

/**
 * Base class untuk satu section (Collapsible) di dalam bucket.
 * Accordion bersifat single-open: membuka satu section menutup section lain.
 */
export abstract class BucketSection {
  /** id bucket tempat section berada */
  abstract readonly bucket: BucketId;
  /** judul collapsible persis seperti di UI */
  abstract readonly title: string;
  /** judul item sidebar yang membuka section (jika ada) */
  readonly sidebarTitle?: string;

  readonly form: CreditApplicationForm;

  constructor(readonly page: Page) {
    this.form = new CreditApplicationForm(page);
  }

  /** Container collapsible section ini — semua field di-scope ke sini */
  get root(): Locator {
    return this.page.locator('[class*="Collapsible-module_container__"]').filter({
      has: this.page.locator('[class*="Collapsible-module_label"]').filter({
        hasText: new RegExp(`^\\s*${escapeRegex(this.title)}\\s*$`, 'i'),
      }),
    }).first();
  }

  get header(): Locator {
    return this.root.locator('[class*="Collapsible-module_div_as_button"]').first();
  }

  async isExpanded(): Promise<boolean> {
    return this.root.evaluate(el => {
      const label = el.querySelector('[class*="Collapsible-module_label"]')?.textContent?.trim() || '';
      return (el as HTMLElement).innerText.trim().length - label.length > 5;
    });
  }

  /** Buka section: klik sidebar (jika ada) lalu expand collapsible bila tertutup */
  async open() {
    if (this.sidebarTitle) {
      const item = this.form.sidebarItem(this.sidebarTitle);
      if (await item.count()) await item.click();
    }
    await this.root.waitFor({ state: 'visible', timeout: 20000 });
    if (!(await this.isExpanded())) await this.header.click();
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    return this;
  }

  /** Tombol di dalam section berdasarkan teks */
  button(name: string | RegExp): Locator {
    return this.root.getByRole('button', { name }).first();
  }
}

/** Base untuk modal/dialog (mis. form "+ Tambah ...") */
export abstract class ModalForm {
  constructor(readonly page: Page) {}
  /** judul dialog seperti di UI */
  abstract readonly title: string;

  get root(): Locator {
    return this.page.locator('[role="dialog"], [aria-modal="true"]').filter({ hasText: this.title }).last();
  }
  async waitOpen() {
    await this.root.waitFor({ state: 'visible', timeout: 15000 });
    return this;
  }
  async cancel() {
    await this.root.getByRole('button', { name: /^(Batal|Tutup|Kembali)$/i }).first().click();
    await this.root.waitFor({ state: 'hidden' });
  }
  async submit(name: string | RegExp = /^(Simpan|Tambah|Tambahkan)$/i) {
    await this.root.getByRole('button', { name }).last().click();
  }
}
