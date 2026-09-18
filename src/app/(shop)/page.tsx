import { HeroSection } from "@/components/hero-section";
import { CategoryCarousel } from "@/components/category-carousel";
import { AccreditedBrands } from "@/components/accredited-brands";
import { AirconsShowcase } from "@/components/AirconsShowcase";
import { ProductList9 } from "@/components/product-list9";
import EditorialSection from "@/components/EditorialSection";
import { ServiceInfoSection } from "@/components/ServiceInfoSection";
import { CustomerReviewsCarousel } from "@/components/customer-reviews-carousel";
import { Help2 } from "@/components/help2";
import { PremiumFooter } from "@/components/premium-footer";
import { fetchFeaturedProducts } from "@/lib/fetch-featured-products";

export default async function HomePage() {
  const products = await fetchFeaturedProducts();

  return (
    <div className="homepage-typography min-h-screen bg-white">
      <HeroSection />
      <CategoryCarousel />
      <ServiceInfoSection />
      <AccreditedBrands />
      <AirconsShowcase />
      <ProductList9 products={products} />
      <EditorialSection />
      <CustomerReviewsCarousel />
      <Help2 />
      <PremiumFooter />
    </div>
  );
}
