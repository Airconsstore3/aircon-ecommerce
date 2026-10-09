# 03 — Security Audit (Payments + Delivery)

Scope: payment data flows, order PII, webhook security, secrets, web security headers,
access control, and (prospectively) delivery-security requirements.

## 1. Payment security — card & credential flows

| Check | Result | Evidence |
|---|---|---|
| Card numbers touch our servers? | **NO** — Payfast is a full redirect to `payfast.co.za/eng/process`. No card fields exist in the codebase. | `payfast.ts:114-118`; grep `card|cvv|pan` → nothing |
| Bank credentials stored? | **NO** customer bank data. **Business** banking details are stored in `settings` (by design — shown to customers for EFT). | `settings.bank_*` columns |
| PCI DSS scope | **SAQ-A achievable** — no card capture, storage, or transmission. The entire checkout→Payfast path is a redirect. | — |
| Tokenization | N/A (no stored cards, no recurring) | — |
| 3DS/SCA | Delegated to Payfast hosted page | — |
| Webhook signature verification | YES — MD5+passphrase signature **plus** server-to-server validation POST back to Payfast, **plus** IP allowlist, **plus** merchant_id check, **plus** exact amount match. Strong. | `payfast.ts:146-168`; `itn/route.ts:38-91` |
| Webhook replay protection | Partial — `paid` early-return stops paid-state replays; no nonce/timestamp store, no `provider_transaction_id` uniqueness | `itn/route.ts:94` |
| Idempotency | Checkout `idempotency_key` with unique partial index — good design, weakened by per-click key regeneration (PAY-05) | `CheckoutClient.tsx:99`; `20260812_security_hardening.sql:14-16` |
| Rate limiting on payment endpoints | Checkout: 5/10min per IP via Upstash — **optional (fails open) and IP taken from spoofable first XFF hop**. ITN endpoint: **no rate limit at all** (mitigated by IP allowlist + server validation). `/api/payfast/redirect`: none (token-gated). Order-lookup page: 20/10min per IP+token-prefix. | `actions.ts:150-177`; `itn/route.ts`; `page.tsx:47-77` |
| Secrets in code | **`ORDER_WEBHOOK_SECRET` committed to git** in `20260710085328_order_email_webhook.sql:9` — must be rotated (already flagged in ECOMMERCE_FIX_PLAN). `PAYFAST_*` env vars absent from `.env.local` (Payfast disabled). | migration line 9; `.env.local` keys |
| Secrets manager | None — plain env vars (`.env.local`, Vercel env). Acceptable at this scale; document rotation procedure. | — |
| Logging without PII | Mostly clean — order logs include order_number, totals, method; **not** name/phone/address. ITN logs m_payment_id + amount. `provider_response` stores the full ITN body (contains customer email/name Payfast echoes back) in DB — acceptable but note for PII minimisation. | `actions.ts:315,418`; `itn/route.ts:43-48,123` |
| Refund authorisation | N/A — no refund path exists (gap) | — |
| Admin access to payment data | `payments` SELECT restricted to `admins` members via RLS. No admin UI exists → access = SQL dashboard only. | hardening migration `:152-156` |

## 2. Web security headers

| Control | Status | Evidence |
|---|---|---|
| Content-Security-Policy | **MISSING — no CSP anywhere** (`next.config.ts` has no `headers()`; middleware sets none) | `next.config.ts`; `middleware.ts` |
| SRI on third-party scripts | **MISSING** — `challenges.cloudflare.com/turnstile/v0/api.js` loaded on **every page including checkout** via `next/script` with no integrity attr (Next `Script` doesn't support SRI anyway — needs CSP `script-src` pinning instead). gtag loads sitewide. | `layout.tsx:43-45` |
| Referrer-Policy | Partial — `no-referrer` set only on `/order-confirmed/*`. Secure token nonetheless transits Payfast's URL during redirect (PAY-11). | `middleware.ts:24-27` |
| Other headers (X-Frame-Options, HSTS, etc.) | Not set in app; Vercel provides HSTS at the platform level. X-Frame-Options/frame-ancestors absent — checkout page can be iframed (clickjacking on the consent/submit button). | — |
| CSRF on payment forms | Server actions carry Next's built-in origin checking; the Payfast redirect is a GET link — token-gated, so CSRF risk is low. Honeypot `website` field present. | `actions.ts:51` |
| Tamper detection on checkout page | MISSING — no CSP, no SRI, no subresource integrity | — |
| Dependency audit cadence | No automated audit config found (no dependabot/renovate config, no npm-audit CI). Prior audit bumped Next for 2 critical RCEs — reactive, not scheduled. | repo root |

## 3. Database / RLS posture (payment-relevant)

| Control | Status | Evidence |
|---|---|---|
| `orders` anon SELECT | Fixed 2026-08-17 — no anon SELECT policies remain. `REQUIRES VERIFICATION` in live DB. | `20260817_fix_orders_rls_security.sql`; `20260817b_…`; AGENTS.md says verified |
| `orders` anon INSERT | Revoked by `20260925_audit_hardening.sql` — **per AGENTS.md this must be applied manually; unverified** | `20260925_audit_hardening.sql:20-22` |
| `settings` (banking details) public read | Was `USING (true)` to authenticated → restricted to admins by same **unverified** migration | `20260925_audit_hardening.sql:42-62` |
| `generate_order_number` PUBLIC EXECUTE | Revoked by same migration (SECURITY DEFINER functions are world-callable by default) | `:30-40` |
| Customer order access | `authenticated` users read orders where `lower(trim(email))` matches JWT email — guest orders become visible to whoever registers that email. **Depends on Supabase email-confirmation being enforced — REQUIRES VERIFICATION.** If a user can self-register any email without verification, they inherit that email's order history (PII + totals). | `20260917b_customer_order_access_trim.sql` |
| Payments RLS | SELECT admin-only; no public write policies — service role only. Good. | `:150-156` |
| Service-role client discipline | `serviceRoleClient` used in server actions/routes/server pages only — no `"use client"` imports found. A single misimport exposes everything; no lint rule guards it. | `supabase-service.ts`; grep check |
| PII retention | pg_cron anonymises only `status='submitted'` orders older than 90 days. **Paid/completed orders retain full PII indefinitely** — defensible for financial records, but the retention scope should be a conscious POPIA decision, not a filter artefact. | `20260710085327_checkout_orders_flow.sql:87-103` |

## 4. ITN-specific hardening review (what's good)

The ITN endpoint is the strongest security surface in the codebase:

- IP allowlist with fail-closed unknown-source rejection (`itn/route.ts:38-41`)
- Server-to-server validation — even a perfectly forged signature fails (`payfast.ts:155-162`)
- Merchant ID check (`:164-168`)
- Exact-cent amount match against DB total — no tolerance (`itn/route.ts:86-91`)
- Early return on already-paid (`:94-97`)
- Localhost IPs only allowed outside production (`:8-10`)

Residual risks: no per-ITN dedup by `pf_payment_id` (PAY-07), no rate limit (acceptable
given IP allowlist), and passphrase-optional signing (warn-only — PAY-09 mitigation is
the server validation, which is genuinely authoritative).

## 5. Delivery security (prospective — nothing exists to audit)

Requirements for the to-be system (carried into TRD):

- Driver accounts must be separate RBAC role — **not** `admins` members; least privilege
  (driver sees only assigned deliveries, masked customer PII until en route).
- Driver app session: short-lived tokens, device binding, remote revocation.
- On-site payment: card-present via certified terminal (PCI P2PE) or gateway payment link /
  QR — **never** card-not-present keyed into the app.
- PoD photos/signatures stored in a private Supabase Storage bucket with signed-URL access;
  immutable after capture.
- Delivery OTP: hashed at rest, attempt-limited, single-use.
- GPS data: collected only while on-shift; retention policy; POPIA notice.
- IDOR: every driver/delivery endpoint must verify `driver_id = auth context`, never trust
  path params alone.

## 6. Findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| SEC-01 | High | `ORDER_WEBHOOK_SECRET` committed to git history — rotate in Supabase secrets + update trigger function | `20260710085328_order_email_webhook.sql:9` |
| SEC-02 | High | No CSP anywhere; checkout page loads third-party JS (Turnstile, gtag) with no integrity protection — a compromised CDN/script = payment-page tampering | `next.config.ts`; `layout.tsx:44` |
| SEC-03 | Medium | Checkout rate limit keyed on spoofable `x-forwarded-for` first hop | `actions.ts:156` |
| SEC-04 | Medium | Turnstile & rate limiting fail open when env unset — silent unprotection | `actions.ts:134,153` |
| SEC-05 | Medium | `20260925_audit_hardening.sql` (anon INSERT revoke, settings admin-only) is per docs **applied manually — verify applied in production** | AGENTS.md; migration file |
| SEC-06 | Medium | Customer order access keyed on email match — safe only if Supabase email verification is enforced; otherwise free order-history takeover | `20260917b` |
| SEC-07 | Medium | No audit log for admin actions — `orders`/`payments` UPDATE grant to all `admins` members with no record of who changed payment_status | RLS policies; no `audit_log` table |
| SEC-08 | Medium | Secure token in Payfast return/notify URLs — bearer credential transits third-party logs/browser history | `payfast.ts:95-96` |
| SEC-09 | Low | `provider_response` stores full ITN body incl. customer PII — PII minimisation gap | `itn/route.ts:123` |
| SEC-10 | Low | No clickjacking protection (frame-ancestors/X-Frame-Options) | — |
| SEC-11 | Low | No automated dependency/security scanning in CI | repo root |
| SEC-12 | Info | `serviceRoleClient` unguarded — one `"use client"` misimport leaks all orders; add an ESLint boundary rule | `supabase-service.ts` |
