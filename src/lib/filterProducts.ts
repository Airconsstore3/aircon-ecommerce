import { SupabaseClient } from '@supabase/supabase-js';
import { ACCESSORY_KINDS, getInstallationKind, isStorefrontAccessory } from './accessories';

export type FilterType = 'residential' | 'commercial' | 'all-aircon' | 'accessories' | 'installation' | 'sale' | 'category';

export async function filterProducts(
  supabase: SupabaseClient,
  filterType: FilterType,
  categorySlug?: string
) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_parent_product', true);

  switch (filterType) {
    case 'residential':
      // Show aircons with BTU <= 32000
      query = query
        .eq('type', 'aircon')
        .not('btu_range', 'is', null)
        .lte('btu_range', 32000);
      break;

    case 'commercial':
      // Show aircons with BTU > 32000 — must match the residential cutoff
      // (<= 32000) and the filter-chip counts in the listing pages so units
      // in the 32–40k BTU range don't fall into a dead zone.
      query = query
        .eq('type', 'aircon')
        .not('btu_range', 'is', null)
        .gte('btu_range', 32001);
      break;

    case 'all-aircon':
      query = query.eq('type', 'aircon');
      break;

    case 'accessories':
      // Show only accessories
      query = query
        .in('type', ['accessory', 'kit'])
        .in('specs->>accessory_kind', ACCESSORY_KINDS.map((kind) => kind.value));
      break;

    case 'installation':
      query = supabase
        .from('products')
        .select('*, categories!products_category_id_fkey(slug)')
        .eq('is_published', true)
        .eq('is_parent_product', true)
        .in('type', ['accessory', 'kit']);
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
        .eq('is_parent_product', true)
        .eq('categories.slug', categorySlug);
      break;

    default:
      break;
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error filtering products:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      filterType,
      categorySlug,
    });
    return [];
  }

  if (filterType === 'accessories') return (data || []).filter(isStorefrontAccessory);
  if (filterType === 'installation') {
    return (data || []).flatMap((product) => {
      const kind = getInstallationKind(product);
      return kind ? [{ ...product, specs: { ...product.specs, accessory_kind: kind } }] : [];
    });
  }

  // For category filter, we need to flatten the joined data
  if (filterType === 'category') {
    return data || [];
  }

  return data || [];
}
