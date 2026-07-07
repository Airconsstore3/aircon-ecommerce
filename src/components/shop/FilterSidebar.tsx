"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterSidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  categoryOptions?: FilterOption[];
  btuOptions?: FilterOption[];
  brandOptions?: FilterOption[];
}

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  aircon: "Air Conditioners",
  kit: "Kits & Bundles",
  accessory: "Accessories & Services",
};

// ─── Filter Sidebar Component ───────────────────────────────────────────────────

const fontClass = "font-[var(--font-google-sans-flex)]";

const FilterSidebar = ({ 
  className, 
  isMobile = false, 
  isOpen, 
  onClose,
  categoryOptions = [],
  btuOptions = [],
  brandOptions = []
}: FilterSidebarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const inStockOnly = searchParams.get("inStock") === "true";

  // Get current filter values from URL
  const getFilterValues = (filterId: string): string[] => {
    return searchParams.getAll(filterId);
  };

  // Update URL with new filter values
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

  // Clear all filters
  const clearAllFilters = () => {
    router.push("?", { scroll: false });
    setPriceRange([0, 50000]);
  };

  // Update price range
  const updatePriceRange = (values: number[]) => {
    setPriceRange(values);
    const current = new URLSearchParams(searchParams.toString());
    current.set("minPrice", values[0].toString());
    current.set("maxPrice", values[1].toString());
    router.push(`?${current.toString()}`, { scroll: false });
  };

  // Toggle in stock only
  const toggleInStock = (checked: boolean) => {
    const current = new URLSearchParams(searchParams.toString());
    if (checked) {
      current.set("inStock", "true");
    } else {
      current.delete("inStock");
    }
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const FilterGroup = ({
    groupId,
    title,
    options,
  }: {
    groupId: string;
    title: string;
    options: { value: string; label: string; count: number }[];
  }) => (
    <AccordionItem value={groupId}>
      <AccordionTrigger className={`text-sm font-normal hover:no-underline ${fontClass}`}>
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pt-1">
          {options.map((option) => {
            const isChecked = getFilterValues(groupId).includes(option.value);
            return (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${groupId}-${option.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    updateFilter(groupId, option.value, checked === true)
                  }
                />
                <Label
                  htmlFor={`${groupId}-${option.value}`}
                  className={`flex-1 cursor-pointer text-sm font-normal ${fontClass}`}
                >
                  {option.label}
                </Label>
                <span className={`text-xs text-muted-foreground ${fontClass}`}>
                  ({option.count})
                </span>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  const sidebarContent = (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-normal ${fontClass}`}>Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className={`text-sm ${fontClass}`}
        >
          Clear all
        </Button>
      </div>

      <Separator />

      {/* Accordion Filter Groups */}
      <Accordion type="multiple" defaultValue={[]} className="w-full">
        <FilterGroup groupId="category" title="Category" options={categoryOptions} />
        <FilterGroup groupId="btu" title="BTU Capacity" options={btuOptions} />
        <FilterGroup groupId="brand" title="Brand" options={brandOptions} />
      </Accordion>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className={`font-normal text-sm ${fontClass}`}>Price Range</h3>
        <Slider
          min={0}
          max={50000}
          step={500}
          value={priceRange}
          onValueChange={updatePriceRange}
          className="w-full"
        />
        <div className={`flex items-center justify-between text-sm ${fontClass}`}>
          <span>R {priceRange[0].toLocaleString()}</span>
          <span>R {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      {/* In Stock Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={toggleInStock}
        />
        <Label
          htmlFor="in-stock"
          className={`cursor-pointer text-sm font-normal ${fontClass}`}
        >
          In stock only
        </Label>
      </div>
    </div>
  );

  // Mobile: Render in Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-full sm:w-80">
          <SheetHeader>
            <SheetTitle className={fontClass}>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as sidebar
  return (
    <aside className="w-full shrink-0">
      {sidebarContent}
    </aside>
  );
};

export { FilterSidebar };
