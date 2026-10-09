# 15 — Risk Register

| ID | Risk | Category | Likelihood | Impact | Severity | Mitigation | Owner |
|---|---|---|---|---|---|---|---|
| R-01 | GitHub PAT exposed in `.git/config` remote URL — anyone with file access can push/read repo | Security | Medium | High | **Critical** | Rotate token immediately; remove creds from remote URL; use credential manager | Founder |
| R-02 | `ORDER_WEBHOOK_SECRET` committed in git history — edge function can be spammed/spoofed if leaked secret still valid | Security | Medium | High | **Critical** | Rotate secret in Supabase env; update trigger; treat git history as compromised | Founder |
| R-03 | `20260925_audit_hardening.sql` possibly unapplied → anon INSERT on orders open (spam/abuse) | Security | Medium | High | **High** | Apply in Supabase dashboard; verify `select`/`insert` as anon denied | Founder |
| R-04 | Fabricated product ratings + testimonials → misleading advertising (CPA s41, ASA complaint, reputational) | Legal | High | High | **High** | Remove fake ratings or ship a real reviews system; remove unverifiable testimonials | Founder |
| R-05 | No VAT computation/invoices — if VAT vendor, statutory non-compliance on every sale | Legal/Financial | Medium | High | **High** | Confirm VAT status; implement tax-inclusive pricing + compliant tax invoices | Founder |
| R-06 | No shipping/delivery fees charged on heavy goods → margin loss per order; or post-sale renegotiation harming trust | Financial | High | High | **High** | Define delivery zones/fees; add shipping line to `resolveOrderPricing` | Founder |
| R-07 | All revenue ops manual (dashboard + WhatsApp) — errors, missed orders, no audit trail; fails at any volume | Operational | High | High | **High** | Minimal admin order panel (EFT confirm + status transitions) — highest-leverage build | Founder/Dev |
| R-08 | Legal entity undisclosed; ECTA s43 duties unmet; terms possibly unenforceable | Legal | High | Medium | **High** | Publish entity name/reg no./address on terms+footer; legal review of terms | Founder |
| R-09 | Placeholder contact data live (`082 123 4567`, `wa.me/27000000000`, `+27210000000`) — customers can't reach support; compliance failure | Operational/Legal | High | Medium | **High** | Sweep all pages for placeholders; publish real phone/address | Founder |
| R-10 | Inventory cosmetic — overselling possible; no stock decrement or reservation | Operational | Medium | Medium | **Medium** | Decrement stock on paid order; low-stock alerts; or switch to "confirm availability" positioning | Founder/Dev |
| R-11 | Payfast disabled/untested in prod; when enabled without sandbox E2E, risk of payment failures | Financial/Technical | Medium | Medium | **Medium** | Complete sandbox ITN E2E before enabling; set prod env vars | Founder/Dev |
| R-12 | Deal price shown ≠ price charged → bait-pricing complaint risk | Legal | Medium | Medium | **Medium** | Either honour deal pricing at checkout or show real price on deal pages | Founder/Dev |
| R-13 | WhatsApp-first funnel is a single-point dependency (Meta policy/outage/account ban) | Operational | Low | High | **Medium** | Ensure email+phone fallback works end-to-end; keep Payfast option live | Founder |
| R-14 | Email sender domain mismatch (`aircons-store.co.za` vs `airconsstore.co.za`) → deliverability failure / phishing look-alike | Technical | Medium | Medium | **Medium** | Verify which domain is owned; set `RESEND_FROM` correctly with SPF/DKIM | Founder |
| R-15 | Mock account pages (subscriptions/warranties) shown to real users → trust damage, false expectations | Product | High | Low | **Medium** | Gate behind "coming soon" or implement real data | Founder/Dev |
| R-16 | Newsletter/deals email capture + maintenance booking are dead forms → silently lost leads | Operational | High | Medium | **Medium** | Wire to Resend/DB table or remove forms | Founder/Dev |
| R-17 | No refunds/cancellation workflow despite policy promises | Operational/Legal | Medium | Medium | **Medium** | Define manual refund SOP; add order statuses `cancelled`/`refunded` | Founder |
| R-18 | Secrets management: SUPABASE_SERVICE_ROLE_KEY, SHADCNBLOCKS_API_KEY, Payfast creds in `.env.local`; prior secrets committed | Security | Medium | High | **Medium** | Adopt secrets manager (e.g., Devin upload-secrets); audit git history; rotate all exposed keys | Founder |
| R-19 | Terms dated Jan 2025 vs checkout behaviour (50% deposit vs full price) — contract terms contradict product | Legal | Medium | Medium | **Medium** | Legal review; align terms to actual checkout flow | Founder |
| R-20 | No backups/DR documentation for Supabase data; order data loss = business loss | Operational | Low | High | **Medium** | Enable Supabase backups/PITR; document recovery | Founder |
| R-21 | Product images may be unlicensed OEM marketing shots | Legal | Medium | Low | **Low** | Confirm image licensing; use distributor-approved assets | Founder |
| R-22 | "Accredited installation" claim unverified → advertising-standards risk if installers aren't SAQCC-gas registered | Legal | Medium | Medium | **Medium** | Confirm installer registration; soften or evidence the claim | Founder |
