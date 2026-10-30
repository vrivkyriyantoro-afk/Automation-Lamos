// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/struktur_kredit.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';

/**
 * Section "Fasilitas kredit & obligor" - bucket struktur_kredit
 * Belum ada field input saat explore (konten bergantung data / list kosong).
 */
export class FasilitasKreditObligorSection extends BucketSection {
  readonly bucket: BucketId = 'struktur_kredit';
  readonly title = 'Fasilitas kredit & obligor';

  constructor(page: Page) {
    super(page);
  }
}
