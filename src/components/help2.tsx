"use client";

import { Mail, MessageSquare, Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Help2Props {
  title?: string;
  description?: string;
  faqs?: FAQ[];
  contactTitle?: string;
  contactDescription?: string;
  className?: string;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    category: "Orders",
    question: "How can I track my order?",
    answer:
      "You can track your order by logging into your account and viewing your order history. You'll also receive tracking updates via email once your order ships within South Africa.",
  },
  {
    category: "Orders",
    question: "Can I modify or cancel my order?",
    answer:
      "Yes, you can modify or cancel your order. Please contact our support team and we'll do our best to help you with any changes.",
  },
  {
    category: "Shipping",
    question: "What are your shipping options?",
    answer:
      "We ship all around South Africa. Same-day delivery in Cape Town, and 2-3 business days for other areas nationwide.",
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer:
      "We are based in Cape Town, South Africa and currently ship nationwide within South Africa only.",
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "We offer returns within South Africa. Items must be in original condition. Contact our support team to initiate a return.",
  },
  {
    category: "Returns",
    question: "How do I start a return?",
    answer:
      "Contact our support team to start your return. We'll guide you through the process and arrange for collection or drop-off within South Africa.",
  },
];

const Help2 = ({
  title = "How Can We Help?",
  description = "Find answers to common questions or contact our support team.",
  faqs = DEFAULT_FAQS,
  contactTitle = "Still need help?",
  contactDescription = "Our support team is here for you.",
  className,
}: Help2Props) => {
  const [searchQuery, setSearchQuery] = useState("");

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
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-4xl font-normal tracking-tight md:text-5xl font-[var(--font-google-sans-flex)]">
              {title}
            </h2>
            <p className="text-muted-foreground font-[var(--font-google-sans-flex)]">{description}</p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="mb-16 gap-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b">
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </p>
            )}
          </Accordion>

          <div className="rounded-xl bg-muted/50 p-8">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-xl font-normal">{contactTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {contactDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 items-stretch">
              <div className="aircon-angled-button-wrap w-full flex">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent flex-1"
                >
                  <Link href="/checkout" className="flex items-center justify-center">
                    <MessageSquare className="mr-2 size-4" />
                    Live Chat
                  </Link>
                </Button>
              </div>
              <div className="aircon-angled-button-wrap w-full flex">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent flex-1"
                >
                  <Link href="mailto:info@airconsstore.co.za" className="flex items-center justify-center">
                    <Mail className="mr-2 size-4" />
                    Email Us
                  </Link>
                </Button>
              </div>
              <div className="aircon-angled-button-wrap w-full flex">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent flex-1"
                >
                  <Link href="tel:+27000000000" className="flex items-center justify-center">
                    <Phone className="mr-2 size-4" />
                    Call Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Help2 };
