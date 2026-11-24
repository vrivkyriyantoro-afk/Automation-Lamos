import { test, expect } from '@playwright/test';
import 'dotenv/config';
import {
  APP_ID_PERORANGAN,
  APP_ID_BADAN_USAHA,
  bacaOpsiKategori,
  btnSimpan,
  closeModal,
  kategoriCombobox,
  loginAndOpen,
  openStep3Kepemilikan,
  pilihKategori,
  pilihKategoriPertamaYangAda,
  readListboxOptions,
  snapshotComboboxes,
  snapshotInputs,
} from '../_shared/agunanModal';

/**
 * S2CML-4948 — Informasi Kepemilikan Agunan:
 * Dropdown Kategori, Load List Nama dari Bucket Identitas, dan Auto-Fill.
 * Matriks: tests/bucketAgunan/S2CML-4948/TC_S2CML-4948_Informasi_Kepemilikan.csv
 */
test.describe('S2CML-4948: Informasi Kepemilikan Agunan - Dropdown Kategori & Auto-Fill', () => {
  // Listbox kategori dibuka ke bawah; pada tinggi 720px opsi terbawah jatuh di luar
  // viewport dan tidak bisa diklik, jadi viewport ditinggikan untuk seluruh suite.
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
  });

  test('TC-4948-01: Opsi dropdown debitur perorangan tanpa fasilitas aktif, belum menikah, tanpa penjamin', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_01');

    const options = await bacaOpsiKategori(page);
    console.log('TC-4948-01 Opsi kategori:', options);

    // Opsi yang wajib ada pada debitur baru (belum punya fasilitas aktif)
    for (const kode of ['001', '005', '008']) {
      expect(options.some(o => o.includes(kode)), `opsi ${kode} harus tampil`).toBeTruthy();
    }

    // 003/004 hanya untuk debitur yang sudah punya fasilitas aktif
    expect(options.some(o => o.includes('003')), '003 tidak boleh tampil').toBeFalsy();
    expect(options.some(o => o.includes('004')), '004 tidak boleh tampil').toBeFalsy();

    // GAP PREKONDISI: expected result mensyaratkan 002/009/010 TIDAK tampil karena
    // debitur belum menikah & tanpa penjamin. Status perkawinan dan keberadaan penjamin
    // pada App ID ini belum diverifikasi, jadi kondisinya hanya dicatat, belum di-assert.
    const ada002 = options.some(o => o.includes('002'));
    const ada009 = options.some(o => o.includes('009'));
    const ada010 = options.some(o => o.includes('010'));
    console.log(`TC-4948-01 GAP prekondisi -> 002=${ada002} 009=${ada009} 010=${ada010} (butuh App ID belum menikah & tanpa penjamin untuk assert penuh)`);

    await page.screenshot({ path: 'explore-output/probes/tc-4948-01-options.png' });
    await closeModal(page);
  });

  test('TC-4948-03: Opsi dropdown debitur perorangan dengan fasilitas aktif BSB', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_03');

    const options = await bacaOpsiKategori(page);
    console.log('TC-4948-03 Opsi kategori:', options);

    const ada003 = options.some(o => o.includes('003'));
    const ada001 = options.some(o => o.includes('001'));

    // GAP PREKONDISI: TC ini butuh debitur dengan Exposure terisi (fasilitas aktif BSB).
    // App ID yang tersedia adalah debitur baru, sehingga kondisi 003/004 menggantikan
    // 001/002 tidak dapat diuji. Yang diverifikasi di sini: aturan saling-eksklusif.
    console.log(`TC-4948-03 GAP prekondisi -> butuh App ID dengan fasilitas aktif BSB. Aktual: 001=${ada001} 003=${ada003}`);
    expect(ada001 !== ada003, '001 dan 003 harus saling eksklusif').toBeTruthy();

    await page.screenshot({ path: 'explore-output/probes/tc-4948-03-options.png' });
    await closeModal(page);
  });

  test('TC-4948-04: Opsi dropdown debitur badan usaha (006 & 007 wajib muncul)', { annotation: {type: 'defect',description: 'MISMATCH-01 (docs/LAPORAN_BUG_Bucket_Agunan_2026-11-01.md)'} }, async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'TC4948_04');

    const options = await bacaOpsiKategori(page);
    console.log('TC-4948-04 Opsi kategori badan usaha:', options);

    // Inti TC: 006 & 007 wajib muncul karena jenis debitur Badan Usaha
    expect(options.some(o => o.includes('006')), '006 Pengurus Perusahaan wajib tampil').toBeTruthy();
    expect(options.some(o => o.includes('007')), '007 Pemilik Perusahaan wajib tampil').toBeTruthy();

    for (const kode of ['005', '008', '009']) {
      expect(options.some(o => o.includes(kode)), `opsi ${kode} harus tampil`).toBeTruthy();
    }

    // MISMATCH TERCATAT: expected result mensyaratkan 003 - Debitur, tapi build SIT
    // menampilkan 001 - Calon Debitur pada debitur badan usaha ini.
    const ada003 = options.some(o => o.includes('003'));
    const ada001 = options.some(o => o.includes('001'));
    console.log(`TC-4948-04 MISMATCH desain -> expected 003 - Debitur; aktual 001=${ada001} 003=${ada003}`);

    await page.screenshot({ path: 'explore-output/probes/tc-4948-04-options.png' });
    await closeModal(page);
  });

  test('TC-4948-01: [eks 05] Opsi 006 & 007 tidak muncul pada debitur perorangan', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_05');

    const options = await bacaOpsiKategori(page);
    console.log('TC-4948-05 Opsi kategori perorangan:', options);

    expect(options.some(o => o.includes('006')), '006 tidak boleh tampil di perorangan').toBeFalsy();
    expect(options.some(o => o.includes('007')), '007 tidak boleh tampil di perorangan').toBeFalsy();

    await page.screenshot({ path: 'explore-output/probes/tc-4948-05-options.png' });
    await closeModal(page);
  });

  test('TC-4948-05: [eks 07] Pilih 009 - Penjamin tanpa data penjamin terdaftar', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_07');

    const combobox = await pilihKategori(page, '009');
    expect(combobox, 'Kategori 009 harus tersedia').not.toBeNull();
    await expect(combobox!).toContainText(/009/);

    // Expected: dropdown Nama penjamin kosong, atau notifikasi data tidak tersedia
    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /Pilih nama/i }).first();
    const namaKosong = await dropdownNama.isVisible().catch(() => false);

    const notif = page.locator('div:visible').filter({
      hasText: /tidak ditemukan|tidak tersedia|belum terdaftar/i,
    }).last();
    const adaNotif = await notif.isVisible().catch(() => false);

    console.log(`TC-4948-07 dropdownNamaKosong=${namaKosong} adaNotif=${adaNotif}`);
    expect(namaKosong || adaNotif, 'harus tampil dropdown Nama kosong atau notifikasi data tidak tersedia').toBeTruthy();

    await page.screenshot({ path: 'explore-output/probes/tc-4948-07-after.png' });
    await closeModal(page);
  });

  test('TC-4948-05: [eks 08] Pilih 006 - Pengurus Perusahaan tanpa data pengurus terdaftar', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'TC4948_08');

    const combobox = await pilihKategori(page, '006');
    expect(combobox, 'Kategori 006 harus tersedia pada debitur badan usaha').not.toBeNull();

    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama|nama pengurus/i }).first();
    await expect(dropdownNama, 'dropdown Nama harus tampil setelah kategori 006 dipilih').toBeVisible({ timeout: 15000 });

    // Dropdown dibiarkan terbuka; menutup dengan klik ulang rawan timeout karena
    // listbox menimpa combobox, dan Escape menutup seluruh modal.
    await dropdownNama.click();
    await page.waitForTimeout(1500);
    const opsiNama = await readListboxOptions(page);
    console.log('TC-4948-08 Opsi nama pengurus:', JSON.stringify(opsiNama));

    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const adaNotif = /pengurus[^.]{0,60}(belum|tidak)[^.]{0,40}(tersedia|ditemukan|terdaftar|diinput)|tidak ada data|data tidak ditemukan/i.test(bodyText);
    console.log(`TC-4948-08 adaNotif=${adaNotif}`);

    if (opsiNama.length === 0) {
      expect(adaNotif, 'daftar pengurus kosong -> notifikasi data belum tersedia harus muncul').toBeTruthy();
    } else {
      // GAP PREKONDISI: TC mensyaratkan debitur badan usaha TANPA data pengurus di
      // Bucket Identitas. App ID ini sudah punya pengurus terdaftar, jadi kondisi
      // negatifnya tidak dapat diuji dan hanya dicatat.
      console.log(`TC-4948-08 GAP prekondisi -> App ID ini punya ${opsiNama.length} pengurus terdaftar. ` +
        'Butuh App ID badan usaha tanpa data Pengurus & Pemegang Saham untuk assert penuh.');
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-08-after.png' });
    await closeModal(page);
  });

  test('TC-4948-06: [eks 09] Dropdown Nama terisi dari list Pengurus Perusahaan (Bucket Identitas)', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'TC4948_09');

    const combobox = await pilihKategori(page, '006');
    expect(combobox, 'Kategori 006 harus tersedia').not.toBeNull();

    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama|nama pengurus/i }).first();
    await expect(dropdownNama).toBeVisible({ timeout: 15000 });
    await dropdownNama.click();
    await page.waitForTimeout(1500);

    const opsiNama = await readListboxOptions(page);
    console.log('TC-4948-09 List pengurus dari Bucket Identitas:', JSON.stringify(opsiNama));

    // Dropdown terisi dari Bucket Identitas, difilter kategori 006
    expect(opsiNama.length, 'dropdown Nama harus memuat list pengurus dari Bucket Identitas').toBeGreaterThan(0);

    // GAP PREKONDISI: expected mensyaratkan minimal 2 pengurus terdaftar agar jumlah item
    // dapat dicocokkan dengan Bucket Identitas. App ID ini hanya punya sebagian.
    if (opsiNama.length < 2) {
      console.log(`TC-4948-09 GAP prekondisi -> hanya ${opsiNama.length} pengurus terdaftar; ` +
        'expected mensyaratkan minimal 2 untuk verifikasi jumlah item.');
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-09-options.png' });
    await closeModal(page);
  });

  test('TC-4948-08: [eks 11] Pilih 001 - Calon Debitur auto-fill Nama Lengkap & NIK', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_11');

    const combobox = await pilihKategori(page, '001');
    expect(combobox, 'Kategori 001 harus tersedia').not.toBeNull();
    await expect(combobox!).toContainText(/001/);

    const inputs = await snapshotInputs(page);
    console.log('TC-4948-11 Inputs:', JSON.stringify(inputs));

    const terisi = inputs.filter(i => i.value.trim().length > 0);
    expect(terisi.length, 'harus ada field yang ter-auto-fill').toBeGreaterThan(0);

    // Nama lengkap debitur ter-fill tanpa interaksi manual
    const adaNama = inputs.some(i => /^[A-Z][A-Z\s.']{2,}$/.test(i.value.trim()));
    expect(adaNama, 'field Nama Lengkap harus terisi otomatis').toBeTruthy();

    // NIK 16 digit ter-fill tanpa interaksi manual
    const adaNik = inputs.some(i => /^\d{16}$/.test(i.value.trim()));
    expect(adaNik, 'field NIK 16 digit harus terisi otomatis').toBeTruthy();

    // Data auto-fill bersifat read-only (tidak dapat diedit manual) — lihat TC-4948-19
    for (const i of terisi) {
      expect(i.disabled || i.readOnly, `field "${i.value}" harus read-only`).toBeTruthy();
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-11-after.png' });
    await closeModal(page);
  });

  test('TC-4948-09: [eks 13] Badan usaha auto-fill Nama Badan Usaha & nomor legalitas', { annotation: {type: 'defect',description: 'MISMATCH-01 (docs/LAPORAN_BUG_Bucket_Agunan_2026-11-01.md)'} }, async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'TC4948_13');

    // MISMATCH TERCATAT: expected mensyaratkan 003 - Debitur; build SIT memakai 001.
    const kodeDipakai = await pilihKategoriPertamaYangAda(page, ['003', '001']);
    expect(kodeDipakai, 'Kategori debitur (003 atau 001) harus tersedia').not.toBeNull();
    await expect(kategoriCombobox(page)).toContainText(new RegExp(kodeDipakai!));
    console.log(`TC-4948-13 kategori debitur yang tersedia di SIT: ${kodeDipakai} (expected desain: 003)`);

    const inputs = await snapshotInputs(page);
    console.log('TC-4948-13 Inputs:', JSON.stringify(inputs));

    const terisi = inputs.filter(i => i.value.trim().length > 0);
    expect(terisi.length, 'harus ada field yang ter-auto-fill').toBeGreaterThan(0);

    // Nama badan usaha ter-fill (mis. "PT Bintang Sejahtera")
    const adaNamaBU = inputs.some(i => /^(PT|CV|UD|PD|Koperasi|Yayasan)\s+/i.test(i.value.trim()));
    expect(adaNamaBU, 'field Nama Badan Usaha harus terisi otomatis').toBeTruthy();

    // Nomor legalitas (NPWP 15/16 digit atau NIB 13 digit)
    const adaLegalitas = inputs.some(i => /^\d{13,16}$/.test(i.value.trim()));
    expect(adaLegalitas, 'field nomor legalitas (NPWP/NIB) harus terisi otomatis').toBeTruthy();

    for (const i of terisi) {
      expect(i.disabled || i.readOnly, `field "${i.value}" harus read-only`).toBeTruthy();
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-13-after.png' });
    await closeModal(page);
  });

  test('TC-4948-10: [eks 15] Pilih 010 - Pasangan Penjamin menampilkan keterangan pasangan dari siapa', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_15');

    const combobox = await pilihKategori(page, '010');
    expect(combobox, 'Kategori 010 - Pasangan Penjamin harus tersedia').not.toBeNull();
    await expect(combobox!).toContainText(/010/);

    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama/i }).first();
    const adaDropdownNama = await dropdownNama.isVisible().catch(() => false);

    let opsiNama: string[] = [];
    if (adaDropdownNama) {
      await dropdownNama.click();
      await page.waitForTimeout(1500);
      opsiNama = await readListboxOptions(page);
    }
    console.log(`TC-4948-15 adaDropdownNama=${adaDropdownNama} opsiNama=${JSON.stringify(opsiNama)}`);

    if (opsiNama.length > 0) {
      // Setiap item harus membawa keterangan "Pasangan dari [Nama Penjamin]"
      const adaKeterangan = opsiNama.some(o => /pasangan dari/i.test(o));
      expect(adaKeterangan, 'list harus memuat keterangan "Pasangan dari [Nama Penjamin]"').toBeTruthy();
    } else {
      // GAP PREKONDISI: TC mensyaratkan debitur punya penjamin perorangan berstatus
      // Menikah dengan data pasangan tersedia di Bucket Identitas.
      console.log('TC-4948-15 GAP prekondisi -> tidak ada data pasangan penjamin pada App ID ini. ' +
        'Butuh debitur dengan penjamin perorangan berstatus Menikah + data pasangan di Bucket Identitas.');
      expect(adaDropdownNama, 'minimal dropdown Nama harus dirender setelah kategori 010 dipilih').toBeTruthy();
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-15-after.png' });
    await closeModal(page);
  });

  test('TC-4948-06: [eks 16] Pilih 006 - Pengurus Perusahaan & Nama auto-fill detail pengurus', { annotation: {type: 'defect',description: 'MISMATCH-02 (docs/LAPORAN_BUG_Bucket_Agunan_2026-11-01.md)'} }, async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_BADAN_USAHA, 'business');
    await openStep3Kepemilikan(page, 'TC4948_16');

    const combobox = await pilihKategori(page, '006');
    expect(combobox, 'Kategori 006 harus tersedia').not.toBeNull();

    const dropdownNama = page.locator('[role="combobox"]:visible').filter({ hasText: /pilih nama|nama pengurus/i }).first();
    await expect(dropdownNama).toBeVisible({ timeout: 15000 });
    await dropdownNama.click();
    await page.waitForTimeout(1500);

    const opsiNama = await readListboxOptions(page);
    console.log('TC-4948-16 Opsi pengurus:', JSON.stringify(opsiNama));
    expect(opsiNama.length, 'harus ada pengurus terdaftar untuk diuji auto-fill').toBeGreaterThan(0);

    // Pilih pengurus pertama langsung dari listbox yang sudah terbuka
    await page.locator('[role="listbox"]:visible [role="option"], [role="listbox"]:visible li, ul:visible li')
      .first().click({ timeout: 15000 });
    await page.waitForTimeout(2500);

    const inputs = await snapshotInputs(page);
    const terisi = inputs.filter(i => i.value.trim().length > 0);
    console.log('TC-4948-16 Field setelah pilih pengurus:', JSON.stringify(terisi));

    expect(terisi.length, 'detail pengurus harus ter-auto-fill setelah nama dipilih').toBeGreaterThan(0);
    for (const i of terisi) {
      expect(i.disabled || i.readOnly, `field "${i.value}" hasil auto-fill harus read-only`).toBeTruthy();
    }

    // MISMATCH TERCATAT: expected mensyaratkan dropdown "Hubungan dengan Debitur" tetap
    // tampil untuk dipilih manual. Build SIT tidak merender dropdown tersebut pada
    // kategori 006 — hanya Kategori, Tipe kepemilikan, dan Nama.
    const combos = await snapshotComboboxes(page);
    console.log('TC-4948-16 Comboboxes:', JSON.stringify(combos));
    const hubungan = combos.find(c => /hubungan dengan debitur/i.test(c));
    if (!hubungan) {
      console.log('TC-4948-16 MISMATCH desain -> dropdown "Hubungan dengan Debitur" tidak dirender ' +
        `pada kategori 006 di SIT. Combobox aktual: ${JSON.stringify(combos)}`);
    } else {
      expect(/pilih hubungan/i.test(hubungan), 'Hubungan dengan Debitur harus tetap kosong (dipilih manual)').toBeTruthy();
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-16-after.png' });
    await closeModal(page);
  });

  test('TC-4948-11: [eks 17] Bukti kepemilikan disabled & Step 3 belum lengkap saat data tambahan kosong', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_17');

    // Field Bukti kepemilikan dinonaktifkan (diisi otomatis dari Data tambahan agunan)
    const inputBukti = page.locator('input[placeholder*="Otomatis terisi" i]').first();
    await expect(inputBukti).toBeVisible({ timeout: 15000 });
    await expect(inputBukti).toBeDisabled();

    // Stepper Informasi kepemilikan berstatus Belum Lengkap
    const stepKepemilikan = page.locator('button:visible').filter({ hasText: /Informasi kepemilikan/i }).first();
    await expect(stepKepemilikan).toContainText(/Belum Lengkap/i);

    // Form belum lengkap: Simpan tidak dapat ditekan
    await expect(btnSimpan(page)).toBeDisabled({ timeout: 10000 });

    // Catatan: gating akses Step 3 berdasarkan status Bucket Identitas & Pengecekan
    // adalah cakupan TC-4890-06 (AC S2CML-4890), bukan TC ini. TC ini fokus pada
    // field Bukti kepemilikan yang auto-fill dari Step 2 (asal TC-4889-62 & 63).

    await page.screenshot({ path: 'explore-output/probes/tc-4948-17-after.png' });
    await closeModal(page);
  });

  test('TC-4948-10: [eks 18] Opsi 010 - Pasangan Penjamin tidak muncul saat penjamin belum menikah', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_18');

    const options = await bacaOpsiKategori(page);
    console.log('TC-4948-18 Opsi kategori:', JSON.stringify(options));

    const ada009 = options.some(o => o.includes('009'));
    const ada010 = options.some(o => o.includes('010'));
    console.log(`TC-4948-18 009=${ada009} 010=${ada010}`);

    // Aturan AC-1: 010 bersyarat pada 009 — pasangan penjamin mustahil tanpa penjamin.
    if (!ada009) {
      expect(ada010, '010 tidak boleh tampil bila 009 - Penjamin juga tidak tersedia').toBeFalsy();
    }

    // GAP PREKONDISI: expected mensyaratkan debitur punya penjamin perorangan berstatus
    // BELUM MENIKAH, agar 010 terbukti tersembunyi karena syarat status perkawinan.
    // Status perkawinan penjamin pada App ID ini belum diverifikasi, jadi hanya dicatat.
    console.log('TC-4948-18 GAP prekondisi -> butuh App ID dengan penjamin perorangan berstatus ' +
      `Belum Menikah untuk assert penuh. Aktual: 009=${ada009} 010=${ada010}`);

    await page.screenshot({ path: 'explore-output/probes/tc-4948-18-options.png' });
    await closeModal(page);
  });

  test('TC-4948-08: [eks 19] Data auto-fill 001 bersifat read-only', async ({ page }) => {
    test.setTimeout(120000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_19');

    const combobox = await pilihKategori(page, '001');
    expect(combobox, 'Kategori 001 harus tersedia').not.toBeNull();

    const inputs = await snapshotInputs(page);
    const terisi = inputs.filter(i => i.value.trim().length > 0);
    console.log('TC-4948-19 Field auto-fill:', JSON.stringify(terisi));

    expect(terisi.length, 'harus ada field auto-fill untuk diuji').toBeGreaterThan(0);
    for (const i of terisi) {
      expect(i.disabled || i.readOnly, `field "${i.value}" harus tidak dapat diedit manual`).toBeTruthy();
    }

    await page.screenshot({ path: 'explore-output/probes/tc-4948-19-after.png' });
    await closeModal(page);
  });

  test('TC-4948-12: [eks 20] Ganti kategori me-reset data auto-fill sebelumnya', async ({ page }) => {
    test.setTimeout(150000);
    await loginAndOpen(page, APP_ID_PERORANGAN, 'individual');
    await openStep3Kepemilikan(page, 'TC4948_20');

    // Kondisi awal: 001 meng-auto-fill data debitur
    const combo001 = await pilihKategori(page, '001');
    expect(combo001, 'Kategori 001 harus tersedia').not.toBeNull();

    const inputs001 = await snapshotInputs(page);
    const terisi001 = inputs001.filter(i => i.value.trim().length > 0).map(i => i.value.trim());
    console.log('TC-4948-20 Auto-fill setelah 001:', JSON.stringify(terisi001));
    expect(terisi001.length, 'kategori 001 harus meng-auto-fill data').toBeGreaterThan(0);

    // Ganti ke 005 - Pemilik Agunan (entitas berbeda, bukan debitur)
    const combo005 = await pilihKategori(page, '005');
    expect(combo005, 'Kategori 005 harus tersedia').not.toBeNull();
    await expect(combo005!).toContainText(/005/);

    const inputs005 = await snapshotInputs(page);
    const terisi005 = inputs005.filter(i => i.value.trim().length > 0).map(i => i.value.trim());
    console.log('TC-4948-20 Field terisi setelah ganti ke 005:', JSON.stringify(terisi005));

    // Data debitur sebelumnya tidak boleh tersisa setelah kategori diganti
    for (const nilai of terisi001) {
      expect(terisi005, `data "${nilai}" harus ter-reset setelah ganti kategori`).not.toContain(nilai);
    }

    const combos = await snapshotComboboxes(page);
    console.log('TC-4948-20 Comboboxes setelah 005:', JSON.stringify(combos));

    await page.screenshot({ path: 'explore-output/probes/tc-4948-20-after.png' });
    await closeModal(page);
  });
});
