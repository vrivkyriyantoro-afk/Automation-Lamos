"""
Pindahkan test case Cash Collateral dari S2CML-5420 ke S2CML-5445.

Alasan (verifikasi AC Jira 2026-11-02):
- S2CML-5420 = "Detailing Form Informasi Tambahan Agunan *non* Cash Collateral".
  AC-nya tidak menyebut CIF / Cash Collateral sama sekali.
- Seluruh skenario Cash Collateral (section informasi cash collateral, pertanyaan
  "tersimpan di Bank Sinarmas", CIF, inquiry rekening, aturan deposito F11)
  adalah AC milik S2CML-5445 + S2CML-4981.

Yang dipindah: TC-5420-15 s.d TC-5420-25 (11 TC).
Hasil:
- scripts/export-tc/export_tc_s2cml_5420.py  -> 16 TC murni non-Cash-Collateral, direnomori 01..16
- scripts/export-tc/export_tc_s2cml_5445.py  -> generator baru berisi 11 TC pindahan + 8 TC CIF existing

Penggunaan:
    python -I scripts/export-tc/split_5420_cash_collateral.py           # dry-run
    python -I scripts/export-tc/split_5420_cash_collateral.py --apply   # tulis perubahan
"""
import ast
import os
import re
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

APPLY = '--apply' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'scripts', 'export_tc_s2cml_5420.py')

# TC yang pindah ke 5445
MOVE_IDS = [f'TC-5420-{n:02d}' for n in range(15, 26)]


def load_test_cases(path):
    """Ambil list literal `test_cases` dari file generator tanpa mengeksekusinya."""
    with open(path, encoding='utf-8') as f:
        tree = ast.parse(f.read())
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == 'test_cases':
                    return ast.literal_eval(node.value)
    raise SystemExit('❌ variabel `test_cases` tidak ditemukan.')


def fmt(tc, indent='    '):
    """Serialisasi satu dict TC jadi literal Python yang rapi."""
    keys = ['id', 'debtor_type', 'group', 'title', 'type', 'priority',
            'precondition', 'steps', 'expected', 'reference']
    lines = [f'{indent}{{']
    for k in keys:
        if k in tc:
            # repr() pada str yang memuat newline menghasilkan '\n' literal di dalam
            # single-quoted string -> aman. Pastikan tidak ada newline mentah.
            val = repr(tc[k])
            assert '\n' not in val, f'newline mentah pada {k}'
            lines.append(f'{indent}    {k!r}: {val},')
    lines.append(f'{indent}}},')
    return '\n'.join(lines)


cases = load_test_cases(SRC)
print(f'Sumber: {len(cases)} TC di export_tc_s2cml_5420.py\n')

moved, kept = [], []
for tc in cases:
    (moved if tc['id'] in MOVE_IDS else kept).append(tc)

# --- renomori 5420 yang tersisa ---
print(f'── TETAP di S2CML-5420 ({len(kept)} TC), direnomori ──')
for i, tc in enumerate(kept, start=1):
    old = tc['id']
    tc['id'] = f'TC-5420-{i:02d}'
    mark = '' if old == tc['id'] else f'   (dari {old})'
    print(f'  {tc["id"]}{mark} | {tc["title"][:62]}')

# --- renomori yang pindah, mulai dari 09 (01..08 sudah dipakai TC CIF existing) ---
print(f'\n── PINDAH ke S2CML-5445 ({len(moved)} TC) ──')
for i, tc in enumerate(moved, start=9):
    old = tc['id']
    tc['id'] = f'TC-5445-{i:02d}'
    tc['reference'] = f'{tc["reference"]} | Dipindah dari {old} (AC S2CML-5445/4981)'
    print(f'  {old} -> {tc["id"]} | {tc["title"][:62]}')

if not APPLY:
    print('\nDRY-RUN. Jalankan ulang dengan --apply untuk menulis perubahan.')
    raise SystemExit(0)

# ── tulis ulang blok test_cases di generator 5420 ──
# Pakai lambda sebagai replacement: string biasa akan menafsirkan \n, \t dst.
# sebagai escape sequence sehingga literal '\n' di dalam TC rusak jadi newline asli.
if os.path.exists(SRC + '.bak'):
    shutil.copy2(SRC + '.bak', SRC)   # pulihkan dulu bila skrip pernah dijalankan
else:
    shutil.copy2(SRC, SRC + '.bak')
with open(SRC, encoding='utf-8') as f:
    src_text = f.read()

new_block = 'test_cases = [\n' + '\n'.join(fmt(tc) for tc in kept) + '\n]'
src_text = re.sub(r'test_cases = \[.*?\n\]', lambda _m: new_block, src_text, count=1, flags=re.S)
with open(SRC, 'w', encoding='utf-8') as f:
    f.write(src_text)
print(f'\n✅ {SRC} ditulis ulang ({len(kept)} TC). Backup: {SRC}.bak')

# ── buat generator 5445 dari template 5420 ──
DST = os.path.join(ROOT, 'scripts', 'export_tc_s2cml_5445.py')
cif_cases = [
    {
        'id': 'TC-5445-01', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi CIF Default State saat Opsi Tersimpan di Bank Sinarmas Dipilih Ya',
        'type': 'Positive', 'priority': 'Medium',
        'precondition': 'Jenis agunan F09/F10/F11/F15, pertanyaan "Apakah agunan tersimpan di Bank Sinarmas?" dijawab Ya',
        'steps': '1. Pilih opsi "Ya".\n2. Periksa field CIF pemilik agunan.',
        'expected': 'Field CIF kosong dengan placeholder "Masukkan CIF pemilik agunan" dan tombol Cek berstatus nonaktif.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-54',
    },
    {
        'id': 'TC-5445-02', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Tombol Cek Aktif setelah Field CIF Diisi Angka',
        'type': 'Positive', 'priority': 'Medium',
        'precondition': 'Field CIF tampil dalam keadaan kosong',
        'steps': '1. Isi field CIF dengan angka (misal 11111111).\n2. Periksa status tombol Cek.',
        'expected': 'Tombol Cek berubah menjadi aktif (biru) dan dapat diklik.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-55',
    },
    {
        'id': 'TC-5445-03', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Indikator Loading pada Tombol Cek saat Proses Inquiry Berjalan',
        'type': 'Positive', 'priority': 'Low',
        'precondition': 'Field CIF sudah terisi dan tombol Cek aktif',
        'steps': '1. Klik tombol Cek.\n2. Amati tampilan tombol selama proses berlangsung.',
        'expected': 'Spinner / indikator loading muncul pada tombol Cek selama proses inquiry ke service berjalan.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-56',
    },
    {
        'id': 'TC-5445-04', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Inquiry Account',
        'title': 'Validasi CIF Ditemukan Menampilkan Dropdown Rekening Cash Collateral',
        'type': 'Positive', 'priority': 'High',
        'precondition': 'CIF yang diisi valid dan terdaftar pada core banking',
        'steps': '1. Isi CIF valid.\n2. Klik tombol Cek.\n3. Amati respons sistem.',
        'expected': 'Muncul centang hijau "CIF ditemukan", tombol Ubah tampil, dan dropdown "Rekening cash collateral" ditampilkan.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-57',
    },
    {
        'id': 'TC-5445-05', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Inquiry Account',
        'title': 'Validasi CIF Tidak Ditemukan Menampilkan Ikon Silang Merah',
        'type': 'Negative', 'priority': 'High',
        'precondition': 'CIF yang diisi tidak terdaftar pada core banking',
        'steps': '1. Isi CIF yang tidak valid.\n2. Klik tombol Cek.\n3. Amati respons sistem.',
        'expected': 'Muncul ikon silang merah "CIF tidak ditemukan", dropdown rekening tetap terkunci, dan tombol Ubah tampil.',
        'reference': 'AC S2CML-5445 | ID lama TC-4889-58',
    },
    {
        'id': 'TC-5445-06', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Error Handling',
        'title': 'Validasi Penanganan Kegagalan Sistem saat Pengecekan CIF',
        'type': 'Negative', 'priority': 'High',
        'precondition': 'Service inquiry account dalam kondisi gagal / error (disimulasikan via intercept)',
        'steps': '1. Isi CIF.\n2. Klik tombol Cek saat service error.\n3. Amati respons sistem.',
        'expected': 'Sistem menampilkan pesan informasi penyebab kegagalan integrasi dan mencoba ulang hingga berhasil.',
        'reference': 'AC S2CML-4981: IF Get Detail Account is Failed | ID lama TC-4889-59',
    },
    {
        'id': 'TC-5445-07', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Pengecekan CIF',
        'title': 'Validasi Tombol Ubah CIF Memicu Inquiry Ulang Daftar Rekening',
        'type': 'Positive', 'priority': 'Medium',
        'precondition': 'CIF sudah ditemukan dan daftar rekening sudah tampil',
        'steps': '1. Klik tombol Ubah pada field CIF.\n2. Ganti nilai CIF dengan CIF lain yang valid.\n3. Klik Cek.',
        'expected': 'Sistem melakukan inquiry ulang dan daftar rekening cash collateral diperbarui sesuai CIF yang baru.',
        'reference': 'AC S2CML-5445: After CIF inputted / value has changes | ID lama TC-4889-60',
    },
    {
        'id': 'TC-5445-08', 'debtor_type': 'Perorangan & Badan Usaha',
        'group': 'Agunan Non-BSIM',
        'title': 'Validasi Opsi Tidak Tersimpan di Bank Sinarmas Menyembunyikan CIF dan Menampilkan Instansi Penerbit',
        'type': 'Positive', 'priority': 'High',
        'precondition': 'Jenis agunan F09/F10/F11/F15 dan sebelumnya opsi "Ya" sudah dipilih',
        'steps': '1. Pilih opsi "Tidak" pada pertanyaan Bank Sinarmas.\n2. Periksa field yang tampil.',
        'expected': 'Field CIF hilang; muncul field "Instansi penerbit*" sebagai input manual mandatory. ARO, Tipe Blokir, dan Alasan Blokir tetap tersembunyi.',
        'reference': 'AC S2CML-5445 | Figma 6124:461694 | ID lama TC-4889-61',
    },
]

all_5445 = cif_cases + moved
block = 'test_cases = [\n' + '\n'.join(fmt(tc) for tc in all_5445) + '\n]'

tmpl = src_text  # sudah berisi styling & export logic
tmpl = re.sub(r'test_cases = \[.*?\n\]', lambda _m: block, tmpl, count=1, flags=re.S)
tmpl = tmpl.replace('TC_S2CML-5420_Data_Tambahan_Agunan', 'TC_S2CML-5445_Data_Tambahan_Cash_Collateral')
tmpl = tmpl.replace("ws.title = 'S2CML-5420'", "ws.title = 'S2CML-5445'")

with open(DST, 'w', encoding='utf-8') as f:
    f.write(tmpl)
print(f'✅ {DST} dibuat ({len(all_5445)} TC: 8 CIF existing + {len(moved)} pindahan).')
