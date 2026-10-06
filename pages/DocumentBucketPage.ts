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

    // Scroll ke atas halaman tempat dropzone upload berada
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(500);

    console.log(`[DocumentBucket] Injeksi file: ${path.basename(targetPath)}`);
    await this.fileInput.setInputFiles(targetPath);
    await this.page.waitForTimeout(1500);

    // 1. Pilih Kategori Utama
    console.log(`[DocumentBucket] Memilih kategori utama: "${mainCategory}"...`);
    const comboboxKategori = this.page.locator('div, button, [role="combobox"]')
      .filter({ hasText: /Pilih kategori dokumen/i })
      .or(this.page.getByText('Pilih kategori dokumen'))
      .first();

    await expect(comboboxKategori).toBeVisible({ timeout: 15000 });
    await comboboxKategori.scrollIntoViewIfNeeded();
    await comboboxKategori.click();
    await this.page.waitForTimeout(500);

    // Pilih opsi kategori
    const optionCategory = this.page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]')
      .filter({ hasText: new RegExp(`^${mainCategory.replace(/\*/g, '\\*')}$`, 'i') })
      .first();

    await optionCategory.click({ force: true });
    await this.page.waitForTimeout(1500);

    // 2. Pilih Sub-kategori / Tipe Dokumen jika ada dropdown lanjutan
    const remainingCombos = this.page.locator('[role="combobox"]').filter({ hasText: /Pilih/i });
    const count = await remainingCombos.count();

    for (let i = 0; i < count; i++) {
      const activeCombo = this.page.locator('[role="combobox"]').filter({ hasText: /Pilih/i }).first();
      if (await activeCombo.isVisible()) {
        await activeCombo.scrollIntoViewIfNeeded();
        await activeCombo.click();
        await this.page.waitForTimeout(500);

        // Cari opsi yang sesuai
        let targetText = documentType;
        if (i === 0 && subCategory && count > 1) {
          targetText = subCategory;
        }

        let optionMatched = false;
        if (targetText) {
          // Ambil kata kunci utama
          const keyword = targetText.split(' ')[0];
          const matchedOpt = this.page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]')
            .filter({ hasText: new RegExp(keyword, 'i') })
            .first();

          if (await matchedOpt.isVisible()) {
            await matchedOpt.dispatchEvent('click');
            optionMatched = true;
            await this.page.waitForTimeout(1000);
          }
        }

        if (!optionMatched) {
          const firstOpt = this.page.locator('[role="listbox"] span, [role="listbox"] p, [role="listbox"] li, [role="option"]').first();
          if (await firstOpt.isVisible()) {
            await firstOpt.dispatchEvent('click');
            await this.page.waitForTimeout(1000);
          } else {
            await this.page.keyboard.press('Escape');
          }
        }
      }
    }

    // 3. Simpan Dokumen
    console.log(`[DocumentBucket] Memvalidasi tombol 'Simpan Dokumen'...`);
    const saveBtn = this.page.getByRole('button', { name: 'Simpan Dokumen' }).or(this.page.locator('button:has-text("Simpan Dokumen")')).first();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    console.log(`[DocumentBucket] Dokumen "${documentType || mainCategory}" berhasil disimpan!`);
    await this.page.waitForTimeout(2500);
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
