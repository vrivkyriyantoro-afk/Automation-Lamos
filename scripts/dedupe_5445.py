"""
Hapus TC kembar pada generator S2CML-5445 lalu renomori rapat 01..14.

Duplikat yang dibuang (versi pindahan dari export 5420), karena skenario
identik sudah tercakup versi hasil renomori TC-4889 yang Expected Result-nya
lebih rinci dan mengutip AC Jira:

    TC-5445-12 (CIF muncul saat Ya)          == TC-5445-01
    TC-5445-13 (tombol Cek aktif)            == TC-5445-02
    TC-5445-14 (dropdown rekening muncul)    == TC-5445-04
    TC-5445-15 (Instansi Penerbit wajib)     \\ keduanya == TC-5445-08
    TC-5445-16 (field CIF disembunyikan)     /

Penggunaan:
    python -I scripts/dedupe_5445.py           # dry-run
    python -I scripts/dedupe_5445.py --apply   # tulis perubahan
"""
import ast
import os
import re
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

APPLY = '--apply' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'scripts', 'export_tc_s2cml_5445.py')

DROP = {
    'TC-5445-12': 'TC-5445-01',
    'TC-5445-13': 'TC-5445-02',
    'TC-5445-14': 'TC-5445-04',
    'TC-5445-15': 'TC-5445-08',
    'TC-5445-16': 'TC-5445-08',
}

KEYS = ['id', 'debtor_type', 'group', 'title', 'type', 'priority',
        'precondition', 'steps', 'expected', 'reference']


def load(path):
    with open(path, encoding='utf-8') as f:
        tree = ast.parse(f.read())
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == 'test_cases':
                    return ast.literal_eval(node.value)
    raise SystemExit('❌ `test_cases` tidak ditemukan.')


def fmt(tc, indent='    '):
    lines = [f'{indent}{{']
    for k in KEYS:
        if k in tc:
            val = repr(tc[k])
            assert '\n' not in val, f'newline mentah pada {k}'
            lines.append(f'{indent}    {k!r}: {val},')
    lines.append(f'{indent}}},')
    return '\n'.join(lines)


cases = load(SRC)
print(f'Sumber: {len(cases)} TC\n')

print('── DIBUANG (duplikat) ──')
kept = []
for tc in cases:
    if tc['id'] in DROP:
        print(f'  {tc["id"]} (sama dengan {DROP[tc["id"]]}) | {tc["title"][:58]}')
    else:
        kept.append(tc)

print(f'\n── DIPERTAHANKAN ({len(kept)} TC), direnomori rapat ──')
for i, tc in enumerate(kept, start=1):
    old = tc['id']
    tc['id'] = f'TC-5445-{i:02d}'
    mark = '' if old == tc['id'] else f'   (dari {old})'
    print(f'  {tc["id"]}{mark} | {tc["title"][:58]}')

if not APPLY:
    print('\nDRY-RUN. Jalankan ulang dengan --apply untuk menulis perubahan.')
    raise SystemExit(0)

shutil.copy2(SRC, SRC + '.bak')
with open(SRC, encoding='utf-8') as f:
    text = f.read()

block = 'test_cases = [\n' + '\n'.join(fmt(tc) for tc in kept) + '\n]'
text = re.sub(r'test_cases = \[.*?\n\]', lambda _m: block, text, count=1, flags=re.S)
with open(SRC, 'w', encoding='utf-8') as f:
    f.write(text)

print(f'\n✅ {SRC} ditulis ulang ({len(kept)} TC). Backup: {SRC}.bak')
