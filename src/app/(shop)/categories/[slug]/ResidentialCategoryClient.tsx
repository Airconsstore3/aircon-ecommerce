"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Filter, Search, X, SlidersHorizontal } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AirconProductCard, AirconProduct } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";

const fontClass = "font-[var(--font-google-sans-flex)]";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface ResidentialCategoryClientProps {
  products: AirconProduct[];
  btuOptions: FilterOption[];
  brandOptions: FilterOption[];
  typeOptions: FilterOption[];
  priceBounds: { min: number; max: number };
  categoryTitle?: string;
  categoryDescription?: string;
  productCountLabel?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getPriceBucket(price: number): string | null {
  if (price < 20000) return "under-20000";
  if (price < 40000) return "20000-40000";
  if (price < 80000) return "40000-80000";
  return "above-80000";
}

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

const PRICE_RANGE_OPTIONS = [
  { value: "under-20000", label: "Under R20 000" },
  { value: "20000-40000", label: "R20 000 – R40 000" },
  { value: "40000-80000", label: "R40 000 – R80 000" },
  { value: "above-80000", label: "Above R80 000" },
];

const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In Stock" },
  { value: "price-on-request", label: "Price on Request" },
  { value: "special-order", label: "Special Order" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
];

const PAGE_SIZE = 12;

// Framer Motion variants for the collapsible filter panel
const containerVariants = {
  initial: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.2, ease: "easeInOut" as const },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" as const, opacity: { duration: 0.1 } },
  },
};

// ─── Checkbox filter group (declared outside to avoid re-creation) ─────────

interface CheckboxGroupProps {
  filterId: string;
  options: FilterOption[] | { value: string; label: string; count?: number }[];
  selectedValues: string[];
  onToggle: (filterId: string, value: string, checked: boolean) => void;
}

const CheckboxGroup = ({
  filterId,
  options,
  selectedValues,
  onToggle,
}: CheckboxGroupProps) => (
  <div className="space-y-2.5">
    {options.map((option) => {
      const isChecked = selectedValues.includes(option.value);
      return (
        <div key={option.value} className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id={`${filterId}-${option.value}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                onToggle(filterId, option.value, checked === true)
              }
            />
            <Label
              htmlFor={`${filterId}-${option.value}`}
              className={`cursor-pointer text-sm font-normal text-gray-700 ${fontClass}`}
            >
              {option.label}
            </Label>
          </div>
          {"count" in option && option.count !== undefined && (
            <span className={`text-xs text-gray-400 ${fontClass}`}>
              ({option.count})
            </span>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────

export default function ResidentialCategoryClient({
  products,
  btuOptions,
  brandOptions,
  typeOptions,
  categoryTitle = "Residential Air Conditioning",
  categoryDescription = "Split units, cassette systems, and floor-standing air conditioners for homes.",
  productCountLabel = "Residential Air Conditioners",
}: ResidentialCategoryClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  // ─── Tabs: "View all" + system types ────────────────────────────────
  const tabs = [
    { value: "all", trigger: "View all" },
    ...typeOptions.map((t) => ({
      value: t.value,
      trigger: t.label,
    })),
  ];

  // ─── Filtering logic ────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Keyword search
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          (p.brand && p.brand.toLowerCase().includes(kw))
      );
    }

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
  }, [products, searchParams, keyword]);

  // ─── Pagination logic ──────────────────────────────────────────────
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  // Clamp page if out of range (e.g. after filters change)
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  // If page is out of range, silently correct the URL
  const correctedRef = useRef(false);
  useEffect(() => {
    if (currentPage !== safePage && !correctedRef.current) {
      correctedRef.current = true;
      const current = new URLSearchParams(searchParams.toString());
      if (safePage === 1) {
        current.delete("page");
      } else {
        current.set("page", String(safePage));
      }
      router.replace(`?${current.toString()}`, { scroll: false });
      return;
    }
    correctedRef.current = false;
  }, [currentPage, safePage, searchParams, router]);

  // Reset to page 1 when filters/sort/keyword change (not when page changes)
  // Exclude "page" from the key so page navigation doesn't trigger a reset
  const filterKeyParams = new URLSearchParams(searchParams.toString());
  filterKeyParams.delete("page");
  const filterKey = `${filterKeyParams.toString()}|${keyword}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      // Filters changed — reset to page 1 if not already there
      if (currentPage !== 1) {
        const current = new URLSearchParams(searchParams.toString());
        current.delete("page");
        router.replace(`?${current.toString()}`, { scroll: false });
      }
    }
  }, [filterKey, searchParams, router, currentPage]);

  const goToPage = (page: number) => {
    const current = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      current.delete("page");
    } else {
      current.set("page", String(page));
    }
    router.push(`?${current.toString()}`, { scroll: false });
    // Scroll to top of product grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Build page numbers with ellipsis (e.g. 1 2 3 ... 8 9 10)
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  const gridRef = useRef<HTMLDivElement>(null);

  // ─── URL update helpers ─────────────────────────────────────────────
  const updateSort = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", value);
    current.delete("page"); // reset to page 1
    router.push(`?${current.toString()}`);
  };

  const toggleFilter = (filterId: string, value: string, checked: boolean) => {
    const current = new URLSearchParams(searchParams.toString());
    const existing = current.getAll(filterId);
    if (checked) {
      existing.push(value);
    } else {
      const index = existing.indexOf(value);
      if (index > -1) existing.splice(index, 1);
    }
    current.delete(filterId);
    existing.forEach((v) => current.append(filterId, v));
    current.delete("page"); // reset to page 1
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const clearFilter = (filterId: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete(filterId);
    current.delete("page"); // reset to page 1
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setKeyword("");
    router.push("?", { scroll: false });
  };

  const handleTabChange = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("type");
    if (value !== "all") {
      current.set("type", value);
    }
    current.delete("page"); // reset to page 1
    router.push(`?${current.toString()}`, { scroll: false });
  };

  // ─── Active filter tags ─────────────────────────────────────────────
  const activeFilterTags: { label: string; filterId: string; value: string }[] = [];
  searchParams.getAll("brand").forEach((v) => {
    const opt = brandOptions.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "brand", value: v });
  });
  searchParams.getAll("btu").forEach((v) => {
    const opt = btuOptions.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "btu", value: v });
  });
  searchParams.getAll("type").forEach((v) => {
    const opt = typeOptions.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "type", value: v });
  });
  searchParams.getAll("priceRange").forEach((v) => {
    const opt = PRICE_RANGE_OPTIONS.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "priceRange", value: v });
  });
  searchParams.getAll("availability").forEach((v) => {
    const opt = AVAILABILITY_OPTIONS.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "availability", value: v });
  });

  const removeTag = (filterId: string, value: string) => {
    toggleFilter(filterId, value, false);
  };

  const activeFilterCount = activeFilterTags.length + (keyword.trim() ? 1 : 0);
  const currentSort = searchParams.get("sort") || "featured";
  const currentTab = searchParams.get("type") || "all";

  return (
    <div className={cn("min-h-screen bg-white", fontClass)}>
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 pt-16 md:pt-20 lg:pt-24 pb-24">
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6]">
            SHOP
          </p>
          <h1 className="mt-3 text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[1.05] tracking-tight text-[#1E3A5F]">
            {categoryTitle}
          </h1>
          <p className="mt-4 text-[18px] md:text-[20px] leading-[1.6] text-[#5F6B7A] max-w-[650px]">
            {categoryDescription}
          </p>
        </div>

        {/* ─── Filter Bar: Filters button + Tabs + Sort ──────────────── */}
        <div className="mb-8 grid auto-cols-fr grid-cols-2 grid-rows-[auto_auto] items-center justify-between gap-x-6 gap-y-6 lg:grid-cols-[1fr_max-content_1fr] lg:gap-y-0">
          {/* Filters toggle button — 48px height, 10px radius, matches Sort */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-fit gap-2.5 self-start h-12 rounded-[10px] border-gray-200 px-5 text-[#1E3A5F] hover:bg-gray-50 font-medium"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[#1C99D6] px-2 py-0.5 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Category Tabs — premium horizontal navigation with clean underline */}
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="flex w-full flex-col items-center justify-center [grid-area:2/1/3/3] lg:[grid-area:auto/auto/auto/auto]"
          >
            <TabsList
              variant="line"
              className="flex items-center justify-center gap-9 bg-transparent p-0 h-auto overflow-x-auto w-full px-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "px-0 py-5 whitespace-nowrap font-medium text-base transition-all duration-200 uppercase tracking-[0.01em] border-0 bg-transparent relative",
                    "data-[state=active]:text-[#1C99D6] data-[state=active]:font-medium",
                    "data-[state=inactive]:text-[#0d1b2a] data-[state=inactive]:hover:text-[#1C99D6]",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1C99D6] after:transition-all after:duration-200",
                    "data-[state=active]:after:opacity-100 data-[state=inactive]:after:opacity-0 hover:after:opacity-100"
                  )}
                >
                  {tab.trigger}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Sort dropdown — matches Filters button height/radius */}
          <DropdownMenu>
            <DropdownMenuTrigger className="-mr-2 flex items-center gap-2.5 justify-self-end cursor-pointer h-12 rounded-[10px] border border-gray-200 px-5 text-sm font-medium text-[#1E3A5F] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-5 w-5" />
              <span className="whitespace-nowrap">Sort by</span>
              <ChevronRight className="shrink-0 h-4 w-4 rotate-90 text-[#1E3A5F] transition-transform duration-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => updateSort(option.value)}
                  className={cn(
                    "cursor-pointer",
                    currentSort === option.value && "font-semibold text-[#1C99D6]"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ─── Collapsible Filter Panel ──────────────────────────────── */}
        <AnimatePresence initial={false} mode="wait">
          {isFilterOpen && (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="mb-8 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-4 border-t border-gray-100 pt-8">
                {/* Keyword search */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Search</span>
                    {keyword && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setKeyword("")}
                        className="text-xs text-gray-400 hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10 border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {/* Brand filter */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Brand</span>
                    {searchParams.getAll("brand").length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => clearFilter("brand")}
                        className="text-xs text-gray-400 hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <CheckboxGroup
                    filterId="brand"
                    options={brandOptions}
                    selectedValues={searchParams.getAll("brand")}
                    onToggle={toggleFilter}
                  />
                </div>

                {/* Cooling Capacity / BTU filter */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Cooling Capacity</span>
                    {searchParams.getAll("btu").length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => clearFilter("btu")}
                        className="text-xs text-gray-400 hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <CheckboxGroup
                    filterId="btu"
                    options={btuOptions}
                    selectedValues={searchParams.getAll("btu")}
                    onToggle={toggleFilter}
                  />
                </div>

                {/* Price range filter */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Price</span>
                    {searchParams.getAll("priceRange").length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => clearFilter("priceRange")}
                        className="text-xs text-gray-400 hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <CheckboxGroup
                    filterId="priceRange"
                    options={PRICE_RANGE_OPTIONS}
                    selectedValues={searchParams.getAll("priceRange")}
                    onToggle={toggleFilter}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Active filter tags + result count ─────────────────────── */}
        <div className="mb-8 flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterTags.map((tag) => (
              <div
                key={`${tag.filterId}-${tag.value}`}
                className="flex items-center bg-gray-100 py-1.5 pl-3 pr-2 rounded-md text-sm text-[#1E3A5F]"
              >
                <span>{tag.label}</span>
                <button
                  onClick={() => removeTag(tag.filterId, tag.value)}
                  className="ml-2 text-gray-400 hover:text-[#1E3A5F] transition-colors"
                  aria-label={`Remove ${tag.label} filter`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {keyword.trim() && (
              <div className="flex items-center bg-gray-100 py-1.5 pl-3 pr-2 rounded-md text-sm text-[#1E3A5F]">
                <span>&ldquo;{keyword}&rdquo;</span>
                <button
                  onClick={() => setKeyword("")}
                  className="ml-2 text-gray-400 hover:text-[#1E3A5F] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {activeFilterCount > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-gray-400 hover:text-[#1C99D6] h-auto p-0 ml-2"
              >
                Clear all
              </Button>
            )}
          </div>
          <span className="text-[15px] font-medium text-[#6B7280] whitespace-nowrap">
            Showing {filteredProducts.length} of {products.length} {productCountLabel}
          </span>
        </div>

        {/* ─── Product Grid ──────────────────────────────────────────── */}
        {filteredProducts.length > 0 ? (
          <>
            <div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12"
            >
              {paginatedProducts.map((product) => (
                <AirconProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination — dynamic, only show if more than 1 page */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-16">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={safePage === 1}
                  onClick={() => goToPage(safePage - 1)}
                  className="rounded-lg w-10 h-10 hover:bg-gray-50 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                {pageNumbers.map((num, idx) =>
                  num === "..." ? (
                    <span key={`ellipsis-${idx}`} className="text-gray-400 text-lg px-2 shrink-0">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={num}
                      variant={num === safePage ? "default" : "ghost"}
                      size="icon"
                      onClick={() => goToPage(num)}
                      className={cn(
                        "rounded-lg w-10 h-10 text-base font-medium shrink-0",
                        num === safePage
                          ? "bg-[#1C99D6] hover:bg-[#1680b0] text-white shadow-[0_2px_8px_rgba(28,153,214,0.25)]"
                          : "text-[#1E3A5F] hover:bg-gray-50"
                      )}
                    >
                      {num}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={safePage === totalPages}
                  onClick={() => goToPage(safePage + 1)}
                  className="rounded-lg w-10 h-10 hover:bg-gray-50 shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="border border-gray-200 p-12 text-center rounded-xl">
            <h6 className="mb-2 text-lg font-bold leading-[1.4] text-[#1E3A5F]">
              No results found.
            </h6>
            <p className="text-gray-500 mb-6">
              There are no results with these criteria. Try changing your search.
            </p>
            <Button
              variant="outline"
              className="border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6]/10"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
