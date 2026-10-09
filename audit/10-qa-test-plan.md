# 10 — QA & Test Plan

## Current test state

- `npm run test` → **13/13 pass** (`src/lib/__tests__/payment-security.test.ts`).
- Critical caveat: tests **re-implement** `generateSignature`/`normalizePhone`/`generateOrderNumber` inline — they validate concepts, not shipped code. Zero regression protection.
- Lint: 15 errors (all `react-hooks/set-state-in-effect`, documented as intentional) + 120 warnings.
- No e2e, no integration, no seed fixtures.

## Required test layers

### 1. Unit (Vitest) — refactor + extend

Refactor existing tests to import real modules. Add:

| Module | Cases |
|---|---|
| `server-pricing.resolveOrderPricing` | forged tier id on 24k BTU → R2750 not R1950; sold-out → throw; enquiry-only → R0 + flag; unpublished id → throw; qty multiplier on add-ons; empty cart; deal id → "no longer available" |
| `normalizePhone` | +27/0/27 prefixes, spaces/dashes, reject non-SA |
| Payfast `generateSignature` | determinism, passphrase, field exclusion — import real fn |
| ITN `getSourceIp` | x-real-ip preferred; rightmost XFF; missing → null |
| Order state machine (when FR-ORD-01 lands) | legal/illegal transitions, terminal-state rejection |
| Delivery zone resolver (FR-CHK-01) | province match, postcode band, unmatched → pending-quote flag |

### 2. Integration (server actions with Supabase test project or mocks)

- `submitCheckout`: valid EFT order → order+items+payments rows; idempotency key replay returns same order; disabled provider rejected; honeypot rejected; rate-limit (mocked Redis) at 6th attempt; zod failures return readable messages.
- `markWhatsAppSent`: wrong token → no-op; right token + status=submitted → sent_whatsapp.
- `fetchEnabledProviders`: reflects `is_enabled` flips.

### 3. E2E (Playwright) — critical path smoke

```
browse /products → open PDP → select variant → add install+kit+warranty
→ cart qty=2 → checkout form (valid SA data) → consent → submit
→ land on /order-confirmed/<uuid>?token=... with banking details
```

Plus:
- Payfast sandbox: checkout → redirect → sandbox pay → ITN (localtunnel) → confirmation shows paid.
- Bad order URL / wrong token → 404.
- Sold-out product in cart → readable error at checkout.
- `/account` unauthenticated → redirect to /login; login → own orders only.
- Newsletter submit → row persisted (once G-10 ships).

### 4. Security regression suite

- Anon `insert into orders` via PostgREST → denied (after hardening migration).
- Anon `select orders` → denied.
- Forged ITN (bad signature / non-allowlisted IP / amount off by R1 / missing passphrase config) → 400/403, order unchanged.
- `x-webhook-secret` missing/wrong → 401; unset env → 500 fail-closed.
- `markWhatsAppSent` with guessed UUID → no mutation.

### 5. Cross-browser/device

- Checkout on iOS Safari + Android Chrome (primary SA mobile share).
- Cart drawer + modals on 360px viewport.
- Print stylesheet on confirmation page.

### 6. Release checklist per deploy

- `pnpm lint` (no new errors), `pnpm test`, `pnpm build`, Playwright smoke.
- `supabase db advisors` clean after any migration.
- Verify no `console.log` of PII/secrets added.

## Test data

- Seed script exists (`scripts/seed.ts`) — extend with: 1 parent + 2 variants, 1 sold-out product, 1 enquiry-only product, 1 deal linked to a product, 1 active + 1 expired promo, 2 delivery zones.
- Test order fixtures: EFT pending, Payfast paid, cancelled.
