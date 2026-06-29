import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(sql: string, name: string) {
  console.log(`Running migration: ${name}`);
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`Error in ${name}:`, error);
      throw error;
    }
    console.log(`✓ ${name} completed`);
  } catch (err) {
    console.error(`Failed to run ${name}:`, err);
    throw err;
  }
}

async function main() {
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

  console.log('All migrations completed successfully');
}

main().catch(console.error);
