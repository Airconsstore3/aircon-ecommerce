# Admin Flows Audit (B1–B20)

**Headline finding: there is no admin UI in this codebase.** No `/admin` route exists;
`nextadmin-template/` is a separate, gitignored project on disk (not deployed, not
wired in — ARCHITECTURE_AUDIT.md §2). The `admins` table + admin-scoped RLS policies
exist (`20260710085327_checkout_orders_flow.sql:3-17`, `20260812:192-205`), and the
intended admin surface is the **Supabase dashboard** itself (SQL editor / table editor /
Auth panel). `ADMIN_SETUP_GUIDE.md` is a manual dashboard-runbook, confirming this.

Every flow below is therefore either "MISSING — performed ad-hoc in the Supabase
dashboard" or "MISSING entirely". The dashboard path is technically workable for a
one-person store but is unauthenticated-by-app-roles (anyone with project access =
full DB), untrained-user-hostile, audit-log-free, and one typo away from production
damage.

## B1. Admin login — **MISSING (in-app)**

- No `/admin` route, no role-gated UI. `admins` table (`user_id → auth.users`) exists
  and RLS honours it, but an admin signs into the same customer UI where nothing
  admin-flavoured renders. Admin access = Supabase dashboard membership. REQUIRES
  VERIFICATION: who has Supabase org access; MFA on dashboard accounts.

## B2. Dashboard overview — **MISSING**

- No orders-today, pending-EFT, revenue, or low-stock view anywhere.

## B3–B5. Product create / edit / delete-archive — **MISSING (dashboard-only)**

- Products are edited via SQL/table editor or the `scripts/` utilities
  (`scripts/seed.ts`, `run-migrations.*`). `is_published` is the archive flag —
  enforced everywhere reads happen (`filterProducts.ts:13`, `server-pricing.ts:290`).
- **Hazard:** two coexisting variant FKs (`ON DELETE CASCADE` in
  `20250728_add_product_variants.sql` vs `ON DELETE SET NULL` in
  `supabase-migration-variants.sql`) — deleting a parent may cascade or orphan
  depending on which constraint actually exists in prod. REQUIRES VERIFICATION.

## B6. Variant management — **MISSING (dashboard-only)**

- `variant_attributes` JSONB + `variant_order` edited by hand. No validation UI; a
  mistyped attribute key silently breaks the selector mapping on PDP.

## B7. Inventory update — **MISSING / decorative**

- `stock_count`, `is_sold_out`, `low_stock_threshold` exist and render as badges;
  **nothing decrements them on order**. The only enforcement is `is_sold_out`
  rejected at checkout (`server-pricing.ts:317-319`). Updates are manual.

## B8. Category management — **MISSING (dashboard-only)**

- `categories`/`collections`/`product_collections` managed via SQL. No UI.

## B9. Order list — **MISSING (dashboard-only)**

- No admin order list in-app. Admins can SELECT orders via RLS, but the practical
  path is the table editor — no filtering UI, no sorting, no pending-EFT queue.

## B10. Order detail — **MISSING (dashboard-only)**

- Full order detail (incl. `order_items`, `payments`) only via table editor / SQL.

## B11. Order status update — **MISSING (dashboard-only) — Critical**

- The only code paths that mutate `orders.status`/`payment_status` are checkout
  (`submitted`/`pending`), `markWhatsAppSent`, the ITN handler, and the 90-day
  anonymisation cron. **EFT payment confirmation — the store's only live payment
  method — has no implementation path at all.** Someone must manually flip
  `payment_status`/`status` in the dashboard. This is the operational heart of the
  business and it is a raw SQL UPDATE.

## B12. Fulfillment — **MISSING**

- No fulfillment entity, state, or UI. `status='completed'` is set by the Payfast
  ITN to mean "paid" — delivery/installation scheduling is entirely offline
  (phone/WhatsApp, untracked).

## B13. Shipping label / tracking — **MISSING**

- No carrier integration, no tracking fields populated.

## B14. Refund / partial refund — **MISSING**

- Enum values exist (`refunded`, `partially_refunded`) but nothing writes them and
  no Payfast refund API call exists. Refunds = manual bank transfer + manual SQL.

## B15. Cancel order — **MISSING**

- `status='cancelled'` exists; only the 90-day PII cron writes it. No admin/cust
  cancel path.

## B16. Customer management — **MISSING**

- No `customers` table; customer view = `auth.users` + scattered `orders` rows.
  No merge, no notes, no POPIA export/delete tooling (PII cron covers `orders`
  only, not `auth.users`).

## B17. Coupon / discount management — **MISSING**

- `promotions` rows are SQL-managed display banners; no coupon engine exists.

## B18. Reports / analytics — **MISSING**

- No reporting. `generate_lead` conversions only (if GA/GTM env set — REQUIRES
  VERIFICATION). No revenue/export views.

## B19. Role / permission management — **MISSING**

- `admins` membership managed by SQL INSERT. Single role only.

## B20. Audit log review — **MISSING**

- No audit trail on orders/payments/products. `console.log` in server actions is
  the only trace (ephemeral in serverless logs — REQUIRES VERIFICATION of log
  retention).

---

### Admin readiness verdict

| Capability | Reality |
|---|---|
| See new orders | Owner email (email channels) + WhatsApp msg + dashboard |
| Confirm EFT payment | Manual SQL edit — **the Critical operational gap** |
| Manage catalog | SQL/table editor (workable, fragile) |
| Fulfil/track/refund | Nothing |
| Reporting | Nothing |
| Access control | Supabase project membership (binary, broad) |

**Recommendation (P0):** minimal `/admin` surface inside this app — session +
`admins` membership guard; order list (pending-first) → detail → "mark paid /
cancelled / add note". That single page converts the store from "orders pile up in
a table" to an operable business.
