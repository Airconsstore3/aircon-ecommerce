# 10 — Stakeholder Context

## Identified parties

| Party | Role | Evidence | Confidence |
|---|---|---|---|
| "Sim" — `simbachivas98@gmail.com` (Sim846) / `airconsstore3@gmail.com` (Airconsstore3) | Founder/developer/owner — sole committer, owns GitHub org, receives owner emails at info@ | Git history, `.git/config`, edge fn `OWNER_EMAIL` | INFERRED — same person via "fix author" commit; name "Sim" from email handle; needs confirmation |
| AI coding agent(s) | Primary implementer | Audit docs, AGENTS.md, skills-lock.json, vibe-commit pattern | INFERRED — which tool(s) UNKNOWN |
| Supabase project `mrufsvbnxysgpjpnpuhb` | Production backend | Migration URL | Fact |
| `info@` / `support@` / `privacy@` `@airconsstore.co.za` | Business inboxes (Google Workspace? UNKNOWN) | Legal pages | Fact (addresses); provider UNKNOWN |
| WhatsApp `+27767100588` | Business channel — the real operator endpoint | `20260710_set_whatsapp_number.sql` | Fact |
| Resend account | Transactional email provider | Edge fn | Fact |
| Payfast merchant account | Payment provider (dormant) | Env vars exist | Fact (configured); KYC status UNKNOWN |
| `admins` DB table | Exists in schema — who are its members? UNKNOWN | `20260710085327_checkout_orders_flow.sql` | Fact |
| Brand suppliers (Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York) | Product OEMs — distributor relationships UNKNOWN | About page logos | INFERRED reseller |
| Installer network | "Accredited installers" claimed — identities/contracts UNKNOWN | Site copy | UNKNOWN |
| Investors/advisors/agencies | None visible | — | UNKNOWN, ASSUMED none |

## Key gaps

- No named human anywhere in the product (no "founder/team" page).
- `admins` table membership unknown — settings RLS (20260925) delegates read to it.
- No documented contractor/agency relationships; `SHADCNBLOCKS_API_KEY` implies a paid component license held by someone.
- Email alias ownership & mail routing unknown (info@/support@/privacy@ all cited but provider undocumented).
