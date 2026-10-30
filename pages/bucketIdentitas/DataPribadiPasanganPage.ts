import { Page, Locator, expect } from '@playwright/test';

export interface DataPribadiPasanganInput {
  hasPasangan: boolean;
  nik?: string;
  namaLengkap?: string;
  gelar?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  namaIbuKandung?: string;
  agama?: string;
  pendidikanTerakhir?: string;
  npwp?: string;
  nomorHp?: string;
  email?: string;
  pisahHarta?: boolean;
  alamatSamaDenganDebitur?: boolean;
  alamatKtp?: {
    alamatLengkap: string;
    rt: string;
    rw: string;
    provinsi: string;
    kotaKabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
  };
}

export class DataPribadiPasanganPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Radio Memiliki Pasangan
  readonly radioHasPasanganYa: Locator;
  readonly radioHasPasanganTidak: Locator;

  // Inputs Pasangan
  readonly inputNik: Locator;
  readonly inputNamaLengkap: Locator;
  readonly inputGelar: Locator;
  readonly inputTempatLahir: Locator;
  readonly inputTanggalLahir: Locator;
  readonly inputNamaIbuKandung: Locator;
  readonly inputNpwp: Locator;
  readonly inputNomorHp: Locator;
  readonly inputEmail: Locator;

  // Pisah Harta & Alamat
  readonly radioPisahHartaYa: Locator;
  readonly radioPisahHartaTidak: Locator;
  readonly radioAlamatSamaYa: Locator;
  readonly radioAlamatSamaTidak: Locator;

  // Alamat Pasangan (jika beda)
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
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data pribadi pasangan$/i }).first();

    // Radio Memiliki Pasangan
    this.radioHasPasanganYa = page.locator('label').filter({ hasText: /^Ya$/i }).or(page.locator('input[type="radio"][value="true"]')).first();
    this.radioHasPasanganTidak = page.locator('label').filter({ hasText: /^Tidak$/i }).or(page.locator('input[type="radio"][value="false"]')).first();

    // Inputs Pasangan
    this.inputNik = page.locator('input[name="spouse.nik"], input[name="spouse.identityNumber"], input[placeholder*="NIK pasangan" i], input[placeholder*="NIK" i]').first();
    this.inputNamaLengkap = page.locator('input[name="spouse.fullName"], input[name="spouse.name"], input[placeholder*="nama pasangan" i], input[placeholder*="nama lengkap" i]').first();
    this.inputGelar = page.locator('input[name="spouse.title"], input[placeholder*="gelar" i]').first();
    this.inputTempatLahir = page.locator('input[name="spouse.birthPlace"], input[placeholder*="tempat lahir" i]').first();
    this.inputTanggalLahir = page.locator('input[name="spouse.birthDate"], input[placeholder*="tanggal lahir" i]').first();
    this.inputNamaIbuKandung = page.locator('input[name="spouse.motherMaidenName"], input[placeholder*="ibu kandung" i]').first();
    this.inputNpwp = page.locator('input[name="spouse.npwp"], input[placeholder*="NPWP" i]').first();
    this.inputNomorHp = page.locator('input[name="spouse.phoneNumber"], input[name="spouse.mobilePhone"], input[placeholder*="telepon" i], input[placeholder*="no. hp" i]').first();
    this.inputEmail = page.locator('input[name="spouse.email"], input[type="email"], input[placeholder*="email" i]').first();

    // Pisah Harta
    this.radioPisahHartaYa = page.locator('label').filter({ hasText: /Ada|Ya/i }).first();
    this.radioPisahHartaTidak = page.locator('label').filter({ hasText: /Tidak/i }).first();

    // Alamat Sama
    this.radioAlamatSamaYa = page.locator('label').filter({ hasText: /^Ya$/i }).last();
    this.radioAlamatSamaTidak = page.locator('label').filter({ hasText: /^Tidak$/i }).last();

    // Alamat
    this.inputAlamat = page.locator('input[name="spouse.idCardAddress.address"], textarea[name="spouse.idCardAddress.address"], input[placeholder*="alamat" i]').first();
    this.inputRt = page.locator('input[name="spouse.idCardAddress.rt"], input[placeholder*="RT" i]').first();
    this.inputRw = page.locator('input[name="spouse.idCardAddress.rw"], input[placeholder*="RW" i]').first();
    this.inputKodePos = page.locator('input[name="spouse.idCardAddress.postalCode"], input[placeholder*="kode pos" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Pribadi Pasangan
   */
  async openSection() {
    console.log('[DataPribadiPasangan] Membuka section Data Pribadi Pasangan...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Atur opsi apakah memiliki pasangan
   */
  async setHasPasangan(hasPasangan: boolean = true) {
    if (hasPasangan) {
      console.log('[DataPribadiPasangan] Memilih opsi: Memiliki Pasangan = Ya');
      if (await this.radioHasPasanganYa.isVisible()) await this.radioHasPasanganYa.click({ force: true });
    } else {
      console.log('[DataPribadiPasangan] Memilih opsi: Memiliki Pasangan = Tidak');
      if (await this.radioHasPasanganTidak.isVisible()) await this.radioHasPasanganTidak.click({ force: true });
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Pilih Jenis Kelamin Pasangan
   */
  async selectJenisKelamin(gender: 'Laki-laki' | 'Perempuan') {
    console.log(`[DataPribadiPasangan] Memilih jenis kelamin pasangan: ${gender}`);
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
   * Pilih Agama
   */
  async selectAgama(agama: string) {
    console.log(`[DataPribadiPasangan] Memilih agama pasangan: ${agama}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih agama|Islam|Kristen|Katolik|Hindu|Buddha/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(agama, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Pendidikan Terakhir
   */
  async selectPendidikan(pendidikan: string) {
    console.log(`[DataPribadiPasangan] Memilih pendidikan pasangan: ${pendidikan}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih pendidikan|SMA|D3|S1|S2|S3/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(pendidikan, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Helper dropdown bertingkat untuk Wilayah Pasangan
   */
  async selectWilayah(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataPribadiPasangan] Memilih wilayah: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
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
   * Mengisi form Data Pribadi Pasangan
   */
  async fillDataPribadiPasangan(data: DataPribadiPasanganInput) {
    console.log('[DataPribadiPasangan] Mengisi data pribadi pasangan...');
    await this.setHasPasangan(data.hasPasangan);

    if (!data.hasPasangan) {
      console.log('[DataPribadiPasangan] Tidak memiliki pasangan, form selesai.');
      return;
    }

    if (data.nik && await this.inputNik.isVisible()) await this.inputNik.fill(data.nik);
    if (data.namaLengkap && await this.inputNamaLengkap.isVisible()) await this.inputNamaLengkap.fill(data.namaLengkap);
    if (data.gelar && await this.inputGelar.isVisible()) await this.inputGelar.fill(data.gelar);
    if (data.tempatLahir && await this.inputTempatLahir.isVisible()) await this.inputTempatLahir.fill(data.tempatLahir);
    if (data.tanggalLahir && await this.inputTanggalLahir.isVisible()) await this.inputTanggalLahir.fill(data.tanggalLahir);

    if (data.jenisKelamin) await this.selectJenisKelamin(data.jenisKelamin);
    if (data.namaIbuKandung && await this.inputNamaIbuKandung.isVisible()) await this.inputNamaIbuKandung.fill(data.namaIbuKandung);
    if (data.agama) await this.selectAgama(data.agama);
    if (data.pendidikanTerakhir) await this.selectPendidikan(data.pendidikanTerakhir);
    if (data.npwp && await this.inputNpwp.isVisible()) await this.inputNpwp.fill(data.npwp);
    if (data.nomorHp && await this.inputNomorHp.isVisible()) await this.inputNomorHp.fill(data.nomorHp);
    if (data.email && await this.inputEmail.isVisible()) await this.inputEmail.fill(data.email);

    if (data.pisahHarta !== undefined) {
      if (data.pisahHarta) {
        if (await this.radioPisahHartaYa.isVisible()) await this.radioPisahHartaYa.click({ force: true });
      } else {
        if (await this.radioPisahHartaTidak.isVisible()) await this.radioPisahHartaTidak.click({ force: true });
      }
    }

    if (data.alamatSamaDenganDebitur !== undefined) {
      if (data.alamatSamaDenganDebitur) {
        if (await this.radioAlamatSamaYa.isVisible()) await this.radioAlamatSamaYa.click({ force: true });
      } else {
        if (await this.radioAlamatSamaTidak.isVisible()) await this.radioAlamatSamaTidak.click({ force: true });
        if (data.alamatKtp) {
          if (await this.inputAlamat.isVisible()) await this.inputAlamat.fill(data.alamatKtp.alamatLengkap);
          if (await this.inputRt.isVisible()) await this.inputRt.fill(data.alamatKtp.rt);
          if (await this.inputRw.isVisible()) await this.inputRw.fill(data.alamatKtp.rw);
          await this.selectWilayah(
            data.alamatKtp.provinsi,
            data.alamatKtp.kotaKabupaten,
            data.alamatKtp.kecamatan,
            data.alamatKtp.kelurahan
          );
          if (await this.inputKodePos.isVisible()) await this.inputKodePos.fill(data.alamatKtp.kodePos);
        }
      }
    }

    console.log('✅ Form Data Pribadi Pasangan berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataPribadiPasangan] Menyimpan form Data Pribadi Pasangan...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Pribadi Pasangan tersimpan.');
    }
  }
}
