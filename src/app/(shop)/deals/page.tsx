import { DealCard } from "@/components/shop/ProductCard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Suspense } from "react";
import DealsClient from "./DealsClient";

export const dynamic = 'force-dynamic';

// Deal row from Supabase with joined product slug
interface DealRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  original_price_zar: number;
  sale_price_zar: number;
  ends_at: string;
  deal_type: string;
  stock_remaining: number;
  is_hero: boolean;
  product_id?: string;
  images: string[];
  includes?: string[];
  products?: { slug: string } | null;
  [key: string]: unknown;
}

// ─── Server Component to fetch deals with product slugs ─────────────────────────────

async function getDealsWithProductSlugs() {
  const supabase = createClient(await cookies());
  
  // Fetch deals with their linked product slugs
  // RLS policy filters to only active deals (ends_at > NOW())
  const { data } = await supabase
    .from('deals')
    .select(`
      *,
      products!deals_product_id_fkey (
        slug
      )
    `);
  
  return data || [];
}

export default async function DealsPage() {
  const deals = await getDealsWithProductSlugs();
  
  // Map deals to include productSlug from the joined product
  const dealsWithSlugs = deals.map((deal: DealRow) => ({
    ...deal,
    deal_type: deal.deal_type as "residential" | "commercial" | "bundle" | "clearance",
    productSlug: deal.products?.slug || undefined,
  }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DealsClient deals={dealsWithSlugs} />
    </Suspense>
  );
}
