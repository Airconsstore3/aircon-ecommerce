# Design Audit — Executive Summary

**Product:** Aircons Store — South African air conditioning ecommerce (sales, installation, maintenance, repairs)
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4 (CSS-first), shadcn/ui (`radix-nova`), Radix UI, Relume blocks, Embla Carousel, Sonner, Supabase
**Audit date:** 2026-10-09 · **Scope:** full storefront codebase (`src/`), `nextadmin-template/` (admin)
**Live URL:** not provided — audit is code-based; screenshot columns describe implemented layout from source.

---

## Verdict

The storefront is a **functionally rich but visually fragmented** build. The engineering is ahead of the design: variant logic, server-side pricing, installation tiers, kit configurator, maintenance plans and warranty options are genuinely sophisticated — but they are presented inside an inconsistent, unfinished visual system that actively undermines trust at the exact moments a customer decides whether to spend R10,000–R40,000.

The codebase reads as **three different design languages layered on top of each other**:

1. **shadcn/Radix token layer** (`bg-primary`, `text-muted-foreground`) — used by `src/components/ui/*` and a few places elsewhere.
2. **A hardcoded "brand" palette** (`#0A2540`, `#1C99D6`, `#5F6B7A` …) repeated ~1,651 times across ~60 files, bypassing the token layer entirely.
3. **A second, stale palette** (`#1E3A5F`, `#16324F`, `#FAFAF9`, `#6B7280`) used by auth, order-confirmed, 404/error, the mobile drawer and the footer — a visibly different navy and gray family from the primary brand.

On top of that sits a **Relume token namespace** (`--color-background-primary: #ffffff`, `--color-text-primary: #000000`) that conflicts with the brand palette, and ~17 dead components imported from shadcnblocks/Relume templates that were never cleaned out.

## Top-line findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Footer exists only on the homepage.** `/products`, `/cart`, `/checkout`, PDP, category, deals, account — none render a footer. Trust links, contact details, legal links and payment logos are absent at every conversion-critical step. | **Critical** |
| 2 | **Navigation and footer link to ~15 non-existent routes** (`/help`, `/faq`, `/shipping`, `/returns`, `/contact`, `/brands`, `/blog`, `/cookies`, `/categories/heat-pumps`, `/categories/portable`, `/categories/kits`, `/book-installation`, `/account/wishlist`, `/account/settings`, `/account/saved`, `/account/alerts`, `/account/recent`). Customers hit 404s from primary chrome. | **Critical** |
| 3 | **Search is a dead control.** The search icon in `src/components/shadcnblocks/navbar.tsx` (`SearchForm`) and the mobile search button have no `onClick`, no input, no route. Search is the #1 discovery pattern for a 438-SKU catalog. | **Critical** |
| 4 | **"Continue with Google" buttons on login and signup are dead.** `src/app/(auth)/actions.ts` has no `signInWithOAuth`; the buttons render but do nothing. A trust-destroying broken promise on the auth screen. | **Critical** |
| 5 | **Hero carousel autoplays every 5s and can never be paused** (`stopOnInteraction:false`, `stopOnMouseEnter:false`, `stopOnFocusIn:false`, no pause control) — WCAG 2.2.2 violation and usability hazard. | **Critical** |
| 6 | **PLP pagination is fake.** Buttons `1 2 3 … 10` render but have no handlers; all 194+ products render in one unfiltered wall. | **High** |
| 7 | **No loading states anywhere.** Zero `loading.tsx`, zero `Skeleton`, zero `animate-pulse`. PDP and checkout give no feedback during data fetch or submit beyond button text. | **High** |
| 8 | **CartDrawer is an inaccessible custom overlay** — no `role="dialog"`, no focus trap, no Escape handling, no focus return. | **High** |
| 9 | **Primary blue `#1C99D6` fails WCAG AA** (≈3.0:1 on white) yet is used for 14px body links, prices and white text on blue CTAs (~3.0:1). | **High** |
| 10 | **Global `!important` typography overrides** (`main h1/h2/h3` clamp rules, `.homepage-typography` block, an inline `<style>` tag inside `ProductDetailClient`) mean the same `h2` renders at three different sizes depending on which page it sits on. | **High** |

## Readiness scores (0–5)

| Dimension | Score | One-liner |
|---|---|---|
| Brand | 2 | Recognisable blue/navy identity exists; three competing navies and no usage rules |
| Visual consistency | 1 | Two palettes, two navbars (one dead), three radius systems, `!important` type wars |
| Design system | 2 | shadcn primitives exist and are solid; everything above primitives is bespoke hardcode |
| UX | 2 | Strong PDP configurator; broken chrome (search, dead links, missing footer) |
| Accessibility | 1 | Unstoppable carousel, inaccessible cart drawer, contrast failures, missing labels |
| Conversion design | 2 | Good cart/PDP mechanics; zero shipping info, fake pagination, no reassurance at checkout |
| Content | 2 | Tone is fine where present; dead links, placeholder phone, fake newsletter, "Airconsstore" |
| Responsive | 3 | Generally responsive grids; mobile drawer is the best-designed surface in the app |
| Admin UX | 0 | **MISSING — not implemented** (`nextadmin-template/` contains only `node_modules`) |
| Motion | 1 | Hover transitions exist; no system, no reduced-motion support, unsafe autoplay |
| **Overall** | **1.6 / 5** | Working store, pre-production design |

## The single most important fix

**Ship a real global footer and repair the navigation link graph.** Every revenue path currently ends on a page with no contact info, no legal links, and nav/footer links that 404. This is the cheapest change with the largest trust recovery: one `<Footer />` in `(shop)/layout.tsx`, plus pruning every dead route or building the six pages that matter (`/contact`, `/faq`, `/shipping`, `/returns`, `/categories/kits`, `/book-installation`).

## What to read next

- `01-design-audit.md` — full evidence-based audit
- `10-gap-analysis.md` — 30 gaps with severity/effort/priority
- `16-design-roadmap.md` — sequenced remediation plan
- `findings.csv` — machine-readable finding register
