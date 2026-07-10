"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NewsletterData = {
  title?: string;
};

type FooterLink = {
  text: string;
  link: string;
};

type FooterLinksSection = {
  title: string;
  id: string;
  items: FooterLink[];
};

interface EcommerceFooter20Props {
  brandName?: string;
  brandHref?: string;
  newsletter?: NewsletterData;
  footerLinks?: FooterLinksSection[];
  submenuLinks?: FooterLink[];
  contactEmail?: string;
  regionLabel?: string;
  copyright?: string;
  className?: string;
}

const FOOTER_LINKS: FooterLinksSection[] = [
  {
    title: "Products",
    id: "products",
    items: [
      { text: "Shop Air Conditioners", link: "/shop" },
      { text: "Residential Units", link: "/categories/residential" },
      { text: "Commercial Units", link: "/categories/commercial" },
      { text: "Installation", link: "/installation" },
      { text: "Accessories", link: "/categories/accessories" },
    ],
  },
  {
    title: "Company",
    id: "company",
    items: [
      { text: "About Us", link: "/about" },
      { text: "Our Mission", link: "/about" },
      { text: "Contact Us", link: "/about" },
      { text: "Warranty Policy", link: "/warranty" },
      { text: "Store Locator", link: "/store-locator" },
    ],
  },
];

const SUBMENU: FooterLink[] = [
  { text: "Privacy Policy", link: "/privacy" },
  { text: "Terms of Service", link: "/terms" },
  { text: "Refund Policy", link: "/refund" },
];

const InstagramIcon = () => (
  <svg
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 2.16094C15.2063 2.16094 15.5859 2.175 16.8438 2.23125C18.4188 2.29844 19.7328 3.6125 19.8 5.1875C19.8563 6.44531 19.8703 6.82422 19.8703 10.0305C19.8703 13.2367 19.8563 13.6156 19.8 14.8734C19.7328 16.4484 18.4188 17.7625 16.8438 17.8297C15.5859 17.8859 15.2063 17.9 12 17.9C8.79375 17.9 8.41406 17.8859 7.15625 17.8297C5.58125 17.7625 4.26719 16.4484 4.2 14.8734C4.14375 13.6156 4.12969 13.2367 4.12969 10.0305C4.12969 6.82422 4.14375 6.44531 4.2 5.1875C4.26719 3.6125 5.58125 2.29844 7.15625 2.23125C8.41406 2.175 8.79375 2.16094 12 2.16094ZM12 0C8.75625 0 8.34375 0.0140625 7.0625 0.0703125C4.4125 0.189062 2.18906 2.4125 2.07031 5.0625C2.01406 6.34375 2 6.75625 2 10C2 13.2438 2.01406 13.6562 2.07031 14.9375C2.18906 17.5875 4.4125 19.8109 7.0625 19.9297C8.34375 19.9859 8.75625 20 12 20C15.2438 20 15.6562 19.9859 16.9375 19.9297C19.5875 19.8109 21.8109 17.5875 21.9297 14.9375C21.9859 13.6562 22 13.2438 22 10C22 6.75625 21.9859 6.34375 21.9297 5.0625C21.8109 2.4125 19.5875 0.189062 16.9375 0.0703125C15.6562 0.0140625 15.2438 0 12 0ZM12 4.86406C8.74687 4.86406 6.11406 7.49688 6.11406 10.75C6.11406 14.0031 8.74687 16.6359 12 16.6359C15.2531 16.6359 17.8859 14.0031 17.8859 10.75C17.8859 7.49688 15.2531 4.86406 12 4.86406ZM12 14.4766C9.93906 14.4766 8.27344 12.8109 8.27344 10.75C8.27344 8.68906 9.93906 7.02344 12 7.02344C14.0609 7.02344 15.7266 8.68906 15.7266 10.75C15.7266 12.8109 14.0609 14.4766 12 14.4766ZM18.3359 3.57812C17.675 3.57812 17.1406 4.1125 17.1406 4.77344C17.1406 5.43437 17.675 5.96875 18.3359 5.96875C18.9969 5.96875 19.5312 5.43437 19.5312 4.77344C19.5312 4.1125 18.9969 3.57812 18.3359 3.57812Z"
      fill="currentColor"
    />
  </svg>
);

const TiktokIcon = () => (
  <svg
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      fill="currentColor"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M24 12.0733C24 5.40541 18.6274 0 12 0C5.37258 0 0 5.40541 0 12.0733C0 18.0995 4.38823 23.0943 10.125 24V15.5633H7.07813V12.0733H10.125V9.41343C10.125 6.38755 11.9165 4.41609 14.6576 4.41609C15.9705 4.41609 17.3438 4.66193 17.3438 4.66193V7.51863H15.8306C14.3399 7.51863 13.875 8.47277 13.875 9.42389V12.0733H17.2031L16.6671 15.5633H13.875V24C19.6118 23.0943 24 18.0995 24 12.0733Z"
      fill="currentColor"
    />
  </svg>
);

const newsletterFormSchema = z.object({
  email: z.string().email(),
});

type NewsletterFormType = z.infer<typeof newsletterFormSchema>;

const NewsletterSection = ({ title }: NewsletterData) => {
  const form = useForm<NewsletterFormType>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: NewsletterFormType) => {
    alert("Thanks for subscribing! You'll receive updates at " + data.email);
    form.reset();
  };

  return (
    <div className="space-y-5">
      <p className="max-w-md text-base font-light leading-snug text-white/90">
        {title}
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup
                className="rounded-none border border-white/30 bg-transparent shadow-none focus-within:border-white/60"
                aria-invalid={fieldState.invalid}
              >
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="YOUR EMAIL"
                  className="bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:ring-0"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    size="icon-xs"
                    className="rounded-none bg-[#1C99D6] text-white hover:bg-[#1C99D6]/90"
                  >
                    <ArrowRight className="size-4" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>
      <p className="text-[10px] text-white/60">
        By signing up, you agree to our{" "}
        <a href="/privacy" className="underline hover:text-white">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

const EcommerceFooter20 = ({
  brandName = "Aircons Store",
  brandHref = "/",
  newsletter = { title: "Sign up to receive updates about our products and special offers." },
  footerLinks = FOOTER_LINKS,
  submenuLinks = SUBMENU,
  contactEmail = "info@airconsstore.com",
  regionLabel = "South Africa (USD $)",
  copyright = "© 2025 Aircons Store Inc. All Rights Reserved.",
  className,
}: EcommerceFooter20Props) => {
  return (
    <footer
      className={cn(
        "bg-[#0033A0] text-white antialiased",
        className
      )}
    >
      {/* Large brand strip */}
      <div className="border-b border-white/20 px-6 py-8 md:px-12 lg:px-20">
        <a href={brandHref} className="block">
          <span className="logo-text text-[clamp(2.5rem,9vw,7rem)] font-bold leading-[0.9] tracking-tight text-[#1C99D6]">
            {brandName}
            <sup className="ml-1 text-[0.18em] font-normal align-super">TM</sup>
          </span>
        </a>
      </div>

      {/* Main footer content */}
      <div className="grid grid-cols-1 gap-12 px-6 py-12 md:px-12 lg:grid-cols-2 lg:px-20 lg:py-16">
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8">
          {footerLinks.map((section) => (
            <div key={section.id}>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-[#1C99D6]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.text}>
                    <a
                      href={item.link}
                      className="text-sm text-white/90 transition-colors hover:text-white hover:underline"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter and contact */}
        <div className="space-y-8 lg:pl-12">
          <NewsletterSection {...newsletter} />

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://instagram.com/airconsstore"
              aria-label="Instagram"
              className="text-white/70 transition-colors hover:text-white"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://tiktok.com/@airconsstore"
              aria-label="TikTok"
              className="text-white/70 transition-colors hover:text-white"
            >
              <TiktokIcon />
            </a>
          </div>

          <a
            href={`mailto:${contactEmail}`}
            className="block text-sm font-medium text-white underline underline-offset-4 transition-colors hover:text-[#1C99D6]"
          >
            {contactEmail}
          </a>

          <p className="max-w-md text-xs leading-relaxed text-white/50">
            Accessibility statement: if you are using a screen reader and having
            problems using this website, please e-mail{" "}
            <a href={`mailto:${contactEmail}`} className="underline">
              {contactEmail}
            </a>{" "}
            for assistance.
          </p>
        </div>
      </div>

      <Separator className="bg-white/20" />

      {/* Bottom bar */}
      <div className="flex flex-col items-start justify-between gap-6 px-6 py-6 text-xs text-white/70 md:flex-row md:items-center md:px-12 lg:px-20">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {submenuLinks.map((item) => (
            <li key={item.text}>
              <a
                href={item.link}
                className="transition-colors hover:text-white hover:underline"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-white/90 transition-colors hover:border-white hover:text-white"
        >
          {regionLabel}
          <Plus className="size-3" />
        </button>

        <div className="flex items-center gap-4">
          <span>{copyright}</span>
          <a
            href="https://facebook.com/airconsstore"
            aria-label="Facebook"
            className="text-white/70 transition-colors hover:text-white"
          >
            <FacebookIcon />
          </a>
        </div>
      </div>
    </footer>
  );
};

export { EcommerceFooter20 };
