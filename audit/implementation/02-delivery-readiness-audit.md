# 02 — Delivery Readiness Audit

Can the current team, environment and process deliver this plan?
Status: **GREEN** = ready · **AMBER** = gap, workaround exists · **RED** = blocks delivery.

Roles assumed (solo-team reality): **ENG** = full-stack dev (also acts as OPS/DES/QA) ·
**PM** = product/business owner · **EXT-TAX/EXT-LEGAL** = external advisors ·
**DES-C** = optional contract designer.

## 1. Team readiness — RED

| Skill | Required by plan | Available? | Gap | Severity | Recommendation | Effort to close |
|---|---|---|---|---|---|---|
| Next.js/TS full-stack | All epics | Yes (evidenced by quality of fixes) | None on skill; **100% of estimate on one person** | High | Single-owner plan; protect focus; defer Could items | — |
| Supabase/Postgres/RLS | EPIC-01/02/03 | Yes | None | — | — | — |
| DevOps (CI, Vercel, monitoring) | EPIC-09 | Partial — no CI exists | No CI experience evident | Medium | GitHub Actions template is ~2h; Sentry free tier | 1–2 days |
| Design systems / WCAG | EPIC-06, a11y fixes | Partial — no designer evident | Token design, AA contrast judgement | Medium | Contract designer 3–5 days OR dev-led token consolidation (slower) | 3–5 days |
| QA / test | EPIC-13, launch gate | Weak — tests re-implement code | No e2e experience evident | High | Dev writes Playwright happy-path suite; manual checklist for UAT | 3–4 days |
| Security review | Phase 3 gate | Partial | No dedicated reviewer | Medium | External pentest-lite OR OWASP ZAP self-scan + checklist | 1 day + external |
| PM / business decisions | ~10 blocking decisions | Unknown | Decisions unmade, no deadline | **High** | Owner must answer `14-open-questions.md` week 0 | — |

**Capacity:** CONFIRMED solo founder-operator — the background audit verifies a single
committer ("Sim", `Sim846`/`Airconsstore3`, 111 commits Jun–Sep 2026, AI-assisted build).
Hours/week still UNKNOWN — estimates assume ~25 h/wk. Required Must+Should ≈ 46–52 dev-days
vs ~37 available in 12 wks → **over capacity ~25–30%.** Bus factor = 1 everywhere
(no second admin exists — BG-F-23). Mitigation: cut list in `08-estimation-capacity.md`;
consider a contract designer for EPIC-07 and a 1-week QA contractor before Phase 4.

## 2. Environment readiness — RED

| Item | Status | Gap | Severity | Recommendation | Effort |
|---|---|---|---|---|---|
| Local ↔ prod parity | AMBER | `pnpm` local, docs say `npm`, no `engines`, prod Node unknown | Medium | Pin pnpm + `engines.node`; add `.env.example` | 2 h |
| Staging | **RED — absent** | Only prod + laptop; migrations applied straight to prod | High | Vercel preview deploys per PR (free) + Supabase branch or a second project for destructive tests | 0.5–1 day |
| CI/CD | **RED — absent** | No `.github/`, no `vercel.json`; nothing blocked the 2-week uncommitted drift | High | GitHub Actions: lint → typecheck → vitest → build; Vercel git integration gives preview+prod | 0.5 day |
| Secrets mgmt | **RED** | Webhook secret in git history; **live GitHub PAT in `.git/config` remote URL (verified)**; `.env.local.backup` plaintext on disk; `.env.local` gitignored (good) | High | Rotate PAT + webhook secret (CF-71/CF-03); strip creds from remote URL; delete backup; `.env.example` | 2 h + rotations |
| DB migrations | AMBER | Manual dashboard applies; `20260925` shipped-but-unapplied for 2 wks; no migration ledger | High | `supabase migration` CLI or an `applied_migrations` checklist; verify-after-apply step in release runbook | 0.5 day |
| Feature flags | RED — none | Payment provider flags live in DB (`payment_providers.is_enabled`) — usable as coarse flag; nothing else | Low | DB provider flag + env-var flags are enough at this scale | — |
| Rollback | AMBER | Vercel redeploy-previous exists (assumed); DB rollback = manual SQL; no documented runbook | Medium | Write rollback steps per change (`09`); keep migrations additive/backward-compatible | 0.5 day doc |
| Monitoring/alerting | **RED — absent** | No Sentry, no uptime probe, no log drain | High | Sentry (Next.js SDK ~1h) + UptimeRobot/BetterStack free tier + Resend failure webhook | 0.5–1 day |
| Backups/DR | AMBER | Supabase platform defaults assumed; no restore drill, no runbook | Medium | Document PITR/backup tier; run one restore drill on staging | 0.5 day |

## 3. Process readiness — RED

| Item | Status | Gap | Severity | Recommendation | Effort |
|---|---|---|---|---|---|
| Issue tracking | RED | None found — findings live in markdown only | Medium | Import `backlog.csv` into GitHub Projects/Linear | 1 h |
| Code review | RED | Solo dev, no reviewers | Medium | Self-review checklist + CI gate; consider AI-review bot; PR-per-epic minimum | — |
| Branching | RED | Everything on `main` worktree; 36 uncommitted files | High | `main` protected; feature branches per epic; PRs required | 0 (policy) |
| Release cadence | RED | Vercel auto-deploy assumed; no tags/changelog | Medium | Tag each phase release; `CHANGELOG.md`; deploy checklist | 0.5 day |
| Testing gates | RED | Tests exist but are cosmetic | High | CI must pass `tsc`+`vitest`+`build`; add Playwright smoke before Phase 4 | covered in EPIC-13 |
| Incident response | RED | No runbook, no alerting, no on-call concept | High | One-page runbook (rollback, contacts, dashboards) | 0.5 day |

## 4. Dependency readiness — AMBER

| Dependency | Status | Gap | Severity | Action |
|---|---|---|---|---|
| Supabase project `mrufsvbnxysgpjpnpuhb` | Live (linked) | Dashboard access needed for 5 verifications | High | PM confirms access day 0 |
| Vercel | Assumed host | Env vars unverified (U-02); project settings unseen | High | PM exports env list (no values) day 0 |
| Resend | Configured in edge fn | SPF/DKIM unverified; owner email correctness unknown | Medium | DNS check + send test |
| Payfast | Implemented, disabled | No sandbox account confirmed; never E2E-tested | Medium (gate) | Create sandbox acct in Phase 5 |
| Upstash + Turnstile | Optional, locally absent | Unknown if prod-defended | Medium | Verify env; if absent, provision free tiers |
| GTM/GA4 | Events coded, loader unverified | May be dead code pushing to nothing | Low | View-source check on live site |
| WhatsApp number(s) | `wa.me` links use `27000000000` placeholder; **real number `+27767100588` exists in `settings`** (migration `20260710`) | Placeholders must be swept to real value; confirm number still valid | High | Single source (`settings`) + sweep (S-04.8) |
| Domain/DNS/TLS | `airconsstore.co.za` assumed; **Resend sends from `aircons-store.co.za` (different domain — CF-74)** | Registrar/DNS access unconfirmed for BOTH domains | High | PM confirms which domains are owned; needed for SPF/DKIM |
| Legal/compliance | Privacy/terms/returns pages exist | CPA (fake reviews), POPIA gaps, VAT invoice requirements | High | EXT-TAX + EXT-LEGAL reviews in Phase 3 |
| Content/assets | Product images in Supabase storage | OG image unverified; brand logos OK; real contact details needed | Medium | Content task in Phase 2 |

## 5. Quality readiness — RED

| Area | Status | Gap | Severity | Plan |
|---|---|---|---|---|
| Unit tests | 13 tests, but they **re-implement** code under test | Zero real regression protection | High | Rewrite to import real modules (CF-58); add resolver/ITN edge cases |
| e2e | None | No checkout-path automation | High | Playwright: browse→PDP→cart→checkout→confirmed ×2 (EFT, mocked Payfast) |
| Manual QA | None documented | No test cases, no device matrix | Medium | `10-launch-readiness-checklist.md` doubles as UAT script |
| Accessibility | Never tested | 4 known AA failures already | High | axe-core scan + keyboard pass + fix CF-11/27/28/55 |
| Security testing | Manual audit only | No ZAP/dependency gate in CI | Medium | `pnpm audit --prod` in CI + ZAP baseline scan Phase 3 |
| Performance | Never measured | No CWV data, no budgets | Medium | Lighthouse CI on key routes; set budgets Phase 3 |

## Verdict

| Area | Status | One-line |
|---|---|---|
| Team | RED | One pair of hands; every discipline converges on them |
| Environment | RED | No staging, no CI, no monitoring |
| Process | RED | No tracker, no branches, no gates — the uncommitted-fixes incident proves it |
| Dependencies | AMBER | All reachable in principle; ~9 verifications need dashboard access |
| Quality | RED | Test suite is decorative; no a11y/perf/e2e coverage |

**Go/No-Go:** The plan is deliverable by a solo dev **only if** (a) Phase 0 discipline lands
immediately, (b) the 10 decisions in `00` are answered in week 0, and (c) scope is cut to the
Must+partial-Should list in `08`. Otherwise hire a second pair of hands for Weeks 3–9.
