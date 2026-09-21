"""Generate synthetic SOAIS workbooks without retaining spreadsheet cells in memory."""
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

count = int(sys.argv[1])
path = Path(f"storage/framework/testing/soais-{count}.xlsx")
path.parent.mkdir(parents=True, exist_ok=True)
headers = ['No.', 'Region', 'HEI NAME', 'HEI UII', 'Special Order Number', 'Last Name', 'First Name', 'Middle Name', 'Extension Name', 'Sex', 'Program', 'PSCED Code', 'Major', 'Started', '', 'Ended', '', '']

def row(number, values):
    cells = []
    for i, value in enumerate(values):
        address = chr(65 + i) + str(number)
        cells.append(f'<c r="{address}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>')
    return f'<row r="{number}">' + ''.join(cells) + '</row>'

with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
    z.writestr('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
    z.writestr('xl/_rels/workbook.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>')
    z.writestr('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="SOAIS" sheetId="1" r:id="rId1"/></sheets></workbook>')
    with z.open('xl/worksheets/sheet1.xml', 'w') as sheet:
        sheet.write(b'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>')
        sheet.write(row(1, ['MASTERLIST OF APPROVED SPECIAL ORDER APPLICATIONS']).encode())
        sheet.write(row(2, headers).encode())
        sheet.write(row(3, [''] * 15 + ['Date of Graduation', '', 'Academic Year']).encode())
        for i in range(count):
            sheet.write(row(i + 4, [i + 1, 'XII', 'Synthetic College', '12001', f'SYNTH-{i + 1}', f'Example{i + 1}', 'Student', '', '', 'Female', 'BS IT', '464108', '', '', '', '2024/06/01', '', '2023-2024']).encode())
        sheet.write(b'</sheetData></worksheet>')
print(path)
