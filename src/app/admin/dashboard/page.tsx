import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function AdminDashboard() {
  try {
    console.log("=== DASHBOARD START ===");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

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

    console.log("Dashboard stats loaded:", {
      totalProducts,
      lowStockProducts,
      activeDeals,
      activePromotions,
      totalCategories,
    });

  const stats = [
    {
      name: "Total Products",
      value: totalProducts || 0,
      color: "bg-blue-500",
    },
    {
      name: "Low Stock Items",
      value: lowStockProducts || 0,
      color: "bg-yellow-500",
    },
    {
      name: "Active Deals",
      value: activeDeals || 0,
      color: "bg-green-500",
    },
    {
      name: "Active Promotions",
      value: activePromotions || 0,
      color: "bg-purple-500",
    },
    {
      name: "Categories",
      value: totalCategories || 0,
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/products/new"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium">Add New Product</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Create a new product listing
              </div>
            </a>
            <a
              href="/admin/categories/new"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium">Add New Category</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Create a new product category
              </div>
            </a>
            <a
              href="/admin/deals/new"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="font-medium">Create New Deal</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Set up a promotional deal
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium">Database Connection</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Supabase
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium">Storage</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Product Images
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium">Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Supabase Auth
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
