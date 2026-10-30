// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { DateInput, Dropdown, FileUpload, RadioGroup, TextInput } from '../components/FormControls';

export interface DataPribadiData {
  /** Nomor KTP* [text] (disabled saat explore / auto-fill) */
  identityNumber?: string;
  /** Nama lengkap* [text] (disabled saat explore / auto-fill) */
  name?: string;
  /** Jenis kelamin* [dropdown] (disabled saat explore / auto-fill) */
  gender?: string;
  /** Tempat & tanggal lahir* [text] */
  placeOfBirth?: string;
  /** Tempat & tanggal lahir* [date] (disabled saat explore / auto-fill) format "DD MMM YYYY", mis. "01 Jan 1990" */
  dateOfBirth?: string;
  /** Status perkawinan* [dropdown] */
  maritalStatus?: 'Menikah' | 'Belum Menikah' | 'Janda / Duda';
  /** Nama gadis ibu kandung* [text] */
  motherMaidenName?: string;
  /** NPWP* [text] */
  npwp?: string;
  /** Nomor HP* [text] */
  phoneNumber?: string;
  /** Apakah debitur merupakan nasabah Bank Sinarmas* [radio] */
  apakahDebiturMerupakanNasabahBankSinarmas?: 'Ya' | 'Tidak';
  /** Alamat* [text] - Alamat sesuai KTP */
  identityAddressAddress?: string;
  /** RT / RW* [text] - Alamat sesuai KTP */
  identityAddressRt?: string;
  /** RT / RW* [text] - Alamat sesuai KTP */
  identityAddressRw?: string;
  /** Provinsi* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  identityAddressProvince?: string;
  /** Kota/kabupaten* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  identityAddressCity?: string;
  /** Kecamatan* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  identityAddressDistrict?: string;
  /** Kelurahan* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  identityAddressSubdistrict?: string;
  /** Kode pos* [text] - Alamat sesuai KTP */
  identityAddressPostalCode?: string;
  /** Alamat* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  currentAddressAddress?: string;
  /** RT / RW* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  currentAddressRt?: string;
  /** RT / RW* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  currentAddressRw?: string;
  /** Provinsi* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  currentAddressProvince?: string;
  /** Kota/kabupaten* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  currentAddressCity?: string;
  /** Kecamatan* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  currentAddressDistrict?: string;
  /** Kelurahan* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  currentAddressSubdistrict?: string;
  /** Kode pos* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  currentAddressPostalCode?: string;
  /** Status tempat tinggal* [dropdown] - Alamat tempat tinggal saat ini */
  residencyStatus?: 'Milik Sendiri' | 'Milik Keluarga' | 'Sewa';
  /** Foto KTP* [file] - Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png */
  ktpFiles?: string | string[];
  /** Form Aplikasi Kredit* [file] - Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png */
  creditApplicationFormFiles?: string | string[];
}

/**
 * Section "Data pribadi" - bucket identitas_pengecekan
 */
export class DataPribadiSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data pribadi';
  readonly sidebarTitle = 'Data pribadi';

  /** Nomor KTP* [text] (disabled saat explore / auto-fill) */
  get identityNumber() { return new TextInput(this.root, 'identityNumber'); }
  /** Nama lengkap* [text] (disabled saat explore / auto-fill) */
  get name() { return new TextInput(this.root, 'name'); }
  /** Jenis kelamin* [dropdown] (disabled saat explore / auto-fill) */
  get gender() { return new Dropdown(this.root, 'gender'); }
  /** Tempat & tanggal lahir* [text] */
  get placeOfBirth() { return new TextInput(this.root, 'placeOfBirth'); }
  /** Tempat & tanggal lahir* [date] (disabled saat explore / auto-fill) format "DD MMM YYYY", mis. "01 Jan 1990" */
  get dateOfBirth() { return new DateInput(this.root, 'dateOfBirth'); }
  /** Status perkawinan* [dropdown] */
  get maritalStatus() { return new Dropdown(this.root, 'maritalStatus'); }
  /** Nama gadis ibu kandung* [text] */
  get motherMaidenName() { return new TextInput(this.root, 'motherMaidenName'); }
  /** NPWP* [text] */
  get npwp() { return new TextInput(this.root, 'npwp'); }
  /** Nomor HP* [text] */
  get phoneNumber() { return new TextInput(this.root, 'phoneNumber'); }
  /** Apakah debitur merupakan nasabah Bank Sinarmas* [radio] */
  get apakahDebiturMerupakanNasabahBankSinarmas() { return new RadioGroup(this.root, 'Apakah debitur merupakan nasabah Bank Sinarmas'); }
  /** Alamat* [text] - Alamat sesuai KTP */
  get identityAddressAddress() { return new TextInput(this.root, 'identityAddress.address'); }
  /** RT / RW* [text] - Alamat sesuai KTP */
  get identityAddressRt() { return new TextInput(this.root, 'identityAddress.rt'); }
  /** RT / RW* [text] - Alamat sesuai KTP */
  get identityAddressRw() { return new TextInput(this.root, 'identityAddress.rw'); }
  /** Provinsi* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  get identityAddressProvince() { return new Dropdown(this.root, 'identityAddress.province'); }
  /** Kota/kabupaten* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  get identityAddressCity() { return new Dropdown(this.root, 'identityAddress.city'); }
  /** Kecamatan* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  get identityAddressDistrict() { return new Dropdown(this.root, 'identityAddress.district'); }
  /** Kelurahan* [dropdown] - Alamat sesuai KTP opsi bergantung dropdown sebelumnya */
  get identityAddressSubdistrict() { return new Dropdown(this.root, 'identityAddress.subdistrict'); }
  /** Kode pos* [text] - Alamat sesuai KTP */
  get identityAddressPostalCode() { return new TextInput(this.root, 'identityAddress.postalCode'); }
  /** Alamat* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  get currentAddressAddress() { return new TextInput(this.root, 'currentAddress.address'); }
  /** RT / RW* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  get currentAddressRt() { return new TextInput(this.root, 'currentAddress.rt'); }
  /** RT / RW* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  get currentAddressRw() { return new TextInput(this.root, 'currentAddress.rw'); }
  /** Provinsi* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  get currentAddressProvince() { return new Dropdown(this.root, 'currentAddress.province'); }
  /** Kota/kabupaten* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  get currentAddressCity() { return new Dropdown(this.root, 'currentAddress.city'); }
  /** Kecamatan* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  get currentAddressDistrict() { return new Dropdown(this.root, 'currentAddress.district'); }
  /** Kelurahan* [dropdown] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya */
  get currentAddressSubdistrict() { return new Dropdown(this.root, 'currentAddress.subdistrict'); }
  /** Kode pos* [text] - Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) */
  get currentAddressPostalCode() { return new TextInput(this.root, 'currentAddress.postalCode'); }
  /** Status tempat tinggal* [dropdown] - Alamat tempat tinggal saat ini */
  get residencyStatus() { return new Dropdown(this.root, 'residencyStatus'); }
  /** Foto KTP* [file] - Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png */
  get ktpFiles() { return new FileUpload(this.root, 'ktpFiles'); }
  /** Form Aplikasi Kredit* [file] - Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png */
  get creditApplicationFormFiles() { return new FileUpload(this.root, 'creditApplicationFormFiles'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: DataPribadiData) {
    if (data.identityNumber !== undefined) await this.identityNumber.fill(data.identityNumber);
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.gender !== undefined) await this.gender.select(data.gender);
    if (data.placeOfBirth !== undefined) await this.placeOfBirth.fill(data.placeOfBirth);
    if (data.dateOfBirth !== undefined) await this.dateOfBirth.fill(data.dateOfBirth);
    if (data.maritalStatus !== undefined) await this.maritalStatus.select(data.maritalStatus);
    if (data.motherMaidenName !== undefined) await this.motherMaidenName.fill(data.motherMaidenName);
    if (data.npwp !== undefined) await this.npwp.fill(data.npwp);
    if (data.phoneNumber !== undefined) await this.phoneNumber.fill(data.phoneNumber);
    if (data.apakahDebiturMerupakanNasabahBankSinarmas !== undefined) await this.apakahDebiturMerupakanNasabahBankSinarmas.select(data.apakahDebiturMerupakanNasabahBankSinarmas);
    if (data.identityAddressAddress !== undefined) await this.identityAddressAddress.fill(data.identityAddressAddress);
    if (data.identityAddressRt !== undefined) await this.identityAddressRt.fill(data.identityAddressRt);
    if (data.identityAddressRw !== undefined) await this.identityAddressRw.fill(data.identityAddressRw);
    if (data.identityAddressProvince !== undefined) await this.identityAddressProvince.select(data.identityAddressProvince);
    if (data.identityAddressCity !== undefined) await this.identityAddressCity.select(data.identityAddressCity);
    if (data.identityAddressDistrict !== undefined) await this.identityAddressDistrict.select(data.identityAddressDistrict);
    if (data.identityAddressSubdistrict !== undefined) await this.identityAddressSubdistrict.select(data.identityAddressSubdistrict);
    if (data.identityAddressPostalCode !== undefined) await this.identityAddressPostalCode.fill(data.identityAddressPostalCode);
    if (data.currentAddressAddress !== undefined) await this.currentAddressAddress.fill(data.currentAddressAddress);
    if (data.currentAddressRt !== undefined) await this.currentAddressRt.fill(data.currentAddressRt);
    if (data.currentAddressRw !== undefined) await this.currentAddressRw.fill(data.currentAddressRw);
    if (data.currentAddressProvince !== undefined) await this.currentAddressProvince.select(data.currentAddressProvince);
    if (data.currentAddressCity !== undefined) await this.currentAddressCity.select(data.currentAddressCity);
    if (data.currentAddressDistrict !== undefined) await this.currentAddressDistrict.select(data.currentAddressDistrict);
    if (data.currentAddressSubdistrict !== undefined) await this.currentAddressSubdistrict.select(data.currentAddressSubdistrict);
    if (data.currentAddressPostalCode !== undefined) await this.currentAddressPostalCode.fill(data.currentAddressPostalCode);
    if (data.residencyStatus !== undefined) await this.residencyStatus.select(data.residencyStatus);
    if (data.ktpFiles !== undefined) await this.ktpFiles.upload(data.ktpFiles);
    if (data.creditApplicationFormFiles !== undefined) await this.creditApplicationFormFiles.upload(data.creditApplicationFormFiles);
  }
}
