// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/penyimpangan_pihak_terkait.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { RadioGroup, TextInput } from '../components/FormControls';

export interface PenyimpanganDanPihakTerkaitData {
  /** Apakah ada kondisi yang memerlukan penyimpangan?* [radio] */
  apakahAdaKondisiYangMemerlukanPenyimpangan?: 'Ya' | 'Tidak';
  /** Apakah debitur terafiliasi pihak terkait?* [radio] */
  apakahDebiturTerafiliasiPihakTerkait?: 'Ya' | 'Tidak';
  /** Apakah ada kondisi yang memerlukan penyimpangan?* [text] (disabled saat explore / auto-fill) */
  finalBwmkcopyWriting?: string;
}

/**
 * Section "Penyimpangan dan pihak terkait" - bucket penyimpangan_pihak_terkait
 */
export class PenyimpanganDanPihakTerkaitSection extends BucketSection {
  readonly bucket: BucketId = 'penyimpangan_pihak_terkait';
  readonly title = 'Penyimpangan dan pihak terkait';
  readonly sidebarTitle = 'Penyimpangan dan Pihak Terkait';

  /** Apakah ada kondisi yang memerlukan penyimpangan?* [radio] */
  get apakahAdaKondisiYangMemerlukanPenyimpangan() { return new RadioGroup(this.root, 'Apakah ada kondisi yang memerlukan penyimpangan?'); }
  /** Apakah debitur terafiliasi pihak terkait?* [radio] */
  get apakahDebiturTerafiliasiPihakTerkait() { return new RadioGroup(this.root, 'Apakah debitur terafiliasi pihak terkait?'); }
  /** Apakah ada kondisi yang memerlukan penyimpangan?* [text] (disabled saat explore / auto-fill) */
  get finalBwmkcopyWriting() { return new TextInput(this.root, 'finalBWMKCopyWriting'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: PenyimpanganDanPihakTerkaitData) {
    if (data.apakahAdaKondisiYangMemerlukanPenyimpangan !== undefined) await this.apakahAdaKondisiYangMemerlukanPenyimpangan.select(data.apakahAdaKondisiYangMemerlukanPenyimpangan);
    if (data.apakahDebiturTerafiliasiPihakTerkait !== undefined) await this.apakahDebiturTerafiliasiPihakTerkait.select(data.apakahDebiturTerafiliasiPihakTerkait);
    if (data.finalBwmkcopyWriting !== undefined) await this.finalBwmkcopyWriting.fill(data.finalBwmkcopyWriting);
  }
}
