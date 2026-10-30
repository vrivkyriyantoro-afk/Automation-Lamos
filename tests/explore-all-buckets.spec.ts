import { test, Page } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';

/**
 * Explorer read-only: menelusuri semua bucket (tab) di halaman Buat Pengajuan Kredit,
 * expand setiap section, lalu memetakan field (label, name, tipe, wajib, opsi dropdown).
 * Output: explore-output/<bucket>.json + screenshot (di luar test-results agar tidak terhapus tiap run).
 *
 * Jalankan: EXPLORE_URL=<url> npx playwright test tests/explore-all-buckets.spec.ts --project=chromium
 */
const TARGET_URL = process.env.EXPLORE_URL
  || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M483P7DDHBV41Z5QPV0FM8Q9/create?bucket=identitas_pengecekan&debtorType=individual';
const OUT_DIR = process.env.EXPLORE_OUT || 'explore-output';
const ONLY_BUCKETS = (process.env.EXPLORE_BUCKETS || '').split(',').filter(Boolean);

async function settle(page: Page, ms = 1500) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

/** Tandai collapsible top-level di area konten dengan data-explore-idx, kembalikan labelnya */
async function markSections(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = (document.querySelector('section.min-w-0.flex-1') || document.querySelector('#default-tabs')?.parentElement?.parentElement || document.body) as Element;
    const all = Array.from(root.querySelectorAll('[class*="Collapsible-module_container__"]'));
    const top = all.filter(c => !all.some(o => o !== c && o.contains(c)));
    return top.map((c, i) => {
      c.setAttribute('data-explore-idx', String(i));
      return (c.querySelector('[class*="Collapsible-module_label"]')?.textContent || '').trim();
    });
  });
}

/** Buka collapsible ke-i (accordion single-open) */
/** Tunggu sampai jumlah kontrol di dalam root stabil (field async / skeleton) */
async function waitStable(page: Page, rootSelector: string, maxMs = 15000) {
  let prev = -1, stable = 0;
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const n = await page.locator(`${rootSelector} :is(input, textarea, [role="combobox"], [role="radiogroup"], table, button)`).count();
    stable = n === prev ? stable + 1 : 0;
    if (stable >= 2 && n > 0) return;
    prev = n;
    await page.waitForTimeout(1000);
  }
}

async function openSection(page: Page, idx: number) {
  const container = page.locator(`[data-explore-idx="${idx}"]`);
  const header = container.locator('[class*="Collapsible-module_div_as_button"]').first();
  const isClosed = async () => container.evaluate(el => {
    const label = el.querySelector('[class*="Collapsible-module_label"]')?.textContent?.trim() || '';
    return (el as HTMLElement).innerText.trim().length - label.length < 5;
  }).catch(() => true);
  if (await isClosed()) {
    await header.scrollIntoViewIfNeeded().catch(() => {});
    await header.click().catch(() => {});
    await settle(page, 1000);
  }
}

/** Ekstraksi struktur form dari area konten (bukan sidebar/aside) */
async function extractFields(page: Page, rootSelector?: string) {
  return page.evaluate((rootSel) => {
    const main = (rootSel && document.querySelector(rootSel)) || (document.querySelector('section.min-w-0.flex-1') || document.querySelector('#default-tabs')?.parentElement?.parentElement || document.body) as Element;
    const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();
    const labelText = (el: Element | null) => clean(el?.textContent).replace(/\*$/, '').trim();
    const rowLabel = (el: Element) => {
      let cur: Element | null = el;
      while (cur && cur !== main) {
        const lbl = cur.querySelector(':scope > div [data-testid="input-label"], :scope > div > [data-testid="input-label"], :scope > [class*="shrink-0"] label, :scope > [class*="shrink-0"], :scope > div > label');
        if (lbl && clean(lbl.textContent)) return { text: labelText(lbl), required: !!lbl.querySelector('.text-error-650') };
        cur = cur.parentElement;
      }
      return { text: '', required: false };
    };
    const stripId = (id: string) => id.replace(/-r[0-9a-z]+$/i, '').replace(/-:r[0-9a-z]+:$/i, '');

    const out: any[] = [];
    let section = '';
    let subsection = '';
    const sel = [
      '[class*="Collapsible-module_label"]', 'h2', 'h3', 'h4', 'p.font-semibold',
      'input', 'textarea', 'select', '[contenteditable="true"]', '[data-testid="checkbox-container"]', '[role="combobox"]', '[role="radiogroup"]', 'button', 'table',
    ].join(',');
    const seen = new Set<Element>();
    for (const el of Array.from(main.querySelectorAll(sel))) {
      if (seen.has(el)) continue;
      const cls = el.getAttribute('class') || '';
      if (cls.includes('Collapsible-module_label')) { section = clean(el.textContent); subsection = ''; continue; }
      if (/^H[234]$/.test(el.tagName) || (el.tagName === 'P' && cls.includes('font-semibold'))) { subsection = clean(el.textContent); continue; }
      const base = { section, subsection };

      if (el.tagName === 'TABLE') {
        const headers = Array.from(el.querySelectorAll('thead th')).map(th => clean(th.textContent));
        out.push({ ...base, kind: 'table', headers, rows: el.querySelectorAll('tbody tr').length });
        continue;
      }
      if (el.getAttribute('role') === 'radiogroup') {
        const lbl = document.getElementById(el.getAttribute('aria-labelledby') || '');
        const opts = Array.from(el.querySelectorAll('input[type="radio"]')).map(r => {
          seen.add(r);
          const c = r.closest('[class*="radio-container"]') || r.parentElement?.parentElement;
          return { label: clean(c?.textContent), value: (r as HTMLInputElement).value, checked: (r as HTMLInputElement).checked };
        });
        const rl = lbl ? { text: labelText(lbl), required: !!lbl.querySelector('.text-error-650') } : rowLabel(el);
        out.push({ ...base, kind: 'radio', label: rl.text, required: rl.required, options: opts });
        continue;
      }
      if (el.getAttribute('role') === 'combobox') {
        const lbl = document.getElementById(el.getAttribute('aria-labelledby') || '');
        const rl = lbl ? { text: labelText(lbl), required: !!lbl.querySelector('.text-error-650') } : rowLabel(el);
        el.querySelectorAll('input').forEach(i => seen.add(i));
        out.push({
          ...base, kind: 'dropdown', label: rl.text, required: rl.required,
          key: stripId(el.id || ''), id: el.id,
          disabled: el.getAttribute('aria-disabled') === 'true',
          value: clean(el.querySelector('[data-testid="dropdownsearch-placeholder"]')?.textContent),
          testid: el.getAttribute('data-testid'),
        });
        continue;
      }
      if (el.tagName === 'BUTTON') {
        const t = clean(el.textContent);
        if (t && t.length < 60) out.push({ ...base, kind: 'button', label: t, disabled: (el as HTMLButtonElement).disabled });
        continue;
      }
      if (el.getAttribute('data-testid') === 'checkbox-container') {
        const box = el.querySelector('[data-testid="checkbox"]');
        out.push({ ...base, kind: 'checkbox', label: clean(el.querySelector('[data-testid="checkbox-label"]')?.textContent), checked: box?.getAttribute('aria-checked') === 'true' });
        continue;
      }
      if (el.getAttribute('contenteditable') === 'true') {
        const lbl = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
        const rl = lbl ? { text: labelText(lbl), required: !!lbl.querySelector('span') } : rowLabel(el);
        out.push({ ...base, kind: 'richtext', label: rl.text, required: rl.required, id: el.id, value: clean(el.textContent).slice(0, 200) });
        continue;
      }
      const inp = el as HTMLInputElement;
      const type = (inp.getAttribute('type') || el.tagName.toLowerCase()).toLowerCase();
      if (type === 'hidden' || type === 'radio') continue;
      if (el.closest('[role="combobox"]')) continue;
      let lbl = inp.id ? document.querySelector(`label[for="${CSS.escape(inp.id)}"]`) : null;
      let rl = lbl ? { text: labelText(lbl), required: !!lbl.querySelector('.text-error-650') } : rowLabel(el);
      if (type === 'file') {
        const fileLbl = el.closest('.flex-1')?.parentElement?.querySelector('.text-sm.text-neutral-800');
        if (fileLbl) rl = { text: labelText(fileLbl), required: !!fileLbl.querySelector('.text-error-650') };
      }
      if (type === 'checkbox') {
        const c = el.closest('label') || el.parentElement?.parentElement;
        rl = { text: clean(c?.textContent), required: false };
      }
      out.push({
        ...base,
        kind: inp.getAttribute('data-testid') === 'currency-input' ? 'currency' : type === 'file' ? 'file' : type === 'checkbox' ? 'checkbox' : el.closest('.react-datepicker-wrapper, .date-field') ? 'date' : el.tagName === 'TEXTAREA' ? 'textarea' : 'text',
        label: rl.text, required: rl.required,
        name: inp.getAttribute('name') || '', id: inp.id, key: stripId(inp.id || ''),
        ariaLabel: inp.getAttribute('aria-label') || '',
        placeholder: inp.getAttribute('placeholder') || '',
        inputType: type, suffix: clean(el.parentElement?.querySelector(':scope > span, :scope > div > span')?.textContent) || undefined, accept: inp.getAttribute('accept') || undefined,
        disabled: inp.disabled, readOnly: inp.readOnly,
        testid: inp.getAttribute('data-testid') || '',
        value: type === 'file' ? undefined : inp.value,
      });
    }
    return out;
  }, rootSelector);
}

/** Buka setiap dropdown yang aktif untuk mencatat opsi, lalu tutup (tanpa memilih) */
async function captureDropdownOptions(page: Page, fields: any[]) {
  for (const f of fields) {
    if (f.kind !== 'dropdown' || f.disabled || !f.id) continue;
    const combo = page.locator(`[id="${f.id}"]`);
    try {
      await combo.scrollIntoViewIfNeeded({ timeout: 3000 });
      await combo.click({ timeout: 3000 });
      await page.waitForTimeout(700);
      const listbox = page.locator(`[id="${f.id}-listbox"], [role="listbox"]:visible`).first();
      await listbox.locator('li button').first().waitFor({ timeout: 4000 }).catch(() => {});
      const opts = (await listbox.locator('li:not(.sticky) button').allInnerTexts().catch(() => [] as string[])).filter(o => o.trim() !== 'Clear');
      f.options = opts.map(o => o.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 80);
      f.optionsTruncated = opts.length > 80 || undefined;
      f.hasSearch = await page.locator(`[id="${f.id}"] [data-testid="dropdownsearch-input-search"]`).count() > 0;
    } catch (e) {
      f.optionsError = String(e).slice(0, 120);
    } finally {
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(250);
    }
  }
}

const SAFE_CLOSE = /^(Batal|Tutup|Kembali|Cancel)$/i;
const ADD_BUTTON = /^\s*(\+\s*)?(Tambah|Tambahkan)\b|^\s*\+/i;

/** Expand collapsible bersarang di dalam section satu per satu dan ekstrak isinya */
async function exploreNested(page: Page, rootSel: string, parentKey: string, bucketId: string) {
  const results: any[] = [];
  const labels = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [] as string[];
    const nested = Array.from(root.querySelectorAll('[class*="Collapsible-module_container__"]')).filter(c => c !== root);
    return nested.map((c, i) => {
      c.setAttribute('data-explore-nested', String(i));
      return (c.querySelector('[class*="Collapsible-module_label"]')?.textContent || '').trim();
    });
  }, rootSel);
  for (let j = 0; j < labels.length; j++) {
    const nsel = `${rootSel} [data-explore-nested="${j}"]`;
    const container = page.locator(nsel);
    const closed = await container.evaluate(el => {
      const label = el.querySelector('[class*="Collapsible-module_label"]')?.textContent?.trim() || '';
      return (el as HTMLElement).innerText.trim().length - label.length < 5;
    }).catch(() => false);
    if (closed) {
      await container.locator('[class*="Collapsible-module_div_as_button"]').first().click().catch(() => {});
      await settle(page, 1000);
    }
    await waitStable(page, nsel, 8000);
    const fields = await extractFields(page, nsel);
    await captureDropdownOptions(page, fields);
    const key = `${parentKey} > ${labels[j] || '#' + j}`;
    await container.screenshot({ path: `${OUT_DIR}/${bucketId}__${key.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.png`.slice(0, 140) }).catch(() => {});
    results.push({ section: key, nested: true, fields });
    console.log(`    > ${key}: ${fields.filter((f: any) => !['button', 'table'].includes(f.kind)).length} field`);
  }
  return results;
}

/** Buka modal/drawer dari tombol "+ Tambah ..." di section, petakan field, lalu tutup TANPA simpan */
async function exploreAddButtons(page: Page, rootSel: string, parentKey: string, bucketId: string, reopen: () => Promise<void>) {
  const results: any[] = [];
  const texts = await page.locator(rootSel).locator('button').evaluateAll((bs, re) => {
    const rx = new RegExp(re.source, re.flags);
    return Array.from(new Set(bs.filter(b => !(b as HTMLButtonElement).disabled)
      .filter(b => rx.test((b.textContent || '').trim()) || !!b.querySelector('svg.lucide-plus'))
      .map(b => (b.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean)));
  }, { source: ADD_BUTTON.source, flags: ADD_BUTTON.flags });
  for (const text of texts) {
    if (/simpan|kirim|submit|hapus|delete/i.test(text)) continue;
    await reopen();
    const urlBefore = page.url();
    const btn = page.locator(rootSel).locator('button').filter({ hasText: text }).first();
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click().catch(() => {});
    await settle(page, 1500);
    const dialog = page.locator('[role="dialog"]:visible, [aria-modal="true"]:visible').last();
    const entry: any = { section: `${parentKey} > [+] ${text}`, trigger: text, modal: true };
    if (await dialog.count()) {
      await dialog.evaluate(el => el.setAttribute('data-explore-modal', '1'));
      await waitStable(page, '[data-explore-modal="1"]', 10000);
      entry.title = (await dialog.locator('h1, h2, h3, [class*="title" i]').first().textContent().catch(() => ''))?.trim();
      entry.fields = await extractFields(page, '[data-explore-modal="1"]');
      await captureDropdownOptions(page, entry.fields);
      await dialog.screenshot({ path: `${OUT_DIR}/${bucketId}__modal_${text.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.png`.slice(0, 140) }).catch(() => {});
      // tutup tanpa simpan
      const closeBtn = dialog.locator('button').filter({ hasText: SAFE_CLOSE }).first();
      if (await closeBtn.count()) await closeBtn.click().catch(() => {});
      else await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
    } else {
      entry.modal = false;
      entry.urlAfter = page.url();
      entry.fields = await extractFields(page, rootSel).catch(() => []);
      await page.screenshot({ path: `${OUT_DIR}/${bucketId}__add_${text.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.png`.slice(0, 140), fullPage: true }).catch(() => {});
      if (page.url() !== urlBefore) await page.goBack().catch(() => {});
    }
    results.push(entry);
    console.log(`    [+] ${text}: ${(entry.fields || []).filter((f: any) => !['button', 'table'].includes(f.kind)).length} field (${entry.modal ? 'modal' : 'inline/page'})`);
  }
  return results;
}

test('Explore semua bucket pengajuan kredit', async ({ page }) => {
  test.setTimeout(30 * 60 * 1000);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await settle(page, 3000);

  const buckets = await page.$$eval('[role="tab"]', ts => ts.map(t => ({ id: t.id, title: (t as HTMLElement).innerText.trim() })));
  console.log('Buckets:', buckets.map(b => b.id).join(', '));
  const summary: any[] = [];

  for (const bucket of buckets) {
    if (ONLY_BUCKETS.length && !ONLY_BUCKETS.includes(bucket.id)) continue;
    console.log(`\n=== Bucket: ${bucket.title} (${bucket.id}) ===`);
    const url = new URL(TARGET_URL);
    url.searchParams.set('bucket', bucket.id);
    await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    await settle(page, 3000);

    await page.locator('aside button').first().waitFor({ timeout: 10000 }).catch(() => {});
    // Sidebar kiri (aside): daftar section/step beserta statusnya
    const sidebar = await page.$$eval('aside button', bs => bs.map(b => {
      const spans = b.querySelectorAll('span');
      return { title: spans[0]?.textContent?.trim() || '', status: spans[1]?.textContent?.trim() || '', disabled: (b as HTMLButtonElement).disabled };
    }).filter(s => s.title));

    const sections: any[] = [];
    const done = new Set<string>();
    const sidebarButtons = page.locator('aside button');
    const nSide = await sidebarButtons.count();
    for (let i = 0; i < Math.max(nSide, 1); i++) {
      const sideTitle = sidebar[i]?.title || '(main)';
      if (nSide) {
        const btn = sidebarButtons.nth(i);
        if (await btn.isDisabled().catch(() => true)) {
          sections.push({ sidebar: sideTitle, status: sidebar[i]?.status, skipped: 'disabled' });
          continue;
        }
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.click().catch(() => {});
        await settle(page, 1200);
      }
      const labels = await markSections(page);
      if (!labels.length && !done.has('(content)')) {
        done.add('(content)');
        const fields = await extractFields(page);
        await captureDropdownOptions(page, fields);
        sections.push({ sidebar: sideTitle, section: '(content)', fields });
        await page.screenshot({ path: `${OUT_DIR}/${bucket.id}__content.png`, fullPage: true }).catch(() => {});
        console.log(`  - (content): ${fields.length} elemen`);
      }
      for (let k = 0; k < labels.length; k++) {
        const key = labels[k] || `#${k}`;
        if (done.has(key)) continue;
        await markSections(page);
        await openSection(page, k);
        await markSections(page);
        await waitStable(page, `[data-explore-idx="${k}"]`);
        await markSections(page);
        const fields = await extractFields(page, `[data-explore-idx="${k}"]`);
        await captureDropdownOptions(page, fields);
        done.add(key);
        const safe = `${bucket.id}__${key.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`.slice(0, 90);
        await page.locator(`[data-explore-idx="${k}"]`).screenshot({ path: `${OUT_DIR}/${safe}.png` }).catch(() => {});
        sections.push({ sidebar: sideTitle, section: key, fields });
        console.log(`  - [${sideTitle}] ${key}: ${fields.filter((f: any) => !['button', 'table'].includes(f.kind)).length} field`);
        const rootSel = `[data-explore-idx="${k}"]`;
        for (const n of await exploreNested(page, rootSel, key, bucket.id)) sections.push({ sidebar: sideTitle, ...n });
        if (process.env.EXPLORE_MODALS !== '0') {
          const sideIdx = i;
          const reopen = async () => {
            await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
            await settle(page, 2500);
            if (nSide) { await sidebarButtons.nth(sideIdx).click().catch(() => {}); await settle(page, 1200); }
            await markSections(page);
            await openSection(page, k);
            await markSections(page);
            await waitStable(page, rootSel, 10000);
          };
          for (const m of await exploreAddButtons(page, rootSel, key, bucket.id, reopen)) sections.push({ sidebar: sideTitle, ...m });
          // kembalikan state halaman untuk section berikutnya
          if (k < labels.length - 1) { await page.goto(url.toString(), { waitUntil: 'domcontentloaded' }); await settle(page, 2500); if (nSide) { await sidebarButtons.nth(sideIdx).click().catch(() => {}); await settle(page, 1200); } }
        }
      }
    }

    const result = { bucket: bucket.id, title: bucket.title, sidebar, sections };
    fs.writeFileSync(`${OUT_DIR}/${bucket.id}.json`, JSON.stringify(result, null, 2));
    fs.writeFileSync(`${OUT_DIR}/${bucket.id}.html`, await page.content());
    summary.push({ bucket: bucket.id, title: bucket.title, sidebar: sidebar.map(s => `${s.title} [${s.status}]`) });
  }

  fs.writeFileSync(`${OUT_DIR}/_summary.json`, JSON.stringify(summary, null, 2));
});
