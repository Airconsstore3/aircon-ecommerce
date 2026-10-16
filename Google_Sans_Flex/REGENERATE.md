# Google Sans Flex — source font & regeneration

`GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf` (~4.1 MB) is the
**source** font kept for regenerating the runtime webfont. It is NOT served —
it lives outside `public/` and is not referenced by `next/font`, so it is
never bundled, preloaded or requested at runtime.

The runtime file is `fonts/GoogleSansFlex-Variable.woff2` (~173 KB), a
variable font instanced on `wght` (1–1000) + `opsz` (6–144) — the only axes
reachable in this codebase (no `font-variation-settings` usage; `opsz` is
auto-applied by browsers via `font-optical-sizing: auto`). All 682 glyphs are
retained (full Latin coverage, currency, °, %, &, typographic punctuation,
accents, ®, ™, superscripts — required for product copy like "BTU/m²").

## Regenerate the runtime WOFF2

Requires Python + fontTools (pinned version used: **4.66.1**) and brotli
(**1.2.0**):

```bash
pip install fonttools==4.66.1 brotli==1.2.0

python -m fontTools.varLib.instancer \
  "Google_Sans_Flex/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf" \
  wdth=drop slnt=drop GRAD=drop ROND=drop \
  -o /tmp/gsf-wght-opsz.ttf

python -m fontTools.subset /tmp/gsf-wght-opsz.ttf \
  --flavor=woff2 \
  --output-file=fonts/GoogleSansFlex-Variable.woff2 \
  --unicodes='*' --layout-features='*' \
  --name-IDs='*' --name-legacy --name-languages='*' --no-hinting
```

Then rebuild (`pnpm build`) and verify with `pnpm test:e2e` — the images and
smoke specs assert the font loads and that no extra font requests appear.

Licence: see `OFL.txt` (SIL Open Font License 1.1) — permits the subsetted/
instanced conversion performed above.
