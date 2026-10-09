# 03 — Component Inventory As-Is

Status legend: **LIVE** = rendered in production routes · **DEAD** = imported nowhere (verified via import graph) · **PARTIAL** = exists but under-used/broken.

## shadcn/ui primitives (`src/components/ui/`)

| Component | Status | Notes |
|---|---|---|
| accordion | LIVE | filter sidebar, mobile categories |
| aspect-ratio | LIVE | product cards |
| badge | LIVE | cart count, deal/status badges; always className-overridden |
| breadcrumb | LIVE | PDP only (PLP hand-rolls its own) |
| button | LIVE | 6 variants × 9 sizes; commerce code overrides styles per-instance |
| card | LIVE | auth, order-confirmed, product cards |
| carousel (embla) | LIVE | hero, reviews |
| checkbox | LIVE | filters, consent |
| context-menu | DEAD | imported nowhere in pages |
| dialog | LIVE | kit/maintenance modals (probably via wrapper), InstallationKitModal, MaintenancePlanModal |
| dropdown-menu | LIVE | nav internals |
| field | DEAD/PARTIAL | shadcn field primitive not used by checkout (raw Label+Input) |
| input | LIVE | auth, checkout, newsletter |
| input-group | DEAD | |
| label | LIVE | |
| navigation-menu | LIVE | desktop nav (flat links only — mega-menu machinery dormant) |
| radio-group | DEAD in checkout | checkout hand-rolls `<input type=radio>` + label cards instead |
| select | LIVE | PLP sort only; checkout uses raw `<select>` |
| separator | LIVE | filters |
| sheet | LIVE | mobile menu, categories, mobile filters |
| slider | LIVE | price range |
| table | DEAD (storefront) | imported nowhere in live pages |
| tabs | LIVE | PDP info tabs (ProductInfoTabs) |
| textarea | LIVE | checkout notes |
| tooltip | DEAD | |

## Commerce components (`src/components/shop/`)

| Component | Status | Notes |
|---|---|---|
| `ProductCard.tsx` (shop) | LIVE | `AirconProductList` + card + `DealCard` w/ countdown; 538 lines; stock states, spec bullets, % saved |
| `Navbar.tsx` | **DEAD** | replaced by `shadcnblocks/navbar.tsx`; links to 8+ non-existent routes |
| `MobileMenu.tsx` | **DEAD** | only imported by dead Navbar |
| `NavbarWrapper.tsx` | LIVE | feeds flat menu to shadcnblocks navbar |
| `CartDrawer.tsx` | LIVE | custom overlay div — **not** a Radix Sheet; a11y fail; includes `CartRecommendations` |
| `CartProvider.tsx` | LIVE | context + localStorage cart |
| `CartRecommendations.tsx` | LIVE | "You may also like" in drawer |
| `FilterSidebar.tsx` | LIVE | URL-param filters; auto-injects default BTU params on category pages |
| `CommercialFilterSidebar.tsx` | LIVE | commercial page variant |
| `InstallationKitModal.tsx` | LIVE | kit configurator modal |
| `MaintenancePlanModal.tsx` | LIVE | plan picker modal |
| `WarrantySelector.tsx` | LIVE | warranty options |

## Marketing/home components (`src/components/`)

| Component | Status | Notes |
|---|---|---|
| `hero-section.tsx` | LIVE | embla autoplay 5s, unstoppable; hero product card w/ price+rating |
| `category-carousel.tsx` | LIVE | scroll-snap strip, `.scrollbar-hide` |
| `ServiceInfoSection.tsx` | LIVE | |
| `accredited-brands.tsx` | LIVE | brand logo row |
| `AirconsShowcase.tsx` | LIVE | |
| `product-list9.tsx` | LIVE | featured products |
| `EditorialSection.tsx` | LIVE | |
| `customer-reviews-carousel.tsx` | LIVE | staggered reveal animations; `customer-reviews-section.tsx` likely DEAD sibling |
| `help2.tsx` | LIVE | support CTA section |
| `premium-footer.tsx` | LIVE (home only) | dead links + fake newsletter + placeholder phone |
| `CookieConsentBanner.tsx` | LIVE | gtag consent mode |
| `price.tsx`, `rating.tsx` | PARTIAL | only consumed by hero-section — not PLP/PDP/cart |
| `product-list4.tsx`, `product-list6.tsx` | **DEAD** | |
| `product-categories1–5.tsx` | **DEAD** | 5 variants, none imported |
| `premium-product-card.tsx` | **DEAD** | |
| `ProductCard.tsx` (root) | **DEAD** | superseded by shop/ProductCard |
| `ProductVariantCard.tsx` | **DEAD** | |
| `ecommerce-hero3.tsx`, `ecommerce-footer20.tsx` | **DEAD** | shadcnblocks leftovers |
| `order-history4.tsx` | **DEAD** | live history = `account/OrderHistory.tsx` |
| `trust-strip1.tsx`, `incentives1.tsx`, `feature-cards.tsx`, `logo-carousel.tsx`, `EditorialSplit.tsx` | **DEAD** | relume leftovers |
| `shadcnblocks/header-9.tsx`, `layout-239.tsx`, `product-header-5.tsx`, `why-choose-aircons-store.tsx`, `installation-experience-sections.tsx`, `ecommerce-navbar2.tsx` | DEAD/PARTIAL | `layout-239` + `why-choose` may be referenced on service pages [ASSUMPTION: check per page]; rest dead |

## State coverage matrix

| Component | Default | Hover | Focus | Active | Disabled | Loading | Error | Empty |
|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ ring | ✓ translate | ✓ opacity | ✗ none built-in | aria-invalid ring | — |
| Input | ✓ | — | ✓ ring | — | ✓ | — | aria-invalid | — |
| Card | ✓ | — | — | — | — | ✗ | ✗ | ✗ |
| ProductCard | ✓ | ✓ | partial | — | sold-out badge | ✗ | ✗ | — |
| CartDrawer | ✓ | — | ✗ no trap | — | — | ✗ | ✗ | ✓ empty |
| Modal (kit/maint.) | ✓ | — | Radix ✓ | — | — | ✗ | ✗ | — |
| Toast | mounted | — | — | — | — | — | — | **never invoked** |
| Skeleton | ✗ MISSING | | | | | | | |
| Stepper | ✗ MISSING | | | | | | | |
| Empty/Error state comps | ✗ MISSING (ad-hoc divs) | | | | | | | |

## Consistency verdicts

- **Two footers built** (`premium-footer` live-home-only, `ecommerce-footer20` dead). **Zero global footer.**
- **Two navbars built** (one dead). Live nav ≠ dead nav's link set — shows an abandoned redesign.
- **Three product cards** (`shop/ProductCard` live; root `ProductCard`, `premium-product-card`, `ProductVariantCard` dead).
- **Button:** one primitive, ~15 ad-hoc restyles (`bg-[#1C99D6] rounded-none h-[48px]` repeated verbatim in ≥6 files).
- **Price:** three formatters — `formatZAR` ("R " prefix), `Intl currency ZAR` ("ZAR"/"R" output varies), `price.tsx` Price component — produce visually different strings.
