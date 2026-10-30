import { Page, Locator, expect } from '@playwright/test';

export interface DataPribadiInput {
  nik: string;
  namaLengkap: string;
  gelar?: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD atau DD/MM/YYYY
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  statusPerkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
  namaIbuKandung: string;
  agama?: string;
  pendidikanTerakhir?: string;
  npwp?: string;
  nomorHp: string;
  email?: string;
  alamatKtp: {
    alamatLengkap: string;
    rt: string;
    rw: string;
    provinsi: string;
    kotaKabupaten: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    statusKepemilikanRumah?: string;
    lamaMenetapTahun?: number;
    lamaMenetapBulan?: number;
  };
  alamatDomisiliSamaDenganKtp?: boolean;
  alamatDomisili?: {
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

export class DataPribadiPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Input Data Pribadi
  readonly inputNik: Locator;
  readonly inputNamaLengkap: Locator;
  readonly inputGelar: Locator;
  readonly inputTempatLahir: Locator;
  readonly inputTanggalLahir: Locator;
  readonly inputNamaIbuKandung: Locator;
  readonly inputNpwp: Locator;
  readonly inputNomorHp: Locator;
  readonly inputEmail: Locator;

  // Alamat KTP
  readonly inputAlamatKtp: Locator;
  readonly inputRtKtp: Locator;
  readonly inputRwKtp: Locator;
  readonly inputKodePosKtp: Locator;
  readonly inputLamaMenetapTahun: Locator;
  readonly inputLamaMenetapBulan: Locator;

  // Checkbox / Radio Alamat Domisili
  readonly radioDomisiliSamaYa: Locator;
  readonly radioDomisiliSamaTidak: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data pribadi$/i }).first();

    // Inputs Data Pribadi
    this.inputNik = page.locator('input[name="nik"], input[name="identityNumber"], input[placeholder*="NIK" i], input[placeholder*="KTP" i]').first();
    this.inputNamaLengkap = page.locator('input[name="fullName"], input[name="name"], input[placeholder*="nama lengkap" i], input[placeholder*="nama sesuai KTP" i]').first();
    this.inputGelar = page.locator('input[name="title"], input[name="gelar"], input[placeholder*="gelar" i]').first();
    this.inputTempatLahir = page.locator('input[name="birthPlace"], input[name="tempatLahir"], input[placeholder*="tempat lahir" i]').first();
    this.inputTanggalLahir = page.locator('input[name="birthDate"], input[name="tanggalLahir"], input[placeholder*="tanggal lahir" i]').first();
    this.inputNamaIbuKandung = page.locator('input[name="motherMaidenName"], input[name="namaIbuKandung"], input[placeholder*="ibu kandung" i]').first();
    this.inputNpwp = page.locator('input[name="npwp"], input[placeholder*="NPWP" i]').first();
    this.inputNomorHp = page.locator('input[name="phoneNumber"], input[name="mobilePhone"], input[name="nomorHp"], input[placeholder*="telepon" i], input[placeholder*="nomor handphone" i], input[placeholder*="no. hp" i]').first();
    this.inputEmail = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first();

    // Alamat KTP
    this.inputAlamatKtp = page.locator('input[name="idCardAddress.address"], textarea[name="idCardAddress.address"], input[placeholder*="alamat KTP" i], textarea[placeholder*="alamat KTP" i], input[name="alamatKtp"]').first();
    this.inputRtKtp = page.locator('input[name="idCardAddress.rt"], input[name="rt"], input[placeholder*="RT" i]').first();
    this.inputRwKtp = page.locator('input[name="idCardAddress.rw"], input[name="rw"], input[placeholder*="RW" i]').first();
    this.inputKodePosKtp = page.locator('input[name="idCardAddress.postalCode"], input[name="postalCode"], input[placeholder*="kode pos" i]').first();
    this.inputLamaMenetapTahun = page.locator('input[name="lamaMenetapTahun"], input[name="stayDurationYears"], input[placeholder*="tahun" i]').first();
    this.inputLamaMenetapBulan = page.locator('input[name="lamaMenetapBulan"], input[name="stayDurationMonths"], input[placeholder*="bulan" i]').first();

    // Radio Domisili
    this.radioDomisiliSamaYa = page.locator('label').filter({ hasText: /^Ya$/i }).or(page.locator('input[type="radio"][value="true"]')).first();
    this.radioDomisiliSamaTidak = page.locator('label').filter({ hasText: /^Tidak$/i }).or(page.locator('input[type="radio"][value="false"]')).first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Pribadi
   */
  async openSection() {
    console.log('[DataPribadi] Membuka section Data Pribadi...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Jenis Kelamin
   */
  async selectJenisKelamin(gender: 'Laki-laki' | 'Perempuan') {
    console.log(`[DataPribadi] Memilih jenis kelamin: ${gender}`);
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
   * Pilih Status Perkawinan
   */
  async selectStatusPerkawinan(status: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati') {
    console.log(`[DataPribadi] Memilih status perkawinan: ${status}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih status perkawinan|Belum Menikah|Menikah|Cerai/i }).first();
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
   * Pilih Agama
   */
  async selectAgama(agama: string) {
    console.log(`[DataPribadi] Memilih agama: ${agama}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih agama|Islam|Kristen|Katolik|Hindu|Buddha|Konghucu/i }).first();
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
    console.log(`[DataPribadi] Memilih pendidikan terakhir: ${pendidikan}`);
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
   * Helper dropdown bertingkat untuk Wilayah (Provinsi -> Kota -> Kecamatan -> Kelurahan)
   */
  async selectWilayah(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataPribadi] Memilih wilayah: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
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
   * Mengisi seluruh form Data Pribadi
   */
  async fillDataPribadi(data: DataPribadiInput) {
    console.log(`[DataPribadi] Mengisi data pribadi untuk: ${data.namaLengkap} (${data.nik})...`);

    if (await this.inputNik.isVisible()) await this.inputNik.fill(data.nik);
    if (await this.inputNamaLengkap.isVisible()) await this.inputNamaLengkap.fill(data.namaLengkap);
    if (data.gelar && await this.inputGelar.isVisible()) await this.inputGelar.fill(data.gelar);
    if (await this.inputTempatLahir.isVisible()) await this.inputTempatLahir.fill(data.tempatLahir);
    if (await this.inputTanggalLahir.isVisible()) await this.inputTanggalLahir.fill(data.tanggalLahir);

    await this.selectJenisKelamin(data.jenisKelamin);
    await this.selectStatusPerkawinan(data.statusPerkawinan);

    if (await this.inputNamaIbuKandung.isVisible()) await this.inputNamaIbuKandung.fill(data.namaIbuKandung);
    if (data.agama) await this.selectAgama(data.agama);
    if (data.pendidikanTerakhir) await this.selectPendidikan(data.pendidikanTerakhir);
    if (data.npwp && await this.inputNpwp.isVisible()) await this.inputNpwp.fill(data.npwp);
    if (await this.inputNomorHp.isVisible()) await this.inputNomorHp.fill(data.nomorHp);
    if (data.email && await this.inputEmail.isVisible()) await this.inputEmail.fill(data.email);

    // Alamat KTP
    if (await this.inputAlamatKtp.isVisible()) await this.inputAlamatKtp.fill(data.alamatKtp.alamatLengkap);
    if (await this.inputRtKtp.isVisible()) await this.inputRtKtp.fill(data.alamatKtp.rt);
    if (await this.inputRwKtp.isVisible()) await this.inputRwKtp.fill(data.alamatKtp.rw);

    await this.selectWilayah(
      data.alamatKtp.provinsi,
      data.alamatKtp.kotaKabupaten,
      data.alamatKtp.kecamatan,
      data.alamatKtp.kelurahan
    );

    if (await this.inputKodePosKtp.isVisible()) await this.inputKodePosKtp.fill(data.alamatKtp.kodePos);

    if (data.alamatKtp.lamaMenetapTahun !== undefined && await this.inputLamaMenetapTahun.isVisible()) {
      await this.inputLamaMenetapTahun.fill(data.alamatKtp.lamaMenetapTahun.toString());
    }
    if (data.alamatKtp.lamaMenetapBulan !== undefined && await this.inputLamaMenetapBulan.isVisible()) {
      await this.inputLamaMenetapBulan.fill(data.alamatKtp.lamaMenetapBulan.toString());
    }

    // Opsi Domisili sama dengan KTP
    if (data.alamatDomisiliSamaDenganKtp !== undefined) {
      if (data.alamatDomisiliSamaDenganKtp) {
        if (await this.radioDomisiliSamaYa.isVisible()) await this.radioDomisiliSamaYa.click({ force: true });
      } else {
        if (await this.radioDomisiliSamaTidak.isVisible()) await this.radioDomisiliSamaTidak.click({ force: true });
      }
    }

    console.log('✅ Form Data Pribadi berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataPribadi] Menyimpan form Data Pribadi...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Pribadi tersimpan.');
    }
  }
}
