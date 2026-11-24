import os
import re

files_to_update = [
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 's2cml-4889.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'badanUsaha', 's2cml-4889.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul2-informasi-umum.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul3-pengikatan.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul4-alamat.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul5-data-pembanding.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul6-penilaian-agunan.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul7-data-tambahan.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul8-informasi-kepemilikan.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 'modul8-error-validasi.spec.ts'),
    os.path.join('tests', 'bucketAgunan', 'perseorangan', 's2cml-4890.spec.ts'),
    os.path.join('specs', 'bucket-agunan', 'S2CML-4889', 'tasks.md'),
    os.path.join('specs', 'bucket-agunan', 'S2CML-4889', 'spec.md')
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        print(f'[SKIP] Not found: {file_path}')
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Replace TC - 04 - XX and TC-04-XX with TC-4889-XX
    content = re.sub(
        r'TC\s*-\s*04\s*-\s*(\d+)',
        lambda m: f'TC-4889-{int(m.group(1)):02d}',
        content
    )

    # 2. Replace TC - 4890 - XX with TC-4890-XX
    content = re.sub(
        r'TC\s*-\s*4890\s*-\s*(\d+)',
        lambda m: f'TC-4890-{int(m.group(1)):02d}',
        content
    )

    # 3. Fix relative fixtures path if it's 2 levels instead of 3
    if 's2cml-4889.spec.ts' in file_path:
        content = content.replace(
            "path.resolve(__dirname, '../../fixtures/sources/TemplateAutomateLamos - Sheet1.csv')",
            "path.resolve(__dirname, '../../../fixtures/sources/TemplateAutomateLamos - Sheet1.csv')"
        )
        content = content.replace(
            "cleanId.startsWith('TC - 04') || cleanId.startsWith('TC-04')",
            "cleanId.startsWith('TC-4889') || cleanId.startsWith('TC - 04') || cleanId.startsWith('TC-04')"
        )

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'[UPDATED] {file_path}')
    else:
        print(f'[UNCHANGED] {file_path}')

