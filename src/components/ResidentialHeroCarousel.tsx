"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { cn } from "@/lib/utils";
import type { HeroProduct, HeroProductVariant } from "@/lib/fetch-featured-products";

interface ResidentialHeroCarouselProps {
  products: HeroProduct[];
}

const ROOM_RANGES: Array<{ maxBtu: number; label: string }> = [
  { maxBtu: 9000, label: "16–18m²" },
  { maxBtu: 12000, label: "21–24m²" },
  { maxBtu: 18000, label: "32–36m²" },
  { maxBtu: 24000, label: "43–48m²" },
  { maxBtu: 30000, label: "56–60m²" },
  { maxBtu: 36000, label: "66–70m²" },
];

function roomRangeLabel(btu: number | null): string {
  if (!btu) return "Custom size";
  return ROOM_RANGES.find((range) => btu <= range.maxBtu)?.label ?? "Large space";
}

function variantLabel(variant: HeroProductVariant): string {
  if (!variant.btuRange) return variant.variantName || "Standard";
  return `${variant.btuRange.toLocaleString("en-ZA")} BTU (${roomRangeLabel(variant.btuRange)})`;
}

function variantPillLabel(variant: HeroProductVariant): string {
  if (!variant.btuRange) return variant.variantName || "Standard";
  return `${variant.btuRange.toLocaleString("en-ZA")} BTU`;
}

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString("en-ZA")},00`;
}

const ResidentialProductCard = ({ product, isActive }: { product: HeroProduct; isActive: boolean }) => {
  const { addItem } = useCart();
  const variants = useMemo(
    () => product.variants.filter((variant, index, all) => all.findIndex((item) => item.btuRange === variant.btuRange) === index),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? product.id);
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const image = selectedVariant?.image || product.image;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const savings = compareAtPrice ? Math.round(((compareAtPrice - selectedVariant.price) / compareAtPrice) * 100) : 0;

  const addSelectedVariant = () => {
    addItem({
      id: selectedVariant.id,
      name: product.name,
      slug: selectedVariant.slug,
      price_zar: selectedVariant.price,
      images: image ? [image] : [],
      type: "aircon",
      is_enquiry_only: product.isEnquiryOnly,
      variant: variantLabel(selectedVariant),
    });
  };

  return (
    <div className="flex h-full flex-col px-1 text-left">
      <div className="relative h-28 shrink-0 sm:h-32">
        {savings > 0 && <span className="absolute left-1 top-0 z-10 rounded-full bg-[#76B93F] px-2 py-0.5 text-[10px] font-bold text-white">{savings}% OFF</span>}
        {compareAtPrice && <span className="absolute right-1 top-0 z-10 rounded-full bg-[#E3136C] px-2 py-0.5 text-[10px] font-bold text-white">SALE</span>}
        <Link href={`/products/${selectedVariant.slug}`} aria-label={`View ${product.name}`} tabIndex={isActive ? 0 : -1} className="absolute inset-0 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6]">
          {image ? (
            <Image src={image} alt={product.name} fill loading="eager" sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 85vw" className="object-contain" draggable={false} />
          ) : (
            <div className="size-full rounded-lg bg-[#E8F4FD]" />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1478A8]">{product.brand}</p>
        <Link href={`/products/${selectedVariant.slug}`} tabIndex={isActive ? 0 : -1} className="mt-1 line-clamp-2 min-h-[40px] text-sm font-medium leading-tight text-[#0A2540] underline-offset-4 transition-colors hover:text-[#1478A8] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6]">
          {product.name}
        </Link>

        {variants.length > 1 && (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {variants.slice(0, 2).map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                aria-pressed={variant.id === selectedVariant.id}
                aria-label={variantLabel(variant)}
                title={variantLabel(variant)}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  "min-h-7 whitespace-nowrap rounded-lg border px-1.5 py-1 text-[10px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1C99D6]",
                  variant.id === selectedVariant.id
                    ? "border-[#0A2540] bg-[#0A2540] text-white"
                    : "border-[#B8E3F7]/80 bg-white/60 text-[#335B74] backdrop-blur-sm hover:border-[#1C99D6]",
                )}
              >
                {variantPillLabel(variant)}
              </button>
            ))}
          </div>
        )}

        <div className="pt-3">
          <div className="flex min-h-7 items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-[#0A2540]">{formatPrice(selectedVariant.price)}</span>
            {compareAtPrice && <span className="text-[11px] text-[#335B74] line-through">{formatPrice(compareAtPrice)}</span>}
          </div>
          <p className="text-[10px] text-[#335B74]">{selectedVariant.isSoldOut ? "Available on request" : "In stock"}</p>
        </div>

        <div className="mt-2.5 grid grid-cols-[0.75fr_1.25fr] gap-1.5">
          <Link href={`/products/${selectedVariant.slug}`} tabIndex={isActive ? 0 : -1} className="inline-flex h-10 items-center justify-center rounded-md border border-[#0A2540] bg-white/50 text-xs font-semibold text-[#0A2540] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]">
            View
          </Link>
          <button
            type="button"
            onClick={addSelectedVariant}
            disabled={selectedVariant.isSoldOut}
            tabIndex={isActive ? 0 : -1}
            className="inline-flex h-10 items-center justify-center gap-0.5 whitespace-nowrap rounded-md bg-[#0A2540] px-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#335B74] disabled:cursor-not-allowed disabled:bg-[#B8E3F7] disabled:text-[#335B74] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A2540]"
          >
            <ShoppingCart aria-hidden="true" className="size-3.5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const ResidentialHeroCarousel = ({ products }: ResidentialHeroCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useMemo(
    () => Autoplay({ delay: 4500, playOnInit: true, stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true }),
    [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, containScroll: "trimSnaps" }, [autoplay]);

  const updateSelectedIndex = useCallback(() => {
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateSelectedIndex).on("reInit", updateSelectedIndex);
    return () => {
      emblaApi.off("select", updateSelectedIndex).off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, updateSelectedIndex]);

  if (products.length === 0) return null;

  return (
    <section aria-label="Featured residential air conditioners" className="relative mx-auto flex h-full w-full max-w-[350px] flex-col sm:max-w-[390px]">
      <div ref={emblaRef} className="min-h-0 flex-1 overflow-hidden rounded-xl">
        <div className="flex h-full">
          {products.map((product, index) => (
            <article key={product.id} aria-hidden={index !== selectedIndex} className="h-full min-w-0 flex-[0_0_100%] pl-0.5 pr-0.5">
              <ResidentialProductCard product={product} isActive={index === selectedIndex} />
            </article>
          ))}
        </div>
      </div>

      {products.length > 1 && (
        <div className="mt-2 flex shrink-0 items-center justify-center gap-2">
          <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous residential air conditioner" className="flex size-8 items-center justify-center rounded-full border border-[#B8E3F7] bg-white text-[#0A2540] transition-colors hover:bg-[#F0F9FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6]">
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Residential products">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Show ${product.brand}`}
                aria-selected={index === selectedIndex}
                role="tab"
                className={cn(
                  "h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6]",
                  index === selectedIndex ? "w-5 bg-[#1C99D6]" : "w-1.5 bg-[#B8E3F7] hover:bg-[#1C99D6]/50",
                )}
              />
            ))}
          </div>
          <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Next residential air conditioner" className="flex size-8 items-center justify-center rounded-full border border-[#B8E3F7] bg-white text-[#0A2540] transition-colors hover:bg-[#F0F9FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C99D6]">
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
};

export { ResidentialHeroCarousel };
