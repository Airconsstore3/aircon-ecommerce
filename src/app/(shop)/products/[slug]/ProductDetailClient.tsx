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
import { cn } from "@/lib/utils";
import { AirconProductCard } from "@/components/shop/ProductCard";
import { mockProducts } from "@/lib/mock-data";
import { useCart } from "@/components/shop/CartProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AirconProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  btu_size: string | null;
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

  const [checkedAddons, setCheckedAddons] = useState<string[]>([]);
  const basePrice = product.is_enquiry_only ? 0 : (product.sale_price_zar || product.price_zar);
  const addonTotal = checkedAddons.reduce((sum, id) => {
    const prices: Record<string, number> = { install: 1800, pipe: 850, warranty: 1500 };
    return sum + (prices[id] || 0);
  }, 0);

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

  const showWarrantyUpsell =
    product.type === "residential_unit" ||
    product.type === "commercial_unit" ||
    product.type === "bundle";

  return (
    <section className="py-8">
      <div className="w-full px-4 sm:px-20">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-[#1E3A5F]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#1E3A5F]">Products</Link>
          <span>/</span>
          <span className="text-[#1E3A5F] font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

          {/* LEFT — Images */}
          <div className="top-8 self-start lg:sticky">
            <ProductImages images={images} galleryID={`gallery-${product.id}`} />
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-5">

            {/* Brand + name */}
            {product.brand && (
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                {product.brand}
              </p>
            )}
            <h1 className="text-3xl font-normal text-[#1E3A5F] leading-tight lg:text-4xl">
              {product.name}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.btu_size && (
                <Badge variant="secondary">{product.btu_size}</Badge>
              )}
              <Badge variant="secondary">{product.type.replace(/_/g, " ")}</Badge>
              {product.is_enquiry_only && (
                <Badge className="bg-[#1E3A5F] text-white">Quote Only</Badge>
              )}
            </div>

            {/* Price */}
            <div>
              {product.is_enquiry_only ? (
                <div>
                  <p className="text-lg font-semibold text-[#1E3A5F]">
                    Price on request
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We confirm the final price after a site survey
                  </p>
                </div>
              ) : hasSale ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-[#1C99D6]">
                    {formatZAR(product.sale_price_zar!)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatZAR(product.price_zar)}
                  </span>
                  <Badge className="bg-[#1C99D6] text-white">SALE</Badge>
                </div>
              ) : (
                <span className="text-3xl font-bold text-[#1C99D6]">
                  {formatZAR(product.price_zar)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div>
              {stockStatus === "in_stock" && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" /> In Stock
                </span>
              )}
              {stockStatus === "low_stock" && (
                <span className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  Low Stock — only {product.stock.stock_count} left
                </span>
              )}
              {stockStatus === "sold_out" && (
                <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" /> Sold Out
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Specs table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h2 className="text-base font-normal text-[#1E3A5F] mb-3">
                  Specifications
                </h2>
                <dl className="divide-y border rounded-lg overflow-hidden">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-4 py-3 bg-white even:bg-gray-50"
                    >
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        {SPEC_ICONS[key] ?? <Wind className="h-4 w-4" />}
                        {SPEC_LABELS[key] ?? key}
                      </dt>
                      <dd className="text-sm font-medium text-[#1E3A5F]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 pt-2">
              {product.is_enquiry_only ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-[#1E3A5F] hover:bg-[#16304f] text-white"
                >
                  <Link href="/enquire">Request Commercial Quote</Link>
                </Button>
              ) : stockStatus === "sold_out" ? (
                <Button
                  size="lg"
                  disabled
                  className="w-full rounded-full bg-gray-200 text-gray-400 cursor-not-allowed"
                >
                  Sold Out
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-[#1C99D6] hover:bg-[#1680b0] text-white"
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price_zar: product.price_zar,
                      sale_price_zar: product.sale_price_zar ?? undefined,
                      images: product.images,
                      type: product.type,
                      is_enquiry_only: product.is_enquiry_only,
                    })}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6] hover:text-white"
                  >
                    <Link href="/enquire">Get Quote</Link>
                  </Button>
                </>
              )}

              {/* WhatsApp button */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <a
                  href="https://wa.me/27000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask on WhatsApp
                </a>
              </Button>
            </div>

            {/* Installation Add-ons */}
            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-sm font-normal text-[#1E3A5F]">Complete your installation</h3>

              {[
                { id: "install", name: "Standard Installation", price: 1800, desc: "Professional installation by licensed technicians" },
                { id: "pipe", name: "5m Copper Pipe Kit", price: 850, desc: "Includes refrigerant line set and insulation" },
                { id: "warranty", name: "2-Year Extended Warranty", price: 1500, desc: "Parts and labour coverage beyond manufacturer warranty" },
              ].map((addon) => (
                <label
                  key={addon.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-colors",
                    checkedAddons.includes(addon.id)
                      ? "border-[#1C99D6] bg-[#1C99D6]/5"
                      : "border-transparent hover:bg-gray-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checkedAddons.includes(addon.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckedAddons([...checkedAddons, addon.id]);
                      } else {
                        setCheckedAddons(checkedAddons.filter((id) => id !== addon.id));
                      }
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1E3A5F]">{addon.name}</span>
                      <span className="text-sm font-semibold text-[#1C99D6]">R {addon.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{addon.desc}</p>
                  </div>
                </label>
              ))}

              {/* Running total */}
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold text-[#1E3A5F]">
                  Estimated quote: R {(basePrice + addonTotal).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Final price confirmed after site survey
                </p>
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "Free site survey",
                "Licensed technicians",
                "PayFast secured",
                "Cape Town based",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Shield className="h-3.5 w-3.5 text-[#1C99D6] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Accordion — FAQ */}
            <Accordion type="multiple" className="w-full border-t mt-2">
              <AccordionItem value="delivery">
                <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg:last-of-type]:hidden">
                  Delivery & Installation
                  <div className="relative size-5">
                    <Plus className="absolute inset-0 size-full stroke-1 transition-opacity duration-200 group-data-[state=open]:opacity-0" />
                    <Minus className="absolute inset-0 size-full stroke-1 opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  We deliver to Cape Town Metro. National shipping available on
                  units. Installation is scheduled after payment — our team will
                  contact you to book a date and time slot.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="warranty">
                <AccordionTrigger className="py-4 text-base font-medium hover:no-underline [&>svg:last-of-type]:hidden">
                  Warranty & Returns
                  <div className="relative size-5">
                    <Plus className="absolute inset-0 size-full stroke-1 transition-opacity duration-200 group-data-[state=open]:opacity-0" />
                    <Minus className="absolute inset-0 size-full stroke-1 opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  All units come with manufacturer warranty. Extended warranty
                  plans available at checkout. Contact us within 7 days of
                  delivery for any issues.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* WARRANTY UPSELL */}
        {showWarrantyUpsell && (
          <div className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-normal text-[#1E3A5F] mb-2">
              Protect your investment
            </h2>
            <p className="text-muted-foreground mb-8">
              Add an extended warranty plan to cover parts and labour beyond the
              manufacturer warranty.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {["1-Year Extended Warranty", "2-Year Extended Warranty", "3-Year Extended Warranty"].map(
                (plan, i) => (
                  <div
                    key={plan}
                    className={cn(
                      "border rounded-xl p-5 flex flex-col gap-3",
                      i === 1 && "border-[#1C99D6] shadow-md"
                    )}
                  >
                    {i === 1 && (
                      <Badge className="self-start bg-[#1C99D6] text-white text-xs">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="font-normal text-[#1E3A5F]">{plan}</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Parts &amp; labour covered</li>
                      <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> Compressor failure</li>
                      <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> PCB &amp; refrigerant leaks</li>
                    </ul>
                    <p className="text-lg font-bold text-[#1C99D6]">
                      {formatZAR([800, 1500, 2200][i])}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6] hover:text-white"
                    >
                      <Link href="/enquire">Add to Quote</Link>
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* RELATED PRODUCTS */}
        {(() => {
          const related = mockProducts
            .filter((p) =>
              p.type === product.type &&
              p.id !== product.id
            )
            .slice(0, 3);

          if (related.length === 0) return null;

          const relatedAirconProducts = related.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            brand: p.brand,
            btu_size: p.btu_range ? `${p.btu_range}BTU` : null,
            type: p.type,
            price_zar: p.price_zar,
            sale_price_zar: p.sale_price_zar || null,
            images: p.images,
            is_enquiry_only: p.is_enquiry_only,
            is_featured: p.is_featured,
            stock: {
              stock_count: 10,
              is_sold_out: false,
              low_stock_threshold: 3,
            },
          }));

          return (
            <div className="mt-16 border-t pt-12">
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-8">
                You might also like
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {relatedAirconProducts.map((p) => (
                  <AirconProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {/* STICKY MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-4 py-3 md:hidden shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {product.is_enquiry_only ? (
              <p className="text-sm font-medium text-[#1E3A5F]">Price on request</p>
            ) : hasSale ? (
              <div>
                <span className="text-lg font-bold text-[#1C99D6]">
                  {formatZAR(product.sale_price_zar!)}
                </span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  {formatZAR(product.price_zar)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#1C99D6]">
                {formatZAR(product.price_zar)}
              </span>
            )}
          </div>
          <Button
            asChild
            className="rounded-full bg-[#1C99D6] hover:bg-[#1680b0] text-white px-6"
          >
            <Link href="/enquire">
              {product.is_enquiry_only ? "Request Quote" : "Get Quote"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Product Images (adapted from ProductDetail7) ─────────────────────────────

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const thumbnailRef = useRef<HTMLUListElement>(null);

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
    if (!api) return;
    const updateCurrent = () => setCurrent(api.selectedScrollSnap() + 1);
    updateCurrent();
    api.on("select", updateCurrent);
    return () => { api.off("select", updateCurrent); };
  }, [api]);

  return (
    <Fragment>
      <div className="flex w-full items-start gap-3">

        {/* Thumbnails — desktop only */}
        <ul
          ref={thumbnailRef}
          className="hidden w-16 shrink-0 flex-col gap-2 md:flex"
        >
          {images.map((img, index) => (
            <li key={index} className="w-full shrink-0">
              <button
                onClick={() => api?.scrollTo(index)}
                data-state={index + 1 === current ? "active" : "inactive"}
                type="button"
                className="relative block size-16 overflow-hidden rounded-lg border-2 border-transparent data-[state=active]:border-[#1C99D6] transition-colors duration-200"
              >
                <img
                  src={img.thumbnail}
                  alt={img.alt}
                  className="block size-full object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Main carousel */}
        <div className="flex-1">
          <div className="group/photos relative pswp-gallery" id={galleryID}>
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((img, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio
                      ratio={0.85}
                      className="overflow-hidden rounded-xl bg-gray-100"
                    >
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
                          width={img.width}
                          height={img.height}
                          className="block size-full object-cover object-center rounded-xl"
                        />
                      </a>
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Nav arrows */}
              <div className="hidden opacity-0 group-hover/photos:opacity-100 md:block transition-opacity duration-200">
                {current > 1 && <CarouselPrevious className="left-3" />}
                {current < images.length && <CarouselNext className="right-3" />}
              </div>
            </Carousel>

            {/* Image counter */}
            <Badge
              className="absolute bottom-3 left-3 rounded-full bg-white/80 text-xs text-gray-800 md:hidden"
              variant="secondary"
            >
              {current || 1} / {images.length}
            </Badge>
          </div>

          {/* Progress bar — mobile */}
          <div className="relative mt-2 h-0.5 w-full overflow-hidden rounded bg-gray-200 md:hidden">
            <div
              style={{
                width: `calc(100% / ${images.length})`,
                transform: `translateX(calc(100% * ${current - 1}))`,
              }}
              className="absolute h-full bg-[#1C99D6] transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};
