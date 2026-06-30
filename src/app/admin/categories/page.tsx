import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CategoriesPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Categories
        </h1>
        <Link href="/admin/categories/new">
          <Button
            style={{ backgroundColor: "#1C99D6" }}
            className="text-white hover:opacity-90"
          >
            + Add Category
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Name</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Slug</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Status</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Sort Order</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id} className="border-slate-200">
                <TableCell>
                  <div className="flex items-center">
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#0A2540" }}>
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm" style={{ color: "#64748B" }}>
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {category.slug}
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: category.is_published ? "#DCFCE7" : "#FEE2E2",
                      color: category.is_published ? "#22C55E" : "#DC2626",
                    }}
                  >
                    {category.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {category.sort_order}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/categories/${category.id}`}>
                    <Button variant="link" style={{ color: "#1C99D6" }}>
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
