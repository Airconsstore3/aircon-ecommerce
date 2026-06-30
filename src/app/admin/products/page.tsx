import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Products
        </h1>
        <Link href="/admin/products/new">
          <Button
            style={{ backgroundColor: "#1C99D6" }}
            className="text-white hover:opacity-90"
          >
            + Add Product
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Name</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Category</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Price</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Stock</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Status</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product: any) => (
              <TableRow key={product.id} className="border-slate-200">
                <TableCell>
                  <div className="flex items-center">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#0A2540" }}>
                        {product.name}
                      </div>
                      <div className="text-sm" style={{ color: "#64748B" }}>
                        {product.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {product.categories?.name}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  R{product.price_zar}
                  {product.sale_price_zar && (
                    <span className="ml-2" style={{ color: "#DC2626" }}>
                      R{product.sale_price_zar}
                    </span>
                  )}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {product.stock_count}
                  {product.stock_count === 0 && (
                    <Badge className="ml-2" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                      Sold Out
                    </Badge>
                  )}
                  {product.stock_count <= product.low_stock_threshold && product.stock_count > 0 && (
                    <Badge className="ml-2" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                      Low Stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.is_published && (
                      <Badge style={{ backgroundColor: "#DCFCE7", color: "#22C55E" }}>
                        Published
                      </Badge>
                    )}
                    {product.is_featured && (
                      <Badge style={{ backgroundColor: "#DBEAFE", color: "#1C99D6" }}>
                        Featured
                      </Badge>
                    )}
                    {product.is_sale && (
                      <Badge style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                        Sale
                      </Badge>
                    )}
                    {product.is_deal && (
                      <Badge style={{ backgroundColor: "#E9D5FF", color: "#8B5CF6" }}>
                        Deal
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/products/${product.id}`}>
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
