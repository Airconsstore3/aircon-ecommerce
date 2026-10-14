import { Suspense } from "react";
import { cookies } from "next/headers";
import { CheckCircle, MessageCircle } from "lucide-react";

import { AirconProduct } from "@/components/shop/ProductCard";
import AccessoriesCategoryClient from "../categories/[slug]/AccessoriesCategoryClient";
import { createClient } from "@/utils/supabase/server";
import { buildWhatsAppHref, getContactChannels } from "@/lib/contact-settings";
import { getMaintenanceKind } from "@/lib/accessories";
import type { SupabaseProduct } from "@/lib/fetch-featured-products";

export const dynamic = "force-dynamic";

// Supabase product plus the optional display override used across the catalogue
type CatalogProduct = SupabaseProduct & {
  display_name?: string | null;
};

const INCLUDED_ITEMS = [
  "Filter clean & replacement",
  "Refrigerant gas level check",
  "Condensate drainage inspection",
  "Thermostat calibration test",
  "Electrical connections check",
  "Full performance report",
];

const FAQS = [
  ["How often should I service my air conditioner?", "For most homes, servicing every six to twelve months helps maintain performance and catch small issues early."],
  ["What happens during a service visit?", "We inspect, clean and test the system, check key connections and provide a clear performance report."],
  ["Can you service an air conditioner bought elsewhere?", "Yes. We can service compatible systems from other suppliers after confirming the model and condition."],
  ["Which areas do you cover?", "We service Cape Town and surrounding areas including Bellville, Somerset West, Stellenbosch and Durbanville."],
] as const;

function convertToAirconProduct(product: CatalogProduct): AirconProduct {
  return {
    id: product.id,
    name: product.display_name || product.name,
    slug: product.slug,
    brand: product.brand ?? null,
    btu_size: product.btu_range ? `${product.btu_range}BTU` : null,
    btu_range: product.btu_range ?? null,
    type: product.type,
    price_zar: product.price_zar,
    sale_price_zar: product.sale_price_zar || null,
    images: product.images,
    is_enquiry_only: product.is_enquiry_only,
    is_featured: product.is_featured,
    description: product.description,
    specs: product.specs,
    sort_order: product.sort_order,
    created_at: product.created_at,
    stock: {
      stock_count: product.stock_count,
      is_sold_out: product.is_sold_out,
      low_stock_threshold: product.low_stock_threshold,
    },
  };
}

async function getMaintenanceProducts() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_parent_product", true)
    .in("type", ["accessory", "kit"]);

  return (data || []).filter((p) => getMaintenanceKind(p) !== null);
}

export default async function MaintenancePage() {
  const [products, contact] = await Promise.all([
    getMaintenanceProducts(),
    getContactChannels(),
  ]);

  const whatsappUrl = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I'd like to book a maintenance service.")
    : null;

  const maintenanceProducts = products.map(convertToAirconProduct);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <AccessoriesCategoryClient
          products={maintenanceProducts}
          brandOptions={[]}
          categoryTitle="Maintenance & Service Plans"
          categoryDescription="Keep your system efficient and avoid surprise breakdowns. Book a plan, add extended cover, or request a repair — we confirm availability before you pay."
          productCountLabel="Services"
          catalogueKind="maintenance"
          catalogueIntro={
            <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FBFD] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C99D6]">
                  Included in every service
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INCLUDED_ITEMS.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D9E2EB] bg-white px-3 py-1.5 text-xs font-medium text-[#1E3A5F]"
                    >
                      <CheckCircle className="size-3.5 text-[#1C99D6]" aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#5F6B7A]">
                  Cape Town & surrounding areas — booking confirmed on enquiry.
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-sm font-semibold text-[#0A2540]">
                  Need a repair or one-off service?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#5F6B7A]">
                  Tell us what your system is doing and we&apos;ll help you book the right visit.
                </p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#1C99D6] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1597c6]"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Book on WhatsApp
                  </a>
                )}
              </div>
            </div>
          }
        />
      </Suspense>

      {/* FAQ — native <details>, no client JS needed */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="maintenance-faq">
        <div className="grid gap-8 border-t border-[#E5E7EB] pt-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C99D6]">
              Before you book
            </p>
            <h2 id="maintenance-faq" className="mt-2 text-xl font-semibold text-[#0A2540]">
              Common questions
            </h2>
          </div>
          <div>
            {FAQS.map(([question, answer]) => (
              <details key={question} className="group border-b border-[#E5E7EB]">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between py-4 text-sm font-medium text-[#0A2540] [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="text-xl font-light text-[#1C99D6] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-[#5F6B7A]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
