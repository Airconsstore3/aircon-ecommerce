import type { MetadataRoute } from "next";

import { serviceRoleClient } from "@/lib/supabase-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airconsstore.co.za";
  const staticRoutes = ["", "/products", "/deals", "/installation", "/maintenance", "/repairs", "/about", "/privacy", "/terms"];

  const { data: products } = await serviceRoleClient
    .from("products")
    .select("slug, updated_at")
    .eq("is_published", true);

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...(products || []).map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
