# Flow-to-Requirement Traceability Matrix

Maps each to-be flow (AFD-10) to findings (08), gaps (09), and roadmap items (14).

| To-be flow | Addresses findings | Addresses gaps | Roadmap phase |
|---|---|---|---|
| C-01 browse/search | F-06, F-16 | G-06, G-26 | P1 (search) / P0-fix links |
| C-02 PDP configure | F-17 (ratings), F-18 (enquiry) | G-22 | P0 (ratings) / P2 |
| C-03 cart | F-21, F-22, F-09-cart revalidation | G-18, G-30 | P2/P3 |
| C-04 checkout | F-13, F-14, F-11, F-18 | G-11, G-12, G-13, G-20 | P1 |
| C-05 payment | F-12, F-13, F-15, F-19 | G-10, G-11 | P1 |
| C-06 order status/history | F-09 | G-08 | P1 |
| C-07 auth | (working) + F-11 claim-on-signup | G-12, G-27 | P2 |
| C-08 profile/addresses | address book missing | G-12 | P2 |
| C-09 warranty reg/claim | F-03, F-07 | G-03, G-09 | P0 (stop fake) → P1 (real) |
| C-10 service booking | F-03 | G-03 | P0 (stop fake) → P1 (real) |
| C-11 contact | F-05 | G-07 | P0/P1 |
| C-12 coupon | F-10 | G-15 | P2 |
| C-13 newsletter | F-08 | G-17 | P2 |
| C-14 refund request | A30 missing | G-19 | P2 |
| C-15 order tracking | F-09, A31 missing | G-08, G-23 | P2 |
| AD-01–04 admin+orders | F-01, F-02 (partially), F-27 | G-01, G-14, G-23, G-35 | **P0** |
| AD-05 catalogue | B3–B8 | — | P2 |
| AD-06 service requests | F-03 (backend) | G-03 | P1 |
| AD-07 discounts | F-10 | G-15 | P2 |
| AD-08 reports | B18 | G-35 | P3 |
| S-02 atomic order RPC | F-19 | — | P2 |
| S-04 email all channels + retry | F-02, F-19, G-14 | G-14 | **P0 (channel fix) / P2 (retry)** |
| S-06 analytics funnel | C9 partial | G-16 | P2 |
| S-07 observability | F-20 | G-25 | P1/P2 |
| S-08 reconciliation cron | ITN-edge C3 | — | P2 |
| S-09 abandoned cart | A34 missing | G-18 | P3 |
| Ops: rotate secret + apply hardening | F-04 | G-04 | **P0** |
| Ops: verify Turnstile/Upstash/Payfast envs | F-05/G-05, F-28, F-29 | G-05 | **P0** |

## Coverage check

- Findings F-01..F-30 → all mapped to ≥1 to-be flow or ops task. ✔
- Customer checklist A1–A34 → missing items covered by C-01…C-15. ✔
- Admin checklist B1–B20 → covered by AD-01…AD-08. ✔
- System checklist C1–C13 → covered by S-01…S-09. ✔
