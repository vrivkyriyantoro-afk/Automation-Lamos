// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/analisa_keuangan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { TextInput } from '../components/FormControls';

export interface NeracaData {
  /** Nama usaha* [text] */
  name?: string;
  /** Nama usaha* [text] satuan: Rp */
  cashAndBank?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalCurrentAssets?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalInventories?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalAssets?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalCurrentLiabilities?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalDebt?: string;
  /** Nama usaha* [text] satuan: Rp */
  totalEquity?: string;
}

/**
 * Section "Neraca" - bucket analisa_keuangan
 */
export class NeracaSection extends BucketSection {
  readonly bucket: BucketId = 'analisa_keuangan';
  readonly title = 'Neraca';
  readonly sidebarTitle = 'Neraca';

  /** Nama usaha* [text] */
  get name() { return new TextInput(this.root, 'name'); }
  /** Nama usaha* [text] satuan: Rp */
  get cashAndBank() { return new TextInput(this.root, 'cash_and_bank'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalCurrentAssets() { return new TextInput(this.root, 'total_current_assets'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalInventories() { return new TextInput(this.root, 'total_inventories'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalAssets() { return new TextInput(this.root, 'total_assets'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalCurrentLiabilities() { return new TextInput(this.root, 'total_current_liabilities'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalDebt() { return new TextInput(this.root, 'total_debt'); }
  /** Nama usaha* [text] satuan: Rp */
  get totalEquity() { return new TextInput(this.root, 'total_equity'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: NeracaData) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.cashAndBank !== undefined) await this.cashAndBank.fill(data.cashAndBank);
    if (data.totalCurrentAssets !== undefined) await this.totalCurrentAssets.fill(data.totalCurrentAssets);
    if (data.totalInventories !== undefined) await this.totalInventories.fill(data.totalInventories);
    if (data.totalAssets !== undefined) await this.totalAssets.fill(data.totalAssets);
    if (data.totalCurrentLiabilities !== undefined) await this.totalCurrentLiabilities.fill(data.totalCurrentLiabilities);
    if (data.totalDebt !== undefined) await this.totalDebt.fill(data.totalDebt);
    if (data.totalEquity !== undefined) await this.totalEquity.fill(data.totalEquity);
  }
}
