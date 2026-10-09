# Flow Audit Findings Register

Severity: **Critical** = revenue-blocking / security / data loss / dead-end core flow ·
**High** = broken core flow or major UX failure · **Medium** = workaround exists ·
**Low** = polish. IDs are stable — `findings.csv` uses the same IDs.

## Critical

### F-01 · No admin surface — EFT payment confirmation has no implemented path
- **Flow:** Admin order management (B9–B15, C3)
- **Status:** Missing
- **Evidence:** no `/admin` route; `admins` table unused by the app (`20260710085327:3-17`); only writers of `payment_status` are ITN + (nonexistent) admin; `nextadmin-template/` is a separate gitignored project
- **Steps observed:** none in-app; assumption = Supabase dashboard table editor
- **Failure paths:** order never marked paid → customer order sits `pending`; confirmation page works only while unexpired
- **Dead ends:** the only "admin" is raw SQL — error-prone, no audit trail
- **Recommendation:** minimal `/admin` (session + admins check): pending-orders list → detail → mark paid/cancelled/refunded + note. P0.

### F-02 · WhatsApp-channel orders may never reach the business
- **Flow:** Order → owner notification (C6)
- **Status:** Broken
- **Evidence:** `supabase/functions/order-email/index.ts:107` — `if (!order || !["email","both"].includes(order.channel)) return Response.json({skipped:true})` skips owner AND customer email for `channel='whatsapp'`; the WhatsApp path is `window.open(result.whatsappUrl)` *after* an `await` in `CheckoutClient.tsx:136-138` → popup-blockable, and if blocked the business hears nothing
- **Steps observed:** order persisted (good) but notification depends on customer action
- **Dead ends:** popup blocked / user closes tab → silent order with zero business visibility until someone checks the dashboard
- **Recommendation:** send owner notification email for every channel ("whatsapp" order should still email the owner "customer chose WhatsApp — contact them"); keep wa.me as customer convenience only. P0.

### F-03 · Service booking forms collect PII and send it nowhere
- **Flow:** Maintenance booking, repairs booking, warranty register/claim (A32-adjacent)
- **Status:** Broken (fake forms)
- **Evidence:** `maintenance/page.tsx:113` `onSubmit={(e)=>e.preventDefault()}`; `repairs/page.tsx` — `setSubmitted(true)` only; `warranty/page.tsx:313` — multi-step form ends in `setSubmitted(true)`
- **Edge cases handled:** shows success confirmation → user believes a request was lodged
- **Dead ends:** 100% of submissions lost — revenue loss + POPIA optics (collecting PII into nothing)
- **Recommendation:** route through `submitCheckout`-style server action → `service_requests` table → same owner-email edge fn, or disable forms and link to WhatsApp/checkout until built. P0/P1.

### F-04 · ORDER_WEBHOOK_SECRET committed in migration + unverified rotation
- **Flow:** Email dispatch (C6)
- **Evidence:** `supabase/migrations/20260710085328_order_email_webhook.sql:9` — secret `78bb4e3f…` hardcoded; AGENTS.md notes "in git history — rotate"
- **Recommendation:** rotate secret in edge fn env + trigger fn; verify hardening migration applied. P0 ops task (no code change needed).

## High

### F-05 · Contact/support surface is dead
- **Evidence:** `/contact` 404 (linked from `help2.tsx:169`, `premium-footer.tsx:30`, `return-policy/page.tsx:349`); `wa.me/27000000000` & `wa.me/27210000000` placeholders (`help2.tsx:175`, `warranty/page.tsx:263,504,517`, `return-policy/page.tsx:363`); `/faq`,`/shipping`,`/returns`,`/blog`,`/brands`,`/cookies`,`/book-installation` all 404
- **Recommendation:** one `/contact` page (real phone/email/WhatsApp from `settings`); replace all placeholder wa.me numbers with `settings.whatsapp_number`. P1.

### F-06 · Search absent; dead icon buttons
- **Evidence:** `shadcnblocks/navbar.tsx:258-268,464-470`; `shop/Navbar.tsx:96-102` — buttons with no handler; no search route/index
- **Recommendation:** remove icons until `/search` exists (Postgres `ilike`/pg_trgm is adequate at 438 rows) or ship a simple `/search?q=` page. P1/P2.

### F-07 · Account areas render fabricated data
- **Evidence:** `account/subscriptions/page.tsx:18-37` and `account/warranties/page.tsx:18-37` hardcode `MOCK_*` entries with Cancel/Log-claim buttons — real users see fake "Annual Maintenance Plan R1200 — Active"
- **Dead ends:** "Cancel Plan", "Log a Claim", "Download Certificate" (href `#`) do nothing
- **Recommendation:** empty-state these pages until backed by real tables (or delete). P1.

### F-08 · Newsletter / deal alerts fake
- **Evidence:** `premium-footer.tsx:87-94` local-state subscribe; `deals/DealsClient.tsx:44-52` `console.log`+`alert()`
- **Recommendation:** `subscribers` table + Resend audience, or remove forms. P2.

### F-09 · Post-purchase surface empty
- **Evidence:** no fulfilment states, tracking, or delivery emails; `OrderHistory` "View Details"→`/account/orders/[orderNumber]` 404 (`OrderHistory.tsx:282`), "Track Order" self-link (`:162-171`), "Invoice"/"Request Service" dead buttons (`:285-291`), timeline stages `scheduled`/`in_progress` unreachable (`account/orders/page.tsx:35-42`)
- **Recommendation:** `/account/orders/[id]` detail page + remove dead actions; add `fulfilled/shipped` statuses when ops supports them. P1.

### F-10 · Coupon surface shows unusable codes
- **Evidence:** `promotions.code` rendered (`ProductsClient.tsx:181`); no coupon field/schema/writer; `discount_total_zar` always 0
- **Recommendation:** hide `code` display or implement `coupon_code` + discount resolution in `resolveOrderPricing`. P2.

### F-11 · Guest-vs-account order linking by email string is fragile
- **Evidence:** `20260917b` RLS `lower(trim(email))=jwt email`; checkout never records `user_id`; changing account email orphans history
- **Recommendation:** add `orders.user_id` nullable, set from `auth.getUser()` at checkout when session exists + backfill claim on signup (match by email, take ownership). P2.

## Medium

### F-12 · EFT banking details depend on `.single()` settings row
- **Evidence:** `order-confirmed/[token]/page.tsx:143-148` — 0 or >1 `settings` rows → `bankingDetails=null` → banking block silently hidden; customer cannot pay
- **Recommendation:** `.limit(1).maybeSingle()` + explicit "contact us for banking details" fallback. P1.

### F-13 · Payfast failure = terminal dead end; cart already destroyed
- **Evidence:** `CheckoutClient.tsx:134` `clearCart()` runs before `window.location.href` to gateway; `order-confirmed` retry button only for `pending` (`page.tsx:189-198`) — `failed`/`cancelled` show text only
- **Recommendation:** keep a server-side snapshot (`order_items` exists — offer "recreate cart" / re-initiate payment button for `failed`/`cancelled`). P1 when Payfast goes live.

### F-14 · Idempotency key per-click, not per-session
- **Evidence:** `CheckoutClient.tsx:99` generates inside `handleSubmit` — browser-back+resubmit → duplicate order
- **Recommendation:** `useRef`/`useState` at mount. P1 (cheap fix, real dup risk).

### F-15 · 48h token expiry still 404s non-EFT confirmations
- **Evidence:** `page.tsx:126-131` — paid/cancelled/failed Payfast + paid EFT orders all 404 post-48h
- **Recommendation:** gate only sensitive blocks (bank details); or no-expiry for `paid`. P2.

### F-16 · Fake pagination; soft-404 category slugs; dead `/account` index
- **Evidence:** `ProductsClient.tsx:297-318`; `categories/[slug]/page.tsx:337-341` renders empty page for unknown slugs; no `account/page.tsx`
- **Recommendation:** remove pagination until real; `notFound()` on empty+unknown slug; redirect `/account`→`/account/orders`. P2.

### F-17 · Misleading marketing claims
- **Evidence:** `help2.tsx` FAQ: "PayJustNow and Mobicred" financing (line 60), "tracking updates by email" (line 35) — neither exists; `getPlaceholderRating` fabricated reviews (`products/[slug]/page.tsx:121-148`) — CPA/ASA exposure
- **Recommendation:** correct copy; remove fabricated ratings. P2 (legal review).

### F-18 · All-enquiry carts can select Payfast → R0 hosted payment
- **Evidence:** `server-pricing.ts:395-397` enquiry lines → 0; `actions.ts` has no minimum-total check vs provider
- **Recommendation:** for `total_zar=0`, force EFT/enquiry flow or block gateway payment. P2.

### F-19 · Fire-and-forget email; ghost-order email race
- **Evidence:** `pg_net` trigger fires on INSERT before `order_items`/`payments` writes complete — a compensated delete still emails owner; Resend failure = silent
- **Recommendation:** move email trigger to `payments` INSERT (post-commit of the trio) or queue + retry. P2.

### F-20 · No observability/alerting
- **Evidence:** `console.error` only (`actions.ts`, `itn/route.ts`, `order-email`); no Sentry; no alert on checkout/ITN/email failure
- **Recommendation:** Sentry (or Axiom/Logtail) + alert rule on checkout failure + ITN rejection. P2.

## Low

### F-21 · Multi-tab cart races (last-writer-wins) — `CartProvider.tsx:59-63`
### F-22 · `useCart` silent NOOP outside provider — `CartProvider.tsx:111-128`
### F-23 · `orders.items` JSONB ↔ `order_items` duplication; `variant_id` never populated — `server-pricing.ts:403`
### F-24 · Old `shop/Navbar.tsx` + `MobileMenu.tsx` dead code containing dead links — imports: none found
### F-25 · Dead nav/footer links to `/account/settings`, `/account/wishlist`, `/auth/logout` (dead-code navbar) + `/categories/kits` (default MENU overridden — confirm)
### F-26 · Money as integer ZAR — no cents possible (`orders.total_zar integer`)
### F-27 · `email_sent` status declared, never written; `payments.status` mirror can diverge
### F-28 · Turnstile invisible widget relies on `cf-turnstile-response` auto-field — verify token actually produced when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set, else every checkout fails "Security check failed"
### F-29 · Rate-limit/confirmation-lookup skipped entirely when Upstash env unset (documented graceful skip — verify prod env)
### F-30 · Duplicate `products` page queries: `getProducts()` full-table `*` fetch for filter counts vs `filterProducts` re-fetch — perf only
