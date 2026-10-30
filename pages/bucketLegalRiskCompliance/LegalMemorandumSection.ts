// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/legal_risk_compliance.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { FileUpload } from '../components/FormControls';

export interface LegalMemorandumData {
  /** Pilih atau seret file kesini [file] accept: .pdf,.jpg,.png,.jpeg */
  pilihAtauSeretFileKesini?: string | string[];
}

/**
 * Section "Legal memorandum" - bucket legal_risk_compliance
 */
export class LegalMemorandumSection extends BucketSection {
  readonly bucket: BucketId = 'legal_risk_compliance';
  readonly title = 'Legal memorandum';

  /** Pilih atau seret file kesini [file] accept: .pdf,.jpg,.png,.jpeg */
  get pilihAtauSeretFileKesini() { return new FileUpload(this.root, ''); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: LegalMemorandumData) {
    if (data.pilihAtauSeretFileKesini !== undefined) await this.pilihAtauSeretFileKesini.upload(data.pilihAtauSeretFileKesini);
  }
}
