# E-commerce Checkout Hardening — Engineering Report

## Overview

Comprehensive audit and hardening of the Aircons Store e-commerce checkout flow, from product selection through order confirmation. The system now supports guest checkout without login, server-side pricing validation, Payfast payment integration with ITN webhooks, manual EFT flow, and atomic order creation.

---

## Architecture

### Data Flow

```
Product Page → Cart (localStorage) → Checkout Form → Server Action
  → Validate input (Zod)
  → Rate limit check (Upstash Redis)
  → Turnstile CAPTCHA verification
  → Idempotency key check (DB unique index)
  → Validate payment provider (DB)
  → Resolve all prices server-side (Supabase)
  → Create order + order_items + payment (atomic)
  → Redirect: Payfast gateway OR order confirmation page
  → Payfast ITN webhook → Update payment status
  → Order confirmation page (secure token verified)
```

### Payment Flows

1. **Payfast**: Order created → redirect to Payfast → customer pays → ITN webhook updates status → confirmation page shows paid status
2. **Manual EFT**: Order created → confirmation page shows banking details → customer does EFT → admin confirms payment → status updated

---

## Database Schema

### Migration: `20260812_checkout_payment_hardening.sql`

- **`installation_tiers`** — Replaces hardcoded `INSTALLATION_TIERS` constant. BTU ranges with prices.
- **`payment_providers`** — Replaces hardcoded payment methods. `code`, `name`, `is_enabled`, `sort_order`.
- **`orders`** (extended) — Added `order_number`, `secure_token`, `payment_method`, `payment_status`, `paid_at`, `provider_transaction_id`, delivery address fields, `idempotency_key`, detailed pricing totals (`subtotal_zar`, `installation_total_zar`, `kit_total_zar`, `maintenance_total_zar`, `warranty_total_zar`).
- **`order_items`** — Normalized line items with per-item pricing breakdown (installation, kit, maintenance, warranty).
- **`payments`** — Payment records linked to orders with provider code, status, provider transaction ID, provider response JSON.
- **`settings`** (extended) — Banking details fields for manual EFT.
- **RLS** — Public read on `payment_providers` and `installation_tiers`. Orders/payments are service-role only (no public access).
- **`generate_order_number()`** — Sequence-based order number generation (`AIR-YYYY-NNNNNN`).

### Migration: `20260812_security_hardening.sql`

- Unique partial index on `orders.idempotency_key` (DB-level idempotency guarantee).
- Auto-trigger to set `order_number` on insert if not provided.
- `updated_at` trigger for `payments`.
- `validate_payfast_ip()` function for ITN source IP validation.

---

## Server-Side Pricing Engine

### `src/lib/server-pricing.ts`

Resolves all prices from Supabase on the server:
- Product base price (from `products` table)
- Installation tier price (from `installation_tiers` table, matched by BTU range)
- Installation kit price (from `installation_pricing_rules`, resolved via `resolveInstallationPrice`)
- Maintenance plan price (from `maintenance_plans` + `maintenance_pricing_rules`)
- Warranty price (from `warranty_options` + `warranty_pricing_rules`, resolved via `resolveWarrantyPrice`)

Returns a detailed breakdown per item and order-level totals. The checkout server action uses this to compute the authoritative total — client-sent prices are never trusted.

---

## Payment Provider Abstraction

### `src/lib/payment/provider.ts`
- `PaymentProvider` interface with `createPayment()` and `verifyWebhook()`
- Provider registry with `registerProvider()` / `getProvider()`
- `getEnabledProviders()` fetches from `payment_providers` table

### `src/lib/payment/payfast.ts`
- MD5 signature generation (server-side only)
- Creates Payfast redirect URL with all required params
- Verifies ITN: signature, merchant ID, amount, payment status mapping

### `src/lib/payment/manual-eft.ts`
- No gateway redirect — returns confirmation page URL
- No webhook — admin confirms payment manually

---

## API Routes

### `src/app/api/payfast/redirect/route.ts` (GET)
- Validates order ID + secure token
- Fetches order, verifies token
- Creates Payfast payment URL via provider
- Updates order/payment status to `processing`
- Redirects to Payfast

### `src/app/api/payfast/itn/route.ts` (POST)
- Validates source IP against known Payfast IPs
- Parses form data, verifies signature via provider
- Validates amount matches order total
- Idempotent: ignores duplicate ITN for already-paid orders
- Updates order + payment status (paid/failed/cancelled)

---

## Checkout Server Action

### `src/app/(shop)/checkout/actions.ts`

- **Input validation**: Zod schema with name, phone, email, address, payment method, items
- **Rate limiting**: Upstash Redis (5 submissions per 10 minutes per IP)
- **CAPTCHA**: Cloudflare Turnstile server-side verification
- **Honeypot**: `website` field — rejects if filled
- **Idempotency**: Checks `idempotency_key` in DB before creating order
- **Payment provider validation**: Verifies selected provider is enabled in DB
- **Pricing**: Calls `resolvePricing()` to get server-side prices — never trusts client prices
- **Atomic order creation**: Inserts order, order_items, and payment record
- **WhatsApp**: Generates notification URL if channel includes WhatsApp
- **Payfast redirect**: Generates redirect URL if payment method is Payfast
- **Secure token**: Generates UUID for order confirmation page access

---

## Cart Item Structure

### `src/components/shop/CartProvider.tsx`

Extended `CartItem` interface with:
- `has_installation`, `installation_tier_id`
- `kit_configuration` (full kit config breakdown)
- `maintenance_plan_id`
- `warranty_option_id`
- `installation_price_zar`, `kit_price_zar`, `maintenance_price_zar`, `warranty_price_zar`

These fields allow the server to re-resolve pricing from Supabase at checkout time.

---

## Order Confirmation Page

### `src/app/order-confirmed/[token]/page.tsx`

- Validates UUID format for order token
- Rate limits lookups (20 per 10 minutes per IP)
- Verifies `secure_token` query param matches order's token
- Displays payment status badge (pending/processing/paid/failed/cancelled)
- Shows Payfast "Pay now" button for pending Payfast orders
- Shows banking details for pending Manual EFT orders
- Displays full price breakdown (subtotal, installation, kit, maintenance, warranty)
- Shows delivery address and installation notes

---

## Checkout UI

### `src/app/(shop)/checkout/CheckoutClient.tsx`

- **Contact fields**: First name, last name, email, phone
- **Delivery fields**: Address, city, province (SA provinces dropdown), installation notes
- **Payment selection**: Radio buttons populated from `payment_providers` table (via server action)
- **Order summary**: Item list with per-line details, price breakdown (subtotal, installation, kit, maintenance, warranty, total)
- **Idempotency key**: Generated client-side, sent with submission
- **Payfast redirect**: If Payfast selected, redirects to gateway after order creation
- **Manual EFT**: Redirects to confirmation page with banking details

---

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Server-side pricing | All prices resolved from Supabase, client prices ignored |
| Secure token | UUID generated per order, verified on confirmation page |
| Idempotency | Client key + DB unique partial index |
| Rate limiting | Upstash Redis — checkout: 5/10min, order lookup: 20/10min |
| CAPTCHA | Cloudflare Turnstile, server-side verified |
| Honeypot | Hidden `website` field |
| Payment provider validation | DB check that provider is enabled |
| ITN source IP validation | Known Payfast IPs only |
| ITN signature verification | MD5 signature with passphrase |
| ITN amount validation | Matches order total exactly |
| ITN idempotency | Duplicate for paid orders ignored |
| RLS | Orders/payments service-role only, no public access |
| Service role key | Never exposed to client — server-only module |
| Guest checkout | No anonymous Auth user creation |

---

## Hardcoded Data Removed

| Before | After |
|--------|-------|
| `PROTECTION_PLAN_PRICE = 1690` | Removed (was dead code, warranty pricing already from DB) |
| `INSTALLATION_TIERS` array | Fallback defaults only; server resolves from `installation_tiers` table |
| `paymentMethods` array in `payment-methods.ts` | Fetched from `payment_providers` table |
| `PaymentOptions` on product page | Removed — payment selection belongs at checkout |
| `PaymentOptions` in cart drawer | Removed |
| `PaymentOptions` in cart page | Removed |

---

## Files Created

- `supabase/migrations/20260812_checkout_payment_hardening.sql`
- `supabase/migrations/20260812_security_hardening.sql`
- `src/lib/server-pricing.ts`
- `src/lib/payment/provider.ts`
- `src/lib/payment/payfast.ts`
- `src/lib/payment/manual-eft.ts`
- `src/app/api/payfast/redirect/route.ts`
- `src/app/api/payfast/itn/route.ts`
- `src/app/(shop)/checkout/providers-action.ts`
- `src/types/payment.ts`
- `src/lib/__tests__/payment-security.test.ts`
- `vitest.config.ts`

## Files Modified

- `src/components/shop/CartProvider.tsx` — Extended `CartItem` interface
- `src/app/(shop)/products/[slug]/ProductDetailClient.tsx` — Config breakdown in `addItem`, removed `PROTECTION_PLAN_PRICE`, removed `PaymentOptions`
- `src/app/(shop)/checkout/actions.ts` — Full rewrite with server-side pricing, atomic order creation
- `src/app/(shop)/checkout/CheckoutClient.tsx` — Address fields, payment selection, order breakdown
- `src/app/order-confirmed/[token]/page.tsx` — Secure token, payment status, EFT details, Payfast redirect
- `src/lib/payment-methods.ts` — DB-driven instead of hardcoded
- `src/components/shop/PaymentOptions.tsx` — Accepts methods as props
- `src/components/shop/CartDrawer.tsx` — Removed PaymentOptions
- `src/app/(shop)/cart/page.tsx` — Removed PaymentOptions, cleaned imports
- `package.json` — Added vitest, test scripts

---

## Tests

### `src/lib/__tests__/payment-security.test.ts`

- Payfast signature generation: consistency, passphrase variation, field exclusion, empty params
- Phone normalization: +27, 0N, 27N formats, special characters, invalid rejection
- Order number format: padding, year prefix

**Run tests**: `npm install && npm test`

---

## Environment Variables Required

```
# Existing
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# New — Payfast
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_MODE=sandbox  # or "live"
```

---

## Remaining Work / Recommendations

1. **Run migrations**: Apply both SQL migrations to Supabase before deploying.
2. **Seed payment_providers**: Insert rows for `payfast` and `manual_eft` with `is_enabled = true`.
3. **Seed installation_tiers**: Insert BTU ranges and prices matching your business data.
4. **Seed banking details**: Set `bank_name`, `bank_account_name`, `bank_account_number`, `bank_branch_code` in `settings`.
5. **Install vitest**: Run `npm install` to install the test runner.
6. **Payfast sandbox testing**: Test with Payfast sandbox before going live. Set `PAYFAST_MODE=sandbox`.
7. **ITN endpoint**: Ensure `https://yourdomain.com/api/payfast/itn` is accessible by Payfast (no auth required).
8. **Admin payment confirmation**: Build an admin interface to mark Manual EFT payments as paid (currently only ITN can update status automatically).
9. **Order expiry**: The `expires_at` field on orders is still used by the confirmation page. Consider whether expired orders should still be viewable.
10. **WhatsApp notification**: The `markWhatsAppSent` action should be updated to work with the new order schema.
