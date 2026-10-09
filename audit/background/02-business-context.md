# 02 — Business Context

## What exists vs. what's missing

| Attribute | Status | Evidence |
|---|---|---|
| Legal entity name | **UNKNOWN — needs founder confirmation** | No Pty/reg no./VAT no. anywhere in repo |
| Trading name | "Aircons Store" (also styled "airconsstore" on terms page) | `layout.tsx`, `terms/page.tsx` |
| Jurisdiction | South Africa — Western Cape / Cape Town named | `terms/page.tsx` §6, contact blocks |
| Business model | B2C / D2C ecommerce + services (installation, maintenance, repairs) | Site structure: `/products`, `/installation`, `/maintenance`, `/repairs`, `/warranty` |
| Revenue model | One-time product sales + installation fees + kits + maintenance plans + extended warranties | `server-pricing.ts` resolves: product + `installation_total_zar` + `kit_total_zar` + `maintenance_total_zar` + `warranty_total_zar` |
| Currency | ZAR only; integer-rand money model | `Intl.NumberFormat("en-ZA", {currency:"ZAR"})` across lib/emails |
| Geography | Claims "nationwide delivery" (about page); contact anchors Cape Town | `about/page.tsx`, `terms/page.tsx` |
| Stage | Launched but early / pre-scale — real checkout live, core ops manual | Live Supabase project, real WhatsApp, orders flowing; no admin UI |
| Funding / runway | UNKNOWN — ASSUMED bootstrapped (solo founder, AI-built, lean stack) | No evidence of investors |
| KPIs tracked | `generate_lead` conversion (GA4/GTM) only — business intent = lead generation | `LeadTracking.tsx`, `ECOMMERCE_FIX_PLAN.md` #12 |
| Tax regions | ZA only; **no VAT/tax computation implemented** | Code search; prior audit |
| Shipping regions | Address fields collected; no zones/rates table | `orders` delivery fields, `settings.free_shipping_threshold_zar` (unused?) |

## Business model analysis

The site presents as a full ecommerce store but **operates economically as a quote/lead engine**:

- Order = "checkout request" (edge function language: "New checkout request").
- Payment = manual EFT against banking details shown post-order; Payfast exists but disabled.
- Primary contact channel is WhatsApp — the CTA is literally a `wa.me` deep link with a pre-composed order message.
- Owner email notification per order via Resend.

INFERRED: this is a **service business (aircon sales + installation company) that added a web storefront**, not a pure online retailer — installation, maintenance plans, repairs, and warranty services all imply a physical installer network, and the 50%-deposit terms read like a trades business, not an etailer.

## Key business goals (evidence-based)

1. **Generate leads/orders online** — `generate_lead` is the only tracked conversion.
2. **Sell units + installation as a bundle** — every product page offers installation tiers, kits, maintenance, warranty add-ons.
3. **Winter/deal promotions** — `/deals` page with countdowns, "% saved" badges, stock urgency.
4. **Build trust** — brand logos, warranty messaging, (fabricated) ratings, Trustpilot assets staged.

## Missing / needs founder confirmation

- Entity name, reg no., VAT vendor status, B-BBEE status.
- Whether the business is a sole proprietor, Pty Ltd, or trading-as.
- Delivery zones and whether "nationwide" is literal.
- Installer network: employed vs subcontracted; SAIRAC/SARACCA gas-handling registration status (legally required to work with refrigerants in SA — INFERRED concern).
- Payment terms reality vs. terms page (terms say 50% deposit for installations; checkout collects full amount — INFERRED inconsistency).
- Insurance (public liability for installations).
