import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
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

// Explicit override: keep DB as-is, do not overwrite.
const SKIP_IDS = new Set<string>([
  "2a312796-6b2c-4356-b26d-87c2df9ef2ae", // LG Under Ceiling - Inverter 48 000 BTU
  "618eacee-1af7-4710-aa11-d2cd1082130e", // LG Under Ceiling - Inverter 60 000 BTU
  "9004c201-78ba-4f92-a1a2-2233348714f0", // Samsung 9000BTU Inverter Split Wall Unit
]);

const SKIP_REASONS: Record<string, string> = {
  "2a312796-6b2c-4356-b26d-87c2df9ef2ae":
    "LG Under Ceiling - Inverter 48 000 BTU: DB already holds the correct 'LG Under Ceiling - Inverter.webp' image; LG_MODEL_IMAGES .find() keyword-order bug in the (soon-to-be-retired) hardcoded table resolves incorrectly for this name. Keeping DB value.",
  "618eacee-1af7-4710-aa11-d2cd1082130e":
    "LG Under Ceiling - Inverter 60 000 BTU: same reason as above.",
  "9004c201-78ba-4f92-a1a2-2233348714f0":
    "Samsung 9000BTU Inverter Split Wall Unit: original Featured Products homepage card. Current DB value is the curated 'Featured In section' hero image, which is the intended homepage look. Keeping DB value instead of the generic hardcoded AR80 set.",
};

// Apply hardcoded value normally, but flag for manual visual review afterward.
const NEEDS_REVIEW_IDS = new Set<string>([
  "712b7ad2-a3b7-49b6-9986-af05102a2462", // Daikin 24000BTU Commercial Ducted System
]);

const NEEDS_REVIEW_REASONS: Record<string, string> = {
  "712b7ad2-a3b7-49b6-9986-af05102a2462":
    "Daikin 24000BTU Commercial Ducted System: DB previously held 'Daikin Emura.png' (a completely different product line than the name implies). Hardcoded value ('Daikin Sky Air R407C Ducted Split Non-Inverter...webp', 'Daikin Multi Split Outdoor Unit.webp') has been applied, but neither the old nor new value has been visually verified against the real product. Needs manual confirmation.",
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

type UpdateResult = {
  id: string;
  name: string | null;
  oldValue: string[];
  newValue: string[];
  success: boolean;
  error?: string;
};

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

  const toUpdate: Array<{ row: Row; resolved: string[] }> = [];

  for (const row of rows) {
    const currentImages: string[] = Array.isArray(row.images) ? row.images : [];
    const resolvedImages: string[] = getProductImages({
      name: row.name ?? undefined,
      brand: row.brand,
      images: row.images,
    });

    if (resolvedImages.length === 0) {
      // unresolved -> out of scope, skip entirely
      continue;
    }

    if (SKIP_IDS.has(row.id)) {
      continue;
    }

    let status: "match" | "db_empty" | "conflict";
    if (currentImages.length === 0) {
      status = "db_empty";
    } else if (arraysEqual(currentImages, resolvedImages)) {
      status = "match";
    } else {
      status = "conflict";
    }

    if (status === "match") {
      continue; // no-op
    }

    toUpdate.push({ row, resolved: resolvedImages });
  }

  console.log(`\nRows to update (db_empty + conflict, minus skips): ${toUpdate.length}`);

  const results: UpdateResult[] = [];

  for (const { row, resolved } of toUpdate) {
    const oldValue = Array.isArray(row.images) ? row.images : [];

    const { error: updateError } = await supabase
      .from("products")
      .update({ images: resolved })
      .eq("id", row.id);

    const result: UpdateResult = {
      id: row.id,
      name: row.name,
      oldValue,
      newValue: resolved,
      success: !updateError,
      error: updateError?.message,
    };

    results.push(result);

    if (result.success) {
      console.log(
        `[OK] ${row.id} | ${row.name} | old: ${JSON.stringify(oldValue)} -> new: ${JSON.stringify(resolved)}`
      );
    } else {
      console.log(`[FAIL] ${row.id} | ${row.name} | error: ${result.error}`);
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log("\n=== SKIPPED (DB kept) ===");
  for (const id of SKIP_IDS) {
    console.log(`\nid: ${id}`);
    console.log(`reason: ${SKIP_REASONS[id]}`);
  }

  console.log("\n=== NEEDS VISUAL REVIEW ===");
  for (const id of NEEDS_REVIEW_IDS) {
    const applied = results.find((r) => r.id === id);
    console.log(`\nid: ${id}`);
    console.log(`reason: ${NEEDS_REVIEW_REASONS[id]}`);
    if (applied) {
      console.log(`applied: ${applied.success ? "yes" : "FAILED - " + applied.error}`);
      console.log(`new value: ${JSON.stringify(applied.newValue)}`);
    } else {
      console.log("applied: NOT FOUND IN UPDATE LIST (unexpected)");
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Total attempted: ${results.length}`);
  console.log(`Total succeeded: ${succeeded}`);
  console.log(`Total failed:    ${failed}`);

  if (failed > 0) {
    console.log("\n=== FAILURES (verbatim) ===");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`\nid: ${r.id}`);
        console.log(`name: ${r.name}`);
        console.log(`error: ${r.error}`);
      });
  }
}

main();
