"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Plus } from "lucide-react";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

type NewsletterData = {
  title?: string;
};

type NewsletterFormProps = NewsletterData;

type SocialIcon = {
  title: string;
  light: string;
  dark: string;
};

type SocialLink = {
  link: string;
  icon: SocialIcon;
};

type FooterLink = {
  text: string;
  link?: string;
};

type FooterLinksSection = {
  title: string;
  id: string;
  items: FooterLink[];
};

interface SocialMediaSectionProps {
  links: SocialLink[];
}

interface FooterLinksSectionProps {
  sections: FooterLinksSection[];
}

interface EcommerceFooter20Props {
  newsletter?: NewsletterData;
  socialLinks?: SocialLink[];
  footerLinks?: FooterLinksSection[];
  submenuLinks?: {
    text: string;
    link: string;
  }[];
  footerData?: {
    image?: {
      src?: string;
      alt?: string;
    };
    homeLink?: {
      logo?: {
        light?: string;
        dark?: string;
      };
      link?: string;
    };
    title?: string;
    description?: string;
  };
  className?: string;
}

const NEWSLETTER_DATA = {
  title: "Get updates on offers and products and save 20% on your first order",
};

const SOCIAL_ICONS = {
  facebook: {
    title: "Facebook",
    light:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/facebook-icon.svg",
    dark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/facebook-icon.svg",
  },
  x: {
    title: "X",
    light:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/x.svg",
    dark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/x.svg",
  },
  instagram: {
    title: "Instagram",
    light:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/instagram-icon.svg",
    dark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/instagram-icon.svg",
  },
};

const SOCIAL_MEDIA_LINKS = [
  {
    icon: SOCIAL_ICONS.facebook,
    link: "https://facebook.com/airconsstore",
  },
  {
    icon: SOCIAL_ICONS.x,
    link: "https://twitter.com/airconsstore",
  },
  {
    icon: SOCIAL_ICONS.instagram,
    link: "https://instagram.com/airconsstore",
  },
];

const FOOTER_LINKS: FooterLinksSection[] = [
  {
    title: "Products",
    id: "products",
    items: [
      {
        text: "Residential Units",
        link: "/categories/residential",
      },
      {
        text: "Commercial Units",
        link: "/categories/commercial",
      },
      {
        text: "Installation Kits",
        link: "/categories/installation",
      },
      {
        text: "Accessories",
        link: "/categories/accessories",
      },
    ],
  },
  {
    title: "Services",
    id: "services",
    items: [
      {
        text: "Installation",
        link: "/installation",
      },
      {
        text: "Maintenance Plans",
        link: "/maintenance",
      },
      {
        text: "Repairs & Callouts",
        link: "/repairs",
      },
      {
        text: "Track Order",
        link: "/account/orders",
      },
    ],
  },
  {
    title: "Information",
    id: "information",
    items: [
      {
        text: "About Us",
        link: "/about",
      },
      {
        text: "Terms and Conditions",
        link: "/terms",
      },
      {
        text: "Privacy Policy",
        link: "/privacy",
      },
      {
        text: "Contact Us",
        link: "/about",
      },
    ],
  },
];

const SUBMENU = [
  {
    text: "Terms and Conditions",
    link: "/terms",
  },
  {
    text: "Privacy Policy",
    link: "/privacy",
  },
  {
    text: "Warranty Policy",
    link: "/categories/warranty",
  },
  {
    text: "Track Order",
    link: "/account/orders",
  },
  {
    text: "Contact Us",
    link: "/about",
  },
];

const FOOTER_DATA = {
  image: {
    src: "/Hero Images/Featured In section/footer image.png",
    alt: "Footer image",
  },
  homeLink: {
    logo: {
      light: "/aircon store logo.svg",
      dark: "/aircon store logo.svg",
    },
    link: "/",
  },
  title: "Your Trusted Air Conditioning Experts",
  description:
    "We provide top-quality air conditioning solutions for residential and commercial spaces, with professional installation, maintenance, and repair services.",
};

const EcommerceFooter20 = ({
  newsletter = NEWSLETTER_DATA,
  socialLinks = SOCIAL_MEDIA_LINKS,
  footerLinks = FOOTER_LINKS,
  submenuLinks = SUBMENU,
  footerData = FOOTER_DATA,
  className,
}: EcommerceFooter20Props) => {
  return (
    <footer className={cn("bg-muted", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="overflow-hidden max-lg:aspect-square">
          {footerData?.image?.src && (
            <img
              className="block size-full object-cover object-center"
              src={footerData.image.src}
              alt={footerData.image.alt || ""}
            />
          )}
        </div>
        <div>
          <div className="px-6 py-8 md:p-12 lg:px-20 lg:pt-8 lg:pb-20">
            <div className="space-y-12">
              <div className="mt-12 max-w-125">
                <NewsletterSection {...newsletter} />
              </div>
              <div className="space-y-6">
                <a href="/" className="block">
                  {footerData?.homeLink?.logo?.light && (
                    <img
                      className="h-12 w-auto dark:hidden"
                      src={footerData.homeLink.logo.light}
                      alt="Logo"
                    />
                  )}
                  {footerData?.homeLink?.logo?.dark && (
                    <img
                      className="hidden h-12 w-auto dark:inline-block"
                      src={footerData.homeLink.logo.dark}
                      alt="Logo"
                    />
                  )}
                </a>
                <div className="space-y-1">
                  <h3 className="font-normal">{footerData?.title}</h3>
                  <p className="leading-relaxed text-balance">
                    {footerData?.description}
                  </p>
                </div>
              </div>
              <SocialMediaSection links={socialLinks} />
              <Separator className="max-lg:hidden" />
              <FooterLinksSection sections={footerLinks} />
              <Separator className="max-lg:hidden" />
              <div className="space-y-8">
                <FooterSubMenu links={submenuLinks} />
                <p className="text-sm font-light">© 2025 Aircons Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-10 lg:px-20">
        {footerData?.homeLink?.logo?.light && (
          <img
            className="w-full dark:hidden"
            src={footerData.homeLink.logo.light}
            alt="Logo"
          />
        )}
        {footerData?.homeLink?.logo?.dark && (
          <img
            className="hidden w-full dark:inline-block"
            src={footerData.homeLink.logo.dark}
            alt="Logo"
          />
        )}
      </div>
    </footer>
  );
};

const newsletterFormSchema = z.object({
  email: z.string().email(),
});

type newsletterFormType = z.infer<typeof newsletterFormSchema>;

const NewsletterSection = ({ title }: NewsletterFormProps) => {
  const form = useForm({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: newsletterFormType) => {
    alert("Thanks for subscribing! You'll receive updates at " + data.email);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light">{title}</h2>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup
                className="rounded-none border-x-0 border-t-0 !border-b border-foreground shadow-none"
                aria-invalid={fieldState.invalid}
              >
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Email Address"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="submit" size="icon-xs">
                    <ArrowRight />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>
    </div>
  );
};

const SocialMediaSection = ({ links }: SocialMediaSectionProps) => {
  return (
    <ul className="flex flex-wrap gap-4">
      {links.map(({ icon, link }) => (
        <li key={crypto.randomUUID()}>
          <Button size="icon" variant="ghost" asChild className="rounded-full">
            <a href={link}>
              <img
                className="size-6 dark:invert"
                alt={icon.title}
                src={icon.light}
              />
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
};

const FooterLinksSection = ({ sections }: FooterLinksSectionProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [value, setValue] = useState("");

  if (!sections) return;

  const allAccordionIds = sections.map(({ id }) => id);
  const handleOnValueChange = (value: string) => {
    setValue(value);
  };

  if (isDesktop) {
    return (
      <Accordion
        value={allAccordionIds}
        type="multiple"
        className="grid grid-cols-3 gap-4"
      >
        <AccordionItems sections={sections} />
      </Accordion>
    );
  } else {
    return (
      <Accordion
        value={value}
        type="single"
        collapsible={true}
        onValueChange={handleOnValueChange}
        className="border-y"
      >
        <AccordionItems sections={sections} />
      </Accordion>
    );
  }
};

const AccordionItems = ({ sections }: { sections: FooterLinksSection[] }) => {
  return (
    <Fragment>
      {sections.map(({ id, title, items }) => (
        <AccordionItem
          key={id}
          value={id}
          className="border-b lg:border-transparent"
        >
          <AccordionTrigger className="cursor-auto rounded-none pt-0 pb-2 text-base leading-normal font-bold hover:no-underline max-lg:py-4 [&>svg]:hidden">
            {title}
            <div className="lg:hidden">
              <Plus className="size-5" />
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-1 max-lg:py-4">
            <ul className="space-y-4 lg:space-y-2">
              {items.map(({ link, text }) => (
                <li
                  className="text-sm leading-tight font-light"
                  key={crypto.randomUUID()}
                >
                  <a
                    href={link}
                    className="hover:underline hover:underline-offset-3"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Fragment>
  );
};

const FooterSubMenu = ({ links }: { links: FooterLink[] }) => {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-4">
      {links.map(({ link, text }) => (
        <li key={crypto.randomUUID()}>
          <a href={link} className="text-sm font-light">
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
};

export { EcommerceFooter20 };
