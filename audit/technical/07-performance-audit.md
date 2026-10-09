# 07 — Performance Audit

No load tests, RUM, or Core Web Vitals data exist — findings are static-analysis based. UNKNOWNs flagged.

## Rendering model
- `/products` and `/deals` use `force-dynamic` (`products/page.tsx:13`, `deals/page.tsx:7`) — every request hits Supabase. Most catalog pages use the cookie-bound server client → also dynamic.
- **No caching layer**: no `unstable_cache`, no ISR, no `revalidate` on catalog queries, no CDN cache tuning. Every pageview = Postgres round-trips (product + variants + collections + settings + 3 config tables ≈ 6+ queries on PDP).
- Product detail page fetches: product row, siblings (`parent_product_id`), collections, settings, installation tiers/kits, warranty, maintenance — ~8-12 queries per PDP render (worktree `products/[slug]/page.tsx`).

## Frontend payload
- **Images:** product cards use plain `<img>` (`ProductCard.tsx:418`) not `next/image` → no responsive sizing, lazy-loading only browser-default, no format negotiation.
- **`public/` = 38MB / 288 files**, including multiple 4x-upscaled PNGs >500KB (e.g. `Hero Images/*upscayl*4x.png`, `footer image.png`). Served unoptimized from Vercel.
- Google Fonts (Inter, Poppins) via `next/font` ✅ + local variable font `GoogleSansFlex` (TTF variable — large single file; OK).
- Embla carousel + framer-motion + photoswipe on critical paths — JS weight UNKNOWN (no bundle analysis in repo; `next build` output not captured for route sizes).
- `suppressHydrationWarning` + localStorage cart hydration — correct pattern but `useCart` returns silent NOOP outside provider (cart actions fail silently if a component mounts outside the tree).

## Serverless latency factors
- Middleware runs `supabase.auth.getUser()` on **every non-API request** — an Auth-server round trip (~network RTT) added to every pageview TTFB. Consider skipping for anonymous catalog traffic or caching the JWT check.
- `rateLimit()` in checkout does 2 sequential Upstash HTTP calls; adds ~50-150ms when enabled — fine.
- `resolveOrderPricing` is efficient: 1 product query + 4 parallel config fetches.
- `sitemap.ts` does unbounded `products` SELECT at request time — cache or precompute.

## Scalability assessment
- Traffic ceiling: serverless + Postgres direct connections. Supabase pooler exists (`.temp/pooler-url`) but server client config doesn't show explicit pooling — Supabase-js uses PostgREST HTTP, so connection pressure is low. OK to ~thousands of concurrent browsers.
- No queue/backpressure for the order-email trigger — `pg_net` fire-and-forget; email loss on failure is silent.
- Horizontal scaling: app is stateless (cart in localStorage) ✅ — scales trivially.

## Bottleneck ranking
1. Per-request `getUser()` in middleware (every pageview).
2. 8-12 un-cached DB queries per PDP.
3. Unoptimized multi-MB hero PNGs + `<img>` without sizing.
4. Full-table sitemap scan per request.

## Recommendations
- ISR/`unstable_cache` on catalog reads (products change rarely; revalidate on admin write or 60-300s TTL).
- Migrate `<img>` → `next/image`; convert oversized PNGs → WebP/AVIF; add Supabase hostname to `remotePatterns` if storage images are used.
- Limit middleware `getUser()` to paths that need auth (`/account`, `/checkout` header state) or accept the RTT explicitly.
- Add `Cache-Control` on sitemap/robots; measure CWV via Vercel Analytics or web-vitals reporting before optimizing further.
