import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { NavbarWrapper } from "@/components/shop/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

const googleSansFlex = localFont({
  src: "../../Google_Sans_Flex/GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf",
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoolAir - Cape Town Air Conditioning Specialists",
  description: "Residential and commercial air conditioning solutions in Cape Town. Sales, installation, maintenance, and repairs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${googleSansFlex.variable}`}>
        <CartProvider>
          <NavbarWrapper />
          <main className="min-h-screen pt-[var(--secondary-nav-height)] md:pt-[5.25rem]">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
