// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/data_usaha.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Locator, Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { DateInput, Dropdown, RadioGroup, TextInput } from '../components/FormControls';

export interface InformasiBadanUsahaDataUsahaRowData {
  /** Nama usaha* [text] - Legalitas Usaha */
  name?: string;
  /** Nama PIC* [text] - Legalitas Usaha */
  picName?: string;
  /** Kategori usaha* [dropdown] - Legalitas Usaha */
  kategori?: 'Jasa' | 'Manufaktur' | 'Trading';
  /** Jenis tempat usaha* [dropdown] - Legalitas Usaha */
  jenisTempat?: 'Toko' | 'Ruko' | 'Gudang / Warehouse' | 'Workshop' | 'Pabrik' | 'Perkantoran';
  /** Bidang usaha* [dropdown] - Legalitas Usaha */
  bidang?: 'PERBANKAN' | 'KIMIA' | 'MATERIAL' | 'JASA' | 'KOMUNIKASI' | 'OTOMOTIF' | 'MAKANAN' | 'HUKUM' | 'KESEHATAN' | 'SUPPLIER' | 'DEVELOPER' | 'PERDAGANGAN' | 'LAINNYA';
  /** Segmen usaha* [dropdown] - Legalitas Usaha */
  segmen?: 'Toko kelontong' | 'Sewa perlengkapan' | 'Cathering' | 'Grosir' | 'Bengkel' | 'Kontraktor' | 'Pedagang Pasar' | 'Usaha Jasa' | 'Pet Shop' | 'Lain-lain' | 'Restoran' | 'Toko makanan' | 'Usaha LPG & Air' | 'Distributor sembako' | 'Tekstil' | 'Suku Cadang Kendaraan' | 'Kost-kostan' | 'Material Bangunan';
  /** Sektor ekonomi* [dropdown] - Legalitas Usaha 80+ opsi, contoh: RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL S.D. TIPE 21, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 21 S.D. 70, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 70 */
  sektorEkonomi?: string;
  /** Modal usaha per bulan* [text] - Legalitas Usaha satuan: Rp */
  monthlyBusinessCapitalInvested?: string;
  /** Omset usaha per bulan* [text] - Legalitas Usaha satuan: Rp */
  monthlyBusinessRevenue?: string;
  /** Tanggal mulai usaha* [date] - Legalitas Usaha format "DD MMM YYYY", mis. "01 Jan 1990" */
  businessStartDate?: string;
  /** Lama usaha* [text] - Legalitas Usaha satuan: bulan */
  businessDurationOperation?: string;
  /** Jumlah pekerja* [text] - Legalitas Usaha */
  totalEmployee?: string;
  /** Kepemilikan usaha* [dropdown] - Legalitas Usaha */
  businessOwnershipStatus?: 'Milik Sendiri' | 'Milik Keluarga' | 'Sewa' | 'Franchise';
  /** Kondisi tempat usaha* [dropdown] - Legalitas Usaha */
  physicalConditionPremises?: 'Lokasi usaha terlihat bagus, cat dan plesternya bagus' | 'Lokasi usaha terlihat tua namun cat dan plesternya pada kondisi yang bagus' | 'Lokasi usaha butuh direnovasi - catnya pudar dan plester sudah rusak' | 'Tempat usaha pada kondisi yang sangat buruk - plesternya berjatuhan, furniturnya tua, dll.';
  /** Akses tempat usaha* [dropdown] - Legalitas Usaha */
  accessibilityBusinessLocation?: 'Lokasi usaha dapat mudah diakses menggunakan transportasi umum' | 'Lokasi usaha bisa diakses oleh roda 4 namun tidak ada akses untuk transportasi umum pada jarak 1 km' | 'Lokasi usaha bisa dicapai hanya dengan jalan kaki atau oleh roda dua' | 'Lokasi usaha sulit untuk dicapai - sulit untuk tetangga untuk memberi arahan untuk lokasi tersebut';
  /** Jumlah supplier* [text] - Legalitas Usaha */
  totalSupplier?: string;
  /** Lama hubungan dengan supplier* [text] - Legalitas Usaha satuan: bulan */
  durationWithSupplier?: string;
}

/** Satu baris "dataUsaha" (indeks 0-based); baris baru via tombol "+ Usaha" */
export class InformasiBadanUsahaDataUsahaRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Nama usaha* [text] - Legalitas Usaha */
  get name() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.name`); }
  /** Nama PIC* [text] - Legalitas Usaha */
  get picName() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.picName`); }
  /** Kategori usaha* [dropdown] - Legalitas Usaha */
  get kategori() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.kategori`); }
  /** Jenis tempat usaha* [dropdown] - Legalitas Usaha */
  get jenisTempat() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.jenisTempat`); }
  /** Bidang usaha* [dropdown] - Legalitas Usaha */
  get bidang() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.bidang`); }
  /** Segmen usaha* [dropdown] - Legalitas Usaha */
  get segmen() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.segmen`); }
  /** Sektor ekonomi* [dropdown] - Legalitas Usaha 80+ opsi, contoh: RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL S.D. TIPE 21, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 21 S.D. 70, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 70 */
  get sektorEkonomi() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.sektorEkonomi`); }
  /** Modal usaha per bulan* [text] - Legalitas Usaha satuan: Rp */
  get monthlyBusinessCapitalInvested() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.monthlyBusinessCapitalInvested`); }
  /** Omset usaha per bulan* [text] - Legalitas Usaha satuan: Rp */
  get monthlyBusinessRevenue() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.monthlyBusinessRevenue`); }
  /** Tanggal mulai usaha* [date] - Legalitas Usaha format "DD MMM YYYY", mis. "01 Jan 1990" */
  get businessStartDate() { return new DateInput(this.root, `usahaArray.0.dataUsaha.${this.index}.businessStartDate`); }
  /** Lama usaha* [text] - Legalitas Usaha satuan: bulan */
  get businessDurationOperation() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.businessDurationOperation`); }
  /** Jumlah pekerja* [text] - Legalitas Usaha */
  get totalEmployee() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.totalEmployee`); }
  /** Kepemilikan usaha* [dropdown] - Legalitas Usaha */
  get businessOwnershipStatus() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.businessOwnershipStatus`); }
  /** Kondisi tempat usaha* [dropdown] - Legalitas Usaha */
  get physicalConditionPremises() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.physicalConditionPremises`); }
  /** Akses tempat usaha* [dropdown] - Legalitas Usaha */
  get accessibilityBusinessLocation() { return new Dropdown(this.root, `usahaArray.0.dataUsaha.${this.index}.accessibilityBusinessLocation`); }
  /** Jumlah supplier* [text] - Legalitas Usaha */
  get totalSupplier() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.totalSupplier`); }
  /** Lama hubungan dengan supplier* [text] - Legalitas Usaha satuan: bulan */
  get durationWithSupplier() { return new TextInput(this.root, `usahaArray.0.dataUsaha.${this.index}.durationWithSupplier`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.name.locator.count()) > 0; }

  async fill(data: InformasiBadanUsahaDataUsahaRowData) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.picName !== undefined) await this.picName.fill(data.picName);
    if (data.kategori !== undefined) await this.kategori.select(data.kategori);
    if (data.jenisTempat !== undefined) await this.jenisTempat.select(data.jenisTempat);
    if (data.bidang !== undefined) await this.bidang.select(data.bidang);
    if (data.segmen !== undefined) await this.segmen.select(data.segmen);
    if (data.sektorEkonomi !== undefined) await this.sektorEkonomi.select(data.sektorEkonomi);
    if (data.monthlyBusinessCapitalInvested !== undefined) await this.monthlyBusinessCapitalInvested.fill(data.monthlyBusinessCapitalInvested);
    if (data.monthlyBusinessRevenue !== undefined) await this.monthlyBusinessRevenue.fill(data.monthlyBusinessRevenue);
    if (data.businessStartDate !== undefined) await this.businessStartDate.fill(data.businessStartDate);
    if (data.businessDurationOperation !== undefined) await this.businessDurationOperation.fill(data.businessDurationOperation);
    if (data.totalEmployee !== undefined) await this.totalEmployee.fill(data.totalEmployee);
    if (data.businessOwnershipStatus !== undefined) await this.businessOwnershipStatus.select(data.businessOwnershipStatus);
    if (data.physicalConditionPremises !== undefined) await this.physicalConditionPremises.select(data.physicalConditionPremises);
    if (data.accessibilityBusinessLocation !== undefined) await this.accessibilityBusinessLocation.select(data.accessibilityBusinessLocation);
    if (data.totalSupplier !== undefined) await this.totalSupplier.fill(data.totalSupplier);
    if (data.durationWithSupplier !== undefined) await this.durationWithSupplier.fill(data.durationWithSupplier);
  }
}

export interface InformasiBadanUsahaUsahaArrayRowData {
  /** Bentuk Usaha* [dropdown] - Informasi bentuk usaha */
  bentukUsaha?: 'Badan Usaha' | 'Perseorangan';
  /** Nomor Izin Berusaha (NIB)* [text] - Legalitas Usaha */
  nomorIzinBerusaha?: string;
}

/** Satu baris "usahaArray" (indeks 0-based) */
export class InformasiBadanUsahaUsahaArrayRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Bentuk Usaha* [dropdown] - Informasi bentuk usaha */
  get bentukUsaha() { return new Dropdown(this.root, `usahaArray.${this.index}.bentukUsaha`); }
  /** Nomor Izin Berusaha (NIB)* [text] - Legalitas Usaha */
  get nomorIzinBerusaha() { return new TextInput(this.root, `usahaArray.${this.index}.nomorIzinBerusaha`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.bentukUsaha.locator.count()) > 0; }

  async fill(data: InformasiBadanUsahaUsahaArrayRowData) {
    if (data.bentukUsaha !== undefined) await this.bentukUsaha.select(data.bentukUsaha);
    if (data.nomorIzinBerusaha !== undefined) await this.nomorIzinBerusaha.fill(data.nomorIzinBerusaha);
  }
}

export interface InformasiBadanUsahaData {
  /** Ada Izin Lainnya?* [radio] - Legalitas Usaha */
  adaIzinLainnya?: 'Ya' | 'Tidak';
  /** Apakah lokasi usaha tetap?* [radio] - Legalitas Usaha */
  apakahLokasiUsahaTetap?: 'Ya' | 'Tidak';
  /** Apakah status usaha sewa?* [radio] - Legalitas Usaha */
  apakahStatusUsahaSewa?: 'Ya' | 'Tidak';
  /** Tempat usaha memiliki parkir?* [radio] - Legalitas Usaha */
  tempatUsahaMemilikiParkir?: 'Ya' | 'Tidak';
  /** Baris "dataUsaha"; elemen ke-i mengisi baris ke-i (otomatis klik "+ Usaha" bila baris belum ada) */
  dataUsaha?: InformasiBadanUsahaDataUsahaRowData[];
  /** Baris "usahaArray"; elemen ke-i mengisi baris ke-i */
  usahaArray?: InformasiBadanUsahaUsahaArrayRowData[];
}

/**
 * Section "Informasi Badan Usaha" - bucket data_usaha
 */
export class InformasiBadanUsahaSection extends BucketSection {
  readonly bucket: BucketId = 'data_usaha';
  readonly title = 'Informasi Badan Usaha';
  readonly sidebarTitle = 'Informasi badan usaha';

  /** Ada Izin Lainnya?* [radio] - Legalitas Usaha */
  get adaIzinLainnya() { return new RadioGroup(this.root, 'Ada Izin Lainnya?'); }
  /** Apakah lokasi usaha tetap?* [radio] - Legalitas Usaha */
  get apakahLokasiUsahaTetap() { return new RadioGroup(this.root, 'Apakah lokasi usaha tetap?'); }
  /** Apakah status usaha sewa?* [radio] - Legalitas Usaha */
  get apakahStatusUsahaSewa() { return new RadioGroup(this.root, 'Apakah status usaha sewa?'); }
  /** Tempat usaha memiliki parkir?* [radio] - Legalitas Usaha */
  get tempatUsahaMemilikiParkir() { return new RadioGroup(this.root, 'Tempat usaha memiliki parkir?'); }
  /** Baris "dataUsaha" ke-index (0-based) */
  dataUsaha(index: number) { return new InformasiBadanUsahaDataUsahaRow(this.root, index); }
  /** Baris "usahaArray" ke-index (0-based) */
  usahaArray(index: number) { return new InformasiBadanUsahaUsahaArrayRow(this.root, index); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: InformasiBadanUsahaData) {
    if (data.adaIzinLainnya !== undefined) await this.adaIzinLainnya.select(data.adaIzinLainnya);
    if (data.apakahLokasiUsahaTetap !== undefined) await this.apakahLokasiUsahaTetap.select(data.apakahLokasiUsahaTetap);
    if (data.apakahStatusUsahaSewa !== undefined) await this.apakahStatusUsahaSewa.select(data.apakahStatusUsahaSewa);
    if (data.tempatUsahaMemilikiParkir !== undefined) await this.tempatUsahaMemilikiParkir.select(data.tempatUsahaMemilikiParkir);
    for (const [i, row] of (data.dataUsaha ?? []).entries()) {
      if (!(await this.dataUsaha(i).exists())) await this.button('+ Usaha').click();
      await this.dataUsaha(i).fill(row);
    }
    for (const [i, row] of (data.usahaArray ?? []).entries()) {
      await this.usahaArray(i).fill(row);
    }
  }
}
