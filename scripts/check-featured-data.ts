import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFeaturedProducts() {
  console.log("=== FEATURED PRODUCTS DATA ===\n");
  
  // Query featured products
  const { data: featured, error: featuredError } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(12);

  if (featuredError) {
    console.error("Featured query error:", featuredError);
  } else {
    console.log(`Found ${featured?.length || 0} featured products`);
    if (featured && featured.length > 0) {
      featured.forEach((p, i) => {
        console.log(`\n--- Product ${i + 1} ---`);
        console.log(`ID: ${p.id}`);
        console.log(`Name: ${p.name}`);
        console.log(`Brand: ${p.brand}`);
        console.log(`BTU Range: ${p.btu_range}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
        console.log(`Price: R${p.price_zar}`);
        console.log(`Sale Price: ${p.sale_price_zar || 'N/A'}`);
        console.log(`Stock: ${p.stock_count}`);
        console.log(`Sold Out: ${p.is_sold_out}`);
        console.log(`Specs: ${JSON.stringify(p.specs)}`);
      });
    }
  }

  console.log("\n\n=== SAMPLE NON-FEATURED PRODUCT (for comparison) ===\n");
  
  // Query a non-featured product
  const { data: regular, error: regularError } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", false)
    .limit(1);

  if (regularError) {
    console.error("Regular query error:", regularError);
  } else if (regular && regular.length > 0) {
    const p = regular[0];
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name}`);
    console.log(`Brand: ${p.brand}`);
    console.log(`BTU Range: ${p.btu_range}`);
    console.log(`Images: ${JSON.stringify(p.images)}`);
    console.log(`Price: R${p.price_zar}`);
    console.log(`Sale Price: ${p.sale_price_zar || 'N/A'}`);
    console.log(`Stock: ${p.stock_count}`);
    console.log(`Sold Out: ${p.is_sold_out}`);
    console.log(`Specs: ${JSON.stringify(p.specs)}`);
  }
}

checkFeaturedProducts();
