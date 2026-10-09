# 02 — Design Tokens As-Is

Source: `src/app/globals.css` (Tailwind v4 CSS-first config), plus hardcoded values harvested from ~60 `.tsx` files.

## Color tokens (declared)

| Token | Value | Used for | Notes |
|---|---|---|---|
| `--background` | `#FFFFFF` | body bg | |
| `--foreground` | `#0A2540` | body text | brand navy |
| `--primary` | `#1C99D6` | shadcn primary | brand blue |
| `--primary-foreground` | `#ffffff` | | |
| `--secondary` | `#D7F0FC` | | ice blue |
| `--secondary-foreground` | `#0A2540` | | |
| `--muted` | `#E6F5FD` | | |
| `--muted-foreground` | `#335B74` | | slate blue — rarely used |
| `--accent` | `#F0F9FF` | | |
| `--accent-foreground` | `#0A2540` | | |
| `--destructive` | `#ef4444` | | Tailwind red-500 |
| `--border`, `--input` | `#B8E3F7` | | pale blue borders |
| `--ring` | `#1C99D6` | focus rings | |
| `--card`, `--popover` | `#FFFFFF` + `#0A2540` fg | | |
| `--radius` | `0.5rem` | | single radius token |
| `--primary-nav-height` | `0rem` (runtime: 4rem or 0) | sticky offsets | **conflicting setters:** dead `shop/Navbar.tsx` sets 4rem/3rem; live `navbar.tsx` sets 0rem/8rem |
| `--secondary-nav-height` | `8rem` | | |

## Relume namespace (declared, conflicts)

`globals.css:51-64` — `--color-background-primary #ffffff`, `--color-background-secondary #eeeeee`, `--color-background-tertiary #666666`, `--color-background-alternative #000000`, `--color-border-primary #000000`, `--color-text-primary #000000`, `--color-text-secondary #aaaaaa`, `--color-link-primary #000000`, etc. A parallel black/gray system that overrides nothing but invites drift. `[ASSUMPTION: remnant of a Relume starter; effectively unused by live components]`

## Hardcoded palette in active use (the *real* design system)

| Hex | Role it plays | Locations (sample) | Token equivalent? |
|---|---|---|---|
| `#0A2540` | primary text, navy surfaces | everywhere (~60 files) | `--foreground` — but hardcoded anyway |
| `#1C99D6` | CTAs, links, prices, badges | everywhere | `--primary` — hardcoded anyway |
| `#2599d4` | angled-button motif, nav hover | globals.css:269-423 | near-dup of `#1C99D6` — **third blue** |
| `#1680b0`, `#1597c6` | CTA hover states | cart, checkout, login, footer | **two different hover blues** |
| `#1E3A5F` | stale navy — auth, order-confirmed, 404 | `(auth)/*`, `order-confirmed`, `not-found.tsx`, `error.tsx` | none |
| `#16324F` | mobile drawer bg | `navbar.tsx:284` | none |
| `#5F6B7A` | secondary text | cart, checkout, PDP | none (≈`--muted-foreground` but different hue) |
| `#58585A` | PDP labels | PDP | none |
| `#9CA3AF`, `#6B7280`, `#A0A0A0` | muted grays | footer, cart, drawer | none — three gray scales (blue-gray, warm gray, neutral gray) |
| `#E5E7EB`, `#E1E5EA`, `#F0F0F0`, `#F5F5F5`, `#EAEAEA`, `#E5E5E5` | borders/dividers | cart, drawer, checkout, footer | **six border grays** |
| `#FAFAF9` | auth/order/404 bg | warm off-white | none |
| `#F1F8FC` | selected payment card bg | checkout | ≈accent |
| `#0F834D` | in-stock green | PDP | none — **no success token** |
| `#FFA500` | rating stars | PDP | none |
| `#ef4444`/`red-*`, `amber-*`, `emerald-*`, `orange-*` | status colors | order-confirmed badges, stock dots | Tailwind defaults, no tokens |
| `#111111` | footer headings | footer | none |

**Net:** ~24 one-off hexes in active use; ~10 of them are near-duplicates of each other.

## Typography tokens (as implemented)

| Element | Specified | Where enforced |
|---|---|---|
| h1 | `clamp(2.5rem,5vw,4.5rem)` 40→72px `!important` | `main h1` globals.css:93 |
| h1 (home) | `clamp(2.5rem,5.5vw,4.5rem)` w500 lh0.98 ls-0.04em `!important` | `.homepage-typography` |
| h1 (PDP) | 30/34/40px `!important` via `<style>` in component | `data-product-title` |
| h2 | `clamp(2rem,4vw,3.5rem)` 32→56px `!important` | `main h2` |
| h2 (home) | `clamp(2.125rem,4.5vw,3.5rem)` w500 lh1.05 `!important` | `.homepage-typography` |
| h2 (PDP) | 24/26/28px `!important` | `data-section-title` |
| h3 | `clamp(1.25rem,1.5vw,1.5rem)` `!important` | `main h3` |
| footer h1–4 | `1.125rem` `!important` | globals.css:108 |
| p | 16px / lh1.6 | `p {}` |
| button | 14px | `button, a[role=button]` |
| badge | 14px (declared) but shadcn badge = `text-xs` 12px | **conflict** |
| nav links | 10px → 12px xl, uppercase, tracking-wider | navbar.tsx:450 |
| mobile drawer nav | 20px semibold | navbar.tsx:323 |

**Families:** `font-google-sans-flex` (headings/logo/homepage/drawer/footer), Inter (body default via `body{}`), Poppins (`--font-poppins`, only in dead `shop/Navbar.tsx`). Three fonts shipped; one is dead weight.

## Spacing scale

No custom tokens — Tailwind default 4px scale + heavy arbitrary values: `pt-[220px]`, `px-[5%]`, `max-w-[1280px]`, `max-w-[400px]`, `w-[85vw]`, `h-[46px]`, `h-[48px]`, `h-[44px]`, `h-[60px]`, `h-[52px]`, `py-[6px]`, `p-[3px]`, `tracking-[0.15em]`, `tracking-[0.05em]`, `leading-[1.1]`. ~No rhythm documentation.

## Radius scale (as used)

| Value | Where |
|---|---|
| `rounded-none` (0) | checkout inputs/CTAs, cart CTAs, variant chips 4px, angled buttons, nav items |
| `rounded-[4px]` | PDP selector chips, segmented control |
| `rounded-[6px]` | segmented control wrapper |
| `rounded-lg` (8px = --radius) | auth inputs, buttons, pagination, order-confirmed outline btn |
| `rounded-[10px]` | footer newsletter (l/r split) |
| `rounded-xl`/`2xl` | order card, auth card |
| `rounded-4xl` | badge (pill) |
| `rounded-full` | stock dots, grid toggle, cart badge |

## Shadow / elevation

`shadow-sm` (nav, auth card, order card), `shadow-2xl` (cart drawer). No scale.

## Z-index (observed)

| Layer | Value |
|---|---|
| sticky PLP toolbar | `z-50` |
| nav header | `z-[60]` |
| cart backdrop | `z-[60]` (**collides with nav**) |
| cart drawer | `z-[70]` |
| mobile categories sheet | `z-40` |
| radix viewport/nav | default |
No scale; magic numbers.

## Motion

Durations: `150ms`, `200ms`, `300ms` transitions (angled buttons, hovers), `duration-300/500/700` carousel reveals. Easings: `ease-in-out`, `ease-out`, `transition-colors`. Embla autoplay 5000ms. No tokens, no reduced-motion handling.

## Grid & containers

Breakpoints: Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280). `useIsMobile` hook (768px). Containers: `max-w-2xl/3xl/6xl`, `max-w-[1280px]`, `md:max-w-[95%]`, `container` (Tailwind default, centered) — five different content widths.

## Dark mode

**MISSING — not implemented.** `dark:` classes exist inside shadcn primitives only.
