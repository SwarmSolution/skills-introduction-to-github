const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  ImageRun, Header, Footer, Table, TableRow, TableCell, WidthType,
  BorderStyle, VerticalAlign, ShadingType,
} = require('docx');

const OUT = path.join(__dirname, 'out');
const NAVY = '16233F';
const SLATE = '4F6079';
const GOLD = 'C89B3C';

async function run() {
  const iconFile = path.join(OUT, 'concept-2-icon-only.png');
  const meta = await require('sharp')(iconFile).metadata();
  const iconW = 70;
  const iconH = Math.round(iconW * (meta.height / meta.width));

  const headerTable = new Table({
    width: { size: 10080, type: WidthType.DXA },
    columnWidths: [1400, 8680],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 1400, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ children: [new ImageRun({ type: 'png', data: fs.readFileSync(iconFile), transformation: { width: iconW, height: iconH } })] })],
          }),
          new TableCell({
            width: { size: 8680, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ children: [new TextRun({ text: '[COMPANY NAME]', font: 'Cambria', bold: true, size: 34, color: NAVY })] }),
              new Paragraph({ children: [new TextRun({ text: '[TAGLINE PLACEHOLDER]', font: 'Calibri', size: 18, color: GOLD, characterSpacing: 30 })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const rule = new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: GOLD, space: 4 } },
    spacing: { after: 400 },
    children: [],
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22, color: NAVY } } } },
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, bottom: 900, left: 1080, right: 1080 } } },
        headers: {
          default: new Header({ children: [headerTable, rule] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 4 } }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({
                  text: '[Street Address], [City, ST ZIP]   ·   [Phone]   ·   [Email]   ·   [Website]',
                  font: 'Calibri', size: 16, color: SLATE,
                })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '[Month DD, YYYY]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: '[Recipient Name]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: '[Recipient Title]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: '[Recipient Company]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: 'Dear [Recipient Name],', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: '[Body copy goes here. This letterhead is built on the same navy/slate/gold palette and Cambria/Calibri typography as the presentation template and icon library, so correspondence stays visually consistent with decks and proposals.]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: '[Closing copy goes here.]', font: 'Calibri', size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Sincerely,', font: 'Calibri', size: 22 })] }),
          new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: '[Sender Name]', font: 'Calibri', bold: true, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: '[Sender Title]', font: 'Calibri', size: 22 })] }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, 'Letterhead-Template.docx'), buf);
  console.log('Wrote Letterhead-Template.docx');
}

run().catch(e => { console.error(e); process.exit(1); });
