# 13 — Glossary

| Term | Definition (as used in this system) | Where used | Consistency issues |
|---|---|---|---|
| Aircon | Air-conditioning unit | UI copy, code | — |
| BTU | Cooling capacity (British Thermal Units, ~×1000) — primary variant attribute ("sizes") | `btu_range`, `available_btu_sizes`, PDP | Rendered as "Available Sizes"; residential/commercial boundary (32k–40k BTU gap) was a bug fixed in fix-plan #21 |
| Parent product | `products` row with `is_parent_product=true`; owns shared description/images | Variant system | — |
| Variant | `products` row with `parent_product_id` set; carries `variant_attributes` JSONB | Variant system | `variant_id` never populated on order_items |
| SKU | Not a first-class field — products identified by `id`/slug/model | — | No SKU concept; model number implicit in name/attrs |
| Checkout request | What customers submit; stored as `orders` row | Edge fn, privacy page | Also called "order"/"quote request" — legal ambiguity whether a binding sale is formed |
| Order | `orders` row with items, totals, `secure_token`, statuses | Checkout flow | Status enum is channel-state not fulfilment-state |
| Secure token | UUID gating read access to an order's confirmation page | `orders.secure_token` | — |
| Channel | Customer contact preference: whatsapp / email / both | `orders.channel` | — |
| Manual EFT | Enabled payment method; customer does bank transfer; owner marks paid manually | `payment_providers`, settings bank_* | No reconciliation automation |
| Payfast | ZA payment gateway; ITN webhook confirms payment | `src/lib/payment/payfast.ts` | Implemented but disabled in DB |
| ITN | Payfast "Instant Transaction Notification" — server-to-server webhook | `api/payfast/itn` | — |
| Installation tier | BTU-banded install price from `installation_tiers` | Product configurator, server pricing | Server derives tier from `btu_range`; client tier id advisory only |
| Installation kit | Physical install materials (copper piping etc.) from `installation_kit_config` | Product configurator | — |
| Maintenance plan | Recurring service product (One-off / Annual / Bi-Annual) from `maintenance_plan_config` | Product configurator, `/maintenance` | `/account/subscriptions` mock page calls these "subscriptions" |
| Warranty | Extended warranty option from `warranty_config`; also workmanship warranty in terms | `/warranty`, configurator | Register/extend/claim described but workflow backend UNKNOWN |
| Deal | `deals` table entry with optional `product_id` link | `/deals` | Deal price ≠ checkout price |
| Promotion | `promotions` CMS blocks (banners) | CMS | Distinct from deals — overlapping concept |
| Collection | Curated product grouping (`collections` table) | `/collections/[slug]` | Not in sitemap |
| Page hero | `page_heroes` CMS row per `page_key` | CMS | — |
| Settings | Singleton `settings` row: store contact, WhatsApp, EFT bank details, announcement | Admin/dashboard | Was world-readable pre-20260925 |
| Admins | `admins` table of privileged `user_id`s | RLS policies | No management UI; membership UNKNOWN |
| Consent | Checkout processing consent + cookie consent (GCM default-denied) | Checkout, `CookieConsentBanner` | Two distinct consent concepts sharing a word |
| POPIA | SA Protection of Personal Information Act | Privacy page | Information Officer not named |
| CPA | Consumer Protection Act | Return policy | Fake reviews implicate s41 |
| ECTA | Electronic Communications & Transactions Act (s43 disclosures, s44 cooling-off) | — | Not explicitly addressed |
| Generate_lead | GA4/GTM conversion event fired on order-confirmed | `LeadTracking.tsx` | Only tracked conversion — defines "success" = lead, not paid order |
| Quote-only | Former badge on some products (removed July 2026) | Commit `e1f671b` | Historical |
| Service-role client | Supabase client bypassing RLS; server-only | `src/lib/supabase-service.ts` | Must never reach client bundles |
| pg_net | Postgres extension calling the order-email edge function on INSERT | `order_email_webhook` migration | Contains committed webhook secret |
