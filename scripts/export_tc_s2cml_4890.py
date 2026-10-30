import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('exports', exist_ok=True)

test_cases = [
    # ─── KELOMPOK 1: NAVIGASI STEPPER & INDIKATOR ────────────────────────────
    {
        'id': 'TC-4890-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi Stepper & Indikator',
        'title': 'Default Step saat Form Terbuka',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Modal form Tambah Agunan Baru terbuka',
        'steps': '1. Buka modal tambah agunan baru via tombol + Agunan Baru',
        'expected': 'Form secara default langsung membuka Step 1: Informasi Umum Agunan, dan indikatornya berstatus "Belum Lengkap".',
        'reference': 'Jira AC: Step of entry data agunan & Figma'
    },
    {
        'id': 'TC-4890-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi Stepper & Indikator',
        'title': 'Struktur 3-Step Side Navigation',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Modal form Tambah Agunan Baru terbuka',
        'steps': '1. Periksa panel navigasi vertikal di sebelah kiri modal',
        'expected': 'Menampilkan tepat 3 step berurutan:\n1. Informasi umum agunan\n2. Data tambahan agunan\n3. Informasi kepemilikan',
        'reference': 'Jira AC & S2WP-4878'
    },
    {
        'id': 'TC-4890-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi Stepper & Indikator',
        'title': 'Navigasi Paralel / Bebas Antar Step',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 1 belum diisi lengkap',
        'steps': '1. Klik step 2 (Data tambahan agunan) pada side-nav kiri\n2. Klik step 1 (Informasi umum agunan)',
        'expected': 'Sistem langsung berpindah step form sesuai yang diklik tanpa membatasi urutan pengerjaan (unrestricted order).',
        'reference': 'Jira AC: Paralel Form'
    },
    {
        'id': 'TC-4890-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi Stepper & Indikator',
        'title': 'Indikator Berubah Jadi "Lengkap"',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Berada di Step 1',
        'steps': '1. Lengkapi seluruh kolom mandatory pada Step 1 (Status, Alamat, dll.)',
        'expected': 'Indikator Step 1 di side-nav kiri otomatis berubah status dari "Belum Lengkap" menjadi "Lengkap".',
        'reference': 'Jira AC: Indicators Form'
    },
    {
        'id': 'TC-4890-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi Stepper & Indikator',
        'title': 'Form Tetap Dapat Diedit Saat Sudah "Lengkap"',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Step 1 berstatus "Lengkap"',
        'steps': '1. Pindah ke Step 2\n2. Klik kembali Step 1\n3. Ubah salah satu nilai kolom',
        'expected': 'Form tetap bisa dibuka dan diubah nilainya tanpa terkunci (read-only lock).',
        'reference': 'Jira AC: Indicators Form'
    },

    # ─── KELOMPOK 2: GATING VALIDASI BUCKET IDENTITAS (STEP 3) ────────────────
    {
        'id': 'TC-4890-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Gating Validasi Bucket Identitas',
        'title': 'Akses Step 3 saat Bucket Identitas Belum Lengkap',
        'type': 'Negative',
        'priority': 'Critical',
        'precondition': 'Tab Identitas dan Pengecekan di aplikasi berstatus "Belum Lengkap" / not locked',
        'steps': '1. Masuk ke modal Tambah Agunan\n2. Klik Step 3 (Informasi kepemilikan) pada side-nav',
        'expected': 'Sistem memunculkan dialog / modal error peringatan bahwa user tidak dapat mengakses/melanjutkan step ini sebelum Bucket Identitas dan Pengecekan selesai (Lengkap). Form Step 3 diblokir.',
        'reference': 'Jira AC: Step Form Informasi Kepemilikan (Tidak Lengkap) & CSV TC-04-62'
    },
    {
        'id': 'TC-4890-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Gating Validasi Bucket Identitas',
        'title': 'Akses Step 3 saat Bucket Identitas Lengkap',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Tab Identitas dan Pengecekan berstatus "Lengkap" (centang hijau)',
        'steps': '1. Masuk ke modal Tambah Agunan\n2. Klik Step 3 (Informasi kepemilikan)',
        'expected': 'Step 3 berhasil terbuka dan memuat form kategori pemilik agunan sesuai profil debitur.',
        'reference': 'Jira AC: Step Form Informasi Kepemilikan (Lengkap) & CSV TC-04-67'
    },

    # ─── KELOMPOK 3: BATASAN MAKSIMAL AGUNAN ──────────────────────────────────
    {
        'id': 'TC-4890-08',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Batasan Maksimal Agunan',
        'title': 'Validasi Batas Maksimal Agunan (Max 100)',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Aplikasi debitur sudah memiliki total 100 agunan (parameterized X = 100)',
        'steps': '1. Buka halaman Data Agunan\n2. Klik tombol + Agunan / Tambah Agunan',
        'expected': 'Sistem menampilkan popup/alert:\n"Maximum number agunan has been reached, please ask administrator to remove from current data agunan" dan memblokir penambahan.',
        'reference': 'Jira AC: Max Entry & S2WP-4881'
    },

    # ─── KELOMPOK 4: FITUR SIMPAN SEBAGAI DRAFT ──────────────────────────────
    {
        'id': 'TC-4890-09',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Simpan Sebagai Draft',
        'title': 'Simpan Draft dengan Form Parsial (Bypass Mandatory)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Berada di Step 1, baru mengisi 1 atau 2 field (sebagian besar mandatory masih kosong)',
        'steps': '1. Klik tombol "Simpan sebagai draft"',
        'expected': 'Sistem tidak memvalidasi kolom kosong, menampilkan notifikasi/toast sukses ("Draft Saved Successfully" / "Berhasil menyimpan draft"), data tersimpan sementara.',
        'reference': 'Jira AC: Save to Draft'
    },
    {
        'id': 'TC-4890-10',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Simpan Sebagai Draft',
        'title': 'Retensi Data Draft setelah Modal Ditutup',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Data draft telah tersimpan',
        'steps': '1. Tutup modal agunan\n2. Buka kembali agunan terkait dari daftar draft',
        'expected': 'Data yang sebelumnya diinput pada draft tetap ada dan tidak hilang / ter-reset.',
        'reference': 'Jira AC: Save to Draft'
    },

    # ─── KELOMPOK 5: TOMBOL SIMPAN & FINAL SUBMISSION ─────────────────────────
    {
        'id': 'TC-4890-11',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Tombol Simpan & Final Submission',
        'title': 'Tombol Simpan Disabled saat Mandatory Belum Lengkap',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Satu atau lebih field mandatory pada Step 1/2/3 masih kosong',
        'steps': '1. Periksa status tombol "Simpan" di bagian footer modal',
        'expected': 'Tombol "Simpan" berstatus disabled (aria-disabled="true" atau tidak dapat diklik).',
        'reference': 'Jira AC: Button Simpan & UI SIT'
    },
    {
        'id': 'TC-4890-12',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Tombol Simpan & Final Submission',
        'title': 'Validasi Error Submission jika Field Mandatory Belum Lengkap',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Ada field salah format / belum diisi saat mencoba submit',
        'steps': '1. Coba lakukan klik / submit Simpan',
        'expected': 'Sistem memblokir proses submit, menampilkan notifikasi merah / toast berisi daftar field yang belum lengkap / salah (incomplete form error).',
        'reference': 'Jira AC: Fail to submit final & CSV TC-04-64, 65'
    },
    {
        'id': 'TC-4890-13',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Tombol Simpan & Final Submission',
        'title': 'Submit Final Berhasil saat Seluruh 3 Step Lengkap',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': 'Semua field mandatory pada Step 1, Step 2, dan Step 3 telah terisi valid (indikator ketiga step berstatus Lengkap)',
        'steps': '1. Tombol "Simpan" menjadi aktif (enabled)\n2. Klik tombol "Simpan"',
        'expected': '1. Sistem memproses simpan ke server/CLS.\n2. Muncul toast sukses: "Penginputan data agunan sudah sesuai".\n3. Modal otomatis tertutup.\n4. Halaman ringkasan Bucket Agunan ter-refresh menampilkan agunan baru di daftar kartu agunan.',
        'reference': 'Jira AC: Successfully submit final'
    },

    # ─── KELOMPOK 6: ATURAN BISNIS & DATAPOINTS SPESIFIK ─────────────────────
    {
        'id': 'TC-4890-14',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Bisnis & Datapoints',
        'title': 'Default Tipe Penilaian saat LPA = "Tidak"',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Berada di Step 1 (Penilaian Agunan)',
        'steps': '1. Pada radio "Apakah LPA sudah tersedia?", pilih Tidak',
        'expected': 'Nilai input dropdown Tipe Penilaian otomatis ter-set default menjadi "Internal".',
        'reference': 'Jira Linked Issue: S2CML-6756'
    },
    {
        'id': 'TC-4890-15',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Bisnis & Datapoints',
        'title': 'Render Dinamis Step 2 (Data Tambahan Agunan) Sesuai Segmen',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 1 memilih Jenis Agunan tertentu',
        'steps': '1. Bandingkan form Step 2 antara jenis Housing vs Vehicle vs Cash Collateral',
        'expected': 'Form Step 2 memuat komponen spesifik:\n- Housing: data sertifikat/IMB/NJOP.\n- Kendaraan: No Rangka/Mesin/BPKB.\n- Cash: CIF, Rekening, Blokir.',
        'reference': 'Jira AC & S2WP-4880 & Excel Baris 112'
    },

    # ─── KELOMPOK 7: SPESIFIK DEBITUR PERORANGAN (INDIVIDUAL) ────────────────
    {
        'id': 'TC-4890-16',
        'debtor_type': 'Perorangan',
        'group': 'Spesifik Debitur Perorangan',
        'title': 'Step 3: Kategori Pemilik "010 - Pasangan" pada Debitur Belum Menikah',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Debitur perorangan berstatus perkawinan "Belum Menikah" di Bucket Identitas (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY)',
        'steps': '1. Buka Step 3: Informasi Kepemilikan\n2. Buka dropdown Kategori Pemilik Agunan\n3. Periksa ketersediaan opsi 010 - Pasangan peminjam',
        'expected': 'Opsi "010 - Pasangan peminjam" tidak ditampilkan atau jika dipilih memicu pesan validasi bahwa status debitur belum menikah.',
        'reference': 'CSV TC-04-75 & Excel Business Rules'
    },
    {
        'id': 'TC-4890-17',
        'debtor_type': 'Perorangan',
        'group': 'Spesifik Debitur Perorangan',
        'title': 'Step 3: Kategori Pemilik "009 - Penjamin" saat Data Penjamin Belum Ada',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Debitur perorangan belum memiliki data penjamin di Bucket Identitas',
        'steps': '1. Buka Step 3: Informasi Kepemilikan\n2. Pilih Kategori Pemilik "009 - Penjamin (PG)"\n3. Periksa dropdown pilihan Penjamin',
        'expected': 'Sistem menampilkan indikasi/pesan validasi bahwa data penjamin perorangan belum terdaftar pada pengajuan debitur ini.',
        'reference': 'CSV TC-04-72, 73 & Excel'
    },

    # ─── KELOMPOK 8: SPESIFIK DEBITUR BADAN USAHA (CORPORATE) ─────────────────
    {
        'id': 'TC-4890-BU-01',
        'debtor_type': 'Badan Usaha',
        'group': 'Spesifik Debitur Badan Usaha',
        'title': 'Step 3: Kategori Pemilik Perusahaan (006 - Pengurus & 007 - Pemilik)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Debitur berjenis Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ, debtorType=business)',
        'steps': '1. Buka modal Agunan pada debitur Badan Usaha\n2. Buka Step 3: Informasi Kepemilikan\n3. Buka dropdown Kategori Pemilik Agunan',
        'expected': 'Dropdown Kategori Pemilik memuat opsi khusus entitas bisnis: "006 - Pengurus perusahaan" dan "007 - Pemilik perusahaan", serta tidak menampilkan opsi pasangan perorangan.',
        'reference': 'CSV TC-04-79, 80, 81 & Excel'
    },
    {
        'id': 'TC-4890-BU-02',
        'debtor_type': 'Badan Usaha',
        'group': 'Spesifik Debitur Badan Usaha',
        'title': 'Step 3: Kategori 003 - Debitur Badan Usaha Mapping NPWP & Legalitas',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ)',
        'steps': '1. Pada Step 3, pilih Kategori Pemilik "003 - Debitur (Badan Usaha)"',
        'expected': 'Sistem otomatis memetakan nama badan usaha, NPWP, dan nomor legalitas perusahaan dari Bucket Identitas Badan Usaha ke form kepemilikan agunan.',
        'reference': 'CSV TC-04-81, 82 & Excel'
    },
    {
        'id': 'TC-4890-BU-03',
        'debtor_type': 'Badan Usaha',
        'group': 'Spesifik Debitur Badan Usaha',
        'title': 'Step 3: Kategori 006 - Pengurus Tanpa Data Pengurus Terdaftar',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Debitur Badan Usaha yang belum memiliki pengurus terdaftar di Bucket Identitas',
        'steps': '1. Pilih Kategori Pemilik "006 - Pengurus perusahaan"\n2. Periksa dropdown pilihan Pengurus',
        'expected': 'Sistem memunculkan alert / warning bahwa daftar pengurus perusahaan belum diinput pada Bucket Identitas.',
        'reference': 'CSV TC-04-79 edge case & Excel'
    },

    # ─── KELOMPOK 9: NEGATIVE & FORM VALIDATION RULES (UMUM) ─────────────────
    {
        'id': 'TC-4890-18',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative Form & Business Logic',
        'title': 'Step 2: Pengecekan CIF Cash Collateral Tidak Terdaftar',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Form Step 2 Agunan Cash Collateral, Agunan Tersimpan di Bank Sinarmas = Ya',
        'steps': '1. Masukkan nomor CIF fiktif (misal: 9999999999)\n2. Klik tombol "Cek"',
        'expected': 'Sistem menampilkan ikon silang merah "CIF tidak ditemukan", field rekening tetap terkunci, dan tombol Simpan diblokir.',
        'reference': 'CSV TC-04-58 & Excel Baris 112'
    },
    {
        'id': 'TC-4890-19',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative Form & Business Logic',
        'title': 'Step 2: Nominal Cash Collateral Bernilai 0 atau Minus',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Form Step 2 Agunan Cash Collateral (Giro/Tabungan/Deposito)',
        'steps': '1. Isi field Nominal Agunan dengan angka 0 atau nilai negatif\n2. Blur field / klik luar',
        'expected': 'Muncul alert/pesan validasi error "Nominal agunan harus lebih besar dari 0" dan tombol Simpan tetap disabled.',
        'reference': 'Excel Baris 116 & Form Validation Rules'
    },
    {
        'id': 'TC-4890-20',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative Form & Business Logic',
        'title': 'Step 2: Tanggal Berakhir Sertifikat Tanah/Bangunan Kadaluarsa',
        'type': 'Negative',
        'priority': 'Medium',
        'precondition': 'Form Step 2 Agunan Housing / Tanah Bangunan dengan sertifikat berjangka (SHGB/HGB)',
        'steps': '1. Isi field Tanggal Berakhir Sertifikat dengan tanggal di masa lalu (misal: 01/01/2020)',
        'expected': 'Sistem menampilkan validasi error bahwa tanggal berakhir sertifikat tidak boleh lebih kecil dari tanggal saat ini (kadaluarsa).',
        'reference': 'Excel Data Agunan & Validation Rules'
    },
    {
        'id': 'TC-4890-21',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative Form & Business Logic',
        'title': 'Step 2: Luas Tanah / Bangunan Diisi Angka 0',
        'type': 'Negative',
        'priority': 'Medium',
        'precondition': 'Form Step 2 Agunan Housing',
        'steps': '1. Isi field Luas Tanah atau Luas Bangunan dengan angka 0\n2. Blur field',
        'expected': 'Sistem memicu error validasi "Luas tanah/bangunan minimal 1 m² / tidak boleh 0".',
        'reference': 'Form Data Agunan Validation'
    },
    {
        'id': 'TC-4890-22',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative Form & Business Logic',
        'title': 'Step 1: Nilai Agunan Wajar/NJOP Bernilai 0 saat LPA Tersedia',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Step 1 (Penilaian Agunan), Apakah LPA sudah tersedia = Ya',
        'steps': '1. Kosongkan atau isi field Nilai Agunan Wajar/NJOP dengan 0\n2. Blur field',
        'expected': 'Sistem memvalidasi kolom mandatory tidak boleh 0/kosong dan tombol Simpan tetap disabled.',
        'reference': 'Excel Baris 85 & CSV TC-04-44'
    }
]

headers = ['Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario', 'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian', 'Expected Result', 'Referensi Sumber']

# 1. Generate CSV (UTF-8 with BOM for Excel)
csv_path = os.path.join('exports', 'TC_S2CML-4890_Bucket_Agunan.csv')
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for tc in test_cases:
        writer.writerow([tc['id'], tc['debtor_type'], tc['group'], tc['title'], tc['type'], tc['priority'], tc['precondition'], tc['steps'], tc['expected'], tc['reference']])

# 2. Generate XLSX with styling
xlsx_path = os.path.join('exports', 'TC_S2CML-4890_Bucket_Agunan.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-4890'

ws.append(headers)

# Styling header
header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Navy
header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

for col_num in range(1, len(headers) + 1):
    cell = ws.cell(row=1, column=col_num)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_align
    cell.border = thin_border
ws.row_dimensions[1].height = 28

# Fill data rows
for r_idx, tc in enumerate(test_cases, start=2):
    row_data = [tc['id'], tc['debtor_type'], tc['group'], tc['title'], tc['type'], tc['priority'], tc['precondition'], tc['steps'], tc['expected'], tc['reference']]
    ws.append(row_data)
    
    # Priority coloring
    prio_color = '000000'
    if tc['priority'] == 'Critical':
        prio_color = 'DC2626' # Red
    elif tc['priority'] == 'High':
        prio_color = 'EA580C' # Orange
    elif tc['priority'] == 'Medium':
        prio_color = '2563EB' # Blue

    for col_num in range(1, len(headers) + 1):
        c = ws.cell(row=r_idx, column=col_num)
        c.border = thin_border
        c.alignment = Alignment(vertical='top', wrap_text=True)
        c.font = Font(name='Calibri', size=10)
        
        # Center align ID, Tipe Debitur, Tipe, Prioritas
        if col_num in [1, 2, 5, 6]:
            c.alignment = Alignment(horizontal='center', vertical='top', wrap_text=True)
            if col_num == 6:
                c.font = Font(name='Calibri', size=10, bold=True, color=prio_color)
            elif col_num == 1:
                c.font = Font(name='Calibri', size=10, bold=True)
            elif col_num == 5:
                if tc['type'] == 'Negative':
                    c.font = Font(name='Calibri', size=10, bold=True, color='DC2626')
                else:
                    c.font = Font(name='Calibri', size=10, color='16A34A')

# Auto-adjust column widths
col_widths = {1: 16, 2: 24, 3: 28, 4: 38, 5: 12, 6: 12, 7: 35, 8: 45, 9: 50, 10: 32}
for col_num, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col_num)].width = width

wb.save(xlsx_path)
print('Exports updated successfully:')
print('1. ' + csv_path)
print('2. ' + xlsx_path)
print(f'Total TCs: {len(test_cases)}')
