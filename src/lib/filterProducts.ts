import { SupabaseClient } from '@supabase/supabase-js';

export type FilterType = 'deals' | 'residential' | 'commercial' | 'all-aircon' | 'accessories' | 'sale' | 'category';

export async function filterProducts(
  supabase: SupabaseClient,
  filterType: FilterType,
  categorySlug?: string
) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_published', true);

  switch (filterType) {
    case 'deals':
      // Show only products flagged as deals
      query = query.eq('is_deal', true);
      break;

    case 'residential':
      // Show aircons with BTU <= 32000
      query = query
        .eq('type', 'aircon')
        .not('btu_range', 'is', null)
        .lte('btu_range', 32000);
      break;

    case 'commercial':
      // Show aircons with BTU >= 32000
      query = query
        .eq('type', 'aircon')
        .not('btu_range', 'is', null)
        .gte('btu_range', 32000);
      break;

    case 'all-aircon':
      // Show all products (no additional filter)
      break;

    case 'accessories':
      // Show only accessories
      query = query.eq('type', 'accessory');
      break;

    case 'sale':
      // Show products with sale price
      query = query.not('sale_price_zar', 'is', null);
      break;

    case 'category':
      // Match by category slug - need to join with categories table
      if (!categorySlug) break;
      
      query = supabase
        .from('products')
        .select(`
          *,
          categories!products_category_id_fkey (
            slug
          )
        `)
        .eq('is_published', true)
        .eq('categories.slug', categorySlug);
      break;

    default:
      break;
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error filtering products:', error);
    return [];
  }

  // For category filter, we need to flatten the joined data
  if (filterType === 'category') {
    return data || [];
  }

  return data || [];
}
