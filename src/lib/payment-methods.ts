import { serviceRoleClient } from "@/lib/supabase-service";
import { PaymentMethod } from "@/types/payment";

export type { PaymentMethod };

// Fallback methods used when the database is unavailable
const FALLBACK_METHODS: PaymentMethod[] = [
  {
    id: 'manual_eft',
    name: 'Manual EFT',
    description: 'Pay by bank transfer',
    expandedContent: "We'll provide our banking details after checkout.",
  },
];

// Helper function to get payment methods by ID
export function getPaymentMethodById(id: string, methods?: PaymentMethod[]): PaymentMethod | undefined {
  return (methods ?? FALLBACK_METHODS).find(method => method.id === id);
}

// Server function to get all enabled payment methods from the database
export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await serviceRoleClient
      .from("payment_providers")
      .select("code, name, description")
      .eq("is_enabled", true)
      .order("sort_order");

    if (error || !data || data.length === 0) {
      return FALLBACK_METHODS;
    }

    return data.map((p) => ({
      id: p.code,
      name: p.name,
      description: p.description ?? "",
    }));
  } catch {
    return FALLBACK_METHODS;
  }
}
