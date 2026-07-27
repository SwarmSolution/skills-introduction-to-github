const pptxgen = require("pptxgenjs");
const ShapeType = new pptxgen().ShapeType;

const THEME_NAME = process.argv[2] || "light";
const isDark = THEME_NAME === "dark";

// ---------------------------------------------------------------------------
// Palette — original, Big-4-caliber (navy dominant + single gold accent),
// not copied from any specific firm's trademarked colors.
// ---------------------------------------------------------------------------
const THEME = isDark
  ? {
      bg: "10162B", // deep navy-black — dark theme background IS the dominant navy
      panel: "1B2340", // slightly lighter navy for card/panel separation
      panelAlt: "212B4C",
      navyBlock: "0B1022", // deepest navy for bookend slides (title/divider/quote/thankyou)
      text: "F2F3F5",
      muted: "A9B4C9",
      slate: "8DA0C2",
      accent: "D4AF5A",
      onDark: "FFFFFF",
      gridLine: "2C3860",
    }
  : {
      bg: "FFFFFF",
      panel: "F4F5F8",
      panelAlt: "EDEFF4",
      navyBlock: "16233F", // dark bookend blocks within the light template
      text: "24262B",
      muted: "667085",
      slate: "4F6079",
      accent: "C89B3C",
      onDark: "FFFFFF",
      gridLine: "E2E5EB",
    };

const NAVY_TEXT = isDark ? THEME.text : "16233F";
const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

const PAGE_W = 13.333;
const PAGE_H = 7.5;
const MARGIN = 0.6;

// ---------------------------------------------------------------------------
// Small geometry helpers
// ---------------------------------------------------------------------------
function addLine(slide, x1, y1, x2, y2, color, width, dash) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const w = Math.abs(dx) || 0.001;
  const h = Math.abs(dy) || 0.001;
  const flipV = dx * dy < 0;
  slide.addShape(ShapeType.line, {
    x,
    y,
    w,
    h,
    flipV,
    line: { color, width, dashType: dash || "solid" },
  });
}

function circleOutline(slide, cx, cy, r, color, width) {
  slide.addShape(ShapeType.ellipse, {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
    fill: { type: "none" },
    line: { color, width },
  });
}

function circleFill(slide, cx, cy, r, color) {
  slide.addShape(ShapeType.ellipse, {
    x: cx - r,
    y: cy - r,
    w: r * 2,
    h: r * 2,
    fill: { color },
    line: { type: "none" },
  });
}

// Decorative large ring motif used on bookend slides (title/divider/quote/thankyou).
function decorativeRings(slide, tone) {
  circleOutline(slide, PAGE_W - 1.2, -1.0, 3.6, tone, 1);
  circleOutline(slide, PAGE_W - 1.2, -1.0, 2.6, tone, 0.75);
  circleOutline(slide, 0.6, PAGE_H + 0.6, 1.8, tone, 1);
}

function pageNumberFooter(slide, n, total, color) {
  slide.addText(`${n} / ${total}`, {
    x: PAGE_W - 1.6,
    y: PAGE_H - 0.45,
    w: 1.2,
    h: 0.3,
    fontFace: BODY_FONT,
    fontSize: 10,
    color,
    align: "right",
    margin: 0,
  });
}

// ---------------------------------------------------------------------------
// Icon shape library — every icon is composed only of native PowerPoint
// autoshapes (ellipse/rect/roundRect/triangle/line + OOXML presets), so every
// icon stays a fully editable vector object, never a raster image.
// Each draw fn receives (slide, cx, cy, r, color) — r = icon half-extent (in).
// ---------------------------------------------------------------------------
const ICONS = {
  growth: (slide, cx, cy, r, color) => {
    const w = r * 0.34;
    const gap = r * 0.18;
    const heights = [r * 0.7, r * 1.15, r * 1.6];
    let x = cx - (w * 3 + gap * 2) / 2;
    const base = cy + r * 0.85;
    heights.forEach((h) => {
      slide.addShape(ShapeType.rect, {
        x,
        y: base - h,
        w,
        h,
        fill: { color },
        line: { type: "none" },
      });
      x += w + gap;
    });
  },
  security: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.pentagon, {
      x: cx - r * 0.75,
      y: cy - r * 0.9,
      w: r * 1.5,
      h: r * 1.8,
      rotate: 180,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  capital: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx - r * 0.28, cy + r * 0.15, r * 0.55, color, 1.5);
    circleOutline(slide, cx + r * 0.28, cy - r * 0.15, r * 0.55, color, 1.5);
  },
  institution: (slide, cx, cy, r, color) => {
    const baseY = cy + r * 0.75;
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.95,
      y: baseY,
      w: r * 1.9,
      h: r * 0.16,
      fill: { color },
      line: { type: "none" },
    });
    slide.addShape(ShapeType.triangle, {
      x: cx - r,
      y: cy - r * 0.95,
      w: r * 2,
      h: r * 0.75,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    [-0.6, 0, 0.6].forEach((off) => {
      slide.addShape(ShapeType.rect, {
        x: cx + r * off - r * 0.06,
        y: cy - r * 0.15,
        w: r * 0.12,
        h: r * 0.9,
        fill: { color },
        line: { type: "none" },
      });
    });
  },
  care: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.heart, {
      x: cx - r * 0.85,
      y: cy - r * 0.8,
      w: r * 1.7,
      h: r * 1.6,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  medical: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.plus, {
      x: cx - r * 0.8,
      y: cy - r * 0.8,
      w: r * 1.6,
      h: r * 1.6,
      fill: { color },
      line: { type: "none" },
    });
  },
  science: (slide, cx, cy, r, color) => {
    const pts = [
      [cx, cy - r * 0.85],
      [cx - r * 0.8, cy + r * 0.55],
      [cx + r * 0.8, cy + r * 0.55],
    ];
    addLine(slide, pts[0][0], pts[0][1], pts[1][0], pts[1][1], color, 1.5);
    addLine(slide, pts[1][0], pts[1][1], pts[2][0], pts[2][1], color, 1.5);
    addLine(slide, pts[2][0], pts[2][1], pts[0][0], pts[0][1], color, 1.5);
    pts.forEach((p) => circleFill(slide, p[0], p[1], r * 0.16, color));
  },
  pharma: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.5,
      y: cy - r * 0.95,
      w: r,
      h: r * 1.9,
      fill: { type: "none" },
      line: { color, width: 1.75 },
      rectRadius: 0.15,
    });
    addLine(slide, cx - r * 0.5, cy, cx + r * 0.5, cy, color, 1.75);
  },
  operations: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.gear9, {
      x: cx - r * 0.9,
      y: cy - r * 0.9,
      w: r * 1.8,
      h: r * 1.8,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  facility: (slide, cx, cy, r, color) => {
    const baseY = cy + r * 0.7;
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.9,
      y: cy - r * 0.2,
      w: r * 1.8,
      h: r * 0.9,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.triangle, {
      x: cx - r * 0.95,
      y: cy - r * 0.95,
      w: r * 1.9,
      h: r * 0.75,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.rect, {
      x: cx + r * 0.45,
      y: cy - r * 1.15,
      w: r * 0.18,
      h: r * 0.55,
      fill: { color },
      line: { type: "none" },
    });
  },
  logistics: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.9,
      y: cy - r * 0.3,
      w: r * 1.5,
      h: r * 0.7,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.rect, {
      x: cx + r * 0.6,
      y: cy - r * 0.05,
      w: r * 0.5,
      h: r * 0.45,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    circleOutline(slide, cx - r * 0.5, cy + r * 0.55, r * 0.22, color, 1.5);
    circleOutline(slide, cx + r * 0.35, cy + r * 0.55, r * 0.22, color, 1.5);
  },
  packaging: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.cube, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  cloud: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.cloud, {
      x: cx - r * 0.95,
      y: cy - r * 0.65,
      w: r * 1.9,
      h: r * 1.3,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  connectivity: (slide, cx, cy, r, color) => {
    circleFill(slide, cx, cy + r * 0.55, r * 0.12, color);
    [0.5, 0.85, 1.2].forEach((rr) => {
      slide.addShape(ShapeType.arc, {
        x: cx - r * rr,
        y: cy + r * 0.55 - r * rr,
        w: r * rr * 2,
        h: r * rr * 2,
        angleRange: [200, 340],
        fill: { type: "none" },
        line: { color, width: 1.5 },
      });
    });
  },
  data: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      rectRadius: 0.08,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    [-0.4, 0, 0.4].forEach((off) => {
      slide.addShape(ShapeType.rect, {
        x: cx - r * 0.55,
        y: cy + r * off - r * 0.05,
        w: r * 1.1,
        h: r * 0.1,
        fill: { color },
        line: { type: "none" },
      });
    });
  },
  innovation: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.ellipse, {
      x: cx - r * 0.6,
      y: cy - r * 0.95,
      w: r * 1.2,
      h: r * 1.2,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.3,
      y: cy + r * 0.2,
      w: r * 0.6,
      h: r * 0.35,
      fill: { type: "none" },
      line: { color, width: 1.5 },
    });
  },
  renewable: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.sun, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  power: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.lightningBolt, {
      x: cx - r * 0.55,
      y: cy - r * 0.95,
      w: r * 1.1,
      h: r * 1.9,
      fill: { color },
      line: { type: "none" },
    });
  },
  sustainability: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.teardrop, {
      x: cx - r * 0.75,
      y: cy - r * 0.85,
      w: r * 1.1,
      h: r * 1.5,
      rotate: 45,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.teardrop, {
      x: cx - r * 0.35,
      y: cy - r * 0.65,
      w: r * 1.1,
      h: r * 1.5,
      rotate: 225,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  storage: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.75,
      y: cy - r * 0.5,
      w: r * 1.5,
      h: r,
      rectRadius: 0.12,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.rect, {
      x: cx + r * 0.75,
      y: cy - r * 0.18,
      w: r * 0.12,
      h: r * 0.36,
      fill: { color },
      line: { type: "none" },
    });
  },
  strategy: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx, cy, r * 0.9, color, 1.75);
    circleOutline(slide, cx, cy, r * 0.5, color, 1.5);
    circleFill(slide, cx, cy, r * 0.14, color);
  },
  advisory: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.85,
      y: cy - r * 0.35,
      w: r * 1.7,
      h: r * 1.05,
      rectRadius: 0.1,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.arc, {
      x: cx - r * 0.4,
      y: cy - r * 0.95,
      w: r * 0.8,
      h: r * 0.8,
      angleRange: [180, 360],
      fill: { type: "none" },
      line: { color, width: 1.5 },
    });
  },
  insights: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.pie, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      angleRange: [270, 90],
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  partnership: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx - r * 0.32, cy, r * 0.58, color, 1.5);
    circleOutline(slide, cx + r * 0.32, cy, r * 0.58, color, 1.5);
  },
};

const INDUSTRY_LIBRARY = [
  {
    name: "Financial Services",
    icons: [
      { key: "growth", name: "Growth", words: "Finance · Growth · Investment · Analytics" },
      { key: "security", name: "Security", words: "Banking · Security · Trust · Compliance" },
      { key: "capital", name: "Capital", words: "Capital · Funding · Currency · Wealth" },
      { key: "institution", name: "Institution", words: "Banking · Institution · Financial Services" },
    ],
  },
  {
    name: "Healthcare & Life Sciences",
    icons: [
      { key: "care", name: "Care", words: "Healthcare · Wellness · Patient Care" },
      { key: "medical", name: "Medical", words: "Medical · Clinical · Hospital" },
      { key: "science", name: "Science", words: "Life Sciences · Research · Biotech · Molecule" },
      { key: "pharma", name: "Pharma", words: "Pharmaceutical · Therapeutics · Drug Development" },
    ],
  },
  {
    name: "Manufacturing & Industrial",
    icons: [
      { key: "operations", name: "Operations", words: "Manufacturing · Operations · Machinery" },
      { key: "facility", name: "Facility", words: "Plant · Facility · Production" },
      { key: "logistics", name: "Logistics", words: "Logistics · Supply Chain · Distribution" },
      { key: "packaging", name: "Packaging", words: "Packaging · Inventory · Product" },
    ],
  },
  {
    name: "Technology & Telecom",
    icons: [
      { key: "cloud", name: "Cloud", words: "Cloud · Infrastructure · SaaS" },
      { key: "connectivity", name: "Connectivity", words: "Connectivity · Network · Telecom" },
      { key: "data", name: "Data", words: "Data · IT · Digital" },
      { key: "innovation", name: "Innovation", words: "Innovation · Technology · R&D" },
    ],
  },
  {
    name: "Energy & Utilities",
    icons: [
      { key: "renewable", name: "Renewable", words: "Renewable · Solar · Energy" },
      { key: "power", name: "Power", words: "Power · Utilities · Electricity" },
      { key: "sustainability", name: "Sustainability", words: "Sustainability · Environment · ESG" },
      { key: "storage", name: "Storage", words: "Energy Storage · Battery · Grid" },
    ],
  },
  {
    name: "Professional Services",
    icons: [
      { key: "strategy", name: "Strategy", words: "Strategy · Focus · Goals" },
      { key: "advisory", name: "Advisory", words: "Advisory · Consulting · Professional Services" },
      { key: "insights", name: "Insights", words: "Insights · Analytics · Reporting" },
      { key: "partnership", name: "Partnership", words: "Partnership · Collaboration · Alliance" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Slide builders
// ---------------------------------------------------------------------------
function slideHeader(slide, title, subtitle) {
  slide.addText(title, {
    x: MARGIN,
    y: 0.45,
    w: PAGE_W - MARGIN * 2,
    h: 0.65,
    fontFace: TITLE_FONT,
    fontSize: 28,
    bold: true,
    color: NAVY_TEXT,
    align: "left",
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: MARGIN,
      y: 1.05,
      w: PAGE_W - MARGIN * 2,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 13,
      color: THEME.muted,
      align: "left",
      margin: 0,
    });
  }
}

function iconBadge(slide, cx, cy, iconKey, badgeR) {
  circleOutline(slide, cx, cy, badgeR, THEME.accent, 1.5);
  ICONS[iconKey](slide, cx, cy, badgeR * 0.55, THEME.accent);
}

function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5in
  pres.author = "Business Development";
  pres.company = "Template";
  pres.title = `Consulting Deck Template — ${isDark ? "Dark" : "Light"}`;

  pres.defineSlideMaster({
    title: "MASTER",
    background: { color: THEME.bg },
    slideNumber: { x: PAGE_W - 1.6, y: PAGE_H - 0.45, fontFace: BODY_FONT, fontSize: 10, color: THEME.muted, align: "right" },
  });

  const TOTAL = 19; // 12 core + 1 appendix divider + 6 industry pages
  let n = 0;

  // ---- 1. TITLE -------------------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("PRACTICE NAME  ·  CONFIDENTIAL", {
      x: MARGIN, y: 3.55, w: 8, h: 0.35, fontFace: BODY_FONT, fontSize: 12,
      color: THEME.accent, charSpacing: 2, align: "left", margin: 0,
    });
    s.addText("[Engagement / Presentation Title]", {
      x: MARGIN, y: 3.85, w: 11.8, h: 1.15, fontFace: TITLE_FONT, fontSize: 34, bold: true,
      color: THEME.onDark, align: "left", margin: 0, autoFit: true,
    });
    s.addText("[A concise one-line description of the engagement or presentation purpose]", {
      x: MARGIN, y: 5.35, w: 9.5, h: 0.6, fontFace: BODY_FONT, fontSize: 17,
      color: "D7DCE6", align: "left", margin: 0,
    });
    s.addText("[Prepared for Client Name]      [Month Year]", {
      x: MARGIN, y: PAGE_H - 0.75, w: 8, h: 0.35, fontFace: BODY_FONT, fontSize: 11,
      color: THEME.muted, align: "left", margin: 0,
    });
  }

  // ---- 2. TEMPLATE STANDARDS ------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Template Standards", "Brand and style guide for this deck — colors, type, and icon usage");

    const swatches = [
      { label: "Navy / Primary", hex: isDark ? THEME.bg : THEME.navyBlock, on: THEME.onDark },
      { label: "Slate / Secondary", hex: THEME.slate, on: THEME.onDark },
      { label: "Accent Gold", hex: THEME.accent, on: "1A1A1A" },
      { label: "Muted Text", hex: THEME.muted, on: THEME.onDark },
      { label: "Background", hex: THEME.bg, on: NAVY_TEXT },
    ];
    let x = MARGIN;
    const swW = 2.15;
    swatches.forEach((sw) => {
      s.addShape(ShapeType.roundRect, {
        x, y: 1.65, w: swW, h: 1.05, rectRadius: 0.06,
        fill: { color: sw.hex }, line: { color: THEME.gridLine, width: sw.hex === THEME.bg ? 1 : 0 },
      });
      s.addText(sw.label, { x, y: 2.75, w: swW, h: 0.3, fontFace: BODY_FONT, fontSize: 11, bold: true, color: NAVY_TEXT, margin: 0 });
      s.addText(`#${sw.hex}`, { x, y: 3.03, w: swW, h: 0.28, fontFace: BODY_FONT, fontSize: 10, color: THEME.muted, margin: 0 });
      x += swW + 0.15;
    });

    s.addText("Aa", { x: MARGIN, y: 3.75, w: 1.3, h: 1.0, fontFace: TITLE_FONT, fontSize: 44, bold: true, color: NAVY_TEXT, margin: 0 });
    s.addText("Headings — Cambria Bold\n36–44pt slide titles · 20–24pt section headers", {
      x: MARGIN + 1.4, y: 3.95, w: 4.1, h: 0.75, fontFace: BODY_FONT, fontSize: 12, color: THEME.text, margin: 0, lineSpacingMultiple: 1.3,
    });
    s.addText("Aa", { x: 7.15, y: 3.75, w: 1.3, h: 1.0, fontFace: BODY_FONT, fontSize: 44, color: NAVY_TEXT, margin: 0 });
    s.addText("Body & Captions — Calibri\n14–16pt body text · 10–12pt captions", {
      x: 8.55, y: 3.95, w: 4.1, h: 0.75, fontFace: BODY_FONT, fontSize: 12, color: THEME.text, margin: 0, lineSpacingMultiple: 1.3,
    });

    iconBadge(s, MARGIN + 0.55, 5.55, "strategy", 0.55);
    s.addText("Icon usage — line-style icons housed in an accent-outlined circle. Every icon is a native, fully editable PowerPoint shape (recolor, resize, restyle) — never a raster image. Full library on the appendix pages.", {
      x: MARGIN + 1.4, y: 5.05, w: 10.3, h: 1.0, fontFace: BODY_FONT, fontSize: 12, color: THEME.text, margin: 0, lineSpacingMultiple: 1.25,
    });

    s.addText("Margins: 0.6in minimum  ·  Grid gaps: 0.3–0.5in  ·  Logo placeholder: top-left on dividers, footer on content slides", {
      x: MARGIN, y: PAGE_H - 0.75, w: 11, h: 0.3, fontFace: BODY_FONT, fontSize: 10, italic: true, color: THEME.muted, margin: 0,
    });
    pageNumberFooterSkip(s);
  }

  // ---- 3. AGENDA --------------------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Agenda");
    const items = [
      "Executive Summary",
      "Current State Assessment",
      "Recommended Approach",
      "Implementation Timeline",
      "Investment & Next Steps",
    ];
    let y = 1.85;
    items.forEach((item, i) => {
      circleOutline(s, MARGIN + 0.28, y + 0.28, 0.28, THEME.accent, 1.5);
      s.addText(String(i + 1).padStart(2, "0"), {
        x: MARGIN, y: y + 0.09, w: 0.56, h: 0.4, fontFace: BODY_FONT, fontSize: 12, bold: true,
        color: THEME.accent, align: "center", valign: "middle", margin: 0,
      });
      s.addText(item, {
        x: MARGIN + 0.75, y, w: 9, h: 0.56, fontFace: TITLE_FONT, fontSize: 18, bold: true,
        color: NAVY_TEXT, valign: "middle", margin: 0,
      });
      y += 0.85;
    });
  }

  // ---- 4. SECTION DIVIDER -------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("01", {
      x: MARGIN, y: 2.5, w: 4, h: 1.6, fontFace: TITLE_FONT, fontSize: 90, bold: true,
      color: isDark ? THEME.panelAlt : "24304F", align: "left", margin: 0,
    });
    s.addText("Current State Assessment", {
      x: MARGIN, y: 3.95, w: 10, h: 0.9, fontFace: TITLE_FONT, fontSize: 34, bold: true,
      color: THEME.onDark, align: "left", margin: 0,
    });
    s.addText("[One-line framing of what this section covers and why it matters]", {
      x: MARGIN, y: 4.75, w: 9, h: 0.5, fontFace: BODY_FONT, fontSize: 15, color: "D7DCE6", margin: 0,
    });
  }

  // ---- 5. EXECUTIVE SUMMARY ------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Executive Summary");
    const paras = [
      "[State the situation in one to two sentences — what prompted this engagement or presentation.]",
      "[State the recommended approach or thesis in one to two sentences.]",
      "[State the expected impact or outcome in one to two sentences.]",
    ];
    let y = 1.85;
    paras.forEach((p) => {
      circleFill(s, MARGIN + 0.06, y + 0.12, 0.05, THEME.accent);
      s.addText(p, { x: MARGIN + 0.3, y: y - 0.05, w: 6.6, h: 0.85, fontFace: BODY_FONT, fontSize: 14, color: THEME.text, margin: 0, lineSpacingMultiple: 1.25 });
      y += 1.0;
    });

    const stats = [
      { n: "35%", l: "Projected efficiency gain" },
      { n: "$4.2M", l: "Estimated annual savings" },
      { n: "6 mo", l: "Time to value" },
    ];
    let sy = 1.85;
    stats.forEach((st) => {
      s.addShape(ShapeType.roundRect, { x: 7.55, y: sy, w: 5.2, h: 1.1, rectRadius: 0.06, fill: { color: THEME.panel }, line: { type: "none" } });
      s.addText(st.n, { x: 7.85, y: sy + 0.12, w: 2, h: 0.6, fontFace: TITLE_FONT, fontSize: 30, bold: true, color: THEME.accent, margin: 0 });
      s.addText(st.l, { x: 7.85, y: sy + 0.72, w: 4.6, h: 0.3, fontFace: BODY_FONT, fontSize: 11, color: THEME.muted, margin: 0 });
      sy += 1.3;
    });
  }

  // ---- 6. CONTENT — ICON ROWS -----------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Key Focus Areas");
    const rows = [
      { icon: "strategy", title: "Align on Strategy", body: "[Short description of this focus area and its intended outcome.]" },
      { icon: "operations", title: "Optimize Operations", body: "[Short description of this focus area and its intended outcome.]" },
      { icon: "cloud", title: "Modernize Technology", body: "[Short description of this focus area and its intended outcome.]" },
      { icon: "growth", title: "Accelerate Growth", body: "[Short description of this focus area and its intended outcome.]" },
    ];
    let y = 1.9;
    rows.forEach((r) => {
      iconBadge(s, MARGIN + 0.5, y + 0.42, r.icon, 0.42);
      s.addText(r.title, { x: MARGIN + 1.25, y: y - 0.02, w: 10.2, h: 0.4, fontFace: TITLE_FONT, fontSize: 16, bold: true, color: NAVY_TEXT, margin: 0 });
      s.addText(r.body, { x: MARGIN + 1.25, y: y + 0.36, w: 10.2, h: 0.45, fontFace: BODY_FONT, fontSize: 12.5, color: THEME.muted, margin: 0 });
      y += 1.15;
    });
  }

  // ---- 7. CONTENT — TWO COLUMN ----------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Current State vs. Future State");
    const cols = [
      { label: "Today", items: ["[Challenge or constraint one]", "[Challenge or constraint two]", "[Challenge or constraint three]"] },
      { label: "Tomorrow", items: ["[Improved outcome one]", "[Improved outcome two]", "[Improved outcome three]"] },
    ];
    const colW = 5.7;
    let x = MARGIN;
    cols.forEach((col) => {
      s.addShape(ShapeType.roundRect, { x, y: 1.75, w: colW, h: 4.5, rectRadius: 0.05, fill: { color: THEME.panel }, line: { type: "none" } });
      s.addText(col.label, { x: x + 0.35, y: 2.0, w: colW - 0.7, h: 0.45, fontFace: TITLE_FONT, fontSize: 18, bold: true, color: THEME.accent, margin: 0 });
      let iy = 2.65;
      col.items.forEach((it) => {
        circleFill(s, x + 0.4, iy + 0.13, 0.045, THEME.slate);
        s.addText(it, { x: x + 0.6, y: iy - 0.05, w: colW - 1.0, h: 0.55, fontFace: BODY_FONT, fontSize: 13, color: THEME.text, margin: 0, lineSpacingMultiple: 1.2 });
        iy += 0.72;
      });
      x += colW + 0.25;
    });
  }

  // ---- 8. DATA / CHART --------------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Illustrative Data View", "Replace with live data — chart is a native, editable PowerPoint chart object");
    const dataChartTypes = [
      {
        type: pres.ChartType.bar,
        data: [
          {
            name: "Illustrative Metric",
            labels: ["Q1", "Q2", "Q3", "Q4"],
            values: [42, 55, 61, 78],
          },
        ],
      },
    ];
    s.addChart(dataChartTypes[0].type, dataChartTypes[0].data, {
      x: MARGIN, y: 1.75, w: PAGE_W - MARGIN * 2, h: 4.6,
      barDir: "col",
      showTitle: true,
      title: "Illustrative Metric by Quarter",
      titleFontFace: TITLE_FONT,
      titleFontSize: 14,
      titleColor: NAVY_TEXT,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: THEME.muted,
      dataLabelFontSize: 10,
      chartColors: [THEME.accent],
      showLegend: false,
      catAxisLabelColor: THEME.muted,
      catAxisLabelFontFace: BODY_FONT,
      valAxisLabelColor: THEME.muted,
      valAxisLabelFontFace: BODY_FONT,
      valAxisLabelFormatCode: "0",
      valGridLine: { color: THEME.gridLine, size: 1 },
      catGridLine: { style: "none" },
      plotArea: { fill: { color: THEME.bg } },
      chartArea: { fill: { color: THEME.bg } },
    });
  }

  // ---- 9. PROCESS / TIMELINE ------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Implementation Roadmap");
    const phases = ["Assess", "Design", "Build", "Pilot", "Scale"];
    const trackY = 3.6;
    const startX = MARGIN + 0.6;
    const endX = PAGE_W - MARGIN - 0.6;
    addLine(s, startX, trackY, endX, trackY, THEME.gridLine, 1.5);
    const step = (endX - startX) / (phases.length - 1);
    phases.forEach((ph, i) => {
      const x = startX + step * i;
      circleFill(s, x, trackY, 0.16, THEME.accent);
      circleOutline(s, x, trackY, 0.32, THEME.accent, 1.25);
      s.addText(String(i + 1), { x: x - 0.32, y: trackY - 0.18, w: 0.64, h: 0.36, fontFace: BODY_FONT, fontSize: 12, bold: true, color: THEME.onDark, align: "center", valign: "middle", margin: 0 });
      s.addText(ph, { x: x - 0.75, y: trackY + 0.45, w: 1.5, h: 0.35, fontFace: TITLE_FONT, fontSize: 13, bold: true, color: NAVY_TEXT, align: "center", margin: 0 });
      s.addText(`[Phase ${i + 1} note]`, { x: x - 0.9, y: trackY - 0.85, w: 1.8, h: 0.55, fontFace: BODY_FONT, fontSize: 10.5, color: THEME.muted, align: "center", margin: 0, lineSpacingMultiple: 1.15 });
    });
  }

  // ---- 10. TEAM / ORG --------------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, "Engagement Team");
    const seats = 4;
    const gap = 0.5;
    const w = (PAGE_W - MARGIN * 2 - gap * (seats - 1)) / seats;
    for (let i = 0; i < seats; i++) {
      const x = MARGIN + i * (w + gap) + w / 2;
      circleOutline(s, x, 2.55, 0.85, THEME.accent, 1.5);
      s.addShape(ShapeType.ellipse, { x: x - 0.32, y: 2.05, w: 0.64, h: 0.64, fill: { type: "none" }, line: { color: THEME.slate, width: 1.5 } });
      s.addShape(ShapeType.arc, { x: x - 0.55, y: 2.65, w: 1.1, h: 1.0, angleRange: [180, 360], fill: { type: "none" }, line: { color: THEME.slate, width: 1.5 } });
      s.addText("[Name]", { x: x - w / 2, y: 3.65, w, h: 0.35, fontFace: TITLE_FONT, fontSize: 14, bold: true, color: NAVY_TEXT, align: "center", margin: 0 });
      s.addText("[Title / Role]", { x: x - w / 2, y: 4.0, w, h: 0.3, fontFace: BODY_FONT, fontSize: 11, color: THEME.muted, align: "center", margin: 0 });
    }
  }

  // ---- 11. QUOTE / CALLOUT -------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("“", { x: MARGIN, y: 1.5, w: 1.5, h: 1.2, fontFace: TITLE_FONT, fontSize: 70, bold: true, color: THEME.accent, margin: 0 });
    s.addText("[Insert a compelling client quote, key finding, or thesis statement here.]", {
      x: MARGIN + 0.2, y: 2.6, w: 10.5, h: 1.9, fontFace: TITLE_FONT, fontSize: 26, italic: true,
      color: THEME.onDark, align: "left", margin: 0, lineSpacingMultiple: 1.3,
    });
    s.addText("— [Name, Title, Organization]", {
      x: MARGIN + 0.2, y: 4.85, w: 8, h: 0.4, fontFace: BODY_FONT, fontSize: 14, color: THEME.slate, margin: 0,
    });
  }

  // ---- 12. THANK YOU / CONTACT ---------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("Thank You", { x: MARGIN, y: 2.4, w: 9, h: 1.0, fontFace: TITLE_FONT, fontSize: 40, bold: true, color: THEME.onDark, margin: 0 });
    s.addText("[Closing tagline or one-line call to action]", { x: MARGIN, y: 3.35, w: 8.5, h: 0.5, fontFace: BODY_FONT, fontSize: 15, color: "D7DCE6", margin: 0 });
    const contacts = [
      { name: "[Name]", role: "[Title / Role]", email: "[email@company.com]" },
      { name: "[Name]", role: "[Title / Role]", email: "[email@company.com]" },
    ];
    let cx = MARGIN;
    contacts.forEach((c) => {
      s.addText(c.name, { x: cx, y: 4.5, w: 4.5, h: 0.35, fontFace: TITLE_FONT, fontSize: 15, bold: true, color: THEME.onDark, margin: 0 });
      s.addText(c.role, { x: cx, y: 4.85, w: 4.5, h: 0.3, fontFace: BODY_FONT, fontSize: 12, color: THEME.slate, margin: 0 });
      s.addText(c.email, { x: cx, y: 5.15, w: 4.5, h: 0.3, fontFace: BODY_FONT, fontSize: 12, color: THEME.slate, margin: 0 });
      cx += 5.0;
    });
  }

  // ---- 13. ICON LIBRARY DIVIDER --------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("APPENDIX", { x: MARGIN, y: 3.0, w: 6, h: 0.4, fontFace: BODY_FONT, fontSize: 13, color: THEME.accent, charSpacing: 2, margin: 0 });
    s.addText("Icon Library", { x: MARGIN, y: 3.4, w: 9, h: 0.9, fontFace: TITLE_FONT, fontSize: 34, bold: true, color: THEME.onDark, margin: 0 });
    s.addText("Editable line icons grouped by industry — recolor, resize, or restyle natively in PowerPoint. Each icon is captioned with searchable keywords.", {
      x: MARGIN, y: 4.2, w: 9.5, h: 0.6, fontFace: BODY_FONT, fontSize: 14, color: "D7DCE6", margin: 0, lineSpacingMultiple: 1.25,
    });
  }

  // ---- 14-19. INDUSTRY ICON PAGES -------------------------------------
  INDUSTRY_LIBRARY.forEach((industry) => {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, industry.name, "Editable line icons — recolor, resize, or restyle natively in PowerPoint");
    const cols = industry.icons.length;
    const gap = 0.5;
    const colW = (PAGE_W - MARGIN * 2 - gap * (cols - 1)) / cols;
    industry.icons.forEach((ic, i) => {
      const cx = MARGIN + i * (colW + gap) + colW / 2;
      const cy = 3.15;
      iconBadge(s, cx, cy, ic.key, 0.85);
      s.addText(ic.name, { x: cx - colW / 2, y: 4.25, w: colW, h: 0.35, fontFace: TITLE_FONT, fontSize: 15, bold: true, color: NAVY_TEXT, align: "center", margin: 0 });
      s.addText(ic.words, { x: cx - colW / 2 + 0.1, y: 4.62, w: colW - 0.2, h: 0.6, fontFace: BODY_FONT, fontSize: 10, italic: true, color: THEME.muted, align: "center", margin: 0, lineSpacingMultiple: 1.2 });
    });
  });

  function pageNumberFooterSkip() {} // slideNumber comes from the master automatically

  const outPath = `${__dirname}/Consulting-Template-${isDark ? "Dark" : "Light"}.pptx`;
  return pres.writeFile({ fileName: outPath }).then(() => {
    console.log("wrote", outPath, "slides:", n);
  });
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
