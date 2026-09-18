"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditorialSplitProps {
  className?: string;
}

export function EditorialSplit({ className }: EditorialSplitProps) {
  // TODO: Replace with actual lifestyle image meeting spec requirements:
  // - Modern South African home with discreet wall-mounted air conditioner
  // - Room as hero, not the air conditioner
  // - Natural daylight, warm neutral colors, premium furniture, indoor plants
  // - Modern architecture, real photography
  // - No people, text, graphics, or badges
  const lifestyleImage = "/Hero Images/Hero 1.webp";

  return (
    <section
      className={cn(
        "relative w-full bg-white min-h-[760px] md:min-h-[820px]",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[2432px]">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[760px] md:min-h-[820px]">
          {/* Left Column - Lifestyle Image */}
          <div className="relative h-[400px] md:h-auto overflow-hidden">
            <Image
              src={lifestyleImage}
              alt="Modern South African home with discreet wall-mounted air conditioner"
              fill
              className="object-cover animate-in fade-in duration-1000 ease-out"
              priority
            />
          </div>

          {/* Right Column - Editorial Content */}
          <div className="flex items-center justify-center p-8 md:p-16 lg:p-24">
            <div className="w-full max-w-[520px]">
              {/* Eyebrow */}
              <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1C99D6] mb-4 animate-in slide-in-from-bottom-4 duration-700 ease-out">
                DISCOVER COMFORT
              </span>

              {/* Heading */}
              <h2 className="font-[var(--font-google-sans-flex)] text-[42px] md:text-[48px] lg:text-[56px] font-medium leading-[1.08] tracking-tight text-black mb-16 max-w-[700px] line-clamp-2 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-100">
                Designed Around Everyday Comfort
              </h2>

              {/* Body Copy */}
              <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-[1.7] text-[#475569] mb-10 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-200">
                Whether you&apos;re cooling a single room, an entire home or a commercial space, we make it simple to find the right air conditioner from trusted brands, backed by local expertise, installation and ongoing support.
              </p>

              {/* Primary Button */}
              <div className="mb-14 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-300">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-[52px] px-8 bg-[#1C99D6] text-white text-sm font-semibold uppercase tracking-wider rounded-md hover:bg-[#1a8ac4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Shop Aircons →
                </Link>
              </div>

              {/* Trust Highlights */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700 ease-out delay-400">
                <div className="flex items-center gap-2 text-[16px] text-[#475569]">
                  <Check className="size-5 text-[#1C99D6] shrink-0" aria-hidden="true" />
                  <span>Genuine Brands</span>
                </div>
                <div className="flex items-center gap-2 text-[16px] text-[#475569]">
                  <Check className="size-5 text-[#1C99D6] shrink-0" aria-hidden="true" />
                  <span>Installation Available</span>
                </div>
                <div className="flex items-center gap-2 text-[16px] text-[#475569]">
                  <Check className="size-5 text-[#1C99D6] shrink-0" aria-hidden="true" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-[16px] text-[#475569]">
                  <Check className="size-5 text-[#1C99D6] shrink-0" aria-hidden="true" />
                  <span>Manufacturer Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
