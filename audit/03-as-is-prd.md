# 03 — As-Is PRD (reconstructed from code)

> Every statement below is derived from code/migrations inspected on 2026-10-09.
> Items that cannot be confirmed without production access are marked
> **UNKNOWN — needs confirmation**.

## Product vision (inferred)

An online storefront for a South African air-conditioning retailer: sell units
(split/commercial), installation, installation kits, maintenance plans and
extended warranties, and convert browsers into orders primarily via WhatsApp
and email — payment is collected offline (EFT) or via Payfast.

**Target users:** SA homeowners and small businesses buying aircons; the
business owner fulfilling orders manually.

## Personas (as implemented)

| Persona | What the system gives them today |
|---|---|
| Guest shopper | Browse catalog, filter, view variants, configure install/kit/maintenance/warranty, cart, checkout without account, EFT or (disabled) Payfast, token-gated confirmation page, optional WhatsApp notification |
| Registered customer | Signup/login/reset; view own orders (email-match); edit profile (name/phone/contact-method); **subscriptions & warranties pages show fabricated data** |
| Owner/admin | Receives order email (email/both channels) and/or WhatsApp deep link; manages products/orders by hand in the Supabase dashboard |
| Support staff | None — no roles or tooling |

## Jobs-to-be-done (as served today)

1. "Find an aircon for my room" → filters by category/brand/BTU; BTU variant picker on PDP; no search, no room-size finder beyond `room_coverage` text.
2. "Know the all-in price" → PDP shows unit + optional install/kit/maintenance/warranty prices; **no delivery cost anywhere**.
3. "Order it" → guest checkout; contact via WhatsApp/email/both; pay by EFT (banking details shown) or Payfast (disabled).
4. "Know my order went through" → confirmation page link + optional email; WhatsApp deep link to the business.
5. "See my past orders" → account order history.
6. "Run the store" → Supabase dashboard + Resend emails + WhatsApp messages. No admin app.

## Current customer journey (verified in code)

```
/ → /products (filter chips) → /products/[slug]
  → pick variant (BTU) → optional: installation tier, kit configurator,
    maintenance plan, warranty option → Add to cart (localStorage)
  → /cart (qty edit, recommendations) → /checkout
  → form: name, surname?, phone (SA format), email?, address, city,
    province, installation notes, consent checkbox
  → channel: whatsapp | email | both
  → payment: manual_eft | payfast(disabled)
  → submitCheckout: zod → rateLimit → Turnstile → idempotency →
    provider-enabled check → resolveOrderPricing (all server-side) →
    INSERT orders + order_items + payments (compensating delete on failure)
  → redirect /order-confirmed/<uuid>?token=<secure_token>
      ├── EFT: banking details + "we'll contact you"
      ├── Payfast: "Pay securely" button → /api/payfast/redirect → gateway
      └── channel whatsapp/both: wa.me deep link button (markWhatsAppSent on click)
  → order-email edge fn sends owner + customer mail (email channels only)
```

Post-payment (Payfast): ITN → payment_status=paid, status=completed.
EFT: owner manually flips payment_status in the dashboard.

## Functional requirements (as implemented)

- FR-ASIS-CATALOG-1: Show only `is_published` parent products in listings; variants reachable via PDP or direct slug.
- FR-ASIS-CATALOG-2: PDP resolves sibling variants and renders a selector per varying `variant_attributes` key; BTU rendered as "Available Sizes".
- FR-ASIS-PRICING-1: All checkout prices re-resolved server-side from DB; client prices are display-only.
- FR-ASIS-PRICING-2: Installation tier derived from product `btu_range` server-side; client tier id is advisory only.
- FR-ASIS-PRICING-3: `is_enquiry_only` products price at R0 (price-on-request flow).
- FR-ASIS-ORDER-1: Order capture requires consent checkbox; honeypot `website` field must be empty.
- FR-ASIS-ORDER-2: Idempotency key dedupes repeat submissions; DB unique index is the backstop.
- FR-ASIS-ORDER-3: Order numbers `AIR-YYYY-NNNNNN` via `generate_order_number()` sequence.
- FR-ASIS-ORDER-4: Order confirmation requires order UUID + `secure_token`; links expire 48h **except** pending manual EFT.
- FR-ASIS-AUTH-1: `/account/*` requires Supabase session (middleware + layout double-check).
- FR-ASIS-AUTH-2: Customers see orders where order email == account email (RLS policy 20260917).
- FR-ASIS-EMAIL-1: On order INSERT, edge fn emails owner always (email channels) and customer if `order.email` present.
- FR-ASIS-PAYFAST-1: ITN accepted only from allowlisted IPs, valid signature, Payfast server-validation == VALID, merchant id match, exact-cents amount match.
- FR-ASIS-PRIVACY-1: pg_cron anonymizes `submitted` orders older than 90 days.
- FR-ASIS-CONSENT-1: GTM/GA4 load only after cookie-consent accept; consent-mode default denied.

## Business rules found in code

- Phone normalized to `+27` E.164-ish; rejects non-SA numbers.
- Quantity 1–99 per line; cart lines ≥1.
- Email optional at checkout (WhatsApp-first flows supported).
- Money: integer ZAR, zero decimals — no cents possible in the schema.
- Residential = BTU ≤ 32000; Commercial = BTU ≥ 32001 (listing pages) — but `ProductsClient` filter chips still use `>= 32000` for commercial (boundary overlap at exactly 32000).
- Sold-out products rejected at checkout (`resolveOrderPricing`), not earlier.
- Deals never enter the cart — "Buy this product" links to `deal.product_id`'s product page; **deal price is never the charged price**.
- Order `status='completed'` is set by the payment ITN — it means *paid*, not *delivered*.

## Data model (summary)

- `products` — flat table; variants are sibling rows (`parent_product_id`, `variant_attributes`, `variant_order`). Two variant schemes exist in migrations (`is_base_product` legacy, dead).
- `orders` — guest contact fields + `items` JSONB snapshot + totals + `secure_token` + `idempotency_key` + `expires_at` + dual status fields. `orders.email` and `orders.customer_email` are duplicate columns.
- `order_items` — normalized line items (`variant_id` column exists, never populated).
- `payments` — one row per order at checkout; updated by ITN/admin.
- Config tables: `installation_tiers`, `installation_kits`, `pipe_*`, `bracket_options`, `insulation_options`, `protective_cage_options`, `installation_pricing_rules`, `installation_kit_*_compat`, `maintenance_*`, `warranty_*`, `payment_providers`, `settings`, `promotions`, `deals`, `collections`, `product_collections`, `categories`, `page_heroes`, `admins`.
- No `customers` table — identity = `auth.users` + order email.

## Integrations

Supabase (DB/Auth/Edge/pg_net/pg_cron), Resend, Payfast, Upstash (opt), Turnstile (opt), GTM/GA4 (opt), WhatsApp deep links.

## Known limitations

1. No admin UI at all — fulfilment is manual SQL.
2. No shipping/delivery pricing or tax/VAT handling.
3. No stock decrement; `stock_count` not enforced (only `is_sold_out`).
4. No refunds/cancellations workflow.
5. Fake review ratings rendered to customers.
6. Mock subscriptions/warranties account pages.
7. Dead newsletter form (data dropped).
8. `orders.items` JSONB duplicates `order_items` — two sources, nothing enforces parity.
9. Email-optional checkout + email-only notifications = some orders produce no customer email.
10. Duplicate variant schema; conflicting FK cascade on parent delete (`CASCADE` vs `SET NULL` — prod state UNKNOWN).
11. `.env.local.backup` plaintext secrets file on the dev machine (gitignored, but a local hygiene risk).

## Assumptions / unknowns

- Production env vars (Payfast, Upstash, Turnstile, Resend, GTM/GA IDs): UNKNOWN.
- Whether `20260925_audit_hardening.sql` was applied in the dashboard: UNKNOWN.
- Live product/order counts (438/194/244 per AGENTS.md) not re-verified against prod.
- Deploy pipeline, Node version, backup/restore: UNKNOWN.
