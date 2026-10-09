# 04 — Page Inventory

Screenshot descriptions derived from source layout (no live URL provided). ✗ footer = page renders no footer.

## Storefront

| Route | File | Layout summary | Footer | Notes |
|---|---|---|---|---|
| `/` | `(shop)/page.tsx` | Hero autoplay carousel → category carousel → service info → accredited brands → showcase → featured products → editorial → reviews → help → footer | ✓ only here | `homepage-typography` scope; 10 stacked sections |
| `/products` | `products/ProductsClient.tsx` | 450px hero w/ overlay + angled CTAs → optional promo banner → breadcrumb → sidebar filters + sticky **blue toolbar** ("Products", sort, grid toggle) → card grid → fake pagination | ✗ | toolbar `bg-[#1C99D6]` w/ white text; pagination buttons dead |
| `/products/[slug]` | `ProductDetailClient.tsx` (2106 ln) | gallery L / sticky buy column R: breadcrumb, brand, h1, stock dot+rating+tech, price, info tabs, facts, size chips, attribute chips, install toggle, kit modal, maintenance modal, warranty, qty?, Add to cart → related products | ✗ | inline `<style>` overrides h1/h2; radiogroup on install toggle |
| `/categories/[slug]` | `CategoryClient` + Residential/Commercial/Accessories variants | category hero + filter sidebar + grid; commercial gets sticky `.commercial-sidebar` | ✗ | FilterSidebar auto-injects BTU params |
| `/collections/[slug]` | `collections/[slug]/page.tsx` | collection grid | ✗ | |
| `/deals` | `deals/DealsClient.tsx` | deal cards w/ countdown timers | ✗ | has own `deals/layout.tsx` |
| `/deals/[slug]` | `deals/[slug]/page.tsx` | deal detail | ✗ | |
| `/cart` | `(shop)/cart/page.tsx` | `pt-[220px]` → h1 → 1.7fr/1fr grid: line items (img 112px, qty stepper, trash) / sticky order summary (subtotal+add-ons+total+"final total" note) → Checkout CTA | ✗ | remove button has no aria-label |
| `/checkout` | `checkout/CheckoutClient.tsx` | same grid; form: Contact (4 inputs) → Delivery (address/city/province/notes) → Payment radios (DB providers) → Contact-method select → consent checkbox → submit; right: summary | ✗ | Turnstile invisible; honeypot field; WhatsApp option |
| `/order-confirmed/[token]` | `order-confirmed/[token]/page.tsx` | centered 3xl card: payment badge → title → status msg → EFT banking grid → customer details → items+totals → WhatsApp/print/continue btns | ✗ (route outside shop layout) | print CSS; secure-token gated; stale-navy palette |
| `/installation`, `/maintenance`, `/repairs`, `/warranty`, `/about`, `/return-policy` | `(shop)/*/page.tsx` | content pages (shadcnblocks sections) | ✗ | |
| `/privacy`, `/terms` | root-level pages | legal text | ✗ | outside shop layout → **no nav either?** [verify: root layout only adds CartDrawer; these pages may have no chrome at all] |

## Auth (`(auth)/`)

| Route | File | Layout | Notes |
|---|---|---|---|
| `/login` | `login/login-form.tsx` | centered 2xl card on `#FAFAF9`, "Airconsstore" wordmark, email+password, show/hide, forgot link, **dead Google button**, signup link | stale navy `#1E3A5F` |
| `/signup` | `signup/signup-form.tsx` | same card, name fields, pw confirm, dead Google button | |
| `/forgot-password` | `forgot-password/page.tsx` | email card | |
| `/reset-password` | `reset-password/*` | new password card | |
| `/auth/error` | `auth/error/page.tsx` | error card | |

## Account (`account/`)

| Route | File | Layout | Notes |
|---|---|---|---|
| `/account/orders` | `orders/page.tsx` + `account/OrderHistory.tsx` | server-fetched order list | layout = bare auth guard, **no account nav/sidebar** |
| `/account/profile` | `profile/*` | profile form | |
| `/account/subscriptions` | `subscriptions/page.tsx` | list | |
| `/account/warranties` | `warranties/page.tsx` | list | |
| `/account` (index) | — | **route doesn't exist** → nav "Account" links 404? [nav links `/account` root — check: no `account/page.tsx` → **404**] | |

## System

| Route | File | Notes |
|---|---|---|
| 404 | `not-found.tsx` | centered `#FAFAF9`, 404 big, 2 CTAs, stale navy |
| error | `error.tsx` | same pattern + reset() + WhatsApp copy |
| robots/sitemap | `robots.ts`, `sitemap.ts` | |

## Missing pages (linked but non-existent → 404)

`/help`, `/help/center`, `/help/faq`, `/help/tickets`, `/faq`, `/contact`, `/shipping`, `/returns`, `/cookies`, `/blog`, `/brands`, `/brands/*`, `/categories/heat-pumps`, `/categories/portable`, `/categories/kits`, `/book-installation`, `/account` (index), `/account/wishlist`, `/account/settings`, `/account/saved`, `/account/alerts`, `/account/recent`, `/auth/logout` (referenced as href in dead Navbar).

## Admin

**MISSING — not implemented.** `nextadmin-template/` = node_modules only.
