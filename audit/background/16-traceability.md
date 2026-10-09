# 16 — Traceability: Background → Downstream Documents

How each background area constrains/informs the PRD, TRD, App Flow, and Design Brief.

## Background → PRD

| Background fact | PRD implication |
|---|---|
| Lead-gen economics (WhatsApp + manual EFT) | "Order" = lead; success metric = qualified lead, not paid transaction. PRD should frame checkout as lead capture with optional payment, unless strategy changes |
| Solo operator, no admin UI | Every feature must assume zero back-office staffing; PRD priorities: order management panel > new customer features |
| ZA-only, ZAR-only, WhatsApp-first | Localization scope = en-ZA only; mobile-first; no i18n framework needed |
| Missing: shipping fees, tax, refunds, inventory | PRD scope decisions required — either implement or explicitly position "confirm availability & final price" |
| Fake ratings live | PRD must decide: remove vs build real reviews (compliance-driven decision, not feature preference) |
| Deal/price inconsistency | Pricing policy decision needed before any deals feature work |

## Background → TRD

| Background fact | TRD implication |
|---|---|
| Vercel + Supabase-only architecture, service-role writes | No additional backend services justified; stay in-server |
| Provider registry pattern (registry.ts/providers split) | New payment/notification providers must follow registry pattern |
| Secrets in env; webhook secret in git history | TRD needs secrets-management + rotation section before Payfast go-live |
| 48h token expiry + EFT exemption | Any order-status/fulfilment feature must respect token-gated reads |
| Inventory cosmetic | If stock enforcement is added, must add decrement + reservation + reconciliation invariants |
| Orders schema channel-status model | Fulfilment requires new status enum values + migration path |
| `admins` table exists | Admin panel rebuild should reuse `admins` membership for authz |

## Background → App Flow

| Background fact | Flow implication |
|---|---|
| Guest-only checkout, phone-primary | Keep guest path primary; account is post-purchase upsell, not a gate |
| WhatsApp deep-link flow (`wa.me` + `markWhatsAppSent`) | Confirmation page must preserve WhatsApp CTA; status transitions hinge on customer opening WhatsApp |
| EFT banking details on confirmation page | Flow ends in "awaiting payment" — needs follow-up/reminder flow design |
| Dead forms (newsletter, maintenance booking, warranty claim) | Flows either complete to backend or get removed — no half-flows |
| `/repairs`, `/maintenance` are lead pages | Route them into the same order/enquiry pipeline as products |
| 48h link expiry | Customer-facing messaging must communicate expiry + EFT exception |

## Background → Design Brief

| Background fact | Design implication |
|---|---|
| Brand: blue #1C99D6, Google Sans Flex + Poppins/Inter, "Aircons Store" wordmark, `public/` 288 assets incl. brand logos | Design brief should codify this existing system rather than restyle |
| WhatsApp-first audience | Mobile-first design; thumb-reach CTAs; WhatsApp green affordances |
| Trust deficit (fake reviews) | Design real trust surfaces: installer accreditation, warranty terms, genuine review capture |
| 8 OEM brands | PDP/category design must scale to brand-filtered browsing; logo carousel exists |
| Placeholder contacts | All contact blocks need real data before design freeze |
| Cape Town + nationwide | Footer/contact design should show service-area clarity |

## Conflicts needing resolution before downstream docs

1. Terms say 50% deposit; checkout charges full → pricing/flow decision.
2. "Checkout request" vs "order" vs "sale" → legal/UX naming decision.
3. Deal price vs charged price → pricing policy.
4. "Accredited installation" claim vs unverified installer network → marketing/legal.
5. No shipping fees vs heavy goods → unit economics.
