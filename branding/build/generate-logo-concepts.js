const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

// ---- Palette (exact hex values already established for the deck/icon-library set) ----
const LIGHT = { bg: '#FFFFFF', navy: '#16233F', slate: '#4F6079', gold: '#C89B3C' };
const DARK  = { bg: '#10162B', navy: '#0B1022', slate: '#8DA0C2', gold: '#D4AF5A' };

const SERIF = 'Liberation Serif, Georgia, serif';
const SANS  = 'Liberation Sans, Arial, sans-serif';

function deg2rad(d) { return (d * Math.PI) / 180; }
function pt(cx, cy, r, angleDeg) {
  const a = deg2rad(angleDeg);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// One "blade": a twisted kite from inner radius to a tip pushed off-axis (skew),
// with 1-2 thin background-color hairlines cut through it for a layered/line-icon look.
function blade(cx, cy, r0, r1, a0, width, skew, fill, bgColor, hatch) {
  const [x0, y0] = pt(cx, cy, r0, a0);
  const [x1, y1] = pt(cx, cy, r1, a0 + skew);
  const [x2, y2] = pt(cx, cy, r0, a0 + width);
  let s = `<polygon points="${x0},${y0} ${x1},${y1} ${x2},${y2}" fill="${fill}" />`;
  if (hatch) {
    // thin background-colored hairlines parallel to the tip direction, for a
    // layered/grooved "millstone furrow" texture inside the solid blade.
    const steps = hatch;
    for (let i = 1; i <= steps; i++) {
      const f = i / (steps + 1);
      const ra0 = a0 + width * f * 0.35;
      const ra1 = a0 + skew * (0.55 + f * 0.4);
      const rr0 = r0 + (r1 - r0) * 0.12;
      const rr1 = r1 * (0.94 - f * 0.06);
      const [hx0, hy0] = pt(cx, cy, rr0, ra0);
      const [hx1, hy1] = pt(cx, cy, rr1, ra1);
      s += `<line x1="${hx0}" y1="${hy0}" x2="${hx1}" y2="${hy1}" stroke="${bgColor}" stroke-width="${r1 * 0.018}" stroke-linecap="round" />`;
    }
  }
  return s;
}

// Full radial "millstone" mark.
// n: blade count | asym: 0=symmetric/clean kite, 1=pronounced pinwheel twist
// centerGlyph: optional single letter placeholder for the monogram concepts
function mark({ n, asym, size = 600, fill, bgColor, ring = true, hatch = 0, centerGlyph = null, centerGlyphColor = null }) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.46;
  const r0 = size * 0.10;
  const width = 360 / n;
  const skew = width * (0.5 + asym * 0.42);
  let blades = '';
  for (let i = 0; i < n; i++) {
    const a0 = (360 / n) * i - 90;
    blades += blade(cx, cy, r0, R, a0, width, skew, fill, bgColor, hatch);
  }
  const ringStroke = ring
    ? `<circle cx="${cx}" cy="${cy}" r="${size * 0.485}" fill="none" stroke="${fill}" stroke-width="${size * 0.012}" />`
    : '';
  const centerHole = `<circle cx="${cx}" cy="${cy}" r="${size * 0.085}" fill="${bgColor}" />`;
  const centerRing = `<circle cx="${cx}" cy="${cy}" r="${size * 0.085}" fill="none" stroke="${fill}" stroke-width="${size * 0.01}" />`;
  const glyph = centerGlyph
    ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="${SERIF}" font-weight="bold" font-size="${size * 0.11}" fill="${centerGlyphColor || fill}">${centerGlyph}</text>`
    : '';
  return `<g>${ringStroke}${blades}${centerHole}${centerRing}${glyph}</g>`;
}

function svgDoc(w, h, bg, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
    ${inner}
  </svg>`;
}

function wordmark({ x, y, name, tagline, color, taglineColor, size = 46, align = 'start' }) {
  let s = `<text x="${x}" y="${y}" text-anchor="${align}" font-family="${SERIF}" font-weight="700" font-size="${size}" fill="${color}" letter-spacing="1">${name}</text>`;
  if (tagline) {
    s += `<text x="${x}" y="${y + size * 0.62}" text-anchor="${align}" font-family="${SANS}" font-size="${size * 0.32}" fill="${taglineColor}" letter-spacing="3">${tagline.toUpperCase()}</text>`;
  }
  return s;
}

const NAME = '[COMPANY NAME]';
const TAGLINE = '[Tagline Placeholder]';

// ---- 6 concepts, spanning the requested mix of lockup style + blade density ----
const CONCEPTS = [
  {
    id: 1,
    label: 'Concept 1 — Icon-first, literal dense pinwheel (favicon / app-icon ready)',
    kind: 'icon-standalone',
    n: 9, asym: 1, hatch: 2,
  },
  {
    id: 2,
    label: 'Concept 2 — Combination lockup, side-by-side, 8-blade geometric',
    kind: 'lockup-side',
    n: 8, asym: 0.35, hatch: 1,
  },
  {
    id: 3,
    label: 'Concept 3 — Monogram mark (initial in spokes), side lockup, 6-blade clean',
    kind: 'lockup-side',
    n: 6, asym: 0.15, hatch: 0,
    centerGlyph: 'C',
  },
  {
    id: 4,
    label: 'Concept 4 — Icon-first stacked, mid-density 7-blade',
    kind: 'stacked',
    n: 7, asym: 0.6, hatch: 1,
  },
  {
    id: 5,
    label: 'Concept 5 — Combination lockup, side-by-side, 6-blade flat/minimal',
    kind: 'lockup-side',
    n: 6, asym: 0, hatch: 0,
  },
  {
    id: 6,
    label: 'Concept 6 — Monogram mark (initial at center), icon-first, dense 9-blade',
    kind: 'icon-standalone',
    n: 9, asym: 0.8, hatch: 2,
    centerGlyph: 'C',
  },
];

function renderConceptHalf(concept, theme, isDark) {
  const iconSize = 340;
  const pad = 40;
  let w, h, inner;
  const markSvg = mark({
    n: concept.n,
    asym: concept.asym,
    size: iconSize,
    fill: theme.navy === undefined ? theme.gold : (isDark ? theme.slate : theme.navy),
    bgColor: theme.bg,
    hatch: concept.hatch,
    centerGlyph: concept.centerGlyph || null,
    centerGlyphColor: theme.gold,
  });

  if (concept.kind === 'icon-standalone') {
    w = iconSize + pad * 2;
    h = iconSize + pad * 2 + 90;
    inner = `<g transform="translate(${pad},${pad})">${markSvg}</g>` +
      wordmark({ x: w / 2, y: iconSize + pad + 55, name: NAME, tagline: TAGLINE, color: isDark ? '#F2F4F8' : theme.navy, taglineColor: theme.gold, size: 34, align: 'middle' });
  } else if (concept.kind === 'stacked') {
    w = iconSize + pad * 2;
    h = iconSize + pad * 2 + 100;
    inner = `<g transform="translate(${pad},${pad})">${markSvg}</g>` +
      wordmark({ x: w / 2, y: iconSize + pad + 60, name: NAME, tagline: TAGLINE, color: isDark ? '#F2F4F8' : theme.navy, taglineColor: theme.gold, size: 36, align: 'middle' });
  } else {
    // lockup-side
    w = iconSize + pad * 2 + 420;
    h = iconSize + pad * 2;
    inner = `<g transform="translate(${pad},${pad})">${markSvg}</g>` +
      wordmark({ x: iconSize + pad + 40, y: h / 2 - 6, name: NAME, tagline: TAGLINE, color: isDark ? '#F2F4F8' : theme.navy, taglineColor: theme.gold, size: 42, align: 'start' });
  }
  return { w, h, inner };
}

async function run() {
  const manifest = [];
  for (const concept of CONCEPTS) {
    const light = renderConceptHalf(concept, LIGHT, false);
    const dark = renderConceptHalf(concept, DARK, true);
    const w = Math.max(light.w, dark.w);
    const gap = 50;
    const totalW = w * 2 + gap;
    const totalH = Math.max(light.h, dark.h) + 70;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
      <rect width="${totalW}" height="${totalH}" fill="#FFFFFF" />
      <rect x="0" y="0" width="${w}" height="${totalH - 30}" fill="${LIGHT.bg}" stroke="#E4E7EC" stroke-width="2" />
      <rect x="${w + gap}" y="0" width="${w}" height="${totalH - 30}" fill="${DARK.bg}" />
      <g transform="translate(${(w - light.w) / 2}, ${(totalH - 30 - light.h) / 2})">${light.inner}</g>
      <g transform="translate(${w + gap + (w - dark.w) / 2}, ${(totalH - 30 - dark.h) / 2})">${dark.inner}</g>
      <text x="${totalW / 2}" y="${totalH - 8}" text-anchor="middle" font-family="${SANS}" font-size="20" fill="#4F6079">${concept.label}</text>
    </svg>`;

    const outFile = path.join(OUT, `concept-${concept.id}.png`);
    await sharp(Buffer.from(svg)).png().toFile(outFile);

    // Standalone icon-only PNG (transparent-friendly, light bg) for favicon/app-icon use
    const iconOnlySvg = svgDoc(400, 400, LIGHT.bg, mark({ n: concept.n, asym: concept.asym, size: 340, fill: LIGHT.navy, bgColor: LIGHT.bg, hatch: concept.hatch, centerGlyph: concept.centerGlyph || null, centerGlyphColor: LIGHT.gold }).replace('<g>', '<g transform="translate(30,30)">'));
    const iconFile = path.join(OUT, `concept-${concept.id}-icon-only.png`);
    await sharp(Buffer.from(iconOnlySvg)).png().toFile(iconFile);
    fs.writeFileSync(path.join(OUT, `concept-${concept.id}-icon-only.svg`), iconOnlySvg);

    // Same mark again as a transparent-background true vector, for real logo use
    // (no background rect at all — drop straight into any document/website).
    const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
      mark({ n: concept.n, asym: concept.asym, size: 340, fill: LIGHT.navy, bgColor: 'none', hatch: concept.hatch, centerGlyph: concept.centerGlyph || null, centerGlyphColor: LIGHT.gold }).replace('<g>', '<g transform="translate(30,30)">') +
      `</svg>`;
    fs.writeFileSync(path.join(OUT, `concept-${concept.id}-mark.svg`), transparentSvg);

    manifest.push({ ...concept, file: outFile, iconFile, w: totalW, h: totalH });
    console.log('Rendered', outFile);
  }

  // Contact sheet: stack all 6 vertically
  const imgs = await Promise.all(manifest.map(m => sharp(m.file).metadata().then(meta => ({ m, meta }))));
  const sheetW = Math.max(...imgs.map(i => i.meta.width));
  const sheetPad = 30;
  const sheetH = imgs.reduce((acc, i) => acc + i.meta.height + sheetPad, sheetPad);
  const composite = imgs.map((i, idx) => {
    const yOff = imgs.slice(0, idx).reduce((acc, p) => acc + p.meta.height + sheetPad, sheetPad);
    return { input: i.m.file, top: yOff, left: Math.round((sheetW - i.meta.width) / 2) };
  });
  await sharp({ create: { width: sheetW, height: sheetH, channels: 4, background: '#FFFFFF' } })
    .composite(composite)
    .png()
    .toFile(path.join(OUT, 'contact-sheet.png'));
  console.log('Rendered contact sheet');

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest.map(({ file, iconFile, ...rest }) => ({ ...rest, file: path.basename(file), iconFile: path.basename(iconFile) })), null, 2));

  // ---- Applied mockups, built around the recommended primary mark (Concept 2: 8-blade, combination lockup) ----
  const PRIMARY = CONCEPTS[1]; // concept 2

  // Letterhead mockup — US Letter proportions at 100dpi (8.5x11 -> 850x1100)
  {
    const w = 850, h = 1100;
    const iconSize = 70;
    const markSvg = mark({ n: PRIMARY.n, asym: PRIMARY.asym, size: iconSize, fill: LIGHT.navy, bgColor: LIGHT.bg, hatch: PRIMARY.hatch });
    let body = '';
    // placeholder body copy lines
    const lineY = 260;
    const lineTexts = [
      'Date: [Month DD, YYYY]', '', '[Recipient Name]', '[Title]', '[Company]', '', 'Dear [Recipient Name],', '',
    ];
    lineTexts.forEach((t, i) => {
      body += `<text x="90" y="${lineY + i * 26}" font-family="${SANS}" font-size="15" fill="${LIGHT.navy}">${t}</text>`;
    });
    for (let i = 0; i < 9; i++) {
      const y = lineY + lineTexts.length * 26 + 10 + i * 24;
      const lw = i === 8 ? 220 : 660;
      body += `<rect x="90" y="${y - 12}" width="${lw}" height="10" fill="#E4E7EC" />`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="${w}" height="${h}" fill="${LIGHT.bg}" />
      <rect x="0" y="0" width="14" height="${h}" fill="${LIGHT.navy}" />
      <g transform="translate(50,45)">${markSvg}</g>
      <text x="${50 + iconSize + 25}" y="80" font-family="${SERIF}" font-weight="700" font-size="30" fill="${LIGHT.navy}" letter-spacing="1">${NAME}</text>
      <text x="${50 + iconSize + 25}" y="104" font-family="${SANS}" font-size="13" fill="${LIGHT.gold}" letter-spacing="3">${TAGLINE.toUpperCase()}</text>
      <line x1="50" y1="140" x2="${w - 50}" y2="140" stroke="${LIGHT.gold}" stroke-width="3" />
      ${body}
      <line x1="50" y1="${h - 90}" x2="${w - 50}" y2="${h - 90}" stroke="#E4E7EC" stroke-width="1.5" />
      <text x="${w / 2}" y="${h - 60}" text-anchor="middle" font-family="${SANS}" font-size="13" fill="${LIGHT.slate}">[Street Address], [City, ST ZIP]   ·   [phone]   ·   [email]   ·   [website]</text>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, 'letterhead-mockup.png'));
    console.log('Rendered letterhead mockup');
  }

  // Business card mockup — front (navy) and back (light), 3.5x2in @ 200dpi = 700x400
  {
    const w = 700, h = 400;
    const iconSize = 130;
    const markFront = mark({ n: PRIMARY.n, asym: PRIMARY.asym, size: iconSize, fill: DARK.slate, bgColor: DARK.navy, hatch: PRIMARY.hatch });
    const front = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="${w}" height="${h}" fill="${DARK.navy}" />
      <g transform="translate(${w / 2 - iconSize / 2},40)">${markFront}</g>
      <text x="${w / 2}" y="${40 + iconSize + 42}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="26" fill="#F2F4F8" letter-spacing="1">${NAME}</text>
      <text x="${w / 2}" y="${40 + iconSize + 64}" text-anchor="middle" font-family="${SANS}" font-size="11" fill="${LIGHT.gold}" letter-spacing="3">${TAGLINE.toUpperCase()}</text>
    </svg>`;
    await sharp(Buffer.from(front)).png().toFile(path.join(OUT, 'business-card-front.png'));

    const markBack = mark({ n: PRIMARY.n, asym: PRIMARY.asym, size: 90, fill: LIGHT.navy, bgColor: LIGHT.bg, hatch: PRIMARY.hatch });
    const back = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="${w}" height="${h}" fill="${LIGHT.bg}" />
      <g transform="translate(50,${h / 2 - 45})">${markBack}</g>
      <text x="220" y="${h / 2 - 34}" font-family="${SERIF}" font-weight="700" font-size="20" fill="${LIGHT.navy}">[Full Name]</text>
      <text x="220" y="${h / 2 - 10}" font-family="${SANS}" font-size="13" fill="${LIGHT.slate}">[Job Title]</text>
      <line x1="220" y1="4" x2="220" y2="${h - 4}" stroke="#E4E7EC" stroke-width="1" transform="translate(0,0)" />
      <text x="220" y="${h / 2 + 20}" font-family="${SANS}" font-size="12" fill="${LIGHT.navy}">[phone]  ·  [email]</text>
      <text x="220" y="${h / 2 + 40}" font-family="${SANS}" font-size="12" fill="${LIGHT.navy}">[website]</text>
    </svg>`;
    await sharp(Buffer.from(back)).png().toFile(path.join(OUT, 'business-card-back.png'));
    console.log('Rendered business card mockups');
  }
}

run().catch(e => { console.error(e); process.exit(1); });
