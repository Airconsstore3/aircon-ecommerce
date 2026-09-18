import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowDown, MapPin, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fontClass = "font-[var(--font-google-sans-flex)]";

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
    description: "Fast delivery across South Africa, straight to your door.",
    image: "/Hero Images/feature-cards/delivery.webp",
  },
  {
    step: "Install",
    description: "Qualified installers ensure everything is fitted correctly.",
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
  { src: "/Installation page picsh/Shop Air Conditioners.png", alt: "Technician installing" },
  { src: "/Hero Images/Product category pictures/Alliance Aqua front.webp", alt: "Indoor unit" },
  { src: "/Hero Images/Product category pictures/Alliance Aqua condenser.webp", alt: "Outdoor condenser" },
  { src: "/Hero Images/Product category pictures/Alliance Cassette Inverter.webp", alt: "Commercial installation" },
  { src: "/Hero Images/full-width-aircon.webp", alt: "Residential installation" },
  { src: "/Installation page picsh/why choose us on isntallation.webp", alt: "Finished project" },
];

const reviews = [
  {
    name: "Thabo M.",
    location: "Cape Town",
    rating: 5,
    text: "From choosing the right unit to installation, the whole process was seamless. The team knew exactly what would work for my home.",
  },
  {
    name: "Sarah K.",
    location: "Johannesburg",
    rating: 5,
    text: "Professional, on time, and the price was exactly what they quoted. My office has never been more comfortable.",
  },
  {
    name: "Pieter v.",
    location: "Durban",
    rating: 5,
    text: "Great advice on which unit to buy. They didn't try to oversell — just helped me find the right fit for my budget.",
  },
  {
    name: "Lerato N.",
    location: "Pretoria",
    rating: 5,
    text: "The installation was clean and tidy. They even followed up a week later to make sure everything was working well.",
  },
  {
    name: "James W.",
    location: "Cape Town",
    rating: 5,
    text: "Bought a Samsung unit and had it installed the same week. Really happy with the service from start to finish.",
  },
  {
    name: "Aisha P.",
    location: "Port Elizabeth",
    rating: 5,
    text: "Delivery was fast and the installer was qualified and friendly. Would definitely recommend Aircons Store.",
  },
];

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
    answer: "Yes. We offer professional installation by qualified technicians in Cape Town, Johannesburg, Durban, and Pretoria, with nationwide delivery for products.",
  },
  {
    question: "Which brands do you sell?",
    answer: "We stock Samsung, LG, Daikin, Alliance, Carrier, Midea, Hisense, York, and more. All units are sourced through authorised channels with full warranty support.",
  },
  {
    question: "Do products include warranties?",
    answer: "Yes. Every air conditioner we sell includes the manufacturer's warranty. We also offer extended warranty options for added peace of mind.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery typically takes 2–5 business days depending on your location. Cape Town, Johannesburg, Durban, and Pretoria usually receive next-day delivery.",
  },
  {
    question: "Can you help me choose the correct size?",
    answer: "Absolutely. Speak to one of our specialists and we'll help you calculate the right BTU capacity based on your room size, ceiling height, and sun exposure.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AboutPage() {
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
            <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white hover:border-white/40 rounded-[10px] h-14 px-8 text-[15px] font-semibold uppercase tracking-wider bg-transparent">
              <Link href="/help">Talk to an Expert</Link>
            </Button>
          </div>
          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/75">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-[#1C99D6] text-[#1C99D6]" />
                ))}
              </div>
              <span className="text-[13px] md:text-sm font-medium">4.9 Google Rating</span>
            </div>
            <span className="text-white/30">•</span>
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
              <div key={step.step} className="flex flex-col items-center text-center">
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

      {/* 6. Installation Gallery */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              Installation Gallery
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
              Real installations, real results.
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

      {/* 7. Customer Reviews */}
      <section className="py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-12 bg-[#F8FBFD]">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 md:mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1C99D6] mb-3">
              Customer Reviews
            </p>
            <h2 className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-6">
              Rated by real customers.
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-[#1C99D6] text-[#1C99D6]" />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#0A2540]">Google Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-[#1C99D6] text-[#1C99D6]" />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#0A2540]">Trustpilot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-[#1C99D6] text-[#1C99D6]" />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#0A2540]">Verified Customers</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="bg-white border border-gray-100 rounded-[12px] p-6 md:p-8"
              >
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#1C99D6] text-[#1C99D6]" />
                  ))}
                </div>
                <p className="text-[15px] md:text-[16px] leading-[1.6] text-[#0A2540] mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-[#0A2540]">{review.name}</p>
                  <p className="text-xs text-[#5F6B7A]">{review.location}</p>
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
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-[10px] h-12 px-8 text-sm font-semibold uppercase tracking-wider bg-transparent">
              <Link href="/help">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
