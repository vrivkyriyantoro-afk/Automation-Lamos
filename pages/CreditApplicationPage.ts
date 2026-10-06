import { Page, Locator, expect } from '@playwright/test';
import 'dotenv/config';

export class CreditApplicationPage {
  readonly page: Page;
  readonly lamosMenu: Locator;
  readonly creditApplicationSubMenu: Locator;
  readonly continueApplicationOption: Locator;
  readonly dokumenTab: Locator;
  readonly searchDebiturInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lamosMenu = page.locator('div').filter({ hasText: 'LAMOS' }).nth(1);
    this.creditApplicationSubMenu = page.getByRole('link', { name: 'Pengajuan kredit' }).nth(1);
    this.continueApplicationOption = page.getByRole('link', { name: 'Lanjutkan pengajuan' });
    this.dokumenTab = page.locator('#dokumen').getByText('Dokumen');
    this.searchDebiturInput = page.getByPlaceholder('Cari nama debitur');
  }

  async goto() {
    const rawBaseUrl = process.env.BASE_URL || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/';
    const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;
    const targetUrl = new URL('lamos/credit-application', baseUrl).toString();
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateFromSidebar() {
    await this.lamosMenu.click();
    await this.creditApplicationSubMenu.click();
    await this.page.waitForURL(/.*lamos\/credit-application.*/i);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchDebitur(keyword: string) {
    if (await this.searchDebiturInput.isVisible()) {
      await this.searchDebiturInput.fill(keyword);
      await this.searchDebiturInput.press('Enter');
      await this.page.waitForTimeout(2000);
    }
  }

  async continueApplication(identifier: string = '01M3VAJ3NVWGMD8X7HVJE2Y2J4') {
    let targetRow = this.page.getByRole('row', { name: identifier }).or(
      this.page.locator('tr').filter({ hasText: identifier })
    ).first();

    if (!(await targetRow.isVisible())) {
      await this.searchDebitur(identifier);
      targetRow = this.page.getByRole('row', { name: identifier }).or(
        this.page.locator('tr').filter({ hasText: identifier })
      ).first();
    }

    if (!(await targetRow.isVisible())) {
      targetRow = this.page.locator('tbody tr').first();
    }

    await expect(targetRow).toBeVisible({ timeout: 20000 });

    const iconButton = targetRow.getByLabel('icon button').or(targetRow.locator('button').last());
    await iconButton.click();

    await this.continueApplicationOption.first().click();
    await this.page.waitForURL(/.*create\?bucket=.*/i);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectBucketDokumen() {
    const tab = this.dokumenTab.or(this.page.locator('#dokumen')).or(this.page.locator('text=Dokumen')).first();
    await tab.click();
    await this.page.waitForTimeout(1000);
  }

  async expectBucketDokumenVisible() {
    await expect(this.page).toHaveURL(/.*bucket=dokumen.*/i);
    const dokumenHeader = this.page.locator('text=Kelengkapan dokumen').or(this.page.locator('#dokumen')).first();
    await expect(dokumenHeader).toBeVisible();
  }
}
