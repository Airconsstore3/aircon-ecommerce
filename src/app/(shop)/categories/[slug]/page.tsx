"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, LayoutGrid, Grid3x3, Grid2x2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, use } from "react";
import { AirconProductList, AirconProduct } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { mockProducts, mockPromotions, Product } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Category metadata
const categoryInfo: Record<string, { name: string; description: string }> = {
  residential: {
    name: "Residential Aircon",
    description: "Split units, cassette systems, and floor-standing air conditioners for homes",
  },
  commercial: {
    name: "Commercial Aircon",
    description: "High-capacity systems for offices, retail spaces, and commercial buildings",
  },
  maintenance: {
    name: "Maintenance & Service",
    description: "Annual maintenance plans, repairs, and service packages",
  },
  kits: {
    name: "Installation Kits",
    description: "Complete installation kits with piping, brackets, and accessories",
  },
};

// Adapt Product to AirconProduct with stock info
function convertToAirconProduct(product: Product): AirconProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    btu_size: product.btu_size || null,
    type: product.type,
    price_zar: product.price_zar,
    sale_price_zar: product.sale_price_zar || null,
    images: product.images,
    is_enquiry_only: product.is_enquiry_only,
    is_featured: product.is_featured,
    stock: {
      stock_count: 10,
      is_sold_out: false,
      low_stock_threshold: 3,
    },
  };
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [columns, setColumns] = useState<2 | 3 | 4>(4);
  const { slug: categorySlug } = use(params);

  // Get category info
  const category = categoryInfo[categorySlug] || {
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    description: "Browse our selection",
  };

  // Get active promotion
  const activePromotion = useMemo(() => {
    const now = new Date();
    return mockPromotions.find(
      (promo) =>
        promo.is_active &&
        (!promo.starts_at || new Date(promo.starts_at) <= now) &&
        (!promo.expires_at || new Date(promo.expires_at) >= now)
    );
  }, []);

  // Convert and filter products by category
  const airconProducts = useMemo(() => {
    return mockProducts
      .filter((p) => p.type.toLowerCase() === categorySlug)
      .map(convertToAirconProduct);
  }, [categorySlug]);

  // Apply additional filters from URL params
  const filteredProducts = useMemo(() => {
    let filtered = [...airconProducts];

    // Brand filter
    const brands = searchParams.getAll("brand");
    if (brands.length > 0) {
      filtered = filtered.filter((p) =>
        p.brand && brands.includes(p.brand.toLowerCase())
      );
    }

    // BTU filter
    const btus = searchParams.getAll("btu");
    if (btus.length > 0) {
      filtered = filtered.filter((p) =>
        p.btu_size && btus.some((btu) => p.btu_size?.includes(btu))
      );
    }

    // Price range filter
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice) {
      filtered = filtered.filter((p) => p.price_zar >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price_zar <= parseInt(maxPrice));
    }

    // In stock only
    const inStockOnly = searchParams.get("inStock") === "true";
    if (inStockOnly) {
      filtered = filtered.filter((p) => !p.stock.is_sold_out);
    }

    // Sort
    const sort = searchParams.get("sort");
    if (sort) {
      switch (sort) {
        case "price-low":
          filtered.sort((a, b) => a.price_zar - b.price_zar);
          break;
        case "price-high":
          filtered.sort((a, b) => b.price_zar - a.price_zar);
          break;
        case "newest":
          filtered.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case "featured":
        default:
          filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          break;
      }
    }

    return filtered;
  }, [airconProducts, searchParams]);

  // Update sort
  const updateSort = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", value);
    window.history.pushState(null, "", `?${current.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Promo Banner */}
      {activePromotion && (
        <div className="bg-[#D85A30] text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            {activePromotion.name}
            {activePromotion.code && (
              <span className="ml-2 font-bold">Code: {activePromotion.code}</span>
            )}
          </p>
        </div>
      )}

      {/* Category Hero */}
      <div className="bg-[#1E3A5F] text-white py-12 px-4 sm:px-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-normal mb-2">{category.name}</h1>
          <p className="text-gray-200">{category.description}</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="w-full px-4 sm:px-20 py-4 border-b">
        <nav className="flex items-center text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            Home
          </a>
          <span className="mx-2">/</span>
          <a href="/products" className="hover:text-foreground">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar />
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Header with Sort and Filter Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-normal text-[#1E3A5F]">{category.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar
                        isMobile
                        isOpen={mobileFilterOpen}
                        onClose={() => setMobileFilterOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Columns Toggle - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    size="icon"
                    variant={columns === 2 ? "default" : "ghost"}
                    className={cn(
                      "rounded-full",
                      columns === 2 ? "bg-[#D85A30] hover:bg-[#c44e28] text-white" : ""
                    )}
                    onClick={() => setColumns(2)}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={columns === 3 ? "default" : "ghost"}
                    className={cn(
                      "rounded-full",
                      columns === 3 ? "bg-[#D85A30] hover:bg-[#c44e28] text-white" : ""
                    )}
                    onClick={() => setColumns(3)}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={columns === 4 ? "default" : "ghost"}
                    className={cn(
                      "rounded-full",
                      columns === 4 ? "bg-[#D85A30] hover:bg-[#c44e28] text-white" : ""
                    )}
                    onClick={() => setColumns(4)}
                  >
                    <Grid2x2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select
                  value={searchParams.get("sort") || "featured"}
                  onValueChange={updateSort}
                >
                  <SelectTrigger className="w-[180px]">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <AirconProductList products={filteredProducts} columns={columns} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found in this category.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  asChild
                >
                  <a href="/products">Browse all products</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
