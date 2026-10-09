# 01 — Payment System Audit

All findings evidence-backed. `REQUIRES VERIFICATION` = needs live DB / dashboard access.

## 1. What exists

### 1.1 Provider abstraction

A provider registry pattern is implemented and is genuinely good:

- `src/lib/payment/types.ts` — `PaymentProvider` interface: `code`, `name`,
  `createPayment()`, `verifyWebhook()`.
- `src/lib/payment/registry.ts` — `registerProvider()` / `getProvider()`. Kept in a
  separate module to avoid a circular-import TDZ (documented in file header, lines 1–9).
- `src/lib/payment/provider.ts` — side-effect imports of `payfast.ts` + `manual-eft.ts`;
  `getEnabledProviders()` reads `payment_providers` table (enabled, sort_order).
- `src/lib/payment/payfast.ts` — full Payfast integration (194 lines).
- `src/lib/payment/manual-eft.ts` — redirect-to-confirmation only (37 lines).

Adding a new gateway = new file + `registerProvider()` + a DB row — no checkout changes
needed for the *initiation* path. However, checkout's `paymentMethod` zod enum is hardcoded
to `["payfast", "manual_eft"]` (`actions.ts:48`) and the payfast redirect URL is hardcoded
(`actions.ts:414-416`), so a third provider still needs code changes. **Partially
config-driven.**

### 1.2 Checkout → payment flow

`src/app/(shop)/checkout/actions.ts` → `submitCheckout()`:

1. Zod validation (name, phone, address, consent, honeypot `website` max(0)).
2. Phone normalisation to `+27…` (throws on non-SA numbers — **hard-coded to South Africa**).
3. Optional IP rate limit (5 per 10 min) via Upstash REST — **skips silently if env unset**
   (`actions.ts:150-177`).
4. Optional Turnstile verify — **skips if `TURNSTILE_SECRET_KEY` unset** (`:133-148`).
5. Idempotency: if `idempotencyKey` matches an existing order, returns it (`:220-240`).
6. Provider must exist AND be `is_enabled` in `payment_providers` (`:243-251`).
7. **Server-side pricing** via `resolveOrderPricing()` — client prices never trusted
   (`src/lib/server-pricing.ts` — re-fetches products, installation tiers, kit, warranty,
   maintenance from DB; rejects sold-out/unpublished items).
8. Order number via `generate_order_number()` DB sequence → `AIR-YYYY-NNNNNN`.
9. Inserts `orders` + `order_items` + `payments` (status `pending`) with compensating
   delete on partial failure (`:353-380`). Not a transaction — compensating deletes are
   best-effort.
10. Builds WhatsApp deep link (order summary to business) when channel ≠ email.
11. Payfast orders get `paymentRedirectUrl = /api/payfast/redirect?order=…&token=…`.

### 1.3 Payfast integration (`src/lib/payment/payfast.ts`)

- Hosted-page **redirect** model — card data never touches this app's servers. SAQ-A scope.
- Signature: MD5 of sorted params + optional passphrase (`generateSignature`, `:31-49`).
  MD5 is Payfast's specified algorithm — not a choice the app can change.
- `createPayment` builds GET redirect with `m_payment_id = order_number`,
  `custom_str1 = orderId`, `custom_str2 = secureToken`, `notify_url = /api/payfast/itn`.
- `verifyWebhook` does THREE checks: signature match → **server-to-server POST back to
  Payfast `/eng/query/validate` (authoritative, unforgeable)** → merchant_id match
  (`:126-189`). Warns loudly if passphrase unset (`:139-144`).
- `PAYFAST_MODE` env switches sandbox/live URLs.

### 1.4 ITN webhook (`src/app/api/payfast/itn/route.ts`)

- IP allowlist: `41.74.179.228-231`; `x-real-ip` else rightmost XFF hop; fail-closed on
  unknown IP (`:15-41`). Localhost only allowed when `NODE_ENV !== 'production'`.
- Verifies via provider (above), then:
  - Fetches order by `m_payment_id` → order_number.
  - **Exact amount match** in cents: `Math.round(amount*100)` vs `Math.round(total_zar*100)`
    (`:86-91`).
  - Idempotency: early-returns if `payment_status === 'paid'` (`:94-97`).
  - Maps COMPLETE→paid (+ `paid_at`, `provider_transaction_id`, **`status='completed'`**),
    FAILED→failed, CANCELLED→cancelled. Updates `payments` row too.
- Returns 200 `{status:'ok'}` on success; 4xx/5xx otherwise (Payfast retries on non-200).

### 1.5 Manual EFT

- No gateway call. Order created `payment_status='pending'`; confirmation page shows bank
  details from `settings` (`bank_name`, `bank_account_name`, `bank_account_number`,
  `bank_branch_code`, `bank_reference_prefix`) plus order number as reference
  (`order-confirmed/[token]/page.tsx:134-149, 211-250`).
- The 48h `expires_at` gate is **exempted for pending manual EFT** so customers can still
  see banking details (`page.tsx:128-131`).
- Confirmation path: **an admin must manually update the row** — there is no code path,
  admin UI, webhook, or server action that sets `payment_status='paid'` for `manual_eft`.
  `verifyWebhook` for manual_eft always returns `valid:false` (`manual-eft.ts:24-34`).

### 1.6 Data model (payments)

`payments` table (`20260812_checkout_payment_hardening.sql:131-148`):
`id, order_id→orders, provider_code, provider_transaction_id, amount_zar (int ≥0),
status ∈ {pending,processing,paid,failed,cancelled,refunded}, payment_reference,
provider_response JSONB, created_at, updated_at` + trigger `set_payments_updated_at`.
Indexes on order_id, provider_transaction_id (partial), payment_reference (partial), status.
RLS enabled; SELECT for admin members only. No INSERT/UPDATE policies — all writes are
service-role.

`orders.payment_status ∈ {pending, processing, paid, failed, cancelled, refunded,
partially_refunded}` (hardening migration :75-76). `orders.status ∈ {submitted,
sent_whatsapp, email_sent, completed, cancelled}`.

## 2. Findings

| ID | Sev | Finding | Evidence |
|---|---|---|---|
| PAY-01 | Critical | Payment completion marks the whole order `completed` — payment and fulfilment are the same state. A paid-but-undelivered order shows "completed" to the customer on /account/orders. | `itn/route.ts:108`; `account/orders/page.tsx:36-41` |
| PAY-02 | High | **No admin path to confirm manual EFT.** The only `payment_status='paid'` write in the entire codebase is the Payfast ITN handler. EFT payment confirmation = direct DB edit. | grep `payment_status.*paid` → only `itn/route.ts:105` |
| PAY-03 | High | **No refund implementation.** `refunded`/`partially_refunded` enum values exist but zero code paths write them; no refund table, action, webhook, or admin UI. Terms page promises refunds (50% deposit rules, prorated maintenance). | `terms/page.tsx:63,69`; grep `refund` → only display strings |
| PAY-04 | High | **Missed-ITN = permanently stuck order.** No reconciliation job, no status polling, no payment-status query endpoint. A lost ITN leaves order `processing` forever; page says "being processed… please wait" indefinitely. | `itn/route.ts` is the only status writer; `page.tsx:199-201` |
| PAY-05 | High | **Idempotency key regenerated per submit click.** `handleSubmit` creates a fresh `Date.now()-random` key on every invocation, so the DB unique index only dedupes network-level retries of the *same* action call — not double-clicks or user retries. Two clicks → two orders → (with Payfast) potentially two payments. | `CheckoutClient.tsx:99` |
| PAY-06 | High | **No append-only payment event log.** `payments.provider_response` is overwritten per ITN; no history of status transitions, no audit trail of who/what changed a payment. | `payments` table DDL; `itn/route.ts:118-131` |
| PAY-07 | Medium | **No unique constraint on `payments.provider_transaction_id`.** Concurrent duplicate ITNs both pass the `paid` check and double-write (benign today — same values — but unsafe once refunds/fulfilment triggers hang off it). | `itn/route.ts:94-110`; payments DDL has only a non-unique index |
| PAY-08 | Medium | **Checkout rate limit is spoofable.** Uses *first* `x-forwarded-for` hop — client-controlled. Attacker bypasses by rotating XFF, or DoSes a victim IP. ITN route correctly uses `x-real-ip`/last hop — inconsistent. | `actions.ts:156` vs `itn/route.ts:15-22` |
| PAY-09 | Medium | **Turnstile + rate-limit fail open.** If `TURNSTILE_SECRET_KEY`/`UPSTASH_*` unset, both checks silently skip. On a fresh deploy with no env config, checkout is unthrottled and unchallenged. | `actions.ts:134-135, 153` |
| PAY-10 | Medium | **Manual EFT has no proof-of-payment upload, no auto-matching, no expiry/release of unpaid orders.** `expires_at=48h` only gates the confirmation page, not the order itself; unpaid EFT orders sit `pending` indefinitely with stock/customer expectation attached. | `page.tsx:128-131`; no PoP storage bucket/table |
| PAY-11 | Medium | **Payfast `return_url` carries `secure_token` in a URL** — leaks via browser history/referrer to Payfast-hosted page. Token is a bearer credential for order PII. Referrer-Policy `no-referrer` is only set on `/order-confirmed/*` responses — the token is already in Payfast's logs/URL by then. | `payfast.ts:95-96`; `middleware.ts` |
| PAY-12 | Low | **`payment_status='processing'` set on every redirect hit** — replaying the redirect URL after an ITN-driven `failed` flips status back to `processing`. Minor status thrash. | `redirect/route.ts:67-77` |
| PAY-13 | Low | **`custom_str2` (secure_token) sent to Payfast but never verified on ITN return** — the check relies on m_payment_id + amount. Server-to-server validation makes this low-risk. | `payfast.ts:107`; `itn/route.ts` |
| PAY-14 | Low | **Integer-rand money model** — `total_zar`/`amount_zar` are integer RAND, formatted `.toFixed(2)` for Payfast. Any future cent pricing breaks rounding assumptions silently. | schema `:27,136`; `payfast.ts:103` |
| PAY-15 | Low | **No `PAYFAST_MODE` sanity check** — `mode` env can be `live` with sandbox creds (or vice versa); fails at gateway, not at boot. | `payfast.ts:18,22-27` |
| PAY-16 | Low | **Generic error passthrough** — `submitCheckout` returns raw `error.message` to the client; DB/constraint messages could leak internals. | `actions.ts:444` |
| PAY-17 | Low | **`payment_providers.configuration` JSONB is never read** — provider config is env-only; the column implies config-driven routing that doesn't exist. | `provider.ts:26-30` |
| PAY-18 | Info | **No transaction limits found** — no hardcoded caps; practical limits are Payfast merchant account + bank EFT limits. Meets "no limits" requirement; document to customer anyway. | grep for caps → none |
| PAY-19 | Info | **Payment method enum is hardcoded** in zod schema; adding a provider requires a code change despite the registry abstraction. | `actions.ts:48` |

## 3. Requirement checklist

| Requirement | Status | Evidence |
|---|---|---|
| Instant EFT (Ozow/Payfast EFT) | Partial — Payfast supports Instant EFT rails but provider disabled | `payment_providers` seed `:53` |
| Manual EFT | YES — banking details on confirmation page | `page.tsx:211-250` |
| PoP upload | MISSING — not implemented | — |
| EFT reconciliation | MISSING — manual DB edits only | — |
| Card (hosted) | Implemented, disabled, never live-tested | `payfast.ts` |
| Tokenization / 3DS | N/A — fully hosted redirect; Payfast owns it | — |
| Card storage | NONE (correct) | — |
| Optional/deferred payment | Partial — manual EFT is de facto deferred; no model, no expiry, no collection enforcement | — |
| Pay on delivery / on-site | MISSING — not implemented | — |
| No-limit | YES (no code caps) | — |
| Gateway orchestration/failover | Registry exists; no failover, no routing | `registry.ts` |
| Refunds / partial refunds | MISSING | — |
| Disputes/chargebacks | MISSING | — |
| Webhook idempotency | Partial — `paid` early-return; no event store, no txn-id uniqueness | `itn/route.ts:94` |
| Reconciliation | MISSING | — |
| Retry UX | Partial — `pending` shows Pay button; `failed`/`cancelled` show text only, no retry CTA (though `/api/payfast/redirect` would still work) | `page.tsx:202-207` |
| Payment notifications | Order email on INSERT only; **no paid/failed/refund emails** | `order-email` trigger (INSERT only) |
