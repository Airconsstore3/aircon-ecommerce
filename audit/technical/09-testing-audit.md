# 09 — Testing & QA Audit

## Inventory
| Layer | Present | Evidence |
|---|---|---|
| Unit tests | 1 file, 13 tests | `src/lib/__tests__/payment-security.test.ts` — `vitest run` → **13/13 pass** |
| Integration tests | ❌ | none |
| E2E tests | ❌ | no Playwright/Cypress config |
| Contract/API tests | ❌ | none |
| Load tests | ❌ | none |
| Accessibility tests | ❌ | none (no axe/pa11y) |
| Coverage tooling | ❌ | no coverage config in `vitest.config.ts` |
| CI gate | ❌ | no CI |

## Critical flaw in existing tests
`payment-security.test.ts` **re-implements** `generateSignature` (lines 7-21) and `normalizePhone` (71-79) rather than importing them from `src/lib/payment/payfast.ts` / `checkout/actions.ts`. The tests verify *copies* of the logic — they **cannot catch regressions in the real code**. The duplicated functions have already drifted once (the signature fn matches, but nothing guarantees it).

Evidence: test file lines 7-21 vs `payfast.ts:31-49`.

## Critical-path coverage (what SHOULD be tested)
| Flow | Risk if broken | Current coverage |
|---|---|---|
| `submitCheckout` happy path (EFT) | orders lost | none — requires mocked Supabase or test project |
| `resolveOrderPricing` | wrong totals charged | none on the real module |
| Sold-out / unpublished rejection | overselling | none |
| Installation tier derivation (BTU) | underpayment | none — was actively exploitable pre-fix |
| Idempotency key replay | duplicate orders | none |
| ITN signature + amount + IP checks | forged payments | signature-only (copied fn) |
| `markWhatsAppSent` token gate | order mutation | none |
| RLS policies (anon can't read orders) | PII breach | none — needs Supabase test project |
| Order-confirmed token gate + expiry | PII exposure | none |
| Auth flows (login/signup/reset) | lockouts | none |
| Account orders email-match | cross-customer leak | none |

## Test infrastructure quality
- `vitest.config.ts`: node env, `src/**/*.test.ts` include, `@` alias — minimal but fine.
- No test DB, no factories/fixtures, no MSW mocking of Supabase.
- No lint-staged/husky pre-commit.

## Recommendations (priority order)
1. **Refactor tests to import real functions** — extract `generateSignature`/`normalizePhone` into importable modules (they're already pure). 1-hour fix, converts decoration into protection.
2. **Integration suite against a Supabase test project** (or `supabase start` local): checkout → order row asserts; RLS denies anon SELECT on orders; ITN forged-signature rejection.
3. **Playwright smoke**: home → product → add → checkout(EFT) → confirmation; runs in CI nightly.
4. Coverage floor on `src/lib/**` (pricing, payment) at ≥80%.
5. Contract test for Payfast ITN payload shape (fixture from sandbox docs).
