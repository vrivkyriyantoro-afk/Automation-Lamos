import { Page, Locator, expect } from '@playwright/test';

/**
 * Komponen dasar form LAMOS (design system yang sama dipakai di semua bucket).
 * Selector berdasarkan hasil explore DOM (tests/explore-all-buckets.spec.ts):
 * - input/textarea          : atribut `name` stabil (react-hook-form), mis. `identityAddress.rt`
 * - dropdown                : [role=combobox][data-testid=dropdownsearch], id `<key>-r<n>` (suffix dinamis)
 *                             opsi di `#<id>-listbox li button`, search di [data-testid=dropdownsearch-input-search]
 * - radio                   : [role=radiogroup] dengan aria-labelledby -> label pertanyaan
 * - currency                : input[data-testid=currency-input][name=...]
 * - date                    : react-datepicker, input[name=...]
 * - file upload             : input[type=file] dengan id stabil (mis. `ktpFiles`)
 */

/** Ambil Page dari root (Page atau Locator) */
export const pageOf = (root: Page | Locator): Page =>
  typeof (root as Locator).page === 'function' ? (root as Locator).page() : (root as Page);

/** Escape teks untuk dipakai di RegExp */
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Field yang disabled (auto-fill dari sistem) dilewati dengan warning, bukan error */
async function skipIfDisabled(locator: Locator, name: string) {
  if (await locator.isDisabled().catch(() => false)) {
    console.warn(`[FormControls] "${name}" disabled, dilewati`);
    return true;
  }
  return false;
}

export class TextInput {
  readonly locator: Locator;
  constructor(root: Page | Locator, readonly name: string) {
    this.locator = root.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
  }
  async fill(value: string | number) {
    await this.locator.scrollIntoViewIfNeeded();
    if (await skipIfDisabled(this.locator, this.name)) return;
    await this.locator.fill(String(value));
  }
  async isDisabled() {
    return this.locator.isDisabled();
  }
  async value() {
    return this.locator.inputValue();
  }
}

/** Input nominal Rupiah (auto format ribuan) */
export class CurrencyInput extends TextInput {
  async fill(value: string | number) {
    await this.locator.scrollIntoViewIfNeeded();
    if (await skipIfDisabled(this.locator, this.name)) return;
    await this.locator.fill('');
    await this.locator.pressSequentially(String(value).replace(/\D/g, ''));
  }
}

/** react-datepicker: ketik tanggal format "DD MMM YYYY" (mis. "01 Jan 1990") lalu Enter */
export class DateInput extends TextInput {
  async fill(value: string) {
    await this.locator.scrollIntoViewIfNeeded();
    if (await skipIfDisabled(this.locator, this.name)) return;
    await this.locator.click();
    await this.locator.fill(value);
    await this.locator.press('Enter');
  }
}

export class Dropdown {
  readonly locator: Locator;
  /**
   * @param key prefix id combobox tanpa suffix dinamis, mis. `maritalStatus`, `identityAddress.province`
   */
  constructor(private readonly root: Page | Locator, readonly key: string, locator?: Locator) {
    this.locator = locator ?? root.locator(`[role="combobox"][id^="${key}-r"]`).first();
  }
  /** Dropdown dari locator combobox langsung (bila prefix id tidak diketahui) */
  static fromLocator(combobox: Locator) {
    return new Dropdown(combobox.page(), 'combobox', combobox);
  }
  private get page(): Page {
    return pageOf(this.root);
  }
  async listbox() {
    const id = await this.locator.getAttribute('id');
    return this.page.locator(`[id="${id}-listbox"]`);
  }
  /** Pilih opsi berdasarkan teks persis (atau RegExp). Jika dropdown punya search, ketik dulu. */
  async select(option: string | RegExp) {
    await this.locator.scrollIntoViewIfNeeded();
    if (await this.locator.getAttribute('aria-disabled') === 'true') {
      console.warn(`[FormControls] dropdown "${this.key}" disabled, dilewati`);
      return;
    }
    await this.locator.click();
    const search = this.locator.locator('[data-testid="dropdownsearch-input-search"]');
    if (typeof option === 'string' && await search.isVisible().catch(() => false)) {
      await search.fill(option);
    }
    const listbox = await this.listbox();
    const matcher = typeof option === 'string' ? new RegExp(`^\\s*${escapeRegex(option)}\\s*$`, 'i') : option;
    const item = listbox.locator('li:not(.sticky) button').filter({ hasText: matcher }).first();
    await item.waitFor({ state: 'visible', timeout: 15000 });
    await item.click();
    await expect(this.locator).toHaveAttribute('aria-expanded', 'false');
  }
  async value() {
    return (await this.locator.locator('[data-testid="dropdownsearch-placeholder"]').textContent())?.trim() ?? '';
  }
  async options(): Promise<string[]> {
    await this.locator.click();
    const listbox = await this.listbox();
    await listbox.locator('li button').first().waitFor({ timeout: 10000 });
    const opts = await listbox.locator('li:not(.sticky) button').allInnerTexts();
    await this.page.keyboard.press('Escape');
    return opts.map(o => o.trim());
  }
}

/** Radio group yang dicari berdasarkan teks label pertanyaan */
export class RadioGroup {
  readonly locator: Locator;
  constructor(root: Page | Locator, readonly label: string | RegExp) {
    // aria-labelledby -> accessible name; tanda "*" ber-aria-hidden sehingga tidak ikut
    this.locator = root.getByRole('radiogroup', { name: label, exact: typeof label === 'string' }).first();
  }
  /** Pilih opsi berdasarkan teks (mis. "Ya" / "Tidak") */
  async select(option: string) {
    const opt = this.locator.locator('[class*="radio-container"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(option)}\\s*$`, 'i') }).first();
    await opt.scrollIntoViewIfNeeded();
    await opt.locator('input[type="radio"]').check({ force: true });
  }
  async selected(): Promise<string | null> {
    const checked = this.locator.locator('[class*="radio-container"]:has(input:checked)');
    return (await checked.count()) ? (await checked.first().innerText()).trim() : null;
  }
}

export class FileUpload {
  readonly locator: Locator;
  constructor(root: Page | Locator, readonly id: string) {
    this.locator = root.locator(`input[type="file"][id="${id}"]`);
  }
  async upload(files: string | string[]) {
    await this.locator.setInputFiles(files);
  }
}

/** Checkbox custom: [data-testid=checkbox-container] > div[role=checkbox][aria-checked] + label */
export class Checkbox {
  readonly container: Locator;
  readonly box: Locator;
  constructor(root: Page | Locator, readonly label: string | RegExp) {
    const text = typeof label === 'string' ? new RegExp(`^\\s*${escapeRegex(label)}\\s*$`, 'i') : label;
    this.container = root.locator('[data-testid="checkbox-container"]').filter({
      has: pageOf(root).locator('[data-testid="checkbox-label"]').filter({ hasText: text }),
    }).first();
    this.box = this.container.locator('[data-testid="checkbox"]');
  }
  async isChecked() {
    return (await this.box.getAttribute('aria-checked')) === 'true';
  }
  async set(checked: boolean) {
    await this.container.scrollIntoViewIfNeeded();
    if ((await this.isChecked()) !== checked) await this.box.click();
    await expect(this.box).toHaveAttribute('aria-checked', String(checked));
  }
}

/** Rich text editor (contenteditable), mis. Covenant */
export class RichTextEditor {
  readonly locator: Locator;
  constructor(root: Page | Locator, readonly id = 'rich-text-editor') {
    this.locator = root.locator(`[contenteditable="true"][id="${id}"]`).or(root.locator('[contenteditable="true"]')).first();
  }
  async fill(text: string) {
    await this.locator.scrollIntoViewIfNeeded();
    await this.locator.click();
    await this.locator.press('Control+A');
    await this.locator.press('Delete');
    await this.locator.pressSequentially(text);
  }
  async value() {
    return ((await this.locator.textContent()) ?? '').trim();
  }
}

/**
 * Tabel kriteria (Knock-out / General eligibility) dengan react-select "Pass/fail" per baris.
 * Baris "Otomatis terisi" disabled (dihitung sistem dari DHN/SLIK/data debitur).
 */
export class CriteriaTable {
  readonly locator: Locator;
  constructor(root: Page | Locator) {
    this.locator = root.locator('table[data-testid="table"]').first();
  }
  /** Baris berdasarkan nomor (1-based) atau potongan teks kriteria */
  row(rowNoOrText: number | string | RegExp): Locator {
    const rows = this.locator.locator('tbody tr');
    return typeof rowNoOrText === 'number' ? rows.nth(rowNoOrText - 1) : rows.filter({ hasText: rowNoOrText }).first();
  }
  async result(rowNoOrText: number | string | RegExp): Promise<string> {
    return ((await this.row(rowNoOrText).locator('[class*="__single-value"], [class*="__placeholder"]').first().textContent()) ?? '').trim();
  }
  async setResult(rowNoOrText: number | string | RegExp, value: 'Pass' | 'Fail' | string) {
    const row = this.row(rowNoOrText);
    const control = row.locator('[class*="__control"]').first();
    if (await control.getAttribute('aria-disabled') === 'true') {
      console.warn(`[CriteriaTable] baris ${rowNoOrText} otomatis terisi (disabled), dilewati`);
      return;
    }
    await control.scrollIntoViewIfNeeded();
    await control.click();
    const page = this.locator.page();
    await page.locator('[class*="__menu"] [class*="__option"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(value)}\\s*$`, 'i') }).first().click();
  }
  async rowsText(): Promise<string[]> {
    return this.locator.locator('tbody tr').allInnerTexts();
  }
}
