"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  Clock3,
  House,
  PackageOpen,
  Snowflake,
  Wrench,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

const steps = [
  { number: "01", title: "Choose a Package", copy: "Choose the package that fits your home.", icon: PackageOpen },
  { number: "02", title: "Schedule Installation", copy: "Select your preferred date and location.", icon: CalendarDays },
  { number: "03", title: "Professional Installation", copy: "Installed by accredited professionals.", icon: Wrench },
  { number: "04", title: "Testing & Setup", copy: "Every connection is tested before handover.", icon: ShieldCheck },
  { number: "05", title: "Enjoy Your Comfort", copy: "Relax into reliable, efficient cooling.", icon: Snowflake },
];

const suburbs = ["Cape Town", "Bellville", "Somerset West", "Stellenbosch", "Durbanville", "Paarl", "Claremont", "Milnerton"];

const reviews = [
  ["Sarah M.", "Cape Town", "Daikin Emura", "The team arrived on time, explained everything clearly, and left the room spotless. The whole process felt professional."],
  ["Jason P.", "Bellville", "Samsung WindFree", "From the quote to the final testing, communication was excellent. Our new system works perfectly."],
  ["Nomsa K.", "Somerset West", "Alliance Inverter", "A genuinely easy experience. The installer was knowledgeable, respectful, and meticulous."],
];

const faqs: Array<[string, string, typeof House]> = [
  ["Can you install an air conditioner I bought elsewhere?", "Yes. Our accredited technicians can install compatible units purchased from another supplier, subject to a site and product assessment.", House],
  ["How long does installation take?", "Most standard residential installations are completed in a few hours. Larger or more complex systems may require additional time.", CalendarDays],
  ["Is my installation covered by a warranty?", "We follow manufacturer-approved procedures and provide installation support alongside the applicable product warranty.", ShieldCheck],
  ["Which areas do you service?", "We cover Cape Town and surrounding areas including Bellville, Somerset West, Stellenbosch and Durbanville.", MapPin],
  ["How do I book an installation?", "Complete the booking form below and our team will contact you shortly to confirm the details.", BadgeDollarSign],
];

const blueButton = "inline-flex h-[46px] items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";
const sectionHeading = "font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-foreground md:text-[44px]";

export function InstallationExperienceSections() {
  const [suburbSearch, setSuburbSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [requestType, setRequestType] = useState("installation");
  const [selectedPackage, setSelectedPackage] = useState("Select package");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const detectedIntent = params.get("intent");
      const detectedPackage = params.get("package");

      if (detectedIntent) setRequestType(detectedIntent);
      if (detectedPackage) {
        const packageLabels: Record<string, string> = {
          "home-standard": "Home Standard",
          "extended-installation": "Extended Installation",
          "multi-room-system": "Multi-Room System",
          "commercial-solutions": "Commercial Solutions",
        };
        setSelectedPackage(packageLabels[detectedPackage] ?? "Select package");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const requestTypeLabel = requestType === "installer"
    ? "Find an Installer"
    : requestType === "quote"
      ? "Request a Quote"
      : requestType === "whatsapp"
        ? "WhatsApp Enquiry"
        : "Book Installation";
  const filteredSuburbs = useMemo(
    () => suburbs.filter((suburb) => suburb.toLowerCase().includes(suburbSearch.toLowerCase())),
    [suburbSearch],
  );

  return (
    <div className="w-full">
      <section className="border-t border-[#EDF2F7] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="how-installation-works">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-[620px] text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Simple from start to finish</p>
            <h2 id="how-installation-works" className={sectionHeading}>How Installation Works</h2>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">From booking to final testing, we make installation simple and hassle-free.</p>
          </div>
          <div className="relative mt-16 grid gap-12 md:grid-cols-2 xl:grid-cols-5 xl:gap-0">
            <span className="absolute left-[10%] right-[10%] top-[26px] hidden h-[2px] bg-[#E8EDF3] xl:block" aria-hidden="true" />
            {steps.map(({ number, title, copy, icon: Icon }, index) => (
              <div key={number} className="group/step relative cursor-pointer px-6 text-center">
                <span className={`relative z-10 mx-auto flex size-[52px] items-center justify-center border-[1.5px] text-xl font-medium transition-colors duration-200 ${index === 0 ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#1C99D6] bg-white text-[#1C99D6]"}`}>
                  {number}
                </span>
                <span className="mx-auto mt-10 flex size-5 items-center justify-center text-[#1C99D6] transition-colors duration-200 group-hover/step:text-[#1680B0]"><Icon className="size-5" strokeWidth={1.7} /></span>
                <h3 className="mt-4 text-lg font-medium text-foreground transition-colors duration-200 group-hover/step:text-[#1C99D6]">{title}</h3>
                <p className="mx-auto mt-2 max-w-[190px] text-sm leading-[1.6] text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-16 max-w-[680px] text-center text-sm leading-[1.7] text-muted-foreground">Every installation is completed by accredited professionals and fully tested before handover.</p>
        </div>
      </section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="areas-we-cover">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[380px] overflow-hidden border border-[#EDF2F7] bg-[#EAF5FA] p-8 md:p-12">
            <div className="absolute left-[18%] top-[22%] size-40 rounded-full border border-[#8ED0E8]/60" />
            <div className="absolute right-[15%] top-[30%] size-64 rounded-full border border-[#8ED0E8]/50" />
            <div className="absolute bottom-[18%] left-[30%] size-56 rounded-full border border-[#8ED0E8]/40" />
            {suburbs.slice(0, 5).map((suburb, index) => (
              <span key={suburb} className={`absolute z-10 flex items-center gap-2 text-sm font-medium text-[#0A2540] ${["left-[18%] top-[30%]", "right-[18%] top-[44%]", "left-[34%] bottom-[25%]", "right-[25%] bottom-[30%]", "left-[48%] top-[18%]"][index]}`}>
                <MapPin className="size-4 text-[#1C99D6]" /> {suburb}
              </span>
            ))}
            <div className="absolute bottom-8 left-8 flex items-center gap-3 text-sm text-muted-foreground"><span className="size-2 rounded-full bg-[#1C99D6]" /> Installation coverage area</div>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Service coverage</p>
            <h2 id="areas-we-cover" className={sectionHeading}>Areas We Cover</h2>
            <p className="mt-4 text-base leading-[1.7] text-muted-foreground">Professional installation across Cape Town and surrounding areas.</p>
            <label className="mt-8 flex h-12 items-center gap-3 border border-[#DCE6EB] bg-white px-4 text-sm text-muted-foreground">
              <Search className="size-4 text-[#1C99D6]" />
              <input value={suburbSearch} onChange={(event) => setSuburbSearch(event.target.value)} placeholder="Search suburb" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
            </label>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {filteredSuburbs.map((suburb) => <span key={suburb} className="text-sm text-foreground transition-colors hover:text-[#1C99D6]">{suburb}</span>)}
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><span className="size-2 bg-[#1C99D6]" /> Serving 50+ Areas</span>
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-[#1C99D6]" /> Usually within 24–48 hours</span>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="customer-reviews">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Customer stories</p><h2 id="customer-reviews" className={sectionHeading}>Customer Reviews</h2></div><div className="flex items-center gap-3"><span className="text-4xl font-medium text-foreground">4.9/5</span><span className="text-sm text-muted-foreground">Based on 300+<br />installations</span></div></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map(([name, location, product, review], index) => <article key={name} className={`${index === 0 ? "md:col-span-2 md:p-10" : "p-7"} border border-[#EDF2F7] bg-white`}><div className="flex gap-1 text-[#1C99D6]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="size-4 fill-current" />)}</div><p className={`${index === 0 ? "mt-8 text-2xl md:text-3xl" : "mt-6 text-base"} leading-[1.5] text-foreground`}>“{review}”</p><div className="mt-8 border-t border-[#EDF2F7] pt-5"><p className="font-medium text-foreground">{name}</p><p className="mt-1 text-sm text-muted-foreground">{location} · {product}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#1C99D6]"><ShieldCheck className="size-4" /> Verified Installation</span></div></article>)}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="installation-faq">
        <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Before You Book</p>
            <h2 id="installation-faq" className={sectionHeading}>Everything You Need to Know</h2>
            <p className="mt-5 text-base leading-[1.7] text-muted-foreground">We&apos;ve answered the questions customers ask most before booking an installation. If you can&apos;t find what you&apos;re looking for, our team is here to help.</p>
            <a href="/installation?intent=whatsapp#book-installation" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1C99D6] transition-colors hover:text-[#1680B0]">WhatsApp Us <ArrowRight className="size-4" /></a>
          </div>
          <div>
            {faqs.map(([question, answer, Icon], index) => {
              const CategoryIcon = Icon;
              return (
                <div key={question} className="border-b border-[#EEF2F6]">
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} className="group/faq flex min-h-[76px] w-full items-center gap-4 py-6 text-left text-lg font-medium text-foreground transition-colors hover:text-[#1C99D6]">
                    <CategoryIcon className="size-5 shrink-0 text-[#1C99D6]" strokeWidth={1.7} />
                    <span>{question}</span>
                    <span className={`ml-auto flex size-6 shrink-0 items-center justify-center text-2xl font-light text-[#1C99D6] transition-transform duration-250 ${openFaq === index ? "rotate-45" : ""}`}>+</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-250 ${openFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pb-6 pl-9 text-base leading-[1.7] text-muted-foreground">{answer}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#EEF2F6] pt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Still have a question?</span>
              <a href="/installation?intent=whatsapp#book-installation" className="inline-flex items-center gap-2 hover:text-[#1C99D6]"><MessageCircle className="size-4 text-[#1C99D6]" /> WhatsApp</a>
              <a href="tel:+27000000000" className="inline-flex items-center gap-2 hover:text-[#1C99D6]"><Phone className="size-4 text-[#1C99D6]" /> Call Us</a>
              <a href="mailto:hello@airconsstore.co.za" className="inline-flex items-center gap-2 hover:text-[#1C99D6]"><Mail className="size-4 text-[#1C99D6]" /> Email</a>
            </div>
          </div>
        </div>
      </section>

      <section id="book-installation" className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="book-installation-heading">
        <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Start your project</p><h2 id="book-installation-heading" className={sectionHeading}>Book Your Installation</h2><p className="mt-4 max-w-[560px] text-base leading-[1.7] text-muted-foreground">Tell us about your project and we&apos;ll contact you shortly.</p><div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"><span>Average response: 15–30 minutes</span><span>No obligation quote</span></div><div className="mt-5 border-l-2 border-[#1C99D6] pl-4 text-sm text-foreground">Request type: <span className="font-semibold text-[#1C99D6]">{requestTypeLabel}</span>{selectedPackage !== "Select package" && <span> · {selectedPackage}</span>}</div><form onSubmit={(event) => event.preventDefault()} className="mt-10 grid gap-5 sm:grid-cols-2"><input type="hidden" name="requestType" value={requestTypeLabel} /><input type="hidden" name="selectedPackage" value={selectedPackage} /><input required placeholder="Name" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input required type="tel" placeholder="Phone" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input required type="email" placeholder="Email" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input placeholder="Suburb" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><select name="package" value={selectedPackage} onChange={(event) => setSelectedPackage(event.target.value)} className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm text-muted-foreground outline-none focus:border-[#1C99D6]"><option>Select package</option><option>Home Standard</option><option>Extended Installation</option><option>Multi-Room System</option><option>Commercial Solutions</option></select><input type="date" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm text-muted-foreground outline-none focus:border-[#1C99D6]" /><textarea placeholder="Tell us about your project" rows={4} className="border border-[#DCE6EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#1C99D6] sm:col-span-2" /><button type="submit" className={`${blueButton} sm:col-span-2 sm:w-fit`}>Book Installation <ArrowRight className="ml-3 size-4" /></button></form></div>
          <div className="border-l border-[#DCE6EB] pl-8 lg:pl-12"><h3 className="text-xl font-medium text-foreground">Prefer to speak with us?</h3><p className="mt-3 text-sm leading-[1.7] text-muted-foreground">Our specialists are ready to help you choose the right solution.</p><div className="mt-8 grid gap-4"><a href="/installation?intent=whatsapp#book-installation" className="flex h-14 items-center gap-4 border border-[#1C99D6] bg-[#1C99D6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1680B0]"><MessageCircle className="size-5" /> WhatsApp us</a><a href="tel:+27000000000" className="flex items-center gap-4 border-b border-[#EDF2F7] py-4 text-sm font-medium text-foreground hover:text-[#1C99D6]"><Phone className="size-5 text-[#1C99D6]" /> Call Us</a><a href="mailto:hello@airconsstore.co.za" className="flex items-center gap-4 border-b border-[#EDF2F7] py-4 text-sm font-medium text-foreground hover:text-[#1C99D6]"><Mail className="size-5 text-[#1C99D6]" /> Email Us</a></div><div className="mt-10 grid gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-3"><Clock3 className="size-4 text-[#1C99D6]" /> Mon–Fri, 08:00–17:00</span><span className="flex items-center gap-3"><CalendarDays className="size-4 text-[#1C99D6]" /> Usually replies within 15 minutes</span><span className="flex items-center gap-3"><ShieldCheck className="size-4 text-[#1C99D6]" /> Accredited installers</span></div></div>
        </div>
      </section>

      <section className="px-4 py-24 text-center sm:px-6 lg:px-8" aria-labelledby="final-installation-cta">
        <div className="mx-auto max-w-[720px]"><h2 id="final-installation-cta" className={sectionHeading}>Let&apos;s Get Your Home Comfortable.</h2><p className="mt-4 text-base leading-[1.7] text-muted-foreground">Book your installation today or speak with one of our specialists.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><a href="/installation?intent=installation#book-installation" className={blueButton}>Book Installation</a><a href="/installation?intent=whatsapp#book-installation" className="inline-flex h-[46px] items-center bg-[#1C99D6] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#1680B0]">WhatsApp Us</a></div><p className="mt-8 text-sm text-muted-foreground">Accredited installers · Warranty protected · Trusted workmanship</p></div>
      </section>

      <a href="/installation?intent=installation#book-installation" className="fixed bottom-4 left-4 right-4 z-30 inline-flex h-12 items-center justify-center bg-[#1C99D6] text-sm font-semibold text-white shadow-lg md:hidden">Book Installation</a>
    </div>
  );
}
