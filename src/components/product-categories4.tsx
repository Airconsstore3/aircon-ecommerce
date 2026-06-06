import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type BreadcrumbLink = {
  link?: string;
  label: string;
};

interface ProductCategory {
  title?: string;
  description?: string;
  background?: string;
}

interface ProductCategories4Props extends ProductCategory {
  breadcrumb?: BreadcrumbLink[];
  className?: string;
}

const BreadcrumbLinks = [
  {
    label: "Home",
  },
  {
    label: "Handbags",
    link: "#",
  },
];

const PRODUCT_CATEGORY: ProductCategory = {
  background:
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/Luxurious-Handbag-Display-2.png",
  title: "Handbags",
  description:
    "Explore our collection of handbags, designed for style and practicality to complement every occasion.",
};

const ProductCategories4 = ({
  breadcrumb = BreadcrumbLinks,
  title = PRODUCT_CATEGORY.title,
  description = PRODUCT_CATEGORY.description,
  background = PRODUCT_CATEGORY.background,
  className,
}: ProductCategories4Props = {}) => {
  return (
    <section className={cn("py-32", className)}>
      <div
        style={{
          backgroundImage: `url(${background})`,
        }}
        className="relative bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/30"
      >
        <div className="relative z-10 w-full flex min-h-80 flex-col py-4 px-4 sm:px-20">
          <div>
            <ProductsCategoryBreadcrumb links={breadcrumb} />
          </div>
          <div className="flex flex-1 items-start">
            <div className="space-y-4">
              <h1 className="text-2xl leading-tight font-normal text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="max-w-100 text-balance text-white/80">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductsCategoryBreadcrumb = ({ links }: { links: BreadcrumbLink[] }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {links.map(({ label, link }, index) => {
          const isLast = index === links.length - 1;

          return (
            <Fragment key={label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-white/70">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={link}
                    className="cursor-pointer text-white/70 hover:text-white"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="text-white/70">
                  /
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export { ProductCategories4 };
