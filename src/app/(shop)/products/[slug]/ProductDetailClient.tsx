"use client";

import {
  Minus,
  Plus,
  Shield,
  Thermometer,
  Wind,
  Wifi,
  Zap,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Star,
  ChevronRight,
} from "lucide-react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AirconProductCard } from "@/components/shop/ProductCard";
import { mockProducts } from "@/lib/mock-data";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatZAR(amount: number): string {
  return "R " + amount.toLocaleString("en-ZA");
}

function getStockStatus(product: AirconProduct) {
  if (product.stock.is_sold_out) return "sold_out";
  if (product.stock.stock_count <= product.stock.low_stock_threshold)
    return "low_stock";
  return "in_stock";
}

const SPEC_ICONS: Record<string, React.ReactNode> = {
  inverter: <Zap className="h-4 w-4" />,
  wifi_enabled: <Wifi className="h-4 w-4" />,
  coverage_m2: <Wind className="h-4 w-4" />,
  noise_db: <Wind className="h-4 w-4" />,
  eer: <Thermometer className="h-4 w-4" />,
  heat_pump: <Thermometer className="h-4 w-4" />,
};

const SPEC_LABELS: Record<string, string> = {
  inverter: "Inverter",
  wifi_enabled: "WiFi Enabled",
  coverage_m2: "Coverage Area",
  noise_db_indoor: "Noise Level (Indoor)",
  noise_db_outdoor: "Noise Level (Outdoor)",
  eer: "EER Rating",
  seer: "SEER Rating",
  heat_pump: "Heat Pump",
  r32_refrigerant: "R32 Refrigerant",
  colour: "Colour",
  pipe_connection: "Pipe Connection",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const stockStatus = getStockStatus(product);
  const hasSale =
    product.sale_price_zar !== null &&
    product.sale_price_zar < product.price_zar;

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("default");

  // Build images array — use placeholder if no images
  const images =
    product.images.length > 0
      ? product.images.map((src) => ({
          src,
          thumbnail: src,
          srcset: src,
          alt: product.name,
          width: 800,
          height: 1000,
          sizes: "100vw",
        }))
      : [
          {
            src: "/placeholder.jpg",
            thumbnail: "/placeholder.jpg",
            srcset: "/placeholder.jpg",
            alt: product.name,
            width: 800,
            height: 1000,
            sizes: "100vw",
          },
        ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_zar: product.price_zar,
      sale_price_zar: product.sale_price_zar ?? undefined,
      images: product.images,
      type: product.type,
      is_enquiry_only: product.is_enquiry_only,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/cart";
  };

  return (
    <header className="px-[5%] py-12 md:py-14 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-8 md:gap-y-10 lg:grid-cols-[1fr_1.25fr_1fr] lg:items-center lg:gap-x-16">

          {/* LEFT COLUMN — Info */}
          <div>
            {/* Breadcrumb */}
            <nav className="mb-6 flex flex-wrap items-center text-sm">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li className="inline-flex items-center gap-1.5">
                  <Link href="/" className="hover:text-[#1C99D6]">Shop all</Link>
                </li>
                <li className="text-muted-foreground">
                  <ChevronRight className="size-4" />
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Link href="/products" className="hover:text-[#1C99D6]">
                    {product.type.replace(/_/g, " ")}
                  </Link>
                </li>
                <li className="text-muted-foreground">
                  <ChevronRight className="size-4" />
                </li>
                <li className="inline-flex items-center gap-1.5 text-[#1E3A5F]">
                  {product.name}
                </li>
              </ol>
            </nav>

            <div>
              <h1 className="mb-5 text-4xl font-bold leading-[1.2] md:mb-6 md:text-5xl lg:text-6xl text-[#1E3A5F]">
                {product.name}
              </h1>

              {/* Price + Rating */}
              <div className="mb-5 flex flex-col flex-wrap sm:flex-row md:mb-6">
                <p className="text-xl font-bold md:text-2xl text-[#1C99D6]">
                  {product.is_enquiry_only ? "Price on request" : formatZAR(product.sale_price_zar || product.price_zar)}
                </p>
                <div className="mx-4 hidden w-px self-stretch bg-gray-200 sm:block"></div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">(4.0 stars) • 12 reviews</p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details">
                <TabsList className="mb-5 flex-wrap items-center gap-6 md:mb-6 border-0 border-b-[1.5px] border-gray-200">
                  <TabsTrigger
                    value="details"
                    className="border-0 border-b-[1.5px] border-transparent px-0 py-2 data-[state=active]:border-[#1C99D6] data-[state=active]:bg-transparent data-[state=active]:text-[#1E3A5F]"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="shipping"
                    className="border-0 border-b-[1.5px] border-transparent px-0 py-2 data-[state=active]:border-[#1C99D6] data-[state=active]:bg-transparent data-[state=active]:text-[#1E3A5F]"
                  >
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger
                    value="returns"
                    className="border-0 border-b-[1.5px] border-transparent px-0 py-2 data-[state=active]:border-[#1C99D6] data-[state=active]:bg-transparent data-[state=active]:text-[#1E3A5F]"
                  >
                    Returns
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <p className="text-muted-foreground">
                    {product.description || "Premium air conditioning solution for your space. Features advanced inverter technology for efficient cooling and heating."}
                  </p>
                </TabsContent>
                <TabsContent value="shipping">
                  <p className="text-muted-foreground">
                    We deliver to Cape Town Metro. National shipping available on units. Installation is scheduled after payment — our team will contact you to book a date and time slot.
                  </p>
                </TabsContent>
                <TabsContent value="returns">
                  <p className="text-muted-foreground">
                    All units come with manufacturer warranty. Extended warranty plans available at checkout. Contact us within 7 days of delivery for any issues.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* MIDDLE COLUMN — Images */}
          <div className="order-first lg:order-none">
            <ProductImages images={images} galleryID={`gallery-${product.id}`} />
          </div>

          {/* RIGHT COLUMN — Form */}
          <div>
            <form className="mb-4">
              <div className="grid grid-cols-1 gap-6">
                {/* Variant selection */}
                <div className="flex flex-col">
                  <Label className="mb-2">Variant</Label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: "default", label: "Standard" },
                      { id: "pro", label: "Pro" },
                      { id: "plus", label: "Plus", disabled: true },
                    ].map((variant) => (
                      <Button
                        key={variant.id}
                        type="button"
                        variant={selectedVariant === variant.id ? "default" : "outline"}
                        className={cn(
                          "px-4 py-2",
                          selectedVariant === variant.id
                            ? "bg-[#1C99D6] text-white border-[#1C99D6]"
                            : "bg-white text-[#1E3A5F] border-gray-300",
                          variant.disabled && "pointer-events-none opacity-25"
                        )}
                        onClick={() => !variant.disabled && setSelectedVariant(variant.id)}
                        disabled={variant.disabled}
                      >
                        {variant.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Select + Quantity */}
                <div className="grid grid-cols-[1fr_4rem] gap-x-4">
                  <div className="flex flex-col">
                    <Label className="mb-2">BTU Capacity</Label>
                    <select
                      className="flex min-h-11 w-full items-center justify-between gap-1 whitespace-nowrap border border-gray-300 bg-transparent px-3 py-2 text-[#1E3A5F] focus:outline-none focus:border-[#1C99D6]"
                      defaultValue="default"
                    >
                      <option value="default">Select</option>
                      <option value="9000">9000 BTU</option>
                      <option value="12000">12000 BTU</option>
                      <option value="18000">18000 BTU</option>
                      <option value="24000">24000 BTU</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="quantity" className="mb-2">Qty</Label>
                    <Input
                      type="number"
                      id="quantity"
                      placeholder="1"
                      className="w-16"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mb-4 mt-8 flex flex-col gap-y-4">
                {product.is_enquiry_only ? (
                  <Button
                    asChild
                    className="w-full border border-gray-300 bg-[#1E3A5F] text-white px-6 py-3"
                  >
                    <Link href="/enquire">Request Quote</Link>
                  </Button>
                ) : stockStatus === "sold_out" ? (
                  <Button
                    disabled
                    className="w-full border border-gray-300 bg-gray-200 text-gray-400 px-6 py-3"
                  >
                    Sold Out
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full border border-gray-300 bg-[#1C99D6] text-white px-6 py-3"
                      onClick={handleAddToCart}
                    >
                      Add to cart
                    </Button>
                    <Button
                      className="w-full border border-gray-300 bg-white text-[#1E3A5F] px-6 py-3"
                      onClick={handleBuyNow}
                    >
                      Buy now
                    </Button>
                  </>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Free shipping over R5,000
              </p>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Product Images (Relume-style) ─────────────────────────────────────────────

interface ProductImagesProps {
  images: Array<{
    srcset: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    sizes: string;
    thumbnail: string;
  }>;
  galleryID: string;
}

const ProductImages = ({ images, galleryID }: ProductImagesProps) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: "#" + galleryID,
      children: "a",
      bgOpacity: 1,
      wheelToZoom: true,
      pswpModule: () => import("photoswipe"),
    });
    lightbox.init();
    lightboxRef.current = lightbox;
    return () => lightbox.destroy();
  }, [galleryID]);

  useEffect(() => {
    if (!mainApi || !thumbApi) {
      return;
    }
    mainApi.on("select", () => {
      const index = mainApi.selectedScrollSnap();
      setCurrent(index);
      thumbApi.scrollTo(index);
    });
  }, [mainApi, thumbApi]);

  return (
    <div className="flex flex-col gap-y-4">
      {/* Main image carousel */}
      <div className="overflow-hidden">
        <Carousel
          setApi={setMainApi}
          opts={{
            loop: true,
            align: "start",
          }}
          className="m-0"
        >
          <CarouselContent className="m-0">
            {images.map((img, index) => (
              <CarouselItem key={index} className="basis-full pl-0">
                <div className="pswp-gallery" id={galleryID}>
                  <a
                    href={img.src}
                    data-pswp-width={img.width}
                    data-pswp-height={img.height}
                    data-pswp-srcset={img.srcset}
                    target="_blank"
                    rel="noreferrer"
                    data-cropped="true"
                    className="hover:cursor-zoom-in"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="aspect-square size-full object-cover"
                    />
                  </a>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Thumbnail strip — desktop only */}
      <div className="hidden overflow-y-auto lg:block">
        <Carousel
          setApi={setThumbApi}
          opts={{
            align: "start",
            containScroll: "keepSnaps",
            dragFree: true,
          }}
          className="m-0"
        >
          <CarouselContent className="gap-y-4">
            {images.map((img, index) => (
              <CarouselItem key={index} className="basis-1/5">
                <button
                  onClick={() => mainApi?.scrollTo(index)}
                  className={cn("block", current === index && "opacity-60")}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="aspect-square size-full object-cover"
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
