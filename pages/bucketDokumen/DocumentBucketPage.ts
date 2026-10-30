import { Page, Locator, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

export class DocumentBucketPage {
  readonly page: Page;
  readonly defaultUploadDir: string;
  readonly fileInput: Locator;
  readonly saveDocumentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.defaultUploadDir = process.env.DOC_UPLOAD_DIR || 'C:\\Users\\V50324\\Pictures\\Screenshots\\30 9 26';
    this.fileInput = page.locator('input[type="file"]').first();
    this.saveDocumentButton = page.getByRole('button', { name: 'Simpan Dokumen' }).or(page.locator('button:has-text("Simpan Dokumen")')).first();
  }

  /**
   * Tahap 1: Membuka Kategori Accordion (misal: "Dokumen Pengajuan")
   */
  async expandCategory(categoryName: string) {
    console.log(`[DocumentBucket] Membuka kategori: "${categoryName}"...`);
    const catHeader = this.page.getByText(categoryName, { exact: true })
      .or(this.page.locator('div, p, span').filter({ hasText: new RegExp(`^${categoryName}$`, 'i') }))
      .first();

    await catHeader.scrollIntoViewIfNeeded();
    await catHeader.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Tahap 2: Membuka Sub-kategori jika bertingkat (misal: "Dokumen Pengajuan*")
   */
  async expandSubCategory(subCategoryName: string) {
    console.log(`[DocumentBucket] Membuka sub-kategori: "${subCategoryName}"...`);
    const subCat = this.page.locator('div, span, p, button')
      .filter({ hasText: new RegExp(`^${subCategoryName.replace(/\*/g, '\\*')}$`, 'i') })
      .or(this.page.getByText(subCategoryName, { exact: true }))
      .first();

    if (await subCat.isVisible()) {
      await subCat.scrollIntoViewIfNeeded();
      await subCat.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Tahap 3: Memilih slot dokumen spesifik (misal: "Visiting Report*")
   */
  async selectDocumentSlot(docName: string) {
    console.log(`[DocumentBucket] Memilih slot dokumen: "${docName}"...`);
    const docSlot = this.page.locator('div, span, p, button')
      .filter({ hasText: new RegExp(`^${docName.replace(/\*/g, '\\*')}$`, 'i') })
      .or(this.page.getByText(docName, { exact: true }))
      .first();

    if (await docSlot.isVisible()) {
      await docSlot.scrollIntoViewIfNeeded();
      await docSlot.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Tahap 4 & 5: Injeksi File & Pemetaan Kategori
   */
  /**
   * Membersihkan dokumen yang belum disimpan / menggantung di staging area
   */
  /**
   * Tahap 4 & 5: Injeksi File & Pemetaan Kategori
   */
  async uploadAndCategorize(fileNameOrPath: string, mainCategory: string, documentType?: string, subCategory?: string) {
    let targetPath = fileNameOrPath;

    if (!path.isAbsolute(fileNameOrPath)) {
      targetPath = path.join(this.defaultUploadDir, fileNameOrPath);
    }

    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(this.defaultUploadDir)) {
        const availableFiles = fs.readdirSync(this.defaultUploadDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.pdf'));
        if (availableFiles.length > 0) {
          targetPath = path.join(this.defaultUploadDir, availableFiles[0]);
        }
      }
    }

    const baseName = path.basename(targetPath);

    // Cek apakah file sudah pernah di-drop di staging list
    let item = this.page.locator('li, [role="listitem"]').filter({ hasText: baseName }).first();
    const alreadyStaged = await item.isVisible({ timeout: 2000 }).catch(() => false);

    if (!alreadyStaged) {
      // Scroll ke atas halaman tempat dropzone upload berada
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await this.page.waitForTimeout(500);

      console.log(`[DocumentBucket] Injeksi file: ${baseName}`);
      await this.fileInput.setInputFiles(targetPath);
      await this.page.waitForTimeout(2000);
      item = this.page.locator('li, [role="listitem"]').filter({ hasText: baseName }).first();
    }

    if (!(await item.isVisible({ timeout: 5000 }).catch(() => false))) {
      item = this.page.locator('li, [role="listitem"]').filter({ has: this.page.locator('[role="combobox"]') }).first();
    }

    await expect(item).toBeVisible({ timeout: 20000 });

    // 1. Pilih Kategori Utama (combobox index 0 pada item ini)
    console.log(`[DocumentBucket] Memilih kategori utama: "${mainCategory}"...`);
    const combobox1 = item.locator('[role="combobox"]').nth(0);
    await expect(combobox1).toBeVisible({ timeout: 20000 });
    await combobox1.scrollIntoViewIfNeeded();
    await combobox1.click({ force: true });
    await this.page.waitForTimeout(600);

    const searchInput1 = this.page.locator('input[placeholder*="Cari"], [role="listbox"] input').first();
    if (await searchInput1.isVisible({ timeout: 1500 }).catch(() => false)) {
      await searchInput1.fill(mainCategory.split(/\s+/)[0]);
      await this.page.waitForTimeout(400);
    }

    // Pilih opsi kategori (listbox item)
    const opt1 = this.page.locator('[role="listbox"] *')
      .filter({ hasText: new RegExp(`^${mainCategory.trim().replace(/\*/g, '\\*')}$`, 'i') })
      .last();

    await opt1.waitFor({ state: 'attached', timeout: 8000 });
    await opt1.click({ force: true }).catch(async () => {
      await opt1.evaluate((el: HTMLElement) => el.click());
    });
    await this.page.waitForTimeout(1000);

    // 2. Cek apakah ada combobox kedua (Sub-kategori / Tipe Dokumen)
    const combobox2 = item.locator('[role="combobox"]').nth(1);
    if (await combobox2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await combobox2.scrollIntoViewIfNeeded();
      await combobox2.click({ force: true });
      await this.page.waitForTimeout(600);

      const target2 = subCategory || documentType;
      const searchInput2 = this.page.locator('input[placeholder*="Cari"], [role="listbox"] input').first();
      if (target2 && await searchInput2.isVisible({ timeout: 1500 }).catch(() => false)) {
        await searchInput2.fill(target2.split(/[\s*]+/)[0]);
        await this.page.waitForTimeout(400);
      }

      let matched2 = false;
      if (target2) {
        const kw2 = target2.split(/[\s*]+/)[0];
        const opt2 = this.page.locator('[role="listbox"] *')
          .filter({ hasText: new RegExp(kw2.replace(/\*/g, '\\*'), 'i') })
          .last();

        if (await opt2.count() > 0) {
          await opt2.click({ force: true }).catch(async () => {
            await opt2.evaluate((el: HTMLElement) => el.click());
          });
          matched2 = true;
          console.log(`   -> Combobox 2 dipilih: "${target2}"`);
          await this.page.waitForTimeout(1000);
        }
      }

      if (!matched2) {
        const firstOpt = this.page.locator('[role="listbox"] button, [role="listbox"] [role="option"], [role="listbox"] li').first();
        if (await firstOpt.count() > 0) {
          const text = await firstOpt.innerText();
          await firstOpt.evaluate((el: HTMLElement) => el.click()).catch(async () => {
            await firstOpt.click({ force: true });
          });
          console.log(`   -> Combobox 2 dipilih (default): "${text}"`);
          await this.page.waitForTimeout(1000);
        } else {
          await this.page.keyboard.press('Escape');
        }
      }

      // 3. Cek apakah ada combobox ketiga (Tipe Dokumen spesifik)
      const combobox3 = item.locator('[role="combobox"]').nth(2);
      if (await combobox3.isVisible({ timeout: 3000 }).catch(() => false)) {
        await combobox3.scrollIntoViewIfNeeded();
        await combobox3.click({ force: true });
        await this.page.waitForTimeout(600);

        const target3 = documentType;
        const searchInput3 = this.page.locator('input[placeholder*="Cari"], [role="listbox"] input').first();
        if (target3 && await searchInput3.isVisible({ timeout: 1500 }).catch(() => false)) {
          await searchInput3.fill(target3.split(/[\s*]+/)[0]);
          await this.page.waitForTimeout(400);
        }

        let matched3 = false;
        if (target3) {
          const kw3 = target3.split(/[\s*]+/)[0];
          const opt3 = this.page.locator('[role="listbox"] *')
            .filter({ hasText: new RegExp(kw3.replace(/\*/g, '\\*'), 'i') })
            .last();

          if (await opt3.count() > 0) {
            await opt3.click({ force: true }).catch(async () => {
              await opt3.evaluate((el: HTMLElement) => el.click());
            });
            matched3 = true;
            console.log(`   -> Combobox 3 dipilih: "${target3}"`);
            await this.page.waitForTimeout(1000);
          }
        }

        if (!matched3) {
          const firstOpt = this.page.locator('[role="listbox"] button, [role="listbox"] [role="option"], [role="listbox"] li').first();
          if (await firstOpt.count() > 0) {
            const text = await firstOpt.innerText();
            await firstOpt.evaluate((el: HTMLElement) => el.click()).catch(async () => {
              await firstOpt.click({ force: true });
            });
            console.log(`   -> Combobox 3 dipilih (default): "${text}"`);
            await this.page.waitForTimeout(1000);
          } else {
            await this.page.keyboard.press('Escape');
          }
        }
      }
    }

    // 4. Simpan Dokumen
    console.log(`[DocumentBucket] Memvalidasi tombol 'Simpan Dokumen'...`);
    const saveBtn = this.page.getByRole('button', { name: 'Simpan Dokumen' }).or(this.page.locator('button:has-text("Simpan Dokumen")')).first();
    if (await saveBtn.isEnabled().catch(() => false)) {
      await saveBtn.click({ force: true });
      console.log(`[DocumentBucket] Dokumen "${documentType || mainCategory}" berhasil disimpan!`);
      await this.page.waitForTimeout(3000);
    }
  }

  /**
   * Tahap 6: Verifikasi Hasil Unggah Dokumen
   */
  async expectUploadSuccess() {
    console.log(`[DocumentBucket] Memverifikasi upload dokumen berhasil...`);
    await this.page.waitForTimeout(1000);
    
    // Verifikasi badge/status dokumen memiliki kategori
    const successIndicator = this.page.locator('text=sudah memiliki kategori').first();
    await expect(successIndicator).toBeVisible({ timeout: 15000 });
    console.log(`[DocumentBucket] Upload dokumen terkonfirmasi berhasil!`);
  }
}
