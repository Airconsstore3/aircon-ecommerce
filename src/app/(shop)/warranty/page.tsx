"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Upload,
  Wrench,
  Boxes,
  Cpu,
  Home,
  Clock3,
  Store,
  HelpCircle,
  Camera,
  Tag,
  MapPin,
  User,
  Package,
} from "lucide-react";

const buttonClass = "inline-flex h-[46px] items-center justify-center bg-[#1C99D6] px-7 text-sm font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-[#1680B0]";
const outlineButtonClass = "inline-flex h-[46px] items-center justify-center border border-[#1C99D6] px-7 text-sm font-semibold text-[#1C99D6] transition-colors hover:bg-[#F7FBFF]";
const headingClass = "font-[var(--font-google-sans-flex)] text-3xl font-medium leading-tight text-[#0A2540] md:text-[44px]";

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
  { icon: Store, title: "Bought from Aircons Store", copy: "Your warranty is ready to register.", cta: "Continue", href: "#warranty-form" },
  { icon: HelpCircle, title: "Bought Elsewhere", copy: "Check whether your product is eligible.", cta: "Check Eligibility", href: "#contact-support" },
  { icon: MessageCircle, title: "Need Help?", copy: "Not sure where you stand? Talk to us.", cta: "Contact Support", href: "#contact-support" },
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
  ["How long does approval take?", "Most requests are reviewed within 2–3 business days. We contact you by your preferred method once reviewed."],
  ["Can I claim without an invoice?", "An invoice or proof of purchase is required. Contact us if you're unable to locate it and we'll advise."],
];

const steps = [
  { number: "01", title: "Choose Request", copy: "Select register, extend or claim." },
  { number: "02", title: "Customer Details", copy: "Your name and contact information." },
  { number: "03", title: "Product Details", copy: "Brand, model and serial number." },
  { number: "04", title: "Upload Documents", copy: "Invoice, photos and certificates." },
  { number: "05", title: "Submit", copy: "Review and send your request." },
];

export default function WarrantyPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [formStep, setFormStep] = useState(0);
  const [requestType, setRequestType] = useState<"register" | "extend" | "claim">("register");
  const [submitted, setSubmitted] = useState(false);

  const nextStep = () => setFormStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setFormStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-white text-[#0A2540]">
      {/* Hero — split layout */}
      <section className="px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32" aria-labelledby="warranty-heading">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Warranty &amp; Support</p>
            <h1 id="warranty-heading" className="font-[var(--font-google-sans-flex)] text-[44px] font-medium leading-[0.98] tracking-tight sm:text-[56px] lg:text-[64px]">Warranty Made Simple.</h1>
            <p className="mt-6 max-w-[520px] text-lg leading-[1.7] text-[#335B74]">Register your product, extend eligible warranties or submit a claim in just a few steps.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#warranty-form" className={buttonClass} onClick={() => { setRequestType("register"); setFormStep(0); }}>Register Warranty <ArrowRight className="ml-3 size-4" /></Link>
              <Link href="#warranty-form" className={outlineButtonClass} onClick={() => { setRequestType("claim"); setFormStep(0); }}>Submit a Claim</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#335B74]">
              <span className="flex items-center gap-2"><CheckCircle className="size-4 text-[#1C99D6]" /> Manufacturer Support</span>
              <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#1C99D6]" /> Secure Registration</span>
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-[#1C99D6]" /> Response Within 2–3 Days</span>
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
              { icon: ShieldCheck, title: "Register Warranty", copy: "Bought a new air conditioner? Register your warranty.", cta: "Register", value: "register" as const },
              { icon: Clock3, title: "Extend Warranty", copy: "Extend eligible manufacturer coverage.", cta: "Extend Warranty", value: "extend" as const },
              { icon: Wrench, title: "Submit a Claim", copy: "Having a warranty issue? We'll guide you through the process.", cta: "Start Claim", value: "claim" as const },
            ].map(({ icon: Icon, title, copy, cta, value }) => (
              <Link key={title} href="#warranty-form" onClick={() => { setRequestType(value); setFormStep(0); }} className="group flex flex-col bg-white p-8 transition-colors hover:bg-[#F7FBFF] lg:p-10">
                <Icon className="size-6 text-[#1C99D6]" strokeWidth={1.7} />
                <h3 className="mt-6 text-xl font-medium">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1C99D6]">{cta} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
              </Link>
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
              <Link key={title} href={href} className="group flex flex-col bg-white p-8 transition-colors hover:bg-[#F7FBFF]">
                <Icon className="size-6 text-[#1C99D6]" strokeWidth={1.7} />
                <h3 className="mt-6 text-lg font-medium">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-[1.6] text-[#335B74]">{copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1C99D6]">{cta} <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" /></span>
              </Link>
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
            <div className="relative grid grid-cols-5">
              <div className="absolute left-[10%] right-[10%] top-[27px] h-[2px] bg-[#DCE6EB]" />
              {[["01", "Choose Your Request", "Select register, extend or claim."], ["02", "Complete the Form", "Fill in your product and contact details."], ["03", "Upload Documents", "Add proof of purchase and photos if claiming."], ["04", "We Review", "Our team reviews your request."], ["05", "Confirmation", "You hear back by email or WhatsApp."]].map(([number, title, copy], i) => (
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

          {/* Mobile timeline */}
          <div className="mt-12 md:hidden">
            <div className="relative">
              <div className="absolute bottom-2 left-[27px] top-2 w-[2px] bg-[#DCE6EB]" />
              {[["01", "Choose Your Request", "Select register, extend or claim."], ["02", "Complete the Form", "Fill in your product and contact details."], ["03", "Upload Documents", "Add proof of purchase and photos if claiming."], ["04", "We Review", "Our team reviews your request."], ["05", "Confirmation", "You hear back by email or WhatsApp."]].map(([number, title, copy], i) => (
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
        </div>
      </section>

      {/* Required Documents — chip cards */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="documents-heading">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[620px]">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Before You Start</p>
            <h2 id="documents-heading" className={headingClass}>Required Documents.</h2>
            <p className="mt-5 text-base leading-[1.7] text-[#335B74]">Have these ready before filling out the form to speed up your request.</p>
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

      {/* Trust Banner */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1000px] border border-[#EDF2F7] p-10 text-center lg:p-14">
          <HelpCircle className="mx-auto size-8 text-[#1C99D6]" strokeWidth={1.7} />
          <h2 className="mt-6 text-2xl font-medium leading-tight md:text-3xl">Not sure whether your product is covered?</h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base leading-[1.7] text-[#335B74]">Talk to our support team before submitting your request.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/27210000000" className={buttonClass}><MessageCircle className="mr-3 size-5" /> WhatsApp</a>
            <a href="tel:+27210000000" className={outlineButtonClass}><Phone className="mr-3 size-5" /> Call</a>
            <a href="mailto:support@airconsstore.co.za" className={outlineButtonClass}><Mail className="mr-3 size-5" /> Email</a>
          </div>
        </div>
      </section>

      {/* Multi-Step Warranty Form */}
      <section id="warranty-form" className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="form-heading">
        <div className="mx-auto max-w-[860px]">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">Warranty Form</p>
            <h2 id="form-heading" className={headingClass}>Submit Your Request.</h2>
            <p className="mx-auto mt-5 max-w-[520px] text-base leading-[1.7] text-[#335B74]">Complete the steps below and our team will handle the rest.</p>
          </div>

          {submitted ? (
            <div className="mt-12 border border-[#EDF2F7] p-10 text-center">
              <CheckCircle className="mx-auto size-10 text-[#1C99D6]" />
              <h3 className="mt-6 text-xl font-medium">Request received.</h3>
              <p className="mx-auto mt-2 max-w-[440px] text-sm leading-[1.7] text-[#335B74]">We&apos;ll review your request and contact you within 2–3 business days by your preferred method.</p>
            </div>
          ) : (
            <div className="mt-12">
              {/* Step indicator */}
              <div className="mb-10">
                <div className="hidden md:block">
                  <div className="relative grid grid-cols-5">
                    <div className="absolute left-[10%] right-[10%] top-[27px] h-[2px] bg-[#DCE6EB]" />
                    <div className="absolute left-[10%] top-[27px] h-[2px] bg-[#1C99D6] transition-all duration-300" style={{ width: `${(formStep / (steps.length - 1)) * 80}%` }} />
                    {steps.map((step, i) => (
                      <div key={step.number} className="relative flex flex-col items-center px-1 text-center">
                        <span className={`relative z-10 flex size-14 items-center justify-center rounded-full border-2 transition-all duration-200 ${i <= formStep ? "border-[#1C99D6] bg-[#1C99D6] text-white" : "border-[#DCE6EB] bg-white text-[#335B74]"}`}>
                          <span className="text-[18px] font-semibold tracking-[-0.02em]">{step.number}</span>
                        </span>
                        <h3 className="mt-5 text-xs font-medium md:text-sm">{step.title}</h3>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Mobile step indicator */}
                <div className="flex items-center justify-between md:hidden">
                  <span className="text-sm font-semibold text-[#1C99D6]">Step {formStep + 1} of {steps.length}</span>
                  <span className="text-sm text-[#335B74]">{steps[formStep].title}</span>
                </div>
                <div className="mt-3 h-1 w-full bg-[#DCE6EB] md:hidden">
                  <div className="h-1 bg-[#1C99D6] transition-all duration-300" style={{ width: `${((formStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if (formStep === steps.length - 1) setSubmitted(true); else nextStep(); }} className="space-y-8">
                {/* Step 0: Request Type */}
                {formStep === 0 && (
                  <fieldset>
                    <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Request Type</legend>
                    <div className="grid gap-px border border-[#EDF2F7] bg-[#EDF2F7] sm:grid-cols-3">
                      {([["register", "Register Warranty"], ["extend", "Extend Warranty"], ["claim", "Warranty Claim"]] as const).map(([value, label]) => (
                        <button key={value} type="button" onClick={() => setRequestType(value)} className={`flex items-center justify-center gap-2 px-4 py-5 text-sm font-medium transition-colors ${requestType === value ? "bg-[#1C99D6] text-white" : "bg-white text-[#335B74] hover:bg-[#F7FBFF]"}`}>
                          {requestType === value && <CheckCircle className="size-4" />} {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                {/* Step 1: Customer Details */}
                {formStep === 1 && (
                  <fieldset>
                    <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Customer Information</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <input required placeholder="Name" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required placeholder="Surname" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required type="email" placeholder="Email" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required type="tel" placeholder="Phone" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                    </div>
                  </fieldset>
                )}

                {/* Step 2: Product Details */}
                {formStep === 2 && (
                  <fieldset>
                    <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Product Information</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <input required placeholder="Brand" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required placeholder="Model Number" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required placeholder="Serial Number" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input required type="date" placeholder="Purchase Date" className="h-12 border border-[#DCE6EB] px-4 text-sm text-[#335B74] outline-none focus:border-[#1C99D6]" />
                      <input placeholder="Purchase Location" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6]" />
                      <input type="date" placeholder="Installation Date" className="h-12 border border-[#DCE6EB] px-4 text-sm text-[#335B74] outline-none focus:border-[#1C99D6]" />
                      <input placeholder="Installation Address" className="h-12 border border-[#DCE6EB] px-4 text-sm outline-none focus:border-[#1C99D6] sm:col-span-2" />
                    </div>
                  </fieldset>
                )}

                {/* Step 3: Upload Documents */}
                {formStep === 3 && (
                  <fieldset>
                    <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Upload Documents</legend>
                    {requestType === "claim" && (
                      <textarea required placeholder="Issue Description" rows={4} className="mb-5 w-full border border-[#DCE6EB] px-4 py-3 text-sm outline-none focus:border-[#1C99D6]" />
                    )}
                    <div className="grid gap-5 sm:grid-cols-3">
                      {["Upload Invoice", "Upload Photos", "Installation Certificate"].map((label) => (
                        <label key={label} className="group flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[#DCE6EB] px-4 py-10 text-center transition-colors hover:border-[#1C99D6] hover:bg-[#F7FBFF]">
                          <Upload className="size-6 text-[#1C99D6]" strokeWidth={1.7} />
                          <span className="text-sm font-medium text-[#0A2540]">{label}</span>
                          <span className="text-xs text-[#335B74]">Drag file here or browse</span>
                          <input type="file" className="hidden" />
                        </label>
                      ))}
                    </div>
                    {/* Preferred Contact */}
                    <legend className="mb-4 mt-8 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Preferred Contact Method</legend>
                    <div className="grid gap-px border border-[#EDF2F7] bg-[#EDF2F7] sm:grid-cols-3">
                      {(["WhatsApp", "Email", "Phone Call"] as const).map((method, i) => (
                        <label key={method} className="flex cursor-pointer items-center justify-center gap-2 bg-white px-4 py-4 text-sm font-medium text-[#335B74] transition-colors hover:bg-[#F7FBFF]">
                          <input type="radio" name="contact" defaultChecked={i === 0} className="size-4 accent-[#1C99D6]" /> {method}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {/* Step 4: Review & Submit */}
                {formStep === 4 && (
                  <fieldset>
                    <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.06em] text-[#0A2540]">Review &amp; Submit</legend>
                    <div className="border border-[#EDF2F7] p-8">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="mt-0.5 size-5 shrink-0 text-[#1C99D6]" />
                        <div>
                          <h3 className="text-base font-medium">Ready to submit?</h3>
                          <p className="mt-2 text-sm leading-[1.7] text-[#335B74]">Request type: <span className="font-medium text-[#0A2540]">{requestType === "register" ? "Register Warranty" : requestType === "extend" ? "Extend Warranty" : "Warranty Claim"}</span></p>
                          <p className="mt-1 text-sm leading-[1.7] text-[#335B74]">Our team will review your request and respond within 2–3 business days.</p>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-4 pt-4">
                  <button type="button" onClick={prevStep} disabled={formStep === 0} className={`inline-flex h-[46px] items-center px-6 text-sm font-semibold transition-colors ${formStep === 0 ? "cursor-not-allowed text-[#DCE6EB]" : "text-[#1C99D6] hover:bg-[#F7FBFF]"}`}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </button>
                  <button type="submit" className={buttonClass}>
                    {formStep === steps.length - 1 ? "Submit Warranty Request" : "Continue"} <ArrowRight className="ml-3 size-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* What Happens Next — timeline */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" aria-labelledby="next-heading">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#1C99D6]">After You Submit</p>
            <h2 id="next-heading" className={headingClass}>What Happens Next.</h2>
          </div>
          <div className="mt-16 hidden md:block">
            <div className="relative grid grid-cols-4">
              <div className="absolute left-[12.5%] right-[12.5%] top-[27px] h-[2px] bg-[#DCE6EB]" />
              {[["01", "Submitted", "We receive your details instantly."], ["02", "Reviewed", "Our team checks your documents."], ["03", "Contacted", "By your preferred method within 2–3 days."], ["04", "Resolved", "Your request is approved or we request more info."]].map(([number, title, copy], i) => (
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
              {[["01", "Submitted", "We receive your details instantly."], ["02", "Reviewed", "Our team checks your documents."], ["03", "Contacted", "By your preferred method within 2–3 days."], ["04", "Resolved", "Your request is approved or we request more info."]].map(([number, title, copy], i) => (
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
            {faqs.map(([question, answer], index) => (
              <div key={question} className="border-b border-[#EDF2F7]">
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} className="flex min-h-[72px] w-full items-center justify-between py-5 text-left text-lg font-medium">
                  {question}
                  <span className={`text-2xl font-light text-[#1C99D6] transition-transform duration-200 ${openFaq === index ? "rotate-45" : ""}`}>+</span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-250 ${openFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden pb-5 text-base leading-[1.7] text-[#335B74]">{answer}</p>
                </div>
              </div>
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
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="https://wa.me/27210000000" className={`${buttonClass} w-full sm:w-auto`}><MessageCircle className="mr-3 size-5" /> WhatsApp</a>
            <a href="tel:+27210000000" className={`${outlineButtonClass} w-full sm:w-auto`}><Phone className="mr-3 size-5" /> Call Us</a>
            <a href="mailto:support@airconsstore.co.za" className={`${outlineButtonClass} w-full sm:w-auto`}><Mail className="mr-3 size-5" /> Email Support</a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className={headingClass}>Still Need Help?</h2>
          <p className="mx-auto mt-5 max-w-[440px] text-base leading-[1.7] text-[#335B74]">We&apos;re here to help with registrations, extensions and warranty claims.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="https://wa.me/27210000000" className={`${buttonClass} w-full sm:w-auto`}><MessageCircle className="mr-3 size-5" /> WhatsApp</a>
            <a href="tel:+27210000000" className={`${outlineButtonClass} w-full sm:w-auto`}><Phone className="mr-3 size-5" /> Call</a>
            <a href="mailto:support@airconsstore.co.za" className={`${outlineButtonClass} w-full sm:w-auto`}><Mail className="mr-3 size-5" /> Email</a>
          </div>
        </div>
      </section>
    </div>
  );
}
