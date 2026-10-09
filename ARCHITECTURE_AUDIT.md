# ARCHITECTURE AUDIT — Aircons Store

Generated: 2026-09-25
Scope: full forensic audit of the repository + production database schema (via migrations)
Method: static code trace of every commerce path, RLS/migration review, dependency audit,
lint/typecheck/test runs. Live DB rows and the production deployment were NOT directly
accessible — items needing runtime verification are marked `UNKNOWN — REQUIRES VERIFICATION`.

> Note: `AUDIT_REPORT.md` (2026-06-29) is stale — it describes the pre-Supabase mock-data
> version of this app. This document supersedes it.

---

## 1. EXECUTIVE SUMMARY

This is a **Next.js 16 storefront backed directly by Supabase Postgres** — there is **no
Medusa, no Stripe, no separate commerce backend**. The prompt's reference architecture
(Medusa, Stripe, regions, payment collections, fulfillments) does not exist here and is
not needed at this scale. The real system is:

- Product catalog in Supabase `products` (flat table; parent/child variants are rows in
  the same table via `parent_product_id`).
- Client-side cart in `localStorage` (no server cart at all).
- Checkout = a single server action that re-resolves all prices server-side (good) and
  inserts `orders` + `order_items` + `payments` via the service-role client.
- Payments: **Manual EFT** (enabled) and **Payfast** (implemented, currently disabled in
  the `payment_providers` table). Payfast status arrives via an ITN webhook.
- Order emails: Postgres trigger → `pg_net` → Supabase Edge Function → Resend.
- Auth: Supabase Auth (email/password) — customer accounts exist but only for order
  history; checkout is guest-only.

**Overall health**: the core security posture is much better than typical vibe-coded
stores — prices are server-resolved, order reads are token-gated, the catastrophic
"anon can read all orders" RLS bugs were already found and fixed (2026-08-17). However
the audit found **2 critical dependency vulnerabilities**, **one unauthenticated order-
mutation server action**, **a PostgREST injection**, **webhook verification gaps**, and
several commerce-logic gaps (deals can't check out, sold-out items orderable,
non-atomic order creation).

---

## 2. ACTUAL ARCHITECTURE

```
                    CUSTOMER
                       |
                       v
              VERCEL (CDN + SSR)                      [no edge/middleware caching of
                       |                               commerce data — correct]
                       v
              NEXT.JS 16 APP ROUTER
              React Server Components + Server Actions
                       |
        +--------------+----------------+
        |              |                |
        v              v                v
  ANON CLIENT      SERVICE-ROLE      SUPABASE AUTH
  (browser + RSC   CLIENT            (cookie session,
   reads, RLS on)  (server actions,   /account only)
        |           API routes)            |
        +--------------+-----------------+
                       |
                       v
              SUPABASE POSTGRES
   products / categories / collections / deals /
   orders / order_items / payments / settings /
   installation_* / maintenance_* / warranty_* /
   payment_providers / admins / promotions
                       |
        +--------------+----------------+
        |                               |
        v                               v
  pg_net trigger                  SUPABASE AUTH
  on orders INSERT                (auth.users)
        |
        v
  Edge Function order-email → Resend API → owner + customer email

  PAYFAST (disabled) ── redirect → customer browser
        |
        └── ITN POST → /api/payfast/itn → order.payment_status = paid
```

### Services that exist
| Service | Present | Notes |
|---|---|---|
| Supabase Postgres | Yes | Sole system of record |
| Supabase Auth | Yes | Customer accounts, order history only |
| Supabase Edge Functions | Yes | `order-email` only |
| Resend (email) | Yes | Via edge function |
| Payfast | Implemented, **disabled** in DB | `is_enabled=false` |
| Manual EFT | Yes (enabled) | Banking details shown on confirmation page |
| Upstash Redis | Optional | Rate-limiting; skipped if env unset |
| Cloudflare Turnstile | Optional | Skipped if `TURNSTILE_SECRET_KEY` unset |
| Google tag/gtag | Partial | Only `generate_lead` + Ads conversion click on confirmation page; no GT/GTM script tag found in code — events may never fire unless gtag injected elsewhere. `UNKNOWN — REQUIRES VERIFICATION` (check whether gtag is installed via a head script outside the repo or Tag Manager) |
| Medusa / Stripe / CMS / Search / Shipping provider | **Absent** | No site search exists at all |

### What happens when...
- **Customer visits** — RSC pages query Supabase with the anon key (RLS: published
  products/deals only). Pages are SSR (`force-dynamic` on /products; most catalog
  pages use the cookie-bound server client so they render dynamically).
- **Views a product** — `/products/[slug]` server component fetches product +
  sibling variants (same `products` table), collections for breadcrumbs, settings
  for shipping/returns, kit/maintenance/warranty configs. Emits Product + Breadcrumb
  JSON-LD.
- **Adds to cart** — 100% client-side; cart item id is a composite
  `<variantRowUUID>-<install>-<kitIds>-<maintenance>-<warranty>`; persisted in
  `localStorage["cart"]`. No server call, no stock reservation.
- **Checks out** — `submitCheckout` server action: zod-validate → rate limit →
  Turnstile → idempotency check → provider enabled check → `resolveOrderPricing`
  (all prices re-read from DB; client prices ignored) → insert `orders`,
  `order_items`, `payments` (sequential, NOT transactional) → returns confirmation
  URL / Payfast redirect URL / wa.me URL.
- **Payment succeeds (Payfast)** — Payfast POSTs ITN → signature + IP + amount
  checks → `orders.payment_status='paid'`, `status='completed'`,
  `payments.status='paid'`.
- **Payment succeeds (EFT)** — admin must manually mark paid. **There is no admin
  UI in this repo** — the `nextadmin-template/` directory is a separate gitignored
  project; in practice order management presumably happens in the Supabase
  dashboard. `UNKNOWN — REQUIRES VERIFICATION`.
- **Browser closes mid-checkout** — order row exists as `payment_status=pending`;
  the confirmation URL (order UUID + secure token) is only in the browser
  history/email — if lost, the order is orphaned but harmless. EFT order emails DO
  get sent on order insert (trigger fires regardless of payment).
- **DB fails during checkout** — error surfaces to user as generic message; no
  partial order for the order-row insert, but `order_items`/`payments` failures
  are logged-and-swallowed (see BUG-04).
- **Webhook delivered twice** — `payment_status==='paid'` early-returns →
  idempotent for the happy path. A `failed`/`cancelled` ITN can still overwrite a
  `processing` order — acceptable ordering semantics.
- **Two customers buy the last unit** — **no inventory enforcement at all**;
  `stock_count`/`is_sold_out` are display-only. Overselling is possible by
  design/business decision (they confirm availability manually). Flagged, not
  silently broken.
- **Price changes while in cart** — server re-resolves at checkout; customer pays
  current price. Correct.
- **Product unpublished** — excluded everywhere including at checkout
  (`is_published` filter in pricing resolver). Deleted product → checkout throws
  "no longer available". Correct.

---

## 3. TECHNOLOGY STACK & VERSION INVENTORY

Runtime (installed → latest relevant):
| Dependency | Installed | Latest | Status |
|---|---|---|---|
| next | **16.2.6** | 16.3.6 | **2 CRITICAL RCE advisories + cache-confusion advisories — upgrade required** |
| eslint-config-next | 16.2.6 | 16.3.6 | bump with next |
| react / react-dom | 19.2.4 | 19.3.0 | OK |
| typescript | 5.9.3 (^5) | 5.x | OK |
| tailwindcss / @tailwindcss/postcss | 4.3.0 | 4.x | OK, CSS-first (no tailwind.config) |
| @supabase/ssr | ^0.12.0 | — | OK |
| @supabase/supabase-js | ^2.108.2 | — | OK |
| zod | 4.4.3 | — | OK |
| vitest | 3.2.7 | — | moderate advisories (dev-only) |
| shadcn (package) | 4.9.0 | — | pulls hono/MCP sdk — most of the 63 audit findings are this transitive tree (dev-only) |
| node | UNKNOWN (deploy env) | 24 LTS | `UNKNOWN — REQUIRES VERIFICATION` (no engines field) |

`pnpm audit` (prod+dev): **63 findings — 2 critical, 29 high, 29 moderate, 3 low.**
The criticals and most `next`-scoped highs are fixed by `next@>=16.3.3`. Most of the
rest are inside `shadcn`'s CLI dependency tree (hono, body-parser, fast-uri…) which
is not deployed to production — but `shadcn` is a runtime `dependency`, not
`devDependency`, so it ships in the production install. Should be moved to
devDependencies.

Package-manager mismatch: repo has `pnpm-lock.yaml` + `pnpm-workspace.yaml`, docs
say `npm run *`; `node_modules` exists (works either way). Pick one.

Environment variables (`.env.local`, gitignored, never committed):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon JWT —
correctly public), `SUPABASE_SERVICE_ROLE_KEY` (server-only — verified: only
imported by server modules), `SHADCNBLOCKS_API_KEY` (live `sk_live_` key —
dev-time registry key, unused at runtime). Payfast/Upstash/Turnstile/Resend vars
are referenced but **absent locally** → Payfast unconfigured, rate-limit and
Turnstile silently skip. `UNKNOWN — REQUIRES VERIFICATION` for production env.

---

## 4. DATA MODEL

Authoritative source for everything: **Supabase Postgres**.

| Data | Source of truth | Duplication |
|---|---|---|
| Product name/price/imagery | `products` row | variant = sibling row (OK) |
| Variant attributes | `products.variant_attributes` JSONB | — |
| Order | `orders` | **`orders.items` JSONB duplicates `order_items` rows** — two sources written at checkout; `items` is what's shown on confirmation page, `order_items` is what account history reads. They can't diverge today (same payload) but nothing enforces it |
| Order email linkage | `orders.email` AND `orders.customer_email` — duplicate columns, RLS reads both | minor |
| Payment | `payments` + `orders.payment_status` — duplicated status fields | ITN writes both; can diverge if payment update fails |
| Inventory | `products.stock_count`/`is_sold_out` | never mutated — decoration |
| Prices | `products.price_zar`/`sale_price_zar` + `installation_tiers` + `installation_*` + `maintenance_*` + `warranty_*` pricing-rule tables | hardcoded fallbacks in code duplicate DB seed values |
| Customer | `auth.users` + `orders.email` (guest data) — no customers table | orders linked to accounts by email-match RLS policy |

Schema notes:
- Money stored as **`integer` ZAR (whole rand)** — no cents possible. Consistent
  everywhere; brittle if a cent price is ever needed (insert would fail).
- **Two variant systems coexist**: `20250728_add_product_variants.sql`
  (`is_base_product`, `product_series`, `ON DELETE CASCADE`) and
  `supabase-migration-variants.sql` at repo root (`is_parent_product`,
  `variant_attributes`, `variant_order`, `ON DELETE SET NULL`). Code uses the
  latter. The `is_base_product` columns are dead. Deleting a parent product has
  **conflicting** cascade behavior depending on which FK actually exists in prod.
  `UNKNOWN — REQUIRES VERIFICATION` — check `pg_constraint` on prod.
- `orders.expires_at` defaults to now()+48h and the confirmation page hard-gates
  on it → **EFT customers lose access to banking details after 48h**; Payfast
  return_url can 404 for the customer even though payment succeeded.
- `order_items.variant_id` exists but is never populated (variant id is folded
  into `product_id` since variants are product rows).
- `orders.status` CHECK allows `submitted|sent_whatsapp|email_sent|completed|
  cancelled`; `payment_status` is the parallel payment machine
  (`pending|processing|paid|failed|cancelled|refunded|partially_refunded`).
  ITN sets status='completed' on payment — meaning "paid", not "fulfilled".
  There is no fulfillment/shipping state at all.
- Good: `order_number` UNIQUE + sequence generator + trigger; idempotency_key
  unique partial index; orders `total_zar >= 0` check; RLS on every table.

---

## 5. API & SERVER-ACTION MAP

| Endpoint / action | Method | Auth | Mutation | Risk |
|---|---|---|---|---|
| `submitCheckout` (action) | POST | none (guest) + Turnstile + rate-limit | orders/order_items/payments INSERT | see BUG-04, BUG-05 |
| `markWhatsAppSent(orderId)` (action) | POST | **NONE** | orders.status UPDATE | **BUG-01 — unauthenticated write** |
| `fetchEnabledProviders` (action) | POST | none | read payment_providers | low |
| `getRecommendations(cartItemIds)` (action) | POST | none | read products | **BUG-07 — filter-string injection** |
| auth actions (login/signup/reset/update/signOut) | POST | Supabase Auth | auth | open-redirect guarded; OK |
| `updateProfile` (action) | POST | session | user_metadata | OK |
| `GET /api/payfast/redirect` | GET | order UUID + secure_token | sets payment_status=processing | OK-ish; no expiry check |
| `POST /api/payfast/itn` | POST | signature + IP + amount | payment_status transitions | **BUG-02/03 — verification gaps** |
| `GET /auth/callback` | GET | OAuth code | session | next-param guarded; OK |
| Edge fn `order-email` | POST | x-webhook-secret (optional!) | sends Resend emails | **BUG-08 — HTML injection + optional auth** |

Middleware: refreshes Supabase session every request; `/account/*` → redirect to
login when unauthenticated (layout re-checks — good); `/order-confirmed/*` gets
`noindex` + `Referrer-Policy: no-referrer`. `/api` is excluded from the matcher —
correct (no cookie churn on webhooks).

IDOR review: order reads are impossible without the secure_token UUID (service
role + token match) or an authenticated session whose email matches the order
(RLS). `/account/orders` exposes only the user's own orders via RLS — sound.
`secure_token` is a full UUIDv4 — unguessable. Rate-limited lookups. PASS.

---

## 6. FINDINGS (severity-rated)

### P0 — Critical
1. **Next.js 16.2.6 — 2 critical unauthenticated RCE advisories** (GHSA-p293-qw3h-jr36
   Windows-hosted RCE — dev machines only; GHSA-2xp9-vwfh-vxw4 image-optimization
   RCE — **production**), plus cache-confusion advisories. Fix: `next@16.3.6` +
   `eslint-config-next@16.3.6`.

### P1 — High
2. **Payfast ITN verification is weak** (`api/payfast/itn/route.ts`):
   - Source IP taken from the **first** `x-forwarded-for` hop — client-spoofable
     on platforms that append; `x-real-ip`/rightmost entry is the trustworthy one.
   - Missing IP → check skipped entirely (`sourceIp && ...`).
   - `127.0.0.1` whitelisted in the deployed allowlist.
   - No Payfast **server-to-server validation** POST (`/eng/query/validate`) — the
     step Payfast's docs define as authoritative.
   - If `PAYFAST_PASSPHRASE` is empty, the signature is `md5(sorted params)` —
     computable by anyone → **forged "paid" ITN** possible by guessing
     `order_number` (sequential `AIR-YYYY-NNNNNN`). Payfast is disabled in DB
     today, so this is latent — but must be fixed before enabling.
3. **`markWhatsAppSent(orderId)` is an unauthenticated order mutation** — any
   caller can flip any order's `status` to `sent_whatsapp` knowing only its UUID.
   Fix: require the `secure_token` alongside the id.
4. **Order creation is not atomic** (`checkout/actions.ts`): `orders` INSERT
   succeeds, then `order_items`/`payments` failures are `console.error`'d and the
   checkout returns success → orders exist with no line items / no payment row,
   and the ITN payment update then silently affects 0 rows. Fix: compensating
   delete (or a transactional RPC).
5. **Client-trusted installation tier**: `resolveOrderPricing` honours a
   client-supplied `installation_tier_id` before BTU matching — a tampered
   request can attach the cheap `9-12k` tier (R1950 vs R2750) or the enquiry tier
   (R0 + `has_installation=true` recorded) to a 24 000 BTU unit. Fix: derive the
   tier server-side from the product's `btu_range`; treat client id as advisory.
6. **Deals break checkout**: `DealAddToCartButton` adds `deal.id` to the cart;
   pricing resolver looks it up in `products` → not found → checkout hard-fails
   with "no longer available" for the whole cart. Fix: add the linked
   `product_id` (deal discount is display-only — checkout always charges catalog
   price, which is also a pricing-consistency issue worth a business decision).
7. **PostgREST filter injection / malformed query** (`cart/recommendations.ts`):
   `cartItemIds.join(",")` is concatenated into `.not("id","in","(...)")` — the
   IDs are attacker-controllable composite strings (contain `-` segments and any
   characters a user can write into localStorage). At best this returns PostgREST
   400s and recommendations silently die; at worst it's filter injection into a
   service-role-free query (impact limited — products are public anyway). Fix:
   extract UUIDs, drop malformed ids.
8. **`order-email` edge function**: `x-webhook-secret` check is **skipped when the
   env var is unset**, the webhook secret is **hardcoded in a committed
   migration** (`20260710085328`), and `order.name`/`notes` are interpolated into
   HTML **unescaped** → HTML injection into emails to the owner AND to any
   `order.email` an attacker supplies → phishing relay through the verified Resend
   domain. Combined with the stale anon INSERT grant on `orders` (item 9), anyone
   can trigger arbitrary "order received" emails. Fix: escape HTML, fail closed
   on missing secret, rotate the committed secret.
9. **Stale anon INSERT grant on `orders`** — `Public can submit orders` +
   `grant insert ... to anon` remain although checkout uses the service role.
   Anon can spam fabricated orders directly via PostgREST (bypassing rate limit,
   Turnstile, and server pricing) → polluted orders table + email relay (item 8).
   Fix: `REVOKE INSERT ON public.orders FROM anon` (service role unaffected).
10. **`settings` RLS reads as "Admins" but grants `USING (true)` to every
    authenticated user** — any signed-up account can read banking details /
    config. Low real-world impact (EFT customers see bank details anyway) but the
    policy name lies. Fix: restrict to `admins` membership.
11. **Stock is never enforced or decremented** — `is_sold_out`/`stock_count` are
    display-only; a sold-out product can be ordered via a crafted request (UI
    blocks it, server doesn't). Fix: reject `is_sold_out` items in
    `resolveOrderPricing` (business still confirms availability manually —
    document that inventory is advisory).
12. **Breadcrumbs link to `/collections/[slug]` — route doesn't exist** → dead
    links/404s on every product page that has collection assignments. Fix: add a
    collections listing page or remove the link.

### P2 — Medium
13. **Duplicate-lead analytics**: `LeadTracking` fires `generate_lead` on every
    confirmation-page mount — refresh = duplicate conversion; no transaction_id;
    fires for unpaid orders too. Fix: sessionStorage dedup keyed on order id +
    `transaction_id`.
14. **Soft-404s**: product-not-found and deal-not-found render a 200 status page
    (and echo the raw slug). Fix: `notFound()`.
15. **Duplicate/confusing policy SQL**: `20260813_combined_migration.sql`
    re-creates the insecure `"Public can read own order by token"` policy that
    `20260817` migrations dropped — running the combined file after the fix
    silently re-opens the anon-read-all-orders hole. Fix: delete/neutralise the
    stale file.
16. **`expires_at` 48h kills the confirmation page** for slow-paying EFT
    customers (and Payfast return after 48h). Consider gating only the EFT
    banking block, or extending for pending payments.
17. **`generate_lead`/order statuses**: `status='sent_whatsapp'` is written at
    order-creation time when channel includes WhatsApp — before the customer ever
    taps the link. `markWhatsAppSent` makes it honest only if clicked.
18. **Fake ratings**: `getPlaceholderRating` fabricates 4.6–5.0 ★ / 99–780
    reviews per product and renders them to customers (not in JSON-LD — good).
    Misleading marketing; likely a CPA/ASA problem in SA. Remove or source real
    reviews.
19. **`getWhatsAppNumber()` uses `.single()`** on `settings` while other code
    uses `.limit(1).maybeSingle()` — if a second settings row ever exists,
    WhatsApp-channel checkouts throw "not configured".
20. **Category gap**: residential = `btu<=32000`, commercial = `btu>=40000` in
    `filterProducts`, but the products-page filter chips count commercial as
    `btu>=32000` → 32001–39999 BTU units are labelled "Commercial" in filter
    counts yet appear on neither listing page.
21. **Duplicate provider fetchers**: `payment-methods.ts#getEnabledPaymentMethods`
    and `providers-action.ts#fetchEnabledProviders` do the same query; one is
    dead code. Also unused `anonClient` in `checkout/actions.ts`.
22. **Dead code/cruft**: `src/lib/mock-data.ts`, `src/data/mock-products.ts`,
    `debug-*.js`, `globals (1).css`, `src/components/ui/components (1).json`,
    `nextadmin-template/` (nested project w/ own node_modules — gitignored but
    on disk), `scripts/*` CJS files failing lint.
23. **Robots**: `/cart` and `/account` not disallowed (thin/indexable);
    sitemap lists all 438 products including every variant — variants are
    near-duplicate pages each self-canonicalising. Consider canonicalising
    variants → parent.
24. **Error passthrough**: `submitCheckout` returns raw `error.message` — Zod
    issue JSON and any thrown internals reach the browser. Low risk here (no
    secrets in messages) but map to user-safe strings.

### P3 — Low / hygiene
25. `z.any()` on `kit_configuration` — type it properly (KitConfiguration).
26. `useCart` returns a silent NOOP outside the provider → add-to-cart can fail
    silently. Throw instead.
27. `name`/`notes` fields have no HTML/format constraints beyond length.
28. `localStorage` cart never revalidates product existence until checkout —
    stale carts produce a hard error at checkout (acceptable) but give no earlier
    signal.
29. No `sitemap` entries for `/categories/*`; no OpenGraph image file at
    `/opengraph-image.png` referenced in metadata (verify asset exists).
30. Product detail page `<style dangerouslySetInnerHTML>` block + JSON-LD are
    fine, but the inline `pt-[220px]` magic numbers everywhere = brittle.

### Security items verified SAFE (for the record)
- Service-role key: server-modules only; never imported in a `"use client"` file;
  `.env*` gitignored and never committed (`git log` clean).
- Anon SELECT on `orders`: revoked 2026-08-17 (verified in migrations).
- Customer order access: email-match RLS is reasonable (Supabase confirms emails).
- Open redirects: `safeNext` + callback `next` checks are correct.
- CSRF: server actions rely on SameSite cookies; checkout uses no cookies — fine.
- Prices: always server-resolved; client price fields are display-only. PASS.
- SQLi: all queries via PostgREST builder — safe (except BUG-07's hand-built
  `in` list, which is exactly the one place raw strings enter a filter).

---

## 7. ORDER STATE MACHINE (actual)

```
checkout submit ──► orders(payment_status=pending, status=submitted|sent_whatsapp)
                        │
   payfast redirect ──► payment_status=processing
                        │
   ITN COMPLETE    ──► payment_status=paid, status=completed, paid_at, txn id
   ITN FAILED      ──► payment_status=failed
   ITN CANCELLED   ──► payment_status=cancelled
   admin (manual)  ──► EFT confirm (no UI in repo — dashboard)
   cron (90d)      ──► status=submitted older than 90d → anonymised + cancelled
```
Impossible-state risks: `payments.status` and `orders.payment_status` can diverge
(single-row updates not transactional); `status='completed'` conflates "paid"
with "fulfilled"; no refund flow exists beyond enum values.

## 8. TEST / BUILD VERIFICATION (run today)

| Check | Before fixes | After fixes |
|---|---|---|
| `tsc --noEmit` | PASS on src (errors only in stale generated `.next/dev/types`) | PASS |
| `eslint` | 28 errors / 123 warnings | **15 errors** / 120 warnings — all remaining errors are the known `react-hooks/set-state-in-effect` patterns (AGENTS.md); `scripts/` now eslint-ignored |
| `vitest run` | 13/13 pass | 13/13 pass — caveat: tests re-implement functions rather than importing them, so they can't catch regressions in real code |
| `pnpm audit` | 63 findings (2 critical on `next`) | `next@16.3.6` applied — criticals resolved; remaining advisories are dev-transitive (shadcn CLI now a devDependency) |
| `next build` | — | **PASS** on 16.3.6 — 28 routes, incl. new `/collections/[slug]` |
| Smoke (dev :3000) | — | `/` `/products` `/cart` `/checkout` `/deals` → 200; bogus product/deal/collection slugs → real 404 |
| Live DB / Vercel env / Payfast env | — | `UNKNOWN — REQUIRES VERIFICATION` |

### Fixes applied in this pass
- `next`/`eslint-config-next` → 16.3.6 (2 critical RCE advisories); `shadcn` moved to devDependencies.
- Payfast ITN: trusted-IP extraction (`x-real-ip` / rightmost XFF), `127.0.0.1` dev-only, **Payfast server-to-server validation POST** added, exact-cent amount match, fail-closed on missing source IP.
- `markWhatsAppSent` now requires the order's `secure_token`; status no longer pre-set to `sent_whatsapp` at creation.
- Checkout: compensating order delete when `order_items`/`payments` insert fails; ZodError → user-readable message; `kit_configuration` properly typed; `.maybeSingle()` for settings lookup; dead `anonClient` removed.
- `resolveOrderPricing`: sold-out items rejected; installation tier derived from product BTU (client tier id demoted to advisory).
- Deals: add-to-cart replaced by linked-product CTA (a `deals.id` in cart broke checkout for the entire cart).
- `recommendations.ts`: UUID extraction before PostgREST filters (injection/malformed-query fix).
- `order-email` edge function: HTML-escapes all order fields; fails closed when `ORDER_WEBHOOK_SECRET` is unset.
- Migration `20260925_audit_hardening.sql`: revoke anon INSERT on orders; settings → admin-only; re-drop insecure orders policies. **MUST BE RUN in Supabase dashboard.**
- `20260813_combined_migration.sql`: insecure policy creation removed (would have re-opened the anon-read hole).
- New route `/collections/[slug]` (breadcrumb links previously 404'd).
- `/order-confirmed` expiry gate relaxed for pending Manual EFT orders (banking details stay reachable past 48h).
- `LeadTracking`: `transaction_id` + sessionStorage dedup (no more duplicate `generate_lead` on refresh).
- Product/deal pages now `notFound()` (real 404s); root metadata brand fixed; robots disallows `/cart`, `/account`, `/auth/`; commercial category boundary unified at 32001 BTU.
- Deleted cruft: `debug-*.js`, `globals (1).css`, stray `components (1).json`, dead `PaymentOptions.tsx`/`payment-methods.ts`/`DealAddToCartButton.tsx`.

## 9. RECOMMENDED TARGET ARCHITECTURE

Keep the current shape — Next.js + Supabase is appropriate for a
single-currency, low-order-volume store. The changes worth making:

1. Move order creation into a Postgres function (`create_order`) so
   order+items+payment insert atomically.
2. Treat `order_items` as the only line-item source; drop `orders.items` JSONB
   (or stop writing it).
3. Decide inventory policy explicitly: either enforce `is_sold_out` server-side
   (recommended) or remove stock fields from the UI.
4. Add `/collections/[slug]` (a listing page like categories) or stop emitting
   those links.
5. Give EFT confirmation a real admin path (a minimal `/admin` page gated by the
   existing `admins` table, or commit to dashboard-only and document it).
6. Move `shadcn`, `vitest` to devDependencies; delete debug scripts and the
   stale combined migration; pick pnpm OR npm.
7. Rotate the committed webhook secret; require `ORDER_WEBHOOK_SECRET`;
   HTML-escape edge-function templates.
8. Server-derive the installation tier; stop trusting client tier ids.
9. Harden ITN before enabling Payfast: trusted-IP extraction (x-real-ip /
   rightmost XFF), drop `127.0.0.1`, add Payfast server-validation POST,
   compare amounts exactly.

## 10. REMAINING UNKNOWNS
- Production env vars (PAYFAST_*, UPSTASH_*, TURNSTILE_*, RESEND_*,
  NEXT_PUBLIC_SITE_URL) — not visible locally.
- Whether gtag/GTM is actually installed (events are pushed but no loader found).
- Which variant FK (`CASCADE` vs `SET NULL`) actually exists in prod.
- Whether `payment_providers` was re-seeded (Payfast disabled per AGENTS.md).
- Production lockfile drift between pnpm-lock and deployed install.
