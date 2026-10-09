# 11 — Design Brief (To-Be)

## Overview

Aircons Store sells and installs air conditioning across South Africa — a high-consideration, service-attached purchase (units R8k–R45k + installation + maintenance + warranty). The engineering (server-side pricing, variant system, kit configurator, WhatsApp-first communication, guest checkout) is production-grade. The design layer must now match it: **a trustworthy, systematic, South-African-pragmatic ecommerce experience** that carries a customer from "which aircon do I need?" to a paid order without a single broken promise.

## Brand vision & positioning

**Positioning:** The expert, no-nonsense aircon partner — not a box-shifter, not a luxury showroom. Sell *comfort delivered and installed properly*, not hardware.

**Brand idea:** "Climate, handled." — every touchpoint reduces uncertainty (right size, real price, real installation, real support).

## Target audience & personas

| Persona | Need | Design implication |
|---|---|---|
| **Homeowner Hannes** (35–55, suburban, mobile-first, WhatsApp native) | "What size for my lounge, installed, what total?" | Room-size guidance, all-in pricing, WhatsApp contact, minimal typing |
| **Body-corporate Brenda** (commercial, enquiry-only) | Quotes, specs, phases | "Price TBC" enquiry path, spec-forward cards, professional tone |
| **Landlord Lindiwe** (repeat buyer, price-sensitive) | Deals, financing, fast reorder | Deals page, account order history, "from R/month" messaging |
| **Installer/contractor** (B2B edge) | Bulk, kits, spec sheets | Dense spec tables, kit configurator |

## Brand personality & tone

- **Pragmatic expert** — says "Covers rooms up to 40 m²" not "experience ultimate climate bliss".
- **Warm but direct** — South African service register; contractions OK; no exclamation marks except genuine celebration (order confirmed).
- **Transparent** — prices, stock, delivery and terms visible before commitment. "Price TBC" replaced by "We'll confirm pricing within X".
- Voice: "We'll handle it." Never: "Experience the difference!", "Amazing deals!!!"

## Design principles

1. **No dead ends.** Every link, button and control works or doesn't ship. (Direct response to ~15 broken routes + dead search + dead OAuth + fake pagination.)
2. **Price honestly, early.** Total cost — unit + install + kit + plan — visible before checkout begins.
3. **One blue, one navy.** Brand means discipline; tokens, not hexes.
4. **Big-ticket calm.** Generous whitespace, one dominant action per view, no urgency theatre beyond real stock/deals.
5. **Mobile is the storefront.** Most SA traffic is mobile; every pattern must work one-handed on a 360px screen over LTE.
6. **Accessible means accessible.** WCAG 2.2 AA is a launch gate, not a backlog item.
7. **Motion earns its place.** Motion communicates state change; it never loops unattended.

## Mood & visual direction

- Clean, cool, technical-confidence: white surfaces, navy ink, one confident sky-blue action color, pale-blue tints for surfaces.
- The existing **angled-corner motif** (`.aircon-angled-button`) is the most ownable visual asset — formalise it as the brand's signature detail (primary CTA corners, active nav indicator, card corner accents) rather than a one-off hover trick.
- Imagery: real installations and real units on light backgrounds; avoid stock-lifestyle clichés.

## Color system (to-be)

```css
/* Brand ramp — tokenized, AA-safe */
--color-navy-900: #071B2E;   /* deepest surface (footer, drawer) */
--color-navy-800: #0A2540;   /* primary ink / dark surface */
--color-navy-700: #16324F;   /* drawer (existing, adopted as official) */
--color-blue-600: #0E7BB0;   /* AA-safe interactive blue (replaces #1C99D6 for text/small) */
--color-blue-500: #1C99D6;   /* brand blue — large display + fills only */
--color-blue-100: #D7F0FC;   /* tint surface */
--color-blue-50:  #F0F9FF;   /* wash */
/* Semantic */
--color-success: #0F834D; --color-warning: #B45309; --color-danger: #DC2626; --color-info: var(--color-blue-600);
/* Neutrals (single cool-gray ramp, replaces 6 ad-hoc grays) */
--color-gray-900:#111827; --color-gray-700:#374151; --color-gray-500:#5F6B7A;
--color-gray-400:#8A94A3; --color-gray-200:#E5E9EE; --color-gray-100:#F1F4F7; --color-gray-50:#F8FAFB;
```

Rules: `#1C99D6` never carries text <18px/14px-bold; body text = navy-800 or gray-700 on white; retired: `#1E3A5F`, `#2599d4`, `#1680b0`, `#1597c6`, `#58585A`, `#9CA3AF`, `#6B7280`, `#FAFAF9`, `#A0A0A0`, all `#E5E7EB`-family duplicates, `#111111`.

## Typography system

- **Display/brand:** Google Sans Flex (already licensed/shipped) — headings, logo, prices.
- **Body/UI:** Inter — all commerce text.
- **Retire Poppins** (dead weight).
- Scale (one system, no `!important`, CSS vars): Display 56/64, H1 40/48, H2 32/40, H3 24/32, H4 20/28, Body-L 18/28, Body 16/26, Small 14/20, Caption 12/16, Overline 11/16 uppercase .08em. Nav links min 13px.

## Spacing & layout

- 4px base grid, spacing tokens `--space-1..24` = Tailwind defaults.
- **One container:** `--container: 1280px`, `px-4 sm:px-6 lg:px-8`. Kill `max-w-[95%]`, `px-[5%]`, `max-w-6xl` variants → `container` utility everywhere.
- Header reduced to ≤72px desktop (logo h-10) / 56px mobile; single sticky offset var `--header-h` replaces the dual nav-height vars.
- No more `pt-[220px]` magic offsets — pages use `pt-[var(--header-h)+2rem]` equivalent.

## Iconography

Lucide exclusively (remove `react-icons` + inline SVGs). Sizes: 16/20/24 mapped to `size-4/5/6`. Stroke 2px default, 1.5 decorative. Rating stars = Lucide `Star` with `fill`, in `amber-500`, wrapped in `role="img" aria-label`.

## Imagery & art direction

- `next/image` everywhere; aspect tokens 1:1 (cards), 4:3 (PDP gallery), 16:9 (heroes), 21:9 (banners).
- Rename `/public/Hero Images/` → `/public/hero/`; define alt-text convention ("{Brand} {BTU} BTU wall-split indoor unit").
- Lifestyle photography: real SA homes/installations; consistent cool-white grade.

## Motion principles

- Duration scale: `--dur-fast 120ms`, `--dur-base 200ms`, `--dur-slow 350ms`; easing `ease-out` for entrances, `ease-in-out` for moves.
- **Global kill-switch:** `@media (prefers-reduced-motion: reduce)` disables carousel autoplay + non-essential transitions.
- Autoplay requires visible pause + stop-on-focus/hover. No animation may loop >3 cycles unattended.

## Component library plan

- Keep shadcn/Radix foundation; **wrap every commerce pattern** (Price, ProductCard, CartLineItem, OrderSummary, PaymentMethodCard, Stepper, EmptyState, Skeleton) as named components — specs in `13-component-specs.md`.
- Variants enforced by design review: commerce code may not pass color/radius className overrides to primitives (lint rule or convention).
- Delete ~17 dead components + dead Navbar/MobileMenu + Poppins.

## Accessibility standards

- WCAG 2.2 AA minimum; contrast ≥4.5:1 text, ≥3:1 UI/large.
- Every overlay = Radix (focus trap, Esc, restore). Icon-only controls require `aria-label`.
- Focus ring: `--ring` visible on all interactive elements, never `outline-none` without replacement.
- Skip link on every page. One h1 per page.
- Touch targets ≥44×44px on mobile.

## Responsive strategy

- Mobile-first; breakpoints sm/md/lg/xl only.
- ≥44px targets, sticky mobile "Add to cart" bar on PDP, mobile checkout shows collapsible order summary + sticky total/CTA footer.
- Tables → card lists below md (account orders, admin later).

## Dark mode strategy

- Phase 3+ decision. Recommendation: **defer** (effort vs. value for this audience); strip dead `dark:` classes now to prevent accidental partial theming.

## Content design guidelines

- Brand name: **"Aircons Store"** everywhere.
- CTAs sentence-case, verb-first ("Add to cart", "Place order", "Get a quote" — and only call it a quote when it's actually a quote).
- Money: `R 12 999` (non-breaking space, thin space thousands) via one `formatZAR` util.
- Errors: say what happened + what to do ("We couldn't process payment. Try again or pay by EFT instead.").
- No fake UI copy (newsletter must subscribe or be removed; placeholder phone replaced).

## Admin design guidelines

Admin is **not built**. When built (spec in `14-page-specs.md`): dense-light theme, same token ramp, table-first, keyboard-friendly; recommended stack = shadcn `table`+`form` primitives already in repo. Treat as phase 2+, separate surface.

## Success metrics for design

- 0 clicks on dead controls (instrument: track click→no-navigation events).
- Search usage → PDP rate; filter usage rate.
- Checkout start→submit conversion; field-level error rate.
- Cart abandonment rate; PDP→ATC rate.
- axe/Lighthouse a11y ≥95, zero criticals.
- CLS <0.1, LCP <2.5s on PDP (image system).
- Bounce rate on /shipping, /returns, /faq after creation.

## Out of scope

- Rebrand/logo redesign. · Admin build (spec'd, not scheduled). · Native app. · Dark mode (deferred). · Marketing site/blog CMS.

## Open questions

See `17-open-questions.md` — brand confirmation, real contact details, delivery pricing model, financing partners, whether Payfast returns, admin ownership.
