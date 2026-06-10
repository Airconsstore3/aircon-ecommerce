"use client";

import { useState } from "react";
import { DealCard } from "@/components/shop/ProductCard";
import { mockDeals } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

export const dynamic = 'force-dynamic';

// ─── Types ───────────────────────────────────────────────────────────────────

type DealFilter = 'all' | 'residential' | 'commercial' | 'bundle' | 'clearance';

// ─── Deals Page Component ───────────────────────────────────────────────────────

function DealsPageContent() {
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all');
  const [email, setEmail] = useState('');

  // Filter deals
  const filteredDeals = mockDeals.filter(deal => {
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
      <div className="bg-[#FAFAF9] py-[80px] px-[16px]">
        <div className="max-w-[1280px] mx-auto text-center">
          <h1 className="text-[48px] md:text-[64px] font-bold text-[#1E3A5F] uppercase tracking-[2px] leading-tight mb-[24px]">
            Latest Deals
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#94A3B8] max-w-[600px] mx-auto leading-relaxed mb-[32px]">
            Taking care of your comfort is essential for a healthy home and office environment. A consistent air conditioning routine that includes cooling, heating, and maintenance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[16px]">
            <Button
              asChild
              className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-full font-semibold px-[32px] py-[12px] text-[14px]"
            >
              <a href="#deals-grid">Shop Now</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-[#1C99D6] text-[#1C99D6] hover:bg-[#1C99D6] hover:text-white rounded-full font-semibold px-[32px] py-[12px] text-[14px]"
            >
              <a href="/enquire">Get a Quote</a>
            </Button>
          </div>
        </div>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
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

export default function DealsPage() {
  return <DealsPageContent />;
}
