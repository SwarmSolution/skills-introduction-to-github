# Company Brand Identity — Working Draft

An original logo mark built around a radial "millstone"/pinwheel motif (per the reference
image provided), six lockup concepts, a full brand guidelines document, and a ready-to-use
letterhead — all on the same navy/slate/gold palette and Cambria/Calibri typography already
established for `business-development/templates/`.

**Nothing here has a real company name yet** — every file uses `[COMPANY NAME]` /
`[Tagline Placeholder]` brackets by design (per your choice to work in placeholder form for
now). Swap those and regenerate once a name is locked in — see "Regenerating" below.

## Start here

- **`Brand-Guidelines.docx`** — the full brand book: about this draft, color palette (light +
  dark, hex codes), typography, logo usage rules (clear space, minimum size, do/don't), all
  six logo concepts shown on light and dark backgrounds, the letterhead preview, and a
  business card mockup (front + back). Read this first.
- **`Letterhead-Template.docx`** — a real, usable Word letterhead (header with mark + name +
  tagline, gold rule, footer with placeholder contact strip). Open it and start typing a
  letter; the header/footer repeat automatically via the Word section headers/footers.

## The mark

The reference circle you shared reads as a radial pinwheel of angular blades around a center
hub — I kept that structure but rebuilt it from scratch in the brand's own navy/slate/gold
palette rather than the reference's colors. Six concepts vary two things independently, per
your direction to see a mix of both:

| # | Lockup style | Blade count / density |
|---|---|---|
| 1 | Icon-first, wordmark separate below (standalone icon works alone for a favicon/app icon) | 9, dense/asymmetric — closest to your reference |
| 2 | Combination lockup, icon beside name | 8, moderate geometric — **recommended primary/default** |
| 3 | Monogram (initial "C" placeholder worked into the center hub), side lockup | 6, clean/symmetric |
| 4 | Icon-first, wordmark stacked below | 7, mid-density asymmetric |
| 5 | Combination lockup, icon beside name | 6, flat/minimal |
| 6 | Monogram (initial "C" placeholder in center), icon-first | 9, dense — most literal match to the reference |

Concept 2 is used for the letterhead and business card mockups as a sensible default; nothing
is finalized until you pick one (or ask for a hybrid of two).

## Files

- `logo-concepts/concept-N-preview.png` — each concept shown on light *and* dark backgrounds
  side by side, with its lockup label.
- `logo-concepts/concept-N-icon-only.png` / `.svg` — the icon alone, on a white background,
  favicon/app-icon ready.
- `logo-concepts/concept-N-mark.svg` — the icon alone on a **transparent** background — the
  one to drop into another document, a website, or open directly in Illustrator/Inkscape/Figma
  to refine further. **This is the true editable source** — it's vector, so every blade, the
  hub, and the ring are separate, fully editable paths/shapes, not a flattened image.
- `logo-concepts/contact-sheet.png` — all six, stacked, for a quick side-by-side scan.
- `mockups/letterhead-mockup.png`, `mockups/business-card-front.png`,
  `mockups/business-card-back.png` — preview renders (used inside `Brand-Guidelines.docx`).
- `build/` — the three Node scripts that generated everything (see below).

## Why SVG instead of native PowerPoint shapes this time

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

Each script writes to a local `out/` folder — copy results into this folder afterward.

```
cd branding/build
npm install sharp docx    # one-time
node generate-logo-concepts.js   # -> out/concept-*.png, *.svg, mockups
node build-guidelines.js         # -> out/Brand-Guidelines.docx (reads generate's out/)
node build-letterhead.js         # -> out/Letterhead-Template.docx
```

To swap in the real name: edit `NAME` / `TAGLINE` at the top of
`build/generate-logo-concepts.js`, and the two `[COMPANY NAME]` / `[TAGLINE PLACEHOLDER]`
occurrences in `build-guidelines.js` and `build-letterhead.js`, then rerun all three.

## Known gaps / next steps

- **No real name yet** — placeholder throughout by design.
- **Monogram concepts (3, 6) use a generic "C"** — swap for the real initial once named.
- Visual rendering was QA'd via direct PNG inspection (this environment can generate raster
  previews via `sharp`/librsvg even though LibreOffice-based `.docx`→PDF conversion is broken
  here — see other READMEs in this repo for that limitation) plus the pptx/docx skill's schema
  validator (`validate.py` — passed clean on both `.docx` files) and a `markitdown` content
  dump (passed clean, no broken/missing content).
- Business card and letterhead are mockup previews sized to real dimensions (3.5"×2" and US
  Letter) but not yet laid out as print-ready press files (bleed/crop marks, CMYK) — flag if
  you need those for an actual print run.
- Say the word if you'd like the deck template (`Consulting-Template-*.pptx`) title slide
  updated to carry this mark once a concept is chosen.
