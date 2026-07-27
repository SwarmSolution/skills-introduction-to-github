# Consulting Presentation Templates

Four PowerPoint files in a Big-4-caliber register (original palette and layout conventions — not
copied from any specific firm's trademarked template), built for `bd-proposal-writer` and for
manual use.

## The deck template

- `Consulting-Template-Light.pptx` — white/light working background, dark navy bookend slides
  (title, section dividers, quote, thank you).
- `Consulting-Template-Dark.pptx` — dark navy background throughout.

**22 slides each**: 12 core template layouts (Title, Template Standards, Agenda, Section Divider,
Executive Summary, Content — Icon Rows, Content — Two Column, Data/Chart, Process/Timeline,
Team/Org, Quote/Callout, Thank You) + a 10-slide Icon Library appendix (1 divider + 9 categories —
see below).

Source: `build-consulting-template.js`. Regenerate with `node build-consulting-template.js light`
or `... dark`.

## The standalone icon library

- `Icon-Library-Light.pptx` / `Icon-Library-Dark.pptx` — the same icon set as the deck template's
  appendix, as its own compact reference file (cover + 9 category slides, 10 slides total) for
  dropping into any other deck.

Source: `build-icon-library.js`. Regenerate with `node build-icon-library.js light` or `... dark`.

## Shared standards (both file types)

- **Page numbers** on every slide via a real PowerPoint Slide Master (`View > Slide Master` in
  PowerPoint to edit centrally).
- **Original palette**: navy (dominant), slate (secondary), gold (single accent) — documented with
  hex codes on the deck template's "Template Standards" slide.
- **Fonts**: Cambria (headings) + Calibri (body/captions) — both ship with Office and render
  true-to-width, so text fit is reliable.
- **38 icons across 9 categories** — Financial Services, Life Sciences, Manufacturing & Industrial,
  Technology & Telecom, Energy & Utilities, Professional Services, Artificial Intelligence, Data &
  Analytics, Digital Transformation — each icon captioned with searchable keywords. **Every icon is
  a native, fully editable PowerPoint shape** (ellipse/rect/roundRect/triangle/line + OOXML preset
  autoshapes like heart, cloud, sun, gear, cube, lightning bolt, circular arrow, hexagon, cylinder,
  speech-bubble callout) — never a raster image or embedded picture. Select any icon in PowerPoint
  and recolor, resize, or restyle it directly.

## Regenerating or customizing

Edit the `THEME` objects at the top of either build script to adjust colors, or the `ICONS` object
to add/change icon shapes — every icon is a small function composed of primitive shape calls, so
new ones follow the same pattern. The icon set and category list (`INDUSTRY_LIBRARY`) are
duplicated between the two build scripts rather than shared as a module — update both if you change
one, or the deck template's appendix and the standalone library will drift apart.

## On the uploaded reference file

The user supplied a real prior-firm "Enterprise icon library" `.pptx` as a style reference. It
contained ~240 raster PNG icon images (no captions, no metadata) — used only to confirm general
enterprise-icon-library conventions (single-accent-color flat glyphs, grouped per category slide),
not copied from directly: none of its actual image assets were used, embedded, or retained. Per the
user's request, the uploaded file was deleted from disk after review rather than kept or
redistributed.

## Known gaps / next steps

- Built generic/unbranded per the user's choice — no company name or logo baked in. Swap the
  "[Engagement / Presentation Title]" and "PRACTICE NAME · CONFIDENTIAL" placeholders, and add a
  real logo image, when a specific company/client identity is confirmed.
- Icons are an original set built from scratch, styled after general enterprise-icon-library
  conventions (see above) rather than matching any specific firm's exact glyphs.
- Visual rendering (LibreOffice → PDF → image) could not be QA'd in this environment — the
  conversion pipeline fails on any file here, not just this one. Validated instead via the pptx
  skill's schema/structural validator (passed clean on all four files) and a full text-content dump
  (passed clean, no leftover/broken content). Open the files in real PowerPoint to do a final visual
  pass before using them client-facing.
