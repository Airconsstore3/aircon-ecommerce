"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Upload, Clock, Zap } from "lucide-react";
import { useState } from "react";

export default function RepairsPage() {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    fault: "",
    urgency: "standard",
    preferredDate: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `REP-2025-${Math.floor(Math.random() * 9000) + 1000}`;
    setRefNumber(ref);
    setIsSubmitted(true);
    console.log("Repair request:", { ...formData, ref });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[450px] flex items-center overflow-hidden">
          {/* Background image */}
          <img
            src="/Hero Images/hero summer winter.webp"
            alt="Repairs background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content */}
          <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
            <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
              Repairs
            </h1>
            <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
              Professional repair services for all aircon brands
            </p>
          </div>
        </section>
        <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
          <div className="container max-w-2xl mx-auto">
            <Card className="rounded-xl shadow-sm p-8 border-0 text-center">
              <CheckCircle className="size-16 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-2xl font-normal text-[#1E3A5F] mb-2">
                Repair Request Submitted
              </h1>
              <p className="text-muted-foreground mb-4">
                Your reference number is:
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-xl font-mono font-semibold text-[#1E3A5F]">
                  {refNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
              We'll contact you shortly to confirm your appointment.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="rounded-lg"
            >
              Submit Another Request
            </Button>
          </Card>
        </div>
      </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src="/Hero Images/hero summer winter.webp"
          alt="Repairs background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-[16px] sm:px-[24px] lg:px-[32px]">
          <h1 className="font-[var(--font-google-sans-flex)] text-[48px] md:text-[64px] lg:text-[72px] font-normal tracking-tight leading-tight text-white mt-[60px] mb-[24px]">
            Repairs
          </h1>
          <p className="font-[var(--font-google-sans-flex)] text-[16px] md:text-[18px] font-normal leading-relaxed text-white/90 max-w-[600px] mb-[32px]">
            Professional repair services for all aircon brands
          </p>
        </div>
      </section>
      <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">
              Book a Repair or Callout
            </h1>
            <p className="text-muted-foreground">
              Fast response across Cape Town Metro
            </p>
          </div>

        {/* Service Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="size-5 text-[#1C99D6]" />
                <CardTitle className="text-lg">Emergency Callout</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Same-day service, premium rate
              </p>
            </CardHeader>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-5 text-[#1E3A5F]" />
                <CardTitle className="text-lg">Standard Callout</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Next business day, standard rate
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Form */}
        <Card className="rounded-xl shadow-sm p-6 border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Unit Brand</Label>
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select brand</option>
                  <option value="samsung">Samsung</option>
                  <option value="lg">LG</option>
                  <option value="midea">Midea</option>
                  <option value="daikin">Daikin</option>
                  <option value="gree">Gree</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Unit Model</Label>
                <Input
                  id="model"
                  type="text"
                  placeholder="e.g. AR12TXFYAWKNEU"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fault">Fault Description *</Label>
              <Textarea
                id="fault"
                placeholder="Describe the issue with your aircon unit..."
                value={formData.fault}
                onChange={(e) => setFormData({ ...formData, fault: e.target.value })}
                required
                rows={4}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>Urgency</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value="emergency"
                    checked={formData.urgency === "emergency"}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="size-4"
                  />
                  <span className="text-sm">Emergency (same-day)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value="standard"
                    checked={formData.urgency === "standard"}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="size-4"
                  />
                  <span className="text-sm">Standard (next-day)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="082 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo Upload (Optional)</Label>
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-[#1C99D6] transition-colors cursor-pointer">
                <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
            >
              Submit Repair Request
            </Button>
          </form>
        </Card>
      </div>
    </section>
    </div>
  );
}
