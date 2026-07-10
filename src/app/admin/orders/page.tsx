import { cookies } from "next/headers";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminOrdersPage() {
  const supabase = createClient(await cookies());
  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, name, phone, email, total_zar, channel, status")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>Orders</h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Reference</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Customer</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Channel</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Total</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Status</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id} className="border-slate-200">
                <TableCell className="font-mono text-xs" style={{ color: "#64748B" }}>{order.id}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium" style={{ color: "#0A2540" }}>{order.name}</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>{order.phone}{order.email ? ` · ${order.email}` : ""}</div>
                </TableCell>
                <TableCell className="capitalize" style={{ color: "#64748B" }}>{order.channel}</TableCell>
                <TableCell style={{ color: "#64748B" }}>{formatPrice(order.total_zar)}</TableCell>
                <TableCell>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" style={{ color: "#1C99D6" }} asChild>
                    <Link href={`/order-confirmed/${order.id}`}>View slip</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
