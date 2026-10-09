# 14 — Open Questions

Everything I need answered to finalize this plan. Grouped by who can answer.

## Must answer — blocks plan finalization (Week 0)

**OQ-1. Environments & access:** Can I get (or can PM perform and report back) —
Vercel project env-var *names*, Supabase dashboard access, DNS/registrar access for the sending domain?
Without these, all of Phase 0 is unverifiable.

**OQ-2. Live URLs:** Confirm production storefront URL and whether any admin surface exists outside the repo.
(`airconsstore.co.za` assumed from `robots.ts`; `aircon-ecommerce.vercel.app` was reachable in June.)

**OQ-3. Which commit does production run?** Is Vercel git-connected to this repo, auto-deploying `main`?
If yes, HEAD `1552a6e` (pre-fixes) is live → R-01 confirmed critical.

**OQ-4. Capacity:** Solo founder CONFIRMED by background audit ("Sim", sole committer). Still needed:
realistic hours/week on this project, and budget for contract design/QA/legal help.
Estimates assume ~25h/wk — if wrong, `08` cut list applies automatically.

**OQ-5. Deadline:** Is there a target launch/relauch date or seasonal driver (summer aircon season)?
The 12-week schedule is undated; a real deadline re-orders it.

**OQ-6. Business identity:** Real phone number, WhatsApp business number, support email, business hours,
physical/service area — needed for S-04.8 by Week 3.

**OQ-7. VAT:** Is the business a registered VAT vendor? Registration number? Prices currently VAT-inclusive?
(Determines whether S-05.5 is real work or a documented non-issue.)

## Should answer — shapes scope

**OQ-8.** Do you want Payfast live, or is EFT-only the actual business preference? (Latent code is tested either way.)

**OQ-9.** Delivery: do you deliver/ship nationally, install locally only, or hybrid? (Drives D-03.)

**OQ-10.** Ratings: remove now + collect real reviews (where? Google/WhatsApp follow-ups?) — or hide rating UI entirely?

**OQ-11.** Newsletter: is a subscriber list actually wanted (marketing plan) or were the forms template residue?

**OQ-12.** Coupons: were promotions ever intended to be codes customers enter, or just banners? `promotions.code` + unused `discount_total_zar` suggest a half-built feature — build or delete?

**OQ-13.** Inventory: do you physically hold stock worth tracking, or source-per-order (making "advisory" the honest model)?

## Verify — dashboard/runtime checks (folded into S-01.4/01.6)

**OQ-14.** Was `20260925_audit_hardening.sql` ever run in the Supabase SQL editor?
**OQ-15.** Are `PAYFAST_*`, `UPSTASH_*`, `TURNSTILE_*`, `RESEND_API_KEY`, `OWNER_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID/GA_ID` set in Vercel prod?
**OQ-16.** How many rows in `settings`? (`.single()` hazard, CF-19.)
**OQ-17.** Which FK exists on `products.parent_product_id` in prod — CASCADE or SET NULL? (U-03.)
**OQ-18.** Does a gtag/GTM script tag exist in the live page source? (U-04.)
**OQ-19.** Supabase plan/backup tier — is PITR available? (DR runbook input.)
**OQ-20.** Does the deployed `order-email` edge fn match the worktree version? (Supabase functions dashboard.)

## Missing inputs — RESOLVED

All five audit suites completed during this synthesis (104 files):
`/audit/` (00–12+csv), `/audit/background/` (00–17+schema+csv), `/audit/technical/` (00–14+csv),
`/audit/flows/` (00–15+csv), `/audit/design/` (00–17+csv). Their findings are folded into
`01-consolidated-findings.md` (CF-71…CF-90). `AUDIT_REPORT.md` (June) remains stale/superseded.

## Founder questions inherited from `/audit/background/17` + `/audit/12` (deduplicated)

Highest-leverage additions beyond my OQs above:
- **Legal entity name, reg no., VAT no., physical address** — for terms/privacy/footer + invoices (OQ-7).
- **Which domains are owned** — `airconsstore.co.za` vs `aircons-store.co.za` (CF-74)?
- **Who processes an order end-to-end today** — real SOP walkthrough (sizes the admin panel).
- **Why was the June-30 admin panel deleted** — intentional or restore accident? (May be recoverable from git history — check `git log --all -- src/app/admin` before building S-02.3.)
- **Delivery mechanics** — own vehicle vs courier vs installer-delivers; zone matrix for S-05.4.
- **Are installers SAQCC-gas registered?** — validates or kills the "accredited installation" claim (CF-79).
- **POPIA Information Officer + PAIA manual** — named officer required (CF-80).
- **GitHub PAT in `.git/config` — was it ever shared/committed?** (Rotation regardless; informs whether to treat repo contents as compromised.)
- **Real order volume + AOV** — sizes S-02.3 admin scope.
- **Does the 90-day PII cron actually run in prod?** (Check `pg_cron` jobs in dashboard — fold into S-01.4.)
