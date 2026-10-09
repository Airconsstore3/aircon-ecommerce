# 04 — Audit Findings

Consolidated finding register. Prior-pass items (ARCHITECTURE_AUDIT.md) are marked
**FIXED in code** where verified on 2026-10-09; new items found this pass are marked NEW.
DB-side items pending manual application are marked **PENDING APPLY**.

IDs used in `findings.csv` and `05-gap-analysis.md`.

| ID | Sev | Area | Finding | Evidence | Status |
|---|---|---|---|---|---|
| F-01 | Critical | Security/Ops | `20260925_audit_hardening.sql` not confirmed applied in prod — anon INSERT on `orders` may still allow PostgREST order spam bypassing rate-limit/Turnstile/pricing and firing the email trigger | `supabase/migrations/20260925_audit_hardening.sql`; ECOMMERCE_FIX_PLAN.md "must be applied manually" | PENDING APPLY — verify in dashboard |
| F-02 | Critical | Security | `ORDER_WEBHOOK_SECRET` committed in git history (`20260710085328_order_email_webhook.sql`); edge fn now fails closed but the secret itself is compromised | migration file; edge fn lines 93-102 | Rotate required |
| F-03 | High | Admin/Ops | **No admin UI anywhere** — EFT payment confirmation, order status changes, refunds all require manual Supabase dashboard edits; every order's revenue recognition is a hand-edited row | no `/admin` routes in `src/app`; `nextadmin-template/` = node_modules stub; `ADMIN_SETUP_GUIDE.md` is stale | Open |
| F-04 | High | Compliance | Fabricated review ratings (4.6–5.0★, 99–780 reviews) rendered per product — misleading advertising under SA CPA; real `rating`/`review_count` columns exist unused | `products/[slug]/page.tsx:121-148,372-373,473-486` | Open — business decision |
| F-05 | High | Checkout | No delivery/shipping fee, zone, or option — totals exclude delivery entirely for a delivery/installation business; address is collected but never priced or validated | `checkoutSchema` + `resolveOrderPricing` — no shipping concept | Open — business decision |
| F-06 | High | Compliance/Tax | No VAT computation or tax invoice — totals have no tax line; SA VAT vendors must issue compliant invoices for these basket sizes | schema: no tax fields on orders/order_items | Open — needs confirmation of VAT registration |
| F-07 | High | Inventory | `stock_count` never decremented; qty can exceed stock (only `is_sold_out` bool blocks); overselling is possible-by-design but undocumented to customer | `server-pricing.ts` rejects only `is_sold_out`; no UPDATE on products | Open — policy decision |
| F-08 | High | Orders | No fulfilment lifecycle — `status='completed'` means paid; no confirmed→scheduled→installed/delivered states; customer has no status visibility past the confirmation page | state machine in 01-system-map | Open |
| F-09 | Medium | Orders | No refund/cancel workflow — `payment_status` enum includes refunded/partially_refunded with no writer | migration + grep: no code sets them | Open |
| F-10 | Medium | Account | `/account/subscriptions` and `/account/warranties` render hardcoded MOCK data to signed-in customers (fake plans, prices, dates, certificate links `#`) | `account/subscriptions/page.tsx`, `account/warranties/page.tsx` | Open |
| F-11 | Medium | Growth | Newsletter forms are dead — footer `onSubmit` only calls `alert()`; DealsClient subscribe button similar; emails collected and silently dropped | `ecommerce-footer20.tsx:127-130`, `premium-footer.tsx:87-92`, `DealsClient.tsx:~198` | Open |
| F-12 | Medium | Checkout | Email optional at checkout but email is the only persistent notification channel — EFT orders with no email get confirmation page only (link is the sole banking-details record); if lost, order is orphaned | `checkoutSchema` email optional; edge fn skips when `order.email` null | Open — UX decision |
| F-13 | Medium | Pricing consistency | Deal prices shown on `/deals` are never what checkout charges (catalog price) — "Save X%" claims may not be honoured | `deals/[slug]/page.tsx` CTA → product; `resolveOrderPricing` uses products only | Open — business decision |
| F-14 | Medium | Data | `orders.items` JSONB duplicates `order_items` rows; confirmation page reads `items`, account history reads `order_items` — parity unenforced | `actions.ts` writes both | Open |
| F-15 | Medium | Data | Integer-rand money model — no cents; `total_zar >= 0` check only | products/orders migrations | Open |
| F-16 | Medium | Schema | Duplicate variant systems in migrations (`is_base_product` dead vs `is_parent_product` live); conflicting FK cascade on parent delete — prod FK UNKNOWN | `20250728_add_product_variants.sql` vs `supabase-migration-variants.sql` | Verify prod pg_constraint |
| F-17 | Medium | Reliability | Optional defenses silently disable: no Upstash → no rate-limit; no Turnstile secret → no CAPTCHA. Prod env state UNKNOWN | `rateLimit()`/`verifyTurnstile()` early-return | Verify env |
| F-18 | Medium | Analytics | `generate_lead` fires for unpaid orders (page mount, not payment success); inflated conversion reporting; no view_item/add_to_cart/begin_checkout events | `LeadTracking.tsx` | Open |
| F-19 | Medium | SEO | Sitemap lists all 438 product slugs incl. near-duplicate variants that self-canonicalize; `/categories/*` and `/collections/*` missing | `sitemap.ts` | Open |
| F-20 | Low | Checkout UX | Stale localStorage carts fail only at checkout with hard error; no early validation/refresh of prices or availability | `CartProvider.tsx` | Open |
| F-21 | Low | UX | `useCart` returns silent NOOP outside provider — add-to-cart can silently fail | `CartProvider.tsx:111-129` | Open |
| F-22 | Low | Consistency | Commercial boundary overlap: `ProductsClient` chips use `>=32000` while `filterProducts` uses `>=32001` — 32000-BTU units counted in both | `ProductsClient.tsx:61-64` vs `filterProducts.ts:34-37` | Open |
| F-23 | Low | QA | Tests re-implement functions instead of importing — no regression protection on real code; 1 file / 13 tests total | `payment-security.test.ts` | Open |
| F-24 | Low | Repo hygiene | Dead code: `mock-data.ts`, `mock-products.ts` still present; `mapSupabaseProductToVariant` unused; `.env.local.backup` plaintext on disk; pnpm/npm ambiguity; stale `ADMIN_SETUP_GUIDE.md` | repo root | Open |
| F-25 | Low | Headers | No CSP/HSTS/X-Content-Type-Options config; only order-confirmed sets Referrer-Policy | `next.config.ts`, `middleware.ts` | Open |
| F-26 | Low | i18n/A11y | `<img>` used instead of `next/image` in several components; no a11y testing; keyboard/focus unknown | lint warnings | Open |
| F-27 | Low | Monitoring | No error tracking, uptime monitoring, or alerting; only `console.*` | repo | Open |

## Previously fixed (verified this pass — kept for the record)

| Prior ID | Fix verified |
|---|---|
| Next.js 16.2.6 critical RCEs | `next@16.3.6` in package.json |
| ITN spoofable IP / localhost allowlist / no server-validation / no-passphrase forge | `itn/route.ts` + `payfast.ts` — rightmost-XFF/x-real-ip, dev-only localhost, `/eng/query/validate`, warn-on-missing-passphrase, exact-cents match |
| `markWhatsAppSent` unauthenticated | now requires `secure_token` (`actions.ts:451-468`) |
| Non-atomic order creation | compensating deletes on item/payment failure |
| Client-trusted installation tier | server derives tier from `btu_range` (`server-pricing.ts:209-227`) |
| Deal id in cart broke checkout | deals link to product page instead |
| PostgREST `in()` injection via cart ids | UUID extraction (`recommendations.ts:34-51`) |
| `order-email` optional secret + HTML injection | fail-closed secret check + `escapeHtml` |
| `/collections/[slug]` 404s | page exists |
| Soft-404s | `notFound()` on product/deal/collection |
| `expires_at` blocking EFT customers | pending-EFT exemption |
| Duplicate `generate_lead` | sessionStorage dedup + `transaction_id` |
| `is_sold_out` orderable via crafted request | rejected in resolver |
| Stale "CoolAir" metadata, robots gaps, 32-40k BTU dead zone, `.single()` settings, raw error passthrough, stale combined-migration policy | all fixed per diff |
