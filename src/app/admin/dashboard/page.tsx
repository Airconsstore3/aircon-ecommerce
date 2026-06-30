import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  try {
    const [
      { count: totalProducts },
      { count: lowStockProducts },
      { count: activeDeals },
      { count: activePromotions },
      { count: totalCategories },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lte("stock_count", 3),
      supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .gt("ends_at", new Date().toISOString()),
      supabase
        .from("promotions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("categories").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      name: "Total Products",
      value: totalProducts || 0,
      color: "#1C99D6",
    },
    {
      name: "Low Stock Items",
      value: lowStockProducts || 0,
      color: "#F59E0B",
    },
    {
      name: "Active Deals",
      value: activeDeals || 0,
      color: "#22C55E",
    },
    {
      name: "Active Promotions",
      value: activePromotions || 0,
      color: "#8B5CF6",
    },
    {
      name: "Categories",
      value: totalCategories || 0,
      color: "#EC4899",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: "#0A2540" }}>
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <CardContent className="p-6" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#0A2540" }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: stat.color, opacity: 0.2 }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <CardHeader>
            <CardTitle style={{ color: "#0A2540" }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent style={{ backgroundColor: "#FFFFFF" }}>
            <div className="space-y-3">
              <Link
                href="/admin/products/new"
                className="block p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <div className="font-medium" style={{ color: "#0A2540" }}>
                  Add New Product
                </div>
                <div className="text-sm" style={{ color: "#64748B" }}>
                  Create a new product listing
                </div>
              </Link>
              <Link
                href="/admin/categories/new"
                className="block p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <div className="font-medium" style={{ color: "#0A2540" }}>
                  Add New Category
                </div>
                <div className="text-sm" style={{ color: "#64748B" }}>
                  Create a new product category
                </div>
              </Link>
              <Link
                href="/admin/deals/new"
                className="block p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <div className="font-medium" style={{ color: "#0A2540" }}>
                  Create New Deal
                </div>
                <div className="text-sm" style={{ color: "#64748B" }}>
                  Set up a promotional deal
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <CardHeader>
            <CardTitle style={{ color: "#0A2540" }}>System Status</CardTitle>
          </CardHeader>
          <CardContent style={{ backgroundColor: "#FFFFFF" }}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200" style={{ backgroundColor: "#FFFFFF" }}>
                <div>
                  <div className="font-medium" style={{ color: "#0A2540" }}>
                    Database Connection
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    Supabase
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200" style={{ backgroundColor: "#FFFFFF" }}>
                <div>
                  <div className="font-medium" style={{ color: "#0A2540" }}>
                    Storage
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    Product Images
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200" style={{ backgroundColor: "#FFFFFF" }}>
                <div>
                  <div className="font-medium" style={{ color: "#0A2540" }}>
                    Authentication
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    Supabase Auth
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#0A2540" }}>
          Dashboard Overview
        </h1>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium" style={{ color: "#DC2626" }}>
              Error loading dashboard
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
