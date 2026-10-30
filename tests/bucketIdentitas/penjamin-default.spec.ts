import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import {
  DataPenjaminForm, PersonalGuaranteeData, SpouseData, CorporateGuaranteeData,
  PengurusWniData, PengurusWnaData, PengurusBadanUsahaData, AlamatIndonesia,
} from '../../pages/bucketIdentitas/PenjaminForms';

/**
 * TC Penjamin Perorangan + Badan Usaha dalam satu file, data default inline (tanpa fixture JSON).
 * Data disalin dari fixtures/penjamin-perorangan-menikah.json & fixtures/penjamin-badan-usaha.json.
 *
 * PERHATIAN: section Data Penjamin menyimpan otomatis. Bila kedua TC memakai APPLICATION_ID + kartu yang sama,
 * TC02 (Badan Usaha) menimpa isian TC01 (Perorangan). Pakai id berbeda via env bila keduanya perlu bertahan.
 *
 * Env:
 *   APPLICATION_ID_PENJAMIN_PERORANGAN / APPLICATION_ID_PENJAMIN_BADAN_USAHA (fallback APPLICATION_ID)
 *   PENJAMIN_INDEX   urutan kartu penjamin (0-based, default 0)
 *   PENJAMIN_COMMIT  1 = upload file + simpan pemegang saham
 */
const DEFAULT_ID = process.env.APPLICATION_ID || '01M483P7DDHBV41Z5QPV0FM8Q9';
const ID_PERORANGAN = process.env.APPLICATION_ID_PENJAMIN_PERORANGAN || DEFAULT_ID;
const ID_BADAN_USAHA = process.env.APPLICATION_ID_PENJAMIN_BADAN_USAHA || DEFAULT_ID;
const INDEX = Number(process.env.PENJAMIN_INDEX || 0);
const COMMIT = process.env.PENJAMIN_COMMIT === '1';
const file = COMMIT ? path.resolve(__dirname, '../../fixtures/files/dummy-identitas.pdf') : undefined;

// ------------------------------------------------------------------ data default
const ALAMAT_KEBON_KACANG: AlamatIndonesia = {
  alamat: 'Jl. Kebon Kacang Raya No. 10', rt: '003', rw: '004',
  provinsi: 'DKI JAKARTA', kota: 'KOTA ADM. JAKARTA PUSAT', kecamatan: 'TANAH ABANG', kelurahan: 'KEBON KACANG', kodePos: '10240',
};

const PERORANGAN: PersonalGuaranteeData = {
  kewarganegaraan: 'WNI', nomorKtp: '3276020602850001', namaLengkap: 'MUCHAMMAD TAUFAN', jenisKelamin: 'Laki-Laki',
  tempatLahir: 'DEPOK', tanggalLahir: '1985-02-06', statusPerkawinan: 'Menikah', namaIbuKandung: 'SUDARMIYATI',
  npwp: '3276020602850001', nomorHp: '081327595761', alamatKtp: ALAMAT_KEBON_KACANG, domisiliSamaDenganKtp: true, fileKtp: file,
};

const PASANGAN: SpouseData = {
  kewarganegaraan: 'WNI', nomorKtp: '3209244711730001', namaLengkap: 'MUNAWAROH', tempatLahir: 'CIREBON',
  tanggalLahir: '1973-11-07', namaIbuKandung: 'SUTIAH', npwp: '3209244711730001', nomorHp: '081327595765',
  domisiliSamaDenganPenjamin: true, fileKtp: file,
};

const PERUSAHAAN: CorporateGuaranteeData = {
  namaPerusahaan: 'PT Bintang Sejahtera', npwp: '3578241603710991', nomorAktaPendirian: '01', tanggalAktaPendirian: '2015-03-10',
  nomorAktaPerubahan: '05', tanggalAktaPerubahan: '2023-10-15', nib: '1234567890123', fileNpwp: file,
  alamat: { ...ALAMAT_KEBON_KACANG, alamat: 'Jl. Cempaka Putih Tengah No. 45', rt: '005', rw: '008' },
};

const PS_WNI: PengurusWniData = {
  organ: 'Pemegang Saham', nomorKtp: '3302265910820003', nama: 'PIPIT NILA WARDANI', jenisKelamin: 'Perempuan',
  tanggalLahir: '1982-10-19', namaIbuKandung: 'WIWIK SRI SUHARTI', npwp: '3302265910820003', jabatan: 'Komisaris',
  alamat: ALAMAT_KEBON_KACANG, pangsaKepemilikan: 40, file,
};

const PS_WNA: PengurusWnaData = {
  organ: 'Pemegang Saham', nomorPaspor: '123331231233', masaBerlakuPaspor: '2030-01-23', nama: 'ANWAR USMAN',
  jenisKelamin: 'Laki-Laki', jabatan: 'Komisaris', alamat: ALAMAT_KEBON_KACANG, pangsaKepemilikan: 30, file,
};

const PS_BADAN_USAHA: PengurusBadanUsahaData = {
  organ: 'Pemegang Saham', npwp: '3578241603710992', nama: 'CV Makmur Abadi', jenisBadanUsaha: 'Persekutuan Comanditer',
  nomorAktaPendirian: '12', tanggalAktaPendirian: '2018-06-15', adaAktaPerubahan: false,
  alamat: ALAMAT_KEBON_KACANG, pangsaKepemilikan: 30, file,
};

// ------------------------------------------------------------------ tests
async function bukaPenjamin(page: Page, applicationId: string) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await new CreditApplicationForm(page).goto(applicationId, 'identitas_pengecekan');
  const penjamin = new DataPenjaminForm(page, INDEX);
  await penjamin.open();
  await penjamin.setMemilikiPenjamin(true);
  return penjamin;
}

test.describe('Data Penjamin - default (Perorangan & Badan Usaha)', () => {
  test.describe.configure({ mode: 'serial', timeout: 8 * 60 * 1000 });

  test('TC01 - Perorangan WNI Menikah + pasangan', async ({ page }) => {
    const penjamin = await bukaPenjamin(page, ID_PERORANGAN);
    await penjamin.pilihTipe('Personal Guarantee');

    await test.step(`Isi penjamin ${PERORANGAN.namaLengkap}`, () => penjamin.fillPersonal(PERORANGAN));
    await test.step(`Isi pasangan ${PASANGAN.namaLengkap}`, () => penjamin.fillSpouse(PASANGAN));

    await expect(penjamin.field('personalGuarantee.wni.identityNumber')).toHaveValue(PERORANGAN.nomorKtp);
    await expect(penjamin.field('personalGuarantee.name')).toHaveValue(PERORANGAN.namaLengkap);
    await expect(penjamin.field('personalGuarantee.spouse.wni.identityNumber')).toHaveValue(PASANGAN.nomorKtp);
    await expect(penjamin.field('personalGuarantee.spouse.name')).toHaveValue(PASANGAN.namaLengkap);
  });

  test('TC02 - Badan Usaha + 3 pemegang saham (WNI, WNA, Badan Usaha)', async ({ page }) => {
    const penjamin = await bukaPenjamin(page, ID_BADAN_USAHA);
    await penjamin.pilihTipe('Corporate Guarantee');

    await test.step(`Isi perusahaan ${PERUSAHAAN.namaPerusahaan}`, () => penjamin.fillCorporate(PERUSAHAAN));
    await expect(penjamin.field('corporateGuarantee.name')).toHaveValue(PERUSAHAAN.namaPerusahaan);
    await expect(penjamin.field('corporateGuarantee.npwp')).toHaveValue(PERUSAHAAN.npwp);

    // Simpan (COMMIT) atau Batalkan (dry run)
    const finish = async (modal: Awaited<ReturnType<DataPenjaminForm['openTambahPengurus']>>, nama: string) => {
      if (COMMIT) {
        await modal.simpan();
        await expect(penjamin.root.getByText(nama).first()).toBeVisible({ timeout: 15000 });
      } else {
        console.log(`[dry-run] ${nama}: tombol Simpan modal ${await modal.btnSimpan.isEnabled() ? 'AKTIF' : 'disabled'}`);
        await modal.batalkan();
      }
    };

    await test.step(`Pemegang saham WNI: ${PS_WNI.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      await modal.fillPerseoranganWni(PS_WNI);
      await expect(modal.field('perseorangan.wni.identityNumber')).toHaveValue(PS_WNI.nomorKtp);
      await finish(modal, PS_WNI.nama);
    });

    await test.step(`Pemegang saham WNA: ${PS_WNA.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      await modal.fillPerseoranganWna(PS_WNA);
      await expect(modal.field('perseorangan.wna.pasporNumber')).toHaveValue(PS_WNA.nomorPaspor);
      await finish(modal, PS_WNA.nama);
    });

    await test.step(`Pemegang saham Badan Usaha: ${PS_BADAN_USAHA.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      await modal.fillBadanUsaha(PS_BADAN_USAHA);
      await expect(modal.field('badanUsaha.npwp')).toHaveValue(PS_BADAN_USAHA.npwp);
      await finish(modal, PS_BADAN_USAHA.nama);
    });
  });
});

