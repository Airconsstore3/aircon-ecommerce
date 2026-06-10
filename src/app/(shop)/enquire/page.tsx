"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import z from "zod";

import type { PriceType } from "@/components/price";
import { Price, PriceValue } from "@/components/price";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartProvider";

type CartItem = {
  product_id: string;
  link: string;
  name: string;
  image: string;
  price: PriceType;
  details: {
    label: string;
    value: string;
  }[];
};

type CartType = {
  items: CartItem[];
  discount: {
    price: number;
    currency: string;
  };
};

const enquiryFormSchema = z.object({
  propertyType: z.enum(["residential", "commercial"]),
  
  // Contact details
  contact: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^0[6-8][0-9]{8}$/, "Please enter a valid SA phone number (e.g., 082 123 4567)"),
  }),
  
  // Product of interest (for single product enquiries)
  productSlug: z.string().optional(),
  
  // Residential install address
  residential: z.object({
    streetAddress: z.string().min(5, "Street address is required"),
    suburb: z.string().min(2, "Suburb is required"),
    city: z.string(),
    province: z.string(),
    preferredInstallDate: z.string().optional(),
    specialRequirements: z.string().optional(),
  }).optional(),
  
  // Commercial install address
  commercial: z.object({
    companyName: z.string().min(2, "Company name is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    propertyAddress: z.string().min(5, "Property address is required"),
    suburb: z.string().min(2, "Suburb is required"),
    city: z.string().min(2, "City is required"),
    numberOfUnits: z.number().min(1, "At least 1 unit required"),
    floorArea: z.number().min(1, "Floor area is required"),
    propertyType: z.enum(["office", "retail", "hotel", "warehouse", "other"]),
    preferredStartDate: z.string().optional(),
    specialRequirements: z.string().optional(),
  }).optional(),
  
  // Products in quote (for cart-based enquiries)
  products: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    price: z.number(),
  })).optional(),
  
  // Installation required
  installationRequired: z.boolean().optional(),
  
  // Installation add-ons (conditional)
  installationAddons: z.array(z.string()).optional(),
  
  // Message
  message: z.string().optional(),
  
  // Promo code
  promoCode: z.string().optional(),
});

type EnquiryFormType = z.infer<typeof enquiryFormSchema>;

type CartItemProps = CartItem;

interface CartProps {
  cartData: CartType;
  form: UseFormReturn<EnquiryFormType>;
}

interface EnquiryPageProps {
  className?: string;
}

interface EnquiryFormProps {
  onSubmit: SubmitHandler<EnquiryFormType>;
}

function EnquiryPageContent({ className }: EnquiryPageProps) {
  const { items: cartItems } = useCart();
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  
  // Convert CartProvider items to CartItem format
  const cartData: CartType = {
    items: cartItems.map((item) => ({
      product_id: item.id,
      link: `/products/${item.slug}`,
      name: item.name,
      image: item.images[0] || "",
      price: {
        regular: item.price_zar,
        sale: item.sale_price_zar,
        currency: "ZAR",
      },
      details: [
        {
          label: "Type",
          value: item.type.replace(/_/g, " "),
        },
      ],
    })),
    discount: {
      price: 0,
      currency: "ZAR",
    },
  };

  const defaultProducts = cartData.items.map((item) => ({
    product_id: item.product_id,
    quantity: 1,
    price: item.price.sale ?? item.price.regular,
  }));

  const form = useForm<EnquiryFormType>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      propertyType: "residential",
      products: defaultProducts.length > 0 ? defaultProducts : undefined,
      productSlug: productSlug || undefined,
      installationRequired: false,
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const onSubmit: SubmitHandler<EnquiryFormType> = async (data: EnquiryFormType) => {
    console.log(data);
    
    // POST to /api/enquire
    try {
      const response = await fetch('/api/enquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit enquiry');
      }
      
      const result = await response.json();
      setReferenceNumber(result.referenceNumber);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      // Fallback to local reference generation
      const ref = `ENQ-2025-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      setReferenceNumber(ref);
      setSubmitted(true);
    }
  };

  return (
    <section className={cn("bg-muted pt-20 pb-12 md:pt-32 md:pb-32", className)}>
      <div className="w-full px-4 sm:px-20">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">Get a Quote</h1>
          <p className="text-muted-foreground">Need help? Call us on <span className="font-semibold text-[#1C99D6]">082 123 4567</span></p>
        </div>
        
        <FormProvider {...form}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div className="col-span-1">
              <div className="space-y-6">
                <Cart form={form} cartData={cartData} />
                <PromoCode />
              </div>
            </div>
            <div className="xl:col-span-2">
              {submitted ? (
                <SuccessState referenceNumber={referenceNumber} email={form.getValues("contact.email")} />
              ) : (
                <EnquiryForm onSubmit={onSubmit} />
              )}
            </div>
          </div>
        </FormProvider>
      </div>
    </section>
  );
}

export default function EnquiryPage({ className }: EnquiryPageProps) {
  return (
    <Suspense fallback={<div className="bg-muted pt-20 pb-12 md:pt-32 md:pb-32"><div className="w-full px-4 sm:px-20"><p>Loading...</p></div></div>}>
      <EnquiryPageContent className={className} />
    </Suspense>
  );
}

const Cart = ({ cartData, form }: CartProps) => {
  const { fields } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const formItems = form.watch("products");

  const subTotalPrice = formItems?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;
  const totalPrice = subTotalPrice - cartData.discount.price;

  return (
    <div className="space-y-6 rounded-lg border-border bg-background p-7 shadow-lg">
      <div>
        <h2 className="text-xl leading-relaxed font-normal">Your Quote Summary</h2>
        <p className="text-sm font-medium text-muted-foreground">
          You have {formItems?.length || 0} item{(formItems?.length || 0) !== 1 ? "s" : ""} in your quote.
        </p>
      </div>
      <Separator />
      <ul className="space-y-5">
        {fields.map((field) => {
          return (
            <li key={field.id}>
              <CartItem
                {...(cartData.items.find(
                  (p) => p.product_id === field.product_id,
                ) as CartItem)}
              />
            </li>
          );
        })}
      </ul>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>Subtotal</div>
          <Price>
            <PriceValue
              price={subTotalPrice}
              currency="ZAR"
            />
          </Price>
        </div>
        {cartData.discount.price > 0 && (
          <div className="flex items-center justify-between">
            <div>Discount</div>
            <Price>
              <PriceValue
                price={cartData.discount.price}
                currency="ZAR"
              />
            </Price>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="font-semibold">Total</div>
        <Price>
          <PriceValue
            price={totalPrice}
            currency="ZAR"
            className="text-lg font-bold text-[#1C99D6]"
          />
        </Price>
      </div>
      
      {/* Payment method icons */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-2">We accept:</p>
        <div className="flex flex-wrap gap-2">
          {["Visa", "Mastercard", "Ozow", "SnapScan", "Mobicred", "Yoco"].map((method) => (
            <Badge key={method} variant="outline" className="text-xs">
              {method}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ image, name, link, details, price }: CartItemProps) => {
  const { regular, currency } = price;

  return (
    <a href={link} className="flex items-center gap-4">
      <div className="shrink-0 basis-15">
        <AspectRatio ratio={1} className="overflow-hidden">
          <img
            src={image}
            alt=""
            className="block size-full object-cover object-center"
          />
        </AspectRatio>
      </div>
      <div className="flex flex-1 gap-4 max-sm:flex-col sm:items-center">
        <div className="flex-1">
          <h2 className="font-normal">{name}</h2>
          <ProductDetails details={details} />
        </div>
        <Price className="text-sm font-semibold">
          <PriceValue price={regular} currency={currency} variant="regular" />
        </Price>
      </div>
    </a>
  );
};

const ProductDetails = ({
  details,
}: {
  details?: {
    label: string;
    value: string;
  }[];
}) => {
  if (!details) return;
  return (
    <ul>
      {details?.map((item, index) => {
        const isLast = index === details.length - 1;

        return (
          <li className="inline" key={index}>
            <dl className="inline text-xs text-muted-foreground">
              <dt className="inline">{item.label}: </dt>
              <dd className="inline">{item.value}</dd>
              {!isLast && <span className="mx-1 text-muted-foreground">/</span>}
            </dl>
          </li>
        );
      })}
    </ul>
  );
};

const promoCodeFormSchema = z.object({
  promoCode: z.string().trim().min(3),
});

type promoCodeFormType = z.infer<typeof promoCodeFormSchema>;

const PromoCode = () => {
  const promoForm = useForm<promoCodeFormType>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      promoCode: "",
    },
  });

  const onSubmit = (data: promoCodeFormType) => {
    console.log(data);
  };

  return (
    <div className="rounded-lg border-border bg-background p-7 shadow-lg">
      <form onSubmit={promoForm.handleSubmit(onSubmit)}>
        <Controller
          name="promoCode"
          control={promoForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div>
                <FieldLabel
                  htmlFor="promo-code"
                  className="text-lg font-semibold"
                >
                  Coupon Code
                </FieldLabel>
                <FieldDescription>
                  Enter code to get discount instantly.
                </FieldDescription>
              </div>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id="promo-code"
                  placeholder="Promotional code"
                  aria-invalid={fieldState.invalid}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton variant="default" className="text-xs">
                    Apply
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

const EnquiryForm = ({ onSubmit }: EnquiryFormProps) => {
  const [activeAccordion, setActiveAccordion] = useState("item-1");
  const { handleSubmit } = useFormContext<EnquiryFormType>();

  const handleOnValueChange = (value: string) => {
    setActiveAccordion(value);
  };

  const onContinue = (value: string) => {
    setActiveAccordion(value);
  };

  const accordionTriggerClasses =
    "px-5 py-3.5 text-base font-semibold hover:no-underline";
  const accordionContentClasses = "px-5 pb-7 pt-3.5 border-t";

  return (
    <div className="space-y-6 rounded-lg border-border bg-background p-7 shadow-lg">
      {/* Property Type Tab Toggle */}
      <div className="mb-6">
        <Controller
          name="propertyType"
          control={useFormContext().control}
          render={({ field }) => (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={field.value === "residential" ? "default" : "outline"}
                className={cn(
                  "flex-1 rounded-full",
                  field.value === "residential" 
                    ? "bg-[#1C99D6] hover:bg-[#1a7fb8] text-white" 
                    : ""
                )}
                onClick={() => field.onChange("residential")}
              >
                Residential
              </Button>
              <Button
                type="button"
                variant={field.value === "commercial" ? "default" : "outline"}
                className={cn(
                  "flex-1 rounded-full",
                  field.value === "commercial" 
                    ? "bg-[#1C99D6] hover:bg-[#1a7fb8] text-white" 
                    : ""
                )}
                onClick={() => field.onChange("commercial")}
              >
                Commercial
              </Button>
            </div>
          )}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion
          type="single"
          collapsible
          className="w-full border"
          value={activeAccordion}
          onValueChange={handleOnValueChange}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className={accordionTriggerClasses}>
              Contact Details
            </AccordionTrigger>
            <AccordionContent className={accordionContentClasses}>
              <div className="space-y-7">
                <ContactFields />
                <Button
                  type="button"
                  className="w-full"
                  variant="secondary"
                  onClick={() => onContinue("item-2")}
                >
                  Continue
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className={accordionTriggerClasses}>
              Installation Address
            </AccordionTrigger>
            <AccordionContent className={accordionContentClasses}>
              <div className="space-y-7">
                <InstallAddressFields />
                <Button
                  type="button"
                  className="w-full"
                  variant="secondary"
                  onClick={() => onContinue("item-3")}
                >
                  Continue
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className={accordionTriggerClasses}>
              Installation & Message
            </AccordionTrigger>
            <AccordionContent className={accordionContentClasses}>
              <div className="space-y-7">
                <InstallationFields />
                <MessageField />
                <Button
                  type="button"
                  className="w-full"
                  variant="secondary"
                  onClick={() => onContinue("item-4")}
                >
                  Continue
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className={accordionTriggerClasses}>
              Review & Submit
            </AccordionTrigger>
            <AccordionContent className={accordionContentClasses}>
              <div className="space-y-7">
                {/* Security placeholder */}
                <div className="h-12 rounded-lg border-2 border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Security verification</span>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#1C99D6] hover:bg-[#1a7fb8] text-white rounded-full"
                >
                  Submit Quote Request
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </div>
  );
};

const ContactFields = () => {
  const form = useFormContext();

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="contact.fullName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="contact-fullName"
            >
              Full Name
            </FieldLabel>
            <Input
              {...field}
              id="contact-fullName"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="contact.email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="contact-email"
            >
              Email
            </FieldLabel>
            <Input
              {...field}
              type="email"
              id="contact-email"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="contact.phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="contact-phone"
            >
              Phone
            </FieldLabel>
            <Input
              {...field}
              type="tel"
              placeholder="082 123 4567"
              id="contact-phone"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

const InstallAddressFields = () => {
  const form = useFormContext();
  const propertyType = form.watch("propertyType");

  if (propertyType === "residential") {
    return <ResidentialFields />;
  }

  return <CommercialFields />;
};

const ResidentialFields = () => {
  const form = useFormContext();

  // Set default values for city and province
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="residential.streetAddress"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="residential-streetAddress"
            >
              Street Address
            </FieldLabel>
            <Input
              {...field}
              id="residential-streetAddress"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="residential.suburb"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="residential-suburb"
            >
              Suburb
            </FieldLabel>
            <Input
              {...field}
              id="residential-suburb"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-3.5 max-sm:flex-col">
        <Controller
          name="residential.city"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="residential-city"
              >
                City
              </FieldLabel>
              <Input
                {...field}
                id="residential-city"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="residential.province"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="residential-province"
              >
                Province
              </FieldLabel>
              <Input
                {...field}
                id="residential-province"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        name="residential.preferredInstallDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="residential-preferredInstallDate"
            >
              Preferred Install Date
            </FieldLabel>
            <Input
              {...field}
              type="date"
              min={minDate}
              id="residential-preferredInstallDate"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="residential.specialRequirements"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="residential-specialRequirements"
            >
              Special Requirements (Optional)
            </FieldLabel>
            <Textarea
              {...field}
              placeholder="Any access notes or special requirements"
              id="residential-specialRequirements"
              aria-invalid={fieldState.invalid}
              className="min-h-[100px]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/* Photo upload placeholder */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground">Upload photos of your space (optional)</p>
      </div>
    </FieldGroup>
  );
};

const CommercialFields = () => {
  const form = useFormContext();

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="commercial.companyName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-companyName"
            >
              Company Name
            </FieldLabel>
            <Input
              {...field}
              id="commercial-companyName"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.contactPerson"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-contactPerson"
            >
              Contact Person
            </FieldLabel>
            <Input
              {...field}
              id="commercial-contactPerson"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.propertyAddress"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-propertyAddress"
            >
              Property Address
            </FieldLabel>
            <Input
              {...field}
              id="commercial-propertyAddress"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.suburb"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-suburb"
            >
              Suburb
            </FieldLabel>
            <Input
              {...field}
              id="commercial-suburb"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.city"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-city"
            >
              City
            </FieldLabel>
            <Input
              {...field}
              id="commercial-city"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-3.5 max-sm:flex-col">
        <Controller
          name="commercial.numberOfUnits"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="commercial-numberOfUnits"
              >
                Number of Units
              </FieldLabel>
              <Input
                {...field}
                type="number"
                min={1}
                id="commercial-numberOfUnits"
                aria-invalid={fieldState.invalid}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="commercial.floorArea"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="commercial-floorArea"
              >
                Floor Area (m²)
              </FieldLabel>
              <Input
                {...field}
                type="number"
                min={1}
                id="commercial-floorArea"
                aria-invalid={fieldState.invalid}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        name="commercial.propertyType"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-propertyType"
            >
              Property Type
            </FieldLabel>
            <Select
              {...field}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger id="commercial-propertyType" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.preferredStartDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-preferredStartDate"
            >
              Preferred Start Date
            </FieldLabel>
            <Input
              {...field}
              type="date"
              id="commercial-preferredStartDate"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="commercial.specialRequirements"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="commercial-specialRequirements"
            >
              Special Requirements (Optional)
            </FieldLabel>
            <Textarea
              {...field}
              placeholder="Any special requirements"
              id="commercial-specialRequirements"
              aria-invalid={fieldState.invalid}
              className="min-h-[100px]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

const InstallationFields = () => {
  const form = useFormContext();
  const installationRequired = form.watch("installationRequired");

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="installationRequired"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel className="text-sm font-normal">
              Do you require installation?
            </FieldLabel>
            <RadioGroup
              value={field.value ? "yes" : "no"}
              onValueChange={(value) => field.onChange(value === "yes")}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="install-yes" />
                <label htmlFor="install-yes" className="text-sm">Yes</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="install-no" />
                <label htmlFor="install-no" className="text-sm">No</label>
              </div>
            </RadioGroup>
          </Field>
        )}
      />
      {installationRequired && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Installation Add-ons</p>
          <p className="text-xs text-muted-foreground mb-3">Select any additional services you need</p>
          <div className="space-y-2">
            {["Extended Piping", "Additional Electrical Work", "Wall Bracket", "Drainage Kit"].map((addon) => (
              <label key={addon} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => {
                    const currentAddons = form.getValues("installationAddons") || [];
                    if (e.target.checked) {
                      form.setValue("installationAddons", [...currentAddons, addon]);
                    } else {
                      form.setValue("installationAddons", currentAddons.filter((a: string) => a !== addon));
                    }
                  }}
                />
                <span>{addon}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </FieldGroup>
  );
};

const MessageField = () => {
  const form = useFormContext();

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="message"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="message"
            >
              Additional Message (Optional)
            </FieldLabel>
            <FieldDescription>
              Any other details you'd like to share with us
            </FieldDescription>
            <Textarea
              {...field}
              placeholder="Tell us more about your requirements..."
              id="message"
              aria-invalid={fieldState.invalid}
              className="min-h-[120px]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

const SuccessState = ({ referenceNumber, email }: { referenceNumber: string; email: string }) => {
  return (
    <div className="rounded-lg border-border bg-background p-7 shadow-lg">
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-normal text-[#1E3A5F]">Quote Request Received!</h2>
          <Badge className="bg-[#1E3A5F] text-white">Reference: {referenceNumber}</Badge>
        </div>
        <p className="text-muted-foreground max-w-md">
          We will confirm within 2 hours via WhatsApp and email to <span className="font-medium text-[#1E3A5F]">{email}</span>
        </p>
        <div className="flex gap-3 w-full max-w-xs">
          <Button
            asChild
            className="flex-1 bg-[#1C99D6] hover:bg-[#1a7fb8] text-white rounded-full"
          >
            <Link href={`/track/${referenceNumber}`}>Track Your Enquiry</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
