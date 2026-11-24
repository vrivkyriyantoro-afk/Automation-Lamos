import os
import sys
import csv
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('tests/bucketAgunan/S2CML-5419', exist_ok=True)

test_cases = [{'id': 'TC-5419-01',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Entry Point & Prekondisi',
  'title': 'Validasi Field Jenis Agunan Disabled saat Masuk Form Informasi Umum',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'User telah memilih Jenis Agunan di Stepper 1 dan membuka Form Informasi Umum Agunan (Agunan Baru maupun Load Existing)',
  'steps': '1. Buka form Step 1 Informasi Umum Agunan.\n2. Periksa status interaksi pada input Jenis Agunan.',
  'expected': 'Field Jenis Agunan berstatus disabled (tidak dapat diubah langsung di form) untuk mencegah perubahan ekstrem yang berdampak pada struktur UI.',
  'reference': 'Jira S2CML-5419 AC: Pre Condition - Pilihan Search Existing Agunan'},
 {'id': 'TC-5419-02',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Entry Point & Prekondisi',
  'title': 'Validasi Tombol Kembali untuk Mengubah Pilihan Jenis Agunan',
  'type': 'Positive',
  'priority': 'Medium',
  'precondition': 'User berada di Form Step 1 Informasi Umum Agunan',
  'steps': '1. Klik tombol "Kembali" di panel kiri bawah modal.\n2. Periksa tampilan modal.',
  'expected': 'Sistem mengembalikan user ke tampilan Stepper 1 (Search Existing / Pilih Jenis Agunan) sehingga user dapat memilih ulang Jenis Agunan yang diinginkan.',
  'reference': 'Jira S2CML-5419 AC: Untuk user apabila sering melakukan kesalahan'},
 {'id': 'TC-5419-03',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Pengikatan Agunan',
  'title': 'Validasi Tanggal Pengikatan Opsional/Wajib sesuai Jenis Pengikatan',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Form Informasi Umum Agunan terbuka, Status Agunan = Tersedia',
  'steps': '1. Pilih Jenis Pengikatan = "Belum diikat" (kode 06), periksa label Tanggal Pengikatan.\n'
           '2. Pilih Jenis Pengikatan selain "Belum diikat" (mis. "Hak Tanggungan"), periksa label dan kosongkan Tanggal Pengikatan.',
  'expected': '- Belum diikat: Tanggal Pengikatan opsional (tanda * hilang), form dapat disimpan tanpa mengisinya.\n'
              '- Selain Belum diikat: Tanggal Pengikatan wajib (tanda * merah); jika kosong, sistem menampilkan pesan error mandatory.',
  'reference': 'Jira S2CML-5419 AC: Detailing Jenis Pengikatan (Belum diikat) | Detailing Jenis Pengikatan (Selain Belum diikat)'},
 {'id': 'TC-5419-04',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Pengikatan Agunan',
  'title': 'Validasi Status Agunan Menampilkan/Menyembunyikan Field Pengikatan Agunan',
  'type': 'Positive',
  'priority': 'Medium',
  'precondition': 'Form Informasi Umum Agunan terbuka',
  'steps': '1. Pilih Status Agunan = "Indent" (kode 2), periksa seksi Pengikatan Agunan.\n2. Pilih Status Agunan = "Tersedia" (kode 1), periksa seksi Pengikatan Agunan.',
  'expected': '- Indent: Jenis Pengikatan dan Tanggal Pengikatan disembunyikan.\n- Tersedia: Jenis Pengikatan dan Tanggal Pengikatan tampil lengkap.',
  'reference': 'Jira S2CML-5419 AC: Conditional Hidden Entry Point Data | Entry Point Data'},
 {'id': 'TC-5419-05',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Peringkat & Lembaga Pemeringkat',
  'title': 'Validasi Field Peringkat Cash Collateral / Dokumen sesuai Status Agunan',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Form Informasi Umum Agunan terbuka',
  'steps': '1. Pilih Jenis Agunan kategori Cash Collateral (mis. Tabungan/Deposito) atau Dokumen.\n'
           '2. Pilih Status Agunan = "Tersedia", periksa form.\n'
           '3. Ubah Status Agunan menjadi "Indent" (non-tersedia), periksa form.',
  'expected': '- Tersedia: "Lembaga Pemeringkat Agunan" dan "Peringkat Agunan" tampil.\n- Bukan Tersedia: kedua field disembunyikan.',
  'reference': 'Jira S2CML-5419 AC: Detailing antara Jenis Agunan by CLS dan Status Agunan | Conditional Hidden Entry Point Data'},
 {'id': 'TC-5419-06',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Peringkat & Lembaga Pemeringkat',
  'title': 'Validasi Opsi Dropdown Lembaga Pemeringkat',
  'type': 'Positive',
  'priority': 'Medium',
  'precondition': 'Field Lembaga Pemeringkat Agunan tampil',
  'steps': '1. Klik dropdown Lembaga Pemeringkat Agunan.\n2. Periksa daftar opsi yang muncul.',
  'expected': 'Menampilkan daftar lembaga pemeringkat resmi sesuai master data (misal: FID, FIN, MIS, PEF, SNP).',
  'reference': 'Jira S2CML-5419 AC: Detailing Jenis Agunan by CLS'},
 {'id': 'TC-5419-07',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Peringkat & Lembaga Pemeringkat',
  'title': 'Validasi Peringkat Agunan Disabled sebelum dan Aktif setelah Lembaga Pemeringkat Dipilih',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Dropdown Lembaga Pemeringkat Agunan tampil, belum ada pilihan',
  'steps': '1. Klik field Peringkat Agunan sebelum Lembaga dipilih.\n2. Pilih salah satu Lembaga Pemeringkat (mis. PEF / Fitch).\n3. Buka dropdown Peringkat Agunan.',
  'expected': '- Sebelum Lembaga dipilih: field disabled atau muncul pesan "Pilih lembaga pemeringkat terlebih dahulu".\n'
              '- Setelah dipilih: daftar rating (mis. AAA, AA+, AA, A, BBB, dst.) aktif dan dapat dipilih sesuai standar lembaga.',
  'reference': 'Jira S2CML-5419 AC: Detailing Peringkat Agunan | Detailing Peringkat Agunan'},
 {'id': 'TC-5419-08',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Informasi Alamat Agunan',
  'title': 'Validasi Dropdown Kecamatan Terurut secara Alfabetis A-Z',
  'type': 'Positive',
  'priority': 'Low',
  'precondition': 'Provinsi dan Kota/Kabupaten telah dipilih',
  'steps': '1. Klik dropdown Kecamatan.\n2. Periksa urutan opsi kecamatan.',
  'expected': 'Daftar kecamatan ditampilkan berurutan secara alfabetis (A-Z).',
  'reference': 'Jira S2CML-5419 AC & Master Wilayah'},
 {'id': 'TC-5419-09',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Informasi Alamat Agunan',
  'title': 'Validasi Sub-Location Tidak Menampilkan Opsi saat Parent Belum Dipilih',
  'type': 'Negative',
  'priority': 'Medium',
  'precondition': 'Provinsi belum dipilih',
  'steps': '1. Klik dropdown Kota/Kabupaten atau Kecamatan.',
  'expected': 'Dropdown sub-location tidak menampilkan daftar data atau berstatus disabled sebelum parent location dipilih.',
  'reference': 'Jira S2CML-5419 AC: Dependency Master Wilayah'},
 {'id': 'TC-5419-10',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Informasi Alamat Agunan',
  'title': 'Validasi Mengubah Parent Location Me-reset Pilihan Child Location',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Provinsi, Kota, dan Kecamatan telah dipilih',
  'steps': '1. Ubah pilihan Provinsi ke provinsi lain.\n2. Periksa nilai pada dropdown Kota dan Kecamatan.',
  'expected': 'Field Kota/Kabupaten dan Kecamatan otomatis ter-reset kembali ke placeholder awal (kosong).',
  'reference': 'Jira S2CML-5419 AC: Reset Dependency Wilayah'},
 {'id': 'TC-5419-11',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Informasi Alamat Agunan',
  'title': 'Validasi Input Kode Pos Non-Angka Ditolak dan Angka 5 Digit Diterima',
  'type': 'Negative',
  'priority': 'High',
  'precondition': 'Form Informasi Umum Agunan terbuka di seksi Alamat',
  'steps': '1. Masukkan huruf/simbol ke Kode Pos (mis. "ABCDE"), pindahkan fokus (blur) atau submit.\n2. Masukkan angka 5 digit valid (mis. "10110").',
  'expected': '- Non-angka: ditolak, muncul error "Kode pos wajib diisi dengan angka".\n- Angka 5 digit: diterima tanpa pesan error.',
  'reference': 'Jira S2CML-5419 AC: Input validation | Input validation'},
 {'id': 'TC-5419-12',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Tombol Tambah Data Pembanding sesuai Rules BE',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Skenario A: Jenis Agunan properti/tanah/bangunan, Status Tersedia. Skenario B: Jenis Agunan tanpa pembanding (mis. Cash Collateral / Tabungan).',
  'steps': '1. Skenario A: scroll ke bagian Data Pembanding, periksa tombol "+ Data Pembanding".\n2. Skenario B: periksa bagian penilaian / form informasi umum.',
  'expected': '- A (BE return 0 atau >0): tombol "+ Data Pembanding" tampil aktif.\n- B (BE return null): tombol tidak dimunculkan.',
  'reference': 'Jira S2CML-5419 AC: Logic Penentuan apakah butuh Data Pembanding atau tidak | IF BE Return value is null THEN dont show button'},
 {'id': 'TC-5419-13',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Tampilan Modal Input Data Pembanding saat Tombol Diklik',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Tombol "+ Data Pembanding" tampil',
  'steps': '1. Klik tombol "+ Data Pembanding".\n2. Periksa modal dialog yang muncul.',
  'expected': 'Muncul modal popup "Tambah data pembanding" yang berisi field Sumber Data Pembanding, Nama Pemberi Data, Nilai/Harga, dan tombol Batal/Simpan.',
  'reference': 'Jira S2CML-5419 AC: POP up Modal Data Pembanding'},
 {'id': 'TC-5419-14',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Tambah Data Pembanding Berhasil dan Masuk ke Tabel Preview',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Modal Tambah data pembanding terbuka',
  'steps': '1. Pilih Sumber Data Pembanding.\n2. Isi Nama dan Nilai/Harga valid.\n3. Klik tombol Simpan pada modal.',
  'expected': 'Modal tertutup dan data pembanding baru berhasil tampil pada baris tabel preview data pembanding.',
  'reference': 'Jira S2CML-5419 AC & FEBucket-Agunan'},
 {'id': 'TC-5419-15',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Lihat Detail Data Pembanding via Ikon Mata',
  'type': 'Positive',
  'priority': 'Medium',
  'precondition': 'Terdapat data pembanding pada tabel preview',
  'steps': '1. Klik ikon Mata (Lihat Detail) pada salah satu baris data pembanding.',
  'expected': 'Muncul modal detail data pembanding dalam status read-only.',
  'reference': 'Jira S2CML-5419 AC: Table Action'},
 {'id': 'TC-5419-16',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Ubah Data Pembanding via Ikon Pensil',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Terdapat data pembanding pada tabel preview',
  'steps': '1. Klik ikon Pensil (Ubah) pada salah satu baris data pembanding.\n2. Ubah data harga/nama.\n3. Klik Simpan.',
  'expected': 'Perubahan data berhasil tersimpan dan baris pada tabel preview ter-update dengan data baru.',
  'reference': 'Jira S2CML-5419 AC: Table Action'},
 {'id': 'TC-5419-17',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Hapus Data Pembanding dari Tabel Preview',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Terdapat data pembanding pada tabel preview',
  'steps': '1. Klik ikon Trash (Hapus) pada baris data pembanding.\n2. Konfirmasi pada modal konfirmasi (jika ada).',
  'expected': 'Data pembanding terhapus dan barisnya tidak lagi tampil pada tabel preview.',
  'reference': 'Jira S2CML-5419 AC: Table Action Delete'},
 {'id': 'TC-5419-18',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Data Pembanding Agunan',
  'title': 'Validasi Batas Maksimal Kapasitas 10 Record Data Pembanding',
  'type': 'Negative',
  'priority': 'Medium',
  'precondition': 'Tabel data pembanding telah terisi 10 record',
  'steps': '1. Periksa status tombol "+ Data Pembanding" saat jumlah record mencapai 10.\n2. Coba klik tambah data ke-11.',
  'expected': 'Tombol "+ Data Pembanding" menjadi disabled atau memunculkan validasi batas maksimum telah tercapai, dan jumlah data tetap maksimal 10 record.',
  'reference': 'Jira S2CML-5419 AC & FE Data Dict baris 97-107'},
 {'id': 'TC-5419-19',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Hasil Penilaian Agunan',
  'title': 'Validasi Tampilan Field Penilaian Agunan Tipe Internal',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Form Informasi Umum Agunan terbuka pada seksi Penilaian Agunan',
  'steps': '1. Pilih Tipe Penilaian = "Internal".\n2. Periksa field-field penilaian yang ditampilkan.',
  'expected': 'Sistem menampilkan field Nilai Agunan / Nilai Wajar, Nilai Agunan Menurut Pelapor, dan Tanggal Penilaian Menurut Pelapor. Field KJPP eksternal disembunyikan.',
  'reference': 'Jira S2CML-5419 AC: Detailing Apabila dipilih Jenis Penilaian adalah Internal'},
 {'id': 'TC-5419-20',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Hasil Penilaian Agunan',
  'title': 'Validasi Tampilan Field Penilaian Agunan Tipe External KJPP',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Form Informasi Umum Agunan terbuka pada seksi Penilaian Agunan',
  'steps': '1. Pilih Tipe Penilaian = "External" / KJPP.\n2. Periksa field-field penilaian yang ditampilkan.',
  'expected': 'Sistem menampilkan field Nilai Agunan / Nilai Wajar, Nilai Agunan Menurut Hasil Penilaian Independen, Nama Instansi Penilai Independen, dan Tanggal Penilaian Menurut Penilai '
              'Independen.',
  'reference': 'Jira S2CML-5419 AC: Detailing Apabila dipilih Jenis Penilaian adalah External'},
 {'id': 'TC-5419-21',
  'debtor_type': 'Perorangan & Badan Usaha',
  'group': 'Hasil Penilaian Agunan',
  'title': 'Validasi Auto-Sync Nilai dan Tanggal Pelapor di Backend saat Penilaian External',
  'type': 'Positive',
  'priority': 'High',
  'precondition': 'Tipe Penilaian = External / KJPP',
  'steps': '1. Isi Nilai Agunan Menurut Penilai Independen (mis. 1.000.000.000) dan Tanggal Penilaian Independen.\n2. Simpan draft atau submit form.\n3. Periksa payload data backend.',
  'expected': 'Backend secara otomatis mengisi field Nilai Agunan Menurut Pelapor dan Tanggal Penilaian Menurut Pelapor sama dengan data penilai independen.',
  'reference': 'Jira S2CML-5419 AC: Detailing External (backend auto-sync)'}]

# ─── EXPORT CSV ──────────────────────────────────────────────────────────
csv_file_path = os.path.join('tests', 'bucketAgunan', 'S2CML-5419', 'TC_S2CML-5419_Detailing_Informasi_Umum.csv')
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
xlsx_file_path = os.path.join('tests', 'bucketAgunan', 'S2CML-5419', 'TC_S2CML-5419_Detailing_Informasi_Umum.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'S2CML-5419'

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
    3: 26, # Kelompok
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
