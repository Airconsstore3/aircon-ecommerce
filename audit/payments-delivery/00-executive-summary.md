# Payments & Delivery Audit — Executive Summary

**Product:** Aircons Store (airconsstore.co.za)
**Audit date:** 2026-10-09
**Scope:** Payment subsystem, delivery/fulfilment subsystem, security, tracking/observability, system sizing
**Method:** Static repo inspection, migration/SQL review, server-action and API-route trace. Live DB and hosting dashboards were not directly accessible (Supabase MCP unavailable); items needing runtime verification are marked `REQUIRES VERIFICATION`.

---

## TL;DR

This store is a **lead-capture storefront with a bolt-on payment layer**, not a transactional
ecommerce system. The payment plumbing that exists (Payfast redirect + ITN, Manual EFT) is
surprisingly well-hardened for its scope — server-side pricing, signature + server-to-server
ITN verification, IP allowlisting, checkout idempotency key, token-gated order lookup. But
**the delivery subsystem does not exist at all**: there are no shipments, no drivers, no
tracking, no proof of delivery, no shipping rates, and no fulfilment state machine. Payment
success currently marks the order `status = 'completed'` — i.e. the system literally cannot
distinguish "paid" from "delivered".

Readiness against the stated business requirements:

| Requirement | Status |
|---|---|
| EFT support | Partial — manual EFT works; no PoP upload, no reconciliation |
| Card / online payment | Implemented (Payfast) but DISABLED in DB; never exercised live |
| On-site payment collection | MISSING — not implemented |
| Optional / deferred payment | Partial — manual EFT is implicitly deferred; not modelled as a state |
| No transaction limits | Met in code (no caps found); provider/merchant limits undocumented |
| Driver app | MISSING — not implemented |
| Real-time tracking | MISSING — not implemented |
| PCI posture | Good — SAQ-A scope achievable (hosted redirect, no card data touched) |

## Top risks (one line each)

1. **Paying marks the order "completed"** — no fulfilment stage exists; a paid order is operationally indistinguishable from a delivered one. *(Critical)*
2. **No delivery/fulfilment model at all** — no shipments, drivers, tracking numbers, PoD, zones, or rates. *(Critical gap vs business requirements)*
3. **No refund code path** — `refunded`/`partially_refunded` statuses exist in the CHECK constraint but nothing can set them. *(High)*
4. **No admin UI** — manual EFT confirmation, refunds, and delivery updates can only happen by editing the DB directly. *(High)*
5. **Missed-ITN orders stick in `processing` forever** — no reconciliation job or status-polling fallback. *(High)*
6. **No payment/delivery event logs** — `payments.provider_response` is overwritten; no audit trail for financial actions. *(High)*
7. **Checkout idempotency key is regenerated per click** — double-submit protection is weaker than it looks; duplicate orders possible. *(High)*
8. **`ORDER_WEBHOOK_SECRET` committed to git** — must be rotated. *(High)*
9. **No CSP / SRI** — Turnstile and gtag scripts load on every page (incl. checkout) with no integrity or content-security protection. *(High)*
10. **Checkout rate-limit trusts client-supplied `x-forwarded-for` first hop** — spoofable; bypass + IP DoS vector. *(Medium)*

## The single most critical fix

**Introduce a real fulfilment/delivery state machine decoupled from payment.** Today
`payment_status='paid'` sets `orders.status='completed'` (`src/app/api/payfast/itn/route.ts:108`),
and the account page then reports the order as "completed" to the customer — before anything
has been picked, dispatched, delivered, or installed. Every downstream requirement (drivers,
tracking, on-site payment, PoD, SLA metrics) depends on this separation existing first.

## Readiness scores (0–5)

| Area | Score | Note |
|---|---|---|
| Payment methods | 2 | 2 methods, registry works, no on-site/COD/deferred states |
| EFT (manual) | 2 | Works end-to-end but no PoP upload, no matching, no admin UI |
| On-site payment | 0 | Not implemented |
| Optional/deferred payments | 1 | EFT is de-facto deferred; no modelling, no expiry enforcement |
| No-limit capability | 3 | No code caps; provider limits undocumented/untested |
| Payment security | 3 | Strong ITN verification; weak CSP/SRI, committed secret, spoofable rate limit |
| Delivery workflow | 0 | Not implemented |
| Driver management | 0 | Not implemented |
| Tracking | 1 | Static order/payment status only; no events, no customer tracking |
| Observability | 1 | console.log only; no metrics, alerts, reconciliation |
| System sizing | 2 | Comfortably sized for current low volume; no headroom planning done |

**Overall: 1.4 / 5** — a secure payment *shell* with no fulfilment system behind it.
