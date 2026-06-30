"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
    applies_to: "all",
    category_id: "",
    product_id: "",
    min_order_zar: "",
    starts_at: "",
    expires_at: "",
    is_active: true,
    max_uses: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("promotions").insert({
        ...formData,
        value: parseInt(formData.value),
        min_order_zar: formData.min_order_zar ? parseInt(formData.min_order_zar) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        category_id: formData.category_id || null,
        product_id: formData.product_id || null,
      });

      if (error) throw error;

      router.push("/admin/promotions");
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Failed to create promotion");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Promotion</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. SPRING20"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed Amount</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Value</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Applies To</label>
          <select
            name="applies_to"
            value={formData.applies_to}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Products</option>
            <option value="category">Specific Category</option>
            <option value="product">Specific Product</option>
          </select>
        </div>

        {formData.applies_to === "category" && (
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select category</option>
            </select>
          </div>
        )}

        {formData.applies_to === "product" && (
          <div>
            <label className="block text-sm font-medium mb-2">Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select product</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Order (ZAR)</label>
          <input
            type="number"
            name="min_order_zar"
            value={formData.min_order_zar}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Starts At</label>
            <input
              type="datetime-local"
              name="starts_at"
              value={formData.starts_at}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expires At</label>
            <input
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Uses</label>
          <input
            type="number"
            name="max_uses"
            value={formData.max_uses}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Promotion"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
