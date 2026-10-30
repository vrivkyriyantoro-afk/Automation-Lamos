// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/penilaian_kelayakan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';

/**
 * Section "QCA" - bucket penilaian_kelayakan
 * Belum ada field input saat explore (konten bergantung data / list kosong).
 */
export class QcaSection extends BucketSection {
  readonly bucket: BucketId = 'penilaian_kelayakan';
  readonly title = 'QCA';
  readonly sidebarTitle = 'QCA';

  constructor(page: Page) {
    super(page);
  }
}
