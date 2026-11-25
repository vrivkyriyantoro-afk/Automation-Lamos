import { Browser, BrowserContext, Page, test } from '@playwright/test';
import { LoginPage } from '../pages/base/LoginPage';
import { RoleCredential, getRole, loadRoles } from './credentials';

export interface RoleSession {
  role: string;
  context: BrowserContext;
  page: Page;
  close: () => Promise<void>;
}

/** Login satu page dengan credential role. */
export async function loginAs(page: Page, cred: RoleCredential) {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(cred.username, cred.password);
  await login.expectLoginSuccess();
}

/**
 * Buka browser context TERPISAH (sesi sendiri) dan login sebagai `role`.
 * Beberapa role sekaligus dalam satu test: panggil berkali-kali, mis. maker lalu checker.
 */
export async function openRoleSession(browser: Browser, role: string): Promise<RoleSession> {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  try {
    await loginAs(page, getRole(role));
  } catch (e) {
    await context.close();
    throw e;
  }
  return { role, context, page, close: () => context.close() };
}

/**
 * Jalankan test yang sama untuk tiap role di file credential (filter: env ROLES=a,b).
 * Panggil di level atas spec atau di dalam test.describe.
 */
export function forEachRole(title: string, body: (s: RoleSession) => Promise<void>) {
  for (const { role } of loadRoles()) {
    test(`${title} [${role}]`, async ({ browser }) => {
      const session = await openRoleSession(browser, role);
      try {
        await body(session);
      } finally {
        await session.close();
      }
    });
  }
}
