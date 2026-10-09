# 06 — Legal & Compliance Context

> South Africa jurisdiction. Key regimes: **POPIA** (privacy), **CPA** (Consumer Protection Act), **ECTA** (Electronic Communications & Transactions Act — s43 supplier disclosures, s44 cooling-off for electronic transactions), **VAT Act**, ASA/advertising codes.

## Status by instrument

| Instrument | Status | Evidence / Gap |
|---|---|---|
| Privacy policy | ✅ Exists, POPIA-aware, dated July 2026 | `src/app/privacy/page.tsx` — but placeholder phone `082 123 4567`, no entity name |
| Terms & conditions | ⚠️ Exists, dated "January 2025" (predates build — template provenance) | `src/app/terms/page.tsx` — no entity, placeholder phone; calls business "Airconsstore" |
| Return/refund policy | ⚠️ Exists, references CPA | `src/app/(shop)/return-policy/page.tsx` — placeholder `+27210000000`/`wa.me/27000000000` contacts |
| Shipping/delivery policy | ❌ Missing | No page, no delivery terms, no zones/fees anywhere |
| Cookie policy | ⚠️ Banner only (Google Consent Mode, default-denied) — no standalone cookie page | `CookieConsentBanner.tsx` |
| Warranty terms | ⚠️ Page exists (register/extend/claim flow); terms page has workmanship warranty section | `/warranty`, terms §4 |
| ECTA s43 disclosures | ❌ Entity name, reg no., physical address, email, phone, T&Cs — several placeholders/missing | C2/C4 in `01` |
| ECTA s44 cooling-off (7-day) | ❓ Not explicitly addressed in policies — needs legal review | return-policy mentions CPA |
| VAT invoices | ❌ No tax computation or compliant invoices | Prior audit |
| POPIA | 🟡 Partially met — consent checkbox at checkout, retention policy stated (90-day purge cron), rights section; but Information Officer, PAIA manual, breach process absent | privacy page, checkout consent |
| GDPR/CCPA | N/A — ZA-only market (ASSUMED; confirm no international sales) | |
| PCI DSS | ✅ Out of scope — no card capture; Payfast hosts payment | Architecture |
| Accessibility (WCAG) | ⚠️ Radix helps; prior audit scored a11y 2.0 — SA law less strict but good practice | Prior audit |
| Age restrictions | None needed (INFERRED) | |
| Refrigerant handling licensing | ⚠️ INFERRED requirement — installers working with refrigerants must be SAQCC-gas registered; site claims "accredited installation" | `installation` page copy — needs founder confirmation |

## Compliance red flags

1. **Fabricated reviews/ratings** (4.6–5.0 stars, 99–780 counts, hardcoded testimonials) — misleading advertising exposure under CPA s41 & ASA code. **High**.
2. **Placeholder contact details live on legal pages** — undermines enforceability and ECTA disclosure.
3. **No legal entity** — consumer cannot identify the supplier; ECTA s43 violation territory.
4. **No VAT number on prices/invoices** — if vendor-registered (>R1m turnover), tax invoices are mandatory.
5. **Deal pricing inconsistency** — advertised price vs charged price mismatch is bait-pricing risk.
6. **POPIA**: PII includes phone/address; service-role exposure fixed, but confirm 90-day cron actually runs (INFERRED via scheduled retention jobs claim in privacy page).
7. **Terms dated Jan 2025** — provenance unclear; may contain terms never approved by the business (50% deposit vs checkout full-payment mismatch is evidence of drift).
