import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

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
      <body className={`${inter.className} ${googleSansFlex.variable} ${poppins.variable}`}>
        <CartProvider>
          <main className="min-h-screen">{children}</main>
        </CartProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
