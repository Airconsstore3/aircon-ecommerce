# 08 — Non-Functional Requirements

## Security

| ID | Requirement | Current state | Target |
|---|---|---|---|
| NFR-SEC-1 | Service-role key never in client bundles | ✅ verified | keep; add CI grep check |
| NFR-SEC-2 | All public order reads token-gated (UUIDv4 `secure_token`) | ✅ | keep; add per-IP + per-token rate limit (exists when Upstash set — make mandatory in prod) |
| NFR-SEC-3 | No secrets in git | ❌ `ORDER_WEBHOOK_SECRET` in history | rotate; pre-commit secret scan (gitleaks) |
| NFR-SEC-4 | Rate limiting + bot protection at checkout | ⚠️ optional envs | mandatory in prod; fail-closed or alarm if unset |
| NFR-SEC-5 | Webhook verification: signature + source IP + server-to-server validate | ✅ post-fix | keep; add replay window check on `pf_payment_id` |
| NFR-SEC-6 | Security headers: CSP, HSTS, X-Content-Type-Options, frame-ancestors | ❌ none | add in `next.config.ts` or middleware |
| NFR-SEC-7 | Admin actions authorized server-side + audit-logged | n/a (no admin) | required for G-01 |
| NFR-SEC-8 | Dependency hygiene | ⚠️ pnpm audit was 63 findings; criticals fixed via next 16.3.6 | `pnpm audit --prod` in CI, fail on critical |
| NFR-SEC-9 | RLS on every public-schema table | ✅ | add migration lint step (`supabase db advisors` in CI) |

## Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-1 | PDP/PLP p95 TTFB < 800ms (SA networks), LCP < 2.5s on 4G | measure first — no baseline exists |
| NFR-PERF-2 | All images via `next/image` + remotePatterns for Supabase storage host | fix `<img>` lint warnings |
| NFR-PERF-3 | Catalog pages cacheable: ISR 5–15 min on `/products`, categories, collections; revalidate on product writes | replace `force-dynamic` where session not needed |
| NFR-PERF-4 | Checkout action p95 < 4s incl. pricing queries | parallel config fetches already; add timing logs |
| NFR-PERF-5 | DB: indexes on `orders(email)`, `order_items(order_id)`, `products(is_published, is_parent_product)` | verify existing indexes cover query shapes |

## Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-REL-1 | Order creation atomic | move to `create_order` RPC (single transaction) |
| NFR-REL-2 | Error monitoring | Sentry/equivalent on server actions + API + edge fn; alert on checkout failures |
| NFR-REL-3 | Uptime monitoring | external probe on `/` + `/products` |
| NFR-REL-4 | Backups | Supabase PITR/daily backups + documented restore drill |
| NFR-REL-5 | Degraded-mode behavior | if pricing config tables unreachable → fail closed on paid add-ons (don't silently price R0) |

## Accessibility (WCAG 2.1 AA targets)

- Keyboard-operable: nav, variant selectors, kit/warranty/maintenance modals, checkout form.
- Visible focus states; form errors announced (`aria-live`); labelled inputs (mostly OK via shadcn).
- Color contrast ≥ 4.5:1 — verify `#1C99D6` on white CTAs and muted text.
- Images need meaningful `alt` (product name at minimum).
- Target: axe-core clean on PDP + checkout.

## SEO

- Per-page titles/descriptions, canonical, OG/Twitter cards ✅ (exists — extend to categories/collections).
- Variants canonicalize to parent (decision) or stay self-canonical with unique titles.
- Real structured data only — **do not** add fabricated `aggregateRating` to JSON-LD (currently absent — keep it that way until real reviews).
- Sitemap: include categories/collections; consider paginating products.

## Compliance (South Africa)

| Requirement | State | Target |
|---|---|---|
| POPIA: privacy policy | ✅ `/privacy` | keep updated |
| POPIA: consent before analytics | ✅ consent-mode deny-by-default | keep |
| POPIA: data subject rights | ⚠️ manual | self-service export/delete |
| POPIA: retention | ⚠️ 90-day cron only on `submitted` | extend to all terminal states; document retention schedule |
| CPA: honest marketing | ❌ fake ratings | remove |
| CPA/ECTA: supplier details, T&Cs, returns | ✅ `/terms`, `/return-policy`, `/warranty` pages exist | verify content accuracy with owner |
| VAT invoices | ❌ | G-04 |
| Payment T&Cs / Payfast disclosure | ⚠️ | add payment-security copy at checkout |

## Internationalization/localization

- en-ZA only; currency ZAR; `Intl.NumberFormat('en-ZA')` consistent ✅. Phone validation SA-only ✅.

## Maintainability

- Pick one package manager (recommend pnpm — lockfile exists).
- Remove dead code: `mock-data.ts`, `mock-products.ts`, unused exports; archive stale docs (`AUDIT_REPORT.md`, `ADMIN_SETUP_GUIDE.md`) or mark superseded.
- Tests must import real functions (F-23); add checkout-resolver unit tests with seeded config fixtures.
