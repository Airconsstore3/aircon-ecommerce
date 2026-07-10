"use client";

import {
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getProductImages } from "@/lib/product-images";
import { useCart } from "@/components/shop/CartProvider";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AirconProduct {
  id: string;
  name: string;
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
}

interface ProductDetailClientProps {
  product: AirconProduct;
}

interface ProductImage {
  url: string;
  alt: string;
}

interface PriceLine {
  id: string;
  label: string;
  amount: number;
  isEnquiry?: boolean;
}

interface MaintenancePlan {
  id: "3months" | "6months" | "1year" | "2years" | "3years";
  name: string;
  description: string;
  price: number;
  isEnquiry?: boolean;
  features: string[];
}

interface InstallationKit {
  id: "pipe-6-10" | "pipe-10-25";
  name: string;
  description: string;
  priceOffset: number;
  features: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROTECTION_PLAN_PRICE = 1690;

const INSTALLATION_KITS: InstallationKit[] = [
  {
    id: "pipe-6-10",
    name: "Installation kit 6m & 10m",
    description: "Extended kit with 6m and 10m piping options plus mounting accessories.",
    priceOffset: 950,
    features: [
      "Brackets",
      "Drain pipes",
      "Trunking",
      "Copper pipes",
      "Anti-corrosion treatment",
      "Galvanized fittings",
    ],
  },
  {
    id: "pipe-10-25",
    name: "Installation kit 10m & 25m",
    description: "Full long-reach kit with 10m and 25m piping options plus mounting accessories.",
    priceOffset: 1850,
    features: [
      "Brackets",
      "Drain pipes",
      "Trunking",
      "Copper pipes",
      "Anti-corrosion treatment",
      "Galvanized fittings",
    ],
  },
];

const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: "3months",
    name: "Every 3 months",
    description: "Quarterly service visit to keep your unit running efficiently all year round.",
    price: 1500,
    features: [
      "Filter cleaning and replacement check",
      "Coil and fin inspection",
      "Refrigerant pressure check",
      "Drain line flush",
    ],
  },
  {
    id: "6months",
    name: "Every 6 months",
    description: "Bi-annual maintenance to maintain warranty and peak performance.",
    price: 1000,
    features: [
      "Deep clean of indoor and outdoor units",
      "Electrical connection check",
      "Thermostat and control calibration",
      "Report on unit health",
    ],
  },
  {
    id: "1year",
    name: "1 year contract",
    description: "Annual maintenance plan to keep your unit in top condition.",
    price: 0,
    isEnquiry: true,
    features: [
      "Scheduled annual service",
      "Filter and coil cleaning",
      "System performance check",
      "Priority support",
    ],
  },
  {
    id: "2years",
    name: "2 year contract",
    description: "24-month maintenance plan with discounted call-outs and priority support.",
    price: 0,
    isEnquiry: true,
    features: [
      "All scheduled services included",
      "Priority call-out rates",
      "Discounted parts and labour",
      "Bi-annual performance report",
    ],
  },
  {
    id: "3years",
    name: "3 year contract",
    description: "Comprehensive 36-month maintenance plan with priority support.",
    price: 0,
    isEnquiry: true,
    features: [
      "All scheduled services included",
      "Priority call-out rates",
      "Discounted parts and labour",
      "Annual performance report",
    ],
  },
];

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
    minimumFractionDigits: 2,
  })
    .format(price)
    .replace("ZAR", "R");
}

function getDescriptionPoints(description?: string): string[] {
  if (!description) return [];
  return description
    .split(/(?:\r?\n|\.\s+)/)
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, 7);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Breadcrumbs = ({ product }: { product: AirconProduct }) => (
  <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 font-sans text-sm text-[#5B5B5D]">
    <Link href="/" className="transition-colors hover:text-[#1C99D6]">
      <span>Home</span>
    </Link>
    <ChevronRight className="h-3 w-3" aria-hidden="true" />
    <Link href="/products" className="transition-colors hover:text-[#1C99D6]">
      <span>Air Conditioners</span>
    </Link>
    <ChevronRight className="h-3 w-3" aria-hidden="true" />
    <Link href="/products" className="transition-colors hover:text-[#1C99D6]">
      <span className="capitalize">{product.type.replace(/_/g, " ")}</span>
    </Link>
    <ChevronRight className="h-3 w-3" aria-hidden="true" />
    <span className="truncate">{product.name}</span>
  </nav>
);

const Gallery = ({
  images,
  activeIndex,
  onSelect,
}: {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (imageIndex: number) => void;
}) => {
  if (images.length === 0) {
    return <div className="min-h-[440px] w-full border-t border-gray-100 bg-white" />;
  }

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row">
      <div className="order-2 flex max-h-[500px] gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-y-auto">
        {images.map((img, imageIndex) => (
          <button
            key={`thumb-${imageIndex}`}
            type="button"
            onClick={() => onSelect(imageIndex)}
            aria-label={`View ${img.alt}`}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 border transition-all duration-200",
              activeIndex === imageIndex
                ? "border-[#1C99D6]"
                : "border-gray-200 opacity-60 hover:opacity-100"
            )}
          >
            <img src={img.url} alt={img.alt} className="h-full w-full object-contain p-1" />
          </button>
        ))}
      </div>

      <figure className="order-1 flex flex-1 items-center justify-center border-t border-gray-100 bg-white pb-10 pt-10 md:order-2">
        <div className="flex flex-col items-end gap-4">
          <button
            type="button"
            aria-label="Open image search preview"
            className="rounded-full bg-white/80 p-2 shadow-sm transition-all hover:bg-white"
          >
            <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </button>
          <img
            src={images[activeIndex].url}
            alt={images[activeIndex].alt}
            className="max-h-[440px] w-auto object-contain"
          />
          <figcaption className="sr-only">Selected product image: {images[activeIndex].alt}</figcaption>
        </div>
      </figure>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const stockStatus = getStockStatus(product);
  const isEnquiryOnly =
    product.is_enquiry_only ||
    (product.type === "aircon" &&
      product.btu_range !== null &&
      product.btu_range > 62000);

  const [hasInstallation, setHasInstallation] = useState(false);
  const [installationTermsAccepted, setInstallationTermsAccepted] = useState(false);
  const [showInstallationTerms, setShowInstallationTerms] = useState(false);
  const [hasInstallationKits, setHasInstallationKits] = useState(false);
  const [selectedInstallationKitId, setSelectedInstallationKitId] = useState<InstallationKit["id"]>("pipe-6-10");
  const [installationKitTermsAccepted, setInstallationKitTermsAccepted] = useState(false);
  const [showInstallationKitTerms, setShowInstallationKitTerms] = useState(false);
  const [hasMaintenance, setHasMaintenance] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<MaintenancePlan["id"]>("6months");
  const [maintenanceTermsAccepted, setMaintenanceTermsAccepted] = useState(false);
  const [showMaintenanceTerms, setShowMaintenanceTerms] = useState(false);
  const [hasProtectionPlan, setHasProtectionPlan] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const productImageUrls = useMemo(() => getProductImages(product), [product]);

  const productImages = useMemo<ProductImage[]>(
    () => productImageUrls.map((url) => ({ url, alt: product.name })),
    [productImageUrls, product.name]
  );

  const isInstallationEnquiry = useMemo(
    () => !product.btu_range || product.btu_range >= 32000,
    [product.btu_range]
  );

  const baseInstallationPrice = useMemo(() => {
    if (!product.btu_range) return 1950;
    if (product.btu_range <= 12000) return 1950;
    if (product.btu_range <= 18000) return 2350;
    if (product.btu_range <= 24000) return 2750;
    if (product.btu_range < 32000) return 2750;
    return 0;
  }, [product.btu_range]);

  const installationPrice = hasInstallation && !isInstallationEnquiry ? baseInstallationPrice : 0;

  const selectedInstallationKit = useMemo(
    () => INSTALLATION_KITS.find((kit) => kit.id === selectedInstallationKitId) ?? INSTALLATION_KITS[0],
    [selectedInstallationKitId]
  );

  const installationKitPrice = hasInstallationKits ? selectedInstallationKit.priceOffset : 0;

  const selectedMaintenance = useMemo(
    () => MAINTENANCE_PLANS.find((plan) => plan.id === selectedMaintenanceId) ?? MAINTENANCE_PLANS[1],
    [selectedMaintenanceId]
  );

  const maintenancePrice = hasMaintenance ? selectedMaintenance.price : 0;

  const baseUnitPrice = product.sale_price_zar ?? product.price_zar;
  const unitPrice = isEnquiryOnly
    ? baseUnitPrice
    : baseUnitPrice + installationPrice + installationKitPrice + maintenancePrice + (hasProtectionPlan ? PROTECTION_PLAN_PRICE : 0);
  const orderTotal = unitPrice * quantity;

  const priceBreakdown: PriceLine[] = isEnquiryOnly
    ? []
    : [
        { id: "unit", label: `${product.name} unit`, amount: baseUnitPrice },
        { id: "installation", label: "Installation", amount: installationPrice, isEnquiry: isInstallationEnquiry && hasInstallation },
        { id: "installation-kit", label: "Installation kit", amount: installationKitPrice },
        { id: "maintenance", label: "Maintenance", amount: maintenancePrice, isEnquiry: selectedMaintenance.isEnquiry && hasMaintenance },
        {
          id: "protection",
          label: "Warranty",
          amount: hasProtectionPlan ? PROTECTION_PLAN_PRICE : 0,
        },
      ];

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (stockStatus === "sold_out") return;
    addItem({
      id: `${product.id}-${hasInstallation ? "install" : "noinstall"}-${hasInstallationKits ? selectedInstallationKitId : "nokit"}-${hasMaintenance ? selectedMaintenanceId : "nomaintenance"}-${hasProtectionPlan ? "pp" : "no-pp"}`,
      name: `${product.name} (${hasInstallation ? "Installation" : "No installation"}${hasInstallationKits ? ` + ${selectedInstallationKit.name}` : ""}${hasMaintenance ? ` + ${selectedMaintenance.name}` : ""}${hasProtectionPlan ? " + Protection Plan" : ""})`,
      slug: product.slug,
      price_zar: unitPrice,
      sale_price_zar: undefined,
      images: productImageUrls,
      type: product.type,
      is_enquiry_only: product.is_enquiry_only,
    });
    toast.success(`${product.name} added to cart`);
  };

  const roomCoverage = getRoomCoverage(product.btu_range);
  const descriptionPoints = getDescriptionPoints(product.description);

  return (
    <div className="min-h-screen bg-white font-sans text-[#404040]">
      <main className="mx-auto max-w-[1320px] px-4 pb-8 pt-20 md:pb-12 md:pt-28 lg:px-8">
        <Breadcrumbs product={product} />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:sticky lg:top-28 lg:col-span-6 xl:col-span-7 lg:self-start">
            <Gallery images={productImages} activeIndex={activeImage} onSelect={setActiveImage} />
          </div>

          <section className="flex flex-col lg:sticky lg:top-28 lg:col-span-6 xl:col-span-5 lg:self-start" aria-labelledby="product-title">
            <h1
              id="product-title"
              className="mb-6 text-3xl font-medium leading-tight tracking-wide text-[#58585A] md:text-[34px]"
            >
              {product.name}
            </h1>

            <div className="mb-6">
              <span className="mb-1 block text-sm text-gray-500">Cost of unit</span>
              <strong className="logo-text text-[26px] font-semibold text-[#1C99D6]">
                {isEnquiryOnly ? "Commercial" : formatPrice(baseUnitPrice)}
              </strong>
            </div>

            {descriptionPoints.length > 0 && (
              <div className="mb-6 space-y-3">
                <h2 className="border-b border-black pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                  Description
                </h2>
                <ul className="space-y-2.5">
                  {descriptionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-[16px] leading-relaxed text-[#717172]">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-10 space-y-8">
              <div className="space-y-3">
                <label className="block font-medium text-[#58585A]">Size available</label>
                <div className="flex flex-wrap gap-2">
                  {product.available_btu_sizes && product.available_btu_sizes.length > 0 ? (
                    product.available_btu_sizes.map((btu) => {
                      const isActive = product.btu_range === btu;
                      return (
                        <button
                          key={btu}
                          type="button"
                          disabled={!isActive}
                          title={isActive ? "Selected size" : `Available in ${product.btu_range?.toLocaleString()} BTU only`}
                          className={cn(
                            "border-2 px-3 py-2 text-sm font-bold transition-all",
                            isActive
                              ? "border-[#1C99D6] bg-white text-black"
                              : "border-gray-300 bg-white text-[#58585A] opacity-50 cursor-not-allowed"
                          )}
                        >
                          {btu.toLocaleString()} BTU
                        </button>
                      );
                    })
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="border-2 border-[#1C99D6] bg-white px-3 py-2 text-sm font-bold text-black opacity-50 cursor-not-allowed"
                    >
                      {product.btu_range ? `${product.btu_range.toLocaleString()} BTU` : "N/A"}
                    </button>
                  )}
                </div>
                {roomCoverage && <p className="text-sm text-[#717172]">{roomCoverage}</p>}
              </div>

              {!isEnquiryOnly && (
                <>
                  <div className="border-b border-gray-200 pb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                      Add ons
                    </h2>
                    <p className="mt-1 text-xs text-[#717172]">
                      Optional extras you can add to your unit before checkout.
                    </p>
                  </div>

                  <section aria-labelledby="installation-title" className="space-y-4">
                    <div className="space-y-1">
                      <h2 id="installation-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                        Installation
                      </h2>
                    </div>

                    <div className="flex w-full flex-col border border-gray-300 sm:max-w-xs sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setHasInstallation(false);
                          setInstallationTermsAccepted(false);
                          setHasInstallationKits(false);
                          setInstallationKitTermsAccepted(false);
                        }}
                        aria-pressed={!hasInstallation}
                        className={cn(
                          "w-full px-4 py-3 text-sm font-medium transition-all sm:flex-1",
                          !hasInstallation
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50 sm:border-l-0"
                        )}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInstallationTerms(true)}
                        aria-pressed={hasInstallation}
                        className={cn(
                          "w-full border-t border-gray-300 px-4 py-3 text-sm font-medium transition-all sm:flex-1 sm:border-l sm:border-t-0",
                          hasInstallation
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50"
                        )}
                      >
                        Yes
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-[#717172]">
                      {hasInstallation
                        ? "Core installation with up to 3m piping, bracket and commissioning included."
                        : "Select installation to add professional fitment to your order."}
                    </p>

                    <Dialog open={showInstallationTerms} onOpenChange={setShowInstallationTerms}>
                      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-[#58585A]">
                            Installation Terms & Conditions
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Please read and accept the installation terms and conditions before proceeding.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-sm leading-relaxed text-[#404040]">
                          <p className="text-sm sm:text-base">
                            Please take note of the installation costs and exclusions. It is your responsibility to read
                            and understand the terms before proceeding.
                          </p>

                          <p>
                            The cost of the back-to-back aircon installation with available plug point is R1,950.00
                            (incl. VAT) for 9000btu and 12000btu units, R2,350.00 for 18000btu units, and R2,750.00 for
                            24000btu units. Units from 32000btu upwards are priced on request.
                          </p>

                          <p className="font-semibold">The cost of this installation includes the following:</p>
                          <ul className="list-disc space-y-1 pl-5">
                            <li>Up to 3 metres of refrigerant piping, drain pipe and cable</li>
                            <li>Outdoor mounting bracket (if required)</li>
                            <li>Installation to a maximum height of 3 metres above ground level</li>
                            <li>Drilling of one hole for piping</li>
                            <li>Holes will be filled but not painted</li>
                          </ul>

                          <p className="font-semibold">
                            The installer will quote for all costs in addition to the 3 metre back-to-back
                            installation which will include but are not limited to the following:
                          </p>
                          <ul className="list-disc space-y-1 pl-5">
                            <li>
                              Any required piping and cabling in addition to the piping and cabling referred to above,
                              or electrical connection to the main switchboard
                            </li>
                            <li>
                              Travelling expenses in the event of the installation being out of a 30km radius from
                              where the unit was bought
                            </li>
                            <li>
                              Any other extras, including but not limited to:
                              <ul className="list-disc space-y-1 pl-5 pt-1">
                                <li>external isolators and additional electrical work required</li>
                                <li>any additional refrigerant piping, insulation, drain pipe and cable</li>
                                <li>trunking to cover piping</li>
                              </ul>
                            </li>
                          </ul>

                          <p>
                            <strong>Please note</strong> costs of isolators are not included in the installation fee.
                            Isolator switches are a regulation requirement and are not included in the cost of the
                            installation. A qualified electrician must install an isolator at your own cost. He must
                            install the isolator not more than 2 metres from the condenser and within view of the
                            condenser. The cost of this is in addition to the installation cost of the unit and must be
                            paid directly to the electrician. Indoor and outdoor units must always be earthed. You can
                            expect to pay anything between R1000-R1500 in addition to your basic installation fee for
                            this. This regulation is governed by the South African National Standards (SANS) 10142-1.
                          </p>

                          <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                            <Checkbox
                              id="terms-accepted"
                              checked={installationTermsAccepted}
                              onCheckedChange={(checked) => setInstallationTermsAccepted(checked === true)}
                            />
                            <label htmlFor="terms-accepted" className="cursor-pointer text-sm font-medium">
                              I acknowledge that I have read and accept these terms and conditions
                            </label>
                          </div>

                          <p className="text-xs text-[#717172]">
                            Aircons Store shall not be held liable for any consequences arising from your failure to
                            read, understand, or comply with these Terms and Conditions.
                          </p>
                        </div>

                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => setShowInstallationTerms(false)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!installationTermsAccepted}
                            onClick={() => {
                              setHasInstallation(true);
                              setShowInstallationTerms(false);
                            }}
                            className="w-full bg-[#1C99D6] text-white hover:bg-[#1597c6] sm:w-auto disabled:bg-gray-200"
                          >
                            Proceed
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </section>

                  <section aria-labelledby="installation-kit-title" className="space-y-4">
                    <div className="space-y-1">
                      <h2 id="installation-kit-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                        Installation kits
                      </h2>
                    </div>

                    <div className="flex w-full flex-col border border-gray-300 sm:max-w-xs sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setHasInstallationKits(false);
                          setInstallationKitTermsAccepted(false);
                        }}
                        aria-pressed={!hasInstallationKits}
                        className={cn(
                          "w-full px-4 py-3 text-sm font-medium transition-all sm:flex-1",
                          !hasInstallationKits
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50 sm:border-l-0"
                        )}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInstallationKitTerms(true)}
                        aria-pressed={hasInstallationKits}
                        className={cn(
                          "w-full border-t border-gray-300 px-4 py-3 text-sm font-medium transition-all sm:flex-1 sm:border-l sm:border-t-0",
                          hasInstallationKits
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50"
                        )}
                      >
                        Yes
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-[#717172]">
                      {hasInstallationKits
                        ? `${selectedInstallationKit.name} — ${selectedInstallationKit.description}`
                        : "Add extra brackets, drain pipes, trunking and copper piping for longer pipe runs."}
                    </p>

                    <Dialog open={showInstallationKitTerms} onOpenChange={setShowInstallationKitTerms}>
                      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-[#58585A]">
                            Installation Kit Options
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Select an installation kit and accept the terms.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-sm leading-relaxed text-[#404040]">
                          <p className="text-sm sm:text-base">
                            Installation kits provide the extra materials needed when the indoor and outdoor units
                            are further apart than the standard 3 metre back-to-back setup.
                          </p>

                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-[#58585A]">Select installation kit</label>
                            <Select value={selectedInstallationKitId} onValueChange={(value) => setSelectedInstallationKitId(value as InstallationKit["id"])}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a kit" />
                              </SelectTrigger>
                              <SelectContent>
                                {INSTALLATION_KITS.map((kit) => (
                                  <SelectItem key={kit.id} value={kit.id}>
                                    {kit.name} — {formatPrice(kit.priceOffset)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="border border-gray-200 bg-[#F9F9F9] p-4">
                              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-semibold text-[#58585A]">{selectedInstallationKit.name}</span>
                                <span className="font-semibold text-[#1C99D6]">
                                  {formatPrice(selectedInstallationKit.priceOffset)}
                                </span>
                              </div>
                              <p className="mb-3 text-[#717172]">{selectedInstallationKit.description}</p>
                              <ul className="grid gap-1 text-[#717172] sm:grid-cols-2">
                                {selectedInstallationKit.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                            <Checkbox
                              id="installation-kit-terms-accepted"
                              checked={installationKitTermsAccepted}
                              onCheckedChange={(checked) => setInstallationKitTermsAccepted(checked === true)}
                            />
                            <label htmlFor="installation-kit-terms-accepted" className="cursor-pointer text-sm font-medium">
                              I acknowledge that I have read and accept the installation kit terms
                            </label>
                          </div>

                          <p className="text-xs text-[#717172]">
                            Aircons Store shall not be held liable for any consequences arising from your failure to
                            read, understand, or comply with these Terms and Conditions.
                          </p>
                        </div>

                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => setShowInstallationKitTerms(false)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!installationKitTermsAccepted}
                            onClick={() => {
                              setHasInstallationKits(true);
                              setShowInstallationKitTerms(false);
                            }}
                            className="w-full bg-[#1C99D6] text-white hover:bg-[#1597c6] sm:w-auto disabled:bg-gray-200"
                          >
                            Proceed
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </section>

                  <section aria-labelledby="maintenance-title" className="space-y-4">
                    <div className="space-y-1">
                      <h2 id="maintenance-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                        Maintenance Package
                      </h2>
                    </div>

                    <div className="flex w-full flex-col border border-gray-300 sm:max-w-xs sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setHasMaintenance(false);
                          setMaintenanceTermsAccepted(false);
                        }}
                        aria-pressed={!hasMaintenance}
                        className={cn(
                          "w-full px-4 py-3 text-sm font-medium transition-all sm:flex-1",
                          !hasMaintenance
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50 sm:border-l-0"
                        )}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMaintenanceTerms(true)}
                        aria-pressed={hasMaintenance}
                        className={cn(
                          "w-full border-t border-gray-300 px-4 py-3 text-sm font-medium transition-all sm:flex-1 sm:border-l sm:border-t-0",
                          hasMaintenance
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50"
                        )}
                      >
                        Yes
                      </button>
                    </div>

                    {hasMaintenance && (
                      <p className="text-sm leading-relaxed text-[#717172]">
                        {selectedMaintenance.name} — {selectedMaintenance.description}
                      </p>
                    )}

                    <Dialog open={showMaintenanceTerms} onOpenChange={setShowMaintenanceTerms}>
                      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-[#58585A]">
                            Maintenance Package Terms
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Select a maintenance plan and accept the terms to add it to your order.
                          </DialogDescription>
                        </DialogHeader>

                          <div className="space-y-4 text-sm leading-relaxed text-[#404040]">
                          <p className="text-sm sm:text-base">
                            Regular maintenance extends unit life, cuts energy costs, and protects your warranty.
                            Please select the plan that suits you.
                          </p>

                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-[#58585A]">Select maintenance plan</label>
                            <Select value={selectedMaintenanceId} onValueChange={(value) => setSelectedMaintenanceId(value as MaintenancePlan["id"])}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {MAINTENANCE_PLANS.map((plan) => (
                                  <SelectItem key={plan.id} value={plan.id}>
                                    {plan.name} — {plan.isEnquiry ? "Price on request" : formatPrice(plan.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="border border-gray-200 bg-[#F9F9F9] p-4">
                              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-semibold text-[#58585A]">{selectedMaintenance.name}</span>
                                <span className="font-semibold text-[#1C99D6]">
                                  {selectedMaintenance.isEnquiry ? "Price on request" : formatPrice(selectedMaintenance.price)}
                                </span>
                              </div>
                              <p className="mb-3 text-[#717172]">{selectedMaintenance.description}</p>
                              <ul className="grid gap-1 text-[#717172] sm:grid-cols-2">
                                {selectedMaintenance.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-[#1C99D6]" aria-hidden="true" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 border-t border-gray-200 pt-4">
                            <Checkbox
                              id="maintenance-terms-accepted"
                              checked={maintenanceTermsAccepted}
                              onCheckedChange={(checked) => setMaintenanceTermsAccepted(checked === true)}
                            />
                            <label htmlFor="maintenance-terms-accepted" className="cursor-pointer text-sm font-medium">
                              I acknowledge that I have read and accept the maintenance package terms
                            </label>
                          </div>

                          <p className="text-xs text-[#717172]">
                            Aircons Store shall not be held liable for any consequences arising from your failure to
                            service your unit as recommended by the manufacturer.
                          </p>
                        </div>

                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            onClick={() => setShowMaintenanceTerms(false)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!maintenanceTermsAccepted}
                            onClick={() => {
                              setHasMaintenance(true);
                              setShowMaintenanceTerms(false);
                            }}
                            className="w-full bg-[#1C99D6] text-white hover:bg-[#1597c6] sm:w-auto disabled:bg-gray-200"
                          >
                            Proceed
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </section>

                  <section aria-labelledby="protection-plan-title" className="space-y-4">
                    <div className="space-y-1">
                      <h2 id="protection-plan-title" className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                        Warranty
                      </h2>
                    </div>

                    <div className="flex w-full flex-col border border-gray-300 sm:max-w-xs sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setHasProtectionPlan(false)}
                        aria-pressed={!hasProtectionPlan}
                        className={cn(
                          "w-full px-4 py-3 text-sm font-medium transition-all sm:flex-1",
                          !hasProtectionPlan
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50 sm:border-l-0"
                        )}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasProtectionPlan(true)}
                        aria-pressed={hasProtectionPlan}
                        className={cn(
                          "w-full border-t border-gray-300 px-4 py-3 text-sm font-medium transition-all sm:flex-1 sm:border-l sm:border-t-0",
                          hasProtectionPlan
                            ? "bg-[#1C99D6] text-white"
                            : "bg-white text-[#58585A] hover:bg-gray-50"
                        )}
                      >
                        Yes
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-[#717172]">
                      Add one extra year of warranty cover and a scheduled annual clean, inspection and performance
                      tune.
                    </p>
                  </section>

                  <section aria-labelledby="price-breakdown-title" className="space-y-3 border-y border-gray-200 py-5">
                    <h2
                      id="price-breakdown-title"
                      className="text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]"
                    >
                      Service breakdown
                    </h2>
                    <dl className="space-y-2 text-sm">
                      {priceBreakdown.map((line) => (
                        <div key={line.id} className="flex items-center justify-between gap-4">
                          <dt className="text-[#717172]">{line.label}</dt>
                          <dd
                            className={cn(
                              "font-medium",
                              line.amount === 0 ? "text-[#717172]" : "text-[#404040]"
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
                      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3">
                        <dt className="font-medium text-[#58585A]">Unit subtotal</dt>
                        <dd className="font-semibold text-[#58585A]">{formatPrice(baseUnitPrice)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[#717172]">Quantity</dt>
                        <dd className="font-medium text-[#404040]">{quantity}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-base">
                        <dt className="font-semibold text-[#58585A]">Order total</dt>
                        <dd className="text-xl font-bold text-[#1C99D6]">{formatPrice(orderTotal)}</dd>
                      </div>
                      {quantity > 1 && (hasInstallation || hasInstallationKits || hasMaintenance || hasProtectionPlan) && (
                        <p className="text-xs text-[#717172]">
                          Add-on prices are charged per unit.
                        </p>
                      )}
                    </dl>
                  </section>
                </>
              )}

              <div className="mb-6">
                <p className="flex items-center gap-2 font-medium text-[#0F834D]">
                  <span className="h-2 w-2 rounded-full bg-[#0F834D]" aria-hidden="true" />
                  <span>
                    {stockStatus === "sold_out"
                      ? "Out of stock"
                      : stockStatus === "low_stock"
                      ? "Low stock"
                      : "In stock"}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-4 border-b border-gray-200 pb-10 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex h-[42px] items-center border border-gray-300" aria-label="Quantity selector">
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

                {isEnquiryOnly ? (
                  <Button
                    asChild
                    className="h-[42px] w-full bg-[#1E3A5F] px-8 font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#152d4a] sm:w-auto sm:flex-1"
                  >
                    <Link href="/enquire">Request Quote</Link>
                  </Button>
                ) : stockStatus === "sold_out" ? (
                  <Button
                    disabled
                    className="h-[42px] w-full bg-gray-200 px-8 font-medium uppercase tracking-wider text-gray-400 sm:w-auto sm:flex-1"
                  >
                    Sold Out
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex h-[42px] w-full items-center justify-center gap-2 bg-[#1C99D6] px-8 font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#1597c6] sm:w-auto sm:flex-1"
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    <span>Add to basket</span>
                  </button>
                )}
              </div>
            </div>

            <section className="mt-10" aria-label="Product information">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#58585A]">
                Product description
              </h2>
              <div className="w-full border border-gray-200">
                {[
                  {
                    id: "description",
                    title: "Description",
                    content: (
                      <div className="space-y-4 text-sm leading-relaxed text-[#717172]">
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
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">Brand</dt>
                            <dd className="text-[#404040]">{product.brand ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">Type</dt>
                            <dd className="capitalize text-[#404040]">{product.type.replace(/_/g, " ")}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">BTU</dt>
                            <dd className="text-[#404040]">{product.btu_range?.toLocaleString() ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">Room coverage</dt>
                            <dd className="text-[#404040]">{roomCoverage ?? "—"}</dd>
                          </div>
                        </dl>
                      </div>
                    ),
                  },
                  {
                    id: "specifications",
                    title: "Specifications",
                    content: (
                      <div className="space-y-4 text-sm">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">Model code</dt>
                            <dd className="text-[#404040]">{product.name}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">Unit description</dt>
                            <dd className="capitalize text-[#404040]">{product.type.replace(/_/g, " ")}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">BTU rating</dt>
                            <dd className="text-[#404040]">{product.btu_range?.toLocaleString() ?? "—"}</dd>
                          </div>
                          {product.specs &&
                            Object.entries(product.specs).map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-xs font-medium uppercase tracking-wide text-[#717172]">{key}</dt>
                                <dd className="text-[#404040]">{value}</dd>
                              </div>
                            ))}
                        </dl>
                        {!product.specs && (
                          <p className="text-[#717172]">No additional specifications available.</p>
                        )}
                      </div>
                    ),
                  },
                  {
                    id: "installation-warranty",
                    title: "Installation & Warranty",
                    content: (
                      <div className="space-y-3 text-sm leading-relaxed text-[#717172]">
                        <p>
                          Professional back-to-back installation includes up to 3m piping, outdoor
                          mounting bracket and commissioning. Extended pipe runs, electrical
                          isolators and trunking are quoted on-site.
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Manufacturer warranty included</li>
                          <li>Optional extended protection plan</li>
                          <li>Installation available in selected areas</li>
                          <li>Inverter technology for efficient cooling and heating</li>
                        </ul>
                      </div>
                    ),
                  },
                ].map((section) => {
                  const isOpen = openInfo === section.id;
                  return (
                    <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpenInfo(isOpen ? null : section.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-stretch text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="flex min-h-[52px] flex-1 items-center px-4 py-4 text-sm font-medium text-black sm:min-h-[64px] sm:px-5">
                          {section.title}
                        </span>
                        <span className="flex w-12 items-center justify-center border-l border-gray-200 text-[#1C99D6] sm:w-16">
                          {isOpen ? (
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="px-5 pb-5">{section.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
