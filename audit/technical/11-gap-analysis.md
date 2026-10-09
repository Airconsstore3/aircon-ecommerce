# 11 — Gap Analysis vs Production Ecommerce Baseline

Severity: Critical/High/Medium/Low · Effort: S(<1d)/M(1-5d)/L(1-4w)/XL(>4w) · Priority: P0 emergency/P1 high/P2 medium/P3 low.

| ID | Area | Gap | Evidence | Severity | Technical impact | Business impact | Recommendation | Effort | Priority | Dependencies |
|---|---|---|---|---|---|---|---|---|---|---|
| GAP-001 | DevOps | Security fixes uncommitted ~2 weeks; production runs pre-hardening code | `git status` (36 files); `git show HEAD:` diffs | **Critical** | Known-exploitable paths live: unauth order mutation, open email relay, spoofable ITN | Fraud/PII exposure | Commit+deploy immediately; add branch protection | S | **P0** | none |
| GAP-002 | DevOps | `20260925_audit_hardening.sql` never applied — anon INSERT on orders + open settings read persist in prod | untracked migration; `20260817c` permissive policy | **Critical** | Order spam + email relay; banking config readable by any account | Fraud, data abuse | Apply in dashboard; run verify query | S | **P0** | dashboard access |
| GAP-003 | Security | `ORDER_WEBHOOK_SECRET` in git history | `20260710085328:9` | **Critical** | Secret permanently exposed; email trigger spoofable | Spam/phishing via owned domain | Rotate secret; update trigger fn; scrub docs | S | **P0** | edge-fn env access |
| GAP-004 | Dependencies | next 16.3.6 < 16.3.8 — 5 high CVEs (image SSRF, sharp, cache poisoning) | `pnpm audit --prod` | High | SSRF → internal network reach; cache poisoning | Defacement, data leak | `pnpm add next@16.3.8` + build | S | **P0** | — |
| GAP-005 | DevOps | No CI/CD — nothing enforces lint/test/build/audit | no `.github/` | High | Regressions ship silently; recurrences of GAP-001 | Chronic quality risk | GitHub Actions workflow + required checks | S | **P0** | repo admin |
| GAP-006 | Payments | No admin UI — orders/EFT confirmation done in Supabase dashboard with service-level access | no `/admin` route; `nextadmin-template` gitignored | High | No audit trail on payment confirmation; fat-finger writes | Revenue leakage, disputes | Minimal `/admin` gated by `admins` table (list/confirm/refund-flag orders) | L | P1 | auth roles exist |
| GAP-007 | Observability | No error tracking, alerting, uptime monitoring | console.* only | High | Failures invisible (email loss, ITN failures, checkout errors) | Silent revenue loss | Sentry + BetterStack/UptimeRobot + alert rules | S | P1 | — |
| GAP-008 | Database | PII retention cron misses address fields; only `submitted` orders anonymized | `20260710085327:87-103` | High | PII persists indefinitely → POPIA exposure | Regulatory | Extend cron: all terminal states, all PII cols | S | P1 | — |
| GAP-009 | Security | No security headers (CSP/HSTS/XFO/nosniff) | `next.config.ts`, middleware | High | Clickjacking, MIME sniff, downgrade exposure | Moderate | `headers()` in next.config + CSP policy | S | P1 | — |
| GAP-010 | Security | Rate limit + Turnstile fail open; RL keyed on spoofable first-hop XFF | `actions.ts:135,156` | High | Bot abuse, checkout spam if envs missing | Fraud/spam | Fail-closed option + trusted-IP extraction | S | P1 | Upstash/Turnstile envs |
| GAP-011 | Testing | Tests re-implement code; no critical-path coverage | `payment-security.test.ts` | High | No regression safety net | Chronic | Import real fns; add checkout/RLS integration tests | M | P1 | test Supabase project |
| GAP-012 | Payments | Payfast passphrase optional → forgeable signature if enabled without it | `payfast.ts:139` | High | Forged "paid" orders if enabled carelessly | Direct fraud | Hard-fail when mode=live && provider enabled && !passphrase | S | P1 | before enabling Payfast |
| GAP-013 | Database | Non-transactional order creation (compensating delete is best-effort) | `actions.ts:321-380` | Medium | Orphaned orders possible under failure races | Order data integrity | `create_order` RPC transaction | M | P2 | — |
| GAP-014 | Database | No fulfillment state; `completed`=paid conflation | orders schema | Medium | Can't track delivery/installation lifecycle | Ops blind spot | Add `fulfillment_status` enum + admin transitions | M | P2 | admin UI |
| GAP-015 | Frontend | Fake ratings rendered to customers | `page.tsx:121` | Medium | — | **CPA/consumer-law risk in SA**; trust damage | Remove placeholder ratings | S | P1 | — |
| GAP-016 | Frontend | Mock subscriptions/warranties shown in `/account` | `account/subscriptions|warranties/page.tsx` | Medium | Customers see fabricated entitlements | Trust/legal | Remove or wire to real tables | S | P1 | — |
| GAP-017 | Frontend | No gtag/GTM loader — conversion tracking dead | `LeadTracking.tsx` | Medium | Marketing data never collected | Ad-spend blindness | Install GTM/gtag + verify event | S | P2 | marketing IDs |
| GAP-018 | Payments | No refund flow (enum exists, no code) | payments CHECK | Medium | Manual DB edits for refunds | Ops friction | Admin refund action + status write-back | M | P2 | admin UI |
| GAP-019 | Database | Inventory advisory only — no decrement/reservation | `server-pricing.ts:317` | Medium | Oversell possible | CX risk (accepted manually today) | Decide policy; decrement on paid | M | P2 | business decision |
| GAP-020 | Frontend | No site search | — | Medium | Discovery friction on 438 SKUs | Conversion | Postgres FTS or Typesense/Algolia | M | P2 | — |
| GAP-021 | Perf | No caching; 8-12 DB hits/PDP; per-request `getUser()` | sections above | Medium | TTFB cost + Supabase load | UX/SEO | ISR/unstable_cache; trim middleware scope | M | P2 | — |
| GAP-022 | Frontend | `<img>` not next/image; 38MB public dir; 4x PNGs | `ProductCard.tsx:418`; `du -sh` | Medium | Slow LCP on mobile | Conversion/SEO | Image pipeline + next/image migration | M | P2 | — |
| GAP-023 | Compliance | No self-serve data export/delete; manual POPIA process undocumented | — | Medium | SAR handling ad hoc | Regulatory | Document manual process; add deletion runbook | S | P2 | — |
| GAP-024 | Database | `orders.items` JSONB duplicate; `variant_id` unused; dual variant systems | 05-doc | Medium | Consistency + schema confusion | Maintenance | Canonicalize order_items; drop dead cols | M | P3 | — |
| GAP-025 | DevOps | No `.env.example`, no staging env, no backup/DR doc | 08-doc | Medium | Onboarding/drift; unquantified data-loss risk | Ops | `.env.example` + DR runbook + staging project | S | P2 | Supabase tier |
| GAP-026 | SEO | Variant pages self-canonical (244 near-dupes); no /categories in sitemap | `sitemap.ts` | Low | Index bloat | SEO | Canonicalize variants→parent | S | P3 | — |
| GAP-027 | Payments | Integer-rand money model | schema | Low | No cents possible | Edge pricing needs | Document decision; migrate to cents only if needed | XL | P3 | — |
| GAP-028 | Auth | No MFA for admin actions; no app-level auth rate limits | `(auth)/actions.ts` | Medium | Credential stuffing, account takeover | Fraud | Upstash bucket on auth actions; MFA for admin role | M | P2 | — |
| GAP-029 | Payments | Deals not purchasable at deal price (display-only discount) | deals flow | Medium | Price inconsistency vs advertised deal | Legal/CX | Server-side deal pricing or stop advertising deal prices | M | P1 | business decision |
| GAP-030 | Email | Resend deliverability unverified (SPF/DKIM/DMARC); no bounce handling | edge fn | Medium | Order emails may land in spam | Lost orders | Verify DNS auth; add bounce webhook | S | P1 | DNS access |

**P0 total:** 5 items (all S effort — deploy/hygiene tasks, not engineering).
**P1 total:** 10 items — the "real production hardening" tranche.
