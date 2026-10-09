# 15 — Remediation Roadmap

Owners: `FE` frontend, `BE` backend/DB, `OPS`, `SEC`. Effort S/M/L/XL as in gap analysis.

## Phase 0 — Now (0–2 weeks): P0 safety & correctness

| # | Task | Sev it fixes | Effort | Owner | Acceptance |
|---|---|---|---|---|---|
| R-01 | Rotate `ORDER_WEBHOOK_SECRET`; move to Supabase Vault/secrets; update trigger fn | SEC-01 | S | OPS+BE | New secret live; old rejected (401 test) |
| R-02 | Verify `20260925_audit_hardening.sql` applied in prod; verify anon has no orders INSERT and no insecure SELECT policies | SEC-05 | S | OPS | Policy dump shows clean state |
| R-03 | Persist checkout idempotency key per cart session (generate once per cart, store in localStorage alongside cart; regenerate only after successful submit) | PAY-05/GAP-07 | S | FE | Double-click → 1 order (M-4) |
| R-04 | Stop writing `orders.status='completed'` on payment — set `status='paid_received'` (new enum) or keep `submitted`/`processing_fulfilment`; update account-page mapping to show "Paid — being processed" | PAY-01 (partial) | S | BE | Paid order no longer displays "completed" |
| R-05 | Fix rate-limit IP source (x-real-ip / rightmost XFF); fail closed in production when Turnstile secret missing | SEC-03/04 | S | BE | XFF-spoof test fails to bypass |
| R-06 | Add CSP + Referrer-Policy + frame-ancestors headers (report-only first week if needed) | SEC-02 | S | FE | securityheaders ≥ B; checkout functions |
| R-07 | Stuck-order sweep: manual SQL/ops script listing `processing`>30min & `pending`>7d; run daily until automated | PAY-04 stopgap | S | OPS | Daily exceptions list exists |

## Phase 1 — 2–6 weeks: P1 hardening & minimum viable fulfilment

| # | Task | Sev | Effort | Owner | Acceptance |
|---|---|---|---|---|---|
| R-08 | `payment_events` + `order_events` append-only tables; route all status writes through event function; unique (provider_code, provider_transaction_id) | GAP-06/19 | M | BE | Duplicate ITN → single transition (IT-4) |
| R-09 | Admin orders console v1: list/search orders, mark EFT paid (audited), record refund (manual method) | GAP-03/04 | L | FE+BE | No SQL needed for pay/refund ops |
| R-10 | Reconciliation cron: stuck-processing resolve via Payfast query + unpaid-EFT reminder/expiry | GAP-05 | M | BE | IT-12 passes; alert wired |
| R-11 | `deliveries` + `delivery_events` + `delivery_zones` schema; order→delivery created on paid/confirmed | GAP-01/02 | M | BE | Migration + RLS tests (RL-4) |
| R-12 | Delivery fee at checkout: zone lookup + `delivery_fee_zar` line + `postal_code` field | GAP-08/09/20 | M | FE+BE | Out-of-zone rejected; fee in total |
| R-13 | Customer status notifications on payment + delivery events (extend email trigger or event-driven) | GAP-16/24 | M | BE | One notification per transition |
| R-14 | PoD capture v1 (admin/dispatcher uploads signature/photo; OTP later) | GAP-18 | M | BE | Private storage; immutable records |
| R-15 | PoP upload for manual EFT | GAP-15 | M | FE+BE | IT-15 passes |
| R-16 | Verify/enable Supabase email confirmation; else gate order-history on verified claim | GAP-22 | S | OPS+BE | Unverified account sees no orders |

## Phase 2 — 6–12 weeks: P2 capability build-out

| # | Task | Sev | Effort | Owner | Acceptance |
|---|---|---|---|---|---|
| R-17 | Driver PWA: assignment list, status events, PoD (photo/sig/OTP), offline queue+sync | GAP-27 | XL | FE+BE | M-7 passes end-to-end |
| R-18 | On-site payment collection records + deferred-payment enforcement (delivered requires payment/override) | GAP-10/11 | L | BE+FE | IT-14 passes |
| R-19 | Customer live tracking page (timeline + ETA window + notifications) | DEL-06 | L | FE | M-7 visible to customer token |
| R-20 | Failed-delivery loop: reason codes, reschedule, max attempts → return/refund | GAP-28 | M | BE | M-8 passes |
| R-21 | Ops dashboard + alerting (stuck payments, ITN failures, SLA breaches) | GAP-17 | M | BE+FE | Alerts fire in staging tests |
| R-22 | Refund via provider API where supported; disputes table | GAP-25 | M | BE | Refund round-trip in sandbox |
| R-23 | Pricing-config cache (Upstash 5–15min TTL) | GAP-26 | S | BE | Checkout queries drop ~90% |
| R-24 | PII retention matrix per status; extend cron deliberately | GAP-29 | S | BE+legal sign-off | Retention doc + cron matches |

## Phase 3 — Later: P3 optimisation & advanced

| # | Task | Effort |
|---|---|---|
| R-25 | Second gateway (e.g. Ozow instant EFT, or Peach/Yoco for card breadth) + routing rules | L |
| R-26 | Courier integration option (The Courier Guy / Bob Go / Pargo) for non-installation deliveries | L |
| R-27 | Route optimisation for driver runs (OSRM/Google Routes) | XL |
| R-28 | Fraud scoring on checkout (velocity, disposable email, address risk) | L |
| R-29 | Realtime customer driver-tracking (live GPS share during out_for_delivery) | L |
| R-30 | Data warehouse exports (orders/payments/delivery events → analytics) | M |

## Dependency chain (critical path)

```
R-04 (state split) → R-11 (delivery model) → R-17/R-18/R-19 (driver/tracking)
R-08 (events) → R-09 (admin) → R-10 (recon) → R-22 (refund API)
R-11 → R-12 (zones/fees) → R-20 (failed delivery)
```
