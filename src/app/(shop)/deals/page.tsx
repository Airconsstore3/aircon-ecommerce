"use client";

import { useState } from "react";
import { DealCard } from "@/components/shop/ProductCard";
import { mockDeals } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";

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

  // Get hero deal
  const heroDeal = mockDeals.find(deal => deal.is_hero);

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
      
      {/* Hero Promo Banner */}
      {heroDeal && (
        <div className="bg-gradient-to-r from-[#1C99D6] to-[#1E3A5F] text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Winter Special</h1>
                  <p className="text-sm opacity-90">{heroDeal.name} - Limited Time Offer</p>
                </div>
              </div>
              <Button
                asChild
                className="bg-white text-[#1C99D6] hover:bg-gray-100 rounded-full font-semibold"
              >
                <a href={`/enquire?deal=${heroDeal.id}`}>Get This Deal</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Aircon Specials & Deals</h1>
          <p className="text-muted-foreground">
            Limited-time offers on residential and commercial air conditioning solutions in Cape Town
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
          {(['all', 'residential', 'commercial', 'bundle', 'clearance'] as DealFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No deals available for this category.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setActiveFilter('all')}
            >
              View All Deals
            </Button>
          </div>
        )}

        {/* Email Capture for Deal Alerts */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 border">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-[#1C99D6] p-3 rounded-full">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-2">Get Deal Alerts</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to know about new aircon specials and exclusive offers. Sign up for our deal alerts.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="bg-[#1C99D6] hover:bg-[#1680b0] rounded-full">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
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
