"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AirconProduct } from "@/components/shop/ProductCard";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface CommercialFilterSidebarProps {
  className?: string;
  btuOptions?: FilterOption[];
  brandOptions?: FilterOption[];
  typeOptions?: FilterOption[];
  priceBounds?: { min: number; max: number };
  products?: AirconProduct[];
  categoryTitle?: string;
  categoryDescription?: string;
}

const fontClass = "font-[var(--font-google-sans-flex)]";

// ─── FilterGroup Component (declared outside to avoid re-creation) ───────────

interface FilterGroupProps {
  groupId: string;
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (groupId: string, value: string, checked: boolean) => void;
}

const FilterGroup = ({
  groupId,
  title,
  options,
  selectedValues,
  onToggle,
}: FilterGroupProps) => (
  <AccordionItem value={groupId} className="border-b border-gray-100">
    <AccordionTrigger
      className={`text-sm font-medium hover:no-underline py-4 ${fontClass}`}
    >
      {title}
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-3 pt-1 pb-3">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.value);
          return (
            <div
              key={option.value}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id={`${groupId}-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    onToggle(groupId, option.value, checked === true)
                  }
                />
                <Label
                  htmlFor={`${groupId}-${option.value}`}
                  className={`cursor-pointer text-sm font-normal text-gray-700 ${fontClass}`}
                >
                  {option.label}
                </Label>
              </div>
              <span
                className={`text-xs text-gray-400 ${fontClass}`}
              >
                ({option.count})
              </span>
            </div>
          );
        })}
      </div>
    </AccordionContent>
  </AccordionItem>
);

// ─── Price Range Helpers ─────────────────────────────────────────────────────

function getPriceBucket(price: number): string | null {
  if (price < 20000) return "under-20000";
  if (price < 40000) return "20000-40000";
  if (price < 80000) return "40000-80000";
  return "above-80000";
}

function buildPriceRangeOptions(products: AirconProduct[]): FilterOption[] {
  const counts = { "under-20000": 0, "20000-40000": 0, "40000-80000": 0, "above-80000": 0 };
  for (const p of products) {
    const bucket = getPriceBucket(p.price_zar);
    if (bucket) counts[bucket as keyof typeof counts]++;
  }
  return [
    { value: "under-20000", label: "Under R20 000", count: counts["under-20000"] },
    { value: "20000-40000", label: "R20 000 – R40 000", count: counts["20000-40000"] },
    { value: "40000-80000", label: "R40 000 – R80 000", count: counts["40000-80000"] },
    { value: "above-80000", label: "Above R80 000", count: counts["above-80000"] },
  ];
}

// ─── Availability Helpers ─────────────────────────────────────────────────────

function getAvailabilityBuckets(product: AirconProduct): string[] {
  if (product.is_enquiry_only) return ["price-on-request"];
  if (product.stock.is_sold_out) return ["special-order"];
  return ["in-stock"];
}

function buildAvailabilityOptions(products: AirconProduct[]): FilterOption[] {
  const counts = { "in-stock": 0, "price-on-request": 0, "special-order": 0 };
  for (const p of products) {
    for (const bucket of getAvailabilityBuckets(p)) {
      counts[bucket as keyof typeof counts]++;
    }
  }
  return [
    { value: "in-stock", label: "In Stock", count: counts["in-stock"] },
    { value: "price-on-request", label: "Price on Request", count: counts["price-on-request"] },
    { value: "special-order", label: "Special Order", count: counts["special-order"] },
  ];
}

// ─── Main Component ─────────────────────────────────────────────────────────

const CommercialFilterSidebar = ({
  className,
  btuOptions = [],
  brandOptions = [],
  typeOptions = [],
  priceBounds = { min: 0, max: 100000 },
  products = [],
  categoryTitle = "Commercial Air Conditioning",
  categoryDescription = "Cooling solutions for offices, retail and warehouses.",
}: CommercialFilterSidebarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const priceRangeOptions = useMemo(() => buildPriceRangeOptions(products), [products]);
  const availabilityOptions = useMemo(() => buildAvailabilityOptions(products), [products]);

  const getFilterValues = (filterId: string): string[] => {
    return searchParams.getAll(filterId);
  };

  const updateFilter = (filterId: string, value: string, checked: boolean) => {
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
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push("?", { scroll: false });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += searchParams.getAll("btu").length;
    count += searchParams.getAll("brand").length;
    count += searchParams.getAll("type").length;
    count += searchParams.getAll("priceRange").length;
    count += searchParams.getAll("availability").length;
    return count;
  }, [searchParams]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Fixed Header Section — always visible, never scrolls */}
      <div className="shrink-0">
        {/* Sidebar Header */}
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] ${fontClass}`}
          >
            SHOP
          </p>
          <h1
            className={`mt-3 text-[28px] font-semibold leading-[1.1] tracking-tight text-[#1E3A5F] ${fontClass}`}
          >
            {categoryTitle}
          </h1>
          <p
            className={`mt-4 text-[16px] leading-[1.6] text-[#5F6B7A] max-w-[260px] ${fontClass}`}
          >
            {categoryDescription}
          </p>
        </div>

        {/* Filters Header */}
        <div className="flex items-center justify-between mt-8 pb-3 border-b border-gray-100">
          <h2 className={`text-sm font-semibold uppercase tracking-wide text-[#1E3A5F] ${fontClass}`}>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#1C99D6] px-2 py-0.5 text-xs font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className={`text-xs text-gray-500 hover:text-[#1C99D6] h-auto py-1 px-2 ${fontClass}`}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Scrollable Accordion Section — scrolls independently, never grows the sidebar */}
      <div
        className="filter-scroll flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 mt-4"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Accordion
          type="multiple"
          defaultValue={[]}
          className="w-full"
        >
          <FilterGroup
            groupId="btu"
            title="Cooling Capacity"
            options={btuOptions}
            selectedValues={getFilterValues("btu")}
            onToggle={updateFilter}
          />
          <FilterGroup
            groupId="brand"
            title="Brand"
            options={brandOptions}
            selectedValues={getFilterValues("brand")}
            onToggle={updateFilter}
          />
          <FilterGroup
            groupId="type"
            title="System Type"
            options={typeOptions}
            selectedValues={getFilterValues("type")}
            onToggle={updateFilter}
          />
          <FilterGroup
            groupId="priceRange"
            title="Price"
            options={priceRangeOptions}
            selectedValues={getFilterValues("priceRange")}
            onToggle={updateFilter}
          />
          <FilterGroup
            groupId="availability"
            title="Availability"
            options={availabilityOptions}
            selectedValues={getFilterValues("availability")}
            onToggle={updateFilter}
          />
        </Accordion>
      </div>
    </div>
  );
};

export { CommercialFilterSidebar };
