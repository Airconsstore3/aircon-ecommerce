import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  display_name: string | null;
  slug: string;
  brand: string | null;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[] | null;
  is_enquiry_only: boolean;
  is_sold_out: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createClient(await cookies());
  const { data: collection } = await supabase
    .from("collections")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!collection) return { title: "Collection not found | Aircons Store" };

  return {
    title: `${collection.name} | Aircons Store`,
    description:
      collection.description ?? `Browse ${collection.name} at Aircons Store.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createClient(await cookies());

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, slug, description, parent_id")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!collection) {
    notFound();
  }

  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id, sort_order")
    .eq("collection_id", (collection as CollectionRow).id)
    .order("sort_order", { ascending: true });

  const productIds = (links ?? []).map((l) => l.product_id);

  let products: ProductRow[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, name, display_name, slug, brand, price_zar, sale_price_zar, images, is_enquiry_only, is_sold_out")
      .in("id", productIds)
      .eq("is_published", true);
    products = (data ?? []) as ProductRow[];
    // Preserve junction sort order
    products.sort(
      (a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id)
    );
  }

  const { data: parent } = (collection as CollectionRow).parent_id
    ? await supabase
        .from("collections")
        .select("name, slug")
        .eq("id", (collection as CollectionRow).parent_id!)
        .eq("is_published", true)
        .maybeSingle()
    : { data: null };

  return (
    <section className="min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="mb-2 text-sm text-[#5F6B7A]">
            <Link href="/" className="hover:text-[#1C99D6]">Home</Link>
            {parent && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/collections/${parent.slug}`} className="hover:text-[#1C99D6]">
                  {parent.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span>{(collection as CollectionRow).name}</span>
          </div>
          <h1 className="text-2xl font-medium text-[#0A2540]">
            {(collection as CollectionRow).name}
          </h1>
          {(collection as CollectionRow).description && (
            <p className="mt-2 text-[#5F6B7A]">
              {(collection as CollectionRow).description}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <p className="py-16 text-center text-[#5F6B7A]">
            No products in this collection yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const price = product.sale_price_zar ?? product.price_zar;
              const image = product.images?.[0];
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group rounded-xl border border-[#E5E7EB] bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-[#F5F5F5]">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.display_name || product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : null}
                    {product.is_sold_out && (
                      <Badge className="absolute left-2 top-2 bg-amber-100 text-amber-800">
                        On request
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#0A2540] line-clamp-2">
                    {product.display_name || product.name}
                  </p>
                  {product.brand && (
                    <p className="mt-0.5 text-xs text-[#5F6B7A]">{product.brand}</p>
                  )}
                  <p className="mt-1.5 text-sm font-semibold text-[#1C99D6]">
                    {product.is_enquiry_only ? "Price on request" : formatPrice(price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
