# 09 — Gap Analysis

Current state vs a production-grade payment + delivery system supporting: EFT (instant +
manual), card, optional/deferred payment, on-site collection, no transaction limits,
security, and end-to-end tracking.

Effort: S <1d, M 1–3d, L 1–2wk, XL >2wk. Priority: P0 now, P1 <6wk, P2 <12wk, P3 later.

| ID | Area | Gap | Evidence | Sev | Financial | Customer | Operational | Recommendation | Effort | Prio | Deps |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GAP-01 | Payment/Delivery | Payment completion = order `completed`; no fulfilment layer | `itn/route.ts:108` | Critical | Delivered-vs-paid untracked → disputed deliveries, leakage | Sees "completed" for undelivered order | Cannot tell what's outstanding | Split order fulfilment state from payment state; new `deliveries` + events | L | P0 | — |
| GAP-02 | Delivery | No deliveries/shipments/driver/tracking model at all | 02-delivery-audit | Critical | Cannot run own-driver model | No tracking, no ETA | Dispatch is phone calls | Build deliveries + delivery_events + driver_assignment tables | L | P0 | GAP-01 |
| GAP-03 | Payment | No admin UI for payment ops (EFT confirm, refund, override) | no /admin routes | Critical | Manual EFT can't be confirmed without SQL | Payment confirmed slowly/none | SQL is the admin tool | Admin console: orders list, mark-paid, refund, delivery dispatch | XL | P0 | — |
| GAP-04 | Payment | No refund implementation (enum only) | grep refund → display only | High | Can't honour stated refund policy | Refund = invisible manual process | No audit trail | refunds table + admin action + Payfast manual flow + EFT manual transfer record | M | P1 | GAP-03 |
| GAP-05 | Payment | Missed-ITN orders stuck `processing` forever | PAY-04 | High | Paid-but-unrecorded orders possible | "Processing…" forever | Silent revenue/state drift | Reconciliation cron (query Payfast or flag stuck>30min) + retry-safe status repair | M | P1 | — |
| GAP-06 | Payment | No payment/delivery event log; last-write-wins | DM-02, OBS-01 | High | No audit trail for money actions | Disputes unresolvable | No debugging history | `payment_events` + `order_events` append-only tables, status derived | M | P1 | — |
| GAP-07 | Payment | Idempotency key regenerated per click | `CheckoutClient.tsx:99` | High | Duplicate orders → duplicate Payfast charges possible | Double payment refunds | Order spam | Persist key per cart/checkout session (generated once per cart, stored client-side) | S | P0 | — |
| GAP-08 | Delivery | No delivery fee anywhere; `free_shipping_threshold_zar` dead | DEL-03 | High | Revenue leakage on every delivery | Misleading "free delivery" | Margin erosion invisible | delivery_fee_zar in pricing; zones/rates tables | M | P1 | GAP-02 |
| GAP-09 | Delivery | No service-area/zone restriction | DEL-04 | High | Accepts undeliverable orders | Orders taken then cancelled | Manual triage per order | delivery_zones + postcode/suburb validation at checkout | M | P1 | — |
| GAP-10 | Payment | On-site payment collection absent | DEL checklist §5 | High | Can't offer pay-on-delivery/install | Forced prepay or nothing | Cash/terminal unrecorded | payment_collections + driver flow; start with EFT-confirm-on-site + card terminal receipt capture | L | P2 | GAP-02, GAP-03 |
| GAP-11 | Payment | Deferred/optional payment not modelled | PAY requirements | Medium | Can't offer "pay on completion" | Less flexible checkout | — | `payment_timing` field: prepay | on_delivery | on_completion | M | P1 | GAP-01 |
| GAP-12 | Security | `ORDER_WEBHOOK_SECRET` in git | migration:9 | High | — | — | Webhook spoofable until rotated | Rotate secret; move trigger to read from Vault/env | S | P0 | ops access |
| GAP-13 | Security | No CSP/SRI on checkout | SEC-02 | High | — | Payment page tampering risk | — | Add CSP headers via next.config/middleware; pin script hosts | M | P1 | — |
| GAP-14 | Security | Rate limit spoofable + fails open | SEC-03/04 | Medium | Bot orders spam | — | Fake orders flood ops | x-real-ip/rightmost XFF; make Turnstile required for prod | S | P1 | — |
| GAP-15 | Payment | EFT: no PoP upload, matching, expiry | PAY-10 | Medium | Unpaid orders linger | Slow confirmation | Manual bank matching | PoP upload (Supabase Storage) + reference match report + unpaid-expiry cron | M | P1 | GAP-03 |
| GAP-16 | Tracking | No customer notifications post-checkout | OBS-05 | Medium | — | Silence between order and delivery | Inbound "where's my order" calls | Status-change notification trigger (Resend/WhatsApp template) | M | P1 | GAP-06 |
| GAP-17 | Observability | No metrics/alerting anywhere | 04-audit | Medium | Outages invisible | Broken flows discovered late | Blind ops | Structured logs + alert on ITN failure rate, stuck orders | M | P2 | — |
| GAP-18 | Delivery | No PoD (signature/photo/OTP) | DEL §7 | High | Cannot dispute "not delivered" | No receipt | Liability on big-ticket installs | proof_of_delivery table + private storage + capture in driver flow | M | P1 | GAP-02 |
| GAP-19 | Payment | `provider_transaction_id` not unique; no ITN dedup table | PAY-07 | Medium | Double-processing risk grows with writers | — | — | Unique index + itn_events dedup | S | P1 | GAP-06 |
| GAP-20 | Delivery | Address unvalidated (no postcode/suburb/geo) | DEL-07 | Medium | Failed deliveries cost real money | Driver can't find address | Manual cleanup | Structured address fields + optional geocode; add postal_code | S | P1 | GAP-09 |
| GAP-21 | Payment | `payment_providers.configuration` unused; method enum hardcoded | PAY-17/19 | Low | — | — | Adding provider = code change | Drive provider metadata from table; extend enum | S | P2 | — |
| GAP-22 | Security | Email-matched order access depends on email verification being enforced | SEC-06 | Medium | PII exposure if registration allows unverified emails | — | — | Verify Supabase `confirm email` setting; else key access on verified claim | S | P1 | dashboard check |
| GAP-23 | Ops | `20260925_audit_hardening.sql` unverified-applied | SEC-05 | Medium | — | PII if unapplied | — | Run + verify policies in dashboard | S | P0 | dashboard |
| GAP-24 | Payment | No `paid`/`failed`/refund customer emails | OBS-05 | Medium | — | Poor payment UX | — | Extend notify trigger to payment UPDATEs | S | P1 | GAP-06 |
| GAP-25 | Payment | No disputes/chargeback handling | — | Low | Chargeback losses unhandled | — | — | Manual process doc + disputes table later | S | P3 | — |
| GAP-26 | Sizing | Config queries uncached (11 tables/checkout) | sizing §5 | Low | DB load scales 11× checkouts | — | — | Upstash/ISR cache for pricing config | S | P2 | — |
| GAP-27 | Delivery | No driver management/app/notifications | DEL §4 | High | Can't operate own drivers visibly | No live ETA | Dispatch by phone | Phase-2 driver app (mobile web PWA) or 3rd-party courier integration first | XL | P2 | GAP-02 |
| GAP-28 | Delivery | No failed-delivery/redelivery flow | DEL §9 | Medium | Redelivery cost unplanned | Stuck deliveries | — | failed_attempt state + reschedule + max-attempts rule | M | P2 | GAP-02 |
| GAP-29 | Compliance | PII retention cron misses non-`submitted` orders | SEC (retention) | Medium | POPIA retention exposure | — | — | Define retention policy per status; extend cron scope consciously | S | P2 | legal |
| GAP-30 | Payment | `provider_response` overwrites + stores raw ITN PII | SEC-09 | Low | — | — | — | Keep raw once in events; minimise stored PII | S | P2 | GAP-06 |
