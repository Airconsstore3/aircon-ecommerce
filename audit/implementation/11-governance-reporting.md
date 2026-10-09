# 11 — Governance & Reporting

Sized for a 1-dev + owner team: lightweight but non-optional.

## Cadence

| Ritual | When | Duration | Content |
|---|---|---|---|
| Standup (async OK) | Daily, written | 5 min | yesterday/today/blockers in project tracker comments |
| Weekly review | Fridays | 30 min | demo of week's deliverable; verify week exit criteria (`07`); re-estimate |
| Phase gate | End of each phase | 45 min | walk phase exit checklist; go/no-go to next phase; update risk register |
| Risk review | Weekly, inside Friday review | 10 min | top-5 risks: moved? new ones? mitigations on track? |
| Stakeholder update | Fridays, written | 10 min | 5-line summary: shipped / next / blocked / decisions needed |

## Metrics (tracked weekly in the tracker or a `metrics.md`)

| Metric | How | Target/Alert |
|---|---|---|
| Velocity | story-hours closed / week | plan ≈20h/wk; <15 two weeks running → re-plan |
| Burn-down | remaining Must+Should hours vs weeks left | diverging >20% → apply cut list |
| Defect rate | new bugs found per week / per deploy | rising trend → slow down, add tests |
| CI health | red-build count / week | >1 → fix process first |
| Uptime | uptime probe | <99.5% → investigate |
| Order flow | orders placed vs owner-confirmed lag | lag >24h → ops problem, not code |
| Conversion proxy | checkouts submitted / PDP sessions (post-GTM fix) | baseline in Phase 5 |

## Escalation path

Blocked >1 day on: access → PM (call, not chat); external (Payfast/Resend/DNS) → PM owns vendor contact; legal/tax → PM chases EXT; any P0 prod incident → stop roadmap, incident mode per `09`, resume after post-mortem.

## Change control

- Scope changes: new work lands in `backlog.csv` with source-finding or marked `PM-REQ`; anything >4h displaces a Should item — never silently added.
- Must/Should reclassification only at phase gates, recorded in `13-decision-log.md`.
- DB schema changes require a migration file + rollback note + staging-first apply (once staging exists).

## Artifact hygiene

- This `/audit/implementation/` folder is the plan of record. Update `backlog.csv` Status column as work moves; findings stay immutable (mark closed, never delete rows).
- `13-decision-log.md` appended (never edited history).
- `12-risk-register.md` re-scored at each phase gate.

## Definition of Done (proposed — confirm with PM)

A story is Done when: code merged to `main` behind green CI · deployed to prod or flagged off · acceptance criteria verified (evidence link/screenshot/test name) · rollback path noted · no new lint/type errors · finding row marked resolved in `01`/`backlog.csv`.
