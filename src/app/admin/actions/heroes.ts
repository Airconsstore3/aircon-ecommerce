"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function createHero(formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("page_heroes").insert({
      page_key: formData.get("page_key") as string,
      heading: formData.get("heading") as string,
      subheading: formData.get("subheading") as string,
      image_url: formData.get("image_url") as string,
      button_label: formData.get("button_label") as string,
      button_link: formData.get("button_link") as string,
      is_active: formData.get("is_active") === "true",
    });

    if (error) throw error;

    revalidatePath("/admin/heroes");
    return { success: true };
  } catch (error) {
    console.error("Error creating hero:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create hero" };
  }
}

export async function updateHero(id: string, formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("page_heroes").update({
      page_key: formData.get("page_key") as string,
      heading: formData.get("heading") as string,
      subheading: formData.get("subheading") as string,
      image_url: formData.get("image_url") as string,
      button_label: formData.get("button_label") as string,
      button_link: formData.get("button_link") as string,
      is_active: formData.get("is_active") === "true",
    }).eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/heroes");
    return { success: true };
  } catch (error) {
    console.error("Error updating hero:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update hero" };
  }
}

export async function deleteHero(id: string) {
  try {
    const { error } = await serviceRoleClient.from("page_heroes").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/heroes");
    return { success: true };
  } catch (error) {
    console.error("Error deleting hero:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete hero" };
  }
}
