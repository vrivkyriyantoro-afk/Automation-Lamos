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
        'id': 'TC-5420-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi & Struktur Form Step 2',
        'title': 'Validasi Navigasi ke Step 2 Data Tambahan Agunan via Side Navigation',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Modal Tambah Agunan terbuka di Step 1',
        'steps': '1. Klik menu "Data tambahan agunan" pada panel navigasi kiri modal.\n2. Periksa form yang aktif.',
        'expected': 'Sistem menampilkan form Step 2: Data Tambahan Agunan dan indikator navigasi aktif berpindah ke Step 2.',
        'reference': 'Jira S2CML-5420 AC: Entry Data Point',
    },
    {
        'id': 'TC-5420-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi & Struktur Form Step 2',
        'title': 'Validasi Field Sifat Agunan Jaminan Tampil pada Jenis Housing, Vehicle, dan Document',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Jenis agunan yang dipilih adalah kategori Housing (Tanah/Bangunan), Vehicle (Kendaraan), atau Document',
        'steps': '1. Buka Step 2 Data Tambahan Agunan.\n2. Periksa keberadaan field "Sifat agunan jaminan*".',
        'expected': 'Field "Sifat agunan jaminan*" tampil dengan tanda bintang merah mandatory (*).',
        'reference': 'Jira S2CML-5420 AC: Pre-Condition at Form 2 - Data Tambahan Agunan',
    },
    {
        'id': 'TC-5420-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Navigasi & Struktur Form Step 2',
        'title': 'Validasi Dropdown Sifat Agunan Jaminan Menampilkan Opsi Eligible dan Non Eligible',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Field Sifat agunan jaminan tampil pada Step 2',
        'steps': '1. Klik dropdown "Sifat agunan jaminan".\n2. Periksa opsi yang tersedia.',
        'expected': 'Menampilkan tepat 2 opsi pilihan: "Eligible" dan "Non Eligible".',
        'reference': 'Jira S2CML-5420 AC: Sifat Agunan Jaminan (Dropdown) & FE Data Dict',
    },
    {
        'id': 'TC-5420-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Status Kredit Joint & Bukti Kepemilikan',
        'title': 'Validasi Default Value Status Kredit Joint Account adalah Tidak',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Periksa nilai awal pada field "Status kredit joint account".',
        'expected': 'Nilai default terisi "Tidak" (atau "T") sesuai aturan default sistem.',
        'reference': 'Jira S2CML-5420 AC: Status Kredit Join (Default to Tidak)',
    },
    {
        'id': 'TC-5420-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Status Kredit Joint & Bukti Kepemilikan',
        'title': 'Validasi Field Bukti Kepemilikan Bertanda Bintang Merah Mandatory',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Periksa label pada field "Bukti kepemilikan".',
        'expected': 'Field "Bukti kepemilikan*" bertanda bintang merah mandatory (*) dan wajib terisi.',
        'reference': 'Jira S2CML-5420 AC: Bukti Kepemilikan Mandatory',
    },
    {
        'id': 'TC-5420-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Status Kredit Joint & Bukti Kepemilikan',
        'title': 'Validasi Field Bukti Kepemilikan Terisi dan Disabled saat Load Existing dari CLS',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Agunan dibuat dari hasil pencarian agunan existing CLS (Reuse Collateral)',
        'steps': '1. Lanjutkan agunan existing ke form Step 2.\n2. Periksa nilai dan status interaktivitas field "Bukti kepemilikan".',
        'expected': 'Field Bukti kepemilikan terisi otomatis dari data CLS dan berstatus disabled (tidak dapat diubah).',
        'reference': 'Jira S2CML-5420 AC & FE Data Dict baris 109',
    },
    {
        'id': 'TC-5420-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Status Kredit Joint & Bukti Kepemilikan',
        'title': 'Validasi Field Bukti Kepemilikan Editable saat Input Agunan Baru',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Agunan dibuat melalui opsi "Tambah Agunan Baru"',
        'steps': '1. Masuk ke Step 2.\n2. Masukkan nomor bukti kepemilikan baru ke field "Bukti kepemilikan".',
        'expected': 'Field bersifat editable dan menerima input teks/angka nomor bukti dokumen.',
        'reference': 'Jira S2CML-5420 AC: Entry Data Point',
    },
    {
        'id': 'TC-5420-08',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Keberadaan Area Upload File Dokumen Kepemilikan',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Periksa bagian "Upload Dokumen Kepemilikan".',
        'expected': 'Menampilkan zona upload file dokumen kepemilikan dengan informasi ketentuan upload.',
        'reference': 'Jira S2CML-5420 AC: Files to Upload Bukti Kepemilikan',
    },
    {
        'id': 'TC-5420-09',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Upload 1 File Dokumen Kepemilikan Berhasil',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Unggah 1 file dokumen valid (misal: dokumen_agunan.pdf berukuran < 50MB).\n2. Amati daftar file terunggah.',
        'expected': 'File berhasil diunggah, nama file dan ukuran tampil pada daftar file terunggah.',
        'reference': 'Jira S2CML-5420 AC: Upload Files',
    },
    {
        'id': 'TC-5420-10',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Upload Multiple Files Lebih dari 1 File Berhasil',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Unggah lebih dari 1 file dokumen secara bertahap atau sekaligus.\n2. Amati daftar file terunggah.',
        'expected': 'Semua file berhasil terunggah dan terdaftar secara berurutan pada daftar file.',
        'reference': 'Jira S2CML-5420 AC: File Can be Uploaded More Than 1',
    },
    {
        'id': 'TC-5420-11',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Review atau Preview File yang Telah Diunggah saat Diklik',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Minimal 1 file telah berhasil diunggah',
        'steps': '1. Klik pada nama file yang ada di daftar file terunggah.',
        'expected': 'Sistem membuka preview dokumen / modal review file untuk memeriksa isi dokumen yang diunggah.',
        'reference': 'Jira S2CML-5420 AC: User can review a file that uploaded by click that file',
    },
    {
        'id': 'TC-5420-12',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Hapus File yang Telah Diunggah dari Daftar',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Minimal 1 file telah berhasil diunggah',
        'steps': '1. Klik ikon/tombol hapus (Trash) pada file terunggah.\n2. Konfirmasi penghapusan (jika ada).',
        'expected': 'File terhapus dari daftar file terunggah.',
        'reference': 'Jira S2CML-5420 AC: User can remove a file if they feel wrong file uploaded',
    },
    {
        'id': 'TC-5420-13',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Penolakan File Melebihi Batas Ukuran 50 MB',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan terbuka',
        'steps': '1. Unggah file dokumen dengan ukuran > 50 MB.\n2. Amati respons sistem.',
        'expected': 'Sistem menolak file dan menampilkan pesan error validasi bahwa ukuran file melebihi batas maksimal 50MB.',
        'reference': 'Jira S2CML-5420 AC: File Size per file is 50MB',
    },
    {
        'id': 'TC-5420-14',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload Dokumen Bukti Kepemilikan',
        'title': 'Validasi Batas Maksimal Upload hingga 100 Files',
        'type': 'Negative',
        'priority': 'Medium',
        'precondition': 'Sebanyak 100 file telah berhasil diunggah',
        'steps': '1. Coba unggah file ke-101 ke dalam dokumen kepemilikan.',
        'expected': 'Sistem memblokir unggahan ke-101 dan menampilkan validasi batas maksimal 100 file telah tercapai.',
        'reference': 'Jira S2CML-5420 AC: File Can be Uploaded More Than 1, Maximum is 100',
    },
    {
        'id': 'TC-5420-15',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Khusus Deposito & Indikator Step 2',
        'title': 'Validasi Indikator Step 2 Berubah Menjadi Lengkap saat Seluruh Mandatory Terpenuhi',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Step 2 Data Tambahan Agunan sedang diisi',
        'steps': '1. Lengkapi seluruh field mandatory (Sifat agunan, Bukti kepemilikan, Upload file dokumen, dan Cash info jika ada).\n2. Periksa badge status pada side-nav kiri "Data tambahan agunan".',
        'expected': 'Indikator berubah status dari "Belum Lengkap" menjadi "Lengkap" dengan centang hijau.',
        'reference': 'Jira S2CML-4890 & S2CML-5420 AC: DoD Step 2',
    },
    {
        'id': 'TC-5420-16',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Aturan Khusus Deposito & Indikator Step 2',
        'title': 'Validasi Indikator Step 2 Tetap Belum Lengkap saat Ada Mandatory Kosong',
        'type': 'Negative',
        'priority': 'High',
        'precondition': 'Ada salah satu field mandatory di Step 2 yang belum diisi (misal Bukti kepemilikan atau file upload belum ada)',
        'steps': '1. Kosongkan salah satu field mandatory.\n2. Periksa badge status pada side-nav kiri.',
        'expected': 'Indikator tetap berstatus "Belum Lengkap".',
        'reference': 'Jira S2CML-4890 AC: Indicators Form',
    },
]

# ─── EXPORT CSV ──────────────────────────────────────────────────────────
csv_file_path = os.path.join('exports', 'TC_S2CML-5420_Data_Tambahan_Agunan.csv')
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
xlsx_file_path = os.path.join('exports', 'TC_S2CML-5420_Data_Tambahan_Agunan.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'S2CML-5420'

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

