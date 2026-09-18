"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { AirconProductCard, AirconProduct } from "@/components/shop/ProductCard";
import { CommercialFilterSidebar } from "@/components/shop/CommercialFilterSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fontClass = "font-[var(--font-google-sans-flex)]";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface CommercialCategoryClientProps {
  products: AirconProduct[];
  btuOptions: FilterOption[];
  brandOptions: FilterOption[];
  typeOptions: FilterOption[];
  priceBounds: { min: number; max: number };
  categoryTitle?: string;
  categoryDescription?: string;
  productCountLabel?: string;
}

// Price range bucket helpers
function getPriceBucket(price: number): string | null {
  if (price < 20000) return "under-20000";
  if (price < 40000) return "20000-40000";
  if (price < 80000) return "40000-80000";
  return "above-80000";
}

// Availability bucket helpers
function getAvailabilityBuckets(product: AirconProduct): string[] {
  const buckets: string[] = [];
  if (product.is_enquiry_only) {
    buckets.push("price-on-request");
  } else if (product.stock.is_sold_out) {
    buckets.push("special-order");
  } else {
    buckets.push("in-stock");
  }
  return buckets;
}

export default function CommercialCategoryClient({
  products,
  btuOptions,
  brandOptions,
  typeOptions,
  priceBounds,
  categoryTitle = "Commercial Air Conditioning",
  categoryDescription = "Cooling solutions for offices, retail and warehouses.",
  productCountLabel = "Commercial Air Conditioners",
}: CommercialCategoryClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Brand filter
    const brands = searchParams.getAll("brand");
    if (brands.length > 0) {
      filtered = filtered.filter(
        (p) => p.brand && brands.includes(p.brand.toLowerCase())
      );
    }

    // BTU filter
    const btus = searchParams.getAll("btu");
    if (btus.length > 0) {
      filtered = filtered.filter(
        (p) => p.btu_range && btus.includes(String(p.btu_range))
      );
    }

    // System Type filter (ac_type)
    const types = searchParams.getAll("type");
    if (types.length > 0) {
      filtered = filtered.filter(
        (p) => p.ac_type && types.includes(p.ac_type.toLowerCase())
      );
    }

    // Price range bucket filter
    const priceRanges = searchParams.getAll("priceRange");
    if (priceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        const bucket = getPriceBucket(p.price_zar);
        return bucket !== null && priceRanges.includes(bucket);
      });
    }

    // Availability filter
    const availability = searchParams.getAll("availability");
    if (availability.length > 0) {
      filtered = filtered.filter((p) => {
        const buckets = getAvailabilityBuckets(p);
        return buckets.some((b) => availability.includes(b));
      });
    }

    // Sort
    const sort = searchParams.get("sort") || "featured";
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
      case "best-selling":
        filtered.sort((a, b) => {
          const aScore = (a.is_featured ? 1 : 0) + (a.sort_order || 0) * 0.01;
          const bScore = (b.is_featured ? 1 : 0) + (b.sort_order || 0) * 0.01;
          return bScore - aScore;
        });
        break;
      case "featured":
      default:
        filtered.sort(
          (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        );
        break;
    }

    return filtered;
  }, [products, searchParams]);

  const updateSort = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", value);
    router.push(`?${current.toString()}`);
  };

  const sidebarProps = {
    btuOptions,
    brandOptions,
    typeOptions,
    priceBounds,
    products,
    categoryTitle,
    categoryDescription,
  };

  return (
    <div className="min-h-screen bg-white">
      <div
        className={`mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 pt-16 md:pt-20 lg:pt-24 pb-24 ${fontClass}`}
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Desktop Sidebar - 280px, sticky with fixed height so it never grows */}
          <aside className="commercial-sidebar hidden lg:block w-[280px] shrink-0 lg:pr-4">
            <CommercialFilterSidebar {...sidebarProps} />
          </aside>

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6]">
                SHOP
              </p>
              <h1 className="mt-3 text-[36px] font-semibold leading-[1.05] tracking-tight text-[#1E3A5F]">
                {categoryTitle}
              </h1>
              <p className="mt-4 text-[18px] leading-[1.6] text-[#5F6B7A] max-w-[650px]">
                {categoryDescription}
              </p>
              <p className="mt-3 text-[15px] font-medium text-[#6B7280]">
                Showing {filteredProducts.length} {productCountLabel}
              </p>

              {/* Mobile toolbar — paired buttons */}
              <div className="mt-8 flex items-center justify-between gap-3 border-b border-gray-100 pb-6">
                <Button
                  variant="outline"
                  onClick={() => setMobileFilterOpen(true)}
                  className="h-12 rounded-[10px] border-gray-200 px-5 text-[#1E3A5F] hover:bg-gray-50 font-medium gap-2.5"
                >
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>

                <Select
                  value={searchParams.get("sort") || "featured"}
                  onValueChange={updateSort}
                >
                  <SelectTrigger className="h-12 w-[170px] rounded-[10px] border-gray-200 text-[#1E3A5F] font-medium">
                    <SlidersHorizontal className="mr-2 h-5 w-5" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="best-selling">Best Selling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Desktop Toolbar - minimal, subtle */}
            <div className="hidden lg:flex items-center justify-between pb-6 mb-10">
              <p className="text-[15px] font-medium text-[#6B7280]">
                Showing{" "}
                <span className="font-semibold text-[#1E3A5F]">
                  {filteredProducts.length}
                </span>{" "}
                {productCountLabel}
              </p>

              <Select
                value={searchParams.get("sort") || "featured"}
                onValueChange={updateSort}
              >
                <SelectTrigger className="h-12 w-[200px] rounded-[10px] border-gray-200 text-[#1E3A5F] focus:ring-[#1C99D6] font-medium">
                  <SlidersHorizontal className="mr-2 h-5 w-5" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="best-selling">Best Selling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid - 3 columns desktop, 2 tablet, 1 mobile, with generous whitespace */}
            {filteredProducts.length > 0 ? (
              <>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12"
                >
                  {filteredProducts.map((product) => (
                    <AirconProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination - minimal */}
                <div className="flex items-center justify-center gap-2 mt-16">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="rounded-lg w-10 h-10"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="rounded-lg w-10 h-10 bg-[#1C99D6] hover:bg-[#1680b0] text-base font-medium"
                  >
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-50"
                  >
                    2
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-50"
                  >
                    3
                  </Button>
                  <span className="text-gray-400 text-lg px-2">...</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-50"
                  >
                    10
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg w-10 h-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-24">
                <p className="text-gray-500 text-lg">
                  No products found matching your filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6]/10"
                  onClick={() => router.push("?")}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent
          side="left"
          className="w-full h-full overflow-y-auto sm:max-w-[380px] p-6"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className={fontClass}>Filters</SheetTitle>
          </SheetHeader>
          <CommercialFilterSidebar {...sidebarProps} />
          <div className="mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100">
            <Button
              className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white"
              onClick={() => setMobileFilterOpen(false)}
            >
              Show {filteredProducts.length} Results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
