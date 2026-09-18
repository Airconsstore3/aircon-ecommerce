require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing env vars. URL:', !!url, 'KEY:', !!key);
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  // Step 1: Fetch the parent product (Samsung AR4500 9000 BTU)
  const { data: parent, error: parentErr } = await supabase
    .from('products')
    .select('id, name, display_name, is_parent_product, parent_product_id, btu_range, variant_attributes, slug')
    .eq('slug', 'samsung-ar09bshgawk-fa')
    .single();

  if (parentErr) {
    console.error('Error fetching parent:', parentErr.message);
    return;
  }

  console.log('=== Step 1: Current Product ===');
  console.log('id:', parent.id);
  console.log('name:', parent.name);
  console.log('display_name:', parent.display_name);
  console.log('is_parent_product:', parent.is_parent_product);
  console.log('parent_product_id:', parent.parent_product_id);
  console.log('btu_range:', parent.btu_range);
  console.log('variant_attributes:', JSON.stringify(parent.variant_attributes));
  console.log();

  // Step 2: Determine parent
  const parentId = parent.parent_product_id || parent.id;
  console.log('=== Step 2: Parent ID ===');
  console.log('parent:', parentId);
  console.log();

  // Step 3: Run the exact query used by the product page
  const { data: variants, error: variantErr } = await supabase
    .from('products')
    .select('id, display_name, btu_range, variant_attributes, variant_order, is_parent_product, parent_product_id, slug, is_published')
    .eq('is_published', true)
    .or(`id.eq.${parentId},parent_product_id.eq.${parentId}`)
    .order('variant_order', { ascending: true, nullsFirst: false });

  if (variantErr) {
    console.error('Error fetching variants:', variantErr.message);
    return;
  }

  console.log('=== Step 3: Variants Found ===');
  console.log('Total variants found:', variants.length);
  variants.forEach(v => {
    console.log(`  ${v.btu_range?.toLocaleString()} BTU | id=${v.id} | is_parent=${v.is_parent_product} | parent_id=${v.parent_product_id} | published=${v.is_published}`);
  });
  console.log();

  // Step 4: Also check without is_published filter
  const { data: allVariants } = await supabase
    .from('products')
    .select('id, display_name, btu_range, is_parent_product, parent_product_id, is_published, slug')
    .or(`id.eq.${parentId},parent_product_id.eq.${parentId}`)
    .order('btu_range', { ascending: true });

  console.log('=== Step 4: All variants (no is_published filter) ===');
  console.log('Total:', allVariants.length);
  allVariants.forEach(v => {
    console.log(`  ${v.btu_range?.toLocaleString()} BTU | published=${v.is_published} | is_parent=${v.is_parent_product} | parent_id=${v.parent_product_id}`);
  });
  console.log();

  // Step 5: Check BTU values
  const btus = variants.map(v => v.btu_range).filter(Boolean).sort((a, b) => a - b);
  const uniqueBtus = [...new Set(btus)];
  console.log('=== Step 5: BTU Analysis ===');
  console.log('All BTUs:', btus);
  console.log('Unique BTUs:', uniqueBtus);
  console.log('Count:', uniqueBtus.length);
  console.log();

  // Step 6: Simulate what the frontend would show
  console.log('=== Step 6: Frontend Simulation ===');
  console.log('variants.length:', variants.length);
  console.log('uniqueBtus.length:', uniqueBtus.length);
  if (uniqueBtus.length === 1) {
    console.log('UI would show: "Only available in', uniqueBtus[0].toLocaleString(), 'BTU."');
  } else if (uniqueBtus.length > 1) {
    console.log('UI would show: "Available Sizes" with buttons:', uniqueBtus.map(b => `${b.toLocaleString()} BTU`).join(', '));
    console.log('UI would show: "Available in', uniqueBtus.length, 'sizes."');
  } else {
    console.log('UI would show: nothing (no BTUs found)');
  }
}

main().catch(console.error);
