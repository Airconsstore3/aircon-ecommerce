"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function createPromotion(formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("promotions").insert({
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      value: parseInt(formData.get("value") as string),
      applies_to: formData.get("applies_to") as string,
      category_id: formData.get("category_id") as string,
      product_id: formData.get("product_id") as string,
      min_order_zar: formData.get("min_order_zar") ? parseInt(formData.get("min_order_zar") as string) : null,
      starts_at: formData.get("starts_at") ? new Date(formData.get("starts_at") as string).toISOString() : null,
      expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null,
      is_active: formData.get("is_active") === "true",
      max_uses: formData.get("max_uses") ? parseInt(formData.get("max_uses") as string) : null,
    });

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating promotion:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create promotion" };
  }
}

export async function updatePromotion(id: string, formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("promotions").update({
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      type: formData.get("type") as string,
      value: parseInt(formData.get("value") as string),
      applies_to: formData.get("applies_to") as string,
      category_id: formData.get("category_id") as string,
      product_id: formData.get("product_id") as string,
      min_order_zar: formData.get("min_order_zar") ? parseInt(formData.get("min_order_zar") as string) : null,
      starts_at: formData.get("starts_at") ? new Date(formData.get("starts_at") as string).toISOString() : null,
      expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null,
      is_active: formData.get("is_active") === "true",
      max_uses: formData.get("max_uses") ? parseInt(formData.get("max_uses") as string) : null,
    }).eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating promotion:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update promotion" };
  }
}

export async function deletePromotion(id: string) {
  try {
    const { error } = await serviceRoleClient.from("promotions").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/promotions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete promotion" };
  }
}
