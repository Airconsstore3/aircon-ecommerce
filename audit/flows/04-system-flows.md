# System Flows Audit (C1–C13)

## C1. Payment webhook (Payfast ITN) — **Working (code-hardened, provider disabled)**

`POST /api/payfast/itn` (`itn/route.ts:24-166`):
1. Parse form body → extract signature + source IP (`x-real-ip` else rightmost XFF — spoof-resistant).
2. IP allowlist (`41.74.179.228-231`; localhost only in non-prod). **Fail closed on missing IP.**
3. `PayfastProvider.verifyWebhook`: MD5 signature check → **server-to-server POST to Payfast `/eng/query/validate`** (authoritative) → merchant_id match → status mapping COMPLETE/FAILED/CANCELLED.
4. Order lookup by `m_payment_id` (= order_number) → exact-cent amount match → idempotent already-paid early return → update `orders` (`payment_status`, `paid_at`, `provider_transaction_id`, `status='completed'`) + `payments` mirror.
5. Non-atomic paired updates — `orders` success + `payments` failure is logged-and-continued (divergence risk, low impact).
6. `PAYFAST_PASSPHRASE` unset → signature forgeable but server-validation is the real gate; warns loudly (`payfast.ts:139-144`).

Edge cases: duplicate ITN → 200 "Already processed"; `failed`/`cancelled` can overwrite a `processing` order (acceptable); a `COMPLETE` ITN after manual `cancelled` → flips to paid (no terminal-state guard) — **flagged edge**; unknown `payment_status` values map to null and leave the order `processing` forever (no alert).

## C2. Refund webhook — **MISSING**

No refund webhook, no refund initiation, no Payfast refund API call.

## C3. Order status sync — **MISSING**

Nothing propagates status to the customer post-creation. The customer only sees status if they revisit the token URL before expiry; `/account/orders` shows mapped status for matching-email accounts.

## C4. Inventory decrement — **MISSING (by design, flagged)**

No stock mutation anywhere. `stock_count`/`is_sold_out` are manually maintained display flags; `is_sold_out` is enforced at checkout (`server-pricing.ts:317`). Oversell possible — business confirms availability manually per AGENTS.md.

## C5. Low stock alert — **MISSING**

`low_stock_threshold` drives a UI badge only; no alert to the business.

## C6. Email dispatch — **Working (with a channel gap)**

- Path: `orders` INSERT → `notify_order_email()` trigger (`security definer`, `pg_net`) → edge fn → Resend.
- Edge fn: POST-only, `x-webhook-secret` required (fails closed), HTML-escaped fields, channel gate `email|both` — **whatsapp-channel orders produce zero email to anyone** (`index.ts:107`).
- No retries on Resend failure — `pg_net` fire-and-forget; a Resend outage = silent loss (only function logs would show it).
- `OWNER_EMAIL` env fallback `info@airconsstore.co.za`.

## C7. Abandoned cart trigger — **MISSING**

No server cart, no schedule, no reminder.

## C8. Search indexing — **MISSING**

No search feature to index for.

## C9. Analytics event tracking — **Partial**

- Consent: `CookieConsentBanner` sets Consent-Mode defaults (denied), loads GTM (`NEXT_PUBLIC_GTM_ID`) and/or GA4 (`NEXT_PUBLIC_GA_ID`) **only after accept** — correct POPIA posture.
- Events emitted: `generate_lead` on order-confirmed mount (sessionStorage-deduped, `transaction_id`, hashed email/phone, item ids — `LeadTracking.tsx`); Google Ads `conversion` click on WhatsApp button (`WhatsAppButton.tsx:9-14`).
- **No** `page_view` config issue, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `sign_up` events — the funnel is invisible below the last step. Whether GTM/GA IDs are set in prod: REQUIRES VERIFICATION.

## C10. Backup job — **MISSING (platform responsibility)**

- App-level: none. Supabase PITR/daily backups are a platform setting — REQUIRES VERIFICATION (plan-dependent).

## C11. Failed payment retry — **MISSING**

- No retry scheduler or UI. A `failed`/`cancelled` Payfast order is terminal; pending-payfast shows a re-pay button only while the token lives (48h).

## C12. Session expiry — **Working**

- `middleware.ts` → `updateSession` refreshes the Supabase JWT cookie every request (`utils/supabase/middleware.ts` uses `getUser()` — revalidates server-side, correct); `/account` unauthenticated → `/login?next=…`. Matcher excludes `/api` + static — correct.

## C13. Error logging and alerting — **Partial (logging) / MISSING (alerting)**

- Every server path logs (`console.error/warn` with `[checkout]`, `[payfast-itn]`, `[server-pricing]` tags). No Sentry/Logtail/Bugsnag; no alert on order-creation failure, ITN failure, or email failure — an outage is only discovered via Vercel logs if anyone looks. `error.tsx` boundary exists for rendering crashes; `not-found.tsx` real 404s.
