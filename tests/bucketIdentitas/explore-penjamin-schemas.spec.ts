import { test, Page, Locator } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Explorer READ-ONLY untuk section "Data Penjamin":
 * - pilih "Debitur memiliki penjamin? = Ya"
 * - petakan field tiap Tipe Penjamin (Perorangan + status Menikah, Badan Usaha)
 * - buka modal pengurus/pemegang saham, petakan varian Perseorangan WNI / WNA / Badan Usaha
 * Tidak pernah klik Simpan / Kirim / Lanjutkan. Modal ditutup dengan Batal.
 *
 * Output: explore-output/penjamin-schemas.json + screenshot.
 * Jalankan: npx playwright test tests/bucketIdentitas/explore-penjamin-schemas.spec.ts --project=chromium
 */
const APPLICATION_ID = process.env.APPLICATION_ID || '01M483P7DDHBV41Z5QPV0FM8Q9';
const BASE = (process.env.BASE_URL || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/').replace(/\/?$/, '/');
const TARGET_URL = `${BASE}lamos/credit-application/${APPLICATION_ID}/create?bucket=identitas_pengecekan&debtorType=individual`;
const OUT_DIR = process.env.EXPLORE_OUT || 'explore-output';
const SECTION_SEL = '[data-explore="penjamin"]';
const MODAL_SEL = '[data-explore="modal"]';

const result: Record<string, any> = { url: TARGET_URL, steps: {} };
const save = () => fs.writeFileSync(`${OUT_DIR}/penjamin-schemas.json`, JSON.stringify(result, null, 2));

async function settle(page: Page, ms = 1200) {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

/** Dump semua kontrol di dalam root selector */
async function dump(page: Page, rootSel: string) {
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return { error: `root ${sel} tidak ditemukan` };
    const clean = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim();
    const stripId = (id: string) => id.replace(/-:?r[0-9a-z]+:?$/i, '');
    const labelOf = (el: Element) => {
      const lb = el.getAttribute('aria-labelledby');
      if (lb && document.getElementById(lb)) return clean(document.getElementById(lb)!.textContent);
      const id = el.id;
      if (id) { const l = document.querySelector(`label[for="${CSS.escape(id)}"]`); if (l) return clean(l.textContent); }
      let cur: Element | null = el.parentElement;
      for (let i = 0; cur && i < 6; i++, cur = cur.parentElement) {
        const l = cur.querySelector('[data-testid="input-label"], label');
        if (l && clean(l.textContent) && !l.contains(el)) return clean(l.textContent);
      }
      return '';
    };
    const out: any[] = [];
    const seen = new Set<Element>();
    for (const el of Array.from(root.querySelectorAll('h2,h3,h4,p.font-semibold,[class*="Collapsible-module_label"],input,textarea,[role="combobox"],[role="radiogroup"],button,[data-testid="checkbox-container"]'))) {
      if (seen.has(el)) continue;
      const tag = el.tagName;
      const cls = el.getAttribute('class') || '';
      if (/^H[234]$/.test(tag) || cls.includes('Collapsible-module_label') || (tag === 'P' && cls.includes('font-semibold'))) {
        out.push({ kind: 'heading', text: clean(el.textContent) });
        continue;
      }
      if (el.getAttribute('role') === 'radiogroup') {
        const opts = Array.from(el.querySelectorAll('input[type="radio"]')).map(r => {
          seen.add(r);
          const c = r.closest('[class*="radio-container"]') || r.parentElement?.parentElement;
          return { label: clean(c?.textContent), value: (r as HTMLInputElement).value, name: (r as HTMLInputElement).name, checked: (r as HTMLInputElement).checked };
        });
        out.push({ kind: 'radio', label: labelOf(el), options: opts });
        continue;
      }
      if (el.getAttribute('role') === 'combobox') {
        el.querySelectorAll('input').forEach(i => seen.add(i));
        out.push({
          kind: 'dropdown', label: labelOf(el), key: stripId(el.id || ''), id: el.id,
          disabled: el.getAttribute('aria-disabled') === 'true',
          value: clean(el.querySelector('[data-testid="dropdownsearch-placeholder"]')?.textContent),
        });
        continue;
      }
      if (tag === 'BUTTON') {
        if (el.closest('[role="combobox"]')) continue;
        const t = clean(el.textContent);
        if (t && t.length < 60) out.push({ kind: 'button', label: t, disabled: (el as HTMLButtonElement).disabled });
        continue;
      }
      if (el.getAttribute('data-testid') === 'checkbox-container') {
        out.push({ kind: 'checkbox', label: clean(el.querySelector('[data-testid="checkbox-label"]')?.textContent) });
        continue;
      }
      const inp = el as HTMLInputElement;
      const type = (inp.getAttribute('type') || tag.toLowerCase()).toLowerCase();
      if (type === 'hidden' || type === 'radio' || el.closest('[role="combobox"]')) continue;
      out.push({
        kind: inp.getAttribute('data-testid') === 'currency-input' ? 'currency'
          : el.closest('.react-datepicker-wrapper, .date-field') ? 'date'
          : type === 'file' ? 'file' : tag === 'TEXTAREA' ? 'textarea' : 'text',
        label: labelOf(el), name: inp.name, key: stripId(inp.id || ''), placeholder: inp.placeholder,
        disabled: inp.disabled, value: type === 'file' ? undefined : inp.value,
      });
    }
    return out;
  }, rootSel);
}

/** Buka tiap dropdown aktif di dalam root, catat opsi, tutup tanpa memilih */
async function captureOptions(page: Page, fields: any[]) {
  if (!Array.isArray(fields)) return;
  for (const f of fields) {
    if (f.kind !== 'dropdown' || f.disabled || !f.id) continue;
    if (/province|city|district|subdistrict|village|postal|country|negara/i.test(f.key)) { f.options = '(wilayah/negara, dilewati)'; continue; }
    const combo = page.locator(`[id="${f.id}"]`);
    try {
      await combo.scrollIntoViewIfNeeded({ timeout: 3000 });
      await combo.click({ timeout: 3000 });
      const listbox = page.locator(`[id="${f.id}-listbox"]`);
      await listbox.locator('li button').first().waitFor({ timeout: 5000 }).catch(() => {});
      const opts = await listbox.locator('li:not(.sticky) button').allInnerTexts().catch(() => [] as string[]);
      f.options = opts.map(o => o.replace(/\s+/g, ' ').trim()).filter(o => o && o !== 'Clear').slice(0, 60);
    } catch (e) {
      f.optionsError = String(e).slice(0, 150);
    } finally {
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function snapshot(page: Page, step: string, rootSel: string, withOptions = true) {
  const fields = await dump(page, rootSel);
  if (withOptions) await captureOptions(page, fields as any[]);
  result.steps[step] = fields;
  save();
  await page.locator(rootSel).screenshot({ path: `${OUT_DIR}/penjamin__${step}.png` }).catch(() => {});
  console.log(`[explore] ${step}: ${Array.isArray(fields) ? fields.length : 0} kontrol`);
  return fields as any[];
}

/** Pilih opsi dropdown (by id) berdasarkan regex teks */
async function pick(page: Page, id: string, text: RegExp) {
  const combo = page.locator(`[id="${id}"]`);
  await combo.scrollIntoViewIfNeeded();
  const item = page.locator(`[id="${id}-listbox"] li:not(.sticky) button`).filter({ hasText: text }).first();
  for (let i = 0; i < 3 && !(await item.isVisible().catch(() => false)); i++) {
    await combo.click({ timeout: 5000 });
    await item.waitFor({ timeout: 4000 }).catch(() => {});
  }
  await item.waitFor({ timeout: 4000 });
  await item.click({ timeout: 5000 });
  await settle(page, 800);
}

async function pickRadio(scope: Locator, groupLabel: RegExp, option: RegExp) {
  const byRole = scope.getByRole('radiogroup', { name: groupLabel }).first();
  const group = (await byRole.count()) ? byRole : scope;
  const opt = group.locator('[class*="radio-container"]').filter({ hasText: option }).first();
  await opt.scrollIntoViewIfNeeded({ timeout: 5000 });
  const input = opt.locator('input[type="radio"]');
  await input.check({ force: true, timeout: 5000 }).catch(async () => {
    await opt.click({ timeout: 5000 });
  });
}

test('Explore schema Data Penjamin (read-only)', async ({ page }) => {
  test.setTimeout(15 * 60 * 1000);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
  await login.expectLoginSuccess();

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('[role="tab"]').first().waitFor({ timeout: 30000 });
  await settle(page, 2500);

  // Buka section via sidebar, tandai container collapsible-nya
  await page.locator('aside button').filter({ hasText: /^\s*Data penjamin/i }).first().click();
  await settle(page, 1500);
  const marked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[class*="Collapsible-module_container__"]'));
    const c = all.find(el => /^\s*Data Penjamin\s*$/i.test(el.querySelector('[class*="Collapsible-module_label"]')?.textContent || ''));
    if (!c) return false;
    c.setAttribute('data-explore', 'penjamin');
    return true;
  });
  if (!marked) throw new Error('Collapsible "Data Penjamin" tidak ditemukan');
  const section = page.locator(SECTION_SEL);
  const header = section.locator('[class*="Collapsible-module_div_as_button"]').first();
  if ((await section.innerText()).trim().length < 40) await header.click();
  await settle(page);

  await snapshot(page, '0_awal', SECTION_SEL, false);

  // 1. Debitur memiliki penjamin? = Ya
  await pickRadio(section, /Debitur memiliki penjamin/i, /^\s*Ya\s*$/i);
  await settle(page, 2000);
  let fields = await snapshot(page, '1_penjamin_ya', SECTION_SEL);

  // Bila belum ada dropdown tipe penjamin, coba tombol tambah penjamin (tidak menyimpan apa pun)
  const findTipe = (fs_: any[]) => fs_.find(f => f.kind === 'dropdown' && /tipe|jenis|type/i.test(`${f.label} ${f.key}`) && /penjamin|guarant|type/i.test(`${f.label} ${f.key}`));
  let tipe = findTipe(fields);
  if (!tipe) {
    const add = section.getByRole('button', { name: /penjamin/i }).first();
    if (await add.count()) {
      await add.click({ timeout: 5000 });
      await settle(page, 1500);
      fields = await snapshot(page, '1b_setelah_tambah_penjamin', SECTION_SEL);
      tipe = findTipe(fields);
    }
  }
  result.tipeDropdown = tipe || null;
  save();
  if (!tipe) { console.warn('[explore] dropdown tipe penjamin tidak ditemukan, berhenti'); return; }

  // 2. Tipe Perorangan
  try {
    await pick(page, tipe.id, /Personal Guarantee|Perorangan|Perseorangan/i);
    fields = await snapshot(page, '2_perorangan', SECTION_SEL);
    const marital = fields.find(f => f.kind === 'dropdown' && /marital|pernikahan|perkawinan/i.test(`${f.label} ${f.key}`));
    if (marital && !marital.disabled) {
      await pick(page, marital.id, /^\s*Menikah\s*$/i);
      await snapshot(page, '3_perorangan_menikah', SECTION_SEL);
    } else {
      result.notes = [...(result.notes || []), 'dropdown status pernikahan penjamin perorangan tidak ditemukan'];
    }
  } catch (e) {
    result.errors = [...(result.errors || []), `perorangan: ${String(e).slice(0, 200)}`];
    save();
  }

  // 3. Tipe Badan Usaha (id combobox bisa berubah setelah re-render → cari ulang)
  try {
    fields = await dump(page, SECTION_SEL) as any[];
    tipe = findTipe(fields) || tipe;
    await pick(page, tipe.id, /Corporate Guarantee|Badan Usaha/i);
    fields = await snapshot(page, '4_badan_usaha', SECTION_SEL);
  } catch (e) {
    result.errors = [...(result.errors || []), `badan usaha: ${String(e).slice(0, 200)}`];
    save();
    return;
  }

  // 4. Modal pengurus / pemegang saham
  const addPengurus = section.getByRole('button', { name: /pengurus|pemegang saham/i }).first();
  if (!(await addPengurus.count())) { result.notes = [...(result.notes || []), 'tombol tambah pengurus tidak ditemukan']; save(); return; }
  await addPengurus.click({ timeout: 5000 });
  await settle(page, 1500);
  await page.screenshot({ path: `${OUT_DIR}/penjamin__5_after_click_pengurus.png` });
  // Dialog konfirmasi "Lanjutkan Edit" (hanya membuka mode edit, tidak menyimpan)
  const lanjutEdit = page.getByRole('button', { name: 'Lanjutkan Edit' });
  if (await lanjutEdit.isVisible().catch(() => false)) {
    result.notes = [...(result.notes || []), 'muncul dialog "Lanjutkan Edit" sebelum modal pengurus'];
    await lanjutEdit.click();
    await settle(page, 1500);
  }
  const markedModal = await page.evaluate(() => {
    const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 50 && r.height > 50; };
    let d: Element | undefined = Array.from(document.querySelectorAll('[role="dialog"], [aria-modal="true"]')).filter(visible).pop();
    if (!d) {
      // fallback: elemen position fixed/absolute paling atas yang berisi input dan teks "pengurus"
      d = Array.from(document.querySelectorAll('body *')).filter(el => {
        const pos = getComputedStyle(el).position;
        return (pos === 'fixed') && visible(el) && el.querySelector('input, [role="combobox"]') && /pengurus|pemegang saham/i.test((el as HTMLElement).innerText);
      }).pop();
    }
    if (!d) return '';
    d.setAttribute('data-explore', 'modal');
    return (d as HTMLElement).innerText.slice(0, 80);
  });
  result.modalTitle = markedModal;
  if (!markedModal) { result.notes = [...(result.notes || []), 'modal pengurus tidak terdeteksi']; save(); return; }
  const modal = page.locator(MODAL_SEL);

  const modalFields = await snapshot(page, '5_modal_awal', MODAL_SEL);
  const tipeRadio = modalFields.find(f => f.kind === 'radio' && f.options?.some((o: any) => /Perseorangan|Perorangan/i.test(o.label)));
  const tipeLabel = tipeRadio?.label ? new RegExp(tipeRadio.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*$/, ''), 'i') : /tipe/i;

  const variants: [string, RegExp, RegExp | null][] = [
    ['6_modal_perseorangan_wni', /Perseorangan|Perorangan/i, /^\s*WNI\s*$/i],
    ['7_modal_perseorangan_wna', /Perseorangan|Perorangan/i, /^\s*WNA\s*$/i],
    ['8_modal_badan_usaha', /^\s*Badan Usaha\s*$/i, null],
  ];
  for (const [step, tipeOpt, wn] of variants) {
    try {
      await pickRadio(modal, tipeLabel, tipeOpt);
      await settle(page, 800);
      if (wn) {
        const f0 = await dump(page, MODAL_SEL) as any[];
        const wnRadio = f0.find(f => f.kind === 'radio' && f.options?.some((o: any) => /^WN[IA]$/i.test(o.label)));
        if (wnRadio) await pickRadio(modal, new RegExp(wnRadio.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*$/, ''), 'i'), wn);
        else result.notes = [...(result.notes || []), `${step}: radio kewarganegaraan tidak ditemukan`];
        await settle(page, 800);
      }
      // Organ badan usaha bisa memunculkan field tambahan (mis. porsi kepemilikan) → pilih Pemegang Saham bila ada
      const f1 = await dump(page, MODAL_SEL) as any[];
      const organ = f1.find(f => f.kind === 'dropdown' && /organ/i.test(`${f.label} ${f.key}`));
      if (organ && !organ.disabled) await pick(page, organ.id, /^\s*Pemegang Saham\s*$/i).catch(() => {});
      // Alamat pengurus: pilih Negara = Indonesia agar field alamat muncul
      if (wn) await pickRadio(modal, /^Negara/i, /^\s*Indonesia\s*$/i).catch(() => {});
      await settle(page, 600);
      await snapshot(page, step, MODAL_SEL);
    } catch (e) {
      result.errors = [...(result.errors || []), `${step}: ${String(e).slice(0, 200)}`];
      save();
    }
  }

  // Tutup modal tanpa menyimpan
  await modal.getByRole('button', { name: /^(Batal|Tutup|Kembali|Cancel)$/i }).first().click({ timeout: 5000 }).catch(async () => {
    await page.keyboard.press('Escape');
  });
  save();
});
