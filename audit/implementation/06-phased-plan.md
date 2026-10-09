# 06 — Phased Implementation Plan

## Phase 0 — Stabilization (Days 0–3)

**Objective:** Stop the bleeding — production runs committed hardened code; last write-paths and committed secret closed.
**Scope:** S-01.1, S-01.2, S-01.3, S-01.4 (incl. Turnstile + Resend-domain verdicts), S-01.6, S-01.7 (PAT), S-01.8 (rate-limit IP), S-01.5 if trivial.
**Out of scope:** any feature work, any design work.
**Entry criteria:** PM has granted Vercel + Supabase + GitHub access.
**Exit criteria:**
- [ ] `git status` clean; HEAD == deployed commit
- [ ] GitHub PAT rotated; `.git/config` carries no credentials; push verified with new auth
- [ ] anon `INSERT`/`SELECT` on orders → denied (verified with anon key)
- [ ] old `ORDER_WEBHOOK_SECRET` → 401 on edge fn; new secret works E2E
- [ ] env matrix written (U-02/04/05/07/08/09 answered) — **incl. verdict: is Turnstile actually enabled in prod?** (if yes, CF-81 checkout-blocker gets same-day fix); Resend sender domain verified
- [ ] rate limiter keys on trusted IP (x-real-ip/rightmost XFF)
- [ ] prod smoke: real EFT checkout → order + owner email received
- [ ] zero Critical findings open
**Owner:** ENG/OPS · **Estimate:** ~14h · **Risks:** access delay (PM), trigger-fn secret update subtlety.
**Rollback:** Vercel redeploy-previous; migration is additive (no data change) — rollback = re-grant only if a regression is proven.

## Phase 1 — Foundation (Weeks 1–2)

**Objective:** The business can see and act on every order; nothing submitted is ever lost; code can't drift again.
**Scope:** S-02.1, S-02.2, S-02.3 (bulk), S-03.1, S-03.2, S-08.1, S-08.3, S-08.4-start.
**Out of scope:** fulfilment states, refunds, status emails (Phase 5), public-facing redesign.
**Exit criteria:**
- [ ] owner email fires for whatsapp/email/both orders (tested ×3)
- [ ] `/admin/orders` live: list→detail→mark paid/cancel, admin-gated, negative auth test passed
- [ ] service_requests table live; 3 forms persist + notify; RLS anon-INSERT-only verified
- [ ] newsletter persists or removed — no fake-success anywhere
- [ ] CI green on `main` (lint+typecheck+vitest+build); Vercel previews on PRs
- [ ] `.env.example` committed; package manager + engines pinned
- [ ] all P0 closed; "safe+honest store" checkpoint (`05` fast path) reached
**Owner:** ENG · **Estimate:** ~52h over 2 wks (heavy — cut S-02.3 polish if needed; core actions must land) · **Risks:** admin auth-bypass (review), scope creep into admin features.
**Rollback:** feature is additive — worst case unpublish `/admin` route; forms fall back to wa.me links.

## Phase 2 — Core Flow Completion (Weeks 3–6)

**Objective:** Chrome is honest and complete; every linked route exists; fake surfaces gone; account area coherent.
**Scope:** S-04.1–04.8, S-05.1, S-05.3, S-05.7, S-06.1–06.3, S-12.5.
**Out of scope:** shipping/VAT engines (Phase 3 — decision-gated), tokens refactor, Payfast.
**Exit criteria:**
- [ ] zero 404s reachable from nav/footer chrome (link crawl in CI or manual sweep)
- [ ] footer on every shop page; real contact details; search works OR icon removed
- [ ] no fabricated data anywhere (ratings, account pages, FAQ promises, newsletter)
- [ ] `/account` index + subnav; OrderHistory controls all live
- [ ] real pagination; no dead buttons anywhere in product surfaces
- [ ] checkout: session-stable idempotency; guest order-lookup for expired links
- [ ] all P1 closed
**Owner:** ENG · **Estimate:** ~60h / 4 wks · **Risks:** PM content latency (real numbers, copy); scope creep on search.
**Rollback:** per-page reverts; feature flags not needed (all additive).

## Phase 3 — Hardening & Compliance (Weeks 7–9)

**Objective:** AA-accessible, consistent-looking, monitored, legally defensible.
**Scope:** S-07.1–07.6, S-05.4, S-05.5, S-05.6, S-06.4, S-06.5, S-08.2, S-08.5, S-08.6, S-11.1, S-11.3, S-11.4, S-12.1–12.4 (as capacity allows).
**Out of scope:** new features; Payfast; coupons.
**Exit criteria:**
- [ ] axe: 0 critical/serious on top-8 routes; keyboard walkthrough documented
- [ ] contrast ≥4.5:1 on interactive/text elements; carousel pausable; reduced-motion honored
- [ ] single palette in tokens on the top-20 files; `!important` type wars resolved
- [ ] shipping + VAT per decisions live in totals (or decisions deferred → honest copy instead)
- [ ] Sentry catching errors; uptime probe alerting; DR drill done; security headers set (CSP report-only→enforce)
- [ ] unit tests import real code; CI audit gate live
- [ ] EXT-LEGAL sign-off on terms/privacy/CPA posture
**Owner:** ENG (+DES-C optional, EXT-LEGAL review) · **Estimate:** ~70h / 3 wks — **over capacity; expect to push 12.x and parts of 07.4** · **Risks:** token refactor visual regressions; CSP breaking GTM; external legal/tax latency.
**Rollback:** palette changes are CSS-only (git revert); CSP stays report-only until proven.

## Phase 4 — Launch Readiness (Weeks 10–11)

**Objective:** Prove the whole thing end-to-end under scrutiny.
**Scope:** S-11.2 completion, full regression, UAT against `10-launch-readiness-checklist.md`, docs.
**Exit criteria:**
- [ ] Playwright suite green in CI (3 paths)
- [ ] load smoke within budgets (LCP<2.5s PDP throttled; checkout p95 acceptable)
- [ ] UAT: PM walks launch checklist — 100% blocking items green
- [ ] runbook + support doc complete; rollback rehearsed once (redeploy-previous drill)
- [ ] launch checklist 100% green
**Owner:** ENG+PM · **Estimate:** ~25h · **Risks:** e2e flakiness, surprises in UAT.

## Phase 5 — Post-Launch (Weeks 12+)

**Objective:** Revenue expansion + lifecycle depth.
**Scope:** S-09.1–09.4 (Payfast), S-02.4, S-02.5, S-09.2, S-09.3, S-10.1–10.3, remaining Could items.
**Exit criteria (per item):** each story's own AC; Payfast enablement gated by sandbox E2E + checklist.
**Owner:** ENG · **Estimate:** ~45h, unscheduled beyond W12 · **Risks:** Payfast external latency; business priorities shift.
