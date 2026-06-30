# Admin Panel Setup Guide

## Step 1: Run Supabase Migrations

Since the Supabase CLI isn't configured, you'll need to run these migrations manually in your Supabase dashboard:

### 1. Add SEO Fields to Products Table
Go to your Supabase dashboard → SQL Editor → New Query:

```sql
-- Add SEO fields to products table
ALTER TABLE products 
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;

-- Add index for SEO fields if needed
CREATE INDEX idx_products_meta_title ON products(meta_title) WHERE meta_title IS NOT NULL;
```

### 2. Create Page Heroes Table
Go to your Supabase dashboard → SQL Editor → New Query:

```sql
-- Create page_heroes table for hero/content management
CREATE TABLE page_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL UNIQUE,
  heading TEXT NOT NULL,
  subheading TEXT,
  image_url TEXT,
  button_label TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_page_heroes_page_key ON page_heroes(page_key);
CREATE INDEX idx_page_heroes_is_active ON page_heroes(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE page_heroes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read only - admin writes use service role which bypasses RLS)
CREATE POLICY "Public read active page heroes"
ON page_heroes FOR SELECT
USING (is_active = true);

-- Auto-update trigger for updated_at
CREATE TRIGGER page_heroes_updated_at
  BEFORE UPDATE ON page_heroes
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

## Step 2: Create Product Images Bucket

### 1. Go to Supabase Dashboard → Storage
### 2. Create a new bucket named `product-images`
### 3. Set up policies:

**Public Read Policy:**
```sql
-- Allow public read access to product-images bucket
CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

**Service Role Write Policy:**
```sql
-- Allow service role to write to product-images bucket
CREATE POLICY "Service role write product-images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role update product-images"
ON storage.objects FOR UPDATE
TO service_role
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role delete product-images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'product-images');
```

## Step 3: Test Admin Panel

### 1. Start your dev server:
```bash
cd C:\Users\user\aircon-ecommerce
pnpm dev
```

### 2. Access admin panel:
- Go to `http://localhost:3000/admin/login`
- Sign in with your Supabase credentials
- Navigate to `/admin/dashboard`

### 3. Test CRUD operations:
- Create a test category
- Create a test product with image upload
- Edit the product
- Delete the test data

## Important Notes

- Your environment variables are already configured in `.env.local`
- The middleware protects all `/admin/*` routes
- Only authenticated Supabase users can access the admin panel
- Make sure your Supabase RLS policies are properly configured
