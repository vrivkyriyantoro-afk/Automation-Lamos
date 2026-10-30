import { Page, Locator, expect } from '@playwright/test';

export interface ReferensiItem {
  tipeReferensi?: 'Referensi Usaha' | 'Referensi Supplier' | 'Referensi Buyer' | 'Referensi Bank' | 'Referensi Pribadi' | string;
  nama: string;
  namaPic?: string;
  jabatanPic?: string;
  nomorTelepon: string;
  hubungan?: string;
  alamat?: string;
  lamaHubunganTahun?: number;
  catatan?: string;
}

export class ReferensiPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Tombol Tambah Referensi
  readonly btnTambahReferensi: Locator;

  // Inputs Modal / Form Referensi
  readonly inputNama: Locator;
  readonly inputPic: Locator;
  readonly inputJabatanPic: Locator;
  readonly inputNomorTelepon: Locator;
  readonly inputHubungan: Locator;
  readonly inputAlamat: Locator;
  readonly inputLamaHubungan: Locator;
  readonly textareaCatatan: Locator;

  // Tombol Simpan
  readonly btnSimpanModal: Locator;
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Referensi$/i }).first();

    // Tombol Tambah
    this.btnTambahReferensi = page.getByRole('button', { name: /Tambah Referensi|\+ Referensi/i }).or(page.locator('button:has-text("Tambah Referensi")')).first();

    // Inputs
    this.inputNama = page.locator('input[name="reference.name"], input[placeholder*="nama lembaga" i], input[placeholder*="nama referensi" i], input[placeholder*="nama perusahaan" i], input[placeholder*="nama" i]').first();
    this.inputPic = page.locator('input[name="reference.picName"], input[placeholder*="nama PIC" i], input[placeholder*="kontak person" i]').first();
    this.inputJabatanPic = page.locator('input[name="reference.picPosition"], input[placeholder*="jabatan" i]').first();
    this.inputNomorTelepon = page.locator('input[name="reference.phoneNumber"], input[name="reference.phone"], input[placeholder*="nomor telepon" i], input[placeholder*="telepon" i], input[placeholder*="no. hp" i]').first();
    this.inputHubungan = page.locator('input[name="reference.relationship"], input[placeholder*="hubungan" i]').first();
    this.inputAlamat = page.locator('input[name="reference.address"], textarea[name="reference.address"], input[placeholder*="alamat" i]').first();
    this.inputLamaHubungan = page.locator('input[name="reference.durationYears"], input[placeholder*="lama hubungan" i], input[placeholder*="tahun" i]').first();
    this.textareaCatatan = page.locator('textarea[name="reference.notes"], textarea[placeholder*="catatan" i], textarea[placeholder*="keterangan" i]').first();

    // Tombol Simpan
    this.btnSimpanModal = page.locator('div[role="dialog"] button, .modal button').filter({ hasText: /^Simpan$/i }).last();
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Referensi
   */
  async openSection() {
    console.log('[Referensi] Membuka section Referensi...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Buka modal Tambah Referensi
   */
  async openTambahReferensiModal() {
    console.log('[Referensi] Membuka modal Tambah Referensi...');
    if (await this.btnTambahReferensi.isVisible()) {
      await this.btnTambahReferensi.scrollIntoViewIfNeeded();
      await this.btnTambahReferensi.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Pilih Tipe Referensi
   */
  async selectTipeReferensi(tipe: string) {
    console.log(`[Referensi] Memilih tipe referensi: ${tipe}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih tipe referensi|Supplier|Buyer|Bank|Pribadi/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(tipe, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Tambah item referensi
   */
  async addReferensi(data: ReferensiItem) {
    console.log(`[Referensi] Menambahkan referensi: ${data.nama}...`);
    await this.openTambahReferensiModal();

    if (data.tipeReferensi) {
      await this.selectTipeReferensi(data.tipeReferensi);
    }

    if (await this.inputNama.isVisible()) await this.inputNama.fill(data.nama);
    if (data.namaPic && await this.inputPic.isVisible()) await this.inputPic.fill(data.namaPic);
    if (data.jabatanPic && await this.inputJabatanPic.isVisible()) await this.inputJabatanPic.fill(data.jabatanPic);
    if (await this.inputNomorTelepon.isVisible()) await this.inputNomorTelepon.fill(data.nomorTelepon);
    if (data.hubungan && await this.inputHubungan.isVisible()) await this.inputHubungan.fill(data.hubungan);
    if (data.alamat && await this.inputAlamat.isVisible()) await this.inputAlamat.fill(data.alamat);
    if (data.lamaHubunganTahun !== undefined && await this.inputLamaHubungan.isVisible()) {
      await this.inputLamaHubungan.fill(data.lamaHubunganTahun.toString());
    }
    if (data.catatan && await this.textareaCatatan.isVisible()) {
      await this.textareaCatatan.fill(data.catatan);
    }

    // Klik simpan modal jika dalam modal
    if (await this.btnSimpanModal.isVisible()) {
      await this.btnSimpanModal.click({ force: true });
      await this.page.waitForTimeout(1500);
      console.log(`✅ Referensi "${data.nama}" berhasil ditambahkan!`);
    }
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[Referensi] Menyimpan form Referensi...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Referensi tersimpan.');
    }
  }
}
