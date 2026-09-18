require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function main() {
  const parentId = '01b022ba-fae8-4a33-8ba1-5b7709f30d33';

  // Test 1: The exact query from page.tsx
  console.log('=== Test 1: .eq("is_published", true) + .or() ===');
  const { data: test1, error: err1 } = await supabase
    .from('products')
    .select('id, btu_range, slug')
    .eq('is_published', true)
    .or(`id.eq.${parentId},parent_product_id.eq.${parentId}`)
    .order('variant_order', { ascending: true, nullsFirst: false });
  
  console.log('Result:', test1?.length ?? 0, 'rows');
  if (err1) console.log('Error:', err1.message);
  if (test1) console.log(JSON.stringify(test1, null, 2));

  // Test 2: Just .or() without .eq("is_published")
  console.log('\n=== Test 2: .or() only (no is_published filter) ===');
  const { data: test2, error: err2 } = await supabase
    .from('products')
    .select('id, btu_range, slug')
    .or(`id.eq.${parentId},parent_product_id.eq.${parentId}`)
    .order('variant_order', { ascending: true, nullsFirst: false });
  
  console.log('Result:', test2?.length ?? 0, 'rows');
  if (err2) console.log('Error:', err2.message);
  if (test2) console.log(JSON.stringify(test2, null, 2));

  // Test 3: Two separate queries combined
  console.log('\n=== Test 3: Separate queries ===');
  const { data: parent3 } = await supabase
    .from('products')
    .select('id, btu_range, slug, is_published')
    .eq('id', parentId)
    .eq('is_published', true)
    .single();
  console.log('Parent:', parent3);

  const { data: children3 } = await supabase
    .from('products')
    .select('id, btu_range, slug, is_published')
    .eq('parent_product_id', parentId)
    .eq('is_published', true)
    .order('variant_order', { ascending: true, nullsFirst: false });
  console.log('Children:', children3?.length, children3);

  // Test 4: Use .in() instead of .or()
  console.log('\n=== Test 4: .in("id", [parentId]) + .eq("parent_product_id", parentId) ===');
  const { data: test4, error: err4 } = await supabase
    .from('products')
    .select('id, btu_range, slug')
    .eq('is_published', true)
    .eq('parent_product_id', parentId)
    .order('variant_order', { ascending: true, nullsFirst: false });
  console.log('Result:', test4?.length ?? 0, 'rows');
  if (err4) console.log('Error:', err4.message);
  if (test4) console.log(JSON.stringify(test4, null, 2));
}

main().catch(console.error);
