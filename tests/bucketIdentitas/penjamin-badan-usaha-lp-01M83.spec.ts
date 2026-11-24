import { test, expect } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import { LoginPage } from '../../pages/base/LoginPage';
import { CreditApplicationForm } from '../../pages/base/BucketSection';
import {
  DataPenjaminForm, CorporateGuaranteeData, PengurusWniData, PengurusBadanUsahaData,
  JenisKelamin, OrganBadanUsaha, JenisBadanUsaha,
} from '../../pages/buckets/identitas/PenjaminForms';
import data from '../../fixtures/entities/penjamin-badan-usaha.json';

/**
 * Penjamin ke-3 (tipe Badan Usaha / Corporate Guarantee) pada app 01M83, menyusul 2 penjamin perorangan
 * (TEGAR+NENDEN, ERIN+RENALDY) dari penjamin-menikah-lp-01M83.spec.ts.
 * Data: fixtures/entities/penjamin-badan-usaha.json (PT Bintang Sejahtera + pemegang saham WNI, WNA, Badan Usaha).
 *
 * Catatan teknis helper DataPenjaminForm: index dipakai untuk SEMUA locator. Kartu ke-3 adalah satu-satunya kartu
 * Corporate, jadi field corporate & tombol pengurus memakai index 0 (instance `corp`), sedangkan dropdown tipe
 * penjamin memakai index kartu sebenarnya (instance `kartu`).
 *
 * PERHATIAN: menulis ke SIT. Autosave penjamin baru terkirim saat MENINGGALKAN section -> spec pindah ke
 * 'Referensi' lalu verifikasi lewat muat ulang halaman. Tidak menekan Lanjutkan/Kirim.
 * Env: APPLICATION_ID_PENJAMIN_LP (default 01M83AP5FKPHB1D3E2QS8P015Z), PENJAMIN_FILE (file upload), PENJAMIN_COMMIT=1.
 */
const APPLICATION_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';
const COMMIT = process.env.PENJAMIN_COMMIT === '1';
const FILE = COMMIT ? (process.env.PENJAMIN_FILE || path.resolve(__dirname, '../../fixtures/files/dummy-identitas.pdf')) : undefined;
const KARTU_BARU = 2; // 0-based: kartu ke-3

// Permintaan user 2026-11-23: pengurus/pemegang saham = 1 perorangan (WNI) + 1 badan usaha (WNA tidak dipakai)
const [wni, , bu] = data.pemegangSaham;
const alamat = data.alamatPemegangSaham;

test.describe('Data Penjamin - kartu ke-3 Badan Usaha (app 01M83)', () => {
  test.describe.configure({ timeout: 10 * 60 * 1000 });

  test('TC01 - Tambah penjamin Corporate Guarantee + 3 pemegang saham', async ({ page }) => {
    page.on('response', r => {
      const m = r.request().method();
      if ((m !== 'GET' && m !== 'OPTIONS') || r.status() >= 400) {
        console.log(`[NET] ${m} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 120)}`);
      }
    });
    // Viewport 720 px terlalu pendek: dropdown di modal pemegang saham membuka popup ke sisi atas & ditutup oleh guliran
    // otomatis Playwright (probe 2026-11-23: dengan tinggi 1800 px dropdown terbuka & bisa dipilih).
    await page.setViewportSize({ width: 1280, height: 1800 });
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');

    const corp = new DataPenjaminForm(page, 0);       // field corporate & pengurus (satu-satunya kartu corporate)
    const kartu = new DataPenjaminForm(page, KARTU_BARU); // dropdown tipe penjamin kartu ke-3
    await corp.open();
    const tipeCombos = page.locator('[role="combobox"][id^="typeGuarantee"]');

    await test.step('Prasyarat: 2 kartu perorangan sudah ada; tambah kartu ke-3', async () => {
      // Data dari server dimuat async (awalnya radio kosong & 0 kartu) -> tunggu, jangan hitung langsung
      await expect.poll(() => tipeCombos.count(), {
        timeout: 30000,
        message: 'kartu penjamin sebelumnya (2 perorangan) tidak muncul setelah 30 detik -> data penjamin mungkin hilang',
      }).toBeGreaterThanOrEqual(2);
      await page.waitForTimeout(1500);
      const n = await tipeCombos.count();
      if (n < KARTU_BARU + 1) {
        await corp.btnTambahPenjamin.scrollIntoViewIfNeeded();
        await corp.btnTambahPenjamin.click();
        await expect(tipeCombos).toHaveCount(KARTU_BARU + 1, { timeout: 20000 });
      }
    });

    await test.step('Tipe penjamin kartu ke-3 = Corporate Guarantee', async () => {
      // Teks dropdown bisa tidak sinkron dengan form yang tampil (terbukti lagi 2026-11-23: dropdown "Personal Guarantee",
      // form perorangan tetap tampil). Sama seperti DataPenjaminForm.pilihTipe: pilih ulang bila field penanda tidak muncul.
      const marker = corp.field('corporateGuarantee.name');
      // Run ulang: kartu ke-3 sudah tersimpan sebagai Corporate -> tidak perlu memilih tipe lagi. Ini juga menghindari
      // GET /lossvc/v1/config/dropdowns?type=GUARANTOR_TYPE yang pernah error 500 di SIT (opsi tipe penjamin jadi kosong).
      // isVisible() mengabaikan timeout -> pakai waitFor
      const tampil = (ms: number) => marker.waitFor({ state: 'visible', timeout: ms }).then(() => true).catch(() => false);
      if (await tampil(8000)) {
        console.log('Kartu ke-3 sudah bertipe Corporate Guarantee, pemilihan tipe dilewati');
      } else {
        await kartu.tipePenjamin.select('Corporate Guarantee');
        if (!(await tampil(4000))) {
          await kartu.tipePenjamin.select('Personal Guarantee');
          await page.waitForTimeout(1000);
          await kartu.tipePenjamin.select('Corporate Guarantee');
        }
      }
      await marker.waitFor({ timeout: 20000 });
    });

    const c = data.perusahaan;
    const corporate: CorporateGuaranteeData = {
      namaPerusahaan: c.namaPerusahaan, npwp: c.npwp,
      nomorAktaPendirian: c.nomorAktaPendirian, tanggalAktaPendirian: c.tanggalAktaPendirian,
      nomorAktaPerubahan: c.nomorAktaPerubahan, tanggalAktaPerubahan: c.tanggalAktaPerubahan,
      nib: c.nib, alamat: c.alamat, fileNpwp: FILE,
    };
    await test.step(`Isi data perusahaan ${c.namaPerusahaan}`, async () => {
      // Run ulang: bila kartu sudah berisi perusahaan ini (sudah tersimpan), jangan isi/upload ulang (hindari file ganda)
      const sudah = (await corp.field('corporateGuarantee.name').inputValue().catch(() => '')) === c.namaPerusahaan;
      if (!sudah) await corp.fillCorporate(corporate);
      else console.log('Perusahaan sudah terisi di kartu ke-3, pengisian dilewati');
      await expect(corp.field('corporateGuarantee.name')).toHaveValue(c.namaPerusahaan);
      await expect(corp.field('corporateGuarantee.npwp')).toHaveValue(c.npwp);
    });

    const simpan = async (modal: Awaited<ReturnType<DataPenjaminForm['openTambahPengurus']>>, nama: string) => {
      if (!COMMIT) { await modal.batalkan(); return; }
      await modal.simpan();
      await expect(corp.root.getByText(nama, { exact: false }).first()).toBeVisible({ timeout: 15000 });
    };

    await test.step(`Pemegang saham Perseorangan WNI: ${wni.nama}`, async () => {
      const modal = await corp.openTambahPengurus();
      const d: PengurusWniData = {
        organ: wni.organ as OrganBadanUsaha, nomorKtp: wni.nomorKtp!, nama: wni.nama,
        jenisKelamin: wni.jenisKelamin as JenisKelamin, tanggalLahir: wni.tanggalLahir!,
        namaIbuKandung: wni.namaIbuKandung, npwp: wni.npwp!, jabatan: wni.jabatan!,
        alamat, pangsaKepemilikan: wni.pangsaKepemilikan, file: FILE,
      };
      await modal.fillPerseoranganWni(d);
      await simpan(modal, d.nama);
    });

    await test.step(`Pemegang saham Badan Usaha: ${bu.nama}`, async () => {
      const modal = await corp.openTambahPengurus();
      const d: PengurusBadanUsahaData = {
        organ: bu.organ as OrganBadanUsaha, npwp: bu.npwp!, nama: bu.nama,
        jenisBadanUsaha: bu.jenisBadanUsaha as JenisBadanUsaha,
        nomorAktaPendirian: bu.nomorAktaPendirian!, tanggalAktaPendirian: bu.tanggalAktaPendirian!,
        adaAktaPerubahan: !!bu.adaAktaPerubahan, alamat, pangsaKepemilikan: bu.pangsaKepemilikan, file: FILE,
      };
      await modal.fillBadanUsaha(d);
      await simpan(modal, d.nama);
    });
    await page.screenshot({ path: test.info().outputPath('penjamin-3-sebelum-simpan.png'), fullPage: true });

    // Picu simpan dengan meninggalkan section, lalu verifikasi setelah muat ulang
    const saved = page.waitForResponse(
      r => /forms\/data_penjamin/.test(r.url()) && r.request().method() !== 'GET', { timeout: 20000 },
    ).catch(() => null);
    await page.locator('aside button', { hasText: 'Referensi' }).click();
    const resp = await saved;
    console.log('Simpan penjamin saat pindah section:', resp ? `${resp.request().method()} ${resp.status()}` : 'TIDAK ADA request');
    await page.waitForTimeout(5000);

    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');
    await new DataPenjaminForm(page, 0).open();
    await expect(tipeCombos).toHaveCount(KARTU_BARU + 1, { timeout: 20000 });
    await expect(corp.field('corporateGuarantee.name'), 'perusahaan setelah muat ulang').toHaveValue(c.namaPerusahaan, { timeout: 20000 });
    if (COMMIT) {
      for (const nama of [wni.nama, bu.nama]) {
        await expect(corp.root.getByText(nama, { exact: false }).first(), `pemegang saham ${nama} setelah muat ulang`).toBeVisible({ timeout: 15000 });
      }
    }
    console.log('Status sidebar Data penjamin:', ((await page.locator('aside button', { hasText: 'Data penjamin' }).innerText()) || '').replace(/\n/g, ' | '));
    await page.screenshot({ path: test.info().outputPath('penjamin-3-akhir.png'), fullPage: true });
  });
});
