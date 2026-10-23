# 06 — To-Be PRD (regenerated 2026-10-09)

## Vision

A reliable **enquiry-driven storefront** for a South African aircon retailer: customers submit order requests; the owner confirms availability, quotes delivery, and arranges EFT payment manually; email (from `aircons-store.co.za`) is the contractual channel. Online card payment is deferred until a provider decision is made.

## Goals & success metrics

- Zero unactionable order requests (every submitted order is confirmed or cancelled within 1 business day).
- No forged/spam orders (hardening migration + rate limiting verified).
- Owner can run all ops in the Supabase dashboard per runbook without Devin assistance.
- Accurate analytics funnel (view_item → add_to_cart → begin_checkout → order_request; purchase only when payment marked).

## Scope

**In:** catalog, cart, enquiry checkout, manual payment confirmation, order confirmation page, transactional email, dashboard ops, domain/SEO hygiene.
**Out:** online payments (deferred), admin web panel (deferred — dashboard only), real reviews (deferred until licensed source), VAT invoicing (N/A — not registered), accounts for plans/warranties (deferred), delivery rate engine (quoted manually).

## Key requirements (delta vs original FR set)

### FR-PAY-01 — Manual payment only — REMOVED (Payfast) / RETAINED (manual EFT)
Payfast code/config/webhooks/UI deleted. `payment_providers` still gates methods; only `manual_eft` enabled. Payment is arranged by email after availability confirmation. **Payment-provider decision required before online payments return** (roadmap).

### FR-CHK-01 — Delivery tiers — IMPLEMENTED
- `cape_town_free`: `delivery_city` ≈ "Cape Town" → free.
- `quoted`: anywhere else → fee confirmed manually before payment.
- `quote_on_type`: any line item `is_enquiry_only` → fee depends on item type/size → manual quote.
No flat rates hardcoded. Stored on `orders.delivery_tier` (migration 20261009); confirmation page + owner email show the tier.

### FR-CHK-02 — Tax — REMOVED
Not VAT-registered. No tax lines, no tax invoices. Prices displayed are final.

### FR-INV-01 — Enquiry inventory — IMPLEMENTED
No hard stock enforcement. `is_sold_out` renders "Available on request"; items stay orderable; server no longer rejects sold-out items; availability is confirmed manually per order before payment details are shown.

### FR-ORD-01 — Confirmation-before-payment — IMPLEMENTED
Banking details on `/order-confirmed/[token]` render only when `orders.status = 'confirmed'` (owner sets after availability check) or order is paid. Pending orders see "we're confirming availability" copy.

### FR-REV-01 — Reviews — REMOVED
All fabricated ratings, star displays, counts, testimonial sections, and review schema removed site-wide. Any future reviews must come from a real licensed source (e.g. Trustpilot widget / verified purchase reviews).

### FR-DL-01 — Deals — REMOVED
`/deals` route + components + filter + nav/footer links deleted; `301 /deals → /` in `next.config.ts`; sitemap cleaned; `deals` rows deactivated in DB.

### FR-OPS-01 — Dashboard ops runbook — NEW
`audit/operations-runbook.md` is the system of record for order/payment/product ops. Scale cap ~50 orders/week → admin panel is a P1 roadmap item, not built now.

### FR-EML-01 — Email channel — RETAINED
Contractual channel = email from `aircons-store.co.za` (Resend). `RESEND_FROM`/`OWNER_EMAIL` verified for the hyphenated domain; DKIM/SPF/DMARC check pending (Q-17). Add post-payment receipt email (F-30) and availability-confirmed email trigger on `status→confirmed`.

## Still-open requirements (unchanged from first pass)

Admin panel (P1 later), order lifecycle states beyond confirmed (scheduled/delivered), refund workflow, guest order lookup, real analytics funnel, staging env, monitoring/alerting, legal review, real review source.

## Analytics events (target)

`view_item`, `add_to_cart`, `begin_checkout`, `order_request_submitted` (replaces unpaid `generate_lead`), `purchase` (fire only on `payment_status='paid'`), `contact_whatsapp_click`, `newsletter_signup`.

## Release criteria for this change set

- [x] Build + tests pass; no `/deals`, `/api/payfast` routes
- [ ] Migration `20260925_audit_hardening.sql` applied in prod (P0)
- [ ] Migration `20261009_enquiry_delivery_model.sql` applied in prod (P0)
- [ ] `ORDER_WEBHOOK_SECRET` rotated (P0)
- [ ] Resend domain `aircons-store.co.za` verified + DNS records
- [ ] One end-to-end test order: submit → owner confirms → banking details appear → owner marks paid
