import { test, expect } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import {
  DataPenjaminForm, CorporateGuaranteeData, PengurusWniData, PengurusWnaData, PengurusBadanUsahaData,
  JenisKelamin, OrganBadanUsaha, JenisBadanUsaha,
} from '../../pages/bucketIdentitas/PenjaminForms';
import data from '../../fixtures/penjamin-badan-usaha.json';

/**
 * TC Penjamin Badan Usaha (Corporate Guarantee) dengan 3 pemegang saham:
 * Perseorangan WNI, Perseorangan WNA, dan Badan Usaha.
 * Data: fixtures/penjamin-badan-usaha.json
 *
 * PERHATIAN: section Data Penjamin menyimpan otomatis, jadi isian perusahaan langsung tersimpan.
 * Tanpa PENJAMIN_COMMIT=1, modal pemegang saham hanya diisi lalu DIBATALKAN (tidak menambah data).
 * Dengan PENJAMIN_COMMIT=1, file identitas di-upload dan modal di-Simpan.
 *
 * Env:
 *   APPLICATION_ID_PENJAMIN_BADAN_USAHA (fallback APPLICATION_ID)  id pengajuan kredit target
 *   PENJAMIN_INDEX   urutan kartu penjamin (0-based, default 0)
 *   PENJAMIN_COMMIT  1 = upload file + simpan pemegang saham
 */
const APPLICATION_ID = process.env.APPLICATION_ID_PENJAMIN_BADAN_USAHA || process.env.APPLICATION_ID || '01M483P7DDHBV41Z5QPV0FM8Q9';
const INDEX = Number(process.env.PENJAMIN_INDEX || 0);
const COMMIT = process.env.PENJAMIN_COMMIT === '1';
const DUMMY_FILE = path.resolve(__dirname, '../../fixtures/files/dummy-identitas.pdf');
const file = COMMIT ? DUMMY_FILE : undefined;

const [wni, wna, bu] = data.pemegangSaham;
const alamat = data.alamatPemegangSaham;

test.describe('Data Penjamin - Badan Usaha dengan pemegang saham WNI, WNA, Badan Usaha', () => {
  test.describe.configure({ timeout: 8 * 60 * 1000 });

  test('TC01 - Isi Corporate Guarantee dan tambah 3 pemegang saham', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');
    const penjamin = new DataPenjaminForm(page, INDEX);
    await penjamin.open();

    await test.step('Debitur memiliki penjamin = Ya, tipe Corporate Guarantee', async () => {
      await penjamin.setMemilikiPenjamin(true);
      await penjamin.pilihTipe('Corporate Guarantee');
    });

    const c = data.perusahaan;
    const corporate: CorporateGuaranteeData = {
      namaPerusahaan: c.namaPerusahaan,
      npwp: c.npwp,
      nomorAktaPendirian: c.nomorAktaPendirian,
      tanggalAktaPendirian: c.tanggalAktaPendirian,
      nomorAktaPerubahan: c.nomorAktaPerubahan,
      tanggalAktaPerubahan: c.tanggalAktaPerubahan,
      nib: c.nib,
      alamat: c.alamat,
      fileNpwp: file,
    };
    await test.step(`Isi data perusahaan ${c.namaPerusahaan}`, async () => {
      await penjamin.fillCorporate(corporate);
      await expect(penjamin.field('corporateGuarantee.name')).toHaveValue(c.namaPerusahaan);
      await expect(penjamin.field('corporateGuarantee.npwp')).toHaveValue(c.npwp);
    });

    // Modal: isi, verifikasi, lalu Simpan (COMMIT) atau Batalkan (dry run)
    const finish = async (modal: Awaited<ReturnType<DataPenjaminForm['openTambahPengurus']>>, nama: string) => {
      if (COMMIT) {
        await modal.simpan();
        await expect(penjamin.root.getByText(nama, { exact: false }).first()).toBeVisible({ timeout: 15000 });
      } else {
        // Info: tanpa upload file, Simpan bisa tetap disabled bila dokumen wajib
        console.log(`[dry-run] ${nama}: tombol Simpan modal ${await modal.btnSimpan.isEnabled() ? 'AKTIF' : 'disabled'}`);
        await modal.batalkan();
      }
    };

    await test.step(`Pemegang saham Perseorangan WNI: ${wni.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      const d: PengurusWniData = {
        organ: wni.organ as OrganBadanUsaha,
        nomorKtp: wni.nomorKtp!,
        nama: wni.nama,
        jenisKelamin: wni.jenisKelamin as JenisKelamin,
        tanggalLahir: wni.tanggalLahir!,
        namaIbuKandung: wni.namaIbuKandung,
        npwp: wni.npwp!,
        jabatan: wni.jabatan!,
        alamat,
        pangsaKepemilikan: wni.pangsaKepemilikan,
        file,
      };
      await modal.fillPerseoranganWni(d);
      await expect(modal.field('perseorangan.wni.identityNumber')).toHaveValue(d.nomorKtp);
      await expect(modal.field('perseorangan.name')).toHaveValue(d.nama);
      await finish(modal, d.nama);
    });

    await test.step(`Pemegang saham Perseorangan WNA: ${wna.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      const d: PengurusWnaData = {
        organ: wna.organ as OrganBadanUsaha,
        nomorPaspor: wna.nomorPaspor!,
        masaBerlakuPaspor: wna.masaBerlakuPaspor!,
        nama: wna.nama,
        jenisKelamin: wna.jenisKelamin as JenisKelamin,
        jabatan: wna.jabatan!,
        alamat,
        pangsaKepemilikan: wna.pangsaKepemilikan,
        file,
      };
      await modal.fillPerseoranganWna(d);
      await expect(modal.field('perseorangan.wna.pasporNumber')).toHaveValue(d.nomorPaspor);
      await expect(modal.field('perseorangan.name')).toHaveValue(d.nama);
      await finish(modal, d.nama);
    });

    await test.step(`Pemegang saham Badan Usaha: ${bu.nama}`, async () => {
      const modal = await penjamin.openTambahPengurus();
      const d: PengurusBadanUsahaData = {
        organ: bu.organ as OrganBadanUsaha,
        npwp: bu.npwp!,
        nama: bu.nama,
        jenisBadanUsaha: bu.jenisBadanUsaha as JenisBadanUsaha,
        nomorAktaPendirian: bu.nomorAktaPendirian!,
        tanggalAktaPendirian: bu.tanggalAktaPendirian!,
        adaAktaPerubahan: !!bu.adaAktaPerubahan,
        alamat,
        pangsaKepemilikan: bu.pangsaKepemilikan,
        file,
      };
      await modal.fillBadanUsaha(d);
      await expect(modal.field('badanUsaha.npwp')).toHaveValue(d.npwp);
      await expect(modal.field('badanUsaha.name')).toHaveValue(d.nama);
      await finish(modal, d.nama);
    });

    await page.screenshot({ path: test.info().outputPath('penjamin-badan-usaha.png'), fullPage: true });
  });
});
