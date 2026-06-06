import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-[#1E3A5F] mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-2">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-[#D85A30] hover:bg-[#c44e28] text-white rounded-lg"
            asChild
          >
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            asChild
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
