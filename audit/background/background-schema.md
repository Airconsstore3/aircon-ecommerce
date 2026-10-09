# Aircons Store — Background Schema Document (TO-BE)

> **Overview.** This is the grounding document for every downstream artefact (PRD, TRD, App Flow, Design Brief). It consolidates what is known about the business behind this codebase — facts, inferences, and assumptions — into one reference.
>
> **How to use this document.** Facts cite evidence. Anything marked `INFERRED:` or `ASSUMED:` or `UNKNOWN — needs founder confirmation` must be resolved (see `17-open-questions.md`) before treating it as a decision input. When a downstream document conflicts with this schema, either the schema is stale or the document is wrong — flag it in the change log.

---

## 1. Business context

- **Trading name:** Aircons Store ("airconsstore" in legal copy — naming to be normalized).
- **Legal entity:** UNKNOWN — needs founder confirmation. (Critical gap: blocks ECTA s43 disclosures, invoicing, contract enforceability.)
- **Jurisdiction:** Republic of South Africa; terms name Cape Town.
- **Model:** B2C/D2C ecommerce + trade services — aircon units, installation kits, accredited installation, maintenance plans, extended warranties, repairs enquiries.
- **Revenue:** one-time product+service sales; maintenance plans are quasi-recurring. No subscriptions/commissions.
- **Currency/scope:** ZAR only, integer rand; South Africa only (+27 phones, Payfast, POPIA/CPA).
- **Stage:** launched, pre-scale; every order is manually fulfilled.
- **Funding:** ASSUMED bootstrapped; team = solo founder.
- **Primary KPI:** `generate_lead` conversion — the store is a lead engine first, a checkout second.

## 2. Product context

- **Catalog:** 438 published products (194 parents + 244 variants), 8 OEM brands, categories residential/commercial/portable + kits + deals + collections.
- **Supply:** reseller model INFERRED; suppliers, inventory model, stock ownership — UNKNOWN.
- **Pricing:** server-resolved ZAR totals = product + installation tier (BTU-derived) + kit + maintenance + warranty. No shipping line. Deal prices display-only.
- **UVP:** advice + accredited installation + warranty support — service-led differentiation.
- **Origin story:** UNKNOWN — built June–Sept 2026 by solo founder (INFERRED: "Sim") with AI tooling.

## 3. Historical context

- First commit 2026-06-06; active build June–Sept 2026; ~4 months.
- Phases: frontend prototype → Supabase CMS/admin → commerce engine → variants → payments+hardening → customer auth → audit/fix.
- Notable events: brand rebrand (CoolAir→Aircons Store, orange→blue), admin panel built (June 30) then deleted, RLS incident fixed Aug 17, backup/restore branches exist.
- Full timeline: `04-historical-context.md`.

## 4. Technical context

- Next.js 16.3.6 + React 19 + TS + Tailwind 4 + shadcn/Radix/Relume/shadcnblocks on Vercel (inferred).
- Supabase (`mrufsvbnxysgpjpnpuhb`): Postgres, Auth, Edge Function `order-email`, pg_net trigger, service-role writes.
- Integrations: Payfast (disabled), Manual EFT (enabled), Resend, Upstash rate-limit, Turnstile, GTM/GA4 consent-gated.
- Strengths: server-side pricing, token-gated order reads, layered ITN verification, idempotent orders.
- Debt: no admin UI, cosmetic inventory, fake ratings, dead forms, mock account pages, deal-price mismatch, integer-rand money, dead code.

## 5. Legal & compliance context

- Privacy (POPIA-aware, July 2026), terms (stale Jan 2025 date), CPA-referencing return policy — all present but with placeholder contacts and no entity details.
- Missing: shipping policy, cookie policy page, VAT invoices, Information Officer/PAIA, cooling-off handling.
- Exposure: fabricated ratings/testimonials (CPA s41), ECTA s43 undisclosed supplier identity, "accredited installation" claim unverified.
- Out of scope: PCI DSS (no card capture), GDPR/CCPA (ZA only — ASSUMED).

## 6. Operational context

- Operator: solo owner via Supabase dashboard + WhatsApp `+27767100588` + `info@` inbox.
- Flow: order → email/WhatsApp notify owner → customer sees banking details → manual EFT confirm → manual fulfilment.
- No fulfilment/shipping/delivery states; no returns workflow; inventory manually maintained; several dead lead-capture forms.
- Support: WhatsApp + email aliases; some published links still placeholders.

## 7. Financial context

- Bank: EFT details in `settings` (token-gated page). Payfast configured but dormant.
- No tax, no shipping fees, no coupons, no refunds flow, no reconciliation.
- Margin risk: delivery costs unpriced on heavy goods; deposit-vs-full-payment terms conflict.

## 8. Market & customer context

- SA residential + commercial buyers; WhatsApp-first, phone-primary checkout.
- Acquisition: SEO (JSON-LD, sitemap), Google Ads/GA4 (consent-gated), staged Trustpilot.
- Retention: maintenance plans + accounts; newsletter dead.
- Social proof currently fabricated — top integrity gap.

## 9. Stakeholder context

- Sole identified human: founder "Sim" (`simbachivas98@gmail.com`/`airconsstore3@gmail.com`) — INFERRED.
- Accounts/ownership: GitHub org Airconsstore3; Supabase project; Resend; Payfast merchant; `admins` DB table membership UNKNOWN.
- Suppliers/installers/investors/advisors: undocumented, ASSUMED informal/none.

## 10. Constraint context

- Solo operator, no engineers/support desk; lean-cost stack; ZA/ZAR-only; WhatsApp-dependent funnel; manual fulfilment; AI-dependent development.
- Design rule: assume zero back-office staffing; automate or don't build.

## 11. Domain model & glossary

See `12-domain-model.md` (entities, rules, ER diagram) and `13-glossary.md`.

## 12. Assumption & risk registers

- 20 assumptions (`14-assumption-register.md`) — highest-impact: VAT status (AS-07), unapplied hardening migration (AS-09), secret rotation (AS-10/11), fulfilment reality (AS-13).
- 22 risks (`15-risk-register.md`) — 2 Critical (exposed GitHub PAT, committed webhook secret), 7 High (unapplied migration, fake reviews, no VAT, no shipping fees, manual ops, undisclosed entity, placeholder contacts).

## 13. Traceability

See `16-traceability.md`. Summary of decision blockers that must precede downstream docs: deposit-vs-full-payment, order-vs-quote naming, deal-price policy, accreditation claim, shipping-fee policy.

## 14. Open questions

42 questions in `17-open-questions.md`. **First question to answer:** what is the registered legal entity (name/reg/VAT/address) and who is accountable for it?

## Change log

| Date | Change | Author |
|---|---|---|
| 2026-10-09 | Initial background schema compiled from repo audit | Devin (agent) |
