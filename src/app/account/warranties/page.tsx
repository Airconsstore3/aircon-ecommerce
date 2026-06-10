"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import Link from "next/link";

interface Warranty {
  id: string;
  product: string;
  plan: string;
  purchased: string;
  expires: string;
  status: "active" | "expired";
  certificate_url: string;
}

const MOCK_WARRANTIES: Warranty[] = [
  {
    id: "1",
    product: "Samsung 9000BTU Inverter Split",
    plan: "2-Year Extended Warranty",
    purchased: "15 Jan 2025",
    expires: "15 Jan 2027",
    status: "active",
    certificate_url: "#",
  },
  {
    id: "2",
    product: "LG 12000BTU Dual Inverter",
    plan: "1-Year Extended Warranty",
    purchased: "3 Mar 2024",
    expires: "3 Mar 2025",
    status: "expired",
    certificate_url: "#",
  },
];

const getDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function WarrantiesPage() {
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">
            My Warranties
          </h1>
          <p className="text-muted-foreground">
            Manage your extended warranty plans and log claims
          </p>
        </div>

        {/* Warranties List */}
        {MOCK_WARRANTIES.length > 0 ? (
          <div className="space-y-4">
            {MOCK_WARRANTIES.map((warranty) => {
              const daysRemaining = getDaysRemaining(warranty.expires);
              const isExpiringSoon = daysRemaining > 0 && daysRemaining < 60;

              return (
                <div
                  key={warranty.id}
                  className="bg-white rounded-xl shadow-sm p-6 border-0"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-normal text-[#1E3A5F]">
                          {warranty.product}
                        </h3>
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs uppercase"
                        >
                          {warranty.plan}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge
                          variant={
                            warranty.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            warranty.status === "active"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-slate-200 text-slate-600"
                          }
                        >
                          {warranty.status === "active" ? "Active" : "Expired"}
                        </Badge>
                        <span className="text-muted-foreground">
                          Purchased: {warranty.purchased}
                        </span>
                        <span className="text-muted-foreground">
                          Expires: {warranty.expires}
                        </span>
                      </div>

                      {warranty.status === "active" && (
                        <div className="text-sm">
                          <span
                            className={
                              isExpiringSoon
                                ? "text-amber-600 font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            {daysRemaining > 0
                              ? `${daysRemaining} days remaining`
                              : "Expires today"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        asChild
                      >
                        <Link href={warranty.certificate_url}>
                          Download Certificate
                        </Link>
                      </Button>
                      {warranty.status === "active" && (
                        <Button
                          className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
                        >
                          Log a Claim
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 border-0 text-center">
            <Shield className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
              No warranties found
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any active warranty plans yet.
            </p>
            <Button
              variant="outline"
              className="rounded-lg"
              asChild
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
