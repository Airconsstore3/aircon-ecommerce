"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
}

const SERVICE_CARDS: ServiceCard[] = [
  {
    id: "installation",
    title: "Professional Installation",
    description: "Installation support for the systems we supply — details confirmed when you enquire.",
    image: "/Hero Images/feature-cards/Accredited Installation.webp",
    href: "/installation",
    cta: "Book Installation",
  },
  {
    id: "delivery",
    title: "Delivery",
    description: "Free delivery within Cape Town. Other areas are arranged and timing is confirmed with your order.",
    image: "/Hero Images/feature-cards/Fast Delivery.webp",
    href: "/#faqs",
    cta: "Delivery Information",
  },
  {
    id: "returns",
    title: "Easy Returns",
    description: "If something isn't right, our simple returns process makes it easy to shop with confidence.",
    image: "/Hero Images/feature-cards/Easy Returns.webp",
    href: "/return-policy",
    cta: "View Return Policy",
  },
];

interface ServiceInfoSectionProps {
  className?: string;
}

export function ServiceInfoSection({ className }: ServiceInfoSectionProps) {
  return (
    <section className={cn("w-full bg-white pt-14 pb-0 md:pt-24 md:pb-24", className)}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {SERVICE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-[6px] border border-[#EAEAEA] bg-white transition-all duration-300 hover:shadow-lg hover:border-[#1C99D6]"
            >
              {/* Image */}
              <div className="relative h-[240px] md:h-[460px] w-full overflow-hidden bg-neutral-50">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={100}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent"
                />
                <h3 className="absolute bottom-5 left-5 right-5 font-[var(--font-google-sans-flex)] text-xl font-medium text-white md:bottom-6 md:left-6 md:right-6">
                  {card.title}
                </h3>
              </div>

              {/* Content */}
              <div className="flex flex-col p-5 md:p-6">
                <p className="font-[var(--font-google-sans-flex)] text-[15px] md:text-base font-normal leading-[1.6] text-[#475569] mb-6 md:mb-8 max-w-[400px] line-clamp-2">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="inline-flex items-center justify-center bg-[#1C99D6] px-6 h-[48px] font-[var(--font-google-sans-flex)] text-sm font-medium text-white transition-all duration-250 hover:bg-[#1680b0] hover:scale-[1.02] mt-auto"
                >
                  {card.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
