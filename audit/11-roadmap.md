# 11 — Roadmap (regenerated 2026-10-09)

## 0–2 weeks — Emergency / go-live gates

| # | Item | Priority | Effort | Owner | Acceptance criteria |
|---|---|---|---|---|---|
| R-01 | Apply `20260925_audit_hardening.sql` in Supabase | **P0 Critical** | S | Owner (dashboard) | anon INSERT/SELECT on orders denied; settings admin-only |
| R-02 | Apply `20261009_enquiry_delivery_model.sql` | **P0** | S | Owner | `delivery_tier` populated; `confirmed` status accepted |
| R-03 | Rotate `ORDER_WEBHOOK_SECRET`; update edge fn + trigger | **P0** | S | Owner+Dev | test order email fires; old secret 401s |
| R-04 | Verify Resend domain `aircons-store.co.za` + SPF/DKIM/DMARC | P0 | S | Owner | Resend dashboard shows verified; test email lands in inbox |
| R-05 | Deploy code changes; verify redirects (`/deals`→301→`/`; `/api/payfast/*`→404) | P0 | S | Dev | `curl -I` checks pass |
| R-06 | End-to-end order test: submit → confirm → banking shown → mark paid → check emails | P0 | S | Owner | Full flow works, both emails received |
| R-07 | Answer Q-13 (Vercel env matrix) — confirm Upstash/Turnstile actually active | P0 | S | Owner | Matrix documented; warnings if unset |

## 2–6 weeks — MVP hardening

| # | Item | Priority | Effort | Owner | Acceptance criteria |
|---|---|---|---|---|---|
| R-08 | Post-payment receipt email (edge fn on `payment_status→paid`) | P1 | S | Dev | Paid order → customer receipt email |
| R-09 | "Availability confirmed" email on `status→confirmed` | P1 | S | Dev | Confirming an order emails customer with link |
| R-10 | Staging Supabase project + Vercel preview env | P1 | M | DevOps | Migrations testable off prod |
| R-11 | Remove mock `/account/subscriptions` + `/account/warranties` pages | P1 | S | Dev | No fabricated data shown |
| R-12 | Monitoring: Sentry + uptime probe + new-order alert | P1 | S | DevOps | Checkout error → alert fires |
| R-13 | Guest order recovery (lookup by order number + email/phone) | P1 | S | Dev | Customer can retrieve confirmation link |
| R-14 | Real tests importing source modules (resolver, actions) | P1 | M | Dev | Breaking resolver fails CI |
| R-15 | Fix `generate_lead` → fire only on paid; add funnel events | P2 | M | Dev | GA4 shows accurate funnel |
| R-16 | Newsletter signup → `newsletter_subscribers` table | P2 | S | Dev | Signup persists + welcome email |
| R-17 | Verify prod variant FK (run Q-14 query); unify variant scheme | P1 | S | Owner+Dev | Constraint verified, documented |
| R-18 | Package manager: standardize on pnpm; update docs | P2 | S | Dev | Single lockfile + `packageManager` field |
| R-19 | Security headers (CSP, HSTS, frame-ancestors, nosniff) | P2 | S | Dev | Headers on all responses |

## 6–12 weeks — Growth & optimization

| # | Item | Priority | Effort | Owner |
|---|---|---|---|---|
| R-20 | **Payment provider decision** + integration (cards/instant EFT) — unblocks real payments | P2 | L | Owner decision → Dev |
| R-21 | Minimal admin panel (orders list, status transitions, delivery quote field, audit log) — needed once >50 orders/wk | P2 | L | Dev |
| R-22 | Order lifecycle states (confirmed → scheduled → delivered) + status emails | P2 | M | Dev |
| R-23 | Refund/cancel workflow (`refunds` table + email) | P2 | M | Dev |
| R-24 | Real review source (Trustpilot widget or verified-purchase reviews) | P2 | M | Owner+Dev |
| R-25 | Sitemap coverage (categories/collections) + variant canonicals | P2 | S | Dev |
| R-26 | A11y pass (axe on PDP/checkout) + `<img>`→`next/image` | P2 | M | Dev |
| R-27 | Legal review of terms/privacy/returns/warranty | P1 | M | Owner + lawyer |

## Later bets

- Single `create_order` RPC (atomic order+items+payment) — removes partial-write risk
- `orders.items` JSONB vs `order_items` deduplication
- Install scheduling UX (calendar vs WhatsApp) — deferred decision
- Whether `/account` should exist at all — deferred decision
- Refund SLA beyond CPA minimums — deferred decision
- PII retention extension to terminal orders
- Money→cents migration if fractional pricing ever needed
