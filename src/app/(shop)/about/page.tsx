import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageCircle, Mail, Wrench, Shield, Clock, MapPin, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#1E3A5F] text-white py-20 md:py-32">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cape Town's Trusted Aircon Specialists
            </h1>
            <div className="w-24 h-1 bg-[#D85A30] mb-6"></div>
            <p className="text-lg md:text-xl text-gray-200">
              Supplying, installing and maintaining aircon systems across Cape Town since 2015
            </p>
            <p className="text-sm text-gray-300 mt-2">
              Airconsstore
            </p>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="bg-white py-12 border-b">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-2">500+</div>
              <div className="text-muted-foreground">Installations completed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-2">10+</div>
              <div className="text-muted-foreground">Years in business</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-2">98%</div>
              <div className="text-muted-foreground">Customer satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Shield className="size-8 text-[#D85A30] mb-4" />
              <h3 className="font-semibold text-[#1E3A5F] mb-2">Licensed & Certified</h3>
              <p className="text-sm text-muted-foreground">Our technicians are fully licensed and certified</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Clock className="size-8 text-[#D85A30] mb-4" />
              <h3 className="font-semibold text-[#1E3A5F] mb-2">Same-Day Quotes</h3>
              <p className="text-sm text-muted-foreground">Get quick quotes within 24 hours</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Award className="size-8 text-[#D85A30] mb-4" />
              <h3 className="font-semibold text-[#1E3A5F] mb-2">Full Warranty</h3>
              <p className="text-sm text-muted-foreground">Complete parts & labour warranty on all work</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <MapPin className="size-8 text-[#D85A30] mb-4" />
              <h3 className="font-semibold text-[#1E3A5F] mb-2">Cape Town Based</h3>
              <p className="text-sm text-muted-foreground">Locally owned and operated</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8 text-center">
            What We Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Residential Aircon</h3>
                <p className="text-sm text-muted-foreground">Supply & installation for homes</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Commercial Systems</h3>
                <p className="text-sm text-muted-foreground">Office and business solutions</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Maintenance Plans</h3>
                <p className="text-sm text-muted-foreground">Annual service subscriptions</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Repair Services</h3>
                <p className="text-sm text-muted-foreground">Fast callout and repairs</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Extended Warranty</h3>
                <p className="text-sm text-muted-foreground">Protection plans for peace of mind</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="size-6 text-[#D85A30] shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#1E3A5F]">Gas Refills</h3>
                <p className="text-sm text-muted-foreground">Professional gas top-ups</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 bg-[#FAFAF9] border-y">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="size-5" />
              <span>PayFast Secured</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="size-5" />
              <span>SABS Approved</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wrench className="size-5" />
              <span>Licensed Technicians</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-5" />
              <span>Cape Town Based</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
              Get in Touch
            </h2>
            <p className="text-muted-foreground mb-8">
              Ready to discuss your aircon needs? Contact us today for a free quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">
                <MessageCircle className="mr-2 size-4" />
                WhatsApp Us
              </Button>
              <Button variant="outline" className="rounded-lg">
                <Mail className="mr-2 size-4" />
                Email Us
              </Button>
              <Button
                className="bg-[#D85A30] hover:bg-[#c44e28] text-white rounded-lg"
                asChild
              >
                <Link href="/enquire">Get a Free Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
