# 16 — Open Questions (must be answered to finalise the TRD)

## Business / operations

1. **Who confirms manual EFT payments today, and how?** (Bank-statement check? Banking-app
   notification?) Determines whether PoP upload or bank-feed reconciliation matters more.
2. **Is delivery charged today?** No delivery fee exists in checkout — is delivery free,
   bundled into price, or quoted manually after order?
3. **What is the real service area?** Provinces/suburbs/postcode ranges served —
   needed to seed `delivery_zones` (TR-DEL-002).
4. **Own drivers or subcontractors for delivery + installation?** Decides driver-app scope
   vs a lightweight dispatcher-only model.
5. **Is "pay on delivery/completion" actually a requirement** (TR-PAY-002), or is prepay-only
   acceptable? This is the largest scope lever.
6. **On-site payment method mix:** cash, card terminal (which provider?), or payment link?
   Determines TR-DEL-005 design.
7. **Refund policy enforcement:** terms mention deposit forfeiture rules — should refund
   logic encode those rules automatically?
8. **Order volumes:** current orders/day and peak? Needed to finalise sizing tier and
   whether Phase-2 items pull forward.
9. **VAT registration status:** no VAT handling exists anywhere — is the business VAT
   registered? If yes, price displays and invoices need VAT line items.

## Technical / platform

10. **Was `20260925_audit_hardening.sql` applied to production?** (Verify policies.)
11. **Is Supabase "Confirm email" enabled?** Customer order history depends on it (GAP-22).
12. **Payfast account:** is a live merchant account contracted? Which products are enabled
    (card, Instant EFT)? What are the merchant-side per-transaction/daily limits (the real
    "no limits" answer)? Does the contract support refunds via API?
13. **Hosting tier:** Vercel Hobby or Pro? (Hobby has no commercial-use allowance — a
    live store should be on Pro regardless.)
14. **Upstash & Turnstile configured in production?** If not, rate-limiting and CAPTCHA
    are silently off (SEC-04).
15. **Where do staff want the admin console?** In-app `/admin` (build) vs Supabase Studio
    vs a third-party ops tool — affects R-09 scope dramatically.
16. **Notification channels:** is WhatsApp Business API (template messages) budgeted, or is
    customer-initiated wa.me sufficient? Transactional SMS provider choice (Clickatell/
    Twilio/etc.) for delivery notifications.
17. **Is `pg_cron`/`pg_net` enabled on the production project** (required by the existing
    email trigger and proposed reconciliation job)?

## Security / compliance

18. **Who should hold which roles?** Admin vs dispatcher vs driver vs finance —
    determines RBAC granularity.
19. **POPIA retention decision:** how long may order PII/PoD photos/GPS be retained?
    Needed to write the retention matrix (R-24).
20. **Is a PCI SAQ-A attestation required by the acquiring bank/Payfast contract?**
    Usually yes for hosted-page merchants; confirm and file.
