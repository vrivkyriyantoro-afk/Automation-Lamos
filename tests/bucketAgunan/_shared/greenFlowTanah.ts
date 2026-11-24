import { expect, Page } from '@playwright/test';

/**
 * Green flow Agunan Tanah: mengisi SEMUA field wajib Step 1 dan Step 2 (+ Step 3 kategori) dengan nilai valid.
 * HANYA mengisi form, TIDAK menyimpan. Daftar field dari eksplorasi 2026-11-24
 * (explore-output/agunan/green-flow-fields-*.json). Berlaku perorangan & badan usaha.
 */
export const GREEN_FLOW_TANAH = {
  status: /Tersedia/,
  jenisPengikatan: /Hak Tanggungan/,
  segmen: /^Kredit$/,
  kantor: /KCP Jakarta Cempaka Mas/,
  provinsi: /^DKI Jakarta$/,
  kota: /Jakarta Pusat/,
  kecamatan: /^Cempaka Putih$/,
  kelurahan: /^Cempaka Putih Barat$/,
  tipePenilaian: /^Internal$/,
  kodePos: '10510',
  alamat: 'Jl. Cempaka Putih Raya No. 1',
  nilaiPrediksi: '1000000000',
  nilaiWajar: '1200000000',
  nilaiPelapor: '1100000000',
  buktiPemilikan: 'SHM 12345/Cempaka Putih',
  sifat: /^Eligible$/,
  kategoriPemilik: /001 - Calon Debitur/,
};

function tanggalHariIni() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return { dd, mm, yyyy: String(d.getFullYear()), text: `${dd}/${mm}/${d.getFullYear()}` };
}

/** Pilih opsi combobox berdasarkan teks placeholder-nya (hanya valid selagi belum terpilih). */
export async function pilihCombo(page: Page, placeholder: RegExp, opsi: RegExp) {
  const trigger = page.locator('[role="combobox"]:visible').filter({ hasText: placeholder }).first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const item = page.locator('[role="listbox"]:visible li:not(.sticky)').filter({ hasText: opsi }).first();
  await expect(item).toBeVisible({ timeout: 15000 });
  await item.click();
  await page.waitForTimeout(1200);
}

/** Isi date picker kustom: buka popup "Pilih Tanggal" lalu klik tanggal hari ini (sel hari bukan <button>). */
export async function isiTanggal(page: Page, placeholder: RegExp) {
  const input = page.getByPlaceholder(placeholder).first();
  await input.scrollIntoViewIfNeeded();
  const t = tanggalHariIni();
  await input.click();
  const popup = page.locator('div').filter({ hasText: /Pilih Tanggal/ }).filter({ hasText: /Sunday/ }).last();
  await expect(popup).toBeVisible({ timeout: 10000 });
  await popup.getByText(String(Number(t.dd)), { exact: true }).first().click();
  await expect(input).not.toHaveValue('', { timeout: 5000 });
  await page.waitForTimeout(500);
}

async function radio(page: Page, pertanyaan: RegExp, jawaban: 'Ya' | 'Tidak') {
  const grup = page.locator('div').filter({ hasText: pertanyaan }).filter({ has: page.locator('input[type="radio"]') }).last();
  await grup.scrollIntoViewIfNeeded();
  await grup.getByText(jawaban, { exact: true }).first().click();
}

export async function isiStep1Tanah(page: Page) {
  const g = GREEN_FLOW_TANAH;
  await pilihCombo(page, /Pilih status agunan/, g.status);
  await pilihCombo(page, /Pilih jenis pengikatan/, g.jenisPengikatan);
  await isiTanggal(page, /Pilih tanggal pengikatan/);
  await pilihCombo(page, /Pilih jenis segmen fasilitas/, g.segmen);
  await radio(page, /Diasuransikan/, 'Tidak');
  await pilihCombo(page, /Pilih kantor cabang/, g.kantor);
  await pilihCombo(page, /Pilih provinsi/, g.provinsi);
  await pilihCombo(page, /Pilih kota/, g.kota);
  await pilihCombo(page, /Pilih kecamatan/, g.kecamatan);
  await pilihCombo(page, /Pilih kelurahan/, g.kelurahan);
  await page.getByPlaceholder('Masukkan kode pos').fill(g.kodePos);
  await page.getByPlaceholder('Masukkan alamat').fill(g.alamat);
  await radio(page, /Apakah LPA sudah tersedia/, 'Tidak');
  await radio(page, /Negative List BSIM/, 'Tidak');
  // Saat LPA = Tidak, Tipe penilaian terisi default Internal (S2CML-6756): isi hanya bila masih kosong.
  const tipeKosong = page.locator('[role="combobox"]:visible').filter({ hasText: /Pilih tipe penilaian/ });
  if (await tipeKosong.count()) await pilihCombo(page, /Pilih tipe penilaian/, g.tipePenilaian);
  const nominal = page.getByPlaceholder('Masukkan nominal');
  await nominal.nth(0).fill(g.nilaiPrediksi);
  await nominal.nth(1).fill(g.nilaiWajar);
  await nominal.nth(2).fill(g.nilaiPelapor);
  await isiTanggal(page, /Pilih tanggal$/);
}

export async function isiStep2Tanah(page: Page) {
  const g = GREEN_FLOW_TANAH;
  await page.locator('aside button').filter({ hasText: /Data tambahan agunan/i }).first().click();
  await page.waitForTimeout(1500);
  await pilihCombo(page, /Pilih sifat agunan jaminan/, g.sifat);
  await page.getByPlaceholder('Masukkan bukti pemilikan').fill(g.buktiPemilikan);
  // Dokumen bukti pemilikan* (PNG/JPG/PDF maks 50 MB). Status kredit joint account* default "Tidak".
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Pilih File', { exact: true }).first().click(),
  ]);
  await chooser.setFiles('fixtures/files/dummy-agunan-2.pdf');
  await page.waitForTimeout(2500);
}

/** Status indikator side-nav: teks badge di bawah nama step ("Lengkap" / "Belum Lengkap"). */
export async function statusStep(page: Page, nama: RegExp) {
  const t = (await page.locator('aside button').filter({ hasText: nama }).first().innerText()).replace(/\s+/g, ' ');
  return /Belum Lengkap/i.test(t) ? 'Belum Lengkap' : /Lengkap/i.test(t) ? 'Lengkap' : t;
}
