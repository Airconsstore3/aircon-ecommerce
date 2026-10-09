# 07 — Data & API Requirements

## Current data model (verified from migrations)

### Core
| Table | Purpose | Notable columns | Issues |
|---|---|---|---|
| `products` | Catalog + variants (flat) | `parent_product_id`, `variant_attributes` JSONB, `price_zar`, `sale_price_zar`, `stock_count`, `is_sold_out`, `is_published`, `is_enquiry_only`, `installation_pricing` JSONB | Two variant schemes coexist; money in int ZAR |
| `categories` | Taxonomy | `parent_id` | — |
| `collections` + `product_collections` | Marketing taxonomy | `parent_id`, `sort_order` | — |
| `deals` | Promotional pages | `product_id` FK, `sale_price_zar`, `ends_at`, `stock_remaining` | Deal price not honoured at checkout |
| `promotions` | Banner only | `code` unused | — |
| `orders` | Order header + JSONB item snapshot | `order_number`, `secure_token`, `payment_status`, `status`, `idempotency_key`, `expires_at`, `channel`, `whatsapp_url`, delivery fields, totals, `email` + `customer_email` (dup) | `items` JSONB duplicates `order_items` |
| `order_items` | Normalized lines | per-line install/kit/maintenance/warranty prices | `variant_id` never populated |
| `payments` | Payment record | `provider_code`, `status`, `provider_transaction_id`, `provider_response` JSONB | Can diverge from `orders.payment_status` |
| `settings` | Business config | whatsapp_number, banking details, policy text, shipping/returns summaries | RLS → admins only (pending migration apply) |
| `payment_providers` | Provider flags | `code`, `is_enabled`, `sort_order` | — |
| `admins` | Admin membership | `user_id` → auth.users | Exists but unused by app |
| `page_heroes` | CMS-lite heroes | `page_key`, `is_active` | — |

### Pricing configuration
`installation_tiers`, `installation_kits`, `pipe_materials`, `pipe_sizes`,
`pipe_lengths`, `bracket_options`, `insulation_options`,
`protective_cage_options`, `installation_pricing_rules`,
`installation_kit_material_compat`, `installation_kit_bracket_compat`,
`installation_kit_insulation_compat`, `installation_kit_cage_compat`,
`maintenance_plans`, `maintenance_plan_services`, `maintenance_pricing_rules`,
`maintenance_eligibility_rules`, `warranty_options`, `warranty_pricing_rules`,
`warranty_terms`.

### Functions/triggers/jobs
- `generate_order_number()` — SECURITY DEFINER; EXECUTE revoked from public in `20260925_audit_hardening.sql`.
- `orders` INSERT trigger → `pg_net` POST → `order-email` edge fn (secret in header).
- `orders-pii-retention-90-days` pg_cron — anonymizes stale `submitted` orders.
- `set_updated_at()` triggers on products/orders/payments/page_heroes.
- `validate_payfast_ip()` — helper from security-hardening migration.

## Required schema changes (to-be)

```sql
-- Order lifecycle
CREATE TABLE order_events (
  id uuid pk, order_id uuid fk -> orders on delete cascade,
  from_status text, to_status text, actor text, -- 'system'|'admin:<uid>'|'webhook'
  note text, created_at timestamptz default now()
);

-- Delivery pricing
CREATE TABLE delivery_zones (
  id uuid pk, name text, provinces text[] null,
  postcode_pattern text null, fee_zar int check (fee_zar >= 0),
  free_over_zar int null, is_active bool default true, sort_order int
);
-- orders: + delivery_fee_zar int default 0, delivery_zone_id uuid null,
--         delivery_pending_quote bool default false

-- VAT
-- orders: + vat_amount_zar int, invoice_number text unique null
-- settings: + vat_number text, vat_registered bool
CREATE SEQUENCE invoice_number_seq;

-- Refunds
CREATE TABLE refunds (
  id uuid pk, order_id uuid fk, amount_zar int check (amount_zar > 0),
  reason text, status text check (status in ('requested','processed','rejected')),
  created_at timestamptz, processed_by uuid null
);

-- Reviews (when real reviews are sourced)
CREATE TABLE product_reviews (
  id uuid pk, product_id uuid fk, author_name text, rating int check (1..5),
  title text, body text, is_verified_purchase bool, is_published bool,
  created_at timestamptz
);

-- Newsletter
CREATE TABLE newsletter_subscribers (
  id uuid pk, email citext unique, consented_at timestamptz,
  source text, unsubscribed_at timestamptz null
);

-- Admin audit
CREATE TABLE admin_audit_log (
  id uuid pk, admin_user_id uuid, action text, entity text, entity_id uuid,
  metadata jsonb, created_at timestamptz
);
```

- Extend `orders.status` CHECK: add `confirmed`, `scheduled`, `dispatched`, `installed`; keep `completed` for back-compat or migrate.
- Money: decide integer-rand → `numeric(12,2)` or cents migration (G-18).
- Resolve duplicate variant scheme: drop `is_base_product`/`product_series` after confirming prod FK behavior.

## API / server-action surface (to-be)

| Endpoint/action | Auth | Purpose |
|---|---|---|
| `submitCheckout` (exists) | none + Turnstile + rate-limit | add delivery zone resolution + promo code + VAT calc |
| `applyPromoCode(code)` | none | validate + return discount preview |
| `GET /api/search?q=` | none | product search (rate-limited) |
| `adminListOrders/filter/update` | session + `admins` | order ops |
| `adminMarkPaid(orderId)` | session + `admins` | EFT confirmation + email trigger |
| `adminRefund(orderId, amount, reason)` | session + `admins` | refund record + status |
| `adminUpsertProduct` | session + `admins` | product CRUD (phase 2) |
| `accountExportData`, `accountDeleteRequest` | session owner | POPIA |
| `POST /api/payfast/itn` (exists) | IP+sig+server-validate | + trigger confirmation email on paid |
| `GET /api/order-status/[orderNo]` | none, rate-limited | optional guest order lookup by order number + phone |
| Edge fn `order-email` | secret | extend: payment-confirmed, status-changed, invoice emails |

**Invariants to enforce server-side:** every price/line recomputed server-side;
every admin mutation writes `admin_audit_log`; every status change writes
`order_events`; webhook handlers idempotent; all public lookups token-gated or
rate-limited.
