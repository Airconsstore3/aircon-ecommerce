"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="size-16 text-[#1C99D6] mx-auto mb-4" />
        <h1 className="text-2xl font-normal text-[#1E3A5F] mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          If the problem persists, please contact us via WhatsApp
        </p>
      </div>
    </div>
  );
}
