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

// A single radial groove (furrow): a straight stroked line from an inner
// start radius to the rim. This is the actual visual unit a millstone face
// is built from — never a filled tapered blade, which is what read as a
// star/compass instead of a stone.
function groove(cx, cy, r0, r1, a0, a1, stroke, weight) {
  const [x0, y0] = pt(cx, cy, r0, a0);
  const [x1, y1] = pt(cx, cy, r1, a1);
  return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${stroke}" stroke-width="${weight}" stroke-linecap="round" />`;
}

// Full "millstone" mark: a plain circular disc face, divided into `n` equal
// sectors by full-length primary grooves radiating from near-center to the
// rim, with `secondary` shorter parallel-fanning grooves filling each sector
// (starting partway out, ending at the rim) — matching how an actual
// millstone's dressed furrow pattern reads: straight radiating line groups
// inside a clean circular silhouette, never a pointed/star outline.
function mark({ n, secondary = 2, size = 600, stroke, bgColor, accent, weight, centerGlyph = null }) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.47;
  const r0 = size * 0.045;
  const w = weight || size * 0.014;

  let grooves = '';
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a0 = step * i - 90;
    // primary full-length spoke (sector boundary)
    grooves += groove(cx, cy, r0, R * 0.985, a0, a0, stroke, w);
    // secondary grooves: start partway out, fan from this spoke toward the next
    for (let j = 1; j <= secondary; j++) {
      const f = j / (secondary + 1);
      const startR = r0 + (R - r0) * (0.28 + f * 0.22);
      const aStart = a0 + step * f * 0.35;
      const aEnd = a0 + step * f * 0.92;
      grooves += groove(cx, cy, startR, R * 0.985, aStart, aEnd, stroke, w * 0.82);
    }
  }

  // outer rim: clean circle silhouette (this is what must stay a plain
  // circle, not a spiky star) + a slightly-inset second ring for a cut edge
  const rim = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${bgColor}" stroke="${stroke}" stroke-width="${w * 1.3}" />` +
    `<circle cx="${cx}" cy="${cy}" r="${R * 0.93}" fill="none" stroke="${stroke}" stroke-width="${w * 0.5}" opacity="0.55" />`;

  // center spindle hole — small filled hole with a thin single-accent ring
  const hole = `<circle cx="${cx}" cy="${cy}" r="${size * 0.05}" fill="${stroke}" />` +
    `<circle cx="${cx}" cy="${cy}" r="${size * 0.068}" fill="none" stroke="${accent}" stroke-width="${w}" />`;

  const glyph = centerGlyph
    ? `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="${SERIF}" font-weight="bold" font-size="${size * 0.045}" fill="${bgColor}">${centerGlyph}</text>`
    : '';

  return `<g>${rim}${grooves}${hole}${glyph}</g>`;
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
    label: 'Concept 1 — Icon-first, 6 sectors / 3 secondary grooves (clean, moderate detail)',
    kind: 'icon-standalone',
    n: 6, secondary: 3,
  },
  {
    id: 2,
    label: 'Concept 2 — Combination lockup, 8 sectors / 2 secondary grooves — recommended primary',
    kind: 'lockup-side',
    n: 8, secondary: 2,
  },
  {
    id: 3,
    label: 'Concept 3 — Icon-first, 10 sectors / 2 secondary grooves (fine, dense texture)',
    kind: 'icon-standalone',
    n: 10, secondary: 2,
  },
  {
    id: 4,
    label: 'Concept 4 — Icon-first stacked, 7 sectors / 3 secondary grooves',
    kind: 'stacked',
    n: 7, secondary: 3,
  },
  {
    id: 5,
    label: 'Concept 5 — Combination lockup, 6 sectors / 1 secondary groove (minimal)',
    kind: 'lockup-side',
    n: 6, secondary: 1,
  },
  {
    id: 6,
    label: 'Concept 6 — Icon-first, 9 sectors / 4 secondary grooves (densest, most literal)',
    kind: 'icon-standalone',
    n: 9, secondary: 4,
  },
];

function renderConceptHalf(concept, theme, isDark) {
  const iconSize = 340;
  const pad = 40;
  let w, h, inner;
  const markSvg = mark({
    n: concept.n,
    secondary: concept.secondary,
    size: iconSize,
    stroke: isDark ? theme.slate : theme.navy,
    bgColor: theme.bg,
    accent: theme.gold,
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
    const iconOnlySvg = svgDoc(400, 400, LIGHT.bg, mark({ n: concept.n, secondary: concept.secondary, size: 340, stroke: LIGHT.navy, bgColor: LIGHT.bg, accent: LIGHT.gold }).replace('<g>', '<g transform="translate(30,30)">'));
    const iconFile = path.join(OUT, `concept-${concept.id}-icon-only.png`);
    await sharp(Buffer.from(iconOnlySvg)).png().toFile(iconFile);
    fs.writeFileSync(path.join(OUT, `concept-${concept.id}-icon-only.svg`), iconOnlySvg);

    // Same mark again as a transparent-background true vector, for real logo use
    // (no background rect at all — drop straight into any document/website).
    const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
      mark({ n: concept.n, secondary: concept.secondary, size: 340, stroke: LIGHT.navy, bgColor: 'none', accent: LIGHT.gold }).replace('<g>', '<g transform="translate(30,30)">') +
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
    const markSvg = mark({ n: PRIMARY.n, secondary: PRIMARY.secondary, size: iconSize, stroke: LIGHT.navy, bgColor: LIGHT.bg, accent: LIGHT.gold });
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
    const markFront = mark({ n: PRIMARY.n, secondary: PRIMARY.secondary, size: iconSize, stroke: DARK.slate, bgColor: DARK.navy, accent: DARK.gold });
    const front = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="${w}" height="${h}" fill="${DARK.navy}" />
      <g transform="translate(${w / 2 - iconSize / 2},40)">${markFront}</g>
      <text x="${w / 2}" y="${40 + iconSize + 42}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="26" fill="#F2F4F8" letter-spacing="1">${NAME}</text>
      <text x="${w / 2}" y="${40 + iconSize + 64}" text-anchor="middle" font-family="${SANS}" font-size="11" fill="${LIGHT.gold}" letter-spacing="3">${TAGLINE.toUpperCase()}</text>
    </svg>`;
    await sharp(Buffer.from(front)).png().toFile(path.join(OUT, 'business-card-front.png'));

    const markBack = mark({ n: PRIMARY.n, secondary: PRIMARY.secondary, size: 90, stroke: LIGHT.navy, bgColor: LIGHT.bg, accent: LIGHT.gold });
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
