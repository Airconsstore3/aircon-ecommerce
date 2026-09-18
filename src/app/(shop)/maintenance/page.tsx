"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock3,
  Droplets,
  FileText,
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Thermometer,
  Wrench,
  Zap,
} from "lucide-react";

const plans = [
  {
    name: "Annual Care",
    price: "R1 200",
    cadence: "per year",
    description: "A focused annual service for a single residential unit.",
    bestFor: "Single residential unit",
    popular: false,
  },
  {
    name: "Bi-Annual Care",
    price: "R2 000",
    cadence: "per year",
    description: "Regular care for homes that rely on consistent comfort.",
    bestFor: "Family home or multiple units",
    popular: true,
  },
];

const includedItems = [
  [Filter, "Filter clean & replacement"],
  [Droplets, "Refrigerant gas level check"],
  [CheckCircle, "Condensate drainage inspection"],
  [Thermometer, "Thermostat calibration test"],
  [Zap, "Electrical connections check"],
  [FileText, "Full performance report"],
] as const;

const signs: Array<[typeof Thermometer, string, string]> = [
  [Thermometer, "Uneven cooling", "Some rooms feel warmer than others."],
  [Droplets, "Water around the unit", "A blocked drain can cause leaks and damage."],
  [Zap, "Rising energy bills", "Reduced efficiency can make your system work harder."],
  [Wrench, "Unusual sounds", "Noise can point to a component needing attention."],
];

const faqs = [
  ["How often should I service my air conditioner?", "For most homes, servicing every six to twelve months helps maintain performance and catch small issues early."],
  ["What happens during a service visit?", "We inspect, clean and test the system, check key connections and provide a clear performance report."],
  ["Can you service an air conditioner bought elsewhere?", "Yes. We can service compatible systems from other suppliers after confirming the model and condition."],
  ["Which areas do you cover?", "We service Cape Town and surrounding areas including Bellville, Somerset West, Stellenbosch and Durbanville."],
];

const primaryButton = "inline-flex h-[46px] items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";
const heading = "font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-[#0A2540] md:text-[44px]";

export default function MaintenancePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white text-[#0A2540]">
      <section className="px-4 pb-20 pt-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-heading">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[720px]">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Air Conditioner Maintenance</p>
            <h1 id="maintenance-heading" className="font-[var(--font-google-sans-flex)] text-[44px] font-medium leading-[0.98] tracking-tight sm:text-[56px] lg:text-[64px]">Maintain Performance. Prevent Problems.</h1>
            <p className="mt-6 max-w-[600px] text-lg leading-[1.7] text-[#335B74]">Professional maintenance designed to improve efficiency, reduce unexpected breakdowns and help maximise the lifespan of your air conditioning system.</p>
            <Link href="#maintenance-booking" className={`${primaryButton} mt-8`}>Book Service <ArrowRight className="ml-3 size-4" /></Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8" aria-label="Air conditioner maintenance in a modern home">
        <div className="relative mx-auto h-[360px] max-w-[1440px] overflow-hidden md:h-[500px]">
          <Image src="/Hero Images/hero summer winter.webp" alt="Comfortable modern home with air conditioning" fill priority className="object-cover" sizes="100vw" quality={100} />
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="choose-maintenance-service">
        <div className="mx-auto max-w-[1280px]"><div className="max-w-[620px]"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Choose a service</p><h2 id="choose-maintenance-service" className={heading}>The right care for your space.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Whether you need a seasonal check or regular protection, we make maintenance easy to plan.</p></div><div className="mt-12 grid gap-8 border-t border-[#EDF2F7] pt-8 md:grid-cols-2"><div><Sparkles className="size-5 text-[#1C99D6]" /><h3 className="mt-5 text-xl font-medium">One-off Service</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">A thorough check when your system needs attention.</p></div><div><CalendarDays className="size-5 text-[#1C99D6]" /><h3 className="mt-5 text-xl font-medium">Maintenance Plans</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">Regular visits that protect performance over time.</p></div></div></div>
      </section>

      <section id="plans" className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-plans-heading">
        <div className="mx-auto max-w-[1280px]"><div className="text-center"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Choose your rhythm</p><h2 id="maintenance-plans-heading" className={heading}>Plans that keep you ahead.</h2><p className="mx-auto mt-5 max-w-[600px] text-base leading-[1.7] text-[#335B74]">Regular care helps prevent surprises, protect efficiency and extend the life of your system.</p></div><div className="mt-14 grid gap-6 md:grid-cols-2">{plans.map((plan) => <article key={plan.name} className={`relative flex min-h-[430px] flex-col border bg-white p-7 transition-transform duration-200 hover:-translate-y-1 ${plan.popular ? "border-2 border-[#1C99D6]" : "border-[#EDF2F7]"}`}>{plan.popular && <span className="absolute -top-3 left-7 bg-[#1C99D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-white">Most Popular</span>}<h3 className="text-xl font-medium">{plan.name}</h3><p className="mt-4 max-w-[300px] text-sm leading-[1.6] text-[#335B74]">{plan.description}</p><div className="mt-8 border-y border-[#EDF2F7] py-5"><span className="text-3xl font-medium">{plan.price}</span><span className="ml-2 text-sm text-[#335B74]">{plan.cadence}</span></div><p className="mt-5 text-sm font-medium">Best for: <span className="font-normal text-[#335B74]">{plan.bestFor}</span></p><Link href="#maintenance-booking" className={`${primaryButton} mt-auto w-full`}>Book Service <ArrowRight className="ml-3 size-4" /></Link></article>)}</div></div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="included-heading">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"><div className="relative min-h-[520px] overflow-hidden border border-[#EDF2F7]"><Image src="/Installation page picsh/why choose us on isntallation.webp" alt="Technician discussing air conditioner care with homeowners" fill className="object-cover" sizes="(min-width: 1024px) 55vw, 100vw" quality={100} unoptimized /></div><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Every visit, covered</p><h2 id="included-heading" className={heading}>Everything included in every service.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Professional servicing for every visit, with clear checks and a report you can understand.</p><div className="mt-10 grid gap-5 sm:grid-cols-2">{includedItems.map(([Icon, title]) => <div key={title} className="flex items-start gap-3 border-b border-[#EDF2F7] pb-4"><Icon className="mt-0.5 size-5 shrink-0 text-[#1C99D6]" strokeWidth={1.7} /><span className="text-sm text-[#0A2540]">{title}</span></div>)}</div></div></div>
      </section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="signs-heading"><div className="mx-auto max-w-[1280px]"><div className="max-w-[620px]"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Know the signs</p><h2 id="signs-heading" className={heading}>When your system needs care.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Small changes are often the first sign that a service visit could help.</p></div><div className="mt-12 grid gap-8 border-t border-[#EDF2F7] pt-8 md:grid-cols-4">{signs.map(([Icon, title, copy]) => <div key={title} className="group"><Icon className="size-5 text-[#1C99D6] transition-transform duration-200 group-hover:scale-105" strokeWidth={1.7} /><h3 className="mt-5 text-lg font-medium">{title}</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">{copy}</p></div>)}</div></div></section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-process"><div className="mx-auto max-w-[1000px]"><div className="text-center"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">A clear process</p><h2 id="maintenance-process" className={heading}>How maintenance works.</h2></div><div className="mt-14 grid gap-10 md:grid-cols-3"><div className="border-t-2 border-[#1C99D6] pt-6"><span className="text-3xl font-medium text-[#1C99D6]">01</span><h3 className="mt-5 text-lg font-medium">Choose your plan</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">Select the care rhythm that suits your home.</p></div><div className="border-t-2 border-[#1C99D6] pt-6"><span className="text-3xl font-medium text-[#1C99D6]">02</span><h3 className="mt-5 text-lg font-medium">We schedule your visit</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">We agree a convenient time and confirm what to expect.</p></div><div className="border-t-2 border-[#1C99D6] pt-6"><span className="text-3xl font-medium text-[#1C99D6]">03</span><h3 className="mt-5 text-lg font-medium">Your system is cared for</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">We service, test and report back with clear next steps.</p></div></div></div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-coverage"><div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div className="relative min-h-[330px] overflow-hidden border border-[#EDF2F7] bg-[#EAF5FA] p-8"><div className="absolute left-[20%] top-[25%] size-40 rounded-full border border-[#8ED0E8]/60" /><div className="absolute right-[18%] top-[35%] size-56 rounded-full border border-[#8ED0E8]/50" /><MapPin className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-[#1C99D6]" /><p className="absolute bottom-8 left-8 text-sm text-[#335B74]">Cape Town & surrounding areas</p></div><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Service coverage</p><h2 id="maintenance-coverage" className={heading}>Maintenance where you need it.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">We service homes across Cape Town and surrounding areas, usually within 24–48 hours of confirmation.</p><div className="mt-8 flex flex-wrap gap-4 text-sm text-[#335B74]"><span className="border border-[#EDF2F7] bg-white px-4 py-3">50+ areas covered</span><span className="border border-[#EDF2F7] bg-white px-4 py-3">24–48 hour response</span></div></div></div></section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-reviews"><div className="mx-auto max-w-[1100px]"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Customer stories</p><h2 id="maintenance-reviews" className={heading}>Peace of mind, maintained.</h2></div><div className="flex items-center gap-3"><span className="text-4xl font-medium">4.9/5</span><span className="text-sm text-[#335B74]">Based on 300+<br />service visits</span></div></div><blockquote className="mt-12 border-y border-[#EDF2F7] py-10 text-center"><div className="tracking-[0.12em] text-[#1C99D6]">★★★★★</div><p className="mx-auto mt-6 max-w-[760px] text-2xl leading-[1.45] text-[#0A2540]">“The technician was punctual, thorough and explained every recommendation clearly. Our aircon has never run better.”</p><footer className="mt-6 text-sm text-[#335B74]">Megan T. · Cape Town · Verified customer</footer></blockquote></div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-faq"><div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Before you book</p><h2 id="maintenance-faq" className={heading}>Everything you need to know.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Clear answers before your service visit.</p></div><div>{faqs.map(([question, answer], index) => <div key={question} className="border-b border-[#EDF2F7]"><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} className="flex min-h-[72px] w-full items-center justify-between py-5 text-left text-lg font-medium">{question}<span className={`text-2xl font-light text-[#1C99D6] transition-transform duration-200 ${openFaq === index ? "rotate-45" : ""}`}>+</span></button><div className={`grid transition-[grid-template-rows] duration-250 ${openFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><p className="overflow-hidden pb-5 text-base leading-[1.7] text-[#335B74]">{answer}</p></div></div>)}</div></div></section>

      <section id="maintenance-booking" className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="maintenance-booking-heading"><div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Ready when you are</p><h2 id="maintenance-booking-heading" className={heading}>Book Your Service.</h2><p className="mt-5 max-w-[560px] text-base leading-[1.7] text-[#335B74]">Tell us about your system and we&apos;ll help you choose the right maintenance plan.</p><form onSubmit={(event) => event.preventDefault()} className="mt-10 grid gap-5 sm:grid-cols-2"><input required placeholder="Name" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input required type="tel" placeholder="Phone" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input type="email" placeholder="Email" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><input placeholder="Suburb" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm outline-none focus:border-[#1C99D6]" /><select className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm text-[#335B74] outline-none focus:border-[#1C99D6]"><option>Select a service</option><option>One-off Service</option><option>Annual Care</option><option>Bi-Annual Care</option></select><input type="date" className="h-12 border border-[#DCE6EB] bg-white px-4 text-sm text-[#335B74] outline-none focus:border-[#1C99D6]" /><textarea placeholder="Tell us about your system" rows={4} className="border border-[#DCE6EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#1C99D6] sm:col-span-2" /><button type="submit" className={`${primaryButton} sm:col-span-2 sm:w-fit`}>Book Service <ArrowRight className="ml-3 size-4" /></button></form></div><div className="border-l border-[#DCE6EB] pl-8 lg:pl-12"><h3 className="text-xl font-medium">Prefer to speak with us?</h3><p className="mt-3 text-sm leading-[1.7] text-[#335B74]">Our specialists can help you decide what your system needs.</p><div className="mt-8 grid gap-4"><a href="#maintenance-booking" className="flex h-[46px] items-center gap-3 bg-[#1C99D6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1680B0]"><MessageCircle className="size-5" /> WhatsApp Us</a><a href="tel:+27210000000" className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Phone className="size-5 text-[#1C99D6]" /> Call Us</a><a href="mailto:hello@airconsstore.co.za" className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Mail className="size-5 text-[#1C99D6]" /> Email Us</a><span className="flex items-center gap-3 pt-4 text-sm text-[#335B74]"><Clock3 className="size-5 text-[#1C99D6]" /> Usually replies within 15 minutes</span></div></div></div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 text-center sm:px-6 lg:px-8"><div className="mx-auto max-w-[720px]"><h2 className={heading}>Keep Your Comfort Consistent.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Book your maintenance service today and stay ahead of avoidable repairs.</p><Link href="#maintenance-booking" className={`${primaryButton} mt-8`}>Book Service <ArrowRight className="ml-3 size-4" /></Link><p className="mt-8 text-sm text-[#335B74]">Accredited technicians · Clear reporting · Trusted workmanship</p></div></section>

      <a href="#maintenance-booking" className="fixed bottom-4 left-4 right-4 z-30 inline-flex h-12 items-center justify-center bg-[#1C99D6] text-sm font-semibold text-white shadow-lg md:hidden">Book Service</a>
    </div>
  );
}
