# 05 — Visual Audit

## Palette integrity — FAIL

Three navies ship simultaneously:
- `#0A2540` (brand, PDP/cart/checkout text)
- `#1E3A5F` (auth cards, order-confirmed, 404/error)
- `#16324F` (mobile drawer)

Three blues: `#1C99D6`, `#2599d4` (angled motif), plus hover blues `#1680b0` vs `#1597c6` — the same "primary hover" is two different colors depending on file.

Six border grays (`#B8E3F7`, `#E5E7EB`, `#E1E5EA`, `#F0F0F0`, `#EAEAEA`, `#E5E5E5`) and three muted-text grays (`#5F6B7A`, `#6B7280`, `#9CA3AF`) — surfaces look "close but off" side-by-side (e.g., cart drawer header border `#E1E5EA` vs summary border `#E5E7EB` on the same screen).

## Typography integrity — FAIL

- **Arbitration by `!important`:** `main h1/h2/h3` globals, `.homepage-typography` scope, PDP inline `<style>` — three overlapping rule systems produce different h2 sizes per page. An h2 on `/products` is 56px max; on `/` it can be 56px under homepage rules; on PDP it's capped 28px.
- **Size soup:** declared scale (72/56/24/16/14) is decorative — actual usage adds 10, 11, 12, 13, 15, 18, 20, 24, 26, 28, 30, 34, 40, 48, 64px arbitrary values.
- **Nav at 10px** uppercase — smallest text in the app is the primary navigation.
- Weight usage: `font-normal` h1s in some pages, `font-medium`, `font-semibold`, `font-bold` elsewhere — no role mapping.

## Shape language — FAIL

No rule decides square vs round: checkout is aggressively `rounded-none` while auth is `rounded-2xl`, PDP chips `rounded-[4px]`, badges `rounded-4xl`, footer newsletter half-`rounded-[10px]`. The angled-corner motif (`.aircon-angled-button`) is the most distinctive brand element and appears only on hero CTAs + nav hovers — orphaned.

## Header — FAIL

- 128px (`8rem`) sticky header with a 96px logo: oversized chrome, thin 10px link strip beneath.
- Layout: centered logo+links column with absolute-positioned icons — fragile at mid widths; nav wraps to `overflow-visible whitespace-nowrap` — overflow risk at lg between 1024–1280 with 11 links.
- Cart icon routes to `/cart` page instead of opening the `CartDrawer` — two competing cart entry patterns.

## Footer — FAIL

- Only rendered on `/`. Every commerce page below the fold ends mid-air.
- On the one page it exists: newsletter is fake, phone is placeholder, ~10 links 404.

## Imagery — PARTIAL

- Product cards use `AspectRatio` consistently; gallery on PDP uses PhotoSwipe (dependency installed).
- Raw `<img>` in 15 files (no lazy/`sizes`/priority control); `/public/Hero Images/` path contains a literal space.
- Promo/hero imagery: single `hero summer winter.webp` recycled as the PLP hero background — every listing page leads with the same summer/winter lifestyle photo.

## Iconography — PARTIAL

- Lucide is consistent; hand-rolled inline SVGs (eye toggle, PDP check) break stroke consistency.
- `★☆` unicode rating in `#FFA500` — platform-dependent rendering, no accessible name.

## Elevation — FLAT-OK

`shadow-sm`/`shadow-2xl` only; flat design is coherent with the aesthetic. Borders do most of the work (six different border grays though).

## Dark mode — MISSING

## Print — PASS (surprise)

`order-confirmed` has real print CSS hiding chrome — the only media-aware styling in the app.

## Grade summary

| Area | Grade |
|---|---|
| Color discipline | D (3 navies, 3 blues, 6 border grays) |
| Type discipline | D− (3 !important systems) |
| Shape/radius | D (no rule) |
| Layout rhythm | C+ (consistent grids where used, arbitrary offsets) |
| Chrome (header/footer) | D (oversized header, absent footer) |
| Imagery | C+ |
| Icons | B− |
| Elevation | B |
| Overall | **D+** — recognisable brand trying to emerge through three competing implementations |
