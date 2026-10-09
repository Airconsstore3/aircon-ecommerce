# 08 — System Sizing

**Currency: ZAR. Region: South Africa. Stack: Vercel (Next.js SSR) + Supabase Postgres +
Upstash Redis + Resend + Cloudflare Turnstile.**

**Volume inputs:** `UNKNOWN — not provided`. AGENTS.md reports 438 published products.
Sizing below is scenario-modelled; label everything as estimates.

## 1. Per-order storage cost

From `07-data-model-audit.md`:

| | Bytes/order |
|---|---|
| Today (orders + items JSONB + order_items + payment) | ~7 KB |
| To-be (+payment_events +delivery+events+audit_log, DB only) | ~15 KB |
| PoD photos/signatures (object storage) | ~0.5 MB |

DB growth/year = orders/day × 365 × row size:

| Orders/day | DB/yr (today) | DB/yr (to-be) | Object storage/yr |
|---|---|---|---|
| 50 | 128 MB | 274 MB | 9 GB |
| 300 | 766 MB | 1.6 GB | 55 GB |
| 3,000 | 7.7 GB | 16 GB | 548 GB |
| 30,000 | 77 GB | 164 GB | 5.5 TB |

## 2. Throughput model

Assume: 8× peak-to-average ratio (ecommerce, lunch/evening peaks); 10 storefront page
views per order; ~2 checkout attempts per completed order; 1–3 webhook deliveries per
payment attempt (Payfast retries on non-200).

| Metric | Small (50/day) | Medium (300/day) | Large (3,000/day) | XLarge (30,000/day) |
|---|---|---|---|---|
| Storefront pg views/day | 500 | 3,000 | 30,000 | 300,000 |
| Peak concurrent browse | ~5 | ~30 | ~300 | ~3,000 |
| Checkouts/day | 100 | 600 | 6,000 | 60,000 |
| Peak checkouts/hr | ~33 | ~200 | ~2,000 | ~20,000 |
| Peak checkouts/sec | 0.01 | 0.06 | 0.56 | 5.6 |
| Payment API calls/sec (peak) | <0.1 | <0.5 | ~3 | ~30 |
| Webhook deliveries/sec (peak) | <0.1 | <0.5 | ~3 | ~30 |
| Driver app concurrent conn. | n/a | ~10–30 | ~100–300 | ~1,000+ |
| DB writes/sec (peak, all) | <1 | ~3 | ~30 | ~300 |

## 3. Scenario sizing

| Scenario | Orders/Day | App (Vercel) | DB (Supabase) | Redis | Object Storage | CDN | Cost/Month (ZAR) | Bottleneck |
|---|---|---|---|---|---|---|---|---|
| **Small** | <100 | Vercel Hobby/Pro, serverless — no sizing needed | Supabase Free/Pro, 2 vCPU shared, 8 GB disk | Upstash free/payg | Supabase Storage 1 GB incl. | Vercel CDN incl. | **~R0–900** (Vercel Pro $20 + Supabase Pro $25 ≈ R800, or R0 on free tiers) | None — single serverless path is fine |
| **Medium** | 100–1,000 | Vercel Pro ($20) — serverless autoscales | Supabase Pro + compute add-on Small→Medium (4 vCPU/8 GB, ~$10–60), 50 GB disk, PITR | Upstash ~$10 | ~10 GB (~$0.25/GB overage) | incl. | **~R1,700–3,500** | DB connection ceiling — enable Supavisor pooling; N+1 config fetches in `resolveOrderPricing` (11-table Promise.all per checkout) |
| **Large** | 1,000–10,000 | Vercel Pro/Enterprise ($20–400+) | Supabase Large/XL compute (8–16 vCPU/32–64 GB, ~$210–750), 200 GB disk, read replica for tracking queries (~$210) | Upstash ~$50 (rate limit + idempotency + queue) | ~100 GB + CDN egress | incl./Cloudflare | **~R9,000–25,000** | Postgres write IOPS on event tables; queue consumers (webhook processing) needed — move ITN/email to queued workers; DB WAL |
| **XLarge** | 10,000+ | Vercel Enterprise + ISR for catalog | Dedicated Postgres (16+ vCPU/128 GB) or RDS migration, partitioning on event tables, ≥2 read replicas, PITR + replica DR | Redis cluster | S3+CDN for PoD (TB-scale) | Cloudflare Pro | **~R40,000+** — needs real capacity planning | Everything above + hot-row contention on order_number_seq (fine — PG sequences scale); driver realtime (Supabase Realtime ~thousands of conns, may need dedicated broker) |

## 4. Right-sized recommendation for THIS store

**Now (assumed <50 orders/day):** Vercel Hobby/Pro + Supabase Pro + Upstash pay-as-you-go
≈ **R0–900/month**. The current architecture is correctly sized — the problem is missing
functionality, not capacity.

**Next stage (to-be delivery system at ~100–300/day):** Same tiers comfortably; add a
queue before adding compute. The first real scaling work is **not** bigger DBs — it's
moving ITN/email/PoD processing off the request path and adding connection pooling.

## 5. Sizing-relevant code observations

- `resolveOrderPricing` fires **11 parallel table queries per checkout** + product fetch +
  write path — at 60K checkouts/day that's ~1M queries/day just for config that changes
  weekly. Add a cache (Upstash, 5–15 min TTL) before Medium scale. (`server-pricing.ts:87-184`)
- `getEnabledProviders` + `getWhatsAppNumber` + settings lookups per checkout/confirmation —
  same caching argument.
- Rate-limit is two sequential Upstash REST calls per checkout (incr + expire) — fine at
  low volume; switch to an atomic Lua/Ratelimit SDK at Medium.
- `order-email` trigger does a synchronous `pg_net` POST per INSERT — cheap now; move to a
  queue (`pgmq`) at Medium for retry semantics.
