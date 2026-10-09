# Error Handling Matrix

| # | Failure point | Current behaviour | Evidence | User sees | Data outcome | Target behaviour |
|---|---------------|-------------------|----------|-----------|--------------|------------------|
| 1 | Zod validation fail | `issues[0].message` returned | `actions.ts:436-441` | Field message in banner | Nothing written | KEEP + per-field errors |
| 2 | Invalid phone | `normalizePhone` throws | `actions.ts:73-81` | "Enter a valid SA number" | Nothing written | KEEP |
| 3 | Rate limit hit (Upstash set) | throw → error | `actions.ts:150-177` | "Too many attempts" | Nothing written | KEEP + add Retry-After UX |
| 4 | Upstash unset | silently skips | `actions.ts:153` | n/a | Unprotected | Verify prod env; alert if missing |
| 5 | Turnstile fail | throw "Security check failed" | `actions.ts:133-148` | Error banner | Nothing written | Verify token actually produced (F-28) |
| 6 | Idempotent resubmit (same key) | returns existing order | `actions.ts:220-240` | Success path | No duplicate | KEEP; fix key-per-mount (F-14) |
| 7 | Provider disabled/missing | throw "not available" | `actions.ts:243-251` | Error banner | Nothing written | KEEP + upfront provider-empty state |
| 8 | Product unpublished/deleted | resolver throws | `server-pricing.ts:296-298,313-315` | "no longer available" | Nothing written | KEEP + name the item in error |
| 9 | Sold-out item | resolver throws named error | `server-pricing.ts:317-319` | `"X" is sold out` | Nothing written | KEEP + pre-checkout cart revalidation |
| 10 | orders INSERT fails | throw generic | `actions.ts:327-330` | "couldn't complete" | Nothing written | KEEP |
| 11 | order_items/payments INSERT fails | compensating delete + error | `actions.ts:357-380` | Generic error | Order row deleted — **but email trigger may already have fired** | Move trigger off INSERT or queue (F-19) |
| 12 | settings whatsapp missing | throw "not configured" | `actions.ts:193-197` | Error banner | Order **created** before this point? No — built after inserts; order exists but response fails → customer never gets URL | Reorder: fetch whatsapp before inserts, or degrade gracefully |
| 13 | Payfast unconfigured | provider throws in redirect | `redirect/route.ts:82-88`; `payfast.ts:88-90` | JSON error page | `payment_status` stays pending | Show friendly error + EFT fallback offer |
| 14 | ITN: bad IP/signature/server-validation | 403/400 rejects | `itn/route.ts:38-61` | n/a (machine) | No mutation | KEEP + alert on repeated rejects |
| 15 | ITN: order not found | 404 | `itn/route.ts:75-78` | n/a | No mutation | KEEP + alert (could be recon issue) |
| 16 | ITN: amount mismatch | 400 | `itn/route.ts:86-91` | n/a | No mutation | KEEP + alert |
| 17 | ITN: unknown status value | mappedStatus null → falls through, 200 ok | `payfast.ts:177-189`; `itn/route.ts:160-162` | n/a | Order stuck `processing` | Log+alert; explicit else-branch |
| 18 | ITN: update fails | 500 → Payfast retries | `itn/route.ts:112-115` | n/a | No mutation; retried | KEEP |
| 19 | ITN: COMPLETE after cancelled | overwrites to paid | `itn/route.ts:100-133` | Customer sees paid | Cancelled→paid resurrection | Terminal-state guard or alert-review |
| 20 | Confirmation: bad/missing token | `notFound()` | `page.tsx:98-124` | 404 | Read-only | KEEP |
| 21 | Confirmation: rate-limited | `notFound()` | `page.tsx:74-76` | 404 (masked) | Read-only | KEEP |
| 22 | Confirmation: expired link (non-EFT) | `notFound()` | `page.tsx:126-131` | 404 even if paid | Read-only | FIX — scope expiry to banking block |
| 23 | Confirmation: settings empty/dup | banking block silently hidden | `page.tsx:143-148` | No bank details → can't pay | Read-only | FIX — maybeSingle + fallback text (F-12) |
| 24 | Edge fn: missing secret env | 500 fail-closed | `order-email/index.ts:93-99` | n/a | No email | KEEP + ops alert |
| 25 | Edge fn: whatsapp channel | early `skipped` | `index.ts:107` | n/a | **No owner email** | FIX — owner email for all channels (F-02) |
| 26 | Edge fn: Resend failure | throws → function 500; no retry | `index.ts:83-85` | n/a | Email lost silently | Queue + retry + alert |
| 27 | Booking/warranty forms | `preventDefault`/`setSubmitted` | maintenance/repairs/warranty pages | **False success** | Data lost | FIX — real backend or remove (F-03) |
| 28 | Newsletter/deal alerts | local state / console.log | `premium-footer.tsx:87`; `DealsClient.tsx:44` | False success | Nothing stored | FIX — persist or remove (F-08) |
| 29 | localStorage cart parse fail | console.error, empty cart | `CartProvider.tsx:50-54` | Empty cart | Corrupt cart dropped | KEEP + preserve raw for recovery |
| 30 | Order lookup UUID malformed | `notFound()` | `page.tsx:98-100` | 404 | Read-only | KEEP |
| 31 | Auth: bad credentials | Supabase generic msg | `(auth)/actions.ts:44-48` | "Invalid login credentials" | None | KEEP |
| 32 | Auth: expired reset link | getUser null → message | `actions.ts:131-136`; `/auth/error` | "link expired… request new" | None | KEEP |
| 33 | `/account` unauthenticated | middleware + layout redirect | `middleware.ts:10-19`; `account/layout.tsx:16-18` | /login?next= | Read-only | KEEP |
| 34 | Server component crash | `error.tsx` boundary | `app/error.tsx` | "Something went wrong" + retry | n/a | KEEP + wire to Sentry |
| 35 | markWhatsAppSent wrong token | silent no-op | `actions.ts:451-468` | Nothing | No mutation | KEEP |
| 36 | 90-day PII cron | bulk anonymise `submitted` | `20260710085327:87-103` | n/a | PII wiped on stale orders | Extend to all non-active statuses (D7) |
