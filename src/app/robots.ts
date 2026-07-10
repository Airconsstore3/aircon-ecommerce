import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airconsstore.co.za";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/order-confirmed/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
