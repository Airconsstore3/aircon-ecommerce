import { mockDeals, mockProducts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, ShoppingBag, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/shop/CartProvider";
import { toast } from "sonner";

export default async function DealDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = mockDeals.find((d) => d.slug === slug);

  if (!deal) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Deal not found.</p>
          <p className="text-xs text-muted-foreground">Looking for slug: {slug}</p>
          <Link href="/deals" className="inline-block mt-4 text-[#1C99D6] hover:underline">
            View all deals
          </Link>
        </div>
      </div>
    );
  }

  // Find linked product if exists
  const linkedProduct = deal.product_id
    ? mockProducts.find((p) => p.id === deal.product_id)
    : null;

  const productSlug = linkedProduct?.slug;
  const productHref = productSlug ? `/products/${productSlug}` : null;

  // Calculate percentage saved
  const percentSaved = Math.round(
    ((deal.original_price_zar - deal.sale_price_zar) / deal.original_price_zar) * 100
  );

  // Check if deal is expired
  const isExpired = new Date(deal.ends_at) < new Date();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="min-h-screen bg-[#F0F9FF] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/deals" className="text-[#1C99D6] hover:underline">
            Deals
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-muted-foreground">{deal.name}</span>
        </div>

        {/* Deal Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge className="mb-2 bg-[#1C99D6]">{deal.deal_type}</Badge>
              {deal.is_hero && (
                <Badge variant="outline" className="ml-2 border-[#1C99D6] text-[#1C99D6]">
                  Featured
                </Badge>
              )}
              <h1 className="text-3xl font-normal text-[#0A2540] mt-2 font-[var(--font-google-sans-flex)]">{deal.name}</h1>
            </div>
            {!isExpired && (
              <div className="flex items-center gap-2 text-[#1C99D6] font-medium">
                <Clock className="w-4 h-4" />
                <span>
                  Ends: {new Date(deal.ends_at).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {isExpired && (
            <div className="flex items-center gap-2 text-red-500 font-medium mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>This deal has expired</span>
            </div>
          )}

          <p className="text-muted-foreground">{deal.description}</p>
        </div>

        {/* Deal Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            {deal.images.length > 0 ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <Image
                  src={deal.images[0]}
                  alt={deal.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Price */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-[#1C99D6]">
                    {formatPrice(deal.sale_price_zar)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(deal.original_price_zar)}
                  </span>
                  <Badge className="bg-green-600">Save {percentSaved}%</Badge>
                </div>

                {deal.stock_remaining > 0 && deal.stock_remaining <= 5 && (
                  <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Only {deal.stock_remaining} left</span>
                  </div>
                )}

                {deal.stock_remaining === 0 && (
                  <div className="flex items-center gap-2 text-red-500 font-medium text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Sold Out</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            {deal.includes && deal.includes.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-normal text-[#0A2540] mb-4 font-[var(--font-google-sans-flex)]">What's Included</h3>
                  <ul className="space-y-2">
                    {deal.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Linked Product */}
            {linkedProduct && productHref && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-normal text-[#0A2540] mb-4 font-[var(--font-google-sans-flex)]">Related Product</h3>
                  <Link
                    href={productHref}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#0A2540]/20 hover:border-[#1C99D6] transition-colors"
                  >
                    {linkedProduct.images.length > 0 && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={linkedProduct.images[0]}
                          alt={linkedProduct.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0A2540] text-sm truncate font-[var(--font-google-sans-flex)]">
                        {linkedProduct.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {linkedProduct.brand}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {!isExpired && deal.stock_remaining > 0 && (
                <DealAddToCartButton deal={deal} />
              )}
              {productHref && (
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href={productHref}>View Product Details</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Client component for cart interaction
function DealAddToCartButton({ deal }: { deal: typeof mockDeals[0] }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: deal.id,
      name: deal.name,
      slug: deal.slug,
      price_zar: deal.original_price_zar,
      sale_price_zar: deal.sale_price_zar,
      images: deal.images,
      type: deal.deal_type,
      is_enquiry_only: false,
    });
    toast.success(`${deal.name} added to cart`);
  };

  return (
    <Button
      className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white"
      onClick={handleAddToCart}
    >
      <ShoppingBag className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  );
}
