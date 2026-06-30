"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("categories").insert({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      parent_id: formData.get("parent_id") as string,
      sort_order: formData.get("sort_order") ? parseInt(formData.get("sort_order") as string) : 0,
      is_published: formData.get("is_published") === "true",
      meta_title: formData.get("meta_title") as string,
      meta_description: formData.get("meta_description") as string,
    });

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const { error } = await serviceRoleClient.from("categories").update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      parent_id: formData.get("parent_id") as string,
      sort_order: formData.get("sort_order") ? parseInt(formData.get("sort_order") as string) : 0,
      is_published: formData.get("is_published") === "true",
      meta_title: formData.get("meta_title") as string,
      meta_description: formData.get("meta_description") as string,
    }).eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await serviceRoleClient.from("categories").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category" };
  }
}
