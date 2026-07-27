# Consulting Presentation Templates

Six PowerPoint files in a Big-4-caliber register (original palette and layout conventions — not
copied from any specific firm's trademarked template), built for `bd-proposal-writer` and for
manual use.

## The deck template

- `Consulting-Template-Light.pptx` — white/light working background, dark navy bookend slides
  (title, section dividers, quote, thank you).
- `Consulting-Template-Dark.pptx` — dark navy background throughout.

**22 slides each**: 12 core template layouts (Title, Template Standards, Agenda, Section Divider,
Executive Summary, Content — Icon Rows, Content — Two Column, Data/Chart, Process/Timeline,
Team/Org, Quote/Callout, Thank You) + a spaced, badged 10-slide Icon Library appendix (1 divider +
9 categories, ~4-6 icons each in an accent-circle badge with a caption). This appendix predates the
standalone library's second pass below and has **not** been updated to match it yet (see "Known
gaps").

Source: `build-consulting-template.js`. Regenerate with `node build-consulting-template.js light`
or `... dark`.

## The standalone icon library (dense reference grid)

- `Icon-Library-Light.pptx` / `Icon-Library-Dark.pptx` — 11 slides: cover + **10 category pages**
  (the original 9 plus "Universal / General Business"), each a dense **60-icon grid** (10 columns ×
  6 rows) matching a reference screenshot the user supplied of a typical dense PowerPoint icon
  sheet. Per category: **16-24 genuinely unique icons** (varies by topic) rendered in the accent
  gold, then the same set **repeats, tinted in the secondary slate color**, cycling until the grid
  is full at 60 — an intentional density technique, not duplicate content pretending to be unique.
  Every icon still has its own small caption (name ~6.5pt bold + searchable keyword phrase ~5pt)
  beneath it. No circle badges at this density (unlike the deck template's appendix) — matches the
  plain, tightly-packed reference look the user asked for. Background stays exactly the same
  navy/white/dark theming as every other file in this set — only the grid density and lack of
  badges changed, not the color system.

Source: `build-icon-library.js`. Regenerate with `node build-icon-library.js light` or `... dark`.

## Categories and icon counts (standalone library)

| Category | Unique icons |
|---|---|
| Universal / General Business | 24 |
| Financial Services | 20 |
| Life Sciences | 20 |
| Manufacturing & Industrial | 18 |
| Technology & Telecom | 18 |
| Energy & Utilities | 17 |
| Professional Services | 18 |
| Artificial Intelligence | 17 |
| Data & Analytics | 16 |
| Digital Transformation | 16 |

~204 unique icon designs total, most built from a shared catalog of ~90 draw functions (many are a
single OOXML preset autoshape — star, heart, cloud, gear, hexagon, cylinder, speech-bubble callout,
circular arrow, funnel, folder, etc. — reused across categories with topic-appropriate captions,
same as real icon packs do; the rest are small 2-4 shape compositions for concepts without a direct
preset, like DNA/genomics, a neural network diagram, or a factory).

## Shared standards (all files)

- **Page numbers** on every slide via a real PowerPoint Slide Master (`View > Slide Master` in
  PowerPoint to edit centrally).
- **Original palette**: navy (dominant), slate (secondary), gold (single accent) — documented with
  hex codes on the deck template's "Template Standards" slide.
- **Fonts**: Cambria (headings) + Calibri (body/captions) — both ship with Office and render
  true-to-width, so text fit is reliable.
- **Every icon is a native, fully editable PowerPoint shape** — ellipse/rect/roundRect/triangle/line
  plus OOXML preset autoshapes — never a raster image or embedded picture. Select any icon in
  PowerPoint and recolor, resize, or restyle it directly.

## Regenerating or customizing

Edit the `THEME` objects at the top of either build script to adjust colors, or the `ICONS` object
to add/change icon shapes — every icon is a small function composed of primitive shape calls
(`simple(ShapeType.xxx, {w, h, rotate, filled})` for a one-preset icon, or a custom function for a
composite one), so new ones follow the same pattern. The icon catalog and category list
(`INDUSTRY_LIBRARY`) are duplicated between the two build scripts rather than shared as a module —
update both if you change one, or the deck template's appendix and the standalone library will keep
drifting apart (see below).

## On the uploaded reference material

Two references were used, neither copied from directly:
- A real prior-firm "Enterprise icon library" `.pptx` — ~240 raster PNG icon images, no captions or
  metadata. Used only to confirm general enterprise-icon-library conventions (single-accent-color
  flat glyphs, grouped per category slide). Deleted from disk after review per the user's request —
  nothing from it was retained or embedded.
- A screenshot of a generic "PowerPoint icons" stock pack showing a dense ~70-icon grid on a
  gradient background with a title — used to calibrate density (~60/slide) and the plain,
  caption-beneath-icon, no-badge layout. The gradient background was explicitly *not* adopted — this
  library keeps the same navy/white/dark theming as the rest of the set.

## Known gaps / next steps

- **The deck template's appendix and the standalone icon library have diverged.** The deck template
  (`Consulting-Template-*.pptx`) still ships the earlier spaced/badged 9-category appendix; the
  standalone library was expanded to the dense 10-category/60-per-slide version but that change
  hasn't been back-ported into the deck template yet. Say the word if you want the deck template's
  appendix swapped over to match.
- Built generic/unbranded per the user's choice — no company name or logo baked in. Swap the
  "[Engagement / Presentation Title]" and "PRACTICE NAME · CONFIDENTIAL" placeholders, and add a
  real logo image, when a specific company/client identity is confirmed.
- Icons are an original set built from scratch, styled after general enterprise-icon-library
  conventions (see above) rather than matching any specific firm's exact glyphs.
- Visual rendering (LibreOffice → PDF → image) could not be QA'd in this environment — the
  conversion pipeline fails on any file here, not just this one. Validated instead via the pptx
  skill's schema/structural validator (passed clean on all files) and a full text-content dump
  (passed clean, no leftover/broken content, no missing icon lookups). Open the files in real
  PowerPoint to do a final visual pass before using them client-facing — at 60 icons/slide small
  layout issues are more likely than in the lighter-density files.
