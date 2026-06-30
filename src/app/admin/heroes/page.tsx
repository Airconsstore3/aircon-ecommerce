import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HeroesPage() {
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const supabase = createClient(cookieStore);

  const { data: heroes } = await supabase
    .from("page_heroes")
    .select("*")
    .order("page_key", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: "#0A2540" }}>
          Page Heroes
        </h1>
        <Link href="/admin/heroes/new">
          <Button
            style={{ backgroundColor: "#1C99D6" }}
            className="text-white hover:opacity-90"
          >
            + Add Hero
          </Button>
        </Link>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200">
              <TableHead style={{ color: "#0A2540" }}>Page Key</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Heading</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Subheading</TableHead>
              <TableHead style={{ color: "#0A2540" }}>Status</TableHead>
              <TableHead className="text-right" style={{ color: "#0A2540" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {heroes?.map((hero) => (
              <TableRow key={hero.id} className="border-slate-200">
                <TableCell className="font-medium" style={{ color: "#0A2540" }}>
                  {hero.page_key}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {hero.heading}
                </TableCell>
                <TableCell style={{ color: "#64748B" }}>
                  {hero.subheading?.substring(0, 50)}...
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: hero.is_active ? "#DCFCE7" : "#FEE2E2",
                      color: hero.is_active ? "#22C55E" : "#DC2626",
                    }}
                  >
                    {hero.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/heroes/${hero.id}`}>
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
