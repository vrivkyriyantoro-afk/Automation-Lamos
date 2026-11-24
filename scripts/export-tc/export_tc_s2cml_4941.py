import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('tests/bucketAgunan/S2CML-4941', exist_ok=True)

# ============================================================
# TC Matrix — S2CML-4941
# Bucket Agunan — Edit Agunan/Collaterals - Edit Data Existing
# ============================================================

test_cases = [

    # ─── KELOMPOK 1: MENU AKSI TITIK 3 & BUKA FORM EDIT ───────────────────────

    {
        'id': 'TC-4941-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Akses Menu Titik 3 & Buka Form Edit',
        'title': 'Validasi Ketersediaan Menu Titik 3 pada Kartu Agunan di Ringkasan Agunan',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Aplikasi pengajuan kredit memiliki minimal 1 data agunan yang telah diinput '
            '(status Draft atau Final). User berada di halaman ringkasan Bucket Agunan.'
        ),
        'steps': (
            '1. Masuk ke halaman Bucket Agunan pada pengajuan kredit\n'
            '2. Temukan kartu objek agunan yang terdaftar di daftar agunan\n'
            '3. Periksa keberadaan ikon tombol Titik 3 (three-dot context menu)'
        ),
        'expected': (
            'Ikon menu titik 3 terlihat jelas pada setiap kartu agunan (baik berstatus Draft maupun Final) '
            'dan dapat diklik oleh Account Officer.'
        ),
        'reference': 'S2CML-4941 Scope: Pembuatan titik 3 di object agunan'
    },
    {
        'id': 'TC-4941-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Akses Menu Titik 3 & Buka Form Edit',
        'title': 'Validasi Opsi Menu Aksi Titik 3 Menampilkan Opsi "Ubah"',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Kartu agunan tampil di ringkasan Bucket Agunan.'
        ),
        'steps': (
            '1. Klik ikon menu Titik 3 pada salah satu kartu agunan\n'
            '2. Periksa daftar opsi menu konteks (dropdown context menu) yang muncul'
        ),
        'expected': (
            'Dropdown context menu muncul menampilkan opsi tindakan, '
            'termasuk opsi "Ubah" (atau "Edit Agunan") di samping opsi "Lihat Details" dan "Hapus Agunan".'
        ),
        'reference': 'S2CML-4941 AC: View available action menu options'
    },
    {
        'id': 'TC-4941-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Akses Menu Titik 3 & Buka Form Edit',
        'title': 'Validasi Pembukaan Modal Form Agunan saat Klik Opsi "Ubah"',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Menu titik 3 pada kartu agunan terbuka.'
        ),
        'steps': (
            '1. Klik opsi "Ubah" pada menu titik 3\n'
            '2. Amati respons sistem dan tampilan modal dialog'
        ),
        'expected': (
            'Sistem membuka pop-up modal form agunan dengan judul "Ubah Agunan" (atau "Edit Agunan"). '
            'Stepper 3-step side navigation (Informasi umum, Data tambahan, Informasi kepemilikan) siap diakses.'
        ),
        'reference': 'S2CML-4941 AC: Fungsi Edit Data Agunan'
    },

    # ─── KELOMPOK 2: PREFILL & RETENSI DATA FORM AGUNAN EXISTING ──────────────

    {
        'id': 'TC-4941-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Prefill & Retensi Data Form Existing',
        'title': 'Validasi Seluruh Field Step 1 Ter-prefill Sesuai Data Terakhir yang Disimpan',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Agunan target telah memiliki data tersimpan pada Step 1 (Status agunan, Alamat, LPA, Penilaian). '
            'Modal Ubah Agunan terbuka.'
        ),
        'steps': (
            '1. Buka modal Ubah Agunan\n'
            '2. Periksa nilai pada Step 1: Jenis agunan, Status agunan, data alamat wilayah, radio LPA, dan nilai penilaian'
        ),
        'expected': (
            'Seluruh field pada Step 1 terisi otomatis (pre-filled) persis sesuai data terakhir yang tersimpan di sistem, '
            'tanpa ada field ter-reset ke kondisi kosong/default.'
        ),
        'reference': 'S2CML-4941 AC: Data sudah ter-prefilled sesuai kondisi data agunan terakhir'
    },
    {
        'id': 'TC-4941-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Prefill & Retensi Data Form Existing',
        'title': 'Validasi Seluruh Field Step 2 (Data Tambahan) Ter-prefill Lengkap',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Modal Ubah Agunan terbuka. Agunan memiliki data tambahan tersimpan (misal sertifikat SHM / BPKB / Deposito).'
        ),
        'steps': (
            '1. Klik Step 2 (Data tambahan agunan) pada side navigation kiri\n'
            '2. Periksa komponen spesifik yang dirender dan nilai isiannya'
        ),
        'expected': (
            'Komponen spesifik (Housing / Vehicle / Cash) ter-render sesuai jenis agunan, '
            'dan seluruh field data tambahan (Nomor dokumen, tanggal, spesifikasi) terisi utuh sesuai data tersimpan.'
        ),
        'reference': 'S2CML-4941 AC: Prefill Data Tambahan Agunan'
    },
    {
        'id': 'TC-4941-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Prefill & Retensi Data Form Existing',
        'title': 'Validasi Step 3 (Informasi Kepemilikan) Ter-prefill Beserta Dokumen yang Di-upload',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Modal Ubah Agunan terbuka. Agunan memiliki data kepemilikan dan file dokumen tersimpan.'
        ),
        'steps': (
            '1. Klik Step 3 (Informasi kepemilikan)\n'
            '2. Periksa dropdown Kategori, Nama, NIK, dan daftar dokumen lampiran'
        ),
        'expected': (
            'Kategori pemilik, data identitas, hubungan debitur, serta berkas lampiran yang sudah diunggah '
            'tetap ter-load dan tampil lengkap pada form Step 3.'
        ),
        'reference': 'S2CML-4941 AC: Prefill Informasi Kepemilikan'
    },

    # ─── KELOMPOK 3: EDIT AGUNAN STATUS DRAFT VS FINAL (SAVE TO DRAFT GATING) ──

    {
        'id': 'TC-4941-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Edit Agunan Status Draft vs Final',
        'title': 'Validasi Tombol "Simpan sebagai draft" Aktif saat Mengedit Agunan Berstatus DRAFT',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Agunan target berada dalam status DRAFT (belum final, indikator step ada yang belum lengkap).'
        ),
        'steps': (
            '1. Klik Titik 3 pada agunan berstatus DRAFT → pilih "Ubah"\n'
            '2. Ubah salah satu nilai kolom (misal: Alamat)\n'
            '3. Periksa status tombol "Simpan sebagai draft" di footer modal'
        ),
        'expected': (
            'Tombol "Simpan sebagai draft" berstatus enabled (dapat diklik). '
            'AO dapat memperbarui data draft sementara tanpa kewajiban melengkapi seluruh field mandatory.'
        ),
        'reference': 'S2CML-4941 User Story: Resume progress from previously saved draft'
    },
    {
        'id': 'TC-4941-08',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Edit Agunan Status Draft vs Final',
        'title': 'Validasi Tombol "Simpan sebagai draft" Wajib Disabled saat Mengedit Agunan Berstatus FINAL',
        'type': 'Negative',
        'priority': 'Critical',
        'precondition': (
            'Agunan target berada dalam status FINAL (sudah tersimpan lengkap / submitted).'
        ),
        'steps': (
            '1. Klik Titik 3 pada agunan berstatus FINAL → pilih "Ubah"\n'
            '2. Masuk ke halaman form modal agunan\n'
            '3. Periksa status tombol "Simpan sebagai draft" pada bagian footer modal'
        ),
        'expected': (
            'Tombol "Simpan sebagai draft" (Save to Draft) WAJIB berstatus DISABLED (aria-disabled="true" / tidak dapat diklik). '
            'Sistem secara ketat mencegah agunan yang statusnya sudah Final turun (downgrade) kembali menjadi Draft.'
        ),
        'reference': 'S2CML-4941 Edge Cases: Button Save to Draft ter-disable di Agunan status FINAL'
    },
    {
        'id': 'TC-4941-09',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Edit Agunan Status Draft vs Final',
        'title': 'Validasi Tombol "Simpan" (Final) Aktif saat Edit Agunan Final dengan Data Valid',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Modal Ubah Agunan status Final terbuka. Seluruh field mandatory terpenuhi.'
        ),
        'steps': (
            '1. Lakukan perubahan data valid pada salah satu field (misal: Catatan atau No Sertifikat)\n'
            '2. Periksa status tombol "Simpan" di footer modal'
        ),
        'expected': (
            'Tombol "Simpan" berstatus enabled (aktif). '
            'Sistem mengizinkan simpan perubahan final dengan mempertahankan status agunan tetap FINAL.'
        ),
        'reference': 'S2CML-4941 AC: Make changes on finally saved data'
    },

    # ─── KELOMPOK 4: VALIDASI PEMBATALAN & FORM RULES SAAT EDIT ────────────────

    {
        'id': 'TC-4941-10',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Pembatalan & Form Rules Edit',
        'title': 'Validasi Pembatalan Edit Agunan Mengembalikan Data ke Kondisi Semula (Tanpa Tersimpan)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Modal Ubah Agunan terbuka dengan data prefilled.'
        ),
        'steps': (
            '1. Ubah beberapa nilai field pada form agunan\n'
            '2. Klik tombol "Batalkan" (atau tekan tombol Escape / klik ikon silang X)\n'
            '3. Buka kembali modal Ubah Agunan untuk agunan yang sama'
        ),
        'expected': (
            'Modal tertutup dan perubahan yang sempat diketik tidak tersimpan ke database. '
            'Saat modal dibuka kembali, nilai data kembali ke kondisi semula sebelum diedit (reverted).'
        ),
        'reference': 'S2CML-4941 AC: Cancelation handling & State Discard'
    },
    {
        'id': 'TC-4941-11',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Pembatalan & Form Rules Edit',
        'title': 'Validasi Tombol Simpan Disabled jika Field Mandatory Dikosongkan saat Edit Agunan Final',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Agunan berstatus FINAL. Modal Ubah Agunan terbuka.'
        ),
        'steps': (
            '1. Hapus nilai pada salah satu field mandatory (misal: kosongkan field Alamat atau NIK Pemilik)\n'
            '2. Blur field / pindah fokus\n'
            '3. Periksa status tombol "Simpan" di footer modal'
        ),
        'expected': (
            'Tombol "Simpan" otomatis menjadi disabled (aria-disabled="true"). '
            'Sistem memblokir proses simpan karena data agunan status Final tidak boleh memiliki field mandatory kosong.'
        ),
        'reference': 'S2CML-4941 AC & Form Validation Rules'
    },
    {
        'id': 'TC-4941-12',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Pembatalan & Form Rules Edit',
        'title': 'Validasi Indikator Status Stepper Tetap Akurat saat Field Diedit Menjadi Belum Lengkap',
        'type': 'Negative',
        'priority': 'Medium',
        'precondition': (
            'Agunan status Final dengan ketiga step berstatus "Lengkap".'
        ),
        'steps': (
            '1. Masuk ke Step 1 dan kosongkan salah satu field mandatory (misal: Provinsi)\n'
            '2. Pindah fokus atau amati indikator status Step 1 pada side-nav kiri'
        ),
        'expected': (
            'Indikator status Step 1 pada side-nav kiri otomatis berubah dari "Lengkap" menjadi "Belum Lengkap", '
            'secara reaktif menandakan bahwa form membutuhkan perbaikan sebelum dapat disimpan.'
        ),
        'reference': 'S2CML-4941 AC & S2CML-4890 AC-4 Step Indicators'
    }

]

# ─── GENERATE EXPORTS ─────────────────────────────────────────────────────────

headers = [
    'Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario',
    'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian',
    'Expected Result', 'Referensi Sumber'
]

# 1. Generate CSV (UTF-8 with BOM for Excel)
csv_path = os.path.join('tests', 'bucketAgunan', 'S2CML-4941', 'TC_S2CML-4941_Edit_Agunan_Existing.csv')
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
xlsx_path = os.path.join('tests', 'bucketAgunan', 'S2CML-4941', 'TC_S2CML-4941_Edit_Agunan_Existing.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-4941'

ws.append(headers)

# Styling header (Dark Violet)
header_fill = PatternFill(start_color='4C1D95', end_color='4C1D95', fill_type='solid')
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
    'Akses Menu Titik 3 & Buka Form Edit':     'EFF6FF',
    'Prefill & Retensi Data Form Existing':   'F0FDF4',
    'Edit Agunan Status Draft vs Final':      'FEFCE8',
    'Kalkulasi Ulang Nilai & Rasio Fasilitas': 'F5F3FF',
    'Validasi Pembatalan & Form Rules Edit':   'FFF1F2',
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

