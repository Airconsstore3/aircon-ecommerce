# Data Flows Audit (D1–D7)

## D1. Product data: admin → DB → API → storefront

```
Admin (Supabase dashboard / seed scripts)
   └─► products / categories / collections / deals (Postgres, RLS: published-only)
        ├─► anon PostgREST reads in RSC pages (products, categories, deals, collections)
        ├─► service-role reads (server-pricing, sitemap, PDP settings join)
        └─► localStorage cart snapshot (display-only copy: name/price/images/config)
```

- Facts: storefront never trusts the cart copy — `resolveOrderPricing` re-reads every
  price at checkout. Product publish state enforced at read AND at checkout.
- Gaps: no admin UI for edits; `stock_count` decorative; two dead variant systems
  (`is_base_product`/`product_series` vs `is_parent_product`/`variant_attributes`);
  PDP `getPlaceholderRating` fabricates ratings not present in DB.

## D2. Cart data: client → session → DB

```
ProductDetailClient.handleAddToCart
   └─► CartProvider.items (React state)
        └─► localStorage["cart"]  (composite id = uuid+config signature)
             └─► checkout submit → zod parse → resolveOrderPricing → orders/order_items/payments
```

- Facts: zero server round-trips until checkout; surviving reload/tab-close;
  multi-tab writes race last-writer-wins via the `items→localStorage` effect
  (`CartProvider.tsx:59-63`) — **two tabs can silently clobber each other's carts**.
- Gaps: no server cart (no cross-device, no recovery, no admin visibility);
  stale items never revalidated until checkout (hard error only);
  `id` strings are attacker-editable — mitigated by UUID extraction + publish checks
  (`recommendations.ts:34-47`, `server-pricing.ts:262-298`).

## D3. Order data: checkout → payment → DB → email → admin

```
submitCheckout ─► orders (items JSONB + totals + secure_token)
                ─► order_items (normalised snapshot)
                ─► payments (provider row, status=pending)
orders INSERT trigger ─► pg_net ─► edge fn order-email ─► Resend ─► owner + customer
   ├─ EFT:  confirmation page shows banking details; manual reconciliation (NO app path)
   └─ Payfast: /api/payfast/redirect → hosted page → ITN → orders.payment_status + payments.status
```

- Facts: `orders.items` (JSONB) and `order_items` are written from the same payload —
  two sources that can silently diverge on any future write path; confirmation page
  reads `items`, account history reads `order_items` (correct usage, but fragile).
  `orders.payment_status` and `payments.status` are also duplicated and updated in
  non-transactional pairs (ITN handler, redirect handler).
- Gaps: compensating delete cleans up write failures — but an insert-triggered
  email fires on the `orders` INSERT, so a compensated (deleted) order may already
  have emailed the owner ("ghost order" email). Low probability, real race.
- Admin sees orders via dashboard only.

## D4. Customer data: signup → DB → email → analytics

- `signup` → `auth.users` + `user_metadata{full_name, phone, contact_method}`.
  There is no `customers` table — order↔user linkage is an **email-string match**
  RLS policy (`20260917b`). Guest orders under a different email are orphaned from
  the account forever; changing the account email doesn't retro-link.
- Analytics: `generate_lead` emits hashed (SHA-256) email/phone only after consent —
  good POPIA posture (`LeadTracking.tsx:29-47`).

## D5. Inventory data: order → DB → admin

- **MISSING** — order creation never touches `products.stock_count`. The data flow
  is: admin edits `stock_count`/`is_sold_out` manually → UI badges + checkout
  rejection. One direction only.

## D6. Analytics data: client → provider

- `dataLayer`/`gtag` created on demand; Consent Mode default-denied; GTM + GA4
  scripts injected only post-accept (`CookieConsentBanner.tsx:48-61`).
- Events: `generate_lead`, ads `conversion` click. **Missing:** page_view params,
  view_item, view_item_list, add_to_cart, begin_checkout, purchase — funnel blind.

## D7. PII flow: capture → storage → access → deletion

| Stage | Implementation | Assessment |
|---|---|---|
| Capture | checkout name/phone/email/address + consent checkbox (required) | POPIA consent captured, `consent_accepted` stored |
| Storage | `orders` plaintext PII; `auth.users` for accounts | Standard; no encryption beyond platform |
| Access | service-role only; `secure_token` UUIDv4 for guest view; email-match RLS for accounts; `noindex`/`no-referrer` on confirm page; rate-limited lookups | Strong (post-Aug-17 fixes) |
| Exposure risks | `secure_token` lives in URL (history/logs); `ORDER_WEBHOOK_SECRET` committed in migration; settings table previously read-all for authed users (hardened by pending migration) | Mitigated / pending verify |
| Deletion | `pg_cron` anonymises `submitted` orders >90d (name/phone/email/notes/items/whatsapp_url wiped) | Partial — only `submitted` status covered; paid/completed/cancelled orders retain PII indefinitely; no user-initiated deletion path; `auth.users` never scrubbed |

**PII verdict:** capture + access are solid; retention/deletion is partial — the
cron covers only abandoned `submitted` orders, and there is no self-service or
admin deletion flow for POPIA requests.
