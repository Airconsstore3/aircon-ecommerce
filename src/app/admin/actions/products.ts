"use server";

import { serviceRoleClient } from "@/lib/supabase-service";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    const images = formData.get("images") as string;
    const specs = formData.get("specs") as string;
    const documents = formData.get("documents") as string;

    const { error } = await serviceRoleClient.from("products").insert({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category_id: formData.get("category_id") as string,
      type: formData.get("type") as string,
      brand: formData.get("brand") as string,
      btu_range: formData.get("btu_range") ? parseInt(formData.get("btu_range") as string) : null,
      images: images ? JSON.parse(images) : [],
      price_zar: parseInt(formData.get("price_zar") as string),
      sale_price_zar: formData.get("sale_price_zar") ? parseInt(formData.get("sale_price_zar") as string) : null,
      is_published: formData.get("is_published") === "true",
      is_enquiry_only: formData.get("is_enquiry_only") === "true",
      is_featured: formData.get("is_featured") === "true",
      is_sale: formData.get("is_sale") === "true",
      is_deal: formData.get("is_deal") === "true",
      sort_order: formData.get("sort_order") ? parseInt(formData.get("sort_order") as string) : 0,
      specs: specs ? JSON.parse(specs) : {},
      documents: documents ? JSON.parse(documents) : [],
      stock_count: formData.get("stock_count") ? parseInt(formData.get("stock_count") as string) : 0,
      is_sold_out: formData.get("is_sold_out") === "true",
      low_stock_threshold: formData.get("low_stock_threshold") ? parseInt(formData.get("low_stock_threshold") as string) : 3,
      meta_title: formData.get("meta_title") as string,
      meta_description: formData.get("meta_description") as string,
    });

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const images = formData.get("images") as string;
    const specs = formData.get("specs") as string;
    const documents = formData.get("documents") as string;

    const { error } = await serviceRoleClient.from("products").update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      category_id: formData.get("category_id") as string,
      type: formData.get("type") as string,
      brand: formData.get("brand") as string,
      btu_range: formData.get("btu_range") ? parseInt(formData.get("btu_range") as string) : null,
      images: images ? JSON.parse(images) : [],
      price_zar: parseInt(formData.get("price_zar") as string),
      sale_price_zar: formData.get("sale_price_zar") ? parseInt(formData.get("sale_price_zar") as string) : null,
      is_published: formData.get("is_published") === "true",
      is_enquiry_only: formData.get("is_enquiry_only") === "true",
      is_featured: formData.get("is_featured") === "true",
      is_sale: formData.get("is_sale") === "true",
      is_deal: formData.get("is_deal") === "true",
      sort_order: formData.get("sort_order") ? parseInt(formData.get("sort_order") as string) : 0,
      specs: specs ? JSON.parse(specs) : {},
      documents: documents ? JSON.parse(documents) : [],
      stock_count: formData.get("stock_count") ? parseInt(formData.get("stock_count") as string) : 0,
      is_sold_out: formData.get("is_sold_out") === "true",
      low_stock_threshold: formData.get("low_stock_threshold") ? parseInt(formData.get("low_stock_threshold") as string) : 3,
      meta_title: formData.get("meta_title") as string,
      meta_description: formData.get("meta_description") as string,
    }).eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await serviceRoleClient.from("products").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete product" };
  }
}
