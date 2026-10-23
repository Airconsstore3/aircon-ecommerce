# Aircons Store — Project Guide

## Build & Test Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build (Next.js 16 + Turbopack)
- `npm run lint` — ESLint
- `npm run test` — Vitest (payment security + phone normalization tests)

## Architecture
- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Database:** Supabase (Postgres), 438 published products, 194 parent products, 244 variants
- **Payments:** Manual EFT only — enquiry model: order submitted → availability confirmed manually (owner sets `status='confirmed'` in Supabase) → banking details shown → EFT paid manually. Payfast was removed entirely (2026-10-09).
- **Delivery:** `orders.delivery_tier` — `cape_town_free` | `quoted` | `quote_on_type`. Fees are quoted manually; never hardcode rates.
- **Deals:** `/deals` removed (301 → /). `deals` table rows deactivated.
- **Rate limiting:** Upstash Redis (optional — gracefully skips if not configured)
- **CAPTCHA:** Cloudflare Turnstile (optional — gracefully skips if not configured)

## Critical Security Notes
- `src/lib/supabase-service.ts` exports `serviceRoleClient` which bypasses RLS.
  It is ONLY imported in server-side files (server actions, API routes, server
  components). Never import it in a `"use client"` file.
- The `orders` table had TWO critical RLS vulnerabilities that allowed anon to
  read ALL orders (names, phones, emails, totals, secure_tokens):
  1. "Public can read own order by token" — used `secure_token IS NOT NULL` (always true)
  2. "allow_select_own_recent_order" — allowed reading any order < 5 minutes old
  Both were dropped via migrations applied to production on 2026-08-17:
  - `supabase/migrations/20260817_fix_orders_rls_security.sql`
  - `supabase/migrations/20260817b_drop_remaining_insecure_orders_policy.sql`
  **APPLIED & VERIFIED** — anon can no longer SELECT from orders.
  Only `public_can_submit_orders` (INSERT with consent) remains.
- The order-confirmed page (`src/app/order-confirmed/[token]/page.tsx`) uses the
  service role client and validates UUID format + secure_token match + expiry.
  It also rate-limits lookups via Upstash Redis.

## Payment Provider Architecture
- `src/lib/payment/types.ts` — shared interfaces (PaymentProvider, params, results)
- `src/lib/payment/registry.ts` — provider registry (registerProvider/getProvider)
- `src/lib/payment/provider.ts` — re-exports types/registry, imports providers,
  and exposes `getEnabledProviders()` from the DB
- `src/lib/payment/manual-eft.ts` — Manual EFT implementation (redirect to confirmation)

**Why the split:** provider.ts imports payfast.ts and manual-eft.ts as side-effect
imports (they call `registerProvider()` at load time). If the registry lived in the
same file as those imports, the `providers` const would hit a temporal-dead-zone
(TDZ) error because ESM imports are hoisted. The registry is in a separate module
so it's fully initialized before any provider module loads.

## Pricing Security
- All prices are resolved server-side at checkout time via
  `src/lib/server-pricing.ts` → `resolveOrderPricing()`.
- Client-sent prices are NEVER trusted. The client only sends configuration
  (kit IDs, tier IDs, plan IDs) and the server re-resolves prices from the DB.
- Installation tiers, kit config, maintenance plans, and warranty options are all
  fetched from Supabase tables with hardcoded fallbacks only used if the DB is
  unreachable.

## Storefront Navigation
- `src/components/shop/NavbarWrapper.tsx` configures the header links and category image thumbnails; `src/components/shadcnblocks/navbar.tsx` renders the responsive header.
- Header search submits `q` to `/products`; `ProductsClient.tsx` filters the loaded catalogue by name, brand, BTU, and type, alongside existing filters.
- The header measures its height with `ResizeObserver` and updates `--secondary-nav-height`; use that variable for sticky content offsets.

## Homepage Hero
- `src/components/hero-section.tsx` is a static server-rendered four-card layout. It uses local equipment images and links to residential, commercial, installation, repairs, and maintenance pages.
- `.shop-layout .storefront-hero` typography rules in `src/app/globals.css` override the larger global homepage heading sizes only inside these compact cards.

## Aircon Catalogues
- `src/app/(shop)/categories/[slug]/ResidentialCategoryClient.tsx` provides the shared residential/commercial layout. The category page passes `categoryKind` to select banner content; both pages have compact spacing and brand/BTU chips using the existing URL filters.
- Residential capacity chips use the room-size guide. Commercial chips show indicative areas based on 600 BTU/m² up to 60,000 BTU; larger systems display “Site sizing”. The commercial note explains heat-load factors and the need for a site assessment.
- `.shop-layout .aircon-catalogue` typography rules in `src/app/globals.css` keep the catalogue heading and banners compact despite the global heading size overrides.

## Accessories Catalogue
- `/categories/accessories` uses compact `AccessoryProductCard` cards with direct cart actions and URL-backed category chips.
- Physical accessories are explicitly classified using `products.specs.accessory_kind`: `brackets`, `installation-kits`, `wifi-modules`, `remotes`, or `pipes-trunking`. Unclassified service rows and pump/geyser products are excluded by `src/lib/accessories.ts` and `filterProducts.ts`.
- `node scripts/seed-accessories.mjs` previews the starter catalogue; `--apply` inserts missing products only, without overwriting existing rows. Ten starter products were published on 2026-10-13 with owner-approved ballpark prices, placeholder photos and unconfirmed stock. Replace photos and verify prices/compatibility before fulfilment.
- `/accessory-placeholder.svg` is the shared placeholder for detail/cart views. `getAccessoryCardImage()` reuses local bracket and copper-kit artwork on catalogue cards with illustrative-image labels; actual product photos take precedence. Other unmatched products retain category icons. Aluminium kits do not use copper artwork, and the universal remote does not use branded remote photos.

## Installation Catalogue
- `/installation` is the Installation Packages menu destination and a compact ecommerce catalogue using `AccessoriesCategoryClient` with `catalogueKind="installation"`; the old `Layout239` landing sections are no longer rendered there. Legacy `/categories/kits` links redirect to `/installation?kind=installation-kits` instead of the old generic category page.
- `filterProducts(..., "installation")` combines published installation service products with explicitly classified brackets, installation kits and pipes/trunking. `getInstallationKind()` excludes pumps, geysers, pool equipment and unrelated service plans.
- Installation services can be classified with `specs.accessory_kind="installation-services"`; legacy installation-named accessory rows in the `installation` category are also supported. Quote-only service cards add the actual product to the basket with `is_enquiry_only` preserved. No booking date is promised.

## Variant System
- Products use a parent-child model: `is_parent_product = true` for parents,
  `parent_product_id` points to the parent for variants.
- `variant_attributes` (JSONB) stores per-variant attributes (btu, phase, model, etc.)
- The product detail page dynamically renders selectors for attributes that vary
  across variants. BTU is rendered separately as "Available Sizes".

## Known Issues (Non-Blocking)
- `src/lib/mock-data.ts` and `src/data/mock-products.ts` are dead code (not
  imported anywhere). Safe to delete.
- `mapSupabaseProductToVariant` in `src/lib/fetch-featured-products.ts` is
  defined but never used.
- `INSTALLATION_TIERS` in `ProductDetailClient.tsx` is a display-only fallback
  that duplicates the DB-driven `installation_tiers` table. The server always
  re-resolves from the DB at checkout.
- ESLint reports 15 errors in `src/`, all `react-hooks/set-state-in-effect`.
  These are legitimate React patterns (localStorage hydration, matchMedia sync,
  carousel API sync) and not bugs. Fixing them would require `useSyncExternalStore`
  refactors that change the implementation pattern.

## Audit Docs (2026-09-25)
- `ARCHITECTURE_AUDIT.md` — full system audit, bug register, lifecycle traces.
- `ECOMMERCE_FIX_PLAN.md` — severity-ranked fix list (all code fixes applied).
- `supabase/migrations/20260925_audit_hardening.sql` — revokes stale anon
  INSERT on orders + restricts settings to admins. **Must be applied manually
  in the Supabase dashboard.**
- `ORDER_WEBHOOK_SECRET` is in git history — rotate before relying on it.
