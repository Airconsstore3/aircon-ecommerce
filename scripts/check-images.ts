import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.log("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:", supabaseKey ? "SET" : "NOT SET");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  // Query Samsung product (working)
  const { data: samsung, error: samsungError } = await supabase
    .from("products")
    .select("id, name, brand, images")
    .ilike("name", "%Samsung%")
    .eq("is_published", true)
    .limit(1);

  if (samsungError) {
    console.error("Samsung query error:", samsungError);
  } else {
    console.log("=== SAMSUNG PRODUCT (working) ===");
    console.log(JSON.stringify(samsung, null, 2));
  }

  // Query Daikin product (broken)
  const { data: daikin, error: daikinError } = await supabase
    .from("products")
    .select("id, name, brand, images")
    .ilike("name", "%Daikin%")
    .eq("is_published", true)
    .limit(1);

  if (daikinError) {
    console.error("Daikin query error:", daikinError);
  } else {
    console.log("\n=== DAIKIN PRODUCT (broken) ===");
    console.log(JSON.stringify(daikin, null, 2));
  }

  // Query LG product (working)
  const { data: lg, error: lgError } = await supabase
    .from("products")
    .select("id, name, brand, images")
    .ilike("name", "%LG%")
    .eq("is_published", true)
    .limit(1);

  if (lgError) {
    console.error("LG query error:", lgError);
  } else {
    console.log("\n=== LG PRODUCT (working) ===");
    console.log(JSON.stringify(lg, null, 2));
  }
}

checkImages();
