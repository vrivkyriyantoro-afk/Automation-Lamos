import { Page, Locator, expect } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, escapeRegex } from '../components/FormControls';
import { DOKUMEN_TREE, DokumenKategori } from './dokumenTree';

export type DokumenStatus = 'lengkap' | 'perlu-penyimpangan-tbo' | 'belum';
export type FilterStaging = 'Semua' | 'Memiliki kategori' | 'Belum ada kategori';

/**
 * Bucket Dokumen.
 * - Area "Kelengkapan dokumen": upload file (multiple) -> tiap file masuk staging dengan dropdown
 *   kategori bertingkat (id `data.<i>.categoryID`, lalu dropdown turunan `data.<i>.*`) -> "Simpan Dokumen".
 * - Collapsible "Dokumen": pohon kebutuhan kategori -> sub-kategori -> slot dokumen + status.
 *
 * Struktur hasil explore: tests/bucketDokumen/explore-dokumen.spec.ts -> explore-output/dokumen-tree.json
 */
export class DokumenSection extends BucketSection {
  readonly bucket: BucketId = 'dokumen';
  readonly title = 'Dokumen';
  readonly sidebarTitle = 'Dokumen';

  constructor(page: Page) {
    super(page);
  }

  // ---------- Upload & staging ----------

  /** Kartu "Kelengkapan dokumen" (di luar collapsible "Dokumen") */
  get uploadArea(): Locator {
    return this.page.locator('section').filter({
      has: this.page.locator('h4', { hasText: /^Kelengkapan dokumen$/ }),
    }).first();
  }
  /** id input file dinamis (":r0:"), jadi dicari dari area upload */
  get fileInput() { return this.uploadArea.locator('input[type="file"]'); }
  get btnSimpanDokumen() { return this.uploadArea.getByRole('button', { name: 'Simpan Dokumen', exact: true }); }

  async upload(files: string | string[]) {
    await this.fileInput.setInputFiles(files);
  }

  /** Tombol filter staging: "Semua" / "Memiliki kategori <n>" / "Belum ada kategori <n>" */
  filterButton(filter: FilterStaging) {
    return this.page.getByRole('button', { name: new RegExp(`^${escapeRegex(filter)}\\s*\\d*$`) });
  }

  /** Dropdown ke-level (0 = kategori, 1 = turunan, ...) untuk file staging ke-index */
  stagedDropdown(index: number, level = 0): Dropdown {
    if (level === 0) return new Dropdown(this.page, `data.${index}.categoryID`);
    return Dropdown.fromLocator(this.page.locator(`[role="combobox"][id^="data.${index}."]`).nth(level));
  }

  /** Cari index staging dari nama file (urutan `data.<i>`) */
  async stagedIndexOf(fileName: string): Promise<number> {
    const index = await this.page.evaluate((name) => {
      const combos = Array.from(document.querySelectorAll('[role="combobox"][id*=".categoryID-"]'));
      for (const c of combos) {
        let el: Element | null = c;
        for (let i = 0; i < 8 && el; i++, el = el.parentElement) {
          if (el.querySelectorAll('[role="combobox"][id*=".categoryID-"]').length > 1) break;
          if (el.textContent?.includes(name)) return Number(c.id.match(/^data\.(\d+)\./)?.[1] ?? -1);
        }
      }
      return -1;
    }, fileName);
    if (index < 0) throw new Error(`File staging "${fileName}" tidak ditemukan`);
    return index;
  }

  /**
   * Pilih kategori bertingkat untuk satu file staging, mis.
   * categorize('ktp.png', 'Dokumen Pengajuan', 'Form Aplikasi Kredit')
   */
  async categorize(fileName: string, ...levels: string[]) {
    const index = await this.stagedIndexOf(fileName);
    for (const [level, option] of levels.entries()) {
      const dd = this.stagedDropdown(index, level);
      await expect(dd.locator).toBeVisible({ timeout: 15000 });
      await dd.select(option);
    }
  }

  async simpanDokumen() {
    await expect(this.btnSimpanDokumen).toBeEnabled();
    await this.btnSimpanDokumen.click();
  }

  /** Upload satu file, beri kategori, lalu simpan */
  async uploadAndSave(filePath: string, ...levels: string[]) {
    await this.upload(filePath);
    const fileName = filePath.split(/[\\/]/).pop()!;
    await this.categorize(fileName, ...levels);
    await this.simpanDokumen();
  }

  // ---------- Pohon kebutuhan dokumen ----------

  /** Item accordion kategori/sub-kategori berdasarkan judul */
  item(title: string): Locator {
    return this.root.locator('button.w-full').filter({
      // <p> pertama = judul, <p> kedua = keterangan
      has: this.page.locator('p:first-of-type', { hasText: new RegExp(`^\\s*${escapeRegex(title)}\\s*$`) }),
    }).first();
  }

  async expand(...path: string[]) {
    for (const title of path) {
      const btn = this.item(title);
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
    }
  }

  /** Status ikon kategori: hijau = lengkap, kuning = perlu penyimpangan/TBO */
  async status(title: DokumenKategori | string): Promise<DokumenStatus> {
    const btn = this.item(title);
    if (await btn.locator('.bg-emerald-600').count()) return 'lengkap';
    if (await btn.locator('.text-yellow-500').count()) return 'perlu-penyimpangan-tbo';
    return 'belum';
  }

  /** Keterangan di bawah judul kategori, mis. "Perlu input sebagai penyimpangan/TBO" */
  async note(title: string): Promise<string> {
    return ((await this.item(title).locator('p').nth(1).textContent()) ?? '').trim();
  }

  /** Daftar kategori level atas sesuai hasil explore */
  static readonly categories = DOKUMEN_TREE.map(c => c.title);
}
