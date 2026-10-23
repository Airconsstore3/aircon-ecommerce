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
import { ChevronRight, ChevronLeft, Filter, Search, X, SlidersHorizontal } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AccessoryProductCard, AirconProduct } from "@/components/shop/ProductCard";
import { ACCESSORY_KINDS, INSTALLATION_KINDS, MAINTENANCE_KINDS, getAccessoryPrice, getMaintenanceKind } from "@/lib/accessories";
import { resolveStockStatus } from "@/lib/stock-status";
import { cn } from "@/lib/utils";

const fontClass = "font-[var(--font-google-sans-flex)]";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface AccessoriesCategoryClientProps {
  products: AirconProduct[];
  brandOptions: FilterOption[];
  priceBounds?: { min: number; max: number };
  categoryTitle?: string;
  categoryDescription?: string;
  productCountLabel?: string;
  catalogueKind?: "accessories" | "installation" | "maintenance";
  catalogueIntro?: ReactNode;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getPriceBucket(price: number): string | null {
  if (price < 500) return "under-500";
  if (price < 2000) return "500-2000";
  if (price < 5000) return "2000-5000";
  return "above-5000";
}

function getAvailabilityBuckets(product: AirconProduct): string[] {
  const buckets: string[] = [];
  if (product.is_enquiry_only) {
    buckets.push("price-on-request");
  } else {
    const status = resolveStockStatus({
      isSoldOut: product.stock.is_sold_out,
      stockCount: product.stock.stock_count,
      lowStockThreshold: product.stock.low_stock_threshold,
    });
    buckets.push(status === "sold_out" || status === "on_request" ? "special-order" : "in-stock");
  }
  return buckets;
}

const PRICE_RANGE_OPTIONS = [
  { value: "under-500", label: "Under R500" },
  { value: "500-2000", label: "R500 – R2 000" },
  { value: "2000-5000", label: "R2 000 – R5 000" },
  { value: "above-5000", label: "Above R5 000" },
];

const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In Stock" },
  { value: "price-on-request", label: "Price on Request" },
  { value: "special-order", label: "Confirm availability" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const PAGE_SIZE = 20;

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
              className={`cursor-pointer text-sm font-normal text-[#0A2540] ${fontClass}`}
            >
              {option.label}
            </Label>
          </div>
          {"count" in option && option.count !== undefined && (
            <span className={`text-xs text-[#5F6B7A] ${fontClass}`}>
              ({option.count})
            </span>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────

export default function AccessoriesCategoryClient({
  products,
  brandOptions,
  categoryTitle = "Aircon Accessories",
  categoryDescription = "Brackets, installation kits and smart controls. The finishing touches for your aircon setup.",
  productCountLabel = "Accessories",
  catalogueKind = "accessories",
  catalogueIntro,
}: AccessoriesCategoryClientProps) {
  const isInstallation = catalogueKind === "installation";
  const isMaintenance = catalogueKind === "maintenance";
  const kindOptions = isMaintenance ? MAINTENANCE_KINDS : isInstallation ? INSTALLATION_KINDS : ACCESSORY_KINDS;
  const searchLabel = isInstallation
    ? "Search installation products"
    : isMaintenance
      ? "Search maintenance & services"
      : "Search accessories";
  // Maintenance products are classified by name, not specs.accessory_kind
  const kindOf = useCallback(
    (p: AirconProduct) =>
      isMaintenance ? getMaintenanceKind(p) : p.specs?.accessory_kind,
    [isMaintenance]
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  // ─── Filtering logic ────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    const kind = searchParams.get("kind");
    if (kind) filtered = filtered.filter((p) => kindOf(p) === kind);

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

    // Price range bucket filter
    const priceRanges = searchParams.getAll("priceRange");
    if (priceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        if (p.is_enquiry_only) return false;
        const bucket = getPriceBucket(getAccessoryPrice(p));
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
        filtered.sort((a, b) => Number(a.is_enquiry_only) - Number(b.is_enquiry_only) || getAccessoryPrice(a) - getAccessoryPrice(b));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(a.is_enquiry_only) - Number(b.is_enquiry_only) || getAccessoryPrice(b) - getAccessoryPrice(a));
        break;
      case "newest":
        filtered.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        filtered.sort(
          (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        break;
    }

    return filtered;
  }, [products, searchParams, keyword, kindOf]);

  // ─── Pagination logic ──────────────────────────────────────
  const requestedPage = Number(searchParams.get("page") || "1");
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
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
  const filterKeyParams = new URLSearchParams(searchParams.toString());
  filterKeyParams.delete("page");
  const filterKey = `${filterKeyParams.toString()}|${keyword}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
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
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Build page numbers with ellipsis
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

  // ─── URL update helpers ─────────────────────────────────────
  const updateSort = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("sort", value);
    current.delete("page");
    router.push(`?${current.toString()}`, { scroll: false });
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
    current.delete("page");
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const clearFilter = (filterId: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete(filterId);
    current.delete("page");
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setKeyword("");
    router.push("?", { scroll: false });
  };

  // ─── Active filter tags ─────────────────────────────────────
  const activeFilterTags: { label: string; filterId: string; value: string }[] = [];
  searchParams.getAll("brand").forEach((v) => {
    const opt = brandOptions.find((o) => o.value === v);
    if (opt) activeFilterTags.push({ label: opt.label, filterId: "brand", value: v });
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

  const selectedKind = searchParams.get("kind") || "";
  const activeKind = kindOptions.find((kind) => kind.value === selectedKind);
  if (selectedKind) activeFilterTags.push({ label: activeKind?.label || selectedKind, filterId: "kind", value: selectedKind });
  const activeFilterCount = activeFilterTags.length + (keyword.trim() ? 1 : 0);
  const currentSort = searchParams.get("sort") || "featured";
  const selectKind = (value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value) current.set("kind", value);
    else current.delete("kind");
    current.delete("page");
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const categoryFilters = (
    <div className={cn("flex flex-wrap gap-2", isInstallation ? "w-full lg:w-auto" : "mb-4")} role="group" aria-label={isInstallation ? "Installation categories" : isMaintenance ? "Maintenance categories" : "Accessory categories"}>
      {[{ value: "", label: isInstallation ? "All products" : isMaintenance ? "All services" : "All accessories" }, ...kindOptions.filter((kind) => products.some((product) => kindOf(product) === kind.value))].map((kind) => (
        <button type="button" key={kind.value} aria-pressed={selectedKind === kind.value} onClick={() => selectKind(kind.value)} className={cn("min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1478A8]", selectedKind === kind.value ? "border-[#1478A8] bg-[#1478A8] text-white" : "border-[#D9E2EB] bg-white text-[#1E3A5F] hover:border-[#1478A8] hover:bg-[#F0F9FF]")}>{kind.label}</button>
      ))}
    </div>
  );

  return (
    <div className={cn("accessories-catalogue min-h-screen bg-white", isInstallation && "installation-catalogue", fontClass)}>
      <div className={cn("mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-16", isInstallation ? "pt-5 md:pt-6" : "pt-7 md:pt-9")}>
        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className={cn("accessories-heading", isInstallation ? "mb-4" : "mb-6")}>
          <div className="min-w-0 flex-1">
            {!isInstallation && <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1478A8]">
              SHOP
            </p>}
            <h1 className={cn("font-semibold leading-[1.05] tracking-tight text-[#1E3A5F]", !isInstallation && "mt-3")}>
              {categoryTitle}
            </h1>
            <p className={cn("mt-2 leading-relaxed text-[#0A2540]", !isInstallation && "max-w-[650px]")}>
              {categoryDescription}
            </p>
          </div>
        </div>

        {catalogueIntro}

        {!isInstallation && categoryFilters}

        {/* ─── Filter Bar: Filters button + Sort ──────────────── */}
        <div className={cn("mb-3 flex items-center gap-3", isInstallation ? "flex-wrap" : "justify-between border-t border-slate-100 pt-4")}>
          {isInstallation && categoryFilters}
          {/* Filters toggle button */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-expanded={isFilterOpen}
            aria-controls="accessory-filters"
            className="w-fit gap-2 h-10 rounded-lg border-gray-200 bg-white px-4 text-[#1E3A5F] hover:bg-gray-50 font-medium"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[#1C99D6] px-2 py-0.5 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger aria-label={isInstallation ? "Sort installation products" : isMaintenance ? "Sort maintenance services" : "Sort accessories"} className="ml-auto flex items-center gap-2 cursor-pointer h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-[#1E3A5F] hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="whitespace-nowrap">{SORT_OPTIONS.find((option) => option.value === currentSort)?.label || "Featured"}</span>
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
              id="accessory-filters"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden"
            >
              <div className={cn("mb-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-gray-100 pt-6", brandOptions.length ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
                {/* Keyword search */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Search</span>
                    {keyword && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setKeyword("")}
                        className="text-xs text-[#5F6B7A] hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={searchLabel}
                      aria-label={searchLabel}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-10 border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {/* Brand filter */}
                <div className={cn(!brandOptions.length && "hidden")}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Brand</span>
                    {searchParams.getAll("brand").length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => clearFilter("brand")}
                        className="text-xs text-[#5F6B7A] hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {brandOptions.length > 0 ? (
                    <CheckboxGroup
                      filterId="brand"
                      options={brandOptions}
                      selectedValues={searchParams.getAll("brand")}
                      onToggle={toggleFilter}
                    />
                  ) : (
                    <p className="text-sm text-[#5F6B7A]">No brands available yet.</p>
                  )}
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
                        className="text-xs text-[#5F6B7A] hover:text-[#1C99D6] h-auto p-0"
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

                {/* Availability filter */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1E3A5F]">Availability</span>
                    {searchParams.getAll("availability").length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => clearFilter("availability")}
                        className="text-xs text-[#5F6B7A] hover:text-[#1C99D6] h-auto p-0"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <CheckboxGroup
                    filterId="availability"
                    options={AVAILABILITY_OPTIONS}
                    selectedValues={searchParams.getAll("availability")}
                    onToggle={toggleFilter}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Active filter tags + result count ─────────────────────── */}
        <div className="mb-4 flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                className="text-xs text-[#5F6B7A] hover:text-[#1C99D6] h-auto p-0 ml-2"
              >
                Clear all
              </Button>
            )}
          </div>
          <span aria-live="polite" className="text-xs leading-relaxed text-[#6B7280]">
            {filteredProducts.length} {productCountLabel.toLowerCase()} · Availability confirmed before payment
          </span>
        </div>

        {/* ─── Product Grid ──────────────────────────────────────────── */}
        {filteredProducts.length > 0 ? (
          <>
            <div
              ref={gridRef}
              id={isInstallation ? "book-installation" : undefined}
              className="grid scroll-mt-[calc(var(--secondary-nav-height,80px)+16px)] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {paginatedProducts.map((product) => (
                <AccessoryProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
                    <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">
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
              {products.length === 0 ? (isInstallation ? "Installation products coming soon." : isMaintenance ? "Maintenance plans coming soon." : "Accessories coming soon.") : "No results found."}
            </h6>
            <p className="text-[#5F6B7A] mb-6">
              {products.length === 0
                ? (isInstallation ? "We're updating our installation catalogue. Please check back soon." : isMaintenance ? "We're updating our maintenance and service plans. Please check back soon." : "We're adding accessories to our catalog. Check back soon for pipes, brackets, remotes, and more.")
                : "There are no results with these criteria. Try changing your search."}
            </p>
            {products.length > 0 && activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6]/10"
                onClick={clearAllFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
