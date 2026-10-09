# 13 — Technical Roadmap

Owner legend: **Dev** = app engineer · **Ops** = whoever holds Vercel/Supabase/DNS access · **Biz** = business decision required.

## Phase 0 — Emergency (0–2 weeks). All P0, mostly S effort.

| # | Action | Priority | Impact | Effort | Owner | Acceptance |
|---|---|---|---|---|---|---|
| R-01 | **Commit + push all worktree changes; deploy; verify prod runs hardened code** | P0 | Closes unauth order mutation, open email relay, spoofable ITN | S | Dev+Ops | `git status` clean; prod `itn/route.ts` behavior verified via forged request → 403 |
| R-02 | **Apply `20260925_audit_hardening.sql` in Supabase dashboard** + run built-in verify query | P0 | Closes anon INSERT on orders + settings exposure | S | Ops | Anon `select * from orders` → permission denied; `pg_policy` output archived |
| R-03 | **Rotate `ORDER_WEBHOOK_SECRET`** — new value in edge-fn env + updated `notify_order_email()` | P0 | Committed secret retired | S | Ops | Old secret → 401; new order → email sent |
| R-04 | **Upgrade next + eslint-config-next → 16.3.8**; rebuild; redeploy | P0 | Clears 9/12 prod advisories incl. image SSRF | S | Dev | `pnpm audit --prod` → 0 next-scoped highs; build passes |
| R-05 | **Add GitHub Actions CI**: install(frozen) → lint → tsc → vitest → build → audit; required on main | P0 | Prevents recurrence of R-01 class of failure | S | Dev | Failing check blocks merge |
| R-06 | Delete `.env.local.backup`; remove `SHADCNBLOCKS_API_KEY`; delete `nul` artifact; add `.env.example` | P0 | Secrets hygiene | S | Dev | Files gone; env.example committed |
| R-07 | Fix rate-limit IP extraction (x-real-ip/rightmost XFF shared helper) | P0 | Bot/spam protection actually binds to real IPs | S | Dev | Spoofed XFF chains share one bucket |
| R-08 | Remove fake ratings render + mock account pages (or feature-flag off) | P1-early | CPA/legal exposure | S | Dev | No fabricated data on PDP/account |

## Phase 1 — Hardening (2–6 weeks)

| # | Action | Priority | Impact | Effort | Owner | Acceptance |
|---|---|---|---|---|---|---|
| R-09 | Security headers suite (CSP report-only → enforce) | P1 | OWASP baseline | S | Dev | securityheaders.com ≥ A |
| R-10 | Sentry + uptime monitoring + alert rules (checkout errors, ITN rejects, edge fn, 5xx) | P1 | Failures visible <5min | S | Dev+Ops | Forced error → event <60s; downtime → alert |
| R-11 | Retention cron v2 (all PII cols incl. address; all terminal states) | P1 | POPIA | S | Dev | 91-day-old order fully anonymized |
| R-12 | `create_order` RPC — atomic order+items+payment | P1 | No orphan orders | M | Dev | Forced items failure → zero order row |
| R-13 | Tests import real modules; add checkout/RLS/ITN integration tests vs Supabase test project | P1 | Real regression net | M | Dev | CI fails on injected pricing bug |
| R-14 | Payfast go-live gate: passphrase required in live mode; sandbox E2E ITN test; `payment_events` logging | P1 | Safe card-payment enablement | M | Dev+Ops | Sandbox order → COMPLETE → order paid; forged ITN rejected |
| R-15 | Minimal `/admin` (orders list, mark-paid, refund flag, audit_log; gated by `admins` table) | P1 | Ends dashboard-as-admin | L | Dev | Non-admin → 403; mark-paid writes audit row |
| R-16 | Resend domain auth verified (SPF/DKIM/DMARC) + bounce webhook | P1 | Order emails actually arrive | S | Ops | mail-tester ≥9/10; DMARC p=quarantine path |
| R-17 | Decide + implement deals pricing policy (OQ-05) | P1 | Advertised=charged price | M | Biz+Dev | Deal checkout charges deal price OR deal copy removed |
| R-18 | Resolve variant FK drift on prod (CASCADE vs SET NULL); drop dead variant columns | P1 | Safe product deletes | M | Dev+Ops | `pg_constraint` documented; migration applied |

## Phase 2 — Scalability & UX (6–12 weeks)

| # | Action | Priority | Impact | Effort | Owner | Acceptance |
|---|---|---|---|---|---|---|
| R-19 | Catalog caching (unstable_cache/ISR) + middleware `getUser` scope reduction | P2 | TTFB −30–50%, DB load −70% | M | Dev | Cache hit on repeat PDP; CWV budgets |
| R-20 | Image pipeline: next/image + WebP/AVIF + prune 38MB public dir | P2 | LCP on mobile | M | Dev | Lighthouse PDP ≥90 perf |
| R-21 | `fulfillment_status` + admin transitions + customer-visible status | P2 | Delivery lifecycle tracked | M | Dev | Order shows scheduled/delivered/installed |
| R-22 | Site search (Postgres FTS first; Algolia if needed) | P2 | Discovery on 438 SKUs | M | Dev | Query "daikin 12000" → relevant results <300ms |
| R-23 | Canonicalize variant pages → parent; sitemap categories | P3 | SEO index hygiene | S | Dev | Variant page canonical points at parent |
| R-24 | Auth rate limits (login/signup/reset buckets) + admin MFA | P2 | Credential stuffing defense | S | Dev | 11th login → 429 |
| R-25 | Staging environment (Supabase project + Vercel preview policy) | P2 | Safe pre-prod testing | S | Ops | PR → preview URL against staging DB |
| R-26 | Backup/DR runbook + restore drill + confirm PITR tier | P2 | Quantified data-loss risk | S | Ops | Drill completed within RTO ≤4h |
| R-27 | Playwright smoke suite in CI (nightly) | P2 | E2E regression net | M | Dev | Broken checkout → red pipeline |
| R-28 | Decide inventory enforcement (OQ-03); if enforcing: decrement on paid, reservation TTL | P2 | Oversell prevention | M | Biz+Dev | Last-unit race → one order wins cleanly |

## Phase 3 — Later (3+ months / opportunistic)

| # | Action | Priority | Effort | Owner |
|---|---|---|---|---|
| R-29 | `customers` table + order↔account FK (replace email-match) | P3 | M | Dev |
| R-30 | Cents-based money (integer cents or numeric) — only if cent pricing needed | P3 | XL | Dev |
| R-31 | Real reviews platform (or first-party review collection post-install) | P3 | M | Biz+Dev |
| R-32 | Server-side cart (cross-device, abandoned-cart recovery) | P3 | L | Dev |
| R-33 | Coupons/promotions engine (table exists, unused) | P3 | M | Biz+Dev |
| R-34 | Accessibility audit + fixes (WCAG 2.1 AA) | P3 | M | Dev |
| R-35 | `useSyncExternalStore` refactors to clear the 15 lint errors properly | P3 | M | Dev |
| R-36 | Consider `nextadmin-template` disposition (archive/delete) | P3 | S | Dev |

## Critical path
R-01→R-02→R-03 (deploy+DB+secret) before anything else matters — they close actively-exploitable paths.
R-05 (CI) lands in week 1 so everything after is gated.
Payfast enablement (R-14) is blocked on R-01–R-04 verification.
