import os
import csv
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('exports/test-cases', exist_ok=True)

csv_source = os.path.join('fixtures', 'sources', 'TemplateAutomateLamos - Sheet1.csv')

def get_module_group(num):
    if 1 <= num <= 19:
        return 'Modul 1: Search Agunan'
    elif 20 <= num <= 26:
        return 'Modul 2: Informasi Umum Agunan'
    elif 27 <= num <= 30:
        return 'Modul 3: Pengikatan Agunan'
    elif 31 <= num <= 35:
        return 'Modul 4: Alamat Agunan'
    elif 36 <= num <= 43:
        return 'Modul 5: Data Pembanding Agunan'
    elif 44 <= num <= 48:
        return 'Modul 6: Penilaian Agunan'
    elif 49 <= num <= 61:
        return 'Modul 7: Data Tambahan Agunan'
    elif 62 <= num <= 82:
        return 'Modul 8: Informasi Kepemilikan Agunan'
    return 'Bucket Agunan'

def get_debtor_type(num, title):
    if num in [79, 80, 81, 82]:
        return 'Badan Usaha'
    elif num in [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77]:
        return 'Perorangan'
    elif 'badan usaha' in title.lower():
        return 'Badan Usaha'
    return 'Perorangan & Badan Usaha'

# Read source CSV
with open(csv_source, 'r', encoding='utf-8') as f:
    raw_rows = list(csv.reader(f))

test_cases = []
updated_csv_rows = [raw_rows[0]] # Header

for r_idx in range(1, len(raw_rows)):
    row = raw_rows[r_idx]
    if not row or not any(row):
        continue
    
    raw_id = row[0].strip()
    match = re.search(r'TC[- ]*(?:4889|04)[- ]*(\d+)', raw_id)
    
    if match:
        num = int(match.group(1))
        new_id = f'TC-4889-{num:02d}'
        
        title = row[1].strip() if len(row) > 1 else ''
        if title and not title.lower().startswith('validasi'):
            title = f'Validasi {title}'

        # Update row for TemplateAutomateLamos
        updated_row = list(row)
        updated_row[0] = new_id
        if len(updated_row) > 1:
            updated_row[1] = title
        updated_csv_rows.append(updated_row)
        tc_type = row[2].strip() if len(row) > 2 and row[2].strip() else 'Positive'
        priority = row[3].strip() if len(row) > 3 and row[3].strip() else 'High'
        precondition = row[5].strip() if len(row) > 5 else ''
        steps = row[6].strip() if len(row) > 6 else ''
        expected = row[7].strip() if len(row) > 7 else ''
        ref = row[14].strip() if len(row) > 14 and row[14].strip() else 'Jira S2CML-4889'
        
        # S2CML-4889 scope is strictly Modul 1: Search Agunan & CLS Paripasu (TC 1 to 19)
        if num <= 19:
            test_cases.append({
                'id': new_id,
                'debtor_type': get_debtor_type(num, title),
                'group': 'Modul 1: Search Agunan & CLS Paripasu',
                'title': title,
                'type': tc_type,
                'priority': priority if priority in ['Critical', 'High', 'Medium', 'Low'] else 'High',
                'precondition': precondition,
                'steps': steps,
                'expected': expected,
                'reference': ref.replace('\n', ' ')
            })
    else:
        updated_csv_rows.append(row)

# 1. Update source TemplateAutomateLamos - Sheet1.csv
with open(csv_source, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(updated_csv_rows)

print(f'[OK] Updated source CSV: {csv_source} ({len(test_cases)} TCs converted)')

# 2. Generate standard CSV export
headers = ['Test Case ID', 'Tipe Debitur', 'Kelompok / Modul', 'Judul Skenario', 'Tipe', 'Prioritas', 'Prekondisi', 'Langkah Pengujian', 'Expected Result', 'Referensi Sumber']
csv_export_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4889_Bucket_Agunan.csv')
with open(csv_export_path, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for tc in test_cases:
        writer.writerow([
            tc['id'], tc['debtor_type'], tc['group'], tc['title'],
            tc['type'], tc['priority'], tc['precondition'],
            tc['steps'], tc['expected'], tc['reference']
        ])

print(f'[OK] Exported CSV: {csv_export_path}')

# 3. Generate standard XLSX export with styling
xlsx_export_path = os.path.join('exports', 'test-cases', 'TC_S2CML-4889_Bucket_Agunan.xlsx')
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'TC S2CML-4889'

ws.append(headers)

# Styling header (Royal Indigo)
header_fill = PatternFill(start_color='2A4365', end_color='2A4365', fill_type='solid')
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
    'Modul 1: Search Agunan':               'F8FAFC',
    'Modul 2: Informasi Umum Agunan':        'EFF6FF',
    'Modul 3: Pengikatan Agunan':            'F0FDF4',
    'Modul 4: Alamat Agunan':                'FEFCE8',
    'Modul 5: Data Pembanding Agunan':       'FDF2F8',
    'Modul 6: Penilaian Agunan':             'FFF7ED',
    'Modul 7: Data Tambahan Agunan':         'F5F3FF',
    'Modul 8: Informasi Kepemilikan Agunan': 'ECFDF5'
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

col_widths = {1: 16, 2: 24, 3: 32, 4: 42, 5: 12, 6: 12, 7: 45, 8: 45, 9: 55, 10: 35}
for col_num, width in col_widths.items():
    ws.column_dimensions[get_column_letter(col_num)].width = width

ws.freeze_panes = 'A2'
wb.save(xlsx_export_path)

print(f'[OK] Exported XLSX: {xlsx_export_path}')
print(f'Total S2CML-4889 TCs: {len(test_cases)}')

