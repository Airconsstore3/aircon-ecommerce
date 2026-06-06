"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset request for:", email);
    setIsSubmitted(true);
  };

  return (
    <section className="min-h-screen bg-[#FAFAF9] flex items-center justify-center pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-sm p-8 bg-white border-0">
          <CardHeader className="items-center justify-center pb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#1E3A5F] tracking-tighter">
                Airconsstore
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <div className="space-y-6">
                {/* Back Link */}
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4 mr-1" />
                  Back to login
                </Link>

                {/* Lock Icon */}
                <div className="flex justify-center">
                  <Lock className="size-12 text-[#1E3A5F]" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Reset your password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we will send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#D85A30] hover:bg-[#c44e28] text-white rounded-lg"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-emerald-100 rounded-full p-4">
                    <CheckCircle className="size-12 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Check your email
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-[#1E3A5F] hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
