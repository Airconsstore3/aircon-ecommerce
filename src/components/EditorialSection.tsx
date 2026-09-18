"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EditorialSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[380px] md:h-[450px] lg:h-[650px] overflow-hidden mb-24"
    >
      {/* Full-width background image */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <Image
          src="/Hero Images/full-width-aircon.webp"
          alt="Modern interior with premium wall-mounted air conditioner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Centered content - left aligned within block */}
      <div className="relative z-10 h-full w-full flex items-center px-6 md:px-16 lg:px-24">
        <div className="flex flex-col items-start text-left max-w-[640px]">
          {/* Eyebrow */}
          <span
            className={cn(
              "mb-4 block font-[var(--font-google-sans-flex)] text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]",
              "opacity-0 translate-y-6 transition-all duration-500",
              isVisible && "opacity-100 translate-y-0"
            )}
          >
            WHY AIRCONS STORE
          </span>

          {/* Heading */}
          <h2
            className={cn(
              "font-[var(--font-google-sans-flex)] max-w-[320px] md:max-w-[520px] text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-white",
              "opacity-0 translate-y-6 transition-all duration-500 delay-100",
              isVisible && "opacity-100 translate-y-0"
            )}
          >
            Find Your Perfect
            <br />
            Air Conditioner
          </h2>

          {/* Paragraph */}
          <p
            className={cn(
              "mt-5 font-[var(--font-google-sans-flex)] text-[15px] md:text-[17px] font-normal leading-[1.6] text-white/90 max-w-[300px] md:max-w-[480px]",
              "opacity-0 translate-y-6 transition-all duration-500 delay-200",
              isVisible && "opacity-100 translate-y-0"
            )}
          >
            Expert guidance to help you choose the right system for your home or business.
          </p>

          {/* Buttons */}
          <div
            className={cn(
              "mt-6 flex flex-col sm:flex-row items-start gap-4",
              "opacity-0 translate-y-6 transition-all duration-500 delay-300",
              isVisible && "opacity-100 translate-y-0"
            )}
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-[#1C99D6] px-8 h-[48px] font-[var(--font-google-sans-flex)] text-sm font-medium text-white transition-all duration-250 hover:bg-[#1680b0] hover:scale-[1.02]"
            >
              Get Expert Advice
            </Link>
            <Link
              href="/products"
              className="mt-4 sm:mt-0 font-[var(--font-google-sans-flex)] text-sm font-medium text-white transition-all duration-250 hover:text-white/80 hover:scale-[1.02] inline-flex items-center h-[48px]"
            >
              Browse All Air Conditioners →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
