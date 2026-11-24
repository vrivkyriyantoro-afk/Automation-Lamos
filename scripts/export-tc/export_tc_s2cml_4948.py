import os
import csv
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('exports/test-cases', exist_ok=True)

# ============================================================
# TC Matrix — S2CML-4948
# Bucket Agunan — Form Informasi Kepemilikan Agunan (Step 3)
# Setup Load From Bucket Identity
# Target App IDs:
#   Perorangan : 01M4F7TNSCSHEDB5G3WTSP7HDY (debtorType=individual)
#   Badan Usaha: 01M482PRSVH5ZMTVZX5QH0VDNZ (debtorType=business)
# ============================================================

test_cases = [

    # ─── KELOMPOK 1: DROPDOWN KATEGORI KEPEMILIKAN — PERORANGAN CALON DEBITUR ──

    {
        'id': 'TC-4948-01',
        'debtor_type': 'Perorangan',
        'group': 'Dropdown Kategori Kepemilikan — Perorangan',
        'title': 'Validasi Opsi Dropdown: Debitur Perorangan Tanpa Fasilitas Aktif BSB, Belum Menikah, Tanpa Penjamin',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Bucket Identitas & Pengecekan status Lengkap. '
            'Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY) '
            'belum memiliki fasilitas aktif di Bank Sinarmas (Struktur Kredit: Exposure kosong), '
            'status perkawinan Belum Menikah, '
            'tidak memiliki penjamin (Apakah Debitur Memiliki Penjamin = Tidak). '
            'User berada di Step 3 Form Informasi Kepemilikan Agunan.'
        ),
        'steps': (
            '1. Buka modal Tambah Agunan → masuk ke Step 3 Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Catat seluruh opsi yang tampil'
        ),
        'expected': (
            'Dropdown menampilkan tepat opsi berikut (tidak lebih, tidak kurang):\n'
            '- 001 - Calon Debitur\n'
            '- 005 - Pemilik Agunan\n'
            '- 008 - Vendor\n'
            'Opsi 002 (Pasangan Calon Debitur), 009 (Penjamin), 010 (Pasangan Penjamin) '
            'tidak tampil karena kondisi belum menikah & tidak memiliki penjamin.\n'
            'Opsi 003/004 (Debitur/Pasangan Debitur) tidak tampil karena belum ada fasilitas aktif.'
        ),
        'reference': 'S2CML-4948 AC-1 (Triggering Dropdown List) & Map Pilihan Dropdown'
    },
    {
        'id': 'TC-4948-02',
        'debtor_type': 'Perorangan',
        'group': 'Dropdown Kategori Kepemilikan — Perorangan',
        'title': 'Validasi Opsi Dropdown: Debitur Perorangan Tanpa Fasilitas Aktif BSB, Sudah Menikah, Memiliki Penjamin Perorangan',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan, belum memiliki fasilitas aktif di BSB, '
            'status perkawinan Menikah, '
            'memiliki Penjamin (Apakah Debitur Memiliki Penjamin = Ya), '
            'kode golongan penjamin Perorangan & status penjamin Menikah. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Catat seluruh opsi yang tampil'
        ),
        'expected': (
            'Dropdown memuat opsi:\n'
            '- 001 - Calon Debitur\n'
            '- 002 - Calon Pasangan Debitur\n'
            '- 005 - Pemilik Agunan\n'
            '- 008 - Vendor\n'
            '- 009 - Penjamin (PG)\n'
            '- 010 - Pasangan Penjamin\n'
            'Opsi 003/004 tidak muncul (belum ada fasilitas aktif). '
            'Opsi 006/007 tidak muncul (bukan Badan Usaha).'
        ),
        'reference': 'S2CML-4948 AC-1 & S2CML-4948 Sample 1'
    },
    {
        'id': 'TC-4948-03',
        'debtor_type': 'Perorangan',
        'group': 'Dropdown Kategori Kepemilikan — Perorangan',
        'title': 'Validasi Opsi Dropdown: Debitur Perorangan Sudah Memiliki Fasilitas Aktif BSB',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan sudah memiliki fasilitas aktif di Bank Sinarmas '
            '(terlihat dari Struktur Kredit - Exposure terisi). '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Catat opsi yang tampil dan bandingkan dengan TC-4948-01'
        ),
        'expected': (
            'Dropdown memuat opsi:\n'
            '- 003 - Debitur (menggantikan 001 - Calon Debitur)\n'
            '- 004 - Pasangan Debitur (menggantikan 002 - Calon Pasangan Debitur)\n'
            '- 005 - Pemilik Agunan\n'
            '- 008 - Vendor\n'
            'Opsi 001 dan 002 (Calon) tidak muncul karena debitur sudah memiliki fasilitas aktif.'
        ),
        'reference': 'S2CML-4948 AC-1 Map Pilihan Dropdown (kode 003 & 004)'
    },

    # ─── KELOMPOK 2: DROPDOWN KATEGORI KEPEMILIKAN — BADAN USAHA ───────────────

    {
        'id': 'TC-4948-04',
        'debtor_type': 'Badan Usaha',
        'group': 'Dropdown Kategori Kepemilikan — Badan Usaha',
        'title': 'Validasi Opsi Dropdown: Debitur Badan Usaha Sudah Memiliki Fasilitas Aktif BSB, Memiliki Penjamin',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ, debtorType=business), '
            'sudah memiliki fasilitas aktif di Bank Sinarmas, '
            'memiliki Penjamin (Apakah Debitur Memiliki Penjamin = Ya). '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Buka modal Tambah Agunan pada pengajuan Badan Usaha\n'
            '2. Masuk ke Step 3: Informasi Kepemilikan\n'
            '3. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '4. Catat seluruh opsi yang tampil'
        ),
        'expected': (
            'Dropdown memuat semua opsi:\n'
            '- 003 - Debitur\n'
            '- 004 - Pasangan Debitur\n'
            '- 005 - Pemilik Agunan\n'
            '- 006 - Pengurus Perusahaan\n'
            '- 007 - Pemilik Perusahaan\n'
            '- 008 - Vendor\n'
            '- 009 - Penjamin (PG)\n'
            'Opsi 006 dan 007 HARUS muncul karena jenis debitur adalah Badan Usaha.'
        ),
        'reference': 'S2CML-4948 AC-1 & S2CML-4948 Sample 2'
    },
    {
        'id': 'TC-4948-05',
        'debtor_type': 'Badan Usaha',
        'group': 'Dropdown Kategori Kepemilikan — Badan Usaha',
        'title': 'Validasi Opsi 006 & 007 Tidak Muncul pada Debitur Perorangan',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY, debtorType=individual). '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Cari opsi "006 - Pengurus Perusahaan" dan "007 - Pemilik Perusahaan"'
        ),
        'expected': (
            'Opsi "006 - Pengurus Perusahaan" dan "007 - Pemilik Perusahaan" '
            'tidak tampil sama sekali dalam dropdown Kategori Kepemilikan Agunan '
            'karena jenis debitur adalah Perorangan.'
        ),
        'reference': 'S2CML-4948 AC-1 Map Pilihan Dropdown (kode 006 & 007)'
    },

    # ─── KELOMPOK 3: NOTIFIKASI ENTITAS TIDAK TERSEDIA ─────────────────────────

    {
        'id': 'TC-4948-06',
        'debtor_type': 'Perorangan',
        'group': 'Notifikasi Entitas Tidak Tersedia',
        'title': 'Validasi Notif Muncul saat Pilih Kategori002 - Calon Pasangan Debitur tanpa Data Pasangan',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan belum menikah atau data pasangan belum ada '
            'di Bucket Identitas & Pengecekan.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "002 - Calon Pasangan Debitur" dari dropdown\n'
            '3. Amati respons sistem'
        ),
        'expected': (
            'Sistem menampilkan notifikasi/pesan error bahwa '
            '"Entitas Calon Pasangan Debitur tidak tersedia / belum terdaftar '
            'di Bucket Identitas dan Pengecekan". '
            'Form tidak dapat dilanjutkan sebelum data pasangan diisi di Bucket Identitas.'
        ),
        'reference': 'S2CML-4948 AC-2 (Notif entity tidak tersedia)'
    },
    {
        'id': 'TC-4948-07',
        'debtor_type': 'Perorangan',
        'group': 'Notifikasi Entitas Tidak Tersedia',
        'title': 'Validasi Notif Muncul saat Pilih Kategori009 - Penjamin (PG) tanpa Data Penjamin',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan tidak memiliki penjamin '
            '(Apakah Debitur Memiliki Penjamin = Tidak).'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "009 - Penjamin (PG)"\n'
            '3. Amati respons atau cek dropdown Nama Penjamin'
        ),
        'expected': (
            'Sistem menampilkan notifikasi/pesan bahwa '
            '"Data penjamin tidak tersedia / belum terdaftar di Bucket Identitas". '
            'Dropdown Nama Penjamin kosong atau form diblokir.'
        ),
        'reference': 'S2CML-4948 AC-2 (Notif entity tidak tersedia)'
    },
    {
        'id': 'TC-4948-08',
        'debtor_type': 'Badan Usaha',
        'group': 'Notifikasi Entitas Tidak Tersedia',
        'title': 'Validasi Notif Muncul saat Pilih006 - Pengurus Perusahaan tanpa Data Pengurus Terdaftar',
        'type': 'Negative',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Badan Usaha belum memiliki data Pengurus & Pemegang Saham '
            'di Bucket Identitas & Pengecekan.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "006 - Pengurus Perusahaan"\n'
            '3. Klik dropdown Nama\n'
            '4. Amati daftar yang muncul'
        ),
        'expected': (
            'Sistem menampilkan pesan/notifikasi bahwa '
            '"Data Pengurus Perusahaan belum tersedia di Bucket Identitas". '
            'Dropdown Nama kosong atau menampilkan placeholder peringatan.'
        ),
        'reference': 'S2CML-4948 AC-2 & AC-3 (Notif & Load list dari Bucket Identitas)'
    },

    # ─── KELOMPOK 4: LOAD LIST DARI BUCKET IDENTITAS ───────────────────────────

    {
        'id': 'TC-4948-09',
        'debtor_type': 'Badan Usaha',
        'group': 'Load List Nama dari Bucket Identitas',
        'title': 'Validasi Dropdown Nama Terisi dari List Pengurus Perusahaan (Bucket Identitas)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Badan Usaha memiliki minimal 2 pengurus terdaftar '
            'di Bucket Identitas & Pengecekan.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "006 - Pengurus Perusahaan"\n'
            '3. Klik dropdown "Nama"\n'
            '4. Amati daftar nama yang muncul'
        ),
        'expected': (
            'Dropdown Nama menampilkan daftar nama pengurus '
            'yang sesuai dengan data Pengurus & Pemegang Saham '
            'pada Bucket Identitas & Pengecekan (filter by kategori 006). '
            'Jumlah item = jumlah pengurus yang terdaftar.'
        ),
        'reference': 'S2CML-4948 AC-3 (Creating List Entity from Bucket Identitas)'
    },
    {
        'id': 'TC-4948-10',
        'debtor_type': 'Perorangan',
        'group': 'Load List Nama dari Bucket Identitas',
        'title': 'Validasi Dropdown Nama Terisi dari List Penjamin (Bucket Identitas)',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan memiliki minimal 1 penjamin terdaftar '
            'di Bucket Identitas & Pengecekan '
            '(Apakah Debitur Memiliki Penjamin = Ya).'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "009 - Penjamin (PG)"\n'
            '3. Klik dropdown "Nama"\n'
            '4. Amati daftar nama yang muncul'
        ),
        'expected': (
            'Dropdown Nama menampilkan daftar nama penjamin '
            'sesuai data penjamin di Bucket Identitas & Pengecekan. '
            'Hanya penjamin dengan kategori sesuai (009 - Penjamin PG) yang ditampilkan.'
        ),
        'reference': 'S2CML-4948 AC-3 & AC-5 (Triggering kategori Penjamin)'
    },

    # ─── KELOMPOK 5: AUTO-FILL CALON DEBITUR / DEBITUR ─────────────────────────

    {
        'id': 'TC-4948-11',
        'debtor_type': 'Perorangan',
        'group': 'Auto-Fill dari Bucket Debitur',
        'title': 'Validasi Pilih001 - Calon Debitur: Auto-Fill Nama Lengkap & NIK Debitur',
        'type': 'Positive',
        'priority': 'Critical',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY) '
            'belum memiliki fasilitas aktif di Bank Sinarmas. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Pilih "001 - Calon Debitur"\n'
            '4. Amati perubahan field Nama Lengkap dan Nomor KTP'
        ),
        'expected': (
            'Sistem secara otomatis mengisi:\n'
            '- Field "Nama Lengkap": terisi nama debitur dari Bucket Debitur (misal: MUNAWAROH)\n'
            '- Field "Nomor KTP / NIK": terisi NIK debitur (misal: 3209244711730001)\n'
            'Field tersebut ter-fill tanpa interaksi manual. '
            'Backend menetapkan: Tipe Kepemilikan = Perorangan, '
            'Hubungan dengan Debitur = Milik Sendiri, '
            'Status Kepemilikan = Milik.'
        ),
        'reference': 'S2CML-4948 AC-4 (Triggering Kategori Calon Debitur/Debitur)'
    },
    {
        'id': 'TC-4948-12',
        'debtor_type': 'Perorangan',
        'group': 'Auto-Fill dari Bucket Debitur',
        'title': 'Validasi Pilih002 - Calon Pasangan Debitur: Auto-Fill Nama Lengkap & NIK Pasangan',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan berstatus Menikah, '
            'data pasangan sudah terisi di Bucket Identitas. '
            'Debitur belum memiliki fasilitas aktif di Bank Sinarmas.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih "002 - Calon Pasangan Debitur"\n'
            '3. Amati field Nama Lengkap dan Nomor KTP'
        ),
        'expected': (
            'Sistem secara otomatis mengisi:\n'
            '- Field "Nama Lengkap": terisi nama pasangan dari Bucket Debitur\n'
            '- Field "Nomor KTP / NIK": terisi NIK pasangan\n'
            'Backend menetapkan: Tipe Kepemilikan = Perorangan, '
            'Hubungan dengan Debitur = Pasangan (Suami/Istri), '
            'Status Kepemilikan = Kepemilikan Bersama.'
        ),
        'reference': 'S2CML-4948 AC-4 & AC-5 (Triggering Pasangan Calon Debitur)'
    },
    {
        'id': 'TC-4948-13',
        'debtor_type': 'Badan Usaha',
        'group': 'Auto-Fill dari Bucket Debitur',
        'title': 'Validasi Pilih003 - Debitur pada Badan Usaha: Auto-Fill Nama Badan Usaha & NPWP',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ) '
            'sudah memiliki fasilitas aktif di Bank Sinarmas.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan pada pengajuan Badan Usaha\n'
            '2. Pilih "003 - Debitur" dari dropdown Kategori Kepemilikan\n'
            '3. Amati field yang ter-fill otomatis'
        ),
        'expected': (
            'Sistem secara otomatis mengisi:\n'
            '- Field "Nama Lengkap": terisi nama badan usaha dari Bucket Identitas\n'
            '- Field NPWP / nomor legalitas badan usaha (sesuai desain FE)\n'
            'Backend menetapkan: Tipe Kepemilikan = Badan Usaha, '
            'Hubungan dengan Debitur = Milik Sendiri, '
            'Status Kepemilikan = Milik.'
        ),
        'reference': 'S2CML-4948 AC-4 & S2CML-4948 Sample 2'
    },

    # ─── KELOMPOK 6: AUTO-FILL DARI LIST PENJAMIN / PENGURUS ───────────────────

    {
        'id': 'TC-4948-14',
        'debtor_type': 'Perorangan',
        'group': 'Auto-Fill dari List Penjamin & Pengurus',
        'title': 'Validasi Pilih009 - Penjamin (PG) & Nama: Auto-Fill Detail Penjamin',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan memiliki minimal 1 penjamin terdaftar. '
            'User berada di Step 3, sudah memilih kategori 009.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "009 - Penjamin (PG)"\n'
            '3. Klik dropdown "Nama" dan pilih salah satu penjamin\n'
            '4. Amati auto-fill field detail'
        ),
        'expected': (
            'Setelah memilih nama penjamin:\n'
            '- Field "Nama Lengkap": terisi nama penjamin\n'
            '- Field "Nomor KTP / NIK": terisi NIK penjamin\n'
            'Backend menetapkan: Tipe Kepemilikan = sesuai tipe penjamin, '
            'Hubungan dengan Debitur (McKinsey) = Penjamin, '
            'Status Kepemilikan = Milik pihak ketiga.'
        ),
        'reference': 'S2CML-4948 AC-5 (Triggering Penjamin PG)'
    },
    {
        'id': 'TC-4948-15',
        'debtor_type': 'Perorangan',
        'group': 'Auto-Fill dari List Penjamin & Pengurus',
        'title': 'Validasi Pilih010 - Pasangan Penjamin & Nama: Tampil Keterangan Pasangan dari Siapa',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan memiliki penjamin berstatus Menikah dan berjenis Perorangan. '
            'Data pasangan penjamin tersedia di Bucket Identitas.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "010 - Pasangan Penjamin"\n'
            '3. Klik dropdown "Nama"\n'
            '4. Amati list pasangan penjamin yang muncul'
        ),
        'expected': (
            'Dropdown Nama menampilkan daftar pasangan penjamin '
            'beserta keterangan "Pasangan dari [Nama Penjamin]". '
            'Setelah nama dipilih, field Nama Lengkap & NIK pasangan penjamin ter-fill otomatis. '
            'Backend: Status Kepemilikan = Milik pihak ketiga.'
        ),
        'reference': 'S2CML-4948 AC-5 (Triggering Pasangan Penjamin)'
    },
    {
        'id': 'TC-4948-16',
        'debtor_type': 'Badan Usaha',
        'group': 'Auto-Fill dari List Penjamin & Pengurus',
        'title': 'Validasi Pilih006 - Pengurus Perusahaan & Nama: Auto-Fill Detail Pengurus',
        'type': 'Positive',
        'priority': 'High',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Badan Usaha memiliki minimal 1 pengurus terdaftar '
            'di Bucket Identitas & Pengecekan. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "006 - Pengurus Perusahaan"\n'
            '3. Klik dropdown "Nama" dan pilih salah satu pengurus\n'
            '4. Amati auto-fill field dan dropdown Hubungan dengan Debitur'
        ),
        'expected': (
            'Setelah memilih nama pengurus:\n'
            '- Field "Nama Lengkap": terisi nama pengurus\n'
            '- Field "Nomor KTP / NIK": terisi NIK pengurus\n'
            '- Dropdown "Hubungan dengan Debitur": menampilkan semua opsi (perlu dipilih manual)\n'
            'Backend menetapkan: Hubungan dengan Debitur (McKinsey) = Perusahaan, '
            'Status Kepemilikan = Kepemilikan Bersama.'
        ),
        'reference': 'S2CML-4948 AC-5 (Triggering Pengurus/Pemilik Perusahaan)'
    },

    # ─── KELOMPOK 7: NEGATIVE — KONSISTENSI DATA & EDGE CASES ──────────────────

    {
        'id': 'TC-4948-17',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative & Edge Cases',
        'title': 'Validasi Field Bukti Kepemilikan Disabled dan Step 3 Belum Lengkap saat Data Tambahan Kosong',
        'type': 'Negative',
        'priority': 'Critical',
        'precondition': (
            'Field Bukti kepemilikan pada Step 2 (Data Tambahan Agunan) masih kosong.'
        ),
        'steps': (
            '1. Buka modal Tambah Agunan tanpa mengisi Bukti kepemilikan di Step 2\n'
            '2. Klik Step 3 (Informasi Kepemilikan) pada side-nav\n'
            '3. Periksa field Bukti kepemilikan, badge status stepper, dan tombol Simpan'
        ),
        'expected': (
            'Field "Bukti kepemilikan*" tampil kosong dengan placeholder '
            '"Otomatis terisi dari data tambahan agunan" dan berstatus disabled. '
            'Badge stepper "Informasi kepemilikan" tetap "Belum Lengkap" dan tombol Simpan disabled.'
        ),
        'reference': (
            'S2CML-4948 AC: Bukti kepemilikan auto-fill dari Step 2 | '
            'Asal: TC-4889-62 & TC-4889-63 (perampingan 2026-11-01). '
            'Gating Bucket Identitas adalah TC-4890-06 (AC S2CML-4890), bukan TC ini.'
        )
    },
    {
        'id': 'TC-4948-18',
        'debtor_type': 'Perorangan',
        'group': 'Negative & Edge Cases',
        'title': 'Validasi Opsi010 - Pasangan Penjamin Tidak Muncul saat Penjamin Berstatus Belum Menikah',
        'type': 'Negative',
        'priority': 'Medium',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan memiliki penjamin, '
            'namun kode golongan penjamin adalah Perorangan dengan status Belum Menikah.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Cari opsi "010 - Pasangan Penjamin"'
        ),
        'expected': (
            'Opsi "010 - Pasangan Penjamin" tidak tampil dalam dropdown '
            'karena penjamin tidak berstatus Menikah. '
            'Dropdown hanya memuat opsi yang sesuai kondisi.'
        ),
        'reference': 'S2CML-4948 AC-1 Map Pilihan Dropdown (kode 010: syarat Menikah)'
    },
    {
        'id': 'TC-4948-19',
        'debtor_type': 'Perorangan',
        'group': 'Negative & Edge Cases',
        'title': 'Validasi Data Auto-Fill Tidak Dapat Diedit Manual (Read-Only) untuk 001 & 002',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'Bucket Identitas status Lengkap. '
            'Debitur Perorangan, User sudah memilih kategori 001 - Calon Debitur '
            'dan field Nama Lengkap & NIK sudah ter-fill otomatis.'
        ),
        'steps': (
            '1. Setelah pilih "001 - Calon Debitur" dan field ter-fill\n'
            '2. Coba edit/hapus isi field "Nama Lengkap" secara manual\n'
            '3. Coba edit field "Nomor KTP / NIK"'
        ),
        'expected': (
            'Field Nama Lengkap dan Nomor KTP/NIK yang ter-fill otomatis dari Bucket Debitur '
            'bersifat read-only (tidak dapat diubah manual). '
            'User tidak bisa menimpa data yang di-fetch dari sistem.'
        ),
        'reference': 'S2CML-4948 AC-4 (Set at BE — auto-mapping, tidak dapat diubah FE)'
    },
    {
        'id': 'TC-4948-20',
        'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Negative & Edge Cases',
        'title': 'Validasi Ganti Kategori Kepemilikan: Data Auto-Fill Sebelumnya Ter-Reset',
        'type': 'Positive',
        'priority': 'Medium',
        'precondition': (
            'User berada di Step 3, sudah memilih kategori "001 - Calon Debitur" '
            'dan field Nama Lengkap & NIK sudah ter-fill.'
        ),
        'steps': (
            '1. Setelah field Nama & NIK ter-fill dari kategori 001\n'
            '2. Ganti dropdown Kategori Kepemilikan menjadi "005 - Pemilik Agunan"\n'
            '3. Amati field Nama Lengkap dan NIK'
        ),
        'expected': (
            'Saat kategori diganti, field Nama Lengkap dan Nomor KTP/NIK '
            'yang sebelumnya ter-fill otomatis menjadi kosong/reset. '
            'Form menyesuaikan dengan konfigurasi kategori baru.'
        ),
        'reference': 'S2CML-4948 AC-4 — konsistensi saat kategori berubah'
    },

]

# ─── PERAMPINGAN: gabung TC tumpang tindih (20 → 12) ──────────────────────────
# ID survivor tetap (tidak renumber) agar spec Playwright & tracker tetap cocok.
# survivor: (judul baru, [ID yang digabung])
MERGES = {
    'TC-4948-01': ('Validasi Opsi Dropdown Debitur Perorangan: 001/005/008 Tampil, 006/007 Tidak Tampil', ['TC-4948-05']),
    'TC-4948-06': ('Validasi Notif Entitas Tidak Tersedia: Kategori 002, 009, 006 tanpa Data di Bucket Identitas', ['TC-4948-07', 'TC-4948-08']),
    'TC-4948-09': ('Validasi Kategori 006 Pengurus: Dropdown Nama dari Bucket Identitas & Auto-Fill Detail', ['TC-4948-16']),
    'TC-4948-10': ('Validasi Kategori 009 Penjamin: Dropdown Nama dari Bucket Identitas & Auto-Fill Detail', ['TC-4948-14']),
    'TC-4948-11': ('Validasi Auto-Fill Nama & NIK Kategori 001/002 dan Field Read-Only', ['TC-4948-12', 'TC-4948-19']),
    'TC-4948-15': ('Validasi Kategori 010 Pasangan Penjamin: Tampil saat Menikah, Tidak Tampil saat Belum Menikah', ['TC-4948-18']),
}
_by_id = {t['id']: t for t in test_cases}
_PRIO = ['Medium', 'High', 'Critical']
for _sid, (_title, _ids) in MERGES.items():
    s = _by_id[_sid]
    parts = [s] + [_by_id[i] for i in _ids]
    s['title'] = _title
    s['debtor_type'] = ' & '.join(dict.fromkeys(
        d.strip() for p in parts for d in p['debtor_type'].split('&')))
    s['priority'] = max((p['priority'] for p in parts), key=_PRIO.index)
    for k, lbl in (('precondition', 'Prekondisi'), ('steps', 'Langkah'), ('expected', 'Expected')):
        s[k] = '\n\n'.join(f"[Skenario {n} — eks {p['id']}]\n{p[k]}" for n, p in enumerate(parts, 1))
    s['reference'] = ' | '.join(p['reference'] for p in parts) + \
        ' | Gabungan: ' + ', '.join(p['id'] for p in parts)

# Teks TC gabungan ditulis ulang manual (bukan hasil sambung otomatis).
OVERRIDES = {
    'TC-4948-01': {
        'debtor_type': 'Perorangan',
        'steps': (
            '1. Buka modal Tambah Agunan → masuk ke Step 3 Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Catat seluruh opsi yang tampil\n'
            '4. Cari opsi "006 - Pengurus Perusahaan" dan "007 - Pemilik Perusahaan"'
        ),
        'expected': (
            'Dropdown menampilkan tepat opsi berikut (tidak lebih, tidak kurang):\n'
            '- 001 - Calon Debitur\n'
            '- 005 - Pemilik Agunan\n'
            '- 008 - Vendor\n'
            'Opsi 002 (Pasangan Calon Debitur), 009 (Penjamin), 010 (Pasangan Penjamin) '
            'tidak tampil karena belum menikah & tidak memiliki penjamin.\n'
            'Opsi 003/004 (Debitur/Pasangan Debitur) tidak tampil karena belum ada fasilitas aktif.\n'
            'Opsi 006 (Pengurus Perusahaan) dan 007 (Pemilik Perusahaan) tidak tampil karena jenis debitur Perorangan.'
        ),
    },
    'TC-4948-06': {
        'debtor_type': 'Perorangan & Badan Usaha',
        'precondition': (
            'Bucket Identitas status Lengkap. Data uji tanpa entitas terkait di Bucket Identitas & Pengecekan:\n'
            '- Perorangan belum menikah / data pasangan belum ada (kategori 002)\n'
            '- Perorangan tidak memiliki penjamin, Apakah Debitur Memiliki Penjamin = Tidak (kategori 009)\n'
            '- Badan Usaha belum memiliki data Pengurus & Pemegang Saham (kategori 006)\n'
            'User berada di Step 3 Informasi Kepemilikan.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih kategori sesuai data uji: "002 - Calon Pasangan Debitur", "009 - Penjamin (PG)", atau "006 - Pengurus Perusahaan"\n'
            '3. Untuk kategori 009 dan 006, klik dropdown "Nama"\n'
            '4. Amati respons sistem dan isi dropdown Nama'
        ),
        'expected': (
            'Sistem menampilkan notifikasi bahwa entitas tidak tersedia / belum terdaftar di Bucket Identitas & Pengecekan:\n'
            '- 002: "Entitas Calon Pasangan Debitur tidak tersedia"; form tidak dapat dilanjutkan sebelum data pasangan diisi.\n'
            '- 009: "Data penjamin tidak tersedia"; dropdown Nama kosong atau form diblokir.\n'
            '- 006: "Data Pengurus Perusahaan belum tersedia"; dropdown Nama kosong atau menampilkan placeholder peringatan.'
        ),
    },
    'TC-4948-09': {
        'debtor_type': 'Badan Usaha',
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "006 - Pengurus Perusahaan"\n'
            '3. Klik dropdown "Nama" dan amati daftar yang muncul\n'
            '4. Pilih salah satu pengurus\n'
            '5. Amati field detail yang terisi'
        ),
        'expected': (
            'Dropdown Nama menampilkan daftar pengurus sesuai data Pengurus & Pemegang Saham '
            'di Bucket Identitas & Pengecekan; jumlah item = jumlah pengurus terdaftar.\n'
            'Setelah pengurus dipilih:\n'
            '- "Nama Lengkap" terisi nama pengurus\n'
            '- "Nomor KTP / NIK" terisi NIK pengurus\n'
            '- Dropdown "Hubungan dengan Debitur" menampilkan semua opsi (dipilih manual)\n'
            'Backend menetapkan: Hubungan dengan Debitur (McKinsey) = Perusahaan, Status Kepemilikan = Kepemilikan Bersama.'
        ),
    },
    'TC-4948-10': {
        'debtor_type': 'Perorangan',
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "009 - Penjamin (PG)"\n'
            '3. Klik dropdown "Nama" dan amati daftar yang muncul\n'
            '4. Pilih salah satu penjamin\n'
            '5. Amati field detail yang terisi'
        ),
        'expected': (
            'Dropdown Nama menampilkan daftar penjamin sesuai data penjamin di Bucket Identitas & Pengecekan '
            '(hanya kategori 009 - Penjamin PG).\n'
            'Setelah penjamin dipilih:\n'
            '- "Nama Lengkap" terisi nama penjamin\n'
            '- "Nomor KTP / NIK" terisi NIK penjamin\n'
            'Backend menetapkan: Tipe Kepemilikan = sesuai tipe penjamin, Hubungan dengan Debitur (McKinsey) = Penjamin, '
            'Status Kepemilikan = Milik pihak ketiga.'
        ),
    },
    'TC-4948-11': {
        'debtor_type': 'Perorangan',
        'precondition': (
            'Bucket Identitas status Lengkap. Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY) '
            'belum memiliki fasilitas aktif di Bank Sinarmas. '
            'Untuk kategori 002: debitur berstatus Menikah dan data pasangan terisi di Bucket Identitas. '
            'User berada di Step 3.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih "001 - Calon Debitur" dari dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Amati field Nama Lengkap dan Nomor KTP, lalu coba edit manual kedua field\n'
            '4. Ganti kategori menjadi "002 - Calon Pasangan Debitur"\n'
            '5. Amati field Nama Lengkap dan Nomor KTP, lalu coba edit manual kedua field'
        ),
        'expected': (
            '- 001: "Nama Lengkap" dan "Nomor KTP / NIK" terisi otomatis data debitur (mis. MUNAWAROH / 3209244711730001). '
            'Backend: Tipe Kepemilikan = Perorangan, Hubungan dengan Debitur = Milik Sendiri, Status Kepemilikan = Milik.\n'
            '- 002: kedua field terisi otomatis data pasangan. '
            'Backend: Tipe Kepemilikan = Perorangan, Hubungan dengan Debitur = Pasangan (Suami/Istri), '
            'Status Kepemilikan = Kepemilikan Bersama.\n'
            '- Pada 001 dan 002 kedua field read-only; data dari sistem tidak dapat ditimpa manual.'
        ),
    },
    'TC-4948-15': {
        'debtor_type': 'Perorangan',
        'precondition': (
            'Bucket Identitas status Lengkap. Debitur Perorangan memiliki penjamin berjenis Perorangan. '
            'Skenario A: penjamin berstatus Menikah dan data pasangan penjamin tersedia di Bucket Identitas. '
            'Skenario B: penjamin berstatus Belum Menikah.'
        ),
        'steps': (
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan" dan cari opsi "010 - Pasangan Penjamin"\n'
            '3. Skenario A (penjamin Menikah): pilih "010 - Pasangan Penjamin", klik dropdown "Nama", amati daftar, lalu pilih satu nama\n'
            '4. Skenario B (penjamin Belum Menikah): pastikan opsi "010 - Pasangan Penjamin" tidak ada di dropdown'
        ),
        'expected': (
            '- Skenario A: opsi 010 tampil. Dropdown Nama menampilkan pasangan penjamin dengan keterangan '
            '"Pasangan dari [Nama Penjamin]"; setelah dipilih, Nama Lengkap & NIK pasangan penjamin terisi otomatis. '
            'Backend: Status Kepemilikan = Milik pihak ketiga.\n'
            '- Skenario B: opsi 010 tidak tampil karena penjamin tidak berstatus Menikah.'
        ),
    },
}
for _k, _v in OVERRIDES.items():
    _by_id[_k].update(_v)

test_cases = [t for t in test_cases if t['id'] not in {i for _, (_, ids) in MERGES.items() for i in ids}]
# Renumber berurutan; peta ID lama → baru dicatat di kolom Referensi.
for _n, _t in enumerate(test_cases, 1):
    _old, _t['id'] = _t['id'], f'TC-4948-{_n:02d}'
    _t['reference'] = _t['reference'].replace(' | Gabungan: ', ' | Gabungan eks: ')
    _t['reference'] += f' | ID lama: {_old}'

# ─── TAHAP 2: struktur akhir (12 → 8 TC) ───────────────────────────────────────
_c = {t['id']: t for t in test_cases}

def _join(ids, key):
    return '\n\n'.join(f"[Skenario {n}]\n{_c[i][key]}" for n, i in enumerate(ids, 1))

def _mk(base, **kw):
    t = dict(_c[base]); t.update(kw); return t

_final = [
    _mk('TC-4948-01',
        title='Validasi Opsi Dropdown Kategori Kepemilikan: Debitur Perorangan dan Badan Usaha',
        debtor_type='Perorangan & Badan Usaha', priority='Critical',
        precondition=(
            'Sample 1: Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY) belum memiliki fasilitas aktif di Bank Sinarmas, '
            'Belum Menikah, tanpa penjamin.\n'
            'Sample 2: Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ) sudah memiliki fasilitas aktif di Bank Sinarmas dan memiliki penjamin.\n'
            'Kondisi lain (Menikah + penjamin perorangan; Perorangan dengan fasilitas aktif) dicek sebagai varian Sample 1.'),
        steps=(
            '1. Buka modal Tambah Agunan → masuk Step 3 Informasi Kepemilikan\n'
            '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
            '3. Catat seluruh opsi yang tampil\n'
            '4. Cari opsi 006 dan 007\n'
            '5. Ulangi untuk setiap sample dan varian'),
        expected=(
            'Sample 1 (Perorangan): 001 - Calon Debitur, 005 - Pemilik Agunan, 008 - Vendor; 002/009/010 tidak tampil (belum menikah, tanpa penjamin); '
            '003/004 tidak tampil (belum ada fasilitas aktif); 006/007 tidak tampil.\n'
            'Varian Menikah + penjamin perorangan: opsi 002, 009, 010 ikut tampil sesuai kondisi.\n'
            'Varian dengan fasilitas aktif BSB: opsi debitur/pasangan debitur (003/004) tampil menggantikan 001/002.\n'
            'Sample 2 (Badan Usaha): opsi 006 dan 007 tampil, serta opsi debitur sesuai fasilitas aktif.'),
        reference='S2CML-4948 AC-1 | ID lama: 01, 02, 03, 04, 05'),
    _mk('TC-4948-05',
        title='Validasi Notifikasi Entitas Tidak Tersedia untuk Kategori Pasangan Debitur, Penjamin (PG), Pasangan Penjamin, Pengurus & Pemilik Perusahaan',
        reference='S2CML-4948 AC-2 | ID lama: 06, 07, 08 (notif)'),
    _mk('TC-4948-09',
        title='Validasi Kategori Kepemilikan Calon Debitur: Perorangan (001) dan Badan Usaha (003) Auto-Fill & Read-Only',
        debtor_type='Perorangan & Badan Usaha', priority='Critical',
        precondition=_c['TC-4948-09']['precondition'] + '\n\n' + _c['TC-4948-08']['precondition'].split('Untuk kategori 002')[0].strip(),
        steps=(
            '1. Masuk Step 3 pada pengajuan Perorangan\n'
            '2. Pilih "001 - Calon Debitur" dan amati Nama Lengkap & Nomor KTP; coba edit manual\n'
            '3. Masuk Step 3 pada pengajuan Badan Usaha\n'
            '4. Pilih kategori debitur (desain: "003 - Debitur") dan amati field terisi otomatis'),
        expected=(
            '- Perorangan 001: Nama Lengkap & NIK terisi otomatis (mis. MUNAWAROH / 3209244711730001), read-only. '
            'Backend: Tipe Kepemilikan = Perorangan, Hubungan = Milik Sendiri, Status = Milik.\n'
            '- Badan Usaha: Nama Badan Usaha & NPWP/nomor legalitas terisi otomatis. '
            'Backend: Tipe Kepemilikan = Badan Usaha, Hubungan = Milik Sendiri, Status = Milik.'),
        reference='S2CML-4948 AC-4 | ID lama: 08 (bagian 001), 09, 11, 13, 19'),
    _mk('TC-4948-08',
        title='Validasi Kategori Kepemilikan Pasangan Calon Debitur / Pasangan Debitur (002): Auto-Fill & Read-Only',
        debtor_type='Perorangan', priority='High',
        steps=(
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih "002 - Calon Pasangan Debitur" (atau "004 - Pasangan Debitur" bila ada fasilitas aktif)\n'
            '3. Amati field Nama Lengkap dan Nomor KTP\n'
            '4. Coba edit manual kedua field'),
        expected=(
            'Nama Lengkap & NIK terisi otomatis data pasangan, read-only. '
            'Backend: Tipe Kepemilikan = Perorangan, Hubungan = Pasangan (Suami/Istri), Status = Kepemilikan Bersama.'),
        reference='S2CML-4948 AC-4 & AC-5 | ID lama: 08 (bagian 002), 12'),
    _mk('TC-4948-06',
        title='Validasi Kategori Kepemilikan Pengurus Perusahaan / Pemilik Perusahaan: Dropdown Nama & Auto-Fill',
        reference='S2CML-4948 AC-3 & AC-5 | ID lama: 06'),
    _mk('TC-4948-07',
        title='Validasi Kategori Kepemilikan Penjamin (PG) / Pasangan Penjamin: Dropdown Nama & Auto-Fill',
        debtor_type='Perorangan', priority='High',
        precondition=_join(['TC-4948-07', 'TC-4948-10'], 'precondition'),
        steps=(
            '1. Masuk Step 3: Informasi Kepemilikan\n'
            '2. Pilih Kategori "009 - Penjamin (PG)", klik dropdown "Nama", amati daftar, lalu pilih satu penjamin\n'
            '3. Amati field detail yang terisi\n'
            '4. Pilih Kategori "010 - Pasangan Penjamin", klik dropdown "Nama", amati daftar (termasuk keterangan pasangan dari siapa), lalu pilih satu nama\n'
            '5. Untuk penjamin Belum Menikah, pastikan opsi 010 tidak ada di dropdown'),
        expected=(
            '- 009: dropdown Nama berisi daftar penjamin dari Bucket Identitas; setelah dipilih Nama Lengkap & NIK terisi. '
            'Backend: Hubungan (McKinsey) = Penjamin, Status = Milik pihak ketiga.\n'
            '- 010: dropdown Nama menampilkan "Pasangan dari [Nama Penjamin]"; setelah dipilih Nama & NIK pasangan terisi. '
            'Backend: Status = Milik pihak ketiga.\n'
            '- Penjamin Belum Menikah: opsi 010 tidak tampil.'),
        reference='S2CML-4948 AC-3 & AC-5 | ID lama: 07, 10'),
    _mk('TC-4948-11', reference=_c['TC-4948-11']['reference'] + ' | ID lama: 11'),
    _mk('TC-4948-12', reference=_c['TC-4948-12']['reference'] + ' | ID lama: 12'),
]
# urutan akhir: 01, 02, 03, 04, 05, 06, 07, 08
_order = ['TC-4948-01', 'TC-4948-05', 'TC-4948-09', 'TC-4948-08', 'TC-4948-06', 'TC-4948-07']
_tmp = {t['id']: t for t in _final}
test_cases = [_tmp[i] for i in _order]
# Judul & status mengikuti daftar user (6 TC, semua PASSED per laporan user 2026-11-17).
_titles = [
    'Validasi Opsi Dropdown Debitur Perorangan dan Badan Usaha',
    'Validasi System Memberi Notif bahwa Entitas Tidak Tersedia (Pasangan Debitur, Penjamin PG, Pasangan Penjamin, Pengurus & Pemilik Perusahaan)',
    'Validasi Kategori Kepemilikan Agunan: Calon Debitur Perorangan dan Badan Usaha',
    'Validasi Kategori Kepemilikan Agunan saat Dipilih Pasangan Debitur atau Pasangan Calon Debitur',
    'Validasi Kategori Kepemilikan Agunan saat Dipilih Pengurus Perusahaan atau Pemilik Perusahaan',
    'Validasi Kategori Kepemilikan Agunan saat Dipilih Penjamin (PG) atau Pasangan Penjamin',
]
for _n, (_t, _ti) in enumerate(zip(test_cases, _titles), 1):
    _t['id'] = f'TC-4948-{_n:02d}'
    _t['title'] = _ti
    _t['group'] = 'Kategori Kepemilikan Agunan'
    _t['status'] = 'PASSED'
# Sample 1 TC-01 mengikuti user: Belum Menikah DAN memiliki penjamin.
test_cases[0]['precondition'] = (
    'Sample 1: Debitur Perorangan (ID: 01M4F7TNSCSHEDB5G3WTSP7HDY) belum memiliki fasilitas aktif di Bank Sinarmas, '
    'Belum Menikah, dan memiliki penjamin.\n'
    'Sample 2: Debitur Badan Usaha (ID: 01M482PRSVH5ZMTVZX5QH0VDNZ) sudah memiliki fasilitas aktif di Bank Sinarmas dan memiliki penjamin.')
test_cases[0]['steps'] = (
    '1. Buka modal Tambah Agunan → masuk Step 3 Informasi Kepemilikan\n'
    '2. Klik dropdown "Kategori Kepemilikan Agunan"\n'
    '3. Catat seluruh opsi yang tampil\n'
    '4. Ulangi untuk Sample 2 (Badan Usaha)')
test_cases[0]['expected'] = (
    'Sample 1 (Perorangan): 001 - Calon Debitur, 005 - Pemilik Agunan, 008 - Vendor, 009 - Penjamin (PG) tampil; '
    '002 tidak tampil (belum menikah); 003/004 tidak tampil (belum ada fasilitas aktif); 006/007 tidak tampil; '
    '010 tampil hanya jika penjamin berstatus Menikah.\n'
    'Sample 2 (Badan Usaha): opsi debitur sesuai fasilitas aktif, 006 dan 007 tampil, 009 tampil.')

# ─── GENERATE FILES ────────────────────────────────────────────────────────────

headers = [
    'Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario',
    'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian',
    'Expected Result', 'Referensi Sumber', 'Status'
]

# 1. CSV (UTF-8 with BOM for Excel)
csv_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4948_Informasi_Kepemilikan.csv')
with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for tc in test_cases:
        writer.writerow([
            tc['id'], tc['debtor_type'], tc['group'], tc['title'],
            tc['type'], tc['priority'], tc['precondition'],
            tc['steps'], tc['expected'], tc['reference'], tc.get('status', '')
        ])

# 2. XLSX with styling
xlsx_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4948_Informasi_Kepemilikan.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-4948'

ws.append(headers)

# Header styling — Biru Teal (berbeda dengan 4890 Navy agar mudah dibedakan)
header_fill = PatternFill(start_color='0F5259', end_color='0F5259', fill_type='solid')
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

# Color mapping per kelompok (alternating row background)
group_colors = {
    'Dropdown Kategori Kepemilikan — Perorangan': 'EFF6FF',
    'Dropdown Kategori Kepemilikan — Badan Usaha': 'F0FDF4',
    'Notifikasi Entitas Tidak Tersedia':           'FFF7ED',
    'Load List Nama dari Bucket Identitas':        'F5F3FF',
    'Auto-Fill dari Bucket Debitur':               'ECFDF5',
    'Auto-Fill dari List Penjamin & Pengurus':     'FDF4FF',
    'Negative & Edge Cases':                       'FFF1F2',
}

for r_idx, tc in enumerate(test_cases, start=2):
    row_data = [
        tc['id'], tc['debtor_type'], tc['group'], tc['title'],
        tc['type'], tc['priority'], tc['precondition'],
        tc['steps'], tc['expected'], tc['reference'], tc.get('status', '')
    ]
    ws.append(row_data)

    row_bg = group_colors.get(tc['group'], 'FFFFFF')
    row_fill = PatternFill(start_color=row_bg, end_color=row_bg, fill_type='solid')

    prio_color = '000000'
    if tc['priority'] == 'Critical':
        prio_color = 'DC2626'   # Red
    elif tc['priority'] == 'High':
        prio_color = 'EA580C'   # Orange
    elif tc['priority'] == 'Medium':
        prio_color = '2563EB'   # Blue

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

# Column widths
col_widths = {1: 16, 2: 22, 3: 38, 4: 42, 5: 12, 6: 12, 7: 50, 8: 45, 9: 55, 10: 38}
for col_num, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col_num)].width = width

# Freeze header row
ws.freeze_panes = 'A2'

wb.save(xlsx_path)
from collections import Counter
print('[OK] Exports generated successfully:')
print(f'   1. {csv_path}')
print(f'   2. {xlsx_path}')
print(f'   Total TCs: {len(test_cases)}')

groups = Counter(tc['group'] for tc in test_cases)
print('\nSummary per Kelompok:')
for g, n in groups.items():
    print(f'   {g}: {n} TC')

pos = sum(1 for tc in test_cases if tc['type'] == 'Positive')
neg = sum(1 for tc in test_cases if tc['type'] == 'Negative')
crit = sum(1 for tc in test_cases if tc['priority'] == 'Critical')
print(f'\n   Positive: {pos}  |  Negative: {neg}  |  Critical: {crit}')
