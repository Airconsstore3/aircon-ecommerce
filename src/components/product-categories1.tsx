import { cn } from "@/lib/utils";

type CategoryImage = {
  src: string;
  srcset?: string;
  alt: string;
  sizes?: string;
};

interface ProductCategories {
  title: string;
  summary: string;
  image: CategoryImage;
}

type ProductCategories1Props = Partial<ProductCategories> & { className?: string };

const PRODUCT_CATEGORIES: ProductCategories | null = null;

const ProductCategories1 = ({
  title,
  summary,
  image = { src: "", alt: "" },
  className,
}: ProductCategories1Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-muted max-md:grid-rows-[repeat(2,minmax(13.75rem,1fr))] md:min-h-91.5 md:grid-cols-2">
          <div className="flex h-full place-content-center place-items-center px-20 py-8">
            <div className="flex flex-col gap-3">
              <h1 className="animate-in text-center text-4xl leading-relaxed font-medium duration-600 ease-in slide-in-from-bottom-50 fade-in">
                {title}
              </h1>
              <p className="animate-in text-center text-lg leading-normal text-balance duration-600 ease-in slide-in-from-bottom-50 fade-in">
                {summary}
              </p>
            </div>
          </div>
          <div className="relative h-full overflow-hidden">
            <img
              src={image.src}
              alt={image.src}
              srcSet={image.srcset}
              sizes={image.sizes}
              className="absolute inset-0 size-full origin-center animate-in object-cover object-center duration-600 ease-in zoom-in-140"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductCategories1 };
