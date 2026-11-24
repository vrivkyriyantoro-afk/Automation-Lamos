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
        'title': 'Validasi Default Step saat Form Terbuka',
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
        'title': 'Validasi Struktur 3-Step Side Navigation',
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
        'title': 'Validasi Navigasi Paralel / Bebas Antar Step',
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
        'title': 'Validasi Indikator Berubah Jadi "Lengkap"',
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
        'title': 'Validasi Form Tetap Dapat Diedit Saat Sudah "Lengkap"',
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
        'title': 'Validasi Akses Step 3 saat Bucket Identitas Belum Lengkap',
        'type': 'Negative',
        'priority': 'Critical',
        'precondition': 'Tab Identitas dan Pengecekan di aplikasi berstatus "Belum Lengkap" / not locked',
        'steps': '1. Masuk ke modal Tambah Agunan\n2. Klik Step 3 (Informasi kepemilikan) pada side-nav',
        'expected': 'Sistem memunculkan dialog / modal error peringatan bahwa user tidak dapat mengakses/melanjutkan step ini sebelum Bucket Identitas dan Pengecekan selesai (Lengkap). Form Step 3 diblokir.',
        'reference': 'Jira AC: Step Form Informasi Kepemilikan (Tidak Lengkap) & CSV TC-4889-62'
    },
    {
        'id': 'TC-4890-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Gating Validasi Bucket Identitas',
        'title': 'Validasi Akses Step 3 saat Bucket Identitas Lengkap',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Tab Identitas dan Pengecekan berstatus "Lengkap" (centang hijau)',
        'steps': '1. Masuk ke modal Tambah Agunan\n2. Klik Step 3 (Informasi kepemilikan)',
        'expected': 'Step 3 berhasil terbuka dan memuat form kategori pemilik agunan sesuai profil debitur.',
        'reference': 'Jira AC: Step Form Informasi Kepemilikan (Lengkap) & CSV TC-4889-67'
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
        'title': 'Validasi Simpan Draft dengan Form Parsial (Bypass Mandatory)',
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
        'title': 'Validasi Retensi Data Draft setelah Modal Ditutup',
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
        'title': 'Validasi Tombol Simpan Disabled saat Mandatory Belum Lengkap',
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
        'reference': 'Jira AC: Fail to submit final & CSV TC-4889-64, 65 [PERLU KONFIRMASI BA: AC tombol Simpan ambigu, bentrok dengan TC-11]'
    },
    {
        'id': 'TC-4890-13',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Tombol Simpan & Final Submission',
        'title': 'Validasi Submit Final Berhasil saat Seluruh 3 Step Lengkap',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': 'Semua field mandatory pada Step 1, Step 2, dan Step 3 telah terisi valid (indikator ketiga step berstatus Lengkap)',
        'steps': '1. Tombol "Simpan" menjadi aktif (enabled)\n2. Klik tombol "Simpan"',
        'expected': '1. Sistem memproses simpan ke server/CLS.\n2. Muncul toast sukses: "Penginputan data agunan sudah sesuai".\n3. Modal otomatis tertutup.\n4. Halaman ringkasan Bucket Agunan ter-refresh menampilkan agunan baru di daftar kartu agunan.',
        'reference': 'Jira AC: Successfully submit final'
    },

    # ─── KELOMPOK 6: GAP COVERAGE AC (DRAFT ANY STEP & METODE ENTRI) ─────────
    {
        'id': 'TC-4890-14',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Simpan Sebagai Draft',
        'title': 'Validasi Simpan Draft dari Step 2 dan Step 3 (Any Step)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Modal Tambah Agunan terbuka, field mandatory sebagian besar masih kosong',
        'steps': '1. Pindah ke Step 2, isi 1 field, klik "Simpan sebagai draft"\n2. Pindah ke Step 3 (Bucket Identitas Lengkap), isi 1 field, klik "Simpan sebagai draft"',
        'expected': 'Pada kedua step sistem tidak memvalidasi field kosong dan menyimpan draft.',
        'reference': 'Jira AC: Save to Draft (any step)'
    },
    {
        'id': 'TC-4890-15',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Simpan Sebagai Draft',
        'title': 'Validasi Teks Notifikasi Draft dan Modal Dapat Ditutup',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': 'Form terisi sebagian',
        'steps': '1. Klik "Simpan sebagai draft"\n2. Periksa teks notifikasi\n3. Tutup modal',
        'expected': 'Notifikasi persis "Draft Saved Successfully". Modal bisa ditutup tanpa kehilangan progres.',
        'reference': 'Jira AC: Save to Draft'
    },
    {
        'id': 'TC-4890-16',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Metode Entri Agunan',
        'title': 'Validasi Form 3-Step Tampil setelah Pilih Metode New / Existing Collateral',
        'type': 'Positive',
        'priority': 'High',
        'precondition': 'Halaman Data Agunan, kuota belum penuh',
        'steps': '1. Klik + Agunan\n2. Pilih "New Collateral"\n3. Ulangi dengan "Existing Collateral from CLS"',
        'expected': 'Untuk kedua metode form 3-step tampil dengan default Step 1 Informasi Umum Agunan.',
        'reference': 'Jira AC: Step of entry data agunan'
    },

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
