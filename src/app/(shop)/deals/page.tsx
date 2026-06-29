import { DealCard } from "@/components/shop/ProductCard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Suspense } from "react";
import DealsClient from "./DealsClient";

export const dynamic = 'force-dynamic';

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
  const dealsWithSlugs = deals.map((deal: any) => ({
    ...deal,
    productSlug: deal.products?.slug || undefined,
  }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DealsClient deals={dealsWithSlugs} />
    </Suspense>
  );
}
