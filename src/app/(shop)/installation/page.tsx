import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Home,
  Building2,
  CheckCircle,
  Zap,
  Droplets,
  Wrench,
  Shield,
  Phone,
  ArrowRight,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function InstallationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="/Hero Images/hero summer winter.webp"
          alt="Installation background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
            Installation
          </h1>
          <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
            Licensed technicians, clean workmanship, fully certified installs across Cape Town
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-[24px]">
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <Link href="/checkout">Get a Quote</Link>
              </Button>
            </div>
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <a href="tel:+27000000000">Call Us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Types */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Residential */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#1C99D6]/10 p-3 rounded-lg">
                    <Home className="size-6 text-[#1C99D6]" />
                  </div>
                  <CardTitle className="text-xl text-[#1E3A5F]">
                    Residential
                  </CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Perfect for homes, apartments and townhouses
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Single split wall unit install</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Ceiling cassette installation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Portable unit setup</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Standard pipe run up to 3m included</span>
                  </li>
                </ul>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#1E3A5F]">
                    From R 1,800
                  </span>
                </div>
                <Button
                  className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                  asChild
                >
                  <Link href="/checkout">Get Quote</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Commercial */}
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-[#1C99D6]/10 p-3 rounded-lg">
                    <Building2 className="size-6 text-[#1C99D6]" />
                  </div>
                  <CardTitle className="text-xl text-[#1E3A5F]">
                    Commercial
                  </CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Offices, retail spaces, hotels and warehouses
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Ducted system installation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Multi-split systems</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">VRF/VRV systems</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Site survey included</span>
                  </li>
                </ul>
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">
                    Price on request — site survey required
                  </span>
                </div>
                <Button
                  className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                  asChild
                >
                  <Link href="/checkout">Request Survey</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Submit your enquiry
              </h3>
              <p className="text-sm text-muted-foreground">
                Fill out our online form with your requirements
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Free site survey
              </h3>
              <p className="text-sm text-muted-foreground">
                We visit your property to assess the installation needs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Fixed quote
              </h3>
              <p className="text-sm text-muted-foreground">
                You receive a detailed, no-obligation quote
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#1C99D6] text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                We install
              </h3>
              <p className="text-sm text-muted-foreground">
                Clean, fast, certified installation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is included */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            What is included in every install
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <Wrench className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  Professional mounting
                </p>
                <p className="text-xs text-muted-foreground">
                  Indoor + outdoor unit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <Package className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  Copper pipe connection
                </p>
                <p className="text-xs text-muted-foreground">
                  Up to 3m standard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <Zap className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  Electrical wiring
                </p>
                <p className="text-xs text-muted-foreground">
                  Isolator switch included
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <Droplets className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  Condensate drainage
                </p>
                <p className="text-xs text-muted-foreground">
                  Full setup included
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <CheckCircle className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  System test
                </p>
                <p className="text-xs text-muted-foreground">
                  Full commissioning
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#1C99D6]/10 p-2 rounded-lg">
                <Shield className="size-5 text-[#1C99D6]" />
              </div>
              <div>
                <p className="font-medium text-[#1E3A5F] text-sm">
                  Workmanship guarantee
                </p>
                <p className="text-xs text-muted-foreground">
                  1-year coverage
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing factors */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-normal text-[#1E3A5F] mb-8 text-center">
            What affects the installation price?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="rounded-xl shadow-sm border-0 p-6">
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Pipe run distance
              </h3>
              <p className="text-sm text-muted-foreground">
                Longer pipe runs require more materials and labor
              </p>
            </Card>
            <Card className="rounded-xl shadow-sm border-0 p-6">
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Wall or ceiling type
              </h3>
              <p className="text-sm text-muted-foreground">
                Concrete, brick, or drywall affects drilling complexity
              </p>
            </Card>
            <Card className="rounded-xl shadow-sm border-0 p-6">
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Number of storeys
              </h3>
              <p className="text-sm text-muted-foreground">
                Upper floor installations require additional equipment
              </p>
            </Card>
            <Card className="rounded-xl shadow-sm border-0 p-6">
              <h3 className="font-normal text-[#1E3A5F] mb-2">
                Access difficulty
              </h3>
              <p className="text-sm text-muted-foreground">
                Tight spaces or roof work increases complexity
              </p>
            </Card>
          </div>
          <div className="bg-[#FAFAF9] rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              This is why we do a free site survey before giving a final price
            </p>
          </div>
        </div>
      </section>

      {/* Installation kits */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
            Need an installation kit?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            If you have your own installer, we supply quality copper pipe kits and accessories
          </p>
          <Button
            variant="outline"
            className="rounded-lg"
            asChild
          >
            <Link href="/categories/kits">Browse Installation Kits</Link>
          </Button>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-[#1E3A5F]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-normal text-white mb-4">
            Ready to book your installation?
          </h2>
          <p className="text-gray-200 mb-8">
            Free site survey — no obligation quote within 24 hours
          </p>
          <Button
            className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
            asChild
          >
            <Link href="/checkout">Book Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
