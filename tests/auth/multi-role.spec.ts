import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { hasRole } from '../../utils/credentials';
import { forEachRole, openRoleSession } from '../../utils/roleSession';

// Contoh pola multi-role. Read-only: hanya login dan cek halaman, tidak menyimpan apa pun di SIT.
// Butuh fixtures/credentials/roles.csv (lihat README di folder itu).

const LOGIN_URL = /.*(access-sit|auth-broker|kratos).*/i;

test.describe('Multi-role: satu test per role (bisa paralel)', () => {
  // Aman paralel karena read-only. Jalankan paralel: WORKERS=4 npm run test:roles
  test.describe.configure({ mode: 'parallel' });

  forEachRole('Validasi login berhasil', async ({ page, role }) => {
    await expect(page).not.toHaveURL(LOGIN_URL);
    console.log(`[role ${role}] login OK`);
  });
});

test.describe('Multi-role: beberapa role dalam satu alur', () => {
  test('Validasi maker dan checker login bersamaan di dua browser context', async ({ browser }) => {
    test.skip(!(hasRole('maker') && hasRole('checker')), 'Role maker/checker belum ada di roles.csv');
    const maker = await openRoleSession(browser, 'maker');
    const checker = await openRoleSession(browser, 'checker');
    try {
      // Dua sesi terpisah, tidak saling menimpa cookie/login.
      await expect(maker.page).not.toHaveURL(LOGIN_URL);
      await expect(checker.page).not.toHaveURL(LOGIN_URL);
      // Alur nyata: maker mengerjakan di maker.page, lalu checker.page memeriksa hasilnya.
    } finally {
      await maker.close();
      await checker.close();
    }
  });
});
