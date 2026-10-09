# 02 — Delivery System Audit

## Verdict up front

**There is no delivery subsystem.** The entirety of "delivery" in this codebase is:

- Three free-text columns on `orders`: `delivery_address`, `delivery_city`,
  `delivery_province` (`20260812_checkout_payment_hardening.sql:63-65`).
- A `shipping_summary` / `shipping_policy_url` text field on `settings` used for
  marketing copy on product pages (`20260807_add_care_instructions_and_policy_settings.sql:11-16`).
- A `free_shipping_threshold_zar` column on `settings` — **declared but never read by any
  code path** (`20250630_create_settings_table.sql:8`; zero code references).
- `products.shipping_info` text field (display only).
- A confirmation-page promise: *"We will contact you shortly to arrange delivery and
  installation."* (`order-confirmed/[token]/page.tsx:184`) — fulfilment is a phone call.

Everything else — shipments, drivers, tracking, rates, zones, proof of delivery, on-site
payment — is **MISSING — not implemented**.

## Evidence of absence

```
grep -rni "delivery|shipping|driver|courier|tracking|waybill|fulfillment" src/
  → only: address form fields, marketing copy, policy pages, mock-data.ts (dead code)
grep -rni "delivery|shipping|driver|tracking" supabase/migrations/
  → only: settings.shipping_summary, settings.shipping_policy_url,
          products.shipping_info, settings.free_shipping_threshold_zar
```

No tables: `deliveries`, `shipments`, `delivery_events`, `drivers`, `driver_assignments`,
`delivery_zones`, `delivery_rates`, `proof_of_delivery`, `tracking_events`, `returns` —
**none exist** in any of the 34 migrations.

## Checklist audit

### 1. Delivery methods

| Item | Status |
|---|---|
| Own delivery | Not modelled. Installation implied ("We will contact you to arrange delivery and installation") — a phone call, not a workflow |
| Courier integration | MISSING — no courier API code, no waybill fields |
| Pickup | MISSING — no pickup option in checkout |
| Configurable methods | MISSING — `deliveryAddress` is required free-text on every order (`actions.ts:42`); cannot choose pickup vs delivery |
| Delivery zones / restrictions | MISSING — orders accepted from **any address anywhere**; phone must be SA (+27) but address is unrestricted free text |
| Time slots / scheduling | MISSING |
| Same/next-day | MISSING |

### 2. Shipping rates

| Item | Status |
|---|---|
| Rate calculation | MISSING — `resolveOrderPricing()` totals products+installation+kit+maintenance+warranty; **no delivery line item exists** (`server-pricing.ts:420-435`) |
| Flat rate | MISSING |
| Free-over-threshold | Half-implemented: `free_shipping_threshold_zar` column exists, **no code reads it** — dead config |
| Real-time carrier rates | MISSING |
| Tax on shipping | MISSING (no VAT handling anywhere — see §4) |

**Business impact:** delivery cost is never charged at checkout. Either it's absorbed
invisibly, or quoted manually post-order via WhatsApp — neither is enforced or auditable.

### 3. Fulfilment workflow

| Stage | Status |
|---|---|
| Picking | MISSING |
| Packing | MISSING |
| Dispatch | MISSING |
| Out-for-delivery | MISSING |
| Delivered / confirmed | MISSING — `status='completed'` is set by **payment**, not delivery (`itn/route.ts:108`) |
| Admin UI for any stage | MISSING — there is no `/admin` route in `src/app` at all; `nextadmin-template/` is an empty stub (only `node_modules`). All ops = direct DB edits in Supabase dashboard |
| Status transition permissions | N/A — no transitions exist beyond `submitted → sent_whatsapp → completed` |

### 4. Driver management

**MISSING — not implemented.** No driver table, role, app, assignment logic, notifications,
location tracking, or performance metrics. For "own drivers" delivery model this is a
complete greenfield build.

### 5. On-site payment collection

**MISSING — not implemented.** No driver app, no mobile gateway SDK, no QR/payment-link on
delivery, no offline capability, no on-site idempotency, no delivery receipt generation.
Note: the *payment* provider interface (`createPayment`/`verifyWebhook`) could technically
host a "pay_on_delivery" provider, but nothing downstream (collection record, reconciliation,
driver linkage) exists.

### 6. Customer tracking

| Item | Status |
|---|---|
| Tracking page | Partial — `/order-confirmed/[token]` shows payment status + items; `/account/orders` shows a mapped status (`enquiry/confirmed/paid/completed/cancelled`). **No delivery status exists to show.** |
| Tracking number | MISSING |
| Status timeline | MISSING — no events table |
| SMS/email stage notifications | MISSING — only the order-received email on INSERT |
| Live driver location | MISSING |
| ETA | MISSING |
| Reschedule | MISSING |
| Failed-delivery flow | MISSING |

### 7. Proof of delivery

**MISSING — not implemented.** No signature, photo, OTP, recipient-name, timestamp, or GPS
capture anywhere.

### 8. Delivery data model

**MISSING — not implemented.** See `07-data-model-audit.md` for the to-be schema.

### 9. Delivery reliability

| Item | Status |
|---|---|
| Failed delivery retry | MISSING |
| Redelivery scheduling | MISSING |
| Undeliverable handling | MISSING |
| Refund on failed delivery | MISSING (and no refund path at all — PAY-03) |
| Delivery SLA monitoring | MISSING |

## Findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| DEL-01 | Critical | No delivery/fulfilment subsystem exists — the business requirement (own drivers, tracking, on-site payment) is 100% unbuilt | entire section above |
| DEL-02 | Critical | `payment=paid` ⇒ `status='completed'` — the only "terminal" order state is reached at payment time; system cannot represent "paid but not delivered" or "delivered" | `itn/route.ts:108`, `account/orders/page.tsx:36` |
| DEL-03 | High | No delivery charge is ever computed — delivery is structurally free at checkout; `free_shipping_threshold_zar` is dead config | `server-pricing.ts:420-435` |
| DEL-04 | High | No delivery-area restriction — free-text address from anywhere in the world is accepted; only the phone number is SA-constrained | `actions.ts:42-44, 73-81` |
| DEL-05 | High | No admin tooling — fulfilment staff must edit DB rows; no transition validation, no audit trail of who changed status | no `/admin` routes; RLS grants UPDATE to any `admins` member |
| DEL-06 | High | Installation and delivery are conflated — `has_installation` is a priced line item, but no scheduling/dispatch exists for either | `actions.ts:30`, `order_items.installation_*` |
| DEL-07 | Medium | Address is unvalidated free text — no postcode field, no geocoding, no suburb; high risk of undeliverable/ambiguous addresses for big-ticket installed goods | `actions.ts:42` (`deliveryAddress: z.string().min(5)`) |
| DEL-08 | Medium | No customer communication after checkout — no dispatch/arrival/delivered notifications; customer must phone or wait | only `order-email` INSERT trigger exists |
| DEL-09 | Medium | Returns collection flow absent — return-policy page is content-only; no RMA/returns table or pickup scheduling | `return-policy/page.tsx` is static |
| DEL-10 | Low | `orderType` in the account UI is a guess — shows "installation" if any item `has_installation`, else "delivery"; not a real fulfilment type | `account/orders/page.tsx:93-95` |
