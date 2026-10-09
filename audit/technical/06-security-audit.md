# 06 — Security Audit

Method: static review of auth/session/payment/RLS/webhook code + git history + `pnpm audit`. Historical holes (orders RLS) verified as fixed-and-applied on 2026-08-17; the Sept-25 code hardening is verified **in worktree only — uncommitted**.

## CRITICAL

### SEC-01 — Security fixes uncommitted; production may run vulnerable code
`git status`: 36 uncommitted changes including `src/app/api/payfast/itn/route.ts`, `checkout/actions.ts`, `order-email/index.ts`, `supabase/migrations/20260925_audit_hardening.sql` (untracked), `src/app/(shop)/collections/` (untracked). At HEAD (`1552a6e`):
- `markWhatsAppSent(orderId)` — **unauthenticated order mutation** (anyone flips `orders.status` knowing the UUID).
- ITN route — first-hop XFF (spoofable), `127.0.0.1` in allowlist, missing-IP → skip, no Payfast server validation.
- `order-email` — `if (expectedSecret && …)` → open email relay when env unset; `name`/`notes` unescaped → HTML injection phishing via verified Resend domain.
- Checkout — no compensating deletes; client-trusted `installation_tier_id` (underpayment); `recommendations.ts` filter injection.
**Fix:** commit, deploy, apply `20260925`, verify. Evidence: `git diff HEAD`, `git show HEAD:...` outputs captured during audit.

### SEC-02 — `ORDER_WEBHOOK_SECRET` committed to git history
`supabase/migrations/20260710085328_order_email_webhook.sql:9` hardcodes `78bb4e3f3d295eef30add42f9092f0118b8466f7ccfb84e585e45a9769ad50f8` and the Supabase project URL. Anyone with repo access (incl. history) can trigger order emails. **Rotate:** edge-fn env var + rewrite `notify_order_email()` trigger function. Consider moving the secret into a vault table or edge-fn env rather than function body.

### SEC-03 — Pending migration leaves two holes open
Until `20260925_audit_hardening.sql` is applied and verified in prod:
- `anon` retains `INSERT ON orders` → PostgREST spam bypasses rate limit/Turnstile/server pricing and fires the email trigger.
- `settings` SELECT policy `USING (true)` for `authenticated` → any registered account reads banking details (`20260817c`).
**Status:** UNKNOWN — requires dashboard verification (`pg_policy` query included at file end).

## HIGH

### SEC-04 — next@16.3.6 vulnerable to 5 high advisories (fixed ≥16.3.8)
`pnpm audit --prod`: image-optimization SSRF (GHSA-cjq9-62q9-8jv4), sharp CVE-2026-96889, source-map-js DoS, browserslist ×2; + 5 moderate/low Next.js items (SSG/ISR cache poisoning, draft-mode leak, metadata disclosure).

### SEC-05 — Rate limiting fails open and keys on spoofable IP
- `actions.ts:150-177` + `order-confirmed/page.tsx:47-77`: if `UPSTASH_*` unset → **no rate limit at all** (absent locally; prod UNKNOWN).
- IP taken from `x-forwarded-for.split(",")[0]` — **client-controllable** → trivially rotated to bypass the 5-per-10min checkout cap. Use `x-real-ip`/rightmost hop as the ITN fix did.

### SEC-06 — Turnstile fails open
`verifyTurnstile` returns early when `TURNSTILE_SECRET_KEY` unset (`actions.ts:135`). Checkout then has only the honeypot. Fail-open-by-design is acceptable for launch but must be an explicit ops checklist item before traffic spend.

### SEC-07 — No security headers
No CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy` — `next.config.ts` has no `headers()`, middleware sets only `no-referrer`/`noindex` on order-confirmed. On Vercel, HSTS/CSP must be configured explicitly.

## MEDIUM

### SEC-08 — Payfast latent risks (before enabling)
- `PAYFAST_PASSPHRASE` optional → signature forgeable (warn-only, `payfast.ts:139`); should hard-fail when provider enabled in live mode.
- `order-confirmed` token appears in `return_url`/`cancel_url` sent to Payfast — acceptable but ensure `no-referrer` retained.
- No replay detection beyond `payment_status==='paid'` early-return (acceptable).
- ITN route excluded from middleware (correct) but no request-size cap — form bodies unbounded (Next default limits apply).

### SEC-09 — Auth actions lack app-layer rate limiting
`login`, `signup`, `requestPasswordReset` rely on Supabase-side throttling only. Add Upstash buckets per IP+email before marketing-driven traffic.

### SEC-10 — Error messages leak internals
`submitCheckout` returns `error.message` for non-zod errors (`actions.ts:444`) — DB constraint text could reach the browser. Map to fixed strings.

### SEC-11 — `secure_token` = bearer capability in URL
128-bit unguessable + rate-limited + `no-referrer` + noindex — sound. Residual: URL in browser history/log files; consider POST-based lookup or shorter-lived tokens for EFT after payment.

## Verified SAFE (recorded for completeness)
- Service-role key confined to server modules; `.env*` gitignored, never committed (git log clean).
- Anon SELECT on `orders`: revoked (2026-08-17 migrations).
- SQLi: PostgREST builder everywhere (post-fix recommendations included).
- Open redirects: `safeNext` + guarded `next` params.
- CSRF: server actions + SameSite cookies; checkout needs no cookies.
- Order IDOR: UUID+token or email-match RLS only; no sequential-ID enumeration path (order_number enumerable but grants nothing).
- XSS: React-escaped; `dangerouslySetInnerHTML` only for JSON-LD (`page.tsx:535,539`) and static `<style>` — no user input.
- Signup enumeration: handled via empty-identities check.

## Compliance notes (POPIA/GDPR-adjacent)
- Consent checkbox required at checkout (`consent` zod refine) ✅
- Cookie consent banner gates `generate_lead` (`LeadTracking.tsx:15-18`) ✅
- Privacy/terms pages exist ✅
- PII at rest: plaintext (Postgres storage-level encryption only) — acceptable, document.
- PII retention: incomplete (see DB-01) — addresses survive anonymization; completed orders never anonymized.
- No data-export/deletion self-serve for accounts — POPIA access requests are manual.
