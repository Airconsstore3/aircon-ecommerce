"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star as StarIcon, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageProps = {
  src: string;
  alt?: string;
};

type BreadcrumbProps = {
  url: string;
  title: string;
};

type QuestionsProps = {
  title: string;
  answer: string;
};

type RatingProps = {
  review: number;
  starsNumber: number;
};

type SelectVariant = {
  value: string;
  label: string;
};

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

type OptionProps = {
  title: string;
  url: string;
  variant?: ButtonVariant;
  disabled?: boolean;
};

type ButtonActionProps = {
  title: string;
  variant?: ButtonVariant;
  onClick?: () => void;
};

type Props = {
  breadcrumbs: BreadcrumbProps[];
  heading: string;
  images: ImageProps[];
  description: string;
  price: string;
  rating: RatingProps;
  buttons: ButtonActionProps[];
  options: OptionProps[];
  quantityInputPlaceholder: string;
  freeShipping: string;
  questions: QuestionsProps[];
  selectVariants: SelectVariant[];
};

export type ProductHeader5Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProductHeader5 = (props: ProductHeader5Props) => {
  const {
    breadcrumbs,
    heading,
    images,
    price,
    description,
    rating,
    buttons,
    options,
    quantityInputPlaceholder,
    freeShipping,
    questions,
    selectVariants,
  } = {
    ...ProductHeader5Defaults,
    ...props,
  };
  const [variantInput, setVariantInput] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({
      variantInput,
      optionInput,
      quantityInput,
    });
  };

  return (
    <header id="relume" className="px-[5%] py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="grid grid-cols-1 gap-y-8 md:gap-y-10 lg:grid-cols-[1.25fr_1fr] lg:gap-x-20">
          <Gallery images={images} />
          <div>
            <div className="xl:sticky xl:top-32">
              <Breadcrumb className="mb-6 flex flex-wrap items-center text-sm">
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={item.url}>{item.title}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between md:mb-6">
                  <h1 className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl">
                    {heading}
                  </h1>
                  <p className="text-2xl font-bold md:text-3xl lg:text-4xl">{price}</p>
                </div>
                <div className="mb-5 flex flex-wrap items-center gap-3 md:mb-6">
                  <Star rating={rating.starsNumber} />
                  <p className="text-sm">{`(${rating.starsNumber} stars) • ${rating.review} reviews`}</p>
                </div>
                <p className="mb-5 md:mb-6">{description}</p>
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col">
                      <Label className="mb-2">Variant</Label>
                      <Select onValueChange={setVariantInput}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectVariants.map((item, index) => (
                            <SelectItem key={index} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <Label className="mb-2">Variant</Label>
                      <div className="flex flex-wrap gap-4">
                        {options.map((option, index) => (
                          <Link
                            key={index}
                            href={option.url}
                            aria-disabled={option.disabled}
                            className={cn(
                              buttonVariants({
                                variant: option.variant ?? "outline",
                                className: "px-4 py-2",
                              }),
                              option.disabled && "pointer-events-none opacity-25"
                            )}
                            onClick={() => setOptionInput(option.title || "")}
                          >
                            {option.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor="quantity" className="mb-2">
                        Quantity
                      </Label>
                      <Input
                        type="number"
                        id="quantity"
                        placeholder={quantityInputPlaceholder}
                        className="w-16"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-4 mt-8 flex flex-col gap-y-4">
                    {buttons.map((button, index) => (
                      <Button
                        key={index}
                        variant={button.variant}
                        onClick={button.onClick}
                        className="px-6 py-3"
                      >
                        {button.title}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-xs">{freeShipping}</p>
                </form>
                <Accordion type="multiple">
                  {questions.map((question, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="py-4 font-semibold md:text-md">
                        {question.title}
                      </AccordionTrigger>
                      <AccordionContent className="md:pb-6">{question.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Star = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFullStar = i < fullStars;
        const isHalfStar = hasHalfStar && i === fullStars;
        return (
          <div key={i}>
            {isFullStar ? (
              <StarIcon className="size-4 fill-current" />
            ) : isHalfStar ? (
              <StarHalf className="size-4 fill-current" />
            ) : (
              <StarIcon className="size-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Gallery = ({ images }: { images: ImageProps[] }) => {
  if (images.length === 0) return null;
  return (
    <React.Fragment>
      <div className="block lg:hidden">
        <img
          src={images[0].src}
          alt={images[0].alt}
          className="aspect-[5/4] size-full object-cover"
        />
      </div>
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
        {images.map((slide, index) => (
          <div key={index} className="first:lg:col-span-2">
            <img src={slide.src} alt={slide.alt} className="aspect-[5/4] size-full object-cover" />
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const ProductHeader5Defaults: Props = {
  breadcrumbs: [
    { url: "#", title: "Shop all" },
    { url: "#", title: "Category" },
    { url: "#", title: "Product name" },
  ],
  heading: "Product name",
  price: "$55",
  rating: {
    review: 10,
    starsNumber: 3.5,
  },
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  selectVariants: [
    { value: "first-choice", label: "Option One" },
    { value: "second-choice", label: "Option Two" },
    { value: "third-choice", label: "Option Three" },
  ],
  images: [
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 1",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 2",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 3",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 4",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 5",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 6",
    },
    {
      src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      alt: "Relume placeholder image 7",
    },
  ],
  buttons: [{ title: "Add to cart" }, { title: "Buy now", variant: "secondary" }],
  options: [
    { title: "Option one", url: "#", variant: "default" },
    { title: "Option two", url: "#", variant: "outline" },
    { title: "Option three", url: "#", variant: "outline", disabled: true },
  ],
  quantityInputPlaceholder: "1",
  freeShipping: "Free shipping over $50",
  questions: [
    {
      title: "Details",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Shipping",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
    {
      title: "Returns",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
    },
  ],
};
