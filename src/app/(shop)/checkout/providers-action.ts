"use server";

import { serviceRoleClient } from "@/lib/supabase-service";

export async function fetchEnabledProviders() {
  try {
    const { data, error } = await serviceRoleClient
      .from("payment_providers")
      .select("code, name, description")
      .eq("is_enabled", true)
      .order("sort_order");

    if (error) {
      console.error("[providers-action] Error fetching payment providers:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("[providers-action] No enabled payment providers found in database. Did you run the migration SQL?");
      return [];
    }

    return data.map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
    }));
  } catch (err) {
    console.error("[providers-action] Exception fetching payment providers:", err);
    return [];
  }
}
