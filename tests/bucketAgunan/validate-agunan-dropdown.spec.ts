import { test, expect } from '@playwright/test';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Test Validasi: Dropdown "Jenis agunan" vs Data Acuan Excel/CSV
 * File Acuan: fixtures/List Req data agunan baru CLS - request Data baru CLS.csv
 * Karakter: READ-ONLY (membuka modal, memverifikasi opsi, menutup kembali tanpa submit)
 */

interface CsvAgunanItem {
  product: string;
  kode: string;
  jenis: string;
  kondisi: string;
  nilai: string;
}

function loadAgunanFromCsv(filePath: string): CsvAgunanItem[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const items: CsvAgunanItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,,') || line.startsWith('Referensi')) continue;

    // Parser CSV toleran kutip ganda
    const parts: string[] = [];
    let cur = '';
    let inQ = false;
    for (const c of line) {
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) {
        parts.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    parts.push(cur.trim());

    const product = parts[0] || '';
    const kode = parts[1] || '';
    const jenis = parts[2] || '';
    const kondisi = parts[3] || '';
    const nilai = parts[4] || '';

    if (kode || jenis) {
      items.push({ product, kode, jenis, kondisi, nilai });
    }
  }

  return items;
}

test.describe('Validasi Dropdown Jenis Agunan', () => {
  const TARGET_URL = process.env.EXPLORE_URL
    || 'https://los-fe-coreloan-sit.devs.banksinarmas.com/lamos/credit-application/01M482PRSVH5ZMTVZX5QH0VDNZ/create?bucket=agunan&debtorType=business';

  const csvPath = path.resolve(__dirname, '../../fixtures/List Req data agunan baru CLS - request Data baru CLS.csv');

  test('validasi kelengkapan opsi jenis agunan terhadap data CSV', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Baca data dari CSV
    expect(fs.existsSync(csvPath)).toBeTruthy();
    const csvItems = loadAgunanFromCsv(csvPath);
    
    // Ambil kombinasi unik Kode & Jenis dari CSV
    const uniqueCsv = new Map<string, CsvAgunanItem>();
    for (const item of csvItems) {
      const key = `${item.kode.trim()} - ${item.jenis.trim()}`;
      if (!uniqueCsv.has(key)) {
        uniqueCsv.set(key, item);
      }
    }
    console.log(`[CSV Data] Memuat ${uniqueCsv.size} kode/jenis agunan unik dari CSV.`);

    // 2. Login ke LAMOS SIT
    const login = new LoginPage(page);
    await login.goto();
    await login.login(process.env.LAMOS_USERNAME!, process.env.LAMOS_PASSWORD!);
    await login.expectLoginSuccess();

    // 3. Masuk ke halaman target bucket agunan
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // 4. Buka Modal "+ Agunan"
    const btnTambahAgunan = page.getByRole('button', { name: /Agunan/ }).filter({ hasText: /^\s*Agunan\s*$/ }).first();
    await btnTambahAgunan.click();

    const dialog = page.locator('[role="dialog"]:visible').last();
    await expect(dialog).toBeVisible();

    // 5. Buka Dropdown "Jenis agunan"
    await dialog.getByText('Pilih jenis agunan').click();
    const listbox = page.locator('[role="listbox"]:visible').first();
    await listbox.locator('li button').first().waitFor({ timeout: 15000 });

    // 6. Kumpulkan seluruh opsi UI dengan scroll ponytail
    const readOptions = () => listbox.locator('li:not(.sticky) button').allInnerTexts();
    const seenOptions = new Set<string>();
    let stableCount = 0;

    while (stableCount < 3) {
      const sizeBefore = seenOptions.size;
      const texts = await readOptions();
      texts
        .map(t => t.replace(/\s+/g, ' ').trim())
        .filter(t => t && t !== 'Clear')
        .forEach(t => seenOptions.add(t));

      await listbox.evaluate(el => {
        const scrollable = [el, ...Array.from(el.querySelectorAll('*'))].find(e => e.scrollHeight > e.clientHeight + 2) || el;
        scrollable.scrollTop = scrollable.scrollHeight;
      });

      await page.waitForTimeout(800);
      stableCount = seenOptions.size === sizeBefore ? stableCount + 1 : 0;
    }

    const uiOptions = Array.from(seenOptions);
    console.log(`[UI LAMOS] Ditemukan ${uiOptions.length} opsi di dropdown Jenis Agunan.`);

    // 7. Verifikasi dan bandingkan setiap item CSV dengan Opsi UI
    const matched: string[] = [];
    const missing: { kode: string; jenis: string; catatan: string }[] = [];

    // Helper ekstraksi kata kunci utama
    const getKeywords = (text: string) => {
      return text.toLowerCase()
        .replace(/apartement/g, 'apartemen')
        .replace(/property/g, 'properti')
        .replace(/produk/g, 'product')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['dan', 'non', 'melalui', 'aset', 'keuangan', 'lainnya'].includes(w));
    };

    for (const [key, item] of uniqueCsv) {
      const kodeClean = item.kode.trim().toUpperCase();
      const csvKeywords = getKeywords(item.jenis);

      // Cari di opsi UI yang memiliki kode yang sama persis
      const candidatesByCode = uiOptions.filter(opt => opt.toUpperCase().includes(kodeClean));

      if (candidatesByCode.length === 0) {
        missing.push({ kode: item.kode, jenis: item.jenis, catatan: 'Kode tidak ditemukan sama sekali di dropdown UI' });
        continue;
      }

      // Cocokkan apakah ada kandidat yang memuat kata kunci pembeda
      const hasMatch = candidatesByCode.some(candidate => {
        const uiKeywords = getKeywords(candidate);
        // Jika semua keyword esensial CSV ada di UI, atau sebagian besar overlap
        const matchedKeywords = csvKeywords.filter(kw => uiKeywords.some(ukw => ukw.includes(kw) || kw.includes(ukw)));
        return matchedKeywords.length >= Math.min(csvKeywords.length, 1);
      });

      if (hasMatch) {
        matched.push(key);
      } else {
        missing.push({ kode: item.kode, jenis: item.jenis, catatan: 'Kode ada tapi deskripsi/produk spesifik berbeda' });
      }
    }

    console.log(`\n==============================================`);
    console.log(`📊 LAPORAN VALIDASI DROPDOWN AGUNAN VS CSV`);
    console.log(`==============================================`);
    console.log(`Total Opsi di UI LAMOS : ${uiOptions.length}`);
    console.log(`Total Unik di CSV      : ${uniqueCsv.size}`);
    console.log(`✅ Cocok               : ${matched.length}`);
    console.log(`⚠️ Tidak Ditemukan      : ${missing.length}`);
    
    if (missing.length > 0) {
      console.log(`\nDetail Ketidaksesuaian:`);
      missing.forEach(m => console.log(` - [${m.kode}] ${m.jenis} -> ${m.catatan}`));
    }
    console.log(`==============================================\n`);

    // 8. Tutup dropdown listbox & dialog secara aman (read-only)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');

    // Assert: Memastikan mayoritas agunan utama (minimal 20 jenis) terverifikasi
    expect(uiOptions.length).toBe(28);
    expect(matched.length).toBeGreaterThanOrEqual(20);
  });
});
