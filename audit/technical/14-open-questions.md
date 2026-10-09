# 14 — Open Questions (TRD Blockers)

## Deployment & access (blocking P0 verification)
| # | Question | Needed to | Access required |
|---|---|---|---|
| OQ-01 | Does Vercel auto-deploy from `main`/HEAD, or another branch? Was the last deploy before or after the uncommitted fixes were written locally? | Confirm whether prod runs vulnerable HEAD code | Vercel project settings |
| OQ-02 | Has `supabase/migrations/20260925_audit_hardening.sql` been run in the prod dashboard? | Close SEC-03 | Supabase dashboard → run the verify query at file end |
| OQ-03 | Which `parent_product_id` FK exists in prod — `ON DELETE CASCADE` (20250728) or `SET NULL` (root file)? | Safe product deletes; variant cleanup | `pg_constraint` query on prod |
| OQ-04 | What PII retention periods are legally required/acceptable (quotes vs paid orders vs tax records)? | Finalize TR-DB-002 cron windows | Accountant/legal |

## Product/business decisions
| # | Question | Blocks |
|---|---|---|
| OQ-05 | Should deals actually discount at checkout (real coupon pricing) or is "deal" marketing copy only? Currently checkout always charges catalog price. | R-17; potential advertised-price mismatch risk |
| OQ-06 | Is stock enforcement wanted (decrement/reserve) or is manual availability confirmation the operating model? If manual, remove stock fields from UI. | R-28, TR-DB schema |
| OQ-07 | Scope of `/admin`: orders-only (mark paid/fulfil/refund) or catalog management too (products/images/pricing)? | R-15 estimate |
| OQ-08 | Will Payfast go live? If yes: merchant creds live-ready? Passphrase set? Settlement account for ITN amount validation? | TR-PAY-002 gate |

## Environment unknowns
| # | Question | Blocks |
|---|---|---|
| OQ-09 | Production env vars present? Specifically `UPSTASH_*`, `TURNSTILE_*`, `PAYFAST_*`, `NEXT_PUBLIC_SITE_URL`, `RESEND_*`, `ORDER_WEBHOOK_SECRET`, `OWNER_EMAIL`. | SEC-05/06 severity finalization (fail-open behavior in prod) |
| OQ-10 | Is gtag/GTM installed outside the repo (e.g., via Vercel integration or GTM snippet in hosted config)? Events are pushed but no loader found. | GAP-017 (tracking dead or live) |
| OQ-11 | Resend domain authentication status (SPF/DKIM/DMARC) for the sender domain? | R-16, email deliverability |
| OQ-12 | Supabase plan tier → backup/PITR capability? | TR-DR-001 targets |
| OQ-13 | Who owns the `admins` table membership today — is at least one real admin user_id seeded? | /admin RLS gating |
| OQ-14 | Team size & maintainer model — solo dev, agency, internal team? Affects CI/PR-process recommendations. | Roadmap ownership column |

## Consolidated "access needed to finish verification"
1. **Supabase dashboard** (or service-role SQL): run `pg_policy` verify + `pg_constraint` variant FK check + confirm `payment_providers` rows + confirm cron jobs exist.
2. **Vercel project**: confirm deploy branch, last deploy SHA vs `1552a6e`, env var presence (names only), and whether gtag is injected platform-side.
3. **DNS/Resend**: sender-domain auth status.
4. **Payfast dashboard**: merchant config + passphrase status (only if enabling).
