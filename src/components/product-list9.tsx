"use client";

import { FeaturedProducts } from "@/components/FeaturedProducts";
import type { Product } from "@/types/product";

interface ProductList9Props {
  products: Product[];
  className?: string;
}

const ProductList9 = ({ products, className }: ProductList9Props) => {
  return (
    <FeaturedProducts
      eyebrow="FEATURED"
      title="Featured Aircons"
      description="A selection of air conditioners for homes, offices and commercial spaces."
      products={products}
      className={className}
      showViewAll={true}
      viewAllHref="/products"
    />
  );
};

export { ProductList9 };
