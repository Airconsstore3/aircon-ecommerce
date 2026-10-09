# 11 — Payment State Machine

## As-is (actual, evidence-derived)

```mermaid
stateDiagram-v2
    [*] --> pending : submitCheckout inserts order\n(orders.payment_status)

    pending --> processing : GET /api/payfast/redirect\n(payfast orders only)
    processing --> paid : ITN COMPLETE (verified:\nIP + sig + server-valid +\nmerchant + amount)
    pending --> paid : ITN COMPLETE\n(redirect skipped edge case)
    processing --> failed : ITN FAILED
    processing --> cancelled : ITN CANCELLED
    pending --> failed : ITN FAILED
    pending --> cancelled : ITN CANCELLED
    failed --> processing : customer re-hits /api/payfast/redirect\n(no UI offers this — works anyway)
    cancelled --> processing : same

    paid --> [*] : terminal (early-return on duplicate ITN)
    failed --> [*] : de facto terminal (no retry UI)
    cancelled --> [*] : de facto terminal

    note right of pending
        manual_eft orders live here until an
        admin hand-edits the DB. No code path.
    end note
    note right of paid
        Enum also allows refunded /
        partially_refunded — UNREACHABLE,
        no writer exists.
    end note
```

### orders.status (parallel, conflated)

```mermaid
stateDiagram-v2
    [*] --> submitted : checkout insert
    submitted --> sent_whatsapp : markWhatsAppSent\n(customer opened wa.me)
    submitted --> completed : ITN paid\n(PAY-01: payment ⇒ fulfilment)
    sent_whatsapp --> completed : ITN paid / admin
    submitted --> cancelled : admin (DB)
    [*] --> email_sent : never written by code
    completed --> [*]
    cancelled --> [*]
```

### Transition enforcement

**None.** Transitions are just `UPDATE`s; any enum value can follow any other. The only
guards in code: ITN ignores notifications for already-`paid` orders; redirect refuses
already-`paid` orders.

## To-be (target for TRD)

```mermaid
stateDiagram-v2
    [*] --> created : order created
    created --> awaiting_payment : payment method selected
    created --> payment_optional : method=deferred/on_site

    awaiting_payment --> payment_processing : gateway redirect initiated
    payment_processing --> paid : verified webhook
    payment_processing --> failed : webhook FAILED / timeout
    failed --> awaiting_payment : retry (new payment attempt row)
    awaiting_payment --> expired : unpaid > TTL (cron)
    expired --> awaiting_payment : customer reactivates

    paid --> refund_pending : refund initiated
    refund_pending --> refunded : refund webhook / manual confirm
    refund_pending --> partially_refunded : partial amount
    paid --> partially_refunded : partial refund

    payment_optional --> paid : payment collected on-site /\nEFT confirmed
    awaiting_payment --> cancelled
    payment_optional --> cancelled
    paid --> cancelled : admin override (audited)
    refunded --> [*]
    cancelled --> [*]
    expired --> [*]
```

Rules the to-be machine enforces (currently absent):

- Single writer per transition via an `order_events`/`payment_events` append-only table —
  status is *derived* from events, not stored as truth.
- Terminal states: `refunded`, `cancelled`, `expired` are final; only admins can override,
  and overrides emit an event with actor identity.
- Every transition emits a notification hook (email/WhatsApp) and a metrics counter.
- `provider_transaction_id` unique per payment attempt → webhook dedup is structural.
- Order `status` (fulfilment) and `payment_status` are separate machines joined at
  `order_id`; payment never writes fulfilment status directly.
