"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/shop/CartProvider";
import z from "zod";

import { Price, PriceValue } from "@/components/price";
import { Rating } from "@/components/rating";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const STOCK_STATUS = {
  IN_STOCK: "IN_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

type StockStatusCode = keyof typeof STOCK_STATUS;

interface ListCarouselProps {
  productsList: Array<ProductCard>;
}

type Image = {
  src: string;
  alt: string;
};

type Option = {
  id: string;
  label: string;
  color: string;
  value: string;
  image: Image;
};

interface Product {
  id: string;
  slug: string;
  name: string;
  collection: {
    label: string;
    link: string;
  };
  variantId: string;
  image: {
    src: string;
    alt: string;
  };
  link: string;
  price: ProductPrice;
  quickAdd?: boolean;
  variants?: {
    name: FieldName;
    options: Array<Option>;
  };
  stockStatusCode: StockStatusCode;
  rating?: number;
  type?: string;
  is_enquiry_only?: boolean;
}

type ProductCard = Product;

type ProductCardProps = ProductCard;

interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

type FieldName = keyof FormType;

type FormType = z.infer<typeof formSchema>;

interface ProductFormProps {
  colorHinges?: {
    name: FieldName;
    options: Omit<Option, "image">[];
  };
  form: UseFormReturn<FormType>;
}

interface RadioGroupProps {
  options?: Omit<Option, "image">[];
  field: ControllerRenderProps<FormType>;
}

type ColorOptionProps = Omit<Option, "image">;

type ProductList = Array<Product>;

const PRODUCTS_LIST: ProductList = [
  {
    id: "prod-alliance-black-mirror",
    slug: "alliance-black-mirror",
    collection: {
      label: "Alliance",
      link: "/categories/residential",
    },
    name: "Alliance Black Mirror",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "alliance_black_mirror",
    link: "/products/alliance-black-mirror",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Alliance black mirror.png",
      alt: "Alliance Black Mirror Air Conditioner",
    },
    price: {
      regular: 12999,
      sale: 11699,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.5,
  },
  {
    id: "prod-alliance-multi-split",
    slug: "alliance-multi-split",
    collection: {
      label: "Alliance",
      link: "/categories/residential",
    },
    name: "Alliance Multi Split",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "alliance_multi_split",
    link: "/products/alliance-multi-split",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Allince multi split.png",
      alt: "Alliance Multi Split Air Conditioner",
    },
    price: {
      regular: 18999,
      sale: 17199,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.8,
  },
  {
    id: "prod-daikin-perfera",
    slug: "daikin-perfera-wall",
    collection: {
      label: "Daikin",
      link: "/categories/residential",
    },
    name: "Daikin Perfera Wall",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "daikin_perfera",
    link: "/products/daikin-perfera-wall",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Daikin Perfera wall.png",
      alt: "Daikin Perfera Wall Air Conditioner",
    },
    price: {
      regular: 15999,
      sale: 14399,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.7,
  },
  {
    id: "prod-jet-air-red",
    slug: "jet-air-red",
    collection: {
      label: "Jet Air",
      link: "/categories/residential",
    },
    name: "Jet Air Red",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "jet_air_red",
    link: "/products/jet-air-red",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Jet Air Red.png",
      alt: "Jet Air Red Air Conditioner",
    },
    price: {
      regular: 9999,
      sale: 8999,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.3,
  },
  {
    id: "prod-jet-air-black-mirror",
    slug: "jet-air-black-mirror",
    collection: {
      label: "Jet Air",
      link: "/categories/residential",
    },
    name: "Jet Air Black Mirror",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "jet_air_black_mirror",
    link: "/products/jet-air-black-mirror",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Jet air Black mirror.png",
      alt: "Jet Air Black Mirror Air Conditioner",
    },
    price: {
      regular: 10999,
      sale: 9899,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.6,
  },
  {
    id: "prod-lg-dual-inverter",
    slug: "lg-dual-inverter",
    collection: {
      label: "LG",
      link: "/categories/residential",
    },
    name: "LG Dual Inverter",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "lg_dual_inverter",
    link: "/products/lg-dual-inverter",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/LG Dual Inverter.png",
      alt: "LG Dual Inverter Air Conditioner",
    },
    price: {
      regular: 14999,
      sale: 13499,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.9,
  },
  {
    id: "prod-samsung-dvm-s2",
    slug: "samsung-dvm-s2",
    collection: {
      label: "Samsung",
      link: "/categories/residential",
    },
    name: "Samsung DVM S2+",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "samsung_dvm_s2",
    link: "/products/samsung-dvm-s2",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/Samsung DVM S2+.png",
      alt: "Samsung DVM S2+ Air Conditioner",
    },
    price: {
      regular: 21999,
      sale: 19799,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.4,
  },
  {
    id: "prod-samsung-slimduct",
    slug: "samsung-slimduct-r32",
    collection: {
      label: "Samsung",
      link: "/categories/residential",
    },
    name: "Samsung SlimDuct R32",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "samsung_slimduct",
    link: "/products/samsung-slimduct-r32",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/samsung SlimDuct_r32icon.png",
      alt: "Samsung SlimDuct R32 Air Conditioner",
    },
    price: {
      regular: 17999,
      sale: 16199,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.2,
  },
  {
    id: "prod-samsung-ar3000",
    slug: "samsung-ar3000",
    collection: {
      label: "Samsung",
      link: "/categories/residential",
    },
    name: "Samsung AR3000",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "samsung_ar3000",
    link: "/products/samsung-ar3000",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/samsung ar3000.png",
      alt: "Samsung AR3000 Air Conditioner",
    },
    price: {
      regular: 13999,
      sale: 12599,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.1,
  },
  {
    id: "prod-samsung-ar70",
    slug: "samsung-ar70",
    collection: {
      label: "Samsung",
      link: "/categories/residential",
    },
    name: "Samsung AR70",
    type: "aircon",
    is_enquiry_only: false,
    variantId: "samsung_ar70",
    link: "/products/samsung-ar70",
    image: {
      src: "/Hero Images/Featured In section/Promo sales aircons/samsung ar70.png",
      alt: "Samsung AR70 Air Conditioner",
    },
    price: {
      regular: 11999,
      sale: 10799,
      currency: "ZAR",
    },
    quickAdd: true,
    stockStatusCode: "IN_STOCK",
    rating: 4.5,
  },
];

interface ProductList6Props {
  className?: string;
}

const ProductList6 = ({ className }: ProductList6Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="w-full px-4 sm:px-20">
        <ListCarousel productsList={PRODUCTS_LIST} />
      </div>
    </section>
  );
};

const ListCarousel = ({ productsList }: ListCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = (api: CarouselApi) => {
      if (!api) return;
      setCurrent(api.selectedScrollSnap() + 1);
    };
    onSelect(api);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api]);

  if (!productsList) return;

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      setApi={setApi}
    >
      <div className="flex items-center justify-between pb-[24px]">
        <div className="flex flex-wrap items-end gap-[8px]">
          <h2 className="text-[28px] md:text-[48px] leading-[1.1] font-normal text-black -tracking-[0.6px] font-[var(--font-google-sans-flex)]">
            Promo Sales
          </h2>
          <span className="inline-flex items-center rounded-full bg-[#1C99D6] px-3 py-1 text-xs font-bold text-white font-[var(--font-google-sans-flex)]">
            Discounts 10-20%
          </span>
        </div>
        <div className="hidden items-center gap-[8px] xl:flex">
          <CarouselPrevious className="static translate-0 rounded-full bg-[#1C99D6] text-white hover:bg-[#1C99D6]/80 h-[40px] w-[40px] border-0" />
          <CarouselNext className="static translate-0 rounded-full bg-[#1C99D6] text-white hover:bg-[#1C99D6]/80 h-[40px] w-[40px] border-0" />
        </div>
      </div>
      <CarouselContent>
        {productsList.map((product, index) => (
          <CarouselItem
            key={`product-list-6-item-${index}`}
            className="sm:basis-1/2 xl:basis-1/4"
          >
            <ProductCard {...product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-center pt-[20px] xl:hidden">
        {productsList.map((_, index) => (
          <button
            onClick={() => api?.scrollTo(index)}
            data-active={current === index + 1}
            className="flex size-[24px] after:m-auto after:h-[4px] after:w-[20px] after:bg-muted-foreground/50 after:transition-colors data-[active=true]:after:bg-primary sm:last:hidden"
            key={`product-list-6-pagination-bullets-${index}`}
          ></button>
        ))}
      </div>
    </Carousel>
  );
};

const formSchema = z.object({
  color: z.string(),
});

const ProductCard = ({
  id,
  slug,
  name,
  image,
  stockStatusCode,
  price,
  link,
  collection,
  quickAdd,
  variants,
  variantId,
  rating,
  type = "aircon",
  is_enquiry_only = false,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      color: variantId,
    },
  });
  const selectedVariant = form.watch("color");
  const currentVariantImage =
    variants?.options.find((item) => item.value === selectedVariant)?.image ||
    image;

  const { regular, sale, currency } = price;

  function onSubmit(values: FormType) {
    console.log(values);
  }

  return (
    <Card className="group gap-[8px] rounded-none border border-solid border-[#0A2540]/30 bg-transparent p-0 shadow-none">
      <CardHeader className="gap-0 p-0">
        <AspectRatio ratio={0.76984127} className="overflow-hidden">
          <Link href={link} className="block size-full">
            {currentVariantImage && (
              <img
                src={currentVariantImage?.src}
                alt={currentVariantImage?.alt}
                className="block size-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </Link>
          <div className="absolute left-[16px] right-[16px] bottom-[48px] flex justify-center">
            <button
              type="button"
              onClick={() =>
                addItem({
                  id,
                  name,
                  slug,
                  price_zar: regular,
                  sale_price_zar: sale,
                  images: [image.src],
                  type,
                  is_enquiry_only,
                })
              }
              style={{ width: 'var(--button-width, 200px)' }}
              className="h-[40px] border border-dashed border-[#0A2540] bg-transparent text-[#0A2540] text-[14px] font-normal rounded-none transition-all hover:bg-[#1C99D6] hover:border-solid hover:border-[#1C99D6] hover:text-white flex items-center justify-center gap-[8px] font-[var(--font-google-sans-flex)]"
            >
              <ShoppingCart className="w-[16px] h-[16px]" />
              Buy Now
            </button>
          </div>
        </AspectRatio>
      </CardHeader>
      <CardContent className="p-0 pl-[16px]">
        {price?.sale && (
          <div className="text-sm">
            <span className="text-destructive">Sale</span>
          </div>
        )}
        <div
          className={`pt-[2px] ${!price?.sale && "mt-[20px]"}`}
        >
          <Link href={collection.link} className="text-sm font-bold">
            {collection.label}
          </Link>
          <div className="flex flex-wrap items-center gap-[8px] xl:flex-nowrap">
            <CardTitle className="text-sm font-normal">{name}</CardTitle>
            <div className="transition-opacity duration-400 group-hover:opacity-100 xl:opacity-0">
              <ProductForm colorHinges={variants} form={form} />
            </div>
          </div>
        </div>
        {rating && (
          <div className="mt-[8px]">
            <Rating rate={rating} className="[&_svg]:size-[12px] [&>div]:size-[12px]" />
          </div>
        )}
      </CardContent>
      <CardFooter className="relative mt-[4px] flex-col items-start gap-[12px] p-0 pl-[16px] xl:flex-row">
        <div>
          <Price onSale={sale != null} className="text-sm font-light text-black">
            <PriceValue price={sale} currency="ZAR" variant="sale" />
            <PriceValue price={regular} currency="ZAR" variant="regular" />
          </Price>
        </div>
      </CardFooter>
    </Card>
  );
};

const ProductForm = ({ colorHinges, form }: ProductFormProps) => {
  if (!colorHinges) return;

  return (
    <form>
      <Controller
        control={form.control}
        name={colorHinges.name}
        render={({ field }) => (
          <Field>
            <ColorRadioGroup field={field} options={colorHinges.options} />
          </Field>
        )}
      />
    </form>
  );
};

const ColorRadioGroup = ({ options, field }: RadioGroupProps) => {
  if (!options) return;

  return (
    <RadioGroup
      {...field}
      value={`${field.value}`}
      onValueChange={(value) => {
        if (value != field.value && value) {
          field.onChange(value);
        }
      }}
      className="flex gap-0"
    >
      {options &&
        options.map((item, index) => (
          <Field key={`product-list-6-color-input-${index}`}>
            <ColorOption
              label={item.label}
              id={item.id}
              color={item.color}
              value={item.value}
            />
          </Field>
        ))}
    </RadioGroup>
  );
};

const ColorOption = ({ id, value, color, label }: ColorOptionProps) => {
  return (
    <FieldLabel
      htmlFor={id}
      aria-label={label}
      className="relative flex size-5 cursor-pointer after:pointer-events-none after:absolute after:inset-1/2 after:size-1 after:-translate-1/2 after:rounded-full after:bg-white after:opacity-0 after:transition-opacity has-checked:after:opacity-100"
    >
      <RadioGroupItem id={id} className="sr-only" value={value} />
      <div
        style={{
          backgroundColor: color,
        }}
        className="m-auto size-2.5 rounded-full"
      ></div>
    </FieldLabel>
  );
};

export { ProductList6 };
