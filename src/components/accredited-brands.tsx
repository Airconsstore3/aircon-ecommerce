"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  image: string;
}

const BRANDS: Brand[] = [
  {
    id: "samsung",
    name: "Samsung",
    image: "/Hero Images/aircon coursel logo/samsung aircon.png",
  },
  {
    id: "alliance",
    name: "Alliance",
    image: "/Hero Images/aircon coursel logo/alliance aircon.png",
  },
  {
    id: "daikin",
    name: "Daikin",
    image: "/Hero Images/aircon coursel logo/daikin aircon.png",
  },
  {
    id: "lg",
    name: "LG",
    image: "/Hero Images/aircon coursel logo/lg aircon.png",
  },
  {
    id: "midea",
    name: "Midea",
    image: "/Hero Images/aircon coursel logo/midea aircon.png",
  },
  {
    id: "hisense",
    name: "Hisense",
    image: "/Hero Images/aircon coursel logo/hisense aircon.png",
  },
];

interface AccreditedBrandsProps {
  className?: string;
}

const AccreditedBrands = ({ className }: AccreditedBrandsProps) => {
  return (
    <section
      className={cn(
        "relative w-full bg-white pt-16 pb-0 md:pt-20 md:pb-20",
        className
      )}
    >
      <div className="mx-auto max-w-[95%] px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 md:mb-14 text-center">
          <span className="mb-4 block font-[var(--font-google-sans-flex)] text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]">
            Accredited Partner Brands
          </span>
          <h2 className="mx-auto max-w-[320px] md:max-w-[520px] font-[var(--font-google-sans-flex)] text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black">
            Accredited by Industry-Leading Brands
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] font-[var(--font-google-sans-flex)] text-base md:text-lg font-normal leading-[1.6] text-[#475569]">
            Authorised installation and support for trusted air conditioning brands.
          </p>
        </div>

        {/* Logo Grid */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 md:gap-x-16 lg:gap-x-20">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="group flex h-16 w-[calc(33.333%-2rem)] items-center justify-center opacity-70 transition-all duration-[250ms] hover:opacity-100 md:w-auto"
            >
              <Image
                src={brand.image}
                alt={brand.name}
                width={140}
                height={56}
                className="h-10 w-auto object-contain transition-transform duration-[250ms] group-hover:scale-[1.02] md:h-12"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { AccreditedBrands };
