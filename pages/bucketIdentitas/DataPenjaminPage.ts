import { Page, Locator, expect } from '@playwright/test';
import { BadanUsahaData } from '../../utils/dataGenerator';

export class DataPenjaminPage {
  readonly page: Page;

  // Header & Accordion
  readonly penjaminAccordion: Locator;
  readonly radioHasPenjaminYa: Locator;
  readonly radioHasPenjaminTidak: Locator;
  readonly btnTambahPenjamin: Locator;

  // Corporate Guarantee Fields
  readonly inputNamaPerusahaan: Locator;
  readonly inputNpwpPerusahaan: Locator;
  readonly inputNoAktaPendirian: Locator;
  readonly inputTglAktaPendirian: Locator;
  readonly inputNoAktaPerubahan: Locator;
  readonly inputTglAktaPerubahan: Locator;
  readonly inputNib: Locator;

  // Alamat Usaha
  readonly inputAlamat: Locator;
  readonly inputRt: Locator;
  readonly inputRw: Locator;
  readonly inputKodePos: Locator;

  // Tombol Simpan
  readonly btnSimpan: Locator;

  constructor(page: Page) {
    this.page = page;

    // Accordion / Menu
    this.penjaminAccordion = page.locator('div, span, p, button').filter({ hasText: /^Data Penjamin$/i }).first();
    this.radioHasPenjaminYa = page.locator('input[type="radio"][value="true"]').or(page.getByLabel('Ya')).first();
    this.radioHasPenjaminTidak = page.locator('input[type="radio"][value="false"]').or(page.getByLabel('Tidak')).first();
    this.btnTambahPenjamin = page.getByRole('button', { name: /Tambah Penjamin/i }).first();

    // Corporate Guarantee Inputs
    this.inputNamaPerusahaan = page.locator('input[name="corporateGuarantee.name"]');
    this.inputNpwpPerusahaan = page.locator('input[name="corporateGuarantee.npwp"]');
    this.inputNoAktaPendirian = page.locator('input[name="corporateGuarantee.nomorAktaPendirian"]');
    this.inputTglAktaPendirian = page.locator('input[name="corporateGuarantee.tanggalAktaPendirian"]');
    this.inputNoAktaPerubahan = page.locator('input[name="corporateGuarantee.nomorAktaPerubahanTerakhir"]');
    this.inputTglAktaPerubahan = page.locator('input[name="corporateGuarantee.tanggalAktaPerubahanTerakhir"]');
    this.inputNib = page.locator('input[name="corporateGuarantee.nomorIzinBerusaha"]');

    // Alamat Usaha
    this.inputAlamat = page.locator('input[name="corporateGuarantee.businessAddress.address"]');
    this.inputRt = page.locator('input[name="corporateGuarantee.businessAddress.rt"]');
    this.inputRw = page.locator('input[name="corporateGuarantee.businessAddress.rw"]');
    this.inputKodePos = page.locator('input[name="corporateGuarantee.businessAddress.postalCode"]');

    // Tombol Simpan
    this.btnSimpan = page.getByRole('button', { name: /Simpan|Simpan perubahan/i }).first();
  }

  /**
   * Buka section Data Penjamin
   */
  async openDataPenjaminSection() {
    console.log('[DataPenjamin] Membuka section Data Penjamin...');
    const penjaminMenu = this.page.locator('div, button, a, p, span').filter({ hasText: /^Data penjamin$/i }).first();
    await penjaminMenu.scrollIntoViewIfNeeded();
    await penjaminMenu.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih opsi "Debitur memiliki penjamin? -> Ya"
   */
  async setHasPenjamin(hasPenjamin: boolean = true) {
    if (hasPenjamin) {
      console.log('[DataPenjamin] Memilih opsi: Debitur Memiliki Penjamin = Ya');
      const radioYa = this.page.locator('label').filter({ hasText: /^Ya$/i }).first()
        .or(this.page.locator('input[type="radio"][value="true"]'));
      await radioYa.click({ force: true });
    } else {
      console.log('[DataPenjamin] Memilih opsi: Debitur Memiliki Penjamin = Tidak');
      const radioTidak = this.page.locator('label').filter({ hasText: /^Tidak$/i }).first()
        .or(this.page.locator('input[type="radio"][value="false"]'));
      await radioTidak.click({ force: true });
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Pilih Tipe Penjamin: Badan Usaha
   */
  async selectTipePenjaminBadanUsaha(penjaminIndex: number = 1) {
    console.log(`[DataPenjamin] Memilih tipe penjamin "Badan Usaha" pada Penjamin #${penjaminIndex}...`);
    
    // Cari dropdown tipe penjamin
    const tipePenjaminCombos = this.page.locator('div, button, [role="combobox"]').filter({ hasText: /Pilih tipe penjamin|Perorangan|Badan Usaha|Corporate/i });
    const targetCombo = tipePenjaminCombos.nth(penjaminIndex - 1);
    
    await targetCombo.scrollIntoViewIfNeeded();
    await targetCombo.click();
    await this.page.waitForTimeout(500);

    const badanUsahaOption = this.page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]')
      .filter({ hasText: /Badan Usaha|Corporate/i })
      .first();

    if (await badanUsahaOption.isVisible()) {
      await badanUsahaOption.click({ force: true });
      console.log('[DataPenjamin] Berhasil memilih tipe penjamin: Badan Usaha');
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Mengisi seluruh Form Data Penjamin Badan Usaha
   */
  async fillCorporateGuaranteeData(data: BadanUsahaData) {
    console.log(`[DataPenjamin] Mengisi data perusahaan: ${data.namaBadanUsaha}...`);

    // 1. Nama Perusahaan
    await this.inputNamaPerusahaan.scrollIntoViewIfNeeded();
    await this.inputNamaPerusahaan.fill(data.namaBadanUsaha);

    // 2. NPWP Perusahaan
    await this.inputNpwpPerusahaan.fill(data.npwpBadanUsaha);

    // 3. Akta Pendirian
    await this.inputNoAktaPendirian.fill(data.aktaPendirian.nomorAkta);
    await this.inputTglAktaPendirian.fill(data.aktaPendirian.tanggalAkta);

    // 4. Akta Perubahan Terakhir
    if (data.aktaPerubahanTerakhir) {
      await this.inputNoAktaPerubahan.fill(data.aktaPerubahanTerakhir.nomorAkta);
      await this.inputTglAktaPerubahan.fill(data.aktaPerubahanTerakhir.tanggalAkta);
    }

    // 5. NIB (Nomor Induk Berusaha)
    await this.inputNib.fill(data.nib);

    // 6. Alamat Tempat Usaha
    console.log('[DataPenjamin] Mengisi alamat domisili usaha...');
    await this.inputAlamat.fill(data.alamatDomisili.alamatLengkap);
    await this.inputRt.fill(data.alamatDomisili.rtRw.split('/')[0] || '001');
    await this.inputRw.fill(data.alamatDomisili.rtRw.split('/')[1] || '001');

    // 7. Dropdown Wilayah (Provinsi, Kota, Kecamatan, Kelurahan)
    await this.selectWilayah(
      data.alamatDomisili.provinsi,
      data.alamatDomisili.kotaKabupaten,
      data.alamatDomisili.kecamatan,
      data.alamatDomisili.kelurahan
    );

    // 8. Kode Pos
    await this.inputKodePos.fill(data.alamatDomisili.kodePos);

    console.log('✅ Form Penjamin Badan Usaha berhasil diisi lengkap!');
  }

  /**
   * Helper memilih dropdown wilayah (Provinsi -> Kota -> Kecamatan -> Kelurahan)
   */
  async selectWilayah(provinsi: string, kota: string, kecamatan: string, kelurahan: string) {
    console.log(`[DataPenjamin] Memilih wilayah: ${provinsi} -> ${kota} -> ${kecamatan} -> ${kelurahan}`);

    const wilayahCombos = this.page.locator('[role="combobox"]').filter({ hasText: /Pilih provinsi|Pilih kota|Pilih kecamatan|Pilih kelurahan|DKI|JAKARTA|KEMAYORAN|SUMUR/i });
    
    // Pilih Provinsi
    const comboProv = wilayahCombos.nth(0);
    if (await comboProv.isVisible()) {
      await comboProv.scrollIntoViewIfNeeded();
      await comboProv.click();
      await this.page.waitForTimeout(500);
      const optProv = this.page.locator('[role="listbox"]').getByText(new RegExp(provinsi, 'i')).first();
      if (await optProv.isVisible()) await optProv.click({ force: true });
      await this.page.waitForTimeout(1000);
    }

    // Pilih Kota
    const comboKota = this.page.locator('[role="combobox"]').filter({ hasText: /Pilih kota|Pilih kab|JAKARTA/i }).first();
    if (await comboKota.isVisible()) {
      await comboKota.click();
      await this.page.waitForTimeout(500);
      const optKota = this.page.locator('[role="listbox"]').getByText(new RegExp(kota.split(' ')[0], 'i')).first();
      if (await optKota.isVisible()) await optKota.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Helper membuka modal Tambah Pengurus / Pemegang Saham
   */
  async openTambahPengurusModal() {
    console.log('[DataPenjamin] Membuka modal Tambah Pengurus/Pemegang Saham...');
    const btnTambah = this.page.locator('button').filter({ hasText: /Pengurus\/Pemegang Saham|\+ Pengurus/i }).first();
    await btnTambah.scrollIntoViewIfNeeded();
    await btnTambah.click();
    await this.page.waitForTimeout(1000);

    // Handle dialog "Edit data ini? -> Lanjutkan Edit" jika muncul
    const btnLanjutkanEdit = this.page.getByRole('button', { name: 'Lanjutkan Edit' }).or(this.page.locator('button:has-text("Lanjutkan Edit")')).first();
    if (await btnLanjutkanEdit.isVisible()) {
      console.log('⚠️ Dialog konfirmasi muncul -> Klik "Lanjutkan Edit"...');
      await btnLanjutkanEdit.click();
      await this.page.waitForTimeout(1500);
    }
  }

  /**
   * Menambahkan Data Pengurus / Pemegang Saham tipe PERSEORANGAN
   */
  async addPengurusPerseorangan(data: {
    organBadanUsaha: string; // misal: "Pemegang Saham"
    nama: string;
    jenisKelamin: 'Laki-laki' | 'Perempuan';
    npwp?: string;
    jabatan: string;
    alamat: string;
    rt: string;
    rw: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    porsiKepemilikan: number; // misal: 60
  }) {
    console.log(`\n[DataPenjamin] Menambahkan Pengurus PERSEORANGAN: "${data.nama}"...`);
    await this.openTambahPengurusModal();

    // 1. Pilih Radio "Perseorangan"
    const radioPerseorangan = this.page.getByText('Perseorangan', { exact: true }).last();
    await radioPerseorangan.click({ force: true });
    await this.page.waitForTimeout(500);

    // 2. Pilih Organ Badan Usaha
    const comboOrgan = this.page.getByText('Pilih tipe organ badan usaha').last();
    if (await comboOrgan.isVisible()) {
      await comboOrgan.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(data.organBadanUsaha, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // 3. Kewarganegaraan -> WNI
    const radioWni = this.page.getByText('WNI', { exact: true }).first();
    if (await radioWni.isVisible()) await radioWni.click({ force: true });

    // 4. Nama
    const inputNama = this.page.locator('input[placeholder="Masukkan nama"]').first();
    await inputNama.fill(data.nama);

    // 5. Jenis Kelamin
    const comboJK = this.page.getByText('Pilih jenis kelamin').last();
    if (await comboJK.isVisible()) {
      await comboJK.click({ force: true });
      await this.page.waitForTimeout(500);
      const optJK = this.page.locator('[role="listbox"]').getByText(data.jenisKelamin, { exact: true }).first();
      if (await optJK.isVisible()) await optJK.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // 6. NPWP (opsional)
    if (data.npwp) {
      const inputNpwp = this.page.locator('input[placeholder="Masukkan NPWP"]').first();
      if (await inputNpwp.isVisible()) await inputNpwp.fill(data.npwp);
    }

    // 7. Jabatan
    const inputJabatan = this.page.locator('input[placeholder="Masukkan jabatan"]').first();
    if (await inputJabatan.isVisible()) await inputJabatan.fill(data.jabatan);

    // 8. Negara -> Indonesia
    const radioIndo = this.page.getByText('Indonesia', { exact: true }).first();
    if (await radioIndo.isVisible()) await radioIndo.click({ force: true });

    // 9. Pangsa Kepemilikan (%)
    const inputPorsi = this.page.locator('input[placeholder="Masukkan porsi kepemilikan"]').first();
    if (await inputPorsi.isVisible()) await inputPorsi.fill(data.porsiKepemilikan.toString());

    // 10. Klik Simpan Modal
    const btnSimpanModal = this.page.locator('button').filter({ hasText: /^Simpan$/i }).last();
    await btnSimpanModal.click({ force: true });
    console.log(`✅ Pengurus Perseorangan "${data.nama}" berhasil disimpan!`);
    await this.page.waitForTimeout(2500);
  }

  /**
   * Menambahkan Data Pengurus / Pemegang Saham tipe BADAN USAHA
   */
  async addPengurusBadanUsaha(data: {
    organBadanUsaha: string; // misal: "Pemegang Saham"
    npwpBadanUsaha: string;
    namaBadanUsaha: string;
    jenisBadanUsaha: 'PT' | 'CV' | 'UD' | 'Koperasi';
    nomorAktaPendirian: string;
    tanggalAktaPendirian: string;
    adaAktaPerubahan?: boolean;
    alamat: string;
    rt: string;
    rw: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan: string;
    kodePos: string;
    porsiKepemilikan: number; // misal: 40
  }) {
    console.log(`\n[DataPenjamin] Menambahkan Pengurus BADAN USAHA: "${data.namaBadanUsaha}"...`);
    await this.openTambahPengurusModal();

    // 1. Pilih Radio "Badan Usaha"
    const radioBadanUsaha = this.page.getByText('Badan Usaha', { exact: true }).last();
    await radioBadanUsaha.click({ force: true });
    await this.page.waitForTimeout(500);

    // 2. Pilih Organ Badan Usaha
    const comboOrgan = this.page.getByText('Pilih tipe organ badan usaha').last();
    if (await comboOrgan.isVisible()) {
      await comboOrgan.click({ force: true });
      await this.page.waitForTimeout(500);
      const opt = this.page.locator('[role="listbox"]').getByText(new RegExp(data.organBadanUsaha, 'i')).first();
      if (await opt.isVisible()) await opt.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // 3. NPWP Badan Usaha
    const inputNpwp = this.page.locator('input[name="badanUsaha.npwp"]').or(this.page.locator('input[placeholder="Masukkan NPWP badan usaha"]')).first();
    await inputNpwp.fill(data.npwpBadanUsaha);

    // 4. Nama Badan Usaha
    const inputNama = this.page.locator('input[name="badanUsaha.name"]').or(this.page.locator('input[placeholder="Masukkan nama"]')).first();
    await inputNama.fill(data.namaBadanUsaha);

    // 5. Jenis Badan Usaha (PT / CV)
    const comboJenis = this.page.getByText('Pilih jenis badan usaha').last();
    if (await comboJenis.isVisible()) {
      await comboJenis.click({ force: true });
      await this.page.waitForTimeout(500);
      const optJenis = this.page.locator('[role="listbox"]').getByText(data.jenisBadanUsaha, { exact: true }).first();
      if (await optJenis.isVisible()) await optJenis.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // 6. Akta Pendirian
    const inputNoAkta = this.page.locator('input[name="badanUsaha.nomorAktaPendirian"]').or(this.page.locator('input[placeholder="Masukkan nomor akta pendirian"]')).first();
    await inputNoAkta.fill(data.nomorAktaPendirian);

    const inputTglAkta = this.page.locator('input[name="badanUsaha.tanggalAktaPendirian"]').or(this.page.locator('input[placeholder="Pilih tanggal akta pendirian"]')).first();
    await inputTglAkta.fill(data.tanggalAktaPendirian);

    // 7. Ada akta perubahan? -> Tidak
    const radioPerubahanTidak = this.page.locator('label').filter({ hasText: /^Tidak$/i }).last();
    if (await radioPerubahanTidak.isVisible()) await radioPerubahanTidak.click({ force: true });

    // 8. Alamat Sesuai NPWP
    const inputAlamat = this.page.locator('input[name="badanUsaha.npwpAddress.address"]').or(this.page.locator('input[placeholder="Masukkan alamat"]')).last();
    await inputAlamat.fill(data.alamat);

    const inputRt = this.page.locator('input[name="badanUsaha.npwpAddress.rt"]').or(this.page.locator('input[placeholder="Masukkan RT"]')).last();
    await inputRt.fill(data.rt);

    const inputRw = this.page.locator('input[name="badanUsaha.npwpAddress.rw"]').or(this.page.locator('input[placeholder="Masukkan RW"]')).last();
    await inputRw.fill(data.rw);

    const inputKodePos = this.page.locator('input[name="badanUsaha.npwpAddress.postalCode"]').or(this.page.locator('input[placeholder="Masukkan kode pos"]')).last();
    await inputKodePos.fill(data.kodePos);

    // 9. Pangsa Kepemilikan (%)
    const inputPorsi = this.page.locator('input[name="badanUsaha.pangsaKepemilikan"]').or(this.page.locator('input[placeholder="Masukkan porsi kepemilikan"]')).first();
    if (await inputPorsi.isVisible()) await inputPorsi.fill(data.porsiKepemilikan.toString());

    // 10. Klik Simpan Modal
    const btnSimpanModal = this.page.locator('button').filter({ hasText: /^Simpan$/i }).last();
    await btnSimpanModal.click({ force: true });
    console.log(`✅ Pengurus Badan Usaha "${data.namaBadanUsaha}" berhasil disimpan!`);
    await this.page.waitForTimeout(2500);
  }

  /**
   * Klik tombol Simpan form penjamin utama
   */
  async saveForm() {
    console.log('[DataPenjamin] Menyimpan form...');
    await this.btnSimpan.scrollIntoViewIfNeeded();
    if (await this.btnSimpan.isEnabled()) {
      await this.btnSimpan.click();
      console.log('✅ Form Data Penjamin berhasil disimpan!');
      await this.page.waitForTimeout(2000);
    }
  }
}

