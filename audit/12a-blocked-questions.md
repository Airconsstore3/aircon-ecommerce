# 12a — Blocked Questions (info still needed)

| # | Question | Specific information needed | Who provides it |
|---|---|---|---|
| Q-11 | Real order volume and AOV | Weekly/monthly order count and average order value — drives whether the dashboard-only workflow is sustainable | Owner |
| Q-13 | Production env matrix | Which of `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `OWNER_EMAIL`, `ORDER_WEBHOOK_SECRET`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL` are set in Vercel — values NOT needed, just set/unset per var | Owner (Vercel → Settings → Environment Variables) |
| Q-14 | Variant FK behavior in prod | Run this in Supabase SQL Editor and report output — see below | Owner (SQL below) |
| Q-15 | Staging environment | None found in repo (no staging Supabase project config, no preview branch setup). **HIGH finding**: all changes test only against prod. To create one: (1) create a second Supabase project "aircons-staging", (2) `supabase link` + `supabase db push` migrations, (3) run `scripts/seed.ts` against it, (4) add Vercel preview env vars pointing at staging | Owner + DevOps |
| Q-16 | Package manager | Both `pnpm-lock.yaml` and `pnpm-workspace.yaml` exist; no `package-lock.json`; docs say `npm run *`. **Recommendation: standardize on pnpm** (`pnpm dev/build/test`), add `"packageManager": "pnpm@x"` to package.json, delete npm docs references | Owner decision |
| Q-17 | SPF/DKIM/DMARC | DNS records for `aircons-store.co.za` — must have Resend DKIM CNAMEs + SPF include + DMARC policy before order emails are reliable | Owner (check in Resend dashboard → Domains) |
| Q-20 | Legal review | `/terms`, `/privacy`, `/return-policy`, `/warranty` need CPA/ECT Act review by a lawyer — content was AI-generated | Owner + legal counsel |

## Q-14 verification query

Run in Supabase dashboard → SQL Editor:

```sql
SELECT con.conname AS constraint_name,
       con.confdeltype AS delete_rule,  -- 'c' = CASCADE, 'n' = SET NULL, 'r' = RESTRICT
       rel.relname AS child_table,
       parent.relname AS parent_table
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_class parent ON parent.oid = con.confrelid
WHERE con.contype = 'f'
  AND parent.relname = 'products'
  AND rel.relname = 'products';
```

Report which `delete_rule` is returned for the `parent_product_id` foreign key.
Also run:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('is_base_product', 'product_series', 'is_parent_product', 'variant_attributes');
```

to confirm which variant-scheme columns actually exist in prod.
