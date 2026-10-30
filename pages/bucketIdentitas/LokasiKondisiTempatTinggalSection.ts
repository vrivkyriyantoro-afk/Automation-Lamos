// AUTO-GENERATED oleh scripts/generate-pages.js dari explore-output/identitas_pengecekan.json.
// Boleh diedit manual; regenerate dengan --force akan menimpa file ini.
import { Page } from '@playwright/test';
import { BucketSection, BucketId } from '../components/BucketSection';
import { Dropdown } from '../components/FormControls';

export interface LokasiKondisiTempatTinggalData {
  /** Lokasi tempat tinggal* [dropdown] */
  residenceLocation?: 'Lokasi tempat tinggal tidak pernah terkena banjir' | 'Lokasi tempat tinggal jarang terkena banjir (maksimum sekali pada 5 tahun terakhir)' | 'Lokasi tempat tinggalkadang terkena banjir (sekali pada 2-3 tahun)' | 'Lokasi tempat tinggal pada daerah rawan banjir (berdampak ke lokasi usaha setiap tahun)';
  /** Kondisi tempat tinggal* [dropdown] */
  residenceCondition?: 'Rumah terawat dengan baik. Rumah memiliki peralatan elektronik dasar untuk penggunaan sehari-hari seperti kulkas, TV, mesin cuci' | 'Rumah tidak memiliki perlengkapan rumah tangga dasar namun rumah terlihat bersih dan terawat dengan baik' | 'Rumah tidak memiliki perlengkapan dasar dan butuh untuk renovasi secepatnya' | 'Rumah sudah sangat buruk kondisinya (tidak ada furniture, jendela rusak, dll)';
  /** Kondisi lingkungan sekitar tempat tinggal* [dropdown] */
  residenceEnvironmentCondition?: 'Tempat tinggal berada pada bunglow independen yang mewah' | 'Tempat tinggal berada di apartemen atau kondominium' | 'Tempat tinggal berada pada jalur besar dan berada pada jalan yang terdaftar' | 'Tempat tinggal berada pada jalur besar namun tidak terdaftar' | 'Tidak ada lingkungan kumuh di lingkungan sekitar namun tempat tinggal berada pada jalur yang sempit (gang)' | 'Lingkungan kumuh terletak 1 km dan/atau tempat tinggal berada pada jalur yang sempit (gang)';
}

/**
 * Section "Lokasi & kondisi tempat tinggal" - bucket identitas_pengecekan
 */
export class LokasiKondisiTempatTinggalSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'Lokasi & kondisi tempat tinggal';
  readonly sidebarTitle = 'Lokasi & kondisi tempat tinggal';

  /** Lokasi tempat tinggal* [dropdown] */
  get residenceLocation() { return new Dropdown(this.root, 'residenceLocation'); }
  /** Kondisi tempat tinggal* [dropdown] */
  get residenceCondition() { return new Dropdown(this.root, 'residenceCondition'); }
  /** Kondisi lingkungan sekitar tempat tinggal* [dropdown] */
  get residenceEnvironmentCondition() { return new Dropdown(this.root, 'residenceEnvironmentCondition'); }

  constructor(page: Page) {
    super(page);
  }

  /** Isi field sesuai urutan di UI; field yang tidak diberikan dilewati */
  async fill(data: LokasiKondisiTempatTinggalData) {
    if (data.residenceLocation !== undefined) await this.residenceLocation.select(data.residenceLocation);
    if (data.residenceCondition !== undefined) await this.residenceCondition.select(data.residenceCondition);
    if (data.residenceEnvironmentCondition !== undefined) await this.residenceEnvironmentCondition.select(data.residenceEnvironmentCondition);
  }
}
