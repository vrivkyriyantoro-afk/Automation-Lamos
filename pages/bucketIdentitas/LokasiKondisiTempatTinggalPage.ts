import { Page, Locator, expect } from '@playwright/test';

export interface LokasiKondisiTempatTinggalInput {
  alamatLengkap: string;
  rt: string;
  rw: string;
  provinsi: string;
  kotaKabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
  statusKepemilikan?: string;
  lamaMenempatiTahun?: number;
  lamaMenempatiBulan?: number;
  luasTanah?: number;
  luasBangunan?: number;
  kondisiBangunan?: 'Permanen' | 'Semi Permanen' | 'Non Permanen';
  aksesJalan?: string; // misalnya: 'Dapat dilalui 2 mobil', '1 mobil', 'Hanya motor'
  lingkunganTempatTinggal?: string; // misalnya: 'Perumahan', 'Perkampungan', 'Komersial'
  catatanLingkungan?: string;
}

export class LokasiKondisiTempatTinggalPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Inputs Lokasi & Alamat
  readonly inputAlamat: Locator;
  readonly inputRt: Locator;
  readonly inputRw: Locator;
  readonly inputKodePos: Locator;
  readonly inputLamaMenempatiTahun: Locator;
  readonly inputLamaMenempatiBulan: Locator;
  readonly inputLuasTanah: Locator;
  readonly inputLuasBangunan: Locator;
  readonly textareaCatatanLingkungan: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Lokasi & kondisi tempat tinggal$/i }).first();

    // Inputs
    this.inputAlamat = page.locator('input[name="residentialAddress.address"], textarea[name="residentialAddress.address"], input[placeholder*="alamat" i], textarea[placeholder*="alamat" i]').first();
    this.inputRt = page.locator('input[name="residentialAddress.rt"], input[name="rt"], input[placeholder*="RT" i]').first();
    this.inputRw = page.locator('input[name="residentialAddress.rw"], input[name="rw"], input[placeholder*="RW" i]').first();
    this.inputKodePos = page.locator('input[name="residentialAddress.postalCode"], input[name="postalCode"], input[placeholder*="kode pos" i]').first();
    this.inputLamaMenempatiTahun = page.locator('input[name="stayDurationYears"], input[name="lamaTinggalTahun"], input[placeholder*="tahun" i]').first();
    this.inputLamaMenempatiBulan = page.locator('input[name="stayDurationMonths"], input[name="lamaTinggalBulan"], input[placeholder*="bulan" i]').first();
    this.inputLuasTanah = page.locator('input[name="landArea"], input[placeholder*="luas tanah" i]').first();
    this.inputLuasBangunan = page.locator('input[name="buildingArea"], input[placeholder*="luas bangunan" i]').first();
    this.textareaCatatanLingkungan = page.locator('textarea[name="environmentNotes"], textarea[name="catatan"], textarea[placeholder*="lingkungan" i], textarea[placeholder*="catatan" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Lokasi & Kondisi Tempat Tinggal
   */
  async openSection() {
    console.log('[LokasiKondisiTempatTinggal] Membuka section Lokasi & Kondisi Tempat Tinggal...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Status Kepemilikan Tempat Tinggal
   */
  async selectStatusKepemilikan(status: string) {
    console.log(`[LokasiKondisiTempatTinggal] Memilih status kepemilikan: ${status}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih status kepemilikan|Milik Sendiri|Sewa|Keluarga|Dinas/i }).first();
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
   * Pilih Kondisi Bangunan
   */
  async selectKondisiBangunan(kondisi: string) {
    console.log(`[LokasiKondisiTempatTinggal] Memilih kondisi bangunan: ${kondisi}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih kondisi bangunan|Permanen|Semi Permanen/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(kondisi, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Akses Jalan
   */
  async selectAksesJalan(akses: string) {
    console.log(`[LokasiKondisiTempatTinggal] Memilih akses jalan: ${akses}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih akses jalan|mobil|motor/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(akses, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Helper dropdown bertingkat untuk Wilayah (Provinsi -> Kota -> Kecamatan -> Kelurahan)
   */
  async selectWilayah(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[LokasiKondisiTempatTinggal] Memilih wilayah: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
    // Pilih Provinsi
    const comboProv = this.page.locator('[role="combobox"], div').filter({ hasText: /Pilih provinsi|Provinsi/i }).first();
    if (await comboProv.isVisible()) {
      await comboProv.click();
      await this.page.waitForTimeout(500);
      const optProv = this.page.locator('[role="listbox"]').getByText(new RegExp(provinsi, 'i')).first();
      if (await optProv.isVisible()) await optProv.click({ force: true });
      await this.page.waitForTimeout(800);
    }

    // Pilih Kota
    const comboKota = this.page.locator('[role="combobox"], div').filter({ hasText: /Pilih kota|Pilih kab|Kota|Kabupaten/i }).first();
    if (await comboKota.isVisible()) {
      await comboKota.click();
      await this.page.waitForTimeout(500);
      const optKota = this.page.locator('[role="listbox"]').getByText(new RegExp(kota.split(' ')[0], 'i')).first();
      if (await optKota.isVisible()) await optKota.click({ force: true });
      await this.page.waitForTimeout(800);
    }

    // Pilih Kecamatan
    const comboKec = this.page.locator('[role="combobox"], div').filter({ hasText: /Pilih kecamatan|Kecamatan/i }).first();
    if (await comboKec.isVisible()) {
      await comboKec.click();
      await this.page.waitForTimeout(500);
      const optKec = this.page.locator('[role="listbox"]').getByText(new RegExp(kecamatan, 'i')).first();
      if (await optKec.isVisible()) await optKec.click({ force: true });
      await this.page.waitForTimeout(800);
    }

    // Pilih Kelurahan
    const comboKel = this.page.locator('[role="combobox"], div').filter({ hasText: /Pilih kelurahan|Kelurahan/i }).first();
    if (await comboKel.isVisible()) {
      await comboKel.click();
      await this.page.waitForTimeout(500);
      const optKel = this.page.locator('[role="listbox"]').getByText(new RegExp(kelurahan, 'i')).first();
      if (await optKel.isVisible()) await optKel.click({ force: true });
      await this.page.waitForTimeout(800);
    }
  }

  /**
   * Mengisi seluruh form Lokasi & Kondisi Tempat Tinggal
   */
  async fillLokasiKondisiTempatTinggal(data: LokasiKondisiTempatTinggalInput) {
    console.log('[LokasiKondisiTempatTinggal] Mengisi data lokasi & kondisi tempat tinggal...');

    if (await this.inputAlamat.isVisible()) await this.inputAlamat.fill(data.alamatLengkap);
    if (await this.inputRt.isVisible()) await this.inputRt.fill(data.rt);
    if (await this.inputRw.isVisible()) await this.inputRw.fill(data.rw);

    await this.selectWilayah(data.provinsi, data.kotaKabupaten, data.kecamatan, data.kelurahan);

    if (await this.inputKodePos.isVisible()) await this.inputKodePos.fill(data.kodePos);

    if (data.statusKepemilikan) {
      await this.selectStatusKepemilikan(data.statusKepemilikan);
    }

    if (data.lamaMenempatiTahun !== undefined && await this.inputLamaMenempatiTahun.isVisible()) {
      await this.inputLamaMenempatiTahun.fill(data.lamaMenempatiTahun.toString());
    }
    if (data.lamaMenempatiBulan !== undefined && await this.inputLamaMenempatiBulan.isVisible()) {
      await this.inputLamaMenempatiBulan.fill(data.lamaMenempatiBulan.toString());
    }

    if (data.luasTanah !== undefined && await this.inputLuasTanah.isVisible()) {
      await this.inputLuasTanah.fill(data.luasTanah.toString());
    }
    if (data.luasBangunan !== undefined && await this.inputLuasBangunan.isVisible()) {
      await this.inputLuasBangunan.fill(data.luasBangunan.toString());
    }

    if (data.kondisiBangunan) {
      await this.selectKondisiBangunan(data.kondisiBangunan);
    }

    if (data.aksesJalan) {
      await this.selectAksesJalan(data.aksesJalan);
    }

    if (data.catatanLingkungan && await this.textareaCatatanLingkungan.isVisible()) {
      await this.textareaCatatanLingkungan.fill(data.catatanLingkungan);
    }

    console.log('✅ Form Lokasi & Kondisi Tempat Tinggal berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[LokasiKondisiTempatTinggal] Menyimpan form Lokasi & Kondisi Tempat Tinggal...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Lokasi & Kondisi Tempat Tinggal tersimpan.');
    }
  }
}
