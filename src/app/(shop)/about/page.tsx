import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowDown, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getContactChannels, primaryContactHref } from "@/lib/contact-settings";

const fontClass = "font-[var(--font-google-sans-flex)]";

// Contact details come from the settings table — render on demand so admin
// changes take effect without a rebuild.
export const dynamic = "force-dynamic";

// ─── Data ──────────────────────────────────────────────────────────────────

const whyChooseUs = [
  "Advice based on your space",
  "Professional installation",
  "Air conditioners from trusted brands",
  "Nationwide delivery",
  "Warranty support",
  "Ongoing customer service",
];

const howWeHelp = [
  {
    step: "Choose",
    description: "We'll help you select the right capacity and model for your space.",
    image: "/Hero Images/feature-cards/accredited-installer.webp",
  },
  {
    step: "Deliver",
    description: "Delivery across South Africa, straight to your door.",
    image: "/Hero Images/feature-cards/delivery.webp",
  },
  {
    step: "Install",
    description: "Professional installation support for the systems we supply.",
    image: "/Hero Images/feature-cards/warranty.webp",
  },
];

const brands = [
  { name: "Samsung", logo: "/Hero Images/aircon coursel logo/samsung aircon.png" },
  { name: "LG", logo: "/Hero Images/aircon coursel logo/lg aircon.png" },
  { name: "Daikin", logo: "/Hero Images/aircon coursel logo/daikin aircon.png" },
  { name: "Alliance", logo: "/Hero Images/aircon coursel logo/alliance aircon.png" },
  { name: "Carrier", logo: "/Hero Images/aircon coursel logo/carrier aircon.png" },
  { name: "Midea", logo: "/Hero Images/aircon coursel logo/midea aircon.png" },
  { name: "Hisense", logo: "/Hero Images/aircon coursel logo/hisense aircon.png" },
  { name: "York", logo: "/Hero Images/aircon coursel logo/york aircon.png" },
];

const galleryImages = [
  { src: "/Installation page picsh/Shop Air Conditioners.png", alt: "Technician installing an indoor unit" },
  { src: "/Hero Images/Product category pictures/Alliance Aqua front.webp", alt: "Indoor wall-mounted unit" },
  { src: "/Hero Images/Product category pictures/Alliance Aqua condenser.webp", alt: "Outdoor condenser unit" },
  { src: "/Hero Images/Product category pictures/Alliance Cassette Inverter.webp", alt: "Cassette air conditioner" },
  { src: "/Hero Images/full-width-aircon.webp", alt: "Mounted air conditioner above a bed" },
  { src: "/Installation page picsh/why choose us on isntallation.webp", alt: "Technician checking an air conditioner" },
];

// NOTE: fabricated testimonials removed — no real review source exists yet.

const serviceAreas = [
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Pretoria",
  "Nationwide Delivery",
];

const faqs = [
  {
    question: "Do you install?",
    answer: "Yes. We offer professional installation support — service areas and availability are confirmed when you enquire. Products are delivered nationwide.",
  },
  {
    question: "Which brands do you sell?",
    answer: "We stock Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York, and more. Every unit includes the manufacturer's warranty.",
  },
  {
    question: "Do products include warranties?",
    answer: "Yes. Every air conditioner we sell includes the manufacturer's warranty. We also offer extended warranty options for added peace of mind.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery is free within Cape Town. For other areas, delivery is arranged and the timing is confirmed with your order before payment.",
  },
  {
    question: "Can you help me choose the correct size?",
    answer: "Absolutely. Speak to one of our specialists and we'll help you calculate the right BTU capacity based on your room size, ceiling height, and sun exposure.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const contact = await getContactChannels();
  const contactHref = primaryContactHref(contact, "Hi Aircons Store — I'd like some advice.");

  return (
    <div className={`min-h-screen bg-white ${fontClass}`}>
      {/* 1. Hero */}
      <section className="relative flex min-h-[560px] items-center overflow-hidden">
        <Image
          src="/Hero Images/full-width-aircon.webp"
          alt="Air conditioner installation"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540]/55 via-[#0A2540]/25 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12 py-20 md:py-28 lg:py-32">
          <p className="text-[13px] md:text-sm font-semibold uppercase tracking-[0.18em] text-[#1C99D6] mb-5">
            About Aircons Store
          </p>
          <h1 className="text-[40px] md:text-[56px] lg:text-[68px] font-medium leading-[1.02] tracking-tight text-white max-w-[620px]">
            Choose the Right
            <br />
            Air Conditioner
          </h1>
          <p className="mt-6 text-[17px] md:text-[20px] leading-[1.6] text-white/80 max-w-[520px]">
            We help homeowners and businesses choose, deliver and install air conditioners that fit their space and budget.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-[10px] h-14 px-8 text-[15px] font-semibold uppercase tracking-wider shadow-[0_4px_20px_rgba(28,153,214,0.3)]">
              <Link href="/products">Shop Air Conditioners</Link>
            </Button>
            {contactHref && (
              <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white hover:border-white/40 rounded-[10px] h-14 px-8 text-[15px] font-semibold uppercase tracking-wider bg-transparent">
                <a href={contactHref}>Talk to an Expert</a>
              </Button>
            )}
          </div>
          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/75">
            <span className="text-[13px] md:text-sm font-medium">Nationwide Delivery</span>
            <span className="text-white/30">•</span>
            <span className="text-[13px] md:text-sm font-medium">Professional Installation</span>
          </div>
        </div>
      </section>

      {/* 2. Why Customers Choose Us */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              Why Customers Choose Us
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540] max-w-[600px]">
              Trust built on practical help, not promises.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {whyChooseUs.map((item) => (
              <div key={item} className="flex items-center gap-3.5 border-b border-gray-100 pb-5">
                <CheckCircle className="size-5 text-[#1C99D6] shrink-0" strokeWidth={2} />
                <span className="text-[16px] md:text-[17px] text-[#0A2540] font-normal">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Our Story */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-[#F8FBFD]">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-4">
            Our Story
          </p>
          <p className="text-[20px] md:text-[24px] lg:text-[28px] leading-[1.5] text-[#0A2540] font-normal tracking-tight">
            Air conditioners are a long-term investment. We created Aircons Store to make buying one simpler by combining quality products with practical advice, installation services and support after the sale.
          </p>
        </div>
      </section>

      {/* 4. How We Help */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              How We Help
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
              Three simple steps.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {howWeHelp.map((step, index) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[12px] mb-6 bg-gray-50">
                  <Image
                    src={step.image}
                    alt={step.step}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={75}
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-[#1C99D6] tracking-wider">0{index + 1}</span>
                  <h3 className="text-[22px] md:text-[24px] font-medium text-[#0A2540]">{step.step}</h3>
                </div>
                <p className="text-[15px] md:text-[16px] leading-[1.6] text-[#5F6B7A] max-w-[320px]">
                  {step.description}
                </p>
                {index < howWeHelp.length - 1 && (
                  <ArrowDown className="hidden md:block absolute mt-[200px] -right-6 lg:-right-8 size-5 text-[#1C99D6]/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Brands We Work With */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-[#F8FBFD]">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              Brands We Work With
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
              Trusted manufacturers.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center justify-center bg-white border border-gray-100 rounded-[12px] py-8 px-6 hover:shadow-sm transition-shadow"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={140}
                  height={56}
                  className="h-10 md:h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  quality={75}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              Gallery
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
              Products and installation services.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-[12px] bg-gray-50 ${
                  index === 0 ? "col-span-2 md:col-span-2 row-span-2 aspect-[4/3] md:aspect-square" : "aspect-square"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover hover:scale-[1.02] transition-transform duration-500"
                  sizes="(min-width: 768px) 33vw, 50vw"
                  quality={75}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <span className="text-xs md:text-sm text-white font-medium">{image.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Service Areas */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
                Service Areas
              </p>
              <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-6">
                Where we deliver and install.
              </h2>
              <p className="text-[16px] md:text-[17px] leading-[1.6] text-[#5F6B7A] mb-8 max-w-[480px]">
                We deliver nationwide and offer professional installation in major metros. Wherever you are, we can get your air conditioner to you.
              </p>
              <div className="space-y-3">
                {serviceAreas.map((area) => (
                  <div key={area} className="flex items-center gap-3">
                    <MapPin className="size-5 text-[#1C99D6] shrink-0" strokeWidth={1.5} />
                    <span className="text-[16px] text-[#0A2540] font-normal">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-[#F0F9FF]">
              <Image
                src="/Hero Images/AIRCON HOME.webp"
                alt="Service areas across South Africa"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={75}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-[#F8FBFD]">
        <div className="mx-auto max-w-[820px]">
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              FAQ
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
              Questions, answered.
            </h2>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border-b border-gray-200 py-5 md:py-6"
              >
                <summary className="flex cursor-pointer items-center justify-between text-left">
                  <span className="text-[17px] md:text-[18px] font-medium text-[#0A2540] pr-4">
                    {faq.question}
                  </span>
                  <span className="text-2xl font-light text-[#1C99D6] shrink-0 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[15px] md:text-[16px] leading-[1.7] text-[#5F6B7A]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-20 md:py-28 lg:py-32 px-6 sm:px-8 lg:px-12 bg-[#0A2540]">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="text-[32px] md:text-[44px] lg:text-[52px] font-medium leading-[1.1] tracking-tight text-white mb-6">
            Need Help Choosing?
          </h2>
          <p className="text-[17px] md:text-[19px] leading-[1.6] text-white/70 mb-10 max-w-[520px] mx-auto">
            Speak with one of our specialists or browse our full range.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-[10px] h-12 px-8 text-sm font-semibold uppercase tracking-wider">
              <Link href="/products">
                Shop Air Conditioners
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            {contactHref && (
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-[10px] h-12 px-8 text-sm font-semibold uppercase tracking-wider bg-transparent">
                <a href={contactHref}>Contact Us</a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
