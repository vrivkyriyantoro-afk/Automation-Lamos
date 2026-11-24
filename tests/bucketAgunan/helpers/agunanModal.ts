import { expect, Page } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';

export const APP_ID_PERORANGAN = process.env.DEBITUR_TARGET || '01M4F7TNSCSHEDB5G3WTSP7HDY';
export const APP_ID_BADAN_USAHA = process.env.DEBITUR_BU_TARGET || '01M482PRSVH5ZMTVZX5QH0VDNZ';

const BASE = 'https://los-fe-lamos-sit.devs.banksinarmas.com/lamos/credit-application';

export function targetUrl(appId: string, debtorType: 'individual' | 'business') {
  return `${BASE}/${appId}/create?bucket=agunan&debtorType=${debtorType}`;
}

export async function loginAndOpen(page: Page, appId: string, debtorType: 'individual' | 'business') {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(targetUrl(appId, debtorType), { waitUntil: 'domcontentloaded' });
}

/**
 * Buka modal "Tambah agunan" sampai Step 3 (Informasi kepemilikan).
 * Alur: + Agunan -> pilih jenis -> isi nomor dummy -> Cari -> + Agunan Baru -> tab Kepemilikan.
 */
export async function openStep3Kepemilikan(page: Page, prefix = 'EXPLORE') {
  const btnTambah = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  await expect(btnTambah).toBeVisible({ timeout: 45000 });
  await btnTambah.click();

  await page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last().click();
  const listJenis = page.locator('[role="listbox"]:visible, ul:visible').first();
  await listJenis.locator('li button, li').first().waitFor({ timeout: 15000 });
  await listJenis.locator('li button, li').filter({ hasText: /Tanah/i }).first().click();

  await page.locator('input[placeholder*="nomor" i]').first().fill(`${prefix}_${Date.now()}`);

  const btnCari = page.locator('button:has-text("Cari")').first();
  await expect(btnCari).toBeEnabled({ timeout: 10000 });
  await btnCari.click();

  const btnAgunanBaru = page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  await expect(btnAgunanBaru).toBeVisible({ timeout: 15000 });
  await btnAgunanBaru.click();
  await page.waitForTimeout(2000);

  const tabKepemilikan = page.locator('button, [role="tab"]').filter({ hasText: /kepemilikan/i }).first();
  await tabKepemilikan.click();
  await page.waitForTimeout(1200);
}

export async function closeModal(page: Page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const closeBtn = page.locator('button.mantine-Modal-close, button[aria-label="Close"], button:has-text("Kembali")').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
  }
}

/** Combobox pertama pada form Step 3 = Kategori pemilik agunan. */
export function kategoriCombobox(page: Page) {
  return page.locator('[role="combobox"]:visible').filter({ hasText: /kategori pemilik|pilih kategori|^\d{3}/i }).first();
}

/** Combobox kedua = Tipe kepemilikan agunan (opsi SIT: Individu / Non Individu). */
export function tipeKepemilikanCombobox(page: Page) {
  return page.locator('[role="combobox"]:visible').nth(1);
}

/** Footer modal di-render di luar container modal utama, jadi di-scope ke level page. */
export function btnSimpan(page: Page) {
  return page.locator('button:visible').filter({ hasText: /^\s*Simpan\s*$/ }).first();
}

export function listboxOption(page: Page, pattern: RegExp) {
  return page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
    .filter({ hasText: pattern }).first();
}

/** Baca seluruh opsi listbox yang sedang terbuka. */
export async function readListboxOptions(page: Page) {
  const raw = await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
    .allInnerTexts();
  return raw.map(o => o.trim()).filter(Boolean);
}

/** Nilai field tidak ikut innerText modal (konten di-portal), jadi dibaca dari input value. */
export async function snapshotInputs(page: Page) {
  return page.locator('input:visible').evaluateAll((els) =>
    els.map((el) => {
      const i = el as HTMLInputElement;
      return { placeholder: i.placeholder, value: i.value, disabled: i.disabled, readOnly: i.readOnly };
    })
  );
}

export async function snapshotComboboxes(page: Page) {
  return page.locator('[role="combobox"]:visible').evaluateAll((els) =>
    els.map((el) => ((el as HTMLElement).innerText || '').trim().slice(0, 60))
  );
}

/** Buka dropdown kategori dan ambil daftar opsinya tanpa memilih apa pun. */
export async function bacaOpsiKategori(page: Page) {
  const combobox = kategoriCombobox(page);
  await expect(combobox).toBeVisible({ timeout: 15000 });
  await combobox.click();
  await page.waitForTimeout(1000);
  return readListboxOptions(page);
}

/** Pilih kategori pemilik agunan. Mengembalikan null bila opsi tidak tersedia. */
export async function pilihKategori(page: Page, kode: string) {
  const combobox = kategoriCombobox(page);
  await expect(combobox).toBeVisible({ timeout: 15000 });
  await combobox.click();
  await page.waitForTimeout(1000);

  // Tunggu listbox benar-benar terisi; klik terlalu cepat membuat opsi dianggap tidak ada.
  const options = await readListboxOptions(page);
  if (!options.some(o => o.includes(kode))) {
    // Dropdown dibiarkan terbuka: Escape menutup seluruh modal, dan klik ulang combobox
    // menggantung karena listbox menimpa posisinya.
    return null;
  }

  await listboxOption(page, new RegExp(kode)).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  return combobox;
}

/**
 * Buka dropdown sekali, lalu pilih kode pertama yang tersedia dari daftar prioritas.
 * Menghindari buka-tutup berulang, yang rawan timeout karena listbox menimpa combobox.
 * Mengembalikan kode yang terpilih, atau null bila tidak satu pun tersedia.
 */
export async function pilihKategoriPertamaYangAda(page: Page, kodePrioritas: string[]) {
  const combobox = kategoriCombobox(page);
  await expect(combobox).toBeVisible({ timeout: 15000 });
  await combobox.click();
  await page.waitForTimeout(1000);

  const options = await readListboxOptions(page);
  const kode = kodePrioritas.find(k => options.some(o => o.includes(k)));

  // Dropdown dibiarkan terbuka bila tidak ada yang cocok — menutupnya rawan menggantung.
  if (!kode) return null;

  await listboxOption(page, new RegExp(kode)).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  return kode;
}

/**
 * Pilih tipe kepemilikan. Label di SIT: "Individu" / "Non Individu".
 * Pola di-anchor karena /individu/i juga cocok dengan "Non Individu".
 */
export async function pilihTipeKepemilikan(page: Page, label: 'Individu' | 'Non Individu') {
  const tipe = tipeKepemilikanCombobox(page);
  if (!(await tipe.isVisible().catch(() => false))) return null;

  await tipe.click();
  await page.waitForTimeout(1000);

  const pola = label === 'Individu' ? /^Individu$/ : /^Non Individu$/;
  const options = await readListboxOptions(page);
  // Dropdown dibiarkan terbuka bila opsi tidak ada — menutupnya rawan menggantung.
  if (!options.some(o => pola.test(o))) return null;

  await listboxOption(page, pola).click({ timeout: 15000 });
  await page.waitForTimeout(2500);
  return tipe;
}

/** Ambil kode numerik (001, 005, ...) dari daftar opsi dropdown. */
export function kodeDariOpsi(options: string[]) {
  return options.map(o => (o.match(/^(\d{3})/) || [])[1]).filter(Boolean) as string[];
}
