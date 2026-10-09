# 09 — Content Design Audit

## Voice & tone

Prevailing register: **plain, functional, slightly formal** — "Complete your order securely. No account required." / "Optional extras for your unit." No documented voice (MISSING). Tone is consistent enough *within* commerce surfaces but homepage marketing copy drifts generic ("Taking care of your comfort is essential for a healthy home and office environment. A consistent air conditioning routine that includes cooling, heating, and maintenance." — ends mid-thought, `ProductsClient.tsx:151`).

## Naming inconsistency

| Surface | Rendering |
|---|---|
| metadata title | "Aircons Store — Air Conditioning Sales, Installation & Repairs" |
| footer/dead nav | "Aircons Store" |
| login card | "**Airconsstore**" (one word — looks like a typo) |
| mobile drawer | "AIRCONS STORE" |
| cookie key | `airconsstore_cookie_consent` |
Standardise to **"Aircons Store"** (or decide the brand is "AirconsStore" and change metadata accordingly) — High content bug.

## CTA label audit

| Label | Where | Problem |
|---|---|---|
| "Shop Now" | hero, PLP hero → `#products-grid` anchor | ok |
| "Get a Quote" | PLP hero → `/checkout` | **misleading** — it's the checkout, not a quote form; with empty cart lands on "Your cart is empty" |
| "Checkout" | cart drawer, cart page | ok |
| "Place order" | checkout submit (EFT) | ok |
| "Pay securely" | checkout (payfast path) | ok, but payfast is disabled in DB — label rarely shown |
| "Continue Shopping" / "Continue shopping" | drawer vs cart page | casing inconsistency |
| "Browse Products" | empty states, 404 | ok |
| "Try Again" / "Go Home" | error.tsx | ok |
| "Pay securely via Payfast" | order-confirmed pending | ok |

## Error & empty-state copy

- Error banner = raw server string in red — generic ("Something went wrong"), no recovery hint.
- Empty cart: "Start adding products to request a quote" — mixes metaphors (cart ≠ quote) since checkout is an order flow with EFT payment.
- Filter empty: "No products found matching your filters." ✓
- 404: "does not exist or has been moved" ✓ standard.
- Order-link expiry → generic 404 — should say the link expired (content + UX issue).
- Order-confirmed copy is the strongest: payment-specific messages per status. ✓

## Trust & legal copy

- Consent text: "I consent to Aircons Store processing my details to fulfil this order. I have read the Privacy Policy." ✓ links to `/privacy`.
- `/privacy`, `/terms`, `/return-policy`, `/warranty` pages exist.
- Footer links `/cookies`, `/faq`, `/shipping`, `/returns`, `/contact`, `/blog`, `/brands` → all 404. Either write these pages or remove the links.
- Footer contact: `+27 21 000 0000` (**placeholder**), `hello@airconsstore.co.za` [ASSUMPTION real], "Cape Town, South Africa".

## Email/system templates — MISSING (not in repo)

Order confirmation is web-page + WhatsApp; no email templates found. If `channel` includes email, emails presumably sent via Supabase/edge fn — verify template exists elsewhere [OPEN QUESTION].

## Product content

- Product names cleaned of brand prefix for h1 (nice touch).
- Description bullets auto-derived (BTU, coverage, inverter, brand) — functional but repetitive across cards.
- `m²` and `BTU` formatting consistent.

## Microcopy gaps

- No delivery-cost copy anywhere.
- No returns summary near Add-to-Cart.
- "Price TBC" is terse — "We'll confirm the price" would be friendlier.
- Newsletter success "Thanks for subscribing!" lies (no backend).

## Severity summary

- Brand-name inconsistency: **High**
- Dead-link content (faq/shipping/returns/contact): **Critical** (overlaps nav finding)
- Placeholder contact info: **High**
- Fake newsletter: **Medium**
- CTA/empty-state inconsistencies: **Medium**
