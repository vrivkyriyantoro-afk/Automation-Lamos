import { Page, Locator, expect } from '@playwright/test';

export interface DataPribadiTambahanInput {
  jumlahTanggungan?: number;
  statusTempatTinggal?: string;
  lamaMenempatiTahun?: number;
  lamaMenempatiBulan?: number;
  teleponRumah?: string;
  nomorNpwp?: string;
  kewarganegaraan?: 'WNI' | 'WNA';
  negaraAsal?: string;
  namaIbuKandung?: string;
  hobiAktivitas?: string;
  keteranganTambahan?: string;
}

export class DataPribadiTambahanPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Inputs Data Pribadi Tambahan
  readonly inputJumlahTanggungan: Locator;
  readonly inputLamaMenempatiTahun: Locator;
  readonly inputLamaMenempatiBulan: Locator;
  readonly inputTeleponRumah: Locator;
  readonly inputNpwp: Locator;
  readonly inputNegaraAsal: Locator;
  readonly inputHobi: Locator;
  readonly textareaKeteranganTambahan: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data pribadi tambahan$/i }).first();

    // Inputs Data Pribadi Tambahan
    this.inputJumlahTanggungan = page.locator('input[name="jumlahTanggungan"], input[name="dependentsCount"], input[placeholder*="jumlah tanggungan" i], input[placeholder*="tanggungan" i]').first();
    this.inputLamaMenempatiTahun = page.locator('input[name="stayDurationYears"], input[name="lamaTinggalTahun"], input[placeholder*="tahun" i]').first();
    this.inputLamaMenempatiBulan = page.locator('input[name="stayDurationMonths"], input[name="lamaTinggalBulan"], input[placeholder*="bulan" i]').first();
    this.inputTeleponRumah = page.locator('input[name="homePhone"], input[name="teleponRumah"], input[placeholder*="telepon rumah" i]').first();
    this.inputNpwp = page.locator('input[name="npwp"], input[placeholder*="NPWP" i]').first();
    this.inputNegaraAsal = page.locator('input[name="countryOfOrigin"], input[name="negaraAsal"], input[placeholder*="negara" i]').first();
    this.inputHobi = page.locator('input[name="hobby"], input[name="hobi"], input[placeholder*="hobi" i]').first();
    this.textareaKeteranganTambahan = page.locator('textarea[name="additionalNotes"], textarea[name="keteranganTambahan"], textarea[placeholder*="keterangan" i], textarea[placeholder*="catatan" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Pribadi Tambahan
   */
  async openSection() {
    console.log('[DataPribadiTambahan] Membuka section Data Pribadi Tambahan...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Status Tempat Tinggal
   */
  async selectStatusTempatTinggal(status: string) {
    console.log(`[DataPribadiTambahan] Memilih status tempat tinggal: ${status}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih status tempat tinggal|Milik Sendiri|Sewa|Keluarga|Dinas/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(status, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Kewarganegaraan
   */
  async selectKewarganegaraan(kewarganegaraan: 'WNI' | 'WNA') {
    console.log(`[DataPribadiTambahan] Memilih kewarganegaraan: ${kewarganegaraan}`);
    const radioOrText = this.page.getByRole('radio', { name: kewarganegaraan })
      .or(this.page.locator('label').filter({ hasText: new RegExp(`^${kewarganegaraan}$`, 'i') }))
      .or(this.page.getByText(kewarganegaraan, { exact: true }));

    if (await radioOrText.isVisible()) {
      await radioOrText.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Mengisi seluruh form Data Pribadi Tambahan
   */
  async fillDataPribadiTambahan(data: DataPribadiTambahanInput) {
    console.log('[DataPribadiTambahan] Mengisi data pribadi tambahan...');

    if (data.jumlahTanggungan !== undefined && await this.inputJumlahTanggungan.isVisible()) {
      await this.inputJumlahTanggungan.fill(data.jumlahTanggungan.toString());
    }

    if (data.statusTempatTinggal) {
      await this.selectStatusTempatTinggal(data.statusTempatTinggal);
    }

    if (data.lamaMenempatiTahun !== undefined && await this.inputLamaMenempatiTahun.isVisible()) {
      await this.inputLamaMenempatiTahun.fill(data.lamaMenempatiTahun.toString());
    }
    if (data.lamaMenempatiBulan !== undefined && await this.inputLamaMenempatiBulan.isVisible()) {
      await this.inputLamaMenempatiBulan.fill(data.lamaMenempatiBulan.toString());
    }

    if (data.teleponRumah && await this.inputTeleponRumah.isVisible()) {
      await this.inputTeleponRumah.fill(data.teleponRumah);
    }

    if (data.nomorNpwp && await this.inputNpwp.isVisible()) {
      await this.inputNpwp.fill(data.nomorNpwp);
    }

    if (data.kewarganegaraan) {
      await this.selectKewarganegaraan(data.kewarganegaraan);
      if (data.kewarganegaraan === 'WNA' && data.negaraAsal && await this.inputNegaraAsal.isVisible()) {
        await this.inputNegaraAsal.fill(data.negaraAsal);
      }
    }

    if (data.hobiAktivitas && await this.inputHobi.isVisible()) {
      await this.inputHobi.fill(data.hobiAktivitas);
    }

    if (data.keteranganTambahan && await this.textareaKeteranganTambahan.isVisible()) {
      await this.textareaKeteranganTambahan.fill(data.keteranganTambahan);
    }

    console.log('✅ Form Data Pribadi Tambahan berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataPribadiTambahan] Menyimpan form Data Pribadi Tambahan...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Pribadi Tambahan tersimpan.');
    }
  }
}
