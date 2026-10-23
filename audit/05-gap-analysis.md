# 05 — Gap Analysis (regenerated 2026-10-09)

Re-scored against a **manual-fulfilment enquiry commerce MVP** (the owner's chosen model), not a card-checkout store. Closed items since first pass: fake ratings removed, /deals removed, Payfast removed, VAT removed (not registered), delivery tiers + enquiry checkout implemented, domain canonicalized.

| ID | Gap | Severity | Impact | Effort | Priority | Status |
|---|---|---|---|---|---|---|
| G-01 | DB hardening migration `20260925` **not applied in prod** — anon order injection still open | **Critical** | Forged orders + email spam | S | P0 | OPEN — SQL ready in `security-p0-fix.md` |
| G-02 | `ORDER_WEBHOOK_SECRET` exposed in git history, not rotated | **Critical** | Forged order-email triggers | S | P0 | OPEN — rotation runbook written |
| G-03 | No staging environment — every change tests against prod | High | Prod-only verification risk | M | P1 | OPEN (Q-15) |
| G-04 | Dashboard-only ops workflow, no audit trail, ~50 orders/wk cap | High | Ops errors at scale; no change log | L | P1 | Mitigated — runbook written |
| G-05 | No post-payment receipt email | Medium | Paid customer gets no proof | S | P1 | OPEN |
| G-06 | Guest order lookup — link loss orphans orders (email optional) | Medium | Customer can't recover order | S | P1 | OPEN |
| G-07 | `orders.items` JSONB vs `order_items` duplication | Medium | Divergent order data | S | P2 | OPEN |
| G-08 | Analytics fires `generate_lead` on unpaid orders; no funnel events | Medium | Inflated metrics, invisible funnel | M | P2 | OPEN |
| G-09 | No error monitoring/uptime alerts (console.* only) | Medium | Silent checkout failures | S | P1 | OPEN |
| G-10 | Mock subscriptions/warranties account pages | Medium | Fake data shown to users | S | P1 | OPEN (deferred build-out — remove pages instead) |
| G-11 | Newsletter forms dead-end (alert only) | Low | Lost leads | S | P2 | OPEN |
| G-12 | Tests re-implement instead of importing source | Medium | Silent regressions | M | P1 | OPEN |
| G-13 | No security headers (CSP/HSTS/frame-ancestors) | Low | Defense-in-depth | S | P2 | OPEN |
| G-14 | No A11y audit; `<img>` misuse in rendered components | Low | WCAG unknown | M | P2 | OPEN |
| G-15 | Two variant systems + unknown prod FK (CASCADE vs SET NULL) | Medium | Parent-delete hazard | S | P1 | BLOCKED — query in 12a |
| G-16 | PII retention cron only covers `submitted` orders | Low | Terminal orders retain PII | S | P2 | OPEN |
| G-17 | Payment provider decision deferred — no online payment path | High (business) | No card/instant payments until chosen | — | P2 | OWNER DECISION PENDING |
| G-18 | Legal pages AI-generated, unreviewed (CPA/ECT Act) | Medium | Compliance risk | M | P1 | BLOCKED — Q-20 |
| G-19 | `useCart` silent NOOP outside provider | Low | Silent add-to-cart failure | S | P3 | OPEN |
| G-20 | Sitemap incomplete (categories/collections missing); variant canonicalization | Low | SEO dilution | S | P2 | OPEN |

## Closed since last pass

VAT/tax invoicing (not required — not registered) · fabricated ratings/reviews (removed site-wide) · /deals (removed + 301s) · Payfast (removed) · shipping fee hardcoding (replaced by quote model) · sold-out checkout blocking (enquiry semantics) · airconsstore.co.za domain drift (all → aircons-store.co.za) · checkout XFF spoofable rate-limit key (fixed while touching the file).
