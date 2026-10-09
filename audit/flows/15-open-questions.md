# Open Questions — needed to finalise the AFD

## Business / product decisions

1. **Is this a store or a lead-gen engine?** Today it behaves like the latter
   (enquiry pricing, manual EFT, manual fulfilment, WhatsApp-centric). The AFD
   assumes "store with human fulfilment". Confirm before sizing work.
2. **Is Payfast going live?** It's implemented+hardened but disabled. If yes:
   sandbox E2E + passphrase + retry path become P1. If no: consider removing the
   provider surface to reduce attack area.
3. **Financing claims** — FAQ advertises PayJustNow/Mobicred. Are these actually
   offered? If yes they need provider integration; if no the copy must go (F-17).
4. **Fabricated ratings** — `getPlaceholderRating` shows 4.6–5.0★/99–780 reviews
   per product. Business decision required (CPA/ASA exposure in SA) — keep, make
   real, or remove?
5. **Inventory policy** — advisory `is_sold_out` (current) vs real decrement +
   oversell protection. Which model does ops actually want?
6. **Delivery model** — is there a delivery fee/service-area rule, or is
   delivery always bundled with installation and arranged manually? Needed to
   design checkout's delivery step (C-04/C-15).
7. **VAT** — are displayed ZAR prices VAT-inclusive and should invoices state it?
8. **Order retention** — should the 90-day PII anonymisation cron extend to
   completed/cancelled orders, and is a self-service POPIA delete required?
9. **Warranty/subscription products** — the mock pages suggest these were
   planned. Real offerings or scrap the pages?
10. **Support channels** — what are the real WhatsApp number, support email, and
    response-time promise to put on `/contact`? (Current placeholders are
    `wa.me/27000000000` and `support@`/`hello@airconsstore.co.za`.)

## Technical verification (no code access needed — env/dashboard)

11. Is `20260925_audit_hardening.sql` applied in production? (anon INSERT revoke,
    settings RLS)
12. Is `ORDER_WEBHOOK_SECRET` rotated post-commit, and does the deployed trigger
    send the rotated value?
13. Are `UPSTASH_REDIS_REST_*`, `TURNSTILE_SECRET_KEY`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
    `PAYFAST_*`, `RESEND_*`, `OWNER_EMAIL`, `NEXT_PUBLIC_GTM_ID`,
    `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL` set in the deploy environment?
14. Does the invisible Turnstile widget actually emit `cf-turnstile-response`
    into the FormData with the current markup? (F-28 — test on staging)
15. Which variant FK exists in prod — `ON DELETE CASCADE` or `SET NULL`?
    (`pg_constraint` check on `products.parent_product_id`)
16. `payment_providers` live rows — is Payfast still `is_enabled=false`?
17. `settings` row count — exactly one? (`.single()` calls assume it — F-12)
18. Is `nextadmin-template/` a real deployed admin anywhere, or abandoned?
19. Does the business actually monitor the Resend owner inbox + Vercel logs?
    (affects how much alerting must be built in-app)
20. `categories` table — which slugs exist? Footer links `heat-pumps`/`portable`
    and navbar default `kits` need real rows or link removal.

## Access I need (if you want runtime verification)

- Read-only Supabase access (or MCP auth) to verify: enabled providers, orders
  RLS policies live state, settings row count, categories slugs, variant FK,
  whether hardening migration ran.
- Vercel/host env var listing (names only, not values).
- Confirmation of real contact channels + whether gtag/GTM is installed.
