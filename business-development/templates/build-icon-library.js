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

// Fast path for a one-preset-shape icon — most of the expanded catalog below
// uses this instead of a bespoke composition.
function simple(shapeType, o = {}) {
  const wR = o.w ?? 1.7;
  const hR = o.h ?? 1.7;
  const rotate = o.rotate ?? 0;
  const filled = !!o.filled;
  return (slide, cx, cy, r, color) => {
    slide.addShape(shapeType, {
      x: cx - (r * wR) / 2,
      y: cy - (r * hR) / 2,
      w: r * wR,
      h: r * hR,
      rotate,
      fill: filled ? { color } : { type: "none" },
      line: filled ? { type: "none" } : { color, width: 1.6 },
      ...(o.extra || {}),
    });
  };
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

  // --- Universal / generic composites ---
  home: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.65, y: cy - r * 0.1, w: r * 1.3, h: r * 0.95,
      fill: { type: "none" }, line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.triangle, {
      x: cx - r * 0.85, y: cy - r * 0.95, w: r * 1.7, h: r * 0.75,
      fill: { type: "none" }, line: { color, width: 1.75 },
    });
  },
  clock: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx, cy, r * 0.85, color, 1.6);
    addLine(slide, cx, cy, cx, cy - r * 0.5, color, 1.4);
    addLine(slide, cx, cy, cx + r * 0.4, cy + r * 0.1, color, 1.4);
  },
  lock: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.65, y: cy - r * 0.1, w: r * 1.3, h: r * 0.95, rectRadius: 0.1,
      fill: { type: "none" }, line: { color, width: 1.75 },
    });
    slide.addShape(ShapeType.arc, {
      x: cx - r * 0.42, y: cy - r * 0.95, w: r * 0.84, h: r * 0.85,
      angleRange: [180, 360], fill: { type: "none" }, line: { color, width: 1.6 },
    });
    circleFill(slide, cx, cy + r * 0.35, r * 0.1, color);
  },
  document: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.6, y: cy - r * 0.9, w: r * 1.2, h: r * 1.8, rectRadius: 0.06,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    [-0.35, 0, 0.35].forEach((off) => addLine(slide, cx - r * 0.35, cy + r * off, cx + r * 0.35, cy + r * off, color, 1.1));
  },
  checklist: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.7, y: cy - r * 0.9, w: r * 1.4, h: r * 1.8, rectRadius: 0.06,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    [-0.4, 0.05, 0.5].forEach((off) => {
      addLine(slide, cx - r * 0.4, cy + r * off, cx - r * 0.22, cy + r * off + r * 0.14, color, 1.2);
      addLine(slide, cx - r * 0.22, cy + r * off + r * 0.14, cx + r * 0.05, cy + r * off - r * 0.2, color, 1.2);
    });
  },
  checkmarkTick: (slide, cx, cy, r, color) => {
    addLine(slide, cx - r * 0.55, cy, cx - r * 0.1, cy + r * 0.5, color, 2);
    addLine(slide, cx - r * 0.1, cy + r * 0.5, cx + r * 0.6, cy - r * 0.55, color, 2);
  },
  cancelX: (slide, cx, cy, r, color) => {
    addLine(slide, cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55, color, 2);
    addLine(slide, cx - r * 0.55, cy + r * 0.55, cx + r * 0.55, cy - r * 0.55, color, 2);
  },
  gridApps: (slide, cx, cy, r, color) => {
    [-0.4, 0.15].forEach((xo) =>
      [-0.4, 0.15].forEach((yo) => {
        slide.addShape(ShapeType.rect, { x: cx + r * xo, y: cy + r * yo, w: r * 0.5, h: r * 0.5, fill: { color }, line: { type: "none" } });
      })
    );
  },
  cameraIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.85, y: cy - r * 0.5, w: r * 1.7, h: r * 1.0, rectRadius: 0.08,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    circleOutline(slide, cx, cy, r * 0.35, color, 1.4);
    slide.addShape(ShapeType.rect, { x: cx + r * 0.15, y: cy - r * 0.72, w: r * 0.4, h: r * 0.22, fill: { type: "none" }, line: { color, width: 1.4 } });
  },
  keyIcon: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx - r * 0.45, cy, r * 0.38, color, 1.6);
    addLine(slide, cx - r * 0.1, cy, cx + r * 0.75, cy, color, 1.6);
    addLine(slide, cx + r * 0.5, cy, cx + r * 0.5, cy + r * 0.25, color, 1.4);
    addLine(slide, cx + r * 0.72, cy, cx + r * 0.72, cy + r * 0.25, color, 1.4);
  },
  searchIcon: (slide, cx, cy, r, color) => {
    circleOutline(slide, cx - r * 0.15, cy - r * 0.15, r * 0.55, color, 1.7);
    addLine(slide, cx + r * 0.22, cy + r * 0.22, cx + r * 0.65, cy + r * 0.65, color, 2);
  },
  peopleIcon: (slide, cx, cy, r, color) => {
    [-0.32, 0.32].forEach((xo) => {
      circleOutline(slide, cx + r * xo, cy - r * 0.35, r * 0.28, color, 1.5);
      slide.addShape(ShapeType.arc, {
        x: cx + r * xo - r * 0.4, y: cy - r * 0.05, w: r * 0.8, h: r * 0.75,
        angleRange: [180, 360], fill: { type: "none" }, line: { color, width: 1.4 },
      });
    });
  },
  wrenchIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.55, y: cy - r * 0.14, w: r * 1.1, h: r * 0.28, rotate: 45,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    circleOutline(slide, cx - r * 0.55, cy - r * 0.55, r * 0.22, color, 1.4);
    circleOutline(slide, cx + r * 0.55, cy + r * 0.55, r * 0.22, color, 1.4);
  },
  giftIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.75, y: cy - r * 0.15, w: r * 1.5, h: r * 1.0, rectRadius: 0.05,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    addLine(slide, cx, cy - r * 0.15, cx, cy + r * 0.85, color, 1.4);
    addLine(slide, cx - r * 0.75, cy - r * 0.15, cx + r * 0.75, cy - r * 0.15, color, 1.4);
  },
  trashIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.trapezoid, {
      x: cx - r * 0.55, y: cy - r * 0.15, w: r * 1.1, h: r * 1.0, flipV: true,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    slide.addShape(ShapeType.rect, { x: cx - r * 0.7, y: cy - r * 0.3, w: r * 1.4, h: r * 0.16, fill: { color }, line: { type: "none" } });
  },
  phoneIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.4, y: cy - r * 0.95, w: r * 0.8, h: r * 1.9, rectRadius: 0.2,
      fill: { type: "none" }, line: { color, width: 1.7 },
    });
    circleFill(slide, cx, cy + r * 0.65, r * 0.09, color);
  },
  mailIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.rect, {
      x: cx - r * 0.85, y: cy - r * 0.55, w: r * 1.7, h: r * 1.1,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    addLine(slide, cx - r * 0.85, cy - r * 0.55, cx, cy + r * 0.1, color, 1.4);
    addLine(slide, cx + r * 0.85, cy - r * 0.55, cx, cy + r * 0.1, color, 1.4);
  },
  calendarIcon: (slide, cx, cy, r, color) => {
    slide.addShape(ShapeType.roundRect, {
      x: cx - r * 0.8, y: cy - r * 0.7, w: r * 1.6, h: r * 1.5, rectRadius: 0.06,
      fill: { type: "none" }, line: { color, width: 1.6 },
    });
    addLine(slide, cx - r * 0.8, cy - r * 0.25, cx + r * 0.8, cy - r * 0.25, color, 1.4);
    [-0.35, 0.35].forEach((xo) => slide.addShape(ShapeType.rect, { x: cx + r * xo - r * 0.05, y: cy - r * 0.9, w: r * 0.1, h: r * 0.3, fill: { color }, line: { type: "none" } }));
  },
  listIcon: (slide, cx, cy, r, color) => {
    [-0.5, 0, 0.5].forEach((off) => {
      circleFill(slide, cx - r * 0.75, cy + r * off, r * 0.06, color);
      addLine(slide, cx - r * 0.55, cy + r * off, cx + r * 0.75, cy + r * off, color, 1.3);
    });
  },

  // --- Generic single-preset icons (reused across topics with different captions) ---
  starRating: simple(ShapeType.star5, { w: 1.7, h: 1.7 }),
  folderGeneric: simple(ShapeType.folderCorner, { w: 1.8, h: 1.5 }),
  pinLocation: simple(ShapeType.teardrop, { w: 1.1, h: 1.6, rotate: 180 }),
  filterFunnel: simple(ShapeType.funnel, { w: 1.4, h: 1.7 }),
  priorityStop: simple(ShapeType.octagon, { w: 1.6, h: 1.6 }),
  awardRibbon: simple(ShapeType.ribbon2, { w: 1.9, h: 1.3 }),
  messageBubble: simple(ShapeType.wedgeRoundRectCallout, { w: 1.8, h: 1.3 }),
  exchangeArrows: simple(ShapeType.leftRightCircularArrow, { w: 1.8, h: 1.5 }),
  nightSupport: simple(ShapeType.moon, { w: 1.5, h: 1.5 }),
  ideaSpark: simple(ShapeType.sun, { w: 1.6, h: 1.6 }),
  approvalDonut: simple(ShapeType.donut, { w: 1.6, h: 1.6 }),
  focusDiamond: simple(ShapeType.diamond, { w: 1.6, h: 1.6 }),
  directionChevron: simple(ShapeType.chevron, { w: 1.8, h: 1.2 }),
  alertBolt: simple(ShapeType.lightningBolt, { w: 1.1, h: 1.9, filled: true }),
  calmWave: simple(ShapeType.wave, { w: 2.0, h: 1.0 }),
  signalWave: simple(ShapeType.arc, { w: 1.7, h: 1.7, extra: { angleRange: [200, 340] } }),
  addPlus: simple(ShapeType.mathPlus, { w: 1.3, h: 1.3, filled: true }),
  removeMinus: simple(ShapeType.mathMinus, { w: 1.3, h: 1.3, filled: true }),
  uploadArrow: simple(ShapeType.upArrow, { w: 1.1, h: 1.7, filled: true }),
  downloadArrow: simple(ShapeType.downArrow, { w: 1.1, h: 1.7, filled: true }),
  noteTab: simple(ShapeType.cornerTabs, { w: 1.7, h: 1.7 }),
  groupBracket: simple(ShapeType.bracePair, { w: 1.0, h: 1.8 }),
  sealBadge: simple(ShapeType.irregularSeal1, { w: 1.7, h: 1.7 }),
  scrollDocument: simple(ShapeType.verticalScroll, { w: 1.2, h: 1.8 }),
  cylinderStorage: simple(ShapeType.can, { w: 1.4, h: 1.8 }),
  cubeBlock: simple(ShapeType.cube, { w: 1.7, h: 1.7 }),
  teardropDrop: simple(ShapeType.teardrop, { w: 1.1, h: 1.5 }),
  pieChartAlt: simple(ShapeType.pie, { w: 1.7, h: 1.7, extra: { angleRange: [270, 90] } }),
  donutRingAlt: simple(ShapeType.donut, { w: 1.4, h: 1.4 }),
  heartFavorite: simple(ShapeType.heart, { w: 1.6, h: 1.5 }),
  cloudSync: simple(ShapeType.cloud, { w: 1.8, h: 1.2 }),
  hexNode: simple(ShapeType.hexagon, { w: 1.7, h: 1.6 }),
  bevelCard: simple(ShapeType.bevel, { w: 1.8, h: 1.3 }),
  frameMedia: simple(ShapeType.frame, { w: 1.6, h: 1.6 }),
  plaqueBadge: simple(ShapeType.plaque, { w: 1.8, h: 1.2 }),
  squareTabsOrganize: simple(ShapeType.squareTabs, { w: 1.7, h: 1.7 }),

  // --- Second expansion: genuinely distinct presets, no two icons the same shape ---
  homeBaseAction: simple(ShapeType.actionButtonHome, { w: 1.7, h: 1.7 }),
  infoAction: simple(ShapeType.actionButtonInformation, { w: 1.7, h: 1.7 }),
  helpAction: simple(ShapeType.actionButtonHelp, { w: 1.7, h: 1.7 }),
  audioAction: simple(ShapeType.actionButtonSound, { w: 1.7, h: 1.7 }),
  videoAction: simple(ShapeType.actionButtonMovie, { w: 1.7, h: 1.7 }),
  documentAction: simple(ShapeType.actionButtonDocument, { w: 1.7, h: 1.7 }),
  returnAction: simple(ShapeType.actionButtonReturn, { w: 1.7, h: 1.7 }),
  startPoint: simple(ShapeType.actionButtonBeginning, { w: 1.7, h: 1.7 }),
  endPoint: simple(ShapeType.actionButtonEnd, { w: 1.7, h: 1.7 }),
  nextStep: simple(ShapeType.actionButtonForwardNext, { w: 1.7, h: 1.7 }),
  previousStep: simple(ShapeType.actionButtonBackPrevious, { w: 1.7, h: 1.7 }),
  redirectBent: simple(ShapeType.bentArrow, { w: 1.8, h: 1.6 }),
  escalationArrow: simple(ShapeType.bentUpArrow, { w: 1.6, h: 1.8 }),
  partialCycle: simple(ShapeType.blockArc, { w: 1.8, h: 1.8 }),
  scopeBracket: simple(ShapeType.bracketPair, { w: 1.0, h: 1.8 }),
  calloutNote: simple(ShapeType.callout2, { w: 1.9, h: 1.4 }),
  addMetric: simple(ShapeType.chartPlus, { w: 1.7, h: 1.7 }),
  featuredMetric: simple(ShapeType.chartStar, { w: 1.7, h: 1.7 }),
  metricAlert: simple(ShapeType.chartX, { w: 1.7, h: 1.7 }),
  segmentShare: simple(ShapeType.chord, { w: 1.6, h: 1.6 }),
  cornerElement: simple(ShapeType.corner, { w: 1.6, h: 1.6 }),
  declineArrow: simple(ShapeType.curvedDownArrow, { w: 1.7, h: 1.5 }),
  redirectLeft: simple(ShapeType.curvedLeftArrow, { w: 1.6, h: 1.6 }),
  redirectRight: simple(ShapeType.curvedRightArrow, { w: 1.6, h: 1.6 }),
  upticknArrow: simple(ShapeType.curvedUpArrow, { w: 1.7, h: 1.5 }),
  multiPointNode: simple(ShapeType.decagon, { w: 1.7, h: 1.7 }),
  diagonalMarker: simple(ShapeType.diagStripe, { w: 1.6, h: 1.2 }),
  dualSignal: simple(ShapeType.doubleWave, { w: 2.0, h: 1.0 }),
  decreaseAlert: simple(ShapeType.downArrowCallout, { w: 1.6, h: 1.7 }),
  curvedBanner: simple(ShapeType.ellipseRibbon, { w: 2.0, h: 1.0 }),
  bannerAccent: simple(ShapeType.ellipseRibbon2, { w: 2.0, h: 1.0 }),
  alternateProcess: simple(ShapeType.flowChartAlternateProcess, { w: 1.8, h: 1.3 }),
  collationStep: simple(ShapeType.flowChartCollate, { w: 1.4, h: 1.7 }),
  connectorPoint: simple(ShapeType.flowChartConnector, { w: 1.5, h: 1.5 }),
  decisionPoint: simple(ShapeType.flowChartDecision, { w: 1.8, h: 1.4 }),
  delayWait: simple(ShapeType.flowChartDelay, { w: 1.6, h: 1.4 }),
  displayOutput: simple(ShapeType.flowChartDisplay, { w: 1.7, h: 1.3 }),
  processDocument: simple(ShapeType.flowChartDocument, { w: 1.7, h: 1.3 }),
  extractStep: simple(ShapeType.flowChartExtract, { w: 1.5, h: 1.4 }),
  inputOutput: simple(ShapeType.flowChartInputOutput, { w: 1.8, h: 1.3 }),
  internalStorage: simple(ShapeType.flowChartInternalStorage, { w: 1.6, h: 1.4 }),
  diskStorage: simple(ShapeType.flowChartMagneticDisk, { w: 1.5, h: 1.4 }),
  drumStorage: simple(ShapeType.flowChartMagneticDrum, { w: 1.4, h: 1.6 }),
  tapeArchive: simple(ShapeType.flowChartMagneticTape, { w: 1.6, h: 1.4 }),
  manualInput: simple(ShapeType.flowChartManualInput, { w: 1.7, h: 1.3 }),
  manualOperation: simple(ShapeType.flowChartManualOperation, { w: 1.6, h: 1.4 }),
  mergeStep: simple(ShapeType.flowChartMerge, { w: 1.5, h: 1.4 }),
  multiDocument: simple(ShapeType.flowChartMultidocument, { w: 1.8, h: 1.4 }),
  offlineStorage: simple(ShapeType.flowChartOfflineStorage, { w: 1.5, h: 1.5 }),
  offPageRef: simple(ShapeType.flowChartOffpageConnector, { w: 1.5, h: 1.6 }),
  onlineStorage: simple(ShapeType.flowChartOnlineStorage, { w: 1.5, h: 1.4 }),
  orBranch: simple(ShapeType.flowChartOr, { w: 1.5, h: 1.5 }),
  predefinedProcess: simple(ShapeType.flowChartPredefinedProcess, { w: 1.8, h: 1.3 }),
  preparationStep: simple(ShapeType.flowChartPreparation, { w: 1.8, h: 1.3 }),
  processStep: simple(ShapeType.flowChartProcess, { w: 1.8, h: 1.3 }),
  legacyRecord: simple(ShapeType.flowChartPunchedCard, { w: 1.7, h: 1.3 }),
  legacyArchive: simple(ShapeType.flowChartPunchedTape, { w: 1.7, h: 1.2 }),
  sortStep: simple(ShapeType.flowChartSort, { w: 1.6, h: 1.6 }),
  aggregationPoint: simple(ShapeType.flowChartSummingJunction, { w: 1.5, h: 1.5 }),
  terminator: simple(ShapeType.flowChartTerminator, { w: 1.8, h: 1.1 }),
  partialFrame: simple(ShapeType.halfFrame, { w: 1.6, h: 1.6 }),
  sevenPointNode: simple(ShapeType.heptagon, { w: 1.7, h: 1.7 }),
  directionalMarker: simple(ShapeType.homePlate, { w: 1.8, h: 1.2 }),
  scrollRecord: simple(ShapeType.horizontalScroll, { w: 1.9, h: 1.0 }),
  backDirection: simple(ShapeType.leftArrow, { w: 1.7, h: 1.2, filled: true }),
  backAlert: simple(ShapeType.leftArrowCallout, { w: 1.7, h: 1.3 }),
  openingScope: simple(ShapeType.leftBrace, { w: 0.7, h: 1.8 }),
  rangeStart: simple(ShapeType.leftBracket, { w: 0.6, h: 1.8 }),
  reverseCycle: simple(ShapeType.leftCircularArrow, { w: 1.7, h: 1.7 }),
  bidirectional: simple(ShapeType.leftRightArrow, { w: 1.9, h: 1.1, filled: true }),
  twoWayAlert: simple(ShapeType.leftRightArrowCallout, { w: 1.9, h: 1.3 }),
  dualBanner: simple(ShapeType.leftRightRibbon, { w: 2.0, h: 1.0 }),
  multiDirection: simple(ShapeType.leftRightUpArrow, { w: 1.7, h: 1.7 }),
  upperLeftDirection: simple(ShapeType.leftUpArrow, { w: 1.7, h: 1.7 }),
  dividerLine: simple(ShapeType.lineInv, { w: 1.9, h: 0.05 }),
  divisionRatio: simple(ShapeType.mathDivide, { w: 1.3, h: 1.3, filled: true }),
  parityBalance: simple(ShapeType.mathEqual, { w: 1.3, h: 1.3, filled: true }),
  multiplierIcon: simple(ShapeType.mathMultiply, { w: 1.3, h: 1.3, filled: true }),
  varianceIcon: simple(ShapeType.mathNotEqual, { w: 1.3, h: 1.3, filled: true }),
  restrictedIcon: simple(ShapeType.noSmoking, { w: 1.7, h: 1.7 }),
  asymmetricPanel: simple(ShapeType.nonIsoscelesTrapezoid, { w: 1.8, h: 1.2 }),
  fastForward: simple(ShapeType.notchedRightArrow, { w: 1.8, h: 1.2, filled: true }),
  skewedPanel: simple(ShapeType.parallelogram, { w: 1.8, h: 1.2 }),
  segmentWedge: simple(ShapeType.pieWedge, { w: 1.3, h: 1.7 }),
  tabbedRecord: simple(ShapeType.plaqueTabs, { w: 1.8, h: 1.3 }),
  fourWayFlow: simple(ShapeType.quadArrow, { w: 1.8, h: 1.8 }),
  fourWayAlert: simple(ShapeType.quadArrowCallout, { w: 1.8, h: 1.8 }),
  bannerRibbon: simple(ShapeType.ribbon, { w: 2.0, h: 1.0 }),
  forwardDirection: simple(ShapeType.rightArrow, { w: 1.7, h: 1.2, filled: true }),
  forwardAlert: simple(ShapeType.rightArrowCallout, { w: 1.7, h: 1.3 }),
  closingScope: simple(ShapeType.rightBrace, { w: 0.7, h: 1.8 }),
  rangeEnd: simple(ShapeType.rightBracket, { w: 0.6, h: 1.8 }),
  roundedPanelA: simple(ShapeType.round1Rect, { w: 1.8, h: 1.3 }),
  snippedPanel: simple(ShapeType.snip2SameRect, { w: 1.8, h: 1.3 }),
  rightTriangleNode: simple(ShapeType.rtTriangle, { w: 1.6, h: 1.6 }),
  satisfactionIcon: simple(ShapeType.smileyFace, { w: 1.7, h: 1.7 }),
  sparkleStar: simple(ShapeType.star4, { w: 1.6, h: 1.6, filled: true }),
  sixPointStar: simple(ShapeType.star6, { w: 1.6, h: 1.6 }),
  eightPointStar: simple(ShapeType.star8, { w: 1.6, h: 1.6 }),
  twelvePointStar: simple(ShapeType.star12, { w: 1.6, h: 1.6 }),
  accelerateArrow: simple(ShapeType.stripedRightArrow, { w: 1.8, h: 1.2 }),
  momentumArrow: simple(ShapeType.swooshArrow, { w: 1.7, h: 1.7, filled: true }),
  verticalRange: simple(ShapeType.upDownArrow, { w: 1.1, h: 1.8, filled: true }),
  verticalAlert: simple(ShapeType.upDownArrowCallout, { w: 1.3, h: 1.8 }),
  reversalArrow: simple(ShapeType.uturnArrow, { w: 1.6, h: 1.7 }),
  roundedCallout: simple(ShapeType.wedgeEllipseCallout, { w: 1.9, h: 1.4 }),
  squareCallout: simple(ShapeType.wedgeRectCallout, { w: 1.9, h: 1.4 }),
  annotatedNote: simple(ShapeType.borderCallout1, { w: 1.8, h: 1.4 }),
};

const INDUSTRY_LIBRARY = [
  {
    name: "Universal / General Business",
    icons: [
      { key: "home", name: "Home", words: "Navigation · Home · Start" },
      { key: "clock", name: "Time", words: "Time Management · Schedule · Deadline" },
      { key: "lock", name: "Security", words: "Access Control · Privacy · Protection" },
      { key: "document", name: "Document", words: "Files · Documents · Records" },
      { key: "checklist", name: "Checklist", words: "Tasks · To-Do · Checklist" },
      { key: "checkmarkTick", name: "Approved", words: "Approval · Complete · Verified" },
      { key: "cancelX", name: "Cancel", words: "Cancel · Reject · Remove" },
      { key: "gridApps", name: "Applications", words: "Apps · Modules · Tools" },
      { key: "cameraIcon", name: "Media", words: "Photo · Media · Capture" },
      { key: "keyIcon", name: "Access", words: "Access · Login · Credentials" },
      { key: "searchIcon", name: "Search", words: "Search · Find · Discover" },
      { key: "messageBubble", name: "Message", words: "Communication · Chat · Message" },
      { key: "peopleIcon", name: "People", words: "Team · Contacts · People" },
      { key: "wrenchIcon", name: "Support", words: "Support · Maintenance · Tools" },
      { key: "giftIcon", name: "Rewards", words: "Rewards · Incentives · Recognition" },
      { key: "trashIcon", name: "Delete", words: "Delete · Archive · Remove" },
      { key: "phoneIcon", name: "Contact", words: "Phone · Contact · Call" },
      { key: "starRating", name: "Rating", words: "Rating · Quality · Favorite" },
      { key: "folderGeneric", name: "Organize", words: "Files · Folders · Organization" },
      { key: "mailIcon", name: "Email", words: "Email · Correspondence · Inbox" },
      { key: "calendarIcon", name: "Schedule", words: "Calendar · Planning · Schedule" },
      { key: "listIcon", name: "List View", words: "List · Agenda · Items" },
      { key: "pinLocation", name: "Location", words: "Location · Site · Address" },
      { key: "filterFunnel", name: "Filter", words: "Filter · Sort · Refine" },
      { key: "helpAction", name: "Help", words: "Help Center · FAQ · Support" },
      { key: "infoAction", name: "Information", words: "Information · Details · About" },
      { key: "audioAction", name: "Audio", words: "Audio · Sound · Voice" },
      { key: "videoAction", name: "Video", words: "Video · Media Playback" },
      { key: "returnAction", name: "Undo", words: "Undo · Return · Revert" },
      { key: "nextStep", name: "Next", words: "Next · Forward · Continue" },
      { key: "previousStep", name: "Previous", words: "Previous · Back · Prior" },
      { key: "bidirectional", name: "Exchange", words: "Two-Way · Exchange · Sync" },
      { key: "verticalRange", name: "Range", words: "Range · Scale · Span" },
      { key: "decisionPoint", name: "Decision", words: "Decision · Choice · Branch" },
      { key: "satisfactionIcon", name: "Feedback", words: "Feedback · Satisfaction · Survey" },
      { key: "sparkleStar", name: "Highlight", words: "Highlight · New · Featured" },
      { key: "annotatedNote", name: "Note", words: "Note · Annotation · Comment" },
      { key: "restrictedIcon", name: "Restricted", words: "Restricted · Prohibited · Blocked" },
    ],
  },
  {
    name: "Financial Services",
    icons: [
      { key: "growth", name: "Growth", words: "Finance · Growth · Investment · Analytics" },
      { key: "security", name: "Security", words: "Banking · Security · Trust · Compliance" },
      { key: "capital", name: "Capital", words: "Capital · Funding · Currency · Wealth" },
      { key: "institution", name: "Institution", words: "Banking · Institution · Financial Services" },
      { key: "exchangeArrows", name: "Transactions", words: "Payments · Transactions · Exchange" },
      { key: "priorityStop", name: "Risk", words: "Risk Management · Compliance · Controls" },
      { key: "awardRibbon", name: "Rating", words: "Credit Rating · Certification · Standing" },
      { key: "document", name: "Statements", words: "Account Statements · Reports · Records" },
      { key: "checklist", name: "Audit", words: "Audit · Compliance Checklist · Controls" },
      { key: "keyIcon", name: "Access Control", words: "Access Control · Authorization · Security" },
      { key: "dashboard", name: "Portfolio Dashboard", words: "Portfolio · KPI · Performance" },
      { key: "pieChartAlt", name: "Allocation", words: "Asset Allocation · Portfolio Mix" },
      { key: "sealBadge", name: "Certified", words: "Certified · Accredited · Compliant" },
      { key: "cylinderStorage", name: "Reserves", words: "Reserves · Capital Pool · Treasury" },
      { key: "calendarIcon", name: "Maturity", words: "Maturity Date · Term · Schedule" },
      { key: "phoneIcon", name: "Advisory Line", words: "Client Service · Advisory Line" },
      { key: "peopleIcon", name: "Clients", words: "Clients · Relationship Management" },
      { key: "mailIcon", name: "Statements Delivery", words: "Statements · Correspondence" },
      { key: "lock", name: "Data Security", words: "Data Security · Privacy · Encryption" },
      { key: "starRating", name: "Credit Score", words: "Credit Score · Rating · Standing" },
      { key: "divisionRatio", name: "Ratios", words: "Financial Ratios · Metrics" },
      { key: "parityBalance", name: "Balance Sheet", words: "Balance Sheet · Equilibrium" },
      { key: "multiplierIcon", name: "Leverage", words: "Leverage · Multiplier · Growth Factor" },
      { key: "decisionPoint", name: "Underwriting", words: "Underwriting Decision · Approval" },
      { key: "terminator", name: "Account Close", words: "Account Closure · Settlement" },
      { key: "processStep", name: "Transaction Processing", words: "Transaction Processing · Workflow" },
      { key: "internalStorage", name: "Ledger", words: "Ledger · Internal Records" },
      { key: "verticalRange", name: "Rate Range", words: "Interest Rate Range · Spread" },
      { key: "fastForward", name: "Fast Payments", words: "Instant Payments · Fast Settlement" },
      { key: "bannerRibbon", name: "Premium Tier", words: "Premium Tier · Preferred Status" },
      { key: "rightTriangleNode", name: "Yield Curve", words: "Yield Curve · Rate Trend" },
      { key: "multiDocument", name: "Filings", words: "Regulatory Filings · Multi-Document" },
      { key: "offlineStorage", name: "Cold Storage Assets", words: "Cold Storage · Reserve Assets" },
      { key: "onlineStorage", name: "Digital Banking", words: "Digital Banking · Online Access" },
      { key: "forwardDirection", name: "Growth Trajectory", words: "Growth Trajectory · Forecast" },
      { key: "twelvePointStar", name: "Premier Client", words: "Premier Client · VIP Status" },
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
      { key: "checklist", name: "Clinical Protocol", words: "Clinical Trial · Protocol · Checklist" },
      { key: "document", name: "Regulatory Filing", words: "Regulatory · Submission · Documentation" },
      { key: "lock", name: "Patient Privacy", words: "Patient Data · Privacy · HIPAA" },
      { key: "calendarIcon", name: "Trial Timeline", words: "Clinical Timeline · Milestones" },
      { key: "dashboard", name: "Trial Dashboard", words: "Trial Monitoring · Dashboard · KPIs" },
      { key: "peopleIcon", name: "Patients", words: "Patients · Care Teams · Cohort" },
      { key: "sealBadge", name: "Approval", words: "FDA Approval · Certification · Compliance" },
      { key: "cylinderStorage", name: "Biobank", words: "Biobank · Sample Storage · Cold Chain" },
      { key: "teardropDrop", name: "Formulation", words: "Formulation · Liquid · Dosage" },
      { key: "heartFavorite", name: "Wellbeing", words: "Patient Wellbeing · Outcomes" },
      { key: "pinLocation", name: "Site", words: "Clinical Site · Facility Location" },
      { key: "starRating", name: "Quality", words: "Quality · Grade · Standard" },
      { key: "scrollDocument", name: "Case History", words: "Case History · Patient Record" },
      { key: "phoneIcon", name: "Patient Support", words: "Patient Support Line · Contact" },
      { key: "decisionPoint", name: "Go/No-Go", words: "Go/No-Go Decision · Trial Gate" },
      { key: "processStep", name: "Protocol Step", words: "Protocol Step · Trial Process" },
      { key: "terminator", name: "Trial Endpoint", words: "Trial Endpoint · Study Completion" },
      { key: "multiDocument", name: "Regulatory Dossier", words: "Regulatory Dossier · Submission Package" },
      { key: "internalStorage", name: "Sample Repository", words: "Sample Repository · Specimen Storage" },
      { key: "manualInput", name: "Data Capture", words: "Manual Data Capture · CRF" },
      { key: "satisfactionIcon", name: "Patient Outcome", words: "Patient-Reported Outcome · PRO" },
      { key: "restrictedIcon", name: "Contraindication", words: "Contraindication · Restricted Use" },
      { key: "sortStep", name: "Cohort Stratification", words: "Cohort Stratification · Patient Sorting" },
      { key: "aggregationPoint", name: "Data Pooling", words: "Data Pooling · Meta-Analysis" },
      { key: "multiplierIcon", name: "Scale-Up", words: "Manufacturing Scale-Up · Titer" },
      { key: "offPageRef", name: "Referral", words: "Patient Referral · Site Transfer" },
      { key: "bannerRibbon", name: "Breakthrough Designation", words: "Breakthrough Designation · Priority Review" },
      { key: "rightTriangleNode", name: "Dose Escalation", words: "Dose Escalation · Titration" },
      { key: "forwardDirection", name: "Pipeline Progression", words: "Pipeline Progression · Phase Advance" },
      { key: "sparkleStar", name: "Novel Therapy", words: "Novel Therapy · Innovation" },
    ],
  },
  {
    name: "Manufacturing & Industrial",
    icons: [
      { key: "operations", name: "Operations", words: "Manufacturing · Operations · Machinery" },
      { key: "facility", name: "Facility", words: "Plant · Facility · Production" },
      { key: "logistics", name: "Logistics", words: "Logistics · Supply Chain · Distribution" },
      { key: "packaging", name: "Packaging", words: "Packaging · Inventory · Product" },
      { key: "checklist", name: "Quality Control", words: "Quality Control · Inspection · Checklist" },
      { key: "wrenchIcon", name: "Maintenance", words: "Maintenance · Repair · Service" },
      { key: "gridApps", name: "Production Line", words: "Production Line · Work Cells" },
      { key: "cylinderStorage", name: "Materials", words: "Raw Materials · Storage · Silo" },
      { key: "calendarIcon", name: "Production Schedule", words: "Production Schedule · Planning" },
      { key: "dashboard", name: "Plant Dashboard", words: "Plant Performance · OEE Dashboard" },
      { key: "priorityStop", name: "Safety", words: "Safety · Hazard · Compliance" },
      { key: "sealBadge", name: "Certification", words: "ISO Certification · Standards" },
      { key: "keyIcon", name: "Access Control", words: "Facility Access · Security" },
      { key: "peopleIcon", name: "Workforce", words: "Workforce · Labor · Shift Teams" },
      { key: "directionChevron", name: "Workflow", words: "Process Flow · Sequence · Workflow" },
      { key: "scrollDocument", name: "Work Order", words: "Work Order · Traveler · Routing" },
      { key: "cubeBlock", name: "Inventory", words: "Inventory · SKU · Stock" },
      { key: "trashIcon", name: "Waste Reduction", words: "Waste Reduction · Scrap · Lean" },
      { key: "decisionPoint", name: "Go/No-Go Inspection", words: "Quality Gate · Go/No-Go" },
      { key: "processStep", name: "Process Step", words: "Manufacturing Process Step" },
      { key: "terminator", name: "Line Boundary", words: "Line Start/Stop · Shift Boundary" },
      { key: "manualOperation", name: "Manual Assembly", words: "Manual Assembly · Hand Operation" },
      { key: "delayWait", name: "Changeover Delay", words: "Changeover Delay · Downtime" },
      { key: "mergeStep", name: "Line Merge", words: "Line Merge · Assembly Convergence" },
      { key: "sortStep", name: "Sorting Station", words: "Sorting Station · Grading" },
      { key: "internalStorage", name: "WIP Storage", words: "Work-in-Process Storage" },
      { key: "onlineStorage", name: "MES Data", words: "MES Data · Real-Time Records" },
      { key: "multiDocument", name: "Traveler Packet", words: "Traveler Packet · Routing Documents" },
      { key: "forwardDirection", name: "Throughput", words: "Throughput · Line Speed" },
      { key: "fastForward", name: "Cycle Time Reduction", words: "Cycle Time Reduction · Speed-Up" },
      { key: "fourWayFlow", name: "Cross-Docking", words: "Cross-Docking · Multi-Directional Flow" },
      { key: "restrictedIcon", name: "Hazard Zone", words: "Hazard Zone · Restricted Access" },
      { key: "rightTriangleNode", name: "Ramp-Up", words: "Production Ramp-Up" },
      { key: "aggregationPoint", name: "Consolidation Point", words: "Consolidation Point · Batch Aggregation" },
    ],
  },
  {
    name: "Technology & Telecom",
    icons: [
      { key: "cloud", name: "Cloud", words: "Cloud · Infrastructure · SaaS" },
      { key: "connectivity", name: "Connectivity", words: "Connectivity · Network · Telecom" },
      { key: "data", name: "Data", words: "Data · IT · Digital" },
      { key: "innovation", name: "Innovation", words: "Innovation · Technology · R&D" },
      { key: "signalWave", name: "Signal", words: "Signal · Wireless · Telecom" },
      { key: "gridApps", name: "Applications", words: "Software · Applications · Platforms" },
      { key: "lock", name: "Cybersecurity", words: "Cybersecurity · Data Protection" },
      { key: "keyIcon", name: "Authentication", words: "Authentication · Access Management" },
      { key: "cylinderStorage", name: "Servers", words: "Servers · Data Center · Storage" },
      { key: "dashboard", name: "IT Dashboard", words: "IT Monitoring · Dashboard · Uptime" },
      { key: "exchangeArrows", name: "Integration", words: "API Integration · Data Exchange" },
      { key: "hexNode", name: "Network Node", words: "Network Node · Infrastructure" },
      { key: "cameraIcon", name: "Digital Media", words: "Digital Media · Streaming · Content" },
      { key: "phoneIcon", name: "Mobile", words: "Mobile · Devices · Telecom" },
      { key: "checklist", name: "DevOps", words: "DevOps · Release Checklist · CI/CD" },
      { key: "peopleIcon", name: "IT Support", words: "IT Support · Help Desk" },
      { key: "messageBubble", name: "Collaboration", words: "Collaboration · Messaging · Chat" },
      { key: "calmWave", name: "Bandwidth", words: "Bandwidth · Throughput · Capacity" },
      { key: "decisionPoint", name: "Routing Decision", words: "Routing Decision · Load Balancing" },
      { key: "processStep", name: "Pipeline Step", words: "Pipeline Step · Build Process" },
      { key: "terminator", name: "Session Boundary", words: "Session Start/End" },
      { key: "internalStorage", name: "Cache", words: "Cache · In-Memory Storage" },
      { key: "onlineStorage", name: "Cloud Storage", words: "Cloud Storage · Object Store" },
      { key: "offlineStorage", name: "Cold Backup", words: "Cold Backup · Archive Storage" },
      { key: "multiDocument", name: "API Docs", words: "API Documentation · Specs" },
      { key: "manualInput", name: "Configuration Input", words: "Manual Configuration · Setup" },
      { key: "fourWayFlow", name: "Mesh Network", words: "Mesh Network · Multi-Path Routing" },
      { key: "bidirectional", name: "Duplex Link", words: "Full-Duplex Link · Two-Way Data" },
      { key: "reverseCycle", name: "Rollback", words: "Rollback · Version Revert" },
      { key: "forwardDirection", name: "Deployment", words: "Deployment · Release Forward" },
      { key: "restrictedIcon", name: "Access Denied", words: "Access Denied · Firewall Block" },
      { key: "sparkleStar", name: "New Release", words: "New Release · Feature Launch" },
      { key: "fastForward", name: "Low Latency", words: "Low Latency · High Speed" },
      { key: "multiplierIcon", name: "Scalability", words: "Scalability · Elastic Compute" },
    ],
  },
  {
    name: "Energy & Utilities",
    icons: [
      { key: "renewable", name: "Renewable", words: "Renewable · Solar · Energy" },
      { key: "power", name: "Power", words: "Power · Utilities · Electricity" },
      { key: "sustainability", name: "Sustainability", words: "Sustainability · Environment · ESG" },
      { key: "storage", name: "Storage", words: "Energy Storage · Battery · Grid" },
      { key: "gridApps", name: "Smart Grid", words: "Smart Grid · Distribution Network" },
      { key: "dashboard", name: "Energy Dashboard", words: "Energy Monitoring · Dashboard" },
      { key: "calendarIcon", name: "Maintenance Schedule", words: "Maintenance Schedule · Outage Planning" },
      { key: "priorityStop", name: "Safety Compliance", words: "Safety · Regulatory Compliance" },
      { key: "cylinderStorage", name: "Reservoir", words: "Reservoir · Fuel Storage" },
      { key: "pinLocation", name: "Site", words: "Plant Site · Facility Location" },
      { key: "checklist", name: "Inspection", words: "Inspection · Compliance Checklist" },
      { key: "peopleIcon", name: "Field Crews", words: "Field Crews · Technicians" },
      { key: "directionChevron", name: "Distribution", words: "Distribution · Transmission Flow" },
      { key: "teardropDrop", name: "Water Utility", words: "Water Utility · Resource Management" },
      { key: "sealBadge", name: "Certification", words: "Environmental Certification · ESG Rating" },
      { key: "wrenchIcon", name: "Maintenance", words: "Equipment Maintenance · Service" },
      { key: "calmWave", name: "Grid Load", words: "Grid Load · Demand · Capacity" },
      { key: "decisionPoint", name: "Load Shedding Decision", words: "Load Shedding · Demand Response" },
      { key: "processStep", name: "Generation Process", words: "Power Generation Process" },
      { key: "terminator", name: "Outage Boundary", words: "Outage Start/End · Restoration" },
      { key: "internalStorage", name: "Fuel Reserve", words: "Fuel Reserve · Internal Storage" },
      { key: "onlineStorage", name: "SCADA Data", words: "SCADA Data · Telemetry" },
      { key: "multiDocument", name: "Compliance Filings", words: "Regulatory Filings · Compliance Docs" },
      { key: "manualOperation", name: "Field Switching", words: "Manual Field Switching · Isolation" },
      { key: "fourWayFlow", name: "Grid Interconnection", words: "Grid Interconnection · Multi-Feed" },
      { key: "forwardDirection", name: "Capacity Growth", words: "Capacity Growth · Expansion" },
      { key: "restrictedIcon", name: "Hazard Area", words: "Hazard Area · Restricted Zone" },
      { key: "rightTriangleNode", name: "Peak Demand", words: "Peak Demand · Load Ramp" },
      { key: "aggregationPoint", name: "Substation", words: "Substation · Aggregation Node" },
      { key: "sparkleStar", name: "New Capacity", words: "New Capacity · Commissioning" },
      { key: "fastForward", name: "Rapid Response", words: "Rapid Response · Fast Ramp" },
      { key: "bidirectional", name: "Bidirectional Flow", words: "Bidirectional Power Flow · Net Metering" },
      { key: "offlineStorage", name: "Strategic Reserve", words: "Strategic Reserve · Backup Fuel" },
    ],
  },
  {
    name: "Professional Services",
    icons: [
      { key: "strategy", name: "Strategy", words: "Strategy · Focus · Goals" },
      { key: "advisory", name: "Advisory", words: "Advisory · Consulting · Professional Services" },
      { key: "insights", name: "Insights", words: "Insights · Analytics · Reporting" },
      { key: "partnership", name: "Partnership", words: "Partnership · Collaboration · Alliance" },
      { key: "document", name: "Proposal", words: "Proposal · Statement of Work" },
      { key: "checklist", name: "Engagement Plan", words: "Engagement Plan · Milestones · Checklist" },
      { key: "calendarIcon", name: "Timeline", words: "Project Timeline · Scheduling" },
      { key: "peopleIcon", name: "Team", words: "Engagement Team · Stakeholders" },
      { key: "dashboard", name: "Reporting Dashboard", words: "Client Reporting · Dashboard" },
      { key: "messageBubble", name: "Consultation", words: "Consultation · Advisory Discussion" },
      { key: "sealBadge", name: "Credentials", words: "Credentials · Accreditation" },
      { key: "starRating", name: "Client Satisfaction", words: "Client Satisfaction · NPS · Rating" },
      { key: "directionChevron", name: "Roadmap", words: "Roadmap · Next Steps · Direction" },
      { key: "focusDiamond", name: "Priorities", words: "Priorities · Focus Areas" },
      { key: "awardRibbon", name: "Recognition", words: "Recognition · Awards · Distinction" },
      { key: "phoneIcon", name: "Client Line", words: "Client Relationship · Contact" },
      { key: "groupBracket", name: "Alignment", words: "Stakeholder Alignment · Grouping" },
      { key: "mailIcon", name: "Correspondence", words: "Client Correspondence · Updates" },
      { key: "decisionPoint", name: "Engagement Decision", words: "Engagement Go/No-Go" },
      { key: "processStep", name: "Methodology Step", words: "Methodology Step · Delivery Process" },
      { key: "terminator", name: "Engagement Boundary", words: "Engagement Kickoff/Close" },
      { key: "multiDocument", name: "Deliverables Package", words: "Deliverables Package · Reports" },
      { key: "manualInput", name: "Discovery Interview", words: "Discovery Interview · Data Gathering" },
      { key: "forwardDirection", name: "Progress", words: "Engagement Progress · Milestone" },
      { key: "fastForward", name: "Accelerated Delivery", words: "Accelerated Delivery · Fast Track" },
      { key: "satisfactionIcon", name: "Client Feedback", words: "Client Feedback · Satisfaction Survey" },
      { key: "sparkleStar", name: "Value Add", words: "Value-Add · Differentiator" },
      { key: "aggregationPoint", name: "Synthesis", words: "Insight Synthesis · Aggregation" },
      { key: "bidirectional", name: "Two-Way Feedback", words: "Two-Way Feedback Loop" },
      { key: "annotatedNote", name: "Recommendation", words: "Recommendation · Advisory Note" },
      { key: "bannerRibbon", name: "Trusted Advisor", words: "Trusted Advisor Status" },
      { key: "reverseCycle", name: "Course Correction", words: "Course Correction · Iteration" },
      { key: "twelvePointStar", name: "Preferred Partner", words: "Preferred Partner · Elite Status" },
      { key: "offPageRef", name: "Referral Network", words: "Referral · Partner Network" },
    ],
  },
  {
    name: "Artificial Intelligence",
    icons: [
      { key: "neuralNetwork", name: "Neural Network", words: "AI · Machine Learning · Neural Network" },
      { key: "automation2", name: "Automation", words: "Automation · AI · Intelligent Process" },
      { key: "assistant", name: "Assistant", words: "Conversational AI · Copilot · Chatbot" },
      { key: "vision", name: "Vision", words: "Computer Vision · Insight · Recognition" },
      { key: "dataAnalytics", name: "Predictive Model", words: "Predictive Modeling · Forecasting" },
      { key: "gridApps", name: "ML Pipeline", words: "ML Pipeline · Model Deployment" },
      { key: "cylinderStorage", name: "Training Data", words: "Training Data · Data Lake" },
      { key: "checklist", name: "Model Validation", words: "Model Validation · Testing Checklist" },
      { key: "hexNode", name: "AI Node", words: "AI Compute Node · Inference" },
      { key: "signalWave", name: "Signal Processing", words: "Signal Processing · Pattern Detection" },
      { key: "directionChevron", name: "Decision Flow", words: "Decision Flow · Logic Path" },
      { key: "focusDiamond", name: "Precision", words: "Precision · Accuracy · Confidence" },
      { key: "ideaSpark", name: "Generative AI", words: "Generative AI · Innovation" },
      { key: "keyIcon", name: "Model Access", words: "Model Access · API Key" },
      { key: "peopleIcon", name: "Human-in-the-Loop", words: "Human-in-the-Loop · Oversight" },
      { key: "sealBadge", name: "Responsible AI", words: "Responsible AI · Governance · Ethics" },
      { key: "addPlus", name: "Augmentation", words: "AI Augmentation · Enhancement" },
      { key: "decisionPoint", name: "Decision Boundary", words: "Decision Boundary · Classification" },
      { key: "processStep", name: "Inference Step", words: "Inference Pipeline Step" },
      { key: "terminator", name: "Training Boundary", words: "Training Start/End · Epoch Boundary" },
      { key: "internalStorage", name: "Feature Store", words: "Feature Store · Model Inputs" },
      { key: "onlineStorage", name: "Vector Database", words: "Vector Database · Embeddings Store" },
      { key: "manualInput", name: "Prompt Input", words: "Prompt Engineering · Manual Input" },
      { key: "fourWayFlow", name: "Multi-Agent Flow", words: "Multi-Agent · Orchestration" },
      { key: "reverseCycle", name: "Retraining Loop", words: "Retraining Loop · Feedback Cycle" },
      { key: "forwardDirection", name: "Model Deployment", words: "Model Deployment · Forward Pass" },
      { key: "restrictedIcon", name: "Guardrails", words: "AI Guardrails · Content Restriction" },
      { key: "sparkleStar", name: "Emerging Capability", words: "Emerging Capability · New Model" },
      { key: "multiplierIcon", name: "Compute Scaling", words: "Compute Scaling · GPU Multiplier" },
      { key: "aggregationPoint", name: "Ensemble Model", words: "Ensemble Model · Aggregation" },
      { key: "annotatedNote", name: "Model Card", words: "Model Card · Documentation" },
      { key: "bidirectional", name: "Human Feedback Loop", words: "RLHF · Human Feedback Loop" },
    ],
  },
  {
    name: "Data & Analytics",
    icons: [
      { key: "dataAnalytics", name: "Analytics", words: "Data · Analytics · Trends · Reporting" },
      { key: "database", name: "Database", words: "Database · Storage · Records" },
      { key: "dashboard", name: "Dashboard", words: "Dashboard · KPI · Visualization" },
      { key: "dataLayers", name: "Governance", words: "Data Governance · Layers · Records" },
      { key: "pieChartAlt", name: "Segmentation", words: "Data Segmentation · Breakdown" },
      { key: "filterFunnel", name: "Data Filtering", words: "Data Filtering · Query · Refine" },
      { key: "gridApps", name: "Data Sources", words: "Data Sources · Integration Points" },
      { key: "cylinderStorage", name: "Data Lake", words: "Data Lake · Warehouse · Storage" },
      { key: "lock", name: "Data Privacy", words: "Data Privacy · Governance · Compliance" },
      { key: "checklist", name: "Data Quality", words: "Data Quality · Validation Checklist" },
      { key: "exchangeArrows", name: "ETL", words: "ETL · Data Pipeline · Transformation" },
      { key: "signalWave", name: "Real-Time Feed", words: "Real-Time Feed · Streaming Data" },
      { key: "directionChevron", name: "Data Flow", words: "Data Flow · Pipeline Sequence" },
      { key: "starRating", name: "Data Confidence", words: "Data Confidence · Quality Score" },
      { key: "document", name: "Reports", words: "Reports · Data Documentation" },
      { key: "scrollDocument", name: "Audit Trail", words: "Audit Trail · Data Lineage" },
      { key: "decisionPoint", name: "Data Routing Decision", words: "Data Routing · Conditional Logic" },
      { key: "processStep", name: "Transformation Step", words: "Data Transformation Step" },
      { key: "terminator", name: "Pipeline Boundary", words: "Pipeline Start/End" },
      { key: "internalStorage", name: "Staging Area", words: "Staging Area · Internal Store" },
      { key: "onlineStorage", name: "Data Warehouse", words: "Data Warehouse · Cloud Store" },
      { key: "offlineStorage", name: "Cold Archive", words: "Cold Archive · Historical Data" },
      { key: "manualInput", name: "Manual Entry", words: "Manual Data Entry" },
      { key: "aggregationPoint", name: "Rollup", words: "Data Rollup · Aggregation" },
      { key: "sortStep", name: "Sort & Rank", words: "Sort & Rank · Ordering" },
      { key: "mergeStep", name: "Data Merge", words: "Data Merge · Join" },
      { key: "collationStep", name: "Data Collation", words: "Data Collation · Compilation" },
      { key: "multiDocument", name: "Data Catalog", words: "Data Catalog · Metadata Docs" },
      { key: "restrictedIcon", name: "Access Restriction", words: "Row-Level Security · Restriction" },
      { key: "forwardDirection", name: "Downstream Flow", words: "Downstream Data Flow" },
      { key: "reverseCycle", name: "Data Refresh", words: "Data Refresh Cycle" },
      { key: "sparkleStar", name: "New Insight", words: "New Insight · Anomaly Detected" },
    ],
  },
  {
    name: "Digital Transformation",
    icons: [
      { key: "connectedEcosystem", name: "Ecosystem", words: "Digital Thread · Connectivity · IoT" },
      { key: "transformation", name: "Transformation", words: "Digital Transformation · Change · Modernization" },
      { key: "cloudMigration", name: "Cloud Migration", words: "Cloud Migration · Infrastructure · Scale" },
      { key: "platform", name: "Platform", words: "Platform · Integration · Unified System" },
      { key: "gridApps", name: "App Modernization", words: "App Modernization · Legacy Replacement" },
      { key: "hexNode", name: "Integration Hub", words: "Integration Hub · Middleware" },
      { key: "directionChevron", name: "Change Roadmap", words: "Change Roadmap · Transformation Path" },
      { key: "checklist", name: "Adoption Checklist", words: "Change Management · Adoption Checklist" },
      { key: "peopleIcon", name: "Digital Workforce", words: "Digital Workforce · Enablement" },
      { key: "dashboard", name: "Digital Dashboard", words: "Digital Maturity Dashboard" },
      { key: "exchangeArrows", name: "Process Automation", words: "Process Automation · Workflow Exchange" },
      { key: "ideaSpark", name: "Innovation Culture", words: "Innovation Culture · Digital Mindset" },
      { key: "signalWave", name: "Connectivity", words: "IoT Connectivity · Sensors" },
      { key: "keyIcon", name: "Digital Access", words: "Digital Access · Identity Management" },
      { key: "sealBadge", name: "Maturity Certification", words: "Digital Maturity · Certification" },
      { key: "cloudSync", name: "Cloud-Native", words: "Cloud-Native · Sync · Scalability" },
      { key: "decisionPoint", name: "Build vs Buy", words: "Build vs. Buy Decision" },
      { key: "processStep", name: "Transformation Step", words: "Transformation Roadmap Step" },
      { key: "terminator", name: "Program Milestone", words: "Program Start/End · Milestone" },
      { key: "alternateProcess", name: "Alternate Path", words: "Alternate Delivery Path" },
      { key: "predefinedProcess", name: "Reusable Module", words: "Reusable Module · Predefined Process" },
      { key: "preparationStep", name: "Readiness Assessment", words: "Readiness Assessment · Preparation" },
      { key: "multiDocument", name: "Change Playbook", words: "Change Management Playbook" },
      { key: "fourWayFlow", name: "Omnichannel", words: "Omnichannel · Multi-Channel Flow" },
      { key: "reverseCycle", name: "Iterative Rollout", words: "Iterative Rollout · Agile Cycle" },
      { key: "forwardDirection", name: "Modernization Path", words: "Modernization Path · Forward Migration" },
      { key: "sparkleStar", name: "Innovation Spark", words: "Innovation Spark · New Capability" },
      { key: "multiplierIcon", name: "Scale Effect", words: "Scale Effect · Network Effect" },
      { key: "bannerRibbon", name: "Digital Leader", words: "Digital Leader Status · Recognition" },
      { key: "restrictedIcon", name: "Legacy Constraint", words: "Legacy Constraint · Technical Debt" },
      { key: "annotatedNote", name: "Lessons Learned", words: "Lessons Learned · Retrospective Note" },
      { key: "offPageRef", name: "Cross-Functional Link", words: "Cross-Functional Reference" },
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
    s.addText("Editable line icons across 10 categories — every icon is a native PowerPoint shape (recolor, resize, restyle freely). Every icon on every page is genuinely unique — no repeats, no recolored duplicates — each captioned with searchable keywords.", {
      x: MARGIN, y: 4.75, w: 9.8, h: 0.95, fontFace: BODY_FONT, fontSize: 14,
      color: "D7DCE6", align: "left", margin: 0, lineSpacingMultiple: 1.25,
    });
    const catNames = INDUSTRY_LIBRARY.map((c) => c.name).join("   ·   ");
    s.addText(catNames, {
      x: MARGIN, y: PAGE_H - 0.85, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 10,
      color: THEME.muted, align: "left", margin: 0,
    });
  }

  // ---- CATEGORY PAGES: every icon on the page is unique — no repeats -----
  const GRID_COLS = 7;
  const ICON_R = 0.19;

  // Sanity check: catch a typo'd icon key or an accidental duplicate within
  // one category before we spend time rendering — both are real defects here.
  INDUSTRY_LIBRARY.forEach((industry) => {
    const seen = new Set();
    industry.icons.forEach((ic) => {
      if (!ICONS[ic.key]) throw new Error(`Unknown icon key "${ic.key}" in "${industry.name}"`);
      if (seen.has(ic.key)) throw new Error(`Duplicate icon key "${ic.key}" in "${industry.name}"`);
      seen.add(ic.key);
    });
  });

  INDUSTRY_LIBRARY.forEach((industry) => {
    n++;
    const s = pres.addSlide({ masterName: "MASTER" });
    const uniqueCount = industry.icons.length;
    const rows = Math.ceil(uniqueCount / GRID_COLS);
    slideHeader(
      s,
      industry.name,
      `${uniqueCount} unique icons — every one is a distinct native PowerPoint shape, none repeated`
    );
    const gridTop = 1.55;
    const colW = (PAGE_W - MARGIN * 2) / GRID_COLS;
    const rowH = (PAGE_H - gridTop - 0.35) / rows;
    industry.icons.forEach((ic, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const cx = MARGIN + col * colW + colW / 2;
      const cellTop = gridTop + row * rowH;
      const cy = cellTop + Math.min(rowH * 0.32, 0.3);
      ICONS[ic.key](s, cx, cy, ICON_R, THEME.accent);
      s.addText(ic.name, {
        x: cx - colW / 2 + 0.02, y: cy + 0.2, w: colW - 0.04, h: 0.16,
        fontFace: BODY_FONT, fontSize: 6.5, bold: true, color: NAVY_TEXT,
        align: "center", margin: 0,
      });
      s.addText(ic.words, {
        x: cx - colW / 2 + 0.02, y: cy + 0.37, w: colW - 0.04, h: rowH - (cy - cellTop) - 0.4,
        fontFace: BODY_FONT, fontSize: 5.5, italic: true, color: THEME.muted,
        align: "center", margin: 0, lineSpacingMultiple: 1.05,
      });
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
