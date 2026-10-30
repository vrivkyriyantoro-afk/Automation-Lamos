import { test, expect } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import { DataPenjaminForm, PersonalGuaranteeData, SpouseData, toDisplayDate, normalizeWilayah } from '../../pages/bucketIdentitas/PenjaminForms';
import data from '../../fixtures/penjamin-perorangan-menikah.json';

/**
 * TC Penjamin Perorangan (Personal Guarantee) WNI, status Menikah + data pasangan.
 * Data: fixtures/penjamin-perorangan-menikah.json
 *
 * PERHATIAN: section Data Penjamin menyimpan otomatis, jadi isian field langsung tersimpan di aplikasi target.
 * Upload KTP hanya dilakukan bila PENJAMIN_COMMIT=1.
 *
 * Env:
 *   APPLICATION_ID_PENJAMIN_PERORANGAN (fallback APPLICATION_ID)  id pengajuan kredit target
 *   PENJAMIN_INDEX   urutan kartu penjamin (0-based, default 0)
 *   PENJAMIN_COMMIT  1 = upload file KTP penjamin & pasangan
 */
const APPLICATION_ID = process.env.APPLICATION_ID_PENJAMIN_PERORANGAN || process.env.APPLICATION_ID || '01M483P7DDHBV41Z5QPV0FM8Q9';
const INDEX = Number(process.env.PENJAMIN_INDEX || 0);
const COMMIT = process.env.PENJAMIN_COMMIT === '1';
const DUMMY_FILE = path.resolve(__dirname, '../../fixtures/files/dummy-identitas.pdf');

test.describe('Data Penjamin - Perorangan Menikah', () => {
  test.describe.configure({ timeout: 5 * 60 * 1000 });

  test('TC01 - Isi penjamin Personal Guarantee WNI Menikah beserta data pasangan', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');
    const penjamin = new DataPenjaminForm(page, INDEX);
    await penjamin.open();

    await test.step('Debitur memiliki penjamin = Ya, tipe Personal Guarantee', async () => {
      await penjamin.setMemilikiPenjamin(true);
      await penjamin.pilihTipe('Personal Guarantee');
    });

    const p = data.penjamin;
    const penjaminData: PersonalGuaranteeData = {
      kewarganegaraan: 'WNI',
      nomorKtp: p.nomorKtp,
      namaLengkap: p.namaLengkap,
      jenisKelamin: p.jenisKelamin as PersonalGuaranteeData['jenisKelamin'],
      tempatLahir: p.tempatLahir,
      tanggalLahir: p.tanggalLahir,
      statusPerkawinan: p.statusPerkawinan as PersonalGuaranteeData['statusPerkawinan'],
      namaIbuKandung: p.namaIbuKandung,
      npwp: p.npwp,
      nomorHp: p.nomorHp,
      alamatKtp: p.alamatKtp,
      domisiliSamaDenganKtp: p.domisiliSamaDenganKtp,
      fileKtp: COMMIT ? DUMMY_FILE : undefined,
    };
    await test.step(`Isi data penjamin ${p.namaLengkap}`, async () => {
      await penjamin.fillPersonal(penjaminData);
    });

    const s = data.pasangan;
    const spouseData: SpouseData = {
      kewarganegaraan: 'WNI',
      nomorKtp: s.nomorKtp,
      namaLengkap: s.namaLengkap,
      tempatLahir: s.tempatLahir,
      tanggalLahir: s.tanggalLahir,
      namaIbuKandung: s.namaIbuKandung,
      npwp: s.npwp,
      nomorHp: s.nomorHp,
      domisiliSamaDenganPenjamin: s.domisiliSamaDenganPenjamin,
      fileKtp: COMMIT ? DUMMY_FILE : undefined,
    };
    await test.step(`Isi data pasangan ${s.namaLengkap}`, async () => {
      await penjamin.fillSpouse(spouseData);
    });

    await test.step('Verifikasi isian', async () => {
      await expect(penjamin.field('personalGuarantee.wni.identityNumber')).toHaveValue(p.nomorKtp);
      await expect(penjamin.field('personalGuarantee.name')).toHaveValue(p.namaLengkap);
      await expect(penjamin.field('personalGuarantee.wni.motherMaidenName')).toHaveValue(p.namaIbuKandung);
      await expect(penjamin.field('personalGuarantee.spouse.wni.identityNumber')).toHaveValue(s.nomorKtp);
      await expect(penjamin.field('personalGuarantee.spouse.name')).toHaveValue(s.namaLengkap);
      await expect(penjamin.field('personalGuarantee.spouse.wni.motherMaidenName')).toHaveValue(s.namaIbuKandung);
      await expect(penjamin.field('personalGuarantee.dateOfBirth')).toHaveValue(toDisplayDate(p.tanggalLahir));
      await expect(penjamin.field('personalGuarantee.spouse.dateOfBirth')).toHaveValue(toDisplayDate(s.tanggalLahir));
      expect(await penjamin.dropdownValue('personalGuarantee.maritalStatus')).toBe('Menikah');
      expect(await penjamin.dropdownValue('personalGuarantee.gender')).toBe(p.jenisKelamin);
      expect(normalizeWilayah(await penjamin.dropdownValue('personalGuarantee.identityAddress.indonesia.subdistrict')))
        .toBe(normalizeWilayah(p.alamatKtp.kelurahan));
    });

    await page.screenshot({ path: test.info().outputPath('penjamin-perorangan-menikah.png'), fullPage: true });
  });
});
