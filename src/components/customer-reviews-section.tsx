"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  review: string;
  verified: boolean;
}

interface CustomerReviewsSectionProps {
  reviews?: Review[];
  googleReviewsUrl?: string;
  className?: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Michael S.",
    city: "Cape Town",
    rating: 5,
    review:
      "Excellent service from start to finish. Delivery was fast and the installation team was professional and tidy.",
    verified: true,
  },
  {
    id: "2",
    name: "Sarah N.",
    city: "Durban",
    rating: 5,
    review:
      "The team helped me pick the right unit for my living room. It's quiet, efficient, and was installed the next day.",
    verified: true,
  },
  {
    id: "3",
    name: "Thabo M.",
    city: "Johannesburg",
    rating: 5,
    review:
      "Bought a Samsung inverter unit and booked installation online. Seamless process from purchase to setup.",
    verified: true,
  },
  {
    id: "4",
    name: "Lerato K.",
    city: "Pretoria",
    rating: 5,
    review:
      "Really impressed with the after-sales support. They followed up after installation to make sure everything was working perfectly.",
    verified: true,
  },
  {
    id: "5",
    name: "James v.",
    city: "Stellenbosch",
    rating: 5,
    review:
      "Competitive pricing and genuine products with full warranty. The specialist's recommendation was spot on for my home office.",
    verified: true,
  },
  {
    id: "6",
    name: "Aisha P.",
    city: "Port Elizabeth",
    rating: 5,
    review:
      "From ordering to delivery to installation — everything happened exactly when they said it would. Highly recommend Aircons Store.",
    verified: true,
  },
];

const FONT_CLASS = "font-[var(--font-google-sans-flex)]";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-[#1C99D6] text-[#1C99D6]" : "fill-[#E5E7EB] text-[#E5E7EB]",
          )}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="group flex h-full flex-col rounded-[18px] border border-[#EAEAEA] bg-white p-8 transition-all duration-[250ms] ease-out hover:border-[#1C99D6] hover:-translate-y-0.5">
      <StarRow rating={review.rating} />

      <p className={`${FONT_CLASS} mt-5 text-[17px] font-normal leading-[1.6] text-[#111111]`}>
        &ldquo;{review.review}&rdquo;
      </p>

      <div className="mt-auto pt-6">
        <p className={`${FONT_CLASS} text-[16px] font-semibold leading-tight text-[#111111]`}>
          {review.name}
        </p>
        <p className={`${FONT_CLASS} mt-1 text-[15px] font-normal text-[#9CA3AF]`}>
          {review.city}
        </p>
        {review.verified && (
          <span className={`mt-3 inline-flex items-center gap-1.5 ${FONT_CLASS} text-[13px] font-medium text-[#1C99D6]`}>
            <BadgeCheck className="size-4" strokeWidth={1.5} />
            Verified Customer
          </span>
        )}
      </div>
    </div>
  );
}

const CustomerReviewsSection = ({
  reviews = DEFAULT_REVIEWS,
  googleReviewsUrl = "https://www.google.com/search?q=Aircons+Store+reviews",
  className,
}: CustomerReviewsSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && activeSlide < reviews.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else if (diff < 0 && activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={cn("w-full bg-white pt-24 pb-24", className)}
    >
      <div className="mx-auto max-w-[95%] px-4 md:px-6">
        {/* Header */}
        <div className="mx-auto max-w-[700px] text-center">
          <span
            className={cn(
              `mb-4 block ${FONT_CLASS} text-[14px] font-semibold uppercase tracking-[0.12em] text-[#1C99D6]`,
              "transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Customer Reviews
          </span>
          <h2
            className={cn(
              `${FONT_CLASS} text-[34px] md:text-[48px] font-medium leading-[1.08] tracking-tight text-black`,
              "transition-all duration-500 delay-75",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Trusted by Homeowners Across South Africa
          </h2>
          <p
            className={cn(
              `${FONT_CLASS} mt-5 text-[18px] font-normal leading-relaxed text-[#5F6B7A] max-w-[520px] mx-auto`,
              "transition-all duration-500 delay-150",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            See what customers say about our products, delivery and professional installation services.
          </p>
        </div>

        {/* Desktop: 3-column grid */}
        <div
          className={cn(
            "mt-16 hidden md:grid md:grid-cols-3 gap-6 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {reviews.slice(0, 3).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Mobile: swipeable carousel */}
        <div
          className={cn(
            "mt-12 md:hidden transition-all duration-700 delay-200",
            isVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-[300ms] ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full shrink-0 px-1">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to review ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-250",
                  activeSlide === index ? "w-6 bg-[#1C99D6]" : "w-2 bg-[#D1D5DB]",
                )}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className={cn(
            "mt-16 text-center transition-all duration-500 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <Link
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${FONT_CLASS} inline-flex items-center gap-2 text-[15px] font-medium text-[#1C99D6] transition-all duration-250 hover:gap-3`}
          >
            View All Google Reviews
            <svg className="size-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export { CustomerReviewsSection };
