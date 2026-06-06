import { HeroSection } from "@/components/hero-section";
import { LogoCarousel } from "@/components/logo-carousel";
import { AirconCategories } from "@/components/product-categories2";
import { ProductList9 } from "@/components/product-list9";
import { ProductList6 } from "@/components/product-list6";
import { ProductCategories5 } from "@/components/product-categories5";
import { Help2 } from "@/components/help2";
import { EcommerceFooter20 } from "@/components/ecommerce-footer20";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <LogoCarousel />
      <AirconCategories />
      <ProductList9 />
      <ProductList6 />
      <ProductCategories5 />
      <Help2 />
      <EcommerceFooter20 />
    </div>
  );
}
