import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { getProductImages } from "../src/lib/product-images";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type Row = {
  id: string;
  name: string | null;
  brand: string | null;
  images: string[] | null;
};

type Status = "match" | "db_empty" | "conflict" | "unresolved";

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function main() {
  console.log("Fetching all products (id, name, brand, images) via service role key...");

  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, images")
    .order("name", { ascending: true });

  if (error) {
    console.error("Query error:", error);
    process.exit(1);
  }

  const rows = (data ?? []) as Row[];
  console.log(`Fetched ${rows.length} products.`);

  const counts: Record<Status, number> = {
    match: 0,
    db_empty: 0,
    conflict: 0,
    unresolved: 0,
  };

  const csvLines: string[] = [
    ["id", "name", "brand", "current_db_images", "resolved_hardcoded_images", "status"].join(","),
  ];

  const detailRows: Array<{ status: Status; row: Row; resolved: string[] }> = [];

  for (const row of rows) {
    const currentImages: string[] = Array.isArray(row.images) ? row.images : [];
    const resolvedImages: string[] = getProductImages({
      name: row.name ?? undefined,
      brand: row.brand,
      images: row.images,
    });

    let status: Status;

    if (resolvedImages.length === 0) {
      status = "unresolved";
    } else if (currentImages.length === 0) {
      status = "db_empty";
    } else if (arraysEqual(currentImages, resolvedImages)) {
      status = "match";
    } else {
      status = "conflict";
    }

    counts[status]++;
    detailRows.push({ status, row, resolved: resolvedImages });

    csvLines.push(
      [
        csvEscape(row.id),
        csvEscape(row.name ?? ""),
        csvEscape(row.brand ?? ""),
        csvEscape(JSON.stringify(currentImages)),
        csvEscape(JSON.stringify(resolvedImages)),
        csvEscape(status),
      ].join(",")
    );
  }

  const outputDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "image-migration-report.csv");
  fs.writeFileSync(outputPath, csvLines.join("\n"), "utf-8");

  console.log("\n=== SUMMARY ===");
  console.log(`Total products: ${rows.length}`);
  console.log(`match:      ${counts.match}`);
  console.log(`db_empty:   ${counts.db_empty}`);
  console.log(`conflict:   ${counts.conflict}`);
  console.log(`unresolved: ${counts.unresolved}`);
  console.log(`\nCSV written to: ${outputPath}`);

  const conflicts = detailRows.filter((d) => d.status === "conflict");
  const unresolved = detailRows.filter((d) => d.status === "unresolved");

  if (conflicts.length > 0) {
    console.log("\n=== CONFLICT ROWS ===");
    conflicts.forEach(({ row, resolved }) => {
      console.log(`\nid: ${row.id}`);
      console.log(`name: ${row.name}`);
      console.log(`brand: ${row.brand}`);
      console.log(`current_db_images: ${JSON.stringify(row.images)}`);
      console.log(`resolved_hardcoded_images: ${JSON.stringify(resolved)}`);
    });
  }

  if (unresolved.length > 0) {
    console.log("\n=== UNRESOLVED ROWS ===");
    unresolved.forEach(({ row }) => {
      console.log(`\nid: ${row.id}`);
      console.log(`name: ${row.name}`);
      console.log(`brand: ${row.brand}`);
      console.log(`current_db_images: ${JSON.stringify(row.images)}`);
    });
  }
}

main();
