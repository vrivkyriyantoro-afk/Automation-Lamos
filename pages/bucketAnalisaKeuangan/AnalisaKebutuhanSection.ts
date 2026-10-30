// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/analisa_keuangan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Locator, Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { CurrencyInput, TextInput } from '../components/FormControls';

export interface AnalisaKebutuhanWorkingInvestmentNeedsRowData {
  /** businessName* [text] - WI need */
  businessName?: string;
  /** workingInvestment.beforeFinancing.accountReceivable* [currency] - WI need satuan: Rp */
  workingInvestmentBeforeFinancingAccountReceivable?: number | string;
  /** workingInvestment.afterFinancing.accountReceivable* [currency] - WI need satuan: Rp */
  workingInvestmentAfterFinancingAccountReceivable?: number | string;
  /** workingInvestment.beforeFinancing.inventory* [currency] - WI need satuan: Rp */
  workingInvestmentBeforeFinancingInventory?: number | string;
  /** workingInvestment.afterFinancing.inventory* [currency] - WI need satuan: Rp */
  workingInvestmentAfterFinancingInventory?: number | string;
  /** workingInvestment.beforeFinancing.accountPayable* [currency] - WI need satuan: Rp */
  workingInvestmentBeforeFinancingAccountPayable?: number | string;
  /** workingInvestment.afterFinancing.accountPayable* [currency] - WI need satuan: Rp */
  workingInvestmentAfterFinancingAccountPayable?: number | string;
  /** workingInvestment.beforeFinancing.accruedExpense* [currency] - WI need satuan: Rp */
  workingInvestmentBeforeFinancingAccruedExpense?: number | string;
  /** workingInvestment.afterFinancing.accruedExpense* [currency] - WI need satuan: Rp */
  workingInvestmentAfterFinancingAccruedExpense?: number | string;
  /** workingInvestment.beforeFinancing.wiNeedAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  workingInvestmentBeforeFinancingWiNeedAmount?: number | string;
  /** workingInvestment.afterFinancing.wiNeedAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  workingInvestmentAfterFinancingWiNeedAmount?: number | string;
  /** workingInvestment.beforeFinancing.totalBankFinancingAmount* [currency] - WI need satuan: Rp */
  workingInvestmentBeforeFinancingTotalBankFinancingAmount?: number | string;
  /** workingInvestment.afterFinancing.totalBankFinancingAmount* [currency] - WI need satuan: Rp */
  workingInvestmentAfterFinancingTotalBankFinancingAmount?: number | string;
  /** workingInvestment.beforeFinancing.totalBankFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  workingInvestmentBeforeFinancingTotalBankFinancingPercentage?: string;
  /** workingInvestment.afterFinancing.totalBankFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  workingInvestmentAfterFinancingTotalBankFinancingPercentage?: string;
  /** workingInvestment.beforeFinancing.selfFinancingAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  workingInvestmentBeforeFinancingSelfFinancingAmount?: number | string;
  /** workingInvestment.afterFinancing.selfFinancingAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  workingInvestmentAfterFinancingSelfFinancingAmount?: number | string;
  /** workingInvestment.beforeFinancing.selfFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  workingInvestmentBeforeFinancingSelfFinancingPercentage?: string;
  /** workingInvestment.afterFinancing.selfFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  workingInvestmentAfterFinancingSelfFinancingPercentage?: string;
  /** Analisa WI need [textarea] - WI need */
  wiNeedAnalysis?: string;
}

/** Satu baris "workingInvestmentNeeds" (indeks 0-based) */
export class AnalisaKebutuhanWorkingInvestmentNeedsRow {
  constructor(readonly root: Locator, readonly index: number) {}

  /** businessName* [text] - WI need */
  get businessName() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.businessName`); }
  /** workingInvestment.beforeFinancing.accountReceivable* [currency] - WI need satuan: Rp */
  get workingInvestmentBeforeFinancingAccountReceivable() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.accountReceivable`); }
  /** workingInvestment.afterFinancing.accountReceivable* [currency] - WI need satuan: Rp */
  get workingInvestmentAfterFinancingAccountReceivable() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.accountReceivable`); }
  /** workingInvestment.beforeFinancing.inventory* [currency] - WI need satuan: Rp */
  get workingInvestmentBeforeFinancingInventory() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.inventory`); }
  /** workingInvestment.afterFinancing.inventory* [currency] - WI need satuan: Rp */
  get workingInvestmentAfterFinancingInventory() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.inventory`); }
  /** workingInvestment.beforeFinancing.accountPayable* [currency] - WI need satuan: Rp */
  get workingInvestmentBeforeFinancingAccountPayable() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.accountPayable`); }
  /** workingInvestment.afterFinancing.accountPayable* [currency] - WI need satuan: Rp */
  get workingInvestmentAfterFinancingAccountPayable() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.accountPayable`); }
  /** workingInvestment.beforeFinancing.accruedExpense* [currency] - WI need satuan: Rp */
  get workingInvestmentBeforeFinancingAccruedExpense() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.accruedExpense`); }
  /** workingInvestment.afterFinancing.accruedExpense* [currency] - WI need satuan: Rp */
  get workingInvestmentAfterFinancingAccruedExpense() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.accruedExpense`); }
  /** workingInvestment.beforeFinancing.wiNeedAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  get workingInvestmentBeforeFinancingWiNeedAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.wiNeedAmount`); }
  /** workingInvestment.afterFinancing.wiNeedAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  get workingInvestmentAfterFinancingWiNeedAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.wiNeedAmount`); }
  /** workingInvestment.beforeFinancing.totalBankFinancingAmount* [currency] - WI need satuan: Rp */
  get workingInvestmentBeforeFinancingTotalBankFinancingAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.totalBankFinancingAmount`); }
  /** workingInvestment.afterFinancing.totalBankFinancingAmount* [currency] - WI need satuan: Rp */
  get workingInvestmentAfterFinancingTotalBankFinancingAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.totalBankFinancingAmount`); }
  /** workingInvestment.beforeFinancing.totalBankFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  get workingInvestmentBeforeFinancingTotalBankFinancingPercentage() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.totalBankFinancingPercentage`); }
  /** workingInvestment.afterFinancing.totalBankFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  get workingInvestmentAfterFinancingTotalBankFinancingPercentage() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.totalBankFinancingPercentage`); }
  /** workingInvestment.beforeFinancing.selfFinancingAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  get workingInvestmentBeforeFinancingSelfFinancingAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.selfFinancingAmount`); }
  /** workingInvestment.afterFinancing.selfFinancingAmount* [currency] - WI need (disabled saat explore / auto-fill) satuan: Rp */
  get workingInvestmentAfterFinancingSelfFinancingAmount() { return new CurrencyInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.selfFinancingAmount`); }
  /** workingInvestment.beforeFinancing.selfFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  get workingInvestmentBeforeFinancingSelfFinancingPercentage() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.beforeFinancing.selfFinancingPercentage`); }
  /** workingInvestment.afterFinancing.selfFinancingPercentage* [text] - WI need (disabled saat explore / auto-fill) */
  get workingInvestmentAfterFinancingSelfFinancingPercentage() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.workingInvestment.afterFinancing.selfFinancingPercentage`); }
  /** Analisa WI need [textarea] - WI need */
  get wiNeedAnalysis() { return new TextInput(this.root, `workingInvestmentNeeds.${this.index}.wiNeedAnalysis`); }

  /** true jika baris ini sudah ada di UI */
  async exists() { return (await this.businessName.locator.count()) > 0; }

  async fill(data: AnalisaKebutuhanWorkingInvestmentNeedsRowData) {
    if (data.businessName !== undefined) await this.businessName.fill(data.businessName);
    if (data.workingInvestmentBeforeFinancingAccountReceivable !== undefined) await this.workingInvestmentBeforeFinancingAccountReceivable.fill(data.workingInvestmentBeforeFinancingAccountReceivable);
    if (data.workingInvestmentAfterFinancingAccountReceivable !== undefined) await this.workingInvestmentAfterFinancingAccountReceivable.fill(data.workingInvestmentAfterFinancingAccountReceivable);
    if (data.workingInvestmentBeforeFinancingInventory !== undefined) await this.workingInvestmentBeforeFinancingInventory.fill(data.workingInvestmentBeforeFinancingInventory);
    if (data.workingInvestmentAfterFinancingInventory !== undefined) await this.workingInvestmentAfterFinancingInventory.fill(data.workingInvestmentAfterFinancingInventory);
    if (data.workingInvestmentBeforeFinancingAccountPayable !== undefined) await this.workingInvestmentBeforeFinancingAccountPayable.fill(data.workingInvestmentBeforeFinancingAccountPayable);
    if (data.workingInvestmentAfterFinancingAccountPayable !== undefined) await this.workingInvestmentAfterFinancingAccountPayable.fill(data.workingInvestmentAfterFinancingAccountPayable);
    if (data.workingInvestmentBeforeFinancingAccruedExpense !== undefined) await this.workingInvestmentBeforeFinancingAccruedExpense.fill(data.workingInvestmentBeforeFinancingAccruedExpense);
    if (data.workingInvestmentAfterFinancingAccruedExpense !== undefined) await this.workingInvestmentAfterFinancingAccruedExpense.fill(data.workingInvestmentAfterFinancingAccruedExpense);
    if (data.workingInvestmentBeforeFinancingWiNeedAmount !== undefined) await this.workingInvestmentBeforeFinancingWiNeedAmount.fill(data.workingInvestmentBeforeFinancingWiNeedAmount);
    if (data.workingInvestmentAfterFinancingWiNeedAmount !== undefined) await this.workingInvestmentAfterFinancingWiNeedAmount.fill(data.workingInvestmentAfterFinancingWiNeedAmount);
    if (data.workingInvestmentBeforeFinancingTotalBankFinancingAmount !== undefined) await this.workingInvestmentBeforeFinancingTotalBankFinancingAmount.fill(data.workingInvestmentBeforeFinancingTotalBankFinancingAmount);
    if (data.workingInvestmentAfterFinancingTotalBankFinancingAmount !== undefined) await this.workingInvestmentAfterFinancingTotalBankFinancingAmount.fill(data.workingInvestmentAfterFinancingTotalBankFinancingAmount);
    if (data.workingInvestmentBeforeFinancingTotalBankFinancingPercentage !== undefined) await this.workingInvestmentBeforeFinancingTotalBankFinancingPercentage.fill(data.workingInvestmentBeforeFinancingTotalBankFinancingPercentage);
    if (data.workingInvestmentAfterFinancingTotalBankFinancingPercentage !== undefined) await this.workingInvestmentAfterFinancingTotalBankFinancingPercentage.fill(data.workingInvestmentAfterFinancingTotalBankFinancingPercentage);
    if (data.workingInvestmentBeforeFinancingSelfFinancingAmount !== undefined) await this.workingInvestmentBeforeFinancingSelfFinancingAmount.fill(data.workingInvestmentBeforeFinancingSelfFinancingAmount);
    if (data.workingInvestmentAfterFinancingSelfFinancingAmount !== undefined) await this.workingInvestmentAfterFinancingSelfFinancingAmount.fill(data.workingInvestmentAfterFinancingSelfFinancingAmount);
    if (data.workingInvestmentBeforeFinancingSelfFinancingPercentage !== undefined) await this.workingInvestmentBeforeFinancingSelfFinancingPercentage.fill(data.workingInvestmentBeforeFinancingSelfFinancingPercentage);
    if (data.workingInvestmentAfterFinancingSelfFinancingPercentage !== undefined) await this.workingInvestmentAfterFinancingSelfFinancingPercentage.fill(data.workingInvestmentAfterFinancingSelfFinancingPercentage);
    if (data.wiNeedAnalysis !== undefined) await this.wiNeedAnalysis.fill(data.wiNeedAnalysis);
  }
}

export interface AnalisaKebutuhanData {
  /** Baris "workingInvestmentNeeds"; elemen ke-i mengisi baris ke-i */
  workingInvestmentNeeds?: AnalisaKebutuhanWorkingInvestmentNeedsRowData[];
}

/**
 * Section "Analisa Kebutuhan" - bucket analisa_keuangan
 */
export class AnalisaKebutuhanSection extends BucketSection {
  readonly bucket: BucketId = 'analisa_keuangan';
  readonly title = 'Analisa Kebutuhan';
  readonly sidebarTitle = 'Analisa Kebutuhan';

  /** Baris "workingInvestmentNeeds" ke-index (0-based) */
  workingInvestmentNeeds(index: number) { return new AnalisaKebutuhanWorkingInvestmentNeedsRow(this.root, index); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: AnalisaKebutuhanData) {
    for (const [i, row] of (data.workingInvestmentNeeds ?? []).entries()) {
      await this.workingInvestmentNeeds(i).fill(row);
    }
  }
}
