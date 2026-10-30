import { test, Page } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Explorer read-only bucket Dokumen: memetakan pohon kategori -> sub-kategori -> slot dokumen
 * dan struktur area upload. Tidak meng-upload / menyimpan apa pun.
 * Output: explore-output/dokumen-tree.json
 */
const TARGET_URL = (process.env.EXPLORE_URL
  || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M483P7DDHBV41Z5QPV0FM8Q9/create?bucket=identitas_pengecekan&debtorType=individual')
  .replace(/bucket=[^&]+/, 'bucket=dokumen');
const OUT_DIR = process.env.EXPLORE_OUT || 'explore-output';

async function settle(page: Page, ms = 1200) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

/** Item accordion dokumen: div.p-5 > button.w-full berisi <p> judul + <p> keterangan */
async function listItems(page: Page, scopeSel: string) {
  return page.evaluate((sel) => {
    const scope = document.querySelector(sel) || document.body;
    const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();
    return Array.from(scope.querySelectorAll(':scope button.w-full')).map((b, i) => {
      b.setAttribute('data-doc-item', `${sel}#${i}`);
      const ps = b.querySelectorAll('p');
      const status = b.querySelector('.bg-emerald-600, .text-white') ? 'lengkap'
        : b.querySelector('.text-yellow-500') ? 'perlu-penyimpangan-tbo' : 'belum';
      return { idx: i, title: clean(ps[0]?.textContent), note: clean(ps[1]?.textContent), status, depth: b.closest('[data-doc-depth]')?.getAttribute('data-doc-depth') };
    }).filter(x => x.title);
  }, scopeSel);
}

test('Explore bucket Dokumen', async ({ page }) => {
  test.setTimeout(20 * 60 * 1000);
  page.setDefaultTimeout(10000);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await settle(page, 4000);
  await page.screenshot({ path: `${OUT_DIR}/dokumen__full.png`, fullPage: true });

  // Struktur area upload / staging (di luar daftar kategori)
  const uploadArea = await page.evaluate(() => {
    const root = document.querySelector('section.min-w-0.flex-1') || document.body;
    const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();
    return {
      fileInputs: Array.from(root.querySelectorAll('input[type="file"]')).map(i => ({
        id: i.id, name: i.getAttribute('name'), accept: i.getAttribute('accept'), multiple: (i as HTMLInputElement).multiple,
        testid: i.getAttribute('data-testid'), context: clean(i.closest('div')?.parentElement?.textContent).slice(0, 200),
      })),
      buttons: Array.from(root.querySelectorAll('button')).map(b => clean(b.textContent)).filter(t => t && t.length < 60),
      comboboxes: Array.from(root.querySelectorAll('[role="combobox"]')).map(c => ({ id: c.id, label: clean(c.getAttribute('aria-label')) })),
      headings: Array.from(root.querySelectorAll('h1,h2,h3,h4,p.font-semibold,[class*="Collapsible-module_label"]')).map(h => clean(h.textContent)),
      text: clean((root as HTMLElement).innerText).slice(0, 3000),
    };
  });

  // Telusuri pohon: kategori (depth 0) -> klik -> item baru yang muncul (depth 1) -> klik -> (depth 2)
  const tree: any[] = [];
  const categories = await page.locator('div.p-5 > button.w-full').evaluateAll(bs => bs.map(b => {
    const ps = b.querySelectorAll('p');
    return { title: (ps[0]?.textContent || '').trim(), note: (ps[1]?.textContent || '').trim() };
  }));

  async function snapshotButtons() {
    return page.locator('section.min-w-0.flex-1 button').evaluateAll(bs => bs.map(b => (b.textContent || '').replace(/\s+/g, ' ').trim()));
  }

  async function expandAndDiff(clickable: ReturnType<Page['locator']>) {
    const before = new Set(await snapshotButtons());
    const beforeFiles = await page.locator('input[type="file"]').count();
    await clickable.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await clickable.click({ timeout: 5000 }).catch(() => {});
    await settle(page, 1200);
    const after = await snapshotButtons();
    const fresh = after.filter(t => t && !before.has(t));
    const filesAfter = await page.locator('input[type="file"]').count();
    return { fresh, newFileInputs: filesAfter - beforeFiles };
  }

  for (const cat of categories) {
    if (!cat.title) continue;
    console.log(`Kategori: ${cat.title}`);
    const catBtn = page.locator('div.p-5 > button.w-full').filter({ has: page.locator('p', { hasText: cat.title }) }).first();
    const { fresh } = await expandAndDiff(catBtn);
    const node: any = { ...cat, children: [] };
    // detail elemen di bawah kategori yang baru muncul
    const panel = await catBtn.evaluate((b: Element) => {
      const wrap = b.parentElement!;
      const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();
      return { text: clean((wrap as HTMLElement).innerText).slice(0, 2500), html: wrap.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '<svg/>').slice(0, 4000) };
    }, undefined, { timeout: 5000 }).catch(() => ({ text: '', html: '' }));
    node.panelText = panel.text;
    node.panelHtml = panel.html;
    for (const sub of fresh) {
      if (/simpan|kirim|hapus|delete|upload|unggah/i.test(sub)) { node.children.push({ title: sub, action: true }); continue; }
      const subBtn = catBtn.locator('xpath=..').locator('button').filter({ hasText: sub }).first();
      const r = await expandAndDiff(subBtn);
      const subPanel = await subBtn.evaluate(b => (b.parentElement as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 1500), undefined, { timeout: 5000 }).catch(() => '');
      node.children.push({ title: sub, children: r.fresh, newFileInputs: r.newFileInputs, panelText: subPanel });
      console.log(`  - ${sub}: ${r.fresh.length} item`);
    }
    await catBtn.screenshot({ timeout: 5000, path: `${OUT_DIR}/dokumen__cat_${cat.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.png`.slice(0, 140) }).catch(() => {});
    tree.push(node);
    fs.writeFileSync(`${OUT_DIR}/dokumen-tree.json`, JSON.stringify({ uploadArea, tree, partial: true }, null, 2));
    // reset state agar kategori berikutnya mulai dari kondisi tertutup
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await settle(page, 3000);
  }

  fs.writeFileSync(`${OUT_DIR}/dokumen-tree.json`, JSON.stringify({ uploadArea, tree }, null, 2));
});
