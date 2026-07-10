"use client";

import { useState } from "react";
import { DealCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ChevronRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type DealFilter = 'all' | 'residential' | 'commercial' | 'bundle' | 'clearance';

interface DealsClientProps {
  deals: any[];
}

// ─── Deals Page Component ───────────────────────────────────────────────────────

export default function DealsClient({ deals }: DealsClientProps) {
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all');
  const [email, setEmail] = useState('');

  // Filter deals
  const filteredDeals = deals.filter((deal: any) => {
    if (activeFilter === 'all') return true;
    return deal.deal_type === activeFilter;
  });

  // Handle email subscription
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Integrate with Resend for deal alerts
      console.log('Email submitted for deal alerts:', email);
      setEmail('');
      alert('Thank you! You\'ll receive deal alerts soon.');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="/Hero Images/hero summer winter.webp"
          alt="Deals background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
            Sale
          </h1>
          <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
            Taking care of your comfort is essential for a healthy home and office environment. A consistent air conditioning routine that includes cooling, heating, and maintenance.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-[24px]">
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <a href="#deals-grid">Shop Now</a>
              </Button>
            </div>
            <div className="aircon-angled-button-wrap">
              <Button
                asChild
                variant="ghost"
                className="aircon-angled-button h-auto rounded-none hover:bg-transparent"
              >
                <a href="/checkout">Get a Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[32px]">
        
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="text-[30px] font-bold text-[#1E3A5F] mb-[8px] leading-tight">Aircon Specials & Deals</h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Limited-time offers on residential and commercial air conditioning solutions in Cape Town
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-[8px] mb-[32px] border-b pb-[16px]">
          {(['all', 'residential', 'commercial', 'bundle', 'clearance'] as DealFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-[16px] py-[8px] rounded-full text-[14px] font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#1C99D6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Deals Grid */}
        <div id="deals-grid">
        {filteredDeals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {filteredDeals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} productSlug={deal.productSlug} />
              ))}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 mt-8">
              <Button variant="ghost" size="icon" disabled className="rounded-lg w-10 h-10">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <Button variant="default" size="icon" className="rounded-lg w-10 h-10 bg-[#1C99D6] hover:bg-[#1680b0] text-base font-medium">
                1
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                2
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                3
              </Button>
              <span className="text-muted-foreground text-lg px-2">...</span>
              <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10 text-base font-medium hover:bg-gray-100">
                10
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg w-10 h-10">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-[48px]">
            <p className="text-[14px] text-muted-foreground">No deals available for this category.</p>
            <Button
              variant="outline"
              className="mt-[16px]"
              onClick={() => setActiveFilter('all')}
            >
              View All Deals
            </Button>
          </div>
        )}
        </div>

        {/* Email Capture for Deal Alerts */}
        <div className="mt-[64px] bg-gray-50 rounded-[16px] p-[32px] border">
          <div className="max-w-[512px] mx-auto text-center">
            <div className="flex justify-center mb-[16px]">
              <div className="bg-[#1C99D6] p-[12px] rounded-full">
                <Mail className="w-[24px] h-[24px] text-white" />
              </div>
            </div>
            <h2 className="text-[24px] font-bold text-[#1E3A5F] mb-[8px] leading-tight">Get Deal Alerts</h2>
            <p className="text-[14px] text-muted-foreground mb-[24px] leading-relaxed">
              Be the first to know about new aircon specials and exclusive offers. Sign up for our deal alerts.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-[8px] max-w-[400px] mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-[40px]"
              />
              <Button type="submit" className="bg-[#1C99D6] hover:bg-[#1680b0] rounded-full px-[24px] h-[40px]">
                Subscribe
              </Button>
            </form>
            <p className="text-[12px] text-muted-foreground mt-[12px]">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
