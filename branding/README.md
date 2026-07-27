# Company Brand Identity — Working Draft

An original logo mark, iterated in two rounds against two different reference photos, on the
navy/slate/gold palette and Cambria/Calibri typography already established for
`business-development/templates/`.

**Revision history:**
1. First pass used tapered pointed blades reaching the center — read as a compass/star.
2. Second pass (still in `Brand-Guidelines.docx`/`Letterhead-Template.docx` below) switched to
   thin straight-line grooves radiating from a small hub — closer, but too plain next to a
   second, richer reference photo you then shared (a carved stone turbine/spiral texture with
   concentric rings of tapered teeth around a raised center hub).
3. **Current logo-only pass** (this section, `logo-concepts/`): rebuilt again around that second
   reference — one or more **concentric rings of pointed, kite-shaped teeth** (tapered diamonds,
   each contained within its own radial band rather than spiking to the center) wrapped around a
   raised donut-shaped center hub, inside a plain circular rim. This is the one to review now.

**Nothing here has a real company name yet** — placeholder brackets throughout, per your choice
to work in placeholder form for now.

## The mark (current round)

Six pure icon-mark variations — no wordmark this round, per your "just the logo" request — each
built from the same parts (a plain circular rim, one or more rings of pointed teeth, a raised
center hub with a thin gold accent ring) but varying ring count, tooth count, and whether teeth
are solid-filled or outline-only:

| # | Construction | Character |
|---|---|---|
| 1 | Single ring, 12 solid teeth | Bold icon silhouette — reads well very small |
| 2 | Two rings (10 inner / 14 outer), outline teeth | **Recommended primary** — closest balance of detail and clarity |
| 3 | Two rings, inner solid + outer outline | Mixed depth, most dimensional-looking |
| 4 | Single ring, 8 outline teeth | Cleanest/most minimal |
| 5 | Two rings, both solid (12 inner / 16 outer) | Dense, most literal match to the reference's packed texture |
| 6 | Three rings, outline (8 / 12 / 16) | Most literal to the reference's layered turbine detail |

## Files (current round)

- `logo-concepts/concept-N-preview.png` — each concept on light *and* dark backgrounds side by side.
- `logo-concepts/concept-N-icon-only.png` / `.svg` — the icon alone on white, favicon/app-icon ready.
- `logo-concepts/concept-N-mark.svg` — icon alone on a **transparent** background, true editable
  vector source (every tooth, the hub, and the rim are separate paths — open directly in
  Illustrator/Inkscape/Figma).
- `logo-concepts/contact-sheet.png` — all six, stacked, for a quick side-by-side scan.
- `build/generate-logo-concepts.js` — regenerate with `node generate-logo-concepts.js`.

## Not yet refreshed to this round

`Brand-Guidelines.docx`, `Letterhead-Template.docx`, and everything in `mockups/` still show
**round 2's** groove-based mark, not the current turbine-tooth mark above — they haven't been
regenerated yet since you asked to iterate on just the logo this time. Once you pick a concept
(or a hybrid) from the current round, say so and the guidelines doc, letterhead, and business
card mockups will be rebuilt around it.

## Why SVG instead of native PowerPoint shapes

The icon library built earlier (`business-development/templates/Icon-Library-*.pptx`) uses
native PowerPoint autoshapes because those icons live *inside decks* and need to stay editable
there. A logo is different — it needs to travel to a website favicon, embroidery, signage, and
print vendors, none of which open `.pptx`. SVG is the actual professional standard for
delivering an editable vector logo (opens natively in Illustrator, Inkscape, Figma, and most
browsers), so that's what's provided here. If you specifically want the marks *also* rebuilt as
native PowerPoint shapes (e.g. to drop into the deck template's title slide), say the word.

## Color palette (identical to the presentation template / icon library)

| | Light theme | Dark theme |
|---|---|---|
| Background | `#FFFFFF` | `#10162B` |
| Navy | `#16233F` | `#0B1022` (block fill) |
| Slate | `#4F6079` | `#8DA0C2` (mark color on dark) |
| Gold (single accent) | `#C89B3C` | `#D4AF5A` |

Fonts: Cambria (headings/wordmark) + Calibri (body/captions) — both ship with Microsoft
Office. Note: the preview PNGs in this folder were rendered in an environment without
Cambria/Calibri installed, so their wordmark text shows a metric-compatible substitute
(Liberation Serif/Sans); the actual `.docx` files reference the real fonts and will render
correctly in Word.

## Regenerating or customizing

Writes to a local `out-v2/` folder — copy results into `logo-concepts/` afterward.

```
cd branding/build
npm install sharp    # one-time
node generate-logo-concepts.js   # -> out-v2/v2-concept-*.png, *.svg, contact sheet
```

`build-guidelines.js` and `build-letterhead.js` in this same folder still target round 2's
groove-based mark (see "Not yet refreshed" above) — don't run them expecting the current
turbine-tooth mark until they're updated for it.

## Known gaps / next steps

- **No real name yet** — placeholder throughout by design.
- **No monogram variant yet** — ask if you want an initial worked into the center hub once a
  name exists.
- **No wordmark lockups yet this round** — current files are icon-only; combination
  lockups (icon + name) can be added once a concept is picked.
- Visual rendering was QA'd via direct PNG inspection (this environment can generate raster
  previews via `sharp`/librsvg even though LibreOffice-based `.docx`→PDF conversion is broken
  here — see other READMEs in this repo for that limitation).
- Say the word if you'd like the deck template (`Consulting-Template-*.pptx`) title slide,
  the brand guidelines doc, the letterhead, and the business card mockups all rebuilt around
  whichever concept you pick from this round.
