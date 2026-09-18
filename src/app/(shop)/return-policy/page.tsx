"use client";

import { Check, X, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fontClass = "font-[var(--font-google-sans-flex)]";

const overviewCards = [
  {
    title: "Return Window",
    description: "Eligible products may be returned within the applicable return period.",
  },
  {
    title: "Condition",
    description: "Unused, uninstalled products in their original packaging.",
  },
  {
    title: "Faulty Products",
    description: "Covered in accordance with the Consumer Protection Act and manufacturer warranty.",
  },
  {
    title: "Refunds",
    description: "Processed after inspection and approval.",
  },
];

const returnSteps = [
  {
    number: "01",
    title: "Submit Request",
    description: "Tell us about your order.",
  },
  {
    number: "02",
    title: "Review Order",
    description: "We'll confirm eligibility.",
  },
  {
    number: "03",
    title: "Collection",
    description: "Arrange pickup or drop-off.",
  },
  {
    number: "04",
    title: "Inspection",
    description: "We inspect the product.",
  },
  {
    number: "05",
    title: "Refund",
    description: "Refund or replacement.",
  },
];

const damagedSteps = [
  {
    title: "Take photos",
    description: "Document the damage with clear photographs.",
  },
  {
    title: "Contact us",
    description: "Reach out within 48 hours of delivery.",
  },
  {
    title: "We'll arrange inspection",
    description: "Our team will assess the damage.",
  },
  {
    title: "Replacement or refund",
    description: "We'll provide a solution promptly.",
  },
];

const eligibleItems = [
  "Unused products",
  "Original packaging",
  "Complete accessories",
  "Proof of purchase",
];

const notEligibleItems = [
  "Installed products",
  "Custom commercial orders",
  "Spare parts",
  "Clearance items marked non-returnable",
];

const faqs = [
  {
    question: "Can I return an installed air conditioner?",
    answer: "Installed units generally cannot be returned unless there's a manufacturing fault. Contact us for warranty assessment.",
  },
  {
    question: "Can I exchange for another model?",
    answer: "Yes, exchanges are possible for eligible products in unused condition. Contact us to discuss options.",
  },
  {
    question: "Who pays return shipping?",
    answer: "We cover return shipping for faulty items. Change-of-mind returns may incur collection fees.",
  },
  {
    question: "How long do refunds take?",
    answer: "Refunds are processed within 3-5 business days after approval, depending on your payment provider.",
  },
  {
    question: "Can I cancel before delivery?",
    answer: "Yes, you can cancel before dispatch. Once shipped, the return process applies.",
  },
  {
    question: "Do commercial systems qualify?",
    answer: "Commercial custom orders are generally non-returnable. Fault claims are handled under warranty.",
  },
];

export default function ReturnPolicyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={`min-h-screen bg-white ${fontClass}`}>
      {/* Hero */}
      <section className="pt-[96px] pb-[96px] md:pt-[128px] md:pb-[128px] px-6">
        <div className="mx-auto max-w-[820px]">
          <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6] mb-4">
            RETURN & REFUND POLICY
          </p>
          <h1 className="text-[64px] font-medium leading-[1.05] tracking-tight text-[#0A2540] mb-6">
            Returns made simple.
          </h1>
          <p className="text-[18px] leading-[1.7] text-[#5F6B7A] max-w-[680px]">
            If something isn&apos;t right, we&apos;ll help you find the best solution. Whether you need a return, exchange or warranty assessment, here&apos;s how the process works.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* Quick Overview Cards */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-12">
            Quick Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {overviewCards.map((card, index) => (
              <div key={index} className="border border-gray-200 p-6 rounded-none">
                <h3 className="text-[20px] font-medium text-[#0A2540] mb-3">
                  {card.title}
                </h3>
                <p className="text-[18px] leading-[1.7] text-[#5F6B7A]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* How Returns Work */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540]">
            How Returns Work
          </h2>
          <p className="text-[18px] leading-[1.7] text-[#5F6B7A] mt-5">
            Our returns process is straightforward. We&apos;ll keep you informed every step.
          </p>

          <div className="h-px bg-gray-200 mt-16" />

          <div className="mt-16 space-y-0">
            {returnSteps.map((step, index) => (
              <div key={index} className="py-8">
                <div className="flex items-start gap-12">
                  <div className="flex items-center gap-6 shrink-0 w-[280px]">
                    <span className="text-[20px] font-semibold text-[#1C99D6]">
                      {step.number}
                    </span>
                    <h3 className="text-[18px] font-medium text-[#0A2540]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[18px] leading-[1.7] text-[#5F6B7A]">
                    {step.description}
                  </p>
                </div>
                {index < returnSteps.length - 1 && (
                  <div className="h-px bg-gray-200 mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* Return Eligibility */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-12">
            Return Eligibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-[20px] font-medium text-[#0A2540] mb-6">
                Eligible
              </h3>
              <ul className="space-y-4">
                {eligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="size-5 text-[#1C99D6] shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-[18px] leading-[1.7] text-[#0A2540]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[20px] font-medium text-[#0A2540] mb-6">
                Not Eligible
              </h3>
              <ul className="space-y-4">
                {notEligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="size-5 text-[#94A3B8] shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-[18px] leading-[1.7] text-[#0A2540]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* Damaged Deliveries */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-6">
            If Your Order Arrives Damaged
          </h2>
          <p className="text-[18px] leading-[1.7] text-[#5F6B7A] mb-12 max-w-[680px]">
            If your order arrives damaged, do not install the unit. Take clear photographs and contact us within 48 hours.
          </p>
          <div className="space-y-8">
            {damagedSteps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center size-[52px] rounded-full bg-white border-2 border-[#1C99D6] text-[#1C99D6] font-semibold text-[16px] shrink-0">
                    {index + 1}
                  </div>
                  {index < damagedSteps.length - 1 && (
                    <div className="w-px h-8 bg-[#E5E7EB] mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-[18px] font-medium text-[#0A2540] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[16px] leading-[1.6] text-[#5F6B7A]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* Warranty Claims */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-6">
            Warranty Claims
          </h2>
          <p className="text-[18px] leading-[1.7] text-[#5F6B7A] max-w-[680px]">
            If your product develops a manufacturing fault, we&apos;ll assist with assessment, repair or replacement according to the applicable manufacturer&apos;s warranty and South African consumer law.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* FAQs */}
      <section className="pt-[96px] pb-[96px] md:pt-[96px] md:pb-[96px] px-6">
        <div className="mx-auto max-w-[820px]">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between py-6 text-left"
                >
                  <span className="text-[18px] font-medium text-[#0A2540] pr-4">
                    {faq.question}
                  </span>
                  <span className={`text-[20px] text-[#1C99D6] transition-transform duration-200 ${openFaq === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div className="pb-6">
                    <p className="text-[18px] leading-[1.7] text-[#5F6B7A]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-6">
        <div className="h-px bg-gray-200" />
      </div>

      {/* Need Help CTA */}
      <section className="pt-[96px] pb-[96px] md:pt-[128px] md:pb-[128px] px-6">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="text-[40px] font-medium leading-[1.1] tracking-tight text-[#0A2540] mb-6">
            Need help with a return?
          </h2>
          <p className="text-[18px] leading-[1.7] text-[#5F6B7A] mb-12 max-w-[520px] mx-auto">
            Our team will guide you through every step.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-[#1C99D6] text-white px-8 h-[52px] font-semibold text-[16px] hover:bg-[#1680b0] transition-colors rounded-none w-full md:w-auto max-w-[300px]"
            >
              Contact Support
            </Link>
            <div className="flex items-center gap-6 mt-4">
              <a
                href="tel:+27210000000"
                className="flex items-center gap-2 text-[#1C99D6] hover:text-[#1680b0] transition-colors"
              >
                <Phone className="size-4" strokeWidth={1.5} />
                <span className="text-[16px] font-medium">Call Us</span>
              </a>
              <a
                href="https://wa.me/27000000000"
                className="flex items-center gap-2 text-[#1C99D6] hover:text-[#1680b0] transition-colors"
              >
                <MessageCircle className="size-4" strokeWidth={1.5} />
                <span className="text-[16px] font-medium">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
