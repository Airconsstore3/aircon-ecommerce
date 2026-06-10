"use client";

import Autoplay from "embla-carousel-autoplay";
import { Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
      "Cool in Summer. Warm in Winter.\nReverse cycle aircons for homes, offices and warehouses.\nOne system, all year round.",
    media: {
      type: "image",
      src: "/Hero Images/hero summer winter.webp",
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
      link: "/products/samsung-9000btu-windfree",
      price: {
        regular: 18599.0,
        currency: "ZAR",
      },
    },
  },
  {
    title: "Types for Every Space",
    description:
      "Split, Ducted, Multi-Head\nWe Match the Unit to the Building.\nResidential or commercial aircons, sized right for apartments, shops and warehouses.",
    media: {
      type: "image",
      src: "/Hero Images/Hero 2.webp",
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
      "Every Major Brand. Full Warranty. Licensed Install.\nGenuine aircons, proper backup, installed by techs who know the gear inside out.",
    media: {
      type: "image",
      src: "/Hero Images/Hero 3.webp",
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
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      playOnInit: true,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
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
      <div className="relative">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[autoplay.current]}
          setApi={setApi}
        >
          <CarouselContent className="m-0">
            {carouselItems.map(
              ({ title, description, media, product, cta }, index) => (
                <CarouselItem className="group h-dvh min-h-170 p-0" key={index}>
                  <div className="relative flex size-full flex-col items-center justify-end px-4 py-25 after:absolute after:inset-0 after:block after:bg-black/60 lg:px-40">
                    <div
                      className={cn(
                        "relative z-10 w-full",
                        "flex flex-col gap-13 md:flex-row",
                        "md:items-end md:group-odd:flex-row-reverse",
                      )}
                    >
                      <div className="flex flex-1 flex-col gap-4 md:group-even:items-end md:group-even:justify-end">
                        <h1 className="font-[var(--font-google-sans-flex)] text-5xl font-normal tracking-tight leading-tight text-white md:text-6xl md:group-even:text-right lg:text-7xl">
                          {title}
                        </h1>
                        <p className="max-w-130 font-[var(--font-google-sans-flex)] text-base md:text-lg font-normal leading-relaxed text-white/90 md:group-even:text-right">
                          {description}
                        </p>
                        {cta && (
                          <div className="aircon-angled-button-wrap mt-1 self-start md:group-even:self-end">
                            <Button
                              asChild
                              variant="ghost"
                              className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
                            >
                              <a href={cta.href}>{cta.label}</a>
                            </Button>
                          </div>
                        )}
                      </div>
                      {product && (
                        <div className="md:basis-80">
                          <ProductCard {...product} />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0">
                      {media.type === "image" ? (
                        <img
                          src={media.src}
                          alt={media.alt}
                          className="block size-full object-cover object-center"
                        />
                      ) : (
                        <video
                          loop
                          muted
                          autoPlay
                          src={media.src}
                          className="block size-full object-cover object-center"
                        ></video>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ),
            )}
          </CarouselContent>
          <div className="pointer-events-none absolute bottom-12.5 contents flex w-full translate-y-1/2 items-center justify-between px-2 lg:top-1/2 lg:-translate-y-1/2 lg:px-12">
            <Button
              size="icon"
              variant="ghost"
              className="pointer-events-auto size-12 rounded-full text-white"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="size-11 stroke-1" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => api?.scrollNext()}
              className="pointer-events-auto size-12 rounded-full text-white"
            >
              <ChevronRight className="size-11 stroke-1" />
            </Button>
          </div>
        </Carousel>
        <div className="absolute inset-x-0 bottom-12.5 translate-y-1/2">
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
          <div className="size-full overflow-hidden md:aspect-[0.8]">
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
          <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden max-md:hidden">
            <div className="flex justify-end gap-4 p-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Heart />
              </Button>
            </div>
          </div>
        </div>
        <div className="px-2 py-4">
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
