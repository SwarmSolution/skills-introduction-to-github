# Company Brand Identity — Working Draft

An original logo mark modeled on a real millstone face — a circular disc with straight grooves
radiating out in sector groups and a small center spindle hole — six variations on that mark, a
full brand guidelines document, and a ready-to-use letterhead, all on the same navy/slate/gold
palette and Cambria/Calibri typography already established for `business-development/templates/`.

**Revision note:** the first pass at this mark used tapered pointed blades and read as a
compass/star, not a millstone. It's been rebuilt from the ground up: the outer silhouette is
now a plain circle (a millstone is never spiky), and the "spokes" are thin straight-line grooves
— a primary groove per sector plus shorter secondary grooves fanning within each sector, matching
how an actual dressed millstone face looks, just simplified into clean brand-friendly line work
instead of the reference photo's rough stone texture.

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

Each concept is the same construction — a plain circle, divided into equal sectors by full-length
radial grooves, with shorter secondary grooves fanning between them, plus a small center hole with
a thin gold ring (the "spindle hole" on a real millstone). Concepts vary sector count and groove
density, from a fine, dense texture closest to your reference photo down to a clean, minimal mark:

| # | Lockup style | Sectors / secondary grooves |
|---|---|---|
| 1 | Icon-first, wordmark separate below | 6 sectors, 3 secondary — clean, moderate detail |
| 2 | Combination lockup, icon beside name | 8 sectors, 2 secondary — **recommended primary/default** |
| 3 | Icon-first, wordmark separate below | 10 sectors, 2 secondary — fine, dense texture |
| 4 | Icon-first, wordmark stacked below | 7 sectors, 3 secondary — mid-density |
| 5 | Combination lockup, icon beside name | 6 sectors, 1 secondary — flat/minimal |
| 6 | Icon-first, wordmark separate below | 9 sectors, 4 secondary — densest, most literal to the reference photo |

Concept 2 is used for the letterhead and business card mockups as a sensible default; nothing
is finalized until you pick one (or ask for a hybrid of two). None of these carry a monogram
this round — say the word if you'd like an initial worked into the center hole once a name exists.

## Files

- `logo-concepts/concept-N-preview.png` — each concept shown on light *and* dark backgrounds
  side by side, with its lockup label.
- `logo-concepts/concept-N-icon-only.png` / `.svg` — the icon alone, on a white background,
  favicon/app-icon ready.
- `logo-concepts/concept-N-mark.svg` — the icon alone on a **transparent** background — the
  one to drop into another document, a website, or open directly in Illustrator/Inkscape/Figma
  to refine further. **This is the true editable source** — it's vector, so every groove, the
  hub, and the rim are separate, fully editable paths/shapes, not a flattened image.
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
- **No monogram variant yet** — all six are the plain radial-groove mark; ask if you want an
  initial worked into the center hole once a name exists.
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
