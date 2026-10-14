"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { useActionState, useState } from "react";
import Link from "next/link";

import { signup } from "../actions";

export function SignupForm({ next }: { next: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signup, {
    error: null,
    success: false,
  });

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
            {state.alreadyRegistered ? (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-amber-100 rounded-full p-4">
                    <CheckCircle className="size-12 text-amber-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Account already exists
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    You already have an account with this email — sign in or
                    reset your password.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center text-sm text-[#1E3A5F] hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center text-sm text-[#1E3A5F] hover:underline font-medium"
                  >
                    Reset your password
                  </Link>
                </div>
              </div>
            ) : state.needsConfirmation ? (
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
                    We sent you a confirmation link. Click it to activate your
                    account, then sign in.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-[#1E3A5F] hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Create your account
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Get order tracking, warranty management and more
                  </p>
                </div>

                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="next" value={next} />
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="082 123 4567"
                      required
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        className="rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1C99D6]"
                      >
                        {showPassword ? (
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.9 0 1.78-.08 2.62-.22"/>
                            <line x1="2" x2="22" y1="2" y2="22"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        minLength={8}
                        className="rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        aria-pressed={showConfirmPassword}
                        className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1C99D6]"
                      >
                        {showConfirmPassword ? (
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        ) : (
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.9 0 1.78-.08 2.62-.22"/>
                            <line x1="2" x2="22" y1="2" y2="22"/>
                          </svg>
                        )}
                      </button>
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
                    {isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#1E3A5F] hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  <p>
                    By creating an account you agree to our{" "}
                    <Link href="/privacy" className="text-[#1E3A5F] hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
