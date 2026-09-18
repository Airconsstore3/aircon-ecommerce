"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Review {
  id: string;
  name: string;
  suburb: string;
  rating: number;
  review: string;
  verified: boolean;
  purchaseType: string;
  purchaseDate?: string;
  avatarUrl?: string;
}

interface CustomerReviewsCarouselProps {
  reviews?: Review[];
  googleRating?: number;
  reviewCount?: number;
  trustpilotScore?: string;
  trustpilotReviewCount?: string;
  trustpilotHref?: string;
  className?: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Sarah Williams",
    suburb: "Somerset West",
    rating: 5,
    review:
      "I wasn't sure which size unit to buy, but the team recommended the perfect option for our lounge. Installation was clean and completed in one afternoon.",
    verified: true,
    purchaseType: "LG DualCool Inverter",
    avatarUrl: "/avatars/review-1.jpg",
  },
  {
    id: "2",
    name: "David Botha",
    suburb: "Bellville",
    rating: 5,
    review:
      "Ordered on Tuesday and the air conditioner was delivered the next morning. Booking installation was quick and everything worked perfectly from the start.",
    verified: true,
    purchaseType: "Samsung AR9500",
    avatarUrl: "/avatars/review-2.jpg",
  },
  {
    id: "3",
    name: "Megan Roberts",
    suburb: "Claremont",
    rating: 5,
    review:
      "The technicians were professional, protected our floors and cleaned up before leaving. It honestly felt like a premium service from start to finish.",
    verified: true,
    purchaseType: "Daikin Perfera",
    avatarUrl: "/avatars/review-3.jpg",
  },
  {
    id: "4",
    name: "Michael Jacobs",
    suburb: "Durbanville",
    rating: 5,
    review:
      "The installation team arrived exactly on time and completed everything neatly. They explained how to use the system before leaving. Really impressed with the whole experience.",
    verified: true,
    purchaseType: "Samsung AR9500 Installation",
    avatarUrl: "/avatars/review-4.jpg",
  },
  {
    id: "5",
    name: "Jennifer Naidoo",
    suburb: "Sea Point",
    rating: 5,
    review:
      "Living in a flat, I was worried about noise. The unit they recommended is whisper quiet and cools the entire space in minutes. The specialist really understood my needs.",
    verified: true,
    purchaseType: "Hisense Infinity",
    avatarUrl: "/avatars/review-5.jpg",
  },
  {
    id: "6",
    name: "Peter Mark",
    suburb: "Blouberg",
    rating: 5,
    review:
      "We replaced three old units with inverter systems and the difference in our electricity bill is noticeable. The team handled the removal and installation in a single day.",
    verified: true,
    purchaseType: "Alliance Inverter x3",
    avatarUrl: "/avatars/review-6.jpg",
  },
  {
    id: "7",
    name: "Zainab Adams",
    suburb: "Newlands",
    rating: 5,
    review:
      "What stood out was the follow-up. A week after installation they called to check everything was running well. That level of care is rare these days.",
    verified: true,
    purchaseType: "Gree U-Crown",
    avatarUrl: "/avatars/review-7.jpg",
  },
  {
    id: "8",
    name: "Ricardo Ferreira",
    suburb: "Stellenbosch",
    rating: 5,
    review:
      "I compared prices everywhere and Aircons Store came in lower with better service. The unit arrived with full warranty documentation and was installed two days later.",
    verified: true,
    purchaseType: "Midea Blanc",
    avatarUrl: "/avatars/review-8.jpg",
  },
];

const FONT_CLASS = "font-[var(--font-google-sans-flex)]";

function StarRow({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size,
            i < rating ? "fill-[#EAB308] text-[#EAB308]" : "fill-[#E5E7EB] text-[#E5E7EB]",
          )}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="group flex h-full flex-col rounded-none border border-[#E6EDF5] bg-white p-7 md:p-8 transition-all duration-[250ms] ease-out hover:border-[#1C99D6]">
      <StarRow rating={review.rating} />

      <p className={`${FONT_CLASS} mt-6 text-[18px] font-normal leading-[1.65] text-[#0F172A]`}>
        &ldquo;{review.review}&rdquo;
      </p>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3">
          {review.avatarUrl ? (
            <Image
              src={review.avatarUrl}
              alt={review.name}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F0F9FF] ${FONT_CLASS} text-[15px] font-semibold text-[#1C99D6]`}>
              {review.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <p className={`${FONT_CLASS} text-[16px] font-semibold leading-tight text-[#111111]`}>
              {review.name}
            </p>
            <p className={`${FONT_CLASS} mt-0.5 text-[15px] font-normal text-[#9CA3AF]`}>
              {review.suburb}
            </p>
          </div>
        </div>
        {review.verified && (
          <span className={`mt-3 inline-flex items-center gap-1.5 ${FONT_CLASS} text-[13px] font-medium text-[#1C99D6]`}>
            <BadgeCheck className="size-4" strokeWidth={1.5} />
            Verified Customer
          </span>
        )}
        <p className={`${FONT_CLASS} mt-3 text-[13px] font-normal text-[#9CA3AF]`}>
          {review.purchaseType}
          {review.purchaseDate && <span className="ml-1">· {review.purchaseDate}</span>}
        </p>
      </div>
    </div>
  );
}

function useCardsPerView() {
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 768) setCardsPerView(1);
      else if (w < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cardsPerView;
}

const CustomerReviewsCarousel = ({
  reviews = DEFAULT_REVIEWS,
  googleRating = 4.9,
  reviewCount = 350,
  trustpilotScore = "4.9",
  trustpilotReviewCount = "48677",
  trustpilotHref = "",
  className,
}: CustomerReviewsCarouselProps) => {
  const cardsPerView = useCardsPerView();
  const [currentIndex, setCurrentIndex] = useState(reviews.length);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const tripled = [...reviews, ...reviews, ...reviews];
  const totalSlides = reviews.length;

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

  const goTo = useCallback(
    (index: number) => {
      setIsTransitioning(true);
      setCurrentIndex(index);
    },
    [],
  );

  const next = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const prev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  const handleTransitionEnd = () => {
    if (currentIndex >= totalSlides * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - totalSlides);
    } else if (currentIndex < totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + totalSlides);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) next();
    else prev();
  };

  const cardWidthPercent = 100 / cardsPerView;
  const translateX = -(currentIndex * cardWidthPercent);

  const dotIndex = ((currentIndex - totalSlides) % totalSlides + totalSlides) % totalSlides;

  return (
    <section
      ref={sectionRef}
      className={cn("w-full bg-white pt-16 pb-12 md:pt-24 md:pb-24", className)}
    >
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6">
        {/* Header — center-aligned, narrower on mobile for natural 2-3 line wrap */}
        <div className="mx-auto max-w-[300px] md:max-w-[700px] text-center">
          <span
            className={cn(
              `mb-4 block ${FONT_CLASS} text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]`,
              "transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Customer Reviews
          </span>
          <h2
            className={cn(
              `${FONT_CLASS} max-w-[320px] md:max-w-[520px] mx-auto text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black`,
              "transition-all duration-500 delay-75",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Trusted by Cape Town Homeowners
          </h2>
          <p
            className={cn(
              `${FONT_CLASS} mt-6 text-[16px] md:text-[18px] font-normal leading-[1.65] text-[#5E6B7A] max-w-[320px] md:max-w-[520px] mx-auto`,
              "transition-all duration-500 delay-150",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Join thousands of homeowners across Cape Town who trust Aircons Store for expert advice, installation and support.
          </p>
        </div>

        {/* Unified Google rating block — stacked vertically on mobile:
            stars → 10px → rating → 6px → reviews. Centered. */}
        <div
          className={cn(
            "mt-10 flex flex-col items-center gap-9 md:flex-row md:justify-center md:gap-8 transition-all duration-500 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {/* Google rating — stacked vertically on mobile */}
          <div className="flex flex-col items-center md:flex-row md:gap-2">
            <StarRow rating={5} size="size-4" />
            <span className={`${FONT_CLASS} mt-2.5 md:mt-0 md:ml-2 text-[15px] font-semibold text-[#111111]`}>
              {googleRating} Google Rating
            </span>
            <span className={`${FONT_CLASS} mt-1.5 md:mt-0 md:ml-2 text-[14px] font-normal text-[#9CA3AF]`}>
              {reviewCount}+ verified reviews
            </span>
          </div>

          {/* Divider — desktop only */}
          <span className="hidden md:block w-px h-6 bg-[#E5E7EB]" />

          {/* Trustpilot card — full width on mobile (matches carousel cards),
              capped at 340px on desktop. 36px gap from rating on mobile. */}
          <a
            href={trustpilotHref || undefined}
            className={`flex w-full items-center gap-4 rounded-none border border-[#E6EDF5] bg-white px-7 py-5 transition-all duration-250 hover:border-[#1C99D6] md:max-w-[340px] md:px-6 md:py-4 ${trustpilotHref ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`Trustpilot TrustScore ${trustpilotScore} out of 5, ${trustpilotReviewCount} reviews`}
          >
            <div className="flex items-center gap-2.5">
              <Image
                src="/trustpilot/stars-5.svg"
                alt={`TrustScore ${trustpilotScore} out of 5`}
                width={20}
                height={20}
                className="h-5 w-auto"
              />
              <span className={`${FONT_CLASS} text-[15px] font-bold text-[#111111]`}>
                {trustpilotScore}
              </span>
            </div>
            <span className={`h-6 w-px bg-[#E5E7EB]`} />
            <div className="flex flex-col leading-tight gap-0.5">
              <span className={`${FONT_CLASS} text-[13px] font-semibold text-[#111111]`}>
                Trustpilot
              </span>
              <span className={`${FONT_CLASS} text-[12px] font-normal text-[#9CA3AF]`}>
                {trustpilotReviewCount} reviews
              </span>
            </div>
          </a>
        </div>

        {/* Carousel */}
        <div
          className={cn(
            "mt-10 md:mt-16 transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          {/* Carousel viewport */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={cn(
                "flex",
                isTransitioning ? "transition-transform duration-[400ms] ease-out" : "",
              )}
              style={{
                transform: `translateX(${translateX}%)`,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {tripled.map((review, i) => (
                <div
                  key={`${review.id}-${i}`}
                  className="shrink-0 md:px-3"
                  style={{ width: `${cardWidthPercent}%` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 md:mt-10 flex items-center justify-between">
            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(totalSlides + index)}
                  aria-label={`Go to review ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-250",
                    dotIndex === index ? "w-6 bg-[#1C99D6]" : "w-2 bg-[#D1D5DB] hover:bg-[#B0B0B0]",
                  )}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                aria-label="Previous reviews"
                className="flex size-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#111111] transition-all duration-250 hover:border-[#1C99D6] hover:text-[#1C99D6]"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                aria-label="Next reviews"
                className="flex size-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#111111] transition-all duration-250 hover:border-[#1C99D6] hover:text-[#1C99D6]"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { CustomerReviewsCarousel };
