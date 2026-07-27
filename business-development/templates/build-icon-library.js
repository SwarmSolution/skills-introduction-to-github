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

  // --- Life Sciences additions ---
  genomics: (slide, cx, cy, r, color) => {
    const n = 5;
    const top = cy - r * 0.9;
    const step = (r * 1.8) / (n - 1);
    let prevX = null;
    let prevY = null;
    for (let i = 0; i < n; i++) {
      const y = top + step * i;
      const x = cx + (i % 2 === 0 ? -1 : 1) * r * 0.35;
      if (prevX !== null) addLine(slide, prevX, prevY, x, y, color, 1.25);
      circleFill(slide, x, y, r * 0.09, color);
      prevX = x;
      prevY = y;
    }
  },
  research: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.triangle, {
      x: cx - r * 0.55,
      y: cy - r * 0.1,
      w: r * 1.1,
      h: r,
      flipV: true,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.18,
      y: cy - r * 0.95,
      w: r * 0.36,
      h: r * 0.35,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },

  // --- Artificial Intelligence ---
  neuralNetwork: (slide, cx, cy, r, color) => {
    const leftX = cx - r * 0.7;
    const rightX = cx + r * 0.7;
    const leftYs = [cy - r * 0.75, cy, cy + r * 0.75];
    leftYs.forEach((ly) => {
      addLine(slide, leftX, ly, rightX, cy, color, 1.25);
      circleFill(slide, leftX, ly, r * 0.13, color);
    });
    circleFill(slide, rightX, cy, r * 0.18, color);
  },
  automation2: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.gear6, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  assistant: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.wedgeRoundRectCallout, {
      x: cx - r * 0.9,
      y: cy - r * 0.75,
      w: r * 1.8,
      h: r * 1.3,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  vision: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.ellipse, {
      x: cx - r * 0.95,
      y: cy - r * 0.5,
      w: r * 1.9,
      h: r,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    circleFill(slide, cx, cy, r * 0.22, color);
  },

  // --- Data & Analytics ---
  dataAnalytics: (slide, cx, cy, r, color) => {
    const w = r * 0.3;
    const gap = r * 0.16;
    const heights = [r * 0.55, r * 0.95, r * 0.7, r * 1.3];
    let x = cx - (w * 4 + gap * 3) / 2;
    const base = cy + r * 0.85;
    const tops = [];
    heights.forEach((h) => {
      slide.addShape(ShapeType.rect, {
        x, y: base - h, w, h, fill: { color: color }, line: { type: "none" },
      });
      tops.push([x + w / 2, base - h - r * 0.1]);
      x += w + gap;
    });
    for (let i = 0; i < tops.length - 1; i++) {
      addLine(slide, tops[i][0], tops[i][1], tops[i + 1][0], tops[i + 1][1], color, 1.25);
    }
  },
  database: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.can, {
      x: cx - r * 0.7,
      y: cy - r * 0.9,
      w: r * 1.4,
      h: r * 1.8,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
  },
  dashboard: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.95,
      y: cy - r * 0.75,
      w: r * 1.9,
      h: r * 1.5,
      rectRadius: 0.08,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.pie, {
      x: cx - r * 0.6,
      y: cy - r * 0.35,
      w: r * 0.8,
      h: r * 0.8,
      angleRange: [270, 90],
      fill: { type: "none" },
      line: { color, width: 1.25 },
    });
  },
  dataLayers: (slide, cx, cy, r, color) => {
    [-0.55, 0, 0.55].forEach((off) => {
      slide.addShape(ShapeType.roundRect, {
        x: cx - r * 0.85, y: cy + r * off - r * 0.16, w: r * 1.7, h: r * 0.32,
        rectRadius: 0.3, fill: { type: "none" }, line: { color, width: 1.5 },
      });
    });
  },

  // --- Digital Transformation ---
  connectedEcosystem: (slide, cx, cy, r, color) => {
    const pts = [
      [cx, cy - r * 0.85],
      [cx - r * 0.85, cy + r * 0.5],
      [cx + r * 0.85, cy + r * 0.5],
    ];
    addLine(slide, pts[0][0], pts[0][1], pts[1][0], pts[1][1], color, 1.25);
    addLine(slide, pts[1][0], pts[1][1], pts[2][0], pts[2][1], color, 1.25);
    addLine(slide, pts[2][0], pts[2][1], pts[0][0], pts[0][1], color, 1.25);
    pts.forEach((p) => circleOutline(slide, p[0], p[1], r * 0.18, color, 1.5));
  },
  transformation: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.circularArrow, {
      x: cx - r * 0.85,
      y: cy - r * 0.85,
      w: r * 1.7,
      h: r * 1.7,
      fill: { color },
      line: { type: "none" },
    });
  },
  cloudMigration: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.cloud, {
      x: cx - r * 0.9,
      y: cy - r * 0.55,
      w: r * 1.8,
      h: r * 1.1,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.upArrow, {
      x: cx - r * 0.16,
      y: cy - r * 0.15,
      w: r * 0.32,
      h: r * 0.65,
      fill: { color },
      line: { type: "none" },
    });
  },
  platform: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.hexagon, {
      x: cx - r * 0.9,
      y: cy - r * 0.85,
      w: r * 1.8,
      h: r * 1.7,
      fill: { type: "none" },
      line: { color, width: 1.75 },
    });
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
    name: "Life Sciences",
    icons: [
      { key: "care", name: "Care", words: "Healthcare · Wellness · Patient Care" },
      { key: "medical", name: "Medical", words: "Medical · Clinical · Hospital" },
      { key: "science", name: "Science", words: "Life Sciences · Research · Biotech · Molecule" },
      { key: "pharma", name: "Pharma", words: "Pharmaceutical · Therapeutics · Drug Development" },
      { key: "genomics", name: "Genomics", words: "Genomics · DNA · Biotech · Precision Medicine" },
      { key: "research", name: "Research", words: "R&D · Laboratory · Formulation · Discovery" },
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
  {
    name: "Artificial Intelligence",
    icons: [
      { key: "neuralNetwork", name: "Neural Network", words: "AI · Machine Learning · Neural Network" },
      { key: "automation2", name: "Automation", words: "Automation · AI · Intelligent Process" },
      { key: "assistant", name: "Assistant", words: "Conversational AI · Copilot · Chatbot" },
      { key: "vision", name: "Vision", words: "Computer Vision · Insight · Recognition" },
    ],
  },
  {
    name: "Data & Analytics",
    icons: [
      { key: "dataAnalytics", name: "Analytics", words: "Data · Analytics · Trends · Reporting" },
      { key: "database", name: "Database", words: "Database · Storage · Records" },
      { key: "dashboard", name: "Dashboard", words: "Dashboard · KPI · Visualization" },
      { key: "dataLayers", name: "Governance", words: "Data Governance · Layers · Records" },
    ],
  },
  {
    name: "Digital Transformation",
    icons: [
      { key: "connectedEcosystem", name: "Ecosystem", words: "Digital Thread · Connectivity · IoT" },
      { key: "transformation", name: "Transformation", words: "Digital Transformation · Change · Modernization" },
      { key: "cloudMigration", name: "Cloud Migration", words: "Cloud Migration · Infrastructure · Scale" },
      { key: "platform", name: "Platform", words: "Platform · Integration · Unified System" },
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
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Business Development";
  pres.company = "Icon Library";
  pres.title = `Icon Library — ${isDark ? "Dark" : "Light"}`;

  pres.defineSlideMaster({
    title: "MASTER",
    background: { color: THEME.bg },
    slideNumber: { x: PAGE_W - 1.6, y: PAGE_H - 0.45, fontFace: BODY_FONT, fontSize: 10, color: THEME.muted, align: "right" },
  });

  let n = 0;

  // ---- COVER ------------------------------------------------------------
  {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    s.background = { color: THEME.navyBlock };
    decorativeRings(s, isDark ? THEME.gridLine : "24304F");
    s.addText("REFERENCE LIBRARY  ·  ORIGINAL ARTWORK", {
      x: MARGIN, y: 3.15, w: 9, h: 0.35, fontFace: BODY_FONT, fontSize: 12,
      color: THEME.accent, charSpacing: 2, align: "left", margin: 0,
    });
    s.addText("Icon Library", {
      x: MARGIN, y: 3.55, w: 10, h: 1.1, fontFace: TITLE_FONT, fontSize: 40, bold: true,
      color: THEME.onDark, align: "left", margin: 0,
    });
    s.addText("Editable line icons across 9 categories — every icon is a native PowerPoint shape (recolor, resize, restyle freely), grouped and captioned with searchable keywords.", {
      x: MARGIN, y: 4.75, w: 9.5, h: 0.75, fontFace: BODY_FONT, fontSize: 15,
      color: "D7DCE6", align: "left", margin: 0, lineSpacingMultiple: 1.25,
    });
    const catNames = INDUSTRY_LIBRARY.map((c) => c.name).join("   ·   ");
    s.addText(catNames, {
      x: MARGIN, y: PAGE_H - 0.85, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 10,
      color: THEME.muted, align: "left", margin: 0,
    });
  }

  // ---- CATEGORY PAGES -----------------------------------------------------
  INDUSTRY_LIBRARY.forEach((industry) => {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    slideHeader(s, industry.name, "Editable line icons — recolor, resize, or restyle natively in PowerPoint");
    const cols = industry.icons.length;
    const gap = cols > 4 ? 0.3 : 0.5;
    const badgeR = cols > 4 ? 0.62 : 0.85;
    const colW = (PAGE_W - MARGIN * 2 - gap * (cols - 1)) / cols;
    industry.icons.forEach((ic, i) => {
      const cx = MARGIN + i * (colW + gap) + colW / 2;
      const cy = 3.15;
      iconBadge(s, cx, cy, ic.key, badgeR);
      s.addText(ic.name, { x: cx - colW / 2, y: 4.25, w: colW, h: 0.35, fontFace: TITLE_FONT, fontSize: 15, bold: true, color: NAVY_TEXT, align: "center", margin: 0 });
      s.addText(ic.words, { x: cx - colW / 2 + 0.1, y: 4.62, w: colW - 0.2, h: 0.6, fontFace: BODY_FONT, fontSize: 10, italic: true, color: THEME.muted, align: "center", margin: 0, lineSpacingMultiple: 1.2 });
    });
  });

  const outPath = `${__dirname}/Icon-Library-${isDark ? "Dark" : "Light"}.pptx`;
  return pres.writeFile({ fileName: outPath }).then(() => {
    console.log("wrote", outPath, "slides:", n);
  });
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
