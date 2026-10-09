# 06 — To-Be PRD

## Vision

Aircons Store is the simplest way for a South African customer to buy an
air conditioner end-to-end online: choose a unit, see the real all-in price
(unit + installation + kit + delivery + optional plans), pay online or by EFT,
and track the order from payment to installation — while the owner runs the
entire operation from an admin panel, not a database console.

## Goals and success metrics

| Goal | Metric | Baseline | Target |
|---|---|---|---|
| Reduce ops toil | Minutes of manual DB work per order | 100% manual | <2 min (button clicks) |
| Increase paid conversion | % orders reaching `payment_status=paid` | UNKNOWN | +20% after Payfast + delivery pricing |
| Compliance | VAT invoice per paid order; zero fabricated claims | none | 100% |
| Visibility | Funnel events view→cart→checkout→paid | generate_lead only | full funnel |
| Reliability | checkout success rate, error alerting | unmeasured | >99%, alerted |

## Personas

- **Guest shopper** (primary) — buys without an account.
- **Registered customer** — order history, saved details, POPIA self-service.
- **Owner/admin** — confirms EFT payments, manages orders/products/prices, sees reports.
- **Installer/support** *(phase 2)* — sees schedule + install notes.

## Scope

**In scope (v2):** admin order panel, order lifecycle, delivery pricing, VAT invoices,
real ratings policy (remove fakes), post-payment emails, Payfast go-live,
promo codes, search, inventory policy, monitoring, POPIA self-service,
removal of mock account data.

**Out of scope:** marketplace/sellers, subscriptions billing, multi-currency,
native apps, loyalty program, trade accounts (B2B quoting stays manual via
enquiry products).

---

## Functional requirements

### FR-ORD-01 — Order lifecycle (Must)
**User story:** As the owner, I want orders to move through a defined lifecycle so that customers and staff always know where an order stands.
**Business rules:**
- `status`: `received → confirmed → scheduled → dispatched → installed/completed` and `cancelled` (terminal), `refunded` (terminal).
- `payment_status` stays the money machine; `status` becomes the fulfilment machine. Stop writing `status='completed'` on ITN — use `confirmed`.
- Every transition stores `at` timestamp + `by` (system|admin|webhook) in `order_events`.
**Acceptance criteria:**
- Given a paid order, when ITN confirms, then status=confirmed and an `order_events` row exists.
- Given an admin, when they move an order to `scheduled` with an install date, then the customer's token page and account history show it.
- Given a terminal order, when another transition is attempted, then it's rejected.
**Edge cases:** ITN arrives after admin already confirmed (idempotent); cancel after paid → requires refund step first.
**Analytics:** `order_status_changed` event.
**Test:** unit-test state machine transitions incl. illegal ones.

### FR-ORD-02 — Admin order panel (Must)
**User story:** As the owner, I want a web UI to see orders and confirm EFT payments so that I never touch the database.
**Description:** `/admin` route group, gated by `admins` table membership (RLS already exists). List (filter by status/payment/date, search by number/name/phone), detail view, actions: mark paid, advance status, cancel, add note, resend confirmation email.
**Acceptance criteria:**
- Given a non-admin authenticated user, when they visit /admin, then 403/redirect.
- Given an EFT order, when admin clicks "mark paid", then payment_status=paid, payments row updated, `order_events` recorded, customer notified.
- Given mark-paid on an already-paid order, then action is a no-op.
**Edge cases:** concurrent admin edits (optimistic or last-write-wins + event log); orders >48h expired token — admin resend regenerates access.
**Security:** session auth + admin check server-side on every action; never client-trusted.

### FR-PAY-01 — Payfast go-live (Must)
**User story:** As a customer, I want to pay by card/instant EFT so that my order is confirmed immediately.
**Acceptance criteria:**
- Given Payfast enabled + sandbox creds, when I complete a sandbox payment, then ITN arrives, signature+server-validation pass, order → paid/confirmed.
- Given a forged ITN, then it's rejected and logged.
- Given return after payment, then confirmation page shows "Payment Confirmed" and customer receives a receipt email.
**Dependencies:** prod PAYFAST_* envs + passphrase, FR-ORD-01, sandbox test checklist.

### FR-CHK-01 — Delivery pricing (Must)
**User story:** As a customer, I want to see the delivery cost before submitting so that there are no surprises.
**Business rules:** server-resolved `delivery_zones` (province or postcode band → fee); free-delivery threshold optional; "installation included" logic must not double-charge.
**Acceptance criteria:**
- Given a Gauteng address, when I check out, then the zone fee appears as a line item and is in `total_zar`.
- Given an unmatched area, then checkout shows "delivery quoted separately" and order flags `delivery_pending_quote`.
**Edge cases:** mixed install/no-install carts; remote areas.
**Dependencies:** owner's zone/fee matrix (Q-05).

### FR-CHK-02 — VAT & invoice (Must)
**User story:** As a business customer, I want a VAT-compliant invoice so that I can claim input tax.
**Acceptance criteria:**
- Given VAT registration confirmed, then totals display incl. VAT with the VAT amount shown, and a PDF invoice is generated per paid order (invoice number, VAT number, seller details).
- Given the vendor is not VAT-registered, then prices show "no VAT" and a tax-invoice field is absent.
**Dependencies:** Q-04 registration status, invoice numbering sequence.

### FR-ORD-03 — Post-payment emails (Must)
**User story:** As a customer, I want an email when my payment is confirmed so that I have a receipt.
**Description:** Extend `order-email` edge fn to fire on `payments`/`orders` UPDATE to paid (or call from admin action + ITN). Attach/inline invoice summary.
**Edge cases:** EFT marked paid days later; duplicate triggers deduped by order+status.

### FR-CAT-01 — Search (Should)
**User story:** As a shopper, I want to search by brand/model/BTU so that I can find a specific unit fast.
**Acceptance criteria:** Given "samsung 12000", when I search, then matching parent products + variants rank correctly; zero-results page offers category links.

### FR-INV-01 — Inventory policy (Should)
**User story:** As the owner, I want stock to decrement on confirmed orders so that the site can't oversell.
**Business rules:** Decide: (a) hard enforcement — atomic `create_order` RPC decrements `stock_count`, rejects at 0; or (b) enquiry model — remove stock UI entirely. Recommended: (a) for boxed units, (b) semantics for enquiry-only products.
**Acceptance criteria:** Given stock=2, when two orders each buy qty 2, then the second is rejected with a clear message.

### FR-MKT-01 — Promo codes (Should)
**User story:** As the owner, I want promo codes from the `promotions` table to discount orders so that campaigns work.
**Rules:** code → %/fixed discount; expiry + active flags already exist; server-side validation only; single-use optional.
**Edge cases:** expired code, stacking (decide: never stack), enquiry-only items excluded.

### FR-REV-01 — Honest ratings (Must)
**User story:** As a customer, I want reviews to be real so that I can trust the store.
**Rules:** Remove `getPlaceholderRating` rendering. Either hide rating UI or integrate a review source (Trustpilot widget exists in `/public/trustpilot` assets — verify legitimacy).
**Acceptance criteria:** Given a product with no real reviews, when PDP renders, then no star rating/review count is shown.

### FR-ACC-01 — Real account data (Must)
Remove mock arrays from `/account/subscriptions` and `/account/warranties`; either derive from `order_items` (warranty_option_id/maintenance_plan_id rows) or remove nav entries until the feature exists.

### FR-ACC-02 — POPIA self-service (Should)
Export (JSON/CSV of orders+profile) and account deletion request; PII retention cron extended to all terminal order states.

### FR-MKT-02 — Working newsletter (Could)
Persist signups (`newsletter_subscribers` or Resend audience) with consent flag; confirmation email; POPIA unsubscribe.

### FR-CAT-02 — SEO hygiene (Could)
Canonical variants→parent; categories/collections in sitemap; OG image asset verified.

### FR-MON-01 — Observability (Must)
Error tracking (Sentry or equivalent) on server actions + API routes; uptime check on `/`; daily reconciliation query (orders created vs emails sent vs payments) surfaced to owner.

---

## Non-functional requirements

See `08-non-functional-requirements.md` for the full list. Headlines:
- Prices/weights/dates server-resolved; ZAR integer (or migrate to cents — decision G-18).
- All admin mutations logged (`order_events`, `admin_audit_log`).
- p95 page load <2.5s on 4G for PDP; checkout action p95 <4s.
- WCAG 2.1 AA for checkout + nav critical paths.
- Secrets rotation policy; no secrets in migrations ever again.

## Release criteria

- G-01/G-02/G-03/G-04 shipped together (ops correctness bundle).
- `pnpm test` ≥ current coverage + new tests import real functions.
- Playwright smoke suite green on staging.
- Security checklist re-run; `supabase db advisors` clean.
- Owner sign-off on 3 real E2E orders (EFT, Payfast, cancel).

## Open questions

See `12-open-questions.md` — VAT registration, delivery fee matrix, review policy, deal-pricing policy, inventory model, Payfast credentials, production env verification, marketing email provider.
