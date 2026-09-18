import Image from "next/image";
import Link from "next/link";
import { WhyChooseAirconsStore } from "@/components/shadcnblocks/why-choose-aircons-store";
import { InstallationExperienceSections } from "@/components/shadcnblocks/installation-experience-sections";

type ImageProps = {
  src: string;
  alt?: string;
};

type SectionButton = {
  title: string;
  href: string;
};

type SectionProps = {
  image: ImageProps;
  heading: string;
  description: string;
  button?: SectionButton;
};

type InstallationPackage = {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  features: string[];
  badge: string;
  cta: string;
  href: string;
  note?: string;
  featured?: boolean;
};

type InstallationAddon = {
  name: string;
  description: string;
  group: "Installation Materials" | "Installation Services";
};

type Props = {
  tagline: string;
  heading: string;
  description: string;
  sections: SectionProps[];
  packages: InstallationPackage[];
  optionalExtras: InstallationAddon[];
};

export type Layout239Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

const primaryLinkClassName =
  "inline-flex h-11 items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";

export const Layout239 = (props: Layout239Props) => {
  const { tagline, heading, description, sections, packages, optionalExtras } = {
    ...Layout239Defaults,
    ...props,
  };

  return (
    <section id="relume" className="px-4 pb-16 pt-20 sm:px-6 md:pb-20 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col items-center">
          <div className="w-full text-center">
            <div className="mx-auto w-full max-w-[620px]">
              {tagline && (
                <p className="mb-3 font-[var(--font-google-sans-flex)] text-sm font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {tagline}
                </p>
              )}
              <h1 className="mb-5 font-[var(--font-google-sans-flex)] text-[40px] font-medium leading-[0.95] tracking-tight text-foreground sm:text-[48px] md:text-[56px] lg:text-[64px]">
                {heading}
              </h1>
              <p className="mx-auto max-w-[620px] font-[var(--font-google-sans-flex)] text-lg font-normal leading-[1.6] text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <div className="mt-10 flex w-full flex-wrap justify-center gap-x-8 gap-y-4 border-y border-[#F2F4F6] py-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><span className="tracking-[0.12em] text-[#1C99D6]">★★★★★</span> 4.9 Rating</span>
            <span className="flex items-center gap-2"><span className="font-medium text-foreground">1,500+</span> Installations</span>
            <span className="flex items-center gap-2"><span className="size-2 bg-[#1C99D6]" /> Accredited Installers</span>
            <span className="flex items-center gap-2"><span className="size-2 bg-[#1C99D6]" /> Warranty Protected</span>
          </div>
          <div className="mt-24 grid w-full grid-cols-1 items-stretch gap-10 border-t border-[#F2F4F6] pt-14 md:grid-cols-3">
            {sections.map((section, index) => (
              <Link
                key={index}
                href={section.button?.href ?? "#"}
                className="group/card mx-auto flex h-full w-full max-w-[380px] cursor-pointer flex-col text-center"
              >
                <div className="relative mb-8 aspect-[16/10] w-full overflow-hidden rounded-none border border-[#EDF1F5]">
                  <Image
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-[1.02]"
                    src={section.image.src}
                    alt={section.image.alt ?? ""}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={100}
                    unoptimized
                  />
                </div>
                <h3 className="mb-5 line-clamp-2 min-h-[53px] max-w-[280px] self-center font-[var(--font-google-sans-flex)] text-[22px] font-medium leading-[1.2] text-foreground transition-colors duration-200 group-hover/card:text-primary">
                  {section.heading}
                </h3>
                <p className="max-w-[320px] self-center font-[var(--font-google-sans-flex)] text-base font-normal leading-[1.6] text-muted-foreground">
                  {section.description}
                </p>
                {section.button && (
                  <span className="mt-auto flex w-full justify-center pt-8">
                    <span className={`${primaryLinkClassName} w-[240px] max-w-full group-hover/card:bg-[#1680B0]`}>
                      <span>{section.button.title}</span>
                      <span aria-hidden="true" className="ml-auto transition-transform duration-200 group-hover/card:translate-x-1">→</span>
                    </span>
                  </span>
                )}
              </Link>
            ))}
          </div>

          <section className="mt-24 w-full border-t border-[#F2F4F6] pt-14" aria-labelledby="installation-packages-heading">
            <div className="mb-10 text-center">
              <h2
                id="installation-packages-heading"
                className="font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-foreground md:text-[44px]"
              >
                Installation Packages
              </h2>
              <p className="mx-auto mt-4 max-w-[620px] font-[var(--font-google-sans-flex)] text-base leading-[1.6] text-muted-foreground">
                Choose the installation package that best fits your space and air conditioner setup.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {packages.map((installationPackage) => (
                <article
                  key={installationPackage.name}
                  id={installationPackage.note ? "custom-quote" : undefined}
                  className={`group/package relative flex min-h-[620px] h-full flex-col rounded-lg border p-6 transition-transform duration-200 hover:-translate-y-1 ${
                    installationPackage.featured
                      ? "min-h-[640px] border-2 border-[#1C99D6] bg-[#1C99D6] text-white"
                      : "border-[#EDF1F5] bg-white text-foreground"
                  }`}
                >
                  <div className="mb-5 h-6">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] ${
                        installationPackage.featured ? "bg-white text-[#1C99D6]" : "bg-[#F0F9FF] text-[#1C99D6]"
                      }`}
                    >
                      {installationPackage.badge}
                    </span>
                  </div>
                  <h3 className={`font-[var(--font-google-sans-flex)] text-[22px] font-medium ${installationPackage.featured ? "text-white" : "text-foreground"}`}>
                    {installationPackage.name}
                  </h3>
                  <p className={`mt-2 font-[var(--font-google-sans-flex)] text-sm ${installationPackage.featured ? "text-white/80" : "text-muted-foreground"}`}>
                    {installationPackage.subtitle}
                  </p>
                  <p className={`mt-2 min-h-[32px] font-[var(--font-google-sans-flex)] text-sm leading-[1.6] ${installationPackage.featured ? "text-white/80" : "text-muted-foreground"}`}>
                    {installationPackage.description}
                  </p>
                  {installationPackage.note && (
                    <p className={`mt-3 text-sm font-medium ${installationPackage.featured ? "text-white" : "text-[#1C99D6]"}`}>
                      {installationPackage.note}
                    </p>
                  )}
                  <div
                    className={`mt-6 flex min-h-[72px] items-center border-y py-4 ${
                      installationPackage.featured ? "border-white/25" : "border-[#F2F4F6]"
                    }`}
                  >
                    <p className={`font-[var(--font-google-sans-flex)] text-[30px] font-medium leading-tight ${installationPackage.featured ? "text-white" : "text-foreground"}`}>
                      {installationPackage.price}
                    </p>
                  </div>
                  <ul className="mt-5 space-y-3 pt-0">
                    {installationPackage.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex gap-2 font-[var(--font-google-sans-flex)] text-sm leading-[1.5] ${
                          installationPackage.featured ? "text-white/90" : "text-muted-foreground"
                        }`}
                      >
                        <span className={installationPackage.featured ? "text-white" : "text-[#1C99D6]"} aria-hidden="true">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={installationPackage.href}
                    className={`mt-auto inline-flex h-11 w-full items-center justify-center px-7 text-sm font-semibold tracking-[0.06em] transition-colors duration-200 ${
                      installationPackage.featured
                        ? "bg-white text-[#1C99D6] hover:bg-[#F0F9FF]"
                        : "bg-[#1C99D6] text-white hover:bg-[#1680B0]"
                    }`}
                  >
                    <span>{installationPackage.cta}</span>
                    <span aria-hidden="true" className="ml-auto transition-transform duration-200 group-hover/package:translate-x-1">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-20 w-full border-t border-[#F2F4F6] pt-14" aria-labelledby="optional-extras-heading">
            <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:items-start">
              <div>
                <h2
                  id="optional-extras-heading"
                  className="font-[var(--font-google-sans-flex)] text-2xl font-medium text-foreground md:text-3xl"
                >
                  Installation Add-Ons
                </h2>
                <p className="mt-3 max-w-md font-[var(--font-google-sans-flex)] text-base leading-[1.6] text-muted-foreground">
                  Optional upgrades for a cleaner, more customised installation.
                </p>
                <p className="mt-5 max-w-md text-sm leading-[1.6] text-muted-foreground">
                  Need help deciding? Our accredited installers recommend only the add-ons your installation actually requires.
                </p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                {["Installation Materials", "Installation Services"].map((group) => (
                  <div key={group}>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-foreground">{group}</h3>
                    <ul className="grid gap-5">
                      {optionalExtras.filter((extra) => extra.group === group).map((extra) => (
                        <li
                          key={extra.name}
                          title={extra.description}
                          className="group/addon inline-flex min-h-12 w-full items-center rounded-full border border-[#EDF1F5] bg-white px-4 py-2 font-[var(--font-google-sans-flex)] text-sm text-foreground transition-colors hover:border-[#1C99D6] hover:bg-[#F7FBFF]"
                        >
                          <span className="mr-2 font-medium text-[#1C99D6] transition-transform group-hover/addon:scale-110" aria-hidden="true">✓</span>
                          {extra.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>


          <WhyChooseAirconsStore />
          <InstallationExperienceSections />
        </div>
      </div>
    </section>
  );
};

export const Layout239Defaults: Props = {
  tagline: "",
  heading: "Air Conditioner Installation",
  description:
    "Whether you buy from us or already own an air conditioner, our accredited installers ensure a safe, professional installation.",
  sections: [
    {
      image: {
        src: "/Installation page picsh/Shop Air Conditioners.png",
        alt: "Air conditioner installation service",
      },
      heading: "Shop Air Conditioners",
      description: "Shop leading brands with optional professional installation.",
      button: { title: "Browse Air Conditioners", href: "/products" },
    },
    {
      image: {
        src: "/Installation page picsh/Need Installation.png",
        alt: "Professional air conditioner installation",
      },
      heading: "Need Installation?",
      description: "Book an accredited installer for your existing air conditioner.",
      button: { title: "Book Installation", href: "/installation?intent=installation#book-installation" },
    },
    {
      image: {
        src: "/Installation page picsh/Find an Installer.png",
        alt: "Accredited air conditioner installer",
      },
      heading: "Find an Installer",
      description: "Find an accredited installer near your area.",
      button: { title: "Find Installer", href: "/installation?intent=installer#book-installation" },
    },
  ],
  packages: [
    {
      name: "Home Standard",
      subtitle: "Back-to-Back Installation",
      description: "Most Popular Choice for most homes.",
      price: "Starting from R1 850",
      badge: "Best Value",
      cta: "Book This Package",
      href: "/installation?intent=installation&package=home-standard#book-installation",
      featured: true,
      features: [
        "Indoor unit mounting",
        "Outdoor unit mounting",
        "Up to 3m piping",
        "Drain pipe",
        "Electrical connection",
        "Vacuum & pressure test",
        "Performance testing",
      ],
    },
    {
      name: "Extended Installation",
      subtitle: "Extended Pipe",
      description: "Ideal for longer pipe runs.",
      price: "Request a Quote",
      badge: "Long Pipe Runs",
      cta: "Request a Quote",
      href: "/installation?intent=quote&package=extended-installation#book-installation",
      features: ["Everything in Back-to-Back", "Longer pipe routing", "Extra insulation"],
    },
    {
      name: "Multi-Room System",
      subtitle: "Multi Split",
      description: "For homes with multiple indoor units.",
      price: "Request a Quote",
      badge: "For Large Homes",
      cta: "Request a Quote",
      href: "/installation?intent=quote&package=multi-room-system#book-installation",
      features: ["Multiple indoor units", "Outdoor condenser", "Testing", "Commissioning"],
    },
    {
      name: "Commercial Solutions",
      subtitle: "Commercial",
      description: "Large offices, retail and commercial spaces.",
      price: "Request a Quote",
      badge: "Business Solutions",
      cta: "Request a Quote",
      href: "/installation?intent=quote&package=commercial-solutions#book-installation",
      note: "Need something custom?", 
      features: ["Site assessment", "Professional installation", "Commissioning", "Documentation"],
    },
  ],
  optionalExtras: [
    { name: "Extra Copper Piping", description: "For installations beyond the standard pipe length.", group: "Installation Materials" },
    { name: "Trunking", description: "Keeps pipework neat and protected along the wall.", group: "Installation Materials" },
    { name: "Wall Brackets", description: "Supports outdoor units where a ground base is not suitable.", group: "Installation Materials" },
    { name: "Core Drilling", description: "Required when a clean wall penetration is needed.", group: "Installation Services" },
    { name: "Electrical Upgrades", description: "For installations that need additional electrical work.", group: "Installation Services" },
    { name: "Condensate Pump", description: "Moves drain water where gravity drainage is not possible.", group: "Installation Services" },
    { name: "Removal of Old Unit", description: "We can safely remove and dispose of an existing system.", group: "Installation Services" },
  ],
};
