# Customer Flows Audit (A1–A34)

Status key: **Working / Partial / Broken / Missing**. Every claim cites code.

---

## A1. Landing / Home browse — **Working**

- Entry: `/` → `(shop)/page.tsx` renders HeroSection, CategoryCarousel, ServiceInfoSection, AccreditedBrands, AirconsShowcase, `ProductList9` (featured via `fetch-featured-products.ts:196`), EditorialSection, CustomerReviewsCarousel, Help2, PremiumFooter.
- Featured fallback chain: featured → on-sale → bestseller → latest (`fetch-featured-products.ts:202-289`), filtered to residential brands ≤36000 BTU.
- Friction: reviews carousel is static marketing; `getPlaceholderRating` fabricates ratings sitewide.
- Dead ends on the page: Help2 "Contact Us" → `/contact` 404; WhatsApp CTA → `wa.me/27000000000` placeholder; footer dead links (see inventory §dead ends).

## A2. Search — **MISSING**

- No `/search` route, no search API, no index. Navbar renders `<Search/>` inside a button with no `onClick` in both desktop (`shadcnblocks/navbar.tsx:258-268`) and mobile (`navbar.tsx:464-470`). Dead control — click does nothing.
- The only functional "search" is FAQ filtering (`help2.tsx:75-83`) and order-history filtering (`OrderHistory.tsx:69-79`).

## A3. Category browse — **Partial**

- `/categories/residential|commercial` → `filterProducts` BTU cutoffs (≤32000 / ≥32001) → `ResidentialCategoryClient` filter-bar layout (`categories/[slug]/page.tsx:197-210,277-309`).
- `/categories/accessories` → `type='accessory'` → `AccessoriesCategoryClient`.
- Any other slug → generic `filterProducts(supabase,'category',slug)` join on `categories.slug`; empty result still renders a 200 page titled by the slug — **soft-404** (no `notFound()` on empty, `page.tsx:337-341`). Footer links to `/categories/heat-pumps` and `/categories/portable` hit this path.
- Category counts chip uses `btu>=32000` for commercial while the query uses `>=32001` — a 32 000 BTU unit is counted commercial but listed residential (`page.tsx:122` vs `filterProducts.ts:37`). Minor.

## A4. Product listing with filters — **Working (with fake pagination)**

- `/products` server-fetches parent products, builds category/BTU/brand filter option counts (`products/page.tsx:69-134`), client filters by URL params (`ProductsClient.tsx:52-124`): category, brand, BTU, price range, in-stock, sort (featured/price/newest).
- **Pagination bar is decorative** — buttons 1/2/3/…/10 have no handlers (`ProductsClient.tsx:297-318`). With ~194 parents on one page this is currently cosmetic but dishonest.
- "Get a Quote" hero button → `/checkout` with empty cart → "cart is empty" page — low-value dead end.

## A5. Product detail view — **Working**

- `(shop)/products/[slug]/page.tsx`: fetches product by slug (`is_published`), `notFound()` on miss; fetches sibling variants, collections & category breadcrumbs, settings shipping/returns, kit/maintenance/warranty configs; emits Product + Breadcrumb JSON-LD; related products by same BTU.
- Rich configurator (`ProductDetailClient.tsx`): installation tier (auto-derived from BTU), installation-kit modal (DB-driven compat), maintenance plan modal, warranty selector — all with terms-gate modals.
- Issues: fabricated `rating`/`review_count` (`page.tsx:121-148`, documented, legal risk); inline `<style dangerouslySetInnerHTML>` magic padding.

## A6. Variant selection — **Working**

- Parent/variant = sibling rows sharing `parent_product_id`; page fetches the family (`page.tsx:399-415`).
- `ProductDetailClient.tsx:738-763`: `getVaryingAttributeKeys` renders selectors for attributes that vary; selecting a combination finds the matching variant and `router.push`es to its slug — each variant is a real URL. BTU rendered as "Available Sizes".
- Sold-out variants show sold-out state (`stockStatus` derived per variant, `:767-781`).
- `order_items.variant_id` is never populated — the variant is folded into `product_id` (server-pricing sets `variant_id:null` at `server-pricing.ts:403`). Data-level gap only.

## A7. Add to cart — **Working**

- `handleAddToCart` (`ProductDetailClient.tsx:938-1007`) builds composite id `<variantUUID>-<install|noinstall>-<kitSpec>-<maint>-<warranty>` + full display config → `addItem` → opens CartDrawer (`CartProvider.tsx:65-76`).
- Sold-out blocked client-side; `is_enquiry_only` items may be added (priced R0 — "quote" semantics).
- Wishlist heart on cards is **local-only state** (`ProductCard.tsx:158,186-193`) — not persisted, no wishlist exists.
- Silent-fail risk: `useCart()` returns a NOOP outside the provider (`CartProvider.tsx:111-128`).

## A8. Update / remove cart — **Working**

- `updateQty` (≤0 removes), `removeItem`, `clearCart` in `CartProvider.tsx:78-94`; identical controls in `/cart` page and CartDrawer.

## A9. View cart — **Working**

- `/cart` page: per-line config summary, breakdown (subtotal/install/kit/maintenance/warranty), enquiry items show "Price TBC", empty state CTA. CartDrawer adds `CartRecommendations` (server action `cart/recommendations.ts` — UUID-validated after Sept-25 fix).
- No stock/price revalidation at view time — stale carts only fail at checkout (acceptable, but zero early signal).

## A10. Apply coupon / discount — **MISSING**

- `promotions` table + banner display exist; `promo.code` is *shown* on `/products` and category pages (`ProductsClient.tsx:177-186`) but there is **no input field and no code path** that consumes it. `orders.discount_total_zar` exists, always 0. Displaying an unusable code is a broken promise, not just a missing feature.

## A11. Guest checkout — **Working (the core flow)**

`submitCheckout` (`checkout/actions.ts:211-447`):
1. zod-validate (name/phone/address/city/channel/paymentMethod/consent/honeypot `website`/idempotencyKey/items 1–99 qty)
2. `normalizePhone` → E.164 +27 enforced
3. `rateLimit()` — Upstash INCR `checkout:<ip>`, 5/10min; **skipped if env unset**
4. `verifyTurnstile` — **skipped if `TURNSTILE_SECRET_KEY` unset**
5. Idempotency: `idempotency_key` lookup → returns existing order
6. Provider enabled check vs `payment_providers`
7. `resolveOrderPricing` — all prices re-read from DB; sold-out rejected; unpublished/missing → hard error; installation tier server-derived from BTU (client tier advisory only); enquiry-tier installs dropped
8. `generate_order_number` RPC (SECURITY DEFINER, EXECUTE revoked from public by hardening migration)
9. Insert `orders` (items JSONB + totals + secure_token default) → insert `order_items` → insert `payments`; **compensating delete** on any post-order failure
10. Build wa.me URL (if channel whatsapp|both) stored on `orders.whatsapp_url`; Payfast → `/api/payfast/redirect` URL
11. Returns `{confirmationUrl, whatsappUrl, paymentRedirectUrl}` → client clears cart, opens WhatsApp, redirects.

Edge cases handled: validation errors → readable message; provider disabled → error; double-submit → idempotent return of same order **only when the same key is supplied** — but the key is generated per click (`CheckoutClient.tsx:99`) so browser-back+resubmit duplicates.
Edge cases missing: R0 totals (all-enquiry carts) can choose Payfast → creates a R0 hosted payment; no server-side minimum.

## A12. Account signup — **Working**

- `(auth)/actions.ts#signup`: password ≥8 + match, `signUp` with `full_name`/`phone` metadata, `emailRedirectTo`→`/auth/callback`. Handles `identities.length===0` (already-registered, anti-enumeration) and `needsConfirmation`.
- Whether confirmation email is actually required depends on Supabase project setting — REQUIRES VERIFICATION.

## A13. Login — **Working**

- `signInWithPassword`, generic error passthrough, `safeNext` redirect (default `/account/orders`). Login/signup pages redirect authed users away (`login/page.tsx:23-25`).

## A14. Password reset — **Working**

- `requestPasswordReset` → `resetPasswordForEmail(redirectTo:/auth/callback?next=/reset-password)` → callback exchanges → `updatePassword` (requires user session; expired-link message). `/auth/error` offers a re-request form.

## A15. Email verification — **Partial**

- Mechanism exists end-to-end (`needsConfirmation` branch + `/auth/callback` `token_hash`/`code` exchange). Whether it's enforced is a Supabase project setting; app behaves correctly either way — REQUIRES VERIFICATION.

## A16. Checkout — address — **Partial**

- Free-text `deliveryAddress` (min 5 chars) + `deliveryCity` + province `<select>` (fixed 9 SA provinces) + optional install notes (`CheckoutClient.tsx:203-234`). No postal code, no address validation/autocomplete, no suburb field. No saved addresses.

## A17. Checkout — shipping method — **MISSING**

- No shipping-method step, no delivery fee, no ETA, no courier selection. Delivery is arranged manually post-order ("We will contact you" on confirmation page). By design for a service business — but the UI never *tells* the customer delivery cost/logistics at checkout. FAQ claims "same-day Cape Town / 2–3 days nationwide" (`help2.tsx:35`).

## A18. Checkout — tax — **MISSING (n/a by design)**

- No tax computation or line. ZAR consumer prices presumably VAT-inclusive — not stated anywhere at checkout.

## A19. Checkout — payment method — **Working (single method)**

- `fetchEnabledProviders` → radio list (`CheckoutClient.tsx:238-269`); server re-verifies the chosen provider is enabled (`actions.ts:243-251`). Currently only `manual_eft` enabled (Payfast disabled — REQUIRES VERIFICATION of live DB).
- If zero providers enabled → no payment section renders but form still submits `paymentMethod:'manual_eft'` → server rejects "not available". Correct failure, confusing UX (no upfront "payments unavailable" state).

## A20. Payment success — **Partial**

- **EFT:** order confirmation page shows banking details + order number reference; payment confirmed manually (no UI — see B11). `payment_status` stays `pending` until admin acts.
- **Payfast:** ITN → `paid` + `paid_at` + txn id (`itn/route.ts:100-133`); return_url lands back on confirmation page showing "Payment confirmed".

## A21. Payment failure / retry — **Partial**

- Payfast `FAILED`/`CANCELLED` ITN → `payment_status` updated; confirmation page shows failure text (`page.tsx:202-207`) — **no retry button** (the "Pay securely" button only renders for `pending`, `:189-198`). `cancelled=1` badge supported. Cart already cleared → retry means re-shopping. Dead end.

## A22. 3DS / SCA — **N/A (delegated)**

- Handled on Payfast's hosted page when enabled. Nothing in-repo — correctly out of scope.

## A23. Order confirmation — **Working**

- `/order-confirmed/[uuid]?token=<uuid>`: validates UUIDv4 shape, secure_token match, rate-limited lookups (20/10min/IP+token-prefix when Upstash configured), `expires_at` 48h gate **except pending manual-EFT** (`page.tsx:98-131`), `noindex`+`no-referrer` via middleware.
- Renders status badge, context message per `payment_status`/`payment_method`, EFT banking block, customer/order detail, print & WhatsApp buttons.
- Failure: non-EFT orders (incl. **paid** Payfast) 404 after 48h.
- **Risk:** `.single()` on `settings` (`page.tsx:146`) → 0 or >1 rows hides the banking block silently → EFT customer cannot pay. Medium-High.

## A24. Order confirmation email — **Partial**

- Trigger on `orders` INSERT → edge fn → Resend: owner inbox always (for email/both channels), customer if `order.email` set.
- **`channel='whatsapp'` → edge fn returns early → owner gets NO email** (`order-email/index.ts:107`). Owner notification for WhatsApp orders rides on the customer opening wa.me (popup-blockable, `CheckoutClient.tsx:137`).
- Emails are "request received" wording — accurate since nothing is paid yet. HTML-escaped (Sept-25 fix). `ORDER_WEBHOOK_SECRET` fails closed; **committed in git history** (`20260710085328`) — rotate (REQUIRES VERIFICATION whether rotated).
- No "payment received", "order confirmed", or fulfilment emails.

## A25. Account — order history — **Working**

- `/account/orders`: RLS email-match (`20260917b` trim policy) → `OrderHistory` cards with status timeline.
- Gaps: "View Details" → `/account/orders/[orderNumber]` → **404**; "Invoice" and "Request Service" dead buttons; "Track Order" links to itself; timeline stages `scheduled`/`in_progress` unreachable via `mapStatus`; guest orders under a different email are invisible.

## A26. Account — order detail — **MISSING**

- No `/account/orders/[id]` page. The only order detail surface is the token-gated confirmation page (48h for non-EFT).

## A27. Account — profile edit — **Working**

- `profile-form` + `updateProfile` → `auth.updateUser` metadata (full_name, phone, contact_method whitelist). Email not editable. No avatar, no POPIA/data-deletion self-service.

## A28. Account — address book — **MISSING**

- No address storage anywhere; checkout re-asks every time.

## A29. Account — logout — **Working**

- `signOut()` server action wired in NavbarWrapper side menu (`NavbarWrapper.tsx:41`) → `supabase.auth.signOut()` → `/`. (Dead `shop/Navbar.tsx` links `/auth/logout` route that doesn't exist — dead code only.)

## A30. Request refund / return — **MISSING**

- `payment_status` enum contains `refunded`/`partially_refunded` but no flow writes them; `/return-policy` is informational with a dead `/contact` CTA. No RMA, no request form, no Payfast refund call.

## A31. Track shipment — **MISSING**

- No fulfillment entity, no tracking number, no carrier. `OrderHistory` has `trackingNumber`/`estimatedDelivery` fields that are never populated.

## A32. Contact support — **MISSING**

- `/contact` 404s (linked ≥3 places). Real paths: settings `whatsapp_number` (used by checkout) vs placeholder `wa.me/27000000000`/`27210000000` in static pages — the visible support CTAs are dead.

## A33. Newsletter signup — **MISSING (fake UI)**

- Footer form sets `subscribed=true` locally, persists nothing (`premium-footer.tsx:87-94`). Deals "deal alerts" does `console.log`+`alert()` (`DealsClient.tsx:44-52`). Both show false success — **BROKEN** (user believes they subscribed).

## A34. Abandoned cart recovery — **MISSING**

- Cart is localStorage-only; no server visibility, no reminder email, no recovery link. No cart-sharing either.

---

### Summary table

| # | Flow | Status | Severity of gap |
|---|------|--------|-----------------|
| A1 | Home browse | Working | — |
| A2 | Search | Missing | High |
| A3 | Category browse | Partial (soft-404s) | Medium |
| A4 | Listing + filters | Working (fake pagination) | Medium |
| A5 | Product detail | Working (fake ratings) | Medium |
| A6 | Variant selection | Working | Low |
| A7 | Add to cart | Working | — |
| A8 | Update cart | Working | — |
| A9 | View cart | Working | Low |
| A10 | Coupon | Missing | High |
| A11 | Guest checkout | Working | — |
| A12 | Signup | Working | — |
| A13 | Login | Working | — |
| A14 | Password reset | Working | — |
| A15 | Email verification | Partial (env-dependent) | Low |
| A16 | Address step | Partial | Medium |
| A17 | Shipping method | Missing | High |
| A18 | Tax | Missing (by design) | Low |
| A19 | Payment method select | Working | Low |
| A20 | Payment success | Partial (manual EFT) | High |
| A21 | Payment retry | Partial | Medium |
| A22 | 3DS/SCA | N/A (provider) | — |
| A23 | Order confirmation | Working (48h edge) | Medium |
| A24 | Confirmation email | Partial (whatsapp gap) | High |
| A25 | Order history | Partial (dead detail links) | Medium |
| A26 | Order detail | Missing | Medium |
| A27 | Profile edit | Working | — |
| A28 | Address book | Missing | Medium |
| A29 | Logout | Working | — |
| A30 | Refund/return | Missing | High |
| A31 | Track shipment | Missing | High |
| A32 | Contact support | Missing | High |
| A33 | Newsletter | Broken (fake) | Medium |
| A34 | Abandoned cart | Missing | Medium |
