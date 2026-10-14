import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const googleSansFlex = localFont({
  src: "../../fonts/GoogleSansFlex-Variable.woff2",
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aircons Store — Air Conditioning Sales, Installation & Repairs",
  description: "Residential and commercial air conditioning solutions across South Africa. Sales, accredited installation, maintenance, and repairs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${googleSansFlex.variable} bg-white`}>
        <CartProvider>
          <div id="scroll-root">
            <main className="min-h-full bg-white">{children}</main>
          </div>
          <CartDrawer />
        </CartProvider>
        <ScrollToTop />
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
        )}
        <CookieConsentBanner />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
