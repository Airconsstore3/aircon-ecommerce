import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local', quiet: true });
const apply = process.argv.includes('--apply');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing Supabase environment variables');
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const catalogue = [
  { name: 'Outdoor Unit Bracket Set — 450mm', slug: 'outdoor-unit-bracket-set-450mm', price_zar: 950, kind: 'brackets', specs: { size: '450mm' }, description: 'Wall-mount bracket set for an outdoor aircon unit. Confirm mounting dimensions and load requirements before ordering.' },
  { name: 'Outdoor Unit Bracket Set — 550mm', slug: 'outdoor-unit-bracket-set-550mm', price_zar: 1050, kind: 'brackets', specs: { size: '550mm' }, description: '550mm outdoor-unit mounting brackets. Confirm the correct bracket size and wall fixings with your installer.' },
  { name: 'Outdoor Unit Bracket Set — 650mm', slug: 'outdoor-unit-bracket-set-650mm', price_zar: 1150, kind: 'brackets', specs: { size: '650mm' }, description: '650mm outdoor-unit mounting brackets. Unit weight, mounting dimensions and wall suitability must be checked.' },
  { name: '3m Aluminium Aircon Installation Kit', slug: '3m-aluminium-aircon-installation-kit', price_zar: 1200, kind: 'installation-kits', specs: { length: '3m', material: 'Aluminium' }, description: 'Aluminium pipe installation kit for a split aircon. Pipe diameter, unit compatibility and included fittings confirmed on enquiry.' },
  { name: '5m Aluminium Aircon Installation Kit', slug: '5m-aluminium-aircon-installation-kit', price_zar: 1599, kind: 'installation-kits', specs: { length: '5m', material: 'Aluminium' }, description: 'Aluminium pipe kit for a longer installation run. Confirm pipe diameter and the required fittings with your installer.' },
  { name: '3m Copper Aircon Installation Kit', slug: '3m-copper-aircon-installation-kit', price_zar: 1999, kind: 'installation-kits', specs: { length: '3m', material: 'Copper' }, description: 'Copper pipe installation kit for a split aircon. Pipe diameter, unit compatibility and included fittings confirmed on enquiry.' },
  { name: '5m Copper Aircon Installation Kit', slug: '5m-copper-aircon-installation-kit', price_zar: 2399, kind: 'installation-kits', specs: { length: '5m', material: 'Copper' }, description: 'Copper pipe kit for a longer installation run. Confirm pipe diameter and the required fittings with your installer.' },
  { name: 'Comfee Wi-Fi Module', slug: 'comfee-wifi-module', brand: 'Comfee', price_zar: 799, kind: 'wifi-modules', specs: {}, description: 'Wi-Fi control module for compatible Comfee aircons. Share your indoor-unit model so we can confirm compatibility.' },
  { name: 'Alliance Wi-Fi Module', slug: 'alliance-wifi-module', brand: 'Alliance', price_zar: 1049, kind: 'wifi-modules', specs: {}, description: 'Wi-Fi control module for compatible Alliance aircons. Share your indoor-unit model so we can confirm compatibility.' },
  { name: 'Universal Aircon Remote', slug: 'universal-aircon-remote', price_zar: 350, kind: 'remotes', specs: {}, description: 'Replacement aircon remote. Brand and model compatibility must be confirmed; not compatible with every air conditioner.' },
];

const { data: existing, error: readError } = await supabase.from('products').select('slug').in('slug', catalogue.map((p) => p.slug));
if (readError) throw new Error(readError.message);
const missing = catalogue.filter((p) => !existing.some((row) => row.slug === p.slug));
console.table(missing.map(({ name, price_zar }) => ({ name, price_zar })));
if (!apply) {
  console.log(`Dry run: ${missing.length} new published accessories. Run with --apply to insert; existing rows are never overwritten.`);
} else if (missing.length) {
  const { data: categories, error: categoryReadError } = await supabase.from('categories').select('id').eq('slug', 'accessories');
  if (categoryReadError) throw new Error(categoryReadError.message);
  let categoryId = categories[0]?.id;
  if (!categoryId) {
    const { data, error } = await supabase.from('categories').insert({ name: 'Aircon Accessories', slug: 'accessories', description: 'Brackets, aircon installation kits, Wi-Fi modules and remotes.', is_published: true, sort_order: 5, image_url: '/accessory-placeholder.svg' }).select('id').single();
    if (error) throw new Error(error.message);
    categoryId = data.id;
  }
  const rows = missing.map(({ kind, specs, ...product }) => ({
    ...product,
    display_name: product.name,
    category_id: categoryId,
    type: 'accessory',
    brand: product.brand ?? null,
    is_published: true,
    is_parent_product: true,
    is_enquiry_only: false,
    is_featured: false,
    images: ['/accessory-placeholder.svg'],
    sale_price_zar: null,
    stock_count: 0,
    is_sold_out: true,
    low_stock_threshold: 3,
    sort_order: catalogue.findIndex((p) => p.slug === product.slug),
    specs: { ...specs, accessory_kind: kind, pricing_basis: 'Owner-approved competitor ballpark; confirm before fulfilment', compatibility: 'Confirm model and installation requirements before ordering' },
  }));
  const { data, error } = await supabase.from('products').insert(rows).select('id, name, price_zar, is_published');
  if (error) throw new Error(error.message);
  console.table(data);
  console.log(`Published ${data.length} accessories. No existing products were changed.`);
} else {
  console.log('All starter accessories already exist; no changes made.');
}
