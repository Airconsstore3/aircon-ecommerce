# 02 — Tech Stack Inventory

Evidence: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `pnpm audit --prod` output (2026-10-09), `node -v` = v22.21.0.

## Runtime stack
| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router, Turbopack) | **16.3.6** | 5 high + 5 moderate/low advisories — all fixed in **16.3.8** (see below) |
| UI | React / react-dom | 19.2.4 | OK |
| Language | TypeScript | ^5 (5.9.3 installed) | `strict: true`; `tsc --noEmit` clean |
| Styling | Tailwind CSS 4 + tw-animate-css | ^4 | CSS-first config (no tailwind.config) |
| Component lib | shadcn/ui + Radix + Relume | mixed | `components.json` present |
| Validation | zod | 4.4.3 | server-side schemas in checkout |
| Forms | react-hook-form + @hookform/resolvers | 7.77 / 5.4 | checkout + auth forms |
| DB client | @supabase/supabase-js + @supabase/ssr | 2.108 / 0.12 | anon + service-role clients |
| Testing | vitest | 3.2.7 | 1 test file, 13 tests |
| Lint | eslint + eslint-config-next | 9 / 16.3.6 | 15 errors / 120 warnings (all `react-hooks/set-state-in-effect`) |
| Package mgr | pnpm (lockfile) — docs say npm | — | **mismatch**: `pnpm-lock.yaml` + `pnpm-workspace.yaml` vs `npm run` docs; no `engines` field |
| Node | 22.21.0 (local); prod UNKNOWN | — | no `engines` pin |

## Services
| Service | Role | Config location | Status |
|---|---|---|---|
| Supabase Postgres | System of record | `NEXT_PUBLIC_SUPABASE_URL` | Live |
| Supabase Auth | Customer accounts | same | Live |
| Supabase Edge Functions | `order-email` | `supabase/functions/order-email` | Deployed (assumed — linked project in `supabase/.temp`) |
| Supabase Storage | `product-images` bucket | `supabase/storage-setup.md` | Assumed live |
| Resend | Email | `RESEND_API_KEY` (edge fn env) | UNKNOWN — SPF/DKIM unverified |
| Payfast | Payments | `PAYFAST_*` envs | Implemented, **disabled** in `payment_providers` |
| Upstash Redis | Rate limiting | `UPSTASH_REDIS_REST_*` | Optional — **absent locally** |
| Cloudflare Turnstile | Bot protection | `TURNSTILE_*`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional — **absent locally** |
| Google Ads/gtag | Conversion tracking | none in repo | **Loader not found** — events may never fire |

## Dependency vulnerability snapshot (`pnpm audit --prod`, 2026-10-09)
**12 vulnerabilities: 5 high, 6 moderate, 1 low.**

| Sev | Package | Advisory | Fix |
|---|---|---|---|
| High | next 16.3.6 | SSRF in image optimization (GHSA-cjq9-62q9-8jv4) | next ≥16.3.8 |
| High | sharp <0.35.5 | librsvg CVE-2026-96889 | via next ≥16.3.8 |
| High | source-map-js | event-loop DoS (GHSA-68fv-2mgg-jv7q) | via next ≥16.3.8 |
| High | browserslist ×2 | OOM / prototype write (GHSA-c83g…, GHSA-73wf…) | via next ≥16.3.8 |
| Mod | next ×4 | SSG/ISR cache poisoning ×2, draft-mode leak, metadata image disclosure | next ≥16.3.8 |
| Mod | postcss-selector-parser | quadratic-complexity DoS | via @relume_io chain |
| Low | next | dev-server MCP endpoint info disclosure | next ≥16.3.8 |

**Action:** `pnpm add next@^16.3.8` + matching `eslint-config-next` resolves 9 of 12.

## Environment variable inventory
From `.env.local` (gitignored, verified never committed): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SHADCNBLOCKS_API_KEY` (live `sk_live_` dev-registry key — unnecessary in runtime env).

Referenced in code but **absent locally**: `PAYFAST_MERCHANT_ID/KEY/PASSPHRASE/MODE`, `UPSTASH_REDIS_REST_URL/TOKEN`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`, `RESEND_*`, `ORDER_WEBHOOK_SECRET`, `OWNER_EMAIL`. Production values UNKNOWN — **no `.env.example` committed**, so drift is likely.

## Licenses
Not audited per-package (UNKNOWN); direct deps are all permissive (MIT/Apache/BSD typical for this ecosystem). Recommend `license-checker` in CI.

## Repo hygiene
- 618 tracked files; 36 uncommitted changes (incl. all Sept-25 security fixes — see 00).
- `.env.local.backup` on disk (gitignored but a local copy risk).
- Stray `nul` file at repo root (Windows `2>nul` artifact).
- `nextadmin-template/` — nested separate project with own `node_modules`, gitignored, on disk (~size unknown).
- `tsconfig.tsbuildinfo` on disk, gitignored.
- Dead code: `src/lib/mock-data.ts`, `src/data/mock-products.ts`, unused `mapSupabaseProductToVariant` (`src/lib/fetch-featured-products.ts:145`).
