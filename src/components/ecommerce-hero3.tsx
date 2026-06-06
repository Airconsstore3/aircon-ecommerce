"use client";

import Autoplay from "embla-carousel-autoplay";

import {
  Price,
  type PriceType,
  PriceValue,
} from "@/components/price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Product = {
  image: string;
  name: string;
  href: string;
  price: PriceType;
};

interface HeroData {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  products: Product[];
  cta: {
    label: string;
    href: string;
  };
}

type ProductCardProps = Product;

interface EcommerceHero3Props extends Partial<HeroData> {
  className?: string;
}

const HERO_DATA: HeroData = {
  backgroundImage:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Cozy-Christmas-Living-Room-2.png",
  title: "Warmth and Style for Every Living Space",
  subtitle: "Furniture Collection",
  description:
    "Discover thoughtfully designed furniture and lighting that bring comfort, balance, and modern elegance into your home.",
  cta: {
    label: "Shop the Collection",
    href: "#",
  },
  products: [
    {
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Artistic-Lamp-1.png",
      name: "Modern Artistic Table Lamp",
      href: "#",
      price: {
        regular: 100,
        currency: "USD",
      },
    },
    {
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Minimalist-Wooden-Sideboard-1.png",
      name: "Minimalist Wooden Sideboard",
      href: "#",
      price: {
        regular: 100,
        currency: "USD",
      },
    },
    {
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Minimalist-Interior-with-Sculptural-Element-1.png",
      name: "Sculptural Accent Lamp",
      href: "#",
      price: {
        regular: 100,
        currency: "USD",
      },
    },
    {
      image:
        "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Wooden-Cabinet-1.png",
      name: "Modern Wooden Storage Cabinet",
      href: "#",
      price: {
        regular: 100,
        currency: "USD",
      },
    },
  ],
};

const EcommerceHero3 = ({
  className,
  backgroundImage = HERO_DATA.backgroundImage,
  products = HERO_DATA.products,
  title = HERO_DATA.title,
  subtitle = HERO_DATA.subtitle,
  description = HERO_DATA.description,
  cta = HERO_DATA.cta,
}: EcommerceHero3Props) => {
  return (
    <header className={cn("py-32", className)}>
      <div className="w-full">
        <div
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
          className="relative w-full overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat py-10 after:absolute after:inset-0 after:block after:bg-black/35 lg:h-190 xl:h-210 xl:py-20"
        >
          <div className="relative z-10 flex h-full flex-col gap-10 px-6 sm:px-20 lg:flex-row">
            <div className="flex flex-1 items-center">
              <div className="flex flex-col justify-between gap-4 lg:h-132">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 after:block after:h-px after:w-15 after:bg-white">
                    <p className="text-xs font-bold text-white uppercase">
                      {subtitle}
                    </p>
                  </div>
                  <h1 className="text-2xl leading-tight text-white md:text-4xl xl:text-5xl">
                    {title}
                  </h1>
                </div>
                <div className="space-y-6">
                  <p className="max-w-110 text-lg text-white">{description}</p>
                  <Button asChild>
                    <a href={cta.href}>{cta.label}</a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="basis-80 self-center xl:basis-130">
              <div className="mx-auto max-w-70 xl:max-w-95">
                <Carousel
                  opts={{
                    loop: true,
                  }}
                  plugins={[
                    Autoplay({
                      delay: 6000,
                    }),
                  ]}
                >
                  <CarouselContent>
                    {products.map((product, index) => (
                      <CarouselItem key={index}>
                        <ProductCard {...product} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="hidden sm:contents">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const ProductCard = ({ image, name, price }: ProductCardProps) => {
  const { regular, sale, currency } = price;

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="relative gap-0 p-0">
        <img
          src={image}
          alt={name}
          className="block aspect-square size-full object-cover object-center"
        />
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex px-9 py-7">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-1 text-lg">{name}</CardTitle>
            <Price onSale={sale != null} className="text-sm font-semibold">
              <PriceValue
                price={sale}
                currency={currency}
                variant="sale"
                className="text-muted-foreground"
              />
              <PriceValue
                price={regular}
                currency={currency}
                variant="regular"
                className="text-muted-foreground"
              />
            </Price>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { EcommerceHero3 };
