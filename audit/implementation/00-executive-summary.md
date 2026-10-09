# Implementation Plan — Executive Summary

**Product:** Aircons Store — South African air-conditioner ecommerce storefront
**Repo:** `C:\Users\user\aircon-ecommerce` · **Live:** https://airconsstore.co.za (assumed) / https://aircon-ecommerce.vercel.app
**Plan date:** 2026-10-09 · **Author:** synthesized from all prior audits
**Status:** Draft — blocked on 7 decisions + 4 production verifications (see `14-open-questions.md`)

---

## Inputs consumed

| Input | Status |
|---|---|
| `/audit/background/` (Background Schema: files 00–17 + schema + findings.csv) | **Present** (completed during this synthesis). Confirms: solo founder-operator ("Sim", sole committer), repo `github.com/Airconsstore3/aircon-ecommerce`, real WhatsApp `+27767100588`, admin panel built June-30 then deleted, and **a GitHub PAT embedded in `.git/config` (verified)**. Legal entity/VAT status UNKNOWN — biggest business gap. |
| `/audit/` (PRD: files 00–12 + findings.csv) | Present. F-01…F-27 + gap analysis G-01…G-30 consolidated. |
| `/audit/technical/` (TRD: files 00–14 + findings.csv) | Present. Adds GAP-001…030; confirms rate-limit IP spoofing + Turnstile critical-if-enabled bug. |
| `/audit/flows/` (App Flow: files 00–15 + findings.csv) | Present. Adds P0 flow gaps incl. owner-alert gap + fake forms (verified in source). |
| `/audit/design/` (Design: files 00–17 + findings.csv) | Present. Gap analysis G-01…G-35 + design roadmap absorbed. |
| `ARCHITECTURE_AUDIT.md` (2026-09-25 forensic) | Present. Supersedes `AUDIT_REPORT.md` (2026-06-29, mock-data era — stale, ignored except as history). |
| `ECOMMERCE_FIX_PLAN.md`, `ENGINEERING_REPORT.md` | Present — fix register + checkout-hardening report. |

## Plain-English summary

Aircons Store is a **securely-engineered but operationally-incomplete** store. The money path
(browse → cart → checkout → order → EFT confirmation page) is well built: prices are
re-resolved server-side, order reads are token-gated, and the catastrophic RLS holes were
fixed in August. **But the September security fixes are still uncommitted** — if Vercel
deploys from git HEAD, production is running the vulnerable code today.

Above that hardened core sit three layers of unfinished product:

1. **Operations:** there is no admin UI. Every EFT payment is confirmed by hand-editing
   Postgres. Service-booking forms (maintenance, repairs, warranty) show "request received"
   and **send the data nowhere** — silent customer-data loss. For WhatsApp-channel orders the
   owner may never be notified at all.
2. **Compliance:** fabricated 4.6–5.0★ ratings on every product (SA CPA exposure), no VAT
   invoices, no shipping line in any total.
3. **Chrome:** no footer on any page except home, ~15 nav/footer links 404, dead search icon,
   dead Google sign-in buttons, an unstoppable autoplay carousel, and three competing colour
   palettes.

## The plan in one paragraph

**Phase 0 (Days 0–3):** commit and deploy the security fixes, apply the pending RLS migration,
rotate the webhook secret, verify production env — four ops tasks, ~1 day of work.
**Phase 1 (Weeks 1–2):** minimal `/admin/orders` panel + owner-notification fix + service-form
persistence so the business can actually see and close orders; CI pipeline; next@16.3.8.
**Phase 2 (Weeks 3–6):** global footer + link-graph repair + working search + remove/replace
every fake surface (ratings, account mocks, newsletter, pagination, Google buttons).
**Phase 3 (Weeks 7–9):** design-token consolidation, WCAG AA remediation, shipping/VAT/refund
decisions implemented, monitoring + backups.
**Phase 4 (Weeks 10–11):** full regression, load test, UAT, launch checklist.
**Phase 5 (Weeks 12+):** Payfast enablement, coupons, fulfilment lifecycle, analytics funnel.

## Readiness scores (0–5)

| Area | Score | One-liner |
|---|---|---|
| Team | 1.5 | CONFIRMED solo founder-operator ("Sim" — sole committer); no QA, design, DevOps, or second admin |
| Environment | 1.5 | Prod + local only; no staging, no CI, manual migrations, secrets in git history |
| Process | 1 | No issue tracking visible, 36 uncommitted files sat for 2 weeks, no release cadence |
| Dependencies | 2.5 | Supabase/Vercel/Resend/Payfast accounts exist (assumed); many env vars unverified |
| Quality | 1.5 | 13 tests that don't import the code under test; no e2e/a11y/perf gates |
| Governance | 1 | No runbooks, no decision log, no monitoring; this plan is the first governance artifact |
| **Overall** | **1.5 / 5** | Deliverable, but only if Phase 0 discipline (commit → CI → verify) lands first |

## Top 10 execution risks

1. **Uncommitted security fixes** — prod may be vulnerable NOW; also risk of losing work (single machine). → Phase 0, day 0.
2. **Live GitHub PAT in `.git/config` remote URL** — verified `https://Airconsstore3:ghp_…@github.com/…`; anyone with file access can push/read the repo. Rotate + strip creds day 0.
3. **Pending DB migration unverified** — anon INSERT on `orders` may still be open in prod.
4. **Solo-bus-factor — CONFIRMED** — background audit verifies a single founder-operator ("Sim", sole committer of 111 commits); no dev team, no second admin.
5. **Turnstile may block ALL checkouts if enabled in prod** — invisible widget never emits a token (no `.execute()` call); if both Turnstile envs are set in Vercel, every checkout fails. Verify in S-01.4.
6. **Decisions stall the plan** — fake-data removal, shipping, VAT, deposits vs full-payment are business calls disguised as tickets; unanswered they idle Phase 2–3.
7. **Silent data loss already happening** — every day the service forms and WhatsApp-channel notification gap stay live, real leads evaporate.
8. **Payfast has never processed a real payment** — hardened but untested; sandbox E2E is a hard gate before enabling.
9. **No staging environment** — all verification happens on prod or a laptop; migration rollback is manual.
10. **No monitoring** — if the deploy breaks the email trigger or ITN, nobody gets paged; first signal is a customer complaint.

## Top 10 decisions needed before starting

1. Commit strategy: commit Sept-25 fixes as-is, or review first? (Recommend: commit to `main`, tag, deploy — fixes were already verified in the fix plan.)
2. Admin approach: minimal `/admin` in this repo vs. document dashboard-only ops? (Recommend: minimal in-repo admin — F-03/FLOW-1.)
3. Shipping model: flat fee, zone-based, "delivery included in install", or quote-only? (F-05.)
4. VAT status: is the business VAT-registered? Inclusive or exclusive pricing? (F-06 — needs accountant.)
5. Fake ratings: remove entirely, replace with real reviews, or hide until reviews exist? (F-04 — CPA risk argues removal now.)
6. Payfast: enable in Phase 5 after sandbox E2E, or stay EFT-only? (Latent code path.)
7. Search: Postgres `ILIKE`/full-text (cheap, adequate at 438 SKUs) vs. Algolia (overkill)? (Recommend Postgres FTS.)
8. Service forms: persist to a `service_requests` table + email owner, or WhatsApp deep-link only? (Recommend table + email — same pipeline as orders.)
9. Account mock pages: delete `/account/subscriptions`+`/account/warranties` or build real ones? (Recommend delete/hide — nothing backs them.)
10. Legal entity + terms re-issue: entity name/reg/VAT/address are undisclosed anywhere (ECTA s43) and the terms page predates the build with a contradicting 50%-deposit clause — supply details + approve re-issue. (Capacity note: solo founder confirmed; only hrs/wk still unknown.)

## Single most important first task

**TASK-1.1 — Commit the 36 modified/untracked files (the entire Sept-25 security fix set), push, and deploy — and in the same session rotate the GitHub PAT found in `.git/config`.** Everything else in this plan assumes the hardened worktree is what production runs, and that the repo credential isn't sitting in plaintext on one laptop.

## Critical path in one sentence

Commit → deploy → apply migration → rotate secret → verify prod env → owner-notification fix → minimal admin orders panel → global footer/link repair → remove fake surfaces → a11y AA → monitoring → launch gate.

## Effort headline

~**52 engineering days** of Must+Should work (~357h) against **~34 days of capacity** in
12 weeks (1 dev × 25h/wk × 12 × 0.8 buffer — solo founder CONFIRMED by background audit).
**The plan is over capacity by ~34%.**
Recommended cuts: defer coupons (CF-23), real-reviews system, `create_order` RPC, fulfilment
lifecycle beyond status labels, and design-token migration beyond the AA-critical files.
See `08-estimation-capacity.md`.

## Files in this folder

`01` consolidated findings · `02` delivery readiness · `03` WBS · `04` dependency map · `05` critical path · `06` phased plan · `07` week-by-week · `08` estimation/capacity · `09` test-release-rollback · `10` launch checklist · `11` governance · `12` risk register · `13` decision log · `14` open questions · `backlog.csv` · `dependencies.csv` · `capacity.csv` · `launch-checklist.csv`
