"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Category {
  id: string;
  name: string;
  image: string;
  link: string;
  cta: string;
  objectPosition?: string;
}

const CATEGORIES: Category[] = [
  {
    id: "residential",
    name: "Residential",
    image: "/Hero Images/Product category pictures/Residential Aircons.png",
    link: "/categories/residential",
    cta: "Shop Residential →",
  },
  {
    id: "commercial",
    name: "Commercial",
    image: "/Hero Images/Product category pictures/Commercial Aircons.png",
    link: "/categories/commercial",
    cta: "Shop Commercial →",
  },
  {
    id: "heat-pumps",
    name: "Heat Pumps",
    image: "/Hero Images/Product category pictures/Heat Pumps.png",
    link: "/categories/heat-pumps",
    cta: "Shop Heat Pumps →",
  },
  {
    id: "portable",
    name: "Portable",
    image: "/Hero Images/Product category pictures/Portable Aircons.png",
    link: "/categories/portable",
    cta: "Shop Portable →",
    // Portable unit sits on the right of the source image; shift the crop
    // so the product reads as more central in the mobile frame.
    objectPosition: "78% center",
  },
  {
    id: "installation",
    name: "Installation\nPackages",
    image: "/Hero Images/Product category pictures/Installation Packages.png",
    link: "/categories/kits",
    cta: "Shop Packages →",
  },
];

interface CategoryCarouselProps {
  className?: string;
}

/**
 * Single category card. Shared between the mobile embla carousel and the
 * tablet/desktop native-scroll row so the card design stays identical.
 *
 * On mobile, `isActive` adds a subtle elevation (soft shadow) to the
 * currently selected slide so the carousel feels interactive.
 */
function CategoryCard({
  category,
  isActive = false,
}: {
  category: Category;
  isActive?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/card flex flex-col h-full transition-all duration-300 ease-out",
        isActive
          ? "shadow-[0_12px_32px_rgba(0,0,0,0.10)]"
          : "shadow-none"
      )}
    >
      {/* Card Image — 16:11 on mobile (shorter for compact layout), taller on tablet/desktop. */}
      <div className="relative aspect-[16/11] md:aspect-auto md:h-96 lg:h-[28rem] rounded-none overflow-hidden bg-gray-100 transition-all duration-500 group-hover/card:shadow-xl">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover/card:scale-105"
          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 20vw"
          style={category.objectPosition ? { objectPosition: category.objectPosition } : undefined}
        />
        {/* Readability gradient — localized behind the title only on mobile
            (bottom ~22%, 35% max opacity). Desktop keeps the original gradient. */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[22%] md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 hidden md:block h-[30%]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0) 70%)",
          }}
        />
        {/* Title — 28px from bottom, 24px from left on mobile.
            Semibold (600), white. Desktop keeps original spacing. */}
        <div className="absolute bottom-0 left-0 right-0 pl-6 pb-7 pr-5 pt-6 md:p-6 md:pb-6 lg:p-8 lg:pb-8">
          <h3 className="font-[var(--font-google-sans-flex)] text-lg md:text-xl lg:text-2xl font-semibold md:font-bold leading-[1.18] text-white text-left line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {category.name}
          </h3>
        </div>
      </div>

      {/* CTA Button — 16px gap from card, 56px tall, 10px radius, 1.5px border,
          16px bold text on mobile. Full width, hover fills brand blue. */}
      <Link
        href={category.link}
        className="mt-4 md:mt-2 w-full inline-flex items-center justify-center px-8 rounded-none border-[1.5px] border-[#1C99D6] bg-white text-[#1C99D6] font-[var(--font-google-sans-flex)] text-base md:text-sm font-bold md:font-medium tracking-wider transition-all duration-300 hover:bg-[#1C99D6] hover:text-white h-12 md:h-[48px]"
      >
        {category.cta}
      </Link>
    </div>
  );
}

const CategoryCarousel = ({ className }: CategoryCarouselProps) => {
  // <768px = mobile (premium embla carousel). >=768px = tablet/desktop native row.
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onSelect = useCallback((api: UseEmblaCarouselType[1]) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  const onPointerDown = useCallback(() => setIsDragging(true), []);
  const onPointerUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!emblaApi) return;
    // Snap list is derived from the embla API, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    // Hide arrows during active drag/swipe for a cleaner mobile feel.
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
        "relative w-full bg-white pt-16 pb-8 md:pt-24 md:pb-24",
        className
      )}
    >
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6">
        {/* Section Header — 24px gap to card on mobile (mb-6 vs mb-14) */}
        <div className="mb-6 md:mb-14 text-left max-w-[800px]">
          <span className="mb-4 block font-[var(--font-google-sans-flex)] text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]">
            Browse by Category
          </span>
          <h2 className="max-w-[320px] md:max-w-[520px] font-[var(--font-google-sans-flex)] text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black">
            Find the Perfect Air Conditioner<span className="hidden md:inline"> for Your Space</span>
          </h2>
        </div>

        {isMobile ? (
          /* ---------- MOBILE: premium single-card embla carousel ---------- */
          <div className="relative">
            {/* Carousel viewport — overflow-hidden clips slides to container
                width. Slides have px-2.5 for a 20px gap between cards. */}
            <div className="relative">
              <div
                ref={emblaRef}
                className="overflow-hidden"
                style={{ touchAction: "pan-y" }}
              >
                <div className="-mx-2.5 flex">
                  {CATEGORIES.map((category, index) => (
                    <div key={category.id} className="flex-none w-full px-2.5">
                      <CategoryCard
                        category={category}
                        isActive={index === selectedIndex}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation row — arrows on the sides, pagination dots centered.
                20px below the CTA button, all vertically centered on one line. */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous category"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center",
                  "rounded-full bg-white text-[#163A63]",
                  "border border-[#E8EDF3]",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
                  "transition-all duration-200 ease-out active:scale-[0.96]",
                  isDragging ? "opacity-0 pointer-events-none" : "opacity-100",
                  "touch-manipulation cursor-pointer"
                )}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>

              {/* Pagination dots — active 10px brand blue, inactive 8px grey,
                  10px spacing, perfectly centered. */}
              <div className="flex items-center justify-center gap-2.5">
                {scrollSnaps.map((_, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollTo(index)}
                      aria-label={`Go to category ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "block rounded-full border-0 p-0 transition-all duration-300 ease-out",
                        "touch-manipulation cursor-pointer",
                        isActive
                          ? "h-[10px] w-[10px] bg-[#1C99D6]"
                          : "h-2 w-2 bg-[#D6DCE5] hover:bg-[#B4BCC8]"
                      )}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next category"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center",
                  "rounded-full bg-white text-[#163A63]",
                  "border border-[#E8EDF3]",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
                  "transition-all duration-200 ease-out active:scale-[0.96]",
                  isDragging ? "opacity-0 pointer-events-none" : "opacity-100",
                  "touch-manipulation cursor-pointer"
                )}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          /* ---------- TABLET + DESKTOP: native scroll row (unchanged UX) ---------- */
          <div className="relative">
            <div
              className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-8 -mx-4 px-4 md:mx-0 md:px-0"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="flex-none w-[calc(50%-0.5rem)] lg:w-[calc(20%-1.2rem)] snap-start"
                >
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { CategoryCarousel };
