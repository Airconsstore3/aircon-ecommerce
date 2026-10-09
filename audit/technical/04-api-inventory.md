# 04 — API & Server-Action Inventory

No REST/GraphQL public API exists. Surface area = Next.js server actions + 2 API routes + 1 edge function + middleware. Evidence cited per row.

## Server actions (`"use server"`)

| Action | File | Auth | Input | Mutation | Risk notes |
|---|---|---|---|---|---|
| `submitCheckout` | `src/app/(shop)/checkout/actions.ts:211` | None (guest); honeypot + optional Turnstile + optional IP rate-limit (5/10min) | zod `checkoutSchema` — items (id/qty/config), customer PII, channel, paymentMethod, consent=true, idempotencyKey | INSERT orders/order_items/payments via service role; compensating delete on partial failure | Prices always server-resolved. Rate limit keyed on **first** XFF hop (`actions.ts:156`) — client-spoofable. Returns `error.message` to client (zod-mapped now, but other internals still leak raw strings) |
| `markWhatsAppSent` | `actions.ts:451` | `secureToken` UUID match required | orderId + secureToken | UPDATE orders.status→sent_whatsapp (only from `submitted`) | **Fixed in worktree.** At HEAD: `markWhatsAppSent(orderId)` unauthenticated — any caller could flip any order's status knowing the UUID |
| `fetchEnabledProviders` | `checkout/providers-action.ts` | None | — | SELECT payment_providers WHERE is_enabled | Low — public data |
| `getRecommendations` | `src/app/(shop)/cart/recommendations.ts` | None | cartItemIds[] | SELECT products | **Fixed in worktree** — UUID extraction before `.not("in",…)`; at HEAD raw `join(",")` → PostgREST filter injection/malformed 400s |
| `login` | `src/app/(auth)/actions.ts:33` | — | email, password, next | Supabase auth | `safeNext` prevents open redirect. **No rate limiting** — credential-stuffing possible (Supabase has own throttling, partial mitigation) |
| `signup` | `actions.ts:54` | — | email, password≥8, fullName, phone | auth.signUp | Enumeration-safe handling (empty identities). No CAPTCHA — spam signups possible |
| `requestPasswordReset` | `actions.ts:102` | — | email | auth.resetPasswordForEmail | No rate limit at app layer (Supabase-side throttling only) |
| `updatePassword` | `actions.ts:121` | reset session | password≥8 | auth.updateUser | OK |
| `signOut` | `actions.ts:158` | session | — | auth.signOut | OK |
| `updateProfile` | `src/app/account/actions.ts` | session | name/phone | auth.updateUser metadata | OK |

## HTTP API routes

| Route | Method | Auth | Behavior | Risk notes |
|---|---|---|---|---|
| `/api/payfast/itn` | POST | Layered: source IP allowlist + MD5 signature + Payfast server-validation + merchant_id + exact-cent amount | Transitions `orders.payment_status`, `payments.status`; idempotent on `paid` | Worktree hardened; **HEAD version: first-hop XFF, 127.0.0.1 allowed, missing-IP skip, no server validation** |
| `/api/payfast/redirect` | GET | order UUID + `secure_token` | Validates order is payfast + unpaid → sets `processing` → 302 to signed Payfast URL | No expiry check on link; token in URL (browser history/logs) — acceptable, mitigated by `no-referrer` on confirmation page |
| `/auth/callback` | GET | OAuth code exchange | Sets session, `next` param guarded | OK |

## Edge function

| Function | Auth | Risk |
|---|---|---|
| `order-email` (`supabase/functions/order-email/index.ts`) | `x-webhook-secret` header — **worktree: fail-closed when unset; HEAD: optional** | Secret `78bb4e3f…` **committed in migration `20260710085328:9`** → rotate. HTML-escapes user fields (worktree); HEAD interpolated `name`/`notes` raw → HTML injection into owner + arbitrary `order.email` inboxes (phishing relay via verified Resend domain) |

## Middleware (`middleware.ts`)
- Runs on all paths except `api`, `_next/static`, `_next/image`, static assets (matcher line 31).
- Refreshes Supabase session; `/account/*` unauthenticated → 302 login; `/order-confirmed/*` gets `Referrer-Policy: no-referrer` + `X-Robots-Tag: noindex`.
- **No global security headers** (no CSP, HSTS, X-Content-Type-Options, X-Frame-Options) anywhere — in code or `next.config.ts`.

## Cross-cutting gaps
- No API versioning (acceptable — internal-only surface).
- No structured error taxonomy — actions return `{success:false, error:string}`; raw `Error.message` reaches client (`actions.ts:444`).
- No request-id/correlation logging; `console.error` only.
- No distributed rate limiting if Upstash unset (fail-open by design — see SEC findings).
- Pagination: product listing uses `.range()`/in-memory filtering in components; no cursor discipline — fine at 438 rows.
