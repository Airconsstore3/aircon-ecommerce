import { NavbarWrapper } from "@/components/shop/NavbarWrapper";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-layout">
      <NavbarWrapper />
      <main className="min-h-screen pt-[var(--secondary-nav-height)]">
        {children}
      </main>
    </div>
  );
}
