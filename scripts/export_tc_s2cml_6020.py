import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('exports', exist_ok=True)

# ============================================================
# TC Matrix — S2CML-6020
# Bucket Agunan — Form Data Agunan > Load Latest Data Agunan
# Retensi Data Agunan (Draft & Simpan) Antar Bucket & Sesi
# ============================================================

test_cases = [

    # ─── KELOMPOK 1: RETENSI AGUNAN DRAFT SAAT NAVIGASI ANTAR BUCKET ───────────

    {
        'id': 'TC-6020-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Retensi Agunan Draft Antar Bucket',
        'title': 'Validasi Retensi Data Agunan Berstatus DRAFT saat Navigasi ke Bucket Lain dan Kembali',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'User telah menginput data agunan baru secara parsial dan berhasil menekan tombol '
            '"Simpan sebagai draft". Kartu agunan berstatus DRAFT tampil di Bucket Agunan.'
        ),
        'steps': (
            '1. Pada navigasi tab bucket atas, klik bucket lain (misal: "Struktur Kredit" atau "Data Usaha")\n'
            '2. Tunggu hingga halaman bucket tujuan selesai termuat sempurna\n'
            '3. Klik kembali tab "Agunan" untuk kembali ke Bucket Agunan\n'
            '4. Periksa daftar kartu agunan di halaman ringkasan'
        ),
        'expected': (
            'Kartu agunan yang berstatus DRAFT tetap tampil utuh pada daftar agunan tanpa ada data loss. '
            'Badge status tetap "Draft" dan counter total agunan tidak berkurang.'
        ),
        'reference': 'S2CML-6020 AC: Pre-Load Data at Bucket Agunan (Draft)'
    },
    # ─── KELOMPOK 2: RETENSI AGUNAN FINAL SAAT NAVIGASI ANTAR BUCKET ───────────

    {
        'id': 'TC-6020-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Retensi Agunan Final Antar Bucket',
        'title': 'Validasi Retensi Multi-Agunan (Kombinasi Draft dan Final) saat Navigasi Antar Bucket',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Agunan memiliki lebih dari 1 agunan (misal: 1 agunan status Final dan 1 agunan status Draft).'
        ),
        'steps': (
            '1. Catat jumlah dan nama masing-masing agunan yang ada di daftar\n'
            '2. Klik tab bucket "Analisa Keuangan"\n'
            '3. Klik kembali tab "Agunan"\n'
            '4. Bandingkan jumlah dan daftar kartu agunan yang tampil'
        ),
        'expected': (
            'Seluruh agunan (baik yang Draft maupun Final) ditampilkan kembali tanpa ada kartu agunan yang hilang. '
            'Urutan tampilan kartu konsisten dan badge status masing-masing agunan tetap akurat.'
        ),
        'reference': 'S2CML-6020 AC: Multi-collateral retention without data loss'
    },

    # ─── KELOMPOK 3: RETENSI DOKUMEN LAMPIRAN & PERHITUNGAN AGUNAN ─────────────

    {
        'id': 'TC-6020-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Retensi Dokumen & Perhitungan',
        'title': 'Validasi Retensi Nilai Penilaian dan Nilai Wajar Agunan saat Kembali ke Bucket Agunan',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Agunan tersimpan dengan nilai penilaian (Nilai Prediktif / Nilai Agunan Wajar menurut pelapor).'
        ),
        'steps': (
            '1. Buka bucket "Struktur Kredit" lalu kembali ke Bucket "Agunan"\n'
            '2. Periksa nominal ringkasan nilai agunan pada kartu agunan di halaman summary'
        ),
        'expected': (
            'Nominal nilai agunan (Rp) tetap tampil presisi sesuai nominal yang diinput, '
            'tidak berubah menjadi Rp 0 atau string kosong.'
        ),
        'reference': 'S2CML-6020 AC: Numeric appraisal datapoint retention'
    },

    # ─── KELOMPOK 4: RETENSI DATA SAAT BROWSER REFRESH / RELOAD ────────────────

    {
        'id': 'TC-6020-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Retensi saat Browser Reload & Re-Login',
        'title': 'Validasi Retensi Data Agunan saat Browser Dilakukan Refresh Halaman (F5)',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'User berada di halaman Bucket Agunan dengan minimal 1 agunan tersimpan (Draft / Final).'
        ),
        'steps': (
            '1. Lakukan refresh / reload pada browser (F5 atau klik tombol reload)\n'
            '2. Tunggu proses loading initial state dan data fetching dari backend selesai\n'
            '3. Periksa tampilan daftar kartu agunan'
        ),
        'expected': (
            'Sistem secara otomatis me-retrieve data agunan dari server backend. '
            'Seluruh data agunan yang telah disimpan sebelumnya tampil kembali secara lengkap dan utuh.'
        ),
        'reference': 'S2CML-6020 User Story: System automatically retrieve and display existing collateral information'
    },
    {
        'id': 'TC-6020-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Retensi saat Browser Reload & Re-Login',
        'title': 'Validasi Retensi Data Agunan Pasca Re-Login Sesi Pengguna',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Data agunan (Draft atau Final) telah tersimpan di server untuk application ID target.'
        ),
        'steps': (
            '1. Lakukan logout dari aplikasi LAMOS\n'
            '2. Login kembali menggunakan kredensial Account Officer\n'
            '3. Buka pengajuan kredit target dan masuk ke Bucket Agunan\n'
            '4. Amati daftar agunan'
        ),
        'expected': (
            'Data agunan yang tersimpan di server tetap tersedia dan termuat dengan sempurna, '
            'memastikan data tidak hilang antar sesi login.'
        ),
        'reference': 'S2CML-6020 Task: Memastikan data yang sudah di draft/simpan masih ada untuk diedit'
    },

    # ─── KELOMPOK 5: BOUNDARY & UNSAVED CHANGES HANDLING ───────────────────────

    {
        'id': 'TC-6020-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Boundary & Unsaved State',
        'title': 'Validasi Penanganan Form yang Belum Disimpan (Unsaved State) saat Pindah Bucket',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'User sedang membuka modal Tambah Agunan dan mengetikkan data, '
            'namun BELUM menekan tombol "Simpan sebagai draft" maupun "Simpan".'
        ),
        'steps': (
            '1. Dalam kondisi form terisi tapi belum disimpan, tutup modal atau coba klik link bucket lain\n'
            '2. Masuk kembali ke modal Tambah Agunan Baru'
        ),
        'expected': (
            'Data yang belum pernah disimpan (unsubmitted/unsaved) tidak mengotori daftar agunan di backend. '
            'Daftar agunan hanya menampilkan data yang sah telah di-trigger "Save as Draft" atau "Simpan".'
        ),
        'reference': 'S2CML-6020 AC: User has triggered Save as Draft or Simpan action'
    }

]

# ─── GENERATE EXPORTS ─────────────────────────────────────────────────────────

headers = [
    'Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario',
    'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian',
    'Expected Result', 'Referensi Sumber'
]

# 1. Generate CSV (UTF-8 with BOM for Excel)
csv_path = os.path.join('exports', 'TC_S2CML-6020_Load_Latest_Data_Agunan.csv')
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for tc in test_cases:
        writer.writerow([
            tc['id'], tc['debtor_type'], tc['group'], tc['title'],
            tc['type'], tc['priority'], tc['precondition'],
            tc['steps'], tc['expected'], tc['reference']
        ])

# 2. Generate XLSX with styling
xlsx_path = os.path.join('exports', 'TC_S2CML-6020_Load_Latest_Data_Agunan.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-6020'

ws.append(headers)

# Styling header (Navy Teal)
header_fill = PatternFill(start_color='164E63', end_color='164E63', fill_type='solid')
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

group_colors = {
    'Retensi Agunan Draft Antar Bucket':        'EFF6FF',
    'Retensi Agunan Final Antar Bucket':        'F0FDF4',
    'Retensi Dokumen & Perhitungan':            'FEFCE8',
    'Retensi saat Browser Reload & Re-Login':   'F5F3FF',
    'Boundary & Unsaved State':                 'FFF1F2',
}

for r_idx, tc in enumerate(test_cases, start=2):
    row_data = [
        tc['id'], tc['debtor_type'], tc['group'], tc['title'],
        tc['type'], tc['priority'], tc['precondition'],
        tc['steps'], tc['expected'], tc['reference']
    ]
    ws.append(row_data)

    row_bg = group_colors.get(tc['group'], 'FFFFFF')
    row_fill = PatternFill(start_color=row_bg, end_color=row_bg, fill_type='solid')

    prio_color = '000000'
    if tc['priority'] == 'Critical':
        prio_color = 'DC2626'
    elif tc['priority'] == 'High':
        prio_color = 'EA580C'
    elif tc['priority'] == 'Medium':
        prio_color = '2563EB'

    for col_num in range(1, len(headers) + 1):
        c = ws.cell(row=r_idx, column=col_num)
        c.border = thin_border
        c.alignment = Alignment(vertical='top', wrap_text=True)
        c.font = Font(name='Calibri', size=10)
        c.fill = row_fill

        if col_num in [1, 2, 5, 6]:
            c.alignment = Alignment(horizontal='center', vertical='top', wrap_text=True)
            if col_num == 1:
                c.font = Font(name='Calibri', size=10, bold=True)
            elif col_num == 5:
                if tc['type'] == 'Negative':
                    c.font = Font(name='Calibri', size=10, bold=True, color='DC2626')
                else:
                    c.font = Font(name='Calibri', size=10, bold=True, color='16A34A')
            elif col_num == 6:
                c.font = Font(name='Calibri', size=10, bold=True, color=prio_color)

col_widths = {1: 16, 2: 24, 3: 38, 4: 45, 5: 12, 6: 12, 7: 48, 8: 45, 9: 55, 10: 38}
for col_num, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col_num)].width = width

ws.freeze_panes = 'A2'
wb.save(xlsx_path)

print('[OK] Exports generated successfully:')
print(f'   1. {csv_path}')
print(f'   2. {xlsx_path}')
print(f'   Total TCs: {len(test_cases)}')

from collections import Counter
groups = Counter(tc['group'] for tc in test_cases)
print('\nSummary per Kelompok:')
for g, n in groups.items():
    print(f'   {g}: {n} TC')

pos = sum(1 for tc in test_cases if tc['type'] == 'Positive')
neg = sum(1 for tc in test_cases if tc['type'] == 'Negative')
crit = sum(1 for tc in test_cases if tc['priority'] == 'Critical')
print(f'\n   Positive: {pos}  |  Negative: {neg}  |  Critical: {crit}')

