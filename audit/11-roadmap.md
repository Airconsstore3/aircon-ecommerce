# 11 — Roadmap

## 0–2 weeks — Emergency fixes & ops unblocking

| # | Item | Priority | Impact | Effort | Owner | Acceptance criteria |
|---|---|---|---|---|---|---|
| R1 | Apply `20260925_audit_hardening.sql` in Supabase dashboard; verify anon denied | P0 | Critical — closes last public write on orders | S | Owner/DevOps | `select`/`insert` as anon → permission denied; policy list reviewed |
| R2 | Rotate `ORDER_WEBHOOK_SECRET` (edge fn env + DB trigger); confirm email flow still fires | P0 | Critical — kills committed-secret exposure | S | DevOps | Test order → owner email arrives; old secret → 401 |
| R3 | Verify prod env vars: UPSTASH_*, TURNSTILE_*, RESEND_*, PAYFAST_*, NEXT_PUBLIC_GTM_ID/GA_ID | P0 | Defenses + analytics may be silently off | S | DevOps | Documented env matrix; gaps flagged |
| R4 | Fix checkout rate-limit IP extraction (x-real-ip/rightmost XFF, matching ITN route) | P0 | Rate limit currently evadable | S | Dev | Unit test: spoofed first XFF hop doesn't evade |
| R5 | Remove `getPlaceholderRating` rendering (hide ratings until real) | P1 | Kills CPA/misleading-ads exposure | S | Dev + Owner sign-off | No fabricated stars/counts anywhere |
| R6 | Remove/mock-gate `/account/subscriptions` + `/account/warranties` | P1 | Stops showing fake plans to real customers | S | Dev | Pages removed or sourced from order_items |
| R7 | Payfast sandbox end-to-end test; then enable in `payment_providers` | P1 | First online payment path | S | Dev + Owner | Sandbox order → ITN → paid confirmed on token page |
| R8 | Add Sentry (or equiv) + uptime probe | P1 | Silent failures become visible | S | DevOps | Checkout error appears in dashboard w/ alert |

## 2–6 weeks — MVP hardening (revenue operations)

| # | Item | Priority | Impact | Effort | Owner | Acceptance criteria |
|---|---|---|---|---|---|---|
| R9 | Minimal `/admin` order panel: list, search/filter, mark-paid, cancel, notes — gated by `admins` table | P0 | Removes manual DB edits per order | L | Dev | Admin toggles EFT → paid; audit log row; non-admin denied |
| R10 | Order lifecycle: `order_events` + statuses confirmed→scheduled→installed; confirmation page + account show status | P1 | Customer visibility; ops tracking | M | Dev | Status transitions persist + display; events logged |
| R11 | Delivery pricing: `delivery_zones` table + server-resolved fee + "quoted separately" fallback | P0 | Stops under-charging delivery | M | Dev + Owner (zone matrix) | Zone fee appears in totals; unmatched → flagged order |
| R12 | VAT line + invoice PDF + invoice numbering (if VAT-registered — Q-04) | P0 | Legal invoicing | M | Dev + Accountant | Paid order → compliant PDF invoice |
| R13 | Post-payment confirmation email (+ receipt/invoice) | P1 | Receipt for EFT+Payfast payers | S | Dev | ITN/admin mark-paid → customer email |
| R14 | Require email OR add "order lookup" (order no + phone) for guests | P1 | Orphaned orders become findable | S | Dev | Guest recovers banking details without the link |
| R15 | Decide + implement deal-pricing policy (write `sale_price_zar` windows or server-resolve deals) | P1 | Advertised price honoured | M | Dev + Owner | Deal price = charged price, or deal CTA clearly says "from" |
| R16 | Inventory decision: decrement `stock_count` in `create_order` RPC + auto sold-out, OR remove stock UI | P1 | Oversell control or honesty | M | Dev + Owner | Qty>stock rejected, or no stock claims shown |
| R17 | Atomic `create_order` Postgres function (order+items+payment+decrement) | P1 | Removes last non-atomic path | M | Dev | Failure → zero rows; happy path unchanged |
| R18 | Wire newsletter signup to `newsletter_subscribers` + confirm email | P2 | Captures leads | S | Dev | Signup persists; double opt-in |

## 6–12 weeks — Growth & optimization

| # | Item | Priority | Impact | Effort | Owner |
|---|---|---|---|---|---|
| R19 | Site search (brand/model/BTU) + navbar entry | P1 | Discovery on 438 products | M | Dev |
| R20 | Full analytics funnel: view_item → add_to_cart → begin_checkout → purchase (paid only) | P1 | CVR/AOV measurable | M | Dev/Marketing |
| R21 | Promo codes at checkout (`promotions.code`) | P2 | Campaign capability | M | Dev |
| R22 | Admin product CRUD + image upload (Supabase storage) | P2 | Owner edits catalog without dev | L | Dev |
| R23 | Refund workflow (`refunds` table + admin action + status + email) | P1 | Audited refunds | M | Dev |
| R24 | ISR caching for catalog pages; image audit (kill `<img>`) | P2 | Perf | M | Dev |
| R25 | SEO: variant canonicals, categories/collections sitemap, OG image | P2 | Organic reach | S | Dev |
| R26 | POPIA self-service export/delete; extend retention cron to terminal states | P2 | Compliance | M | Dev |
| R27 | Playwright e2e suite + unit tests importing real functions | P1 | Regression safety | M | Dev/QA |

## Later bets

- Server-side cart for logged-in users (cross-device + abandoned-cart emails).
- Real review platform integration (Trustpilot assets already in repo).
- Installer scheduling UI (book install dates from `order_events`).
- B2B/trade accounts with quote workflows (extension of enquiry-only model).
- Money model migration to cents/numeric.
- Abandoned-cart recovery via WhatsApp opt-in.
- AI product finder ("what BTU for my room") → collection recommendations.

## Dependency notes

- R9 (admin) unblocks R10, R23, R22 and makes R7's output visible.
- R12 needs Q-04 (VAT status) answered before build.
- R11 needs owner's delivery fee matrix (Q-05).
- R17 is cleaner before R16 (decrement lives inside the RPC).
