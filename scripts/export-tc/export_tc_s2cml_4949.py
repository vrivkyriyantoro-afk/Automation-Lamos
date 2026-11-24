import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('exports/test-cases', exist_ok=True)

# ============================================================
# TC Matrix — S2CML-4949
# Bucket Agunan — Form Informasi Kepemilikan Agunan (Step 3)
# Setup Form Informasi Kepemilikan Agunan, New Data Identitas
# (Not in Bucket Identitas dan Pengecekan) — SLIK Checking Form
# ============================================================

test_cases = [

    # ─── KELOMPOK 1: RENDER DINAMIS KATEGORI 005 & 008 ────────────────────────

    {
        'id': 'TC-4949-01',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Render Dinamis Kategori 005 & 008',
        'title': 'Validasi Tampilan Form Dinamis saat Memilih Kategori "005 - Pemilik Agunan"',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'User berada di Step 3: Informasi Kepemilikan Agunan pada modal Tambah Agunan Baru. '
            'Bucket Identitas dan Pengecekan berstatus Lengkap.'
        ),
        'steps': (
            '1. Klik dropdown Kategori Kepemilikan Agunan pada Step 3\n'
            '2. Pilih opsi "005 - Pemilik Agunan"\n'
            '3. Periksa field baru yang muncul di bawah dropdown Kategori'
        ),
        'expected': (
            'Sistem secara dinamis merender form isian pemilik agunan baru yang memuat:\n'
            '1. Dropdown "Tipe Kepemilikan" (opsi: Perorangan / Badan Usaha)\n'
            '2. Dropdown "Hubungan dengan Debitur"\n'
            '3. Card/section Form SLIK Check data pemilik agunan.\n'
            'Otomasi inquiry SLIK dinonaktifkan (hidden) dan dialihkan ke form data mandatory SLIK & upload manual.'
        ),
        'reference': 'S2CML-4949 AC: Triggering Dropdown List & Kondisi Kategori 005'
    },
    {
        'id': 'TC-4949-02',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Render Dinamis Kategori 005 & 008',
        'title': 'Validasi Tampilan Form Dinamis saat Memilih Kategori "008 - Vendor"',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'User berada di Step 3: Informasi Kepemilikan Agunan pada modal Tambah Agunan Baru.'
        ),
        'steps': (
            '1. Klik dropdown Kategori Kepemilikan Agunan pada Step 3\n'
            '2. Pilih opsi "008 - Vendor"\n'
            '3. Periksa elemen form dinamis yang dirender di layar'
        ),
        'expected': (
            'Sistem merender komponen yang identik dengan kategori 005:\n'
            '1. Dropdown Tipe Kepemilikan (Perorangan / Badan Usaha)\n'
            '2. Dropdown Hubungan dengan Debitur\n'
            '3. Form SLIK Check untuk verifikasi kelayakan vendor baru.'
        ),
        'reference': 'S2CML-4949 AC: Kondisi Kategori 008 - Vendor'
    },
    {
        'id': 'TC-4949-03',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Render Dinamis Kategori 005 & 008',
        'title': 'Validasi Opsi Dropdown Tipe Kepemilikan pada Kategori 005 & 008',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'User sudah memilih Kategori "005 - Pemilik Agunan" atau "008 - Vendor". '
            'Dropdown Tipe Kepemilikan telah muncul.'
        ),
        'steps': (
            '1. Klik dropdown "Tipe Kepemilikan"\n'
            '2. Periksa daftar opsi yang tersedia pada listbox'
        ),
        'expected': (
            'Dropdown Tipe Kepemilikan menampilkan tepat 2 opsi:\n'
            '- Perorangan\n'
            '- Badan Usaha\n'
            'User dapat memilih salah satu tipe kepemilikan tersebut.'
        ),
        'reference': 'S2CML-4949 AC: Tipe Kepemilikan Dropdown'
    },

    # ─── KELOMPOK 2: FORM SLIK CHECK — TIPE PERORANGAN ─────────────────────────

    {
        'id': 'TC-4949-04',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Perorangan',
        'title': 'Validasi Kelengkapan Field Form SLIK saat Memilih Tipe Kepemilikan "Perorangan"',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Kategori Kepemilikan telah dipilih 005 atau 008. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Pada dropdown Tipe Kepemilikan, pilih "Perorangan"\n'
            '2. Amati form input SLIK Check yang muncul di bawahnya\n'
            '3. Periksa tanda mandatory (*) pada masing-masing label field'
        ),
        'expected': (
            'Form SLIK Check Perorangan menampilkan field:\n'
            '- Nama Lengkap: Mandatory (bertanda *)\n'
            '- Nomor Identitas / NIK KTP: Mandatory (bertanda *)\n'
            '- Upload Dokumen File KTP: Mandatory (bertanda *)\n'
            '- Jenis Kelamin: Opsional (tanpa *)\n'
            '- Tempat / Tanggal Lahir: Opsional (tanpa *)\n'
            '- Status Perkawinan: Opsional (tanpa *)'
        ),
        'reference': 'S2CML-4949 AC: Tipe Kepemilikan Perorangan Mandatory & Optional'
    },
    {
        'id': 'TC-4949-05',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Perorangan',
        'title': 'Validasi Input Format NIK 16 Digit Angka pada Form SLIK Perorangan',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Tipe Kepemilikan Perorangan telah dipilih. Field Nomor Identitas/NIK tampil.'
        ),
        'steps': (
            '1. Isi field Nomor Identitas dengan 16 digit angka valid (misal: 3201011205900001)\n'
            '2. Blur field / pindah fokus ke field lain'
        ),
        'expected': (
            'Input NIK diterima oleh sistem tanpa pesan error validasi format. '
            'Field bernilai tepat 16 karakter angka.'
        ),
        'reference': 'S2CML-4949 Data Point: Nomor Identitas Perorangan'
    },
    {
        'id': 'TC-4949-06',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Perorangan',
        'title': 'Validasi Upload Dokumen KTP Pemilik Agunan Berhasil',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Form SLIK Check Perorangan aktif. Komponen upload file KTP tersedia.'
        ),
        'steps': (
            '1. Klik area upload dokumen KTP atau seret file ktp_sample.jpg / ktp.pdf\n'
            '2. Tunggu proses staging/upload selesai\n'
            '3. Periksa status file yang ter-upload'
        ),
        'expected': (
            'File KTP berhasil terunggah, nama file muncul pada preview kartu upload, '
            'dan terdapat tombol aksi untuk melihat (preview) atau menghapus file KTP.'
        ),
        'reference': 'S2CML-4949 AC: File KTP Mandatory'
    },
    {
        'id': 'TC-4949-07',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Perorangan',
        'title': 'Validasi Opsi Dropdown Status Perkawinan pada SLIK Perorangan',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'Form SLIK Check Perorangan aktif.'
        ),
        'steps': (
            '1. Klik dropdown "Status Perkawinan"\n'
            '2. Periksa daftar pilihan status perkawinan'
        ),
        'expected': (
            'Dropdown memuat pilihan master status perkawinan standar '
            '("Belum Menikah", "Menikah", "Cerai Hidup / Janda / Duda") sesuai master data Bucket Debitur.'
        ),
        'reference': 'S2CML-4949 AC: Status Perkawinan Opsional'
    },

    # ─── KELOMPOK 3: FORM SLIK CHECK — TIPE BADAN USAHA ────────────────────────

    {
        'id': 'TC-4949-08',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Badan Usaha',
        'title': 'Validasi Kelengkapan Field Form SLIK saat Memilih Tipe Kepemilikan "Badan Usaha"',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Kategori Kepemilikan telah dipilih 005 atau 008. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Pada dropdown Tipe Kepemilikan, pilih "Badan Usaha"\n'
            '2. Amati struktur form SLIK Check Badan Usaha yang muncul di layar\n'
            '3. Periksa tanda bintang mandatory (*)'
        ),
        'expected': (
            'Form SLIK Check Badan Usaha menampilkan field:\n'
            '- Nama Badan Usaha: Mandatory (bertanda *)\n'
            '- Nomor Identitas (NPWP / NIB): Mandatory (bertanda *)\n'
            '- Jenis Badan Usaha: Dropdown pilihan (PT, CV, dll.)\n'
            '- Lokasi Pendirian Badan Usaha: Opsional (tanpa *)\n'
            '- Nomor Telepon Badan Usaha: Opsional (tanpa *)\n'
            '- Nomor HP Badan Usaha: Opsional (tanpa *)\n'
            '- Email Badan Usaha: Opsional (tanpa *)\n'
            '- Nama PIC: Opsional (tanpa *)\n'
            '- Nomor Telp PIC: Opsional (tanpa *)'
        ),
        'reference': 'S2CML-4949 AC: Tipe Kepemilikan Badan Usaha Mandatory & Optional'
    },
    {
        'id': 'TC-4949-09',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Badan Usaha',
        'title': 'Validasi Opsi Dropdown Jenis Badan Usaha pada Form SLIK Badan Usaha',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Tipe Kepemilikan Badan Usaha aktif pada Form SLIK.'
        ),
        'steps': (
            '1. Klik dropdown "Jenis Badan Usaha"\n'
            '2. Periksa seluruh opsi entitas hukum pada listbox'
        ),
        'expected': (
            'Dropdown menampilkan opsi badan hukum yang lengkap:\n'
            'Perseroan Terbatas (PT), Commanditaire Vennootschap (CV), Firma, Koperasi, Yayasan, dll., '
            'sesuai referensi master entitas legalitas LAMOS.'
        ),
        'reference': 'S2CML-4949 Data Point: Jenis Badan Usaha'
    },
    {
        'id': 'TC-4949-10',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Badan Usaha',
        'title': 'Validasi Pengisian Informasi PIC Badan Usaha',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'Tipe Kepemilikan Badan Usaha aktif.'
        ),
        'steps': (
            '1. Isi field "Nama PIC" dengan teks (misal: "Budi Santoso")\n'
            '2. Isi field "Nomor Telp PIC" dengan format nomor handphone valid (misal: "081234567890")\n'
            '3. Periksa respons field input'
        ),
        'expected': (
            'Data kontak PIC berhasil tersimpan pada form tanpa validasi error karena bersifat opsional pendukung.'
        ),
        'reference': 'S2CML-4949 AC: Data PIC Badan Usaha'
    },
    {
        'id': 'TC-4949-11',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Form SLIK Check — Tipe Badan Usaha',
        'title': 'Validasi Pergantian Tipe Kepemilikan dari Perorangan ke Badan Usaha Me-reset Form',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'User telah mengisi data pada Form SLIK Perorangan (Nama & NIK terisi).'
        ),
        'steps': (
            '1. Ganti pilihan dropdown Tipe Kepemilikan dari "Perorangan" menjadi "Badan Usaha"\n'
            '2. Amati perubahan form input di layar'
        ),
        'expected': (
            'Form SLIK Perorangan tertutup dan digantikan oleh Form SLIK Badan Usaha. '
            'Nilai isian sebelumnya otomatis ter-reset bersih dan field baru siap menerima isian badan usaha.'
        ),
        'reference': 'S2CML-4949 AC: Dynamic Form Switch & State Consistency'
    },

    # ─── KELOMPOK 4: AUTO-MAPPING SMARTCA & MCKINSEY ───────────────────────────

    {
        'id': 'TC-4949-12',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Auto-Mapping SmartCA & McKinsey',
        'title': 'Validasi Auto-Mapping saat Hubungan dengan Debitur Dipilih "Milik Sendiri"',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Kategori 005/008 aktif. User berada di field Hubungan dengan Debitur.'
        ),
        'steps': (
            '1. Klik dropdown "Hubungan dengan Debitur"\n'
            '2. Pilih "Milik Sendiri"\n'
            '3. Amati penetapan parameter di sistem backend / UI'
        ),
        'expected': (
            'Sistem secara otomatis menetapkan pemetaan SmartCA/McKinsey:\n'
            '- Status Kepemilikan (SmartCA): "Milik"\n'
            '- Hubungan dengan Debitur (McKinsey): "Debitur Sendiri"\n'
            'Sesuai tabel mapping resmi LAMOS to SmartCA.'
        ),
        'reference': 'S2CML-4949 Table Reff Mapping Baris 1'
    },
    {
        'id': 'TC-4949-13',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Auto-Mapping SmartCA & McKinsey',
        'title': 'Validasi Auto-Mapping saat Hubungan dengan Debitur Dipilih "Pasangan (Suami / Istri)"',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Kategori 005/008 aktif.'
        ),
        'steps': (
            '1. Buka dropdown "Hubungan dengan Debitur"\n'
            '2. Pilih "Pasangan (Suami / Istri)"\n'
            '3. Amati penetapan parameter'
        ),
        'expected': (
            'Sistem secara otomatis menetapkan pemetaan SmartCA/McKinsey:\n'
            '- Status Kepemilikan (SmartCA): "Kepemilikan Bersama"\n'
            '- Hubungan dengan Debitur (McKinsey): "Pasangan"'
        ),
        'reference': 'S2CML-4949 Table Reff Mapping Baris 2'
    },
    {
        'id': 'TC-4949-14',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Auto-Mapping SmartCA & McKinsey',
        'title': 'Validasi Auto-Mapping Hubungan Pihak Ketiga (Orang Tua / Anak / Perusahaan / Penjamin)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Kategori 005/008 aktif.'
        ),
        'steps': (
            '1. Pilih opsi hubungan: "Orang Tua", "Anak", "Pemilik (Pengurus Perusahaan)", atau "Penjamin"\n'
            '2. Amati penetapan Status Kepemilikan pada sistem'
        ),
        'expected': (
            'Seluruh opsi tersebut secara otomatis memetakan:\n'
            '- Status Kepemilikan (SmartCA): "Milik pihak ketiga"\n'
            '- Hubungan McKinsey disesuaikan (Orang Tua -> Orang Tua, Anak -> Anak, Perusahaan -> Perusahaan, Penjamin -> Penjamin).'
        ),
        'reference': 'S2CML-4949 Table Reff Mapping Baris 3-8'
    },
    {
        'id': 'TC-4949-15',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Auto-Mapping SmartCA & McKinsey',
        'title': 'Validasi Auto-Mapping Pemilik Sebelumnya (Jual Beli / Waris / Hibah)',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'Kategori 005/008 aktif.'
        ),
        'steps': (
            '1. Pilih opsi hubungan: "Pemilik Sebelumnya (Jual Beli)", "Pemilik Sebelumnya (Waris)", atau "Pemilik Sebelumnya (Hibah)"\n'
            '2. Amati penetapan Status Kepemilikan'
        ),
        'expected': (
            'Sistem memetakan secara otomatis:\n'
            '- Status Kepemilikan: "Dalam proses pemindahan pemilik"\n'
            '- Hubungan dengan Debitur (McKinsey): "Lainnya"'
        ),
        'reference': 'S2CML-4949 Table Reff Mapping Baris 9-11'
    },

    # ─── KELOMPOK 5: UPLOAD FILE SLIK PDF MANUAL (MVP) ─────────────────────────

    {
        'id': 'TC-4949-16',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload File SLIK PDF Manual',
        'title': 'Validasi Upload File SLIK PDF Manual Berhasil',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Kategori 005 atau 008 telah dipilih. Bagian upload file SLIK PDF tampil di form.'
        ),
        'steps': (
            '1. Klik tombol / dropzone upload file SLIK PDF\n'
            '2. Unggah berkas dokumen PDF valid (ukuran < 50MB)\n'
            '3. Tunggu proses upload selesai\n'
            '4. Amati daftar file terunggah'
        ),
        'expected': (
            'File PDF berhasil terunggah dan tampil dalam list file SLIK. '
            'Menampilkan nama file, ukuran file, tombol "Lihat" (view) untuk crosscheck dokumen, '
            'dan tombol ikon tempat sampah "Hapus" (delete).'
        ),
        'reference': 'S2CML-4949 AC: Setup Upload File SLIK PDF'
    },
    {
        'id': 'TC-4949-17',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Upload File SLIK PDF Manual',
        'title': 'Validasi Fitur Hapus File SLIK PDF yang Telah Di-upload',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Minimal 1 file dokumen SLIK PDF telah berhasil di-upload.'
        ),
        'steps': (
            '1. Klik ikon / tombol "Hapus" pada baris dokumen SLIK yang sudah ter-upload\n'
            '2. Konfirmasi penghapusan bila muncul modal konfirmasi\n'
            '3. Amati daftar file dokumen'
        ),
        'expected': (
            'File dokumen SLIK terhapus dari daftar upload staging. '
            'Slot upload kembali berkurang dan file tidak lagi tercatat pada form kepemilikan.'
        ),
        'reference': 'S2CML-4949 AC: User can remove/delete files'
    },

    # ─── KELOMPOK 6: VALIDASI FORM & BOUNDARY / NEGATIVE CASES ─────────────────

    {
        'id': 'TC-4949-18',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Form & Negative Cases',
        'title': 'Validasi Tombol Simpan Disabled saat Field Mandatory SLIK Perorangan Belum Lengkap',
        'type': 'Negative',
        'priority': 'Critical',
        'precondition': (
            'Kategori 005/008 dipilih dengan Tipe Kepemilikan Perorangan. '
            'Field Nama dan NIK masih kosong, atau File KTP belum diunggah.'
        ),
        'steps': (
            '1. Biarkan field mandatory Nama / NIK kosong atau jangan upload file KTP\n'
            '2. Periksa status tombol "Simpan" di bagian footer modal'
        ),
        'expected': (
            'Tombol "Simpan" berstatus disabled (aria-disabled="true"). '
            'Sistem memblokir proses simpan final agunan sampai seluruh field mandatory SLIK terpenuhi.'
        ),
        'reference': 'S2CML-4949 AC & S2CML-4890 AC-11 Gating Simpan'
    },
    {
        'id': 'TC-4949-19',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Form & Negative Cases',
        'title': 'Validasi Penolakan Upload Dokumen SLIK Melebihi Batas Maksimal 50MB',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Area upload dokumen SLIK PDF tampil di layar.'
        ),
        'steps': (
            '1. Coba unggah berkas PDF dengan ukuran melebihi 50MB (misal: file 55MB)\n'
            '2. Amati respons sistem dan notifikasi'
        ),
        'expected': (
            'Sistem menolak file tersebut, proses upload dibatalkan, '
            'dan muncul pesan error validasi ukuran: "Ukuran file melebihi batas maksimum 50MB".'
        ),
        'reference': 'S2CML-4949 AC: Maximum per file - 50MB'
    },
    {
        'id': 'TC-4949-20',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Validasi Form & Negative Cases',
        'title': 'Validasi Batas Maksimal Kuota Upload Dokumen SLIK Sebanyak 20 File',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'User telah berhasil mengunggah sebanyak 20 file dokumen SLIK PDF.'
        ),
        'steps': (
            '1. Coba lakukan upload file dokumen SLIK ke-21\n'
            '2. Amati tombol upload dan notifikasi sistem'
        ),
        'expected': (
            'Tombol upload menjadi disabled atau sistem menampilkan alert peringatan '
            'bahwa batas maksimal upload file (20 file) telah tercapai. File ke-21 tidak dapat ditambahkan.'
        ),
        'reference': 'S2CML-4949 AC: Max File uploaded - 20 file, no pagination'
    }

]

# ─── GENERATE EXPORTS ─────────────────────────────────────────────────────────

headers = [
    'Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario',
    'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian',
    'Expected Result', 'Referensi Sumber'
]

# 1. Generate CSV (UTF-8 with BOM for Excel)
csv_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4949_Informasi_Kepemilikan_New_Identity.csv')
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
xlsx_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4949_Informasi_Kepemilikan_New_Identity.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-4949'

ws.append(headers)

# Styling header (Deep Emerald)
header_fill = PatternFill(start_color='064E3B', end_color='064E3B', fill_type='solid')
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
    'Render Dinamis Kategori 005 & 008':     'F0FDF4',
    'Form SLIK Check — Tipe Perorangan':     'EFF6FF',
    'Form SLIK Check — Tipe Badan Usaha':    'FEFCE8',
    'Auto-Mapping SmartCA & McKinsey':       'F5F3FF',
    'Upload File SLIK PDF Manual':           'FDF4FF',
    'Validasi Form & Negative Cases':         'FFF1F2',
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

