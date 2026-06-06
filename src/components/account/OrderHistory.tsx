"use client";

import { ArrowRight, Calendar, CheckCircle, CreditCard, MessageSquare, Package, Search, Star, Truck, Wrench } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type OrderStatus = "enquiry" | "confirmed" | "paid" | "scheduled" | "in_progress" | "completed";

interface OrderItem {
  name: string;
  image?: string;
  price: number;
  itemType: "unit" | "installation" | "kit" | "service";
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderType: "installation" | "delivery";
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  completionDate?: string;
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "ENQ-2025-00847",
    orderDate: "January 15, 2025",
    orderType: "installation",
    status: "in_progress",
    total: 8799.0,
    estimatedDelivery: "January 20-22, 2025",
    items: [
      {
        name: "Samsung 9000BTU Inverter Split Wall",
        image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/stylish-maroon-sneaker.png",
        price: 6999.0,
        itemType: "unit",
      },
      {
        name: "Standard Installation",
        price: 1800.0,
        itemType: "installation",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ENQ-2025-00831",
    orderDate: "January 8, 2025",
    orderType: "delivery",
    status: "scheduled",
    total: 8999.0,
    estimatedDelivery: "January 25-27, 2025",
    items: [
      {
        name: "LG 12000BTU Inverter Split",
        image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/clothes/bicolor-crewneck-sweatshirt-with-embroidered-logo.png",
        price: 8999.0,
        itemType: "unit",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ENQ-2024-00798",
    orderDate: "December 28, 2024",
    orderType: "installation",
    status: "completed",
    total: 2499.0,
    completionDate: "January 5, 2025",
    items: [
      {
        name: "Annual Maintenance Plan",
        price: 2499.0,
        itemType: "service",
      },
    ],
  },
];

const statusSteps: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "enquiry", label: "Enquiry", icon: MessageSquare },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "paid", label: "Paid", icon: CreditCard },
  { key: "scheduled", label: "Scheduled", icon: Calendar },
  { key: "in_progress", label: "In Progress", icon: Wrench },
  { key: "completed", label: "Completed", icon: Star },
];

const getStatusIndex = (status: OrderStatus) => {
  return statusSteps.findIndex((s) => s.key === status);
};

interface OrderHistoryProps {
  orders?: Order[];
  className?: string;
}

const OrderHistory = ({
  orders = DEFAULT_ORDERS,
  className,
}: OrderHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter((order) => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.items.some(
        (item) =>
          item.name.toLowerCase().includes(query),
      )
    );
  });

  return (
    <section className={cn("bg-muted pt-[220px] pb-12 md:pt-[180px] md:pb-24", className)}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-normal text-[#1E3A5F] md:text-4xl">
              Order History
            </h1>
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:w-64"
            />
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-16">
          {filteredOrders.map((order) => {
            const currentStatusIndex = getStatusIndex(order.status);

            return (
              <article key={order.id} className="group">
                {/* Order Card */}
                <div className="space-y-6 rounded-lg border-border bg-background p-7 shadow-lg">
                  {/* Order Header */}
                  <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        {order.orderType === "installation" ? (
                          <Wrench className="size-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Truck className="size-4 text-muted-foreground shrink-0" />
                        )}
                        <h2 className="text-base sm:text-lg font-normal tracking-wide">
                          {order.orderNumber}
                        </h2>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {order.orderType}
                      </Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {order.orderDate}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                  <div className="flex items-center gap-4">
                    {order.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="rounded-none bg-emerald-50 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700 uppercase dark:bg-emerald-950 dark:text-emerald-300"
                        >
                          Completed
                        </Badge>
                        {order.completionDate && (
                          <span className="text-xs text-muted-foreground">
                            {order.completionDate}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Link href={`/track/${order.orderNumber}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-none text-xs tracking-wide uppercase"
                        >
                          Track Order
                          <ArrowRight className="ml-2 size-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Status Timeline - Only show for non-completed */}
                {order.status !== "completed" && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-1 items-center min-w-[70px] md:min-w-0 shrink-0"
                          >
                            <div className="flex flex-col items-center w-full">
                              <div
                                className={cn(
                                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                                  isCompleted
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/30 text-muted-foreground/30",
                                  isCurrent && "ring-4 ring-primary/20",
                                )}
                              >
                                <StepIcon className="size-4" />
                              </div>
                              <span
                                className={cn(
                                  "mt-2 text-[10px] sm:text-xs font-medium tracking-wide whitespace-nowrap text-center",
                                  isCompleted
                                    ? "text-foreground"
                                    : "text-muted-foreground/50",
                                )}
                              >
                                {step.label}
                              </span>
                            </div>
                            {index < statusSteps.length - 1 && (
                              <div
                                className={cn(
                                  "mx-1 sm:mx-2 h-0.5 flex-1 min-w-[10px] sm:min-w-[20px]",
                                  index < currentStatusIndex
                                    ? "bg-primary"
                                    : "bg-muted-foreground/20",
                                )}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {order.estimatedDelivery && (
                      <p className="mt-4 text-center text-sm text-muted-foreground">
                        Estimated delivery:{" "}
                        <span className="font-medium text-foreground">
                          {order.estimatedDelivery}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="group/item">
                      {item.image ? (
                        <div className="relative mb-4 overflow-hidden bg-muted/50">
                          <AspectRatio ratio={4 / 5}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                            />
                          </AspectRatio>
                        </div>
                      ) : (
                        <div className="relative mb-4 overflow-hidden bg-muted/50">
                          <AspectRatio ratio={4 / 5}>
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <Package className="size-12" />
                            </div>
                          </AspectRatio>
                        </div>
                      )}

                      {/* Product Info */}
                      <div>
                        <Badge variant="secondary" className="mb-2 text-[10px] uppercase">
                          {item.itemType}
                        </Badge>
                        <h3 className="mt-1 text-sm font-normal">
                          {item.name}
                        </h3>
                        <div className="mt-2 text-xs font-medium text-foreground">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-6">
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-xs">
                    <Link href={`/account/orders/${order.orderNumber}`} className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                      View Details
                    </Link>
                    <button className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                      Invoice
                    </button>
                    {order.status === "completed" && (
                      <button className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                        Request Service
                      </button>
                    )}
                  </div>
                  {order.trackingNumber && order.status !== "completed" && (
                    <p className="text-xs text-muted-foreground">
                      Tracking:{" "}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-muted-foreground">
              No orders found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export { OrderHistory };
