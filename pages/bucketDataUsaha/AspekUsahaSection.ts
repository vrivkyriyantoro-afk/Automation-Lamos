// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/data_usaha.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Locator, Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, RadioGroup, TextInput } from '../components/FormControls';

export interface AspekUsahaListSupplierRowData {
  /** name [text] - List supplier */
  name?: string;
  /** area [text] - List supplier */
  area?: string;
  /** supplierType [dropdown] - List supplier */
  supplierType?: string;
}

/** Satu baris "listSupplier" (indeks 0-based); baris baru via tombol "Tambah baris" */
export class AspekUsahaListSupplierRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** name [text] - List supplier */
  get name() { return new TextInput(this.root, `listSupplier.${this.index}.name`); }
  /** area [text] - List supplier */
  get area() { return new TextInput(this.root, `listSupplier.${this.index}.area`); }
  /** supplierType [dropdown] - List supplier */
  get supplierType() { return new Dropdown(this.root, `supplierType-${this.index}`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.name.locator.count()) > 0; }

  async fill(data: AspekUsahaListSupplierRowData) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.area !== undefined) await this.area.fill(data.area);
    if (data.supplierType !== undefined) await this.supplierType.select(data.supplierType);
  }
}

export interface AspekUsahaJenisRowData {
  /** Jenis resiko* [dropdown] - List supplier */
  jenis?: 'Collateral Risk' | 'Collection Risk' | 'Competitor Risk' | 'Demand Risk' | 'Lainnya' | 'Supply Risk';
}

/** Satu baris "jenis" (indeks 0-based) */
export class AspekUsahaJenisRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Jenis resiko* [dropdown] - List supplier */
  get jenis() { return new Dropdown(this.root, `jenis-${this.index}`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.jenis.locator.count()) > 0; }

  async fill(data: AspekUsahaJenisRowData) {
    if (data.jenis !== undefined) await this.jenis.select(data.jenis);
  }
}

export interface AspekUsahaTingkatRowData {
  /** Tingkat resiko* [dropdown] - List supplier */
  tingkat?: 'Rendah' | 'Sedang' | 'Tinggi';
}

/** Satu baris "tingkat" (indeks 0-based) */
export class AspekUsahaTingkatRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Tingkat resiko* [dropdown] - List supplier */
  get tingkat() { return new Dropdown(this.root, `tingkat-${this.index}`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.tingkat.locator.count()) > 0; }

  async fill(data: AspekUsahaTingkatRowData) {
    if (data.tingkat !== undefined) await this.tingkat.select(data.tingkat);
  }
}

export interface AspekUsahaAnalisaResikoRowData {
  /** Uraian detail* [textarea] - List supplier */
  uraianDetail?: string;
  /** Mitigasi resiko* [textarea] - List supplier */
  mitigasi?: string;
}

/** Satu baris "analisaResiko" (indeks 0-based) */
export class AspekUsahaAnalisaResikoRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Uraian detail* [textarea] - List supplier */
  get uraianDetail() { return new TextInput(this.root, `analisaResiko.${this.index}.uraianDetail`); }
  /** Mitigasi resiko* [textarea] - List supplier */
  get mitigasi() { return new TextInput(this.root, `analisaResiko.${this.index}.mitigasi`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.uraianDetail.locator.count()) > 0; }

  async fill(data: AspekUsahaAnalisaResikoRowData) {
    if (data.uraianDetail !== undefined) await this.uraianDetail.fill(data.uraianDetail);
    if (data.mitigasi !== undefined) await this.mitigasi.fill(data.mitigasi);
  }
}

export interface AspekUsahaData {
  /** Nama Usaha* [text] */
  name?: string;
  /** Kategori usaha* [dropdown] */
  category?: 'Jasa' | 'Manufaktur' | 'Trading';
  /** Jenis produk/jasa* [dropdown] */
  jenisProduk?: string;
  /** Status usaha sewa* [radio] */
  statusUsahaSewa?: 'Ya' | 'Tidak';
  /** Cara pemesanan [dropdown] */
  caraPemesananSupplier?: 'Cash Ready Stock' | 'Perjanjian Kerja Sama' | 'Pre-Order';
  /** Cara pembayaran [dropdown] */
  caraPembayaranSupplier?: 'Transfer' | 'Tunai';
  /** Paling cepat [text] satuan: hari */
  jangkaCepatSupplier?: string;
  /** Paling lama [text] satuan: hari */
  jangkaLamaSupplier?: string;
  /** Cash [text] satuan: % */
  cashSupplier?: string;
  /** Tempo [text] satuan: % */
  tempoSupplier?: string;
  /** Skema pembelian ke supplier [textarea] */
  skemaPembelianSupplier?: string;
  /** Inventory days on hand [text] - List supplier satuan: hari */
  inventoryDays?: string;
  /** Detail inventory [textarea] - List supplier */
  detailInventory?: string;
  /** Tipe customer debitur* [dropdown] - List supplier */
  tipeCustomerDebitur?: 'Badan Usaha' | 'Perorangan';
  /** Jumlah customer* [text] - List supplier */
  jumlahCustomer?: string;
  /** Penjualan customer* [dropdown] - List supplier */
  penjualanCustomer?: 'Cash Ready Stock' | 'Perjanjian Kerja Sama' | 'Pre-Order';
  /** Cara pembayaran* [dropdown] - List supplier */
  caraPembayaranCustomer?: 'Transfer' | 'Tunai';
  /** Paling cepat* [text] - List supplier satuan: hari */
  jangkaCepatCustomer?: string;
  /** Paling lama* [text] - List supplier satuan: hari */
  jangkaLamaCustomer?: string;
  /** Cash* [text] - List supplier satuan: % */
  cashCustomer?: string;
  /** Tempo* [text] - List supplier satuan: % */
  tempoCustomer?: string;
  /** Skema penjualan ke customer* [textarea] - List supplier */
  skemaPenjualanCustomer?: string;
  /** Apakah ada aspek produksi* [radio] - List supplier */
  apakahAdaAspekProduksi?: 'Ya' | 'Tidak';
  /** Sistem produksi produk [dropdown] - List supplier */
  sistemProduksiProduk?: 'Manual' | 'Semi Otomatis' | 'Full Otomatis';
  /** Nama brand/merk dagang debitur [text] - List supplier */
  namaBrand?: string;
  /** Jenis bahan baku [dropdown] - List supplier */
  jenisBahanBaku?: 'General (umum)' | 'Spesifik (langka)';
  /** Ada barang pengganti [radio] - List supplier */
  adaBarangPengganti?: 'Ya' | 'Tidak';
  /** Ketersediaan sumber bahan baku [textarea] - List supplier */
  ketersediaanBahanBaku?: string;
  /** Ada armada* [radio] - List supplier */
  adaArmada?: 'Ya' | 'Tidak';
  /** Memiliki cabang?* [radio] - List supplier */
  memilikiCabang?: 'Ya' | 'Tidak';
  /** Riwayat perkembangan usaha* [textarea] - List supplier */
  riwayatPerkembanganUsaha?: string;
  /** Prospek usaha yang akan datang* [dropdown] - List supplier */
  prospekUsahaMendatang?: 'High Demand' | 'New Contract' | 'No Competitor' | 'PO' | 'Stabil';
  /** Rencana pengembangan usaha ke depan* [dropdown] - List supplier */
  rencanaPengembanganMendatang?: 'Buka Cabang Baru' | 'Ekspansi' | 'Lainnya' | 'Penambahan Produk Baru' | 'Turun Tangan';
  /** Detail prospek usaha* [text] - List supplier */
  detailProspekUsaha?: string;
  /** Detail modus operandi* [textarea] - List supplier */
  detailModusOperandi?: string;
  /** Situasi market [dropdown] - List supplier */
  situasiMarket?: 'Ramai' | 'Sepi' | 'Stabil';
  /** Terdapat peak/low season [radio] - List supplier */
  terdapatPeakLowSeason?: 'Ya' | 'Tidak';
  /** Kompetitor dan kondisi pasar [dropdown] - List supplier */
  kompetitorKondisiPasar?: 'Distributor Tunggal' | 'Market Leader' | 'Pemain Baru (jasa)' | 'Subdistributor';
  /** Kompetitor terbesar usaha debitur [textarea] - List supplier */
  kompetitorTerbesar?: string;
  /** Kelebihan usaha debitur dibanding kompetitor sejenis [textarea] - List supplier */
  kelebihanUsahaDebiturKompetitor?: string;
  /** Strategi menghadapi kompetitor (usaha sejenis)* [text] - List supplier */
  strategiHadapiKompetitor?: string;
  /** Pengaruh kebijakan sosial, ekonomi, dan politik ke usaha [dropdown] - List supplier */
  pengaruhKebijakan?: 'Cukup Terdampak' | 'Sangat Terdampak' | 'Sedikit Terdampak' | 'Tidak Terdampak';
  /** Ada kontrak/project?* [radio] - List supplier */
  adaKontrakProject?: 'Ya' | 'Tidak';
  /** Baris "listSupplier"; elemen ke-i mengisi baris ke-i (otomatis klik "Tambah baris" bila baris belum ada) */
  listSupplier?: AspekUsahaListSupplierRowData[];
  /** Baris "jenis"; elemen ke-i mengisi baris ke-i */
  jenis?: AspekUsahaJenisRowData[];
  /** Baris "tingkat"; elemen ke-i mengisi baris ke-i */
  tingkat?: AspekUsahaTingkatRowData[];
  /** Baris "analisaResiko"; elemen ke-i mengisi baris ke-i */
  analisaResiko?: AspekUsahaAnalisaResikoRowData[];
}

/**
 * Section "Aspek Usaha" - bucket data_usaha
 */
export class AspekUsahaSection extends BucketSection {
  readonly bucket: BucketId = 'data_usaha';
  readonly title = 'Aspek Usaha';
  readonly sidebarTitle = 'Aspek usaha';

  /** Nama Usaha* [text] */
  get name() { return new TextInput(this.root, 'name'); }
  /** Kategori usaha* [dropdown] */
  get category() { return new Dropdown(this.root, 'category'); }
  /** Jenis produk/jasa* [dropdown] */
  get jenisProduk() { return new Dropdown(this.root, 'jenisProduk'); }
  /** Status usaha sewa* [radio] */
  get statusUsahaSewa() { return new RadioGroup(this.root, 'Status usaha sewa'); }
  /** Cara pemesanan [dropdown] */
  get caraPemesananSupplier() { return new Dropdown(this.root, 'caraPemesananSupplier'); }
  /** Cara pembayaran [dropdown] */
  get caraPembayaranSupplier() { return new Dropdown(this.root, 'caraPembayaranSupplier'); }
  /** Paling cepat [text] satuan: hari */
  get jangkaCepatSupplier() { return new TextInput(this.root, 'jangkaCepatSupplier'); }
  /** Paling lama [text] satuan: hari */
  get jangkaLamaSupplier() { return new TextInput(this.root, 'jangkaLamaSupplier'); }
  /** Cash [text] satuan: % */
  get cashSupplier() { return new TextInput(this.root, 'cashSupplier'); }
  /** Tempo [text] satuan: % */
  get tempoSupplier() { return new TextInput(this.root, 'tempoSupplier'); }
  /** Skema pembelian ke supplier [textarea] */
  get skemaPembelianSupplier() { return new TextInput(this.root, 'skemaPembelianSupplier'); }
  /** Inventory days on hand [text] - List supplier satuan: hari */
  get inventoryDays() { return new TextInput(this.root, 'inventoryDays'); }
  /** Detail inventory [textarea] - List supplier */
  get detailInventory() { return new TextInput(this.root, 'detailInventory'); }
  /** Tipe customer debitur* [dropdown] - List supplier */
  get tipeCustomerDebitur() { return new Dropdown(this.root, 'tipeCustomerDebitur'); }
  /** Jumlah customer* [text] - List supplier */
  get jumlahCustomer() { return new TextInput(this.root, 'jumlahCustomer'); }
  /** Penjualan customer* [dropdown] - List supplier */
  get penjualanCustomer() { return new Dropdown(this.root, 'penjualanCustomer'); }
  /** Cara pembayaran* [dropdown] - List supplier */
  get caraPembayaranCustomer() { return new Dropdown(this.root, 'caraPembayaranCustomer'); }
  /** Paling cepat* [text] - List supplier satuan: hari */
  get jangkaCepatCustomer() { return new TextInput(this.root, 'jangkaCepatCustomer'); }
  /** Paling lama* [text] - List supplier satuan: hari */
  get jangkaLamaCustomer() { return new TextInput(this.root, 'jangkaLamaCustomer'); }
  /** Cash* [text] - List supplier satuan: % */
  get cashCustomer() { return new TextInput(this.root, 'cashCustomer'); }
  /** Tempo* [text] - List supplier satuan: % */
  get tempoCustomer() { return new TextInput(this.root, 'tempoCustomer'); }
  /** Skema penjualan ke customer* [textarea] - List supplier */
  get skemaPenjualanCustomer() { return new TextInput(this.root, 'skemaPenjualanCustomer'); }
  /** Apakah ada aspek produksi* [radio] - List supplier */
  get apakahAdaAspekProduksi() { return new RadioGroup(this.root, 'Apakah ada aspek produksi'); }
  /** Sistem produksi produk [dropdown] - List supplier */
  get sistemProduksiProduk() { return new Dropdown(this.root, 'sistemProduksiProduk'); }
  /** Nama brand/merk dagang debitur [text] - List supplier */
  get namaBrand() { return new TextInput(this.root, 'namaBrand'); }
  /** Jenis bahan baku [dropdown] - List supplier */
  get jenisBahanBaku() { return new Dropdown(this.root, 'jenisBahanBaku'); }
  /** Ada barang pengganti [radio] - List supplier */
  get adaBarangPengganti() { return new RadioGroup(this.root, 'Ada barang pengganti'); }
  /** Ketersediaan sumber bahan baku [textarea] - List supplier */
  get ketersediaanBahanBaku() { return new TextInput(this.root, 'ketersediaanBahanBaku'); }
  /** Ada armada* [radio] - List supplier */
  get adaArmada() { return new RadioGroup(this.root, 'Ada armada'); }
  /** Memiliki cabang?* [radio] - List supplier */
  get memilikiCabang() { return new RadioGroup(this.root, 'Memiliki cabang?'); }
  /** Riwayat perkembangan usaha* [textarea] - List supplier */
  get riwayatPerkembanganUsaha() { return new TextInput(this.root, 'riwayatPerkembanganUsaha'); }
  /** Prospek usaha yang akan datang* [dropdown] - List supplier */
  get prospekUsahaMendatang() { return new Dropdown(this.root, 'prospekUsahaMendatang'); }
  /** Rencana pengembangan usaha ke depan* [dropdown] - List supplier */
  get rencanaPengembanganMendatang() { return new Dropdown(this.root, 'rencanaPengembanganMendatang'); }
  /** Detail prospek usaha* [text] - List supplier */
  get detailProspekUsaha() { return new TextInput(this.root, 'detailProspekUsaha'); }
  /** Detail modus operandi* [textarea] - List supplier */
  get detailModusOperandi() { return new TextInput(this.root, 'detailModusOperandi'); }
  /** Situasi market [dropdown] - List supplier */
  get situasiMarket() { return new Dropdown(this.root, 'situasiMarket'); }
  /** Terdapat peak/low season [radio] - List supplier */
  get terdapatPeakLowSeason() { return new RadioGroup(this.root, 'Terdapat peak/low season'); }
  /** Kompetitor dan kondisi pasar [dropdown] - List supplier */
  get kompetitorKondisiPasar() { return new Dropdown(this.root, 'kompetitorKondisiPasar'); }
  /** Kompetitor terbesar usaha debitur [textarea] - List supplier */
  get kompetitorTerbesar() { return new TextInput(this.root, 'kompetitorTerbesar'); }
  /** Kelebihan usaha debitur dibanding kompetitor sejenis [textarea] - List supplier */
  get kelebihanUsahaDebiturKompetitor() { return new TextInput(this.root, 'kelebihanUsahaDebiturKompetitor'); }
  /** Strategi menghadapi kompetitor (usaha sejenis)* [text] - List supplier */
  get strategiHadapiKompetitor() { return new TextInput(this.root, 'strategiHadapiKompetitor'); }
  /** Pengaruh kebijakan sosial, ekonomi, dan politik ke usaha [dropdown] - List supplier */
  get pengaruhKebijakan() { return new Dropdown(this.root, 'pengaruhKebijakan'); }
  /** Ada kontrak/project?* [radio] - List supplier */
  get adaKontrakProject() { return new RadioGroup(this.root, 'Ada kontrak/project?'); }
  /** Baris "listSupplier" ke-index (0-based) */
  listSupplier(index: number) { return new AspekUsahaListSupplierRow(this.root, index); }
  /** Baris "jenis" ke-index (0-based) */
  jenis(index: number) { return new AspekUsahaJenisRow(this.root, index); }
  /** Baris "tingkat" ke-index (0-based) */
  tingkat(index: number) { return new AspekUsahaTingkatRow(this.root, index); }
  /** Baris "analisaResiko" ke-index (0-based) */
  analisaResiko(index: number) { return new AspekUsahaAnalisaResikoRow(this.root, index); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: AspekUsahaData) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.category !== undefined) await this.category.select(data.category);
    if (data.jenisProduk !== undefined) await this.jenisProduk.select(data.jenisProduk);
    if (data.statusUsahaSewa !== undefined) await this.statusUsahaSewa.select(data.statusUsahaSewa);
    if (data.caraPemesananSupplier !== undefined) await this.caraPemesananSupplier.select(data.caraPemesananSupplier);
    if (data.caraPembayaranSupplier !== undefined) await this.caraPembayaranSupplier.select(data.caraPembayaranSupplier);
    if (data.jangkaCepatSupplier !== undefined) await this.jangkaCepatSupplier.fill(data.jangkaCepatSupplier);
    if (data.jangkaLamaSupplier !== undefined) await this.jangkaLamaSupplier.fill(data.jangkaLamaSupplier);
    if (data.cashSupplier !== undefined) await this.cashSupplier.fill(data.cashSupplier);
    if (data.tempoSupplier !== undefined) await this.tempoSupplier.fill(data.tempoSupplier);
    if (data.skemaPembelianSupplier !== undefined) await this.skemaPembelianSupplier.fill(data.skemaPembelianSupplier);
    if (data.inventoryDays !== undefined) await this.inventoryDays.fill(data.inventoryDays);
    if (data.detailInventory !== undefined) await this.detailInventory.fill(data.detailInventory);
    if (data.tipeCustomerDebitur !== undefined) await this.tipeCustomerDebitur.select(data.tipeCustomerDebitur);
    if (data.jumlahCustomer !== undefined) await this.jumlahCustomer.fill(data.jumlahCustomer);
    if (data.penjualanCustomer !== undefined) await this.penjualanCustomer.select(data.penjualanCustomer);
    if (data.caraPembayaranCustomer !== undefined) await this.caraPembayaranCustomer.select(data.caraPembayaranCustomer);
    if (data.jangkaCepatCustomer !== undefined) await this.jangkaCepatCustomer.fill(data.jangkaCepatCustomer);
    if (data.jangkaLamaCustomer !== undefined) await this.jangkaLamaCustomer.fill(data.jangkaLamaCustomer);
    if (data.cashCustomer !== undefined) await this.cashCustomer.fill(data.cashCustomer);
    if (data.tempoCustomer !== undefined) await this.tempoCustomer.fill(data.tempoCustomer);
    if (data.skemaPenjualanCustomer !== undefined) await this.skemaPenjualanCustomer.fill(data.skemaPenjualanCustomer);
    if (data.apakahAdaAspekProduksi !== undefined) await this.apakahAdaAspekProduksi.select(data.apakahAdaAspekProduksi);
    if (data.sistemProduksiProduk !== undefined) await this.sistemProduksiProduk.select(data.sistemProduksiProduk);
    if (data.namaBrand !== undefined) await this.namaBrand.fill(data.namaBrand);
    if (data.jenisBahanBaku !== undefined) await this.jenisBahanBaku.select(data.jenisBahanBaku);
    if (data.adaBarangPengganti !== undefined) await this.adaBarangPengganti.select(data.adaBarangPengganti);
    if (data.ketersediaanBahanBaku !== undefined) await this.ketersediaanBahanBaku.fill(data.ketersediaanBahanBaku);
    if (data.adaArmada !== undefined) await this.adaArmada.select(data.adaArmada);
    if (data.memilikiCabang !== undefined) await this.memilikiCabang.select(data.memilikiCabang);
    if (data.riwayatPerkembanganUsaha !== undefined) await this.riwayatPerkembanganUsaha.fill(data.riwayatPerkembanganUsaha);
    if (data.prospekUsahaMendatang !== undefined) await this.prospekUsahaMendatang.select(data.prospekUsahaMendatang);
    if (data.rencanaPengembanganMendatang !== undefined) await this.rencanaPengembanganMendatang.select(data.rencanaPengembanganMendatang);
    if (data.detailProspekUsaha !== undefined) await this.detailProspekUsaha.fill(data.detailProspekUsaha);
    if (data.detailModusOperandi !== undefined) await this.detailModusOperandi.fill(data.detailModusOperandi);
    if (data.situasiMarket !== undefined) await this.situasiMarket.select(data.situasiMarket);
    if (data.terdapatPeakLowSeason !== undefined) await this.terdapatPeakLowSeason.select(data.terdapatPeakLowSeason);
    if (data.kompetitorKondisiPasar !== undefined) await this.kompetitorKondisiPasar.select(data.kompetitorKondisiPasar);
    if (data.kompetitorTerbesar !== undefined) await this.kompetitorTerbesar.fill(data.kompetitorTerbesar);
    if (data.kelebihanUsahaDebiturKompetitor !== undefined) await this.kelebihanUsahaDebiturKompetitor.fill(data.kelebihanUsahaDebiturKompetitor);
    if (data.strategiHadapiKompetitor !== undefined) await this.strategiHadapiKompetitor.fill(data.strategiHadapiKompetitor);
    if (data.pengaruhKebijakan !== undefined) await this.pengaruhKebijakan.select(data.pengaruhKebijakan);
    if (data.adaKontrakProject !== undefined) await this.adaKontrakProject.select(data.adaKontrakProject);
    for (const [i, row] of (data.listSupplier ?? []).entries()) {
      if (!(await this.listSupplier(i).exists())) await this.button('Tambah baris').click();
      await this.listSupplier(i).fill(row);
    }
    for (const [i, row] of (data.jenis ?? []).entries()) {
      await this.jenis(i).fill(row);
    }
    for (const [i, row] of (data.tingkat ?? []).entries()) {
      await this.tingkat(i).fill(row);
    }
    for (const [i, row] of (data.analisaResiko ?? []).entries()) {
      await this.analisaResiko(i).fill(row);
    }
  }
}
