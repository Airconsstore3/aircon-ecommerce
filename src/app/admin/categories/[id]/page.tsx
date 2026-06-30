"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ImageUpload } from "@/components/admin/ImageUpload";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    parent_id: "",
    sort_order: 0,
    is_published: true,
    meta_title: "",
    meta_description: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategory = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          image_url: data.image_url || "",
          parent_id: data.parent_id || "",
          sort_order: data.sort_order,
          is_published: data.is_published,
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
        });
        if (data.image_url) setImages([data.image_url]);
      }
    };
    fetchCategory();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          ...formData,
          image_url: images[0] || null,
          parent_id: formData.parent_id || null,
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/admin/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
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
      <h1 className="text-3xl font-bold mb-6">Edit Category</h1>

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
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          <ImageUpload
            images={images}
            onChange={setImages}
            bucket="product-images"
            folder="categories"
            maxImages={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sort Order</label>
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="is_published" className="text-sm font-medium">
            Published
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Meta Description</label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Category"}
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
