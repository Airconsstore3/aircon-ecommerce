"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Filter,
  Droplets,
  CheckCircle,
  Thermometer,
  Zap,
  FileText,
  ArrowRight,
  Calendar,
  Clock,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const plans = [
    {
      id: 1,
      name: "Annual Plan",
      price: 1200,
      visits: 1,
      frequency: "per year",
      bestFor: "Single residential unit",
      popular: false,
    },
    {
      id: 2,
      name: "Bi-Annual Care Plan",
      price: 2000,
      visits: 2,
      frequency: "per year (every 6 months)",
      bestFor: "Family home or multiple units",
      popular: true,
    },
    {
      id: 3,
      name: "Quarterly Commercial",
      price: 3500,
      visits: 4,
      frequency: "per year (every 3 months)",
      bestFor: "Commercial properties",
      popular: false,
    },
  ];

  const includedItems = [
    { icon: Filter, title: "Filter clean & replacement" },
    { icon: Droplets, title: "Refrigerant gas level check" },
    { icon: CheckCircle, title: "Condensate drainage inspection" },
    { icon: Thermometer, title: "Thermostat calibration test" },
    { icon: Zap, title: "Electrical connections check" },
    { icon: FileText, title: "Full performance report" },
  ];

  const scrollToPlans = () => {
    document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="/Hero Images/hero summer winter.webp"
          alt="Maintenance background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
            Maintenance
          </h1>
          <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
            Keep your aircon running efficiently with regular maintenance plans
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-[24px]">
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <Link href="/checkout">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            Every service visit includes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {includedItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                  <item.icon className="size-5 text-[#1C99D6]" />
                </div>
                <div>
                  <p className="font-medium text-[#1E3A5F] text-sm">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            Choose your plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl shadow-sm p-6 border-2 ${
                  plan.popular
                    ? "border-[#1C99D6] bg-white"
                    : "border-border bg-white"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C99D6] text-white">
                    Most Popular
                  </Badge>
                )}
                <div className="pt-4">
                  <h3 className="text-xl font-normal text-[#1E3A5F] mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#1E3A5F]">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground">/{plan.frequency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.visits} service visit{plan.visits > 1 ? "s" : ""} {plan.frequency}
                  </p>
                  <p className="text-sm font-medium text-[#1E3A5F] mb-6">
                    Best for: {plan.bestFor}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {includedItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                    asChild
                  >
                    <Link href="/checkout">Get Started</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Choose your plan
              </h3>
              <p className="text-sm text-muted-foreground">
                Select the maintenance plan that fits your needs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                We schedule your first visit
              </h3>
              <p className="text-sm text-muted-foreground">
                We'll contact you to arrange your first service
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Sit back and relax
              </h3>
              <p className="text-sm text-muted-foreground">
                We remind you before each scheduled service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                What happens during a service visit?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our technician will perform a comprehensive check including filter cleaning, gas level inspection, drainage check, thermostat calibration, electrical connections test, and provide you with a full performance report.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Can I cancel my plan?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, you can cancel your maintenance plan at any time. We'll refund the prorated amount for any unused service visits.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Do you service all aircon brands?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we service all major aircon brands including Samsung, LG, Midea, Daikin, Gree, and more. Our technicians are certified to work with all systems.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                What areas do you cover in Cape Town?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We cover the entire Cape Town Metro area including Northern Suburbs, Southern Suburbs, City Bowl, Atlantic Seaboard, and West Coast.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-[#1E3A5F]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-normal text-white mb-4">
            Ready to protect your aircon?
          </h2>
          <p className="text-gray-200 mb-8">
            Get started today — first service within 7 days of signup
          </p>
          <Button
            onClick={scrollToPlans}
            className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
          >
            Choose a Plan
          </Button>
        </div>
      </section>
    </div>
  );
}
