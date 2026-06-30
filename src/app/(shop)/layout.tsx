import { NavbarWrapper } from "@/components/shop/NavbarWrapper";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarWrapper />
      <main className="min-h-screen pt-[var(--secondary-nav-height)] md:pt-[5.25rem]">
        {children}
      </main>
    </>
  );
}
