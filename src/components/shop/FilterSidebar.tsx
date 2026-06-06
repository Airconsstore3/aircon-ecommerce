"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// ─── Mock Filter Data ─────────────────────────────────────────────────────────

const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "category",
    title: "Category",
    options: [
      { value: "split", label: "Split System", count: 45 },
      { value: "cassette", label: "Cassette", count: 12 },
      { value: "floor", label: "Floor Standing", count: 8 },
      { value: "ceiling", label: "Ceiling Suspended", count: 6 },
      { value: "multi", label: "Multi-Split", count: 15 },
    ],
  },
  {
    id: "btu",
    title: "BTU Capacity",
    options: [
      { value: "9000", label: "9,000 BTU", count: 20 },
      { value: "12000", label: "12,000 BTU", count: 25 },
      { value: "18000", label: "18,000 BTU", count: 18 },
      { value: "24000", label: "24,000 BTU", count: 12 },
      { value: "36000", label: "36,000 BTU", count: 8 },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    options: [
      { value: "daikin", label: "Daikin", count: 22 },
      { value: "mitsubishi", label: "Mitsubishi", count: 18 },
      { value: "samsung", label: "Samsung", count: 15 },
      { value: "lg", label: "LG", count: 12 },
      { value: "gree", label: "Gree", count: 10 },
    ],
  },
  {
    id: "type",
    title: "Type",
    options: [
      { value: "inverter", label: "Inverter", count: 38 },
      { value: "non-inverter", label: "Non-Inverter", count: 15 },
      { value: "dc", label: "DC Inverter", count: 20 },
    ],
  },
  {
    id: "features",
    title: "Features",
    options: [
      { value: "wifi", label: "WiFi Control", count: 25 },
      { value: "quiet", label: "Quiet Mode", count: 30 },
      { value: "dehumidify", label: "Dehumidification", count: 28 },
      { value: "heating", label: "Heating & Cooling", count: 35 },
      { value: "sleep", label: "Sleep Mode", count: 20 },
    ],
  },
];

// ─── Filter Sidebar Component ───────────────────────────────────────────────────

const FilterSidebar = ({ className, isMobile = false, isOpen, onClose }: FilterSidebarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);

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
    setInStockOnly(false);
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
    setInStockOnly(checked);
    const current = new URLSearchParams(searchParams.toString());
    if (checked) {
      current.set("inStock", "true");
    } else {
      current.delete("inStock");
    }
    router.push(`?${current.toString()}`, { scroll: false });
  };

  const sidebarContent = (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-sm"
        >
          Clear all
        </Button>
      </div>

      <Separator />

      {/* Filter Groups */}
      {FILTER_GROUPS.map((group) => (
        <div key={group.id} className="space-y-3">
          <h3 className="font-medium text-sm">{group.title}</h3>
          <div className="space-y-2">
            {group.options.map((option) => {
              const isChecked = getFilterValues(group.id).includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${group.id}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      updateFilter(group.id, option.value, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`${group.id}-${option.value}`}
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {option.label}
                  </Label>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({option.count})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Price Range</h3>
        <Slider
          min={0}
          max={50000}
          step={500}
          value={priceRange}
          onValueChange={updatePriceRange}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm">
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
          className="cursor-pointer text-sm font-normal"
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
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as sidebar
  return <aside className="w-64 shrink-0">{sidebarContent}</aside>;
};

export { FilterSidebar };
