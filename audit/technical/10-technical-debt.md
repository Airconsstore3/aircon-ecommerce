# 10 — Technical Debt Register

Ranked by remediation leverage. All items evidence-cited; statuses reflect the **worktree** (uncommitted fixes marked).

## Structural debt
| ID | Debt | Evidence | Effort |
|---|---|---|---|
| TD-01 | Non-transactional order creation (3 sequential inserts + compensating deletes); race window between order INSERT and items/payments | `checkout/actions.ts:321-380` | M — move to `create_order` Postgres function (single transaction) |
| TD-02 | Dual order-item storage (`orders.items` JSONB + `order_items` rows) | `actions.ts:286-300` vs `:333-351` | S — pick `order_items` as canonical, stop writing JSONB |
| TD-03 | Duplicated status fields `orders.payment_status` vs `payments.status` | `itn/route.ts:102-144` | M — single-writer rule + reconcile job or drop one |
| TD-04 | Two variant systems; dead `is_base_product`/`product_series`; conflicting FK cascade (CASCADE vs SET NULL) in prod UNKNOWN | `20250728_add_product_variants.sql` vs `supabase-migration-variants.sql` | M — inspect prod `pg_constraint`, drop dead columns |
| TD-05 | `orders.email`/`customer_email` duplication | `20260812_checkout_payment_hardening.sql:62` | S |
| TD-06 | Integer-rand money (no cents) | products/orders schema | XL if ever needed — document decision now |
| TD-07 | No fulfillment/shipping states; `completed` conflates paid+fulfilled | orders CHECK constraint | M |

## Code-level debt
| ID | Debt | Evidence | Effort |
|---|---|---|---|
| TD-08 | Tests re-implement the logic they test | `payment-security.test.ts:7-21` | S |
| TD-09 | 15 ESLint errors (`react-hooks/set-state-in-effect`) — legit patterns but fail `pnpm lint` → unusable as CI gate until fixed or explicitly suppressed | `pnpm lint` output | M |
| TD-10 | Dead code: `mock-data.ts`, `mock-products.ts`, unused `mapSupabaseProductToVariant`, unused `_params` in manual-eft | grep | S |
| TD-11 | `useCart` silent NOOP outside provider → add-to-cart silently fails | `CartProvider.tsx:111-129` | S — throw |
| TD-12 | Hardcoded pricing fallbacks in code duplicate DB seeds (`server-pricing.ts:74-79`); drift risk | both | S — fail loudly instead |
| TD-13 | Magic layout numbers (`pt-[220px]`), inline `<style>` blocks | `order-confirmed/page.tsx:156`, `ProductDetailClient.tsx:1018` | S |
| TD-14 | `z.any()`-ish loose typing on kit config (now typed — verify `KitConfiguration` matches all callers) | `actions.ts:11-25` | S |
| TD-15 | Raw `error.message` returned to clients | `actions.ts:444` | S |

## Process debt
| ID | Debt | Evidence | Effort |
|---|---|---|---|
| TD-16 | **36 uncommitted files incl. all security fixes** — no commit discipline, no branch protection | `git status` | S (commit) + process fix |
| TD-17 | No `.env.example`; env vars discoverable only by grep | repo | S |
| TD-18 | pnpm/npm duality; no engines; `tsconfig` includes stale `.next/dev/types` | `package.json`, `tsconfig.json:30` | S |
| TD-19 | Migrations applied manually via dashboard; `20260925` pending; root-level `supabase-migration-variants.sql` outside migration flow | `ADMIN_SETUP_GUIDE.md` | M |
| TD-20 | Stale docs: `ADMIN_SETUP_GUIDE.md` references `/admin/*` routes that don't exist; `AUDIT_REPORT.md` describes pre-Supabase version; `README.md` is create-next-app boilerplate | files | S |
| TD-21 | `nextadmin-template/` nested project on disk (gitignored) — unclear relationship | dir listing | S — decide keep/archive |
| TD-22 | Account `/subscriptions` + `/warranties` render **hardcoded mock data to real logged-in customers** | `account/subscriptions/page.tsx` (MOCK_SUBSCRIPTIONS), `account/warranties/page.tsx` | S — hide behind flag or implement |
| TD-23 | Fake ratings (`getPlaceholderRating` fabricates 4.6–5.0★, 99–780 reviews) rendered on PDPs — CPA/consumer-protection risk | `products/[slug]/page.tsx:121` | S — remove or source real reviews |
| TD-24 | gtag events pushed but no gtag/GTM loader → analytics likely dead | `LeadTracking.tsx`, no script in `layout.tsx` | S — install GTM or remove events |
| TD-25 | No `/categories` sitemap entries; 438 variant pages all self-canonical (near-duplicate SEO) | `sitemap.ts` | S |

## Security debt (also in 06)
- `ORDER_WEBHOOK_SECRET` rotation (SEC-02)
- `20260925` application + verification (SEC-03)
- next ≥16.3.8 upgrade (SEC-04)
- Spoofable rate-limit IP (SEC-05)
- Security headers suite (SEC-07)
- `.env.local.backup` deletion; `SHADCNBLOCKS_API_KEY` removal
