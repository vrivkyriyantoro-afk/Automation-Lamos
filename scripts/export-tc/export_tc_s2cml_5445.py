import os
import sys
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.stdout.reconfigure(encoding='utf-8')
os.makedirs('exports', exist_ok=True)

test_cases = [
    {
        'id': 'TC-5445-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi CIF Default State saat Opsi Tersimpan di Bank Sinarmas Dipilih Ya',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Jenis agunan F09/F10/F11/F15, pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?" dijawab Ya',
        'steps': '1. Pilih opsi "Ya".\n2. Periksa field CIF pemilik agunan.',
        'expected': 'Field CIF kosong dengan placeholder "Masukkan CIF pemilik agunan" dan tombol Cek berstatus nonaktif.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-54',
    },
    {
        'id': 'TC-5445-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Tombol Cek Aktif setelah Field CIF Diisi Angka',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Field CIF tampil dalam keadaan kosong',
        'steps': '1. Isi field CIF dengan angka (misal 11111111).\n2. Periksa status tombol Cek.',
        'expected': 'Tombol Cek berubah menjadi aktif (biru) dan dapat diklik.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-55',
    },
    {
        'id': 'TC-5445-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Indikator Loading pada Tombol Cek saat Proses Inquiry Berjalan',
        'type': 'Positive',
        'priority': 'Low',
        'precondition': 'Field CIF sudah terisi dan tombol Cek aktif',
        'steps': '1. Klik tombol Cek.\n2. Amati tampilan tombol selama proses berlangsung.',
        'expected': 'Spinner / indikator loading muncul pada tombol Cek selama proses inquiry ke service berjalan.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-56',
    },
    {
        'id': 'TC-5445-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Inquiry Account',
        'title': 'Validasi CIF Ditemukan Menampilkan Dropdown Rekening Cash Collateral',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'CIF yang diisi valid dan terdaftar pada core banking',
        'steps': '1. Isi CIF valid.\n2. Klik tombol Cek.\n3. Amati respons sistem.',
        'expected': 'Muncul centang hijau "CIF ditemukan", tombol Ubah tampil, dan dropdown "Rekening cash collateral" ditampilkan.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-57',
    },
    {
        'id': 'TC-5445-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Inquiry Account',
        'title': 'Validasi CIF Tidak Ditemukan Menampilkan Ikon Silang Merah',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'CIF yang diisi tidak terdaftar pada core banking',
        'steps': '1. Isi CIF yang tidak valid.\n2. Klik tombol Cek.\n3. Amati respons sistem.',
        'expected': 'Muncul ikon silang merah "CIF tidak ditemukan", dropdown rekening tetap terkunci, dan tombol Ubah tampil.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-58',
    },
    {
        'id': 'TC-5445-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Error Handling',
        'title': 'Validasi Penanganan Kegagalan Sistem saat Pengecekan CIF',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Service inquiry account dalam kondisi gagal / error (disimulasikan via intercept)',
        'steps': '1. Isi CIF.\n2. Klik tombol Cek saat service error.\n3. Amati respons sistem.',
        'expected': 'Sistem menampilkan pesan informasi penyebab kegagalan integrasi dan mencoba ulang hingga berhasil.',
        'reference': 'AC S2CML-4981: IF Get Detail Account is Failed | ID lama TC-4889-59',
    },
    {
        'id': 'TC-5445-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Tombol Ubah CIF Memicu Inquiry Ulang Daftar Rekening',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'CIF sudah ditemukan dan daftar rekening sudah tampil',
        'steps': '1. Klik tombol Ubah pada field CIF.\n2. Ganti nilai CIF dengan CIF lain yang valid.\n3. Klik Cek.',
        'expected': 'Sistem melakukan inquiry ulang dan daftar rekening cash collateral diperbarui sesuai CIF yang baru.',
        'reference': 'AC S2CML-5445: After CIF inputted / value has changes | ID lama TC-4889-60',
    },
    {
        'id': 'TC-5445-08',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Agunan Non-BSIM',
        'title': 'Validasi Opsi Tidak Tersimpan di Bank Sinarmas Menyembunyikan CIF dan Menampilkan Instansi Penerbit',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Jenis agunan F09/F10/F11/F15 dan sebelumnya opsi "Ya" sudah dipilih',
        'steps': '1. Pilih opsi "Tidak" pada pertanyaan Bank Sinarmas.\n2. Periksa field yang tampil.',
        'expected': 'Field CIF hilang; muncul field "Instansi penerbit*" sebagai input manual mandatory. ARO, Tipe Blokir, dan Alasan Blokir tetap tersembunyi.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-61',
    },
    {
        'id': 'TC-5445-09',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Informasi Cash Collateral',
        'title': 'Validasi Section Informasi Cash Collateral Tampil pada Jenis F09, F10, F11, dan F15',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Jenis agunan yang dipilih adalah F09 (Giro), F10 (Tabungan), F11 (Deposito), atau F15 (Setoran Jaminan)',
        'steps': '1. Masuk ke Step 2 Data Tambahan Agunan.\n2. Periksa tampilan seksi form.',
        'expected': 'Sistem menampilkan seksi khusus "Informasi cash collateral".',
        'reference': 'FE Data Dict baris 111 & Figma 6124:461694 | Dipindah dari TC-5420-15 (AC S2CML-5445/4981)',
    },
    {
        'id': 'TC-5445-10',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Informasi Cash Collateral',
        'title': 'Validasi Pertanyaan Apakah Agunan Tersimpan di Bank Sinarmas Bertanda Mandatory',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Seksi Informasi cash collateral aktif',
        'steps': '1. Periksa pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?".',
        'expected': 'Pertanyaan bertanda bintang merah mandatory (*) dan wajib dipilih sebelum menyimpan.',
        'reference': 'FE Data Dict baris 111 | Dipindah dari TC-5420-16 (AC S2CML-5445/4981)',
    },
    {
        'id': 'TC-5445-11',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Informasi Cash Collateral',
        'title': 'Validasi Pilihan Radio Button Ya dan Tidak pada Pertanyaan Bank Sinarmas',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Seksi Informasi cash collateral aktif',
        'steps': '1. Periksa opsi pilihan pada pertanyaan Bank Sinarmas.',
        'expected': 'Menampilkan dua opsi radio button yang dapat dipilih bergantian: "Ya" dan "Tidak".',
        'reference': 'FE Data Dict baris 111 & Figma 6124:461694 | Dipindah dari TC-5420-17 (AC S2CML-5445/4981)',
    },
    {
        'id': 'TC-5445-12',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Informasi Cash Collateral',
        'title': 'Validasi Cash Collateral Selain F09-F15 Tidak Memunculkan Pertanyaan Bank Sinarmas',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Jenis agunan adalah Cash Collateral non F09-F15 (misal: Reksadana)',
        'steps': '1. Masuk ke Step 2.\n2. Periksa seksi form tambahan.',
        'expected': 'Hanya field Bukti pemilikan* yang tampil; pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?" tidak ditampilkan.',
        'reference': 'FE Data Dict baris 111 & TC-4889-53 | Dipindah dari TC-5420-23 (AC S2CML-5445/4981)',
    },
    {
        'id': 'TC-5445-13',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Khusus Deposito & Indikator Step 2',
        'title': 'Validasi Field Nominal Disabled pada Jenis F11 Deposito',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Jenis agunan adalah F11 (Deposito) tersimpan di Bank Sinarmas',
        'steps': '1. Pilih rekening deposito pada dropdown rekening.\n2. Periksa field "Nominal".',
        'expected': 'Field Nominal terisi otomatis dari data sistem (inquiry) dan berstatus disabled.',
        'reference': 'FE Data Dict baris 115 | Dipindah dari TC-5420-24 (AC S2CML-5445/4981)',
    },
    {
        'id': 'TC-5445-14',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Khusus Deposito & Indikator Step 2',
        'title': 'Validasi Field Periode Mulai dan Akhir Tampil pada Jenis Deposito F11',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Jenis agunan adalah F11 (Deposito) tersimpan di Bank Sinarmas',
        'steps': '1. Periksa bagian tanggal / periode deposito.',
        'expected': 'Field "Periode Mulai" dan "Periode Akhir" tampil sesuai jangka waktu bilyet deposito terkait.',
        'reference': 'FE Data Dict baris 117-118 | Dipindah dari TC-5420-25 (AC S2CML-5445/4981)',
    },
]

# ─── EXPORT CSV ──────────────────────────────────────────────────────────
csv_file_path = os.path.join('exports', 'TC_S2CML-5445_Data_Tambahan_Cash_Collateral.csv')
with open(csv_file_path, mode='w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow([
        'Test Case ID',
        'Tipe Debitur',
        'Kelompok / Modul',
        'Judul Skenario',
        'Tipe',
        'Prioritas',
        'Prekondisi',
        'Langkah Pengujian',
        'Expected Result',
        'Referensi Sumber'
    ])
    for tc in test_cases:
        writer.writerow([
            tc['id'],
            tc['debtor_type'],
            tc['group'],
            tc['title'],
            tc['type'],
            tc['priority'],
            tc['precondition'],
            tc['steps'],
            tc['expected'],
            tc['reference']
        ])

print(f'✅ CSV berhasil digenerate: {csv_file_path} ({len(test_cases)} Test Cases)')

# ─── EXPORT XLSX ─────────────────────────────────────────────────────────
xlsx_file_path = os.path.join('exports', 'TC_S2CML-5445_Data_Tambahan_Cash_Collateral.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'S2CML-5445'

headers = [
    'Test Case ID',
    'Tipe Debitur',
    'Kelompok / Modul',
    'Judul Skenario',
    'Tipe',
    'Prioritas',
    'Prekondisi',
    'Langkah Pengujian',
    'Expected Result',
    'Referensi Sumber'
]

ws.append(headers)

# Styling Header
header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Dark Blue
header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
header_align = Alignment(horizontal='center', vertical='center', wrap_text=True)

thin_border = Border(
    left=Side(style='thin', color='D1D5DB'),
    right=Side(style='thin', color='D1D5DB'),
    top=Side(style='thin', color='D1D5DB'),
    bottom=Side(style='thin', color='D1D5DB')
)

for col_num in range(1, len(headers) + 1):
    cell = ws.cell(row=1, column=col_num)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_align
    cell.border = thin_border

ws.row_dimensions[1].height = 28

# Zebra rows
zebra_fill = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid')

for r_idx, tc in enumerate(test_cases, start=2):
    ws.append([
        tc['id'],
        tc['debtor_type'],
        tc['group'],
        tc['title'],
        tc['type'],
        tc['priority'],
        tc['precondition'],
        tc['steps'],
        tc['expected'],
        tc['reference']
    ])
    ws.row_dimensions[r_idx].height = 45
    is_even = (r_idx % 2 == 0)
    for c_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=r_idx, column=c_idx)
        cell.font = Font(name='Calibri', size=10)
        cell.border = thin_border
        cell.alignment = Alignment(vertical='top', wrap_text=True)
        if is_even:
            cell.fill = zebra_fill
        
        # Center align for ID, Type, Priority, Debtor
        if c_idx in [1, 2, 5, 6]:
            cell.alignment = Alignment(horizontal='center', vertical='top')

# Set column widths
col_widths = {
    1: 14, # ID
    2: 24, # Tipe Debitur
    3: 28, # Kelompok
    4: 40, # Judul
    5: 12, # Tipe
    6: 12, # Prioritas
    7: 35, # Prekondisi
    8: 40, # Langkah Pengujian
    9: 45, # Expected Result
    10: 32 # Referensi
}

for col_num, width in col_widths.items():
    col_letter = get_column_letter(col_num)
    ws.column_dimensions[col_letter].width = width

wb.save(xlsx_file_path)
print(f'✅ Excel XLSX berhasil digenerate: {xlsx_file_path}')

