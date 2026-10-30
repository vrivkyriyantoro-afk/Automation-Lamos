// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { RadioGroup } from '../components/FormControls';

export interface DataPenjaminData {
  /** Debitur memiliki penjamin?* [radio] */
  debiturMemilikiPenjamin?: 'Ya' | 'Tidak';
}

/**
 * Section "Data Penjamin" - bucket identitas_pengecekan
 */
export class DataPenjaminSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data Penjamin';
  readonly sidebarTitle = 'Data penjamin';

  /** Debitur memiliki penjamin?* [radio] */
  get debiturMemilikiPenjamin() { return new RadioGroup(this.root, 'Debitur memiliki penjamin?'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: DataPenjaminData) {
    if (data.debiturMemilikiPenjamin !== undefined) await this.debiturMemilikiPenjamin.select(data.debiturMemilikiPenjamin);
  }
}
