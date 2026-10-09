# 03 — Architecture Diagrams (As-Is)

All diagrams reflect verified code paths as of 2026-10-09.

## 1. Logical / component view

```
┌─────────────────────────── Next.js 16 App Router ───────────────────────────┐
│                                                                             │
│  (shop) route group          (auth) group          API routes               │
│  ├─ /, /products, /deals,    ├─ /login /signup     ├─ GET /api/payfast/     │
│  │  /categories/[slug],      │  /forgot-password   │      redirect          │
│  │  /collections/[slug],     │  /reset-password    └─ POST /api/payfast/itn │
│  │  /cart, /checkout,        │  (server actions:                            │
│  │  /installation…           │   login/signup/reset/                        │
│  ├─ /order-confirmed/[token] │   updatePassword/                            │
│  └─ /account/* (guarded)     │   signOut)                                   │
│                                                                             │
│  middleware.ts: Supabase session refresh + /account guard +                 │
│                 /order-confirmed headers (noindex, no-referrer)             │
│                                                                             │
│  Server-side lib:                                                           │
│   ├─ supabase-service.ts  → serviceRoleClient (bypasses RLS, server-only)  │
│   ├─ utils/supabase/{server,middleware,client}.ts → anon/ssr clients       │
│   ├─ server-pricing.ts    → resolveOrderPricing (all prices from DB)        │
│   ├─ payment/{registry,provider,payfast,manual-eft,types}.ts                │
│   └─ installation-kit-price / warranty-price / maintenance resolvers        │
│                                                                             │
│  Client-side: CartProvider (localStorage), CheckoutClient, cart drawer      │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              ▼                     ▼                      ▼
      Supabase Postgres      Supabase Auth          Upstash Redis (opt)
      (RLS on all tables)    (cookie sessions)      Turnstile (opt)
              │
              ├─ trigger: on_order_insert_notify_email (pg_net)
              │           ▼
              │     Edge Function order-email ─► Resend
              │
              └─ pg_cron: orders-pii-retention-90-days

Payfast: browser redirect ─► gateway ──ITN──► /api/payfast/itn
```

## 2. Checkout data flow (verified in `src/app/(shop)/checkout/actions.ts`)

```
CheckoutClient.submit
  │ items[] (ids + config only — never prices), customer fields,
  │ turnstileToken, honeypot "website", idempotencyKey, consent
  ▼
submitCheckout (server action)
  1. zod parse (checkoutSchema)
  2. normalizePhone → +27 format or throw
  3. rateLimit() — Upstash INCR checkout:{ip}, 5/10min (skip if env unset)
  4. verifyTurnstile() — siteverify POST (skip if env unset)
  5. idempotency lookup — orders.idempotency_key → return existing
  6. payment_providers.is_enabled check
  7. resolveOrderPricing() — products+tier/kit/warranty/maintenance from DB;
     rejects unpublished/sold-out; derives installation tier from BTU
  8. generate_order_number() RPC → AIR-YYYY-NNNNNN
  9. INSERT orders (items JSONB + totals + secure_token)
 10. INSERT order_items rows — on failure: compensating DELETE order
 11. INSERT payments row (status=pending) — on failure: compensating DELETE
 12. build wa.me URL (if channel whatsapp|both) → orders.whatsapp_url
 13. Payfast? → /api/payfast/redirect?order=&token=
  → returns { confirmationUrl, whatsappUrl, paymentRedirectUrl }
  │
  ▼ trigger on_order_insert_notify_email → Edge fn → Resend (owner+customer)
```

## 3. Payment flows

### Manual EFT (live)
```
order(payment_status=pending) ─► confirmation page shows banking details
  (exempt from 48h expiry while pending) ─► admin verifies bank deposit
  ─► manually updates payment_status (Supabase dashboard — no admin UI)
```

### Payfast (disabled in DB)
```
/api/payfast/redirect ─► order+token check ─► payment_status=processing
  ─► redirect to payfast (signed params; m_payment_id=order_number)
Payfast ──ITN POST──► /api/payfast/itn
  [worktree] IP allowlist (x-real-ip / rightmost XFF) → MD5 signature
  → server-to-server validate POST → merchant_id check → exact amount match
  → idempotent transition paid/failed/cancelled
  [HEAD — deployed] first-hop XFF (spoofable), 127.0.0.1 allowed, missing-IP
  skip, no server validation
```

## 4. Auth & order-access flow

```
login/signup ─► Supabase Auth ─► sb-* cookies (SSR setAll via middleware)
middleware on every non-API request: getUser() (server-verified) +
  /account/* → 302 /login?next=… when anonymous; layout re-checks
Order access paths:
  a) /order-confirmed/[uuid]?token=[uuid] → service role + exact match +
     expires_at gate (except pending EFT) + IP+token rate limit
  b) /account/orders → RLS policy: lower(email|customer_email) = jwt email
```

## 5. Deployment diagram (inferred — UNKNOWNs marked)

```
Internet ──TLS──► Vercel edge ──► Next.js serverless functions (SRR/actions)
                      │                    │
                      │                    ├─► Supabase (Postgres+Auth+Storage)
                      │                    ├─► Upstash (opt), Turnstile (opt),
                      │                    │   Resend (via edge fn), Payfast
                      ▼
                Static assets /public (38MB, 288 files — unoptimized PNGs)
Environments: prod + local only. No staging. No IaC. Migrations manual.
```

## 6. Order state machine (actual)

```
submitted ──► sent_whatsapp (customer taps wa.me link, token-verified)
         ──► completed  (ITN paid OR manual admin action)
         ──► cancelled (ITN cancelled / cron anonymize at 90d if still submitted)
payment_status: pending → processing → paid | failed | cancelled
               (refunded, partially_refunded exist in CHECK but no code path)
Not modeled: fulfillment/shipping states, refunds flow.
```

## Key architectural observations
- **Service-role concentration:** checkout, pricing, order-confirmed, sitemap, ITN all run through `serviceRoleClient` — a single point where an injection/logic bug bypasses RLS entirely.
- **Non-transactional writes:** orders → order_items → payments are 3 sequential inserts with compensating deletes (worktree). Race window remains; proper fix is a `create_order` Postgres function.
- **Dual write:** `orders.items` JSONB and `order_items` rows carry the same snapshot; nothing enforces consistency.
- **No async job infra:** email is a DB trigger + edge fn; there is no retry/DLQ — a failed pg_net call silently drops the email.
- **LocalStorage cart:** no server cart; no stock reservation; stale-cart errors surface only at checkout.
