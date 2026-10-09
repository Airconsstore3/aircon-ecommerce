# 00 — Executive Summary (Technical Audit)

**Product:** Aircons Store — South African air-conditioner ecommerce storefront
**Repo:** `C:\Users\user\aircon-ecommerce` — Next.js 16.3.6 (App Router) + Supabase Postgres + Vercel
**Audit date:** 2026-10-09
**Method:** Read-only static audit — repo tree, git history, migrations/RLS review, `pnpm audit --prod` (12 findings), `vitest run` (13/13 pass), `eslint` (15 errors / 120 warnings), `tsc --noEmit` (clean). Prior forensic audit (`ARCHITECTURE_AUDIT.md`, 2026-09-25) re-verified line-by-line against the current working tree **and** against committed HEAD. Live DB and the production deploy were NOT directly inspected — items needing runtime access are marked `UNKNOWN — REQUIRES VERIFICATION`.

## What this system actually is

A single-currency (ZAR) B2C storefront: 438 published products (194 parents, 244 variants), guest-only checkout, Manual EFT (enabled) + Payfast (implemented, disabled in DB), order emails via Postgres trigger → `pg_net` → Supabase Edge Function → Resend, customer accounts (Supabase Auth, order history only). There is **no admin UI in this repo**, **no inventory enforcement**, **no shipping/tax engine**, and **no CI/CD**. Checkout is effectively a structured lead-capture flow: orders are created with `payment_status=pending` and payment is confirmed by hand.

## The single most important finding

**The September 25 security-hardening fixes are entirely uncommitted.** 36 files in the working tree are modified/untracked, including every critical fix:

| File | State at HEAD (`1552a6e`) | State in worktree |
|---|---|---|
| `src/app/api/payfast/itn/route.ts` | Spoofable first-hop XFF IP check, `127.0.0.1` whitelisted, missing-IP → check skipped, no Payfast server validation | Hardened (x-real-ip/rightmost XFF, fail-closed, server-to-server validation) |
| `src/app/(shop)/checkout/actions.ts` | `markWhatsAppSent(orderId)` — **unauthenticated order mutation**, no compensating delete | Token-gated, compensating delete added |
| `supabase/functions/order-email/index.ts` | `if (expectedSecret && …)` — secret **optional**; unescaped HTML → phishing relay | Fail-closed + HTML-escaped |
| `supabase/migrations/20260925_audit_hardening.sql` | — (untracked) | Revokes anon INSERT on orders, restricts settings |
| `src/app/(shop)/collections/` | — (untracked) | New route |

If Vercel deploys from git HEAD, **production runs the vulnerable code today**. This must be verified and remediated immediately (commit, deploy, apply the pending migration, verify RLS in the dashboard).

## Verdict

Security posture of the **worktree** is materially better than typical AI-generated stores: server-resolved pricing, token-gated order reads, closed RLS holes, layered ITN verification. The dominant residual risks are **operational**: no commit discipline, no CI gate, no admin UI (orders managed via Supabase dashboard), no monitoring, fake customer-facing data (ratings, account subscriptions/warranties), and pending manual DB migration.

## Readiness scores (0–5)

| Area | Score | Basis |
|---|---|---|
| Architecture | 3 | Sound Next.js+Supabase shape for this scale; duplicated order state, dead code, uncommitted fixes |
| Frontend | 3 | Modern RSC/TS/Tailwind; fake ratings, `<img>` not `next/image`, 38MB public dir, no error boundary strategy beyond defaults |
| Backend/API | 3 | Server actions + 2 API routes; no versioning needed; idempotency good; ITN hardened only in worktree |
| Database | 3 | RLS on all tables, good indexes; duplicated columns, conflicting variant FKs, incomplete PII retention |
| Auth | 3.5 | Supabase Auth done correctly (getUser in middleware, safeNext guards); no MFA, no rate limit on auth actions |
| Payments | 2.5 | EFT-only live; Payfast latent; no refunds; integer-rand money model |
| Infra/DevOps | 1 | No CI, no IaC, no Docker, no env example, manual migrations, secrets in git history |
| Security | 3 | Worktree strong; HEAD vulnerable; no CSP/security headers; committed webhook secret |
| Performance | 2.5 | SSR everywhere, no caching strategy, unoptimized images, no CWV measurement |
| Reliability/Observability | 1 | console.error only; no error tracking, alerting, uptime checks, or documented backups/DR |
| Testing | 1.5 | 13 tests that re-implement rather than import the code under test; no e2e/integration |
| Compliance | 2 | POPIA consent + partial PII retention cron (misses address fields); cookie consent exists; fake reviews = CPA risk |

**Overall: ~2.3/5** — functional storefront with hardened core logic, weak operational envelope.

## Top 5 actions

1. **Commit and deploy the uncommitted security fixes; apply `20260925_audit_hardening.sql`; verify RLS in Supabase dashboard.**
2. **Rotate `ORDER_WEBHOOK_SECRET`** (committed in `20260710085328`) — update edge fn env + trigger function.
3. **Upgrade `next` to ≥16.3.8** — 5 high advisories incl. image-optimization SSRF on the current pin.
4. **Add CI** (lint/typecheck/test/build + audit gate) so fixes cannot sit uncommitted for two weeks again.
5. **Decide the admin story** — build the gated `/admin` or formally document dashboard-only ops.
