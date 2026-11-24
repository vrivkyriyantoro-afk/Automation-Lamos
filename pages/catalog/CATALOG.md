# Katalog Locator Komponen LAMOS

> DIGENERATE oleh `scripts/generators/build-catalog.js` dari `pages/buckets/**`. Jangan edit manual.
> Sumber kebenaran = page object (`*.ts`). Ubah di sana, lalu jalankan `npm run catalog:build`.

## Cara pakai untuk menyusun test case

- Cari bucket, lalu section, lalu field. Kolom **Wajib** (tanda `*` di UI), **Tipe**, dan **Label** dipakai untuk menulis skenario (positif, negatif, boundary, wajib isi).
- Kolom **Locator** adalah selector yang dipakai otomatisasi. Jangan menulis selector sendiri di spec; pakai getter di kolom **Properti** pada class-nya.
- `{i}` pada kunci = indeks baris (0-based) untuk field berulang (tombol "Tambah baris").

## Rumus locator per kontrol

| Kontrol | Tipe | Locator |
|---|---|---|
| `TextInput` | text | `input[name="{k}"], textarea[name="{k}"]` |
| `CurrencyInput` | currency | `input[name="{k}"]  (ketik digit, format ribuan otomatis)` |
| `DateInput` | date | `input[name="{k}"]  (format "DD MMM YYYY", mis. "01 Jan 1990")` |
| `Dropdown` | dropdown | `[role="combobox"][id^="{k}-r"]  (opsi: #<id>-listbox li button)` |
| `RadioGroup` | radio | `getByRole("radiogroup", { name: "{k}" })` |
| `FileUpload` | file | `input[type="file"][id="{k}"]` |
| `Checkbox` | checkbox | `[data-testid="checkbox-container"] berlabel "{k}"` |
| `RichTextEditor` | richtext | `[contenteditable="true"][id="{k}"]` |
| `CriteriaTable` | table | `table[data-testid="table"]` |

## analisa-keuangan

### AnalisaKebutuhanWorkingInvestmentNeedsRow  `AnalisaKebutuhanWorkingInvestmentNeedsRow` (row)

File: `pages/buckets/analisa-keuangan/AnalisaKebutuhanSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `businessName` | businessName | ya | text | `workingInvestmentNeeds.{i}.businessName` | WI need |
| `workingInvestmentBeforeFinancingAccountReceivable` | workingInvestment.beforeFinancing.accountReceivable | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.accountReceivable` | WI need satuan: Rp |
| `workingInvestmentAfterFinancingAccountReceivable` | workingInvestment.afterFinancing.accountReceivable | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.accountReceivable` | WI need satuan: Rp |
| `workingInvestmentBeforeFinancingInventory` | workingInvestment.beforeFinancing.inventory | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.inventory` | WI need satuan: Rp |
| `workingInvestmentAfterFinancingInventory` | workingInvestment.afterFinancing.inventory | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.inventory` | WI need satuan: Rp |
| `workingInvestmentBeforeFinancingAccountPayable` | workingInvestment.beforeFinancing.accountPayable | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.accountPayable` | WI need satuan: Rp |
| `workingInvestmentAfterFinancingAccountPayable` | workingInvestment.afterFinancing.accountPayable | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.accountPayable` | WI need satuan: Rp |
| `workingInvestmentBeforeFinancingAccruedExpense` | workingInvestment.beforeFinancing.accruedExpense | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.accruedExpense` | WI need satuan: Rp |
| `workingInvestmentAfterFinancingAccruedExpense` | workingInvestment.afterFinancing.accruedExpense | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.accruedExpense` | WI need satuan: Rp |
| `workingInvestmentBeforeFinancingWiNeedAmount` | workingInvestment.beforeFinancing.wiNeedAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.wiNeedAmount` | WI need (disabled saat explore / auto-fill) satuan: Rp |
| `workingInvestmentAfterFinancingWiNeedAmount` | workingInvestment.afterFinancing.wiNeedAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.wiNeedAmount` | WI need (disabled saat explore / auto-fill) satuan: Rp |
| `workingInvestmentBeforeFinancingTotalBankFinancingAmount` | workingInvestment.beforeFinancing.totalBankFinancingAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.totalBankFinancingAmount` | WI need satuan: Rp |
| `workingInvestmentAfterFinancingTotalBankFinancingAmount` | workingInvestment.afterFinancing.totalBankFinancingAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.totalBankFinancingAmount` | WI need satuan: Rp |
| `workingInvestmentBeforeFinancingTotalBankFinancingPercentage` | workingInvestment.beforeFinancing.totalBankFinancingPercentage | ya | text | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.totalBankFinancingPercentage` | WI need (disabled saat explore / auto-fill) |
| `workingInvestmentAfterFinancingTotalBankFinancingPercentage` | workingInvestment.afterFinancing.totalBankFinancingPercentage | ya | text | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.totalBankFinancingPercentage` | WI need (disabled saat explore / auto-fill) |
| `workingInvestmentBeforeFinancingSelfFinancingAmount` | workingInvestment.beforeFinancing.selfFinancingAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.selfFinancingAmount` | WI need (disabled saat explore / auto-fill) satuan: Rp |
| `workingInvestmentAfterFinancingSelfFinancingAmount` | workingInvestment.afterFinancing.selfFinancingAmount | ya | currency | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.selfFinancingAmount` | WI need (disabled saat explore / auto-fill) satuan: Rp |
| `workingInvestmentBeforeFinancingSelfFinancingPercentage` | workingInvestment.beforeFinancing.selfFinancingPercentage | ya | text | `workingInvestmentNeeds.{i}.workingInvestment.beforeFinancing.selfFinancingPercentage` | WI need (disabled saat explore / auto-fill) |
| `workingInvestmentAfterFinancingSelfFinancingPercentage` | workingInvestment.afterFinancing.selfFinancingPercentage | ya | text | `workingInvestmentNeeds.{i}.workingInvestment.afterFinancing.selfFinancingPercentage` | WI need (disabled saat explore / auto-fill) |
| `wiNeedAnalysis` | Analisa WI need |  | text | `workingInvestmentNeeds.{i}.wiNeedAnalysis` | WI need |

### Analisa keuangan & kemampuan bayar  `AnalisaKeuanganKemampuanBayarSection` (section)

File: `pages/buckets/analisa-keuangan/AnalisaKeuanganKemampuanBayarSection.ts`  | bucket id: `analisa_keuangan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `businessName` | Nama usaha | ya | text | `businessName` |  |
| `profitAndLossBeforeFinancingSales` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.sales` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingSales` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.sales` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingCogs` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.cogs` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingCogs` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.cogs` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingGrossProfit` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.grossProfit` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossAfterFinancingGrossProfit` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.grossProfit` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossBeforeFinancingOperatingExpense` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.operatingExpense` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingOperatingExpense` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.operatingExpense` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingOperatingIncome` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.operatingIncome` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossAfterFinancingOperatingIncome` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.operatingIncome` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossBeforeFinancingTotalInterestAndInstallment` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.totalInterestAndInstallment` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingTotalInterestAndInstallment` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.totalInterestAndInstallment` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingOtherExpense` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.otherExpense` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingOtherExpense` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.otherExpense` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingOtherIncome` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.otherIncome` | Laba rugi* satuan: Rp |
| `profitAndLossAfterFinancingOtherIncome` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.otherIncome` | Laba rugi* satuan: Rp |
| `profitAndLossBeforeFinancingEarningBeforeTax` | Nama usaha | ya | text | `profitAndLoss.beforeFinancing.earningBeforeTax` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossAfterFinancingEarningBeforeTax` | Nama usaha | ya | text | `profitAndLoss.afterFinancing.earningBeforeTax` | Laba rugi* (disabled saat explore / auto-fill) satuan: Rp |
| `profitAndLossAnalysis` | Analisa laba rugi | ya | text | `profitAndLossAnalysis` | Laba rugi* |
| `repaymentCapacityBeforeFinancingTotalInterestAndInstallment` | Nama usaha | ya | text | `repaymentCapacity.beforeFinancing.totalInterestAndInstallment` | RPC* (disabled saat explore / auto-fill) satuan: Rp |
| `repaymentCapacityAfterFinancingTotalInterestAndInstallment` | Nama usaha | ya | text | `repaymentCapacity.afterFinancing.totalInterestAndInstallment` | RPC* (disabled saat explore / auto-fill) satuan: Rp |
| `repaymentCapacityBeforeFinancingOperatingIncome` | Nama usaha | ya | text | `repaymentCapacity.beforeFinancing.operatingIncome` | RPC* (disabled saat explore / auto-fill) satuan: Rp |
| `repaymentCapacityAfterFinancingOperatingIncome` | Nama usaha | ya | text | `repaymentCapacity.afterFinancing.operatingIncome` | RPC* (disabled saat explore / auto-fill) satuan: Rp |
| `repaymentCapacityBeforeFinancingRpcRatio` | Nama usaha | ya | text | `repaymentCapacity.beforeFinancing.rpcRatio` | RPC* (disabled saat explore / auto-fill) |
| `repaymentCapacityAfterFinancingRpcRatio` | Nama usaha | ya | text | `repaymentCapacity.afterFinancing.rpcRatio` | RPC* (disabled saat explore / auto-fill) |
| `repaymentCapacityBeforeFinancingDscr` | Nama usaha | ya | text | `repaymentCapacity.beforeFinancing.dscr` | RPC* (disabled saat explore / auto-fill) |
| `repaymentCapacityAfterFinancingDscr` | Nama usaha | ya | text | `repaymentCapacity.afterFinancing.dscr` | RPC* (disabled saat explore / auto-fill) |
| `rpcAnalysis` | Analisa RPC | ya | text | `rpcAnalysis` | RPC* |

### AnalisaMutasiRekeningStatementDetailsRow  `AnalisaMutasiRekeningStatementDetailsRow` (row)

File: `pages/buckets/analisa-keuangan/AnalisaMutasiRekeningSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `bankName` | bankName | ya | text | `mutasiRekening.0.statementDetails.{i}.bankName` | Mutasi rekening* |
| `accountNumber` | accountNumber | ya | text | `mutasiRekening.0.statementDetails.{i}.accountNumber` | Mutasi rekening* |
| `averageDebitAmount` | averageDebitAmount | ya | text | `mutasiRekening.0.statementDetails.{i}.averageDebitAmount` | Mutasi rekening* |
| `averageDebitFrequency` | averageDebitFrequency | ya | text | `mutasiRekening.0.statementDetails.{i}.averageDebitFrequency` | Mutasi rekening* |
| `averageCreditAmount` | averageCreditAmount | ya | text | `mutasiRekening.0.statementDetails.{i}.averageCreditAmount` | Mutasi rekening* |
| `averageCreditFrequency` | averageCreditFrequency | ya | text | `mutasiRekening.0.statementDetails.{i}.averageCreditFrequency` | Mutasi rekening* |
| `averageBalance` | averageBalance | ya | text | `mutasiRekening.0.statementDetails.{i}.averageBalance` | Mutasi rekening* |

### AnalisaMutasiRekeningMutasiRekeningRow  `AnalisaMutasiRekeningMutasiRekeningRow` (row)

File: `pages/buckets/analisa-keuangan/AnalisaMutasiRekeningSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `businessName` | Nama usaha | ya | text | `mutasiRekening.{i}.businessName` |  |
| `analysisSummary` | Analisa mutasi rekening | ya | text | `mutasiRekening.{i}.analysisSummary` | Mutasi rekening* |

### Neraca  `NeracaSection` (section)

File: `pages/buckets/analisa-keuangan/NeracaSection.ts`  | bucket id: `analisa_keuangan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `name` | Nama usaha | ya | text | `name` |  |
| `cashAndBank` | Nama usaha* [text] satuan: Rp |  | text | `cash_and_bank` |  |
| `totalCurrentAssets` | Nama usaha* [text] satuan: Rp |  | text | `total_current_assets` |  |
| `totalInventories` | Nama usaha* [text] satuan: Rp |  | text | `total_inventories` |  |
| `totalAssets` | Nama usaha* [text] satuan: Rp |  | text | `total_assets` |  |
| `totalCurrentLiabilities` | Nama usaha* [text] satuan: Rp |  | text | `total_current_liabilities` |  |
| `totalDebt` | Nama usaha* [text] satuan: Rp |  | text | `total_debt` |  |
| `totalEquity` | Nama usaha* [text] satuan: Rp |  | text | `total_equity` |  |

## catatan-anda

### Catatan Anda  `CatatanAndaSection` (section)

File: `pages/buckets/catatan-anda/CatatanAndaSection.ts`  | bucket id: `catatan_anda`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `catatanPengajuan` | Catatan pengajuan | ya | richtext | `rich-text-editor` |  |
| `attachmentFiles` | Lampiran (opsional) [file] accept: .pdf,.jpg,.jpeg,.png |  | file | `attachmentFiles` |  |

## covenant-tbo

### Covenant  `CovenantSection` (section)

File: `pages/buckets/covenant-tbo/CovenantSection.ts`  | bucket id: `covenant_tbo`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `covenant` | Covenant | ya | richtext | `rich-text-editor` | Lihat template covenant di sini |

## data-usaha

### AspekUsahaListSupplierRow  `AspekUsahaListSupplierRow` (row)

File: `pages/buckets/data-usaha/AspekUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `name` | name |  | text | `listSupplier.{i}.name` | List supplier |
| `area` | area |  | text | `listSupplier.{i}.area` | List supplier |
| `supplierType` | supplierType |  | dropdown | `supplierType-{i}` | List supplier |

### AspekUsahaJenisRow  `AspekUsahaJenisRow` (row)

File: `pages/buckets/data-usaha/AspekUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `jenis` | Jenis resiko | ya | dropdown | `jenis-{i}` | List supplier |

### AspekUsahaTingkatRow  `AspekUsahaTingkatRow` (row)

File: `pages/buckets/data-usaha/AspekUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `tingkat` | Tingkat resiko | ya | dropdown | `tingkat-{i}` | List supplier |

### AspekUsahaAnalisaResikoRow  `AspekUsahaAnalisaResikoRow` (row)

File: `pages/buckets/data-usaha/AspekUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `uraianDetail` | Uraian detail | ya | text | `analisaResiko.{i}.uraianDetail` | List supplier |
| `mitigasi` | Mitigasi resiko | ya | text | `analisaResiko.{i}.mitigasi` | List supplier |

### Aspek Usaha  `AspekUsahaSection` (section)

File: `pages/buckets/data-usaha/AspekUsahaSection.ts`  | bucket id: `data_usaha`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `name` | Nama Usaha | ya | text | `name` |  |
| `category` | Kategori usaha | ya | dropdown | `category` |  |
| `jenisProduk` | Jenis produk/jasa | ya | dropdown | `jenisProduk` |  |
| `statusUsahaSewa` | Status usaha sewa | ya | radio | `Status usaha sewa` |  |
| `caraPemesananSupplier` | Cara pemesanan |  | dropdown | `caraPemesananSupplier` |  |
| `caraPembayaranSupplier` | Cara pembayaran |  | dropdown | `caraPembayaranSupplier` |  |
| `jangkaCepatSupplier` | Paling cepat [text] satuan: hari |  | text | `jangkaCepatSupplier` |  |
| `jangkaLamaSupplier` | Paling lama [text] satuan: hari |  | text | `jangkaLamaSupplier` |  |
| `cashSupplier` | Cash [text] satuan: % |  | text | `cashSupplier` |  |
| `tempoSupplier` | Tempo [text] satuan: % |  | text | `tempoSupplier` |  |
| `skemaPembelianSupplier` | Skema pembelian ke supplier |  | text | `skemaPembelianSupplier` |  |
| `inventoryDays` | Inventory days on hand |  | text | `inventoryDays` | List supplier satuan: hari |
| `detailInventory` | Detail inventory |  | text | `detailInventory` | List supplier |
| `tipeCustomerDebitur` | Tipe customer debitur | ya | dropdown | `tipeCustomerDebitur` | List supplier |
| `jumlahCustomer` | Jumlah customer | ya | text | `jumlahCustomer` | List supplier |
| `penjualanCustomer` | Penjualan customer | ya | dropdown | `penjualanCustomer` | List supplier |
| `caraPembayaranCustomer` | Cara pembayaran | ya | dropdown | `caraPembayaranCustomer` | List supplier |
| `jangkaCepatCustomer` | Paling cepat | ya | text | `jangkaCepatCustomer` | List supplier satuan: hari |
| `jangkaLamaCustomer` | Paling lama | ya | text | `jangkaLamaCustomer` | List supplier satuan: hari |
| `cashCustomer` | Cash | ya | text | `cashCustomer` | List supplier satuan: % |
| `tempoCustomer` | Tempo | ya | text | `tempoCustomer` | List supplier satuan: % |
| `skemaPenjualanCustomer` | Skema penjualan ke customer | ya | text | `skemaPenjualanCustomer` | List supplier |
| `apakahAdaAspekProduksi` | Apakah ada aspek produksi | ya | radio | `Apakah ada aspek produksi` | List supplier |
| `sistemProduksiProduk` | Sistem produksi produk |  | dropdown | `sistemProduksiProduk` | List supplier |
| `namaBrand` | Nama brand/merk dagang debitur |  | text | `namaBrand` | List supplier |
| `jenisBahanBaku` | Jenis bahan baku |  | dropdown | `jenisBahanBaku` | List supplier |
| `adaBarangPengganti` | Ada barang pengganti |  | radio | `Ada barang pengganti` | List supplier |
| `ketersediaanBahanBaku` | Ketersediaan sumber bahan baku |  | text | `ketersediaanBahanBaku` | List supplier |
| `adaArmada` | Ada armada | ya | radio | `Ada armada` | List supplier |
| `memilikiCabang` | Memiliki cabang? | ya | radio | `Memiliki cabang?` | List supplier |
| `riwayatPerkembanganUsaha` | Riwayat perkembangan usaha | ya | text | `riwayatPerkembanganUsaha` | List supplier |
| `prospekUsahaMendatang` | Prospek usaha yang akan datang | ya | dropdown | `prospekUsahaMendatang` | List supplier |
| `rencanaPengembanganMendatang` | Rencana pengembangan usaha ke depan | ya | dropdown | `rencanaPengembanganMendatang` | List supplier |
| `detailProspekUsaha` | Detail prospek usaha | ya | text | `detailProspekUsaha` | List supplier |
| `detailModusOperandi` | Detail modus operandi | ya | text | `detailModusOperandi` | List supplier |
| `situasiMarket` | Situasi market |  | dropdown | `situasiMarket` | List supplier |
| `terdapatPeakLowSeason` | Terdapat peak/low season |  | radio | `Terdapat peak/low season` | List supplier |
| `kompetitorKondisiPasar` | Kompetitor dan kondisi pasar |  | dropdown | `kompetitorKondisiPasar` | List supplier |
| `kompetitorTerbesar` | Kompetitor terbesar usaha debitur |  | text | `kompetitorTerbesar` | List supplier |
| `kelebihanUsahaDebiturKompetitor` | Kelebihan usaha debitur dibanding kompetitor sejenis |  | text | `kelebihanUsahaDebiturKompetitor` | List supplier |
| `strategiHadapiKompetitor` | Strategi menghadapi kompetitor (usaha sejenis) | ya | text | `strategiHadapiKompetitor` | List supplier |
| `pengaruhKebijakan` | Pengaruh kebijakan sosial, ekonomi, dan politik ke usaha |  | dropdown | `pengaruhKebijakan` | List supplier |
| `adaKontrakProject` | Ada kontrak/project? | ya | radio | `Ada kontrak/project?` | List supplier |

### InformasiBadanUsahaDataUsahaRow  `InformasiBadanUsahaDataUsahaRow` (row)

File: `pages/buckets/data-usaha/InformasiBadanUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `name` | Nama usaha | ya | text | `usahaArray.0.dataUsaha.{i}.name` | Legalitas Usaha |
| `picName` | Nama PIC | ya | text | `usahaArray.0.dataUsaha.{i}.picName` | Legalitas Usaha |
| `kategori` | Kategori usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.kategori` | Legalitas Usaha |
| `jenisTempat` | Jenis tempat usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.jenisTempat` | Legalitas Usaha |
| `bidang` | Bidang usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.bidang` | Legalitas Usaha |
| `segmen` | Segmen usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.segmen` | Legalitas Usaha |
| `sektorEkonomi` | Sektor ekonomi | ya | dropdown | `usahaArray.0.dataUsaha.{i}.sektorEkonomi` | Legalitas Usaha 80+ opsi, contoh: RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL S.D. TIPE 21, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 21 S.D. 70, RUMAH TANGGA UNTUK PEMILIKAN RUMAH TINGGAL TIPE DIATAS 70 |
| `monthlyBusinessCapitalInvested` | Modal usaha per bulan | ya | text | `usahaArray.0.dataUsaha.{i}.monthlyBusinessCapitalInvested` | Legalitas Usaha satuan: Rp |
| `monthlyBusinessRevenue` | Omset usaha per bulan | ya | text | `usahaArray.0.dataUsaha.{i}.monthlyBusinessRevenue` | Legalitas Usaha satuan: Rp |
| `businessStartDate` | Tanggal mulai usaha | ya | date | `usahaArray.0.dataUsaha.{i}.businessStartDate` | Legalitas Usaha format "DD MMM YYYY", mis. "01 Jan 1990" |
| `businessDurationOperation` | Lama usaha | ya | text | `usahaArray.0.dataUsaha.{i}.businessDurationOperation` | Legalitas Usaha satuan: bulan |
| `totalEmployee` | Jumlah pekerja | ya | text | `usahaArray.0.dataUsaha.{i}.totalEmployee` | Legalitas Usaha |
| `businessOwnershipStatus` | Kepemilikan usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.businessOwnershipStatus` | Legalitas Usaha |
| `physicalConditionPremises` | Kondisi tempat usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.physicalConditionPremises` | Legalitas Usaha |
| `accessibilityBusinessLocation` | Akses tempat usaha | ya | dropdown | `usahaArray.0.dataUsaha.{i}.accessibilityBusinessLocation` | Legalitas Usaha |
| `totalSupplier` | Jumlah supplier | ya | text | `usahaArray.0.dataUsaha.{i}.totalSupplier` | Legalitas Usaha |
| `durationWithSupplier` | Lama hubungan dengan supplier | ya | text | `usahaArray.0.dataUsaha.{i}.durationWithSupplier` | Legalitas Usaha satuan: bulan |

### InformasiBadanUsahaUsahaArrayRow  `InformasiBadanUsahaUsahaArrayRow` (row)

File: `pages/buckets/data-usaha/InformasiBadanUsahaSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `bentukUsaha` | Bentuk Usaha | ya | dropdown | `usahaArray.{i}.bentukUsaha` | Informasi bentuk usaha |
| `nomorIzinBerusaha` | Nomor Izin Berusaha (NIB) | ya | text | `usahaArray.{i}.nomorIzinBerusaha` | Legalitas Usaha |

### Informasi Badan Usaha  `InformasiBadanUsahaSection` (section)

File: `pages/buckets/data-usaha/InformasiBadanUsahaSection.ts`  | bucket id: `data_usaha`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `adaIzinLainnya` | Ada Izin Lainnya? | ya | radio | `Ada Izin Lainnya?` | Legalitas Usaha |
| `apakahLokasiUsahaTetap` | Apakah lokasi usaha tetap? | ya | radio | `Apakah lokasi usaha tetap?` | Legalitas Usaha |
| `apakahStatusUsahaSewa` | Apakah status usaha sewa? | ya | radio | `Apakah status usaha sewa?` | Legalitas Usaha |
| `tempatUsahaMemilikiParkir` | Tempat usaha memiliki parkir? | ya | radio | `Tempat usaha memiliki parkir?` | Legalitas Usaha |

### Trade checking  `TradeCheckingSection` (section)

File: `pages/buckets/data-usaha/TradeCheckingSection.ts`  | bucket id: `data_usaha`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `businessName` | Nama usaha | ya | text | `businessName` |  |
| `dateUi` | Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" |  | date | `date_ui` |  |
| `timeUi` | Tanggal dan waktu* [date] format "DD MMM YYYY", mis. "01 Jan 1990" |  | date | `time_ui` |  |
| `companyName` | Nama perusahaan | ya | text | `companyName` |  |
| `telephoneNumber` | Nomor telepon perusahaan | ya | text | `telephoneNumber` |  |
| `picName` | Nama PIC | ya | text | `picName` |  |
| `picPhoneNumber` | Nomor HP PIC | ya | text | `picPhoneNumber` |  |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjRelationship` | Hubungan dengan debitur | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_relationship` |  |
| `apakahPicMemilikiRekeningSinarmas` | Apakah PIC memiliki rekening Sinarmas? | ya | radio | `Apakah PIC memiliki rekening Sinarmas?` | Informasi rekening Sinarmas |
| `businessAddressAddress` | Alamat | ya | text | `businessAddress.address` | Alamat perusahaan |
| `businessAddressRt` | RT/RW | ya | text | `businessAddress.rt` | Alamat perusahaan |
| `businessAddressRw` | RT/RW | ya | text | `businessAddress.rw` | Alamat perusahaan |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressProvince` | Provinsi | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.province` | Alamat perusahaan opsi bergantung dropdown sebelumnya |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressCity` | Kota/kabupaten | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.city` | Alamat perusahaan opsi bergantung dropdown sebelumnya |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressDistrict` | Kecamatan | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.district` | Alamat perusahaan opsi bergantung dropdown sebelumnya |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjBusinessAddressSubdistrict` | Kelurahan | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_businessAddress.subdistrict` | Alamat perusahaan opsi bergantung dropdown sebelumnya |
| `businessAddressPostalCode` | Kode pos | ya | text | `businessAddress.postalCode` | Alamat perusahaan |
| `trxAmount` | Nilai transaksi | ya | text | `trxAmount` | Informasi transaksi |
| `f01M4Dmbb9H3Fest6Eq626Cj6WjPaymentType` | Jenis pembayaran | ya | dropdown | `01M4DMBB9H3FEST6EQ626CJ6WJ_paymentType` | Informasi transaksi |
| `top` | Term of payment (TOP) | ya | text | `top` | Informasi transaksi satuan: hari |
| `monthlyTrxVolume` | Volume transaski per bulan | ya | text | `monthlyTrxVolume` | Informasi transaksi |
| `relationshipDuration` | Lama hubungan | ya | text | `relationshipDuration` | Lain-lain satuan: bulan |
| `reference` | Referensi | ya | text | `reference` | Lain-lain |
| `adaInformasiNegatif` | Ada informasi negatif? | ya | radio | `Ada informasi negatif?` | Lain-lain |
| `otherInfo` | Informasi lainnya | ya | text | `otherInfo` | Lain-lain |

## identitas

### Data kontak darurat  `DataKontakDaruratSection` (section)

File: `pages/buckets/identitas/DataKontakDaruratSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `name` | Nama lengkap | ya | text | `name` |  |
| `relationship` | Hubungan keluarga | ya | dropdown | `relationship` |  |
| `mobileNumber` | Nomor HP | ya | text | `mobileNumber` |  |
| `telephoneNumber` | No. Telepon Rumah |  | text | `telephoneNumber` |  |
| `address` | Alamat | ya | text | `address` | Alamat tempat tinggal saat ini |
| `rt` | RT / RW | ya | text | `rt` | Alamat tempat tinggal saat ini |
| `rw` | RT / RW | ya | text | `rw` | Alamat tempat tinggal saat ini |
| `province` | Provinsi | ya | dropdown | `province` | Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya |
| `city` | Kota/kabupaten | ya | dropdown | `city` | Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya |
| `district` | Kecamatan | ya | dropdown | `district` | Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya |
| `subdistrict` | Kelurahan | ya | dropdown | `subdistrict` | Alamat tempat tinggal saat ini opsi bergantung dropdown sebelumnya |
| `postalCode` | Kode pos | ya | text | `postalCode` | Alamat tempat tinggal saat ini |

### Data pekerjaan & Keuangan  `DataPekerjaanKeuanganSection` (section)

File: `pages/buckets/identitas/DataPekerjaanKeuanganSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `job` | Pekerjaan | ya | dropdown | `job` |  |
| `companyName` | Nama perusahaan / usaha | ya | text | `companyName` |  |
| `companySector` | Bidang usaha | ya | dropdown | `companySector` |  |
| `monthOfRelatedIndustryExp` | Pengalaman di industri terkait* [text] satuan: bulan |  | text | `monthOfRelatedIndustryExp` |  |
| `companyPhoneNumber` | No. Telepon Perusahaan | ya | text | `companyPhoneNumber` |  |
| `companyDuration` | Lama bekerja/usaha* [text] satuan: bulan |  | text | `companyDuration` |  |
| `income` | Pendapatan* [currency] satuan: Rp |  | currency | `income` |  |
| `jointIncome` | Joint Income? |  | radio | `Joint Income?` |  |
| `otherIncome` | Sumber pemasukan lainnya |  | dropdown | `otherIncome` |  |
| `otherIncomeValue` | Jumlah pemasukan lainnya* [currency] satuan: Rp |  | currency | `otherIncomeValue` |  |
| `monthlyLivingCost` | Biaya hidup per bulan* [currency] satuan: Rp |  | currency | `monthlyLivingCost` |  |
| `memilikiPinjamanDiBankFintechBpr` | Memiliki pinjaman di Bank/Fintech/BPR/Multifinance? | ya | radio | `Memiliki pinjaman di Bank/Fintech/BPR/Multifinance?` |  |
| `anotherLoanNominal` | Nominal angsuran lainnya [currency] satuan: Rp |  | currency | `anotherLoanNominal` |  |
| `memilikiTabunganDiBankBpr` | Memiliki tabungan di Bank/BPR? | ya | radio | `Memiliki tabungan di Bank/BPR?` |  |
| `companyAddress` | Alamat perusahaan / usaha | ya | text | `companyAddress` | Alamat perusahaan / usaha |
| `companyRt` | RT / RW | ya | text | `companyRT` | Alamat perusahaan / usaha |
| `companyRw` | RT / RW | ya | text | `companyRW` | Alamat perusahaan / usaha |
| `companyProvinceCode` | Provinsi | ya | dropdown | `companyProvinceCode` | Alamat perusahaan / usaha |
| `companyCityCode` | Kota/kabupaten | ya | dropdown | `companyCityCode` | Alamat perusahaan / usaha |
| `companyDistrictCode` | Kecamatan | ya | dropdown | `companyDistrictCode` | Alamat perusahaan / usaha |
| `companySubDistrictCode` | Kelurahan | ya | dropdown | `companySubDistrictCode` | Alamat perusahaan / usaha |
| `companyPostalCode` | Kode pos | ya | text | `companyPostalCode` | Alamat perusahaan / usaha |

### Data Penjamin  `DataPenjaminSection` (section)

File: `pages/buckets/identitas/DataPenjaminSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `debiturMemilikiPenjamin` | Debitur memiliki penjamin? | ya | radio | `Debitur memiliki penjamin?` |  |

### Data pribadi  `DataPribadiSection` (section)

File: `pages/buckets/identitas/DataPribadiSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `identityNumber` | Nomor KTP* [text] (disabled saat explore / auto-fill) |  | text | `identityNumber` |  |
| `name` | Nama lengkap* [text] (disabled saat explore / auto-fill) |  | text | `name` |  |
| `gender` | Jenis kelamin* [dropdown] (disabled saat explore / auto-fill) |  | dropdown | `gender` |  |
| `placeOfBirth` | Tempat & tanggal lahir | ya | text | `placeOfBirth` |  |
| `dateOfBirth` | Tempat & tanggal lahir* [date] (disabled saat explore / auto-fill) format "DD MMM YYYY", mis. "01 Jan 1990" |  | date | `dateOfBirth` |  |
| `maritalStatus` | Status perkawinan | ya | dropdown | `maritalStatus` |  |
| `motherMaidenName` | Nama gadis ibu kandung | ya | text | `motherMaidenName` |  |
| `npwp` | NPWP | ya | text | `npwp` |  |
| `phoneNumber` | Nomor HP | ya | text | `phoneNumber` |  |
| `apakahDebiturMerupakanNasabahBankSinarmas` | Apakah debitur merupakan nasabah Bank Sinarmas | ya | radio | `Apakah debitur merupakan nasabah Bank Sinarmas` |  |
| `identityAddressAddress` | Alamat | ya | text | `identityAddress.address` | Alamat sesuai KTP |
| `identityAddressRt` | RT / RW | ya | text | `identityAddress.rt` | Alamat sesuai KTP |
| `identityAddressRw` | RT / RW | ya | text | `identityAddress.rw` | Alamat sesuai KTP |
| `identityAddressProvince` | Provinsi | ya | dropdown | `identityAddress.province` | Alamat sesuai KTP opsi bergantung dropdown sebelumnya |
| `identityAddressCity` | Kota/kabupaten | ya | dropdown | `identityAddress.city` | Alamat sesuai KTP opsi bergantung dropdown sebelumnya |
| `identityAddressDistrict` | Kecamatan | ya | dropdown | `identityAddress.district` | Alamat sesuai KTP opsi bergantung dropdown sebelumnya |
| `identityAddressSubdistrict` | Kelurahan | ya | dropdown | `identityAddress.subdistrict` | Alamat sesuai KTP opsi bergantung dropdown sebelumnya |
| `identityAddressPostalCode` | Kode pos | ya | text | `identityAddress.postalCode` | Alamat sesuai KTP |
| `currentAddressAddress` | Alamat | ya | text | `currentAddress.address` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) |
| `currentAddressRt` | RT / RW | ya | text | `currentAddress.rt` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) |
| `currentAddressRw` | RT / RW | ya | text | `currentAddress.rw` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) |
| `currentAddressProvince` | Provinsi | ya | dropdown | `currentAddress.province` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya |
| `currentAddressCity` | Kota/kabupaten | ya | dropdown | `currentAddress.city` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya |
| `currentAddressDistrict` | Kecamatan | ya | dropdown | `currentAddress.district` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya |
| `currentAddressSubdistrict` | Kelurahan | ya | dropdown | `currentAddress.subdistrict` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) opsi bergantung dropdown sebelumnya |
| `currentAddressPostalCode` | Kode pos | ya | text | `currentAddress.postalCode` | Alamat tempat tinggal saat ini (disabled saat explore / auto-fill) |
| `residencyStatus` | Status tempat tinggal | ya | dropdown | `residencyStatus` | Alamat tempat tinggal saat ini |
| `ktpFiles` | Foto KTP | ya | file | `ktpFiles` | Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png |
| `creditApplicationFormFiles` | Form Aplikasi Kredit | ya | file | `creditApplicationFormFiles` | Dokument terkait identitas accept: .pdf,.jpg,.jpeg,.png |

### Data pribadi tambahan  `DataPribadiTambahanSection` (section)

File: `pages/buckets/identitas/DataPribadiTambahanSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `totalRegisteredFamily` | Jumlah keluarga inti sesuai KK | ya | text | `totalRegisteredFamily` |  |
| `pisahHarta` | Pisah harta |  | radio | `Pisah harta` |  |
| `kasusPidanaPenipuan` | Kasus pidana / penipuan | ya | radio | `Kasus pidana / penipuan` |  |
| `lastEducation` | Pendidikan terakhir | ya | dropdown | `lastEducation` |  |

### Lokasi & kondisi tempat tinggal  `LokasiKondisiTempatTinggalSection` (section)

File: `pages/buckets/identitas/LokasiKondisiTempatTinggalSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `residenceLocation` | Lokasi tempat tinggal | ya | dropdown | `residenceLocation` |  |
| `residenceCondition` | Kondisi tempat tinggal | ya | dropdown | `residenceCondition` |  |
| `residenceEnvironmentCondition` | Kondisi lingkungan sekitar tempat tinggal | ya | dropdown | `residenceEnvironmentCondition` |  |

### Referensi  `ReferensiSection` (section)

File: `pages/buckets/identitas/ReferensiSection.ts`  | bucket id: `identitas_pengecekan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `type` | Tipe Referensi |  | dropdown | `type` |  |
| `telephoneNumber` | Nomor Telpon Referensi |  | text | `telephoneNumber` |  |
| `notes` | Notes referensi |  | text | `notes` |  |

## legal-risk-compliance

### Form CSA  `FormCsaSection` (section)

File: `pages/buckets/legal-risk-compliance/FormCsaSection.ts`  | bucket id: `legal_risk_compliance`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `pilihAtauSeretFileKesini` | Pilih atau seret file kesini [file] accept: .pdf,.jpg,.png,.jpeg |  | file | `` |  |

### Legal memorandum  `LegalMemorandumSection` (section)

File: `pages/buckets/legal-risk-compliance/LegalMemorandumSection.ts`  | bucket id: `legal_risk_compliance`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `pilihAtauSeretFileKesini` | Pilih atau seret file kesini [file] accept: .pdf,.jpg,.png,.jpeg |  | file | `` |  |

### Opini legal  `OpiniLegalSection` (section)

File: `pages/buckets/legal-risk-compliance/OpiniLegalSection.ts`  | bucket id: `legal_risk_compliance`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `pilihAtauSeretFileKesini` | Pilih atau seret file kesini [file] accept: .pdf,.jpg,.png,.jpeg |  | file | `` |  |

## penilaian-kelayakan

### General eligibility criteria  `GeneralEligibilityCriteriaSection` (section)

File: `pages/buckets/penilaian-kelayakan/GeneralEligibilityCriteriaSection.ts`  | bucket id: `penilaian_kelayakan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `criteria` | Tabel kriteria Pass/fail (react-select per baris) |  | table | `` |  |

### Knock-out criteria  `KnockOutCriteriaSection` (section)

File: `pages/buckets/penilaian-kelayakan/KnockOutCriteriaSection.ts`  | bucket id: `penilaian_kelayakan`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `criteria` | Tabel kriteria Pass/fail (react-select per baris) |  | table | `` |  |

## penyimpangan-pihak-terkait

### Penyimpangan dan pihak terkait  `PenyimpanganDanPihakTerkaitSection` (section)

File: `pages/buckets/penyimpangan-pihak-terkait/PenyimpanganDanPihakTerkaitSection.ts`  | bucket id: `penyimpangan_pihak_terkait`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `apakahAdaKondisiYangMemerlukanPenyimpangan` | Apakah ada kondisi yang memerlukan penyimpangan? | ya | radio | `Apakah ada kondisi yang memerlukan penyimpangan?` |  |
| `apakahDebiturTerafiliasiPihakTerkait` | Apakah debitur terafiliasi pihak terkait? | ya | radio | `Apakah debitur terafiliasi pihak terkait?` |  |
| `finalBwmkcopyWriting` | Apakah ada kondisi yang memerlukan penyimpangan?* [text] (disabled saat explore / auto-fill) |  | text | `finalBWMKCopyWriting` |  |

## struktur-kredit

### Ringkasan pengajuan  `RingkasanPengajuanSection` (section)

File: `pages/buckets/struktur-kredit/RingkasanPengajuanSection.ts`  | bucket id: `struktur_kredit`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `totalPengajuanFasilitas` | Total pengajuan fasilitas* [text] (disabled saat explore / auto-fill) satuan: Rp |  | text | `totalPengajuanFasilitas` |  |
| `totalFasilitasSaatIni` | Total fasilitas saat ini* [text] (disabled saat explore / auto-fill) satuan: Rp |  | text | `totalFasilitasSaatIni` |  |
| `totalFasilitasObligor` | Total fasilitas obligor* [text] (disabled saat explore / auto-fill) satuan: Rp |  | text | `totalFasilitasObligor` |  |
| `totalExposure` | Total exposure* [text] (disabled saat explore / auto-fill) satuan: Rp |  | text | `totalExposure` |  |

### StrukturPengajuanKreditProductsRow  `StrukturPengajuanKreditProductsRow` (row)

File: `pages/buckets/struktur-kredit/StrukturPengajuanKreditSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `product` | Jenis fasilitas | ya | dropdown | `products.{i}.product` |  |

### StrukturPengajuanKreditFacilityRow  `StrukturPengajuanKreditFacilityRow` (row)

File: `pages/buckets/struktur-kredit/StrukturPengajuanKreditSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `facilityType` | Jenis fasilitas | ya | dropdown | `products.0.facility.{i}.facilityType` |  |
| `submissionType` | Jenis pengajuan | ya | dropdown | `products.0.facility.{i}.submissionType` |  |
| `plafon` | Pengajuan plafon* [text] satuan: Rp |  | text | `products.0.facility.{i}.plafon` |  |
| `tenorMonths` | Periode pinjaman (dalam bulan) | ya | text | `products.0.facility.{i}.tenorMonths` |  |
| `usagePurpose` | Tujuan penggunaan | ya | dropdown | `products.0.facility.{i}.usagePurpose` |  |
| `usageDescription` | Keterangan tujuan | ya | text | `products.0.facility.{i}.usageDescription` |  |

### StrukturPengajuanKreditInterestSchemaRow  `StrukturPengajuanKreditInterestSchemaRow` (row)

File: `pages/buckets/struktur-kredit/StrukturPengajuanKreditSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `effectiveRatePa` | effectiveRatePA | ya | text | `products.0.facility.0.interestSchema.{i}.effectiveRatePA` |  |
| `flateRatePa` | flateRatePA | ya | text | `products.0.facility.0.interestSchema.{i}.flateRatePA` |  |

### StrukturPengajuanKreditCreditFeeRow  `StrukturPengajuanKreditCreditFeeRow` (row)

File: `pages/buckets/struktur-kredit/StrukturPengajuanKreditSection.ts`

| Properti | Label | Wajib | Tipe | Kunci | Grup |
|---|---|---|---|---|---|
| `feeType` | feeType* [dropdown] (disabled saat explore / auto-fill) |  | dropdown | `products.0.facility.0.creditFee.{i}.feeType` |  |
| `nominal` | nominal* [text] satuan: Rp |  | text | `products.0.facility.0.creditFee.{i}.nominal` |  |
| `percentage` | percentage* [text] satuan: % |  | text | `products.0.facility.0.creditFee.{i}.percentage` |  |

---
Total: 34 class, 265 field.
