"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useActionState } from "react";
import Link from "next/link";

import { updatePassword } from "../actions";

export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const [state, formAction, isPending] = useActionState(updatePassword, {
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
            {hasSession ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Lock className="size-12 text-[#1E3A5F]" />
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Choose a new password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter and confirm your new password below
                  </p>
                </div>

                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat your new password"
                      required
                      minLength={8}
                      className="rounded-lg"
                    />
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
                    {isPending ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <Lock className="size-12 text-[#1E3A5F]" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Reset link expired
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please
                    request a new one.
                  </p>
                </div>

                <Link
                  href="/forgot-password"
                  className="inline-flex items-center text-sm text-[#1E3A5F] hover:underline font-medium"
                >
                  Request a new reset link
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
