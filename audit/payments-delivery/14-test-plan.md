# 14 — Test Plan (Payments + Delivery)

Existing coverage: `src/lib/__tests__/payment-security.test.ts` — Payfast signature +
phone normalisation + order-number format (pure functions only). No integration, no
webhook, no DB tests.

## Unit tests (Vitest — extend existing suite)

| # | Test | Target |
|---|---|---|
| UT-1 | `generateSignature` — known-answer vectors incl. special chars, empty passphrase | payfast.ts |
| UT-2 | `verifyWebhook` — forged signature rejected; merchant mismatch rejected; status mapping COMPLETE/FAILED/CANCELLED | payfast.ts |
| UT-3 | `getSourceIp` — rightmost XFF hop, x-real-ip preference, null handling | itn/route.ts |
| UT-4 | `normalizePhone` — existing; add malformed/edge inputs | actions.ts |
| UT-5 | `resolveOrderPricing` — forged tier id; sold-out product; enquiry-only product = 0 price; quantity coercion | server-pricing.ts |
| UT-6 | checkout schema — honeypot reject, missing consent, paymentMethod enum | actions.ts |
| UT-7 | Idempotency key — same key returns same order (mocked DB) | actions.ts |
| UT-8 | (to-be) `apply_payment_event` transition table — invalid transitions rejected | new |
| UT-9 | (to-be) refundable amount = paid − Σrefunds | new |
| UT-10 | (to-be) delivery transition validation incl. delivered-requires-payment rule | new |

## Integration tests (staging Supabase)

| # | Scenario | Expected |
|---|---|---|
| IT-1 | Full checkout → order+items+payment rows exist, statuses consistent | all rows, single transaction-consistent state |
| IT-2 | Double-submit same idempotency key (concurrent) | exactly 1 order |
| IT-3 | ITN COMPLETE for pending order | paid + event logged |
| IT-4 | ITN COMPLETE twice (sequential + concurrent) | single paid transition; 2nd → "already processed" |
| IT-5 | ITN amount mismatch (±R0.01) | rejected 400, order untouched, alert |
| IT-6 | ITN from non-allowlisted IP | 403 |
| IT-7 | ITN with valid sig but Payfast server validation fails | 400 |
| IT-8 | ITN FAILED then COMPLETE | failed → paid allowed |
| IT-9 | Redirect endpoint: wrong token / non-payfast order / already-paid | 403/400/redirect-to-confirm |
| IT-10 | Order-confirmed page: wrong token, expired non-EFT, expired pending-EFT | 404 / 404 / 200 with bank details |
| IT-11 | (to-be) mark-paid admin action for EFT | paid + audited event + customer email |
| IT-12 | (to-be) reconciliation job vs stuck `processing` order | resolved or flagged |
| IT-13 | (to-be) driver event append with duplicate UUID | deduped |
| IT-14 | (to-be) delivered blocked on unpaid deferred order | 409 + event |
| IT-15 | (to-be) PoP upload without token / wrong MIME | rejected |

## RLS / security tests (SQL — run in staging)

| # | Assertion |
|---|---|
| RL-1 | `anon` cannot SELECT/INSERT/UPDATE `orders`, `payments`, `order_items` |
| RL-2 | `authenticated` non-admin cannot SELECT `payments`, `settings` |
| RL-3 | Customer sees only own-email orders |
| RL-4 | (to-be) driver sees only assigned deliveries; PoD bucket private |
| RL-5 | `generate_order_number` not executable by anon/authenticated |
| RL-6 | `payment_providers.configuration` contains no secrets — policy review |

## Manual / UAT scripts

| # | Script | Verify |
|---|---|---|
| M-1 | Sandbox Payfast end-to-end: checkout → redirect → pay → ITN → confirmed | payment + confirmation page, LeadTracking once |
| M-2 | Kill ITN delivery (block route), complete payment at Payfast | reconciliation recovers order |
| M-3 | Manual EFT full loop incl. PoP + admin confirm | paid + notified |
| M-4 | Double-click checkout submit | one order (post GAP-07 fix) |
| M-5 | Tamper checkout DOM price | server re-resolves true price |
| M-6 | 10 rapid checkout attempts | rate limited after 5 |
| M-7 | Driver run: assign → depart → arrive → PoD photo → delivered | full timeline + notification |
| M-8 | Failed delivery ×2 → return workflow | attempts counter + refund path |
| M-9 | Security headers scan (securityheaders.com) on /checkout | CSP present, grade ≥ B |
| M-10 | Order expiry: pending EFT visible >48h; others 404 after expiry | both |

## Load checks before Medium scale

- Checkout path under 50 concurrent submits — DB connection pool saturation is the first
  wall (Supavisor transaction mode required).
- `resolveOrderPricing` — 11 config queries × concurrency; add caching first (GAP-26).
- ITN burst replay — confirm dedup holds under concurrency (UT/IT-4).
