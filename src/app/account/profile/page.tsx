"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("John Smith");
  const [email] = useState("john@example.com");
  const [phone, setPhone] = useState("082 123 4567");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "email" | "both">("both");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile update:", { fullName, phone, contactMethod });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully
          </div>
        )}

        {/* Profile Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-0 mb-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="rounded-lg bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>Preferred Contact Method</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="whatsapp"
                    checked={contactMethod === "whatsapp"}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="size-4"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={contactMethod === "email"}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="size-4"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="both"
                    checked={contactMethod === "both"}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="size-4"
                  />
                  <span className="text-sm">Both</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D85A30] hover:bg-[#c44e28] text-white rounded-lg"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Account Actions Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-0">
          <h2 className="text-lg font-semibold text-[#1E3A5F] mb-4">
            Account Actions
          </h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-lg justify-start"
              asChild
            >
              <Link href="/forgot-password">Change Password</Link>
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-lg justify-start"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
