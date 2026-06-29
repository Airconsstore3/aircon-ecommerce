"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, LayoutGrid, Grid3x3, Grid2x2, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { AirconProductList, AirconProduct } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ProductsClientProps {
  products: AirconProduct[];
  activePromotion: any;
  initialSaleParam: string;
  categoryOptions?: { value: string; label: string; count: number }[];
  btuOptions?: { value: string; label: string; count: number }[];
  brandOptions?: { value: string; label: string; count: number }[];
}

export default function ProductsClient({ 
  products, 
  activePromotion, 
  initialSaleParam,
  categoryOptions = [],
  btuOptions = [],
  brandOptions = []
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [columns, setColumns] = useState<2 | 3 | 4>(4);

  // Apply filters from URL params
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter (includes derived residential/commercial)
    const categories = searchParams.getAll("category");
    if (categories.length > 0) {
      filtered = filtered.filter((p) =>
        categories.some((cat) => {
          if (cat === "residential") {
            return p.type === "aircon" && p.btu_range !== null && p.btu_range <= 32000;
          }
          if (cat === "commercial") {
            return p.type === "aircon" && p.btu_range !== null && p.btu_range >= 32000;
          }
          return p.type === cat;
        })
      );
    }

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
  }, [products, searchParams]);

  // Update sort
  const updateSort = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", value);
    router.push(`?${current.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[450px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="/Hero Images/hero summer winter.webp"
          alt="All Aircons background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
            {searchParams.get('sale') === 'true' ? 'Latest Deals' : 'All Aircons'}
          </h1>
          <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
            Taking care of your comfort is essential for a healthy home and office environment. A consistent air conditioning routine that includes cooling, heating, and maintenance.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-[24px]">
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <a href="#products-grid">Shop Now</a>
              </Button>
            </div>
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <a href="/enquire">Get a Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Banner */}
      {activePromotion && (
        <div className="bg-[#1C99D6] text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            {activePromotion.name}
            {activePromotion.code && (
              <span className="ml-2 font-bold">Code: {activePromotion.code}</span>
            )}
          </p>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="w-full px-4 sm:px-20 pt-12 pb-8 mb-8 border-b">
        <nav className="flex items-center text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground flex items-center gap-1">
            Home
          </a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Products</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <FilterSidebar 
              categoryOptions={categoryOptions}
              btuOptions={btuOptions}
              brandOptions={brandOptions}
            />
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Header with Sort and Filter Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-normal text-[#1E3A5F]">Products</h1>
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
                        categoryOptions={categoryOptions}
                        btuOptions={btuOptions}
                        brandOptions={brandOptions}
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
                      columns === 2 ? "bg-[#1C99D6] hover:bg-[#1680b0] text-white" : ""
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
                      columns === 3 ? "bg-[#1C99D6] hover:bg-[#1680b0] text-white" : ""
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
                      columns === 4 ? "bg-[#1C99D6] hover:bg-[#1680b0] text-white" : ""
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
            <div id="products-grid">
            {filteredProducts.length > 0 ? (
              <>
                <AirconProductList products={filteredProducts} columns={columns} />
                {/* Pagination */}
                <div className="flex items-center justify-center gap-1 mt-8">
                  <Button variant="ghost" size="icon" disabled className="rounded-lg w-10 h-10">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <Button variant="default" size="icon" className="rounded-lg w-10 h-10 bg-[#1C99D6] hover:bg-[#1680b0] text-base font-medium">
                    1
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                    2
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                    3
                  </Button>
                  <span className="text-muted-foreground text-lg px-2">...</span>
                  <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                    10
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("?")}
                >
                  Clear all filters
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
