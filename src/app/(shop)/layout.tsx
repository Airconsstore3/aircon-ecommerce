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
      {/* The root layout already renders the page's main landmark —
          a second nested main would violate landmark rules. */}
      <div className="min-h-screen bg-white">
        {children}
      </div>
      <FooterGate>
        <PremiumFooter />
      </FooterGate>
    </div>
  );
}
