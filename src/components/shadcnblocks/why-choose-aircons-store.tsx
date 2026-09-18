import Image from "next/image";
import {
  BadgeCheck,
  BadgeDollarSign,
  ArrowRight,
  Headphones,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    heading: "Accredited Installers",
    description: "Qualified professionals trained to industry standards.",
  },
  {
    icon: ShieldCheck,
    heading: "Warranty Protected",
    description: "Manufacturer guidelines are followed to protect your warranty.",
  },
  {
    icon: BadgeDollarSign,
    heading: "Fixed Transparent Pricing",
    description: "Know exactly what you are paying before installation begins.",
  },
  {
    icon: Wrench,
    heading: "Professional Equipment",
    description: "Vacuum pumps, pressure testing and calibrated tools.",
  },
  {
    icon: Headphones,
    heading: "Ongoing Support",
    description: "We are here long after installation is complete.",
  },
];

export function WhyChooseAirconsStore() {
  return (
    <section className="w-full bg-white py-24" aria-labelledby="why-choose-heading">
      <div className="mx-auto grid max-w-[1280px] items-start gap-16 lg:grid-cols-[58fr_42fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#EDF2F7]">
          <Image
            src="/Installation page picsh/why choose us on isntallation.webp"
            alt="An Aircons Store installer explaining an air conditioner installation to homeowners"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={100}
            unoptimized
          />
        </div>

        <div>
          <p className="mb-4 font-[var(--font-google-sans-flex)] text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">
            Why Choose Aircons Store
          </p>
          <h2
            id="why-choose-heading"
            className="max-w-[560px] font-[var(--font-google-sans-flex)] text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-[44px]"
          >
            Installed Right.
            <br />
            Every Time.
          </h2>
          <p className="mt-6 max-w-[600px] font-[var(--font-google-sans-flex)] text-base leading-[1.7] text-muted-foreground">
            Accredited professionals. Premium workmanship. No shortcuts.
          </p>

          <div className="mt-10">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.heading}
                  className="group/feature flex min-h-[76px] items-center gap-4 border-b border-[#EDF2F7] py-4 transition-colors duration-200 hover:bg-[#F8FBFD]"
                >
                  <Icon className="size-5 shrink-0 text-[#1C99D6] transition-transform duration-200 group-hover/feature:scale-105" strokeWidth={1.7} />
                  <div className="min-w-0">
                    <h3 className="font-[var(--font-google-sans-flex)] text-base font-medium text-foreground transition-colors duration-200 group-hover/feature:text-[#1C99D6]">
                      {feature.heading}
                    </h3>
                    <p className="mt-1 font-[var(--font-google-sans-flex)] text-sm leading-[1.5] text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-[#1C99D6] opacity-0 transition-all duration-200 group-hover/feature:translate-x-1 group-hover/feature:opacity-100" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
