# Notification Matrix — current vs target

Legend: ✅ implemented · ⚠️ partial · ❌ missing · n/a not applicable

## Transactional emails

| Event | Customer | Owner | Evidence / gap |
|---|---|---|---|
| Order received (email channel) | ✅ "request received" | ✅ "new checkout request" | `order-email/index.ts:114-133` |
| Order received (whatsapp channel) | n/a (no email provided by design) | ❌ **skipped entirely** | `index.ts:107` — F-02 |
| Payment received (EFT confirm / ITN paid) | ❌ | n/a | no writer after manual/ITN update |
| Payment failed | ❌ | ❌ | confirmation page text only |
| Order confirmed/scheduled | ❌ | n/a | no fulfilment states |
| Order shipped/out-for-install | ❌ | n/a | no fulfilment |
| Order completed | ❌ | n/a | — |
| Order cancelled | ❌ | ❌ | — |
| Refund issued | ❌ | ❌ | no refund flow |
| Quote/enquiry received | ⚠️ same as order-received | ⚠️ | enquiry items ride same path |
| Service request received (maint/repair/warranty) | ❌ (fake forms) | ❌ | F-03 |
| Warranty claim update | ❌ | ❌ | — |
| Newsletter confirm/welcome | ❌ | n/a | F-08 |
| Deal alerts | ❌ | n/a | F-08 |
| Abandoned cart reminder | ❌ | n/a | no server cart |
| Back-in-stock alert | ❌ | n/a | — |
| Password reset / email verification / magic link | ✅ Supabase Auth | n/a | KEEP |
| Order stale-warning (pending EFT >Nd) | ❌ | ❌ | S-08 target |

## WhatsApp

| Event | Direction | Status | Evidence |
|---|---|---|---|
| Order details to business | customer → business wa.me | ⚠️ works only if customer opens link (popup-blockable, `CheckoutClient.tsx:137`) + stored `orders.whatsapp_url` on confirmation page | F-02 |
| Support chat | customer → business | ❌ placeholder numbers `27000000000`/`27210000000` | F-05 |
| Status updates | business → customer | ❌ none | — |

## SMS — ❌ none (acceptable at this scale; WhatsApp covers SA market)

## Push/in-app — ❌ none

## Analytics/conversion events (consent-gated)

| Event | Status |
|---|---|
| generate_lead on confirmation | ✅ deduped + transaction_id (`LeadTracking.tsx`) |
| ads conversion (whatsapp click) | ⚠️ env-dependent send_to id |
| view_item / add_to_cart / begin_checkout / purchase / sign_up | ❌ |
| page_view | ⚠️ via GA4 config only if IDs set — REQUIRES VERIFICATION |
