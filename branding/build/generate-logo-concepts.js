const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, 'out-v2');
fs.mkdirSync(OUT, { recursive: true });

const LIGHT = { bg: '#FFFFFF', navy: '#16233F', slate: '#4F6079', gold: '#C89B3C' };
const DARK  = { bg: '#10162B', navy: '#0B1022', slate: '#8DA0C2', gold: '#D4AF5A' };

function deg2rad(d) { return (d * Math.PI) / 180; }
function pt(cx, cy, r, angleDeg) {
  const a = deg2rad(angleDeg);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// One "tooth" — a pointed kite/diamond sitting in a radial band, contained
// within that band (never reaching the hub or the rim on its own), so many
// of them in a ring read as a turbine/gear of teeth rather than a single
// compass-star spike. Points are computed directly (not via SVG transform)
// so the tip can be pulled slightly outward for a tapered, blade-like look.
function petal(cx, cy, rBandInner, rBandOuter, angle, angularWidth, stroke, weight, filled) {
  const midR = (rBandInner + rBandOuter) / 2;
  const halfLen = ((rBandOuter - rBandInner) / 2) * 1.22;
  const arcWidth = 2 * midR * Math.sin(deg2rad(angularWidth / 2));
  const halfWidth = arcWidth / 2;

  const tipOut = pt(cx, cy, midR + halfLen, angle);
  const tipIn = pt(cx, cy, midR - halfLen, angle);
  const sideAngleOffset = (Math.asin(Math.min(0.98, halfWidth / midR)) * 180) / Math.PI;
  const side1 = pt(cx, cy, midR, angle + sideAngleOffset);
  const side2 = pt(cx, cy, midR, angle - sideAngleOffset);

  const points = `${tipOut[0]},${tipOut[1]} ${side1[0]},${side1[1]} ${tipIn[0]},${tipIn[1]} ${side2[0]},${side2[1]}`;
  const fill = filled ? stroke : 'none';
  return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${weight}" stroke-linejoin="round" />`;
}

function ring(cx, cy, rInner, rOuter, n, phase, stroke, weight, filled, widthFactor = 0.62) {
  let s = '';
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const angle = step * i + phase - 90;
    s += petal(cx, cy, rInner, rOuter, angle, step * widthFactor, stroke, weight, filled);
  }
  return s;
}

// Full mark: 1-2 concentric rings of petals radiating around a raised
// center hub (drawn as a filled donut with a thin single-accent ring),
// inside a plain circular rim — the actual layered/turbine structure of the
// reference photo, simplified to clean brand line-work.
function mark({
  size = 600, stroke, bgColor, accent,
  rings, // array of { count, phase, filled, widthFactor }
  hubStyle = 'donut', // 'donut' | 'ringOnly'
}) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.47;
  const w = size * 0.012;

  const bandCount = rings.length;
  const hubR = size * 0.16;
  const bandTotal = R * 0.97 - hubR;
  const bandH = bandTotal / bandCount;

  let inner = '';
  rings.forEach((r, idx) => {
    const rInner = hubR + bandH * idx + bandH * 0.06;
    const rOuter = hubR + bandH * (idx + 1) - bandH * 0.04;
    inner += ring(cx, cy, rInner, rOuter, r.count, r.phase || 0, stroke, w * (r.filled ? 0.9 : 1), r.filled, r.widthFactor);
  });

  const rim = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${stroke}" stroke-width="${w * 1.5}" />`;

  let hub;
  if (hubStyle === 'donut') {
    hub = `<circle cx="${cx}" cy="${cy}" r="${hubR}" fill="${stroke}" />` +
      `<circle cx="${cx}" cy="${cy}" r="${hubR * 0.42}" fill="${bgColor}" />` +
      `<circle cx="${cx}" cy="${cy}" r="${hubR * 0.68}" fill="none" stroke="${accent}" stroke-width="${w * 1.1}" opacity="0.9" />`;
  } else {
    hub = `<circle cx="${cx}" cy="${cy}" r="${hubR}" fill="none" stroke="${stroke}" stroke-width="${w * 1.3}" />` +
      `<circle cx="${cx}" cy="${cy}" r="${hubR * 0.4}" fill="${stroke}" />` +
      `<circle cx="${cx}" cy="${cy}" r="${hubR * 0.62}" fill="none" stroke="${accent}" stroke-width="${w}" />`;
  }

  return `<g>${rim}${inner}${hub}</g>`;
}

function svgDoc(w, h, bg, inner) {
  const bgRect = bg === 'none' ? '' : `<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bgRect}${inner}</svg>`;
}

const CONCEPTS = [
  {
    id: 1,
    label: 'Concept 1 — Single ring, 12 solid petals, bold icon silhouette',
    rings: [{ count: 12, filled: true, widthFactor: 0.66 }],
    hubStyle: 'donut',
  },
  {
    id: 2,
    label: 'Concept 2 — Two rings (14 outer / 10 inner), outline petals — recommended primary',
    rings: [
      { count: 10, phase: 0, filled: false, widthFactor: 0.6 },
      { count: 14, phase: 12.9, filled: false, widthFactor: 0.6 },
    ],
    hubStyle: 'donut',
  },
  {
    id: 3,
    label: 'Concept 3 — Two rings, inner solid + outer outline (mixed depth)',
    rings: [
      { count: 8, phase: 0, filled: true, widthFactor: 0.62 },
      { count: 13, phase: 13.8, filled: false, widthFactor: 0.58 },
    ],
    hubStyle: 'donut',
  },
  {
    id: 4,
    label: 'Concept 4 — Single ring, 8 outline petals, clean/minimal',
    rings: [{ count: 8, filled: false, widthFactor: 0.58 }],
    hubStyle: 'ringOnly',
  },
  {
    id: 5,
    label: 'Concept 5 — Two rings, both solid, dense/literal (16 outer / 12 inner)',
    rings: [
      { count: 12, phase: 0, filled: true, widthFactor: 0.68 },
      { count: 16, phase: 11.25, filled: true, widthFactor: 0.68 },
    ],
    hubStyle: 'donut',
  },
  {
    id: 6,
    label: 'Concept 6 — Three rings, outline, most literal to reference’s layered turbine texture',
    rings: [
      { count: 8, phase: 0, filled: false, widthFactor: 0.6 },
      { count: 12, phase: 15, filled: false, widthFactor: 0.58 },
      { count: 16, phase: 11.25, filled: false, widthFactor: 0.56 },
    ],
    hubStyle: 'donut',
  },
];

async function run() {
  const previews = [];
  for (const concept of CONCEPTS) {
    const iconSize = 340;
    const pad = 40;
    const full = iconSize + pad * 2;

    const lightInner = mark({ size: iconSize, stroke: LIGHT.navy, bgColor: LIGHT.bg, accent: LIGHT.gold, rings: concept.rings, hubStyle: concept.hubStyle });
    const darkInner = mark({ size: iconSize, stroke: DARK.slate, bgColor: DARK.navy, accent: DARK.gold, rings: concept.rings, hubStyle: concept.hubStyle });

    const gap = 40;
    const totalW = full * 2 + gap;
    const totalH = full + 50;
    const combined = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
      <rect width="${totalW}" height="${totalH}" fill="#FFFFFF" />
      <rect x="0" y="0" width="${full}" height="${full}" fill="${LIGHT.bg}" stroke="#E4E7EC" stroke-width="2" />
      <rect x="${full + gap}" y="0" width="${full}" height="${full}" fill="${DARK.bg}" />
      <g transform="translate(${pad},${pad})">${lightInner}</g>
      <g transform="translate(${full + gap + pad},${pad})">${darkInner}</g>
      <text x="${totalW / 2}" y="${full + 34}" text-anchor="middle" font-family="Liberation Sans, Arial, sans-serif" font-size="19" fill="#4F6079">${concept.label}</text>
    </svg>`;

    const previewFile = path.join(OUT, `v2-concept-${concept.id}.png`);
    await sharp(Buffer.from(combined)).png().toFile(previewFile);

    // icon-only, white bg
    const iconOnly = svgDoc(400, 400, LIGHT.bg, `<g transform="translate(30,30)">${mark({ size: 340, stroke: LIGHT.navy, bgColor: LIGHT.bg, accent: LIGHT.gold, rings: concept.rings, hubStyle: concept.hubStyle })}</g>`);
    await sharp(Buffer.from(iconOnly)).png().toFile(path.join(OUT, `v2-concept-${concept.id}-icon-only.png`));
    fs.writeFileSync(path.join(OUT, `v2-concept-${concept.id}-icon-only.svg`), iconOnly);

    // transparent vector
    const transparent = svgDoc(400, 400, 'none', `<g transform="translate(30,30)">${mark({ size: 340, stroke: LIGHT.navy, bgColor: 'none', accent: LIGHT.gold, rings: concept.rings, hubStyle: concept.hubStyle })}</g>`);
    fs.writeFileSync(path.join(OUT, `v2-concept-${concept.id}-mark.svg`), transparent);

    previews.push(previewFile);
    console.log('Rendered', previewFile);
  }

  const imgs = await Promise.all(previews.map(f => sharp(f).metadata().then(meta => ({ f, meta }))));
  const sheetW = Math.max(...imgs.map(i => i.meta.width));
  const padY = 30;
  const sheetH = imgs.reduce((acc, i) => acc + i.meta.height + padY, padY);
  const composite = imgs.map((i, idx) => {
    const yOff = imgs.slice(0, idx).reduce((acc, p) => acc + p.meta.height + padY, padY);
    return { input: i.f, top: yOff, left: Math.round((sheetW - i.meta.width) / 2) };
  });
  await sharp({ create: { width: sheetW, height: sheetH, channels: 4, background: '#FFFFFF' } })
    .composite(composite)
    .png()
    .toFile(path.join(OUT, 'v2-contact-sheet.png'));
  console.log('Rendered contact sheet');
}

run().catch(e => { console.error(e); process.exit(1); });
