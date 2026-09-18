"use client";

import Autoplay from "embla-carousel-autoplay";
import { Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Price,
  type PriceType,
  PriceValue,
} from "@/components/price";
import { Rating } from "@/components/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Image = {
  src: string;
  srcset?: string;
  sizes?: string;
  alt: string;
};

interface Reviews {
  rate: number;
  totalReviewers: string;
}

type Product = {
  name: string;
  category?: {
    label: string;
    link: string;
  };
  images: Array<Image>;
  link: string;
  price?: PriceType;
  reviews: Reviews;
  badges?: Array<string>;
  features?: Array<string>;
};

type ProductCardProps = Product;

interface HeroCarouselItem {
  media: {
    type: "image" | "video";
    src: string;
    alt?: string;
    objectPosition?: string;
  };
  title?: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  product?: Product;
}

interface HeroSectionProps {
  className?: string;
  carouselItems?: HeroCarouselItem[];
}
const HERO_CAROUSEL: HeroCarouselItem[] = [
  {
    title: "Summer or Winter",
    description:
      "Cool in summer. Warm in winter.\nReverse-cycle aircons for every season.",
    media: {
      type: "image",
      src: "/Hero Images/hero summer winter.webp",
      objectPosition: "center 75%",
    },
    cta: {
      label: "Shop Now",
      href: "/products",
    },
    product: {
      name: "Wall mount AC AR80 Bespoke AI WindFree™",
      category: {
        label: "Samsung",
        link: "/categories/residential",
      },
      badges: ["Best Seller", "New"],
      reviews: {
        rate: 4.9,
        totalReviewers: "5.8k",
      },
      images: [
        {
          src: "/Hero Images/hero1.1.png",
          srcset: "/Hero Images/hero1.1.png 1920w",
          alt: "Reverse cycle aircon unit for summer and winter",
          sizes:
            "(min-width: 1920px) 1920px, (min-width: 1280px) 1280px, 100vw",
        },
        {
          src: "/Hero Images/hero1.1.png",
          srcset: "/Hero Images/hero1.1.png 1920w",
          alt: "Reverse cycle aircon unit for summer and winter",
          sizes:
            "(min-width: 1920px) 1920px, (min-width: 1280px) 1280px, 100vw",
        },
      ],
      link: "/products/samsung-9000btu-inverter-split-wall",
      price: {
        regular: 18599.0,
        currency: "ZAR",
      },
    },
  },
  {
    title: "Types for Every Space",
    description:
      "Split, ducted and multi-head.\nAircons for every home and business.",
    media: {
      type: "image",
      src: "/Hero Images/Hero 2.webp",
      objectPosition: "center center",
    },
    cta: {
      label: "Shop Now",
      href: "/products",
    },
    product: {
      name: "Order your aircon whether for business or residential, we've got you covered.",
      category: {
        label: "We Sell Most All Brands",
        link: "/products",
      },
      badges: ["Free Delivery", "Cape Town"],
      reviews: {
        rate: 4.7,
        totalReviewers: "2.3k",
      },
      images: [
        {
          src: "/Hero Images/hero2,2.webp",
          alt: "Ducted inverter aircon system for commercial spaces",
        },
        {
          src: "/Hero Images/hero2,2.webp",
          alt: "Ducted inverter aircon system for commercial spaces",
        },
      ],
      link: "/products",
    },
  },
  {
    title: "All Brands, No Guesswork",
    description:
      "Every major brand. Licensed installation.\nFull manufacturer warranty.",
    media: {
      type: "image",
      src: "/Hero Images/Hero 3.webp",
      objectPosition: "center 25%",
    },
    cta: {
      label: "Shop Now",
      href: "/products",
    },
    product: {
      name: "Whatever you need, we've got you covered.",
      features: [
        "Need an aircon? We've got you.",
        "Need it installed? We've got you.",
        "Need warranty cover? We've got you.",
      ],
      reviews: {
        rate: 4.8,
        totalReviewers: "1.6k",
      },
      images: [
        {
          src: "/Hero Images/hero3.3.webp",
          alt: "Mid-wall split inverter aircon for residential spaces",
        },
        {
          src: "/Hero Images/hero3.3.webp",
          alt: "Mid-wall split inverter aircon for residential spaces",
        },
      ],
      link: "/products",
    },
  },
];

const HeroSection = ({
  className,
  carouselItems = HERO_CAROUSEL,
}: HeroSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        playOnInit: true,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
      }),
    [],
  );

  useEffect(() => {
    if (!api) return;

    const updateCurrent = (api: CarouselApi) => {
      if (!api) return;
      setCurrent(api?.selectedScrollSnap());
    };
    api.on("reInit", updateCurrent).on("select", updateCurrent);

    return () => {
      api.off("reInit", updateCurrent).off("select", updateCurrent);
    };
  }, [api]);

  return (
    <header className={cn("", className)}>
      <div className="group/hero relative">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[autoplay]}
          setApi={setApi}
        >
          <CarouselContent className="m-0">
            {carouselItems.map(
              ({ title, description, media, product, cta }, index) => (
                <CarouselItem className="group h-[62vh] min-h-[500px] max-h-[540px] p-0 lg:h-dvh lg:min-h-170 lg:max-h-none" key={index}>
                  <div className="relative flex size-full flex-col items-center justify-end px-4 pt-16 pb-32 after:absolute after:inset-0 after:block after:bg-black/40 lg:px-40 lg:py-25 lg:after:bg-black/60">
                    <div
                      className={cn(
                        "relative z-10 w-full",
                        "flex flex-col gap-13 md:flex-row md:gap-10 lg:gap-13",
                        "md:items-end md:group-odd:flex-row-reverse",
                      )}
                    >
                      <div className="flex flex-1 flex-col md:group-even:items-end md:group-even:justify-end">
                        <h1 className="mb-4 max-w-[280px] font-[var(--font-google-sans-flex)] text-[32px] font-normal tracking-tight leading-[0.98] text-white min-[400px]:text-[36px] sm:max-w-none md:mb-4 md:text-[52px] md:leading-[1.05] md:group-even:text-right lg:text-[64px] xl:text-[72px]">
                          {title}
                        </h1>
                        <p className="max-w-130 whitespace-pre-line font-[var(--font-google-sans-flex)] text-base leading-[1.5] font-normal text-white/90 sm:text-lg md:text-xl md:leading-[1.6] md:group-even:text-right lg:text-2xl lg:leading-[1.5]">
                          {description}
                        </p>
                        {cta && (
                          <div className="aircon-angled-button-wrap mt-4 self-start md:mt-6 md:group-even:self-end">
                            <Button
                              asChild
                              variant="ghost"
                              className="aircon-angled-button !h-12 !rounded-none !px-[30px] !py-0 !text-[15px] !leading-none hover:!bg-transparent md:!text-base"
                            >
                              <a href={cta.href}>{cta.label}</a>
                            </Button>
                          </div>
                        )}
                        {/* Secondary CTA — subtle text link, not a button.
                            Sentence case, no underline by default, underline +
                            4px arrow translation on hover. 28px above on mobile,
                            32px on desktop. Left-aligned with hero content. */}
                        <Link
                          href="/products"
                          className="hero-secondary-link mt-7 self-start font-[var(--font-google-sans-flex)] text-[16px] font-medium leading-none text-white/90 transition-colors duration-200 hover:text-white md:mt-8 md:text-[17px] lg:text-[18px] md:group-even:self-end"
                        >
                          Browse all air conditioners
                          <span className="hero-secondary-arrow inline-block ml-1.5 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                        </Link>
                      </div>
                      {product && (
                        <div className="hidden md:block md:w-[clamp(220px,25vw,240px)] md:shrink-0 lg:w-80">
                          <ProductCard {...product} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0">
                      {media.type === "image" ? (
                        <img
                          src={media.src}
                          alt={media.alt}
                          style={{ objectPosition: media.objectPosition ?? "center" }}
                          className="block size-full object-cover lg:[object-position:center]"
                        />
                      ) : (
                        <video
                          loop
                          muted
                          autoPlay
                          src={media.src}
                          style={{ objectPosition: media.objectPosition ?? "center" }}
                          className="block size-full object-cover lg:[object-position:center]"
                        ></video>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ),
            )}
          </CarouselContent>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-between px-2 opacity-0 transition-opacity duration-300 group-hover/hero:opacity-100 group-focus-within/hero:opacity-100 lg:flex lg:px-12">
            <Button
              size="icon"
              variant="ghost"
              className="pointer-events-auto size-14 rounded-full bg-white/90 text-[#0A2540] shadow-md backdrop-blur-sm lg:size-12 lg:bg-transparent lg:text-white lg:shadow-none lg:backdrop-blur-none"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="size-7 stroke-1 lg:size-11" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => api?.scrollNext()}
              className="pointer-events-auto size-14 rounded-full bg-white/90 text-[#0A2540] shadow-md backdrop-blur-sm lg:size-12 lg:bg-transparent lg:text-white lg:shadow-none lg:backdrop-blur-none"
            >
              <ChevronRight className="size-7 stroke-1 lg:size-11" />
            </Button>
          </div>
        </Carousel>
        <div className="absolute inset-x-0 bottom-6 md:bottom-8 lg:bottom-12.5">
          <ol className="flex items-center justify-center gap-3">
            {api?.scrollSnapList().map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                data-state={current === index ? "active" : "inactive"}
                className="block size-2.5 rounded-full border border-primary data-[state=active]:bg-primary"
              ></button>
            ))}
          </ol>
        </div>
      </div>
    </header>
  );
};

const ProductCard = ({
  images,
  link,
  name,
  category,
  price,
  badges,
  reviews,
  features,
}: ProductCardProps) => {
  const { regular, sale, currency } = price ?? {};

  return (
    <Card className="group/card w-full rounded-none border-none bg-background p-0 shadow-none md:max-w-[57.5rem]">
      <CardContent className="flex flex-row p-0 md:flex-col">
        <div className="relative basis-30 self-stretch overflow-hidden md:basis-auto">
          <div className="absolute inset-x-0 top-0 z-20 max-md:hidden">
            {badges && (
              <ul className="flex flex-col gap-2 p-4">
                {badges.map((text, index) => (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] font-semibold uppercase tracking-widest"
                    key={`product-list-13-card-badge-${index}`}
                  >
                    {text}
                  </Badge>
                ))}
              </ul>
            )}
          </div>
          <div className="size-full overflow-hidden md:aspect-[0.92] lg:aspect-[0.8]">
            {images.map((img, index) => (
              <img
                key={`product-list-13-card-img-${index}`}
                srcSet={img.srcset}
                src={img.src}
                sizes={img.sizes}
                alt={img.alt}
                className="absolute inset-0 size-full origin-center object-cover object-center transition-all duration-500 group-hover/card:scale-105 first:opacity-100 group-hover/card:first:not-only:opacity-0 nth-2:opacity-0 group-hover/card:nth-2:opacity-100"
              />
            ))}
          </div>
        </div>
        <div className="px-2 py-4 md:px-3 md:py-5 lg:px-2 lg:py-4">
          {category && (
            <a
              href={category.link}
              className="mb-2 font-[var(--font-google-sans-flex)] text-[10px] font-semibold uppercase tracking-widest text-[#1C99D6]"
            >
              {category.label}
            </a>
          )}
          <div className="flex items-start justify-between gap-4 max-md:flex-col">
            <CardTitle className="flex-1">
              <a href={link} className="font-[var(--font-google-sans-flex)] text-sm font-medium leading-normal text-[#0A2540]">
                {name}
              </a>
            </CardTitle>
            {price && (
              <Price onSale={sale != null} className="gap-1 text-lg">
                <PriceValue price={sale} currency={currency} variant="sale" />
                <PriceValue
                  price={regular}
                  currency={currency}
                  variant="regular"
                />
              </Price>
            )}
          </div>
          {features && features.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {features.map((feature, index) => (
                <li
                  key={`product-feature-${index}`}
                  className="flex items-start gap-2 font-[var(--font-google-sans-flex)] text-sm font-normal leading-relaxed text-[#475569]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#1C99D6]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <Rating
              className="[&_svg]:size-3.5 [&>div]:size-3.5"
              rate={reviews.rate}
            />
            <p className="font-[var(--font-google-sans-flex)] text-xs font-normal leading-relaxed text-[#94A3B8] uppercase">
              {reviews.totalReviewers} Reviews
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { HeroSection };
