import csv, os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

# TC Matrix S2CML-5905 — Edge Cases Impact From Bucket Identitas.
# Sumber: vault QA BSM Projects/LAMOS/Agunan/Stories/S2CML-5905/plan.md (status draft).
# Semua TC mengubah data SIT -> butuh App ID khusus + izin user.
os.makedirs('exports', exist_ok=True)

PEMILIK = 'Pemilik agunan = pasangan/penjamin yang identitasnya akan hilang. '
CHK = ('Agunan berstatus Draft; checklist Form Data Agunan hilang; '
       'checklist Bucket Agunan (sebelumnya lengkap) hilang.')
G1, G2, G3 = 'Tanpa Impact', 'Entitas Hilang', 'Pengikatan Fasilitas'

def tc(n, group, title, typ, prio, pre, steps, exp, ref):
    return dict(id=f'TC-5905-{n:02d}', debtor='Perorangan', group=group, title=title,
                type=typ, prio=prio, pre=pre, steps=steps, exp=exp, ref=ref)

cases = [
    tc(1, G1, 'Validasi tambah entitas di Bucket Identitas tidak mengubah Bucket Agunan', 'Positive', 'High',
       'Application punya agunan Final/Draft. Catat status & checklist agunan.',
       '1. Buka Bucket Identitas dan Pengecekan\n2. Tambah entitas baru dan simpan\n3. Buka Bucket Agunan',
       'Status agunan, checklist Form Data Agunan, dan checklist Bucket Agunan sama seperti sebelum tambah entitas.',
       'S2CML-5905 AC-1'),
    tc(2, G1, 'Validasi edit data entitas tanpa ganti entitas tidak mengubah Bucket Agunan', 'Positive', 'High',
       'Sama dengan TC-01. Entitas existing tidak berubah status pernikahan.',
       '1. Buka Bucket Identitas dan Pengecekan\n2. Edit data non-kritis entitas (mis. alamat) dan simpan\n3. Buka Bucket Agunan',
       'Status agunan dan seluruh checklist tidak berubah.', 'S2CML-5905 AC-2'),
    tc(3, G2, 'Validasi ganti status Menikah → Tidak Menikah mengubah agunan milik pasangan menjadi Draft dan menghilangkan checklist Form Data Agunan & Bucket Agunan',
       'Positive', 'Critical',
       PEMILIK + 'Penjamin berstatus Menikah. Agunan Final dan Bucket Agunan lengkap (ada checklist).',
       '1. Buka Bucket Identitas dan Pengecekan\n2. Ubah status penjamin dari Menikah ke Tidak Menikah dan simpan\n3. Buka Bucket Agunan\n4. Periksa status agunan dan checklist',
       CHK, 'S2CML-5905 AC-3, AC-5, AC-7, AC-8'),
    tc(4, G2, 'Validasi hapus entitas pemilik agunan mengubah agunan menjadi Draft dan menghilangkan checklist Form Data Agunan & Bucket Agunan',
       'Positive', 'Critical',
       PEMILIK + 'Agunan Final dan Bucket Agunan lengkap (ada checklist).',
       '1. Buka Bucket Identitas dan Pengecekan\n2. Hapus entitas pemilik agunan\n3. Buka Bucket Agunan\n4. Periksa status agunan dan checklist',
       CHK, 'S2CML-5905 AC-4, AC-5, AC-7, AC-8'),
    tc(5, G3, 'Validasi checklist Pengikatan Agunan ke Fasilitas hilang bila Struktur Kredit jadi tanpa agunan',
       'Positive', 'High',
       PEMILIK + 'Agunan satu-satunya yang terikat ke fasilitas; checklist Pengikatan ada.',
       '1. Hapus entitas pemilik agunan (atau ganti status Menikah → Tidak Menikah)\n2. Buka Form Pengikatan Agunan ke Fasilitas / Struktur Kredit\n3. Periksa checklist',
       'Struktur Kredit tanpa agunan; checklist Pengikatan hilang.', 'S2CML-5905 AC-9'),
    tc(6, G2, 'Validasi hapus entitas yang bukan pemilik agunan tidak mengubah agunan', 'Negative', 'High',
       'Ada entitas B yang bukan pemilik agunan mana pun. Agunan milik entitas A, status Final.',
       '1. Buka Bucket Identitas dan Pengecekan\n2. Hapus entitas B\n3. Buka Bucket Agunan',
       'Agunan milik entitas A tetap Final; checklist tidak berubah.', 'S2CML-5905 Negative (turunan AC-4)'),
    tc(7, G3, 'Validasi checklist Pengikatan tetap bila Struktur Kredit masih punya agunan lain', 'Negative', 'Medium',
       PEMILIK + 'Struktur Kredit punya agunan lain (milik entitas lain) yang terikat ke fasilitas.',
       '1. Hapus entitas pemilik agunan pertama\n2. Buka Form Pengikatan Agunan ke Fasilitas / Struktur Kredit\n3. Periksa checklist',
       'Agunan pertama terlepas dari pengikatan; checklist Pengikatan tetap ada karena agunan lain masih terikat.', 'S2CML-5905 AC-9 (boundary)'),
]

H = ['Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario', 'Tipe', 'Prioritas',
     'Prekondisi', 'Langkah Pengujian', 'Expected Result', 'Referensi Sumber']
rows = [[c['id'], c['debtor'], c['group'], c['title'], c['type'], c['prio'],
         c['pre'], c['steps'], c['exp'], c['ref']] for c in cases]
base = 'exports/TC_S2CML-5905_Edge_Cases_Bucket_Identitas'

with open(base + '.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(H); w.writerows(rows)

wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'TC S2CML-5905'
ws.append(H)
for r in rows: ws.append(r)
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', start_color='1F2937')
for row in ws.iter_rows():
    for c in row: c.alignment = Alignment(vertical='top', wrap_text=True)
for i, wd in enumerate([14, 14, 24, 45, 10, 10, 45, 45, 45, 28], 1):
    ws.column_dimensions[get_column_letter(i)].width = wd
ws.freeze_panes = 'A2'
wb.save(base + '.xlsx')
print(f'[OK] {len(cases)} TC -> {base}.csv / .xlsx')
