# Flow Inventory — Aircons Store

Inventory of every route, action, endpoint, job, webhook, email, and external redirect
discovered in the codebase. Sources: `src/app/**`, `src/lib/**`, `src/components/**`,
`supabase/migrations/*`, `supabase/functions/*`, `middleware.ts`.

## 1. Frontend routes

### Public — storefront `(shop)` group (all render `NavbarWrapper` via `(shop)/layout.tsx`)

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `(shop)/page.tsx` | RSC | Hero, category carousel, featured products (`fetchFeaturedProducts`), reviews, FAQ, footer |
| `/products` | `(shop)/products/page.tsx` + `ProductsClient.tsx` | RSC + client | `force-dynamic`; parent products only; filters/sort via URL params; **fake pagination** |
| `/products/[slug]` | `(shop)/products/[slug]/page.tsx` + `ProductDetailClient.tsx` | RSC + client | Variant selectors, installation/kit/maintenance/warranty configurators, JSON-LD, `notFound()` on miss |
| `/categories/[slug]` | `(shop)/categories/[slug]/page.tsx` + 3 client variants | RSC | residential/commercial/accessories special layouts; **unknown slugs render empty generic page (soft-404)** |
| `/collections/[slug]` | `(shop)/collections/[slug]/page.tsx` | RSC | Real page (added in Sept-25 fix pass); `notFound()` on miss |
| `/deals` | `(shop)/deals/page.tsx` + `DealsClient.tsx` | RSC + client | Countdown, type filter tabs, **fake deal-alert email form** |
| `/deals/[slug]` | `(shop)/deals/[slug]/page.tsx` | RSC | Links out to linked product; no direct add-to-cart (by design) |
| `/cart` | `(shop)/cart/page.tsx` | client | localStorage cart UI; + `recommendations.ts` server action |
| `/checkout` | `(shop)/checkout/page.tsx` + `CheckoutClient.tsx` + `actions.ts` | client + action | Single-page guest checkout |
| `/installation` | `(shop)/installation/page.tsx` | static | Marketing page (no form found) |
| `/maintenance` | `(shop)/maintenance/page.tsx` | client | Marketing + **fake booking form** |
| `/repairs` | `(shop)/repairs/page.tsx` | client | Marketing + **fake booking form** |
| `/warranty` | `(shop)/warranty/page.tsx` | client | Marketing + **fake 5-step register/claim form** |
| `/about` | `(shop)/about/page.tsx` | static | Marketing |
| `/return-policy` | `(shop)/return-policy/page.tsx` | static | Info + dead `/contact` + placeholder wa.me |
| `/privacy`, `/terms` | `app/privacy|terms/page.tsx` | static | Legal |

### Public — auth `(auth)` group

| Route | File | Notes |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` + `login-form.tsx` | Redirects authed users to `?next` (safeNext-guarded) |
| `/signup` | `(auth)/signup/page.tsx` + `signup-form.tsx` | Email/password + full_name + phone metadata |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Sends Supabase reset email |
| `/reset-password` | `(auth)/reset-password/page.tsx` + `reset-password-form.tsx` | Requires recovery session |

### Public — transactional

| Route | File | Notes |
|---|---|---|
| `/order-confirmed/[token]` | `order-confirmed/[token]/page.tsx` | Service-role fetch, UUIDv4 + `secure_token` match + `expires_at` gate (EFT-pending exempt), rate-limited, `noindex` + `Referrer-Policy: no-referrer` via middleware |
| `/auth/callback` | `auth/callback/route.ts` | GET; exchanges `code` or `token_hash`+`type` for session; safe `next` |
| `/auth/error` | `auth/error/page.tsx` | Client reads `#error` fragment; offers reset re-request |

### Protected — `/account` (middleware + `account/layout.tsx` both call `getUser()`)

| Route | File | Notes |
|---|---|---|
| `/account` | — | **MISSING index page** → 404 (layout exists) |
| `/account/orders` | `account/orders/page.tsx` | RLS email-match; `OrderHistory` component |
| `/account/profile` | `account/profile/page.tsx` + `profile-form.tsx` + `actions.ts` | Edits `user_metadata` (name/phone/contact_method) |
| `/account/subscriptions` | `account/subscriptions/page.tsx` | **MOCK data** |
| `/account/warranties` | `account/warranties/page.tsx` | **MOCK data** |

### Non-existent routes that are linked from UI (dead ends)

`/contact`, `/faq`, `/shipping`, `/returns`, `/book-installation`, `/brands`, `/blog`, `/cookies`,
`/help`, `/help/*`, `/account/settings`, `/account/wishlist`, `/account/saved`, `/account/alerts`,
`/account/recent`, `/auth/logout`, `/account/orders/[orderNumber]`, `/categories/kits`,
`/categories/heat-pumps`, `/categories/portable`, `/categories/maintenance`, `/categories/installation`.
Evidence: `premium-footer.tsx:20-44`, `shop/Navbar.tsx:20-39` (dead code but imported nowhere),
`OrderHistory.tsx:282`, `help2.tsx:169`, `return-policy/page.tsx:349`, `warranty/page.tsx` CTAs.

## 2. Backend API endpoints

| Endpoint | Method | Auth | Effect |
|---|---|---|---|
| `/api/payfast/redirect?order=<uuid>&token=<uuid>` | GET | order id + secure_token match | Builds signed Payfast form URL; sets `payment_status=processing`; 302 → Payfast; `order` must be `payment_method=payfast` and not already paid |
| `/api/payfast/itn` | POST | IP allowlist + MD5 signature + merchant-id + **server-to-server Payfast validation** + exact-cent amount match | Transitions `orders.payment_status` → paid/failed/cancelled + mirrors `payments` row; idempotent on already-paid |
| `/auth/callback` | GET | Supabase auth | Session exchange (see above) |

No other API routes exist (`src/app/api` contains only `payfast/`).

## 3. Server actions

| Action | File | Auth | Mutation |
|---|---|---|---|
| `submitCheckout` | `(shop)/checkout/actions.ts` | guest + optional Turnstile + Upstash rate-limit (5/10min/IP) | `orders`+`order_items`+`payments` INSERT via service role; compensating delete on partial failure; returns confirmation/whatsApp/payfast URLs |
| `markWhatsAppSent` | same | order `secure_token` required | `orders.status: submitted→sent_whatsapp` |
| `fetchEnabledProviders` | `(shop)/checkout/providers-action.ts` | none | reads `payment_providers` where enabled |
| `getRecommendations` | `(shop)/cart/recommendations.ts` | none | reads `products` (anon client); UUID-validates composite cart ids |
| `login` / `signup` / `requestPasswordReset` / `updatePassword` / `signOut` | `(auth)/actions.ts` | Supabase Auth | auth session; safe redirects |
| `updateProfile` | `account/actions.ts` | session | `auth.updateUser` metadata |

## 4. Webhooks, triggers & jobs

| Mechanism | Source | Destination | Purpose |
|---|---|---|---|
| `on_order_insert_notify_email` trigger | `orders` INSERT | `pg_net` POST → edge function `order-email` (header `x-webhook-secret`, **secret hardcoded in migration `20260710085328`**) | owner + customer order emails |
| Edge fn `order-email` | trigger POST | Resend API | Sends owner inbox + customer "request received" — **skips entirely for `channel='whatsapp'`**; fails closed without `ORDER_WEBHOOK_SECRET` env |
| `pg_cron` job `orders-pii-retention-90-days` | `20260710085327` | `orders` UPDATE | Anonymizes PII + cancels `status='submitted'` orders > 90d |
| Payfast ITN | Payfast → `/api/payfast/itn` | DB | Payment status sync (see §2) |

No other webhooks, queues, or background jobs exist.

## 5. Emails & notifications

| Email | Trigger | Recipient | Status |
|---|---|---|---|
| "New checkout request" | orders INSERT (email/both channels) | `OWNER_EMAIL`/`info@airconsstore.co.za` | Working — **NOT sent for whatsapp channel** |
| "We received your request" | same | `order.email` if provided | Working (conditional) |
| Signup confirmation | Supabase Auth | new user | Working (Supabase-managed) |
| Password recovery | Supabase Auth | user | Working |
| Order status/delivery/refund emails | — | — | **MISSING** |
| Newsletter/deal alerts | — | — | **MISSING (forms are fake)** |
| Abandoned cart | — | — | **MISSING** |
| WhatsApp order message | `wa.me` deep link opened by customer | business number from `settings.whatsapp_number` | PARTIAL — depends on customer action + popup not being blocked |

## 6. External redirects

| Destination | From | Purpose |
|---|---|---|
| `https://sandbox|www.payfast.co.za/eng/process` | `/api/payfast/redirect` | Hosted payment page (disabled provider) |
| `https://wa.me/<settings.whatsapp_number>` | checkout success / confirmation page | Order details to business |
| `https://wa.me/27000000000`, `wa.me/27210000000` | help2, warranty, return-policy | **PLACEHOLDER numbers — dead links** |
| `mailto:support@|hello@airconsstore.co.za` | warranty, footer | Unverified addresses |
| `/eng/query/validate` (server-to-server) | ITN handler | Payfast authoritative ITN validation |

## 7. Data stores touched by flows

`products` (438 published / 194 parents / 244 variants), `categories`, `collections` +
`product_collections`, `deals`, `promotions`, `settings` (banking, policies, whatsapp),
`orders` (+ JSONB `items` mirror), `order_items`, `payments`, `payment_providers`,
`installation_tiers`, `installation_kits` + materials/sizes/lengths/brackets/insulation/cages +
compat + pricing rules, `maintenance_plans` + services + pricing + eligibility,
`warranty_options` + pricing + terms, `admins`, `auth.users`.
Cart lives only in `localStorage["cart"]`. Analytics consent in `localStorage["airconsstore_cookie_consent"]`.
