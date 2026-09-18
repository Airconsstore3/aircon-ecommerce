require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('URL:', url);
console.log('Key present:', !!key);
console.log('Key prefix:', key?.substring(0, 20));

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function main() {
  const parentId = '01b022ba-fae8-4a33-8ba1-5b7709f30d33';

  // Test the exact query from page.tsx with the publishable key
  console.log('\n=== Test with PUBLISHABLE key ===');
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, btu_range, variant_order')
    .eq('is_published', true)
    .or(`id.eq.${parentId},parent_product_id.eq.${parentId}`)
    .order('variant_order', { ascending: true, nullsFirst: false });
  
  console.log('Result:', data?.length ?? 0, 'rows');
  if (error) console.log('Error:', error.message);
  if (data) console.log(JSON.stringify(data, null, 2));

  // Also test simple query
  console.log('\n=== Simple query: just parent ===');
  const { data: simple, error: simpleErr } = await supabase
    .from('products')
    .select('id, slug, btu_range')
    .eq('id', parentId)
    .eq('is_published', true)
    .single();
  
  console.log('Result:', simple);
  if (simpleErr) console.log('Error:', simpleErr.message);

  // Test: just children
  console.log('\n=== Just children ===');
  const { data: children, error: childErr } = await supabase
    .from('products')
    .select('id, slug, btu_range')
    .eq('parent_product_id', parentId)
    .eq('is_published', true);
  
  console.log('Result:', children?.length ?? 0, 'rows');
  if (childErr) console.log('Error:', childErr.message);
  if (children) console.log(JSON.stringify(children, null, 2));
}

main().catch(console.error);
