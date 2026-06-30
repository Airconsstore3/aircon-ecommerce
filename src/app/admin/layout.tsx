import { type PropsWithChildren } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/heroes", label: "Heroes" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Google Sans Flex, sans-serif", backgroundColor: "#FFFFFF" }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="p-6 border-b border-slate-200">
            <Link href="/admin/dashboard" className="text-xl font-bold" style={{ color: "#0A2540" }}>
              Aircons Store Admin
            </Link>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-slate-100"
                          : "hover:bg-slate-50"
                      }`}
                      style={{
                        color: isActive ? "#1C99D6" : "#0A2540",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 ml-64">
          {/* Top bar */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div></div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm hover:underline"
                style={{ color: "#0A2540" }}
              >
                View Site
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: "#1C99D6" }}
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
