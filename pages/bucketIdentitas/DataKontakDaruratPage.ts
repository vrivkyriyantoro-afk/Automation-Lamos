import { Page, Locator, expect } from '@playwright/test';

export interface DataKontakDaruratInput {
  namaLengkap: string;
  hubungan: string; // 'Orang Tua' | 'Saudara Kandung' | 'Anak' | 'Kerabat' | 'Rekan Kerja' | 'Lainnya'
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  nomorHp: string;
  nomorTeleponRumah?: string;
  alamatLengkap: string;
  rt: string;
  rw: string;
  provinsi: string;
  kotaKabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
}

export class DataKontakDaruratPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Inputs Kontak Darurat
  readonly inputNamaLengkap: Locator;
  readonly inputNomorHp: Locator;
  readonly inputTeleponRumah: Locator;
  readonly inputAlamat: Locator;
  readonly inputRt: Locator;
  readonly inputRw: Locator;
  readonly inputKodePos: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data kontak darurat$/i }).first();

    // Inputs
    this.inputNamaLengkap = page.locator('input[name="emergencyContact.fullName"], input[name="emergencyContact.name"], input[placeholder*="nama kontak darurat" i], input[placeholder*="nama lengkap" i]').first();
    this.inputNomorHp = page.locator('input[name="emergencyContact.phoneNumber"], input[name="emergencyContact.mobilePhone"], input[placeholder*="nomor handphone" i], input[placeholder*="telepon" i], input[placeholder*="no. hp" i]').first();
    this.inputTeleponRumah = page.locator('input[name="emergencyContact.homePhone"], input[placeholder*="telepon rumah" i]').first();
    this.inputAlamat = page.locator('input[name="emergencyContact.address.address"], textarea[name="emergencyContact.address.address"], input[placeholder*="alamat" i], textarea[placeholder*="alamat" i]').first();
    this.inputRt = page.locator('input[name="emergencyContact.address.rt"], input[placeholder*="RT" i]').first();
    this.inputRw = page.locator('input[name="emergencyContact.address.rw"], input[placeholder*="RW" i]').first();
    this.inputKodePos = page.locator('input[name="emergencyContact.address.postalCode"], input[placeholder*="kode pos" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Kontak Darurat
   */
  async openSection() {
    console.log('[DataKontakDarurat] Membuka section Data Kontak Darurat...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Hubungan dengan Debitur
   */
  async selectHubungan(hubungan: string) {
    console.log(`[DataKontakDarurat] Memilih hubungan kontak darurat: ${hubungan}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih hubungan|Orang Tua|Saudara|Anak|Kerabat|Rekan/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(hubungan, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Jenis Kelamin Kontak Darurat
   */
  async selectJenisKelamin(gender: 'Laki-laki' | 'Perempuan') {
    console.log(`[DataKontakDarurat] Memilih jenis kelamin: ${gender}`);
    const radioOrCombo = this.page.getByRole('radio', { name: gender })
      .or(this.page.locator('label').filter({ hasText: new RegExp(`^${gender}$`, 'i') }))
      .or(this.page.locator('div, [role="combobox"]').filter({ hasText: /Pilih jenis kelamin/i }));

    if (await radioOrCombo.isVisible()) {
      await radioOrCombo.click({ force: true });
      const opt = this.page.locator('[role="listbox"]').getByText(gender, { exact: true }).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Helper dropdown bertingkat untuk Wilayah Kontak Darurat
   */
  async selectWilayah(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataKontakDarurat] Memilih wilayah: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
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
   * Mengisi form Data Kontak Darurat
   */
  async fillDataKontakDarurat(data: DataKontakDaruratInput) {
    console.log(`[DataKontakDarurat] Mengisi data kontak darurat: ${data.namaLengkap}...`);

    if (await this.inputNamaLengkap.isVisible()) await this.inputNamaLengkap.fill(data.namaLengkap);
    if (data.hubungan) await this.selectHubungan(data.hubungan);
    if (data.jenisKelamin) await this.selectJenisKelamin(data.jenisKelamin);

    if (await this.inputNomorHp.isVisible()) await this.inputNomorHp.fill(data.nomorHp);
    if (data.nomorTeleponRumah && await this.inputTeleponRumah.isVisible()) {
      await this.inputTeleponRumah.fill(data.nomorTeleponRumah);
    }

    if (await this.inputAlamat.isVisible()) await this.inputAlamat.fill(data.alamatLengkap);
    if (await this.inputRt.isVisible()) await this.inputRt.fill(data.rt);
    if (await this.inputRw.isVisible()) await this.inputRw.fill(data.rw);

    await this.selectWilayah(data.provinsi, data.kotaKabupaten, data.kecamatan, data.kelurahan);

    if (await this.inputKodePos.isVisible()) await this.inputKodePos.fill(data.kodePos);

    console.log('✅ Form Data Kontak Darurat berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataKontakDarurat] Menyimpan form Data Kontak Darurat...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Kontak Darurat tersimpan.');
    }
  }
}
