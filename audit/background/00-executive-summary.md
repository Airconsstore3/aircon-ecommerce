# Background Schema — Executive Summary

**Product:** Aircons Store
**Repo:** `github.com/Airconsstore3/aircon-ecommerce` (local: `C:\Users\user\aircon-ecommerce`)
**Storefront:** `https://airconsstore.co.za` (INFERRED — fallback value in `src/app/robots.ts`, `src/app/sitemap.ts`; matches contact emails on legal pages)
**Admin URL:** NONE — no admin UI exists in the current repo (admin was built June 2026, removed later). Admin = Supabase dashboard.
**Jurisdiction:** South Africa (Cape Town-named on legal pages; ZAR; +27 phones; Payfast; POPIA/CPA references)
**Audit date:** 2026-10-09
**Method:** Static repo inspection + git history + prior audit docs (`ARCHITECTURE_AUDIT.md`, `ECOMMERCE_FIX_PLAN.md`, `ENGINEERING_REPORT.md`, `AUDIT_REPORT.md`). Live DB and production deployment not directly inspected.

## What this business is

Aircons Store is a **South African B2C/D2C ecommerce storefront for air conditioners and related services**. It sells brand-name units (Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York) plus installation kits, accredited installation, maintenance plans, and extended warranties. Currency is ZAR only.

Economically it behaves less like a self-serve shop and more like a **lead-generation and quote engine**: checkout is guest-only, payment is Manual EFT (enabled) or Payfast (implemented but disabled in DB), and every order is effectively confirmed by hand — banking details are shown on a token-gated confirmation page, the owner is notified via Resend email and a pre-filled WhatsApp deep link, and payment confirmation happens manually in the Supabase dashboard.

## Who built it and when

- First commit: `f5a32c9` "frontend preview" — **2026-06-06**, author `Sim846 <simbachivas98@gmail.com>`.
- 111 commits on `main`, all authored by `Sim846` or `Airconsstore3 <airconsstore3@gmail.com>` (INFERRED: same person; "fix author" commit `2763f99` suggests an identity correction).
- Built **June – September 2026** (~4 months of active work). INFERRED: primarily AI-built ("vibe-coded") — consistent with prior audit docs and the existence of this project's `AGENTS.md` / audit artefacts; no `Co-Authored-By` trailers were found to confirm which tool.
- 2026-09-25: a full forensic audit was run (`ARCHITECTURE_AUDIT.md`); 22-item fix plan applied in code.
- Two backup branches exist (`backup-full-website-before-restore`, `backup-homepage-before-restore`) — evidence of at least one restore/rebuild event.

## Overall verdict

The **technical substrate is healthier than typical AI-built stores** (server-side price resolution, token-gated order reads, fixed RLS holes), but the **business background is largely undocumented**: no legal entity name, no registered address, no VAT status, no named owner, placeholder phone numbers on live legal pages, and an admin panel that was built then deleted — leaving all revenue flowing through manual database edits.

The dominant gap is therefore **not code safety but business legitimacy and operations**: consumer-law disclosures (ECTA s43), VAT invoicing, shipping/delivery pricing, fabricated review counts, and the absence of any order-management UI.

## Readiness scores (0–5)

| Area | Score | One-line reason |
|---|---|---|
| Business clarity | 1.5 | Entity, VAT status, ownership all UNKNOWN; brand vs legal name unclear |
| Product clarity | 3.5 | Catalog well-modelled (438 products, variants, kits, plans) — but supply-side (suppliers, stock model) undocumented |
| Legal readiness | 2.0 | POPIA/CPA-aware pages exist but have placeholders, no entity details, fake reviews are a live compliance risk |
| Operational readiness | 1.5 | Fully manual order/payment/fulfilment ops via Supabase dashboard + WhatsApp |
| Financial clarity | 2.0 | ZAR + EFT works; no tax, no shipping fees, no refunds flow, Payfast untested |
| Market clarity | 2.5 | Clear SA/brand positioning and WhatsApp-first journey; no personas/research, fake social proof |
| Documentation quality | 3.0 | Strong technical audit trail; near-zero business/ops documentation; README is still create-next-app boilerplate |

## Top 5 blocking unknowns (detail in `17-open-questions.md`)

1. Legal entity name, registration number, VAT vendor status — required for lawful ecommerce and invoicing.
2. Who owns/runs the store day-to-day, and is there a fulfilment/installer network contract in place?
3. Real business contact details (phone, address, WhatsApp) — live pages show placeholders like `082 123 4567`, `+27210000000`.
4. Inventory and delivery model — stocked vs dropship, delivery zones, shipping costs.
5. Whether `20260925_audit_hardening.sql` was applied in the Supabase dashboard and whether `ORDER_WEBHOOK_SECRET` was rotated.

## Single most important background question

**"What is the registered legal entity behind Aircons Store (name, reg number, VAT number, physical address), and who is accountable for it?"** — every legal page, invoice, consumer-law disclosure, payment-provider KYC record, and risk register item hangs off this answer.

## Files in this audit

- `01` background audit (evidence log) · `02`–`11` the ten schema areas
- `12` domain model · `13` glossary · `14` assumption register · `15` risk register
- `16` traceability · `17` open questions · `background-schema.md` consolidated TO-BE doc · `findings.csv`
