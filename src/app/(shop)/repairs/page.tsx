import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock3,
  Droplets,
  FileCheck2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Volume2,
  Zap,
} from "lucide-react";

import {
  buildWhatsAppHref,
  getContactChannels,
} from "@/lib/contact-settings";

// TODO(content): a gallery of completed repair jobs may be reinstated only
// with documented real work. Required per item: repair type, aircon brand/model,
// general location (with customer permission), work performed, date, and
// photographer/source permission. Do not use stock or marketing imagery.

const problems = [
  [Thermometer, "Not Cooling", "Your system runs but the room stays warm."],
  [Droplets, "Water Leaking", "Leaks can signal a blocked drain or drainage issue."],
  [Volume2, "Making Noise", "Unusual sounds should be checked before they worsen."],
  [Sparkles, "Bad Smells", "Persistent odours often need a clean or repair."],
  [AlertTriangle, "Error Codes", "Fault codes on the display point to a specific issue."],
  [Zap, "No Power", "We diagnose electrical and control issues safely."],
] as const;

const repairServices = [
  ["Diagnostic Inspection", "Accurate fault-finding before any repair is recommended."],
  ["Electrical Repairs", "Safe repairs for wiring, capacitors and electrical connections."],
  ["Gas Leak Detection", "Thorough checks to locate and resolve refrigerant leaks."],
  ["Refrigerant Regas", "Restore cooling performance when refrigerant levels are low."],
  ["Compressor Repairs", "Diagnosis and repair for one of the system's most important components."],
  ["PCB & Control Board Repairs", "Specialist support for control, sensor and circuit faults."],
];

const brands = [
  ["Samsung", "/Hero Images/aircon coursel logo/samsung aircon.png"],
  ["Alliance", "/Hero Images/aircon coursel logo/alliance aircon.png"],
  ["Daikin", "/Hero Images/aircon coursel logo/daikin aircon.png"],
  ["LG", "/Hero Images/aircon coursel logo/lg aircon.png"],
  ["Midea", "/Hero Images/aircon coursel logo/midea aircon.png"],
  ["Hisense", "/Hero Images/aircon coursel logo/hisense aircon.png"],
] as const;

const faqs = [
  ["Can you repair all brands?", "We work with all major residential air conditioner brands and can confirm compatibility when you share your model."],
  ["How much does a diagnosis cost?", "We confirm the callout and diagnostic pricing before the visit, so you know what to expect."],
  ["Will my system need replacement?", "Not necessarily. We diagnose the fault first and explain whether repair or replacement makes the most sense."],
  ["Do you carry spare parts?", "We carry common parts and can source quality replacements when required."],
  ["How long do repairs take?", "Many repairs are completed during the first visit. More complex faults may require additional parts or testing."],
];

const buttonClass = "inline-flex h-[46px] items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";
const headingClass = "font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-[#0A2540] md:text-[44px]";

// Contact details come from the settings table — render on demand so admin
// changes take effect without a rebuild.
export const dynamic = "force-dynamic";

export default async function RepairsPage() {
  const contact = await getContactChannels();
  const whatsappRepairHref = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I'd like to book a repair.")
    : null;
  const hasContactChannel = Boolean(whatsappRepairHref || contact.phoneTel || contact.email);

  return (
    <div className="min-h-screen bg-white text-[#0A2540]">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8" aria-labelledby="repair-heading">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-8">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Air Conditioner Repair</p>
            <h1 id="repair-heading" className="font-[var(--font-google-sans-flex)] text-[44px] font-medium leading-[0.98] tracking-tight sm:text-[56px] lg:text-[64px]">We&apos;ll Find the Problem.<br />We&apos;ll Fix It Right.</h1>
            <p className="mt-6 max-w-[560px] text-lg leading-[1.7] text-[#335B74]">Fault diagnosis and air conditioner repairs by our technicians, using proper repair procedures and quality replacement parts.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#repair-booking" className={buttonClass}>Schedule a Repair <ArrowRight className="ml-3 size-4" /></a>
              <a href="#repair-contact" className="inline-flex h-[46px] items-center border border-[#1C99D6] px-7 text-sm font-semibold text-[#1C99D6] transition-colors hover:bg-[#F7FBFF]">Talk to a Technician</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#335B74]">
              <span className="flex items-center gap-2"><CheckCircle className="size-4 text-[#1C99D6]" /> Fault Diagnostics</span>
              <span className="flex items-center gap-2"><FileCheck2 className="size-4 text-[#1C99D6]" /> Quotes Before Work</span>
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#1C99D6]" /> All Major Brands</span>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden border border-[#EDF2F7] lg:min-h-[560px]">
            <Image src="/Installation page picsh/why choose us on isntallation.webp" alt="Aircons Store technician diagnosing an indoor unit with diagnostic equipment" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" quality={100} unoptimized priority />
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8" aria-labelledby="problem-heading">
        <div className="mx-auto max-w-[1280px]"><div className="max-w-[620px]"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Start with the symptom</p><h2 id="problem-heading" className={headingClass}>What problem are you experiencing?</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Choose the issue that sounds most like what is happening. We&apos;ll help you take the next step.</p></div><div className="mt-12 grid grid-cols-1 border-t border-[#EDF2F7] md:grid-cols-3">{problems.map(([Icon, title, copy]) => <a key={title} href="#repair-booking" className="group border-b border-[#EDF2F7] p-7 transition-colors hover:bg-[#F7FBFF] md:border-r md:last:border-r-0"><Icon className="size-5 text-[#1C99D6] transition-transform duration-200 group-hover:scale-105" strokeWidth={1.7} /><h3 className="mt-6 text-xl font-medium transition-colors group-hover:text-[#1C99D6]">{title}</h3><p className="mt-2 text-sm leading-[1.6] text-[#335B74]">{copy}</p><ArrowRight className="mt-6 size-4 text-[#1C99D6] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" /></a>)}</div></div>
      </section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="repair-services-heading">
        <div className="mx-auto max-w-[1280px]"><div className="max-w-[620px]"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">What we repair</p><h2 id="repair-services-heading" className={headingClass}>Repair services built around the real fault.</h2></div><div className="mt-12 grid gap-x-12 md:grid-cols-2">{repairServices.map(([title, copy]) => <div key={title} className="flex items-start justify-between gap-6 border-b border-[#DCE6EB] py-6"><div><h3 className="text-lg font-medium">{title}</h3><p className="mt-2 max-w-[420px] text-sm leading-[1.6] text-[#335B74]">{copy}</p></div><ArrowRight className="mt-1 size-4 shrink-0 text-[#1C99D6]" /></div>)}</div></div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="repair-process-heading"><div className="mx-auto max-w-[1100px]"><div className="text-center"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">What to Expect</p><h2 id="repair-process-heading" className={headingClass}>From Diagnosis to Repair.</h2><p className="mx-auto mt-5 max-w-[560px] text-base leading-[1.7] text-[#335B74]">A clear, transparent repair process designed to get your air conditioner working again with confidence.</p></div>

      {/* Desktop timeline */}
      <div className="mt-16 hidden md:block">
        <div className="relative grid grid-cols-5">
          <div className="absolute left-[10%] right-[10%] top-[27px] h-[2px] bg-[#DCE6EB]" />
          {[["01", "Describe the Issue", "Tell us what’s happening with your air conditioner."], ["02", "Find the Cause", "We identify the fault before recommending repairs."], ["03", "Review Your Quote", "See the cost and approve the work first."], ["04", "Repair & Test", "The repair is completed and every function is tested."], ["05", "Back to Comfort", "Enjoy cooling with confidence."]].map(([number, title, copy], i) => (
            <div key={number} className="group relative flex flex-col items-center px-2 text-center">
              <span className={`relative z-10 flex size-14 items-center justify-center rounded-full border-2 transition-all duration-200 ${i === 0 ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#1C99D6] bg-white text-[#1C99D6] group-hover:bg-[#1C99D6] group-hover:text-white"}`}>
                <span className="text-[18px] font-semibold tracking-[-0.02em]">{number}</span>
              </span>
              <h3 className="mt-7 text-base font-medium transition-colors duration-200 group-hover:text-[#1C99D6]">{title}</h3>
              <p className="mt-4 max-w-[180px] text-sm leading-[1.6] text-[#335B74]">{copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile timeline (vertical) */}
      <div className="mt-12 md:hidden">
        <div className="relative">
          <div className="absolute bottom-2 left-[27px] top-2 w-[2px] bg-[#DCE6EB]" />
          {[["01", "Describe the Issue", "Tell us what’s happening with your air conditioner."], ["02", "Find the Cause", "We identify the fault before recommending repairs."], ["03", "Review Your Quote", "See the cost and approve the work first."], ["04", "Repair & Test", "The repair is completed and every function is tested."], ["05", "Back to Comfort", "Enjoy cooling with confidence."]].map(([number, title, copy], i) => (
            <div key={number} className="group relative flex gap-5 pb-8 last:pb-0">
              <span className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${i === 0 ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#1C99D6] bg-white text-[#1C99D6]"}`}>
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

      <div className="mt-14 flex items-start justify-center gap-3 border-t border-[#EDF2F7] pt-8 text-center"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#1C99D6]" /><p className="max-w-[640px] text-sm leading-[1.7] text-[#335B74]">Know the problem, understand the cost, approve the repair.</p></div>
      </div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="repair-trust-heading"><div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]"><div className="relative min-h-[520px] overflow-hidden border border-[#EDF2F7]"><Image src="/Installation page picsh/why choose us on isntallation.webp" alt="Aircons Store technician diagnosing an air conditioner with homeowners" fill className="object-cover" sizes="(min-width: 1024px) 58vw, 100vw" quality={100} unoptimized /></div><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Why Aircons Store</p><h2 id="repair-trust-heading" className={headingClass}>Every Repair Starts With the Right Diagnosis.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Every repair begins with a complete system inspection, a clear explanation of the fault and a quotation before any work starts.</p><ul className="mt-10 grid gap-5">{["Full System Diagnosis", "Quote Before Repairs", "Quality Replacement Parts", "Proper Repair Procedures", "Performance Testing Before Handover", "Support After the Repair"].map((item) => <li key={item} className="flex items-center gap-3 border-b border-[#EDF2F7] pb-4 text-sm"><CheckCircle className="size-5 text-[#1C99D6]" /> {item}</li>)}</ul></div></div></section>

      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="brands-heading"><div className="mx-auto max-w-[1280px] text-center"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Major manufacturers</p><h2 id="brands-heading" className={headingClass}>Brands we repair.</h2><p className="mx-auto mt-5 max-w-[520px] text-base leading-[1.7] text-[#335B74]">Repair and support for the same brands we supply.</p><div className="mt-12 grid grid-cols-2 border-y border-[#EDF2F7] sm:grid-cols-3 lg:grid-cols-6">{brands.map(([name, image]) => <span key={name} className="flex items-center justify-center border-b border-[#EDF2F7] px-6 py-8 opacity-70 transition-all duration-200 hover:opacity-100 lg:border-b-0 lg:border-r lg:last:border-r-0"><Image src={image} alt={name} width={140} height={56} className="h-10 w-auto object-contain md:h-12" quality={100} unoptimized /></span>)}</div></div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="repair-faq-heading"><div className="mx-auto grid max-w-[1000px] gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Before you book</p><h2 id="repair-faq-heading" className={headingClass}>Questions before booking?</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Clear answers about diagnosis, repairs and what to expect.</p></div><div>{faqs.map(([question, answer]) => <details key={question} className="group border-b border-[#EDF2F7]"><summary className="flex min-h-[72px] w-full cursor-pointer list-none items-center justify-between py-5 text-left text-lg font-medium [&::-webkit-details-marker]:hidden">{question}<span className="text-2xl font-light text-[#1C99D6] transition-transform duration-200 group-open:rotate-45">+</span></summary><p className="pb-5 text-base leading-[1.7] text-[#335B74]">{answer}</p></details>)}</div></div></section>

      {/* Repair enquiry — real contact channels from settings, no fake form */}
      <section id="repair-booking" className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="repair-booking-heading"><div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Final step</p><h2 id="repair-booking-heading" className={headingClass}>Schedule Your Repair</h2><p className="mt-5 max-w-[600px] text-base leading-[1.7] text-[#335B74]">Tell us what is happening and our team will help you find the right next step. The fastest way to book is to message or call us directly.</p>
      <div className="mt-10 border border-[#EDF2F7] bg-[#F8FBFD] p-8"><h3 className="text-lg font-medium">What to include when you contact us</h3><ul className="mt-5 grid gap-3">{["A short description of the problem", "Your air conditioner brand and model", "Your area (suburb and city)", "Photos of the unit or fault, if available"].map((item) => <li key={item} className="flex items-center gap-3 text-sm text-[#335B74]"><CheckCircle className="size-4 shrink-0 text-[#1C99D6]" /> {item}</li>)}</ul></div></div>
      <div id="repair-contact" className="border-l border-[#DCE6EB] pl-8 lg:pl-12"><h3 className="text-xl font-medium">Talk to a Technician</h3><p className="mt-3 text-sm leading-[1.7] text-[#335B74]">Our repair team can help you understand the next step before you book.</p>{hasContactChannel ? <div className="mt-8 grid gap-4">{whatsappRepairHref && <a href={whatsappRepairHref} target="_blank" rel="noopener noreferrer" className="flex h-[46px] items-center gap-3 bg-[#1C99D6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1680B0]"><MessageCircle className="size-5" /> WhatsApp a Technician</a>}{contact.phoneTel && <a href={contact.phoneTel} className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Phone className="size-5 text-[#1C99D6]" /> Call Us</a>}{contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-3 border-b border-[#EDF2F7] py-4 text-sm font-medium hover:text-[#1C99D6]"><Mail className="size-5 text-[#1C99D6]" /> Email Us</a>}</div> : null}<div className="mt-10 grid gap-4 text-sm text-[#335B74]"><span className="flex items-center gap-3"><Clock3 className="size-4 text-[#1C99D6]" /> Serving Cape Town and surrounding areas</span><span className="flex items-center gap-3"><ShieldCheck className="size-4 text-[#1C99D6]" /> Transparent repair recommendations</span></div></div></div></section>

      <section className="bg-[#F8FBFD] px-4 py-24 text-center sm:px-6 lg:px-8"><div className="mx-auto max-w-[720px]"><h2 className={headingClass}>Let&apos;s Solve Your Problem.</h2><p className="mt-5 text-base leading-[1.7] text-[#335B74]">Schedule a repair or talk to a technician about what&apos;s happening.</p><a href="#repair-booking" className={`${buttonClass} mt-8`}>Schedule a Repair <ArrowRight className="ml-3 size-4" /></a><p className="mt-8 text-sm text-[#335B74]">Fault Diagnostics · Quotes Before Work · All Major Brands</p></div></section>

      <a href="#repair-booking" className="fixed bottom-4 left-4 right-4 z-30 inline-flex h-12 items-center justify-center bg-[#1C99D6] text-sm font-semibold text-white shadow-lg md:hidden">Schedule a Repair</a>
    </div>
  );
}
