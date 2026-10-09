# 08 — DevOps / Infrastructure Audit

## CI/CD
**None found.** No `.github/`, `.gitlab-ci.yml`, `vercel.json`, Dockerfile, or pipeline config. Evidence: root listing + `ls -d .github …` empty. Deployment is presumably Vercel git-integration auto-deploy on push — **UNKNOWN, requires verification**.

Consequences already observed: the Sept-25 security fixes sat **uncommitted for ~2 weeks** — no pipeline or branch protection forced a commit/PR. `pnpm lint` currently fails (15 errors), `pnpm audit` fails — nothing gates on either.

## Environments & config
- Prod + local only. No staging.
- `.env.local` gitignored ✅; `.env.local.backup` sits in repo dir (local risk only).
- **No `.env.example`** — onboarding requires tribal knowledge; production env var set is UNKNOWN (Payfast/Upstash/Turnstile/Resend unverifiable locally).
- No `engines`/`packageManager` field; pnpm lockfile + npm docs mismatch → lockfile drift risk between dev and Vercel install.

## IaC / containers
None. No Dockerfile, compose, Terraform. Supabase migrations are versioned files but applied **manually via dashboard SQL editor** (`ADMIN_SETUP_GUIDE.md:5` says CLI "isn't configured" though `.temp/linked-project.json` shows linkage). Schema drift between repo migrations and prod is possible — unverifiable.

## Secrets management
- `.env.local` holds `SUPABASE_SERVICE_ROLE_KEY` (prod-grade secret on a dev laptop — normal, but note `.backup` copy).
- `SHADCNBLOCKS_API_KEY` (live `sk_live_`) in env though unused at runtime — remove.
- `ORDER_WEBHOOK_SECRET` committed in migration (see SEC-02).
- No secrets manager (Doppler/Vault/1Password Connect) — Vercel env + Supabase edge secrets only (assumed).

## Logging / monitoring / alerting
- `console.log/console.error` throughout — lands in Vercel function logs (short retention, no alerting).
- **No error tracking** (Sentry etc.), **no uptime checks**, **no alerting** on: checkout failures, ITN failures, order-email failures, payment mismatches.
- `console.log` in checkout logs order totals/PII-adjacent metadata (orderId, totals) — fine; no raw PII logged (verified).
- Health checks: none exposed (`/api/health` absent).

## Backups / DR
- UNKNOWN — depends on Supabase plan (daily backups/PITR tier-dependent). No documented restore procedure, RTO/RPO, or off-site export.

## Release & rollback
- Vercel instant-rollback exists by platform; no documented process. DB migrations are one-way SQL without rollback scripts.
- No feature flags, no blue/green, no preview-env policy documented (Vercel gives previews free — usage unknown).

## Hosting risk register
| Risk | Evidence |
|---|---|
| Deployed code ≠ reviewed code | uncommitted fixes; no CI |
| Migration drift | manual dashboard application; `20260925` pending |
| Silent email loss | pg_net fire-and-forget; no alerting on edge-fn failure |
| Vercel lock-in | acceptable at this scale; document |
| Windows dev artifacts | `nul` file committed-to-be? (untracked), CRLF warnings in git diff |

## Minimum viable DevOps recommendations
1. GitHub Actions (or Vercel checks): `pnpm install --frozen-lockfile`, `lint`, `tsc`, `vitest`, `build`, `audit --prod` on every push; block merge to main.
2. `.env.example` + README ops section (env matrix per environment).
3. Supabase CLI migration workflow (`supabase db push` in CI or a documented manual checklist with post-apply verification query).
4. Error tracking: Sentry (free tier) on server actions + edge fn; uptime check on `/` + `/api/payfast/itn`.
5. Commit `packageManager: "pnpm@x"` in package.json; align docs.
6. Quarterly restore drill doc; confirm Supabase backup tier.
