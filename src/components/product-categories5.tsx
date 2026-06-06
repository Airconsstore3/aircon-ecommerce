import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageMedia = {
  type: "image";
  alt: string;
  src: string;
  srcSet?: string;
  sizes?: string;
};

type VideoMedia = {
  type: "video";
  src: string;
};

type MediaItem = ImageMedia | VideoMedia;

interface ProductCategory {
  title: string;
  text: string;
  link: string;
  cta?: {
    link: string;
    text: string;
  };
  media: MediaItem;
}

interface ProductCategories5Props {
  categories?: ProductCategory[];
  className?: string;
}

const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    title: "Buy aircon today",
    text: "And get free installation kit",
    link: "#",
    media: {
      type: "image",
      src: "/Hero Images/Featured In section/Instaqllation packages promo/installation  package small.png",
      alt: "Installation packages",
    },
  },
  {
    title: "Installation Package",
    text: "Add installation and maintenance to your order for a great discount",
    cta: {
      link: "#",
      text: "Get your discount",
    },
    link: "#",
    media: {
      type: "image",
      src: "/Hero Images/Featured In section/Instaqllation packages promo/installation  package big.png",
      alt: "Installation packages",
    },
  },
];

const ProductCategories5 = ({
  categories = PRODUCT_CATEGORIES,
  className,
}: ProductCategories5Props) => {
  const category1 = categories[0];
  const category2 = categories[1];

  return (
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <div className="grid grid-cols-1 border lg:grid-cols-2 xl:grid-cols-3">
          <div className="col-span-1">
            <div className="relative aspect-square size-full px-10.5 py-8 lg:aspect-auto lg:min-h-150">
              <div className="absolute inset-0 z-0">
                {category1.media.type === "image" && (
                  <img
                    src={category1.media.src}
                    alt={category1.media.alt}
                    className="size-full object-cover object-center"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="relative z-20">
                <h3 className="mb-1 text-3xl leading-tight font-semibold text-white sm:text-4xl font-[var(--font-google-sans-flex)]">
                  {category1.title}
                </h3>
                <p className="text-xl leading-tight text-white sm:text-2xl font-[var(--font-google-sans-flex)]">
                  {category1.text}
                </p>
              </div>
              <div className="absolute end-4 bottom-4 z-20">
                <div className="aircon-angled-button-wrap">
                  <Button
                    asChild
                    variant="ghost"
                    className="aircon-angled-button h-auto rounded-none hover:bg-transparent text-white"
                  >
                    <a href={category1.link}>Buy Now</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="xl:col-span-2">
            <div className="relative aspect-square size-full px-10.5 py-8 lg:aspect-auto lg:min-h-150">
              <div className="absolute inset-0 z-0">
                {category2.media.type === "image" && (
                  <img
                    sizes={category2.media?.sizes}
                    srcSet={category2.media?.srcSet}
                    src={category2.media.src}
                    alt=""
                    className="size-full object-cover object-[50%_30%]"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <div className="relative z-20 flex size-full flex-col items-center justify-end gap-3 pb-6.5">
                <div>
                  <h2 className="mb-1 text-center text-3xl leading-tight font-semibold text-white sm:text-4xl font-[var(--font-google-sans-flex)]">
                    {category2.title}
                  </h2>
                  <p className="text-center text-xl leading-tight text-white sm:text-2xl font-[var(--font-google-sans-flex)]">
                    {category2.text}
                  </p>
                </div>
                {category2.cta && (
                  <div className="aircon-angled-button-wrap">
                    <Button
                      asChild
                      variant="ghost"
                      className="aircon-angled-button h-auto rounded-none hover:bg-transparent text-white font-[var(--font-google-sans-flex)]"
                    >
                      <a href={category2.cta.link}>{category2.cta.text}</a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="absolute end-4 bottom-4 z-20">
                <Button size="icon" className="size-11 rounded-full" asChild>
                  <a href={category2.link}>
                    <ShoppingBag />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductCategories5 };
