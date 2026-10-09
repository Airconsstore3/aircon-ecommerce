# ECOMMERCE FIX PLAN — Aircons Store

Status after this pass: **items 1–22 all implemented in code**; the DB-side items
(9, 10 — anon INSERT revoke + settings RLS) ship in
`supabase/migrations/20260925_audit_hardening.sql` and **must be applied in the
Supabase dashboard** (not yet applied — verify policies after running).
Verified: tsc clean, `next build` passes on 16.3.6, 13/13 tests, smoke 200s +
real 404s. Ops follow-ups that remain: rotate `ORDER_WEBHOOK_SECRET` (it's in
git history), set production env vars before enabling Payfast, sandbox-test an
ITN end-to-end.

| # | Sev | Finding | Root cause | Fix | Files | Risk of fix | Test | Rollback |
|---|-----|---------|-----------|-----|-------|------------|------|----------|
| 1 | P0 | Next.js 16.2.6 has 2 critical RCE CVEs + cache-confusion advisories | pinned version pre-dates patches | `next`/`eslint-config-next` → 16.3.6 | package.json | low — minor bump | build + dev smoke | `git revert`, reinstall |
| 2 | P1 | ITN: spoofable IP check, `127.0.0.1` whitelisted, missing-IP skip, no Payfast server validation, passphrase optional → forged "paid" possible | layered checks incomplete | trusted IP = `x-real-ip` else rightmost XFF; drop localhost unless `NODE_ENV!=='production'`; add POST to Payfast `/eng/query/validate`; warn-and-reject if passphrase unset while payfast enabled | `src/app/api/payfast/itn/route.ts`, `src/lib/payment/payfast.ts` | low — payfast currently disabled; new path must be sandbox-tested before going live | unit: signature+IP helpers; manual sandbox ITN | revert file |
| 3 | P1 | `markWhatsAppSent(orderId)` unauthenticated order mutation | action takes no token | require `secureToken`, verify match before update | `checkout/actions.ts`, `CheckoutClient.tsx`, `WhatsAppButton.tsx` | low | call with wrong token → no update | revert |
| 4 | P1 | Non-atomic order creation; item/payment insert failures swallowed | 3 sequential inserts, errors logged only | on failure delete the order row (compensation) and return error; keep `status='submitted'` at insert (stop pre-setting `sent_whatsapp`) | `checkout/actions.ts` | low — failure path only | simulate insert error | revert |
| 5 | P1 | Client-trusted `installation_tier_id` → underpayment / free installation | tier id used before BTU match | server derives tier from `product.btu_range`; client id only honoured if it matches the derived tier; enquiry-tier → installation dropped from priced line | `src/lib/server-pricing.ts` | medium — changes priced total for edge configs; matches what UI intends | unit test: forged tier id on 24k BTU product → 2750 not 1950 | revert |
| 6 | P1 | Deal in cart ⇒ entire checkout fails | cart stores `deal.id`, resolver queries `products` | `DealAddToCartButton` adds `deal.product_id` (linked product) when present; deals without product link get no add-to-cart | `deals/[slug]/DealAddToCartButton.tsx`, `deals/[slug]/page.tsx` | low | add deal → checkout succeeds | revert |
| 7 | P1 | PostgREST `in` filter injection via cart IDs | raw `join(",")` into filter | extract UUIDs first; abort if none | `cart/recommendations.ts` | none | unit/manual: composite ids | revert |
| 8 | P1 | `order-email`: optional secret, committed secret, unescaped HTML | edge fn skips auth when env unset; `name`/`notes` raw in HTML | escape HTML; fail closed when `ORDER_WEBHOOK_SECRET` unset; rotate secret | `supabase/functions/order-email/index.ts` (+ ops: rotate) | low | send test webhook | revert |
| 9 | P1 | `anon` INSERT grant on `orders` — PostgREST spam bypass | leftover from pre-service-role checkout | `REVOKE INSERT FROM anon` + drop `Public can submit orders` policy | new migration `20260925_audit_hardening.sql` | none — app uses service role | checkout still inserts via service role | re-grant |
| 10 | P1 | `settings` readable by ANY authenticated user | policy `USING (true)` to `authenticated` | restrict SELECT to `admins` members | same migration | low — server uses service role | anon/auth select denied | re-create permissive policy |
| 11 | P1 | `/collections/[slug]` breadcrumb links 404 | breadcrumbs emit route that doesn't exist | add `src/app/(shop)/collections/[slug]/page.tsx` listing collection products | new page | low | visit a product with collection breadcrumb | remove links instead |
| 12 | P2 | Duplicate `generate_lead` conversions, no transaction_id | fires on every mount | sessionStorage dedup by order id; add `transaction_id` | `order-confirmed/[token]/LeadTracking.tsx` | none | refresh page → single event | revert |
| 13 | P2 | Soft-404 on missing product/deal | renders 200 | `notFound()` | product + deal pages | none | bad slug → real 404 | revert |
| 14 | P2 | Stale combined migration re-opens orders RLS hole | `20260813_combined_migration.sql` recreates dropped insecure policy | add explicit drop of the insecure policy at end of that file (keeps file runnable) | `supabase/migrations/20260813_combined_migration.sql` | none | diff review | revert |
| 15 | P2 | `expires_at` 48h hides banking details from slow EFT payers | hard gate in confirmation query | extend visibility: don't expire while `payment_status='pending'`+`manual_eft` (query drops `expires_at` gate for EFT; token still required) | `order-confirmed/[token]/page.tsx` | low | EFT order >48h still viewable | revert |
| 16 | P2 | `is_sold_out` products orderable via crafted request | resolver doesn't check stock flags | reject sold-out items in `resolveOrderPricing` | `src/lib/server-pricing.ts` | low | sold-out id → checkout error | revert |
| 17 | P2 | Root metadata says "CoolAir — Cape Town" | stale copy | update title/description to Aircons Store | `src/app/layout.tsx` | none | view-source | revert |
| 18 | P2 | robots misses `/cart`, `/account` | — | add disallows | `src/app/robots.ts` | none | robots.txt output | revert |
| 19 | P2 | `getWhatsAppNumber` `.single()` brittle | multi-row settings → throw | `.limit(1).maybeSingle()` | `checkout/actions.ts` | none | — | revert |
| 20 | P2 | Dead code: `anonClient` in actions.ts, `mock-data.ts`, `mock-products.ts`, `getEnabledPaymentMethods`, debug-*.js, `globals (1).css` | leftovers | delete dead files/vars (scripts/*.js kept: still referenced by docs? check first — `scripts/run-migrations.js` referenced in docs; keep scripts dir, remove root debug files) | various | none | lint clean on those files | git revert |
| 21 | P2 | `residential≤32000 / commercial≥40000` gap → 32–40k BTU units invisible in category pages | inconsistent cutoffs in `filterProducts` vs filter chips | unify on `>=32001` for commercial | `src/lib/filterProducts.ts` | low — more products show on commercial page | verify listing counts | revert |
| 22 | P2 | `submitCheckout` returns raw error messages | `error.message` passthrough (incl. zod JSON) | map ZodError → field message; generic otherwise | `checkout/actions.ts` | none | submit invalid → readable error | revert |
| — | P2/P3 | Documented, not changed: fake `getPlaceholderRating` reviews (business/legal decision); `orders.items` JSONB duplication; integer-rand money model; `kit_configuration: z.any()`; 48h token expiry policy; Payfast amount `Math.round` tolerance (±R0.49); `variant_id` never populated; missing `/collections` sitemap entries; `shadcn` in prod deps | — | see audit doc §6 | — | — | — | — |

## Apply order
1. Migration SQL (items 9, 10) — run in Supabase SQL editor, then verify:
   `select * from orders` as anon → permission denied.
2. Code fixes — this pass.
3. `next@16.3.6` upgrade — then `pnpm build`, `pnpm lint`, `pnpm test`, smoke the
   dev server (home → product → add → checkout EFT → confirmation).
4. Rotate `ORDER_WEBHOOK_SECRET` (env + migration trigger function).
5. Before enabling Payfast in `payment_providers`: set `PAYFAST_*` envs incl.
   passphrase, sandbox-test an ITN end-to-end.
