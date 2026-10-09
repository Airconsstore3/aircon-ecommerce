# Gap Analysis — vs a production-grade ecommerce flow

Comparing Aircons Store's implemented flows against a baseline SA production
storefront (browse → discover → cart → checkout → pay → fulfil → support → retain).
Items are ordered by priority; P0 = fix before/with current ops, P1 = near-term
hardening, P2 = growth, P3 = later.

## P0 — business cannot operate safely without these

| ID | Flow | Gap | Evidence | Severity | Revenue | UX | Effort |
|----|------|-----|----------|----------|---------|----|--------|
| G-01 | Order ops | No admin UI; the only payment method (EFT) has zero implemented confirmation path | B9–B15; `payment_status` writers = ITN only | Critical | Blocking reconciliation | Ops chaos | L |
| G-02 | Owner alerting | whatsapp-channel orders produce no owner email; wa.me popup-blockable | `order-email/index.ts:107`; `CheckoutClient.tsx:137` | Critical | Silent order loss | — | S |
| G-03 | Lead capture | Booking/warranty forms fake-submit PII into the void | `maintenance/page.tsx:113`; `repairs`; `warranty/page.tsx:313` | Critical | Lost service revenue | Deceives users | M |
| G-04 | Secrets | Webhook secret in git history (unverified rotation); `20260925_audit_hardening.sql` application unverified | migration `20260710085328:9`; AGENTS.md | Critical | Email-relay/spam orders possible | — | S |
| G-05 | Turnstile correctness | Invisible widget may never emit `cf-turnstile-response` → all checkouts blocked when enabled | `CheckoutClient.tsx:114,295` | Critical-if-enabled | Total checkout block | — | S |

## P1 — core ecommerce parity

| ID | Flow | Gap | Evidence | Severity | Revenue | UX | Effort |
|----|------|-----|----------|----------|---------|----|--------|
| G-06 | Search | None exists; dead icon | `navbar.tsx:258,464` | High | Discovery loss | Dead control | M |
| G-07 | Contact | `/contact` 404; placeholder wa.me numbers everywhere | F-05 | High | Pre-sale loss | Dead ends | M |
| G-08 | Order detail/status | No `/account/orders/[id]`; dead View-Details/Invoice/Track buttons | `OrderHistory.tsx:162-291` | High | Support load | Broken affordances | M |
| G-09 | Fake account data | subscriptions/warranties show MOCK rows | `account/*/page.tsx:18-37` | High | Trust | Deceptive | S |
| G-10 | EFT robustness | `.single()` settings → hidden banking block | `order-confirmed/page.tsx:146` | High | Direct payment failure | — | S |
| G-11 | Payment recovery | No retry; cart cleared pre-redirect; 48h expiry | F-13/F-15 | Medium | Checkout abandonment | Re-shop friction | M |
| G-12 | Checkout identity | No prefill, no `user_id` link, no saved addresses | F-11 | Medium | Repeat-purchase UX | — | M |
| G-13 | Duplicate order | idempotency key per-click | `CheckoutClient.tsx:99` | Medium | Ops cleanup | — | S |
| G-14 | Notification completeness | Only order-received email; no paid/scheduled/completed/cancelled mails | C6 | High | Customer confidence | Blind post-purchase | M |

## P2 — conversion & growth gaps

| ID | Flow | Gap | Severity | Effort |
|----|------|-----|----------|--------|
| G-15 | Coupon engine | codes displayed, never applicable | High | M |
| G-16 | Analytics funnel | only `generate_lead`; no view_item/cart/checkout/purchase | Medium | S |
| G-17 | Newsletter capture | fake forms | Medium | S |
| G-18 | Abandoned cart | no server cart or reminder | Medium | M |
| G-19 | Refund/return flow | informational page only; no request path | Medium | M |
| G-20 | Shipping/delivery step | no method/fee/ETA selection at checkout | Medium | L (ops-dependent) |
| G-21 | Wishlist/saved items | heart toggles local state only; linked pages 404 | Low | M |
| G-22 | Reviews | fabricated ratings instead of real system | Medium (legal) | L |
| G-23 | Order status model | no fulfilment states; `completed` conflates paid | Medium | M |
| G-24 | Inventory enforcement | advisory `is_sold_out` only; no decrement | Low (documented) | M |
| G-25 | Observability | no error tracking/alerting | Medium | S |
| G-26 | Soft-404s & dead links | ~15 linked routes missing; fake pagination | Medium | S |
| G-27 | Email verification/account security | email-only auth; no MFA/OAuth (optional) | Low | M |
| G-28 | PII self-service | no export/delete; retention cron covers only `submitted` | Medium | M |

## P3 — later/advanced

| ID | Flow | Gap |
|----|------|-----|
| G-29 | Multi-currency/i18n | Single ZAR — fine for market |
| G-30 | Server-side cart sync | Cross-device carts |
| G-31 | Recommendations engine | Basic related-products only |
| G-32 | Loyalty/subscriptions | Mock pages suggest intent; no billing |
| G-33 | Store credit/gift cards | None |
| G-34 | B2B/quote workflow formalisation | Enquiry pricing is informal |
| G-35 | Structured order audit log | None |
| G-36 | Money in cents | Integer-rand constraint |

## What already meets production grade

- Server-resolved pricing at checkout (client prices never trusted) — better than
  many production stores.
- Token-gated order lookup with UUIDv4 secure_token, rate limiting, noindex,
  no-referrer headers.
- Idempotent, compensated order creation with zod validation + SA phone
  normalisation + honeypot + optional Turnstile/rate-limit.
- Payfast ITN hardened: IP allowlist, signature, server-to-server validation,
  exact-amount check, idempotency.
- Auth flows complete and safe (open-redirect guards, anti-enumeration, recovery).
- Consent-gated analytics (Consent Mode default-denied) — POPIA-correct.
- PII anonymisation cron for stale `submitted` orders.
