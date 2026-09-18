"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useActionState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";

import { requestPasswordReset } from "@/app/(auth)/actions";

// location.search + location.hash via useSyncExternalStore — reads URL
// params and the #error fragment client-side without setState-in-effect
// or hydration mismatch (server snapshot is empty).
function useLocationParts() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      window.addEventListener("popstate", onChange);
      return () => {
        window.removeEventListener("hashchange", onChange);
        window.removeEventListener("popstate", onChange);
      };
    },
    () => `${window.location.search}${window.location.hash.replace(/^#/, "?")}`,
    () => "",
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  otp_expired:
    "This link has expired or was already used. Reset links are single-use — request a new one below.",
  access_denied: "This link is invalid or has expired. Please request a new one.",
  auth_callback_failed:
    "We couldn't verify that link. It may have expired — request a new one below.",
};

export default function AuthErrorPage() {
  const locationParts = useLocationParts();
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {
    error: null,
    success: false,
  });

  const { code, description } = useMemo(() => {
    const params = new URLSearchParams(locationParts);
    return {
      code: params.get("error_code") || params.get("error") || "",
      description: params.get("error_description") || "",
    };
  }, [locationParts]);

  const message =
    ERROR_MESSAGES[code] ||
    description ||
    "Something went wrong with that link. Please request a new one.";

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
            {!state.success ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-amber-100 rounded-full p-4">
                    <AlertTriangle className="size-12 text-amber-600" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal text-[#1E3A5F]">
                    Link expired or invalid
                  </h1>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>

                <form action={formAction} className="space-y-4">
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
                    {isPending ? "Sending..." : "Send a New Reset Link"}
                  </Button>
                </form>

                <Link
                  href="/login"
                  className="inline-flex w-full justify-center text-sm text-[#1E3A5F] hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            ) : (
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
                    If an account exists for that address, we sent a new reset
                    link to it.
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
