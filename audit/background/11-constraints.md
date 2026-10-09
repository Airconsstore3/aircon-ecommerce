# 11 — Constraint Context

| Type | Constraint | Evidence / Basis | Type |
|---|---|---|---|
| Budget | Lean, near-zero marginal-cost stack: Vercel free/hobby tier (INFERRED), Supabase free/pro, Upstash optional, Turnstile free, Resend low tier | No paid infra visible; optional integrations "gracefully skip" if unconfigured | INFERRED |
| Team | Solo founder-operator; no dev team, no support staff, no admin staff | Single committer; manual ops everywhere | INFERRED (strong) |
| Skills | AI-dependent development; owner's direct engineering depth UNKNOWN; ops = Supabase dashboard SQL | Vibe-commit pattern, AGENTS.md, audit docs | INFERRED |
| Time | ~4-month build (June–Sept 2026) with bursts of daily commits | Git history | Fact |
| Technical | No admin UI (deleted); inventory not enforced; no shipping engine; guest-only checkout; single currency/locale | Code | Fact |
| Legal | POPIA/CPA/ECTA applicable; entity unknown → disclosure duties unmet; VAT status unknown | Legal context doc | Fact/UNKNOWN |
| Market | ZA-only (phones +27-only, ZAR-only, Payfast) — no internationalization path built | Code | Fact |
| Payments | EFT manual confirmation doesn't scale; Payfast disabled pending production creds + sandbox ITN test | `ECOMMERCE_FIX_PLAN.md` | Fact |
| Channel | WhatsApp-dependent funnel — Meta policy changes/outages are a single-point dependency | Architecture | INFERRED risk |
| Data | 90-day PII purge (claimed) limits customer-history analytics; 48h order-link expiry | Privacy page | Fact |
| Hosting | Tightly coupled to Vercel + Supabase; no IaC/DR docs | — | Fact |

## Design implication of constraints

Every feature decision should assume: **one operator, no engineers, no support desk, ZA-only, ZAR-only, WhatsApp-first customers, manual fulfilment**. Features that require back-office staffing (live chat SLAs, real-time inventory, returns portals) are out of budget; features that reduce manual ops (minimal admin panel, order status automation) are the highest-leverage investments.
