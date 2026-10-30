// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, TextInput } from '../components/FormControls';

export interface DataKontakDaruratData {
  /** Nama lengkap* [text] */
  name?: string;
  /** Hubungan keluarga* [dropdown] */
  relationship?: 'Anak' | 'Lainnya' | 'Orang Tua' | 'Saudara Kandung';
  /** Nomor HP* [text] */
  mobileNumber?: string;
  /** No. Telepon Rumah [text] */
  telephoneNumber?: string;
  /** Alamat* [text] - Alamat tempat tinggal saat ini */
  address?: string;
  /** RT / RW* [text] - Alamat tempat tinggal saat ini */
  rt?: string;
  /** RT / RW* [text] - Alamat tempat tinggal saat ini */
  rw?: string;
  /** Provinsi* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  province?: string;
  /** Kota/kabupaten* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  city?: string;
  /** Kecamatan* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  district?: string;
  /** Kelurahan* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  subdistrict?: string;
  /** Kode pos* [text] - Alamat tempat tinggal saat ini */
  postalCode?: string;
}

/**
 * Section "Data kontak darurat" - bucket identitas_pengecekan
 */
export class DataKontakDaruratSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data kontak darurat';
  readonly sidebarTitle = 'Data kontak darurat';

  /** Nama lengkap* [text] */
  get name() { return new TextInput(this.root, 'name'); }
  /** Hubungan keluarga* [dropdown] */
  get relationship() { return new Dropdown(this.root, 'relationship'); }
  /** Nomor HP* [text] */
  get mobileNumber() { return new TextInput(this.root, 'mobileNumber'); }
  /** No. Telepon Rumah [text] */
  get telephoneNumber() { return new TextInput(this.root, 'telephoneNumber'); }
  /** Alamat* [text] - Alamat tempat tinggal saat ini */
  get address() { return new TextInput(this.root, 'address'); }
  /** RT / RW* [text] - Alamat tempat tinggal saat ini */
  get rt() { return new TextInput(this.root, 'rt'); }
  /** RT / RW* [text] - Alamat tempat tinggal saat ini */
  get rw() { return new TextInput(this.root, 'rw'); }
  /** Provinsi* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  get province() { return new Dropdown(this.root, 'province'); }
  /** Kota/kabupaten* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  get city() { return new Dropdown(this.root, 'city'); }
  /** Kecamatan* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  get district() { return new Dropdown(this.root, 'district'); }
  /** Kelurahan* [dropdown] - Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya */
  get subdistrict() { return new Dropdown(this.root, 'subdistrict'); }
  /** Kode pos* [text] - Alamat tempat tinggal saat ini */
  get postalCode() { return new TextInput(this.root, 'postalCode'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: DataKontakDaruratData) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.relationship !== undefined) await this.relationship.select(data.relationship);
    if (data.mobileNumber !== undefined) await this.mobileNumber.fill(data.mobileNumber);
    if (data.telephoneNumber !== undefined) await this.telephoneNumber.fill(data.telephoneNumber);
    if (data.address !== undefined) await this.address.fill(data.address);
    if (data.rt !== undefined) await this.rt.fill(data.rt);
    if (data.rw !== undefined) await this.rw.fill(data.rw);
    if (data.province !== undefined) await this.province.select(data.province);
    if (data.city !== undefined) await this.city.select(data.city);
    if (data.district !== undefined) await this.district.select(data.district);
    if (data.subdistrict !== undefined) await this.subdistrict.select(data.subdistrict);
    if (data.postalCode !== undefined) await this.postalCode.fill(data.postalCode);
  }
}
