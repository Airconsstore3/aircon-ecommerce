# 05 — Database Audit

Source of truth: `supabase/migrations/*.sql` (34 files) + `supabase-migration-variants.sql` (repo root, dashboard-applied). Live prod schema not directly queried — drift vs migrations is **UNKNOWN — REQUIRES VERIFICATION**. Evidence: `supabase/.temp/linked-project.json` (project `mrufsvbnxysgpjpnpuhb`).

## Schema summary

| Table | Purpose | RLS | Notes |
|---|---|---|---|
| `products` | Catalog (438 rows: 194 parents + 244 variants) | ✅ public SELECT `is_published` | Flat table; variants via `parent_product_id`. Money in **integer ZAR** — no cents |
| `categories` | Product categories | ✅ | `ON DELETE RESTRICT` from products |
| `collections` | Curated groups | ✅ | Added 2026-08-07 |
| `deals` | Promotions | ✅ | Deal ≠ priced discount — display-only; checkout charges catalog price |
| `orders` | Orders + PII | ✅ (post-fix) | `secure_token` UUID, `idempotency_key` (partial unique idx), `expires_at` 48h default, CHECK constraints on status enums |
| `order_items` | Normalized line items | ✅ admin + owner-email | `variant_id` never populated; FK `ON DELETE CASCADE` |
| `payments` | Payment records | ✅ admin-only | `status`/`orders.payment_status` duplicated — can diverge |
| `payment_providers` | Provider toggles | ✅ public read enabled-only | payfast=false, manual_eft=true |
| `settings` | Business config + **banking details** | ✅ | Policy `USING (true)` for all authenticated users until 20260925 applied (pending manual run) |
| `admins` | user_id allowlist | ✅ self-read | No admin UI uses it yet |
| `installation_tiers`, `installation_kits`, `pipe_*`, `bracket_options`, `insulation_options`, `protective_cage_options`, `installation_pricing_rules`, `installation_kit_*_compat` | Kit configurator | ✅ public read | Server re-resolves all prices |
| `maintenance_plans`, `maintenance_plan_services`, `maintenance_pricing_rules`, `maintenance_eligibility_rules` | Maintenance | ✅ public read | Same |
| `warranty_options`, `warranty_pricing_rules`, `warranty_terms` | Warranties | ✅ public read | Same |
| `promotions`, `page_heroes` | Marketing content | ✅ | — |

## RLS timeline (verified in migrations)
1. `20260812_checkout_payment_hardening.sql:208` created **"Public can read own order by token"** with `USING (secure_token IS NOT NULL)` — trivially true → **anon could SELECT all orders** (names, phones, emails, addresses, totals, tokens).
2. `20260813_combined_migration.sql` carried the same policy (drop added at end in worktree).
3. `20260817_fix_orders_rls_security.sql` + `20260817b` dropped both insecure policies — **applied & verified** (AGENTS.md).
4. `20260917_customer_order_access.sql` added email-match policies for customers' own orders — reasonable.
5. `20260925_audit_hardening.sql` revokes `INSERT ON orders FROM anon` + restricts `settings` to admins + revokes PUBLIC EXECUTE on `generate_order_number` — **untracked file, pending manual application**.

## Defects & design issues

| # | Issue | Evidence | Severity |
|---|---|---|---|
| DB-01 | **PII retention cron incomplete**: nightly job anonymizes name/phone/email/notes/items/whatsapp_url but leaves `delivery_address`, `delivery_city`, `delivery_province`, `last_name` intact — only for `status='submitted'` orders; completed orders never anonymized | `20260710085327:87-103` | High |
| DB-02 | `orders.items` JSONB duplicates `order_items` — two sources of truth, nothing enforces consistency | `actions.ts:286-300` | Medium |
| DB-03 | `orders.email` + `orders.customer_email` duplicated; RLS reads both | `actions.ts:279-280` | Low |
| DB-04 | `payments.status` vs `orders.payment_status` dual status fields, non-transactional updates | `itn/route.ts:102-144` | Medium |
| DB-05 | **Two variant systems coexist**: `20250728_add_product_variants.sql` (`is_base_product`, `product_series`, `ON DELETE CASCADE`) vs root `supabase-migration-variants.sql` (`is_parent_product`, `variant_attributes`, `ON DELETE SET NULL`). Code uses the latter; which FK exists in prod is UNKNOWN — deleting a parent could cascade-delete 244 variants or orphan them | both files | Medium |
| DB-06 | Integer-ZAR money — no cents anywhere (`price_zar INTEGER`); a future cent-priced item breaks inserts | `20250629_create_products_table.sql:12` | Low |
| DB-07 | No fulfillment model — `status='completed'` means "paid", not delivered; no tracking/carrier fields | orders CHECK constraint | Medium |
| DB-08 | `stock_count`/`is_sold_out` never decremented — inventory advisory only; worktree resolver now rejects `is_sold_out` but no quantity enforcement | `server-pricing.ts:317` | Medium (business decision) |
| DB-09 | `orders.secure_token` has an index (`idx_orders_secure_token`) though lookups are by id+token compare — fine, but token also embedded in `whatsapp_url`-adjacent flows | — | Low |
| DB-10 | No `customers` table — order↔account linkage by email-string match; customer can't change email without losing order history | `20260917` | Low |
| DB-11 | Migration hygiene: dashboard-applied SQL files at repo root (`supabase-migration-variants.sql`) outside `supabase/migrations/`; combined migration duplicates earlier ones | repo root | Low |

## Query patterns
- All PostgREST builder calls — SQLi-safe except pre-fix `recommendations.ts` (raw string `in` list, fixed in worktree).
- Catalog reads use anon client + RLS (`is_published`); server reads use service role.
- Indexes present on hot paths: `products.slug`, `category_id`, `is_published` (partial), `orders.order_number`, `secure_token`, `payment_status`, `idempotency_key` (partial unique), `order_items.order_id`, `payments.order_id`.
- No N+1 in checkout (single `.in("id", …)` product fetch + 4 parallel config fetches).
- Sitemap does full-table `products` scan each render — fine at 438 rows, consider cache header.

## Backup / DR
- UNKNOWN — relies on Supabase plan defaults (PITR availability depends on tier). No documented RTO/RPO, no restore runbook, no export scripts.

## Migrations governance
- No CI check that migrations match prod. `20260925_audit_hardening.sql` must be **manually** applied in dashboard and verified (`SELECT … FROM pg_policy`).
- `supabase/config.toml` + `.temp/linked-project.json` indicate CLI linkage exists — prefer `supabase db push`/migration workflow over manual dashboard edits.
