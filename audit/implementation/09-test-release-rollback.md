# 09 — Test, Release & Rollback Plan

## Test strategy per phase

| Phase | Automated | Manual | Gate |
|-------|-----------|--------|------|
| P0 | build+vitest+lint pre-commit | prod smoke: EFT checkout, anon-RLS deny, old-secret 401 | Smoke checklist |
| P1 | vitest + CI green | admin auth negative tests; form→DB+email ×3 forms | Demo #1 |
| P2 | link-crawl sweep (script or manual), e2e draft | device spot-checks mobile nav/drawer | Demo #2, all P1 closed |
| P3 | axe-core top-8 routes, unit tests real-code, CI audit | keyboard walkthrough; EXT-LEGAL review | axe 0 crit/serious; legal sign-off |
| P4 | Playwright 3 paths in CI; load smoke | UAT checklist 100%; rollback drill | Launch checklist green |
| P5 | per-story AC; Payfast sandbox E2E | live R1-order watch after Payfast enable | Payfast gate checklist |

## QA gates

1. **PR gate (always):** lint + tsc + vitest + build + audit-warn. No merge on red.
2. **Phase gates:** exit criteria in `06` — a phase can't close with its checklist red.
3. **Launch gate:** `10-launch-readiness-checklist` all *blocking* rows green + PM sign-off.
4. **Payfast gate:** sandbox E2E + envs + passphrase + ITN allowlist + rollback plan rehearsed.

## UAT plan (Phase 4, owner PM, ~1 day)

- Script = `launch-checklist.csv` Blocking=Y rows.
- Walk 3 personas: guest buying with EFT; guest booking a repair; owner confirming payment in `/admin`.
- Devices: 1 desktop + 1 mid-range Android on 4G (SA reality) + iOS Safari if available.
- Record: checklist evidence column + defect log → P0s block, others triage.

## Load test plan

- Tool: k6 or autocannon against staging (not prod).
- Targets: catalog pages 50 rps×2min (SSR cache-free reality — measures worst case); checkout POST is rate-limited (5/10min/IP) — test at limit+1 to prove limiter works.
- Budgets: PDP LCP<2.5s (Moto G4 throttle), TTFB<800ms catalog, zero 5xx under load.

## Security test plan

- Regression-verify every "verified fixed" item in `01` §FIXED after each deploy (spot-check 3: ITN signature reject, markWhatsAppSent wrong-token, anon RLS deny).
- `pnpm audit --prod` in CI; ZAP baseline scan on staging in Phase 3; manual IDOR re-check on new `/admin` + lookup endpoints.
- Secrets: `gitleaks` (or GitHub secret scanning) in CI — prevents another ORDER_WEBHOOK_SECRET.

## Accessibility test plan

- axe DevTools on: /, /products, PDP, /cart, /checkout, /order-confirmed, /login, /account/orders.
- Keyboard-only: nav → PDP configure → drawer → checkout submit.
- Screen-reader spot-check (NVDA) on checkout errors + cart drawer.
- Gate: 0 critical/serious axe; documented keyboard pass.

## Release process (step-by-step, used every phase)

1. Feature branch → PR → CI green → self-review checklist → squash merge `main`.
2. If migration involved: apply to **staging DB first**, verify, then prod SQL editor; record in `13-decision-log.md`.
3. Vercel auto-deploys `main`. Watch deploy → run smoke (home/PDP/cart/checkout 200 + one guest order to confirmation).
4. Tag `release-YYYY.MM.DD`; note in CHANGELOG.
5. Post-deploy: check Sentry + uptime 30min; spot-check edge-fn logs if order/email code touched.

## Feature-flag strategy

No flag system needed at this size. Coarse flags that exist and should be used:
- `payment_providers.is_enabled` (DB) — Payfast on/off without deploy.
- Env vars `UPSTASH_*`/`TURNSTILE_*` — defenses on/off.
- New risky UI (search palette, checkout redesign) ships behind a route first (e.g. `/search` exists before nav wires it).

## Blue/green / canary

Vercel gives instant "redeploy previous" — that IS the blue/green for this scale. No canary infra justified; instead: deploy during low-traffic hours (SA morning), watch Sentry 30min.

## Rollback

**Triggers:** checkout conversion-path 5xx; order INSERT failures in Sentry; payment status wrong; RLS deny blocking legit users; >2 P0 defects found in UAT.

**Steps:**
1. Code → Vercel "redeploy previous" (~2 min). Verify smoke.
2. DB migration → run the rollback SQL paired with each migration (every new migration file must ship `*_rollback.sql` note in the file header or runbook).
3. Edge fn → redeploy previous version in Supabase dashboard.
4. Provider → `is_enabled=false` on the `payment_providers` row.
5. Communicate: PM notified; if customer-facing breakage >30min, banner/status update.

**Per-story rollback notes** live in `backlog.csv` Rollback column.

## Incident response (one-pager — deliverable of Phase 4)

Detect (Sentry/uptime alert or customer) → declare (PM+ENG) → mitigate (rollback or flag-off) → fix on branch w/ test → release process → post-mortem within 48h (5-why, no blame) → action items into backlog.

## Post-mortem process

Template: what happened / timeline / root cause / why defenses missed it / actions (each w/ owner+due). Store in `/audit/incidents/` or repo `docs/`. First entry candidate: "Sept-25 fixes uncommitted 2 weeks" — write it in Week 1 as the practice run.
