"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState, useState } from "react";
import Link from "next/link";

import { login } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(login, {
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
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-normal text-[#1E3A5F]">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to track your orders and manage your account
                </p>
              </div>

              <form action={formAction} className="space-y-4">
                <input type="hidden" name="next" value={next} />
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
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

                {state.error && (
                  <p className="text-sm text-red-600" role="alert">
                    {state.error}
                  </p>
                )}

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#1E3A5F] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                >
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Don&apos;t have an account yet?{" "}
                  <Link href="/signup" className="text-[#1E3A5F] hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
