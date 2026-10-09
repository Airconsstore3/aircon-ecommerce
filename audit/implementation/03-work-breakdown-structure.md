# 03 — Work Breakdown Structure

12 epics → stories → tasks. Every item traces to a CF-xx finding (`01-consolidated-findings.md`).
Estimates: **S** <4h · **M** 4–8h · **L** 1–3d · **XL** >3d (task hours in parentheses).
Owner codes: **ENG** full-stack dev · **OPS** DevOps/DB ops (same person today) · **DES** design (ENG or contractor) · **PM** business owner · **EXT-TAX**/**EXT-LEGAL** external.
All tasks: Status = Todo unless noted.

---

## EPIC-01 — Production Security Stabilization
**Source findings:** CF-01, CF-02, CF-03, CF-17, CF-39, CF-40, CF-68 · U-01…U-09
**Objective:** Production runs the hardened code and the last open write-paths/secrets are closed.
**Success metric:** `git status` clean; prod deploy == committed HEAD; anon `SELECT/INSERT` on orders denied; secret rotated; `pnpm audit --prod` shows 0 high for `next`.
**Owner:** ENG+OPS · **Estimate:** L (~16h) · **Dependencies:** Supabase + Vercel dashboard access (U-02).
**Exit criteria:** all Phase-0 checkboxes in `06` green; smoke test prod EFT order path.

### STORY-01.1 — Commit, push, deploy the uncommitted fix set
**Source:** CF-01 (TRD-00). **User story:** As the business, I want production to run the reviewed security fixes, so customers aren't exposed to known-vulnerable code.
**Description:** Review `git diff` of the 36 files (they were already verified per `ECOMMERCE_FIX_PLAN.md`), commit logically (security fixes / new collections route / migration), push to `main`, confirm Vercel deploys it.
**Acceptance criteria:**
- Given the working tree, when I run `git status` after the commits, then it is clean and HEAD contains all Sept-25 fixes.
- Given Vercel deployment, when it completes, then `/api/payfast/itn` source == worktree version (spot-check a marker line) and `collections/[slug]` returns 200 on prod.
**Test plan:** `npm run build && npm run test && npm run lint` pre-commit; prod smoke: home→PDP→cart→checkout→confirmed.
**Rollback:** Vercel "redeploy previous" — DB untouched (migration is additive; do NOT apply it in this story).
**Estimate:** M (4h) · **Owner:** ENG · **Deps:** none · **Risk:** committing broken WIP — mitigate by commit-by-hunk review. **Analytics:** none. **DoD:** deployed + smoke-green.
Tasks:
- TASK-01.1.1 Stage+commit security fixes as `fix: apply sept-25 audit hardening` (2h) — done when `git status` clean.
- TASK-01.1.2 Push; verify Vercel build succeeds and prod serves new code (1h).
- TASK-01.1.3 Prod smoke: one real EFT checkout end-to-end on a test product (1h) — done when order row + owner email arrive.

### STORY-01.2 — Apply `20260925_audit_hardening.sql` and verify RLS
**Source:** CF-02 (PRD-F01). **As** the business, **I want** anon order spam impossible, **so** the orders table and email relay can't be abused.
**AC:** Given an anon Supabase client, when I `INSERT INTO orders` and `SELECT FROM orders`, then both are denied; and checkout (service role) still creates orders.
**Test:** dashboard anon-key curl before/after; live guest checkout after.
**Rollback:** re-grant statements are the inverse — document in runbook.
**Estimate:** S (2h) · **Deps:** 01.1 (deploy first so service-role path is live) · **Risk:** LOW — app uses service role.
Tasks: apply SQL in dashboard (0.5h) · verify deny + live checkout (1h) · record in decision log (0.5h).

### STORY-01.3 — Rotate `ORDER_WEBHOOK_SECRET`
**Source:** CF-03 (PRD-F02). **AC:** Given a POST to the edge fn with the OLD secret, when sent, then 401; with NEW secret → 200; order INSERT → owner email still arrives.
**Test:** curl old+new secret; place test order.
**Rollback:** restore previous env value in Supabase edge-fn secrets (keep both during a 10-min overlap window if possible).
**Estimate:** S (3h) · **Deps:** 01.1 · **Risk:** trigger function embeds old secret — must update both env and the `net.http_post` header in `20260710085328` function (or re-create trigger).
Tasks: generate new secret (0.5h) · set edge-fn env (0.5h) · update DB trigger function to new header value (1h) · test E2E (1h).

### STORY-01.4 — Production environment & config verification (spike)
**Source:** CF-40, CF-68, CF-74, CF-81, U-02/04/05/07/08/09. **AC:** Given the Vercel env page + Supabase dashboard + live-site view-source, when inventoried, then a written env matrix exists marking each var set/missing and each silent-skip defense on/off. **Must specifically answer:** are `TURNSTILE_*`/`NEXT_PUBLIC_TURNSTILE_SITE_KEY` set in prod? (If yes → CF-81 is a live checkout-blocker, escalate to same-day fix — either wire `.execute()` properly or unset the site key.) Is the Resend sender domain `aircons-store.co.za` (≠ site domain, CF-74) verified with SPF/DKIM?
**Estimate:** S (3h) · **Owner:** ENG+PM · **Deps:** dashboard access. **Done when:** env matrix appended to `13-decision-log.md`; gaps ticketed; Turnstile/domain verdicts recorded.

### STORY-01.5 — Upgrade `next` → ≥16.3.8
**Source:** CF-17. **AC:** `pnpm audit --prod` shows 0 high advisories for next/sharp/source-map-js; build+tests green; image optimization works on prod.
**Estimate:** S (2h) · **Deps:** 01.1 · **Rollback:** revert + reinstall.
Tasks: bump `next`+`eslint-config-next` (0.5h) · verify build/dev/smoke (1h) · audit re-run (0.5h).

### STORY-01.6 — Variant FK verification
**Source:** CF-39 (U-03). **AC:** `pg_constraint` inspected; actual delete behavior on `parent_product_id` documented; follow-up ticket if CASCADE present (parent delete wipes variants silently).
**Estimate:** S (1h) · **Deps:** dashboard access.

### STORY-01.7 — Rotate GitHub PAT + scrub remote URL
**Source:** CF-71 (BG-F-01 — VERIFIED: `https://Airconsstore3:ghp_…@github.com/…` in `.git/config`). **AC:** Given the old PAT, when used against the GitHub API, then 401 (revoked); remote URL contains no credentials (credential manager or SSH instead); `git push` still works.
**Estimate:** S (1h) · **Owner:** OPS · **Deps:** GitHub account access · **Risk:** lockout if creds removed before new auth works — test push before revoking.
Tasks: create replacement auth (SSH key or credential manager) (0.5h) · strip creds from remote URL (0.2h) · revoke old PAT in GitHub settings (0.3h).

### STORY-01.8 — Trusted-IP helper for rate limiting
**Source:** CF-76 (GAP-010 — verified `actions.ts:156` uses first-hop XFF, spoofable). **AC:** Given a request with attacker-controlled first XFF hop, when rate limiter resolves client IP, then it uses `x-real-ip` or rightmost XFF (same logic as hardened ITN route) — spoofed first hops share one bucket.
**Estimate:** S (2h) · **Deps:** none · **Rollback:** revert — but keep, the current behavior is the bug.

---

## EPIC-02 — Order Operations: Admin & Notifications
**Source:** CF-05, CF-06, CF-19, CF-16, CF-35, CF-69
**Objective:** Every order reliably reaches the owner, and the owner can manage orders without SQL.
**Success metric:** owner can confirm an EFT payment, advance an order through statuses, and cancel — without opening the Supabase dashboard; owner email fires for 100% of orders.
**Owner:** ENG · **Estimate:** XL (~48h) · **Deps:** EPIC-01 · **Exit criteria:** demo: place EFT order → owner email → mark paid in `/admin` → customer-visible status changes.

### STORY-02.1 — Owner notification for ALL channels
**Source:** CF-05 (FLOW-3). **AC:** Given an order with `channel='whatsapp'`, when inserted, then owner still receives an email (or equivalent) — the customer wa.me link becomes supplementary, not sole carrier.
**Test:** place orders with each of whatsapp/email/both; assert owner email each time.
**Rollback:** revert edge-fn change (whatsapp orders revert to current behavior — degraded, not broken).
**Estimate:** S (4h) · **Deps:** EPIC-01.3 · **Risk:** low. **Analytics:** none.
Tasks: remove channel-skip, always send owner mail (1.5h) · dedupe guard so wa.me click isn't required (1h) · test 3 channels + redeploy edge fn (1.5h).

### STORY-02.2 — Fix `settings` `.single()` on order-confirmed
**Source:** CF-19 (FLOW-DE3). **AC:** Given 0 or 2 settings rows, when a pending-EFT order is viewed, then banking block still renders (or a safe fallback); never throws.
**Estimate:** S (1h) — `.limit(1).maybeSingle()` + empty-state copy. **Deps:** none.

### STORY-02.3 — Minimal `/admin/orders` panel
**Source:** CF-06 (F-03/FLOW-1). **As** the owner, **I want** a password-protected orders list, **so** I stop hand-editing Postgres.
**Description:** Route group `/admin` gated by Supabase Auth + `admins` table membership (RLS exists already). List (status, payment_status, total, date, channel) → detail (items, address, timeline) → actions: mark EFT paid, cancel, mark fulfilled. Writes via server actions using service role after admin check.
**AC:**
- Given a non-admin logged-in user, when they hit `/admin/*`, then redirect/403; unauthenticated → login.
- Given an EFT order `payment_status=pending`, when admin clicks "Confirm payment", then `payment_status=paid`, `status` updated, `payments` row updated — transactionally.
- Given a submitted order, when admin cancels, then status=cancelled and it leaves the open queue.
**Test:** e2e admin login → confirm paid; negative: customer account blocked. **Rollback:** remove route group (orders still manageable in dashboard).
**Estimate:** XL (32h) · **Deps:** EPIC-01, admins table seeded with owner user · **Risk:** auth-bypass bugs — mitigate with server-side `admins` check on every action + RLS deny-by-default.
Tasks: admin auth guard + `/admin` layout (4h) · orders list page w/ filters (8h) · order detail page (8h) · server actions: markPaid/cancel/markFulfilled w/ compensating logic (8h) · owner user → `admins` seed + UAT (4h).

### STORY-02.4 — Order status lifecycle extension
**Source:** CF-16 (F-08). **As** a customer, **I want** to see my order progress past "paid".
**AC:** `orders.status` gains `confirmed → scheduled → delivered/installed` (or business-approved set); admin can advance; customer sees status on confirmation page + `/account/orders`. DB CHECK constraint migrated.
**Estimate:** L (12h) · **Deps:** 02.3 · **Risk:** enum migration needs prod apply — runbook entry.

### STORY-02.5 — Transactional email completeness (Should)
**Source:** CF-69, CF-61b. **AC:** payment-confirmed email on ITN/admin mark-paid; status-change email optional; templates branded (single layout, real logo, real contact info).
**Estimate:** M (8h) · **Deps:** 02.1, 02.3.

### STORY-02.6 — Stale-order reconciliation cron (Should)
**Source:** CF-89 (flows roadmap 2.8). **AC:** Given orders stuck `pending`/`processing` > N hours, when the pg_cron job runs, then owner gets an alert email listing them — nothing silently ages out.
**Estimate:** S (3h) · **Deps:** 02.1 mail path · **Rollback:** drop cron job.

**Historical context for this epic (CF-75):** an admin panel WAS built ~June 30 then deleted (`src/app/admin` removed; two restore/backup branches exist in git). Before building S-02.3, spend 0.5h checking `git log --all -- src/app/admin` — the deleted implementation may be recoverable and faster to harden than rebuild.

---

## EPIC-03 — Lead-Capture Integrity
**Source:** CF-04, CF-21
**Objective:** No customer submission is ever silently dropped again.
**Success metric:** every form on the site either persists + notifies, or is removed.
**Owner:** ENG · **Estimate:** L (~14h) · **Deps:** EPIC-01 · **Exit:** maintenance/repairs/warranty submissions land in DB + owner email; newsletter wired or deleted.

### STORY-03.1 — `service_requests` persistence + notification
**Source:** CF-04 (FLOW-2). **As** a customer, **I want** my booking request actually delivered.
**Description:** New table `service_requests` (type: maintenance|repair|warranty_claim|install_booking; name/phone/email/suburb/service/date/notes; consent; created_at). One shared server action `submitServiceRequest` (zod, honeypot, rate-limit reuse). Owner email via existing edge-fn path or new template.
**AC:** Given each of the 3 forms, when submitted, then row persists + owner notified + user sees honest confirmation (or honest error on failure).
**Rollback:** revert forms to `preventDefault` is NOT acceptable — rollback = point forms at wa.me deep-link fallback.
**Estimate:** M (10h) · **Deps:** EPIC-02.1 (reuse mail path) · **Risk:** new RLS surface — INSERT-only anon policy + honeypot.
Tasks: migration + RLS (2h) · shared server action + zod (3h) · wire 3 forms w/ error states (4h) · owner-email template (1h).

### STORY-03.2 — Newsletter: persist or remove
**Source:** CF-21 (F-11/FLOW-6). **AC:** Given the footer subscribe + deals-alert forms, when submitted, then either email lands in a `newsletter_subscribers` table (with unsubscribe path) or the forms are deleted from markup.
**Estimate:** S (4h) · **Deps:** decision (PM). Recommend table + CSV export — cheap.

---

## EPIC-04 — Chrome, Navigation & Discovery
**Source:** CF-07, CF-08, CF-09, CF-10, CF-18, CF-20, CF-25, CF-50, CF-70(partial)
**Objective:** Customers can navigate, find, and trust the store on every page.
**Owner:** ENG(+DES-C optional) · **Estimate:** XL (~36h) · **Deps:** EPIC-01 · **Exit:** zero 404s reachable from live chrome; footer on all shop pages; working search; account IA exists.

### STORY-04.1 — Global footer in `(shop)` layout
**Source:** CF-07. **AC:** Given `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/categories/*`, `/deals`, then footer renders with working links only (subset of 04.2). Homepage keeps single footer (no dupes).
**Estimate:** M (6h) · **Deps:** 04.2 link list agreed. **Rollback:** layout revert.

### STORY-04.2 — Link-graph repair: build 4–6 pages, prune the rest
**Source:** CF-08, CF-20, CF-83. **AC:** Given every nav+footer link, when clicked, then 200 (or deliberately removed). Build `/contact`, `/faq`, `/shipping` (doubles as the missing shipping policy, CF-83), `/returns` (return-policy exists — redirect or merge), `/cookies` (banner references it, CF-83); remove links to `/blog`, `/brands`, `/account/wishlist|settings|saved|alerts|recent`, `/book-installation` (or route to `/installation#book`); fix `/categories/kits|heat-pumps|portable` links → real category slugs or remove.
**Estimate:** L (14h) · **Deps:** PM supplies real copy/contact details (CF-20) + entity details for legal pages (CF-72). **Risk:** none.

### STORY-04.3 — Site search (Postgres FTS)
**Source:** CF-09. **AC:** Given the nav search icon, when clicked, then a search UI opens; typing ≥2 chars queries `name/description/brand` via FTS/`ILIKE` and shows product results; empty state handled; URL `/search?q=` shareable.
**Test:** known-brand query returns its products; gibberish → empty state.
**Estimate:** M (12h) · **Deps:** none · **Risk:** perf — index `to_tsvector` column; 438 rows makes this trivial anyway.
Tasks: `search_products` RPC or FTS index (3h) · `/search` page + result cards (5h) · nav icon → command-palette/page wiring (3h) · a11y (labels, keyboard) (1h).

### STORY-04.4 — Dead Google OAuth buttons
**Source:** CF-10. **AC:** buttons either wired via `signInWithOAuth` or removed from login+signup. Recommend remove (no Google provider configured).
**Estimate:** S (1h) · **Deps:** PM decision — removal default.

### STORY-04.5 — `/account` index + sub-navigation
**Source:** CF-50. **AC:** `/account` → redirect or dashboard page; persistent account nav (orders/profile[/subs/warranties per CF-22 decision]); active-state styling.
**Estimate:** S (4h) · **Deps:** CF-22 decision.

### STORY-04.6 — Real pagination or honest removal
**Source:** CF-25. **AC:** Either server-side pagination (?page=) or remove the control (infinite scroll optional). No dead buttons ship.
**Estimate:** S (4h) — recommend real pagination, 24/page. **Deps:** none.

### STORY-04.7 — OrderHistory dead controls
**Source:** CF-18. **AC:** "View Details" → real order-detail view (or removed); "Invoice"/"Request Service" removed or wired; timeline only renders reachable statuses.
**Estimate:** S (3h) · **Deps:** 02.4 status set decided.

### STORY-04.8 — Real contact details everywhere
**Source:** CF-20, CF-90. **AC:** all `tel:`/`wa.me`/`mailto:` use real business numbers (single source: `settings` — real WhatsApp `+27767100588` already lives there, CF-90); `+27210000000`/`27000000000`/`082 123 4567` gone from every page incl. legal; `/contact` lists real channels + hours.
**Estimate:** S (2h) · **Deps:** PM confirms number validity + supplies phone/address. **Blocks:** partial CF-46.

---

## EPIC-05 — Checkout & Post-Purchase Integrity
**Source:** CF-44, CF-43, CF-45, CF-13, CF-14, CF-36, CF-31, CF-32, CF-54, CF-24
**Objective:** Checkout is honest, recoverable, and priced completely.
**Owner:** ENG · **Estimate:** XL (~34h + conditional 16h) · **Deps:** EPIC-01; decisions on CF-13/CF-14 gate two stories.

### STORY-05.1 — Idempotency key per form session
**Source:** CF-44. **AC:** Given a checkout session, when submit is clicked twice or page revisited via back-button, then exactly one order exists (key stable per cart+session, not per click).
**Estimate:** S (2h) — generate on mount/sessionStorage. **Deps:** none.

### STORY-05.2 — Payfast failure recovery (pre-enable)
**Source:** CF-43. **AC:** failed/cancelled orders show "Try again" retry → re-initiates payment; cart not cleared until ITN COMPLETE (or pending orders keep restorable cart snapshot).
**Estimate:** S (4h) · **Deps:** none (needed before Payfast enable, EPIC-09).

### STORY-05.3 — Expired/invalid link UX + guest order lookup
**Source:** CF-45, CF-54. **AC:** expired tokens → "This link expired — enter email+order number" lookup form (rate-limited, constant-time response); order-confirmed renders inside shop chrome (nav+footer).
**Estimate:** M (6h) · **Deps:** 04.1.

### STORY-05.4 — Shipping/delivery pricing [DECISION-GATED]
**Source:** CF-13. **AC (flat-rate path):** delivery fee resolved server-side, shown as a line item at cart+checkout+confirmation, configurable via `settings`/table. Zones path = separate L story.
**Estimate:** M (8h flat) / L (20h zones) · **Deps:** PM decision D3. **DoD:** total charged == total displayed incl. delivery.

### STORY-05.5 — VAT display + tax invoice [DECISION-GATED]
**Source:** CF-14. **AC:** VAT-inclusive/exclusive per accountant; totals show VAT amount; order confirmation + email render a compliant tax-invoice block (vendor VAT#, inv#, line VAT).
**Estimate:** M (8h) · **Deps:** EXT-TAX ruling D4.

### STORY-05.6 — Checkout UX overhaul (Should)
**Source:** CF-31, CF-32, CF-36, CF-24. **AC:** step indicator or section anchors; inline zod field errors + `aria-invalid`; single-provider → no redundant radio; consent-disable reason shown; delivery/returns/payment trust strip; email-optional flagged ("we can only reach you via this link"); logged-in users get prefilled contact fields.
**Estimate:** L (12h) · **Deps:** 04.8 (trust assets need real details).

### STORY-05.7 — Cart early validation (Could)
**Source:** CF-63. **AC:** cart page revalidates items against live products on load (availability/price drift notice, not silent).
**Estimate:** S (4h) · **Deps:** none.

### STORY-05.8 — Atomic `create_order` Postgres RPC (Should)
**Source:** CF-87 (GAP-013). **AC:** Given a forced failure after the order row insert, when `create_order` runs, then zero partial rows remain (true transaction, replacing best-effort compensating delete); happy path unchanged; also the natural home for inventory decrement (S-09.3).
**Estimate:** M (8h) · **Deps:** staging env (S-08.4) for safe function test · **Risk:** RPC must replicate zod-level invariants — test matrix vs current action.

### STORY-05.9 — `orders.user_id` + claim-on-signup (Could)
**Source:** CF-88 (FLOW-G-12). **AC:** orders carry `user_id` when purchaser is logged in (or claimed post-signup by verified email); `/account/orders` reads `user_id` OR email-match; checkout prefills contact fields for logged-in users.
**Estimate:** M (8h) · **Deps:** 05.6 (prefill) · **Risk:** claim path must verify email ownership — reuse Supabase confirmed-email only.

---

## EPIC-06 — Compliance, Legal & Truthful Content
**Source:** CF-12, CF-22, CF-46, CF-60, CF-37
**Objective:** Nothing on the site claims what the business can't back.
**Owner:** ENG + PM + EXT-LEGAL · **Estimate:** L (~14h eng + external review) · **Exit:** no fabricated data rendered to customers; POPIA coverage honest; deal-price policy decided.

### STORY-06.1 — Remove fabricated ratings
**Source:** CF-12. **AC:** `getPlaceholderRating` dead; products render rating only when `rating`/`review_count` columns are set (real); JSON-LD unchanged (already clean).
**Estimate:** S (2h) · **Deps:** PM decision D5 (removal default — CPA risk).
### STORY-06.2 — Kill or build mock account pages
**Source:** CF-22. **AC:** `/account/subscriptions`+`/account/warranties` either removed from nav+routes, or backed by real data (recommend remove — no backing tables).
**Estimate:** S (2h) · **Deps:** D9.
### STORY-06.3 — Truthful copy pass
**Source:** CF-46. **AC:** no financing promises (PayJustNow/Mobicred), no tracking-email promises, no fake guarantees anywhere in copy; placeholder contacts replaced (04.8).
**Estimate:** S (3h) · **Deps:** PM copy review.
### STORY-06.4 — POPIA hardening (Should)
**Source:** CF-60. **AC:** retention cron covers all PII fields (incl. address) for orders past retention regardless of status definition; privacy page rights have a real contact path (form or monitored mailbox); document what's NOT automated.
**Estimate:** M (6h) · **Deps:** 03.1 table (service_request PII too).
### STORY-06.5 — Deal-price policy (decision impl)
**Source:** CF-37. **AC:** either checkout honors deal price (server-side `deals` resolution) or deal pages state "deal ends / price TBC at quote" honestly. Decision D-deal.
**Estimate:** M (6h) if honored; S (1h) if copy-only · **Deps:** PM.

### STORY-06.6 — Legal entity disclosure + terms re-issue
**Source:** CF-72, CF-73, CF-79, CF-80. **As** the business, **I want** lawful disclosures, **so** terms are enforceable and ECTA s43 duties are met.
**AC:** entity name + reg no. + VAT no. (if registered) + physical/postal address + real phone/email published on `/terms`, `/privacy`, footer contact block; terms re-dated and aligned to actual flow (full payment — resolve the Jan-2025 50%-deposit clause contradiction per D-16); cooling-off (ECTA s44) addressed in returns policy; POPIA Information Officer named; "accredited installation" claim either evidenced (SAQCC-gas) or softened.
**Estimate:** M (6h eng) + EXT-LEGAL review · **Deps:** PM supplies entity data (OQ) + legal review · **Risk:** publishing wrong entity data is worse than none — verify with PM.

---

## EPIC-07 — Design System Foundation & Accessibility
**Source:** CF-11, CF-27, CF-28, CF-30, CF-29, CF-55, CF-47, CF-48
**Objective:** One palette, one type scale, AA-compliant interactive surfaces.
**Owner:** DES/ENG · **Estimate:** XL (~36h) · **Deps:** none (parallel-safe w/ EPIC-04) · **Exit:** axe DevTools shows 0 critical/serious on key routes; single navy/blue ramp in tokens.

### STORY-07.1 — Carousel controls + reduced motion
**Source:** CF-11, CF-55a. **AC:** autoplay pauses on hover/focus/interaction + visible pause button; `prefers-reduced-motion` disables autoplay + reveals.
**Estimate:** S (3h).
### STORY-07.2 — CartDrawer → accessible dialog
**Source:** CF-27. **AC:** Radix Sheet (or role=dialog+aria-modal+focus-trap+Escape+focus-return) — passes axe "dialog" rules.
**Estimate:** M (5h).
### STORY-07.3 — Contrast remediation
**Source:** CF-28. **AC:** primary-blue-for-text/CTA darkened to ≥4.5:1 (e.g. `#0E7CAD`/`#0B6E96` — DES pick); muted grays ≥4.5:1 for text; AA pass on links/prices/buttons.
**Estimate:** S (4h) · **Deps:** 07.4 tokens or parallel find-replace.
### STORY-07.4 — Token consolidation Phase A
**Source:** CF-30, CF-29, CF-48. **AC:** brand ramp + semantic tokens declared (`--brand-*`, `--surface-*`, `--text-*`, success/warning); 3 navies→1, 3 blues→1+hover, 6 border grays→2, 3 type systems→1 scale (kill `!important` wars + PDP inline `<style>`); Relume namespace removed or mapped; ~top-20 files migrated — rest logged as Could.
**Estimate:** XL (20h) · **Risk:** visual regression — mitigate per-page screenshots before/after.
### STORY-07.5 — Remaining a11y labels & semantics
**Source:** CF-55. **AC:** aria-labels on all icon buttons (search, grid toggle, trash, pw-show); star ratings get `role=img`+label or real icon; focus-visible rings on raw `<button>`/`<a>`/`<select>`; variant selectors get `aria-pressed`/radiogroup semantics.
**Estimate:** M (6h).
### STORY-07.6 — Dead-component purge (Could→Should for bundle)
**Source:** CF-47. **AC:** 17 verified-dead files deleted; dead navbars/ProductCards gone; Poppins font load removed (dead weight).
**Estimate:** S (4h).

---

## EPIC-08 — DevOps, Observability & Environments
**Source:** CF-33, CF-34, CF-59, CF-66, CF-68, backups/DR
**Objective:** Drift like "2 weeks uncommitted" becomes structurally impossible.
**Owner:** OPS(=ENG) · **Estimate:** L (~18h) · **Deps:** GitHub/Vercel access.

### STORY-08.1 — CI pipeline
**Source:** CF-33. **AC:** GitHub Actions on PR+main: `pnpm install --frozen-lockfile` → `lint` → `tsc --noEmit` → `vitest` → `next build` → `pnpm audit --prod` (warn); Vercel preview per PR.
**Estimate:** M (4h) · **Rollback:** n/a.
### STORY-08.2 — Error monitoring + uptime
**Source:** CF-34. **AC:** Sentry (or equivalent) captures server+client errors w/ release tags; uptime probe on `/` + `/products` (1-min); alert → owner email.
**Estimate:** M (4h).
### STORY-08.3 — Env & package-manager hygiene
**Source:** CF-66, CF-68. **AC:** `.env.example` committed (names only); `engines.node` pinned; pnpm declared in `packageManager` field + docs updated; `.env.local.backup` deleted; `nul` file deleted; stale `ADMIN_SETUP_GUIDE.md` rewritten to reflect reality (or deleted).
**Estimate:** S (2h).
### STORY-08.4 — Staging environment
**Source:** readiness §2. **AC:** Vercel previews wired to branch; a staging Supabase project OR documented "preview DB" policy for destructive changes; migrations apply to staging first per release runbook.
**Estimate:** M (5h).
### STORY-08.5 — Backup/DR + release runbooks
**Source:** readiness §2. **AC:** documented: Supabase backup tier + restore steps + one restore drill performed; release checklist (migrate→deploy→verify→rollback path); incident runbook one-pager.
**Estimate:** M (4h).
### STORY-08.6 — Security headers
**Source:** CF-59. **AC:** CSP (report-only first, then enforce), HSTS, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy globally via `next.config.ts` headers.
**Estimate:** S (3h) · **Risk:** CSP can break GTM/WhatsApp — test consent+tags.

### STORY-08.7 — Auth rate limiting + admin hardening
**Source:** CF-78 (GAP-028). **AC:** login/signup/reset actions bucket-rate-limited (reuse Upstash helper from S-01.8); `/admin` requires session + `admins` membership on every server action (already in S-02.3 spec); MFA decision documented (recommend: defer, single admin).
**Estimate:** S (3h) · **Deps:** Upstash envs verified (S-01.4), S-01.8.

---

## EPIC-09 — Payments Completion & Order Lifecycle (Phase 5)
**Source:** CF-61, CF-15, CF-16(deep), CF-35, CF-37(impl), CF-43
**Objective:** Payfast goes live safely, or stays off — by decision, not accident.
**Owner:** ENG · **Estimate:** XL (~30h) · **Deps:** EPIC-02 (admin), 05.2, PAYFAST_* envs, D6.

### STORY-09.1 — Payfast sandbox E2E + live-mode hard-fail
**Source:** CF-61, CF-77. **AC:** full sandbox journey: order→redirect→pay→ITN→paid→confirmation page shows paid; failure+cancel paths verified; `payments`/`orders` consistent. **Plus (CF-77):** provider boot/logic hard-fails (or refuses to enable) when `PAYFAST_MODE=live` AND provider enabled AND `PAYFAST_PASSPHRASE` unset — warn-not-fail today means a misconfigured enable = forgeable signatures.
**Estimate:** M (8h) · **Deps:** sandbox merchant creds (PM).
### STORY-09.2 — Refund/cancel workflow
**Source:** CF-35. **AC:** admin can mark refunded/partially_refunded w/ amount+reason; customer-visible status; (EFT refunds = manual bank op, recorded in-app).
**Estimate:** M (10h) · **Deps:** 02.3.
### STORY-09.3 — Inventory policy implementation
**Source:** CF-15. **AC:** per decision D-inv: either `stock_count` decrement + qty cap at checkout (transactional), or honest "availability confirmed after order" copy + remove misleading counts.
**Estimate:** M (8h) · **Deps:** PM decision.
### STORY-09.4 — Payfast enablement gate
**AC:** checklist green (09.1 pass, envs set, passphrase set, ITN URL allowlisted, rollback=flip `is_enabled=false`) → flip flag in `payment_providers`.
**Estimate:** S (2h) · **Deps:** 09.1, D6.

---

## EPIC-10 — Growth Foundations (Should/Could)
**Source:** CF-23, CF-41, CF-42, CF-21-wire
**Owner:** ENG · **Estimate:** L (~20h; coupons = 12h of it — prime cut candidate).

### STORY-10.1 — Analytics funnel
**AC:** view_item/add_to_cart/begin_checkout events; `generate_lead` only on meaningful conversion (or renamed lead semantics documented); verify loader actually present (U-04) else wire GTM.
**Estimate:** M (6h).
### STORY-10.2 — Coupons [CUT CANDIDATE]
**AC:** `promotions.code` consumable at checkout; server-resolved discount → `discount_total_zar`; single-use/expiry honored.
**Estimate:** L (12h) · **Deps:** PM decision; conflicts w/ lead-gen model — verify wanted.
### STORY-10.3 — SEO fixes
**AC:** category+collection slugs in sitemap; variants canonical→parent OR excluded; `/categories/[badslug]` → real 404 (`notFound()`); OG image verified/created.
**Estimate:** S (4h).

---

## EPIC-11 — QA & Test Infrastructure
**Source:** CF-58 + readiness §5
**Owner:** ENG · **Estimate:** L (~26h).

### STORY-11.1 — Unit tests that test real code
**AC:** payment-security tests import `generateSignature`/`normalizePhone` etc. (not re-implementations); add `resolveOrderPricing` cases (sold-out, tier-derivation, tampered ids) w/ mocked Supabase.
**Estimate:** M (8h).
### STORY-11.2 — Playwright e2e happy paths
**AC:** CI-runnable: browse→filter→PDP→cart→checkout(EFT)→confirmed; auth login→order history; admin mark-paid. Seeded test product/order data.
**Estimate:** M (10h) · **Deps:** 08.4 staging or local DB seed.
### STORY-11.3 — Accessibility verification
**AC:** axe-core on top-8 routes → 0 critical/serious; keyboard-only walkthrough of cart/checkout/drawer/modals documented.
**Estimate:** M (5h) · **Deps:** EPIC-07 done.
### STORY-11.4 — Performance + load smoke
**AC:** Lighthouse budgets set (LCP<2.5s PDP on 4G throttle target); k6/autocannon script hitting catalog+checkout-read paths; results logged.
**Estimate:** M (5h) · **Deps:** CF-57 partially.

---

## EPIC-12 — UX Polish, Mobile & Media (Should/Could)
**Source:** CF-49, CF-51, CF-52, CF-53, CF-64, CF-65, CF-70, CF-56, CF-57, CF-26
**Owner:** ENG · **Estimate:** L (~24h; largely Should — flex buffer).

### STORY-12.1 — Mobile fixes
**AC:** icon targets ≥44px; `pt-[220px]`→token; checkout sticky mobile total bar.
**Estimate:** M (5h).
### STORY-12.2 — Loading states
**Source:** CF-26. **AC:** `loading.tsx` for PLP/PDP/account; Skeleton components; submit buttons already have pending labels.
**Estimate:** M (6h).
### STORY-12.3 — Filter & discovery polish
**Source:** CF-52, CF-53, CF-51. **AC:** no auto URL injection; slider max = data max; applied-filter chips; unified Breadcrumb component; (variant-swap without full nav = optional).
**Estimate:** M (6h).
### STORY-12.4 — Image & asset hygiene
**Source:** CF-56. **AC:** `<img>`→`next/image` where feasible; Supabase storage host verified in remote patterns; rename `Hero Images` dir (URL-safe); compress 38MB public payload.
**Estimate:** M (6h).
### STORY-12.5 — Misc correctness sweep
**Source:** CF-64, CF-65, CF-70, CF-82, CF-86, CF-84. **AC:** `useCart` throws outside provider; commercial boundary unified (≥32001); nav link size ≥12px w/ active state; delete mock-data files (already verified dead); single h1 on PLP + skip link added; wire `toast()` on add-to-cart/remove/error (Toaster already mounted, CF-86); rewrite README + archive stale docs (CF-84).
**Estimate:** S (4h).

---

## Explicitly Won't-do (this launch)
- Real reviews platform (defer — collect real reviews first) · coupons unless PM insists · social login beyond removing dead buttons · dark mode · customers table / account-linked checkout redesign · abandoned-cart recovery · multi-currency · cents migration (integer-rand documented as constraint) · full design-system migration beyond Phase A · Medusa/Stripe (never existed).
