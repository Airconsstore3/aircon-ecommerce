import { HeroSection } from "@/components/hero-section";
import { ShopBenefits } from "@/components/shop-benefits";
import { AirconsShowcase } from "@/components/AirconsShowcase";
import { ProductList9 } from "@/components/product-list9";
import { ServiceInfoSection } from "@/components/ServiceInfoSection";
import { Help2 } from "@/components/help2";
import { fetchFeaturedProducts, fetchResidentialHeroProducts } from "@/lib/fetch-featured-products";
import { buildWhatsAppHref, getContactChannels, primaryContactHref } from "@/lib/contact-settings";

export default async function HomePage() {
  const [products, residentialProducts, contact] = await Promise.all([
    fetchFeaturedProducts(),
    fetchResidentialHeroProducts(),
    getContactChannels(),
  ]);

  const whatsappHref = contact.whatsappDigits
    ? buildWhatsAppHref(contact.whatsappDigits, "Hi Aircons Store — I have a question.")
    : null;
  const contactHref = primaryContactHref(contact, "Hi Aircons Store — I have a question.");

  return (
    <div className="homepage-typography min-h-screen bg-white">
      <HeroSection residentialProducts={residentialProducts} />
      <ShopBenefits />
      <ProductList9 products={products} />
      <ServiceInfoSection />
      <AirconsShowcase />
      <Help2 contactHref={contactHref} whatsappHref={whatsappHref} />
    </div>
  );
}
