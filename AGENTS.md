# Aircons Store — Project Guide

## Build & Test Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build (Next.js 16 + Turbopack)
- `npm run lint` — ESLint
- `npm run test` — Vitest (payment security + phone normalization tests)

## Architecture
- **Frontend:** Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Database:** Supabase (Postgres), 438 published products, 194 parent products, 244 variants
- **Payments:** Payfast (currently DISABLED in DB) + Manual EFT (enabled)
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
- `src/lib/payment/payfast.ts` — Payfast implementation (signature, webhook verify)
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
