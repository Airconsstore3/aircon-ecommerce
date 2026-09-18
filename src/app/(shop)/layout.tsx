import { NavbarWrapper } from "@/components/shop/NavbarWrapper";

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
    </div>
  );
}
