# Consulting Presentation Templates

Two PowerPoint templates in a Big-4-caliber register (original palette and layout conventions —
not copied from any specific firm's trademarked template), built for `bd-proposal-writer` and for
manual use.

- `Consulting-Template-Light.pptx` — white/light working background, dark navy bookend slides
  (title, section dividers, quote, thank you).
- `Consulting-Template-Dark.pptx` — dark navy background throughout.

Both files share:

- **19 slides**: 12 core template layouts (Title, Template Standards, Agenda, Section Divider,
  Executive Summary, Content — Icon Rows, Content — Two Column, Data/Chart, Process/Timeline,
  Team/Org, Quote/Callout, Thank You) + a 7-slide Icon Library appendix (1 divider + 6 industries).
- **Page numbers** on every slide via a real PowerPoint Slide Master (`View > Slide Master` in
  PowerPoint to edit centrally).
- **Original palette**: navy (dominant), slate (secondary), gold (single accent) — documented with
  hex codes on the "Template Standards" slide (slide 2) in both files.
- **Fonts**: Cambria (headings) + Calibri (body/captions) — both ship with Office and render
  true-to-width, so text fit is reliable.
- **24 icons** (6 industries × 4 each: Financial Services, Healthcare & Life Sciences,
  Manufacturing & Industrial, Technology & Telecom, Energy & Utilities, Professional Services),
  each captioned with searchable keywords. **Every icon is a native, fully editable PowerPoint
  shape** (ellipse/rect/roundRect/triangle/line + OOXML preset autoshapes like heart, cloud, sun,
  gear, cube, lightning bolt) — never a raster image or embedded picture. Select any icon in
  PowerPoint and recolor, resize, or restyle it directly.

## Regenerating or customizing

Source: `build-consulting-template.js` (pptxgenjs script). Run with `node
build-consulting-template.js light` or `node build-consulting-template.js dark` to regenerate
either file. Edit the `THEME` objects at the top to adjust colors, or the `ICONS` object to add/
change icon shapes — every icon is a small function composed of primitive shape calls, so new ones
follow the same pattern.

## Known gaps / next steps

- Built generic/unbranded per the user's choice — no company name or logo baked in. Swap the
  "[Engagement / Presentation Title]" and "PRACTICE NAME · CONFIDENTIAL" placeholders, and add a
  real logo image, when a specific company/client identity is confirmed.
- Icons were built from scratch as an original set. The user may upload reference icon examples
  from their previous Big 4 decks — if so, rebuild the `ICONS` shape functions to match that style
  more closely rather than layering a second icon set on top.
- Visual rendering (LibreOffice → PDF → image) could not be QA'd in this environment — the
  conversion pipeline fails on any file here, not just this one. Validated instead via the pptx
  skill's schema/structural validator (passed clean on both files) and a full text-content dump
  (passed clean, no leftover/broken content). Open both files in real PowerPoint to do a final
  visual pass before using them client-facing.
