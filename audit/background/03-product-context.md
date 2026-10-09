# 03 — Product Context

## What the product sells

| Category | Evidence | Notes |
|---|---|---|
| Air conditioners (wall split, cassette, ducted, portable, commercial) | `products` table, 438 published / 194 parents + 244 variants | Brands: Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York |
| Installation kits | `installation_kit_config` table (20260820), `kit_configuration` order field | Copper piping etc., sold per install |
| Installation service | `installation_tiers` table — BTU-banded pricing | Server derives tier from product `btu_range` |
| Maintenance plans | `maintenance_plan_config` table (20260811); `/maintenance` page | One-off Service / Annual Care / Bi-Annual Care |
| Extended warranties | `warranty_config` table (20260822); `/warranty` page | register / extend / claim flow described |
| Deals / promotions | `deals`, `promotions`, `page_heroes`, `collections` tables | Seasonal specials (winter) |

## Catalog model

- **Parent–child variants** in one `products` table: `is_parent_product`, `parent_product_id`, `variant_attributes` JSONB (btu, phase, model…).
- Variant selectors rendered dynamically; BTU surfaced as "Available Sizes".
- `is_published`, `is_sale`, `is_deal`, `btu_range`, `stock_count`, `is_sold_out`, SEO fields, `display_name`.
- `collections` table for curated groupings.

## Supply side — UNKNOWN

- Suppliers / distributors / dropship partners: **UNKNOWN — needs founder confirmation**. Sells eight OEM brands → INFERRED reseller via distributors (e.g., typical SA aircon wholesalers), but nothing documents this.
- Inventory model: **UNKNOWN** — stocked vs order-on-demand. `stock_count` exists but is never decremented → treated as cosmetic.
- Product images: mix of local brand-specific image mappings and Unsplash remote images (`next.config.ts` allowlist) — INFERRED: not all photography is licensed/owned.
- Pricing strategy: catalog ZAR prices; deals show a deal price that checkout does NOT honour (checkout re-resolves catalog price) — pricing consistency unresolved.

## Value proposition (as presented to customers)

From copy: right-size advice, accredited/professional installation, trusted brands, nationwide delivery, warranty support. Differentiator = **product + install bundle** rather than box-shifting.

## Origin story

UNKNOWN — needs founder confirmation. INFERRED: founded by "Sim" (commit author simbachivas98@gmail.com) as a digital storefront for an SA air-conditioning sales/install venture; built mid-2026 with AI tooling.

## Competitive landscape

Not documented. SA comparables (external knowledge, not repo evidence): Builders/Makro aircon categories, Aircon Hyper, Airconditioning Online, Takealot — ASSUMED competitors; needs founder's own positioning view.
