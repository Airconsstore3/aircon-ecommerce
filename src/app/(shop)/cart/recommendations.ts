"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonClient = createClient((supabaseUrl || "").trim(), (supabaseAnonKey || "").trim());

interface Recommendation {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  is_enquiry_only: boolean;
  btu_range: number | null;
}

interface CartItem {
  id: string;
  brand: string | null;
  type: string;
  btu_range: number | null;
  category_id: string | null;
}

export async function getRecommendations(cartItemIds: string[]): Promise<Recommendation[]> {
  if (cartItemIds.length === 0) {
    return [];
  }

  // Fetch cart items to get their categories/brands for recommendations
  const { data: cartItems } = await anonClient
    .from("products")
    .select("id, brand, type, btu_range, category_id")
    .in("id", cartItemIds);

  if (!cartItems || cartItems.length === 0) {
    return [];
  }

  // Get unique brands and categories from cart
  const brands = [...new Set(cartItems.map((item: CartItem) => item.brand).filter(Boolean))];
  const types = [...new Set(cartItems.map((item: CartItem) => item.type))];
  const btuRanges = [...new Set(cartItems.map((item: CartItem) => item.btu_range).filter(Boolean))];

  // Fetch recommendations: same type, same brand, similar BTU, exclude cart items
  const { data: recommendations } = await anonClient
    .from("products")
    .select("id, name, slug, brand, type, price_zar, sale_price_zar, images, is_enquiry_only, btu_range")
    .eq("is_published", true)
    .in("type", types)
    .not("id", "in", `(${cartItemIds.join(",")})`)
    .order("is_featured", { ascending: false })
    .limit(10);

  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  // Prioritize: same brand > same type
  const prioritized = recommendations.sort((a: Recommendation, b: Recommendation) => {
    const aSameBrand = brands.includes(a.brand || "") ? 1 : 0;
    const bSameBrand = brands.includes(b.brand || "") ? 1 : 0;
    if (aSameBrand !== bSameBrand) return bSameBrand - aSameBrand;

    const aSameBTU = btuRanges.includes(a.btu_range || 0) ? 1 : 0;
    const bSameBTU = btuRanges.includes(b.btu_range || 0) ? 1 : 0;
    return bSameBTU - aSameBTU;
  });

  return prioritized.slice(0, 2);
}
