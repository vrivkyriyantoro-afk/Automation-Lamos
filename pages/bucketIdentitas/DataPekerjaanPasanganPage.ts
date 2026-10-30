import { Page, Locator, expect } from '@playwright/test';

export interface DataPekerjaanPasanganInput {
  statusBekerja: 'Bekerja' | 'Tidak Bekerja' | 'Ibu Rumah Tangga' | 'Pensiunan';
  jenisPekerjaan?: string;
  namaPerusahaan?: string;
  bidangUsaha?: string;
  jabatan?: string;
  lamaBekerjaTahun?: number;
  lamaBekerjaBulan?: number;
  penghasilanBulanan?: number | string;
  alamatKantor?: {
    alamatLengkap: string;
    rt?: string;
    rw?: string;
    provinsi: string;
    kotaKabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    teleponKantor?: string;
  };
}

export class DataPekerjaanPasanganPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Inputs Pekerjaan Pasangan
  readonly inputNamaPerusahaan: Locator;
  readonly inputJabatan: Locator;
  readonly inputLamaBekerjaTahun: Locator;
  readonly inputLamaBekerjaBulan: Locator;
  readonly inputPenghasilanBulanan: Locator;
  readonly inputAlamatKantor: Locator;
  readonly inputRtKantor: Locator;
  readonly inputRwKantor: Locator;
  readonly inputKodePosKantor: Locator;
  readonly inputTeleponKantor: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data pekerjaan pasangan$/i }).first();

    // Inputs Pekerjaan Pasangan
    this.inputNamaPerusahaan = page.locator('input[name="spouseJob.companyName"], input[name="spouse.companyName"], input[placeholder*="perusahaan" i], input[placeholder*="tempat kerja" i]').first();
    this.inputJabatan = page.locator('input[name="spouseJob.position"], input[name="spouse.position"], input[placeholder*="jabatan" i]').first();
    this.inputLamaBekerjaTahun = page.locator('input[name="spouseJob.workingDurationYears"], input[name="spouse.workingDurationYears"], input[placeholder*="tahun" i]').first();
    this.inputLamaBekerjaBulan = page.locator('input[name="spouseJob.workingDurationMonths"], input[name="spouse.workingDurationMonths"], input[placeholder*="bulan" i]').first();
    this.inputPenghasilanBulanan = page.locator('input[name="spouseJob.monthlyIncome"], input[name="spouse.monthlyIncome"], input[placeholder*="penghasilan" i], input[placeholder*="gaji" i]').first();
    this.inputAlamatKantor = page.locator('input[name="spouseJob.officeAddress.address"], textarea[name="spouseJob.officeAddress.address"], input[placeholder*="alamat kantor" i]').first();
    this.inputRtKantor = page.locator('input[name="spouseJob.officeAddress.rt"], input[placeholder*="RT" i]').first();
    this.inputRwKantor = page.locator('input[name="spouseJob.officeAddress.rw"], input[placeholder*="RW" i]').first();
    this.inputKodePosKantor = page.locator('input[name="spouseJob.officeAddress.postalCode"], input[placeholder*="kode pos" i]').first();
    this.inputTeleponKantor = page.locator('input[name="spouseJob.officePhone"], input[placeholder*="telepon kantor" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Pekerjaan Pasangan
   */
  async openSection() {
    console.log('[DataPekerjaanPasangan] Membuka section Data Pekerjaan Pasangan...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Status Bekerja Pasangan
   */
  async selectStatusBekerja(status: string) {
    console.log(`[DataPekerjaanPasangan] Memilih status bekerja pasangan: ${status}`);
    const comboOrRadio = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih status|Bekerja|Tidak Bekerja|Ibu Rumah Tangga/i }).first();
    if (await comboOrRadio.isVisible()) {
      await comboOrRadio.scrollIntoViewIfNeeded();
      await comboOrRadio.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(status, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Jenis Pekerjaan Pasangan
   */
  async selectJenisPekerjaan(jenis: string) {
    console.log(`[DataPekerjaanPasangan] Memilih jenis pekerjaan pasangan: ${jenis}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih jenis pekerjaan|Karyawan|Wiraswasta|Profesional|PNS/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(jenis, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Helper dropdown bertingkat untuk Wilayah Kantor Pasangan
   */
  async selectWilayahKantor(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataPekerjaanPasangan] Memilih wilayah kantor: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
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
   * Mengisi form Data Pekerjaan Pasangan
   */
  async fillDataPekerjaanPasangan(data: DataPekerjaanPasanganInput) {
    console.log('[DataPekerjaanPasangan] Mengisi data pekerjaan pasangan...');
    await this.selectStatusBekerja(data.statusBekerja);

    if (data.statusBekerja === 'Tidak Bekerja' || data.statusBekerja === 'Ibu Rumah Tangga') {
      console.log('[DataPekerjaanPasangan] Pasangan tidak bekerja/IRT, selesai.');
      return;
    }

    if (data.jenisPekerjaan) await this.selectJenisPekerjaan(data.jenisPekerjaan);
    if (data.namaPerusahaan && await this.inputNamaPerusahaan.isVisible()) await this.inputNamaPerusahaan.fill(data.namaPerusahaan);
    if (data.jabatan && await this.inputJabatan.isVisible()) await this.inputJabatan.fill(data.jabatan);

    if (data.lamaBekerjaTahun !== undefined && await this.inputLamaBekerjaTahun.isVisible()) {
      await this.inputLamaBekerjaTahun.fill(data.lamaBekerjaTahun.toString());
    }
    if (data.lamaBekerjaBulan !== undefined && await this.inputLamaBekerjaBulan.isVisible()) {
      await this.inputLamaBekerjaBulan.fill(data.lamaBekerjaBulan.toString());
    }

    if (data.penghasilanBulanan !== undefined && await this.inputPenghasilanBulanan.isVisible()) {
      await this.inputPenghasilanBulanan.fill(data.penghasilanBulanan.toString());
    }

    if (data.alamatKantor) {
      if (await this.inputAlamatKantor.isVisible()) await this.inputAlamatKantor.fill(data.alamatKantor.alamatLengkap);
      if (data.alamatKantor.rt && await this.inputRtKantor.isVisible()) await this.inputRtKantor.fill(data.alamatKantor.rt);
      if (data.alamatKantor.rw && await this.inputRwKantor.isVisible()) await this.inputRwKantor.fill(data.alamatKantor.rw);

      await this.selectWilayahKantor(
        data.alamatKantor.provinsi,
        data.alamatKantor.kotaKabupaten,
        data.alamatKantor.kecamatan,
        data.alamatKantor.kelurahan
      );

      if (await this.inputKodePosKantor.isVisible()) await this.inputKodePosKantor.fill(data.alamatKantor.kodePos);
      if (data.alamatKantor.teleponKantor && await this.inputTeleponKantor.isVisible()) {
        await this.inputTeleponKantor.fill(data.alamatKantor.teleponKantor);
      }
    }

    console.log('✅ Form Data Pekerjaan Pasangan berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataPekerjaanPasangan] Menyimpan form Data Pekerjaan Pasangan...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Pekerjaan Pasangan tersimpan.');
    }
  }
}
