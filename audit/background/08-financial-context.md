# 08 — Financial Context

## Payment providers & accounts

| Provider | Status | Evidence |
|---|---|---|
| Manual EFT | **Enabled** | `payment_providers` table; banking details served from `settings` (bank_name, account_name, account_number, branch_code, reference_prefix) |
| Payfast | Implemented, **disabled in DB**, defaults `PAYFAST_MODE=sandbox` | `src/lib/payment/payfast.ts`; merchant ID/key/passphrase env vars |
| Card/PayShap/SnapScan/other | Not implemented | — |

- Currency: **ZAR only**, integer rand (no cents). Settlement: EFT → the business bank account in `settings`; Payfast settles to merchant account (account exists? UNKNOWN — creds in env, disabled in DB).
- Bank details exposure is acceptable only because order-confirmed is token-gated — but banking details sit in `settings` which was world-readable until `20260925` migration (verify applied).

## Pricing structure (server-resolved totals)

`total = products_subtotal + installation_total + kit_total + maintenance_total + warranty_total`

- Installation tier priced by BTU band (server-derived from `btu_range`; client-supplied tier id only honoured if it matches derived).
- Maintenance plans, warranty options, kit config — DB tables with hardcoded fallbacks if DB unreachable.
- **No shipping/delivery fee line** — material margin risk on heavy units.
- `settings.free_shipping_threshold_zar` exists but is not wired into totals (INFERRED dead field).

## Discount strategy

- `is_sale`/`is_deal` flags + `/deals` page with "% saved" and countdowns.
- **No coupon/discount-code system** — no table, no checkout field.
- Deal display price ≠ charged price (unresolved inconsistency).

## Tax handling

- **None.** No VAT calculation, no tax-inclusive/exclusive handling, no tax invoices. If business is a VAT vendor this is non-compliant — needs founder confirmation of VAT status.

## Refund handling

- Policy language only; no refund flow, statuses, or provider refund integration. EFT refunds = manual bank reversal; Payfast refunds unimplemented.

## Chargeback history

- UNKNOWN — card payments not live; EFT has no chargebacks by design (a benefit of the current model).

## Financial red flags

1. Orders can be confirmed "paid" only by manual DB edit — no reconciliation trail.
2. No shipping fee → every order potentially under-priced.
3. No tax invoices → VAT/vendor compliance gap.
4. Terms promise 50% deposit; checkout collects/expects full amount.
5. `ORDER_WEBHOOK_SECRET` + Payfast env creds handling — secrets rotation needed.
6. Fake ratings could constitute misleading pricing-adjacent conduct (returns/refund claims).
