"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";
import Link from "next/link";

import { signOut } from "@/app/(auth)/actions";
import { updateProfile } from "../actions";

interface ProfileFormProps {
  initialFullName: string;
  email: string;
  initialPhone: string;
  initialContactMethod: string;
}

export function ProfileForm({
  initialFullName,
  email,
  initialPhone,
  initialContactMethod,
}: ProfileFormProps) {
  const [contactMethod, setContactMethod] = useState(initialContactMethod);
  const [state, formAction, isPending] = useActionState(updateProfile, {
    error: null,
    success: false,
  });

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success Toast */}
        {state.success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully
          </div>
        )}

        {/* Profile Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-0 mb-6">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={initialFullName}
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
                name="phone"
                type="tel"
                defaultValue={initialPhone}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>Preferred Contact Method</Label>
              <input type="hidden" name="contactMethod" value={contactMethod} />
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethodRadio"
                    value="whatsapp"
                    checked={contactMethod === "whatsapp"}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="size-4"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethodRadio"
                    value="email"
                    checked={contactMethod === "email"}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="size-4"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethodRadio"
                    value="both"
                    checked={contactMethod === "both"}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="size-4"
                  />
                  <span className="text-sm">Both</span>
                </label>
              </div>
            </div>

            {state.error && (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Account Actions Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-0">
          <h2 className="text-lg font-normal text-[#1E3A5F] mb-4">
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
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
