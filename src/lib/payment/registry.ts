// ─── Payment Provider Registry ───────────────────────────────────────────────
// This file is intentionally separate from provider.ts to avoid a circular
// import temporal-dead-zone (TDZ) error. provider.ts imports the provider
// modules (payfast.ts, manual-eft.ts) which call registerProvider() at load
// time. If the registry lived in the same file as those imports, the `providers`
// const would not yet be initialized when registerProvider() is called.
//
// By keeping the registry in its own module, it is fully initialized before
// any provider module loads.

import type { PaymentProvider } from "./types";

const providers: Record<string, PaymentProvider> = {};

export function registerProvider(provider: PaymentProvider) {
  providers[provider.code] = provider;
}

export function getProvider(code: string): PaymentProvider | null {
  return providers[code] ?? null;
}
