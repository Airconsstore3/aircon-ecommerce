import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function PromotionsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Promotions
        </h1>
        <Link href="/admin/promotions/new">
          <Button
            style={{ backgroundColor: "#1C99D6" }}
            className="text-white hover:opacity-90"
          >
            + Add Promotion
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Name</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Code</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Type</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Value</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Status</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions?.map((promo) => (
              <TableRow key={promo.id} className="border-slate-200">
                <TableCell className="font-medium" style={{ color: "#0A2540" }}>
                  {promo.name}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {promo.code || "-"}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {promo.type}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {promo.type === "percentage" ? `${promo.value}%` : `R${promo.value}`}
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: promo.is_active ? "#DCFCE7" : "#FEE2E2",
                      color: promo.is_active ? "#22C55E" : "#DC2626",
                    }}
                  >
                    {promo.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/promotions/${promo.id}`}>
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
