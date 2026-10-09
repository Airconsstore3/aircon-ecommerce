# App Flow Audit — Executive Summary

**Product:** Aircons Store (aircon-ecommerce)
**Live storefront:** https://airconsstore.co.za (assumed — `NEXT_PUBLIC_SITE_URL` fallback in `src/app/robots.ts:4`)
**Repo:** local working tree `C:\Users\user\aircon-ecommerce` (no remote origin configured)
**Stack:** Next.js 16.3.6 (App Router, RSC + Server Actions), React 19, TypeScript, Tailwind 4, Supabase (Postgres + Auth + Edge Functions), Payfast + Manual EFT, Resend email, optional Upstash rate-limit + Cloudflare Turnstile, GTM/GA4 behind cookie consent
**Market:** South Africa (ZAR, +27 phone, SA provinces, Payfast, WhatsApp-first contact)
**Roles:** guest shopper, registered customer, store admin (Supabase-dashboard only — no in-app admin UI)
**Audit date:** 2026-10-09 · **Method:** full static trace of `src/` + `supabase/` + prior `ARCHITECTURE_AUDIT.md` (2026-09-25) whose code fixes are confirmed present in the working tree (uncommitted). Live DB/env not reachable (Supabase MCP unauthenticated) — items needing runtime verification are labelled **REQUIRES VERIFICATION**.

---

## 1. The business model this app actually implements

This is **not** a conventional ecommerce store. It is a **lead-generation quote engine** that happens to take orders:

- Cart is 100% client-side (`localStorage`), checkout is a single server action that re-resolves all prices server-side and writes `orders`/`order_items`/`payments`.
- The only enabled payment method is **Manual EFT** — the customer is shown bank details and the shop reconciles payment by hand. Payfast is implemented but **disabled** in `payment_providers` (per AGENTS.md — REQUIRES VERIFICATION in live DB).
- "Payment confirmation" is manual by a human. There is **no fulfillment, shipping, tracking, or refund flow at all** — `orders.status='completed'` means "paid", not delivered.
- Owner notification for whatsapp-channel orders depends on the **customer actually opening a wa.me deep link** — the edge function skips owner email entirely for `channel='whatsapp'`.

The critical-path flows (browse → product → cart → checkout → order → confirmation page → owner email) are **implemented and hardened** after the Sept 25 audit pass. The surrounding flows (search, contact, admin, post-purchase, marketing capture) are largely **missing or fake**.

## 2. Top 10 broken or missing flows

| # | Flow | Status | Severity | Evidence |
|---|------|--------|----------|----------|
| 1 | **Admin order management** — no admin UI exists at all. Order status, EFT confirmation, refunds, fulfilment happen (if at all) by hand-editing the Supabase dashboard | MISSING | Critical | No `/admin` route; `nextadmin-template/` is a gitignored separate project (ARCHITECTURE_AUDIT.md §2); `admins` table + RLS exist but nothing consumes them |
| 2 | **Service booking forms** (maintenance, repairs, warranty register/claim) — collect name/phone/email, show "request received", and **send nothing anywhere** — silent customer data loss | BROKEN | Critical | `maintenance/page.tsx:113` `onSubmit={e=>e.preventDefault()}`; `repairs/page.tsx` `setSubmitted(true)` only; `warranty/page.tsx:313` `setSubmitted(true)` only |
| 3 | **Owner notification for WhatsApp-channel orders** — the `order-email` edge function returns early for `channel='whatsapp'`; the owner is only reached if the customer opens the wa.me link, which is opened via `window.open` after an `await` (popup-blockable) | PARTIAL/BROKEN | Critical | `supabase/functions/order-email/index.ts:107` skip logic; `CheckoutClient.tsx:136-139` |
| 4 | **Search** — magnifier buttons in both navbars have no handler; no search route or index exists | MISSING | High | `shadcnblocks/navbar.tsx:258-268` `SearchForm`, `navbar.tsx:464-470`; `shop/Navbar.tsx:96-102` |
| 5 | **Contact / support** — `/contact` is linked from ≥3 places and 404s; all `wa.me` CTAs use placeholder numbers `27000000000`/`27210000000`; `support@`/`hello@airconsstore.co.za` are unverified | MISSING | High | `help2.tsx:169,175`; `premium-footer.tsx:30`; `return-policy/page.tsx:349,363`; `warranty/page.tsx:263,504,517` |
| 6 | **Newsletter / deal-alert capture** — footer subscribe and deals-alert forms fake success, persist nothing | BROKEN | High | `premium-footer.tsx:87-94`; `deals/DealsClient.tsx:44-52` (`console.log` + `alert()`) |
| 7 | **Post-purchase flows** — order tracking, shipment status, delivery emails, refunds/returns, cancellation — nothing exists beyond the 48h-token confirmation page | MISSING | High | `orders.status` enum has no fulfilment states; `OrderHistory.tsx:168` "Track Order" links back to itself; `/account/orders/[n]` 404s |
| 8 | **Account areas show fabricated data** — `/account/subscriptions` and `/account/warranties` render hardcoded MOCK_* arrays as if they were the user's real plans | BROKEN | High | `account/subscriptions/page.tsx:18-37`, `account/warranties/page.tsx:18-37` |
| 9 | **Coupons/promotions** — `promotions.code` is displayed on listing pages but there is no coupon field or discount application anywhere; `discount_total_zar` column exists, unused | MISSING | High | `ProductsClient.tsx:181`; `checkout/actions.ts` has no discount path; `20260812_checkout_payment_hardening.sql:73` |
| 10 | **Checkout account experience** — checkout is guest-only; logged-in users get no prefill; order↔account link is an *email-string match* so a guest order under a different email is invisible in history | PARTIAL | High | `CheckoutClient.tsx` (no session read); `20260917_customer_order_access_trim.sql` email-match RLS |

## 3. Top 10 dead ends & friction points

| # | Dead end / friction | Evidence | Severity |
|---|--------------------|----------|----------|
| 1 | Dead footer links: `/contact`, `/faq`, `/shipping`, `/returns`, `/book-installation`, `/brands`, `/blog`, `/cookies` all 404; `/categories/heat-pumps`, `/categories/portable` render empty soft-404 pages | `premium-footer.tsx:20-44`; `categories/[slug]/page.tsx:337-341` (no `notFound()`) | High |
| 2 | Order history "View Details" → `/account/orders/{orderNumber}` → 404; "Invoice" & "Request Service" are dead `<button>`s; status timeline shows `scheduled`/`in_progress` steps that `mapStatus` can never emit | `OrderHistory.tsx:282-291`; `account/orders/page.tsx:35-42` | High |
| 3 | EFT banking details use `.single()` on `settings` — zero or duplicate settings rows silently hide the banking block, leaving the customer with no way to pay | `order-confirmed/[token]/page.tsx:146` | High |
| 4 | Failed/cancelled Payfast order confirmation shows "please try again" text with **no retry button**; and `clearCart()` runs before the Payfast redirect, so a failed payment also loses the cart | `order-confirmed/[token]/page.tsx:202-207` (retry button exists only for `pending`); `CheckoutClient.tsx:134,142-144` | Medium |
| 5 | Fake pagination bar on `/products` (buttons 1/2/3/…/10 don't work) | `ProductsClient.tsx:297-318` | Medium |
| 6 | Idempotency key is generated per submit click, not per form session — browser-back + resubmit creates a duplicate order | `CheckoutClient.tsx:99` | Medium |
| 7 | `expires_at` 48h hard-gate still 404s non-EFT confirmation pages — a Payfast customer returning after 48h (even paid) sees 404 | `order-confirmed/[token]/page.tsx:126-131` | Medium |
| 8 | Search icon = dead button on desktop AND mobile nav | `shadcnblocks/navbar.tsx:258-268,464-470` | Medium |
| 9 | `/account` index route 404s (layout exists, no `page.tsx`); stray `/account` links would dead-end | `src/app/account/` listing | Low |
| 10 | Misleading marketing copy: FAQ promises PayJustNow/Mobicred financing and shipment tracking emails — neither exists; `getPlaceholderRating` fabricates 4.6–5.0★/99–780 reviews on every product | `help2.tsx:35,60`; `products/[slug]/page.tsx:121-148` | Medium |

## 4. Readiness scores (0 = absent, 5 = production-grade)

| Area | Score | One-line reason |
|------|-------|-----------------|
| Browse/catalog | 4 | Rich listing/filter/variant pages; fake pagination, soft-404 category slugs, fake ratings |
| Search | 0 | No search at all; dead icon buttons |
| Cart | 4 | Solid client cart + drawer + recommendations; no server persistence, no revalidation until checkout |
| Checkout | 4 | Server-resolved pricing, zod, idempotency, Turnstile+rate-limit hooks; guest-only, single page, no shipping/tax steps |
| Payment | 3 | EFT works manually; Payfast hardened but disabled & untested live; no retry path for failed payments |
| Order lifecycle | 2 | Creation + confirmation page solid; no fulfilment/tracking/cancel/refund states |
| Auth | 4 | Login/signup/reset/verify all real via Supabase; no OAuth, guest-vs-account order linking is fragile |
| Admin | 0 | Nothing — Supabase dashboard is the admin UI |
| Notifications | 2 | Order-received email works for email channels only; WhatsApp-channel owner alert unreliable; no status emails |
| Error handling | 3 | Real 404/error pages + per-step error paths; `console.error` only, no alerting |
| Recovery | 2 | Idempotency + compensating deletes exist; no abandoned-cart, no payment retry, no crash-resume |
| Analytics | 1 | `generate_lead` + consent-gated GA4/GTM only; no view_item/add_to_cart/begin_checkout/purchase events |

**Overall flow readiness: ~2.7 / 5** — the revenue path works, but the business operation path (admin, post-purchase, support, marketing capture) is essentially absent.

## 5. The single most critical flow to fix first

**Give the store a functioning order-management surface and a reliable owner-alert for every order** — today the only thing between "customer places order" and "the business knows about it" is (a) an email that is silently skipped for WhatsApp-channel orders, or (b) the customer's own willingness to open a wa.me link. Every rand of revenue currently depends on that. Concretely: send the owner email for all channels, and build the minimal `/admin/orders` page (list → detail → mark paid/cancelled) gated by the existing `admins` table.

## 6. What I could not verify (needs access)

- Live `payment_providers.is_enabled` values (Payfast disabled per docs only).
- Whether `20260925_audit_hardening.sql` was applied in the dashboard (anon INSERT revoke, settings RLS).
- Whether the `ORDER_WEBHOOK_SECRET` in git history matches the deployed trigger/edge-function env.
- Whether `NEXT_PUBLIC_GTM_ID`/`NEXT_PUBLIC_GA_ID`, `UPSTASH_*`, `TURNSTILE_*`, `PAYFAST_*`, `RESEND_*` are set in production.
- Whether `wa.me/27000000000` placeholders are actually live numbers (they look like dummies).
- Which variant FK (`ON DELETE CASCADE` vs `SET NULL`) exists in prod.
