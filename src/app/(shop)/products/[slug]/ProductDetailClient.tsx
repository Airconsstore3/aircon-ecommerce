"use client";

import {
  Minus,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartProvider";
import {
  WarrantyConfig,
  WarrantySelection,
  ResolvedWarrantyPrice,
  EMPTY_WARRANTY_CONFIG,
} from "@/types/warranty";
import { WarrantySelector } from "@/components/shop/WarrantySelector";
import { resolveWarrantyPrice } from "@/lib/warranty-price";
import { resolveInstallationPrice } from "@/lib/installation-kit-price";
import {
  InstallationKitConfig,
  KitConfiguration,
  ProductInstallationContext,
  ResolvedInstallationPrice,
  EMPTY_KIT_CONFIG,
} from "@/types/installation-kit";
import {
  MaintenancePlan,
  MaintenancePlanConfig,
  EMPTY_MAINTENANCE_CONFIG,
  ResolvedMaintenancePrice,
} from "@/types/maintenance-plan";
import { MaintenancePlanModal } from "@/components/shop/MaintenancePlanModal";
import { InstallationKitModal } from "@/components/shop/InstallationKitModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductFeature {
  name: string;
  icon?: string;
}

interface ProductDocument {
  name: string;
  url: string;
  type?: string;
}

interface AirconProduct {
  id: string;
  name: string;
  display_name?: string | null;
  slug: string;
  brand: string | null;
  btu_size: string | null;
  btu_range: number | null;
  available_btu_sizes: number[] | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  is_enquiry_only: boolean;
  is_featured: boolean;
  description?: string;
  specs?: Record<string, string>;
  stock: {
    stock_count: number;
    is_sold_out: boolean;
    low_stock_threshold: number;
  };
  product_features?: ProductFeature[];
  room_coverage?: string | null;
  documents?: ProductDocument[];
  installation_terms?: string | null;
  shipping_info?: string | null;
  returns_info?: string | null;
  rating?: number;
  review_count?: number;
  installation_pricing?: Record<string, number>;
  protection_plan_price?: number;
  care_instructions?: string[] | string | null;
  shipping_summary?: string | null;
  shipping_policy_url?: string | null;
  return_policy_summary?: string | null;
  return_policy_url?: string | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  description?: string;
  is_enquiry_only: boolean;
  rating?: number;
  review_count?: number;
}

interface ProductVariant {
  id: string;
  slug: string;
  btu_range: number | null;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  stock_count: number;
  is_sold_out: boolean;
  low_stock_threshold: number;
  room_coverage?: string | null;
  specs?: Record<string, string>;
  is_enquiry_only: boolean;
  variant_name?: string | null;
  variant_attributes?: Record<string, unknown>;
  display_name?: string | null;
  description?: string | null;
  documents?: ProductDocument[];
}

interface BreadcrumbEntry {
  label: string;
  url: string;
}

interface ProductDetailClientProps {
  product: AirconProduct;
  relatedProducts: RelatedProduct[];
  variants: ProductVariant[];
  breadcrumbs: BreadcrumbEntry[];
  kitConfig?: InstallationKitConfig;
  maintenanceConfig?: MaintenancePlanConfig;
  warrantyConfig?: WarrantyConfig;
}

interface ProductImage {
  src: string;
  alt: string;
}

interface PriceLine {
  id: string;
  label: string;
  amount: number;
  isEnquiry?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// ─── Installation pricing tiers (fallback defaults) ──────────────────────────
// These are display-only fallbacks. The server resolves actual pricing from
// the `installation_tiers` database table at checkout time.
interface InstallationTier {
  id: string;
  label: string;
  minBtu: number;
  maxBtu: number;
  price: number; // 0 for enquiry-only tiers
  isEnquiry: boolean;
}

const INSTALLATION_TIERS: InstallationTier[] = [
  { id: "9-12k", label: "9 000–12 000 BTU", minBtu: 0, maxBtu: 12000, price: 1950, isEnquiry: false },
  { id: "18k", label: "18 000 BTU", minBtu: 12001, maxBtu: 18000, price: 2350, isEnquiry: false },
  { id: "24k", label: "24 000 BTU", minBtu: 18001, maxBtu: 24000, price: 2750, isEnquiry: false },
  { id: "32k+", label: "32 000+ BTU", minBtu: 24001, maxBtu: 999999, price: 0, isEnquiry: true },
];

function getInstallationTierForBtu(btu: number | null | undefined): InstallationTier {
  if (!btu) return INSTALLATION_TIERS[0];
  return INSTALLATION_TIERS.find((t) => btu >= t.minBtu && btu <= t.maxBtu) ?? INSTALLATION_TIERS[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStockStatus(product: AirconProduct) {
  if (product.stock.is_sold_out) return "sold_out";
  if (product.stock.stock_count <= product.stock.low_stock_threshold)
    return "low_stock";
  return "in_stock";
}

function getRoomCoverage(btuRange: number | null): string | null {
  if (!btuRange) return null;
  if (btuRange <= 9000) return "Covers rooms up to 20 m²";
  if (btuRange <= 12000) return "Covers rooms up to 30 m²";
  if (btuRange <= 18000) return "Covers rooms up to 40 m²";
  if (btuRange <= 24000) return "Covers rooms up to 55 m²";
  if (btuRange <= 30000) return "Covers rooms up to 65 m²";
  if (btuRange <= 36000) return "Covers rooms up to 80 m²";
  if (btuRange <= 48000) return "Covers spaces up to 110 m²";
  if (btuRange <= 60000) return "Covers spaces up to 140 m²";
  return "Covers large commercial spaces";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("ZAR", "R");
}

function getDescriptionPoints(description?: string): string[] {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.match(/^[•\-\*]\s+/))
    .map((item) => item.replace(/^[•\-\*]\s+/, "").trim())
    .filter(Boolean)
    .slice(0, 7);
}

// Derive inverter status from product specs or name
function deriveTechnologyLabel(name: string, specs?: Record<string, string>): string | null {
  if (specs?.inverter === "Yes" || specs?.inverter === "true") return "Inverter";
  if (specs?.inverter === "No" || specs?.inverter === "false") return "Non-Inverter";
  const lower = name.toLowerCase();
  if (lower.includes("non-inverter") || lower.includes("non inverter")) return "Non-Inverter";
  if (lower.includes("inverter")) return "Inverter";
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Gallery = ({ images }: { images: ProductImage[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to the first image whenever the image set changes (e.g. variant switch).
  // This prevents a stale index from pointing past the end of a shorter list and
  // ensures the gallery always reflects the currently selected variant's images.
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (images.length === 0) {
    return <div className="min-h-[440px] w-full bg-gray-50" />;
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col">
      {/* Main image frame.
          - aspect-square keeps a stable height so the right-hand product info
            doesn't jump while the image loads.
          - p-6 gives comfortable internal breathing room (≈24px) so the product
            never touches the frame edges.
          - object-contain preserves the full product without cropping or
            stretching — important for commercial units (rooftops, cassettes,
            ducted, floor-standing) that are not square. We intentionally do NOT
            use object-cover, which was cropping products and upscaling smaller
            source images (the cause of the soft/blurry appearance). */}
      <div className="aspect-square w-full rounded-xl bg-gray-50 p-6">
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="size-full object-contain"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Thumbnail row.
          - mt-3.5 (14px) separates the row from the main frame.
          - gap-3 (12px) gives consistent spacing between thumbnails.
          - px-1 (4px) insets the row so the first/last thumb aligns with the
            main image's internal padding rather than the frame edge.
          - Each thumb is a fixed aspect-square box with object-contain + a
            small internal pad so the source image's native dimensions never
            change the gallery layout. */}
      {images.length > 1 && (
        <div className="mt-3.5 flex gap-3 px-1">
          {images.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-gray-50 p-1.5 transition-colors sm:w-20",
                activeIndex === index
                  ? "border border-[#1C99D6]"
                  : "border border-transparent hover:border-gray-300"
              )}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="size-full object-contain"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Info Tabs ───────────────────────────────────────────────────────

function ProductInfoTabs({ product }: { product: AirconProduct }) {
  const [activeTab, setActiveTab] = useState<string>("description");
  const [fadeKey, setFadeKey] = useState(0);

  // Description content (from product record)
  const descriptionContent = product.description?.trim() || null;
  const descPoints = descriptionContent ? parseDescriptionPoints(descriptionContent) : [];
  const descParagraph = descriptionContent
    ? descriptionContent.split("\n").filter((l) => l.trim() && !l.match(/^[•\-\*]\s/)).map((l) => l.trim()).join(" ").trim()
    : "";

  // Delivery content (from global site settings, not product)
  const deliveryContent = product.shipping_summary?.trim() || null;
  const deliveryPoints = deliveryContent ? parseSummaryPoints(deliveryContent) : [];
  const deliveryUrl = product.shipping_policy_url?.trim() || "/return-policy";

  // Return policy content (from global site settings, not product)
  const returnContent = product.return_policy_summary?.trim() || null;
  const returnPoints = returnContent ? parseSummaryPoints(returnContent) : [];
  const returnUrl = product.return_policy_url?.trim() || "/return-policy";

  // Feature badges for description tab
  const features: ProductFeature[] = product.product_features?.length
    ? product.product_features
    : descPoints.slice(0, 5).map((name) => ({ name, icon: undefined }));

  // Always render exactly 3 tabs
  const tabs: { id: "description" | "delivery" | "returns"; label: string }[] = [
    { id: "description", label: "Description" },
    { id: "delivery", label: "Delivery" },
    { id: "returns", label: "Return Policy" },
  ];

  if (!descriptionContent) {
    console.warn("[ProductInfoTabs] No product description found in database");
  }
  if (!deliveryContent) {
    console.warn("[ProductInfoTabs] No delivery summary in global site settings");
  }
  if (!returnContent) {
    console.warn("[ProductInfoTabs] No return policy summary in global site settings");
  }

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const handleTabChange = (id: "description" | "delivery" | "returns") => {
    if (id === activeTab) return;
    setActiveTab(id);
    setFadeKey((k) => k + 1);
  };

  return (
    <div className="mb-6">
      {/* Tab navigation — always 3 tabs, equal min-width for alignment */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "relative min-w-[115px] pb-3 text-left text-[14px] font-semibold transition-colors",
              currentTab.id === tab.id
                ? "text-[#0A2540]"
                : "text-[#5F6B7A] hover:text-[#0A2540]"
            )}
          >
            {tab.label}
            {currentTab.id === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A2540]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content with fade animation, auto height with responsive min-height */}
      <div key={fadeKey} className="pt-4 min-h-[60px] animate-[fadeIn_200ms_ease-in-out]">
        {currentTab.id === "description" && (
          <div className="space-y-4 text-[15px] leading-[1.7] text-[#5F6B7A]">
            {descriptionContent ? (
              <>
                {descPoints.length > 0 && (
                  <ul className="space-y-1.5">
                    {descPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {descParagraph && <p className="pt-1">{descParagraph}</p>}
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {features.slice(0, 6).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-[#0A2540]"
                      >
                        {feature.icon ? (
                          <img src={feature.icon} alt="" className="h-3.5 w-3.5" />
                        ) : (
                          <svg className="h-3.5 w-3.5 text-[#0F834D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {feature.name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p>No product description available.</p>
            )}
          </div>
        )}

        {currentTab.id === "delivery" && (
          <div className="space-y-3 text-[15px] leading-[1.7] text-[#5F6B7A]">
            {deliveryPoints.length > 0 && (
              <ul className="space-y-1.5">
                {deliveryPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {deliveryUrl && (
              <Link
                href={deliveryUrl}
                className="inline-block pt-1 text-[14px] font-semibold text-[#1C99D6] transition-colors hover:text-[#0A2540]"
              >
                View Full Delivery Policy →
              </Link>
            )}
          </div>
        )}

        {currentTab.id === "returns" && (
          <div className="space-y-3 text-[15px] leading-[1.7] text-[#5F6B7A]">
            {returnPoints.length > 0 && (
              <ul className="space-y-1.5">
                {returnPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {returnUrl && (
              <Link
                href={returnUrl}
                className="inline-block pt-1 text-[14px] font-semibold text-[#1C99D6] transition-colors hover:text-[#0A2540]"
              >
                View Full Return Policy →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: parse summary text (newlines or bullet markers) into bullet points
function parseSummaryPoints(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
    .filter(Boolean);
}

// Helper: parse description into bullet points (only lines starting with bullet markers)
function parseDescriptionPoints(description: string): string[] {
  const lines = description.split("\n").map((l) => l.trim()).filter(Boolean);
  const points: string[] = [];
  for (const line of lines) {
    const match = line.match(/^[•\-\*]\s+(.+)/);
    if (match && match[1].trim()) {
      points.push(match[1].trim());
    }
  }
  return points;
}

// ─── Dynamic Variant Selector Helpers ─────────────────────────────────────────

// Human-readable labels for known attribute keys
const ATTRIBUTE_LABELS: Record<string, string> = {
  btu: "BTU",
  phase: "Phase",
  outdoor_unit: "Outdoor Unit",
  outdoor_unit_series: "Outdoor Series",
  indoor_unit: "Indoor Unit",
  model_code: "Model",
  refrigerant: "Refrigerant",
  voltage: "Voltage",
  kw: "Power (kW)",
  inverter: "Technology",
  colour: "Colour",
};

function getAttributeLabel(key: string): string {
  return ATTRIBUTE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

function formatAttributeValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  if (key === "btu" && typeof value === "number") return `${value.toLocaleString("en-ZA")} BTU`;
  if (key === "inverter") return value === true ? "Inverter" : "Non-Inverter";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// Discover which attribute keys vary across variants (these get selectors)
// Keys that are constant across all variants are not shown as selectors
function getVaryingAttributeKeys(variants: ProductVariant[]): string[] {
  if (variants.length <= 1) return [];
  const allKeys = new Set<string>();
  variants.forEach(v => {
    if (v.variant_attributes) {
      Object.keys(v.variant_attributes).forEach(k => allKeys.add(k));
    }
  });
  const varying: string[] = [];
  for (const key of allKeys) {
    const values = new Set();
    variants.forEach(v => {
      if (v.variant_attributes && v.variant_attributes[key] !== undefined) {
        values.add(JSON.stringify(v.variant_attributes[key]));
      }
    });
    if (values.size > 1) {
      varying.push(key);
    }
  }
  // Sort: btu first (rendered separately as "Available Sizes"), then model, phase, outdoor unit, then others alphabetically
  varying.sort((a, b) => {
    const priority: Record<string, number> = { btu: 0, model_code: 1, phase: 2, outdoor_unit: 3, outdoor_unit_series: 4, indoor_unit: 5 };
    const pa = priority[a] ?? 99;
    const pb = priority[b] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });
  return varying;
}

// Get unique values for a given attribute key across all variants
function getUniqueAttributeValues(variants: ProductVariant[], key: string): Array<{ value: unknown; label: string; available: boolean }> {
  const seen = new Map<string, { value: unknown; label: string; available: boolean }>();
  variants.forEach(v => {
    if (v.variant_attributes && v.variant_attributes[key] !== undefined) {
      const raw = v.variant_attributes[key];
      const serialized = JSON.stringify(raw);
      if (!seen.has(serialized)) {
        seen.set(serialized, {
          value: raw,
          label: formatAttributeValue(key, raw),
          available: !v.is_sold_out,
        });
      }
    }
  });
  return Array.from(seen.values());
}

// Find matching variant based on selected attribute values
function findVariantByAttributes(
  variants: ProductVariant[],
  selectedAttrs: Record<string, unknown>
): ProductVariant | null {
  return variants.find(v => {
    if (!v.variant_attributes) return false;
    for (const [key, value] of Object.entries(selectedAttrs)) {
      if (v.variant_attributes[key] !== value) return false;
    }
    return true;
  }) ?? null;
}

// ─── Reusable Configuration Option ────────────────────────────────────────────

interface ConfigurationOptionProps {
  title: string;
  subtitle?: string;
  description?: string;
  selectedValue: "yes" | "no";
  onSelect: (value: "yes" | "no") => void;
  titleId?: string;
  children?: React.ReactNode;
}

function ConfigurationOption({
  title,
  subtitle,
  description,
  selectedValue,
  onSelect,
  titleId,
  children,
}: ConfigurationOptionProps) {
  return (
    <div className="border-b border-gray-100 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col">
          <h3
            id={titleId}
            className="text-[20px] font-semibold tracking-tight text-[#0A2540]"
          >
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[14px] font-normal text-[#5F6B7A]">{subtitle}</p>
          )}
        </div>

        {/* Minimal segmented control */}
        <div
          role="radiogroup"
          aria-label={title}
          className="inline-flex shrink-0 items-center rounded-[6px] border border-gray-200 bg-white p-[3px]"
        >
          {(["no", "yes"] as const).map((opt) => {
            const isSelected = selectedValue === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(opt)}
                className={cn(
                  "rounded-[4px] px-5 py-[6px] text-[13px] font-medium capitalize transition-colors",
                  isSelected
                    ? "bg-[#1C99D6] text-white"
                    : "text-[#58585A] hover:text-[#0A2540]"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {description && (
        <p className="mt-3 max-w-[60ch] text-[13px] font-normal leading-[1.55] text-[#5F6B7A]">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductDetailClient({ product, relatedProducts, variants, breadcrumbs, kitConfig = EMPTY_KIT_CONFIG, maintenanceConfig = EMPTY_MAINTENANCE_CONFIG, warrantyConfig = EMPTY_WARRANTY_CONFIG }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const router = useRouter();

  // ─── Variant state ──────────────────────────────────────────────────────
  const allVariants: ProductVariant[] = variants.length > 0
    ? variants
    : [{
        id: product.id,
        slug: product.slug,
        btu_range: product.btu_range,
        price_zar: product.price_zar,
        sale_price_zar: product.sale_price_zar,
        images: product.images,
        stock_count: product.stock.stock_count,
        is_sold_out: product.stock.is_sold_out,
        low_stock_threshold: product.stock.low_stock_threshold,
        room_coverage: product.room_coverage,
        specs: product.specs,
        is_enquiry_only: product.is_enquiry_only,
        variant_name: null,
        variant_attributes: undefined,
        display_name: product.display_name,
        description: product.description,
        documents: product.documents,
      }];

  const [selectedVariantId, setSelectedVariantId] = useState(product.id);
  const selectedVariant = allVariants.find(v => v.id === selectedVariantId) ?? allVariants[0];

  // ─── Dynamic variant attribute selectors ────────────────────────────────
  const varyingKeys = useMemo(() => getVaryingAttributeKeys(allVariants), [allVariants]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, unknown>>({});

  // Initialize selected attributes from the current variant
  useEffect(() => {
    if (selectedVariant.variant_attributes && varyingKeys.length > 0) {
      const newAttrs: Record<string, unknown> = {};
      varyingKeys.forEach(key => {
        if (selectedVariant.variant_attributes && selectedVariant.variant_attributes[key] !== undefined) {
          newAttrs[key] = selectedVariant.variant_attributes[key];
        }
      });
      setSelectedAttrs(newAttrs);
    }
  }, [selectedVariantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAttributeChange = (key: string, value: unknown) => {
    const newAttrs = { ...selectedAttrs, [key]: value };
    setSelectedAttrs(newAttrs);
    const match = findVariantByAttributes(allVariants, newAttrs);
    if (match && match.id !== selectedVariantId) {
      setSelectedVariantId(match.id);
      setAddedToCart(false);
      router.push(`/products/${match.slug}`, { scroll: false });
    }
  };

  // Derive dynamic values from selected variant
  const currentBtuRange = selectedVariant.btu_range;
  const currentPrice = selectedVariant.sale_price_zar ?? selectedVariant.price_zar;
  const currentImages = selectedVariant.images.length > 0 ? selectedVariant.images : product.images;
  const currentStockCount = selectedVariant.stock_count;
  const currentIsSoldOut = selectedVariant.is_sold_out;
  const currentLowStockThreshold = selectedVariant.low_stock_threshold;
  const currentRoomCoverage = selectedVariant.room_coverage ?? getRoomCoverage(currentBtuRange);
  const currentSpecs = selectedVariant.specs ?? product.specs;
  const currentIsEnquiryOnly = selectedVariant.is_enquiry_only ||
    (product.type === "aircon" && currentBtuRange !== null && currentBtuRange > 62000);

  const stockStatus = currentIsSoldOut
    ? "sold_out"
    : currentStockCount <= currentLowStockThreshold
    ? "low_stock"
    : "in_stock";
  const isEnquiryOnly = currentIsEnquiryOnly;

  const [hasInstallation, setHasInstallation] = useState(false);
  const [installationTermsAccepted, setInstallationTermsAccepted] = useState(false);
  const [showInstallationTerms, setShowInstallationTerms] = useState(false);
  const [showInstallationDetails, setShowInstallationDetails] = useState(false);
  const [selectedInstallationTierId, setSelectedInstallationTierId] = useState<string>(
    getInstallationTierForBtu(currentBtuRange).id
  );
  const [hasInstallationKits, setHasInstallationKits] = useState(false);
  const [showInstallationKitTerms, setShowInstallationKitTerms] = useState(false);

  // ─── Installation Kit Configuration state (database-driven) ───────────────
  const useDbKitConfig = kitConfig.kits.length > 0;
  const [kitConfigState, setKitConfigState] = useState<KitConfiguration | null>(null);

  // Initialize kit config state when config is available
  useEffect(() => {
    if (useDbKitConfig && !kitConfigState && kitConfig.kits.length > 0) {
      const firstKit = kitConfig.kits[0];
      const compatibleMaterials = kitConfig.materialCompat.filter((c) => c.kit_id === firstKit.id);
      const firstMaterial = kitConfig.pipeMaterials.find((m) => compatibleMaterials.some((c) => c.material_id === m.id));
      const compatibleSizes = firstMaterial ? kitConfig.pipeSizes.filter((s) => s.material_id === firstMaterial.id) : [];
      const firstSize = compatibleSizes[0];
      const compatibleLengths = kitConfig.pipeLengths.filter((l) => l.kit_id === firstKit.id);
      const firstLength = compatibleLengths[0];
      const compatibleBrackets = kitConfig.bracketCompat.filter((c) => c.kit_id === firstKit.id);
      const firstBracket = kitConfig.brackets.find((b) => compatibleBrackets.some((c) => c.bracket_id === b.id));
      const compatibleInsulations = kitConfig.insulationCompat.filter((c) => c.kit_id === firstKit.id);
      const firstInsulation = kitConfig.insulations.find((i) => compatibleInsulations.some((c) => c.insulation_id === i.id));

      setKitConfigState({
        kitId: firstKit.id,
        materialId: firstMaterial?.id ?? "",
        pipeSizeId: firstSize?.id ?? "",
        pipeLengthId: firstLength?.id ?? "",
        bracketId: firstBracket?.id ?? "",
        insulationId: firstInsulation?.id ?? "",
        hasCage: false,
        cageId: null,
      });
    }
  }, [useDbKitConfig, kitConfig, kitConfigState]);
  const [hasMaintenance, setHasMaintenance] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(maintenanceConfig.plans[0]?.id ?? null);
  const [resolvedMaintenancePrice, setResolvedMaintenancePrice] = useState<ResolvedMaintenancePrice | null>(null);
  const [showMaintenanceTerms, setShowMaintenanceTerms] = useState(false);
  const [warrantySelection, setWarrantySelection] = useState<WarrantySelection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Auto-select the installation tier when the BTU/variant changes
  useEffect(() => {
    const tier = getInstallationTierForBtu(currentBtuRange);
    setSelectedInstallationTierId(tier.id);
  }, [currentBtuRange]);

  const productImageUrls = useMemo(() => currentImages ?? [], [currentImages]);

  const productImages = useMemo<ProductImage[]>(
    () => productImageUrls.map((url) => ({ src: url, alt: product.name })),
    [productImageUrls, product.name]
  );

  const selectedInstallationTier = useMemo(
    () => INSTALLATION_TIERS.find((t) => t.id === selectedInstallationTierId) ?? INSTALLATION_TIERS[0],
    [selectedInstallationTierId]
  );

  const isInstallationEnquiry = selectedInstallationTier.isEnquiry;

  const baseInstallationPrice = useMemo(() => {
    // 1. Check product-specific pricing from Supabase first
    if (product.installation_pricing && currentBtuRange) {
      const btuKey = String(currentBtuRange);
      if (product.installation_pricing[btuKey] !== undefined) {
        return product.installation_pricing[btuKey];
      }
      for (const [key, price] of Object.entries(product.installation_pricing)) {
        const range = key.split("-").map(Number);
        if (range.length === 2 && currentBtuRange >= range[0] && currentBtuRange <= range[1]) {
          return price;
        }
      }
    }
    // 2. Fall back to the selected tier's price
    return selectedInstallationTier.price;
  }, [product.installation_pricing, currentBtuRange, selectedInstallationTier]);

  const installationPrice = hasInstallation && !isInstallationEnquiry ? baseInstallationPrice : 0;

  // ─── Database-driven kit price calculation ────────────────────────────────
  const resolvedKitPrice = useMemo<ResolvedInstallationPrice>(() => {
    if (!useDbKitConfig || !kitConfigState) {
      return { price: 0, priceOnRequest: false, breakdown: [], additionalOptionsTotal: 0, message: null };
    }
    return resolveInstallationPrice(kitConfig, kitConfigState, {
      id: product.id,
      name: product.name,
      display_name: product.display_name ?? null,
      brand: product.brand,
      btu_range: currentBtuRange ?? product.btu_range,
      type: product.type,
    });
  }, [useDbKitConfig, kitConfigState, kitConfig, product, currentBtuRange]);

  const resolvedWarrantyPrice = useMemo<ResolvedWarrantyPrice>(() => {
    if (!warrantySelection || !warrantyConfig) {
      return { optionId: "", price: 0, priceOnRequest: false, requiresConfirmation: false, message: null };
    }
    return resolveWarrantyPrice(warrantyConfig, warrantySelection.optionId, {
      id: product.id,
      brand: product.brand,
      btu_range: currentBtuRange,
      type: product.type,
      category: null,
    });
  }, [warrantySelection, warrantyConfig, product, currentBtuRange]);

  const hasProtectionPlan = !!warrantySelection;
  const installationKitPrice = hasInstallationKits && kitConfigState ? resolvedKitPrice.price : 0;
  const protectionPlanPrice = hasProtectionPlan ? resolvedWarrantyPrice.price : 0;

  const selectedMaintenance = useMemo(
    () => (selectedMaintenanceId ? maintenanceConfig.plans.find((plan) => plan.id === selectedMaintenanceId) : null),
    [selectedMaintenanceId, maintenanceConfig.plans]
  );

  const maintenancePrice = hasMaintenance ? (resolvedMaintenancePrice?.price ?? 0) : 0;

  const baseUnitPrice = currentPrice;
  const unitPrice = isEnquiryOnly
    ? baseUnitPrice
    : baseUnitPrice + installationPrice + installationKitPrice + maintenancePrice + (hasProtectionPlan ? protectionPlanPrice : 0);
  const orderTotal = unitPrice * quantity;

  const priceBreakdown: PriceLine[] = isEnquiryOnly
    ? []
    : [
        { id: "unit", label: `${product.name} unit`, amount: baseUnitPrice },
        { id: "installation", label: "Installation", amount: installationPrice, isEnquiry: isInstallationEnquiry && hasInstallation },
        { id: "installation-kit", label: "Installation kit", amount: installationKitPrice },
        { id: "maintenance", label: "Maintenance", amount: maintenancePrice, isEnquiry: (resolvedMaintenancePrice?.priceOnRequest ?? true) && hasMaintenance },
        {
          id: "protection",
          label: "Warranty",
          amount: hasProtectionPlan ? protectionPlanPrice : 0,
        },
      ];

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
    setAddedToCart(false);
  };

  const handleAddToCart = () => {
    if (stockStatus === "sold_out") return;
    // Build kit configuration label for cart
    let kitLabel = "";
    if (hasInstallationKits) {
      if (useDbKitConfig && kitConfigState) {
        const kit = kitConfig.kits.find((k) => k.id === kitConfigState.kitId);
        const material = kitConfig.pipeMaterials.find((m) => m.id === kitConfigState.materialId);
        const size = kitConfig.pipeSizes.find((s) => s.id === kitConfigState.pipeSizeId);
        const length = kitConfig.pipeLengths.find((l) => l.id === kitConfigState.pipeLengthId);
        const bracket = kitConfig.brackets.find((b) => b.id === kitConfigState.bracketId);
        const insulation = kitConfig.insulations.find((i) => i.id === kitConfigState.insulationId);
        const cage = kitConfigState.hasCage && kitConfigState.cageId
          ? kitConfig.cages.find((c) => c.id === kitConfigState.cageId)
          : null;
        const parts = [
          kit?.name,
          material?.name,
          size?.label,
          length ? `${length.length_m}m` : null,
          bracket?.name,
          insulation?.name,
          cage ? `Cage: ${cage.name}` : null,
        ].filter(Boolean);
        kitLabel = ` + ${parts.join(", ")}`;
      } else {
        kitLabel = " + Installation kit";
      }
    }
    const kitIdPart = kitConfigState
      ? `${kitConfigState.kitId}-${kitConfigState.materialId}-${kitConfigState.pipeSizeId}-${kitConfigState.pipeLengthId}-${kitConfigState.bracketId}-${kitConfigState.insulationId}-${kitConfigState.hasCage ? kitConfigState.cageId : "nocage"}`
      : "nokit";

    const variantParts: string[] = [];
    if (currentBtuRange) variantParts.push(`${currentBtuRange.toLocaleString("en-ZA")} BTU`);
    if (selectedAttrs && Object.keys(selectedAttrs).length > 0) {
      Object.entries(selectedAttrs).forEach(([_, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          variantParts.push(String(value));
        }
      });
    }
    if (hasInstallation) variantParts.push(hasInstallationKits ? `Installation${kitLabel}` : "Installation");
    if (hasMaintenance && selectedMaintenance) variantParts.push(selectedMaintenance.name);
    if (warrantySelection) {
      variantParts.push(warrantyConfig.options.find((o) => o.id === warrantySelection.optionId)?.name ?? "Warranty");
    }

    addItem({
      id: `${selectedVariant.id}-${hasInstallation ? "install" : "noinstall"}-${hasInstallationKits ? kitIdPart : "nokit"}-${hasMaintenance ? selectedMaintenanceId : "nomaintenance"}-${warrantySelection ? warrantySelection.optionId : "no-warranty"}`,
      name: product.name,
      variant: variantParts.join(" · ") || undefined,
      slug: selectedVariant.slug,
      price_zar: unitPrice,
      sale_price_zar: undefined,
      images: productImageUrls,
      type: product.type,
      is_enquiry_only: selectedVariant.is_enquiry_only,
      has_installation: hasInstallation,
      installation_tier_id: selectedInstallationTierId,
      installation_price_zar: installationPrice,
      kit_configuration: kitConfigState ? kitConfigState as unknown as Record<string, unknown> : null,
      kit_price_zar: installationKitPrice,
      maintenance_plan_id: hasMaintenance ? selectedMaintenanceId : null,
      maintenance_price_zar: maintenancePrice,
      warranty_option_id: warrantySelection ? warrantySelection.optionId : null,
      warranty_price_zar: protectionPlanPrice,
    });
    setAddedToCart(true);
  };

  const displayName = product.display_name || product.name;
  const roomCoverage = currentRoomCoverage;
  const currentDescription = selectedVariant.description ?? product.description;
  const descriptionPoints = getDescriptionPoints(currentDescription);
  const currentDocuments = selectedVariant.documents ?? product.documents;

  return (
    <div className="min-h-screen bg-white font-sans text-[#404040]">
      {/* Product detail page typography overrides — scoped to this page only */}
      <style dangerouslySetInnerHTML={{ __html: `
        main h1[data-product-title] { font-size: 30px !important; }
        main h2[data-section-title] { font-size: 24px !important; }
        @media (min-width: 640px) {
          main h1[data-product-title] { font-size: 34px !important; }
          main h2[data-section-title] { font-size: 26px !important; }
        }
        @media (min-width: 1024px) {
          main h1[data-product-title] { font-size: 40px !important; }
          main h2[data-section-title] { font-size: 28px !important; }
        }
      ` }} />
      <header id="relume" className="px-[5%] py-6 md:py-8 lg:py-10">
        <div className="container">
          <div className="grid grid-cols-1 gap-y-8 md:gap-y-10 lg:grid-cols-[1.35fr_1fr] lg:gap-x-12">
            <Gallery images={productImages} />
            <div>
              <div className="lg:sticky lg:top-6">
                {/* Breadcrumb — dynamic from database category hierarchy */}
                <Breadcrumb className="mb-4 flex flex-wrap items-center text-[12px] font-medium">
                  <BreadcrumbList>
                    {breadcrumbs.map((item, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {isLast || !item.url ? (
                              <BreadcrumbPage className="text-[#0A2540]">{item.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link href={item.url} className="capitalize text-[#5F6B7A] transition-colors hover:text-[#1C99D6]">{item.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>

                <div>
                  {/* Brand */}
                  {product.brand && (
                    <p className="mb-2 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#58585A]">
                      {product.brand}
                    </p>
                  )}

                  {/* Product Name — H1, the most important text on the page */}
                  <h1
                    data-product-title
                    className="mb-3 font-semibold leading-[1.1] tracking-[-0.02em] text-[#0A2540]"
                  >
                    {(() => {
                      let rawName = product.display_name || product.name;
                      if (product.brand) {
                        const brandPattern = new RegExp(`^${product.brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
                        while (brandPattern.test(rawName)) {
                          rawName = rawName.replace(brandPattern, "");
                        }
                      }
                      return rawName;
                    })()}
                  </h1>

                  {/* Stock status + Rating + Technology */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <p className="flex items-center gap-2 text-[14px] font-medium">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          stockStatus === "sold_out"
                            ? "bg-red-500"
                            : stockStatus === "low_stock"
                            ? "bg-orange-500"
                            : "bg-[#0F834D]"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={
                          stockStatus === "sold_out"
                            ? "text-red-600"
                            : stockStatus === "low_stock"
                            ? "text-orange-600"
                            : "text-[#0F834D]"
                        }
                      >
                        {stockStatus === "sold_out"
                          ? "Out of stock"
                          : stockStatus === "low_stock"
                          ? `Only ${currentStockCount} left`
                          : "In stock"}
                      </span>
                    </p>
                    <span className="h-4 w-px bg-gray-300" />
                    {(product.rating ?? 0) > 0 && (product.review_count ?? 0) > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#FFA500]">{"★".repeat(Math.round(product.rating ?? 0))}{"☆".repeat(5 - Math.round(product.rating ?? 0))}</span>
                        <span className="text-[14px] font-bold text-[#0A2540]">{(product.rating ?? 0).toFixed(1)}</span>
                        <span className="text-[14px] text-[#5F6B7A]">· {(product.review_count ?? 0).toLocaleString("en-ZA")} Reviews</span>
                      </div>
                    )}
                    {(() => {
                      const techLabel = deriveTechnologyLabel(product.name, product.specs);
                      if (!techLabel) return null;
                      return (
                        <>
                          <span className="h-4 w-px bg-gray-300" />
                          <span className="text-[14px] font-semibold text-[#0A2540]">{techLabel}</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Price — prominent, brand blue */}
                  <p className="mb-6 text-[24px] font-bold text-[#1C99D6] sm:text-[26px]">
                    {isEnquiryOnly
                      ? "Commercial"
                      : `${allVariants.length > 1 ? "From " : ""}${formatPrice(currentPrice)}`}
                  </p>

                  {/* Product Information Tabs — fully database-driven */}
                  <ProductInfoTabs product={product} />

                  {/* Product facts — small highlights to fill empty space */}
                  {(() => {
                    const facts: { label: string; icon: React.ReactNode }[] = [];
                    if (roomCoverage) {
                      const m2Match = roomCoverage.match(/(\d+)\s*[-–]\s*(\d+)\s*m/);
                      if (m2Match) {
                        facts.push({ label: `Covers up to ${m2Match[2]} m²`, icon: null });
                      } else {
                        facts.push({ label: roomCoverage, icon: null });
                      }
                    }
                    if (currentSpecs?.energy_rating) {
                      facts.push({ label: `Energy Rating ${currentSpecs.energy_rating}`, icon: null });
                    }
                    if (currentSpecs?.wifi) {
                      facts.push({ label: "WiFi Ready", icon: null });
                    }
                    if (facts.length === 0) return null;
                    return (
                      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2">
                        {facts.map((fact, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-[14px] font-medium text-[#0A2540]">
                            <svg className="h-4 w-4 flex-shrink-0 text-[#0F834D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {fact.label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Form section */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddToCart();
                    }}
                    className="mb-4 mt-6"
                  >
                    <div className="grid grid-cols-1 gap-5">
                      {/* Available Sizes — canonical BTU selector, rendered FIRST as primary size selection.
                          Fully database-driven from variant group (btu_range). */}
                      {(() => {
                        const allBtus = Array.from(new Set(
                          allVariants
                            .map(v => v.btu_range)
                            .filter((b): b is number => b !== null && b !== undefined)
                        )).sort((a, b) => a - b);
                        if (allBtus.length === 0) return null;

                        if (allBtus.length === 1) {
                          return (
                            <div>
                              <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#58585A]">Available Size</p>
                              <p className="mt-1 text-[14px] font-medium text-[#0A2540]">
                                {allBtus[0].toLocaleString("en-ZA")} BTU
                              </p>
                              <p className="mt-1 text-[14px] text-[#5F6B7A]">
                                Only available in {allBtus[0].toLocaleString("en-ZA")} BTU.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div>
                            <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#58585A]">Available Sizes</p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {allBtus.map((btu) => {
                                const variantForBtu = allVariants.find(v => v.btu_range === btu);
                                const isSelected = currentBtuRange === btu;
                                const isDisabled = variantForBtu?.is_sold_out ?? false;
                                return (
                                  <button
                                    key={btu}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      if (isSelected || !variantForBtu) return;
                                      setSelectedVariantId(variantForBtu.id);
                                      setAddedToCart(false);
                                      router.push(`/products/${variantForBtu.slug}`, { scroll: false });
                                    }}
                                    title={isSelected ? "Selected size" : isDisabled ? "Out of stock" : `Select ${btu.toLocaleString("en-ZA")} BTU`}
                                    className={cn(
                                      "rounded-[4px] border-2 px-4 py-2 text-[14px] font-semibold transition-all",
                                      isSelected
                                        ? "border-[#1C99D6] bg-[#1C99D6] text-white"
                                        : isDisabled
                                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                                        : "border-gray-300 bg-white text-[#0A2540] hover:border-[#1C99D6] hover:text-[#1C99D6]"
                                    )}
                                  >
                                    {btu.toLocaleString("en-ZA")} BTU
                                    {isDisabled && !isSelected && " · Out of stock"}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="mt-2 text-[14px] text-[#5F6B7A]">
                              Available in {allBtus.length} sizes.
                            </p>
                          </div>
                        );
                      })()}

                      {/* Dynamic variant selectors — fully database-driven from variant_attributes.
                          BTU is excluded here because it is rendered by the canonical
                          "Available Sizes" selector above to avoid duplication.
                          Render order: Model → Phase → Outdoor Unit → other attributes. */}
                      {varyingKeys
                        .filter((attrKey) => attrKey !== "btu")
                        .map((attrKey) => {
                          const values = getUniqueAttributeValues(allVariants, attrKey);
                          const currentValue = selectedAttrs[attrKey];
                          return (
                            <div key={attrKey} className="flex flex-col">
                              <label className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-[#58585A]">
                                {getAttributeLabel(attrKey)}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {values.map((opt) => {
                                  const isSelected = currentValue === opt.value || JSON.stringify(currentValue) === JSON.stringify(opt.value);
                                  const isDisabled = !opt.available;
                                  return (
                                    <button
                                      key={opt.label}
                                      type="button"
                                      disabled={isDisabled}
                                      onClick={() => handleAttributeChange(attrKey, opt.value)}
                                      title={isSelected ? `Selected ${getAttributeLabel(attrKey)}` : isDisabled ? "Out of stock" : `Select ${opt.label}`}
                                      className={cn(
                                        "rounded-[4px] border-2 px-4 py-2 text-[14px] font-semibold transition-all",
                                        isSelected
                                          ? "border-[#1C99D6] bg-[#1C99D6] text-white"
                                          : isDisabled
                                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                                          : "border-gray-300 bg-white text-[#0A2540] hover:border-[#1C99D6] hover:text-[#1C99D6]"
                                      )}
                                    >
                                      {opt.label}
                                      {isDisabled && !isSelected && " · Out of stock"}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Add-ons (only for non-enquiry products) */}
                    {!isEnquiryOnly && (
                      <div className="mt-6">
                        <div className="border-b border-gray-200 pb-3">
                          <h2 data-section-title className="font-semibold tracking-tight text-[#0A2540]">
                            Customize your order
                          </h2>
                          <p className="mt-1.5 text-[14px] text-[#5F6B7A]">
                            Optional extras for your unit
                          </p>
                        </div>

                        <div className="flex flex-col">
                          {/* Installation — interactive with clickable pricing tiers */}
                          <div className="border-b border-gray-100 py-5">
                            {/* Header row: title + No/Yes control */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex flex-col">
                                <h3
                                  id="installation-title"
                                  className="text-[20px] font-semibold tracking-tight text-[#0A2540]"
                                >
                                  Installation
                                </h3>
                                <p className="mt-1 text-[14px] font-normal text-[#5F6B7A]">
                                  Professional back-to-back installation
                                </p>
                              </div>

                              {/* No / Yes segmented control */}
                              <div
                                role="radiogroup"
                                aria-label="Installation"
                                className="inline-flex shrink-0 items-center rounded-[6px] border border-gray-200 bg-white p-[3px]"
                              >
                                {(["no", "yes"] as const).map((opt) => {
                                  const isSelected = (hasInstallation ? "yes" : "no") === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      role="radio"
                                      aria-checked={isSelected}
                                      onClick={() => {
                                        if (opt === "no") {
                                          setHasInstallation(false);
                                          setInstallationTermsAccepted(false);
                                          setHasInstallationKits(false);
                                          setKitConfigState(null);
                                        } else {
                                          setShowInstallationTerms(true);
                                        }
                                      }}
                                      className={cn(
                                        "rounded-[4px] px-5 py-[6px] text-[13px] font-medium capitalize transition-colors",
                                        isSelected
                                          ? "bg-[#1C99D6] text-white"
                                          : "text-[#58585A] hover:text-[#0A2540]"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Clickable "From" price link */}
                            <button
                              type="button"
                              onClick={() => setShowInstallationDetails((v) => !v)}
                              className="mt-3 text-[14px] font-semibold text-[#1C99D6] transition-colors hover:text-[#1597c6]"
                            >
                              From R1 950 incl. VAT {showInstallationDetails ? "−" : "+"}
                            </button>

                            {/* Expandable pricing details */}
                            {showInstallationDetails && (
                              <div className="mt-3 space-y-3">
                                {/* Clickable pricing tiers */}
                                <div className="flex flex-col gap-1.5">
                                  {INSTALLATION_TIERS.map((tier) => {
                                    const isSelected = selectedInstallationTierId === tier.id;
                                    return (
                                      <button
                                        key={tier.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedInstallationTierId(tier.id);
                                          if (!tier.isEnquiry && hasInstallation) {
                                            // Price will update via baseInstallationPrice
                                          }
                                        }}
                                        className={cn(
                                          "flex items-center justify-between rounded-[4px] border px-4 py-2.5 text-[14px] font-medium transition-all",
                                          isSelected
                                            ? "border-[#1C99D6] bg-[#1C99D6] text-white"
                                            : "border-gray-200 bg-white text-[#0A2540] hover:border-[#1C99D6] hover:text-[#1C99D6]"
                                        )}
                                      >
                                        <span>{tier.label}</span>
                                        <span className="font-semibold">
                                          {tier.isEnquiry ? "Quote on request" : formatPrice(tier.price)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Important note */}
                                <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-3">
                                  <p className="text-[13px] font-semibold text-[#0A2540]">Important</p>
                                  <ul className="mt-1.5 space-y-1 text-[13px] leading-[1.5] text-[#5F6B7A]">
                                    <li>An isolator is required and is not included.</li>
                                    <li>It must be installed by a qualified electrician.</li>
                                    <li>Allow approximately R350–R500.</li>
                                  </ul>
                                </div>

                                {/* View full installation terms link */}
                                <button
                                  type="button"
                                  onClick={() => setShowInstallationTerms(true)}
                                  className="text-[13px] font-semibold text-[#1C99D6] transition-colors hover:text-[#1597c6]"
                                >
                                  View full installation terms →
                                </button>
                              </div>
                            )}

                            {/* Description */}
                            <p className="mt-3 max-w-[60ch] text-[13px] font-normal leading-[1.55] text-[#5F6B7A]">
                              {hasInstallation
                                ? `Core installation with up to 3m piping, bracket and commissioning included. ${selectedInstallationTier.isEnquiry ? "Quote on request for this unit size." : `Selected: ${selectedInstallationTier.label} — ${formatPrice(baseInstallationPrice)}.`}`
                                : "Select installation to add professional fitment to your order."}
                            </p>

                            {/* Installation terms modal — minimal, premium, scannable */}
                            <Dialog open={showInstallationTerms} onOpenChange={setShowInstallationTerms}>
                              <DialogContent
                                hideCloseButton
                                className="flex max-h-[100dvh] w-full flex-col gap-0 overflow-hidden rounded-none p-0 left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-h-[85vh] sm:w-[calc(100vw-48px)] sm:max-w-[800px] sm:rounded-[12px] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]"
                              >
                                {/* Sticky modal header */}
                                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-5">
                                  <div>
                                    <DialogTitle className="text-[22px] font-semibold tracking-tight text-[#0A2540] sm:text-[28px]">
                                      Installation
                                    </DialogTitle>
                                    <DialogDescription className="mt-1 text-[14px] font-normal text-[#5F6B7A]">
                                      Professional back-to-back installation
                                    </DialogDescription>
                                  </div>
                                  <DialogClose className="ml-3 mt-1 rounded-md p-1.5 text-[#5F6B7A] transition-colors hover:bg-gray-100 hover:text-[#0A2540] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 sm:ml-4">
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close</span>
                                  </DialogClose>
                                </div>

                                {/* Scrollable content — clean summary only */}
                                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
                                  <div className="space-y-5 sm:space-y-6">
                                    {/* Installation Pricing */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        Installation Pricing
                                      </h4>
                                      <p className="mt-1.5 text-[14px] text-[#5F6B7A] sm:text-[15px]">
                                        From R1 950 incl. VAT
                                      </p>
                                      <div className="mt-3 flex flex-col gap-1">
                                        {INSTALLATION_TIERS.map((tier) => {
                                          const isSelected = selectedInstallationTierId === tier.id;
                                          return (
                                            <button
                                              key={tier.id}
                                              type="button"
                                              onClick={() => setSelectedInstallationTierId(tier.id)}
                                              className={cn(
                                                "flex items-center justify-between rounded-[4px] border px-3 py-2 text-[14px] font-medium transition-all sm:px-4 sm:py-2.5 sm:text-[15px]",
                                                isSelected
                                                  ? "border-[#1C99D6] bg-[#1C99D6] text-white"
                                                  : "border-gray-200 bg-white text-[#0A2540] hover:border-[#1C99D6] hover:text-[#1C99D6]"
                                              )}
                                            >
                                              <span>{tier.label}</span>
                                              <span className="font-semibold whitespace-nowrap">
                                                {tier.isEnquiry ? "Quote on request" : formatPrice(tier.price)}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </section>

                                    {/* What's Included */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        What&apos;s Included
                                      </h4>
                                      <ul className="mt-2.5 space-y-1.5 text-[14px] leading-[1.5] text-[#334155] sm:mt-3 sm:space-y-2 sm:text-[15px]">
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#0F834D]" aria-hidden="true">✓</span>
                                          <span>Up to 3m refrigerant piping, drain pipe &amp; cable</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#0F834D]" aria-hidden="true">✓</span>
                                          <span>Outdoor mounting bracket, if required</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#0F834D]" aria-hidden="true">✓</span>
                                          <span>Installation up to 3m above ground</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#0F834D]" aria-hidden="true">✓</span>
                                          <span>One wall penetration</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#0F834D]" aria-hidden="true">✓</span>
                                          <span>Holes filled, not painted</span>
                                        </li>
                                      </ul>
                                    </section>

                                    {/* Additional Costs May Apply */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        Additional Costs May Apply
                                      </h4>
                                      <ul className="mt-2.5 space-y-1.5 text-[14px] leading-[1.5] text-[#334155] sm:mt-3 sm:space-y-2 sm:text-[15px]">
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#5F6B7A]" aria-hidden="true">•</span>
                                          <span>Extra piping, cabling or electrical work</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#5F6B7A]" aria-hidden="true">•</span>
                                          <span>Trunking</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#5F6B7A]" aria-hidden="true">•</span>
                                          <span>Isolator and electrical work</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#5F6B7A]" aria-hidden="true">•</span>
                                          <span>Travel outside the 30km radius</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="mt-0.5 text-[#5F6B7A]" aria-hidden="true">•</span>
                                          <span>Installations that are not back-to-back</span>
                                        </li>
                                      </ul>
                                    </section>

                                    {/* Important */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        Important
                                      </h4>
                                      <div className="mt-2.5 space-y-1 text-[14px] leading-[1.5] text-[#334155] sm:mt-3 sm:space-y-1.5 sm:text-[15px]">
                                        <p>Isolator switches are required and are not included.</p>
                                        <p>A qualified electrician must install the isolator.</p>
                                        <p>Typical isolator cost: R350–R500.</p>
                                      </div>
                                    </section>

                                    {/* Back-to-Back Installation */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        Back-to-Back Installation
                                      </h4>
                                      <p className="mt-2.5 text-[14px] leading-[1.5] text-[#334155] sm:mt-3 sm:text-[15px]">
                                        Indoor unit on an exterior wall with the outdoor unit directly behind it.
                                        Any deviation is quoted on site.
                                      </p>
                                    </section>

                                    {/* Installation Quality */}
                                    <section>
                                      <h4 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#0A2540] sm:text-[15px]">
                                        Installation Quality
                                      </h4>
                                      <p className="mt-2.5 text-[14px] leading-[1.5] text-[#334155] sm:mt-3 sm:text-[15px]">
                                        Qualified and accredited installers.
                                        Certificate of compliance issued on completion.
                                      </p>
                                    </section>

                                  </div>
                                </div>

                                {/* Sticky footer with actions */}
                                <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
                                  <DialogFooter className="flex-row justify-between gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowInstallationTerms(false)}
                                      className="h-[44px] flex-1 sm:flex-none sm:w-auto"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setHasInstallation(true);
                                        setInstallationTermsAccepted(true);
                                        setShowInstallationTerms(false);
                                      }}
                                      className="h-[44px] flex-1 bg-[#1C99D6] text-white hover:bg-[#1597c6] sm:flex-none sm:w-auto"
                                    >
                                      Agree and Proceed
                                    </Button>
                                  </DialogFooter>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Installation Kits */}
                          <ConfigurationOption
                            title="Installation Kits"
                            subtitle="Copper piping & trunking"
                            description={
                              hasInstallationKits && kitConfigState
                                ? resolvedKitPrice.priceOnRequest
                                  ? "Installation kit — Quote on request"
                                  : `Installation kit — ${formatPrice(resolvedKitPrice.price)}`
                                : "Add extra brackets, drain pipes, trunking and copper piping for longer pipe runs."
                            }
                            selectedValue={hasInstallationKits ? "yes" : "no"}
                            onSelect={(value) => {
                              if (value === "no") {
                                setHasInstallationKits(false);
                                setKitConfigState(null);
                              } else {
                                setShowInstallationKitTerms(true);
                              }
                            }}
                            titleId="installation-kit-title"
                          >
                            <InstallationKitModal
                              open={showInstallationKitTerms}
                              onOpenChange={setShowInstallationKitTerms}
                              config={kitConfig}
                              product={{
                                id: product.id,
                                name: product.name,
                                display_name: product.display_name ?? null,
                                brand: product.brand,
                                btu_range: currentBtuRange ?? product.btu_range,
                                type: product.type,
                              }}
                              initialConfig={kitConfigState ?? undefined}
                              onConfirm={(config) => {
                                setKitConfigState(config);
                                setHasInstallationKits(true);
                                setShowInstallationKitTerms(false);
                              }}
                            />
                          </ConfigurationOption>

                          {/* Maintenance Plan */}
                          <ConfigurationOption
                            title="Maintenance Plan"
                            subtitle="Annual servicing"
                            description={
                              hasMaintenance
                                ? `${selectedMaintenance?.name ?? "Maintenance"} — ${selectedMaintenance?.description ?? ""}`
                                : "Add a scheduled maintenance plan to keep your unit running efficiently."
                            }
                            selectedValue={hasMaintenance ? "yes" : "no"}
                            onSelect={(value) => {
                              if (value === "no") {
                                setHasMaintenance(false);
                                setResolvedMaintenancePrice(null);
                              } else {
                                setShowMaintenanceTerms(true);
                              }
                            }}
                            titleId="maintenance-title"
                          >
                            <MaintenancePlanModal
                              open={showMaintenanceTerms}
                              onOpenChange={setShowMaintenanceTerms}
                              product={{
                                id: selectedVariant.id,
                                name: product.name,
                                display_name: selectedVariant.display_name || product.display_name,
                                brand: product.brand,
                                btu_range: currentBtuRange,
                                type: product.type,
                              }}
                              quantity={quantity}
                              config={maintenanceConfig}
                              initialSelection={{
                                planId: selectedMaintenanceId ?? undefined,
                              }}
                              onConfirm={(selection, price) => {
                                setSelectedMaintenanceId(selection.planId);
                                setResolvedMaintenancePrice(price);
                                setHasMaintenance(true);
                                setShowMaintenanceTerms(false);
                              }}
                            />
                          </ConfigurationOption>

                          {/* Extended Warranty */}
                          <div className="border-b border-gray-100 py-5">
                            <div className="flex flex-col gap-1">
                              <h3
                                id="protection-plan-title"
                                className="text-[20px] font-semibold tracking-tight text-[#0A2540]"
                              >
                                Extended Warranty
                              </h3>
                              <p className="text-[14px] font-normal text-[#5F6B7A]">
                                Extra manufacturer cover
                              </p>
                            </div>
                            <div className="mt-4">
                              <WarrantySelector
                                config={warrantyConfig}
                                product={{
                                  id: product.id,
                                  brand: product.brand,
                                  btu_range: currentBtuRange,
                                  type: product.type,
                                  category: null,
                                }}
                                value={warrantySelection}
                                onChange={setWarrantySelection}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Price breakdown */}
                        <section aria-labelledby="price-breakdown-title" className="mt-6 space-y-3 border-t border-gray-200 py-5">
                          <h3
                            id="price-breakdown-title"
                            className="text-[16px] font-semibold text-[#0A2540]"
                          >
                            Your Configuration
                          </h3>
                          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <dl className="space-y-2 text-[14px]">
                              {priceBreakdown.map((line) => (
                                <div key={line.id} className="flex items-center justify-between gap-4">
                                  <dt className="text-[#5F6B7A]">{line.label}</dt>
                                  <dd
                                    className={cn(
                                      "font-medium",
                                      line.amount === 0 ? "text-[#5F6B7A]" : "text-[#0A2540]"
                                    )}
                                  >
                                    {line.isEnquiry
                                      ? "Price on request"
                                      : line.amount === 0
                                      ? "—"
                                      : formatPrice(line.amount)}
                                  </dd>
                                </div>
                              ))}
                              <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
                                <dt className="font-medium text-[#0A2540]">Subtotal</dt>
                                <dd className="font-semibold text-[#0A2540]">{formatPrice(baseUnitPrice * quantity)}</dd>
                              </div>
                              <div className="flex items-center justify-between gap-4 border-t border-gray-300 pt-3">
                                <dt className="text-[15px] font-bold text-[#0A2540]">TOTAL</dt>
                                <dd className="text-[20px] font-bold text-[#1C99D6]">{formatPrice(orderTotal)}</dd>
                              </div>
                              {quantity > 1 && (hasInstallation || hasInstallationKits || hasMaintenance || hasProtectionPlan) && (
                                <p className="text-xs text-[#5F6B7A]">
                                  Add-on prices are charged per unit.
                                </p>
                              )}
                            </dl>
                          </div>
                        </section>
                      </div>
                    )}

                    {/* Quantity selector */}
                    <div className="mt-5 flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <label htmlFor="quantity" className="text-sm font-medium">
                          Quantity
                        </label>
                        <div className="flex h-[40px] items-center border border-gray-300" aria-label="Quantity selector">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            aria-label="Decrease quantity"
                            className="px-3 text-gray-500 hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <input
                            type="number"
                            id="quantity"
                            aria-label="Quantity"
                            value={quantity}
                            onChange={(event) => handleQuantityChange(parseInt(event.target.value, 10) || 1)}
                            className="w-12 text-center focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            aria-label="Increase quantity"
                            className="px-3 text-gray-500 hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-y-3">
                        {isEnquiryOnly ? (
                          <Button
                            asChild
                            className="h-[48px] w-full bg-[#1E3A5F] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#152d4a]"
                          >
                            <Link href="/checkout">Request Quote</Link>
                          </Button>
                        ) : stockStatus === "sold_out" ? (
                          <Button
                            disabled
                            className="h-[48px] w-full bg-gray-200 px-6 text-[15px] font-semibold text-gray-400"
                          >
                            Sold Out
                          </Button>
                        ) : addedToCart ? (
                          <Button
                            asChild
                            className="h-[48px] w-full bg-[#1E3A5F] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#152d4a]"
                          >
                            <Link href="/checkout">Go to basket</Link>
                          </Button>
                        ) : (
                          <button
                            type="submit"
                            className="flex h-[48px] w-full items-center justify-center gap-2 bg-[#1C99D6] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#1597c6]"
                          >
                            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                            <span>Add to basket</span>
                          </button>
                        )}
                      </div>

                      {/* Trust signals — compact horizontal row */}
                      <div className="mt-6 flex items-center justify-center gap-6 sm:gap-12">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 shrink-0 text-[#0F834D]" />
                          <span className="text-[13px] sm:text-[14px] font-medium text-[#5F6B7A]">
                            Selected items free installation
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 shrink-0 text-[#0F834D]" />
                          <span className="text-[13px] sm:text-[14px] font-medium text-[#5F6B7A]">
                            Secure checkout
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-[#0F834D]" />
                          <span className="text-[13px] sm:text-[14px] font-medium text-[#5F6B7A]">
                            Manufacturer warranty
                          </span>
                        </div>
                      </div>

                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Product details accordion */}
      <section className="px-[5%] py-10 md:py-12">
        <div className="container">
          <Accordion type="single" collapsible defaultValue="overview">
            <AccordionItem value="overview" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Overview
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4 text-[16px] leading-[1.6] text-[#5F6B7A]">
                  {descriptionPoints.length > 0 && (
                    <ul className="space-y-2">
                      {descriptionPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">Brand</dt>
                      <dd className="text-[#404040]">{product.brand ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">Type</dt>
                      <dd className="capitalize text-[#404040]">{product.type.replace(/_/g, " ")}</dd>
                    </div>
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">BTU</dt>
                      <dd className="text-[#404040]">{currentBtuRange?.toLocaleString("en-ZA") ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">Room coverage</dt>
                      <dd className="text-[#404040]">{roomCoverage ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specifications" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Specifications
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4 text-[16px]">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">Model</dt>
                      <dd className="text-[#404040]">{product.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">Unit description</dt>
                      <dd className="capitalize text-[#404040]">{product.type.replace(/_/g, " ")}</dd>
                    </div>
                    {currentBtuRange && (
                      <div>
                        <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">BTU rating</dt>
                        <dd className="text-[#404040]">{currentBtuRange.toLocaleString("en-ZA")}</dd>
                      </div>
                    )}
                    {currentSpecs &&
                      Object.entries(currentSpecs).map(([key, value]) => (
                        value && (
                          <div key={key}>
                            <dt className="text-[13px] font-medium uppercase tracking-[0.05em] text-[#58585A]">{key}</dt>
                            <dd className="text-[#404040]">{value}</dd>
                          </div>
                        )
                      ))}
                  </dl>
                  {(!currentSpecs || Object.keys(currentSpecs).length === 0) && (
                    <p className="text-[#5F6B7A]">No additional specifications available.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="installation" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Installation
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-3 text-[16px] leading-[1.6] text-[#5F6B7A]">
                  <p>
                    {product.installation_terms ??
                      "Professional back-to-back installation includes up to 3m piping, outdoor mounting bracket and commissioning. Extended pipe runs, electrical isolators and trunking are quoted on-site."}
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Installation available in selected areas</li>
                    <li>Certificate of compliance issued on completion</li>
                    <li>Qualified and accredited installers</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
            {product.shipping_info && (
            <AccordionItem value="shipping" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Shipping
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-3 text-[16px] leading-[1.6] text-[#5F6B7A]">
                  <p>{product.shipping_info}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            )}
            {product.returns_info && (
            <AccordionItem value="returns" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Returns
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-3 text-[16px] leading-[1.6] text-[#5F6B7A]">
                  <p>{product.returns_info}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            )}
            {currentDocuments && currentDocuments.length > 0 && (
            <AccordionItem value="downloads" className="border-b border-gray-200">
              <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0A2540]">
                Downloads
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-3">
                  {currentDocuments.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      download
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#1C99D6] hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5 flex-shrink-0 text-[#1C99D6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium text-[#0A2540]">{doc.name}</p>
                        {doc.type && <p className="text-[12px] text-[#5F6B7A]">{doc.type}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            )}
          </Accordion>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="px-[5%] pb-12" aria-labelledby="related-products-title">
          <div className="container">
            <h2
              id="related-products-title"
              className="mb-5 text-[24px] font-semibold leading-[1.1] tracking-tight text-[#0A2540] md:text-[28px]"
            >
              Shop other products
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((related) => {
                const relatedPrice = related.sale_price_zar ?? related.price_zar;
                return (
                  <div key={related.id} className="flex flex-col rounded-xl border border-gray-200 p-3">
                    <Link href={`/products/${related.slug}`} className="mb-3 flex flex-1 items-center justify-center">
                      <img
                        src={related.images?.[0] || "/placeholder.svg"}
                        alt={related.name}
                        className="max-h-[160px] w-auto object-contain"
                      />
                    </Link>
                    <Link href={`/products/${related.slug}`}>
                      <h3 className="mb-1 text-[15px] font-semibold text-[#0A2540] transition-colors hover:text-[#1C99D6]">
                        {related.name}
                      </h3>
                    </Link>
                    <p className="mb-2 text-[13px] text-[#5F6B7A]">
                      {related.brand ?? "Air Conditioner"}
                    </p>
                    <div className="mb-3 flex items-center gap-1">
                      <span className="text-[#FFA500] text-sm">{"★".repeat(Math.round(related.rating ?? 0))}{"☆".repeat(5 - Math.round(related.rating ?? 0))}</span>
                      <span className="text-[12px] text-[#5F6B7A]">{(related.rating ?? 0).toFixed(1)}</span>
                      <span className="text-[12px] text-[#5F6B7A]">({related.review_count ?? 0})</span>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-3 text-[18px] font-bold text-[#1C99D6]">
                        {related.is_enquiry_only ? "Commercial" : formatPrice(relatedPrice)}
                      </div>
                      {related.is_enquiry_only ? (
                        <Link
                          href="/checkout"
                          className="flex h-[40px] w-full items-center justify-center rounded-lg bg-[#1E3A5F] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#152d4a]"
                        >
                          Enquire
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            addItem({
                              id: related.id,
                              name: related.name,
                              slug: related.slug,
                              price_zar: relatedPrice,
                              sale_price_zar: undefined,
                              images: related.images,
                              type: related.type,
                              is_enquiry_only: related.is_enquiry_only,
                            })
                          }
                          className="flex h-[40px] w-full items-center justify-center rounded-lg bg-[#1C99D6] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#1597c6]"
                        >
                          Add to basket
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
