"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function createDeal(formData: FormData) {
  try {
    const images = formData.get("images") as string;
    const includes = formData.get("includes") as string;

    const { error } = await serviceRoleClient.from("deals").insert({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      original_price_zar: parseInt(formData.get("original_price_zar") as string),
      sale_price_zar: parseInt(formData.get("sale_price_zar") as string),
      ends_at: new Date(formData.get("ends_at") as string).toISOString(),
      deal_type: formData.get("deal_type") as string,
      stock_remaining: formData.get("stock_remaining") ? parseInt(formData.get("stock_remaining") as string) : 0,
      is_hero: formData.get("is_hero") === "true",
      product_id: formData.get("product_id") as string,
      images: images ? JSON.parse(images) : [],
      includes: includes ? JSON.parse(includes) : [],
    });

    if (error) throw error;

    revalidatePath("/admin/deals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating deal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create deal" };
  }
}

export async function updateDeal(id: string, formData: FormData) {
  try {
    const images = formData.get("images") as string;
    const includes = formData.get("includes") as string;

    const { error } = await serviceRoleClient.from("deals").update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      original_price_zar: parseInt(formData.get("original_price_zar") as string),
      sale_price_zar: parseInt(formData.get("sale_price_zar") as string),
      ends_at: new Date(formData.get("ends_at") as string).toISOString(),
      deal_type: formData.get("deal_type") as string,
      stock_remaining: formData.get("stock_remaining") ? parseInt(formData.get("stock_remaining") as string) : 0,
      is_hero: formData.get("is_hero") === "true",
      product_id: formData.get("product_id") as string,
      images: images ? JSON.parse(images) : [],
      includes: includes ? JSON.parse(includes) : [],
    }).eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/deals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating deal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update deal" };
  }
}

export async function deleteDeal(id: string) {
  try {
    const { error } = await serviceRoleClient.from("deals").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/deals");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting deal:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete deal" };
  }
}
