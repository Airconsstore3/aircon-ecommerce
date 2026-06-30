import { type PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                Aircons Store Admin
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </a>
              <a href="/admin/products" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Products
              </a>
              <a href="/admin/categories" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Categories
              </a>
              <a href="/admin/deals" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Deals
              </a>
              <a href="/admin/promotions" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Promotions
              </a>
              <a href="/admin/heroes" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Heroes
              </a>
              <a href="/admin/settings" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Settings
              </a>
              <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                View Site
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
