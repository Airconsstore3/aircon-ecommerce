# 01 — System Map

Evidence-based map of the deployed system. Source: repo inspection + `ARCHITECTURE_AUDIT.md` (2026-09-25), re-verified against the current working tree on 2026-10-09.

## Architecture diagram

```
                        CUSTOMER BROWSER
                              |
                    localStorage["cart"]  (100% client-side cart)
                              |
                              v
                     VERCEL (CDN + SSR)
                              |
                NEXT.JS 16.3.6 APP ROUTER
                RSC pages + Server Actions
                              |
        +---------------------+---------------------+
        |                     |                     |
        v                     v                     v
   ANON CLIENT          SERVICE-ROLE           SUPABASE AUTH
   (RLS: published      CLIENT                 email/password,
   reads only)          (server actions,       cookie session via
                        API routes,            @supabase/ssr;
                        sitemap,               guards /account only
                        order-confirmed)            |
        +---------------------+---------------------+
                              |
                              v
                     SUPABASE POSTGRES
   products / categories / collections / product_collections /
   deals / promotions / page_heroes / orders / order_items /
   payments / settings / payment_providers / installation_tiers /
   installation_kits / pipe_* / bracket_* / insulation_* /
   protective_cage_options / installation_pricing_rules /
   installation_kit_*_compat / maintenance_* / warranty_* /
   admins / auth.users
                              |
            +-----------------+-----------------+
            |                                   |
            v                                   v
   pg_net trigger on                  pg_cron job
   orders INSERT                      'orders-pii-retention-90-days'
   (20260710085328)                   anonymizes submitted orders >90d
            |
            v
   Edge Function `order-email`  ──►  Resend API  ──►  owner + customer email
   (x-webhook-secret, HTML-escaped)

   PAYFAST (disabled in payment_providers)
        ├── redirect: GET /api/payfast/redirect?order=<uuid>&token=<secure_token>
        └── ITN:      POST /api/payfast/itn → signature + IP allowlist +
                      server-to-server validate + exact-amount match
```

## Route inventory

| Route | Type | Notes |
|---|---|---|
| `/` | RSC | Hero, featured products, categories carousel, reviews carousel, footer w/ dead newsletter form |
| `/products` | RSC `force-dynamic` | Parent products only; filter chips (category/brand/BTU), sort, grid density; **no search** |
| `/products/[slug]` | RSC | Variants (BTU selectors + dynamic attributes), install/kit/maintenance/warranty modals, JSON-LD Product + Breadcrumb, related items, **fabricated rating/review counts** |
| `/categories/[slug]` | RSC | Residential/Commercial/Accessories clients |
| `/collections/[slug]` | RSC | Added 2026-09-25 fix pass; breadcrumb hierarchy via `parent_id` |
| `/deals`, `/deals/[slug]` | RSC | Deal pages link to underlying product — deal IDs cannot enter cart |
| `/cart` | Client | Drawer + page; recommendations via server action |
| `/checkout` | Client form → `submitCheckout` server action | Guest-only; SA provinces dropdown; consent + honeypot + Turnstile |
| `/order-confirmed/[token]?token=` | RSC | UUID + secure_token + expiry gate (relaxed for pending EFT); rate-limited; `noindex` |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Supabase Auth | Real auth; email confirm; safe-redirect guard |
| `/account/orders`, `/profile`, `/subscriptions`, `/warranties` | Guarded | Orders real via email-match RLS; **subscriptions & warranties are hardcoded mock arrays** |
| `/api/payfast/redirect` | GET | Token-verified Payfast handoff |
| `/api/payfast/itn` | POST | Webhook |
| `/auth/callback`, `/auth/error` | OAuth/recovery | `next` param guarded |
| `/privacy`, `/terms`, `/return-policy`, `/warranty`, `/installation`, `/maintenance`, `/repairs`, `/about` | Static/RSC | Content pages |
| `robots.ts`, `sitemap.ts` | Generated | Disallows checkout/cart/account/order-confirmed/auth; sitemap = static + all 438 product slugs |
| `/admin/*` | **ABSENT** | `ADMIN_SETUP_GUIDE.md` documents routes that do not exist; `nextadmin-template/` is a gitignored stub containing only `node_modules/` |

## Integrations

| Service | Status | Evidence |
|---|---|---|
| Supabase Postgres | Live | `supabase/migrations/*` (37 files), `.temp/linked-project.json` |
| Supabase Auth | Live | `src/utils/supabase/{server,middleware,client}.ts`, `(auth)/actions.ts` |
| Supabase Edge Function `order-email` | Deployed per migration trigger | `supabase/functions/order-email/index.ts` |
| Resend | Via edge fn | `RESEND_API_KEY` env in edge fn |
| Payfast | Implemented, `is_enabled=false` in DB | `src/lib/payment/payfast.ts`; AGENTS.md |
| Manual EFT | Enabled | `src/lib/payment/manual-eft.ts` |
| Upstash Redis | Optional; skipped if env unset | `checkout/actions.ts` rateLimit(), order-confirmed page |
| Cloudflare Turnstile | Optional; skipped if secret unset | `verifyTurnstile` in checkout actions |
| Google GTM + GA4 | Consent-gated via `CookieConsentBanner` | `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID` env vars; `generate_lead` + Ads `conversion` events |
| WhatsApp | `wa.me` deep links on checkout + confirmation | `buildWhatsAppMessage`, `WhatsAppButton` |
| Search / CMS / Shipping carrier / Tax engine / ERP | **None** | — |

## Order state machine (actual)

```
submitCheckout ─► orders(payment_status=pending, status=submitted)
                      │
  GET /api/payfast/redirect ─► payment_status=processing
  ITN COMPLETE  ─► payment_status=paid, status=completed, paid_at, txn id
  ITN FAILED    ─► payment_status=failed
  ITN CANCELLED ─► payment_status=cancelled
  markWhatsAppSent (order id + secure_token) ─► status=sent_whatsapp
  admin manual  ─► EFT confirm — NO UI; Supabase dashboard only
  pg_cron 90d   ─► status=submitted >90d → anonymized + cancelled
```

`orders.status` ∈ submitted|sent_whatsapp|email_sent|completed|cancelled;
`payment_status` ∈ pending|processing|paid|failed|cancelled|refunded|partially_refunded.
**There is no fulfilment/delivery state anywhere** — `status=completed` means "paid", not "delivered". `refunded`/`partially_refunded` enum values exist with no code path that sets them.

## Deployment & ops

- Vercel hosting assumed (`x-forwarded-proto`/`x-real-ip` handling, AGENTS.md, prior audit). No CI/CD config found in repo (no `.github/`, no `vercel.json`).
- Package manager ambiguity: `pnpm-lock.yaml` + `pnpm-workspace.yaml` exist but docs say `npm run *`.
- No `engines` field; no `.env.example` (`.env.local` + `.env.local.backup` exist locally, gitignored).
- No error monitoring (Sentry absent), no uptime monitoring, no structured logging beyond `console.*`.
- DB backups: Supabase platform default — no documented restore plan.
