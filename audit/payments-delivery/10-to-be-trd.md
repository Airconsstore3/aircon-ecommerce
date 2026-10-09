# 10 — To-Be Technical Requirements Document

**Subsystem:** Payments + Delivery, Aircons Store
**Status:** Draft — open questions in `16-open-questions.md` must be resolved before sign-off.

---

## 1. Overview

Replace the current "order = payment = fulfilment" model with three cooperating
subsystems: **payments** (provider-agnostic, event-sourced, reconciled), **delivery**
(first-class fulfilment with zones, scheduling, drivers, PoD), and **notification/
observability** plumbing that ties them together.

## 2. Goals / non-goals

**Goals**
- Support payment methods: manual EFT (with PoP), instant EFT (Payfast), card (Payfast
  hosted), deferred payment (pay on delivery/completion), on-site collection.
- No transaction-value limits imposed by our own system.
- Every money-relevant or delivery-relevant action produces an immutable event.
- Customer can track an order end-to-end without phoning.
- Drivers/installers have a defined interface; admin never edits raw SQL for normal ops.
- Remain SAQ-A PCI scope.

**Non-goals**
- Multi-currency, marketplace/split payments, subscriptions, BNPL, marketplace couriers
  (phase 3+), route optimisation ML, real-time consumer-grade driver GPS for customers
  (phase 3).

## 3. Requirements

> MoSCoW: Must / Should / Could / Won't.

---

### TR-PAY-001 — Payment method registry (config-driven)
**Priority:** Must
**Description:** Payment methods are rows in `payment_methods` (replaces the thin
`payment_providers` usage), each with `code`, `display_name`, `type`
(`hosted_redirect | manual_eft | deferred | on_site | wallet`), `is_enabled`,
`configuration` JSONB (non-secret only), `min_amount_zar`/`max_amount_zar` (nullable =
no limit), `sort_order`.
**Technical requirements:**
- Checkout renders methods from this table; method-specific schema validated per-method.
- Provider code resolved through the existing `registry.ts` seam; providers not in code
  can still exist as `manual_*` types handled by admin confirmation.
- Secrets stay in env; `configuration` holds only public config (merchant ID, URLs).
**Acceptance criteria:**
- Given a new `manual_*` row enabled in DB, when checkout loads, then the method appears
  and completes end-to-end with zero code changes.
- Given `max_amount_zar` is null, when a customer checks out any amount, then no
  system-imposed cap applies.
**Dependencies:** GAP-21. **Risks:** none significant.
**Monitoring:** count of checkouts per method code.
**Test notes:** unit — registry lookup; e2e — enable/disable via DB row.

---

### TR-PAY-002 — Deferred / optional payment
**Priority:** Must
**Description:** Orders carry `payment_timing`: `prepaid | on_delivery | on_completion`
(after installation). `payment_status` may be `pending`/`deferred` while fulfilment
proceeds; the delivery state machine blocks `delivered` until payment is captured or an
audited admin override exists.
**Technical requirements:**
- `orders.payment_timing` + `deferred` added to `payment_status` enum semantics.
- Eligibility rules: which methods allow deferred (config per method, e.g. EFT deferred
  requires admin approval).
- `delivery_events` transition to `delivered` asserts payment state or override.
**Acceptance criteria:**
- Given an `on_completion` order, when the driver attempts to mark delivered without a
  captured payment, then the action is rejected and logged.
- Given an admin override, when delivered is set, then `override_by` + reason is in
  `order_events`.
**Dependencies:** GAP-01, GAP-02. **Risks:** delivering goods unpaid — mitigated by the
hard rule + daily unpaid-delivered report.
**Monitoring:** count of unpaid delivered orders (must be 0 without override).
**Test notes:** integration — driver flow rejects unpaid delivery.

---

### TR-PAY-003 — Webhook idempotency & event log
**Priority:** Must
**Description:** `payment_events` (append-only): `id, payment_id, provider_code,
provider_transaction_id, event_type, payload JSONB, received_at, processed_at,
processing_result`. `payments.provider_transaction_id` gets a **unique** constraint per
(provider_code, provider_transaction_id).
**Technical requirements:**
- ITN handler: insert event → dedupe on (provider, txn_id, event_type) → apply transition
  inside a DB transaction → mark processed.
- Order status derived consistently — transitions via a single `apply_payment_event()`
  function, not ad-hoc updates.
**Acceptance criteria:**
- Given the same ITN delivered twice concurrently, when both requests process, then
  exactly one transition occurs and the second returns 200 "already processed".
**Dependencies:** GAP-06, GAP-19. **Risks:** migration on existing rows — dedupe first.
**Monitoring:** duplicate-ITN counter; unprocessed-event age.
**Test notes:** fire duplicate ITN payloads; assert single transition.

---

### TR-PAY-004 — Payment reconciliation
**Priority:** Must
**Description:** Scheduled job (pg_cron → edge function or Vercel cron) that:
1. Flags orders `payment_status='processing'` older than 30 min → query provider status
   (Payfast query API) or alert.
2. Flags `pending` manual-EFT orders older than `payment_due_at` → send reminder; auto-
   `expired` after configurable TTL (default 7 days) unless admin extends.
3. Produces a daily reconciliation report (payments table vs provider settlement CSV/API).
**Acceptance criteria:**
- Given an order stuck `processing`, when the job runs, then the order is resolved to
  its true state or appears on an exceptions list with an alert.
**Dependencies:** TR-PAY-003. **Risks:** false "expired" on slow EFT — require explicit
TTL config + reminder before expiry.
**Monitoring:** job run log; exceptions count; alert on >N stuck.
**Test notes:** seed a stuck order; run job; assert resolution.

---

### TR-PAY-005 — Refunds
**Priority:** Must
**Description:** `refunds` table: `id, payment_id FK, amount_zar, reason, status
(requested|approved|processed|failed), method (same_as_payment|manual_eft),
requested_by, processed_at`. Card/Payfast refunds via provider refund API or admin-marked
manual; EFT refunds always manual-transfer records.
**Technical requirements:**
- Admin UI action with reason + amount ≤ remaining refundable amount.
- `payment_status` → `refunded`/`partially_refunded` derived from refunds sum.
- Customer notification on refund status change.
**Acceptance criteria:**
- Given a paid R10,000 order, when admin refunds R4,000, then `partially_refunded`,
  remaining refundable = R6,000, customer emailed.
**Dependencies:** GAP-03, TR-PAY-003. **Risks:** Payfast refunds may be manual-only —
verify provider capability (open question).
**Monitoring:** refund count/amount per period.
**Test notes:** unit — refundable-amount calculation; e2e — partial refund flow.

---

### TR-PAY-006 — Proof-of-payment upload (manual EFT)
**Priority:** Should
**Description:** Confirmation page offers PoP upload → Supabase Storage private bucket
`proof-of-payment/{order_id}/…`, write-gated by secure_token via signed upload URL;
`payments.pop_document_id`; admin sees PoP alongside order for matching.
**Acceptance criteria:**
- Given a valid order token, when customer uploads PDF/image ≤5MB, then file stored
  privately, linked, and admin sees an "unmatched PoP" work queue.
**Dependencies:** GAP-15. **Risks:** malware/phishing uploads — restrict MIME, AV-scan
later.
**Test notes:** upload without token → 403.

---

### TR-PAY-007 — Payment security baseline
**Priority:** Must
- Rotate `ORDER_WEBHOOK_SECRET`; move trigger secret to Supabase Vault. (SEC-01)
- Add CSP: `default-src 'self'; script-src 'self' challenges.cloudflare.com
  googletagmanager.com …; frame-ancestors 'none'` + `Referrer-Policy`, `X-Content-Type-
  Options`. (SEC-02)
- Rate-limit key = `x-real-ip` else rightmost XFF; Turnstile required in production
  (fail closed when `NODE_ENV=production` and secret unset → refuse checkout). (SEC-03/04)
- ITN endpoint: add `pf_payment_id` dedup (TR-PAY-003). Keep current 4-layer verification.
- No card/bank credential storage — assert via code review + SAQ-A scope doc.
**Acceptance criteria:** checkout HTML includes CSP header; forged ITN rejected (test
suite); duplicate ITN → single transition.

---

### TR-PAY-008 — Payment notifications
**Priority:** Should
Extend `order-email` trigger (or move to event-driven) to send: payment received,
payment failed + retry link, refund processed, EFT reminder, EFT expired. WhatsApp
template messages where channel includes whatsapp.
**Acceptance criteria:** each status change → exactly one notification; dedup via
`payment_events`.

---

### TR-DEL-001 — Delivery data model
**Priority:** Must
New tables:
```
deliveries (id, order_id FK, type delivery|installation|both, status, zone_id FK,
  scheduled_date, time_window, driver_id FK nullable, address fields + postal_code +
  geo lat/lng nullable, delivery_fee_zar, attempts, created_at, updated_at)
delivery_events (id, delivery_id, event_type, actor_type admin|driver|system,
  actor_id, note, gps point nullable, created_at)  — append-only
delivery_zones (id, name, postal_codes text[] or suburbs, fee_zar, is_active,
  min_order_for_free_zar nullable)
drivers (id, user_id→auth.users nullable, name, phone, vehicle, is_active)
proof_of_delivery (id, delivery_id, type signature|photo|otp, storage_path,
  recipient_name, captured_at, gps, immutable — no UPDATE policy)
payment_collections (id, order_id, delivery_id, method cash|card_terminal|eft|link,
  amount_zar, collected_by, collected_at, reference, status)
```
RLS: admins full; drivers see assigned deliveries only (limited columns via view);
service role for system writes.
**Acceptance criteria:** migration applies clean; RLS tests pass (driver can't read
unassigned delivery; anon can't read anything).

---

### TR-DEL-002 — Delivery zones & fees at checkout
**Priority:** Must
Checkout validates `delivery_province`+`postal_code` against `delivery_zones`; rejects
out-of-zone orders with a clear message; adds `delivery_fee_zar` line to pricing (zone fee,
free over configured threshold — finally using `free_shipping_threshold_zar` or per-zone
`min_order_for_free_zar`).
**Acceptance criteria:** out-of-zone postcode → checkout error listing service area;
in-zone below threshold → fee line shown in breakdown and in `orders`.
**Dependencies:** TR-DEL-001; postal_code field added to checkout schema.

---

### TR-DEL-003 — Fulfilment workflow (admin)
**Priority:** Must
Admin UI: order work queue → schedule delivery (date + window + zone check) → assign
driver → dispatch → track status. Status transitions only via UI actions that write
`delivery_events` — no raw edits. Bulk actions: assign multiple deliveries to a driver/date.
**Acceptance criteria:** a dispatcher can take a paid order to `dispatched` in <5 clicks;
every step evented; invalid transitions rejected server-side.

---

### TR-DEL-004 — Driver interface
**Priority:** Should (phase 2 — a printed run-sheet + admin-marked events is an acceptable
phase-1 workaround)
Mobile-web driver app (PWA): login → today's assigned deliveries → navigation link →
status buttons (departed/arrived/delivered/failed+reason) → PoD capture (photo/signature/
OTP) → optional payment collection record → sync. Requires TR-DEL-001 + driver auth role.
**Offline:** queue events locally; sync on reconnect; server dedupes by event UUID
(idempotent writes).
**Acceptance criteria:** driver completes a delivery incl. photo PoD with no admin help;
event appears in timeline; customer gets delivered notification.

---

### TR-DEL-005 — On-site payment collection
**Priority:** Should
`payment_collections` recording. Methods: cash receipt, card-terminal receipt number
(external terminal — P2PE, out of PCI scope), payment link/QR shown to customer (Payfast
link generated per-delivery), or EFT confirmed by admin later. Deferred orders cannot
reach `delivered` without a collection or override (TR-PAY-002).
**Acceptance criteria:** on_delivery order → driver records collection → payment_status
→ paid → delivered allowed.
**Dependencies:** TR-PAY-002, TR-DEL-004.

---

### TR-DEL-006 — Customer tracking page
**Priority:** Must
Extend `/order-confirmed/[token]` (or new `/track/[token]`) into a live timeline:
order received → payment status → scheduled (date+window) → out for delivery →
delivered/installed → PoD receipt link. Polls or Supabase Realtime on
`delivery_events` filtered by token-gated delivery_id. SMS/email at each stage (TR-PAY-008
shared mechanism).
**Acceptance criteria:** customer opens token link and sees current stage + ETA window;
each transition triggers one notification.

---

### TR-DEL-007 — Failed delivery handling
**Priority:** Must
`failed_attempt` requires reason code (no_answer|address_wrong|access_denied|customer_
cancelled|other); auto-notification with reschedule link; `attempts++`; after
`max_attempts` (config, default 2) → `returned_to_depot` → refund/cancel workflow incl.
delivery-fee handling.
**Acceptance criteria:** second failed attempt auto-creates return workflow and alerts
ops; customer was notified at each step.

---

### TR-SEC-* — see `13-security-controls-matrix.md` to-be column
### TR-OBS-* — observability
**TR-OBS-001 (Must):** structured event log + admin ops dashboard: today's deliveries,
stuck payments, failed ITNs, unpaid-delivered exceptions.
**TR-OBS-002 (Should):** alerting on: ITN failure spike, order stuck `processing` >30min,
delivery SLA breach, webhook endpoint non-200.
**TR-OBS-003 (Should):** metrics: payment success rate, EFT time-to-confirm, on-time
delivery %, failed-delivery rate, cost/delivery.

## 4. API specification (new endpoints)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/payfast/itn` | POST | IP allowlist + sig + server-validation | existing, hardened (TR-PAY-003) |
| `/api/delivery/track` | GET | order UUID + secure_token | public tracking payload |
| `/api/delivery/[id]/events` | POST | driver session | append status event (idempotent by event UUID) |
| `/api/delivery/[id]/pod` | POST | driver session | upload PoD artefact |
| `/api/delivery/[id]/collect` | POST | driver session | record payment collection |
| `/api/admin/orders/[id]/mark-paid` | POST | admin | manual EFT confirm (audited) |
| `/api/admin/orders/[id]/refund` | POST | admin | initiate refund |
| `/api/admin/deliveries/*` | POST | admin/dispatcher | schedule/assign/dispatch |
| `/api/pop/upload-url` | POST | secure_token | signed PoP upload URL |

Errors: JSON `{error: {code, message}}`; 400 validation, 401/403 auth, 404 unknown,
409 invalid transition, 429 rate limited, 500 internal. Versionless (internal API);
additive changes only.

## 5. Compliance

- **PCI DSS:** SAQ-A maintained — hosted redirect only; on-site card = external P2PE
  terminal; never key card data.
- **POPIA:** PoD photos/GPS = personal information — retention policy, access logging,
  consent notice at checkout and on PoD capture; extend PII cron to a defined retention
  matrix per status.
- **Consumer Protection Act:** delivery timeframes + refund windows displayed at checkout.

## 6. Reliability & DR

- Idempotent everything: checkout (fix key persistence), ITN (event dedup), driver
  events (client UUID), PoP upload (order-scoped path).
- Supabase PITR on Pro tier; nightly logical backup export for orders/payments/events.
- Webhook failure → reconciliation job recovers (TR-PAY-004); provider outage → manual
  EFT remains enabled as fallback method.
- Rollback: all new tables additive; feature flags per capability (`delivery_enabled`,
  `driver_app_enabled`); payment changes revertible by toggling `payment_providers`.

## 7. Testing strategy — see `14-test-plan.md`

## 8. Acceptance criteria (subsystem level)

1. A customer can complete a manual-EFT order, upload PoP, and be marked paid by admin
   without SQL.
2. A Payfast order survives a dropped ITN (reconciliation recovers it).
3. A deferred-payment order physically cannot be marked delivered unpaid (without an
   audited override).
4. Every payment/delivery state change is reconstructable from events alone.
5. Customer never needs to phone to learn order/delivery status.
6. CSP + hardened headers verified by scanner; ITN forgery tests all fail closed.
