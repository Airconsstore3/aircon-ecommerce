import { NavbarWrapper } from "@/components/shop/NavbarWrapper";
import { FooterGate } from "@/components/shop/FooterGate";
import { PremiumFooter } from "@/components/premium-footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-layout bg-white">
      <NavbarWrapper />
      <main className="min-h-screen bg-white">
        {children}
      </main>
      <FooterGate>
        <PremiumFooter />
      </FooterGate>
    </div>
  );
}
