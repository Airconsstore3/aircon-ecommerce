# 12 — To-Be Technical Requirements Document (TRD)

**System:** Aircons Store ecommerce platform
**Status:** Draft v1 — pending answers to open questions (14-open-questions.md)
**Basis:** As-is audit (2026-10-09). Target architecture deliberately preserves the Next.js 16 + Supabase Postgres shape — correct for single-currency, low-volume SA ecommerce.

## 1. Overview

Next.js 16 App Router storefront on Vercel backed by Supabase Postgres/Auth/Edge Functions. Guest checkout with server-resolved pricing; Manual EFT + Payfast payments; order notification via DB trigger → edge fn → Resend; customer accounts for order history. The to-be state adds: committed-and-deployed hardened code, a minimal admin surface, transactional order creation, real monitoring, CI gates, completed PII retention, and honest customer-facing data.

## 2. Goals & non-goals

**Goals**
- G1: Deployed code always equals reviewed code (CI gate + no uncommitted fixes).
- G2: No public write path to `orders` outside the hardened checkout action.
- G3: Payment state transitions are authenticated, idempotent, and audited.
- G4: Order creation is atomic.
- G5: PII is minimized and retention-bounded (POPIA-aligned).
- G6: Failures are visible (alerting) within 5 minutes.
- G7: Customer-facing content is truthful (no fabricated ratings/subscriptions).

**Non-goals**
- NG1: No microservices, no separate commerce engine — out of scale for this store.
- NG2: No real-time inventory/warehouse integration (advisory stock policy is a business choice).
- NG3: No multi-currency/multi-region.
- NG4: No custom auth (Supabase Auth retained).
- NG5: No full SAP/ERP integration.

## 3. Architecture (to-be)

```
Browser ─► Vercel (CDN + WAF-ish edge) ─► Next.js 16 (RSC + actions)
   catalog reads: anon client + RLS, ISR/unstable_cache (60–300s)
   mutations: service role inside server actions / API routes ONLY
Supabase Postgres: tables as today + fulfillment_status + audit_log
   create_order() RPC = single transaction (order + items + payment)
   pg_cron retention v2 (all terminal orders, all PII columns)
   Edge fns: order-email (auth required, escaped), payment-reconcile (cron)
Admin: /admin/* inside this repo — Supabase Auth + admins-table gate
CI: GitHub Actions — install/lint/tsc/test/build/audit/deploy-preview
Observability: Sentry (server+edge), uptime checks, alert channel
```

## 4. Tech stack decisions
| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js ≥16.3.8 | CVE remediation + current stack |
| Package mgr | pnpm (single, `packageManager` field pinned) | lockfile already exists |
| DB access | supabase-js (PostgREST) + RPC for transactions | current pattern, RLS-first |
| Admin | In-repo `/admin` (not nextadmin-template) | single deploy, uses existing `admins` table |
| Email | Resend (keep) + verified domain auth | already integrated |
| Monitoring | Sentry + external uptime | cheapest sufficient coverage |
| E2E | Playwright | standard |

## 5. Data model changes (to-be)
- `orders`: add `fulfillment_status` (`unfulfilled|scheduled|delivered|installed|returned`), keep `payment_status` as sole payment truth on orders; drop writes to `items` JSONB once consumers migrated; complete retention cron coverage.
- `order_items`: canonical line-item source; populate `variant_id` or drop it.
- `payments`: append-only event log `payment_events` (webhook payload + transition) for audit.
- `audit_log`: admin action log (who/when/what on orders).
- `customers`: defer — email-match RLS acceptable until account linking UX exists.
- Variants: drop `is_base_product`/`product_series` after verifying prod FK behavior.

## 6. Requirements

### TR-SEC-001 — Deployed-code integrity
**Priority:** Must
**Description:** All code serving production traffic must be committed to the default branch and deployed via CI.
**Technical requirements:** Branch protection on `main` requiring PR + green CI (lint, tsc, vitest, build, `pnpm audit --prod` max high=0 for direct/next-scoped deps). Vercel connected to `main` only. No direct dashboard SQL changes outside migrations.
**Acceptance criteria:**
- Given a push to main, When CI fails, Then no deploy occurs.
- Given `git status` on the release machine, Then zero uncommitted source files exist at deploy time.
**Dependencies:** repo admin access. **Risks:** none. **Monitoring:** CI failure alerts. **Test notes:** break lint deliberately → expect blocked deploy.

### TR-SEC-002 — Secrets hygiene
**Priority:** Must
**Description:** No secrets in git history or migrations.
**Technical requirements:** Rotate `ORDER_WEBHOOK_SECRET`; store in Supabase edge-fn secrets + Vercel env; webhook secret injected into `notify_order_email()` from a `vault`/`app_settings` table or env — never literal SQL. Add `gitleaks`/`trufflehog` scan to CI.
**Acceptance criteria:**
- Given repo history scan, When gitleaks runs, Then zero live secrets reported (rotated values invalid).
- Given missing `ORDER_WEBHOOK_SECRET`, When edge fn receives POST, Then 500 and no email sent.
**Risks:** edge fn downtime during rotation — coordinate deploy order (new secret → update fn → update edge env). **Monitoring:** edge-fn 4xx rate alert.

### TR-DB-001 — Order RLS closure (verify)
**Priority:** Must
**Description:** Anon has zero grants on `orders`; authenticated reads limited to own orders + admins.
**Technical requirements:** Apply `20260925_audit_hardening.sql`; add a repeatable verification query to CI/docs.
**Acceptance criteria:**
- Given the anon key, When `select * from orders` runs, Then permission denied.
- Given authenticated non-admin user A, When selecting user B's orders, Then zero rows.
**Monitoring:** weekly `pg_policy` snapshot diff. **Test notes:** integration test with two test users.

### TR-PAY-001 — Order creation atomicity
**Priority:** Must
**Description:** `orders` + `order_items` + `payments` created in one DB transaction.
**Technical requirements:** `create_order(payload jsonb) returns jsonb` Postgres function (SECURITY DEFINER, EXECUTE revoked from public); checkout calls RPC; compensating-delete path removed.
**Acceptance criteria:**
- Given a forced `order_items` insert failure, When checkout runs, Then no `orders` row exists.
- Given duplicate `idempotency_key`, Then exactly one order exists (unique index + RPC check).
**Risks:** payload-shape bugs — cover with integration test. **Monitoring:** count of orders with zero order_items must be 0 (alert if >0).

### TR-PAY-002 — Webhook integrity (Payfast go-live gate)
**Priority:** Must (before `payment_providers.payfast.is_enabled=true`)
**Description:** ITN trusted only after layered verification.
**Technical requirements:** trusted IP from `x-real-ip`/rightmost XFF; IP allowlist minus localhost in prod; MD5 signature **with required passphrase** (hard-fail if unset while enabled in live mode); server-to-server validation POST; merchant_id match; exact-cent amount; idempotent transitions; `payment_events` log of every ITN.
**Acceptance criteria:**
- Given a forged ITN with valid-looking signature but no passphrase, When provider enabled+live, Then rejected + alert.
- Given duplicate COMPLETE ITNs, Then exactly one paid transition and one payment_events row each (logged, deduped state change).
**Monitoring:** alert on signature/IP/amount rejections (fraud signal). **Test notes:** Payfast sandbox end-to-end before enabling.

### TR-PAY-003 — Refund & reconciliation support
**Priority:** Should
**Description:** Admin-triggered refund status + periodic reconciliation.
**Technical requirements:** admin action sets `payment_status=refunded|partially_refunded` with audit_log entry; nightly `payment-reconcile` edge fn flags orders `processing` >24h or paid-but-unfulfilled >7d.
**Acceptance:** Given admin refund, Then order+payment updated atomically and audit_log row exists.

### TR-OPS-001 — Admin surface
**Priority:** Must (replaces dashboard-as-admin)
**Description:** `/admin/*` in-repo, gated by `admins` table membership (not just "any authenticated user").
**Technical requirements:** middleware+layout check `admins` membership; orders list (server-paginated), order detail, mark-paid (EFT), refund flag, fulfillment status transitions; every mutation writes `audit_log`; all admin reads via user-scoped client (RLS admin policies), not service role.
**Acceptance criteria:**
- Given non-admin authenticated user, When GET /admin, Then 403/redirect.
- Given admin marks EFT order paid, Then audit_log contains actor, action, order_id, timestamp.
**Risks:** privilege escalation via `admins` writes — restrict `admins` table writes to service role (no client path). **Monitoring:** alert on non-admin 403 bursts.

### TR-SEC-003 — Security headers
**Priority:** Must
**Technical requirements:** `next.config.ts headers()`: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, CSP allowing self + Supabase + Turnstile + gtag (report-only first, enforce after 2 weeks).
**Acceptance:** `curl -I` on `/` returns all headers; CSP report-only shows no breakage for 2 weeks → enforce.

### TR-SEC-004 — Rate limiting (fail-aware)
**Priority:** Must
**Technical requirements:** trusted IP = `x-real-ip` else rightmost XFF (shared helper); checkout 5/10min/IP; order-lookup 20/10min/IP+token-prefix; auth actions 10/10min/IP+email-hash. If Upstash unset in production, log a startup warning metric (fail-open retained deliberately for EFT-only launch; revisit when Payfast enables → recommend fail-closed then).
**Acceptance:** Given 6 checkouts from one IP, Then 6th returns rate-limit error. Given spoofed XFF chains, Then key uses trusted hop.

### TR-DB-002 — PII retention & minimization
**Priority:** Must (POPIA)
**Technical requirements:** retention job covers `delivery_address/city/province`, `last_name`; applies to all terminal states (submitted/cancelled/completed) after defined windows (e.g., anonymize PII at 90d for non-completed, 24 months for completed pending legal review); document retention schedule; account-deletion runbook.
**Acceptance:** Given a 91-day-old submitted order, Then all PII columns anonymized including address.
**Open dependency:** legal retention decision (OQ-04).

### TR-FE-001 — Truthful storefront data
**Priority:** Must (legal)
**Technical requirements:** remove `getPlaceholderRating` rendering (keep schema fields for future real reviews); remove/mock-gate `/account/subscriptions` and `/account/warranties` until backed by tables; deal prices either honored at checkout or advertising copy changed.
**Acceptance:** Given any PDP, When rendered, Then no fabricated review counts. Given account pages, Then no fabricated entitlements.

### TR-OBS-001 — Observability baseline
**Priority:** Must
**Technical requirements:** Sentry on server actions, API routes, edge fn (Deno SDK); structured `console` → JSON logs with order_id correlation; alerts: checkout error-rate, ITN rejections, edge-fn failures, 5xx rate; uptime checks on `/`, `/products`, `/api/payfast/itn` (GET→405 acceptable); weekly DB health snapshot (orders without items, payments divergent from orders).
**Acceptance:** Given a forced exception in a server action, Then event appears in Sentry <60s with order context. Given site down 2min, Then alert fires.

### TR-PERF-001 — Catalog caching
**Priority:** Should
**Technical requirements:** `unstable_cache`/`revalidateTag` on product/category/settings reads (60–300s); `next/image` for all product/hero images with Supabase hostname in `remotePatterns`; compress 4x PNGs → WebP; sitemap cached 1h; CWV budgets: LCP<2.5s, INP<200ms, CLS<0.1 on 4G mobile PDP.
**Acceptance:** Given unchanged product, Then second PDP hit served from cache (verify via timing). Given Lighthouse on PDP, Then budgets met.

### TR-TEST-001 — Test pyramid baseline
**Priority:** Must
**Technical requirements:** unit tests import real modules (extract signature/phone/pricing fns); integration tests against Supabase test project (checkout happy path, RLS denials, ITN forgery rejection); Playwright smoke (browse→cart→EFT checkout→confirmation); coverage ≥80% on `src/lib/**`; all wired into CI as blocking.
**Acceptance:** Given a regression flipping a price, Then CI red. Given anon orders select, Then test proves permission denied.

### TR-DR-001 — Backup & disaster recovery
**Priority:** Should
**Technical requirements:** confirm Supabase backup tier (upgrade to PITR if data warrants); documented restore runbook + quarterly drill; RPO ≤24h, RTO ≤4h targets; weekly `pg_dump` schema+data export to off-site storage (encrypted).
**Acceptance:** Given restore drill, Then test project restored within RTO.

### TR-ENV-001 — Environment hygiene
**Priority:** Must
**Technical requirements:** `.env.example` with all vars + purpose/required-per-env matrix; `packageManager: "pnpm@…"` + `engines.node`; remove `SHADCNBLOCKS_API_KEY` and `.env.local.backup`; staging Supabase project + Vercel preview env.
**Acceptance:** New dev runs app from README+env.example without tribal help.

### TR-API-001 — Error contract
**Priority:** Should
**Technical requirements:** server actions return `{ok:false, code:ERROR_CODE, message:userSafe}` from a fixed enum; internals logged server-side only.
**Acceptance:** Given a DB failure, Then client receives generic code, not constraint text.

## 7. Compliance requirements (to-be)
- POPIA: consent (done), minimization, retention schedule (TR-DB-002), SAR/deletion runbook, PAIA manual reference.
- PCI: out of scope — Payfast hosted redirect keeps SAQ-A posture; never touch card data; keep it that way (NG).
- CPA (SA consumer law): no fake ratings (TR-FE-001); advertised price must equal charged price (deals decision OQ-05).

## 8. Release & rollback plan
- Phase deploys behind migrations-first ordering (migrate → deploy code → verify).
- Vercel instant rollback for app; DB changes forward-fix only (each migration ships a revert script where feasible).
- Payfast enablement = separate gated release: sandbox E2E → live with R1 test order → monitor 48h.

## 9. Technical acceptance criteria (summary)
1. CI green enforced; zero uncommitted source at any deploy.
2. `pnpm audit --prod` → 0 high findings reachable in prod.
3. anon INSERT/SELECT on orders → denied (verified by test).
4. Atomic order creation proven by forced-failure test.
5. ITN forgery attempts rejected + alerted (sandbox test).
6. All PII columns covered by retention job.
7. No fabricated customer-facing data anywhere.
8. Sentry receiving events; uptime alert proven.
9. Security headers verified by `curl`/securityheaders.com ≥A.
10. Order-email secret rotated; old secret rejected.

## 10. Open questions
See `14-open-questions.md` — chiefly: deployment topology confirmation, retention periods (legal), inventory policy, deals pricing policy, admin scope, analytics IDs, email DNS status.
