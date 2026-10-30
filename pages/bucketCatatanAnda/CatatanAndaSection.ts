// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/catatan_anda.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { FileUpload, RichTextEditor } from '../components/FormControls';

export interface CatatanAndaData {
  /** Catatan pengajuan* [richtext] */
  catatanPengajuan?: string;
  /** Lampiran (opsional) [file] accept: .pdf,.jpg,.jpeg,.png */
  attachmentFiles?: string | string[];
}

/**
 * Section "Catatan Anda" - bucket catatan_anda
 */
export class CatatanAndaSection extends BucketSection {
  readonly bucket: BucketId = 'catatan_anda';
  readonly title = 'Catatan Anda';
  readonly sidebarTitle = 'Catatan Anda';

  /** Catatan pengajuan* [richtext] */
  get catatanPengajuan() { return new RichTextEditor(this.root, 'rich-text-editor'); }
  /** Lampiran (opsional) [file] accept: .pdf,.jpg,.jpeg,.png */
  get attachmentFiles() { return new FileUpload(this.root, 'attachmentFiles'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: CatatanAndaData) {
    if (data.catatanPengajuan !== undefined) await this.catatanPengajuan.fill(data.catatanPengajuan);
    if (data.attachmentFiles !== undefined) await this.attachmentFiles.upload(data.attachmentFiles);
  }
}
