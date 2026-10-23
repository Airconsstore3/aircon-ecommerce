# 12 — Open Questions (ANSWERED 2026-10-09)

All questions resolved by the owner. BLOCKED items moved to `12a-blocked-questions.md`.

## Owner / business

| # | Question | Answer | Status |
|---|---|---|---|
| Q-01 | Was `20260925_audit_hardening.sql` applied? | **NOT APPLIED** — no record in dashboard. F-01 is LIVE-CRITICAL. SQL + instructions produced in `security-p0-fix.md` | **OPEN → action doc produced** |
| Q-02 | Has `ORDER_WEBHOOK_SECRET` been rotated? | **NO — EXPOSED.** Rotation runbook in `security-p0-fix.md`. Secret still consumed by `order-email` edge fn (unrelated to Payfast) — keep code, rotate value | **OPEN → action doc produced** |
| Q-03 | Who manages orders? | Supabase dashboard only; no admin tool; urgency HIGH — but see Q-19 | RESOLVED |
| Q-04 | VAT-registered? | **NO. No tax invoices required.** All VAT logic/copy removed | RESOLVED — code updated |
| Q-05 | Delivery fee policy? | 3 tiers: Cape Town FREE / Outside Cape Town quoted per order / quote-on-type per item type. Enquiry-style, confirmed manually. No hardcoded rates | RESOLVED — code updated |
| Q-06 | Inventory policy? | **Enquiry + manual availability confirmation. NO hard stock.** Sold-out items remain orderable; availability confirmed before payment is arranged | RESOLVED — code updated |
| Q-07 | Deal pricing honoured? | **REMOVE /deals entirely** — route, components, logic, sitemap, nav links; 301 → / | RESOLVED — code updated |
| Q-08 | Fake ratings deliberate? | **REMOVE all fabricated ratings/reviews/stars/counts/schema.** Real reviews only from licensed source later | RESOLVED — code updated |
| Q-09 | Plans/warranties in accounts? | **DEFER** — don't build now | DEFERRED |
| Q-10 | Payfast credentials? | **REMOVE PAYFAST ENTIRELY** — code, config, env refs, webhooks, UI. Store = enquiry/quote model, payment manual. Payment-provider decision required before online payment | RESOLVED — code updated |
| Q-11 | Real order volume / AOV? | Unknown — will provide separately | **BLOCKED** |
| Q-12 | Contractual confirmation channel? | **EMAIL from aircons-store.co.za.** SMS/WhatsApp secondary | RESOLVED — verify Resend domain config |
| Q-13 | Prod env matrix? | Unknown — owner checking Vercel | **BLOCKED** |
| Q-14 | Which variant FK in prod? | Unknown — SQL check query produced in `12a-blocked-questions.md` | **BLOCKED** |
| Q-15 | Staging environment? | **None found in repo** — flagged HIGH; staging plan produced | **BLOCKED** (no staging exists; flagged) |
| Q-16 | pnpm or npm? | Unknown — repo has `pnpm-lock.yaml` + `pnpm-workspace.yaml`, docs say npm. Recommend **pnpm** | **BLOCKED** → recommendation recorded |
| Q-17 | SPF/DKIM/DMARC for Resend domain? | Unknown — owner checking DNS | **BLOCKED** |
| Q-18 | Canonical host? | **aircons-store.co.za** (hyphenated). All `airconsstore.co.za` occurrences fixed | RESOLVED — code updated |
| Q-19 | In-app admin panel? | **NO — Supabase dashboard workflow only.** Ops runbook produced at `operations-runbook.md`; scale cap ~50 orders/week flagged | RESOLVED — runbook written |
| Q-20 | Legal pages reviewed? | Unknown — legal review still needed | **BLOCKED** |

## Deferred product decisions (parked — note on roadmap)

- Refund SLA beyond CPA minimums
- WhatsApp as primary vs secondary channel
- Whether `/account` should exist at all
- Install scheduling UX (calendar vs manual WhatsApp coordination)
