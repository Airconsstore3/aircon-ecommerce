"use client";

import { ArrowRight, Check, Package, Search, Truck } from "lucide-react";
import { useState } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered";

interface OrderItem {
  name: string;
  designer: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "SB-2025-00847",
    orderDate: "January 15, 2025",
    status: "shipped",
    total: 2450.0,
    trackingNumber: "1Z999AA10123456784",
    estimatedDelivery: "January 20-22, 2025",
    items: [
      {
        name: "Sculptural Leather Armchair",
        designer: "ATELIER COLLECTION",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Leather-Sofa-1.png",
        price: 1890.0,
        color: "Cognac",
      },
      {
        name: "Hand-Blown Glass Pendant",
        designer: "LUMIÈRE STUDIO",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Artistic-Lamp-1.png",
        price: 560.0,
        color: "Amber",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "SB-2025-00831",
    orderDate: "January 8, 2025",
    status: "delivered",
    total: 3200.0,
    items: [
      {
        name: "Walnut Console Table",
        designer: "NORDIC CRAFT",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Minimalist-Wooden-Sideboard-1.png",
        price: 2400.0,
        size: '160cm x 40cm x 85cm"',
      },
      {
        name: "Ceramic Sculptural Vase",
        designer: "ARTISAN COLLECTIVE",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Artistic-Lamp-2.png",
        price: 420.0,
        color: "Matte White",
      },
      {
        name: "Linen Throw Blanket",
        designer: "MAISON TEXTILE",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Minimalist-Loveseat-1.png",
        price: 380.0,
        color: "Natural",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "SB-2024-00798",
    orderDate: "December 28, 2024",
    status: "delivered",
    total: 1650.0,
    items: [
      {
        name: "Minimalist Floor Lamp",
        designer: "LIGHT & FORM",
        image:
          "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/furniture/Modern-Wooden-Cabinet-1.png",
        price: 1650.0,
        color: "Brushed Brass",
      },
    ],
  },
];

const statusSteps: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
];

const getStatusIndex = (status: OrderStatus) => {
  return statusSteps.findIndex((s) => s.key === status);
};

interface OrderHistory4Props {
  orders?: Order[];
  className?: string;
}

const OrderHistory4 = ({
  orders = DEFAULT_ORDERS,
  className,
}: OrderHistory4Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
          item.name.toLowerCase().includes(query) ||
          item.designer.toLowerCase().includes(query),
      )
    );
  });

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-tight md:text-4xl">
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
                {/* Order Header */}
                <div className="mb-8 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                    <h2 className="text-lg font-medium tracking-wide">
                      {order.orderNumber}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {order.orderDate}
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {order.status === "delivered" ? (
                      <Badge
                        variant="secondary"
                        className="rounded-none bg-emerald-50 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700 uppercase dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        Delivered
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-none text-xs tracking-wide uppercase"
                      >
                        Track Order
                        <ArrowRight className="ml-2 size-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Timeline - Only show for non-delivered */}
                {order.status !== "delivered" && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-1 items-center"
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
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
                                  "mt-2 text-xs font-medium tracking-wide",
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
                                  "mx-2 h-0.5 flex-1",
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
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="group/item">
                      {/* Large Product Image */}
                      <div className="relative mb-4 overflow-hidden bg-muted/50">
                        <AspectRatio ratio={4 / 5}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="size-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                          />
                        </AspectRatio>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 bottom-4 h-9 rounded-none bg-background/90 text-xs tracking-wide uppercase opacity-0 backdrop-blur-sm transition-opacity group-hover/item:opacity-100"
                        >
                          Buy Again
                        </Button>
                      </div>

                      {/* Product Info */}
                      <div>
                        <p className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase">
                          {item.designer}
                        </p>
                        <h3 className="mt-1 text-sm font-medium">
                          {item.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          {item.color && <span>{item.color}</span>}
                          {item.size && <span>{item.size}</span>}
                          <Separator orientation="vertical" className="h-3" />
                          <span className="font-medium text-foreground">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                  <div className="flex gap-6 text-xs">
                    <button className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                      View Details
                    </button>
                    <button className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                      Invoice
                    </button>
                    {order.status === "delivered" && (
                      <button className="font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground">
                        Return Items
                      </button>
                    )}
                  </div>
                  {order.trackingNumber && order.status !== "delivered" && (
                    <p className="text-xs text-muted-foreground">
                      Tracking:{" "}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
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

export { OrderHistory4 };
