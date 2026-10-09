# 12 — Open Questions

Answers needed to finalize the to-be PRD. Grouped by who must answer.

## Owner / business

| # | Question | Why it blocks |
|---|---|---|
| Q-01 | Was `20260925_audit_hardening.sql` applied in the Supabase dashboard? | Determines whether F-01 is live-critical |
| Q-02 | Has `ORDER_WEBHOOK_SECRET` been rotated since it was committed? | F-02 live exposure |
| Q-03 | Who currently manages orders — is there a separate admin tool, or the Supabase dashboard only? | Sizes the admin-panel urgency (G-01) |
| Q-04 | Is the business VAT-registered? VAT number? Must invoices be issued? | G-04 / FR-CHK-02 design |
| Q-05 | Delivery fee policy: flat fee, per-province, per-postcode, free-over-amount, or always quoted manually? | FR-CHK-01 |
| Q-06 | Inventory policy: hard stock enforcement or "enquiry + manual availability confirm" model? | FR-INV-01 — fundamental checkout semantics |
| Q-07 | Deal pricing: should `/deals` prices actually be charged, or are they marketing hooks to enquiry? | G-12/G-15 + CPA exposure |
| Q-08 | Are the fabricated review ratings a deliberate business decision? Any real review source (Trustpilot?) licensed? | FR-REV-01 |
| Q-09 | Should maintenance plans/warranties appear in customer accounts as real purchased items? | FR-ACC-01 scope |
| Q-10 | Payfast: do we have live merchant credentials + passphrase? Was it ever enabled? | FR-PAY-01 |
| Q-11 | What's the real order volume and AOV? (Drives whether admin panel is a day of work or a real tool.) | Roadmap sizing |
| Q-12 | Email/SMS/WhatsApp: which channel is contractual for order confirmations? | FR-CHK email-required decision |

## Technical / ops

| # | Question | Why it blocks |
|---|---|---|
| Q-13 | Production env matrix: which of UPSTASH/TURNSTILE/RESEND/PAYFAST/GTM/GA are set in Vercel? | NFR-SEC-4, analytics reality |
| Q-14 | Which variant FK exists in prod (`ON DELETE CASCADE` vs `SET NULL`)? | Parent-delete safety |
| Q-15 | Is there a staging environment, or is prod the only DB? | Test strategy + migration safety |
| Q-16 | pnpm or npm as the canonical package manager? | CI + lockfile truth |
| Q-17 | DNS/email: are SPF/DKIM/DMARC configured for the Resend sending domain? | Deliverability |
| Q-18 | Is `airconsstore.co.za` the canonical production host? (fallbacks in code assume it) | robots/sitemap/canonical correctness |
| Q-19 | Does the owner want an in-app admin panel or would a Supabase-dashboard workflow doc suffice? | G-01 scope — biggest roadmap fork |
| Q-20 | Legal pages: were `/terms`, `/privacy`, `/return-policy`, `/warranty` reviewed by a lawyer for CPA/ECT Act? | Compliance sign-off |

## Product decisions deferred in this PRD

- Refund SLA and whether refunds are offered at all beyond CPA minimums.
- Whether to keep WhatsApp as a primary channel or demote it to secondary.
- Whether `/account` should exist at all for a mostly-guest store (accounts add POPIA surface).
- Install scheduling UX (calendar vs manual WhatsApp coordination).
