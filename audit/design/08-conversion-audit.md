# 08 — Conversion (CRO) Audit

Context: high-consideration purchases (R8k–R45k) + attached services (installation, kits, maintenance, warranty) in the South African market. Guest checkout + WhatsApp are well-chosen for this audience.

## Funnel map (as-is)

```mermaid
flowchart LR
  H[Home<br/>hero + carousels] --> PLP[/products<br/>filters + wall of cards]
  NAV[Nav 10px links<br/>dead search] --> PLP
  PLP --> PDP[/products/slug<br/>variant+add-on configurator]
  PDP -->|Add to cart| DR[CartDrawer<br/>+ recommendations]
  DR --> CO[/checkout<br/>single page form]
  CT[/cart page] --> CO
  CO -->|manual_eft| OC[/order-confirmed/token<br/>EFT details + WhatsApp]
  CO -->|payfast disabled| OC
  style NAV fill:#ef4444,color:#fff
```

## What's working (keep)

1. **Guest-first checkout** — "No account required" stated upfront. ✓
2. **Server-resolved pricing** with honest note ("Final total is calculated securely…") — trust-positive.
3. **Line-item transparency** — subtotal/installation/kit/maintenance/warranty rows in cart AND checkout AND confirmation. Rarely done this well.
4. **WhatsApp as first-class contact channel** — correct for ZA market; continues post-order.
5. **Cart drawer with recommendations** — classic AOV lever, already built.
6. **PDP configurator** — installation tier auto-select by BTU, kit modal, maintenance modal, warranty selector; upsell architecture most stores don't have.
7. **Low-stock urgency** ("Only N left") + sold-out chips; deals countdown timers.
8. **Enquiry-only path** for commercial ("Price TBC") — sensible for B2B.

## Conversion killers

| # | Issue | Evidence | Impact |
|---|---|---|---|
| C1 | **No shipping/delivery information anywhere** | footer "Shipping & Delivery" → `/shipping` 404; checkout has no delivery-cost line; PDP has `shipping_summary` field (partially used) | For appliances, unknown delivery cost = #1 abandonment trigger. **Critical** |
| C2 | **Dead search** | nav icon does nothing | Can't find product → bounce. **Critical** |
| C3 | **~15 chrome links → 404** | footer/nav | Every 404 after clicking "Returns"/"FAQ" erodes trust at decision time. **Critical** |
| C4 | **No footer on commerce pages** | only homepage has footer | No contact/payment/legal reassurance at checkout. **High** |
| C5 | **Checkout has zero trust elements** | `CheckoutClient.tsx` — no payment logos (`/public/Payments logo/` unused), no security copy beyond one word, no returns link, no phone | **High** |
| C6 | **Fake pagination** | `ProductsClient.tsx:298-318` | Browse depth stops at first scroll; engagement metrics will lie. **High** |
| C7 | **Dead Google OAuth buttons** | login/signup | Broken promise on auth wall → distrust + abandonment. **High** |
| C8 | **PLP "Get a Quote" CTA → `/checkout`** | `ProductsClient.tsx:169` | Sends users with empty carts to an "empty cart" page — dead-end CTA. **Medium** |
| C9 | **Consent checkbox silently gates submit** | `CheckoutClient.tsx:301` | Disabled button with no explanation → "why can't I click" friction. **Medium** |
| C10 | **No financing/installment messaging** | none found | R30k purchases typically need "from RX/month" (PayJustNow/Mobicred/Payflex). **Medium — big AOV lever** |
| C11 | **Order summary lacks images/delivery info** | `CheckoutClient.tsx:318-334` | Weak recap at money-moment. **Medium** |
| C12 | **No reviews on PDP** | rating shown in header (if data), but no review list/section on PDP | Social proof isolated to homepage. **Medium** |
| C13 | **Fake newsletter** | `premium-footer.tsx:87-94` | Collects emails into the void — dark-pattern optics + lost list growth. **Medium** |
| C14 | **Placeholder phone** | `+27 21 000 0000` | Trust hole on the only page with a footer. **Medium** |
| C15 | **No save-for-later / wishlist** | linked in dead nav only | Long-consideration items need revisit capture. **Medium** |

## Quick-win CRO list (P0/P1)

1. Global footer + kill dead links → recovers trust at every step.
2. Search that works (even simple ILIKE over name/brand/BTU).
3. Delivery-cost line in checkout summary (even "Calculated after order" is better than silence) + `/shipping` + `/returns` pages.
4. Payment logos + EFT explanation block on checkout sidebar.
5. Fix/remove Google buttons; remove dead pagination or make it real.
6. Skeleton loading on PLP/PDP transitions.
7. "From R X/month" installment line on PDP price block [requires provider].

## Metrics wiring status

`LeadTracking` component fires on order-confirmed (purchase event ✓). No other analytics events found in components (no view_item, add_to_cart, begin_checkout tracking visible in audited files [ASSUMPTION: may exist in lib — verify]).
