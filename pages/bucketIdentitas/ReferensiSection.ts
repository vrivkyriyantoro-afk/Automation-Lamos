// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown, TextInput } from '../components/FormControls';

export interface ReferensiData {
  /** Tipe Referensi [dropdown] */
  type?: 'Campaign' | 'Funding' | 'Cs' | 'Teller';
  /** Nomor Telpon Referensi [text] */
  telephoneNumber?: string;
  /** Notes referensi [text] */
  notes?: string;
}

/**
 * Section "Referensi" - bucket identitas_pengecekan
 */
export class ReferensiSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Referensi';
  readonly sidebarTitle = 'Referensi';

  /** Tipe Referensi [dropdown] */
  get type() { return new Dropdown(this.root, 'type'); }
  /** Nomor Telpon Referensi [text] */
  get telephoneNumber() { return new TextInput(this.root, 'telephoneNumber'); }
  /** Notes referensi [text] */
  get notes() { return new TextInput(this.root, 'notes'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: ReferensiData) {
    if (data.type !== undefined) await this.type.select(data.type);
    if (data.telephoneNumber !== undefined) await this.telephoneNumber.fill(data.telephoneNumber);
    if (data.notes !== undefined) await this.notes.fill(data.notes);
  }
}
