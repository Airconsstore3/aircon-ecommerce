# 14 — Assumption Register

| ID | Assumption | Basis | Impact if wrong | Confidence | Owner to confirm |
|---|---|---|---|---|---|
| AS-01 | Sim846 = Airconsstore3 = the founder/operator | "fix author" commit; single-person commit style | Stakeholder map wrong | High | Founder |
| AS-02 | Store is live at airconsstore.co.za on Vercel | robots/sitemap fallback + commits + emails | Deployment model wrong | High | Founder |
| AS-03 | Business is bootstrapped, no external funding | No investor evidence; lean stack | Stakeholder section wrong | Medium | Founder |
| AS-04 | Reseller model — buys from distributors, no OEM direct agreements | Sells 8 major brands; no supply contracts in repo | Supply-chain section wrong | Medium | Founder |
| AS-05 | Installer work done by owner or informal subcontractors | "Accredited installation" claims; no staff evidence | Ops/legal risk understated | Medium | Founder |
| AS-06 | Business operates primarily Cape Town + ships nationally | Terms/CT address vs "nationwide delivery" copy | Delivery policy wrong | Medium | Founder |
| AS-07 | VAT vendor status unknown → treated as gap not violation | No VAT handling anywhere | If VAT-registered: non-compliance escalates to Critical | Low | Founder |
| AS-08 | AI built most of the codebase | Vibe-commit pattern + audit docs; no co-authors | Historical section wrong | High | Founder |
| AS-09 | `20260925_audit_hardening.sql` NOT yet applied | AGENTS.md says "must be applied manually"; no confirmation | If applied: risk R-03 downgrades; if not: anon INSERT on orders open | Medium | Founder/DB check |
| AS-10 | ORDER_WEBHOOK_SECRET never rotated | Still in git history + AGENTS.md warning | If rotated: R-02 resolves | Medium | Founder |
| AS-11 | GitHub PAT in .git/config is still valid | Present in local config | If rotated: R-01 resolves | Medium | Founder |
| AS-12 | Customers are ZA-resident consumers (B2C), no B2B credit terms | Guest checkout, consumer pricing | Personas/model wrong | High | Founder |
| AS-13 | Orders are fulfilled — i.e., real deliveries/installs happen | Business is live | If false: store is decorative/lead-gen only | Medium | Founder |
| AS-14 | WhatsApp number +27767100588 reaches the operator | Set in migration | Customer comms broken if wrong | High | Founder |
| AS-15 | Email aliases (info@/support@/privacy@) are live and monitored | Cited on legal pages | POPIA/complaints handling broken if unmonitored | Medium | Founder |
| AS-16 | The 90-day PII purge cron actually runs in production | Privacy page claims it | If false: POPIA retention misstatement | Low | Supabase check |
| AS-17 | Admin deletion was intentional (simplify), not accidental | No admin in HEAD; restore branches exist | If accidental: lost ops tooling to recover | Low | Founder |
| AS-18 | No international sales planned | +27-only phones, ZAR-only | Roadmap assumption wrong | High | Founder |
| AS-19 | Product images licensed/owned appropriately | Mixed local + Unsplash sources | Copyright exposure if OEM images scraped | Low | Founder |
| AS-20 | shadcnblocks license legitimately held | SHADCNBLOCKS_API_KEY present | License violation if pirated key | Medium | Founder |
