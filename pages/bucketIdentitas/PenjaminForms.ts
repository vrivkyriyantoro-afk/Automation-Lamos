// Manual (bukan generated). Dibuat dari explore-output/penjamin-schemas.json (tests/bucketIdentitas/explore-penjamin-schemas.spec.ts).
import { Page, Locator, expect } from '@playwright/test';
import { DataPenjaminSection } from './DataPenjaminSection';
import { Dropdown, Checkbox, escapeRegex } from '../components/FormControls';

/**
 * Catatan perilaku aplikasi (SIT, 2026-10-12):
 * - Section "Data Penjamin" TIDAK punya tombol Simpan. Perubahan (radio "Ya", tipe penjamin, isian field)
 *   tersimpan otomatis ke server.
 * - Field penjamin ber-id `<name>_<guarantorId>-r..`; atribut `name` stabil, mis. `personalGuarantee.name`.
 * - Tipe penjamin: dropdown `typeGuarantee` = "Personal Guarantee" | "Corporate Guarantee".
 * - Modal "Tambah pengurus/pemegang saham" tidak ber-role dialog; Simpan modal disabled sampai form valid.
 */

export type JenisKelamin = 'Laki-Laki' | 'Perempuan';
export type StatusPerkawinan = 'Menikah' | 'Belum Menikah' | 'Janda / Duda';
export type OrganBadanUsaha = 'Pemegang Saham' | 'Pemegang Saham dari Pemegang Saham' | 'Pengurus' | 'Pengurus dari Pemegang Saham';
export type JenisBadanUsaha = 'Perseroan Terbatas' | 'Persekutuan Comanditer' | 'Koperasi Toko' | 'Perusahaan Perseorangan' | 'Yayasan';

export interface AlamatIndonesia {
  alamat: string;
  rt: string;
  rw: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "1985-02-06" -> "06 Feb 1985" (format tampilan react-datepicker di LAMOS) */
export function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d.padStart(2, '0')} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** Combobox berdasarkan prefix id; mendukung id `key-r..` (modal) dan `key_<guarantorId>-r..` (penjamin) */
function dropdown(root: Locator, key: string, index = 0): Dropdown {
  return new Dropdown(root, key, root.locator(`[role="combobox"][id^="${key}-r"], [role="combobox"][id^="${key}_"]`).nth(index));
}

function input(root: Locator, name: string, index = 0): Locator {
  return root.locator(`input[name="${name}"], textarea[name="${name}"]`).nth(index);
}

async function fillText(root: Locator, name: string, value: string | number, index = 0) {
  const el = input(root, name, index);
  await el.scrollIntoViewIfNeeded();
  await el.fill(String(value));
}

/** react-datepicker: ketik "DD MMM YYYY" lalu Enter */
async function fillDate(root: Locator, name: string, iso: string, index = 0) {
  const el = input(root, name, index);
  await el.scrollIntoViewIfNeeded();
  await el.click();
  await el.fill(toDisplayDate(iso));
  await el.press('Enter');
  await el.press('Escape').catch(() => {});
}

/** Radio berdasarkan atribut name + teks opsi (lebih stabil daripada label grup) */
async function checkRadio(root: Locator, name: string, option: string, index = 0) {
  const container = root.locator('[class*="radio-container"]')
    .filter({ has: root.page().locator(`input[type="radio"][name="${name}"]`) })
    .filter({ hasText: new RegExp(`^\\s*${escapeRegex(option)}\\s*$`, 'i') })
    .nth(index);
  await container.scrollIntoViewIfNeeded();
  const radio = container.locator('input[type="radio"]');
  if (await radio.isChecked()) return;
  await radio.check({ force: true }).catch(() => container.click());
  await expect(radio).toBeChecked();
}

/** Normalisasi nama wilayah: "KOTA ADM. JAKARTA PUSAT" / "Kota Jakarta Pusat" -> "jakarta pusat" */
export function normalizeWilayah(s: string): string {
  return s.toLowerCase()
    .replace(/\b(kota\s+adm(inistrasi)?\.?|kabupaten\s+adm(inistrasi)?\.?|kota|kabupaten|kab\.?|provinsi|prov\.?)\s+/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dropdown wilayah bertingkat dengan search. Nama di master data sering beda format
 * (mis. "DKI Jakarta" vs "DKI JAKARTA", tanpa prefix "KOTA ADM."), jadi pencarian memakai kata kunci inti
 * lalu memilih opsi pertama yang memuat kata kunci tsb.
 */
async function selectWilayah(dd: Dropdown, name: string) {
  const combo = dd.locator;
  await combo.scrollIntoViewIfNeeded();
  await expect(combo).not.toHaveAttribute('aria-disabled', 'true', { timeout: 15000 });
  const key = normalizeWilayah(name);
  const id = await combo.getAttribute('id');
  const items = combo.page().locator(`[id="${id}-listbox"] li:not(.sticky) button`);
  await combo.click();
  const search = combo.locator('[data-testid="dropdownsearch-input-search"]');
  if (await search.isVisible().catch(() => false)) await search.fill(key.split(' ').slice(-2).join(' '));
  // Hasil search dimuat async: tunggu daftar stabil (2 bacaan berturut-turut sama) dan ada yang cocok
  const match = (texts: string[]) => {
    const exact = texts.findIndex(t => normalizeWilayah(t) === key);
    return exact >= 0 ? exact : texts.findIndex(t => normalizeWilayah(t).includes(key));
  };
  let texts: string[] = [];
  let prev = '';
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    await combo.page().waitForTimeout(500);
    texts = (await items.allInnerTexts()).map(t => t.trim());
    const sig = texts.join('|');
    if (texts.length && sig === prev && match(texts) >= 0) break;
    prev = sig;
  }
  const idx = match(texts);
  if (idx < 0) throw new Error(`Wilayah "${name}" tidak ditemukan. Opsi: ${texts.slice(0, 15).join(' | ')}`);
  const target = items.filter({ hasText: new RegExp(`^\\s*${escapeRegex(texts[idx])}\\s*$`) }).first();
  // Di modal, listbox bisa dirender di luar viewport → fallback klik via DOM
  await target.click({ timeout: 5000 }).catch(() => target.dispatchEvent('click', undefined, { timeout: 5000 }));
  await expect(combo).toHaveAttribute('aria-expanded', 'false');
}

async function fillAlamat(root: Locator, prefix: string, a: AlamatIndonesia, index = 0) {
  await fillText(root, `${prefix}.address`, a.alamat, index);
  await fillText(root, `${prefix}.rt`, a.rt, index);
  await fillText(root, `${prefix}.rw`, a.rw, index);
  await selectWilayah(dropdown(root, `${prefix}.province`, index), a.provinsi);
  await selectWilayah(dropdown(root, `${prefix}.city`, index), a.kota);
  await selectWilayah(dropdown(root, `${prefix}.district`, index), a.kecamatan);
  await selectWilayah(dropdown(root, `${prefix}.subdistrict`, index), a.kelurahan);
  await fillText(root, `${prefix}.postalCode`, a.kodePos, index);
}

async function uploadFile(root: Locator, idPrefix: string, file: string | undefined, index = 0) {
  if (!file) return;
  await root.locator(`input[type="file"][id^="${idPrefix}"]`).nth(index).setInputFiles(file);
}

// ---------------------------------------------------------------- Penjamin perorangan

export interface PersonalGuaranteeData {
  kewarganegaraan: 'WNI';
  nomorKtp: string;
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  tempatLahir?: string;
  tanggalLahir: string; // ISO yyyy-mm-dd
  statusPerkawinan: StatusPerkawinan;
  namaIbuKandung: string;
  npwp: string;
  nomorHp: string;
  alamatKtp: AlamatIndonesia;
  domisiliSamaDenganKtp?: boolean;
  alamatDomisili?: AlamatIndonesia;
  fileKtp?: string;
}

export interface SpouseData {
  kewarganegaraan: 'WNI';
  nomorKtp: string;
  namaLengkap: string;
  tempatLahir?: string;
  tanggalLahir: string;
  namaIbuKandung: string;
  npwp: string;
  nomorHp: string;
  domisiliSamaDenganPenjamin?: boolean;
  alamatDomisili?: AlamatIndonesia;
  fileKtp?: string;
}

// ---------------------------------------------------------------- Penjamin badan usaha

export interface CorporateGuaranteeData {
  namaPerusahaan: string;
  npwp: string;
  nomorAktaPendirian: string;
  tanggalAktaPendirian: string;
  nomorAktaPerubahan: string;
  tanggalAktaPerubahan: string;
  nib: string;
  alamat: AlamatIndonesia;
  fileNpwp?: string;
}

/**
 * Section "Data Penjamin" lengkap: radio penjamin, tipe penjamin, form Personal/Corporate Guarantee.
 * `index` = urutan kartu penjamin di "List penjamin" (0-based).
 */
export class DataPenjaminForm extends DataPenjaminSection {
  constructor(page: Page, readonly index = 0) {
    super(page);
  }

  get tipePenjamin() { return dropdown(this.root, 'typeGuarantee', this.index); }
  get btnTambahPenjamin() { return this.root.getByRole('button', { name: /Penjamin$/ }).last(); }
  get btnTambahPengurus() { return this.root.getByRole('button', { name: /Pengurus\/Pemegang Saham/ }).nth(this.index); }

  async setMemilikiPenjamin(ya: boolean) {
    await this.debiturMemilikiPenjamin.select(ya ? 'Ya' : 'Tidak');
    if (ya) await this.tipePenjamin.locator.waitFor({ timeout: 20000 });
  }

  async pilihTipe(tipe: 'Personal Guarantee' | 'Corporate Guarantee') {
    // Teks dropdown bisa tidak sinkron dengan form yang tampil (terlihat "Personal Guarantee" padahal field
    // Corporate yang dirender), jadi selalu pilih ulang lalu tunggu field penanda tipe muncul.
    const marker = tipe === 'Personal Guarantee' ? 'personalGuarantee.name' : 'corporateGuarantee.name';
    const other = tipe === 'Personal Guarantee' ? 'Corporate Guarantee' : 'Personal Guarantee';
    await this.tipePenjamin.select(tipe);
    if (!(await input(this.root, marker, this.index).isVisible({ timeout: 3000 }).catch(() => false))) {
      await this.tipePenjamin.select(other);
      await this.tipePenjamin.select(tipe);
    }
    await input(this.root, marker, this.index).waitFor({ timeout: 20000 });
  }

  // ------------------------------------------------ Personal Guarantee
  async fillPersonal(d: PersonalGuaranteeData) {
    const r = this.root, i = this.index, p = 'personalGuarantee';
    await checkRadio(r, `${p}.nationality`, d.kewarganegaraan, i);
    await fillText(r, `${p}.wni.identityNumber`, d.nomorKtp, i);
    await fillText(r, `${p}.name`, d.namaLengkap, i);
    await dropdown(r, `${p}.gender`, i).select(d.jenisKelamin);
    if (d.tempatLahir) await fillText(r, `${p}.placeOfBirth`, d.tempatLahir, i);
    await fillDate(r, `${p}.dateOfBirth`, d.tanggalLahir, i);
    await dropdown(r, `${p}.maritalStatus`, i).select(d.statusPerkawinan);
    await fillText(r, `${p}.wni.motherMaidenName`, d.namaIbuKandung, i);
    await fillText(r, `${p}.npwp`, d.npwp, i);
    await fillText(r, `${p}.phoneNumber`, d.nomorHp, i);
    await fillAlamat(r, `${p}.identityAddress.indonesia`, d.alamatKtp, i);
    if (d.domisiliSamaDenganKtp) {
      await new Checkbox(r, 'Sama dengan alamat sesuai KTP').set(true);
    } else if (d.alamatDomisili) {
      await checkRadio(r, `${p}.domicileAddress.country`, 'Indonesia', i);
      await fillAlamat(r, `${p}.domicileAddress.indonesia`, d.alamatDomisili, i);
    }
    await uploadFile(r, `${p}.wni.ktpFiles`, d.fileKtp, i);
  }

  /** Data pasangan; hanya muncul bila status perkawinan = Menikah */
  async fillSpouse(d: SpouseData) {
    const r = this.root, i = this.index, p = 'personalGuarantee.spouse';
    await input(r, `${p}.name`, i).waitFor({ timeout: 15000 });
    await checkRadio(r, `${p}.nationality`, d.kewarganegaraan, i);
    await fillText(r, `${p}.wni.identityNumber`, d.nomorKtp, i);
    await fillText(r, `${p}.name`, d.namaLengkap, i);
    if (d.tempatLahir) await fillText(r, `${p}.placeOfBirth`, d.tempatLahir, i);
    await fillDate(r, `${p}.dateOfBirth`, d.tanggalLahir, i);
    await fillText(r, `${p}.wni.motherMaidenName`, d.namaIbuKandung, i);
    await fillText(r, `${p}.npwp`, d.npwp, i);
    await fillText(r, `${p}.phoneNumber`, d.nomorHp, i);
    if (d.domisiliSamaDenganPenjamin) {
      await new Checkbox(r, 'Sama dengan alamat tempat tinggal penjamin saat ini').set(true);
    } else if (d.alamatDomisili) {
      await checkRadio(r, `${p}.domicileAddress.country`, 'Indonesia', i);
      await fillAlamat(r, `${p}.domicileAddress.indonesia`, d.alamatDomisili, i);
    }
    await uploadFile(r, `${p}.wni.ktpFiles`, d.fileKtp, i);
  }

  // ------------------------------------------------ Corporate Guarantee
  async fillCorporate(d: CorporateGuaranteeData) {
    const r = this.root, i = this.index, p = 'corporateGuarantee';
    await fillText(r, `${p}.name`, d.namaPerusahaan, i);
    await fillText(r, `${p}.npwp`, d.npwp, i);
    await fillText(r, `${p}.nomorAktaPendirian`, d.nomorAktaPendirian, i);
    await fillDate(r, `${p}.tanggalAktaPendirian`, d.tanggalAktaPendirian, i);
    await fillText(r, `${p}.nomorAktaPerubahanTerakhir`, d.nomorAktaPerubahan, i);
    await fillDate(r, `${p}.tanggalAktaPerubahanTerakhir`, d.tanggalAktaPerubahan, i);
    await fillText(r, `${p}.nomorIzinBerusaha`, d.nib, i);
    await fillAlamat(r, `${p}.businessAddress`, d.alamat, i);
    await uploadFile(r, `${p}.npwpFiles`, d.fileNpwp, i);
  }

  /** Nilai input berdasarkan name (untuk assertion) */
  field(name: string) { return input(this.root, name, this.index); }

  /** Teks terpilih pada dropdown berdasarkan key, mis. `personalGuarantee.maritalStatus` */
  async dropdownValue(key: string) { return dropdown(this.root, key, this.index).value(); }

  /** Baris pada "Daftar nama" pengurus/pemegang saham yang memuat teks */
  pengurusRow(text: string | RegExp) {
    return this.root.locator('tr, li, [class*="card"]').filter({ hasText: text }).first();
  }

  async openTambahPengurus(): Promise<PengurusModal> {
    await this.btnTambahPengurus.scrollIntoViewIfNeeded();
    await this.btnTambahPengurus.click();
    const lanjut = this.page.getByRole('button', { name: 'Lanjutkan Edit' });
    if (await lanjut.isVisible({ timeout: 1500 }).catch(() => false)) await lanjut.click();
    return new PengurusModal(this.page).waitOpen();
  }
}

// ---------------------------------------------------------------- Modal pengurus / pemegang saham

interface PengurusBase {
  organ: OrganBadanUsaha;
  pangsaKepemilikan: number;
  alamat: AlamatIndonesia;
  file?: string;
}

export interface PengurusWniData extends PengurusBase {
  nomorKtp: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  namaIbuKandung?: string;
  npwp: string;
  jabatan: string;
}

export interface PengurusWnaData extends PengurusBase {
  nomorPaspor: string;
  masaBerlakuPaspor: string;
  nomorKitas?: string;
  masaBerlakuKitas?: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  npwp?: string;
  jabatan: string;
  fileKitas?: string;
}

export interface PengurusBadanUsahaData extends PengurusBase {
  npwp: string;
  nama: string;
  jenisBadanUsaha: JenisBadanUsaha;
  nomorAktaPendirian: string;
  tanggalAktaPendirian: string;
  adaAktaPerubahan: boolean;
}

export class PengurusModal {
  constructor(readonly page: Page) {}

  /**
   * Modal tanpa role=dialog, dan tombol/radiogroup di dalamnya tidak punya accessible name
   * (getByRole tidak bisa dipakai) → pakai CSS + teks.
   */
  get root(): Locator {
    return this.page.locator('div').filter({
      has: this.page.locator('h4').filter({ hasText: /^\s*Tambah pengurus\/pemegang saham\s*$/ }),
    }).filter({
      has: this.page.locator('button').filter({ hasText: /^\s*Batalkan\s*$/ }),
    }).last();
  }
  get btnSimpan() { return this.root.locator('button').filter({ hasText: /^\s*Simpan\s*$/ }).last(); }
  get btnBatalkan() { return this.root.locator('button').filter({ hasText: /^\s*Batalkan\s*$/ }).last(); }

  async waitOpen() {
    await this.root.locator('input[name="tipeOrganBadanUsaha"]').first().waitFor({ state: 'attached', timeout: 15000 });
    return this;
  }

  private async base(tipe: 'Perseorangan' | 'Badan Usaha', organ: OrganBadanUsaha) {
    await checkRadio(this.root, 'tipeOrganBadanUsaha', tipe);
    await dropdown(this.root, 'organBadanUsaha').select(organ);
  }

  async fillPerseoranganWni(d: PengurusWniData) {
    const r = this.root, p = 'perseorangan';
    await this.base('Perseorangan', d.organ);
    await checkRadio(r, `${p}.nationality`, 'WNI');
    await fillText(r, `${p}.wni.identityNumber`, d.nomorKtp);
    await fillText(r, `${p}.name`, d.nama);
    await dropdown(r, `${p}.gender`).select(d.jenisKelamin);
    await fillDate(r, `${p}.dateOfBirth`, d.tanggalLahir);
    if (d.namaIbuKandung) await fillText(r, `${p}.motherMaidenName`, d.namaIbuKandung);
    await fillText(r, `${p}.npwp`, d.npwp);
    await fillText(r, `${p}.jobPosition`, d.jabatan);
    await checkRadio(r, `${p}.shareholderAddress.country`, 'Indonesia');
    await fillAlamat(r, `${p}.shareholderAddress.indonesia`, d.alamat);
    await fillText(r, `${p}.pangsaKepemilikan`, d.pangsaKepemilikan);
    await uploadFile(r, `${p}.wni.ktpFiles`, d.file);
  }

  async fillPerseoranganWna(d: PengurusWnaData) {
    const r = this.root, p = 'perseorangan';
    await this.base('Perseorangan', d.organ);
    await checkRadio(r, `${p}.nationality`, 'WNA');
    await fillText(r, `${p}.wna.pasporNumber`, d.nomorPaspor);
    await fillDate(r, `${p}.wna.pasporEndDate`, d.masaBerlakuPaspor);
    if (d.nomorKitas) await fillText(r, `${p}.wna.kimKitasNumber`, d.nomorKitas);
    if (d.masaBerlakuKitas) await fillDate(r, `${p}.wna.kimKitasEndDate`, d.masaBerlakuKitas);
    await fillText(r, `${p}.name`, d.nama);
    await dropdown(r, `${p}.gender`).select(d.jenisKelamin);
    if (d.npwp) await fillText(r, `${p}.npwp`, d.npwp);
    await fillText(r, `${p}.jobPosition`, d.jabatan);
    await checkRadio(r, `${p}.shareholderAddress.country`, 'Indonesia');
    await fillAlamat(r, `${p}.shareholderAddress.indonesia`, d.alamat);
    await fillText(r, `${p}.pangsaKepemilikan`, d.pangsaKepemilikan);
    await uploadFile(r, `${p}.wna.pasporFiles`, d.file);
    await uploadFile(r, `${p}.wna.kimKitasFiles`, d.fileKitas);
  }

  async fillBadanUsaha(d: PengurusBadanUsahaData) {
    const r = this.root, p = 'badanUsaha';
    await this.base('Badan Usaha', d.organ);
    await fillText(r, `${p}.npwp`, d.npwp);
    await fillText(r, `${p}.name`, d.nama);
    await dropdown(r, `${p}.businessType`).select(d.jenisBadanUsaha);
    await fillText(r, `${p}.nomorAktaPendirian`, d.nomorAktaPendirian);
    await fillDate(r, `${p}.tanggalAktaPendirian`, d.tanggalAktaPendirian);
    // radiogroup di modal tidak terbaca lewat getByRole → klik berdasarkan teks opsi
    await checkRadioByText(r, d.adaAktaPerubahan ? 'Ya' : 'Tidak');
    await fillAlamat(r, `${p}.npwpAddress`, d.alamat);
    await fillText(r, `${p}.pangsaKepemilikan`, d.pangsaKepemilikan);
    await uploadFile(r, `${p}.npwpFiles`, d.file);
  }

  field(name: string) { return input(this.root, name); }

  /** Simpan modal (MENULIS data ke server) */
  async simpan() {
    await expect(this.btnSimpan).toBeEnabled({ timeout: 10000 });
    await this.btnSimpan.click();
    await this.btnSimpan.waitFor({ state: 'detached', timeout: 15000 });
  }

  async batalkan() {
    await this.btnBatalkan.click();
    await this.btnBatalkan.waitFor({ state: 'detached', timeout: 10000 });
  }
}

/** Radio tanpa atribut name (mis. "Ada akta perubahan terakhir?"): klik berdasarkan teks, opsi terakhir yang cocok */
async function checkRadioByText(root: Locator, option: string) {
  const c = root.locator('[class*="radio-container"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(option)}\\s*$`, 'i') }).last();
  await c.locator('input[type="radio"]').check({ force: true }).catch(() => c.click());
}
