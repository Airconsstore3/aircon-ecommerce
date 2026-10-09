# 01 — Background Audit (Evidence Log)

Every finding cites evidence. Type: **Fact** / **INFERRED** / **ASSUMED**.
Severity: Critical / High / Medium / Low / Info.

## A. Repository & git history

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| A1 | Product name is "Aircons Store" (brand), styled "airconsstore" in some legal copy | `src/app/layout.tsx` title; `src/app/privacy/page.tsx` vs `src/app/terms/page.tsx` ("Airconsstore") | Fact | Low — naming inconsistency |
| A2 | Repo URL: `github.com/Airconsstore3/aircon-ecommerce` | `.git/config` remote origin | Fact | Info |
| A3 | **GitHub Personal Access Token embedded in local git remote URL** (`ghp_…`, redacted) — live credential in `.git/config`, recoverable by anyone with file access | `.git/config` `[remote "origin"]` | Fact | **Critical** — rotate token, use credential manager |
| A4 | First commit `f5a32c9` "frontend preview", 2026-06-06, author Sim846 | `git log --reverse` | Fact | Info |
| A5 | 111 commits; authors: `Sim846 <simbachivas98@gmail.com>` (early) and `Airconsstore3 <airconsstore3@gmail.com>` (bulk) | `git shortlog`, `git log --pretty` | Fact | Info |
| A6 | INFERRED: Sim846 and Airconsstore3 are the same individual (identity fix commit `2763f99` "fix author" on day one; single-person commit style throughout) | Commit `2763f99` | INFERRED | Info |
| A7 | INFERRED: AI-assisted/"vibe-coded" build — commit cadence (dozens of same-day micro-fixes), audit docs describing it as such, `AGENTS.md`, no human co-authors | Repo docs, commit pattern | INFERRED | Info |
| A8 | Backup branches `backup-full-website-before-restore`, `backup-homepage-before-restore` indicate a restore/rebuild event | `git branch -a` | Fact | Low |
| A9 | Admin panel (`src/app/admin/*` — dashboard, products, orders, deals, heroes, promotions, categories, settings, admins, login) existed through 2026-06-30→07-10 commits and is **absent from HEAD**; the deletion is not attributable to a single recorded commit (last path-touching commit `4a56aca` 2026-07-10) | `git log -- src/app/admin`, `git ls-tree HEAD`, `ADMIN_SETUP_GUIDE.md` | Fact | High — ops capability deleted |
| A10 | `nextadmin-template/` directory contains only `node_modules` — an abandoned admin-template experiment | `ls nextadmin-template` | Fact | Low — dead artefact |
| A11 | `README.md` is still create-next-app boilerplate — zero project documentation | `README.md` | Fact | Medium |
| A12 | Rich audit trail exists: `AUDIT_REPORT.md` (2026-06-29, stale), `ADMIN_SETUP_GUIDE.md` (stale — admin deleted), `ARCHITECTURE_AUDIT.md` (2026-09-25, current), `ECOMMERCE_FIX_PLAN.md` (22 items applied), `ENGINEERING_REPORT.md` | Repo root | Fact | Info |

## B. Stack, integrations & deployment

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| B1 | Next.js 16.3.6, React 19.2.4, TypeScript, Tailwind v4, shadcn/ui, Radix, Relume UI, framer-motion | `package.json` | Fact | Info |
| B2 | Supabase: Postgres + Auth + Edge Functions + `pg_net` trigger webhook; prod project ref `mrufsvbnxysgpjpnpuhb.supabase.co` | `supabase/migrations/20260710085328_order_email_webhook.sql`, `supabase/functions/order-email` | Fact | Info |
| B3 | Payments: Manual EFT (enabled) + Payfast (implemented, disabled in `payment_providers` table; defaults to sandbox) | `src/lib/payment/`, `AGENTS.md`, `ECOMMERCE_FIX_PLAN.md` | Fact | Info |
| B4 | Email: Resend API via `order-email` Edge Function; default sender `Aircons Store <orders@aircons-store.co.za>` — **note hyphenated domain differs from `airconsstore.co.za`** | `supabase/functions/order-email/index.ts` L78 | Fact | Medium — deliverability/dns |
| B5 | Rate limiting: Upstash Redis (optional); CAPTCHA: Cloudflare Turnstile (optional) | `AGENTS.md`, env-var grep | Fact | Info |
| B6 | Analytics: GTM + GA4, consent-gated via `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA_ID`; consent-mode defaults; `generate_lead` conversion with SHA-256-hashed identifiers | `src/components/CookieConsentBanner.tsx`, `src/app/order-confirmed/[token]/LeadTracking.tsx`, privacy page §5 | Fact | Info |
| B7 | Hosting: INFERRED Vercel (commit "trigger redeploy", Vercel-specific fixes "env vars trailing newline in Vercel", `vercel.svg` asset, README boilerplate; no `vercel.json`) | Commit `14bfd71`, `e8dc777` | INFERRED | Info |
| B8 | Domain: `airconsstore.co.za` hardcoded fallback in robots/sitemap; `NEXT_PUBLIC_SITE_URL` env override | `src/app/robots.ts`, `sitemap.ts` | Fact | Info |
| B9 | Env vars in use: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SHADCNBLOCKS_API_KEY`, `PAYFAST_{MERCHANT_ID,MERCHANT_KEY,PASSPHRASE,MODE,IPS}`, `RESEND_{API_KEY,FROM}`, `ORDER_WEBHOOK_SECRET`, `OWNER_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `UPSTASH_REDIS_REST_{URL,TOKEN}`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID` | `.env.local` key names (values not read), code grep | Fact | Info |
| B10 | `ORDER_WEBHOOK_SECRET` committed to git history in `20260710085328_order_email_webhook.sql` (SHA-256 hex, redacted here) | Migration file, `AGENTS.md` | Fact | **Critical** — must rotate |
| B11 | shadcnblocks premium component license key in `.env.local` (`SHADCNBLOCKS_API_KEY`) — prior audit flagged as live-looking | `AUDIT_REPORT.md`, `.env.local` | Fact | Medium |

## C. Business identity & contact surface

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| C1 | Contact emails on legal pages: `info@`, `privacy@`, `support@` `@airconsstore.co.za` | terms, privacy, warranty pages | Fact | Info |
| C2 | **Placeholder contact data on live pages**: terms/privacy list phone `082 123 4567` and "Cape Town, South Africa"; return-policy uses `tel:+27210000000` / `wa.me/27000000000` | `src/app/terms/page.tsx` L143, `src/app/(shop)/return-policy/page.tsx` L356-363, `src/components/help2.tsx` L175 | Fact | **High** |
| C3 | Real business WhatsApp `+27767100588` set via migration into `settings.whatsapp_number` | `supabase/migrations/20260710_set_whatsapp_number.sql` | Fact | Info |
| C4 | Legal entity name: **UNKNOWN — needs founder confirmation**. No Pty Ltd, reg no., or VAT no. anywhere | Full-text search of repo | Fact | **High** |
| C5 | Footer copyright "© 2026 Aircons Store" — no legal entity | `src/components/premium-footer.tsx` L193 | Fact | Medium |
| C6 | EFT banking details stored in `settings` table (`bank_name`, `bank_account_name`, `bank_account_number`, `bank_branch_code`, `bank_reference_prefix`) shown on order-confirmed page | `src/app/order-confirmed/[token]/page.tsx` L134-148 | Fact | Info |
| C7 | Settings table also holds `store_name`, `contact_email`, `contact_phone`, `free_shipping_threshold_zar`, `announcement_*` | `20250630_create_settings_table.sql` | Fact | Info |
| C8 | Brands sold: Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York (reseller — INFERRED, no manufacturer agreements in repo) | `src/app/(shop)/about/page.tsx` | Fact/INFERRED | Info |
| C9 | Trustpilot logo assets in `public/trustpilot` — intent to show third-party social proof | `public/trustpilot` | Fact | Low |

## D. Legal & compliance surface

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| D1 | Privacy policy exists, POPIA-aware, "Last Updated: July 2026" | `src/app/privacy/page.tsx` | Fact | Info |
| D2 | Terms exist; dated "January 2025" — predates first commit (June 2026), likely copied/template text | `src/app/terms/page.tsx` L130 | Fact | Medium |
| D3 | Return-policy page references Consumer Protection Act | `src/app/(shop)/return-policy/page.tsx` L20 | Fact | Info |
| D4 | No shipping/delivery policy page; no dedicated refunds page (refunds partially covered in return-policy); no cookie policy page (consent banner only) | Route listing | Fact | Medium |
| D5 | **Fabricated product ratings** rendered to customers — deterministic pseudo-random 4.6–5.0 stars with review counts | `src/app/(shop)/products/[slug]/page.tsx` L137-141 | Fact | **High** — CPA/ASA misleading advertising |
| D6 | `/account/subscriptions` and `/account/warranties` render hardcoded MOCK_* data to signed-in users | `src/app/account/subscriptions/page.tsx` L18, `warranties/page.tsx` L18 | Fact | Medium |
| D7 | Cookie consent: Google Consent Mode defaults denied; GTM/GA only after opt-in | `CookieConsentBanner.tsx` | Fact | Info |
| D8 | PII retention: privacy policy claims ~90-day purge of non-converting requests; 48h confirmation-link expiry (EFT pending orders excepted) | privacy §6, `order-confirmed/[token]/page.tsx` L126 | Fact | Info |
| D9 | No VAT/tax computation or tax invoices anywhere in code | Prior audit, code search | Fact | **High** |
| D10 | PCI DSS: out of scope for card data (no card capture; Payfast hosts payment page) | Architecture | Fact | Info |
| D11 | ECTA s43 disclosure duties (supplier name, reg no., address, contact, T&Cs) cannot be met while entity is unknown and contacts are placeholders | Inferred from SA law + C2/C4 | INFERRED | **High** |

## E. Commerce & operations surface

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| E1 | Guest-only checkout; phone is the primary identity (normalized to +27); email optional | `src/app/(shop)/checkout/actions.ts` L76-80 | Fact | Info |
| E2 | WhatsApp-first contact preference: channel select "whatsapp / email / both", default "both" | `CheckoutClient.tsx` L36 | Fact | Info |
| E3 | Order confirmation = token-gated page (`secure_token` UUID, 48h expiry, EFT-pending exempt) with banking details + WhatsApp deep link | `order-confirmed/[token]/page.tsx` | Fact | Info |
| E4 | Order lifecycle: `submitted → sent_whatsapp / email_sent → paid`; no fulfilment/shipping/delivered states | `checkout/actions.ts`, `account/orders/page.tsx` L39 | Fact | Medium |
| E5 | Inventory cosmetic: `stock_count`/`is_sold_out` display + checkout rejection of sold-out, but stock never decremented | Prior audit `00-executive-summary.md` | Fact | Medium |
| E6 | No shipping/delivery fee in totals; address is collected but price excludes delivery | Prior audit | Fact | **High** — margin risk |
| E7 | Deal page prices ≠ checkout price (checkout re-resolves catalog price) | `ECOMMERCE_FIX_PLAN.md` | Fact | Medium |
| E8 | Newsletter signup is a dead form (Zod-validated, no backend) | `src/components/ecommerce-footer20.tsx` L115-127 | Fact | Low |
| E9 | `/maintenance` booking form is front-end only (`event.preventDefault()`, no submit) | `src/app/(shop)/maintenance/page.tsx` | Fact | Medium — dead CTA |
| E10 | All prices resolved server-side via `resolveOrderPricing()`; client prices never trusted | `src/lib/server-pricing.ts`, `AGENTS.md` | Fact | Info |
| E11 | Hardcoded testimonials on `/about` (Thabo M., Sarah K., etc.) — unverified reviews | `src/app/(shop)/about/page.tsx` | Fact | Medium |

## F. Security posture (background-relevant)

| # | Finding | Evidence | Type | Severity |
|---|---|---|---|---|
| F1 | Two critical orders-table RLS holes found and fixed 2026-08-17 (anon could read all orders incl. PII) | `AGENTS.md`, migrations `20260817*` | Fact | Info (fixed) |
| F2 | `20260925_audit_hardening.sql` shipped but marked "must be applied manually" — if unapplied, anon INSERT on orders remains open | `AGENTS.md`, migration file | Fact | **High** — UNKNOWN verification needed |
| F3 | Service-role client correctly confined to server-side code | `AGENTS.md`, `src/lib/supabase-service.ts` | Fact | Info |
| F4 | 22-item security/commerce fix plan applied in code (2026-09-25 audit) | `ECOMMERCE_FIX_PLAN.md` | Fact | Info |
| F5 | 15 known ESLint `react-hooks/set-state-in-effect` errors — benign patterns, documented | `AGENTS.md` | Fact | Low |
