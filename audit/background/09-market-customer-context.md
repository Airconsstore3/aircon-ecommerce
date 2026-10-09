# 09 — Market & Customer Context

## Target market

- **Geography**: South Africa; Cape Town anchored in contact blocks but "nationwide delivery" claimed.
- **Segments implied by catalog**: residential homeowners (wall splits 9–24k BTU) and commercial buyers (cassette/ducted, ≥40k BTU commercial category). `/categories/residential|commercial|portable` routes.
- WhatsApp-first + phone-number-primary identity → INFERRED market expectation: mobile-first SA shoppers who transact over WhatsApp, consistent with informal-trade ecommerce norms in ZA.

## Customer personas (evidence is thin — mostly INFERRED from copy)

| Persona | Evidence |
|---|---|
| Homeowner buying first/replacement split unit + install | Hero copy, installation tiers by BTU, "advice based on your space" |
| Small business / office fit-out | Commercial category, "office" testimonial |
| Existing owner needing maintenance/repair | `/maintenance`, `/repairs`, warranty register/claim |
| Deal-seeker | `/deals` with urgency mechanics, winter specials |

## Customer journey (as built)

1. Land on hero/brand carousel → browse categories/filters (brand, BTU, price, type).
2. Product page: variant selectors (BTU sizes, attributes), installation tier picker, kit config, maintenance plan, warranty add-ons, fake ratings.
3. Add to cart (localStorage) → cart drawer → checkout (guest).
4. Checkout: name/phone/email/address/notes + channel choice + payment method (EFT/Payfast) + consent.
5. Confirmation page: banking details (EFT) or Payfast redirect + WhatsApp deep link.
6. Optional account signup → order history at `/account/orders`.

## Acquisition channels (as implemented)

- SEO: metadata, JSON-LD products, sitemap (all products), canonical, robots.
- Google Ads + GA4 via consent-gated GTM (`generate_lead` conversion with hashed identifiers — INFERRED paid-search intent).
- Organic social: footer social links (verify live URLs).
- Trustpilot assets staged — intent to leverage review platform.

## Retention

- Maintenance plans (Annual/Bi-Annual Care) = recurring-service retention hook.
- Customer accounts + order history (real since Sept 18); contact-method preference stored.
- Newsletter capture dead → no email retention loop today.

## Social proof

- **Currently fabricated**: per-product star ratings + counts (deterministic), hardcoded `/about` testimonials. Trustpilot logos present but no live integration. **This is the single biggest market-facing integrity gap.**

## Competitor analysis

Not documented in repo. ASSUMED comparables: national retailers (Makro/Builders/Takealot) and specialist ZA aircon etailers. Differentiation claimed: advice + accredited installation + warranty support (service-led, not price-led).
