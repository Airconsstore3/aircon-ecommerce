"use client";

import { ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";

import { Price, PriceValue } from "@/components/price";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeliveryInstallationSection } from "@/components/delivery-installation-section";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

type Variant = {
  color: string;
  value: string;
  id: string;
  label: string;
  link: string;
  images: [Image, Image];
};
interface Product {
  name: string;
  category: {
    label: string;
    link: string;
  };
  images: [Image, Image];
  link: string;
  price: ProductPrice;
  variants: Array<Variant>;
  badges?: Array<Badge>;
  brand?: string;
  btu_size?: string;
  btu_options?: string[];
}

interface PromoData {
  title: string;
  kicker: string;
  cta: {
    label: string;
    link: string;
  };
}

type PromoCardProps = PromoData;

type Badge = {
  text: string;
  color: string;
};

type ProductCardProps = Product;

type Image = {
  srcset?: string;
  src: string;
  sizes?: string;
  alt: string;
};

interface ProductColorsProps {
  variants: Omit<Variant, "images">[];
  value: string;
  onOptionHover: (value: string) => void;
}

interface BadgesProps {
  badges?: Array<Badge>;
}

type ProductList = Array<{
  title: string;
  value: string;
  promotion: PromoData;
  products: Array<Product>;
}>;

const PRODUCTS_LIST: ProductList = [
  {
    title: "Residential",
    value: "residential",
    promotion: {
      title: "Fresh. Trendy. Now.",
      kicker: "Offer",
      cta: {
        label: "See What's New",
        link: "/products?sale=true",
      },
    },
    products: [
      {
        name: "Samsung 9000BTU WindFree Inverter",
        price: {
          regular: 8999,
          sale: 7499,
          currency: "ZAR",
        },
        category: {
          label: "Residential",
          link: "/categories/residential",
        },
        link: "/products/samsung-9000btu-windfree",
        brand: "Samsung",
        btu_size: "9000BTU",
        btu_options: ["9,000 BTU/h", "12,000 BTU/h", "18,000 BTU/h"],
        badges: [
          {
            text: "SALE",
            color: "#1C99D6",
          },
        ],
        variants: [],
        images: [
          {
            src: "/Hero Images/Featured In section/AR80 Wall-mount AC with Windfree™ and AI technology.png",
            alt: "Samsung 9000BTU WindFree Inverter",
          },
          {
            src: "/Hero Images/Featured In section/AR80 Wall-mount AC with Windfree™ and AI technology.png",
            alt: "Samsung 9000BTU WindFree Inverter",
          },
        ],
      },
      {
        name: "LG 12000BTU Dual Inverter",
        price: {
          regular: 9499,
          currency: "ZAR",
        },
        category: {
          label: "Residential",
          link: "/categories/residential",
        },
        link: "/products/lg-12000btu-dual-inverter",
        brand: "LG",
        btu_size: "12000BTU",
        btu_options: ["12,000 BTU/h", "18,000 BTU/h"],
        badges: undefined,
        variants: [],
        images: [
          {
            src: "/Hero Images/Featured In section/WindFree™ 4-Way Cassette.png",
            alt: "LG 12000BTU Dual Inverter",
          },
          {
            src: "/Hero Images/Featured In section/WindFree™ 4-Way Cassette.png",
            alt: "LG 12000BTU Dual Inverter",
          },
        ],
      },
      {
        name: "Daikin 9000BTU Smile Series",
        price: {
          regular: 8999,
          currency: "ZAR",
        },
        category: {
          label: "Residential",
          link: "/categories/residential",
        },
        link: "/products/daikin-9000btu-smile",
        brand: "Daikin",
        btu_size: "9000BTU",
        btu_options: ["9,000 BTU/h", "12,000 BTU/h"],
        badges: undefined,
        variants: [],
        images: [
          {
            src: "/Hero Images/Featured In section/Daikin Emura.png",
            alt: "Daikin 9000BTU Smile Series",
          },
          {
            src: "/Hero Images/Featured In section/Daikin Emura.png",
            alt: "Daikin 9000BTU Smile Series",
          },
        ],
      },
      {
        name: "Midea 18000BTU Inverter Split",
        price: {
          regular: 11999,
          currency: "ZAR",
        },
        category: {
          label: "Residential",
          link: "/categories/residential",
        },
        link: "/products/midea-18000btu-inverter",
        brand: "Midea",
        btu_size: "18000BTU",
        btu_options: ["18,000 BTU/h", "24,000 BTU/h"],
        badges: [
          {
            text: "BEST SELLER",
            color: "#0A2540",
          },
        ],
        variants: [],
        images: [
          {
            src: "/Hero Images/Featured In section/Midea 6,000 BTU DOE Smart Portable Air Conditioner,.png",
            alt: "Midea 18000BTU Inverter Split",
          },
          {
            src: "/Hero Images/Featured In section/Midea 6,000 BTU DOE Smart Portable Air Conditioner,.png",
            alt: "Midea 18000BTU Inverter Split",
          },
        ],
      },
    ],
  },
  {
    title: "Commercial",
    value: "commercial",
    promotion: {
      title: "Up to 20% off selected units",
      kicker: "WINTER SALE",
      cta: {
        label: "See deals",
        link: "/products",
      },
    },
    products: [],
  },
];

interface ProductList9Props {
  className?: string;
}

const ProductList9 = ({ className }: ProductList9Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback((api: CarouselApi) => {
    const progress = Math.max(0, Math.min(1, api?.scrollProgress() ?? 0));
    setScrollProgress(progress + 0.25);
  }, []);

  useEffect(() => {
    if (!api) return;

    // Defer initial call to avoid synchronous state update in effect
    requestAnimationFrame(() => {
      onScroll(api);
    });

    api
      .on("reInit", onScroll)
      .on("scroll", onScroll)
      .on("slideFocus", onScroll);
  }, [api, onScroll]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
      <DeliveryInstallationSection />
      <section className={cn("overflow-hidden py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <div className="mb-8 flex flex-col gap-3">
          <h2 className="text-[28px] md:text-[48px] leading-[1.1] font-normal text-black -tracking-[0.6px] font-[var(--font-google-sans-flex)]">
            Featured units
          </h2>
          <p className="text-sm text-[#94A3B8]">
            Cape Town's best-selling residential and commercial aircons
          </p>
        </div>
        <Carousel
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                active: false,
                startIndex: 0,
                align: "start",
                slidesToScroll: 1,
              },
            },
          }}
          setApi={setApi}
          className="w-full md:[&>div]:overflow-visible"
        >
          <CarouselContent className="ml-0 grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 md:-ml-4 md:flex md:gap-0">
            <CarouselItem className="pl-0 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5">
              <PromoCard {...PRODUCTS_LIST[0].promotion} />
            </CarouselItem>
            {PRODUCTS_LIST[0].products.map((item, index) => (
              <CarouselItem
                className="pl-0 md:basis-1/3 md:pl-4 lg:basis-1/4 xl:basis-1/5"
                key={`product-list-9-item-${index}`}
              >
                <ProductCard {...item} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex justify-center mt-16">
          <div className="aircon-angled-button-wrap">
            <Button
              asChild
              variant="ghost"
              className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
            >
              <a href="/products?sale=true">Latest Deals</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

const PromoCard = ({ title, cta, kicker }: PromoCardProps) => {
  return (
    <Card className="group relative flex size-full min-h-[500px] min-w-47.5 flex-col justify-end gap-5 overflow-hidden rounded-none !p-6 lg:max-w-80">
      <img
        src="/Hero Images/Featured In section/MAIN  C ARD/MSIN.webp"
        alt="Featured Product"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <a href={cta.link} className="absolute inset-0 z-10 size-full"></a>
      <CardAction className="z-20">
        <div className="aircon-angled-button-wrap">
          <Button
            asChild
            variant="ghost"
            className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
          >
            <a href={cta.link}>{cta.label}</a>
          </Button>
        </div>
      </CardAction>
    </Card>
  );
};

const ProductCard = ({
  link,
  images,
  name,
  price,
  category,
  variants,
  badges,
  brand,
  btu_size,
  btu_options,
}: ProductCardProps) => {
  const { regular, sale, currency } = price;
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedBtu, setSelectedBtu] = useState<string>(btu_options?.[0] || "");

  const onOptionHover = (value: string) => {
    setSelectedColor(value);
  };

  const productImages = useMemo(() => {
    return variants.find((v) => v.value === selectedColor)?.images ?? images;
  }, [images, selectedColor, variants]);

  const btuOptions = btu_options || [];
  const hasMultipleBtu = btuOptions.length > 1;

  const formatPrice = (price: number) => {
    return `R ${price.toLocaleString('en-ZA')}`;
  };

  return (
    <Card className="relative flex flex-col h-full rounded-none border border-solid border-[#0A2540]/30 bg-transparent p-6 shadow-none ring-0 min-h-[500px]">
      <CardContent className="flex-1 p-0">
        {/* Badge Area */}
        <div className="absolute top-6 left-6 h-[19px] z-20">
          <Badges badges={badges} />
        </div>

        {/* Product Image Section */}
        <div className="relative mt-7 mb-9 w-full flex flex-col items-center">
          <div className="w-[216px] h-[216px] relative overflow-hidden rounded-none">
            <img
              src={images[0].src}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Product Name and Features */}
        <div className="relative min-h-[72px]">
          <p className="font-bold text-[#1C99D6] text-xs uppercase tracking-wider mb-1">{brand}</p>
          <h2 className="text-[18px] font-normal leading-[24px] text-black font-[var(--font-google-sans-flex)] line-clamp-2">
            <a href={link} className="hover:underline">
              {name}
            </a>
          </h2>
        </div>

        {/* Option Selector (BTU) */}
        <div className="mt-4 min-h-[56px]">
          <label className="text-xs text-[#94A3B8] font-normal mb-1 block">Choose size</label>
          <div className="relative w-full">
            <select
              value={selectedBtu || btu_size}
              onChange={(e) => setSelectedBtu(e.target.value)}
              className="w-full h-10 px-3 rounded-none border-none bg-transparent text-black text-[14px] font-[var(--font-google-sans-flex)] appearance-none cursor-pointer pr-8"
            >
              <option value="9,000 BTU/h">9,000 BTU</option>
              <option value="12,000 BTU/h">12,000 BTU</option>
              <option value="18,000 BTU/h">18,000 BTU</option>
              <option value="24,000 BTU/h">24,000 BTU</option>
              <option value="32,000 BTU/h">32,000 BTU</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#1C99D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-4 min-h-[40px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="sr-only">Total Price:</span>
            {sale ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-black font-[var(--font-google-sans-flex)]">
                  {formatPrice(sale)}
                </span>
                <span className="text-sm font-normal text-[#94A3B8] line-through font-[var(--font-google-sans-flex)]">
                  {formatPrice(regular)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-medium text-black font-[var(--font-google-sans-flex)]">
                {formatPrice(regular)}
              </span>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-auto pt-[11px] flex flex-col gap-2">
          <button
            type="button"
            className="w-full h-10 border border-dashed border-[#0A2540] bg-transparent text-[#0A2540] text-sm font-normal rounded-none transition-all hover:bg-[#1C99D6] hover:border-solid hover:border-[#1C99D6] hover:text-white flex items-center justify-center gap-2 font-[var(--font-google-sans-flex)]"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to cart
          </button>
          <button
            type="button"
            className="w-full h-10 border border-dashed border-[#0A2540] bg-transparent text-[#0A2540] text-sm font-normal rounded-none transition-all hover:bg-[#1C99D6] hover:border-solid hover:border-[#1C99D6] hover:text-white flex items-center justify-center font-[var(--font-google-sans-flex)]"
          >
            View product
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductColors = ({
  value,
  onOptionHover,
  variants,
}: ProductColorsProps) => {
  if (!variants) return;

  return (
    <TooltipProvider>
      <RadioGroup value={value} className="mt-2 flex items-center gap-2">
        {variants.map((item, index) => (
          <Label
            className="relative block pb-1.5 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:w-full after:bg-primary after:opacity-0 after:transition-opacity hover:after:opacity-100 has-data-[state=checked]:after:opacity-100"
            htmlFor={item.id}
            key={`product-list-9-color-${index}`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <a href={item.link}>
                  <div
                    style={{
                      backgroundColor: item.color,
                    }}
                    className="size-5.5 border"
                    onMouseEnter={() => onOptionHover(item.value)}
                  ></div>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
            <RadioGroupItem
              value={item.value}
              id={item.id}
              className="sr-only"
            />
          </Label>
        ))}
      </RadioGroup>
    </TooltipProvider>
  );
};

const Badges = ({ badges }: BadgesProps) => {
  if (!badges) return;

  return (
    <div className="flex flex-col gap-1.5">
      {badges.map((item, index) => (
        <Badge
          key={`product-list-9-badge-${index}`}
          className="bg-[#1C99D6] text-white rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
        >
          {item.text}
        </Badge>
      ))}
    </div>
  );
};

export { ProductList9 };
