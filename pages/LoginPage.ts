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
    const targetUrl = url || process.env.BASE_URL || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginSuccess(expectedUrlPattern?: RegExp | string) {
    if (expectedUrlPattern) {
      await expect(this.page).toHaveURL(expectedUrlPattern, { timeout: 30000 });
    } else {
      // Tunggu hingga dialihkan kembali ke aplikasi LAMOS
      await expect(this.page).not.toHaveURL(/.*(access-sit|auth-broker|kratos).*/i, { timeout: 30000 });
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
