import { Given, When, Then } from './fixtures';

// Kredensial hanya dari env (.env): LAMOS_USERNAME / LAMOS_PASSWORD. Jangan ditulis di feature atau kode.
const username = () => process.env.LAMOS_USERNAME ?? '';
const password = () => process.env.LAMOS_PASSWORD ?? '';

Given('saya membuka halaman login LAMOS', async ({ loginPage }) => {
  await loginPage.goto();
});

When('saya login dengan kredensial yang valid', async ({ loginPage }) => {
  await loginPage.login(username(), password());
});

When('saya login dengan password {string}', async ({ loginPage }, wrongPassword: string) => {
  await loginPage.login(username(), wrongPassword);
});

Then('saya diarahkan keluar dari halaman login', async ({ loginPage }) => {
  await loginPage.expectLoginSuccess();
});

Then('muncul pesan gagal login', async ({ loginPage }) => {
  await loginPage.expectLoginFailed();
});
