# 03 — As-Is PRD (post-2026-10-09 changes)

Reconstructed from the codebase **after** the enquiry-model refactor.

## Vision & target users

Aircons Store is a South African air-conditioner retailer's storefront. As of this change set it is an **enquiry/quote-driven ecommerce site**: customers assemble an order request, submit it, and the business confirms availability, delivery fees, and payment manually over email (the contractual channel; WhatsApp secondary). Target market: South Africa (ZAR, +27 phone normalization).

## Personas

- **Customer (guest-first):** browses, configures install/kits/warranty options, submits an order request without an account. Optionally has a Supabase Auth account showing order history.
- **Owner/operator:** manages everything through the Supabase dashboard (see `operations-runbook.md`). Confirms availability, quotes delivery, marks payments, manages products. No in-app admin UI by decision.
- **Support:** same person — responds via email/WhatsApp.
- **Owner (business):** same person again — one-person operation today.

## Current user flows

1. **Browse:** home → categories/collections/products → PDP with variant selectors (BTU/phase/model from `variant_attributes` JSONB), optional installation tier, kit config, maintenance plan, warranty.
2. **Cart:** `localStorage`-backed (`CartProvider`), client prices are display-only.
3. **Checkout:** server action `submitCheckout` → Zod validation → optional Upstash rate limit + Turnstile → `resolveOrderPricing()` re-resolves all prices/options server-side → `orders` + `order_items` + `payments` rows (service role, compensation deletes on partial failure) → redirect to `/order-confirmed/<uuid>?token=`.
4. **Confirmation:** token+UUID+expiry-validated page, rate-limited. For `manual_eft` pending orders it shows "confirming availability"; banking details appear only once the owner sets `status='confirmed'` in Supabase.
5. **Payment:** Manual EFT only — owner verifies in bank account, marks `payment_status='paid'`, `status='completed'` in the dashboard.
6. **Emails:** DB trigger → `order-email` edge function → Resend (`orders@aircons-store.co.za`) — owner alert + optional customer confirmation on INSERT. Post-payment receipt email is still missing (F-30).
7. **Accounts:** Supabase Auth signup/login/reset; `/account/orders` lists orders matched by email via RLS.

## Functional requirements (as implemented)

| Module | Behaviour |
|---|---|
| Catalog | products/categories/collections tables; parent→variant model (`is_parent_product`, `parent_product_id`, `variant_attributes`); ~438 published products |
| Cart | localStorage, quantity/add/remove, no cross-device persistence |
| Checkout | guest checkout, Zod-validated, idempotency key, honeypot + optional Turnstile, Upstash rate limit (x-real-ip), server-side pricing, `delivery_tier` (cape_town_free / quoted / quote_on_type) |
| Payments | `manual_eft` only — provider row gated by `payment_providers.is_enabled`; Payfast code + routes deleted |
| Orders | sequential inserts w/ compensation; status: submitted/confirmed/sent_whatsapp/email_sent/completed/cancelled; `delivery_tier` column |
| Delivery | no fee charged at checkout; Cape Town free, elsewhere quoted manually (enquiry-style) |
| Inventory | advisory only — `is_sold_out` shows "Available on request"; no decrement, no blocking |
| Emails | order-received (owner + customer) via edge fn + Resend; auth emails via Supabase Auth |
| Admin | none in-app — Supabase dashboard per `operations-runbook.md` |
| Analytics | GTM/gtag loader behind cookie consent; `generate_lead` conversion on confirmation page (fires for unpaid orders — known issue F-18) |

## Business rules in code

- Server-side pricing is authoritative; client prices never trusted.
- Installation tier derived from BTU server-side; client tier ID advisory.
- Free delivery = `delivery_city` matches `cape town` (case-insensitive). Everything else, or orders containing enquiry-only items, is quoted manually.
- Out-of-stock products remain orderable — availability confirmed manually before payment.
- Order token pages expire (`expires_at`) except pending EFT orders.
- No VAT — business is not VAT-registered; prices shown are final.

## Integrations

Supabase Postgres + Auth + Edge Functions, Resend (email), Cloudflare Turnstile (optional), Upstash Redis (optional), WhatsApp deep-link, GTM/GA4 (behind consent), Vercel hosting. **Removed:** Payfast.

## Data model

Unchanged except: `orders.delivery_tier` added; `orders.status` CHECK extended with `'confirmed'`; `deals` rows deactivated; `payment_providers.payfast` disabled (migration `20261009_enquiry_delivery_model.sql`).

## Known limitations

No admin UI (dashboard only, ~50 orders/week cap); no online payment provider; no stock enforcement; emails optional field at checkout (link-loss orphans the order); no post-payment receipt email; mock subscriptions/warranties account pages still exist; tests are re-implementations, not imports; no staging environment.

## Assumptions / unknowns

See `12a-blocked-questions.md` — order volume/AOV, prod env vars, prod FK behaviour, DNS/DKIM, package manager, legal review.
