import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default async function DealsPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .order("ends_at", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Deals
        </h1>
        <Link href="/admin/deals/new">
          <Button
            style={{ backgroundColor: "#1C99D6" }}
            className="text-white hover:opacity-90"
          >
            + Add Deal
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Name</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Original Price</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Sale Price</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Ends At</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Stock</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals?.map((deal) => (
              <TableRow key={deal.id} className="border-slate-200">
                <TableCell>
                  <div className="text-sm font-medium" style={{ color: "#0A2540" }}>
                    {deal.name}
                  </div>
                  <div className="text-sm" style={{ color: "#64748B" }}>
                    {deal.slug}
                  </div>
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  R{deal.original_price_zar}
                </TableCell>
                <TableCell className="font-semibold" style={{ color: "#DC2626" }}>
                  R{deal.sale_price_zar}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {new Date(deal.ends_at).toLocaleDateString()}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {deal.stock_remaining}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/deals/${deal.id}`}>
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
