import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wrench,
  Boxes,
  Cpu,
  Home,
  Store,
  HelpCircle,
  Camera,
  Tag,
  MapPin,
  User,
  Package,
} from "lucide-react";

import {
  buildWhatsAppHref,
  getContactChannels,
} from "@/lib/contact-settings";

const buttonClass = "inline-flex h-[46px] items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";
const outlineButtonClass = "inline-flex h-[46px] items-center justify-center border border-[#1C99D6] px-7 text-sm font-semibold text-[#1C99D6] transition-colors hover:bg-[#F7FBFF]";
const headingClass = "font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-[#0A2540] md:text-[44px]";

// Contact details come from the settings table — render on demand so admin
// changes take effect without a rebuild.
export const dynamic = "force-dynamic";

const brands = [
  ["Samsung", "/Hero Images/aircon coursel logo/samsung aircon.png"],
  ["Alliance", "/Hero Images/aircon coursel logo/alliance aircon.png"],
  ["Daikin", "/Hero Images/aircon coursel logo/daikin aircon.png"],
  ["LG", "/Hero Images/aircon coursel logo/lg aircon.png"],
  ["Midea", "/Hero Images/aircon coursel logo/midea aircon.png"],
  ["Hisense", "/Hero Images/aircon coursel logo/hisense aircon.png"],
] as const;

const coverageCards = [
  { icon: Home, title: "Indoor Unit", items: ["Parts", "Electronics", "Manufacturer cover"], image: "/Hero Images/Product category pictures/extended warrant 1.png" },
  { icon: Boxes, title: "Outdoor Unit", items: ["Covered where applicable", "Varies by manufacturer"], image: "/Hero Images/Product category pictures/extended waranty 2.png" },
  { icon: Cpu, title: "Compressor", items: ["Up to manufacturer warranty", "Extended eligibility"], image: "/Hero Images/feature-cards/warranty.webp" },
] as const;

const routingCards = [
  { icon: Store, title: "Bought from Aircons Store", copy: "We can help you register your warranty.", cta: "Continue", href: "#warranty-contact" },
  { icon: HelpCircle, title: "Bought Elsewhere", copy: "Check whether your product is eligible.", cta: "Check Eligibility", href: "#warranty-contact" },
  { icon: MessageCircle, title: "Need Help?", copy: "Not sure where you stand? Talk to us.", cta: "Contact Support", href: "#warranty-contact" },
];

const documents = [
  { icon: FileText, title: "Invoice / Proof of Purchase", copy: "Needed for all requests." },
  { icon: Tag, title: "Serial Number", copy: "Found on the product label." },
  { icon: Camera, title: "Photos", copy: "Required for warranty claims." },
  { icon: MapPin, title: "Installation Address", copy: "Where the unit was installed." },
  { icon: Package, title: "Model Number", copy: "Located on the product label." },
  { icon: User, title: "Installer Details", copy: "If available, include contact info." },
];

const faqs = [
  ["How long is the warranty?", "Warranty length depends on the manufacturer and product. We confirm the exact coverage when you register."],
  ["Can I extend my warranty?", "Eligible warranties can be extended. We confirm eligibility based on your product and current coverage."],
  ["What is covered?", "Coverage varies by manufacturer. Indoor units, outdoor units, compressors and parts are typically included, subject to terms."],
  ["Is labour included?", "Labour may be included depending on the warranty conditions. We confirm this during your request."],
  ["What documents do I need?", "You'll need your invoice, serial number, model number and installation address. Photos are required for claims."],
  ["How long does approval take?", "Timing depends on the request and the manufacturer. We confirm next steps when we review your details."],
  ["Can I claim without an invoice?", "An invoice or proof of purchase is required. Contact us if you're unable to locate it and we'll advise."],
];

const processSteps = [
  ["01", "Get in Touch", "Contact us by WhatsApp, phone or email."],
  ["02", "Share Your Details", "Invoice, serial number and photos if claiming."],
  ["03", "We Review", "Our team reviews your request."],
  ["04", "Next Steps", "We contact you by your preferred method."],
] as const;

export default async function WarrantyPage() {
  const contact = await getContactChannels();
  const whatsappWarrantyHref = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I need help with a warranty request.")
    : null;
  const hasContactChannel = Boolean(whatsappWarrantyHref || contact.phoneTel || contact.email);

  return (
    <div className="min-h-screen bg-white text-[#0A2540]">
      {/* Hero — split layout */}
      <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32" aria-labelledby="warranty-heading">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Warranty &amp; Support</p>
            <h1 id="warranty-heading" className="font-[var(--font-google-sans-flex)] text-[44px] font-medium leading-[0.98] tracking-tight sm:text-[56px] lg:text-[64px]">Warranty Made Simple.</h1>
            <p className="mt-6 max-w-[520px] text-lg leading-[1.7] text-[#335B74]">Register your product, extend eligible warranties or submit a claim — our team will walk you through it.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#warranty-contact" className={buttonClass}>Register Warranty <ArrowRight className="ml-3 size-4" /></a>
              <a href="#warranty-contact" className={outlineButtonClass}>Submit a Claim</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#335B74]">
              <span className="flex items-center gap-2"><CheckCircle className="size-4 text-[#1C99D6]" /> Manufacturer Support</span>
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#1C99D6]" /> Registration &amp; Claims</span>
              <span className="flex items-center gap-2"><MessageCircle className="size-4 text-[#1C99D6]" /> WhatsApp, Phone or Email</span>
            </div>
          </div>
          <div className="relative min-h-[380px] overflow-hidden border border-[#EDF2F7] lg:min-h-[520px]">
            <Image src="/Hero Images/feature-cards/warranty.webp" alt="Customer and technician reviewing warranty paperwork next to an installed air conditioner" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" quality={100} unoptimized priority />
          </div>
        </div>
      </section>

      {/* Entry Cards */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8" aria-labelledby="entry-heading">
        <div className="mx-auto max-w-[1280px]">
          <h2 id="entry-heading" className="sr-only">Choose your request</h2>
          <div className="grid gap-px border border-[#EDF2F7] bg-[#EDF2F7] md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Register Warranty", copy: "Bought a new air conditioner? We can help you register your warranty.", cta: "Register" },
              { icon: Wrench, title: "Submit a Claim", copy: "Having a warranty issue? We'll guide you through the process.", cta: "Start Claim" },
              { icon: HelpCircle, title: "Extend Warranty", copy: "Check whether your product is eligible for extended coverage.", cta: "Check Eligibility" },
            ].map(({ icon: Icon, title, copy, cta }) => (
              <a key={title} href="#warranty-contact" className="group flex flex-col bg-white p-8 transition-colors hover:bg-[#F7FBFF] lg:p-10">
                <Icon className="size-6 text-[#1C99D6]" strokeWidth={1.7} />
                <h3 className="mt-6 text-xl font-medium">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1C99D6]">{cta} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* What's Covered — visual cards */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="covered-heading">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[620px]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Coverage</p>
            <h2 id="covered-heading" className={headingClass}>What&apos;s Covered.</h2>
            <p className="mt-5 text-base leading-[1.7] text-[#335B74]">Coverage varies by manufacturer. Below is a general guide to what most warranties include.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {coverageCards.map(({ icon: Icon, title, items, image }) => (
              <div key={title} className="border border-[#EDF2F7]">
                <div className="relative aspect-[16/10] overflow-hidden border-b border-[#EDF2F7]">
                  <Image src={image} alt={title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" quality={100} unoptimized />
                </div>
                <div className="p-7">
                  <Icon className="size-5 text-[#1C99D6]" strokeWidth={1.7} />
                  <h3 className="mt-5 text-lg font-medium">{title}</h3>
                  <ul className="mt-4 space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[#335B74]">
                        <CheckCircle className="size-4 shrink-0 text-[#1C99D6]" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#335B74]">* Coverage varies by manufacturer. Confirm exact terms during registration.</p>
        </div>
      </section>

      {/* Check Before You Start — routing cards */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="check-heading">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[620px]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Check Before You Start</p>
            <h2 id="check-heading" className={headingClass}>Where Did You Buy?</h2>
            <p className="mt-5 text-base leading-[1.7] text-[#335B74]">Choose the option that applies to you so we can route you to the right next step.</p>
          </div>
          <div className="mt-12 grid gap-px border border-[#EDF2F7] bg-[#EDF2F7] md:grid-cols-3">
            {routingCards.map(({ icon: Icon, title, copy, cta, href }) => (
              <a key={title} href={href} className="group flex flex-col bg-white p-8 transition-colors hover:bg-[#F7FBFF]">
                <Icon className="size-6 text-[#1C99D6]" strokeWidth={1.7} />
                <h3 className="mt-6 text-lg font-medium">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1C99D6]">{cta} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Process — timeline */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="process-heading">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">How It Works</p>
            <h2 id="process-heading" className={headingClass}>Warranty Process.</h2>
          </div>

          {/* Desktop timeline */}
          <div className="mt-16 hidden md:block">
            <div className="relative grid grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-[27px] h-[2px] bg-[#DCE6EB]" />
              {processSteps.map(([number, title, copy], i) => (
                <div key={number} className="group relative flex flex-col items-center px-2 text-center">
                  <span className={`relative z-10 flex size-14 items-center justify-center rounded-full border-2 transition-all duration-200 ${i === 0 ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#1C99D6] bg-white text-[#1C99D6] group-hover:bg-[#1C99D6] group-hover:text-white"}`}>
                    <span className="text-[18px] font-semibold tracking-[-0.02em]">{number}</span>
                  </span>
                  <h3 className="mt-7 text-base font-medium transition-colors duration-200 group-hover:text-[#1C99D6]">{title}</h3>
                  <p className="mt-4 max-w-[200px] text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="mt-12 md:hidden">
            <div className="relative">
              <div className="absolute bottom-2 left-[27px] top-2 w-[2px] bg-[#DCE6EB]" />
              {processSteps.map(([number, title, copy]) => (
                <div key={number} className="group relative flex gap-5 pb-8 last:pb-0">
                  <span className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 border-[#1C99D6] bg-white text-[#1C99D6]`}>
                    <span className="text-[18px] font-semibold tracking-[-0.02em]">{number}</span>
                  </span>
                  <div className="pt-2">
                    <h3 className="text-base font-medium">{title}</h3>
                    <p className="mt-2 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents — chip cards */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="documents-heading">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[620px]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Before You Start</p>
            <h2 id="documents-heading" className={headingClass}>Required Documents.</h2>
            <p className="mt-5 text-base leading-[1.7] text-[#335B74]">Have these ready before you contact us to speed up your request.</p>
          </div>
          <div className="mt-12 grid gap-px border border-[#EDF2F7] bg-[#EDF2F7] sm:grid-cols-2 lg:grid-cols-3">
            {documents.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex items-start gap-4 bg-white p-7">
                <Icon className="mt-0.5 size-5 shrink-0 text-[#1C99D6]" strokeWidth={1.7} />
                <div>
                  <h3 className="text-base font-medium">{title}</h3>
                  <p className="mt-1 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty enquiry — real contact channels from settings, no fake form */}
      <section id="warranty-contact" className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="warranty-contact-heading">
        <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Start Your Request</p>
            <h2 id="warranty-contact-heading" className={headingClass}>Contact Us to Register, Extend or Claim.</h2>
            <p className="mt-5 max-w-[600px] text-base leading-[1.7] text-[#335B74]">Warranty enquiries are handled directly by our team. Message or call us and we&apos;ll guide you through the process.</p>
            <div className="mt-10 border border-[#EDF2F7] bg-[#F8FBFD] p-8">
              <h3 className="text-lg font-medium">Include this information when you contact us</h3>
              <ul className="mt-5 grid gap-3">
                {["Whether you want to register, extend or claim", "Product brand, model number and serial number", "Invoice or proof of purchase", "Installation address", "Photos of the issue (for claims)"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#335B74]"><CheckCircle className="size-4 shrink-0 text-[#1C99D6]" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-l border-[#DCE6EB] pl-8 lg:pl-12">
            <h3 className="text-xl font-medium">Talk to Our Team</h3>
            <p className="mt-3 text-sm leading-[1.7] text-[#335B74]">Our team can help with registrations, claims and warranty questions.</p>
            {hasContactChannel ? (
              <div className="mt-8 grid gap-4">
                {whatsappWarrantyHref && (
                  <a href={whatsappWarrantyHref} target="_blank" rel="noopener noreferrer" className="flex h-[46px] items-center gap-3 bg-[#1C99D6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1680B0]"><MessageCircle className="size-5" /> WhatsApp Us</a>
                )}
                {contact.phoneTel && (
                  <a href={contact.phoneTel} className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Phone className="size-5 text-[#1C99D6]" /> Call Us</a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Mail className="size-5 text-[#1C99D6]" /> Email Us</a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* What Happens Next — timeline */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="next-heading">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">After You Contact Us</p>
            <h2 id="next-heading" className={headingClass}>What Happens Next.</h2>
          </div>
          <div className="mt-16 hidden md:block">
            <div className="relative grid grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-[27px] h-[2px] bg-[#DCE6EB]" />
              {[["01", "Logged", "Our team logs your request."], ["02", "Reviewed", "We check your product and documents."], ["03", "Contacted", "By your preferred method."], ["04", "Resolved", "Your request is actioned or we request more info."]].map(([number, title, copy], i) => (
                <div key={number} className="group relative flex flex-col items-center px-2 text-center">
                  <span className={`relative z-10 flex size-14 items-center justify-center rounded-full border-2 transition-all duration-200 ${i === 0 ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#1C99D6] bg-white text-[#1C99D6] group-hover:bg-[#1C99D6] group-hover:text-white"}`}>
                    <span className="text-[18px] font-semibold tracking-[-0.02em]">{number}</span>
                  </span>
                  <h3 className="mt-7 text-base font-medium transition-colors duration-200 group-hover:text-[#1C99D6]">{title}</h3>
                  <p className="mt-4 max-w-[200px] text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 md:hidden">
            <div className="relative">
              <div className="absolute bottom-2 left-[27px] top-2 w-[2px] bg-[#DCE6EB]" />
              {[["01", "Logged", "Our team logs your request."], ["02", "Reviewed", "We check your product and documents."], ["03", "Contacted", "By your preferred method."], ["04", "Resolved", "Your request is actioned or we request more info."]].map(([number, title, copy]) => (
                <div key={number} className="group relative flex gap-5 pb-8 last:pb-0">
                  <span className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 border-[#1C99D6] bg-white text-[#1C99D6]`}>
                    <span className="text-[18px] font-semibold tracking-[-0.02em]">{number}</span>
                  </span>
                  <div className="pt-2">
                    <h3 className="text-base font-medium">{title}</h3>
                    <p className="mt-2 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Brands */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="brands-heading">
        <div className="mx-auto max-w-[1280px] text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Supported Manufacturers</p>
          <h2 id="brands-heading" className={headingClass}>Brands We Support.</h2>
          <div className="mt-12 grid grid-cols-2 border-y border-[#EDF2F7] sm:grid-cols-3 lg:grid-cols-6">
            {brands.map(([name, image]) => (
              <span key={name} className="flex items-center justify-center border-b border-[#EDF2F7] px-6 py-8 opacity-70 transition-all duration-200 hover:opacity-100 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <Image src={image} alt={name} width={140} height={56} className="h-10 w-auto object-contain md:h-12" quality={100} unoptimized />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="faq-heading">
        <div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Warranty Questions</p>
            <h2 id="faq-heading" className={headingClass}>Frequently Asked Questions.</h2>
            <p className="mt-5 text-base leading-[1.7] text-[#335B74]">Clear answers about coverage, claims and what to expect.</p>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question} className="group border-b border-[#EDF2F7]">
                <summary className="flex min-h-[72px] w-full cursor-pointer list-none items-center justify-between py-5 text-left text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="text-2xl font-light text-[#1C99D6] transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 text-base leading-[1.7] text-[#335B74]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section id="contact-support" className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="contact-heading">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Need Help?</p>
          <h2 id="contact-heading" className={headingClass}>Contact Support.</h2>
          <p className="mx-auto mt-5 max-w-[480px] text-base leading-[1.7] text-[#335B74]">Our team can help with registrations, claims and warranty questions.</p>
          {hasContactChannel ? (
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {whatsappWarrantyHref && <a href={whatsappWarrantyHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass} w-full sm:w-auto`}><MessageCircle className="mr-3 size-5" /> WhatsApp</a>}
              {contact.phoneTel && <a href={contact.phoneTel} className={`${outlineButtonClass} w-full sm:w-auto`}><Phone className="mr-3 size-5" /> Call Us</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className={`${outlineButtonClass} w-full sm:w-auto`}><Mail className="mr-3 size-5" /> Email Support</a>}
            </div>
          ) : null}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className={headingClass}>Still Need Help?</h2>
          <p className="mx-auto mt-5 max-w-[440px] text-base leading-[1.7] text-[#335B74]">We&apos;re here to help with registrations, extensions and warranty claims.</p>
          {hasContactChannel ? (
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {whatsappWarrantyHref && <a href={whatsappWarrantyHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass} w-full sm:w-auto`}><MessageCircle className="mr-3 size-5" /> WhatsApp</a>}
              {contact.phoneTel && <a href={contact.phoneTel} className={`${outlineButtonClass} w-full sm:w-auto`}><Phone className="mr-3 size-5" /> Call</a>}
              {contact.email && <a href={`mailto:${contact.email}`} className={`${outlineButtonClass} w-full sm:w-auto`}><Mail className="mr-3 size-5" /> Email</a>}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
