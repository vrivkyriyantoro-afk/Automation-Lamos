"""
Audit redundansi test case antar story di epic LP-5685.

Mendeteksi:
1. ID duplikat di seluruh export.
2. Judul skenario mirip antar story (potensi TC kembar).
3. TC yang kelompok/modulnya tidak cocok dengan scope story pemiliknya.

Penggunaan:
    python -I scripts/audit_tc_redundancy.py
"""
import csv
import glob
import os
import re
import sys
from collections import defaultdict
from difflib import SequenceMatcher

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLD = 0.72          # kemiripan judul yang dianggap mencurigakan

# Kata kunci yang menandai scope tiap story. Dipakai untuk mendeteksi TC
# yang "nyasar" ke story yang scope-nya berbeda.
SCOPE_HINTS = {
    'S2CML-4889': ['cari', 'pencarian', 'cls', 'paripasu', 'existing', 'stepper', 'tambah agunan baru'],
    'S2CML-4890': ['step', 'stepper', 'draft', 'simpan', 'gating', 'navigasi', 'indikator', 'submit'],
    'S2CML-4941': ['ubah', 'edit', 'titik 3', 'prefill', 'kalkulasi'],
    'S2CML-4948': ['kepemilikan', 'kategori', 'bucket identitas', 'pengurus', 'penjamin', 'auto-fill'],
    'S2CML-4949': ['slik', 'identitas baru', 'tipe kepemilikan', 'perkawinan', 'badan usaha'],
    'S2CML-5419': ['informasi umum', 'pengikatan', 'pemeringkat', 'alamat', 'pembanding', 'penilaian', 'kode pos'],
    'S2CML-5420': ['sifat agunan', 'bukti kepemilikan', 'upload', 'joint account', 'indikator step 2'],
    'S2CML-5445': ['cif', 'cash collateral', 'bank sinarmas', 'rekening', 'deposito', 'instansi penerbit'],
    'S2CML-6020': ['retensi', 'navigasi antar bucket', 'reload', 're-login', 'unsaved'],
}

STORY_RE = re.compile(r'TC_(S2CML-\d+)_')


def norm(s):
    """Normalisasi judul untuk perbandingan."""
    s = s.lower()
    s = re.sub(r'^validasi\s+', '', s)
    s = re.sub(r'[^a-z0-9 ]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


# ── muat semua TC ──
records = []
for path in sorted(glob.glob(os.path.join(ROOT, 'exports', 'TC_S2CML-*.csv'))):
    m = STORY_RE.search(os.path.basename(path))
    story = m.group(1) if m else os.path.basename(path)
    with open(path, encoding='utf-8-sig', newline='') as f:
        for row in csv.DictReader(f):
            tc_id = (row.get('Test Case ID') or list(row.values())[0] or '').strip()
            if not tc_id.startswith('TC-'):
                continue
            records.append({
                'story': story,
                'id': tc_id,
                'group': (row.get('Kelompok / Modul') or '').strip(),
                'title': (row.get('Judul Skenario') or row.get('Title/Test Case Description') or '').strip(),
            })

print(f'Total test case ter-audit: {len(records)} dari {len(set(r["story"] for r in records))} story\n')

issues = 0

# ── 1. ID duplikat ──
by_id = defaultdict(list)
for r in records:
    by_id[r['id']].append(r)
dupes = {k: v for k, v in by_id.items() if len(v) > 1}
print('── 1. ID DUPLIKAT ──')
if dupes:
    for tc_id, rows in sorted(dupes.items()):
        issues += 1
        print(f'  ⚠️  {tc_id} muncul {len(rows)}x: {", ".join(r["story"] for r in rows)}')
else:
    print('  ✅ tidak ada ID yang dipakai dua kali.')

# ── 2. Judul mirip antar story ──
print('\n── 2. JUDUL MIRIP ANTAR STORY (ambang %.0f%%) ──' % (THRESHOLD * 100))
found = []
for i, a in enumerate(records):
    for b in records[i + 1:]:
        if a['story'] == b['story']:
            continue
        ratio = SequenceMatcher(None, norm(a['title']), norm(b['title'])).ratio()
        if ratio >= THRESHOLD:
            found.append((ratio, a, b))
if found:
    for ratio, a, b in sorted(found, key=lambda x: -x[0]):
        issues += 1
        print(f'  ⚠️  {ratio:.0%}')
        print(f'      {a["story"]} {a["id"]} | {a["title"][:74]}')
        print(f'      {b["story"]} {b["id"]} | {b["title"][:74]}')
else:
    print('  ✅ tidak ada judul yang mirip antar story.')

# ── 3. TC nyasar dari scope story ──
print('\n── 3. TC DI LUAR SCOPE STORY PEMILIK ──')
stray = []
for r in records:
    hints = SCOPE_HINTS.get(r['story'])
    if not hints:
        continue
    haystack = norm(r['title'] + ' ' + r['group'])
    if not any(h in haystack for h in hints):
        # cek apakah justru cocok scope story lain
        others = [s for s, hs in SCOPE_HINTS.items()
                  if s != r['story'] and any(h in haystack for h in hs)]
        if others:
            stray.append((r, others))
if stray:
    for r, others in stray:
        issues += 1
        print(f'  ⚠️  {r["story"]} {r["id"]} | {r["title"][:64]}')
        print(f'      lebih cocok ke: {", ".join(others)}')
else:
    print('  ✅ seluruh TC konsisten dengan scope story pemiliknya.')

# ── ringkasan per story ──
print('\n── SEBARAN TC PER STORY ──')
per_story = defaultdict(list)
for r in records:
    per_story[r['story']].append(r)
for story in sorted(per_story):
    rows = per_story[story]
    groups = sorted(set(x['group'] for x in rows if x['group']))
    print(f'  {story} : {len(rows):>3} TC | {len(groups)} kelompok')

print(f'\n{"✅ TIDAK ADA REDUNDANSI" if issues == 0 else f"⚠️  {issues} temuan perlu ditinjau"}')
