# 05 — Critical Path

## The critical path (longest chain of must-do work)

```
PM grants access
  → S-01.1 Commit+deploy fixes (4h)
  → S-01.2 Apply RLS migration (2h)        ┐ parallel w/ 01.3, 01.5
  → S-01.3 Rotate webhook secret (3h)      ┘
  → S-02.1 Owner notify all channels (4h)
  → S-02.3 /admin/orders panel (32h)        ← single biggest task; on path to 4 downstreams
  → S-03.1 service_requests pipeline (10h)  (parallel w/ admin build)
  → S-08.1 CI pipeline (4h)
  → S-04.2 Link repair + pages (14h)        (needs PM copy — early ask)
  → S-04.1 Global footer (6h)
  → S-04.3 Search (12h)
  → S-06.1 Remove fake ratings (2h)         (needs D5 — decide day 0)
  → S-06.2 Kill mock account pages (2h)
  → S-07.2 CartDrawer dialog (5h)           ┐ a11y triad
  → S-07.3 Contrast AA (4h)                 ┘
  → S-11.1→11.2 e2e suite (18h)             (needs CI+staging)
  → S-11.3 axe verification (5h)
  → S-08.2 Monitoring (4h)
  → GATE: UAT + regression + checklist
```

**Path length:** ~105–115 hours of ENG time on the spine ≈ **14–15 working days** of pure
execution — but because it's one person's sequential time interleaved with Should-work,
calendar reality is **~10–12 weeks** at 25h/wk with 20% buffer.

## Critical-path list (ordered)

| # | Story | Why on path |
|---|-------|-------------|
| 1 | Access grant (PM) | Everything Phase-0 hangs off it |
| 2 | S-01.1 Commit+deploy | Code baseline for all verification |
| 3 | S-01.2/01.3 Migration+secret | Closes last open write-paths |
| 4 | S-02.1 Owner notify | Revenue-visibility; mail path reused by 03.1 |
| 5 | S-02.3 Admin panel | Gates 04.7, 02.4, 09.1–09.4 (all Phase-5 payment work) |
| 6 | S-03.1 Service forms | Stops active data loss; new table feeds 06.4 |
| 7 | S-08.1 CI | Gates e2e and prevents regression of Phase-0 gains |
| 8 | S-04.2+04.1 Chrome | Launch-blocking trust surface; needs PM content early |
| 9 | S-04.3 Search or icon-removal | Launch-blocking dead control |
| 10 | S-06.1/06.2 Fake-surface removal | Compliance gate |
| 11 | S-07.2+07.3 AA triad | Gates 11.3 axe pass → launch gate |
| 12 | S-11.1→11.2 e2e | Gates UAT |
| 13 | S-11.3 axe | Gates UAT |
| 14 | S-08.2 Monitoring | Launch checklist requires alerting live |
| 15 | GATE | Sign-off |

## Parallelizable tracks (once Phase 0 clears)

| Track A — Revenue ops | Track B — Chrome/UX | Track C — Compliance/design | Track D — Infra |
|---|---|---|---|
| 02.1 → 02.3 → 02.4 → 09.x | 04.x → 05.x → 12.x | 06.x, 07.x → 11.3 | 08.1→08.4→11.2, 08.2, 08.5, 08.6 |
| ~55h | ~50h | ~45h | ~20h |

With ONE dev, tracks interleave weekly (see `07`) — A first (revenue), then B, C, D woven in.
With TWO devs, B+C can fully parallelize A → calendar halves after Phase 1.

## Fastest legitimate path to "safe + honest store"

If forced to ship the smallest defensible increment (ignoring polish):
**Phase 0 + 02.1 + 03.1 + 04.1/04.2-lite (footer with pruned links, no new pages) + 04.4 + 06.1 + 06.2 + 07.1 + 07.3-lite**
≈ 5–6 days ≈ "nothing dangerous, nothing fake, nothing leaks" — recommend as the Week-2 checkpoint milestone regardless of full-plan pace.
