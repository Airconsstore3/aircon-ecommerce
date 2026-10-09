# 10 — Launch Readiness Checklist

Status legend: ⬜ not started · 🟡 in progress · ✅ verified (evidence required) · ➖ N/A.
Every **Blocking=Y** item must be ✅ or ➖ before go-live. The CSV version (`launch-checklist.csv`) is the working copy — this is the human view.

| Area | Item | Owner | Status | Evidence | Blocking |
|---|---|---|---|---|---|
| Product | Guest EFT purchase works end-to-end on prod | ENG | ⬜ | order # + screenshot | Y |
| Product | All 5 audit "verified fixed" items still fixed on prod | ENG | ⬜ | regression notes | Y |
| Product | No fabricated data rendered anywhere | ENG | ⬜ | CF-12/22/46 closed | Y |
| Design | Global footer on all shop routes | ENG | ⬜ | page list | Y |
| Design | Zero chrome 404 links | ENG | ⬜ | link crawl | Y |
| Design | One palette; no `!important` type wars on shipped surfaces | ENG | ⬜ | grep count | N |
| Frontend | Search works or dead icon removed | ENG | ⬜ | CF-09 | Y |
| Frontend | Loading states on PDP/PLP/checkout submit | ENG | ⬜ | manual check | N |
| Frontend | No dead buttons (OAuth, pagination, OrderHistory, subscribe) | ENG | ⬜ | sweep | Y |
| Backend | Owner notified for 100% of orders (all channels) | ENG | ⬜ | 3 test orders | Y |
| Backend | Service forms persist+notify | ENG | ⬜ | DB rows | Y |
| Backend | Compensating-delete path tested once (forced failure) | ENG | ⬜ | test log | N |
| Database | `20260925` applied + anon denied verified | OPS | ⬜ | anon query result | Y |
| Database | Migrations ledger exists; staging-first process documented | OPS | ⬜ | runbook | Y |
| Database | Variant FK behavior verified in prod | OPS | ⬜ | pg_constraint | N |
| Auth | `/admin` gated; non-admin 403 proven | ENG | ⬜ | negative test | Y |
| Auth | `/account` index resolves; subnav exists | ENG | ⬜ | — | Y |
| Auth | Dead Google buttons gone | ENG | ⬜ | — | Y |
| Payments | EFT banking block renders for all pending-EFT orders (settings `.maybeSingle`) | ENG | ⬜ | CF-19 test | Y |
| Payments | Idempotency: double-submit → one order | ENG | ⬜ | test | Y |
| Payments | Payfast stays disabled OR gate checklist done | ENG/PM | ⬜ | D6 | Y |
| Payments | Failed-payment retry path exists (if Payfast on) | ENG | ⬜ | CF-43 | Conditional |
| Emails | Owner+customer mail for email channels; owner mail for whatsapp channel | ENG | ⬜ | Resend logs | Y |
| Emails | Payment-confirmation email fires on mark-paid/ITN | ENG | ⬜ | CF-69 | N |
| Emails | SPF/DKIM pass on sending domain; sender domain == owned domain | OPS | ⬜ | CF-74; mail-tester | Y |
| Analytics | GTM/GA loader verified present (or removed) | ENG | ⬜ | U-04 | N |
| Analytics | `generate_lead` deduped + transaction_id on prod | ENG | ⬜ | dataLayer | N |
| SEO | robots/sitemap correct; bad slugs → real 404 | ENG | ⬜ | — | N |
| Accessibility | axe 0 critical/serious on top-8 routes | ENG | ⬜ | report | Y |
| Accessibility | Carousel pausable; reduced-motion honored | ENG | ⬜ | CF-11/55 | Y |
| Accessibility | CartDrawer dialog semantics + keyboard | ENG | ⬜ | CF-27 | Y |
| Accessibility | Contrast ≥4.5:1 interactive text | ENG | ⬜ | CF-28 | Y |
| Security | HEAD == deployed commit; CI prevents drift | OPS | ⬜ | — | Y |
| Security | GitHub PAT rotated; `.git/config` carries no credentials | OPS | ⬜ | remote URL + revoked-token check | Y |
| Security | ORDER_WEBHOOK_SECRET rotated; old→401 | OPS | ⬜ | curl | Y |
| Security | Turnstile verdict resolved (enabled&working OR site key unset) | ENG | ⬜ | CF-81; env matrix | Y |
| Security | next ≥16.3.8; `audit --prod` 0 high | ENG | ⬜ | audit | Y |
| Security | Security headers incl. CSP (report-only OK at launch) | ENG | ⬜ | headers | N |
| Security | Rate-limit+Turnstile confirmed ON in prod (or accepted risk logged) | OPS | ⬜ | env matrix | Y |
| Performance | LCP<2.5s PDP throttled; no 5xx under load smoke | ENG | ⬜ | report | N |
| Infra | CI green on main; previews on PRs | OPS | ⬜ | Actions | Y |
| Infra | Staging env exists for destructive tests | OPS | ⬜ | — | N |
| Monitoring | Sentry receives test error; uptime alerts to owner | OPS | ⬜ | alert fired | Y |
| Backups | Restore drill performed once; DR runbook written | OPS | ⬜ | runbook | Y |
| Legal | Fake ratings removed; no unbacked claims (financing/tracking/accreditation) | ENG+PM | ⬜ | CF-12/46/79 | Y |
| Legal | Entity name/reg/address disclosed on terms+footer | PM | ⬜ | CF-72 | Y |
| Legal | Terms re-issued, consistent with actual checkout flow | PM+EXT | ⬜ | CF-73 | Y |
| Legal | Real contact details everywhere; `/contact` real | PM | ⬜ | — | Y |
| Legal | VAT/shipping decision implemented or honestly absent | PM+ENG | ⬜ | D3/D4 | Y |
| Legal | POPIA: retention covers all PII; rights path exists | ENG | ⬜ | CF-60 | N |
| Support | Owner can confirm EFT/cancel in `/admin` without SQL | PM | ⬜ | UAT | Y |
| Support | Incident runbook + contacts written | ENG | ⬜ | doc | Y |
| Documentation | AGENTS.md current; `.env.example` committed; deploy runbook | ENG | ⬜ | — | N |
| Comms | PM knows rollback trigger + how to reach dev | PM | ⬜ | — | N |

**Gate rule:** any Blocking=Y row not ✅/➖ at W11-end → No-Go; reschedule with a named fix date.
