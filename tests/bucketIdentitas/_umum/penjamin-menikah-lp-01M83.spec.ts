import { test, expect, Page } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import { LoginPage } from '../../../pages/base/LoginPage';
import { CreditApplicationForm } from '../../../pages/base/BucketSection';
import { DataPenjaminForm, PersonalGuaranteeData, SpouseData } from '../../../pages/buckets/identitas/PenjaminForms';

/**
 * Dua penjamin perorangan Menikah (laki-laki & perempuan) beserta pasangan.
 * Sumber data: exports/config/automation_config.2026-11-23T02-35-03-625Z.xlsx sheet Leads (pasangan dicocokkan via Pasangan_No_KTP).
 *   Penjamin 1: TEGAR JATI WICAKSONO (L)  + pasangan NENDEN NUGRAHA (P)
 *   Penjamin 2: ERIN (P)                  + pasangan RENALDY KUSUMA (L)
 * Default (tidak ada di Excel): NPWP = NIK, alamat KTP = fixtures/entities/penjamin-perorangan-menikah.json, domisili = sama.
 *
 * PERHATIAN: section Data Penjamin autosave -> menulis data ke SIT. Tidak menekan Lanjutkan/Kirim.
 * Env: APPLICATION_ID_PENJAMIN_LP (default 01M83AP5FKPHB1D3E2QS8P015Z), PENJAMIN_COMMIT=1 untuk upload KTP.
 */
const APPLICATION_ID = process.env.APPLICATION_ID_PENJAMIN_LP || '01M83AP5FKPHB1D3E2QS8P015Z';
const COMMIT = process.env.PENJAMIN_COMMIT === '1';
// Perbaikan data: PENJAMIN_ONLY_SPOUSE=<index 0-based> -> hanya isi ulang PASANGAN kartu itu (tanpa menyentuh penjamin / upload ulang KTP penjamin)
const ONLY_SPOUSE = process.env.PENJAMIN_ONLY_SPOUSE !== undefined ? Number(process.env.PENJAMIN_ONLY_SPOUSE) : undefined;
// File upload: PENJAMIN_FILE (mis. gambar dari folder yang ditunjuk user) menggantikan dummy PDF
const DUMMY_FILE = process.env.PENJAMIN_FILE || path.resolve(__dirname, '../../../fixtures/files/dummy-identitas.pdf');

const ALAMAT_KTP = {
  alamat: 'Jl. Kebon Kacang Raya No. 10', rt: '003', rw: '004',
  provinsi: 'DKI JAKARTA', kota: 'KOTA ADM. JAKARTA PUSAT', kecamatan: 'TANAH ABANG', kelurahan: 'KEBON KACANG', kodePos: '10240',
};

const SKENARIO: { penjamin: PersonalGuaranteeData; pasangan: SpouseData }[] = [
  {
    penjamin: {
      kewarganegaraan: 'WNI', nomorKtp: '3373041608960002', namaLengkap: 'TEGAR JATI WICAKSONO', jenisKelamin: 'Laki-Laki',
      tempatLahir: 'JAKARTA', tanggalLahir: '1996-08-16', statusPerkawinan: 'Menikah', namaIbuKandung: 'YUNIARTI KURNIANDARI',
      npwp: '3373041608960002', nomorHp: '081327595772', alamatKtp: ALAMAT_KTP,
    },
    pasangan: {
      kewarganegaraan: 'WNI', nomorKtp: '3211146311760006', namaLengkap: 'NENDEN NUGRAHA', tempatLahir: 'JAKARTA',
      tanggalLahir: '1975-11-23', namaIbuKandung: 'OMAH ROHMAH', npwp: '3211146311760006', nomorHp: '081327595785',
    },
  },
  {
    penjamin: {
      kewarganegaraan: 'WNI', nomorKtp: '3205335802980003', namaLengkap: 'ERIN', jenisKelamin: 'Perempuan',
      tempatLahir: 'JAKARTA', tanggalLahir: '1997-12-26', statusPerkawinan: 'Menikah', namaIbuKandung: 'IMAS',
      npwp: '3205335802980003', nomorHp: '081327595767', alamatKtp: ALAMAT_KTP,
    },
    pasangan: {
      kewarganegaraan: 'WNI', nomorKtp: '3277010909850013', namaLengkap: 'RENALDY KUSUMA', tempatLahir: 'JAKARTA',
      tanggalLahir: '1985-09-09', namaIbuKandung: 'SUSI SUSANTI', npwp: '3277010909850013', nomorHp: '081327595777',
    },
  },
];

/** Checkbox "sama dengan ..." ke-n (helper Checkbox bawaan selalu .first()) */
async function setCheckboxNth(page: Page, label: RegExp, index: number) {
  // checkbox native <input type=checkbox> tanpa aria-checked -> pakai state checked
  const c = page.locator('[data-testid="checkbox-container"]:visible')
    .filter({ has: page.locator('[data-testid="checkbox-label"]').filter({ hasText: label }) })
    .nth(index);
  await c.scrollIntoViewIfNeeded();
  const box = c.locator('input[data-testid="checkbox"]');
  if (!(await box.isChecked())) await box.check({ force: true });
  await expect(box).toBeChecked();
}

test.describe('Data Penjamin - 2 penjamin Menikah (L & P) app 01M83', () => {
  test.describe.configure({ timeout: 10 * 60 * 1000 });

  test('TC01 - Penjamin TEGAR (L)+NENDEN dan ERIN (P)+RENALDY', async ({ page }) => {
    // Rekam permintaan tulis (autosave) + respons gagal supaya terlihat bila backend menolak data
    page.on('response', r => {
      const m = r.request().method();
      if ((m !== 'GET' && m !== 'OPTIONS') || r.status() >= 400) {
        console.log(`[NET] ${m} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 120)}`);
      }
    });
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');
    const first = new DataPenjaminForm(page, 0);
    await first.open();
    await first.setMemilikiPenjamin(true);

    for (let i = 0; i < SKENARIO.length; i++) {
      if (ONLY_SPOUSE !== undefined && i !== ONLY_SPOUSE) continue;
      const { penjamin, pasangan } = SKENARIO[i];
      const form = new DataPenjaminForm(page, i);

      if (ONLY_SPOUSE !== undefined) {
        await test.step(`Isi ulang pasangan ${pasangan.namaLengkap} (kartu #${i + 1})`, async () => {
          await form.fillSpouse({ ...pasangan, domisiliSamaDenganPenjamin: false, fileKtp: COMMIT ? DUMMY_FILE : undefined });
          await setCheckboxNth(page, /^\s*Sama dengan alamat tempat tinggal penjamin saat ini\s*$/i, i);
          await expect(form.field('personalGuarantee.spouse.name')).toHaveValue(pasangan.namaLengkap);
        });
        continue;
      }

      await test.step(`Kartu penjamin #${i + 1}: siapkan`, async () => {
        const cards = await page.locator('[role="combobox"][id^="typeGuarantee"]').count();
        if (cards <= i) {
          await form.btnTambahPenjamin.scrollIntoViewIfNeeded();
          await form.btnTambahPenjamin.click();
          await expect(page.locator('[role="combobox"][id^="typeGuarantee"]')).toHaveCount(i + 1, { timeout: 20000 });
        }
        await form.pilihTipe('Personal Guarantee');
      });

      await test.step(`Isi penjamin ${penjamin.namaLengkap}`, async () => {
        await form.fillPersonal({ ...penjamin, domisiliSamaDenganKtp: false, fileKtp: COMMIT ? DUMMY_FILE : undefined });
        await setCheckboxNth(page, /^\s*Sama dengan alamat sesuai KTP\s*$/i, i);
      });

      await test.step(`Isi pasangan ${pasangan.namaLengkap}`, async () => {
        await form.fillSpouse({ ...pasangan, domisiliSamaDenganPenjamin: false, fileKtp: COMMIT ? DUMMY_FILE : undefined });
        await setCheckboxNth(page, /^\s*Sama dengan alamat tempat tinggal penjamin saat ini\s*$/i, i);
      });

      await test.step(`Verifikasi kartu #${i + 1}`, async () => {
        await expect(form.field('personalGuarantee.wni.identityNumber')).toHaveValue(penjamin.nomorKtp);
        await expect(form.field('personalGuarantee.name')).toHaveValue(penjamin.namaLengkap);
        await expect(form.field('personalGuarantee.spouse.wni.identityNumber')).toHaveValue(pasangan.nomorKtp);
        await expect(form.field('personalGuarantee.spouse.name')).toHaveValue(pasangan.namaLengkap);
        expect(await form.dropdownValue('personalGuarantee.gender')).toBe(penjamin.jenisKelamin);
        expect(await form.dropdownValue('personalGuarantee.maritalStatus')).toBe('Menikah');
      });
      await page.screenshot({ path: test.info().outputPath(`penjamin-${i + 1}.png`), fullPage: true });
    }

    // Autosave penjamin tidak terpicu saat mengetik (hanya 1 PATCH data_penjamin terlihat di jaringan) -> picu simpan
    // dengan berpindah ke section lain (Referensi, tanpa mengubah isinya) dan tunggu request simpan.
    const saved = page.waitForResponse(
      r => /forms\/data_penjamin/.test(r.url()) && r.request().method() !== 'GET',
      { timeout: 20000 },
    ).catch(() => null);
    await page.locator('aside button', { hasText: 'Referensi' }).click();
    const savedResp = await saved;
    console.log('Simpan penjamin saat pindah section:', savedResp ? `${savedResp.request().method()} ${savedResp.status()}` : 'TIDAK ADA request');
    await page.waitForTimeout(5000);

    // Verifikasi persisten: reload lalu cek nama penjamin & pasangan kedua kartu masih ada (run sebelumnya: pasangan kartu 2 hilang setelah reload)
    // reload lewat goto ulang (reload biasa pernah tidak memunculkan tab dalam 30 detik)
    await new CreditApplicationForm(page).goto(APPLICATION_ID, 'identitas_pengecekan');
    await new DataPenjaminForm(page, 0).open();
    for (let i = 0; i < SKENARIO.length; i++) {
      const f = new DataPenjaminForm(page, i);
      await expect(f.field('personalGuarantee.name'), `penjamin #${i + 1} setelah reload`).toHaveValue(SKENARIO[i].penjamin.namaLengkap, { timeout: 20000 });
      await expect(f.field('personalGuarantee.spouse.name'), `pasangan #${i + 1} setelah reload`).toHaveValue(SKENARIO[i].pasangan.namaLengkap, { timeout: 20000 });
    }
    const sidebar = page.locator('aside button', { hasText: 'Data penjamin' });
    console.log('Status sidebar Data penjamin:', (await sidebar.innerText()).replace(/\n/g, ' | '));
    await page.screenshot({ path: test.info().outputPath('penjamin-akhir.png'), fullPage: true });
  });
});
