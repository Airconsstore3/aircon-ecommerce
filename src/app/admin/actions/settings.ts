"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    const { data, error } = await serviceRoleClient
      .from("settings")
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch settings" };
  }
}

export async function updateSettings(formData: FormData) {
  try {
    const { error } = await serviceRoleClient
      .from("settings")
      .update({
        store_name: formData.get("store_name") as string,
        contact_email: formData.get("contact_email") as string,
        contact_phone: formData.get("contact_phone") as string,
        whatsapp_number: formData.get("whatsapp_number") as string,
        free_shipping_threshold_zar: formData.get("free_shipping_threshold_zar") 
          ? parseFloat(formData.get("free_shipping_threshold_zar") as string) 
          : null,
        announcement_text: formData.get("announcement_text") as string,
        announcement_active: formData.get("announcement_active") === "true",
      })
      .eq("id", formData.get("id") as string);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" };
  }
}
