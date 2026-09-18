"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FONT_CLASS = "font-[var(--font-google-sans-flex)]";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const SHOP_LINKS: FooterLink[] = [
  { label: "Residential Aircons", href: "/categories/residential" },
  { label: "Commercial Aircons", href: "/categories/commercial" },
  { label: "Heat Pumps", href: "/categories/heat-pumps" },
  { label: "Portable Aircons", href: "/categories/portable" },
  { label: "Installation Packages", href: "/installation" },
  { label: "Special Offers", href: "/deals" },
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: "Contact Us", href: "/contact" },
  { label: "Frequently Asked Questions", href: "/faq" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Warranty", href: "/warranty" },
  { label: "Book Installation", href: "/book-installation" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Shop", links: SHOP_LINKS },
  { title: "Support", links: SUPPORT_LINKS },
  { title: "Company", links: COMPANY_LINKS },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      <Link
        href={link.href}
        className={cn(
          `${FONT_CLASS} group relative text-[16px] font-normal text-[#6B7280] transition-colors duration-200 ease-out hover:text-[#1C99D6]`,
        )}
      >
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#1C99D6] transition-all duration-200 ease-out group-hover:w-full" />
      </Link>
    </li>
  );
}

function FooterColumnSection({ column }: { column: FooterColumn }) {
  return (
    <div>
      <h3 className={`${FONT_CLASS} mb-5 text-[18px] font-semibold leading-tight text-[#111111]`}>
        {column.title}
      </h3>
      <ul className="space-y-3.5 md:space-y-3">
        {column.links.map((link) => (
          <FooterLinkItem key={link.label} link={link} />
        ))}
      </ul>
    </div>
  );
}

const PremiumFooter = ({ className }: { className?: string }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className={cn("w-full border-t border-[#EAEAEA] bg-white pt-16 pb-12 md:pt-24", className)}>
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6">
        {/* Main grid: Brand + 3 columns + Newsletter.
            40px gap between sections on mobile, 48px on desktop. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link href="/" className="mb-8 inline-block">
              <img
                src="/aircon store logo.svg"
                alt="Aircons Store"
                className="h-12 w-auto"
              />
            </Link>
            <p className={`${FONT_CLASS} text-[16px] font-normal leading-[1.6] text-[#6B7280] max-w-[320px]`}>
              Helping homeowners and businesses find the right air conditioning solutions across South Africa.
            </p>
            <p className={`${FONT_CLASS} mt-4 text-[14px] font-medium text-[#9CA3AF]`}>
              Cape Town · Nationwide Delivery
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <FooterColumnSection column={column} />
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className={`${FONT_CLASS} mb-5 text-[18px] font-semibold leading-tight text-[#111111]`}>
              Stay Updated
            </h3>
            <p className={`${FONT_CLASS} mb-5 text-[15px] font-normal leading-[1.5] text-[#6B7280] max-w-[280px]`}>
              Receive exclusive offers, new arrivals and seasonal promotions.
            </p>
            <form onSubmit={handleSubscribe} className="w-full">
              {/* Mobile: stacked input + button. Desktop: inline. */}
              <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-0">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`${FONT_CLASS} h-[48px] w-full border border-[#E5E7EB] bg-white px-4 text-[15px] font-normal text-[#111111] placeholder:text-[#A0A0A0] outline-none transition-colors duration-200 focus:border-[#1C99D6] md:border-r-0 md:rounded-l-[10px] md:rounded-none rounded-none`}
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className={`${FONT_CLASS} group flex h-[48px] w-full items-center justify-center gap-1.5 bg-[#1C99D6] px-4 text-[15px] font-medium text-white transition-all duration-200 hover:bg-[#1680b0] md:w-auto md:rounded-r-[10px] rounded-none`}
                >
                  Subscribe
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
                </button>
              </div>
              {subscribed && (
                <p className={`${FONT_CLASS} mt-3 text-[13px] font-medium text-[#1C99D6]`}>
                  Thanks for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Contact strip — stacked vertically on mobile with 18px gap,
            horizontal row on desktop. */}
        <div className="mt-12 border-t border-[#EAEAEA] pt-8 md:mt-16">
          <div className="flex flex-col items-center gap-[18px] sm:flex-row sm:gap-8">
            <a
              href="tel:+27210000000"
              className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#6B7280] transition-colors duration-200 hover:text-[#1C99D6]`}
            >
              <Phone className="size-4 text-[#9CA3AF]" strokeWidth={1.5} />
              +27 21 000 0000
            </a>
            <a
              href="mailto:hello@airconsstore.co.za"
              className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#6B7280] transition-colors duration-200 hover:text-[#1C99D6]`}
            >
              <Mail className="size-4 text-[#9CA3AF]" strokeWidth={1.5} />
              hello@airconsstore.co.za
            </a>
            <span className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#6B7280]`}>
              <MapPin className="size-4 text-[#9CA3AF]" strokeWidth={1.5} />
              Cape Town, South Africa
            </span>
          </div>
        </div>

        {/* Bottom bar — centered on mobile, space-between on desktop */}
        <div className="mt-8 border-t border-[#EAEAEA] pt-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-4">
            {/* Copyright — centered on mobile */}
            <p className={`${FONT_CLASS} text-[14px] font-normal text-[#9CA3AF]`}>
              © 2026 Aircons Store. All rights reserved.
            </p>

            {/* Legal links — centered row with 20px gap on mobile */}
            <div className="flex items-center gap-5 sm:gap-6">
              <Link
                href="/privacy"
                className={`${FONT_CLASS} text-[14px] font-normal text-[#9CA3AF] transition-colors duration-200 hover:text-[#1C99D6]`}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={`${FONT_CLASS} text-[14px] font-normal text-[#9CA3AF] transition-colors duration-200 hover:text-[#1C99D6]`}
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className={`${FONT_CLASS} text-[14px] font-normal text-[#9CA3AF] transition-colors duration-200 hover:text-[#1C99D6]`}
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { PremiumFooter };
