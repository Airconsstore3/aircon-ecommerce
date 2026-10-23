# P0 Security Fix — Supabase Actions Required

**Status: NOT APPLIED (confirmed by owner, 2026-10-09). This is the single most important fix.**

## What F-01 is

Migration `supabase/migrations/20260925_audit_hardening.sql` was written but **never run in production**. Until it runs, the database still carries:

1. **`public_can_submit_orders` policy + table-level `INSERT` grant to `anon`** — anyone on the internet can POST forged rows into `orders` via the Supabase REST API (`POST /rest/v1/orders`), bypassing Turnstile, rate limiting, and server-side pricing — and firing the order-email trigger, which emails forged order confirmations to the owner inbox.
2. **Possibly re-creatable insecure read policies** — the older fixes dropped them, but this migration re-asserts the drops.
3. **`EXECUTE` on `generate_order_number()` granted to PUBLIC** — callable over RPC to consume order-number sequences.
4. **`settings` readable by any authenticated user** — banking details exposure (`bank_name`, `account_number`, `branch_code`).

## Step 1 — Apply the hardening migration

1. Open https://supabase.com/dashboard → your project → **SQL Editor** → **New query**.
2. Paste the **entire contents** of `supabase/migrations/20260925_audit_hardening.sql` (repo file — do not retype).
3. Run it. It is idempotent (all statements are `DROP IF EXISTS` / `REVOKE` / guarded `DO` blocks).
4. The final `SELECT` should show: **no `orders` policies granting anything to `anon`**, and `settings` readable only by `authenticated` users who are members of `admins` (or no settings policy at all).

Also apply the new model migration while you're in there:

5. Paste and run `supabase/migrations/20261009_enquiry_delivery_model.sql` (adds `orders.delivery_tier`, allows `status='confirmed'` which gates banking details, disables the `payfast` provider row, deactivates `deals` rows).
6. Record both in the migration history so `supabase db` tooling stays consistent:
   ```sql
   insert into supabase_migrations.schema_migrations (version, name)
   values ('20260925', 'audit_hardening'), ('20261009', 'enquiry_delivery_model')
   on conflict do nothing;
   ```
   (If that table doesn't exist, skip — it only matters if you later adopt `supabase db push`.)

## Step 2 — Verify F-01 is closed

In the SQL Editor or REST client:

```sql
-- Should return permission denied / empty for anon
select * from orders limit 1;            -- run as anon role → must fail
insert into orders (name, phone, delivery_address, delivery_city, delivery_province, consent_accepted, payment_method, channel)
values ('x','x','x','x','x',true,'manual_eft','email');  -- as anon → must fail
```

Or via curl (must return 401/permission denied):
```bash
curl -X POST "https://<project-ref>.supabase.co/rest/v1/orders" \
  -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"name":"test","phone":"+27123456789","delivery_address":"x","delivery_city":"x","delivery_province":"x","consent_accepted":true,"payment_method":"manual_eft","channel":"email"}'
```

## Step 3 — Rotate `ORDER_WEBHOOK_SECRET`

The secret is committed in git history (`supabase/migrations/20260710085328_order_email_webhook.sql`) — treat as compromised. **It is still in active use** by the `order-email` edge function (it authenticates the DB→edge-function webhook; it has nothing to do with Payfast — keep the code, rotate the value).

1. Generate a new secret: `openssl rand -hex 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
2. **Supabase dashboard → Edge Functions → order-email → Secrets**: set `ORDER_WEBHOOK_SECRET=<new>`.
3. **Update the DB trigger's webhook call** so it sends the new secret. Find the trigger:
   ```sql
   select tgname, tgrelid::regclass, pg_get_triggerdef(oid) from pg_trigger
   where tgname ilike '%email%' or pg_get_triggerdef(oid) ilike '%order-email%';
   ```
   The webhook payload header (set in `net.http_post` headers or the trigger function) contains the old secret — update that function/setting to the new value. If the secret is stored in a `vault` secret or `app.settings`, update it there; if hardcoded in the trigger function, `CREATE OR REPLACE` the function with the new value.
4. **Redeploy/verify**: place a test order → confirm owner + customer emails still arrive. A stale secret returns 401 in edge function logs (Supabase → Edge Functions → order-email → Logs).
5. Optionally purge history: the committed migration file can't be un-committed without rewriting history — rotating makes the leaked value dead, which is sufficient. Do NOT commit the new secret.

## Step 4 — Post-fix checklist

- [ ] `orders` anon INSERT denied (step 2)
- [ ] `orders` anon SELECT denied
- [ ] `settings` not readable by random authenticated user
- [ ] `generate_order_number()` RPC denied for anon
- [ ] `delivery_tier` column exists: `select delivery_tier from orders limit 1`
- [ ] New `ORDER_WEBHOOK_SECRET` works — test order email received
- [ ] Checkout still works end-to-end after migration (test order through the site)
- [ ] `payfast` row disabled in `payment_providers`
