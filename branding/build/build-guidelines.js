const fs = require('fs');
const path = require('path');
const sizeOf = (p) => require('sharp')(p).metadata();
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
  Header, Footer, PageNumber, VerticalAlign,
} = require('docx');

const OUT = path.join(__dirname, 'out');

const LIGHT = { bg: 'FFFFFF', navy: '16233F', slate: '4F6079', gold: 'C89B3C' };
const DARK  = { bg: '10162B', navy: '0B1022', slate: '8DA0C2', gold: 'D4AF5A' };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, text });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, text });
}
function body(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: 'Calibri', size: 22, ...opts })] });
}
function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, font: 'Calibri', size: 22 })] });
}
function caption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text, italics: true, color: '4F6079', font: 'Calibri', size: 18 })] });
}
async function imgParagraph(file, maxW = 560) {
  const meta = await sizeOf(file);
  const ratio = meta.height / meta.width;
  const w = Math.min(maxW, meta.width);
  const h = Math.round(w * ratio);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: w, height: h } })],
  });
}
function swatchRow(name, hex, usage) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 1600, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: hex, color: 'auto' },
        children: [new Paragraph({ text: '' })],
      }),
      new TableCell({ width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: name, bold: true, font: 'Calibri', size: 20 })] })] }),
      new TableCell({ width: { size: 2200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: `#${hex}`, font: 'Consolas', size: 20 })] })] }),
      new TableCell({ width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: usage, font: 'Calibri', size: 20 })] })] }),
    ],
  });
}
function paletteTable(rows) {
  return new Table({
    width: { size: 10200, type: WidthType.DXA },
    columnWidths: [1600, 2400, 2200, 4000],
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Swatch', 'Name', 'Hex', 'Usage'].map((t, i) => new TableCell({
          width: { size: [1600, 2400, 2200, 4000][i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: '16233F', color: 'auto' },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', font: 'Calibri', size: 20 })] })],
        })),
      }),
      ...rows,
    ],
  });
}

async function run() {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json')));

  const conceptSections = [];
  for (const c of manifest) {
    conceptSections.push(h2(c.label));
    conceptSections.push(await imgParagraph(path.join(OUT, c.file), 620));
    conceptSections.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
        title: { run: { font: 'Cambria', size: 56, bold: true, color: '16233F' } },
        heading1: { run: { font: 'Cambria', size: 32, bold: true, color: '16233F' }, paragraph: { spacing: { before: 400, after: 200 } } },
        heading2: { run: { font: 'Cambria', size: 26, bold: true, color: '4F6079' }, paragraph: { spacing: { before: 300, after: 150 } } },
      },
    },
    sections: [
      {
        properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        headers: {
          default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '[COMPANY NAME] — Brand Guidelines', size: 16, color: '4F6079', font: 'Calibri' })] })] }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '4F6079', font: 'Calibri' })],
            })],
          }),
        },
        children: [
          // Cover
          new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER, children: [] }),
          await imgParagraph(path.join(OUT, 'concept-2-icon-only.png'), 220),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: '[COMPANY NAME]', font: 'Cambria', size: 56, bold: true, color: '16233F' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BRAND GUIDELINES', font: 'Calibri', size: 28, color: 'C89B3C', characterSpacing: 40 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
            children: [new TextRun({ text: 'Version 0.1 — Working Draft — July 2026', font: 'Calibri', size: 20, color: '4F6079', italics: true })],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // Intro
          h1('About This Document'),
          body('This is a working draft brand system built around a radial "millstone" mark — a circular, spoked motif chosen to be distinctive, scalable to a single-color favicon, and easy to reproduce on signage, print, and screen. Every placeholder in brackets — [COMPANY NAME], [Tagline Placeholder], contact details — should be replaced once the real name and copy are finalized; nothing here is final until you sign off on a primary mark.'),
          body('This draft carries over the exact color palette and typography already established for the presentation template and icon library, so all brand materials stay visually consistent across decks, documents, and this identity system.'),
          new Paragraph({ children: [new PageBreak()] }),

          // Color palette
          h1('Color Palette'),
          body('Two coordinated palettes — one tuned for light/white backgrounds, one for dark navy backgrounds — carried directly from the presentation template and icon library already in use.'),
          h2('Light Theme'),
          paletteTable([
            swatchRow('Background', LIGHT.bg, 'Page and slide background, white space'),
            swatchRow('Navy (primary)', LIGHT.navy, 'Primary mark color, headings, body text on light backgrounds'),
            swatchRow('Slate (secondary)', LIGHT.slate, 'Secondary text, captions, supporting graphics'),
            swatchRow('Gold (accent)', LIGHT.gold, 'Single accent — taglines, dividers, callouts. Use sparingly.'),
          ]),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          h2('Dark Theme'),
          paletteTable([
            swatchRow('Background', DARK.bg, 'Dark working background'),
            swatchRow('Navy block', DARK.navy, 'Deep panel fills, bookend/cover slides'),
            swatchRow('Slate (mark on dark)', DARK.slate, 'Primary mark color and body text on dark backgrounds'),
            swatchRow('Gold (accent)', DARK.gold, 'Same role as light theme — single accent, brightened for contrast on navy'),
          ]),
          body('Rule of thumb: gold is a single accent, never a dominant fill. Navy/slate carry the weight of the mark and text; gold marks taglines, dividers, and the one thing on a page you want the eye drawn to.', { italics: true, color: '4F6079' }),
          new Paragraph({ children: [new PageBreak()] }),

          // Typography
          h1('Typography'),
          body('Both fonts ship standard with Microsoft Office, so text renders identically on any machine without installing anything.'),
          h2('Cambria — Headings & Wordmark'),
          new Paragraph({ children: [new TextRun({ text: 'The quick brown fox jumps over the lazy dog', font: 'Cambria', size: 32, color: '16233F' })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'ABCDEFGHIJKLM · abcdefghijklm · 0123456789', font: 'Cambria', size: 22, color: '4F6079' })] }),
          h2('Calibri — Body & Captions'),
          new Paragraph({ children: [new TextRun({ text: 'The quick brown fox jumps over the lazy dog', font: 'Calibri', size: 26, color: '16233F' })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'ABCDEFGHIJKLM · abcdefghijklm · 0123456789', font: 'Calibri', size: 22, color: '4F6079' })] }),
          body('Note on this draft\'s preview images: the logo concept renders and mockups on the following pages were generated in an environment without Cambria/Calibri installed, so their wordmark text is drawn in metric-compatible substitutes (Liberation Serif/Sans). The actual .docx and .pptx source files below correctly reference Cambria/Calibri and will render properly in Word/PowerPoint.', { italics: true, color: '4F6079' }),
          new Paragraph({ children: [new PageBreak()] }),

          // Logo usage
          h1('Primary Mark & Usage Rules'),
          body('The recommended starting point is Concept 2 (page 6) — an 8-blade combination lockup — for general use: business cards, letterhead, email signatures, and slide decks. Concept 1 (dense 9-blade) is built as a standalone icon for favicons and app icons where the wordmark won\'t appear. Review all six on the following pages and tell me which to carry forward — the rest are provided as alternates or for A/B use across sub-brands or product lines.'),
          h2('Clear Space'),
          body('Keep clear space around the mark equal to at least the radius of its center hub circle on all sides — no text, edges, or other graphics inside that margin.'),
          h2('Minimum Size'),
          bullet('Digital: no smaller than 24px for the icon-only mark (favicon-safe).'),
          bullet('Print: no smaller than 0.4in / 10mm for the icon-only mark; 1.25in wide for the combination lockup.'),
          h2('Do'),
          bullet('Use the mark at 100% opacity in navy (light backgrounds) or slate (dark backgrounds).'),
          bullet('Use the single gold accent only for the center hub or a supporting rule/divider — never as the dominant blade color.'),
          bullet('Scale the mark proportionally in both directions.'),
          h2('Don\'t'),
          bullet('Don\'t recolor the blades in multiple colors at once, add drop shadows/bevels, or stretch the mark disproportionately.'),
          bullet('Don\'t place the navy mark on a busy photo background without a solid color plate behind it.'),
          bullet('Don\'t rotate the mark — its blade angles are fixed per concept.'),
          new Paragraph({ children: [new PageBreak()] }),

          // Concepts
          h1('Six Logo Concepts'),
          body('Each concept is shown on both a light and a dark background to confirm it holds up in both contexts. Blade count and lockup style vary across the set per your direction — some read as a dense, literal pinwheel close to your reference image; others simplify toward a cleaner, more geometric mark; two work a monogram initial into the design.'),
          new Paragraph({ children: [new PageBreak()] }),
          ...conceptSections,

          // Letterhead
          h1('Letterhead'),
          body('A ready-to-use Word letterhead is provided as a separate file, Letterhead-Template.docx, built on Concept 2. Preview:'),
          await imgParagraph(path.join(OUT, 'letterhead-mockup.png'), 420),
          new Paragraph({ children: [new PageBreak()] }),

          // Business card
          h1('Business Card'),
          body('Standard US business card size (3.5in × 2in). Front carries the full lockup on navy; back is light with contact details and a small icon-only mark.'),
          await imgParagraph(path.join(OUT, 'business-card-front.png'), 520),
          caption('Front'),
          await imgParagraph(path.join(OUT, 'business-card-back.png'), 520),
          caption('Back'),

          // Next steps
          h1('Open Questions / Next Steps'),
          bullet('Confirm the real company name and tagline (or confirm to keep working in placeholder form a while longer).'),
          bullet('Pick a primary mark from the 6 concepts — or ask for a 7th blending elements of two.'),
          bullet('Confirm the monogram initial if a monogram concept (3 or 6) is the direction.'),
          bullet('Any existing sub-brand, product line, or division that also needs a lockup variant?'),
          bullet('Once a name is locked, this document and the letterhead/business-card files can be regenerated end-to-end with the real name, tagline, and contact details filled in — no manual re-typing needed.'),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, 'Brand-Guidelines.docx'), buf);
  console.log('Wrote Brand-Guidelines.docx');
}

run().catch(e => { console.error(e); process.exit(1); });
