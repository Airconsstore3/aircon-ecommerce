"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

interface Subscription {
  id: string;
  plan: string;
  price: number;
  interval: "yearly" | "monthly";
  next_billing: string | null;
  status: "active" | "cancelled" | "billing_failed";
  next_service: string | null;
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    plan: "Annual Maintenance Plan",
    price: 1200,
    interval: "yearly",
    next_billing: "15 Jan 2026",
    status: "active",
    next_service: "15 Jul 2025",
  },
  {
    id: "2",
    plan: "Bi-Annual Care Plan",
    price: 2000,
    interval: "yearly",
    next_billing: null,
    status: "cancelled",
    next_service: null,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function SubscriptionsPage() {
  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
            My Subscriptions
          </h1>
          <p className="text-muted-foreground">
            Manage your maintenance plan subscriptions
          </p>
        </div>

        {/* Subscriptions List */}
        {MOCK_SUBSCRIPTIONS.length > 0 ? (
          <div className="space-y-4">
            {MOCK_SUBSCRIPTIONS.map((subscription) => (
              <div
                key={subscription.id}
                className="bg-white rounded-xl shadow-sm p-6 border-0"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1E3A5F]">
                        {subscription.plan}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(subscription.price)}/{subscription.interval}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={
                          subscription.status === "active"
                            ? "default"
                            : subscription.status === "cancelled"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          subscription.status === "active"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : subscription.status === "cancelled"
                            ? "bg-slate-200 text-slate-600"
                            : ""
                        }
                      >
                        {subscription.status === "active"
                          ? "Active"
                          : subscription.status === "cancelled"
                          ? "Cancelled"
                          : "Billing Failed"}
                      </Badge>
                      {subscription.next_billing && (
                        <span className="text-sm text-muted-foreground">
                          Next billing: {subscription.next_billing}
                        </span>
                      )}
                      {subscription.next_service && (
                        <span className="text-sm text-muted-foreground">
                          Next service: {subscription.next_service}
                        </span>
                      )}
                    </div>

                    {subscription.status === "active" && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#1E3A5F]">
                          What is included:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            Filter clean
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            Gas check
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            Full inspection
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            Performance report
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {subscription.status === "active" && (
                      <Button
                        variant="destructive"
                        className="rounded-lg"
                      >
                        Cancel Plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 border-0 text-center">
            <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">
              No active subscriptions
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any active maintenance plan subscriptions.
            </p>
            <Button
              variant="outline"
              className="rounded-lg"
              asChild
            >
              <Link href="/maintenance">View Maintenance Plans</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
