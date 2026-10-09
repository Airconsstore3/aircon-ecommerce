# 01 — Consolidated Findings Register

Every finding from every prior audit, deduplicated into one register.
**CF-xx** = consolidated ID used throughout this plan and `backlog.csv`.

Source key: `PRD-F#` = `/audit/04-audit-findings.md` · `AA-#` = `ARCHITECTURE_AUDIT.md` §6 item # · `TRD`/`GAP-0##` = `/audit/technical/*` · `DSN`/`DSN-G##` = `/audit/design/*` · `FLOW-#`/`FLOW-DE#`/`FLOW-G##` = `/audit/flows/*` · `BG-F##` = `/audit/background/findings.csv` · `PRD-G##` = `/audit/05-gap-analysis.md` · `FIX-#` = `ECOMMERCE_FIX_PLAN.md` · `ENG` = `ENGINEERING_REPORT.md`.

Severity: **Critical** = exploit/data-loss/revenue-blocking now · **High** = must fix before launch · **Medium** = should fix · **Low** = hygiene.
MoSCoW: **M**ust / **S**hould / **C**ould / **W**on't (this launch).

## A. Security & operations

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-01 | TRD-00, `git status` | Sec/Ops | Sept-25 security fixes (ITN hardening, `markWhatsAppSent` token gate, order-email escape+fail-closed, collections route, `20260925` migration) are **uncommitted** — 36 files; prod runs HEAD `1552a6e` if Vercel deploys from git | Critical | M | YES | ENG |
| CF-71 | BG-F-01 — **VERIFIED** `.git/config` | Secrets | **Live GitHub PAT embedded in remote URL** (`https://Airconsstore3:ghp_…@github.com/…`) — anyone with file access can push/read; local copy risk | Critical | M | YES | OPS |
| CF-76 | GAP-010, TRD R-07 — verified `actions.ts:156` | Sec | Checkout rate-limit keys on first-hop `x-forwarded-for` (client-spoofable); same bug class as the ITN fix but unpatched here | High | M | YES | ENG |
| CF-81 | FLOW-G-05 — verified `layout.tsx:44` + `CheckoutClient.tsx:296` | Checkout | Invisible Turnstile div never emits `cf-turnstile-response` (no `.execute()` call) — **if both Turnstile envs are set in prod, every checkout fails**; if neither is set it silently does nothing | High (critical-if-enabled) | M | Verify W0 | ENG |
| CF-77 | GAP-012 — verified `payfast.ts:139` | Payments | `PAYFAST_PASSPHRASE` unset → signature = md5(sorted params) = forgeable; code warns but doesn't hard-fail in live mode | High | M | Payfast gate | ENG |
| CF-02 | PRD-F01, FIX-9/10 | DB | `20260925_audit_hardening.sql` (revoke anon INSERT on orders, settings→admin-only) shipped but **manual apply unverified** — anon PostgREST order spam may still be open | Critical | M | YES | OPS |
| CF-03 | PRD-F02, AA-8 | Secrets | `ORDER_WEBHOOK_SECRET` committed in migration `20260710085328`; edge fn now fails closed but secret is compromised | Critical | M | YES | OPS |
| CF-04 | FLOW-2 (verified `maintenance/page.tsx:113`, `repairs:160`, `warranty:313`) | Forms | Service-booking forms (maintenance, repairs, warranty claim) render "request received" and **send nothing anywhere** — silent customer-data loss | Critical | M | YES | ENG |
| CF-05 | FLOW-3 (`order-email/index.ts:107`) | Notify | `order-email` skips owner email for `channel='whatsapp'`; owner only learns of order if customer opens a popup-blockable `wa.me` link | Critical | M | YES | ENG |
| CF-06 | PRD-F03, FLOW-1, DSN-8 | Admin | No admin UI — EFT confirm, status changes, refunds = hand-edited Supabase rows; `ADMIN_SETUP_GUIDE.md` documents non-existent routes | Critical | M | YES | ENG |
| CF-17 | TRD-02 | Deps | `next@16.3.6` has 5 high advisories (incl. image-optimization SSRF) — fix = `next@≥16.3.8` | High | M | YES | ENG |
| CF-33 | TRD-00/01 | Infra | No CI/CD — nothing gates lint/typecheck/test/build; fixes sat uncommitted 2 weeks | High | M | YES | OPS |
| CF-34 | PRD-F27, TRD | Infra | No error tracking, uptime checks, alerting — `console.*` only | High | M | YES | OPS |
| CF-40 | PRD-F17 | Sec | Upstash rate-limit + Turnstile silently skip when env unset — prod state UNKNOWN; could be running undefended | Medium | M | YES | OPS |
| CF-59 | PRD-F25 | Sec | No CSP / HSTS / X-Content-Type-Options; only order-confirmed sets Referrer-Policy | Medium | S | No | ENG |
| CF-60 | TRD, FEAT-5, GAP-008 | Compliance | POPIA gaps: 90-day PII cron covers stale `submitted` orders only (misses address fields on paid orders); no export/delete self-service despite privacy-page promises | Medium | S | No | ENG |
| CF-78 | GAP-028 | Sec | No rate limits on auth actions (login/signup/reset); no MFA for admin role — credential-stuffing surface grows when `/admin` ships | Medium | S | Before /admin widely used | ENG |

## B. Revenue integrity & commerce logic

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-12 | PRD-F04, AA-18 | Compliance | Fabricated ratings (4.6–5.0★, 99–780 reviews) rendered per product — SA CPA/ASA misleading-advertising exposure | High | M | YES | ENG + owner decision |
| CF-13 | PRD-F05, UX-19 | Checkout | No delivery/shipping fee, zone or option anywhere — totals exclude delivery for a delivery+install business | High | M | YES (decision) | PM + ENG |
| CF-14 | PRD-F06 | Tax | No VAT line, no tax invoice; likely VAT vendor selling R10k+ items | High | M | YES (decision) | EXT-TAX + ENG |
| CF-15 | PRD-F07, AA-11 | Inventory | `stock_count` never decremented; qty>stock orders succeed (`is_sold_out` only); oversell by design, undisclosed | High | S | Policy first | ENG |
| CF-16 | PRD-F08, FLOW-7 | Orders | No fulfilment lifecycle — `completed` = paid not delivered; no shipped/delivered/tracking; customer has no post-payment visibility | High | S | Partial | ENG |
| CF-35 | PRD-F09 | Orders | Refund/cancel enum values exist, no writer, no flow | Medium | S | No | ENG |
| CF-36 | PRD-F12 | Checkout | Email optional but email is only persistent channel — WhatsApp-only orders can orphan (link lost = banking details lost) | Medium | S | No | ENG |
| CF-37 | PRD-F13 | Pricing | `/deals` prices ≠ checkout price (catalog); "Save X%" claims unmet | Medium | S | Decision | PM |
| CF-38 | PRD-F14 | Data | `orders.items` JSONB duplicates `order_items`; parity unenforced; two readers | Medium | C | No | ENG |
| CF-39 | PRD-F16, AA-§4 | Schema | Duplicate variant systems; conflicting parent-delete FK (CASCADE vs SET NULL) — prod state UNKNOWN | Medium | M (verify) | Verify | OPS |
| CF-43 | FLOW-DE4 | Payments | Failed/cancelled Payfast: no retry button; `clearCart()` before redirect loses cart on failure | Medium | S | Payfast gate | ENG |
| CF-44 | FLOW-DE6 | Checkout | Idempotency key regenerated per submit click — back+resubmit creates duplicate orders | Medium | M | YES | ENG |
| CF-45 | FLOW-DE7 | Orders | `expires_at` 48h 404s confirmation page even for paid orders | Medium | S | No | ENG |
| CF-61 | FIX-apply-order, FEAT-7 | Payments | Payfast never sandbox-tested E2E; no email fires on payment success (ITN triggers none) | Medium | M before enabling Payfast | Payfast gate | ENG |
| CF-87 | GAP-013, TRD R-12 | Data | Order creation still non-atomic at DB level — compensating delete is best-effort (failures between order/items/payment leave orphans under races); roadmaps call for `create_order` RPC | Medium | S | No | ENG |
| CF-88 | FLOW-G-12, PRD-Q | Account | `orders.user_id` absent — order↔account link is email-string match; no claim-on-signup, no prefill, no saved addresses | Medium | S | No | ENG |
| CF-89 | FLOW roadmap 2.8 | Ops | No reconciliation job — stale `pending`/`processing` orders never alert the owner | Low | C | No | ENG |

## C. Chrome, navigation & discovery

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-07 | DSN-1, UX-3 | Layout | Footer exists only on `/` — zero trust/legal/contact links on every commerce page | Critical | M | YES | ENG |
| CF-08 | DSN-2, FLOW-DE1, DSN-04 | Links | ~15 dead routes linked from nav+footer (`/contact`, `/faq`, `/shipping`, `/returns`, `/book-installation`, `/categories/kits`, `/account/wishlist`…) | Critical | M | YES | ENG |
| CF-09 | DSN-3, FLOW-4 | Search | Dead search icon (desktop+mobile); no route/index — primary discovery path absent for 438 SKUs | Critical | M | YES | ENG |
| CF-10 | DSN-4, UX-24 | Auth | "Continue with Google" buttons on login/signup are dead | Critical | M | YES (or remove) | ENG |
| CF-18 | FLOW-DE2 | Account | OrderHistory "View Details"→404; "Invoice"/"Request Service" dead buttons; timeline shows states `mapStatus` can't emit | High | M | YES | ENG |
| CF-19 | FLOW-DE3 | Orders | `order-confirmed` uses `.single()` on `settings` — zero/duplicate rows silently hide EFT banking block → customer cannot pay | High | M | YES | ENG |
| CF-20 | FLOW-5, DSN-7 | Content | `/contact` 404s from ≥3 places; `wa.me/27000000000`/`tel:+27210000000` are placeholders; support emails unverified | High | M | YES | PM + ENG |
| CF-25 | DSN-6, FLOW-DE5 | PLP | Fake pagination (`1 2 3…10` dead buttons); all 194 parents render in one wall | High | M | YES | ENG |
| CF-26 | DSN-7, UX-27 | States | No loading states anywhere — zero `loading.tsx`/Skeleton/spinner | High | S | No | ENG |
| CF-31 | UX-17, DSN-4.4/4.5 | Checkout | No stepper/progress, raw `<select>`s, radio list for single provider, consent silently disables submit, no inline validation | High | S | No | ENG |
| CF-32 | DSN-4.7, UX-14 | CRO | Zero trust signals at cart/checkout (unused `/public/Payments logo/` exists); no delivery/returns info near CTA | High | S | No | ENG |
| CF-50 | UX-5/25, FLOW-DE9, DSN-04 | Account | `/account` index 404s; no account sub-nav — orders/profile/subs/warranties are orphan pages | Medium | M | YES | ENG |
| CF-54 | UX-21/22/23 | Post-purchase | order-confirmed outside shop chrome; expired link shows generic 404 (not "link expired"); no guest order-lookup | Medium | S | No | ENG |
| CF-11 | DSN-5, WCAG 2.2.2 | A11y | Hero carousel autoplays 5s, never pausable (`stopOn*: false`, no pause control) | Critical | M | YES | ENG |
| CF-27 | DSN-8 | A11y | CartDrawer = plain `<div>` — no `role=dialog`, focus trap, Escape, focus return | High | M | YES | ENG |
| CF-28 | DSN-9 | A11y | `#1C99D6` on white ≈3.0:1 fails AA both directions; `#9CA3AF` ≈2.5:1 | High | M | YES | DES/ENG |
| CF-55 | DSN-§5 | A11y | Zero `prefers-reduced-motion`; missing `aria-label`s on icon buttons; unicode `★☆` ratings; focus rings absent on raw controls | Medium | S | No | ENG |

## D. Design system & content

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-30 | DSN-tokens, DSN-3.1 | Tokens | 3 palettes / ~24 one-off hexes / ~1,651 hardcodes across ~60 files; brand ramp untokenized; Relume namespace conflicts | High | S | No (found.) | DES/ENG |
| CF-29 | DSN-10, tokens | Type | Three `!important` type systems (globals, `.homepage-typography`, PDP inline `<style>`); same h2 = 3 sizes | High | S | No | ENG |
| CF-46 | FLOW-DE10 | Content | FAQ promises PayJustNow/Mobicred financing + shipment-tracking emails — neither exists | Medium | M | YES | PM |
| CF-47 | DSN-3.4, comp-inv | Hygiene | ~17 verified dead components + dead `shop/Navbar.tsx`/`MobileMenu.tsx` + duplicate ProductCards | Medium | C | No | ENG |
| CF-48 | DSN-2.3/2.5 | Layout | 5 container widths, 5 radius systems, z-index collision (nav 60 vs backdrop 60), `pt-[220px]` magic offsets | Medium | C | No | ENG |
| CF-49 | DSN-4.8, UX-16/31/33 | Mobile | 36px touch targets; `pt-[220px]` dead space on mobile cart/checkout; summary below entire form | Medium | S | No | ENG |
| CF-51 | UX-6 | UX | Breadcrumbs: PDP real component vs PLP hand-rolled vs none elsewhere | Medium | C | No | ENG |
| CF-52 | UX-7 | UX | FilterSidebar auto-injects BTU params (URL self-mutates); price slider caps R50k < catalog max; no applied-filter chips | Medium | C | No | ENG |
| CF-53 | UX-12 | UX | Variant chip does full `router.push` navigation (slow, resets scroll) | Medium | C | No | ENG |
| CF-62 | PRD-F15 | Data | Integer-rand money model — no cents possible | Low | W (document) | No | — |
| CF-63 | PRD-F20 | Cart | Stale localStorage carts fail only at checkout | Low | C | No | ENG |
| CF-64 | PRD-F21 | Code | `useCart` returns silent NOOP outside provider | Low | C | No | ENG |
| CF-65 | PRD-F22 | Data | Commercial boundary `>=32000` (chips) vs `>=32001` (filterProducts) — 32k BTU double-counted | Low | C | No | ENG |
| CF-66 | PRD-F24, TRD-02 | Hygiene | Dead files (`mock-data.ts`, `mock-products.ts`), `.env.local.backup` plaintext on disk, stray `nul` file, stale `ADMIN_SETUP_GUIDE.md`, pnpm/npm ambiguity, no `engines` | Low | S | No | ENG |
| CF-68 | TRD-02, AA-§3 | Env | No `.env.example`; prod env vars UNKNOWN; gtag/GTM loader not found in code — `generate_lead` may never fire | Low→Med | M (verify) | Verify | OPS |

## E. Growth, analytics & SEO

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-21 | PRD-F11, FLOW-6 | Growth | Newsletter + deal-alert forms fake success, persist nothing | High | S | No | ENG |
| CF-22 | PRD-F10, FLOW-8 | Account | `/account/subscriptions` + `/account/warranties` render hardcoded mock data to signed-in users | High | M | YES | ENG |
| CF-23 | FLOW-9 | Growth | `promotions.code` displayed but never consumable; `discount_total_zar` column unused | High | C | No | ENG |
| CF-24 | FLOW-10 | Checkout | Guest-only checkout; no prefill for logged-in users; order↔account link is fragile email-string match | High | S | No | ENG |
| CF-41 | PRD-F18, FLOW | Analytics | `generate_lead` fires on unpaid order mount; no view_item/add_to_cart/begin_checkout/purchase; refunds untracked | Medium | S | No | ENG |
| CF-42 | PRD-F19, AA-23 | SEO | Sitemap lists all 438 slugs incl. near-duplicate variants; `/categories/*`+`/collections/*` missing; category slugs soft-404 (no `notFound()`) | Medium | S | No | ENG |

## F. Quality & reliability

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-56 | PRD-F26, DSN-2.7 | Media | Raw `<img>` in ~15 files; Supabase storage host not verified in `next/image` remote config; `/public/Hero Images/` path has a literal space; 38MB public dir | Medium | S | No | ENG |
| CF-57 | TRD, FEAT-9 | Perf | `force-dynamic` + cookie-bound clients = full SSR every request; no caching/ISR strategy; no CWV measurement | Medium | S | No | ENG |
| CF-58 | PRD-F23, FEAT-11 | QA | 13 tests re-implement `generateSignature`/`normalizePhone` inline — zero regression protection on real code; no e2e/integration | Medium | M | YES | ENG |
| CF-69 | FEAT-7 | Notify | No payment-success/status/shipping emails; minimal unbranded templates; SPF/DKIM unverified | Medium | S | No | ENG |
| CF-70 | DSN-4.3 | UX | Nav links 10px; oversized 128px header; mega-menu machinery dormant | Medium | C | No | ENG |

## G. Business, legal & operational context (Background audit — new)

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-72 | BG-F-04 | Legal | **Legal entity name/reg no./VAT no./address undisclosed anywhere** — ECTA s43 supplier-disclosure breach territory; terms may be unenforceable; can't issue compliant invoices | High | M | YES (data-gated) | PM + ENG |
| CF-73 | BG-F-10, BG-F-18 | Legal | Terms dated Jan 2025 (predates build, provenance unknown); **promise 50% deposit while checkout charges full amount** — contract/product contradiction | Medium | M | YES | PM + EXT-LEGAL |
| CF-74 | BG-F-13, GAP-030 | Email | Resend sender domain `aircons-store.co.za` ≠ site domain `airconsstore.co.za` — deliverability failure / phishing look-alike; SPF/DKIM/DMARC unverified | Medium | M | Verify W0 | OPS |
| CF-75 | BG-F-17 | Admin | **An admin panel was built ~June 30 then deleted** (`src/app/admin` removed; `nextadmin-template` abandoned; two restore/backup branches exist) — intent unknown; lost tooling may be recoverable | Medium | M (decision) | Informs S-02.3 approach | PM |
| CF-79 | BG-F-20 | Legal | "Accredited installation" claim unverified — installers working with refrigerants must be SAQCC-gas registered in SA; claim unsupported as-is | Medium | S | No (soften copy) | PM |
| CF-80 | BG-legal-06 | Legal | ECTA s44 7-day cooling-off not addressed in policies; POPIA Information Officer + PAIA manual absent | Medium | S | No | PM + EXT-LEGAL |
| CF-83 | BG-F-24 | Legal | No standalone shipping policy or cookie policy pages (banner only) | Medium | M | Folded into S-04.2 | ENG |
| CF-85 | BG-08, FLOW-G | Pricing | Dead pricing fields: `settings.free_shipping_threshold_zar` and `orders.discount_total_zar` exist but are never wired — half-built shipping/coupon features | Low | S | Informs S-05.4/S-10.2 | ENG |
| CF-84 | BG-F-26 | Docs | README is create-next-app boilerplate; `ADMIN_SETUP_GUIDE.md`/`AUDIT_REPORT.md` stale | Low | C | No | ENG |
| CF-90 | BG-F-16 | Ops | Real business WhatsApp = `+27767100588` (migration) — placeholders elsewhere must be swept to this/verified value | Info | M | Feeds S-04.8 | PM |

## H. Additional design/flow gaps absorbed from completed audits

| CF | Source | Area | Finding | Sev | MoSCoW | Blocks launch? | Owner |
|----|--------|------|---------|-----|--------|----------------|-------|
| CF-82 | DSN-G-31 | A11y | Two h1s on PLP; no skip link | Low | C | No | ENG |
| CF-86 | DSN-G-17 | UX | Sonner `Toaster` mounted but **zero `toast()` calls** — free feedback channel unused | Low | C | No | ENG |

## Findings verified FIXED in worktree (no action — regression-guard only)

Per `PRD` "Previously fixed" table + `FIX` items 1–22, all confirmed present in the working tree
on 2026-10-09: next@16.3.6 RCE patch · ITN layered verification · `markWhatsAppSent` token gate ·
compensating order delete · server-derived install tier · deal→product CTA · UUID extraction in
recommendations · edge-fn HTML-escape + fail-closed · `/collections/[slug]` · real 404s ·
pending-EFT expiry exemption · `generate_lead` dedup+transaction_id · sold-out rejection ·
metadata/robots/BTU-boundary/`.maybeSingle()`/error-mapping fixes.

> ⚠️ These are fixed **in the worktree only** until CF-01 (commit+deploy) lands.

## Cross-cutting unknowns (verification tasks — all fold into Phase 0/1 spikes)

| U# | Unknown | Source | Verify via |
|----|---------|--------|-----------|
| U-01 | Was `20260925_audit_hardening.sql` applied in prod? | PRD-F01 | Supabase dashboard: `SELECT * FROM orders` as anon → expect permission denied |
| U-02 | Prod env vars: `PAYFAST_*`, `UPSTASH_*`, `TURNSTILE_*`, `RESEND_*`, `NEXT_PUBLIC_SITE_URL`, `GTM/GA` | AA-§10 | Vercel dashboard env page |
| U-03 | Which variant FK exists in prod (CASCADE vs SET NULL)? | PRD-F16 | `pg_constraint` query |
| U-04 | Does gtag/GTM actually load? (events pushed, no loader found) | AA-§2, CF-68 | View-source live site / GTM preview |
| U-05 | Live `payment_providers.is_enabled` (Payfast off?) | FLOW-§6 | Supabase dashboard |
| U-06 | Which code does prod run — HEAD or worktree? | TRD-00 | Deploy hook / Vercel deployment diff |
| U-07 | `settings` row count (`.single()` hazard, CF-19) | FLOW-DE3 | `SELECT count(*) FROM settings` |
| U-08 | SPF/DKIM/DMARC on sending domain | FEAT-7 | DNS lookup |
| U-09 | `node` version + package manager on Vercel; lockfile drift | TRD-02 | Vercel project settings |
