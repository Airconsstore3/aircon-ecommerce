import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppHref,
  getContactChannels,
  primaryContactHref,
} from "@/lib/contact-settings";

const FONT_CLASS = "font-[var(--font-google-sans-flex)]";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const SHOP_LINKS: FooterLink[] = [
  { label: "Residential Aircons", href: "/categories/residential" },
  { label: "Commercial Aircons", href: "/categories/commercial" },
  { label: "Portable Aircons", href: "/products?type=portable" },
  { label: "All Aircons", href: "/products" },
  { label: "Installation Packages", href: "/installation" },
  { label: "Special Offers", href: "/products?sale=true" },
];

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "Frequently Asked Questions", href: "/#faqs" },
  { label: "Returns & Refunds", href: "/return-policy" },
  { label: "Warranty", href: "/warranty" },
  { label: "Repairs", href: "/repairs" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Installation", href: "/installation" },
];

export const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const isExternal = /^(https?:|tel:|mailto:)/.test(link.href);
  const className = cn(
    `${FONT_CLASS} group relative text-[16px] font-normal text-[#111111] transition-colors duration-200 ease-out hover:text-[#1C99D6]`,
  );
  const underline = (
    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#1C99D6] transition-all duration-200 ease-out group-hover:w-full" />
  );
  return (
    <li>
      {isExternal ? (
        <a href={link.href} className={className}>
          {link.label}
          {underline}
        </a>
      ) : (
        <Link href={link.href} className={className}>
          {link.label}
          {underline}
        </Link>
      )}
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

const PremiumFooter = async ({ className }: { className?: string }) => {
  const contact = await getContactChannels();
  const whatsappHref = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I have a question.")
    : null;
  const contactHref = primaryContactHref(contact, "Hi Aircons Store — I have a question.");

  const supportLinks: FooterLink[] = [
    ...(contactHref ? [{ label: "Contact Us", href: contactHref }] : []),
    ...SUPPORT_LINKS,
  ];

  const columns: FooterColumn[] = [
    { title: "Shop", links: SHOP_LINKS },
    { title: "Support", links: supportLinks },
    { title: "Company", links: COMPANY_LINKS },
  ];

  return (
    <footer className={cn("w-full border-t border-[#EAEAEA] bg-white pt-16 pb-12 md:pt-24", className)}>
      <div className="mx-auto px-6 md:max-w-[95%] md:px-6">
        {/* Main grid: Brand + 3 link columns + Contact */}
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
            <p className={`${FONT_CLASS} text-[16px] font-normal leading-[1.6] text-[#111111] max-w-[320px]`}>
              Helping homeowners and businesses find the right air conditioning solutions across South Africa.
            </p>
            <p className={`${FONT_CLASS} mt-4 text-[14px] font-medium text-[#5F6B7A]`}>
              Cape Town · Nationwide Delivery
            </p>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <div key={column.title} className="lg:col-span-2">
              <FooterColumnSection column={column} />
            </div>
          ))}

          {/* Contact column — renders only channels configured in settings */}
          <div className="lg:col-span-2">
            <h3 className={`${FONT_CLASS} mb-5 text-[18px] font-semibold leading-tight text-[#111111]`}>
              Get in Touch
            </h3>
            <ul className="space-y-3.5 md:space-y-3">
              {whatsappHref && (
                <li>
                  <a
                    href={whatsappHref}
                    className={`${FONT_CLASS} flex items-center gap-2 text-[16px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                  >
                    <MessageCircle className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                    WhatsApp
                  </a>
                </li>
              )}
              {contact.phoneTel && (
                <li>
                  <a
                    href={contact.phoneTel}
                    className={`${FONT_CLASS} flex items-center gap-2 text-[16px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                  >
                    <Phone className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                    Call Us
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className={`${FONT_CLASS} flex items-center gap-2 text-[16px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                  >
                    <Mail className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                    Email
                  </a>
                </li>
              )}
              <li className={`${FONT_CLASS} flex items-center gap-2 text-[16px] font-normal text-[#111111]`}>
                <MapPin className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                Cape Town, South Africa
              </li>
            </ul>
          </div>
        </div>

        {/* Contact strip — only shows verified values */}
        {(contact.phoneTel || contact.email || contact.whatsappDisplay) && (
          <div className="mt-12 border-t border-[#EAEAEA] pt-8 md:mt-16">
            <div className="flex flex-col items-center gap-[18px] sm:flex-row sm:gap-8">
              {contact.phoneTel && contact.phoneDisplay && (
                <a
                  href={contact.phoneTel}
                  className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                >
                  <Phone className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                  {contact.phoneDisplay}
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                >
                  <Mail className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                  {contact.email}
                </a>
              )}
              {contact.whatsappDisplay && !contact.phoneDisplay && (
                <a
                  href={whatsappHref ?? "#"}
                  className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#111111] transition-colors duration-200 hover:text-[#1C99D6]`}
                >
                  <MessageCircle className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                  WhatsApp: {contact.whatsappDisplay}
                </a>
              )}
              <span className={`${FONT_CLASS} flex items-center gap-2 text-[15px] font-normal text-[#111111]`}>
                <MapPin className="size-4 text-[#5F6B7A]" strokeWidth={1.5} />
                Cape Town, South Africa
              </span>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[#EAEAEA] pt-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-4">
            <p className={`${FONT_CLASS} text-[14px] font-normal text-[#5F6B7A]`}>
              © 2026 Aircons Store. All rights reserved.
            </p>
            <div className="flex items-center gap-5 sm:gap-6">
              <Link
                href="/privacy"
                className={`${FONT_CLASS} text-[14px] font-normal text-[#5F6B7A] transition-colors duration-200 hover:text-[#1C99D6]`}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={`${FONT_CLASS} text-[14px] font-normal text-[#5F6B7A] transition-colors duration-200 hover:text-[#1C99D6]`}
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { PremiumFooter };
