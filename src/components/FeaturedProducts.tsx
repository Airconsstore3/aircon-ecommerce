"use client";

import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const MAX_PRODUCTS = 12;

interface FeaturedProductsProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  products: Product[];
  className?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  showFeaturedHero?: boolean;
}

export function FeaturedProducts({
  eyebrow,
  title,
  subtitle,
  description,
  products,
  className,
  showViewAll = false,
  viewAllHref = "/products",
  showFeaturedHero = false,
}: FeaturedProductsProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Desktop native scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mobile embla carousel state
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const gridProducts = (products ?? []).length > 0
    ? showFeaturedHero
      ? products.slice(1, MAX_PRODUCTS)
      : products.slice(0, MAX_PRODUCTS)
    : [];

  // Desktop scroll handlers
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollByCards = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.getBoundingClientRect().width ?? 320;
    const gap = 16;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  // Mobile embla handlers
  const onSelect = useCallback((api: UseEmblaCarouselType[1]) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onPointerDown = useCallback(() => setIsDragging(true), []);
  const onPointerUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, onSelect, onPointerDown, onPointerUp]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      className={cn(
        "relative w-full bg-white pt-16 pb-16 md:pt-24 md:pb-30",
        className
      )}
    >
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6">
        {/* Section Header — left-aligned, consistent vertical rhythm on mobile.
            Eyebrow → Heading: 16px, Heading → Description: 20px,
            Description → CTA: 28px, CTA → Products: 40px. */}
        <div className="mb-10 md:mb-10">
          {eyebrow && (
            <span className="mb-4 block font-[var(--font-google-sans-flex)] text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]">
              {eyebrow}
            </span>
          )}
          <div className="mb-6 md:mb-4 flex items-start justify-between">
            <h2 className="max-w-[320px] md:max-w-[520px] font-[var(--font-google-sans-flex)] text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black">
              {title}
            </h2>
            {showViewAll && (
              <Link
                href={viewAllHref}
                className="hidden md:inline-flex h-[52px] items-center justify-center bg-[#1C99D6] px-8 font-[var(--font-google-sans-flex)] text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-300 hover:bg-[#1680b0]"
              >
                View All Aircons
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            {description && (
              <p className="max-w-[300px] md:max-w-[620px] font-[var(--font-google-sans-flex)] text-[18px] md:text-base font-normal leading-[1.6] text-[#5E6B7A]">
                {description}
              </p>
            )}
            {/* Desktop arrows */}
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => scrollByCards("left")}
                aria-label="Scroll left"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white transition-all duration-200 hover:bg-[#1C99D6] hover:text-white hover:border-[#1C99D6]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollByCards("right")}
                aria-label="Scroll right"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white transition-all duration-200 hover:bg-[#1C99D6] hover:text-white hover:border-[#1C99D6]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          {showViewAll && (
            <Link
              href={viewAllHref}
              className="md:hidden mt-7 flex h-[56px] w-full items-center justify-center rounded-none bg-[#1C99D6] px-8 font-[var(--font-google-sans-flex)] text-[16px] font-semibold uppercase tracking-wider text-white transition-colors duration-300 hover:bg-[#1680b0]"
            >
              View All Aircons
            </Link>
          )}
        </div>

        {/* Product carousel */}
        {gridProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No featured products available.
          </p>
        ) : isMobile ? (
          /* ---------- MOBILE: embla carousel, one card at a time ---------- */
          <div>
            <div
              ref={emblaRef}
              className="overflow-hidden"
              style={{ touchAction: "pan-y" }}
            >
              <div className="flex">
                {gridProducts.map((product, index) => (
                  <div
                    key={product.id}
                    data-card
                    className="flex-none w-full"
                  >
                    <ProductCard
                      product={product}
                      priority={index < 4}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation row — pagination on the left, arrows grouped on the
                right. 20px below cards, 12px horizontal padding, vertically
                centered. Arrows fade out during active drag/swipe. */}
            <div className="mt-5 mb-4 flex items-center justify-between px-3">
              {/* Pagination — active is a 22px pill, inactive are 7px dots,
                  8px gap. */}
              <div className="flex items-center gap-2">
                {scrollSnaps.map((_, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollTo(index)}
                      aria-label={`Go to product ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "block h-2 border-0 p-0 transition-all duration-300 ease-out",
                        "touch-manipulation cursor-pointer",
                        isActive
                          ? "w-[22px] rounded-full bg-[#1C99D6]"
                          : "w-[7px] rounded-full bg-[#D6DCE5] hover:bg-[#B4BCC8]"
                      )}
                    />
                  );
                })}
              </div>

              {/* Arrow buttons — 40px, grouped on the right with 12px gap */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous product"
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center",
                    "rounded-full bg-white text-[#163A63]",
                    "border border-[#E8EDF3]",
                    "shadow-[0_6px_18px_rgba(0,0,0,0.08)]",
                    "transition-all duration-300 ease-out active:scale-[0.96]",
                    isDragging ? "opacity-0 pointer-events-none" : "opacity-100",
                    "touch-manipulation cursor-pointer"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next product"
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center",
                    "rounded-full bg-white text-[#163A63]",
                    "border border-[#E8EDF3]",
                    "shadow-[0_6px_18px_rgba(0,0,0,0.08)]",
                    "transition-all duration-300 ease-out active:scale-[0.96]",
                    isDragging ? "opacity-0 pointer-events-none" : "opacity-100",
                    "touch-manipulation cursor-pointer"
                  )}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ---------- TABLET + DESKTOP: native scroll row (unchanged) ---------- */
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mb-4 px-4 -mx-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {gridProducts.map((product, index) => (
              <div
                key={product.id}
                data-card
                className="snap-start shrink-0 w-[260px] sm:w-[280px] md:w-[290px] lg:w-[300px]"
              >
                <ProductCard
                  product={product}
                  priority={index < 4}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hide scrollbar via CSS */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
