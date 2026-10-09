# 02 — Feature Inventory

Status key: ✅ works · ⚠️ partial/degraded · ❌ absent · 🔶 present but fake/mocked

## 1. Product catalog

| Feature | Status | Evidence |
|---|---|---|
| Products table, published gating | ✅ | `products` migration 20250629; `is_published` filter on all reads |
| Categories + hierarchy | ✅ | `categories` table, `/categories/[slug]` with 3 client variants |
| Collections + hierarchy | ✅ | `collections`, `product_collections`, `/collections/[slug]` page |
| Variants (BTU, phase, model) | ✅ | `is_parent_product`/`parent_product_id`, `variant_attributes` JSONB; dynamic attribute selectors in `ProductDetailClient` |
| Price + sale price | ✅ | `price_zar`, `sale_price_zar` (integer ZAR, no cents) |
| Product images | ⚠️ | `images` JSONB array; some `<img>` tags bypass `next/image` (lint warnings in `CategoryClient`, `ProductCard`); remote allowlist only covers `images.unsplash.com` — Supabase storage host must be verified in prod config |
| Reviews / ratings | 🔶 | `getPlaceholderRating` fabricates 4.6–5.0★ + 99–780 reviews per product (`products/[slug]/page.tsx:121-148`); real `rating`/`review_count` columns override if set |
| Related products | ✅ | Same-BTU, prefer different-brand, max 4 |
| Search | ❌ | No search UI or endpoint anywhere |
| Filters/sort/pagination | ⚠️ | Client-side filter chips (category/brand/BTU/price); URL params; no real pagination — all parent products rendered |
| SEO | ⚠️ | Per-product metadata + canonical + OG + Twitter + Product/Breadcrumb JSON-LD; sitemap lists all 438 slugs incl. near-duplicate variants; no OG image file verified |
| Promotions banner | ⚠️ | `promotions` table drives a banner on `/products`; promo `code` field is never applied at checkout |
| Deals | ⚠️ | `deals` table + `/deals` pages; deal CTA links to underlying product — **deal price is display-only; checkout always charges catalog price** |

## 2. Cart and checkout

| Feature | Status | Evidence |
|---|---|---|
| Add/remove/update cart | ✅ | `CartProvider` localStorage, composite item ids encode install/kit/plan/warranty options |
| Cart persistence | ⚠️ | localStorage only — same browser/device; nothing server-side |
| Cart drawer | ✅ | `CartDrawer.tsx` |
| Cart recommendations | ✅ | `getRecommendations` server action (UUID extraction — injection fixed) |
| Guest checkout | ✅ | `submitCheckout`; no account required |
| Account checkout | ❌ | Checkout never links to auth session; orders link to accounts post-hoc by email-match RLS |
| Address validation | ⚠️ | Zod `min(5)` + city required + SA province dropdown; no postal code, no geocoding |
| Shipping options / rates | ❌ | **No delivery fee, zone, or carrier anywhere in totals** — delivery arranged offline |
| Tax / VAT | ❌ | No tax computation, no VAT line, no tax invoice |
| Coupons / gift cards | ❌ | `promotions.code` exists but is never consumed |
| Order summary | ✅ | Subtotal + installation + kit + maintenance + warranty + total |
| Idempotency | ✅ | Client-generated key + unique partial index + pre-insert lookup |
| Error states | ✅ | Zod → user-readable messages; sold-out rejection at resolver |
| Abandoned cart | ❌ | No capture, no recovery email |
| Payment retry | ⚠️ | Confirmation page shows "Pay via Payfast" while pending; no automated retry for EFT |
| Order confirmation | ✅ | Token-gated page: status badge, banking details (EFT), WhatsApp button, print stylesheet |
| Confirmation email | ⚠️ | Edge fn sends owner + customer email **only when channel ∈ {email,both}**; no resend mechanism, no template branding beyond inline HTML |

## 3. Payments and orders

| Feature | Status | Evidence |
|---|---|---|
| Manual EFT | ✅ | Enabled; banking details from `settings` on confirmation page |
| Payfast | ⚠️ | Fully implemented + hardened (signature, IP allowlist, server-to-server validate, exact-cents match, idempotent); **disabled in DB, never sandbox-tested end-to-end** |
| Refunds / partial refunds / cancellations | ❌ | Enum values exist; no code path sets them; no customer/admin flow |
| Order status lifecycle | ⚠️ | submitted→(sent_whatsapp|completed|cancelled); `completed` conflates paid with fulfilled; no shipped/delivered |
| Customer order history | ✅ | `/account/orders` via email-match RLS; rich item breakdown |
| Admin order view | ❌ | No admin UI — Supabase dashboard only |
| Invoices/receipts | ❌ | Print stylesheet on confirmation page is the only "receipt" |
| Webhook idempotency | ✅ | paid-order early return; per-status transitions |
| Fraud controls | ⚠️ | Rate-limit + Turnstile + honeypot at checkout; ITN verification layered; sequential `order_number` is guessable but gated by `secure_token` UUID for reads |
| PCI scope | ✅ | No card data touches the app — Payfast hosted page; compliant posture |

## 4. Inventory and fulfilment

| Feature | Status | Evidence |
|---|---|---|
| Stock fields | ⚠️ | `stock_count`, `is_sold_out`, `low_stock_threshold` exist; shown as badges |
| Stock decrement | ❌ | Never mutated by checkout |
| Oversell prevention | ⚠️ | `is_sold_out` rejected in `resolveOrderPricing`; `stock_count` NOT checked — qty>stock orders succeed |
| Low-stock alerts | ❌ | |
| Backorders/preorders | ❌ | |
| Carrier/tracking | ❌ | No tracking numbers, no shipment records |
| Fulfilment workflow | ❌ | Nothing — manual offline |
| Returns workflow | ❌ | Static return-policy page only |

## 5. Accounts and auth

| Feature | Status | Evidence |
|---|---|---|
| Signup/login/logout | ✅ | Supabase Auth; email confirmation; password ≥8 |
| Password reset | ✅ | `/forgot-password` → `/auth/callback` → `/reset-password` |
| Email verification | ✅ | Supabase-managed; `needsConfirmation` flow |
| Social login | ❌ | |
| Roles | ⚠️ | `admins` table + RLS exists, but **nothing in the app checks admin membership** — no admin surface to protect |
| Order-history privacy | ✅ | RLS email-match; secure_token for guests |
| Session security | ✅ | `getUser()` revalidation in middleware + layout; SameSite cookies; no anonymous sign-ins used |
| POPIA/GDPR data rights | ⚠️ | Privacy page promises rights; 90-day PII cron only covers stale `submitted` orders; no export/delete self-service |
| Mock account data | 🔶 | `/account/subscriptions` and `/account/warranties` render hardcoded fake plans/warranties |

## 6. Admin and operations

| Feature | Status | Evidence |
|---|---|---|
| Product CRUD | ❌ in app | Supabase dashboard only; seed scripts exist |
| Order management | ❌ in app | Manual DB edits; `admins` RLS policies exist for a future UI |
| Payment confirmation (EFT) | ❌ | No UI to mark paid — the single biggest ops gap |
| Customer management | ❌ | |
| Discount management | ❌ | Promotions banner only |
| Reports | ❌ | No sales/inventory/customer reporting |
| Audit log | ❌ | No `updated_by`/history tables |
| Bulk actions / search | ❌ | |
| Admin UI project | ❌ | `nextadmin-template/` is a stub (node_modules only); `ADMIN_SETUP_GUIDE.md` documents non-existent `/admin/*` routes |

## 7. Emails and notifications

| Feature | Status | Evidence |
|---|---|---|
| Order-received email (owner) | ✅ | pg_net → edge fn → Resend; owner inbox |
| Order-received email (customer) | ✅ | Only for channel email/both and only when `order.email` set (email optional at checkout) |
| Order confirmation post-payment | ❌ | No email on payment success (ITN doesn't trigger email) |
| Shipping/delivery/refund emails | ❌ | No such states |
| Admin alerts (low stock, failed payment) | ❌ | |
| Template branding | ⚠️ | Minimal inline HTML |
| SPF/DKIM/DMARC | UNKNOWN — needs DNS verification | |
| Unsubscribe/compliance | ⚠️ | Transactional only; no marketing list exists to unsubscribe from (newsletter form is dead) |

## 8. Security and compliance

| Control | Status |
|---|---|
| Service-role key isolation | ✅ server-only imports verified |
| RLS on all tables | ✅ orders anon-read holes fixed 2026-08-17 |
| Anon INSERT on orders | ⚠️ revoked by `20260925_audit_hardening.sql` — **pending manual apply** |
| Server-side pricing | ✅ client prices never trusted |
| Rate limiting | ⚠️ Upstash optional — silently skipped without env |
| Turnstile | ⚠️ optional — silently skipped without secret |
| Webhook secret rotation | ❌ `ORDER_WEBHOOK_SECRET` committed in migration `20260710085328`; rotation pending |
| XSS | ✅ React escaping + `escapeHtml` in emails |
| SQLi | ✅ PostgREST builder; raw `in()` filter fixed via UUID extraction |
| IDOR | ✅ UUIDv4 secure_token + RLS email-match |
| Security headers | ⚠️ Only Referrer-Policy/X-Robots-Tag on order-confirmed; no CSP/HSTS config in `next.config.ts` |
| Cookie consent | ✅ Banner with GTM consent-mode deny-by-default |
| CPA compliance | 🔶 Fake review ratings — misleading-marketing exposure |
| Accessibility | ⚠️ Radix base; `<img>` misuse; no a11y audits/tests |

## 9. Performance and reliability

- `force-dynamic` on `/products`; most pages use cookie-bound client → fully dynamic SSR every request. No ISR/caching strategy.
- `next/image` mostly used; several raw `<img>` warnings.
- N+1 risk: breadcrumb hierarchy walker queries per level; variant+related+config fetches are parallel-ish. Acceptable at this scale.
- No CDN config beyond Vercel defaults; no monitoring, no error tracking, no alerting.
- DB backup = Supabase platform defaults; no documented restore drill.

## 10. Analytics

- GTM + GA4 loaded only after consent (`NEXT_PUBLIC_GTM_ID`/`NEXT_PUBLIC_GA_ID` — presence in prod UNKNOWN).
- Events: `generate_lead` on confirmation (deduped per session, `transaction_id`, SHA-256 enhanced conversions), Ads `conversion` click on WhatsApp button.
- Missing: view_item, add_to_cart, begin_checkout, purchase-with-payment-status, funnel attribution, refunds. `generate_lead` fires for unpaid orders → inflates "conversions".

## 11. QA

- `vitest run`: **13/13 pass** — but tests re-implement `generateSignature`/`normalizePhone` inline rather than importing the real functions → **zero regression protection on real code**.
- `eslint`: 15 errors (all `react-hooks/set-state-in-effect` — legitimate patterns, documented) + 120 warnings.
- `tsc`/build: green per prior audit (next@16.3.6). Not re-run this pass (dep-installed tree unchanged).
- No e2e, no integration tests, no seed fixtures for orders.
