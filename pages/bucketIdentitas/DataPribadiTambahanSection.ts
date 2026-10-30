// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, RadioGroup, TextInput } from '../components/FormControls';

export interface DataPribadiTambahanData {
  /** Jumlah keluarga inti sesuai KK* [text] */
  totalRegisteredFamily?: string;
  /** Pisah harta [radio] */
  pisahHarta?: 'Ya' | 'Tidak';
  /** Kasus pidana / penipuan* [radio] */
  kasusPidanaPenipuan?: 'Ya' | 'Tidak';
  /** Pendidikan terakhir* [dropdown] */
  lastEducation?: 'Tanpa Gelar' | 'Diploma 1' | 'Diploma 2' | 'Diploma 3' | 'S-1' | 'S-2' | 'S-3' | 'Lainnya';
}

/**
 * Section "Data pribadi tambahan" - bucket identitas_pengecekan
 */
export class DataPribadiTambahanSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Data pribadi tambahan';
  readonly sidebarTitle = 'Data pribadi tambahan';

  /** Jumlah keluarga inti sesuai KK* [text] */
  get totalRegisteredFamily() { return new TextInput(this.root, 'totalRegisteredFamily'); }
  /** Pisah harta [radio] */
  get pisahHarta() { return new RadioGroup(this.root, 'Pisah harta'); }
  /** Kasus pidana / penipuan* [radio] */
  get kasusPidanaPenipuan() { return new RadioGroup(this.root, 'Kasus pidana / penipuan'); }
  /** Pendidikan terakhir* [dropdown] */
  get lastEducation() { return new Dropdown(this.root, 'lastEducation'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: DataPribadiTambahanData) {
    if (data.totalRegisteredFamily !== undefined) await this.totalRegisteredFamily.fill(data.totalRegisteredFamily);
    if (data.pisahHarta !== undefined) await this.pisahHarta.select(data.pisahHarta);
    if (data.kasusPidanaPenipuan !== undefined) await this.kasusPidanaPenipuan.select(data.kasusPidanaPenipuan);
    if (data.lastEducation !== undefined) await this.lastEducation.select(data.lastEducation);
  }
}
