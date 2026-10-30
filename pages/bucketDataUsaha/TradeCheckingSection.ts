// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/data_usaha.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { DateInput, Dropdown, RadioGroup, TextInput } from '../components/FormControls';

export interface TradeCheckingData {
  /** Nama usaha* [text] */
  businessName?: string;
  /** Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" */
  dateUi?: string;
  /** Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" */
  timeUi?: string;
  /** Nama perusahaan* [text] */
  companyName?: string;
  /** Nomor telepon perusahaan* [text] */
  telephoneNumber?: string;
  /** Nama PIC* [text] */
  picName?: string;
  /** Nomor HP PIC* [text] */
  picPhoneNumber?: string;
  /** Hubungan dengan debitur* [dropdown] */
  f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship?: 'Buyer' | 'Competitor' | 'Supplier';
  /** Apakah PIC memiliki rekening Sinarmas?* [radio] - Informasi rekening Sinarmas */
  apakahPicMemilikiRekeningSinarmas?: 'Ya' | 'Tidak';
  /** Alamat* [text] - Alamat perusahaan */
  businessAddressAddress?: string;
  /** RT/RW* [text] - Alamat perusahaan */
  businessAddressRt?: string;
  /** RT/RW* [text] - Alamat perusahaan */
  businessAddressRw?: string;
  /** Provinsi* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince?: string;
  /** Kota/kabupaten* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity?: string;
  /** Kecamatan* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict?: string;
  /** Kelurahan* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict?: string;
  /** Kode pos* [text] - Alamat perusahaan */
  businessAddressPostalCode?: string;
  /** Nilai transaksi* [text] - Informasi transaksi */
  trxAmount?: string;
  /** Jenis pembayaran* [dropdown] - Informasi transaksi */
  f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType?: 'Transfer' | 'Tunai';
  /** Term of payment (TOP)* [text] - Informasi transaksi satuan: hari */
  top?: string;
  /** Volume transaski per bulan* [text] - Informasi transaksi */
  monthlyTrxVolume?: string;
  /** Lama hubungan* [text] - Lain-lain satuan: bulan */
  relationshipDuration?: string;
  /** Referensi* [text] - Lain-lain */
  reference?: string;
  /** Ada informasi negatif?* [radio] - Lain-lain */
  adaInformasiNegatif?: 'Ada' | 'Tidak ada';
  /** Informasi lainnya* [text] - Lain-lain */
  otherInfo?: string;
}

/**
 * Section "Trade checking" - bucket data_usaha
 */
export class TradeCheckingSection extends BucketSection {
  readonly bucket: BucketId = 'data_usaha';
  readonly title = 'Trade checking';
  readonly sidebarTitle = 'Trade checking';

  /** Nama usaha* [text] */
  get businessName() { return new TextInput(this.root, 'businessName'); }
  /** Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" */
  get dateUi() { return new DateInput(this.root, 'date_ui'); }
  /** Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" */
  get timeUi() { return new DateInput(this.root, 'time_ui'); }
  /** Nama perusahaan* [text] */
  get companyName() { return new TextInput(this.root, 'companyName'); }
  /** Nomor telepon perusahaan* [text] */
  get telephoneNumber() { return new TextInput(this.root, 'telephoneNumber'); }
  /** Nama PIC* [text] */
  get picName() { return new TextInput(this.root, 'picName'); }
  /** Nomor HP PIC* [text] */
  get picPhoneNumber() { return new TextInput(this.root, 'picPhoneNumber'); }
  /** Hubungan dengan debitur* [dropdown] */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_relationship'); }
  /** Apakah PIC memiliki rekening Sinarmas?* [radio] - Informasi rekening Sinarmas */
  get apakahPicMemilikiRekeningSinarmas() { return new RadioGroup(this.root, 'Apakah PIC memiliki rekening Sinarmas?'); }
  /** Alamat* [text] - Alamat perusahaan */
  get businessAddressAddress() { return new TextInput(this.root, 'businessAddress.address'); }
  /** RT/RW* [text] - Alamat perusahaan */
  get businessAddressRt() { return new TextInput(this.root, 'businessAddress.rt'); }
  /** RT/RW* [text] - Alamat perusahaan */
  get businessAddressRw() { return new TextInput(this.root, 'businessAddress.rw'); }
  /** Provinsi* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.province'); }
  /** Kota/kabupaten* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.city'); }
  /** Kecamatan* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.district'); }
  /** Kelurahan* [dropdown] - Alamat perusahaan opsi bergantung dropdown sebelumnya */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.subdistrict'); }
  /** Kode pos* [text] - Alamat perusahaan */
  get businessAddressPostalCode() { return new TextInput(this.root, 'businessAddress.postalCode'); }
  /** Nilai transaksi* [text] - Informasi transaksi */
  get trxAmount() { return new TextInput(this.root, 'trxAmount'); }
  /** Jenis pembayaran* [dropdown] - Informasi transaksi */
  get f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType() { return new Dropdown(this.root, '01M4DMBB9H3FEST6EQ626CJ6WJ_paymentType'); }
  /** Term of payment (TOP)* [text] - Informasi transaksi satuan: hari */
  get top() { return new TextInput(this.root, 'top'); }
  /** Volume transaski per bulan* [text] - Informasi transaksi */
  get monthlyTrxVolume() { return new TextInput(this.root, 'monthlyTrxVolume'); }
  /** Lama hubungan* [text] - Lain-lain satuan: bulan */
  get relationshipDuration() { return new TextInput(this.root, 'relationshipDuration'); }
  /** Referensi* [text] - Lain-lain */
  get reference() { return new TextInput(this.root, 'reference'); }
  /** Ada informasi negatif?* [radio] - Lain-lain */
  get adaInformasiNegatif() { return new RadioGroup(this.root, 'Ada informasi negatif?'); }
  /** Informasi lainnya* [text] - Lain-lain */
  get otherInfo() { return new TextInput(this.root, 'otherInfo'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: TradeCheckingData) {
    if (data.businessName !== undefined) await this.businessName.fill(data.businessName);
    if (data.dateUi !== undefined) await this.dateUi.fill(data.dateUi);
    if (data.timeUi !== undefined) await this.timeUi.fill(data.timeUi);
    if (data.companyName !== undefined) await this.companyName.fill(data.companyName);
    if (data.telephoneNumber !== undefined) await this.telephoneNumber.fill(data.telephoneNumber);
    if (data.picName !== undefined) await this.picName.fill(data.picName);
    if (data.picPhoneNumber !== undefined) await this.picPhoneNumber.fill(data.picPhoneNumber);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship);
    if (data.apakahPicMemilikiRekeningSinarmas !== undefined) await this.apakahPicMemilikiRekeningSinarmas.select(data.apakahPicMemilikiRekeningSinarmas);
    if (data.businessAddressAddress !== undefined) await this.businessAddressAddress.fill(data.businessAddressAddress);
    if (data.businessAddressRt !== undefined) await this.businessAddressRt.fill(data.businessAddressRt);
    if (data.businessAddressRw !== undefined) await this.businessAddressRw.fill(data.businessAddressRw);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict);
    if (data.businessAddressPostalCode !== undefined) await this.businessAddressPostalCode.fill(data.businessAddressPostalCode);
    if (data.trxAmount !== undefined) await this.trxAmount.fill(data.trxAmount);
    if (data.f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType !== undefined) await this.f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType.select(data.f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType);
    if (data.top !== undefined) await this.top.fill(data.top);
    if (data.monthlyTrxVolume !== undefined) await this.monthlyTrxVolume.fill(data.monthlyTrxVolume);
    if (data.relationshipDuration !== undefined) await this.relationshipDuration.fill(data.relationshipDuration);
    if (data.reference !== undefined) await this.reference.fill(data.reference);
    if (data.adaInformasiNegatif !== undefined) await this.adaInformasiNegatif.select(data.adaInformasiNegatif);
    if (data.otherInfo !== undefined) await this.otherInfo.fill(data.otherInfo);
  }
}
