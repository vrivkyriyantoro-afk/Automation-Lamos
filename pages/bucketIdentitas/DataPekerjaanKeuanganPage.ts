import { Page, Locator, expect } from '@playwright/test';

export interface DataPekerjaanKeuanganInput {
  // Pekerjaan
  jenisPekerjaan: string; // 'Karyawan Swasta' | 'PNS / ASN' | 'BUMN' | 'Wiraswasta' | 'Profesional'
  namaPerusahaan: string;
  bidangUsaha?: string;
  jabatan?: string;
  lamaBekerjaTahun?: number;
  lamaBekerjaBulan?: number;
  statusKaryawan?: 'Tetap' | 'Kontrak';
  alamatKantor: {
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

  // Keuangan
  penghasilanPokok: number | string;
  penghasilanTambahan?: number | string;
  totalPengeluaran?: number | string;
  angsuranLain?: number | string;
  nomorRekening?: string;
  namaBank?: string;
}

export class DataPekerjaanKeuanganPage {
  readonly page: Page;

  // Header & Accordion / Navigasi
  readonly menuSection: Locator;

  // Inputs Pekerjaan
  readonly inputNamaPerusahaan: Locator;
  readonly inputJabatan: Locator;
  readonly inputLamaBekerjaTahun: Locator;
  readonly inputLamaBekerjaBulan: Locator;
  readonly inputAlamatKantor: Locator;
  readonly inputRtKantor: Locator;
  readonly inputRwKantor: Locator;
  readonly inputKodePosKantor: Locator;
  readonly inputTeleponKantor: Locator;

  // Inputs Keuangan
  readonly inputPenghasilanPokok: Locator;
  readonly inputPenghasilanTambahan: Locator;
  readonly inputTotalPengeluaran: Locator;
  readonly inputAngsuranLain: Locator;
  readonly inputNomorRekening: Locator;

  // Tombol Aksi
  readonly btnSimpan: Locator;
  readonly btnLanjut: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu / Accordion Header
    this.menuSection = page.locator('div, span, p, button, a').filter({ hasText: /^Data pekerjaan & keuangan$/i }).first();

    // Inputs Pekerjaan
    this.inputNamaPerusahaan = page.locator('input[name="companyName"], input[name="namaPerusahaan"], input[placeholder*="perusahaan" i], input[placeholder*="tempat kerja" i]').first();
    this.inputJabatan = page.locator('input[name="position"], input[name="jabatan"], input[placeholder*="jabatan" i]').first();
    this.inputLamaBekerjaTahun = page.locator('input[name="workingDurationYears"], input[name="lamaBekerjaTahun"], input[placeholder*="tahun" i]').first();
    this.inputLamaBekerjaBulan = page.locator('input[name="workingDurationMonths"], input[name="lamaBekerjaBulan"], input[placeholder*="bulan" i]').first();
    this.inputAlamatKantor = page.locator('input[name="officeAddress.address"], textarea[name="officeAddress.address"], input[placeholder*="alamat kantor" i], textarea[placeholder*="alamat kantor" i]').first();
    this.inputRtKantor = page.locator('input[name="officeAddress.rt"], input[placeholder*="RT" i]').first();
    this.inputRwKantor = page.locator('input[name="officeAddress.rw"], input[placeholder*="RW" i]').first();
    this.inputKodePosKantor = page.locator('input[name="officeAddress.postalCode"], input[placeholder*="kode pos" i]').first();
    this.inputTeleponKantor = page.locator('input[name="officePhone"], input[name="teleponKantor"], input[placeholder*="telepon kantor" i]').first();

    // Inputs Keuangan
    this.inputPenghasilanPokok = page.locator('input[name="mainIncome"], input[name="penghasilanPokok"], input[name="gajiPokok"], input[placeholder*="penghasilan" i], input[placeholder*="gaji" i]').first();
    this.inputPenghasilanTambahan = page.locator('input[name="sideIncome"], input[name="penghasilanTambahan"], input[placeholder*="tambahan" i]').first();
    this.inputTotalPengeluaran = page.locator('input[name="monthlyExpense"], input[name="pengeluaran"], input[placeholder*="pengeluaran" i]').first();
    this.inputAngsuranLain = page.locator('input[name="otherInstallment"], input[name="angsuranLain"], input[placeholder*="angsuran" i]').first();
    this.inputNomorRekening = page.locator('input[name="accountNumber"], input[name="nomorRekening"], input[placeholder*="rekening" i]').first();

    // Tombol
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan Perubahan/i }).or(page.locator('button:has-text("Simpan")')).first();
    this.btnLanjut = page.getByRole('button', { name: /Lanjut|Selanjutnya|Next/i }).or(page.locator('button:has-text("Lanjut")')).first();
  }

  /**
   * Buka section form Data Pekerjaan & Keuangan
   */
  async openSection() {
    console.log('[DataPekerjaanKeuangan] Membuka section Data Pekerjaan & Keuangan...');
    await this.menuSection.scrollIntoViewIfNeeded();
    await this.menuSection.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Jenis Pekerjaan
   */
  async selectJenisPekerjaan(jenis: string) {
    console.log(`[DataPekerjaanKeuangan] Memilih jenis pekerjaan: ${jenis}`);
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
   * Pilih Bidang Usaha / Industri
   */
  async selectBidangUsaha(bidang: string) {
    console.log(`[DataPekerjaanKeuangan] Memilih bidang usaha: ${bidang}`);
    const combo = this.page.locator('[role="combobox"], div, button').filter({ hasText: /Pilih bidang usaha|Sektor/i }).first();
    if (await combo.isVisible()) {
      await combo.scrollIntoViewIfNeeded();
      await combo.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(bidang, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Pilih Status Karyawan
   */
  async selectStatusKaryawan(status: 'Tetap' | 'Kontrak') {
    console.log(`[DataPekerjaanKeuangan] Memilih status karyawan: ${status}`);
    const comboOrRadio = this.page.getByRole('radio', { name: status })
      .or(this.page.locator('label').filter({ hasText: new RegExp(`^${status}$`, 'i') }))
      .or(this.page.locator('[role="combobox"]').filter({ hasText: /Pilih status karyawan/i }));

    if (await comboOrRadio.isVisible()) {
      await comboOrRadio.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Helper dropdown bertingkat untuk Wilayah Kantor
   */
  async selectWilayahKantor(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataPekerjaanKeuangan] Memilih wilayah kantor: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);
    
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
   * Mengisi form Data Pekerjaan & Keuangan
   */
  async fillDataPekerjaanKeuangan(data: DataPekerjaanKeuanganInput) {
    console.log('[DataPekerjaanKeuangan] Mengisi data pekerjaan & keuangan...');

    if (data.jenisPekerjaan) {
      await this.selectJenisPekerjaan(data.jenisPekerjaan);
    }

    if (await this.inputNamaPerusahaan.isVisible()) await this.inputNamaPerusahaan.fill(data.namaPerusahaan);
    if (data.bidangUsaha) await this.selectBidangUsaha(data.bidangUsaha);
    if (data.jabatan && await this.inputJabatan.isVisible()) await this.inputJabatan.fill(data.jabatan);

    if (data.lamaBekerjaTahun !== undefined && await this.inputLamaBekerjaTahun.isVisible()) {
      await this.inputLamaBekerjaTahun.fill(data.lamaBekerjaTahun.toString());
    }
    if (data.lamaBekerjaBulan !== undefined && await this.inputLamaBekerjaBulan.isVisible()) {
      await this.inputLamaBekerjaBulan.fill(data.lamaBekerjaBulan.toString());
    }

    if (data.statusKaryawan) {
      await this.selectStatusKaryawan(data.statusKaryawan);
    }

    // Alamat Kantor
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

    // Keuangan
    if (await this.inputPenghasilanPokok.isVisible()) await this.inputPenghasilanPokok.fill(data.penghasilanPokok.toString());
    if (data.penghasilanTambahan && await this.inputPenghasilanTambahan.isVisible()) {
      await this.inputPenghasilanTambahan.fill(data.penghasilanTambahan.toString());
    }
    if (data.totalPengeluaran && await this.inputTotalPengeluaran.isVisible()) {
      await this.inputTotalPengeluaran.fill(data.totalPengeluaran.toString());
    }
    if (data.angsuranLain && await this.inputAngsuranLain.isVisible()) {
      await this.inputAngsuranLain.fill(data.angsuranLain.toString());
    }
    if (data.nomorRekening && await this.inputNomorRekening.isVisible()) {
      await this.inputNomorRekening.fill(data.nomorRekening);
    }

    console.log('✅ Form Data Pekerjaan & Keuangan berhasil diisi!');
  }

  /**
   * Simpan form
   */
  async saveForm() {
    console.log('[DataPekerjaanKeuangan] Menyimpan form Data Pekerjaan & Keuangan...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Data Pekerjaan & Keuangan tersimpan.');
    }
  }
}
