# 01 — System Context (As-Is)

## Product
Aircons Store — a South African ecommerce storefront selling air conditioners plus configurable add-ons (installation tiers, installation kits, maintenance plans, extended warranties). Checkout is guest-only; orders are paid by manual EFT or Payfast (currently disabled in DB).

## Actors
| Actor | Interaction |
|---|---|
| Guest customer | Browses catalog, configures product, checks out (guest), pays via EFT/Payfast, receives confirmation link |
| Registered customer | Supabase Auth email/password; views own order history at `/account/orders` (email-match RLS) |
| Store owner/admin | Receives order email via Resend; manages orders/products **directly in the Supabase dashboard** — no admin UI in this repo |
| Payfast | Redirect-based payment; server→server ITN webhook to `/api/payfast/itn` |
| Supabase | Postgres (system of record), Auth, Edge Functions, Storage (product images), pg_cron, pg_net |
| Resend | Transactional email (order notification to owner + receipt to customer) |
| Upstash Redis | Optional rate limiting (skips if env unset) |
| Cloudflare Turnstile | Optional checkout CAPTCHA (skips if env unset) |
| WhatsApp | `wa.me` deep link carrying order summary to the business number |
| Google Ads/Analytics | `generate_lead` event pushed to `window.dataLayer`/`gtag` on confirmation page — **no gtag/GTM loader found in code** |

## Runtime context
```
Customer browser
   │  HTTPS
   ▼
Vercel (CDN + Next.js 16 serverless SSR + server actions)
   │  ├─ anon Supabase client (RLS-enforced reads: catalog, settings-free)
   │  ├─ service-role client (checkout writes, order-confirmed reads, pricing)
   │  └─ Supabase Auth cookie session (middleware refresh + /account guard)
   ▼
Supabase project mrufsvbnxysgpjpnpuhb
   ├─ Postgres: products, categories, collections, deals, orders, order_items,
   │   payments, payment_providers, settings, admins, installation_*,
   │   maintenance_*, warranty_*, promotions, page_heroes
   ├─ Trigger on orders INSERT → pg_net POST → Edge Function `order-email`
   ├─ pg_cron `orders-pii-retention-90-days` (nightly anonymization, partial)
   └─ Auth (auth.users) — email/password
        │
        ▼
   Edge Function order-email ──x-webhook-secret──► Resend API ──► owner + customer

Payfast ──ITN POST──► /api/payfast/itn ──► orders.payment_status transition
```

## Trust boundaries
1. Browser ↔ Next.js server: all prices/config re-resolved server-side (`src/lib/server-pricing.ts`); client prices display-only.
2. Next.js ↔ Supabase: two privilege tiers — anon key (RLS) and service role (bypasses RLS, server-only; verified never imported in `"use client"` files).
3. Public ↔ order data: order reads require order UUID **and** `secure_token` (UUIDv4) match, enforced server-side; authenticated users read own orders via email-match RLS.
4. Payfast ↔ webhook: IP allowlist + MD5 signature + server-to-server validation POST + exact amount match (worktree version).

## Data classification
| Data | Store | Sensitivity |
|---|---|---|
| Order PII (name, phone, email, delivery address, notes) | `orders` plaintext | High — POPIA-relevant |
| Order line items | `order_items` + duplicated `orders.items` JSONB | Medium |
| Banking details (business) | `settings` | Medium — shown to EFT customers by design |
| Auth credentials | Supabase `auth.users` (bcrypt, managed) | High — delegated |
| Secrets | `.env.local` (gitignored) + Supabase edge-fn env | High — one secret committed in migration |
| Product catalog | `products` etc., public via RLS | Low |

## Deployment view (inferred)
- **Hosting:** Vercel (git-connected; evidence: `x-forwarded-proto`/`x-real-ip` handling, Vercel-specific `.vercel` gitignore, README). UNKNOWN — actual project/config not visible.
- **DB:** Supabase hosted Postgres (project ref `mrufsvbnxysgpjpnpuhb` — evidence: hardcoded URL in `supabase/migrations/20260710085328_order_email_webhook.sql:8`).
- **Environments:** production + local dev only; no staging; no IaC; migrations applied manually via dashboard SQL editor (per `ADMIN_SETUP_GUIDE.md` and AGENTS.md).
- **DNS/TLS/WAF:** UNKNOWN — presumably Vercel-managed TLS; no WAF config found; no custom security headers configured.

## Out of scope / absent
No search service, no shipping/delivery-rate provider, no tax engine, no coupon system, no inventory system (stock fields are decorative), no CMS beyond tables, no queue/worker infra, no Medusa/Stripe (never existed here).
