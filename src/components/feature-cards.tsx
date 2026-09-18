"use client";

import { Truck, ShieldCheck, Wrench, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBenefit {
  id: string;
  icon: React.ReactNode;
  heading: string;
  description: string;
}

const TRUST_BENEFITS: TrustBenefit[] = [
  {
    id: "delivery",
    icon: <Truck className="size-6" />,
    heading: "Fast Delivery",
    description: "Cape Town 24–48 hours. Nationwide 3–5 business days.",
  },
  {
    id: "warranty",
    icon: <ShieldCheck className="size-6" />,
    heading: "Manufacturer Warranty",
    description: "Genuine products backed by official manufacturer warranties.",
  },
  {
    id: "installation",
    icon: <Wrench className="size-6" />,
    heading: "Professional Installation",
    description: "Book experienced installation when purchasing your air conditioner.",
  },
  {
    id: "advice",
    icon: <Headset className="size-6" />,
    heading: "Expert Advice",
    description: "Our specialists help you choose the right system for your space.",
  },
];

interface FeatureCardsProps {
  className?: string;
}

const FeatureCards = ({ className }: FeatureCardsProps) => {
  return (
    <section
      className={cn(
        "relative w-full bg-white pt-24 pb-0",
        className
      )}
    >
      <div className="mx-auto max-w-[95%] px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <span className="mb-3 block font-[var(--font-google-sans-flex)] text-xs font-semibold uppercase tracking-[0.12em] text-[#1C99D6]">
            WHY SHOP WITH AIRCONS STORE
          </span>
        </div>

        {/* Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {TRUST_BENEFITS.map((benefit, index) => (
            <div
              key={benefit.id}
              className={cn(
                "group relative h-[220px] flex flex-col items-center justify-center px-6 transition-colors duration-250 ease hover:bg-[#FAFAFA]",
                index < TRUST_BENEFITS.length - 1 && "lg:border-r border-[#ECECEC]"
              )}
            >
              {/* Icon */}
              <div className="mb-4 text-[#111111]">
                {benefit.icon}
              </div>

              {/* Heading */}
              <h3 className="mb-3 font-[var(--font-google-sans-flex)] text-[22px] font-semibold leading-[1.3] text-[#111111] text-center">
                {benefit.heading}
              </h3>

              {/* Description */}
              <p className="font-[var(--font-google-sans-flex)] text-[16px] font-normal leading-[1.6] text-[#6B7280] text-center max-w-[280px]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureCards };
