# 13 — Security Controls Matrix

Status: ✅ implemented · ⚠️ partial · ❌ missing · ➖ n/a

## Payment controls

| Control | Status | Evidence / Note |
|---|---|---|
| PCI scope SAQ-A (no card data on servers) | ✅ | Payfast hosted redirect only; zero card fields in code |
| Webhook signature verification | ✅ | MD5+passphrase + server-to-server validation + IP allowlist + merchant_id |
| Webhook idempotency | ⚠️ | `paid` early-return only; no `provider_transaction_id` uniqueness, no event dedup |
| Replay protection | ⚠️ | Relies on idempotent result; no nonce/timestamp store |
| Checkout idempotency | ⚠️ | Unique index exists; client regenerates key per click (GAP-07) |
| Rate limiting — checkout | ⚠️ | Upstash 5/10min; fails open if unconfigured; spoofable first-XFF key |
| Rate limiting — ITN/redirect endpoints | ❌ | ITN mitigated by IP allowlist; redirect has none (token-gated) |
| CAPTCHA (Turnstile) | ⚠️ | Verified only when `TURNSTILE_SECRET_KEY` set — fail-open |
| Honeypot | ✅ | `website` field `z.string().max(0)` |
| Server-side pricing | ✅ | `resolveOrderPricing` — client prices never trusted |
| Amount tamper protection | ✅ | Exact-cent match ITN vs DB total |
| Refund authorisation | ➖ | No refund path exists |
| Secrets in code | ❌ | `ORDER_WEBHOOK_SECRET` committed; rotate |
| Secrets manager | ⚠️ | env vars only; no vault; rotation undocumented |
| CSP on checkout | ❌ | No CSP anywhere in app |
| SRI on third-party scripts | ❌ | Turnstile/gtag unpinned (mitigate via CSP script-src) |
| Clickjacking protection | ❌ | No frame-ancestors/X-Frame-Options |
| TLS/HSTS | ✅ | Vercel platform HSTS |
| PII in logs | ✅ | Payment logs exclude name/phone/address |
| PII retention (POPIA) | ⚠️ | Cron anonymises only `status='submitted'` >90d |
| Payment audit trail | ❌ | No append-only payment_events |
| Admin action audit | ❌ | Admin DB edits unaudited |
| Dependency scanning | ❌ | No CI audit/dependabot config |

## Data-access controls (RLS)

| Control | Status | Evidence |
|---|---|---|
| orders anon SELECT | ✅ | dropped 2026-08-17; **verify still absent in prod** |
| orders anon INSERT | ⚠️ | revoked by 20260925 migration — apply-status unverified |
| orders customer SELECT (email match) | ⚠️ | depends on enforced email verification (GAP-22) |
| payments SELECT admin-only | ✅ | RLS via admins membership |
| payments public writes | ✅ | none — service role only |
| order_items customer SELECT | ✅ | via parent order email match |
| settings (bank details) public read | ⚠️ | restricted to admins by unverified migration |
| SECURITY DEFINER exposure | ⚠️ | `generate_order_number` EXECUTE revoked by unverified migration; `set_order_number`, `notify_order_email` still SECURITY DEFINER + PUBLIC EXECUTE (trigger-invoked internally, but callable via RPC — `REQUIRES VERIFICATION`) |
| payment_providers public SELECT | ⚠️ | `USING (is_enabled)` — config JSONB column publicly readable on enabled rows; keep secrets out of `configuration` |

## Delivery controls (to-be requirements — nothing exists to audit)

| Control | Status | Requirement |
|---|---|---|
| Driver RBAC (not admins) | ❌ | separate `drivers` role; least privilege |
| Driver session security | ❌ | short-lived token, device binding, revocation |
| Driver PII minimisation | ❌ | mask customer phone/address until en route |
| On-site payment device security | ❌ | PCI P2PE terminal or gateway link — never keyed card entry |
| Delivery OTP | ❌ | hashed, single-use, attempt-limited |
| PoD integrity | ❌ | private bucket, signed URLs, immutable after capture |
| GPS privacy | ❌ | on-shift only, retention policy, POPIA notice |
| IDOR on delivery endpoints | ❌ | driver_id from auth context only |

## Shared

| Control | Status | Note |
|---|---|---|
| RBAC tiers | ⚠️ | single `admins` boolean — no staff/dispatcher/driver granularity |
| Audit log (all financial/delivery actions) | ❌ | required for to-be |
| IDOR on order endpoints | ✅ | order reads require UUID+token (server-side) or email-match RLS |
| CSRF | ✅ | server actions + token-gated GETs; honeypot present |
| SQL injection | ✅ | all queries via supabase-js parameterised builder |
| Anomaly alerting | ❌ | none |
