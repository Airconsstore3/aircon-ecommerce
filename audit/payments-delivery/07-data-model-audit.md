# 07 — Data Model Audit

## Existing ERD (payment/delivery-relevant tables)

```mermaid
erDiagram
    orders ||--o{ order_items : has
    orders ||--o{ payments : has
    orders }o--|| payment_providers : "payment_method → code"
    auth_users ||--o| admins : "user_id"
    settings ||--|| settings : "singleton row (bank details)"

    orders {
        uuid id PK
        text order_number UK "AIR-YYYY-NNNNNN"
        text name
        text last_name
        text phone
        text email
        text customer_email "duplicate of email"
        text delivery_address
        text delivery_city
        text delivery_province
        text installation_notes
        text notes
        jsonb items "denormalised duplicate of order_items"
        int total_zar "integer RAND"
        int subtotal_zar
        int installation_total_zar
        int kit_total_zar
        int maintenance_total_zar
        int warranty_total_zar
        int discount_total_zar "never written"
        text channel "whatsapp|email|both"
        text status "submitted|sent_whatsapp|email_sent|completed|cancelled"
        text payment_method "payfast|manual_eft"
        text payment_status "7 values; refunded unreachable"
        text payment_provider "duplicate of payment_method"
        text payment_reference "never written"
        text provider_transaction_id
        timestamptz paid_at
        uuid secure_token
        text idempotency_key "unique partial idx"
        text whatsapp_url
        timestamptz expires_at "48h"
        timestamptz created_at
        timestamptz updated_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id "no FK to products"
        uuid variant_id "never populated"
        text product_name_snapshot
        text product_slug
        text sku_snapshot "never written"
        int quantity
        int base_unit_price_zar
        bool has_installation
        text installation_tier_id
        int installation_price_zar
        jsonb kit_configuration
        int kit_price_zar
        text maintenance_plan_id
        int maintenance_price_zar
        text warranty_option_id
        int warranty_price_zar
        int line_total_zar
    }

    payments {
        uuid id PK
        uuid order_id FK
        text provider_code "no FK to payment_providers"
        text provider_transaction_id "indexed, not unique"
        int amount_zar
        text status "pending|processing|paid|failed|cancelled|refunded"
        text payment_reference
        jsonb provider_response "last-write-wins"
        timestamptz created_at
        timestamptz updated_at
    }

    payment_providers {
        uuid id PK
        text code UK
        text name
        text description
        bool is_enabled
        int sort_order
        jsonb configuration "never read by code"
    }
```

## Issues

| ID | Sev | Issue | Evidence |
|---|---|---|---|
| DM-01 | High | **Two divergent order-item representations**: `orders.items` JSONB (written at checkout, used by confirmation page + email) vs `order_items` rows (used by account page). They can silently disagree; the email trigger reads the JSONB. | `actions.ts:286-300, 333-351`; `order-email/index.ts` |
| DM-02 | High | No `deliveries`/`delivery_events`/`drivers`/… — see 02-delivery-audit | — |
| DM-03 | Medium | `orders.status` and `orders.payment_status` overlap semantically (`completed` means paid; `cancelled` exists in both). No canonical order state. | CHECK constraints |
| DM-04 | Medium | `orders.email` and `orders.customer_email` are both written with the same value — redundant; customer-order RLS checks both, doubling confusion | `actions.ts:279-280`; `20260917b` |
| DM-05 | Medium | `payments.provider_code` is free text — no FK to `payment_providers.code`; typos create orphan records | DDL `:134` |
| DM-06 | Medium | `payments.provider_transaction_id` indexed but **not unique** — duplicate ITNs can create conflicting records once more writers exist | `:146` |
| DM-07 | Medium | Amounts are integer **rand** (not cents) — `total_zar integer`. No currency column anywhere; ZAR is implied. Multi-currency or cents would be a breaking change. | `:27`, `:136` |
| DM-08 | Medium | `orders.payment_reference` and `order_items.sku_snapshot`/`variant_id` columns exist but are never written — dead columns signalling unfinished work | grep: `payment_reference` written only on `payments` |
| DM-09 | Medium | `orders.items` JSONB is wiped by the 90-day PII cron (`items='[]'`) — destroying the only item detail on orders where… actually only `status='submitted'` orders are anonymised, so paid orders keep both copies forever. Inconsistent retention. | `20260710085327:91-101` |
| DM-10 | Low | No `currency` column, no `payment_events`, no `refunds`, no `delivery*` tables, no `audit_log` | — |
| DM-11 | Low | `product_id`/`variant_id` in `order_items` have no FK to `products` — snapshots are the intent, but FK-less columns still allow orphan analysis confusion | DDL `:96-97` |
| DM-12 | Info | `secure_token` is a `uuid` with index — adequate entropy (122 bits) for a bearer token; 48h expiry limits window | `:81` |

## Storage-per-order estimate (for sizing model)

| Object | Bytes (approx) |
|---|---|
| `orders` row | ~1.5 KB (PII + address + status fields) |
| `orders.items` JSONB | ~1–3 KB (avg 1.5 items) |
| `order_items` rows | ~0.8 KB × 1.5 avg |
| `payments` row + provider_response | ~2 KB |
| **Total per order (today)** | **~6–8 KB** |
| + to-be payment_events (avg 4) | +3 KB |
| + to-be delivery + events (avg 8) + PoD metadata | +5 KB |
| + PoD photo (Supabase Storage) | +300–800 KB (object storage, not DB) |
