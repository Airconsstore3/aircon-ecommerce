require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { mockCategories, mockProducts, mockDeals, mockPromotions } = require('../src/lib/mock-data.ts');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping tables: old ID/slug → new UUID
const categoryMap = new Map(); // old id → new UUID
const productMap = new Map(); // old id → new UUID

async function seedCategories() {
  console.log('\n📦 Seeding categories...');
  
  for (const category of mockCategories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        parent_id: null, // No parent categories in mock data
        sort_order: category.sort_order,
        is_published: category.is_published,
        meta_title: category.meta_title,
        meta_description: category.meta_description,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`✗ Failed to insert category ${category.slug}:`, error);
      throw error;
    }

    // Map old ID to new UUID
    categoryMap.set(category.id, data.id);
    console.log(`  ✓ ${category.name} → ${data.id}`);
  }

  console.log(`✓ Inserted ${mockCategories.length} categories`);
}

async function seedProducts() {
  console.log('\n📦 Seeding products...');
  
  for (const product of mockProducts) {
    // Map old category_id to new UUID
    const newCategoryId = categoryMap.get(product.category_id);
    if (!newCategoryId) {
      throw new Error(`Category mapping not found for ${product.category_id}`);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: newCategoryId,
        type: product.type,
        brand: product.brand,
        btu_range: product.btu_range,
        images: product.images,
        price_zar: product.price_zar,
        sale_price_zar: product.sale_price_zar,
        is_published: product.is_published,
        is_enquiry_only: product.is_enquiry_only,
        is_featured: product.is_featured,
        is_sale: product.is_sale,
        is_deal: product.is_deal,
        sort_order: product.sort_order,
        specs: product.specs,
        documents: product.documents,
        stock_count: product.stock_count,
        is_sold_out: product.is_sold_out,
        low_stock_threshold: product.low_stock_threshold,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`✗ Failed to insert product ${product.slug}:`, error);
      throw error;
    }

    // Map old ID to new UUID
    productMap.set(product.id, data.id);
    console.log(`  ✓ ${product.name} → ${data.id}`);
  }

  console.log(`✓ Inserted ${mockProducts.length} products`);
}

async function seedDeals() {
  console.log('\n📦 Seeding deals...');
  
  const now = new Date();
  
  for (const deal of mockDeals) {
    // Map old product_id to new UUID (if exists)
    const newProductId = deal.product_id ? productMap.get(deal.product_id) : null;

    // Calculate future end date based on current date
    const originalEndsAt = new Date(deal.ends_at);
    const monthsFromNow = originalEndsAt.getMonth() - 5; // Original was Aug 2025, so calculate offset
    const futureEndsAt = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, now.getDate());

    const { error } = await supabase
      .from('deals')
      .insert({
        name: deal.name,
        slug: deal.slug,
        description: deal.description,
        original_price_zar: deal.original_price_zar,
        sale_price_zar: deal.sale_price_zar,
        ends_at: futureEndsAt.toISOString(),
        deal_type: deal.deal_type,
        stock_remaining: deal.stock_remaining,
        is_hero: deal.is_hero,
        product_id: newProductId,
        images: deal.images,
        includes: deal.includes || [],
      });

    if (error) {
      console.error(`✗ Failed to insert deal ${deal.slug}:`, error);
      throw error;
    }

    console.log(`  ✓ ${deal.name} (ends: ${futureEndsAt.toISOString()})`);
  }

  console.log(`✓ Inserted ${mockDeals.length} deals`);
}

async function seedPromotions() {
  console.log('\n📦 Seeding promotions...');
  
  for (const promotion of mockPromotions) {
    // Map old category_id/product_id to new UUID (if exists)
    const newCategoryId = promotion.category_id ? categoryMap.get(promotion.category_id) : null;
    const newProductId = promotion.product_id ? productMap.get(promotion.product_id) : null;

    const { error } = await supabase
      .from('promotions')
      .insert({
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        applies_to: promotion.applies_to,
        category_id: newCategoryId,
        product_id: newProductId,
        min_order_zar: promotion.min_order_zar,
        starts_at: promotion.starts_at,
        expires_at: promotion.expires_at,
        is_active: promotion.is_active,
        max_uses: promotion.max_uses,
        current_uses: promotion.current_uses,
      });

    if (error) {
      console.error(`✗ Failed to insert promotion ${promotion.code || promotion.name}:`, error);
      throw error;
    }

    console.log(`  ✓ ${promotion.name}`);
  }

  console.log(`✓ Inserted ${mockPromotions.length} promotions`);
}

async function main() {
  console.log('🌱 Starting Supabase seed...');
  console.log('Target:', supabaseUrl);

  try {
    await seedCategories();
    await seedProducts();
    await seedDeals();
    await seedPromotions();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  Categories: ${mockCategories.length}`);
    console.log(`  Products: ${mockProducts.length}`);
    console.log(`  Deals: ${mockDeals.length}`);
    console.log(`  Promotions: ${mockPromotions.length}`);
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
