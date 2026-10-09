# 04 — Tracking & Observability Audit

## 1. Order state machine (as-is)

Two parallel status fields exist on `orders` — a design flaw documented in PAY-01:

| Field | States (CHECK constraint) | Writers |
|---|---|---|
| `orders.status` | `submitted, sent_whatsapp, email_sent, completed, cancelled` | `markWhatsAppSent` (submitted→sent_whatsapp); Payfast ITN paid→**completed**; admins (DB, any value in enum) |
| `orders.payment_status` | `pending, processing, paid, failed, cancelled, refunded, partially_refunded` | checkout (pending); payfast redirect (processing); ITN (paid/failed/cancelled); nobody (refunded states) |

Allowed transitions are **not enforced anywhere** — the CHECK constraints only restrict
the value set; any status can jump to any other. No transition table, no transition
function, no event emission.

### Transition map (actual)

```
                ┌─────────────────────────────────────────────┐
                │                  orders                      │
                │                                              │
 checkout       │  status=submitted      payment_status=pending│
   ───────────► │                                              │
                │  markWhatsAppSent      payfast redirect      │
                │  submitted→sent_whatsapp  pending→processing │
                │                                              │
                │  ITN COMPLETE          ITN FAILED/CANCELLED  │
                │  →completed            payment_status=       │
                │  payment_status=paid   failed|cancelled      │
                └─────────────────────────────────────────────┘
   admins: can UPDATE either field to any enum value via DB — unaudited
```

Events emitted per transition: **none**. Notifications per transition: order-received email
(INSERT trigger) + WhatsApp deep link to business. Nothing else.

## 2. Payment tracking

| Capability | Status | Evidence |
|---|---|---|
| Payment event log | **MISSING** — `payments.provider_response` JSONB is overwritten per ITN; history lost | `itn/route.ts:118-131` |
| Reconciliation vs gateway | **MISSING** — no job compares payments vs Payfast settlement | — |
| Failed payment retry tracking | MISSING — retry attempts uncounted; status just flips | — |
| Refund tracking | MISSING | — |
| Dispute tracking | MISSING | — |
| Metrics (success/fail/refund rate) | MISSING — would need SQL queries against `payments.status` | — |

## 3. Delivery tracking

**MISSING — not implemented.** No delivery events, no assignment records, no status
updates, no customer-facing tracking, no metrics (on-time %, failed rate, cost/delivery).

## 4. Observability

| Layer | Status | Evidence |
|---|---|---|
| Logging | `console.log`/`console.error` only — unstructured, goes to Vercel function logs (limited retention, no alerting). No PII in payment logs (good). | `actions.ts:315,435`; `itn/route.ts` |
| Metrics | NONE | — |
| Tracing | NONE — no request-id propagation, no order→payment→delivery trace | — |
| Alerting | NONE — a wave of failed ITNs or a broken webhook would be invisible until a customer phones | — |
| Dashboards | NONE | — |
| Stuck-order detection | NONE — `processing` forever is invisible | PAY-04 |
| Uptime monitoring on `/api/payfast/itn` | NONE | — |

## 5. Findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| OBS-01 | High | No append-only event log for orders/payments — the audit trail is "latest write wins" | schema |
| OBS-02 | High | Zero alerting — payment failures, stuck processing orders, and (future) delivery delays are invisible | console.* only |
| OBS-03 | Medium | No transition enforcement — any status can jump anywhere; invalid states (e.g. cancelled→completed) are representable | CHECK constraints only |
| OBS-04 | Medium | Customer-facing status vocabulary is misleading — account page reports paid orders as "completed" (suggests fulfilled) | `account/orders/page.tsx:36-41` |
| OBS-05 | Medium | No notifications on payment status changes — customer who pays by Payfast gets no "payment received" email; EFT payer gets no confirmation when admin marks paid | trigger is INSERT-only |
| OBS-06 | Low | `console.log` of checkout includes totals & method — fine; but no request-id/correlation for debugging | `actions.ts` |
