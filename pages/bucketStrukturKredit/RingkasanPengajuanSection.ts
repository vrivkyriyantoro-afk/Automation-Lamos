// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/struktur_kredit.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { TextInput } from '../components/FormControls';

export interface RingkasanPengajuanData {
  /** Total pengajuan fasilitas* [text] (disabled saat explore / auto-fill) satuan: Rp */
  totalPengajuanFasilitas?: string;
  /** Total fasilitas saat ini* [text] (disabled saat explore / auto-fill) satuan: Rp */
  totalFasilitasSaatIni?: string;
  /** Total fasilitas obligor* [text] (disabled saat explore / auto-fill) satuan: Rp */
  totalFasilitasObligor?: string;
  /** Total exposure* [text] (disabled saat explore / auto-fill) satuan: Rp */
  totalExposure?: string;
}

/**
 * Section "Ringkasan pengajuan" - bucket struktur_kredit
 */
export class RingkasanPengajuanSection extends BucketSection {
  readonly bucket: BucketId = 'struktur_kredit';
  readonly title = 'Ringkasan pengajuan';
  readonly sidebarTitle = 'Ringkasan Pengajuan';

  /** Total pengajuan fasilitas* [text] (disabled saat explore / auto-fill) satuan: Rp */
  get totalPengajuanFasilitas() { return new TextInput(this.root, 'totalPengajuanFasilitas'); }
  /** Total fasilitas saat ini* [text] (disabled saat explore / auto-fill) satuan: Rp */
  get totalFasilitasSaatIni() { return new TextInput(this.root, 'totalFasilitasSaatIni'); }
  /** Total fasilitas obligor* [text] (disabled saat explore / auto-fill) satuan: Rp */
  get totalFasilitasObligor() { return new TextInput(this.root, 'totalFasilitasObligor'); }
  /** Total exposure* [text] (disabled saat explore / auto-fill) satuan: Rp */
  get totalExposure() { return new TextInput(this.root, 'totalExposure'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: RingkasanPengajuanData) {
    if (data.totalPengajuanFasilitas !== undefined) await this.totalPengajuanFasilitas.fill(data.totalPengajuanFasilitas);
    if (data.totalFasilitasSaatIni !== undefined) await this.totalFasilitasSaatIni.fill(data.totalFasilitasSaatIni);
    if (data.totalFasilitasObligor !== undefined) await this.totalFasilitasObligor.fill(data.totalFasilitasObligor);
    if (data.totalExposure !== undefined) await this.totalExposure.fill(data.totalExposure);
  }
}
