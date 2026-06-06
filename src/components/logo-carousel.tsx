"use client";

import { cn } from "@/lib/utils";

interface LogoCarouselProps {
  className?: string;
}

const logos = [
  {
    id: "logo-samsung",
    description: "Samsung aircon near you",
    image: "/Hero Images/aircon coursel logo/samsung aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-lg",
    description: "LG aircon near you",
    image: "/Hero Images/aircon coursel logo/lg aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-daikin",
    description: "Daikin aircon near you",
    image: "/Hero Images/aircon coursel logo/daikin aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-carrier",
    description: "Carrier aircon near you",
    image: "/Hero Images/aircon coursel logo/carrier aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-hisense",
    description: "Hisense aircon near you",
    image: "/Hero Images/aircon coursel logo/hisense aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-midea",
    description: "Midea aircon near you",
    image: "/Hero Images/aircon coursel logo/midea aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-york",
    description: "York aircon near you",
    image: "/Hero Images/aircon coursel logo/york aircon.png",
    className: "h-14 w-auto",
  },
  {
    id: "logo-alliance",
    description: "Alliance aircon near you",
    image: "/Hero Images/aircon coursel logo/alliance aircon.png",
    className: "h-14 w-auto",
  },
];

const marqueeCss = `
  @keyframes logo-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .logo-marquee-track {
    display: flex;
    width: max-content;
    animation: logo-marquee 40s linear infinite;
  }
  .logo-marquee-track:hover {
    animation-play-state: paused;
  }
`;

const LogoCarousel = ({ className }: LogoCarouselProps) => {
  const loopLogos = [...logos, ...logos];
  return (
    <section className={cn("relative overflow-hidden pt-16 pb-8 md:pt-20", className)}>
      <style>{marqueeCss}</style>
      <div className="mx-auto mb-10 flex max-w-screen-xl flex-col items-center px-4 text-center">
        <span className="mb-3 font-[var(--font-google-sans-flex)] text-xs font-semibold uppercase tracking-[0.25em] text-[#1C99D6]">
          Trusted Brands
        </span>
        <h4 className="font-[var(--font-google-sans-flex)] text-2xl font-normal tracking-tight text-black md:text-3xl">
          We sell trusted brand aircons near you
        </h4>
      </div>
      <div className="relative mx-auto flex max-w-screen-xl items-center">
        <div className="logo-marquee-track">
          {loopLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="mr-12 flex h-16 shrink-0 items-center justify-center opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0 xl:mr-16"
            >
              <img
                src={logo.image}
                alt={logo.description}
                className={logo.className}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-40" />
    </section>
  );
};

export { LogoCarousel };
