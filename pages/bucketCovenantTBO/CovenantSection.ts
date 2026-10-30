// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/covenant_tbo.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { RichTextEditor } from '../components/FormControls';

export interface CovenantData {
  /** Covenant* [richtext] - Lihat template covenant di sini */
  covenant?: string;
}

/**
 * Section "Covenant" - bucket covenant_tbo
 */
export class CovenantSection extends BucketSection {
  readonly bucket: BucketId = 'covenant_tbo';
  readonly title = 'Covenant';
  readonly sidebarTitle = 'Covenant';

  /** Covenant* [richtext] - Lihat template covenant di sini */
  get covenant() { return new RichTextEditor(this.root, 'rich-text-editor'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: CovenantData) {
    if (data.covenant !== undefined) await this.covenant.fill(data.covenant);
  }
}
