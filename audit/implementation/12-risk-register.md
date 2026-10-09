# 12 — Risk Register

Scoring: Probability × Impact (1–5 each) → Score. Re-scored at each phase gate.

| ID | Risk | P | I | Score | Owner | Mitigation | Contingency | Status |
|----|------|---|---|-------|-------|-----------|-------------|--------|
| R-01 | Prod runs vulnerable HEAD (fixes uncommitted) — or worse, worktree lost before commit (single machine) | 3 | 5 | **15** | ENG | S-01.1 day 0; push to remote immediately | redeploy-previous + re-apply fixes from local diff | Open — top risk |
| R-01b | **Live GitHub PAT in `.git/config` remote URL** — anyone with file access can push/read the private repo (incl. secrets in history) | 3 | 5 | **15** | OPS | S-01.7: strip URL creds + revoke PAT day 0 | rotate all repo-exposed secrets if repo was cloned by others | Open — VERIFIED present |
| R-02b | **Turnstile enabled in prod but widget never emits token → every checkout hard-fails** (invisible size, no `.execute()`) | 2 | 5 | 10 | ENG | S-01.4 verdict: if enabled, same-day fix or unset site key | remove `NEXT_PUBLIC_TURNSTILE_SITE_KEY` from prod env | Open — verify W0 |
| R-02 | `20260925` never applied → anon order spam via PostgREST | 3 | 4 | 12 | OPS | S-01.2 + anon-key verification | re-grant check; purge spam rows; keep email trigger monitored | Open |
| R-03 | Solo dev: illness/absence halts everything; knowledge in one head | 3 | 5 | **15** | PM | docs/runbooks (08.5, ops manual); admin UI replaces SQL knowledge | contract handover via AGENTS.md + this folder | Open |
| R-04 | Decisions (D1–D10) not made → Phase 2/3 stalls on gated stories | 4 | 4 | **16** | PM | decision deadlines in `07`; defaults pre-chosen (remove fakes, flat-rate ship, delete mock pages) | proceed on defaults; log as decided-by-default | Open |
| R-05 | Lead loss continues during build (service forms, whatsapp-owner gap live NOW) | 5 | 4 | **20** | ENG | pull S-02.1/S-03.1 as early as deps allow (W1–W2) | interim: wire forms to wa.me deep links same-day | Open — live bleed |
| R-06 | Admin auth-bypass ships (new privileged surface) | 2 | 5 | 10 | ENG | server-side admins check every action; negative e2e; review diff | unpublish `/admin` route; dashboard fallback | Open |
| R-07 | Payfast enabled before sandbox-tested → forged/wrong payments | 2 | 5 | 10 | ENG | hard gate S-09.1/09.4; stays disabled until checklist | `is_enabled=false` instant rollback | Open (latent) |
| R-08 | Token refactor (S-07.4) causes visual regressions across ~60 files | 4 | 3 | 12 | ENG | per-page screenshot diff; top-20 files only; rest deferred | git revert per-file; ship palette fix without full migration | Open |
| R-09 | No staging → destructive migration error hits prod | 3 | 4 | 12 | OPS | S-08.4 early; migrations additive-only rule; rollback SQL per file | Supabase PITR/backup restore (drill in 08.5) | Open |
| R-10 | Real business data (phone/email/VAT#) not supplied → launch blocked by content, not code | 4 | 3 | 12 | PM | ask W1, deadline W3 (S-04.8); placeholder audit in link crawl | launch with mailto+WhatsApp only, phone hidden | Open |
| R-11 | E2E suite flakiness eats Phase 4 | 3 | 3 | 9 | ENG | 3 paths only; retry-1 policy; no visual-diff in v1 | manual UAT checklist substitutes, e2e follows | Open |
| R-12 | Capacity 25h/wk assumption wrong (real <15h) | 3 | 4 | 12 | PM | confirm OQ-4 week 0 | apply `08` cut list in order; drop P5 entirely | Open |
| R-13 | `.env.local.backup`/`nul`/local-only secrets leak | 2 | 4 | 8 | ENG | S-08.3 deletes; gitignore verified | rotate any exposed value | Open |
| R-14 | Over-rotating to build everything (coupons, fulfilment, reviews) — schedule doubles | 3 | 4 | 12 | PM | Won't-list enforced at gates; cut order pre-agreed | descope to "safe+honest" spine (`05`) | Open |
| R-15 | Resend/email outage → owner learns of orders late | 2 | 4 | 8 | ENG | S-02.1 removes single-channel dependence; `/admin` list is the source of truth; uptime alert on edge-fn errors | daily `/admin` check habit + Resend status page | Reduced once E-02 lands |
| R-16 | `.single()`-style brittle queries elsewhere silently degrade (settings multi-row) | 2 | 3 | 6 | ENG | S-02.2 + grep audit for `.single()` on settings | monitoring + error on empty | Open |
| R-17 | CPA/ASA complaint before fake ratings removed | 2 | 4 | 8 | PM | S-06.1 early (W5); removal is 2h once decided | takedown = same 2h change, emergency deploy | Open |
| R-18 | Variant parent delete wipes 244 variants (if CASCADE FK in prod) | 2 | 4 | 8 | OPS | S-01.6 verifies; if CASCADE → urgent fix ticket | don't delete parents until verified | Open — verify W0 |
| R-19 | gtag loader missing → months of "analytics" never recorded | 3 | 2 | 6 | ENG | U-04 in S-01.4 | wire GTM in S-10.1 | Open |
| R-20 | `.env.example` drift continues (no prod env list) | 3 | 3 | 9 | ENG | env matrix S-01.4; `.env.example` S-08.3 | quarterly env audit row in governance | Open |
| R-21 | **Legal entity undisclosed** — ECTA s43 breach territory; terms unenforceable; no compliant invoices possible | 4 | 4 | **16** | PM | S-06.6 + PM supplies entity data W1 | publish partial (name+email) while awaiting full data | Open — PM data required |
| R-22 | Terms contradict product (50% deposit vs full checkout charge) — dispute ammunition for customers | 3 | 3 | 9 | PM | S-06.6 terms re-issue per D-16 | temporary banner clarifying full-payment terms | Open |
| R-23 | Resend sender domain mismatch (`aircons-store.co.za` vs site) → order emails spam-foldered or look phishing-y | 3 | 4 | 12 | OPS | CF-74 verify in S-01.4; DNS auth both domains | switch sender to verified domain; fallback owner-notification channel | Open — verify W0 |
| R-24 | Rate-limit keys on spoofable XFF → checkout spam/abuse even with Upstash configured | 3 | 3 | 9 | ENG | S-01.8 trusted-IP helper | temporarily tighten limits; Turnstile | Open — verified in code |

## Risk heatmap

```
Impact 5 | R-06 R-07        | R-01 R-03
Impact 4 |                  | R-02 R-04 R-05 R-09 R-10 R-12 R-14 R-17 R-18
Impact 3 |                  | R-08 R-11 R-16 R-20
         |  P 1–2           |  P 3–5
```

**Live-bleed risks (act before the plan even starts):** R-01, R-02, R-05 — all three are fixed by Phase-0/early-Phase-1 tasks, which is why Phase 0 exists.
