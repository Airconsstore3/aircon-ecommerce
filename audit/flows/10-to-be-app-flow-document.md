# App Flow Document (AFD) — TO-BE Specification

**Product:** Aircons Store · **Version:** 1.0-draft · **Date:** 2026-10-09
**Basis:** as-implemented audit (files 00–09 in this folder). This document defines
the target flows. Items marked **[NEW]** require new implementation; **[KEEP]**
already works per evidence; **[FIX]** exists but must change.

---

## 1. Overview

Aircons Store is a South African D2C + service business selling air conditioners,
installation, kits, maintenance plans and warranties — where fulfilment (delivery +
install) is scheduled by a human after ordering. The to-be model keeps the proven
"server-priced guest checkout" core and adds the operational layer the business
currently performs by hand: an admin surface, reliable notifications, real
lead-capture forms, a post-purchase status model, and a minimal discount/contact
capability.

## 2. Personas & roles

| Persona | Auth | Capabilities |
|---|---|---|
| Guest shopper | none | browse, configure, cart, guest checkout (EFT/Payfast), view own order via token link |
| Registered customer | Supabase email | all guest + order history, order detail, profile, (target) saved addresses, warranty register |
| Store admin | Supabase email + `admins` row | all customer + `/admin`: orders, status transitions, catalogue CRUD, service requests |
| Owner | admin + inbox | receives all order/lead notification emails |
| System | service role | pricing resolution, ITN handling, emails, crons |

## 3. Flow inventory (to-be)

Customer: C-01 browse/search · C-02 PDP configure · C-03 cart · C-04 checkout ·
C-05 pay (EFT|Payfast) · C-06 order status & history · C-07 auth · C-08 profile &
addresses · C-09 warranty register/claim · C-10 service booking · C-11
contact/support · C-12 coupon · C-13 newsletter · C-14 refund request ·
C-15 order tracking

Admin: AD-01 login · AD-02 dashboard · AD-03 order list/detail · AD-04 status
transitions (paid/cancel/refund/fulfil) · AD-05 catalogue CRUD · AD-06 service
requests · AD-07 discounts · AD-08 reports

System: S-01 pricing resolution · S-02 order creation · S-03 ITN webhook ·
S-04 email dispatch · S-05 PII retention · S-06 analytics · S-07 alerts ·
S-08 payment-state reconciliation

---

## C-01 · Browse & Search

- **Goal:** find a relevant product fast. **Trigger:** any storefront entry.
- **[KEEP]** home/PLP/category/deals/collection pages (evidence: `(shop)` routes).
- **[FIX]** remove decorative pagination; `notFound()` on unknown category slug;
  hide promo `code` until C-12 ships.
- **[NEW] Search:** `/search?q=` → Postgres `ilike` on name/brand/description
  (pg_trgm later); navbar icon opens input; zero-results state with category links.
- **Data touched:** products, categories, collections, deals, promotions.
- **Events:** `view_item_list`, `search`. **A11y:** labelled combobox, ESC closes.
- **Acceptance:** Given 438 products, when user searches "daikin 18000", then
  matching published parents render ranked; unknown slug routes 404.

## C-02 · PDP Configure — **[KEEP + FIX]**

- Variant attribute selectors → real variant URL (existing router.push behaviour).
- Add-ons: installation (server-derivable tier shown), kit, maintenance, warranty —
  display prices from DB; server re-resolves (KEEP).
- **[FIX]** remove fabricated ratings (show real or none).
- **[FIX]** enquiry-only products → CTA "Request quote" (enquiry channel, not
  Payfast).
- **Events:** `view_item`.

## C-03 · Cart — **[KEEP + FIX]**

- localStorage cart + drawer + qty/remove (KEEP).
- **[FIX]** `useCart` throws outside provider; storage-event cross-tab sync.
- **[NEW]** server cart record (optional): persist cart snapshot keyed by
  anonymous id for analytics + abandoned-cart trigger (S-09).
- **[FIX]** revalidate cart items (published + sold-out) on `/cart` mount with
  inline "no longer available" messaging instead of failing at checkout.

## C-04 · Checkout — **[KEEP core + FIX]**

- **Preconditions:** cart non-empty (validated server-side); ≥1 enabled provider.
- **Steps:** (1) contact — name/phone(+27)/email; (2) delivery — address/city/
  province/postal code **[NEW field]**; (3) **[NEW]** delivery method —
  "Standard delivery R0–RX by area / arrange at install" placeholder rule from
  `settings`; (4) payment method — enabled providers; (5) channel; (6) consent;
  (7) review + submit.
- **[FIX]** idempotency key per form mount; session-aware prefill +
  `orders.user_id` when logged in; R0-carts → enquiry flow only.
- **[NEW]** coupon field (C-12) inside summary.
- **Postconditions:** order+items+payment rows atomically (target: single RPC);
  owner+customer emails; analytics `purchase`/`generate_lead`.
- **Failure paths:** provider disabled, sold-out, unpublished, rate-limit,
  Turnstile, partial-write (compensation), DB outage → readable error, cart kept.
- **Acceptance:** Given a manipulated tier id on a 24k BTU unit, when submitted,
  server charges the 24k tier price (KEEP — `server-pricing.ts:212-216`).

## C-05 · Payment — **[KEEP EFT, FIX Payfast, NEW retry]**

- **EFT:** confirmation page shows bank details + order-number reference; admin
  marks paid in AD-04 → customer notified (S-04).
- **Payfast:** existing hardened ITN chain (KEEP) — enable only after sandbox
  E2E + env + passphrase verified.
- **[NEW]** retry: `failed|cancelled` orders get "Pay again" (recreate-cart or
  re-initiate against the same order); cart survives until payment resolves.
- **[FIX]** token expiry: 48h gate applies to banking details only; order summary
  stays viewable.
- **States:** pending → processing → paid | failed | cancelled → refunded |
  partially_refunded (admin-initiated, logged).
- **Acceptance:** Given cancelled Payfast payment, when customer clicks "Pay
  again" within 48h, a new gateway session reuses the same order (no duplicate).

## C-06 · Order status & history — **[NEW detail page]**

- `/account/orders` list (KEEP) minus dead buttons.
- **[NEW]** `/account/orders/[orderNumber]` — items, totals, payment status,
  fulfilment status timeline, invoice PDF (print view suffices initially).
- **Timeline statuses:** Enquiry→Confirmed→Paid→Scheduled→In progress→Completed
  (OrderHistory UI already supports — wire real states).
- **Acceptance:** View-Details renders real order detail; no dead CTAs.

## C-07 · Auth — **[KEEP]** login/signup/reset/verify/logout + safeNext.
**[NEW optional]** Google OAuth; **[NEW]** order claim: on first login, attach
guest orders matching verified email to `user_id`.

## C-08 · Profile & addresses — **[KEEP profile] [NEW address book]**
`addresses` table (user_id, label, line, city, province, postal) with RLS owner
policies; checkout offers saved addresses.

## C-09 · Warranty register/claim — **[NEW backend for existing UI]**
`warranty_registrations` + `warranty_claims` tables; existing 5-step form posts
to a server action; admin sees claims in AD-06; emails both parties.

## C-10 · Service booking — **[NEW backend for existing UI]**
`service_requests` (type: maintenance|repair|install, contact + address + date
preference + notes); same server-action + owner-email pipeline as orders.

## C-11 · Contact — **[NEW]** `/contact` page: settings-driven phone/email/
WhatsApp + form → `service_requests(type='general')`. Replace every placeholder
`wa.me/27000000000` & dead `/contact|faq|shipping|returns` link; fold real
shipping/returns copy into pages or `/help`.

## C-12 · Coupon — **[NEW]** `coupons(code, type, value, min_total, valid_from/to,
max_uses)`; `resolveOrderPricing` accepts `coupon_code`, validates server-side,
writes `discount_total_zar`; promotions.code hidden until then.

## C-13 · Newsletter — **[NEW]** `subscribers` table (email, source, ts, consent);
footer + deal-alert forms call server action → row + optional Resend audience.

## C-14 · Refund request — **[NEW]** customer-facing request on order detail
(reason, items) → `refund_requests` → admin processes offline (EFT) or via
Payfast dashboard → `payment_status` updated by AD-04.

## C-15 · Order tracking — **[NEW-lite]** manual fulfilment statuses
(`processing→scheduled→out_for_install→completed` + optional tracking note) set
in AD-04; surfaced on order detail — no carrier integration needed initially.

## AD-01–AD-08 · Admin surface — **[NEW — the biggest build]**

- Guard: session + `admins` membership checked server-side (layout + every action).
- **AD-02 dashboard:** pending-EFT count, orders today, new service requests,
  sold-out count.
- **AD-03/04 orders:** filterable list → detail (customer, items, payments,
  timeline, notes) → transitions: mark-paid (EFT), cancel, refund-full/partial,
  fulfilment status, internal note — each transition writes `order_events`
  audit row.
- **AD-05 catalogue:** products/variants/categories/deals CRUD (can lag AD-03).
- **AD-06 service requests:** triage queue → mark contacted/scheduled/closed.
- **AD-07 discounts:** promotions + coupons CRUD.
- **AD-08 reports:** orders by day/status/method, revenue totals (read-only SQL
  views are acceptable v1).

## S-01–S-08 · System flows — **[KEEP core + fixes]**

- **S-02 order creation → Postgres function `create_order(...)`** for atomic
  insert of the trio (replaces compensating delete).
- **S-04 email:** owner notified for **every** channel (whatsapp orders get an
  "action needed: contact via WhatsApp" owner mail); add paid/cancelled/
  fulfilment templates; move trigger to post-`payments` insert or a queue table
  with retry; rotate `ORDER_WEBHOOK_SECRET`.
- **S-06 analytics:** add `view_item`, `add_to_cart`, `begin_checkout`,
  `purchase` (with transaction_id) to the existing consent-gated gtag layer.
- **S-07 alerts:** Sentry/Axiom + alert on checkout error, ITN rejection, email
  failure, missing provider.
- **S-08 reconciliation:** daily cron flagging orders `pending` > N days and
  Payfast `processing` > 30min → owner email.
- **[NEW] S-09 abandoned cart:** if server cart persists, nightly job emails
  opt-in reminder (consent-gated).

## State machines (to-be)

**Order:** `submitted → confirmed → paid → scheduled → in_progress → completed`;
side-paths `cancelled`, `refunded|partially_refunded` (from paid only),
`payment_failed` (retryable). Keep `payment_status` as the financial machine and
let `status` become the **fulfilment** machine — stop conflating them.

**Cart:** add `converted` (order id) + `abandoned` (last_active>24h) server-side
when S-09 ships.

**Inventory (decision needed):** either real decrement-on-paid with backorder
flag, or formally documented "advisory stock" — pick one.

## Error-handling matrix → see 11. Notification matrix → see 12.
Traceability → see 13. Roadmap → see 14. Open questions → see 15.
