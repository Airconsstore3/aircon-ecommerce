# Flow Remediation Roadmap

Effort: S < 1 day · M 1–3 days · L 1–2 weeks · XL > 2 weeks.
Sequenced by risk → operability → parity → growth. See findings.csv for
acceptance criteria per item.

## Phase 0 — 0–2 weeks: stop the bleeding (P0)

| # | Item | Finding | Effort | Why first |
|---|------|---------|--------|-----------|
| 0.1 | **Owner email for ALL channels** — one-line edge-fn change: notify owner regardless of `channel`, with "customer chose WhatsApp" note | F-02 | S | Eliminates silent order loss TODAY |
| 0.2 | **Kill the fake forms** — either wire `service_requests` backend, or replace submit with "WhatsApp/email us" honest CTA until backend exists | F-03 | S–M | Stops deceiving customers + losing leads |
| 0.3 | **Ops: rotate `ORDER_WEBHOOK_SECRET`** (edge fn env + trigger fn); confirm `20260925_audit_hardening.sql` applied; confirm Upstash/Turnstile envs | F-04, F-28, F-29 | S | Security posture already coded — needs ops verify |
| 0.4 | **Minimal `/admin/orders`** — session + `admins` guard, pending-EFT list, order detail, mark-paid/cancelled + note | F-01 | L | Makes the business operable; the only payment method gets a confirmation path |
| 0.5 | **Honest empty states** — strip MOCK arrays from subscriptions/warranties pages; hide promo `code`; remove dead OrderHistory buttons/links | F-07, F-09, F-10 | S | Deception removal is cheap |
| 0.6 | **EFT robustness** — `.maybeSingle()` on settings + fallback text; idempotency key per mount | F-12, F-14 | S | Two 30-min fixes closing payment dead ends |

## Phase 1 — 2–6 weeks: hardening & parity (P1)

| # | Item | Finding | Effort |
|---|------|---------|--------|
| 1.1 | `/contact` page wired to settings + replace all placeholder wa.me numbers + prune dead footer links (or build the pages) | F-05, F-25 | M |
| 1.2 | `/search?q=` results page + navbar input wiring (or hide icons) | F-06 | M |
| 1.3 | `/account/orders/[orderNumber]` detail page; remove fake timeline stages until states exist | F-09 | M |
| 1.4 | Service-request backend: `service_requests` table + server action + owner email + admin triage (extends 0.4 surface) | F-03 | M |
| 1.5 | Error tracking (Sentry/Axiom) + alerts on checkout/ITN/email failure | F-20 | S |
| 1.6 | Payfast go-live checklist: sandbox E2E, env+passphrase, "Pay again" on failed/cancelled, expiry scoped to banking block | F-13, F-15 | M |
| 1.7 | `orders.user_id` + claim-on-signup; checkout prefill for logged-in users | F-11 | M |
| 1.8 | Notification completeness: paid/cancelled/scheduled email templates via same edge-fn | G-14 | M |

## Phase 2 — 6–12 weeks: UX optimisation & growth

| # | Item | Effort |
|---|------|--------|
| 2.1 | Analytics funnel events (view_item/add_to_cart/begin_checkout/purchase) | S |
| 2.2 | Newsletter/deal-alert persistence (`subscribers` + Resend audience) | S |
| 2.3 | Coupon engine (`coupons` table + resolver integration + checkout field) | M |
| 2.4 | Atomic `create_order` Postgres function (retire compensating delete; move email trigger to post-commit or queue w/ retry) | M |
| 2.5 | Delivery-method step + postal code + address book | M |
| 2.6 | Refund-request flow (customer request → admin action → status + email) | M |
| 2.7 | Manual fulfilment statuses (scheduled/out-for-install/completed) in admin + customer timeline | M |
| 2.8 | Reconciliation cron (stale pending/processing → owner alert) | S |
| 2.9 | Data-model cleanup: single line-item source, variant_id populate, consolidate status enums, remove dead code (Navbar.tsx, mock-data, dead migrations) | S–M |
| 2.10 | Real reviews system (or permanently remove ratings surface) | L |

## Phase 3 — later: advanced flows

- Server-side cart + cross-device sync + abandoned-cart email (consent-gated) — L
- Real inventory decrement + backorder/back-in-stock alerts — M
- Warranty/subscription real products (recurring billing via provider) — XL
- Recommendations engine, B2B quote workflow, loyalty — XL
- Multi-admin roles, full audit log UI, reports — L

## Kill-list (delete, don't fix)

- `shop/Navbar.tsx`, `shop/MobileMenu.tsx` (dead code with dead links)
- `mock-data.ts`, `mock-products.ts` (already flagged dead)
- Fake pagination bar; decorative wishlist heart unless wishlist ships
- `orders.items` JSONB once order_items is canonical (keep one writer)
- `20260813_combined_migration.sql` stale policy file (already neutralised — delete)
