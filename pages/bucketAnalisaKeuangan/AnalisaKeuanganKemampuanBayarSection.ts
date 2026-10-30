// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/analisa_keuangan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { TextInput } from '../components/FormControls';

export interface AnalisaKeuanganKemampuanBayarData {
  /** Nama usaha* [text] */
  businessName?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingSales?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingSales?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingCogs?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingCogs?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossBeforeFinancingGrossProfit?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossAfterFinancingGrossProfit?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingOperatingExpense?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingOperatingExpense?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossBeforeFinancingOperatingIncome?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossAfterFinancingOperatingIncome?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingTotalInterestAndInstallment?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingTotalInterestAndInstallment?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingOtherExpense?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingOtherExpense?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossBeforeFinancingOtherIncome?: string;
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  profitAndLossAfterFinancingOtherIncome?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossBeforeFinancingEarningBeforeTax?: string;
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  profitAndLossAfterFinancingEarningBeforeTax?: string;
  /** Analisa laba rugi* [textarea] - Laba rugi* */
  profitAndLossAnalysis?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  repaymentCapacityBeforeFinancingTotalInterestAndInstallment?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  repaymentCapacityAfterFinancingTotalInterestAndInstallment?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  repaymentCapacityBeforeFinancingOperatingIncome?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  repaymentCapacityAfterFinancingOperatingIncome?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  repaymentCapacityBeforeFinancingRpcRatio?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  repaymentCapacityAfterFinancingRpcRatio?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  repaymentCapacityBeforeFinancingDscr?: string;
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  repaymentCapacityAfterFinancingDscr?: string;
  /** Analisa RPC* [textarea] - RPC* */
  rpcAnalysis?: string;
}

/**
 * Section "Analisa keuangan & kemampuan bayar" - bucket analisa_keuangan
 */
export class AnalisaKeuanganKemampuanBayarSection extends BucketSection {
  readonly bucket: BucketId = 'analisa_keuangan';
  readonly title = 'Analisa keuangan & kemampuan bayar';
  readonly sidebarTitle = 'Analisa Keuangan & Kemampuan Bayar';

  /** Nama usaha* [text] */
  get businessName() { return new TextInput(this.root, 'businessName'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingSales() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.sales'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingSales() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.sales'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingCogs() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.cogs'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingCogs() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.cogs'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossBeforeFinancingGrossProfit() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.grossProfit'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossAfterFinancingGrossProfit() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.grossProfit'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingOperatingExpense() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.operatingExpense'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingOperatingExpense() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.operatingExpense'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossBeforeFinancingOperatingIncome() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.operatingIncome'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossAfterFinancingOperatingIncome() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.operatingIncome'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingTotalInterestAndInstallment() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.totalInterestAndInstallment'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingTotalInterestAndInstallment() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.totalInterestAndInstallment'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingOtherExpense() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.otherExpense'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingOtherExpense() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.otherExpense'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossBeforeFinancingOtherIncome() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.otherIncome'); }
  /** Nama usaha* [text] - Laba rugi* satuan: Rp */
  get profitAndLossAfterFinancingOtherIncome() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.otherIncome'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossBeforeFinancingEarningBeforeTax() { return new TextInput(this.root, 'profitAndLoss.beforeFinancing.earningBeforeTax'); }
  /** Nama usaha* [text] - Laba rugi* (disabled saat explore / auto-fill) satuan: Rp */
  get profitAndLossAfterFinancingEarningBeforeTax() { return new TextInput(this.root, 'profitAndLoss.afterFinancing.earningBeforeTax'); }
  /** Analisa laba rugi* [textarea] - Laba rugi* */
  get profitAndLossAnalysis() { return new TextInput(this.root, 'profitAndLossAnalysis'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  get repaymentCapacityBeforeFinancingTotalInterestAndInstallment() { return new TextInput(this.root, 'repaymentCapacity.beforeFinancing.totalInterestAndInstallment'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  get repaymentCapacityAfterFinancingTotalInterestAndInstallment() { return new TextInput(this.root, 'repaymentCapacity.afterFinancing.totalInterestAndInstallment'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  get repaymentCapacityBeforeFinancingOperatingIncome() { return new TextInput(this.root, 'repaymentCapacity.beforeFinancing.operatingIncome'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) satuan: Rp */
  get repaymentCapacityAfterFinancingOperatingIncome() { return new TextInput(this.root, 'repaymentCapacity.afterFinancing.operatingIncome'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  get repaymentCapacityBeforeFinancingRpcRatio() { return new TextInput(this.root, 'repaymentCapacity.beforeFinancing.rpcRatio'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  get repaymentCapacityAfterFinancingRpcRatio() { return new TextInput(this.root, 'repaymentCapacity.afterFinancing.rpcRatio'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  get repaymentCapacityBeforeFinancingDscr() { return new TextInput(this.root, 'repaymentCapacity.beforeFinancing.dscr'); }
  /** Nama usaha* [text] - RPC* (disabled saat explore / auto-fill) */
  get repaymentCapacityAfterFinancingDscr() { return new TextInput(this.root, 'repaymentCapacity.afterFinancing.dscr'); }
  /** Analisa RPC* [textarea] - RPC* */
  get rpcAnalysis() { return new TextInput(this.root, 'rpcAnalysis'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: AnalisaKeuanganKemampuanBayarData) {
    if (data.businessName !== undefined) await this.businessName.fill(data.businessName);
    if (data.profitAndLossBeforeFinancingSales !== undefined) await this.profitAndLossBeforeFinancingSales.fill(data.profitAndLossBeforeFinancingSales);
    if (data.profitAndLossAfterFinancingSales !== undefined) await this.profitAndLossAfterFinancingSales.fill(data.profitAndLossAfterFinancingSales);
    if (data.profitAndLossBeforeFinancingCogs !== undefined) await this.profitAndLossBeforeFinancingCogs.fill(data.profitAndLossBeforeFinancingCogs);
    if (data.profitAndLossAfterFinancingCogs !== undefined) await this.profitAndLossAfterFinancingCogs.fill(data.profitAndLossAfterFinancingCogs);
    if (data.profitAndLossBeforeFinancingGrossProfit !== undefined) await this.profitAndLossBeforeFinancingGrossProfit.fill(data.profitAndLossBeforeFinancingGrossProfit);
    if (data.profitAndLossAfterFinancingGrossProfit !== undefined) await this.profitAndLossAfterFinancingGrossProfit.fill(data.profitAndLossAfterFinancingGrossProfit);
    if (data.profitAndLossBeforeFinancingOperatingExpense !== undefined) await this.profitAndLossBeforeFinancingOperatingExpense.fill(data.profitAndLossBeforeFinancingOperatingExpense);
    if (data.profitAndLossAfterFinancingOperatingExpense !== undefined) await this.profitAndLossAfterFinancingOperatingExpense.fill(data.profitAndLossAfterFinancingOperatingExpense);
    if (data.profitAndLossBeforeFinancingOperatingIncome !== undefined) await this.profitAndLossBeforeFinancingOperatingIncome.fill(data.profitAndLossBeforeFinancingOperatingIncome);
    if (data.profitAndLossAfterFinancingOperatingIncome !== undefined) await this.profitAndLossAfterFinancingOperatingIncome.fill(data.profitAndLossAfterFinancingOperatingIncome);
    if (data.profitAndLossBeforeFinancingTotalInterestAndInstallment !== undefined) await this.profitAndLossBeforeFinancingTotalInterestAndInstallment.fill(data.profitAndLossBeforeFinancingTotalInterestAndInstallment);
    if (data.profitAndLossAfterFinancingTotalInterestAndInstallment !== undefined) await this.profitAndLossAfterFinancingTotalInterestAndInstallment.fill(data.profitAndLossAfterFinancingTotalInterestAndInstallment);
    if (data.profitAndLossBeforeFinancingOtherExpense !== undefined) await this.profitAndLossBeforeFinancingOtherExpense.fill(data.profitAndLossBeforeFinancingOtherExpense);
    if (data.profitAndLossAfterFinancingOtherExpense !== undefined) await this.profitAndLossAfterFinancingOtherExpense.fill(data.profitAndLossAfterFinancingOtherExpense);
    if (data.profitAndLossBeforeFinancingOtherIncome !== undefined) await this.profitAndLossBeforeFinancingOtherIncome.fill(data.profitAndLossBeforeFinancingOtherIncome);
    if (data.profitAndLossAfterFinancingOtherIncome !== undefined) await this.profitAndLossAfterFinancingOtherIncome.fill(data.profitAndLossAfterFinancingOtherIncome);
    if (data.profitAndLossBeforeFinancingEarningBeforeTax !== undefined) await this.profitAndLossBeforeFinancingEarningBeforeTax.fill(data.profitAndLossBeforeFinancingEarningBeforeTax);
    if (data.profitAndLossAfterFinancingEarningBeforeTax !== undefined) await this.profitAndLossAfterFinancingEarningBeforeTax.fill(data.profitAndLossAfterFinancingEarningBeforeTax);
    if (data.profitAndLossAnalysis !== undefined) await this.profitAndLossAnalysis.fill(data.profitAndLossAnalysis);
    if (data.repaymentCapacityBeforeFinancingTotalInterestAndInstallment !== undefined) await this.repaymentCapacityBeforeFinancingTotalInterestAndInstallment.fill(data.repaymentCapacityBeforeFinancingTotalInterestAndInstallment);
    if (data.repaymentCapacityAfterFinancingTotalInterestAndInstallment !== undefined) await this.repaymentCapacityAfterFinancingTotalInterestAndInstallment.fill(data.repaymentCapacityAfterFinancingTotalInterestAndInstallment);
    if (data.repaymentCapacityBeforeFinancingOperatingIncome !== undefined) await this.repaymentCapacityBeforeFinancingOperatingIncome.fill(data.repaymentCapacityBeforeFinancingOperatingIncome);
    if (data.repaymentCapacityAfterFinancingOperatingIncome !== undefined) await this.repaymentCapacityAfterFinancingOperatingIncome.fill(data.repaymentCapacityAfterFinancingOperatingIncome);
    if (data.repaymentCapacityBeforeFinancingRpcRatio !== undefined) await this.repaymentCapacityBeforeFinancingRpcRatio.fill(data.repaymentCapacityBeforeFinancingRpcRatio);
    if (data.repaymentCapacityAfterFinancingRpcRatio !== undefined) await this.repaymentCapacityAfterFinancingRpcRatio.fill(data.repaymentCapacityAfterFinancingRpcRatio);
    if (data.repaymentCapacityBeforeFinancingDscr !== undefined) await this.repaymentCapacityBeforeFinancingDscr.fill(data.repaymentCapacityBeforeFinancingDscr);
    if (data.repaymentCapacityAfterFinancingDscr !== undefined) await this.repaymentCapacityAfterFinancingDscr.fill(data.repaymentCapacityAfterFinancingDscr);
    if (data.rpcAnalysis !== undefined) await this.rpcAnalysis.fill(data.rpcAnalysis);
  }
}
