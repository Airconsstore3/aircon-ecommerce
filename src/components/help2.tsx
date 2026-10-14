"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

interface Help2Props {
  title?: string;
  description?: string;
  faqs?: FAQ[];
  className?: string;
  /** Verified primary contact link (WhatsApp/phone/email) or null when not configured. */
  contactHref?: string | null;
  /** Verified WhatsApp link or null when not configured. */
  whatsappHref?: string | null;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    question: "How do I choose the right air conditioner size?",
    answer:
      "The right size depends on your room's square footage, ceiling height, and sun exposure. As a general guide, a 9000 BTU unit suits rooms up to 20m², while a 12000 BTU unit covers up to 30m². Our specialists can help you calculate the exact capacity you need.",
  },
  {
    question: "Do you offer professional installation?",
    answer:
      "Yes. We offer installation support for the systems we supply. Availability depends on your area — we'll confirm the details when you enquire.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery is free within Cape Town. For other areas, delivery is arranged and the timing is confirmed with your order before payment.",
  },
  {
    question: "Which brands do you recommend?",
    answer:
      "We stock leading air conditioning brands including Samsung, LG, Daikin, Hisense, and Alliance. Each has its strengths — our specialists can recommend the best fit for your budget and needs.",
  },
  {
    question: "Can I buy now and book installation later?",
    answer:
      "Yes. You can purchase your air conditioner online and arrange installation for a date that suits you — we'll confirm availability when you enquire.",
  },
  {
    question: "What warranty comes with my air conditioner?",
    answer:
      "Every unit includes the manufacturer's warranty. Coverage and length vary by brand and model — we confirm the exact warranty for your unit before purchase.",
  },
  {
    question: "Can you deliver anywhere in South Africa?",
    answer:
      "We deliver nationwide. Delivery availability and timing for your area are confirmed with your order before you pay.",
  },
  {
    question: "How do I pay for my order?",
    answer:
      "We take payment by manual EFT after your order is confirmed — no payment is taken online at checkout. Once availability is confirmed, we send you the banking details.",
  },
];

const FONT_CLASS = "font-[var(--font-google-sans-flex)]";

const Help2 = ({
  title = "Frequently Asked Questions",
  description = "Everything you need to know about choosing, buying and installing an air conditioner.",
  faqs = DEFAULT_FAQS,
  className,
  contactHref = null,
  whatsappHref = null,
}: Help2Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    );
  }, [faqs, searchQuery]);

  return (
    <section id="faqs" className={cn("pt-16 pb-16 md:pt-24 md:pb-24", className)}>
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6 font-[var(--font-google-sans-flex)]">
        {/* Editorial header — center-aligned, narrower on mobile for balanced wrap */}
        <div className="mx-auto max-w-[320px] md:max-w-[700px] text-center">
          <span className={`mb-4 block ${FONT_CLASS} text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1C99D6]`}>
            Support
          </span>
          <h2 className={`mb-6 ${FONT_CLASS} max-w-[320px] md:max-w-[520px] mx-auto text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black`}>
            {title}
          </h2>
          <p className={`${FONT_CLASS} text-[16px] md:text-lg font-normal leading-[1.6] text-[#5E6B7A] max-w-[320px] md:max-w-[520px] mx-auto`}>
            {description}
          </p>
        </div>

        {/* Search — 56px height, 0px radius, subtle border */}
        <div className="mx-auto max-w-3xl mt-8 mb-10">
          <div className="relative">
            <Search className="absolute top-1/2 left-5 size-5 -translate-y-1/2 text-[#C5C5C5]" strokeWidth={1.5} />
            <input
              type="search"
              placeholder="Search FAQs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-14 rounded-none border border-[#E6EDF5] bg-white pl-12 pr-5 ${FONT_CLASS} text-base text-[#111111] placeholder:text-[#A0A0A0] outline-none transition-colors focus:border-[#1C99D6]`}
            />
          </div>
        </div>

        {/* FAQ accordion */}
        <div className="mx-auto max-w-3xl">
          {filteredFaqs.length > 0 ? (
            <div>
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="border-b border-[#ECECEC]">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className={`flex w-full items-center justify-between py-6 text-left ${FONT_CLASS} text-[18px] font-medium text-[#111111] transition-colors hover:text-[#1C99D6]`}
                    >
                      <span>{faq.question}</span>
                      <span className="ml-4 shrink-0 text-[#9CA3AF]">
                        {isOpen ? (
                          <X className="size-5" strokeWidth={1.5} />
                        ) : (
                          <Plus className="size-5" strokeWidth={1.5} />
                        )}
                      </span>
                    </button>
                    <div
                      className={cn(
                        "grid transition-all duration-[250ms] ease-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="w-8 border-t border-[#D1D5DB] mb-4" />
                        <p className={`${FONT_CLASS} text-base leading-[1.7] text-[#5F6B7A] max-w-[700px] pb-6`}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`py-8 text-center ${FONT_CLASS} text-[#9CA3AF]`}>
              No results found for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Support CTA — refined hierarchy: primary button + secondary text link */}
        <div className="mx-auto max-w-[700px] text-center mt-12 md:mt-16">
          <h3 className={`mb-6 ${FONT_CLASS} text-[34px] md:text-[46px] lg:text-[56px] font-medium leading-[1.08] md:leading-[1.08] lg:leading-[1.05] tracking-[-0.025em] md:tracking-[-0.03em] lg:tracking-[-0.03em] text-black`}>
            Still have questions?
          </h3>
          <p className={`${FONT_CLASS} text-[16px] font-normal leading-[1.6] text-[#5E6B7A] mb-8`}>
            Our specialists are here to help.
          </p>          <div className="flex flex-col items-center gap-4">
            {contactHref && (
              <a
                href={contactHref}
                className={`inline-flex w-full sm:w-auto items-center justify-center bg-[#1C99D6] px-8 h-[52px] rounded-none ${FONT_CLASS} text-[16px] font-semibold text-white transition-all duration-250 hover:bg-[#1680b0] active:scale-[0.98]`}
              >
                Contact Us
              </a>
            )}
            {whatsappHref && (
            <a
              href={whatsappHref}
              className={`support-whatsapp-link inline-flex items-center gap-1.5 ${FONT_CLASS} text-[16px] font-medium text-[#1C99D6] transition-colors duration-200 hover:text-[#1680b0]`}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat on WhatsApp</span>
              <span className="support-whatsapp-arrow inline-block transition-transform duration-200">&rarr;</span>
            </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Help2 };
