import { test, expect, Page, Locator } from '@playwright/test';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';
import { CreditApplicationForm } from '../../pages/components/BucketSection';
import { Dropdown } from '../../pages/components/FormControls';
import { DataPribadiSection } from '../../pages/bucketIdentitas/DataPribadiSection';
import { DataPribadiTambahanSection } from '../../pages/bucketIdentitas/DataPribadiTambahanSection';
import { DataPekerjaanKeuanganSection } from '../../pages/bucketIdentitas/DataPekerjaanKeuanganSection';
import { DataKontakDaruratSection } from '../../pages/bucketIdentitas/DataKontakDaruratSection';
import { BucketSection, BucketId } from '../../pages/components/BucketSection';
import { DataPenjaminSection } from '../../pages/bucketIdentitas/DataPenjaminSection';

/**
 * Lengkapi bucket Identitas (perorangan) app 01M83 dengan data DUMMY (disetujui user 2026-11-23),
 * lalu Lanjutkan + Kirim (disetujui user 2026-11-23). Data penjamin sudah diisi oleh penjamin-menikah-lp-01M83.spec.ts.
 * Env: APPLICATION_ID_IDENTITAS_LENGKAP (default 01M83AP5FKPHB1D3E2QS8P015Z), IDENTITAS_SUBMIT=1 untuk Lanjutkan/Kirim.
 */
const APPLICATION_ID = process.env.APPLICATION_ID_IDENTITAS_LENGKAP || '01M83AP5FKPHB1D3E2QS8P015Z';
const SUBMIT = process.env.IDENTITAS_SUBMIT === '1';
const DUMMY_FILE = path.resolve(__dirname, '../../fixtures/files/dummy-identitas.pdf');

class LbuSection extends BucketSection {
  readonly bucket: BucketId = 'identitas_pengecekan';
  readonly title = 'LBU';
  readonly sidebarTitle = 'LBU';
}

/** Pilih opsi pertama untuk setiap dropdown di root yang masih placeholder "Pilih ..." (berurutan, karena bisa bertingkat) */
async function fillEmptyDropdowns(root: Locator, log: string[]) {
  const page = root.page();
  await root.locator('[role="combobox"]').first().waitFor({ state: 'visible', timeout: 15000 });
  for (let pass = 0; pass < 3; pass++) {
    const combos = root.locator('[role="combobox"]');
    const n = await combos.count();
    log.push(`[dropdown pass ${pass}] ${n} combobox di section`);
    let changed = false;
    for (let i = 0; i < n; i++) {
      const dd = Dropdown.fromLocator(combos.nth(i));
      if (await dd.locator.getAttribute('aria-disabled') === 'true') continue;
      if (await dd.locator.isDisabled().catch(() => false)) continue;
      if (!(await dd.locator.isVisible().catch(() => false))) continue;
      const v = await dd.value();
      if (v && !/^Pilih/i.test(v)) continue;
      // id listbox berubah setelah klik (rerender) -> pakai listbox yang sedang terbuka, bukan "<id>-listbox"
      const cb = combos.nth(i);
      await cb.scrollIntoViewIfNeeded();
      await cb.click();
      const open = page.locator('[role="listbox"][data-testid="dropdownsearch-content"]:visible').last();
      const first = open.locator('li:not(.sticky) button').first();
      await first.waitFor({ state: 'visible', timeout: 15000 });
      const label = ((await first.innerText()) || '').trim();
      await first.click();
      await expect(open).toBeHidden({ timeout: 5000 }).catch(() => {});
      log.push(`${await cb.getAttribute('id')} -> ${label}`);
      changed = true;
    }
    if (!changed) break;
  }
}

/** Radiogroup tanpa pilihan -> pilih "Tidak" (dummy) */
async function fillEmptyRadios(root: Locator, log: string[]) {
  const groups = root.getByRole('radiogroup');
  const n = await groups.count();
  for (let i = 0; i < n; i++) {
    const g = groups.nth(i);
    if (!(await g.isVisible().catch(() => false))) continue;
    if (await g.locator('input[type="radio"]:checked').count()) continue;
    const opt = g.locator('[class*="radio-container"]').filter({ hasText: /^\s*Tidak\s*$/i }).first();
    if (!(await opt.count())) continue;
    await opt.locator('input[type="radio"]').check({ force: true });
    log.push(`radio "${(await g.getAttribute('aria-label')) || (await g.innerText()).slice(0, 40)}" -> Tidak`);
  }
}

/** Diagnosa: pesan error + field wajib kosong di section */
async function diagnose(root: Locator) {
  return root.evaluate(el => {
    const errs = Array.from(el.querySelectorAll('p, span, div'))
      .filter(e => e.children.length === 0 && /text-(red|danger|error)|error/i.test((e as HTMLElement).className || '') && (e.textContent || '').trim().length > 1)
      .map(e => (e.textContent || '').trim());
    const empty: string[] = [];
    el.querySelectorAll('[data-testid="input-label"]').forEach(l => {
      if (!/\*/.test(l.textContent || '')) return;
      let row: Element | null = l;
      for (let k = 0; k < 3 && row?.parentElement; k++) row = row.parentElement;
      const inp = row?.querySelector('input:not([type=radio]):not([type=checkbox]):not([type=file])') as HTMLInputElement | null;
      const ph = row?.querySelector('[data-testid="dropdownsearch-placeholder"]')?.textContent?.trim();
      const radios = row?.querySelectorAll('input[type=radio]');
      const radioEmpty = radios && radios.length > 0 && !Array.from(radios).some(r => (r as HTMLInputElement).checked);
      if ((inp && !inp.value && !inp.disabled) || (ph && /^Pilih/i.test(ph)) || radioEmpty) empty.push((l.textContent || '').trim());
    });
    return { errors: Array.from(new Set(errs)).slice(0, 20), emptyRequired: empty };
  });
}

async function sidebarReport(page: Page) {
  const items = page.locator('aside button');
  const n = await items.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(((await items.nth(i).innerText()) || '').replace(/\n/g, ' | '));
  return out;
}

test.describe('Identitas Lengkap - app 01M83 (dummy)', () => {
  test.describe.configure({ timeout: 15 * 60 * 1000 });

  test('TC01 - Lengkapi section Identitas lalu Lanjutkan/Kirim', async ({ page }) => {
    const log: string[] = [];
    const shot = (n: string) => page.screenshot({ path: test.info().outputPath(`${n}.png`), fullPage: true });

    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();
    const app = new CreditApplicationForm(page);
    await app.goto(APPLICATION_ID, 'identitas_pengecekan');

    await test.step('Data pribadi: status tempat tinggal + Form Aplikasi Kredit', async () => {
      const s = await new DataPribadiSection(page).open();
      const v = await s.residencyStatus.value();
      if (!v || /^Pilih/i.test(v)) { await s.residencyStatus.select(/\S/); log.push(`residencyStatus -> ${await s.residencyStatus.value()}`); }
      // Form Aplikasi Kredit: upload hanya bila belum ada file sama sekali
      const formFiles = s.root.locator('input[type="file"][id^="creditApplicationFormFiles"]');
      const existing = await s.root.getByText(/Form Aplikasi Kredit/).locator('xpath=ancestor::*[5]').getByRole('button', { name: /\.(pdf|png|jpe?g)$/i }).count().catch(() => 0);
      if ((await formFiles.count()) && existing === 0) {
        await formFiles.first().setInputFiles(DUMMY_FILE);
        log.push('creditApplicationFormFiles uploaded');
        await page.waitForTimeout(3000);
      }
      await fillEmptyRadios(s.root, log);
    });

    await test.step('Data pribadi tambahan: pendidikan terakhir', async () => {
      const s = await new DataPribadiTambahanSection(page).open();
      await fillEmptyDropdowns(s.root, log);
      await fillEmptyRadios(s.root, log);
    });

    await test.step('Data pekerjaan & keuangan', async () => {
      const s = await new DataPekerjaanKeuanganSection(page).open();
      // fill() biasa tidak menyimpan nilai di field ini (terbukti probe) -> ketik per karakter + blur
      // Probe 2026-11-23: nilai sempat "12" lalu dikosongkan form ~1,5 detik kemudian (sinkron ulang dari server).
      // -> tunggu dulu, ketik, pastikan nilai BERTAHAN beberapa detik, ulangi bila terhapus.
      const exp = s.monthOfRelatedIndustryExp.locator;
      await exp.scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      for (let attempt = 0; attempt < 4; attempt++) {
        await exp.click();
        await exp.press('Control+A');
        await exp.pressSequentially('12', { delay: 80 });
        await page.waitForTimeout(3000);
        if ((await exp.inputValue()) === '12') break;
        log.push(`Pengalaman terhapus form setelah diketik (percobaan ${attempt + 1}), ulangi`);
      }
      await expect(exp).toHaveValue('12');
      await s.companyPhoneNumber.fill('0211234567');
      await s.companyPostalCode.fill('10140');
      await fillEmptyDropdowns(s.root, log);
      await fillEmptyRadios(s.root, log);
    });

    await test.step('Data kontak darurat', async () => {
      const s = await new DataKontakDaruratSection(page).open();
      await s.fill({
        name: 'BUDI SANTOSO', relationship: 'Saudara Kandung', mobileNumber: '081234567890',
        address: 'Jl. Gambir Raya No. 1', rt: '001', rw: '002',
        province: 'DKI Jakarta', city: 'Jakarta Pusat, Wil. Kota', district: 'Gambir', subdistrict: 'Duri Pulo', postalCode: '10140',
      });
    });

    await test.step('LBU: pilih opsi pertama tiap dropdown kosong', async () => {
      const s = await new LbuSection(page).open();
      await fillEmptyDropdowns(s.root, log);
    });

    // Autosave baru terpicu saat MENINGGALKAN section (terbukti 2026-11-23 lewat jaringan) -> pindah section dulu
    await page.locator('aside button', { hasText: 'Referensi' }).click();
    await page.waitForTimeout(6000);
    await app.goto(APPLICATION_ID, 'identitas_pengecekan');
    const sidebar = await sidebarReport(page);
    console.log('ISIAN:\n  ' + log.join('\n  '));
    console.log('SIDEBAR:\n  ' + sidebar.join('\n  '));
    await shot('01-setelah-isi');

    const identitas = sidebar.slice(0, 8);
    const belum = identitas.filter(t => /Belum/i.test(t));
    const sectionByTitle: Record<string, BucketSection> = {
      'Data pribadi': new DataPribadiSection(page),
      'Data pribadi tambahan': new DataPribadiTambahanSection(page),
      'Data pekerjaan & keuangan': new DataPekerjaanKeuanganSection(page),
      'Data kontak darurat': new DataKontakDaruratSection(page),
      'Data penjamin': new DataPenjaminSection(page),
      'LBU': new LbuSection(page),
    };
    const diag: Record<string, unknown> = {};
    for (const b of belum) {
      const title = b.split(' | ')[0];
      const sec = sectionByTitle[title];
      if (!sec) continue;
      await sec.open();
      await page.waitForTimeout(1500);
      diag[title] = await diagnose(sec.root);
      await shot(`diag-${title.replace(/[^a-z0-9]+/gi, '_')}`);
    }
    console.log('DIAGNOSA:\n' + JSON.stringify(diag, null, 2));
    fs.writeFileSync(test.info().outputPath('report.json'), JSON.stringify({ log, sidebar, diag }, null, 2));
    expect(belum, `Section belum lengkap: ${belum.join('; ')}`).toEqual([]);

    if (!SUBMIT) return;

    await test.step('Lanjutkan', async () => {
      const btn = app.btnLanjutkan;
      console.log('Lanjutkan enabled:', await btn.isEnabled());
      await btn.click();
      const dialog = page.getByText('Lanjutkan ke pengecekan?').locator('xpath=ancestor::*[.//button][1]');
      await dialog.waitFor({ state: 'visible', timeout: 15000 });
      await shot('02-dialog-konfirmasi');
      console.log('DIALOG:', ((await dialog.innerText()) || '').replace(/\n/g, ' | '));
      // Konfirmasi MEMPROSES data & dokumen ke pengecekan (Dukcapil/DHN/SLIK) -> hanya bila IDENTITAS_CONFIRM=1
      // (disetujui user di chat 2026-11-23 setelah data penjamin lengkap)
      if (process.env.IDENTITAS_CONFIRM === '1') {
        const net: string[] = [];
        page.on('response', r => {
          if (/lossvc/.test(r.url()) && !/auth|session/.test(r.url()) && (r.request().method() !== 'GET' || r.status() >= 400))
            net.push(`${r.request().method()} ${r.status()} ${r.url().replace(/^https?:\/\/[^/]+/, '').slice(0, 120)}`);
        });
        // Tombol di dialog tidak punya accessible name (getByRole tidak menemukannya) -> CSS + teks, dengan batas waktu pendek
        await dialog.locator('button').filter({ hasText: /^\s*Lanjutkan\s*$/ }).last().click({ timeout: 10000 });
        await page.waitForTimeout(8000);
        await shot('03-setelah-konfirmasi');
        console.log('KONFIRMASI DIKLIK. URL:', page.url());
        console.log('NETWORK setelah konfirmasi:\n  ' + net.join('\n  '));
        console.log('SIDEBAR setelah konfirmasi:\n  ' + (await sidebarReport(page)).join('\n  '));
        console.log('Kirim enabled:', await app.btnKirim.isEnabled().catch(() => false));
      } else {
        await dialog.locator('button').filter({ hasText: /^\s*Batalkan\s*$/ }).last().click({ timeout: 10000 });
        console.log('Dialog dibatalkan (IDENTITAS_CONFIRM bukan 1)');
      }
    });

    // Tombol "Kirim" (pengiriman akhir pengajuan) SENGAJA tidak ditekan di spec ini: dilaporkan ke user dulu.
  });
});
