// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/analisa_keuangan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Locator, Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { TextInput } from '../components/FormControls';

export interface AnalisaMutasiRekeningStatementDetailsRowData {
  /** bankName* [text] - Mutasi rekening* */
  bankName?: string;
  /** accountNumber* [text] - Mutasi rekening* */
  accountNumber?: string;
  /** averageDebitAmount* [text] - Mutasi rekening* */
  averageDebitAmount?: string;
  /** averageDebitFrequency* [text] - Mutasi rekening* */
  averageDebitFrequency?: string;
  /** averageCreditAmount* [text] - Mutasi rekening* */
  averageCreditAmount?: string;
  /** averageCreditFrequency* [text] - Mutasi rekening* */
  averageCreditFrequency?: string;
  /** averageBalance* [text] - Mutasi rekening* */
  averageBalance?: string;
}

/** Satu baris "statementDetails" (indeks 0-based); baris baru via tombol "Tambah baris" */
export class AnalisaMutasiRekeningStatementDetailsRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** bankName* [text] - Mutasi rekening* */
  get bankName() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.bankName`); }
  /** accountNumber* [text] - Mutasi rekening* */
  get accountNumber() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.accountNumber`); }
  /** averageDebitAmount* [text] - Mutasi rekening* */
  get averageDebitAmount() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.averageDebitAmount`); }
  /** averageDebitFrequency* [text] - Mutasi rekening* */
  get averageDebitFrequency() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.averageDebitFrequency`); }
  /** averageCreditAmount* [text] - Mutasi rekening* */
  get averageCreditAmount() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.averageCreditAmount`); }
  /** averageCreditFrequency* [text] - Mutasi rekening* */
  get averageCreditFrequency() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.averageCreditFrequency`); }
  /** averageBalance* [text] - Mutasi rekening* */
  get averageBalance() { return new TextInput(this.root, `mutasiRekening.0.statementDetails.${this.index}.averageBalance`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.bankName.locator.count()) > 0; }

  async fill(data: AnalisaMutasiRekeningStatementDetailsRowData) {
    if (data.bankName !== undefined) await this.bankName.fill(data.bankName);
    if (data.accountNumber !== undefined) await this.accountNumber.fill(data.accountNumber);
    if (data.averageDebitAmount !== undefined) await this.averageDebitAmount.fill(data.averageDebitAmount);
    if (data.averageDebitFrequency !== undefined) await this.averageDebitFrequency.fill(data.averageDebitFrequency);
    if (data.averageCreditAmount !== undefined) await this.averageCreditAmount.fill(data.averageCreditAmount);
    if (data.averageCreditFrequency !== undefined) await this.averageCreditFrequency.fill(data.averageCreditFrequency);
    if (data.averageBalance !== undefined) await this.averageBalance.fill(data.averageBalance);
  }
}

export interface AnalisaMutasiRekeningMutasiRekeningRowData {
  /** Nama usaha* [text] */
  businessName?: string;
  /** Analisa mutasi rekening* [textarea] - Mutasi rekening* */
  analysisSummary?: string;
}

/** Satu baris "mutasiRekening" (indeks 0-based) */
export class AnalisaMutasiRekeningMutasiRekeningRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** Nama usaha* [text] */
  get businessName() { return new TextInput(this.root, `mutasiRekening.${this.index}.businessName`); }
  /** Analisa mutasi rekening* [textarea] - Mutasi rekening* */
  get analysisSummary() { return new TextInput(this.root, `mutasiRekening.${this.index}.analysisSummary`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.businessName.locator.count()) > 0; }

  async fill(data: AnalisaMutasiRekeningMutasiRekeningRowData) {
    if (data.businessName !== undefined) await this.businessName.fill(data.businessName);
    if (data.analysisSummary !== undefined) await this.analysisSummary.fill(data.analysisSummary);
  }
}

export interface AnalisaMutasiRekeningData {
  /** Baris "statementDetails"; elemen ke-i mengisi baris ke-i (otomatis klik "Tambah baris" bila baris belum ada) */
  statementDetails?: AnalisaMutasiRekeningStatementDetailsRowData[];
  /** Baris "mutasiRekening"; elemen ke-i mengisi baris ke-i */
  mutasiRekening?: AnalisaMutasiRekeningMutasiRekeningRowData[];
}

/**
 * Section "Analisa Mutasi Rekening" - bucket analisa_keuangan
 */
export class AnalisaMutasiRekeningSection extends BucketSection {
  readonly bucket: BucketId = 'analisa_keuangan';
  readonly title = 'Analisa Mutasi Rekening';
  readonly sidebarTitle = 'Analisa Mutasi Rekening';

  /** Baris "statementDetails" ke-index (0-based) */
  statementDetails(index: number) { return new AnalisaMutasiRekeningStatementDetailsRow(this.root, index); }
  /** Baris "mutasiRekening" ke-index (0-based) */
  mutasiRekening(index: number) { return new AnalisaMutasiRekeningMutasiRekeningRow(this.root, index); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: AnalisaMutasiRekeningData) {
    for (const [i, row] of (data.statementDetails ?? []).entries()) {
      if (!(await this.statementDetails(i).exists())) await this.button('Tambah baris').click();
      await this.statementDetails(i).fill(row);
    }
    for (const [i, row] of (data.mutasiRekening ?? []).entries()) {
      await this.mutasiRekening(i).fill(row);
    }
  }
}
