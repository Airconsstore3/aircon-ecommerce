import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { filterProducts } from "@/lib/filterProducts";
import type { SupabaseProduct } from "@/lib/fetch-featured-products";
import type { AirconProduct } from "@/components/shop/ProductCard";
import AccessoriesCategoryClient from "../categories/[slug]/AccessoriesCategoryClient";

export const metadata: Metadata = {
  title: "Aircon Installation, Kits & Brackets | Aircons Store",
  description: "Shop aircon installation services, copper and aluminium installation kits, and outdoor-unit brackets. Submit your basket for availability and installation confirmation.",
};

export default async function InstallationPage() {
  const supabase = createClient(await cookies());
  const rows = await filterProducts(supabase, "installation") as SupabaseProduct[];
  const products: AirconProduct[] = rows.map((product) => {
    const isService = product.specs?.accessory_kind === "installation-services";
    const useServiceImage = isService && (!product.images?.length || product.images[0].includes("/MAIN  C ARD/"));
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand ?? null,
      btu_size: null,
      btu_range: product.btu_range ?? null,
      type: product.type,
      price_zar: product.price_zar,
      sale_price_zar: product.sale_price_zar ?? null,
      images: useServiceImage ? ["/Hero Images/Product category pictures/Residential Installation Technician.png"] : product.images,
      is_enquiry_only: product.is_enquiry_only,
      is_featured: product.is_featured,
      description: product.description,
      specs: product.specs,
      sort_order: isService ? -1 : product.sort_order,
      created_at: product.created_at,
      stock: { stock_count: product.stock_count, is_sold_out: product.is_sold_out, low_stock_threshold: product.low_stock_threshold },
    };
  });
  const brands = Array.from(new Set(products.flatMap((product) => product.brand ? [product.brand.toLowerCase()] : [])));

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AccessoriesCategoryClient
        products={products}
        brandOptions={brands.map((brand) => ({ value: brand, label: products.find((product) => product.brand?.toLowerCase() === brand)!.brand!, count: products.filter((product) => product.brand?.toLowerCase() === brand).length }))}
        categoryTitle="Installation Packages"
        categoryDescription="Shop aircon installation services, piping kits and brackets. Kits are materials only; installation is booked separately."
        productCountLabel="Products"
        catalogueKind="installation"
        catalogueIntro={
          <Link key="installation-intro" href="/categories/residential" className="installation-shop-info mb-5 hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:block">
            <Image src="/installation-badge.png" alt="Cool comfort, expertly installed" width={1757} height={895} className="h-[80px] w-full object-cover" unoptimized />
          </Link>
        }
      />
    </Suspense>
  );
}
