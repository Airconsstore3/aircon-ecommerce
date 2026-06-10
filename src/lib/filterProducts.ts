import { Product } from './mock-data';

export type FilterType = 'deals' | 'residential' | 'commercial' | 'all-aircon' | 'accessories' | 'sale' | 'category';

export function filterProducts(
  products: Product[],
  filterType: FilterType,
  categorySlug?: string
): Product[] {
  switch (filterType) {
    case 'deals':
      // Show only products flagged as deals
      return products.filter(p => p.is_deal === true);

    case 'residential':
      // Show aircons with BTU <= 32000
      return products.filter(p => 
        p.type === 'aircon' && 
        p.btu_range !== null && 
        p.btu_range <= 32000
      );

    case 'commercial':
      // Show aircons with BTU >= 32000
      return products.filter(p => 
        p.type === 'aircon' && 
        p.btu_range !== null && 
        p.btu_range >= 32000
      );

    case 'all-aircon':
      // Show all products (no filter)
      return products;

    case 'accessories':
      // Show only accessories
      return products.filter(p => p.type === 'accessory');

    case 'sale':
      // Show products with sale price
      return products.filter(p => p.is_sale === true);

    case 'category':
      // Match by category slug (using category_id mapping)
      if (!categorySlug) return products;
      
      // Map category slugs to category IDs
      const categoryMap: Record<string, string> = {
        'residential': 'cat-1',
        'commercial': 'cat-2',
        'installation': 'cat-3',
        'kits': 'cat-3',
        'maintenance': 'cat-4',
      };
      
      const categoryId = categoryMap[categorySlug];
      if (!categoryId) return products;
      
      return products.filter(p => p.category_id === categoryId);

    default:
      return products;
  }
}
