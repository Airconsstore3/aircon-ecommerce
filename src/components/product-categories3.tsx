import { cn } from "@/lib/utils";

const PRODUCT_CATEGORIES = {
  title: "Accessories",
  summary: "Reliable and stylish shirts for plant work",
  image: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/accessories/Gold-Heart-Earrings-2.png",
    alt: "",
  },
};

interface ProductCategories3Props {
  title?: string;
  summary?: string;
  image?: {
    src: string;
    alt: string;
  };
  className?: string;
}

const ProductCategories3 = ({
  title = PRODUCT_CATEGORIES.title,
  summary = PRODUCT_CATEGORIES.summary,
  image = PRODUCT_CATEGORIES.image,
  className,
}: ProductCategories3Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <div className="relative flex min-h-75 items-center justify-center overflow-hidden rounded-xl before:absolute before:inset-0 before:z-20 before:size-full before:bg-black/30">
          <div className="relative z-30 flex size-full flex-col gap-3 px-6 py-8 md:px-10 lg:px-20">
            <h1 className="text-center text-4xl font-normal text-white sm:text-5xl">
              {title}
            </h1>
            <p className="text-center text-lg text-white">{summary}</p>
          </div>
          <div className="absolute inset-0 animate-in duration-700 zoom-in-150">
            <img
              src={image.src}
              alt={image.alt}
              className="size-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductCategories3 };
