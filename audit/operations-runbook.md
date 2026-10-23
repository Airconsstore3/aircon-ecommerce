# Operations Runbook — Supabase Dashboard Workflow

**No admin panel exists. All operations are performed in the Supabase dashboard + email/WhatsApp. This caps realistic throughput at roughly 50 orders/week — beyond that, build the admin panel (see roadmap P1).**

Prerequisite: you need a row in the `admins` table with your Supabase Auth `user_id` for any admin-gated policies (e.g. reading `settings`).

```sql
insert into admins (user_id) values ('<your-auth-user-uuid>');
```

## 1. Viewing new orders

Supabase dashboard → **Table Editor → `orders`**, sorted by `created_at` desc.

Every order that matters is `status = 'submitted'` (or `sent_whatsapp`/`email_sent`) with `payment_status = 'pending'`. Filter:

```sql
select id, order_number, name, phone, email, delivery_city, delivery_province,
       delivery_tier, total_zar, status, payment_status, created_at
from orders
order by created_at desc;
```

The customer got a confirmation email automatically (order-email edge function). WhatsApp copy was opened for the customer if they chose it — you are expected to follow up on WhatsApp if `channel` is `whatsapp`/`both`.

## 2. Confirm availability → reveal banking details (the core enquiry-model step)

The confirmation page shows banking details **only when `status = 'confirmed'`**. After you verify stock with the supplier:

```sql
update orders set status = 'confirmed'
where order_number = 'AIR-2026-000123';
```

Then email the customer (from `orders@aircons-store.co.za` or your owner inbox): "Availability confirmed — banking details are now visible on your order page, reference AIR-2026-000123." The customer's link is `https://aircons-store.co.za/order-confirmed/<order.id>?token=<order.secure_token>` — both fields are on the `orders` row.

Also confirm the **delivery fee** at this point:
- `delivery_tier = 'cape_town_free'` → free, no action.
- `delivery_tier = 'quoted'` / `'quote_on_type'` → decide the fee, tell the customer, and add it to `total_zar` (update the row) or quote it as a separate line in your email — record what you quoted in `notes`.

## 3. Mark payment received

When the EFT clears:

```sql
update payments set status = 'completed', paid_at = now()
where order_id = '<order-uuid>';

update orders set payment_status = 'paid', status = 'completed'
where id = '<order-uuid>';
```

## 4. Cancel / refund

```sql
update orders set status = 'cancelled' where id = '<order-uuid>';
update payments set status = 'cancelled' where order_id = '<order-uuid>';  -- or 'refunded' after you refund the EFT
```

Refunds are manual EFTs back to the customer — record the refund reference in `notes`. There is no automated refund path.

## 5. Managing products

Table Editor → `products`:
- New product: insert row (`slug` unique, `is_published`, `price_zar`, `type`, images as text array). For variants: set `is_parent_product = true` on the parent, and `parent_product_id` on each child row, plus `variant_attributes` JSON (e.g. `{"btu": 12000}`).
- Price change: update `price_zar` / `sale_price_zar` on parent **and** each variant row.
- Hide: `is_published = false`.
- Sold out flag: `is_sold_out = true` — shows "Available on request" but **stays orderable** (enquiry model). Availability is confirmed manually per order.

## 6. Enquiries / content tables

- `installation_tiers`, `installation_kits`, maintenance/warranty option tables — edit prices/names directly; checkout re-resolves server-side so DB is authoritative.
- `settings` — `whatsapp_number`, banking details (`bank_name`, `account_number`, `branch_code`), shipping/return copy shown on product pages.
- `page_heroes`, `collections`, `categories`, `promotions` — content blocks.

## 7. Email troubleshooting

Order emails: DB trigger → `order-email` edge function → Resend (from `orders@aircons-store.co.za`). Check Supabase → Edge Functions → `order-email` → Logs for 401 (webhook secret mismatch → rotate per `security-p0-fix.md`) or 5xx. Resend dashboard shows per-email delivery.

## 8. Weekly hygiene

- Check for spam `orders` rows with nonsense data (until hardening migration is applied — see `security-p0-fix.md`).
- Verify payment_status='paid' orders actually cleared in your bank account.
- Confirm `delivery_tier` is populated on new orders (migration 20261009 applied).
