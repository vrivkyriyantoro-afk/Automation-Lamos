import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[type="text"], input[name="username"], input[name="email"], #username, #email').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"], #password').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Masuk"), input[type="submit"]').first();
    this.errorMessage = page.locator('.alert-danger, .error-message, [role="alert"], .text-danger, .toast-error');
  }

  async goto(url?: string) {
    const targetUrl = url || process.env.BASE_URL || 'https://los-fe-lamos-sit.devs.banksinarmas.com/';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');

    // Deteksi dan tangani transient error gateway SIT (upstream connect error / 502 / 504)
    for (let retry = 0; retry < 3; retry++) {
      const bodyText = await this.page.locator('body').innerText().catch(() => '');
      if (bodyText.includes('upstream connect error') || bodyText.includes('502 Bad Gateway') || bodyText.includes('504 Gateway')) {
        console.warn(`[RETRY] Transient gateway error terdeteksi pada SIT. Reload attempt ${retry + 1}...`);
        await this.page.waitForTimeout(3000);
        await this.page.goto(targetUrl);
        await this.page.waitForLoadState('domcontentloaded');
      } else {
        break;
      }
    }
  }

  async login(username: string, password: string) {
    // Pastikan input username sudah muncul; jika belum (akibat redirect lambat), reload sekali
    const isVisible = await this.usernameInput.isVisible({ timeout: 15000 }).catch(() => false);
    if (!isVisible) {
      console.warn('[RETRY] Form login belum termuat sempurna, reload...');
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    }
    await expect(this.usernameInput).toBeVisible({ timeout: 30000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess(expectedUrlPattern?: RegExp | string) {
    if (expectedUrlPattern) {
      await expect(this.page).toHaveURL(expectedUrlPattern, { timeout: 60000 });
    } else {
      // Tunggu hingga dialihkan kembali ke aplikasi LAMOS (Kratos SSO redirect butuh waktu hingga 60 detik)
      await expect(this.page).not.toHaveURL(/.*(access-sit|auth-broker|kratos).*/i, { timeout: 60000 });
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async expectLoginFailed(expectedText?: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedText) {
      await expect(this.errorMessage).toContainText(expectedText);
    }
  }
}
