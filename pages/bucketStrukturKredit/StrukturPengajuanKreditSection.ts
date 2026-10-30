// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/struktur_kredit.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Locator, Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, TextInput } from '../components/FormControls';

export interface StrukturPengajuanKreditProductsRowData {
  /** Jenis fasilitas* [dropdown] */
  product?: 'SCF' | 'Simas Dana Tunai' | 'SME Umum' | 'Back to Back' | 'Kredit dengan Agunan Produk Investasi';
}

/** Satu baris "products" (indeks 0-based) */
export class StrukturPengajuanKreditProductsRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Jenis fasilitas* [dropdown] */
  get product() { return new Dropdown(this.root, `products.${this.index}.product`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.product.locator.count()) > 0; }

  async fill(data: StrukturPengajuanKreditProductsRowData) {
    if (data.product !== undefined) await this.product.select(data.product);
  }
}

export interface StrukturPengajuanKreditFacilityRowData {
  /** Jenis fasilitas* [dropdown] */
  facilityType?: 'TL' | 'DL' | 'PRK';
  /** Jenis pengajuan* [dropdown] */
  submissionType?: 'Pengajuan Baru';
  /** Pengajuan plafon* [text] satuan: Rp */
  plafon?: string;
  /** Periode pinjaman (dalam bulan)* [text] */
  tenorMonths?: string;
  /** Tujuan penggunaan* [dropdown] */
  usagePurpose?: 'Modal Kerja' | 'Investasi' | 'Konsumsi';
  /** Keterangan tujuan* [textarea] */
  usageDescription?: string;
}

/** Satu baris "facility" (indeks 0-based) */
export class StrukturPengajuanKreditFacilityRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Jenis fasilitas* [dropdown] */
  get facilityType() { return new Dropdown(this.root, `products.0.facility.${this.index}.facilityType`); }
  /** Jenis pengajuan* [dropdown] */
  get submissionType() { return new Dropdown(this.root, `products.0.facility.${this.index}.submissionType`); }
  /** Pengajuan plafon* [text] satuan: Rp */
  get plafon() { return new TextInput(this.root, `products.0.facility.${this.index}.plafon`); }
  /** Periode pinjaman (dalam bulan)* [text] */
  get tenorMonths() { return new TextInput(this.root, `products.0.facility.${this.index}.tenorMonths`); }
  /** Tujuan penggunaan* [dropdown] */
  get usagePurpose() { return new Dropdown(this.root, `products.0.facility.${this.index}.usagePurpose`); }
  /** Keterangan tujuan* [textarea] */
  get usageDescription() { return new TextInput(this.root, `products.0.facility.${this.index}.usageDescription`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.facilityType.locator.count()) > 0; }

  async fill(data: StrukturPengajuanKreditFacilityRowData) {
    if (data.facilityType !== undefined) await this.facilityType.select(data.facilityType);
    if (data.submissionType !== undefined) await this.submissionType.select(data.submissionType);
    if (data.plafon !== undefined) await this.plafon.fill(data.plafon);
    if (data.tenorMonths !== undefined) await this.tenorMonths.fill(data.tenorMonths);
    if (data.usagePurpose !== undefined) await this.usagePurpose.select(data.usagePurpose);
    if (data.usageDescription !== undefined) await this.usageDescription.fill(data.usageDescription);
  }
}

export interface StrukturPengajuanKreditInterestSchemaRowData {
  /** effectiveRatePA* [text] */
  effectiveRatePa?: string;
  /** flateRatePA* [text] */
  flateRatePa?: string;
}

/** Satu baris "interestSchema" (indeks 0-based) */
export class StrukturPengajuanKreditInterestSchemaRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** effectiveRatePA* [text] */
  get effectiveRatePa() { return new TextInput(this.root, `products.0.facility.0.interestSchema.${this.index}.effectiveRatePA`); }
  /** flateRatePA* [text] */
  get flateRatePa() { return new TextInput(this.root, `products.0.facility.0.interestSchema.${this.index}.flateRatePA`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.effectiveRatePa.locator.count()) > 0; }

  async fill(data: StrukturPengajuanKreditInterestSchemaRowData) {
    if (data.effectiveRatePa !== undefined) await this.effectiveRatePa.fill(data.effectiveRatePa);
    if (data.flateRatePa !== undefined) await this.flateRatePa.fill(data.flateRatePa);
  }
}

export interface StrukturPengajuanKreditCreditFeeRowData {
  /** feeType* [dropdown] (disabled saat explore / auto-fill) */
  feeType?: string;
  /** nominal* [text] satuan: Rp */
  nominal?: string;
  /** percentage* [text] satuan: % */
  percentage?: string;
}

/** Satu baris "creditFee" (indeks 0-based) */
export class StrukturPengajuanKreditCreditFeeRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** feeType* [dropdown] (disabled saat explore / auto-fill) */
  get feeType() { return new Dropdown(this.root, `products.0.facility.0.creditFee.${this.index}.feeType`); }
  /** nominal* [text] satuan: Rp */
  get nominal() { return new TextInput(this.root, `products.0.facility.0.creditFee.${this.index}.nominal`); }
  /** percentage* [text] satuan: % */
  get percentage() { return new TextInput(this.root, `products.0.facility.0.creditFee.${this.index}.percentage`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.feeType.locator.count()) > 0; }

  async fill(data: StrukturPengajuanKreditCreditFeeRowData) {
    if (data.feeType !== undefined) await this.feeType.select(data.feeType);
    if (data.nominal !== undefined) await this.nominal.fill(data.nominal);
    if (data.percentage !== undefined) await this.percentage.fill(data.percentage);
  }
}

export interface StrukturPengajuanKreditData {
  /** Baris "products"; elemen ke-i mengisi baris ke-i */
  products?: StrukturPengajuanKreditProductsRowData[];
  /** Baris "facility"; elemen ke-i mengisi baris ke-i */
  facility?: StrukturPengajuanKreditFacilityRowData[];
  /** Baris "interestSchema"; elemen ke-i mengisi baris ke-i */
  interestSchema?: StrukturPengajuanKreditInterestSchemaRowData[];
  /** Baris "creditFee"; elemen ke-i mengisi baris ke-i */
  creditFee?: StrukturPengajuanKreditCreditFeeRowData[];
}

/**
 * Section "Struktur pengajuan kredit" - bucket struktur_kredit
 */
export class StrukturPengajuanKreditSection extends BucketSection {
  readonly bucket: BucketId = 'struktur_kredit';
  readonly title = 'Struktur pengajuan kredit';
  readonly sidebarTitle = 'Struktur Pengajuan Kredit';

  /** Baris "products" ke-index (0-based) */
  products(index: number) { return new StrukturPengajuanKreditProductsRow(this.root, index); }
  /** Baris "facility" ke-index (0-based) */
  facility(index: number) { return new StrukturPengajuanKreditFacilityRow(this.root, index); }
  /** Baris "interestSchema" ke-index (0-based) */
  interestSchema(index: number) { return new StrukturPengajuanKreditInterestSchemaRow(this.root, index); }
  /** Baris "creditFee" ke-index (0-based) */
  creditFee(index: number) { return new StrukturPengajuanKreditCreditFeeRow(this.root, index); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: StrukturPengajuanKreditData) {
    for (const [i, row] of (data.products ?? []).entries()) {
      await this.products(i).fill(row);
    }
    for (const [i, row] of (data.facility ?? []).entries()) {
      await this.facility(i).fill(row);
    }
    for (const [i, row] of (data.interestSchema ?? []).entries()) {
      await this.interestSchema(i).fill(row);
    }
    for (const [i, row] of (data.creditFee ?? []).entries()) {
      await this.creditFee(i).fill(row);
    }
  }
}
