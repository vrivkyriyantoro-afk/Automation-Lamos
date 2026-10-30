// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { CurrencyInput, Dropdown, RadioGroup, TextInput } from '../components/FormControls';

export interface DataPekerjaanKeuanganData {
  /** Pekerjaan* [dropdown] */
  job?: 'Akuntan' | 'Keuangan' | 'Komputer' | 'Pendidikan/Pelatihan' | 'Rekayasa/Teknik' | 'Eksekutif' | 'Administratif' | 'Karyawan Swasta / Asing' | 'Manufaktur/Produksi/Operasi' | 'Profesional' | 'Penelitian dan Pengembangan' | 'Pensiunan' | 'Penjualan/Marketing/Periklanan' | 'Wiraswasta' | 'Lainnya' | 'Pegawai Negeri Sipil' | 'Pegawai BUMN' | 'Petani' | 'Ibu Rumah Tangga';
  /** Nama perusahaan / usaha* [text] */
  companyName?: string;
  /** Bidang usaha* [dropdown] */
  companySector?: 'PERBANKAN' | 'SUPPLIER' | 'DEVELOPER' | 'PERDAGANGAN' | 'KIMIA' | 'MATERIAL' | 'JASA' | 'KOMUNIKASI' | 'OTOMOTIF' | 'MAKANAN' | 'HUKUM' | 'KESEHATAN' | 'LAINNYA';
  /** Pengalaman di industri terkait* [text] satuan: bulan */
  monthOfRelatedIndustryExp?: string;
  /** No. Telepon Perusahaan* [text] */
  companyPhoneNumber?: string;
  /** Lama bekerja/usaha* [text] satuan: bulan */
  companyDuration?: string;
  /** Pendapatan* [currency] satuan: Rp */
  income?: number | string;
  /** Joint Income? [radio] */
  jointIncome?: 'Ya' | 'Tidak';
  /** Sumber pemasukan lainnya [dropdown] */
  otherIncome?: 'Keluarga memiliki usaha lain yang menghasilkan pemasukan yang lebih besar dibandingkan dengan pemasukan pemohon' | 'Keluarga memiliki usaha lain yang menghasilkan 75%-100% pemasukan jika dibandingkan dengan pemasukan pemohon' | 'Keluarga memilki usaha lain yang menghasilkan 50%-75% pemasukan jika dibandingkan dengan pemasukan pemohon' | 'Keluarga memiliki usaha lain yang menghasilkan <50% pemasukan jika dibandingkan dengan pemasukan pemohon' | 'Keluarga tidak memiliki sumber lain untuk pemasukan';
  /** Jumlah pemasukan lainnya* [currency] satuan: Rp */
  otherIncomeValue?: number | string;
  /** Biaya hidup per bulan* [currency] satuan: Rp */
  monthlyLivingCost?: number | string;
  /** Memiliki pinjaman di Bank/Fintech/BPR/Multifinance?* [radio] */
  memilikiPinjamanDiBankFintechBpr?: 'Ya' | 'Tidak';
  /** Nominal angsuran lainnya [currency] satuan: Rp */
  anotherLoanNominal?: number | string;
  /** Memiliki tabungan di Bank/BPR?* [radio] */
  memilikiTabunganDiBankBpr?: 'Ya' | 'Tidak';
  /** Alamat perusahaan / usaha* [text] - Alamat perusahaan / usaha */
  companyAddress?: string;
  /** RT / RW* [text] - Alamat perusahaan / usaha */
  companyRt?: string;
  /** RT / RW* [text] - Alamat perusahaan / usaha */
  companyRw?: string;
  /** Provinsi* [dropdown] - Alamat perusahaan / usaha */
  companyProvinceCode?: 'Aceh' | 'Bali' | 'Banten' | 'Bengkulu' | 'Daerah Istimewa Yogyakarta' | 'DKI Jakarta' | 'Gorontalo' | 'Jambi' | 'Jawa Barat' | 'Jawa Tengah' | 'Jawa Timur' | 'Kalimantan Barat' | 'Kalimantan Selatan' | 'Kalimantan Tengah' | 'Kalimantan Timur' | 'Kalimantan Utara' | 'Kep. Bangka Belitung' | 'Kepulauan Riau' | 'Lainnya' | 'Lampung' | 'Maluku' | 'Maluku Utara' | 'Nusa Tenggara Barat' | 'Nusa Tenggara Timur' | 'Papua' | 'Papua Barat' | 'Papua Barat Daya' | 'Papua Pegunungan' | 'Papua Selatan' | 'Papua Tengah' | 'Riau' | 'Sulawesi Barat' | 'Sulawesi Selatan' | 'Sulawesi Tengah' | 'Sulawesi Tenggara' | 'Sulawesi Utara' | 'Sumatera Barat' | 'Sumatera Selatan' | 'Sumatera Utara';
  /** Kota/kabupaten* [dropdown] - Alamat perusahaan / usaha */
  companyCityCode?: 'Jakarta Barat, Wil. Kota' | 'Jakarta Pusat, Wil. Kota' | 'Jakarta Selatan, Wil. Kota' | 'Jakarta Timur, Wil. Kota' | 'Jakarta Utara, Wil. Kota' | 'Kepulauan Seribu, Wil';
  /** Kecamatan* [dropdown] - Alamat perusahaan / usaha */
  companyDistrictCode?: 'Cengkareng' | 'Grogol Petamburan' | 'Kalideres' | 'Kebon Jeruk' | 'Kembangan' | 'Pal Merah' | 'Taman Sari' | 'Tambora';
  /** Kelurahan* [dropdown] - Alamat perusahaan / usaha */
  companySubDistrictCode?: 'Cengkareng Barat' | 'Cengkareng Timur' | 'Duri Kosambi' | 'Kapuk' | 'Kedaung Kali Angke' | 'Rawa Buaya';
  /** Kode pos* [text] - Alamat perusahaan / usaha */
  companyPostalCode?: string;
}

/**
 * Section "Data pekerjaan & Keuangan" - bucket identitas_pengecekan
 */
export class DataPekerjaanKeuanganSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data pekerjaan & Keuangan';
  readonly sidebarTitle = 'Data pekerjaan & keuangan';

  /** Pekerjaan* [dropdown] */
  get job() { return new Dropdown(this.root, 'job'); }
  /** Nama perusahaan / usaha* [text] */
  get companyName() { return new TextInput(this.root, 'companyName'); }
  /** Bidang usaha* [dropdown] */
  get companySector() { return new Dropdown(this.root, 'companySector'); }
  /** Pengalaman di industri terkait* [text] satuan: bulan */
  get monthOfRelatedIndustryExp() { return new TextInput(this.root, 'monthOfRelatedIndustryExp'); }
  /** No. Telepon Perusahaan* [text] */
  get companyPhoneNumber() { return new TextInput(this.root, 'companyPhoneNumber'); }
  /** Lama bekerja/usaha* [text] satuan: bulan */
  get companyDuration() { return new TextInput(this.root, 'companyDuration'); }
  /** Pendapatan* [currency] satuan: Rp */
  get income() { return new CurrencyInput(this.root, 'income'); }
  /** Joint Income? [radio] */
  get jointIncome() { return new RadioGroup(this.root, 'Joint Income?'); }
  /** Sumber pemasukan lainnya [dropdown] */
  get otherIncome() { return new Dropdown(this.root, 'otherIncome'); }
  /** Jumlah pemasukan lainnya* [currency] satuan: Rp */
  get otherIncomeValue() { return new CurrencyInput(this.root, 'otherIncomeValue'); }
  /** Biaya hidup per bulan* [currency] satuan: Rp */
  get monthlyLivingCost() { return new CurrencyInput(this.root, 'monthlyLivingCost'); }
  /** Memiliki pinjaman di Bank/Fintech/BPR/Multifinance?* [radio] */
  get memilikiPinjamanDiBankFintechBpr() { return new RadioGroup(this.root, 'Memiliki pinjaman di Bank/Fintech/BPR/Multifinance?'); }
  /** Nominal angsuran lainnya [currency] satuan: Rp */
  get anotherLoanNominal() { return new CurrencyInput(this.root, 'anotherLoanNominal'); }
  /** Memiliki tabungan di Bank/BPR?* [radio] */
  get memilikiTabunganDiBankBpr() { return new RadioGroup(this.root, 'Memiliki tabungan di Bank/BPR?'); }
  /** Alamat perusahaan / usaha* [text] - Alamat perusahaan / usaha */
  get companyAddress() { return new TextInput(this.root, 'companyAddress'); }
  /** RT / RW* [text] - Alamat perusahaan / usaha */
  get companyRt() { return new TextInput(this.root, 'companyRT'); }
  /** RT / RW* [text] - Alamat perusahaan / usaha */
  get companyRw() { return new TextInput(this.root, 'companyRW'); }
  /** Provinsi* [dropdown] - Alamat perusahaan / usaha */
  get companyProvinceCode() { return new Dropdown(this.root, 'companyProvinceCode'); }
  /** Kota/kabupaten* [dropdown] - Alamat perusahaan / usaha */
  get companyCityCode() { return new Dropdown(this.root, 'companyCityCode'); }
  /** Kecamatan* [dropdown] - Alamat perusahaan / usaha */
  get companyDistrictCode() { return new Dropdown(this.root, 'companyDistrictCode'); }
  /** Kelurahan* [dropdown] - Alamat perusahaan / usaha */
  get companySubDistrictCode() { return new Dropdown(this.root, 'companySubDistrictCode'); }
  /** Kode pos* [text] - Alamat perusahaan / usaha */
  get companyPostalCode() { return new TextInput(this.root, 'companyPostalCode'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: DataPekerjaanKeuanganData) {
    if (data.job !== undefined) await this.job.select(data.job);
    if (data.companyName !== undefined) await this.companyName.fill(data.companyName);
    if (data.companySector !== undefined) await this.companySector.select(data.companySector);
    if (data.monthOfRelatedIndustryExp !== undefined) await this.monthOfRelatedIndustryExp.fill(data.monthOfRelatedIndustryExp);
    if (data.companyPhoneNumber !== undefined) await this.companyPhoneNumber.fill(data.companyPhoneNumber);
    if (data.companyDuration !== undefined) await this.companyDuration.fill(data.companyDuration);
    if (data.income !== undefined) await this.income.fill(data.income);
    if (data.jointIncome !== undefined) await this.jointIncome.select(data.jointIncome);
    if (data.otherIncome !== undefined) await this.otherIncome.select(data.otherIncome);
    if (data.otherIncomeValue !== undefined) await this.otherIncomeValue.fill(data.otherIncomeValue);
    if (data.monthlyLivingCost !== undefined) await this.monthlyLivingCost.fill(data.monthlyLivingCost);
    if (data.memilikiPinjamanDiBankFintechBpr !== undefined) await this.memilikiPinjamanDiBankFintechBpr.select(data.memilikiPinjamanDiBankFintechBpr);
    if (data.anotherLoanNominal !== undefined) await this.anotherLoanNominal.fill(data.anotherLoanNominal);
    if (data.memilikiTabunganDiBankBpr !== undefined) await this.memilikiTabunganDiBankBpr.select(data.memilikiTabunganDiBankBpr);
    if (data.companyAddress !== undefined) await this.companyAddress.fill(data.companyAddress);
    if (data.companyRt !== undefined) await this.companyRt.fill(data.companyRt);
    if (data.companyRw !== undefined) await this.companyRw.fill(data.companyRw);
    if (data.companyProvinceCode !== undefined) await this.companyProvinceCode.select(data.companyProvinceCode);
    if (data.companyCityCode !== undefined) await this.companyCityCode.select(data.companyCityCode);
    if (data.companyDistrictCode !== undefined) await this.companyDistrictCode.select(data.companyDistrictCode);
    if (data.companySubDistrictCode !== undefined) await this.companySubDistrictCode.select(data.companySubDistrictCode);
    if (data.companyPostalCode !== undefined) await this.companyPostalCode.fill(data.companyPostalCode);
  }
}
