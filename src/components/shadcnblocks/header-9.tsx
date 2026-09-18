"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageProps = {
  src: string;
  alt?: string;
};

type ButtonProps = {
  title: string;
  href?: string;
  variant?: "default" | "secondary" | "outline";
};

type Props = {
  heading: string;
  description: string;
  buttons: ButtonProps[];
  image: ImageProps;
};

export type Header9Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Header9Defaults: Props = {
  heading: "Medium length hero heading goes here",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  buttons: [
    { title: "Button", href: "#", variant: "default" },
    { title: "Button", href: "#", variant: "secondary" },
  ],
  image: {
    src: "/AIRCON HOME.webp",
    alt: "Aircon installation hero image",
  },
};

export const Header9 = (props: Header9Props) => {
  const { heading, description, buttons, image } = {
    ...Header9Defaults,
    ...props,
  };

  return (
    <section id="relume" className="relative flex h-[80svh] min-h-[600px] flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image.src}
          alt={image.alt ?? ""}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 size-full object-cover"
        />
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/70 via-[#0A2540]/40 to-[#0A2540]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-end px-[5%] pb-12 md:pb-18 lg:pb-20">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="grid grid-rows-1 items-end gap-y-5 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:gap-x-20 lg:gap-y-16">
            <h1 className="font-[var(--font-google-sans-flex)] text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
              {heading}
            </h1>
            <div>
              <p className="max-w-md text-base leading-relaxed text-white/85 md:text-lg">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
                {buttons.map((button, index) => (
                  <Link
                    key={index}
                    href={button.href ?? "#"}
                    className={cn(
                      buttonVariants({ variant: button.variant ?? "default" }),
                      "h-11 px-6 text-sm font-medium"
                    )}
                  >
                    {button.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
