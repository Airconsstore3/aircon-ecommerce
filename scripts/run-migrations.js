require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(sql, name) {
  console.log(`\nRunning migration: ${name}`);
  console.log('─'.repeat(50));
  
  try {
    // Use the Supabase SQL API via POST to /sql endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'params=single',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`✗ Failed: ${error}`);
      throw new Error(`Migration failed: ${error}`);
    }

    const result = await response.json();
    console.log(`✓ ${name} completed successfully`);
    return true;
  } catch (err) {
    console.error(`✗ Error running ${name}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('Starting Supabase migrations...');
  console.log('Target:', supabaseUrl);

  const migrations = [
    '20250629_create_categories_table.sql',
    '20250629_create_products_table.sql',
    '20250629_create_deals_table.sql',
    '20250629_create_promotions_table.sql',
  ];

  for (const migration of migrations) {
    const sql = readFileSync(join(__dirname, '../supabase/migrations', migration), 'utf-8');
    await runMigration(sql, migration);
  }

  console.log('\n' + '='.repeat(50));
  console.log('All migrations completed successfully!');
  console.log('='.repeat(50));
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
