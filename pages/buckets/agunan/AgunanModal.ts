import { expect, Locator, Page } from '@playwright/test';

/**
 * Modal "Tambah agunan" (bucket Agunan): tombol "+ Agunan" -> pilih jenis -> nomor -> Cari -> "+ Agunan Baru".
 * Sumber tunggal selector alur pembuka form Agunan; sebelumnya disalin ke belasan spec di tests/bucketAgunan.
 *
 * Perilaku dipindahkan apa adanya dari helper spec (modul2-4, s2cml-4890, ...), bukan didesain ulang.
 */
export class AgunanModal {
  constructor(readonly page: Page) {}

  /** Tombol "+ Agunan" di halaman bucket (teks persis "Agunan"; bukan "Agunan Baru"). */
  get btnTambahAgunan(): Locator {
    return this.page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
  }

  /** Container modal dengan judul h2 "Tambah agunan" (selalu ambil yang paling dalam/terakhir). */
  get modal(): Locator {
    return this.page.locator('div').filter({ has: this.page.locator('h2:has-text("Tambah agunan")') }).last();
  }

  /** Pemicu dropdown Jenis agunan (placeholder persis). */
  get pemicuJenisAgunan(): Locator {
    return this.page.locator('div, button, span').filter({ hasText: /^Pilih jenis agunan$/ }).last();
  }

  /** Pemicu dropdown Status agunan di form Agunan Baru. */
  get pemicuStatusAgunan(): Locator {
    return this.page.locator('div, button, span').filter({ hasText: /^Pilih status agunan$/ }).last();
  }

  /** Listbox yang sedang terbuka (dropdown custom, bukan <select>). */
  get listbox(): Locator {
    return this.page.locator('[role="listbox"]:visible, ul:visible').first();
  }

  get inputNomorAgunan(): Locator {
    return this.page.locator('input[placeholder*="nomor" i]').first();
  }

  get btnCari(): Locator {
    return this.page.locator('button:has-text("Cari")').first();
  }

  get btnAgunanBaru(): Locator {
    return this.page.locator('button, [role="button"]').filter({ hasText: /Agunan Baru/i }).first();
  }

  /** Klik "+ Agunan" dan tunggu modal "Tambah agunan" (Step pencarian). Mengembalikan locator modal. */
  async bukaModalTambah(): Promise<Locator> {
    await expect(this.btnTambahAgunan).toBeVisible({ timeout: 45000 });
    await this.btnTambahAgunan.click();
    const modal = this.modal;
    await expect(modal).toBeVisible({ timeout: 20000 });
    return modal;
  }

  /**
   * Buka dropdown Jenis agunan lalu pilih opsi yang memuat `jenisKeyword` (case-insensitive).
   * Bila keyword kosong atau opsi tidak terlihat dalam 3 dtk, pilih opsi pertama.
   */
  async pilihJenisAgunan(jenisKeyword?: string): Promise<void> {
    await this.pemicuJenisAgunan.click();
    const listbox = this.listbox;
    await listbox.locator('li button, li').first().waitFor({ timeout: 15000 });
    if (jenisKeyword) {
      const target = listbox.locator('li button, li').filter({ hasText: new RegExp(jenisKeyword, 'i') }).first();
      if (await target.isVisible({ timeout: 3000 }).catch(() => false)) {
        await target.click();
        return;
      }
    }
    await listbox.locator('li button, li').first().click();
  }

  /**
   * Alur penuh sampai form Agunan Baru: buka modal, pilih jenis, cari nomor fiktif (hasil CLS kosong),
   * klik "+ Agunan Baru". Mengembalikan locator modal aktif.
   */
  async bukaFormAgunanBaru(jenisKeyword?: string): Promise<Locator> {
    await this.bukaModalTambah();
    await this.pilihJenisAgunan(jenisKeyword);

    await this.inputNomorAgunan.fill('NONEXISTENT_DUMMY_CLS_' + Date.now());
    await expect(this.btnCari).toBeEnabled({ timeout: 10000 });
    await this.btnCari.click();

    await expect(this.btnAgunanBaru).toBeVisible({ timeout: 15000 });
    await this.btnAgunanBaru.click();
    await this.page.waitForTimeout(2000);

    return this.modal;
  }
}
