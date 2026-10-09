# 13 — Decision Log

Append-only. Format: **D-xx | Date | Decision | Options considered | Decided by | Consequences.**

## Decisions already made (from audit evidence — recorded here for the register)

| ID | Decision | Evidence | Consequences |
|----|----------|----------|--------------|
| D-00a | EFT as primary payment; Payfast implemented but disabled | `payment_providers.is_enabled=false` (AGENTS.md) | Manual reconciliation burden → drives E-02 |
| D-00b | Guest-only checkout; order↔account via email-match RLS | code | Fragile link documented (CF-24); no prefill |
| D-00c | Integer-rand money model (no cents) | schema `total_zar >= 0`, integer cols | Won't-change; document constraint; Payfast amounts rounded — exact-cents match uses Math.round (±R0.49 tolerance noted in audit) |
| D-00d | Lead-gen semantics: `generate_lead` on order placement, not payment | code + dedup fix | Analytics story reframes "conversion" (S-10.1) |
| D-00e | Inventory advisory, not enforced | `stock_count` never mutated | Oversell possible — pending D-inv to formalize |

## Pending decisions — REQUIRED, with defaults

| ID | Needed by | Question | Options | Recommended default | Blocks |
|----|-----------|----------|---------|---------------------|--------|
| D-01 | W0 | Commit Sept-25 fixes as-is? | as-is / re-review first | **as-is** (already verified; delay = risk) | S-01.1 |
| D-02 | W0 | Admin approach | minimal `/admin` in-repo / dashboard-only / external tool | **minimal `/admin`** | E-02 scope |
| D-03 | W7 | Shipping model | flat fee / zones / included-in-install / quote-only | **flat fee now, zones later** | S-05.4 |
| D-04 | W7 | VAT | registered? inclusive/exclusive? | per EXT-TAX ruling | S-05.5 |
| D-05 | W5 | Fake ratings | remove / real reviews / hide | **remove** (CPA); reviews later | S-06.1 |
| D-06 | W11 | Payfast enable? | sandbox→live / stay EFT | sandbox→live if gate passes | S-09.4 |
| D-07 | W5 | Search | Postgres FTS / remove icon / Algolia | **Postgres FTS** (or icon-removal if time) | S-04.3 |
| D-08 | W2 | Service forms target | `service_requests` table+email / wa.me only | **table+email** | S-03.1 |
| D-09 | W5 | Mock account pages | delete / build real | **delete** (no backing data exists) | S-06.2, S-04.5 |
| D-10 | W0 | Capacity/team | solo? hrs/wk? contract help? | unknown — confirm | `08` cuts, hires |
| D-11 | W3 | Newsletter | `newsletter_subscribers` table / remove forms | **table** (4h, keeps channel) | S-03.2 |
| D-12 | W7 | Deal prices | honor at checkout / honest copy | **honest copy** now (cheap); honoring = P5 | S-06.5 |
| D-13 | W9 | Inventory | decrement+enforce / advisory copy | **advisory copy** this launch; enforce P5 | S-09.3 |
| D-14 | W0 | Package manager | pnpm / npm | **pnpm** (lockfile exists; docs updated) | S-08.3 |
| D-15 | W1 | Legal entity disclosure | publish entity+reg+VAT+address / partial / delay | **publish full** once PM supplies data (ECTA s43) | S-06.6 |
| D-16 | W7 | Payment terms vs checkout | keep full payment + fix terms / implement deposits | **keep full payment; re-issue terms** (checkout already collects full) | S-06.6 |
| D-17 | W3 | "Accredited installation" claim | evidence (SAQCC-gas reg) / soften copy | **soften until evidenced** | S-06.6 copy |
| D-18 | W0 | Turnstile if enabled-broken in prod | wire `.execute()` properly / unset site key | **unset site key** (defense optional anyway; revisit in P3) | CF-81, S-01.4 |

## Rule

A decision not made by its deadline is treated as **decided-by-default** (the recommended option), logged here by the dev, and PM may overturn at the next phase gate with a documented reason — never mid-story.
