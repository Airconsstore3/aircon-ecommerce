# 07 — Week-by-Week Execution Schedule

Assumes 1 dev @ ~25 h/wk effective (ASSUMPTION — unconfirmed, see OQ-4), 20% unknowns buffer baked into the load numbers (~20h/wk of planned work + ~5h slack). "Deliverable" = demoable to PM.

| Week | Focus | Stories | Owner | Deliverable / demo | Exit criteria | Risk watch |
|------|-------|---------|-------|--------------------|--------------|------------|
| **W0** (Days 0–3) | Phase 0 stabilize | S-01.1–01.8 (incl. PAT rotation, Turnstile verdict, rate-limit IP) | ENG+PM | Prod running committed code; env matrix; PAT rotated | Phase-0 checklist green; smoke EFT order OK | PM access lag — chase day 0 |
| **W1** | Notifications + admin scaffold | S-02.1, S-02.2, S-08.1, S-08.3, start S-02.3 | ENG | Owner email for whatsapp-order demo; CI badge | 02.1/02.2/08.1/08.3 done; admin layout+auth merged | Admin auth review time |
| **W2** | Admin panel + lead capture | S-02.3 finish, S-03.1, S-03.2 | ENG | `/admin/orders` demo: mark EFT paid; form submit→DB+email | **"Safe+honest" checkpoint**; all P0 closed | Admin scope creep — hold to list/detail/3 actions |
| **W3** | Chrome part 1 | S-04.8 (needs PM data), S-04.2, S-04.4 | ENG+PM | `/contact`,`/faq`,`/shipping`,`/returns` live; dead links pruned | Link crawl: 0 chrome 404s | PM content delivery — hard ask W1 |
| **W4** | Chrome part 2 | S-04.1, S-04.5, S-04.6, S-04.7 | ENG | Footer everywhere; `/account` hub | Footer visible on all shop routes; pagination real | — |
| **W5** | Search + fake-surface purge | S-04.3, S-06.1, S-06.2 | ENG | Search demo (or icon removed); no fake data rendered | CF-09/12/22 closed | D5/D9 decisions must be in |
| **W6** | Checkout integrity + truthful copy | S-05.1, S-05.3, S-05.7, S-06.3, S-12.5 | ENG | Guest order-lookup; stable idempotency | Phase-2 exit all P1 closed; **demo checkpoint #2** | Slip → push 05.7/12.5 |
| **W7** | A11y + design foundation A | S-07.1, S-07.2, S-07.5, start S-07.4 | ENG/DES | Carousel pauses; drawer is real dialog | axe on changed surfaces clean | Visual regressions — screenshot diff |
| **W8** | Tokens + contrast + compliance | S-07.3, S-07.4, S-06.4 | ENG/DES | One palette; AA contrast | `#1C99D6`-as-text gone; POPIA cron covers all PII | CSP/GTM later — don't bundle |
| **W9** | Decisions impl + ops | S-05.4, S-05.5, S-08.2, S-08.5, S-08.6 | ENG+OPS+EXT | Shipping/VAT live OR honest copy; Sentry alerting | Monitoring alerts tested; DR drill done | EXT-TAX/LEGAL latency — escalate W7 |
| **W10** | Test infra + regression | S-11.1, S-11.2, S-11.3, S-11.4 | ENG | CI e2e green; axe+perf reports | 3 e2e paths pass; budgets documented | Playwright flakiness |
| **W11** | UAT + launch gate | GATE, docs, runbook | ENG+PM | UAT sign-off; support runbook | Launch checklist 100% green → GO | UAT surprises → use buffer |
| **W12+** | Post-launch | S-09.x, S-02.4/02.5, S-10.x | ENG | Payfast sandbox E2E → enable decision; fulfilment states; analytics funnel | Per-story AC | Payfast external latency |

## Sprint goals (summary)

- **Sprint A (W0–W2):** "The business sees and controls every order; nothing is lost."
- **Sprint B (W3–W6):** "Every page a customer can reach is real."
- **Sprint C (W7–W9):** "Compliant, consistent, observable."
- **Sprint D (W10–W11):** "Prove it, then ship it."

## Checkpoints

| Checkpoint | When | What | Attendees |
|---|---|---|---|
| Demo #1 | End W2 | Admin mark-paid + form→email + CI | PM + ENG |
| Demo #2 | End W6 | Chrome/search/account/fake-purge | PM + ENG |
| Gate review | End W9 | a11y+monitoring+legal status vs Phase-3 exits | PM + ENG (+EXT) |
| UAT | W11 | Full checklist walkthrough | PM + ENG |
| Go/No-Go | End W11 | Launch decision on evidence | PM |

## Buffer policy

20% of each week is unallocated. If a week ends ahead: pull from next week's first Should item — never pull P0/P1 forward past their dependencies. If behind: drop Should items in order CF-52/53/51 → CF-26 → CF-47 → CF-10.2 → parts of S-07.4.

## Decision deadlines (miss = slip a week, not a day)

| Decision | Needed by | Blocks |
|---|---|---|
| D1–D10 answers | W0 end | Phase-1+ scoping |
| Real contact details | W3 start | S-04.8/04.2/05.6 |
| D5 ratings, D9 mock pages | W5 start | S-06.1/06.2 |
| D3 shipping, D4 VAT | W7 end | S-05.4/05.5 |
| D6 Payfast | W11 end | Phase-5 scope |
