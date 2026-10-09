# 09 — Security & Compliance Deep-Dive

## Verified-safe controls (re-tested this pass)

| Control | Evidence |
|---|---|
| Service-role key never imported by `"use client"` files | `src/lib/supabase-service.ts` + grep over client components |
| Server-side price resolution; client prices display-only | `server-pricing.ts`, `actions.ts` |
| Order reads require UUID + `secure_token` or email-match RLS | `order-confirmed/[token]/page.tsx:98-131`, migrations 20260917* |
| Anon SELECT on orders revoked (2026-08-17 migrations) | `20260817*` files |
| Auth session revalidated via `getUser()` (not `getSession`) in middleware + account layout | `middleware.ts`, `account/layout.tsx` |
| Open-redirect guarded (`safeNext`, `next` param checks) | `(auth)/actions.ts:26-31`, `auth/callback` |
| Checkout: honeypot + Zod + optional Turnstile + optional Upstash rate-limit + idempotency | `checkout/actions.ts` |
| ITN: IP allowlist (dev-only localhost), x-real-ip/rightmost-XFF, signature, Payfast `/eng/query/validate`, merchant-id, exact-cents amount, idempotent | `itn/route.ts`, `payfast.ts` |
| Email HTML escaping + fail-closed webhook secret | `order-email/index.ts` |
| CSRF | Server actions rely on SameSite cookies; checkout is cookieless — OK |
| PCI scope | Card data never touches the app (hosted Payfast) |

## Open risks (ordered by severity)

### Critical
1. **Unverified DB hardening** (F-01): `REVOKE INSERT ON orders FROM anon` + settings RLS + `generate_order_number` EXECUTE revoke ship in `20260925_audit_hardening.sql` but must be applied manually. **Action:** run it in the dashboard, then verify as anon: `select * from orders` → permission denied; `insert into orders ...` → denied.
2. **Committed webhook secret** (F-02): `ORDER_WEBHOOK_SECRET` in `20260710085328_order_email_webhook.sql` git history. **Action:** rotate value in edge-fn env + DB trigger function; consider `git filter-repo`/BFG or accept history exposure after rotation.

### High
3. **No admin authorization surface yet** — when G-01 admin panel is built, every action must check `admins` membership server-side; the existing RLS policies for admin reads of orders/settings are already correct foundations.
4. **Optional defenses silently disable** (F-17): without `UPSTASH_*` checkout has no rate limit; without `TURNSTILE_SECRET_KEY` no CAPTCHA. **Action:** verify prod envs; consider fail-closed in production NODE_ENV.
5. **Rate-limit IP source**: `actions.ts` uses **first** XFF hop (`split(",")[0]`) — the spoofable end, inconsistent with the ITN route's corrected rightmost-hop logic. Client can rotate fake XFF entries to evade checkout limits. **Fix:** use `x-real-ip` then rightmost XFF, same as `itn/route.ts`. — *NEW finding this pass.*

### Medium
6. **Sequential order numbers** (`AIR-YYYY-NNNNNN`) are enumerable — reads are still token-gated, but the ITN `m_payment_id` path and any future order-lookup-by-number endpoint must require the token or a second factor (phone match).
7. **`order-email` payload trust**: edge fn trusts `order.email` from the INSERT record; with anon INSERT revoked this is fine — keep the dependency explicit.
8. **Turnstile + rate-limit race**: limits are checked before pricing queries — good; keep order-of-operations cheap-first.
9. **`.env.local.backup`** plaintext secret backup on dev disk — delete or vault it.
10. **ITN `failed`/`cancelled` can overwrite `processing`** — acceptable ordering semantics; ensure it can't overwrite `paid` (currently guarded by early-return on `paid` ✅ — keep a test).

### Low
11. No CSP/HSTS/`X-Content-Type-Options`/`frame-ancestors` headers — add to `next.config.ts`.
12. `expires_at` still hard-gates non-EFT orders at 48h — a Payfast customer returning late gets 404 (payment succeeded). Acceptable but consider extending for `payment_status='paid'` so customers can revisit their receipt.
13. Raw product `slug`/`name` interpolated into JSON-LD — React escapes the script tag content risk minimally; keep `JSON.stringify` path, no change needed.

## Compliance matrix (South Africa)

| Regulation | Requirement | State | Action |
|---|---|---|---|
| POPIA | Lawful processing + consent | ✅ consent checkbox required; cookie consent deny-by-default | — |
| POPIA | Data minimization/retention | ⚠️ 90-day anonymization only for `submitted` orders | extend to terminal states; document |
| POPIA | Access/deletion rights | ⚠️ privacy page promises; no tooling | self-service or documented manual SLA |
| CPA s.16/29 | Honest representations | ❌ fake ratings (F-04) | remove or source real reviews |
| CPA/ECT Act | Supplier identity, T&Cs, returns, cooling-off | ✅ pages exist (`/terms`, `/return-policy`, `/warranty`) | legal review of content |
| VAT Act | Tax invoices | ❌ none | G-04 |
| SARS/recordkeeping | Order/payment records | ✅ persisted | add invoice numbering |
| PCI-DSS | Card data | ✅ out of scope (hosted Payfast) | — |
| Email marketing | Opt-in + unsubscribe | n/a (dead form) | implement with newsletter (G-10) |

## Security TODO shortlist (execution order)

1. Apply `20260925_audit_hardening.sql`; verify with anon queries. 
2. Rotate `ORDER_WEBHOOK_SECRET` (edge fn env + trigger def).
3. Fix checkout rate-limit IP extraction to match ITN route.
4. Prod env audit: Upstash, Turnstile, Resend, Payfast, GTM/GA.
5. Security headers.
6. Sentry + alerting.
7. `pnpm audit --prod` + `supabase db advisors` in CI.
