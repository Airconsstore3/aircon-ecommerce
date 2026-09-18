import { cookies } from "next/headers";

import { OrderHistory, type Order } from "@/components/account/OrderHistory";
import { createClient } from "@/utils/supabase/server";

type OrderItemRow = {
  product_name_snapshot: string;
  quantity: number;
  base_unit_price_zar: number;
  has_installation: boolean;
  installation_price_zar: number;
  kit_price_zar: number;
  maintenance_price_zar: number;
  warranty_price_zar: number;
};

type OrderRow = {
  id: string;
  order_number: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  payment_status: string;
  total_zar: number;
  order_items: OrderItemRow[];
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

function mapStatus(row: OrderRow): Order["status"] {
  if (row.status === "completed") return "completed";
  if (row.status === "cancelled") return "cancelled";
  if (row.payment_status === "paid") return "paid";
  if (row.status === "sent_whatsapp" || row.status === "email_sent")
    return "confirmed";
  return "enquiry";
}

function mapOrder(row: OrderRow): Order {
  const items = (row.order_items || []).flatMap((item) => {
    const rows: Order["items"] = [
      {
        name:
          item.quantity > 1
            ? `${item.quantity} × ${item.product_name_snapshot}`
            : item.product_name_snapshot,
        price: item.base_unit_price_zar * item.quantity,
        itemType: "unit",
      },
    ];
    if (item.has_installation && item.installation_price_zar > 0) {
      rows.push({
        name: "Installation",
        price: item.installation_price_zar * item.quantity,
        itemType: "installation",
      });
    }
    if (item.kit_price_zar > 0) {
      rows.push({
        name: "Installation Kit",
        price: item.kit_price_zar * item.quantity,
        itemType: "kit",
      });
    }
    if (item.maintenance_price_zar > 0) {
      rows.push({
        name: "Maintenance Plan",
        price: item.maintenance_price_zar * item.quantity,
        itemType: "service",
      });
    }
    if (item.warranty_price_zar > 0) {
      rows.push({
        name: "Extended Warranty",
        price: item.warranty_price_zar * item.quantity,
        itemType: "service",
      });
    }
    return rows;
  });

  const status = mapStatus(row);

  return {
    id: row.id,
    orderNumber: row.order_number ?? `ORD-${row.id.slice(0, 8).toUpperCase()}`,
    orderDate: formatDate(row.created_at),
    orderType: (row.order_items || []).some((i) => i.has_installation)
      ? "installation"
      : "delivery",
    status,
    total: row.total_zar,
    items,
    completionDate: status === "completed" ? formatDate(row.updated_at) : undefined,
  };
}

export default async function OrdersPage() {
  const supabase = createClient(await cookies());

  // RLS limits this to orders matching the signed-in user's email —
  // no client-supplied filter is involved.
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, updated_at, status, payment_status, total_zar, order_items(product_name_snapshot, quantity, base_unit_price_zar, has_installation, installation_price_zar, kit_price_zar, maintenance_price_zar, warranty_price_zar)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[account] Failed to load orders:", error);
  }

  const orders = ((data as OrderRow[] | null) ?? []).map(mapOrder);

  return <OrderHistory orders={orders} />;
}
