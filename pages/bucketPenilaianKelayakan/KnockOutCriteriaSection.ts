// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/penilaian_kelayakan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { CriteriaTable } from '../components/FormControls';

/**
 * Section "Knock-out criteria" - bucket penilaian_kelayakan
 */
export class KnockOutCriteriaSection extends BucketSection {
  readonly bucket: BucketId = 'penilaian_kelayakan';
  readonly title = 'Knock-out criteria';
  readonly sidebarTitle = 'Knock-out criteria';

  /** Tabel kriteria Pass/fail (react-select per baris) */
  get criteria() { return new CriteriaTable(this.root); }

  constructor(page: Page) {
    super(page);
  }
}
