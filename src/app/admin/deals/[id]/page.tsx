"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ImageUpload } from "@/components/admin/ImageUpload";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    original_price_zar: "",
    sale_price_zar: "",
    ends_at: "",
    deal_type: "residential",
    stock_remaining: 0,
    is_hero: false,
    product_id: "",
    includes: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchDeal = async () => {
      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          original_price_zar: data.original_price_zar.toString(),
          sale_price_zar: data.sale_price_zar.toString(),
          ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 16) : "",
          deal_type: data.deal_type,
          stock_remaining: data.stock_remaining,
          is_hero: data.is_hero,
          product_id: data.product_id || "",
          includes: data.includes ? data.includes.join(", ") : "",
        });
        if (data.images) setImages(data.images);
      }
    };
    fetchDeal();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("deals")
        .update({
          ...formData,
          original_price_zar: parseInt(formData.original_price_zar),
          sale_price_zar: parseInt(formData.sale_price_zar),
          ends_at: new Date(formData.ends_at).toISOString(),
          stock_remaining: parseInt(formData.stock_remaining.toString()),
          product_id: formData.product_id || null,
          images,
          includes: formData.includes ? formData.includes.split(",").map((s: string) => s.trim()) : [],
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/admin/deals");
    } catch (error) {
      console.error("Error updating deal:", error);
      alert("Failed to update deal");
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
      <h1 className="text-3xl font-bold mb-6">Edit Deal</h1>

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
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Original Price (ZAR)</label>
            <input
              type="number"
              name="original_price_zar"
              value={formData.original_price_zar}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sale Price (ZAR)</label>
            <input
              type="number"
              name="sale_price_zar"
              value={formData.sale_price_zar}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ends At</label>
          <input
            type="datetime-local"
            name="ends_at"
            value={formData.ends_at}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deal Type</label>
          <select
            name="deal_type"
            value={formData.deal_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="bundle">Bundle</option>
            <option value="clearance">Clearance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stock Remaining</label>
          <input
            type="number"
            name="stock_remaining"
            value={formData.stock_remaining}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <ImageUpload
            images={images}
            onChange={setImages}
            bucket="product-images"
            folder="deals"
            maxImages={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Includes (comma-separated)</label>
          <textarea
            name="includes"
            value={formData.includes}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Aircon unit, Installation kit, Remote control"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_hero"
            id="is_hero"
            checked={formData.is_hero}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="is_hero" className="text-sm font-medium">
            Show on Hero Section
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Deal"}
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
