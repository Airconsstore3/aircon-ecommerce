import { serviceRoleClient } from "@/lib/supabase-service";

// Re-export types and registry functions for backward compatibility.
// The registry lives in registry.ts to avoid a circular-import TDZ error.
export type {
  PaymentProvider,
  CreatePaymentParams,
  CreatePaymentResult,
  VerifyWebhookParams,
  VerifyWebhookResult,
} from "./types";

export { registerProvider, getProvider } from "./registry";

// Import providers to register them in the registry (side-effect imports).
// These MUST come after the registry re-exports above so that registry.ts
// is fully initialized before the provider modules call registerProvider().
import "./payfast";
import "./manual-eft";

// ─── Enabled providers lookup ────────────────────────────────────────────────

export async function getEnabledProviders(): Promise<
  Array<{ code: string; name: string; description: string | null }>
> {
  const { data, error } = await serviceRoleClient
    .from("payment_providers")
    .select("code, name, description")
    .eq("is_enabled", true)
    .order("sort_order");

  if (error || !data) return [];

  return data.map((p) => ({
    code: p.code,
    name: p.name,
    description: p.description,
  }));
}
