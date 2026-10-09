# 08 — Estimation & Capacity

## Effort by epic (engineering hours)

| Epic | Must h | Should h | Could h | Total h | Days (@7h) |
|------|--------|----------|---------|---------|------------|
| E-01 Security stabilization (incl. PAT, rate-limit IP) | 19 | — | — | 19 | 2.7 |
| E-02 Order ops/admin | 36 | 15 | — | 51 | 7.3 |
| E-03 Lead capture | 14 | — | — | 14 | 2.0 |
| E-04 Chrome/nav/search | 36 | — | — | 36 | 5.1 |
| E-05 Checkout integrity (incl. RPC) | 8 | 32+16\* | 12 | 68 | 9.7 |
| E-06 Compliance/content (incl. entity+terms) | 15 | 12 | — | 27 | 3.9 |
| E-07 Design/a11y | 12 | 26 | — | 38 | 5.4 |
| E-08 DevOps/observability (incl. auth RL) | 10 | 13 | — | 23 | 3.3 |
| E-09 Payments/lifecycle | 2 | 28 | — | 30 | 4.3 |
| E-10 Growth | 4 | 6 | 12 | 22 | 3.1 |
| E-11 QA infra | 18 | 10 | — | 28 | 4.0 |
| E-12 UX polish/media | — | 25 | — | 25 | 3.6 |
| **Total** | **174** | **183** | **24** | **~381h** | **~54d** |

\* conditional: shipping zones +20h if chosen over flat-rate.

## Capacity check

| Phase | Effort (d) | Owners | Capacity avail (d) | Gap | Mitigation |
|-------|-----------|--------|--------------------|-----|------------|
| P0 Stabilize | 2.7 | ENG/OPS | 2.5 | −0.2 | PAT+migration are ops tasks — quick |
| P1 Foundation | 7.6 | ENG | 5.0 | **−2.6** | descope admin polish; 02.4/02.5/02.6 → Phase 5 |
| P2 Core flows | 9.4 | ENG+PM content | 10.0 | +0.6 | slack absorbs W3 content lag |
| P3 Hardening | 11.0 | ENG(+DES-C) | 7.5 | **−3.5** | cut S-07.4 tail, S-12.x, S-05.8 RPC; or hire DES-C 3–4d |
| P4 Launch gate | 3.6 | ENG+PM | 5.0 | +1.4 | — |
| P5 Post-launch | 9.3 | ENG | open | — | — |
| **Total plan** | **~52d eng** (Must+Should ≈ 357h) | 1 dev (confirmed solo founder) | **~34d** (25h×12×0.8 ÷7) | **−18d ≈ −34%** | cuts below |

## Overload warning

Plan is **~34% over** the confirmed-solo capacity before any surprises — and the P1/P3 phases are locally over by ~50%. If the real capacity is <25h/wk, or a second dev isn't available, apply cuts in this order:

1. **Cut:** S-10.2 coupons (−12h) — questionable fit for lead-gen model anyway.
2. **Cut:** S-07.4 tail — migrate top-20 files, defer remaining ~40 (−8h).
3. **Cut:** S-12.2 loading skeletons beyond submit buttons (−6h).
4. **Cut:** S-10.3 SEO variants-canonical → sitemap-exclude only (−2h).
5. **Cut:** S-12.3 filter polish beyond slider-max fix (−4h).
6. **Defer:** S-05.8 `create_order` RPC → Phase 5 (−8h; compensating delete suffices short-term).
7. **Defer:** S-02.4/02.5/02.6 fulfilment+emails+recon → Phase 5 (−23h from P1/P3 window).
8. **Defer:** S-09.2 refunds → post-launch (−10h).
9. **If still over:** contract a designer for W7–W8 (≈3–4d, market rate ~R6–10k/day in SA → ±R20–40k) — buys back ~4d and de-risks the a11y gate.

**Do NOT cut:** anything in Phase 0, S-02.1, S-02.3-core, S-03.1, S-04.1/04.2/04.3-or-icon-removal, S-06.1/06.2, S-07.1/07.2/07.3, S-08.1/08.2, S-11.1/11.2/11.3 — these are the "safe + honest + provable" spine.

## Cost estimate (no budget given — directional only)

| Item | Est. cost |
|---|---|
| Contract designer (optional) 3–4d | R20–40k |
| Sentry + UptimeRobot + Upstash + Turnstile | $0 tiers sufficient at this scale |
| Staging Supabase project | $0–25/mo |
| EXT-LEGAL review (terms/POPIA/CPA) | R8–20k (SA market, 1 review pass) |
| EXT-TAX VAT ruling | R2–5k one consult |
| Payfast | transaction fees only |
| Playwright/CI | $0 (GH Actions free tier for private repos is limited — check minutes) |

## Bus-factor mitigation

Solo dev — mitigate by: `AGENTS.md` kept current (it is), `09` runbooks, admin panel replacing SQL-tribal-knowledge, and a written "ops manual" deliverable in Phase 4 (part of GATE).
