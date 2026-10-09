# 00 — Executive Summary

**Product:** Aircons Store — South African air-conditioner ecommerce storefront
**Repo:** `C:\Users\user\aircon-ecommerce` (Next.js 16.3.6 + Supabase Postgres + Vercel)
**Audit date:** 2026-10-09
**Method:** Static repo inspection, migration/RLS review, `vitest run` (13/13 pass), `eslint` (15 errors / 120 warnings), prior forensic audit (`ARCHITECTURE_AUDIT.md`, 2026-09-25) re-verified against the current working tree. Live DB and production deploy were NOT directly inspected — items marked `UNKNOWN — REQUIRES VERIFICATION`.

## What this product is

A single-currency (ZAR) B2C/D2C storefront selling air conditioners, installation kits, maintenance plans, and extended warranties for the South African market. Checkout is **guest-only**; payment is **Manual EFT** (enabled) or **Payfast** (implemented, disabled in DB). Order capture is effectively a **lead-generation flow** — the confirmation page shows banking details and a WhatsApp deep link; fulfilment, payment confirmation, and stock control are all manual via the Supabase dashboard (there is no admin UI in this repo).

## Overall verdict

The codebase is significantly healthier than typical AI-built stores **on the security axis**: all prices are re-resolved server-side, order reads are token-gated behind the service role, the catastrophic "anon can read all orders" RLS holes were found and fixed (2026-08-17), Payfast ITN has layered verification, and the earlier audit's 22-item fix list was applied to code.

The gap is **product completeness, not safety**: there is no admin panel, no inventory enforcement, no shipping/delivery pricing, no tax/VAT invoice handling, no refunds flow, no site search, no coupons, fake product ratings, mock subscription/warranty pages shown to real customers, and a newsletter form that goes nowhere. Revenue-critical risk today is concentrated in **operations** (every EFT order is confirmed by hand against a database row) and **marketing compliance** (fabricated review counts).

## Readiness scores (0–5)

| Area | Score | One-line reason |
|---|---|---|
| Catalog | 3.5 | 438 products, variants, collections, JSON-LD — but fake ratings and no reviews system |
| Cart | 3.0 | localStorage cart works; no persistence across devices, no server validation until checkout |
| Checkout | 3.5 | Solid guest checkout: server pricing, idempotency, rate-limit, CAPTCHA; no shipping/tax step |
| Payments | 2.5 | EFT enabled, Payfast hardened but disabled/untested; no refunds, no partial payments |
| Orders | 2.0 | Captured reliably; lifecycle stops at "paid" — no fulfilment, shipping, delivery states |
| Inventory | 1.5 | `stock_count`/`is_sold_out` display + sold-out rejection at checkout; never decremented |
| Admin | 0.5 | No admin UI in repo; orders managed by hand in Supabase dashboard |
| Auth | 3.5 | Real Supabase Auth, guarded /account, reset flows; but 2 of 4 account pages show mock data |
| Security | 3.5 | Strong baseline post-fix; pending: rotation of committed webhook secret, apply 20260925 migration |
| Performance | 3.0 | Next/Image used widely, `force-dynamic` everywhere; no caching strategy measured |
| SEO | 3.0 | Metadata, canonical, sitemap, robots, JSON-LD; variant pages are near-duplicates |
| Analytics | 2.0 | GTM/GA wired via consent banner env vars; only `generate_lead` + conversion events exist |
| Accessibility | 2.0 | Radix primitives help; `<img>` misuse, no a11y testing, unknown WCAG posture |
| Compliance | 2.5 | POPIA-aware privacy page + consent + 90-day PII cron; no VAT invoices, fake reviews are CPA risk |

## Top risks (details in 04-audit-findings.md)

1. **P0/ops** — `supabase/migrations/20260925_audit_hardening.sql` is shipped but marked "must be applied manually" — if not applied, anon INSERT on orders is still open. **UNKNOWN — REQUIRES VERIFICATION** in Supabase dashboard.
2. **P0/ops** — `ORDER_WEBHOOK_SECRET` is committed in git history (`20260710085328_order_email_webhook.sql`) — must be rotated.
3. **High** — No admin UI: EFT payment confirmation, order status, and refunds are manual SQL/dashboard operations — error-prone at any volume.
4. **High** — Fake review ratings (4.6–5.0, 99–780 reviews per product) rendered to customers — South African CPA/ASA misleading-advertising exposure.
5. **High** — No shipping/delivery fee in totals; address collected but price excludes delivery — margin risk on every order.
6. **High** — No VAT/tax computation or tax invoice — likely VAT-registered vendor selling R10k+ items without compliant invoices.
7. **High** — Inventory is cosmetic: overselling possible by design; `stock_count` never decremented.
8. **Medium** — Deal prices shown on `/deals` are not what checkout charges (catalog price) — pricing-consistency decision needed.
9. **Medium** — `/account/subscriptions` and `/account/warranties` render fabricated data to signed-in customers.
10. **Medium** — Newsletter signup is a dead form (`alert()` only) — collected emails are silently dropped.

## Single most important fix first

**Apply `20260925_audit_hardening.sql` in the Supabase dashboard and rotate `ORDER_WEBHOOK_SECRET`.** It's a 15-minute ops task that closes the last open write-path on the orders table and the last committed secret. After that, the highest-leverage product work is a minimal admin order panel (EFT confirmation + status transitions), because every rand of revenue currently flows through manual database edits.
